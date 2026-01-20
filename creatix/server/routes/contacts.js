const express = require('express');
const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const contactsFile = path.join(__dirname, '..', 'data', 'contacts.json');

// Получить контакты (публичный)
router.get('/', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Ошибка получения контактов' });
    }
});

// Обновить контакты (только админ)
router.put('/', isAuthenticated, (req, res) => {
    try {
        const { phone, email, address, social } = req.body;

        const contacts = {
            phone: phone || '',
            email: email || '',
            address: address || '',
            social: {
                vk: social?.vk || '',
                telegram: social?.telegram || '',
                whatsapp: social?.whatsapp || ''
            }
        };

        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

        res.json({ success: true, message: 'Контакты обновлены', data: contacts });
    } catch (error) {
        console.error('Update contacts error:', error);
        res.status(500).json({ error: 'Ошибка обновления контактов' });
    }
});

module.exports = router;
