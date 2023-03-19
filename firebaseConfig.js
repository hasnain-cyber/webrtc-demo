// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBRb_gBvrvaEqOhpYYVAScm6YWhBMXz4w4",
    authDomain: "webrtc-demo-2fe8d.firebaseapp.com",
    projectId: "webrtc-demo-2fe8d",
    storageBucket: "webrtc-demo-2fe8d.appspot.com",
    messagingSenderId: "426036124600",
    appId: "1:426036124600:web:6fd65ef3011f819cdb0d4d",
    measurementId: "G-R3BGC4VEKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);