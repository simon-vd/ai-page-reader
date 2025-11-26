// Background script - Handle API calls and messaging

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'apiCall') {
        // Handle API calls here if needed
        // Currently, API calls are made directly from popup
        // This can be used for future enhancements
    }
    return true;
});

// Handle extension installation
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open settings page on first install
        browser.runtime.openOptionsPage();
    }
});

// Log any errors
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'error') {
        console.error('Extension error:', message.error);
    }
});
