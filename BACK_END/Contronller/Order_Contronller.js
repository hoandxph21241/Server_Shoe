const { sendNotificationUser } = require("../Contronller/api/Navigation_api");
const {
  sendNotificationAdmin,
} = require("../Contronller/Navigation_Controller");
const {
  OrderModel,
  OderDetailModel,
  ShoeModel,
  DiscountModel,
} = require("../Models/DB_Shoes");
const axios = require("axios");
const vietnamDate = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());

const BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const API_KEY = "2821bc5b-496b-11ef-8e53-0a00184fe694";
const SHOP_ID = "193119";

async function createTestShipment(orderDetails) {
  try {
    const response = await axios.post(
      `${BASE_URL}/v2/shipping-order/create`,
      orderDetails,
      {
        headers: {
          "Content-Type": "application/json",
          Token: API_KEY,
          ShopId: SHOP_ID,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating shipment:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

const isoDateString = "2024-08-14T13:58:28.000Z";
const formattedDate = formatDateTime(isoDateString);

const getAllOrders = async (req, res) => {
  const userRole = req.session.userLogin ? req.session.userLogin.role : null;

  try {
    let orders = await OrderModel.find()
      .populate("userId", "nameAccount imageAccount")
      .populate("discointId", "discountAmount")
      .lean();

    if (userRole === 3) {
      orders = orders.filter(
        (order) =>
          order.status !== 1 && order.status !== 2 && order.status !== 6
      );
    }

    const formattedOrders = orders.map((order) => {
      const formattedOrder = {
        userID: order.userId?._id || null,
        userNameAccount: order.userId?.nameAccount || null,
        userImageAccount: order.userId?.imageAccount || null,

        total: order.total,
        dateOrder: formatDateTime(order.dateOrder),
        status: order.status,
        _id: order._id,
      };

      return formattedOrder;
    });

    res.render("order/order_list.ejs", { formattedOrders, userRole: userRole });
  } catch (err) {
    res.status(500).json({ message: "Error list.", error: err.message });
  }
};

const getOrdersDetailt = async (req, res) => {
  const { orderId } = req.params;
  const userRole = req.session.userLogin ? req.session.userLogin.role : null;

  try {
    if (!orderId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Lấy thông tin đơn hàng và chi tiết đơn hàng
    const order = await OrderModel.findById(orderId)
      .populate("discointId", "discountAmount")
      .lean();
    console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const orderDetails = await OderDetailModel.find({ orderId })
      .populate({
        path: "shoeId",
        select: "name price thumbnail",
      })
      .populate({
        path: "sizeId",
        model: "SizeShoeModel",
        select: "size",
      })
      .populate({
        path: "colorId",
        model: "ColorShoeModel",
        select: "textColor codeColor",
      })
      .lean();

    // Lấy thông tin từ GHN
    const ghnUrl = `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail-by-client-code`;
    const ghnToken = "YOUR_API_TOKEN"; // Thay thế YOUR_API_TOKEN bằng mã token của bạn

    const ghnResponse = await axios.post(
      ghnUrl,
      {
        client_order_code: "66e7cdd4b1af63774fdbf076", // Thay thế bằng mã đơn hàng từ order nếu cần
      },
      {
        headers: {
          "Content-Type": "application/json",
          Token: "2821bc5b-496b-11ef-8e53-0a00184fe694",
        },
      }
    );

    const ghnData = ghnResponse.data;
    console.log(ghnData);

    // Định dạng lại chi tiết đơn hàng
    const orderResponse = {
      _id: orderId,
      userId: order.userId,
      nameOrder: order.nameOrder,
      phoneNumber: order.phoneNumber,
      addressOrder: order.addressOrder,
      dateOrder: order.dateOrder,
      status: order.status,
      orderStatusDetails: order.orderStatusDetails,
      total: order.total,
      discountAmount: order.discointId ? order.discointId.discountAmount : 0,
      details: orderDetails.map((detail) => ({
        shoeId: {
          _id: detail.shoeId._id,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity,
        },
      })),
      ghn: {
        quickCode: ghnData.data?.order_code || "N/A",
        deliveryStatus: ghnData.data?.status || "N/A",
      },
    };

    // Render dữ liệu
    res.render("order/order_details.ejs", {
      orderResponse,
      userRole: userRole,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết đơn hàng.", error: err.message });
  }
};

// Xác nhận hàng
const prepareOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status != 1) {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Chờ xác nhận" sang "Chuẩn bị hàng".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });
    console.log(orderDetails);

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    // Lấy thông tin sản phẩm từ ShoeModel
    const shoes = await ShoeModel.find({
      _id: { $in: orderDetails.map((detail) => detail.shoeId) },
    });

    const shoeMap = new Map(shoes.map((shoe) => [shoe._id.toString(), shoe]));

    // Cập nhật thông tin sản phẩm vào orderDetails
    for (let detail of orderDetails) {
      const shoe = shoeMap.get(detail.shoeId.toString());

      if (shoe) {
        detail.shoeName = shoe.name;
        detail.shoePrice = shoe.price;
      }
    }

    // order.status = 2;
    order.orderStatusDetails.push({
      status: "Chuẩn bị hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đang được chuẩn bị",
    });

    await order.save();

    const ghnOrderDetails = {
      payment_type_id: 2,
      // note: order.note || "Order Note",
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0332190158",
      return_address: "39 NTT",
      return_district_id: null, // Replace with actual district id
      return_ward_code: "", // Replace with actual ward code
      client_order_code: orderId,

      to_name: order.nameOrder,
      to_phone: order.phoneNumber,
      to_address: order.addressOrder,
      to_ward_name: "Phường 14", // Replace with actual ward name
      to_district_name: "Quận 10", // Replace with actual district name
      to_province_name: "HCM", // Replace with actual province name
      cod_amount: order.total,
      content: "Order content",
      weight: 200, // Replace with actual weight
      length: 1, // Replace with actual length
      width: 19, // Replace with actual width
      height: 10, // Replace with actual height
      cod_failed_amount: 2000,
      pick_station_id: 1444,
      deliver_station_id: null,
      // insurance_value: 1000000,
      service_id: 0,
      service_type_id: 2,
      coupon: null,
      pickup_time: Math.floor(Date.now() / 1000), // Current timestamp in seconds
      pick_shift: [2],
      items: orderDetails.map((detail) => ({
        name: detail.shoeName,
        code: detail.shoeId._id,
        quantity: detail.quantity,
        price: detail.shoePrice,
        length: 12,
        width: 12,
        weight: 1200,
        height: 12,
        category: { level1: "Shoe" },
      })),
    };

    // Create shipment with GHN
    const shipment = await createTestShipment(ghnOrderDetails);
    console.log("Test Shipment created:", shipment);

    sendNotificationUser(
      order.userId,
      "Đơn hàng đang được chuẩn bị",
      `Đơn hàng #${orderId} của bạn đang được chuẩn bị.`,
      "OrderPreparing",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Đơn hàng đang được chuẩn bị",
      `Đơn hàng #${orderId} đang được chuẩn bị.`,
      "OrderPreparing",
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({
      message:
        'Trạng thái đơn hàng đã được cập nhật thành "Chuẩn bị hàng" và thông báo đã được gửi.',
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: err.message,
    });
  }
};

const orderPreparedSuccessfully = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status != 2) {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Chuẩn bị hàng" sang "Chờ bàn giao đơn vị vận chuyển".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = 3;
    order.orderStatusDetails.push({
      status: "Chờ bàn giao đơn vị vận chuyển",
      timestamp: vietnamDate,
      note: "Đơn hàng đã được chuẩn bị thành công",
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      "Đơn hàng đã được chuẩn bị thành công",
      `Đơn hàng #${orderId} của bạn đã được chuẩn bị thành công.`,
      "OrderPreparedSuccessfully",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Đơn hàng đã được chuẩn bị thành công",
      `Đơn hàng #${orderId} đã được chuẩn bị thành công.`,
      "OrderPreparedSuccessfully",
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({
      message:
        'Trạng thái đơn hàng đã được cập nhật thành "Chờ bàn giao đơn vị vận chuyển" và thông báo đã được gửi.',
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: err.message,
    });
  }
};

//Xác nhận ship hàng
const shipOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status != 3) {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Chờ bàn giao đơn vị vận chuyển" sang "Giao hàng".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = 4;
    order.orderStatusDetails.push({
      status: "Giao hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đang được giao",
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      "Đơn hàng đang được giao",
      `Đơn hàng #${orderId} của bạn đang được giao.`,
      "OrderShipped",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Đơn hàng đang được giao",
      `Đơn hàng #${orderId} đang được giao.`,
      "OrderShipped",
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({
      message:
        'Trạng thái đơn hàng đã được cập nhật thành "Giao hàng" và thông báo đã được gửi.',
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: err.message,
    });
  }
};
//Người dùng nhận đơn
const confirmOrderReceived = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status != 4) {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Đã nhận hàng".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = 5;
    order.orderStatusDetails.push({
      status: "Giao thành công",
      timestamp: vietnamDate,
      note: "Đơn hàng đã giao cho người nhận",
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      "Xác nhận đã nhận hàng",
      `Đơn hàng #${orderId} của bạn đã được giao vui lòng xác nhận đơn hàng.`,
      "OrderDelivered",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Xác nhận đã nhận hàng",
      `Đơn hàng #${orderId} đã được xác nhận là đã giao hàng.`,
      "OrderDelivered",
      orderDetails[0].shoeId,
      vietnamDate
    );
    res.status(200).json({
      message:
        'Trạng thái đơn hàng đã được cập nhật thành "Đã nhận hàng" và thông báo đã được gửi.',
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: err.message,
    });
  }
};

// Hủy đơn hàng trạng thái Chờ xác nhận
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancelReason } = req.body; // Lý do hủy

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status !== "Chờ xác nhận") {
      return res
        .status(400)
        .json({
          message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".',
        });
    }

    order.status = "Đã hủy";
    order.orderStatusDetails.push({
      status: "Đã hủy",
      timestamp: vietnamDate,
      note: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`,
    });
    await order.save();

    const orderDetails = await OderDetailModel.find({ orderId: order._id });
    for (let item of orderDetails) {
      const shoe = await ShoeModel.findById(item.shoeId);

      if (!shoe) {
        return res
          .status(400)
          .json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
      }

      const sizeIndex = shoe.sizeShoe.findIndex((size) =>
        size.equals(item.sizeId)
      );
      const colorIndex = shoe.colorShoe.findIndex((color) =>
        color.equals(item.colorId)
      );

      if (sizeIndex === -1 || colorIndex === -1) {
        return res
          .status(400)
          .json({
            message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`,
          });
      }

      const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;
      if (storageIndex < 0 || storageIndex >= shoe.storageShoe.length) {
        return res
          .status(400)
          .json({
            message: `Không tìm thấy mục tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`,
          });
      }

      shoe.storageShoe[storageIndex].importQuanlity += item.quantity;
      shoe.soldQuanlityAll -= item.quantity;
      await shoe.save();
    }

    if (order.discointId) {
      const discount = await DiscountModel.findById(order.discointId);

      if (discount && discount.isActive) {
        discount.maxUser += 1;
        await discount.save();
      }
    }

    sendNotificationUser(
      order.userId,
      "Đơn hàng đã bị hủy",
      `Đơn hàng #${orderId}  Người bán đã hủy. Lý do: ${cancelReason}`,
      "OrderCanceled",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Bạn đã hủy đơn hàng",
      `Đơn hàng #${orderId} đã bị hủy. Lý do : ${cancelReason}`,
      "OrderCanceled",
      orderDetails[0].shoeId,
      vietnamDate
    );

    res
      .status(200)
      .json({ message: "Đơn hàng đã bị hủy và thông báo đã được gửi.", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi hủy đơn hàng.", error: err.message });
  }
};

const failDeliveryOrder = async (req, res) => {
  const { orderId } = req.params;
  const { failureReason } = req.body; // Lý do giao hàng thất bại

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status != 4) {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Hoàn đơn".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = 7;
    order.orderStatusDetails.push({
      status: "Giao hàng thất bại",
      timestamp: vietnamDate,
      note: `Giao hàng thất bại. Lý do: ${failureReason}`,
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      "Giao hàng thất bại",
      `Đơn hàng #${orderId} của bạn đã gặp vấn đề khi giao hàng. Lý do: ${failureReason}`,
      "OrderDeliveryFailed",
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      "Giao hàng thất bại",
      `Đơn hàng #${orderId} gặp vấn đề khi giao hàng. Lý do: ${failureReason}`,
      "OrderDeliveryFailed",
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({
      message:
        'Trạng thái đơn hàng đã được cập nhật thành "Giao hàng thất bại" và thông báo đã được gửi.',
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng.",
      error: err.message,
    });
  }
};

module.exports = {
  cancelOrder,
  getAllOrders,
  getOrdersDetailt,
  prepareOrder,
  orderPreparedSuccessfully,
  shipOrder,
  confirmOrderReceived,
  failDeliveryOrder,
};
