const {
  OrderModel,
  OderDetailModel,
  ShoeModel,
  StorageShoeModel,
} = require("../Models/DB_Shoes");
exports.getBestSellingProduct = async function (start, end, res) {
  end.setHours(23, 59, 59, 999);

  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: 0,
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
      {
        $limit: 5, 
      },
    ]);
    console.log(result);
    

    return res.json(result);
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getRevenueBetweenDates = async function (start, end, res) {
  end.setHours(23, 59, 59, 999);

  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: { $gte: start, $lte: end },
          status: 0,
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
        $project: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateOrder" },
          },
          totalRevenue: "$total",
          totalCost: {
            $multiply: ["$orderDetails.quantity", "$shoeDetails.importPrice"],
          },
        },
      },
      {
        $group: {
          _id: "$date",
          totalRevenue: { $sum: "$totalRevenue" },
          totalCost: { $sum: "$totalCost" },
          orderCount: { $sum: 1 }, 
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: { $subtract: ["$totalRevenue", "$totalCost"] },
          orderCount: 1, 
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    // console.log(result);


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
        $project: {
          _id: 0,
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "Đã nhận hàng" },
                { case: { $eq: ["$_id", 1] }, then: "Chờ xác nhận" },
                { case: { $eq: ["$_id", 2] }, then: "Chuẩn bị hàng" },
                { case: { $eq: ["$_id", 3] }, then: "Chờ bàn giao đơn vị vận chuyển" },
                { case: { $eq: ["$_id", 4] }, then: "Đang giao hàng" },
                { case: { $eq: ["$_id", 5] }, then: "Giao hàng thành công" },
                { case: { $eq: ["$_id", 6] }, then: "Hủy đơn" },
                { case: { $eq: ["$_id", 7] }, then: "Hoàn đơn" },
              ],
              default: "Không xác định",
            },
          },
          count: 1,
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
          status: 0,
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
          status: 0,
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
    // console.log(totalRevenue, totalProfit, totalCost, result, status);

    return res.json({ totalRevenue, totalCost, totalProfit, result, status });

  } catch (error) {
    console.error("Error fetching revenue between dates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.leastSellingProducts = async function (start, end, res) {
  try {
    const soldProducts = await OrderModel.aggregate([
      {
        $match: {
          dateOrder: {
            $gte: start,
            $lte: end,
          },
          status: 0,
        },
      },
      {
        $lookup: {
          from: "OrderDetail",
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
    ]);

    const soldProductIds = soldProducts.map(product => product._id);

    const result = await ShoeModel.aggregate([
      {
        $match: {
          _id: { $nin: soldProductIds }
        },
      },
      {
        $project: {
          _id: 0,
          shoeId: "$_id",
          name: 1,
          thumbnail: 1,
          sellQuanlityAll: 1,
        },
      },
      {
        $sort: { sellQuanlityAll: 1 }, 
      },
      {
        $limit: 5,
      },
    ]);

    console.log(result);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching least-selling products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getLowStockProducts = async function (res) {
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
};
