// Markdown preview script with AI Q&A

let markdownContent = '';
let filename = 'page.md';
let geminiService;

// Get markdown content from browser.storage
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Gemini service
    geminiService = new GeminiService();

    // Load API key
    const apiKey = await StorageUtil.getApiKey();
    if (apiKey) {
        geminiService.setApiKey(apiKey);
    }

    // Try to get content from browser.storage
    const result = await browser.storage.local.get('markdownPreview');

    if (result.markdownPreview) {
        const data = result.markdownPreview;
        markdownContent = data.content;
        filename = data.filename;

        displayMarkdown(markdownContent);
        updateStats(markdownContent);

        // Clear storage
        await browser.storage.local.remove('markdownPreview');
    } else {
        document.getElementById('rawPreview').textContent = 'No markdown content available.';
        document.getElementById('renderedPreview').textContent = 'No markdown content available.';
    }

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadMarkdown);

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Chat functionality
    document.getElementById('sendChatBtn').addEventListener('click', handleSendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

// Switch between tabs
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    const views = document.querySelectorAll('.preview-view');
    views.forEach(view => {
        view.classList.remove('active');
    });

    if (tabName === 'raw') {
        document.getElementById('rawView').classList.add('active');
    } else if (tabName === 'rendered') {
        document.getElementById('renderedView').classList.add('active');
    }
}

// Display markdown content
function displayMarkdown(content) {
    // Display raw markdown
    document.getElementById('rawPreview').textContent = content;

    // Render markdown to HTML
    try {
        const html = marked.parse(content);
        document.getElementById('renderedPreview').innerHTML = html;
    } catch (error) {
        console.error('Error rendering markdown:', error);
        document.getElementById('renderedPreview').textContent = 'Error rendering markdown preview.';
    }
}

// Update statistics
function updateStats(content) {
    const charCount = content.length;
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = content.split('\n').length;

    document.getElementById('charCount').textContent = charCount.toLocaleString();
    document.getElementById('wordCount').textContent = wordCount.toLocaleString();
    document.getElementById('lineCount').textContent = lineCount.toLocaleString();
}

// Copy to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(markdownContent);

        const successMsg = document.getElementById('successMessage');
        successMsg.classList.add('show');

        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy to clipboard');
    }
}

// Download markdown file
function downloadMarkdown() {
    try {
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        const successMsg = document.getElementById('successMessage');
        successMsg.querySelector('p').textContent = 'Download started!';
        successMsg.classList.add('show');

        setTimeout(() => {
            successMsg.classList.remove('show');
            successMsg.querySelector('p').textContent = 'Copied to clipboard!';
        }, 3000);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download file: ' + error.message);
    }
}

// Handle chat message sending - Q&A only
async function handleSendMessage() {
    const input = document.getElementById('chatInput');
    const question = input.value.trim();
    const sendBtn = document.getElementById('sendChatBtn');

    if (!question) return;

    // Check API key
    const apiKey = await StorageUtil.getApiKey();
    if (!apiKey) {
        addMessageToChat('assistant', 'Please configure your Gemini API key in settings first.');
        return;
    }

    // Add user message
    addMessageToChat('user', question);
    input.value = '';

    // Disable send button
    sendBtn.disabled = true;

    try {
        // Create prompt for AI - Q&A only
        const prompt = `You are helping a user understand a markdown document. Respond in SHORT, simple sentences using plain text only. DO NOT use markdown formatting - no asterisks, no backticks, no headers, no bullet points. Just normal text.

Here is the markdown:

${markdownContent}

User question: ${question}

Provide a brief, helpful answer based on the content. Keep it short.`;

        // Send to Gemini
        const response = await geminiService.chat(prompt);

        // Add response to chat
        addMessageToChat('assistant', response);

    } catch (error) {
        console.error('Error sending message:', error);
        addMessageToChat('assistant', `Error: ${error.message}`);
    } finally {
        sendBtn.disabled = false;
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
