exports.Order_List = async (req, res, next) => {
  res.render("order/order_list.ejs");
};

exports.Order_Details = async (req, res, next) => {
  res.render("order/order_details.ejs");
};
