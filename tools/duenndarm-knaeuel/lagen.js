// Duenndarm-Knaeuel v2: Lagen von vorn gesehen (2D-Gitterwege per Backbite), Tiefe aus der Bauchwand
// node lagen.js seed  (ENV: R, H, LAGEN, TOL)
const fs = require('fs');
const SEED = +(process.argv[2] || 1), R = +(process.env.R || 1.1), H = +(process.env.H || 2.35), GAP = +(process.env.GAP || 0.12), TOL = +(process.env.TOL || 0.3), NL = +(process.env.LAGEN || 2);
const K = require('./formen.js')(), v = K.Formen.verdauung, N = require('./abstand.js')('nachbarn.json');
const FLEX = v.FLEXUR.p, BAUH = v.BAUHIN.p;
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = rng(SEED);
const felder = [v.kette(v.kurve(v.BAHN.duodenum.pts, 8), 1.0, 3)];
const G = v.darmGefaesse(); const fest = (id) => !/^darmast|^darmvene|^arkade/.test(id);
for (const k of ['darmarterien', 'darmvenen', 'pfortader']) for (const g of G[k]) if (fest(g.id)) felder.push(v.kette(v.kurve(g.pts, 6), Math.max(g.r0, g.r1), 3));
const dk = v.dickdarm(), dkA = dk.achse, dkS = dk.abschnitte;
const N2 = require('./abstand.js')('nachbarn.json', ['dickdarm']);
function freiAnfang(x, y, z, rmax) { let [a] = N.abstand(x, y, z, rmax); for (let k = 1; k < felder.length; k++) { const d = felder[k](x, y, z); if (d < a) a = d; } const d2 = dk.sdf(x, y, z); if (d2 < a) a = d2; return a; }
function freiEnde(x, y, z, rmax) { let [a] = N2.abstand(x, y, z, rmax); for (const f of felder) { const d = f(x, y, z); if (d < a) a = d; } return a; }
function frei(x, y, z, rmax) { let [a] = N.abstand(x, y, z, rmax); for (const f of felder) { const d = f(x, y, z); if (d < a) a = d; } const d2 = dk.sdf(x, y, z); if (d2 < a) a = d2; return a; }
const RAHMEN = []; for (let s = 0; s <= dkS.absteigend[1]; s += 0.5) { const p = dkA.punkt(s); RAHMEN.push([p[0], p[1], dk.R0(s)]); }
function rahmen(x, y) { let m = 1e9; for (const q of RAHMEN) { const d = Math.hypot(x - q[0], y - q[1]) - q[2]; if (d < m) m = d; } return m; }
const UEBER = +(process.env.UEBER || 0.36);   // erlaubte Ueberdeckung des Dickdarms von vorn (cm)
module.exports = { freiAnfang, freiEnde, frei, rahmen, R, GAP, v, FLEX, BAUH, UEBER };
if (require.main !== module) return;
// Vordere Grenze je (x, y): von z = 3 nach vorn, bis der Abstand R + GAP unterschreitet
const BX = [+(process.env.X0 || -9.5), +(process.env.Y0 || 81.5), +(process.env.X1 || 10.5), +(process.env.YMAX || 96.5)], nx = Math.floor((BX[2] - BX[0]) / H) + 1, ny = Math.floor((BX[3] - BX[1]) / H) + 1;
const X = (i) => BX[0] + i * H + ((BX[2] - BX[0]) - (nx - 1) * H) / 2, Y = (j) => BX[1] + j * H;
function zVorn(x, y) {   // vorderster freier Punkt vor der Bauchwand: Ende des freien Abschnitts, nach dem die Haut kommt
  let letzt = null, best = null, z = 3; for (; z < 16; z += 0.1) { const f = frei(x, y, z, R + GAP + 0.05) >= R + GAP - TOL; if (f) letzt = z; else if (letzt !== null && letzt > z - 0.15) { const [, wer] = N.abstand(x, y, z, R + GAP + 0.3); if (wer === 'haut') { best = letzt; break; } best = best === null ? letzt : best; if (process.env.ALTZ) break; } }
  return best; }
const lagen = []; // je Lage: Gitter mit z oder null
for (let L = 0; L < NL; L++) lagen.push([]);
for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
  const x = X(i), y = Y(j), ok2 = rahmen(x, y) >= R - UEBER - TOL; const zf = ok2 ? zVorn(x, y) : null;
  for (let L = 0; L < NL; L++) { let z = zf === null ? null : zf - L * (2 * R + GAP + 0.05); if (z !== null && (z < 2.0 || z > 12.5 || frei(x, y, z, R + GAP) < R + GAP - TOL)) z = null; lagen[L][i * ny + j] = z; }
}
for (let L = NL - 1; L >= 0; L--) { console.error('Lage', L); for (let j = ny - 1; j >= 0; j--) { let s = Y(j).toFixed(1).padStart(5) + ' '; for (let i = nx - 1; i >= 0; i--) { const z = lagen[L][i * ny + j]; s += z === null ? '  . ' : z.toFixed(1).padStart(4); } console.error(s); } }
const n = lagen.reduce((s, l) => s + l.filter((z) => z !== null).length, 0);
console.error('Zellen', n, 'ca. Laenge', (n * H).toFixed(0));
fs.writeFileSync('lagen-gitter.json', JSON.stringify({ nx, ny, H, X: [...Array(nx).keys()].map(X), Y: [...Array(ny).keys()].map(Y), lagen }));
