let allQuestions = [];
let questionBlocks = [];
let currentBlockIndex = 0;
let userAnswers = {};
let questionStatuses = {};
let selectedCategory = '';

function prepareQuiz(category) {
    selectedCategory = category;
    document.getElementById('selectionScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    
    const title = document.getElementById('startTitle');
    const desc = document.getElementById('startDesc');
    const icon = document.getElementById('categoryIcon');
    
    if (category === 'LISTENING') {
        title.textContent = 'IELTS Listening Test';
        desc.textContent = 'This section evaluates your ability to understand main ideas and detailed factual information in spoken English.';
        icon.innerHTML = '<i data-lucide="headphones" style="width: 64px; height: 64px; color: var(--primary);"></i>';
    } else {
        title.textContent = 'IELTS Reading Test';
        desc.textContent = 'This section assesses your reading skills, including reading for gist, main ideas, and logical argument.';
        icon.innerHTML = '<i data-lucide="book-open" style="width: 64px; height: 64px; color: #10b981;"></i>';
    }
    if (window.lucide) lucide.createIcons();
}

async function startQuiz() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('examView').style.display = 'flex';
    document.getElementById('reviewBtn').style.display = 'flex';
    if (window.lucide) lucide.createIcons();

    try {
        const response = await fetch(`/api/quiz?category=${selectedCategory}`);
        const data = await response.json();
        
        if (data.success && data.questions.length > 0) {
            allQuestions = data.questions;
            groupQuestionsIntoBlocks();
            allQuestions.forEach(q => {
                userAnswers[q.id] = '';
                questionStatuses[q.id] = 'unanswered';
            });
            renderStatusGrid();
            renderCurrentBlock();
            setupAudioPlayer();
        }
    } catch (err) { console.error(err); }
}

function groupQuestionsIntoBlocks() {
    questionBlocks = [];
    let i = 0;
    while (i < allQuestions.length) {
        const q = allQuestions[i];
        if (q.sectionId) {
            const section = allQuestions.filter(item => item.sectionId === q.sectionId);
            questionBlocks.push(section);
            i += section.length;
        } else {
            questionBlocks.push([q]);
            i++;
        }
    }
}

function renderStatusGrid() {
    const grid = document.getElementById('statusGrid');
    grid.innerHTML = allQuestions.map((q, idx) => `
        <div class="grid-item" id="grid-item-${q.id}" onclick="jumpToQuestionId(${q.id})">${idx + 1}</div>
    `).join('');
    updateStatusGridUI();
}

function updateStatusGridUI() {
    allQuestions.forEach(q => {
        const el = document.getElementById(`grid-item-${q.id}`);
        if (!el) return;
        el.className = 'grid-item';
        const currentBlock = questionBlocks[currentBlockIndex];
        if (currentBlock.some(item => item.id === q.id)) el.classList.add('active');
        if (questionStatuses[q.id] === 'answered') el.classList.add('answered');
    });
}

function jumpToQuestionId(id) {
    const blockIdx = questionBlocks.findIndex(block => block.some(q => q.id === id));
    if (blockIdx !== -1) {
        currentBlockIndex = blockIdx;
        renderCurrentBlock();
        const panel = document.getElementById('reviewPanel');
        if (panel) panel.classList.remove('active');
    }
}

function renderCurrentBlock() {
    const block = questionBlocks[currentBlockIndex];
    const interaction = document.getElementById('quizInteraction');
    const resource = document.getElementById('resourceContainer');
    const audio = document.getElementById('quizAudio');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');

    updateStatusGridUI();

    const totalAnswered = Object.values(questionStatuses).filter(s => s !== 'unanswered').length;
    const progress = (totalAnswered / allQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    const firstQ = block[0];
    document.getElementById('categoryLabel').textContent = `${firstQ.category} SECTION`;
    
    // Adaptive Layout Logic
    const examView = document.getElementById('examView');
    if (firstQ.category === 'READING') {
        examView.className = 'exam-viewport mode-reading';
        if (firstQ.documentUrl) {
            resource.innerHTML = `<iframe src="${firstQ.documentUrl}" class="pdf-viewer"></iframe>`;
        }
        audio.pause();
        updateAudioIcons();
    } else {
        examView.className = 'exam-viewport mode-listening';
        if (firstQ.audioUrl && audio.src !== firstQ.audioUrl) {
            audio.src = firstQ.audioUrl;
            resetAudioUI();
        }
    }
    if (window.lucide) lucide.createIcons();

    // Interaction Management
    const blockStartIdx = allQuestions.findIndex(q => q.id === block[0].id) + 1;
    const blockEndIdx = allQuestions.findIndex(q => q.id === block[block.length - 1].id) + 1;
    document.getElementById('stepText').textContent = block.length > 1 ? `Questions ${blockStartIdx}-${blockEndIdx} of ${allQuestions.length}` : `Question ${blockStartIdx} of ${allQuestions.length}`;

    interaction.innerHTML = block.map(q => `
        <div style="margin-bottom: 48px; width: 100%;">
            <p class="question-text">
                <span style="color: var(--primary); margin-right: 8px;">${allQuestions.findIndex(item => item.id === q.id) + 1}.</span>
                ${q.questionText}
            </p>
            ${q.type === 'MCQ' ? `
                <div class="options-list">
                    ${q.options.map(opt => `
                        <button class="option-item ${userAnswers[q.id] === opt ? 'selected' : ''}" 
                                onclick="selectOptionBlock(${q.id}, '${opt.replace(/'/g, "\\'")}')">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            ` : `
                <input type="text" class="input-pro" placeholder="Type answer here..." 
                       value="${userAnswers[q.id] || ''}" oninput="handleShortInputBlock(event, ${q.id})"
                       style="width: 100%; padding: 16px; border: 2px solid var(--outline); border-radius: 12px; font-weight: 600;">
            `}
        </div>
    `).join('');

    backBtn.style.visibility = currentBlockIndex === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = currentBlockIndex === questionBlocks.length - 1 ? 'Finish Exam' : 'Next Section';
    checkNextButton();
}

function selectOptionBlock(qId, val) {
    userAnswers[qId] = val;
    questionStatuses[qId] = 'answered';
    renderCurrentBlock();
}

function handleShortInputBlock(e, qId) {
    const val = e.target.value.trim();
    userAnswers[qId] = val;
    questionStatuses[qId] = val !== '' ? 'answered' : 'unanswered';
    checkNextButton();
    updateStatusGridUI();
}

function checkNextButton() {
    const block = questionBlocks[currentBlockIndex];
    const allDone = block.every(q => questionStatuses[q.id] === 'answered');
    document.getElementById('nextBtn').disabled = !allDone;
}

function handleBack() { if (currentBlockIndex > 0) { currentBlockIndex--; renderCurrentBlock(); } }
function handleNext() { if (currentBlockIndex < questionBlocks.length - 1) { currentBlockIndex++; renderCurrentBlock(); } else { submitQuiz(); } }

function setupAudioPlayer() {
    const audio = document.getElementById('quizAudio');
    const toggleSticky = document.getElementById('audioToggleSticky');
    const progressSticky = document.getElementById('audioProgressSticky');
    const timer = document.getElementById('audioTimer');

    const handleToggle = () => {
        if (audio.paused) audio.play();
        else audio.pause();
        updateAudioIcons();
    };

    if (toggleSticky) toggleSticky.onclick = handleToggle;

    const progressContainer = document.getElementById('audioProgressContainerSticky');
    if (progressContainer) {
        progressContainer.onclick = (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        };
    }

    audio.ontimeupdate = () => {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressSticky) progressSticky.style.width = `${pct}%`;
        
        if (timer) {
            const cur = formatTime(audio.currentTime);
            const dur = formatTime(audio.duration || 0);
            timer.textContent = `${cur} / ${dur}`;
        }
    };
    audio.onended = () => { resetAudioUI(); };
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateAudioIcons() {
    const audio = document.getElementById('quizAudio');
    const isPaused = audio.paused;
    const p2 = document.getElementById('playIconSticky');
    const s2 = document.getElementById('pauseIconSticky');
    if (p2) p2.style.display = isPaused ? 'block' : 'none';
    if (s2) s2.style.display = isPaused ? 'none' : 'block';
}

function resetAudioUI() {
    updateAudioIcons();
    const progressSticky = document.getElementById('audioProgressSticky');
    if (progressSticky) progressSticky.style.width = '0%';
}

async function submitQuiz() {
    const payload = { 
        answers: allQuestions.map(q => ({ questionId: q.id, answer: userAnswers[q.id] })),
        category: selectedCategory
    };
    try {
        const res = await fetch('/api/quiz/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
            document.getElementById('examView').style.display = 'none';
            document.getElementById('resultsScreen').style.display = 'flex';
            document.getElementById('scoreDisplay').textContent = data.score;
        }
    } catch (err) { console.error(err); }
}

async function emailResults() {
    const email = document.getElementById('userEmail').value;
    if (!email.includes('@')) return;
    try {
        const res = await fetch('/api/quiz/email-results', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email, score: document.getElementById('scoreDisplay').textContent, category: selectedCategory }) 
        });
        const data = await res.json();
        if (data.success) alert('Results sent!');
    } catch (err) { console.error(err); }
}

function toggleReviewPanel() {
    const panel = document.getElementById('reviewPanel');
    if (panel) panel.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    const panel = document.getElementById('reviewPanel');
    const btn = document.getElementById('reviewBtn');
    if (panel && panel.classList.contains('active') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('active');
    }
});

if (window.lucide) lucide.createIcons();
