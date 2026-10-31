// ==========================================
// CRYSTAL CHRISTMAS — FIREBASE (COMPAT)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDqgECeNAMIyATME4NGd-xQe2XYSUL3v6w",
    authDomain: "crystal-christmas.firebaseapp.com",
    projectId: "crystal-christmas",
    storageBucket: "crystal-christmas.firebasestorage.app",
    messagingSenderId: "824457396603",
    appId: "1:824457396603:web:d71cfea2a6d468488b3dde"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

window.db = firebase.firestore();
window.auth = firebase.auth();
window.serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log("🔥 Crystal Christmas Firebase підключено");
