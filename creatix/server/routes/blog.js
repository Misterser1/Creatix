const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const blogFile = path.join(__dirname, '..', 'data', 'blog.json');
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'blog');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения (JPEG, PNG, WebP, GIF)'));
        }
    }
});

// Генерация slug из заголовка
function generateSlug(title) {
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return title
        .toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
}

// Категории
const categories = [
    { value: 'web', label: 'Веб-разработка' },
    { value: 'crm', label: 'CRM/ERP' },
    { value: 'ai', label: 'ИИ и автоматизация' },
    { value: 'business', label: 'Бизнес' }
];

// Получить все статьи для админки (требует авторизации)
router.get('/admin/all', isAuthenticated, (req, res) => {
    try {
        const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
        // Сортировка по дате (новые первые)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(articles);
    } catch (error) {
        console.error('Get admin articles error:', error);
        res.status(500).json({ error: 'Ошибка получения статей' });
    }
});

// Получить все статьи (публичный - только опубликованные)
router.get('/', (req, res) => {
    try {
        const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));

        // Только опубликованные для публичного API
        const filtered = articles.filter(a => a.isPublished);

        // Сортировка по дате (новые первые)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(filtered);
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ error: 'Ошибка получения статей' });
    }
});

// Получить категории
router.get('/categories', (req, res) => {
    res.json(categories);
});

// Получить статью по ID (публичный)
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
        const article = articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Если статья не опубликована - только для админа
        if (!article.isPublished && (!req.session || !req.session.isAdmin)) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        res.json(article);
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ error: 'Ошибка получения статьи' });
    }
});

// Добавить статью (только админ)
router.post('/', isAuthenticated, (req, res) => {
    // Создаём директорию если не существует
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    upload.single('image')(req, res, (uploadErr) => {
        if (uploadErr) {
            console.error('Upload error:', uploadErr);
            return res.status(400).json({ error: 'Ошибка загрузки: ' + uploadErr.message });
        }

        try {
            const { title, excerpt, content, category, date, readTime, author, tags, isPublished } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({ error: 'Укажите заголовок статьи' });
            }

            const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));

            // Генерируем ID из заголовка
            let id = generateSlug(title);

            // Проверяем уникальность ID
            let counter = 1;
            let originalId = id;
            while (articles.find(a => a.id === id)) {
                id = `${originalId}-${counter}`;
                counter++;
            }

            // Изображение
            const image = req.file
                ? `/uploads/blog/${req.file.filename}`
                : '';

            // Находим категорию
            const categoryObj = categories.find(c => c.value === category);

            // Парсим теги
            let parsedTags = [];
            if (tags) {
                try {
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                } catch {
                    parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
                }
            }

            const newArticle = {
                id,
                title: title.trim(),
                excerpt: excerpt ? excerpt.trim() : '',
                content: content || '',
                category: category || 'web',
                categoryLabel: categoryObj ? categoryObj.label : 'Веб-разработка',
                image,
                date: date || new Date().toISOString().split('T')[0],
                readTime: readTime || '5 мин',
                author: author || 'Команда Creatix',
                tags: parsedTags,
                isPublished: isPublished === 'true' || isPublished === true,
                createdAt: new Date().toISOString()
            };

            articles.push(newArticle);
            fs.writeFileSync(blogFile, JSON.stringify(articles, null, 2));

            res.json({ success: true, message: 'Статья добавлена', data: newArticle });
        } catch (error) {
            console.error('Add article error:', error);
            res.status(500).json({ error: 'Ошибка добавления статьи: ' + error.message });
        }
    });
});

// Обновить статью (только админ)
router.put('/:id', isAuthenticated, (req, res) => {
    // Создаём директорию если не существует
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    upload.single('image')(req, res, (uploadErr) => {
        if (uploadErr) {
            console.error('Upload error:', uploadErr);
            return res.status(400).json({ error: 'Ошибка загрузки: ' + uploadErr.message });
        }

        try {
            const { id } = req.params;
            const { title, excerpt, content, category, date, readTime, author, tags, isPublished } = req.body;

            const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
            const index = articles.findIndex(a => a.id === id);

            if (index === -1) {
                return res.status(404).json({ error: 'Статья не найдена' });
            }

            // Обновляем поля
            if (title) articles[index].title = title.trim();
            if (excerpt !== undefined) articles[index].excerpt = excerpt.trim();
            if (content !== undefined) articles[index].content = content;
            if (category) {
                articles[index].category = category;
                const categoryObj = categories.find(c => c.value === category);
                articles[index].categoryLabel = categoryObj ? categoryObj.label : articles[index].categoryLabel;
            }
            if (date) articles[index].date = date;
            if (readTime) articles[index].readTime = readTime;
            if (author) articles[index].author = author;

            // Теги
            if (tags !== undefined) {
                let parsedTags = [];
                try {
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                } catch {
                    parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
                }
                articles[index].tags = parsedTags;
            }

            // Статус публикации
            if (isPublished !== undefined) {
                articles[index].isPublished = isPublished === 'true' || isPublished === true;
            }

            // Если загружено новое изображение
            if (req.file) {
                // Удаляем старое изображение (если это загруженный файл)
                if (articles[index].image && articles[index].image.startsWith('/uploads/')) {
                    const oldImagePath = path.join(__dirname, '..', '..', articles[index].image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                articles[index].image = `/uploads/blog/${req.file.filename}`;
            }

            articles[index].updatedAt = new Date().toISOString();

            fs.writeFileSync(blogFile, JSON.stringify(articles, null, 2));

            res.json({ success: true, message: 'Статья обновлена', data: articles[index] });
        } catch (error) {
            console.error('Update article error:', error);
            res.status(500).json({ error: 'Ошибка обновления статьи: ' + error.message });
        }
    });
});

// Удалить статью (только админ)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;

        const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
        const index = articles.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Удаляем изображение
        if (articles[index].image && articles[index].image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', '..', articles[index].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        articles.splice(index, 1);
        fs.writeFileSync(blogFile, JSON.stringify(articles, null, 2));

        res.json({ success: true, message: 'Статья удалена' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ error: 'Ошибка удаления статьи' });
    }
});

// Переключить статус публикации (только админ)
router.put('/:id/toggle-publish', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;

        const articles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
        const index = articles.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        articles[index].isPublished = !articles[index].isPublished;
        articles[index].updatedAt = new Date().toISOString();

        fs.writeFileSync(blogFile, JSON.stringify(articles, null, 2));

        res.json({
            success: true,
            message: articles[index].isPublished ? 'Статья опубликована' : 'Статья снята с публикации',
            data: articles[index]
        });
    } catch (error) {
        console.error('Toggle publish error:', error);
        res.status(500).json({ error: 'Ошибка изменения статуса' });
    }
});

module.exports = router;
