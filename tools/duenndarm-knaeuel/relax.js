// Entspannung des Gitterwegs -> glatte Mittellinie, Tabelle mit ca. 1 cm Punktabstand
const fs = require('fs');
const SEED = process.argv[2] || 1, IT = +(process.env.IT || 500), DS = 0.5;
const { frei, freiAnfang, freiEnde, rahmen, R, GAP, FLEX, BAUH, UEBER } = require('./lagen.js');
const DRUCK = +(process.env.DRUCK || 0);
const W = JSON.parse(fs.readFileSync('weg-' + SEED + '.json', 'utf8'));
let poly = [FLEX].concat(W.pfad, [BAUH]);
function resample(pts, ds) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2])); const L = cum[cum.length - 1], m = Math.max(1, Math.round(L / ds)), out = []; let k = 1; for (let q = 0; q <= m; q++) { const t = L * q / m; while (k < pts.length - 1 && cum[k] < t) k++; const a = pts[k - 1], b = pts[k], f = (t - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]); } return out; }
let p = resample(poly, DS); const n = p.length;
const ENDE0 = Math.round(3.5 / DS), ENDE1 = n - 1 - Math.round(5 / DS);   // Anschluss an Zwoelffingerdarm und Blinddarm: dort keine Hindernisse
const ZUG = +(process.env.ZUG || 0);
const SKIP = Math.ceil(Math.PI * R / DS), D2 = 2 * R + GAP;
function grad(f, x, y, z) { const h = 0.05; return [(f(x + h, y, z) - f(x - h, y, z)) / (2 * h), (f(x, y + h, z) - f(x, y - h, z)) / (2 * h), (f(x, y, z + h) - f(x, y, z - h)) / (2 * h)]; }
const fr = (x, y, z) => frei(x, y, z, R + GAP + 0.6), frA = (x, y, z) => freiAnfang(x, y, z, R + GAP + 0.6), frE = (x, y, z) => freiEnde(x, y, z, R + GAP + 0.6);
let cache = new Float64Array(n).fill(0);
for (let it = 0; it < IT; it++) {
  const q = p.map((a) => a.slice());
  // Glaetten (staerker am Anfang) und Abstand der Nachbarpunkte
  const ks = it < 60 ? 0.3 : (it > IT - 150 ? 0.15 : 0.08);
  for (let i = 1; i < n - 1; i++) for (let c = 0; c < 3; c++) q[i][c] += ks * (p[i - 1][c] + p[i + 1][c] - 2 * p[i][c]);
  for (let i = 1; i < n; i++) { const a = q[i - 1], b = q[i], d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1e-6, k = 0.5 * (d - DS) / d; for (let c = 0; c < 3; c++) { const m = (b[c] - a[c]) * k; if (i - 1 > 0) a[c] += m; if (i < n - 1) b[c] -= m; } }
  // Abstossung der Schlingen untereinander (Gitter 2,5 cm)
  const H = new Map(), key = (a) => Math.floor(a[0] / 2.5) + ',' + Math.floor(a[1] / 2.5) + ',' + Math.floor(a[2] / 2.5);
  q.forEach((a, i) => { const k = key(a); (H.get(k) || H.set(k, []).get(k)).push(i); });
  let maxUeber = 0;
  for (let i = 0; i < n; i++) { const a = q[i], bx = Math.floor(a[0] / 2.5), by = Math.floor(a[1] / 2.5), bz = Math.floor(a[2] / 2.5);
    for (let x = bx - 1; x <= bx + 1; x++) for (let y = by - 1; y <= by + 1; y++) for (let z = bz - 1; z <= bz + 1; z++) { const l = H.get(x + ',' + y + ',' + z); if (!l) continue;
      for (const j of l) { if (j <= i + SKIP) continue; const b = q[j], dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], d = Math.hypot(dx, dy, dz);
        if (ZUG > 0 && d > D2 + 0.05 && d < D2 + 1.2 && it > 60 && it < IT - 300) { const u = ZUG * (d - D2 - 0.05) / (d || 1e-6); if (i > 0 && i < n - 1) { a[0] += dx * u; a[1] += dy * u; a[2] += dz * u; } if (j > 0 && j < n - 1) { b[0] -= dx * u; b[1] -= dy * u; b[2] -= dz * u; } }
        if (d < D2 + 0.02) { const u = (D2 + 0.02 - d) / 2 / (d || 1e-6); maxUeber = Math.max(maxUeber, D2 - d); if (i > 0 && i < n - 1) { a[0] -= dx * u; a[1] -= dy * u; a[2] -= dz * u; } if (j > 0 && j < n - 1) { b[0] += dx * u; b[1] += dy * u; b[2] += dz * u; } } } } }
  // Hindernisse und Rahmen
  let maxHin = 0;
  for (let i = 1; i < n - 1; i++) { const a = q[i], F = i < ENDE0 ? frA : (i > ENDE1 ? frE : fr);
    if (it % 2 === 0 || cache[i] < R + GAP + 0.3) { const c = F(a[0], a[1], a[2]); cache[i] = c; if (c < R + GAP + 0.02) { maxHin = Math.max(maxHin, R + GAP - c); const g = grad(F, a[0], a[1], a[2]), gl = Math.hypot(...g) || 1; const m = Math.min(0.3, R + GAP + 0.02 - c); for (let k = 0; k < 3; k++) a[k] += g[k] / gl * m; } }
    const rr = (i < ENDE0 || i > ENDE1) ? 9 : rahmen(a[0], a[1]); if (DRUCK > 0 && it > 60 && it < IT - 200 && rr > R - UEBER + 0.05) { const h = 0.05, gx = (rahmen(a[0] + h, a[1]) - rahmen(a[0] - h, a[1])) / (2 * h), gy = (rahmen(a[0], a[1] + h) - rahmen(a[0], a[1] - h)) / (2 * h), gl = Math.hypot(gx, gy) || 1; const m = DRUCK * Math.max(0, 1 - (rr - R + UEBER) / 3); a[0] -= gx / gl * m; a[1] -= gy / gl * m; }
    if (rr < R - UEBER) { const h = 0.05, gx = (rahmen(a[0] + h, a[1]) - rahmen(a[0] - h, a[1])) / (2 * h), gy = (rahmen(a[0], a[1] + h) - rahmen(a[0], a[1] - h)) / (2 * h), gl = Math.hypot(gx, gy) || 1, m = Math.min(0.2, R - UEBER - rr); a[0] += gx / gl * m; a[1] += gy / gl * m; } }
  p = q;
  if (it % 50 === 0 || it === IT - 1) console.error('it', it, 'Ueberlappung', maxUeber.toFixed(3), 'Hindernis', maxHin.toFixed(3));
}
// Tabelle: ca. 1 cm Abstand
let L = 0; for (let i = 1; i < n; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
const tab = resample(p, 0.95).map((a) => a.map((x) => +x.toFixed(2))); tab[0] = FLEX.slice(); tab[tab.length - 1] = BAUH.slice();
console.error('Laenge', L.toFixed(1), 'Punkte', tab.length, 'Leerdarm-Anteil (Gitter)', (W.leer / W.pfad.length).toFixed(2));
fs.writeFileSync('tab-' + SEED + '.json', JSON.stringify({ tab, leerAnteil: W.leer / W.pfad.length }));
