const { DiscountModel } = require("../../Models/DB_Shoes");

const parseDateString = (dateString) => {
  const [time, date] = dateString.split(' ');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const timeVietNam = () => {
  const date = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  return date;
};
const checkDiscount = async (req, res) => {
  try {
    const couponCode = req.query.code;
    const discount = await DiscountModel.findOne({ couponCode });
    if (!discount) {
      return res
        .status(404)
        .json({
          Success: false,
          message: "Discount not found!",
        });
    }
    const dateNow = new Date(); 
    if (discount.maxUser === 0 || discount.endDate < dateNow) {
      return res
        .status(404)
        .json({
          Success: false,
          message: "Discount has expired!",
        });
    }
    return res
      .status(200)
      .json({
        Success: true,
        message: "Discount applied successfully!" + discount.discountAmount + "VND",
        discount,
      });

  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        Success: false,
        message: "The server is experiencing an error!",
        error: error,
      });
  }
}



module.exports ={
    checkDiscount
}
