// login.js  (used by login.html)

import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { continueAsGuest, friendlyAuthError, goHome }
  from "./auth-helpers.js";

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");
const guestBtn = document.getElementById("guestBtn");
const forgotLink = document.querySelector(".forgot");

// The message box is red by default; "ok" turns it green for good news
function showMessage(text, ok = false) {
  errorEl.textContent = text;
  errorEl.style.display = "block";
  errorEl.style.background = ok ? "#E3F4EF" : "";
  errorEl.style.color = ok ? "#17664F" : "";
}

// ---- Sign in ----
form.addEventListener("submit", async (e) => {
  e.preventDefault();                         // stop the page from reloading
  errorEl.style.display = "none";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    return showMessage("Please fill in your email and password.");
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Read their saved profile to find their language and nickname
    let profile = {};
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) profile = snap.data();
    } catch (err) {
      console.error(err);                     // not fatal: they can still go in
    }

    const lang = profile.language || localStorage.getItem("Language") || "zh";

    localStorage.removeItem("token");
    localStorage.setItem("Role", "Learner");
    localStorage.setItem("UserID", user.uid);
    localStorage.setItem("Name", profile.name || user.displayName || "Learner");
    localStorage.setItem("Language", lang);
    goHome(lang);
  } catch (err) {
    showMessage(friendlyAuthError(err));
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

// ---- Forgot password: type your email, then click the link ----
forgotLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  if (!email) {
    return showMessage("Type your email in the box above first, then click “Forgot password?” again.");
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Password reset email sent. Check your inbox (and spam).", true);
  } catch (err) {
    showMessage(friendlyAuthError(err));
  }
});

// ---- Guest ----
guestBtn.addEventListener("click", async () => {
  guestBtn.disabled = true;
  try {
    await continueAsGuest(localStorage.getItem("Language") || "zh");
  } catch (err) {
    showMessage(friendlyAuthError(err));
    guestBtn.disabled = false;
  }
});