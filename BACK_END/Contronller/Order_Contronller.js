const moment = require('moment'); 
const { sendNotificationUser } = require("../Contronller/api/Navigation_api");
const {
  sendNotificationAdmin
} = require("../Contronller/Navigation_Controller");
const {
  OrderModel,
  OderDetailModel,
  ShoeModel,
  DiscountModel,
  UserModel,
  StorageShoeModel
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


const getAllOrders = async (req, res) => {
  const userRole = req.session.userLogin ? req.session.userLogin.role : null;

  try {
    let orders = await OrderModel.find()
      .populate("userId", "_id nameAccount imageAccount")
      .populate("discointId", "discountAmount")
      .lean();

    if (userRole === 3) {
      orders = orders.filter(
        (order) =>
          order.status !== 1 && order.status !== 2 && order.status !== 6 && order.status !== -1
      );
    }

    const formattedOrders = orders.map((order) => {
      const userImageAccount = order.userId?.imageAccount
        ? `data:image/jpeg;base64,${order.userId.imageAccount.toString(
            "base64"
          )}`
        : null;

        const formattedDate = moment(order.dateOrder).format('HH:mm:ss DD/MM/YYYY');


      const formattedOrder = {
        userID: order.userId?._id || null,
        userNameAccount: order.userId?.nameAccount || null,
        userImageAccount: userImageAccount,

        total: order.total,
        dateOrder: formattedDate,
        status: order.status,
        _id: order._id,
      };

      return formattedOrder;
    }).reverse();;

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
      return res.status(404).json({ message: "Order not found." });
    }

    // Get order and order details
    const order = await OrderModel.findById(orderId)
      .populate("discointId", "discountAmount")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
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

    let ghnData = {
      quickCode: "N/A",
      deliveryStatus: "N/A",
    };

    try {
      const ghnResponse = await axios.post(
        BASE_URL,
        {
          client_order_code: orderId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: "2821bc5b-496b-11ef-8e53-0a00184fe694",
          },
        }
      );

      ghnData = {
        quickCode: ghnResponse.data.data?.order_code || "N/A",
        deliveryStatus: ghnResponse.data.data?.status || "N/A",
      };
    } catch (ghnError) {
      console.error("GHN API request failed:", ghnError.message);
    }

    const orderResponse = {
      _id: orderId,
      userId: order.userId,
      nameOrder: order.nameOrder,
      phoneNumber: order.phoneNumber,
      addressOrder: order.addressOrder,
      dateOrder: order.dateOrder,
      status: order.status,
      pay: order.pay,
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
      ghn: ghnData,
    };

    // Render data
    res.render("order/order_details.ejs", {
      orderResponse,
      userRole: userRole,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order details.", error: err.message });
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

    const totalWeight = orderDetails.reduce((sum, detail) => {
      const itemWeight = 200; // Weight of one item in grams
      return sum + (itemWeight * detail.quantity);
    }, 0);

    const ghnOrderDetails = {
      payment_type_id: 2,
      // note: order.note || "Order Note",
      required_note: "KHONGCHOXEMHANG",
      return_phone: "0332190158",
      return_address: "39 NTT",
      return_district_id: null, 
      return_ward_code: "",
      client_order_code: orderId,

      to_name: order.nameOrder,
      to_phone: order.phoneNumber,
      to_address: order.addressOrder,
      to_ward_name: "Phường 14", 
      to_district_name: "Quận 10",
      to_province_name: "HCM", 
      cod_amount: order.total,
      content: "Order content",
      weight: totalWeight, 
      length: 1, 
      width: 19, 
      height: 10, 
      cod_failed_amount: 2000,
      pick_station_id: 1444,
      deliver_station_id: null,
      // insurance_value: 1000000,
      service_id: 0,
      service_type_id: 2,
      coupon: null,
      pickup_time: Math.floor(Date.now() / 1000), 
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

    const shipment = await createTestShipment(ghnOrderDetails);
    console.log("Test Shipment created:", shipment);
        order.status = 2;
        order.orderStatusDetails.push({
          status: "Chuẩn bị hàng",
          timestamp: vietnamDate,
          note: `Đơn hàng đang được chuẩn bị. Mã đơn hàng GHN: ${shipment.data.order_code}`, 
        });
    
        await order.save();

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
        'Trạng thái đơn hàng đã được cập nhật thành Chuẩn bị hàng.',
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
        'Trạng thái đơn hàng đã được cập nhật Chờ bàn giao đơn vị vận chuyển .',
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
        'Trạng thái đơn hàng đã được cập nhật thành "Giao hàng" .',
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
        'Trạng thái đơn hàng đã được cập nhật thành "Đã nhận hàng".',
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
  const { cancelOrder } = req.body;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng với id ${orderId}` });
    }
    if (order.status !== 1) {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".' });
    }

    // order.status = 6;
    order.orderStatusDetails.push({
      status: 'Đã hủy',
      vietnamDate,
      note: `Đơn hàng đã được hủy bởi người dùng. Lý do: ${cancelOrder || 'Không có lý do.'}`, 
    });

    await order.save();

    // Hoàn lại số lượng sản phẩm vào kho
    const orderDetails = await OderDetailModel.find({ orderId: order._id });
    console.log(orderDetails);
    
    for (let item of orderDetails) {
      const shoe = await ShoeModel.findById(item.shoeId);
      const storageItem = await StorageShoeModel.findOne({
        shoeId: item.shoeId,
        colorShoe: item.colorId,
        "sizeShoe.sizeId": item.sizeId,
      });
console.log(storageItem);


      const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
      const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

      if (sizeIndex !== -1 && colorIndex !== -1) {
        const stockIndex = sizeIndex * shoe.colorShoe.length + colorIndex;

        // Hoàn lại số lượng giày trong ShoeModel
        shoe.storageShoe[stockIndex].soldQuanlity += item.quantity;
        shoe.soldQuanlityAll += item.quantity;
        await shoe.save();

        // Hoàn lại số lượng giày trong StorageShoeModel
        const sizeShoeToUpdate = storageItem.sizeShoe.find(size => size.sizeId.equals(item.sizeId));
        sizeShoeToUpdate.quantity += item.quantity;
        storageItem.soldQuanlity += item.quantity;
        await storageItem.save();
      }
    }

    // Kiểm tra và hoàn lại mã giảm giá 
    if (order.discointId) {
      const discount = await DiscountModel.findById(order.discointId);
      if (discount) {
        discount.maxUser += 1;  
        await discount.save();
      }
    }

    await sendNotificationUser(
      order.userId,
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${order._id} đã hủy . Lý do shop: ${cancelOrder || 'Không có lý do.'}`,
      'OrderCanceled',
      order._id,
      new Date()
    );

    await sendNotificationAdmin(
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${order._id} đã bị hủy. Lý do: ${cancelOrder || 'Không có lý do.'}`,
      'OrderCanceled',
      order._id,
      new Date()
    );

    res.status(200).json({ message: 'Đơn hàng đã được hủy thành công.', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng.', error: err.message });
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
