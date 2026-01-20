const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const chatsFile = path.join(__dirname, '..', 'data', 'chats.json');

// Получить все чаты
function getChats() {
    try {
        if (!fs.existsSync(chatsFile)) {
            fs.writeFileSync(chatsFile, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(fs.readFileSync(chatsFile, 'utf8'));
    } catch (error) {
        console.error('Error reading chats:', error);
        return [];
    }
}

// Сохранить чаты
function saveChats(chats) {
    fs.writeFileSync(chatsFile, JSON.stringify(chats, null, 2));
}

// Найти или создать чат по visitorId
function findOrCreateChat(visitorId) {
    const chats = getChats();
    let chat = chats.find(c => c.visitorId === visitorId && c.status === 'active');

    if (!chat) {
        chat = {
            id: uuidv4(),
            visitorId: visitorId,
            visitorName: 'Посетитель',
            status: 'active',
            isOnline: true,
            unreadCount: 0,
            lastMessageAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            messages: []
        };
        chats.unshift(chat);
        saveChats(chats);
    }

    return chat;
}

// GET /api/chats - Получить все чаты (только админ)
router.get('/', isAuthenticated, (req, res) => {
    try {
        const chats = getChats();
        // Сортировка по последнему сообщению
        chats.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        res.json(chats);
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ error: 'Ошибка получения чатов' });
    }
});

// GET /api/chats/count - Получить количество непрочитанных (только админ)
router.get('/count', isAuthenticated, (req, res) => {
    try {
        const chats = getChats();
        const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
        const activeChats = chats.filter(c => c.status === 'active').length;
        res.json({ totalUnread, activeChats });
    } catch (error) {
        console.error('Get chats count error:', error);
        res.status(500).json({ error: 'Ошибка получения количества чатов' });
    }
});

// GET /api/chats/visitor/:visitorId - Получить чат по visitor ID (публичный)
router.get('/visitor/:visitorId', (req, res) => {
    try {
        const { visitorId } = req.params;
        const chats = getChats();
        const chat = chats.find(c => c.visitorId === visitorId && c.status === 'active');

        if (!chat) {
            return res.json({ messages: [] });
        }

        res.json(chat);
    } catch (error) {
        console.error('Get visitor chat error:', error);
        res.status(500).json({ error: 'Ошибка получения чата' });
    }
});

// GET /api/chats/:id - Получить чат по ID (только админ)
router.get('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const chats = getChats();
        const chat = chats.find(c => c.id === id);

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        res.json(chat);
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ error: 'Ошибка получения чата' });
    }
});

// PUT /api/chats/:id/read - Отметить чат как прочитанный (только админ)
router.put('/:id/read', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const chats = getChats();
        const chat = chats.find(c => c.id === id);

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        chat.unreadCount = 0;
        chat.messages.forEach(msg => {
            if (msg.sender === 'visitor') {
                msg.isRead = true;
            }
        });

        saveChats(chats);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark chat read error:', error);
        res.status(500).json({ error: 'Ошибка обновления чата' });
    }
});

// PUT /api/chats/:id/close - Закрыть чат (только админ)
router.put('/:id/close', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const chats = getChats();
        const chat = chats.find(c => c.id === id);

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        chat.status = 'closed';
        saveChats(chats);

        res.json({ success: true, message: 'Чат закрыт' });
    } catch (error) {
        console.error('Close chat error:', error);
        res.status(500).json({ error: 'Ошибка закрытия чата' });
    }
});

// PUT /api/chats/:id/reopen - Переоткрыть чат (только админ)
router.put('/:id/reopen', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const chats = getChats();
        const chat = chats.find(c => c.id === id);

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        chat.status = 'active';
        saveChats(chats);

        res.json({ success: true, message: 'Чат переоткрыт' });
    } catch (error) {
        console.error('Reopen chat error:', error);
        res.status(500).json({ error: 'Ошибка переоткрытия чата' });
    }
});

// DELETE /api/chats/:id - Удалить чат (только админ)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;
        const chats = getChats();
        const index = chats.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        chats.splice(index, 1);
        saveChats(chats);

        res.json({ success: true, message: 'Чат удалён' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ error: 'Ошибка удаления чата' });
    }
});

// Экспортируем также вспомогательные функции для socket handlers
module.exports = router;
module.exports.getChats = getChats;
module.exports.saveChats = saveChats;
module.exports.findOrCreateChat = findOrCreateChat;
