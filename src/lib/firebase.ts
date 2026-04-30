import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBg1878bx3QrXcqv1PqvA9kLUSzzdc_4BI",
  authDomain: "inkopia-12725.firebaseapp.com",
  projectId: "inkopia-12725",
  storageBucket: "inkopia-12725.firebasestorage.app",
  messagingSenderId: "859046935629",
  appId: "1:859046935629:web:927480eb6d15e74ff53004",
  measurementId: "G-BVNR1H90NY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
