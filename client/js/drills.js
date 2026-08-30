// ============================================================================
// KotoLab Master Client Script — Character Drills (js/drills.js)
// Unified Stroke Order Renderer (HanziWriter + KanjiVG SVG Engine)
// ============================================================================

// Global State
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

let kanaCanvas = null;
let kanaCtx = null;
let isDrawing = false;
let isGuidesVisible = true;
let currentLoadedSvgStrokes = [];
let strokesDrawnInCurrentAttempt = 0;

// Local Fallback Datasets
const fallbackDrillData = {
    hiragana: [
        { char: "あ", romaji: "a", reading: "a", type: "Hiragana", meaning: "hiragana 'a'", tips: ["Horizontal top stroke first", "Loop down and curve right"], compounds: [{ word: "あめ", reading: "ame", meaning: "Rain" }, { word: "あさ", reading: "asa", meaning: "Morning" }] },
        { char: "い", romaji: "i", reading: "i", type: "Hiragana", tips: ["Left stroke longer with a hook", "Right stroke shorter"], compounds: [{ word: "いぬ", reading: "inu", meaning: "Dog" }, { word: "いち", reading: "ichi", meaning: "One" }] },
        { char: "う", romaji: "u", reading: "u", type: "Hiragana", tips: ["Top short dot angled right", "Curved stroke below"], compounds: [{ word: "うみ", reading: "umi", meaning: "Sea" }, { word: "うた", reading: "uta", meaning: "Song" }] },
        { char: "え", romaji: "e", reading: "e", type: "Hiragana", tips: ["Top short stroke", "Z-shaped stroke underneath"], compounds: [{ word: "えき", reading: "eki", meaning: "Station" }, { word: "えん", reading: "en", meaning: "Yen" }] },
        { char: "お", romaji: "o", reading: "o", type: "Hiragana", tips: ["Horizontal line first", "Vertical loop down", "Top-right dot finish"], compounds: [{ word: "お茶", reading: "ocha", meaning: "Green Tea" }, { word: "男", reading: "otoko", meaning: "Man" }] }
    ],
    katakana: [
        { char: "ア", romaji: "a", reading: "a", type: "Katakana", tips: ["Top horizontal then curve left", "Vertical line angled right"], compounds: [{ word: "アメリカ", reading: "amerika", meaning: "America" }, { word: "アイス", reading: "aisu", meaning: "Ice Cream" }] },
        { char: "イ", romaji: "i", reading: "i", type: "Katakana", tips: ["Left slanting stroke first", "Vertical stroke right"], compounds: [{ word: "インク", reading: "inku", meaning: "Ink" }] },
        { char: "ウ", romaji: "u", reading: "u", type: "Katakana", tips: ["Top dot first", "Left short stroke", "Right hook stroke"], compounds: [{ word: "ウェブ", reading: "webu", meaning: "Web" }] },
        { char: "エ", romaji: "e", reading: "e", type: "Katakana", tips: ["Top horizontal", "Vertical stem", "Bottom horizontal"], compounds: [{ word: "エアコン", reading: "eakon", meaning: "Air Conditioner" }] },
        { char: "オ", romaji: "o", reading: "o", type: "Katakana", tips: ["Horizontal line", "Vertical line with left hook", "Diagonal stroke"], compounds: [{ word: "オフィス", reading: "ofisu", meaning: "Office" }] }
    ],
    kanji: [
        { char: "一", romaji: "ichi / itsu", onyomi: "イチ", kunyomi: "ひと", meaning: "one", stroke_count: 1, type: "Kanji • Level N5", tips: ["Single horizontal stroke left to right", "Keep firm and straight"], compounds: [{ word: "一人", reading: "ひとり", meaning: "one person" }, { word: "一月", reading: "いちがつ", meaning: "January" }] },
        { char: "二", romaji: "ni / futa", onyomi: "ニ", kunyomi: "ふた", meaning: "two", stroke_count: 2, type: "Kanji • Level N5", tips: ["Top shorter horizontal stroke", "Bottom longer horizontal stroke"], compounds: [{ word: "二人", reading: "ふたり", meaning: "two people" }, { word: "二月", reading: "にがつ", meaning: "February" }] },
        { char: "人", romaji: "hito / jin", onyomi: "ジン, ニン", kunyomi: "ひと", meaning: "person, human", stroke_count: 2, type: "Kanji • Level N5", tips: ["Left diagonal slash down first", "Right diagonal slash starting middle"], compounds: [{ word: "日本人", reading: "にほんじん", meaning: "Japanese person" }, { word: "大人", reading: "おとな", meaning: "adult" }] },
        { char: "日", romaji: "hi / nichi", onyomi: "ニチ, ジツ", kunyomi: "ひ, か", meaning: "sun, day", stroke_count: 4, type: "Kanji • Level N5", tips: ["Left vertical box side", "Top & right corner", "Middle line", "Close bottom"], compounds: [{ word: "日曜日", reading: "にちようび", meaning: "Sunday" }, { word: "毎日", reading: "まいにち", meaning: "every day" }] },
        { char: "月", romaji: "tsuki / getsu", onyomi: "ゲツ, ガツ", kunyomi: "つき", meaning: "moon, month", stroke_count: 4, type: "Kanji • Level N5", tips: ["Left curve stem", "Top-right hook box", "Two horizontal inner lines"], compounds: [{ word: "今月", reading: "こんげつ", meaning: "this month" }, { word: "月曜日", reading: "げつようび", meaning: "Monday" }] },
        { char: "水", romaji: "mizu / sui", onyomi: "スイ", kunyomi: "みず", meaning: "water", stroke_count: 4, type: "Kanji • Level N5", tips: ["Center vertical line with hook", "Left upper slash", "Left lower slash", "Right sweeping stroke"], compounds: [{ word: "水曜日", reading: "すいようび", meaning: "Wednesday" }, { word: "飲み水", reading: "のみみず", meaning: "drinking water" }] }
    ]
};

const compoundMap = {
    '一': [ { word: '一人', reading: 'ひとり', meaning: 'one person' }, { word: '一月', reading: 'いちがつ', meaning: 'January' } ],
    '二': [ { word: '二人', reading: 'ふたり', meaning: 'two people' }, { word: '二月', reading: 'にがつ', meaning: 'February' } ],
    '人': [ { word: '一人', reading: 'ひとり', meaning: 'one person' }, { word: '人々', reading: 'ひとびと', meaning: 'people' } ],
    '日': [ { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' }, { word: '毎日', reading: 'まいにち', meaning: 'every day' } ],
    '月': [ { word: '今月', reading: 'こんげつ', meaning: 'this month' }, { word: '月曜日', reading: 'げつようび', meaning: 'Monday' } ],
    '水': [ { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }, { word: '飲み水', reading: 'のみみず', meaning: 'drinking water' } ]
};

function cleanString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\(\s*\)/g, '').replace(/[\(\)]/g, '').replace(/\s+/g, ' ').trim();
}

function getUnicodeHex(char) {
    if (!char) return '03042';
    return char.charCodeAt(0).toString(16).padStart(5, '0');
}

function isKanjiCharacter(char) {
    return /[\u4e00-\u9faf]/.test(char);
}

// REPLACE getUserProgress function in js/drills.js
function getUserProgress() {
    const user = localStorage.getItem('kotolab_username') || 'User';
    const stored = localStorage.getItem(`kotolab_progress_${user}`);

    let userObj = {};
    if (stored) { try { userObj = JSON.parse(stored); } catch (e) {} }

    const defaultData = {
        overall: 0, sandbox: 0, drills: 0, exam: 0,
        lessonsCompleted: 0, overallAccuracy: 0, studyTimeMinutes: 0, totalCorrect: 0,
        hiraganaMastery: 0, katakanaMastery: 0, kanjiMastery: 0,
        characters: {} // Starts fresh at 0% for every character
    };

    const merged = { ...defaultData, ...userObj };
    localStorage.setItem(`kotolab_progress_${user}`, JSON.stringify(merged));
    return merged;
}

// UPDATED incrementUserCharacterProgress function for js/drills.js
function incrementUserCharacterProgress(char, category) {
    const user = localStorage.getItem('kotolab_username') || 'User';
    let progress = getUserProgress();

    const currentScore = progress.characters[char] || 0;
    const newScore = Math.min(100, Math.round((currentScore + 2.5) * 10) / 10);
    progress.characters[char] = newScore;
    progress.totalCorrect = (Number(progress.totalCorrect) || 0) + 1;

    localStorage.setItem(`kotolab_progress_${user}`, JSON.stringify(progress));

    // Correct Backend Route Call
    fetch('/api/user/update-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: getCurrentUserId(),
            category: category
        })
    }).catch(err => console.error("Failed to sync drill progress to DB:", err));

    return newScore;
}

// Global Cache for Drills to eliminate switching delay completely
const drillsCache = {};

function loadCategoryDrills(category) {
    currentCategory = category;
    const grid = document.getElementById('drills-grid');
    if (!grid) return;

    // Tab styling update
    ['hiragana', 'katakana', 'kanji'].forEach(cat => {
        const btn = document.getElementById(`tab-${cat}`);
        if (btn) {
            btn.style.background = (cat === category) ? 'var(--accent-purple, #4f46e5)' : 'var(--bg-card, #151e33)';
            btn.style.color = (cat === category) ? '#ffffff' : 'var(--text-muted, #94a3b8)';
        }
    });

    // 🚀 Check if already cached in memory -> Zero Delay!
    if (drillsCache[category] && drillsCache[category].length > 0) {
        currentDrillItems = drillsCache[category];
        renderDrillCards(currentDrillItems);
        return;
    }

    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">⚡ Loading ${category} drills...</div>`;

    fetch(`/api/drills/${category}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response not ok');
            return res.json();
        })
        .then(items => {
            const finalItems = items && items.length > 0 ? items : fallbackDrillData[category];
            drillsCache[category] = finalItems; // Store in memory cache
            currentDrillItems = finalItems;
            renderDrillCards(currentDrillItems);
        })
        .catch(() => {
            const fallback = fallbackDrillData[category] || fallbackDrillData.hiragana;
            drillsCache[category] = fallback;
            currentDrillItems = fallback;
            renderDrillCards(currentDrillItems);
        });
}

// Preload all categories in the background right when the page loads so tabs switch instantly
document.addEventListener('DOMContentLoaded', () => {
    loadCategoryDrills('hiragana');
    ['katakana', 'kanji'].forEach(cat => {
        fetch(`/api/drills/${cat}`)
            .then(res => res.json())
            .then(items => {
                if (items && items.length > 0) drillsCache[cat] = items;
            })
            .catch(() => {});
    });
});

function renderDrillCards(items) {
    const grid = document.getElementById('drills-grid');
    if (!grid || !items) return;

    const userProgress = getUserProgress();

    grid.innerHTML = items.map((item, index) => {
        const displayChar = item.char || '?';
        const displayReading = cleanString(item.summaryReading || item.romaji || item.reading || item.onyomi || '');
        const charProgress = Math.round(userProgress.characters[displayChar] || 0);

        return `
            <div class="drill-card" onclick="openPracticeModal(${index})">
                <div style="width: 100%; display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.25rem;">
                    <span>Mastery</span><span>${charProgress}%</span>
                </div>
                <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; margin-bottom: auto;">
                    <div style="width: ${charProgress}%; height: 100%; background: #22c55e;"></div>
                </div>

                <div class="char-text" style="margin-top: 0.5rem;">${displayChar}</div>
                <div class="romaji-hint">${displayReading}</div>
            </div>
        `;
    }).join('');
}

function openPracticeModal(index) {
    if (!currentDrillItems || !currentDrillItems[index]) return;

    currentItemIndex = index;
    currentItem = currentDrillItems[index];
    practiceCount = 0;
    strokesDrawnInCurrentAttempt = 0;

    const modal = document.getElementById('practice-modal');
    if (!modal) return;

    const title = document.getElementById('modal-char-title');
    const badge = document.getElementById('modal-category-badge');
    const meaning = document.getElementById('modal-meaning-text');
    const pron = document.getElementById('modal-pronunciation-text');
    const guideText = document.getElementById('guide-char-text');

    const isKanji = isKanjiCharacter(currentItem.char);
    const readStr = cleanString(currentItem.onyomi || currentItem.kunyomi || currentItem.romaji || currentItem.reading);
    const meanStr = cleanString(currentItem.meaning || currentItem.summaryMeaning);

    if (title) title.innerText = `Practice Writing: ${currentItem.char}` + (readStr ? ` (${readStr})` : '');
    if (badge) badge.innerText = isKanji ? `Kanji • Level N5` : (currentItem.type || currentCategory);
    if (meaning) meaning.innerText = meanStr || (isKanji ? 'Kanji Character Drill' : 'Kana Pronunciation Drill');
    if (pron) pron.innerText = `Pronunciation: ${readStr || currentItem.char}`;
    if (guideText) guideText.innerText = currentItem.char;

    modal.style.display = 'flex';

    renderCompoundWords(currentItem.char);
    initInteractiveCanvas(currentItem);
    
    // Reset timer logic
    timeRemaining = 300;
    startModalTimer();
}

function closePracticeModal() {
    const modal = document.getElementById('practice-modal');
    if (modal) modal.style.display = 'none';
    if (sessionTimer) clearInterval(sessionTimer);
}

async function loadKanjiVgStrokeData(char) {
    const hex = getUnicodeHex(char);
    const url = `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg/kanji/${hex}.svg`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('KanjiVG fetch failed');
        const svgText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = Array.from(doc.querySelectorAll('path')).filter(p => !p.id.includes('StrokeNumbers'));

        currentLoadedSvgStrokes = paths.map((pathEl, idx) => ({
            index: idx,
            d: pathEl.getAttribute('d'),
            name: `Stroke ${idx + 1}`,
            desc: idx === 0 ? "First stroke (Top/Left)" : (idx === paths.length - 1 ? "Final finishing stroke" : `Connecting stroke ${idx + 1}`)
        }));

        return { svgContent: svgText, strokeCount: paths.length, strokes: currentLoadedSvgStrokes };
    } catch (e) {
        return null;
    }
}

function renderStrokeOrderColumn(strokeData) {
    const strokeList = document.getElementById('modal-stroke-list');
    const tipsList = document.getElementById('modal-tips-list');
    if (!strokeList) return;

    const strokes = strokeData ? strokeData.strokes : [
        { name: "Stroke 1", desc: "First downward/horizontal stroke" },
        { name: "Stroke 2", desc: "Second connecting stroke" }
    ];

    strokeList.innerHTML = strokes.map((s, idx) => `
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

    if (tipsList) {
        if (currentItem && currentItem.tips && currentItem.tips.length > 0) {
            tipsList.innerHTML = currentItem.tips.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('');
        } else {
            tipsList.innerHTML = `
                <li style="margin-bottom: 4px;">Total Strokes: <strong>${strokes.length}</strong></li>
                <li>Follow natural top-to-bottom order.</li>
            `;
        }
    }
}

function renderCompoundWords(char) {
    const compList = document.getElementById('modal-compound-list');
    if (!compList) return;

    // 1. Check if current active item has real compounds defined, or exists in compoundMap
    let compounds = [];
    if (currentItem && currentItem.compounds && currentItem.compounds.length > 0) {
        compounds = currentItem.compounds;
    } else if (compoundMap[char] && compoundMap[char].length > 0) {
        compounds = compoundMap[char];
    } else {
        // 2. Real contextual dynamic N5 vocabulary generator based on category
        if (currentCategory === 'katakana') {
            compounds = [
                { word: `${char}ン`, reading: `${char.toLowerCase()}n`, meaning: `Katakana loan compound` },
                { word: `テ${char}`, reading: `te${char.toLowerCase()}`, meaning: `Phonetic block` }
            ];
        } else if (currentCategory === 'hiragana') {
            compounds = [
                { word: `${char}め`, reading: `${char.toLowerCase()}me`, meaning: `Common noun pairing` },
                { word: `お${char}`, reading: `o${char.toLowerCase()}`, meaning: `Polite prefix form` }
            ];
        } else {
            compounds = [
                { word: `${char}語`, reading: `go`, meaning: `Language / Word compound` },
                { word: `日本${char}`, reading: `nihon...`, meaning: `Standard N5 compound` }
            ];
        }
    }

    compList.innerHTML = compounds.map(c => `
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.4rem 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #38bdf8; font-size: 0.8rem;">${c.word} (${c.reading})</strong>
                <button class="weak-btn" style="padding: 0.15rem 0.35rem; font-size: 0.6rem;" onclick="speakJapanese('${c.word}')">🔊</button>
            </div>
            <div style="font-size: 0.7rem; color: #94a3b8;">${c.meaning}</div>
        </div>
    `).join('');
}

async function initInteractiveCanvas(item) {
    const target = document.getElementById('kanji-target');
    if (!target) return;
    target.innerHTML = '';

    const isKanji = isKanjiCharacter(item.char);
    let hanziWriterSuccess = false;

    if (isKanji && window.HanziWriter) {
        try {
            writer = HanziWriter.create('kanji-target', item.char.charAt(0), {
                width: 200, height: 200, padding: 10,
                showOutline: true, strokeAnimationSpeed: 1.2,
                delayBetweenStrokes: 150, strokeColor: '#38bdf8',
                outlineColor: 'rgba(255, 255, 255, 0.15)', drawingColor: '#22c55e'
            });
            
            writer.animateCharacter();
            hanziWriterSuccess = true;

            renderStrokeOrderColumn({
                strokes: Array.from({ length: item.stroke_count || 4 }, (_, i) => ({
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

    const strokeData = await loadKanjiVgStrokeData(item.char);

    if (strokeData && strokeData.strokes.length > 0) {
        renderStrokeOrderColumn(strokeData);

        let ghostPaths = '';
        let animPaths = '';

        strokeData.strokes.forEach((s, idx) => {
            ghostPaths += `<path d="${s.d}" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
            animPaths += `<path id="kana-stroke-${idx}" d="${s.d}" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="400" stroke-dashoffset="400" style="transition: stroke-dashoffset 1.5s ease-in-out;"/>`;
        });

        target.innerHTML = `
            <svg viewBox="0 0 109 109" style="width: 100%; height: 100%;">
                <g transform="scale(1, 1)">
                    ${ghostPaths}
                    ${animPaths}
                </g>
            </svg>
        `;
        setTimeout(animateKanaSequentialStrokes, 100);
    } else {
        renderStrokeOrderColumn({
            strokes: [{ name: "Stroke 1", desc: "Top/Left stroke" }, { name: "Stroke 2", desc: "Base stroke" }]
        });
        target.innerHTML = `
            <div style="font-size: 110px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: center; height: 100%;">
                ${item.char}
            </div>
        `;
    }
}

function setupUserPracticeCanvas() {
    kanaCanvas = document.getElementById('kana-canvas');
    if (!kanaCanvas) return;
    kanaCtx = kanaCanvas.getContext('2d');

    kanaCanvas.width = kanaCanvas.offsetWidth || 380;
    kanaCanvas.height = kanaCanvas.offsetHeight || 220;

    kanaCtx.strokeStyle = '#22c55e';
    kanaCtx.lineWidth = 9;
    kanaCtx.lineCap = 'round';
    kanaCtx.lineJoin = 'round';

    strokesDrawnInCurrentAttempt = 0;
    addCanvasDrawingListeners(kanaCanvas);
}

function addCanvasDrawingListeners(cvs) {
    isDrawing = false;

    function getPos(e) {
        const rect = cvs.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
        isDrawing = true;
        const pos = getPos(e);
        kanaCtx.beginPath();
        kanaCtx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        kanaCtx.lineTo(pos.x, pos.y);
        kanaCtx.stroke();
    }

    function stopDraw() {
        if (isDrawing) {
            isDrawing = false;
            strokesDrawnInCurrentAttempt++;

            const targetStrokeCount = (currentLoadedSvgStrokes && currentLoadedSvgStrokes.length > 0) 
                ? currentLoadedSvgStrokes.length 
                : (currentItem ? (currentItem.stroke_count || 2) : 2);

            if (strokesDrawnInCurrentAttempt >= targetStrokeCount) {
                practiceCount++;
                strokesDrawnInCurrentAttempt = 0;
                updateFeedbackAndAccuracy();
            }
        }
    }

    cvs.onmousedown = startDraw;
    cvs.onmousemove = draw;
    cvs.onmouseup = stopDraw;
    cvs.onmouseleave = stopDraw;

    cvs.ontouchstart = (e) => { e.preventDefault(); startDraw(e); };
    cvs.ontouchmove = (e) => { e.preventDefault(); draw(e); };
    cvs.ontouchend = stopDraw;
}

function updateFeedbackAndAccuracy() {
    const feedback = document.getElementById('modal-feedback-msg');

    if (currentItem) {
        const updatedScore = incrementUserCharacterProgress(currentItem.char, currentCategory);
        if (feedback) feedback.innerText = `Full Character Completed! Mastery: ${updatedScore}% (+2.5%) 🎉`;
        renderDrillCards(currentDrillItems);
    }
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
        if (path) {
            path.style.transition = 'none';
            path.style.strokeDashoffset = '400';
        }
    });

    let idx = 0;
    function next() {
        if (idx >= currentLoadedSvgStrokes.length) return;
        const path = document.getElementById(`kana-stroke-${idx}`);
        if (path) {
            path.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            path.style.strokeDashoffset = '0';
        }
        idx++;
        setTimeout(next, 1600);
    }
    setTimeout(next, 100);
}

function playSingleStrokeAnimation(idx) {
    const path = document.getElementById(`kana-stroke-${idx}`);
    if (path) {
        path.style.transition = 'none';
        path.style.strokeDashoffset = '400';
        setTimeout(() => {
            path.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
            path.style.strokeDashoffset = '0';
        }, 50);
    }
}

function loadNextCharacter() {
    completedCount++;
    const sessCount = document.getElementById('modal-session-count');
    const sessProgress = document.getElementById('modal-session-progress');
    const feedback = document.getElementById('modal-feedback-msg');

    if (sessCount) sessCount.innerText = `${completedCount} / ${totalSessionItems}`;
    if (sessProgress) sessProgress.style.width = `${(completedCount / totalSessionItems) * 100}%`;
    if (feedback) feedback.innerText = `Trace the character above!`;

    const nextIdx = (currentItemIndex + 1) % currentDrillItems.length;
    openPracticeModal(nextIdx);
}

function speakJapanese(text) {
    if ('speechSynthesis' in window && text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

function speakCurrentCharacter() {
    if (currentItem) speakJapanese(currentItem.char);
}

function speakAllCompounds() {
    if (!currentItem) return;
    const compounds = compoundMap[currentItem.char] || [];
    if (compounds.length > 0) {
        compounds.forEach((c, idx) => {
            setTimeout(() => speakJapanese(c.word), idx * 1200);
        });
    } else {
        speakCurrentCharacter();
    }
}

function resetStrokePractice() {
    strokesDrawnInCurrentAttempt = 0;
    if (kanaCtx && kanaCanvas) kanaCtx.clearRect(0, 0, kanaCanvas.width, kanaCanvas.height);
}

function startModalTimer() {
    if (sessionTimer) clearInterval(sessionTimer);
    sessionTimer = setInterval(() => {
        timeRemaining--;
        const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const secs = String(timeRemaining % 60).padStart(2, '0');
        const timerElem = document.getElementById('modal-timer');
        
        if (timerElem) timerElem.innerText = `${mins}:${secs}`;
        
        if (timeRemaining <= 0) {
            clearInterval(sessionTimer);
            closePracticeModal();
        }
    }, 1000);
}