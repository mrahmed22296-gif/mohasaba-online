/* ===== Theme Toggle ===== */
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ===== Mobile Menu ===== */
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  menuBtn?.addEventListener('click', () => navLinks?.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navLinks?.classList.contains('open')) {
      navLinks.classList.remove('open');
    }
  });

  /* ===== Fade-in Animation ===== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in, .feature-card, .term-card, .book-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  /* ===== Glossary: Search + Filter ===== */
  const searchInput = document.getElementById('searchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const termsGrid = document.getElementById('termsGrid');
  const resultsCount = document.getElementById('resultsCount');
  let currentFilter = 'all';

  if (termsGrid && typeof TERMS_DATA !== 'undefined') {
    const renderTerms = () => {
      const term = (searchInput?.value || '').toLowerCase().trim();
      const filtered = TERMS_DATA.filter(t => {
        const matchSearch = !term ||
          t.arabic.toLowerCase().includes(term) ||
          t.english.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term);
        const matchFilter = currentFilter === 'all' || t.category === currentFilter;
        return matchSearch && matchFilter;
      });

      termsGrid.innerHTML = filtered.map(t => `
        <article class="term-card">
          <div class="term-number">${t.id}</div>
          <h3 class="term-arabic">${highlight(t.arabic, term)}</h3>
          <div class="term-english">${t.english}</div>
          <span class="term-category">${t.category}</span>
          <p class="term-description">${highlight(t.description, term)}</p>
        </article>
      `).join('') || `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">لا توجد نتائج مطابقة</div>`;

      if (resultsCount) resultsCount.textContent = `عدد المصطلحات الظاهرة: ${filtered.length}`;
    };

    const highlight = (text, term) => {
      if (!term) return text;
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark style="background:#FEF3C7;padding:0 2px;border-radius:3px">$1</mark>');
    };

    searchInput?.addEventListener('input', renderTerms);
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTerms();
      });
    });

    renderTerms();
  }

  /* ===== Depreciation Calculator ===== */
  const calcBtn = document.getElementById('calcDepreciation');
  const resetBtn = document.getElementById('resetDepreciation');
  const calcResult = document.getElementById('depreciationResult');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const cost = parseFloat(document.getElementById('assetCost').value);
      const salvage = parseFloat(document.getElementById('salvageValue').value);
      const life = parseFloat(document.getElementById('usefulLife').value);

      if (isNaN(cost) || isNaN(salvage) || isNaN(life) || cost <= 0 || life <= 0 || salvage < 0 || salvage >= cost) {
        alert('الرجاء إدخال قيم صحيحة (التكلفة > القيمة التخريدية ≥ 0، والعمر > 0)');
        return;
      }

      const annual = (cost - salvage) / life;
      let html = `
        <div class="result-grid">
          <div class="result-item">
            <div class="result-label">قسط الإهلاك السنوي</div>
            <div class="result-value">${annual.toLocaleString('ar-EG', {maximumFractionDigits: 2})}</div>
          </div>
          <div class="result-item">
            <div class="result-label">القسط الشهري</div>
            <div class="result-value">${(annual/12).toLocaleString('ar-EG', {maximumFractionDigits: 2})}</div>
          </div>
          <div class="result-item">
            <div class="result-label">إجمالي الإهلاك</div>
            <div class="result-value">${(cost - salvage).toLocaleString('ar-EG')}</div>
          </div>
        </div>
        <h4 style="margin:1rem 0 0.75rem;color:var(--primary-700)">📊 جدول الإهلاك السنوي</h4>
        <div class="table-wrapper">
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>السنة</th>
                  <th>قسط السنة</th>
                  <th>مجمع الإهلاك</th>
                  <th>القيمة الدفترية</th>
                </tr>
              </thead>
              <tbody>`;

      let accumulated = 0;
      for (let y = 1; y <= life; y++) {
        accumulated += annual;
        const bookValue = cost - accumulated;
        html += `
          <tr>
            <td><strong>${y}</strong></td>
            <td class="debit">${annual.toLocaleString('ar-EG', {maximumFractionDigits: 2})}</td>
            <td>${accumulated.toLocaleString('ar-EG', {maximumFractionDigits: 2})}</td>
            <td><strong>${bookValue.toLocaleString('ar-EG', {maximumFractionDigits: 2})}</strong></td>
          </tr>`;
      }

      html += `</tbody></table></div></div>`;
      calcResult.innerHTML = html;
      calcResult.style.display = 'block';
    });

    resetBtn?.addEventListener('click', () => {
      document.getElementById('assetCost').value = '';
      document.getElementById('salvageValue').value = '';
      document.getElementById('usefulLife').value = '';
      calcResult.style.display = 'none';
      calcResult.innerHTML = '';
    });
  }

  /* ===== Journal Entries Generator ===== */
  const genBtn = document.getElementById('generateEntry');
  const genResult = document.getElementById('entryResult');

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const type = document.getElementById('entryType').value;
      const amount = parseFloat(document.getElementById('entryAmount').value);

      if (!amount || amount <= 0) {
        alert('الرجاء إدخال مبلغ صحيح');
        return;
      }

      const vat = amount * 0.15;
      const total = amount + vat;
      let rows = [];
      let description = '';

      switch(type) {
        case 'cash_sale':
          description = `مبيعات نقدية شاملة ضريبة القيمة المضافة 15%`;
          rows = [
            { acc: 'من حـ / الصندوق', debit: total, credit: null, desc: description },
            { acc: 'إلى حـ / إيرادات المبيعات', debit: null, credit: amount, desc: description },
            { acc: 'إلى حـ / ضريبة القيمة المضافة المستحقة', debit: null, credit: vat, desc: description }
          ];
          break;
        case 'credit_sale':
          description = `مبيعات آجلة للعملاء شاملة ضريبة القيمة المضافة 15%`;
          rows = [
            { acc: 'من حـ / العملاء (الذمم المدينة)', debit: total, credit: null, desc: description },
            { acc: 'إلى حـ / إيرادات المبيعات', debit: null, credit: amount, desc: description },
            { acc: 'إلى حـ / ضريبة القيمة المضافة المستحقة', debit: null, credit: vat, desc: description }
          ];
          break;
        case 'cash_purchase':
          description = `شراء بضاعة للمخزون نقداً`;
          rows = [
            { acc: 'من حـ / مخزون البضاعة', debit: amount, credit: null, desc: description },
            { acc: 'إلى حـ / الصندوق', debit: null, credit: amount, desc: description }
          ];
          break;
        case 'collect_customer':
          description = `تحصيل مستحقات من عميل بشيك بنكي`;
          rows = [
            { acc: 'من حـ / البنك', debit: amount, credit: null, desc: description },
            { acc: 'إلى حـ / العملاء (الذمم المدينة)', debit: null, credit: amount, desc: description }
          ];
          break;
        case 'pay_supplier':
          description = `سداد مستحقات لمورد من البنك`;
          rows = [
            { acc: 'من حـ / الموردين (الذمم الدائنة)', debit: amount, credit: null, desc: description },
            { acc: 'إلى حـ / البنك', debit: null, credit: amount, desc: description }
          ];
          break;
        case 'pay_rent':
          description = `دفع إيجار مقر الشركة نقداً`;
          rows = [
            { acc: 'من حـ / مصروف الإيجار', debit: amount, credit: null, desc: description },
            { acc: 'إلى حـ / الصندوق', debit: null, credit: amount, desc: description }
          ];
          break;
      }

      const fmt = n => n.toLocaleString('ar-EG', {maximumFractionDigits: 2});
      let html = `
        <h4 style="margin-bottom:1rem;color:var(--primary-700)">📝 القيد المحاسبي المُولَّد</h4>
        <div class="table-wrapper">
          <div class="table-scroll">
            <table class="entry-table">
              <thead>
                <tr>
                  <th style="width:100px">مدين</th>
                  <th style="width:100px">دائن</th>
                  <th>اسم الحساب</th>
                  <th>البيان</th>
                </tr>
              </thead>
              <tbody>`;

      rows.forEach(r => {
        html += `
          <tr>
            <td class="debit">${r.debit ? fmt(r.debit) : '-'}</td>
            <td class="credit">${r.credit ? fmt(r.credit) : '-'}</td>
            <td><strong>${r.acc}</strong></td>
            <td>${r.desc}</td>
          </tr>`;
      });

      html += `</tbody></table></div></div>`;
      genResult.innerHTML = html;
      genResult.style.display = 'block';
    });
  }
});

/* ===== Glossary Terms Data ===== */
const TERMS_DATA = [
  { id: 1, arabic: 'الأصول (الموجودات)', english: 'Assets', category: 'المحاسبة والقوائم', description: 'الموارد التي تملكها الشركة وتدر نفعاً مستقبلياً مثل النقدية، المخزون، السيارات، والمباني.' },
  { id: 2, arabic: 'الأصول المتداولة', english: 'Current Assets', category: 'المحاسبة والقوائم', description: 'الأصول التي يُتوقع تحويلها لنقد أو استهلاكها خلال سنة أو دورة تشغيلية واحدة مثل الصندوق والبنك والعملاء والمخزون.' },
  { id: 3, arabic: 'الأصول غير المتداولة (الثابتة)', english: 'Non-Current / Fixed Assets', category: 'المحاسبة والقوائم', description: 'أصول طويلة الأجل تُقتنى للاستخدام في النشاط لأكثر من سنة كالأراضي والمباني والآلات والسيارات.' },
  { id: 4, arabic: 'الالتزامات (الخصوم)', english: 'Liabilities', category: 'المحاسبة والقوائم', description: 'الديون والالتزامات المالية المستحقة على الشركة للغير نتيجة أحداث سابقة مثل الموردين والقروض.' },
  { id: 5, arabic: 'الالتزامات المتداولة', english: 'Current Liabilities', category: 'المحاسبة والقوائم', description: 'التزامات قصيرة الأجل يُتوقع سدادها خلال سنة واحدة مثل حسابات الموردين والرواتب المستحقة والضرائب المستحقة.' },
  { id: 6, arabic: 'الالتزامات طويلة الأجل', english: 'Non-Current Liabilities', category: 'المحاسبة والقوائم', description: 'التزامات يستحق سدادها بعد أكثر من سنة مثل القروض البنكية طويلة الأجل أو السندات.' },
  { id: 7, arabic: 'حقوق الملكية', english: "Owner's / Shareholders' Equity", category: 'المحاسبة والقوائم', description: 'صافي حق أصحاب المشروع في أصول المنشأة بعد خصم جميع الالتزامات (رأس المال + الأرباح المحتجزة - المسحوبات).' },
  { id: 8, arabic: 'رأس المال', english: 'Capital', category: 'المحاسبة والقوائم', description: 'الأموال أو الأصول التي يضعها الملاك أو الشركاء في المنشأة لبدء النشاط أو دعمه.' },
  { id: 9, arabic: 'الأرباح المحتجزة (المبقاة)', english: 'Retained Earnings', category: 'المحاسبة والقوائم', description: 'صافي الأرباح المتراكمة للشركة منذ تأسيسها والتي لم تُوزع على الملاك وبقيت لدعم نمو المنشأة.' },
  { id: 10, arabic: 'الإيرادات', english: 'Revenues', category: 'المحاسبة والقوائم', description: 'الدخل الناتج عن النشاط الرئيسي للشركة من بيع السلع أو تقديم الخدمات خلال فترة زمنية.' },
  { id: 11, arabic: 'المصروفات', english: 'Expenses', category: 'المحاسبة والقوائم', description: 'التكاليف المستنفدة خلال الفترة مقابل تحقيق الإيرادات مثل الرواتب والإيجار والكهرباء والإهلاك.' },
  { id: 12, arabic: 'قائمة الدخل', english: 'Income Statement', category: 'المحاسبة والقوائم', description: 'تقرير مالي يوضح الإيرادات والمصروفات وصافي الربح أو الخسارة خلال فترة محددة (شهر، ربع سنة، سنة).' },
  { id: 13, arabic: 'قائمة المركز المالي (الميزانية)', english: 'Balance Sheet', category: 'المحاسبة والقوائم', description: 'تقرير يبيّن أرصدة الأصول والالتزامات وحقوق الملكية في تاريخ محدد، ويجب أن تتساوى فيه الأصول مع الالتزامات + حقوق الملكية.' },
  { id: 14, arabic: 'قائمة التدفقات النقدية', english: 'Cash Flow Statement', category: 'المحاسبة والقوائم', description: 'تقرير يوضح حركة النقد الداخلة والخارجة مقسمة إلى أنشطة تشغيلية واستثمارية وتمويلية.' },
  { id: 15, arabic: 'أساس الاستحقاق', english: 'Accrual Basis', category: 'المحاسبة والقوائم', description: 'إثبات الإيرادات عند تحققها والمصروفات عند حدوثها بغض النظر عن توقيت تحصيل أو دفع النقد.' },
  { id: 16, arabic: 'الأساس النقدي', english: 'Cash Basis', category: 'المحاسبة والقوائم', description: 'تسجيل الإيراد عند استلام النقد فعلياً وتسجيل المصروف عند دفع النقد فعلياً.' },
  { id: 17, arabic: 'الذمم المدينة (العملاء)', english: 'Accounts Receivable', category: 'المحاسبة والقوائم', description: 'أموال مستحقة للشركة لدى العملاء مقابل مبيعات آجلة ولم تُحصّل بعد.' },
  { id: 18, arabic: 'الذمم الدائنة (الموردون)', english: 'Accounts Payable', category: 'المحاسبة والقوائم', description: 'أموال مستحقة على الشركة للموردين مقابل مشتريات آجلة ولم تُسدد بعد.' },
  { id: 19, arabic: 'المصروفات المدفوعة مقدماً', english: 'Prepaid Expenses', category: 'المحاسبة والقوائم', description: 'مبالغ دُفعت مقدماً مقابل خدمة تمتد لعدة فترات (مثل إيجار سنوي مدفوع مقدماً) وتُعد أصلاً ثم تُحمّل تدريجياً كمصروف.' },
  { id: 20, arabic: 'الإيرادات المقدمة (غير المكتسبة)', english: 'Unearned Revenue', category: 'المحاسبة والقوائم', description: 'مبالغ استلمتها الشركة مقدماً من عملاء مقابل سلع أو خدمات ستُقدم لاحقاً، وتُعد التزاماً حتى أداء الخدمة.' },
  { id: 21, arabic: 'مجمع الإهلاك', english: 'Accumulated Depreciation', category: 'المحاسبة والقوائم', description: 'إجمالي أقساط الإهلاك المتراكمة للأصل الثابت منذ تاريخ شرائه وحتى تاريخ الميزانية.' },
  { id: 22, arabic: 'القيمة الدفترية', english: 'Book Value', category: 'المحاسبة والقوائم', description: 'تكلفة الأصل مطروحاً منها مجمع الإهلاك (تمثل قيمة الأصل المسجلة في السجلات المحاسبية).' },
  { id: 23, arabic: 'القيمة العادلة', english: 'Fair Value', category: 'المحاسبة والقوائم', description: 'السعر الذي يُستلم لبيع أصل أو يُدفع لنقل التزام في معاملة منظمة بين أطراف مطلعة في تاريخ القياس.' },
  { id: 24, arabic: 'المخصصات', english: 'Provisions', category: 'المحاسبة والقوائم', description: 'التزامات ذات توقيت أو مبلغ غير مؤكد تُقدّر لمواجهة خسائر محتملة متوقعة مثل مخصص ديون مشكوك في تحصيلها.' },
  { id: 25, arabic: 'الاحتياطيات', english: 'Reserves', category: 'المحاسبة والقوائم', description: 'مبالغ تُجنّب من الأرباح الصافية (نظامية أو اختيارية) لتعزيز المركز المالي للشركة.' },
  { id: 26, arabic: 'التكاليف الثابتة', english: 'Fixed Costs', category: 'التكاليف والإدارة', description: 'تكاليف لا تتغير في مجموعها مع تغير حجم الإنتاج أو المبيعات ضمن المدى الملائم مثل إيجار المصنع أو المكتب.' },
  { id: 27, arabic: 'التكاليف المتغيرة', english: 'Variable Costs', category: 'التكاليف والإدارة', description: 'تكاليف تتغير في مجموعها طردياً مع حجم الإنتاج أو المبيعات مثل المواد الخام المباشرة وعمولات البيع.' },
  { id: 28, arabic: 'التكاليف المباشرة', english: 'Direct Costs', category: 'التكاليف والإدارة', description: 'تكاليف يمكن تتبعها وتخصيصها مباشرة على منتج أو خدمة أو مشروع معين بسهولة واقتصادية.' },
  { id: 29, arabic: 'التكاليف غير المباشرة', english: 'Indirect Costs', category: 'التكاليف والإدارة', description: 'تكاليف مشتركة بين أكثر من منتج أو قسم ويصعب نسبتها مباشرة لوحدة واحدة دون أساس توزيع مثل كهرباء المصنع العامة.' },
  { id: 30, arabic: 'تكلفة البضاعة المباعة', english: 'Cost of Goods Sold (COGS)', category: 'التكاليف والإدارة', description: 'تكلفة شراء أو تصنيع الوحدات التي تم بيعها فعلياً خلال الفترة المحاسبية.' },
  { id: 31, arabic: 'مجمل الربح', english: 'Gross Profit', category: 'التكاليف والإدارة', description: 'الفرق بين صافي الإيرادات وتكلفة البضاعة المباعة قبل خصم المصاريف التشغيلية والإدارية والتمويلية.' },
  { id: 32, arabic: 'هامش المساهمة', english: 'Contribution Margin', category: 'التكاليف والإدارة', description: 'إيرادات المبيعات مطروحاً منها التكاليف المتغيرة؛ يبيّن ما يساهم به البيع في تغطية التكاليف الثابتة ثم تحقيق الربح.' },
  { id: 33, arabic: 'نقطة التعادل', english: 'Break-Even Point', category: 'التكاليف والإدارة', description: 'حجم المبيعات الذي تتساوى عنده الإيرادات الكلية مع التكاليف الكلية (الثابتة + المتغيرة) بحيث يكون الربح والخسارة صفراً.' },
  { id: 34, arabic: 'رأس المال العامل', english: 'Working Capital', category: 'التكاليف والإدارة', description: 'الأصول المتداولة مطروحاً منها الالتزامات المتداولة؛ مؤشر مهم للسيولة التشغيلية قصيرة الأجل.' },
  { id: 35, arabic: 'الموازنة التقديرية', english: 'Budget', category: 'التكاليف والإدارة', description: 'خطة مالية مستقبلية مُقدّرة بالأرقام لفترة قادمة تساعد على التخطيط والرقابة ومقارنة الفعلي بالمخطط.' },
  { id: 36, arabic: 'الوارد أولاً صادر أولاً', english: 'FIFO (First-In, First-Out)', category: 'التكاليف والإدارة', description: 'طريقة لتسعير المخزون تفترض أن الوحدات التي أُضيفت للمخزون أولاً هي التي تُباع أو تُصرف أولاً.' },
  { id: 37, arabic: 'ميزان المراجعة', english: 'Trial Balance', category: 'الرقابة والضرائب', description: 'كشف بأرصدة جميع الحسابات المدينة والدائنة للتحقق من توازن القيود قبل إعداد القوائم المالية.' },
  { id: 38, arabic: 'قيود التسوية', english: 'Adjusting Entries', category: 'الرقابة والضرائب', description: 'قيود تُسجل في نهاية الفترة المحاسبية لتحديث الحسابات وفق أساس الاستحقاق (كالإهلاك والمصروفات المستحقة أو المقدمة).' },
  { id: 39, arabic: 'القيود الختامية', english: 'Closing Entries', category: 'الرقابة والضرائب', description: 'قيود تُقفل بها الحسابات المؤقتة (الإيرادات والمصروفات والمسحوبات) في نهاية السنة لتحويل صافي النتيجة إلى حقوق الملكية.' },
  { id: 40, arabic: 'المراجعة / التدقيق المالي', english: 'Auditing', category: 'الرقابة والضرائب', description: 'فحص مستقل وموضوعي للسجلات والقوائم المالية لإبداء رأي فني حول مدى عدالتها ومطابقتها للمعايير المحاسبية.' },
  { id: 41, arabic: 'ضريبة القيمة المضافة', english: 'Value Added Tax (VAT)', category: 'الرقابة والضرائب', description: 'ضريبة غير مباشرة تُفرض على القيمة المضافة في كل مرحلة من مراحل إنتاج وتوزيع السلع والخدمات وتتحملها غالباً المستهلك النهائي.' },
  { id: 42, arabic: 'مركز التكلفة', english: 'Cost Center', category: 'الرقابة والضرائب', description: 'قسم أو نشاط أو فرع داخل المنشأة تُجمع وتُراقب تكاليفه بشكل مستقل لقياس الأداء وضبط النفقات.' }
];
