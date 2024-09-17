var Model = require("../../Models/DB_Shoes");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

exports.GetAllUser = async (req, res, next) => {
  msg = "Danh sach Du Lieu Nguoi Dung";

  try {
    let list = await Model.UserModel.find();
    console.log(list);
    //   return  res.status(200).json({msg: 'lấy địa chỉ thành công', data: list});
    return res.status(200).json(list);
    // Log List
  } catch (error) {
    return res.status(204).json({ msg: "không có dữ liệu" + error.message });
  }

  // res.status(200).json({msg});
};

exports.FindUser = async (req, res, next) => {
  try {
    let user = await Model.UserModel.findById(req.params.id);
    if (user) {
    
      const responseUser = user.toObject();
      if (responseUser.imageAccount) {
        responseUser.imageAccount = {
          "$binary": {
            "base64": responseUser.imageAccount.toString('base64'),
            "subType": "00"
          }
        };
      }


      return res.status(200).json({
        success: true,
        message: "Tìm thấy thông tin người dùng thành công",
        user: responseUser,
      });
    } else {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy người dùng với id này" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }

  // res.status(200).json({msg});
};

// exports.UpdateUser = async (req, res, next) => {
//   let imageAccount = req.body.imageAccount;
//   let phoneNumber = req.body.phoneNumber;
//   let userName = req.body.userName;
//   let fullName = req.body.fullName;
//   let grender = req.body.grender;
//   let birthday = req.body.birthday;
//   try {
//     let user = await Model.UserModel.findById(req.params.id);
//     if (user) {
//       const existingUser = await Model.UserModel.findOne({ nameAccount });
//       if (existingUser && existingUser.id !== req.params.id) {
//         return res.status(400).json({
//           success: false,
//           message: "Gmail đã tồn tại dưới tài khoản khác",
//         });
//       }

//       user.imageAccount = imageAccount || user.imageAccount;
//       user.phoneNumber = phoneNumber || user.phoneNumber;
//       user.fullName = fullName || user.fullName;
//       user.nameAccount = nameAccount || user.nameAccount;
//       user.gmail = nameAccount || user.nameAccount;
//       user.birthday = birthday || user.birthday;
//       user.grender = grender === "0" ? "Female" : "Male";

//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message: "Cập nhật thông tin người dùng thành công",
//         user: user,
//       });
//     } else {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy người dùng với id này",
//       });
//     }
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
//   }
// };

const multer = require("multer");
const upload = multer({ dest: "uploads/images/" }); 
const fs = require('fs');
exports.UpdateUser = async (req, res, next) => {
  const imageAccount = req.body.imageAccount;
  const phoneNumber = req.body.phoneNumber;
  const userName = req.body.userName;
  const fullName = req.body.fullName;
  const nameAccount = req.body.nameAccount;
  const birthday = req.body.birthday;
  const grender = req.body.grender;

  try {
    const user = await Model.UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với id này",
      });
    }

    const existingUser = await Model.UserModel.findOne({ nameAccount });
    if (existingUser && existingUser.id !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Gmail đã tồn tại dưới tài khoản khác",
      });
    }
    user.imageAccount = imageAccount || user.imageAccount;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.fullName = fullName || user.fullName;
    user.userName = userName || user.userName;
    user.nameAccount = nameAccount || user.nameAccount;
    user.gmail = nameAccount || user.nameAccount;
    user.birthday = birthday || user.birthday;
    user.grender = grender === "0" ? "Female" : "Male";

    if (req.file) {
      const imgData = fs.readFileSync(req.file.path);
      user.imageAccount = imgData;
      fs.unlinkSync(req.file.path);
    }

    const responseUser = user.toObject();
    if (responseUser.imageAccount) {
      responseUser.imageAccount = {
        "$binary": {
          "base64": responseUser.imageAccount.toString('base64'),
          "subType": "00"
        }
      };
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      user: responseUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra: " + error.message,
    });
  }
};

exports.uploadImage = upload.single("imageAccount");



// exports.ResetPassword = async (req, res, next) => {
//   let userId = req.params.id;
//   let otp = req.body.otp;
//   let newPassword = req.body.newPassword;

//   try {
//     let user = await Model.UserModel.findById(userId);
//     if (user) {
//       if (user.otp === otp) {
//         user.namePassword = newPassword;
//         user.otp = null;
//         await user.save();

//         return res.status(200).json({
//           success: true,
//           message: "Đặt lại mật khẩu thành công",
//           user: user,
//         });
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "OTP không chính xác",
//         });
//       }
//     } else {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy người dùng hoặc tên tài khoản không khớp",
//       });
//     }
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
//   }
// };

// exports.UpdateUser = async (req, res, next) => {
//   const {
//     imageAccount,
//     phoneNumber,
//     nameAccount,
//     fullName,
//     grender,
//     birthDay,
//   } = req.body;

//   try {
//     const user = await Model.UserModel.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy người dùng với id này",
//       });
//     }

//     const existingUser = await Model.UserModel.findOne({ nameAccount });
//     if (existingUser && existingUser.id !== req.params.id) {
//       return res.status(400).json({
//         success: false,
//         message: "Gmail đã tồn tại dưới tài khoản khác",
//       });
//     }

//     user.imageAccount = imageAccount || user.imageAccount;
//     user.phoneNumber = phoneNumber || user.phoneNumber;
//     user.fullName = fullName || user.fullName;
//     user.nameAccount = nameAccount || user.nameAccount;
//     user.gmail = nameAccount || user.nameAccount;
//     user.birthday = birthDay || user.birthday;
//     user.grender = grender === "0" ? "Female" : "Male";

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Cập nhật thông tin người dùng thành công",
//       user: user,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Có lỗi xảy ra: " + error.message,
//     });
//   }
// };
exports.ResetPassword_ID = async (req, res, next) => {
  let userId = req.body.userId;
  let newPassword = req.body.newPassword;
  try {
    let user = await Model.UserModel.findById(userId);
    if (user) {
      if (user.namePassword === newPassword) {
        return res.status(200).json({
          success: false,
          message: "Mật Khẩu Đang Trùng Với Mật Khẩu Cũ",
        });
      }
      user.namePassword = newPassword;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Đặt lại mật khẩu thành công",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng hoặc tên tài khoản không khớp",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
  }
};

exports.Send_Otp_By_Mail = async (req, res) => {
  const nameAccount = req.body.nameAccount;
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;
    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "hzdev231@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "hzdev231@gmail.com",
      to: nameAccount,
      subject: "Mã OTP của bạn",
      text: `Mã OTP của bạn là: ${otp}`,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + result.response);

    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user) {
      if (user.nameAccount === nameAccount) {
        user.otp = otp;
        await user.save();
      }
    }

    res.json({ success: true, message: "Mã OTP đã được gửi",userId:user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi gửi email" });
  }
};

exports.ResetPassword_Forgot = async (req, res, next) => {
  let nameAccount = req.body.nameAccount;
  let otp = req.body.otp;
  try {
    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user) {
      if (user.otp === otp) {
        user.otp = null;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Xác Nhận thành công",
          user: user,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "OTP không chính xác",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng hoặc tên tài khoản không khớp",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
  }
};

exports.ResetPassword_Mail = async (req, res, next) => {
  let userId = req.params.id;

  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  try {
    let user = await Model.UserModel.findById(userId);
    if (user) {
      const newOtp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
      user.otp = newOtp;

      const accessToken = await oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "hzdev231@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      let mailOptions = {
        from: "hzdev231@gmail.com",
        to: user.nameAccount,
        subject: "Xác nhận đặt lại mật khẩu",
        text: `Mã OTP mới của bạn là: ${newOtp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      await user.save();
      return res.status(200).json({
        success: true,
        message: "Gửi OTP thành công",
        user: user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
  }
};

exports.Address_ADD = async (req, res, next) => {
  let nameAddress = req.body.nameAddress;
  let detailAddress = req.body.detailAddress;
  let latitude = req.body.latitude;
  let longitude = req.body.longitude;
  let userId = req.body.userId;
  let phoneNumber= req.body.phoneNumber;
  let fullName= req.body.fullName;
  let addressOld = await Model.AddressModel.findOne({userId});
  try {
    if (!addressOld) {
    } else {
      if (
        addressOld.longitude === longitude &&
        addressOld.latitude === latitude
      ) {
        res.json({ success: false, message: "Vị Trí đã tồn tại" });
        return;
      }

      if (
        addressOld.nameAddress === nameAddress &&
        addressOld.detailAddress === detailAddress
      ) {
        res.json({ success: false, message: "Tên Địa Chỉ đã tồn tại" });
        return;
      }
    }
    if (!nameAddress || !detailAddress || !latitude || !longitude || !userId || !phoneNumber || !fullName) {
      res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }

    let objSP = new Model.AddressModel({
      nameAddress: req.body.nameAddress,
      detailAddress: req.body.detailAddress,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      userId: req.body.userId,
      phoneNumber:req.body.phoneNumber,
      fullName:req.body.fullName
    });
    let new_Ur = await objSP.save();
    res.json({ success: true, message: "Đăng ký thành công",new_Ur });
  } catch (error) {
    msg = "Lỗi " + error.message;
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
exports.GetAllAddress = async (req, res, next) => {
  msg = "Danh sach Du Lieu";
  try {
    let list = await Model.AddressModel.find();
    console.log(list);
    return res.status(200).json(list);
  } catch (error) {
    return res.status(204).json({ msg: "không có dữ liệu" + error.message });
  }
};


exports.FindAddress = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const allAddresses = await Model.AddressModel.find().populate('userId').lean();
    const matchingAddresses = allAddresses.filter(address => {
      if (address.userId && address.userId._id.toString() === userId) {
        delete address.userId;
        return true;
      }
      return false;
    });

    if (matchingAddresses.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Tìm thấy các địa chỉ của User",
        addresses: matchingAddresses
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ"
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra: " + error.message
    });
  }
};


// exports.FindAddress = async (req, res, next) => {
//   try {
//     let address = await Model.AddressModel.findById(req.params.id);
//     if (address) {
//       const userId = address.userId;
//       return res.status(200).json({
//         success: true,
//         message: "Tìm thấy thông tin địa chỉ người dùng thành công",
//         address: address,
//         userId: userId,
//       });
//     } else {
//       return res.status(404).json({ msg: "Không tìm thấy địa chỉ với id này" });
//     }
//   } catch (error) {
//     return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
//   }
// };



// exports.UpdateAddress = async (req, res, next) => {
//   let nameAddress = req.body.nameAddress;
//   let detailAddress = req.body.detailAddress;
//   let latitude = req.body.latitude;
//   let longitude = req.body.longitude;
//   let permission = req.body.permission;
//   let addressID = req.params.addressID;

//   try {
//     const addressToUpdate = await Model.AddressModel.findById(addressID);
//     if (!addressToUpdate) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy địa chỉ.",
//       });
//     }
//     const userID = addressToUpdate.userId; 

//     if (permission === "0") {
//       await Model.AddressModel.updateMany(
//         { userId: userID, _id: { $ne: addressID } },
//         { $set: { permission: "1" } }
//       );
//     }
//     addressToUpdate.nameAddress = nameAddress || addressToUpdate.nameAddress;
//     addressToUpdate.detailAddress = detailAddress || addressToUpdate.detailAddress;
//     addressToUpdate.latitude = latitude || addressToUpdate.latitude;
//     addressToUpdate.longitude = longitude || addressToUpdate.longitude;
//     addressToUpdate.permission = permission === "0" ? "Default" : "No Default";

//     if (!detailAddress || !latitude || !longitude) {
//       return res.json({
//         success: false,
//         message: "Vui lòng nhập đầy đủ thông tin",
//       });
//     }

//     const addressOld = await Model.AddressModel.findById(addressID);
//     if (
//       addressOld.nameAddress === nameAddress &&
//       addressOld.detailAddress === detailAddress
//     ) {
//       return res.json({
//         success: false,
//         message: "Không được trùng tên địa chỉ hiện tại",
//       });
//     }

//     await addressToUpdate.save();
//     return res.status(200).json({
//       success: true,
//       message: "Cập nhật địa chỉ người dùng thành công",
//       Address: addressToUpdate,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Có lỗi xảy ra: " + error.message,
//     });
//   }
// };

exports.UpdateAddress = async (req, res, next) => {
  const { nameAddress, detailAddress, latitude, longitude, permission, phoneNumber,fullName } = req.body;
  const addressID = req.params.addressID;

  try {
    const addressToUpdate = await Model.AddressModel.findById(addressID);
    
    if (!addressToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ.",
      });
    }

    const userID = addressToUpdate.userId;

    if (permission === "0") {
      await Model.AddressModel.updateMany(
        { userId: userID, _id: { $ne: addressID } },
        { $set: { permission: "1" } }
      );
    }
    addressToUpdate.nameAddress = nameAddress || addressToUpdate.nameAddress;
    addressToUpdate.detailAddress = detailAddress || addressToUpdate.detailAddress;
    addressToUpdate.latitude = latitude || addressToUpdate.latitude;
    addressToUpdate.longitude = longitude || addressToUpdate.longitude;
    
    addressToUpdate.phoneNumber = phoneNumber || addressToUpdate.phoneNumber;
    addressToUpdate.fullName = fullName || addressToUpdate.fullName;
    addressToUpdate.permission = permission === "0" ? "0" : "1"; 

    if (!detailAddress || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin địa chỉ.",
      });
    }

    // check chỉ 1
    const addressOld = await Model.AddressModel.findOne({
      userId: userID,
      detailAddress: detailAddress,
      _id: { $ne: addressID },
    });

    if (addressOld) {
      return res.status(400).json({
        success: false,
        message: "Không được trùng tên địa chỉ hiện tại.",
      });
    }

    await addressToUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công.",
      Address: addressToUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra: " + error.message,
    });
  }
};



exports.Address_DELETE = async (req, res, next) => {
  let addressID = req.params.addressID;
  try {
    await Model.AddressModel.findByIdAndDelete(addressID);
    return res.status(200).json({
      success: true,
      message: "Xóa Thành Công",
    });
  } catch (error) {
    console.log(error);
  }
};
