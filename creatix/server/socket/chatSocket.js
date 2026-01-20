const { v4: uuidv4 } = require('uuid');
const { getChats, saveChats, findOrCreateChat } = require('../routes/chats');

// Хранилище подключений
const visitors = new Map(); // visitorId -> socketId
const admins = new Set(); // Set of admin socket IDs

module.exports = function(io) {
    io.on('connection', (socket) => {
        const { visitorId, type } = socket.handshake.query;

        // Определяем тип подключения
        if (type === 'admin') {
            handleAdminConnection(socket, io);
        } else if (visitorId) {
            handleVisitorConnection(socket, io, visitorId);
        }

        socket.on('disconnect', () => {
            if (type === 'admin') {
                admins.delete(socket.id);
                console.log('Admin disconnected:', socket.id);
            } else if (visitorId) {
                visitors.delete(visitorId);
                // Обновляем статус посетителя
                updateVisitorStatus(io, visitorId, false);
                console.log('Visitor disconnected:', visitorId);
            }
        });
    });
};

// Обработка подключения администратора
function handleAdminConnection(socket, io) {
    admins.add(socket.id);
    socket.join('admins');
    console.log('Admin connected:', socket.id);

    // Отправляем текущее количество непрочитанных
    const chats = getChats();
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    socket.emit('chats:unread-count', { count: totalUnread });

    // Админ отправляет сообщение
    socket.on('admin:message', (data) => {
        const { chatId, text } = data;
        if (!chatId || !text) return;

        const chats = getChats();
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        const message = {
            id: uuidv4(),
            chatId: chatId,
            sender: 'admin',
            senderName: 'Администратор',
            text: text.trim(),
            isRead: true,
            createdAt: new Date().toISOString()
        };

        chat.messages.push(message);
        chat.lastMessageAt = message.createdAt;
        saveChats(chats);

        // Отправляем сообщение всем админам
        io.to('admins').emit('chat:message', { chatId, message });

        // Отправляем сообщение посетителю
        const visitorSocketId = visitors.get(chat.visitorId);
        if (visitorSocketId) {
            io.to(visitorSocketId).emit('chat:message', { chatId, message });
        }
    });

    // Админ печатает
    socket.on('admin:typing', (data) => {
        const { chatId } = data;
        if (!chatId) return;

        const chats = getChats();
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        const visitorSocketId = visitors.get(chat.visitorId);
        if (visitorSocketId) {
            io.to(visitorSocketId).emit('admin:typing', { chatId });
        }
    });

    // Админ прекратил печатать
    socket.on('admin:stop-typing', (data) => {
        const { chatId } = data;
        if (!chatId) return;

        const chats = getChats();
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        const visitorSocketId = visitors.get(chat.visitorId);
        if (visitorSocketId) {
            io.to(visitorSocketId).emit('admin:stop-typing', { chatId });
        }
    });

    // Админ отметил чат как прочитанный
    socket.on('admin:read', (data) => {
        const { chatId } = data;
        if (!chatId) return;

        const chats = getChats();
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        chat.unreadCount = 0;
        chat.messages.forEach(msg => {
            if (msg.sender === 'visitor') {
                msg.isRead = true;
            }
        });
        saveChats(chats);

        // Обновляем счётчик для всех админов
        const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
        io.to('admins').emit('chats:unread-count', { count: totalUnread });
    });
}

// Обработка подключения посетителя
function handleVisitorConnection(socket, io, visitorId) {
    visitors.set(visitorId, socket.id);
    console.log('Visitor connected:', visitorId);

    // Обновляем статус онлайн
    updateVisitorStatus(io, visitorId, true);

    // Посетитель переподключается к существующему чату
    socket.on('visitor:reconnect', (data) => {
        const { chatId } = data;
        if (chatId) {
            const chats = getChats();
            const chat = chats.find(c => c.id === chatId && c.visitorId === visitorId);
            if (chat) {
                chat.isOnline = true;
                saveChats(chats);
                io.to('admins').emit('chat:status', { chatId, isOnline: true });
            }
        }
    });

    // Посетитель создаёт новый чат (первое сообщение)
    socket.on('visitor:new-chat', (data) => {
        const { message } = data;
        if (!message) return;

        const chat = findOrCreateChat(visitorId);

        const newMessage = {
            id: uuidv4(),
            chatId: chat.id,
            sender: 'visitor',
            senderName: 'Посетитель',
            text: message.trim(),
            isRead: false,
            createdAt: new Date().toISOString()
        };

        const chats = getChats();
        const chatIndex = chats.findIndex(c => c.id === chat.id);
        if (chatIndex !== -1) {
            chats[chatIndex].messages.push(newMessage);
            chats[chatIndex].lastMessageAt = newMessage.createdAt;
            chats[chatIndex].unreadCount++;
            chats[chatIndex].isOnline = true;
            saveChats(chats);

            // Отправляем посетителю ID чата
            socket.emit('chat:created', { chatId: chat.id });

            // Уведомляем админов о новом чате
            io.to('admins').emit('chat:new', chats[chatIndex]);

            // Обновляем счётчик непрочитанных
            const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
            io.to('admins').emit('chats:unread-count', { count: totalUnread });
        }
    });

    // Посетитель отправляет сообщение в существующий чат
    socket.on('visitor:message', (data) => {
        const { chatId, text } = data;
        if (!chatId || !text) return;

        const chats = getChats();
        const chat = chats.find(c => c.id === chatId && c.visitorId === visitorId);
        if (!chat) return;

        const message = {
            id: uuidv4(),
            chatId: chatId,
            sender: 'visitor',
            senderName: 'Посетитель',
            text: text.trim(),
            isRead: false,
            createdAt: new Date().toISOString()
        };

        chat.messages.push(message);
        chat.lastMessageAt = message.createdAt;
        chat.unreadCount++;
        saveChats(chats);

        // Отправляем сообщение всем админам
        io.to('admins').emit('chat:message', { chatId, message });

        // Обновляем счётчик непрочитанных
        const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
        io.to('admins').emit('chats:unread-count', { count: totalUnread });
    });

    // Посетитель печатает
    socket.on('visitor:typing', (data) => {
        const { chatId } = data;
        if (!chatId) return;

        io.to('admins').emit('visitor:typing', { chatId });
    });

    // Посетитель прекратил печатать
    socket.on('visitor:stop-typing', (data) => {
        const { chatId } = data;
        if (!chatId) return;

        io.to('admins').emit('visitor:stop-typing', { chatId });
    });
}

// Обновление статуса посетителя
function updateVisitorStatus(io, visitorId, isOnline) {
    const chats = getChats();
    const chat = chats.find(c => c.visitorId === visitorId && c.status === 'active');

    if (chat) {
        chat.isOnline = isOnline;
        saveChats(chats);
        io.to('admins').emit('chat:status', { chatId: chat.id, isOnline });
    }
}
