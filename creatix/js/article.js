// Article Page JavaScript

// Get article ID from URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// Article data - loaded from server
let currentArticle = null;
let allArticles = [];

// Initialize article page
document.addEventListener('DOMContentLoaded', async () => {
    if (!articleId) {
        window.location.href = '/blog.html';
        return;
    }

    // Load article from server
    const loaded = await loadArticle(articleId);
    if (!loaded) {
        window.location.href = '/blog.html';
        return;
    }

    renderArticle(currentArticle);
    await loadRelatedArticles(currentArticle.category, articleId);
    initShareButtons();
    initMobileMenu();
});

// Load article from server
async function loadArticle(id) {
    try {
        const response = await fetch(`/api/blog/${id}`);
        if (response.ok) {
            currentArticle = await response.json();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading article:', error);
        return false;
    }
}

// Load all articles for related section
async function loadRelatedArticles(category, currentId) {
    try {
        const response = await fetch('/api/blog');
        if (response.ok) {
            allArticles = await response.json();
            renderRelatedArticles(category, currentId);
        }
    } catch (error) {
        console.error('Error loading related articles:', error);
    }
}

// Render article
function renderArticle(article) {
    // Update page title
    document.title = `${article.title} | Блог Creatix`;

    // Update breadcrumb
    const breadcrumbTitle = document.querySelector('.breadcrumb-current');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = article.title;
    }

    // Update article header
    const categoryBadge = document.querySelector('.article-category');
    if (categoryBadge) {
        categoryBadge.textContent = article.categoryLabel;
        categoryBadge.href = `/blog.html?category=${article.category}`;
    }

    const titleEl = document.querySelector('.article-title');
    if (titleEl) {
        titleEl.textContent = article.title;
    }

    const dateEl = document.querySelector('.article-date');
    if (dateEl) {
        dateEl.textContent = formatDate(article.date);
    }

    const readTimeEl = document.querySelector('.article-read-time');
    if (readTimeEl) {
        readTimeEl.textContent = article.readTime;
    }

    const authorEl = document.querySelector('.article-author');
    if (authorEl) {
        authorEl.textContent = article.author;
    }

    // Update featured image
    const featuredImage = document.querySelector('.article-featured-image img');
    if (featuredImage) {
        featuredImage.src = article.image || 'https://via.placeholder.com/1200x600?text=No+Image';
        featuredImage.alt = article.title;
    }

    // Update content
    const contentEl = document.querySelector('.article-body');
    if (contentEl) {
        contentEl.innerHTML = article.content || `<p>${article.excerpt}</p>`;
    }

    // Update tags
    const tagsContainer = document.querySelector('.article-tags');
    if (tagsContainer && article.tags && article.tags.length > 0) {
        tagsContainer.innerHTML = article.tags.map(tag =>
            `<a href="/blog.html?tag=${encodeURIComponent(tag)}" class="article-tag">#${tag}</a>`
        ).join('');
    }

    // Update meta tags
    updateMetaTags(article);
}

// Update meta tags for SEO
function updateMetaTags(article) {
    // Description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
        const excerpt = article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');
        descMeta.content = excerpt;
    }

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = article.title;

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        const excerpt = article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');
        ogDesc.content = excerpt;
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.content = article.image;

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = window.location.href;
}

// Format date
function formatDate(dateString) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Render related articles
function renderRelatedArticles(category, currentId) {
    const relatedGrid = document.querySelector('.related-articles-grid');
    if (!relatedGrid) return;

    // Get articles from same category, excluding current
    let related = allArticles
        .filter(article => article.category === category && article.id !== currentId)
        .slice(0, 3);

    // If not enough from same category, add from others
    if (related.length < 3) {
        const others = allArticles
            .filter(article => article.id !== currentId && !related.find(r => r.id === article.id))
            .slice(0, 3 - related.length);
        related.push(...others);
    }

    if (related.length === 0) {
        relatedGrid.innerHTML = '<p class="no-related">Других статей пока нет</p>';
        return;
    }

    relatedGrid.innerHTML = related.map(article => `
        <article class="related-card">
            <a href="article.html?id=${article.id}" class="related-card-image">
                <img src="${article.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${article.title}" loading="lazy">
            </a>
            <div class="related-card-content">
                <span class="related-card-category">${article.categoryLabel}</span>
                <h3 class="related-card-title">
                    <a href="article.html?id=${article.id}">${article.title}</a>
                </h3>
                <span class="related-card-date">${formatDate(article.date)}</span>
            </div>
        </article>
    `).join('');
}

// Share buttons
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const network = btn.dataset.network;
            let shareUrl = '';

            switch (network) {
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}`;
                    break;
                case 'vk':
                    shareUrl = `https://vk.com/share.php?url=${pageUrl}&title=${pageTitle}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        btn.classList.add('copied');
                        setTimeout(() => btn.classList.remove('copied'), 2000);
                    });
                    return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// Mobile menu
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
