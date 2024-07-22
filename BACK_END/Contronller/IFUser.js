const {UserModel, AddressModel} = require('../Models/DB_Shoes');

const getAddressByUser = async (req, res) => {
    try {
        let msg ="";
        const userId = req.query.userId;
        const address = await AddressModel.find({ userId });
        if (!address) {
            return res.render('error', { message: "Address not found!" })
        }
        // return res.render('address', { address: address });
    } catch (error) {
        console.log(error);
        return res.render('error', { message: "Error getting address!" });
    }
}
const getFavoritesByUser = async (req, res) => {
    try {
        let msg ="";
        const userId = req.query.userId;
        const user = await UserModel
            .findOne({ _id: userId })
            .populate('favourites');
        if (!user) {
            return res.render('error', { message: "User not found!" })
        }
        // return res.render('favorites', { favorites: user.favourites });
    }
    catch (error) {
        console.log(error);
        return res.render('error', { message: "Error getting favorites!" });
    }
}
module.exports = {
    getAddressByUser,
    getFavoritesByUser
}