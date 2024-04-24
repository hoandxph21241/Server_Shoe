var Model = require("../../Models/DB_Shoes");
exports.Sign = async (req, res, next) => {
  if (req.method === "POST") {

    let nameAccount = req.body.nameAccount;
    let namePassword = req.body.namePassword;

    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user && user.namePassword === namePassword) {
      console.log(
        "Người dùng: " +nameAccount +" - " +user +" - " +namePassword +" = Đăng nhập thành công"
      );
      res.status(200).json({ success: true, user: user, userID: user.userID });
    } else {
        console.log(
            "Người dùng: " +nameAccount +" - " +user +" - " +namePassword +" = Đăng nhập Không thành công"
          );
      res.status(200).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác",
      });
    }
  }
};
exports.Register = async (req, res, next) => {
  let list = await Model.UserModel.find();
  // Lấy thông tin đăng ký từ req.body
  let nameAccount = req.body.nameAccount;
  let namePassword = req.body.namePassword;
  try {
    // Tạo một đối tượng người dùng mới và lưu vào cơ sở dữ liệu
    let objSP = new Model.UserModel({
      nameAccount: req.body.nameAccount,
      namePassword: req.body.namePassword,
    });
    // Kiểm tra tính hợp lệ của thông tin đăng ký
    if (!nameAccount || !namePassword) {
      // Thông tin đăng ký không hợp lệ
      // Trả về thông báo lỗi cho client
      res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    let user = await Model.UserModel.findOne({ nameAccount: nameAccount });
    if (user) {
      // Tên đăng nhập đã tồn tại
      // Trả về thông báo lỗi cho client
      res.json({ success: false, message: "Tên đăng nhập đã tồn tại" });
      return;
    }
    let new_Ur = await objSP.save();
    // Đăng ký thành công
    // Trả về thông báo thành công cho client
    res.json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    msg = "Lỗi " + error.message;
    cconsole.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
