var express = require('express');
var router = express.Router();
var ManagerController = require('../Contronller/Manager_Controller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({storage:storage});

//brand
router.post('/brand',upload.fields([{name:'imageType'}]),ManagerController.addBrand);
router.get("/list-brand",ManagerController.BrandList);

router.get('/productlist',ManagerController.ProductList);
router.get('/edit-product',ManagerController.EditProduct);
router.get('/addproduct',ManagerController.AddProduct);

router.get('/vorcherlist',ManagerController.VorcherList);


router.get('/bannerlist',ManagerController.BannerList);
router.get('/banner-hide',ManagerController.Banner_Hide);
// router.get('/bannerlist',ManagerController.BannerList);
router.get('/add-banner',ManagerController.AddBanner);
router.post('/add-banner', upload.fields([{ name: 'image' }, { name: 'imageThumbnail' }]), ManagerController.AddBanner);
router.post('/hide-banner/:_id', ManagerController.HideBanner);


module.exports = router;