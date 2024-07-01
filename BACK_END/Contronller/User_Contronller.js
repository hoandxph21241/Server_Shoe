const {  UserModel,  OrderModel,  OderDetailModel,} = require("../Models/DB_Shoes");

const GetAllUser = async (req, res) => {
  try {
    const listUser = await UserModel.find();

    return res.status(200).json(listUser);
  } catch (error) {
    return res.status(204).json({ msg: "không có dữ liệu" + error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({})
      .populate("discointId", "discountAmount")
      .lean();

    const ordersResponse = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await OderDetailModel.find({ orderId: order._id })
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
        const details = orderDetails.map((detail) => ({
          _id: detail._id,
          shoeId: detail.shoeId ? detail.shoeId._id : null,
          name: detail.shoeId ? detail.shoeId.name : "N/A",
          thumbnail: detail.shoeId ? detail.shoeId.thumbnail : "",
          size: detail.sizeId ? detail.sizeId.size : "N/A",
          textColor: detail.colorId ? detail.colorId.textColor : "N/A",
          codeColor: detail.colorId ? detail.colorId.codeColor : "",
          quantity: detail.quantity,
          price: detail.shoeId ? detail.shoeId.price : 0,
        }));

        return {
          _id: order._id,
          orderId: order.orderId,
          dateOrder: order.dateOrder,
          total: order.total,
          status: order.status,
          details: details,
        };
      })
    );

    res.status(200).json({ orders: ordersResponse });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đơn hàng.", error: err.message });
  }
};

module.exports = { getAllOrders };

const getOrdersDetailt = async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!orderId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const order = await OrderModel.findById(orderId)
      .populate("discointId", "discountAmount")
      .lean();

    if (!orderId) {
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
    res.json({ orderResponse });

    // res.render("order/order_details.ejs", { orderResponse });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết đơn hàng.", error: err.message });
  }
};

module.exports = {
  GetAllUser,
  getAllOrders,
  getOrdersDetailt,
};
