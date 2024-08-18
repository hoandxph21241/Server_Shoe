// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../Config/shoes-701d0-firebase-adminsdk-0bsy8-f7326b7a70.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://shoe-addbc.appspot.com',

});

module.exports = admin;
