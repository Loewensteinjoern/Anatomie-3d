#!/usr/bin/env node
/* =====================================================================
   Vergleichsaufnahmen für Herz (index.html) und Nephron (nephron.html)

   Prüft, ob beide Modelle nach einer Änderung genauso aussehen und
   funktionieren wie vorher.

     node tools/vergleich.js aufnehmen <ziel> [--quelle <ordner>] [--nur herz|nephron[:kontext]]
     node tools/vergleich.js vergleichen <vorher> <nachher>

   Die Seiten laufen in headless Chromium (Playwright) mit virtueller Zeit:
   Uhr, Timer und Animationsframes laufen nur auf Befehl weiter, Math.random
   ist fest initialisiert. Bei unverändertem Verhalten sind die Bilder
   deshalb bytegleich (auf demselben Rechner). Aufgenommen werden feste
   Ansichten (Desktop, Handy, lokal per file://), alle Exporte (GLB, STL)
   und bei Herz und Nephron der AR-Ablauf: WebXR mit nachgebildetem Gerät und
   AR Quick Look (USDZ). Herz-Kontext szenarien: Krankheitsbilder (3D, Schema, GLB).
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto');
const { execSync } = require('child_process');

function ladePlaywright() {
  try { return require('playwright'); } catch (e) { /* global installiert? */ }
  try { return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch (e) { /* fehlt */ }
  console.error('Playwright fehlt: npm install -g playwright && npx playwright install chromium');
  process.exit(2);
}
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
/* WebGL über SwiftShader; DOM und SVG in Software rastern, ohne Teil-Raster und erst nach allen
   Compositor-Stufen zeichnen – sonst schwanken einzelne Kantenpixel von Lauf zu Lauf */
const CHROMIUM_ARGS = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-rasterization',
  '--disable-partial-raster', '--run-all-compositor-stages-before-draw', '--disable-checker-imaging',
  '--disable-threaded-animation', '--disable-threaded-scrolling', '--disable-new-content-rendering-timeout'];
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/* =====================================================================
   1. Im Browser (vor allen Skripten der Seite)
   ===================================================================== */
/* Virtuelle Zeit: Date, performance.now, Timer und requestAnimationFrame
   laufen nur über __zeit.weiter(ms, frameMs). Frames fallen auf Vielfache
   von frameMs, Timer dazwischen in zeitlicher Reihenfolge. */
function initZeit(opt) {
  const R = { setTimeout: window.setTimeout.bind(window), Date: window.Date };
  let now = 0, seq = 0;
  const timers = new Map(), frames = new Map();
  function FakeDate(...a) {
    if (!new.target) return new R.Date(opt.epoch + now).toString();
    return a.length ? new R.Date(...a) : new R.Date(opt.epoch + now);
  }
  FakeDate.prototype = R.Date.prototype;
  FakeDate.now = () => opt.epoch + now; FakeDate.parse = R.Date.parse; FakeDate.UTC = R.Date.UTC;
  window.Date = FakeDate;
  performance.now = () => now;
  window.setTimeout = (fn, ms, ...args) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, Number(ms) || 0), fn, args }); return id; };
  window.setInterval = (fn, ms, ...args) => { const iv = Math.max(1, Number(ms) || 0), id = ++seq; timers.set(id, { at: now + iv, fn, args, iv }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (fn) => { const id = ++seq; frames.set(id, fn); return id; };
  window.cancelAnimationFrame = (id) => { frames.delete(id); };
  /* echte Pause: Promise-Ketten der Seite laufen zu Ende, bevor der nächste Timer kommt */
  const pause = () => new Promise((r) => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
  const rufe = (fn, args) => { try { if (typeof fn === 'function') fn(...args); else (0, eval)(String(fn)); } catch (e) { R.setTimeout(() => { throw e; }); } };
  async function timerBis(t) {
    for (;;) {
      let best = null, bid = 0;
      for (const [id, tm] of timers) if (tm.at <= t && (!best || tm.at < best.at || (tm.at === best.at && id < bid))) { best = tm; bid = id; }
      if (!best) return;
      now = Math.max(now, best.at);
      if (best.iv) best.at += best.iv; else timers.delete(bid);
      rufe(best.fn, best.args);
      await pause();
    }
  }
  window.__zeit = {
    get now() { return now; },
    async weiter(ms, frameMs) {
      const end = now + ms;
      for (;;) {
        const nf = (Math.floor(now / frameMs) + 1) * frameMs;
        if (nf > end) { await timerBis(end); now = end; return; }
        await timerBis(nf); now = nf;
        const cbs = [...frames.values()]; frames.clear();
        for (const fn of cbs) rufe(fn, [now]);
        await pause();
      }
    }
  };
  /* fester Zufall (mulberry32) */
  let s = opt.seed | 0;
  Math.random = function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  /* gleiche Rechenkerne auf jedem Rechner (das Herz wählt danach die Netzfeinheit) */
  Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => opt.kerne, configurable: true });
}

/* Downloads abfangen: Blob-Links, die per a.click() ausgelöst werden */
function initDownloads() {
  const blobs = new Map(), create = URL.createObjectURL, click = HTMLAnchorElement.prototype.click;
  window.__downloads = [];
  URL.createObjectURL = function (o) { const u = create.call(URL, o); if (o instanceof Blob) blobs.set(u, o); return u; };
  HTMLAnchorElement.prototype.click = function () {
    const href = (this.getAttribute('href') || '').split('#')[0];
    if (blobs.has(href)) { window.__downloads.push({ name: this.download || '', rel: this.rel || '', blob: blobs.get(href) }); return; }
    return click.call(this);
  };
}

/* AR Quick Look: der Browser gibt vor, rel="ar" zu kennen (wie Safari auf iPhone/iPad) */
function initQuickLook() {
  const sup = DOMTokenList.prototype.supports;
  DOMTokenList.prototype.supports = function (t) { return t === 'ar' ? true : sup.call(this, t); };
}

/* WebXR: nachgebildetes AR-Gerät. Kamera 0,9 m vor einer Tischfläche,
   jeder Hit-Test trifft die Fläche; gerendert wird in die normale Leinwand. */
function initWebXR() {
  const eye = [0, 0.30, 0.15], ziel = [0, 0.17, -0.75], hit = [0, 0, -0.75];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const z = nrm(sub(eye, ziel)), x = nrm(crs([0, 1, 0], z)), y = crs(z, x);
  const VIEW = new Float32Array([x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, eye[0], eye[1], eye[2], 1]);
  const HIT = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, hit[0], hit[1], hit[2], 1]);
  function proj(n, f) {
    const t = 1 / Math.tan(27.5 * Math.PI / 180), a = window.innerWidth / window.innerHeight;
    return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  }
  class Sitzung extends EventTarget {
    constructor() {
      super();
      this.renderState = { baseLayer: null, depthNear: 0.1, depthFar: 1000 };
      this.inputSources = []; this.environmentBlendMode = 'alpha-blend'; this.visibilityState = 'visible';
      this.domOverlayState = { type: 'screen' }; this.beendet = false;
    }
    updateRenderState(s) { Object.assign(this.renderState, s); }
    requestReferenceSpace(type) { return Promise.resolve({ type }); }
    requestHitTestSource() { return Promise.resolve({ cancel() {} }); }
    requestAnimationFrame(cb) {
      const s = this;
      return window.requestAnimationFrame((t) => {
        if (s.beendet) return;
        const P = proj(s.renderState.depthNear, s.renderState.depthFar);
        cb(t, {
          session: s,
          getViewerPose() { return { transform: { matrix: VIEW }, views: [{ eye: 'none', transform: { matrix: VIEW }, projectionMatrix: P }] }; },
          getHitTestResults() { return [{ getPose() { return { transform: { matrix: HIT } }; } }]; },
          getPose() { return null; }
        });
      });
    }
    cancelAnimationFrame(id) { window.cancelAnimationFrame(id); }
    end() { if (!this.beendet) { this.beendet = true; this.dispatchEvent(new Event('end')); } return Promise.resolve(); }
  }
  const xr = {
    isSessionSupported: (mode) => Promise.resolve(mode === 'immersive-ar'),
    requestSession(mode, init) {
      init = init || {};
      window.__xrAnfrage = {
        modus: mode, benoetigt: init.requiredFeatures || [], optional: init.optionalFeatures || [],
        overlay: init.domOverlay && init.domOverlay.root ? init.domOverlay.root.id : null,
        nutzergeste: !!(navigator.userActivation && navigator.userActivation.isActive)
      };
      window.__xrSitzung = new Sitzung();
      return Promise.resolve(window.__xrSitzung);
    },
    addEventListener() {}, removeEventListener() {}
  };
  Object.defineProperty(navigator, 'xr', { get: () => xr, configurable: true });
  window.XRWebGLLayer = class {
    constructor(s, gl) { this.gl = gl; this.framebuffer = null; }
    get framebufferWidth() { return this.gl.drawingBufferWidth; }
    get framebufferHeight() { return this.gl.drawingBufferHeight; }
    getViewport() { return { x: 0, y: 0, width: this.gl.drawingBufferWidth, height: this.gl.drawingBufferHeight }; }
  };
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) if (C) C.prototype.makeXRCompatible = () => Promise.resolve();
}

/* =====================================================================
   2. Abläufe je Modell
   ===================================================================== */
const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };
const HANDY = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const MODELLE = {
  herz: {
    datei: 'index.html',
    bereit: () => !!(window.HerzApp && window.HerzApp.ready),
    kontexte: {
      desktop: { opt: DESKTOP, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht'); await t.text();
        await t.export('#bGlbS', 'glb-statisch'); await t.export('#bGlbA', 'glb-animiert'); await t.export('#bStl', 'stl');
        await t.ruhe(6000);
        await t.klick('#cam1'); await t.weiter(900); await t.bild('klappen');
        await t.klick('#cam2'); await t.weiter(900); await t.bild('rechtes-herz');
        await t.klick('#cam3'); await t.weiter(900); await t.bild('linkes-herz');
        await t.klick('#cam0'); await t.klick('#bClosed'); await t.weiter(1400); await t.bild('geschlossen');
        await t.klick('#bSee'); await t.weiter(600); await t.bild('geschlossen-durchsicht');
        await t.klick('#bSee'); await t.klick('#bOpen'); await t.klick('#bLab'); await t.weiter(1400); await t.bild('ohne-beschriftung');
        await t.klick('#bLab'); await t.klick('#row-lv'); await t.weiter(900); await t.bild('info-linke-kammer');
        await t.klick('#bCls'); await t.klick('#bSchema'); await t.weiter(900); await t.bild('schema');
        await t.klick('#bSchemaX'); await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
        await t.klick('#bLupeX'); await t.klick('#bErr'); await t.weiter(900); await t.bild('erregung');
        await t.klick('#bErr'); await t.taste('Escape'); await t.klick('#fLu'); await t.weiter(900); await t.bild('lungenkreislauf');
        await t.klick('#fAll'); await t.klick('#bHand'); await t.klick('#hV'); await t.weiter(900); await t.bild('handbetrieb');
        await t.klick('#bAuto'); await t.klick('#wkS'); await t.weiter(900); await t.bild('aorta-starr');
        await t.klick('#wkE'); await t.taste('Escape');
        await t.klick('#rail .tabs .tab:text-is("Hilfekarten")'); await t.klick('#rail .dis[data-card] >> nth=0'); await t.weiter(600); await t.bild('hilfekarte');
        await t.klick('#rail .tabs .tab:text-is("\u00dcben")'); await t.klick('#bQuiz'); await t.weiter(600); await t.bild('ueben');
        await t.klick('#qStop'); await t.klick('#rail .tabs .tab:text-is("Strukturen")');
        await t.klick('#bAR'); await t.weiter(300); await t.bild('ar-ohne-geraet');
      } },
      handy: { opt: HANDY, async ablauf(t) {          /* ohne Ausschnitt-Knöpfe: die blendet das Handy-Layout aus */
        await t.weiter(1500); await t.bild('uebersicht');
        await t.klick('#bClosed'); await t.weiter(1400); await t.bild('geschlossen');
        await t.klick('#bOpen'); await t.klick('#bSchema'); await t.weiter(1400); await t.bild('schema');
        await t.klick('#bSchemaX'); await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
        await t.klick('#bLupeX'); await t.klick('#row-lv'); await t.weiter(900); await t.bild('info-linke-kammer');
      } },
      szenarien: { opt: DESKTOP, async ablauf(t) {     /* Krankheitsbilder: 3D und Schema je Eintrag, dazu animierter GLB-Export (Linksherzinsuffizienz) */
        await t.weiter(1500); await t.klick('#rail .tabs .tab:text-is("Krankheiten")');
        for (const [name, datei] of [['Linksherzinsuffizienz', 'linksherzinsuffizienz'], ['Rechtsherzinsuffizienz', 'rechtsherzinsuffizienz'], ['Globalinsuffizienz', 'globalinsuffizienz']]) {
          const zeile = '#rail .dis:has(b:text-is("' + name + '"))';
          await t.klick(zeile); await t.weiter(4000); await t.bild(datei);
          await t.klick('#bSchema'); await t.weiter(900); await t.bild(datei + '-schema'); await t.klick('#bSchemaX');
          await t.klick(zeile); await t.weiter(1500);
        }
        await t.klick('#rail .dis:has(b:text-is("Linksherzinsuffizienz"))'); await t.weiter(1500);
        await t.export('#bGlbA', 'glb-animiert-lhi');
        await t.klick('#rail .dis:has(b:text-is("Linksherzinsuffizienz"))'); await t.weiter(1500);
      } },
      datei: { opt: DESKTOP, lokal: true, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
      } },
      webxr: { opt: DESKTOP, init: [initWebXR], async ablauf(t) {
        await t.weiter(1500);
        await t.klick('#bAR'); await t.weiter(600); await t.bild('start');
        await t.js(() => window.__xrSitzung.dispatchEvent(new Event('select'))); await t.weiter(900); await t.bild('platziert');
        await t.klick('#arOpen'); await t.klick('#arLab'); await t.weiter(1400); await t.bild('geschlossen-ohne-beschriftung');
        await t.klick('#arEnd'); await t.weiter(900); await t.bild('beendet');
        t.erg.ar.webxr = await t.js(() => window.__xrAnfrage || null);
      } },
      quicklook: { opt: DESKTOP, init: [initQuickLook], async ablauf(t) {
        await t.weiter(1500);
        await t.export('#bAR', 'ar-quicklook-usdz', 200); await t.bild('vorbereitet');
      } }
    }
  },
  nephron: {
    datei: 'nephron.html',
    bereit: () => document.getElementById('boot').classList.contains('gone'),
    kontexte: {
      desktop: { opt: DESKTOP, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht'); await t.text();
        await t.export('#bGlbS', 'glb-statisch'); await t.export('#bGlbA', 'glb-animiert'); await t.export('#bStl', 'stl');
        await t.ruhe(6000);
        await t.klick('#cam1'); await t.weiter(900); await t.bild('nierenkoerperchen');
        await t.klick('#cam2'); await t.weiter(900); await t.bild('henle-schleife');
        await t.klick('#cam3'); await t.weiter(900); await t.bild('sammelrohr');
        await t.klick('#cam0'); await t.klick('#bSee'); await t.weiter(900); await t.bild('undurchsichtig');
        await t.klick('#bSee'); await t.klick('#bLab'); await t.weiter(600); await t.bild('ohne-beschriftung');
        await t.klick('#bLab'); await t.klick('#paneStruct .row >> nth=0'); await t.weiter(600); await t.bild('info');
        await t.klick('#bCls'); await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
        await t.klick('#lpChips button[data-sec="glom"]'); await t.weiter(900); await t.bild('lupe-glomerulus');
        await t.klick('#bLupeX'); await t.klick('#rail .tabs .tab >> nth=1'); await t.klick('#paneDis .dis >> nth=0'); await t.weiter(1500); await t.bild('hyperglykaemie');
        await t.klick('#rail .tabs .tab >> nth=2'); await t.klick('#paneMed .dis >> nth=0'); await t.weiter(1500); await t.bild('torasemid');
        await t.klick('#bLupe'); await t.weiter(900); await t.bild('torasemid-lupe');
      } },
      handy: { opt: HANDY, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
        await t.klick('#cam1'); await t.weiter(900); await t.bild('nierenkoerperchen');
        await t.klick('#cam0'); await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
      } },
      datei: { opt: DESKTOP, lokal: true, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
      } },
      webxr: { opt: DESKTOP, init: [initWebXR], async ablauf(t) {
        await t.weiter(1500);
        await t.klick('#bAR'); await t.weiter(600); await t.bild('start');
        await t.js(() => window.__xrSitzung.dispatchEvent(new Event('select'))); await t.weiter(900); await t.bild('platziert');
        await t.klick('#arSee'); await t.klick('#arLab'); await t.weiter(1400); await t.bild('undurchsichtig-ohne-beschriftung');
        await t.klick('#arEnd'); await t.weiter(900); await t.bild('beendet');
        t.erg.ar.webxr = await t.js(() => window.__xrAnfrage || null);
      } },
      quicklook: { opt: DESKTOP, init: [initQuickLook], async ablauf(t) {
        await t.weiter(1500);
        await t.export('#bAR', 'ar-quicklook-usdz', 200); await t.bild('vorbereitet');
      } }
    }
  }
};

/* =====================================================================
   3. Aufnehmen
   ===================================================================== */
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary' };
function server(wurzel) {
  return new Promise((res) => {
    const srv = http.createServer((q, r) => {
      const url = decodeURIComponent(q.url.split('?')[0]);
      if (url === '/favicon.ico') { r.writeHead(204); r.end(); return; }
      const p = path.join(wurzel, url);
      if (!p.startsWith(wurzel)) { r.writeHead(403); r.end(); return; }
      fs.readFile(p, (e, b) => {
        if (e) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': TYPEN[path.extname(p)] || 'application/octet-stream' }); r.end(b);
      });
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

/* Konsolenzeilen ohne Treiberrauschen (Adressen, Performance-Hinweise von SwiftShader) */
function normLog(s) { return s.replace(/\[\.WebGL-[^\]]*\]/g, '[.WebGL]').replace(/0x[0-9a-f]{6,}/gi, '0x…'); }
const RAUSCHEN = /GPU stall due to ReadPixels|Automatic fallback to software WebGL|GroupMarkerNotSet/;

async function kontextAufnehmen(browser, ziel, basis, wurzel, mname, M, kname, K, erg) {
  const ctx = await browser.newContext(Object.assign({ locale: 'de-DE', timezoneId: 'Europe/Berlin', reducedMotion: 'no-preference' }, K.opt));
  await ctx.addInitScript(initZeit, { epoch: Date.UTC(2026, 0, 15, 9, 30, 0), seed: 0x2F6FB5, kerne: 8 });
  await ctx.addInitScript(initDownloads);
  for (const f of K.init || []) await ctx.addInitScript(f);
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const log = []; erg.konsole[kname] = log;
  page.on('console', (m) => { const s = m.type() + ': ' + normLog(m.text()); if (!RAUSCHEN.test(s)) log.push(s); });
  page.on('pageerror', (e) => log.push('Seitenfehler: ' + e.message));
  page.on('requestfailed', (q) => log.push('nicht geladen: ' + q.url().replace(basis, '') + ' (' + (q.failure() || {}).errorText + ')'));
  page.on('response', (r) => { if (r.status() >= 400) log.push('nicht geladen: ' + r.url().replace(basis, '') + ' (' + r.status() + ')'); });

  let nr = 0;
  const weiter = (ms, frameMs) => page.evaluate(([a, b]) => window.__zeit.weiter(a, b), [ms, frameMs || 50]);
  const t = {
    erg,
    weiter: (ms) => weiter(ms, 50),
    ruhe: (ms) => weiter(ms, 500),                 /* Zeit verstreichen lassen, wenige Frames */
    klick: (sel) => page.click(sel),
    taste: (k) => page.keyboard.press(k),
    js: (fn, arg) => page.evaluate(fn, arg),
    async bild(name) {
      await page.mouse.move(1, 1);                 /* kein Hover auf dem zuletzt geklickten Knopf */
      const png = await page.screenshot({ animations: 'disabled' });
      const key = kname + '-' + String(++nr).padStart(2, '0') + '-' + name;
      fs.writeFileSync(path.join(ziel, 'bilder', mname + '-' + key + '.png'), png);
      erg.bilder[key] = sha(png);
      process.stdout.write('  ' + mname + '-' + key + '\n');
    },
    async text() { erg.text[kname] = sha(await page.evaluate(() => document.body.innerText)); },
    /* Klick, Zeit bis zum Download (nur virtuelle Timer der Seite), dann echt warten */
    async export(sel, key, virt) {
      const n0 = await page.evaluate(() => window.__downloads.length);
      await page.click(sel); await weiter(virt || 100, 50);
      const t0 = Date.now();
      while (await page.evaluate(() => window.__downloads.length) <= n0) {
        if (Date.now() - t0 > 180000) throw new Error('Export ' + key + ' kam nicht an');
        await warte(100);
      }
      await page.waitForFunction(() => !Array.from(document.querySelectorAll('#bGlbA,#bGlbS,#bStl')).some((b) => b.disabled));
      const d = await page.evaluate(async (i) => {
        const x = window.__downloads[i];
        const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(x.blob); });
        return { name: x.name, rel: x.rel, typ: x.blob.type, url, hinweis: document.getElementById('toast').textContent };
      }, n0);
      const buf = Buffer.from(d.url.slice(d.url.indexOf(',') + 1), 'base64');
      const datei = mname + '-' + key + path.extname(d.name || '') ;
      fs.writeFileSync(path.join(ziel, 'export', datei), buf);
      erg.exporte[key] = { name: d.name, rel: d.rel, typ: d.typ, bytes: buf.length, sha256: sha(buf), hinweis: d.hinweis };
      process.stdout.write('  ' + mname + ' Export ' + key + ': ' + (d.name || '(ohne Namen)') + ', ' + buf.length + ' Bytes\n');
    }
  };
  try {
    const url = K.lokal ? 'file://' + path.join(wurzel, M.datei) : basis + M.datei;
    await page.goto(url);
    const t0 = Date.now();
    while (!(await page.evaluate(M.bereit))) {
      if (Date.now() - t0 > 300000) throw new Error('Seite wurde nicht fertig aufgebaut');
      await weiter(50, 50);
    }
    await K.ablauf(t);
  } catch (e) {
    erg.abbruch[kname] = e.message.split('\n')[0];
    process.stdout.write('  ABBRUCH ' + mname + '-' + kname + ': ' + erg.abbruch[kname] + '\n');
    try { fs.writeFileSync(path.join(ziel, 'bilder', mname + '-' + kname + '-abbruch.png'), await page.screenshot()); } catch (e2) { /* Seite weg */ }
  }
  await ctx.close();
}

async function aufnehmen(ziel, wurzel, nur) {
  const pw = ladePlaywright();
  fs.mkdirSync(path.join(ziel, 'bilder'), { recursive: true });
  fs.mkdirSync(path.join(ziel, 'export'), { recursive: true });
  const srv = await server(wurzel), basis = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: CHROMIUM_ARGS });
  const erg = { quelle: wurzel, browser: browser.version(), modelle: {} };
  const [nurM, nurK] = (nur || '').split(':');
  try {
    for (const mname of Object.keys(MODELLE)) {
      if (nurM && nurM !== mname) continue;
      const M = MODELLE[mname], e = erg.modelle[mname] = { bilder: {}, exporte: {}, ar: {}, text: {}, konsole: {}, abbruch: {} };
      for (const kname of Object.keys(M.kontexte)) {
        if (nurK && nurK !== kname) continue;
        process.stdout.write(mname + ' · ' + kname + '\n');
        await kontextAufnehmen(browser, ziel, basis, wurzel, mname, M, kname, M.kontexte[kname], e);
      }
      const b = e.bilder;
      if (b['datei-01-uebersicht'] && b['desktop-01-uebersicht']) e.lokalWieHttp = b['datei-01-uebersicht'] === b['desktop-01-uebersicht'];
    }
  } finally { await browser.close(); srv.close(); }
  fs.writeFileSync(path.join(ziel, 'ergebnis.json'), JSON.stringify(erg, null, 1));
  let n = 0; for (const m of Object.values(erg.modelle)) n += Object.keys(m.abbruch).length;
  console.log('Fertig: ' + path.join(ziel, 'ergebnis.json') + (n ? ' – ' + n + ' Abbrüche!' : ''));
  return n ? 1 : 0;
}

/* =====================================================================
   4. Vergleichen
   ===================================================================== */
async function pixelDiff(page, a, b) {
  return page.evaluate(async ([ua, ub]) => {
    const lade = async (u) => createImageBitmap(await (await fetch(u)).blob());
    const A = await lade(ua), B = await lade(ub);
    if (A.width !== B.width || A.height !== B.height) return { anders: -1, groesse: [A.width, A.height, B.width, B.height] };
    const W = A.width, H = A.height, ca = new OffscreenCanvas(W, H), cb = new OffscreenCanvas(W, H);
    const xa = ca.getContext('2d'), xb = cb.getContext('2d'); xa.drawImage(A, 0, 0); xb.drawImage(B, 0, 0);
    const da = xa.getImageData(0, 0, W, H), db = xb.getImageData(0, 0, W, H), o = xb.createImageData(W, H);
    let n = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = da.data[i] !== db.data[i] || da.data[i + 1] !== db.data[i + 1] || da.data[i + 2] !== db.data[i + 2] || da.data[i + 3] !== db.data[i + 3];
      if (d) n++;
      o.data[i] = d ? 255 : db.data[i] * 0.3; o.data[i + 1] = d ? 0 : db.data[i + 1] * 0.3; o.data[i + 2] = d ? 0 : db.data[i + 2] * 0.3; o.data[i + 3] = 255;
    }
    xb.putImageData(o, 0, 0);
    const blob = await cb.convertToBlob({ type: 'image/png' });
    const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    return { anders: n, gesamt: W * H, bild: url };
  }, [a, b]);
}

async function vergleichen(va, vb) {
  const A = JSON.parse(fs.readFileSync(path.join(va, 'ergebnis.json'), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(vb, 'ergebnis.json'), 'utf8'));
  const probleme = [], ok = [];
  let page = null, browser = null;
  const durl = (dir, f) => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'bilder', f)).toString('base64');
  for (const m of Object.keys(A.modelle)) {
    const a = A.modelle[m], b = B.modelle[m];
    if (!b) { probleme.push(m + ': fehlt in ' + vb); continue; }
    for (const k of Object.keys(b.abbruch)) probleme.push(m + '-' + k + ': Abbruch – ' + b.abbruch[k]);
    let gleich = 0;
    for (const k of Object.keys(a.bilder)) {
      if (!(k in b.bilder)) { probleme.push(m + '-' + k + ': Bild fehlt'); continue; }
      if (a.bilder[k] === b.bilder[k]) { gleich++; continue; }
      if (!page) { browser = await ladePlaywright().chromium.launch({ executablePath: process.env.CHROMIUM || undefined }); page = await browser.newPage(); }
      const d = await pixelDiff(page, durl(va, m + '-' + k + '.png'), durl(vb, m + '-' + k + '.png'));
      if (d.anders < 0) { probleme.push(m + '-' + k + ': andere Bildgröße ' + d.groesse.join('×')); continue; }
      fs.mkdirSync(path.join(vb, 'diff'), { recursive: true });
      fs.writeFileSync(path.join(vb, 'diff', m + '-' + k + '.png'), Buffer.from(d.bild.slice(d.bild.indexOf(',') + 1), 'base64'));
      probleme.push(m + '-' + k + ': ' + d.anders + ' von ' + d.gesamt + ' Pixeln anders (diff/' + m + '-' + k + '.png)');
    }
    for (const k of Object.keys(b.bilder)) if (!(k in a.bilder)) probleme.push(m + '-' + k + ': neues Bild');
    ok.push(m + ': ' + gleich + ' von ' + Object.keys(a.bilder).length + ' Bildern bytegleich');
    for (const k of Object.keys(a.exporte)) {
      const x = a.exporte[k], y = b.exporte[k];
      if (!y) probleme.push(m + ' Export ' + k + ': fehlt');
      else if (x.sha256 !== y.sha256 || x.name !== y.name) probleme.push(m + ' Export ' + k + ': anders (' + x.name + ' ' + x.bytes + ' B → ' + y.name + ' ' + y.bytes + ' B)');
      else ok.push(m + ' Export ' + k + ': ' + x.name + ' bytegleich (' + x.bytes + ' Bytes)');
    }
    const vgl = (titel, x, y) => { if (JSON.stringify(x) === JSON.stringify(y)) ok.push(m + ' ' + titel + ': gleich'); else probleme.push(m + ' ' + titel + ': anders\n    vorher:  ' + JSON.stringify(x) + '\n    nachher: ' + JSON.stringify(y)); };
    vgl('AR (WebXR-Anfrage)', a.ar, b.ar);
    vgl('Seitentext', a.text, b.text);
    for (const k of new Set(Object.keys(a.konsole).concat(Object.keys(b.konsole)))) vgl('Konsole ' + k, (a.konsole[k] || []).slice().sort(), (b.konsole[k] || []).slice().sort());
    if (b.lokalWieHttp === false) probleme.push(m + ': file:// sieht anders aus als über HTTP');
  }
  if (browser) await browser.close();
  ok.forEach((s) => console.log('  ok    ' + s));
  probleme.forEach((s) => console.log('  ANDERS ' + s));
  console.log(probleme.length ? '\n' + probleme.length + ' Unterschiede.' : '\nKeine Unterschiede.');
  return probleme.length ? 1 : 0;
}

/* =====================================================================
   5. Aufruf
   ===================================================================== */
module.exports = { initZeit, initDownloads, initQuickLook, initWebXR, MODELLE, DESKTOP, HANDY };
if (require.main === module) (async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest.splice(i, 2)[1] : null; };
  const quelle = path.resolve(opt('--quelle') || path.join(__dirname, '..')), nur = opt('--nur');
  if (cmd === 'aufnehmen' && rest[0]) process.exitCode = await aufnehmen(path.resolve(rest[0]), quelle, nur);
  else if (cmd === 'vergleichen' && rest[1]) process.exitCode = await vergleichen(path.resolve(rest[0]), path.resolve(rest[1]));
  else {
    console.log('node tools/vergleich.js aufnehmen <ziel> [--quelle <ordner>] [--nur herz|nephron[:kontext]]');
    console.log('node tools/vergleich.js vergleichen <vorher> <nachher>');
    process.exitCode = 2;
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });
