import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLVZyRXnYgo7veDBYZ8N07YGFF5abxrYQ",
  authDomain: "hackit-3513b.firebaseapp.com",
  projectId: "hackit-3513b",
  storageBucket: "hackit-3513b.firebasestorage.app",
  messagingSenderId: "90670402065",
  appId: "1:90670402065:web:0454cce696586010feffb0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);