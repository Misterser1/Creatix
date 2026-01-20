const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('./auth');
const telegramBot = require('../services/telegramBot');

const router = express.Router();
const submissionsFile = path.join(__dirname, '..', 'data', 'submissions.json');

// Инициализация файла при старте
function getSubmissions() {
    try {
        if (!fs.existsSync(submissionsFile)) {
            fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
    } catch (error) {
        console.error('Error reading submissions:', error);
        return [];
    }
}

function saveSubmissions(submissions) {
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
}

// Создать заявку (публичный - для формы на сайте)
router.post('/', (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Заполните обязательные поля: имя, email и сообщение' });
        }

        const submissions = getSubmissions();

        const newSubmission = {
            id: uuidv4(),
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            message: message.trim(),
            source: 'website',
            isRead: false,
            createdAt: new Date().toISOString()
        };

        submissions.unshift(newSubmission);
        saveSubmissions(submissions);

        // Уведомление в Telegram
        telegramBot.notifyAdmin(newSubmission);

        res.json({ success: true, message: 'Заявка отправлена' });
    } catch (error) {
        console.error('Create submission error:', error);
        res.status(500).json({ error: 'Ошибка отправки заявки' });
    }
});

// Получить все заявки (только админ)
router.get('/', isAuthenticated, (req, res) => {
    try {
        const submissions = getSubmissions();
        res.json(submissions);
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Ошибка получения заявок' });
    }
});

// Получить количество новых заявок (только админ)
router.get('/count', isAuthenticated, (req, res) => {
    try {
        const submissions = getSubmissions();
        const newCount = submissions.filter(s => !s.isRead).length;
        res.json({ total: submissions.length, new: newCount });
    } catch (error) {
        console.error('Get submissions count error:', error);
        res.status(500).json({ error: 'Ошибка получения количества заявок' });
    }
});

// Отметить все заявки как прочитанные (только админ) - ВАЖНО: должен быть перед /:id
router.put('/read-all', isAuthenticated, (req, res) => {
    try {
        const submissions = getSubmissions();

        submissions.forEach(s => {
            s.isRead = true;
        });

        saveSubmissions(submissions);

        res.json({ success: true, message: 'Все заявки отмечены как прочитанные' });
    } catch (error) {
        console.error('Mark all submissions read error:', error);
        res.status(500).json({ error: 'Ошибка обновления заявок' });
    }
});

// Отметить заявку как прочитанную (только админ)
router.put('/:id/read', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const submissions = getSubmissions();

        const index = submissions.findIndex(s => s.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }

        submissions[index].isRead = true;
        saveSubmissions(submissions);

        res.json({ success: true, message: 'Заявка отмечена как прочитанная' });
    } catch (error) {
        console.error('Mark submission read error:', error);
        res.status(500).json({ error: 'Ошибка обновления заявки' });
    }
});

// Удалить заявку (только админ)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const submissions = getSubmissions();

        const index = submissions.findIndex(s => s.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }

        submissions.splice(index, 1);
        saveSubmissions(submissions);

        res.json({ success: true, message: 'Заявка удалена' });
    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({ error: 'Ошибка удаления заявки' });
    }
});

module.exports = router;
