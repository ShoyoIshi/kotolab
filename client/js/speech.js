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

// Voice Recognition (Microphone Listening)
function startVoiceRecognition(targetWord, statusElementId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    const statusEl = document.getElementById(statusElementId);
    if (statusEl) statusEl.innerHTML = "🎙️ <i>Listening... Speak now into your microphone!</i>";

    recognition.start();

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.trim();
        console.log("Recognized Speech:", spokenText);

        if (statusEl) {
            if (spokenText === targetWord) {
                statusEl.innerHTML = `✨ <b>Perfect!</b> You said: "<span style="color: var(--accent-green);">${spokenText}</span>"`;
            } else {
                statusEl.innerHTML = `⚠️ Recognized: "<b>${spokenText}</b>". Target was: "<b>${targetWord}</b>". Try again!`;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        if (statusEl) {
            if (event.error === 'not-allowed') {
                statusEl.innerHTML = `<span style="color: var(--accent-red);">❌ Microphone access blocked. Please allow mic permissions in Chrome address bar!</span>`;
            } else {
                statusEl.innerHTML = `<span style="color: var(--accent-orange);">Error listening: ${event.error}</span>`;
            }
        }
    };
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