# Developer Guide

Guide for developers who want to contribute or understand the codebase.

## Project Structure

```
ai-page-reader/
├── manifest.json              # Extension manifest (Manifest V2)
├── popup/                     # Popup UI (shown when clicking extension icon)
│   ├── popup.html            # Popup HTML structure
│   ├── popup.css             # Popup styling (dark theme with gradients)
│   └── popup.js              # Popup logic and event handlers
├── content/                   # Content scripts (injected into web pages)
│   ├── content.js            # Page content extraction logic
│   └── content.css           # Styling for future highlighting feature
├── background/                # Background scripts
│   └── background.js         # Background process and message handling
├── services/                  # Service modules
│   ├── tts.js               # Text-to-Speech service (Web Speech API)
│   └── gemini.js            # Gemini API client
├── settings/                  # Settings page
│   ├── settings.html         # Settings page HTML
│   ├── settings.css          # Settings page styling
│   └── settings.js           # Settings page logic
├── utils/                     # Utility functions
│   └── storage.js            # Browser storage wrapper
└── assets/                    # Static assets
    └── icons/                # Extension icons
        ├── icon-48.svg
        └── icon-96.svg
```

## Architecture

### Communication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Popup     │◄────►│  Background  │◄────►│   Content   │
│   (UI)      │      │   (Bridge)   │      │  (Extract)  │
└─────────────┘      └──────────────┘      └─────────────┘
      │                                            │
      ▼                                            ▼
┌─────────────┐                            ┌─────────────┐
│  Services   │                            │  Web Page   │
│ TTS/Gemini  │                            │   (DOM)     │
└─────────────┘                            └─────────────┘
```

1. **Popup** requests page content from **Content Script**
2. **Content Script** extracts text from the page DOM
3. **Popup** sends text to **TTS Service** or **Gemini Service**
4. **Services** process and return results

### Key Components

#### Text-to-Speech (`services/tts.js`)
- Uses Web Speech API (`SpeechSynthesis`)
- Splits long text into chunks to avoid browser limits
- Provides progress tracking
- Supports pause/resume/stop

**Key Methods:**
- `speak(text, options)` - Start reading text
- `pause()` - Pause reading
- `resume()` - Resume reading
- `stop()` - Stop reading
- `onProgress(callback)` - Track reading progress

#### Gemini API Client (`services/gemini.js`)
- Communicates with Google Gemini API
- Generates page summaries
- Handles Q&A with conversation context

**Key Methods:**
- `summarizePage(content, title)` - Generate summary
- `answerQuestion(question, content, title, history)` - Answer questions
- `validateApiKey(key)` - Test API key

#### Content Extraction (`content/content.js`)
- Intelligently extracts main content from pages
- Filters out navigation, ads, footers
- Tries multiple selectors to find article content
- Cleans up whitespace and formatting

**Strategy:**
1. Look for semantic HTML5 elements (`<article>`, `<main>`)
2. Try common content class names
3. Fall back to `<body>` if needed
4. Remove unwanted elements
5. Clean and normalize text

#### Storage (`utils/storage.js`)
- Wrapper around `browser.storage.local`
- Manages API key storage
- Saves user preferences
- Stores conversation history per tab

## Technologies Used

### Browser APIs
- **WebExtensions API** - Firefox extension framework
- **Web Speech API** - Text-to-speech synthesis
- **Storage API** - Local data persistence
- **Tabs API** - Tab management and messaging

### External APIs
- **Google Gemini API** - AI text generation
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
  - Authentication: API key in query parameter

### Frontend
- **Vanilla JavaScript** - No frameworks for minimal overhead
- **CSS3** - Modern styling with gradients, animations
- **HTML5** - Semantic markup

## Development Setup

### Prerequisites
- Firefox browser
- Text editor / IDE
- Git
- Gemini API key (for testing)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/simon-vd/ai-page-reader.git
   cd ai-page-reader
   ```

2. **Load in Firefox**
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json`

3. **Make Changes**
   - Edit files in your code editor
   - Click "Reload" in `about:debugging` to test changes

4. **Debugging**
   - Popup: Right-click popup → "Inspect Element"
   - Content Script: Use browser DevTools on the page
   - Background: Check `about:debugging` → "Inspect"

### Testing

#### Manual Testing Checklist
- [ ] Load extension in Firefox
- [ ] Configure API key in settings
- [ ] Test on various websites (news, blogs, documentation)
- [ ] Test "Read Page" functionality
- [ ] Test pause/resume/stop controls
- [ ] Test "Summarize & Read"
- [ ] Test Q&A chat
- [ ] Test voice selection
- [ ] Test speech rate adjustment
- [ ] Test error handling (no API key, network errors)

#### Test URLs
- News article: https://www.bbc.com/news
- Technical docs: https://developer.mozilla.org
- Blog post: https://medium.com
- Wikipedia: https://en.wikipedia.org

## Code Style

### JavaScript
- Use `async/await` for asynchronous operations
- Add JSDoc comments for complex functions
- Use meaningful variable names
- Handle errors gracefully with try/catch

### CSS
- Use CSS custom properties (variables) for colors
- Follow BEM-like naming for classes
- Include smooth transitions for interactive elements
- Mobile-first responsive design

### HTML
- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Keep structure clean and organized

## Common Development Tasks

### Adding a New Feature

1. Update `task.md` with the new feature
2. Implement the feature in the appropriate module
3. Test thoroughly
4. Update documentation
5. Commit with descriptive message
6. Push to GitHub

### Updating the UI

1. Edit `popup/popup.html` for structure
2. Edit `popup/popup.css` for styling
3. Edit `popup/popup.js` for behavior
4. Test in different screen sizes
5. Ensure accessibility

### Adding New API Capabilities

1. Update `services/gemini.js`
2. Add new methods as needed
3. Update error handling
4. Test with various inputs
5. Document the new feature

## Future Enhancements

Potential features to add:
- Text highlighting as it's being read
- Export summaries and conversations
- Multiple language support
- Custom voice training
- Keyboard shortcuts
- Reading progress bookmarks
- History of read pages
- Reading statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Resources

- [WebExtensions API Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firefox Extension Workshop](https://extensionworkshop.com/)

---

Happy coding! 🚀
