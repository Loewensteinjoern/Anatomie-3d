#!/usr/bin/env node
/* =====================================================================
   Prüfung der veröffentlichten Seite (GitHub Pages) gegen den lokalen Stand

     node tools/live.js [basis-url] [--quelle <ordner>] [--ohne-browser]

   Standard-Basis: https://loewensteinjoern.github.io/Anatomie-3d/
   Standard-Quelle: das Repository dieses Werkzeugs (Arbeitsverzeichnis).

   a) lädt alle Dateien aus DATEIEN (sw.js) von der Basis-URL und vergleicht
      SHA-256 mit den lokalen Dateien; meldet fehlende und abweichende Dateien
   b) vergleicht VERSION (sw.js) online und lokal
   c) öffnet die Adresse in Chromium (Playwright), ruft nacheinander Körper,
      #herz, #niere, #niere/nephron und #lunge auf, wartet auf den fertigen Aufbau
      und sammelt Konsolenfehler, alle Netzwerkanfragen (jede Anfrage an einen
      anderen Host als die Basis ist ein Fehler) und CSP-Verstöße
      (securitypolicyviolation)
   d) Zusammenfassung „in Ordnung“ oder Liste der Probleme; Exit 0 = in Ordnung

   Abrufe über Node laufen bei https über den Proxy aus HTTPS_PROXY (CONNECT-Tunnel,
   CA-Bundle aus NODE_EXTRA_CA_CERTS bzw. /root/.ccr/ca-bundle.crt, falls vorhanden);
   die Zertifikate werden immer geprüft. Das Werkzeug ist keine App-Datei (nicht in DATEIEN).
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), https = require('https'), tls = require('tls');
const crypto = require('crypto');
const { execSync } = require('child_process');

const STANDARD = 'https://loewensteinjoern.github.io/Anatomie-3d/';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
let basis = STANDARD, quelle = path.join(__dirname, '..'), ohneBrowser = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--quelle') quelle = path.resolve(args[++i]);
  else if (args[i] === '--ohne-browser') ohneBrowser = true;
  else basis = args[i];
}
if (!/\/$/.test(basis)) basis += '/';
const probleme = [];
const problem = (t) => { probleme.push(t); console.log('  PROBLEM: ' + t); };

/* ---------- Abruf (Node) ---------- */
function caBundle() {
  const p = process.env.NODE_EXTRA_CA_CERTS || '/root/.ccr/ca-bundle.crt';
  try { return [...tls.rootCertificates, fs.readFileSync(p, 'utf8')]; } catch (e) { return undefined; }
}
const CA = caBundle();
function proxyFuer(u) {
  const p = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!p || u.protocol !== 'https:') return null;
  const no = (process.env.NO_PROXY || process.env.no_proxy || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (no.some((n) => u.hostname === n || u.hostname.endsWith('.' + n.replace(/^\./, '')))) return null;
  return new URL(p);
}
function holen(url) {
  return new Promise((ok, fehl) => {
    const u = new URL(url), px = proxyFuer(u);
    const optionen = { method: 'GET', headers: { 'cache-control': 'no-cache', 'user-agent': 'anatomie-live' } };
    const antwort = (res) => {
      const teile = [];
      res.on('data', (d) => teile.push(d));
      res.on('end', () => ok({ status: res.statusCode, daten: Buffer.concat(teile) }));
    };
    if (u.protocol === 'http:') { http.get(u, optionen, antwort).on('error', fehl); return; }
    if (!px) { https.get(u, Object.assign({ ca: CA }, optionen), antwort).on('error', fehl); return; }
    const c = http.request({ host: px.hostname, port: px.port || 80, method: 'CONNECT', path: u.hostname + ':' + (u.port || 443),
      headers: px.username ? { 'proxy-authorization': 'Basic ' + Buffer.from(decodeURIComponent(px.username) + ':' + decodeURIComponent(px.password)).toString('base64') } : {} });
    c.on('connect', (res, sock) => {
      if (res.statusCode !== 200) { sock.destroy(); fehl(new Error('Proxy antwortet mit ' + res.statusCode)); return; }
      const s = tls.connect({ socket: sock, servername: u.hostname, ca: CA });
      s.on('error', fehl);
      const a = https.request({ host: u.hostname, path: u.pathname + u.search, method: 'GET', headers: Object.assign({ host: u.host }, optionen.headers), createConnection: () => s }, antwort);
      a.on('error', fehl); a.end();
    });
    c.on('error', fehl); c.end();
  });
}

/* ---------- sw.js lesen ---------- */
function swLesen(text) {
  const liste = /var DATEIEN = \[([\s\S]*?)\];/.exec(text), v = /var VERSION = '([^']*)';/.exec(text);
  const dateien = []; let m; const re = /'([^']+)'/g;
  if (liste) while ((m = re.exec(liste[1]))) dateien.push(m[1]);
  return { dateien, version: v ? v[1] : null };
}

async function dateienPruefen() {
  console.log('Dateien (' + basis + ')');
  const lokal = swLesen(fs.readFileSync(path.join(quelle, 'sw.js'), 'utf8'));
  let online = null;
  try {
    const r = await holen(basis + 'sw.js');
    if (r.status !== 200) problem('sw.js online: Status ' + r.status);
    else online = swLesen(r.daten.toString('utf8'));
  } catch (e) { problem('sw.js online nicht abrufbar: ' + e.message); }
  if (online) {
    console.log('  VERSION lokal ' + lokal.version + ', online ' + online.version);
    if (online.version !== lokal.version) problem('VERSION online (' + online.version + ') weicht von lokal (' + lokal.version + ') ab');
    const nur = lokal.dateien.filter((d) => online.dateien.indexOf(d) < 0), nurO = online.dateien.filter((d) => lokal.dateien.indexOf(d) < 0);
    if (nur.length) problem('DATEIEN online ohne: ' + nur.join(', '));
    if (nurO.length) problem('DATEIEN online zusätzlich: ' + nurO.join(', '));
  }
  let gleich = 0;
  for (const d of lokal.dateien) {
    const lokalDatei = d === './' ? 'index.html' : d;
    let r;
    try { r = await holen(basis + (d === './' ? '' : d)); } catch (e) { problem(d + ': nicht abrufbar (' + e.message + ')'); continue; }
    if (r.status !== 200) { problem(d + ': fehlt online (Status ' + r.status + ')'); continue; }
    let l;
    try { l = fs.readFileSync(path.join(quelle, lokalDatei)); } catch (e) { problem(d + ': lokal nicht lesbar'); continue; }
    if (sha(l) !== sha(r.daten)) problem(d + ': Inhalt weicht ab (lokal ' + sha(l).slice(0, 12) + ', online ' + sha(r.daten).slice(0, 12) + ')');
    else gleich++;
  }
  /* sw.js selbst */
  try {
    const r = await holen(basis + 'sw.js');
    if (r.status === 200 && sha(r.daten) !== sha(fs.readFileSync(path.join(quelle, 'sw.js')))) problem('sw.js: Inhalt weicht ab');
    else if (r.status === 200) gleich++;
  } catch (e) { /* oben gemeldet */ }
  console.log('  ' + gleich + ' von ' + (lokal.dateien.length + 1) + ' Dateien gleich');
}

/* ---------- Browser ---------- */
function ladePlaywright() {
  try { return require('playwright'); } catch (e) { /* global installiert? */ }
  try { return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch (e) { /* fehlt */ }
  console.error('Playwright fehlt: npm install -g playwright && npx playwright install chromium');
  process.exit(2);
}
const BEREIT = {
  koerper: () => !!(window.KoerperApp && window.KoerperApp.ready) && document.getElementById('boot').classList.contains('gone'),
  herz: () => !!(window.HerzApp && window.HerzApp.ready) && document.getElementById('boot').classList.contains('gone'),
  niere: () => !!(window.NiereApp && window.NiereApp.ready) && document.getElementById('boot').classList.contains('gone'),
  nephron: () => document.getElementById('boot').classList.contains('gone') && !!Kern.Organe.nephron && document.getElementById('organ').childElementCount > 0,
  lunge: () => !!(window.LungeApp && window.LungeApp.ready) && document.getElementById('boot').classList.contains('gone')
};
const SEITEN = [['koerper', ''], ['herz', '#herz'], ['niere', '#niere'], ['nephron', '#niere/nephron'], ['lunge', '#lunge']];

async function browserPruefen() {
  console.log('Browser');
  const pw = ladePlaywright();
  const u = new URL(basis), px = proxyFuer(u);
  const browser = await pw.chromium.launch({
    executablePath: process.env.CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
    args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    proxy: px ? { server: px.origin } : undefined
  });
  try {
    for (const [name, hash] of SEITEN) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const eigene = [];
      const meld = (t) => eigene.push(t);
      page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && !/GL Driver Message/.test(m.text()))) meld('Konsole (' + m.type() + '): ' + m.text()); });
      page.on('pageerror', (e) => meld('Seitenfehler: ' + e.message));
      page.on('requestfailed', (q) => meld('Anfrage fehlgeschlagen: ' + q.url() + ' (' + (q.failure() || {}).errorText + ')'));
      const anfragen = [];
      ctx.on('request', (q) => anfragen.push(q.url()));
      await page.addInitScript(() => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + (e.blockedURI || '') + ' @' + (e.sourceFile || '') + ':' + (e.lineNumber || '')));
      });
      try {
        await page.goto(basis + hash, { waitUntil: 'load', timeout: 60000 });
        await page.waitForFunction(BEREIT[name], null, { timeout: 120000, polling: 250 });
        await warte(1500);
      } catch (e) { meld('Seite ' + (hash || 'Körper') + ' nicht fertig aufgebaut: ' + e.message.split('\n')[0]); }
      const csp = await page.evaluate(() => window.__csp || []).catch(() => []);
      csp.forEach((c) => meld('CSP-Verstoß: ' + c));
      const fremd = [...new Set(anfragen.filter((a) => /^(https?|wss?|ftp):/i.test(a) && new URL(a).host !== u.host))];
      fremd.forEach((a) => meld('Anfrage an anderen Host: ' + a));
      const anzahl = anfragen.filter((a) => /^https?:/i.test(a)).length;
      console.log('  ' + (hash || '(Körper)') + ': ' + anzahl + ' Anfragen, ' + (eigene.length ? eigene.length + ' Probleme' : 'in Ordnung'));
      eigene.forEach((t) => problem((hash || 'Körper') + ': ' + t));
      await ctx.close();
    }
  } finally { await browser.close(); }
}

(async () => {
  await dateienPruefen();
  if (!ohneBrowser) await browserPruefen().catch((e) => problem('Browserprüfung abgebrochen: ' + e.message.split('\n')[0]));
  console.log(probleme.length ? '\n' + probleme.length + ' Problem(e):\n- ' + probleme.join('\n- ') : '\nin Ordnung');
  process.exit(probleme.length ? 1 : 0);
})();
