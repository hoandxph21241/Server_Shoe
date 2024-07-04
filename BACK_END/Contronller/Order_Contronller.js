  const {OderModel} = require("../Models/DB_Shoes");


exports.Order_List = async (req, res, next) => {
  try {
    const orders = await OderModel.find();
    res.render("order/order_list.ejs", { orders });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
  res.render("order/order_list.ejs");
};
exports.Order_Details = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await OderModel.findById(orderId);
    res.render("order/order_details.ejs", { order });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
};
exports.Order_Details = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await OderModel.findById(orderId);
    res.render("order/order_details.ejs", { order });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
}
exports.Order_Add = async (req, res, next) => {
  try {
    const { userId, name, phoneNumber, adress, total, pay } = req.body;
    const order = new OderModel({
      userId,
      name,
      phoneNumber,
      adress,
      total,
      pay,
      status: 1,
    });
    await order.save();
    res.status(201).json({ status: "success", order });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
};

exports.Order_Update = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId, name, phoneNumber, adress, total, pay, status } = req.body;
    const order = await OderModel.findByIdAndUpdate(orderId, {
      userId,
      name,
      phoneNumber,
      adress,
      total,
      pay,
      status,
    });
    res.status(200).json({ status: "success", order });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
};

exports.GetOrderByIdUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await OderModel.find({ userId });
    res.status(200).json({ status: "success", orders });
  } catch (error) {
    res.status(500).json({ status: "failed", error });
  }
};