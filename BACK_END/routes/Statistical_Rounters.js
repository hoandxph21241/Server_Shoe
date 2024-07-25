var express = require("express");
var router = express.Router();
const statisticalController = require("../Contronller/Statistical_Controller");


router.get("/top5BestSelling", statisticalController.getTop5BestSelling);
router.get("/top5WorstSelling", statisticalController.getTop5WorstSelling);