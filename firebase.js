// IMPORTANT: Replace values below with your EXISTING Firebase project's web app config.
// Firebase Console -> Project settings -> Your apps -> Web app -> SDK setup/config.
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};
export const firebaseReady = !firebaseConfig.apiKey.startsWith('REPLACE_');
