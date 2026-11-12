// Weg durch die Lagen (Backbite mit festem Anfang), Leerdarm-Bereich zuerst
const fs = require('fs');
const SEED = +(process.argv[2] || 1), AB = +(process.env.AB || 0.9), ANT = +(process.env.LEER || 0.4);
const { frei, R, GAP, FLEX, BAUH } = require('./lagen.js');
const D = JSON.parse(fs.readFileSync('lagen-gitter.json', 'utf8')), { nx, ny, X, Y, lagen } = D, NL = lagen.length;
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = rng(SEED * 7919 + 13);
const zell = [], P = {}; // id = L*nx*ny + i*ny + j
for (let L = 0; L < NL; L++) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const z = lagen[L][i * ny + j]; if (z !== null) { const q = L * nx * ny + i * ny + j; zell.push(q); P[q] = [X[i], Y[j], z]; } }
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const NB = {};
for (const q of zell) { NB[q] = []; const L = Math.floor(q / (nx * ny)), i = Math.floor((q % (nx * ny)) / ny), j = q % ny;
  for (const [a, b, c] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) { const I = i + a, J = j + b, LL = L + c; if (I < 0 || J < 0 || LL < 0 || I >= nx || J >= ny || LL >= NL) continue;
    const r = LL * nx * ny + I * ny + J; if (!P[r]) continue; const p = P[q], s = P[r]; if (dist(p, s) > 3.4) continue;
    if (frei((p[0] + s[0]) / 2, (p[1] + s[1]) / 2, (p[2] + s[2]) / 2, R + GAP) < R + GAP - +(process.env.TOL || 0.3)) continue; NB[q].push(r); } }
{ // nur der groesste zusammenhaengende Bereich
  const ges = new Set(); let gross = [];
  for (const q of zell) if (!ges.has(q)) { const c = [q]; ges.add(q); for (let t = 0; t < c.length; t++) for (const r of NB[c[t]]) if (!ges.has(r)) { ges.add(r); c.push(r); } if (c.length > gross.length) gross = c; }
  const gs = new Set(gross); for (let t = zell.length - 1; t >= 0; t--) if (!gs.has(zell[t])) zell.splice(t, 1); }
const naechst = (p) => zell.reduce((b, q) => dist(P[q], p) < dist(P[b], p) ? q : b, zell[0]);
const q0 = naechst(FLEX), qE = naechst(BAUH);
const sc = (q) => P[q][0] * 0.8 + P[q][1] * 1.0;   // links (x+) oben
const nA = Math.round(zell.length * ANT), inA = {}; inA[q0] = 1;
{ const rand = [q0]; let c = 1; while (c < nA) { let gew = -1, gs = -1e9; for (const a of rand) for (const r of NB[a]) if (!inA[r] && r !== qE && sc(r) > gs) { gs = sc(r); gew = r; } if (gew < 0) break; inA[gew] = 1; rand.push(gew); c++; } }
const mA = {}, mB = {}; for (const q of zell) (inA[q] ? mA : mB)[q] = 1;
function weg(start, maske, ziel) {
  const n = Object.keys(maske).length; let W = [start]; const idx = {}; idx[start] = 0; let best = null;
  for (let it = 0; it < 3e6; it++) {
    const e = W[W.length - 1];
    if (ziel(e) && (!best || W.length > best.length)) { best = W.slice(); if (W.length >= AB * n && it > 5e4) return best; }
    const nbs = NB[e].filter((r) => maske[r]); const r = nbs[Math.floor(rnd() * nbs.length)];
    if (idx[r] === undefined || idx[r] < 0) { idx[r] = W.length; W.push(r); continue; }
    const j = idx[r]; if (j === W.length - 2) continue;
    const tail = W.splice(j + 1).reverse(); for (let t = 0; t < tail.length; t++) { W.push(tail[t]); idx[tail[t]] = j + 1 + t; }
  }
  console.error('Abdeckung nicht erreicht', best && best.length, n); return best;
}
const WA = weg(q0, mA, (e) => NB[e].some((r) => mB[r]));
const eA = WA[WA.length - 1], sB = NB[eA].filter((r) => mB[r]).sort((a, b) => sc(b) - sc(a))[0];
const nahE = (e) => dist(P[e], BAUH) < +(process.env.ENDR || 5.5);
const WB = weg(sB, mB, nahE);
// Ergaenzen: zwei freie Nachbarzellen c1-c2 zwischen W[k] und W[k+1] einfuegen
function ergaenze(Wg, maske) { let neu = true; const auf = new Set(Wg); while (neu) { neu = false;
  for (let k = 0; k + 1 < Wg.length && !neu; k++) for (const c1 of NB[Wg[k]]) { if (!maske[c1] || auf.has(c1)) continue; for (const c2 of NB[c1]) { if (!maske[c2] || auf.has(c2) || !NB[c2].includes(Wg[k + 1])) continue; Wg.splice(k + 1, 0, c1, c2); auf.add(c1); auf.add(c2); neu = true; break; } if (neu) break; } } return Wg; }
ergaenze(WA, mA); ergaenze(WB, mB);
// Umwege: zwischen W[k] und W[k+1] eine Kette freier Zellen (Laenge 2..8) einschieben, am laengsten zuerst
function umwege(Wg, maske, belegt) { let neu = true; while (neu) { neu = false; let best = null;
  for (let k = 0; k + 1 < Wg.length; k++) { const ziel = Wg[k + 1];
    const st = NB[Wg[k]].filter((c) => maske[c] && !belegt.has(c)).map((c) => [c]);
    while (st.length) { const pf = st.pop(), e = pf[pf.length - 1];
      if (pf.length >= 2 && NB[e].includes(ziel) && (!best || pf.length > best.pf.length)) best = { k, pf: pf.slice() };
      if (pf.length < 8) for (const c of NB[e]) if (maske[c] && !belegt.has(c) && !pf.includes(c)) st.push(pf.concat([c])); } }
  if (best) { Wg.splice(best.k + 1, 0, ...best.pf); best.pf.forEach((c) => belegt.add(c)); neu = true; } } }
{ const belegt = new Set(WA.concat(WB)); const alle = {}; for (const q of zell) alle[q] = 1; umwege(WA, mA, belegt); umwege(WB, alle, belegt); }
console.error('Zellen', zell.length, 'A', WA.length, '/', nA, 'B', WB.length, '/', zell.length - nA);
const pfad = WA.concat(WB).map((q) => P[q]);
fs.writeFileSync('weg-' + SEED + '.json', JSON.stringify({ pfad, leer: WA.length }));
{ const cc = (m) => { const s = new Set(), out = []; for (const q of Object.keys(m).map(Number)) if (!s.has(q)) { let c = []; const st = [q]; s.add(q); while (st.length) { const a = st.pop(); c.push(a); for (const r of NB[a]) if (m[r] && !s.has(r)) { s.add(r); st.push(r); } } out.push(c.length + ':' + c.slice(0,3).map(x=>P[x].map(v=>v.toFixed(0)).join('/')).join(' ')); } return out; };
  console.error('Komponenten A', cc(mA)); console.error('Komponenten B', cc(mB)); console.error('Grad 1 in B', Object.keys(mB).filter(q => NB[q].filter(r => mB[r]).length <= 1).length); }
{ // laengste gerade Strecke in der vorderen Lage (L = 0) im Leerdarm, quer (x) oder laengs (y)
  let best = { n: 0 }; const Lg = (q) => Math.floor(q / (nx * ny));
  for (let k = 0; k + 1 < WA.length; k++) { if (Lg(WA[k]) !== 0) continue; const d0 = WA[k + 1] - WA[k]; if (Lg(WA[k + 1]) !== 0 || (Math.abs(d0) !== 1 && Math.abs(d0) !== ny)) continue;
    let m = k + 1; while (m + 1 < WA.length && WA[m + 1] - WA[m] === d0) m++; const n = m - k + 1; if (n > best.n) best = { n, k, m, quer: Math.abs(d0) === ny }; }
  console.error('Gerade vorn im Leerdarm', JSON.stringify(best));
  const W2 = JSON.parse(fs.readFileSync('weg-' + SEED + '.json', 'utf8')); W2.gerade = best; fs.writeFileSync('weg-' + SEED + '.json', JSON.stringify(W2));
}
if (process.env.FREI) { const auf = new Set(WA.concat(WB)); const frei = zell.filter((q) => !auf.has(q)); console.error('nicht belegt', frei.length); for (const q of frei) console.error('  L' + Math.floor(q / (nx * ny)), P[q].map((x) => x.toFixed(1)).join(' '), 'Nachbarn', NB[q].length, NB[q].filter((r) => auf.has(r)).length); }
