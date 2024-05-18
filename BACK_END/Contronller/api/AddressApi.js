const { AddressModel, UserModel } = require("../../Models/DB_Shoes");

const userAddAddress = async function (req, res) {
  try {
    const { idUser, name, address, phone } = req.body;
    if (!idUser || !name || !address || !phone) {
      return res.status(400).json({
        Success: false,
        message: "Error: Missing required information",
      });
    }
    const user = await UserModel.findById(idUser);
    if (!user) {
      return res
        .status(404)
        .json({ Success: false, message: "User not found!" });
    }
    const newAddress = new AddressModel({
      nameAddress: name,
      address: address,
      phoneNumber: phone,
      userId: idUser,
    });
    newAddress.save();
    return res.status(200).json({
      Success: true,
      message: "Address added successfully!",
      data: newAddress,
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
const userEditAddress = async function (req, res) {
  try {
    const { idUser, idAddress, name, address, phone } = req.body;

    if (!idUser || !idAddress) {
      return res.status(400).json({
        Success: false,
        message: "Error: Missing required information",
      });
    }
    if (!name && !address && !phone) {
      return res
        .status(204)
        .json({ Success: true, message: "There's nothing to fix`" });
    }
    const user = await UserModel.findById(idUser);
    if (!user) {
      return res
        .status(404)
        .json({ Success: false, message: "User not found!" });
    }
    const data = await AddressModel.findById(idAddress);
    if (!data) {
      return res
        .status(400)
        .json({ Success: false, message: "Address not found!" });
    }
    data.address = address || data.address;
    data.nameAddress = name || data.nameAddress;
    data.phoneNumber = phone || data.phoneNumber;
    await data.save();
    return res.status(200).json({
      Success: true,
      message: "Successfully edited the address!",
      data: data,
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
const userDeleteAddress = async function (req, res) {
  try {
    const { idUser, idAddress } = req.body;
    if (!idUser || !idAddress) {
      return res.status(400).json({
        Success: false,
        message: "Error: Missing required information",
      });
    }
    const user = await UserModel.findById(idUser);
    if (!user) {
      return res
        .status(404)
        .json({ Success: false, message: "User not found!" });
    }
    const data = await AddressModel.findByIdAndDelete( idAddress );

    if (!data) {
      return res
        .status(404)
        .json({ Success: false, message: "Address not found!" });
    }
    return res.status(200).json({
      Success: true,
      message: "Address deleted successfully!",
      data: data,
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
  userAddAddress,
  userEditAddress,
  userDeleteAddress,
};
