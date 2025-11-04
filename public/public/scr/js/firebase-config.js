// Firebase configuration for the Secretos application

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         sendPasswordResetEmail, 
         signOut, 
         GoogleAuthProvider, 
         signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, 
         doc, 
         setDoc, 
         getDoc, 
         updateDoc, 
         collection, 
         query, 
         where, 
         getDocs, 
         limit,
         orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, 
         ref, 
         uploadBytes, 
         getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCo2rIBHdatRqtLWG8lMDCm11CbvUdUEhY",
  authDomain: "secrets-76774.firebaseapp.com",
  projectId: "secrets-76774",
  storageBucket: "secrets-76774.firebasestorage.app",
  messagingSenderId: "742561396597",
  appId: "1:742561396597:web:511a51a673b68df749053c",
  measurementId: "G-LQDWX2VT6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the functions and services
export { 
    // App
    app,
    analytics,
    
    // Auth
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    
    // Firestore
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    
    // Storage
    storage,
    ref,
    uploadBytes,
    getDownloadURL
};