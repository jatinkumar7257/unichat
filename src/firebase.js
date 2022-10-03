// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcytrujbR8ZNfxT99S_JOm0r0srkejmOA",
  authDomain: "uni-chat-9f9f1.firebaseapp.com",
  databaseURL: "https://uni-chat-9f9f1-default-rtdb.firebaseio.com",
  projectId: "uni-chat-9f9f1",
  storageBucket: "uni-chat-9f9f1.appspot.com",
  messagingSenderId: "264178645216",
  appId: "1:264178645216:web:ffe60f1ad76e1892a57885"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
