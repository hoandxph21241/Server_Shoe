var express = require('express');
var router = express.Router();
var ManagerController = require('../Contronller/Manager_Controller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./upload');
    },
    filename:function(req,file,cb){
        cb(null,Date.now() + '-' + file.originalname);
    },
});

const upload = multer({storage:storage});

router.get('/productlist',ManagerController.ProductList);
router.get('/edit-product',ManagerController.EditProduct);
router.get('/addproduct',ManagerController.AddProduct);

router.get('/vorcherlist',ManagerController.VorcherList);


router.get('/bannerlist',ManagerController.BannerList);
// router.get('/bannerlist',ManagerController.BannerList);
router.get('/add-banner',ManagerController.AddBanner);
router.post('/add-banner', upload.fields([{ name: 'image' }, { name: 'imageThumbnail' }]), ManagerController.AddBanner);
router.post('/hide-banner/:_id', ManagerController.HideBanner);
module.exports = router;