const mongoose = require("mongoose");
mongoose
  // .connect("mongodb://127.0.0.1/Shoes_Database")
  .connect("mongodb+srv://hoandxph21241:hoan123@shoesdatabase.ck50y7r.mongodb.net/Shoes_Database")
  .then(() => {
    console.log("Đã Kết Nối ");
  })
  .catch((err) => {
    console.log("Loi ket Noi CSDL");
    console.log(err);
  });
module.exports = { mongoose };