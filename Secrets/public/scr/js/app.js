// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Import our modules
import { setupAuth } from './modules/auth.js';
import { setupProfile } from './modules/profile.js';
import { setupSocial } from './modules/social.js';
import { setupUI } from './modules/ui.js';
import { initializeApp as initApp } from './firebase-config.js';

// Initialize Firebase
const firebaseApp = initApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// DOM Elements
const elements = {
    appContainer: document.getElementById('app-container'),
    loadingOverlay: document.getElementById('loading-overlay'),
    authSection: document.getElementById('auth-section'),
    feedSection: document.getElementById('feed-section'),
    profileSection: document.getElementById('profile-section'),
    navMenu: document.getElementById('nav-menu'),
    loginBtn: document.getElementById('login-btn'),
    signupBtn: document.getElementById('signup-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    homeLink: document.getElementById('home-link'),
    profileLink: document.getElementById('profile-link'),
    secretsLink: document.getElementById('secrets-link')
};

// App State
const state = {
    currentUser: null,
    currentView: 'feed'
};

// Show loading overlay
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation completes
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Switch view
function switchView(view) {
    // Hide all sections
    elements.authSection.classList.add('hidden');
    elements.feedSection.classList.add('hidden');
    elements.profileSection.classList.add('hidden');
    
    // Show the requested section
    switch(view) {
        case 'auth':
            elements.authSection.classList.remove('hidden');
            break;
        case 'feed':
            elements.feedSection.classList.remove('hidden');
            break;
        case 'profile':
            elements.profileSection.classList.remove('hidden');
            break;
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (view === 'feed') {
        elements.homeLink.classList.add('active');
    } else if (view === 'profile') {
        elements.profileLink.classList.add('active');
    }
    
    state.currentView = view;
}

// Set up navigation
function setupNavigation() {
    elements.homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentUser) {
            switchView('feed');
        } else {
            switchView('auth');
        }
    });
    
    elements.profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentUser) {
            switchView('profile');
        } else {
            switchView('auth');
        }
    });
    
    elements.secretsLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentUser) {
            switchView('feed');
        } else {
            switchView('auth');
        }
    });
    
    elements.loginBtn.addEventListener('click', () => {
        switchView('auth');
        document.getElementById('show-login').click();
    });
    
    elements.signupBtn.addEventListener('click', () => {
        switchView('auth');
        document.getElementById('show-signup').click();
    });
    
    elements.logoutBtn.addEventListener('click', () => {
        // Logout handled in auth module
    });
}

// Initialize the app
function init() {
    showLoading();
    
    // Set up navigation
    setupNavigation();
    
    // Set up modules
    setupAuth(auth, db, state, elements, switchView, showToast);
    setupProfile(auth, db, state, elements, switchView, showToast);
    setupSocial(auth, db, state, elements, switchView, showToast);
    setupUI(auth, db, state, elements, switchView, showToast);
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        hideLoading();
        if (user) {
            state.currentUser = user;
            elements.loginBtn.classList.add('hidden');
            elements.signupBtn.classList.add('hidden');
            elements.logoutBtn.classList.remove('hidden');
            switchView('feed');
        } else {
            state.currentUser = null;
            elements.loginBtn.classList.remove('hidden');
            elements.signupBtn.classList.remove('hidden');
            elements.logoutBtn.classList.add('hidden');
            switchView('auth');
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for use in other modules
export { showToast, switchView, state };