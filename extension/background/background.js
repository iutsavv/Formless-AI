// Background Service Worker
// Handles extension icon click AND proxies API calls for content scripts

console.log('[Formless] Background service worker loaded');

const API_BASE = 'http://localhost:3001/api';

// ============================================
// EXTENSION ICON CLICK HANDLER
// ============================================

chrome.action.onClicked.addListener(async (tab) => {
    console.log('[Formless] Extension icon clicked on tab:', tab.id);

    if (!tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:')) {
        console.log('[Formless] Cannot run on this page type');
        return;
    }

    try {
        // First try to message existing content script
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
            console.log('[Formless] Panel toggle message sent');
            return;
        } catch (e) {
            console.log('[Formless] Content script not found, injecting...');
        }

        // Inject content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
        });

        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content/widget.css']
        });

        await new Promise(resolve => setTimeout(resolve, 300));

        await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
        console.log('[Formless] Panel injected and toggled');

    } catch (error) {
        console.error('[Formless] Failed to inject panel:', error);
    }
});

// ============================================
// API PROXY FOR CONTENT SCRIPTS
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
        sendResponse({ status: 'ok' });
        return true;
    }

    // Handle API requests from content scripts
    if (message.action === 'apiRequest') {
        handleApiRequest(message)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    return true;
});

/**
 * Handle API requests from content scripts
 */
async function handleApiRequest(message) {
    const { endpoint, method = 'GET', body, token } = message;

    console.log('[Formless] API Request:', method, endpoint);

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                error: data.error || 'Request failed',
                data
            };
        }

        return {
            success: true,
            status: response.status,
            data
        };
    } catch (error) {
        console.error('[Formless] API Error:', error);
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

// ============================================
// INSTALLATION HANDLER
// ============================================

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Formless] Extension installed');
});
