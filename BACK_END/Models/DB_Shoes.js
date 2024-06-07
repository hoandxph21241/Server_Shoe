var db = require("./db");
var userSchema = new db.mongoose.Schema(
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
    // Phân Quyền
    role: { type: Number, require: true, default: 1 },
    // Khóa Tài Khoản
    locked: { type: Boolean, require: true, default: false },
    // OTP đổi mật khẩu
    otp: { type: String, require: false },
  },
  {
    collection: "User",
  }
);
let UserModel = db.mongoose.model("UserModel", userSchema);

var BannerSchema = new db.mongoose.Schema(
  {
    bannerId: { type: String, require: true },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    thumbnail: { type: String, require: false },
    image: { type: String, require: false },
    title: { type: String, require: false },
    type: { type: String, require: false },
    description: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Banner",
  }
);
let BannerModel = db.mongoose.model("BannerModel", BannerSchema);

var TypeShoeSchema = new db.mongoose.Schema(
  {
    TypeId: { type: String, require: true },
    nameType: { type: String, require: false },
    imageType: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "TypeShoe",
  }
);
let TypeShoeModel = db.mongoose.model("TypeShoeModel", TypeShoeSchema);

var ImageShoeSchema = new db.mongoose.Schema(
  {
    typeId: { type: String, require: false },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    imageShoe: [{ type: String, require: true }],
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "ImageShoe",
  }
);
let ImageShoeModel = db.mongoose.model("ImageShoeModel", ImageShoeSchema);

var SizeShoeSchema = new db.mongoose.Schema(
  {
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    sizeId: { type: String, require: false },
    size: { type: String, require: true },
    quanlity: { type: Number, require: true },
    isEnable: { type: Boolean, require: false, default: true },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "SizeShoe",
  }
);
let SizeShoeModel = db.mongoose.model("SizeShoeModel", SizeShoeSchema);

const ShoeDetailSchema = new db.mongoose.Schema(
  {
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel", required: true },
    sizeShoe: [{ type: db.mongoose.Schema.Types.ObjectId, ref: "SizeShoeModel" }],
    imageShoe: { type: db.mongoose.Schema.Types.ObjectId, ref: "ImageShoeModel" },
    colorShoe: { type: db.mongoose.Schema.Types.ObjectId, ref: "ColorShoeModel" },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "ShoeDetail",
  }
);

let ShoeDetailModel = db.mongoose.model("ShoeDetailModel", ShoeDetailSchema);

var ColorShoeSchema = new db.mongoose.Schema(
  {
    ColorId: { type: String, require: true },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    textColor: { type: String, require: false },
    codeColor: { type: String, require: false },
    quanlity: { type: String, require: false },
    isEnable: { type: Boolean, require: false, default: true },
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
    name: { type: String, require: true },
    price: { type: Number, require: false },
    description: { type: String, require: false },
    number: { type: Number, require: false },
    gender: { type: String, require: false },
    thumbnail: { type: String, require: false },
    shoeDetail: { type: db.mongoose.Schema.Types.ObjectId, ref: 'ShoeDetailModel' },
    hidden: { type: Boolean, require: true, default: false },
    brandShoe: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "TypeShoeModel",
    },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Shoe",
  }
);
let ShoeModel = db.mongoose.model("ShoeModel", ShoeSchema);

var OderSchema = new db.mongoose.Schema(
  {
    orderId: { type: String, require: true },
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    nameOrder: { type: String, require: false },
    phoneNumber: { type: String, require: false },
    adressOrder: { type: String, require: false },
    total: { type: String, require: false },
    dateOrder: { type: String, require: false },
    pay: { type: String, require: false },
    status: { type: String, require: false },
    discointId: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "DiscountModel",
    },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "OderModel",
  }
);
let OderModel = db.mongoose.model("OderModel", OderSchema);

var DiscountSchema = new db.mongoose.Schema(
  {
    discountId: { type: String, require: true },
    couponCode: { type: String, require: false },
    discountAmount: { type: String, require: false },
    endDate: { type: String, require: false },
    maxUses: { type: String, require: false },
    isActive: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Discount",
  }
);
let DiscountModel = db.mongoose.model("DiscountModel", DiscountSchema);

var OderDetailSchema = new db.mongoose.Schema(
  {
    orderDetailId: { type: String, require: true },
    orderId: { type: db.mongoose.Schema.Types.ObjectId, ref: "OderModel" },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    imageShoe: { type: String, require: false },
    nameShoe: { type: String, require: false },
    quanlity: { type: String, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "OrderDetailld",
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
  TypeShoeModel,
  ShoeModel,
  ShoeDetailModel,
  SizeShoeModel,
  ColorShoeModel,
  ImageShoeModel,
  OderModel,
  DiscountModel,
  OderDetailModel,
  CartModel,
};
