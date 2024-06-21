const sendNotification = require('../../utils/notificationService'); 
const { OderModel, OderDetailModel, DiscountModel, ShoeModel }  = require('../../Models/DB_Shoes'); // Các model cần thiết


const createOrder = async (req, res) => {
  const { userId, nameOrder, phoneNumber, addressOrder, items, discointId } = req.body;

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

    const newOrder = await OderModel.create({
      userId,
      nameOrder,
      phoneNumber,
      adressOrder: addressOrder,
      total,
      dateOrder: new Date(),
      status: 'Chờ xác nhận',
      discointId,
    });

    const orderDetails = items.map(item => ({
      orderId: newOrder._id,
      shoeId: item.shoeId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      quantity: item.quantity,
    }));
    await OderDetailModel.insertMany(orderDetails);

    sendNotification(
      userId,
      'Đơn hàng mới',
      `Đơn hàng #${newOrder._id} của bạn đã được tạo thành công. Tổng tiền: ${total} VND`,
      'OrderCreated',
      'Đơn hàng mới',
      `Một đơn hàng mới #${newOrder._id} đã được đặt. Tổng tiền: ${total} VND`
    );

    res.status(201).json({ message: 'Đơn hàng đã được tạo và thông báo đã được gửi.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: err.message });
  }
};


const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OderModel.findById(orderId);

    if (order) {
      if (order.status === 'Chờ xác nhận') {
        order.status = 'Đã hủy';
        await order.save();

        const orderDetails = await OderDetailModel.find({ orderId: order._id });

        for (let item of orderDetails) {
          const shoe = await ShoeModel.findById(item.shoeId);

          if (shoe) {
            const sizeIndex = shoe.sizeShoe.findIndex(size => size.equals(item.sizeId));
            const colorIndex = shoe.colorShoe.findIndex(color => color.equals(item.colorId));

            if (sizeIndex !== -1 && colorIndex !== -1) {
              const storageIndex = sizeIndex * shoe.colorShoe.length + colorIndex;
              if (storageIndex >= 0 && storageIndex < shoe.storageShoe.length) {
                shoe.storageShoe[storageIndex].importQuanlity += item.quantity;
                shoe.soldQuanlityAll += item.quantity;

                await shoe.save();
              } else {
                return res.status(400).json({ message: `Không tìm thấy mục tồn kho cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
              }
            } else {
              return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${item.shoeId}, size ${item.sizeId}, màu ${item.colorId}.` });
            }
          } else {
            return res.status(400).json({ message: `Không tìm thấy giày với id ${item.shoeId}` });
          }
        }

        sendNotification(
          order.userId,
          'Đơn hàng đã bị hủy',
          `Đơn hàng #${orderId} của bạn đã bị hủy.`,
          'OrderCanceled',
          'Đơn hàng đã bị hủy',
          `Đơn hàng #${orderId} đã bị hủy.`
        );

        res.status(200).json({ message: 'Đơn hàng đã bị hủy và thông báo đã được gửi.', order });
      } else {
        res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ xác nhận".' });
      }
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi hủy đơn hàng.', error: err.message });
  }
};

const returnOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OderModel.findById(orderId);
    if (order) {
      if (order.status === 'Đã giao hàng') {
        order.status = 'Đã hoàn';
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
              await shoe.save();
            } else {
              return res.status(400).json({ message: `Không tìm thấy size hoặc màu cho giày ${detail.shoeId}, size ${detail.sizeId}, màu ${detail.colorId}.` });
            }
          } else {
            return res.status(400).json({ message: `Không tìm thấy giày với id ${detail.shoeId}` });
          }
        }

        sendNotification(
          order.userId,
          'Đơn hàng đã hoàn',
          `Đơn hàng #${orderId} của bạn đã được hoàn.`,
          'OrderReturned',
          'Đơn hàng đã hoàn',
          `Đơn hàng #${orderId} đã được hoàn.`
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


module.exports = {
  createOrder,
  cancelOrder,
  returnOrder,
  getOrderById
};
