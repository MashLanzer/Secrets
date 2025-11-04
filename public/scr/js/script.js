// Importar Firebase y sus funciones

// Al principio de script.js
import { 
    app, analytics, auth, db, storage, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, 
    signOut, doc, setDoc, getDoc, updateDoc, GoogleAuthProvider, signInWithPopup,
    collection, query, where, getDocs, limit, orderBy
} from './firebase-config.js';

import { countryList, cityListByCountry } from './data.js';

const googleProvider = new GoogleAuthProvider();

// ============================================= 
// VARIABLES GLOBALES Y ESTADO DE LA APLICACIÓN
// ============================================= 
let currentStep = 1;
let profileSetupData = {};
let selectedInterests = [];
let selectedPhoto = null;
let usernameCheckTimer = null; // <-- AÑADE ESTA LÍNEA: Temporizador para la validación

// Estado de la aplicación
const appState = {
    currentScreen: 'login',
    isLoading: false,
    userData: {},
    isUsernameAvailable: false // <-- AÑADE ESTA LÍNEA: Estado para el nombre de usuario
};

// ============================================= 
// ELEMENTOS DEL DOM
// ============================================= 
const elements = {
    // Pantallas principales
    loginScreen: document.getElementById('loginScreen'),
    profileSetupScreen: document.getElementById('profileSetupScreen'),
    completionScreen: document.getElementById('completionScreen'),
    mainMenuScreen: document.getElementById('mainMenuScreen'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    
    // Formularios de autenticación
    loginForm: document.getElementById('loginFormElement'),
    registerForm: document.getElementById('registerFormElement'),
    forgotPasswordForm: document.getElementById('forgotPasswordFormElement'),
    
    // Contenedores de formularios
    loginFormContainer: document.getElementById('loginForm'),
    registerFormContainer: document.getElementById('registerForm'),
    forgotPasswordFormContainer: document.getElementById('forgotPasswordForm'),
    
    // Botones de navegación entre formularios
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    backToLogin: document.getElementById('backToLogin'),
    
    // Setup de perfil
    setupSteps: document.querySelectorAll('.setup-step'),
    progressSteps: document.querySelectorAll('.progress-step'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    completeBtn: document.getElementById('completeBtn'),
    
    // Formulario de información básica
    setupName: document.getElementById('setupName'),
    setupBio: document.getElementById('setupBio'),
    setupAge: document.getElementById('setupAge'),
    setupGender: document.getElementById('setupGender'),
    setupCountry: document.getElementById('setupCountry'),
    setupCity: document.getElementById('setupCity'),
    
    // Foto de perfil
    photoInput: document.getElementById('photoInput'),
    photoPreview: document.getElementById('photoPreview'),
    selectPhotoBtn: document.getElementById('selectPhotoBtn'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    
// Intereses (con los nuevos elementos)
interestsGrid: document.getElementById('interestsGrid'),
interestSearchInput: document.getElementById('interestSearchInput'),
interestCounter: document.getElementById('interestCounter'),
counterProgressBar: document.getElementById('counterProgressBar'),
noResultsMessage: document.getElementById('noResultsMessage'),
    
    // Privacidad
    privacyCards: document.querySelectorAll('.privacy-card'),
    privacyRadios: document.querySelectorAll('input[name="privacy"]'),
    
    // Pantalla de completado
    profileSummary: document.getElementById('profileSummary'),
    continueToApp: document.getElementById('continueToApp')
};

// ============================================= 
// DATOS DE INTERESES
// ============================================= 
const interestsData = [
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
    setupEventListeners();
    generateInterests();
    populateCountries();
});

// En script.js
// --- REEMPLAZA TU FUNCIÓN initializeApp CON ESTA VERSIÓN HÍBRIDA Y DEFINITIVA ---

function initializeApp() {
    // 1. Mostramos el loader INMEDIATAMENTE.
    // Como el body está vacío, el loader es lo único que verá el usuario.
    showLoading(true);

    // 2. Clonamos el contenido de la plantilla y lo añadimos al DOM.
    // Esto sucede en segundo plano, mientras el loader sigue visible.
    const template = document.getElementById('main-content-template');
    const clone = template.content.cloneNode(true);
    document.body.prepend(clone);

    // 3. Ahora que el HTML existe, inicializamos el resto de la lógica.
    loadRememberedUser();
    
    // El observador de Firebase decide qué pantalla mostrar.
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // --- CASO 1: Usuario con sesión activa. ---
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().completedAt) {
                // Perfil completo -> Mostrar Menú Principal.
                const userData = userDoc.data();
                const menuUsernameEl = document.getElementById('menuUsername');
                const menuProfileAvatarEl = document.getElementById('menuProfileAvatar');
                if (menuUsernameEl) menuUsernameEl.textContent = userData.username;
                if (menuProfileAvatarEl) menuProfileAvatarEl.src = userData.profilePhotoUrl || 'placeholder.jpg';
                
                showScreen('mainMenu');
                showToast('info', `¡Hola de nuevo, ${userData.username}!`, 'Tu sesión está activa.');
            } else {
                // Perfil incompleto -> Mostrar Setup.
                if (userDoc.exists()) {
                    profileSetupData = { ...userDoc.data() };
                    elements.setupName.value = userDoc.data().username || '';
                }
                showScreen('profileSetup');
                showToast('info', 'Casi listo...', 'Por favor, termina de configurar tu perfil.');
            }
        } else {
            // --- CASO 2: Sin sesión activa. ---
            showScreen('login');
        }

         // --- OCULTAR EL NUEVO LOADER ---
        // Una vez que la pantalla correcta está lista, ocultamos la barra de progreso.
        const pageLoader = document.getElementById('pageLoader');
        if (pageLoader) {
            // Añadimos un pequeño retardo para que la animación de carga se complete
            // y la transición sea suave.

        // 4. Ocultamos el loader una vez que la pantalla correcta ha sido renderizada.
        setTimeout(() => {
            showLoading(false);
        }, 500); // Retardo para una transición suave.
        }
    });
    
    // El resto de la inicialización se ejecuta de forma segura.
    setupEventListeners();
    generateInterests();
    populateCountries();
    
    console.log('Aplicación inicializada con método híbrido (plantilla + loader).');
}



// ============================================= 
// GESTIÓN DE PANTALLAS
// ============================================= 
// En script.js
// --- REEMPLAZA TU FUNCIÓN showScreen CON ESTA VERSIÓN MEJORADA ---

function showScreen(screenName) {
    // Ocultar todas las pantallas principales
    elements.loginScreen.classList.remove('visible');
    elements.profileSetupScreen.classList.remove('active');
    elements.completionScreen.classList.remove('active');
    elements.mainMenuScreen.classList.remove('active');
    
    // Mostrar la pantalla solicitada
    switch(screenName) {
        case 'login':
            elements.loginScreen.classList.add('visible');
            // --- ¡AÑADIDO IMPORTANTE! ---
            // Nos aseguramos de que el formulario de login sea el primero en mostrarse.
            if (elements.loginFormContainer) {
                // Ocultamos los otros formularios por si acaso
                elements.registerFormContainer.classList.remove('active');
                elements.forgotPasswordFormContainer.classList.remove('active');
                // Mostramos el de login
                elements.loginFormContainer.classList.add('active');
            }
            break;
        case 'profileSetup':
            elements.profileSetupScreen.classList.add('active');
            break;
        case 'completion':
            elements.completionScreen.classList.add('active');
            break;
        case 'mainMenu':
            elements.mainMenuScreen.classList.add('active');
            break;
    }
    
    appState.currentScreen = screenName;
}


// ============================================= 
// EVENT LISTENERS
// ============================================= 
// Enhanced setupEventListeners with social features
function setupEventListeners() {
    // Navegación entre formularios de autenticación
    if (elements.showRegister) {
        elements.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('register');
        });
    }
    
    if (elements.showLogin) {
        elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
    if (elements.forgotPasswordLink) {
        elements.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('forgotPassword');
        });
    }
    
    if (elements.backToLogin) {
        elements.backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthForm('login');
        });
    }
    
// --- AÑADE ESTE BLOQUE PARA LA BÚSQUEDA DE INTERESES ---
if (elements.interestSearchInput) {
    elements.interestSearchInput.addEventListener('input', handleInterestSearch);
}

    // Formularios de autenticación
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.forgotPasswordForm) {
        elements.forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Navegación del setup de perfil
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', nextStep);
    }
    
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', prevStep);
    }
    
    if (elements.completeBtn) {
        elements.completeBtn.addEventListener('click', completeProfile);
    }
    
    // Foto de perfil
    // En script.js, dentro de setupEventListeners()

// --- REEMPLAZA LA SECCIÓN DE "FOTO DE PERFIL" CON ESTO ---
const selectFileBtn = document.getElementById('selectFileBtn');
const photoInput = document.getElementById('photoInput');
const removePhotoBtnModern = document.getElementById('removePhotoBtnModern');
const uploadArea = document.getElementById('uploadArea');
const generateAvatarBtn = document.getElementById('generateAvatarBtn');

// Botón para seleccionar archivo
if (selectFileBtn && photoInput) {
    selectFileBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoSelection);
}

// Botón para remover foto
if (removePhotoBtnModern) {
    removePhotoBtnModern.addEventListener('click', removePhoto);
}

// Lógica para Arrastrar y Soltar (Drag and Drop)
if (uploadArea) {
    // Prevenir comportamientos por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Resaltar el área al arrastrar un archivo sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        }, false);
    });

    // Quitar el resaltado al salir del área
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        }, false);
    });

    // Manejar el archivo soltado
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            // Simular el evento 'change' del input con el archivo soltado
            photoInput.files = files;
            const event = new Event('change', { bubbles: true });
            photoInput.dispatchEvent(event);
        }
    }, false);
}

// Botón para generar avatar
if (generateAvatarBtn) {
    generateAvatarBtn.addEventListener('click', handleGenerateAvatar);
}
// --- FIN DE LA SECCIÓN A REEMPLAZAR ---


    const registerPasswordInput = document.getElementById('registerPassword');
if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', validatePasswordStrength);
}

// --- AÑADE ESTAS LÍNEAS PARA LOS BOTONES DE GOOGLE ---
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleLogin);
    }
    // --- FIN DE LAS LÍNEAS A AÑADIR ---

    
    // Privacidad
    elements.privacyCards.forEach(card => {
        card.addEventListener('click', () => {
            selectPrivacyOption(card);
        });
    });
    
    // Botón continuar a la app
    if (elements.continueToApp) {
        elements.continueToApp.addEventListener('click', () => {
            // Aquí navegarías a la página principal de la aplicación
            showScreen('mainMenu');
            loadFeed();
        });
    }
    
    // Navegación inferior en el menú principal
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase activa de todos los items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Agregar clase activa al item clickeado
            item.classList.add('active');
            
            // Aquí iría la lógica para cambiar de sección
            const section = item.querySelector('span').textContent;
            
            // Handle different sections
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
    
    // Toggle de contraseñas
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });

    // --- AÑADIDO: Lógica para activar el campo de ciudad ---
    // Dentro de setupEventListeners(), REEMPLAZA el listener anterior de setupCountry

    if (elements.setupCountry) {
        elements.setupCountry.addEventListener('change', (e) => {
            const countryCode = e.target.value;
            if (countryCode) {
                // Si se selecciona un país, poblamos las ciudades correspondientes
                populateCities(countryCode);
            } else {
                // Si se deselecciona, desactivamos y reseteamos el selector de ciudad
                const citySelect = elements.setupCity;
                citySelect.disabled = true;
                citySelect.innerHTML = '<option value="">Primero elige un país</option>';
            }
        });
    }

    // En script.js, dentro de la función setupEventListeners()

    // --- AÑADE ESTE BLOQUE PARA EL CONTADOR DE LA BIOGRAFÍA ---
    const bioTextarea = document.getElementById('setupBio');
    const bioCharCounter = document.getElementById('bioCharCounter');

    if (bioTextarea && bioCharCounter) {
        bioTextarea.addEventListener('input', () => {
            const maxLength = 150;
            const currentLength = bioTextarea.value.length;
            bioCharCounter.textContent = `${currentLength} / ${maxLength}`;
            
            // Opcional: cambiar color si se pasa del límite
            if (currentLength > maxLength) {
                bioCharCounter.style.color = 'var(--danger-color)';
                bioTextarea.value = bioTextarea.value.substring(0, maxLength);
                bioCharCounter.textContent = `${maxLength} / ${maxLength}`;
            } else {
                bioCharCounter.style.color = 'var(--gray-500)';
            }
        });
    }
    // --- FIN DEL BLOQUE A AÑADIR ---

    // --- AÑADE ESTE BLOQUE PARA LOS INTERESES ---
    // Add event listeners to interest cards
    document.querySelectorAll('.interest-card').forEach(card => {
        card.addEventListener('click', () => {
            const interestId = card.dataset.interestId;
            toggleInterest(interestId);
        });
    });
    // --- FIN DEL BLOQUE A AÑADIR ---
}

// ============================================= 
// PERFIL COMPLETO
// ============================================= 
async function completeProfile() {
    // 1. Validar el paso actual (privacidad)
    if (!validatePrivacySettings()) {
        return;
    }

    const completeBtn = document.getElementById('completeBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Hacemos que el botón y el overlay de carga funcionen de forma segura
    if (completeBtn) {
        completeBtn.classList.add('loading');
        completeBtn.disabled = true;
    }
    // Llamamos a showLoading que ahora es segura
    showLoading(true);

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('FALLO CRÍTICO: auth.currentUser es nulo o indefinido.');
        }
        const userId = currentUser.uid;

        let photoURL = profileSetupData.profilePhotoUrl || null;

        // --- INICIO DE TU ZONA DE DEPURACIÓN (SE MANTIENE) ---
        console.log("--- INICIANDO DEPURACIÓN DE SUBIDA DE FOTO ---");
        console.log("¿Hay una foto seleccionada? (selectedPhoto):", selectedPhoto);

        if (selectedPhoto) {
            console.log("Valor de 'storage':", storage);
            console.log("Valor de 'userId':", userId);
            console.log("Valor de 'selectedPhoto.name':", selectedPhoto ? selectedPhoto.name : "selectedPhoto es nulo");

            if (!storage || !userId || !selectedPhoto.name) {
                throw new Error(`¡Una variable es inválida! storage: ${!!storage}, userId: ${!!userId}, selectedPhoto.name: ${selectedPhoto ? selectedPhoto.name : 'N/A'}`);
            }

            console.log("Todo parece correcto. Intentando crear la referencia de Storage...");
            const photoRef = ref(storage, `profile_photos/${userId}/${selectedPhoto.name}`);
            console.log("Referencia de Storage creada con éxito:", photoRef);

            const uploadResult = await uploadBytes(photoRef, selectedPhoto);
            photoURL = await getDownloadURL(uploadResult.ref);
            console.log("Foto subida y URL obtenida:", photoURL);
        } else {
            console.log("No se seleccionó ninguna foto. Omitiendo subida.");
        }
        // --- FIN DE TU ZONA DE DEPURACIÓN ---

        // ==================================================================
        // ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE!
        // Construimos el objeto de datos de forma limpia y explícita,
        // usando los valores de profileSetupData y selectedInterests.
        // Esto evita enviar datos complejos o no válidos a Firestore.
        // ==================================================================
        const finalProfileData = {
            username: sanitizeInput(profileSetupData.username || ""),
            bio: sanitizeInput(profileSetupData.bio || ""),
            age: profileSetupData.age || null,
            gender: sanitizeInput(profileSetupData.gender || ""),
            country: sanitizeInput(profileSetupData.country || ""),
            city: sanitizeInput(profileSetupData.city || ""),
            interests: Array.isArray(selectedInterests) ? selectedInterests.map(i => sanitizeInput(i)) : [],
            privacy: document.querySelector('input[name="privacy"]:checked').value,
            profilePhotoUrl: photoURL,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Actualizamos el documento en Firestore con los datos limpios.
        await updateDoc(doc(db, "users", userId), finalProfileData);

        // --- INICIO DE TU LÓGICA DE TRANSICIÓN (SE MANTIENE) ---
        
        // Preparamos los datos para la nueva pantalla del menú
        const menuUsernameEl = document.getElementById('menuUsername');
        const menuProfileAvatarEl = document.getElementById('menuProfileAvatar');
        
        // Obtenemos el nombre de usuario directamente desde Firestore para asegurar consistencia
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && menuUsernameEl) {
            menuUsernameEl.textContent = userDoc.data().username;
        }

        if (menuProfileAvatarEl) {
            menuProfileAvatarEl.src = photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Cpath d='M50 58.33C63.43 58.33 74.17 69.07 74.17 82.5V91.67H25.83V82.5C25.83 69.07 36.57 58.33 50 58.33Z' fill='%23bdbdbd'/%3E%3Ccircle cx='50' cy='41.67' r='16.67' fill='%23bdbdbd'/%3E%3C/svg%3E";
        }

        showToast('success', '¡Bienvenido!', 'Tu perfil ha sido configurado.');

        // Transición a la pantalla de menú
        setTimeout(() => {
            showScreen('mainMenu');
            // Load feed when showing main menu
            loadFeed();
        }, 1500);
        // --- FIN DE TU LÓGICA DE TRANSICIÓN ---

    } catch (error) {
        handleGlobalError(error, 'completeProfile');
    } finally {
        // Asegurarse de que el estado de carga se limpie siempre
        if (completeBtn) {
            completeBtn.classList.remove('loading');
            completeBtn.disabled = false;
        }
        showLoading(false);
    }
}

// ============================================= 
// AUTHENTICATION FUNCTIONS
// ============================================= 

// Handle user login
async function handleLogin(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateLoginForm()) {
        return;
    }
    
    const email = sanitizeInput(document.getElementById('loginEmail').value.trim());
    const password = document.getElementById('loginPassword').value;
    
    // Show loading state
    const loginBtn = document.querySelector('#loginFormElement .auth-btn');
    const originalBtnText = loginBtn.querySelector('.btn-text').textContent;
    loginBtn.querySelector('.btn-text').textContent = 'Iniciando sesión...';
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user has completed profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists() && userDoc.data().completedAt) {
            // Profile completed, go to main menu
            appState.userData = userDoc.data();
            showScreen('mainMenu');
            showToast('success', '¡Bienvenido!', `Hola de nuevo, ${userDoc.data().username}`);
            
            // Load feed
            loadFeed();
        } else {
            // Profile not completed, go to profile setup
            if (userDoc.exists()) {
                profileSetupData = { ...userDoc.data() };
                document.getElementById('setupName').value = userDoc.data().username || '';
            }
            showScreen('profileSetup');
            showToast('info', 'Casi listo...', 'Por favor, termina de configurar tu perfil.');
        }
    } catch (error) {
        handleGlobalError(error, 'handleLogin');
    } finally {
        // Reset loading state
        loginBtn.querySelector('.btn-text').textContent = originalBtnText;
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Handle user registration
async function handleRegister(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateRegistrationForm()) {
        return;
    }
    
    const name = sanitizeInput(document.getElementById('registerName').value.trim());
    const email = sanitizeInput(document.getElementById('registerEmail').value.trim());
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Show loading state
    const registerBtn = document.querySelector('#registerFormElement .auth-btn');
    const originalBtnText = registerBtn.querySelector('.btn-text').textContent;
    registerBtn.querySelector('.btn-text').textContent = 'Registrando...';
    registerBtn.classList.add('loading');
    registerBtn.disabled = true;
    
    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save additional user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: name,
            email: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        // Go to profile setup
        profileSetupData = { username: name, email: email };
        document.getElementById('setupName').value = name;
        showScreen('profileSetup');
        showToast('success', '¡Registro exitoso!', 'Por favor, completa tu perfil para continuar.');
    } catch (error) {
        handleGlobalError(error, 'handleRegister');
    } finally {
        // Reset loading state
        registerBtn.querySelector('.btn-text').textContent = originalBtnText;
        registerBtn.classList.remove('loading');
        registerBtn.disabled = false;
    }
}

// Handle password reset
async function handleForgotPassword(e) {
    e.preventDefault();
    
    // Validate form
    if (!validatePasswordResetForm()) {
        return;
    }
    
    const email = sanitizeInput(document.getElementById('forgotEmail').value.trim());
    
    // Show loading state
    const resetBtn = document.querySelector('#forgotPasswordFormElement .auth-btn');
    const originalBtnText = resetBtn.querySelector('.btn-text').textContent;
    resetBtn.querySelector('.btn-text').textContent = 'Enviando...';
    resetBtn.classList.add('loading');
    resetBtn.disabled = true;
    
    try {
        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        showToast('success', 'Correo enviado', 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
        
        // Clear the form
        document.getElementById('forgotEmail').value = '';
        
        // Switch back to login form after a delay
        setTimeout(() => {
            switchAuthForm('login');
        }, 3000);
    } catch (error) {
        handleGlobalError(error, 'handleForgotPassword');
    } finally {
        // Reset loading state
        resetBtn.querySelector('.btn-text').textContent = originalBtnText;
        resetBtn.classList.remove('loading');
        resetBtn.disabled = false;
    }
}

// Switch between authentication forms
function switchAuthForm(formType) {
    // Hide all forms
    elements.loginFormContainer.classList.remove('active');
    elements.registerFormContainer.classList.remove('active');
    elements.forgotPasswordFormContainer.classList.remove('active');
    
    // Show the requested form
    switch(formType) {
        case 'login':
            elements.loginFormContainer.classList.add('active');
            break;
        case 'register':
            elements.registerFormContainer.classList.add('active');
            break;
        case 'forgotPassword':
            elements.forgotPasswordFormContainer.classList.add('active');
            break;
    }
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// Handle Google login/register
async function handleGoogleLogin() {
    // Show loading state
    showLoading(true);
    
    try {
        // Sign in with Google popup
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user document exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            await setDoc(userDocRef, {
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                profilePhotoUrl: user.photoURL || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            // Go to profile setup since this is a new user
            profileSetupData = { 
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                profilePhotoUrl: user.photoURL || null
            };
            document.getElementById('setupName').value = profileSetupData.username;
            showScreen('profileSetup');
            showToast('success', '¡Bienvenido!', 'Por favor, completa tu perfil para continuar.');
        } else {
            // User exists, check if profile is completed
            const userData = userDoc.data();
            if (userData.completedAt) {
                // Profile completed, go to main menu
                showScreen('mainMenu');
                showToast('success', '¡Bienvenido!', `Hola de nuevo, ${userData.username}`);
            } else {
                // Profile not completed, go to profile setup
                profileSetupData = { ...userData };
                document.getElementById('setupName').value = userData.username || '';
                showScreen('profileSetup');
                showToast('info', 'Casi listo...', 'Por favor, termina de configurar tu perfil.');
            }
        }
    } catch (error) {
        console.error("Error during Google authentication:", error);
        let errorMessage = 'Error desconocido al iniciar sesión con Google';
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Ventana de autenticación cerrada por el usuario';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Solicitud de autenticación cancelada';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Error de red. Por favor, verifica tu conexión';
                break;
            default:
                errorMessage = 'Error al iniciar sesión con Google. Por favor, inténtalo de nuevo';
        }
        
        showToast('error', 'Error de autenticación', errorMessage);
    } finally {
        // Hide loading state
        showLoading(false);
    }
}

// Handle photo selection
function handlePhotoSelection(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (validTypes.includes(file.type)) {
            selectedPhoto = file;
            elements.photoPreview.src = URL.createObjectURL(file);
            elements.photoPreview.classList.add('active');
            elements.removePhotoBtn.classList.add('active');
        } else {
            showToast('error', 'Tipo de archivo no válido', 'Solo se permiten imágenes (JPEG, PNG, GIF)');
            e.target.value = ''; // Clear the input
        }
    }
}

// Remove photo
function removePhoto() {
    selectedPhoto = null;
    elements.photoPreview.src = '';
    elements.photoPreview.classList.remove('active');
    elements.removePhotoBtn.classList.remove('active');
}

// Handle interest search
function handleInterestSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredInterests = interestsData.filter(interest => interest.name.toLowerCase().includes(searchTerm));
    
    // Clear existing interests
    elements.interestsGrid.innerHTML = '';
    
    if (filteredInterests.length === 0) {
        elements.noResultsMessage.classList.add('active');
    } else {
        elements.noResultsMessage.classList.remove('active');
    }
    
    filteredInterests.forEach(interest => {
        const interestElement = document.createElement('div');
        interestElement.classList.add('interest-item');
        interestElement.innerHTML = `<i class="${interest.icon}"></i> ${interest.name}`;
        interestElement.addEventListener('click', () => {
            interestElement.classList.toggle('selected');
            const interestId = interest.id;
            if (interestElement.classList.contains('selected')) {
                selectedInterests.push(interestId);
            } else {
                selectedInterests = selectedInterests.filter(id => id !== interestId);
            }
            updateInterestCounter();
        });
        elements.interestsGrid.appendChild(interestElement);
    });
}

// Update interest counter
function updateInterestCounter() {
    elements.interestCounter.textContent = `${selectedInterests.length} / 5`;
    const progressBarWidth = (selectedInterests.length / 5) * 100;
    elements.counterProgressBar.style.width = `${progressBarWidth}%`;
}

// Generate interests grid
function generateInterests() {
    handleInterestSearch({ target: { value: '' } });
}

// Handle step navigation
function nextStep() {
    if (currentStep < 3) {
        currentStep++;
        updateStepUI();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

// Update setup steps UI
function updateStepUI() {
    elements.setupSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep - 1);
    });
    
    elements.progressSteps.forEach((step, index) => {
        step.classList.toggle('active', index < currentStep);
    });
    
    if (currentStep === 1) {
        elements.prevBtn.classList.add('disabled');
    } else {
        elements.prevBtn.classList.remove('disabled');
    }
    
    if (currentStep === 3) {
        elements.nextBtn.classList.add('disabled');
        elements.completeBtn.classList.remove('disabled');
    } else {
        elements.nextBtn.classList.remove('disabled');
        elements.completeBtn.classList.add('disabled');
    }
}

// Validate privacy settings
function validatePrivacySettings() {
    const selectedPrivacy = document.querySelector('input[name="privacy"]:checked');
    if (!selectedPrivacy) {
        showToast('error', 'Error', 'Por favor selecciona una opción de privacidad');
        return false;
    }
    return true;
}

// Show loading overlay
function showLoading(isLoading) {
    if (isLoading) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

// Show toast notification
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// Validate password strength
function validatePasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthMeter = document.getElementById('passwordStrengthMeter');
    const strengthValue = document.getElementById('passwordStrengthValue');
    
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

// Handle username availability check
async function checkUsernameAvailability(username) {
    try {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            appState.isUsernameAvailable = true;
            showToast('success', 'Nombre de usuario disponible', `¡Puedes usar "${username}"!`);
        } else {
            appState.isUsernameAvailable = false;
            showToast('error', 'Nombre de usuario no disponible', `"${username}" ya está en uso.`);
        }
    } catch (error) {
        console.error("Error during username availability check:", error);
        showToast('error', 'Error', 'No se pudo verificar la disponibilidad del nombre de usuario');
    }
}

// Real-time validation setup
function setupRealTimeValidation() {
    const setupName = document.getElementById('setupName');
    
    if (setupName) {
        setupName.addEventListener('input', (e) => {
            const username = e.target.value.trim();
            if (username.length >= 3) {
                checkUsernameAvailability(username);
            } else {
                appState.isUsernameAvailable = false;
            }
        });
    }
}

// Populate countries dropdown
function populateCountries() {
    const countrySelect = elements.setupCountry;
    countryList.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Populate cities dropdown based on selected country
function populateCities(countryCode) {
    const citySelect = elements.setupCity;
    const cities = cityListByCountry[countryCode];
    
    citySelect.innerHTML = '';
    citySelect.disabled = false;
    
    if (cities) {
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Sin ciudades disponibles</option>';
    }
}

// Handle avatar generation
async function handleGenerateAvatar() {
    try {
        // Simulate avatar generation (for demonstration purposes)
        const avatarUrl = 'https://via.placeholder.com/150';
        profileSetupData.profilePhotoUrl = avatarUrl;
        elements.photoPreview.src = avatarUrl;
        elements.photoPreview.classList.add('active');
        elements.removePhotoBtn.classList.add('active');
        showToast('success', '¡Avatar generado!', 'Tu avatar ha sido generado.');
    } catch (error) {
        console.error("Error during avatar generation:", error);
        showToast('error', 'Error', 'No se pudo generar el avatar');
    }
}

// Load remembered user (if any)
function loadRememberedUser() {
    // This function can be expanded to load user data from local storage or cookies
    // For now, it's a placeholder
}

// ============================================= 
// PROFILE MANAGEMENT FUNCTIONS
// ============================================= 

// Save profile information from current step
function saveProfileInfo() {
    switch(currentStep) {
        case 1: // Basic info
            profileSetupData.bio = document.getElementById('setupBio').value;
            profileSetupData.age = document.getElementById('setupAge').value;
            profileSetupData.gender = document.getElementById('setupGender').value;
            profileSetupData.country = document.getElementById('setupCountry').value;
            profileSetupData.city = document.getElementById('setupCity').value;
            break;
        case 2: // Profile photo
            // Photo is handled separately
            break;
        case 3: // Interests
            // Interests are handled separately
            break;
    }
}

// Validate current step before proceeding
function validateCurrentStep() {
    switch(currentStep) {
        case 1: // Basic info
            const age = document.getElementById('setupAge').value;
            const country = document.getElementById('setupCountry').value;
            const city = document.getElementById('setupCity').value;
            
            if (age && (age < 13 || age > 120)) {
                showToast('error', 'Error', 'La edad debe estar entre 13 y 120 años');
                return false;
            }
            
            if (country && !city) {
                showToast('error', 'Error', 'Por favor selecciona una ciudad');
                return false;
            }
            
            return true;
        case 2: // Profile photo
            // No validation needed
            return true;
        case 3: // Interests
            if (selectedInterests.length < 3) {
                showToast('error', 'Error', 'Por favor selecciona al menos 3 intereses');
                return false;
            }
            return true;
    }
    return true;
}

// Enhanced next step function with validation
function nextStep() {
    // Save current step data
    saveProfileInfo();
    
    // Validate current step
    if (!validateCurrentStep()) {
        return;
    }
    
    if (currentStep < 4) {
        currentStep++;
        updateStepUI();
    }
}

// Enhanced previous step function
function prevStep() {
    // Save current step data
    saveProfileInfo();
    
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

// Handle photo selection
function handlePhotoSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showToast('error', 'Error', 'Por favor selecciona una imagen válida (JPEG, PNG, GIF)');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Error', 'La imagen debe ser menor a 5MB');
        return;
    }
    
    // Save file reference
    selectedPhoto = file;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.photoPreview.src = e.target.result;
        elements.photoPreview.classList.add('active');
        elements.removePhotoBtn.classList.add('active');
    };
    reader.readAsDataURL(file);
    
    showToast('success', 'Imagen seleccionada', 'Haz clic en "Completar Perfil" para guardar los cambios');
}

// Remove selected photo
function removePhoto() {
    selectedPhoto = null;
    elements.photoPreview.src = '';
    elements.photoPreview.classList.remove('active');
    elements.removePhotoBtn.classList.remove('active');
    document.getElementById('photoInput').value = '';
    showToast('info', 'Imagen eliminada', 'La imagen ha sido eliminada');
}

// Toggle interest selection
function toggleInterest(interestId) {
    const index = selectedInterests.indexOf(interestId);
    if (index > -1) {
        // Remove interest
        selectedInterests.splice(index, 1);
    } else {
        // Add interest (max 10)
        if (selectedInterests.length >= 10) {
            showToast('error', 'Límite alcanzado', 'Puedes seleccionar máximo 10 intereses');
            return;
        }
        selectedInterests.push(interestId);
    }
    
    // Update UI
    updateInterestSelectionUI();
}

// Update interest selection UI
function updateInterestSelectionUI() {
    // Update counter
    const counter = document.getElementById('interestCounter');
    if (counter) {
        counter.textContent = `${selectedInterests.length}/10`;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('counterProgressBar');
    if (progressBar) {
        const percentage = (selectedInterests.length / 10) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update interest cards
    document.querySelectorAll('.interest-card').forEach(card => {
        const interestId = card.dataset.interestId;
        if (selectedInterests.includes(interestId)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Handle interest search
function handleInterestSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const noResultsMessage = document.getElementById('noResultsMessage');
    let hasResults = false;
    
    document.querySelectorAll('.interest-card').forEach(card => {
        const interestName = card.querySelector('.interest-name').textContent.toLowerCase();
        if (interestName.includes(searchTerm)) {
            card.style.display = 'block';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResultsMessage) {
        noResultsMessage.style.display = hasResults ? 'none' : 'block';
    }
}

// Select privacy option
function selectPrivacyOption(card) {
    // Remove active class from all cards
    elements.privacyCards.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked card
    card.classList.add('active');
    
    // Check the corresponding radio button
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

// Update setup steps UI
function updateStepUI() {
    elements.setupSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep - 1);
    });
    
    elements.progressSteps.forEach((step, index) => {
        step.classList.toggle('active', index < currentStep);
    });
    
    if (currentStep === 1) {
        elements.prevBtn.classList.add('disabled');
    } else {
        elements.prevBtn.classList.remove('disabled');
    }
    
    if (currentStep === 4) {
        elements.nextBtn.classList.add('disabled');
        elements.completeBtn.classList.remove('disabled');
    } else {
        elements.nextBtn.classList.remove('disabled');
        elements.completeBtn.classList.add('disabled');
    }
}

// ============================================= 
// SOCIAL FEATURES FUNCTIONS
// ============================================= 

// Create a new secret/post
async function createSecret(content, privacy) {
    if (!auth.currentUser) {
        showToast('error', 'Error', 'Debes iniciar sesión para crear un secreto');
        return;
    }
    
    if (!content.trim()) {
        showToast('error', 'Error', 'El contenido del secreto no puede estar vacío');
        return;
    }
    
    if (content.length > 500) {
        showToast('error', 'Error', 'El secreto no puede exceder 500 caracteres');
        return;
    }
    
    try {
        // Show loading state
        showLoading(true);
        
        // Create secret document
        const secretRef = doc(collection(db, "secrets"));
        const secretData = {
            id: secretRef.id,
            content: content,
            privacy: privacy, // 'public', 'friends', 'private'
            authorId: auth.currentUser.uid,
            authorName: appState.userData.username,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            likedBy: []
        };
        
        // Save to Firestore
        await setDoc(secretRef, secretData);
        
        // Hide loading state
        showLoading(false);
        
        showToast('success', '¡Secreto publicado!', 'Tu secreto ha sido compartido con la comunidad');
        return true;
    } catch (error) {
        console.error("Error creating secret:", error);
        showLoading(false);
        showToast('error', 'Error', 'No se pudo publicar el secreto. Por favor, inténtalo de nuevo');
        return false;
    }
}

// ============================================= 
// ERROR HANDLING AND VALIDATION FUNCTIONS
// ============================================= 

// Global error handler
function handleGlobalError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let userMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    
    // Firebase specific errors
    if (error.code) {
        switch (error.code) {
            case 'auth/network-request-failed':
                userMessage = 'Error de red. Por favor, verifica tu conexión a internet.';
                break;
            case 'auth/too-many-requests':
                userMessage = 'Demasiadas solicitudes. Por favor, inténtalo más tarde.';
                break;
            case 'auth/user-disabled':
                userMessage = 'Esta cuenta ha sido deshabilitada.';
                break;
            case 'auth/user-token-expired':
                userMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                break;
            case 'auth/web-storage-unsupported':
                userMessage = 'Tu navegador no soporta almacenamiento web. Por favor, actualiza tu navegador.';
                break;
            case 'firestore/unavailable':
                userMessage = 'Servicio temporalmente no disponible. Por favor, inténtalo más tarde.';
                break;
            case 'firestore/permission-denied':
                userMessage = 'No tienes permiso para realizar esta acción.';
                break;
            case 'firestore/resource-exhausted':
                userMessage = 'Has excedido el límite de uso. Por favor, inténtalo más tarde.';
                break;
        }
    }
    
    showToast('error', 'Error', userMessage);
}

// Form validation utilities
const validators = {
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? null : 'Por favor ingresa un correo electrónico válido';
    },
    
    password: (value) => {
        if (value.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        return null;
    },
    
    confirmPassword: (password, confirmPassword) => {
        if (password !== confirmPassword) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    },
    
    username: (value) => {
        if (value.length < 3) {
            return 'El nombre de usuario debe tener al menos 3 caracteres';
        }
        if (value.length > 20) {
            return 'El nombre de usuario no puede exceder 20 caracteres';
        }
        const regex = /^[a-zA-Z0-9_]+$/;
        if (!regex.test(value)) {
            return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
        }
        return null;
    },
    
    age: (value) => {
        const age = parseInt(value);
        if (isNaN(age) || age < 13 || age > 120) {
            return 'La edad debe estar entre 13 y 120 años';
        }
        return null;
    },
    
    required: (value, fieldName = 'Este campo') => {
        if (!value || value.toString().trim() === '') {
            return `${fieldName} es obligatorio`;
        }
        return null;
    }
};

// Enhanced validation for registration form
function validateRegistrationForm() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate each field
    const nameError = validators.username(name) || validators.required(name, 'Nombre de usuario');
    if (nameError) {
        showToast('error', 'Error', nameError);
        return false;
    }
    
    const emailError = validators.email(email) || validators.required(email, 'Correo electrónico');
    if (emailError) {
        showToast('error', 'Error', emailError);
        return false;
    }
    
    const passwordError = validators.password(password) || validators.required(password, 'Contraseña');
    if (passwordError) {
        showToast('error', 'Error', passwordError);
        return false;
    }
    
    const confirmPasswordError = validators.confirmPassword(password, confirmPassword);
    if (confirmPasswordError) {
        showToast('error', 'Error', confirmPasswordError);
        return false;
    }
    
    return true;
}

// Enhanced validation for login form
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const emailError = validators.email(email) || validators.required(email, 'Correo electrónico');
    if (emailError) {
        showToast('error', 'Error', emailError);
        return false;
    }
    
    const passwordError = validators.required(password, 'Contraseña');
    if (passwordError) {
        showToast('error', 'Error', passwordError);
        return false;
    }
    
    return true;
}

// Enhanced validation for password reset form
function validatePasswordResetForm() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    const emailError = validators.email(email) || validators.required(email, 'Correo electrónico');
    if (emailError) {
        showToast('error', 'Error', emailError);
        return false;
    }
    
    return true;
}

// Enhanced validation for profile setup step 1
function validateProfileStep1() {
    const bio = document.getElementById('setupBio').value.trim();
    const age = document.getElementById('setupAge').value;
    const gender = document.getElementById('setupGender').value;
    const country = document.getElementById('setupCountry').value;
    const city = document.getElementById('setupCity').value;
    
    // Bio length validation
    if (bio.length > 150) {
        showToast('error', 'Error', 'La biografía no puede exceder 150 caracteres');
        return false;
    }
    
    // Age validation
    if (age) {
        const ageError = validators.age(age);
        if (ageError) {
            showToast('error', 'Error', ageError);
            return false;
        }
    }
    
    // Country and city validation
    if (country && !city) {
        showToast('error', 'Error', 'Por favor selecciona una ciudad');
        return false;
    }
    
    return true;
}

// Enhanced validation for profile setup step 3 (interests)
function validateProfileStep3() {
    if (selectedInterests.length < 3) {
        showToast('error', 'Error', 'Por favor selecciona al menos 3 intereses');
        return false;
    }
    
    if (selectedInterests.length > 10) {
        showToast('error', 'Error', 'Puedes seleccionar máximo 10 intereses');
        return false;
    }
    
    return true;
}

// Enhanced validation for privacy settings
function validatePrivacySettings() {
    const selectedPrivacy = document.querySelector('input[name="privacy"]:checked');
    if (!selectedPrivacy) {
        showToast('error', 'Error', 'Por favor selecciona una opción de privacidad');
        return false;
    }
    return true;
}

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}


// Load user feed
async function loadFeed() {
    if (!auth.currentUser) {
        showToast('error', 'Error', 'Debes iniciar sesión para ver el feed');
        return;
    }
    
    try {
        // Show loading state
        showLoading(true);
        
        // Query secrets (for now, load all public secrets)
        // In a real app, you would implement a more sophisticated algorithm
        // based on user interests, friends, etc.
        const q = query(
            collection(db, "secrets"),
            where("privacy", "==", "public"),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const secrets = [];
        
        querySnapshot.forEach((doc) => {
            secrets.push({ id: doc.id, ...doc.data() });
        });
        
        // Display secrets in feed
        displayFeed(secrets);
        
        // Hide loading state
        showLoading(false);
        
        return secrets;
    } catch (error) {
        console.error("Error loading feed:", error);
        showLoading(false);
        showToast('error', 'Error', 'No se pudo cargar el feed. Por favor, inténtalo de nuevo');
        return [];
    }
}

// Display secrets in feed
function displayFeed(secrets) {
    const feedContainer = document.querySelector('.content-placeholder');
    if (!feedContainer) return;
    
    // Clear existing content
    feedContainer.innerHTML = '';
    
    if (secrets.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-feed">
                <i class="fas fa-stream"></i>
                <h3>No hay secretos aún</h3>
                <p>Sé el primero en compartir un secreto con la comunidad</p>
                <button class="auth-btn primary" id="createFirstSecretBtn">
                    <span>Crear mi primer secreto</span>
                </button>
            </div>
        `;
        
        // Add event listener to create button
        const createBtn = document.getElementById('createFirstSecretBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                // Navigate to create secret screen (would need to implement)
                showToast('info', 'Función en desarrollo', 'La función para crear secretos estará disponible pronto');
            });
        }
        return;
    }
    
    // Create feed items
    secrets.forEach(secret => {
        const secretElement = document.createElement('div');
        secretElement.className = 'secret-card';
        secretElement.innerHTML = `
            <div class="secret-header">
                <div class="author-info">
                    <div class="author-avatar">
                        <i class="fas fa-user-secret"></i>
                    </div>
                    <div class="author-details">
                        <span class="author-name">${secret.authorName || 'Usuario anónimo'}</span>
                        <span class="secret-date">${formatDate(secret.createdAt)}</span>
                    </div>
                </div>
                <div class="secret-actions">
                    <button class="action-btn"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>
            <div class="secret-content">
                <p>${escapeHtml(secret.content)}</p>
            </div>
            <div class="secret-footer">
                <button class="interaction-btn like-btn" data-secret-id="${secret.id}">
                    <i class="fas fa-heart"></i>
                    <span>${secret.likes || 0}</span>
                </button>
                <button class="interaction-btn comment-btn" data-secret-id="${secret.id}">
                    <i class="fas fa-comment"></i>
                    <span>${secret.comments || 0}</span>
                </button>
                <button class="interaction-btn share-btn" data-secret-id="${secret.id}">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        `;
        feedContainer.appendChild(secretElement);
    });
    
    // Add event listeners to like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLikeSecret);
    });
}

// Handle like secret
async function handleLikeSecret(e) {
    const btn = e.currentTarget;
    const secretId = btn.dataset.secretId;
    
    if (!auth.currentUser) {
        showToast('error', 'Error', 'Debes iniciar sesión para dar me gusta');
        return;
    }
    
    try {
        const secretRef = doc(db, "secrets", secretId);
        const secretDoc = await getDoc(secretRef);
        
        if (!secretDoc.exists()) {
            showToast('error', 'Error', 'Secreto no encontrado');
            return;
        }
        
        const secretData = secretDoc.data();
        const userId = auth.currentUser.uid;
        let likedBy = secretData.likedBy || [];
        let likes = secretData.likes || 0;
        
        // Check if user already liked
        const isLiked = likedBy.includes(userId);
        
        if (isLiked) {
            // Unlike
            likedBy = likedBy.filter(id => id !== userId);
            likes = Math.max(0, likes - 1);
        } else {
            // Like
            likedBy.push(userId);
            likes += 1;
        }
        
        // Update secret
        await updateDoc(secretRef, {
            likedBy: likedBy,
            likes: likes
        });
        
        // Update UI
        const likeCount = btn.querySelector('span');
        if (likeCount) {
            likeCount.textContent = likes;
        }
        
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart' : 'fas fa-heart liked';
        }
        
    } catch (error) {
        console.error("Error liking secret:", error);
        showToast('error', 'Error', 'No se pudo procesar tu me gusta');
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor((diffMs % 86400000) / 3600000);
    const diffMinutes = Math.floor(((diffMs % 86400000) % 3600000) / 60000);
    
    if (diffDays > 0) {
        return `${diffDays}d`;
    } else if (diffHours > 0) {
        return `${diffHours}h`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes}m`;
    } else {
        return 'Ahora';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
