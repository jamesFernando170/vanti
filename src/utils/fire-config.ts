// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGb-Ut13xud_9SHsbFUv8KRs3UMlGeQfo",
  authDomain: "vanti-security-alerts.firebaseapp.com",
  projectId: "vanti-security-alerts",
  storageBucket: "vanti-security-alerts.firebasestorage.app",
  messagingSenderId: "139244675009",
  appId: "1:139244675009:web:22b3812071d80091349940",
  measurementId: "G-W3CP45GG12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);