// Shoes Dashboard
const Order = require('../Models/DB_Shoes');
const STATUS = require('../Models/DB_Shoes');

exports.Home = async (req, res, next) => {
  try {
    const orders = await Order.OderModel.find({ status: STATUS.STATUS.PENDING });
    res.render("home/viewHome.ejs", { orderPending: orders });
  } catch (error) {
    console.log("Error: ", error);
    next(error);
  }
};

exports.ConfirmOrder = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.OderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    order.status = STATUS.STATUS.PROCESSING; // Đảm bảo STATUS.STATUS.PROCESSING được định nghĩa đúng cách
    await order.save();

    res.redirect('/home');
  } catch (error) {
    console.error('Lỗi xác nhận đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};

exports.DeleteOrdeer = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.OderModel.findByIdAndDelete(orderId);
    if(!order){
      console.log("Order not found");
    }

    res.redirect('/home');
  } catch (error) {
    console.log("Lỗi xóa đơn hàng");
  }
};

exports.DetailOrder = async (req, res) => {
  try {
    const { orderId } = req.params.orderId;
    const order = await Order.OderModel.findById(orderId).populate('user').populate('shoe');
    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.render('order/order_list.ejs', { order: order });
  } catch (error) {
    console.log("Error retrieving order information :", error);
  }
};
