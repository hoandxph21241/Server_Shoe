var Model = require("../../Models/DB_Shoes");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config()


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
      console.log(user);
      return res.status(200).json(user);
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

exports.UpdateUser = async (req, res, next) => {
  let imageAccount = req.body.imageAccount;
  let phoneNumber = req.body.phoneNumber;
  let userName = req.body.userName;
  let fullName = req.body.fullName;
  let gmail = req.body.gmail;
  let grender = req.body.grender;

  try {
    let user = await Model.UserModel.findById(req.params.id);
    if (user) {
      user.imageAccount = imageAccount;
      user.phoneNumber = phoneNumber;
      user.userName = userName;
      user.fullName = fullName;
      user.gmail = gmail;
      user.grender = grender;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin người dùng thành công",
        user:user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với id này",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra: " + error.message });
  }
};


exports.ResetPassword = async (req, res, next) => {
  let userId = req.params.id;
  let otp = req.body.otp;
  let newPassword = req.body.newPassword;

  try {
    let user = await Model.UserModel.findById(userId);
    if (user) {
      if (user.otp === otp) {
        user.namePassword = newPassword;
        user.otp = null;
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Đặt lại mật khẩu thành công",
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
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra: " + error.message });
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
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'hzdev231@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        }
      });

      let mailOptions = {
        from: 'hzdev231@gmail.com',
        to: user.nameAccount,
        subject: 'Xác nhận đặt lại mật khẩu',
        text: `Mã OTP mới của bạn là: ${newOtp}`
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
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
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra: " + error.message });
  }
};
