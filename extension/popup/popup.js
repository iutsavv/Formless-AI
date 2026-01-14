// Extension Popup Script
const API_BASE = 'http://localhost:3001/api';

// DOM Elements
const loginView = document.getElementById('loginView');
const mainView = document.getElementById('mainView');
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const userEmail = document.getElementById('userEmail');
const fillBtn = document.getElementById('fillBtn');
const captureBtn = document.getElementById('captureBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusMessage = document.getElementById('statusMessage');
const stats = document.getElementById('stats');
const filledCount = document.getElementById('filledCount');
const unknownCount = document.getElementById('unknownCount');

// Check auth state on popup open
document.addEventListener('DOMContentLoaded', async () => {
    const { token, email } = await chrome.storage.local.get(['token', 'email']);

    if (token && email) {
        showMainView(email);
    } else {
        showLoginView();
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span> Signing in...';

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Save token
        await chrome.storage.local.set({
            token: data.token,
            email: data.user.email
        });

        showMainView(data.user.email);
    } catch (error) {
        showError(error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }
});

// Fill page
fillBtn.addEventListener('click', async () => {
    fillBtn.disabled = true;
    fillBtn.innerHTML = '<span class="loading"></span> Filling...';
    hideStatus();

    try {
        const { token } = await chrome.storage.local.get(['token']);

        // Get profile data
        const profileResponse = await fetch(`${API_BASE}/profile/fill`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
        }

        const { fieldMappings } = await profileResponse.json();

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Get domain for unknown fields
        const url = new URL(tab.url);
        const domain = url.hostname;

        // Get unknown fields for this domain
        const unknownResponse = await fetch(`${API_BASE}/unknown-fields/domain/${encodeURIComponent(domain)}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        let unknownFieldMappings = {};
        if (unknownResponse.ok) {
            const unknownData = await unknownResponse.json();
            unknownFieldMappings = unknownData.fieldMappings || {};
        }

        // Merge mappings
        const allMappings = { ...fieldMappings, ...unknownFieldMappings };

        // Send to content script
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'fillForm',
            data: allMappings,
        });

        if (response && response.success) {
            showStatus(`Filled ${response.filled} field(s)`, 'success');
            filledCount.textContent = response.filled;
            unknownCount.textContent = response.unknown;
            stats.style.display = 'flex';
        } else {
            showStatus('No fillable fields found', 'warning');
        }
    } catch (error) {
        console.error('Fill error:', error);
        showStatus(error.message || 'Failed to fill form', 'error');
    } finally {
        fillBtn.disabled = false;
        fillBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Fill This Page
    `;
    }
});

// Capture unknown fields
captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    captureBtn.innerHTML = '<span class="loading"></span> Capturing...';
    hideStatus();

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Send message to content script to capture fields
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'captureFields',
        });

        if (response && response.fields && response.fields.length > 0) {
            // Save to backend
            const { token } = await chrome.storage.local.get(['token']);

            const saveResponse = await fetch(`${API_BASE}/unknown-fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(response.fields),
            });

            if (saveResponse.ok) {
                const data = await saveResponse.json();
                showStatus(`Captured ${data.created.length} new field(s)`, 'success');
            } else {
                throw new Error('Failed to save fields');
            }
        } else {
            showStatus('No new fields found on this page', 'warning');
        }
    } catch (error) {
        console.error('Capture error:', error);
        showStatus(error.message || 'Failed to capture fields', 'error');
    } finally {
        captureBtn.disabled = false;
        captureBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v8"></path>
        <path d="M8 12h8"></path>
      </svg>
      Capture Unknown Fields
    `;
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'email']);
    showLoginView();
});

// Helper functions
function showLoginView() {
    loginView.style.display = 'block';
    mainView.style.display = 'none';
    loginEmail.value = '';
    loginPassword.value = '';
    hideError();
}

function showMainView(email) {
    loginView.style.display = 'none';
    mainView.style.display = 'block';
    userEmail.textContent = email;
    hideStatus();
    stats.style.display = 'none';
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
}

function hideError() {
    loginError.textContent = '';
    loginError.classList.remove('show');
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

function hideStatus() {
    statusMessage.className = 'status-message';
}
