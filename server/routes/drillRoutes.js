const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Truncates long readings/meanings to keep grid cards uniform and clean
function formatCardSubtitle(onyomi, kunyomi, meaning) {
    const primaryOn = onyomi ? onyomi.split(',')[0].trim() : '';
    const primaryKun = kunyomi ? kunyomi.split(',')[0].trim() : '';
    const cleanMeaning = meaning ? meaning.split(',')[0].trim() : '';

    let parts = [];
    if (primaryOn) parts.push(`On: ${primaryOn}`);
    if (primaryKun) parts.push(`Kun: ${primaryKun}`);

    return {
        summary: parts.join(' • '),
        meaning: cleanMeaning,
        fullOn: onyomi,
        fullKun: kunyomi,
        fullMeaning: meaning
    };
}

// Normalizes dataset items and attaches clean card summaries alongside full modal details
function normalizeDrillItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
        const charSymbol = item.kanji_char || item.char || item.kanji || item.character || item.symbol || item.literal || item.kana || '?';

        const rawOnyomi = item.onyomi || item.on_reading || '';
        const rawKunyomi = item.kunyomi || item.kun_reading || '';
        const rawMeaning = item.meaning || item.english || '';

        const formatted = formatCardSubtitle(rawOnyomi, rawKunyomi, rawMeaning);

        // Grid cards get primary summary; detailed modal retains full readings
        const readingStr = formatted.summary || (item.romaji || item.reading || '');

        return {
            ...item,
            char: charSymbol,
            onyomi: formatted.fullOn,
            kunyomi: formatted.fullKun,
            meaning: formatted.fullMeaning,
            summaryMeaning: formatted.meaning,
            summaryReading: formatted.summary,
            romaji: readingStr ? `${readingStr} (${formatted.meaning})` : formatted.meaning
        };
    });
}

// Read local JSON files from server/data/ directory
function loadDataFromJsonFile(category) {
    try {
        const cat = category.toLowerCase();

        if (cat === 'hiragana' || cat === 'katakana') {
            const filePath = path.join(__dirname, '../data/kana.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf8');
                const kanaData = JSON.parse(rawData);
                const filtered = kanaData.filter(item => (item.type || '').toLowerCase() === cat);
                return normalizeDrillItems(filtered);
            }
        } else if (cat === 'kanji' || cat.includes('kanji')) {
            const filePath = path.join(__dirname, '../data/kanji_n5.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf8');
                return normalizeDrillItems(JSON.parse(rawData));
            }
        }
    } catch (err) {
        console.warn(`[DRILL ROUTE] JSON read warning for ${category}:`, err.message);
    }
    return null;
}

// Built-in hardcoded fallback dataset
const hardcodedFallback = {
    hiragana: normalizeDrillItems([
        { char: 'あ', romaji: 'a', stroke_count: 3 }, { char: 'い', romaji: 'i', stroke_count: 2 },
        { char: 'う', romaji: 'u', stroke_count: 2 }, { char: 'え', romaji: 'e', stroke_count: 2 },
        { char: 'お', romaji: 'o', stroke_count: 3 }
    ]),
    katakana: normalizeDrillItems([
        { char: 'ア', romaji: 'a', stroke_count: 2 }, { char: 'イ', romaji: 'i', stroke_count: 2 },
        { char: 'ウ', romaji: 'u', stroke_count: 3 }, { char: 'エ', romaji: 'e', stroke_count: 3 },
        { char: 'オ', romaji: 'o', stroke_count: 3 }
    ]),
    kanji: normalizeDrillItems([
        { char: '一', onyomi: 'イチ, イツ', kunyomi: 'ひと, ひと.つ', meaning: 'One, one radical (no.1)', stroke_count: 1 },
        { char: '二', onyomi: 'ニ, ジ', kunyomi: 'ふた, ふた.つ', meaning: 'Two', stroke_count: 2 },
        { char: '三', onyomi: 'サン, ゾウ', kunyomi: 'み, み.つ', meaning: 'Three', stroke_count: 3 },
        { char: '四', onyomi: 'シ', kunyomi: 'よ, よ.つ, よん', meaning: 'Four', stroke_count: 5 },
        { char: '五', onyomi: 'ゴ', kunyomi: 'いつ, いつ.つ', meaning: 'Five', stroke_count: 4 },
        { char: '六', onyomi: 'ロク', kunyomi: 'む, む.つ, むい', meaning: 'Six', stroke_count: 4 },
        { char: '七', onyomi: 'シチ', kunyomi: 'なな, なな.つ', meaning: 'Seven', stroke_count: 2 },
        { char: '八', onyomi: 'ハチ', kunyomi: 'や, や.つ, よう', meaning: 'Eight', stroke_count: 2 },
        { char: '九', onyomi: 'キュウ, ク', kunyomi: 'ここの, ここの.つ', meaning: 'Nine', stroke_count: 2 },
        { char: '十', onyomi: 'ジュウ', kunyomi: 'とお, と', meaning: 'Ten', stroke_count: 2 }
    ])
};

// GET /api/drills/:category
router.get('/:category', async (req, res) => {
    let category = req.params.category ? req.params.category.toLowerCase() : 'hiragana';
    if (category.includes('kanji')) category = 'kanji';

    // Tier 1: Query MySQL 'kanji' table
    if (category === 'kanji') {
        try {
            if (db && typeof db.query === 'function') {
                const [rows] = await db.query('SELECT * FROM kanji');
                if (rows && rows.length > 0) {
                    const normalized = normalizeDrillItems(rows);

                    // If DB rows contain corrupt '?' symbols, bypass to local JSON or hardcoded fallback
                    const isCorrupted = normalized.some(item => item.char === '?');
                    if (!isCorrupted) {
                        return res.json(normalized);
                    }
                    console.warn(`[DRILL ROUTE] MySQL 'kanji' returned '?' characters. Bypassing to JSON/Fallback.`);
                }
            }
        } catch (err) {
            console.warn(`[DRILL ROUTE] MySQL query error: ${err.message}. Trying local JSON files...`);
        }
    }

    // Tier 2: Try reading local JSON files
    const fileData = loadDataFromJsonFile(category);
    if (fileData && fileData.length > 0) {
        return res.json(fileData);
    }

    // Tier 3: Hardcoded fallback
    const fallback = hardcodedFallback[category] || hardcodedFallback.hiragana;
    return res.json(fallback);
});

module.exports = router;