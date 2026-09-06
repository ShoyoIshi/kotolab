// ============================================================================
// KotoLab Master Client Script — Character Drills (js/drills.js)
// Sections, Script History Info (Ultra-Simple Style), Freeze Fix & Etymology
// ============================================================================

let currentCategory = 'hiragana';
let currentDrillItems = [];
let currentItemIndex = 0;
let currentItem = null;

let writer = null;
let sessionTimer = null;
let practiceCount = 0;
let completedCount = 0;
let totalSessionItems = 20;
let timeRemaining = 300;
let isTimerPaused = false; 

let kanaCanvas = null;
let kanaCtx = null;
let isDrawing = false;
let currentLoadedSvgStrokes = [];
let strokesDrawnInCurrentAttempt = 0;
let currentStrokePath = []; 

// Ultra-Simple Script Backgrounds
const scriptHistories = {
    hiragana: `<strong>Hiragana (ひらがな)</strong> is the first Japanese alphabet that kids learn! Think of it like smooth, round, and friendly letters. Long ago, people wanted an easy way to write everyday Japanese words quickly. So, they made these soft, curvy shapes. We use Hiragana for normal Japanese words and daily talk!`,
    katakana: `<strong>Katakana (カタカナ)</strong> is the second Japanese alphabet. While Hiragana is round and soft, Katakana is made of sharp, straight, and strong lines! Long ago, Japanese monks used small pieces of Chinese characters as a quick shortcut to take notes. Today, we use Katakana for fun foreign words like ice cream (アイスクリーム), computer (コンピュータ), and animal names!`,
    kanji: `<strong>Kanji (漢字)</strong> are picture-words borrowed from China a long time ago! Instead of just sounds, every Kanji picture tells a whole story or meaning. For example, the picture for a tree looks like a real tree (木), and a mountain looks like three peaks (山). Learning them is like solving a puzzle!`
};

const compoundMap = {
    '一': [ { word: '一人', reading: 'ひとり', meaning: 'one person' }, { word: '一月', reading: 'いちがつ', meaning: 'January' } ],
    'が': [ { word: '学生', reading: 'がくせい', meaning: 'student' } ],
    'パ': [ { word: 'パン', reading: 'ぱん', meaning: 'bread' } ],
    'っ': [ { word: '切手', reading: 'きって', meaning: 'stamp' } ],
    'ー': [ { word: 'コーヒー', reading: 'こーひー', meaning: 'coffee' } ]
};

function cleanString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\(\s*\)/g, '').replace(/[\(\)]/g, '').replace(/\s+/g, ' ').trim();
}

function getUnicodeHex(char) {
    if (!char) return '03042';
    if (char.length > 1) return '03042'; 
    return char.charCodeAt(0).toString(16).padStart(5, '0');
}

function isKanjiCharacter(char) {
    return /[\u4e00-\u9faf]/.test(char);
}

// ============================================================================
// 🔥 SCRIPT HISTORY MODAL
// ============================================================================
function openScriptHistoryModal() {
    const modal = document.getElementById('script-history-modal');
    const content = document.getElementById('script-history-content');
    const title = document.getElementById('script-history-title');
    
    if (modal && content && title) {
        title.innerText = `📖 ${currentCategory.toUpperCase()} - Fun Story`;
        content.innerHTML = scriptHistories[currentCategory] || scriptHistories['hiragana'];
        modal.style.display = 'flex';
    }
}

function closeScriptHistoryModal() {
    const modal = document.getElementById('script-history-modal');
    if (modal) modal.style.display = 'none';
}

// ============================================================================
// 🔥 VIEW TOGGLE LOGIC
// ============================================================================
function showIntroCard() {
    const introCard = document.getElementById('introCardView');
    const canvasView = document.getElementById('canvasPracticeView');
    if (introCard) introCard.style.display = 'flex';
    if (canvasView) canvasView.style.display = 'none';
    isTimerPaused = true;
}

function startPractice() {
    const introCard = document.getElementById('introCardView');
    const canvasView = document.getElementById('canvasPracticeView');
    
    if (introCard) introCard.style.display = 'none';
    if (canvasView) {
        canvasView.style.display = 'flex';
        void canvasView.offsetWidth; 
    }

    setTimeout(() => {
        if (currentItem) { initInteractiveCanvas(currentItem); }
    }, 50);
    
    isTimerPaused = false;
    startModalTimer();
}

function toggleTimerPause() {
    isTimerPaused = !isTimerPaused;
    const timerElem = document.getElementById('modal-timer');
    if (timerElem) {
        if (isTimerPaused) {
            timerElem.style.color = '#ef4444';
            timerElem.innerText = timerElem.innerText.replace(' (Paused)', '') + ' (Paused)';
        } else {
            timerElem.style.color = '#f97316';
            timerElem.innerText = timerElem.innerText.replace(' (Paused)', '');
        }
    }
}

// ============================================================================
// DATA FETCHING & PROGRESS
// ============================================================================
function getUserProgress() {
    const user = localStorage.getItem('kotolab_username') || 'User';
    const stored = localStorage.getItem(`kotolab_progress_${user}`);
    let userObj = {};
    if (stored) { try { userObj = JSON.parse(stored); } catch (e) {} }
    const defaultData = { characters: {}, totalCorrect: 0 };
    const merged = { ...defaultData, ...userObj };
    localStorage.setItem(`kotolab_progress_${user}`, JSON.stringify(merged));
    return merged;
}

function incrementUserCharacterProgress(char, category) {
    const user = localStorage.getItem('kotolab_username') || 'User';
    let progress = getUserProgress();
    const currentScore = progress.characters[char] || 0;
    const newScore = Math.min(100, Math.round((currentScore + 2.5) * 10) / 10);
    progress.characters[char] = newScore;
    progress.totalCorrect = (Number(progress.totalCorrect) || 0) + 1;
    localStorage.setItem(`kotolab_progress_${user}`, JSON.stringify(progress));
    return newScore;
}

function decrementUserCharacterProgress(char, category) {
    const user = localStorage.getItem('kotolab_username') || 'User';
    let progress = getUserProgress();
    const currentScore = progress.characters[char] || 0;
    const newScore = Math.max(0, Math.round((currentScore - 2.5) * 10) / 10);
    progress.characters[char] = newScore;
    localStorage.setItem(`kotolab_progress_${user}`, JSON.stringify(progress));
    return newScore;
}

const drillsCache = {};

function loadCategoryDrills(category) {
    currentCategory = category;
    const grid = document.getElementById('drills-grid');
    if (!grid) return;

    ['hiragana', 'katakana', 'kanji'].forEach(cat => {
        const btn = document.getElementById(`tab-${cat}`);
        if (btn) {
            btn.style.background = (cat === category) ? '#4f46e5' : '#151e33';
            btn.style.color = (cat === category) ? '#ffffff' : '#94a3b8';
        }
    });

    if (drillsCache[category] && drillsCache[category].length > 0) {
        currentDrillItems = drillsCache[category];
        renderDrillCards(currentDrillItems);
        return;
    }

    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">⚡ Loading ${category} drills...</div>`;

    fetch(`/api/drills/${category}`)
        .then(res => res.json())
        .then(items => {
            const finalItems = items && items.length > 0 ? items : [];
            drillsCache[category] = finalItems;
            currentDrillItems = finalItems;
            renderDrillCards(currentDrillItems);
        })
        .catch(() => {
            drillsCache[category] = [];
            currentDrillItems = [];
            renderDrillCards([]);
        });
}

document.addEventListener('DOMContentLoaded', () => { loadCategoryDrills('hiragana'); });

// ============================================================================
// SECTION-WISE GRID RENDERER
// ============================================================================
function renderDrillCards(items) {
    const grid = document.getElementById('drills-grid');
    if (!grid || !items) return;
    const userProgress = getUserProgress();

    if (items.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">No drills found for this category.</div>`;
        return;
    }

    const groups = {};
    items.forEach((item, originalIndex) => {
        const gName = item.group || 'general';
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push({ item, originalIndex });
    });

    const groupTitles = {
        'vowels': '📌 Vowels',
        'ka-row': '📌 Ka Row',
        'sa-row': '📌 Sa Row',
        'ta-row': '📌 Ta Row',
        'na-row': '📌 Na Row',
        'ha-row': '📌 Ha Row',
        'ma-row': '📌 Ma Row',
        'ya-row': '📌 Ya Row',
        'ra-row': '📌 Ra Row',
        'wa-row': '📌 Wa Row / N',
        'n-row': '📌 N Row',
        'dakuten': '⚡ Dakuten (Voiced Variants -゛)',
        'handakuten': '⭕ Handakuten (Semi-Voiced -゜)',
        'combos': '🔠 Combos (Yoon - 小さいや、ゆ、よ)',
        'small_tsu': '⏱️ Special (Small Tsu / Long Vowels)',
        'long_vowel': '⏱️ Special (Small Tsu / Long Vowels)',
        'general': '📖 Character Set'
    };

    let htmlOutput = '';

    for (const [groupKey, groupItems] of Object.entries(groups)) {
        const titleText = groupTitles[groupKey] || `📌 ${groupKey.toUpperCase()}`;
        
        htmlOutput += `
            <div style="grid-column: 1 / -1; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #263552; padding-bottom: 0.5rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 0.5rem;">
                    ${titleText} <span style="font-size: 0.75rem; background: #151e33; padding: 0.15rem 0.5rem; border-radius: 12px; color: #8fa0bd;">${groupItems.length} items</span>
                </h3>
            </div>
        `;

        groupItems.forEach(({ item, originalIndex }) => {
            const displayChar = item.literal || item.char || '?';
            const displayReading = cleanString(item.summaryReading || item.romaji || item.reading || item.onyomi || '');
            const charProgress = Math.round(userProgress.characters[displayChar] || 0);

            htmlOutput += `
                <div class="drill-card" onclick="openPracticeModal(${originalIndex})">
                    <div style="width: 100%; display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.25rem;">
                        <span>Mastery</span><span>${charProgress}%</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; margin-bottom: auto;">
                        <div style="width: ${charProgress}%; height: 100%; background: ${charProgress < 20 ? '#ef4444' : '#22c55e'};"></div>
                    </div>
                    <div class="char-text" style="margin-top: 0.5rem;">${displayChar}</div>
                    <div class="romaji-hint">${displayReading}</div>
                </div>
            `;
        });
    }

    grid.innerHTML = htmlOutput;
}

// ============================================================================
// 🔥 MODAL SETUP & ETYMOLOGY INTEGRATION
// ============================================================================
function openPracticeModal(index) {
    if (!currentDrillItems || !currentDrillItems[index]) return;

    if (writer) {
        try { writer.cancelQuiz(); } catch(e) {}
        writer = null;
    }
    const targetBox = document.getElementById('kanji-target');
    if (targetBox) targetBox.innerHTML = '';

    currentItemIndex = index;
    currentItem = currentDrillItems[index];
    const activeChar = currentItem.literal || currentItem.char || '?';
    const readStr = cleanString(currentItem.onyomi || currentItem.kunyomi || currentItem.romaji || currentItem.reading);
    
    practiceCount = 0;
    strokesDrawnInCurrentAttempt = 0;

    const modal = document.getElementById('practice-modal');
    if (!modal) return;

    const feedback = document.getElementById('modal-feedback-msg');
    if (feedback) {
        feedback.innerText = "Trace the character above!";
        feedback.style.color = '#a5b4fc';
    }

    const displayChar = document.getElementById('charDisplay');
    const displayRomaji = document.getElementById('charRomaji');
    const displayIntro = document.getElementById('charIntro');
    const displayHistory = document.getElementById('charHistory');
    
    if (displayChar) displayChar.innerText = activeChar;
    if (displayRomaji) displayRomaji.innerText = readStr;
    
    let introText = "Learn to trace this character accurately.";
    if (currentItem.intro) introText = currentItem.intro;
    else if (currentItem.tips && currentItem.tips.length > 0) introText = currentItem.tips[0];
    if (displayIntro) displayIntro.innerText = introText;

    let historyText = currentItem.history || currentItem.origin;
    if (!historyText) {
        if (isKanjiCharacter(activeChar)) {
            historyText = `This is a picture-word. Every part tells a small visual story!`;
        } else if (currentItem.type && currentItem.type.toLowerCase().includes('katakana')) {
            historyText = `Made of sharp lines, borrowed long ago as a quick shortcut.`;
        } else {
            historyText = `Smooth and curvy shape made for writing everyday words easily.`;
        }
    }
    if (displayHistory) displayHistory.innerText = `📜 Fun Fact: ${historyText}`;

    const title = document.getElementById('modal-char-title');
    const badge = document.getElementById('modal-category-badge');
    const meaning = document.getElementById('modal-meaning-text');
    const pron = document.getElementById('modal-pronunciation-text');
    const guideText = document.getElementById('guide-char-text');

    const isKanji = isKanjiCharacter(activeChar);
    const meanStr = cleanString(currentItem.meaning || currentItem.summaryMeaning);

    if (title) title.innerText = `Practice Writing: ${activeChar}` + (readStr ? ` (${readStr})` : '');
    if (badge) badge.innerText = isKanji ? `Kanji • Level N5` : (currentItem.type || currentCategory);
    if (meaning) meaning.innerText = meanStr || (isKanji ? 'Kanji Character Drill' : 'Kana Pronunciation Drill');
    if (pron) pron.innerText = `Pronunciation: ${readStr || activeChar}`;
    if (guideText) guideText.innerText = activeChar;

    renderCompoundWords(activeChar);

    timeRemaining = 300;
    isTimerPaused = true;
    const timerElem = document.getElementById('modal-timer');
    if (timerElem) {
        timerElem.innerText = '05:00';
        timerElem.style.color = '#f97316';
    }

    modal.style.display = 'flex';
    showIntroCard(); 
}

function closePracticeModal() {
    const modal = document.getElementById('practice-modal');
    if (modal) modal.style.display = 'none';
    if (sessionTimer) clearInterval(sessionTimer);
    
    if (writer && typeof writer.cancelQuiz === 'function') {
        try { writer.cancelQuiz(); } catch(e) {}
    }
    writer = null;
    
    const target = document.getElementById('kanji-target');
    if (target) target.innerHTML = '';
}

// ============================================================================
// CANVAS & STROKE RENDERER
// ============================================================================
async function initInteractiveCanvas(item) {
    const target = document.getElementById('kanji-target');
    if (!target) return;
    target.innerHTML = '';

    const activeChar = item.literal || item.char || '?';
    const isKanji = isKanjiCharacter(activeChar);
    let hanziWriterSuccess = false;

    if (isKanji && window.HanziWriter) {
        try {
            const parentWidth = target.parentElement.clientWidth || 200;
            const parentHeight = target.parentElement.clientHeight || 200;
            
            writer = HanziWriter.create('kanji-target', activeChar.charAt(0), {
                width: parentWidth, height: parentHeight, padding: 10,
                showOutline: true, strokeAnimationSpeed: 1.2,
                delayBetweenStrokes: 150, strokeColor: '#38bdf8',
                outlineColor: 'rgba(255, 255, 255, 0.15)', drawingColor: '#22c55e'
            });
            
            writer.animateCharacter();

            // ❤️ ADDED QUIZ LOGIC FOR HANZI WRITER
            writer.quiz({
                onMistake: function(strokeData) {
                    console.log("Mistake made during drawing!");
                    if (typeof triggerLifeLoss === 'function') triggerLifeLoss();
                },
                onComplete: function(summaryData) {
                    updateFeedbackAndAccuracy();
                }
            });

            hanziWriterSuccess = true;

            const targetStrokes = item.strokeCount || item.stroke_count || 4;
            renderStrokeOrderColumn({
                strokes: Array.from({ length: targetStrokes }, (_, i) => ({
                    name: `Stroke ${i + 1}`, desc: i === 0 ? "First stroke" : "Connecting stroke"
                }))
            });
        } catch (e) {
            hanziWriterSuccess = false;
        }
    }

    if (!hanziWriterSuccess) {
        await setupKanaReferenceSvg(item);
    }
    setupUserPracticeCanvas();
}

async function setupKanaReferenceSvg(item) {
    writer = null;
    const target = document.getElementById('kanji-target');
    if (!target) return;

    const activeChar = item.literal || item.char || '?';
    
    if (activeChar.length > 1) {
        renderStrokeOrderColumn({ 
            strokes: [
                { name: "Stroke 1", desc: "First character part" }, 
                { name: "Stroke 2", desc: "Second character part" }
            ] 
        });
        target.innerHTML = `<div style="font-size: 80px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: center; height: 100%;">${activeChar}</div>`;
        return;
    }

    const hex = getUnicodeHex(activeChar);
    const url = `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg/kanji/${hex}.svg`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('KanjiVG fetch failed');
        const svgText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = Array.from(doc.querySelectorAll('path')).filter(p => !p.id.includes('StrokeNumbers'));

        currentLoadedSvgStrokes = paths.map((pathEl, idx) => ({
            index: idx, d: pathEl.getAttribute('d'), name: `Stroke ${idx + 1}`,
            desc: idx === 0 ? "First stroke" : "Connecting stroke"
        }));

        renderStrokeOrderColumn({ strokes: currentLoadedSvgStrokes });

        let ghostPaths = '', animPaths = '';
        currentLoadedSvgStrokes.forEach((s, idx) => {
            ghostPaths += `<path d="${s.d}" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
            animPaths += `<path id="kana-stroke-${idx}" d="${s.d}" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="400" stroke-dashoffset="400" style="transition: stroke-dashoffset 1.5s ease-in-out;"/>`;
        });

        target.innerHTML = `<svg viewBox="0 0 109 109" style="width: 100%; height: 100%;"><g>${ghostPaths}${animPaths}</g></svg>`;
        setTimeout(animateKanaSequentialStrokes, 100);

    } catch (e) {
        renderStrokeOrderColumn({ strokes: [{ name: "Stroke 1", desc: "Top/Left stroke" }, { name: "Stroke 2", desc: "Base stroke" }] });
        target.innerHTML = `<div style="font-size: 110px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: center; height: 100%;">${activeChar}</div>`;
    }
}

function setupUserPracticeCanvas() {
    kanaCanvas = document.getElementById('kana-canvas');
    if (!kanaCanvas) return;
    kanaCtx = kanaCanvas.getContext('2d');

    const rect = kanaCanvas.getBoundingClientRect();
    kanaCanvas.width = rect.width > 0 ? rect.width : 380;
    kanaCanvas.height = rect.height > 0 ? rect.height : 220;

    kanaCtx.strokeStyle = '#22c55e';
    kanaCtx.lineWidth = 9;
    kanaCtx.lineCap = 'round';
    kanaCtx.lineJoin = 'round';

    strokesDrawnInCurrentAttempt = 0;
    addCanvasDrawingListeners(kanaCanvas);
}

function handleIncorrectStroke() {
    const feedback = document.getElementById('modal-feedback-msg');
    if (feedback) {
        feedback.innerText = "❌ Incorrect! Do not scribble outside bounds. Mastery -2.5%";
        feedback.style.color = '#ef4444'; 
    }

    if (kanaCanvas) {
        kanaCanvas.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        setTimeout(() => { kanaCanvas.style.backgroundColor = 'transparent'; }, 400);
    }

    // ❤️ LIFE MINUS LOGIC TRIGGER FOR CUSTOM CANVAS
    if (typeof triggerLifeLoss === 'function') {
        triggerLifeLoss();
    }

    if (currentItem) {
        const activeChar = currentItem.literal || currentItem.char;
        const updatedScore = decrementUserCharacterProgress(activeChar, currentCategory);
        
        try {
            const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : 3; 
            fetch('/api/drills/mastery', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, characterId: activeChar, accuracy: updatedScore })
            }).catch(() => {});
        } catch (err) {}
        
        renderDrillCards(currentDrillItems);
    }

    strokesDrawnInCurrentAttempt = 0;
    if (kanaCtx && kanaCanvas) kanaCtx.clearRect(0, 0, kanaCanvas.width, kanaCanvas.height);
}

function addCanvasDrawingListeners(cvs) {
    isDrawing = false;

    cvs.onmousedown = null; cvs.onmousemove = null; cvs.onmouseup = null; cvs.onmouseleave = null;
    cvs.ontouchstart = null; cvs.ontouchmove = null; cvs.ontouchend = null;

    function getPos(e) {
        const rect = cvs.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        if (e.cancelable) e.preventDefault();
        isDrawing = true; 
        const pos = getPos(e); 
        currentStrokePath = [pos]; 
        kanaCtx.beginPath(); 
        kanaCtx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (!isDrawing) return; 
        if (e.cancelable) e.preventDefault();
        const pos = getPos(e); 
        currentStrokePath.push(pos); 
        kanaCtx.lineTo(pos.x, pos.y); 
        kanaCtx.stroke();
    }

    function stopDraw(e) {
        if (isDrawing) {
            isDrawing = false;

            let pathLength = 0;
            let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;

            for (let i = 0; i < currentStrokePath.length; i++) {
                let p = currentStrokePath[i];
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;

                if (i > 0) {
                    let prev = currentStrokePath[i - 1];
                    pathLength += Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
                }
            }

            if (pathLength < 10) return;

            if (pathLength > 450 || minX < 20 || maxX > 360 || minY < 10 || maxY > 210) {
                handleIncorrectStroke();
                return; 
            }

            strokesDrawnInCurrentAttempt++;

            const targetStrokeCount = (currentLoadedSvgStrokes && currentLoadedSvgStrokes.length > 0) 
                ? currentLoadedSvgStrokes.length : (currentItem ? (currentItem.strokeCount || currentItem.stroke_count || 2) : 2);

            if (strokesDrawnInCurrentAttempt >= targetStrokeCount) {
                practiceCount++; 
                strokesDrawnInCurrentAttempt = 0; 
                updateFeedbackAndAccuracy();
            }
        }
    }

    cvs.addEventListener('mousedown', startDraw);
    cvs.addEventListener('mousemove', draw);
    cvs.addEventListener('mouseup', stopDraw);
    cvs.addEventListener('mouseleave', stopDraw);
    cvs.addEventListener('touchstart', startDraw, { passive: false });
    cvs.addEventListener('touchmove', draw, { passive: false });
    cvs.addEventListener('touchend', stopDraw);
}

// ============================================================================
// HELPERS & UI UPDATES
// ============================================================================
function renderStrokeOrderColumn(strokeData) {
    const strokeList = document.getElementById('modal-stroke-list');
    const tipsList = document.getElementById('modal-tips-list');
    
    if (strokeList && strokeData && strokeData.strokes) {
        strokeList.innerHTML = strokeData.strokes.map((s, idx) => `
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.4rem 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="width: 20px; height: 20px; background: #4f46e5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800;">${idx + 1}</span>
                    <div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: white;">${s.name}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">${s.desc}</div>
                    </div>
                </div>
                <button class="weak-btn" style="padding: 0.2rem 0.4rem; font-size: 0.65rem;" onclick="playSingleStrokeAnimation(${idx})">▶</button>
            </div>
        `).join('');
    }

    if (tipsList) {
        const strokesLen = strokeData && strokeData.strokes ? strokeData.strokes.length : 2;
        tipsList.innerHTML = `
            <li style="margin-bottom: 4px;">Total Strokes: <strong style="color:white;">${strokesLen}</strong></li>
            <li>Follow natural top-to-bottom order.</li>
        `;
    }
}

function renderCompoundWords(charStr) {
    const compList = document.getElementById('modal-compound-list');
    if (!compList) return;

    let compounds = [];
    if (currentItem && currentItem.compounds && currentItem.compounds.length > 0) {
        compounds = currentItem.compounds;
    } else if (compoundMap[charStr] && compoundMap[charStr].length > 0) {
        compounds = compoundMap[charStr];
    } else {
        compounds = [
            { word: `${charStr}め`, reading: `me`, meaning: `Noun pairing` },
            { word: `お${charStr}`, reading: `o`, meaning: `Prefix form` }
        ];
    }

    compList.innerHTML = compounds.map(c => `
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.4rem 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #38bdf8; font-size: 0.8rem;">${c.word}</strong>
                <button class="weak-btn" style="padding: 0.15rem 0.35rem; font-size: 0.6rem;" onclick="speakJapanese('${c.word}')">🔊</button>
            </div>
            <div style="font-size: 0.7rem; color: #94a3b8;">${c.meaning}</div>
        </div>
    `).join('');
}

function playStrokeDemo() {
    if (writer && typeof writer.animateCharacter === 'function') {
        writer.animateCharacter();
    } else {
        animateKanaSequentialStrokes();
    }
}

function animateKanaSequentialStrokes() {
    if (!currentLoadedSvgStrokes || currentLoadedSvgStrokes.length === 0) return;
    currentLoadedSvgStrokes.forEach((_, i) => {
        const path = document.getElementById(`kana-stroke-${i}`);
        if (path) { path.style.transition = 'none'; path.style.strokeDashoffset = '400'; }
    });
    let idx = 0;
    function next() {
        if (idx >= currentLoadedSvgStrokes.length) return;
        const path = document.getElementById(`kana-stroke-${idx}`);
        if (path) { path.style.transition = 'stroke-dashoffset 1.5s ease-in-out'; path.style.strokeDashoffset = '0'; }
        idx++;
        setTimeout(next, 1600);
    }
    setTimeout(next, 100);
}

function playSingleStrokeAnimation(idx) {
    const path = document.getElementById(`kana-stroke-${idx}`);
    if (path) {
        path.style.transition = 'none'; path.style.strokeDashoffset = '400';
        setTimeout(() => { path.style.transition = 'stroke-dashoffset 1.2s ease-in-out'; path.style.strokeDashoffset = '0'; }, 50);
    }
}

function loadNextCharacter() {
    completedCount++;
    const sessCount = document.getElementById('modal-session-count');
    const sessProgress = document.getElementById('modal-session-progress');
    const feedback = document.getElementById('modal-feedback-msg');

    if (sessCount) sessCount.innerText = `${completedCount} / ${totalSessionItems}`;
    if (sessProgress) sessProgress.style.width = `${(completedCount / totalSessionItems) * 100}%`;
    
    if (feedback) {
        feedback.innerText = `Trace the character above!`;
        feedback.style.color = '#a5b4fc';
    }

    const nextIdx = (currentItemIndex + 1) % currentDrillItems.length;
    openPracticeModal(nextIdx);
}

function speakJapanese(text) {
    if ('speechSynthesis' in window && text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

function speakCurrentCharacter() {
    if (currentItem) speakJapanese(currentItem.literal || currentItem.char);
}

function speakAllCompounds() { speakCurrentCharacter(); }

function resetStrokePractice() {
    strokesDrawnInCurrentAttempt = 0;
    if (kanaCtx && kanaCanvas) kanaCtx.clearRect(0, 0, kanaCanvas.width, kanaCanvas.height);
    const feedback = document.getElementById('modal-feedback-msg');
    if (feedback && feedback.innerText.includes('Incorrect')) {
        feedback.innerText = "Trace the character above!";
        feedback.style.color = '#a5b4fc';
    }
}

function updateFeedbackAndAccuracy() {
    const feedback = document.getElementById('modal-feedback-msg');
    if (currentItem) {
        const activeChar = currentItem.literal || currentItem.char;
        const updatedScore = incrementUserCharacterProgress(activeChar, currentCategory);
        
        if (feedback) {
            feedback.innerText = `Full Character Completed! Mastery: ${updatedScore}% (+2.5%) 🎉`;
            feedback.style.color = '#4ade80'; 
        }
        
        try {
            const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : 3; 
            fetch('/api/drills/mastery', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, characterId: activeChar, accuracy: updatedScore })
            }).catch(() => {});
        } catch (err) {}
        
        setTimeout(() => {
            renderDrillCards(currentDrillItems);
        }, 10);
    }
}

function startModalTimer() {
    if (sessionTimer) clearInterval(sessionTimer);
    sessionTimer = setInterval(() => {
        if (isTimerPaused) return; 
        timeRemaining--;
        const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const secs = String(timeRemaining % 60).padStart(2, '0');
        const timerElem = document.getElementById('modal-timer');
        if (timerElem) timerElem.innerText = `${mins}:${secs}`;
        if (timeRemaining <= 0) { clearInterval(sessionTimer); closePracticeModal(); }
    }, 1000);
}