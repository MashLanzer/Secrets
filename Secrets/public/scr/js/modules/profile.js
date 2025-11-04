// Import Firebase functions
import { 
    collection, 
    query, 
    where, 
    getDocs,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function setupProfile(auth, db, state, elements, switchView, showToast) {
    // DOM Elements
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileImage = document.getElementById('profile-image');
    const userSecretsContainer = document.getElementById('user-secrets');
    
    // Update profile information when user is authenticated
    auth.onAuthStateChanged(user => {
        if (user) {
            // Update profile header
            profileName.textContent = user.displayName || 'Anonymous User';
            profileEmail.textContent = user.email;
            
            // Set profile image
            if (user.photoURL) {
                profileImage.src = user.photoURL;
            } else {
                // Use first letter of name or email for avatar
                const firstLetter = (user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)).toUpperCase();
                profileImage.src = `https://placehold.co/100x100/4285f4/ffffff?text=${firstLetter}`;
            }
            
            // Load user's secrets
            loadUserSecrets(user.uid);
        }
    });
    
    // Load user's secrets
    async function loadUserSecrets(userId) {
        try {
            userSecretsContainer.innerHTML = '<p>Loading your secrets...</p>';
            
            const secretsQuery = query(
                collection(db, 'secrets'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            
            const querySnapshot = await getDocs(secretsQuery);
            
            if (querySnapshot.empty) {
                userSecretsContainer.innerHTML = '<p>You haven\'t shared any secrets yet.</p>';
                return;
            }
            
            let secretsHTML = '';
            querySnapshot.forEach((doc) => {
                const secret = doc.data();
                secretsHTML += createSecretCard(secret, doc.id, true);
            });
            
            userSecretsContainer.innerHTML = secretsHTML;
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-secret').forEach(button => {
                button.addEventListener('click', function() {
                    const secretId = this.dataset.secretId;
                    deleteSecret(secretId);
                });
            });
        } catch (error) {
            console.error('Error loading user secrets:', error);
            userSecretsContainer.innerHTML = '<p>Failed to load your secrets. Please try again later.</p>';
        }
    }
    
    // Create secret card HTML
    function createSecretCard(secret, secretId, isUserSecret = false) {
        const timestamp = secret.timestamp ? secret.timestamp.toDate().toLocaleString() : 'Unknown time';
        const userName = secret.userName || 'Anonymous';
        const firstLetter = userName.charAt(0).toUpperCase();
        
        return `
            <div class="secret-card">
                <div class="secret-header">
                    <div class="secret-avatar" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)}">
                        ${firstLetter}
                    </div>
                    <div class="secret-user">${userName}</div>
                    <div class="secret-timestamp">${timestamp}</div>
                </div>
                <div class="secret-content">
                    <p>${escapeHtml(secret.content)}</p>
                </div>
                ${isUserSecret ? `
                <div class="secret-actions">
                    <button class="action-btn delete-secret" data-secret-id="${secretId}">
                        <span>🗑️</span> Delete
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // Delete a secret
    async function deleteSecret(secretId) {
        if (!confirm('Are you sure you want to delete this secret?')) {
            return;
        }
        
        try {
            await deleteDoc(doc(db, 'secrets', secretId));
            showToast('Secret deleted successfully!', 'success');
            // Reload user secrets
            if (state.currentUser) {
                loadUserSecrets(state.currentUser.uid);
            }
        } catch (error) {
            console.error('Error deleting secret:', error);
            showToast('Failed to delete secret. Please try again.', 'error');
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}