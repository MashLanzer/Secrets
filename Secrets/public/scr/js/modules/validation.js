// Form validation functions

// Validate signup form
export function validateSignupForm(name, email, password, confirmPassword) {
    const errors = [];
    
    // Validate name
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    // Validate email
    if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate password
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

// Validate login form
export function validateLoginForm(email, password) {
    const errors = [];
    
    // Validate email
    if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate password
    if (!password || password.length < 1) {
        errors.push('Please enter your password');
    }
    
    return errors;
}

// Validate secret form
export function validateSecretForm(content) {
    const errors = [];
    
    // Validate content
    if (!content || content.trim().length < 1) {
        errors.push('Please enter your secret');
    }
    
    if (content.trim().length > 500) {
        errors.push('Secret must be less than 500 characters');
    }
    
    return errors;
}

// Email validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Export all validation functions
export { validateEmail };