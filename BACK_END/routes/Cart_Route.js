var express = require("express");
var router = express.Router();

var check_login = require("../middlewares/check_login");
const CartController = require("../Contronller/api/CartApi");


router.post('/addCart', check_login.yeu_cau_dang_nhap, CartController.addCart);
router.delete('/deleteCart/:cartId', check_login.yeu_cau_dang_nhap, CartController.deleteCart);
router.post('/updateNumberShoe/:cartId', check_login.yeu_cau_dang_nhap, CartController.updateNumberShoe);
router.get('/cartList/:userId', check_login.yeu_cau_dang_nhap, CartController.cartListByUserId);

module.exports = router;


