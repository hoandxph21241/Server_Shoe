const { sendNotificationUser } = require('../Contronller/api/Navigation_api');
const { sendNotificationAdmin } = require('../Contronller/Navigation_Controller');
const { OrderModel, OderDetailModel, ShoeModel, DiscountModel } = require("../Models/DB_Shoes");

const vietnamDate = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh'
}).format(new Date());

const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "nameAccount imageAccount")
      .populate("discointId", "discountAmount")
      .lean();

    const formattedOrders = orders.map((order) => {
      const formattedOrder = {
        userID: order.userId?._id,
        userNameAccount: order.userId?.nameAccount || null,
        userImageAccount: order.userId?.imageAccount || null,
        ...order,
        // discountId: order.discointId?._id || null,
        // discountAmount: order.discointId?.discountAmount || 0,
      };

      delete formattedOrder.userId;
      delete formattedOrder.discointId;

      return formattedOrder;
    });
    // res.json({ formattedOrders })

    res.render("order/order_list.ejs", { formattedOrders });
  } catch (err) {
    res.status(500).json({ message: "Error list.", error: err.message });
  }
};



const getOrdersDetailt = async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!orderId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Lấy thông tin đơn hàng và chi tiết đơn hàng
    const order = await OrderModel.findById(orderId)
      .populate("discointId", "discountAmount")
      .lean();

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
    };
    // res.json({ orderResponse });

      res.render("order/order_details.ejs", { orderResponse });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng.", error: err.message });
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

    if (order.status !== "Chờ xác nhận") {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Chờ xác nhận" sang "Chuẩn bị hàng".',
      });
    }


    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = "Chuẩn bị hàng";
    order.orderStatusDetails.push({
      status: "Chuẩn bị hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đang được chuẩn bị",
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

//Xác nhận ship hàng
const shipOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status !== "Chuẩn bị hàng") {
      return res
        .status(400)
        .json({
          message:
            'Chỉ có thể chuyển trạng thái đơn hàng từ "Chuẩn bị hàng" sang "Giao hàng".',
        });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = "Giao hàng";
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

    if (order.status !== "Giao hàng") {
      return res.status(400).json({
        message:
          'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Đã nhận hàng".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = "Đã nhận hàng";
    order.orderStatusDetails.push({
      status: "Đã nhận hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đã được nhận",
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      'Xác nhận đã nhận hàng',
      `Đơn hàng #${orderId} của bạn đã được xác nhận là đã giao hàng.`,
      'OrderDelivered',
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      'Xác nhận đã nhận hàng',
      `Đơn hàng #${orderId} đã được xác nhận là đã giao hàng.`,
      'OrderDelivered',
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
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.status !== 'Chờ xác nhận') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".' });
    }

    order.status = 'Đã hủy';
    order.orderStatusDetails.push({
      status: 'Đã hủy',
      timestamp: vietnamDate,
      note: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`
    });
    await order.save();

    const orderDetails = await OderDetailModel.find({ orderId: order._id });
    for (let item of orderDetails) {
      const shoe = await ShoeModel.findById(item.shoeId);

      if (!shoe) {
        return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
      }

      const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
      const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

      if (sizeIndex === -1 || colorIndex === -1) {
        return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
      }

      const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;
      if (storageIndex < 0 || storageIndex >= shoe.storageShoe.length) {
        return res.status(400).json({ message: `Không tìm thấy mục tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
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
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${orderId}  Người bán đã hủy. Lý do: ${cancelReason}`,
      'OrderCanceled',
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      'Bạn đã hủy đơn hàng',
      `Đơn hàng #${orderId} đã bị hủy. Lý do : ${cancelReason}`,
      'OrderCanceled',
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({ message: 'Đơn hàng đã bị hủy và thông báo đã được gửi.', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng.', error: err.message });
  }
};

const failDeliveryOrder = async (req, res) => {
  const { orderId } = req.params;
  const { failReason } = req.body; // Lý do giao hàng thất bại

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.status !== "Giao hàng") {
      return res.status(400).json({
        message: 'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Giao hàng thất bại".',
      });
    }

    const orderDetails = await OderDetailModel.find({ orderId });

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng." });
    }

    order.status = "Giao hàng thất bại";
    order.orderStatusDetails.push({
      status: "Giao hàng thất bại",
      timestamp: vietnamDate,
      note: `Giao hàng thất bại. Lý do: ${failReason}`,
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      'Giao hàng thất bại',
      `Đơn hàng #${orderId} của bạn đã gặp vấn đề khi giao hàng. Lý do: ${failReason}`,
      'OrderDeliveryFailed',
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      'Giao hàng thất bại',
      `Đơn hàng #${orderId} gặp vấn đề khi giao hàng. Lý do: ${failReason}`,
      'OrderDeliveryFailed',
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({
      message: 'Trạng thái đơn hàng đã được cập nhật thành "Giao hàng thất bại" và thông báo đã được gửi.',
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
  shipOrder,
  confirmOrderReceived,
  failDeliveryOrder
};
