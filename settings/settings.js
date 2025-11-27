// Settings page logic

// Initialize services
const geminiService = new GeminiService();

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    await loadApiKey();
    await loadSpeechSettings();
    await initializeVoices();
    setupEventListeners();
});

// Load API key
async function loadApiKey() {
    const apiKey = await StorageUtil.getApiKey();
    if (apiKey) {
        document.getElementById('apiKeyInput').value = apiKey;
    }
}

// Load speech settings
async function loadSpeechSettings() {
    const settings = await StorageUtil.getSettings();

    document.getElementById('defaultSpeed').value = settings.speechRate || 1.0;
    document.getElementById('speedValue').textContent = (settings.speechRate || 1.0).toFixed(1);

    document.getElementById('defaultPitch').value = settings.speechPitch || 1.0;
    document.getElementById('pitchValue').textContent = (settings.speechPitch || 1.0).toFixed(1);

    document.getElementById('defaultVolume').value = settings.speechVolume || 1.0;
    document.getElementById('volumeValue').textContent = Math.round((settings.speechVolume || 1.0) * 100);
}

// Initialize voice selection
async function initializeVoices() {
    // Create temporary TTS service to get voices
    const tempSynth = window.speechSynthesis;

    // Wait for voices to load
    const getVoices = () => {
        return new Promise((resolve) => {
            const voices = tempSynth.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                tempSynth.onvoiceschanged = () => {
                    resolve(tempSynth.getVoices());
                };
            }
        });
    };

    const voices = await getVoices();
    const voiceSelect = document.getElementById('defaultVoice');

    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    // Load saved voice
    const settings = await StorageUtil.getSettings();
    if (settings.voiceURI) {
        voiceSelect.value = settings.voiceURI;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Toggle API key visibility
    document.getElementById('toggleKeyBtn').addEventListener('click', () => {
        const input = document.getElementById('apiKeyInput');
        const btn = document.getElementById('toggleKeyBtn');

        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = 'Hide';
        } else {
            input.type = 'password';
            btn.textContent = 'Show';
        }
    });

    // Test API key
    document.getElementById('testKeyBtn').addEventListener('click', handleTestKey);

    // Save API key
    document.getElementById('saveKeyBtn').addEventListener('click', handleSaveKey);

    // Save speech settings
    document.getElementById('saveSpeechBtn').addEventListener('click', handleSaveSpeech);

    // Clear data
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);

    // Update range values in real-time
    document.getElementById('defaultSpeed').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = parseFloat(e.target.value).toFixed(1);
    });

    document.getElementById('defaultPitch').addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = parseFloat(e.target.value).toFixed(1);
    });

    document.getElementById('defaultVolume').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = Math.round(parseFloat(e.target.value) * 100);
    });
}

// Handle test API key
async function handleTestKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const btn = document.getElementById('testKeyBtn');

    if (!apiKey) {
        showStatus('keyStatus', 'Please enter an API key', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Testing... <span class="loading-spinner"></span>';

    try {
        await geminiService.validateApiKey(apiKey);
        showStatus('keyStatus', 'API key is valid!', 'success');
    } catch (error) {
        console.error('Error testing API key:', error);
        showStatus('keyStatus', `Invalid: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Test Connection';
    }
}

// Handle save API key
async function handleSaveKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();

    if (!apiKey) {
        showStatus('keyStatus', 'Please enter an API key', 'error');
        return;
    }

    try {
        await StorageUtil.setApiKey(apiKey);
        showStatus('keyStatus', 'API key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving API key:', error);
        showStatus('keyStatus', `Error saving: ${error.message}`, 'error');
    }
}

// Handle save speech settings
async function handleSaveSpeech() {
    try {
        const settings = {
            voiceURI: document.getElementById('defaultVoice').value,
            speechRate: parseFloat(document.getElementById('defaultSpeed').value),
            speechPitch: parseFloat(document.getElementById('defaultPitch').value),
            speechVolume: parseFloat(document.getElementById('defaultVolume').value)
        };

        await StorageUtil.saveSettings(settings);
        showStatus('speechStatus', 'Speech settings saved!', 'success');
    } catch (error) {
        console.error('Error saving speech settings:', error);
        showStatus('speechStatus', `Error: ${error.message}`, 'error');
    }
}

// Handle clear data
async function handleClearData() {
    if (!confirm('Are you sure you want to clear all data? This will remove your API key, settings, and conversation history.')) {
        return;
    }

    try {
        await StorageUtil.clearAll();

        // Reset form
        document.getElementById('apiKeyInput').value = '';
        document.getElementById('defaultSpeed').value = 1.0;
        document.getElementById('speedValue').textContent = '1.0';
        document.getElementById('defaultPitch').value = 1.0;
        document.getElementById('pitchValue').textContent = '1.0';
        document.getElementById('defaultVolume').value = 1.0;
        document.getElementById('volumeValue').textContent = '100';

        alert('All data cleared successfully!');
    } catch (error) {
        console.error('Error clearing data:', error);
        alert(`Error: ${error.message}`);
    }
}

// Show status message
function showStatus(elementId, message, type) {
    const statusEl = document.getElementById(elementId);
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}
