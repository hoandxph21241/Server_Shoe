const { OrderModel, OderDetailModel, ShoeModel, DiscountModel, UserModel } = require("../Models/DB_Shoes");
const moment = require('moment');

const {
  getBestSellingProduct,
  getRevenueBetweenDates,
  leastSellingProducts,
  getLowStockProducts,
} = require('../Contronller/statisticsController');

exports.Home = async (req, res, next) => {
  try {

    const orders = await OrderModel.find()
      .populate("userId", "nameAccount imageAccount")
      .lean();

    const filteredOrders = orders.filter(order => order.status === 1); // 'Chờ xác nhận' corresponds to 1

    const ordersWithDetails = await Promise.all(filteredOrders.map(async (order) => {
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
      const formattedDate = moment(order.dateOrder).format('HH:mm:ss DD/MM/YYYY');


      return {
        userID: order.userId?._id,
        userNameAccount: order.userId?.nameAccount || null,
        userImageAccount: order.userId?.imageAccount || null,
        _id: order._id,
        formattedDate,
        status: order.status,
        total: order.total,
        details,
      };
    }));

    const totalProducts = await ShoeModel.countDocuments({});
    const totalOrder = await DiscountModel.countDocuments({});
    const totalUser = await UserModel.countDocuments({});

    res.render("home/viewHome.ejs", {
      orderPending: ordersWithDetails,
      totalProducts,
      totalOrder,
      totalUser,
    });

  } catch (err) {
    res.status(500).json({ message: "Error listing orders.", error: err.message });
  }
};
exports.Homes = async (req, res, next) => {
  const { period } = req.query;
  let startDate, endDate;
  const today = new Date();

  if (period === 'weekly') {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    endDate = new Date();
  } else if (period === 'monthly') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date();
  } else if (period === 'yearly') {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date();
  }

  // Xác định khoảng thời gian dựa vào tham số period
  switch (period) {
    case 'weekly':
      matchCondition = { date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } };
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
      break;
    case 'monthly':
      matchCondition = { date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } };
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
      break;
    case 'yearly':
      matchCondition = { date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } };
      groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
      break;
    default:
      return res.status(400).json({ message: 'Invalid period' });
  }

  try {
    getRevenueBetweenDates(startDate, endDate, res);


  } catch (error) {
    console.error('Error fetching revenue and profit data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

};

exports.Homess = async (req, res, next) => {
  try {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    getBestSellingProduct(startDate, endDate, res);
  } catch (error) {
    console.error('Error fetching best-selling product data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
