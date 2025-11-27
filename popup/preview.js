// Markdown preview script

let markdownContent = '';
let filename = 'page.md';

// Get markdown content from URL parameters or browser.storage
document.addEventListener('DOMContentLoaded', async () => {
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
        document.getElementById('previewArea').textContent = 'No markdown content available.';
    }

    // Setup event listeners
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadMarkdown);
});

// Display markdown content
function displayMarkdown(content) {
    document.getElementById('previewArea').textContent = content;
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

        // Show success message
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
        // Create blob and download
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        // Show success message
        const successMsg = document.getElementById('successMessage');
        successMsg.querySelector('p').textContent = '✓ Download started!';
        successMsg.classList.add('show');

        setTimeout(() => {
            successMsg.classList.remove('show');
            successMsg.querySelector('p').textContent = '✓ Copied to clipboard!';
        }, 3000);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download file: ' + error.message);
    }
}
