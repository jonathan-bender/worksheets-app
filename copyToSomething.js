// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbXjicTTZNbR6zLRZhsGNRNo-Pjw3pkwU",
  authDomain: "worksheets-c5d83.firebaseapp.com",
  projectId: "worksheets-c5d83",
  storageBucket: "worksheets-c5d83.firebasestorage.app",
  messagingSenderId: "530052695175",
  appId: "1:530052695175:web:26b2a64c5912993ba0a422",
  measurementId: "G-0MNZ86QN36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);