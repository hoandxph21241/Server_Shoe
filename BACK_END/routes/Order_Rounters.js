var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Order_Contronller");

function requireAdmin(req, res, next) {
  // Check Login
  if (!req.session.userLogin) {
    return res.redirect('/auth/signin');
  }
  // Check Admin
  if (req.session.userLogin['role'] === 1) {
    return res.redirect('/home');
  } else if (req.session.userLogin['role'] === 2) {
    return next();
  } else {
    return res.send('Bạn không đủ quyền hạn');
  }
}


router.get("/orderList", Contronlers.getAllOrders);
router.get("/orderDetails/:orderId", Contronlers.getOrdersDetailt);

router.put("/prepareOrder/:orderId", Contronlers.prepareOrder);
router.put("/shipOrder/:orderId", Contronlers.shipOrder);
router.put("/confirmOrder/:orderId", Contronlers.confirmOrderReceived);


module.exports = router;
