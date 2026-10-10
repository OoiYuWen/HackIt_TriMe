// auth-helpers.js
// Shared by index.js, login.js and register.js.

import { auth, db } from "./firebase.js";
import { signInAnonymously, signOut }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Where everyone lands after signing in
export const HOME_PAGE = "pages/homepage.html";

export function goHome(lang) {
  window.location.href = `${HOME_PAGE}?lang=${lang}`;
}

// The starting values every new user document gets
export function newUserFields() {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    avatar: "default",
    completedQuests: {},
    createdAt: serverTimestamp()
  };
}

// "Continue as guest": a real Firebase user with no email, so XP and mistakes still save
export async function continueAsGuest(lang) {
  await auth.authStateReady();                 // wait until Firebase knows who is signed in
  let user = auth.currentUser;

  // A signed-in learner who taps "guest" is switched to a fresh guest
  if (user && !user.isAnonymous) {
    await signOut(auth);
    user = null;
  }
  if (!user) {
    user = (await signInAnonymously(auth)).user;
  }

  // Create the guest's document once (don't wipe an existing guest's progress)
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: "Guest", role: "Guest", language: lang, ...newUserFields() });
  }

  localStorage.removeItem("token");
  localStorage.removeItem("Name");
  localStorage.setItem("Role", "Guest");
  localStorage.setItem("UserID", user.uid);
  localStorage.setItem("Language", lang);
  goHome(lang);
}

// Turn Firebase error codes into messages a learner can understand
export function friendlyAuthError(err) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account. Try signing in.",
    "auth/credential-already-in-use": "That email already has an account. Try signing in.",
    "auth/invalid-email": "That email doesn't look right.",
    "auth/weak-password": "Your password needs at least 6 characters.",
    "auth/invalid-credential": "Check your email and password and try again.",
    "auth/user-not-found": "Check your email and password and try again.",
    "auth/wrong-password": "Check your email and password and try again.",
    "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
    "auth/network-request-failed": "No connection. Check your internet and try again.",
    "auth/operation-not-allowed": "Sign-in isn't turned on yet. In Firebase, open Authentication > Sign-in method and enable Email/Password and Anonymous."
  };
  console.error(err);
  return messages[err && err.code] || `Something went wrong (${(err && (err.code || err.message)) || "unknown"}). Please try again.`;
}