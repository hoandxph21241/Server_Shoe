const { ReviewModel } = require("../../Models/DB_Shoes");

const addReview = async (req, res) => {
  try {
    const { userID, shoeId, rating, comment } = req.body;
    const review = new ReviewModel({
      userID,
      shoeId,
      rating,
      comment,
      date: new Date(date),
    });
    await review.save();
    return res.status(200).json({
      Success: true,
      message: "Review added successfully!",
      review,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      Success: false,
      message: "The server is experiencing an error!",
      error: err,
    });
  }
};
const getReviewShoe = async (req, res) => {
  try {
    const shoeId = req.query.shoeId;
    const review = await ReviewModel.findById(shoeId);
    if (!review) {
      return res.status(404).json({
        Success: false,
        message: "Review not found!",
      });
    }
    return res.status(200).json({
      Success: true,
      message: "Review found successfully!",
      review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Success: false,
      message: "The server is experiencing an error!",
      error: error,
    });
  }
};
const editUserReview = async (req, res) => {
  try {
    const { userID, shoeId, rating, comment } = req.body;
    const review = await ReviewModel.findOne({ userID, shoeId });
    if (!review) {
      return res.status(404).json({
        Success: false,
        message: "Review not found!",
      });
    }
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    return res.status(200).json({
      Success: true,
      message: "Review updated successfully!",
      review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Success: false,
      message: "The server is experiencing an error!",
      error: error,
    });
  }
};
const deleteUserReview = async (req, res) => {
  try {
    const { userID, shoeId } = req.body;
    const review = await ReviewModel.findOne({ userID, shoeId });
    if (!review) {
      return res.status(404).json({
        Success: false,
        message: "Review not found!",
      });
    }
    await review.remove();
    return res.status(200).json({
      Success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Success: false,
      message: "The server is experiencing an error!",
      error: error,
    });
  }
};
module.exports = {
  addReview,
    getReviewShoe,
    editUserReview,
    deleteUserReview
};
