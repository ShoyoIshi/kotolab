const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/students (and alias /users) - Fetch all registered accounts and aggregated metrics
router.get(['/students', '/users'], async (req, res) => {
    try {
        // PostgreSQL compatible query using .rows instead of array destructuring
        const result = await db.query(`
    SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.role, 
        u.user_level,
        u.streak_count,
        u.created_at,
        COALESCE(up.lessons_completed, 0) AS lessons_completed,
        COALESCE(up.total_correct, 0) AS total_attempts,
        COALESCE(up.overall_accuracy, 0) AS accuracy
    FROM users u
    LEFT JOIN user_progress up ON u.id = up.user_id
    ORDER BY u.id DESC
`);
        const rows = result.rows || [];

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
        // PostgreSQL placeholders use $1 instead of ?
        await db.query('DELETE FROM practice_attempts WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_progress WHERE user_id = $1', [userId]);
        await db.query('UPDATE users SET streak_count = 0 WHERE id = $1', [userId]);

        return res.json({ message: `Progress and streak reset successfully for User ID #${userId}` });
    } catch (err) {
        console.error('Error resetting user stats:', err);
        return res.status(500).json({ error: 'Failed to reset student progress.' });
    }
});

module.exports = router;