var express = require("express");
var router = express.Router();
var check_login=require("../middlewares/check_login");
const api = require("../Contronller/api/Navigation_api");
const Contronller = require("../Contronller/Navigation_Controller");

router.get("/getListNavigationByUser/:userId", check_login.yeu_cau_dang_nhap, api.getListNavigationByUser);
router.post("/deleteNavigation", check_login.yeu_cau_dang_nhap, api.deleteNavigation);
router.post("/clickNavigation", check_login.yeu_cau_dang_nhap, api.clickNavigation);

router.get("/", check_login.yeu_cau_dang_nhap, Contronller.getListNavigation);
router.post("/", check_login.yeu_cau_dang_nhap, Contronller.clickNavigation);

module.exports = router;
