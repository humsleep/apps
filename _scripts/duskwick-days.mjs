// Writes apps/duskwick/<n>/index.html (the landing page of the share link
// https://humsleep.github.io/apps/duskwick/<n>?ct=share) for n = 1..N.   usage: node _scripts/duskwick-days.mjs [N=400]
// Daily #1 is 2026-11-01, so 400 pages last until 2027-12-05: raise N (and rerun) before then.
// The App Store address is NOT here: it lives in duskwick/config.js (APP_STORE_URL). Rerun this script
// after setting it so the pages get the Smart App Banner (Safari reads that meta tag only from the HTML).
// Hand-written pages are untouched; only numbered folders are (re)written.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../duskwick/", import.meta.url));
const N = Number(process.argv[2] ?? 400);
if (!Number.isInteger(N) || N < 1 || N > 5000) throw new Error("N must be an integer 1..5000");
const BASE = "https://humsleep.github.io/apps/duskwick/";
const storeUrl = (readFileSync(root + "config.js", "utf8").replace(/^\s*\/\/.*$/gm, "").match(/APP_STORE_URL\s*=\s*"([^"]*)"/) ?? [])[1] ?? "";
const appId = (storeUrl.match(/\/id(\d+)/) ?? [])[1];
if (storeUrl && !appId) throw new Error(`APP_STORE_URL "${storeUrl}" has no /id<digits>`);

const page = (n) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Duskwick #${n}</title>
<meta name="description" content="Daily lantern puzzle #${n}: light every tile, and never let two lanterns see each other.">
<link rel="canonical" href="${BASE}${n}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Duskwick">
<meta property="og:title" content="Duskwick #${n}">
<meta property="og:description" content="Daily lantern puzzle #${n}. A calm puzzle, new every day.">
<meta property="og:url" content="${BASE}${n}/">
<meta property="og:image" content="${BASE}og.jpg">
<meta name="twitter:card" content="summary_large_image">
${appId ? `<meta name="apple-itunes-app" content="app-id=${appId}, app-argument=${BASE}${n}">\n` : ""}<link rel="icon" href="../icon.png">
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="../duskwick.css">
</head>
<body>
<main>
<img class="icon" src="../icon.png" alt="" width="72" height="72">
<h1>Duskwick #${n}</h1>
<p>A calm lantern puzzle, new every day. Everyone gets the same board. Light every tile and never let two lanterns see each other.</p>
<p><a class="btn" href="duskwick://daily/${n}">Open in Duskwick</a>
<a class="btn" data-store="Download on the App Store" aria-disabled="true">Coming soon to the App Store</a></p>
<p class="muted">"Open in Duskwick" needs the app installed; it opens today's daily. 앱이 설치되어 있으면 오늘의 데일리가 열립니다.</p>
<p class="muted"><a href="../">About &amp; support</a> · <a href="../privacy/">Privacy</a></p>
</main>
<script src="../config.js"></script>
<script src="../app-store.js"></script>
</body>
</html>
`;

for (let n = 1; n <= N; n++) {
  mkdirSync(`${root}${n}`, { recursive: true });
  writeFileSync(`${root}${n}/index.html`, page(n));
}
// self-check: the last page is complete and the first one points at its own number
const a = readFileSync(`${root}1/index.html`, "utf8");
const z = readFileSync(`${root}${N}/index.html`, "utf8");
if (!a.includes("duskwick://daily/1\"") || !z.includes(`Duskwick #${N}`) || /undefined|\$\{/.test(a + z)) throw new Error("self-check failed");
console.log(`wrote ${N} pages${appId ? ` with Smart App Banner id ${appId}` : " (no App Store address yet: no banner)"}`);
