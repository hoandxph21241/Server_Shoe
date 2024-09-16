const User = require('../Models/DB_Shoes'); 
const getUserFCMToken = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    return user ? user.fcmToken : null;
  } catch (err) {
    console.error('Error fetching FCM token:', err);
    return null;
  }
};

module.exports = getUserFCMToken;
