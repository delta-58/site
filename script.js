// ==================== КОНФІГУРАЦІЯ ====================

// Змінні оточення з .env (через Vite)
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Ініціалізація EmailJS
(function initEmailJS() {
    if (EMAILJS_PUBLIC_KEY && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error('EmailJS Public Key не знайдено. Перевірте .env файл');
    }
})();

// ==================== УТИЛІТИ ====================

/**
 * Отримує висоту заголовка з урахуванням CSS змінної
 */
function getHeaderOffset() {
    const cssOffset = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-offset');
    const parsedOffset = parseFloat(cssOffset);
    
    if (!isNaN(parsedOffset)) {
        return parsedOffset;
    }
    
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 80;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const extraSpace = isDesktop ? 32 : 24;
    
    return headerHeight + extraSpace;
}

/**
 * Визначає, чи увімкнено темний режим
 */
function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

// ==================== ДИНАМІЧНИЙ OFFSET ЗАГОЛОВКА ====================

function initDynamicHeaderOffset() {
    const header = document.querySelector('header');

    function updateHeaderOffset() {
        const headerHeight = header ? header.getBoundingClientRect().height : 80;
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        const extraSpace = isDesktop ? 32 : 24;
        const offset = Math.round(headerHeight + extraSpace);
        document.documentElement.style.setProperty('--header-offset', offset + 'px');
    }

    updateHeaderOffset();

    if ('ResizeObserver' in window && header) {
        const resizeObserver = new ResizeObserver(() => updateHeaderOffset());
        resizeObserver.observe(header);
    }

    window.addEventListener('resize', updateHeaderOffset);
    window.addEventListener('orientationchange', updateHeaderOffset);
}

// ==================== ПОКРАЩЕНІ СЕЛЕКТИ ====================

function initEnhancedSelects() {
    const lightOptionColor = '#fcd34d';
    const darkOptionColor = '#fde68a';
    const placeholderLight = '#9ca3af';
    const placeholderDark = '#6b7280';

    const enhancedSelects = document.querySelectorAll('[data-enhanced-select]');

    function closeAllSelects(except = null) {
        enhancedSelects.forEach(container => {
            if (container === except) return;
            const trigger = container.querySelector('[data-select-trigger]');
            const list = container.querySelector('[data-select-options]');
            if (trigger && list) {
                trigger.setAttribute('aria-expanded', 'false');
                list.classList.add('hidden');
                const icon = trigger.querySelector('svg');
                if (icon) {
                    icon.classList.remove('rotate-180');
                }
            }
        });
    }

    enhancedSelects.forEach(container => {
        const select = container.querySelector('select');
        if (!select || container.dataset.enhanced === 'true') return;
        container.dataset.enhanced = 'true';

        // Створення кнопки-тригера
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'flex w-full h-11 items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent px-4 text-left focus:outline-none focus:ring-2 focus:ring-primary';
        trigger.setAttribute('data-select-trigger', '');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const valueSpan = document.createElement('span');
        valueSpan.setAttribute('data-select-value', '');
        valueSpan.className = 'block truncate text-gray-400 dark:text-gray-500';
        trigger.appendChild(valueSpan);

        // Створення іконки стрілки
        const caret = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        caret.setAttribute('viewBox', '0 0 24 24');
        caret.setAttribute('fill', 'none');
        caret.setAttribute('stroke', 'currentColor');
        caret.setAttribute('stroke-width', '2');
        caret.classList.add('ml-2', 'h-5', 'w-5', 'flex-shrink-0', 'text-[#fcd34d]', 'dark:text-[#fde68a]', 'transition-transform', 'duration-200');
        const caretPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        caretPath.setAttribute('stroke-linecap', 'round');
        caretPath.setAttribute('stroke-linejoin', 'round');
        caretPath.setAttribute('d', 'M6 9l6 6 6-6');
        caret.appendChild(caretPath);
        trigger.appendChild(caret);

        // Створення списку опцій
        const list = document.createElement('ul');
        list.className = 'absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-2xl hidden';
        list.setAttribute('data-select-options', '');
        list.setAttribute('role', 'listbox');

        const options = Array.from(select.options);

        options.forEach(option => {
            if (option.disabled && option.hidden) {
                return;
            }

            const item = document.createElement('li');
            item.setAttribute('role', 'option');
            item.setAttribute('data-option-value', option.value);
            item.className = 'px-4 py-2 cursor-pointer text-[#fcd34d] dark:text-[#fde68a] hover:bg-primary/10 focus:bg-primary/10 focus:outline-none transition-colors duration-150';
            item.textContent = option.textContent;

            item.addEventListener('click', () => {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                updateDisplay();
                closeAllSelects();
            });

            item.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });

            list.appendChild(item);
        });

        container.appendChild(trigger);
        container.appendChild(list);

        function updateDisplay() {
            const currentOption = select.options[select.selectedIndex];
            const isPlaceholder = !currentOption || currentOption.disabled || currentOption.value === '';
            const optionColor = isDarkMode() ? darkOptionColor : lightOptionColor;
            const placeholderColor = isDarkMode() ? placeholderDark : placeholderLight;

            valueSpan.textContent = currentOption ? currentOption.textContent : '';
            if (isPlaceholder) {
                valueSpan.className = 'block truncate text-gray-400 dark:text-gray-500';
            } else {
                valueSpan.className = 'block truncate font-medium text-[#fcd34d] dark:text-[#fde68a]';
            }

            Array.from(list.children).forEach(item => {
                if (item.getAttribute('data-option-value') === select.value) {
                    item.classList.add('bg-primary/10');
                } else {
                    item.classList.remove('bg-primary/10');
                }
            });

            if (isPlaceholder) {
                select.style.color = placeholderColor;
            } else {
                select.style.color = optionColor;
            }
        }

        trigger.addEventListener('click', event => {
            event.preventDefault();
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                trigger.setAttribute('aria-expanded', 'false');
                list.classList.add('hidden');
                caret.classList.remove('rotate-180');
            } else {
                closeAllSelects(container);
                trigger.setAttribute('aria-expanded', 'true');
                list.classList.remove('hidden');
                caret.classList.add('rotate-180');
            }
        });

        select.addEventListener('change', updateDisplay);
        updateDisplay();
        select.classList.add('hidden');

        // Спостереження за зміною теми
        const themeObserver = new MutationObserver(updateDisplay);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    // Закриття при кліку поза селектом
    document.addEventListener('click', event => {
        const targetContainer = event.target.closest('[data-enhanced-select]');
        closeAllSelects(targetContainer || null);
    });

    // Закриття при натисканні Escape
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAllSelects();
        }
    });
}

// ==================== МОБІЛЬНЕ МЕНЮ ====================

function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (!menuButton || !menu) return;

    // Перемикання меню
    menuButton.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Закриття при кліку поза меню
    document.addEventListener('click', event => {
        if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });
}

// ==================== ПЛАВНА ПРОКРУТКА ====================

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetId === 'contacts') {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            } else if (targetElement) {
                const offset = getHeaderOffset();
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }

            // Закриття мобільного меню після кліку
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });
}

// ==================== МОДАЛЬНІ ВІКНА ====================

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    if (!modal || !content) return;

    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
}

function showErrorModal() {
    const modal = document.getElementById('errorModal');
    const content = document.getElementById('errorModalContent');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    const content = document.getElementById('errorModalContent');
    if (!modal || !content) return;

    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
}

function initModalHandlers() {
    // Закриття модальних вікон при кліку поза ними
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');

    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSuccessModal();
            }
        });
    }

    if (errorModal) {
        errorModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeErrorModal();
            }
        });
    }

    // Закриття модальних вікон клавішею Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSuccessModal();
            closeErrorModal();
        }
    });
}

// Експорт функцій для використання в HTML (onclick)
window.closeSuccessModal = closeSuccessModal;
window.closeErrorModal = closeErrorModal;

// ==================== ФОРМА ЗАЯВКИ ====================

function initApplicationForm() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const successModal = document.getElementById('successModal');
        const errorModal = document.getElementById('errorModal');
        const submitButton = e.target.querySelector('button[type="submit"]');

        if (!submitButton) return;

        // Приховуємо попередні модальні вікна
        if (successModal) successModal.classList.add('hidden');
        if (errorModal) errorModal.classList.add('hidden');

        // Блокуємо кнопку та показуємо індикатор завантаження
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="truncate">Відправляється...</span>';

        // Отримуємо дані форми
        const formDataRaw = new FormData(e.target);

        // Формуємо об'єкт для EmailJS
        const templateParams = {
            user_name: formDataRaw.get('user_name'),
            user_phone: formDataRaw.get('user_phone'),
            user_age: formDataRaw.get('user_age'),
            user_status: formDataRaw.get('user_status'),
            user_rank: formDataRaw.get('user_rank'),
            user_comment: formDataRaw.get('user_comment')
        };

        console.log('Відправляємо дані:', templateParams);

        // Перевірка наявності конфігурації EmailJS
        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
            console.error('Відсутні налаштування EmailJS. Перевірте .env файл');
            showErrorModal();
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }

        // Відправляємо через EmailJS
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showSuccessModal();
                form.reset();
            })
            .catch(function(error) {
                console.error('FAILED...', error);
                showErrorModal();
            })
            .finally(function() {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
    });
}

// ==================== ГАЛЕРЕЯ ФОТО ====================

function initPhotoGallery() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');

    if (!modal || !modalImage || !closeModal || !prevButton || !nextButton) return;

    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    const photoElements = gallerySection.querySelectorAll('.group .bg-cover');

    let imageUrls = [];
    let currentImageIndex = 0;

    // Збираємо URL всіх фото
    photoElements.forEach(photoElement => {
        photoElement.style.cursor = window.innerWidth >= 768 ? 'pointer' : 'default';
        const backgroundImage = getComputedStyle(photoElement).backgroundImage;
        const imageUrl = backgroundImage.replace('url("', '').replace('")', '');
        imageUrls.push(imageUrl);
    });

    function showImage(index) {
        if (index >= 0 && index < imageUrls.length) {
            currentImageIndex = index;
            modalImage.src = imageUrls[currentImageIndex];

            prevButton.style.display = currentImageIndex > 0 ? 'flex' : 'none';
            nextButton.style.display = currentImageIndex < imageUrls.length - 1 ? 'flex' : 'none';
        }
    }

    // Відкриття модального вікна при кліку на фото (тільки на десктопі)
    if (window.innerWidth >= 768) {
        photoElements.forEach((photoElement, index) => {
            photoElement.addEventListener('click', function() {
                currentImageIndex = index;
                showImage(currentImageIndex);
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    // Навігація кнопками
    prevButton.addEventListener('click', () => {
        if (currentImageIndex > 0) {
            showImage(currentImageIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentImageIndex < imageUrls.length - 1) {
            showImage(currentImageIndex + 1);
        }
    });

    // Закриття модального вікна
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    // Закриття при кліку поза фото
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Клавіатурна навігація
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
                showImage(currentImageIndex - 1);
            } else if (e.key === 'ArrowRight' && currentImageIndex < imageUrls.length - 1) {
                showImage(currentImageIndex + 1);
            }
        }
    });
}

// ==================== ВІДЕО КАРУСЕЛЬ ====================

function initVideoCarousel() {
    let currentVideoSlide = 0;
    const videoCarousel = document.getElementById('video-carousel');
    const prevVideoBtn = document.getElementById('prev-video');
    const nextVideoBtn = document.getElementById('next-video');

    if (!prevVideoBtn || !nextVideoBtn || !videoCarousel) return;

    function updateCarousel() {
        if (window.innerWidth >= 768) {
            videoCarousel.style.transform = `translateX(-${currentVideoSlide * 33.333}%)`;
        }
    }

    prevVideoBtn.addEventListener('click', () => {
        if (currentVideoSlide > 0) {
            currentVideoSlide--;
            updateCarousel();
        }
    });

    nextVideoBtn.addEventListener('click', () => {
        if (currentVideoSlide < 1) {
            currentVideoSlide++;
            updateCarousel();
        }
    });

    // Touch events only for desktop
    if (window.innerWidth >= 768) {
        let startX = 0;
        let endX = 0;

        videoCarousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        videoCarousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) { // Swipe left
                    if (currentVideoSlide < 3) {
                        currentVideoSlide++;
                        updateCarousel();
                    }
                } else { // Swipe right
                    if (currentVideoSlide > 0) {
                        currentVideoSlide--;
                        updateCarousel();
                    }
                }
            }
        });
    }
}

// ==================== FAQ АКОРДЕОН ====================

function initFAQAccordion() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('.faq-icon');
            const isOpen = !answer.classList.contains('hidden');

            // Закриваємо всі інші відповіді
            document.querySelectorAll('.faq-answer').forEach(item => {
                if (item !== answer) {
                    item.classList.add('hidden');
                }
            });
            document.querySelectorAll('.faq-icon').forEach(item => {
                if (item !== icon) {
                    item.classList.remove('rotate-180');
                }
            });

            // Перемикаємо поточну відповідь
            if (isOpen) {
                answer.classList.add('hidden');
                icon.classList.remove('rotate-180');
            } else {
                answer.classList.remove('hidden');
                icon.classList.add('rotate-180');
            }
        });
    });
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================

// Ініціалізуємо динамічний offset заголовка до завантаження DOM
(function() {
    document.addEventListener('DOMContentLoaded', initDynamicHeaderOffset);
})();

// Головна функція ініціалізації
document.addEventListener('DOMContentLoaded', function() {
    // Ініціалізація всіх компонентів
    initEnhancedSelects();
    initMobileMenu();
    initSmoothScrolling();
    initModalHandlers();
    initApplicationForm();
    initPhotoGallery();
    initVideoCarousel();
    initFAQAccordion();

    console.log('Всі скрипти успішно ініціалізовані');
});
