var express = require("express");
var router = express.Router();
var Auth_API = require("../Contronller/api/Auth_api");
var Users_API = require("../Contronller/api/User_api");

// Auth Rounters
router.get("/signin", Auth_API.Sign);
router.post("/signin", Auth_API.Sign);

router.get("/register", Auth_API.Register_Mail);
router.post("/register", Auth_API.Register_Mail);


// User Rounters
router.get("/getalluser", Users_API.GetAllUser);
router.post("/getalluser", Users_API.GetAllUser);

router.get("/finduser/:id", Users_API.FindUser);
router.post("/finduser/:id", Users_API.FindUser);

router.get("/updateuser/:id", Users_API.UpdateUser);
router.post("/updateuser/:id", Users_API.UpdateUser);

router.get("/resetpassword/:id", Users_API.ResetPassword);
router.post("/resetpassword/:id", Users_API.ResetPassword);

router.get("/sendotp/:id", Users_API.ResetPassword_Mail);
router.post("/sendotp/:id", Users_API.ResetPassword_Mail);


module.exports = router;
