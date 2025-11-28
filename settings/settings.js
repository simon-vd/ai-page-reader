// Settings script

// Initialize settings
document.addEventListener('DOMContentLoaded', async () => {
    await loadApiKey();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // API Key visibility toggle
    const toggleBtn = document.getElementById('toggleKeyBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');

    toggleBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    });

    // Save API Key
    document.getElementById('saveKeyBtn').addEventListener('click', handleSaveApiKey);

    // Test API Key
    document.getElementById('testKeyBtn').addEventListener('click', handleTestApiKey);

    // Clear Data
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);
}

// Load API Key
async function loadApiKey() {
    const apiKey = await StorageUtil.getApiKey();
    if (apiKey) {
        document.getElementById('apiKeyInput').value = apiKey;
    }
}

// Handle save API key
async function handleSaveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const statusDiv = document.getElementById('keyStatus');

    if (!apiKey) {
        showStatus('keyStatus', 'Please enter an API key', 'error');
        return;
    }

    try {
        await StorageUtil.saveApiKey(apiKey);
        showStatus('keyStatus', 'API Key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving API key:', error);
        showStatus('keyStatus', 'Error saving API key', 'error');
    }
}

// Handle test API key
async function handleTestApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();

    if (!apiKey) {
        showStatus('keyStatus', 'Please enter an API key first', 'error');
        return;
    }

    showStatus('keyStatus', 'Testing connection...', 'loading');

    try {
        const geminiService = new GeminiService();
        geminiService.setApiKey(apiKey);

        const success = await geminiService.testConnection();

        if (success) {
            showStatus('keyStatus', 'Connection successful!', 'success');
        } else {
            showStatus('keyStatus', 'Connection failed. Please check your key.', 'error');
        }
    } catch (error) {
        console.error('Error testing API key:', error);
        showStatus('keyStatus', `Error: ${error.message}`, 'error');
    }
}

// Handle clear data
async function handleClearData() {
    if (confirm('Are you sure you want to clear all data? This includes your API key and conversation history.')) {
        try {
            await StorageUtil.clearAll();
            document.getElementById('apiKeyInput').value = '';
            alert('All data cleared successfully.');
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Error clearing data');
        }
    }
}

// Show status message
function showStatus(elementId, message, type) {
    const statusDiv = document.getElementById(elementId);
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}
