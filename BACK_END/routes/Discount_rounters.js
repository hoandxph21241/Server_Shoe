var express = require("express");
var router = express.Router();
const dsController = require('../Contronller/Discount_Controller')




router.get("", dsController.getListDiscount);
router.post("/add", dsController.addDiscount);
router.post("/hidden",  dsController.hiddenDiscount);
// router.post("/delete", requireAdmin, dsController.deleteDiscount);
router.post("/edit",  dsController.editDiscount);
module.exports = router;

