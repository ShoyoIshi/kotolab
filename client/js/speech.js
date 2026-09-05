// ==========================================
// KotoLab Speech & Voice Recognition Engine
// ==========================================

// Text-to-Speech (Speaking Japanese out loud with native Japanese voice selection)
function speakJapanese(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85; // Slower speed for learners

        // Attempt to find and set a native Japanese voice
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.name.toLowerCase().includes('japan'));
        if (japaneseVoice) {
            utterance.voice = japaneseVoice;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        alert("Speech Synthesis is not supported in this browser. Please use Chrome or Edge.");
    }
}

// Ensure voices are loaded for speech synthesis
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// Global reference to handle active recognition state
let activeRecognitionInstance = null;

// Voice Recognition (Microphone Listening) - NOW ASYNC FOR BETTER DETECTION
async function startVoiceRecognition(targetWord, statusElementId) {
    const statusEl = document.getElementById(statusElementId);

    // 🔥 1. PROPER ASYNC BRAVE BROWSER CHECK
    if (navigator.brave && navigator.brave.isBrave) {
        try {
            const isBrave = await navigator.brave.isBrave();
            if (isBrave) {
                if (statusEl) {
                    statusEl.innerHTML = `<span style="color: #f97316;">🦁 Brave Browser blocks voice APIs for privacy. Please type your response!</span>`;
                }
                return; // Stop completely for Brave
            }
        } catch (err) {
            console.warn("Brave detection skipped due to strict shields.");
        }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        if (statusEl) {
            statusEl.innerHTML = `<span style="color: var(--accent-orange);">⚠️ Speech recognition not supported here. Use text input!</span>`;
        }
        return;
    }

    // Stop any ongoing recognition session safely
    if (activeRecognitionInstance) {
        try {
            activeRecognitionInstance.abort();
        } catch (e) {}
        activeRecognitionInstance = null;
    }

    try {
        const recognition = new SpeechRecognition();
        activeRecognitionInstance = recognition;
        
        recognition.lang = 'ja-JP';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (statusEl) {
            statusEl.innerHTML = "🎙️ <i>Listening... Speak now into your microphone!</i>";
        }

        recognition.onresult = (event) => {
            activeRecognitionInstance = null;
            if (!event.results || !event.results[0]) return;
            
            const spokenText = event.results[0][0].transcript.trim();
            console.log("Recognized Speech:", spokenText);

            if (statusEl) {
                if (spokenText.toLowerCase() === targetWord.toLowerCase()) {
                    statusEl.innerHTML = `✨ <b>Perfect!</b> You said: "<span style="color: var(--accent-green);">${spokenText}</span>"`;
                } else {
                    statusEl.innerHTML = `⚠️ Recognized: "<b>${spokenText}</b>". Target was: "<b>${targetWord}</b>". Try again!`;
                }
            }
        };

        recognition.onerror = (event) => {
            activeRecognitionInstance = null;
            console.error("Voice recognition error:", event.error);
            if (statusEl) {
                if (event.error === 'not-allowed') {
                    statusEl.innerHTML = `<span style="color: #ef4444;">❌ Mic blocked. Please allow mic permissions in address bar!</span>`;
                } else if (event.error === 'network') {
                    // 🔥 2. CATCH BRAVE'S NETWORK BLOCK (If Shields hide navigator.brave)
                    statusEl.innerHTML = `<span style="color: #f97316;">🦁 Privacy Block (Brave/Edge). Voice API blocked. Use text input!</span>`;
                } else if (event.error === 'no-speech') {
                    statusEl.innerHTML = `<span style="color: #f97316;">⚠️ No speech detected. Tap to retry.</span>`;
                } else {
                    statusEl.innerHTML = `<span style="color: #ef4444;">Mic error (${event.error}). Tap to retry.</span>`;
                }
            }
        };

        recognition.onend = () => {
            activeRecognitionInstance = null;
        };

        recognition.start();

    } catch (err) {
        activeRecognitionInstance = null;
        console.error("Failed to start recognition:", err);
        if (statusEl) {
            statusEl.innerHTML = `<span style="color: #ef4444;">Mic error or timeout. Tap to retry.</span>`;
        }
    }
}

// Load Real Stats from MySQL Database on Dashboard Load
async function loadRealUserStats() {
    try {
        const response = await fetch('/api/analytics/summary');
        if (!response.ok) return;

        const data = await response.json();
        
        // Update DOM elements with DB values
        if (document.getElementById("stat-lessons")) {
            document.getElementById("stat-lessons").innerText = data.lessons_completed || 0;
            document.getElementById("stat-accuracy").innerText = `${data.average_accuracy || 0}%`;
            document.getElementById("stat-time").innerText = `${data.study_hours || 0}h`;
            document.getElementById("stat-answers").innerText = data.total_attempts || 0;
        }
    } catch (err) {
        console.log("Using local default user state.");
    }
}

// Trigger on page ready
document.addEventListener("DOMContentLoaded", () => {
    loadRealUserStats();
});