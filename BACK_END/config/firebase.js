// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../shoes-701d0-firebase-adminsdk-xyfc5-8d0258f51e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
