import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBu6q4mblml-912YsZgXdSCrU7MwwFfsgs",
  authDomain: "noto-dlefg.firebaseapp.com",
  projectId: "noto-dlefg",
  storageBucket: "noto-dlefg.firebasestorage.app",
  messagingSenderId: "645637836252",
  appId: "1:645637836252:web:dd28950bf8258aeb9dd319"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
