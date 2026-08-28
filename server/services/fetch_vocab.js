const fs = require('fs');

async function fetchN5Vocab() {
    console.log('⏳ Fetching 800+ N5 Vocabulary words from JLPT API...');
    try {
        const response = await fetch('https://jlpt-vocab-api.vercel.app/api/words?level=5&limit=1000');
        const data = await response.json();
        
        // Format data for KotoLab Database schema
        const vocabList = data.words.map(item => ({
            japanese_word: item.word || item.furigana,
            reading: item.furigana || item.word,
            meaning: item.meaning,
            category: 'general',
            jlpt_level: 'N5'
        }));

        // Write directly to vocab_n5.json
        fs.writeFileSync('vocab_n5.json', JSON.stringify(vocabList, null, 2));
        console.log(`🎉 Successfully generated vocab_n5.json with ${vocabList.length} N5 vocabulary words!`);
    } catch (err) {
        console.error('❌ Failed to fetch vocabulary:', err.message);
    }
}

fetchN5Vocab();