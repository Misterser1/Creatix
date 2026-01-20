const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
const sessionMiddleware = session({
    secret: 'creatix-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true в production с HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
});

app.use(sessionMiddleware);

// Статические файлы
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const portfolioRoutes = require('./routes/portfolio');
const submissionsRoutes = require('./routes/submissions');
const chatsRoutes = require('./routes/chats');

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/chats', chatsRoutes);

// Socket.IO handlers
require('./socket/chatSocket')(io);

// Telegram Bot
const telegramBot = require('./services/telegramBot');
telegramBot.start();

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Админ-панель
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

// Проверка существования data файлов
const dataDir = path.join(__dirname, 'data');
const defaultData = {
    'contacts.json': {
        phone: '+7 (999) 999-99-99',
        email: 'hello@creatix.ru',
        address: 'Москва, Россия',
        social: {
            vk: '',
            telegram: '',
            whatsapp: ''
        }
    },
    'portfolio.json': [],
    'submissions.json': [],
    'chats.json': [],
    'admin.json': {
        username: 'admin',
        // пароль: admin123 (хэшированный)
        password: '$2a$10$xVWsGPvXK4.G1eE5.YQxKOJBD7q0dDqKJF9.Y3m8Pj4iZqZkK.8Iq'
    }
};

// Создаём файлы данных если их нет
Object.keys(defaultData).forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData[file], null, 2));
        console.log(`Создан файл: ${file}`);
    }
});

// Запуск сервера (используем server.listen вместо app.listen для Socket.IO)
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🚀 CREATIX Server запущен!              ║
║                                           ║
║   Сайт:    http://localhost:${PORT}          ║
║   Админка: http://localhost:${PORT}/admin    ║
║                                           ║
║   Логин:   admin                          ║
║   Пароль:  admin123                       ║
║                                           ║
║   Socket.IO: Включён                      ║
║                                           ║
╚═══════════════════════════════════════════╝
    `);
});
