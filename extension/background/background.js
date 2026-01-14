// Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('JobFill extension installed');
});

// Handle any background tasks if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Currently all logic is handled in popup and content scripts
    // This service worker is here for future extensibility

    if (message.action === 'ping') {
        sendResponse({ status: 'ok' });
    }

    return true;
});
