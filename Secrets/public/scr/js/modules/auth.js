// Import Firebase auth functions
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function setupAuth(auth, db, state, elements, switchView, showToast) {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');
    const googleLoginBtn = document.getElementById('google-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Show login form
    showLoginBtn.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        showLoginBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
    });
    
    // Show signup form
    showSignupBtn.addEventListener('click', () => {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        showSignupBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showToast('Logged in successfully!', 'success');
            switchView('feed');
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
            }
            
            showToast(errorMessage, 'error');
        }
    });
    
    // Handle signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update profile with display name
            await updateProfile(user, { displayName: name });
            
            showToast('Account created successfully!', 'success');
            switchView('feed');
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Failed to create account. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account already exists with this email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.';
                    break;
            }
            
            showToast(errorMessage, 'error');
        }
    });
    
    // Handle Google login
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            await signInWithPopup(auth, provider);
            showToast('Logged in with Google successfully!', 'success');
            switchView('feed');
        } catch (error) {
            console.error('Google login error:', error);
            let errorMessage = 'Failed to login with Google. Please try again.';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Google sign-in popup was closed.';
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = 'Google sign-in was cancelled.';
                    break;
            }
            
            showToast(errorMessage, 'error');
        }
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            showToast('Logged out successfully!', 'success');
            switchView('auth');
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Failed to logout. Please try again.', 'error');
        }
    });
}