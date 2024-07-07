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
    const userExists = await Model.UserModel.findOne({
      nameAccount: req.body.nameAccount,
    });
    if (userExists) {
      msg = "Email is already in use";
      return res.render("auth/register.ejs", { msg: msg });
    }

    // Kiểm tra namePassword và confirmPassword
    if (req.body.namePassword !== req.body.confirmPassword) {
      console.log(req.body.namePassword + " " + req.body.confirmPassword);
      msg = "Password and Confirm Password are incorrect";
      return res.render("auth/register.ejs", { msg: msg });
    }

    const user = new Model.UserModel({
      nameAccount: req.body.nameAccount,
      namePassword: req.body.namePassword,
      role: 1,
    });
    const savedUser = await user.save();
    console.log("Register Success!");
    console.log("|" + savedUser + "|");
    msg = "Đăng ký thành công!";
  } catch (error) {
    console.error("Error during registration:", error.message);
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
      console.error("Error during sign-in:", error.message);
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
          console.log("Error destroying session:", err);
          return res.redirect("/auth/signin");
        } else {
          console.log("Complete_Data_session");
          return res.redirect("/auth/signin");
        }
      });
    } else {
      console.log("Session_Empty_And_Null");
      return res.redirect("/auth/signin");
    }
  } catch (error) {
    console.error("Error during sign-out:", error.message);
    res.redirect("/auth/signin");
  }
};

exports.UserList = async (req, res, next) => {
  try {
    const listUser = await Model.UserModel.find();
    console.log("List of users:", listUser);
    return res.render("user/user.ejs", {
      users: listUser.length ? listUser : [],
    });
  } catch (error) {
    console.error("Error fetching user list:", error.message);
    res.status(500).json({ msg: "Server error: " + error.message });
  }
};

exports.ProfileUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Model.UserModel.findById(userId);

    const orders = await Model.OrderModel.find({ userId })
      .populate("discointId", "discountAmount")
      .lean();

    const totalAmount = orders.reduce((acc, order) => acc + order.total, 0);

    const ordersResponse = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await Model.OderDetailModel.find({
          orderId: order._id,
        })
          .populate({
            path: "shoeId",
            select: "name price thumbnail",
          })
          .populate({
            path: "sizeId",
            model: "SizeShoeModel",
            select: "size",
          })
          .populate({
            path: "colorId",
            model: "ColorShoeModel",
            select: "textColor codeColor",
          })
          .lean();

        // Định dạng lại chi tiết đơn hàng
        const details = orderDetails.map((detail) => ({
          _id: detail._id,
          shoeId: detail.shoeId ? detail.shoeId._id : null,
          name: detail.shoeId ? detail.shoeId.name : "N/A",
          thumbnail: detail.shoeId ? detail.shoeId.thumbnail : "",
          size: detail.sizeId ? detail.sizeId.size : "N/A",
          textColor: detail.colorId ? detail.colorId.textColor : "N/A",
          codeColor: detail.colorId ? detail.colorId.codeColor : "",
          quantity: detail.quantity,
          price: detail.shoeId ? detail.shoeId.price : 0,
        }));

        return {
          userNameAccount: order.userId?.nameAccount || null,
          _id: order._id,
          orderId: order.orderId,
          dateOrder: order.dateOrder,
          total: order.total,
          status: order.status,
          details: details,
        };
      })
    );
    console.log(ordersResponse);
    res.render("user/profile_user.ejs", {
      user,
      orders: ordersResponse,
      totalAmount,
    });
  } catch (err) {
    console.error("Error fetching profile user orders:", err.message);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đơn hàng.", error: err.message });
  }
};

exports.UserOrderDetail = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    if (!orderId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const order = await Model.OrderModel.findById(orderId)
      .populate("discointId", "discountAmount")
      .lean();

    if (!orderId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const orderDetails = await Model.OderDetailModel.find({ orderId })
      .populate({
        path: "shoeId",
        select: "name price thumbnail",
      })
      .populate({
        path: "sizeId",
        model: "SizeShoeModel",
        select: "size",
      })
      .populate({
        path: "colorId",
        model: "ColorShoeModel",
        select: "textColor codeColor",
      })
      .lean();

    // Định dạng lại chi tiết đơn hàng
    const orderResponse = {
      _id: orderId,
      userId: order.userId,
      nameOrder: order.nameOrder,
      phoneNumber: order.phoneNumber,
      addressOrder: order.addressOrder,
      dateOrder: order.dateOrder,
      pay: order.pay,
      status: order.status,
      total: order.total,
      discountAmount: order.discointId ? order.discointId.discountAmount : 0,
      details: orderDetails.map((detail) => ({
        shoeId: {
          _id: detail.shoeId._id,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity,
        },
      })),
    };

    console.log(orderResponse);
    res.render("user/user_order_details.ejs", { orderResponse });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết đơn hàng.", error: err.message });
  }
};
