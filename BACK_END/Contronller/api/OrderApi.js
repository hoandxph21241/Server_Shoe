const { sendNotificationUser } = require('../../Contronller/api/Navigation_api');
const { sendNotificationAdmin } = require('../../Contronller/Navigation_Controller');
const { OrderModel, OderDetailModel, DiscountModel, ShoeModel,UserModel, AddressModel, CartModel,StorageShoeModel } = require('../../Models/DB_Shoes');
const vietnamDate = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh'
}).format(new Date());
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const cron = require('node-cron');

cron.schedule('0 2 * * *', () => {
  autoConfirmOrderReceived();
});


const createOrder = async (req, res) => {
  const orderData = req.body;

  try {
    const address = await AddressModel.findById(orderData.addressId);
    if (!address) {
      return res.status(400).json({ message: `Không tìm thấy địa chỉ với id ${orderData.addressId}` });
    }

  const cartItems = [];
    
  for (let item of orderData.items) {
    const cartId = item.cartId;
    const cartItem = await CartModel.findById(cartId);
    if (!cartItem) {
      return res.status(400).json({ message: `Không tìm thấy giỏ hàng với id ${cartId}` });
    }
    cartItems.push(cartItem);
  }

  // Kiểm tra và trừ số lượng giày trong kho
  for (let item of cartItems) {
    const shoe = await ShoeModel.findById(item.shoeId);
    if (!shoe) {
      return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
    }

    const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
    const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

    if (sizeIndex === -1 || colorIndex === -1) {
      return res.status(400).json({
        message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`
      });
    }

      const stockIndex = sizeIndex * shoe.colorShoe.length + colorIndex;

      // 
      if (shoe.storageShoe[stockIndex].soldQuanlity < item.numberShoe) {
        return res.status(400).json({
          message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`
        });
      }

      //Trừ quantity và soldQuanlity  `ShoeModel`
      shoe.storageShoe[stockIndex].soldQuanlity -= item.numberShoe;  
      shoe.soldQuanlityAll -= item.numberShoe;
      await shoe.save();

      // tìm `StorageShoeModel`
      const storageItem = await StorageShoeModel.findOne({
        shoeId: item.shoeId,
        colorShoe: item.colorId,
        "sizeShoe.sizeId": item.sizeId,
      });

      if (!storageItem) {
        return res.status(400).json({
          message: `Không tìm thấy thông tin tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`
        });
      }
      // Trừ quantity và soldQuanlity bảng storageshoes
      const sizeShoeToUpdate = storageItem.sizeShoe.find(size => size.sizeId.equals(item.sizeId));

      if (sizeShoeToUpdate.quantity < item.numberShoe) {
        return res.status(400).json({
          message: `Không đủ số lượng màu này ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.`
        });
      }
    
      sizeShoeToUpdate.quantity -= item.numberShoe; 
      storageItem.soldQuanlity -= item.numberShoe;

      await storageItem.save();
  }

    // Kiểm tra và áp dụng giảm giá
    if (orderData.discointId) {
      const discount = await DiscountModel.findById(orderData.discointId);
      if (!discount) {
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
      }

      if (!discount.isActive) {
        return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
      }

      if (discount.maxUser <= 0) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
      }

      discount.maxUser -= 1;
      await discount.save();
    }

    // Tạo đơn hàng mới
    const newOrder = await OrderModel.create({
      userId: address.userId,
      nameOrder: address.fullName, 
      phoneNumber: address.phoneNumber, 
      addressOrder: address.detailAddress, 
      pay: orderData.pay,
      total: orderData.total,
      dateOrder: Date.now(),
      status: orderData.pay === "Thanh toán qua Zalo Pay" ? 2 : 1,
      totalShip: orderData.totalShip,
      discointId: orderData.discointId || null,
      orderStatusDetails: [
        {
          status: 'Chờ xác nhận',
          timestamp: vietnamDate,
          note: 'Đơn hàng mới được tạo',
        },
      ],
    });

    const orderDetails = cartItems.map(item => ({
      orderId: newOrder._id,
      shoeId: item.shoeId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      quantity: item.numberShoe,
    }));

    await OderDetailModel.insertMany(orderDetails);

    // const cartIds = orderData.items.map(item => item.cartId);
    // await CartModel.deleteMany({ _id: { $in: cartIds } });

    // Gửi thông báo
    const notificationPromises = [
      sendNotificationUser(
        orderData.userId,
        'Đơn hàng mới',
        `Đơn hàng #${newOrder._id} của bạn đã được tạo thành công. Tổng tiền: ${orderData.total} VND`,
        'OrderCreated',
        cartItems[0].shoeId,
        vietnamDate
      ),
      sendNotificationAdmin(
        'Đơn hàng mới',
        `Một đơn hàng mới #${newOrder._id} đã được đặt. Tổng tiền: ${orderData.total} VND`,
        'OrderCreated',
        cartItems[0].shoeId,
        vietnamDate
      ),
    ];

    await Promise.all(notificationPromises);
    await sendOrderInfoEmail(address.nameAddress,address.userId, orderData.total, newOrder._id, address.detailAddress, address.phoneNumber, orderDetails);


    res.status(201).json({ message: 'Đơn hàng đã được tạo và thông báo đã được gửi.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
  }
};


const sendOrderInfoEmail = async (nameOrder,userId, total, orderId, addressOrder, phoneNumber, orderDetails) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessTokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenResponse.token;

  const user = await UserModel.findById(userId).populate("nameAccount").lean();
  // if (!user.imageAccount || !user.imageAccount.$binary || !user.imageAccount.$binary.base64) {
  //   throw new Error("User image data is missing");
  // }  
  // const base64Data = user.imageAccount.$binary.base64;
  // const imageBuffer = Buffer.from(base64Data, 'base64');
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "hzdev231@gmail.com",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  let productInfo = '';
  orderDetails.forEach(detail => {
    productInfo += `- Sản phẩm ID: ${detail.shoeId}, Số lượng: ${detail.quantity}\n`;
  });
  
  // const mailOptions = {
  //   from: "hzdev231@gmail.com",
  //   to: user.nameAccount, 
  //   subject: "Thông tin Đơn hàng của bạn",
  //   text: `Thông tin đơn hàng:\n- Tên người nhận: ${nameOrder}\n- Số điện thoại: ${phoneNumber}\n- Địa chỉ: ${addressOrder}\n- Tổng tiền: ${total}\n- Mã đơn hàng: ${orderId}\n- Sản phẩm:\n${productInfo}`,
  //   attachments: [
  //     {
  //       filename: 'profile.jpg',
  //       content: imageBuffer,
  //       contentType: 'image/jpeg'
  //     }
  //   ]
  // };

  // const mailOptions = {
  //   from: "hzdev231@gmail.com",
  //   to: user.nameAccount,
  //   subject: "Thông tin Đơn hàng của bạn",
  //   text: `Thông tin đơn hàng:\n- Tên người nhận: ${nameOrder}\n- Số điện thoại: ${phoneNumber}\n- Địa chỉ: ${addressOrder}\n- Tổng tiền: ${total}\n- Mã đơn hàng: ${orderId}\n- Sản phẩm:\n${productInfo}`,
  //   html: `
  //     <p>Thông tin đơn hàng:</p>
  //     <ul>
  //       <li>Tên người nhận: ${nameOrder}</li>
  //       <li>Số điện thoại: ${phoneNumber}</li>
  //       <li>Địa chỉ: ${addressOrder}</li>
  //       <li>Tổng tiền: ${total}</li>
  //       <li>Mã đơn hàng: ${orderId}</li>
  //       <li>Sản phẩm:</li>
  //       <ul>
  //         ${orderDetails.map(item => `<li>Sản phẩm ID: ${item.shoeId}, Số lượng: ${item.quantity}</li>`).join('')}
  //       </ul>
  //     </ul>
  //     <p><img src="data:image/jpeg;base64,${user.imageAccount.data}" alt="User Image" /></p>
  //   `,
  //   attachments: [
  //     {
  //       filename: 'profile.jpg',
  //       content: imageBuffer,
  //       contentType: 'image/jpeg'
  //     }
  //   ]
  // };

  const mailOptions = {
    from: "hzdev231@gmail.com",
    to: user.nameAccount,
    subject: "Thông tin Đơn hàng của bạn",
    text: `Thông tin đơn hàng:\n- Tên người nhận: ${nameOrder}\n- Số điện thoại: ${phoneNumber}\n- Địa chỉ: ${addressOrder}\n- Tổng tiền: ${total}\n- Mã đơn hàng: ${orderId}\n- Sản phẩm:\n${productInfo}`,
    html: `
      <p>Thông tin đơn hàng:</p>
      <ul>
        <li>Tên người nhận: ${nameOrder}</li>
        <li>Số điện thoại: ${phoneNumber}</li>
        <li>Địa chỉ: ${addressOrder}</li>
        <li>Tổng tiền: ${total}</li>
        <li>Mã đơn hàng: ${orderId}</li>
        <li>Sản phẩm:</li>
        <ul>
          ${orderDetails.map(item => `<li>Sản phẩm ID: ${item.shoeId}, Số lượng: ${item.quantity}</li>`).join('')}
        </ul>
      </ul> 
       `,
  };

  console.log(user);
  console.log(user.nameAccount);
  console.log(nameOrder);
  console.log(total);
  console.log(orderId);
  console.log(addressOrder);
  
  
  const result = await transporter.sendMail(mailOptions);
  console.log("Email sent: " + result.response);
};

// const sendOrderInfoEmail = async (nameOrder, userId, total, orderId, addressOrder, phoneNumber, orderDetails) => {
//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
//   );
//   oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

//   const accessTokenResponse = await oAuth2Client.getAccessToken();
//   const accessToken = accessTokenResponse.token;

//   if (!accessToken) {
//     throw new Error("Failed to obtain access token");
//   }

//   const user = await UserModel.findById(userId).lean();
//   if (!user) {
//     throw new Error("User not found");
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       type: "OAuth2",
//       user: "hzdev231@gmail.com",
//       clientId: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       refreshToken: process.env.REFRESH_TOKEN,
//       accessToken: accessToken,
//     },
//   });


//   const shoeIds = orderDetails.map(detail => detail.shoeId);
//   const shoes = await ShoeModel.find({ _id: { $in: shoeIds } }).lean();

//   const productInfo = orderDetails.map(detail => {
//     const shoe = shoes.find(shoe => shoe._id.toString() === detail.shoeId.toString());
//     const shoeImage = shoe ? shoe.imageUrl : 'default-image-url.jpg';
//     return `- Sản phẩm ID: ${detail.shoeId}, Số lượng: ${detail.quantity}, Hình ảnh: <img src="${shoeImage}" alt="Shoe Image" />`;
//   }).join('\n');

//   const mailOptions = {
//     from: "hzdev231@gmail.com",
//     to: user.nameAccount,
//     subject: "Thông tin Đơn hàng của bạn",
//     text: `Thông tin đơn hàng:\n- Tên người nhận: ${nameOrder}\n- Số điện thoại: ${phoneNumber}\n- Địa chỉ: ${addressOrder}\n- Tổng tiền: ${total}\n- Mã đơn hàng: ${orderId}\n- Sản phẩm:\n${productInfo}`,
//     html: `
//       <p>Thông tin đơn hàng:</p>
//       <ul>
//         <li>Tên người nhận: ${nameOrder}</li>
//         <li>Số điện thoại: ${phoneNumber}</li>
//         <li>Địa chỉ: ${addressOrder}</li>
//         <li>Tổng tiền: ${total}</li>
//         <li>Mã đơn hàng: ${orderId}</li>
//         <li>Sản phẩm:</li>
//         <ul>
//           ${productInfo}
//         </ul>
//       </ul>
//     `,
//   };

//   const result = await transporter.sendMail(mailOptions);
//   console.log("Email sent: " + result.response);
// };

// const sendOrderInfoEmail = async (nameOrder, userId, total, orderId, addressOrder, phoneNumber, orderDetails) => {
//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
//   );
//   oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

//   const accessTokenResponse = await oAuth2Client.getAccessToken();
//   const accessToken = accessTokenResponse.token;

//   if (!accessToken) {
//     throw new Error("Failed to obtain access token");
//   }

//   const user = await UserModel.findById(userId).lean();
//   const thumbnailUrl = orderDetails.map(item => item.shoeId.thumbnail).join(', '); // Lấy thumbnail cho tất cả sản phẩm trong đơn hàng

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       type: "OAuth2",
//       user: "hzdev231@gmail.com",
//       clientId: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       refreshToken: process.env.REFRESH_TOKEN,
//       accessToken: accessToken,
//     },
//   });

//   let productInfo = '';
//   orderDetails.forEach(detail => {
//     productInfo += `- Sản phẩm ID: ${detail.shoeId._id}, Số lượng: ${detail.quantity}\n`;
//   });

//   const mailOptions = {
//     from: "hzdev231@gmail.com",
//     to: user.nameAccount,
//     subject: "Thông tin Đơn hàng của bạn",
//     text: `Thông tin đơn hàng:\n- Tên người nhận: ${nameOrder}\n- Số điện thoại: ${phoneNumber}\n- Địa chỉ: ${addressOrder}\n- Tổng tiền: ${total}\n- Mã đơn hàng: ${orderId}\n- Sản phẩm:\n${productInfo}`,
//     html: `
//       <p>Thông tin đơn hàng:</p>
//       <ul>
//         <li>Tên người nhận: ${nameOrder}</li>
//         <li>Số điện thoại: ${phoneNumber}</li>
//         <li>Địa chỉ: ${addressOrder}</li>
//         <li>Tổng tiền: ${total}</li>
//         <li>Mã đơn hàng: ${orderId}</li>
//         <li>Sản phẩm:</li>
//         <ul>
//           ${orderDetails.map(item => `<li>Sản phẩm ID: ${item.shoeId._id}, Số lượng: ${item.quantity} <br><img src="${item.shoeId.thumbnail}" alt="Shoe Image" /></li>`).join('')}
//         </ul>
//       </ul>
//     `,
//   };

//   const result = await transporter.sendMail(mailOptions);
//   console.log("Email sent: " + result.response);
// };



// Hủy đơn hàng trạng thái Chờ xác nhận
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancelOrder } = req.body;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng với id ${orderId}` });
    }
    if (order.status !== 1) {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".' });
    }

    order.status = 6;
    order.orderStatusDetails.push({
      status: 'Đã hủy',
      vietnamDate,
      note: `Đơn hàng đã được hủy bởi người dùng. Lý do: ${cancelOrder || 'Không có lý do.'}`, 
    });

    await order.save();

    // Hoàn lại số lượng sản phẩm vào kho
    const orderDetails = await OderDetailModel.find({ orderId: order._id });
    
    for (let item of orderDetails) {
      const shoe = await ShoeModel.findById(item.shoeId);
      const storageItem = await StorageShoeModel.findOne({
        shoeId: item.shoeId,
        colorShoe: item.colorId,
        "sizeShoe.sizeId": item.sizeId,
      });


      const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
      const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

      if (sizeIndex !== -1 && colorIndex !== -1) {
        const stockIndex = sizeIndex * shoe.colorShoe.length + colorIndex;

        // Hoàn lại số lượng giày trong ShoeModel
        shoe.storageShoe[stockIndex].soldQuanlity += item.quantity;
        shoe.soldQuanlityAll += item.quantity;
        await shoe.save();

        // Hoàn lại số lượng giày trong StorageShoeModel
        const sizeShoeToUpdate = storageItem.sizeShoe.find(size => size.sizeId.equals(item.sizeId));
        sizeShoeToUpdate.quantity += item.quantity;
        storageItem.soldQuanlity += item.quantity;
        await storageItem.save();
      }
    }

    // Kiểm tra và hoàn lại mã giảm giá 
    if (order.discointId) {
      const discount = await DiscountModel.findById(order.discointId);
      if (discount) {
        discount.maxUser += 1;  
        await discount.save();
      }
    }

    await sendNotificationUser(
      order.userId,
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${order._id} của bạn đã được hủy . Lý do: ${cancelOrder || 'Không có lý do.'}`,
      'OrderCanceled',
      order._id,
      new Date()
    );

    await sendNotificationAdmin(
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${order._id} đã bị hủy. Lý do: ${cancelOrder || 'Không có lý do.'}`,
      'OrderCanceled',
      order._id,
      new Date()
    );

    res.status(200).json({ message: 'Đơn hàng đã được hủy thành công.', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng.', error: err.message });
  }
};




//Hoàn hàng
const returnOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);
    if (order) {
      if (order.status === 'Đã giao hàng') {
        order.status = 'Đã hoàn';
        order.orderStatusDetails.push({
          status: 'Đã hoàn',
          timestamp: vietnamDate,
          note: 'Đơn hàng đã hoàn'
        });
        await order.save();

        const orderDetails = await OderDetailModel.find({ orderId: order._id });


        for (let detail of orderDetails) {
          const shoe = await ShoeModel.findById(detail.shoeId);

          if (shoe) {

            const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(detail.sizeId));
            const colorIndex = shoe.colorShoe.findIndex(color => color.equals(detail.colorId));

            if (sizeIndex !== -1 && colorIndex !== -1) {
              const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;
              const storageItem = shoe.storageShoe[storageIndex];

              storageItem.importQuanlity += detail.quantity;
              shoe.sellQuanlityAll -= detail.quantity;
              shoe.sellQuanlityAll -= detail.quantity;
              await shoe.save();
            } else {
              return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${detail.shoeId}, size ${detail.sizeId}, màu ${detail.colorId}.` });
            }
          } else {
            return res.status(400).json({ message: `Không tìm thấy giày với id ${detail.shoeId}` });
          }
        }

        if (order.discointId) {
          const discount = await DiscountModel.findById(order.discointId);

          if (discount && discount.isActive) {
            discount.maxUser += 1;
            await discount.save();
          }
        }

        sendNotificationUser(
          order.userId,
          'Đơn hàng đã hoàn',
          `Đơn hàng #${orderId} của bạn đã hoàn.`,
          'OrderReturned',
          orderDetails[0].shoeId,
          vietnamDate
        );

        sendNotificationAdmin(
          'Đơn hàng đã hoàn',
          `Đơn hàng #${orderId} đã hoàn.`,
          'OrderReturned',
          orderDetails[0].shoeId,
          vietnamDate
        );

        res.status(200).json({ message: 'Đơn hàng đã hoàn và thông báo đã được gửi.', order });
      } else {
        res.status(400).json({ message: 'Chỉ có thể hoàn đơn hàng khi trạng thái là "Đã giao hàng".' });
      }
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hoàn đơn hàng.', error: err.message });
  }
};

//Xác  nhận hàng
const confirmOrderReceived = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.status != 5) {
      return res.status(400).json({ message: 'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao thành công" sang "Đã nhận hàng".' });
    }

    const orderDetails = await OderDetailModel.find({ orderId });


    order.status = 0;
    order.orderStatusDetails.push({
      status: 'Đã nhận hàng',
      timestamp: vietnamDate,
      note: 'Đơn hàng đã được nhận'
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      'Xác nhận đã nhận hàng',
      `Đơn hàng #${orderId} của bạn đã được xác nhận là đã nhận hàng.`,
      'OrderDelivered',
      orderDetails[0].shoeId,
      vietnamDate

    );

    sendNotificationAdmin(
      'Xác nhận đã nhận hàng',
      `Đơn hàng #${orderId} đã được xác nhận là đã giao hàng.`,
      'OrderDelivered',
      orderDetails[0].shoeId,
      vietnamDate

    );

    res.status(200).json({ message: 'Trạng thái đơn hàng đã được cập nhật thành "Đã nhận hàng" và thông báo đã được gửi.', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng.', error: err.message });
  }
};
const autoConfirmOrderReceived = async () => {
  try {
    const daysToWait = 7; // Số ngày chờ trước khi tự động xác nhận
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToWait));
console.log(cutoffDate);

    // Tìm các đơn hàng đã giao nhưng chưa được xác nhận và đã vượt quá số ngày chờ
    const ordersToConfirm = await OrderModel.find({
      status: 5, // Giao thành công
      dateOrder: { $lte: cutoffDate }
    });



    for (const order of ordersToConfirm) {
      order.status = 0; // Đã nhận hàng
      order.orderStatusDetails.push({
        status: 'Đã nhận hàng',
        timestamp: vietnamDate,
        note: 'Hệ thống tự động xác nhận đơn hàng.'
      });
  
    const orderDetails = await OderDetailModel.find( order.orderId );


      await order.save();

      sendNotificationUser(
        order.userId,
        'Đơn hàng đã được xác nhận tự động',
        `Đơn hàng #${order._id} của bạn đã được hệ thống tự động xác nhận là đã nhận hàng.`,
        'OrderDelivered',
        orderDetails[0].shoeId,
        vietnamDate
      );

      sendNotificationAdmin(
        'Đơn hàng đã được xác nhận tự động',
        `Đơn hàng #${order._id} đã được hệ thống tự động xác nhận là đã giao hàng.`,
        'OrderDelivered',
        orderDetails[0].shoeId,
        vietnamDate
      );
    }
  } catch (err) {
    console.error('Lỗi khi tự động xác nhận đơn hàng:', err.message);
  }
};


// hiển thị list đơn hàng user, lấy đơn hàng đầu tiên đại diện 1 đơn hàng
const getUserOrdersWithFirstItem = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await OrderModel.find({ userId })
      .populate('userId', '_id')
      .lean();

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Người dùng chưa có đơn hàng.' });
    }

    const orderResponses = await Promise.all(orders.map(async (order) => {
      const orderDetails = await OderDetailModel.find({ orderId: order._id })
        .populate({
          path: 'shoeId',
          select: 'name price thumbnail',
        })
        .populate({
          path: 'sizeId',
          model: 'SizeShoeModel',
          select: 'size',
        })
        .populate({
          path: 'colorId',
          model: 'ColorShoeModel',
          select: 'textColor codeColor',
        })
        .lean();

      // Lấy chi tiết đơn hàng đầu tiên trong danh sách chi tiết đơn hàng
      const firstDetail = orderDetails.length > 0 ? orderDetails[0] : null;

      return {
        _id: order._id,
        userId: order.userId?._id,
        total: order.total,
        status: order.status,
        name: firstDetail.shoeId.name,
        price: firstDetail.shoeId.price,
        thumbnail: firstDetail.shoeId.thumbnail,
        size: firstDetail.sizeId ? firstDetail.sizeId.size : null,
        textColor: firstDetail.colorId ? firstDetail.colorId.textColor : null,
        codeColor: firstDetail.colorId ? firstDetail.colorId.codeColor : null,
        quantity: firstDetail.quantity,
      };
    }));

    res.status(200).json(orderResponses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
  }
};


// Hiển thị thông tin đơn hàng by orderId
const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId)
      .populate({
        path: 'discointId',
        select: 'discountAmount',
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const orderResponse = {
      _id: order._id,
      nameOrder: order.nameOrder,
      phoneNumber: order.phoneNumber,
      addressOrder: order.addressOrder,
      total: order.total,
      dateOrder: order.dateOrder,
      status: order.status,
      orderStatusDetail: order.orderStatusDetails,
      discountAmount: order.discointId ? order.discointId.discountAmount : null,
    };

    res.status(200).json(orderResponse);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng.', error: err.message });
  }
};
//Hiển thị list giày  by orderId
const getOrderShoeById = async (req, res) => {
  const { orderId } = req.params;
  try {

    if (!orderId) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const orderDetails = await OderDetailModel.find({ orderId })
      .populate({
        path: 'shoeId',
        select: 'name price thumbnail',
      })
      .populate({
        path: 'sizeId',
        model: 'SizeShoeModel',
        select: 'size',
      })
      .populate({
        path: 'colorId',
        model: 'ColorShoeModel',
        select: 'textColor codeColor',
      })
      .lean();

    const orderResponse = {
      _id: orderId,
      details: orderDetails.map(detail => ({
        shoeId: {
          _id: detail.shoeId._id,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity,

        },
      }))
    };

    res.status(200).json(orderResponse);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng.', error: err.message });
  }
};

const updateOrderAndRateShoe = async (req, res) => {
  const { shoeId, userId, rateNumber, commentText, oderId } = req.body; 
  const shoeIds = Array.isArray(shoeId) ? shoeId : [shoeId];  
  const orderIds = Array.isArray(oderId) ? oderId : [oderId]; 

  try {
    const shoeIdArray = Array.isArray(shoeIds) ? shoeIds : [shoeIds];
    const orderIdArray = Array.isArray(orderIds) ? orderIds : [orderIds];

    if (shoeIdArray.length === 0) {
      return res.status(400).json({ message: "Danh sách shoeId không hợp lệ." });
    }
    if (orderIdArray.length === 0) {
      return res.status(400).json({ message: "Danh sách orderId không hợp lệ." });
    }


    
    const updatedShoes = [];
    for (const shoeId of shoeIdArray) {
      console.log('shoeId:', shoeId);
      const shoe = await ShoeModel.findById(shoeId);
      if (!shoe) {
        return res.status(404).json({ message: `Không tìm thấy giày với ID: ${shoeId}` });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: `Không tìm thấy người dùng với ID: ${userId}` });
      }

      const order = await OrderModel.findOne({ _id: { $in: orderIdArray }, status: -1 });
      if (order) {
          return res.status(400).json({ message: "Đơn hàng này đã được đánh giá, không thể đánh giá lại." });
      }

      const newComment = {
        userName: user._id,
        commetText: commentText,
        rateNumber: rateNumber,
      };

      console.log(newComment);
      
      shoe.rateShoe.comment.push(newComment);

      let totalRating = shoe.rateShoe.comment.reduce(
        (acc, curr) => acc + curr.rateNumber,
        0
      );
      shoe.rateShoe.starRate = parseFloat(
        (totalRating / shoe.rateShoe.comment.length).toFixed(1)
      );

      const updatedShoe = await shoe.save();
      updatedShoes.push(updatedShoe);
    }

    const updatedOrders = [];
    for (const orderId of orderIdArray) { 
      console.log('orderId:', orderId);
      const order = await OrderModel.findById(orderId).lean();

      if (!order) {
        return res.status(404).json({ message: `Không tìm thấy đơn hàng với ID: ${orderId}` });
      }

      let newStatus;
      if (order.status === 0) {
        newStatus = -1;
      // } else if (order.status === -1) {
      //   newStatus = 1;
      }else {
        newStatus = order.status; 
      }

      await OrderModel.findByIdAndUpdate(orderId, { status: newStatus });

      const orderDetails = await OderDetailModel.find({ orderId: order._id })
        .populate({
          path: 'shoeId',
          select: 'name',
        })
        .populate({
          path: 'sizeId',
          select: 'size',
        })
        .populate({
          path: 'colorId',
          select: 'textColor codeColor',
        })
        .lean();

      const orderDetailsResponse = orderDetails.map(detail => ({
        shoeName: detail.shoeId ? detail.shoeId.name : "Không có tên giày",
        size: detail.sizeId ? detail.sizeId.size : "Không có kích thước",
        color: detail.colorId ? detail.colorId.textColor : "Không có màu sắc",
        timestamp: detail.timestamp ? detail.timestamp : "Không ",
      }));

      updatedOrders.push({
        orderId,
        newStatus,
        orderDetails: orderDetailsResponse,
      });
    }

    return res.status(200).json({
      message: "Đánh giá giày và cập nhật trạng thái đơn hàng thành công.",
      updatedShoes,
      updatedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await OrderModel.findById(orderId)
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    let newStatus;
    const currentDate = new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(new Date());

    const orderStatusDetails = order.orderStatusDetails || [];

    if (order.status === 1) {
      orderStatusDetails.push({timestamp: currentDate});
      newStatus = 2;
    } else if (order.status === 2) {
      orderStatusDetails.push({timestamp: currentDate});
      newStatus = 3;
    } else if (order.status === 3) {
      orderStatusDetails.push({timestamp: currentDate});
      newStatus = 4;
    } else if (order.status === 4) {
      orderStatusDetails.push({timestamp: currentDate});
      newStatus = 0;
    } else if (order.status === 0) {

      return res.status(400).json({ message: "Đơn hàng đã hoàn thành và không thể thay đổi."});
    }

    // Cập nhật trạng thái đơn hàng
    await OrderModel.findByIdAndUpdate(orderId, { status: newStatus,orderStatusDetails}, { new: true });

    // Lấy chi tiết đơn hàng
    const orderDetails = await OderDetailModel.find({ orderId: order._id })
      .populate({
        path: 'shoeId',
        select: 'name',
      })
      .populate({
        path: 'sizeId',
        model: 'SizeShoeModel',
        select: 'size',
      })
      .populate({
        path: 'colorId',
        model: 'ColorShoeModel',
        select: 'textColor codeColor',
      })
      .lean();

    const orderDetailsResponse = orderDetails.map(detail => ({
      shoeName: detail.shoeId ? detail.shoeId.name : "Không có tên giày",
      size: detail.sizeId ? detail.sizeId.size : "Không có kích thước",
      color: detail.colorId ? detail.colorId.textColor : "Không có màu sắc",
      timestamp:detail.timestamp ? detail.timestamp : "Không có ngày"
    }));

    return res.status(200).json({
      message: `New status  ${newStatus}`,
      orderDetails: orderDetailsResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
// const getUserCompletedOrders = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const orders = await OrderModel.find({ userId, status: 0 })
//       .populate('userId', '_id')
//       .populate('discointId')
//       .lean();

//     if (orders.length === 0) {
//       return res.status(404).json({ message: 'Người dùng chưa có đơn hàng đã hoàn thành.' });
//     }

//     const orderResponses_status0 = [];

//     for (const order of orders) {
//       const orderDetails = await OderDetailModel.find({ orderId: order._id })
//         .populate({
//           path: 'shoeId',
//           select: 'name price thumbnail',
//         })
//         .populate({
//           path: 'sizeId',
//           model: 'SizeShoeModel',
//           select: 'size',
//         })
//         .populate({
//           path: 'colorId',
//           model: 'ColorShoeModel',
//           select: 'textColor codeColor',
//         })
//         .lean();

//       const discountAmount = order.discointId ? order.discointId.discountAmount : 0;
//       const promo = orderDetails.reduce((sum, detail) => sum + (discountAmount * detail.quantity), 0);
//       const totalPre = promo + order.total;

//       const orderData = {
//         _id: order._id,
//         name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : null,
//         thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
//         totalPre: totalPre,
//         total: order.total,
//         promo: promo,
//         status: "completed",
//         dateOrder: order.dateOrder,
//         dateReceived: order.dateReceived,
//         pay: order.pay,
//         orderDetails: orderDetails.map(detail => ({
//           amount: detail.quantity * (order.discointId ? discountAmount : detail.shoeId.price),
//           _id: detail._id,
//           name: detail.shoeId.name,
//           price: detail.shoeId.price,
//           thumbnail: detail.shoeId.thumbnail,
//           size: detail.sizeId ? detail.sizeId.size : null,
//           textColor: detail.colorId ? detail.colorId.textColor : null,
//           codeColor: detail.colorId ? detail.colorId.codeColor : null,
//           quantity: detail.quantity
//         })),
//       };

//       orderResponses_status0.push(orderData);
//     }

//     res.status(200).json(orderResponses_status0);
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng đã hoàn thành.', error: err.message });
//   }
// };

const getUserCompletedOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await OrderModel.find({ 
    userId: userId, 
    $or: [
      { status: 0 },
      { status: -1 }
    ]
  })
  .populate('userId', '_id')
  .populate('discointId')
  .lean();

    if (orders.length === 0) {
      return res.status(200).json({ message: 'Danh Sách Trống.' });
    } 


    const orderResponses = [];

    for (const order of orders) {
      const orderDetails = await OderDetailModel.find({ orderId: order._id })
        .populate({
          path: 'shoeId',
          select: 'name price thumbnail',
        })
        .populate({
          path: 'sizeId',
          model: 'SizeShoeModel',
          select: 'size',
        })
        .populate({
          path: 'colorId',
          model: 'ColorShoeModel',
          select: 'textColor codeColor',
        })
        .lean();

      const discountAmount = order.discointId ? order.discointId.discountAmount : 0;
      const promo = orderDetails.reduce((sum, detail) => sum + (discountAmount * detail.quantity), 0);
      const totalPre = promo + order.total;
      const formattedDateOrder = new Date(order.dateOrder).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      let statusLabel;
      if (order.status === 0) {
        statusLabel = "completed"; 
      } else if (order.status === -1) {
        statusLabel = "rateCompleted";
      }

      const orderData = {
        _id: order._id,
        nameOrder: order.nameOrder,
        phoneNumber: order.phoneNumber,
        addressOrder: order.addressOrder,
        thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
        totalPre: totalPre,
        total: order.total,
        promo: promo,
        status: statusLabel, 
        dateOrder: formattedDateOrder,
        dateReceived: order.dateReceived,
        pay: order.pay,
        orderStatusDetails: order.orderStatusDetails,
        orderDetails: orderDetails.map(detail => ({
          amount: detail.quantity * (order.discointId ? discountAmount : detail.shoeId.price),
          _id: detail._id,
          shoeId:detail.shoeId._id,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity
        })),
      };

      orderResponses.push(orderData);
    }

    res.status(200).json(orderResponses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
  }
};


const getUserActiveOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    // const orders = await OrderModel.find({ userId, status: { $ne: 0, $ne:-1 } })
    const orders = await OrderModel.find({ 
      userId: userId, 
      status: { $nin: [0, -1] }
    })
      .populate('userId', '_id')
      .populate('discointId')
      .lean();

    // Kiểm tra nếu không có đơn hàng nào đang hoạt động
    if (orders.length === 0) {
      return res.status(200).json({ message: 'Danh Sách Trống.' });
    }

    const orderResponses_active = [];

    for (const order of orders) {
      // Lấy chi tiết đơn hàng
      const orderDetails = await OderDetailModel.find({ orderId: order._id })
        .populate({
          path: 'shoeId',
          select: 'name price thumbnail',
        })
        .populate({
          path: 'sizeId',
          model: 'SizeShoeModel',
          select: 'size',
        })
        .populate({
          path: 'colorId',
          model: 'ColorShoeModel',
          select: 'textColor codeColor',
        })
        .lean();

      // Tính giá trị khuyến mãi (nếu có)
      const discountAmount = order.discointId ? order.discointId.discountAmount : 0;
      const promo = orderDetails.reduce((sum, detail) => sum + (discountAmount * detail.quantity), 0);
      const totalPre = promo + order.total;

      const formattedDateOrder = new Date(order.dateOrder).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Tạo dữ liệu phản hồi cho đơn hàng
      const orderData = {
        _id: order._id,
        nameOrder: order.nameOrder,
        phoneNumber: order.phoneNumber,
        addressOrder: order.addressOrder,
        thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
        totalPre: totalPre,
        total: order.total,
        promo: promo,
        status: "active",
        dateOrder: formattedDateOrder,
        pay: order.pay,
        orderStatusDetails: order.orderStatusDetails, // Hiển thị chi tiết trạng thái đơn hàng
        orderDetails: orderDetails.map(detail => ({
          amount: detail.quantity * (order.discointId ? discountAmount : detail.shoeId.price),
          _id: detail._id,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity
        })),
      };

      orderResponses_active.push(orderData);
    }

    // Trả về danh sách đơn hàng đang hoạt động
    res.status(200).json(orderResponses_active);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng đang hoạt động.', error: err.message });
  }
};





module.exports = {
  createOrder,
  cancelOrder,
  returnOrder,
  confirmOrderReceived,
  autoConfirmOrderReceived,
  getUserOrdersWithFirstItem,
  getOrderById,
  getOrderShoeById,

  updateOrderAndRateShoe,
  updateOrderStatus,
  getUserCompletedOrders,
  getUserActiveOrders
};
