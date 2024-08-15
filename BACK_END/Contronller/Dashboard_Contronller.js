const {
  OrderModel,
  OderDetailModel,
  ShoeModel,
  StorageShoeModel,
} = require("../Models/DB_Shoes");

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
        await getRevenueBetweenDates(start, end, res);
        break;
      case "getBestSellingProduct":
        await getBestSellingProduct(start, end, res);
        break;
      case "getBestSellingDay":
        await getBestSellingDay(start, end, res);
        break;
      case "leastSellingProducts":
        await leastSellingProducts(start, end, res);
        break;
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

// Hàm xử lý ngày bán chạy nhất
async function getBestSellingDay(start, end, res) {
  end.setHours(23, 59, 59, 999);

  try {
    const matchedOrders = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: "Đã nhận hàng",
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateOrder" },
          },
          total: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          totalRevenue: { $sum: "$total" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalRevenue: 1,
        },
      },
    ]);
    console.log(matchedOrders);
    return res.json({ matchedOrders });

    if (matchedOrders.length === 0) {
      return res.json({ message: "No sales found in the given date range" });
    }

    // const bestSellingDay = matchedOrders[0]._id;
    // console.log(bestSellingDay);
    // const bestSellingShoe = await getBestSellingShoeByDate(bestSellingDay);

    // return res.json({ matchedOrders, bestSellingShoe });
  } catch (error) {
    console.error("Error fetching best-selling day:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Hàm lấy sản phẩm bán chạy nhất theo ngày
async function getBestSellingShoeByDate(dateString) {
  const start = new Date(dateString);
  const end = new Date(dateString);
  end.setHours(23, 59, 59, 999);

  try {
    const orders = await OrderModel.find({
      dateOrder: { $gte: start, $lte: end },
      status: "Đã nhận hàng",
    }).select("_id");

    if (orders.length === 0) {
      return {
        message: "No orders found on this date",
        bestSellingShoes: [],
        totalRevenue: 0,
      };
    }

    const orderDetails = await OderDetailModel.aggregate([
      {
        $match: { orderId: { $in: orders.map((order) => order._id) } },
      },
      {
        $group: {
          _id: "$shoeId",
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { totalQuantity: -1 }, // Sắp xếp giảm dần theo số lượng bán
      },
    ]);

    if (orderDetails.length === 0) {
      return {
        message: "No order details found for the orders on this date",
        bestSellingShoes: [],
        totalRevenue: 0,
      };
    }

    const bestSellingShoeIds = orderDetails.map((detail) => detail._id);

    const bestSellingShoes = await ShoeModel.find({
      _id: { $in: bestSellingShoeIds },
    }).select("name thumbnail sellPrice");

    const totalRevenue = orderDetails.reduce((acc, detail) => {
      const shoe = bestSellingShoes.find((shoe) => shoe._id.equals(detail._id));
      if (shoe) {
        acc += shoe.sellPrice * detail.totalQuantity;
      }
      return acc;
    }, 0);

    return {
      message: "Success",
      bestSellingShoes,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching best-selling shoe:", error);
    throw error;
  }
}

// Hàm lấy sản phẩm bán ế nhất
async function leastSellingProducts(start, end, res) {
  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: {
            $gte: start,
            $lte: end,
          },
          status: "Đã nhận hàng",
        },
      },
      {
        $lookup: {
          from: "OrderDetailld",
          localField: "_id",
          foreignField: "orderId",
          as: "orderDetails",
        },
      },
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: "$orderDetails.shoeId",
          totalSold: { $sum: "$orderDetails.quantity" },
        },
      },
      {
        $sort: { totalSold: 1 },
      },
      {
        $lookup: {
          from: "Shoe",
          localField: "_id",
          foreignField: "_id",
          as: "shoeDetails",
        },
      },
      { $unwind: "$shoeDetails" },
      {
        $project: {
          _id: 0,
          shoeId: "$_id",
          name: "$shoeDetails.name",
          thumbnail: "$shoeDetails.thumbnail",
          totalSold: 1,
          sellQuanlityAll: "$shoeDetails.sellQuanlityAll",
        },
      },
      {
        $sort: { sellQuanlityAll: 1 },
      },
    ]);
    console.log(res);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching least-selling products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Hàm lấy sản phẩm bán chạy nhất
async function getBestSellingProduct(start, end, res) {
  end.setHours(23, 59, 59, 999);

  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: "Đã nhận hàng",
        },
      },
      {
        $lookup: {
          from: "OrderDetailld",
          localField: "_id",
          foreignField: "orderId",
          as: "orderDetails",
        },
      },
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: "$orderDetails.shoeId",
          totalSold: { $sum: "$orderDetails.quantity" },
        },
      },
      {
        $lookup: {
          from: "Shoe",
          localField: "_id",
          foreignField: "_id",
          as: "shoeDetails",
        },
      },
      { $unwind: "$shoeDetails" },
      {
        $project: {
          _id: 0,
          shoeId: "$_id",
          name: "$shoeDetails.name",
          thumbnail: "$shoeDetails.thumbnail",
          totalSold: 1,
          price: "$shoeDetails.sellPrice",
          totalRevenue: { $multiply: ["$totalSold", "$shoeDetails.price"] },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
    ]);

    return res.json(result);
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getLowStockProducts(res) {
  try {
    const result = await StorageShoeModel.aggregate([
      {
        $unwind: "$sizeShoe",
      },
      {
        $match: {
          "sizeShoe.quantity": { $lt: 5 },
        },
      },
      {
        $lookup: {
          from: "Shoe",
          localField: "shoeId",
          foreignField: "_id",
          as: "shoeDetails",
        },
      },
      {
        $unwind: "$shoeDetails",
      },
      {
        $lookup: {
          from: "ColorShoe",
          localField: "colorShoe",
          foreignField: "_id",
          as: "colorDetails",
        },
      },
      {
        $unwind: "$colorDetails",
      },
      {
        $lookup: {
          from: "SizeShoe",
          localField: "sizeShoe.sizeId",
          foreignField: "_id",
          as: "sizeDetails",
        },
      },
      {
        $unwind: "$sizeDetails",
      },
      {
        $group: {
          _id: {
            shoeId: "$shoeId",
            colorId: "$colorShoe",
            sizeId: "$sizeShoe.sizeId",
          },
          name: { $first: "$shoeDetails.name" },
          thumbnail: { $first: "$shoeDetails.thumbnail" },
          color: { $first: "$colorDetails.textColor" },
          size: { $first: "$sizeDetails.size" },
          quantity: { $first: "$sizeShoe.quantity" },
        },
      },
      {
        $sort: { quantity: 1 },
      },
    ]);

    return res.json(result);
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
}
// Hàm tính tổng doanh thu
async function getRevenueBetweenDates(start, end, res) {
  console.log(start, end);
  end.setHours(23, 59, 59, 999);

  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: "Đã nhận hàng",
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateOrder" },
          },
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const status = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const revenueResult = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: "Đã nhận hàng",
        },
      },
      {
        $group: { _id: null, totalRevenue: { $sum: "$total" } },
      },
    ]);
    const costResult = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: {
            $gte: start,
            $lte: end,
          },
          status: "Đã nhận hàng",
        },
      },
      {
        $lookup: {
          from: "OrderDetailld",
          localField: "_id",
          foreignField: "orderId",
          as: "orderDetails",
        },
      },
      {
        $unwind: "$orderDetails",
      },
      {
        $lookup: {
          from: "Shoe",
          localField: "orderDetails.shoeId",
          foreignField: "_id",
          as: "shoeDetails",
        },
      },
      {
        $unwind: "$shoeDetails",
      },
      {
        $group: {
          _id: null,
          totalCost: {
            $sum: {
              $multiply: ["$orderDetails.quantity", "$shoeDetails.importPrice"],
            },
          },
        },
      },
    ]);
    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;
    const totalCost = costResult[0] ? costResult[0].totalCost : 0;

    const totalProfit = totalRevenue - totalCost;
    return res.json({ totalRevenue, totalProfit, result, status });
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
