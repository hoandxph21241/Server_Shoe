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

var SizeShoeSchema = new db.mongoose.Schema(
  {
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    sizeId: { type: String, require: false },
    size: { type: String, require: true },
    isEnable: { type: Boolean, require: false, default: true },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "SizeShoe",
  }
);
let SizeShoeModel = db.mongoose.model("SizeShoeModel", SizeShoeSchema);

var ColorShoeSchema = new db.mongoose.Schema(
  {
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    colorId: { type: String, require: false },
    textColor: { type: String, require: false },
    codeColor: { type: String, require: false },
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
    status: { type: Number, require: true, default: 0 },
    brandShoe: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "TypeShoeModel",
    },
    imageShoe: [{ type: String, require: true }],
    sizeShoe: [
      { type: db.mongoose.Schema.Types.ObjectId, ref: "SizeShoeModel" },
    ],
    colorShoe: [
      { type: db.mongoose.Schema.Types.ObjectId, ref: "ColorShoeModel" },
    ],
    storageShoe: [
      {
        colorShoe: {
          colorId: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "ColorShoeModel",
          },
          textColor: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "ColorShoeModel",
          },
          codeColor: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "ColorShoeModel",
          },
        },
        sizeShoe: {
          sizeId: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "SizeShoeModel",
          },
          size: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "SizeShoeModel",
          },
        },
        importQuanlity: { type: Number, require: false },
        soldQuanlity: { type: Number, require: false },
        importQuaquanlity: { type: Number, require: false },
      },
    ],
    importQuanlityAll: { type: Number, require: false },
    soldQuanlityAll: { type: Number, require: false },
    quanlityAll: { type: Number, require: false },
    gender: { type: Number, require: true, default: 0 },
    importPrice: { type: Number, require: false },
    sellPrice: { type: Number, require: false },
    discountPrice: { type: Number, require: false },
    rateShoe: {
      starRate: { type: Number, require: false },
      comment: [
        {
          userName: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
          },
          commetText: { type: String, require: false },
          rateNumber: { type: Number, require: false },
        },
      ],
    },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Shoe",
  }
);
let ShoeModel = db.mongoose.model("ShoeModel", ShoeSchema);

var OrderSchema = new db.mongoose.Schema(
  {
    orderId: { type: String, require: true },
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    nameOrder: { type: String, require: false },
    phoneNumber: { type: Number, require: false },
    addressOrder: { type: String, require: false },
    total: { type: Number, require: false },
    dateOrder: { type: String, require: false },
    pay: { type: String, require: false },
    status: { type: String, require: false },
    orderStatusDetails: {
      type: [{
        status: { type: String, required: true },
        timestamp: { type: String, require: false },
        note: { type: String, required: true },

      }],
      default: [],
    }, discointId: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "DiscountModel",
    },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "Order",
  }
);
let OrderModel = db.mongoose.model("OrderModel", OrderSchema);

var DiscountSchema = new db.mongoose.Schema(
  {
    discountId: { type: String, require: true },
    couponCode: { type: String, require: false },
    discountAmount: { type: Number, require: false },
    title: { type: String, require: false },
    endDate: { type: String, require: false },
    createAt: { type: Date, default: Date.now() },
    maxUser: { type: Number, require: false },
    isActive: { type: Boolean, require: false },
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
    orderId: { type: db.mongoose.Schema.Types.ObjectId, ref: "OrderModel" },
    shoeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeModel" },
    sizeId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ColorShoeModel" },
    colorId: { type: db.mongoose.Schema.Types.ObjectId, ref: "ShoeColorShoeModel" },
    quantity: { type: Number, require: false },
  },
  {
    collation: { locale: "en_US", strength: 1 },
    collection: "OrderDetailld",
  }
);
let OderDetailModel = db.mongoose.model("OderDetailModel", OderDetailSchema);


const notificationSchema = new db.mongoose.Schema(
  {
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String, required: false },
    time: { type: String, required: false },
    typeNotification: { type: String, required: true }, // Loại thông báo (e.g., "OrderCreated", "OrderStatusUpdated")
  },
  {
    collection: "Notification",
    collation: { locale: "en_US", strength: 1 }
  }
);

const NotificationModel = db.mongoose.model("NotificationModel", notificationSchema);

const adminNotificationSchema = new db.mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String, required: false },
    time: { type: String, required: false },
    typeNotification: { type: String, required: true }, // Loại thông báo (e.g., "OrderCreated", "OrderStatusUpdated")
  },
  {
    collection: "AdminNotification",
    collation: { locale: "en_US", strength: 1 }
  }
);

const AdminNotificationModel = db.mongoose.model("AdminNotificationModel", adminNotificationSchema);


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
  SizeShoeModel,
  ColorShoeModel,
  OrderModel,
  DiscountModel,
  OderDetailModel,
  NotificationModel,
  AdminNotificationModel,
  CartModel,
};