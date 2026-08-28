const db = require('../server/config/db');
const fs = require('fs');
const path = require('path');

// 1. Read complete 800+ Vocab from JSON file
let vocabList = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, 'vocab_n5.json'));
    vocabList = JSON.parse(rawData);
} catch (e) {
    console.log('⚠️ vocab_n5.json not found, using empty list.');
}

// 2. All N5 Kanji
// 2. All 100 N5 Kanji
const kanjiList = [
    // Numbers & Counting (14)
    ['一', 'One', 'ICHI, ITSU', 'hito', 'N5'],
    ['二', 'Two', 'NI', 'futa', 'N5'],
    ['三', 'Three', 'SAN', 'mi', 'N5'],
    ['四', 'Four', 'SHI', 'yon, yo', 'N5'],
    ['五', 'Five', 'GO', 'itsu', 'N5'],
    ['六', 'Six', 'ROKU', 'mui, mu', 'N5'],
    ['七', 'Seven', 'SHICHI', 'nana', 'N5'],
    ['八', 'Eight', 'HACHI', 'ya, yo', 'N5'],
    ['九', 'Nine', 'KYUU, KU', 'kokono', 'N5'],
    ['十', 'Ten', 'JUU', 'too, to', 'N5'],
    ['百', 'Hundred', 'HYAKU', 'momo', 'N5'],
    ['千', 'Thousand', 'SEN', 'chi', 'N5'],
    ['万', 'Ten Thousand', 'MAN, BAN', 'yorozu', 'N5'],
    ['円', 'Yen / Circle', 'EN', 'maru', 'N5'],

    // Nature, Time & Days (14)
    ['日', 'Sun / Day', 'NICHI, JITSU', 'hi, bi', 'N5'],
    ['月', 'Moon / Month', 'GETSU, GATSU', 'tsuki', 'N5'],
    ['火', 'Fire', 'KA', 'hi', 'N5'],
    ['水', 'Water', 'SUI', 'mizu', 'N5'],
    ['木', 'Tree / Wood', 'MOKU, BOKU', 'ki', 'N5'],
    ['金', 'Gold / Money', 'KIN, KON', 'kane', 'N5'],
    ['土', 'Soil / Earth', 'TO, DO', 'tsuchi', 'N5'],
    ['年', 'Year', 'NEN', 'toshi', 'N5'],
    ['時', 'Time / Hour', 'JI', 'toki', 'N5'],
    ['分', 'Minute / Part', 'FUN, BUN', 'wa', 'N5'],
    ['午', 'Noon', 'GO', 'uma', 'N5'],
    ['今', 'Now', 'KON, KIN', 'ima', 'N5'],
    ['半', 'Half', 'HAN', 'naka', 'N5'],
    ['毎', 'Every', 'MAI', 'goto', 'N5'],

    // People, Body & Family (12)
    ['人', 'Person', 'JIN, NIN', 'hito', 'N5'],
    ['男', 'Man', 'DAN, NAN', 'otoko', 'N5'],
    ['女', 'Woman', 'JO, NYO', 'onna', 'N5'],
    ['子', 'Child', 'SHI, SU', 'ko', 'N5'],
    ['母', 'Mother', 'BO', 'haha', 'N5'],
    ['父', 'Father', 'FU', 'chichi', 'N5'],
    ['友', 'Friend', 'YUU', 'tomo', 'N5'],
    ['目', 'Eye', 'MOKU', 'me', 'N5'],
    ['口', 'Mouth', 'KOU, KU', 'kuchi', 'N5'],
    ['手', 'Hand', 'SHU', 'te', 'N5'],
    ['足', 'Foot / Leg', 'SOKU', 'ashi', 'N5'],
    ['名', 'Name', 'MEI, MYOU', 'na', 'N5'],

    // Directions & Positions (13)
    ['上', 'Up / Above', 'JOU', 'ue, kami', 'N5'],
    ['下', 'Down / Below', 'KA, GE', 'shita, moto', 'N5'],
    ['中', 'Inside / Middle', 'CHUU', 'naka', 'N5'],
    ['外', 'Outside', 'GAI, GE', 'soto, hoka', 'N5'],
    ['前', 'Before / Front', 'ZEN', 'mae', 'N5'],
    ['後', 'After / Behind', 'GOU, KOU', 'ushiro, ato', 'N5'],
    ['右', 'Right', 'U, YUU', 'migi', 'N5'],
    ['左', 'Left', 'SA', 'hidari', 'N5'],
    ['北', 'North', 'HOKU', 'kita', 'N5'],
    ['南', 'South', 'NAN', 'minami', 'N5'],
    ['東', 'East', 'TOU', 'higashi', 'N5'],
    ['西', 'West', 'SEI, SAI', 'nishi', 'N5'],
    ['間', 'Between / Interval', 'KAN, KEN', 'aida, ma', 'N5'],

    // Verbs & Actions (14)
    ['行', 'To go', 'KOU, GYOU', 'i, iku', 'N5'],
    ['来', 'To come', 'RAI', 'ku, kuru', 'N5'],
    ['食', 'To eat', 'SHOKU', 'ta, taberu', 'N5'],
    ['飲', 'To drink', 'IN', 'no, nomu', 'N5'],
    ['見', 'To see', 'KEN', 'mi, miru', 'N5'],
    ['聞', 'To hear / Listen', 'BUN, MON', 'ki, kiku', 'N5'],
    ['書', 'To write', 'SHO', 'ka, kaku', 'N5'],
    ['読', 'To read', 'DOKU, TOKU', 'yo, yomu', 'N5'],
    ['話', 'To speak', 'WA', 'hana, hanasu', 'N5'],
    ['買', 'To buy', 'BAI', 'ka, kau', 'N5'],
    ['立', 'To stand', 'RITSU', 'ta, tatsu', 'N5'],
    ['休', 'To rest', 'KYUU', 'yasu, yasumu', 'N5'],
    ['出', 'To exit / Leave', 'SHUTSU', 'de, deru', 'N5'],
    ['入', 'To enter', 'NYUU', 'hai, hairu', 'N5'],

    // Adjectives (10)
    ['大', 'Big / Large', 'DAI, TAI', 'oo, ookii', 'N5'],
    ['小', 'Small', 'SHOU', 'chii, chiisai', 'N5'],
    ['高', 'High / Expensive', 'KOU', 'taka, takai', 'N5'],
    ['安', 'Cheap / Peaceful', 'AN', 'yasu, yasui', 'N5'],
    ['新', 'New', 'SHIN', 'atara, atarashii', 'N5'],
    ['古', 'Old', 'KO', 'furu, furui', 'N5'],
    ['長', 'Long', 'CHOU', 'naga, nagai', 'N5'],
    ['多', 'Many / Much', 'TA', 'oo, ooi', 'N5'],
    ['少', 'Few / Little', 'SHOU', 'suku, sukoshi', 'N5'],
    ['白', 'White', 'HAKU', 'shiro, shiroi', 'N5'],

    // Objects, School & Environment (14)
    ['本', 'Book / Origin', 'HON', 'moto', 'N5'],
    ['校', 'School', 'KOU', 'kase', 'N5'],
    ['学', 'Study / Learn', 'GAKU', 'mana, manabu', 'N5'],
    ['生', 'Life / Birth', 'SEI, SHOU', 'iki, ikiru', 'N5'],
    ['先', 'Ahead / Previous', 'SEN', 'saki', 'N5'],
    ['国', 'Country', 'KOKU', 'kuni', 'N5'],
    ['語', 'Language / Word', 'GO', 'kata, kataru', 'N5'],
    ['車', 'Car / Vehicle', 'SHA', 'kuruma', 'N5'],
    ['電', 'Electricity', 'DEN', 'inazuma', 'N5'],
    ['天', 'Heaven / Sky', 'TEN', 'ame, ama', 'N5'],
    ['気', 'Spirit / Energy', 'KI, KE', 'ki', 'N5'],
    ['雨', 'Rain', 'U', 'ame', 'N5'],
    ['花', 'Flower', 'KA', 'hana', 'N5'],
    ['山', 'Mountain', 'SAN', 'yama', 'N5']
];

// 3. Complete N5 Particles
const particlesList = [
    ['は', 'Topic marker (pronounced wa)', 'わたしはがくせいです。(I am a student.)'],
    ['が', 'Subject marker / emphasis', 'ねこがいます。(There is a cat.)'],
    ['を', 'Direct object marker (pronounced o)', 'みずをのみます。(I drink water.)'],
    ['に', 'Time / Destination / Target marker', '7じにおきます。(I wake up at 7 oclock.)'],
    ['で', 'Action location / Means / Tool', 'バスでいきます。(I go by bus.)'],
    ['へ', 'Direction / Heading towards (pronounced e)', 'にほんへいきます。(I am going to Japan.)'],
    ['と', 'And / Together with', 'ともだちといきます。(I go with a friend.)'],
    ['から', 'From (Starting point or reason)', '9じからです。(Starting from 9 oclock.)'],
    ['まで', 'Until / To (Ending point)', '5じまでべんきょうします。(I study until 5 oclock.)'],
    ['も', 'Also / Too / As well', 'わたしもがくせいです。(I am also a student.)'],
    ['の', 'Possessive / Association particle', 'わたしのほんです。(It is my book.)'],
    ['か', 'Question marker / Or', 'これはなんですか。(What is this?)'],
    ['ね', 'Seeking agreement (..., right?)', 'いいてんきですね。(Nice weather, isn’t it?)'],
    ['よ', 'Giving new information / Emphasis', 'おいしいですよ！(It is delicious, you know!)']
];

// 4. Accounts
const usersList = [
    ['admin_owner', 'admin@kotolab.com', 'admin123', 'admin'],
    ['demo_student', 'student@kotolab.com', 'user123', 'user']
];

async function seedDatabase() {
    try {
        console.log('⏳ Starting Full Database Seeding...');

        await db.query('DELETE FROM user_error_logs');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM kanji');
        await db.query('DELETE FROM grammar_particles');
        await db.query('DELETE FROM vocabulary');

        // Insert Users
        for (const u of usersList) {
            await db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', u);
        }
        console.log(`✅ Loaded Admin & User accounts!`);

        // Insert Kanji
        for (const k of kanjiList) {
            await db.query('INSERT INTO kanji (kanji_char, meaning, onyomi, kunyomi, jlpt_level) VALUES (?, ?, ?, ?, ?)', k);
        }
        console.log(`✅ Loaded ${kanjiList.length} N5 Kanji!`);

        // Insert Particles
        for (const p of particlesList) {
            await db.query('INSERT INTO grammar_particles (particle, function_meaning, example_sentence) VALUES (?, ?, ?)', p);
        }
        console.log(`✅ Loaded ${particlesList.length} N5 Grammar Particles!`);

        // Insert Vocab items from JSON
        for (const v of vocabList) {
            await db.query(
                'INSERT INTO vocabulary (japanese_word, reading, meaning, category, jlpt_level) VALUES (?, ?, ?, ?, ?)',
                [v.japanese_word, v.reading, v.meaning, v.category || 'general', v.jlpt_level || 'N5']
            );
        }
        console.log(`✅ Loaded ${vocabList.length} N5 Vocabulary words into MySQL Database!`);

        console.log('🎉 Database seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

seedDatabase();