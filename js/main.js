document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const servicesToggle = document.querySelector('.services-toggle');
    const servicesSubmenu = document.querySelector('.services-submenu');
    const servicesArrow = document.querySelector('.services-arrow');

    const MOBILE_NAV_BREAKPOINT = 1200;
    const HEADER_SCROLLED_OFFSET = 50;
    const HIDE_SCROLL_OFFSET_DESKTOP = 72;
    const HIDE_SCROLL_OFFSET_COMPACT = 24;
    const SCROLL_DELTA = 4;

    let lastScrollTop = 0;
    let ticking = false;

    function handleScroll() {
        if (!header) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > HEADER_SCROLLED_OFFSET) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Header always stays visible (no hide on scroll-down)
        header.classList.remove('hidden');

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            handleScroll();
        });
    }

    if (servicesToggle && servicesSubmenu && servicesArrow) {
        servicesToggle.addEventListener('click', function (e) {
            e.preventDefault();
            servicesSubmenu.classList.toggle('expanded');
            servicesArrow.classList.toggle('rotated');
            const wrapper = servicesToggle.closest('.mobile-menu-item');
            if (wrapper) wrapper.classList.toggle('services-expanded');
        });
    }


    // Mobile menu active item: match current page/service
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    mobileMenuLinks.forEach(function (link) {
        link.classList.remove('active', 'home-active');
    });

    const servicePages = new Set(
        ['services'].concat(
            Array.from(document.querySelectorAll('.hero-service-link[data-service]')).map((link) => link.dataset.service)
        )
    );

    const menuMap = {
        home: '/',
        contact: '/contact',
        faq: '/faq',
        about: '/about'
    };

    const currentPath = (window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
    const currentServiceForMenu = document.body.dataset.service || '';

    if (servicePages.has(currentServiceForMenu)) {
        if (servicesToggle) servicesToggle.classList.add('active');
    } else if (menuMap[currentServiceForMenu]) {
        const activeTopLink = document.querySelector(`.mobile-menu-link[href="${menuMap[currentServiceForMenu]}"]`);
        if (activeTopLink) activeTopLink.classList.add('active');
    } else {
        const activeByPath = document.querySelector(`.mobile-menu-link[href="${currentPath}"]`);
        if (activeByPath) {
            activeByPath.classList.add('active');
        } else {
            const home = document.querySelector('.mobile-menu-link[href="/"]');
            if (home) home.classList.add('active');
        }
    }
    document.querySelectorAll('.mobile-menu-link:not(.services-toggle)').forEach(function (link) {
        link.addEventListener('click', function () {
            if (mobileToggle && mobileMenu) {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                handleScroll();
            }
        });
    });

    // Hero active service
    const currentService = document.body.dataset.service;
    if (currentService) {
        const activeLink = document.querySelector(`.hero-service-link[data-service="${currentService}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    // FAQ toggle
    document.querySelectorAll('.faq-question').forEach(function (question) {
        question.addEventListener('click', function () {
            const item = question.closest('.faq-item');
            if (item) item.classList.toggle('active');
        });
    });

    // FAQ filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryTitle = document.getElementById('category-title');
    const faqItems = document.querySelectorAll('.faq-item');

    if (filterButtons.length && categoryTitle && faqItems.length) {
        const categoryTitles = {};
        filterButtons.forEach((btn) => {
            categoryTitles[btn.dataset.category] = btn.textContent.trim() + ' Questions';
        });

        const serviceToCategory = {
            home: 'general',
            services: 'general',
            faq: 'general',
            about: 'general',
            contact: 'general'
        };

        filterButtons.forEach((btn) => {
            const category = btn.getAttribute('data-category');
            if (category && category !== 'general' && category !== 'all') {
                serviceToCategory[category] = category;
            }
        });

        function applyFaqFilter(category) {
            categoryTitle.textContent = categoryTitles[category] || 'General Questions';

            faqItems.forEach(function (item) {
                const match = item.getAttribute('data-category') === category;
                item.style.display = match ? 'block' : 'none';
                if (!match) item.classList.remove('active');
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                applyFaqFilter(button.getAttribute('data-category'));
            });
        });

        const preferredCategory = serviceToCategory[currentService] || null;
        if (preferredCategory) {
            const preferredButton = document.querySelector(`.filter-btn[data-category="${preferredCategory}"]`);
            if (preferredButton) {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                preferredButton.classList.add('active');
            }
        }

        const first = document.querySelector('.filter-btn.active') || filterButtons[0];
        if (first) applyFaqFilter(first.getAttribute('data-category'));
    }
    // Quote form modal overlay (template-style behavior)
    // isPlaceholder guard (K-fallback): builds without a real LeadConnector URL
    // carry "" or "PLACEHOLDER_*" values. Treat those as no-form so the modal,
    // pre-warm, and script injection all short-circuit and the quote CTAs get
    // repointed to the native /form fallback page instead.
    const isPlaceholder = (v) => !v || /^PLACEHOLDER/i.test(v);
    const sanitizeWidgetValue = (v) => (isPlaceholder(v) ? '' : v);
    const quoteFormSrc = sanitizeWidgetValue(document.body.dataset.quoteFormSrc || ''); // Optional project-specific modal form
    const quoteFormScriptSrc = sanitizeWidgetValue(document.body.dataset.quoteFormScript || '');
    const quoteFormId = sanitizeWidgetValue(document.body.dataset.quoteFormId || '');
    const quoteFormName = document.body.dataset.quoteFormName || 'Website Enquiry Form';
    const quoteFormHeight = document.body.dataset.quoteFormHeight || '1266';
    const quoteFormIframeId = quoteFormId ? `inline-${quoteFormId}` : 'inline-quote-form';

    function ensureQuoteFormScript() {
        if (!quoteFormScriptSrc) return;
        if (document.querySelector(`script[src="${quoteFormScriptSrc}"]`)) return;
        const script = document.createElement('script');
        script.src = quoteFormScriptSrc;
        document.body.appendChild(script);
    }

    function ensureQuoteFormModal() {
        let modal = document.getElementById('formModal');
        if (modal) return modal;

        // Spinner keyframes, injected once per document.
        if (!document.getElementById('qfspin-style')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'qfspin-style';
            // The keyframes drive the loading spinner. The #formModal iframe rule
            // is the real fix: GoHighLevel's form_embed.js pins the iframe's inline
            // `height` to a few px until a resize handshake fires, and when that
            // handshake never completes (slow network, blocked embed) the form is
            // left collapsed and invisible. A stylesheet `min-height` is a separate
            // property form_embed.js never writes, so it floors the iframe at the
            // form's full height and the form always shows. form_embed.js can still
            // grow it taller via inline `height` when the handshake does succeed.
            styleEl.textContent = '@keyframes qfspin{to{transform:rotate(360deg)}}'
                + '#formModal iframe{min-height:' + quoteFormHeight + 'px !important;opacity:1 !important;visibility:visible !important;display:block !important;pointer-events:auto !important;}';
            document.head.appendChild(styleEl);
        }

        modal = document.createElement('div');
        modal.id = 'formModal';
        modal.style.cssText = [
            'display:none',
            'position:fixed',
            'top:0',
            'left:0',
            'width:100vw',
            'height:100vh',
            'background:rgba(0,0,0,0.7)',
            'z-index:100000',
            'overflow-y:auto',
            '-webkit-overflow-scrolling:touch',
            'padding:5vh 5vw'
        ].join(';');

        modal.innerHTML = `
            <div style="position:relative;margin:auto;width:100%;max-width:600px;box-sizing:border-box;">
                <button type="button" aria-label="Close quote form" style="position:absolute;top:-15px;right:-15px;background:var(--color-accent);border:none;font-size:24px;color:white;cursor:pointer;z-index:100001;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-weight:bold;">&times;</button>
                <div class="quote-form-skeleton" aria-hidden="true" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;border-radius:10px;gap:14px;pointer-events:none;">
                    <div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:var(--color-primary,#27296F);border-radius:50%;animation:qfspin 0.9s linear infinite;"></div>
                    <div style="font:500 14px/1.3 Inter,system-ui,sans-serif;color:#475569;">Loading quote form…</div>
                </div>
                <iframe src="${quoteFormSrc}" style="width:100%;border:none;border-radius:10px;position:relative;z-index:1;background:transparent;" id="${quoteFormIframeId}" data-layout="{'id':'INLINE'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="${quoteFormName}" data-height="${quoteFormHeight}" data-layout-iframe-id="${quoteFormIframeId}" data-form-id="${quoteFormId}" title="${quoteFormName}"></iframe>
            </div>
        `;

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeQuoteFormModal();
            }
        });

        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', closeQuoteFormModal);
        }

        // Reveal the form: fade the skeleton out on the iframe's first load,
        // and force it away after a timeout so a slow or blocked GHL resize
        // handshake can never leave "Loading quote form…" stuck over a form
        // that has actually rendered behind it.
        const iframeEl = modal.querySelector('iframe');
        const skeletonEl = modal.querySelector('.quote-form-skeleton');
        if (iframeEl && skeletonEl) {
            const revealForm = function () {
                if (!skeletonEl.isConnected) return;
                skeletonEl.style.transition = 'opacity 200ms ease';
                skeletonEl.style.opacity = '0';
                window.setTimeout(function () { skeletonEl.remove(); }, 250);
            };
            iframeEl.addEventListener('load', revealForm, { once: true });
            window.setTimeout(revealForm, 4000);
        }

        document.body.appendChild(modal);
        return modal;
    }

    function openQuoteFormModal() {
        if (!quoteFormSrc) return;
        const modal = ensureQuoteFormModal();
        ensureQuoteFormScript();
        modal.style.display = 'block';
        setTimeout(function () { modal.scrollTop = 0; }, 50);
        document.body.style.overflow = 'hidden';
    }

    function closeQuoteFormModal() {
        const modal = document.getElementById('formModal');
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    const quoteButtons = document.querySelectorAll('a[href="/contact#contact"], a[href="../contact#contact"], a[href="#contact"], .cta-banner-btn');
    if (quoteFormSrc) {
        quoteButtons.forEach(function (button) {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                openQuoteFormModal();
            });
        });
        const topBar = document.getElementById('top-bar');
        if (topBar) {
            topBar.addEventListener('click', function (e) {
                e.preventDefault();
                openQuoteFormModal();
            });
        }
    } else {
        // No GHL form configured: send every quote CTA to the native fallback
        // form page instead of the modal. The default /contact#contact hrefs
        // stay in the markup as the no-JS path.
        quoteButtons.forEach(function (button) {
            if (button.tagName === 'A') {
                button.setAttribute('href', '/form');
            }
        });
    }

    // Pre-warm the quote form so the first click feels instant.
    // The modal is inserted hidden; form_embed.js is injected so the iframe's
    // JS bundle begins downloading before any user interaction.
    if (quoteFormSrc) {
        const prewarm = function () {
            try {
                ensureQuoteFormModal();
                ensureQuoteFormScript();
            } catch (err) {
                // Silently ignore - the on-click path still works.
            }
        };
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(prewarm, { timeout: 3000 });
        } else {
            window.setTimeout(prewarm, 2500);
        }
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeQuoteFormModal();
        }
    });

    // --- Gallery Lightbox ---
    var galleryButtons = Array.from(document.querySelectorAll('.gallery-item button'));
    var lightbox = document.querySelector('.lightbox');

    if (galleryButtons.length && lightbox) {
        var lightboxImage = lightbox.querySelector('.lightbox-image');
        var lightboxCaption = lightbox.querySelector('.lightbox-caption');
        var lightboxCounter = lightbox.querySelector('.lightbox-counter');
        var lightboxCloseBtn = lightbox.querySelector('.lightbox-close');
        var lightboxPrevBtn = lightbox.querySelector('.lightbox-prev');
        var lightboxNextBtn = lightbox.querySelector('.lightbox-next');

        var lbCurrentIndex = 0;

        var lbImages = galleryButtons.map(function (btn) {
            return {
                src: btn.dataset.image,
                alt: btn.previousElementSibling
                    ? btn.previousElementSibling.getAttribute('alt') || 'Gallery image'
                    : 'Gallery image',
                caption: btn.dataset.caption || ''
            };
        });

        function updateNavArrows() {
            if (lbCurrentIndex === 0) {
                lightboxPrevBtn.classList.add('hidden');
            } else {
                lightboxPrevBtn.classList.remove('hidden');
            }
            if (lbCurrentIndex === lbImages.length - 1) {
                lightboxNextBtn.classList.add('hidden');
            } else {
                lightboxNextBtn.classList.remove('hidden');
            }
        }

        function updateLightbox() {
            var item = lbImages[lbCurrentIndex];
            lightboxImage.src = item.src;
            lightboxImage.alt = item.alt;
            lightboxCaption.textContent = item.caption;
            lightboxCounter.textContent = (lbCurrentIndex + 1) + ' / ' + lbImages.length;
            updateNavArrows();
        }

        function openGalleryLightbox(index) {
            lbCurrentIndex = index;
            lightbox.removeAttribute('hidden');
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            updateLightbox();
        }

        function closeGalleryLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }

        function lbNextImage() {
            if (lbCurrentIndex < lbImages.length - 1) {
                lbCurrentIndex++;
                updateLightbox();
            }
        }

        function lbPrevImage() {
            if (lbCurrentIndex > 0) {
                lbCurrentIndex--;
                updateLightbox();
            }
        }

        galleryButtons.forEach(function (btn, index) {
            btn.addEventListener('click', function () { openGalleryLightbox(index); });
        });

        lightboxCloseBtn.addEventListener('click', closeGalleryLightbox);
        lightboxPrevBtn.addEventListener('click', lbPrevImage);
        lightboxNextBtn.addEventListener('click', lbNextImage);

        // Click outside image to close
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeGalleryLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            switch (e.key) {
                case 'Escape':
                    closeGalleryLightbox();
                    break;
                case 'ArrowRight':
                    lbNextImage();
                    break;
                case 'ArrowLeft':
                    lbPrevImage();
                    break;
            }
        });

        // Touch swipe support for mobile
        var touchStartX = 0;
        var touchEndX = 0;
        var touchStartY = 0;
        var touchEndY = 0;

        var lightboxStage = lightbox.querySelector('.lightbox-stage');
        if (lightboxStage) {
            lightboxStage.addEventListener('touchstart', function (e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            lightboxStage.addEventListener('touchend', function (e) {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                var diffX = touchEndX - touchStartX;
                var diffY = touchEndY - touchStartY;
                // Only trigger if horizontal swipe is dominant and large enough
                if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) {
                        lbNextImage();
                    } else {
                        lbPrevImage();
                    }
                }
            }, { passive: true });
        }
    }

    // --- Blog Filter & Card Click ---
    var blogFilterBtns = document.querySelectorAll('.blog-listing-section .filter-btn');
    var blogCards = document.querySelectorAll('.blog-card');
    var featuredPosts = document.querySelectorAll('.featured-post');

    if (blogFilterBtns.length && blogCards.length) {
        blogFilterBtns.forEach(function (button) {
            button.addEventListener('click', function () {
                blogFilterBtns.forEach(function (btn) { btn.classList.remove('active'); });
                button.classList.add('active');
                var category = button.getAttribute('data-category');
                blogCards.forEach(function (card) {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.style.display = 'grid';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    function makeCardsFullyClickable(cards, linkSelector) {
        cards.forEach(function (card) {
            var link = card.querySelector(linkSelector);
            if (!link) return;

            card.style.cursor = 'pointer';
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');

            card.addEventListener('click', function (e) {
                if (e.target.closest('a, button')) return;
                window.location.href = link.href;
            });

            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = link.href;
                }
            });
        });
    }

    function normalizeBlogHref(href) {
        if (!href) return '';
        var clean = href.split('#')[0].split('?')[0];
        var idx = clean.toLowerCase().indexOf('/blogs/');
        if (idx >= 0) return clean.substring(idx);
        idx = clean.toLowerCase().indexOf('blogs/');
        if (idx >= 0) return '/' + clean.substring(idx).replace(/^\/+/, '');
        if (clean.endsWith('.html')) return '/' + clean.replace(/^\/+/, '').replace(/\.html$/, '');
        return clean;
    }

    function extractSlugFromHref(href) {
        var normalized = normalizeBlogHref(href).toLowerCase();
        return normalized.split('/').pop() || '';
    }

    async function loadBlogCandidatesFromListing() {
        var listingPaths = ['../blogs', '/blogs', 'blogs'];

        for (var i = 0; i < listingPaths.length; i++) {
            try {
                var response = await fetch(listingPaths[i], { credentials: 'same-origin' });
                if (!response.ok) continue;

                var html = await response.text();
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var nodes = Array.from(doc.querySelectorAll('.blog-card, .featured-post'));

                var candidates = nodes.map(function (node) {
                    var link = node.querySelector('.blog-card-btn, .featured-post-btn, a[href*="/blogs/"]');
                    if (!link) return null;

                    var href = normalizeBlogHref(link.getAttribute('href') || '');
                    if (!href || href.indexOf('/blogs/') === -1) return null;

                    var titleEl = node.querySelector('.blog-card-title, .featured-post-title, h2, h3');
                    var excerptEl = node.querySelector('.blog-card-excerpt, .featured-post-excerpt, p');
                    var imageEl = node.querySelector('img');

                    return {
                        href: href,
                        slug: extractSlugFromHref(href),
                        title: titleEl ? titleEl.textContent.trim() : 'Read article',
                        excerpt: excerptEl ? excerptEl.textContent.trim() : '',
                        imageSrc: imageEl ? (imageEl.getAttribute('src') || '') : '',
                        imageAlt: imageEl ? (imageEl.getAttribute('alt') || 'Article image') : 'Article image'
                    };
                }).filter(Boolean);

                if (candidates.length) return candidates;
            } catch (e) {
                // Try next listing path.
            }
        }

        return [];
    }

    function applyCandidateToRelatedCard(card, candidate) {
        var titleEl = card.querySelector('.related-card-title');
        var excerptEl = card.querySelector('.related-card-excerpt');
        var linkEl = card.querySelector('.related-card-link');
        var imgEl = card.querySelector('.related-card-image img, img');

        if (titleEl) titleEl.textContent = candidate.title;
        if (excerptEl) excerptEl.textContent = candidate.excerpt;
        if (linkEl) linkEl.setAttribute('href', candidate.href);

        if (imgEl && candidate.imageSrc) {
            var src = candidate.imageSrc;
            if (!/^https?:\/\//i.test(src) && src.charAt(0) !== '/') {
                src = '/' + src.replace(/^\/+/, '');
            }
            imgEl.setAttribute('src', src);
            imgEl.setAttribute('alt', candidate.imageAlt || candidate.title || 'Article image');
        }
    }

    async function sanitizeAndShuffleRelatedArticles() {
        var relatedGrid = document.querySelector('.related-grid');
        if (!relatedGrid) return;

        var currentSlug = (window.location.pathname.split('/').pop() || '').toLowerCase();
        var existingCards = Array.from(relatedGrid.querySelectorAll('.related-card'));
        if (!existingCards.length) return;

        var uniqueCards = [];
        var usedSlugs = new Set();

        existingCards.forEach(function (card) {
            var link = card.querySelector('.related-card-link');
            if (!link) {
                card.remove();
                return;
            }

            var slug = extractSlugFromHref(link.getAttribute('href') || '');
            if (!slug || slug === currentSlug || usedSlugs.has(slug)) {
                card.remove();
                return;
            }

            usedSlugs.add(slug);
            uniqueCards.push(card);
        });

        if (uniqueCards.length < 3) {
            var candidates = await loadBlogCandidatesFromListing();
            var fallbackPool = candidates.filter(function (item) {
                return item.slug && item.slug !== currentSlug && !usedSlugs.has(item.slug);
            });

            var templateCard = uniqueCards[0] || existingCards.find(function (c) { return c.querySelector('.related-card-link'); });

            while (templateCard && uniqueCards.length < 3 && fallbackPool.length) {
                var idx = Math.floor(Math.random() * fallbackPool.length);
                var candidate = fallbackPool.splice(idx, 1)[0];

                var newCard = templateCard.cloneNode(true);
                applyCandidateToRelatedCard(newCard, candidate);
                usedSlugs.add(candidate.slug);
                uniqueCards.push(newCard);
            }
        }

        for (var i = uniqueCards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = uniqueCards[i];
            uniqueCards[i] = uniqueCards[j];
            uniqueCards[j] = temp;
        }

        relatedGrid.innerHTML = '';
        uniqueCards.slice(0, 3).forEach(function (card) {
            relatedGrid.appendChild(card);
        });
    }

    sanitizeAndShuffleRelatedArticles().finally(function () {
        // Make listing/article cards fully clickable
        makeCardsFullyClickable(blogCards, '.blog-card-btn');
        makeCardsFullyClickable(featuredPosts, '.featured-post-btn');
        makeCardsFullyClickable(document.querySelectorAll('.related-card'), '.related-card-link');
        makeCardsFullyClickable(document.querySelectorAll('.project-card'), '.project-card-btn');
    });

    // --- TOC Scroll Highlighting ---
    var tocLinks = document.querySelectorAll('.toc-list a');
    if (tocLinks.length) {
        var tocTargets = [];
        tocLinks.forEach(function (link) {
            var id = link.getAttribute('href');
            if (id && id.startsWith('#')) {
                var el = document.querySelector(id);
                if (el) tocTargets.push({ link: link, target: el });
            }
        });

        if (tocTargets.length) {
            var tocScrollTicking = false;

            function updateTocHighlight() {
                var scrollPos = window.scrollY + Math.max(240, Math.round(window.innerHeight * 0.28));
                var activeLink = null;

                for (var i = tocTargets.length - 1; i >= 0; i--) {
                    if (tocTargets[i].target.offsetTop <= scrollPos) {
                        activeLink = tocTargets[i].link;
                        break;
                    }
                }

                tocLinks.forEach(function (link) { link.classList.remove('active'); });
                if (activeLink) activeLink.classList.add('active');
                tocScrollTicking = false;
            }

            window.addEventListener('scroll', function () {
                if (!tocScrollTicking) {
                    requestAnimationFrame(updateTocHighlight);
                    tocScrollTicking = true;
                }
            });
            updateTocHighlight();
        }
    }


});

// Gallery lightbox - standalone init
document.addEventListener('DOMContentLoaded', function () {
    (function () {
        const galleryButtons = document.querySelectorAll('.gallery-item button[data-image]');
        if (!galleryButtons.length) return;

        const lightbox = document.querySelector('.lightbox');
        if (!lightbox) return;

        const image = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');
        const counter = lightbox.querySelector('.lightbox-counter');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const closeBtn = lightbox.querySelector('.lightbox-close');

        let currentIndex = 0;
        const items = Array.from(galleryButtons);

        function showImage(index) {
            currentIndex = index;
            image.src = items[index].dataset.image;
            image.alt = items[index].dataset.caption || '';
            caption.textContent = items[index].dataset.caption || '';
            counter.textContent = `${index + 1} / ${items.length}`;
            prevBtn.style.display = index === 0 ? 'none' : '';
            nextBtn.style.display = index === items.length - 1 ? 'none' : '';
        }

        function open(index) {
            showImage(index);
            lightbox.setAttribute('aria-hidden', 'false');
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        items.forEach((btn, i) => btn.addEventListener('click', () => open(i)));
        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
        nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) close();
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft' && currentIndex > 0) showImage(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < items.length - 1) showImage(currentIndex + 1);
        });

        // Mobile swipe
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
        lightbox.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex > 0) showImage(currentIndex - 1);
                if (diff < 0 && currentIndex < items.length - 1) showImage(currentIndex + 1);
            }
        });
    })();
});


/* Hero underline width sync: keeps the SVG line under the h1 exactly as
   wide as the rendered headline text (Hard Rule D.6 / R2). Re-runs on
   DOMContentLoaded, window.load, resize and document.fonts.ready (the
   Inter webfont loads async and shifts h1 width a few ms after first
   paint). measureWidestLine() falls back to bounding-box width if Range
   measurement isn't supported. ResizeObserver catches anything that
   changes h1 size between the discrete events. */
(function syncHeroUnderlineSetup() {
    function measureWidestLine(el) {
        try {
            const range = document.createRange();
            range.selectNodeContents(el);
            const rects = range.getClientRects();
            if (!rects || !rects.length) return el.getBoundingClientRect().width;
            let max = 0;
            for (let i = 0; i < rects.length; i++) {
                if (rects[i].width > max) max = rects[i].width;
            }
            return max || el.getBoundingClientRect().width;
        } catch (e) {
            return el.getBoundingClientRect().width;
        }
    }

    function syncHeroUnderline() {
        const h1 = document.querySelector('.hero .hero-intro h1, .hero h1');
        if (!h1) return;
        const svg = h1.parentElement && h1.parentElement.querySelector('.hero-underline-svg');
        if (!svg) return;
        const w = Math.round(measureWidestLine(h1));
        if (!w) return;
        svg.style.width = w + 'px';
        svg.style.maxWidth = 'none';
        svg.style.minWidth = '0';
    }

    let resizeTimer;
    function debouncedSync() {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(syncHeroUnderline);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncHeroUnderline);
    } else {
        syncHeroUnderline();
    }
    window.addEventListener('load', syncHeroUnderline);
    window.addEventListener('resize', debouncedSync);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncHeroUnderline).catch(() => {});
    }

    if ('ResizeObserver' in window) {
        const tryAttach = function () {
            const h1 = document.querySelector('.hero .hero-intro h1, .hero h1');
            if (!h1) return;
            new ResizeObserver(debouncedSync).observe(h1);
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryAttach);
        } else {
            tryAttach();
        }
    }
})();

/* --------------------------------------------------------------------------
 * "Swoosh" scroll-reveal animation.
 * Adds a soft fade-up as each tagged section enters the
 * viewport, and a staggered cascade for grid children. Hero load is left to
 * the existing `heroFloatIn` CSS animation (style.css:1213); do NOT add
 * `.hero-content > *` to revealSelectors below: that would fight heroFloatIn.
 *
 * CSS contract: `.reveal` and `.reveal-stagger` start at opacity:0 +
 * translateY(28px/24px); `.in-view` released to opacity:1 + translateY(0).
 * See style.css `"Swoosh" scroll-reveal animation` block for the easing
 * (cubic-bezier(0.16, 1, 0.3, 1)) and the prefers-reduced-motion fallback.
 *
 * Plays once per element (`io.unobserve` after first reveal): scroll-up
 * never re-triggers, which is what stops this effect from feeling cheap.
 * ------------------------------------------------------------------------ */
(function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    // Single-element fade-up. Section containers, section titles, dark CTA
    // blocks, content anchors. Trade Grow's home page wraps its main sections
    // in <section class="...-section">: reviews-section, services-section,
    // booking-section, why-choose, faq-section. Inner pages add about-,
    // areas-, gallery-, project-, article- variants. Hero is intentionally
    // excluded (heroFloatIn at style.css:1213 owns it).
    var revealSelectors = [
        // section titles, anywhere
        '.section-title',
        // home + inner page section containers (top-level <section>)
        'section.reviews-section',
        'section.services-section',
        'section.booking-section',
        'section.why-choose',
        'section.faq-section',
        'section.areas-section',
        'section.about-section',
        'section.about-service-description',
        'section.service-detail-section',
        'section.our-work-section',
        'section.gallery-section',
        // about content blocks
        '.about-service-content',
        '.about-page-right-col',
        '.why-choose-content',
        // CTA blocks (any page)
        '.cta-banner',
        '.desktop-cta-banner',
        '.mid-article-cta',
        '.article-bottom-cta',
        // project detail anchors
        '.project-summary',
        '.project-meta',
        '.project-content-container',
        // blog article hero (separate from main hero so heroFloatIn rule doesn't apply)
        '.article-hero-content'
    ];

    // Staggered cascade. Grid wrappers whose direct children are the cards
    // we want to reveal one after another. The CSS stagger delays are 50ms
    // through 550ms over the first 7 children, then 550ms for the rest.
    var staggerSelectors = [
        '.services-grid',
        '.projects-listing-section .project-card-grid',
        '.projects-listing-section .projects-grid',
        '.reviews-grid',
        '.blog-card-grid',
        '.gallery-grid',
        '.faq-list',
        '.areas-grid',
        '.footer-areas',
        '.about-specs-secondary'
    ];

    revealSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) { el.classList.add('reveal'); });
    });
    staggerSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) { el.classList.add('reveal-stagger'); });
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' }); // threshold 0 (not 0.12): a % threshold blanks very TALL reveal targets (e.g. long finance pages) until hundreds of px scroll in — see becketts fix 2026-08-03

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
        io.observe(el);
    });
})();
