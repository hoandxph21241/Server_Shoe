const { DiscountModel,UserModel } = require("../Models/DB_Shoes");
const parseDateString = (dateString) => {
  const [date, time] = dateString.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

const addDiscount = async (req, res) => {
  try {
    const { discountAmount, title, maxUser, date, hour } = req.body;
    const discountPercent = parseFloat(discountAmount);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return res.send("Giảm giá không hợp lệ. Phải là phần trăm từ 0 đến 100.");
    }
    // Combine date and hour into a single string
    const endDateString = `${date} ${hour}`;
    // Parse the combined date and time string
    const endDate = parseDateString(endDateString);
    const now = new Date();
    // Check if the discount is still valid
    if (endDate <= now) {
      return res.send("Discount hết hạn");
    }
    let couponCode = Math.random().toString(36).substring(7).toUpperCase();
    while (await DiscountModel.findOne({ couponCode: couponCode })) {
      couponCode = Math.random().toString(36).substring(7).toUpperCase();
    }

    const discount = new DiscountModel({
      couponCode,
      title,
      discountAmount:discountPercent,
      endDate,
      maxUser,
      isActive: true
    });

    await discount.save();
    res.redirect('/discount');
  } catch (err) {
    console.log("Lỗi : ", err);
    res.status(500).send("Lỗi xảy ra khi thêm mã giảm giá.");
  }
};
const hiddenDiscount = async (req, res) => {
  try {
    let msg = "";
    const { couponCode } = req.body;
    const discount = await DiscountModel.findOne({ couponCode });
    if (!discount) {
      //   return res.render("hiddenDiscount.ejs", { msg: "Discount not found!" });
    }
    discount.isActive = !discount.isActive;
    await discount.save();
    res.redirect('/discount')
  } catch (err) {
    console.log(err);
    // return res.render("hiddenDiscount.ejs", { msg: "Error hidden discount!" });
  }
};
const deleteDiscount = async (req, res) => {
  try {
    let msg = "";
    const { couponCode } = req.body;
    const discount = await DiscountModel.findOne({ couponCode });
    if (!discount) {
      // return res.render('deleteDiscount.ejs', { msg: "Discount not found!" });
    }
    await discount.remove();
    // return res.render('deleteDiscount.ejs', { msg: "Discount deleted successfully!" });
  } catch (err) {
    console.log(err);
    // return res.render('deleteDiscount.ejs', { msg: "Error deleting discount!" });
  }
};
const editDiscount = async (req, res) => {
  try {
    let msg = "";
    const { couponCode, discountAmount, endDate, maxUser } = req.body;
    const discount = await DiscountModel.findOne({ couponCode });
    if (!discount) {
      res.status(404).send("Discount not found");
    }
    discount.discountAmount = discountAmount || discount.discountAmount;
    discount.endDate = parseDateString(endDate) || discount.endDate;
    discount.maxUser = maxUser || discount.maxUser;
    // discount.description = description || discount.description;
    await discount.save();
    res.redirect('/discount')
    // return res.render('editDiscount.ejs', { msg: "Discount updated successfully!" });
  }
  catch (err) {
    console.log(err);
    // return res.render('editDiscount.ejs', { msg: "Error updating discount!" });
  }
}
const getListDiscount = async (req, res) => {
  const userRole = req.session.userLogin ? req.session.userLogin.role : null;
console.log("vsd",userRole);

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;

    const skip = (page - 1) * limit;
    const discountCount = await DiscountModel.countDocuments({ isActive: true });
    const discount = await DiscountModel.find({ isActive: true }).sort({ endDate: 1 }).skip(skip).limit(limit);
    console.log("vsd",discount);

    const totalPage = Math.ceil(discountCount / limit);
    return res.render('manager/vorcher/vorcher.ejs', { discounts: discount, currentPage: page, totalPages: totalPage, userRole: userRole});

  } catch (err) {
    console.log(err);
    // return res.render('listDiscount.ejs', { discount: [] });
  }
};

module.exports = {
  addDiscount,
  hiddenDiscount,
  deleteDiscount,
  editDiscount,
  getListDiscount
};
