const { OderModel, OderDetailModel, ShoeModel } = require("../Models/DB_Shoes");

const getTop5BestSelling = async (req, res) => {
  try {
    const salesData = await OderDetailModel.aggregate([
      {
        $lookup: {
          from: 'Oder',
          localField: 'oderId',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      {
        $unwind: '$orderDetails'
      },
      {
        $match: {
          'orderDetails.status': 'Giao Thành Công'
        }
      },
      {
        $group: {
          _id: '$shoeId',
          totalQuantity: { $sum: { $toInt: '$quanlity' } }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $lookup: {
          from: 'Shoe',
          localField: '_id',
          foreignField: '_id',
          as: 'shoeDetails'
        }
      },
      {
        $unwind: '$shoeDetails'
      },
      {
        $project: {
          _id: 0,
          shoeId: '$_id',
          totalQuantity: 1,
          nameShoe: '$shoeDetails.nameShoe'
        }
      }
    ]);

    const top5BestSelling = salesData.slice(0, 5);

    res.json(top5BestSelling);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTop5WorstSelling = async (req, res) => {
  try {
    const salesData = await OderDetailModel.aggregate([
      {
        $lookup: {
          from: 'Oder',
          localField: 'oderId',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      {
        $unwind: '$orderDetails'
      },
      {
        $match: {
          'orderDetails.status': 'Giao Thành Công'
        }
      },
      {
        $group: {
          _id: '$shoeId',
          totalQuantity: { $sum: { $toInt: '$quanlity' } }
        }
      },
      {
        $sort: { totalQuantity: 1 }
      },
      {
        $lookup: {
          from: 'Shoe',
          localField: '_id',
          foreignField: '_id',
          as: 'shoeDetails'
        }
      },
      {
        $unwind: '$shoeDetails'
      },
      {
        $project: {
          _id: 0,
          shoeId: '$_id',
          totalQuantity: 1,
          nameShoe: '$shoeDetails.nameShoe'
        }
      }
    ]);
    const top5WorstSelling = salesData.slice(0, 5);

    res.json(top5WorstSelling);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};


module.exports = {
  getTop5WorstSelling,
  getTop5BestSelling
}