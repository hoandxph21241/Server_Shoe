var express = require("express");
var router = express.Router();
var Contronlers = require("../Contronller/Auth_Contronller");
var check_login=require("../middlewares/check_login");


router.get('/',check_login.yeu_cau_dang_nhap, function(req, res, next) {
    let uLogin =req.session.userLogin;
    console.log("Thông tin đăng nhập:");
    console.log(req.session.userLogin);
    console.log("+---------------+")
    res.send(uLogin);
});

router.get("/register", Contronlers.Register);
router.post("/register", Contronlers.Register);

router.get("/signin", Contronlers.SignIn);
router.post("/signin", Contronlers.SignIn);

router.get('/signout', Contronlers.SignOut);
router.post('/signout', Contronlers.SignOut);

router.get('/userlist',Contronlers.UserList);
router.get('/profile/:userId', Contronlers.ProfileUser);

module.exports = router;
