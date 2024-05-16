var express = require('express');
var router = express.Router();
var ManagerController = require('../Contronller/Manager_Controller');

router.get('/productlist',ManagerController.ProductList);

router.get('/vorcherlist',ManagerController.VorcherList);

router.get('/bannerlist',ManagerController.BannerList);

module.exports = router;