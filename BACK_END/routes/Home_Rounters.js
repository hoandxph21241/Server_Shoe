var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Home_Contronller");

router.get("", Contronlers.Home);

router.get("/homes", Contronlers.Homes);

router.get("/homess", Contronlers.Homess);


module.exports = router;
