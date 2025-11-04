// Firebase configuration for the Secretos application

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
         limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, 
         ref, 
         uploadBytes, 
         getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// TODO: Add your Firebase configuration object here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the functions and services
export { 
    // App
    app,
    
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
    
    // Storage
    storage,
    ref,
    uploadBytes,
    getDownloadURL
};