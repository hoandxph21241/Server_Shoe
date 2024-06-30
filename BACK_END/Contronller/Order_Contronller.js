const sendNotification = require("../utils/notificationService"); // Import hàm dùng chung
const { OrderModel, OderDetailModel } = require("../Models/DB_Shoes");

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
        discountId: order.discointId?._id || null,
        discountAmount: order.discointId?.discountAmount || 0,
      };

      delete formattedOrder.userId;
      delete formattedOrder.discointId;

      return formattedOrder;
    });
    res.json( { formattedOrders} )
    
    // res.render("order/order_list.ejs", { formattedOrders });
  } catch (err) {
    res.status(500).json({ message: "Error list.", error: err.message });
  }
};

// const getAllOrderByIdUser = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const orders = await OrderModel.findById(userId).populate('discointId', 'discountAmount')
//     res.status(200).json({ status: "success", orders });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
//   }
// };


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
    res.json({orderResponse});

    // res.render("order/order_details.ejs", { orderResponse });
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

    if (order.status !== "Chờ xác nhận") {
      return res
        .status(400)
        .json({
          message:
            'Chỉ có thể chuyển trạng thái đơn hàng từ "Chờ xác nhận" sang "Chuẩn bị hàng".',
        });
    }

    order.status = "Chuẩn bị hàng";
    order.orderStatusDetails.push({
      status: "Chuẩn bị hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đang được chuẩn bị",
    });

    await order.save();

    sendNotification(
      order.userId,
      "Đơn hàng đang được chuẩn bị",
      `Đơn hàng #${orderId} của bạn đang được chuẩn bị.`,
      "OrderPreparing",
      "Đơn hàng đang được chuẩn bị",
      `Đơn hàng #${orderId} đang được chuẩn bị.`
    );

    res
      .status(200)
      .json({
        message:
          'Trạng thái đơn hàng đã được cập nhật thành "Chuẩn bị hàng" và thông báo đã được gửi.',
        order,
      });
  } catch (err) {
    res
      .status(500)
      .json({
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

    order.status = "Giao hàng";
    order.orderStatusDetails.push({
      status: "Giao hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đang được giao",
    });

    await order.save();

    sendNotification(
      order.userId,
      "Đơn hàng đang được giao",
      `Đơn hàng #${orderId} của bạn đang được giao.`,
      "OrderShipped",
      "Đơn hàng đang được giao",
      `Đơn hàng #${orderId} đang được giao.`
    );

    res
      .status(200)
      .json({
        message:
          'Trạng thái đơn hàng đã được cập nhật thành "Giao hàng" và thông báo đã được gửi.',
        order,
      });
  } catch (err) {
    res
      .status(500)
      .json({
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
      return res
        .status(400)
        .json({
          message:
            'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Đã nhận hàng".',
        });
    }

    order.status = "Đã nhận hàng";
    order.orderStatusDetails.push({
      status: "Đã nhận hàng",
      timestamp: vietnamDate,
      note: "Đơn hàng đã được nhận",
    });

    await order.save();

    sendNotification(
      order.userId,
      "Đơn hàng đã được nhận",
      `Đơn hàng #${orderId} của bạn đã được nhận.`,
      "OrderDelivered",
      "Đơn hàng đã được nhận",
      `Đơn hàng #${orderId} đã được nhận.`
    );

    res
      .status(200)
      .json({
        message:
          'Trạng thái đơn hàng đã được cập nhật thành "Đã nhận hàng" và thông báo đã được gửi.',
        order,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Lỗi khi cập nhật trạng thái đơn hàng.",
        error: err.message,
      });
  }
};

module.exports = {
  getAllOrders,
  getOrdersDetailt,
  prepareOrder,
  shipOrder,
  confirmOrderReceived,
};
