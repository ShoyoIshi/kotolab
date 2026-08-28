const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/students (and alias /users) - Fetch all registered accounts and aggregated metrics
router.get(['/students', '/users'], async (req, res) => {
    try {
        // Subqueries prevent Cartesian product multiplication between progress and attempts tables
        const [rows] = await db.query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.role, 
                u.user_level,
                u.streak_count,
                u.created_at,
                COALESCE(up_stats.lessons_completed, 0) AS lessons_completed,
                COALESCE(pa_stats.total_attempts, 0) AS total_attempts,
                COALESCE(pa_stats.accuracy, 0) AS accuracy
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(id) AS lessons_completed
                FROM user_progress
                WHERE completed = 1 OR completed IS NULL
                GROUP BY user_id
            ) up_stats ON u.id = up_stats.user_id
            LEFT JOIN (
                SELECT 
                    user_id, 
                    COUNT(id) AS total_attempts,
                    ROUND(AVG(CASE WHEN is_correct = 1 THEN 100 ELSE 0 END)) AS accuracy
                FROM practice_attempts
                GROUP BY user_id
            ) pa_stats ON u.id = pa_stats.user_id
            ORDER BY u.id DESC
        `);

        // Compute aggregate metrics for top dashboard cards
        const studentCount = rows.filter(r => r.role !== 'admin').length;
        const totalAttempts = rows.reduce((acc, r) => acc + Number(r.total_attempts), 0);

        return res.json({
            summary: {
                total_students: studentCount,
                total_users: rows.length,
                total_platform_attempts: totalAttempts
            },
            students: rows,
            users: rows // Alias for legacy frontend calls expecting 'users'
        });
    } catch (err) {
        console.error('Error fetching admin user list:', err);
        return res.status(500).json({ error: 'Database query error fetching accounts.' });
    }
});

// POST /api/admin/reset-stats (and alias /reset-user) - Reset a student's progress & streak
router.post(['/reset-stats', '/reset-user'], async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        await db.query('DELETE FROM practice_attempts WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM user_progress WHERE user_id = ?', [userId]);
        await db.query('UPDATE users SET streak_count = 0 WHERE id = ?', [userId]);

        return res.json({ message: `Progress and streak reset successfully for User ID #${userId}` });
    } catch (err) {
        console.error('Error resetting user stats:', err);
        return res.status(500).json({ error: 'Failed to reset student progress.' });
    }
});

module.exports = router;