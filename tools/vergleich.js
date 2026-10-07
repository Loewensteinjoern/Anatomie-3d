#!/usr/bin/env node
/* =====================================================================
   Vergleichsaufnahmen für den Anatomie-Atlas (index.html) mit Körper, Herz, Niere und Nephron

   Prüft, ob die Modelle nach einer Änderung genauso aussehen und
   funktionieren wie vorher. Es gibt keine Einzelseiten mehr: Körper, Herz, Niere und
   Nephron werden im Atlas aufgenommen (index.html ohne Adresse, #herz, #niere, #niere/nephron).

     node tools/vergleich.js aufnehmen <ziel> [--quelle <ordner>] [--nur koerper|herz|niere|nephron|atlas[:kontext]]
     node tools/vergleich.js vergleichen <vorher> <nachher>

   Die Seiten laufen in headless Chromium (Playwright) mit virtueller Zeit:
   Uhr, Timer und Animationsframes laufen nur auf Befehl weiter, Math.random
   ist fest initialisiert. Bei unverändertem Verhalten sind die Bilder
   deshalb bytegleich (auf demselben Rechner). Aufgenommen werden feste
   Ansichten (Desktop, Handy, lokal per file://), alle Exporte (GLB, STL)
   und bei Körper, Herz, Niere und Nephron der AR-Ablauf: WebXR mit nachgebildetem Gerät und
   AR Quick Look (USDZ). Herz-Kontext szenarien: Krankheitsbilder (3D, Schema, GLB).
   In den Modellen koerper, herz, niere und nephron ist der Zurück-Knopf des Atlas ausgeblendet; die
   virtuelle Zeit steht, solange das Organ nachgeladen wird (Bilder sind so unabhängig
   von der Ladezeit und bytegleich zu denen der früheren Einzelseiten).

   Modell koerper (index.html ohne Adresse, Startansicht): desktop (Ganzkörper, die Ausschnitte
   #cam1 bis #cam5, Systemschalter, Auswahl mit Infokarte, ohne Beschriftung, Seitentext), handy,
   datei (file://), webxr, quicklook (AR wie bei Herz und Nephron; Haut und Beschriftung, größer)
   und abbau; keine Exporte GLB/STL (hat der Körper nicht). Der Körper
   lädt das Herz-Skript und den Form-Baustein der Niere im Hintergrund nach; das Nachladen läuft wie bei herz/nephron in echter Zeit.

   Modell niere (index.html#niere): Frontalschnitt der linken Niere, vordere Hälfte abhebbar. Kontexte desktop (Übersicht,
   Seitentext, Exporte GLB statisch und STL, die Ausschnitte #cam1 bis #cam3, geschlossen, Durchsicht, aufgeschnitten,
   ohne Beschriftung, Info), handy, datei (file://), webxr, quicklook (AR wie beim Nephron; Deckel und Beschriftung) und
   abbau; kein animierter Export (keine Strömung).

   Kontext abbau (Körper, Herz, Niere und Nephron): Organ aufbauen, abbauen, mitten im Aufbau
   abbrechen, neu aufbauen und bedienen, wieder abbauen (Kern.organStarten /
   Kern.organBeenden). Gemessen werden nach jedem Abbau Speicher, Szene, DOM und
   Listener (window, document, #cv); die drei Messungen müssen gleich sein. Die
   Bilder dieses Kontexts haben keine Referenz, sie sind nur anzusehen.

   Modell atlas (index.html): Die Kontexte uebergaenge (Körper, Kamerafahrt und Herz über die Infokarte,
   Zurück-Knopf des Browsers mit Rückfahrt, Wechsel, leere Adresse; Messwerte m1 und m2 müssen gleich sein)
   und fehler (unbekannte Adresse, Ladefehler, „Zum Körper“, Neuversuch, am Ende Ladefehler der Herz-CSS
   nach der Kamerafahrt) haben kein Gegenstück und sind nur anzusehen. Zusätzlich wird der Endzustand nach
   Übergängen geprüft (Standbild #uebergang verborgen, keine inline-opacity/pointer-events auf den Kindern
   von #organ, body und Canvas): bei m1/m2 von uebergaenge, im Kontext uebergaenge-niere (Fahrt zur Niere,
   Standbild, Rückfahrt, Nephron und zurück zur Niere, Fahrt in das markierte Nephron und zurück) und in fehler (Standbild nach Fahrt mit Ladefehler verborgen). Die Kontexte weiterleitung und weiterleitung-datei (file://) prüfen die
   alten Adressen nephron.html, atlas.html#herz, atlas.html und index.html#nephron (im Atlas auf
   #niere/nephron umgeleitet; wird frisch geladen, auch wenn davor index.html offen war): Ziel-Adresse muss stimmen,
   das Organ bzw. der Körper muss bereit sein. Erwartete Fehlermeldungen des Kontexts fehler werden
   gesondert gezählt. Mit --nur wird in ein vorhandenes Ziel hineingemischt.
   Kontexte, die nur in <vorher> stehen und im Werkzeug nicht mehr vorkommen (z. B. die
   früheren atlas-herz-desktop usw.), meldet `vergleichen` als entfallen.

   Web-App (Service Worker sw.js, core/offline.js; alle ohne Referenz, nur über http, Kontexte in Atlas):
   offline (Speicher des Service Workers = DATEIEN der sw.js, Name anatomie-<VERSION>; dann ohne Netz
   neu laden: Körper, Herz, Nephron und Niere müssen bereit sein; Bilder nur anzusehen), update (neue Version der
   sw.js wird unterschoben: Hinweis #atlasUpdateBox, Kreuz, erneutes Laden, Klick auf „neu laden“ und
   Speicher der neuen Version; Warten in echter Zeit), update-handy (Lage des Hinweises auf dem Handy)
   und offline-datei (file://: keine Anmeldung, kein Hinweis, keine Konsolenfehler). Außerdem prüft
   `aufnehmen` einmal tools/version.js (Version in sw.js aktuell, Liste vollständig); Ergebnis erg.version.
   Fehlt sw.js in der Quelle (alter Stand), werden diese Kontexte übersprungen.
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

/* Listener zählen (nur Kontext abbau): add/removeEventListener auf window, document und #cv.
   Wie im Browser gilt ein Listener je (Typ, Handler, capture) nur einmal; AbortSignal und once
   werden nicht nachgebildet. __listener() liefert je Ziel die Anzahl je Typ. */
function initListener() {
  const ziele = { window: new Set(), document: new Set(), cv: new Set() };
  const ids = new WeakMap(); let nr = 0;
  const ziel = (o) => o === window ? 'window' : o === document ? 'document' : (o instanceof HTMLCanvasElement && o.id === 'cv') ? 'cv' : null;
  const schluessel = (typ, h, opt) => {
    if (h === null || (typeof h !== 'function' && typeof h !== 'object')) return null;
    if (!ids.has(h)) ids.set(h, ++nr);
    return typ + '|' + ids.get(h) + '|' + !!(opt && typeof opt === 'object' ? opt.capture : opt);
  };
  const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (typ, h, opt) {
    const z = ziel(this), k = z && schluessel(String(typ), h, opt);
    if (k) ziele[z].add(k);
    return add.call(this, typ, h, opt);
  };
  EventTarget.prototype.removeEventListener = function (typ, h, opt) {
    const z = ziel(this), k = z && schluessel(String(typ), h, opt);
    if (k) ziele[z].delete(k);
    return rem.call(this, typ, h, opt);
  };
  window.__listener = () => {
    const r = {};
    for (const z of Object.keys(ziele)) { r[z] = {}; for (const k of [...ziele[z]].sort()) { const typ = k.split('|')[0]; r[z][typ] = (r[z][typ] || 0) + 1; } }
    return r;
  };
}

/* AR Quick Look: der Browser gibt vor, rel="ar" zu kennen (wie Safari auf iPhone/iPad) */
function initQuickLook() {
  const sup = DOMTokenList.prototype.supports;
  DOMTokenList.prototype.supports = function (t) { return t === 'ar' ? true : sup.call(this, t); };
}

/* Atlas: Zurück-Knopf ausblenden, damit Bilder und Seitentext mit der Einzelseite vergleichbar sind */
function initAtlasZurueckAus() {
  const s = document.createElement('style');
  s.textContent = '#atlasZurueck{display:none !important}';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));   /* beim Init-Skript gibt es noch kein <head> */
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

/* Kontext abbau: gemeinsamer Ablauf; bedienung(t) bedient das neu aufgebaute Organ (Modell-spezifisch) */
async function abbauAblauf(t, name, bedienung) {
  await t.weiter(1500);
  if (!(await t.js(() => typeof Kern !== 'undefined' && typeof Kern.organStarten === 'function' && typeof Kern.organBeenden === 'function'))) {
    t.erg.abbau = { m1: 'nicht vorhanden', gleich: null };
    process.stdout.write('  abbau ' + name + ': nicht vorhanden\n');
    return;
  }
  /* Messwerte: Speicher, Szene (nur Rahmen-Objekte), DOM und Listener */
  const messen = () => t.js(() => {
    const R = Kern.Rahmen, info = R.renderer.info, kinder = (id) => { const e = document.getElementById(id); return e ? e.childNodes.length : null; };
    return {
      geometrien: info.memory.geometries, texturen: info.memory.textures, programme: info.programs.length,
      szene: R.szene.children.map((c) => c.type + (c.name ? ':' + c.name : '')),
      organ: kinder('organ'), labels: kinder('labels'), leaders: kinder('leaders'),
      bodyKinder: document.body.childElementCount, bodyKlasse: document.body.className,
      herzApp: typeof window.HerzApp !== 'undefined', koerperApp: typeof window.KoerperApp !== 'undefined', niereApp: typeof window.NiereApp !== 'undefined', listener: window.__listener()
    };
  });
  const beenden = () => t.js(() => Kern.organBeenden());
  await beenden(); const m1 = await messen();
  await t.js((n) => { Kern.organStarten(n); }, name); await t.weiter(50); await beenden(); await t.weiter(2000); const m2 = await messen();
  await t.js((n) => { window.__organFertig = false; Kern.organStarten(n).then(() => { window.__organFertig = true; }); }, name);
  const t0 = Date.now();
  while (!(await t.js(() => window.__organFertig))) {
    if (Date.now() - t0 > 300000) throw new Error('Organ wurde nach dem Neuaufbau nicht fertig');
    await t.weiter(50);
  }
  await t.weiter(1500); await t.bild('neuaufbau');
  await bedienung(t);
  await beenden(); await t.weiter(500); const m3 = await messen();
  const felder = [];
  for (const k of Object.keys(m1)) if (JSON.stringify(m1[k]) !== JSON.stringify(m2[k]) || JSON.stringify(m1[k]) !== JSON.stringify(m3[k])) felder.push(k);
  t.erg.abbau = { m1, m2, m3, gleich: !felder.length };
  process.stdout.write('  abbau ' + name + ': ' + (felder.length ? 'ABWEICHUNG in ' + felder.join(', ') : 'gleich') + '\n');
  if (felder.length) for (const k of felder) process.stdout.write('    ' + k + ': ' + JSON.stringify([m1[k], m2[k], m3[k]]) + '\n');
}

const MODELLE = {
  koerper: {
    datei: 'index.html',
    bereit: () => !!(window.KoerperApp && window.KoerperApp.ready),
    kontexte: {
      desktop: { opt: DESKTOP, async ablauf(t) {
        const sys = (id, m) => t.klick('#sys-' + id + ' .seg button[data-m="' + m + '"]');
        const waehle = (id) => t.js((i) => window.KoerperApp.waehle(i), id);
        await t.weiter(1500); await t.bild('uebersicht'); await t.text();
        for (const [i, name] of [[1, 'kopf-hals'], [2, 'brustkorb'], [3, 'bauch'], [4, 'becken'], [5, 'ruecken']]) {
          await t.klick('#cam' + i); await t.weiter(900); await t.bild(name);
        }
        await t.klick('#cam0'); await t.weiter(900);
        await sys('skelett', 'aus'); await t.weiter(600); await t.bild('skelett-aus'); await t.klick('#bAlle');
        await sys('verdauung', 'glas'); await t.weiter(600); await t.bild('verdauung-glas'); await t.klick('#bAlle');
        await sys('haut', 'aus'); await t.weiter(600); await t.bild('haut-aus'); await t.klick('#bAlle');
        await waehle('herz'); await t.weiter(600); await t.bild('auswahl-herz');
        await waehle('leber'); await t.weiter(600); await t.bild('auswahl-leber');
        await waehle(null); await t.klick('#bLab'); await t.weiter(600); await t.bild('ohne-beschriftung');
      } },
      handy: { opt: HANDY, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
        await t.klick('#cam3'); await t.weiter(900); await t.bild('bauch');
        await t.klick('#cam0'); await t.js(() => window.KoerperApp.waehle('herz')); await t.weiter(900); await t.bild('auswahl-herz');
      } },
      datei: { opt: DESKTOP, lokal: true, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
      } },
      webxr: { opt: DESKTOP, init: [initWebXR], async ablauf(t) {
        await t.weiter(1500);
        await t.klick('#bAR'); await t.weiter(600); await t.bild('start');
        await t.js(() => window.__xrSitzung.dispatchEvent(new Event('select'))); await t.weiter(900); await t.bild('platziert');
        await t.klick('#arHaut'); await t.klick('#arLab'); await t.weiter(1400); await t.bild('ohne-haut-ohne-beschriftung');
        await t.klick('#arLab');
        await t.klick('#arBig'); await t.klick('#arBig'); await t.klick('#arBig'); await t.weiter(900); await t.bild('groesser');
        await t.klick('#arEnd'); await t.weiter(900); await t.bild('beendet');
        t.erg.ar.webxr = await t.js(() => window.__xrAnfrage || null);
      } },
      quicklook: { opt: DESKTOP, init: [initQuickLook], async ablauf(t) {
        await t.weiter(1500);
        await t.export('#bAR', 'ar-quicklook-usdz', 200); await t.bild('vorbereitet');
      } },
      abbau: { opt: DESKTOP, init: [initListener], ablauf: (t) => abbauAblauf(t, 'koerper', async (t) => {
        await t.klick('#cam3'); await t.weiter(900); await t.bild('bauch');
        await t.klick('#cam0'); await t.js(() => window.KoerperApp.waehle('leber')); await t.weiter(600); await t.bild('auswahl-leber');
        await t.klick('#bCls'); await t.weiter(300);
      }) }
    }
  },
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
        /* Aortenklappenstenose: Ausschnitt Klappen in der Systole (Zeit fest) */
        await t.klick('#rail .dis:has(b:text-is("Aortenklappenstenose"))'); await t.weiter(4000);
        await t.klick('#cam1'); await t.weiter(2900); await t.bild('aortenklappenstenose-klappen');
        await t.klick('#cam0'); await t.klick('#rail .dis:has(b:text-is("Aortenklappenstenose"))'); await t.weiter(1500);
        /* Vorhofflimmern: 3D und Erregung */
        await t.klick('#rail .dis:has(b:text-is("Vorhofflimmern"))'); await t.weiter(4000); await t.bild('vorhofflimmern');
        await t.klick('#bErr'); await t.weiter(900); await t.bild('vorhofflimmern-erregung'); await t.klick('#bErr');
        await t.klick('#rail .dis:has(b:text-is("Vorhofflimmern"))'); await t.weiter(1500);
        /* Herzinfarkt: geschlossen, geöffnet, EKG mit ST-Hebung; danach Rückkehr zu den Originalfarben */
        const mi = '#rail .dis:has(b:text-is("Herzinfarkt (Vorderwand)"))';
        await t.klick(mi); await t.klick('#bClosed'); await t.weiter(4000); await t.bild('vorderwandinfarkt');
        await t.klick('#bOpen'); await t.weiter(1400); await t.bild('vorderwandinfarkt-offen');
        await t.klick('#bErr'); await t.weiter(900); await t.bild('vorderwandinfarkt-ekg'); await t.klick('#bErr');
        await t.klick(mi); await t.weiter(1500);
        await t.klick('#bClosed'); await t.weiter(1400); await t.bild('nach-infarkt-geschlossen');
        await t.klick('#bOpen'); await t.weiter(1400);
        /* Medikamente: Metoprolol und Glyceroltrinitrat, danach zurück zu den Krankheiten */
        await t.klick('#rail .tabs .tab:text-is("Medikamente")');
        for (const [name, datei] of [['Beloc-Zok® (Metoprolol)', 'metoprolol'], ['Nitrolingual® (Glyceroltrinitrat)', 'glyceroltrinitrat']]) {
          const zeile = '#rail .dis:has(b:text-is("' + name + '"))';
          await t.klick(zeile); await t.weiter(4000); await t.bild(datei);
          await t.klick(zeile); await t.weiter(1500);
        }
        await t.klick('#rail .tabs .tab:text-is("Krankheiten")');
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
      } },
      abbau: { opt: DESKTOP, init: [initListener], ablauf: (t) => abbauAblauf(t, 'herz', async (t) => {
        await t.klick('#cam1'); await t.weiter(900); await t.bild('klappen');
        await t.klick('#cam0'); await t.klick('#rail .tabs .tab:text-is("Krankheiten")'); await t.klick('#rail .dis:has(b:text-is("Linksherzinsuffizienz"))'); await t.weiter(4000); await t.bild('linksherzinsuffizienz');
        await t.klick('#rail .dis:has(b:text-is("Linksherzinsuffizienz"))'); await t.weiter(1500);
        await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
        await t.klick('#bLupeX'); await t.weiter(300);
      }) }
    }
  },
  niere: {
    datei: 'index.html',
    bereit: () => !!(window.NiereApp && window.NiereApp.ready),
    kontexte: {
      desktop: { opt: DESKTOP, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht'); await t.text();
        await t.export('#bGlbS', 'glb-statisch'); await t.export('#bStl', 'stl');
        await t.ruhe(6000);
        await t.klick('#cam1'); await t.weiter(900); await t.bild('rinde-mark');
        await t.klick('#cam2'); await t.weiter(900); await t.bild('nierenbecken');
        await t.klick('#cam3'); await t.weiter(900); await t.bild('hilus');
        await t.klick('#cam0'); await t.klick('#bZu'); await t.weiter(1400); await t.bild('geschlossen');
        await t.klick('#bSee'); await t.weiter(600); await t.bild('geschlossen-durchsicht');
        await t.klick('#bSee'); await t.klick('#bOffen'); await t.weiter(1400); await t.bild('aufgeschnitten');
        await t.klick('#bLab'); await t.weiter(600); await t.bild('ohne-beschriftung');
        await t.klick('#bLab'); await t.klick('#paneStruct .row >> nth=0'); await t.weiter(600); await t.bild('info');
        await t.js(() => window.NiereApp.waehle('nephron')); await t.weiter(600); await t.bild('auswahl-nephron');   /* Infokarte mit dem Knopf „Nephron ansehen“ */
      } },
      handy: { opt: HANDY, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
        await t.klick('#cam2'); await t.weiter(900); await t.bild('nierenbecken');
        await t.klick('#cam0'); await t.klick('#paneStruct .row >> nth=0'); await t.weiter(600); await t.bild('info');
      } },
      datei: { opt: DESKTOP, lokal: true, async ablauf(t) {
        await t.weiter(1500); await t.bild('uebersicht');
      } },
      webxr: { opt: DESKTOP, init: [initWebXR], async ablauf(t) {
        await t.weiter(1500);
        await t.klick('#bAR'); await t.weiter(600); await t.bild('start');
        await t.js(() => window.__xrSitzung.dispatchEvent(new Event('select'))); await t.weiter(900); await t.bild('platziert');
        await t.klick('#arOffen'); await t.klick('#arLab'); await t.weiter(1400); await t.bild('geschlossen-ohne-beschriftung');
        await t.klick('#arEnd'); await t.weiter(900); await t.bild('beendet');
        t.erg.ar.webxr = await t.js(() => window.__xrAnfrage || null);
      } },
      quicklook: { opt: DESKTOP, init: [initQuickLook], async ablauf(t) {
        await t.weiter(1500);
        await t.export('#bAR', 'ar-quicklook-usdz', 200); await t.bild('vorbereitet');
      } },
      abbau: { opt: DESKTOP, init: [initListener], ablauf: (t) => abbauAblauf(t, 'niere', async (t) => {
        await t.klick('#cam1'); await t.weiter(900); await t.bild('rinde-mark');
        await t.klick('#cam0'); await t.klick('#bZu'); await t.weiter(1400); await t.bild('geschlossen');
        await t.klick('#bOffen'); await t.weiter(300);
      }) }
    }
  },
  nephron: {
    datei: 'index.html',
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
      } },
      abbau: { opt: DESKTOP, init: [initListener], ablauf: (t) => abbauAblauf(t, 'nephron', async (t) => {
        await t.klick('#cam1'); await t.weiter(900); await t.bild('nierenkoerperchen');
        await t.klick('#cam0'); await t.klick('#rail .tabs .tab >> nth=1'); await t.klick('#paneDis .dis >> nth=0'); await t.weiter(1500); await t.bild('hyperglykaemie');
        await t.klick('#bLupe'); await t.weiter(900); await t.bild('lupe');
        await t.klick('#bLupeX'); await t.weiter(300);
      }) }
    }
  }
};

/* Adresse je Modell im Atlas (Teil von index.html ab #): koerper ohne Adresse, nephron gestuft unter der Niere */
const ATLAS_ADRESSE = { koerper: '', herz: '#herz', niere: '#niere', nephron: '#niere/nephron' };
/* Bereitschaft im Atlas; koerper läuft auf index.html (leere Adresse), herz, niere und nephron auf #herz / #niere / #niere/nephron */
const ATLAS_BEREIT = (organ) => ({
  koerper: () => !!(window.KoerperApp && window.KoerperApp.ready) && document.getElementById('boot').classList.contains('gone'),
  herz: () => !!(window.HerzApp && window.HerzApp.ready) && document.getElementById('boot').classList.contains('gone'),
  niere: () => !!(window.NiereApp && window.NiereApp.ready) && document.getElementById('boot').classList.contains('gone'),
  nephron: () => document.getElementById('boot').classList.contains('gone') && !!Kern.Organe.nephron && document.getElementById('organ').childElementCount > 0
})[organ];
const ATLAS_ORGAN_FERTIG = (n) => document.getElementById('boot').classList.contains('gone') && document.getElementById('organ').className === 'organ-' + n && document.getElementById('organ').childElementCount > 0;
const ATLAS_FEHLER = () => !document.getElementById('atlasFehler').hidden;
for (const organ of ['koerper', 'herz', 'niere', 'nephron']) {
  MODELLE[organ].bereit = ATLAS_BEREIT(organ);
  for (const K of Object.values(MODELLE[organ].kontexte)) { K.adresse = ATLAS_ADRESSE[organ]; K.organ = organ; K.init = (K.init || []).concat([initAtlasZurueckAus]); }
}
MODELLE.atlas = { datei: 'index.html', kontexte: {} };
/* Endzustand nach einem Übergang (im Browser): Standbild verborgen und ohne Breite, keine inline-Styles auf Organ-Kindern und Canvas */
const ATLAS_ENDZUSTAND = () => {
  const u = document.getElementById('uebergang'), o = document.getElementById('organ'), c = document.querySelector('canvas');
  return {
    standbild: !u || (u.hidden && u.getBoundingClientRect().width === 0) ? 'verborgen' : 'sichtbar',
    inlineStile: [...o.children].filter((e) => e.style.opacity !== '' || e.style.pointerEvents !== '').length,
    bodyPE: document.body.style.pointerEvents, canvasPE: c ? c.style.pointerEvents : ''
  };
};
const ATLAS_ENDZUSTAND_OK = (z) => z.standbild === 'verborgen' && z.inlineStile === 0 && z.bodyPE === '' && z.canvasPE === '';
/* Kontext uebergaenge: Körper, Herz über die Infokarte, Zurück-Knopf des Browsers (Rückfahrt zur Ganzkörperansicht), Wechsel zwischen den Organen; Messwerte vorher/nachher */
MODELLE.atlas.kontexte.uebergaenge = { opt: DESKTOP, init: [initListener], bereit: () => !!(window.KoerperApp && window.KoerperApp.ready) && document.getElementById('boot').classList.contains('gone'), async ablauf(t) {
  const messen = () => t.js(() => {
    const R = Kern.Rahmen, kinder = (id) => { const e = document.getElementById(id); return e ? e.childNodes.length : null; };
    return {
      geometrien: R ? R.renderer.info.memory.geometries : null, texturen: R ? R.renderer.info.memory.textures : null,
      programme: R ? R.renderer.info.programs.length : null, szene: R ? R.szene.children.map((c) => c.type + (c.name ? ':' + c.name : '')) : null,
      organ: kinder('organ'), organKlasse: document.getElementById('organ').className, labels: kinder('labels'), leaders: kinder('leaders'),
      bodyKinder: [...document.body.children].filter((e) => e.tagName !== 'SCRIPT').length, bodyKlasse: document.body.className,
      titel: document.title, cssLinks: [...document.querySelectorAll('link[data-organ]')].map((l) => l.getAttribute('data-organ')),
      listener: window.__listener()
    };
  }).then(async (m) => Object.assign(m, { endzustand: await t.js(ATLAS_ENDZUSTAND) }));
  const organ = async (n) => { await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, n, n); };
  await t.weiter(500); await t.bild('koerper');
  await t.js(() => window.KoerperApp.waehle('herz')); await t.weiter(300); await t.klick('#iOpen'); await t.weiter(600); await t.bild('fahrt-herz'); await t.bisAdresse('#herz'); await organ('herz'); await t.weiter(1500); await t.bild('herz');
  await t.zurueck(); await organ('koerper'); await t.weiter(1000); await t.bild('rueckfahrt'); await t.weiter(1200); await t.bild('koerper-zurueck');
  const m1 = await messen();
  await t.js(() => { location.hash = 'niere/nephron'; }); await organ('nephron'); await t.weiter(1500); await t.bild('nephron');
  await t.js(() => { location.hash = 'herz'; }); await organ('herz'); await t.bild('herz-nach-nephron');
  await t.js(() => { location.hash = 'niere/nephron'; location.hash = 'herz'; }); await organ('herz'); await t.bild('herz-schnell');
  await t.js(() => { location.hash = ''; }); await organ('koerper'); await t.weiter(2200);
  const m2 = await messen();
  const felder = Object.keys(m1).filter((k) => JSON.stringify(m1[k]) !== JSON.stringify(m2[k]));
  const endOk = ATLAS_ENDZUSTAND_OK(m1.endzustand) && ATLAS_ENDZUSTAND_OK(m2.endzustand);
  t.erg.uebergaenge = { m1, m2, gleich: !felder.length, endzustandOk: endOk };
  process.stdout.write('  uebergaenge: ' + (felder.length ? 'ABWEICHUNG in ' + felder.join(', ') : 'gleich') + (endOk ? '' : ' – ABWEICHUNG Endzustand: ' + JSON.stringify([m1.endzustand, m2.endzustand])) + '\n');
  for (const k of felder) process.stdout.write('    ' + k + ': ' + JSON.stringify([m1[k], m2[k]]) + '\n');
} };
/* Kontext uebergaenge-niere: Körper, Niere wählen, Kamerafahrt, Standbild beim Aufbau der Niere, Rückfahrt; dann Nephron über die Adresse
   (Zurück-Knopf „← Niere“) und mit dem Zurück-Knopf des Atlas zurück zur Niere; dann das markierte Nephron (Knopf „Nephron ansehen“, Kamerafahrt,
   Nephron, Browser-Zurück mit Rückfahrt der Niere); Endzustand prüfen */
MODELLE.atlas.kontexte['uebergaenge-niere'] = { opt: DESKTOP, init: [initListener], bereit: () => !!(window.KoerperApp && window.KoerperApp.ready) && document.getElementById('boot').classList.contains('gone'), async ablauf(t) {
  const organ = async (n) => { await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, n, n); };
  await t.weiter(500);
  await t.js(() => window.KoerperApp.waehle('nieren')); await t.weiter(300); await t.klick('#iOpen'); await t.weiter(600); await t.bild('fahrt-niere'); await t.bisAdresse('#niere');
  await organ('niere'); await t.bild('standbild');
  await t.weiter(1500); await t.bild('niere');
  await t.zurueck(); await organ('koerper'); await t.weiter(1000); await t.bild('rueckfahrt'); await t.weiter(1200); await t.bild('koerper-zurueck');
  const z1 = await t.js(ATLAS_ENDZUSTAND);
  await t.js(() => { location.hash = 'niere/nephron'; }); await organ('nephron'); await t.weiter(1500); await t.bild('nephron');   /* Zurück-Knopf zeigt „← Niere“ */
  await t.klick('#atlasZurueck'); await organ('niere'); await t.weiter(1500); await t.bild('niere-von-nephron');
  await t.weiter(1500);   /* Rückfahrt der Niere ist zu Ende */
  const z2 = await t.js(ATLAS_ENDZUSTAND);
  /* Zoomstufe: markiertes Nephron in der Niere wählen, „Nephron ansehen“ (Kamerafahrt in das Nephron), Nephron, Browser-Zurück (Niere startet im Nahbild, Rückfahrt) */
  await t.js(() => window.NiereApp.waehle('nephron')); await t.weiter(300); await t.klick('#iOpen'); await t.weiter(600); await t.bild('fahrt-nephron'); await t.bisAdresse('#niere/nephron');
  await organ('nephron'); await t.bild('standbild-nephron');
  await t.weiter(1500); await t.bild('nephron-von-niere');
  await t.zurueck(); await organ('niere'); await t.weiter(1000); await t.bild('rueckfahrt-niere'); await t.weiter(1200); await t.bild('niere-zurueck');
  const z3 = await t.js(ATLAS_ENDZUSTAND);
  const ok = ATLAS_ENDZUSTAND_OK(z1) && ATLAS_ENDZUSTAND_OK(z2) && ATLAS_ENDZUSTAND_OK(z3);
  t.erg.uebergaengeNiere = { endzustand: [z1, z2, z3], ok };
  process.stdout.write('  uebergaenge-niere: ' + (ok ? 'Endzustand gleich (Standbild weg, keine inline-Styles)' : 'ABWEICHUNG Endzustand: ' + JSON.stringify([z1, z2, z3])) + '\n');
} };
/* Kontext fehler: unbekannte Adresse, Ladefehler (Skript abgebrochen), Neuversuch; erwartete Meldungen werden gesondert gezählt */
MODELLE.atlas.kontexte.fehler = { opt: DESKTOP, adresse: '#gibtsnicht', bereit: ATLAS_FEHLER,
  erwartet: [/Unbekanntes Organ: gibtsnicht/, /konnte nicht geladen werden/, /^nicht geladen: organe\/herz\/herz\.js \(net::ERR_FAILED\)/, /^error: Failed to load resource: net::ERR_FAILED/, /^nicht geladen: organe\/herz\/herz\.css \(net::ERR_FAILED\)/],
  async ablauf(t) {
    await t.weiter(300); await t.bild('unbekannt');
    await t.blockiere('**/organe/herz/herz.js');
    await t.js(() => { location.hash = 'herz'; }); await t.echt(300);
    await t.warteAuf(() => !document.getElementById('atlasFehler').hidden && /Herz/.test(document.getElementById('atlasFehlerText').textContent));
    await t.weiter(300); await t.bild('ladefehler');
    await t.freigeben('**/organe/herz/herz.js');
    await t.klick('#atlasFehlerZurueck'); await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, 'koerper', 'koerper'); await t.weiter(500); await t.bild('koerper-nach-fehler');
    await t.js(() => { location.hash = 'herz'; }); await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, 'herz', 'herz'); await t.weiter(1500); await t.bild('herz-nach-fehler');
    /* Ladefehler nach der Kamerafahrt: die Stylesheet-Datei des Herzens wird erst beim Öffnen geladen (das Skript lädt der Körper schon) */
    await t.js(() => { location.hash = ''; }); await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, 'koerper', 'koerper'); await t.weiter(2200);
    await t.blockiere('**/organe/herz/herz.css');
    await t.js(() => window.KoerperApp.waehle('herz')); await t.weiter(300); await t.klick('#iOpen'); await t.bisAdresse('#herz');
    await t.echt(300);
    await t.warteAuf(ATLAS_FEHLER);
    await t.weiter(300); await t.bild('fehler-nach-fahrt');
    const z = await t.js(ATLAS_ENDZUSTAND);
    t.erg.fehlerNachFahrt = { endzustand: z, ok: z.standbild === 'verborgen' };
    process.stdout.write('  fehler-nach-fahrt: ' + (z.standbild === 'verborgen' ? 'Standbild verborgen' : 'ABWEICHUNG Standbild sichtbar') + '\n');
    await t.freigeben('**/organe/herz/herz.css');
    await t.klick('#atlasFehlerZurueck'); await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, 'koerper', 'koerper'); await t.weiter(500); await t.bild('koerper-nach-fahrtfehler');
  } };
/* Kontexte weiterleitung / weiterleitung-datei: die alten Adressen leiten auf die aktuellen in index.html weiter */
const WEITERLEITUNG = { async ablauf(t) {
  const faelle = [['nephron.html', 'index.html#niere/nephron', 'nephron', 'nephron'], ['atlas.html#herz', 'index.html#herz', 'herz', 'herz'], ['atlas.html', 'index.html', 'koerper', 'koerper'],
    ['index.html#nephron', 'index.html#niere/nephron', 'nephron', 'nephron-alte-adresse']];   /* alte Adresse im Atlas selbst; am Ende, damit die Bildnummern der übrigen Fälle gleich bleiben */
  const res = {}; let gleich = true;
  for (const [von, soll, organ, bild] of faelle) {
    await t.gehe(von);
    await t.warteUrl(/index\.html/);
    await t.warteAuf(ATLAS_BEREIT(organ), organ);
    await t.weiter(1500); await t.bild(bild);
    const ist = t.url(); res[von] = ist; if (ist !== soll) gleich = false;
    process.stdout.write('  ' + von + ' -> ' + ist + (ist === soll ? '' : ' (erwartet ' + soll + ')') + '\n');
  }
  t.erg.weiterleitung = Object.assign(t.erg.weiterleitung || {}, { [t.kname]: { ziele: res, gleich } });
} };
MODELLE.atlas.kontexte.weiterleitung = { opt: DESKTOP, ohneStart: true, ablauf: WEITERLEITUNG.ablauf };
MODELLE.atlas.kontexte['weiterleitung-datei'] = { opt: DESKTOP, lokal: true, ohneStart: true, ablauf: WEITERLEITUNG.ablauf };

/* Web-App: Service Worker (sw.js), Offline-Speicher, Hinweis auf neue Version (core/offline.js); alle ohne Referenz */
const swQuelle = (wurzel) => fs.readFileSync(path.join(wurzel, 'sw.js'), 'utf8');
const swDateien = (sw) => { const l = /var DATEIEN = \[([\s\S]*?)\];/.exec(sw); const r = [], re = /'([^']+)'/g; let m; while ((m = re.exec(l[1]))) r.push(m[1]); return r; };
const swVersion = (sw) => /var VERSION = '([^']*)';/.exec(sw)[1];
const UPDATE_SICHTBAR = () => { const b = document.getElementById('atlasUpdateBox'); return !!b && !b.hidden && b.getBoundingClientRect().width > 0 && getComputedStyle(b).display !== 'none'; };
/* in echter Zeit warten, bis fn() im Browser wahr ist (die virtuelle Zeit steht; Fehler beim Neuladen werden übergangen) */
async function echtWarten(t, fn, was, ms) {
  const t0 = Date.now();
  for (;;) {
    let w = false; try { w = await t.js(fn); } catch (e) { /* Seite lädt gerade */ }
    if (w) return;
    if (Date.now() - t0 > (ms || 30000)) throw new Error('Zeitüberschreitung: ' + was);
    await t.echt(100);
  }
}
const WORKER_BEREIT = (t) => t.js(async () => { await navigator.serviceWorker.ready; return true; });
const KOERPER_BEREIT = (t) => t.warteAuf(ATLAS_BEREIT('koerper'), 'koerper');
/* Gemeinsamer Anfang von update/update-handy: Worker bereit, neu laden (kontrolliert), neue Version unterschieben, Hinweis abwarten */
async function updateBisHinweis(t, s) {
  await WORKER_BEREIT(t);
  await t.neuLaden(); await KOERPER_BEREIT(t);
  s.controller = await t.js(() => !!navigator.serviceWorker.controller);
  s.hinweisAnfangs = !(await t.js(UPDATE_SICHTBAR));
  const sw = swQuelle(t.wurzel), neu = sw.replace(/var VERSION = '[^']*';/, "var VERSION = '" + swVersion(sw) + "-neu';");
  s.versionNeu = neu !== sw;
  t.swErsetzen(neu);
  await t.js(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.update(); });
  await echtWarten(t, UPDATE_SICHTBAR, 'Hinweis auf neue Version');
  s.hinweisSichtbar = true;
  await t.weiter(300); await t.bild('hinweis');
}
/* Kontext offline: Speicher des Service Workers prüfen, ohne Netz neu laden, Körper/Herz/Nephron/Niere öffnen */
MODELLE.atlas.kontexte.offline = { opt: DESKTOP, braucht: 'sw.js', bereit: ATLAS_BEREIT('koerper'), async ablauf(t) {
  const sw = swQuelle(t.wurzel), soll = swDateien(sw), name = 'anatomie-' + swVersion(sw);
  await t.js(async () => { await navigator.serviceWorker.ready; });
  const speicher = await t.js(async () => {
    const namen = await caches.keys(), basis = location.pathname.replace(/[^/]*$/, ''), r = {};
    for (const n of namen) {
      const c = await caches.open(n), ks = await c.keys();
      r[n] = ks.map((q) => { const p = new URL(q.url).pathname; return p === basis ? './' : p.slice(basis.length); }).sort();
    }
    return { namen, eintraege: r };
  });
  const dateienOk = JSON.stringify(speicher.namen) === JSON.stringify([name]) && JSON.stringify(speicher.eintraege[name]) === JSON.stringify(soll.slice().sort());
  await t.offline(true); await t.neuLaden(); await KOERPER_BEREIT(t);
  const controller = await t.js(() => !!navigator.serviceWorker.controller);
  await t.weiter(1500); await t.bild('koerper');
  const organe = { koerper: true };
  const oeffne = async (n) => {
    await t.js((h) => { location.hash = h; }, ATLAS_ADRESSE[n]);
    await t.echt(100); await t.warteAuf(ATLAS_ORGAN_FERTIG, n, n); await t.warteAuf(ATLAS_BEREIT(n), n);
    await t.weiter(1500); await t.bild(n);
    organe[n] = await t.js(ATLAS_BEREIT(n)) === true;
  };
  await oeffne('herz'); await oeffne('nephron'); await oeffne('niere');
  await t.offline(false);
  const ok = dateienOk && controller && organe.koerper && organe.herz && organe.nephron && organe.niere;
  t.erg.offline = { speicher: { namen: speicher.namen, anzahl: (speicher.eintraege[name] || []).length, erwartet: soll.length, fehlt: soll.filter((d) => !(speicher.eintraege[name] || []).includes(d)), zuviel: (speicher.eintraege[name] || []).filter((d) => !soll.includes(d)) }, dateienOk, controller, organe, ok };
  process.stdout.write('  offline: ' + (ok ? 'Speicher ' + name + ' mit ' + soll.length + ' Dateien, offline Körper/Herz/Nephron/Niere bereit' : 'ABWEICHUNG ' + JSON.stringify(t.erg.offline)) + '\n');
} };
/* Kontext update: neue Version der sw.js unterschieben, Hinweis, Kreuz, erneutes Laden, Klick auf „neu laden“ */
MODELLE.atlas.kontexte.update = { opt: DESKTOP, braucht: 'sw.js', bereit: ATLAS_BEREIT('koerper'), async ablauf(t) {
  const s = {};
  await updateBisHinweis(t, s);
  await t.js(() => { window.__merker = 1; });
  await t.klick('#atlasUpdateZu');
  s.kreuzVerbirgt = !(await t.js(UPDATE_SICHTBAR));
  s.kreuzOhneNeuladen = (await t.js(() => window.__merker === 1));
  await t.neuLaden(); await KOERPER_BEREIT(t);
  await echtWarten(t, UPDATE_SICHTBAR, 'Hinweis nach erneutem Laden');
  s.hinweisNachNeuladen = true;
  await t.js(() => { window.__merker = 1; });
  await t.klick('#atlasUpdate');
  await echtWarten(t, () => window.__merker === undefined, 'Neuladen nach Klick');
  await KOERPER_BEREIT(t);
  const name = 'anatomie-' + swVersion(swQuelle(t.wurzel)) + '-neu';
  await echtWarten(t, async () => (await caches.keys()).length === 1, 'alter Speicher gelöscht');
  s.speicherNeu = JSON.stringify(await t.js(() => caches.keys())) === JSON.stringify([name]);
  s.hinweisWeg = !(await t.js(UPDATE_SICHTBAR));
  t.swErsetzen(null);
  const ok = Object.values(s).every((v) => v === true);
  t.erg.update = { schritte: s, ok };
  process.stdout.write('  update: ' + (ok ? 'alle Schritte in Ordnung' : 'ABWEICHUNG ' + JSON.stringify(s)) + '\n');
} };
/* Kontext update-handy: Lage des Hinweises auf dem Handy (nur bis zum Bild) */
MODELLE.atlas.kontexte['update-handy'] = { opt: HANDY, braucht: 'sw.js', bereit: ATLAS_BEREIT('koerper'), async ablauf(t) {
  const s = {};
  await updateBisHinweis(t, s);
  s.imBild = await t.js(() => { const r = document.getElementById('atlasUpdateBox').getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
  t.swErsetzen(null);
  const ok = Object.values(s).every((v) => v === true);
  t.erg.updateHandy = { schritte: s, ok };
  process.stdout.write('  update-handy: ' + (ok ? 'Hinweis sichtbar und im Bild' : 'ABWEICHUNG ' + JSON.stringify(s)) + '\n');
} };
/* Kontext offline-datei: per file:// keine Anmeldung, kein Hinweis, keine Konsolenfehler (die Konsole wird aufgezeichnet) */
MODELLE.atlas.kontexte['offline-datei'] = { opt: DESKTOP, lokal: true, bereit: ATLAS_BEREIT('koerper'), async ablauf(t) {
  await t.weiter(500);
  const z = await t.js(() => ({
    anmeldungNull: Kern.Offline.anmeldung === null,
    hinweisVerborgen: !(() => { const b = document.getElementById('atlasUpdateBox'); return !!b && !b.hidden && b.getBoundingClientRect().width > 0; })(),
    manifest: !!document.querySelector('link[rel=manifest]'),
    kontrolliert: !!(navigator.serviceWorker && navigator.serviceWorker.controller)
  }));
  const ok = z.anmeldungNull && z.hinweisVerborgen && !z.kontrolliert;
  t.erg.offlineDatei = Object.assign({ ok }, z);
  process.stdout.write('  offline-datei: ' + (ok ? 'keine Anmeldung, kein Hinweis' : 'ABWEICHUNG ' + JSON.stringify(z)) + '\n');
} };

/* =====================================================================
   3. Aufnehmen
   ===================================================================== */
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary',
  '.webmanifest': 'application/manifest+json' };
let swErsatz = null;   /* Text, den der Server statt sw.js liefert (Kontext update); context.route erfasst den Abruf des Service Workers nicht */
function server(wurzel) {
  return new Promise((res) => {
    const srv = http.createServer((q, r) => {
      const url = decodeURIComponent(q.url.split('?')[0]);
      if (url === '/favicon.ico') { r.writeHead(204); r.end(); return; }
      if (swErsatz !== null && url === '/sw.js') { r.writeHead(200, { 'Content-Type': TYPEN['.js'], 'Cache-Control': 'no-cache' }); r.end(swErsatz); return; }
      const p = path.join(wurzel, url.endsWith('/') ? url + 'index.html' : url);   /* './' im Offline-Speicher */
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
  swErsatz = null;
  const ctx = await browser.newContext(Object.assign({ locale: 'de-DE', timezoneId: 'Europe/Berlin', reducedMotion: 'no-preference' }, K.opt));
  await ctx.addInitScript(initZeit, { epoch: Date.UTC(2026, 0, 15, 9, 30, 0), seed: 0x2F6FB5, kerne: 8 });
  await ctx.addInitScript(initDownloads);
  for (const f of K.init || []) await ctx.addInitScript(f);
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const log = []; erg.konsole[kname] = log;
  /* erwartete Meldungen (nur Kontext fehler) werden gesondert gezählt */
  const melde = (s) => { if (K.erwartet && K.erwartet.some((re) => re.test(s))) { const x = erg.erwartet || (erg.erwartet = {}); x[kname] = (x[kname] || 0) + 1; } else log.push(s); };
  page.on('console', (m) => { const s = m.type() + ': ' + normLog(m.text()); if (!RAUSCHEN.test(s)) melde(s); });
  page.on('pageerror', (e) => melde('Seitenfehler: ' + e.message));
  page.on('requestfailed', (q) => melde('nicht geladen: ' + q.url().replace(basis, '') + ' (' + (q.failure() || {}).errorText + ')'));
  page.on('response', (r) => { if (r.status() >= 400) melde('nicht geladen: ' + r.url().replace(basis, '') + ' (' + r.status() + ')'); });

  let nr = 0;
  const weiter = (ms, frameMs) => page.evaluate(([a, b]) => window.__zeit.weiter(a, b), [ms, frameMs || 50]);
  const t = {
    erg, kname, wurzel,
    offline: (an) => ctx.setOffline(an),
    neuLaden: () => page.reload(),
    route: (muster, fn) => page.context().route(muster, fn),      /* Kontext-Route: erfasst auch den Service Worker */
    unroute: (muster) => page.context().unroute(muster),
    swErsetzen: (text) => { swErsatz = text; },    /* sw.js vom Server ersetzen (null = Datei der Quelle) */
    /* ändert sich nur das Fragment (#…), wäre es eine Navigation im selben Dokument ohne Neuladen; dann erst über about:blank,
       damit die Seite frisch lädt (wie ein Lesezeichen) */
    async gehe(rel) {
      const adr = (K.lokal ? 'file://' + wurzel + '/' : basis) + rel;
      if (page.url().split('#')[0] === new URL(adr).href.split('#')[0]) await page.goto('about:blank');
      return page.goto(adr);
    },
    url: () => page.url().replace(K.lokal ? 'file://' + wurzel + '/' : basis, ''),
    warteUrl: (re) => page.waitForURL(re),
    weiter: (ms) => weiter(ms, 50),
    ruhe: (ms) => weiter(ms, 500),                 /* Zeit verstreichen lassen, wenige Frames */
    klick: (sel) => page.click(sel),
    echt: warte,                                   /* echte Zeit, die virtuelle steht (Atlas: Nachladen) */
    zurueck: () => page.goBack(),
    /* virtuelle Zeit in 50-ms-Schritten vorrücken, bis die Kamerafahrt die Adresse gesetzt hat, und sofort anhalten
       (sonst hinge die Herzphase davon ab, wie lange das Organ in echter Zeit nachlädt) */
    async bisAdresse(hash, maxMs) {
      for (let ms = 0; ms <= (maxMs || 3000); ms += 50) {
        if (await page.evaluate((h) => location.hash === h, hash)) return;
        await weiter(50, 50);
      }
      throw new Error('Adresse ' + hash + ' wurde nicht gesetzt');
    },
    blockiere: (muster) => page.route(muster, (r) => r.abort()),
    freigeben: (muster) => page.unroute(muster),
    /* warten, bis fn(arg) wahr ist; ist organ gesetzt, zuerst in echter Zeit, bis dessen Skript und CSS
       nachgeladen sind (die virtuelle Zeit steht, sonst hinge der Aufbau von der Ladezeit ab) */
    async warteAuf(fn, organ, arg) {
      const t0 = Date.now(), zu = () => { if (Date.now() - t0 > 300000) throw new Error('Seite wurde nicht fertig aufgebaut'); };
      if (organ) while (!(await page.evaluate((n) => { const l = document.querySelector('link[data-organ="' + n + '"]'); return !!(Kern.Organe[n] && l && l.getAttribute('data-geladen')); }, organ))) { zu(); await warte(20); }
      while (!(await page.evaluate(fn, arg))) { zu(); await weiter(50, 50); }
    },
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
      if (K.exportPraefix) key = kname + '-' + key;
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
    if (!K.ohneStart) {
      const url = (K.lokal ? 'file://' + path.join(wurzel, M.datei) : basis + M.datei) + (K.adresse || '');
      await page.goto(url);
      await t.warteAuf(K.bereit || M.bereit, K.organ);
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
  let erg = { quelle: wurzel, browser: browser.version(), modelle: {} };
  const [nurM, nurK] = (nur || '').split(':');
  /* mit --nur wird in ein vorhandenes Ergebnis hineingemischt (Einzelseite und Atlas getrennt aufnehmen) */
  const alt = path.join(ziel, 'ergebnis.json');
  if (nur && fs.existsSync(alt)) { erg = JSON.parse(fs.readFileSync(alt, 'utf8')); erg.quelle = wurzel; erg.browser = browser.version(); }
  /* Version des Service Workers (nur wenn die Quelle tools/version.js hat) */
  const vd = path.join(wurzel, 'tools', 'version.js');
  if ((!nurM || nurM === 'atlas') && fs.existsSync(vd) && fs.existsSync(path.join(wurzel, 'sw.js'))) {
    try {
      const v = require(vd).pruefen();
      erg.version = { ok: !!v.ok, version: v.version, erwartet: v.erwartet, fehler: v.fehler };
    } catch (e) { erg.version = { ok: false, version: null, erwartet: null, fehler: [e.message] }; }
    process.stdout.write('version.js: ' + (erg.version.ok ? 'Version ' + erg.version.version + ' aktuell' : 'ABWEICHUNG ' + JSON.stringify(erg.version)) + '\n');
  }
  try {
    for (const mname of Object.keys(MODELLE)) {
      if (nurM && nurM !== mname) continue;
      const M = MODELLE[mname];
      if (!fs.existsSync(path.join(wurzel, M.datei))) { process.stdout.write(mname + ' · übersprungen (' + M.datei + ' fehlt)\n'); continue; }
      const e = erg.modelle[mname] || (erg.modelle[mname] = { bilder: {}, exporte: {}, ar: {}, text: {}, konsole: {}, abbruch: {} });
      for (const kname of Object.keys(M.kontexte)) {
        if (nurK && nurK !== kname) continue;
        if (M.kontexte[kname].braucht && !fs.existsSync(path.join(wurzel, M.kontexte[kname].braucht))) { process.stdout.write(mname + ' · ' + kname + ' · übersprungen (' + M.kontexte[kname].braucht + ' fehlt)\n'); continue; }
        for (const k of Object.keys(e.bilder)) if (k.startsWith(kname + '-') && !Object.keys(M.kontexte).some((x) => x !== kname && x.startsWith(kname + '-') && k.startsWith(x + '-'))) delete e.bilder[k];   /* frühere Aufnahme dieses Kontexts ersetzen */
        delete e.text[kname]; delete e.abbruch[kname]; if (e.erwartet) delete e.erwartet[kname];
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
  if (B.version) {
    if (!B.version.ok) probleme.push('Version des Service Workers veraltet oder Liste unvollständig – node tools/version.js\n    ' + JSON.stringify(B.version));
    else ok.push('Version des Service Workers: aktuell (' + B.version.version + ')');
  }
  let page = null, browser = null;
  const durl = (dir, f) => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'bilder', f)).toString('base64');
  const diffBild = async (ka, kb, name, titel) => {   /* zwei Bilder aus <nachher> vergleichen; Diff nach diff/<name>.png */
    if (!page) { browser = await ladePlaywright().chromium.launch({ executablePath: process.env.CHROMIUM || undefined }); page = await browser.newPage(); }
    const d = await pixelDiff(page, durl(vb, ka + '.png'), durl(vb, kb + '.png'));
    if (d.anders < 0) { probleme.push(titel + ': andere Bildgröße ' + d.groesse.join('×')); return; }
    fs.mkdirSync(path.join(vb, 'diff'), { recursive: true });
    fs.writeFileSync(path.join(vb, 'diff', name + '.png'), Buffer.from(d.bild.slice(d.bild.indexOf(',') + 1), 'base64'));
    probleme.push(titel + ': ' + d.anders + ' von ' + d.gesamt + ' Pixeln anders (diff/' + name + '.png)');
  };
  for (const m of new Set(Object.keys(A.modelle).concat(Object.keys(B.modelle)))) {
    const neuM = !A.modelle[m] && !!B.modelle[m];       /* Modell nur in <nachher>: keine Referenz */
    let a = A.modelle[m] || { bilder: {}, exporte: {}, ar: {}, text: {}, konsole: {}, abbruch: {} }; const b = B.modelle[m];
    if (!b) { probleme.push(m + ': fehlt in ' + vb); continue; }
    /* Kontexte, die nur in <vorher> stehen und im Werkzeug nicht mehr vorkommen: entfallen, kein Unterschied */
    if (MODELLE[m]) {
      const alle = Object.keys(a.konsole).filter((x) => !(x in MODELLE[m].kontexte)).sort((x, y) => y.length - x.length);
      const entf = (k) => alle.find((x) => k === x || k.startsWith(x + '-'));
      const fil = (o) => { const r = {}; for (const k of Object.keys(o)) if (!entf(k)) r[k] = o[k]; return r; };
      for (const x of alle.slice().sort()) ok.push(m + '-' + x + ': entfallen (nur in Referenz)');
      a = Object.assign({}, a, { bilder: fil(a.bilder), exporte: fil(a.exporte), text: fil(a.text), konsole: fil(a.konsole) });
    }
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
    /* Kontexte ohne Aufnahme in <vorher> (z. B. abbau, oder dort ohne Bilder aufgenommen) haben keine Referenz: nur listen */
    const kontextVon = (k) => { const n = Object.keys((MODELLE[m] || { kontexte: {} }).kontexte).filter((x) => k.startsWith(x + '-')).sort((x, y) => y.length - x.length)[0]; return n || k.split('-')[0]; };
    const neuK = (k) => !Object.keys(a.bilder).some((x) => kontextVon(x) === kontextVon(k));
    for (const k of Object.keys(b.bilder)) if (!(k in a.bilder)) { if (neuK(k)) ok.push(m + '-' + k + ': neu (keine Referenz)'); else probleme.push(m + '-' + k + ': neues Bild'); }
    if (b.uebergaenge) {
      if (b.uebergaenge.gleich === false) probleme.push(m + ' Übergänge: Messwerte unterscheiden sich\n    ' + JSON.stringify(b.uebergaenge));
      else ok.push(m + ' Übergänge: Messwerte gleich (kein Gegenstück)');
      if (b.uebergaenge.endzustandOk === false) probleme.push(m + ' Übergänge: Endzustand falsch (Standbild sichtbar oder inline-Styles)\n    ' + JSON.stringify([b.uebergaenge.m1.endzustand, b.uebergaenge.m2.endzustand]));
    }
    for (const [k, tx] of [['uebergaengeNiere', 'Übergänge Niere'], ['fehlerNachFahrt', 'Fehler nach Fahrt']]) {
      if (!b[k]) continue;
      if (!b[k].ok) probleme.push(m + ' ' + tx + ': Endzustand falsch\n    ' + JSON.stringify(b[k].endzustand));
      else ok.push(m + ' ' + tx + ': Endzustand stimmt');
    }
    for (const [k, w] of Object.entries(b.weiterleitung || {})) {
      if (!w.gleich) probleme.push(m + ' Weiterleitung ' + k + ': falsches Ziel\n    ' + JSON.stringify(w.ziele));
      else if (a.weiterleitung && a.weiterleitung[k] && JSON.stringify(a.weiterleitung[k].ziele) !== JSON.stringify(w.ziele)) probleme.push(m + ' Weiterleitung ' + k + ': Ziele anders');
      else ok.push(m + ' Weiterleitung ' + k + ': Ziele stimmen');
    }
    for (const [k, tx] of [['offline', 'Offline'], ['update', 'Update'], ['updateHandy', 'Update (Handy)'], ['offlineDatei', 'Offline (file://)']]) {
      if (!b[k]) continue;
      if (!b[k].ok) probleme.push(m + ' ' + tx + ': ' + JSON.stringify(b[k]));
      else ok.push(m + ' ' + tx + ': in Ordnung');
    }
    if (b.abbau) {
      if (b.abbau.gleich === false) probleme.push(m + ' Abbau: Messwerte unterscheiden sich\n    ' + JSON.stringify(b.abbau));
      else if (b.abbau.gleich === null) ok.push(m + ' Abbau: nicht vorhanden (alter Stand)');
      else ok.push(m + ' Abbau: Messwerte gleich (neu, keine Referenz)');
    }
    if (neuM) ok.push(m + ': neu (keine Referenz in ' + va + ')'); else ok.push(m + ': ' + gleich + ' von ' + Object.keys(a.bilder).length + ' Bildern bytegleich');
    for (const k of Object.keys(a.exporte)) {
      const x = a.exporte[k], y = b.exporte[k];
      if (!y) probleme.push(m + ' Export ' + k + ': fehlt');
      else if (x.sha256 !== y.sha256 || x.name !== y.name) probleme.push(m + ' Export ' + k + ': anders (' + x.name + ' ' + x.bytes + ' B → ' + y.name + ' ' + y.bytes + ' B)');
      else ok.push(m + ' Export ' + k + ': ' + x.name + ' bytegleich (' + x.bytes + ' Bytes)');
    }
    const vgl = (titel, x, y) => { if (JSON.stringify(x) === JSON.stringify(y)) ok.push(m + ' ' + titel + ': gleich'); else probleme.push(m + ' ' + titel + ': anders\n    vorher:  ' + JSON.stringify(x) + '\n    nachher: ' + JSON.stringify(y)); };
    vgl('AR (WebXR-Anfrage)', a.ar, b.ar);
    const textB = {}; for (const k of Object.keys(a.text)) if (k in b.text) textB[k] = b.text[k];
    for (const k of Object.keys(b.text)) if (!(k in a.text)) ok.push(m + ' Seitentext ' + k + ': neu (keine Referenz)');
    vgl('Seitentext', a.text, textB);
    for (const k of new Set(Object.keys(a.konsole).concat(Object.keys(b.konsole)))) if (!(k in a.konsole)) { const z = (b.konsole[k] || []); if (((MODELLE[m] || { kontexte: {} }).kontexte[k] || {}).gegen) ok.push(m + ' Konsole ' + k + ': neu, Gegenstück wird gesondert geprüft'); else if (z.length) probleme.push(m + ' Konsole ' + k + ' (neu): ' + z.join(' | ')); else ok.push(m + ' Konsole ' + k + ': neu (keine Referenz), ohne Meldungen'); } else vgl('Konsole ' + k, (a.konsole[k] || []).slice().sort(), (b.konsole[k] || []).slice().sort());
    for (const k of Object.keys(b.erwartet || {})) ok.push(m + ' Konsole ' + k + ': ' + b.erwartet[k] + ' erwartete Fehlermeldungen (nicht verglichen)');
    /* Gegenstück: Atlas-Kontexte wiederholen die Einzelseiten-Abläufe und müssen innerhalb von <nachher> bytegleich sein */
    for (const [kn, K] of Object.entries((MODELLE[m] || { kontexte: {} }).kontexte)) {
      if (!K.gegen || !(kn in b.konsole)) continue;
      const g = B.modelle[K.gegen.modell], gn = K.gegen.kontext, titel = m + '-' + kn + ' ↔ ' + K.gegen.modell + '-' + gn;
      if (!g) { ok.push(titel + ': Gegenstück nicht aufgenommen'); continue; }
      const gm = K.gegen.modell;
      let n = 0, gl = 0;
      for (const k of Object.keys(b.bilder).filter((x) => x.startsWith(kn + '-'))) {
        const gk = k.slice(gm.length + 1);                   /* herz-desktop-01-x -> desktop-01-x */
        n++;
        if (!(gk in g.bilder)) { probleme.push(titel + ': Gegenstück-Bild ' + gk + ' fehlt'); continue; }
        if (g.bilder[gk] === b.bilder[k]) { gl++; continue; }
        await diffBild(gm + '-' + gk, m + '-' + k, m + '-' + k + '-gegen', titel + ' ' + k);
      }
      if (n) for (const k of Object.keys(g.bilder).filter((x) => x.startsWith(gn + '-'))) if (!((gm + '-' + k) in b.bilder)) probleme.push(titel + ': Bild ' + k + ' fehlt im Atlas');
      for (const k of Object.keys(b.exporte).filter((x) => x.startsWith(kn + '-'))) {
        const x = g.exporte[k.slice(kn.length + 1)], y = b.exporte[k];
        if (!x) probleme.push(titel + ' Export ' + k + ': Gegenstück fehlt');
        else if (x.sha256 !== y.sha256 || x.name !== y.name) probleme.push(titel + ' Export ' + k + ': anders (' + x.name + ' ' + x.bytes + ' B → ' + y.name + ' ' + y.bytes + ' B)');
        else ok.push(titel + ' Export ' + k + ': bytegleich (' + x.bytes + ' Bytes)');
      }
      if (kn in b.text) { if (g.text[gn] === b.text[kn]) ok.push(titel + ' Seitentext: gleich'); else probleme.push(titel + ' Seitentext: anders'); }
      if (kn in b.konsole) { const x = (g.konsole[gn] || []).slice().sort(), y = (b.konsole[kn] || []).slice().sort(); if (JSON.stringify(x) === JSON.stringify(y)) ok.push(titel + ' Konsole: gleich'); else probleme.push(titel + ' Konsole: anders\n    Einzelseite: ' + JSON.stringify(x) + '\n    Atlas:       ' + JSON.stringify(y)); }
      ok.push(titel + ': ' + gl + ' von ' + n + ' Bildern bytegleich');
    }
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
    console.log('node tools/vergleich.js aufnehmen <ziel> [--quelle <ordner>] [--nur koerper|herz|niere|nephron|atlas[:kontext]]');
    console.log('node tools/vergleich.js vergleichen <vorher> <nachher>');
    process.exitCode = 2;
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });
