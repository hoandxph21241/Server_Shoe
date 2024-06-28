var express = require("express");
var router = express.Router();
var Auth_API = require("../Contronller/api/Auth_api");
const address = require("../Contronller/api/AddressApi");
const favourites = require("../Contronller/api/FavouriteApi");
const discount = require("../Contronller/api/DiscountApi");
const review = require("../Contronller/api/ReviewApi");
const banner = require("../Contronller/api/BannerApi");
var Users_API = require("../Contronller/api/User_api");
var Product_API = require("../Contronller/api/Product_api");


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


//Brand Rounters
router.get("/getallbrand", Product_API.GetAllBrand);
router.get("/getbrand/:id", Product_API.FindBrand);

router.get("/addbrand", Product_API.AddBrand);
router.post("/addbrand", Product_API.AddBrand);

router.get("/updatebrand/:id", Product_API.UpdateBrand);
router.post("/updatebrand/:id", Product_API.UpdateBrand);

router.delete("/deletebrand/:id", Product_API.DeleteBrand);

// http://localhost:3000/api/addAddress
router.post("/addAddress", address.userAddAddress);
// http://localhost:3000/api/editAddress
router.post("/editAddress", address.userEditAddress)
// http://localhost:3000/api/deleteAddress
router.delete("/deleteAddress", address.userDeleteAddress)
// http://localhost:3000/api/userfavourite
router.post("/userfavourite", favourites.userFavourite);
// http://localhost:3000/api/addDiscount
// router.post("/addDiscount", discount.addDiscount);
// http://localhost:3000/api/checkDiscount
router.post("/checkDiscount", discount.checkDiscount);
// http://localhost:3000/api/addReview
router.post("/addReview", review.addReview);
// http://localhost:3000/api/getReviewShoe
router.get("/getReviewShoe", review.getReviewShoe);
// http://localhost:3000/api/editUserReview
router.post("/editUserReview", review.editUserReview);
// http://localhost:3000/api/deleteUserReview
router.delete("/deleteUserReview", review.deleteUserReview);
// http://localhost:3000/api/getBanner
router.post("/addBanner", banner.addBanner);
// http://localhost:3000/api/getBanner
router.get("/getBanner", banner.getBanner);
// http://localhost:3000/api/removeBanner
router.delete("/removeBanner", banner.removeBanner);



module.exports = router;
