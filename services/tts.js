// Text-to-Speech service using Web Speech API

class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPaused = false;
        this.isReading = false;
        this.currentText = '';
        this.currentPosition = 0;
        this.textChunks = [];
        this.currentChunkIndex = 0;
        this.onProgressCallback = null;
        this.onEndCallback = null;
        this.onStartCallback = null;
    }

    // Get available voices
    getVoices() {
        return this.synth.getVoices();
    }

    // Wait for voices to be loaded
    async waitForVoices() {
        return new Promise((resolve) => {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                this.synth.onvoiceschanged = () => {
                    resolve(this.synth.getVoices());
                };
            }
        });
    }

    // Get best voice (prefer English, natural-sounding voices)
    async getBestVoice() {
        const voices = await this.waitForVoices();

        // Priority: English, neural/natural voices
        const priorities = [
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'),
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('premium'),
            (v) => v.lang.startsWith('en') && !v.localService,
            (v) => v.lang.startsWith('en'),
            (v) => !v.localService,
            () => true
        ];

        for (const priorityFn of priorities) {
            const voice = voices.find(priorityFn);
            if (voice) return voice;
        }

        return voices[0];
    }

    // Split text into manageable chunks (to avoid speech synthesis limits)
    splitTextIntoChunks(text, maxLength = 200) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    // Speak text
    async speak(text, options = {}) {
        this.stop(); // Stop any ongoing speech

        this.currentText = text;
        this.textChunks = this.splitTextIntoChunks(text);
        this.currentChunkIndex = 0;
        this.isReading = true;
        this.isPaused = false;

        const settings = options.settings || {};
        const voice = options.voice || await this.getBestVoice();

        return new Promise((resolve, reject) => {
            this.speakChunk(voice, settings, resolve, reject);
        });
    }

    // Speak a single chunk
    speakChunk(voice, settings, onComplete, onError) {
        if (this.currentChunkIndex >= this.textChunks.length) {
            this.isReading = false;
            this.onEndCallback && this.onEndCallback();
            onComplete && onComplete();
            return;
        }

        const chunk = this.textChunks[this.currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunk);

        utterance.voice = voice;
        utterance.rate = settings.speechRate || 1.0;
        utterance.pitch = settings.speechPitch || 1.0;
        utterance.volume = settings.speechVolume || 1.0;

        utterance.onstart = () => {
            if (this.currentChunkIndex === 0) {
                this.onStartCallback && this.onStartCallback();
            }
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const totalChars = this.textChunks.slice(0, this.currentChunkIndex).join(' ').length;
                const progress = ((totalChars + event.charIndex) / this.currentText.length) * 100;
                this.onProgressCallback && this.onProgressCallback(Math.min(progress, 100));
            }
        };

        utterance.onend = () => {
            this.currentChunkIndex++;
            this.speakChunk(voice, settings, onComplete, onError);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isReading = false;
            onError && onError(event);
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    // Pause speech
    pause() {
        if (this.isReading && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
        }
    }

    // Resume speech
    resume() {
        if (this.isReading && this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
        }
    }

    // Stop speech
    stop() {
        this.synth.cancel();
        this.isReading = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.currentChunkIndex = 0;
        this.textChunks = [];
    }

    // Check if currently speaking
    isSpeaking() {
        return this.isReading;
    }

    // Set progress callback
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    // Set end callback
    onEnd(callback) {
        this.onEndCallback = callback;
    }

    // Set start callback
    onStart(callback) {
        this.onStartCallback = callback;
    }
}

// Create singleton instance
const ttsService = new TTSService();

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TTSService;
}
