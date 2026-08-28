const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/generate', async (req, res) => {
    try {
        const [kanjiRows] = await db.query('SELECT * FROM kanji ORDER BY RAND() LIMIT 5');
        const [allOnyomi] = await db.query('SELECT onyomi, kunyomi FROM kanji');

        const kanjiSection = kanjiRows.map(item => {
            const correctAnswer = item.onyomi || item.kunyomi;
            const wrongOptions = allOnyomi
                .map(k => k.onyomi || k.kunyomi)
                .filter(ans => ans && ans !== correctAnswer)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            return {
                section: "Kanji Reading",
                question: `What is the reading for ${item.kanji_char} (${item.meaning})?`,
                correct_answer: correctAnswer,
                options: [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random())
            };
        });

        const [vocabRows] = await db.query('SELECT * FROM vocabulary ORDER BY RAND() LIMIT 5');
        const [allMeanings] = await db.query('SELECT meaning FROM vocabulary');

        const vocabSection = vocabRows.map(item => {
            const wrongOptions = allMeanings
                .map(v => v.meaning)
                .filter(m => m !== item.meaning)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            return {
                section: "Vocabulary Knowledge",
                question: `What does 「${item.japanese_word}」 (${item.reading}) mean?`,
                correct_answer: item.meaning,
                options: [item.meaning, ...wrongOptions].sort(() => 0.5 - Math.random())
            };
        });

        const [particleRows] = await db.query('SELECT * FROM grammar_particles ORDER BY RAND() LIMIT 5');
        const [allParticles] = await db.query('SELECT particle FROM grammar_particles');

        const grammarSection = particleRows.map(item => {
            const maskedSentence = item.example_sentence.replace(item.particle, '〔 ___ 〕');
            const wrongOptions = allParticles
                .map(p => p.particle)
                .filter(p => p !== item.particle)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            return {
                section: "Grammar & Particles",
                question: `Fill in the blank: ${maskedSentence}`,
                correct_answer: item.particle,
                options: [item.particle, ...wrongOptions].sort(() => 0.5 - Math.random())
            };
        });

        res.json({
            title: "JLPT N5 Full Mock Examination",
            total_questions: 15,
            time_limit_minutes: 15,
            questions: [...kanjiSection, ...vocabSection, ...grammarSection]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate mock exam', details: err.message });
    }
});

module.exports = router;