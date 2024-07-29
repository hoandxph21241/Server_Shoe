const { OrderModel, OderDetailModel, ShoeModel, DiscountModel } = require("../Models/DB_Shoes");


exports.Home = async (req, res, next) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "nameAccount imageAccount")
      .lean();

    const filteredOrders = orders.filter(order => order.status === "Chờ xác nhận");

    const ordersWithDetails = await Promise.all(filteredOrders.map(async (order) => {
      console.log(order._id);
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

      const details = orderDetails.map(detail => ({
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
        userID: order.userId?._id,
        userNameAccount: order.userId?.nameAccount || null,
        userImageAccount: order.userId?.imageAccount || null,
        _id: order._id,
        dateOrder: order.dateOrder,
        status: order.status,
        total: order.total,
        details, 
      };
    }));
    // res.json({ ordersWithDetails })
    const totalProducts = await ShoeModel.countDocuments({});
    res.render("home/viewHome.ejs", { orderPending: ordersWithDetails, totalProducts });

  } catch (err) {
    res.status(500).json({ message: "Error listing orders.", error: err.message });
  }
};



