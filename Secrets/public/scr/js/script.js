// Importar Firebase y sus funciones

// Al principio de script.js
import { 
    app, analytics, auth, db, storage, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, 
    signOut, doc, setDoc, getDoc, updateDoc, GoogleAuthProvider, signInWithPopup,
    collection, query, where, getDocs, limit, orderBy
} from './firebase-config.js';

import { countryList, cityListByCountry } from './data.js';

// Import application modules
import { initializeApp, showScreen, setupEventListeners, appState, profileSetupData, selectedInterests, selectedPhoto, currentStep, loadFeed, handleLikeSecret } from './modules/app.js';

// Make some functions globally available
window.showScreen = showScreen;
window.appState = appState;
window.profileSetupData = profileSetupData;
window.selectedInterests = selectedInterests;
window.selectedPhoto = selectedPhoto;
window.currentStep = currentStep;
window.loadFeed = loadFeed;
window.handleLikeSecret = handleLikeSecret;

// Datos de intereses
window.interestsData = [
    { id: 'technology', name: 'Tecnología', icon: 'fas fa-laptop-code' },
    { id: 'music', name: 'Música', icon: 'fas fa-music' },
    { id: 'sports', name: 'Deportes', icon: 'fas fa-futbol' },
    { id: 'travel', name: 'Viajes', icon: 'fas fa-plane' },
    { id: 'food', name: 'Comida', icon: 'fas fa-utensils' },
    { id: 'art', name: 'Arte', icon: 'fas fa-palette' },
    { id: 'books', name: 'Libros', icon: 'fas fa-book' },
    { id: 'movies', name: 'Películas', icon: 'fas fa-film' },
    { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' },
    { id: 'fitness', name: 'Fitness', icon: 'fas fa-dumbbell' },
    { id: 'photography', name: 'Fotografía', icon: 'fas fa-camera' },
    { id: 'nature', name: 'Naturaleza', icon: 'fas fa-leaf' },
    { id: 'fashion', name: 'Moda', icon: 'fas fa-tshirt' },
    { id: 'science', name: 'Ciencia', icon: 'fas fa-flask' },
    { id: 'business', name: 'Negocios', icon: 'fas fa-briefcase' },
    { id: 'education', name: 'Educación', icon: 'fas fa-graduation-cap' }
];

// ============================================= 
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================= 
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Firebase auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().completedAt) {
            // Profile completed -> Show Main Menu
            const userData = userDoc.data();
            const menuUsernameEl = document.getElementById('menuUsername');
            const menuProfileAvatarEl = document.getElementById('menuProfileAvatar');
            if (menuUsernameEl) menuUsernameEl.textContent = userData.username;
            if (menuProfileAvatarEl) menuProfileAvatarEl.src = userData.profilePhotoUrl || 'placeholder.jpg';
            
            showScreen('mainMenu');
        } else {
            // Profile incomplete -> Show Setup
            if (userDoc.exists()) {
                window.profileSetupData = { ...userDoc.data() };
                const setupName = document.getElementById('setupName');
                if (setupName) setupName.value = userDoc.data().username || '';
            }
            showScreen('profileSetup');
        }
    } else {
        // User is signed out
        showScreen('login');
    }

    // Hide loader
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) loadingOverlay.classList.remove('active');
        }, 500);
    }
});
