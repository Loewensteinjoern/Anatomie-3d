#!/usr/bin/env node
/* =====================================================================
   Versionsnummer des Service Workers (sw.js)

   Berechnet die Version aus den Dateien der Liste DATEIEN in sw.js
   (erste 12 Hex-Zeichen von SHA-256 über Pfad + Inhalt jeder Datei, in
   Listenreihenfolge) und prüft, ob die Liste vollständig ist (alles, was
   index.html, app.webmanifest und Kern.ORGANE laden, sowie die Weiterleitungen).

   Aufruf (nach jeder Änderung an einer App-Datei ausführen):
     node tools/version.js             schreibt die Version in sw.js
     node tools/version.js --pruefen   ändert nichts; Exit-Code 1, wenn veraltet

   Als Modul: require('./version.js').pruefen() -> { ok, version, erwartet, fehler }
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WURZEL = path.join(__dirname, '..');
const SW = path.join(WURZEL, 'sw.js');

function lesen(datei) { return fs.readFileSync(path.join(WURZEL, datei)); }

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
  const reO = /\b(?:skript|css): '([^']+)'/g;
  while ((m = reO.exec(rahmen))) erforderlich.push(m[1]);
  erforderlich.forEach((d, i) => {
    if (d && erforderlich.indexOf(d) === i && dateien.indexOf(d) < 0) fehler.push('Nicht in DATEIEN: ' + d);
  });

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
