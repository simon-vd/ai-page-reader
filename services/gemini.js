// Gemini API service for summaries and Q&A

class GeminiService {
    constructor() {
        // Using gemini-pro (most stable and widely available model)
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
        this.apiKey = null;
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
    }

    // Generate content with Gemini
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured. Please add your API key in settings.');
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 1024,
            }
        };

        try {
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
                console.error('Gemini API error details:', errorData);
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated from API');
            }

            const content = data.candidates[0].content;
            if (!content || !content.parts || !content.parts[0] || !content.parts[0].text) {
                throw new Error('Invalid response format from API');
            }

            return content.parts[0].text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    // Generate a summary of page content
    async summarizePage(pageContent, pageTitle = '') {
        const prompt = `You are a teacher explaining content to a student. Respond in SHORT, simple sentences using plain text only. DO NOT use markdown formatting - no asterisks, no backticks, no headers, no bullet points. Just normal text.
    
Page Title: ${pageTitle}

Content:
${pageContent.substring(0, 8000)} 

Provide a brief summary covering the main points. Keep it short and conversational.

Summary:`;

        return await this.generateContent(prompt, {
            temperature: 0.5,
            maxOutputTokens: 500
        });
    }

    // Answer a question about the page
    async answerQuestion(question, pageContent, pageTitle = '', conversationHistory = []) {
        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            conversationHistory.forEach(msg => {
                conversationContext += `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}\n`;
            });
        }

        const prompt = `You are a teacher helping a student. Respond in SHORT, simple sentences using plain text only. DO NOT use markdown formatting - no asterisks, no backticks, no headers, no bullet points. Just normal text.

Page Title: ${pageTitle}

Page Content:
${pageContent.substring(0, 6000)}
${conversationContext}

Student's Question: ${question}

Give a brief, helpful answer. If the answer isn't in the content, say so. Keep it short.

Answer:`;

        return await this.generateContent(prompt, {
            temperature: 0.7,
            maxOutputTokens: 400
        });
    }

    // Simple chat method for markdown preview
    async chat(prompt) {
        return await this.generateContent(prompt, {
            temperature: 0.7,
            maxOutputTokens: 500
        });
    }

    // Validate API key
    async validateApiKey(apiKey) {
        this.setApiKey(apiKey);
        // We let the error propagate so the UI can show the specific error message
        await this.generateContent('Test', { maxOutputTokens: 10 });
        return true;
    }
}

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiService;
}
