#!/usr/bin/env node
/* =====================================================================
   Betroffene Prüfläufe: welche Modelle tools/vergleich.js prüfen muss

   Liest die Änderungen gegenüber einer Basis (Standard origin/main, dazu
   nicht eingecheckte und neue Dateien) und leitet daraus ab, welche
   Modelle und Atlas-Kontexte betroffen sind. Die Abhängigkeiten stehen im
   Code und werden hier gelesen, nicht von Hand gepflegt:
     - Kern.ORGANE / Kern.FORMEN (core/rahmen.js): welche Datei zu welchem
       Organ bzw. welcher Form gehört,
     - Kern.formLaden('x'), Kern.Formen.x, Kern.organLaden('x'),
       Kern.Organe.x in den Organ- und Formdateien: wer wen benutzt,
     - die Atlas-Kontexte von tools/vergleich.js: welche Organe sie berühren.
   Betroffen ist, was sich geändert hat, und alles, was davon (auch über
   Umwege) abhängt. Alle übrigen Modelle bekommen den Schnelltest (Kontext
   kurz: laden, ein Bild, Konsole).

   Voller Lauf, wenn gemeinsamer Code geändert ist: core/ (außer reinen
   Einträgen in Kern.ORGANE/FORMEN), index.html, Weiterleitungen, Manifest,
   icons/, vendor/, tools/vergleich.js, sw.js (außer DATEIEN und VERSION)
   und jede Datei, die sich keinem Organ und keiner Form zuordnen lässt.

   Aufruf:
     node tools/betroffen.js [basis]          Bericht
     node tools/betroffen.js [basis] --liste  nur die --nur-Werte, je Zeile
                                              einer (leer = voller Lauf nötig,
                                              Exit 3; nichts zu prüfen: Exit 0
                                              ohne Ausgabe)
   Keine App-Datei (nicht in DATEIEN von sw.js).
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WURZEL = path.join(__dirname, '..');
const lies = (rel) => fs.readFileSync(path.join(WURZEL, rel), 'utf8');
const git = (...a) => execFileSync('git', a, { cwd: WURZEL, encoding: 'utf8' });

const NUR_DOKU = [/^[^/]+\.md$/, /^docs\//, /^\.claude\//, /^tools\/kontext\.js$/, /^tools\/betroffen\.js$/];
const GEMEINSAM = [/^core\//, /^index\.html$/, /^atlas\.html$/, /^nephron\.html$/, /^app\.webmanifest$/, /^icons\//, /^vendor\//];
const OHNE_BILDER = [/^tools\/(version|live|symbole)\.js$/];      /* geprüft von version.js --pruefen bzw. ohne Einfluss auf die App */
const NACHWEIS = [/^tools\/nachweis\.js$/, /^tools\/originale\//];
const KOERPER_FORM_AUS_ORGAN = ['herz'];   /* Organe, deren Form der Körper aus dem Organ-Skript holt (statt aus Kern.FORMEN) */

/* ---------- Anmeldetabellen aus core/rahmen.js ---------- */
function tabellen() {
  const r = lies('core/rahmen.js');
  const block = (name) => { const i = r.indexOf('K.' + name + ' = {'); return r.slice(i, r.indexOf('\n  };', i)); };
  const organe = {}, formen = {};
  for (const m of block('ORGANE').matchAll(/^\s*([a-z]+): \{[^\n]*?skript: '([^']+)'(?:[^\n]*?css: '([^']+)')?/gm)) organe[m[1]] = [m[2], m[3]].filter(Boolean);
  for (const m of block('FORMEN').matchAll(/^\s*([a-z]+): \{[^\n]*?form: '([^']+)'/gm)) formen[m[1]] = [m[2]];
  return { organe, formen };
}

/* ---------- Abhängigkeiten: Knoten 'o:name' (Organ) und 'f:name' (Form) ---------- */
function abhaengigkeiten(T) {
  const nutzt = {};   /* knoten -> Set der Knoten, die er benutzt */
  const knoten = [...Object.keys(T.organe).map((n) => 'o:' + n), ...Object.keys(T.formen).map((n) => 'f:' + n)];
  for (const k of knoten) {
    const [art, n] = k.split(':');
    const s = new Set();
    for (const d of (art === 'o' ? T.organe : T.formen)[n]) {
      if (!d.endsWith('.js') || !fs.existsSync(path.join(WURZEL, d))) continue;
      const t = lies(d);
      for (const m of t.matchAll(/Kern\.formLaden\('([a-z]+)'\)|Kern\.Formen\.([a-z]+)/g)) s.add('f:' + (m[1] || m[2]));
      for (const m of t.matchAll(/Kern\.organLaden\('([a-z]+)'|Kern\.Organe\.([a-z]+)/g)) {
        const o = m[1] || m[2];
        /* Der Körper lädt Organ-Skripte nur für die Kamerafahrt (organ.start/mitte); die prüfen die Atlas-Kontexte
           uebergaenge-<organ>. Seine Gestalt kommt aus den Formen, außer beim Herz (Form noch in herz.js). */
        if (k === 'o:koerper' && !KOERPER_FORM_AUS_ORGAN.includes(o)) continue;
        s.add('o:' + o);
      }
    }
    if (art === 'o' && T.formen[n]) s.add('f:' + n);   /* organLaden lädt die gleichnamige Form zuerst */
    s.delete(k);
    nutzt[k] = s;
  }
  return nutzt;
}
function huelle(start, nutzt) {   /* alles, was (über Umwege) etwas aus start benutzt */
  const aus = new Set(start);
  let neu = true;
  while (neu) {
    neu = false;
    for (const [k, s] of Object.entries(nutzt)) if (!aus.has(k) && [...s].some((x) => aus.has(x))) { aus.add(k); neu = true; }
  }
  return aus;
}

/* ---------- geänderte Zeilen einer Datei gegenüber der Basis ---------- */
function geaenderteZeilen(basis, datei) {
  let d = '';
  try { d = git('diff', '-U0', basis, '--', datei); } catch (e) { return null; }
  return d.split('\n').filter((z) => /^[+-]/.test(z) && !/^(\+\+\+|---) /.test(z)).map((z) => z.slice(1));
}

/* tools/vergleich.js: nur neu hinzugefügte Zeilen in Blöcken von MODELLE.<organ> oder MODELLE.atlas.kontexte[…]
   (neues Organ, neue Bilder am Ende eines Kontexts) betreffen nur diese Modelle/Kontexte. Gelöschte oder geänderte
   Zeilen und Zeilen außerhalb dieser Blöcke (gemeinsamer Werkzeugcode) verlangen den vollen Lauf. */
function vergleichBloecke(basis) {
  let d = '';
  try { d = git('diff', '-U0', basis, '--', 'tools/vergleich.js'); } catch (e) { return null; }
  const z = lies('tools/vergleich.js').split('\n'), bloecke = [];
  const mStart = z.findIndex((x) => /^const MODELLE = \{$/.test(x)), mEnde = z.findIndex((x, i) => i > mStart && x === '};');
  for (let i = mStart + 1; i < mEnde; i++) { const m = z[i].match(/^  ([a-z]+): \{$/); if (m) bloecke.push({ von: i + 1, was: m[1] }); }
  bloecke.push({ von: mEnde + 1, was: null });
  for (let i = mEnde + 1; i < z.length; i++) {
    const m = z[i].match(/^MODELLE\.atlas\.kontexte(?:\['([^']+)'\]|\.([a-z-]+)) = /);
    if (m) bloecke.push({ von: i + 1, was: 'atlas:' + (m[1] || m[2]) });
    else if (/^[A-Za-z/]/.test(z[i]) && !/^MODELLE\.atlas\.kontexte/.test(z[i])) bloecke.push({ von: i + 1, was: null });
  }
  const treffer = new Set();
  for (const h of d.matchAll(/^@@ -\d+(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)) {
    const weg = h[1] === undefined ? 1 : +h[1], ab = +h[2], neu = h[3] === undefined ? 1 : +h[3];
    if (weg > 0) return null;
    for (let n = ab; n < ab + neu; n++) {
      let b = null; for (const x of bloecke) if (x.von <= n) b = x;
      if (!b || !b.was) return null;
      treffer.add(b.was);
    }
  }
  return treffer;
}

function main() {
  const args = process.argv.slice(2);
  const liste = args.includes('--liste');
  const basis = args.find((a) => !a.startsWith('--')) || 'origin/main';
  const dateien = [...new Set([
    ...git('diff', '--name-only', basis).split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n')
  ].filter(Boolean))].sort();

  const T = tabellen();
  const zuDatei = {};
  for (const [n, ds] of Object.entries(T.organe)) for (const d of ds) zuDatei[d] = 'o:' + n;
  for (const [n, ds] of Object.entries(T.formen)) for (const d of ds) zuDatei[d] = 'f:' + n;

  const gruende = [], hinweise = [], start = new Set(), zusatz = new Set();
  let alles = false, offline = false;
  for (const d of dateien) {
    if (NUR_DOKU.some((m) => m.test(d))) continue;
    if (OHNE_BILDER.some((m) => m.test(d))) { hinweise.push(d + ': keine Bilder betroffen (node tools/version.js --pruefen)'); continue; }
    if (NACHWEIS.some((m) => m.test(d))) { hinweise.push(d + ': node tools/nachweis.js lunge und alveole laufen lassen'); continue; }
    if (d === 'sw.js') {
      const z = geaenderteZeilen(basis, d) || [];
      const nurListe = z.every((x) => /^var VERSION = '[0-9a-f]+';$/.test(x) || /^\s*'[^']+'(, '[^']+')*,?$/.test(x));
      if (!nurListe) { alles = true; gruende.push('sw.js: mehr als DATEIEN/VERSION geändert'); }
      else if (z.some((x) => !/^var VERSION/.test(x))) { offline = true; gruende.push('sw.js: Liste DATEIEN geändert → Offline-Kontexte'); }
      continue;
    }
    if (d === 'core/rahmen.js') {
      const z = geaenderteZeilen(basis, d) || [];
      const eintrag = /^\s*([a-z]+): \{ titel: [^\n]*\},?$/;
      if (z.length && z.every((x) => eintrag.test(x))) {
        for (const x of z) start.add('o:' + x.match(eintrag)[1]);
        start.add('o:koerper');   /* der Körper zeigt, welche Organe ein Detailmodell haben */
        gruende.push('core/rahmen.js: nur Einträge in Kern.ORGANE/FORMEN');
        continue;
      }
    }
    if (d === 'tools/vergleich.js') {
      const b = vergleichBloecke(basis);
      if (!b) { alles = true; gruende.push(d + ': gemeinsamer Werkzeugcode geändert'); }
      else { for (const x of b) zusatz.add(x); gruende.push(d + ': nur neue Zeilen in ' + [...b].join(', ')); }
      continue;
    }
    if (GEMEINSAM.some((m) => m.test(d))) { alles = true; gruende.push(d + ': gemeinsamer Code'); continue; }
    if (zuDatei[d]) { start.add(zuDatei[d]); continue; }
    alles = true; gruende.push(d + ': keinem Organ und keiner Form zuzuordnen');
  }

  const { MODELLE } = require('./vergleich.js');
  const organModelle = Object.keys(MODELLE).filter((m) => m !== 'atlas');
  if (alles) {
    if (liste) process.exit(3);
    console.log('Voller Lauf nötig:'); gruende.filter((g) => !g.startsWith('sw.js: Liste')).forEach((g) => console.log('  ' + g));
    hinweise.forEach((h) => console.log('Hinweis: ' + h));
    return;
  }

  const betroffen = huelle(start, abhaengigkeiten(T));
  const organe = organModelle.filter((m) => betroffen.has('o:' + m) || zusatz.has(m));
  const nameRe = new RegExp('\\b(' + organModelle.join('|') + ')(App)?\\b', 'gi');
  const laeufe = organe.slice();
  for (const [k, K] of Object.entries(MODELLE.atlas.kontexte)) {
    const quelltext = [K.ablauf, K.bereit].filter(Boolean).map(String).join('\n') + (K.adresse || '');
    const beruehrt = new Set([...quelltext.matchAll(nameRe)].map((m) => m[1].toLowerCase()));
    if (!K.adresse) beruehrt.add('koerper');   /* Atlas-Kontexte ohne Adresse starten im Körper */
    const offlineK = /ATLAS_ADRESSE|serviceWorker/.test(quelltext) || /offline|update/.test(k);
    if ([...beruehrt].some((o) => betroffen.has('o:' + o) || zusatz.has(o)) || (offline && offlineK) || zusatz.has('atlas:' + k)) laeufe.push('atlas:' + k);
  }
  const schnell = organModelle.filter((m) => !organe.includes(m) && MODELLE[m].kontexte.kurz).map((m) => m + ':kurz');

  if (liste) { [...laeufe, ...schnell].forEach((l) => console.log(l)); return; }
  if (!start.size && !offline && !zusatz.size) { console.log('Keine App-Datei geändert: kein Vergleichslauf nötig.'); hinweise.forEach((h) => console.log('Hinweis: ' + h)); return; }
  console.log('Geändert: ' + ([...start].map((k) => k.replace('o:', 'Organ ').replace('f:', 'Form ')).join(', ') || 'nur Prüfwerkzeug bzw. Dateiliste'));
  gruende.forEach((g) => console.log('  ' + g));
  console.log('Betroffen (voll prüfen): ' + (organe.join(', ') || '–'));
  console.log('Atlas-Kontexte: ' + (laeufe.filter((l) => l.startsWith('atlas:')).map((l) => l.slice(6)).join(', ') || '–'));
  console.log('Schnelltest: ' + (schnell.map((s) => s.split(':')[0]).join(', ') || '–'));
  hinweise.forEach((h) => console.log('Hinweis: ' + h));
  console.log('\nLäufe (je einer: node tools/vergleich.js aufnehmen <ziel> --quelle <ordner> --nur <wert>):');
  [...laeufe, ...schnell].forEach((l) => console.log('  ' + l));
}

main();
