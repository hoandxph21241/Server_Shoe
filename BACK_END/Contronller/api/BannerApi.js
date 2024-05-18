const { BannerModel } = require("../../Models/DB_Shoes");

const addBanner = async (req, res) => {
  try {
    const { shoeId, thumbnail, image, title, description, type } = req.body;
    const banner = new BannerModel({
      shoeId,
      thumbnail,
      image,
      title,
      description,
      type,
    });
    await banner.save();
    return res.status(200).json({
      Success: true,
      message: "Banner added successfully!",
      banner,
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
const getBanner = async (req, res) => {
  try {
    const shoeID = req.params.shoeId;
    const banner = await BannerModel.findOne({ shoeID });
    if (!banner) {
      return res.status(404).json({
        Success: false,
        message: "Banner not found!",
      });
    }
    return res.status(200).json({
      Success: true,
      message: "Banner found successfully!",
      banner,
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
const removeBanner = async (req, res) => {
  try {
    const { bannerID } = req.body;
    await BannerModel.deleteOne({ _id: bannerID });
    return res.status(200).json({
      Success: true,
      message: "Banner removed successfully!",
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

module.exports = {
  addBanner,
  getBanner,
  removeBanner,
};
