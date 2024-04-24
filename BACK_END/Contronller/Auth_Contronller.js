var Model = require("../Models/DB_Shoes");

exports.Register = async (req, res, next) => {
  let msg = "";
  try {
    // Kiểm tra xem người dùng có để trống trường nào không
    if (!req.body.nameAccount || !req.body.namePassword) {
      msg = "Vui lòng không để trống trường nào";
      return res.render("auth/register.ejs", { msg: msg });
    }

    // Kiểm tra nameAccount 
    const userExists = await Model.UserModel.findOne({ nameAccount: req.body.nameAccount });
    if (userExists) {
      msg = "Email is already in use";
      return res.render("auth/register.ejs", { msg: msg });
    }

    // Kiểm tra  namePassword và confirmPassword
    if (req.body.namePassword !== req.body.confirmPassword) {
      console.log(req.body.namePassword+" "+req.body.confirmPassword);
      msg = "Password and Confirm Password are incorrect";
      return res.render("auth/register.ejs", { msg: msg });
    }
    const user = new Model.UserModel({
      nameAccount: req.body.nameAccount,
      namePassword: req.body.namePassword,
      role: 1 
    });
    const savedUser = await user.save();
    console.log( "Register Success!");
    console.log( "|"+savedUser+"|")
    msg = "Đăng ký thành công!";
  } catch (error) {
    msg = error.message;
  }
  res.render("auth/register.ejs", { msg: msg });
};

exports.SignIn = async (req, res, next) => {
  let user;
  let msg = "";
  if (req.method == "POST") {
    try {
      let objU = await Model.UserModel.findOne({
        nameAccount: req.body.nameAccount,
      });
      console.log(objU);
      if (objU != null) {
        if (objU.namePassword == req.body.namePassword) {
          req.session.userLogin = objU;
          user = objU;
          console.log("==== Start login ====");
          console.log(user.fullName);
          console.log("==== End login ====");
          msg = "SignIn Success!";
          if (objU["role"] !== 2) {
            return res.redirect("/home");
          } else {
            return res.redirect("/home");
          }
        } else {
          msg = "Sai mật khẩu!";
        }
      } else {
        msg = "Không tồn tại user " + req.body.nameAccount;
      }
    } catch (error) {
      msg = error.message;
    }
  }
  res.render("auth/sign_in.ejs", { msg: msg, user: user });
};

exports.SignOut = async (req, res, next) => {
  try {
    // Kiểm tra session
    if (req.session && Object.keys(req.session).length !== 0) {
      console.log("Account_session_SignOut");
      console.log(req.session.user);

      // Hủy session
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Complete_Data_session");
        }
      });
    } else {
      console.log("Session_Empty_And_Null");
    }
    res.redirect("/auth/signin");
  } catch (error) {
    console.error(error);
    res.redirect("/auth/signin");
  }
};
