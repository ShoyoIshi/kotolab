const express = require('express');
const router = express.Router();
const db = require('../config/db'); // PostgreSQL pool connection

// Helper to safely get or create user progress
async function getOrCreateProgress(userId) {
    try {
        let result = await db.query('SELECT * FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
        
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            // Insert initial row safely using PostgreSQL syntax ($1, $2...)
            const insertQuery = `
                INSERT INTO user_progress (user_id, lesson_id, overall_accuracy, study_time_minutes, total_correct, hiragana_mastery, katakana_mastery, kanji_mastery, grammar_mastery) 
                VALUES ($1, 'intro_lesson', 82.4, 120, 156, 35, 28, 22, 25) 
                RETURNING *`;
            let newResult = await db.query(insertQuery, [userId]);
            return newResult.rows[0];
        }
    } catch (err) {
        console.error('Database error in getOrCreateProgress:', err.message);
        throw err;
    }
}

// 1. Get Live User Progress
router.get('/summary', async (req, res) => {
    try {
        const userId = req.query.userId || 3;
        const progress = await getOrCreateProgress(userId);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress summary:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Save / Update Progress
router.post('/save', async (req, res) => {
    try {
        const { userId = 3, quizType, score, total } = req.body;
        const accuracy = total > 0 ? (score / total) * 100 : 0;

        // Save individual attempt into practice_attempts table
        await db.query(
            'INSERT INTO practice_attempts (user_id, quiz_type, score, total, accuracy) VALUES ($1, $2, $3, $4, $5)',
            [userId, quizType || 'sandbox', score, total, accuracy]
        );

        // Try to update user_progress if exists, otherwise insert
        let existing = await db.query('SELECT id FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
        
        if (existing.rows.length > 0) {
            await db.query(
                `UPDATE user_progress 
                 SET total_correct = total_correct + $1, 
                     overall_accuracy = (overall_accuracy + $2) / 2 
                 WHERE user_id = $3`,
                [score, accuracy, userId]
            );
        } else {
            await db.query(
                `INSERT INTO user_progress (user_id, lesson_id, overall_accuracy, study_time_minutes, total_correct) 
                 VALUES ($1, 'intro_lesson', $2, 5, $3)`,
                [userId, accuracy, score]
            );
        }

        res.json({ 
            success: true, 
            message: 'Progress saved successfully to Supabase PostgreSQL!', 
            score: `${score}/${total}` 
        });
    } catch (error) {
        console.error('Error saving progress to DB:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Dashboard stats route
router.get('/dashboard-stats', async (req, res) => {
    try {
        const userId = req.query.userId || 3;
        const result = await db.query('SELECT * FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
        
        if (result.rows.length > 0) {
            const data = result.rows[0];
            res.json({
                lessons_completed: data.lessons_completed || 0,
                accuracy: Number(data.overall_accuracy) || 0,
                study_time: `${Math.floor((data.study_time_minutes || 0) / 60)}h ${(data.study_time_minutes || 0) % 60}m`,
                correct_answers: data.total_correct || 0,
                streak_days: 3,
                user_level: 1
            });
        } else {
            res.json({
                lessons_completed: 0,
                accuracy: 0,
                study_time: '0h 0m',
                correct_answers: 0,
                streak_days: 1,
                user_level: 1
            });
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;