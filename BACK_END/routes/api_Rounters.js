var express = require("express");
var router = express.Router();
var Auth_API = require("../Contronller/api/Auth_api");

router.get("/signin", Auth_API.Sign);
router.post("/signin", Auth_API.Sign);

router.get("/register", Auth_API.Register);
router.post("/register", Auth_API.Register);

module.exports = router;
