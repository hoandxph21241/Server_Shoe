const { sendNotificationUser } = require('../../Contronller/api/Navigation_api');
const { sendNotificationAdmin } = require('../../Contronller/Navigation_Controller');
const { OrderModel, OderDetailModel, DiscountModel, ShoeModel,UserModel } = require('../../Models/DB_Shoes');
const vietnamDate = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh'
}).format(new Date());

const createOrder = async (req, res) => {
  const { userId, nameOrder, phoneNumber, addressOrder, pay, items, discointId } = req.body;

  try {
    let total = 0;
    let discountAmount = 0;

    // Tính tổng tiền dựa trên giá từ ShoeModel và cập nhật số lượng tồn kho
    for (let item of items) {
      const shoe = await ShoeModel.findById(item.shoeId);
      if (shoe) {
        // Tìm và cập nhật số lượng tồn kho cho size và màu cụ thể
        const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
        const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

        if (sizeIndex !== -1 && colorIndex !== -1) {
          if (shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity >= item.quantity) {
            shoe.storageShoe[sizeIndex * shoe.colorShoe.length + colorIndex].importQuanlity -= item.quantity;
            shoe.sellQuanlityAll += item.quantity;
            shoe.sellQuanlityAll += item.quantity;
            await shoe.save();
          } else {
            return res.status(400).json({ message: `Không đủ số lượng tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
          }
        } else {
          return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
        }

        total += shoe.price * item.quantity;
      } else {
        return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
      }
    }

    // Kiểm tra và áp dụng giảm giá
    if (discointId) {
      const discount = await DiscountModel.findById(discointId);
      if (discount) {
        if (discount.isActive && discount.maxUser > 0) {
          discountAmount = parseFloat(discount.discountAmount) || 0;
          total -= discountAmount;

          // Giảm số lần sử dụng của mã giảm giá
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

    const newOrder = await OrderModel.create({
      userId,
      nameOrder,
      phoneNumber,
      addressOrder,
      pay,
      total,
      dateOrder: vietnamDate,
      dateOrder: Date.now(), 
      status: 'Chờ xác nhận',
      discointId,
      orderStatusDetails: [
        {
          status: 'Chờ xác nhận',
          timestamp: vietnamDate,
          note: 'Đơn hàng mới được tạo'
        }
      ]
    });

    const orderDetails = items.map(item => ({
      orderId: newOrder._id,
      shoeId: item.shoeId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      quantity: item.quantity,
    }));
    await OderDetailModel.insertMany(orderDetails);


    sendNotificationUser(
      userId,
      'Đơn hàng mới',
      `Đơn hàng #${newOrder._id} của bạn đã được tạo thành công. Tổng tiền: ${total} VND`,
      'OrderCreated',
      items[0].shoeId,
      vietnamDate
    );

    sendNotificationAdmin(
      'Đơn hàng mới',
      `Một đơn hàng mới #${newOrder._id} đã được đặt. Tổng tiền: ${total} VND`,
      'OrderCreated',
      items[0].shoeId,
      vietnamDate
    );

    res.status(201).json({ message: 'Đơn hàng đã được tạo và thông báo đã được gửi.', order: newOrder });
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
        dateOrder: order.dateOrder,
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
    const orders = await OrderModel.find({ userId, status: { $ne: 0, $ne:-1 } })
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
        dateOrder: order.dateOrder,
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
  getUserOrdersWithFirstItem,
  getOrderById,
  getOrderShoeById,

  updateOrderAndRateShoe,
  updateOrderStatus,
  getUserCompletedOrders,
  getUserActiveOrders
};
