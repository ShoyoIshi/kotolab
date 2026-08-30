const express = require('express');
const router = express.Router();

// Unlimited Chat Route - No Limits Configured
router.post('/chat', async (req, res) => {
    try {
        // Extracting input and flags from the frontend request
        const { userMessage, isEnglishFallback, scenario, bypassLimit } = req.body;

        let aiReply = "";
        let englishTranslation = "";

        // Clean the input just in case it has the prefix
        const cleanMessage = userMessage.replace('[English Input]: ', '').trim();

        // Check if the user used the English Fallback box
        if (isEnglishFallback) {
            // Shoko AI's response when user speaks/types in English
            aiReply = `なるほど、「${cleanMessage}」ですね！英語でも大丈夫ですよ。一緒に日本語を練習しましょう！`;
            englishTranslation = `I see, you mean "${cleanMessage}"! English is perfectly fine. Let's practice Japanese together!`;
        } else {
            // Shoko AI's response when user speaks/types in Japanese
            aiReply = `「${cleanMessage}」ですね。素晴らしいです！もっと日本語で話しましょうか？`;
            englishTranslation = `You said "${cleanMessage}". That's wonderful! Shall we talk more in Japanese?`;
        }

        // Return the dynamic unlimited response
        res.json({ 
            success: true, 
            reply: aiReply, 
            translation: englishTranslation 
        });

    } catch (error) {
        console.error("Chat Route Error:", error);
        res.status(500).json({ error: 'AI conversation error. Please try again.' });
    }
});

module.exports = router;