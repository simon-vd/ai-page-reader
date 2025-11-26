// Content script - Extract page content and handle highlighting

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        const content = extractPageContent();
        const title = document.title;
        sendResponse({ content, title });
    }
    return true;
});

// Extract readable content from the page
function extractPageContent() {
    // Try to find main content area
    const contentSelectors = [
        'article',
        '[role="main"]',
        'main',
        '.post-content',
        '.article-content',
        '.entry-content',
        '#content',
        '.content'
    ];

    let mainContent = null;

    // Try each selector
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            mainContent = element;
            break;
        }
    }

    // Fall back to body if no main content found
    if (!mainContent) {
        mainContent = document.body;
    }

    // Clone the element to avoid modifying the page
    const clone = mainContent.cloneNode(true);

    // Remove unwanted elements
    const unwantedSelectors = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        '.advertisement',
        '.ads',
        '.sidebar',
        '.comments',
        '.social-share',
        '[role="banner"]',
        '[role="navigation"]',
        '[role="complementary"]'
    ];

    unwantedSelectors.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });

    // Extract text content
    let text = clone.textContent || clone.innerText;

    // Clean up the text
    text = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

    return text;
}

// Highlight text as it's being read (future enhancement)
function highlightText(text, start, end) {
    // This would use the DOM to highlight the currently spoken text
    // Implementation can be added for better UX
}

// Remove highlighting
function removeHighlight() {
    // Remove any existing highlights
}
