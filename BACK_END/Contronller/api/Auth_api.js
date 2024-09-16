var Model = require("../../Models/DB_Shoes");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

exports.Sign = async (req, res, next) => {
  if (req.method === "POST") {
    let nameAccount = req.body.nameAccount;
    let namePassword = req.body.namePassword;

    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user && user.namePassword === namePassword) {
      console.log(
        "Người dùng: " +
          nameAccount +
          " - " +
          user +
          " - " +
          namePassword +
          " = Đăng nhập thành công"
      );
      res.status(200).json({ success: true, user: user, userID: user.userID });
    } else {
      console.log(
        "Người dùng: " +
          nameAccount +
          " - " +
          user +
          " - " +
          namePassword +
          " = Đăng nhập Không thành công"
      );
      res.status(200).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác",
      });
    }
  }
};
exports.Registe = async (req, res, next) => {
  let list = await Model.UserModel.find();
  let nameAccount = req.body.nameAccount;
  let namePassword = req.body.namePassword;
  try {
    let objSP = new Model.UserModel({
      nameAccount: req.body.nameAccount,
      namePassword: req.body.namePassword,
    });
    if (!nameAccount || !namePassword) {
      res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user) {
      res.json({ success: false, message: "Tên đăng nhập đã tồn tại" });
      return;
    }
    let new_Ur = await objSP.save();
    res.json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    msg = "Lỗi " + error.message;
    cconsole.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

exports.Register_Mail = async (req, res, next) => {
  let nameAccount = req.body.nameAccount;
  let namePassword = req.body.namePassword;

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
    if (!nameAccount || !namePassword) {
      return res.json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    let user = await Model.UserModel.findOne({ nameAccount });
    if (user) {
      return res.json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

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
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "hzdev231@gmail.com",
      to: nameAccount,
      subject: "Xác nhận đăng ký",
      text: `Xin chào ${nameAccount},\n\nCảm ơn bạn đã đăng ký tài khoản tại dịch vụ của chúng tôi. Dưới đây là mã OTP để xác nhận tài khoản của bạn:\n\nMã OTP: ${otp}\n\nChúng tôi rất vui mừng được chào đón bạn!\n\nTrân trọng,\nĐội ngũ hỗ trợ khách hàng`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    const objSP = new Model.UserModel({
      nameAccount,
      namePassword,
      otp,
    });

    const newUser = await objSP.save();
    res.json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
