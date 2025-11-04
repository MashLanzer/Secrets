// Import Firebase functions
import { 
    collection, 
    addDoc, 
    getDocs,
    orderBy,
    limit,
    query,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function setupSocial(auth, db, state, elements, switchView, showToast) {
    // DOM Elements
    const createSecretBtn = document.getElementById('create-secret-btn');
    const secretModal = document.getElementById('secret-modal');
    const secretForm = document.getElementById('secret-form');
    const closeModalButtons = document.querySelectorAll('.close, .modal-cancel');
    const secretsContainer = document.getElementById('secrets-container');
    
    // Event Listeners
    createSecretBtn.addEventListener('click', () => {
        if (!state.currentUser) {
            switchView('auth');
            return;
        }
        secretModal.classList.remove('hidden');
    });
    
    // Close modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            secretModal.classList.add('hidden');
            secretForm.reset();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === secretModal) {
            secretModal.classList.add('hidden');
            secretForm.reset();
        }
    });
    
    // Handle secret form submission
    secretForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!state.currentUser) {
            showToast('You must be logged in to share a secret.', 'error');
            return;
        }
        
        const content = document.getElementById('secret-content').value.trim();
        
        if (!content) {
            showToast('Please enter your secret.', 'error');
            return;
        }
        
        try {
            await addDoc(collection(db, 'secrets'), {
                content: content,
                userId: state.currentUser.uid,
                userName: state.currentUser.displayName || 'Anonymous',
                timestamp: new Date()
            });
            
            showToast('Secret shared successfully!', 'success');
            secretModal.classList.add('hidden');
            secretForm.reset();
            
            // Reload secrets
            loadSecrets();
        } catch (error) {
            console.error('Error sharing secret:', error);
            showToast('Failed to share secret. Please try again.', 'error');
        }
    });
    
    // Load secrets
    async function loadSecrets() {
        try {
            secretsContainer.innerHTML = '<p>Loading secrets...</p>';
            
            const secretsQuery = query(
                collection(db, 'secrets'),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            
            const querySnapshot = await getDocs(secretsQuery);
            
            if (querySnapshot.empty) {
                secretsContainer.innerHTML = `
                    <div class="secret-placeholder">
                        <p>No secrets yet. Be the first to share!</p>
                    </div>
                `;
                return;
            }
            
            let secretsHTML = '';
            querySnapshot.forEach((doc) => {
                const secret = doc.data();
                secretsHTML += createSecretCard(secret, doc.id);
            });
            
            secretsContainer.innerHTML = secretsHTML;
        } catch (error) {
            console.error('Error loading secrets:', error);
            secretsContainer.innerHTML = '<p>Failed to load secrets. Please try again later.</p>';
        }
    }
    
    // Create secret card HTML
    function createSecretCard(secret, secretId) {
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
            </div>
        `;
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
    
    // Load secrets when the feed section is shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!elements.feedSection.classList.contains('hidden')) {
                    loadSecrets();
                }
            }
        });
    });
    
    observer.observe(elements.feedSection, { attributes: true });
    
    // Initial load if feed is visible
    if (!elements.feedSection.classList.contains('hidden')) {
        loadSecrets();
    }
}