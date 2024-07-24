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

router.get("/signout", Auth_API.SignOut);
router.post("/signout", Auth_API.SignOut);

// User Rounters
router.get("/getalluser", Users_API.GetAllUser);
router.post("/getalluser", Users_API.GetAllUser);

router.get("/finduser/:id", Users_API.FindUser);
router.post("/finduser/:id", Users_API.FindUser);

// router.get("/updateuser/:id", Users_API.UpdateUser);
// router.post("/updateuser/:id", Users_API.UpdateUser);

router.get("/updateuser/:id",Users_API.uploadImage, Users_API.UpdateUser);
router.post("/updateuser/:id",Users_API.uploadImage, Users_API.UpdateUser);

////////////////////////////////////////////////////
// router.get("/resetpassword/:id", Users_API.ResetPassword);
// router.post("/resetpassword/:id", Users_API.ResetPassword);


router.post("/resetpasswordiduser", Users_API.ResetPassword_ID);
///////////////////////////////////////////////////

router.post("/sendotpmail", Users_API.Send_Otp_By_Mail);
router.post("/sendoforgot", Users_API.ResetPassword_Forgot);


router.get("/sendotp/:id", Users_API.ResetPassword_Mail);
router.post("/sendotp/:id", Users_API.ResetPassword_Mail);

//Address User
router.get("/getalladdress", Users_API.GetAllAddress);
router.get("/findaddress/:id", Users_API.FindAddress);
router.post("/addaddress", Users_API.Address_ADD);
router.post("/updateaddress/:addressID", Users_API.UpdateAddress);
router.delete("/deleteaddress/:addressID", Users_API.Address_DELETE);



//Type Rounter
router.get("/getalltype", Product_API.GetAllBrand);
router.get("/gettype/:id", Product_API.FindBrand);

router.post("/addtype", Product_API.AddBrand);
router.post("/updatetype/:id", Product_API.UpdateBrand);

router.delete("/deletetype/:id", Product_API.DeleteBrand);
router.get('/typeshoe/:id', Product_API.getTypeShoeById);
router.put('/typeshoe/:id', Product_API.updateTypeShoe);
router.delete('/typeshoe/:id', Product_API.deleteTypeShoe);



//Shoes Rounter
router.get("/getallproduct",Product_API.AllProduct);  

router.post("/addshoe",Product_API.ADD_Product);

router.get("/findproduct/:id",Product_API.FindProduct);

//  "/findproduct/?name="
router.get("/findproduct",Product_API.FindByName);


router.post("/rateshoe",Product_API.rateShoe);


router.post("/addfavourite",Product_API.ADDFavourite);
router.post("/removefavourite",Product_API.RemoveFavourites);
router.get("/findfavourite/:id",Product_API.FindFavouritesByUserId);

// //  "Find by hiden"
// router.get("/findproductbyidbrand/:id", Product_API.FindProductsByBrandId);

router.get('/filterdata/:idBrand?/:sizeId?/:textColor?/:shoeId?', Product_API.findShoes_DATA);


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
