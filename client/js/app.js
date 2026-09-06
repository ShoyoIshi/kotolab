// ==========================================
// KotoLab Master Client Script (Global Sync & 6-Module Sandbox)
// ==========================================

let selectedTiles = [];
let currentScenario = null;
let currentFetchedModule = null;
let currentQuestionIndex = 0;
let builtSentenceTiles = [];
let activeAudioPromptText = "こんにちは";

// Helper: Safely get current user ID from browser
function getCurrentUserId() {
    try {
        const storedUser = JSON.parse(localStorage.getItem('kotolab_user') || '{}');
        if (storedUser && storedUser.id) return storedUser.id;
    } catch(e) {}
    return 3; 
}

function getFormattedTodayDate() {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==========================================
// 1. GLOBAL DATABASE SYNCHRONIZER (Dashboard, XP, Lives & Analytics Fix)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => { await globalDatabaseSync(); }, 400);
    const dateEl = document.getElementById('currentDateDisplay');
    if (dateEl) dateEl.innerText = getFormattedTodayDate();
});

async function globalDatabaseSync() {
    const userId = getCurrentUserId();
    let p = { overall_accuracy: 0, lessons_completed: 0, study_time_minutes: 0, total_correct: 0, hiragana_mastery: 0, katakana_mastery: 0, kanji_mastery: 0, vocabulary_mastery: 0, grammar_mastery: 0 };
    
    try {
        const res = await fetch(`/api/user/progress?userId=${userId}`);
        const data = await res.json();
        if (data && !data.error && data.total_correct !== undefined) p = data;
    } catch(e) {}

    // Automatically check and unlock features on sync
    await checkAndUnlockFeatures(userId);

    // ==========================================
    // ❤️ LIVES & REFILL TIMER EVALUATION (STRICT PAGE FILTER)
    // ==========================================
    let currentLives = p.lives !== undefined ? p.lives : 5;
    const maxLives = 5;
    const refillIntervalMinutes = 30; // Har 30 min mein 1 life refill

    if (currentLives < maxLives && p.last_life_lost_at) {
        const lastLostTime = new Date(p.last_life_lost_at).getTime();
        const now = new Date().getTime();
        const diffMinutes = Math.floor((now - lastLostTime) / (1000 * 60));

        const earnedLives = Math.floor(diffMinutes / refillIntervalMinutes);
        if (earnedLives > 0) {
            currentLives = Math.min(maxLives, currentLives + earnedLives);
            // Sync updated lives back to database quietly
            fetch('/api/user/refill-life', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, amount: earnedLives })
            }).catch(err => console.log('Auto-refill sync error:', err));
        }

        // 🕒 Start the Live MM:SS Countdown
        if (currentLives < maxLives) {
            if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
            window.liveTimerInterval = setInterval(() => {
                const currentTime = new Date().getTime();
                const totalDiffMs = currentTime - lastLostTime;
                const refillMs = refillIntervalMinutes * 60 * 1000;
                
                const timePassedInCycle = totalDiffMs % refillMs;
                const timeLeftMs = refillMs - timePassedInCycle;

                const m = Math.floor(timeLeftMs / (1000 * 60));
                const s = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

                document.querySelectorAll('#life-timer-display').forEach(el => {
                    if (el) {
                        el.style.display = 'inline';
                        el.innerText = `(+${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')})`;
                    }
                });

                // Auto-refresh when timer hits 0
                if (timeLeftMs <= 1000) {
                    clearInterval(window.liveTimerInterval);
                    globalDatabaseSync(); // Refresh lives
                }
            }, 1000);
        }
    } else {
        // Hide timer if lives are full
        document.querySelectorAll('#life-timer-display').forEach(el => {
            if (el) el.style.display = 'none';
        });
        if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
    }

    // Reflect Lives across all UI elements safely
    document.querySelectorAll('#user-lives, .user-lives-display').forEach(el => {
        if (el) el.innerText = currentLives;
    });

    // 🚀 STRICT PAGE CHECK: Only block on practice pages!
    // CONVERSATION IS NOW A FREE ZONE (No locks there!)
    if (currentLives <= 0) {
        const path = window.location.pathname.toLowerCase();
        const isPracticePage = path.includes('drills') || 
                              path.includes('sandbox') || 
                              path.includes('exam'); 
        if (isPracticePage) {
            triggerGameOverModal();
        }
    }
    // ==========================================

    const isNewUser = (p.lessons_completed === 0 && p.total_correct === 0 && p.study_time_minutes === 0);
    const storedUser = JSON.parse(localStorage.getItem('kotolab_user') || '{}');
    const uname = storedUser.username || localStorage.getItem('kotolab_username') || 'Shoyo';
    
    document.querySelectorAll('.user-name, #user-display-name, #header-greeting-name, #sidebar-user-name').forEach(el => el && (el.innerText = uname));
    document.querySelectorAll('.user-avatar, #user-avatar, #top-user-avatar, #userInitialDisplay, #sidebar-user-initial').forEach(el => el && (el.innerText = uname.charAt(0).toUpperCase()));
    
    // 🚀 TARGETED XP SYNC (Only updates designated badges and counters safely)
    const totalXP = (p.total_correct || 0) * 50;
    document.querySelectorAll('.user-xp-display, #stat-total-xp, #xpCountDisplay').forEach(el => {
        if (el) {
            if (el.textContent.includes('XP')) el.textContent = `${totalXP} XP`;
            else el.textContent = totalXP;
        }
    });

    // Sync Top KPI Cards
    if (document.getElementById('stat-lessons')) document.getElementById('stat-lessons').innerText = p.lessons_completed || 0;
    if (document.getElementById('stat-time')) document.getElementById('stat-time').innerText = `${Math.floor((p.study_time_minutes || 0) / 60)}h ${(p.study_time_minutes || 0) % 60}m`;
    if (document.getElementById('stat-correct')) document.getElementById('stat-correct').innerText = p.total_correct || 0;
    if (document.getElementById('stat-accuracy')) document.getElementById('stat-accuracy').innerText = `${Number(p.overall_accuracy || 0).toFixed(0)}%`;

    // Analytics Page Tab 1 Cards
    if (document.getElementById('kpi-accuracy')) document.getElementById('kpi-accuracy').innerText = `${Number(p.overall_accuracy || 0).toFixed(0)}%`;
    if (document.getElementById('kpi-readiness')) document.getElementById('kpi-readiness').innerText = `${Number(p.overall_accuracy || 0).toFixed(0)}%`;
    
    const totalMins = p.study_time_minutes || 0;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (document.getElementById('stat-total-time')) {
        document.getElementById('stat-total-time').innerText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
    }
    
    if (document.getElementById('kpi-weak-tags')) {
        let weakCount = 0;
        if ((p.hiragana_mastery || 0) < 50) weakCount++;
        if ((p.katakana_mastery || 0) < 50) weakCount++;
        if ((p.kanji_mastery || 0) < 50) weakCount++;
        if ((p.grammar_mastery || 0) < 50) weakCount++;
        document.getElementById('kpi-weak-tags').innerText = `${weakCount || 1} Tags`;
    }

    if (!isNewUser) {
        // 🔥 DIRECT ID-BASED PROGRESS BAR MAPPING (Zero Confusion)
        const grammarVal = Number(p.grammar_mastery || 0).toFixed(0);
        const vocabVal = Number(p.vocabulary_mastery || 0).toFixed(0);
        const overallVal = Number(p.overall_accuracy || 0).toFixed(0);
        const readingVal = Math.min(100, (p.lessons_completed || 0) * 10);

        const progressMap = [
            grammarVal, // 0: Particles Basics
            grammarVal, // 1: Basic Sentences
            vocabVal,   // 2: Daily Expressions
            overallVal, // 3: Listening & Speech
            readingVal, // 4: Reading Practice
            vocabVal    // 5: Vocabulary Essentials
        ];

        progressMap.forEach((val, idx) => {
            const txtEl = document.getElementById(`card-prog-txt-${idx}`);
            const fillEl = document.getElementById(`card-prog-fill-${idx}`);
            if (txtEl) txtEl.innerText = `${val}%`;
            if (fillEl) fillEl.style.width = `${val}%`;
        });

        // Update Charts
        setTimeout(() => {
            if (typeof Chart !== 'undefined' && Chart.instances) {
                for (let id in Chart.instances) {
                    let chart = Chart.instances[id];
                    if (chart.canvas.id === 'progressLineChart') chart.data.datasets[0].data = [0,0,0,0,0,0, p.lessons_completed || 0];
                    if (chart.canvas.id === 'skillDoughnutChart') chart.data.datasets[0].data = [p.hiragana_mastery||0, p.katakana_mastery||0, p.kanji_mastery||0, p.grammar_mastery||0];
                    if (chart.canvas.id === 'moduleAccuracyChart') chart.data.datasets[0].data = [p.hiragana_mastery||0, p.katakana_mastery||0, p.kanji_mastery||0, p.grammar_mastery||0, p.overall_accuracy||0, p.vocabulary_mastery||0];
                    if (chart.canvas.id === 'spiderRadarChart') chart.data.datasets[0].data = [p.hiragana_mastery||0, p.katakana_mastery||0, p.kanji_mastery||0, p.grammar_mastery||0, p.vocabulary_mastery||0, p.overall_accuracy||0, p.overall_accuracy||0];
                    if (chart.canvas.id === 'missedParticlesChart') {
                        chart.data.datasets[0].data = [17, 14, 11, 9, 6]; 
                    }
                    chart.update();
                }
            }
        }, 300);
    }
}

function submitUserScore(score, total) {
    fetch('/api/user/update-progress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getCurrentUserId(), correctIncrement: score, studyMinutesIncrement: 5, lessonCompleted: true })
    }).then(() => globalDatabaseSync());
}

async function recordSandboxSuccess() { submitUserScore(1, 1); }

// ==========================================
// 2. MASSIVE DATA BANKS FOR 100% RANDOMNESS
// ==========================================
const particleBank = [
    { before: "ともだちは パン", after: "たべます。", targetParticle: "を", particles: ["を", "は", "が", "に", "で"], meaning: "My friend eats bread.", explanation: "「を」 marks the direct object receiving the action." },
    { before: "わたしは がっこう", after: "いきます。", targetParticle: "に", particles: ["に", "で", "を", "は", "から"], meaning: "I go to school.", explanation: "「に」 marks the destination/direction of movement." },
    { before: "たなかさんは へや", after: "ほんを よみます。", targetParticle: "で", particles: ["で", "に", "を", "は", "が"], meaning: "Tanaka-san reads a book in the room.", explanation: "「で」 marks the location where an active event takes place." },
    { before: "テーブルの うえ", after: "ねこが います。", targetParticle: "に", particles: ["に", "を", "で", "は", "が"], meaning: "There is a cat on the table.", explanation: "「に」 is used with います/あります to show existence location." },
    { before: "わたし", after: "がくせいです。", targetParticle: "は", particles: ["は", "が", "を", "に", "で"], meaning: "I am a student.", explanation: "「は」 (wa) is the topic marker." },
    { before: "えんぴつ", after: "てがみを かきます。", targetParticle: "で", particles: ["で", "in", "を", "は", "が"], meaning: "I write a letter with a pencil." , explanation: "「で」 marks the tool or means used to do an action." }
];

const sentenceBank = [
    { prompt: "Build: 'Tanaka-san drinks coffee.'", targetSentence: "たなかさんは コーヒー を のみます。", tiles: ["たなかさんは", "コーヒー", ">おちゃ", "のみます。"], distractors: ["パン", "あした"] },
    { prompt: "Build: 'My friend went to school.'", targetSentence: "ともだちは がっこう に いきました。", tiles: ["ともだちは", "がっこう", "に", "いきました。"], distractors: ["みず", "ねこ"] },
    { prompt: "Build: 'The cat sleeps in the room.'", targetSentence: "ねこは へや で ねます。", tiles: ["ねこは", "へや", "で", "ねます。"], distractors: ["ほん", "おちゃ"] },
    { prompt: "Build: 'I eat sushi.'", targetSentence: "わたしは すし を たべます。", tiles: ["わたしは", "すし", "を", "たべます。"], distractors: ["みず", "くるま"] },
    { prompt: "Build: 'He writes a letter.'", targetSentence: "かれは てがみ を かきます。", tiles: ["かれは", "てがみ", "を", "かきます。"], distractors: ["で", "がっこう"] },
    { prompt: "Build: 'I bought a watch.'", targetSentence: "わたしは とけい を かいました。", tiles: ["わたしは", "とけい", "を", "かいました。"], distractors: ["に", "ねます"] }
];

// Dynamic Vocabulary Fetcher from Supabase Database
async function fetchVocabBankForModule() {
    try {
        const response = await fetch('/api/sandbox/vocab');
        const result = await response.json();
        
        if (result.success && result.words && result.words.length > 0) {
            const formattedWords = result.words.map(item => {
                const wordStr = item.japanese_word || item.word;
                const readingStr = item.reading || wordStr;
                const meaningStr = item.meaning;

                return {
                    word: wordStr,
                    reading: `${readingStr}`,
                    kanjiMeaning: meaningStr,
                    question: `Choose the meaning for 「${wordStr}」:`,
                    correctMeaning: meaningStr,
                    example: `${wordStr} です。`
                };
            });

            return formattedWords.sort(() => Math.random() - 0.5).map(qItem => {
                const wrongOptions = formattedWords
                    .filter(w => w.kanjiMeaning !== qItem.kanjiMeaning)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(w => w.kanjiMeaning);

                const options = [qItem.kanjiMeaning, ...wrongOptions].sort(() => Math.random() - 0.5);
                const correctIdx = options.indexOf(qItem.kanjiMeaning);

                return {
                    word: qItem.word,
                    reading: qItem.reading,
                    kanjiMeaning: qItem.kanjiMeaning,
                    question: qItem.question,
                    options: options,
                    correct: correctIdx,
                    example: qItem.example
                };
            });
        }
    } catch (e) {
        console.error("Failed to load dynamic vocab from Supabase, falling back to default.", e);
    }

    return [
        { word: "食べる", reading: "たべる (taberu)", kanjiMeaning: "To eat", question: "Choose the meaning for 「食べる」:", options: ["To drink", "To eat", "To buy", "To see"], correct: 1, example: "パンを食べます。" },
        { word: "飲む", reading: "のむ (nomu)", kanjiMeaning: "To drink", question: "Choose the meaning for 「飲む」:", options: ["To drink", "To eat", "To read", "To write"], correct: 0, example: "水を飲みます。" }
    ];
}

// ==========================================
// 🚀 100% PERFECTLY BALANCED DYNAMIC PARTICLE BANK
// ==========================================
async function fetchDynamicParticleBank() {
    try {
        const response = await fetch('/api/sandbox/particles');
        const result = await response.json();
        
        if (result.success && result.words && result.words.length > 0) {
            return result.words.map((item, index) => {
                const word = item.japanese_word || item.word || "ことば";
                const reading = item.reading || item.japanese_word || "";
                const englishMeaning = (item.meaning || "word").toLowerCase();
                
                // Pure round-robin ensures exactly 20% distribution of every particle
                const partChoice = ["は", "が", "を", "に", "で"][index % 5];
                let afterText = "";
                let sentenceTranslation = "";
                let explanation = "";

                // Universal grammar structures that make sense with ANY noun
                if (partChoice === "は") {
                    afterText = "いいです。";
                    sentenceTranslation = `As for ${englishMeaning}, it is good.`;
                    explanation = `「は」 (wa) is the topic marker setting the context.`;
                } else if (partChoice === "が") {
                    afterText = "すきです。";
                    sentenceTranslation = `I like ${englishMeaning}.`;
                    explanation = `「が」 marks the object of preference or liking.`;
                } else if (partChoice === "を") {
                    afterText = "かいます。";
                    sentenceTranslation = `I buy ${englishMeaning}.`;
                    explanation = `「を」 marks the direct object receiving an action.`;
                } else if (partChoice === "に") {
                    afterText = "します。";
                    sentenceTranslation = `I decide on / choose ${englishMeaning}.`;
                    explanation = `「に」 with 'shimasu' indicates a decision or choice.`;
                } else {
                    afterText = "つくります。";
                    sentenceTranslation = `I make [it] with/at ${englishMeaning}.`;
                    explanation = `「で」 indicates the tool, means, or location of action.`;
                }

                return {
                    before: word,
                    after: afterText,
                    targetParticle: partChoice,
                    particles: ["は", "が", "を", "に", "で"].sort(() => Math.random() - 0.5),
                    meaning: `Meaning: ${sentenceTranslation} — [Target Word: ${word} (${reading}) meaning: ${englishMeaning}]`,
                    explanation: explanation
                };
            }).sort(() => Math.random() - 0.5);
        }
    } catch (e) {
        console.error("Failed to load dynamic particles from Supabase, falling back to default.", e);
    }

    return particleBank;
}

const expressionBank = [
    { phrase: "おはようございます", romaji: "ohayou gozaimasu", meaning: "Good morning", options: ["Good morning", "Thank you", "Excuse me", "Good evening"], correct: 0 },
    { phrase: "こんにちは", romaji: "konnichiwa", meaning: "Hello / Good afternoon", options: ["Good night", "Hello / Good afternoon", "Goodbye", "Sorry"], correct: 1 },
    { phrase: "こんばんは", romaji: "konbanwa", meaning: "Good evening", options: ["Good morning", "Excuse me", "Good evening", "Welcome"], correct: 2 },
    { phrase: "いただきます", romaji: "itadakimasu", meaning: "Thank you for the meal", options: ["Goodbye", "Thank you for meal", "Good evening", "Please"], correct: 1 },
    { phrase: "すみません", romaji: "sumimasen", meaning: "Excuse me / I'm sorry", options: ["Good night", "Excuse me / I'm sorry", "Yes", "No"], correct: 1 },
    { phrase: "ありがとうございます", romaji: "arigatou gozaimasu", meaning: "Thank you very much", options: ["Thank you very much", "You're welcome", "Hello", "Good job"], correct: 0 }
];

const listeningBank = [
    {
        dialogue: [{ speaker: "店員", jp: "いらっしゃいませ！何にしますか。", romaji: "Irasshaimase! Nani ni shimasu ka.", english: "Welcome! What would you like?" }, { speaker: "あなた", jp: "お茶をお願いします。", romaji: "Ocha o onegai shimasu.", english: "Green tea please." }],
        prompt: "Listen to the dialogue, then speak your response:", targetSpokenResponse: "お茶をお願いします。",
        options: ["Order green tea (お茶をお願いします)", "Order coffee (コーヒー)", "Ask for check"], correct: 0, explanation: "「お茶をお願いします」 requests tea."
    },
    {
        dialogue: [{ speaker: "通行人", jp: "すみません、駅はどこですか。", romaji: "Sumimasen, eki wa doko desu ka.", english: "Excuse me, where is the station?" }, { speaker: "あなた", jp: "駅はあそこです。", romaji: "Eki wa asoko desu.", english: "The station is over there." }],
        prompt: "Listen and guide the person:", targetSpokenResponse: "駅はあそこです。",
        options: ["The station is here", "The station is over there (あそこです)", "I don't know"], correct: 1, explanation: "あそこ means 'over there'."
    }
];

const readingBank = [
    { passage: "アパートの皆さんへ\n来週の月曜日と火曜日の午前１０時から午後５時までエレベーターを使わないでください。階段を使ってください。", question: "アパートの人は、どうしますか。", options: ["階段を使います。", "エレベーターを使います。", "外に出ません。"], correct: 0, explanation: "The notice says to use the stairs (階段)." },
    { passage: "としょかんの ルール\nとしょかんの なかで パンを たべないで ください。ジュースを のまないで ください。", question: "としょかんで 何を してはいけませんか。", options: ["本を読みます", "パンを食べます", "勉強します"], correct: 1, explanation: "You must not eat bread (パンを たべないで ください)." }
];

// ==========================================
// 3. SANDBOX MODULE LAUNCHER & RENDERER
// ==========================================

async function launchRandomScenario() {
    const randomIndex = Math.floor(Math.random() * sentenceBank.length);
    const randomScen = sentenceBank[randomIndex];

    currentFetchedModule = {
        title: "Random Sandbox Practice",
        badge: "Practice • Random",
        type: "sentence",
        questions: [{ prompt: randomScen.prompt, targetSentence: randomScen.targetSentence.replace(/\s/g, ''), tiles: randomScen.tiles, distractors: randomScen.distractors }]
    };
    currentQuestionIndex = 0;
    builtSentenceTiles = [];
    renderCurrentQuestion();
    document.getElementById('practiceModal').style.display = 'flex';
}

async function launchModuleSession(id) {
    currentQuestionIndex = 0;
    builtSentenceTiles = [];
    
    if (id === '1') {
        const dynamicParticles = await fetchDynamicParticleBank();
        currentFetchedModule = { title: "Particles Basics", badge: "Card 1", type: "particle", questions: dynamicParticles.slice(0, 4) };
    } else if (id === '2') {
        currentFetchedModule = { title: "Basic Sentences", badge: "Card 2", type: "sentence", questions: sentenceBank.sort(() => Math.random() - 0.5).slice(0, 4) };
    } else if (id === '3') {
        currentFetchedModule = { title: "Daily Expressions", badge: "Card 3", type: "expression", questions: expressionBank.sort(() => Math.random() - 0.5).slice(0, 4) };
    } else if (id === '4') {
        currentFetchedModule = { title: "Listening & Speech", badge: "Card 4", type: "listening", questions: listeningBank.sort(() => Math.random() - 0.5).slice(0, 1) };
    } else if (id === '5') {
        currentFetchedModule = { title: "Reading Practice", badge: "Card 5", type: "reading", questions: readingBank.sort(() => Math.random() - 0.5).slice(0, 1) };
    } else {
        const fetchedVocab = await fetchVocabBankForModule();
        currentFetchedModule = { title: "Vocabulary Essentials", badge: "Card 6", type: "vocabulary", questions: fetchedVocab.slice(0, 4) };
    }

    renderCurrentQuestion();
    document.getElementById('practiceModal').style.display = 'flex';
}

function getTileDetails(item) {
    if (typeof item === 'object' && item !== null) {
        return { text: item.text || item.word || item.symbol || '', sub: item.sub || item.romaji || item.meaning || '', type: item.type || 'noun' };
    }
    return { text: String(item || ''), sub: '', type: 'noun' };
}

function renderCurrentQuestion() {
    const data = currentFetchedModule;
    const q = data.questions[currentQuestionIndex];
    const container = document.getElementById('modal-dynamic-content');
    const aiText = document.getElementById('ai-coach-feedback');
    const notesBox = document.getElementById('dynamic-grammar-notes');

    if (notesBox) notesBox.style.display = 'none';

    document.getElementById('modal-module-tag').innerText = `${data.badge} • Q ${currentQuestionIndex + 1}/${data.questions.length}`;
    document.getElementById('modal-module-title').innerText = data.title;
    document.getElementById('modal-next-btn').innerText = currentQuestionIndex < data.questions.length - 1 ? `Next Question (Q ${currentQuestionIndex + 1}/${data.questions.length}) →` : "Complete Lesson 🎉";

    let bodyHTML = '';
    aiText.innerText = "Select an answer, build a sentence, or ask Shoyo-Kun any question below!";

    if (data.type === 'particle') {
        const fullText = `${q.before}${q.targetParticle}${q.after}`;
        activeAudioPromptText = fullText;

        bodyHTML = `
            <div style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.5rem;">Question ${currentQuestionIndex + 1}: Select the missing particle</div>
            <div style="background: #111827; padding: 1.25rem; border-radius: 12px; text-align: center; margin-bottom: 1rem; border: 1px solid var(--border-color);">
                <div style="font-size: 1.4rem; color: white; font-weight: 800; margin-bottom: 0.5rem; cursor: pointer;" onclick="playAudioPromptText(\`${fullText}\`)">
                    <span class="jp-hover-term">
                        ${q.before} <span id="particle-blank-slot" style="color: var(--accent-blue); font-weight: 800; border-bottom: 2px dashed var(--accent-blue); padding: 0 10px; display: inline-block;">___</span> ${q.after} 🔊
                    </span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
                    Meaning: ${q.meaning}
                </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Select missing particle:</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${q.particles.map((p, idx) => `
                    <button class="tile-btn" id="part-opt-${idx}" style="flex: 1; color: var(--accent-blue); font-size: 1.1rem; min-width: 40px;" onclick="checkParticleAnswer(\`${p}\`, \`${q.targetParticle}\`, ${idx}, \`${q.explanation || ''}\`, \`${fullText}\`)">${p}</button>
                `).join('')}
            </div>
        `;
    } else if (data.type === 'sentence') {
        activeAudioPromptText = q.targetSentence;
        const fullTiles = [...q.tiles, ...(q.distractors || [])].sort(() => Math.random() - 0.5);

        bodyHTML = `
            <div style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.5rem;">Question ${currentQuestionIndex + 1}: ${q.prompt}</div>
            <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Option A: Type Japanese directly</label>
                <input type="text" id="direct-sentence-input" placeholder="Type sentence here..." style="width: 100%; background: #111827; border: 1px solid var(--border-color); padding: 0.65rem 0.85rem; border-radius: 10px; color: white; font-size: 0.9rem;" oninput="syncTypedSentence(this.value)">
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem;">Option B: Click tiles below to arrange</div>
            <div id="dropzone-area" style="min-height: 55px; background: #111827; border: 1px dashed var(--accent-blue); border-radius: 12px; padding: 0.65rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1rem;">
                ${builtSentenceTiles.length === 0 ? 
                    `<span style="color: #64748b; font-size: 0.8rem; font-style: italic;">Clicked tiles appear here...</span>` :
                    builtSentenceTiles.map((t, i) => `
                        <span class="dropped-tile-item" onclick="removeTile(${i})">${t} ✕</span>
                    `).join('')
                }
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
                <button class="tile-btn" style="background: var(--accent-green); border: none; color: white; font-size: 0.95rem; font-weight: 800; padding: 0.85rem; width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);" onclick="verifySentence(\`${q.targetSentence}\`)">
                    ✓ Check My Sentence
                </button>
                <div style="display: flex; justify-content: space-between; align-items: center; background: #111827; padding: 0.5rem 0.75rem; border-radius: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; gap: 0.75rem;">
                        <span style="font-size: 0.75rem; color: var(--accent-blue); cursor: pointer; font-weight: 600;" onclick="playAudioPromptText(\`${q.targetSentence}\`)">🔊 Listen</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); cursor: pointer; font-weight: 600;" onclick="showHint()">💡 Hint</span>
                    </div>
                    <button style="background: rgba(239,68,68,0.15); border: 1px solid var(--accent-red); color: var(--accent-red); font-size: 0.72rem; padding: 0.25rem 0.6rem; border-radius: 6px; cursor: pointer;" onclick="clearTiles()">
                        🗑️ Clear
                    </button>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                ${fullTiles.map(t => `
                    <button class="tile-btn" onclick="addTile(\`${t}\`)">${t}</button>
                `).join('')}
            </div>
        `;
    } else if (data.type === 'expression') {
        activeAudioPromptText = q.phrase;
        bodyHTML = `
            <div style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.2rem;">Question ${currentQuestionIndex + 1}: Expression Drill</div>
            <div style="background: #111827; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 2.2rem; font-weight: 800; color: white; margin-bottom: 0.5rem; cursor: pointer;" onclick="playAudioPromptText(\`${q.phrase}\`)">
                    ${q.phrase} 🔊
                </div>
                <div style="font-size: 0.95rem; color: var(--accent-blue); font-weight: 600; margin-bottom: 0.35rem;">
                    Reading: ${q.romaji || q.phrase}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    Meaning: ${q.meaning}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${q.options.map((opt, idx) => `
                    <button class="tile-btn" id="expr-opt-${idx}" style="text-align: left;" onclick="checkMultipleChoiceAnswer(${idx}, ${q.correct}, \`${q.meaning || ''}\`)">${opt}</button>
                `).join('')}
            </div>
        `;
    } else if (data.type === 'listening') {
        activeAudioPromptText = q.dialogue ? q.dialogue.map(d => d.jp).join("。 ") : q.audioText;
        let dialogueHTML = '';
        if (q.dialogue) {
            dialogueHTML = q.dialogue.map(d => `
                <div class="dialogue-bubble" onclick="playAudioPromptText(\`${d.jp}\`)">
                    <div class="speaker-badge" style="font-size:0.7rem; font-weight:800; margin-bottom:0.25rem; color: ${d.speaker.includes('あなた') ? 'var(--accent-green)' : 'var(--accent-blue)'};">${d.speaker}</div>
                    <div style="font-size: 1.05rem; font-weight: 800; color: white; margin-bottom: 0.15rem;">
                        <span class="jp-hover-term">${d.jp}<span class="tooltip-text">${d.romaji}</span></span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${d.english}</div>
                </div>
            `).join('');
        }

        bodyHTML = `
            <div style="font-size: 0.8rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.5rem;">${q.prompt}</div>
            <div style="margin-bottom: 1rem;">${dialogueHTML}</div>
            <div style="background: #111827; border: 1px solid var(--border-color); border-radius: 12px; padding: 0.85rem; margin-bottom: 1rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700; margin-bottom: 0.4rem;">🎤 Speech Challenge: Speak response into mic:</div>
                <div style="font-size: 0.95rem; color: white; font-weight: 800; margin-bottom: 0.65rem;">「${q.targetSpokenResponse}」</div>
                <button class="tile-btn" id="voice-start-btn" style="background: var(--accent-green) !important; border: none !important; color: white !important; padding: 0.5rem 1.25rem; font-size: 0.8rem;" onclick="startVoiceChallenge(\`${q.targetSpokenResponse}\`)">
                    🎤 Start Speaking Challenge
                </button>
                <div id="voice-status" style="font-size: 0.7rem; color: var(--accent-blue); margin-top: 0.4rem;">Click button and speak in Japanese</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Recognized: <strong id="voice-recognized-text" style="color: white;">...</strong></div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.4rem;">Select matching option:</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${q.options.map((opt, idx) => `
                    <button class="tile-btn" id="list-opt-${idx}" style="text-align: left;" onclick="checkMultipleChoiceAnswer(${idx}, ${q.correct}, \`${q.explanation || ''}\`)">${opt}</button>
                `).join('')}
            </div>
        `;
    } else if (data.type === 'reading') {
        activeAudioPromptText = q.passage;
        bodyHTML = `
            <div style="font-size: 0.75rem; color: var(--accent-orange); font-weight: 700; margin-bottom: 0.4rem;">Passage ${currentQuestionIndex + 1} of ${data.questions.length}</div>
            <div class="reading-box" style="white-space: pre-line;">${q.passage}</div>
            <div style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 700; margin-bottom: 0.75rem;">${q.question}</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${q.options.map((opt, idx) => `
                    <button class="tile-btn" id="read-opt-${idx}" style="text-align: left;" onclick="checkMultipleChoiceAnswer(${idx}, ${q.correct}, \`${q.explanation || ''}\`)">${String.fromCharCode(65 + idx)}. ${opt}</button>
                `).join('')}
            </div>
        `;
    } else if (data.type === 'vocabulary') {
        activeAudioPromptText = `${q.word}。 ${q.example}`;
        bodyHTML = `
            <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700; margin-bottom: 0.3rem;">Vocabulary Word ${currentQuestionIndex + 1} of ${data.questions.length}</div>
            <div style="background: #111827; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 2.2rem; font-weight: 800; color: white; margin-bottom: 0.4rem; cursor: pointer;" onclick="playAudioPromptText(\`${q.word}\`)">
                    ${q.word} 🔊
                </div>
                <div style="font-size: 1rem; color: var(--accent-blue); font-weight: 600; margin-bottom: 0.4rem;">
                    Furigana: ${q.reading}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Usage: <em>${q.example}</em>
                </div>
            </div>
            <div style="font-size: 0.85rem; color: white; font-weight: 700; margin-bottom: 0.65rem;">${q.question}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
                ${q.options.map((opt, idx) => `
                    <button class="tile-btn" id="vocab-opt-${idx}" style="text-align: center; padding: 0.85rem;" onclick="checkMultipleChoiceAnswer(${idx}, ${q.correct}, \`${q.word} ${q.reading}\`)">${opt}</button>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = bodyHTML;
}

// ==========================================
// 4. ANSWER CHECKERS & INTERACTIONS (DYNAMIC & SECURE)
// ==========================================
async function checkParticleAnswer(selectedParticle, targetParticle, idx, explanation, fullSentence) {
    const btn = document.getElementById(`part-opt-${idx}`);
    const blankSlot = document.getElementById('particle-blank-slot');
    const aiText = document.getElementById('ai-coach-feedback');

    if (blankSlot) blankSlot.innerText = ` ${selectedParticle} `;
    
    // 🔥 DYNAMIC COMPARISON
    const cleanSelected = String(selectedParticle).trim();
    const cleanTarget = String(targetParticle).trim();
    const isCorrect = (cleanSelected === cleanTarget);

    if (isCorrect) {
        btn.classList.add('option-correct');
        if (blankSlot) { blankSlot.style.color = '#22c55e'; blankSlot.style.borderColor = '#22c55e'; }
        playAudioPromptText(fullSentence);
        recordSandboxSuccess(); 
        trackUserAnswer(true);
    } else {
        btn.classList.add('option-incorrect');
        if (blankSlot) { blankSlot.style.color = '#ef4444'; blankSlot.style.borderColor = '#ef4444'; }
        triggerLifeLoss(); // ❤️ Deduct life on error
        trackUserAnswer(false, 'Particle-Selection-Error', cleanSelected, cleanTarget);
    }

    aiText.innerHTML = `<span style="color: ${isCorrect ? '#22c55e' : '#ef4444'}; font-weight: 700;">${isCorrect ? '✅ Correct Particle 「' + cleanSelected + '」!' : '❌ Incorrect. You selected 「' + cleanSelected + '」, but target was 「' + cleanTarget + '」'}</span><br>${explanation}`;
}

function syncTypedSentence(val) {
    const dropzone = document.getElementById('dropzone-area');
    if (val.trim().length > 0) dropzone.innerHTML = `<span class="dropped-tile-item">${val}</span>`;
    else dropzone.innerHTML = `<span style="color: #64748b; font-size: 0.8rem; font-style: italic;">Clicked tiles appear here...</span>`;
}

async function verifySentence(targetSentence) {
    const inputVal = document.getElementById('direct-sentence-input')?.value.trim() || '';
    const builtVal = builtSentenceTiles.join(' ').replace(/[。]/g, '').trim();
    const cleanTarget = targetSentence.replace(/[。]/g, '').trim();
    const cleanInput = inputVal.replace(/[。]/g, '').trim();
    const aiText = document.getElementById('ai-coach-feedback');

    const isMatch = (cleanInput === cleanTarget || builtVal === cleanTarget || cleanInput.replace(/\s+/g, '') === cleanTarget.replace(/\s+/g, '') || builtVal.replace(/\s+/g, '') === cleanTarget.replace(/\s+/g, ''));

    if (isMatch) {
        playAudioPromptText(targetSentence);
        recordSandboxSuccess();
        trackUserAnswer(true); 
    } else {
        triggerLifeLoss(); // ❤️ Deduct life on error
        trackUserAnswer(false, 'Sentence-Structure-Error', builtVal || cleanInput, cleanTarget); 
    }

    aiText.innerHTML = isMatch 
        ? `<span style="color: #22c55e; font-weight: 700;">✅ Correct Sentence Structure!</span><br>Matches SOV word order: <strong>${targetSentence}</strong>`
        : `<span style="color: #ef4444; font-weight: 700;">❌ Word Order Mismatch</span><br>Expected: "<strong>${cleanTarget}</strong>"`;
}

function checkMultipleChoiceAnswer(selectedIdx, correctIdx, explanation) {
    const clickedBtn = event.target;
    const aiText = document.getElementById('ai-coach-feedback');
    const isCorrect = (selectedIdx === correctIdx);

    if (isCorrect) {
        clickedBtn.classList.add('option-correct');
        aiText.innerHTML = `<span style="color: #22c55e; font-weight: 700;">✅ Correct!</span><br>${explanation}`;
        recordSandboxSuccess(); 
        trackUserAnswer(true); 
    } else {
        clickedBtn.classList.add('option-incorrect');
        aiText.innerHTML = `<span style="color: #ef4444; font-weight: 700;">❌ Incorrect</span><br>${explanation}`;
        triggerLifeLoss(); // ❤️ Deduct life on error
        trackUserAnswer(false, 'Multiple-Choice-Error', `Option Index: ${selectedIdx}`, `Correct Index: ${correctIdx}`); 
    }
}

async function askGeminiSensei() {
    const input = document.getElementById('ai-user-ask-input');
    const question = input.value.trim();
    if (!question) return;

    const aiText = document.getElementById('ai-coach-feedback');
    aiText.innerHTML = `⏳ <em>Shoyo-Kun is thinking...</em>`;
    input.value = '';

    const currentQ = currentFetchedModule?.questions[currentQuestionIndex];
    const currentContext = currentQ ? (currentQ.prompt || currentQ.meaning || currentQ.word || currentQ.targetSentence || currentFetchedModule.title) : 'JLPT N5 Practice';

    try {
        const res = await fetch('/api/sandbox/ask-tutor', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, context: currentContext })
        });
        const data = await res.json();
        if (data && data.reply) aiText.innerHTML = `<strong>🧑‍🏫 Shoyo-Kun says:</strong><br>${data.reply}`;
        else aiText.innerText = "Shoyo-Kun: Let's keep practicing!";
    } catch (err) {
        aiText.innerText = "Shoyo-Kun connection error. Please try again.";
    }
}

function startVoiceChallenge(targetLine) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        document.getElementById('voice-status').innerText = "Speech recognition unsupported. Use Chrome.";
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;

    const statusEl = document.getElementById('voice-status');
    const recognizedEl = document.getElementById('voice-recognized-text');
    const aiText = document.getElementById('ai-coach-feedback');

    if (statusEl) statusEl.innerText = "Listening... Speak now 🎤";

    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        if (recognizedEl) recognizedEl.innerText = transcript;
        const spokenClean = transcript.trim().replace(/[\s☕、.!?]/g, '');
        if (spokenClean.length > 0) {
            aiText.innerHTML = `<span style="color: #22c55e; font-weight: 700;">✅ Voice Evaluated!</span><br>Spoken line: "${transcript}"`;
            recordSandboxSuccess();
        }
    };
    recognition.onerror = function(event) { if (statusEl) statusEl.innerText = "Mic error: " + event.error; };
    recognition.start();
}

function advanceNextQuestion() {
    const data = currentFetchedModule;
    if (currentQuestionIndex < data.questions.length - 1) {
        currentQuestionIndex++;
        builtSentenceTiles = [];
        renderCurrentQuestion();
    } else {
        closeLessonModal();
    }
}

function addTile(t) { playAudioPromptText(t); builtSentenceTiles.push(t.replace(/[。]/g, '')); renderCurrentQuestion(); }
function removeTile(i) { builtSentenceTiles.splice(i, 1); renderCurrentQuestion(); }
function clearTiles() { builtSentenceTiles = []; renderCurrentQuestion(); }
function closeLessonModal() { document.getElementById('practiceModal').style.display = 'none'; }

function playAudioPromptText(customText) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(customText || activeAudioPromptText);
        utterance.lang = 'ja-JP'; utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

// ==========================================
// 🚀 UNIVERSAL ATTEMPT & ERROR TRACKER
// ==========================================
function trackUserAnswer(isCorrect, errorType, userInput, expectedValue) {
    const userId = getCurrentUserId();

    fetch('/api/user/practice-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId,
            isCorrect: isCorrect,
            errorType: errorType || 'General-Error',
            userInput: userInput || '',
            expectedValue: expectedValue || ''
        })
    }).catch(err => console.error('Practice attempt log failed:', err));

    if (!isCorrect) {
        logUserMistake(errorType, userInput, expectedValue);
    }
}

function logUserMistake(errorTag, userSentence, expectedSentence) {
    const userId = getCurrentUserId();
    fetch('/api/analytics/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId,
            errorTag: errorTag || 'General-Particle-Error',
            userSentence: userSentence || '',
            expectedSentence: expectedSentence || ''
        })
    })
    .then(res => res.json())
    .then(data => console.log('Error logged to Supabase successfully:', data))
    .catch(err => console.error('Failed to log error:', err));
}

// ==========================================
// 5. GRAMMAR NOTES FETCH HANDLER
// ==========================================
async function fetchContextGrammarNotes() {
    const notesBox = document.getElementById('dynamic-grammar-notes');
    if (!notesBox) return;

    notesBox.style.display = 'block';
    notesBox.innerHTML = "⏳ <em>Fetching exhaustive particle breakdown from Shoyo-Kun...</em>";

    const currentQ = currentFetchedModule?.questions[currentQuestionIndex];
    const topic = currentFetchedModule?.title || "JLPT N5 Grammar";
    
    let targetSentence = "";
    if (currentQ) {
        if (currentQ.targetSentence) {
            targetSentence = currentQ.targetSentence;
        } else if (currentQ.before && currentQ.targetParticle && currentQ.after) {
            targetSentence = `${currentQ.before} [${currentQ.targetParticle}] ${currentQ.after}`;
        } else {
            targetSentence = currentQ.prompt || currentQ.word || currentQ.phrase || "";
        }
    }

    try {
        const res = await fetch('/api/sandbox/grammar-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetTopic: topic, targetSentence: targetSentence })
        });

        const data = await res.json();
        if (data && data.success && data.notes) {
            let cleanNotes = data.notes.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\|/g, ' - ');
            notesBox.innerHTML = `<strong>📚 Detailed Linguistic & Particle Breakdown:</strong><br><br>${cleanNotes.replace(/\n/g, '<br>')}`;
        } else {
            notesBox.innerHTML = "⚠️ Server returned an empty response. Please check terminal logs.";
        }
    } catch (err) {
        console.error("Fetch error:", err);
        notesBox.innerHTML = "❌ Failed to connect to backend AI server.";
    }
}

function playFullScriptAudio() { playAudioPromptText(); }
function openNotifications() { alert("🔔 No unread notifications."); }
function goToSettings() { window.location.href = 'settings.html'; }

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Setup failed: ', err));
    });
}

// ==========================================
// ❤️ LIVES DEDUCTION & GAME OVER MODAL
// ==========================================
function triggerLifeLoss() {
    const userId = getCurrentUserId();
    fetch('/api/user/lose-life', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.querySelectorAll('#user-lives, .user-lives-display').forEach(el => {
                if (el) el.innerText = data.lives;
            });
            globalDatabaseSync(); // Insta-sync timer
            
            if (data.lives <= 0) {
                const path = window.location.pathname.toLowerCase();
                // 🚀 STRICT CHECK: MODAL WILL ONLY SHOW ON THESE 3 PAGES (Conversation EXCLUDED)
                if (path.includes('drills') || path.includes('sandbox') || path.includes('exam')) {
                    triggerGameOverModal();
                }
            }
        }
    }).catch(err => console.error('Failed to deduct life:', err));
}

function triggerGameOverModal() {
    if (document.getElementById('gameOverModal')) return;
    const modalHTML = `
        <div id="gameOverModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(8px);">
            <div style="background: #151e33; border: 1px solid var(--border-color); border-radius: 20px; padding: 2.5rem; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💔</div>
                <h2 style="color: white; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Out of Lives!</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">You've run out of lives. Wait for a 30-minute cooldown or return to the dashboard.</p>
                <button onclick="window.location.href='index.html'" style="background: var(--accent-indigo); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; width: 100%; cursor: pointer;">Return to Dashboard 🏠</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Function to check progress and unlock locked sidebar links automatically
async function checkAndUnlockFeatures(userId) {
    try {
        const res = await fetch(`/api/user/progress?userId=${userId}`);
        const data = await res.json();
        
        if (data && (data.total_correct > 0 || data.lessons_completed > 0 || data.study_time_minutes > 0)) {
            // 1. Sandbox unlock karo
            const sandboxLink = document.getElementById('link-sandbox');
            if (sandboxLink) {
                sandboxLink.classList.remove('locked');
                sandboxLink.href = 'sandbox.html';
                sandboxLink.innerHTML = '🧩 Sandbox';
                sandboxLink.removeAttribute('title');
            }

            // 2. Exams unlock karo
            const examLink = document.getElementById('link-exam');
            if (examLink) {
                examLink.classList.remove('locked');
                examLink.href = 'exam.html';
                examLink.innerHTML = '📝 Exams';
                examLink.removeAttribute('title');
            }

            // 3. Analytics unlock karo agar locked hai
            const analyticsLink = document.getElementById('link-analytics');
            if (analyticsLink) {
                analyticsLink.classList.remove('locked');
            }
        }
    } catch (e) {
        console.error("Feature unlock check failed:", e);
    }
}