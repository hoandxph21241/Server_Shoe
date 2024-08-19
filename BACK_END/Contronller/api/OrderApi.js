const { sendNotificationUser } = require('../../Contronller/api/Navigation_api');
const { sendNotificationAdmin } = require('../../Contronller/Navigation_Controller');
const { OrderModel, OderDetailModel, DiscountModel, ShoeModel, UserModel,StorageShoeModel, SizeShoeModel,ColorShoeModel } = require('../../Models/DB_Shoes');
const vietnamDate = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh'
}).format(new Date());

// const createOrder = async (req, res) => {
//   const { userId, nameOrder, phoneNumber, addressOrder, pay, items, discointId } = req.body;

//   try {
//     let total = 0;
//     let discountAmount = 0;

//     // Tính tổng tiền dựa trên giá từ ShoeModel và cập nhật số lượng tồn kho
//     for (let item of items) {
//       const shoe = await ShoeModel.findById(item.shoeId);
//       if (shoe) {
//         // Tìm và cập nhật số lượng tồn kho cho size và màu cụ thể
//         const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
//         const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

//         if (sizeIndex !== -1 && colorIndex !== -1) {
//           if (shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity >= item.quantity) {
//             shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity -= item.quantity;
//             shoe.sellQuanlityAll += item.quantity;
//             await shoe.save();
//           } else {
//             return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//           }
//         } else {
//           return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//         }

//         total += shoe.price * item.quantity;
//       } else {
//         return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
//       }
//     }

//     // Kiểm tra và áp dụng giảm giá
//     if (discointId) {
//       const discount = await DiscountModel.findById(discointId);
//       if (discount) {
//         if (discount.isActive && discount.maxUser > 0) {
//           discountAmount = parseFloat(discount.discountAmount) || 0;
//           total -= discountAmount;

//           // Giảm số lần sử dụng của mã giảm giá
//           discount.maxUser -= 1;
//           await discount.save();
//         } else if (!discount.isActive) {
//           return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
//         } else if (discount.maxUser <= 0) {
//           return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
//         }
//       } else {
//         return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
//       }
//     }

//     const newOrder = await OrderModel.create({
//       userId,
//       nameOrder,
//       phoneNumber,
//       addressOrder,
//       pay,
//       total,
//       dateOrder: Date.now(), 
//       status: 'Chờ xác nhận',
//       discointId,
//       orderStatusDetails: [
//         {
//           status: 'Chờ xác nhận',
//           timestamp: vietnamDate,
//           note: 'Đơn hàng mới được tạo'
//         }
//       ]
//     });

//     const orderDetails = items.map(item => ({
//       orderId: newOrder._id,
//       shoeId: item.shoeId,
//       sizeId: item.sizeId,
//       colorId: item.colorId,
//       quantity: item.quantity,
//     }));
//     await OderDetailModel.insertMany(orderDetails);


//     sendNotificationUser(
//       userId,
//       'Đơn hàng mới',
//       `Đơn hàng #${newOrder._id} của bạn đã được tạo thành công. Tổng tiền: ${total} VND`,
//       'OrderCreated',
//       items[0].shoeId,
//       vietnamDate
//     );

//     sendNotificationAdmin(
//       'Đơn hàng mới',
//       `Một đơn hàng mới #${newOrder._id} đã được đặt. Tổng tiền: ${total} VND`,
//       'OrderCreated',
//       items[0].shoeId,
//       vietnamDate
//     );

//     res.status(201).json({ message: 'Đơn hàng đã được tạo và thông báo đã được gửi.', order: newOrder });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
//   }
// };


// const createOrder = async (req, res) => {
//   const { userId, nameOrder, phoneNumber, addressOrder, pay, items, discountId } = req.body;

//   try {
//     let total = 0;
//     let discountAmount = 0;

//     // Tính tổng tiền dựa trên giá từ ShoeModel và cập nhật số lượng tồn kho
//     for (let item of items) {
//       const shoe = await ShoeModel.findById(item.shoeId);
//       if (shoe) {
//         // Tìm vị trí chính xác của size và màu trong storageShoe
//         const storageIndex = shoe.storageShoe.findIndex(
//           storage =>
//             storage.sizeShoe.sizeId.equals(item.sizeId) &&
//             storage.colorShoe.colorId.equals(item.colorId)
//         );

//         if (storageIndex !== -1) {
//           if (shoe.storageShoe[storageIndex].importQuanlity >= item.quantity) {
//             shoe.storageShoe[storageIndex].importQuanlity -= item.quantity;
//             shoe.sellQuanlityAll += item.quantity;
//             await shoe.save();
//           } else {
//             return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//           }
//         } else {
//           return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}.` });
//         }

//         total += shoe.price * item.quantity;
//       } else {
//         return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
//       }
//     }

//     // Kiểm tra và áp dụng giảm giá
//     if (discountId) {
//       const discount = await DiscountModel.findById(discountId);
//       if (discount) {
//         if (discount.isActive && discount.maxUser > 0) {
//           discountAmount = parseFloat(discount.discountAmount) || 0;
//           total -= discountAmount;

//           // Giảm số lần sử dụng của mã giảm giá
//           discount.maxUser -= 1;
//           await discount.save();
//         } else if (!discount.isActive) {
//           return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
//         } else if (discount.maxUser <= 0) {
//           return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
//         }
//       } else {
//         return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
//       }
//     }

//     const newOrder = await OrderModel.create({
//       userId,
//       nameOrder,
//       phoneNumber,
//       addressOrder,
//       pay,
//       total,
//       dateOrder: new Date().toISOString(), 
//       status: 1, // Trạng thái chờ xác nhận
//       discountId,
//       orderStatusDetails: [
//         {
//           amount: discountAmount,
//           shoeId: items[0].shoeId, 
//           note: 'Đơn hàng mới được tạo'
//         }
//       ]
//     });

//     const orderDetails = items.map(item => ({
//       orderId: newOrder._id,
//       shoeId: item.shoeId,
//       sizeId: item.sizeId,
//       colorId: item.colorId,
//       quantity: item.quantity,
//     }));
//     await OderDetailModel.insertMany(orderDetails);

//     // sendNotificationUser(
//     //   userId,
//     //   'Đơn hàng mới',
//     //   `Đơn hàng #${newOrder._id} của bạn đã được tạo thành công. Tổng tiền: ${total} VND`,
//     //   'OrderCreated',
//     //   items[0].shoeId,
//     //   new Date().toISOString()
//     // );

//     // sendNotificationAdmin(
//     //   'Đơn hàng mới',
//     //   `Một đơn hàng mới #${newOrder._id} đã được đặt. Tổng tiền: ${total} VND`,
//     //   'OrderCreated',
//     //   items[0].shoeId,
//     //   new Date().toISOString()
//     // );

//     res.status(201).json({ message: 'Đơn hàng đã được tạo và thông báo đã được gửi.', order: newOrder });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
//   }
// };

// const createOrder = async (req, res) => {
//   const { userId, pay, items, discointId } = req.body;

//   try {
//     let total = 0;
//     let discountAmount = 0;

//     // Lấy thông tin người dùng từ UserModel
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(400).json({ message: 'Không tìm thấy người dùng với ID đã cung cấp.' });
//     }

//     const { userName: nameOrder, phoneNumber, gmail: addressOrder } = user;

//     // Tính tổng tiền và cập nhật số lượng tồn kho
//     for (let item of items) {
//       const shoe = await ShoeModel.findById(item.shoeId);
//       if (shoe) {
//         const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
//         const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

//         if (sizeIndex !== -1 && colorIndex !== -1) {
//           if (shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity >= item.quantity) {
//             shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity -= item.quantity;
//             shoe.sellQuanlityAll += item.quantity;
//             await shoe.save();
//           } else {
//             return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//           }
//         } else {
//           return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//         }

//         total += shoe.price * item.quantity;
//       } else {
//         return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
//       }
//     }

//     // Kiểm tra và áp dụng giảm giá
//     if (discointId) {
//       const discount = await DiscountModel.findById(discointId);
//       if (discount) {
//         if (discount.isActive && discount.maxUser > 0) {
//           discountAmount = parseFloat(discount.discountAmount) || 0;
//           total -= discountAmount;
//           discount.maxUser -= 1;
//           await discount.save();
//         } else if (!discount.isActive) {
//           return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
//         } else if (discount.maxUser <= 0) {
//           return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
//         }
//       } else {
//         return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
//       }
//     }

//     const newOrder = await OrderModel.create({
//       userId,
//       nameOrder,
//       phoneNumber,
//       addressOrder,
//       pay,
//       total,
//       dateOrder: vietnamDate,
//       status: 1, // Đặt status mặc định là 1
//       discointId,
//       orderStatusDetails: [
//         {
//           amount: discountAmount,
//           shoeId: items[0].shoeId,
//           note: 'Đơn hàng mới được tạo'
//         }
//       ]
//     });

//     const orderDetails = items.map(item => ({
//       orderId: newOrder._id,
//       shoeId: item.shoeId,
//       sizeId: item.sizeId,
//       colorId: item.colorId,
//       quantity: item.quantity,
//     }));
//     await OderDetailModel.insertMany(orderDetails);

//     res.status(201).json({ message: 'Đơn hàng đã được tạo thành công.', order: newOrder });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
//   }
// };


// const createOrder = async (req, res) => {
//   const { userId, pay, items, discointId } = req.body;

//   try {
//     let total = 0;
//     let discountAmount = 0;

//     // Lấy thông tin người dùng từ UserModel
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(400).json({ message: 'Không tìm thấy người dùng với ID đã cung cấp.' });
//     }

//     const { userName: nameOrder, phoneNumber, gmail: addressOrder } = user;

//     // Tính tổng tiền và cập nhật số lượng tồn kho
//     for (let item of items) {
//       const shoe = await ShoeModel.findById(item.shoeId);
//       if (shoe) {
//         const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
//         const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

//         if (sizeIndex !== -1 && colorIndex !== -1) {
//           // Tính chỉ số trong mảng storageShoe
//           const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;

//           if (storageIndex < shoe.storageShoe.length) {
//             if (shoe.storageShoe[storageIndex].importQuanlity >= item.quantity) {
//               shoe.storageShoe[storageIndex].importQuanlity -= item.quantity;
//               shoe.sellQuanlityAll += item.quantity;
//               await shoe.save();
//             } else {
//               return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//             }
//           } else {
//             return res.status(400).json({ message: `Không tìm thấy số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//           }

//         } else {
//           return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//         }

//         total += shoe.price * item.quantity;
//       } else {
//         return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
//       }
//     }

//     // Kiểm tra và áp dụng giảm giá
//     if (discointId) {
//       const discount = await DiscountModel.findById(discointId);
//       if (discount) {
//         if (discount.isActive && discount.maxUser > 0) {
//           discountAmount = parseFloat(discount.discountAmount) || 0;
//           total -= discountAmount;
//           discount.maxUser -= 1;
//           await discount.save();
//         } else if (!discount.isActive) {
//           return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
//         } else if (discount.maxUser <= 0) {
//           return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
//         }
//       } else {
//         return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
//       }
//     }

//     const newOrder = await OrderModel.create({
//       userId,
//       nameOrder,
//       phoneNumber,
//       addressOrder,
//       pay,
//       total,
//       dateOrder: vietnamDate,
//       status: 1, // Đặt status mặc định là 1
//       discointId,
//       orderStatusDetails: [
//         {
//           amount: discountAmount,
//           shoeId: items[0].shoeId,
//           note: 'Đơn hàng mới được tạo'
//         }
//       ]
//     });

//     const orderDetails = items.map(item => ({
//       orderId: newOrder._id,
//       shoeId: item.shoeId,
//       sizeId: item.sizeId,
//       colorId: item.colorId,
//       quantity: item.quantity,
//     }));
//     await OderDetailModel.insertMany(orderDetails);

//     res.status(201).json({ message: 'Đơn hàng đã được tạo thành công.', order: newOrder });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
//   }
// };

// fix ok
// const createOrder = async (req, res) => {
//   const { userId, pay, items, discointId } = req.body;

//   try {
//     let total = 0;
//     let discountAmount = 0;

//     // Lấy thông tin người dùng từ UserModel
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(400).json({ message: 'Không tìm thấy người dùng với ID đã cung cấp.' });
//     }

//     const { userName: nameOrder, phoneNumber, gmail: addressOrder } = user;

//     // Tính tổng tiền và cập nhật số lượng tồn kho
//     for (let item of items) {
//       const storage = await StorageShoeModel.findOne({
//         shoeId: item.shoeId,
//         colorShoe: item.colorId,
//         "sizeShoe.sizeId": item.sizeId
//       });

//       if (storage) {
//         const sizeIndex = storage.sizeShoe.findIndex(size => size.sizeId.equals(item.sizeId));
        
//         if (sizeIndex !== -1) {
//           const sizeInfo = storage.sizeShoe[sizeIndex];
//           if (sizeInfo.quantity >= item.quantity) {
//             // Cập nhật số lượng tồn kho
//             sizeInfo.quantity -= item.quantity;
//             storage.sellQuanlity -= item.quantity;

//             // Lưu thay đổi
//             await storage.save();
//           } else {
//             return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//           }
//         } else {
//           return res.status(400).json({ message: `Không tìm thấy size cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
//         }

//         total += (await ShoeModel.findById(item.shoeId)).price * item.quantity;
//       } else {
//         return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}, màu ${item.colorId} và size ${item.sizeId}` });
//       }
//     }

//     // Kiểm tra và áp dụng giảm giá
//     if (discointId) {
//       const discount = await DiscountModel.findById(discointId);
//       if (discount) {
//         if (discount.isActive && discount.maxUser > 0) {
//           discountAmount = parseFloat(discount.discountAmount) || 0;
//           total -= discountAmount;
//           discount.maxUser -= 1;
//           await discount.save();
//         } else if (!discount.isActive) {
//           return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
//         } else if (discount.maxUser <= 0) {
//           return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
//         }
//       } else {
//         return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
//       }
//     }

//     const newOrder = await OrderModel.create({
//       userId,
//       nameOrder,
//       phoneNumber,
//       addressOrder,
//       pay,
//       total,
//       dateOrder: vietnamDate,
//       status: 1, // Đặt status mặc định là 1
//       discointId,
//       orderStatusDetails: [
//         {
//           amount: discountAmount,
//           shoeId: items[0].shoeId,
//           note: 'Đơn hàng mới được tạo'
//         }
//       ]
//     });

//     const orderDetails = items.map(item => ({
//       orderId: newOrder._id,
//       shoeId: item.shoeId,
//       sizeId: item.sizeId,
//       colorId: item.colorId,
//       quantity: item.quantity,
//     }));
//     await OderDetailModel.insertMany(orderDetails);

//     res.status(201).json({ message: 'Đơn hàng đã được tạo thành công.', order: newOrder });
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
//   }
// };

const createOrder = async (req, res) => {
  const { userId, pay, items, discointId } = req.body;

  try {
    let total = 0;
    let discountAmount = 0;

    // Lấy thông tin người dùng từ UserModel
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'Không tìm thấy người dùng với ID đã cung cấp.' });
    }

    const { userName: nameOrder, phoneNumber, gmail: addressOrder } = user;

    // Tính tổng tiền và cập nhật số lượng tồn kho
    const orderStatusDetails = []; // Danh sách chi tiết trạng thái đơn hàng

    for (let item of items) {
      const storage = await StorageShoeModel.findOne({
        shoeId: item.shoeId,
        colorShoe: item.colorId,
        "sizeShoe.sizeId": item.sizeId
      });

      if (storage) {
        const sizeIndex = storage.sizeShoe.findIndex(size => size.sizeId.equals(item.sizeId));
        
        if (sizeIndex !== -1) {
          const sizeInfo = storage.sizeShoe[sizeIndex];
          if (sizeInfo.quantity >= item.quantity) {
            // Cập nhật số lượng tồn kho
            sizeInfo.quantity -= item.quantity;
            storage.sellQuanlity += item.quantity;

            // Lưu thay đổi
            await storage.save();
          } else {
            return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
          }
        } else {
          return res.status(400).json({ message: `Không tìm thấy size cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
        }

        // Lấy thông tin giày, kích cỡ và màu sắc
        const shoe = await ShoeModel.findById(item.shoeId);
        const size = await SizeShoeModel.findById(item.sizeId);
        const color = await ColorShoeModel.findById(item.colorId);

        if (!shoe || !size || !color) {
          return res.status(400).json({ message: 'Thông tin giày, kích cỡ hoặc màu sắc không hợp lệ.' });
        }

        // Thêm thông tin sản phẩm vào danh sách chi tiết trạng thái đơn hàng
        orderStatusDetails.push({
          amount: shoe.price * item.quantity,
          shoeId: item.shoeId,
          note: `Đơn hàng mới được tạo cho giày ${shoe.name}, size ${size.size}, màu ${color.textColor}`
        });

        total += shoe.price * item.quantity;
      } else {
        return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}, màu ${item.colorId} và size ${item.sizeId}` });
      }
    }

    // Kiểm tra và áp dụng giảm giá
    if (discointId) {
      const discount = await DiscountModel.findById(discointId);
      if (discount) {
        if (discount.isActive && discount.maxUser > 0) {
          discountAmount = parseFloat(discount.discountAmount) || 0;
          total -= discountAmount;
          discount.maxUser -= 1;
          await discount.save();
        } else if (!discount.isActive) {
          return res.status(400).json({ message: 'Mã giảm giá không hoạt động.' });
        } else if (discount.maxUser <= 0) {
          return res.status(400).json({ message: 'Mã giảm giá đã hết số lần sử dụng.' });
        }
      } else {
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
      }
    }

    // Tạo đơn hàng
    const newOrder = await OrderModel.create({
      userId,
      nameOrder,
      phoneNumber,
      addressOrder,
      pay,
      total,
      dateOrder: vietnamDate,
      status: 1, // Đặt status mặc định là 1
      discointId,
      orderStatusDetails
    });

    // Thêm chi tiết đơn hàng
    const orderDetails = items.map(item => ({
      orderId: newOrder._id,
      shoeId: item.shoeId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      quantity: item.quantity,
    }));
    await OderDetailModel.insertMany(orderDetails);

    // Trả về kết quả
    res.status(201).json({ message: 'Đơn hàng đã được tạo thành công.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
  }
};




// Hủy đơn hàng trạng thái Chờ xác nhận
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancelReason } = req.body; // Lý do hủy

  try {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.status !== 'Chờ xác nhận') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".' });
    }

    order.status = 'Đã hủy';
    order.orderStatusDetails.push({
      status: 'Đã hủy',
      timestamp: vietnamDate,
      note: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`
    });
    await order.save();

    const orderDetails = await OderDetailModel.find({ orderId: order._id });
    for (let item of orderDetails) {
      const shoe = await ShoeModel.findById(item.shoeId);

      if (!shoe) {
        return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
      }

      const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
      const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

      if (sizeIndex === -1 || colorIndex === -1) {
        return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
      }

      const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;
      if (storageIndex < 0 || storageIndex >= shoe.storageShoe.length) {
        return res.status(400).json({ message: `Không tìm thấy mục tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
      }

      shoe.storageShoe[storageIndex].importQuanlity += item.quantity;
      shoe.sellQuanlityAll -= item.quantity;
      await shoe.save();
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
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${orderId}  bạn đã bị hủy. Lý do: ${cancelReason}`,
      'OrderCanceled',
      orderDetails[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      'Đơn hàng đã bị hủy',
      `Đơn hàng #${orderId} đã bị hủy. Lý do người dùng: ${cancelReason}`,
      'OrderCanceled',
      orderDetails[0].shoeId,
      vietnamDate
    );

    res.status(200).json({ message: 'Đơn hàng đã bị hủy và thông báo đã được gửi.', order });
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

    if (order.status !== 'Giao hàng') {
      return res.status(400).json({ message: 'Chỉ có thể chuyển trạng thái đơn hàng từ "Giao hàng" sang "Đã nhận hàng".' });
    }

    order.status = 'Đã nhận hàng';
    order.orderStatusDetails.push({
      status: 'Đã nhận hàng',
      timestamp: vietnamDate,
      note: 'Đơn hàng đã được nhận'
    });

    await order.save();

    sendNotificationUser(
      order.userId,
      'Xác nhận đã nhận hàng',
      `Đơn hàng #${orderId} của bạn đã được xác nhận là đã giao hàng.`,
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
// const getUserOrdersWithDetails = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const orders = await OrderModel.find({ userId })
//       .populate('userId', '_id')
//       .lean();

//     if (orders.length === 0) {
//       return res.status(404).json({ message: 'Người dùng chưa có đơn hàng.' });
//     }

//     const orderResponses = await Promise.all(orders.map(async (order) => {
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

//       // Tính toán các thông tin liên quan
//       const totalPre = order.total + (order.promo || 0); // Tổng tiền trước khuyến mãi
//       const total = order.total; // Tổng tiền sau khuyến mãi
//       const dateReceived = order.dateReceived ? new Date(order.dateReceived).toLocaleString() : "Trống"; // Ngày nhận hàng
//       const dateOrder = order.dateOrder;

//       return {
//         _id: order._id,
//         name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : 'Không có thông tin',
//         thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : 'Không có thông tin',
//         totalPre: totalPre,
//         total: total,
//         promo: order.promo || 0,
//         status: order.status, // Status của đơn hàng
//         dateOrder: dateOrder,
//         dateReceived: dateReceived,
//         Rate: order.Rate || 0,
//         pay: order.pay || 'Không có thông tin',
//         orderDetails: orderDetails.map(detail => ({
//           amount: detail.shoeId.price * detail.quantity, // Tính tổng tiền cho mỗi sản phẩm
//           _id: detail._id,
//           name: detail.shoeId.name,
//           price: detail.shoeId.price,
//           thumbnail: detail.shoeId.thumbnail,
//           size: detail.sizeId ? detail.sizeId.size : 'Không có kích thước',
//           textColor: detail.colorId ? detail.colorId.textColor : 'Không có màu sắc',
//           codeColor: detail.colorId ? detail.colorId.codeColor : 'Không có màu sắc',
//           quantity: detail.quantity
//         }))
//       };
//     }));

//     res.status(200).json(orderResponses);
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
//   }
// };



// test ok 
// const getUserOrdersWithDetails = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     // Tìm đơn hàng của người dùng
//     const orders = await OrderModel.find({ userId })
//       .populate('userId', '_id')
//       .populate('discointId')
//       .lean();

//     if (orders.length === 0) {
//       return res.status(404).json({ message: 'Người dùng chưa có đơn hàng.' });
//     }

//     const orderResponses = await Promise.all(orders.map(async (order) => {
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

//       // Tính toán số tiền giảm giá
//       const discountAmount = order.discointId ? order.discointId.discountAmount : 0;
//       const promo = orderDetails.reduce((sum, detail) => sum + (discountAmount * detail.quantity), 0);

//       // Tính toán giá trị totalPre
//       const totalPre = promo + order.total;

//       return {
//         _id: order._id,
//         name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : null,
//         thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
//         totalPre: totalPre,
//         total: order.total,
//         promo: promo,
//         status: order.status,
//         dateOrder: order.dateOrder,
//         dateReceived: order.dateReceived,
//         // Rate: 0, Nếu có thêm thông tin rate, bạn có thể lấy từ nơi khác
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
//     }));

//     res.status(200).json(orderResponses);
//   } catch (err) {
//     res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
//   }
// };

const getUserOrdersWithDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    // Tìm đơn hàng của người dùng
    const orders = await OrderModel.find({ userId })
      .populate('userId', '_id')
      .populate('discointId')
      .lean();

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Người dùng chưa có đơn hàng.' });
    }

    // Phân loại đơn hàng theo trạng thái
    const orderResponses_status0 = [];
    const orderResponses_active = [];

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

      // Tính toán số tiền giảm giá
      const discountAmount = order.discointId ? order.discointId.discountAmount : 0;
      const promo = orderDetails.reduce((sum, detail) => sum + (discountAmount * detail.quantity), 0);

      // Tính toán giá trị totalPre
      const totalPre = promo + order.total;

      // Xác định trạng thái
      const statusLabel = order.status === 0 ? "completed" : "active";

      const orderData = {
        _id: order._id,
        name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : null,
        thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
        totalPre: totalPre,
        total: order.total,
        promo: promo,
        status: statusLabel,
        dateOrder: order.dateOrder,
        dateReceived: order.dateReceived,
        pay: order.pay,
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

      if (order.status === 0) {
        orderResponses_status0.push(orderData);
      } else {
        orderResponses_active.push(orderData);
      }
    }

    res.status(200).json({
      completed: orderResponses_status0,
      active: orderResponses_active
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
  }
};




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


// hiển thị list đơn hàng user, lấy đơn hàng đầu tiên đại diện 1 đơn hàng
const getHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await OrderModel.find({ userId,  status: 'Đã nhận hàng' })
      .populate('userId', '_id')
      .populate({
        path: 'discointId',
        select: 'discountAmount',
      })
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

      const lastStatusDetail = order.orderStatusDetails.length > 0
      ? order.orderStatusDetails[order.orderStatusDetails.length - 1]
      : null;

      return {
        _id: order._id,
        name: firstDetail.shoeId.name,
        thumbnail: firstDetail.shoeId.thumbnail,
        totalPre: order.total + (order.discointId ? order.discointId.discountAmount : 0),// giá khi chưa áp mã
        total: order.total,// tổng đơn hàng
        promo: order.discointId ? order.discointId.discountAmount : null,// số tiền áp mã
        dateReceived: lastStatusDetail ? lastStatusDetail.timestamp : null, // Use last status detail's timestamp
        status: order.status,
        dateOrder: order.dateOrder,
        rate: order.status === '4' ? 0 : null, // Set rate  0  nếu status là '4'
        pay: order.pay,
        
        orderDetails: orderDetails.map(detail => ({
          amount: detail.shoeId.price * detail.quantity,
          name: detail.shoeId.name,
          price: detail.shoeId.price,
          thumbnail: detail.shoeId.thumbnail,
          size: detail.sizeId ? detail.sizeId.size : null,
          textColor: detail.colorId ? detail.colorId.textColor : null,
          codeColor: detail.colorId ? detail.colorId.codeColor : null,
          quantity: detail.quantity,
        })),
      };
    }));

    res.status(200).json(orderResponses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng.', error: err.message });
  }
};

// Hiển thị danh sách đơn hàng đã nhận hàng
const getConfirmedOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    // Tìm tất cả các đơn hàng với trạng thái 'Đã nhận hàng'
    const confirmedOrders = await OrderModel.find({ status: 'Đã nhận hàng' })
      .populate('userId', '_id name') // Thay đổi để phù hợp với mô hình người dùng của bạn
      .populate({
        path: 'discointId',
        select: 'discountAmount',
      })
      .lean();

    if (confirmedOrders.length === 0) {
      return res.status(404).json({ message: 'Không có đơn hàng đã nhận hàng.' });
    }

    // Lấy thông tin chi tiết cho từng đơn hàng
    const orderResponses = await Promise.all(confirmedOrders.map(async (order) => {
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

      return {
        _id: order._id,
        userId: order.userId?._id,
        total: order.total,
        dateOrder: order.dateOrder,
        status: order.status,
        discountAmount: order.discointId ? order.discointId.discountAmount : null,
        orderDetails: orderDetails.map(detail => ({
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
        })),
      };
    }));

    res.status(200).json(orderResponses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng đã nhận hàng.', error: err.message });
  }
};

const getUserCompletedOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await OrderModel.find({ userId, status: 0 })
      .populate('userId', '_id')
      .populate('discointId')
      .lean();

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Người dùng chưa có đơn hàng đã hoàn thành.' });
    }

    const orderResponses_status0 = [];

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

      const orderData = {
        _id: order._id,
        name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : null,
        thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
        totalPre: totalPre,
        total: order.total,
        promo: promo,
        status: "completed",
        dateOrder: order.dateOrder,
        dateReceived: order.dateReceived,
        pay: order.pay,
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

      orderResponses_status0.push(orderData);
    }

    res.status(200).json(orderResponses_status0);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng đã hoàn thành.', error: err.message });
  }
};


const getUserActiveOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await OrderModel.find({ userId, status: { $gt: 0 } })
      .populate('userId', '_id')
      .populate('discointId')
      .lean();

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Người dùng chưa có đơn hàng đang hoạt động.' });
    }

    const orderResponses_active = [];

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

      const orderData = {
        _id: order._id,
        name: orderDetails.length > 0 ? orderDetails[0].shoeId.name : null,
        thumbnail: orderDetails.length > 0 ? orderDetails[0].shoeId.thumbnail : null,
        totalPre: totalPre,
        total: order.total,
        promo: promo,
        status: "active",
        dateOrder: order.dateOrder,
        dateReceived: order.dateReceived,
        pay: order.pay,
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
  getUserOrdersWithFirstItem,
  getOrderById,
  getOrderShoeById,
  getUserActiveOrders,
  getUserCompletedOrders,
  getHistory,
  getConfirmedOrders,
  getUserOrdersWithDetails,
  updateOrderStatus
};
