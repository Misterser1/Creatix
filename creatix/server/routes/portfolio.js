const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const portfolioFile = path.join(__dirname, '..', 'data', 'portfolio.json');
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'portfolio');

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

// Для загрузки нескольких файлов (главное изображение + галерея)
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 20 }
]);

// Получить все проекты (публичный)
router.get('/', (req, res) => {
    try {
        const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));
        res.json(portfolio);
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ error: 'Ошибка получения портфолио' });
    }
});

// Добавить проект (только админ)
router.post('/', isAuthenticated, uploadFields, (req, res) => {
    try {
        const { title, category, description, theme, size, details } = req.body;

        const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));

        // Главное изображение
        const mainImage = req.files && req.files['image'] && req.files['image'][0]
            ? `/uploads/portfolio/${req.files['image'][0].filename}`
            : '';

        // Парсим details
        let parsedDetails = {};
        if (details) {
            try {
                parsedDetails = JSON.parse(details);
            } catch (e) {
                console.error('Error parsing details:', e);
            }
        }

        // Добавляем загруженные изображения галереи
        const galleryImages = [];
        if (mainImage) {
            galleryImages.push(mainImage);
        }
        if (req.files && req.files['galleryImages']) {
            req.files['galleryImages'].forEach(file => {
                galleryImages.push(`/uploads/portfolio/${file.filename}`);
            });
        }
        // Добавляем существующие изображения из details
        if (parsedDetails.gallery && parsedDetails.gallery.length > 0) {
            parsedDetails.gallery.forEach(img => {
                if (!galleryImages.includes(img)) {
                    galleryImages.push(img);
                }
            });
        }

        // Обновляем галерею в details
        parsedDetails.gallery = galleryImages;

        const newProject = {
            id: uuidv4(),
            title: title || 'Новый проект',
            category: category || 'Веб-разработка',
            description: description || '',
            image: mainImage,
            theme: theme || 'default',
            size: size || 'normal',
            order: portfolio.length,
            createdAt: new Date().toISOString(),
            details: parsedDetails
        };

        portfolio.push(newProject);
        fs.writeFileSync(portfolioFile, JSON.stringify(portfolio, null, 2));

        res.json({ success: true, message: 'Проект добавлен', data: newProject });
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ error: 'Ошибка добавления проекта' });
    }
});

// Обновить проект (только админ)
router.put('/:id', isAuthenticated, uploadFields, (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, theme, size, order, details } = req.body;

        const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));
        const index = portfolio.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        // Обновляем базовые поля
        if (title) portfolio[index].title = title;
        if (category) portfolio[index].category = category;
        if (description !== undefined) portfolio[index].description = description;
        if (theme) portfolio[index].theme = theme;
        if (size) portfolio[index].size = size;
        if (order !== undefined) portfolio[index].order = parseInt(order);

        // Если загружено новое главное изображение
        if (req.files && req.files['image'] && req.files['image'][0]) {
            // Удаляем старое изображение (если это загруженный файл)
            if (portfolio[index].image && portfolio[index].image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', '..', portfolio[index].image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            portfolio[index].image = `/uploads/portfolio/${req.files['image'][0].filename}`;
        }

        // Парсим и обновляем details
        let parsedDetails = portfolio[index].details || {};
        if (details) {
            try {
                parsedDetails = JSON.parse(details);
            } catch (e) {
                console.error('Error parsing details:', e);
            }
        }

        // Обновляем галерею
        const galleryImages = [];

        // Добавляем главное изображение первым
        if (portfolio[index].image) {
            galleryImages.push(portfolio[index].image);
        }

        // Добавляем новые загруженные изображения галереи
        if (req.files && req.files['galleryImages']) {
            req.files['galleryImages'].forEach(file => {
                galleryImages.push(`/uploads/portfolio/${file.filename}`);
            });
        }

        // Добавляем существующие изображения из details (кроме главного)
        if (parsedDetails.gallery && parsedDetails.gallery.length > 0) {
            parsedDetails.gallery.forEach(img => {
                if (!galleryImages.includes(img)) {
                    galleryImages.push(img);
                }
            });
        }

        parsedDetails.gallery = galleryImages;
        portfolio[index].details = parsedDetails;
        portfolio[index].updatedAt = new Date().toISOString();

        fs.writeFileSync(portfolioFile, JSON.stringify(portfolio, null, 2));

        res.json({ success: true, message: 'Проект обновлён', data: portfolio[index] });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Ошибка обновления проекта' });
    }
});

// Удалить проект (только админ)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const { id } = req.params;

        const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));
        const index = portfolio.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Проект не найден' });
        }

        // Удаляем изображение
        if (portfolio[index].image) {
            const imagePath = path.join(__dirname, '..', '..', portfolio[index].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        portfolio.splice(index, 1);

        // Пересчитываем порядок
        portfolio.forEach((p, i) => p.order = i);

        fs.writeFileSync(portfolioFile, JSON.stringify(portfolio, null, 2));

        res.json({ success: true, message: 'Проект удалён' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
});

// Изменить порядок проектов (только админ)
router.post('/reorder', isAuthenticated, (req, res) => {
    try {
        const { order } = req.body; // массив id в новом порядке

        const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));

        // Сортируем по новому порядку
        const reordered = order.map((id, index) => {
            const project = portfolio.find(p => p.id === id);
            if (project) {
                project.order = index;
                return project;
            }
            return null;
        }).filter(Boolean);

        fs.writeFileSync(portfolioFile, JSON.stringify(reordered, null, 2));

        res.json({ success: true, message: 'Порядок изменён' });
    } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({ error: 'Ошибка изменения порядка' });
    }
});

module.exports = router;
