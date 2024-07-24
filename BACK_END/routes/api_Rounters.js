var express = require("express");
var router = express.Router();
var Auth_API = require("../Contronller/api/Auth_api");
var Users_API = require("../Contronller/api/User_api");
var Product_API = require("../Contronller/api/Product_api");

// Auth Routers
router.get("/signin", Auth_API.Sign);
router.post("/signin", Auth_API.Sign);

router.get("/register", Auth_API.Register_Mail);
router.post("/register", Auth_API.Register_Mail);

// User Routers
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

router.post("/sendotpmail", Users_API.Send_Otp_By_Mail);
router.post("/sendoforgot", Users_API.ResetPassword_Forgot);

router.get("/sendotp/:id", Users_API.ResetPassword_Mail);
router.post("/sendotp/:id", Users_API.ResetPassword_Mail);

// Address User
router.get("/getalladdress", Users_API.GetAllAddress);
router.get("/findaddress/:id", Users_API.FindAddress);
router.post("/addaddress", Users_API.Address_ADD);
router.post("/updateaddress/:addressID", Users_API.UpdateAddress);
router.delete("/deleteaddress/:addressID", Users_API.Address_DELETE);


//Type Rounter
router.get("/getalltype", Product_API.GetAllTyper);
router.get("/gettype/:id", Product_API.FindTyper);


router.post("/addtype", Product_API.AddTyper);
router.post("/updatetype/:id", Product_API.UpdateTyper);


router.delete("/deletetype/:id", Product_API.DeleteTyper);
router.get('/typeshoe/:id', Product_API.getTypeShoeById);
router.put('/typeshoe/:id', Product_API.updateTypeShoe);
router.delete('/typeshoe/:id', Product_API.deleteTypeShoe);



router.get("/getallproduct",Product_API.AllProduct);  


// Shoes Routers
router.get("/getallproduct", Product_API.AllProduct);

router.post("/addshoe", Product_API.ADD_Product);

router.get("/findproduct/:id", Product_API.FindProduct);

// "/findproduct/?name="
router.get("/findproduct", Product_API.FindByName);

router.post("/rateshoe", Product_API.rateShoe);


router.post("/addfavourite",Product_API.ADDFavourite);
router.post("/removefavourite",Product_API.RemoveFavourites);
router.get("/findfavourite/:id",Product_API.FindFavouritesByUserId);

// //  "Find by hiden"
// router.get("/FindProductsByTyperdId/:id", Product_API.FindProductsByBrandId);

router.get('/filterdata/:idTyper?/:sizeId?/:textColor?/:shoeId?', Product_API.findShoes_DATA);


// Banner
router.get("/banner-active", Product_API.getBanner);

module.exports = router;
