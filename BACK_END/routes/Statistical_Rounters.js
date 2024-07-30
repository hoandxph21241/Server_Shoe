var express = require("express");
var router = express.Router();
const statisticalController = require("../Contronller/Statistical_Controller");

//GET /api/shoes/top5best?startDate=2023-01-01&endDate=2023-12-31

router.get("/top5BestSelling", statisticalController.getTop5BestSelling);
router.get("/top5WorstSelling", statisticalController.getTop5WorstSelling);
router.get("/best-selling-products", statisticalController.BestSellingShoes);
router.get("/low-stock-products", statisticalController.LowStockShoes);
module.exports = router;