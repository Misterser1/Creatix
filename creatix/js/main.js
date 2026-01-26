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
    initCtaButtons();
    initMobileMenu();
    initStatsCounter();
    initFormSubmit();
    initChat();
    initDnaHelix();
    initAboutSlider();
    initProcessTabs();
    initSolutionsSlider();

    // Load dynamic data from API
    loadPortfolio();
    loadContacts();
    loadCases();
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

    // Cases section
    gsap.from('.cases-label', {
        scrollTrigger: {
            trigger: '.cases',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 0.8
    });

    gsap.from('.cases-title', {
        scrollTrigger: {
            trigger: '.cases',
            start: 'top 75%'
        },
        y: 40,
        opacity: 0,
        duration: 1
    });

    gsap.from('.flip-card', {
        scrollTrigger: {
            trigger: '.flip-cases',
            start: 'top 80%'
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    // Process section
    gsap.from('.process-header', {
        scrollTrigger: {
            trigger: '.process',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 1
    });

    // Energy Flow Animation - активирует этапы при скролле
    initEnergyFlow();

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
 * Energy Flow Animation
 * Энергия перетекает от этапа к этапу при скролле (Neon Charge style)
 */
function initEnergyFlow() {
    // Получаем все активные панели с шагами
    const processSteps = document.querySelectorAll('.process-panel.active .process-step');

    if (processSteps.length === 0) return;

    // Создаём ScrollTrigger для каждого шага
    processSteps.forEach((step, index) => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            end: 'bottom 30%',
            onEnter: () => {
                // Убираем класс с предыдущих шагов только если это первый шаг
                // или оставляем их активными для эффекта "заряженности"
                step.classList.add('energy-active');
            },
            onLeave: () => {
                // Оставляем активным при выходе вверх
            },
            onEnterBack: () => {
                step.classList.add('energy-active');
            },
            onLeaveBack: () => {
                // Убираем класс когда скроллим назад выше этапа
                step.classList.remove('energy-active');
            }
        });
    });

    // Отслеживаем смену табов и переинициализируем
    const tabs = document.querySelectorAll('.process-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Небольшая задержка для смены панели
            setTimeout(() => {
                // Убираем все активные классы
                document.querySelectorAll('.process-step.energy-active').forEach(s => {
                    s.classList.remove('energy-active');
                });
                // Убиваем старые триггеры и создаём новые
                ScrollTrigger.getAll().forEach(t => {
                    if (t.trigger && t.trigger.classList && t.trigger.classList.contains('process-step')) {
                        t.kill();
                    }
                });
                // Переинициализируем для новой активной панели
                initEnergyFlow();
            }, 100);
        });
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
                            offsetY: 80,
                            autoKill: false
                        },
                        duration: 1.2,
                        ease: 'power3.out'
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
 * CTA Button (Начать проект) smooth scroll with animation
 */
function initCtaButtons() {
    const ctaButtons = document.querySelectorAll('.btn-opticore[href="#contact"]');

    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Add click animation class
            btn.classList.add('clicking');

            // Remove animation class after animation ends
            setTimeout(() => {
                btn.classList.remove('clicking');
            }, 600);

            // Close mobile menu if open
            closeMobileMenu();

            // Get target section
            const target = document.querySelector('#contact');

            if (target) {
                // Smooth scroll with GSAP
                gsap.to(window, {
                    scrollTo: {
                        y: target,
                        offsetY: 80,
                        autoKill: false
                    },
                    duration: 1.5,
                    ease: 'power3.inOut',
                    delay: 0.15 // Small delay for button animation to start
                });
            }
        });
    });
}

/**
 * Mobile menu functionality - Big Typography Style
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on link click and update active state
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
                // Update active link
                mobileLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Handle CTA button click - close menu and smooth scroll to contacts
        const ctaBtn = mobileMenu.querySelector('.mobile-cta-btn');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();

                // Smooth scroll to contact section after menu closes
                setTimeout(() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            });
        }

        // Update active link on scroll
        window.addEventListener('scroll', () => {
            const sections = ['home', 'about', 'process', 'portfolio', 'contact'];
            const scrollPos = window.scrollY + 100;

            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;

                    if (scrollPos >= top && scrollPos < top + height) {
                        mobileLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${sectionId}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            });
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
 * Contact form submit with validation
 */
function initFormSubmit() {
    const form = document.querySelector('.contact-form');

    if (!form) return;

    // Get form fields
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const messageInput = form.querySelector('[name="message"]');

    // Validation patterns
    const patterns = {
        name: /^[а-яА-ЯёЁa-zA-Z\s\-]{2,50}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
        message: /^.{10,1000}$/s
    };

    // Error messages
    const errorMessages = {
        name: 'Введите корректное имя (2-50 символов, буквы)',
        email: 'Введите корректный email',
        phone: 'Введите телефон в формате +7 (XXX) XXX-XX-XX',
        message: 'Сообщение должно содержать минимум 10 символов'
    };

    // Show error for field
    function showError(input, message) {
        const group = input.closest('.floating-group');
        clearError(input);

        group.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        group.appendChild(errorDiv);
    }

    // Clear error from field
    function clearError(input) {
        const group = input.closest('.floating-group');
        group.classList.remove('error');
        const existingError = group.querySelector('.field-error');
        if (existingError) existingError.remove();
    }

    // Mark field as valid
    function markValid(input) {
        const group = input.closest('.floating-group');
        clearError(input);
        group.classList.add('valid');
    }

    // Remove valid mark
    function clearValid(input) {
        const group = input.closest('.floating-group');
        group.classList.remove('valid');
    }

    // Validate single field
    function validateField(input, pattern, errorMessage, required = true) {
        const value = input.value.trim();

        if (!value && !required) {
            clearError(input);
            clearValid(input);
            return true;
        }

        if (!value && required) {
            showError(input, 'Это поле обязательно для заполнения');
            return false;
        }

        if (!pattern.test(value)) {
            showError(input, errorMessage);
            return false;
        }

        markValid(input);
        return true;
    }

    // Format phone number on input
    function formatPhoneInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');

        // Remove leading 7 or 8 for formatting
        if (value.length > 0 && (value[0] === '7' || value[0] === '8')) {
            value = value.slice(1);
        }

        // Limit to 10 digits (after removing country code)
        value = value.slice(0, 10);

        let formatted = '';
        if (value.length === 0) {
            formatted = '';
        } else {
            formatted = '+7 (' + value.substring(0, 3);
            if (value.length > 3) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length > 6) {
                formatted += '-' + value.substring(6, 8);
            }
            if (value.length > 8) {
                formatted += '-' + value.substring(8, 10);
            }
        }

        input.value = formatted;
    }

    // Phone input formatting
    phoneInput.addEventListener('input', formatPhoneInput);
    phoneInput.addEventListener('blur', (e) => {
        if (e.target.value === '+7') {
            e.target.value = '';
        }
    });

    // Real-time validation on blur
    nameInput.addEventListener('blur', () => {
        if (nameInput.value.trim()) {
            validateField(nameInput, patterns.name, errorMessages.name);
        }
    });

    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim()) {
            validateField(emailInput, patterns.email, errorMessages.email);
        }
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim() && phoneInput.value !== '+7') {
            validateField(phoneInput, patterns.phone, errorMessages.phone, false);
        } else {
            clearError(phoneInput);
            clearValid(phoneInput);
        }
    });

    messageInput.addEventListener('blur', () => {
        if (messageInput.value.trim()) {
            validateField(messageInput, patterns.message, errorMessages.message);
        }
    });

    // Clear errors on input
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            clearError(input);
            clearValid(input);
        });
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateField(nameInput, patterns.name, errorMessages.name);
        const isEmailValid = validateField(emailInput, patterns.email, errorMessages.email);
        const isPhoneValid = validateField(phoneInput, patterns.phone, errorMessages.phone, false);
        const isMessageValid = validateField(messageInput, patterns.message, errorMessages.message);

        if (!isNameValid || !isEmailValid || !isPhoneValid || !isMessageValid) {
            // Focus first invalid field
            const firstError = form.querySelector('.floating-group.error .floating-input');
            if (firstError) firstError.focus();
            return;
        }

        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;

        // Get form data
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            message: messageInput.value.trim()
        };

        // Show loading state
        btn.innerHTML = 'Отправка...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                btn.innerHTML = 'Отправлено!';
                btn.style.background = '#10b981';

                // Clear valid marks and reset form
                [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
                    clearValid(input);
                });
                form.reset();

                // Reset button after delay
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error(data.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            btn.innerHTML = 'Ошибка';
            btn.style.background = '#ef4444';

            // Reset button after delay
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }
    });
}

/**
 * Chat widget functionality with Socket.IO
 */
function initChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatFab = document.getElementById('chat-fab');
    const chatWidget = document.getElementById('chat-widget');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatStatus = document.querySelector('.chat-status');

    if (!chatWidget) return;

    // Generate or get visitor ID
    let visitorId = localStorage.getItem('creatix_visitor_id');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('creatix_visitor_id', visitorId);
    }

    // Current chat ID (loaded from server or created)
    let currentChatId = localStorage.getItem('creatix_chat_id') || null;

    // Socket.IO connection
    let socket = null;
    let isConnected = false;
    let typingTimeout = null;

    // Initialize Socket.IO connection
    function connectSocket() {
        if (typeof io === 'undefined') {
            console.warn('Socket.IO not loaded, chat will work in offline mode');
            return;
        }

        socket = io('/', {
            query: { visitorId: visitorId }
        });

        socket.on('connect', () => {
            isConnected = true;
            updateConnectionStatus(true);
            console.log('Chat connected');

            // Load chat history
            loadChatHistory();
        });

        socket.on('disconnect', () => {
            isConnected = false;
            updateConnectionStatus(false);
            console.log('Chat disconnected');
        });

        // Chat created - save chat ID
        socket.on('chat:created', (data) => {
            if (data.chatId) {
                currentChatId = data.chatId;
                localStorage.setItem('creatix_chat_id', currentChatId);
                console.log('Chat created:', currentChatId);
            }
        });

        // Receive message from admin
        socket.on('chat:message', (data) => {
            if (data.message && data.message.sender === 'admin') {
                addMessage(data.message.text, 'bot');
                // Hide typing indicator
                hideTypingIndicator();
            }
        });

        // Admin typing indicator
        socket.on('admin:typing', () => {
            showTypingIndicator();
        });

        // Admin stopped typing
        socket.on('admin:stop-typing', () => {
            hideTypingIndicator();
        });

        // Connection error
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            isConnected = false;
            updateConnectionStatus(false);
        });
    }

    // Load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch(`/api/chats/visitor/${visitorId}`);
            const data = await response.json();

            if (data && data.id) {
                // Save chat ID
                currentChatId = data.id;
                localStorage.setItem('creatix_chat_id', currentChatId);

                if (data.messages && data.messages.length > 0) {
                    // Clear default welcome message
                    chatMessages.innerHTML = '';

                    // Render all messages
                    data.messages.forEach(msg => {
                        const type = msg.sender === 'visitor' ? 'user' : 'bot';
                        addMessage(msg.text, type, false);
                    });

                    // Scroll to bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            } else {
                // No active chat found - clear stored chatId
                currentChatId = null;
                localStorage.removeItem('creatix_chat_id');
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            // On error, clear stored chatId to allow creating new chat
            currentChatId = null;
            localStorage.removeItem('creatix_chat_id');
        }
    }

    // Update connection status
    function updateConnectionStatus(connected) {
        if (chatStatus) {
            chatStatus.textContent = connected ? 'Онлайн' : 'Офлайн';
            chatStatus.style.color = connected ? '#10b981' : '#ef4444';
        }
    }

    // Show typing indicator
    function showTypingIndicator() {
        let typingDiv = chatMessages.querySelector('.typing-indicator');
        if (!typingDiv) {
            typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message bot typing-indicator';
            typingDiv.innerHTML = `
                <p>
                    <span class="typing-dots">
                        <span></span><span></span><span></span>
                    </span>
                </p>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const typingDiv = chatMessages.querySelector('.typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // Function to open chat
    function openChat() {
        chatWidget.classList.add('active');
        if (chatFab) chatFab.style.display = 'none';
        if (chatInput) chatInput.focus();

        // Connect socket if not connected
        if (!socket) {
            connectSocket();
        }
    }

    // Toggle chat from original button
    if (chatToggle) {
        chatToggle.addEventListener('click', openChat);
    }

    // Toggle chat from FAB button
    if (chatFab) {
        chatFab.addEventListener('click', openChat);
    }

    // Function to close chat
    function closeChat() {
        chatWidget.classList.remove('active');
        if (chatFab) chatFab.style.display = 'flex';
    }

    // Close chat button
    if (chatClose) {
        chatClose.addEventListener('click', closeChat);
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWidget.classList.contains('active')) {
            closeChat();
        }
    });

    // Send typing indicator
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            if (socket && isConnected && currentChatId) {
                socket.emit('visitor:typing', { chatId: currentChatId });

                // Clear previous timeout
                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                }

                // Stop typing after 2 seconds of inactivity
                typingTimeout = setTimeout(() => {
                    socket.emit('visitor:stop-typing', { chatId: currentChatId });
                }, 2000);
            }
        });
    }

    // Send message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message to UI
        addMessage(message, 'user');
        chatInput.value = '';

        // Clear typing indicator
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            if (socket && isConnected && currentChatId) {
                socket.emit('visitor:stop-typing', { chatId: currentChatId });
            }
        }

        // Send via Socket.IO if connected
        if (socket && isConnected) {
            if (currentChatId) {
                // Existing chat - send message with chatId
                socket.emit('visitor:message', { chatId: currentChatId, text: message });
            } else {
                // New chat - create chat with first message
                socket.emit('visitor:new-chat', { message: message });
            }
        } else {
            // Fallback: show offline message
            setTimeout(() => {
                addMessage('Извините, сейчас мы офлайн. Оставьте сообщение, и мы ответим как можно скорее!', 'bot');
            }, 500);
        }
    });

    function addMessage(text, type, scroll = true) {
        // Remove typing indicator if adding a real message
        if (type === 'bot') {
            hideTypingIndicator();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `<p>${escapeHtmlChat(text)}</p>`;
        chatMessages.appendChild(messageDiv);

        if (scroll) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Escape HTML for chat messages
    function escapeHtmlChat(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }
    }

    function startAutoPlay() {
        stopAutoPlay();

        // Progress animation via CSS transition (no JS intervals)
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            // Force reflow
            progressBar.offsetWidth;
            progressBar.style.transition = `width ${autoPlayInterval}ms linear`;
            progressBar.style.width = '100%';
        }

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
        // Stop CSS transition
        if (progressBar) {
            const computedWidth = getComputedStyle(progressBar).width;
            progressBar.style.transition = 'none';
            progressBar.style.width = computedWidth;
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

/**
 * Solutions Slider
 */
function initSolutionsSlider() {
    const slides = document.querySelectorAll('.solutions-slider .slide');
    const tabs = document.querySelectorAll('.slider-tab');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Go to specific slide
    function goToSlide(index) {
        // Wrap around
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });

        // Update tabs
        tabs.forEach((tab, i) => {
            tab.classList.remove('active');
            if (i === index) {
                tab.classList.add('active');
            }
        });

        currentSlide = index;
    }

    // Tab click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // Arrow click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const slider = document.querySelector('.solutions-slider');
        if (!slider) return;

        const rect = slider.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView) {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
            }
        }
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    const slidesContainer = document.querySelector('.slides-container');
    if (slidesContainer) {
        slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                goToSlide(currentSlide + 1);
            } else {
                // Swipe right - previous slide
                goToSlide(currentSlide - 1);
            }
        }
    }
}

/**
 * Dynamic Portfolio Loading - Infinite Scroll Wall
 * Loads portfolio items from API and renders them in columns
 */
async function loadPortfolio() {
    const scrollWall = document.getElementById('portfolioScrollWall');
    if (!scrollWall) return;

    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
            console.warn('Portfolio API not available, using static content');
            loadStaticPortfolio();
            return;
        }

        const projects = await response.json();

        if (!projects || projects.length === 0) {
            console.warn('No portfolio projects found');
            loadStaticPortfolio();
            return;
        }

        // Sort by order
        projects.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Render scroll wall
        renderScrollWall(scrollWall, projects);

    } catch (error) {
        console.warn('Failed to load portfolio:', error);
        loadStaticPortfolio();
    }
}

/**
 * Render Infinite Scroll Wall
 */
function renderScrollWall(container, projects) {
    container.innerHTML = '';

    // Calculate number of columns based on viewport
    const numColumns = window.innerWidth > 992 ? 4 : window.innerWidth > 768 ? 3 : 2;

    // Create columns
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
        const column = document.createElement('div');
        column.className = 'scroll-column';
        columns.push(column);
        container.appendChild(column);
    }

    // Duplicate projects for infinite scroll effect (need enough to fill)
    const duplicatedProjects = [...projects, ...projects, ...projects, ...projects];

    // Distribute projects across columns
    duplicatedProjects.forEach((project, index) => {
        const columnIndex = index % numColumns;
        const item = createScrollItem(project);
        columns[columnIndex].appendChild(item);
    });
}

/**
 * Create scroll wall item
 */
function createScrollItem(project) {
    const item = document.createElement('div');
    item.className = 'scroll-item';

    // Add theme class
    if (project.theme && project.theme !== 'default') {
        item.classList.add(`${project.theme}-theme`);
    }

    // Build image path
    let imagePath = '';
    if (project.image) {
        imagePath = project.image.startsWith('/') ? project.image : `/images/portfolio/${project.image}`;
    }

    item.innerHTML = `
        <div class="scroll-item-image" style="background-image: url('${imagePath}');"></div>
        <div class="scroll-item-content">
            <span class="scroll-item-category">${escapeHtml(project.category || '')}</span>
            <h4 class="scroll-item-title">${escapeHtml(project.title || '')}</h4>
            <p class="scroll-item-desc">${escapeHtml(project.description || '')}</p>
        </div>
    `;

    // Add click handler to open modal
    item.addEventListener('click', () => openProjectModal(project));

    return item;
}

/**
 * Load static portfolio as fallback
 */
function loadStaticPortfolio() {
    const scrollWall = document.getElementById('portfolioScrollWall');
    if (!scrollWall) return;

    const staticProjects = [
        {
            title: 'EMERALD',
            category: 'ERP система',
            description: 'Комплексная ERP для мебельного производства',
            image: '/images/portfolio/emrld.png',
            theme: 'emerald'
        },
        {
            title: 'AICreatix',
            category: 'ИИ-сервис',
            description: 'Генерация маркетинговых документов с ИИ',
            image: '/images/portfolio/AICREATIX.png',
            theme: 'aicreatix'
        },
        {
            title: 'Babylon',
            category: 'Сайт + Админ-панель',
            description: 'Польская группа компаний',
            image: '/images/portfolio/Babylon.png',
            theme: 'babylon'
        }
    ];

    renderScrollWall(scrollWall, staticProjects);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Project Modal Functions
 */
let currentProjectData = null;

function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const modalContent = modal.querySelector('.project-modal');

    if (!modal) return;

    currentProjectData = project;

    // Remove previous theme classes
    modalContent.classList.remove('emerald-theme', 'aicreatix-theme', 'orange-theme', 'default-theme');

    // Add theme class
    if (project.theme && project.theme !== 'default') {
        modalContent.classList.add(`${project.theme}-theme`);
    }

    // Set basic info
    document.getElementById('projectModalCategory').textContent = project.category || '';
    document.getElementById('projectModalTitle').textContent = project.title || '';

    // Set meta info
    const details = project.details || {};

    const clientEl = document.getElementById('projectModalClient');
    const yearEl = document.getElementById('projectModalYear');
    const durationEl = document.getElementById('projectModalDuration');

    if (details.client) {
        clientEl.querySelector('span').textContent = details.client;
        clientEl.style.display = 'flex';
    } else {
        clientEl.style.display = 'none';
    }

    if (details.year) {
        yearEl.querySelector('span').textContent = details.year;
        yearEl.style.display = 'flex';
    } else {
        yearEl.style.display = 'none';
    }

    if (details.duration) {
        durationEl.querySelector('span').textContent = details.duration;
        durationEl.style.display = 'flex';
    } else {
        durationEl.style.display = 'none';
    }

    // Set problem and solution
    document.getElementById('projectModalProblem').textContent = details.problem || project.description || '';
    document.getElementById('projectModalSolution').textContent = details.solution || '';

    // Set results
    const resultsContainer = document.getElementById('projectModalResults');
    resultsContainer.innerHTML = '';

    if (details.results && details.results.length > 0) {
        details.results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'project-result-card';
            card.innerHTML = `
                <div class="project-result-value">${escapeHtml(result.value)}</div>
                <div class="project-result-label">${escapeHtml(result.label)}</div>
            `;
            resultsContainer.appendChild(card);
        });
        resultsContainer.style.display = 'grid';
    } else {
        resultsContainer.style.display = 'none';
    }

    // Set technologies
    const techContainer = document.getElementById('projectModalTechnologies');
    techContainer.innerHTML = '';

    if (details.technologies && details.technologies.length > 0) {
        details.technologies.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'project-tech-tag';
            tag.textContent = tech;
            techContainer.appendChild(tag);
        });
        techContainer.parentElement.style.display = 'block';
    } else {
        techContainer.parentElement.style.display = 'none';
    }

    // Set gallery
    const mainImage = document.getElementById('projectMainImage');
    const thumbsContainer = document.getElementById('projectGalleryThumbs');

    let gallery = details.gallery || [];
    if (gallery.length === 0 && project.image) {
        gallery = [project.image];
    }

    if (gallery.length > 0) {
        const firstImage = gallery[0].startsWith('/') ? gallery[0] : `/images/portfolio/${gallery[0]}`;
        mainImage.src = firstImage;
        mainImage.alt = project.title || '';

        thumbsContainer.innerHTML = '';
        gallery.forEach((img, index) => {
            const imgPath = img.startsWith('/') ? img : `/images/portfolio/${img}`;
            const thumb = document.createElement('div');
            thumb.className = `project-thumb${index === 0 ? ' active' : ''}`;
            thumb.innerHTML = `<img src="${imgPath}" alt="${project.title || ''} - ${index + 1}">`;
            thumb.addEventListener('click', () => {
                mainImage.src = imgPath;
                thumbsContainer.querySelectorAll('.project-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbsContainer.appendChild(thumb);
        });

        // Hide thumbs if only one image
        thumbsContainer.style.display = gallery.length > 1 ? 'flex' : 'none';
    }

    // Reset scroll position of modal info
    const modalInfo = modal.querySelector('.project-modal-info');
    if (modalInfo) {
        modalInfo.scrollTop = 0;
    }

    // Show modal
    modal.classList.add('active');

    // Block body scroll
    scrollLock.enable();
}

// Scroll lock utility
const scrollLock = {
    scrollY: 0,

    enable() {
        this.scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
    },

    disable() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, this.scrollY);
    }
};

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('active');

        // Restore body scroll
        scrollLock.disable();

        currentProjectData = null;
    }
}

// ========================================
// IMAGE LIGHTBOX
// ========================================
let lightboxImages = [];
let lightboxCurrentIndex = 0;

function openLightbox(images, startIndex = 0) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (!lightbox || !images || images.length === 0) return;

    lightboxImages = images;
    lightboxCurrentIndex = startIndex;

    // Показать/скрыть навигацию для одного изображения
    if (images.length === 1) {
        lightbox.classList.add('single-image');
    } else {
        lightbox.classList.remove('single-image');
    }

    updateLightboxImage();
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (lightboxImage && lightboxImages.length > 0) {
        lightboxImage.src = lightboxImages[lightboxCurrentIndex];
        if (lightboxCounter) {
            lightboxCounter.textContent = `${lightboxCurrentIndex + 1} / ${lightboxImages.length}`;
        }
    }
}

function lightboxPrev() {
    if (lightboxImages.length <= 1) return;
    lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
}

function lightboxNext() {
    if (lightboxImages.length <= 1) return;
    lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxImages.length;
    updateLightboxImage();
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeProjectModal');
    const ctaBtn = document.getElementById('projectModalCTA');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    if (modal) {
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            closeProjectModal();
        });
    }

    // Lightbox event listeners
    const lightbox = document.getElementById('imageLightbox');
    const closeLightboxBtn = document.getElementById('closeLightbox');
    const lightboxPrevBtn = document.getElementById('lightboxPrev');
    const lightboxNextBtn = document.getElementById('lightboxNext');

    if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', lightboxPrev);
    }

    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', lightboxNext);
    }

    if (lightbox) {
        // Close on overlay click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('imageLightbox');
        const modal = document.getElementById('projectModal');

        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                lightboxPrev();
            } else if (e.key === 'ArrowRight') {
                lightboxNext();
            }
        } else if (modal && modal.classList.contains('active') && e.key === 'Escape') {
            closeProjectModal();
        }
    });

    // Click on main gallery image to open lightbox
    const galleryMain = document.getElementById('projectGalleryMain');
    if (galleryMain) {
        galleryMain.addEventListener('click', () => {
            if (currentProjectData && currentProjectData.details && currentProjectData.details.gallery) {
                const gallery = currentProjectData.details.gallery;
                const mainImage = document.getElementById('projectMainImage');
                const currentSrc = mainImage ? mainImage.src : '';

                // Найти индекс текущего изображения
                let startIndex = 0;
                if (currentSrc) {
                    const srcPath = new URL(currentSrc).pathname;
                    startIndex = gallery.findIndex(img => img === srcPath || currentSrc.endsWith(img));
                    if (startIndex === -1) startIndex = 0;
                }

                openLightbox(gallery, startIndex);
            }
        });
    }
});

/**
 * Format phone number to Russian format: +7 (XXX) XXX-XX-XX
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Убираем все кроме цифр
    const digits = phone.replace(/\D/g, '');

    // Если номер начинается с 8, заменяем на 7
    let normalizedDigits = digits;
    if (digits.length === 11 && digits.startsWith('8')) {
        normalizedDigits = '7' + digits.slice(1);
    }

    // Форматируем
    if (normalizedDigits.length === 11) {
        return `+${normalizedDigits[0]} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
    } else if (normalizedDigits.length === 10) {
        return `+7 (${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6, 8)}-${normalizedDigits.slice(8, 10)}`;
    }

    return phone; // Возвращаем как есть, если формат неизвестен
}

/**
 * Get raw phone number for tel: link
 */
function getRawPhoneNumber(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) {
        return '+7' + digits.slice(1);
    }
    if (digits.length === 10) {
        return '+7' + digits;
    }
    if (digits.length === 11) {
        return '+' + digits;
    }
    return phone;
}

/**
 * Load contacts from API and update page
 */
async function loadContacts() {
    try {
        const response = await fetch('/api/contacts');
        const data = await response.json();

        if (!data) return;

        // Форматируем телефон
        const formattedPhone = formatPhoneNumber(data.phone);
        const rawPhone = getRawPhoneNumber(data.phone);

        // Обновляем все элементы с телефоном
        document.querySelectorAll('[data-contact-phone]').forEach(el => {
            el.textContent = formattedPhone;
        });

        // Обновляем ссылки на телефон
        document.querySelectorAll('[data-contact-phone-link]').forEach(el => {
            el.href = `tel:${rawPhone}`;
        });

        // Обновляем email
        document.querySelectorAll('[data-contact-email]').forEach(el => {
            el.textContent = data.email || '';
        });

        // Обновляем ссылки на email
        document.querySelectorAll('[data-contact-email-link]').forEach(el => {
            el.href = `mailto:${data.email || ''}`;
        });

        // Обновляем адрес
        document.querySelectorAll('[data-contact-address]').forEach(el => {
            el.textContent = data.address || '';
        });

        // Обновляем соцсети
        const social = data.social || {};

        // VK
        document.querySelectorAll('[data-contact-vk]').forEach(el => {
            if (social.vk) {
                el.href = social.vk;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // Telegram
        document.querySelectorAll('[data-contact-telegram]').forEach(el => {
            if (social.telegram) {
                el.href = social.telegram;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

        // WhatsApp
        document.querySelectorAll('[data-contact-whatsapp]').forEach(el => {
            if (social.whatsapp) {
                // Формируем ссылку на WhatsApp
                const waNumber = social.whatsapp.replace(/\D/g, '');
                el.href = `https://wa.me/${waNumber}`;
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Failed to load contacts:', error);
    }
}

/**
 * Load cases from API and render flip cards
 */
async function loadCases() {
    const container = document.getElementById('flipCasesContainer');
    if (!container) return;

    try {
        const response = await fetch('/api/cases');
        if (!response.ok) {
            console.warn('Cases API not available');
            return;
        }

        const cases = await response.json();
        if (!cases || cases.length === 0) return;

        // Icon SVG paths for different industries
        const iconPaths = {
            building: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>',
            cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
            user: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>',
            factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
            medical: '<path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"/><path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3"/><path d="M12 4v16"/><path d="M8 12h8"/>',
            education: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
            finance: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
            logistics: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'
        };

        // Render cases
        container.innerHTML = cases.map(caseItem => `
            <div class="flip-card">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="flip-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="url(#caseIconGradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                ${iconPaths[caseItem.icon] || iconPaths.building}
                            </svg>
                        </div>
                        <div class="flip-industry">${caseItem.industry}</div>
                        <div class="flip-problem">${caseItem.problem}</div>
                        <div class="flip-desc">${caseItem.description || ''}</div>
                        ${caseItem.solutions && caseItem.solutions.length > 0 ? `
                        <div class="flip-solutions">
                            <div class="flip-solutions-title">Что сделали:</div>
                            <ul class="flip-solutions-list">
                                ${caseItem.solutions.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        <div class="flip-hint">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>
                            Наведите для результата
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="flip-back-title">${caseItem.resultTitle || 'Результат:'}</div>
                        ${(caseItem.results || []).map(r => `
                            <div class="flip-result">
                                <span class="flip-result-num">${r.value}</span>
                                <span class="flip-result-text">${r.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to load cases:', error);
    }
}

// ==========================================
// Legal Modals (Privacy Policy & Terms)
// ==========================================

function initLegalModals() {
    const privacyModal = document.getElementById('privacyModal');
    const termsModal = document.getElementById('termsModal');
    const openPrivacy = document.getElementById('openPrivacyPolicy');
    const openTerms = document.getElementById('openTerms');

    if (!privacyModal || !termsModal) return;

    // Open modals
    openPrivacy?.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal(privacyModal);
    });

    openTerms?.addEventListener('click', (e) => {
        e.preventDefault();
        openLegalModal(termsModal);
    });

    // Close buttons
    document.querySelectorAll('.legal-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.legal-modal');
            closeLegalModal(modal);
        });
    });

    // Close on backdrop click
    [privacyModal, termsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLegalModal(modal);
            }
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.legal-modal.active').forEach(modal => {
                closeLegalModal(modal);
            });
        }
    });
}

function openLegalModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLegalModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initLegalModals);
