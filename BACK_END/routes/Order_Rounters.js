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


router.get("/orderlist",requireAdmin, Contronlers.Order_List);
router.post("/orderlist",requireAdmin, Contronlers.Order_List);


router.get("/orderdetails",requireAdmin, Contronlers.Order_Details);
router.post("/orderdetails",requireAdmin, Contronlers.Order_Details);

module.exports = router;
