var express = require("express");
var router = express.Router();
const IfUserController = require("../Contronller/IFUser");
const { requireAdmin } = require("../middlewares/check_login");


// router.get("/address", requireAdmin, IfUserController.getAddressByUser);
// router.get("/favorites", requireAdmin, IfUserController.getFavoritesByUser);
module.exports = router;
