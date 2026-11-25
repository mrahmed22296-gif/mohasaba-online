// Owner-only data endpoint for the customers page.
// Verifies the caller's Firebase ID token belongs to the owner email,
// then proxies the users collection read using the caller's own token
// (Firestore rules allow the owner email to list users) and returns
// counters + the current activation codes from the env var.
const API_KEY = "AIzaSyCBtfYpB_j8X1ME-lMqP738Fy06FalSXIM"; // public-by-design Firebase web key, not a secret
const OWNER = "ahmed.abdelbaset41290@gmail.com";
const FS = "https://firestore.googleapis.com/v1/projects/resume-builder-access/databases/(default)/documents";
const COUNTER_IDS = ["my-cv-ai", "mohasaba-online", "financial-reports", "eos-kw", "jobs-auto-search"];

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return; }
  const idToken = req.body && req.body.idToken;
  if (!idToken) { res.status(401).json({ error: "no-token" }); return; }

  let email = "";
  try {
    const look = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    if (!look.ok) { res.status(401).json({ error: "bad-token" }); return; }
    const d = await look.json();
    email = (((d.users || [])[0] || {}).email || "").toLowerCase();
  } catch (e) { res.status(502).json({ error: "lookup-failed" }); return; }

  if (email !== OWNER) { res.status(403).json({ error: "not-owner" }); return; }

  try {
    const fsRes = await fetch(`${FS}/users`, { headers: { Authorization: "Bearer " + idToken } });
    if (!fsRes.ok) { res.status(502).json({ error: "firestore", status: fsRes.status }); return; }
    const users = await fsRes.json();

    const counters = {};
    await Promise.all(COUNTER_IDS.map(async (id) => {
      try {
        const r = await fetch(`${FS}/counters/${id}`);
        if (r.ok) {
          const d = await r.json();
          counters[id] = Number((((d.fields || {}).count) || {}).integerValue || 0);
        } else counters[id] = 0;
      } catch (e) { counters[id] = 0; }
    }));

    let codes = {};
    try { codes = JSON.parse(process.env.REDEEM_CODES_JSON || "{}"); } catch (e) {}

    res.status(200).json({ users, counters, codes });
  } catch (e) {
    res.status(500).json({ error: "internal" });
  }
};
