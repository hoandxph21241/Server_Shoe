const { NotificationModel, ShoeModel } = require("../../Models/DB_Shoes");
const getUserFCMToken = require('../../utils/getUserFCMToken');
const admin = require('../../config/firebase'); 
const moment = require('moment'); 


const getThumbnailForShoe = async (shoeId) => {
  const shoe = await ShoeModel.findById(shoeId);
  return shoe ? shoe.thumbnail : '';
};


const sendNotificationUser = async (userId, title, body, typeNotification, shoeId, time) => {
  const image = await getThumbnailForShoe(shoeId);

  try {
  
    const notification = await NotificationModel.create({
      userId,
      title,
      body,
      typeNotification,
      image,
      time
    });
  await notification.save();

    const userToken = await getUserFCMToken(userId);

    if (userToken) {
      const userMessage = {
        token: userToken,
        notification: {
          title,
          body,
        },
      };

      admin.messaging().send(userMessage)
        .then(response => {
          console.log('Successfully sent message to user:', response);
        })
        .catch(error => {
          console.log('Error sending message to user:', error);
        });
    }
  } catch (err) {
    console.log('Error sending notification:', err);
  }
};


const getNotificationsByUser = async (req, res) => {

  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    let notifications = await NotificationModel.find({ userId })
      .lean();

    notifications = notifications.map(notification => {
      const date = moment(notification.time, "HH:mm:ss DD/MM/YYYY").toDate();
      return {
        ...notification,
        date 
      };
    });


    notifications.sort((a, b) => b.date - a.date);

    const formattedNotifications = notifications.map(notification => {
      return {
        ...notification,
        time: moment(notification.date).format("HH:mm:ss DD/MM/YYYY") 
      };
    }).map(({ date, ...rest }) => rest); 

    const totalNotifications = formattedNotifications.length;
    const paginatedNotifications = formattedNotifications.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      totalNotifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      notifications: paginatedNotifications
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thông báo.', error: err.message });
  }
};




const deleteNotificationUser = async (req, res) => {
  const { notificationId } = req.params;

  try {
    await NotificationModel.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Thông báo đã được xóa.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa thông báo.', error: err.message });
  }
};


module.exports = {
  sendNotificationUser,
  getNotificationsByUser,
  deleteNotificationUser,
};