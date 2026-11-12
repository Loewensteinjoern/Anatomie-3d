// Schreibt die Tabelle tab-<seed>.json in organe/verdauung/verdauung-form.js (DUENN_TAB, DUENN_LEER, DUENN_SCHNITT) oder in die angegebene Datei.
// node einbauen.js tab-11.json [s0 s1] [datei]
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const s0 = process.argv[3], s1 = process.argv[4], f = process.argv[5] || path.join(__dirname, '..', '..', 'organe/verdauung/verdauung-form.js');
let s = fs.readFileSync(f, 'utf8');
const z = []; for (let i = 0; i < T.tab.length; i += 4) z.push('  ' + T.tab.slice(i, i + 4).map((p) => '[' + p.join(', ') + ']').join(', '));
s = s.replace(/var DUENN_TAB = \[[\s\S]*?\n\];/, 'var DUENN_TAB = [\n' + z.join(',\n') + '\n];');
s = s.replace(/var DUENN_LEER = [0-9.]+;/, 'var DUENN_LEER = ' + (+T.leerAnteil).toFixed(2) + ';');
if (s0 && s1) s = s.replace(/var DUENN_SCHNITT = \{ s0: [0-9.]+, s1: [0-9.]+ \};/, 'var DUENN_SCHNITT = { s0: ' + s0 + ', s1: ' + s1 + ' };');
fs.writeFileSync(f, s); console.log('eingebaut in', f, '- Leerdarm-Anteil', (+T.leerAnteil).toFixed(2));
