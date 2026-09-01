const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client pointing to Groq's endpoint
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

// 1. Force root URL to redirect to login page first
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// 2. Serve static assets from client folder
app.use(express.static(path.join(__dirname, '../client')));

// -------------------------------------------------------------
// Core AI Endpoints (Using Groq openai/gpt-oss-120b)
// -------------------------------------------------------------

// Endpoint 1: Sentence Evaluation
app.post('/api/sandbox/evaluate', async (req, res) => {
    try {
        const { sentence, targetSentence, scenario } = req.body;

        const systemPrompt = `You are a native Japanese language tutor specializing in JLPT N5 grammar instruction.
Evaluate the student's Japanese sentence against the target scenario.
Rules:
1. Explain particle usage specifically (は, が, を, に, で, etc.).
2. Highlight Japanese SOV word order accuracy.
3. Keep the feedback concise, supportive, and clear.`;

        const userPrompt = `Scenario: "${scenario}"
Student Sentence: "${sentence}"
Target Reference: "${targetSentence}"

Explain whether the particle usage and structure are correct or what mistake was made.`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
        });

        res.json({
            success: true,
            explanation: response.choices[0].message.content
        });
    } catch (error) {
        console.error('Groq Evaluation Error:', error);
        res.status(500).json({
            success: false,
            error: 'AI Evaluation temporarily unavailable.'
        });
    }
});

// Endpoint for AI Conversation Practice (Yuki - Convenience Store Clerk)
app.post('/api/conversation/chat-yuki', async (req, res) => {
    try {
        const { userMessage, scenario } = req.body;

        const systemPrompt = `You are Yuki, a friendly Japanese convenience store clerk interacting with a JLPT N5 student.
The student just said: "${userMessage}" in the scenario: "${scenario}".
Respond naturally in polite Japanese (Keigo/Polite form) appropriate for N5 level.
You MUST output a valid JSON object with EXACTLY this structure, with no markdown backticks:
{
  "reply": "Your Japanese response here",
  "translation": "English translation of your response"
}`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: 'You are a precise JSON generator. Output only a valid JSON object.' },
                { role: 'user', content: systemPrompt }
            ],
            temperature: 0.5
        });

        let rawContent = response.choices[0].message.content.trim();
        if (rawContent.startsWith('```json')) {
            rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const convoData = JSON.parse(rawContent);
        res.json({ success: true, reply: convoData.reply, translation: convoData.translation });
    } catch (error) {
        console.error('AI Conversation Error:', error);
        res.json({ 
            success: true, 
            reply: `「${req.body.userMessage || 'こんにちは'}」ですね。かしこまりました！ほかに何かございますか？`, 
            translation: `Understood. Certainly! Is there anything else you need?` 
        });
    }
});

// Endpoint 2: Dynamic Scenario Generation
app.get('/api/sandbox/generate-scenario', async (req, res) => {
    try {
        const prompt = `Generate a single unique JLPT N5 grammar practice scenario.
Output MUST strictly adhere to this exact JSON schema:
{
  "id": "scenario_id",
  "title": "Short English prompt (e.g., Tanaka-san drinks green tea)",
  "englishPrompt": "English translation prompt",
  "romajiSentence": "Standard romaji sentence",
  "targetSentence": "Complete correct Japanese sentence with punctuation (e.g., たなかさんはおちゃをのみます。)",
  "formula": "Grammar formula structure",
  "image": "🍵",
  "wordsBreakdown": [
    { "word": "たなかさんは", "romaji": "tanaka-san wa", "meaning": "Tanaka-san" },
    { "word": "おちゃ", "romaji": "ocha", "meaning": "green tea" },
    { "word": "を", "romaji": "o", "meaning": "object particle" },
    { "word": "のみます。", "romaji": "nomimasu", "meaning": "drinks" }
  ],
  "particles": ["は", "が", "を", "に", "で", "から", "へ", "と"],
  "words": [
    { "text": "たなかさんは", "sub": "Tanaka-san", "type": "noun" },
    { "text": "おちゃ", "sub": "green tea", "type": "noun" },
    { "text": "のみます", "sub": "drinks", "type": "verb" },
    { "text": "。", "sub": "period", "type": "particle" }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: 'You are a JSON generator. Output strictly valid JSON matching the requested schema without markdown backticks.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        });

        let rawContent = response.choices[0].message.content.trim();
        if (rawContent.startsWith('```json')) {
            rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const scenarioData = JSON.parse(rawContent);
        res.json(scenarioData);
    } catch (error) {
        console.error('Groq Scenario Gen Error:', error);
        res.status(500).json({ error: 'Failed to generate scenario.' });
    }
});

// Endpoint 3: Ask Tutor Chat
app.post('/api/sandbox/ask-tutor', async (req, res) => {
    try {
        const { question, context } = req.body;

        const systemPrompt = `You are "Sensei", an interactive, warm Japanese language tutor for JLPT N5 students on KotoLab.
The student is practicing: "${context || 'JLPT N5 General Practice'}".
CRITICAL RULES FOR YOUR RESPONSE:
1. You MUST explain everything in clear English.
2. Whenever you use Japanese words or sentences, you MUST include their Romaji in parentheses and their English meaning.
3. Keep the explanation encouraging, focused on N5 level, and under 80 words.`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
            ],
            temperature: 0.5
        });

        res.json({
            success: true,
            reply: response.choices[0].message.content
        });
    } catch (error) {
        console.error('Tutor Chat Error:', error);
        res.status(500).json({ success: false, error: 'Tutor is currently offline.' });
    }
});

// Endpoint 4: Contextual Grammar Notes
app.post('/api/sandbox/grammar-notes', async (req, res) => {
    try {
        const { targetTopic, targetSentence } = req.body;

        const systemPrompt = `You are a strict, highly detailed Japanese linguistics professor teaching JLPT N5 students. 
Provide an exhaustive, deeply detailed grammar breakdown.
CRITICAL FORMATTING RULES:
- Provide explanations entirely in English.
- Include Romaji for every Japanese word or sentence shown.
- DO NOT use markdown hash symbols (#) or tables (no pipes like |). Use clean plain text with emojis and bullet points.
Your response MUST include:
1. 📌 Core Sentence Analysis: Translate fully into English with Romaji.
2. 🔍 Exhaustive Particle Breakdown: Explain every particle's role, why it's used, with Romaji examples.
3. 💡 Detailed Grammar Rules & Usage Context.`;

        const userPrompt = `Analyze this JLPT N5 topic and sentence in extreme detail:
Topic: "${targetTopic}"
Target Sentence: "${targetSentence}"`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
        });

        res.json({
            success: true,
            notes: response.choices[0].message.content
        });
    } catch (error) {
        console.error('Grammar Notes Error:', error);
        res.status(500).json({ success: false, error: 'Could not load grammar notes.' });
    }
});

// Endpoint: AI Diagnostic Recommendations for Analytics Page
app.post('/api/analytics/diagnostics', async (req, res) => {
    try {
        const { accuracy, readiness, studyTime, weakParticles } = req.body;

        const systemPrompt = `You are a Japanese language performance analyst for KotoLab.
Based on the student's metrics (Accuracy: ${accuracy}%, Readiness: ${readiness}%, Study Time: ${studyTime} hrs, Weak Particles: ${weakParticles?.join(', ')}),
generate exactly 3 recommendations. 
Output MUST be a valid JSON array of objects with this exact structure, with no extra text or markdown:
[
  {
    "title": "Short title describing the weak area",
    "description": "Clear actionable advice explaining how to improve",
    "action": "Practice ➔",
    "link": "sandbox.html"
  }
]`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: 'You are a precise JSON generator. Output only a valid JSON array.' },
                { role: 'user', content: systemPrompt }
            ],
            temperature: 0.3
        });

        let rawContent = response.choices[0].message.content.trim();
        if (rawContent.startsWith('```json')) {
            rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const recommendations = JSON.parse(rawContent);
        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        console.error('Analytics Diagnostics Error:', error);
        res.json({ 
            success: true, 
            recommendations: [
                { title: "Particle 「に (ni)」 Focus Drill", description: "Practice destination and time particles to improve accuracy on movement verbs.", action: "Drill ➔", link: "sandbox.html" },
                { title: "Particle 「で (de)」 Review", description: "Focus on location of action versus tool/means particles.", action: "Review ➔", link: "sandbox.html" },
                { title: "JLPT N5 Mock Exam", description: "Take a timed diagnostic test to boost your overall N5 exam readiness score.", action: "Start Exam ➔", link: "exam.html" }
            ]
        });
    }
});

// Endpoint: Get Live User Progress from Database
app.get('/api/user/progress', async (req, res) => {
    try {
        const userId = req.query.userId || 3;
        const result = await db.query('SELECT * FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
        
        if (result.rows.length === 0) {
            return res.json({ message: "No progress found", overall_accuracy: 0 });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Database Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Update User Progress after Practice (PostgreSQL Version)
app.post('/api/user/update-progress', async (req, res) => {
    try {
        const userId = req.body.userId;
        const { correctIncrement, studyMinutesIncrement, lessonCompleted } = req.body;

        if (!userId || userId == 999) return res.json({ success: true });

        const existing = await db.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
        
        if (existing.rows.length === 0) {
            await db.query(
                `INSERT INTO user_progress (user_id, total_correct, study_time_minutes, lessons_completed, hiragana_mastery, katakana_mastery, kanji_mastery, vocabulary_mastery, grammar_mastery, overall_accuracy) 
                 VALUES ($1, $2, $3, $4, 0, 0, 0, 0, 10, 10)`,
                [userId, correctIncrement || 0, studyMinutesIncrement || 1, lessonCompleted ? 1 : 0]
            );
        } else {
            await db.query(
                `UPDATE user_progress 
                 SET total_correct = total_correct + $1, 
                     study_time_minutes = study_time_minutes + $2,
                     lessons_completed = lessons_completed + $3,
                     overall_accuracy = LEAST(100, (total_correct + $1) * 2)
                 WHERE user_id = $4`,
                [correctIncrement || 0, studyMinutesIncrement || 0, lessonCompleted ? 1 : 0, userId]
            );
        }

        res.json({ success: true, message: 'Progress and XP updated successfully!' });
    } catch (error) {
        console.error('Database Update Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update progress' });
    }
});

// Endpoint: Har character draw karne par Mastery badhane ke liye
app.post('/api/user/update-drill', async (req, res) => {
    try {
        const { userId, category } = req.body;
        if (userId == 999) return res.json({ success: true });

        let column = 'kanji_mastery';
        if (category === 'hiragana') column = 'hiragana_mastery';
        if (category === 'katakana') column = 'katakana_mastery';

        const queryText = `
            UPDATE user_progress 
            SET ${column} = LEAST(100, ${column} + 1.5),
                total_correct = total_correct + 1,
                overall_accuracy = LEAST(100, (hiragana_mastery + katakana_mastery + kanji_mastery + vocabulary_mastery + grammar_mastery + 1.5) / 5)
            WHERE user_id = $1
        `;

        await db.query(queryText, [userId || 3]);

        res.json({ success: true });
    } catch (error) {
        console.error('Drill Update Error:', error);
        res.status(500).json({ success: false });
    }
});

// Shoko AI Friend Conversation Endpoint (Pure Japanese Mode)
app.post('/api/conversation/chat', async (req, res) => {
    try {
        const { userMessage } = req.body;
        
        const systemPrompt = `You are Shoko, a close Japanese friend and conversational partner. 
The user said to you in Japanese: "${userMessage}".
Rules:
1. Reply ONLY in natural Japanese matching a friendly conversational tone. 
2. Do NOT explain in English. Keep it fully immersive in Japanese.
3. You MUST output a valid JSON object with EXACTLY this structure, with no markdown backticks:
{
  "reply": "Your natural Japanese response",
  "translation": "English translation note for user reference"
}`;

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage || 'こんにちは' }
            ],
            temperature: 0.7
        });

        let rawContent = response.choices[0].message.content.trim();
        if (rawContent.startsWith('```json')) {
            rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const convoData = JSON.parse(rawContent);
        res.json({ success: true, reply: convoData.reply, translation: convoData.translation });
    } catch (error) {
        console.error('Shoko Chat Error:', error);
        res.json({ 
            success: true, 
            reply: `「${userMessage || 'こんにちは'}」ですね！一緒に頑張りましょう！`, 
            translation: `Let's work hard together!` 
        });
    }
});

// -------------------------------------------------------------
// NEW: Analytics & Attempt Logging Endpoints
// -------------------------------------------------------------

app.post('/api/practice/attempt', async (req, res) => {
    try {
        const { userId, sessionType, score, totalQuestions, breakdown } = req.body;

        const query = `
            INSERT INTO practice_attempts (user_id, session_type, score, total_questions, section_breakdown, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        
        const result = await db.query(query, [userId, sessionType, score, totalQuestions, JSON.stringify(breakdown)]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Attempt Log Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/analytics/error-log', async (req, res) => {
    try {
        const { userId, errorTag, userSentence, expectedSentence } = req.body;

        const query = `
            INSERT INTO user_error_logs (user_id, error_type, user_input, expected_value, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *;
        `;
        
        const result = await db.query(query, [userId || 3, errorTag, userSentence, expectedSentence]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error Log Failed:", err);
        res.status(500).json({ error: err.message });
    }
});

// Legacy attempt logger (kept for compatibility if used elsewhere)
app.post('/api/user/practice-attempt', async (req, res) => {
    const { userId, isCorrect, errorType, userInput, expectedValue } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    try {
        await db.query(`
            INSERT INTO practice_attempts (user_id, is_correct)
            VALUES ($1, $2)
        `, [userId, isCorrect ? 1 : 0]);

        if (!isCorrect && errorType) {
            await db.query(`
                INSERT INTO user_error_logs (user_id, error_type, user_input, expected_value)
                VALUES ($1, $2, $3, $4)
            `, [userId, errorType, userInput || '', expectedValue || '']);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error logging practice attempt:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/user/character-mastery', async (req, res) => {
    const { userId, character, category, masteryLevel } = req.body;
    if (!userId || !character) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        await db.query(`
            INSERT INTO user_character_mastery (user_id, character_id, mastery_level)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, character_id) 
            DO UPDATE SET mastery_level = $3
        `, [userId, character, masteryLevel || 0]);

        res.json({ success: true, message: 'Character mastery saved!' });
    } catch (err) {
        console.error('Error saving character mastery:', err);
        res.status(500).json({ error: 'Failed to save character mastery' });
    }
});

// ==========================================
// FIX: Analytics Summary Endpoint
// ==========================================
app.get('/api/analytics/summary', async (req, res) => {
    try {
        const userId = req.query.userId || 3;
        const result = await db.query('SELECT * FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
        
        if (result.rows.length === 0) {
            return res.json({ 
                success: true, 
                overall_accuracy: 0, 
                total_correct: 0, 
                study_time_minutes: 0,
                lessons_completed: 0 
            });
        }
        res.json({ 
            success: true, 
            data: result.rows[0] 
        });
    } catch (err) {
        console.error("Analytics Summary Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// -------------------------------------------------------------
// Route Registration Loop
// -------------------------------------------------------------
const routes = [
    { path: '/api/auth', file: './routes/authRoutes' },
    { path: '/api/admin', file: './routes/adminRoutes' },
    { path: '/api/learning', file: './routes/learningRoutes' },
    { path: '/api/sandbox', file: './routes/sandboxRoutes' },
    { path: '/api/progress', file: './routes/progressRoutes' },
    { path: '/api/exams', file: './routes/examRoutes' },
    { path: '/api/analytics', file: './routes/analyticsRoutes' },
    { path: '/api/drills', file: './routes/drillRoutes' }
];

routes.forEach(r => {
    try {
        const routeModule = require(r.file);
        if (typeof routeModule !== 'function') {
            console.error(`❌ ERROR in file: ${r.file}.js — Missing "module.exports = router;"`);
        } else {
            app.use(r.path, routeModule);
        }
    } catch (err) {
        console.warn(`⚠️ Warning loading ${r.file}:`, err.message);
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'KotoLab Backend Server is running smoothly!' });
});

// SERVER LISTEN MUST BE AT THE VERY END
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 KotoLab Server running on http://localhost:${PORT}`));