// Popup script - Main UI logic

// Initialize services
const geminiService = new GeminiService();

let currentTabId = null;
let conversationHistory = [];
let isReading = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    currentTabId = tabs[0].id;

    // Load conversation history
    conversationHistory = await StorageUtil.getConversationHistory(currentTabId);
    displayConversationHistory();

    // Initialize voice selection
    await initializeVoices();

    // Load settings
    await loadSettings();

    // Setup TTS callbacks
    setupTTSCallbacks();

    // Setup event listeners
    setupEventListeners();

    // Check API key
    await checkApiKey();
});

// Initialize voice selection
async function initializeVoices() {
    const voices = await ttsService.waitForVoices();
    const voiceSelect = document.getElementById('voiceSelect');

    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    // Load saved voice preference
    const savedVoiceURI = await StorageUtil.getSetting('voiceURI');
    if (savedVoiceURI) {
        const savedIndex = voices.findIndex(v => v.voiceURI === savedVoiceURI);
        if (savedIndex !== -1) {
            voiceSelect.value = savedIndex;
        }
    }
}

// Load settings
async function loadSettings() {
    const settings = await StorageUtil.getSettings();

    const speedRange = document.getElementById('speedRange');
    speedRange.value = settings.speechRate || 1.0;
    document.getElementById('speedValue').textContent = speedRange.value;
}

// Setup TTS callbacks
function setupTTSCallbacks() {
    ttsService.onStart(() => {
        updateStatus('Reading...', 'reading');
        enablePlaybackControls(true);
    });

    ttsService.onProgress((progress) => {
        updateProgress(progress);
    });

    ttsService.onEnd(() => {
        updateStatus('Finished reading', 'success');
        enablePlaybackControls(false);
        hideProgress();
        isReading = false;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Read page button
    document.getElementById('readPageBtn').addEventListener('click', handleReadPage);

    // Playback controls
    document.getElementById('pauseBtn').addEventListener('click', () => {
        ttsService.pause();
        updateStatus('Paused', 'warning');
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
        ttsService.resume();
        updateStatus('Reading...', 'reading');
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
        ttsService.stop();
        updateStatus('Stopped', 'error');
        enablePlaybackControls(false);
        hideProgress();
        isReading = false;
    });

    // Summarize button
    document.getElementById('summarizeBtn').addEventListener('click', handleSummarize);

    // Chat
    document.getElementById('sendBtn').addEventListener('click', handleSendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        browser.runtime.openOptionsPage();
    });

    // Voice selection
    document.getElementById('voiceSelect').addEventListener('change', async (e) => {
        const voices = ttsService.getVoices();
        const selectedVoice = voices[e.target.value];
        if (selectedVoice) {
            await StorageUtil.updateSetting('voiceURI', selectedVoice.voiceURI);
        }
    });

    // Speech rate
    document.getElementById('speedRange').addEventListener('input', async (e) => {
        const rate = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = rate.toFixed(1);
        await StorageUtil.updateSetting('speechRate', rate);
    });
}

// Check if content script is available
async function ensureContentScript() {
    try {
        const response = await browser.tabs.sendMessage(currentTabId, {
            action: 'getPageContent'
        });
        return { success: true, response };
    } catch (error) {
        // Check if it's a special page where content scripts can't run
        const tab = await browser.tabs.get(currentTabId);
        const url = tab.url || '';

        if (url.startsWith('about:') || url.startsWith('chrome:') ||
            url.startsWith('moz-extension:') || url.startsWith('file:')) {
            throw new Error('Cannot run on this type of page. Please navigate to a regular webpage.');
        }

        // Content script might not be loaded yet
        throw new Error('Content script not loaded. Try refreshing the page or clicking on a different tab.');
    }
}

// Handle read page
async function handleReadPage() {
    try {
        updateStatus('Getting page content...', 'loading');

        const { response } = await ensureContentScript();

        if (!response || !response.content) {
            throw new Error('Could not extract page content');
        }

        const { content } = response;

        // Read the page content
        updateStatus('Reading page...', 'reading');
        const settings = await StorageUtil.getSettings();
        const voices = ttsService.getVoices();
        const voiceIndex = document.getElementById('voiceSelect').value;
        const selectedVoice = voices[voiceIndex];

        showProgress();
        isReading = true;
        await ttsService.speak(content, {
            voice: selectedVoice,
            settings
        });

    } catch (error) {
        console.error('Error reading page:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        isReading = false;
    }
}

// Handle summarize
async function handleSummarize() {
    try {
        updateStatus('Generating summary...', 'loading');

        // Check API key
        const apiKey = await StorageUtil.getApiKey();
        if (!apiKey) {
            throw new Error('Please configure your Gemini API key in settings');
        }

        geminiService.setApiKey(apiKey);

        // Get page content
        const { response } = await ensureContentScript();

        if (!response || !response.content) {
            throw new Error('Could not extract page content');
        }

        const { content, title } = response;

        // Generate summary
        const summary = await geminiService.summarizePage(content, title);

        // Add to chat
        addMessageToChat('assistant', `Summary:\n\n${summary}`);

        // Read summary
        updateStatus('Reading summary...', 'reading');
        const settings = await StorageUtil.getSettings();
        const voices = ttsService.getVoices();
        const voiceIndex = document.getElementById('voiceSelect').value;
        const selectedVoice = voices[voiceIndex];

        showProgress();
        await ttsService.speak(summary, {
            voice: selectedVoice,
            settings
        });

    } catch (error) {
        console.error('Error generating summary:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

// Handle send message
async function handleSendMessage() {
    const input = document.getElementById('chatInput');
    const question = input.value.trim();

    if (!question) return;

    try {
        // Add user message
        addMessageToChat('user', question);
        input.value = '';

        updateStatus('Thinking...', 'loading');

        // Check API key
        const apiKey = await StorageUtil.getApiKey();
        if (!apiKey) {
            throw new Error('Please configure your Gemini API key in settings');
        }

        geminiService.setApiKey(apiKey);

        // Get page content
        const { response } = await ensureContentScript();

        if (!response || !response.content) {
            throw new Error('Could not extract page content');
        }

        const { content, title } = response;

        // Get answer
        const answer = await geminiService.answerQuestion(
            question,
            content,
            title,
            conversationHistory
        );

        // Add to chat
        addMessageToChat('assistant', answer);

        // Save conversation
        conversationHistory.push(
            { role: 'user', content: question },
            { role: 'assistant', content: answer }
        );
        await StorageUtil.saveConversationHistory(currentTabId, conversationHistory);

        updateStatus('Ready', 'success');

    } catch (error) {
        console.error('Error answering question:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        addMessageToChat('assistant', `Sorry, I encountered an error: ${error.message}`);
    }
}

// Add message to chat
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');

    // Remove welcome message if present
    const welcome = chatMessages.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Display conversation history
function displayConversationHistory() {
    const chatMessages = document.getElementById('chatMessages');

    if (conversationHistory.length > 0) {
        // Clear welcome message
        chatMessages.innerHTML = '';

        conversationHistory.forEach(msg => {
            addMessageToChat(msg.role, msg.content);
        });
    }
}

// Update status
function updateStatus(text, type = '') {
    const statusBar = document.getElementById('statusBar');
    const statusText = document.getElementById('statusText');

    statusText.textContent = text;
    statusBar.className = 'status-bar';

    if (type) {
        statusBar.classList.add(type);
    }
}

// Enable/disable playback controls
function enablePlaybackControls(enabled) {
    document.getElementById('pauseBtn').disabled = !enabled;
    document.getElementById('resumeBtn').disabled = !enabled;
    document.getElementById('stopBtn').disabled = !enabled;
    document.getElementById('readPageBtn').disabled = enabled;
}

// Show/hide progress
function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    updateProgress(0);
}

function hideProgress() {
    document.getElementById('progressSection').style.display = 'none';
}

// Update progress
function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
}

// Check API key
async function checkApiKey() {
    const apiKey = await StorageUtil.getApiKey();
    if (!apiKey) {
        updateStatus('API key not configured', 'warning');
    }
}
