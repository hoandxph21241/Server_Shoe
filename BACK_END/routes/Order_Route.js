var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Order_Contronller ");
var ContronllerApi = require("../Contronller/api/OrderApi");
var check_login=require("../middlewares/check_login");


router.get("/orderList", check_login.yeu_cau_dang_nhap, Contronlers.Order_List);
router.get("/orderDetails/:orderId", check_login.yeu_cau_dang_nhap, Contronlers.Order_Details);
router.post("/orderAdd", check_login.yeu_cau_dang_nhap, Contronlers.Order_Add);
router.post("/orderUpdate/:orderId", check_login.yeu_cau_dang_nhap, Contronlers.Order_Update);


router.get("/apiOderList", check_login.yeu_cau_dang_nhap, ContronllerApi.orderList);
router.get("/apiOderDetails/:orderId",  check_login.yeu_cau_dang_nhap, ContronllerApi.orderDetails);
router.post("/apiOderAdd",  check_login.yeu_cau_dang_nhap, ContronllerApi.addOrder);
router.post("/apiOderUpdate/:orderId",  check_login.yeu_cau_dang_nhap, ContronllerApi.updateOrder);
router.get("/apiOderList",  check_login.yeu_cau_dang_nhap, ContronllerApi.orderList);
module.exports = router;