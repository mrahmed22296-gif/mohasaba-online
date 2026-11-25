/* محاسبة أون لاين — سلوك مشترك: القائمة، الوضع الداكن، شريط القراءة، زر الصعود */
(function () {
    'use strict';

    function store(key, val) {
        try {
            if (val === undefined) return localStorage.getItem(key);
            localStorage.setItem(key, val);
        } catch (e) { return null; }
    }

    var root = document.documentElement;

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(t) {
        root.setAttribute('data-theme', t);
        var b = document.getElementById('themeToggle');
        if (b) {
            b.textContent = t === 'dark' ? '☀️' : '🌙';
            b.setAttribute('aria-label', t === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var inner = document.querySelector('.topbar-inner');
        var menu = document.getElementById('mainMenu');

        if (inner) {
            var actions = document.createElement('div');
            actions.className = 'tb-actions';

            var theme = document.createElement('button');
            theme.type = 'button';
            theme.id = 'themeToggle';
            theme.className = 'icon-btn';
            theme.addEventListener('click', function () {
                var next = currentTheme() === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                store('theme', next);
            });
            actions.appendChild(theme);

            var burger = document.createElement('button');
            burger.type = 'button';
            burger.className = 'icon-btn menu-toggle';
            burger.setAttribute('aria-label', 'فتح القائمة');
            burger.setAttribute('aria-expanded', 'false');
            burger.textContent = '☰';
            burger.addEventListener('click', function () {
                var open = menu.classList.toggle('open');
                burger.setAttribute('aria-expanded', open ? 'true' : 'false');
                burger.textContent = open ? '✕' : '☰';
            });
            actions.appendChild(burger);

            inner.appendChild(actions);
        }

        var saved = store('theme');
        if (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) saved = 'dark';
        applyTheme(saved === 'dark' ? 'dark' : 'light');

        // شريط تقدم القراءة
        var bar = document.createElement('div');
        bar.className = 'read-progress';
        document.body.appendChild(bar);

        // زر العودة للأعلى
        var top = document.createElement('button');
        top.type = 'button';
        top.className = 'to-top';
        top.setAttribute('aria-label', 'العودة إلى أعلى الصفحة');
        top.textContent = '↑';
        top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
        document.body.appendChild(top);

        function onScroll() {
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
            top.classList.toggle('show', h.scrollTop > 600);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    });
})();

/* ===== بطاقة التواصل الموحدة + زر الواتساب العائم (مثل موقع مولد القوائم المالية) ===== */
(function () {
    'use strict';

    var WA_LINK = 'https://wa.me/96560085043?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3.%20%D8%A3%D8%AD%D9%85%D8%AF%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D9%85%D8%A7%D9%84%D9%8A%D8%A9';

    function contactItem(href, icon, label, value, dir) {
        return '<a href="' + href + '"' + (href.indexOf('http') === 0 ? ' target="_blank" rel="noreferrer"' : '') +
            ' style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid #dbeafe;background:#f8fafc;text-decoration:none;color:#0c2942;margin-top:10px;">' +
            '<span style="font-size:22px;">' + icon + '</span>' +
            '<span><span style="display:block;font-size:12px;color:#5b7285;">' + label + '</span>' +
            '<span style="display:block;font-size:14px;font-weight:700;" dir="' + (dir || 'ltr') + '">' + value + '</span></span></a>';
    }

    function addFooterCard() {
        var footer = document.querySelector('footer');
        if (!footer || document.getElementById('devContactCard')) return;
        var oldCopy = footer.querySelectorAll('p');
        oldCopy.forEach(function (p) { if (p.textContent.indexOf('جميع الحقوق محفوظة') !== -1) p.remove(); });
        var card = document.createElement('div');
        card.id = 'devContactCard';
        card.setAttribute('style', 'max-width:430px;margin:24px auto 0;background:#0d1226;border-radius:24px;padding:28px 20px;text-align:center;color:#fff;box-shadow:0 16px 40px rgba(12,41,66,0.25);');
        card.innerHTML =
            '<div style="font-size:20px;font-weight:900;">أ. أحمد عبدالكريم</div>' +
            '<div dir="ltr" style="margin-top:12px;font-size:14px;color:#cbd5e1;">✉️ <a href="mailto:mr.ahmed22296@gmail.com" style="color:#cbd5e1;text-decoration:none;">mr.ahmed22296@gmail.com</a></div>' +
            '<div dir="ltr" style="margin-top:8px;font-size:14px;color:#cbd5e1;">📱 <a href="tel:+96560085043" style="color:#cbd5e1;text-decoration:none;">60085043</a> / <a href="tel:+201201487209" style="color:#cbd5e1;text-decoration:none;">01201487209</a></div>' +
            '<div style="margin-top:14px;font-size:12px;color:#94a3b8;">© 2026 جميع الحقوق محفوظة — محاسبة أون لاين</div>';
        footer.appendChild(card);
    }

    function addWhatsAppWidget() {
        if (document.getElementById('cwFloatBtn')) return;
        var wrap = document.createElement('div');
        wrap.setAttribute('style', 'position:fixed;bottom:30px;left:30px;z-index:9999;');
        wrap.innerHTML = '<button type="button" id="cwFloatBtn" aria-label="تواصل معنا" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;box-shadow:0 8px 24px rgba(37,211,102,.45);cursor:pointer;font-size:30px;display:flex;align-items:center;justify-content:center;">💬</button>';

        var popup = document.createElement('div');
        popup.id = 'cwPopup';
        popup.setAttribute('style', 'display:none;position:fixed;inset:0;background:rgba(13,18,38,.6);backdrop-filter:blur(4px);z-index:99999;align-items:center;justify-content:center;padding:16px;');
        popup.innerHTML =
            '<div style="width:100%;max-width:380px;background:#fff;border-radius:24px;padding:24px;border:1px solid #dbeafe;position:relative;">' +
            '<button type="button" id="cwCloseBtn" aria-label="إغلاق" style="position:absolute;top:14px;left:14px;background:none;border:none;font-size:16px;cursor:pointer;color:#5b7285;">✕</button>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#0c2942;">📞 تواصل معنا</h3>' +
            '<p style="margin:6px 0 8px;font-size:12px;color:#5b7285;">أهلاً بك! يمكنك التواصل معنا عبر أي من القنوات التالية:</p>' +
            contactItem(WA_LINK, '💬', 'واتساب', '+965 60085043') +
            contactItem('tel:+96560085043', '📱', 'اتصال', '+965 60085043') +
            contactItem('mailto:mr.ahmed22296@gmail.com', '✉️', 'البريد الإلكتروني', 'mr.ahmed22296@gmail.com') +
            contactItem('tel:+201201487209', '📞', 'اتصال (مصر)', '+20 1201487209') +
            '</div>';

        document.body.appendChild(wrap);
        document.body.appendChild(popup);
        document.getElementById('cwFloatBtn').addEventListener('click', function () { popup.style.display = 'flex'; });
        document.getElementById('cwCloseBtn').addEventListener('click', function () { popup.style.display = 'none'; });
        popup.addEventListener('click', function (e) { if (e.target === popup) popup.style.display = 'none'; });
    }

    document.addEventListener('DOMContentLoaded', function () {
        addFooterCard();
        addWhatsAppWidget();
    });
})();
