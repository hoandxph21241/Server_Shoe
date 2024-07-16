var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Home_Contronller");

router.get("", Contronlers.Home);
router.post('/confirm/:orderId', Contronlers.ConfirmOrder);
router.post('/refuse/:orderId',Contronlers.DeleteOrdeer);

module.exports = router;
