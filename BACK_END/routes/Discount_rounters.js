var express = require("express");
var router = express.Router();
const dsController = require('../Contronller/Discount_Controller')
const { requireAdmin } = require('../middlewares/check_login');



router.get("", requireAdmin, dsController.getListDiscount);
router.post("/add", dsController.addDiscount);
// router.post("/hidden", requireAdmin, dsController.hiddenDiscount);
// router.post("/delete", requireAdmin, dsController.deleteDiscount);
// router.post("/edit", requireAdmin, dsController.editDiscount);
module.exports = router;
