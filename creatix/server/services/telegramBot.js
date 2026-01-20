const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Загрузка конфигурации
const configPath = path.join(__dirname, '..', 'config', 'telegram.json');
let config = { botToken: '', adminChatId: '' };

try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (error) {
    console.error('Ошибка загрузки конфигурации Telegram:', error);
}

// Путь к файлу заявок
const submissionsFile = path.join(__dirname, '..', 'data', 'submissions.json');

// Путь к файлу контактов
const contactsFile = path.join(__dirname, '..', 'data', 'contacts.json');

// Загрузка контактов
function getContacts() {
    try {
        if (fs.existsSync(contactsFile)) {
            return JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        }
    } catch (error) {
        console.error('Ошибка чтения контактов:', error);
    }
    return { phone: '', email: '', address: '' };
}

// Состояния пользователей для сбора заявок
const userStates = new Map();

let bot = null;

// ============================================
// КРАСИВЫЕ ВИЗУАЛЬНЫЕ ЭЛЕМЕНТЫ
// ============================================

// Прогресс-бар
function getProgressBar(step, total = 4) {
    const filled = '●';
    const empty = '○';
    const line = '─';

    let bar = '';
    for (let i = 1; i <= total; i++) {
        if (i < step) {
            bar += filled;
        } else if (i === step) {
            bar += '◉';
        } else {
            bar += empty;
        }
        if (i < total) bar += line;
    }
    return bar;
}

// Красивая карточка заявки для пользователя
function getSubmissionCard(state) {
    return `
┌─────────────────────────────┐
│      ✨ ЗАЯВКА ОФОРМЛЕНА      │
├─────────────────────────────┤
│                             │
│  👤  ${state.name.padEnd(22)}│
│  📱  ${state.phone.padEnd(22)}│
│                             │
├─────────────────────────────┤
│  💬 Сообщение:              │
│  ${state.message.substring(0, 25).padEnd(26)}│
│                             │
└─────────────────────────────┘`;
}

// Карточка заявки для админа (HTML формат)
function getAdminCard(submission) {
    const source = submission.source === 'telegram' ? 'Telegram' : 'Сайт';
    const sourceIcon = submission.source === 'telegram' ? '📱' : '🌐';
    const username = submission.telegramUsername ? `@${submission.telegramUsername}` : '—';
    const date = new Date(submission.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
<b>🔔 НОВАЯ ЗАЯВКА</b>

┌───────────────────────────┐
│ ${sourceIcon} <b>Источник:</b> ${source}
│ 🕐 <b>Время:</b> ${date}
├───────────────────────────┤
│ 👤 <b>Имя:</b> ${escapeHtml(submission.name)}
│ 📱 <b>Телефон:</b> <code>${submission.phone || '—'}</code>
│ 📧 <b>Email:</b> ${submission.email || '—'}
│ 💬 <b>Telegram:</b> ${username}
├───────────────────────────┤
│ 📝 <b>Сообщение:</b>
│ <i>${escapeHtml(submission.message)}</i>
└───────────────────────────┘`;
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================
// INLINE КЛАВИАТУРЫ
// ============================================

// Главное меню (inline)
function getMainInlineKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📝 Оставить заявку', callback_data: 'new_request' }],
                [
                    { text: '📞 Контакты', callback_data: 'contacts' },
                    { text: '🏢 О нас', callback_data: 'about' }
                ],
                [{ text: '💼 Наши услуги', callback_data: 'services' }]
            ]
        }
    };
}

// Меню услуг
function getServicesKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 Сайты на заказ', callback_data: 'service_website' }],
                [{ text: '📊 CRM системы', callback_data: 'service_crm' }],
                [{ text: '🏭 ERP системы', callback_data: 'service_erp' }],
                [{ text: '🤖 ИИ решения', callback_data: 'service_ai' }],
                [{ text: '« Назад в меню', callback_data: 'back_menu' }]
            ]
        }
    };
}

// Кнопки действий админа
function getAdminActionsKeyboard(submissionId, phone, username) {
    const buttons = [];

    if (phone) {
        buttons.push([{ text: '📞 Позвонить', url: `tel:${phone.replace(/\s/g, '')}` }]);
    }

    if (username) {
        buttons.push([{ text: '💬 Написать в Telegram', url: `https://t.me/${username}` }]);
    }

    buttons.push([
        { text: '✅ Обработано', callback_data: `done_${submissionId}` },
        { text: '🗑 Удалить', callback_data: `delete_${submissionId}` }
    ]);

    return { reply_markup: { inline_keyboard: buttons } };
}

// Клавиатура для заполнения заявки
function getRequestKeyboard(step) {
    const buttons = [[{ text: '❌ Отменить заявку', callback_data: 'cancel_request' }]];

    if (step === 'waiting_phone') {
        buttons.unshift([{ text: '📱 Отправить мой номер', callback_data: 'share_phone' }]);
    }

    if (step === 'waiting_email') {
        buttons.unshift([{ text: '⏩ Пропустить', callback_data: 'skip_email' }]);
    }

    return { reply_markup: { inline_keyboard: buttons } };
}

// Обычная клавиатура с кнопкой телефона
function getPhoneKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                [{ text: '📱 Отправить мой номер', request_contact: true }],
                [{ text: '❌ Отмена' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
}

// Убрать клавиатуру
function removeKeyboard() {
    return { reply_markup: { remove_keyboard: true } };
}

// ============================================
// РАБОТА С ДАННЫМИ
// ============================================

function getSubmissions() {
    try {
        if (!fs.existsSync(submissionsFile)) {
            fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
    } catch (error) {
        console.error('Ошибка чтения заявок:', error);
        return [];
    }
}

function saveSubmissions(submissions) {
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
}

// Валидация телефона
function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        return digits.startsWith('7') || digits.startsWith('8');
    }
    if (digits.length === 10) {
        return digits.startsWith('9');
    }
    return false;
}

// Форматирование телефона
function formatPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return '+7' + digits;
    }
    if (digits.length === 11 && digits.startsWith('8')) {
        return '+7' + digits.substring(1);
    }
    if (digits.length === 11 && digits.startsWith('7')) {
        return '+' + digits;
    }
    return phone;
}

// Валидация email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// ЗАПУСК БОТА
// ============================================

function start() {
    if (!config.botToken) {
        console.log('⚠️ Telegram Bot: токен не указан в config/telegram.json');
        return;
    }

    try {
        bot = new TelegramBot(config.botToken, { polling: true });
        console.log('✅ Telegram Bot запущен');

        // Команда /start
        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            userStates.delete(chatId);
            sendWelcome(chatId, msg.from.first_name);
        });

        // Команда /help
        bot.onText(/\/help/, (msg) => {
            sendHelp(msg.chat.id);
        });

        // Команда /request
        bot.onText(/\/request/, (msg) => {
            startRequest(msg.chat.id, msg.from);
        });

        // Команда /cancel
        bot.onText(/\/cancel/, (msg) => {
            cancelRequest(msg.chat.id);
        });

        // Обработка callback-запросов (inline кнопки)
        bot.on('callback_query', handleCallbackQuery);

        // Обработка текстовых сообщений
        bot.on('message', (msg) => {
            if (!msg.text || msg.text.startsWith('/')) return;
            handleMessage(msg);
        });

        // Обработка контакта (телефон)
        bot.on('contact', handleContact);

        // Обработка ошибок
        bot.on('polling_error', (error) => {
            console.error('Telegram Bot polling error:', error.code);
        });

    } catch (error) {
        console.error('Ошибка запуска Telegram бота:', error);
    }
}

// ============================================
// ПРИВЕТСТВИЕ И МЕНЮ
// ============================================

async function sendWelcome(chatId, firstName) {
    const welcomeText = `
👋 <b>Добро пожаловать в CREATIX!</b>

Привет, <b>${escapeHtml(firstName)}</b>!

Мы создаём современные веб-решения для вашего бизнеса:

  🌐  Сайты и веб-приложения
  📊  CRM/ERP системы
  🤖  Интеграция ИИ
  📱  Мобильные приложения

<i>Выберите интересующий пункт меню:</i>`;

    await bot.sendMessage(chatId, welcomeText, {
        parse_mode: 'HTML',
        ...getMainInlineKeyboard()
    });
}

function sendHelp(chatId) {
    const helpText = `
<b>📚 Справка по боту</b>

<b>Команды:</b>
/start — Главное меню
/request — Новая заявка
/cancel — Отменить действие
/help — Эта справка

<b>Как оставить заявку:</b>
1. Нажмите "Оставить заявку"
2. Введите ваше имя
3. Укажите телефон
4. Опишите задачу

Мы свяжемся с вами в течение часа!`;

    bot.sendMessage(chatId, helpText, {
        parse_mode: 'HTML',
        ...getMainInlineKeyboard()
    });
}

// ============================================
// ОБРАБОТКА INLINE КНОПОК
// ============================================

async function handleCallbackQuery(query) {
    try {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data;

        // Проверяем что data существует
        if (!data) {
            await bot.answerCallbackQuery(query.id).catch(() => {});
            return;
        }

        // Отвечаем на callback чтобы убрать "часики"
        await bot.answerCallbackQuery(query.id).catch(() => {});

        switch (data) {
        case 'new_request':
            await bot.deleteMessage(chatId, messageId).catch(() => {});
            startRequest(chatId, query.from);
            break;

        case 'contacts':
            await showContacts(chatId, messageId);
            break;

        case 'about':
            await showAbout(chatId, messageId);
            break;

        case 'services':
            await showServices(chatId, messageId);
            break;

        case 'service_website':
        case 'service_crm':
        case 'service_erp':
        case 'service_ai':
            await showServiceDetail(chatId, messageId, data);
            break;

        case 'back_menu':
            await backToMenu(chatId, messageId, query.from.first_name);
            break;

        case 'cancel_request':
            await bot.deleteMessage(chatId, messageId).catch(() => {});
            cancelRequest(chatId);
            break;

        case 'skip_email':
            await handleSkipEmail(chatId, messageId);
            break;

        case 'share_phone':
            await requestPhoneShare(chatId, messageId);
            break;

        default:
            // Обработка действий админа
            if (data.startsWith('done_')) {
                await handleAdminDone(chatId, messageId, data.replace('done_', ''));
            } else if (data.startsWith('delete_')) {
                await handleAdminDelete(chatId, messageId, data.replace('delete_', ''));
            }
    }
    } catch (error) {
        console.error('Callback query error:', error.message);
    }
}

// ============================================
// ОТОБРАЖЕНИЕ ИНФОРМАЦИИ
// ============================================

async function showContacts(chatId, messageId) {
    const contacts = getContacts();

    const text = `
<b>📞 Наши контакты</b>

📱 <b>Телефон:</b> ${contacts.phone || 'не указан'}
📧 <b>Email:</b> ${contacts.email || 'не указан'}
📍 <b>Адрес:</b> ${contacts.address || 'не указан'}

<b>Время работы:</b>
Пн-Пт: 9:00 - 18:00
Сб-Вс: выходной

<i>Или оставьте заявку, и мы сами свяжемся с вами!</i>`;

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '📝 Оставить заявку', callback_data: 'new_request' }],
                [{ text: '« Назад в меню', callback_data: 'back_menu' }]
            ]
        }
    });
}

async function showAbout(chatId, messageId) {
    const text = `
<b>🏢 О компании CREATIX</b>

Мы — команда профессионалов с опытом более <b>5 лет</b> в разработке цифровых решений.

<b>Наши преимущества:</b>

✅ <b>Современные технологии</b>
   React, Node.js, Python, AI/ML

✅ <b>Индивидуальный подход</b>
   Решения под ваши задачи

✅ <b>Фиксированные сроки</b>
   Сдаём проекты вовремя

✅ <b>Поддержка 24/7</b>
   Всегда на связи

<b>Реализовано проектов:</b> 150+
<b>Довольных клиентов:</b> 100+`;

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💼 Наши услуги', callback_data: 'services' }],
                [{ text: '📝 Оставить заявку', callback_data: 'new_request' }],
                [{ text: '« Назад в меню', callback_data: 'back_menu' }]
            ]
        }
    });
}

async function showServices(chatId, messageId) {
    const text = `
<b>💼 Наши услуги</b>

Выберите интересующую услугу для подробной информации:`;

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        ...getServicesKeyboard()
    });
}

async function showServiceDetail(chatId, messageId, service) {
    const services = {
        service_website: {
            icon: '🌐',
            title: 'Сайты на заказ',
            desc: `
<b>Разрабатываем сайты любой сложности:</b>

• Лендинги и промо-сайты
• Корпоративные сайты
• Интернет-магазины
• Порталы и сервисы

<b>Технологии:</b> React, Vue, Next.js
<b>Сроки:</b> от 2 недель
<b>Стоимость:</b> от 50 000 ₽`
        },
        service_crm: {
            icon: '📊',
            title: 'CRM системы',
            desc: `
<b>Автоматизация продаж и клиентского сервиса:</b>

• Учёт клиентов и сделок
• Воронки продаж
• Автоматизация задач
• Аналитика и отчёты

<b>Интеграции:</b> 1C, телефония, почта
<b>Сроки:</b> от 1 месяца
<b>Стоимость:</b> от 150 000 ₽`
        },
        service_erp: {
            icon: '🏭',
            title: 'ERP системы',
            desc: `
<b>Комплексная автоматизация бизнеса:</b>

• Управление ресурсами
• Производство и склад
• Финансы и бухгалтерия
• HR и документооборот

<b>Платформы:</b> 1C, SAP, custom
<b>Сроки:</b> от 3 месяцев
<b>Стоимость:</b> от 500 000 ₽`
        },
        service_ai: {
            icon: '🤖',
            title: 'ИИ решения',
            desc: `
<b>Внедрение искусственного интеллекта:</b>

• Чат-боты и ассистенты
• Анализ данных и прогнозы
• Компьютерное зрение
• Обработка текста (NLP)

<b>Технологии:</b> GPT, Python, TensorFlow
<b>Сроки:</b> от 1 месяца
<b>Стоимость:</b> от 100 000 ₽`
        }
    };

    const s = services[service];
    const text = `<b>${s.icon} ${s.title}</b>\n${s.desc}`;

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '📝 Заказать услугу', callback_data: 'new_request' }],
                [{ text: '« К списку услуг', callback_data: 'services' }],
                [{ text: '« В главное меню', callback_data: 'back_menu' }]
            ]
        }
    });
}

async function backToMenu(chatId, messageId, firstName) {
    const text = `
👋 <b>CREATIX</b>

<i>Выберите интересующий пункт меню:</i>`;

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        ...getMainInlineKeyboard()
    });
}

// ============================================
// ПРОЦЕСС ЗАЯВКИ
// ============================================

async function startRequest(chatId, from) {
    userStates.set(chatId, {
        step: 'waiting_name',
        telegramUserId: from.id,
        telegramUsername: from.username || null,
        firstName: from.first_name || '',
        messageIds: []
    });

    const progress = getProgressBar(1, 4);

    const text = `
<b>📝 Новая заявка</b>

${progress}
<i>Шаг 1 из 4 — Знакомство</i>

━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Как вас зовут?</b>

<i>Введите ваше имя или название компании</i>`;

    const sent = await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...getRequestKeyboard('waiting_name')
    });

    const state = userStates.get(chatId);
    state.messageIds.push(sent.message_id);
    userStates.set(chatId, state);
}

async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Кнопка "Отмена" с обычной клавиатуры
    if (text === '❌ Отмена') {
        cancelRequest(chatId);
        return;
    }

    const state = userStates.get(chatId);
    if (!state) return;

    switch (state.step) {
        case 'waiting_name':
            await handleNameInput(chatId, text, state);
            break;

        case 'waiting_phone':
            await handlePhoneInput(chatId, text, state);
            break;

        case 'waiting_email':
            await handleEmailInput(chatId, text, state);
            break;

        case 'waiting_message':
            await handleMessageInput(chatId, text, state);
            break;
    }
}

async function handleNameInput(chatId, text, state) {
    if (text.length < 2) {
        await bot.sendMessage(chatId, '❌ Имя слишком короткое. Введите минимум 2 символа:', {
            ...getRequestKeyboard('waiting_name')
        });
        return;
    }

    state.name = text;
    state.step = 'waiting_phone';
    userStates.set(chatId, state);

    const progress = getProgressBar(2, 4);

    const responseText = `
<b>📝 Новая заявка</b>

${progress}
<i>Шаг 2 из 4 — Контакт</i>

━━━━━━━━━━━━━━━━━━━━━━━

✅ Имя: <b>${escapeHtml(state.name)}</b>

📱 <b>Введите номер телефона</b>

<i>Или нажмите кнопку ниже, чтобы поделиться номером</i>`;

    await bot.sendMessage(chatId, responseText, {
        parse_mode: 'HTML',
        ...getPhoneKeyboard()
    });
}

async function handlePhoneInput(chatId, text, state) {
    if (!isValidPhone(text)) {
        await bot.sendMessage(chatId,
            '❌ Некорректный номер.\n\nВведите в формате: <code>+7 XXX XXX-XX-XX</code>\nИли нажмите кнопку "Отправить мой номер"',
            { parse_mode: 'HTML', ...getPhoneKeyboard() }
        );
        return;
    }

    state.phone = formatPhone(text);
    state.step = 'waiting_email';
    userStates.set(chatId, state);

    await askForEmail(chatId, state);
}

async function handleContact(msg) {
    const chatId = msg.chat.id;
    const state = userStates.get(chatId);

    if (state && state.step === 'waiting_phone') {
        state.phone = formatPhone(msg.contact.phone_number);
        state.step = 'waiting_email';
        userStates.set(chatId, state);

        await askForEmail(chatId, state);
    }
}

async function askForEmail(chatId, state) {
    const progress = getProgressBar(3, 4);

    const text = `
<b>📝 Новая заявка</b>

${progress}
<i>Шаг 3 из 4 — Email (опционально)</i>

━━━━━━━━━━━━━━━━━━━━━━━

✅ Имя: <b>${escapeHtml(state.name)}</b>
✅ Телефон: <b>${state.phone}</b>

📧 <b>Введите ваш Email</b>

<i>Или нажмите "Пропустить"</i>`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...removeKeyboard(),
        ...getRequestKeyboard('waiting_email')
    });
}

async function handleEmailInput(chatId, text, state) {
    if (!isValidEmail(text)) {
        await bot.sendMessage(chatId,
            '❌ Некорректный email. Введите в формате: <code>example@mail.ru</code>\nИли нажмите "Пропустить"',
            { parse_mode: 'HTML', ...getRequestKeyboard('waiting_email') }
        );
        return;
    }

    state.email = text;
    state.step = 'waiting_message';
    userStates.set(chatId, state);

    await askForMessage(chatId, state);
}

async function handleSkipEmail(chatId, messageId) {
    const state = userStates.get(chatId);
    if (!state || state.step !== 'waiting_email') return;

    await bot.deleteMessage(chatId, messageId).catch(() => {});

    state.email = '';
    state.step = 'waiting_message';
    userStates.set(chatId, state);

    await askForMessage(chatId, state);
}

async function askForMessage(chatId, state) {
    const progress = getProgressBar(4, 4);

    const text = `
<b>📝 Новая заявка</b>

${progress}
<i>Шаг 4 из 4 — Описание задачи</i>

━━━━━━━━━━━━━━━━━━━━━━━

✅ Имя: <b>${escapeHtml(state.name)}</b>
✅ Телефон: <b>${state.phone}</b>
✅ Email: <b>${state.email || '—'}</b>

💬 <b>Опишите вашу задачу</b>

<i>Расскажите, что вам нужно разработать</i>`;

    await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...getRequestKeyboard('waiting_message')
    });
}

async function handleMessageInput(chatId, text, state) {
    if (text.length < 5) {
        await bot.sendMessage(chatId,
            '❌ Сообщение слишком короткое. Опишите подробнее (минимум 5 символов):',
            { ...getRequestKeyboard('waiting_message') }
        );
        return;
    }

    state.message = text;
    await saveRequest(chatId, state);
}

async function requestPhoneShare(chatId, messageId) {
    await bot.deleteMessage(chatId, messageId).catch(() => {});

    await bot.sendMessage(chatId,
        '📱 Нажмите кнопку ниже, чтобы поделиться номером телефона:',
        getPhoneKeyboard()
    );
}

// ============================================
// СОХРАНЕНИЕ И ОТПРАВКА ЗАЯВКИ
// ============================================

async function saveRequest(chatId, state) {
    const submissions = getSubmissions();

    const newSubmission = {
        id: uuidv4(),
        name: state.name,
        email: state.email || '',
        phone: state.phone,
        message: state.message,
        source: 'telegram',
        telegramUserId: state.telegramUserId,
        telegramUsername: state.telegramUsername,
        isRead: false,
        createdAt: new Date().toISOString()
    };

    submissions.unshift(newSubmission);
    saveSubmissions(submissions);

    userStates.delete(chatId);

    // Отправляем красивое подтверждение
    const successText = `
<b>✅ Заявка успешно отправлена!</b>

━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Имя:</b> ${escapeHtml(state.name)}
📱 <b>Телефон:</b> ${state.phone}
📧 <b>Email:</b> ${state.email || '—'}

💬 <b>Сообщение:</b>
<i>${escapeHtml(state.message)}</i>

━━━━━━━━━━━━━━━━━━━━━━━

🎉 <b>Спасибо за обращение!</b>
Мы свяжемся с вами в течение часа.`;

    await bot.sendMessage(chatId, successText, {
        parse_mode: 'HTML',
        ...getMainInlineKeyboard()
    });

    // Уведомляем админа
    notifyAdmin(newSubmission);
}

function cancelRequest(chatId) {
    userStates.delete(chatId);

    bot.sendMessage(chatId, '❌ Заявка отменена.\n\nВы можете начать заново в любой момент.', {
        ...removeKeyboard(),
        ...getMainInlineKeyboard()
    });
}

// ============================================
// УВЕДОМЛЕНИЕ АДМИНА
// ============================================

function notifyAdmin(submission) {
    if (!bot || !config.adminChatId) {
        console.log('⚠️ Telegram: не удалось отправить уведомление');
        return;
    }

    const card = getAdminCard(submission);
    const keyboard = getAdminActionsKeyboard(
        submission.id,
        submission.phone,
        submission.telegramUsername
    );

    bot.sendMessage(config.adminChatId, card, {
        parse_mode: 'HTML',
        ...keyboard
    }).catch(err => console.error('Ошибка отправки уведомления админу:', err));
}

// Обработка действий админа
async function handleAdminDone(chatId, messageId, submissionId) {
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.id === submissionId);

    if (submission) {
        submission.isRead = true;
        saveSubmissions(submissions);
    }

    await bot.editMessageText(
        '✅ <b>Заявка отмечена как обработанная</b>',
        {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
        }
    );
}

async function handleAdminDelete(chatId, messageId, submissionId) {
    const submissions = getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);

    if (index !== -1) {
        submissions.splice(index, 1);
        saveSubmissions(submissions);
    }

    await bot.deleteMessage(chatId, messageId).catch(() => {});
}

// ============================================
// ЭКСПОРТ
// ============================================

module.exports = {
    start,
    notifyAdmin
};
