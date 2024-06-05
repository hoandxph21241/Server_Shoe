var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://vanphuc_mongodb:1E7V8mnJNV4X9ead@cluster0.iit1hgd.mongodb.net/Shoe")
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!!'))
  .catch(err => console.log('>>>>>>>>> DB Error: ', err));

//session
var session = require('express-session')

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//session check
app.use(session({
  secret: 'AAAAAAAAABBBBBBBBBCCCCCCCDDDDDDD',
  resave: false,
  saveUninitialized: true,
//  cookie: { secure: true },
}))


//home
var HomeRounter = require("./routes/Home_Rounters");
app.use("/home", HomeRounter);

//auth
var AuthRounter = require("./routes/Auth_Rounters");
app.use("/auth", AuthRounter);

//order
var OrderRounter = require("./routes/Order_Rounters");
app.use("/order", OrderRounter);

//dashboard
var DashboardRounter = require("./routes/Dashboard_Rounters");
app.use("/dashboard", DashboardRounter);

//manager
var ManagerRouter = require('./routes/Manager_Router');
app.use("/manager",ManagerRouter);

const IFUser = require("./routes/IFUser_Router");
app.use("/ifUser", IFUser);

const discountRouter = require('./routes/Discount_rounters');
app.use("/discount", discountRouter);
//api
var apiRouter = require("./routes/api_Rounters");
app.use("/api", apiRouter);
const NavigationRouter = require("./routes/Navigation_Route");
app.use("/navigation", NavigationRouter);
const CartRouter = require("./routes/Cart_Route");
app.use("/cart", CartRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);

  // link api
  if (req.originalUrl.indexOf("/api") == 0) {
    // nếu = 0 thì có api
    res.json({
      status: err.status,
      msg: err.message,
    });
  } else {
    res.render("error");
  }
  res.render("error");
});

module.exports = app;
