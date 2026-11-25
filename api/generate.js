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
    "تعرف المفاهيم الواردة في الدرس.",
    "تعلل انصراف دول الخليج عن مهنة الغوص على اللؤلؤ.",
    "تسمي طاقم سفينة الغوص على اللؤلؤ.",
    "توضح دور المرأة قديمًا في موسم الغوص.",
    "تذكر جهود الكويت في الحفاظ على التراث البحري."
  ],
  activities: [
    "تقرأ ك م ص 89 لتحليل انصراف دول الخليج عن مهنة الغوص على اللؤلؤ.",
    "تقرأ ك م ص 89 لتسمي طاقم سفينة الغوص على اللؤلؤ.",
    "تشاهد صور ص 90 لتوضح دور المرأة قديمًا في موسم الغوص.",
    "تقرأ فقرة لتذكر جهود الكويت في الحفاظ على التراث البحري."
  ],
  assessment: [
    "س1: عرّف مفهوم: الدشة، القفال.",
    "س2: علّل ما يلي: يعلل انصراف السكان عن حرفة الغوص.",
    "س3: أجب عمّا يلي: سمِّ طاقم سفينة الغوص على اللؤلؤ."
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
    "تتعرف على مفهوم المعرفة.",
    "تستكشف الوسائل التي يحصل بها الإنسان على المعرفة (نفس حركي).",
    "تتعرف على مضمون المعرفة التي يحصل عليها الإنسان (معرفي - تذكر).",
    "تعدد مميزات المعرفة (معرفي - تذكر).",
    "تقدر دور المعرفة في نقلنا من الجهل إلى المعرفة."
  ],
  activities: [
    "تلاحظ البطاقات لتفسر المفاهيم الواردة بالدرس.",
    "تقرأ الفقرة الثانية من الكتاب المدرسي ص 2،3 لتعدد مميزات المعرفة.",
    "الحوار والمناقشة لتقدر دور المعرفة في نقلنا من الجهل إلى المعرفة."
  ],
  assessment: [
    "أكملي العبارة: يحقق الإنسان المعرفة بواسطة ........",
    "صححي العبارة: يعد مضمون المعرفة ذاتيًا.",
    "عددي مميزات المعرفة.",
    "دللي على صحة العبارة: تتصف المعرفة بأنها تاريخية."
  ],
  essay: [],
  aids: [],
  value: "",
  adjacent: "دللي على صحة العبارة: تتصف المعرفة بأنها تاريخية.",
  closing: "طرح مجموعة من الأسئلة"
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
  if (!title) { res.status(200).json({ ok: false, error: "title" }); return; }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(200).json({ ok: false, error: "config" }); return; }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const example = template === "psych" ? PSYCH_EXAMPLE : SOCIAL_EXAMPLE;
  const prompt = [
    "أنت معلم كويتي خبير في إعداد تحضير الدروس على نموذج وزارة التربية الكويتية.",
    "اكتب تحضيرًا كاملًا لدرس جديد بصياغة أصلية من عندك، وليست نصوصًا منسوخة من كتب الوزارة، وبنفس أسلوب المثال التالي وبنفس الحقول تمامًا.",
    "المثال (لأسلوب الصياغة والحقول فقط):",
    JSON.stringify(example),
    "المطلوب الآن: اكتب تحضيرًا لدرس بعنوان: «" + title + "»" + (grade ? " للمرحلة/الصف: " + grade : "") + ".",
    "أعد الناتج ككائن JSON واحد فقط بدون أي نص إضافي، وبالحقول التالية تمامًا:",
    'unit, standard, page, opening, concepts, facts, generalization, objectives, activities, assessment, essay, aids, value, adjacent, closing',
    "الحقول concepts وfacts وobjectives وactivities وassessment وessay وaids مصفوفات نصية، والباقي نصوص.",
    "الأهداف السلوكية تبدأ بفعل سلوكي قابل للملاحظة (تعرف، تعلل، تعدد، تسمي...).",
    "اترك الحقل نصًا فارغًا إذا لم يكن مناسبًا للدرس."
  ].join("\n");

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 3500 }
        })
      }
    );
    const data = await r.json();
    if (!r.ok) { res.status(200).json({ ok: false, error: "generate", detail: "http " + r.status + " " + JSON.stringify(data).slice(0, 300) }); return; }
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
