const { sendNotificationUser } = require('../../Contronller/api/Navigation_api');
const { sendNotificationAdmin } = require('../../Contronller/Navigation_Controller');
const { OrderModel, OderDetailModel, DiscountModel, ShoeModel } = require('../../Models/DB_Shoes');
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
            shoe.soldQuanlityAll += item.quantity;
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
      shoe.soldQuanlityAll -= item.quantity;
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
              shoe.soldQuanlityAll -= detail.quantity;
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

module.exports = {
  createOrder,
  cancelOrder,
  returnOrder,
  confirmOrderReceived,
  getUserOrdersWithFirstItem,
  getOrderById,
  getOrderShoeById
};
