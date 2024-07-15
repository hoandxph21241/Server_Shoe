var express = require("express");
var router = express.Router();
var check_login=require("../middlewares/check_login");
const NavigationController = require("../Contronller/Navigation_Controller");

router.get("/getListNavigationAdmin",  NavigationController.getNotificationsByAdmin);
router.post("/deleteNavigation/:notificationId", NavigationController.deleteNotificationAdmin);



module.exports = router;
