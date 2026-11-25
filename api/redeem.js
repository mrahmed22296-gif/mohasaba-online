// Activation-code redemption for Ahmed's gated sites.
// Codes live ONLY in the REDEEM_CODES_JSON env var (Vercel project settings),
// never in client JS or the repo. Returns { ok: true|false }.
// Sites: ai-resume-builder, mohasaba-online, financial-reports, eos-kw, jobs-auto-search, aaref
const ALLOWED_ORIGINS = new Set([
  "https://my-cv-ai.vercel.app",
  "https://mohasaba-online.vercel.app",
  "https://qawaim.vercel.app",
  "https://eos-kw.vercel.app",
  "https://jobs-auto-search.vercel.app",
  "https://aaref.vercel.app",
  "https://fahhimni.vercel.app",
  "https://fahhimni-kw.vercel.app",
  "https://mrahmed22296-gif.github.io",
  "https://tahdeeri.vercel.app"
]);

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

  let codes;
  try { codes = JSON.parse(process.env.REDEEM_CODES_JSON || "{}"); }
  catch (e) { res.status(500).json({ ok: false, error: "config" }); return; }
  // Extra per-site code buckets can live in their own env vars (e.g. REDEEM_CODES_AAREF)
  // so adding a new site never requires editing the shared REDEEM_CODES_JSON value.
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
  res.status(200).json({ ok: code.length > 0 && list.includes(code) });
};
