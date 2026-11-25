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



/* ===== تسجيل الدخول والاشتراك (Firebase) — مثل موقع مسار ===== */
(function () {
    'use strict';
    if (window.__mohAuthLoaded) return;
    window.__mohAuthLoaded = true;

    var SITE_ID = 'mohasaba-online';
    var FREE_USES = 1;
    var WA_NUMBER = '96560085043';
    var QR_URL = 'https://i.ibb.co/1GvzKs8r/Whats-App-Image-2026-08-06-at-4-44-31-PM-1.jpg';
    var VALID_CODES = [
        'MOHASABA-2026-A1B2', 'MOHASABA-2026-C3D4', 'MOHASABA-2026-E5F6',
        'MOHASABA-2026-G7H8', 'MOHASABA-2026-I9J0',
        'WAMD-1001', 'WAMD-1002', 'WAMD-1003', 'WAMD-1004', 'WAMD-1005'
    ];
    var FIREBASE_CONFIG = {
        apiKey: 'AIzaSyCnsQtY9PdymuKG5suBX1psYgdkCHFFYKs',
        authDomain: 'jobsautosearch.firebaseapp.com',
        projectId: 'jobsautosearch',
        storageBucket: 'jobsautosearch.firebasestorage.app',
        messagingSenderId: '810040080530',
        appId: '1:810040080530:web:468f87f88571a510980e4b'
    };
    var COUNTED_ACTIONS = /(solveEquation|drCrHelper|calculateSchedule|buildEntry|resetQuiz)/;

    function store(key, val) {
        try {
            if (val === undefined) return localStorage.getItem(key);
            localStorage.setItem(key, val);
        } catch (e) { return null; }
    }
    function subKey(uid) { return 'moh_subscribed_' + uid; }
    function countKey(uid) { return 'moh_use_count_' + uid; }
    function phoneSkipKey(uid) { return 'moh_phone_skip_' + uid; }

    var currentUser = null;
    var subscribed = false;
    var useCount = 0;

    /* ---------- التنسيقات ---------- */
    var css = ''
        + '.moh-auth-overlay{position:fixed;inset:0;z-index:999990;background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(14,165,233,.12),transparent),#f0f9ff;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Tajawal,sans-serif;overflow-y:auto}'
        + '.moh-auth-card{width:100%;max-width:430px;background:#fff;border:1px solid #dbeafe;border-radius:28px;padding:28px;box-shadow:0 24px 60px rgba(12,41,66,.12);text-align:center;box-sizing:border-box}'
        + '.moh-auth-logo{width:56px;height:56px;margin:0 auto 12px;background:#0c2942;color:#fff;border-radius:16px;display:grid;place-items:center;font-size:24px;font-weight:900}'
        + '.moh-auth-sub{color:#0369a1;font-size:12px;font-weight:700;margin:0}'
        + '.moh-auth-title{font-size:24px;font-weight:900;margin:8px 0 12px;color:#0c2942}'
        + '.moh-auth-desc{font-size:14px;color:#5b7285;line-height:1.9;margin:0 0 24px}'
        + '.moh-btn{width:100%;min-height:48px;border-radius:14px;border:1px solid #dbeafe;background:#fff;color:#374151;font-weight:700;font-size:14px;display:flex;justify-content:center;align-items:center;gap:12px;cursor:pointer;font-family:inherit;box-sizing:border-box}'
        + '.moh-btn:disabled{opacity:.6;cursor:default}'
        + '.moh-btn-dark{background:#0c2942;color:#fff;border:none}'
        + '.moh-btn-wa{background:#25D366;color:#fff;border:none}'
        + '.moh-g-dot{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#ef4444 50%,#facc15)}'
        + '.moh-auth-note{margin-top:16px;font-size:12px;line-height:1.8;color:#5b7285}'
        + '.moh-auth-privacy{margin-top:8px;font-size:11px;line-height:1.8;color:#94a3b8}'
        + '.moh-auth-err{margin-top:12px;font-size:12px;color:#dc2626;font-weight:700}'
        + '.moh-pay-qrbox{background:#f0f9ff;border-radius:16px;padding:16px;border:1px solid #dbeafe}'
        + '.moh-pay-qrbox img{width:200px;max-width:100%;margin:12px auto;display:block;border-radius:12px;border:1px solid #dbeafe}'
        + '.moh-pay-steps{margin-top:16px;text-align:right;background:#ffedd5;border:1px solid #fdba74;border-radius:12px;padding:12px;font-size:11px;line-height:1.9;color:#9a3412}'
        + '.moh-input{width:100%;text-align:center;border:1px solid #dbeafe;border-radius:12px;padding:12px 16px;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box;margin-top:12px}'
        + '.moh-link-btn{margin-top:12px;background:none;border:none;font-size:12px;color:#5b7285;text-decoration:underline;cursor:pointer;font-family:inherit}'
        + '.moh-modal{position:fixed;inset:0;background:rgba(13,18,38,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:999991;font-family:Tajawal,sans-serif;overflow-y:auto}'
        + '.moh-user-chip{position:fixed;bottom:18px;right:18px;z-index:99900;background:#0d1226;color:#e8ecf8;border-radius:999px;padding:8px 14px;display:flex;align-items:center;gap:10px;font-family:Tajawal,sans-serif;font-size:13px;box-shadow:0 8px 24px rgba(13,18,38,.35)}'
        + '.moh-user-chip button{background:none;border:1px solid rgba(255,255,255,.25);color:#e8ecf8;border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:inherit}'
        + '.moh-code-msg{margin-top:12px;font-size:12px;font-weight:700}';
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ---------- شاشة الدخول ---------- */
    var gateEl = document.createElement('div');
    gateEl.className = 'moh-auth-overlay';
    gateEl.setAttribute('dir', 'rtl');
    gateEl.innerHTML = ''
        + '<div class="moh-auth-card">'
        + '<div class="moh-auth-logo">ح</div>'
        + '<p class="moh-auth-sub">منصة تعليمية عربية متكاملة لتبسيط المحاسبة المالية</p>'
        + '<h1 class="moh-auth-title">محاسبة أون لاين</h1>'
        + '<p class="moh-auth-desc">شجرة الحسابات، قيود اليومية، حاسبة الإهلاك، المصطلحات والاختبارات — كل ما تحتاجه لتعلّم المحاسبة في مكان واحد.</p>'
        + '<button type="button" class="moh-btn" id="mohLoginBtn"><span class="moh-g-dot"></span>تسجيل الدخول بواسطة Google</button>'
        + '<p class="moh-auth-note">تسجّل الدخول أولاً، ثم تتوفر لك محاولة مجانية قبل الاشتراك.</p>'
        + '<p class="moh-auth-privacy">بتسجيل الدخول توافق على حفظ بياناتك الأساسية (الاسم والإيميل ورقم الهاتف إن أدخلته) لدى مالك الموقع لغرض إدارة الاشتراك والتواصل.</p>'
        + '<p class="moh-auth-err" id="mohLoginErr" style="display:none"></p>'
        + '</div>';
    document.body.appendChild(gateEl);
    document.documentElement.style.overflow = 'hidden';

    function showLoginError(msg) {
        var el = document.getElementById('mohLoginErr');
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    /* ---------- نافذة الهاتف ---------- */
    function openPhoneModal() {
        if (document.getElementById('mohPhoneModal')) return;
        var m = document.createElement('div');
        m.className = 'moh-modal';
        m.id = 'mohPhoneModal';
        m.setAttribute('dir', 'rtl');
        m.innerHTML = ''
            + '<div class="moh-auth-card">'
            + '<h2 style="font-size:18px;font-weight:900;margin:0 0 8px;color:#0c2942">رقم هاتفك (اختياري)</h2>'
            + '<p class="moh-auth-desc" style="margin-bottom:16px">يُستخدم فقط للتواصل معك بخصوص تفعيل الاشتراك.</p>'
            + '<input type="tel" id="mohPhoneInput" class="moh-input" style="margin-top:0" placeholder="مثال: 60085043">'
            + '<button type="button" class="moh-btn moh-btn-dark" id="mohPhoneSave" style="margin-top:12px">حفظ</button>'
            + '<button type="button" class="moh-link-btn" id="mohPhoneSkip">تخطي الآن</button>'
            + '</div>';
        document.body.appendChild(m);
        document.getElementById('mohPhoneSave').addEventListener('click', function () {
            var v = (document.getElementById('mohPhoneInput').value || '').trim();
            if (v && currentUser) {
                try {
                    firebase.firestore().collection('users').doc(currentUser.uid)
                        .set({ phone: v }, { merge: true }).catch(function () {});
                } catch (e) {}
            }
            if (currentUser) store(phoneSkipKey(currentUser.uid), '1');
            m.remove();
        });
        document.getElementById('mohPhoneSkip').addEventListener('click', function () {
            if (currentUser) store(phoneSkipKey(currentUser.uid), '1');
            m.remove();
        });
    }

    /* ---------- نافذة الاشتراك ---------- */
    function openPaywall() {
        if (document.getElementById('mohPayModal')) return;
        var name = currentUser && currentUser.displayName ? currentUser.displayName : '';
        var email = currentUser && currentUser.email ? currentUser.email : '';
        var waText = encodeURIComponent('السلام عليكم،\nأريد تفعيل الاشتراك في محاسبة أون لاين.\nالمبلغ: 1 دينار\nالاسم: ' + name + '\nالإيميل: ' + email + '\n\nمرفق إيصال الدفع عبر ومض.');
        var m = document.createElement('div');
        m.className = 'moh-modal';
        m.id = 'mohPayModal';
        m.setAttribute('dir', 'rtl');
        m.innerHTML = ''
            + '<div class="moh-auth-card" style="max-height:92vh;overflow-y:auto">'
            + '<div class="moh-auth-logo" style="background:#f97316;font-size:20px">د</div>'
            + '<p class="moh-auth-sub">اشتراك محاسبة أون لاين</p>'
            + '<h2 style="font-size:20px;font-weight:900;margin:8px 0;color:#0c2942">انتهت المحاولة المجانية</h2>'
            + '<p class="moh-auth-desc" style="margin-bottom:16px">اشترك مقابل <strong style="color:#f97316">1 دينار فقط</strong> لاستخدام كل الأدوات بلا حدود.</p>'
            + '<div class="moh-pay-qrbox">'
            + '<p style="margin:0;font-size:12px;font-weight:700;color:#0c2942">الدفع عبر ومض (WAMD)</p>'
            + '<img src="' + QR_URL + '" alt="رمز QR للدفع عبر ومض">'
            + '<p style="margin:0;font-size:11px;line-height:1.8;color:#5b7285">امسح رمز QR من تطبيق التمويل أون لاين أو أي تطبيق يدعم ومض.</p>'
            + '</div>'
            + '<div class="moh-pay-steps"><strong>خطوات التفعيل:</strong><br>1. ادفع 1 دينار عبر ومض.<br>2. خذ صورة للإيصال وأرسلها عبر واتساب.<br>3. ستصلك رسالة بكود التفعيل.</div>'
            + '<a class="moh-btn moh-btn-wa" style="margin-top:16px;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/' + WA_NUMBER + '?text=' + waText + '">إرسال إيصال الدفع على واتساب</a>'
            + '<div style="margin-top:20px;padding-top:20px;border-top:1px solid #dbeafe">'
            + '<p style="margin:0;font-size:12px;font-weight:700;color:#0c2942">لديك كود تفعيل؟</p>'
            + '<input type="text" id="mohCodeInput" class="moh-input" placeholder="أدخل كود التفعيل" style="text-transform:uppercase">'
            + '<button type="button" class="moh-btn moh-btn-dark" id="mohCodeBtn" style="margin-top:8px">تفعيل الاشتراك</button>'
            + '<p class="moh-code-msg" id="mohCodeMsg" style="display:none"></p>'
            + '</div>'
            + '<button type="button" class="moh-link-btn" id="mohPayClose">العودة لاحقاً</button>'
            + '</div>';
        document.body.appendChild(m);
        document.getElementById('mohPayClose').addEventListener('click', function () { m.remove(); });
        document.getElementById('mohCodeBtn').addEventListener('click', function () {
            var msg = document.getElementById('mohCodeMsg');
            var val = (document.getElementById('mohCodeInput').value || '').trim().toUpperCase();
            msg.style.display = 'block';
            if (!val) { msg.style.color = '#dc2626'; msg.textContent = 'أدخل كود التفعيل أولاً.'; return; }
            if (VALID_CODES.indexOf(val) === -1) { msg.style.color = '#dc2626'; msg.textContent = 'الكود غير صحيح. تأكد من الكود وأعد المحاولة.'; return; }
            store(subKey(currentUser.uid), 'true');
            subscribed = true;
            try {
                firebase.firestore().collection('users').doc(currentUser.uid)
                    .set({ subscriptions: firebase.firestore.FieldValue.arrayUnion(SITE_ID) }, { merge: true }).catch(function () {});
            } catch (e) {}
            msg.style.color = '#15803d';
            msg.textContent = 'تم تفعيل الاشتراك بنجاح.';
            setTimeout(function () { m.remove(); }, 1500);
        });
    }

    /* ---------- عدّاد الاستخدام المجاني ---------- */
    function tryConsume() {
        if (!currentUser || subscribed) return true;
        var current = Number(store(countKey(currentUser.uid)) || 0);
        if (current < FREE_USES) {
            store(countKey(currentUser.uid), String(current + 1));
            useCount = current + 1;
            return true;
        }
        return false;
    }

    document.addEventListener('click', function (e) {
        if (!currentUser || subscribed) return;
        var el = e.target && e.target.closest ? e.target.closest('[onclick]') : null;
        if (!el) return;
        var handler = el.getAttribute('onclick') || '';
        if (!COUNTED_ACTIONS.test(handler)) return;
        if (!tryConsume()) {
            e.preventDefault();
            e.stopPropagation();
            openPaywall();
        }
    }, true);

    /* ---------- شارة المستخدم ---------- */
    function addUserChip() {
        if (document.getElementById('mohUserChip')) return;
        var chip = document.createElement('div');
        chip.className = 'moh-user-chip';
        chip.id = 'mohUserChip';
        var first = (currentUser.displayName || currentUser.email || 'مستخدم').split(' ')[0];
        chip.innerHTML = '<span>' + first + '</span><button type="button" id="mohSignOut">خروج</button>';
        document.body.appendChild(chip);
        document.getElementById('mohSignOut').addEventListener('click', function () {
            firebase.auth().signOut().finally(function () { location.reload(); });
        });
    }

    /* ---------- حفظ بيانات الزائر ---------- */
    function saveVisitor(u) {
        try {
            var ref = firebase.firestore().collection('users').doc(u.uid);
            ref.get().then(function (snap) {
                var base = { email: u.email || '', name: u.displayName || '', sites: firebase.firestore.FieldValue.arrayUnion(SITE_ID) };
                if (!snap.exists) {
                    base.phone = '';
                    base.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    if (!store(phoneSkipKey(u.uid))) openPhoneModal();
                } else {
                    base.lastSeenAt = firebase.firestore.FieldValue.serverTimestamp();
                    var data = snap.data() || {};
                    if (!data.phone && !store(phoneSkipKey(u.uid))) openPhoneModal();
                }
                ref.set(base, { merge: true }).catch(function () {});
            }).catch(function () {
                if (!store(phoneSkipKey(u.uid))) openPhoneModal();
            });
        } catch (e) {
            if (!store(phoneSkipKey(u.uid))) openPhoneModal();
        }
    }

    /* ---------- تحميل Firebase ---------- */
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    var V = '10.12.2';
    loadScript('https://www.gstatic.com/firebasejs/' + V + '/firebase-app-compat.js')
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + V + '/firebase-auth-compat.js'); })
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + V + '/firebase-firestore-compat.js'); })
        .then(function () {
            firebase.initializeApp(FIREBASE_CONFIG);
            var auth = firebase.auth();
            auth.getRedirectResult().catch(function () {});

            document.getElementById('mohLoginBtn').addEventListener('click', function () {
                var provider = new firebase.auth.GoogleAuthProvider();
                var btn = document.getElementById('mohLoginBtn');
                btn.disabled = true;
                auth.signInWithPopup(provider).catch(function (error) {
                    btn.disabled = false;
                    if (error && error.code === 'auth/popup-blocked') {
                        auth.signInWithRedirect(provider).catch(function () {
                            showLoginError('تعذر فتح صفحة تسجيل الدخول. جرّب متصفحاً آخر.');
                        });
                    } else if (error && error.code === 'auth/unauthorized-domain') {
                        showLoginError('هذا الرابط غير مفعّل بعد لتسجيل الدخول. جاري تفعيله.');
                    } else if (error && error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                        showLoginError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
                    }
                });
            });

            auth.onAuthStateChanged(function (u) {
                currentUser = u;
                if (!u) {
                    gateEl.style.display = 'flex';
                    document.documentElement.style.overflow = 'hidden';
                    return;
                }
                subscribed = store(subKey(u.uid)) === 'true';
                useCount = Number(store(countKey(u.uid)) || 0);
                gateEl.style.display = 'none';
                document.documentElement.style.overflow = '';
                addUserChip();
                saveVisitor(u);
            });
        })
        .catch(function () {
            showLoginError('تعذر تحميل خدمة تسجيل الدخول. تحقق من الاتصال ثم أعد تحميل الصفحة.');
            var btn = document.getElementById('mohLoginBtn');
            if (btn) {
                btn.textContent = 'إعادة المحاولة';
                btn.disabled = false;
                btn.addEventListener('click', function () { location.reload(); });
            }
        });
})();
