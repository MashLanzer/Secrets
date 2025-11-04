// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB77hjz0d0X5d6x0d5d4d4d4d4d4d4d4d4",
  authDomain: "secrets-402315.firebaseapp.com",
  projectId: "secrets-402315",
  storageBucket: "secrets-402315.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012",
  measurementId: "G-1234567890"
};

// Initialize Firebase
export function initializeApp() {
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  return app;
}