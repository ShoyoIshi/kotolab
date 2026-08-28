const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { userMessage, scenario } = req.body;
        // Call your Gemini API service or use existing AI helper
        // For now, generating context-aware Japanese response:
        const aiReply = `「${userMessage}」ですね。かしこまりました！ほかに何かお手伝いしましょうか？`;
        const englishTranslation = `Understood: "${userMessage}". Certainly! Anything else I can help you with?`;

        res.json({ success: true, reply: aiReply, translation: englishTranslation });
    } catch (error) {
        res.status(500).json({ error: 'AI conversation error' });
    }
});

module.exports = router;
