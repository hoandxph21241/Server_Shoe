const mongodb = require("mongoose");
const { type } = require("os");
const Schema = mongodb.Schema;
const ObjectId = Schema.ObjectId;
var userSchema = new Schema(
  {
    userID: { type: String, require: true },
    nameAccount: { type: String, require: true },
    namePassword: { type: String, require: true },
    imageAccount: { type: String, require: false },
    phoneNumber: { type: String, require: false },
    userName: { type: String, require: false },
    fullName: { type: String, require: false },
    gmail: { type: String, require: false },
    grender: { type: String, require: false },
    role: { type: Number, require: true, default: 1 },
    favourites: [
      {
        shoeId: { type: String, require: true },
      },
    ],
    locked: { type: Boolean, require: true, default: false },
    otp: { type: String, require: false }
  },
  {
    collection: "users",
  }
);
const UserModel = mongodb.models.users || mongodb.model("users", userSchema);

const address = new Schema({
  addressId: ObjectId,
  nameAddress: { type: String },
  address: { type: String, require: true },
  phoneNumber: { type: Number, require: true },
  userId: { type: String, require: true },
});
const AddressModel = mongodb.models.addresses || mongodb.model("addresses", address);


const review = new Schema({
  userID: { type: String, require: true },
  shoeId: { type: String, require: true },
  rating: { type: Number, require: true },
  comment: { type: String },
  date: { type: Date}
})
const ReviewModel = mongodb.models.reviews || mongodb.model("reviews", review);

const banner = new Schema({
  bannerID: ObjectId,
  shoeID: {type: String, require: true},
  thumbnail: { type: String },
  image: [{ type: String }],
  title: { type: String, require: true },
  description: { type: String },
  type: { type: String, require: true },
});
const BannerModel = mongodb.models.banners || mongodb.model("banners", banner);

const discount = new Schema({
  couponCode: { type: String, require: true, require: true },
  discountAmount: { type: Number, require: true },
  endDate: { type: Date },
  maxUser: { type: Number },
  description: { type: String },
  isActive: { type: Boolean, require: true },
});
const DiscountModel =
  mongodb.models.discounts || mongodb.model("discounts", discount);

// const shoe = new Schema({
//   shoeID: ObjectId,
//   brandShoe: { type: String, require: true },
//   name: { type: String, require: true },
//   price: { type: Number, require: true },
//   description: { type: String },
//   number: { type: Number, require: true },
//   gender: { type: String, require: true },
//   hidden: { type: Boolean, default: false },
//   thumbnail: { type: String, require: true },
// });
// const ShoeModel = mongodb.models.shoes || mongodb.model("shoes", shoe);


var TypeShoeSchema = new db.mongoose.Schema(
  {
    typeId: { type: String, require: true },
    nameType: { type: String, require: false },
    imageType: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "TypeShoe",
  }
);
let TypeShoeModel = db.mongoose.model("TypeShoeModel", TypeShoeSchema);

var SizeShoeSchema = new db.mongoose.Schema(
  {
    sizeId: { type: String, require: false },
    nameSize: { type: String, require: true },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "SizeShoe",
  }
);
let SizeShoeModel = db.mongoose.model("SizeShoeModel", SizeShoeSchema);

var ColorShoeSchema = new db.mongoose.Schema(
  {
    colorId: { type: String, require: true },
    nameColor: { type: String, require: false },
    imageColor: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "ColorShoe",
  }
);
let ColorShoeModel = db.mongoose.model("ColorShoeModel", ColorShoeSchema);

var ShoeSchema = new db.mongoose.Schema(
  { 
    shoeId: { type: String, require: true },
    nameShoe: { type: String, require: true },
    imageShoe: { type: [String], require: false }, // Mảng Ảnh
    price: { type: Number, require: false },
    description: { type: String, require: false },
    sizeShoe: { type: db.mongoose.Schema.Types.ObjectId, ref: "SizeShoeModel" },
    colorShoe: { type: db.mongoose.Schema.Types.ObjectId, ref: "ColorShoeModel" },
    numberShoe: { type: Number, require: false },
    hiddenShoe: { type: Boolean, require: true, default: false },
    typeShoe: { type: db.mongoose.Schema.Types.ObjectId, ref: "TypeShoeModel" },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Shoe",
  }
);
let ShoeModel = db.mongoose.model("ShoeModel", ShoeSchema);


var OderSchema = new db.mongoose.Schema(
  {
    oderId: { type: String, require: true },
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    name: { type: String, require: false },
    phoneNumber: { type: String, require: false },
    adress: { type: String, require: false },
    total: { type: String, require: false },
    pay: { type: String, require: false },
    status: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Oder",
  }
);
let OderModel = db.mongoose.model("OderModel", OderSchema);

var OderDetailSchema = new db.mongoose.Schema(
  {
    oderDetailId: { type: String, require: true },
    oderId: { type: db.mongoose.Schema.Types.ObjectId, ref: "OderModel" },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    quanlity: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "OderDetail",
  }
);
let OderDetailModel = db.mongoose.model("OderDetailModel", OderDetailSchema);


var CartSchema = new db.mongoose.Schema(
  {
    cartId: { type: String, require: true },
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    numberShoe: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Cart",
  }
);
let CartModel = db.mongoose.model("CartModel", CartSchema);

module.exports = {
  UserModel,
  BannerModel,
  DiscountModel,
  ShoeModel,
  AddressModel,
  ReviewModel, TypeShoeModel,
  ShoeModel,
  SizeShoeModel,
  ColorShoeModel,
  OderModel,
  OderDetailModel,
  CartModel,
};
