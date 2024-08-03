const { DiscountModel } = require("../Models/DB_Shoes");
const parseDateString = (dateString) => {
    const [time, date] = dateString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };
const addDiscount = async (req, res) => {
  try {
    let msg = "";
    const { discountAmount, endDate, maxUser, description } = req.body;
    console.log(maxUser);
    let couponCode = Math.random().toString(36).substring(7).toUpperCase();
    while (await DiscountModel.findOne({ couponCode: couponCode })) {
      couponCode = Math.random().toString(36).substring(7).toUpperCase();
    }
    const time = parseDateString(endDate);
    const discount = new DiscountModel({
      couponCode,
      discountAmount,
      endDate: time,
      maxUser,
      isActive: true
    });
    await discount.save();
    //   return res.render('addDiscount.ejs', { msg: "Discount added successfully!" });
  } catch (err) {
    console.log(err);
    //   return res.render('addDiscount.ejs', { msg: "Error adding discount!" });
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
    return res.render("hiddenDiscount.ejs", {
      msg: "Discount hidden successfully!",
    });
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
        const { couponCode, discountAmount, endDate, maxUser, description } = req.body;
        const discount = await DiscountModel.findOne({ couponCode });
        if (!discount) {
            // return res.render('editDiscount.ejs', { msg: "Discount not found!" });
        }
        discount.discountAmount = discountAmount || discount.discountAmount;
        discount.endDate = parseDateString(endDate) || discount.endDate;
        discount.maxUser = maxUser || discount.maxUser;
        discount.description = description || discount.description;
        await discount.save();
        // return res.render('editDiscount.ejs', { msg: "Discount updated successfully!" });
    }
    catch (err) {
        console.log(err);
        // return res.render('editDiscount.ejs', { msg: "Error updating discount!" });
    }
}
const getListDiscount = async (req, res) => {
    try {
        const discount = await DiscountModel.find().sort({ endDate: 1 });
        // return res.render('listDiscount.ejs', { discount });
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
