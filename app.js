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
