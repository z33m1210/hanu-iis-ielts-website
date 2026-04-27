let currentCategory = '';

document.addEventListener('DOMContentLoaded', async () => {
    if (window.lucide) lucide.createIcons();

    const form = document.getElementById('questionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveQuestion();
        });
    }
});

function selectCategory(cat) {
    currentCategory = cat;
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('categoryBackButton').style.display = 'block';
    document.getElementById('adminViewSubtitle').textContent = `Managing ${cat.toLowerCase()} questions.`;
    document.getElementById('currentCategoryTitle').textContent = `${cat.charAt(0) + cat.slice(1).toLowerCase()} Questions`;
    loadQuestions();
}

function resetAdminView() {
    currentCategory = '';
    document.getElementById('categorySelection').style.display = 'grid';
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('categoryBackButton').style.display = 'none';
    document.getElementById('adminViewSubtitle').textContent = 'Choose a category to manage questions.';
}

async function loadQuestions() {
    const list = document.getElementById('questionsList');
    list.innerHTML = '<p>Loading questions...</p>';
    try {
        const data = await Auth.fetchWithAuth('/quiz/admin/all');
        if (data.success) {
            const filtered = data.questions.filter(q => q.category === currentCategory);
            
            if (currentCategory === 'READING') {
                renderReadingGroups(filtered, list);
            } else {
                renderListeningList(filtered, list);
            }
            lucide.createIcons();
        }
    } catch (err) { console.error(err); }
}

function renderReadingGroups(questions, container) {
    // Group by sectionId
    const groups = questions.reduce((acc, q) => {
        const sid = q.sectionId || 'UNGROUPED';
        if (!acc[sid]) acc[sid] = [];
        acc[sid].push(q);
        return acc;
    }, {});

    container.innerHTML = Object.entries(groups).map(([sid, qs]) => `
        <div class="section-group">
            <div class="section-header">
                <div>
                    <h3>Section: ${sid}</h3>
                    <div style="font-size: 11px; color: var(--primary); margin-top: 4px;">Passage: ${qs[0].documentUrl || 'None'}</div>
                </div>
                <span class="badge-type" style="background: #e2e8f0; color: #475569;">${qs.length} Questions</span>
            </div>
            <div class="section-questions">
                ${qs.map(q => renderQuestionCard(q)).join('')}
            </div>
        </div>
    `).join('') || '<p style="text-align:center; color: var(--on-surface-variant); padding: 40px;">No questions found for this category.</p>';
}

function renderListeningList(questions, container) {
    container.innerHTML = questions.map(q => renderQuestionCard(q)).join('') || '<p style="text-align:center; color: var(--on-surface-variant); padding: 40px;">No questions found for this category.</p>';
}

function renderQuestionCard(q) {
    return `
        <div class="question-card">
            <div class="question-header">
                <div>
                    <span class="badge-type ${q.type === 'MCQ' ? 'badge-mcq' : 'badge-short'}">${q.type}</span>
                    <span style="font-size: 0.75rem; color: var(--on-surface-variant); margin-left: 12px; font-weight: 600;">ID: ${q.id}</span>
                </div>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editQuestion(${JSON.stringify(q).replace(/"/g, '&quot;')})"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon btn-delete" onclick="deleteQuestion(${q.id})"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <p style="font-weight: 600; margin: 0;">${q.questionText}</p>
        </div>
    `;
}

function toggleCategory() {
    const cat = document.getElementById('qCategory').value;
    document.getElementById('listeningResource').style.display = cat === 'LISTENING' ? 'block' : 'none';
    document.getElementById('readingResource').style.display = cat === 'READING' ? 'block' : 'none';
}

function toggleOptions() {
    const type = document.getElementById('qType').value;
    const container = document.getElementById('mcqOptions');
    if (type === 'MCQ') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function openModal(editing = false) {
    document.getElementById('questionModal').classList.add('active');
    if (!editing) {
        document.getElementById('questionForm').reset();
        document.getElementById('questionId').value = '';
        document.getElementById('qCategory').value = currentCategory;
        toggleCategory();
        toggleOptions();
    }
}

function closeModal() { document.getElementById('questionModal').classList.remove('active'); }

async function saveQuestion() {
    const id = document.getElementById('questionId').value;
    const payload = {
        category: document.getElementById('qCategory').value,
        type: document.getElementById('qType').value,
        questionText: document.getElementById('qText').value,
        correctAnswer: document.getElementById('qCorrect').value,
        sectionId: document.getElementById('qSectionId').value,
        audioUrl: document.getElementById('qAudioUrl').value,
        documentUrl: document.getElementById('qDocumentUrl').value
    };

    if (payload.type === 'MCQ') {
        const opts = document.querySelectorAll('.q-option');
        payload.options = Array.from(opts).map(i => i.value).filter(v => v.trim() !== '');
        // For existing options that were added dynamically
        if (payload.options.length === 0) {
            // Check the container if it was populated during edit
        }
    }

    const url = id ? `/quiz/admin/update/${id}` : '/quiz/admin/create';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await Auth.fetchWithAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.success) { closeModal(); loadQuestions(); }
    } catch (err) { console.error(err); }
}

function editQuestion(q) {
    openModal(true);
    document.getElementById('questionId').value = q.id;
    document.getElementById('qCategory').value = q.category;
    document.getElementById('qType').value = q.type;
    document.getElementById('qText').value = q.questionText;
    document.getElementById('qCorrect').value = q.correctAnswer;
    document.getElementById('qSectionId').value = q.sectionId || '';
    document.getElementById('qAudioUrl').value = q.audioUrl || '';
    document.getElementById('qDocumentUrl').value = q.documentUrl || '';

    if (q.type === 'MCQ' && q.options) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = q.options.map(opt => `
            <div class="option-item">
                <input type="text" class="form-control q-option" value="${opt}" required>
                <button type="button" class="btn-icon btn-delete" onclick="this.parentElement.remove()">×</button>
            </div>
        `).join('');
    } else {
        document.getElementById('optionsContainer').innerHTML = '';
    }
    toggleCategory();
    toggleOptions();
}

function addOption() {
    const container = document.getElementById('optionsContainer');
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
        <input type="text" class="form-control q-option" placeholder="New Option" required>
        <button type="button" class="btn-icon btn-delete" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

async function deleteQuestion(id) {
    if (confirm('Delete this question?')) {
        const res = await Auth.fetchWithAuth(`/quiz/admin/delete/${id}`, { method: 'DELETE' });
        if (res.success) loadQuestions();
    }
}
