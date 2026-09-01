const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 🚨 IMPORTANT: Apna Supabase database client import karein
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

// Read local JSON files from server/data/ directory instantly
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
        { char: '一', onyomi: 'イチ, イツ', kunyomi: 'ひと, ひと.つ', meaning: 'One', stroke_count: 1 },
        { char: '二', onyomi: 'ニ, ジ', kunyomi: 'ふた, ふた.つ', meaning: 'Two', stroke_count: 2 }
    ])
};

// GET /api/drills/:category - Fast-Tracked Instant Response
router.get('/:category', async (req, res) => {
    let category = req.params.category ? req.params.category.toLowerCase() : 'hiragana';
    if (category.includes('kanji')) category = 'kanji';

    const fileData = loadDataFromJsonFile(category);
    if (fileData && fileData.length > 0) {
        return res.json(fileData);
    }

    const fallback = hardcodedFallback[category] || hardcodedFallback.hiragana;
    return res.json(fallback);
});

// POST /api/drills/mastery - Update character mastery in Supabase (Fixed)
router.post('/mastery', async (req, res) => {
    try {
        const { userId, characterId, accuracy } = req.body;
        
        const query = `
            INSERT INTO user_character_mastery (user_id, character_id, mastery_level)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, character_id) 
            DO UPDATE SET 
                mastery_level = EXCLUDED.mastery_level
            RETURNING *;
        `;
        
        const result = await db.query(query, [userId || 3, characterId, Math.round(accuracy)]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Mastery Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/user/practice-attempt', async (req, res) => {
    try {
        const { userId, isCorrect, errorType, userInput, expectedValue } = req.body;

        // Ensure table columns match your Supabase 'practice_attempts' table schema
        const query = `
            INSERT INTO practice_attempts (user_id, is_correct, error_type, user_input, expected_value, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        
        const result = await db.query(query, [
            userId || 3, 
            isCorrect ?? false, 
            errorType || 'General', 
            userInput || '', 
            expectedValue || ''
        ]);

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Practice Attempt Save Error:", err.message);
        // Fallback response taaki 500 crash na ho aur app chalti rahe
        res.status(200).json({ success: false, error: err.message });
    }
});

module.exports = router;

module.exports = router;