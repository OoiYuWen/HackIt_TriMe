// register.js  (used by register.html)

import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile, linkWithCredential, EmailAuthProvider }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { continueAsGuest, friendlyAuthError, newUserFields, goHome }
  from "./auth-helpers.js";

// If the user picked a language on the front page, select it here too
const savedLang = localStorage.getItem("Language");
if (savedLang) {
  const radio = document.querySelector(`input[name="lang"][value="${savedLang}"]`);
  if (radio) radio.checked = true;
}

const form = document.getElementById("registerForm");
const errorEl = document.getElementById("registerError");
const registerBtn = document.getElementById("registerBtn");
const guestBtn = document.getElementById("guestBtn");

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();                         // stop the page from reloading
  errorEl.style.display = "none";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const lang = document.querySelector('input[name="lang"]:checked').value;

  // ---- Check the form before creating the account ----
  if (!name || !email || !password || !confirm) {
    return showError("Please fill in all the boxes.");
  }
  if (!email.includes("@") || !email.includes(".")) {
    return showError("That email doesn't look right.");
  }
  if (password.length < 6) {
    return showError("Your password needs at least 6 characters.");
  }
  if (password !== confirm) {
    return showError("The two passwords don't match.");
  }

  // ---- Create the account ----
  registerBtn.disabled = true;
  registerBtn.textContent = "Creating…";

  try {
    await auth.authStateReady();
    const current = auth.currentUser;
    let user;

    if (current && current.isAnonymous) {
      // They were playing as a guest: upgrade that guest, so their XP is kept
      const cred = EmailAuthProvider.credential(email, password);
      user = (await linkWithCredential(current, cred)).user;
    } else {
      user = (await createUserWithEmailAndPassword(auth, email, password)).user;
    }

    await updateProfile(user, { displayName: name });

    // Save the profile. A new user gets starting values; an upgraded guest keeps their progress.
    const ref = doc(db, "users", user.uid);
    const profile = { name, email, role: "Learner", language: lang };
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await setDoc(ref, profile, { merge: true });
    } else {
      await setDoc(ref, { ...profile, ...newUserFields() });
    }

    localStorage.removeItem("token");
    localStorage.setItem("Role", "Learner");
    localStorage.setItem("UserID", user.uid);
    localStorage.setItem("Name", name);
    localStorage.setItem("Language", lang);
    goHome(lang);
  } catch (err) {
    showError(friendlyAuthError(err));
    registerBtn.disabled = false;
    registerBtn.textContent = "Create account";
  }
});

// ---- Guest ----
guestBtn.addEventListener("click", async () => {
  const lang = document.querySelector('input[name="lang"]:checked').value;
  guestBtn.disabled = true;
  try {
    await continueAsGuest(lang);
  } catch (err) {
    showError(friendlyAuthError(err));
    guestBtn.disabled = false;
  }
});