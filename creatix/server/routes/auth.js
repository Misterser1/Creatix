const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const adminFile = path.join(__dirname, '..', 'data', 'admin.json');

// Проверка авторизации (middleware)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Не авторизован' });
    }
};

// Вход
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));

        if (username !== adminData.username) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const isValid = await bcrypt.compare(password, adminData.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        req.session.isAdmin = true;
        req.session.username = username;

        res.json({ success: true, message: 'Вход выполнен успешно' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Выход
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка выхода' });
        }
        res.json({ success: true, message: 'Выход выполнен' });
    });
});

// Проверка статуса
router.get('/status', (req, res) => {
    res.json({
        isAuthenticated: !!(req.session && req.session.isAdmin),
        username: req.session?.username || null
    });
});

// Смена пароля
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));

        const isValid = await bcrypt.compare(currentPassword, adminData.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный текущий пароль' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        adminData.password = hashedPassword;

        fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));

        res.json({ success: true, message: 'Пароль изменён' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
module.exports.isAuthenticated = isAuthenticated;
