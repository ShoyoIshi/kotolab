const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

function getStories() {
    try {
        const raw = fs.readFileSync(path.join(__dirname, '../data/stories_n5.json'), 'utf8');
        return JSON.parse(raw);
    } catch (err) { return []; }
}

router.get('/vocabulary', async (req, res) => {
    const searchQuery = req.query.q ? `%${req.query.q}%` : null;
    const limit = parseInt(req.query.limit) || 1000;
    try {
        let sql = 'SELECT * FROM vocabulary';
        let params = [];
        if (searchQuery) {
            sql += ' WHERE japanese_word LIKE $1 OR reading LIKE $2 OR meaning LIKE $3';
            params = [searchQuery, searchQuery, searchQuery];
            sql += ' LIMIT $4';
            params.push(limit);
        } else {
            sql += ' LIMIT $1';
            params.push(limit);
        }
        const result = await db.query(sql, params);
        res.json({ count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vocabulary', details: err.message });
    }
});

router.get('/kanji', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kanji');
        res.json({ count: result.rows.length, data: result.rows });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch kanji', details: err.message }); }
});

router.get('/grammar', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM grammar_particles');
        res.json({ count: result.rows.length, data: result.rows });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch grammar particles', details: err.message }); }
});

router.get('/stories', (req, res) => {
    const stories = getStories();
    res.json(stories.map(s => ({ id: s.id, title: s.title, difficulty: s.difficulty, summary: s.summary })));
});

router.get('/stories/:id', (req, res) => {
    const stories = getStories();
    const story = stories.find(s => s.id === parseInt(req.params.id));
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
});

module.exports = router;