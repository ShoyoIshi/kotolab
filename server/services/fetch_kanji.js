const fs = require('fs');

async function fetchN5Kanji() {
    console.log('⏳ Fetching all JLPT N5 Kanji from API...');
    try {
        const response = await fetch('https://kanjiapi.dev/v1/kanji/jlpt-5');
        const kanjiList = await response.json();
        const formattedKanji = [];

        for (const char of kanjiList) {
            try {
                const detailRes = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`);
                const detail = await detailRes.json();

                formattedKanji.push({
                    kanji_char: detail.kanji,
                    meaning: detail.meanings ? detail.meanings.slice(0, 3).join(', ') : 'N/A',
                    onyomi: detail.on_readings ? detail.on_readings.join(', ') : 'N/A',
                    kunyomi: detail.kun_readings ? detail.kun_readings.join(', ') : 'N/A',
                    jlpt_level: 'N5',
                    stroke_count: detail.stroke_count || 0
                });
            } catch (err) {
                console.warn(`Skipped ${char}`);
            }
        }

        fs.writeFileSync('kanji_n5.json', JSON.stringify(formattedKanji, null, 2));
        console.log(`🎉 Successfully generated kanji_n5.json with ${formattedKanji.length} N5 Kanji!`);
    } catch (err) {
        console.error('❌ Failed to fetch Kanji:', err.message);
    }
}

fetchN5Kanji();