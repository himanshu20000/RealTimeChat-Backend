const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (fcmTokens, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: fcmTokens, 
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    if (response.failureCount > 0) {
      console.log('Some notifications failed to send.');
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`Failed to send notification to ${fcmTokens[index]}:`, resp.error);
        }
      });
    } else {
      console.log('Notifications sent successfully to all tokens!');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = { sendPushNotification };
