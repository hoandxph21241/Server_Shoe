// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../Config/shoes-701d0-firebase-adminsdk-xyfc5-8d0258f51e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://shoe-addbc.appspot.com',

});

module.exports = admin;
