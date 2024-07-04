const { render } = require('ejs');
const {UserModel, OderDetailModel } = require('../Models/DB_Shoes')


const listUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.render('users/user_list.ejs', { users });
    } catch (error) {
        res.render('users/user_list.ejs', { error });
    }

}
const findUsers = async (req, res) => {
    try {
        const { keywork } = req.params;
        const regex = new RegExp(keywork, 'i');
        const users = await UserModel.find({name: regex});
        res.render('users/user_list.ejs', { users });
    } catch (error) {
        res.render('users/user_list.ejs', { error });
    }
}
const userDetail =async (req, res) => {
    try {
        const user = await UserModel.findById(userId).exec();

        if (!user) {
            res.render('users/user_detail.ejs', {"error": "User not found"});
        }
        const orders = await OrderModel.find({ userId: user._id })
        .populate({
          path: '_id',
          model: 'OrderDetail',
          populate: {
            path: 'shoeId',
            model: 'ShoeModel',
            populate: {
              path: 'colorShoe',
              model: 'ColorShoeModel'
            }
          }
        })
        .exec();
        user.orders = orders;
      user.orders = orders;
        res.render('users/user_detail.ejs', { user });
    }catch (error) {
        res.render('users/user_detail.ejs', { error });
    }
}
const statusOrder = async (req, res) => {
    try {
        const { userId, orderId, status } = req.params;
        const user = await UserModel.findById(userId    ).exec();
        if (!user) {
            res.render('users/user_detail.ejs', {"error": "User not found"});
        }
        const order = await OrderModel.findById(orderId).exec();
        if (!order) {
            res.render('users/user_detail.ejs', {"error": "Order not found"});
        }
        if(status === 'Đã xác nhận'){
            order.status = "Đã xác nhận";
        }
        if(status === 'Đang giao hàng'){
            order.status = "Đang giao hàng";
        }
        if(status === 'Đã giao hàng'){
            order.status = "Đã giao hàng";
        }
        if(status === 'Đã hủy'){
            order.status = "Đã hủy";
        }else{
            res.render('users/user_detail.ejs', {"error": "Status not found"});
        }
        await order.save();
        res.redirect(`/user/${userId}`);
} catch (error) {
    res.render('users/user_detail.ejs', { error });
}
}
module.exports = {
    listUsers,
    findUsers,
    userDetail,
    statusOrder
}

