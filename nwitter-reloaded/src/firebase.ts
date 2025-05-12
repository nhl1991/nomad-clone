// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClA9FdGUYouQK5nvIEiIOjTBFWeqxH-hI",
  authDomain: "nwitter-reloaded-2d0a7.firebaseapp.com",
  projectId: "nwitter-reloaded-2d0a7",
  storageBucket: "nwitter-reloaded-2d0a7.firebasestorage.app",
  messagingSenderId: "1028674551164",
  appId: "1:1028674551164:web:43b32b97513f7b4226f8f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);