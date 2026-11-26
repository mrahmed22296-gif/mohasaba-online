// AI lesson generation for tahdeeri, gated by Wamd activation codes.
// Codes are verified against the same env buckets as api/redeem.js.
// GEMINI_API_KEY (+ optional GEMINI_MODEL) live ONLY in Vercel project
// env vars, never in the repo or page source.
const ALLOWED_ORIGINS = new Set([
  "https://mrahmed22296-gif.github.io",
  "https://mohasaba-online.vercel.app",
  "https://tahdeeri.vercel.app"
]);

// Best-effort daily rate limit per activation code (per serverless instance).
const RATE_LIMIT_PER_DAY = 15;
const usage = new Map();

const SOCIAL_EXAMPLE = {
  title: "حرفة الغوص على اللؤلؤ في منطقة الخليج العربية",
  grade: "الصف الخامس",
  page: "ص 91",
  unit: "الوحدة الرابعة: السمات الاقتصادية لدولة الكويت ودول الخليج العربية",
  standard: "يبني معرفة واتجاهات مدنية حول دولته وجوارها ومكانتها في سياق العالم",
  opening: "طرح سؤال: ما اسم بداية موسم الغوص؟",
  concepts: ["الدشة", "القفال", "الخانجية", "الطواش", "اليونسكو"],
  facts: [
    "مارس أجدادنا مهنة الغوص على اللؤلؤ ثم انصرفوا عنها بسبب ظهور النفط واكتشاف اللؤلؤ الصناعي الذي استزرعوه في اليابان.",
    "تسمى بداية موسم الغوص الدشة ونهايته القفال، ويمتد 4 شهور وتسمى الخانجية الكبير.",
    "طاقم سفينة الغوص: التباب، المجدمي، النهام، النوخذة، الرضيف، السيب، الغيص.",
    "كانت المرأة قديمًا في موسم الغوص رمزًا للصبر والقوة والتكيف مع الظروف الصعبة.",
    "حرصت الكويت على إحياء هذا التراث من خلال مهرجان الغوص السنوي، وطلب تسجيل مهنة الغوص موروثًا غير مادي في اليونسكو."
  ],
  generalization: "",
  objectives: [
    "أن يعلل الطالب انصراف دول الخليج عن مهنة الغوص على اللؤلؤ (معرفي - تحليل).",
    "أن يذكر الطالب موعد بداية موسم الغوص ونهايته ومدته (معرفي - تذكر).",
    "أن يسمي الطالب أفراد طاقم سفينة الغوص على اللؤلؤ (معرفي - تذكر).",
    "أن يوضح الطالب دور المرأة قديمًا في موسم الغوص (معرفي - فهم).",
    "أن يذكر الطالب جهود الكويت في الحفاظ على التراث البحري (معرفي - تذكر)."
  ],
  activities: [
    "يقرأ الفقرة الأولى ص 89 ليعلل انصراف دول الخليج عن مهنة الغوص على اللؤلؤ.",
    "يقرأ الفقرة الثانية ص 89 ليذكر موعد بداية موسم الغوص ونهايته ومدته.",
    "يلاحظ صور ص 90 ليسمي أفراد طاقم سفينة الغوص على اللؤلؤ.",
    "يقرأ الفقرة الرابعة ص 90 ليوضح دور المرأة قديمًا في موسم الغوص.",
    "يقرأ الفقرة الأخيرة ص 91 ليذكر جهود الكويت في الحفاظ على التراث البحري."
  ],
  assessment: [
    "س1: علّل: انصراف السكان عن حرفة الغوص.",
    "س2: متى تبدأ الدشة وتنتهي القفال؟ وكم مدة موسم الغوص؟",
    "س3: سمِّ أفراد طاقم سفينة الغوص على اللؤلؤ.",
    "س4: وضّح دور المرأة قديمًا في موسم الغوص.",
    "س5: اذكر جهودًا للكويت في الحفاظ على التراث البحري."
  ],
  essay: ["س1: عدد أهم أنواع السفن في دول الخليج العربية؟"],
  aids: ["السبورة والكتاب المدرسي", "خريطة دول الخليج العربية"],
  value: "التآزر الاجتماعي بين أفراد المجتمع في فترة رحلة الغوص",
  adjacent: "",
  closing: ""
};

const PSYCH_EXAMPLE = {
  title: "تعريف المعرفة",
  grade: "الثانوية",
  page: "ص 2",
  unit: "ما الفلسفة",
  standard: "",
  opening: "سؤال الطالبات: من أين تأتي معرفتنا بالأشياء؟ ومناقشة إجاباتهن لكي تتعرفن على معنى الدرس.",
  concepts: ["المعرفة"],
  facts: [
    "صورة المعرفة وشكلها ذاتي يحققه الإنسان بواسطة حواسه وعقله.",
    "مضمون المعرفة موضوعي يتعلق بالعالم بمختلف أحداثه وظواهره الطبيعية.",
    "من مميزات المعرفة: تعد واقعًا قائمًا، تتصف بطابعها التطبيقي، تتميز بطابعها الاجتماعي.",
    "المعرفة تنمو وتتقدم تاريخيًا حيث إنها تنقلنا من الجهل إلى المعرفة."
  ],
  generalization: "",
  objectives: [
    "أن يوضح الطالب صورة المعرفة وشكلها الذاتي (معرفي - فهم).",
    "أن يستنتج الطالب موضوعية مضمون المعرفة (معرفي - تحليل).",
    "أن يعدد الطالب مميزات المعرفة (معرفي - تذكر).",
    "أن يقدر الطالب دور المعرفة في نقلنا من الجهل إلى المعرفة (وجداني - تقدير)."
  ],
  activities: [
    "يقرأ الفقرة الأولى ص 2 ليوضح صورة المعرفة وشكلها الذاتي.",
    "يلاحظ بطاقات أمثلة من الظواهر الطبيعية ليستنتج موضوعية مضمون المعرفة.",
    "يقرأ الفقرة الثانية ص 2،3 ليعدد مميزات المعرفة.",
    "الحوار والمناقشة ليقدر دور المعرفة في نقلنا من الجهل إلى المعرفة."
  ],
  assessment: [
    "أكملي العبارة: يحقق الإنسان المعرفة بواسطة ........",
    "صححي العبارة: يعد مضمون المعرفة ذاتيًا.",
    "عددي مميزات المعرفة.",
    "ما أثر المعرفة في نقل الإنسان من الجهل إلى المعرفة؟"
  ],
  essay: [],
  aids: [],
  value: "",
  adjacent: "حل أسئلة التقويم الموجودة في الكتاب المدرسي ص 5، واكتبي تقريرًا قصيرًا عن مصدر من مصادر المعرفة في حياتك اليومية.",
  closing: "ما شعورك تجاه أهمية المعرفة في حياة الإنسان؟ هل كان من الأفضل أن يعتمد الإنسان على حواسه وحدها في اكتساب المعرفة؟ ولماذا؟ أعط مثالًا لمعرفة اكتسبتها من بيئتك الاجتماعية."
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }

  // Verify the activation code against the same env buckets as redeem.js.
  let codes;
  try { codes = JSON.parse(process.env.REDEEM_CODES_JSON || "{}"); }
  catch (e) { res.status(500).json({ ok: false, error: "config" }); return; }
  for (const key of Object.keys(process.env)) {
    if (!key.startsWith("REDEEM_CODES_") || key === "REDEEM_CODES_JSON") continue;
    try {
      const extra = JSON.parse(process.env[key] || "{}");
      if (Array.isArray(extra)) continue;
      for (const [site, list] of Object.entries(extra)) {
        if (Array.isArray(list)) codes[site] = (codes[site] || []).concat(list);
      }
    } catch (e) { /* ignore malformed extras */ }
  }
  const norm = (v) => (typeof v === "string" ? v.replace(/[^A-Za-z0-9]/g, "").toUpperCase() : "");
  const body = req.body || {};
  const site = typeof body.site === "string" ? body.site : "";
  const code = norm(body.code);
  const list = (codes[site] || []).map(norm);
  if (!(code.length > 0 && list.includes(code))) {
    res.status(200).json({ ok: false, error: "code" }); return;
  }

  // Best-effort daily rate limit per code.
  const today = new Date().toISOString().slice(0, 10);
  const u = usage.get(code) || { day: today, count: 0 };
  if (u.day !== today) { u.day = today; u.count = 0; }
  if (u.count >= RATE_LIMIT_PER_DAY) { res.status(200).json({ ok: false, error: "rate" }); return; }
  u.count += 1; usage.set(code, u);

  const title = (typeof body.title === "string" ? body.title : "").trim().slice(0, 140);
  const template = body.template === "psych" ? "psych" : "social";
  const grade = (typeof body.grade === "string" ? body.grade : "").trim().slice(0, 60);
  const source = (typeof body.source === "string" ? body.source : "").trim().slice(0, 9000);
  if (!title) { res.status(200).json({ ok: false, error: "title" }); return; }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(200).json({ ok: false, error: "config" }); return; }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const example = template === "psych" ? PSYCH_EXAMPLE : SOCIAL_EXAMPLE;
  const prompt = [
    "أنت معلم كويتي خبير في إعداد تحضير الدروس على نموذج وزارة التربية الكويتية (نموذج إعداد الدرس في دليل المعلم الإرشادي).",
    "اكتب تحضيرًا كاملًا لدرس جديد بصياغة أصلية من عندك، وليست نصوصًا منسوخة من كتب الوزارة، وبنفس أسلوب المثال التالي وبنفس الحقول تمامًا.",
    "المثال (لأسلوب الصياغة والحقول فقط):",
    JSON.stringify(example),
    "المطلوب الآن: اكتب تحضيرًا لدرس بعنوان: «" + title + "»" + (grade ? " للمرحلة/الصف: " + grade : "") + ".",
    "أعد الناتج ككائن JSON واحد فقط بدون أي نص إضافي، وبالحقول التالية تمامًا:",
    'unit, standard, page, opening, concepts, facts, generalization, objectives, activities, assessment, essay, aids, value, adjacent, closing',
    "الحقول concepts وfacts وobjectives وactivities وassessment وessay وaids مصفوفات نصية، والباقي نصوص.",
    "معايير نموذج إعداد الدرس المعتمد من وزارة التربية الكويتية التي يجب الالتزام بها حرفيًا:",
    "1) opening (النشاط الاستهلالي): يهدف إلى جذب انتباه المتعلم وتحقيق الإثارة والتشويق لموضوع الدرس، ويتحقق بأحد الأساليب التالية: الكشف عن خبرة جديدة، أو ربط الموضوع بالأحداث الجارية، أو ربط خبرة سابقة بخبرة جديدة، أو اطلاع خارجي، أو أي نشاط آخر مناسب.",
    "2) تحليل المادة العلمية: يحرص المعلم على تحليل المادة العلمية تحليلًا دقيقًا يشمل ما يناسب الدرس من: المفاهيم والمصطلحات (ضعها في concepts)، الحقائق والآراء أي أفكار الدرس (ضعها في facts)، التعميمات (ضعها في generalization)، القيم الوجدانية والعلاقات الفكرية (ضعها في value)، وكذلك المهارات والمشكلات والنظريات والقوانين والمقارنات عند ملاءمتها للدرس (أدرجها ضمن facts).",
    "3) objectives (الأهداف السلوكية): يتكون الهدف السلوكي من: أن + فعل السلوك + المتعلم + المحتوى المرجعي + (شرط الأداء أو مستوى الأداء عند الحاجة)، ويبدأ بفعل سلوكي قابل للملاحظة والقياس، ونوّع مستويات الأهداف بين المجالات الثلاثة، واذكر المجال بين قوسين عند الحاجة كما في المثال. استخدم أفعال كل مجال ومستوى كما وردت في دليل المعلم:",
    "المجال المعرفي - التذكر: يذكر، يعدد، يسمي، يحدد، يعرف، يتعرف. الفهم: يشرح، يفسر، يلخص، يميز، يستخرج. التطبيق: يطبق، يستخدم، يوظف، يحل. التحليل: يحلل، يقارن، يصنف، يستنتج، يستخلص، يفرق، يبين، يستنبط، يعلل، يبرهن، يدلل، يستكشف، يميز، يكتشف. الإبداع (التركيب): يصمم، يقترح، يبتكر، يؤلف، يلخص. التقويم: يقيم، ينقد، يبرر، يدافع عن رأي، يدلل، يستخلص، يستنتج، يفرق، يعلل، يقارن، يختار، يفضل.",
    "المجال الوجداني - الاستقبال: يصغي، ينتبه، يفضل. الاستجابة: يشارك، يتطوع، يستجيب. إعطاء قيمة: يفضل، يلتزم ب، يدافع عن. التنظيم: ينظم، يقارن بين قيم، يوازن. التمييز القيمي (بناء نسق قيمي): يتصرف باتساق مع، يبدو التزامًا مستمرًا ب، يتصف.",
    "المجال النفس حركي (المهاري) - الإدراك الحسي: يلاحظ، يميز، ينتبه إلى. الاستعداد: يستعد، يهيئ، يبدي رغبته في الأداء. الاستجابة الموجهة: يقلد، يحاكي، يجرب بتوجيه. الآلية: يؤدي، يمارس دون مساعدة. الاستجابة الظاهرة المعقدة: يؤدي بمهارة، ينفذ بدقة وسلاسة. التكيف: يعدل، يكيف أداءه. الإبداع: يبتكر، يقدم أداءً جديدًا، يصمم، يبدع.",
    "4) activities (الأنشطة التنموية): القاعدة الأساسية: نشاط + غرض، مثل: يقرأ الفقرة رقم كذا ص كذا ويستنتج كذا، يلاحظ (خريطة أو شفافية أو صورة أو رسم أو مخطط أو جدول أو فقرة من مرجع خارجي) + الغرض، يشاهد (فيلم وثائقي) + الغرض، يستمع (مسجل أو شرح المعلم) + الغرض، يحول جدولًا إلى رسم بياني، يرسم دائرة بيانية + الغرض، يرسم مخططًا سهميًا + الغرض. واربط كل نشاط بهدف سلوكي من أهداف الدرس.",
    "5) assessment (التقويم المصاحب): مجموعة من الأسئلة الموضوعية والمقالية والشفوية المتنوعة بهدف: قياس تحقيق الهدف السلوكي، والاطمئنان على استمرارية تفاعل المتعلم بصورة صحيحة مع أنشطة النمو؛ اجعل لكل هدف سلوكي سؤالًا يقيسه.",
    "6) closing (التقويم الختامي): خطوة أخيرة للتأكد من وصول الفائدة العامة للدرس للمتعلمين؛ مجموعة أسئلة تطبيقية متنوعة وشاملة تعرف الإجابة عنها مدى تحقيق الدرس لأهدافه، بصياغات مثل: «ما شعورك تجاه...؟»، «هل كان من الأفضل...؟ ولماذا؟»، «عبّر بأسلوبك عن...»، «أعط مثالًا لـ...»، «ماذا يحدث لو...».",
    "7) adjacent (النشاط الاصفي): واجبات يُكلف بأدائها المتعلم خارج الفصل كوسيلة متممة للتعلم داخله، مثل: أسئلة مقالية، أسئلة موضوعية، أسئلة التقويم الموجودة في الكتاب، جمع صور، عينات، تقرير قصير، رسم خريطة، إعداد رسوم بيانية.",
    "قاعدة الترابط الإلزامية (مهمة جدًا): العناصر مرتبطة رقميًا واحدًا لواحد. الحقيقة رقم 1 في facts يقابلها الهدف السلوكي رقم 1 في objectives، ويقابله النشاط التنموي رقم 1 في activities، ويقابله سؤال التقويم المصاحب رقم 1 في assessment؛ وهكذا للرقم 2 و3 و4... يجب أن يكون عدد عناصر المصفوفات الأربع facts وobjectives وactivities وassessment متساويًا تمامًا (من 3 إلى 6 عناصر). كل هدف يقيس الحقيقة المقابلة له فقط، وكل نشاط يحقق الهدف المقابل له، وكل سؤال تقويم يقيس الهدف المقابل له. لا تضع أهدافًا عامة مثل: يتعرف المفاهيم الواردة في الدرس. ضع المفاهيم في concepts فقط ولا تكررها كحقيقة. ابدأ كل هدف بـ: أن + فعل سلوكي.",
    "قاعدة الالتزام بالكتاب المدرسي: اقتصر على المفاهيم والمعلومات والحقائق التي يتضمنها الدرس في الكتاب المدرسي لوزارة التربية بالكويت لهذا الصف، ولا تضف معلومات أو مصطلحات من خارج الدرس أو لا تكون متأكدًا منها. إن لم تكن متأكدًا من محتوى الدرس في الكتاب فاكتب فقط ما هو شائع ومؤكد، وقلل عدد الحقائق بدل اختلاق معلومات. لا تخترع أرقام صفحات؛ اترك page وأرقام الصفحات في الأنشطة عامة (مثل: يقرأ الفقرة الأولى من الدرس) إن لم تكن متأكدًا.",
    source
      ? "نص الدرس من الكتاب المدرسي كما لصقه المعلم (هذا هو المصدر الوحيد للمحتوى): اشتق منه concepts وfacts وكل الحقول، ولا تضف أي مفهوم أو معلومة غير موجودة فيه إطلاقًا، وليكن كل مفهوم وحقيقة مأخوذين من هذا النص:\n\"\"\"\n" + source + "\n\"\"\""
      : "",
    "اترك الحقل نصًا فارغًا إذا لم يكن مناسبًا للدرس."
  ].filter(Boolean).join("\n");

  // Gemini أحيانًا يرد 503 "النموذج مشغول"؛ أعد المحاولة بفواصل قصيرة قبل إعلان الفشل.
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
  const geminiBody = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 8000 }
  });
  let data = null, lastDetail = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: geminiBody
      });
      const txt = await r.text();
      if (r.ok) { data = JSON.parse(txt); break; }
      lastDetail = "http " + r.status + " " + txt.slice(0, 300);
      if (![500, 502, 503, 504].includes(r.status)) {
        res.status(200).json({ ok: false, error: "generate", detail: lastDetail });
        return;
      }
    } catch (e) {
      lastDetail = String(e).slice(0, 200);
    }
    if (attempt < 3) await sleep(1500 * attempt);
  }
  if (!data) {
    // فشلت كل المحاولات بسبب ضغط مؤقت: لا نخصمها من الحد اليومي ونخبر العميل أن الخدمة مشغولة.
    u.count -= 1; usage.set(code, u);
    res.status(200).json({ ok: false, error: "busy", detail: lastDetail.slice(0, 300) });
    return;
  }
  try {
    const text = (data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text) || "";
    const lesson = JSON.parse(text);
    if (!lesson || typeof lesson !== "object") throw new Error("bad json");
    const arr = (v) => Array.isArray(v) ? v.filter(x => typeof x === "string" && x.trim()).slice(0, 12) : [];
    const str = (v) => typeof v === "string" ? v.trim().slice(0, 600) : "";
    res.status(200).json({
      ok: true,
      lesson: {
        template, title,
        grade: str(lesson.grade) || grade,
        page: str(lesson.page), unit: str(lesson.unit), standard: str(lesson.standard),
        opening: str(lesson.opening),
        concepts: arr(lesson.concepts), facts: arr(lesson.facts),
        generalization: str(lesson.generalization),
        objectives: arr(lesson.objectives), activities: arr(lesson.activities),
        assessment: arr(lesson.assessment), essay: arr(lesson.essay),
        aids: arr(lesson.aids), value: str(lesson.value),
        adjacent: str(lesson.adjacent), closing: str(lesson.closing)
      }
    });
  } catch (e) {
    res.status(200).json({ ok: false, error: "generate", detail: String(e).slice(0, 200) });
  }
};
