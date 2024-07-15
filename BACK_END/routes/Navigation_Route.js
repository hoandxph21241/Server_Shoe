var express = require("express");
var router = express.Router();
var check_login=require("../middlewares/check_login");
const NavigationApi = require("../Contronller/api/Navigation_api");

router.get("/getListNavigationUser/:userId",  NavigationApi.getNotificationsByUser);
router.post("/deleteNavigation/:notificationId", NavigationApi.deleteNotificationUser);


module.exports = router;
