const express = require('express');
const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const casesFile = path.join(__dirname, '..', 'data', 'cases.json');

// Получить все кейсы (публичный)
router.get('/', (req, res) => {
    try {
        const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        res.json(cases);
    } catch (error) {
        console.error('Get cases error:', error);
        res.status(500).json({ error: 'Ошибка получения кейсов' });
    }
});

// Добавить кейс (только админ)
router.post('/', isAuthenticated, (req, res) => {
    try {
        const { industry, problem, description, icon, resultTitle, results } = req.body;

        const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));

        // Генерируем новый ID
        const maxId = cases.length > 0 ? Math.max(...cases.map(c => c.id)) : 0;

        const newCase = {
            id: maxId + 1,
            industry: industry || 'ОТРАСЛЬ',
            problem: problem || 'Описание проблемы',
            description: description || '',
            icon: icon || 'building',
            resultTitle: resultTitle || 'Результат:',
            results: results || []
        };

        cases.push(newCase);
        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));

        res.json({ success: true, message: 'Кейс добавлен', data: newCase });
    } catch (error) {
        console.error('Add case error:', error);
        res.status(500).json({ error: 'Ошибка добавления кейса' });
    }
});

// Обновить кейс (только админ)
router.put('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const { industry, problem, description, icon, resultTitle, results } = req.body;

        const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        const index = cases.findIndex(c => c.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        if (industry) cases[index].industry = industry;
        if (problem) cases[index].problem = problem;
        if (description !== undefined) cases[index].description = description;
        if (icon) cases[index].icon = icon;
        if (resultTitle) cases[index].resultTitle = resultTitle;
        if (results) cases[index].results = results;

        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));

        res.json({ success: true, message: 'Кейс обновлён', data: cases[index] });
    } catch (error) {
        console.error('Update case error:', error);
        res.status(500).json({ error: 'Ошибка обновления кейса' });
    }
});

// Удалить кейс (только админ)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;

        const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
        const index = cases.findIndex(c => c.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        cases.splice(index, 1);
        fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2));

        res.json({ success: true, message: 'Кейс удалён' });
    } catch (error) {
        console.error('Delete case error:', error);
        res.status(500).json({ error: 'Ошибка удаления кейса' });
    }
});

module.exports = router;
