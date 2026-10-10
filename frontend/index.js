// index.js  (used by index.html)

import { continueAsGuest, goHome } from "./auth-helpers.js";

// GUEST: make an anonymous Firebase user, then go to the quest board
const guestBtn = document.getElementById("guestBtn");
guestBtn.addEventListener("click", async () => {
  guestBtn.disabled = true;
  try {
    await continueAsGuest(localStorage.getItem("Language") || "zh");   // default: Mandarin
  } catch (err) {
    console.error(err);
    alert("Couldn't start guest mode. Check that Anonymous sign-in is enabled in Firebase.");
    guestBtn.disabled = false;
  }
});

// LANGUAGES: remember the choice, then open the quest board in that language.
// (The quest board signs people in as a guest automatically if nobody is signed in.)
document.querySelectorAll(".lang[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;               // "zh", "ms" or "ta"
    localStorage.setItem("Language", lang);
    goHome(lang);
  });
});