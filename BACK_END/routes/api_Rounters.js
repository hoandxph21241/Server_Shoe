var express = require("express");
var router = express.Router();
var Auth_API = require("../Contronller/api/Auth_api");
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


////////////////////////////////////////////////////
router.get("/resetpassword/:id", Users_API.ResetPassword);
router.post("/resetpassword/:id", Users_API.ResetPassword);
///////////////////////////////////////////////////


router.get("/sendotp/:id", Users_API.ResetPassword_Mail);
router.post("/sendotp/:id", Users_API.ResetPassword_Mail);



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

// //  "Find by hiden"
// router.get("/findproductbyidbrand/:id", Product_API.FindProductsByBrandId);

router.get('/filterdata/:idBrand?/:sizeId?/:textColor?/:shoeId?', Product_API.findShoes_DATA);


router.post('/addorder',Product_API.AddOrder);

module.exports = router; 
