// Blog Data - загружается с сервера
let blogArticles = [];

// State
let currentCategory = 'all';
let displayedArticles = 0;
const articlesPerPage = 6;

// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoryBtns = document.querySelectorAll('.category-btn');
const newsletterForm = document.getElementById('newsletterForm');

// Загрузка статей с сервера
async function fetchArticles() {
    try {
        const response = await fetch('/api/blog');
        if (response.ok) {
            blogArticles = await response.json();
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        // Fallback - пустой массив
        blogArticles = [];
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем статьи с сервера
    await fetchArticles();

    loadArticles();
    initCategoryFilters();
    initNewsletter();
    initMobileMenu();
});

// Load Articles
function loadArticles(reset = true) {
    if (!blogGrid) return;

    if (reset) {
        displayedArticles = 0;
        blogGrid.innerHTML = '';
    }

    const filteredArticles = currentCategory === 'all'
        ? blogArticles
        : blogArticles.filter(article => article.category === currentCategory);

    const articlesToShow = filteredArticles.slice(displayedArticles, displayedArticles + articlesPerPage);

    if (articlesToShow.length === 0 && displayedArticles === 0) {
        blogGrid.innerHTML = `
            <div class="blog-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <p>Статей пока нет</p>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    articlesToShow.forEach((article, index) => {
        const articleCard = createArticleCard(article);
        articleCard.style.animationDelay = `${index * 0.1}s`;
        blogGrid.appendChild(articleCard);
    });

    displayedArticles += articlesToShow.length;

    // Show/hide load more button
    if (loadMoreBtn) {
        if (displayedArticles >= filteredArticles.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// Create Article Card
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
        <a href="article.html?id=${article.id}" class="blog-card-image">
            <img src="${article.image || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${article.title}" loading="lazy">
            <span class="blog-card-category">${article.categoryLabel}</span>
        </a>
        <div class="blog-card-content">
            <div class="blog-card-meta">
                <span class="blog-card-date">${formatDate(article.date)}</span>
                <span class="blog-card-dot">•</span>
                <span class="blog-card-read-time">${article.readTime}</span>
            </div>
            <h2 class="blog-card-title">
                <a href="article.html?id=${article.id}">${article.title}</a>
            </h2>
            <p class="blog-card-excerpt">${article.excerpt}</p>
            <a href="article.html?id=${article.id}" class="blog-card-link">
                Читать статью
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </a>
        </div>
    `;
    return card;
}

// Format Date
function formatDate(dateString) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Category Filters
function initCategoryFilters() {
    const wrapper = document.querySelector('.categories-wrapper');
    const slider = document.querySelector('.category-slider');

    // Set initial slider position
    if (slider && categoryBtns.length > 0) {
        updateSliderPosition(categoryBtns[0], slider);
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update slider position dynamically
            if (slider) {
                updateSliderPosition(btn, slider);
            }

            // Filter articles
            currentCategory = btn.dataset.category;
            loadArticles(true);
        });
    });

    // Recalculate on window resize
    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.category-btn.active');
        if (activeBtn && slider) {
            updateSliderPosition(activeBtn, slider);
        }
    });
}

// Update slider position based on active button
function updateSliderPosition(btn, slider) {
    const wrapper = btn.parentElement;
    const wrapperPadding = 5; // matches CSS padding

    // Get button position relative to wrapper
    const btnRect = btn.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const left = btn.offsetLeft - wrapperPadding;
    const width = btn.offsetWidth;

    slider.style.width = `${width}px`;
    slider.style.transform = `translateX(${left}px)`;
}

// Load More
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        loadArticles(false);
    });
}

// Newsletter Form
function initNewsletter() {
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();

            if (!email) return;

            // Save original content
            const originalContent = submitBtn.innerHTML;

            // Disable form and show loading
            emailInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = `
                Подписка...
                <span class="icon-wrap">
                    <span class="btn-spinner"></span>
                </span>
            `;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success with animation
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.innerHTML = `
                Готово!
                <span class="icon-wrap">
                    <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </span>
            `;

            // After short delay, show full success message
            await new Promise(resolve => setTimeout(resolve, 800));

            newsletterForm.innerHTML = `
                <div class="newsletter-success">
                    <div class="success-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <span>Спасибо! Вы подписаны на рассылку.</span>
                </div>
            `;
        });
    }
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// Export for article page
window.blogArticles = blogArticles;
window.fetchArticles = fetchArticles;
