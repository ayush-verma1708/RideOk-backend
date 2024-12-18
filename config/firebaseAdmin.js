import admin from 'firebase-admin';
import serviceAccount from './rideok-12298-firebase-adminsdk-lwzqc-6d6abfe41c.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
