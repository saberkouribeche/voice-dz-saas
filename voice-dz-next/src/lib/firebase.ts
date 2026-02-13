import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA2YVbGrW-9OAvNv__aAxlJnQNQ8OAHN0o",
    authDomain: "qasaba-cc03c.firebaseapp.com",
    projectId: "qasaba-cc03c",
    storageBucket: "qasaba-cc03c.firebasestorage.app",
    messagingSenderId: "744912812463",
    appId: "1:744912812463:web:94ee8343989013f606575a"
};

// Initialize Firebase (Client Side)
console.log("🔥 Firebase Config:", firebaseConfig); // Debugging
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
