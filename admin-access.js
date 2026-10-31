// Доступ до адмінки обмежено Firebase Authentication + UID у Firestore Rules.
const ADMIN_UID = "v69rs6QQh8QI4YbFb3sHlqmKQdj2";
const gate = document.getElementById("admin-auth-gate");
const errorBox = document.getElementById("auth-error");
const showError = e => { errorBox.textContent = (e && (e.message || e.code)) || String(e); };
function showGate(user) {
  gate.style.display = user && user.uid === ADMIN_UID ? "none" : "flex";
  if (user && user.uid !== ADMIN_UID) {
    errorBox.textContent = "Цей акаунт не є адміністратором. UID: " + user.uid;
  }
}
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(showError);
auth.onAuthStateChanged(showGate, showError);
document.getElementById("auth-email-btn").addEventListener("click", async () => {
  try {
    errorBox.textContent = "";
    await auth.signInWithEmailAndPassword(
      document.getElementById("auth-email").value.trim(),
      document.getElementById("auth-password").value
    );
  } catch(e) { showError(e); }
});
document.getElementById("auth-google-btn").addEventListener("click", async () => {
  try { errorBox.textContent = ""; await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
  catch(e) { showError(e); }
});
