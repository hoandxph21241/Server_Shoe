var express = require("express");
var router = express.Router();
var orderController = require("../Contronller/api/OrderApi");
var check_login=require("../middlewares/check_login");


router.post("/createOrder", check_login.yeu_cau_dang_nhap, orderController.createOrder);

router.put("/cancelOrder/:orderId", check_login.yeu_cau_dang_nhap,orderController.cancelOrder);

router.put('/confirmReceived/:orderId', check_login.yeu_cau_dang_nhap,orderController.confirmOrderReceived);


// hiển thị list đơn hàng user, lấy đơn hàng đầu tiên đại diện 1 đơn hàng
router.get("/getUserOrder/:orderId", check_login.yeu_cau_dang_nhap,orderController.getUserOrdersWithFirstItem);

// Hiển thị thông tin đơn hàng by orderId
router.get("/getOrderById/:orderId", check_login.yeu_cau_dang_nhap,orderController.getOrderById);

//Hiển thị list giày  by orderId
router.get("/getOrderShoeById/:orderId", check_login.yeu_cau_dang_nhap,orderController.getOrderShoeById);


module.exports = router;