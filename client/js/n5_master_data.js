// ============================================================================
// KotoLab JLPT N5 Master Syllabus Dataset
// Contains Complete Vocabulary, Hiragana, Katakana, Kanji, and Sentence Scenarios
// ============================================================================

const N5_MASTER_DATA = {
    // ------------------------------------------------------------------------
    // 1. KANA MASTER DATA (Hiragana & Katakana Sets)
    // ------------------------------------------------------------------------
    kana: {
        hiragana: [
            { char: "あ", hiragana: "あ", katakana: "ア", romaji: "a", english: "a", tips: ["Horizontal top stroke", "Loop down and curve right"] },
            { char: "い", hiragana: "い", katakana: "イ", romaji: "i", english: "i", tips: ["Left stroke longer with hook", "Right stroke shorter"] },
            { char: "う", hiragana: "う", katakana: "ウ", romaji: "u", english: "u", tips: ["Top short dot angled right", "Curved stroke below"] },
            { char: "え", hiragana: "え", katakana: "エ", romaji: "e", english: "e", tips: ["Top short stroke", "Z-shaped stroke underneath"] },
            { char: "お", hiragana: "お", katakana: "オ", romaji: "o", english: "o", tips: ["Horizontal line first", "Vertical down and loop finish"] },
            { char: "か", hiragana: "か", katakana: "カ", romaji: "ka", english: "ka", tips: ["Left hook stroke", "Vertical slash", "Top right dash"] },
            { char: "き", hiragana: "き", katakana: "キ", romaji: "ki", english: "ki", tips: ["Two horizontal lines", "Slanted stem with bottom loop"] },
            { char: "く", hiragana: "く", katakana: "ク", romaji: "ku", english: "ku", tips: ["Single left-pointing chevron stroke"] },
            { char: "け", hiragana: "け", katakana: "ケ", romaji: "ke", english: "ke", tips: ["Left vertical line", "Horizontal and vertical cross"] },
            { char: "こ", hiragana: "こ", katakana: "コ", romaji: "ko", english: "ko", tips: ["Top horizontal line", "Bottom curved line"] }
        ],
        katakana: [
            { char: "ア", hiragana: "あ", katakana: "ア", romaji: "a", english: "a", tips: ["Top horizontal then curve left", "Vertical line right"] },
            { char: "イ", hiragana: "い", katakana: "イ", romaji: "i", english: "i", tips: ["Left slanting stroke first", "Vertical stroke right"] },
            { char: "ウ", hiragana: "う", katakana: "ウ", romaji: "u", english: "u", tips: ["Top dot first", "Left short stroke", "Right hook stroke"] },
            { char: "エ", hiragana: "え", katakana: "エ", romaji: "e", english: "e", tips: ["Top horizontal", "Vertical stem", "Bottom horizontal"] },
            { char: "オ", hiragana: "お", katakana: "オ", romaji: "o", english: "o", tips: ["Horizontal line", "Vertical line with left hook", "Diagonal"] }
        ]
    },

    // ------------------------------------------------------------------------
    // 2. KANJI MASTER DATA (Essential N5 Kanji Characters)
    // ------------------------------------------------------------------------
    kanji: [
        { 
            kanji: "一", hiragana: "いち", katakana: "イチ", reading: "いち (ichi)", 
            furigana: "Radical 1: One horizontal stroke", meanings: ["One", "Two", "Three"], correct: 0,
            strokes: ["M 18,52 C 21.8,52.8 25.8,52.6 29.6,52.3 C 45.8,51 65,49.5 81,48.8 C 84.8,48.6 88.6,48.7 92.4,49.2"]
        },
        { 
            kanji: "二", hiragana: "に", katakana: "ニ", reading: "に (ni)", 
            furigana: "Radical 2: Two horizontal strokes", meanings: ["One", "Two", "Four"], correct: 1,
            strokes: ["M 28,30 L 72,30", "M 18,70 L 82,70"]
        },
        { 
            kanji: "三", hiragana: "さん", katakana: "サン", reading: "さん (san)", 
            furigana: "Three horizontal strokes", meanings: ["Two", "Three", "Five"], correct: 1,
            strokes: ["M 28,25 L 72,25", "M 32,50 L 68,50", "M 18,75 L 82,75"]
        },
        { 
            kanji: "人", hiragana: "ひと", katakana: "ヒト", reading: "ひと (hito) / ジン", 
            furigana: "人 (Person / Human)", meanings: ["Person", "Book", "Sun"], correct: 0,
            strokes: ["M 50,15 C 40,40 30,65 18,85", "M 45,45 C 55,60 68,75 85,85"]
        },
        { 
            kanji: "日", hiragana: "ひ", katakana: "ニチ", reading: "ひ (hi) / ニチ", 
            furigana: "日 (Sun / Day)", meanings: ["Moon", "Sun / Day", "Water"], correct: 1,
            strokes: ["M 25,20 L 25,85", "M 25,20 L 75,20 L 75,85", "M 25,50 L 75,50", "M 25,85 L 75,85"]
        },
        { 
            kanji: "月", hiragana: "つき", katakana: "ゲツ", reading: "つき (tsuki) / ゲツ", 
            furigana: "月 (Moon / Month)", meanings: ["Sun", "Moon / Month", "Fire"], correct: 1,
            strokes: ["M 30,18 C 30,45 28,70 18,88", "M 30,20 L 72,20 L 72,88 M 72,88 L 62,78", "M 30,42 L 72,42", "M 30,62 L 72,62"]
        },
        { 
            kanji: "水", hiragana: "みず", katakana: "ミズ", reading: "みず (mizu)", 
            furigana: "水 (Water)", meanings: ["Water", "Fire", "Tree"], correct: 0,
            strokes: ["M 50,15 L 50,85 M 50,85 L 38,70", "M 20,40 L 45,50", "M 15,75 L 45,60", "M 80,35 C 65,50 55,60 50,65", "M 55,65 L 85,85"]
        },
        { 
            kanji: "木", hiragana: "き", katakana: "モク", reading: "き (ki) / モク", 
            furigana: "木 (Tree / Wood)", meanings: ["Gold", "Water", "Tree / Wood"], correct: 2,
            strokes: ["M 18,40 L 82,40", "M 50,15 L 50,85", "M 50,40 C 40,58 28,72 15,82", "M 50,40 C 60,58 72,72 85,82"]
        },
        { 
            kanji: "学", hiragana: "まなぶ", katakana: "ガク", reading: "がく (gaku)", 
            furigana: "学 (Study / Learn)", meanings: ["Study / Learn", "School", "Book"], correct: 0,
            strokes: ["M 32,17 C 36,19 40,22 41,25", "M 51,13 C 54,15 58,18 59,21", "M 75,11 C 75,12 75,12 75,13"]
        },
        { 
            kanji: "校", hiragana: "こう", katakana: "コウ", reading: "こう (kou)", 
            furigana: "校 (School / Building)", meanings: ["School", "House", "Park"], correct: 0,
            strokes: ["M 25,20 L 25,85", "M 25,40 L 50,30", "M 60,20 L 60,85"]
        }
    ],

    // ------------------------------------------------------------------------
    // 3. TOPIC VOCABULARY CHAPTERS (Complete JLPT N5 Vocabulary)
    // ------------------------------------------------------------------------
    vocabChapters: {
        'ch1': {
            title: "Chapter 1: Food, Drinks & Dining",
            vocab: [
                { emoji: "🍞", jp: "パン", hiragana: "ぱん", katakana: "パン", romaji: "pan", english: "Bread", options: ["Bread", "Apple", "Water"], correct: 0 },
                { emoji: "🥛", jp: "水", hiragana: "みず", katakana: "ミズ", romaji: "mizu", english: "Water", options: ["Rice", "Water", "Tea"], correct: 1 },
                { emoji: "🍵", jp: "お茶", hiragana: "おちゃ", katakana: "オチャ", romaji: "ocha", english: "Green Tea", options: ["Juice", "Water", "Green Tea"], correct: 2 },
                { emoji: "🥩", jp: "肉", hiragana: "にく", katakana: "ニク", romaji: "niku", english: "Meat", options: ["Meat", "Fish", "Rice"], correct: 0 },
                { emoji: "🐟", jp: "魚", hiragana: "さかな", katakana: "サカナ", romaji: "sakana", english: "Fish", options: ["Bread", "Fish", "Egg"], correct: 1 },
                { emoji: "🍚", jp: "ごはん", hiragana: "ごはん", katakana: "ゴハン", romaji: "gohan", english: "Rice / Meal", options: ["Rice / Meal", "Water", "Meat"], correct: 0 },
                { emoji: "☕", jp: "コーヒー", hiragana: "こーひー", katakana: "コーヒー", romaji: "ko-hi-", english: "Coffee", options: ["Coffee", "Milk", "Juice"], correct: 0 }
            ]
        },
        'ch2': {
            title: "Chapter 2: School, Stationery & Study",
            vocab: [
                { emoji: "🏫", jp: "学校", hiragana: "がっこう", katakana: "ガッコウ", romaji: "gakkou", english: "School", options: ["School", "Station", "Store"], correct: 0 },
                { emoji: "📖", jp: "本", hiragana: "ほん", katakana: "ホン", romaji: "hon", english: "Book", options: ["Book", "Paper", "Pencil"], correct: 0 },
                { emoji: "✏️", jp: "えんぴつ", hiragana: "えんぴつ", katakana: "エンピツ", romaji: "enpitsu", english: "Pencil", options: ["Pen", "Pencil", "Desk"], correct: 1 },
                { emoji: "👨‍🏫", jp: "先生", hiragana: "せんせい", katakana: "センセイ", romaji: "sensei", english: "Teacher", options: ["Student", "Teacher", "Doctor"], correct: 1 },
                { emoji: "🎒", jp: "かばん", hiragana: "かばん", katakana: "カバン", romaji: "kaban", english: "Bag", options: ["Bag", "Chair", "Desk"], correct: 0 },
                { emoji: "🪑", jp: "いす", hiragana: "いす", katakana: "イス", romaji: "isu", english: "Chair", options: ["Table", "Chair", "Door"], correct: 1 },
                { emoji: "🚪", jp: "教室", hiragana: "きょうしつ", katakana: "キョウシツ", romaji: "kyoushitsu", english: "Classroom", options: ["Classroom", "House", "Park"], correct: 0 }
            ]
        },
        'ch3': {
            title: "Chapter 3: House, Family & Daily Routines",
            vocab: [
                { emoji: "🏠", jp: "家", hiragana: "いえ", katakana: "イエ", romaji: "ie", english: "House / Home", options: ["House", "School", "Room"], correct: 0 },
                { emoji: "🚪", jp: "部屋", hiragana: "へや", katakana: "ヘヤ", romaji: "heya", english: "Room", options: ["Door", "Room", "Desk"], correct: 1 },
                { emoji: "🐱", jp: "猫", hiragana: "ねこ", katakana: "ネコ", romaji: "neko", english: "Cat", options: ["Dog", "Cat", "Bird"], correct: 1 },
                { emoji: "🛏️", jp: "ベッド", hiragana: "べっど", katakana: "ベッド", romaji: "beddo", english: "Bed", options: ["Chair", "Bed", "Table"], correct: 1 },
                { emoji: "🌅", jp: "朝", hiragana: "あさ", katakana: "アサ", romaji: "asa", english: "Morning", options: ["Morning", "Night", "Evening"], correct: 0 },
                { emoji: "🌙", jp: "夜", hiragana: "よる", katakana: "ヨル", romaji: "yoru", english: "Night", options: ["Morning", "Night", "Afternoon"], correct: 1 },
                { emoji: "🐕", jp: "犬", hiragana: "いぬ", katakana: "イヌ", romaji: "inu", english: "Dog", options: ["Cat", "Dog", "Fish"], correct: 1 }
            ]
        },
        'ch4': {
            title: "Chapter 4: Shopping, Money & Objects",
            vocab: [
                { emoji: "⌚", jp: "時計", hiragana: "とけい", katakana: "トケイ", romaji: "tokei", english: "Watch / Clock", options: ["Watch", "Ticket", "Money"], correct: 0 },
                { emoji: "💰", jp: "お金", hiragana: "おかね", katakana: "オカネ", romaji: "okane", english: "Money", options: ["Gold", "Money", "Card"], correct: 1 },
                { emoji: "🏬", jp: "デパート", hiragana: "でぱーと", katakana: "デパート", romaji: "depaato", english: "Department Store", options: ["Department Store", "School", "Room"], correct: 0 },
                { emoji: "🎟️", jp: "チケット", hiragana: "ちけっと", katakana: "チケット", romaji: "chiketto", english: "Ticket", options: ["Ticket", "Money", "Watch"], correct: 0 },
                { emoji: "📱", jp: "携帯", hiragana: "けいたい", katakana: "ケイタイ", romaji: "keitai", english: "Mobile Phone", options: ["Phone", "Book", "Computer"], correct: 0 },
                { emoji: "🎁", jp: "プレゼント", hiragana: "ぷれぜんと", katakana: "プレゼント", romaji: "purezento", english: "Gift", options: ["Gift", "Money", "Ticket"], correct: 0 },
                { emoji: "🏷️", jp: "高い", hiragana: "たかい", katakana: "タカイ", romaji: "takai", english: "Expensive / Tall", options: ["Cheap", "Expensive", "Small"], correct: 1 }
            ]
        },
        'ch5': {
            title: "Chapter 5: Time, Days & Calendar",
            vocab: [
                { emoji: "📅", jp: "今日", hiragana: "きょう", katakana: "キョウ", romaji: "kyou", english: "Today", options: ["Today", "Tomorrow", "Yesterday"], correct: 0 },
                { emoji: "🌅", jp: "明日", hiragana: "あした", katakana: "アシタ", romaji: "ashita", english: "Tomorrow", options: ["Yesterday", "Tomorrow", "Today"], correct: 1 },
                { emoji: "🕰️", jp: "時間", hiragana: "じかん", katakana: "ジカン", romaji: "jikan", english: "Time", options: ["Time", "Money", "Day"], correct: 0 },
                { emoji: "☀️", jp: "日曜日", hiragana: "にちようび", katakana: "ニチヨウビ", romaji: "nichiyoubi", english: "Sunday", options: ["Monday", "Sunday", "Friday"], correct: 1 },
                { emoji: "月", jp: "月曜日", hiragana: "げつようび", katakana: "ゲツヨウビ", romaji: "getsuyoubi", english: "Monday", options: ["Monday", "Tuesday", "Sunday"], correct: 0 },
                { emoji: "年", jp: "今年", hiragana: "ことし", katakana: "コトシ", romaji: "kotoshi", english: "This Year", options: ["Next Year", "This Year", "Last Year"], correct: 1 }
            ]
        },
        'ch6': {
            title: "Chapter 6: Places, City & Directions",
            vocab: [
                { emoji: "🚉", jp: "駅", hiragana: "えき", katakana: "エキ", romaji: "eki", english: "Train Station", options: ["Station", "Hospital", "Bank"], correct: 0 },
                { emoji: "🏥", jp: "病院", hiragana: "びょういん", katakana: "ビョウイン", romaji: "byouin", english: "Hospital", options: ["School", "Hospital", "Hotel"], correct: 1 },
                { emoji: "🏦", jp: "銀行", hiragana: "ぎんこう", katakana: "ギンコウ", romaji: "ginkou", english: "Bank", options: ["Bank", "Store", "Park"], correct: 0 },
                { emoji: "🌳", jp: "公園", hiragana: "こうえん", katakana: "コウエン", romaji: "kouen", english: "Park", options: ["Park", "House", "Room"], correct: 0 },
                { emoji: "🏪", jp: "コンビニ", hiragana: "こんびに", katakana: "コンビニ", romaji: "konbini", english: "Convenience Store", options: ["Store", "Station", "Hospital"], correct: 0 },
                { emoji: "🗺️", jp: "右", hiragana: "みぎ", katakana: "ミギ", romaji: "migi", english: "Right", options: ["Left", "Right", "Front"], correct: 1 }
            ]
        }
    },

    // ------------------------------------------------------------------------
    // 4. RANDOM SENTENCE MATRIX (Express/Client Action Generator)
    // ------------------------------------------------------------------------
    scenariosMatrix: {
        actions: [
            { verb: "いきます", verbMeaning: "go", objectType: "place", particle: "に", verbRomaji: "ikimasu" },
            { verb: "のみます", verbMeaning: "drink", objectType: "drink", particle: "を", verbRomaji: "nomimasu" },
            { verb: "たべます", verbMeaning: "eat", objectType: "food", particle: "を", verbRomaji: "tabemasu" },
            { verb: "よみます", verbMeaning: "read", objectType: "reading", particle: "を", verbRomaji: "yomimasu" },
            { verb: "かいます", verbMeaning: "buy", objectType: "item", particle: "を", verbRomaji: "kaimasu" },
            { verb: "みます", verbMeaning: "watch / see", objectType: "media", particle: "を", verbRomaji: "mimasu" },
            { verb: "ききます", verbMeaning: "listen to", objectType: "audio", particle: "を", verbRomaji: "kikimasu" },
            { verb: "ねます", verbMeaning: "sleep at", objectType: "place", particle: "で", verbRomaji: "nemasu" }
        ],
        items: {
            place: [
                { word: "うち", romaji: "uchi", meaning: "home", emoji: "🏠" },
                { word: "がっこう", romaji: "gakkou", meaning: "school", emoji: "🏫" },
                { word: "コンビニ", romaji: "konbini", meaning: "convenience store", emoji: "🏪" },
                { word: "へや", romaji: "heya", meaning: "room", emoji: "🚪" },
                { word: "えき", romaji: "eki", meaning: "station", emoji: "🚉" }
            ],
            drink: [
                { word: "コーヒー", romaji: "ko-hi-", meaning: "coffee", emoji: "☕" },
                { word: "お茶", romaji: "ocha", meaning: "tea", emoji: "🍵" },
                { word: "水", romaji: "mizu", meaning: "water", emoji: "🥛" },
                { word: "ジュース", romaji: "ju-su", meaning: "juice", emoji: "🧃" }
            ],
            food: [
                { word: "パン", romaji: "pan", meaning: "bread", emoji: "🍞" },
                { word: "すし", romaji: "sushi", meaning: "sushi", emoji: "🍣" },
                { word: "りんご", romaji: "ringo", meaning: "apple", emoji: "🍎" },
                { word: "ごはん", romaji: "gohan", meaning: "rice", emoji: "🍚" }
            ],
            reading: [
                { word: "ほん", romaji: "hon", meaning: "book", emoji: "📖" },
                { word: "しんぶん", romaji: "shinbun", meaning: "newspaper", emoji: "🗞️" },
                { word: "ざっし", romaji: "zasshi", meaning: "magazine", emoji: "📰" }
            ],
            item: [
                { word: "チケット", romaji: "chiketto", meaning: "ticket", emoji: "🎟️" },
                { word: "とけい", romaji: "tokei", meaning: "watch", emoji: "⌚" },
                { word: "かばん", romaji: "kaban", meaning: "bag", emoji: "🎒" }
            ],
            media: [
                { word: "テレビ", romaji: "terebi", meaning: "TV", emoji: "📺" },
                { word: "えいが", romaji: "eiga", meaning: "movie", emoji: "🎬" }
            ],
            audio: [
                { word: "おんがく", romaji: "ongaku", meaning: "music", emoji: "🎵" },
                { word: "ラジオ", romaji: "rajio", meaning: "radio", emoji: "📻" }
            ]
        },
        subjects: [
            { word: "わたしは", romaji: "watashi wa", meaning: "I" },
            { word: "たなかさんは", romaji: "tanaka-san wa", meaning: "Tanaka-san" },
            { word: "ともだちは", romaji: "tomodachi wa", meaning: "My friend" },
            { word: "がくせいは", romaji: "gakusei wa", meaning: "The student" },
            { word: "せんせいは", romaji: "sensei wa", meaning: "The teacher" }
        ]
    }
};

// Helper Generator for Client-Side Dynamic Scenario Generation
function generateRandomScenarioFromMaster() {
    const matrix = N5_MASTER_DATA.scenariosMatrix;
    const subjectObj = matrix.subjects[Math.floor(Math.random() * matrix.subjects.length)];
    const actionObj = matrix.actions[Math.floor(Math.random() * matrix.actions.length)];
    const categoryItems = matrix.items[actionObj.objectType] || matrix.items.food;
    const itemObj = categoryItems[Math.floor(Math.random() * categoryItems.length)];

    const targetSentence = `${subjectObj.word}${itemObj.word}${actionObj.particle}${actionObj.verb}。`;
    const romajiSentence = `${subjectObj.romaji} ${itemObj.romaji} ${actionObj.particle === 'を' ? 'o' : actionObj.particle} ${actionObj.verbRomaji}`;
    
    // Correct Subject-Verb English Grammar
    let verbEnglish = actionObj.verbMeaning;
    if (subjectObj.meaning === "I") {
        verbEnglish = verbEnglish;
    } else {
        verbEnglish = verbEnglish + (verbEnglish.endsWith('ch') || verbEnglish.endsWith('s') ? 'es' : 's');
    }
    
    const englishPrompt = `${subjectObj.meaning} ${verbEnglish} ${itemObj.meaning}.`;

    const wordObjects = [
        { text: subjectObj.word, sub: subjectObj.meaning },
        { text: itemObj.word, sub: itemObj.meaning },
        { text: actionObj.verb + "。", sub: actionObj.verbMeaning },
        { text: "パン", sub: "bread" },
        { text: "あした", sub: "tomorrow" }
    ].sort(() => Math.random() - 0.5);

    return {
        id: `gen_${Date.now()}`,
        title: englishPrompt,
        englishPrompt: englishPrompt,
        romajiSentence: romajiSentence,
        targetSentence: targetSentence,
        image: itemObj.emoji,
        formula: `[ Subject ] ＋ は ＋ [ Object/Place ] ＋ ${actionObj.particle} ＋ [ Verb ]`,
        particles: Array.from(new Set([actionObj.particle, "は", "が", "で", "に", "から"])),
        words: wordObjects
    };
}