// Markdown conversion service - Convert HTML to Markdown

class MarkdownService {
    constructor() {
        this.listDepth = 0;
    }

    /**
     * Convert HTML content to Markdown
     * @param {HTMLElement} element - The HTML element to convert
     * @returns {string} - Markdown formatted text
     */
    convertToMarkdown(element) {
        if (!element) return '';

        // Clone to avoid modifying the original
        const clone = element.cloneNode(true);

        // Remove unwanted elements first
        this.removeUnwantedElements(clone);

        // Convert to markdown
        return this.processNode(clone).trim();
    }

    /**
     * Remove unwanted elements like scripts, styles, nav, etc.
     */
    removeUnwantedElements(element) {
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
            const elements = element.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
    }

    /**
     * Process a DOM node and convert to markdown
     */
    processNode(node) {
        if (!node) return '';

        // Text node
        if (node.nodeType === Node.TEXT_NODE) {
            return this.cleanText(node.textContent);
        }

        // Element node
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            switch (tagName) {
                case 'h1':
                    return this.processHeading(node, 1);
                case 'h2':
                    return this.processHeading(node, 2);
                case 'h3':
                    return this.processHeading(node, 3);
                case 'h4':
                    return this.processHeading(node, 4);
                case 'h5':
                    return this.processHeading(node, 5);
                case 'h6':
                    return this.processHeading(node, 6);
                case 'p':
                    return this.processParagraph(node);
                case 'strong':
                case 'b':
                    return this.processBold(node);
                case 'em':
                case 'i':
                    return this.processItalic(node);
                case 'a':
                    return this.processLink(node);
                case 'img':
                    return this.processImage(node);
                case 'ul':
                    return this.processUnorderedList(node);
                case 'ol':
                    return this.processOrderedList(node);
                case 'li':
                    return this.processListItem(node);
                case 'code':
                    return this.processCode(node);
                case 'pre':
                    return this.processPreformatted(node);
                case 'blockquote':
                    return this.processBlockquote(node);
                case 'br':
                    return '  \n';
                case 'hr':
                    return '\n---\n\n';
                case 'div':
                case 'section':
                case 'article':
                case 'main':
                    return this.processChildren(node);
                default:
                    return this.processChildren(node);
            }
        }

        return '';
    }

    /**
     * Process heading elements
     */
    processHeading(node, level) {
        const content = this.processChildren(node);
        const prefix = '#'.repeat(level);
        return `\n\n${prefix} ${content}\n\n`;
    }

    /**
     * Process paragraph elements
     */
    processParagraph(node) {
        const content = this.processChildren(node);
        return content ? `\n\n${content}\n\n` : '';
    }

    /**
     * Process bold elements
     */
    processBold(node) {
        const content = this.processChildren(node);
        return `**${content}**`;
    }

    /**
     * Process italic elements
     */
    processItalic(node) {
        const content = this.processChildren(node);
        return `*${content}*`;
    }

    /**
     * Process link elements
     */
    processLink(node) {
        const text = this.processChildren(node);
        const href = node.getAttribute('href') || '';

        // Handle relative URLs
        let url = href;
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            try {
                url = new URL(href, window.location.href).href;
            } catch (e) {
                url = href;
            }
        }

        return `[${text}](${url})`;
    }

    /**
     * Process image elements
     */
    processImage(node) {
        const alt = node.getAttribute('alt') || 'image';
        const src = node.getAttribute('src') || '';

        // Handle relative URLs
        let url = src;
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            try {
                url = new URL(src, window.location.href).href;
            } catch (e) {
                url = src;
            }
        }

        return `\n\n![${alt}](${url})\n\n`;
    }

    /**
     * Process unordered list elements
     */
    processUnorderedList(node) {
        this.listDepth++;
        const content = this.processChildren(node);
        this.listDepth--;
        return `\n${content}\n`;
    }

    /**
     * Process ordered list elements
     */
    processOrderedList(node) {
        this.listDepth++;
        let counter = 1;
        let result = '\n';

        for (const child of node.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'li') {
                const indent = '  '.repeat(this.listDepth - 1);
                const content = this.processChildren(child);
                result += `${indent}${counter}. ${content}\n`;
                counter++;
            }
        }

        this.listDepth--;
        return result + '\n';
    }

    /**
     * Process list item elements
     */
    processListItem(node) {
        const indent = '  '.repeat(Math.max(0, this.listDepth - 1));
        const content = this.processChildren(node);

        // Check if parent is ordered or unordered
        const parent = node.parentElement;
        if (parent && parent.tagName.toLowerCase() === 'ul') {
            return `${indent}- ${content}\n`;
        }

        // For ordered lists, return just content (handled by processOrderedList)
        return content;
    }

    /**
     * Process inline code elements
     */
    processCode(node) {
        const content = node.textContent || '';

        // Check if it's inside a <pre> tag
        if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') {
            return content;
        }

        return `\`${content}\``;
    }

    /**
     * Process preformatted/code block elements
     */
    processPreformatted(node) {
        const content = node.textContent || '';
        return `\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
    }

    /**
     * Process blockquote elements
     */
    processBlockquote(node) {
        const content = this.processChildren(node);
        const lines = content.split('\n').filter(line => line.trim());
        const quotedLines = lines.map(line => `> ${line}`).join('\n');
        return `\n\n${quotedLines}\n\n`;
    }

    /**
     * Process all child nodes
     */
    processChildren(node) {
        let result = '';
        for (const child of node.childNodes) {
            result += this.processNode(child);
        }
        return result;
    }

    /**
     * Clean text by removing extra whitespace
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n'); // Remove empty lines
    }

    /**
     * Clean up final markdown output
     */
    cleanupMarkdown(markdown) {
        return markdown
            .replace(/\n\n\n+/g, '\n\n')  // Replace multiple newlines with double newline
            .replace(/^\s+|\s+$/g, '')     // Trim start and end
            .trim();
    }

    /**
     * Generate a filename from page title
     */
    generateFilename(title) {
        const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
            .substring(0, 50);            // Limit length

        return cleanTitle || 'page';
    }
}

// Export for use in popup
if (typeof window !== 'undefined') {
    window.MarkdownService = MarkdownService;
}
