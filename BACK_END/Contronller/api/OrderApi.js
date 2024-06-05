const { OderModel } = require("../../Models/DB_Shoes");

const addOrder = (req, res) => {
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
  order
    .save()
    .then((order) => {
      res.status(201).json({ status: "success", order });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};
const orderDetails = (req, res) => {
  const { orderId } = req.params;
  OderModel.findById(orderId)
    .then((order) => {
      res.status(200).json({ status: "success", order });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};
const orderList = (req, res) => {
  OderModel.find()
    .then((orders) => {
      res.status(200).json({ status: "success", orders });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};
const updateOrder = (req, res) => {
  const { orderId } = req.params;
  const { userId, name, phoneNumber, adress, total, pay, status } = req.body;
  OderModel.findByIdAndUpdate(orderId, {
    userId,
    name,
    phoneNumber,
    adress,
    total,
    pay,
    status,
  })
    .then((order) => {
      res.status(200).json({ status: "success", order });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};
const getAllOrder = (req, res) => {
  OderModel.find()
    .then((orders) => {
      res.status(200).json({ status: "success", orders });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};

const getOrderById = (req, res) => {
  const { orderId } = req.params;
  OderModel.findById(orderId)
    .then((order) => {
      res.status(200).json({ status: "success", order });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};

// module.exports = {
//   addOrder,
//   orderDetails,
//   orderList,
//   updateOrder,
// };
 const getAllOrderByUserId = function (req, res) {
  const { userId } = req.params;
  OderModel.find({ userId })
    .then((orders) => {
      res.status(200).json({ status: "success", orders });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", err });
    });
};


module.exports =
{
  addOrder,
  orderDetails,
  orderList,
  updateOrder,
  getAllOrder,
  getOrderById,
  getAllOrderByUserId,
};