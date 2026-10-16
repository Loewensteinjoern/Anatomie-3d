#!/usr/bin/env node
/* =====================================================================
   Versionsnummer des Service Workers (sw.js)

   Berechnet die Version aus den Dateien der Liste DATEIEN in sw.js
   (erste 12 Hex-Zeichen von SHA-256 über Pfad + Inhalt jeder Datei, in
   Listenreihenfolge) und prüft, ob die Liste vollständig ist (alles, was
   index.html, app.webmanifest, Kern.ORGANE und Kern.FORMEN laden, sowie die Weiterleitungen).

   Aufruf (nach jeder Änderung an einer App-Datei ausführen):
     node tools/version.js             schreibt die Version in sw.js
     node tools/version.js --pruefen   ändert nichts; Exit-Code 1, wenn veraltet

   Zusätzlich prüft --pruefen (und das Modul) die Sicherheit:
     a) Prüfsummen von vendor/ gegen feste SHA-256-Werte (three.js r128 aus dem npm-Paket three@0.128.0),
     b) verbotene Muster in allen App-Dateien außer vendor/ (externe Adressen, fetch, eval, ...),
     c) die Content-Security-Policy in index.html gegen den Soll-Wert CSP_SOLL,
     d) Zugangsdaten/Schlüsselmuster in allen versionierten Textdateien (git ls-files, Werte nie ausgegeben).
   Ändert sich eine davon absichtlich, müssen die Werte hier angepasst werden.

   Als Modul: require('./version.js').pruefen() -> { ok, version, erwartet, fehler }
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WURZEL = path.join(__dirname, '..');
const SW = path.join(WURZEL, 'sw.js');

/* a) Feste Prüfsummen der Fremdbibliothek (byte-identisch mit three@0.128.0) */
const VENDOR_SHA256 = {
  'vendor/three.min.js': '9274bbcec8d96168626c732b5d31c775aa8cfb7eaa0599bec0c175908a2c1ce2',
  'vendor/GLTFExporter.js': 'a228cae09518e5034600a1aec65c3b3453f706f8943e542721c63c5e5727499c'
};

/* c) Soll-Wert der Content-Security-Policy in index.html (<meta http-equiv>).
   style-src 'unsafe-inline' nur für style-Attribute (Markup und per JS gesetzte Farben); <style>-Elemente sind verboten. */
const CSP_SOLL = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; " +
  "style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob: data:; worker-src 'self'; " +
  "object-src 'none'; base-uri 'none'; form-action 'none'";

/* b) Verbotene Muster: [Name, Regex, Dateien, in denen es erlaubt ist] */
const VERBOTEN = [
  ['externe Adresse', /https?:\/\//i, []],
  ['fetch(', /\bfetch\s*\(/, ['sw.js']],            // Service Worker holt nur eigene Dateien
  ['eval(', /\beval\s*\(/, []],
  ['new Function', /\bnew\s+Function\b/, []],
  ['document.write', /\bdocument\s*\.\s*write(ln)?\b/, []],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/, []],
  ['importScripts', /\bimportScripts\b/, []],
  ['<iframe', /<iframe/i, []],
  ['sendBeacon', /\bsendBeacon\b/, []],
  ['WebSocket', /\bWebSocket\b/, []]
];
/* Ausnahmen für „externe Adresse“: nur XML-Namensräume (Kennungen, keine Abrufe) */
const ERLAUBTE_ADRESSEN = [
  /^http:\/\/www\.w3\.org\/2000\/svg$/
];

/* d) Zugangsdaten/Schlüssel in allen versionierten Textdateien (außer vendor/ und Binärdateien).
   Gemeldet wird nur Datei:Zeile und die Musterart, nie der Wert. */
const GEHEIM = [
  ['GitHub-Token', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/],
  ['Anthropic-Schlüssel', /sk-ant-[A-Za-z0-9_-]{10,}/],
  ['API-Schlüssel (sk-)', /\bsk-[A-Za-z0-9]{20,}/],
  ['Google-API-Schlüssel', /AIza[0-9A-Za-z_-]{30,}/],
  ['AWS-Zugangsschlüssel', /AKIA[0-9A-Z]{16}/],
  ['Slack-Token', /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ['privater Schlüssel', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Zuweisung eines Geheimnisses', /(api[_-]?key|secret|password|passwort|token)\s*[:=]\s*['"][^'"]{8,}['"]/i]
];
/* Ausnahmen: [Datei, Muster der Zeile, Begründung] – derzeit keine nötig */
const GEHEIM_AUSNAHMEN = [];
const BINAER = /\.(png|jpe?g|gif|webp|ico|glb|stl|usdz|zip|woff2?|pdf)$/i;

function geheimnisse() {
  const fehler = [];
  let liste;
  try { liste = require('child_process').execFileSync('git', ['ls-files', '-z'], { cwd: WURZEL, encoding: 'utf8' }).split('\0').filter(Boolean); }
  catch (e) { return ['Sicherheit: git ls-files nicht möglich (' + e.message.split('\n')[0] + ')']; }
  liste.filter(d => !/^vendor\//.test(d) && !BINAER.test(d) && fs.existsSync(path.join(WURZEL, d))).forEach(d => {
    const buf = lesen(d);
    if (buf.indexOf(0) >= 0) return;
    buf.toString('utf8').split('\n').forEach((zeile, i) => {
      GEHEIM.forEach(g => {
        if (!g[1].test(zeile)) return;
        if (GEHEIM_AUSNAHMEN.some(a => a[0] === d && a[1].test(zeile))) return;
        fehler.push('Möglicher Schlüssel (' + g[0] + '): ' + d + ':' + (i + 1) + ' [Wert maskiert]');
      });
    });
  });
  return fehler;
}

function lesen(datei) { return fs.readFileSync(path.join(WURZEL, datei)); }

function sicherheit(dateien) {
  const fehler = [];
  Object.keys(VENDOR_SHA256).forEach(d => {
    if (!fs.existsSync(path.join(WURZEL, d))) { fehler.push('Sicherheit: ' + d + ' fehlt'); return; }
    const h = crypto.createHash('sha256').update(lesen(d)).digest('hex');
    if (h !== VENDOR_SHA256[d]) fehler.push('Sicherheit: ' + d + ' weicht von der festen Prüfsumme ab (' + h + ')');
  });
  dateien.filter(d => /^vendor\//.test(d)).forEach(d => {
    if (!VENDOR_SHA256[d]) fehler.push('Sicherheit: ' + d + ' hat keine feste Prüfsumme in VENDOR_SHA256');
  });
  dateien.filter(d => !/^vendor\//.test(d) && /\.(js|css|html|webmanifest|svg)$/i.test(d)).forEach(d => {
    lesen(d).toString('utf8').split('\n').forEach((zeile, i) => {
      VERBOTEN.forEach(v => {
        if (v[2].indexOf(d) >= 0) return;
        if (v[0] === 'externe Adresse') {
          const re = /https?:\/\/[^\s"'`<>)]*/gi;
          let k;
          while ((k = re.exec(zeile))) if (!ERLAUBTE_ADRESSEN.some(a => a.test(k[0]))) fehler.push('Verboten (' + v[0] + '): ' + d + ':' + (i + 1) + ' ' + k[0]);
        } else if (v[1].test(zeile)) fehler.push('Verboten (' + v[0] + '): ' + d + ':' + (i + 1));
      });
    });
  });
  const m = /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(lesen('index.html').toString('utf8'));
  if (!m) fehler.push('Sicherheit: Content-Security-Policy fehlt in index.html');
  else if (m[1] !== CSP_SOLL) fehler.push('Sicherheit: Content-Security-Policy in index.html weicht vom Soll-Wert ab: ' + m[1]);
  if (/<style[\s>]/i.test(lesen('index.html').toString('utf8'))) fehler.push('Sicherheit: <style>-Element in index.html');
  return fehler;
}

function pruefen() {
  const fehler = [];
  const sw = fs.readFileSync(SW, 'utf8');
  const liste = /var DATEIEN = \[([\s\S]*?)\];/.exec(sw);
  if (!liste) return { ok: false, version: null, erwartet: null, fehler: ['sw.js: Liste DATEIEN nicht gefunden'] };
  const dateien = [];
  let m;
  const re = /'([^']+)'/g;
  while ((m = re.exec(liste[1]))) dateien.push(m[1]);
  const aktuell = /var VERSION = '([^']*)';/.exec(sw);
  const version = aktuell ? aktuell[1] : null;
  if (!aktuell) fehler.push('sw.js: Zeile var VERSION nicht gefunden');

  if (dateien.indexOf('sw.js') >= 0) fehler.push('sw.js darf nicht in DATEIEN stehen');
  const echte = dateien.filter(d => d !== './');
  echte.forEach(d => {
    if (!fs.existsSync(path.join(WURZEL, d))) fehler.push('Datei fehlt: ' + d);
  });

  /* Vollständigkeit: alles, was geladen wird, muss in DATEIEN stehen */
  const erforderlich = ['nephron.html', 'atlas.html'];
  const rel = p => p && !/^(data:|#|https?:|\/\/|mailto:)/i.test(p);
  const norm = p => p.replace(/[?#].*$/, '').replace(/^\.\//, '');
  const html = lesen('index.html').toString('utf8');
  const reA = /\b(?:src|href)\s*=\s*["']([^"']*)["']/g;
  while ((m = reA.exec(html))) if (rel(m[1])) erforderlich.push(norm(m[1]));
  try {
    const mani = JSON.parse(lesen('app.webmanifest').toString('utf8'));
    (mani.icons || []).forEach(i => { if (rel(i.src)) erforderlich.push(norm(i.src)); });
  } catch (e) { fehler.push('app.webmanifest: ' + e.message); }
  const rahmen = lesen('core/rahmen.js').toString('utf8');
  const reO = /\b(?:skript|css|form): '([^']+)'/g;
  while ((m = reO.exec(rahmen))) erforderlich.push(m[1]);
  erforderlich.forEach((d, i) => {
    if (d && erforderlich.indexOf(d) === i && dateien.indexOf(d) < 0) fehler.push('Nicht in DATEIEN: ' + d);
  });

  sicherheit(echte.concat(['sw.js'])).forEach(f => fehler.push(f));
  geheimnisse().forEach(f => fehler.push(f));
  if (fehler.length) return { ok: false, version, erwartet: null, fehler };
  const h = crypto.createHash('sha256');
  echte.forEach(d => {
    h.update(d + '\n');
    h.update(lesen(d));
    h.update('\n');
  });
  const erwartet = h.digest('hex').slice(0, 12);
  return { ok: version === erwartet, version, erwartet, fehler };
}

if (require.main === module) {
  const nurPruefen = process.argv.indexOf('--pruefen') >= 0;
  const r = pruefen();
  if (r.fehler.length) {
    r.fehler.forEach(f => console.error('FEHLER: ' + f));
    process.exit(1);
  }
  if (nurPruefen) {
    if (r.ok) console.log('Version aktuell: ' + r.version);
    else {
      console.log('Version veraltet: ' + r.version + ' (erwartet ' + r.erwartet + ') – node tools/version.js ausführen');
      process.exit(1);
    }
  } else {
    const sw = fs.readFileSync(SW, 'utf8');
    fs.writeFileSync(SW, sw.replace(/^var VERSION = '[^']*';/m, "var VERSION = '" + r.erwartet + "';"));
    console.log('Version: ' + r.version + ' -> ' + r.erwartet);
  }
}

module.exports = { pruefen };
