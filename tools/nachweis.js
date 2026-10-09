#!/usr/bin/env node
/* =====================================================================
   Nachweis: Atmungs-Schema der App gegen das Original-Modell

   Das Thorax-Modell (tools/originale/lunge-ebene1-thorax.html, unverändert) ist die Vorlage für die Atemmechanik der Lunge. Dieses Werkzeug zeigt,
   dass das Schema im Reiter „Atmung“ der App (index.html#lunge, Schema offen) dasselbe tut und zeigt wie das Original:

     node tools/nachweis.js lunge <ziel>

   Für jeden Fall (siehe FAELLE) wird das Original frisch geladen (Desktop 1280 x 800) und die App frisch geladen (Reiter Atmung, Schema offen), beide
   mit virtueller Zeit (tools/vergleich.js: initZeit), dieselben Bedienschritte in denselben Bildern. Dann:
     a) Bild <ziel>/lunge-<fall>.png: SVG und Kette des Originals (links) und der App (rechts) nebeneinander auf gleiche Höhe skaliert
     b) Werte: Texte der Kette, Stufen der Regler, Atemlabel, Pleura-Druckzahl, Tempo-Abzeichen, Reglerstände, Balken – Original gegen App
     c) SVG: outerHTML beider SVGs (Präfix lo an den IDs entfernt, Leerraum zwischen den Tags zusammengefasst) – Abweichungen werden gemeldet
        Ausnahme (mit dem Nutzer abgestimmte Korrektur): die Gruppe der weißen Rippen (id rippen) ist im Original leer (doppelte ID: die Rippen landen im
        Regler), in der App gefüllt; sie wird in beiden ausgeblendet verglichen. Ergänzend wird geprüft, dass ihre Pfade zu den Pfaden der Rippenkontur passen.
   Ergebnis: <ziel>/nachweis.json und eine Zusammenfassung auf der Konsole („gleich“ oder die Liste der Abweichungen). Exit 0, wenn alles gleich ist.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const V = require('./vergleich.js');

const WURZEL = path.resolve(__dirname, '..');
const ORIGINAL = 'tools/originale/lunge-ebene1-thorax.html';
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/* Bedienschritte, in beiden Seiten gleich. Namen sind die IDs des Originals (die App trägt das Präfix lo, die Regler heißen dort loZwerchRegler/loRippenRegler). */
const FAELLE = {
  'ruhe-einatmen': [['klick', 'demoRuhe'], ['weiter', 1000]],
  'ruhe-ausatmen': [['klick', 'demoRuhe'], ['weiter', 2900]],
  'stress': [['klick', 'demoStress'], ['weiter', 1500]],
  'zwerchfell-voll': [['schnell', 'zwerch', 100], ['weiter', 2500]],
  'rippen-halb': [['schnell', 'rippen', 50], ['weiter', 2000]],
  'durchsichtig-zahlen': [['segment', 'rippen', 'kontur'], ['klick', 'zahlen'], ['klick', 'demoRuhe'], ['weiter', 1300]],
  'zeitlupe-muskeln-aus': [['segment', 'muskel', 'aus'], ['segment', 'tempo', '0.25'], ['klick', 'demoRuhe'], ['weiter', 2000]],
  'entspannen': [['schnell', 'zwerch', 100], ['schnell', 'rippen', 100], ['weiter', 2000], ['klick', 'entspannen'], ['weiter', 600]],
  'ohne-pfeile': [['klick', 'pfeileAn'], ['klick', 'demoRuhe'], ['weiter', 800]],
  'regler': [['regler', 'zwerch', 37], ['weiter', 1500]]
};

/* Im Browser: alle Werte, die verglichen werden (app = true: IDs mit Präfix lo) */
function lies(app) {
  const ID = (k) => (app ? 'lo' + k.charAt(0).toUpperCase() + k.slice(1) : k);
  const g = (k) => document.getElementById(ID(k));
  const regler = (k) => document.getElementById(app ? (k === 'zwerch' ? 'loZwerchRegler' : 'loRippenRegler') : k);   // Original: die erste ID rippen ist der Regler
  const T = (k) => g(k).textContent;
  const st = (k) => { const s = g(k).style; return { left: s.left, width: s.width, background: s.background, color: s.color }; };
  return {
    kette: { z1: T('z1'), w2: T('w2'), w3: T('w3'), z3: T('z3'), p4: T('p4'), w4: T('w4'), z4: T('z4') },
    glieder: ['g1', 'g2', 'g3', 'g4'].map((k) => g(k).className),
    chips: ['chipZ', 'chipR', 'chipA'].map((k) => g(k).className),
    balken: { m2: st('m2'), b2: st('b2'), b3: st('b3'), p4: st('p4') },
    stufen: { zwerchfell: T('lblZwerch'), rippen: T('lblRippen') },
    atemlabel: { text: T('atemLabel'), fill: g('atemLabel').getAttribute('fill') },
    pleuraZahl: { text: T('pleuraZahl'), anzeige: g('pleuraZahl').style.display },
    tempo: { abzeichen: g('tempoBadge').className, faktor: T('tempoFaktor') },
    regler: { zwerch: regler('zwerch').value, rippen: regler('rippen').value },
    pfeile: ['pfZwerch', 'pfRipL', 'pfRipR', 'txZwerch', 'txRipL', 'txRipR'].map((k) => [g(k).getAttribute('opacity'), g(k).textContent])
  };
}
/* Im Browser: SVG als Text, normalisiert; dazu die Rippen-Pfade (Knochen und Kontur) */
function liesSvg(app) {
  const svg = document.getElementById(app ? 'loSvg' : 'svg');
  let s = svg.outerHTML;
  s = s.replace(/\bid="lo([A-Z])/g, (m, c) => 'id="' + c.toLowerCase());          // Präfix lo entfernen
  s = s.replace(/<g id="rippen"[^>]*>[\s\S]*?<\/g>/, '<g id="rippen"></g>');     // abgestimmte Korrektur: Gruppe der weißen Rippen ausgeblendet
  s = s.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();                      // Leerraum
  const gr = svg.querySelector(app ? '#loRippen' : '#rippen');   // im Original gehört die ID rippen auch dem Regler: die Gruppe im SVG suchen
  const ko = svg.querySelector(app ? '#loRippenKontur' : '#rippenKontur');
  const pf = (e) => Array.from(e.querySelectorAll('path')).map((p) => p.getAttribute('d'));
  return { svg: s, rippen: pf(gr), kontur: pf(ko) };
}

/* Unterschiede zweier Texte als Liste (Tags getrennt) */
function textDiff(a, b) {
  const tok = (s) => s.replace(/></g, '>\n<').split('\n');
  const x = tok(a), y = tok(b), r = [];
  for (let i = 0; i < Math.max(x.length, y.length) && r.length < 12; i++) if (x[i] !== y[i]) r.push({ nr: i, original: x[i] || null, app: y[i] || null });
  return r;
}
function wertDiff(a, b, pfad, r) {
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) wertDiff(a[k], b[k], pfad + (pfad ? '.' : '') + k, r); }
  else if (a !== b) r.push({ wert: pfad, original: a, app: b });
}

async function seite(browser, basis, adresse, app) {
  const ctx = await browser.newContext(Object.assign({ locale: 'de-DE', timezoneId: 'Europe/Berlin', reducedMotion: 'no-preference' }, V.DESKTOP));
  await ctx.addInitScript(V.initZeit, { epoch: Date.UTC(2026, 0, 15, 9, 30, 0), seed: 0x2F6FB5, kerne: 8 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const fehler = [];
  page.on('pageerror', (e) => fehler.push('Seitenfehler: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  const weiter = (ms) => page.evaluate((a) => window.__zeit.weiter(a, 50), ms);
  await page.goto(basis + adresse);
  if (app) {
    /* wie tools/vergleich.js: zuerst in echter Zeit, bis Skript und Gestaltung des Organs da sind, dann in 50-ms-Schritten bis zur Bereitschaft */
    const t0 = Date.now();
    const zu = () => { if (Date.now() - t0 > 300000) throw new Error('Lunge wurde nicht fertig aufgebaut'); };
    while (!(await page.evaluate(() => { const l = document.querySelector('link[data-organ="lunge"]'); return !!(window.Kern && Kern.Organe.lunge && l && l.getAttribute('data-geladen')); }))) { zu(); await warte(20); }
    const bereit = V.ATLAS_BEREIT('lunge');
    while (!(await page.evaluate(bereit))) { zu(); await weiter(50); }
    await page.addStyleTag({ content: '#atlasZurueck{display:none !important}' });
    await page.click('#rail .tabs .tab:text-is("Atmung")');
    await page.click('#bSchema');
  } else {
    await weiter(100);
  }
  return { ctx, page, weiter, fehler };
}
async function schritte(s, fall, app) {
  const ID = (k) => '#' + (app ? 'lo' + k.charAt(0).toUpperCase() + k.slice(1) : k);
  for (const st of FAELLE[fall]) {
    if (st[0] === 'klick') await s.page.click(ID(st[1]));
    else if (st[0] === 'schnell') await s.page.click('[data-set="' + st[1] + '"][data-wert="' + st[2] + '"]');
    else if (st[0] === 'segment') await s.page.click('[data-' + st[1] + '="' + st[2] + '"]');
    else if (st[0] === 'regler') {
      const sel = app ? (st[1] === 'zwerch' ? '#loZwerchRegler' : '#loRippenRegler') : '#' + st[1];
      await s.page.evaluate(([q, v]) => { const e = document.querySelector(q); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, st[2]]);
    } else if (st[0] === 'weiter') await s.weiter(st[1]);
  }
}
async function bildPaar(browser, ziel, fall, pngO, pngA) {
  const ctx = await browser.newContext({ viewport: { width: 1800, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const url = (b) => 'data:image/png;base64,' + b.toString('base64');
  await page.setContent('<body style="margin:0;background:#fff;font:600 18px sans-serif;color:#16282F"><div style="display:flex;gap:24px;padding:12px;align-items:flex-start">' +
    ['Original', 'App'].map((n, i) => '<div><div style="margin:0 0 6px">' + n + '</div><img style="display:block;height:820px;border:1px solid #999" src="' + url(i ? pngA : pngO) + '"></div>').join('') + '</div></body>');
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  const datei = path.join(ziel, 'lunge-' + fall + '.png');
  fs.writeFileSync(datei, await page.screenshot({ fullPage: true }));
  await ctx.close();
  return datei;
}

async function lunge(ziel) {
  fs.mkdirSync(ziel, { recursive: true });
  const pw = V.ladePlaywright();
  const srv = await V.server(WURZEL), basis = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: V.CHROMIUM_ARGS });
  const erg = { browser: browser.version(), faelle: {} };
  let gleichAlle = true;
  try {
    for (const fall of Object.keys(FAELLE)) {
      process.stdout.write('Fall ' + fall + '\n');
      const r = { werte: { gleich: true, abweichungen: [] }, svg: { gleich: true, abweichungen: [] }, rippen: {}, fehler: [] };
      const o = await seite(browser, basis, ORIGINAL, false);
      await schritte(o, fall, false);
      const wo = await o.page.evaluate(lies, false), so = await o.page.evaluate(liesSvg, false);
      const pngO = await (await o.page.$('#buehne')).screenshot({ animations: 'disabled' });
      r.fehler.push(...o.fehler.map((f) => 'Original: ' + f)); await o.ctx.close();
      const a = await seite(browser, basis, 'index.html#lunge', true);
      await schritte(a, fall, true);
      const wa = await a.page.evaluate(lies, true), sa = await a.page.evaluate(liesSvg, true);
      const pngA = await (await a.page.$('#schemaBox')).screenshot({ animations: 'disabled' });
      r.fehler.push(...a.fehler.map((f) => 'App: ' + f)); await a.ctx.close();
      wertDiff(wo, wa, '', r.werte.abweichungen); r.werte.gleich = r.werte.abweichungen.length === 0;
      r.svg.gleich = so.svg === sa.svg; if (!r.svg.gleich) r.svg.abweichungen = textDiff(so.svg, sa.svg);
      r.werte.original = wo; r.werte.app = wa;
      /* abgestimmte Rippen-Korrektur: Original leer, App gefüllt; die weißen Rippen müssen den Pfaden der Kontur folgen */
      r.rippen = { originalPfade: so.rippen.length, appPfade: sa.rippen.length, passenZurKontur: JSON.stringify(sa.rippen) === JSON.stringify(sa.kontur) };
      if (!r.rippen.passenZurKontur || r.rippen.originalPfade !== 0 || r.rippen.appPfade !== 12) { r.svg.gleich = false; r.svg.abweichungen.push({ rippenGruppe: r.rippen }); }
      r.bild = await bildPaar(browser, ziel, fall, pngO, pngA);
      r.gleich = r.werte.gleich && r.svg.gleich && r.fehler.length === 0;
      if (!r.gleich) gleichAlle = false;
      erg.faelle[fall] = r;
      process.stdout.write('  ' + (r.gleich ? 'gleich' : 'ABWEICHUNG') + '  ' + r.bild + '\n');
    }
  } finally { await browser.close(); srv.close(); }
  erg.gleich = gleichAlle;
  fs.writeFileSync(path.join(ziel, 'nachweis.json'), JSON.stringify(erg, null, 1));
  console.log('\nZusammenfassung (Original-Modell gegen App, ' + Object.keys(FAELLE).length + ' Fälle, Werte und SVG):');
  for (const [fall, r] of Object.entries(erg.faelle)) {
    console.log('  ' + fall.padEnd(22) + (r.gleich ? 'gleich' : 'ANDERS'));
    r.werte.abweichungen.forEach((d) => console.log('      Wert ' + d.wert + ': Original ' + JSON.stringify(d.original) + ' / App ' + JSON.stringify(d.app)));
    r.svg.abweichungen.forEach((d) => console.log('      SVG ' + JSON.stringify(d)));
    r.fehler.forEach((f) => console.log('      ' + f));
  }
  console.log(gleichAlle ? '\nAlles gleich (Rippen-Gruppe: Original leer, App gefüllt wie abgestimmt).' : '\nAbweichungen vorhanden.');
  return gleichAlle ? 0 : 1;
}

(async () => {
  const [cmd, ziel] = process.argv.slice(2);
  if (cmd === 'lunge' && ziel) process.exitCode = await lunge(path.resolve(ziel));
  else { console.log('node tools/nachweis.js lunge <ziel>'); process.exitCode = 2; }
})().catch((e) => { console.error(e); process.exitCode = 1; });
