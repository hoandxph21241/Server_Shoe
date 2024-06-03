const {CartModel} = require('../../Models/DB_Shoes');

const addCart = async (req, res, next) => {
    try {
        const { userId, shoeId, numberShoe } = req.body;
        const cart = new CartModel({
            userId,
            shoeId,
            numberShoe,
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
        const carts = await CartModel.find({ userId });
        res.status(200).json({ status: "success", carts });
    } catch (error) {
        res.status(500).json({ status: "failed", error });
    }
}

module.exports = {
    addCart,
    deleteCart,
    updateNumberShoe,
    cartList,
}