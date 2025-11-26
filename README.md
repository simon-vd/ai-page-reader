# AI Page Reader - Firefox Extension

🎧 A powerful Firefox extension that reads web pages aloud with AI-powered summaries and interactive Q&A using Google Gemini API.

## ✨ Features

- **Text-to-Speech**: Read any web page aloud with natural-sounding voices
- **AI Summaries**: Generate comprehensive summaries of pages using Gemini API
- **Interactive Q&A**: Ask questions about the page content and get intelligent answers
- **Voice Customization**: Choose from available system voices and adjust speech rate
- **Conversation History**: Keep track of your questions and answers per tab
- **Modern UI**: Beautiful, responsive interface with dark mode

## 🚀 Installation

### Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/simon-vd/ai-page-reader.git
   cd ai-page-reader
   ```

2. Get a Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a free API key

3. Load the extension in Firefox:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from this project

4. Configure your API key:
   - Click the extension icon in the toolbar
   - Click the settings button (⚙️)
   - Enter your Gemini API key
   - Click "Test Connection" to verify
   - Click "Save API Key"

## 📖 Usage

### Reading a Page
1. Navigate to any web page
2. Click the extension icon
3. Click "Read Page" button
4. Use playback controls to pause, resume, or stop

### Getting a Summary
1. Click "Summarize & Read" button
2. The extension will generate and read an AI summary
3. Summary appears in the chat section

### Asking Questions
1. Type your question in the chat input
2. Press Enter or click send
3. Get AI-powered answers based on page content

## 🛠️ Project Structure

```
ai-page-reader/
├── manifest.json           # Extension manifest
├── popup/
│   ├── popup.html         # Main popup UI
│   ├── popup.css          # Popup styling
│   └── popup.js           # Popup logic
├── content/
│   ├── content.js         # Page content extraction
│   └── content.css        # Content styling
├── background/
│   └── background.js      # Background script
├── services/
│   ├── tts.js            # Text-to-speech service
│   └── gemini.js         # Gemini API service
├── settings/
│   ├── settings.html      # Settings page
│   ├── settings.css       # Settings styling
│   └── settings.js        # Settings logic
├── utils/
│   └── storage.js         # Storage utilities
└── assets/
    └── icons/             # Extension icons
```

## 🔧 Technologies Used

- **Web Speech API** - Natural text-to-speech
- **Google Gemini API** - AI summaries and Q&A
- **WebExtensions API** - Firefox extension framework
- **Vanilla JavaScript** - No frameworks, pure performance
- **Modern CSS** - Gradients, animations, dark mode

## 🎨 Design

The extension features a premium, modern design with:
- Vibrant purple and cyan gradient color scheme
- Smooth animations and micro-interactions
- Dark mode for comfortable reading
- Glassmorphism effects
- Responsive layout

## 📝 API Key Security

Your Gemini API key is stored securely in the browser's local storage and is never transmitted anywhere except to Google's Gemini API for generating content.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Google Gemini for the powerful AI capabilities
- Firefox for the excellent WebExtensions API
- The open-source community

## 🔮 Future Enhancements

- [ ] Text highlighting as it's being read
- [ ] Export summaries and conversations
- [ ] Multiple language support
- [ ] Custom voice training
- [ ] Keyboard shortcuts
- [ ] Reading progress bookmarks

---

Made with ❤️ for better learning and accessibility
