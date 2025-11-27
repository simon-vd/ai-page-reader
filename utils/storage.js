// Storage utility functions for managing extension settings and API keys

const StorageUtil = {
  // Get Gemini API key
  async getApiKey() {
    const result = await browser.storage.local.get('geminiApiKey');
    return result.geminiApiKey || null;
  },

  // Save Gemini API key
  async setApiKey(apiKey) {
    await browser.storage.local.set({ geminiApiKey: apiKey });
  },

  // Get all settings
  async getSettings() {
    const defaults = {
      voiceURI: null,
      speechRate: 1.0,
      speechPitch: 1.0,
      speechVolume: 1.0
    };

    const result = await browser.storage.local.get('settings');
    return result.settings || defaults;
  },

  // Save settings
  async saveSettings(settings) {
    await browser.storage.local.set({ settings });
  },

  // Get specific setting
  async getSetting(key, defaultValue = null) {
    const settings = await this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  // Update specific setting
  async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.saveSettings(settings);
  },

  // Clear all data
  async clearAll() {
    await browser.storage.local.clear();
  },

  // Get conversation history for current tab
  async getConversationHistory(tabId) {
    const key = `conversation_${tabId}`;
    const result = await browser.storage.local.get(key);
    return result[key] || [];
  },

  // Save conversation history
  async saveConversationHistory(tabId, messages) {
    const key = `conversation_${tabId}`;
    await browser.storage.local.set({ [key]: messages });
  },

  // Clear conversation for specific tab
  async clearConversation(tabId) {
    const key = `conversation_${tabId}`;
    await browser.storage.local.remove(key);
  }
};

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtil;
}
