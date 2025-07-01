import admin from 'firebase-admin';

if (!admin.apps.length) {
  // When running on App Hosting, the SDK is automatically initialized.
  // For local development, you would need to set up GOOGLE_APPLICATION_CREDENTIALS.
  // https://firebase.google.com/docs/hosting/server-side-rendering-libraries#initialize-firebase-admin-sdk
  try {
    admin.initializeApp();
  } catch (e) {
    console.log('Admin SDK initialization failed. This is expected in a local environment without credentials. Configure GOOGLE_APPLICATION_CREDENTIALS for local development.');
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const db = admin.firestore();
