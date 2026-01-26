// ========================================
// CREATIX ADMIN PANEL JS
// ========================================

// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (!data.isAuthenticated) {
            window.location.href = '/admin';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin';
    }
}

// Toast уведомления
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success'
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Навигация по секциям
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.admin-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;

            // Обновляем активный пункт меню
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Показываем нужную секцию
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Выход из системы
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/admin';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// ========================================
// КОНТАКТЫ
// ========================================

async function loadContacts() {
    try {
        const response = await fetch('/api/contacts');
        const data = await response.json();

        document.getElementById('phone').value = data.phone || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('vk').value = data.social?.vk || '';
        document.getElementById('telegram').value = data.social?.telegram || '';
        document.getElementById('whatsapp').value = data.social?.whatsapp || '';
    } catch (error) {
        console.error('Load contacts failed:', error);
        showToast('Ошибка загрузки контактов', 'error');
    }
}

// Показать ошибку под полем контактов
function showContactFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    field.classList.add('error');

    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;

    field.parentElement.appendChild(errorEl);
}

// Очистить ошибку контактов
function clearContactFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
}

// Очистить все ошибки контактов
function clearContactErrors() {
    const form = document.getElementById('contactsForm');
    if (!form) return;

    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Валидация URL
function isValidUrl(url) {
    if (!url) return true; // Пустое значение допустимо
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Валидация российского телефона
function isValidRussianPhone(phone) {
    // Убираем все кроме цифр
    const digits = phone.replace(/\D/g, '');
    // Российский номер: 11 цифр (с 7 или 8 в начале) или 10 цифр (без кода страны)
    if (digits.length === 11) {
        return digits.startsWith('7') || digits.startsWith('8');
    }
    if (digits.length === 10) {
        return digits.startsWith('9'); // Мобильные начинаются с 9
    }
    return false;
}

// Валидация формы контактов
function validateContactsForm() {
    clearContactErrors();

    let hasErrors = false;
    let firstErrorField = null;

    // Проверка телефона
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
        showContactFieldError('phone', 'Введите номер телефона');
        if (!firstErrorField) firstErrorField = 'phone';
        hasErrors = true;
    } else if (!isValidRussianPhone(phone)) {
        showContactFieldError('phone', 'Введите корректный номер (+7 XXX XXX-XX-XX)');
        if (!firstErrorField) firstErrorField = 'phone';
        hasErrors = true;
    }

    // Проверка email
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showContactFieldError('email', 'Введите email');
        if (!firstErrorField) firstErrorField = 'email';
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showContactFieldError('email', 'Некорректный email');
        if (!firstErrorField) firstErrorField = 'email';
        hasErrors = true;
    }

    // Проверка VK (если заполнено)
    const vk = document.getElementById('vk').value.trim();
    if (vk && !isValidUrl(vk)) {
        showContactFieldError('vk', 'Введите корректную ссылку');
        if (!firstErrorField) firstErrorField = 'vk';
        hasErrors = true;
    }

    // Проверка Telegram (если заполнено)
    const telegram = document.getElementById('telegram').value.trim();
    if (telegram && !isValidUrl(telegram)) {
        showContactFieldError('telegram', 'Введите корректную ссылку');
        if (!firstErrorField) firstErrorField = 'telegram';
        hasErrors = true;
    }

    return {
        valid: !hasErrors,
        firstErrorField
    };
}

function initContactsForm() {
    const form = document.getElementById('contactsForm');

    // Очистка ошибок при вводе
    const contactFields = ['phone', 'email', 'address', 'vk', 'telegram', 'whatsapp'];
    contactFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => clearContactFieldError(fieldId));
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Валидация
        const validation = validateContactsForm();
        if (!validation.valid) {
            if (validation.firstErrorField) {
                document.getElementById(validation.firstErrorField).focus();
            }
            return;
        }

        const formData = {
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            social: {
                vk: document.getElementById('vk').value.trim(),
                telegram: document.getElementById('telegram').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.trim()
            }
        };

        try {
            const response = await fetch('/api/contacts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showToast('Контакты сохранены!');
            } else {
                showToast(data.error || 'Ошибка сохранения', 'error');
            }
        } catch (error) {
            console.error('Save contacts failed:', error);
            showToast('Ошибка сохранения', 'error');
        }
    });
}

// ========================================
// ПОРТФОЛИО
// ========================================

let portfolioData = [];
let isEditMode = false; // true = редактирование, false = добавление
let newProjectDraft = null; // черновик для нового проекта

async function loadPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        portfolioData = await response.json();
        renderPortfolio();
    } catch (error) {
        console.error('Load portfolio failed:', error);
        showToast('Ошибка загрузки портфолио', 'error');
    }
}

function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');

    if (portfolioData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-gray);">
                <p>Нет проектов. Добавьте первый проект!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = portfolioData.map(project => `
        <div class="portfolio-admin-card" data-id="${project.id}">
            <img src="${project.image || '/images/placeholder.png'}" alt="${project.title}" class="portfolio-card-image"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231a1a25%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Нет изображения</text></svg>'">
            <div class="portfolio-card-content">
                <div class="portfolio-card-category">${project.category}</div>
                <h3 class="portfolio-card-title">${project.title}</h3>
                <p class="portfolio-card-desc">${project.description || 'Нет описания'}</p>
            </div>
            <div class="portfolio-card-actions">
                <button class="btn btn-outline edit-project" data-id="${project.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Редактировать
                </button>
                <button class="btn btn-danger delete-project" data-id="${project.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Удалить
                </button>
            </div>
        </div>
    `).join('');

    // Добавляем обработчики событий
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', () => editProject(btn.dataset.id));
    });

    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });
}

// Модальное окно
function initModal() {
    const modal = document.getElementById('projectModal');
    const addBtn = document.getElementById('addProjectBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');

    addBtn.addEventListener('click', () => {
        isEditMode = false;

        // Если есть черновик - восстанавливаем его
        if (newProjectDraft) {
            restoreFromDraft(newProjectDraft);
        } else {
            resetProjectForm();
        }

        document.getElementById('modalTitle').textContent = 'Добавить проект';
        modal.classList.add('active');
    });

    // Закрытие по X - сохраняем данные (просто скрываем модалку)
    closeBtn.addEventListener('click', closeModalKeepData);

    // Отмена - очищаем данные
    cancelBtn.addEventListener('click', closeModalClearData);

    // Клик по overlay - сохраняем данные
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalKeepData();
    });
}

function openModal(project = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('modalTitle');
    const preview = document.getElementById('filePreview');

    // Сбрасываем форму
    resetProjectForm();

    // Режим редактирования
    isEditMode = true;

    if (project) {
        title.textContent = 'Редактировать проект';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectTheme').value = project.theme || 'default';

        if (project.image) {
            preview.innerHTML = `<img src="${project.image}" alt="Preview">`;
        }

        // Заполняем детали проекта
        const details = project.details || {};

        document.getElementById('projectClient').value = details.client || '';
        document.getElementById('projectYear').value = details.year || '';
        document.getElementById('projectDuration').value = details.duration || '';
        document.getElementById('projectProblem').value = details.problem || '';
        document.getElementById('projectSolution').value = details.solution || '';

        // Технологии
        if (details.technologies && details.technologies.length > 0) {
            document.getElementById('projectTechnologies').value = details.technologies.join(', ');
        }

        // Результаты
        if (details.results && details.results.length > 0) {
            details.results.forEach(result => {
                addResultRow(result.label, result.value);
            });
        }

        // Галерея (без главного изображения)
        if (details.gallery && details.gallery.length > 0) {
            existingGallery = details.gallery.filter(img => img !== project.image);
            renderGalleryPreview();
        }
    } else {
        title.textContent = 'Добавить проект';
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('projectModal').classList.remove('active');
    resetProjectForm();
}

// Закрытие модалки с сохранением данных (по X или клику на overlay)
function closeModalKeepData() {
    // Если это режим добавления - сохраняем черновик
    if (!isEditMode) {
        newProjectDraft = saveToDraft();
    }
    document.getElementById('projectModal').classList.remove('active');
}

// Закрытие модалки с очисткой данных (по кнопке "Отмена")
function closeModalClearData() {
    document.getElementById('projectModal').classList.remove('active');

    // Только при добавлении нового проекта очищаем форму и черновик
    if (!isEditMode) {
        resetProjectForm();
        newProjectDraft = null;
    }
    // При редактировании - просто закрываем модалку
}

// Сохранение данных формы в черновик
function saveToDraft() {
    return {
        title: document.getElementById('projectTitle').value,
        category: document.getElementById('projectCategory').value,
        description: document.getElementById('projectDescription').value,
        theme: document.getElementById('projectTheme').value,
        client: document.getElementById('projectClient').value,
        year: document.getElementById('projectYear').value,
        duration: document.getElementById('projectDuration').value,
        problem: document.getElementById('projectProblem').value,
        solution: document.getElementById('projectSolution').value,
        technologies: document.getElementById('projectTechnologies').value,
        results: getResultsData(),
        existingGallery: [...existingGallery]
    };
}

// Восстановление данных из черновика
function restoreFromDraft(draft) {
    resetProjectForm();

    document.getElementById('projectTitle').value = draft.title || '';
    document.getElementById('projectCategory').value = draft.category || '';
    document.getElementById('projectDescription').value = draft.description || '';
    document.getElementById('projectTheme').value = draft.theme || 'default';
    document.getElementById('projectClient').value = draft.client || '';
    document.getElementById('projectYear').value = draft.year || '';
    document.getElementById('projectDuration').value = draft.duration || '';
    document.getElementById('projectProblem').value = draft.problem || '';
    document.getElementById('projectSolution').value = draft.solution || '';
    document.getElementById('projectTechnologies').value = draft.technologies || '';

    // Результаты
    if (draft.results && draft.results.length > 0) {
        draft.results.forEach(result => {
            addResultRow(result.label, result.value);
        });
    }

    // Галерея
    if (draft.existingGallery && draft.existingGallery.length > 0) {
        existingGallery = [...draft.existingGallery];
        renderGalleryPreview();
    }
}

function editProject(id) {
    const project = portfolioData.find(p => p.id === id);
    if (project) {
        openModal(project);
    }
}

async function deleteProject(id) {
    if (!confirm('Удалить этот проект?')) return;

    try {
        const response = await fetch(`/api/portfolio/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Проект удалён!');
            loadPortfolio();
        } else {
            showToast(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Delete project failed:', error);
        showToast('Ошибка удаления', 'error');
    }
}

// Хранилище для галереи
let galleryFiles = [];
let existingGallery = [];

// Очистка ошибки при вводе в поле
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
}

// Форма проекта
function initProjectForm() {
    const form = document.getElementById('projectForm');
    const fileInput = document.getElementById('projectImage');
    const fileUpload = document.getElementById('fileUpload');
    const filePreview = document.getElementById('filePreview');

    // Инициализация вкладок
    initFormTabs();

    // Очистка ошибок при вводе
    const fieldsToWatch = ['projectTitle', 'projectCategory', 'projectDescription', 'projectProblem', 'projectSolution'];
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => clearFieldError(fieldId));
        }
    });

    // Инициализация результатов
    initResultsSection();

    // Инициализация галереи
    initGallerySection();

    // Клик по области загрузки
    fileUpload.addEventListener('click', () => fileInput.click());

    // Drag & drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragover');
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragover');
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            showFilePreview(files[0]);
        }
    });

    // Выбор файла
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showFilePreview(fileInput.files[0]);
        }
    });

    // Вставка из буфера обмена (Ctrl+V)
    document.addEventListener('paste', (e) => {
        // Проверяем, что модалка открыта
        const modal = document.getElementById('projectModal');
        if (!modal || !modal.classList.contains('active')) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        const items = clipboardData.items;

        let imageFile = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                imageFile = items[i].getAsFile();
                break;
            }
        }

        if (imageFile) {
            e.preventDefault();

            // Проверяем активную вкладку
            const activeTab = document.querySelector('.form-tab.active');
            const isGalleryTab = activeTab && activeTab.dataset.tab === 'gallery';

            if (isGalleryTab) {
                // Добавляем в галерею
                addGalleryImage(imageFile);
                showToast('Изображение добавлено в галерею');
            } else {
                // Добавляем как основное изображение
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(imageFile);
                fileInput.files = dataTransfer.files;

                showFilePreview(imageFile);
                showToast('Изображение вставлено из буфера обмена');

                fileUpload.classList.add('dragover');
                setTimeout(() => fileUpload.classList.remove('dragover'), 500);
            }
        }
    });

    // Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Валидация формы
        const validationResult = validateProjectForm();
        if (!validationResult.valid) {
            // Переключаемся на вкладку с первой ошибкой
            if (validationResult.tab) {
                switchToTab(validationResult.tab);
            }
            // Фокус на первое поле с ошибкой
            if (validationResult.field) {
                const field = document.getElementById(validationResult.field);
                if (field) {
                    field.focus();
                }
            }
            return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('projectTitle').value.trim());
        formData.append('category', document.getElementById('projectCategory').value.trim());
        formData.append('description', document.getElementById('projectDescription').value.trim());
        formData.append('theme', document.getElementById('projectTheme').value);

        // Основное изображение
        if (fileInput.files.length > 0) {
            formData.append('image', fileInput.files[0]);
        }

        // Детали проекта
        const details = {
            client: document.getElementById('projectClient').value.trim(),
            year: document.getElementById('projectYear').value.trim(),
            duration: document.getElementById('projectDuration').value.trim(),
            problem: document.getElementById('projectProblem').value.trim(),
            solution: document.getElementById('projectSolution').value.trim(),
            results: getResultsData(),
            technologies: getTechnologiesData(),
            gallery: existingGallery
        };

        formData.append('details', JSON.stringify(details));

        // Новые изображения галереи
        galleryFiles.forEach((file, index) => {
            formData.append('galleryImages', file);
        });

        const projectId = document.getElementById('projectId').value;
        const isEdit = !!projectId;

        try {
            const response = await fetch(
                isEdit ? `/api/portfolio/${projectId}` : '/api/portfolio',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.success) {
                showToast(isEdit ? 'Проект обновлён!' : 'Проект добавлен!');
                newProjectDraft = null; // Очищаем черновик после успешного сохранения
                closeModal();
                loadPortfolio();
            } else {
                showToast(data.error || 'Ошибка сохранения', 'error');
            }
        } catch (error) {
            console.error('Save project failed:', error);
            showToast('Ошибка сохранения', 'error');
        }
    });
}

// Вкладки формы
function initFormTabs() {
    const tabs = document.querySelectorAll('.form-tab');
    const contents = document.querySelectorAll('.form-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchToTab(tabId);
        });
    });
}

// Переключение на конкретную вкладку
function switchToTab(tabId) {
    const tabs = document.querySelectorAll('.form-tab');
    const contents = document.querySelectorAll('.form-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    const targetTab = document.querySelector(`.form-tab[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(`tab-${tabId}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

// Очистка всех ошибок формы
function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// Показать ошибку под полем
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Удаляем старую ошибку если есть
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    // Добавляем класс ошибки
    field.classList.add('error');

    // Создаём элемент ошибки
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;

    // Вставляем после поля
    field.parentElement.appendChild(errorEl);
}

// Показать ошибку для зоны загрузки файла
function showFileUploadError(message) {
    const fileUpload = document.getElementById('fileUpload');
    if (!fileUpload) return;

    // Удаляем старую ошибку
    const existingError = fileUpload.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    fileUpload.classList.add('error');

    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;

    fileUpload.parentElement.appendChild(errorEl);
}

// Валидация формы проекта
function validateProjectForm() {
    // Очищаем все предыдущие ошибки
    clearAllErrors();

    const projectId = document.getElementById('projectId').value;
    const isEdit = !!projectId;
    let firstErrorTab = null;
    let firstErrorField = null;
    let hasErrors = false;

    // Проверка названия
    const title = document.getElementById('projectTitle').value.trim();
    if (!title) {
        showFieldError('projectTitle', 'Введите название проекта');
        if (!firstErrorTab) { firstErrorTab = 'basic'; firstErrorField = 'projectTitle'; }
        hasErrors = true;
    } else if (title.length < 2) {
        showFieldError('projectTitle', 'Минимум 2 символа');
        if (!firstErrorTab) { firstErrorTab = 'basic'; firstErrorField = 'projectTitle'; }
        hasErrors = true;
    }

    // Проверка категории
    const category = document.getElementById('projectCategory').value.trim();
    if (!category) {
        showFieldError('projectCategory', 'Введите категорию проекта');
        if (!firstErrorTab) { firstErrorTab = 'basic'; firstErrorField = 'projectCategory'; }
        hasErrors = true;
    }

    // Проверка описания
    const description = document.getElementById('projectDescription').value.trim();
    if (!description) {
        showFieldError('projectDescription', 'Введите краткое описание');
        if (!firstErrorTab) { firstErrorTab = 'basic'; firstErrorField = 'projectDescription'; }
        hasErrors = true;
    } else if (description.length < 20) {
        showFieldError('projectDescription', 'Минимум 20 символов');
        if (!firstErrorTab) { firstErrorTab = 'basic'; firstErrorField = 'projectDescription'; }
        hasErrors = true;
    }

    // Проверка изображения (только для нового проекта)
    const fileInput = document.getElementById('projectImage');
    const filePreview = document.getElementById('filePreview');
    const hasExistingImage = filePreview && filePreview.querySelector('img');
    const hasNewImage = fileInput && fileInput.files.length > 0;

    if (!isEdit && !hasNewImage && !hasExistingImage) {
        showFileUploadError('Добавьте главное изображение');
        if (!firstErrorTab) { firstErrorTab = 'basic'; }
        hasErrors = true;
    }

    // Проверка деталей проекта
    const problem = document.getElementById('projectProblem').value.trim();
    if (!problem) {
        showFieldError('projectProblem', 'Опишите проблему клиента');
        if (!firstErrorTab) { firstErrorTab = 'details'; firstErrorField = 'projectProblem'; }
        hasErrors = true;
    }

    const solution = document.getElementById('projectSolution').value.trim();
    if (!solution) {
        showFieldError('projectSolution', 'Опишите решение');
        if (!firstErrorTab) { firstErrorTab = 'details'; firstErrorField = 'projectSolution'; }
        hasErrors = true;
    }

    if (hasErrors) {
        return {
            valid: false,
            tab: firstErrorTab,
            field: firstErrorField
        };
    }

    return { valid: true };
}

// Секция результатов
function initResultsSection() {
    const addBtn = document.getElementById('addResult');
    if (addBtn) {
        addBtn.addEventListener('click', () => addResultRow());
    }
}

function addResultRow(label = '', value = '') {
    const container = document.getElementById('resultsContainer');
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
        <div class="input-group">
            <label>Показатель</label>
            <input type="text" class="result-label" placeholder="Рост выручки" value="${label}">
        </div>
        <div class="input-group">
            <label>Значение</label>
            <input type="text" class="result-value" placeholder="+40%" value="${value}">
        </div>
        <button type="button" class="btn-remove-result" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    container.appendChild(row);
}

function getResultsData() {
    const rows = document.querySelectorAll('.result-row');
    const results = [];
    rows.forEach(row => {
        const label = row.querySelector('.result-label').value.trim();
        const value = row.querySelector('.result-value').value.trim();
        if (label && value) {
            results.push({ label, value });
        }
    });
    return results;
}

function getTechnologiesData() {
    const input = document.getElementById('projectTechnologies');
    if (!input || !input.value.trim()) return [];
    return input.value.split(',').map(t => t.trim()).filter(t => t);
}

// Секция галереи
function initGallerySection() {
    const uploadArea = document.getElementById('galleryUploadArea');
    const fileInput = document.getElementById('galleryImages');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        files.forEach(file => addGalleryImage(file));
    });

    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        files.forEach(file => addGalleryImage(file));
        fileInput.value = '';
    });
}

function addGalleryImage(file) {
    galleryFiles.push(file);
    renderGalleryPreview();
}

function removeGalleryImage(index, isExisting = false) {
    if (isExisting) {
        existingGallery.splice(index, 1);
    } else {
        galleryFiles.splice(index, 1);
    }
    renderGalleryPreview();
}

function renderGalleryPreview() {
    const preview = document.getElementById('galleryPreview');
    if (!preview) return;

    preview.innerHTML = '';

    // Существующие изображения
    existingGallery.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-preview-item existing';
        item.innerHTML = `
            <img src="${url}" alt="Gallery image">
            <button type="button" class="remove-gallery-image" onclick="removeGalleryImage(${index}, true)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        preview.appendChild(item);
    });

    // Новые файлы
    galleryFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-preview-item';

        const reader = new FileReader();
        reader.onload = (e) => {
            item.innerHTML = `
                <img src="${e.target.result}" alt="Gallery image">
                <button type="button" class="remove-gallery-image" onclick="removeGalleryImage(${index}, false)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
        };
        reader.readAsDataURL(file);
        preview.appendChild(item);
    });
}

function showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const fileUpload = document.getElementById('fileUpload');

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);

        // Очищаем ошибку загрузки файла
        if (fileUpload) {
            fileUpload.classList.remove('error');
            const errorEl = fileUpload.parentElement.querySelector('.field-error');
            if (errorEl) errorEl.remove();
        }
    }
}

// Сброс формы при закрытии
function resetProjectForm() {
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('resultsContainer').innerHTML = '';
    document.getElementById('galleryPreview').innerHTML = '';
    galleryFiles = [];
    existingGallery = [];

    // Очищаем все ошибки валидации
    clearAllErrors();

    // Сброс вкладок на первую
    document.querySelectorAll('.form-tab').forEach((t, i) => {
        t.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.form-tab-content').forEach((c, i) => {
        c.classList.toggle('active', i === 0);
    });
}

// ========================================
// ЗАЯВКИ
// ========================================

let submissionsData = [];
let currentFilter = 'all';

async function loadSubmissions() {
    try {
        const response = await fetch('/api/submissions');
        submissionsData = await response.json();
        renderSubmissions();
        updateSubmissionsBadge();
    } catch (error) {
        console.error('Load submissions failed:', error);
        showToast('Ошибка загрузки заявок', 'error');
    }
}

async function loadSubmissionsCount() {
    try {
        const response = await fetch('/api/submissions/count');
        const data = await response.json();
        const badge = document.getElementById('submissionsBadge');
        if (badge) {
            if (data.new > 0) {
                badge.textContent = data.new;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Load submissions count failed:', error);
    }
}

function updateSubmissionsBadge() {
    const badge = document.getElementById('submissionsBadge');
    if (badge) {
        const newCount = submissionsData.filter(s => !s.isRead).length;
        if (newCount > 0) {
            badge.textContent = newCount;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderSubmissions() {
    const list = document.getElementById('submissionsList');
    if (!list) return;

    // Фильтрация
    let filtered = submissionsData;
    if (currentFilter === 'new') {
        filtered = submissionsData.filter(s => !s.isRead);
    } else if (currentFilter === 'read') {
        filtered = submissionsData.filter(s => s.isRead);
    }

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="submissions-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>${currentFilter === 'all' ? 'Заявок пока нет' : currentFilter === 'new' ? 'Нет новых заявок' : 'Нет прочитанных заявок'}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(submission => `
        <div class="submission-card ${submission.isRead ? 'read' : 'new'}" data-id="${submission.id}">
            <div class="submission-header">
                <div class="submission-info">
                    <span class="submission-name">${escapeHtml(submission.name)}</span>
                    ${!submission.isRead ? '<span class="submission-badge">Новая</span>' : ''}
                </div>
                <span class="submission-date">${formatDate(submission.createdAt)}</span>
            </div>
            <div class="submission-contacts">
                <a href="mailto:${escapeHtml(submission.email)}" class="submission-contact">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    ${escapeHtml(submission.email)}
                </a>
                ${submission.phone ? `
                    <a href="tel:${submission.phone.replace(/\D/g, '')}" class="submission-contact">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        ${formatPhoneNumber(submission.phone)}
                    </a>
                ` : ''}
            </div>
            <div class="submission-message">${escapeHtml(submission.message)}</div>
            <div class="submission-actions">
                ${!submission.isRead ? `
                    <button class="btn btn-outline btn-sm mark-read-btn" data-id="${submission.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Прочитано
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-sm delete-submission-btn" data-id="${submission.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Удалить
                </button>
            </div>
        </div>
    `).join('');

    // Обработчики кнопок
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', () => markAsRead(btn.dataset.id));
    });

    document.querySelectorAll('.delete-submission-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSubmission(btn.dataset.id));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование номера телефона
function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Убираем все нецифровые символы
    let digits = phone.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }

    // Если нет 7 в начале, добавляем
    if (!digits.startsWith('7')) {
        digits = '7' + digits;
    }

    // Форматируем: +7 (XXX) XXX-XX-XX
    if (digits.length >= 11) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    } else if (digits.length >= 8) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else if (digits.length >= 4) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    } else {
        return `+7 ${digits.slice(1)}`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Меньше минуты назад
    if (diff < 60000) {
        return 'Только что';
    }

    // Меньше часа назад
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} мин. назад`;
    }

    // Сегодня
    if (date.toDateString() === now.toDateString()) {
        return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Дата
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function markAsRead(id) {
    try {
        const response = await fetch(`/api/submissions/${id}/read`, { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            const submission = submissionsData.find(s => s.id === id);
            if (submission) submission.isRead = true;
            renderSubmissions();
            updateSubmissionsBadge();
        } else {
            showToast(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error('Mark as read failed:', error);
        showToast('Ошибка', 'error');
    }
}

async function markAllAsRead() {
    try {
        const response = await fetch('/api/submissions/read-all', { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            submissionsData.forEach(s => s.isRead = true);
            renderSubmissions();
            updateSubmissionsBadge();
            showToast('Все заявки отмечены как прочитанные');
        } else {
            showToast(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error('Mark all as read failed:', error);
        showToast('Ошибка', 'error');
    }
}

async function deleteSubmission(id) {
    if (!confirm('Удалить эту заявку?')) return;

    try {
        const response = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            submissionsData = submissionsData.filter(s => s.id !== id);
            renderSubmissions();
            updateSubmissionsBadge();
            showToast('Заявка удалена');
        } else {
            showToast(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Delete submission failed:', error);
        showToast('Ошибка удаления', 'error');
    }
}

function initSubmissions() {
    // Фильтры
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSubmissions();
        });
    });

    // Отметить все прочитанными
    const markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllAsRead);
    }
}

// ========================================
// ЧАТЫ (Real-time)
// ========================================

let chatsData = [];
let currentChatId = null;
let chatSocket = null;
let chatFilter = 'active';
let chatSearchQuery = '';
let visitorTypingTimeout = null;

function initChatSocket() {
    if (typeof io === 'undefined') {
        console.error('Socket.IO not loaded');
        return;
    }

    chatSocket = io('/', {
        query: { type: 'admin' }
    });

    chatSocket.on('connect', () => {
        console.log('Admin connected to chat socket');
    });

    // Новый чат создан
    chatSocket.on('chat:new', (chat) => {
        chatsData.unshift(chat);
        renderChatsList();
        updateChatsBadge();
        showToast('Новый чат от посетителя');
    });

    // Новое сообщение
    chatSocket.on('chat:message', (data) => {
        const chat = chatsData.find(c => c.id === data.chatId);
        if (chat) {
            chat.messages.push(data.message);
            chat.lastMessageAt = data.message.createdAt;

            if (data.message.sender === 'visitor') {
                chat.unreadCount++;
                updateChatsBadge();

                if (currentChatId !== data.chatId) {
                    showToast('Новое сообщение в чате');
                }
            }

            renderChatsList();

            if (currentChatId === data.chatId) {
                appendChatMessage(data.message);
                if (data.message.sender === 'visitor') {
                    markChatAsRead(data.chatId);
                }
            }
        }
    });

    // Статус посетителя (онлайн/офлайн)
    chatSocket.on('chat:status', (data) => {
        const chat = chatsData.find(c => c.id === data.chatId);
        if (chat) {
            chat.isOnline = data.isOnline;
            renderChatsList();

            if (currentChatId === data.chatId) {
                updateChatUserStatus(data.isOnline);
            }
        }
    });

    // Посетитель печатает
    chatSocket.on('visitor:typing', (data) => {
        if (currentChatId === data.chatId) {
            showVisitorTyping();
        }
    });

    chatSocket.on('visitor:stop-typing', (data) => {
        if (currentChatId === data.chatId) {
            hideVisitorTyping();
        }
    });

    // Обновление счётчика непрочитанных
    chatSocket.on('chats:unread-count', (data) => {
        updateChatsBadgeValue(data.count);
    });
}

async function loadChats() {
    try {
        const response = await fetch('/api/chats');
        if (!response.ok) throw new Error('Failed to load chats');
        chatsData = await response.json();
        renderChatsList();
        updateChatsBadge();
    } catch (error) {
        console.error('Load chats failed:', error);
    }
}

function renderChatsList() {
    const list = document.getElementById('chatsList');
    if (!list) return;

    // Фильтрация по статусу
    let filtered = chatsData;
    if (chatFilter === 'active') {
        filtered = chatsData.filter(c => c.status === 'active');
    }

    // Фильтрация по поисковому запросу
    if (chatSearchQuery) {
        const query = chatSearchQuery.toLowerCase();
        filtered = filtered.filter(chat => {
            const name = chat.visitorName.toLowerCase();
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? lastMessage.text.toLowerCase() : '';
            // Также поиск по всем сообщениям чата
            const allMessages = chat.messages.map(m => m.text.toLowerCase()).join(' ');
            return name.includes(query) || preview.includes(query) || allMessages.includes(query);
        });
    }

    // Сортировка по последнему сообщению
    filtered.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="chats-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>${chatFilter === 'active' ? 'Нет активных чатов' : 'Нет чатов'}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(chat => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? lastMessage.text.substring(0, 40) : 'Нет сообщений';
        const isClosed = chat.status === 'closed';

        return `
            <div class="chat-list-item ${chat.unreadCount > 0 ? 'unread' : ''} ${chat.isOnline ? 'online' : ''} ${currentChatId === chat.id ? 'active' : ''} ${isClosed ? 'closed' : ''}"
                 data-chat-id="${chat.id}">
                <div class="chat-item-avatar">
                    <span>П</span>
                    <span class="online-indicator"></span>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${escapeHtml(chat.visitorName)}${isClosed ? ' <span class="chat-closed-badge">закрыт</span>' : ''}</span>
                        <span class="chat-item-time">${formatChatTime(chat.lastMessageAt)}</span>
                    </div>
                    <p class="chat-item-preview">${escapeHtml(preview)}${lastMessage && lastMessage.text.length > 40 ? '...' : ''}</p>
                </div>
                ${chat.unreadCount > 0 ? `<span class="chat-unread-badge">${chat.unreadCount}</span>` : ''}
            </div>
        `;
    }).join('');

    // Добавляем обработчики кликов
    document.querySelectorAll('.chat-list-item').forEach(item => {
        item.addEventListener('click', () => openChat(item.dataset.chatId));
    });
}

function formatChatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Сейчас';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
    }

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function openChat(chatId) {
    currentChatId = chatId;
    const chat = chatsData.find(c => c.id === chatId);
    if (!chat) return;

    // Показываем панель чата
    document.getElementById('chatDetailEmpty').style.display = 'none';
    document.getElementById('chatDetailContent').style.display = 'flex';

    // Обновляем заголовок
    document.getElementById('chatUserName').textContent = chat.visitorName;
    updateChatUserStatus(chat.isOnline);

    // Обновляем кнопку закрытия/переоткрытия
    const closeBtn = document.getElementById('closeChatBtn');
    if (chat.status === 'closed') {
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Переоткрыть
        `;
        closeBtn.onclick = () => reopenChat(chatId);
    } else {
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            Закрыть
        `;
        closeBtn.onclick = () => closeChat(chatId);
    }

    // Назначаем обработчик удаления
    const deleteBtn = document.getElementById('deleteChatBtn');
    if (deleteBtn) {
        deleteBtn.onclick = () => deleteChat(chatId);
    }

    // Скрываем/показываем форму ответа в зависимости от статуса чата
    const replyForm = document.getElementById('adminReplyForm');
    if (replyForm) {
        replyForm.style.display = chat.status === 'closed' ? 'none' : 'flex';
    }

    // Рендерим сообщения
    const container = document.getElementById('adminChatMessages');
    container.innerHTML = chat.messages.map(msg => `
        <div class="admin-chat-message ${msg.sender}">
            <p>${escapeHtml(msg.text)}</p>
            <span class="message-time">${formatChatTime(msg.createdAt)}</span>
        </div>
    `).join('');

    // Скролл вниз
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 10);

    // Отмечаем как прочитанный
    if (chat.unreadCount > 0) {
        markChatAsRead(chatId);
    }

    // Обновляем список
    renderChatsList();

    // Фокус на инпут
    document.getElementById('adminReplyInput').focus();
}

function updateChatUserStatus(isOnline) {
    const statusEl = document.getElementById('chatUserStatus');
    if (statusEl) {
        statusEl.textContent = isOnline ? 'Онлайн' : 'Офлайн';
        statusEl.className = 'chat-user-status' + (isOnline ? ' online' : '');
    }
}

function appendChatMessage(message) {
    const container = document.getElementById('adminChatMessages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `admin-chat-message ${message.sender}`;
    msgDiv.innerHTML = `
        <p>${escapeHtml(message.text)}</p>
        <span class="message-time">${formatChatTime(message.createdAt)}</span>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    // Скрываем индикатор печати
    hideVisitorTyping();
}

function showVisitorTyping() {
    const indicator = document.getElementById('visitorTyping');
    if (indicator) {
        indicator.style.display = 'flex';
    }

    // Автоскрытие через 3 секунды
    clearTimeout(visitorTypingTimeout);
    visitorTypingTimeout = setTimeout(hideVisitorTyping, 3000);
}

function hideVisitorTyping() {
    const indicator = document.getElementById('visitorTyping');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

async function markChatAsRead(chatId) {
    try {
        await fetch(`/api/chats/${chatId}/read`, { method: 'PUT' });

        const chat = chatsData.find(c => c.id === chatId);
        if (chat) {
            chat.unreadCount = 0;
            chat.messages.forEach(m => { if (m.sender === 'visitor') m.isRead = true; });
        }

        chatSocket.emit('admin:read', { chatId });
        renderChatsList();
        updateChatsBadge();
    } catch (error) {
        console.error('Mark chat read failed:', error);
    }
}

async function sendAdminMessage(e) {
    e.preventDefault();

    const input = document.getElementById('adminReplyInput');
    const text = input.value.trim();
    if (!text || !currentChatId) return;

    input.value = '';

    chatSocket.emit('admin:message', {
        chatId: currentChatId,
        text: text
    });
}

async function closeChat(chatId) {
    if (!confirm('Закрыть этот чат?')) return;

    try {
        const response = await fetch(`/api/chats/${chatId}/close`, { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            const chat = chatsData.find(c => c.id === chatId);
            if (chat) chat.status = 'closed';

            if (currentChatId === chatId) {
                currentChatId = null;
                document.getElementById('chatDetailEmpty').style.display = 'flex';
                document.getElementById('chatDetailContent').style.display = 'none';
            }

            renderChatsList();
            showToast('Чат закрыт');
        }
    } catch (error) {
        console.error('Close chat failed:', error);
        showToast('Ошибка закрытия чата', 'error');
    }
}

async function reopenChat(chatId) {
    try {
        const response = await fetch(`/api/chats/${chatId}/reopen`, { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            const chat = chatsData.find(c => c.id === chatId);
            if (chat) chat.status = 'active';

            // Переоткрываем чат в UI
            openChat(chatId);
            showToast('Чат переоткрыт');
        }
    } catch (error) {
        console.error('Reopen chat failed:', error);
        showToast('Ошибка переоткрытия чата', 'error');
    }
}

async function deleteChat(chatId) {
    if (!confirm('Удалить этот чат? Это действие необратимо.')) return;

    try {
        const response = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            chatsData = chatsData.filter(c => c.id !== chatId);

            if (currentChatId === chatId) {
                currentChatId = null;
                document.getElementById('chatDetailEmpty').style.display = 'flex';
                document.getElementById('chatDetailContent').style.display = 'none';
            }

            renderChatsList();
            updateChatsBadge();
            showToast('Чат удалён');
        }
    } catch (error) {
        console.error('Delete chat failed:', error);
        showToast('Ошибка удаления чата', 'error');
    }
}

function updateChatsBadge() {
    const totalUnread = chatsData.reduce((sum, chat) => sum + chat.unreadCount, 0);
    updateChatsBadgeValue(totalUnread);
}

function updateChatsBadgeValue(count) {
    const badge = document.getElementById('chatsBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function initChats() {
    // Инициализация Socket.IO
    initChatSocket();

    // Фильтры
    const filterBtns = document.querySelectorAll('#chats-section .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderChatsList();
        });
    });

    // Форма ответа
    const replyForm = document.getElementById('adminReplyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', sendAdminMessage);
    }

    // Индикатор набора текста админом
    const replyInput = document.getElementById('adminReplyInput');
    if (replyInput) {
        let adminTypingTimeout;
        replyInput.addEventListener('input', () => {
            if (currentChatId && chatSocket) {
                chatSocket.emit('admin:typing', { chatId: currentChatId });
                clearTimeout(adminTypingTimeout);
                adminTypingTimeout = setTimeout(() => {
                    chatSocket.emit('admin:stop-typing', { chatId: currentChatId });
                }, 1000);
            }
        });
    }

    // Кнопка удаления чата (onclick назначается в openChat)
    // closeBtn обработчик назначается динамически в openChat() для поддержки закрытия/переоткрытия

    // Поиск по чатам
    const searchInput = document.getElementById('chatSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            chatSearchQuery = e.target.value.trim();
            renderChatsList();
        });
    }
}

// ========================================
// БЛОГ
// ========================================

let blogArticles = [];
let blogFilter = 'all';
let currentArticleImage = null;

async function loadBlog() {
    try {
        const response = await fetch('/api/blog/admin/all', { credentials: 'include' });
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
            blogArticles = data;
            renderBlogGrid();
        } else {
            console.error('Blog API error:', data);
            showToast(data.error || 'Ошибка загрузки статей', 'error');
        }
    } catch (error) {
        console.error('Load blog failed:', error);
        showToast('Ошибка загрузки статей', 'error');
    }
}

function renderBlogGrid() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    // Фильтрация
    let filtered = blogArticles;
    if (blogFilter === 'published') {
        filtered = blogArticles.filter(a => a.isPublished);
    } else if (blogFilter === 'draft') {
        filtered = blogArticles.filter(a => !a.isPublished);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="blog-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <p>${blogFilter === 'all' ? 'Статей пока нет. Добавьте первую!' : 'Нет статей в этой категории'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(article => `
        <div class="blog-admin-card ${article.isPublished ? '' : 'draft'}">
            <img src="${article.image || 'https://via.placeholder.com/600x400?text=No+Image'}"
                 alt="${article.title}" class="blog-card-image">
            <div class="blog-card-body">
                <div class="blog-card-header">
                    <span class="blog-card-category">${article.categoryLabel}</span>
                    <span class="blog-card-status ${article.isPublished ? 'published' : 'draft'}">
                        ${article.isPublished ? 'Опубликовано' : 'Черновик'}
                    </span>
                </div>
                <h3 class="blog-card-title">${article.title}</h3>
                <p class="blog-card-excerpt">${article.excerpt || ''}</p>
                <div class="blog-card-meta">
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${formatBlogDate(article.date)}
                    </span>
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${article.readTime}
                    </span>
                </div>
                ${article.tags && article.tags.length > 0 ? `
                    <div class="blog-card-tags">
                        ${article.tags.slice(0, 3).map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
                        ${article.tags.length > 3 ? `<span class="blog-card-tag">+${article.tags.length - 3}</span>` : ''}
                    </div>
                ` : ''}
                <div class="blog-card-actions">
                    <button class="btn btn-outline" onclick="editArticle('${article.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Редактировать
                    </button>
                    <button class="btn ${article.isPublished ? 'btn-outline' : 'btn-success'}" onclick="toggleArticlePublish('${article.id}')">
                        ${article.isPublished ? 'Снять' : 'Опубликовать'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function formatBlogDate(dateStr) {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const date = new Date(dateStr);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function initBlog() {
    // Фильтры
    const filterBtns = document.querySelectorAll('#blog-section .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            blogFilter = btn.dataset.filter;
            renderBlogGrid();
        });
    });

    // Добавить статью
    const addBtn = document.getElementById('addArticleBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openArticleModal());
    }

    // Модальное окно
    initArticleModal();
}

function initArticleModal() {
    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementById('closeArticleModal');
    const cancelBtn = document.getElementById('cancelArticleModal');
    const form = document.getElementById('articleForm');

    // Закрытие модалки
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => closeArticleModal());
        }
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeArticleModal();
    });

    // Вкладки
    const tabs = document.querySelectorAll('#articleModal .form-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('#articleModal .form-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    // Загрузка изображения
    initArticleImageUpload();

    // Теги preview
    const tagsInput = document.getElementById('articleTags');
    tagsInput?.addEventListener('input', () => updateTagsPreview());

    // Очистка ошибок при вводе
    const articleFieldsToWatch = ['articleTitle', 'articleDate', 'articleExcerpt', 'articleContent'];
    articleFieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => clearFieldError(fieldId));
        }
    });
    // Для select нужен change event
    const categorySelect = document.getElementById('articleCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => clearFieldError('articleCategory'));
    }

    // Editor toolbar
    initEditorToolbar();

    // Сохранение
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveArticle();
    });
}

function initArticleImageUpload() {
    const fileUpload = document.getElementById('articleFileUpload');
    const fileInput = document.getElementById('articleImage');

    if (!fileUpload || !fileInput) return;

    fileUpload.addEventListener('click', () => fileInput.click());

    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragover');
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragover');
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            currentArticleImage = file;
            showArticleFilePreview(file);
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            currentArticleImage = file;
            showArticleFilePreview(file);
        }
    });

    // Ctrl+V paste
    document.addEventListener('paste', (e) => {
        if (!document.getElementById('articleModal')?.classList.contains('active')) return;

        const items = e.clipboardData?.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                currentArticleImage = file;
                showArticleFilePreview(file);
                break;
            }
        }
    });
}

function showArticleFilePreview(file) {
    const preview = document.getElementById('articleFilePreview');
    if (!preview) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

function updateTagsPreview() {
    const input = document.getElementById('articleTags');
    const preview = document.getElementById('tagsPreview');
    if (!input || !preview) return;

    const tags = input.value.split(',').map(t => t.trim()).filter(t => t);
    preview.innerHTML = tags.map(tag => `<span class="tag-item">${tag}</span>`).join('');
}

function initEditorToolbar() {
    const toolbar = document.querySelector('.editor-toolbar');
    const textarea = document.getElementById('articleContent');

    if (!toolbar || !textarea) return;

    toolbar.querySelectorAll('.editor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = textarea.value.substring(start, end);

            let insert = '';
            switch (action) {
                case 'bold':
                    insert = `<strong>${selected || 'текст'}</strong>`;
                    break;
                case 'italic':
                    insert = `<em>${selected || 'текст'}</em>`;
                    break;
                case 'h2':
                    insert = `<h2>${selected || 'Заголовок'}</h2>`;
                    break;
                case 'h3':
                    insert = `<h3>${selected || 'Подзаголовок'}</h3>`;
                    break;
                case 'ul':
                    insert = `<ul>\n  <li>${selected || 'Пункт'}</li>\n  <li>Пункт</li>\n</ul>`;
                    break;
                case 'link':
                    insert = `<a href="URL">${selected || 'Ссылка'}</a>`;
                    break;
                case 'quote':
                    insert = `<blockquote>${selected || 'Цитата'}</blockquote>`;
                    break;
                case 'code':
                    insert = `<code>${selected || 'код'}</code>`;
                    break;
            }

            textarea.value = textarea.value.substring(0, start) + insert + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + insert.length, start + insert.length);
        });
    });
}

function openArticleModal(article = null) {
    const modal = document.getElementById('articleModal');
    const title = document.getElementById('articleModalTitle');

    // Сбрасываем форму
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
    document.getElementById('articleFilePreview').innerHTML = '';
    document.getElementById('tagsPreview').innerHTML = '';
    currentArticleImage = null;

    // Сбрасываем вкладки
    document.querySelectorAll('#articleModal .form-tab').forEach((t, i) => {
        t.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('#articleModal .form-tab-content').forEach((c, i) => {
        c.classList.toggle('active', i === 0);
    });

    if (article) {
        title.textContent = 'Редактировать статью';
        document.getElementById('articleId').value = article.id;
        document.getElementById('articleTitle').value = article.title || '';
        document.getElementById('articleCategory').value = article.category || 'web';
        document.getElementById('articleDate').value = article.date || '';
        document.getElementById('articleReadTime').value = article.readTime || '';
        document.getElementById('articleAuthor').value = article.author || '';
        document.getElementById('articleExcerpt').value = article.excerpt || '';
        document.getElementById('articleContent').value = article.content || '';
        document.getElementById('articleTags').value = (article.tags || []).join(', ');
        document.getElementById('articlePublished').checked = article.isPublished;

        if (article.image) {
            document.getElementById('articleFilePreview').innerHTML = `<img src="${article.image}" alt="Preview">`;
        }

        updateTagsPreview();
    } else {
        title.textContent = 'Добавить статью';
        // Устанавливаем дату по умолчанию
        document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');
}

function closeArticleModal() {
    document.getElementById('articleModal')?.classList.remove('active');
    currentArticleImage = null;
    clearAllFieldErrors();
}

async function editArticle(id) {
    const article = blogArticles.find(a => a.id === id);
    if (article) {
        openArticleModal(article);
    }
}

function validateArticleForm() {
    const errors = [];

    // Заголовок
    const title = document.getElementById('articleTitle').value.trim();
    if (!title) {
        errors.push({ field: 'articleTitle', message: 'Укажите заголовок статьи' });
    } else if (title.length < 5) {
        errors.push({ field: 'articleTitle', message: 'Заголовок слишком короткий (минимум 5 символов)' });
    } else if (title.length > 200) {
        errors.push({ field: 'articleTitle', message: 'Заголовок слишком длинный (максимум 200 символов)' });
    }

    // Категория
    const category = document.getElementById('articleCategory').value;
    if (!category) {
        errors.push({ field: 'articleCategory', message: 'Выберите категорию' });
    }

    // Дата
    const date = document.getElementById('articleDate').value;
    if (!date) {
        errors.push({ field: 'articleDate', message: 'Укажите дату публикации' });
    }

    // Краткое описание
    const excerpt = document.getElementById('articleExcerpt').value.trim();
    if (!excerpt) {
        errors.push({ field: 'articleExcerpt', message: 'Добавьте краткое описание статьи' });
    } else if (excerpt.length < 20) {
        errors.push({ field: 'articleExcerpt', message: 'Краткое описание слишком короткое (минимум 20 символов)' });
    } else if (excerpt.length > 500) {
        errors.push({ field: 'articleExcerpt', message: 'Краткое описание слишком длинное (максимум 500 символов)' });
    }

    // Содержимое
    const content = document.getElementById('articleContent').value.trim();
    if (!content) {
        errors.push({ field: 'articleContent', message: 'Добавьте содержимое статьи' });
    } else if (content.length < 100) {
        errors.push({ field: 'articleContent', message: 'Содержимое слишком короткое (минимум 100 символов)' });
    }

    return errors;
}

// Используем существующие функции showFieldError и clearAllErrors из секции портфолио

async function saveArticle() {
    // Очищаем предыдущие ошибки
    clearAllErrors();

    // Валидация
    const errors = validateArticleForm();
    if (errors.length > 0) {
        // Показываем ошибки
        errors.forEach(err => showFieldError(err.field, err.message));

        // Фокус на первое поле с ошибкой
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        showToast('Заполните обязательные поля', 'error');
        return;
    }

    const id = document.getElementById('articleId').value;
    const formData = new FormData();

    formData.append('title', document.getElementById('articleTitle').value.trim());
    formData.append('category', document.getElementById('articleCategory').value);
    formData.append('date', document.getElementById('articleDate').value);
    formData.append('readTime', document.getElementById('articleReadTime').value || '5 мин');
    formData.append('author', document.getElementById('articleAuthor').value || 'Команда Creatix');
    formData.append('excerpt', document.getElementById('articleExcerpt').value.trim());
    formData.append('content', document.getElementById('articleContent').value.trim());
    formData.append('tags', document.getElementById('articleTags').value);
    formData.append('isPublished', document.getElementById('articlePublished').checked);

    if (currentArticleImage) {
        formData.append('image', currentArticleImage);
    }

    try {
        const url = id ? `/api/blog/${id}` : '/api/blog';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: formData, credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            showToast(id ? 'Статья обновлена' : 'Статья добавлена');
            closeArticleModal();
            loadBlog();
        } else {
            showToast(data.error || 'Ошибка сохранения', 'error');
        }
    } catch (error) {
        console.error('Save article error:', error);
        showToast('Ошибка сохранения статьи', 'error');
    }
}

async function toggleArticlePublish(id) {
    try {
        const response = await fetch(`/api/blog/${id}/toggle-publish`, { method: 'PUT', credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            showToast(data.message);
            loadBlog();
        } else {
            showToast(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error('Toggle publish error:', error);
        showToast('Ошибка изменения статуса', 'error');
    }
}

async function deleteArticle(id) {
    if (!confirm('Удалить статью? Это действие нельзя отменить.')) return;

    try {
        const response = await fetch(`/api/blog/${id}`, { method: 'DELETE', credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            showToast('Статья удалена');
            loadBlog();
        } else {
            showToast(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Delete article error:', error);
        showToast('Ошибка удаления статьи', 'error');
    }
}

// ========================================
// КЕЙСЫ
// ========================================

let casesData = [];

async function loadCases() {
    try {
        const response = await fetch('/api/cases');
        casesData = await response.json();
        renderCases();
    } catch (error) {
        console.error('Load cases failed:', error);
        showToast('Ошибка загрузки кейсов', 'error');
    }
}

function renderCases() {
    const grid = document.getElementById('casesGrid');
    if (!grid) return;

    if (casesData.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M9 15l2 2 4-4"/>
                </svg>
                <p>Кейсы пока не добавлены</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = casesData.map(caseItem => `
        <div class="case-admin-card" data-id="${caseItem.id}">
            <div class="case-admin-header">
                <span class="case-admin-industry">${caseItem.industry}</span>
                <div class="case-admin-actions">
                    <button class="btn-icon edit-case" title="Редактировать">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete-case" title="Удалить">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="case-admin-problem">${caseItem.problem}</div>
            <div class="case-admin-desc">${caseItem.description || ''}</div>
            <div class="case-admin-results">
                ${caseItem.results.map(r => `<span class="case-result-tag">${r.value} ${r.label}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Добавляем обработчики
    grid.querySelectorAll('.edit-case').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.case-admin-card');
            const id = parseInt(card.dataset.id);
            openCaseModal(id);
        });
    });

    grid.querySelectorAll('.delete-case').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.case-admin-card');
            const id = parseInt(card.dataset.id);
            deleteCase(id);
        });
    });
}

function initCases() {
    const addBtn = document.getElementById('addCaseBtn');
    const modal = document.getElementById('caseModal');
    const closeBtn = document.getElementById('closeCaseModal');
    const cancelBtn = document.getElementById('cancelCaseModal');
    const form = document.getElementById('caseForm');

    if (!addBtn || !modal) return;

    addBtn.addEventListener('click', () => openCaseModal());

    closeBtn.addEventListener('click', () => closeCaseModal());
    cancelBtn.addEventListener('click', () => closeCaseModal());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCaseModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCase();
    });
}

function openCaseModal(id = null) {
    const modal = document.getElementById('caseModal');
    const title = document.getElementById('caseModalTitle');
    const form = document.getElementById('caseForm');

    form.reset();
    document.getElementById('caseId').value = '';

    if (id) {
        const caseItem = casesData.find(c => c.id === id);
        if (caseItem) {
            title.textContent = 'Редактировать кейс';
            document.getElementById('caseId').value = caseItem.id;
            document.getElementById('caseIndustry').value = caseItem.industry || '';
            document.getElementById('caseProblem').value = caseItem.problem || '';
            document.getElementById('caseDescription').value = caseItem.description || '';
            document.getElementById('caseSolutions').value = (caseItem.solutions || []).join('\n');
            document.getElementById('caseIcon').value = caseItem.icon || 'building';
            document.getElementById('caseResultTitle').value = caseItem.resultTitle || '';

            // Заполняем результаты
            if (caseItem.results && caseItem.results.length > 0) {
                caseItem.results.forEach((r, i) => {
                    const valueInput = form.querySelector(`[name="resultValue${i + 1}"]`);
                    const labelInput = form.querySelector(`[name="resultLabel${i + 1}"]`);
                    if (valueInput) valueInput.value = r.value || '';
                    if (labelInput) labelInput.value = r.label || '';
                });
            }
        }
    } else {
        title.textContent = 'Добавить кейс';
    }

    modal.classList.add('active');
}

function closeCaseModal() {
    const modal = document.getElementById('caseModal');
    modal.classList.remove('active');
}

async function saveCase() {
    const form = document.getElementById('caseForm');
    const id = document.getElementById('caseId').value;

    // Собираем результаты
    const results = [];
    for (let i = 1; i <= 3; i++) {
        const value = form.querySelector(`[name="resultValue${i}"]`).value.trim();
        const label = form.querySelector(`[name="resultLabel${i}"]`).value.trim();
        if (value && label) {
            results.push({ value, label });
        }
    }

    // Собираем решения
    const solutionsText = document.getElementById('caseSolutions').value.trim();
    const solutions = solutionsText ? solutionsText.split('\n').filter(s => s.trim()) : [];

    const caseData = {
        industry: document.getElementById('caseIndustry').value.toUpperCase(),
        problem: document.getElementById('caseProblem').value,
        description: document.getElementById('caseDescription').value,
        solutions,
        icon: document.getElementById('caseIcon').value,
        resultTitle: document.getElementById('caseResultTitle').value,
        results
    };

    try {
        const url = id ? `/api/cases/${id}` : '/api/cases';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(id ? 'Кейс обновлён' : 'Кейс добавлен');
            closeCaseModal();
            loadCases();
        } else {
            showToast(data.error || 'Ошибка сохранения', 'error');
        }
    } catch (error) {
        console.error('Save case error:', error);
        showToast('Ошибка сохранения кейса', 'error');
    }
}

async function deleteCase(id) {
    if (!confirm('Удалить этот кейс?')) return;

    try {
        const response = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            showToast('Кейс удалён');
            loadCases();
        } else {
            showToast(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Delete case error:', error);
        showToast('Ошибка удаления кейса', 'error');
    }
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();

    initNavigation();
    initLogout();
    initContactsForm();
    initModal();
    initProjectForm();
    initSubmissions();
    initChats();
    initBlog();
    initCases();

    // Загружаем данные
    loadContacts();
    loadPortfolio();
    loadSubmissions();
    loadChats();
    loadBlog();
    loadCases();
});

// CSS для секций
const style = document.createElement('style');
style.textContent = `
    .admin-section {
        display: none;
    }
    .admin-section.active {
        display: block;
    }
`;
document.head.appendChild(style);
