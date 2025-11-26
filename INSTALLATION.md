# Installation Guide

This guide will help you install and configure the AI Page Reader Firefox extension.

## Prerequisites

- Firefox browser (latest version recommended)
- A Google Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Step 1: Get the Extension Files

### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/simon-vd/ai-page-reader.git
cd ai-page-reader
```

### Option B: Download ZIP
1. Go to https://github.com/simon-vd/ai-page-reader
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a folder

## Step 2: Obtain a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you'll need this later)

> **Note**: The Gemini API has a generous free tier. Keep your API key secure and don't share it publicly.

## Step 3: Load the Extension in Firefox

1. Open Firefox browser
2. Type `about:debugging` in the address bar and press Enter
3. Click "This Firefox" in the left sidebar
4. Click the "Load Temporary Add-on..." button
5. Navigate to the extension folder
6. Select the `manifest.json` file
7. Click "Open"

The extension should now appear in your Firefox toolbar!

## Step 4: Configure Your API Key

1. Click the AI Page Reader icon in the Firefox toolbar
2. Click the settings button (⚙️) in the popup
3. In the settings page:
   - Paste your Gemini API key in the "API Key" field
   - Click "Test Connection" to verify it works
   - Click "Save API Key"

## Step 5: Customize Settings (Optional)

In the settings page, you can also:
- **Select a voice**: Choose your preferred text-to-speech voice
- **Adjust speech rate**: Control how fast the text is read (0.5x to 2x)
- **Adjust pitch**: Change the voice pitch
- **Adjust volume**: Set the reading volume

Click "Save Speech Settings" after making changes.

## Using the Extension

### Reading a Page
1. Navigate to any web page
2. Click the AI Page Reader icon
3. Click "Read Page"
4. Use the playback controls:
   - ⏸️ Pause reading
   - ▶️ Resume reading
   - ⏹️ Stop reading

### Getting a Summary
1. Click "Summarize & Read"
2. The AI will generate a summary
3. The summary will be read aloud automatically
4. You can see the summary in the chat section

### Asking Questions
1. Type your question in the chat input box
2. Press Enter or click the send button (📤)
3. The AI will answer based on the page content
4. Answers are displayed in the chat

## Troubleshooting

### Extension Icon Not Appearing
- Make sure you selected the correct `manifest.json` file
- Try reloading the extension from `about:debugging`
- Restart Firefox

### "API key not configured" Error
- Go to settings and enter your Gemini API key
- Click "Test Connection" to verify
- Make sure you're connected to the internet

### No Voice Output
- Check your system volume
- Try selecting a different voice in settings
- Some voices may not be available on all systems

### "Could not extract page content" Error
- The page might use a complex layout
- Try a different page
- Some pages may block content extraction

### Speech Cuts Off
- This can happen with very long pages
- Try using the "Summarize & Read" feature instead
- The extension splits long texts into chunks automatically

## Uninstalling

1. Go to `about:debugging` → "This Firefox"
2. Find "AI Page Reader" in the list
3. Click "Remove"

## Privacy & Security

- Your API key is stored locally in Firefox
- No data is sent anywhere except to Google's Gemini API
- Conversation history is stored locally per tab
- You can clear all data from the settings page

## Need Help?

- Report issues: https://github.com/simon-vd/ai-page-reader/issues
- Read the documentation: https://github.com/simon-vd/ai-page-reader

---

Enjoy learning with AI Page Reader! 🎧📚
