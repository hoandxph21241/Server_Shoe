var express = require("express");
var router = express.Router();
var orderController = require("../Contronller/api/OrderApi");
var check_login=require("../middlewares/check_login");


router.post("/createOrder", orderController.createOrder);

router.put("/cancelOrder/:orderId", orderController.cancelOrder);

router.put('/confirmReceived/:orderId', orderController.confirmOrderReceived);


router.get("/getUserOrder/:orderId", orderController.getUserOrdersWithFirstItem);
router.get("/getOrderById/:orderId", orderController.getOrderById);
router.get("/getOrderShoeById/:orderId", orderController.getOrderShoeById);


module.exports = router;