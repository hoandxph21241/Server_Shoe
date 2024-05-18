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
    ]
  },
  {
    collection: "users",
  }
);
let UserModel = mongodb.models.users || mongodb.model("users", userSchema);

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

const shoe = new Schema({
  shoeID: ObjectId,
  brandShoe: { type: String, require: true },
  name: { type: String, require: true },
  price: { type: Number, require: true },
  description: { type: String },
  number: { type: Number, require: true },
  gender: { type: String, require: true },
  hidden: { type: Boolean, default: false },
  thumbnail: { type: String, require: true },
});
const ShoeModel = mongodb.models.shoes || mongodb.model("shoes", shoe);


module.exports = {
  UserModel,
  BannerModel,
  DiscountModel,
  ShoeModel,
  AddressModel,
  ReviewModel
};
