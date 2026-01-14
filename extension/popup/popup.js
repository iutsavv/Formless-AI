// Formless Extension Popup Script
// Auto-scans page when opened, like Simplify Copilot

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
const skippedCount = document.getElementById('skippedCount');
const unknownCount = document.getElementById('unknownCount');
const scanResults = document.getElementById('scanResults');
const scanStatus = document.getElementById('scanStatus');
const scanSpinner = document.getElementById('scanSpinner');
const fieldCount = document.getElementById('fieldCount');

let currentTab = null;
let profileData = null;

// ============================================
// INITIALIZATION - Auto scan when popup opens
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Formless] Popup opened');

    const { token, email } = await chrome.storage.local.get(['token', 'email']);

    if (token && email) {
        showMainView(email);
        await loadProfile(token);
        await scanCurrentPage();
    } else {
        showLoginView();
    }
});

// ============================================
// AUTH FUNCTIONS
// ============================================

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

        await chrome.storage.local.set({
            token: data.token,
            email: data.user.email
        });

        showMainView(data.user.email);
        await loadProfile(data.token);
        await scanCurrentPage();
    } catch (error) {
        showError(error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }
});

logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'email']);
    showLoginView();
});

// ============================================
// PROFILE & SCAN FUNCTIONS
// ============================================

async function loadProfile(token) {
    try {
        const response = await fetch(`${API_BASE}/profile/fill`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
            profileData = await response.json();
            console.log('[Formless] Profile loaded:', Object.keys(profileData.fieldMappings || {}).length, 'field mappings');
        }
    } catch (error) {
        console.error('[Formless] Failed to load profile:', error);
    }
}

// Helper: Send message with timeout
function sendMessageWithTimeout(tabId, message, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout: Content script not responding'));
        }, timeoutMs);

        chrome.tabs.sendMessage(tabId, message, (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

async function scanCurrentPage() {
    scanStatus.textContent = 'Scanning page...';
    scanSpinner.style.display = 'block';
    fieldCount.textContent = '';
    fillBtn.disabled = true;
    captureBtn.disabled = true;

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;

        // Check if we can scan this page
        if (!tab.url ||
            tab.url.startsWith('chrome://') ||
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('edge://') ||
            tab.url.startsWith('file://')) {
            scanStatus.textContent = 'Cannot scan';
            scanSpinner.style.display = 'none';
            fieldCount.textContent = 'This page type cannot be scanned';
            return;
        }

        // Try multiple times with increasing delays
        let response = null;
        let lastError = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[Formless] Scan attempt ${attempt}...`);
                response = await sendMessageWithTimeout(tab.id, { action: 'scanPage' }, 3000);
                if (response && response.success) break;
            } catch (e) {
                lastError = e;
                console.log(`[Formless] Attempt ${attempt} failed:`, e.message);

                // On first failure, try to inject the script
                if (attempt === 1) {
                    try {
                        console.log('[Formless] Injecting content script...');
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content/content.js']
                        });
                        await chrome.scripting.insertCSS({
                            target: { tabId: tab.id },
                            files: ['content/widget.css']
                        });
                    } catch (injectErr) {
                        // Script might already be injected, that's okay
                        console.log('[Formless] Injection note:', injectErr.message);
                    }
                }

                // Wait before retrying (progressive delay)
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
        }

        if (response && response.success) {
            scanStatus.textContent = 'Ready!';
            scanSpinner.style.display = 'none';
            fieldCount.innerHTML = `<strong>${response.fieldCount}</strong> form fields found`;

            if (response.fieldCount > 0) {
                fillBtn.disabled = false;
                captureBtn.disabled = false;
            } else {
                fieldCount.textContent = 'No form fields on this page';
            }
        } else {
            // Show helpful message
            scanStatus.textContent = 'Not ready';
            scanSpinner.style.display = 'none';
            fieldCount.innerHTML = 'Click <a href="#" id="refreshLink">here to refresh</a> the page';

            setTimeout(() => {
                const link = document.getElementById('refreshLink');
                if (link) {
                    link.onclick = (e) => {
                        e.preventDefault();
                        chrome.tabs.reload(tab.id);
                        window.close();
                    };
                }
            }, 100);
        }
    } catch (error) {
        console.error('[Formless] Scan error:', error);
        scanStatus.textContent = 'Error';
        scanSpinner.style.display = 'none';
        fieldCount.textContent = error.message || 'Could not access this page';
    }
}


// ============================================
// FILL FORM
// ============================================

fillBtn.addEventListener('click', async () => {
    if (!currentTab || !profileData) {
        showStatus('No profile data loaded', 'error');
        return;
    }

    fillBtn.disabled = true;
    fillBtn.innerHTML = '<span class="loading"></span> Filling...';
    hideStatus();

    try {
        const { token } = await chrome.storage.local.get(['token']);

        // Get domain for unknown fields
        const url = new URL(currentTab.url);
        const domain = url.hostname;

        // Get unknown fields for this domain
        let domainMappings = {};
        try {
            const unknownResponse = await fetch(`${API_BASE}/unknown-fields/domain/${encodeURIComponent(domain)}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (unknownResponse.ok) {
                const unknownData = await unknownResponse.json();
                domainMappings = unknownData.fieldMappings || {};
            }
        } catch (e) {
            console.log('[Formless] No domain-specific fields');
        }

        // Merge all mappings
        const allData = {
            profile: profileData.profile || {},
            fieldMappings: { ...profileData.fieldMappings, ...domainMappings }
        };

        // Send to content script
        const response = await chrome.tabs.sendMessage(currentTab.id, {
            action: 'fillForm',
            data: allData,
        });

        if (response && response.success) {
            showStatus(`Filled ${response.filled} field(s)!`, 'success');
            filledCount.textContent = response.filled;
            skippedCount.textContent = response.skipped || 0;
            unknownCount.textContent = response.unknown;
            stats.style.display = 'flex';

            // Save unknown fields
            if (response.unknownFields && response.unknownFields.length > 0) {
                await saveUnknownFields(token, response.unknownFields);
            }
        } else {
            showStatus('No fields were filled', 'warning');
        }
    } catch (error) {
        console.error('[Formless] Fill error:', error);
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

// ============================================
// CAPTURE UNKNOWN FIELDS
// ============================================

captureBtn.addEventListener('click', async () => {
    if (!currentTab) return;

    captureBtn.disabled = true;
    captureBtn.innerHTML = '<span class="loading"></span> Capturing...';
    hideStatus();

    try {
        const response = await chrome.tabs.sendMessage(currentTab.id, {
            action: 'captureFields',
        });

        if (response && response.fields && response.fields.length > 0) {
            const { token } = await chrome.storage.local.get(['token']);
            await saveUnknownFields(token, response.fields);
            showStatus(`Captured ${response.fields.length} field(s)`, 'success');
        } else {
            showStatus('No new fields found on this page', 'warning');
        }
    } catch (error) {
        console.error('[Formless] Capture error:', error);
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

async function saveUnknownFields(token, fields) {
    try {
        const response = await fetch(`${API_BASE}/unknown-fields`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(fields),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('[Formless] Saved', data.created.length, 'unknown fields');
        }
    } catch (e) {
        console.error('[Formless] Failed to save unknown fields:', e);
    }
}

// ============================================
// UI HELPERS
// ============================================

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
