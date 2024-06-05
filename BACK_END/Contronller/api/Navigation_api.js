const { OderModel } = require("../../Models/DB_Shoes");

const getListNavigationByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const statuses = [
      "Đã hủy",
      "Đã tạo đơn",
      "Đã xác nhận",
      "Đang Giao",
      "Giao Thành Công",
    ];

    const orders = await OderModel.aggregate([
      { $match: { userId } },
      { $match: { status: { $in: statuses } } },
    ]);

    return res.status(200).json({ status: "success", orders });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
const deleteNavigation = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    const order = await OderModel.find({ userId, oderId: orderId });
    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Oder not found" });
    }
    order.status = 0;
    await order.save();
    return res
      .status(200)
      .json({ status: "success", message: "Delete order success" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
const clickNavigation = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    const order = await OderModel.find({ userId, oderId: orderId });
    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Oder not found" });
    }
    return res.status(200).json({ status: "success", order });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
module.exports = {
  getListNavigationByUser,
  deleteNavigation,
  clickNavigation,
};