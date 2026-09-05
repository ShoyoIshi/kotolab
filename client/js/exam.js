document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndUnlockExams();
});

// Safely get current user ID
function getCurrentUserId() {
    try {
        const storedUser = JSON.parse(localStorage.getItem('kotolab_user') || '{}');
        if (storedUser && storedUser.id) return storedUser.id;
    } catch(e) {}
    return 3; 
}

async function fetchAndUnlockExams() {
    const userId = getCurrentUserId();
    
    try {
        const res = await fetch(`/api/user/progress?userId=${userId}`);
        const data = await res.json();
        
        let accuracy = 0;
        if (data && !data.error && data.overall_accuracy !== undefined) {
            accuracy = Number(data.overall_accuracy);
        }

        // Update UI Text
        document.getElementById('exam-user-accuracy').innerText = `${accuracy.toFixed(0)}%`;

        // Progression Logic
        if (accuracy >= 40) unlockCard(2, 'var(--accent-green)');
        if (accuracy >= 60) unlockCard(3, 'var(--accent-orange)');
        if (accuracy >= 80) unlockCard(4, 'var(--accent-gold)');

    } catch(err) {
        console.error("Failed to fetch progress for exams", err);
    }
}

function unlockCard(levelNum, color) {
    const card = document.getElementById(`exam-card-${levelNum}`);
    if (!card) return;

    // Remove locked styles
    card.classList.remove('locked-card');
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
    card.style.background = '#1e293b';
    card.style.border = `2px solid ${color}`;

    // Update Text & Button
    const header = card.querySelector('div');
    header.innerText = header.innerText.replace('🔒', '🔓').trim();
    header.style.color = color;

    const btn = card.querySelector('button');
    btn.innerText = 'Start Exam';
    btn.style.background = color;
    btn.style.color = 'white';
}

function startExam(levelKey) {
    // This connects to the examBank.js we created earlier
    const examData = examBank[levelKey];
    console.log(`Starting ${examData.title}...`, examData.questions);
    
    // Yahan hum aage modal open karke questions render karne ka logic likhenge!
    alert(`Unlocking ${examData.title}!\nQuestions loaded: ${examData.questions.length}`);
}