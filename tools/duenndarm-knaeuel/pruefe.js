// Prueft die Mittellinie der App-Kopie: Schlingen untereinander und zu den Nachbarn
const K = require('./formen.js')(process.argv[2] ? require('path').resolve(process.argv[2]) : undefined), v = K.Formen.verdauung, d = v.duenndarm(), A = d.achse, R = d.r;
const { frei, freiAnfang, freiEnde, rahmen } = require('./lagen.js');
const pts = []; for (let s = 0; s <= d.laenge; s += 0.2) pts.push([s, A.punkt(s)]);
let selbst = 1e9, wo = null;
for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { if (pts[j][0] - pts[i][0] < Math.PI * R + 0.5) continue; const a = pts[i][1], b = pts[j][1], q = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 2 * R; if (q < selbst) { selbst = q; wo = [pts[i][0].toFixed(1), pts[j][0].toFixed(1)]; } }
let hin = 1e9, hwo = null, ra = 1e9;
for (const [s, p] of pts) { const F = s < 3.5 ? freiAnfang : (s > d.laenge - 5 ? freiEnde : frei); const c = F(p[0], p[1], p[2], R + 1) - R; if (c < hin) { hin = c; hwo = s.toFixed(1); } ra = Math.min(ra, rahmen(p[0], p[1]) - R); }
let ue = 0; for (const [s, p] of pts) { if (s < 4 || s > d.laenge - 6) continue; ue = Math.max(ue, R - rahmen(p[0], p[1])); }
console.log('Ueberdeckung max', ue.toFixed(2)); console.log('Laenge', d.laenge.toFixed(1), 'Leerdarm bis', d.leerEnde.toFixed(1), '| Schlingen min Luft', selbst.toFixed(3), wo, '| Nachbarn min Luft', hin.toFixed(3), 'bei s', hwo, '| Rahmen', ra.toFixed(2));
