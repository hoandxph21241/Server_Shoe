const {
  getBestSellingProduct,
  getRevenueBetweenDates,
  leastSellingProducts,
  getLowStockProducts,
} = require('../Contronller/statisticsController');

exports.Dashboard = async (req, res, next) => {
  res.render("dashboard/viewDashboard.ejs");
};

exports.statistics = async (req, res) => {
  const { queryType, startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    switch (queryType) {
      case "revenue":
        //Thóng kê
        await getRevenueBetweenDates(start, end, res);
        break;
      case "getBestSellingProduct":
        //Sản phẩm bán chạy nhất
        await getBestSellingProduct(start, end, res);
        break;
       //sản phẩm  bán  ế nhất
      case "leastSellingProducts":
        await leastSellingProducts(start, end, res);
        break;
      // Sản phẩm gẩn hết hàng
      case "lowStock":
        await getLowStockProducts(res);
        break;

      default:
        return res.status(400).json({ error: "Invalid query type" });
    }
  } catch (error) {
    console.error("Error in /statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


