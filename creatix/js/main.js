/**
 * Creatix - Main JavaScript
 * Анимации и интерактивность
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize all animations
    initHeaderScroll();
    initHeroAnimations();
    initScrollAnimations();
    initNavLinks();
    initMobileMenu();
    initStatsCounter();
    initFormSubmit();
    initChat();
    initDnaHelix();
    initAboutSlider();
    initProcessTabs();
});

/**
 * Header scroll effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Hero section entrance animations
 */
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Stagger entrance animations
    tl.from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3
    })
    .from('.hero-title', {
        y: 50,
        opacity: 0,
        duration: 1.2
    }, '-=0.6')
    .from('.hero-description', {
        y: 30,
        opacity: 0,
        duration: 1
    }, '-=0.8')
    .from('.hero-buttons', {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, '-=0.6')
    .from('.scroll-indicator', {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, '-=0.4')
    .from('.hero-badge', {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)'
    }, '-=0.8')
    .from('.hero-nav-arrows button', {
        x: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1
    }, '-=0.6');

    // Floating animation for badge
    gsap.to('.badge-circle', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    // About section
    gsap.from('.about-label', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    gsap.from('.about-title', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        y: 50,
        opacity: 0,
        duration: 1.2
    });

    gsap.from('.about-description', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 60%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    gsap.from('.about .btn-outline-light', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 50%'
        },
        y: 20,
        opacity: 0,
        duration: 0.8
    });

    // Background text parallax
    gsap.to('.about-bg-text', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        x: 100,
        ease: 'none'
    });

    // Page indicator animation
    gsap.from('.page-indicator', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 60%'
        },
        x: 50,
        opacity: 0,
        duration: 1
    });

    // Services section
    gsap.from('.services .section-header', {
        scrollTrigger: {
            trigger: '.services',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    gsap.from('.service-card', {
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 80%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
    });

    // Portfolio section
    gsap.from('.portfolio .section-header', {
        scrollTrigger: {
            trigger: '.portfolio',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    gsap.from('.portfolio-item', {
        scrollTrigger: {
            trigger: '.portfolio-grid',
            start: 'top 80%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1
    });

    // Process section
    gsap.from('.process .section-header', {
        scrollTrigger: {
            trigger: '.process',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    gsap.from('.process-step', {
        scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 80%'
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    // Contact section
    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%'
        },
        x: -50,
        opacity: 0,
        duration: 1
    });

    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%'
        },
        x: 50,
        opacity: 0,
        duration: 1
    });

    // Footer
    gsap.from('.footer-content', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });
}

/**
 * Navigation smooth scroll
 */
function initNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    // Close mobile menu if open
                    closeMobileMenu();

                    // Update active state
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    document.querySelectorAll(`.nav-link[href="${href}"]`).forEach(l => l.classList.add('active'));

                    // Smooth scroll
                    gsap.to(window, {
                        scrollTo: {
                            y: target,
                            offsetY: 80
                        },
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            }
        });
    });

    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Mobile menu functionality
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
}

function closeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Stats counter animation
 */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));

        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(stat, {
                    innerText: target,
                    duration: 2,
                    snap: { innerText: 1 },
                    ease: 'power2.out'
                });
            }
        });
    });
}

/**
 * Contact form submit
 */
function initFormSubmit() {
    const form = document.querySelector('.contact-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('.btn-submit');
            const originalText = btn.innerHTML;

            // Show loading state
            btn.innerHTML = 'Отправка...';
            btn.disabled = true;

            // Simulate form submission (replace with actual submission logic)
            setTimeout(() => {
                btn.innerHTML = 'Отправлено!';
                btn.style.background = '#10b981';

                // Reset form
                form.reset();

                // Reset button after delay
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
}

/**
 * Chat widget functionality
 */
function initChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWidget = document.getElementById('chat-widget');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatToggle || !chatWidget) return;

    // Toggle chat
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.add('active');
        chatInput.focus();
    });

    // Close chat
    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWidget.classList.contains('active')) {
            chatWidget.classList.remove('active');
        }
    });

    // Send message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            addMessage('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.', 'bot');
        }, 1000);
    });

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * DNA Helix animation
 */
function initDnaHelix() {
    const container = document.getElementById('dna-helix');
    if (!container) return;

    const numPairs = 14;

    for (let i = 0; i < numPairs; i++) {
        const pair = document.createElement('div');
        pair.className = 'dna-pair';
        pair.style.top = `${(i / numPairs) * 100}%`;
        pair.style.transform = `rotateY(${i * 25}deg)`;

        pair.innerHTML = `
            <div class="dna-node"></div>
            <div class="dna-line"></div>
            <div class="dna-node right"></div>
        `;

        container.appendChild(pair);
    }

    // Add scroll-triggered animation
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.from('.dna-container', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%'
            },
            scale: 0,
            opacity: 0,
            duration: 1.2,
            ease: 'back.out(1.7)'
        });
    }
}

/**
 * About section slider with auto-play
 */
function initAboutSlider() {
    const slides = document.querySelectorAll('.about-slide');
    const prevBtn = document.getElementById('about-prev');
    const nextBtn = document.getElementById('about-next');
    const progressBar = document.getElementById('slider-progress-bar');
    const currentNum = document.querySelector('.slide-num.current');

    if (!slides.length || !prevBtn || !nextBtn) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    const autoPlayInterval = 8000; // 8 seconds
    let autoPlayTimer = null;
    let progressTimer = null;
    let progressValue = 0;

    function goToSlide(index) {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('prev');

        // Update current slide index
        currentSlide = index;
        if (currentSlide >= totalSlides) currentSlide = 0;
        if (currentSlide < 0) currentSlide = totalSlides - 1;

        // Remove prev class and add active to new slide
        slides.forEach(slide => slide.classList.remove('prev'));
        slides[currentSlide].classList.add('active');

        // Update slide number
        if (currentNum) {
            currentNum.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        // Reset progress
        resetProgress();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetProgress() {
        progressValue = 0;
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    function startAutoPlay() {
        stopAutoPlay();

        // Progress animation
        progressTimer = setInterval(() => {
            progressValue += 100 / (autoPlayInterval / 100);
            if (progressBar) {
                progressBar.style.width = `${Math.min(progressValue, 100)}%`;
            }
        }, 100);

        // Auto switch
        autoPlayTimer = setTimeout(() => {
            nextSlide();
            startAutoPlay();
        }, autoPlayInterval);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
    });

    // Start auto-play
    startAutoPlay();

    // Pause on hover (optional)
    const slider = document.getElementById('about-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
    }
}

/**
 * Process section tabs with Glass Morphism indicator
 */
function initProcessTabs() {
    const tabs = document.querySelectorAll('.process-tab');
    const panels = document.querySelectorAll('.process-panel');
    const indicator = document.getElementById('tabs-indicator');

    if (!tabs.length || !panels.length) return;

    // Update indicator position
    function updateIndicator() {
        const activeTab = document.querySelector('.process-tab.active');
        if (activeTab && indicator) {
            indicator.style.width = activeTab.offsetWidth + 'px';
            indicator.style.left = activeTab.offsetLeft + 'px';
        }
    }

    // Initial indicator position
    setTimeout(updateIndicator, 100);

    // Tab click handler
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update indicator
            updateIndicator();

            // Update active panel
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.getAttribute('data-panel') === targetPanel) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Update on resize
    window.addEventListener('resize', updateIndicator);
}
