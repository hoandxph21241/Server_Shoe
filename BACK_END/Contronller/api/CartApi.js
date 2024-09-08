const { ShoeModel, SizeShoeModel, ColorShoeModel, StorageShoeModel, CartModel } = require('../../Models/DB_Shoes');

async function addCart(req, res) {
    try {
      const { shoeId, sizeId, colorId, numberShoe, userId } = req.body;

      const shoe = await ShoeModel.findById(shoeId);
      const size = await SizeShoeModel.findById(sizeId);
      const color = await ColorShoeModel.findById(colorId);
  
      if (!shoe) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      if (!size) {
        return res.status(404).json({ message: 'Không tìm thấy kích thước' });
      }
      if (!color) {
        return res.status(404).json({ message: 'Không tìm thấy màu' });
      }
  
      // Kiểm tra số lượng tồn kho
      const storage = await StorageShoeModel.findOne({
        shoeId: shoeId,
        colorShoe: colorId,
        'sizeShoe.sizeId': sizeId
      });
  
      if (!storage) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi tồn kho' });
      }
  
      const sizeRecord = storage.sizeShoe.find(s => s.sizeId.toString() === sizeId.toString());
  
      if (!sizeRecord) {
        return res.status(404).json({ message: 'Không tìm thấy kích thước trong bản ghi tồn kho' });
      }
  
      if (sizeRecord.quantity < numberShoe) {
        return res.status(400).json({ message: 'Số lượng trong kho không đủ' });
      }
  
      const cartItem = new CartModel({
        userId: userId,
        shoeId: shoeId,
        sizeId: sizeId,
        colorId: colorId,
        numberShoe: numberShoe,
      });
  
      await cartItem.save();
      res.status(200).json({ message: 'Thêm vào giỏ hàng thành công' });
  
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      res.status(500).json({ message: 'Lỗi hệ thống' });
    }
  }

const deleteCart = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        await CartModel.findByIdAndDelete(cartId);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ status: "failed", error });
    }
}
const updateNumberShoe = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const { numberShoe } = req.body;
        await CartModel.findByIdAndUpdate
            (cartId, { numberShoe });
        res.status(200).json({ status: "success" });
    }
    catch (error) {
        res.status(500).json({ status: "failed", error });
    }
}

const cartListByUserId = async (req, res, next) => {
  try {
      const { userId } = req.params;

      const carts = await CartModel.find({ userId })
          .populate({
              path: 'shoeId', 
              select: 'name price thumbnail colorShoe sizeShoe', 
          })
          .populate({
              path: 'sizeId',
              select: 'size',
          })
          .populate({
              path: 'colorId', 
              select: 'textColor codeColor', 
          })
          .exec();

      if (carts.length === 0) {
          return res.status(404).json({ status: 'failed', message: 'No carts found for this user.' });
      }

      // Format and reverse
      const formattedCarts = carts.map(cart => ({
          shoe: {
              cartId: cart._id,
              shoeId: cart.shoeId._id,
              name: cart.shoeId.name,
              price: cart.shoeId.price,
              thumbnail: cart.shoeId.thumbnail,
              size: cart.sizeId ? cart.sizeId.size : null,
              color: cart.colorId ? {
                  textColor: cart.colorId.textColor,
                  codeColor: cart.colorId.codeColor
              } : null,
              numberShoe: cart.numberShoe,
          },
      })).reverse(); // Reverse the array

      res.status(200).json({ status: 'success', carts: formattedCarts });
  } catch (error) {
      console.error('Error retrieving cart list:', error); 
      res.status(500).json({ status: 'failed', error: 'An error occurred while retrieving cart information.' });
  }
}


module.exports = {
    addCart,
    deleteCart,
    updateNumberShoe,
    cartListByUserId,
}