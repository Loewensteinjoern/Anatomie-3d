const K = require('./formen.js')(process.argv[2] ? require('path').resolve(process.argv[2]) : undefined), v = K.Formen.verdauung, d = v.duenndarm(), A = d.achse, R = d.r;
const all = []; for (let s = 0; s <= d.laenge; s += 0.3) all.push([s, A.punkt(s)]);
function verdeckt(s, p) { let m = 0; for (const [t, q] of all) { if (Math.abs(t - s) < 3) continue; if (Math.hypot(q[0] - p[0], q[1] - p[1]) < R * 1.2 && q[2] > p[2]) m = Math.max(m, q[2] - p[2]); } return m; }
const out = [];
for (const LEN of [6, 7, 8, 9, 10, 11]) for (let s0 = 3; s0 + LEN < d.leerEnde; s0 += 0.5) {
  let rz = 0, ver = 0, zmin = 1e9;
  for (let s = s0; s <= s0 + LEN; s += 0.5) { const p = A.punkt(s), r = A.richtung(s); rz = Math.max(rz, Math.abs(r[2])); ver = Math.max(ver, verdeckt(s, p)); zmin = Math.min(zmin, p[2]); }
  if (rz < +(process.env.RZ || 0.45) && ver <= +(process.env.VER || 0)) out.push({ s0, s1: s0 + LEN, rz: +rz.toFixed(2), zmin: +zmin.toFixed(1), m: A.punkt(s0 + LEN / 2).map((x) => +x.toFixed(1)) });
}
out.sort((a, b) => (b.s1 - b.s0) - (a.s1 - a.s0) || a.rz - b.rz); console.log(out.slice(0, 12).map((o) => JSON.stringify(o)).join('\n'));
