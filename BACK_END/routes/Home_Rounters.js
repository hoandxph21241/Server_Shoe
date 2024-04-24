var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Home_Contronller");

router.get("", Contronlers.Home);


module.exports = router;
