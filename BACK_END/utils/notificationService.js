const admin = require('../config/firebase'); 
const { NotificationModel} = require('../Models/DB_Shoes');

const getUserFCMToken = require('./getUserFCMToken');
const sendNotification = async (userId, title, body, typeNotification, adminTitle, adminBody) => {
  try {
  
    const notification = await NotificationModel.create({
      userId,
      title,
      body,
      typeNotification,
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

    // Gửi thông báo qua FCM cho admin
    const adminMessage = {
      topic: 'admin',
      notification: {
        title: adminTitle || title,
        body: adminBody || body,
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

module.exports = sendNotification;
