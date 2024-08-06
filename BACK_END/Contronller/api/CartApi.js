const {CartModel} = require('../../Models/DB_Shoes');

const addCart = async (req, res, next) => {
    try {
        const { userId, shoeId, numberShoe, sizeId, colorId } = req.body;
        const cart = new CartModel({
            userId,
            shoeId,
            numberShoe,
            sizeId,
            colorId,
        });
        await cart.save();
        res.status(201).json({ status: "success", cart });
    } catch (error) {
        res.status(500).json({ status: "failed", error });
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

        // Format 
        const formattedCarts = carts.map(cart => ({
            cartId: cart.cartId,

            shoe: {
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
        }));

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