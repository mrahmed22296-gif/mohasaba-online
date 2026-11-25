// Activation-code redemption for Ahmed's gated sites.
// Codes live ONLY in the REDEEM_CODES_JSON env var (Vercel project settings),
// never in client JS or the repo. Returns { ok: true|false }.
const ALLOWED_ORIGINS = new Set([
  "https://my-cv-ai.vercel.app",
  "https://mohasaba-online.vercel.app",
  "https://qawaim.vercel.app",
  "https://eos-kw.vercel.app"
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

  const body = req.body || {};
  const site = typeof body.site === "string" ? body.site : "";
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const list = codes[site] || [];
  res.status(200).json({ ok: code.length > 0 && list.includes(code) });
};
