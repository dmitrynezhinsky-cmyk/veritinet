const nav = document.querySelector('.nav');
const menuToggle = document.getElementById('menu-toggle');
const drawer = document.getElementById('drawer');

function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    nav?.classList.remove('open');
    document.body.style.overflow = '';
}

function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    nav?.classList.add('open');
    document.body.style.overflow = 'hidden';
}

menuToggle?.addEventListener('click', () => {
    if (drawer?.classList.contains('open')) closeDrawer();
    else openDrawer();
});

drawer?.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
});

drawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
});

/* Nav scroll state */
window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObs.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('visible'));
}

/* Hero particle network — light theme */
const hero = document.getElementById('hero');
const canvas = document.getElementById('hero-canvas');

if (hero && canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let pts = [];
    let w = 0;
    let h = 0;

    function resize() {
        const rect = hero.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
        const count = Math.min(55, Math.floor((w * h) / 18000));
        pts = [];
        for (let i = 0; i < count; i++) {
            pts.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.4 + 0.6,
            });
        }
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            for (let j = i + 1; j < pts.length; j++) {
                const q = pts[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(24, 95, 165, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(24, 95, 165, 0.35)';
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    draw();
}

// ===== ОТПРАВКА ФОРМЫ =====
(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('form-submit');
    const statusEl = document.getElementById('form-status');
    if (!submitBtn || !statusEl) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        form.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
        statusEl.textContent = '';
        statusEl.className = 'form-status';

        const formData = new FormData(form);

        if (formData.get('website')?.trim()) {
            statusEl.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
            statusEl.className = 'form-status success';
            form.reset();
            return;
        }

        const data = {
            name: formData.get('name')?.trim() || '',
            company: formData.get('company')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            phone: formData.get('phone')?.trim() || '',
            message: formData.get('message')?.trim() || '',
            consent: formData.get('consent') === 'on'
        };

        let hasError = false;

        if (!data.name || data.name.length < 2) {
            document.getElementById('form-name')?.closest('.form-group')?.classList.add('error');
            hasError = true;
        }

        if (!data.company || data.company.length < 2) {
            document.getElementById('form-company')?.closest('.form-group')?.classList.add('error');
            hasError = true;
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            document.getElementById('form-email')?.closest('.form-group')?.classList.add('error');
            hasError = true;
        }

        if (!data.consent) {
            statusEl.textContent = 'Пожалуйста, дайте согласие на обработку данных';
            statusEl.className = 'form-status error';
            hasError = true;
        }

        if (hasError) {
            if (!statusEl.textContent) {
                statusEl.textContent = 'Заполните все обязательные поля';
                statusEl.className = 'form-status error';
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');

        try {
            const response = await fetch('https://empty-union-45ce.dmitry-nezhinsky.workers.dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                statusEl.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
                statusEl.className = 'form-status success';
                form.reset();
            } else {
                throw new Error(result.error || 'Ошибка отправки');
            }
        } catch (err) {
            console.error('Ошибка формы:', err);
            statusEl.textContent = 'Не удалось отправить заявку. Пожалуйста, попробуйте позже или напишите нам на почту.';
            statusEl.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
        }
    });
})();