const { AdminNotificationModel, ShoeModel } = require("../Models/DB_Shoes");
const admin = require('../config/firebase');

const getThumbnailForShoe = async (shoeId) => {
  const shoe = await ShoeModel.findById(shoeId);
  return shoe ? shoe.thumbnail : '';
};


const sendNotificationAdmin = async (title, body, typeNotification, shoeId, time) => {
  const image = await getThumbnailForShoe(shoeId);

  try {

    const notification = await AdminNotificationModel.create({
      title,
      body,
      typeNotification,
      image,
      time
    });
    await notification.save();


    const adminMessage = {
      topic: 'admin',
      notification: {
        title: title,
        body: body,
      },
    };

    admin.messaging().send(adminMessage)
      .then(response => {
        console.log('Successfully sent message to admin:', response);
      })
      .catch(error => {
        console.log('Error sending message to admin:', error);
      });

  } catch (err) {
    console.log('Error sending notification:', err);
  }
};

const getNotificationsByAdmin = async (req, res) => {

  try {
    const notifications = await AdminNotificationModel.find();
    res.status(200).json(notifications);

  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thông báo.', error: err.message });
  }
};

const deleteNotificationAdmin = async (req, res) => {
  const { notificationId } = req.params;

  try {
    await AdminNotificationModel.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Thông báo đã được xóa.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa thông báo.', error: err.message });
  }
};


module.exports = {
  sendNotificationAdmin,
  getNotificationsByAdmin,
  deleteNotificationAdmin,
};