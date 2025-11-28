# AI Page Reader Extension

**AI Page Reader** is a lightweight Firefox/Chrome extension that uses Google's Gemini API to generate concise, plain‑text summaries and answer questions about the current web page.

---

## Features
- **Summarize** the current page with a single click.
- **Q&A**: Ask any question about the page content.
- **Convert to Markdown**: Convert the page content to a markdown file.
---

## Instalation

- install it locally, in firefox go to **about:addons**
- click the gear icon and select "install addon from file"
- select the **ai-page-reader.xpi** file


## Configuration

1. Click the **gear icon** in the popup to open **Settings**
2. Paste your **Gemini API key** (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))
3. Press **Save API Key**
4. Use **Test Connection** to verify

---

## Usage

- **Summarize**: Click the **"Summarize Page"** button to get an AI summary
- **Ask questions**: Type a question and press **Enter** or click **Send**
- **Convert to Markdown**: Click **"Convert to Markdown"** to export the page

---

## Troubleshooting

- **"Could not establish connection"** – Refresh the page to inject the content script
- **"Error saving API key"** – Check that the extension has storage permissions
- **Popup shows blank** – Verify `popup/popup.html` exists and manifest points to it

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

*Happy reading!*
