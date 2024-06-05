const { OderModel } = require("../Models/DB_Shoes");


const getListNavigation = async (req, res) => {
    try {
      const statuses = [
        "Đã hủy",
        "Đã tạo đơn",
        "Đã xác nhận",
        "Đang Giao",
        "Giao Thành Công",
      ];
      const orders = await OderModel.aggregate([
        { $match: { status: { $in: statuses } } },
      ]);
  
      return res.render("Navigation", { status: "success", orders });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  };
  const clickNavigation = async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await OderModel.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ status: "error", message: "Oder not found" });
      }
      return res.render("Navigation", { status: "success", order });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
  module.exports = {
    getListNavigation,
    clickNavigation,
  }