// Popup script - Main UI logic

// Initialize services
const geminiService = new GeminiService();
const markdownService = new MarkdownService();

let currentTabId = null;
let conversationHistory = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    currentTabId = tabs[0].id;

    // Load conversation history
    conversationHistory = await StorageUtil.getConversationHistory(currentTabId);
    displayConversationHistory();

    // Check API key
    await checkApiKey();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
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

    // Summarize button
    document.getElementById('summarizeBtn').addEventListener('click', handleSummarizePage);

    // Convert to Markdown button
    document.getElementById('convertMarkdownBtn').addEventListener('click', handleConvertToMarkdown);
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
        throw new Error('Please refresh the page to use the extension.');
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

// Check API key
async function checkApiKey() {
    const apiKey = await StorageUtil.getApiKey();
    if (!apiKey) {
        updateStatus('API key not configured', 'warning');
    } else {
        geminiService.setApiKey(apiKey);
    }
}

// Handle summarize page
async function handleSummarizePage() {
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

        // Add summary to chat
        addMessageToChat('assistant', summary);

        // Save to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: summary
        });
        await StorageUtil.saveConversationHistory(currentTabId, conversationHistory);

        updateStatus('Summary generated!', 'success');

    } catch (error) {
        console.error('Error summarizing page:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        addMessageToChat('assistant', `Sorry, I couldn't generate a summary: ${error.message}`);
    }
}


// Handle convert to markdown
async function handleConvertToMarkdown() {
    try {
        updateStatus('Converting to markdown...', 'loading');

        // Get page content with HTML structure
        const response = await browser.tabs.sendMessage(currentTabId, {
            action: 'convertToMarkdown'
        });

        if (!response || !response.htmlElement) {
            throw new Error('Could not extract page content');
        }

        const { htmlElement, title, url } = response;


        // Parse HTML safely using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlElement, 'text/html');
        const tempDiv = doc.body;

        // Convert to markdown
        const markdown = markdownService.convertToMarkdown(tempDiv);
        const cleanedMarkdown = markdownService.cleanupMarkdown(markdown);

        // Add page metadata at the top
        const fullMarkdown = `# ${title}\n\nSource: ${url}\n\n---\n\n${cleanedMarkdown}`;

        // Generate filename
        const filename = markdownService.generateFilename(title) + '.md';

        // Store in browser.storage for preview page
        await browser.storage.local.set({
            markdownPreview: {
                content: fullMarkdown,
                filename: filename
            }
        });

        // Open preview in new tab
        await browser.tabs.create({
            url: browser.runtime.getURL('popup/preview.html')
        });

        updateStatus('Preview opened in new tab!', 'success');

    } catch (error) {
        console.error('Error converting to markdown:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}
