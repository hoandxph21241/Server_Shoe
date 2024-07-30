const express = require("express");
const router = express.Router();
const userController = require("../Contronller/User_Controllerr");

router.get("/userList", userController.listUsers);
router.get("/userDetail/:userId", userController.userDetail);
router.get("/findUsers/:keywork", userController.findUsers);
router.get("/statusOrder/:userId/:orderId/:status", userController.statusOrder);

module.exports = router;
