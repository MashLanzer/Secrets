// Importar Firebase y sus funciones

// Al principio de script.js
import { 
    auth, db, storage, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, 
    signOut, doc, setDoc, getDoc, updateDoc, GoogleAuthProvider, signInWithPopup,
    collection, query, where, getDocs, limit,
    ref, uploadBytes, getDownloadURL 
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
            showToast('success', '¡Bienvenido!', 'Redirigiendo a la aplicación principal...');
            setTimeout(() => {
                window.location.href = '/app'; // Cambiar por la URL de tu aplicación principal
            }, 2000);
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
            showToast('info', 'Navegación', `Navegando a ${section}`);
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

    // --- AÑADE ESTE BLOQUE ---
    /*
    const registerNameInput = document.getElementById('registerName');
    if (registerNameInput) {
        registerNameInput.addEventListener('keyup', (e) => {
            clearTimeout(usernameCheckTimer); // Cancela el temporizador anterior
            // Inicia uno nuevo: la validación se ejecutará 500ms después de que el usuario deje de teclear
            usernameCheckTimer = setTimeout(() => {
                checkUsernameAvailability(e.target.value);
            }, 500);
        });
    }
        */
    // --- FIN DEL BLOQUE A AÑADIR ---
    
    // Validación en tiempo real
    setupRealTimeValidation();
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
            bio: profileSetupData.bio || "",
            age: profileSetupData.age || null,
            gender: profileSetupData.gender || "",
            country: profileSetupData.country || "",
            city: profileSetupData.city || "",
            interests: Array.isArray(selectedInterests) ? selectedInterests : [],
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
        }, 1500);
        // --- FIN DE TU LÓGICA DE TRANSICIÓN ---

    } catch (error) {
        console.error('--- ERROR DETALLADO CAPTURADO ---');
        console.error(error); // Muestra el error completo en la consola
        showToast('error', 'Error Inesperado', 'No se pudo guardar tu perfil. Revisa la consola.');
          
    } finally {
        // Asegurarse de que el estado de carga se limpie siempre
        if (completeBtn) {
            completeBtn.classList.remove('loading');
            completeBtn.disabled = false;
        }
        showLoading(false);
    }
}
