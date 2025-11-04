// Main application module

// Import all modules
import { handleLogin, handleRegister, handleForgotPassword, handleGoogleLogin, switchAuthForm } from './auth.js';
import { nextStep, prevStep, handlePhotoSelection, removePhoto, toggleInterest, updateInterestSelectionUI, handleInterestSearch, selectPrivacyOption, updateStepUI, completeProfile, populateCountries, populateCities, generateInterests } from './profile.js';
import { loadFeed, handleLikeSecret } from './social.js';
import { showToast, showLoading, togglePasswordVisibility } from './ui.js';

// Global variables
let currentStep = 1;
let profileSetupData = {};
let selectedInterests = [];
let selectedPhoto = null;
let usernameCheckTimer = null;

// Application state
const appState = {
    currentScreen: 'login',
    isLoading: false,
    userData: {},
    isUsernameAvailable: false
};

// Show screen function
function showScreen(screenName) {
    // Hide all screens
    const loginScreen = document.getElementById('loginScreen');
    const profileSetupScreen = document.getElementById('profileSetupScreen');
    const completionScreen = document.getElementById('completionScreen');
    const mainMenuScreen = document.getElementById('mainMenuScreen');
    
    if (loginScreen) loginScreen.classList.remove('visible');
    if (profileSetupScreen) profileSetupScreen.classList.remove('active');
    if (completionScreen) completionScreen.classList.remove('active');
    if (mainMenuScreen) mainMenuScreen.classList.remove('active');
    
    // Show the requested screen
    switch(screenName) {
        case 'login':
            if (loginScreen) loginScreen.classList.add('visible');
            // Show login form by default
            const loginFormContainer = document.getElementById('loginForm');
            const registerFormContainer = document.getElementById('registerForm');
            const forgotPasswordFormContainer = document.getElementById('forgotPasswordForm');
            
            if (loginFormContainer) {
                registerFormContainer.classList.remove('active');
                forgotPasswordFormContainer.classList.remove('active');
                loginFormContainer.classList.add('active');
            }
            break;
        case 'profileSetup':
            if (profileSetupScreen) profileSetupScreen.classList.add('active');
            break;
        case 'completion':
            if (completionScreen) completionScreen.classList.add('active');
            break;
        case 'mainMenu':
            if (mainMenuScreen) mainMenuScreen.classList.add('active');
            break;
    }
    
    appState.currentScreen = screenName;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation between auth forms
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLogin = document.getElementById('backToLogin');
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('register');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('forgotPassword');
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
    // Interest search
    const interestSearchInput = document.getElementById('interestSearchInput');
    if (interestSearchInput) {
        interestSearchInput.addEventListener('input', handleInterestSearch);
    }
    
    // Auth forms
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Profile setup navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevStep);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', completeProfile);
    }
    
    // Photo handling
    const selectFileBtn = document.getElementById('selectFileBtn');
    const photoInput = document.getElementById('photoInput');
    const removePhotoBtnModern = document.getElementById('removePhotoBtnModern');
    const uploadArea = document.getElementById('uploadArea');
    const generateAvatarBtn = document.getElementById('generateAvatarBtn');
    
    // Select file button
    if (selectFileBtn && photoInput) {
        selectFileBtn.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', handlePhotoSelection);
    }
    
    // Remove photo button
    if (removePhotoBtnModern) {
        removePhotoBtnModern.addEventListener('click', removePhoto);
    }
    
    // Drag and drop
    if (uploadArea) {
        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });
        
        // Remove highlight
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });
        
        // Handle dropped file
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                // Simulate change event on input
                photoInput.files = files;
                const event = new Event('change', { bubbles: true });
                photoInput.dispatchEvent(event);
            }
        }, false);
    }
    
    // Generate avatar button
    if (generateAvatarBtn) {
        generateAvatarBtn.addEventListener('click', () => {
            // This would be implemented in the future
            showToast('info', 'Función en desarrollo', 'La función para generar avatares estará disponible pronto');
        });
    }
    
    // Password strength validation
    const registerPasswordInput = document.getElementById('registerPassword');
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthMeter = document.getElementById('passwordStrengthMeter');
            const strengthValue = document.getElementById('passwordStrengthValue');
            
            if (strengthBar && strengthMeter && strengthValue) {
                let strength = 0;
                
                if (password.length >= 8) strength++;
                if (/[A-Z]/.test(password)) strength++;
                if (/[a-z]/.test(password)) strength++;
                if (/[0-9]/.test(password)) strength++;
                if (/[\W_]/.test(password)) strength++;
                
                strengthBar.style.width = `${strength * 25}%`;
                strengthMeter.style.color = strength >= 4 ? 'var(--success-color)' : 'var(--danger-color)';
                strengthValue.textContent = strength >= 4 ? 'Fuerte' : 'Débil';
            }
        });
    }
    
    // Google login buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Privacy cards
    const privacyCards = document.querySelectorAll('.privacy-card');
    privacyCards.forEach(card => {
        card.addEventListener('click', () => {
            selectPrivacyOption(card);
        });
    });
    
    // Continue to app button
    const continueToApp = document.getElementById('continueToApp');
    if (continueToApp) {
        continueToApp.addEventListener('click', () => {
            showScreen('mainMenu');
            loadFeed();
        });
    }
    
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Handle different sections
            const section = item.querySelector('span').textContent;
            
            switch(section) {
                case 'Inicio':
                    loadFeed();
                    break;
                case 'Crear':
                    showToast('info', 'Función en desarrollo', 'La función para crear secretos estará disponible pronto');
                    break;
                case 'Perfil':
                    showToast('info', 'Función en desarrollo', 'La función de perfil estará disponible pronto');
                    break;
                default:
                    showToast('info', 'Navegación', `Navegando a ${section}`);
            }
        });
    });
    
    // Password toggle buttons
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });
    
    // Country selection
    const setupCountry = document.getElementById('setupCountry');
    if (setupCountry) {
        setupCountry.addEventListener('change', (e) => {
            const countryCode = e.target.value;
            if (countryCode) {
                populateCities(countryCode);
            } else {
                const citySelect = document.getElementById('setupCity');
                if (citySelect) {
                    citySelect.disabled = true;
                    citySelect.innerHTML = '<option value="">Primero elige un país</option>';
                }
            }
        });
    }
    
    // Bio character counter
    const bioTextarea = document.getElementById('setupBio');
    const bioCharCounter = document.getElementById('bioCharCounter');
    
    if (bioTextarea && bioCharCounter) {
        bioTextarea.addEventListener('input', () => {
            const maxLength = 150;
            const currentLength = bioTextarea.value.length;
            bioCharCounter.textContent = `${currentLength} / ${maxLength}`;
            
            if (currentLength > maxLength) {
                bioCharCounter.style.color = 'var(--danger-color)';
                bioTextarea.value = bioTextarea.value.substring(0, maxLength);
                bioCharCounter.textContent = `${maxLength} / ${maxLength}`;
            } else {
                bioCharCounter.style.color = 'var(--gray-500)';
            }
        });
    }
    
    // Interest cards
    document.querySelectorAll('.interest-card').forEach(card => {
        card.addEventListener('click', () => {
            const interestId = card.dataset.interestId;
            toggleInterest(interestId);
        });
    });
}

// Initialize application
function initializeApp() {
    // Show loader immediately
    showLoading(true);
    
    // Clone template content
    const template = document.getElementById('main-content-template');
    if (template) {
        const clone = template.content.cloneNode(true);
        document.body.prepend(clone);
    }
    
    // Firebase auth state observer will decide which screen to show
    // This is handled in the main script.js file
    
    // Setup event listeners
    setupEventListeners();
    
    // Generate interests
    generateInterests();
    
    // Populate countries
    populateCountries();
    
    console.log('Aplicación inicializada con método híbrido (plantilla + loader).');
}

// Export functions and variables
export { 
    currentStep, 
    profileSetupData, 
    selectedInterests, 
    selectedPhoto, 
    usernameCheckTimer, 
    appState, 
    showScreen, 
    setupEventListeners, 
    initializeApp,
    loadFeed,
    handleLikeSecret
};