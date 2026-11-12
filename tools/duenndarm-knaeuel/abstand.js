// Abstand zu den Nachbarn: Dreiecke aus nachbarn.json in einem Hash-Gitter (Zelle 1 cm), exakter Punkt-Dreieck-Abstand
const fs = require('fs');
function ptTri(px, py, pz, t, o) {
  const ax = t[o], ay = t[o + 1], az = t[o + 2], bx = t[o + 3], by = t[o + 4], bz = t[o + 5], cx = t[o + 6], cy = t[o + 7], cz = t[o + 8];
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az, apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let qx, qy, qz;
  if (d1 <= 0 && d2 <= 0) { qx = ax; qy = ay; qz = az; } else {
    const bpx = px - bx, bpy = py - by, bpz = pz - bz, d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) { qx = bx; qy = by; qz = bz; } else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); qx = ax + v * abx; qy = ay + v * aby; qz = az + v * abz; } else {
        const cpx = px - cx, cpy = py - cy, cpz = pz - cz, d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) { qx = cx; qy = cy; qz = cz; } else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); qx = ax + w * acx; qy = ay + w * acy; qz = az + w * acz; } else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); qx = bx + w * (cx - bx); qy = by + w * (cy - by); qz = bz + w * (cz - bz); } else {
              const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; qx = ax + abx * v + acx * w; qy = ay + aby * v + acy * w; qz = az + abz * v + acz * w; } } } } } }
  const dx = px - qx, dy = py - qy, dz = pz - qz; return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
module.exports = function (datei, ohne) {
  const D = JSON.parse(fs.readFileSync(datei, 'utf8')); ohne = ohne || [];
  const T = [], S = []; for (const k in D) { if (ohne.includes(k)) continue; for (let i = 0; i < D[k].length; i += 9) { T.push(...D[k].slice(i, i + 9)); S.push(k); } }
  const t = Float64Array.from(T), n = S.length, C = 1.0, H = new Map();
  const key = (i, j, k) => (i + 100) * 1e6 + (j + 100) * 1e3 + (k + 100);
  for (let q = 0; q < n; q++) { const o = q * 9; let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (let j = 0; j < 3; j++) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], t[o + j * 3 + c]); mx[c] = Math.max(mx[c], t[o + j * 3 + c]); }
    for (let i = Math.floor(mn[0] / C); i <= Math.floor(mx[0] / C); i++) for (let j = Math.floor(mn[1] / C); j <= Math.floor(mx[1] / C); j++) for (let k = Math.floor(mn[2] / C); k <= Math.floor(mx[2] / C); k++) {
      const kk = key(i, j, k); let l = H.get(kk); if (!l) H.set(kk, l = []); l.push(q); } }
  // abstand(p, rmax): kleinster Abstand bis rmax (sonst rmax), dazu Name des naechsten Nachbarn
  const besucht = new Int32Array(n).fill(-1); let lauf = 0;
  function abstand(x, y, z, rmax) {
    lauf++; let best = rmax, wer = null; const R = Math.ceil(rmax / C);
    const i0 = Math.floor(x / C), j0 = Math.floor(y / C), k0 = Math.floor(z / C);
    for (let i = i0 - R; i <= i0 + R; i++) for (let j = j0 - R; j <= j0 + R; j++) for (let k = k0 - R; k <= k0 + R; k++) {
      const l = H.get(key(i, j, k)); if (!l) continue;
      for (const q of l) { if (besucht[q] === lauf) continue; besucht[q] = lauf; const d = ptTri(x, y, z, t, q * 9); if (d < best) { best = d; wer = S[q]; } } }
    return [best, wer];
  }
  return { abstand, anzahl: n };
};
if (require.main === module) {
  const K = require('./formen.js')(), v = K.Formen.verdauung, d = v.duenndarm(), A = d.achse;
  const N = module.exports('nachbarn.json');
  const duo = v.kette(v.kurve(v.BAHN.duodenum.pts, 8), 1.0, 3);
  let min = 1e9, wo = null, stat = {};
  for (let s = 0; s <= d.laenge; s += 0.3) { const p = A.punkt(s); const [a, w] = N.abstand(p[0], p[1], p[2], 3); const g = a - 0.9;
    const gd = duo(p[0], p[1], p[2]) - 0.9; 
    if (g < (stat[w] ?? 9)) stat[w] = +g.toFixed(3); if (gd < (stat.duo ?? 9)) stat.duo = +gd.toFixed(3);
    if (g < min) { min = g; wo = [s.toFixed(1), w, p.map(x => x.toFixed(2))]; } }
  console.log('Nachbar-Dreiecke', N.anzahl, 'min Luft', min.toFixed(3), wo, stat);
}
