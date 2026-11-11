#!/usr/bin/env node
/* =====================================================================
   Kontext-Karte und Doku-Budget

   Erzeugt KONTEXT.md: je Code-Datei (core/, organe/, tools/, sw.js) die
   Zeilenzahl und die Abschnitte aus den Kopfkommentaren
   (/* ====…  Titel … bzw. /* === Titel === *\/) mit Zeilennummer. So
   findet man eine Stelle, ohne große Dateien ganz zu lesen.

   Prüft außerdem, dass die Dokumentation, die in jeder Sitzung gelesen
   wird, nicht mit jedem Organ wächst (Obergrenzen in BUDGET).

   Aufruf:
     node tools/kontext.js             schreibt KONTEXT.md
     node tools/kontext.js --pruefen   ändert nichts; Exit 1, wenn KONTEXT.md
                                       veraltet ist oder ein Budget überschritten
   Keine App-Datei (nicht in DATEIEN von sw.js).
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const WURZEL = path.join(__dirname, '..');
const ZIEL = path.join(WURZEL, 'KONTEXT.md');

/* Obergrenzen in Bytes (ca. 3,5 Bytes je Token). Wer sie anheben will,
   klärt das mit Jörn; zuerst kürzen oder nach docs/ auslagern. */
const BUDGET = {
  'CLAUDE.md': 6000,
  '.claude/agents/executor.md': 20000,
  'PLAN.md': 16000,
  '.claude/uebergabe/': 6000,      // alle Dateien zusammen
  'KONTEXT.md': 24000
};

const ORDNER = ['core', 'organe', 'tools'];
const AUSSER = ['tools/originale'];

function dateien() {
  const liste = ['sw.js'];
  function lauf(rel) {
    if (AUSSER.indexOf(rel) >= 0) return;
    const voll = path.join(WURZEL, rel);
    for (const n of fs.readdirSync(voll).sort()) {
      const r = rel + '/' + n;
      if (fs.statSync(path.join(WURZEL, r)).isDirectory()) lauf(r);
      else if (/\.(js|css)$/.test(n)) liste.push(r);
    }
  }
  ORDNER.forEach(lauf);
  return liste;
}

function abschnitte(text) {
  const z = text.split('\n'), aus = [];
  for (let i = 0; i < z.length; i++) {
    const inl = z[i].match(/^\s*\/\*\s*={3,}\s*(.+?)\s*={3,}\s*\*\/\s*$/);
    if (inl) { aus.push([i + 1, inl[1]]); continue; }
    if (/^\s*\/\*\s*={5,}\s*$/.test(z[i])) {
      for (let j = i + 1; j < Math.min(i + 4, z.length); j++) {
        const t = z[j].replace(/={3,}\s*\*\/\s*$/, '').trim();
        if (t) { aus.push([i + 1, t.length > 110 ? t.slice(0, 107) + '…' : t]); break; }
      }
    }
  }
  return { zeilen: z.length, aus };
}

function erzeugen() {
  const teile = [
    '# Kontext-Karte',
    '',
    'Erzeugt mit `node tools/kontext.js` – nicht von Hand ändern. Abschnitte je Datei mit Zeilennummer.',
    'Gebrauch: `grep -n -A40 "^## organe/leber/leber.js" KONTEXT.md`, dann im Code nur den Abschnitt lesen (`Read` mit `offset`/`limit`, ca. 100–200 Zeilen).',
    'Was die Dateien enthalten und warum: `docs/dateien.md` (nur bei Bedarf, per `grep`).',
    ''
  ];
  for (const d of dateien()) {
    const a = abschnitte(fs.readFileSync(path.join(WURZEL, d), 'utf8'));
    const kopf = a.aus.length && a.aus[0][0] <= 3 ? a.aus.shift()[1] : '';
    teile.push('## ' + d + ' (' + a.zeilen + ' Zeilen)' + (kopf ? ' – ' + kopf : ''));
    for (const [n, t] of a.aus) teile.push('- ' + n + ': ' + t);
    teile.push('');
  }
  return teile.join('\n');
}

function groesse(rel) {
  const voll = path.join(WURZEL, rel);
  if (!fs.existsSync(voll)) return 0;
  if (!fs.statSync(voll).isDirectory()) return fs.statSync(voll).size;
  return fs.readdirSync(voll).reduce((s, n) => s + groesse(rel + n), 0);
}

function main() {
  const pruefen = process.argv.indexOf('--pruefen') >= 0;
  const neu = erzeugen();
  let ok = true;
  if (pruefen) {
    const alt = fs.existsSync(ZIEL) ? fs.readFileSync(ZIEL, 'utf8') : '';
    if (alt !== neu) { ok = false; console.log('KONTEXT.md veraltet – node tools/kontext.js ausführen'); }
  } else {
    fs.writeFileSync(ZIEL, neu);
    console.log('KONTEXT.md geschrieben');
  }
  for (const [rel, max] of Object.entries(BUDGET)) {
    const b = rel === 'KONTEXT.md' ? Buffer.byteLength(neu) : groesse(rel);
    const zuViel = b > max;
    if (zuViel) ok = false;
    console.log((zuViel ? 'ZU GROSS ' : 'ok       ') + rel + ': ' + (b / 1000).toFixed(1) + ' von ' + (max / 1000) + ' KB (~' + Math.round(b / 3500) + 'k Tokens)');
  }
  if (!ok) process.exit(1);
}

main();
