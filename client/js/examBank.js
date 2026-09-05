// ==========================================
// KotoLab Pre-Built JLPT N5 Exam Bank
// ==========================================

const examBank = {
    level1: {
        title: "N5 Starter Certification",
        unlockThreshold: 0,
        questions: [
            { type: "vocab", q: "「食べる」 in English is:", options: ["To drink", "To eat", "To sleep", "To go"], correct: 1 },
            { type: "particle", q: "わたし ___ 学生です。", options: ["が", "を", "は", "に"], correct: 2 },
            { type: "grammar", q: "きのう、どこへ ___ か。", options: ["いきます", "いきました", "いかない", "いって"], correct: 1 },
            { type: "vocab", q: "「あした」 means:", options: ["Today", "Yesterday", "Tomorrow", "Next Week"], correct: 2 },
            { type: "particle", q: "コーヒー ___ のみます。", options: ["に", "で", "を", "が"], correct: 2 }
        ]
    },
    level2: {
        title: "N5 Intermediate Certification",
        unlockThreshold: 40,
        questions: [
            { type: "particle", q: "としょかん ___ ほんを よみます。", options: ["に", "で", "へ", "を"], correct: 1 },
            { type: "grammar", q: "えんぴつで てがみを ___ 。", options: ["かきます", "かきません", "かいて", "かいた"], correct: 0 },
            { type: "vocab", q: "Which one is 'Hospital'?", options: ["がっこう", "びょういん", "えき", "ぎんこう"], correct: 1 },
            { type: "kanji", q: "「水」を のみます。What is the reading?", options: ["みず", "き", "ひ", "つち"], correct: 0 },
            { type: "grammar", q: "いっしょに えいがを ___ か。", options: ["みます", "みませんか", "みて", "みましょう"], correct: 1 }
        ]
    },
    level3: {
        title: "N5 Advanced Certification",
        unlockThreshold: 60,
        questions: [
            { type: "star_pattern", q: "つくえの ( 1 ) ( 2 ) ( ★ ) ( 4 ) あります。", parts: ["に", "が", "うえ", "かばん"], correctSequence: [3, 1, 4, 2], correctTarget: 4, options: ["に", "が", "うえ", "かばん"], correct: 3 },
            { type: "kanji", q: "「右」に まがります。What is the reading?", options: ["ひだり", "みぎ", "まえ", "うしろ"], correct: 1 },
            { type: "grammar", q: "あついから、まどを ___ ください。", options: ["あけ", "あけて", "あけても", "あけないで"], correct: 1 },
            { type: "reading", q: "【Passage】まいにち ７じに おきます。あさごはんは パンと コーヒーです。<br>Question: このひとは あさ なにを たべますか。", options: ["パンだけ", "コーヒーだけ", "パンと コーヒー", "ごはん"], correct: 2 },
            { type: "particle", q: "だれ ___ きましたか。… たなかさんが きました。", options: ["は", "が", "を", "も"], correct: 1 }
        ]
    },
    level4: {
        title: "N5 Mastery Certification",
        unlockThreshold: 80,
        questions: [
            { type: "star_pattern", q: "わたしは ( 1 ) ( 2 ) ( ★ ) ( 4 ) いきません。", parts: ["は", "どこ", "へ", "も"], correctSequence: [2, 3, 4, 1], correctTarget: 4, options: ["は", "どこ", "へ", "も"], correct: 3 },
            { type: "kanji", q: "「金曜日」の よみかたは？", options: ["げつようび", "かようび", "きんようび", "もくようび"], correct: 2 },
            { type: "reading", q: "【Passage】きのうは あめでしたから、どこへも いきませんでした。うちで ほんを よみました。<br>Question: きのう、なにを しましたか。", options: ["えいがを みました", "かいものに いきました", "うちで ほんを よみました", "がっこうへ いきました"], correct: 2 },
            { type: "grammar", q: "この かばんは ___ ですか。… ３０００えんです。", options: ["いくつ", "いくら", "どこ", "だれ"], correct: 1 },
            { type: "particle", q: "きのう、ともだち ___ えいがを みました。", options: ["と", "に", "へ", "で"], correct: 0 }
        ]
    }
};