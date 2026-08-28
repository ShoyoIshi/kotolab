const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ Correct // MySQL pool connection[cite: 7]
const fs = require('fs');
const path = require('path');

// Fallback JSON Loader
const loadJsonFallback = (filename, defaultVal) => {
    try {
        const raw = fs.readFileSync(path.join(__dirname, `../data/${filename}`));
        return JSON.parse(raw);
    } catch (e) {
        return defaultVal;
    }
};

// GET /api/sandbox/module-data/:moduleId
router.get('/module-data/:moduleId', async (req, res) => {
    const { moduleId } = req.params;

    try {
        // CARD 1: Particles Basics (Randomized Sentence Generation)
        if (moduleId === '1') {
            let particles = [];
            let vocab = [];

            try {
                const [pRows] = await db.query('SELECT * FROM grammar_particles'); //[cite: 1]
                const [vRows] = await db.query('SELECT * FROM vocabulary ORDER BY RAND() LIMIT 20'); //[cite: 1]
                particles = pRows;
                vocab = vRows;
            } catch (e) {
                particles = [
                    { particle: 'は', function_meaning: 'Topic marker' },
                    { particle: 'を', function_meaning: 'Direct object marker' },
                    { particle: 'に', function_meaning: 'Destination / Time' },
                    { particle: 'で', function_meaning: 'Location of action' }
                ]; //[cite: 2]
                vocab = loadJsonFallback('vocab_n5.json', []); //[cite: 6]
            }

            // Pick 5 Random Exercises
            const questions = Array.from({ length: 5 }).map(() => {
                const randomWord = vocab[Math.floor(Math.random() * vocab.length)] || { japanese_word: 'パン', reading: 'パン', meaning: 'bread' }; //[cite: 6]
                const subjects = [
                    { word: 'わたしは', meaning: 'I' },
                    { word: 'たなかさんは', meaning: 'Tanaka-san' },
                    { word: 'ともだちは', meaning: 'My friend' }
                ];
                const subj = subjects[Math.floor(Math.random() * subjects.length)];
                
                return {
                    prompt: `Select the correct particle: ${subj.word} ${randomWord.japanese_word} ___ たべます。`,
                    targetParticle: 'を',
                    particles: ['を', 'は', 'が', 'に', 'で'],
                    sentence: `${subj.word}${randomWord.japanese_word}をたべます。`,
                    meaning: `${subj.meaning} eats ${randomWord.meaning}.`,
                    explanation: "「を」 marks the direct object receiving the action."
                };
            });

            return res.json({
                success: true,
                data: {
                    moduleId: '1',
                    title: 'Particles Basics (は・が・を・に・で)',
                    badge: 'Card 1 • Particles',
                    type: 'particle',
                    questions: questions
                }
            });
        }

        // CARD 2: Basic Sentences (Supports Type + Drag/Click Tiles)
        if (moduleId === '2') {
            let vocabList = [];
            try {
                const [vRows] = await db.query('SELECT * FROM vocabulary ORDER BY RAND() LIMIT 15'); //[cite: 1]
                vocabList = vRows;
            } catch (e) {
                vocabList = loadJsonFallback('vocab_n5.json', []); //[cite: 6]
            }

            const sample = vocabList[0] || { japanese_word: 'コーヒー', meaning: 'coffee' }; //[cite: 6]
            
            return res.json({
                success: true,
                data: {
                    moduleId: '2',
                    title: 'Basic Sentences (SOV Order & です/ます)',
                    badge: 'Card 2 • Sentence Builder',
                    type: 'sentence',
                    questions: [{
                        prompt: `Build or Type target: "Tanaka-san drinks ${sample.meaning || 'coffee'}."`,
                        targetSentence: `たなかさんは${sample.japanese_word}をのみます。`,
                        formula: '[ Subject ] ＋ は ＋ [ Object ] ＋ を ＋ [ Verb ]',
                        tiles: ['たなかさんは', sample.japanese_word, 'を', 'のみます。'],
                        distractors: ['パン', 'あした', 'がっこう']
                    }]
                }
            });
        }

        // CARD 3: Daily Expressions & N5 Vocab
        if (moduleId === '3') {
            let vocabList = [];
            try {
                const [vRows] = await db.query('SELECT * FROM vocabulary ORDER BY RAND() LIMIT 10'); //[cite: 1]
                vocabList = vRows;
            } catch (e) {
                vocabList = loadJsonFallback('vocab_n5.json', []); //[cite: 6]
            }

            const questions = vocabList.slice(0, 5).map(v => ({
                phrase: v.japanese_word,
                reading: v.reading,
                meaning: v.meaning,
                options: [v.meaning, 'Good morning', 'Thank you'].sort(() => Math.random() - 0.5),
                correctMeaning: v.meaning
            }));

            return res.json({
                success: true,
                data: {
                    moduleId: '3',
                    title: 'Daily Expressions & N5 Vocabulary',
                    badge: 'Card 3 • Expressions',
                    type: 'expression',
                    questions: questions
                }
            });
        }

        // CARD 4: Listening & JLPT Reading Passages
        if (moduleId === '4') {
            const passages = loadJsonFallback('reading_passages.json', []); //[cite: 5]
            const passage = passages[Math.floor(Math.random() * passages.length)] || passages[0]; //[cite: 5]

            return res.json({
                success: true,
                data: {
                    moduleId: '4',
                    title: `JLPT N5 Reading: ${passage.title}`,
                    badge: 'Card 4 • Passage Comprehension',
                    type: 'listening',
                    passage: passage
                }
            });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;