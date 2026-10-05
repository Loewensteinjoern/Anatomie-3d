/* =====================================================================
   HERZ – Anatomie als Signed-Distance-Field (Einheit: cm)
   Koordinaten (Ansicht von vorn): x = linke Körperseite (Betrachter rechts),
   y = oben, z = vorn (zum Betrachter).
   ===================================================================== */
const HeartSDF = (function () {
  'use strict';
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sb = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const ad = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const ml = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function smin(a, b, k) { if (k <= 0) return a < b ? a : b; const h = Math.max(k - Math.abs(a - b), 0) / k; return (a < b ? a : b) - h * h * k * 0.25; }
  function smax(a, b, k) { return -smin(-a, -b, k); }
  const clamp = (x, a, b) => x < a ? a : (x > b ? b : x);
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- Primitive ---------- */
  function Ell(c, yAxis, zHint, r) {
    const ey = nrm(yAxis); let ez = sb(zHint, ml(ey, dt(zHint, ey))); ez = nrm(ez); const ex = crs(ey, ez);
    const m = Math.max(r[0], r[1], r[2]);
    return { c, ex, ey, ez, rx: r[0], ry: r[1], rz: r[2], lo: [c[0] - m, c[1] - m, c[2] - m], hi: [c[0] + m, c[1] + m, c[2] + m] };
  }
  function dEll(E, x, y, z) {
    const dx = x - E.c[0], dy = y - E.c[1], dz = z - E.c[2];
    let lx = (dx * E.ex[0] + dy * E.ex[1] + dz * E.ex[2]) / E.rx;
    const ly = (dx * E.ey[0] + dy * E.ey[1] + dz * E.ey[2]) / E.ry;
    let lz = (dx * E.ez[0] + dy * E.ez[1] + dz * E.ez[2]) / E.rz;
    if (E.taper) { const s = 1 + E.taper * Math.max(0, Math.min(1, ly)); lx *= s; lz *= s; }
    const k0 = Math.sqrt(lx * lx + ly * ly + lz * lz);
    const qx = lx / E.rx, qy = ly / E.ry, qz = lz / E.rz;
    const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
    return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(E.rx, E.ry, E.rz);
  }
  function RC(a, b, r1, r2) {
    const ba = sb(b, a), l2 = dt(ba, ba), rr = r1 - r2, a2 = l2 - rr * rr;
    const m = Math.max(r1, r2);
    return { a, b, ba, l2, rr, a2, il2: 1 / l2, r1, r2, lo: [Math.min(a[0], b[0]) - m, Math.min(a[1], b[1]) - m, Math.min(a[2], b[2]) - m], hi: [Math.max(a[0], b[0]) + m, Math.max(a[1], b[1]) + m, Math.max(a[2], b[2]) + m] };
  }
  function dRC(S, x, y, z) {
    const pax = x - S.a[0], pay = y - S.a[1], paz = z - S.a[2];
    const bx = S.ba[0], by = S.ba[1], bz = S.ba[2];
    const yv = pax * bx + pay * by + paz * bz, zv = yv - S.l2;
    const qx = pax * S.l2 - bx * yv, qy = pay * S.l2 - by * yv, qz = paz * S.l2 - bz * yv;
    const x2 = qx * qx + qy * qy + qz * qz, y2 = yv * yv * S.l2, z2 = zv * zv * S.l2;
    const k = Math.sign(S.rr) * S.rr * S.rr * x2;
    if (Math.sign(zv) * S.a2 * z2 > k) return Math.sqrt(x2 + z2) * S.il2 - S.r2;
    if (Math.sign(yv) * S.a2 * y2 < k) return Math.sqrt(x2 + y2) * S.il2 - S.r1;
    return (Math.sqrt(x2 * S.a2 * S.il2) + yv * S.rr) * S.il2 - S.r1;
  }
  function boxDist(lo, hi, x, y, z) {
    const dx = Math.max(lo[0] - x, 0, x - hi[0]), dy = Math.max(lo[1] - y, 0, y - hi[1]), dz = Math.max(lo[2] - z, 0, z - hi[2]);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  /* Röhre aus Kegelsegmenten; lumen = außen + Wand, offene Enden werden verlängert */
  function Tube(name, pts, rl, wall, openStart, openEnd) {
    const ro = rl.map(r => r + wall);
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) segs.push(RC(pts[i], pts[i + 1], ro[i], ro[i + 1]));
    const ext = [];
    if (openEnd) { const n = pts.length - 1, d = nrm(sb(pts[n], pts[n - 1])); ext.push(RC(pts[n], ad(pts[n], ml(d, ro[n] + 0.5)), rl[n], rl[n])); }
    if (openStart) { const d = nrm(sb(pts[0], pts[1])); ext.push(RC(pts[0], ad(pts[0], ml(d, ro[0] + 0.5)), rl[0], rl[0])); }
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (const s of segs.concat(ext)) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], s.lo[k]); hi[k] = Math.max(hi[k], s.hi[k]); }
    return { name, pts, rl, ro, wall, segs, ext, lo, hi };
  }
  function dTubeOuter(T, x, y, z) { let d = 1e9; for (const s of T.segs) { const v = dRC(s, x, y, z); if (v < d) d = v; } return d; }
  function dTubeLumen(T, x, y, z, dOuter) { let d = dOuter + T.wall; for (const s of T.ext) { const v = dRC(s, x, y, z); if (v < d) d = v; } return d; }
  /* nächster Punkt auf Polylinie (für Radialrichtung) */
  function closestOnPolyline(pts, p) {
    let best = null, bd = 1e9, bt = 0, bi = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], ab = sb(b, a); const t = clamp(dt(sb(p, a), ab) / dt(ab, ab), 0, 1);
      const q = lerp3(a, b, t); const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      if (d < bd) { bd = d; best = q; bt = t; bi = i; }
    }
    return { q: best, d: bd, seg: bi, t: bt };
  }

  /* =================== Anatomie-Parameter =================== */
  const A = {};
  // Längsachse der Kammern (Basis -> Spitze)
  A.axis = nrm([0.389, -0.902, 0.187]);
  A.base = [0.95, 0.55, -0.55];
  A.apex = [3.75, -5.85, 0.55];
  A.axLen = Math.hypot(A.apex[0] - A.base[0], A.apex[1] - A.base[1], A.apex[2] - A.base[2]);
  // Linke Kammer
  A.LVo = Ell([2.2, -2.2, -0.2], A.axis, [0, 0, 1], [2.75, 4.1, 2.5]);
  A.LVc = Ell([2.06, -1.88, -0.27], A.axis, [0, 0, 1], [1.72, 3.35, 1.55]);
  A.LVo.taper = 0.2; A.LVc.taper = 0.22;
  A.sept = 1.0; A.septOut = 0.7;
  // Rechte Kammer (Hohlraum = Ellipsoid minus LV-Hohlraum + Septum)
  A.rvAxis = nrm([0.25, -0.95, 0.15]);
  A.RVc = Ell([-0.65, -1.35, 0.55], A.rvAxis, [0, 0, 1], [2.2, 2.55, 1.36]);
  A.RVo = Ell([-0.65, -1.35, 0.55], A.rvAxis, [0, 0, 1], [2.65, 3.0, 1.81]);
  // Ausflussbahn rechts (Conus arteriosus) -> Pulmonalklappe
  A.Pv = [0.95, 2.4, 1.05]; A.nPv = nrm([0.12, 1.0, -0.3]); A.rPv = 1.1;
  A.RVOT = Tube('RVOT', [[-0.3, -0.8, 1.6], [0.25, 0.9, 1.85], ad(A.Pv, ml(A.nPv, -0.25))], [1.0, 1.02, 1.1], 0.45, false, false);
  // Ausflussbahn links -> Aortenklappe
  A.Av = [-0.95, 1.1, -0.15]; A.nAv = nrm([-0.25, 1.0, 0.18]); A.rAv = 1.1;
  A.LVOT = Tube('LVOT', [[1.1, -0.45, -0.45], [0.1, 0.35, -0.45], ad(A.Av, ml(A.nAv, -0.2))], [0.98, 0.95, 1.06], 0.6, false, false);
  // Vorhöfe
  A.RAc = Ell([-4.25, 1.9, -0.4], [0.1, 1, 0], [0, 0, 1], [1.4, 1.85, 1.55]);
  A.RAo = Ell([-4.25, 1.9, -0.4], [0.1, 1, 0], [0, 0, 1], [1.72, 2.17, 1.87]);
  A.RAext = Ell([-2.9, 2.35, -1.85], [0, 1, 0], [0, 0, 1], [1.25, 1.2, 0.95]);          // Sinus venarum (nach hinten-medial)
  A.RAextO = Ell([-2.9, 2.35, -1.85], [0, 1, 0], [0, 0, 1], [1.55, 1.5, 1.25]);
  A.RAu = Ell([-2.85, 3.3, 0.95], [0.85, 0.35, 0.4], [-0.6, 0.0, 0.8], [0.72, 1.05, 0.26]);    // rechtes Herzohr
  A.RAuO = Ell([-2.85, 3.3, 0.95], [0.85, 0.35, 0.4], [-0.6, 0.0, 0.8], [0.98, 1.3, 0.5]);
  A.LAc = Ell([2.9, 2.55, -2.3], [0, 1, 0], [0, 0, 1], [1.95, 1.35, 1.45]);
  A.LAo = Ell([2.9, 2.55, -2.3], [0, 1, 0], [0, 0, 1], [2.27, 1.67, 1.77]);
  A.LAm = Ell([0.35, 2.35, -2.55], [0, 1, 0], [0, 0, 1], [1.35, 1.05, 0.95]);
  A.LAmO = Ell([0.35, 2.35, -2.55], [0, 1, 0], [0, 0, 1], [1.62, 1.32, 1.22]);
  A.LAu = Ell([3.85, 3.25, -0.6], [-0.3, 0.35, 1.0], [0.85, 0.2, 0.3], [0.68, 1.0, 0.26]);   // linkes Herzohr
  A.LAuO = Ell([3.85, 3.25, -0.6], [-0.3, 0.35, 1.0], [0.85, 0.2, 0.3], [0.94, 1.26, 0.5]);
  // AV-Klappen (Ringe) – n zeigt in den Vorhof
  A.Tv = [-2.75, 0.4, 0.0]; A.nTv = nrm([-0.63, 0.65, -0.2]); A.rTv = 1.5;
  A.Mv = [2.35, 0.78, -1.25]; A.nMv = nrm([0.05, 0.82, -0.57]); A.rMv = 1.42;
  A.TvOri = RC(ad(A.Tv, ml(A.nTv, -1.1)), ad(A.Tv, ml(A.nTv, 1.1)), A.rTv - 0.05, A.rTv - 0.05);
  A.MvOri = RC(ad(A.Mv, ml(A.nMv, -1.0)), ad(A.Mv, ml(A.nMv, 1.1)), A.rMv - 0.05, A.rMv - 0.05);
  // Große Gefäße
  const av = (s) => ad(A.Av, ml(A.nAv, s));
  A.Ao = Tube('Aorta', [av(-0.35), av(0.85), av(1.9), [-1.9, 4.4, -0.1], [-1.5, 5.75, -0.7], [-0.25, 6.6, -1.75], [1.2, 6.45, -3.0], [2.05, 5.4, -4.35], [2.4, 3.8, -5.15], [2.5, 2.7, -5.3]],
    [1.05, 1.36, 1.2, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95, 0.95], 0.35, false, true);
  A.BCT = Tube('BCT', [[-1.05, 6.2, -1.2], [-1.3, 7.2, -1.1], [-1.65, 8.0, -1.0]], [0.55, 0.55, 0.52], 0.25, false, true);
  A.LCCA = Tube('LCCA', [[0.1, 6.6, -2.0], [0.2, 7.5, -2.0], [0.3, 8.1, -1.95]], [0.4, 0.4, 0.38], 0.22, false, true);
  A.LSA = Tube('LSA', [[1.0, 6.45, -2.85], [1.35, 7.3, -3.0], [1.7, 7.9, -3.1]], [0.45, 0.45, 0.43], 0.22, false, true);
  const pv = (s) => ad(A.Pv, ml(A.nPv, s));
  A.PT = Tube('Truncus', [pv(-0.3), pv(0.9), [1.25, 4.0, 0.15], [1.35, 4.8, -0.75]], [1.05, 1.3, 1.2, 1.1], 0.3, false, false);
  A.LPA = Tube('LPA', [[1.35, 4.8, -0.75], [2.9, 5.0, -1.5], [4.6, 4.9, -2.2]], [0.95, 0.88, 0.85], 0.28, false, true);
  A.RPA = Tube('RPA', [[1.35, 4.8, -0.75], [-0.3, 5.0, -2.95], [-2.2, 5.0, -3.45], [-4.3, 4.9, -3.55]], [0.95, 0.88, 0.85, 0.82], 0.28, false, true);
  A.SVC = Tube('SVC', [[-3.95, 2.9, -0.6], [-3.8, 5.3, -0.8], [-3.65, 7.7, -0.8]], [1.0, 1.0, 1.0], 0.3, false, true);
  A.IVC = Tube('IVC', [[-4.05, 0.7, -0.9], [-3.85, -1.5, -1.45], [-3.65, -3.3, -1.75]], [1.1, 1.1, 1.1], 0.3, false, true);
  A.LSPV = Tube('LSPV', [[3.9, 3.0, -2.75], [5.55, 3.45, -3.1]], [0.62, 0.6], 0.25, false, true);
  A.LIPV = Tube('LIPV', [[4.0, 2.0, -2.85], [5.55, 1.6, -3.2]], [0.62, 0.6], 0.25, false, true);
  A.RSPV = Tube('RSPV', [[1.9, 3.0, -2.95], [-0.3, 3.45, -3.95]], [0.62, 0.6], 0.25, false, true);
  A.RIPV = Tube('RIPV', [[1.9, 2.0, -3.05], [-0.3, 1.55, -3.95]], [0.62, 0.6], 0.25, false, true);
  // Lig. arteriosum (Botalli)
  A.LigA = RC([2.05, 5.1, -1.55], [1.2, 6.05, -2.55], 0.17, 0.15);
  // Koronarostien (kleine Kanäle in der Aortenwurzel)
  A.ostR = RC(av(0.75), ad(av(0.75), [-0.2, 0.25, 1.6]), 0.2, 0.2);
  A.ostL = RC(av(0.75), ad(av(0.75), [1.55, 0.2, -0.45]), 0.2, 0.2);
  // Papillarmuskeln (Basis in der Wand, Spitze Richtung Klappe)
  A.pap = [
    { id: 'LV_al', side: 'L', rc: RC([4.05, -2.85, -0.75], [3.35, -0.9, -0.85], 0.62, 0.3) },
    { id: 'LV_pm', side: 'L', rc: RC([2.35, -3.25, -1.95], [2.25, -1.05, -1.45], 0.6, 0.3) },
    { id: 'RV_ant', side: 'R', rc: RC([-2.75, -2.75, 0.25], [-2.35, -1.0, 0.2], 0.5, 0.26) },
    { id: 'RV_post', side: 'R', rc: RC([-1.25, -3.35, -0.35], [-1.6, -1.25, -0.25], 0.44, 0.24) },
    { id: 'RV_sep', side: 'R', rc: RC([0.05, -1.1, 0.25], [-0.95, -0.55, 0.15], 0.3, 0.18) }
  ];
  A.modBand = RC([0.2, -2.6, 0.45], [-2.55, -2.85, 0.35], 0.24, 0.26); // Moderatorband
  // Fossa ovalis (flache Delle im Vorhofseptum, von rechts)
  A.fossa = Ell([-1.75, 2.1, -1.8], [0, 1, 0], [1, 0, 0], [0.75, 0.7, 0.28]);

  /* ---- Trabekel (feine Muskelleisten) ---- */
  function trab(x, y, z) {
    const px = x - A.base[0], py = y - A.base[1], pz = z - A.base[2];
    const t = (px * A.axis[0] + py * A.axis[1] + pz * A.axis[2]) / A.axLen;
    const w = sstep(0.3, 0.75, t);
    if (w <= 0) return 0;
    const s = Math.sin(x * 4.1 + z * 2.3 + Math.sin(y * 1.7) * 1.2) * Math.sin(y * 3.3 - x * 1.4);
    return w * 0.11 * s;
  }

  /* ---------------- Schnittfläche: ebener Frontalschnitt wie im Lehrbuch ---------------- */
  // Ebene z = Z0, nur an der Pulmonalklappe sanft angehoben (damit sie im Schnitt liegt)
  A.Z0 = 0.1;
  function cutFexact(x, y) {
    const dx = x - A.Pv[0], dy = y - (A.Pv[1] + 0.1);
    const g = Math.exp(-(dx * dx + dy * dy) / (2 * 0.8 * 0.8));
    return A.Z0 + (A.Pv[2] - A.Z0 + 0.05) * g;
  }
  /* ---------------- Gefäße, die ganz bleiben (gehören komplett zum hinteren Teil) ---------------- */
  // jeder Eintrag: Röhre + Halbraum (Punkt, Richtung); nur jenseits davon bleibt das Gefäß ganz
  const KEEP = [];
  A.KEEP = KEEP;
  // Tabelle für schnelle Abfrage (bilinear)
  const CT = { x0: -7.0, y0: -7.2, st: 0.05, nx: 0, ny: 0, v: null };
  function buildCut() {
    CT.nx = Math.ceil((7.4 - CT.x0) / CT.st) + 1; CT.ny = Math.ceil((10.6 - CT.y0) / CT.st) + 1;
    CT.v = new Float32Array(CT.nx * CT.ny);
    for (let j = 0; j < CT.ny; j++) for (let i = 0; i < CT.nx; i++) CT.v[i + CT.nx * j] = cutFexact(CT.x0 + i * CT.st, CT.y0 + j * CT.st);
  }
  function cutF(x, y) {
    if (!CT.v) buildCut();
    let fx = (x - CT.x0) / CT.st, fy = (y - CT.y0) / CT.st;
    let i = Math.floor(fx), j = Math.floor(fy);
    if (i < 0) i = 0; if (j < 0) j = 0; if (i > CT.nx - 2) i = CT.nx - 2; if (j > CT.ny - 2) j = CT.ny - 2;
    const u = Math.min(1, Math.max(0, fx - i)), v = Math.min(1, Math.max(0, fy - j));
    const k = i + CT.nx * j, a = CT.v[k], b = CT.v[k + 1], c = CT.v[k + CT.nx], d = CT.v[k + CT.nx + 1];
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  /* ---------------- Gesamt-Gewebe ---------------- */
  A.SVC.k = 0.75; A.IVC.k = 0.75;
  A.openEnds = [];
  const tubesAll = [A.Ao, A.BCT, A.LCCA, A.LSA, A.PT, A.LPA, A.RPA, A.SVC, A.IVC, A.LSPV, A.LIPV, A.RSPV, A.RIPV];
  for (const T of tubesAll) { const n = T.pts.length - 1; A.openEnds.push({ p: T.pts[n], r: T.ro[n] }); }
  (function () {
    const av = (t) => ad(A.Av, ml(A.nAv, t)), pv = (t) => ad(A.Pv, ml(A.nPv, t));
    KEEP.push({ T: A.Ao, p: av(2.2), n: A.nAv });
    KEEP.push({ T: A.PT, p: pv(1.35), n: A.nPv });
    [A.BCT, A.LCCA, A.LSA, A.LPA, A.RPA].forEach((T) => KEEP.push({ T: T, p: null }));
    KEEP.push({ T: A.SVC, p: [0, 4.35, 0], n: [0, 1, 0] });
    KEEP.push({ T: A.IVC, p: [0, -0.7, 0], n: [0, -1, 0] });
    [A.LSPV, A.LIPV, A.RSPV, A.RIPV].forEach((T) => { const d = nrm(sb(T.pts[1], T.pts[0])); KEEP.push({ T: T, p: ad(T.pts[0], ml(d, 0.75)), n: d }); });
  })();
  // < 0: im ganz bleibenden Gefäßstück; out.plane = aktive Grenzebene (für saubere Schnittkanten)
  function keepSDF(x, y, z, out) {
    let best = 1e9, plane = null;
    for (const k of KEEP) {
      const T = k.T;
      if (boxDist(T.lo, T.hi, x, y, z) > 0.6) continue;
      const dT = dTubeOuter(T, x, y, z) - 0.14;
      let d = dT, pl = null;
      if (k.p) { const h = -((x - k.p[0]) * k.n[0] + (y - k.p[1]) * k.n[1] + (z - k.p[2]) * k.n[2]); if (h > d) { d = h; pl = k; } }
      if (d < best) { best = d; plane = pl; }
    }
    const dl = dRC(A.LigA, x, y, z) - 0.08;
    if (dl < best) { best = dl; plane = null; }
    if (out) out.plane = plane;
    return best;
  }
  const K_OUT = 0.55, K_VES = 0.35;

  // gibt Gewebe-SDF zurück; wenn comp übergeben, werden Komponenten eingetragen
  const outerEll = () => null;
  function tissue(x, y, z, comp) {
    // --- Außenformen ---
    const dLVo = dEll(A.LVo, x, y, z);
    const dRVo = dEll(A.RVo, x, y, z);
    const dRVOTo = dTubeOuter(A.RVOT, x, y, z);
    const dLVOTo = dTubeOuter(A.LVOT, x, y, z);
    let outer = smin(dLVo, dRVo, K_OUT);
    outer = smin(outer, dRVOTo, 0.5);
    outer = smin(outer, dLVOTo, 0.4);
    let dRAo = 1e9, dLAo = 1e9;
    if (comp || boxDist(A.RAo.lo, A.RAo.hi, x, y, z) < outer + 1.2 || boxDist(A.RAextO.lo, A.RAextO.hi, x, y, z) < outer + 1.2 || boxDist(A.RAuO.lo, A.RAuO.hi, x, y, z) < outer + 1.2)
      dRAo = smin(smin(dEll(A.RAo, x, y, z), dEll(A.RAextO, x, y, z), 0.6), dEll(A.RAuO, x, y, z), 0.45);
    if (comp || boxDist(A.LAo.lo, A.LAo.hi, x, y, z) < outer + 1.2 || boxDist(A.LAuO.lo, A.LAuO.hi, x, y, z) < outer + 1.2 || boxDist(A.LAmO.lo, A.LAmO.hi, x, y, z) < outer + 1.2)
      dLAo = smin(smin(dEll(A.LAo, x, y, z), dEll(A.LAuO, x, y, z), 0.45), dEll(A.LAmO, x, y, z), 0.6);
    outer = smin(outer, dRAo, K_OUT);
    outer = smin(outer, dLAo, K_OUT);
    // Gefäße
    let lumen = 1e9, lumAo = 1e9;
    const tv = comp ? {} : null;
    for (const T of tubesAll) {
      const bd = boxDist(T.lo, T.hi, x, y, z);
      if (bd > outer + K_VES + 0.05) { if (tv) tv[T.name] = [bd + 0.5, bd + 0.5]; continue; }
      const o = dTubeOuter(T, x, y, z);
      const l = dTubeLumen(T, x, y, z, o);
      if (T === A.Ao) lumAo = l;
      outer = smin(outer, o, T.k || K_VES);
      if (l < lumen) lumen = l;
      if (tv) tv[T.name] = [o, l];
    }
    const dLig = dRC(A.LigA, x, y, z);
    outer = smin(outer, dLig, 0.2);
    // Klappenringe bekommen immer eine Wand (keine Löcher nach außen)
    const dTvO = dRC(A.TvOri, x, y, z), dMvO = dRC(A.MvOri, x, y, z);
    outer = smin(outer, dTvO - 0.4, 0.5);
    outer = smin(outer, dMvO - 0.4, 0.5);
    if (!comp && outer > 0.3) return outer;
    // --- Hohlräume ---
    const dLVcE = dEll(A.LVc, x, y, z);
    const dLVOTl = dTubeLumen(A.LVOT, x, y, z, dLVOTo);
    let dLVc = smin(dLVcE, dLVOTl, 0.45);
    dLVc = smin(dLVc, dMvO, 0.3);
    const tr = trab(x, y, z);
    const dLVcT = dLVc + tr;
    const dRVcE = smax(dEll(A.RVc, x, y, z), -(dLVcE - A.sept), 0.35);
    const dRVOTl = dTubeLumen(A.RVOT, x, y, z, dRVOTo);
    let dRVc = smin(dRVcE, dRVOTl, 0.5);
    dRVc = smin(dRVc, dTvO, 0.3);
    // durchgehende Scheidewand: rechte und linke Seite dürfen sich nirgends berühren
    const dLVside = Math.min(dLVOTl, lumAo);
    dRVc = smax(dRVc, -(dLVside - A.septOut), 0.2);
    const dRVcT = dRVc + tr * 0.9;
    let dRAc = 1e9, dFos = 1e9;
    if (comp || dRAo < 0.8) {
      dRAc = smin(smin(dEll(A.RAc, x, y, z), dEll(A.RAext, x, y, z), 0.6), dEll(A.RAu, x, y, z), 0.35);
      dRAc = smin(dRAc, dTvO, 0.3);
      dFos = dEll(A.fossa, x, y, z);
      dRAc = smin(dRAc, dFos, 0.25);
      dRAc = smax(dRAc, -(Math.min(lumAo, dLVOTl, dLVcE) - 0.6), 0.2);
    }
    let dLAc = 1e9;
    if (comp || dLAo < 0.8) {
      dLAc = smin(smin(dEll(A.LAc, x, y, z), dEll(A.LAu, x, y, z), 0.35), dEll(A.LAm, x, y, z), 0.5);
      dLAc = smin(dLAc, dMvO, 0.3);
      dLAc = smax(dLAc, -(lumAo - 0.45), 0.2);
    }
    const cav = Math.min(dLVcT, dRVcT, dRAc, dLAc, lumen);
    let t = Math.max(outer, -cav);
    // Papillarmuskeln + Moderatorband
    let dPap = 1e9;
    for (const P of A.pap) { const v = dRC(P.rc, x, y, z); if (v < dPap) dPap = v; }
    const dMod = dRC(A.modBand, x, y, z);
    const dPM = Math.min(dPap, dMod);
    t = smin(t, dPM, 0.35);
    if (comp) {
      comp.dLVo = dLVo; comp.dRVo = smin(dRVo, dRVOTo, 0.5); comp.dRAo = dRAo; comp.dLAo = dLAo; comp.dLVOTo = dLVOTo;
      comp.dLVc = dLVc; comp.dLVcE = dLVcE; comp.dRVc = dRVc; comp.dRAc = dRAc; comp.dLAc = dLAc; comp.tubes = tv;
      comp.dPap = dPap; comp.dMod = dMod; comp.dLig = dLig; comp.dFos = dFos; comp.outer = outer; comp.cav = cav; comp.t = t;
    }
    return t;
  }

  /* ---------------- Regionen ---------------- */
  const R = {
    LV: 1, RV: 2, IVS: 3, LA: 4, RA: 5, IAS: 6, AO: 7, PT: 8, SVC: 9, IVC: 10, PV: 11, PAP: 12, LIG: 13
  };
  // Startebenen der Gefäße (Punkte unterhalb gehören nicht zum Gefäß)
  const startPlanes = {
    Aorta: { p: A.Av, n: A.nAv }, Truncus: { p: A.Pv, n: A.nPv },
    SVC: { p: [-3.9, 3.55, -1.15], n: nrm([0.05, 1, -0.05]) }, IVC: { p: [-4.0, 0.25, -1.55], n: nrm([0.1, -1, -0.2]) },
    LSPV: { p: [4.6, 3.2, -2.9], n: nrm([1, 0.25, -0.2]) }, LIPV: { p: [4.65, 1.85, -3.0], n: nrm([1, -0.23, -0.2]) },
    RSPV: { p: [1.15, 3.15, -3.25], n: nrm([-1, 0.2, -0.45]) }, RIPV: { p: [1.15, 1.85, -3.35], n: nrm([-1, -0.2, -0.4]) }
  };
  const tubeRegion = { Aorta: R.AO, BCT: R.AO, LCCA: R.AO, LSA: R.AO, Truncus: R.PT, LPA: R.PT, RPA: R.PT, SVC: R.SVC, IVC: R.IVC, LSPV: R.PV, LIPV: R.PV, RSPV: R.PV, RIPV: R.PV };

  const C = {};
  function classify(x, y, z) {
    tissue(x, y, z, C);
    // Kandidaten Gefäße
    let bestV = 1e9, bestR = 0;
    for (const name in C.tubes) {
      const [o, l] = C.tubes[name];
      let s = Math.max(o, -l);
      const sp = startPlanes[name];
      if (sp) { const h = (x - sp.p[0]) * sp.n[0] + (y - sp.p[1]) * sp.n[1] + (z - sp.p[2]) * sp.n[2]; if (h < 0) s = Math.max(s, -h * 2 + 0.01); }
      if (s < bestV) { bestV = s; bestR = tubeRegion[name]; }
    }
    const sLV = Math.max(Math.min(C.dLVo, C.dLVOTo), -C.dLVc);
    const sRV = Math.max(C.dRVo, -C.dRVc);
    const sRA = Math.max(C.dRAo, -C.dRAc);
    const sLA = Math.max(C.dLAo, -C.dLAc);
    let best = sLV, reg = R.LV;
    if (sRV < best) { best = sRV; reg = R.RV; }
    if (sRA < best) { best = sRA; reg = R.RA; }
    if (sLA < best) { best = sLA; reg = R.LA; }
    C.sH = best; C.sV = bestV; C.rH = reg; C.rV = bestR;
    if (C.dPap < 0.14 && C.dPap < C.outer - 0.05) return R.PAP;
    if (C.dMod < 0.12) return R.PAP;
    if (C.dLig < 0.1) return R.LIG;
    const nearLV = C.dLVcE < A.sept + 0.35, nearRV = C.dRVc < A.sept + 0.35;
    if (nearLV && nearRV && C.dLVo < -0.35 && C.dRVo < -0.1 && bestV > -0.05) { C.rH = R.IVS; return R.IVS; }
    if (C.dRAc < 0.75 && C.dLAc < 0.75 && bestV > -0.05) { C.rH = R.IAS; return R.IAS; }
    if (bestV < best + 0.02) reg = bestR;
    const cavs = [[C.dLVc, R.LV], [C.dRVc, R.RV], [C.dRAc, R.RA], [C.dLAc, R.LA]];
    for (const [d, r] of cavs) if (Math.abs(d) < 0.09 && bestV > -0.02) { if (r === R.LV && nearRV && C.dRVc < 0.4) continue; C.rH = r; return r; }
    return reg;
  }

  /* ---- Zusatzgrößen für Farbe/Bewegung ---- */
  function info(x, y, z) {
    tissue(x, y, z, C);
    return C;
  }

  return { A, R, C, tissue, classify, info, cutF, cutFexact, keepSDF, smin, smax, sstep, clamp, nrm, crs, dt, sb, ad, ml, lerp3, closestOnPolyline, dRC, dEll };
})();
//  = HeartSDF;

/* =====================================================================
   Gitter + Surface Nets: erzeugt aus dem SDF zwei Teile
   (Hinterteil: z < f(x,y), Vorderwand: z > f(x,y))
   ===================================================================== */
const HeartMesher = (function () {
  'use strict';
  function makeGrid(bounds, h) {
    const nx = Math.ceil((bounds[1][0] - bounds[0][0]) / h) + 1;
    const ny = Math.ceil((bounds[1][1] - bounds[0][1]) / h) + 1;
    const nz = Math.ceil((bounds[1][2] - bounds[0][2]) / h) + 1;
    return { o: bounds[0], h, nx, ny, nz };
  }

  // Wertet das Gewebefeld aus – blockweise, grobe Vorprüfung. Async mit Fortschritt.
  async function evalTissue(G, tissueFn, progress) {
    const { nx, ny, nz, h, o } = G;
    const N = nx * ny * nz;
    const T = new Float32Array(N);
    const B = 4; // Blockgröße
    const bx = Math.ceil((nx - 1) / B), by = Math.ceil((ny - 1) / B), bz = Math.ceil((nz - 1) / B);
    // grobe Ecken
    const cx = bx + 1, cy = by + 1, cz = bz + 1;
    const coarse = new Float32Array(cx * cy * cz);
    for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
      const gi = Math.min(i * B, nx - 1), gj = Math.min(j * B, ny - 1), gk = Math.min(k * B, nz - 1);
      coarse[i + cx * (j + cy * k)] = tissueFn(o[0] + gi * h, o[1] + gj * h, o[2] + gk * h);
    }
    const thr = 1.15 * B * h * Math.sqrt(3);
    let t0 = Date.now();
    for (let kb = 0; kb < bz; kb++) {
      for (let jb = 0; jb < by; jb++) for (let ib = 0; ib < bx; ib++) {
        let mn = 1e9, mx = -1e9;
        const c = [];
        for (let dk = 0; dk < 2; dk++) for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
          const v = coarse[(ib + di) + cx * ((jb + dj) + cy * (kb + dk))]; c.push(v);
          if (v < mn) mn = v; if (v > mx) mx = v;
        }
        const i0 = ib * B, j0 = jb * B, k0 = kb * B;
        const i1 = Math.min(i0 + B, nx - 1), j1 = Math.min(j0 + B, ny - 1), k1 = Math.min(k0 + B, nz - 1);
        const exact = !((mn > thr) || (mx < -thr));
        const ke = (kb === bz - 1) ? k1 : k1 - 1, je = (jb === by - 1) ? j1 : j1 - 1, ie = (ib === bx - 1) ? i1 : i1 - 1;
        for (let k = k0; k <= ke; k++) for (let j = j0; j <= je; j++) for (let i = i0; i <= ie; i++) {
          const idx = i + nx * (j + ny * k);
          if (exact) {
            T[idx] = tissueFn(o[0] + i * h, o[1] + j * h, o[2] + k * h);
          } else {
            const u = (i - i0) / B, v = (j - j0) / B, w = (k - k0) / B;
            const a = c[0] * (1 - u) + c[1] * u, b = c[2] * (1 - u) + c[3] * u;
            const d = c[4] * (1 - u) + c[5] * u, e = c[6] * (1 - u) + c[7] * u;
            T[idx] = (a * (1 - v) + b * v) * (1 - w) + (d * (1 - v) + e * v) * w;
          }
        }
      }
      if (progress && Date.now() - t0 > 40) { t0 = Date.now(); await progress((kb + 1) / bz); }
    }
    return T;
  }

  // Surface Nets für Feld F (Innen < 0)
  function surfaceNets(G, F) {
    const { nx, ny, nz, h, o } = G;
    const cellIdx = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
    const pos = [];
    const cornerOff = [];
    for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) cornerOff.push([i, j, k]);
    const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const val = new Float32Array(8);
    let nv = 0;
    for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      let mask = 0;
      for (let c = 0; c < 8; c++) {
        const off = cornerOff[c];
        const v = F[(i + off[0]) + nx * ((j + off[1]) + ny * (k + off[2]))];
        val[c] = v; if (v < 0) mask |= (1 << c);
      }
      if (mask === 0 || mask === 255) continue;
      let sx = 0, sy = 0, sz = 0, cnt = 0;
      for (const [a, b] of edges) {
        const va = val[a], vb = val[b];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb);
        const A = cornerOff[a], Bc = cornerOff[b];
        sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; cnt++;
      }
      pos.push(o[0] + (i + sx / cnt) * h, o[1] + (j + sy / cnt) * h, o[2] + (k + sz / cnt) * h);
      cellIdx[i + (nx - 1) * (j + (ny - 1) * k)] = nv++;
    }
    const idx = [];
    const cid = (i, j, k) => cellIdx[i + (nx - 1) * (j + (ny - 1) * k)];
    const P = pos;
    const d2 = (a, b) => { const dx = P[a * 3] - P[b * 3], dy = P[a * 3 + 1] - P[b * 3 + 1], dz = P[a * 3 + 2] - P[b * 3 + 2]; return dx * dx + dy * dy + dz * dz; };
    function quad(a, b, c, d, flip) {
      if (a < 0 || b < 0 || c < 0 || d < 0) return;
      if (flip) { const t = b; b = d; d = t; }
      if (d2(a, c) < d2(b, d)) idx.push(a, b, c, a, c, d); else idx.push(a, b, d, b, c, d);
    }
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v0 = F[i + nx * (j + ny * k)];
      const in0 = v0 < 0;
      // Kante in x
      if (i < nx - 1 && j > 0 && k > 0 && j < ny - 1 && k < nz - 1) {
        const v1 = F[(i + 1) + nx * (j + ny * k)];
        if (in0 !== (v1 < 0)) quad(cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k), !in0);
      }
      // Kante in y  (u = z, v = x)
      if (j < ny - 1 && i > 0 && k > 0 && i < nx - 1 && k < nz - 1) {
        const v1 = F[i + nx * ((j + 1) + ny * k)];
        if (in0 !== (v1 < 0)) quad(cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1), !in0);
      }
      // Kante in z  (u = x, v = y)
      if (k < nz - 1 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1) {
        const v1 = F[i + nx * (j + ny * (k + 1))];
        if (in0 !== (v1 < 0)) quad(cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k), !in0);
      }
    }
    return { positions: new Float32Array(pos), index: new Uint32Array(idx) };
  }

  // Felder für Hinterteil / Vorderwand
  function pieceFields(G, T, cutF, keepSDF) {
    const { nx, ny, nz, h, o } = G;
    const col = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) col[i + nx * j] = cutF(o[0] + i * h, o[1] + j * h);
    const back = new Float32Array(T.length), front = new Float32Array(T.length);
    for (let k = 0; k < nz; k++) {
      const z = o[2] + k * h;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const idx = i + nx * (j + ny * k), f = col[i + nx * j], t = T[idx];
        let K = 1e9;
        // ganz bleibende Gefäße gehören komplett zum hinteren Teil
        if (keepSDF && t < 0.5) K = keepSDF(o[0] + i * h, o[1] + j * h, z);
        back[idx] = Math.max(t, Math.min(z - f, K));
        front[idx] = Math.max(t, f - z, -K);
      }
    }
    return { back, front, col };
  }
  return { makeGrid, evalTissue, surfaceNets, pieceFields };
})();
//  = HeartMesher;

/* =====================================================================
   Aus Surface-Nets-Daten werden Regionen-Meshes mit Farben,
   Schnittflächen-Gruppe und Bewegungs-Morphs (Herzschlag) gebaut.
   ===================================================================== */
const HeartAssemble = (function () {
  'use strict';
  const S = HeartSDF, A = S.A, R = S.R;

  /* ---------- Farbpalette (sRGB 0..1) ---------- */
  const s2l = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const hex = h => [s2l(((h >> 16) & 255) / 255), s2l(((h >> 8) & 255) / 255), s2l((h & 255) / 255)];
  const PAL = {
    myoOut: hex(0xa8433a), myoAtr: hex(0x9d4046), inL: hex(0x8c3a32), inR: hex(0x5d7bb0), cut: hex(0xdca48c), cutRim: hex(0xe8c0a8),
    fat: hex(0xd6b36a),
    aoOut: hex(0xc9483a), aoIn: hex(0xd08b80), ptOut: hex(0x4f6cbf), ptIn: hex(0x8a9fd8),
    veinOut: hex(0x4f70b8), veinIn: hex(0x8aa2d6), pvOut: hex(0xc04c43), pvIn: hex(0xd08b83),
    papL: hex(0x9e4038), papR: hex(0x55709f), lig: hex(0xd9c7a8), vesselCut: hex(0xdca48c)
  };

  /* ---------- Bewegungsfelder ---------- */
  const ax = A.axis, base = A.base, L = A.axLen;
  const aoPts = A.Ao.pts, ptPts = A.PT.pts.concat(A.LPA.pts.slice(1)), rpaPts = A.RPA.pts;
  const LAcen = [2.2, 2.5, -2.4], RAcen = [-3.9, 2.0, -1.3];
  function motion(x, y, z, C) {
    // 1) Kammersystole: Ventilebene senkt sich Richtung Spitze + radiale Kontraktion
    const px = x - base[0], py = y - base[1], pz = z - base[2];
    const t = (px * ax[0] + py * ax[1] + pz * ax[2]) / L;         // 0 Basis .. 1 Spitze
    let g;
    if (t >= 0) g = Math.max(0, 1 - t); else g = Math.exp(-Math.pow(-t * L / 2.6, 2));
    const LONG = 1.05;
    let vx = ax[0] * LONG * g, vy = ax[1] * LONG * g, vz = ax[2] * LONG * g;
    // radial (nur Kammern)
    const wV = S.sstep(-0.12, 0.12, t) * (1 - S.sstep(0.93, 1.05, t));
    if (wV > 0) {
      const along = px * ax[0] + py * ax[1] + pz * ax[2];
      let rx = px - ax[0] * along, ry = py - ax[1] * along, rz = pz - ax[2] * along;
      // Achse leicht zur Kammermitte verschoben
      rx -= 0.9 * 0.35; ry -= 0.0; rz -= 0.0;
      const rl = Math.hypot(rx, ry, rz) || 1;
      const dL = Math.max(0, C.dLVc), dR = Math.max(0, C.dRVc);
      const wR = S.sstep(-0.4, 0.4, dL - dR);                          // 1 = näher am RV
      const cL = 0.55 + (0.16 - 0.55) * S.clamp(dL / 1.15, 0, 1);
      const cR = 0.42 + (0.2 - 0.42) * S.clamp(dR / 0.5, 0, 1);
      const c = (cL * (1 - wR) + cR * wR) * wV * Math.sin(Math.PI * S.clamp(t * 0.9 + 0.08, 0, 1));
      vx -= rx / rl * c; vy -= ry / rl * c; vz -= rz / rl * c;
    }
    // 2) Vorhofkontraktion
    let axx = 0, ayy = 0, azz = 0;
    const wLA = 1 - S.sstep(0.15, 0.9, Math.max(0, Math.min(C.dLAc, 1.2 - C.dLAo * 0) ) ), wRA = 1 - S.sstep(0.15, 0.9, Math.max(0, C.dRAc));
    const tAtr = S.sstep(-0.35, 0.05, -t);
    if (wLA > 0) { const f = 0.13 * wLA * tAtr; axx += (LAcen[0] - x) * f; ayy += (LAcen[1] - y) * f; azz += (LAcen[2] - z) * f; }
    if (wRA > 0) { const f = 0.13 * wRA * tAtr; axx += (RAcen[0] - x) * f; ayy += (RAcen[1] - y) * f; azz += (RAcen[2] - z) * f; }
    // 3) Windkessel: Aorta dehnt sich
    let ox = 0, oy = 0, oz = 0, qx = 0, qy = 0, qz = 0;
    const tv = C.tubes || {};
    const aoD = tv.Aorta ? tv.Aorta[0] : 9;
    if (aoD < 0.5) {
      const hAv = (x - A.Av[0]) * A.nAv[0] + (y - A.Av[1]) * A.nAv[1] + (z - A.Av[2]) * A.nAv[2];
      const w = (1 - S.sstep(-0.1, 0.5, aoD)) * S.sstep(0.2, 1.0, hAv);
      if (w > 0) { const cp = S.closestOnPolyline(aoPts, [x, y, z]); const dx = x - cp.q[0], dy = y - cp.q[1], dz = z - cp.q[2], dl = Math.hypot(dx, dy, dz) || 1; const a = 0.17 * w; ox = dx / dl * a; oy = dy / dl * a; oz = dz / dl * a; }
    }
    const ptD = Math.min(tv.Truncus ? tv.Truncus[0] : 9, tv.LPA ? tv.LPA[0] : 9, tv.RPA ? tv.RPA[0] : 9);
    if (ptD < 0.5) {
      const hPv = (x - A.Pv[0]) * A.nPv[0] + (y - A.Pv[1]) * A.nPv[1] + (z - A.Pv[2]) * A.nPv[2];
      const w = (1 - S.sstep(-0.1, 0.5, ptD)) * S.sstep(0.2, 1.0, hPv);
      if (w > 0) {
        const c1 = S.closestOnPolyline(ptPts, [x, y, z]), c2 = S.closestOnPolyline(rpaPts, [x, y, z]); const cp = c1.d < c2.d ? c1 : c2;
        const dx = x - cp.q[0], dy = y - cp.q[1], dz = z - cp.q[2], dl = Math.hypot(dx, dy, dz) || 1; const a = 0.13 * w; qx = dx / dl * a; qy = dy / dl * a; qz = dz / dl * a;
      }
    }
    // Aufteilung rechtes/linkes Herz (für getrenntes Anspannen im Handbetrieb)
    const sd = sideOf(C);
    return [vx * sd, vy * sd, vz * sd, vx * (1 - sd), vy * (1 - sd), vz * (1 - sd), axx, ayy, azz, ox, oy, oz, qx, qy, qz];
  }
  function sideOf(C) {
    const t = C.tubes || {};
    const g = (n) => (t[n] ? t[n][0] : 9);
    const dL = Math.min(C.dLVc, C.dLAc, g('Aorta') + 0.3, g('LSPV'), g('LIPV'), g('RSPV'), g('RIPV'));
    const dR = Math.min(C.dRVc, C.dRAc, g('Truncus') + 0.3, g('LPA'), g('RPA'), g('SVC'), g('IVC'));
    return S.sstep(-0.8, 0.8, dL - dR);   // 1 = rechts
  }
  // Nur Ventrikel-/Vorhof-Bewegung (für Klappen, Fäden, Leitungsbahnen)
  function motionSimple(x, y, z) { const C = S.info(x, y, z); return motion(x, y, z, C); }

  /* ---------- Rauschen für natürliche Farbvariation ---------- */
  function noise3(x, y, z) {
    return 0.5 * Math.sin(x * 3.1 + Math.sin(y * 2.3) * 1.7) * Math.sin(z * 2.7 + x * 0.8) + 0.3 * Math.sin(y * 7.3 + z * 5.1 + x * 2.2) * Math.sin(x * 6.1 - y * 1.9);
  }

  // Innenflächen wie im Lehrbuchbild: rechtes Herz blau, linkes Herz rot
  function baseColor(region, isCut, isInner, right) {
    if (isCut) {
      if (region === R.AO || region === R.PT || region === R.SVC || region === R.IVC || region === R.PV || region === R.LIG) return PAL.vesselCut;
      return PAL.cut;
    }
    switch (region) {
      case R.AO: return isInner ? PAL.aoIn : PAL.aoOut;
      case R.PT: return isInner ? PAL.ptIn : PAL.ptOut;
      case R.SVC: case R.IVC: return isInner ? PAL.veinIn : PAL.veinOut;
      case R.PV: return isInner ? PAL.pvIn : PAL.pvOut;
      case R.PAP: return right ? PAL.papR : PAL.papL;
      case R.LIG: return PAL.lig;
      case R.RA: return isInner ? PAL.inR : PAL.myoAtr;
      case R.LA: return isInner ? PAL.inL : PAL.myoAtr;
      case R.IAS: return isInner ? (right ? PAL.inR : PAL.inL) : PAL.myoAtr;
      case R.RV: return isInner ? PAL.inR : PAL.myoOut;
      case R.IVS: return isInner ? (right ? PAL.inR : PAL.inL) : PAL.myoOut;
      default: return isInner ? PAL.inL : PAL.myoOut;
    }
  }
  function colorFor(region, isCut, isInner, C, x, y, z) {
    const n = noise3(x, y, z);
    let c;
    const right = C ? Math.min(C.dRVc, C.dRAc) < Math.min(C.dLVc, C.dLAc) : false;
    if (C && region !== R.PAP && region !== R.LIG) {
      // weicher Übergang Herzwand <-> Gefäß
      const w = S.sstep(-0.09, 0.09, C.sH - C.sV);
      const ch = baseColor(C.rH, isCut, isInner, right), cv = baseColor(C.rV, isCut, isInner, right);
      c = [ch[0] + (cv[0] - ch[0]) * w, ch[1] + (cv[1] - ch[1]) * w, ch[2] + (cv[2] - ch[2]) * w];
    } else c = baseColor(region, isCut, isInner, right).slice();
    const k = 1 + (isCut ? 0.0 : 0.05) * n;
    c = [c[0] * k, c[1] * k, c[2] * k];
    if (!isCut && !isInner && C && (C.rH === R.LV || C.rH === R.RV || C.rH === R.RA || C.rH === R.LA)) {
      const dAtr = Math.min(C.dRAo, C.dLAo), dVen = Math.min(C.dLVo, C.dRVo);
      const av = Math.exp(-Math.pow((dAtr - dVen) / 0.35, 2)) * 0.6;
      const px = x - base[0], py = y - base[1], pz = z - base[2];
      const t = (px * ax[0] + py * ax[1] + pz * ax[2]) / L;
      const iv = Math.exp(-Math.pow((C.dLVo - C.dRVo) / 0.3, 2)) * 0.45 * S.sstep(0.02, 0.15, t) * (1 - S.sstep(0.85, 0.97, t));
      const wv = 1 - S.sstep(-0.09, 0.09, C.sH - C.sV);
      const f = Math.min(0.62, (av + iv) * (0.75 + 0.25 * n)) * wv;
      c = [c[0] + (PAL.fat[0] - c[0]) * f, c[1] + (PAL.fat[1] - c[1]) * f, c[2] + (PAL.fat[2] - c[2]) * f];
    }
    return c;
  }

  /* ---------- Hauptfunktion: Teil -> Regionen-Geometrien ---------- */
  // piece: {positions, index}; side: +1 (Hinterteil: Schnitt zeigt nach vorn) / -1 (Vorderwand)
  // Trilineare Abtastung des Gitterfeldes
  function makeSampler(G, T) {
    const { nx, ny, nz, h, o } = G;
    function val(x, y, z) {
      let fx = (x - o[0]) / h, fy = (y - o[1]) / h, fz = (z - o[2]) / h;
      let i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz);
      i = Math.max(0, Math.min(nx - 2, i)); j = Math.max(0, Math.min(ny - 2, j)); k = Math.max(0, Math.min(nz - 2, k));
      const u = fx - i, v = fy - j, w = fz - k;
      const id = i + nx * (j + ny * k), sx = 1, sy = nx, sz = nx * ny;
      const c000 = T[id], c100 = T[id + sx], c010 = T[id + sy], c110 = T[id + sx + sy];
      const c001 = T[id + sz], c101 = T[id + sx + sz], c011 = T[id + sy + sz], c111 = T[id + sx + sy + sz];
      const a = c000 + (c100 - c000) * u, b = c010 + (c110 - c010) * u, c = c001 + (c101 - c001) * u, d = c011 + (c111 - c011) * u;
      const e = a + (b - a) * v, f = c + (d - c) * v;
      return e + (f - e) * w;
    }
    function grad(x, y, z) {
      const d = h * 0.5;
      return [(val(x + d, y, z) - val(x - d, y, z)) / (2 * d), (val(x, y + d, z) - val(x, y - d, z)) / (2 * d), (val(x, y, z + d) - val(x, y, z - d)) / (2 * d)];
    }
    return { val, grad };
  }
  // Scharfe Kanten: Punkte exakt auf Gewebe- und Schnittfläche ziehen
  const KO = {};
  function sharpen(P, side, h, smp) {
    const nv = P.length / 3; let moved = 0;
    for (let v = 0; v < nv; v++) {
      let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      for (let it = 0; it < 3; it++) {
        const t = smp.val(x, y, z);
        const f = S.cutF(x, y);
        const gfx = (S.cutF(x + 0.02, y) - S.cutF(x - 0.02, y)) / 0.04, gfy = (S.cutF(x, y + 0.02) - S.cutF(x, y - 0.02)) / 0.04;
        let c = side * (z - f);
        const kv = S.keepSDF(x, y, z, KO);
        let nearT = Math.abs(t) < 0.75 * h, nearC = Math.abs(c) / Math.sqrt(1 + gfx * gfx + gfy * gfy) < 0.75 * h;
        if (kv < 0.6 * h) nearC = false;
        // Kappe eines ganz bleibenden Gefäßes (nur hinteres Teil, oberhalb der Schnittebene)
        let capN = null, capC = 0;
        if (side > 0 && KO.plane && Math.abs(kv) < 0.75 * h && z - f > 0.3 * h) {
          const kp = KO.plane; capN = [-kp.n[0], -kp.n[1], -kp.n[2]];
          capC = -((x - kp.p[0]) * kp.n[0] + (y - kp.p[1]) * kp.n[1] + (z - kp.p[2]) * kp.n[2]);
        }
        if (capN) { nearC = true; c = capC; }
        if (!nearT && !nearC) break;
        const a = smp.grad(x, y, z);
        let dx, dy, dz;
        if (nearT && nearC) {
          const fx = (S.cutF(x + 0.02, y) - S.cutF(x - 0.02, y)) / 0.04, fy = (S.cutF(x, y + 0.02) - S.cutF(x, y - 0.02)) / 0.04;
          const b = capN || [-fx * side, -fy * side, side];
          const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2], bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2], ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
          const det = aa * bb - ab * ab;
          if (det < 1e-4 * aa * bb || aa < 1e-8) { const k = -c / bb; dx = b[0] * k; dy = b[1] * k; dz = b[2] * k; }
          else {
            const l1 = (-t * bb + c * ab) / det, l2 = (-c * aa + t * ab) / det;
            dx = l1 * a[0] + l2 * b[0]; dy = l1 * a[1] + l2 * b[1]; dz = l1 * a[2] + l2 * b[2];
          }
        } else if (nearT) {
          const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2]; if (aa < 1e-8) break;
          const k = -t / aa; dx = a[0] * k; dy = a[1] * k; dz = a[2] * k;
          // nicht über die Schnittfläche hinausschieben
        } else {
          const fx = (S.cutF(x + 0.02, y) - S.cutF(x - 0.02, y)) / 0.04, fy = (S.cutF(x, y + 0.02) - S.cutF(x, y - 0.02)) / 0.04;
          const b = capN || [-fx * side, -fy * side, side]; const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
          const k = -c / bb; dx = b[0] * k; dy = b[1] * k; dz = b[2] * k;
        }
        const dl = Math.hypot(dx, dy, dz), mx = 0.45 * h;
        if (dl > mx) { dx *= mx / dl; dy *= mx / dl; dz *= mx / dl; }
        x += dx; y += dy; z += dz;
        if (dl < 1e-4) break;
      }
      if (x !== P[v * 3] || y !== P[v * 3 + 1] || z !== P[v * 3 + 2]) moved++;
      P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    }
    return moved;
  }

  function sharpenEnds(P, h) {
    const ends = A.openEnds, nv = P.length / 3, d = 0.03; const Cc = {};
    const f2 = (x, y, z) => { S.tissue(x, y, z, Cc); return [Cc.outer, Cc.cav]; };
    for (let v = 0; v < nv; v++) {
      let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      let near = false;
      for (const e of ends) { const dd = Math.hypot(x - e.p[0], y - e.p[1], z - e.p[2]); if (dd < e.r + 0.45) { near = true; break; } }
      if (!near) continue;
      for (let it = 0; it < 3; it++) {
        const [o, cv] = f2(x, y, z);
        if (Math.abs(o) > 0.8 * h || Math.abs(cv) > 0.8 * h) break;
        const px = f2(x + d, y, z), mx = f2(x - d, y, z), py = f2(x, y + d, z), my = f2(x, y - d, z), pz = f2(x, y, z + d), mz = f2(x, y, z - d);
        const a = [(px[0] - mx[0]) / (2 * d), (py[0] - my[0]) / (2 * d), (pz[0] - mz[0]) / (2 * d)];
        const b = [(px[1] - mx[1]) / (2 * d), (py[1] - my[1]) / (2 * d), (pz[1] - mz[1]) / (2 * d)];
        const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2], bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2], ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const det = aa * bb - ab * ab; if (det < 1e-4 * aa * bb) break;
        const l1 = (-o * bb + cv * ab) / det, l2 = (-cv * aa + o * ab) / det;
        let dx = l1 * a[0] + l2 * b[0], dy = l1 * a[1] + l2 * b[1], dz = l1 * a[2] + l2 * b[2];
        const dl = Math.hypot(dx, dy, dz), mxl = 0.45 * h; if (dl > mxl) { dx *= mxl / dl; dy *= mxl / dl; dz *= mxl / dl; }
        x += dx; y += dy; z += dz; if (dl < 1e-4) break;
      }
      P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    }
  }

  async function buildPiece(piece, side, h, smp, progress) {
    const P = piece.positions, I = piece.index;
    const nv = P.length / 3, nt = I.length / 3;
    if (smp) { sharpen(P, side, h, smp); sharpenEnds(P, h); }
    const reg = new Uint8Array(nv), inner = new Uint8Array(nv), onCut = new Uint8Array(nv);
    const col = new Float32Array(nv * 3), colC = new Float32Array(nv * 3), mo = new Float32Array(nv * 15);
    const cutN = new Float32Array(nv * 3);
    const eps = 0.45 * h;
    let tick = Date.now();
    for (let v = 0; v < nv; v++) {
      if (progress && (v & 1023) === 0 && Date.now() - tick > 45) { tick = Date.now(); await progress(v / nv); }
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      const r = S.classify(x, y, z);
      const C = S.C;
      reg[v] = r;
      const f = S.cutF(x, y);
      const gx = (S.cutF(x + 0.02, y) - S.cutF(x - 0.02, y)) / 0.04, gy = (S.cutF(x, y + 0.02) - S.cutF(x, y - 0.02)) / 0.04;
      const kv = S.keepSDF(x, y, z, KO);
      onCut[v] = Math.abs(z - f) / Math.sqrt(1 + gx * gx + gy * gy) < eps && kv > 0.3 * h ? 1 : 0;
      inner[v] = (C.cav < 0.08 && C.cav < -C.outer + 0.02) || (C.dPap < 0.1) ? 1 : 0;
      const fx = (S.cutF(x + 0.02, y) - S.cutF(x - 0.02, y)) / 0.04, fy = (S.cutF(x, y + 0.02) - S.cutF(x, y - 0.02)) / 0.04;
      let nx_ = -fx * side, ny_ = -fy * side, nz_ = side; const nl = Math.hypot(nx_, ny_, nz_);
      cutN[v * 3] = nx_ / nl; cutN[v * 3 + 1] = ny_ / nl; cutN[v * 3 + 2] = nz_ / nl;
      // Kappe eines ganz bleibenden Gefäßes: ebenfalls Schnittfläche
      if (side > 0 && KO.plane && Math.abs(kv) < eps && z - f > eps) {
        onCut[v] = 1; cutN[v * 3] = -KO.plane.n[0]; cutN[v * 3 + 1] = -KO.plane.n[1]; cutN[v * 3 + 2] = -KO.plane.n[2];
      }
      const c = colorFor(r, false, inner[v], C, x, y, z);
      col[v * 3] = c[0]; col[v * 3 + 1] = c[1]; col[v * 3 + 2] = c[2];
      const cc = colorFor(r, true, 0, C, x, y, z);
      colC[v * 3] = cc[0]; colC[v * 3 + 1] = cc[1]; colC[v * 3 + 2] = cc[2];
      const m = motion(x, y, z, C);
      for (let k = 0; k < 15; k++) mo[v * 15 + k] = m[k];
    }
    // Regionsgrenzen glätten: Hohlvenen an klaren Höhen vom Vorhof trennen, dann Mehrheitsentscheid der Nachbarn
    for (let v = 0; v < nv; v++) {
      const y = P[v * 3 + 1];
      if (reg[v] === R.SVC && y < 3.15) reg[v] = R.RA;
      else if (reg[v] === R.IVC && y > 0.25) reg[v] = R.RA;
    }
    {
      const nb = new Array(nv);
      for (let t = 0; t < nt; t++) {
        const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
        (nb[a] = nb[a] || []).push(b, c); (nb[b] = nb[b] || []).push(a, c); (nb[c] = nb[c] || []).push(a, b);
      }
      const cnt = new Uint16Array(32);
      for (let it = 0; it < 2; it++) {
        const nr = reg.slice();
        for (let v = 0; v < nv; v++) {
          const L = nb[v]; if (!L) continue;
          let mixed = false; for (const u of L) if (reg[u] !== reg[v]) { mixed = true; break; }
          if (!mixed) continue;
          cnt.fill(0); cnt[reg[v]] += 2; for (const u of L) cnt[reg[u]]++;
          let best = reg[v], bc = 0; for (let r = 0; r < 32; r++) if (cnt[r] > bc) { bc = cnt[r]; best = r; }
          nr[v] = best;
        }
        reg.set(nr);
      }
    }
    // Dreiecke klassifizieren + Normalen (Oberfläche) akkumulieren
    const triCut = new Uint8Array(nt), triReg = new Uint8Array(nt), triIn = new Uint8Array(nt);
    const nrm = new Float32Array(nv * 3);
    for (let t = 0; t < nt; t++) {
      const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
      const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
      const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
      const fnx = uy * vz - uz * vy, fny = uz * vx - ux * vz, fnz = ux * vy - uy * vx;
      const fl = Math.hypot(fnx, fny, fnz) || 1e-12;
      let isCut = 0;
      if (onCut[a] && onCut[b] && onCut[c]) {
        const d = (fnx * cutN[a * 3] + fny * cutN[a * 3 + 1] + fnz * cutN[a * 3 + 2]) / fl;
        if (d > 0.55) isCut = 1;
      }
      triCut[t] = isCut;
      triIn[t] = (inner[a] + inner[b] + inner[c]) >= 2 ? 1 : 0;
      // Region: Mehrheit
      const ra = reg[a], rb = reg[b], rc = reg[c];
      triReg[t] = (ra === rb || ra === rc) ? ra : (rb === rc ? rb : ra);
      if (!isCut) for (const v of [a, b, c]) { nrm[v * 3] += fnx; nrm[v * 3 + 1] += fny; nrm[v * 3 + 2] += fnz; }
    }
    // Pro Region Geometrie-Daten sammeln
    const out = {};
    const maps = {};
    for (let t = 0; t < nt; t++) {
      const r = triReg[t], cut = triCut[t];
      if (!out[r]) { out[r] = { pos: [], nor: [], col: [], mo: [], idxS: [], idxI: [], idxC: [] }; maps[r] = [new Map(), new Map()]; }
      const o = out[r], mp = maps[r][cut];
      for (let k = 0; k < 3; k++) {
        const v = I[t * 3 + k];
        let ni = mp.get(v);
        if (ni === undefined) {
          ni = o.pos.length / 3; mp.set(v, ni);
          o.pos.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
          if (cut) { o.nor.push(cutN[v * 3], cutN[v * 3 + 1], cutN[v * 3 + 2]); o.col.push(colC[v * 3], colC[v * 3 + 1], colC[v * 3 + 2]); }
          else { const l = Math.hypot(nrm[v * 3], nrm[v * 3 + 1], nrm[v * 3 + 2]) || 1; o.nor.push(nrm[v * 3] / l, nrm[v * 3 + 1] / l, nrm[v * 3 + 2] / l); o.col.push(col[v * 3], col[v * 3 + 1], col[v * 3 + 2]); }
          for (let q = 0; q < 15; q++) o.mo.push(mo[v * 15 + q]);
        }
        (cut ? o.idxC : (triIn[t] ? o.idxI : o.idxS)).push(ni);
      }
    }
    return out;
  }

  return { buildPiece, makeSampler, motion, motionSimple, PAL, colorFor };
})();
//  = HeartAssemble;

/* =====================================================================
   HERZKLAPPEN + SEHNENFÄDEN (explizite Geometrie mit Morph-Zielen)
   Morph-Treiber: 'V' Kammersystole, 'A' Vorhofsystole, 'O' Öffnungsgrad
   ===================================================================== */
const HeartValves = (function () {
  'use strict';
  const S = HeartSDF, A = S.A;
  const { nrm, crs, dt, sb, ad, ml, lerp3 } = S;
  const TAU = Math.PI * 2;

  function frame(n, hint) {
    let u = sb(hint, ml(n, dt(hint, n)));
    if (Math.hypot(u[0], u[1], u[2]) < 1e-3) u = crs(n, [0, 0, 1]);
    u = nrm(u); const w = crs(n, u);
    return { n, u, w };
  }
  const bez = (a, c, b, s) => { const k = 1 - s; return [k * k * a[0] + 2 * s * k * c[0] + s * s * b[0], k * k * a[1] + 2 * s * k * c[1] + s * s * b[1], k * k * a[2] + 2 * s * k * c[2] + s * s * b[2]]; };

  // Parametrische Fläche -> Positionen (closed/open) + Index
  function gridSurface(ns, nt, fnClosed, fnOpen) {
    const pc = [], po = [], idx = [], uv = [];
    for (let j = 0; j <= nt; j++) for (let i = 0; i <= ns; i++) {
      const s = i / ns, t = j / nt;
      const a = fnClosed(s, t), b = fnOpen(s, t);
      pc.push(a[0], a[1], a[2]); po.push(b[0], b[1], b[2]); uv.push(s, t);
    }
    for (let j = 0; j < nt; j++) for (let i = 0; i < ns; i++) {
      const a = i + (ns + 1) * j, b = a + 1, c = a + ns + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
    return { pc, po, idx, uv, ns, nt };
  }

  /* ---------- Taschenklappe (Aorten-/Pulmonalklappe) ---------- */
  function semilunar(C, n, R, H, phi0) {
    const F = frame(n, [0, 0, 1]);
    const dir = (phi) => ad(ml(F.u, Math.cos(phi)), ml(F.w, Math.sin(phi)));
    const cusps = [];
    const Z = ad(C, ml(n, 0.64 * H));
    for (let k = 0; k < 3; k++) {
      const p0 = phi0 + k * TAU / 3, span = TAU / 3;
      const Ra = R * 0.97;
      const att = (s) => { const ph = p0 + s * span; return ad(ad(C, ml(n, H * (1 - Math.sin(Math.PI * s)))), ml(dir(ph), Ra)); };
      const com0 = att(0), com1 = att(1);
      const fc = (s) => s < 0.5 ? lerp3(com0, Z, s * 2) : lerp3(Z, com1, s * 2 - 1);
      const fo = (s) => { const ph = p0 + s * span; return ad(ad(C, ml(n, H * (0.86 + 0.14 * (1 - Math.sin(Math.PI * s))))), ml(dir(ph), R * (0.8 + 0.17 * (1 - Math.sin(Math.PI * s))))); };
      const closed = (s, t) => {
        const a = att(s), f = fc(s); let p = lerp3(a, f, t);
        const b = Math.sin(Math.PI * t) * Math.sin(Math.PI * s);
        const ph = p0 + s * span;
        p = ad(p, ml(n, -0.32 * R * b)); p = ad(p, ml(dir(ph), 0.1 * R * b));
        return p;
      };
      const open = (s, t) => {
        const a = att(s), f = fo(s); let p = lerp3(a, f, t);
        const b = Math.sin(Math.PI * t) * Math.sin(Math.PI * s);
        const ph = p0 + s * span;
        p = ad(p, ml(dir(ph), -0.06 * R * b));
        return p;
      };
      cusps.push(gridSurface(14, 8, closed, open));
    }
    return cusps;
  }

  /* ---------- Segelklappe ---------- */
  // leaflets: [{a0, a1, len}] Winkel in Grad um u; coapt: 'center' | 'mitral'
  function atrioventricular(C, n, rA, rB, uHint, leaflets, kind) {
    const F = frame(n, uHint);
    const ann = (deg) => { const th = deg * Math.PI / 180; let p = ad(C, ad(ml(F.u, rA * Math.cos(th)), ml(F.w, rB * Math.sin(th)))); if (kind === 'mitral') p = ad(p, ml(n, 0.16 * Math.cos(2 * th))); return p; };
    const out = [];
    const Zc = ad(C, ml(n, -0.42));
    // Mitral: Schließungslinie als Bogen zwischen den Kommissuren
    let com1, com2, ctrl;
    if (kind === 'mitral') {
      com1 = ann(leaflets[0].a1); com2 = ann(leaflets[0].a0);
      const Zm = ad(ad(C, ml(n, -0.45)), ml(F.u, -0.32 * rA));
      ctrl = sb(ml(Zm, 2), ml(ad(com1, com2), 0.5));
    }
    leaflets.forEach((L, k) => {
      const a0 = L.a0, a1 = L.a1;
      const annS = (s) => ann(a0 + (a1 - a0) * s);
      const cA = annS(0), cB = annS(1);
      let fc;
      if (kind === 'mitral') {
        if (k === 0) fc = (s) => bez(com2, ctrl, com1, s);           // anteriores Segel
        else fc = (s) => ad(bez(com1, ctrl, com2, s), ml(n, -0.05));  // posteriores Segel
      } else {
        fc = (s) => s < 0.5 ? lerp3(cA, Zc, s * 2) : lerp3(Zc, cB, s * 2 - 1);
      }
      const len = (s) => L.len * (0.32 + 0.68 * Math.sin(Math.PI * s));
      const fo = (s) => { const a = annS(s); const inward = sb(C, a); return ad(ad(a, ml(n, -len(s) * 0.93)), ml(inward, 0.13)); };
      const closed = (s, t) => { const p = lerp3(annS(s), fc(s), t); const b = Math.sin(Math.PI * s) * Math.sin(Math.PI * t); return ad(p, ml(n, 0.13 * b)); };
      const open = (s, t) => { const a = annS(s), f = fo(s); const p = lerp3(a, f, t); const b = Math.sin(Math.PI * s) * Math.sin(Math.PI * t); return ad(p, ml(sb(a, C), 0.06 * b)); };
      const g = gridSurface(16, 9, closed, open);
      g.edgeClosed = fc; g.edgeOpen = fo; g.name = L.name;
      out.push(g);
    });
    return { leaflets: out, frame: F, ann };
  }

  /* ---------- Morph-Hilfen ---------- */
  function motionAt(p) { const m = HeartAssemble.motionSimple(p[0], p[1], p[2]); return [m.slice(0, 3), m.slice(3, 6), m.slice(6, 9)]; }

  function toGeometry(parts, withAtrial) {
    // parts: Array von gridSurface; baut eine Geometrie (closed = Basis)
    const pos = [], po = [], idx = [], uv = [];
    let off = 0;
    for (const g of parts) {
      for (let i = 0; i < g.pc.length; i++) { pos.push(g.pc[i]); po.push(g.po[i]); }
      for (const k of g.idx) idx.push(k + off);
      for (const k of g.uv) uv.push(k);
      off += g.pc.length / 3;
    }
    const nv = pos.length / 3;
    const mR = new Float32Array(nv * 3), mL = new Float32Array(nv * 3), mA = new Float32Array(nv * 3), mO = new Float32Array(nv * 3);
    for (let v = 0; v < nv; v++) {
      const p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
      const [dr, dl, da] = motionAt(p);
      for (let j = 0; j < 3; j++) { mR[v * 3 + j] = dr[j]; mL[v * 3 + j] = dl[j]; mA[v * 3 + j] = da[j]; mO[v * 3 + j] = po[v * 3 + j] - pos[v * 3 + j]; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const targets = [new THREE.Float32BufferAttribute(mR, 3), new THREE.Float32BufferAttribute(mL, 3)];
    const drivers = ['VR', 'VL'];
    if (withAtrial) { targets.push(new THREE.Float32BufferAttribute(mA, 3)); drivers.push('A'); }
    targets.push(new THREE.Float32BufferAttribute(mO, 3)); drivers.push('O');
    geo.morphAttributes.position = targets;
    geo.morphTargetsRelative = true;
    return { geo, drivers, raw: { pos, po } };
  }

  /* ---------- Sehnenfäden ---------- */
  function chordae(valve, papIds, rChord) {
    const tips = A.pap.filter(p => papIds.includes(p.id)).map(p => p.rc.b);
    const segs = [];
    valve.leaflets.forEach((g) => {
      for (const s of [0.2, 0.5, 0.8]) {
        const bC = g.edgeClosed(s), bO = g.edgeOpen(s);
        let best = tips[0], bd = 1e9;
        for (const tp of tips) { const d = Math.hypot(bO[0] - tp[0], bO[1] - tp[1], bO[2] - tp[2]); if (d < bd) { bd = d; best = tp; } }
        const jitter = [(Math.sin(s * 37) * 0.12), (Math.cos(s * 23) * 0.1), (Math.sin(s * 11) * 0.12)];
        const a = ad(best, jitter);
        segs.push({ a, bC, bO });
        // zweiter, feinerer Faden zur Segelmitte
      }
    });
    const RS = 5;
    function tube(a, b, r) {
      const d = sb(b, a); const L = Math.hypot(d[0], d[1], d[2]) || 1e-6; const n = ml(d, 1 / L);
      const F = frame(n, [0, 1, 0]);
      const ring = [];
      for (let e = 0; e < 2; e++) for (let k = 0; k < RS; k++) { const th = k / RS * TAU; const c = e ? b : a; ring.push(ad(c, ad(ml(F.u, Math.cos(th) * r), ml(F.w, Math.sin(th) * r)))); }
      return ring;
    }
    const pos = [], idx = [], mR = [], mL = [], mO = [];
    for (const sg of segs) {
      const r = sg.thin ? rChord * 0.7 : rChord;
      const base = tube(sg.a, sg.bC, r);
      const openR = tube(sg.a, sg.bO, r);
      const [ra, la] = motionAt(sg.a), [rb, lb] = motionAt(sg.bC);
      const movR = tube(ad(sg.a, ra), ad(sg.bC, rb), r), movL = tube(ad(sg.a, la), ad(sg.bC, lb), r);
      const off = pos.length / 3;
      for (let i = 0; i < base.length; i++) {
        pos.push(...base[i]);
        mO.push(...sb(openR[i], base[i]));
        mR.push(...sb(movR[i], base[i])); mL.push(...sb(movL[i], base[i]));
      }
      for (let k = 0; k < RS; k++) { const k2 = (k + 1) % RS; idx.push(off + k, off + k2, off + RS + k2, off + k, off + RS + k2, off + RS + k); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    geo.morphAttributes.position = [new THREE.Float32BufferAttribute(mR, 3), new THREE.Float32BufferAttribute(mL, 3), new THREE.Float32BufferAttribute(mO, 3)];
    geo.morphTargetsRelative = true;
    return { geo, drivers: ['VR', 'VL', 'O'], segs };
  }

  function build() {
    const res = {};
    // Mitralklappe: anteriores Segel zur Aortenklappe hin
    const mitral = atrioventricular(A.Mv, A.nMv, A.rMv * 1.03, A.rMv * 0.9, sb(A.Av, A.Mv), [
      { a0: -62, a1: 62, len: 2.05, name: 'anterior' }, { a0: 62, a1: 298, len: 1.3, name: 'posterior' }], 'mitral');
    const tricus = atrioventricular(A.Tv, A.nTv, A.rTv * 1.02, A.rTv * 0.92, [1, -0.2, 0.3], [
      { a0: -58, a1: 62, len: 1.55, name: 'septal' }, { a0: 62, a1: 188, len: 1.8, name: 'anterior' }, { a0: 188, a1: 302, len: 1.45, name: 'posterior' }], 'tri');
    res.mitral = toGeometry(mitral.leaflets, true); res.mitral.valve = mitral;
    res.tricus = toGeometry(tricus.leaflets, true); res.tricus.valve = tricus;
    res.aortic = toGeometry(semilunar(A.Av, A.nAv, A.rAv, 1.25, 0.35), false);
    res.pulm = toGeometry(semilunar(A.Pv, A.nPv, A.rPv, 1.2, 1.2), false);
    res.chordM = chordae(mitral, ['LV_al', 'LV_pm'], 0.027);
    res.chordT = chordae(tricus, ['RV_ant', 'RV_post', 'RV_sep'], 0.025);
    return res;
  }
  return { build };
})();
//  = HeartValves;

/* =====================================================================
   KORONARIEN, ERREGUNGSLEITUNG, BLUTFLUSS-PFADE
   ===================================================================== */
const HeartExtras = (function () {
  'use strict';
  const S = HeartSDF, A = S.A;
  const { nrm, crs, dt, sb, ad, ml, lerp3 } = S;
  const Cc = {};
  function comp(p) { S.tissue(p[0], p[1], p[2], Cc); return Cc; }
  function gradOf(fn, p, d) {
    d = d || 0.03;
    return [(fn([p[0] + d, p[1], p[2]]) - fn([p[0] - d, p[1], p[2]])) / (2 * d), (fn([p[0], p[1] + d, p[2]]) - fn([p[0], p[1] - d, p[2]])) / (2 * d), (fn([p[0], p[1], p[2] + d]) - fn([p[0], p[1], p[2] - d])) / (2 * d)];
  }
  const outerF = (p) => comp(p).outer;
  function projectTo(fn, p, off, it) {
    p = p.slice();
    for (let i = 0; i < (it || 10); i++) {
      const v = fn(p) - off; const g = gradOf(fn, p); const gg = g[0] * g[0] + g[1] * g[1] + g[2] * g[2] || 1e-6;
      let k = -v / gg; const st = Math.hypot(g[0] * k, g[1] * k, g[2] * k); if (st > 0.6) k *= 0.6 / st;
      p = ad(p, ml(g, k)); if (Math.abs(v) < 0.004) break;
    }
    return p;
  }
  // Rinne (Sulcus) finden: g=0 auf der Außenfläche
  function snapGroove(p, gFn, off) {
    for (let i = 0; i < 12; i++) {
      p = projectTo(outerF, p, off, 4);
      const v = gFn(p); const g = gradOf(gFn, p); const gg = g[0] * g[0] + g[1] * g[1] + g[2] * g[2] || 1e-6;
      let k = -v / gg * 0.7; const st = Math.hypot(g[0] * k, g[1] * k, g[2] * k); if (st > 0.35) k *= 0.35 / st;
      p = ad(p, ml(g, k));
    }
    return projectTo(outerF, p, off, 6);
  }
  const gAV = (p) => { const c = comp(p); return Math.min(c.dRAo, c.dLAo) - Math.min(c.dLVo, c.dRVo); };
  const gIV = (p) => { const c = comp(p); return c.dLVo - c.dRVo; };
  function resample(pts, step) {
    const out = [pts[0]]; let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]; const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      let t = step - acc;
      while (t < L) { out.push(lerp3(a, b, t / L)); t += step; }
      acc = L - (t - step);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function smoothPts(pts, n) { let p = pts.map(q => q.slice()); for (let k = 0; k < n; k++) { const q = p.map(v => v.slice()); for (let i = 1; i < p.length - 1; i++) for (let j = 0; j < 3; j++) q[i][j] = (p[i - 1][j] + 2 * p[i][j] + p[i + 1][j]) / 4; p = q; } return p; }

  /* ---------- Koronararterien ---------- */
  function ring(C, n, R, degs, hint) {
    let u = sb(hint, ml(n, dt(hint, n))); u = nrm(u); const w = crs(n, u);
    return degs.map(d => { const t = d * Math.PI / 180; return ad(C, ad(ml(u, R * Math.cos(t)), ml(w, R * Math.sin(t)))); });
  }
  function snapLim(p, gFn, off, maxMove) {
    const q = snapGroove(p, gFn, off);
    const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    return d <= maxMove ? q : projectTo(outerF, p, off, 10);
  }
  function coronaries() {
    const av = (s) => ad(A.Av, ml(A.nAv, s));
    const root = av(0.75);
    const OFF = 0.1;
    const onOuter = (p) => projectTo(outerF, p, OFF, 12);
    // RCA: rechte Kranzfurche von der Aortenwurzel um den rechten Rand nach hinten
    const rcaG = [[-2.6, 1.75, 1.6], [-3.6, 1.2, 1.55], [-4.35, 0.5, 1.1], [-4.5, -0.4, 0.45], [-4.2, -1.3, -0.3], [-3.6, -1.85, -1.1], [-2.8, -2.15, -1.8]];
    const rca = [onOuter(ad(root, [-0.5, 0.0, 1.3]))].concat(rcaG.map((p, i) => i < 3 ? snapLim(p, gAV, OFF, 0.8) : onOuter(p)));
    // RIVP: hintere Interventrikularfurche Richtung Herzspitze
    const pdG = [[-1.7, -2.75, -2.0], [-0.4, -3.6, -1.85], [0.9, -4.5, -1.5], [2.1, -5.3, -1.0]];
    const rivp = [rca[rca.length - 1]].concat(pdG.map((p) => onOuter(p)));
    // LCA-Hauptstamm hinter dem Truncus pulmonalis nach links
    const lcaStart = onOuter(ad(root, [1.4, 0.25, -0.2]));
    const bif = onOuter([2.65, 1.65, 0.3]);
    const lca = [lcaStart, onOuter(S.lerp3(lcaStart, bif, 0.5)), bif];
    // RIVA: vordere Interventrikularfurche bis um die Herzspitze
    const ladG = [[2.95, 0.6, 1.4], [2.65, -0.8, 1.9], [2.25, -2.2, 1.95], [1.9, -3.5, 1.65], [1.9, -4.6, 1.3], [2.7, -5.55, 0.8], [3.5, -5.95, 0.05]];
    const lad = [bif].concat(ladG.map((p, i) => i < 4 ? snapLim(p, gIV, OFF, 0.9) : onOuter(p)));
    // RCX: linke Kranzfurche nach hinten
    const lcxG = [[3.7, 1.35, 0.15], [4.55, 0.75, -0.7], [4.85, 0.15, -1.65], [4.45, -0.3, -2.6], [3.5, -0.6, -3.15]];
    const lcx = [bif].concat(lcxG.map(p => snapLim(p, gAV, OFF, 1.0)));
    const mk = (pts, r0, r1, name) => ({ name, pts: smoothPts(resample(pts, 0.3), 4).map(p => onOuter(p)), r0, r1 });
    return [mk(rca, 0.17, 0.13, 'RCA'), mk(rivp, 0.12, 0.07, 'RIVP'), mk(lca, 0.2, 0.19, 'LCA'), mk(lad, 0.17, 0.07, 'RIVA'), mk(lcx, 0.15, 0.08, 'RCX')];
  }

  /* ---------- Erregungsleitungssystem ---------- */
  function conduction() {
    const cavF = (key) => (p) => comp(p)[key];
    const onCav = (key, p, off) => projectTo(cavF(key), p, off === undefined ? -0.06 : off, 12);
    const onCut = (x, y) => [x, y, S.cutF(x, y) + 0.05];
    // Septum-Ränder auf der Schnittfläche
    function septumEdges(y) {
      let rv = null, lv = null, prevR = null, prevL = null;
      for (let x = -2.5; x <= 4.5; x += 0.02) {
        const c = comp([x, y, S.cutF(x, y)]);
        const inR = c.dRVc < 0, inL = c.dLVc < 0;
        if (prevR === true && inR === false && rv === null) rv = x;
        if (prevL === false && inL === true && rv !== null && lv === null) lv = x;
        prevR = inR; prevL = inL;
      }
      return rv !== null && lv !== null && lv > rv ? { rv, lv } : null;
    }
    const left = [], right = [];
    for (let y = -0.2; y >= -5.4; y -= 0.3) {
      const e = septumEdges(y); if (!e) continue;
      const wdt = e.lv - e.rv; if (wdt < 0.3 || wdt > 2.4) continue;
      right.push(onCut(e.rv + Math.min(0.22, wdt * 0.22), y));
      left.push(onCut(e.lv - Math.min(0.22, wdt * 0.22), y));
    }
    // Linie in der Kammerwand entlang der Innenkante der Schnittfläche (wie im Lehrbuchbild)
    function ring(key, c, a0, a1, inset, n) {
      const out = [];
      for (let i = 0; i <= n; i++) {
        const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
        const x0 = c[0] + dx * 0.2, y0 = c[1] + dy * 0.2;
        if (comp([x0, y0, S.cutF(x0, y0)])[key] >= 0) continue;
        let found = null;
        for (let r = 0.2; r < 6.5; r += 0.04) {
          const x = c[0] + dx * r, y = c[1] + dy * r;
          if (comp([x, y, S.cutF(x, y)])[key] >= 0) { found = r; break; }
        }
        if (found === null) continue;
        const x = c[0] + dx * (found + inset), y = c[1] + dy * (found + inset);
        if (S.tissue(x, y, S.cutF(x, y) - 0.06) > -0.02) continue;
        out.push(onCut(x, y));
      }
      return out;
    }
    const hisTop = right.length ? lerp3(right[0], left[0], 0.5) : [0.3, -0.2, 0.9];
    const sa = projectTo(outerF, [-5.35, 3.05, -0.85], -0.08);
    const avn = onCav('dRAc', [-2.45, 0.95, -1.15], 0.04);
    // Vorhofbahnen: zwei Bögen durch die Wand des rechten Vorhofs zum AV-Knoten
    const internodal = smoothPts([sa, onCav('dRAc', [-4.9, 2.2, -1.4]), onCav('dRAc', [-4.0, 1.2, -1.5]), onCav('dRAc', [-3.1, 0.9, -1.4]), avn], 2);
    const internodal2 = smoothPts([sa, onCav('dRAc', [-5.5, 1.9, -0.8]), onCav('dRAc', [-5.0, 0.6, -1.0]), onCav('dRAc', [-3.8, 0.35, -1.2]), avn], 2);
    const bach = smoothPts([sa, onCav('dRAc', [-4.4, 3.4, -1.4]), onCav('dRAc', [-3.2, 3.2, -2.0]), onCav('dRAc', [-2.2, 2.9, -2.6])], 2);
    const his = smoothPts([avn, lerp3(avn, hisTop, 0.35), lerp3(avn, hisTop, 0.7), hisTop], 1);
    // Tawara-Schenkel die Scheidewand hinab, dann Purkinje-Fasern um die Spitze und die freien Wände hinauf
    const lvRing = ring('dLVc', [2.7, -2.5], -150, 42, 0.26, 40);
    const lvRing2 = ring('dLVc', [2.7, -2.5], -112, 12, 0.55, 28);
    const rvRing = ring('dRVc', [-1.4, -1.7], -25, -200, 0.24, 34);
    const lb = smoothPts(resample([hisTop].concat(left, lvRing.length ? [lvRing[0]] : []), 0.3), 3);
    const rb = smoothPts(resample([hisTop].concat(right, rvRing.length ? [rvRing[0]] : []), 0.3), 3);
    const pk = [];
    if (lvRing.length > 3) pk.push(smoothPts(lvRing, 3));
    if (rvRing.length > 3) pk.push(smoothPts(rvRing, 3));
    // Abzweig über das Moderatorband zum vorderen Papillarmuskel
    const mb0 = A.modBand.a, mb1 = A.modBand.b;
    const near = right.reduce((b, p) => (Math.abs(p[1] - mb0[1]) < Math.abs(b[1] - mb0[1]) ? p : b), right[0] || hisTop);
    pk.push(smoothPts([near, ad(mb0, [0, 0.12, 0.26]), ad(lerp3(mb0, mb1, 0.5), [0, 0.28, 0.1]), ad(mb1, [0, 0.3, 0.05])], 2));
    return { sa, avn, paths: { internodal, internodal2, bach, his, lb, rb, pk } };
  }

  /* ---------- Wege der Blutportionen (Windkessel-Physik) ---------- */
  // Jeder Weg: Punkte mit virtuellen Längen; unsichtbare Abschnitte = Lunge bzw. Körper
  function wkPaths() {
    const av = (s) => ad(A.Av, ml(A.nAv, s)), pv = (s) => ad(A.Pv, ml(A.nPv, s));
    const RAc = [-4.05, 2.0, -0.65], RVb = [-1.4, -1.7, 0.2], LAc = [2.8, 2.45, -2.45], LVb = [2.7, -2.5, -0.55];
    // Weg aus Abschnitten: {pts, vis, col, len?}
    function build(name, parts, opt) {
      // Punkte und Abschnitte zusammenführen: seg[i] verbindet pts[i] -> pts[i+1]
      // unsichtbare Abschnitte wurden als eigene Einträge eingefügt -> neu aufbauen
      const P2 = [], S2 = [];
      let k = 0;
      for (const pa of parts) {
        if (pa.hidden) { S2.push({ vis: false, col: pa.col, len: pa.hidden, pend: true }); continue; }
        pa.pts.forEach((q, i) => {
          if (P2.length && i === 0) {
            const last = S2[S2.length - 1];
            if (last && last.pend) { last.pend = false; P2.push(q); return; }
            const r = P2[P2.length - 1]; if (Math.hypot(r[0] - q[0], r[1] - q[1], r[2] - q[2]) < 1e-6) return;
            S2.push({ vis: true, col: pa.col });
          } else if (P2.length) S2.push({ vis: true, col: pa.col });
          P2.push(q);
        });
      }
      const d = [0];
      for (let i = 0; i < S2.length; i++) {
        const a = P2[i], b = P2[i + 1];
        const L = S2[i].vis ? Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) : S2[i].len;
        S2[i].L = L; d.push(d[i] + L);
      }
      const at = (q) => { // Abstand entlang des Weges zum nächstgelegenen Punkt q
        let best = 0, bd = 1e9;
        for (let i = 0; i < S2.length; i++) {
          if (!S2[i].vis) continue;
          const a = P2[i], b = P2[i + 1]; const ab = sb(b, a); const L2 = dt(ab, ab) || 1e-9;
          const t = Math.max(0, Math.min(1, dt(sb(q, a), ab) / L2)); const c = ad(a, ml(ab, t));
          const dd = Math.hypot(c[0] - q[0], c[1] - q[1], c[2] - q[2]);
          if (dd < bd) { bd = dd; best = d[i] + t * S2[i].L; }
        }
        return best;
      };
      const w = Object.assign({ name, pts: P2, seg: S2, d, len: d[d.length - 1] }, opt);
      w.klappeBei = at(opt.klappe);
      if (opt.jet) w.jet = w.klappeBei + opt.jet;
      if (opt.einP) { w.ein = at(opt.einP); w.tor = at(opt.torP); }
      const hi = S2.findIndex(sg => !sg.vis);
      if (hi >= 0 && name.startsWith('lunge')) { w.luEin = d[hi]; w.luTor = d[hi + 1]; }
      w.mot = P2.map(q => HeartAssemble.motionSimple(q[0], q[1], q[2]));
      return w;
    }
    const B = 'b', Rr = 'r';
    const W = {};
    W.rechtsRein = build('rechtsRein', [{ pts: [RAc, S.lerp3(RAc, A.Tv, 0.55), A.Tv, ad(A.Tv, ml(A.nTv, -0.95)), RVb], col: B }], { klappe: A.Tv, tempo: 20, abstand: 0.55, ziel: 'rv' });
    W.linksRein = build('linksRein', [{ pts: [LAc, S.lerp3(LAc, A.Mv, 0.55), A.Mv, ad(A.Mv, ml(A.nMv, -0.95)), LVb], col: Rr }], { klappe: A.Mv, tempo: 20, abstand: 0.55, ziel: 'lv' });
    const rvOut = [[0.25, 0.95, 1.55], pv(-0.25), pv(0.6), [1.25, 4.0, 0.0], [1.35, 4.75, -0.9]];
    W.lungeLinks = build('lungeLinks', [{ pts: rvOut.concat([[2.9, 5.0, -1.6], [4.6, 4.9, -2.3]]), col: B }, { hidden: 24, col: Rr },
      { pts: [A.LSPV.pts[1], A.LSPV.pts[0], LAc], col: Rr }], { jet: 2.5, klappe: A.Pv, tempo: 8.3, abstand: 0.85, ziel: 'la' });
    W.lungeRechts = build('lungeRechts', [{ pts: rvOut.concat([[-0.3, 5.0, -3.05], [-2.2, 5.0, -3.55], [-4.3, 4.9, -3.65]]), col: B }, { hidden: 22, col: Rr },
      { pts: [A.RSPV.pts[1], A.RSPV.pts[0], LAc], col: Rr }], { jet: 2.5, klappe: A.Pv, tempo: 8.3, abstand: 0.85, ziel: 'la' });
    const lvOut = [[0.35, 0.15, -0.45], [0.1, 0.35, -0.45], av(-0.25), av(0.85), av(1.9), [-1.9, 4.4, -0.3], [-1.5, 5.75, -0.9]];
    const TOR = [-1.5, 5.75, -0.9];
    W.koerperOben = build('koerperOben', [{ pts: lvOut.concat([[-1.05, 6.25, -1.3], [-1.3, 7.2, -1.2], [-1.65, 8.0, -1.1]]), col: Rr }, { hidden: 40, col: B },
      { pts: [[-3.65, 7.7, -0.9], [-3.8, 5.3, -0.9], [-3.95, 2.9, -0.7], RAc], col: B }], { jet: 2.5, klappe: A.Av, einP: av(1.0), torP: TOR, tempo: 8.3, abstand: 0.6, ziel: 'ra' });
    W.koerperUnten = build('koerperUnten', [{ pts: lvOut.concat([[-0.25, 6.6, -1.95], [1.2, 6.45, -3.15], [2.05, 5.4, -4.45], [2.4, 3.8, -5.25], [2.5, 2.7, -5.4]]), col: Rr }, { hidden: 44, col: B },
      { pts: [[-3.65, -3.3, -1.85], [-3.85, -1.5, -1.55], [-4.05, 0.7, -1.0], RAc], col: B }], { jet: 2.5, klappe: A.Av, einP: av(1.0), torP: TOR, tempo: 8.3, abstand: 0.6, ziel: 'ra' });
    return W;
  }
  // Punkt auf einem Weg (d = virtueller Abstand)
  function wkPoint(w, d, out) {
    let i = 0; while (i < w.seg.length - 1 && w.d[i + 1] < d) i++;
    const sg = w.seg[i]; const t = Math.max(0, Math.min(1, (d - w.d[i]) / (sg.L || 1)));
    out.vis = sg.vis; out.col = sg.col;
    if (!sg.vis) return out;
    const a = w.pts[i], b = w.pts[i + 1], ma = w.mot[i], mb = w.mot[i + 1];
    for (let j = 0; j < 3; j++) out.p[j] = a[j] + (b[j] - a[j]) * t;
    for (let j = 0; j < 15; j++) out.m[j] = ma[j] + (mb[j] - ma[j]) * t;
    out.tan[0] = b[0] - a[0]; out.tan[1] = b[1] - a[1]; out.tan[2] = b[2] - a[2];
    return out;
  }
  // Ruheplätze für gesammeltes Blut in den Herzhöhlen
  function chamberSlots() {
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const defs = {
      ra: { key: 'dRAc', c: [-4.2, 1.9, -0.9], plane: [A.Tv, A.nTv, 0.6], box: [[-6.2, -0.5, -3.0], [-2.2, 4.0, 1.3]], zoff: 0.3, inner: -0.38 },
      la: { key: 'dLAc', c: [3.0, 2.4, -2.6], plane: [A.Mv, A.nMv, 0.7], box: [[0.8, 0.8, -4.6], [5.4, 4.2, -0.6]], zoff: -0.3, inner: -0.45 },
      rv: { key: 'dRVc', c: [-1.6, -1.8, -0.1], plane: [A.Tv, A.nTv, -0.8], box: [[-4.2, -5.0, -2.3], [1.5, 1.2, 2.5]], zoff: 0.4, inner: -0.32 },
      lv: { key: 'dLVc', c: [2.9, -2.5, -0.9], plane: [A.Mv, A.nMv, -1.0], box: [[0.2, -6.2, -3.4], [5.4, 0.8, 1.6]], zoff: -0.3, inner: -0.45 }
    };
    const out = {};
    for (const k in defs) {
      const D = defs[k], pts = [];
      let tries = 0;
      while (pts.length < 22 && tries++ < 20000) {
        const q = [D.box[0][0] + rnd() * (D.box[1][0] - D.box[0][0]), D.box[0][1] + rnd() * (D.box[1][1] - D.box[0][1]), D.box[0][2] + rnd() * (D.box[1][2] - D.box[0][2])];
        if (q[2] > S.cutF(q[0], q[1]) + D.zoff) continue;
        const c = comp(q);
        if (c[D.key] > D.inner) continue;
        if (S.tissue(q[0], q[1], q[2]) < 0.3) continue;
        const h = dt(sb(q, D.plane[0]), D.plane[1]);
        if (D.plane[2] > 0 ? h < D.plane[2] : h > D.plane[2]) continue;
        if (pts.some(r => Math.hypot(r[0] - q[0], r[1] - q[1], r[2] - q[2]) < 0.58)) continue;
        pts.push(q);
      }
      pts.sort((a, b) => Math.hypot(a[0] - D.c[0], a[1] - D.c[1], a[2] - D.c[2]) - Math.hypot(b[0] - D.c[0], b[1] - D.c[1], b[2] - D.c[2]));
      out[k] = pts.map(q => ({ p: q, m: HeartAssemble.motionSimple(q[0], q[1], q[2]) }));
    }
    return out;
  }
  return { coronaries, conduction, wkPaths, wkPoint, chamberSlots, projectTo, outerF };
})();
//  = HeartExtras;

/* =====================================================================
   HERZZYKLUS – Physik aus dem Windkessel-Modell (Herz und Kreislauf)
   Blut in Portionen, Klappen als Tore, Aorta als Windkessel.
   Automatik (Tempo langsam/normal/schnell) oder Handbetrieb.
   Eine Korrektur gegenüber dem 2D-Modell: Die Segelklappen stehen die
   ganze Diastole offen (passive Füllung), die Vorhöfe liefern nur den
   letzten Schub.
   ===================================================================== */
const HerzZyklus = (function () {
  'use strict';
  const grenz = (v, a, b) => v < a ? a : (v > b ? b : v);
  const puls = (x, a, b) => (x < a || x > b) ? 0 : Math.sin(Math.PI * (x - a) / (b - a));
  const REST = 2, MAXT = 160, ZYKLUS = 3.2;
  const STAU_BASIS = 3, STAU_SPANNE = 6;   // Vorhof-Aufnahmegrenze (Portionen) bei geschwächter Kammer: Basis + Spanne · Kraft

  // wege: { name: { len, klappeBei, tempo, abstand, ziel, ein?, tor? } }
  function Engine(wege) {
    this.wege = wege;
    /* par: allgemeine Wirkgrößen der Krankheitsbilder/Medikamente; neutral = 1 (dann rechnet die Physik wie ohne sie) */
    this.S = { modus: 'auto', tempo: 1, windkessel: true, laufen: true, hand: { vorhof: false, rk: false, lk: false }, par: { kraftL: 1, kraftR: 1, tempoFaktor: 1, avOeffnung: 1, vorhofSchub: 1, rhythmus: 0, infarkt: 0 } };
    this.rs = 20240607;                // Saat des eigenen Zufalls (Rhythmus); Math.random bleibt unberührt
    this.reset();
  }
  const P = Engine.prototype;
  // eigener, fest initialisierter Pseudozufall (mulberry32), Zustand in this.rs
  P.rnd = function () {
    let t = this.rs = (this.rs + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  P.reset = function () {
    this.beatD = 1; this.flimT = 0;
    this.K = { vorhof: 0, rk: 0, lk: 0 };
    this.speicher = { ra: 3, rv: 10, la: 3, lv: 10 };
    this.teilchen = []; this.konto = {};
    this.imWK = 0; this.torKonto = 0; this.dehnung = 0; this.imLu = 0; this.luKonto = 0; this.slWar = false; this.aoWar = false;
    this.u = 0.6; this.handU = 0.78; this.wechsel = { lunge: 0, koerper: 0 };
    this.events = [];
    this.prevAV = true; this.prevSL = false;
    this.nextId = 1;
    this.vol = null; this.cyc = null; this.uPrev = undefined;
    this.ref = { rvMax: 15, rvMin: 5, lvMax: 15, lvMin: 5, aMax: 6, aMin: 2 };
    this.vorbefuellen();
  };
  P.neu = function (weg, d) { const t = { id: this.nextId++, weg, d }; this.teilchen.push(t); return t; };
  P.vorbefuellen = function () {
    const W = this.wege;
    const fill = (name, n) => { const w = W[name]; for (let i = 0; i < n; i++) this.neu(name, (i + 0.5) / n * w.len); };
    fill('koerperOben', 14); fill('koerperUnten', 18);
    const vis = (name, n) => { const w = W[name]; for (let i = 0; i < n; i++) this.neu(name, w.luTor + (i + 0.5) / n * (w.len - w.luTor)); };
    vis('lungeLinks', 3); vis('lungeRechts', 3); this.imLu = 12;
  };
  // Klappen
  P.klappeOffen = function (weg) {
    const K = this.K;
    if (weg === 'rechtsRein') return 1 - grenz((K.rk - 0.05) * 4, 0, 1);
    if (weg === 'linksRein') return 1 - grenz((K.lk - 0.05) * 4, 0, 1);
    if (weg.startsWith('koerper')) return grenz((K.lk - 0.32) * 6, 0, 1);
    return grenz((K.rk - 0.32) * 6, 0, 1);   // Lunge
  };
  P.klappeFrei = function (weg) { return this.klappeOffen(weg) > 0.5; };
  P.start = function (weg) { const w = this.wege[weg]; return w.jet ? Math.max(0, w.klappeBei - 0.7) : 0; };
  P.eingangBesetzt = function (weg) { const g = this.wege[weg].abstand, s0 = this.start(weg); return this.teilchen.some(t => t.weg === weg && Math.abs(t.d - s0) < g); };
  P.platzFrei = function (weg, stelle) { const g = this.wege[weg].abstand; return !this.teilchen.some(t => t.weg === weg && Math.abs(t.d - stelle) < g); };
  P.pumpe = function (raum, weg, rate, dt) {
    const s = raum + weg;
    this.konto[s] = (this.konto[s] || 0) + rate * dt;
    while (this.konto[s] >= 1) {
      this.konto[s] -= 1;
      if (this.speicher[raum] <= REST || this.teilchen.length > MAXT) { this.konto[s] = Math.min(this.konto[s], 1); break; }
      if (this.eingangBesetzt(weg)) { this.konto[s] = Math.min(this.konto[s], 1); break; }
      this.speicher[raum] -= 1;
      this.neu(weg, this.start(weg));
    }
  };
  P.teilchenSchritt = function (dt) {
    const gruppen = {};
    for (const t of this.teilchen) (gruppen[t.weg] = gruppen[t.weg] || []).push(t);
    const weg = [];
    for (const name in gruppen) {
      const w = this.wege[name];
      const liste = gruppen[name].sort((a, b) => b.d - a.d);
      const zu = !this.klappeFrei(name);
      for (let k = 0; k < liste.length; k++) {
        const t = liste[k];
        // Aortenstenose: hinter der engen Klappe schießt das Blut schneller (nur Körperwege)
        const jetF = this.S.par.avOeffnung < 1 && name.startsWith('koerper') ? Math.min(2.2 / Math.max(this.S.par.avOeffnung, 0.01), 6) : 2.2;
        let neu = t.d + w.tempo * (w.jet && t.d < w.jet ? jetF : 1) * dt;
        if (k > 0) neu = Math.min(neu, liste[k - 1].d - w.abstand);          // niemand überholt
        if (zu && t.d <= w.klappeBei) neu = Math.min(neu, w.klappeBei - 0.22);
        if (neu > t.d) t.d = neu;
        // Lunge: das Kapillarbett gleicht den Zustrom aus
        if (w.luEin !== undefined && t.d >= w.luEin && t.d < w.luTor) { this.imLu++; weg.push(t); continue; }
        // Windkessel: im dehnbaren Abschnitt sammelt sich das Blut in der Aorta selbst
        if (w.ein !== undefined && this.S.windkessel && t.d >= w.ein && t.d < w.tor) { this.imWK++; weg.push(t); continue; }
        if (t.d >= w.len) {
          // Rückstau: ein geschwächtes Herz nimmt nur begrenzt Blut auf – die Portionen warten am Ende der Vene
          const kraft = w.ziel === 'la' ? this.S.par.kraftL : (w.ziel === 'ra' ? this.S.par.kraftR : 1);
          if (kraft < 1 && this.speicher[w.ziel] >= STAU_BASIS + STAU_SPANNE * kraft) { t.d = w.len - 0.001; continue; }
          this.speicher[w.ziel] += 1; weg.push(t); continue;
        }
      }
    }
    if (weg.length) this.teilchen = this.teilchen.filter(t => !weg.includes(t));
  };
  // Einen Zeitschritt rechnen (dt in Sekunden)
  P.step = function (dt) {
    const S = this.S, K = this.K;
    if (!S.laufen) { this.pos = S.modus === 'auto' ? this.u : this.handU; return; }
    let pos;
    if (S.modus === 'auto') {
      const nu = this.u + dt / ((ZYKLUS * this.beatD) / (S.tempo * S.par.tempoFaktor));
      this.u = nu % 1;
      if (nu >= 1) {   // neuer Herzschlag: bei Rhythmusstörung zufällige Dauer (Faktor 0,6 bis 1,5, gemischt mit rhythmus)
        const rh = S.par.rhythmus;
        this.beatD = rh > 0 ? 1 + rh * (0.6 + 0.9 * this.rnd() - 1) : 1;
      }
      K.vorhof = puls(this.u, 0.03, 0.16) * S.par.vorhofSchub;
      const kammer = puls(this.u, 0.19, 0.52);
      K.rk = kammer; K.lk = kammer;
      pos = this.u;
    } else {
      const g = Math.min(1, 7 * dt);
      K.vorhof += ((S.hand.vorhof ? 1 : 0) * S.par.vorhofSchub - K.vorhof) * g;
      K.rk += ((S.hand.rk ? 1 : 0) - K.rk) * g;
      K.lk += ((S.hand.lk ? 1 : 0) - K.lk) * g;
      const ziel = S.hand.vorhof ? 0.08 : ((S.hand.rk || S.hand.lk) ? 0.30 : 0.78);
      this.handU += (ziel - this.handU) * Math.min(1, 4 * dt);
      pos = this.handU;
    }
    this.pos = pos;
    if (S.par.vorhofSchub < 1) this.flimT += dt;   // Zeit für das Zittern/Flackern (nur bei Flimmern)
    // Füllung: passiv, solange die Segelklappe offen ist, dazu der Schub der Vorhöfe
    const sp = this.speicher;
    const passiv = (vh, k) => 3 * Math.max(0, (vh - REST) - 0.32 * Math.max(0, k - 5));
    if (this.klappeFrei('rechtsRein')) this.pumpe('ra', 'rechtsRein', passiv(sp.ra, sp.rv) + 30 * K.vorhof, dt);
    if (this.klappeFrei('linksRein')) this.pumpe('la', 'linksRein', passiv(sp.la, sp.lv) + 30 * K.vorhof, dt);
    // Auswurf
    const slOffen = this.klappeFrei('lungeLinks'), aoOffen = this.klappeFrei('koerperOben');
    if (slOffen && !this.slWar) { this.konto['rvlungeLinks'] = 1; this.konto['rvlungeRechts'] = 1; }
    if (aoOffen && !this.aoWar) { this.konto['lvkoerperOben'] = 1; this.konto['lvkoerperUnten'] = 1; }
    this.slWar = slOffen; this.aoWar = aoOffen;
    if (this.klappeFrei('lungeLinks')) {
      this.wechsel.lunge ^= 1;
      const a = this.wechsel.lunge ? 'lungeLinks' : 'lungeRechts', b = this.wechsel.lunge ? 'lungeRechts' : 'lungeLinks';
      this.pumpe('rv', this.eingangBesetzt(a) ? b : a, 24 * K.rk * S.par.kraftR, dt);
    }
    if (this.klappeFrei('koerperOben')) {
      this.wechsel.koerper ^= 1;
      const a = this.wechsel.koerper ? 'koerperOben' : 'koerperUnten', b = this.wechsel.koerper ? 'koerperUnten' : 'koerperOben';
      // Aortenstenose: enge Klappe, weniger Auswurf (Faktor nur bei Verengung, sonst unverändert)
      const avF = S.par.avOeffnung < 1 ? 0.35 + 0.65 * S.par.avOeffnung : 1;
      this.pumpe('lv', this.eingangBesetzt(a) ? b : a, 24 * K.lk * S.par.kraftL * avF, dt);
    }
    // aus der Lunge fließt es gleichmäßig in die Lungenvenen
    // (bei geschwächter linker Kammer fließt das Lungenblut langsamer ab: Rückstau in der Lunge)
    this.luKonto = Math.min((this.luKonto || 0) + Math.max(0.6, 0.55 * this.imLu) * dt * S.par.kraftL, 1);
    if (this.luKonto >= 1 && this.imLu > 0) {
      const pref = (this.nextId & 1) ? 'lungeLinks' : 'lungeRechts', alt = pref === 'lungeLinks' ? 'lungeRechts' : 'lungeLinks';
      const w = this.platzFrei(pref, this.wege[pref].luTor) ? pref : (this.platzFrei(alt, this.wege[alt].luTor) ? alt : null);
      if (w) { this.luKonto -= 1; this.imLu -= 1; this.neu(w, this.wege[w].luTor); }
    }
    // Die gedehnte Aorta gibt Portion für Portion ab – je stärker gedehnt, desto schneller
    if (S.windkessel) {
      this.torKonto = Math.min(this.torKonto + Math.max(0.5, 0.85 * this.imWK) * dt, 1);
      if (this.torKonto >= 1 && this.imWK > 0) {
        const tor = this.wege.koerperOben.tor;
        const pref = (this.nextId & 1) ? 'koerperOben' : 'koerperUnten';
        const alt = pref === 'koerperOben' ? 'koerperUnten' : 'koerperOben';
        const w = this.platzFrei(pref, tor) ? pref : (this.platzFrei(alt, tor) ? alt : null);
        if (w) { this.torKonto -= 1; this.imWK -= 1; this.neu(w, tor); }
      }
    } else {
      this.torKonto = 0;
      // umgestellt auf starr: gespeichertes Blut läuft sofort weiter
      if (this.imWK > 0) { const tor = this.wege.koerperOben.tor; const w = this.platzFrei('koerperUnten', tor) ? 'koerperUnten' : (this.platzFrei('koerperOben', tor) ? 'koerperOben' : null); if (w) { this.imWK--; this.neu(w, tor); } }
    }
    this.teilchenSchritt(dt);
    this.volumen(dt);
    const ziel = S.windkessel ? grenz(this.imWK / 9, 0, 1) : 0;
    this.dehnung += (ziel - this.dehnung) * (1 - Math.exp(-dt * 7.2));
    // Herztöne
    const av = this.klappeOffen('linksRein') > 0.5 || this.klappeOffen('rechtsRein') > 0.5;
    const sl = this.klappeOffen('koerperOben') > 0.5 || this.klappeOffen('lungeLinks') > 0.5;
    if (this.prevAV && !av) this.events.push('S1');
    if (this.prevSL && !sl) this.events.push('S2');
    this.prevAV = av; this.prevSL = sl;
  };
  // Blut, das sich gerade in einer Höhle befindet: gespeichert + unterwegs auf der jeweiligen Seite der Klappe
  P.volumen = function (dt) {
    const W = this.wege, sp = this.speicher, e = { ra: sp.ra, rv: sp.rv, la: sp.la, lv: sp.lv };
    for (const t of this.teilchen) {
      const w = W[t.weg], vor = t.d < w.klappeBei;
      if (t.weg === 'rechtsRein') { if (vor) e.ra++; else e.rv++; }
      else if (t.weg === 'linksRein') { if (vor) e.la++; else e.lv++; }
      else if (vor && t.weg.startsWith('lunge')) e.rv++;
      else if (vor && t.weg.startsWith('koerper') && t.d < w.klappeBei) e.lv++;
    }
    if (!this.vol) this.vol = Object.assign({}, e);
    const k = dt > 0 ? 1 - Math.exp(-dt / 0.09) : 1;
    for (const r in e) this.vol[r] += (e[r] - this.vol[r]) * k;
    const c = this.cyc || (this.cyc = { rvMax: 0, rvMin: 99, lvMax: 0, lvMin: 99, aMax: 0, aMin: 99 });
    const v = this.vol, a = (v.ra + v.la) / 2;
    c.rvMax = Math.max(c.rvMax, v.rv); c.rvMin = Math.min(c.rvMin, v.rv); c.lvMax = Math.max(c.lvMax, v.lv); c.lvMin = Math.min(c.lvMin, v.lv);
    c.aMax = Math.max(c.aMax, a); c.aMin = Math.min(c.aMin, a);
    const umlauf = this.S.modus === 'auto' && this.uPrev !== undefined && this.u < this.uPrev;
    this.uPrev = this.u;
    if (umlauf) {
      const R = this.ref;
      for (const [x, lo] of [['rv', 3], ['lv', 3]]) {
        const mx = c[x + 'Max'], mn = c[x + 'Min'];
        if (mx - mn > 2) { R[x + 'Max'] += (mx - R[x + 'Max']) * 0.5; R[x + 'Min'] += (Math.max(lo, mn) - R[x + 'Min']) * 0.5; }
      }
      if (c.aMax - c.aMin > 1) { R.aMax += (c.aMax - R.aMax) * 0.5; R.aMin += (c.aMin - R.aMin) * 0.5; }
      this.cyc = null;
    }
  };
  P.phase = function () {
    const K = this.K, kk = Math.max(K.rk, K.lk);
    if (kk > 0.15) return 'systole';
    if (K.vorhof > 0.15) return 'vorhof';
    return 'diastole';
  };
  // EKG-Kurve wie im 2D-Modell
  // fl = Flimmer-Anteil (0 = normal): P-Welle verschwindet, feine Flimmerwellen (t = Zeit); ohne fl exakt die bisherige Kurve
  // st = Infarkt-Anteil (0 = normal): ST-Strecke nach dem QRS angehoben, geht weich in die T-Welle \u00fcber; ohne st exakt die bisherige Kurve
  function ekgKurve(x, fl, t, st) {
    let y = 0.13 * (fl ? 1 - fl : 1) * Math.exp(-Math.pow((x - 0.06) / 0.028, 2));
    const q = [[0.160, 0], [0.172, -0.09], [0.188, 0.95], [0.204, -0.24], [0.222, 0]];
    for (let i = 0; i < q.length - 1; i++) if (x >= q[i][0] && x <= q[i + 1][0]) { const f = (x - q[i][0]) / (q[i + 1][0] - q[i][0]); y += q[i][1] + f * (q[i + 1][1] - q[i][1]); }
    y += 0.27 * Math.exp(-Math.pow((x - 0.40) / 0.045, 2));
    if (st) { const ss = (a, b, v) => { const u = Math.min(1, Math.max(0, (v - a) / (b - a))); return u * u * (3 - 2 * u); }; y += st * 0.25 * ss(0.208, 0.238, x) * (1 - ss(0.40, 0.50, x)); }
    if (fl) y += fl * 0.045 * (Math.sin(x * 138 + t * 31) + 0.7 * Math.sin(x * 233 - t * 47 + 1.3) + 0.5 * Math.sin(x * 87 + t * 19 + 2.1)) / 2.2;
    return y;
  }
  const FELDER = [{ von: 0.00, bis: 0.18, name: 'Vorhöfe drücken' }, { von: 0.18, bis: 0.53, name: 'Kammern drücken' }, { von: 0.53, bis: 1.00, name: 'Herz füllt sich' }];
  // Einen Zyklus im Automatikbetrieb aufzeichnen (für die GLB-Animation)
  P.bake = function (fps, onFrame) {
    const save = JSON.stringify({ S: this.S, K: this.K, sp: this.speicher, imWK: this.imWK, tk: this.torKonto, de: this.dehnung, u: this.u, hu: this.handU, t: this.teilchen, id: this.nextId, k: this.konto, vol: this.vol, ref: this.ref, cyc: this.cyc, up: this.uPrev, lu: this.imLu, lk: this.luKonto, rs: this.rs, bd: this.beatD, ft: this.flimT });
    this.S.modus = 'auto'; this.S.laufen = true; this.S.par.rhythmus = 0; this.beatD = 1;   // Animation: gleichmäßiger Schlag
    const T = ZYKLUS / (this.S.tempo * this.S.par.tempoFaktor), h = 1 / 240;
    for (let i = 0; i < Math.round(2 * T / h); i++) this.step(h);            // einschwingen
    while (this.u > 0.004) this.step(h);
    const n = Math.max(12, Math.round(T * fps)), frames = [];
    for (let i = 0; i <= n; i++) {
      const w = this.weights(); frames.push(w);
      if (onFrame) onFrame(i, w);
      const steps = Math.round((T / n) / h);
      for (let k = 0; k < steps; k++) this.step(h);
    }
    const o = JSON.parse(save);
    Object.assign(this.S, o.S); this.K = o.K; this.speicher = o.sp; this.imWK = o.imWK; this.torKonto = o.tk; this.dehnung = o.de; this.u = o.u; this.handU = o.hu; this.teilchen = o.t; this.nextId = o.id; this.konto = o.k;
    this.vol = o.vol; this.ref = o.ref; this.cyc = o.cyc; this.uPrev = o.up; this.imLu = o.lu; this.luKonto = o.lk; this.rs = o.rs; this.beatD = o.bd; this.flimT = o.ft;
    this.events.length = 0;
    return { T, frames, dt: T / n };
  };
  // Flimmer-Anteil der Vorhöfe (0 = normal, 1 = Vorhofschub fehlt ganz)
  P.flimmern = function () { return Math.min(1, Math.max(0, 1 - this.S.par.vorhofSchub)); };
  // Gewichte für die 3D-Verformung
  P.weights = function () {
    const K = this.K, v = this.vol || this.speicher;
    // 0 = prall gefüllt, 1 = maximal zusammengezogen
    const R = this.ref;
    const kam = (n, x) => grenz((R[x + 'Max'] - n) / Math.max(2, R[x + 'Max'] - R[x + 'Min']), -0.25, 1.15);
    const vorh = (n) => grenz((R.aMax - n) / Math.max(1.5, R.aMax - R.aMin), -0.3, 1);
    const pvOffen = this.klappeOffen('lungeLinks'), fl = this.flimmern();
    return {
      // geschwächte Kammer: bleibt weit (Gewicht schrumpft mit der Kraft; kam() normiert sonst die Schwäche weg)
      VR: kam(v.rv, 'rv') * this.S.par.kraftR, VL: kam(v.lv, 'lv') * this.S.par.kraftL * (this.S.par.avOeffnung < 1 ? 0.5 + 0.5 * this.S.par.avOeffnung : 1),
      A: grenz(0.55 * K.vorhof + 0.45 * vorh((v.ra + v.la) / 2) + fl * 0.07 * (Math.sin(this.flimT * 53) + 0.8 * Math.sin(this.flimT * 89 + 1.7) + 0.6 * Math.sin(this.flimT * 131 + 0.4)) / 2.4, -0.3, 1.1),
      Ao: this.S.windkessel ? 1.8 * this.dehnung : 0,
      PT: 0.9 * pvOffen * K.rk,
      tv: this.klappeOffen('rechtsRein'), mv: this.klappeOffen('linksRein'), pv: pvOffen, av: this.klappeOffen('koerperOben') * this.S.par.avOeffnung,
      pos: this.pos || 0
    };
  };
  return { Engine, ekgKurve, FELDER, ZYKLUS, REST };
})();
//  = HerzZyklus;

/* =====================================================================
   INHALTE – Strukturen, Hilfekarten, Tipps, Phasen
   Hilfekarten und Tipps stammen aus dem Windkessel-Modell (Herz und
   Kreislauf) und sind für das 3D-Herz angepasst.
   ===================================================================== */
const HeartInfo = (function () {
  'use strict';
  const groups = ['Herzhöhlen', 'Wände und Muskeln', 'Herzklappen', 'Gefäße', 'Erregungsleitung', 'Blut'];
  // open/closed: Anker der Beschriftung in der jeweiligen Ansicht (null = keine Beschriftung)
  const S = [
    { id: 'lv', grp: 'Herzhöhlen', col: 0xA8433A, de: 'Linke Kammer', lat: 'Ventriculus sinister', open: [3.3, -2.6, -1.3], closed: [4.25, -3.0, 1.0],
      txt: 'Pumpt sauerstoffreiches Blut über die Aortenklappe in die Aorta und damit in den ganzen Körper. Sie muss dafür etwa 120 mmHg aufbauen – deshalb ist ihre Wand die dickste des Herzens. Im Modell liegen die Portionen, die sie gerade gesammelt hat, als rote Punkte in ihr.',
      facts: { 'Wand': '10–12 mm', 'Druck': 'ca. 120 mmHg', 'Pumpt in': 'Aorta, großer Kreislauf' },
      care: 'Bei Linksherzinsuffizienz staut sich das Blut zurück in die Lunge: Atemnot, Rasselgeräusche, im Extremfall Lungenödem. Oberkörperhochlagerung erleichtert die Atmung.' },
    { id: 'rv', grp: 'Herzhöhlen', col: 0x5D7BB0, de: 'Rechte Kammer', lat: 'Ventriculus dexter', open: [-1.7, -2.4, -0.3], closed: [-1.0, -2.3, 2.25],
      txt: 'Pumpt sauerstoffarmes Blut über die Pulmonalklappe in die Lunge. Dafür reichen etwa 25 mmHg, denn der Weg ist kurz – ihre Wand ist dünn. Sie liegt vorn, direkt hinter dem Brustbein.',
      facts: { 'Wand': '3–5 mm', 'Druck': 'ca. 25 mmHg', 'Pumpt in': 'Truncus pulmonalis, kleiner Kreislauf' },
      care: 'Bei Rechtsherzinsuffizienz staut sich das Blut in die Körpervenen: gestaute Halsvenen, Beinödeme, Gewichtszunahme. Tägliches Wiegen gehört zur Krankenbeobachtung.' },
    { id: 'la', grp: 'Herzhöhlen', col: 0xB5584B, de: 'Linker Vorhof', lat: 'Atrium sinistrum', open: [3.3, 2.8, -0.7], closed: [4.2, 3.35, -0.1],
      txt: 'Hier sammelt sich das frische, rote Blut aus den vier Lungenvenen. Solange die linke Kammer locker ist, fließt es durch die Mitralklappe weiter; zum Schluss schiebt der Vorhof den letzten Rest hinterher. Nach vorn ragt das linke Herzohr.',
      facts: { 'Zufluss': '4 Lungenvenen', 'Abfluss': 'Mitralklappe', 'Anhang': 'linkes Herzohr' },
      care: 'Bei Vorhofflimmern kann sich im Herzohr ein Gerinnsel bilden und einen Schlaganfall auslösen – deshalb erhalten Betroffene oft Gerinnungshemmer.' },
    { id: 'ra', grp: 'Herzhöhlen', col: 0x6F8CC2, de: 'Rechter Vorhof', lat: 'Atrium dextrum', open: [-4.7, 1.9, -1.6], closed: [-5.55, 1.6, 0.1],
      txt: 'Hier sammelt sich das Blut, das aus dem Körper zurückkommt – blau, weil der Sauerstoff verbraucht ist. Es fließt durch die Trikuspidalklappe in die rechte Kammer. In seiner Wand sitzt der Sinusknoten, der Taktgeber des Herzens.',
      facts: { 'Zufluss': 'obere und untere Hohlvene', 'Abfluss': 'Trikuspidalklappe', 'Taktgeber': 'Sinusknoten' },
      care: 'Der zentrale Venendruck (ZVD) entspricht etwa dem Druck im rechten Vorhof. Die Spitze eines ZVK liegt kurz davor in der oberen Hohlvene.' },
    { id: 'ivs', grp: 'Wände und Muskeln', col: 0x9C4038, de: 'Kammerscheidewand', lat: 'Septum interventriculare', open: 'septum', closed: null,
      txt: 'Trennt linke und rechte Kammer, damit sich sauerstoffreiches und sauerstoffarmes Blut nicht mischen. Sie ist überwiegend Muskel und pumpt mit; in ihr verlaufen His-Bündel und Tawara-Schenkel.',
      facts: { 'Dicke': 'ca. 10 mm', 'Enthält': 'His-Bündel, Tawara-Schenkel' },
      care: 'Ein Loch in der Scheidewand (Ventrikelseptumdefekt, VSD) ist einer der häufigsten angeborenen Herzfehler und fällt durch ein lautes Herzgeräusch auf.' },
    { id: 'myo', minor: true, grp: 'Wände und Muskeln', col: 0xDCA48C, de: 'Herzwand', lat: 'Endocardium, Myocardium, Epicardium', open: [4.55, -2.2, 'cut'], closed: null,
      txt: 'Die helle Schnittfläche zeigt die Herzwand: innen die glatte Innenhaut, in der Mitte der Herzmuskel, außen das Epikard mit Fettgewebe in den Furchen. Vergleiche die dicke Wand links mit der dünnen Wand rechts.',
      facts: { 'Innen': 'Endokard', 'Mitte': 'Myokard', 'Außen': 'Epikard' },
      care: 'Eine Entzündung der Innenhaut heißt Endokarditis, eine des Herzmuskels Myokarditis – beide können nach Infekten auftreten.' },
    { id: 'ias', minor: true, grp: 'Wände und Muskeln', col: 0xB06050, de: 'Vorhofscheidewand', lat: 'Septum interatriale', open: null, closed: null,
      txt: 'Trennt die beiden Vorhöfe. Die flache Mulde darin (Fossa ovalis) ist der Rest des Foramen ovale, durch das vor der Geburt Blut direkt vom rechten in den linken Vorhof floss.',
      facts: { 'Enthält': 'Fossa ovalis', 'Vor der Geburt': 'Foramen ovale offen' },
      care: 'Bei etwa jedem vierten Erwachsenen bleibt ein schmaler Spalt offen (offenes Foramen ovale). Meist harmlos, selten Ursache eines Schlaganfalls.' },
    { id: 'pap', minor: true, grp: 'Wände und Muskeln', col: 0xA0443A, de: 'Papillarmuskeln', lat: 'Musculi papillares', open: [3.5, -1.55, -0.85], closed: null,
      txt: 'Zapfenförmige Muskeln in den Kammern. Sie spannen sich bei jeder Kontraktion an und halten über die Sehnenfäden die Segel fest, damit diese nicht in die Vorhöfe zurückschlagen. Das Moderatorband der rechten Kammer führt einen Teil der Erregungsleitung.',
      facts: { 'Links': '2 Muskeln', 'Rechts': '3 Muskeln', 'Halten': 'die Segel über die Sehnenfäden' },
      care: 'Reißt nach einem Herzinfarkt ein Papillarmuskel ab, schließt die Mitralklappe plötzlich nicht mehr – ein lebensbedrohlicher Notfall mit akuter Atemnot.' },
    { id: 'chord', minor: true, grp: 'Wände und Muskeln', col: 0xE4DCDC, de: 'Sehnenfäden', lat: 'Chordae tendineae', open: 'chord', closed: null,
      txt: 'Feine, reißfeste Fäden zwischen den Papillarmuskeln und den Rändern der Segelklappen. Sie verhindern, dass die Segel beim hohen Kammerdruck in die Vorhöfe durchschlagen.',
      facts: { 'Verbinden': 'Papillarmuskel und Segelrand', 'Material': 'Kollagenfasern' },
      care: 'Gerissene Sehnenfäden führen zum Durchschlagen eines Segels (Prolaps) und damit zu einer undichten Klappe.' },
    { id: 'mitral', grp: 'Herzklappen', col: 0xE2B3A8, de: 'Mitralklappe', lat: 'Valva mitralis', open: 'mitral', closed: null,
      txt: 'Segelklappe mit zwei Segeln zwischen linkem Vorhof und linker Kammer. Solange die Kammer locker ist, steht sie offen. Drückt die Kammer, schlägt sie zu, damit nichts zurückläuft – zusammen mit der Trikuspidalklappe ist das der 1. Herzton.',
      facts: { 'Segel': '2', 'Herzton': '1. Herzton', 'Abhören': 'Herzspitze, 5. ICR links' },
      care: 'Undichtigkeit (Insuffizienz) oder Verengung (Stenose) führen zu Rückstau in die Lunge und Atemnot.' },
    { id: 'tricus', grp: 'Herzklappen', col: 0xB2BFDC, de: 'Trikuspidalklappe', lat: 'Valva tricuspidalis', open: 'tricus', closed: null,
      txt: 'Segelklappe mit drei Segeln zwischen rechtem Vorhof und rechter Kammer. Sie steht in der Diastole offen und schlägt zu, sobald die Kammer drückt.',
      facts: { 'Segel': '3', 'Herzton': '1. Herzton', 'Abhören': '4. ICR rechts am Brustbein' },
      care: 'Bei intravenösem Drogenkonsum ist sie häufig von bakterieller Endokarditis betroffen – Fieber plus neues Herzgeräusch immer melden.' },
    { id: 'aortic', grp: 'Herzklappen', col: 0xD9A596, de: 'Aortenklappe', lat: 'Valva aortae', open: 'aortic', closed: null,
      txt: 'Taschenklappe mit drei halbmondförmigen Taschen am Ausgang der linken Kammer. Erst der Druck der Kammer stößt sie auf, danach fällt sie sofort wieder zu – ihr Schluss ist der 2. Herzton. Direkt über ihr entspringen die Herzkranzgefäße.',
      facts: { 'Taschen': '3', 'Herzton': '2. Herzton', 'Abhören': '2. ICR rechts am Brustbein' },
      care: 'Die Aortenklappenstenose ist der häufigste Klappenfehler im Alter: Schwindel, kurze Bewusstlosigkeit und Luftnot bei Belastung.' },
    { id: 'pulm', grp: 'Herzklappen', col: 0xBAC6E2, de: 'Pulmonalklappe', lat: 'Valva trunci pulmonalis', open: 'pulm', closed: null,
      txt: 'Taschenklappe mit drei Taschen am Ausgang der rechten Kammer. Sie öffnet, wenn die rechte Kammer drückt, und verhindert danach, dass Blut aus der Lungenarterie zurückfließt.',
      facts: { 'Taschen': '3', 'Herzton': '2. Herzton', 'Abhören': '2. ICR links am Brustbein' },
      care: 'Beim tiefen Einatmen schließt sie etwas später als die Aortenklappe – der 2. Herzton klingt dann gespalten.' },
    { id: 'aorta', grp: 'Gefäße', col: 0xBF4238, de: 'Aorta', lat: 'Aorta ascendens, Arcus aortae', open: [-1.9, 4.4, 'front'], closed: [-2.35, 4.2, 0.9],
      txt: 'Die größte Arterie. Ihre Wand ist dick und elastisch: Beim Auswurf dehnt sie sich und nimmt einen Teil des Blutes auf, in der Pause zieht sie sich zusammen und schiebt es nach. Das ist der Windkessel – im Modell sammeln sich die Portionen dann in der aufsteigenden Aorta.',
      facts: { 'Durchmesser': 'ca. 3 cm', 'Funktion': 'Windkessel', 'Abgänge': 'Gefäße für Kopf und Arme' },
      care: 'Mit dem Alter wird die Aorta steifer: der obere Blutdruckwert steigt, der untere sinkt. Probiere oben „starr“ aus.' },
    { id: 'pt', grp: 'Gefäße', col: 0x4863B0, de: 'Lungenarterien', lat: 'Truncus pulmonalis', open: [1.3, 3.8, 'front'], closed: [1.65, 3.6, 1.35],
      txt: 'Führen vom Herzen weg zur Lunge. Alles, was vom Herzen weg führt, heißt Arterie – egal welche Farbe das Blut hat. Unter dem Aortenbogen teilt sich der Stamm in rechte und linke Lungenarterie.',
      facts: { 'Blut': 'sauerstoffarm, blau', 'Druck': 'ca. 25/10 mmHg', 'Prüfungsfrage': 'blaues Blut in einer Arterie' },
      care: 'Eine Lungenembolie verlegt diese Gefäße: plötzliche Atemnot, Brustschmerz, schneller Puls – sofort handeln.' },
    { id: 'svc', grp: 'Gefäße', col: 0x3D57A2, de: 'Obere Hohlvene', lat: 'Vena cava superior', open: [-3.75, 6.0, 'front'], closed: [-3.6, 6.4, 0.0],
      txt: 'Bringt das verbrauchte Blut aus Kopf, Hals und Armen zum rechten Vorhof. Dünne Wand, wenig Druck.',
      facts: { 'Aus': 'Kopf, Hals, Armen', 'Mündet': 'rechter Vorhof' },
      care: 'Hier liegt die Spitze eines zentralen Venenkatheters (ZVK). Die richtige Lage wird per Röntgen oder EKG kontrolliert.' },
    { id: 'ivc', grp: 'Gefäße', col: 0x3D57A2, de: 'Untere Hohlvene', lat: 'Vena cava inferior', open: [-3.9, -2.2, 'front'], closed: [-4.1, -2.4, -1.2],
      txt: 'Bringt das verbrauchte Blut aus Bauch, Becken und Beinen zum rechten Vorhof. Sie ist die größte Vene des Körpers.',
      facts: { 'Aus': 'Bauch, Becken, Beinen', 'Mündet': 'rechter Vorhof' },
      care: 'In der Spätschwangerschaft kann die Gebärmutter sie in Rückenlage abdrücken: Blutdruckabfall, Schwindel – Linksseitenlage hilft.' },
    { id: 'pv', grp: 'Gefäße', col: 0xB8453F, de: 'Lungenvenen', lat: 'Venae pulmonales', open: [5.25, 1.65, 'front'], closed: [5.3, 1.6, -2.4],
      txt: 'Führen von der Lunge zurück zum Herzen. Alles, was zum Herzen hin führt, heißt Vene. Hier fließt rotes Blut – die einzigen Venen, in denen das so ist.',
      facts: { 'Anzahl': '4', 'Blut': 'sauerstoffreich, rot', 'Mündet': 'linker Vorhof' },
      care: 'An ihren Mündungen entsteht häufig Vorhofflimmern. Bei einer Katheterablation werden sie elektrisch vom Vorhof getrennt.' },
    { id: 'cor', minor: true, grp: 'Gefäße', col: 0xB02A22, de: 'Herzkranzgefäße', lat: 'Arteriae coronariae', open: null, closed: 'corFront',
      txt: 'Versorgen den Herzmuskel selbst mit Blut. Die rechte Koronararterie läuft in der rechten Kranzfurche, die linke teilt sich in den RIVA (vorn zur Herzspitze) und den Ramus circumflexus. Sie werden vor allem in der Diastole durchblutet.',
      facts: { 'Abgang': 'direkt über der Aortenklappe', 'Äste': 'RCA, RIVA, RCX', 'Durchblutung': 'vor allem in der Diastole' },
      care: 'Ein Verschluss führt zum Herzinfarkt: Brustschmerz mit Ausstrahlung, Kaltschweißigkeit, Übelkeit, Todesangst. Sofort melden – 12-Kanal-EKG.' },
    { id: 'lig', minor: true, grp: 'Gefäße', col: 0xC9B79C, de: 'Ligamentum arteriosum', lat: 'Lig. arteriosum (Botalli)', open: [1.55, 5.65, -2.0], closed: [1.7, 5.55, -1.9],
      txt: 'Bindegewebiger Strang zwischen Lungenarterie und Aortenbogen. Er ist der Rest des Ductus arteriosus Botalli, der vor der Geburt Blut an der noch nicht belüfteten Lunge vorbeileitet.',
      facts: { 'Rest von': 'Ductus arteriosus', 'Verbindet': 'Lungenarterie und Aortenbogen' },
      care: 'Bleibt der Ductus nach der Geburt offen – häufig bei Frühgeborenen –, werden Herz und Lunge zusätzlich belastet.' },
    { id: 'erl', minor: true, grp: 'Erregungsleitung', col: 0xE8B830, de: 'Erregungsleitung', lat: 'Systema conducens cordis', open: 'sa', closed: 'sa',
      txt: 'Der Sinusknoten gibt den Takt vor. Die Erregung läuft über die Vorhöfe zum AV-Knoten, wird dort kurz verzögert und gelangt dann über His-Bündel, Tawara-Schenkel und Purkinje-Fasern in die Kammermuskulatur. Im Modell leuchtet die Bahn im Takt des EKGs.',
      facts: { 'Taktgeber': 'Sinusknoten, 60–80/min', 'Verzögerung': 'AV-Knoten', 'Im EKG': 'P-Welle, PQ-Zeit, QRS' },
      care: 'Störungen zeigen sich im EKG: eine verlängerte PQ-Zeit beim AV-Block, ein verbreiterter QRS-Komplex beim Schenkelblock.' },
    { id: 'blutB', grp: 'Blut', col: 0x2F6FB5, dot: true, de: 'Sauerstoffarmes Blut', lat: 'Sanguis venosus', open: null, closed: null,
      txt: 'Jeder blaue Punkt ist eine Portion Blut, die ihren Sauerstoff im Körper abgegeben hat. Sie kommt über die Hohlvenen in den rechten Vorhof und wird von der rechten Kammer in die Lunge gepumpt.',
      facts: { 'Weg': 'Hohlvene → rechtes Herz → Lunge', 'Farbwechsel': 'in der Lunge zu rot' },
      care: 'Blaue Lippen oder Finger (Zyanose) zeigen, dass zu viel sauerstoffarmes Blut im Körper unterwegs ist.' },
    { id: 'blutR', grp: 'Blut', col: 0xC8342F, dot: true, de: 'Sauerstoffreiches Blut', lat: 'Sanguis arteriosus', open: null, closed: null,
      txt: 'Jeder rote Punkt ist eine Portion Blut, die in der Lunge frisch Sauerstoff geholt hat. Sie kommt über die Lungenvenen in den linken Vorhof und wird von der linken Kammer in den Körper gepumpt.',
      facts: { 'Weg': 'Lungenvene → linkes Herz → Körper', 'Farbwechsel': 'im Körper zu blau' },
      care: 'Die Sauerstoffsättigung (SpO₂) misst, wie viel Sauerstoff das rote Blut trägt – normal sind 95 bis 99 %.' }
  ];

  const phases = {
    systole: { t: 'Systole – die Kammern drücken', x: 'Die Segelklappen schlagen zu, der Druck steigt. Erst wenn die Taschenklappen aufgehen, fließt Blut hinaus – dann werden die Kammern kleiner. Jetzt fühlst du den Puls.' },
    vorhof: { t: 'Die Vorhöfe drücken', x: 'Die Segelklappen sind offen. Die Vorhöfe ziehen sich zusammen und schieben den letzten Rest Blut in die Kammern.' },
    diastole: { t: 'Diastole – das Herz füllt sich', x: 'Die Taschenklappen sind zu, die Kammern erschlaffen. Sobald die Segelklappen aufgehen, strömt das Blut von allein aus den Vorhöfen nach.' }
  };

  // Hilfekarten – aus dem Windkessel-Modell
  const cards = [
    ['portionen', 'So liest du das Bild', 'Jeder Punkt ist eine Portion Blut. Blau heißt: Sauerstoff ist im Körper abgegeben. Rot heißt: Sauerstoff ist in der Lunge frisch geholt.', 'Lunge und Körper liegen außerhalb des Bildes. Dort verschwinden die Portionen und kommen später über die Venen zurück.'],
    ['windkessel', 'Windkessel der Aorta', 'Das Herz pumpt stoßweise, nur während der Systole. Trotzdem fließt das Blut im Körper gleichmäßig weiter. Das schafft die Aorta: Ihre Wand ist elastisch, beim Auswurf dehnt sie sich und nimmt einen Teil des Blutes auf. In der Pause zieht sie sich zusammen und schiebt dieses Blut nach.', 'Stell sie oben auf starr: Dann kommt das Blut in der absteigenden Aorta nur noch schubweise an, dazwischen entstehen Lücken.'],
    ['systole', 'Systole und Diastole', 'Systole heißt: Die Kammern spannen an und werfen das Blut aus. Diastole heißt: Der Muskel ist locker und das Herz füllt sich wieder. Zwischen beiden gibt es kurze Momente, in denen alle vier Klappen geschlossen sind: Dann ändert sich nur der Druck, nicht die Größe der Kammer.', 'Reihenfolge: Segelklappen zu (1. Herzton) – Taschenklappen auf – Auswurf – Taschenklappen zu (2. Herzton) – Segelklappen auf – Füllung.'],
    ['kreislaeufe', 'Kleiner und großer Kreislauf', 'Kleiner Kreislauf: rechte Kammer → Lunge → linker Vorhof. Nur zum Sauerstoff holen. Großer Kreislauf: linke Kammer → ganzer Körper → rechter Vorhof.', 'Das Blut macht immer beide Runden hintereinander, nie nur eine.'],
    ['rechtesHerz', 'Lungenkreislauf: rechtes Herz', 'Die Hohlvenen bringen das verbrauchte, blaue Blut aus dem Körper zum rechten Vorhof. Die rechte Kammer pumpt es über die Lungenarterien in die Lunge. Dort holt es sich neuen Sauerstoff.', 'Die Lungenarterien führen blaues Blut – Arterien heißen sie trotzdem, weil sie vom Herzen wegführen.'],
    ['linkesHerz', 'Körperkreislauf: linkes Herz', 'Die Lungenvenen bringen das frische, rote Blut aus der Lunge zum linken Vorhof. Die linke Kammer pumpt es über die Aorta in den ganzen Körper.', 'Die Lungenvenen führen rotes Blut – Venen heißen sie, weil sie zum Herzen hinführen. Die linke Kammer hat die dickste Wand, weil sie gegen den hohen Druck im Körper pumpt.'],
    ['segelklappen', 'Segelklappen', 'Sie liegen zwischen Vorhof und Kammer. Solange die Kammer locker ist, stehen sie offen, und das Blut strömt nach unten – am Ende hilft der Vorhof mit einem kleinen Schub nach. Drückt die Kammer, schlagen sie zu, damit nichts zurückläuft.', 'Fachwort: rechts Trikuspidalklappe, links Mitralklappe. Ihr Zuschlagen ist der erste Herzton.'],
    ['taschenklappen', 'Taschenklappen', 'Sie sitzen am Ausgang der Kammern zur Lungenarterie und zur Aorta. Erst der Druck der Kammer stößt sie auf, danach fallen sie sofort wieder zu.', 'Fachwort: Pulmonalklappe und Aortenklappe. Ihr Zuschlagen ist der zweite Herzton.'],
    ['arterie', 'Arterie', 'Führt vom Herzen weg. Alles, was vom Herzen weg führt, heißt Arterie – egal welche Farbe das Blut hat. Arterien haben eine dicke, elastische Wand.', 'In der Lungenarterie fließt blaues Blut – die einzige Arterie, in der das so ist.'],
    ['vene', 'Vene', 'Führt zum Herzen hin. Die Hohlvenen bringen das verbrauchte Blut aus dem Körper zurück zum rechten Vorhof.', 'Dünne Wand, wenig Druck. Deshalb blutet eine verletzte Vene eher gleichmäßig, eine Arterie spritzt.'],
    ['gase', 'Sauerstoff und Kohlendioxid', 'In der Lunge nimmt das Blut Sauerstoff auf und gibt Kohlendioxid ab. Im Körper ist es umgekehrt.', 'Fachwörter: Sauerstoff = O₂, Kohlendioxid = CO₂.'],
    ['puls', 'Puls und Blutdruck', 'Der Puls ist der Stoß, der bei jeder Systole durch die Arterien läuft. Der Blutdruck ist der Druck, mit dem das Blut gegen die Gefäßwand drückt.', 'Den oberen Wert erzeugt die Systole, den unteren hält der Windkessel der Aorta aufrecht.'],
    ['ekg', 'Was zeigt das EKG?', 'Das EKG zeigt den Strom im Herzen, nicht die Kraft. P-Welle: Die Erregung läuft vom Sinusknoten über die Vorhöfe. PQ-Strecke: Der AV-Knoten bremst. QRS-Komplex: His-Bündel, Tawara-Schenkel und Purkinje-Fasern erregen die Kammern. T-Welle: Die Kammern erholen sich.', 'Mit „Erregung“ wandert ein leuchtender Impuls genau im Takt des EKG-Punkts durch die Leitungsbahn. Am besten mit Tempo langsam ansehen.'],
    ['hand', 'Handbetrieb', 'Jetzt bestimmst du, wer drückt. Blut geht nur weiter, solange du drückst.', 'Richtige Reihenfolge: erst die Vorhöfe, dann beide Kammern – danach entspannen.'],
    ['fachwoerter', 'Fachwörter einfach erklärt', { 'Systole': 'Kammern drücken', 'Diastole': 'Herz füllt sich', 'Atrium': 'Vorhof, oberer kleiner Raum', 'Ventrikel': 'Kammer, unterer starker Raum', 'Arterie': 'Gefäß vom Herzen weg', 'Vene': 'Gefäß zum Herzen hin', 'Windkessel': 'elastische Aorta, hält den Fluss gleichmäßig' }, '']
  ];

  const tips = [
    'Schalte die Aorta von elastisch auf starr. Kommt das Blut in der absteigenden Aorta jetzt gleichmäßig an oder schubweise?',
    'Schau bei elastischer Aorta genau hin: Wird sie beim Auswurf dicker und danach wieder dünner?',
    'Stell auf Handbetrieb. Drücke nur die Vorhöfe. Kommt dadurch Blut in der Aorta an?',
    'Drücke im Handbetrieb nur die rechte Kammer. Welche Klappe geht zu, welche geht auf?',
    'Welche Farbe hat das Blut in der Lungenarterie? Und warum heißt sie trotzdem Arterie?',
    'Zähl mit: Wie viele Portionen liegen in der linken Kammer, bevor sie drückt – und wie viele danach?',
    'Stell das Tempo auf schnell. Bleibt die Reihenfolge der Klappen gleich?',
    'Schalte auf „Geschlossen“: Welche Kammer liegt vorn, direkt hinter dem Brustbein?'
  ];
  return { groups, S, phases, cards, tips };
})();

/* =====================================================================
   SCHEMA – Herz, Lunge und Körper als Kreislaufbild
   Zeichnung aus dem Windkessel-Modell (Herz und Kreislauf), dunkel
   gestaltet. Angetrieben von derselben Physik wie das 3D-Herz: dieselben
   Blutportionen, Klappen, Speicher und derselbe Windkessel.
   ===================================================================== */
const HerzSchema = (function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const grenz = (v, a, b) => v < a ? a : (v > b ? b : v);
  const SVG = `
<svg viewBox="0 0 900 740" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schema: Herz, Lunge und Körperkreislauf mit fließendem Blut">
  <defs>
    <path id="sdLungenarterie" d="M 434 380 C 442 366 446 350 446 322 L 446 200 M 446 204 C 428 184 396 172 362 166 M 446 204 C 464 184 496 172 530 166"/>
    <path id="sdLungenvene" d="M 410 214 C 436 223 456 227 470 231 M 522 218 C 500 224 484 227 470 231 M 470 231 C 486 247 500 269 508 298"/>
    <path id="sdHohlvene" d="M 300 654 C 250 656 206 640 196 610 L 196 372 C 196 348 214 336 240 336 L 316 338"/>
    <path id="sdHerz" d="M 348 290 C 300 300 285 350 292 405 C 300 465 340 515 400 540 C 460 566 520 566 552 540 C 575 520 590 470 600 420 C 612 370 612 315 580 292 C 520 268 400 268 348 290 Z"/>
    <marker id="sSpitze" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#E7EFF0"/></marker>
    <path id="swRechtsRein" d="M 316 338 C 342 342 364 352 374 372 C 382 392 382 420 382 448"/>
    <path id="swLungeLinks" d="M 382 448 C 400 430 416 412 424 394 C 440 374 446 352 446 322 L 446 200 C 428 182 396 170 362 165 C 328 160 296 138 278 158 C 262 176 264 200 284 216 C 306 234 350 238 386 226 C 400 220 404 216 410 214 C 436 222 456 226 470 230 C 486 246 500 268 508 298 C 514 310 522 322 528 330"/>
    <path id="swLungeRechts" d="M 382 448 C 400 430 416 412 424 394 C 440 374 446 352 446 322 L 446 200 C 464 182 496 170 530 165 C 564 160 596 138 614 158 C 630 176 628 200 608 216 C 586 234 542 238 506 226 C 492 220 488 216 482 214 C 478 220 474 226 470 230 C 486 246 500 268 508 298 C 514 310 522 322 528 330"/>
    <path id="swLinksRein" d="M 528 330 C 522 348 514 358 510 368 C 506 396 506 424 506 450"/>
    <path id="swKoerper" d="M 506 450 C 524 434 540 414 546 396 C 566 372 590 344 600 316 C 610 286 636 266 668 266 C 700 266 716 292 716 320 L 716 594 C 716 626 690 646 660 652 L 300 652 C 250 654 206 640 196 610 L 196 372 C 196 348 214 336 240 336 L 316 338 C 332 340 346 340 356 338"/>
  </defs>
  <g class="sz" data-info="lunge" data-side="b">
    <path d="M 465 20 L 465 78" stroke="var(--s-luftweg)" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path d="M 465 76 C 465 92 442 102 418 110" stroke="var(--s-luftweg)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 465 76 C 465 92 488 102 512 110" stroke="var(--s-luftweg)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 340 62 C 300 66 262 96 254 140 C 246 186 262 224 300 240 C 340 254 388 244 408 216 C 428 186 424 108 398 84 C 380 68 360 60 340 62 Z" fill="var(--s-lunge)" stroke="var(--s-lunge-rand)" stroke-width="3.5"/>
    <path d="M 590 62 C 630 66 668 96 676 140 C 684 186 668 224 630 240 C 592 254 546 244 526 216 C 512 194 522 150 512 130 C 506 112 516 92 532 84 C 550 68 570 60 590 62 Z" fill="var(--s-lunge)" stroke="var(--s-lunge-rand)" stroke-width="3.5"/>
    <text class="sb" x="465" y="16" text-anchor="middle">Lunge</text>
    <g fill="var(--s-alveole)" stroke="var(--s-lunge-rand)" stroke-width="2">
      <circle cx="278" cy="150" r="11"/><circle cx="296" cy="130" r="9"/><circle cx="266" cy="176" r="9"/>
      <circle cx="616" cy="150" r="11"/><circle cx="598" cy="130" r="9"/><circle cx="628" cy="176" r="9"/>
    </g>
    <g id="sLungeTropfen"></g>
  </g>
  <g data-side="l"><use href="#sdLungenvene" class="sWandVene"/><use href="#sdLungenvene" class="sBlutRot"/></g>
  <g data-side="r"><use href="#sdHohlvene" class="sWandVene"/><use href="#sdHohlvene" class="sBlutBlau"/></g>
  <g class="sz" data-info="koerper" data-side="b">
    <path d="M 300 614 C 380 600 560 600 632 616 C 682 627 686 684 632 694 C 540 706 380 706 292 694 C 236 686 244 624 300 614 Z" fill="var(--s-koerper)" stroke="var(--s-koerper-rand)" stroke-width="3.5"/>
    <text class="sb" x="466" y="688" text-anchor="middle">Körper</text>
  </g>
  <g>
    <use href="#sdHerz" fill="var(--s-muskel-hell)" stroke="var(--s-muskel-dunkel)" stroke-width="3.5"/>
    <g id="sgRA" class="sz" data-info="ra" data-side="r">
      <ellipse cx="358" cy="336" rx="52" ry="40" transform="rotate(-8 358 336)" fill="var(--s-hohl-blau)" stroke="var(--s-muskel)" stroke-width="7"/>
      <g id="sbRA"></g>
      <text class="sb mini" x="356" y="330" text-anchor="middle">rechter</text><text class="sb" x="356" y="350" text-anchor="middle">Vorhof</text>
    </g>
    <g id="sgLA" class="sz" data-info="la" data-side="l">
      <ellipse cx="530" cy="330" rx="50" ry="36" transform="rotate(8 530 330)" fill="var(--s-hohl-rot)" stroke="var(--s-muskel)" stroke-width="7"/>
      <g id="sbLA"></g>
      <text class="sb mini" x="530" y="324" text-anchor="middle">linker</text><text class="sb" x="530" y="344" text-anchor="middle">Vorhof</text>
    </g>
    <g id="sgRV" class="sz" data-info="rv" data-side="r">
      <ellipse cx="380" cy="448" rx="62" ry="66" transform="rotate(-10 380 448)" fill="var(--s-hohl-blau)" stroke="var(--s-muskel)" stroke-width="11"/>
      <g id="sbRV"></g>
      <text class="sb mini" x="378" y="446" text-anchor="middle">rechte</text><text class="sb" x="378" y="466" text-anchor="middle">Kammer</text>
    </g>
    <g id="sgLV" class="sz" data-info="lv" data-side="l">
      <ellipse cx="508" cy="450" rx="56" ry="76" transform="rotate(8 508 450)" fill="var(--s-hohl-rot)" stroke="var(--s-muskel)" stroke-width="22"/>
      <g id="sbLV"></g>
      <text class="sb mini" x="508" y="448" text-anchor="middle">linke</text><text class="sb" x="508" y="468" text-anchor="middle">Kammer</text>
    </g>
    <g fill="none" stroke="#E7EFF0" stroke-width="7" stroke-linecap="round" marker-end="url(#sSpitze)" pointer-events="none">
      <path id="spFuellR" d="M 352 352 C 360 374 372 396 376 418" opacity="0" data-side="r"/>
      <path id="spFuellL" d="M 516 350 C 512 372 508 396 507 418" opacity="0" data-side="l"/>
      <path id="spAusR" d="M 398 412 C 412 396 424 384 432 370" opacity="0" data-side="r"/>
      <path id="spAusL" d="M 524 404 C 538 396 550 388 560 380" opacity="0" data-side="l"/>
    </g>
  </g>
  <g data-side="r"><use href="#sdLungenarterie" class="sHalo"/><use href="#sdLungenarterie" class="sWandArterie"/><use href="#sdLungenarterie" class="sBlutBlau"/></g>
  <g data-side="l">
    <path id="sWandAorta" d="M 558 388 C 578 372 592 344 600 316 C 610 286 636 266 668 266 C 700 266 716 292 716 320 L 716 594 C 716 626 690 648 660 654" fill="none" stroke="var(--s-wand-arterie)" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:34px"/>
    <path d="M 558 388 C 578 372 592 344 600 316 C 610 286 636 266 668 266 C 700 266 716 292 716 320 L 716 594 C 716 626 690 648 660 654" fill="none" stroke="var(--s-hohl-rot)" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:19px"/>
  </g>
  <g id="sBlase" data-side="l">
    <path id="sBlaseWand" fill="none" stroke="var(--s-wand-arterie)" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:34px"/>
    <path id="sBlaseBlut" fill="none" stroke="var(--s-hohl-rot)" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:19px"/>
    <g id="sBlaseTropfen"></g>
  </g>
  <g id="sKlappen"></g>
  <g id="sTeilchen"></g>
  <g class="sz" data-info="pt" data-side="r"><text class="sb" x="428" y="258" text-anchor="end">Lungenarterie</text><text class="sb mini" x="428" y="276" text-anchor="end">Arterie: vom Herzen weg</text></g>
  <g class="sz" data-info="pv" data-side="l"><text class="sb" x="544" y="258" text-anchor="start">Lungenvene</text><text class="sb mini" x="544" y="276" text-anchor="start">Vene: zum Herzen hin</text></g>
  <g class="sz" data-info="aorta" data-side="l"><text class="sb" x="744" y="352" text-anchor="start">Aorta</text><text class="sb mini" x="744" y="370" text-anchor="start">größte Arterie</text></g>
  <g class="sz" data-info="svc" data-side="r"><text class="sb" x="172" y="386" text-anchor="end">Hohlvene</text><text class="sb mini" x="172" y="404" text-anchor="end">Vene: zum Herzen hin</text></g>
</svg>`;

  let svg = null, built = false;
  const W2 = {}, R = [], BL = [], LU = [], KL = [], POOL = [];
  const EIN2 = 150, TOR2 = 330, BLASE_MAX = 14, MAXP = 22;
  const near = (w, x, y) => { let best = 0, bd = 1e18; for (let i = 0; i <= 400; i++) { const l = i / 400 * w.len, p = w.el.getPointAtLength(l); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = l; } } return best; };
  function circle(parent, r, fill) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', r); c.setAttribute('fill', fill); c.setAttribute('stroke', 'rgba(255,255,255,.55)'); c.setAttribute('stroke-width', '1.4'); c.setAttribute('opacity', '0');
    parent.appendChild(c); return c;
  }
  function build(box, onPick) {
    if (built) return;
    box.innerHTML = SVG;
    svg = box.querySelector('svg');
    const $ = (id) => svg.querySelector('#' + id);
    [['rechtsRein', 'swRechtsRein'], ['linksRein', 'swLinksRein'], ['lungeLinks', 'swLungeLinks'], ['lungeRechts', 'swLungeRechts'], ['koerper', 'swKoerper']].forEach(([k, id]) => {
      const el = $(id); W2[k] = { el, len: el.getTotalLength() };
    });
    // Schlüsselstellen auf den Wegen: Klappe, Lunge, Körper
    W2.rechtsRein.kb = near(W2.rechtsRein, 378, 380); W2.linksRein.kb = near(W2.linksRein, 510, 372);
    ['lungeLinks', 'lungeRechts'].forEach((k) => { const w = W2[k]; w.kb = near(w, 438, 366); });
    W2.lungeLinks.luA = near(W2.lungeLinks, 362, 165); W2.lungeLinks.luB = near(W2.lungeLinks, 386, 226);
    W2.lungeRechts.luA = near(W2.lungeRechts, 530, 165); W2.lungeRechts.luB = near(W2.lungeRechts, 506, 226);
    const wk = W2.koerper; wk.kb = near(wk, 568, 379); wk.bA = near(wk, 700, 640); wk.bB = near(wk, 230, 650);
    // Blut in den Herzräumen
    [['ra', 'sbRA', 358, 336, 52, 40, -8, 'var(--s-blau)'], ['la', 'sbLA', 530, 330, 50, 36, 8, 'var(--s-rot)'],
     ['rv', 'sbRV', 380, 448, 62, 66, -10, 'var(--s-blau)'], ['lv', 'sbLV', 508, 450, 56, 76, 8, 'var(--s-rot)']].forEach((r) => {
      const g = $(r[1]); g.setAttribute('transform', 'rotate(' + r[6] + ' ' + r[2] + ' ' + r[3] + ')');
      const pts = [];
      for (let i = 0; i < MAXP; i++) {
        const rad = Math.sqrt((i + 0.5) / MAXP) * 0.7, wi = i * 2.39996;
        const c = circle(g, 6.5, r[7]); c.setAttribute('cx', r[2] + Math.cos(wi) * rad * r[4]); c.setAttribute('cy', r[3] + Math.sin(wi) * rad * r[5]); pts.push(c);
      }
      R.push({ raum: r[0], g: '#' + r[1].replace('sb', 'sg'), pts, cx: r[2], cy: r[3] });
    });
    // Windkessel-Blase in der Aorta
    const st = [];
    for (let i = 0; i <= 26; i++) { const p = wk.el.getPointAtLength(EIN2 + i / 26 * (TOR2 - EIN2)); st.push(p.x.toFixed(1) + ' ' + p.y.toFixed(1)); }
    const dB = 'M ' + st[0] + ' L ' + st.slice(1).join(' L ');
    $('sBlaseWand').setAttribute('d', dB); $('sBlaseBlut').setAttribute('d', dB);
    for (let k = 0; k < BLASE_MAX; k++) {
      const reihe = k % 2 === 0 ? -1 : 1, l = EIN2 + ((Math.floor(k / 2) + 0.5) / (BLASE_MAX / 2)) * (TOR2 - EIN2);
      const a = wk.el.getPointAtLength(Math.max(0, l - 5)), b = wk.el.getPointAtLength(Math.min(wk.len, l + 5)), m = wk.el.getPointAtLength(l);
      const dx = b.x - a.x, dy = b.y - a.y, lg = Math.hypot(dx, dy) || 1;
      BL.push({ x: m.x, y: m.y, nx: -dy / lg * reihe, ny: dx / lg * reihe, el: circle($('sBlaseTropfen'), 7, 'var(--s-rot)') });
    }
    // Blut, das gerade in der Lunge ist (Kapillaren)
    const lt = $('sLungeTropfen');
    [[330, 150], [352, 192], [312, 205], [370, 120], [300, 178], [386, 160], [340, 224], [360, 96],
     [600, 150], [578, 192], [618, 205], [560, 120], [630, 178], [544, 160], [590, 224], [570, 96]].forEach((p, i) => {
      const c = circle(lt, 6.5, i % 2 ? 'var(--s-uebergang)' : 'var(--s-rot)'); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); LU.push(c);
    });
    // Klappen
    [{ c: [378, 380], d: [0, 1], w: 44, rand: 11, blatt: 7, k: 'tv', side: 'r' }, { c: [510, 372], d: [0, 1], w: 42, rand: 11, blatt: 7, k: 'mv', side: 'l' },
     { c: [438, 366], d: [0.30, -0.95], w: 17, rand: 8, blatt: 5, k: 'pv', side: 'r' }, { c: [568, 379], d: [0.78, -0.62], w: 17, rand: 8, blatt: 5, k: 'av', side: 'l' }].forEach((k) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sz'); g.setAttribute('data-info', { tv: 'tricus', mv: 'mitral', pv: 'pulm', av: 'aortic' }[k.k]); g.setAttribute('data-side', k.side);
      k.el = [-1, 1].map((s) => {
        const rand = document.createElementNS(NS, 'path'), blatt = document.createElementNS(NS, 'path');
        rand.setAttribute('stroke', 'var(--s-muskel-dunkel)'); rand.setAttribute('stroke-width', k.rand); rand.setAttribute('fill', 'none'); rand.setAttribute('stroke-linecap', 'round');
        blatt.setAttribute('stroke', 'var(--s-klappe)'); blatt.setAttribute('stroke-width', k.blatt); blatt.setAttribute('fill', 'none'); blatt.setAttribute('stroke-linecap', 'round');
        g.appendChild(rand); g.appendChild(blatt); return { s, rand, blatt };
      });
      $('sKlappen').appendChild(g); KL.push(k);
    });
    // Blutportionen unterwegs
    const tg = $('sTeilchen');
    for (let i = 0; i < 190; i++) POOL.push(circle(tg, 7, 'var(--s-blau)'));
    // Antippen
    svg.addEventListener('click', (e) => { const t = e.target.closest('.sz'); if (t && onPick) onPick(t.getAttribute('data-info'), e); });
    built = true;
  }
  function skaliere(sel, cx, cy, sx, sy) { const g = svg.querySelector(sel); if (g) g.setAttribute('transform', 'translate(' + cx + ',' + cy + ') scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ') translate(' + (-cx) + ',' + (-cy) + ')'); }
  // 3D-Abstand auf einem Weg -> 2D-Abstand (stückweise linear zwischen Schlüsselstellen)
  function abbild(xs, ys, d) {
    for (let i = 0; i < xs.length - 1; i++) {
      if (d <= xs[i + 1] || i === xs.length - 2) { const f = grenz((d - xs[i]) / Math.max(1e-6, xs[i + 1] - xs[i]), 0, 1); return ys[i] + (ys[i + 1] - ys[i]) * f; }
    }
    return ys[ys.length - 1];
  }
  function map(name, w3, d) {
    if (name === 'rechtsRein' || name === 'linksRein') { const w = W2[name]; return { w, l: abbild([0, w3.klappeBei, w3.len], [0, w.kb, w.len], d) }; }
    if (name.startsWith('lunge')) {
      const w = W2[name], s0 = w3.jet ? Math.max(0, w3.klappeBei - 0.7) : 0;
      return { w, l: abbild([s0, w3.klappeBei, w3.luEin, w3.luTor, w3.len], [0, w.kb, w.luA, w.luB, w.len], d) };
    }
    const w = W2.koerper, s0 = Math.max(0, w3.klappeBei - 0.7);
    const hi = w3.seg.findIndex((s) => !s.vis), hA = w3.d[hi], hB = w3.d[hi + 1];
    return { w, l: abbild([s0, w3.klappeBei, w3.ein, w3.tor, hA, hB, w3.len], [0, w.kb, EIN2, TOR2, w.bA, w.bB, w.len], d) };
  }
  function farbe(name, w, l) {
    if (name === 'rechtsRein') return 'var(--s-blau)';
    if (name === 'linksRein') return 'var(--s-rot)';
    if (name.startsWith('lunge')) return l < w.luA ? 'var(--s-blau)' : (l > w.luB ? 'var(--s-rot)' : 'var(--s-uebergang)');
    const f = (l - w.bA) / Math.max(1, w.bB - w.bA);
    return f < 0.25 ? 'var(--s-rot)' : (f > 0.65 ? 'var(--s-blau)' : 'var(--s-uebergang)');
  }
  let lastFocus = 'x';
  function update(eng, Wt, WEGE, opt) {
    if (!built) return;
    const K = eng.K, sp = eng.speicher, kv = K.vorhof;
    const ff = (n) => 0.88 + 0.12 * grenz(n / 10, 0, 2.0);
    skaliere('#sgRA', 358, 336, ff(sp.ra) * (1 - 0.18 * kv), ff(sp.ra) * (1 - 0.15 * kv));
    skaliere('#sgLA', 530, 330, ff(sp.la) * (1 - 0.18 * kv), ff(sp.la) * (1 - 0.15 * kv));
    skaliere('#sgRV', 380, 448, ff(sp.rv) * (1 - 0.30 * K.rk), ff(sp.rv) * (1 - 0.22 * K.rk));
    skaliere('#sgLV', 508, 450, ff(sp.lv) * (1 - 0.30 * K.lk), ff(sp.lv) * (1 - 0.22 * K.lk));
    R.forEach((r) => { const n = Math.round(grenz(sp[r.raum], 0, MAXP)); r.pts.forEach((c, i) => c.setAttribute('opacity', i < n ? 1 : 0)); });
    // Klappen
    KL.forEach((k) => {
      const o = Wt[k.k], dir = k.d, w = k.w, px = -dir[1], py = dir[0];
      k.el.forEach((b) => {
        const s = b.s, hx = k.c[0] + s * px * w, hy = k.c[1] + s * py * w;
        const zx = k.c[0] - dir[0] * 0.30 * w, zy = k.c[1] - dir[1] * 0.30 * w;
        const ax = k.c[0] + s * px * 0.70 * w + dir[0] * 1.05 * w, ay = k.c[1] + s * py * 0.70 * w + dir[1] * 1.05 * w;
        const tx = zx + (ax - zx) * o, ty = zy + (ay - zy) * o, cx = (hx + tx) / 2 + dir[0] * 0.32 * w, cy = (hy + ty) / 2 + dir[1] * 0.32 * w;
        const d = 'M ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ' Q ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1);
        b.rand.setAttribute('d', d); b.blatt.setAttribute('d', d);
      });
    });
    // Pfeile: Füllung bei offener Segelklappe, Auswurf bei offener Taschenklappe
    svg.querySelector('#spFuellR').setAttribute('opacity', (0.55 * Wt.tv * (0.5 + kv)).toFixed(2));
    svg.querySelector('#spFuellL').setAttribute('opacity', (0.55 * Wt.mv * (0.5 + kv)).toFixed(2));
    svg.querySelector('#spAusR').setAttribute('opacity', Math.min(0.95, Wt.pv * K.rk * 2).toFixed(2));
    svg.querySelector('#spAusL').setAttribute('opacity', Math.min(0.95, Wt.av * K.lk * 2).toFixed(2));
    // Windkessel
    const de = eng.dehnung, wkOn = eng.S.windkessel;
    svg.querySelector('#sWandAorta').style.stroke = wkOn ? 'var(--s-wand-arterie)' : 'var(--s-starr)';
    svg.querySelector('#sBlase').setAttribute('opacity', wkOn ? 1 : 0);
    svg.querySelector('#sBlaseWand').style.strokeWidth = (34 + 40 * de).toFixed(1) + 'px';
    svg.querySelector('#sBlaseBlut').style.strokeWidth = (19 + 36 * de).toFixed(1) + 'px';
    const seite = 13 * de;
    BL.forEach((b, i) => { b.el.setAttribute('cx', (b.x + b.nx * seite).toFixed(1)); b.el.setAttribute('cy', (b.y + b.ny * seite).toFixed(1)); b.el.setAttribute('opacity', wkOn && i < eng.imWK ? 1 : 0); });
    // Lunge: Blut beim Gasaustausch
    const nl = Math.min(LU.length, Math.round(eng.imLu || 0));
    LU.forEach((c, i) => c.setAttribute('opacity', i < nl ? 1 : 0));
    // Portionen unterwegs
    let i = 0;
    for (const t of eng.teilchen) {
      if (i >= POOL.length) break;
      const w3 = WEGE[t.weg]; if (!w3) continue;
      const m = map(t.weg, w3, t.d), p = m.w.el.getPointAtLength(grenz(m.l, 0, m.w.len));
      const col = farbe(t.weg, m.w, m.l), blau = col.indexOf('blau') >= 0;
      if (opt && opt.focus === 'lunge' && col.indexOf('rot') >= 0) continue;
      if (opt && opt.focus === 'koerper' && blau) continue;
      const c = POOL[i++]; c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('fill', col); c.setAttribute('opacity', 1);
    }
    for (; i < POOL.length; i++) POOL[i].setAttribute('opacity', 0);
    // Kreislauf-Auswahl: andere Seite blass
    const f = (opt && opt.focus) || '';
    if (f !== lastFocus) {
      lastFocus = f;
      svg.querySelectorAll('[data-side]').forEach((g) => {
        const s = g.getAttribute('data-side');
        const on = !f || s === 'b' || (f === 'lunge' && s === 'r') || (f === 'koerper' && s === 'l');
        g.style.opacity = on ? 1 : 0.12;
      });
    }
  }
  return { build, update };
})();

/* =====================================================================
   LUPE – Nahansicht wie im Nephron-Modell
   Kleine bewegte Zeichnung, die zeigt, was in einer Struktur passiert.
   Alles läuft im Takt derselben Herzphysik (Kontraktion, Klappen,
   Windkessel, EKG-Position).
   ===================================================================== */
const HerzLupe = (function () {
  'use strict';
  const W = 360, H = 212;
  const C = { bg: '#0C1A20', ink: '#E7EFF0', dim: '#8DA7B1', faint: '#5E7883', brass: '#E0A94A', blau: '#3E82D6', rot: '#D4473F', lila: '#8E5CA8',
    ca: '#F2C94C', na: '#5AA9FF', k: '#5BD38A', o2: '#F4F7F8', co2: '#7E8C94', muskel: '#7A3A34', muskelHell: '#A65A50', wand: '#9E5B55', faser: '#E8C9A8' };
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const SCENES = {
    muskel: { chip: 'Herzmuskel' }, klappe: { chip: 'Klappe' }, aorta: { chip: 'Windkessel' }, erregung: { chip: 'Erregung' },
    koronar: { chip: 'Kranzgefäß' }, lunge: { chip: 'Lunge' }, koerper: { chip: 'Körper' }
  };
  let ctx = null, dpr = 1, scene = 'muskel', variant = {}, P = [], tAcc = 0;
  function setCanvas(cv) { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; ctx = cv.getContext('2d'); }
  function set(sc, v) { scene = sc; variant = v || {}; P = []; tAcc = 0; init(); }
  function exc(pos) {
    return { A: sstep(0.02, 0.06, pos) * (1 - sstep(0.15, 0.21, pos)), V: sstep(0.17, 0.21, pos) * (1 - sstep(0.37, 0.47, pos)) };
  }
  function label(t, x, y, col, al) { ctx.fillStyle = col || C.faint; ctx.font = '500 9.5px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; ctx.textAlign = al || 'left'; ctx.fillText(t, x, y); }
  function dot(x, y, r, col, ring) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); if (ring) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.stroke(); } }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function init() {
    if (scene === 'muskel') { for (let i = 0; i < 26; i++) P.push({ x: rnd(20, 340), y: rnd(36, 180), ph: rnd(0, 6.28) }); }
    else if (scene === 'klappe') { for (let i = 0; i < 26; i++) P.push({ x: rnd(80, 280), y: rnd(18, 196), vx: rnd(-10, 10), vy: rnd(-10, 10) }); }
    else if (scene === 'aorta') { for (let i = 0; i < 16; i++) P.push({ x: rnd(10, 350), y: rnd(80, 130) }); }
    else if (scene === 'erregung') {
      [['na', 26], ['ca', 14], ['k', 22]].forEach(([t, n]) => { for (let i = 0; i < n; i++) P.push({ t, x: rnd(12, 348), y: t === 'k' ? rnd(66, 96) : rnd(8, 36), cross: 0 }); });
    } else if (scene === 'koronar') { for (let i = 0; i < 40; i++) P.push({ b: i % 5, s: Math.random() }); }
    else if (scene === 'lunge' || scene === 'koerper') {
      for (let i = 0; i < 9; i++) P.push({ t: 'z', x: 20 + i * 40, o: 0 });
      for (let i = 0; i < 18; i++) P.push({ t: 'g', x: rnd(30, 330), y: rnd(14, 92), gas: i % 3 === 0 ? 'co2' : 'o2', mv: 0 });
    }
  }

  /* ---------- 1. Herzmuskelzelle ---------- */
  function drawMuskel(S, dt) {
    const atr = variant.atrium, c = atr ? S.K.vorhof : Math.max(S.K.rk, S.K.lk), ex = exc(S.pos), ca = atr ? ex.A : ex.V;
    const cx = 180, shrink = 1 - 0.18 * c;
    [[30, 92], [118, 180]].forEach(([y0, y1], row) => {
      const half = 166 * shrink, x0 = cx - half, x1 = cx + half;
      ctx.fillStyle = '#3A1E1C'; rrect(x0, y0, x1 - x0, y1 - y0, 14); ctx.fill();
      ctx.strokeStyle = C.muskelHell; ctx.lineWidth = 1.5; ctx.stroke();
      // Glanzstreifen (Verbindung zweier Zellen)
      const gx = cx + (row ? -0.25 : 0.3) * half;
      ctx.strokeStyle = C.faser; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 6; k++) { const yy = y0 + k * (y1 - y0) / 6; ctx[k ? 'lineTo' : 'moveTo'](gx + (k % 2 ? 4 : -4), yy); } ctx.stroke();
      // Sarkomere
      const n = 6, L = (x1 - x0) / n, L0 = 332 / n, ym = (y0 + y1) / 2;
      for (let i = 0; i < n; i++) {
        const za = x0 + i * L, zb = za + L, mid = (za + zb) / 2;
        ctx.strokeStyle = '#E7D2C9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(za, y0 + 6); ctx.lineTo(za, y1 - 6); ctx.stroke();
        // Aktin (dünn) von den Z-Linien nach innen – feste Länge, gleitet über das Myosin
        ctx.strokeStyle = '#D79A8E'; ctx.lineWidth = 1.2;
        for (let r = -2; r <= 2; r++) { const yy = ym + r * 9; ctx.beginPath(); ctx.moveTo(za, yy); ctx.lineTo(za + 0.42 * L0, yy); ctx.moveTo(zb, yy); ctx.lineTo(zb - 0.42 * L0, yy); ctx.stroke(); }
        // Myosin (dick) in der Mitte
        ctx.strokeStyle = '#B6475A'; ctx.lineWidth = 3.4;
        for (let r = -1.5; r <= 1.5; r += 1) { const yy = ym + r * 9; ctx.beginPath(); ctx.moveTo(mid - 0.27 * L0, yy); ctx.lineTo(mid + 0.27 * L0, yy); ctx.stroke();
          // Köpfchen: kippen beim Ziehen
          ctx.lineWidth = 1.2; const tilt = (c > 0.05 ? Math.sin(tAcc * 18 + i + r) * 0.5 + 0.5 : 0) * 3;
          for (let h = -2; h <= 2; h++) { if (!h) continue; const hx = mid + h * 0.11 * L0; ctx.beginPath(); ctx.moveTo(hx, yy); ctx.lineTo(hx + Math.sign(h) * (3 + tilt), yy - 4); ctx.moveTo(hx, yy); ctx.lineTo(hx + Math.sign(h) * (3 + tilt), yy + 4); ctx.stroke(); }
          ctx.lineWidth = 3.4; }
      }
    });
    // Calcium in der Zelle
    const nCa = Math.round(2 + 24 * ca);
    P.forEach((p, i) => { if (i >= nCa) return; p.ph += dt * 2; dot(cx + (p.x - cx) * shrink + Math.sin(p.ph) * 3, p.y + Math.cos(p.ph * 1.3) * 3, 2.6, C.ca); });
    label('Z-Linie', 12, 14); label('Aktin', 104, 14, '#D79A8E'); label('Myosin', 160, 14, '#E47A8C'); label('Ca²⁺', 232, 14, C.ca);
    label(c > 0.15 ? 'zieht sich zusammen' : 'erschlafft', 348, 204, c > 0.15 ? C.brass : C.dim, 'right');
  }

  /* ---------- 2. Klappe ---------- */
  function drawKlappe(S, dt) {
    const v = variant, av = v.av, o = S.W[v.key] || 0, rot = v.rot, col = rot ? C.rot : C.blau;
    const yV = 106, up = av ? 'oben' : 'unten';
    // Räume
    ctx.fillStyle = rot ? '#3A1C1E' : '#1A2E44';
    ctx.fillRect(70, 6, 220, yV - 12); ctx.fillRect(70, yV + 12, 220, H - yV - 18);
    ctx.strokeStyle = C.muskelHell; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(66, 4); ctx.lineTo(66, H - 4); ctx.moveTo(294, 4); ctx.lineTo(294, H - 4); ctx.stroke();
    label(v.oben, 80, 20, C.dim); label(v.unten, 80, H - 10, C.dim);
    // Klappensegel
    const op = Math.max(0, Math.min(1, o));
    ctx.strokeStyle = '#F1E4CF'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    [-1, 1].forEach((s) => {
      const hx = s < 0 ? 70 : 290, len = 105;
      const ang = av ? (-Math.PI / 2) * op * 0.85 : (Math.PI / 2) * op * 0.85;   // Taschen öffnen nach oben, Segel nach unten
      const dx = Math.cos(ang) * len * -s * -1, dy = Math.sin(ang) * len;
      const tx = hx + (s < 0 ? 1 : -1) * Math.cos(ang) * len, ty = yV + (av ? -1 : 1) * Math.abs(Math.sin(ang)) * len;
      ctx.beginPath(); ctx.moveTo(hx, yV); ctx.quadraticCurveTo((hx + tx) / 2, (yV + ty) / 2 + (av ? -8 : 8), tx, ty); ctx.stroke();
      if (!av) { ctx.strokeStyle = '#D8CBB8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx + (s < 0 ? 40 : -40), H - 14); ctx.stroke(); ctx.strokeStyle = '#F1E4CF'; ctx.lineWidth = 5; }
    });
    // Druck als Balken
    const pA = v.pOben(S), pB = v.pUnten(S);
    [[pA, 22, 'oben'], [pB, yV + 18, 'unten']].forEach(([p, y]) => {
      ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(306, y, 14, 76);
      ctx.fillStyle = C.brass; ctx.fillRect(306, y + 76 - 76 * p, 14, 76 * p);
    });
    label('Druck', 313, yV + 4, C.faint, 'center');
    // Blut
    const dir = av ? -1 : 1, open = op > 0.3;
    P.forEach((p) => {
      p.vx += rnd(-30, 30) * dt; p.vy += rnd(-30, 30) * dt;
      if (open) p.vy += dir * 140 * dt * op;
      p.vx *= 0.96; p.vy *= 0.94; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 78) { p.x = 78; p.vx = Math.abs(p.vx); } if (p.x > 282) { p.x = 282; p.vx = -Math.abs(p.vx); }
      const gap = open && Math.abs(p.x - 180) < 110 * op;
      if (!gap) { if (p.y < yV && p.y > yV - 16) { p.y = yV - 16; p.vy = -Math.abs(p.vy); } else if (p.y >= yV && p.y < yV + 16) { p.y = yV + 16; p.vy = Math.abs(p.vy); } }
      if (p.y < 12) { if (av) { p.y = H - 12; } else { p.y = 12; p.vy = Math.abs(p.vy); } }
      if (p.y > H - 10) { if (!av) { p.y = 14; } else { p.y = H - 10; p.vy = -Math.abs(p.vy); } }
      dot(p.x, p.y, 4.5, col, true);
    });
    label(op > 0.5 ? 'offen' : 'geschlossen', 180, yV + 4, op > 0.5 ? C.brass : C.dim, 'center');
  }

  /* ---------- 3. Windkessel ---------- */
  function drawAorta(S, dt) {
    const de = S.dehnung, wk = S.windkessel, inflow = S.W.av * S.K.lk;
    const bulge = (x) => (wk ? 22 * de : 2 * de) * Math.exp(-Math.pow((x - 180) / 110, 2));
    const top = (x) => 64 - bulge(x), bot = (x) => 148 + bulge(x);
    ctx.fillStyle = '#3A1C1E'; ctx.beginPath(); ctx.moveTo(0, top(0)); for (let x = 0; x <= W; x += 6) ctx.lineTo(x, top(x)); for (let x = W; x >= 0; x -= 6) ctx.lineTo(x, bot(x)); ctx.closePath(); ctx.fill();
    // Wand mit elastischen Fasern
    [[top, -1], [bot, 1]].forEach(([f, s]) => {
      ctx.fillStyle = wk ? C.wand : '#7E716E'; ctx.beginPath(); ctx.moveTo(0, f(0)); for (let x = 0; x <= W; x += 6) ctx.lineTo(x, f(x)); for (let x = W; x >= 0; x -= 6) ctx.lineTo(x, f(x) + s * 24); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = wk ? C.faser : '#A79B97'; ctx.lineWidth = 1.4;
      for (let r = 0; r < 3; r++) { ctx.beginPath(); const amp = wk ? 4 * (1 - 0.85 * de) : 1; for (let x = 0; x <= W; x += 3) { const y = f(x) + s * (6 + r * 6) + Math.sin(x / 9 + r) * amp; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    });
    // Blut: Schub von links, gleichmäßiger Abfluss nach rechts
    const target = 14 + Math.round(30 * (wk ? de : 0)) + Math.round(10 * inflow);
    if (inflow > 0.2 && P.length < target) P.push({ x: 4, y: rnd(84, 128) });
    P.forEach((p) => { const v = wk ? (p.x < 180 ? 60 * inflow + 18 + 20 * de : 22 + 30 * de) : 15 + 140 * inflow; p.x += v * dt; p.y += Math.sin(p.x / 20) * 0.2; });
    P = P.filter((p) => p.x < W - 4);
    if (!wk && inflow < 0.1) P = P.filter((p) => p.x < 200 || Math.random() > 0.02);
    P.forEach((p) => dot(p.x, Math.max(top(p.x) + 6, Math.min(bot(p.x) - 6, p.y + (p.y - 106) * (bulge(p.x) / 46))), 4.5, C.rot, true));
    label('vom Herzen', 6, 196, C.dim); label('zum Körper', 354, 196, C.dim, 'right');
    label(wk ? (de > 0.5 ? 'Wand gedehnt' : 'Wand zieht sich zusammen') : 'starre Wand', 180, 18, wk && de > 0.5 ? C.brass : C.dim, 'center');
  }

  /* ---------- 4. Erregung an der Zellwand ---------- */
  function apMuskel(x) { // Membranspannung, 0 = -90 mV, 1 = +20 mV
    if (x < 0.17) return 0;
    if (x < 0.185) return (x - 0.17) / 0.015;
    if (x < 0.36) return 0.82 - (x - 0.185) * 0.4;
    if (x < 0.46) return Math.max(0, 0.75 * (1 - (x - 0.36) / 0.1));
    return 0;
  }
  function apSinus(x) { // Schrittmacher: langsamer Anstieg, dann Aufstrich
    if (x < 0.03) return 0.45 + x / 0.03 * 0.45;
    if (x < 0.14) return 0.9 - (x - 0.03) / 0.11 * 0.75;
    return 0.15 + (x - 0.14) / 0.86 * 0.3;
  }
  function drawErregung(S, dt) {
    const sinus = variant.sinus, ap = sinus ? apSinus : apMuskel, x = S.pos;
    const naPhase = sinus ? false : (x > 0.165 && x < 0.2), caPhase = sinus ? (x < 0.05 || x > 0.9) : (x > 0.19 && x < 0.36), kPhase = sinus ? (x > 0.04 && x < 0.15) : (x > 0.34 && x < 0.47);
    // Membran
    ctx.fillStyle = '#16262C'; ctx.fillRect(0, 0, W, 44); ctx.fillStyle = '#1E2A2A'; ctx.fillRect(0, 60, W, 44);
    ctx.fillStyle = '#C9A77A'; ctx.fillRect(0, 44, W, 4); ctx.fillRect(0, 56, W, 4);
    label('außen', 6, 12, C.faint); label('innen', 6, 100, C.faint);
    const chans = sinus ? [['ca', 120], ['k', 250]] : [['na', 80], ['ca', 180], ['k', 280]];
    chans.forEach(([t, cx]) => {
      const open = (t === 'na' && naPhase) || (t === 'ca' && caPhase) || (t === 'k' && kPhase);
      ctx.fillStyle = open ? C[t] : '#55606A'; ctx.fillRect(cx - 9, 42, 6, 20); ctx.fillRect(cx + 3, 42, 6, 20);
      label({ na: 'Na⁺', ca: 'Ca²⁺', k: 'K⁺' }[t], cx, 120, open ? C[t] : C.faint, 'center');
    });
    P.forEach((p) => {
      if (sinus && p.t === 'na') return;
      const ch = chans.find((c) => c[0] === p.t); const open = ch && ((p.t === 'na' && naPhase) || (p.t === 'ca' && caPhase) || (p.t === 'k' && kPhase));
      if (open && !p.cross && Math.random() < dt * (p.t === 'na' ? 6 : 2)) p.cross = 1;
      if (p.cross) { const cx = ch[1], ty = p.t === 'k' ? 20 : 82; p.x += (cx - p.x) * Math.min(1, dt * 6); p.y += (ty - p.y) * Math.min(1, dt * (p.t === 'na' ? 7 : 3)); if (Math.abs(p.y - ty) < 3) { p.cross = 0; p.back = 1; } }
      else { p.x += rnd(-20, 20) * dt; p.y += rnd(-12, 12) * dt; }
      // nach der Erregung langsam zurücksortieren (Pumpen)
      if (!open && p.back && Math.random() < dt * 0.6) { p.back = 0; p.y = p.t === 'k' ? rnd(66, 96) : rnd(8, 36); p.x = rnd(12, 348); }
      p.x = Math.max(6, Math.min(W - 6, p.x));
      dot(p.x, p.y, 2.8, C[p.t]);
    });
    // Aktionspotenzial
    const gx0 = 20, gx1 = 340, gy0 = 196, gh = 64;
    ctx.strokeStyle = '#23414D'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const u = i / 200, yy = gy0 - ap(u) * gh; i ? ctx.lineTo(gx0 + u * (gx1 - gx0), yy) : ctx.moveTo(gx0, yy); } ctx.stroke();
    if (sinus) { ctx.setLineDash([4, 3]); ctx.strokeStyle = C.brass; ctx.beginPath(); ctx.moveTo(gx0, gy0 - 0.45 * gh); ctx.lineTo(gx1, gy0 - 0.45 * gh); ctx.stroke(); ctx.setLineDash([]); label('Schwelle', gx1, gy0 - 0.45 * gh - 3, C.brass, 'right'); }
    dot(gx0 + x * (gx1 - gx0), gy0 - ap(x) * gh, 4.5, C.rot, true);
    label('Spannung', gx0, gy0 - gh - 4, C.faint);
  }

  /* ---------- 5. Kranzgefäß ---------- */
  const BR = [[[0, 30], [120, 34], [360, 30]], [[120, 34], [150, 90], [170, 200]], [[180, 33], [230, 100], [250, 200]], [[260, 32], [300, 110], [330, 200]], [[60, 31], [70, 120], [80, 200]]];
  function bp(b, s) { const p = BR[b], a = s < 0.5 ? p[0] : p[1], c = s < 0.5 ? p[1] : p[2], f = s < 0.5 ? s * 2 : (s - 0.5) * 2; return [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f]; }
  function drawKoronar(S, dt) {
    const q = Math.max(S.K.lk, S.K.rk);
    ctx.fillStyle = C.muskel; ctx.fillRect(0, 44, W, H - 44);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; for (let y = 52; y < H; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 6); ctx.stroke(); }
    label('Herzoberfläche', 6, 14, C.dim); label('Herzmuskel', 6, 60, C.faint);
    BR.forEach((p, i) => {
      const wdt = i === 0 ? 12 : 7 * (1 - 0.65 * q);
      ctx.strokeStyle = '#8E2A24'; ctx.lineWidth = wdt + 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]); ctx.stroke();
      ctx.strokeStyle = '#3A1C1E'; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]); ctx.stroke();
    });
    P.forEach((p) => {
      const v = p.b === 0 ? 0.45 : 0.32 * (1 - 0.88 * q);
      p.s += v * dt; if (p.s > 1) { p.s -= 1; p.b = Math.floor(Math.random() * 5); }
      const xy = bp(p.b, p.s); dot(xy[0], xy[1], p.b === 0 ? 3.6 : 3, C.rot);
    });
    label(q > 0.3 ? 'Systole: Gefäße zusammengedrückt' : 'Diastole: Gefäße offen, Blut fließt', 354, 206, q > 0.3 ? C.brass : C.ink, 'right');
  }

  /* ---------- 6./7. Gasaustausch in Lunge und Körper ---------- */
  function drawAustausch(S, dt) {
    const lunge = scene === 'lunge';
    const yC = 150, from = lunge ? C.blau : C.rot, to = lunge ? C.rot : C.blau;
    if (lunge) {
      ctx.fillStyle = '#1D3238'; ctx.beginPath(); ctx.ellipse(180, 52, 170, 58, 0, Math.PI, 0, true); ctx.fill();
      ctx.beginPath(); ctx.ellipse(180, 52, 170, 58, 0, 0, Math.PI); ctx.fill();
      label('Lungenbläschen: viel Sauerstoff', 180, 16, C.dim, 'center');
    } else {
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#2A3A3E'; rrect(14 + i * 86, 14, 76, 82, 16); ctx.fill(); dot(52 + i * 86, 56, 9, '#3F5358'); }
      label('Körperzellen: wenig Sauerstoff', 180, 10, C.dim, 'center');
    }
    ctx.fillStyle = '#3A1C1E'; ctx.fillRect(0, yC - 22, W, 44);
    ctx.strokeStyle = '#7A4A44'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, yC - 22); ctx.lineTo(W, yC - 22); ctx.moveTo(0, yC + 22); ctx.lineTo(W, yC + 22); ctx.stroke();
    label('Kapillare', 6, yC + 40, C.faint);
    P.forEach((p) => {
      if (p.t === 'z') {
        p.x += 42 * dt; if (p.x > W + 10) { p.x = -10; p.o = 0; }
        p.o = Math.max(p.o, Math.min(1, Math.max(0, (p.x - 70) / 180)));
        const r = parseInt(from.slice(1, 3), 16) * (1 - p.o) + parseInt(to.slice(1, 3), 16) * p.o, g = parseInt(from.slice(3, 5), 16) * (1 - p.o) + parseInt(to.slice(3, 5), 16) * p.o, b = parseInt(from.slice(5, 7), 16) * (1 - p.o) + parseInt(to.slice(5, 7), 16) * p.o;
        ctx.beginPath(); ctx.ellipse(p.x, yC, 13, 9, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; ctx.fill();
      } else {
        // Sauerstoff: in der Lunge ins Blut, im Körper aus dem Blut; Kohlendioxid umgekehrt
        const zumBlut = lunge ? p.gas === 'o2' : p.gas === 'co2';
        if (!p.mv && Math.random() < dt * 0.5) p.mv = 1;
        if (p.mv) {
          const ty = zumBlut ? yC + rnd(-10, 10) : rnd(20, 90);
          if (zumBlut) { p.y += 34 * dt; p.x += 10 * dt; if (p.y > yC) { p.mv = 0; p.y = rnd(14, 92); p.x = rnd(30, 330); } }
          else { if (p.y < yC - 10 && p.y > 100) { p.y -= 34 * dt; } else if (p.y >= yC - 10) { p.y -= 34 * dt; } else { p.y -= 30 * dt; } if (p.y < 18) { p.mv = 0; p.y = yC + rnd(-8, 8); p.x = rnd(30, 330); } }
        } else if (!zumBlut && p.y < 100) { p.y = yC + rnd(-8, 8); }
        dot(p.x, p.y, p.gas === 'o2' ? 3 : 3.4, p.gas === 'o2' ? C.o2 : C.co2);
      }
    });
    label('O₂', 344, 40, C.o2, 'right'); label('CO₂', 344, 54, C.co2, 'right');
  }

  function draw(S, dt) {
    if (!ctx) return;
    tAcc += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    if (scene === 'muskel') drawMuskel(S, dt);
    else if (scene === 'klappe') drawKlappe(S, dt);
    else if (scene === 'aorta') drawAorta(S, dt);
    else if (scene === 'erregung') drawErregung(S, dt);
    else if (scene === 'koronar') drawKoronar(S, dt);
    else drawAustausch(S, dt);
  }
  return { SCENES, set, draw, setCanvas, get scene() { return scene; }, get variant() { return variant; } };
})();

/* =====================================================================
   HERZ – 3D-Anatomie
   Gestaltung wie das Nephron-Modell, Physik aus dem Windkessel-Modell.
   ===================================================================== */
(function () {
'use strict';
var S = HeartSDF, R = S.R, INFO = HeartInfo;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var clamp = function (x, a, b) { return x < a ? a : (x > b ? b : x); };
var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
var WATERMARK = Kern.WM;
if (!window.THREE) { $('bootSt').textContent = 'Die 3D-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung pr\u00fcfen und neu laden.'; return; }

var App = window.HerzApp = { ready: false, sel: null, opened: true, openK: 1, labels: true, see: false, sound: false, quiz: null, morph: [], pick: [] };

/* =====================================================================
   1. Szene, Licht, Material (wie im Nephron-Modell)
   ===================================================================== */
var canvas = $('cv');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x0b171c, 1);
renderer.localClippingEnabled = true;
/* Schnittebene: in der geöffneten Ansicht werden Klappen, Fäden und Gefäßbahnen genau an der Ebene abgeschnitten */
var CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.14), CLIP_PV = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1.2);
var clipMats = [], clipMatsPv = [], clipMatsErl = [], CLIP_ERL = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.34), corBack = [];
var CLIP0 = CLIP.clone(), CLIP_PV0 = CLIP_PV.clone(), CLIP_ERL0 = CLIP_ERL.clone();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(38, 1, 0.3, 300);
var view = { theta: 0.0, phi: 1.52, dist: 34.5, target: V(0.4, 1.0, -1.2) };

var envTex = Kern.umgebung(renderer);
Kern.licht(scene, envTex);

var srgb = Kern.srgb;
function mat(hex, o) {
  o = Object.assign({}, o);
  if (o.morph !== false) o.morph = true;
  return Kern.mat(hex, o, envTex);
}
function tissueMats() {
  return [mat(0, { vc: true, rough: 0.55, coat: 0.25, env: 0.3 }), mat(0, { vc: true, rough: 0.34, coat: 0.45, coatRough: 0.25, env: 0.4 }), mat(0, { vc: true, rough: 0.82, env: 0.15 })];
}
var cond = { uTau: { value: 0 }, uOn: { value: 1 } };
function condMat() {
  var m = mat(0xE8B830, { rough: 0.45 });
  m.emissive = srgb(0x6b4e08); m.userData.baseEmissive = m.emissive.clone();
  m.onBeforeCompile = function (sh) {
    sh.uniforms.uTau = cond.uTau; sh.uniforms.uOn = cond.uOn;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float act;\nvarying float vAct;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAct = act;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTau; uniform float uOn; varying float vAct;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
        'float dd = uTau - vAct; dd = dd - floor(dd + 0.5);\n' +
        'float hot = exp(-dd * dd / 0.00012);\n' +
        'float tail = (dd > 0.0 && dd < 0.09) ? 0.22 * (1.0 - dd / 0.09) : 0.0;\n' +
        'totalEmissiveRadiance = totalEmissiveRadiance * 0.25 + vec3(1.0, 0.82, 0.3) * (hot * 1.5 + tail) * uOn;');
  };
  m.customProgramCacheKey = function () { return 'erl'; };
  return m;
}

/* Durchsichtiger Deckel: Vorderwand bleibt in der geöffneten Ansicht als Glas liegen */
var glassU = { value: 0 };
function glassify(m, a0, a1) {
  a0 = a0 === undefined ? 0.1 : a0; a1 = a1 === undefined ? 0.62 : a1;
  var prev = m.onBeforeCompile;
  m.onBeforeCompile = function (sh) {
    if (prev) prev(sh);
    sh.uniforms.uGlass = glassU;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uGlass;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' +
        'float frg = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));\n' +
        'gl_FragColor.a *= mix(1.0, mix(' + a0.toFixed(3) + ', ' + a1.toFixed(3) + ', pow(frg, 2.2)), uGlass);');
  };
  var key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.customProgramCacheKey = function () { return key + '|glas' + a0 + '_' + a1; };
  m.userData.glass = true;
  return m;
}
var root = new THREE.Group(); scene.add(root);
var backG = new THREE.Group(); root.add(backG);
var lidPivot = new THREE.Group(); lidPivot.position.set(6.4, 0, 0.6); root.add(lidPivot);
var lidG = new THREE.Group(); lidG.position.set(-6.4, 0, -0.6); lidPivot.add(lidG);

/* =====================================================================
   2. Strukturen
   ===================================================================== */
var STRUCT = {}, ORDER = [];
INFO.S.forEach(function (s) { var d = Object.assign({ meshes: [], mats: [], on: true, has: false }, s); STRUCT[s.id] = d; ORDER.push(d); });
var regionSid = {}; regionSid[R.LV] = 'lv'; regionSid[R.RV] = 'rv'; regionSid[R.IVS] = 'ivs'; regionSid[R.LA] = 'la'; regionSid[R.RA] = 'ra'; regionSid[R.IAS] = 'ias';
regionSid[R.AO] = 'aorta'; regionSid[R.PT] = 'pt'; regionSid[R.SVC] = 'svc'; regionSid[R.IVC] = 'ivc'; regionSid[R.PV] = 'pv'; regionSid[R.PAP] = 'pap'; regionSid[R.LIG] = 'lig';
function register(sid, mesh, mats) {
  var st = STRUCT[sid]; if (!st) return;
  st.meshes.push(mesh); st.has = true;
  (mats || []).forEach(function (m) { if (st.mats.indexOf(m) < 0) st.mats.push(m); });
  mesh.userData.sid = sid; App.pick.push(mesh);
}
function addMorph(mesh, drivers) { mesh.userData.drivers = drivers; App.morph.push(mesh); }

/* =====================================================================
   3. Aufbau
   ===================================================================== */
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };
var MNAMES = ['VR', 'VL', 'A', 'Ao', 'PT'];
function regionMesh(o, region, lid) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(o.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(o.nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(o.col, 3));
  g.setIndex(o.idxS.concat(o.idxI, o.idxC));
  g.addGroup(0, o.idxS.length, 0); g.addGroup(o.idxS.length, o.idxI.length, 1); g.addGroup(o.idxS.length + o.idxI.length, o.idxC.length, 2);
  var nv = o.pos.length / 3, targets = [], drivers = [];
  for (var k = 0; k < 5; k++) {
    var arr = new Float32Array(nv * 3), mx = 0;
    for (var v = 0; v < nv; v++) for (var j = 0; j < 3; j++) { var val = o.mo[v * 15 + k * 3 + j]; arr[v * 3 + j] = val; if (Math.abs(val) > mx) mx = Math.abs(val); }
    if (mx > 2e-3) { targets.push(new THREE.BufferAttribute(arr, 3)); drivers.push(MNAMES[k]); }
  }
  if (targets.length) { g.morphAttributes.position = targets; g.morphTargetsRelative = true; }
  g.computeBoundingSphere();
  var mesh = new THREE.Mesh(g, tissueMats());
  mesh.name = (lid ? 'Vorderwand_' : 'Herz_') + regionSid[region];
  mesh.userData.tissue = true; mesh.userData.lid = lid; mesh.userData.region = region;
  if (targets.length) addMorph(mesh, drivers);
  return mesh;
}
/* Umrisslinien: Kanten zwischen Schnittfläche und Innen-/Außenfläche */
var outlineMat = null;
function outlineFor(mesh) {
  var g = mesh.geometry, pos = g.attributes.position, idx = g.index.array, grp = g.groups;
  if (!grp || grp.length < 3 || !grp[2].count) return null;
  var q = function (i) { return Math.round(pos.getX(i) * 2000) + ',' + Math.round(pos.getY(i) * 2000) + ',' + Math.round(pos.getZ(i) * 2000); };
  var edges = new Map();
  var addTri = function (a, b, c, cut) {
    [[a, b], [b, c], [c, a]].forEach(function (e) {
      var ka = q(e[0]), kb = q(e[1]), key = ka < kb ? ka + '|' + kb : kb + '|' + ka;
      var r = edges.get(key); if (!r) { r = { c: 0, n: 0, v: null }; edges.set(key, r); }
      if (cut) { r.c++; r.v = e; } else r.n++;
    });
  };
  for (var gi = 0; gi < 3; gi++) {
    var G = grp[gi];
    for (var t = G.start; t < G.start + G.count; t += 3) addTri(idx[t], idx[t + 1], idx[t + 2], gi === 2);
  }
  var list = [];
  edges.forEach(function (r) { if (r.c === 1 && r.n >= 1) list.push(r.v[0], r.v[1]); });
  if (list.length < 6) return null;
  var lg = new THREE.BufferGeometry(), P = new Float32Array(list.length * 3);
  var ma = g.morphAttributes.position || [], M = ma.map(function () { return new Float32Array(list.length * 3); });
  var nrm = g.attributes.normal;
  list.forEach(function (vi, k) {
    /* ein Hauch nach vorn, damit die Linie nicht in der Fläche verschwindet */
    P[k * 3] = pos.getX(vi) + nrm.getX(vi) * 0.012; P[k * 3 + 1] = pos.getY(vi) + nrm.getY(vi) * 0.012; P[k * 3 + 2] = pos.getZ(vi) + nrm.getZ(vi) * 0.012;
    ma.forEach(function (a, j) { M[j][k * 3] = a.getX(vi); M[j][k * 3 + 1] = a.getY(vi); M[j][k * 3 + 2] = a.getZ(vi); });
  });
  lg.setAttribute('position', new THREE.BufferAttribute(P, 3));
  if (M.length) { lg.morphAttributes.position = M.map(function (a) { return new THREE.BufferAttribute(a, 3); }); lg.morphTargetsRelative = true; }
  if (!outlineMat) { outlineMat = new THREE.LineBasicMaterial({ color: 0x2c120d, transparent: true, opacity: 0.92 }); outlineMat.morphTargets = true; }
  var line = new THREE.LineSegments(lg, outlineMat);
  line.name = 'Umriss'; line.userData.noexport = true; line.frustumCulled = false;
  line.morphTargetInfluences = new Array(M.length).fill(0);
  if (mesh.userData.drivers) { line.userData.drivers = mesh.userData.drivers; App.morph.push(line); }
  return line;
}
function tubeMesh(pts, r0, r1, material, radial) {
  var curve = new THREE.CatmullRomCurve3(pts.map(function (p) { return V(p[0], p[1], p[2]); }));
  var segs = Math.max(4, Math.round(pts.length * 2.2)), rs = radial || 7;
  var g = new THREE.TubeGeometry(curve, segs, 1, rs, false);
  var pos = g.attributes.position, n = g.attributes.normal;
  for (var i = 0; i <= segs; i++) {
    var t = i / segs, r = r0 + (r1 - r0) * t, c = curve.getPointAt(t);
    for (var k = 0; k <= rs; k++) { var id = i * (rs + 1) + k; pos.setXYZ(id, c.x + n.getX(id) * r, c.y + n.getY(id) * r, c.z + n.getZ(id) * r); }
  }
  g.computeBoundingSphere();
  return new THREE.Mesh(g, material);
}
function addMotionMorphs(mesh, anchor) {
  var g = mesh.geometry, p = g.attributes.position, nv = p.count;
  var mr = new Float32Array(nv * 3), ml = new Float32Array(nv * 3), ma = new Float32Array(nv * 3);
  var fixed = anchor ? HeartAssemble.motionSimple(anchor[0], anchor[1], anchor[2]) : null;
  for (var i = 0; i < nv; i++) {
    var m = fixed || HeartAssemble.motionSimple(p.getX(i), p.getY(i), p.getZ(i));
    for (var j = 0; j < 3; j++) { mr[i * 3 + j] = m[j]; ml[i * 3 + j] = m[3 + j]; ma[i * 3 + j] = m[6 + j]; }
  }
  g.morphAttributes.position = [new THREE.BufferAttribute(mr, 3), new THREE.BufferAttribute(ml, 3), new THREE.BufferAttribute(ma, 3)];
  g.morphTargetsRelative = true; mesh.updateMorphTargets();
  addMorph(mesh, ['VR', 'VL', 'A']);
}
function splitRuns(pts) {
  /* an der Schnittebene exakt trennen: Übergangspunkt wird interpoliert */
  var runs = [], cur = null, curFront = null;
  var side = function (p) { return p[2] - (S.cutF(p[0], p[1]) + 0.05); };
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i], front = side(p) > 0;
    if (cur === null) { cur = { front: front, pts: [p] }; curFront = front; continue; }
    if (front !== curFront) {
      var a = pts[i - 1], sa = side(a), sb2 = side(p), t = sa / (sa - sb2);
      var q = [a[0] + (p[0] - a[0]) * t, a[1] + (p[1] - a[1]) * t, a[2] + (p[2] - a[2]) * t];
      cur.pts.push(q); if (cur.pts.length > 1) runs.push(cur);
      cur = { front: front, pts: [q, p] }; curFront = front;
    } else cur.pts.push(p);
  }
  if (cur && cur.pts.length > 1) runs.push(cur);
  return runs;
}
/* Herzinfarkt: RIVA ab der Engstelle dunkel, Versorgungsgebiet blass (Vertexfarben); beides erst beim ersten Einschalten angelegt, bei 0 exakt die Originalfarben */
var INF = { a: 0, pts: null, rohre: [], meshes: null, an: false };
function infarktSetzen(a) {
  a = a || 0;
  if (!App.ready || a === INF.a || !INF.pts) return;
  var ENG = 0.3, MAXW = 0.7, ZIEL = [0.402, 0.305, 0.392];   /* Engstelle bei 30 % des RIVA; blasser grau-violetter Ton (linear) */
  if (!INF.meshes) {
    if (a <= 0) return;
    var n = INF.pts.length, i0 = Math.floor(ENG * (n - 1)), sh = [0.9, 0, -0.6];
    var P = INF.pts.slice(i0).map(function (p) { return [p[0] + sh[0], p[1] + sh[1], p[2] + sh[2]]; });
    var sst = function (e0, e1, x) { var u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };
    INF.meshes = [];
    backG.children.concat(lidG.children).forEach(function (m) {
      var rg = m.userData.region;
      if (!m.userData.tissue || (rg !== R.LV && rg !== R.IVS)) return;
      var pos = m.geometry.attributes.position, col = m.geometry.attributes.color, nv = pos.count, w = new Float32Array(nv), any = false;
      for (var v = 0; v < nv; v++) {
        var x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v), d2 = 1e9;
        for (var k = 0; k < P.length - 1; k++) {
          var ax = P[k][0], ay = P[k][1], az = P[k][2], bx = P[k + 1][0] - ax, by = P[k + 1][1] - ay, bz = P[k + 1][2] - az;
          var t = Math.min(1, Math.max(0, ((x - ax) * bx + (y - ay) * by + (z - az) * bz) / (bx * bx + by * by + bz * bz || 1)));
          var dx = x - ax - bx * t, dy = y - ay - by * t, dz = z - az - bz * t, dd = dx * dx + dy * dy + dz * dz;
          if (dd < d2) d2 = dd;
        }
        w[v] = 1 - sst(1.3, 2.9, Math.sqrt(d2)); if (w[v] > 0) any = true;
      }
      if (any) INF.meshes.push({ col: col, orig: new Float32Array(col.array), w: w });
    });
  }
  INF.a = a;
  INF.meshes.forEach(function (e) {
    var c = e.col.array, o = e.orig, w = e.w;
    if (a <= 0) c.set(o);
    else for (var v = 0, nv = w.length; v < nv; v++) {
      var k = MAXW * a * w[v];
      for (var j = 0; j < 3; j++) c[v * 3 + j] = o[v * 3 + j] + (ZIEL[j] - o[v * 3 + j]) * k;
    }
    e.col.needsUpdate = true;
  });
  /* Gef\u00e4\u00df: Vertexfarben (wei\u00df = unver\u00e4ndert) ab der Engstelle zu dunklem Graurot */
  var an = a > 0;
  INF.rohre.forEach(function (r) {
    var g = r.m.geometry, pos = g.attributes.position, nv = pos.count, rs = 7 + 1, segs = nv / rs - 1;
    /* aus: Ausgangszustand ohne Farbattribut, damit auch der Export wieder gleich ist */
    if (!an) { if (g.attributes.color) g.deleteAttribute('color'); if (r.m.material.vertexColors) { r.m.material.vertexColors = false; r.m.material.needsUpdate = true; } return; }
    if (!g.attributes.color) g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(nv * 3).fill(1), 3));
    var vc = g.attributes.color.array;
    for (var v2 = 0; v2 < nv; v2++) {
      var f2 = r.f0 + (r.f1 - r.f0) * Math.floor(v2 / rs) / segs, s2 = Math.min(1, Math.max(0, (f2 - ENG) / 0.05)); s2 = s2 * s2 * (3 - 2 * s2) * a;
      vc[v2 * 3] = 1 - 0.9 * s2; vc[v2 * 3 + 1] = 1 + 0.1 * s2; vc[v2 * 3 + 2] = 1 + 0.4 * s2;
    }
    g.attributes.color.needsUpdate = true;
    if (r.m.material.vertexColors !== an) { r.m.material.vertexColors = an; r.m.material.needsUpdate = true; }
  });
}
async function build() {
  var t0 = performance.now();
  var small = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
  var h = small ? 0.145 : 0.13;
  var G = HeartMesher.makeGrid([[-6.4, -6.6, -7.0], [6.6, 9.9, 3.7]], h);
  await setLoad(0.02, 'Herzmuskel wird geformt');
  var T = await HeartMesher.evalTissue(G, S.tissue, function (f) { return setLoad(0.02 + f * 0.5); });
  await setLoad(0.53, 'Schnittfl\u00e4che wird gelegt');
  var P = HeartMesher.pieceFields(G, T, S.cutF, S.keepSDF);
  var back = HeartMesher.surfaceNets(G, P.back), front = HeartMesher.surfaceNets(G, P.front);
  var smp = HeartAssemble.makeSampler(G, T);
  await setLoad(0.58, 'Herzh\u00f6hlen werden eingef\u00e4rbt');
  var outB = await HeartAssemble.buildPiece(back, 1, h, smp, function (f) { return setLoad(0.58 + f * 0.2); });
  await setLoad(0.78, 'Vorderwand wird gebaut');
  var outF = await HeartAssemble.buildPiece(front, -1, h, smp, function (f) { return setLoad(0.78 + f * 0.1); });
  var r;
  for (r in outB) { var mb = regionMesh(outB[r], +r, false); backG.add(mb); register(regionSid[r], mb, mb.material); var ol = outlineFor(mb); if (ol) { mb.add(ol); mb.userData.outline = ol; } }
  for (r in outF) { var mf = regionMesh(outF[r], +r, true); glassify(mf.material[0], 0.05, 0.5); glassify(mf.material[1], 0.17, 0.72); mf.material[2].userData.lidCut = true; lidG.add(mf); register(regionSid[r], mf, mf.material); }
  backG.children.concat(lidG.children).forEach(function (m) {
    var rg = m.userData.region;
    if (rg === R.LV || rg === R.RV || rg === R.LA || rg === R.RA) STRUCT.myo.mats.push(m.material[2]);
    if (rg === R.AO) (App.aoMats = App.aoMats || []).push.apply(App.aoMats, m.material);
    if (!m.userData.lid && (rg === R.AO || rg === R.PT || rg === R.SVC || rg === R.IVC || rg === R.PV)) { m.userData.vessel = true; (App.vesMats = App.vesMats || []).push.apply(App.vesMats, m.material); }
  });
  STRUCT.myo.has = true;
  await setLoad(0.9, 'Klappen und Sehnenf\u00e4den');
  var VA = HeartValves.build(); App.V = VA;
  /* Klappen in der Farbe ihrer Herzseite, heller als die Wand (wie im Lehrbuchbild) */
  var VCOL = { mitral: 0xE2B3A8, aortic: 0xD9A596, tricus: 0xB2BFDC, pulm: 0xBAC6E2 };
  [['mitral', 'mitral', 'mv'], ['tricus', 'tricus', 'tv'], ['aortic', 'aortic', 'av'], ['pulm', 'pulm', 'pv']].forEach(function (d) {
    var m = new THREE.Mesh(VA[d[0]].geo, mat(VCOL[d[0]], { rough: 0.45, coat: 0.3, side: THREE.DoubleSide, env: 0.3 }));
    m.name = 'Klappe_' + d[0];
    (d[0] === 'pulm' ? clipMatsPv : clipMats).push(m.material);
    addMorph(m, VA[d[0]].drivers.map(function (x) { return x === 'O' ? d[2] : x; }));
    backG.add(m); register(d[1], m, [m.material]);
  });
  [['chordM', 'mv'], ['chordT', 'tv']].forEach(function (d) {
    var m = new THREE.Mesh(VA[d[0]].geo, mat(d[0] === 'chordM' ? 0xEAD3CC : 0xD3DAEC, { rough: 0.55, env: 0.2 })); m.name = 'Sehnenfaeden_' + d[0]; clipMats.push(m.material);
    addMorph(m, VA[d[0]].drivers.map(function (x) { return x === 'O' ? d[1] : x; })); backG.add(m); register('chord', m, [m.material]);
  });
  await setLoad(0.94, 'Herzkranzgef\u00e4\u00dfe');
  App.corPts = { front: [], back: [] };
  HeartExtras.coronaries().forEach(function (c) {
    if (c.name === 'RIVA') INF.pts = c.pts;
    var runs = splitRuns(c.pts), done = 0, total = c.pts.length;
    runs.forEach(function (run) {
      var f0 = done / total, f1 = (done + run.pts.length) / total; done += run.pts.length - 1;
      var m = tubeMesh(run.pts, c.r0 + (c.r1 - c.r0) * f0, c.r0 + (c.r1 - c.r0) * f1, mat(0xB02A22, { rough: 0.45, coat: 0.4, env: 0.3 }), 7);
      m.name = 'Koronar_' + c.name + (run.front ? '_vorn' : '_hinten');
      if (!run.front) { clipMats.push(m.material); corBack.push(m); } else glassify(m.material);
      if (c.name === 'RIVA') INF.rohre.push({ m: m, f0: f0, f1: f1 });
      addMotionMorphs(m); (run.front ? lidG : backG).add(m); register('cor', m, [m.material]);
      Array.prototype.push.apply(run.front ? App.corPts.front : App.corPts.back, run.pts);
    });
  });
  await setLoad(0.96, 'Erregungsleitung');
  var con = HeartExtras.conduction(); App.con = con;
  var cm = condMat(); clipMatsErl.push(cm); cm.userData.erl = true; App.condMat = cm;
  var addCond = function (pts, a0, a1, rad) {
    if (!pts || pts.length < 2) return;
    var m = tubeMesh(pts, rad, rad * 0.8, cm, 6);
    var n = m.geometry.attributes.position.count, act = new Float32Array(n), ring = 7, segs = n / ring - 1;
    for (var i = 0; i < n; i++) act[i] = a0 + (a1 - a0) * (Math.floor(i / ring) / segs);
    m.geometry.setAttribute('act', new THREE.BufferAttribute(act, 1));
    m.name = 'Erregungsleitung'; addMotionMorphs(m); backG.add(m); register('erl', m, [cm]);
    App.erlCurves.push({ curve: new THREE.CatmullRomCurve3(pts.map(function (q) { return V(q[0], q[1], q[2]); })), a0: a0, a1: a1 });
  };
  App.erlCurves = [];
  /* Zeitpunkte als Anteil am Herzzyklus: Vorhoferregung, AV-Verz\u00f6gerung, Kammern */
  addCond(con.paths.internodal, 0.02, 0.075, 0.075);
  addCond(con.paths.internodal2, 0.02, 0.075, 0.065);
  addCond(con.paths.bach, 0.02, 0.06, 0.06);
  addCond(con.paths.his, 0.14, 0.16, 0.08);
  addCond(con.paths.lb, 0.16, 0.18, 0.07);
  addCond(con.paths.rb, 0.16, 0.182, 0.065);
  con.paths.pk.forEach(function (p) { addCond(p, 0.18, 0.205, 0.05); });
  /* Stationen der Erregungsleitung als Punkte */
  var hisEnd = con.paths.his[con.paths.his.length - 1];
  var lbMid = con.paths.lb[Math.floor(con.paths.lb.length * 0.45)], rbMid = con.paths.rb[Math.floor(con.paths.rb.length * 0.3)];
  var pkEnds = con.paths.pk.map(function (q) { return q[q.length - 1]; });
  App.stations = [
    { de: 'Sinusknoten', lat: 'Nodus sinuatrialis', p: con.sa },
    { de: 'AV-Knoten', lat: 'Nodus atrioventricularis', p: con.avn },
    { de: 'His-Bündel', lat: 'Fasciculus atrioventricularis', p: hisEnd },
    { de: 'Tawara-Schenkel', lat: 'Crus dextrum et sinistrum', p: lbMid },
    { de: 'Purkinje-Fasern', lat: 'Rami subendocardiales', p: pkEnds[0] || lbMid }
  ];
  [[con.sa, 0.02, 0.27], [con.avn, 0.075, 0.2], [hisEnd, 0.155, 0.17], [lbMid, 0.17, 0.14], [rbMid, 0.172, 0.13]].concat(pkEnds.map(function (q) { return [q, 0.2, 0.12]; })).forEach(function (d) {
    var g = new THREE.SphereGeometry(d[2], 16, 12); g.scale(1, 1.35, 0.8); g.translate(d[0][0], d[0][1], d[0][2]);
    g.setAttribute('act', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(d[1]), 1));
    var m = new THREE.Mesh(g, cm); m.name = 'Knoten'; addMotionMorphs(m, d[0]); backG.add(m); register('erl', m, [cm]);
  });
  await setLoad(0.98, 'Blutportionen');
  buildBlood();
  computeAnchors();
  buildSparks();
  await setLoad(1, 'Fertig');
  App.buildMs = Math.round(performance.now() - t0);
}

/* =====================================================================
   4. Blut in Portionen (Windkessel-Physik)
   ===================================================================== */
var WEGE = null, SLOTS = null, engine = null, blood = null;
var CAP_MOVE = 170, CAP_SLOT = 4 * 22, CAP_WK = 14;
var BLAU = srgb(0x2F6FB5), ROT = srgb(0xC8342F);
var wkSlots = [];
function buildBlood() {
  WEGE = HeartExtras.wkPaths();
  SLOTS = HeartExtras.chamberSlots();
  var def = {};
  Object.keys(WEGE).forEach(function (k) { var w = WEGE[k]; def[k] = { len: w.len, klappeBei: w.klappeBei, tempo: w.tempo, abstand: w.abstand, ziel: w.ziel, ein: w.ein, tor: w.tor, jet: w.jet, luEin: w.luEin, luTor: w.luTor }; });
  engine = App.engine = new HerzZyklus.Engine(def);
  /* Pl\u00e4tze im Windkessel: entlang der aufsteigenden Aorta, abwechselnd links und rechts */
  var w = WEGE.koerperOben, pt = { p: [0, 0, 0], m: new Array(15).fill(0), tan: [0, 0, 0] };
  for (var k = 0; k < CAP_WK; k++) {
    var dd = w.ein + ((Math.floor(k / 2) + 0.5) / (CAP_WK / 2)) * (w.tor - w.ein);
    HeartExtras.wkPoint(w, dd, pt);
    var t = V(pt.tan[0], pt.tan[1], pt.tan[2]).normalize(), side = V(0, 0, 1).cross(t).normalize();
    if (side.lengthSq() < 0.1) side.set(1, 0, 0);
    wkSlots.push({ p: pt.p.slice(), m: pt.m.slice(), s: side.multiplyScalar(k % 2 ? 1 : -1) });
  }
  var geo = new THREE.SphereGeometry(0.23, 14, 10);
  var m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  if (envTex) { m.envMap = envTex; m.envMapIntensity = 0.45; }
  m.emissive = new THREE.Color(0.06, 0.06, 0.08);
  blood = new THREE.InstancedMesh(geo, m, CAP_MOVE + CAP_SLOT + CAP_WK);
  blood.name = 'Blutportionen'; blood.frustumCulled = false; blood.userData.noexport = true;
  blood.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for (var i = 0; i < blood.count; i++) blood.setColorAt(i, ROT);
  blood.userData.col = new Uint8Array(blood.count);
  root.add(blood);
  App.pick.push(blood);
}
var _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s1 = V(1, 1, 1), _s0 = V(0, 0, 0), _p = V(0, 0, 0);
var WP = { p: [0, 0, 0], m: new Array(15).fill(0), tan: [0, 0, 0] };
function place(i, p, m, Wt, colR, extra) {
  var x = p[0] + m[0] * Wt.VR + m[3] * Wt.VL + m[6] * Wt.A + m[9] * Wt.Ao + m[12] * Wt.PT;
  var y = p[1] + m[1] * Wt.VR + m[4] * Wt.VL + m[7] * Wt.A + m[10] * Wt.Ao + m[13] * Wt.PT;
  var z = p[2] + m[2] * Wt.VR + m[5] * Wt.VL + m[8] * Wt.A + m[11] * Wt.Ao + m[14] * Wt.PT;
  if (extra) { x += extra.x; y += extra.y; z += extra.z; }
  _p.set(x, y, z); _m4.compose(_p, _q, _s1); blood.setMatrixAt(i, _m4);
  var c = colR ? 1 : 2;
  if (blood.userData.col[i] !== c) { blood.setColorAt(i, colR ? ROT : BLAU); blood.userData.col[i] = c; blood.instanceColor.needsUpdate = true; }
}
function hide(i) { _m4.compose(_p.set(0, -99, 0), _q, _s0); blood.setMatrixAt(i, _m4); }
var showB = true, showR = true;
function updateBlood(Wt) {
  if (!blood) return;
  var i = 0, n, k;
  var showB2 = showB && App.focus !== 'koerper', showR2 = showR && App.focus !== 'lunge';
  for (n = 0; n < engine.teilchen.length && i < CAP_MOVE; n++) {
    var t = engine.teilchen[n];
    HeartExtras.wkPoint(WEGE[t.weg], t.d, WP);
    var red = WP.col === 'r';
    if (!WP.vis || (red ? !showR2 : !showB2)) continue;
    place(i++, WP.p, WP.m, Wt, red);
  }
  for (; i < CAP_MOVE; i++) hide(i);
  var sp = engine.speicher;
  [['ra', false], ['rv', false], ['la', true], ['lv', true]].forEach(function (c) {
    var list = SLOTS[c[0]], cnt = Math.min(list.length, Math.round(sp[c[0]]));
    var ok = c[1] ? showR2 : showB2;
    for (k = 0; k < 22; k++, i++) { if (ok && k < cnt) place(i, list[k].p, list[k].m, Wt, c[1]); else hide(i); }
  });
  var wk = engine.S.windkessel ? Math.min(CAP_WK, engine.imWK) : 0, push = 0.42 + 0.3 * engine.dehnung;
  for (k = 0; k < CAP_WK; k++, i++) {
    if (showR2 && k < wk) { var s = wkSlots[k]; place(i, s.p, s.m, Wt, true, { x: s.s.x * push, y: s.s.y * push, z: s.s.z * push - 0.15 }); } else hide(i);
  }
  blood.instanceMatrix.needsUpdate = true;
}

/* Momentaufnahme aller sichtbaren Portionen (für den animierten Export) */
function portionsNow(Wt) {
  var out = [], k;
  var pos = function (p, m, ex) {
    return [p[0] + m[0] * Wt.VR + m[3] * Wt.VL + m[6] * Wt.A + m[9] * Wt.Ao + m[12] * Wt.PT + (ex ? ex.x : 0),
            p[1] + m[1] * Wt.VR + m[4] * Wt.VL + m[7] * Wt.A + m[10] * Wt.Ao + m[13] * Wt.PT + (ex ? ex.y : 0),
            p[2] + m[2] * Wt.VR + m[5] * Wt.VL + m[8] * Wt.A + m[11] * Wt.Ao + m[14] * Wt.PT + (ex ? ex.z : 0)];
  };
  engine.teilchen.forEach(function (t) {
    HeartExtras.wkPoint(WEGE[t.weg], t.d, WP);
    if (!WP.vis) return;
    var red = WP.col === 'r'; if (red ? !showR : !showB) return;
    out.push({ key: 't' + t.id + (red ? 'r' : 'b'), red: red, p: pos(WP.p, WP.m) });
  });
  [['ra', false], ['rv', false], ['la', true], ['lv', true]].forEach(function (c) {
    var list = SLOTS[c[0]], cnt = Math.min(list.length, Math.round(engine.speicher[c[0]]));
    if (c[1] ? !showR : !showB) return;
    for (k = 0; k < cnt; k++) out.push({ key: c[0] + k, red: c[1], p: pos(list[k].p, list[k].m) });
  });
  if (engine.S.windkessel && showR) {
    var wk = Math.min(CAP_WK, engine.imWK), push = 0.42 + 0.3 * engine.dehnung;
    for (k = 0; k < wk; k++) { var s = wkSlots[k]; out.push({ key: 'wk' + k, red: true, p: pos(s.p, s.m, { x: s.s.x * push, y: s.s.y * push, z: s.s.z * push - 0.15 }) }); }
  }
  return out;
}
App.portionsNow = function (Wt) { return portionsNow(Wt); };

/* Elektrischer Impuls: leuchtende Funken auf der Leitungsbahn, synchron zum EKG-Punkt */
var SPARKS = [];
function buildSparks() {
  var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d');
  var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,236,150,0.95)'); g.addColorStop(0.55, 'rgba(255,190,60,0.45)'); g.addColorStop(1, 'rgba(255,170,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  var tex = new THREE.CanvasTexture(c);
  for (var i = 0; i < 18; i++) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.renderOrder = 1000; sp.visible = false; root.add(sp); SPARKS.push(sp);
  }
}
var _sv = new THREE.Vector3();
function placeSpark(sp, p, sc, W) {
  var m = HeartAssemble.motionSimple(p.x, p.y, p.z);
  sp.position.set(p.x + m[0] * W.VR + m[3] * W.VL + m[6] * W.A, p.y + m[1] * W.VR + m[4] * W.VL + m[7] * W.A, p.z + m[2] * W.VR + m[5] * W.VL + m[8] * W.A);
  sp.scale.set(sc, sc, 1); sp.visible = true;
}
function updateSparks(pos, W, now) {
  var k = 0;
  var fl = engine ? engine.flimmern() : 0, tz = engine ? engine.flimT : 0;
  if (App.impulse && STRUCT.erl.on && App.erlCurves) {
    if (fl > 0.5) {   /* Vorhofflimmern: statt geordneter Welle unruhige Funken in den Vorh\u00f6fen */
      App.erlCurves.forEach(function (c, ci) {
        if (c.a1 > 0.08) return;
        for (var j = 0; j < 3 && k < SPARKS.length; j++) {
          var f = 0.5 + 0.5 * Math.sin(tz * (9 + 5 * j + ci) + 2.4 * j + ci * 1.9) * Math.cos(tz * (6.3 + 2 * j) + ci);
          placeSpark(SPARKS[k++], c.curve.getPointAt(f), 0.8 + 0.5 * Math.abs(Math.sin(tz * (17 + 7 * j) + ci)), W);
        }
      });
    }
    else if (pos < 0.04) { _sv.set(App.con.sa[0], App.con.sa[1], App.con.sa[2]); placeSpark(SPARKS[k++], _sv, 1.5 + 0.4 * Math.sin(now / 60), W); }
    App.erlCurves.forEach(function (c) {
      if (fl > 0.5 && c.a1 <= 0.08) return;
      var f = (pos - c.a0) / (c.a1 - c.a0);
      if (f >= 0 && f <= 1 && k < SPARKS.length) placeSpark(SPARKS[k++], c.curve.getPointAt(f), 1.15, W);
    });
    if (pos > 0.072 && pos < 0.142 && k < SPARKS.length) { _sv.set(App.con.avn[0], App.con.avn[1], App.con.avn[2]); placeSpark(SPARKS[k++], _sv, 1.0 + 0.35 * Math.sin(now / 45), W); }
  }
  for (; k < SPARKS.length; k++) SPARKS[k].visible = false;
}
var ERR_TXT = [
  [0.00, 0.075, 'Sinusknoten feuert, die Erregung läuft über die Vorhöfe (P-Welle)'],
  [0.075, 0.14, 'AV-Knoten bremst die Erregung (PQ-Strecke)'],
  [0.14, 0.16, 'His-Bündel leitet in die Scheidewand'],
  [0.16, 0.18, 'Tawara-Schenkel links und rechts der Scheidewand'],
  [0.18, 0.22, 'Purkinje-Fasern erregen die Kammern (QRS-Komplex)'],
  [0.22, 0.37, 'Kammern sind erregt und ziehen sich zusammen (ST-Strecke)'],
  [0.37, 0.47, 'Kammern erholen sich (T-Welle)'],
  [0.47, 1.01, 'Ruhe – das Herz wartet auf den nächsten Impuls']
];
var lastErr = '';
function updateErr(pos) {
  if (!App.impulse) return;
  var t = ERR_TXT.filter(function (e) { return pos >= e[0] && pos < e[1]; })[0];
  var txt = t ? t[2] : '';
  if (t && t === ERR_TXT[0] && engine && engine.flimmern() > 0.5) txt = 'Die Vorh\u00f6fe flimmern: ungeordnete Erregung, keine P-Welle';
  if (txt !== lastErr) { lastErr = txt; $('kErr').textContent = txt; $('kErrN').textContent = txt; }
}
function setErlOverlay(on) {
  var cm = App.condMat; if (!cm) return;
  cm.depthTest = !on;
  cm.clippingPlanes = on ? null : (clipOn ? [CLIP_ERL] : null);
  cm.needsUpdate = true;
  backG.traverse(function (m) { if (m.userData.sid === 'erl') m.renderOrder = on ? 900 : 0; });
}

/* =====================================================================
   Lupe – Nahansicht (wie im Nephron-Modell)
   ===================================================================== */
var LUPE = { mode: false, open: false, scene: null, point: null, ring: null, line: null };
var LUPE_V = {
  mitral: { key: 'mv', av: false, rot: true, oben: 'linker Vorhof', unten: 'linke Kammer', name: 'Mitralklappe' },
  tricus: { key: 'tv', av: false, rot: false, oben: 'rechter Vorhof', unten: 'rechte Kammer', name: 'Trikuspidalklappe' },
  aortic: { key: 'av', av: true, rot: true, oben: 'Aorta', unten: 'linke Kammer', name: 'Aortenklappe' },
  pulm: { key: 'pv', av: true, rot: false, oben: 'Lungenarterie', unten: 'rechte Kammer', name: 'Pulmonalklappe' }
};
function klappenDruck(v) {
  var vk = function (S) { return v.rot ? S.K.lk : S.K.rk; };
  if (!v.av) { v.pOben = function (S) { return 0.22 + 0.25 * S.K.vorhof; }; v.pUnten = function (S) { return 0.08 + 0.9 * vk(S); }; }
  else { v.pUnten = function (S) { return 0.08 + 0.9 * vk(S); }; v.pOben = function (S) { return v.rot ? 0.36 + 0.3 * S.dehnung : 0.3 + 0.12 * S.K.rk; }; }
  return v;
}
var LUPE_T = {
  muskel: { t: 'Herzmuskelzelle \u2013 Kontraktion', leg: [['#F2C94C', 'Calcium'], ['#D79A8E', 'Aktin'], ['#E47A8C', 'Myosin']],
    p: [['Es passiert:', 'Die Erregung öffnet Calciumkanäle. Calcium (gelb) strömt in die Zelle.'],
        ['Dann:', 'Die Myosinköpfchen greifen nach den Aktinfäden und ziehen sie zur Mitte. Jedes Sarkomer wird kürzer \u2013 die ganze Zelle verkürzt sich.'],
        ['Danach:', 'Das Calcium wird zurückgepumpt, der Muskel erschlafft und das Herz kann sich wieder füllen.']],
    note: 'Für die Pflege: Ohne Sauerstoff fehlt dafür die Energie. Beim Herzinfarkt hört der Muskel im betroffenen Gebiet auf zu arbeiten.' },
  klappe: { t: '', leg: [['#D4473F', 'Blut'], ['#E0A94A', 'Druck']],
    p: [['Es passiert:', 'Die Klappe ist ein Ventil: Sie öffnet nur, wenn der Druck davor höher ist als dahinter.'],
        ['Dann:', ''], ['Darum:', 'Das Blut kann nur in eine Richtung fließen \u2013 nie zurück.']],
    note: 'Für die Pflege: Schließt eine Klappe nicht dicht, fließt Blut zurück. Das hört man als Herzgeräusch.' },
  aorta: { t: 'Aortenwand \u2013 der Windkessel', leg: [['#D4473F', 'Blut'], ['#E8C9A8', 'elastische Fasern']],
    p: [['Es passiert:', 'Beim Auswurf strömt mehr Blut in die Aorta, als weiterfließen kann. Die elastischen Fasern der Wand werden gedehnt.'],
        ['Dann:', 'In der Pause ziehen sich die Fasern zusammen und schieben das gespeicherte Blut weiter.'],
        ['Darum:', 'Das Blut fließt im Körper gleichmäßig weiter, auch zwischen zwei Herzschlägen.']],
    note: 'Für die Pflege: Mit dem Alter verlieren die Fasern ihre Elastizität \u2013 der obere Blutdruckwert steigt. Probiere oben „starr“.' },
  erregung: { t: 'Zellwand \u2013 Strom im Herzmuskel', leg: [['#5AA9FF', 'Natrium'], ['#F2C94C', 'Calcium'], ['#5BD38A', 'Kalium']],
    p: [['Es passiert:', 'Natrium (blau) strömt blitzschnell in die Zelle \u2013 die Spannung kippt ins Positive. Im EKG ist das der QRS-Komplex.'],
        ['Dann:', 'Calcium (gelb) strömt langsam nach \u2013 das Plateau. So lange zieht sich der Muskel zusammen und ist nicht neu erregbar.'],
        ['Danach:', 'Kalium (grün) strömt hinaus, die Spannung kehrt zurück. Im EKG ist das die T-Welle.']],
    note: 'Für die Pflege: Zu viel oder zu wenig Kalium stört genau diese Vorgänge \u2013 es drohen Herzrhythmusstörungen. Kaliumwerte immer im Blick behalten.' },
  sinus: { t: 'Sinusknoten \u2013 der Taktgeber', leg: [['#F2C94C', 'Calcium'], ['#5BD38A', 'Kalium']],
    p: [['Es passiert:', 'Die Zellen des Sinusknotens haben keine feste Ruhespannung: Die Spannung steigt ganz von allein langsam an.'],
        ['Dann:', 'Erreicht sie die Schwelle, feuert die Zelle \u2013 Calcium strömt ein. Diese Erregung läuft über das ganze Herz (P-Welle).'],
        ['Danach:', 'Kalium bringt die Spannung zurück, und der langsame Anstieg beginnt von vorn. So entsteht der Takt.']],
    note: 'Für die Pflege: Fällt der Sinusknoten aus, übernehmen langsamere Zentren wie der AV-Knoten \u2013 der Puls wird langsam (Bradykardie).' },
  koronar: { t: 'Herzkranzgefäß \u2013 Versorgung des Herzmuskels', leg: [['#D4473F', 'Blut']],
    p: [['Es passiert:', 'Die Kranzgefäße laufen in die Herzwand hinein und bringen dem Muskel Sauerstoff.'],
        ['Dann:', 'In der Systole drückt der angespannte Muskel die kleinen Gefäße zusammen \u2013 kaum Durchfluss. In der Diastole sind sie offen, das Blut fließt.'],
        ['Darum:', 'Das Herz versorgt sich selbst vor allem in der Diastole.']],
    note: 'Für die Pflege: Bei schnellem Puls wird die Diastole kurz \u2013 der Herzmuskel bekommt weniger Blut. Darum treten Angina-pectoris-Beschwerden oft unter Belastung auf.' },
  lunge: { t: 'Lungenbläschen \u2013 Gasaustausch', leg: [['#F4F7F8', 'Sauerstoff'], ['#7E8C94', 'Kohlendioxid']],
    p: [['Es passiert:', 'Im Lungenbläschen ist viel Sauerstoff, im ankommenden Blut wenig. Sauerstoff (weiß) wandert ins Blut.'],
        ['Dann:', 'Kohlendioxid (grau) wandert aus dem Blut ins Lungenbläschen und wird ausgeatmet.'],
        ['Darum:', 'Aus blauem wird rotes Blut \u2013 es fließt über die Lungenvenen zum linken Herzen.']],
    note: 'Für die Pflege: Ist die Wand verdickt oder mit Wasser gefüllt (Lungenödem), dauert der Austausch länger \u2013 die Sauerstoffsättigung sinkt.' },
  koerper: { t: 'Kapillare im Körper \u2013 Versorgung der Zellen', leg: [['#F4F7F8', 'Sauerstoff'], ['#7E8C94', 'Kohlendioxid']],
    p: [['Es passiert:', 'Im Blut ist viel Sauerstoff, in den Zellen wenig. Sauerstoff (weiß) wandert in die Zellen.'],
        ['Dann:', 'Die Zellen geben Kohlendioxid (grau) ab, es wandert ins Blut.'],
        ['Darum:', 'Aus rotem wird blaues Blut \u2013 es fließt über die Hohlvenen zurück zum rechten Herzen.']],
    note: 'Für die Pflege: Bei schlechter Durchblutung bekommen die Zellen zu wenig Sauerstoff \u2013 die Haut wird blass oder bläulich, Wunden heilen schlecht.' }
};
function lupeOpen(scene, variant, point) {
  var v = variant || {};
  if (scene === 'klappe') v = klappenDruck(Object.assign({}, v.key ? v : LUPE_V.mitral));
  HerzLupe.set(scene, v);
  LUPE.scene = scene; LUPE.open = true; LUPE.v = v;
  var key = scene === 'erregung' && v.sinus ? 'sinus' : scene, T = LUPE_T[key];
  $('lpTitle').textContent = scene === 'klappe' ? v.name + ' \u2013 ' + (v.av ? 'Taschenklappe' : 'Segelklappe') : T.t;
  var html = '';
  T.p.forEach(function (r) {
    var txt = r[1];
    if (scene === 'klappe' && r[0] === 'Dann:') txt = v.av ? 'Fällt der Druck in der Kammer unter den Druck in der ' + v.oben + ', füllen sich die Taschen und schließen dicht \u2013 der 2. Herzton.' : 'Steigt der Druck in der Kammer über den im Vorhof, schlagen die Segel zu \u2013 der 1. Herzton. Die Sehnenfäden halten sie, damit sie nicht durchschlagen.';
    html += '<p><b>' + r[0] + '</b> ' + txt + '</p>';
  });
  html += '<p class="lp-note">' + T.note + '</p>';
  $('lpText').innerHTML = html;
  $('lpLeg').innerHTML = T.leg.map(function (l) { return '<span><i style="background:' + l[0] + '"></i>' + l[1] + '</span>'; }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('#lpChips button'), function (b) { b.classList.toggle('on', b.getAttribute('data-sc') === scene); });
  if (point) LUPE.point = point; else LUPE.point = lupePoint(scene, v);
  closeCard(); $('info').classList.remove('show');
  $('lupe').classList.add('show'); document.body.classList.add('card'); szWeichen();
  LABELS.forEach(function (a) { a.key = ''; });
}
function lupePoint(scene, v) {
  var A = S.A, cut = function (x, y) { return S.cutF(x, y) + 0.05; };
  if (scene === 'muskel') return V(4.55, -2.2, cut(4.55, -2.2));
  if (scene === 'klappe') { var a = STRUCT[{ mv: 'mitral', tv: 'tricus', av: 'aortic', pv: 'pulm' }[v.key]].aOpen; return a ? V(a[0], a[1], a[2]) : null; }
  if (scene === 'aorta') { var b = STRUCT.aorta.aOpen; return V(b[0], b[1], b[2]); }
  if (scene === 'erregung') { var c = v.sinus ? App.con.sa : App.stations[3].p; return V(c[0], c[1], c[2]); }
  if (scene === 'koronar') { var d = STRUCT.cor.aClosed; return d ? V(d[0], d[1], d[2]) : null; }
  if (scene === 'lunge') { var e = STRUCT.pt.aOpen; return V(e[0], e[1], e[2]); }
  return null;
}
function lupeClose() {
  LUPE.open = false; LUPE.mode = false; $('lupe').classList.remove('show'); onOff('bLupe', false);
  if (LUPE.ring) LUPE.ring.visible = false; if (LUPE.line) LUPE.line.style.display = 'none';
  canvas.style.cursor = '';
  kartenLage();
}
function lupeFromStruct(sid, point) {
  if (!sid) return;
  if (['lv', 'rv', 'ivs', 'myo', 'pap'].indexOf(sid) >= 0) return lupeOpen('muskel', {}, point);
  if (sid === 'la' || sid === 'ra') return lupeOpen('muskel', { atrium: true }, point);
  if (LUPE_V[sid]) return lupeOpen('klappe', LUPE_V[sid], point);
  if (sid === 'chord') return lupeOpen('klappe', LUPE_V.mitral, point);
  if (sid === 'aorta') return lupeOpen('aorta', {}, point);
  if (sid === 'erl') { var near = point && App.con && point.distanceTo(V(App.con.sa[0], App.con.sa[1], App.con.sa[2])) < 1.5; return lupeOpen('erregung', { sinus: near }, point); }
  if (sid === 'cor') return lupeOpen('koronar', {}, point);
  if (sid === 'pt' || sid === 'pv' || sid === 'blutR' || sid === 'lunge') return lupeOpen('lunge', {}, point);
  if (sid === 'svc' || sid === 'ivc' || sid === 'blutB' || sid === 'koerper' || sid === 'lig') return lupeOpen('koerper', {}, point);
  if (sid === 'ias') return lupeOpen('muskel', { atrium: true }, point);
}
function buildLupe() {
  HerzLupe.setCanvas($('lpCv'));
  var chips = $('lpChips');
  [['muskel', 'Herzmuskel'], ['klappe', 'Klappe'], ['aorta', 'Windkessel'], ['erregung', 'Erregung'], ['koronar', 'Kranzgefäß'], ['lunge', 'Lunge'], ['koerper', 'Körper']].forEach(function (c) {
    var b = document.createElement('button'); b.className = 'gh'; b.textContent = c[1]; b.setAttribute('data-sc', c[0]);
    b.addEventListener('click', function () { lupeOpen(c[0], c[0] === 'klappe' ? LUPE_V.mitral : {}, null); });
    chips.appendChild(b);
  });
  $('bLupeX').onclick = lupeClose;
  LUPE.ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 48), new THREE.MeshBasicMaterial({ color: 0xE0A94A, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide }));
  LUPE.ring.renderOrder = 1001; LUPE.ring.visible = false; LUPE.ring.raycast = function () {};
  scene.add(LUPE.ring);
  LUPE.line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); LUPE.line.setAttribute('class', 'lp-line'); LUPE.line.style.display = 'none';
  leaderSvg.appendChild(LUPE.line);
  $('bLupe').onclick = function () {
    if (LUPE.mode || LUPE.open) { lupeClose(); return; }
    LUPE.mode = true; onOff('bLupe', true); canvas.style.cursor = 'zoom-in';
    toast('Lupe: Tippe auf eine Stelle des Herzens \u2013 oder w\u00e4hle im Lupenfenster eine Nahansicht.');
    lupeOpen('muskel', {}, null);
  };
}
var _lpV = new THREE.Vector3();
function lupeTick(dt, Wt) {
  if (!LUPE.open) return;
  HerzLupe.draw({ K: engine.K, W: Wt, pos: Wt.pos, dehnung: engine.dehnung, windkessel: engine.S.windkessel }, Math.min(dt, 0.05));
  var show = !!LUPE.point && !App.schema;
  LUPE.ring.visible = show;
  if (!show) { LUPE.line.style.display = 'none'; return; }
  LUPE.ring.position.copy(LUPE.point); LUPE.ring.quaternion.copy(camera.quaternion);
  LUPE.ring.scale.setScalar(Math.max(0.6, view.dist / 18));
  _lpV.copy(LUPE.point).project(camera);
  var w = window.innerWidth, h = window.innerHeight, x = (_lpV.x * 0.5 + 0.5) * w, y = (-_lpV.y * 0.5 + 0.5) * h;
  var r = $('lupe').getBoundingClientRect();
  LUPE.line.setAttribute('x1', x.toFixed(1)); LUPE.line.setAttribute('y1', y.toFixed(1));
  LUPE.line.setAttribute('x2', (r.left < x ? r.left : r.left).toFixed(1)); LUPE.line.setAttribute('y2', Math.min(r.bottom - 20, Math.max(r.top + 20, y)).toFixed(1));
  LUPE.line.style.display = w >= 1000 ? '' : 'none';
}

/* =====================================================================
   AR – ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore)
   oder AR Quick Look (iPhone/iPad, Safari) mit selbst erzeugter USDZ-Datei
   ===================================================================== */
App.ar = false;
var AR = Kern.AR.xr({
  renderer: renderer, scene: scene, camera: camera, root: root,
  stufen: [0.01, 0.015, 0.02, 0.03, 0.045, 0.06], skala: 0.02,
  fuss: 6.9,                                        /* Herzspitze steht auf der Fläche */
  hintergrund: 0x0b171c,
  ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
  knoepfe: ['arEnd', 'arOpen', 'arLab', 'arSmall', 'arBig', 'arPlace', 'arPause'],
  quickLook: function () { arQuickLook(); },
  beimStart: function () {
    App.ar = true;
    $('arOpen').textContent = App.opened ? 'Geschlossen' : 'Geöffnet';
    $('arLab').textContent = App.labels ? 'Beschriftung aus' : 'Beschriftung an';
  },
  beimEnde: function () {
    App.ar = false;
    ARL.ausblenden();
    resize();
  }
});
function arUIbind() {
  $('arOpen').onclick = function () { App.opened = !App.opened; onOff('bOpen', App.opened); onOff('bClosed', !App.opened); this.textContent = App.opened ? 'Geschlossen' : 'Geöffnet'; };
  $('arLab').onclick = function () { App.labels = !App.labels; onOff('bLab', App.labels); this.textContent = App.labels ? 'Beschriftung aus' : 'Beschriftung an'; };
  $('arPause').onclick = function () { engine.S.laufen = !engine.S.laufen; this.textContent = engine.S.laufen ? 'Pause' : 'Weiter'; onOff('bPlay', engine.S.laufen); $('bPlay').textContent = engine.S.laufen ? 'Pause' : 'Abspielen'; };
}
/* ---- Beschriftung im AR: Schilder mit Führungslinien (Kern.AR.schilder) ---- */
var ARL = Kern.AR.schilder({
  root: root, renderer: renderer, camera: camera, xr: AR,
  name: 'Herz', anzahl: function () { return LABELS.length; },
  masse: { spalte: 7.4, hoehe: 1.15, abstand: 1.4, z: 3.2, oben: 8.8, unten: -7.2, px: 128 },
  liste: function () { return arlWanted(); },
  auswahl: function () { return App.sel; }
});
/* dieselben Regeln wie bei der Bildschirm-Beschriftung, nur ohne Bildschirmplatz */
function arlWanted() {
  var out = [];
  if (!App.labels || App.quiz) return out;
  LABELS.forEach(function (a) {
    var s = a.s, p = App.openK > 0.5 ? s.aOpen : s.aClosed, show = !!(p && s.on);
    if (s.station) show = App.impulse && STRUCT.erl.on;
    else if (App.impulse) show = false;
    else if (show && App.focus && FOCUS[App.focus].indexOf(s.id) < 0) show = false;
    if (show && s.minor && s.id !== App.sel) show = false;
    if (show && s.id === 'myo' && App.openK < 0.5) show = false;
    if (show && vesFade < 0.1 && App.openK > 0.5 && ['aorta', 'pt', 'svc', 'ivc', 'pv', 'lig'].indexOf(s.id) >= 0) show = false;
    if (show) out.push({ a: a, p: p });
  });
  return out;
}
/* ---- USDZ für AR Quick Look: Momentaufnahme der aktuellen Ansicht ---- */
function usdzBuild() {
  return Kern.AR.usdz({
    name: 'Herz', creator: 'Herz 3D - ' + WATERMARK, datei: 'herz.usda', skala: 0.01,
    gruppen: App.openK > 0.5 ? [backG] : [backG, lidG],
    beschriftung: function (f4) {
      var v = new THREE.Vector3();
      root.updateWorldMatrix(true, false);
      return ARL.usd(f4, function (x, y, z) { v.set(x, y, z).applyMatrix4(root.matrixWorld); return [v.x * 0.01, v.y * 0.01, v.z * 0.01]; });
    }
  });
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: $('arQL'), fertig: 'Das Herz öffnet sich in AR Quick Look. Mit zwei Fingern lässt es sich vergrößern und drehen.' });
}
App.usdzBuild = usdzBuild;

/* =====================================================================
   Schema – Kreislaufbild mit derselben Physik
   ===================================================================== */
App.schema = false;
function schemaPick(info) {
  if (LUPE.mode || LUPE.open) {
    var mp = { ra: 'ra', la: 'la', rv: 'rv', lv: 'lv', pt: 'lunge', pv: 'lunge', aorta: 'aorta', svc: 'koerper', lunge: 'lunge', koerper: 'koerper', mitral: 'mitral', tricus: 'tricus', aortic: 'aortic', pulm: 'pulm' };
    lupeFromStruct(mp[info] || info, null); return;
  }
  if (info === 'lunge' || info === 'koerper') { openHelp('kreislaeufe'); return; }
  if (STRUCT[info]) setSelected(info);
}
function setSchema(on) {
  App.schema = on; onOff('bSchema', on);
  if (on) HerzSchema.build($('schemaBox'), schemaPick);
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  canvas.style.visibility = on ? 'hidden' : '';
}

/* =====================================================================
   5. Beschriftung (Spalten mit F\u00fchrungslinien, wie im Nephron-Modell)
   ===================================================================== */
var labelBox = $('labels'), leaderSvg = $('leaders'), LABELS = [];
function computeAnchors() {
  var A = S.A, cut = function (x, y) { return S.cutF(x, y) + 0.06; };
  function frontZ(x, y) { for (var z = 6; z > -7; z -= 0.04) if (S.tissue(x, y, z) < 0) return z + 0.05; return 0; }
  function fix(a) {
    if (!a) return null;
    if (Array.isArray(a)) return a[2] === 'cut' ? [a[0], a[1], cut(a[0], a[1])] : (a[2] === 'front' ? [a[0], a[1], frontZ(a[0], a[1])] : a);
    switch (a) {
      case 'septum': {
        /* Mitte der Kammerscheidewand auf der Schnittfläche suchen */
        var y = -2.3, x0 = null, x1 = null, CC = {};
        for (var x = -2; x < 4; x += 0.02) { var z = cut(x, y); S.tissue(x, y, z, CC); if (x0 === null && CC.dRVc > 0.05 && x > -1.5 && CC.dLVc > 0) x0 = x; if (x0 !== null && CC.dLVc < 0) { x1 = x; break; } }
        var xm = (x0 !== null && x1 !== null) ? (x0 + x1) / 2 : 0.95;
        return [xm, y, cut(xm, y)];
      }
      case 'chord': { var sg = App.V.chordM.segs[3]; return S.lerp3(sg.a, sg.bO, 0.5); }
      case 'mitral': return S.ad(A.Mv, S.ml(A.nMv, -0.55));
      case 'tricus': return S.ad(A.Tv, S.ml(A.nTv, -0.55));
      case 'aortic': return S.ad(A.Av, S.ml(A.nAv, 0.55));
      case 'pulm': return S.ad(A.Pv, S.ml(A.nPv, 0.55));
      case 'corFront': { var f = App.corPts.front; return f.length ? f.reduce(function (b, p) { return p[2] > b[2] ? p : b; }, f[0]) : null; }
      case 'corBack': { var g = App.corPts.back; return g.length ? g.reduce(function (b, p) { return p[2] - Math.abs(p[1]) * 0.1 > b[2] - Math.abs(b[1]) * 0.1 ? p : b; }, g[0]) : null; }
      case 'sa': return App.con.sa;
    }
    return null;
  }
  ORDER.forEach(function (s) {
    s.aOpen = fix(s.open); s.aClosed = fix(s.closed);
    if (!s.has || (!s.aOpen && !s.aClosed)) return;
    var b = Kern.beschriftung(labelBox, leaderSvg, s.de, s.lat), el = b.el, ln = b.ln, dot = b.dot;
    el.addEventListener('click', function () { if (!App.quiz) setSelected(s.id); });
    LABELS.push({ s: s, el: el, ln: ln, dot: dot, key: '' });
  });
}
function addStationLabels() {
  (App.stations || []).forEach(function (st) {
    var b = Kern.beschriftung(labelBox, leaderSvg, st.de, st.lat), el = b.el, ln = b.ln, dot = b.dot;
    el.className = 'lbl erl';
    el.addEventListener('click', function () { if (!App.quiz) setSelected('erl'); });
    LABELS.push({ s: { id: 'erl', de: st.de, lat: st.lat, aOpen: st.p, aClosed: st.p, on: true, station: true }, el: el, ln: ln, dot: dot, key: '' });
  });
}
var pv = new THREE.Vector3(), fitDist = 34.5;
var NARROW = ['lv', 'rv', 'la', 'ra', 'aorta', 'pt', 'mitral', 'tricus', 'aortic', 'pulm'];
var BOX = [[-5.9, -6.3, -5.3], [6.0, 8.3, 3.0]];
function heartScreenBox(w, h) {
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (var i = 0; i < 8; i++) {
    pv.set(BOX[i & 1][0], BOX[(i >> 1) & 1][1], BOX[(i >> 2) & 1][2]).project(camera);
    var sx = (pv.x * 0.5 + 0.5) * w, sy = (-pv.y * 0.5 + 0.5) * h;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  /* die Ecken der Box liegen weit au\u00dfen - etwas einr\u00fccken */
  var cx = (x0 + x1) / 2, hw = (x1 - x0) / 2 * 0.82;
  return { x0: cx - hw, x1: cx + hw, y0: y0, y1: y1 };
}
function cardOpen() { return $('scard').classList.contains('show') || $('info').classList.contains('show') || $('lupe').classList.contains('show') || !!(SZ.aktiv && SZ.offen); }
function layoutLabels(w, h) {
  var narrow = w < 1000, dist = view.dist, hb = heartScreenBox(w, h);
  var zykTop = narrow ? 0 : $('zyk').getBoundingClientRect().top;
  var rightLim = w - 22 - (cardOpen() && !narrow ? 342 : 0);
  var colL = narrow ? 14 : clamp(hb.x0 - 18, 282 + 150, rightLim - 300);
  var colR = narrow ? w - 14 : clamp(hb.x1 + 18, colL + 120, rightLim - 190);
  var topL = narrow ? 180 : 112, topR = narrow ? 180 : 216;
  var botL = narrow ? h * 0.66 - 150 : zykTop - 16, botR = narrow ? h * 0.66 - 150 : h - 84;
  var items = [];
  LABELS.forEach(function (a) {
    var s = a.s, p = App.openK > 0.5 ? s.aOpen : s.aClosed;
    var show = App.labels && !App.quiz && p && s.on;
    if (s.station) show = App.labels && !App.quiz && App.impulse && STRUCT.erl.on;
    else if (App.impulse) show = false;
    else if (show && App.focus && FOCUS[App.focus].indexOf(s.id) < 0) show = false;
    if (show && s.minor && s.id !== App.sel && dist > (narrow ? fitDist * 0.55 : 24)) show = false;
    if (show && !s.station && narrow && NARROW.indexOf(s.id) < 0 && s.id !== App.sel && dist > fitDist * 0.7) show = false;
    if (show && s.id === 'myo' && App.openK < 0.5) show = false;
    if (show && vesFade < 0.1 && App.openK > 0.5 && ['aorta', 'pt', 'svc', 'ivc', 'pv', 'lig'].indexOf(s.id) >= 0) show = false;
    if (show) { pv.set(p[0], p[1], p[2]).project(camera); if (pv.z > 1 || Math.abs(pv.x) > 1.3 || Math.abs(pv.y) > 1.3) show = false; }
    if (!show) { if (a.key !== 'h') { a.el.style.display = 'none'; a.ln.style.display = 'none'; a.dot.style.display = 'none'; a.key = 'h'; } return; }
    items.push({ a: a, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
  });
  var mid = (colL + colR) / 2;
  items.forEach(function (it) { it.side = it.sx < mid ? 'l' : 'r'; });
  ['l', 'r'].forEach(function (side) {
    var g = items.filter(function (it) { return it.side === side; }).sort(function (p, q) { return p.sy - q.sy; });
    var lim = side === 'l' ? botL : botR, top = side === 'l' ? topL : topR, gap = narrow ? 30 : 34, y = top;
    if (g.length > 1 && (g.length - 1) * gap > lim - top) gap = Math.max(22, (lim - top) / (g.length - 1));
    g.forEach(function (it) { it.ly = Math.max(y, Math.min(lim, it.sy)); y = it.ly + gap; });
    var over = y - gap - lim;
    if (over > 0) g.forEach(function (it) { it.ly = Math.max(top, it.ly - over); });
  });
  items.forEach(function (it) {
    var a = it.a, lx = it.side === 'l' ? colL : colR;
    var cls = 'lbl ' + it.side + (a.s.station ? ' erl' : '') + ((App.sel && a.s.id !== App.sel) ? ' dim' : '');
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    if (narrow) {
      if (!a.w) { a.el.style.display = ''; a.w = a.el.offsetWidth; }
      lx = it.side === 'l' ? 10 + a.w : w - 10 - a.w; ex = it.side === 'l' ? lx + 5 : lx - 5;
    }
    var pts = it.sx.toFixed(1) + ',' + it.sy.toFixed(1) + ' ' + (ex + (it.side === 'l' ? 16 : -16)).toFixed(1) + ',' + it.ly.toFixed(1) + ' ' + ex.toFixed(1) + ',' + it.ly.toFixed(1);
    var k = cls + pts + lx;
    if (a.key === k) return;
    a.key = k;
    a.el.style.display = ''; a.ln.style.display = ''; a.dot.style.display = '';
    a.el.className = cls; a.el.style.left = lx + 'px'; a.el.style.top = it.ly.toFixed(1) + 'px';
    a.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    a.ln.setAttribute('points', pts);
    a.dot.setAttribute('cx', it.sx.toFixed(1)); a.dot.setAttribute('cy', it.sy.toFixed(1));
  });
}

/* =====================================================================
   6. Leiste: Strukturen, Krankheiten, Medikamente, Hilfekarten, \u00dcben
   ===================================================================== */
function applyVisibility() {
  ORDER.forEach(function (s) {
    if (s.id === 'myo') { s.mats.forEach(function (m) { m.visible = s.on; }); return; }
    s.meshes.forEach(function (m) { m.visible = s.on && !m.userData.hideOpen; });
  });
  showB = STRUCT.blutB.on; showR = STRUCT.blutR.on;
  applyBackOpacity(App.openK);
}
App.hl = {};
var BRASS = null, EXC = null;
function updateEmissive(pos) {
  if (!BRASS) { BRASS = srgb(0xE0A94A); EXC = new THREE.Color(1.0, 0.72, 0.18); }
  var exA = 0, exV = 0, exA0 = 0, fl = engine ? engine.flimmern() : 0, tz = engine ? engine.flimT : 0;
  if (App.impulse && pos !== undefined) {
    exA = sstep(0.02, 0.06, pos) * (1 - sstep(0.15, 0.21, pos));
    exA0 = exA;
    exV = sstep(0.17, 0.21, pos) * (1 - sstep(0.37, 0.47, pos));
  }
  ORDER.forEach(function (s) {
    var sel = (s.id === App.sel ? 0.28 : 0) + (App.hl[s.id] ? 0.35 : 0);
    if (fl > 0 && App.impulse && (s.id === 'ra' || s.id === 'la')) {   /* Vorhofflimmern: unruhiges Flackern statt geordneter Welle */
      var ph = s.id === 'ra' ? 0 : 2.1, fk = 0.5 + 0.5 * (0.6 * Math.sin(tz * 23 + ph) + 0.4 * Math.sin(tz * 37.3 + 2 * ph + 1));
      exA = exA0 * (1 - fl) + fl * (0.25 + 0.75 * fk);
    }
    var ex = (s.id === 'ra' || s.id === 'la') ? exA : ((s.id === 'lv' || s.id === 'rv' || s.id === 'ivs' || s.id === 'pap') ? exV : 0);
    s.mats.forEach(function (m) {
      if (!m.emissive || m.userData.erl) return;
      var b = m.userData.baseEmissive;
      var r = (b ? b.r : 0) + BRASS.r * sel + EXC.r * ex * 0.16, gg = (b ? b.g : 0) + BRASS.g * sel + EXC.g * ex * 0.16, bb = (b ? b.b : 0) + BRASS.b * sel + EXC.b * ex * 0.16;
      m.emissive.setRGB(r, gg, bb);
    });
  });
}
function setSelected(id) {
  App.sel = id;
  updateEmissive(App.W ? App.W.pos : undefined);
  ORDER.forEach(function (s) { var row = $('row-' + s.id); if (row) row.classList.toggle('sel', s.id === id); });
  var box = $('info');
  if (!id) { box.classList.remove('show'); kartenLage(); return; }
  var s = STRUCT[id];
  if (!s.on) { s.on = true; var rw = $('row-' + id); if (rw) rw.classList.remove('off'); applyVisibility(); }
  $('iLat').textContent = s.lat; $('iDe').textContent = s.de; $('iTx').textContent = s.txt; $('iCare').textContent = s.care;
  var dl = $('iDl'); dl.innerHTML = '';
  Object.keys(s.facts).forEach(function (k) { var dt = document.createElement('dt'); dt.textContent = k; var dd = document.createElement('dd'); dd.textContent = s.facts[k]; dl.appendChild(dt); dl.appendChild(dd); });
  if (LUPE.open) lupeClose();
  box.classList.add('show');
  if (!App.quiz) closeCard();
  document.body.classList.add('card'); szWeichen();
  LABELS.forEach(function (a) { a.key = ''; });
}
function showCard(kick, title, lead, after, quiz) {
  if (LUPE.open) lupeClose();
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  var L = $('sLead'); L.innerHTML = '';
  if (typeof lead === 'string') L.textContent = lead;
  else if (lead) { var dl = document.createElement('dl'); Object.keys(lead).forEach(function (k) { var dt = document.createElement('dt'); dt.textContent = k; var dd = document.createElement('dd'); dd.textContent = lead[k]; dl.appendChild(dt); dl.appendChild(dd); }); L.appendChild(dl); }
  var A = $('sAfter'); A.innerHTML = '';
  if (after) { var h5 = document.createElement('h5'); h5.textContent = after.h; var p = document.createElement('p'); p.textContent = after.t; A.appendChild(h5); A.appendChild(p); }
  $('sQa').style.display = quiz ? 'flex' : 'none';
  if (App.sel && !quiz) clearSel();
  $('scard').classList.add('show');
  $('info').classList.remove('show');
  document.body.classList.add('card'); szWeichen();
  LABELS.forEach(function (a) { a.key = ''; });
}
function clearSel() {
  ORDER.forEach(function (s) { var row = $('row-' + s.id); if (row) row.classList.remove('sel'); });
  App.sel = null;
  updateEmissive(App.W ? App.W.pos : undefined);
}
function closeCard() {
  $('scard').classList.remove('show');
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.remove('on'); });
  kartenLage();
}
function openHelp(key) {
  var c = INFO.cards.filter(function (x) { return x[0] === key; })[0]; if (!c) return;
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.toggle('on', d.dataset.card === key); });
  showCard('Hilfekarte', c[1], c[2], c[3] ? { h: 'Merke', t: c[3] } : null, false);
}
/* =====================================================================
   Krankheitsbilder und Medikamente – Daten für Reiter und Erklärkarte
   Format wie im Nephron (SCENARIOS): id, kind ('disease' | 'drug'), name,
   short, kicker, lead, values, steps, after, note; dazu wirkung (Zielwerte
   der Wirkgrößen in engine.S.par, neutral = 1) und datei (Namensteil im Export).
   ===================================================================== */
var SZENARIEN = [
  { id: 'lhi', kind: 'disease', datei: 'linksherzinsuffizienz', name: 'Linksherzinsuffizienz', short: 'Die linke Kammer pumpt zu schwach – Rückstau in die Lunge', kicker: 'Krankheitsbild · Herzinsuffizienz',
    lead: 'Die linke Kammer ist geschwächt, z. B. nach einem Herzinfarkt oder durch langjährigen Bluthochdruck. Sie wirft bei jedem Schlag weniger Blut aus – der Rest staut sich zurück in die Lunge.',
    values: [['Auswurffraktion', 'unter 40 % (normal über 55 %)'], ['Linke Kammer', 'erweitert, pumpt schwach'], ['Rückstau', 'in die Lunge'], ['Leitsymptom', 'Atemnot (Dyspnoe)']],
    steps: [['Die Kammer drückt schwächer.', 'Sie zieht sich nur wenig zusammen – im Modell bleibt die linke Kammer weit.'], ['Weniger Auswurf.', 'Pro Schlag fließen weniger Portionen in die Aorta; der Körper wird schlechter versorgt.'], ['Das Blut staut sich zurück.', 'Der linke Vorhof bleibt voll, das Blut aus der Lunge kommt nicht richtig nach – in den Lungenvenen und im Schema in der Lunge staut es sich.'], ['Wasser tritt in die Lunge.', 'Steigt der Druck in den Lungengefäßen, wird Flüssigkeit ins Gewebe gepresst: Atemnot, erst bei Belastung, später in Ruhe und im Liegen – im Extremfall Lungenödem.']],
    after: [['Folgen', 'Atemnot, nächtlicher Husten, Rasselgeräusche über der Lunge, Leistungsschwäche, schnelle Ermüdung; Lungenödem als Notfall (schwerste Atemnot, schaumiger Auswurf).'], ['Pflege beobachtet', 'Atmung, Atemfrequenz und Sauerstoffsättigung, Oberkörper hoch lagern (Herzbettlage), täglich wiegen, Ein- und Ausfuhr bilanzieren, Vitalzeichen; Belastung dosieren.']],
    note: 'Im Modell ist die Schwäche übertrieben, damit man den Rückstau gut sieht.', wirkung: { kraftL: 0.45 } },
  { id: 'rhi', kind: 'disease', datei: 'rechtsherzinsuffizienz', name: 'Rechtsherzinsuffizienz', short: 'Die rechte Kammer pumpt zu schwach – Rückstau in die Körpervenen', kicker: 'Krankheitsbild · Herzinsuffizienz',
    lead: 'Die rechte Kammer schafft das Blut nicht mehr in die Lunge – oft als Folge einer Linksherzinsuffizienz, einer Lungenerkrankung (COPD) oder einer Lungenembolie. Das Blut staut sich in die Körpervenen.',
    values: [['Häufige Ursachen', 'Linksherzschwäche, COPD, Lungenembolie'], ['Rechte Kammer', 'erweitert, pumpt schwach'], ['Rückstau', 'in die Hohlvenen und Körpervenen'], ['Leitsymptom', 'Ödeme, gestaute Halsvenen']],
    steps: [['Die rechte Kammer drückt schwächer.', 'Sie bleibt weit und wirft weniger Blut in die Lungenarterien.'], ['Der rechte Vorhof bleibt voll.', 'Das Blut aus dem Körper kann nicht mehr ungehindert nachfließen.'], ['Stau vor dem Herzen.', 'In der oberen und unteren Hohlvene drängen sich die Portionen – am Hals sieht man gestaute Venen.'], ['Wasser im Gewebe.', 'Der hohe Venendruck presst Flüssigkeit ins Gewebe: Ödeme an Knöcheln und Unterschenkeln, bei Bettlägerigen am Kreuzbein; dazu Stauungsleber und Appetitlosigkeit.']],
    after: [['Folgen', 'Beinödeme, Gewichtszunahme durch eingelagertes Wasser, nächtliches Wasserlassen (Nykturie), Appetitlosigkeit, Druckgefühl unter dem rechten Rippenbogen.'], ['Pflege beobachtet', 'Täglich wiegen (gleiche Bedingungen), Ödeme und Haut beobachten (Dekubitusgefahr), Beine hoch lagern, sofern keine Atemnot besteht, Ein- und Ausfuhr bilanzieren, Trinkmenge nach ärztlicher Anordnung.']],
    note: 'Im Modell ist die Schwäche übertrieben, damit man den Rückstau gut sieht.', wirkung: { kraftR: 0.45 } },
  { id: 'ghi', kind: 'disease', datei: 'globalinsuffizienz', name: 'Globalinsuffizienz', short: 'Beide Kammern pumpen zu schwach – Rückstau in Lunge und Körper', kicker: 'Krankheitsbild · Herzinsuffizienz',
    lead: 'Beide Herzhälften sind geschwächt. Meist beginnt es links; die rechte Kammer folgt, weil sie gegen den Stau in der Lunge anpumpen muss.',
    values: [['Auswurffraktion', 'deutlich vermindert'], ['Rückstau', 'in Lunge und Körpervenen'], ['Herzfrequenz', 'erhöht (Ausgleich)'], ['Einteilung', 'NYHA I–IV nach Belastbarkeit']],
    steps: [['Beide Kammern drücken schwächer.', 'Links und rechts bleibt viel Blut in den Kammern, beide sind erweitert.'], ['Stau auf beiden Seiten.', 'Vor dem linken Herzen staut es sich in die Lunge, vor dem rechten in die Hohlvenen.'], ['Der Körper gleicht aus.', 'Weil zu wenig Blut ankommt, schlägt das Herz schneller, und die Niere hält Salz und Wasser zurück – das verstärkt den Stau zusätzlich.'], ['Behandlung.', 'Typisch sind ACE-Hemmer oder Sartane, Betablocker wie Metoprolol, Aldosteron-Antagonisten, SGLT2-Hemmer und bei Ödemen Diuretika wie Torasemid (siehe Nephron).']],
    after: [['NYHA-Stadien', 'I keine Beschwerden bei Alltagsbelastung · II Beschwerden bei stärkerer Belastung · III Beschwerden schon bei leichter Belastung · IV Beschwerden in Ruhe.'], ['Pflege beobachtet', 'Atmung und Ödeme, täglich wiegen (mehr als 1 kg an einem Tag oder 2 kg in drei Tagen melden), Vitalzeichen, Ein- und Ausfuhr, Medikamenteneinnahme; Beratung zu Salz und Trinkmenge.']],
    note: 'Im Modell ist die Schwäche übertrieben, damit man den Rückstau gut sieht.', wirkung: { kraftL: 0.55, kraftR: 0.55, tempoFaktor: 1.15 } },
  { id: 'aks', kind: 'disease', datei: 'aortenklappenstenose', name: 'Aortenklappenstenose', short: 'Die Aortenklappe öffnet nur einen Spalt – die linke Kammer pumpt gegen einen Widerstand', kicker: 'Krankheitsbild · Herzklappenfehler',
    lead: 'Die Taschen der Aortenklappe sind verkalkt und steif. Sie öffnen nur noch einen engen Spalt, und die linke Kammer muss viel mehr Druck aufbauen, um das Blut hindurchzupressen.',
    values: [['Häufigkeit', 'häufigster Klappenfehler im Alter'], ['Ursache', 'meist Verkalkung'], ['Klappenöffnung', 'schwer: unter 1 cm² (normal 3–4 cm²)'], ['Abhören', 'raues Geräusch in der Systole, 2. ICR rechts']],
    steps: [['Die Klappe öffnet nur einen Spalt.', 'Im Modell gehen die Taschen kaum auf – vergleiche mit der Pulmonalklappe daneben.'], ['Ein scharfer Strahl.', 'Das Blut schießt schnell durch die Enge und verwirbelt. Die Wirbel hört man als raues Herzgeräusch in der Systole.'], ['Die Kammer leert sich schlechter.', 'Pro Schlag gelangt weniger Blut in die Aorta, die linke Kammer bleibt voller.'], ['Die Wand wird dick.', 'Auf Dauer verdickt sich der Herzmuskel (Hypertrophie), braucht mehr Sauerstoff und wird steif – bis er schließlich nachlässt (Linksherzinsuffizienz).']],
    after: [['Warnzeichen', 'Schwindel und kurze Bewusstlosigkeit (Synkope) bei Belastung, Brustenge (Angina pectoris), Atemnot. Treten sie auf, ist die Stenose meist schon schwer.'], ['Behandlung', 'Klappenersatz – offen operiert oder per Katheter über die Leistenarterie (TAVI).'], ['Pflege beobachtet', 'Puls und Blutdruck, Schwindel und Sturzgefahr, Belastung langsam steigern; nach TAVI die Punktionsstelle in der Leiste (Blutung, Bluterguss) und die Fußpulse kontrollieren.']],
    note: 'Die Verdickung der Wand zeigt das Modell nicht.', wirkung: { avOeffnung: 0.3 } },
  { id: 'vhf', kind: 'disease', name: 'Vorhofflimmern', short: 'Die Vorhöfe flimmern statt zu schlagen – der Puls wird unregelmäßig', kicker: 'Krankheitsbild · Herzrhythmusstörung',
    lead: 'In den Vorhöfen kreisen ungeordnete elektrische Erregungen, 350 bis 600 pro Minute. Die Vorhöfe ziehen sich nicht mehr zusammen, sie zittern nur. Der AV-Knoten lässt die Impulse unregelmäßig zu den Kammern durch.',
    values: [['Häufigkeit', 'häufigste Rhythmusstörung, vor allem im Alter'], ['Vorhöfe', '350–600 Erregungen/min, kein Schlag'], ['Puls', 'unregelmäßig, oft zu schnell'], ['EKG', 'keine P-Welle, unregelmäßige Abstände']],
    steps: [['Die Vorhöfe flimmern.', 'Statt eines geordneten Impulses vom Sinusknoten kreisen viele kleine Erregungen durch die Vorhöfe. Im Modell fehlt der Schub der Vorhöfe.'], ['Der AV-Knoten filtert.', 'Nur ein Teil der Impulse erreicht die Kammern – zufällig verteilt. Die Schläge kommen unregelmäßig und oft zu schnell.'], ['Weniger Füllung.', 'Ohne den letzten Schub der Vorhöfe füllen sich die Kammern schlechter; bei schnellen Schlägen bleibt kaum Zeit dafür. Die Pumpleistung sinkt.'], ['Gefahr Gerinnsel.', 'Im langsam fließenden Blut des linken Herzohrs können sich Gerinnsel bilden. Gelangen sie ins Gehirn, entsteht ein Schlaganfall.']],
    after: [['Folgen', 'Herzstolpern, Herzrasen, Schwindel, Leistungsschwäche, Atemnot; das Schlaganfallrisiko ist etwa fünfmal höher.'], ['Behandlung', 'Gerinnungshemmer (z. B. Apixaban, Rivaroxaban, Phenprocoumon), Frequenzkontrolle mit Betablockern wie Metoprolol, ggf. Rückführung in den Sinusrhythmus (Kardioversion, Ablation).'], ['Pflege beobachtet', 'Puls immer eine volle Minute zählen und mit der Herzfrequenz am Monitor oder beim Abhören vergleichen (Pulsdefizit), Blutdruck, Schwindel und Sturzgefahr, Blutungszeichen unter Gerinnungshemmern, Zeichen eines Schlaganfalls (Gesicht, Arme, Sprache) sofort melden.']],
    note: 'Das Flimmern der Vorhöfe ist im Modell als feines Zittern angedeutet.', wirkung: { vorhofSchub: 0, rhythmus: 1, tempoFaktor: 1.35 }, datei: 'vorhofflimmern' },
  { id: 'mi', kind: 'disease', name: 'Herzinfarkt (Vorderwand)', short: 'Der RIVA ist verschlossen \u2013 ein Teil der Vorderwand stirbt ab', kicker: 'Krankheitsbild \u00b7 akutes Koronarsyndrom',
    lead: 'Ein Blutgerinnsel auf einer aufgebrochenen Ablagerung (Plaque) verschlie\u00dft den vorderen Ast der linken Herzkranzarterie (RIVA). Der Herzmuskel dahinter bekommt keinen Sauerstoff mehr und beginnt nach 20 bis 30 Minuten abzusterben.',
    values: [['Verschluss', 'RIVA, vorderer Ast der linken Koronararterie'], ['Betroffen', 'Vorderwand der linken Kammer, Herzspitze, vordere Scheidewand'], ['EKG', 'ST-Hebung (STEMI)'], ['Labor', 'Troponin erh\u00f6ht']],
    steps: [['Das Gef\u00e4\u00df ist verschlossen.', 'Im Modell ist der RIVA ab der Engstelle dunkel \u2013 dahinter kommt kein Blut mehr an.'], ['Der Muskel leidet.', 'Das Versorgungsgebiet \u2013 Vorderwand und Herzspitze \u2013 wird blass. Ohne Sauerstoff zieht sich der Muskel dort nicht mehr zusammen.'], ['Die Pumpleistung sinkt.', 'Die linke Kammer arbeitet nur noch mit dem gesunden Teil ihrer Wand; es drohen R\u00fcckstau in die Lunge und Schock.'], ['Zeit ist Muskel.', 'Je schneller das Gef\u00e4\u00df wieder ge\u00f6ffnet wird \u2013 meist mit Herzkatheter und Stent \u2013, desto mehr Muskel bleibt erhalten.']],
    after: [['Warnzeichen', 'Starker Brustschmerz oder Druck, oft mit Ausstrahlung in linken Arm, Hals, Kiefer oder Oberbauch, Atemnot, Kaltschwei\u00dfigkeit, \u00dcbelkeit, Todesangst. Bei Frauen, \u00e4lteren Menschen und Menschen mit Diabetes oft untypisch und weniger schmerzhaft.'], ['Sofortma\u00dfnahmen', 'Notruf 112, Oberk\u00f6rper hoch lagern, enge Kleidung \u00f6ffnen, nicht allein lassen, keine Anstrengung; Vitalzeichen und 12-Kanal-EKG, Sauerstoff nur bei niedriger S\u00e4ttigung.'], ['Pflege beobachtet', 'Schmerz, Vitalzeichen und Herzrhythmus am Monitor (gef\u00e4hrliche Rhythmusst\u00f6rungen in den ersten Stunden), Punktionsstelle nach Herzkatheter, Bettruhe nach Anordnung, Ausscheidung; Angst ernst nehmen.']],
    note: 'Die Grenzen des Infarktgebiets sind im Modell vereinfacht.', wirkung: { infarkt: 1, kraftL: 0.6 }, datei: 'vorderwandinfarkt' }
];
var SZ = Kern.Szenarien({
  daten: SZENARIEN, karte: 'kcard', dauer: 1.2,
  beimWechsel: function (id) {
    if (id) {                                          /* Hilfekarte, Info, Lupe und Üben weichen der Szenariokarte */
      if (App.quiz) quizEnd();
      if (LUPE.open) lupeClose();
      setSelected(null); closeCard();
    }
    kartenLage();
    szenarioWirkung();
  },
  beimEinklappen: function () {
    if (SZ.offen) {                                    /* wieder aufgeklappt: die anderen Karten weichen */
      if (App.quiz) quizEnd();
      if (LUPE.open) lupeClose();
      setSelected(null); closeCard();
    }
    kartenLage();
  }
});
/* Wirkung auf das Herz: Wirkgrößen = neutral + Summe anteil · (Zielwert - neutral), weich nach SZ.anteil gemischt; neutral = 1 */
var WIRKNEUTRAL = { kraftL: 1, kraftR: 1, tempoFaktor: 1, avOeffnung: 1, vorhofSchub: 1, rhythmus: 0, infarkt: 0 };   /* neutrale Werte (rhythmus: 0 = regelm\u00e4\u00dfig; infarkt: 0 = kein Infarkt) */
var WIRKFELDER = Object.keys(WIRKNEUTRAL);
function szenarioWirkung() {
  if (!engine) return;
  var par = engine.S.par;
  WIRKFELDER.forEach(function (f) {
    var n = WIRKNEUTRAL[f], v = n;
    SZENARIEN.forEach(function (sc) { if (sc.wirkung && sc.wirkung[f] !== undefined && SZ.anteil[sc.id] > 0) v += SZ.anteil[sc.id] * (sc.wirkung[f] - n); });
    par[f] = v;
  });
  infarktSetzen(par.infarkt);
}
/* aktives Szenario (Anteil > 0,5) f\u00fcr den Export, sonst null */
function szenarioExport() {
  var r = null;
  SZENARIEN.forEach(function (sc) { if (SZ.anteil[sc.id] > 0.5) r = sc; });
  return r;
}
/* Szenariokarte klappt ein, wenn Hilfekarte, Info, Lupe oder Üben rechts aufgehen; das Szenario bleibt aktiv */
function szWeichen() {
  if (SZ.aktiv && SZ.offen) {
    SZ.zuklappen();
    var bm = SZ.el.querySelector('#bCardMin'); if (bm) bm.textContent = '+';
  }
  kartenLage();
}
/* Karte „weg“, solange eine andere Karte rechts offen ist; Platz für die Beschriftung */
function kartenLage() {
  var andere = $('scard').classList.contains('show') || $('info').classList.contains('show') || $('lupe').classList.contains('show');
  SZ.el.classList.toggle('weg', andere && !SZ.offen);
  document.body.classList.toggle('card', andere || !!(SZ.aktiv && SZ.offen));
}
(function buildRail() {
  var railRoot = $('rail');
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var paneS = document.createElement('div'), paneD = document.createElement('div'), paneM = document.createElement('div'), paneH = document.createElement('div'), paneU = document.createElement('div');
  var panes = [paneS, paneD, paneM, paneH, paneU];
  [['Strukturen', paneS], ['Krankheiten', paneD], ['Medikamente', paneM], ['Hilfekarten', paneH], ['\u00dcben', paneU]].forEach(function (t, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = t[0];
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  railRoot.appendChild(tabs); panes.forEach(function (p, k) { if (k) p.style.display = 'none'; railRoot.appendChild(p); });
  /* Krankheiten, Medikamente */
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', 'Schalte ein Krankheitsbild ein: Das Herz ver\u00e4ndert sich, und rechts erscheint eine Erkl\u00e4rkarte.');
  SZ.liste(paneM, 'drug', 'Medikamente', 'Schalte ein Medikament ein: Das Herz zeigt seine Wirkung, und rechts erscheint eine Erkl\u00e4rkarte.');
  /* Hilfekarten */
  var ih = document.createElement('p'); ih.className = 'dis-intro'; ih.textContent = 'Kurz erkl\u00e4rt \u2013 tippe eine Karte an, sie erscheint rechts.'; paneH.appendChild(ih);
  INFO.cards.forEach(function (c) {
    var d = document.createElement('div'); d.className = 'dis'; d.tabIndex = 0; d.dataset.card = c[0];
    d.innerHTML = '<span><b></b></span>'; d.querySelector('b').textContent = c[1];
    d.addEventListener('click', function () { openHelp(c[0]); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter') openHelp(c[0]); });
    paneH.appendChild(d);
  });
  /* \u00dcben */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur im Modell und tippe sie an. Die Beschriftung verschwindet solange.'; paneU.appendChild(iu);
  var pb = document.createElement('div'); pb.className = 'pane-btn';
  var bq = document.createElement('button'); bq.className = 'gh'; bq.id = 'bQuiz'; bq.textContent = 'Strukturen finden';
  bq.addEventListener('click', function () { App.quiz ? quizEnd() : quizStart(); });
  pb.appendChild(bq); paneU.appendChild(pb);
  var h2 = document.createElement('h2'); h2.className = 'dis-h'; h2.textContent = 'Probier mal'; paneU.appendChild(h2);
  var tip = document.createElement('div'); tip.className = 'tip'; tip.id = 'tipText'; tip.textContent = INFO.tips[0]; paneU.appendChild(tip);
  var pb2 = document.createElement('div'); pb2.className = 'pane-btn';
  var bt = document.createElement('button'); bt.className = 'gh'; bt.textContent = 'N\u00e4chster Tipp';
  var tipNr = 0; bt.addEventListener('click', function () { tipNr = (tipNr + 1) % INFO.tips.length; tip.textContent = INFO.tips[tipNr]; });
  pb2.appendChild(bt); paneU.appendChild(pb2);
  App.paneS = paneS;
})();
function buildStructList() {
  var paneS = App.paneS;
  INFO.groups.forEach(function (g) {
    var list = ORDER.filter(function (s) { return s.grp === g && (s.has || s.id === 'blutB' || s.id === 'blutR'); });
    if (!list.length) return;
    var wrap = document.createElement('div'); wrap.className = 'grp';
    var h = document.createElement('h2'); h.textContent = g; wrap.appendChild(h);
    list.forEach(function (s) {
      var row = document.createElement('div'); row.className = 'row'; row.id = 'row-' + s.id; row.tabIndex = 0;
      row.innerHTML = '<span class="sw' + (s.dot ? ' dot' : '') + '" style="background:#' + s.col.toString(16).padStart(6, '0') + '"></span><span class="nm"><b></b><i></i></span>';
      row.querySelector('b').textContent = s.de; row.querySelector('i').textContent = s.lat;
      var sw = row.querySelector('.sw'); sw.title = 'Ein- oder ausblenden';
      var flip = function () { s.on = !s.on; row.classList.toggle('off', !s.on); applyVisibility(); };
      sw.addEventListener('click', function (e) { e.stopPropagation(); flip(); });
      row.addEventListener('click', function () { setSelected(s.id); });
      row.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); setSelected(s.id); } if (e.key === ' ') { e.preventDefault(); flip(); } });
      wrap.appendChild(row);
    });
    paneS.appendChild(wrap);
  });
}

/* ---------- \u00dcben ---------- */
function quizPool() { return ORDER.filter(function (s) { return s.has && s.on && s.id !== 'ias' && (App.opened ? s.aOpen : s.aClosed); }).map(function (s) { return s.id; }); }
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === App.quiz.last);
  App.quiz.target = id; App.quiz.last = id; App.quiz.wait = false;
  showCard('\u00dcben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe das Herz, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = App.quiz.ok + ' von ' + App.quiz.n + ' richtig';
}
function quizStart() { setSelected(null); App.quiz = { n: 0, ok: 0, target: null, last: null }; $('bQuiz').classList.add('on'); $('bQuiz').textContent = '\u00dcben beenden'; quizNext(); }
function quizEnd() {
  if (App.quiz && App.quiz.target) highlight(App.quiz.target, false);
  App.quiz = null; closeCard(); $('bQuiz').classList.remove('on'); $('bQuiz').textContent = 'Strukturen finden';
}
function highlight(id, on) {
  if (!STRUCT[id]) return;
  if (on) App.hl[id] = true; else delete App.hl[id];
  updateEmissive(App.W ? App.W.pos : undefined);
}
function quizAnswer(sid) {
  var Q = App.quiz; if (!Q || !Q.target || Q.wait) return;
  Q.n++; Q.wait = true;
  var ok = sid === Q.target; if (ok) Q.ok++;
  var L = $('sLead'); L.innerHTML = '';
  var sp = document.createElement('span'); sp.className = ok ? 'ok' : 'no';
  sp.textContent = ok ? 'Richtig.' : (sid && STRUCT[sid] ? 'Das war: ' + STRUCT[sid].de + '. Die gesuchte Struktur leuchtet jetzt.' : 'Daneben \u2013 die gesuchte Struktur leuchtet jetzt.');
  L.appendChild(sp);
  $('sScore').textContent = Q.ok + ' von ' + Q.n + ' richtig';
  highlight(Q.target, true);
  var tg = Q.target;
  setTimeout(function () { highlight(tg, false); if (App.quiz) quizNext(); }, ok ? 1200 : 2400);
}

/* =====================================================================
   7. Bedienung
   ===================================================================== */
var PRESETS = [
  { theta: 0.0, phi: 1.52, dist: 34.5, target: V(0.4, 1.0, -1.2) },
  { theta: 0.12, phi: 1.22, dist: 19, target: V(0.3, 1.0, -0.8) },
  { theta: -0.28, phi: 1.5, dist: 20, target: V(-2.3, 0.6, -0.8) },
  { theta: 0.3, phi: 1.5, dist: 20, target: V(2.5, 0.2, -1.4) }
];
function goTo(i) {
  App.preset = i;
  ['cam0', 'cam1', 'cam2', 'cam3'].forEach(function (id, k) { $(id).classList.toggle('on', k === i); });
  var t = PRESETS[i];
  orbit.anim = Kern.fahrt(view, { theta: t.theta, phi: t.phi, dist: t.dist * fitDist / 34.5, target: t.target }, 700);
}
[0, 1, 2, 3].forEach(function (i) { $('cam' + i).onclick = function () { goTo(i); }; });
function onOff(id, on) { $(id).classList.toggle('on', on); }
$('bOpen').onclick = function () { App.opened = true; onOff('bOpen', true); onOff('bClosed', false); };
$('bClosed').onclick = function () { App.opened = false; onOff('bOpen', false); onOff('bClosed', true); };
$('bLab').onclick = function () { App.labels = !App.labels; onOff('bLab', App.labels); };
$('bSchema').onclick = function () { setSchema(!App.schema); };
$('bAR').onclick = function () { AR.start(); };
$('bSchemaX').onclick = function () { setSchema(false); };
$('bSee').onclick = function () { App.see = !App.see; onOff('bSee', App.see); applySee(); };
$('bCls').onclick = function () { setSelected(null); };
$('sClose').onclick = function () { if (App.quiz) quizEnd(); else closeCard(); };
$('qNext').onclick = function () { if (App.quiz) quizNext(); };
$('qStop').onclick = quizEnd;
$('bPlay').onclick = function () { engine.S.laufen = !engine.S.laufen; this.textContent = engine.S.laufen ? 'Pause' : 'Abspielen'; onOff('bPlay', engine.S.laufen); };
[['bS0', 0.6], ['bS1', 1], ['bS2', 1.6]].forEach(function (b) {
  $(b[0]).onclick = function () { engine.S.tempo = b[1]; ['bS0', 'bS1', 'bS2'].forEach(function (id) { onOff(id, id === b[0]); }); };
});
function setHand(on) {
  engine.S.modus = on ? 'hand' : 'auto'; engine.S.laufen = true; onOff('bPlay', true); $('bPlay').textContent = 'Pause';
  engine.S.hand = { vorhof: false, rk: false, lk: false };
  ['hV', 'hR', 'hL'].forEach(function (id) { onOff(id, false); });
  $('autoRow').style.display = on ? 'none' : ''; $('handRow').style.display = on ? '' : 'none';
  if (on) openHelp('hand');
}
$('bHand').onclick = function () { setHand(true); };
$('bAuto').onclick = function () { setHand(false); };
[['hV', 'vorhof'], ['hR', 'rk'], ['hL', 'lk']].forEach(function (b) {
  $(b[0]).onclick = function () { engine.S.hand[b[1]] = !engine.S.hand[b[1]]; onOff(b[0], engine.S.hand[b[1]]); };
});
$('hX').onclick = function () { engine.S.hand = { vorhof: false, rk: false, lk: false }; ['hV', 'hR', 'hL'].forEach(function (id) { onOff(id, false); }); };
function setWK(on) {
  engine.S.windkessel = on; onOff('wkE', on); onOff('wkS', !on);
  (App.aoMats || []).forEach(function (m) { m.color.setRGB(on ? 1 : 0.8, on ? 1 : 0.8, on ? 1 : 0.82); });
  openHelp('windkessel');
}
function setFocus(f) {
  App.focus = f; onOff('fAll', !f); onOff('fLu', f === 'lunge'); onOff('fKo', f === 'koerper');
  LABELS.forEach(function (a) { a.key = ''; });
  if (f) openHelp(f === 'lunge' ? 'rechtesHerz' : 'linkesHerz'); else closeCard();
}
$('fAll').onclick = function () { setFocus(null); };
$('fLu').onclick = function () { setFocus('lunge'); };
$('fKo').onclick = function () { setFocus('koerper'); };
$('bErr').onclick = function () {
  App.impulse = !App.impulse; onOff('bErr', App.impulse);
  document.body.classList.toggle('erreg', App.impulse);
  if (App.impulse && !STRUCT.erl.on) { STRUCT.erl.on = true; var rw = $('row-erl'); if (rw) rw.classList.remove('off'); applyVisibility(); }
  setErlOverlay(App.impulse);
  setTimeout(fitRail, 30);
  if (!App.impulse) { updateEmissive(); updateSparks(0, App.W, 0); }
  else { lastErr = ''; if (window.innerWidth >= 1000) openHelp('ekg'); else closeCard(); }
  refreshOpacity();
  LABELS.forEach(function (a) { a.key = ''; });
};
$('wkE').onclick = function () { setWK(true); };
$('wkS').onclick = function () { setWK(false); };
var actx = null;
$('bSnd').onclick = function () {
  App.sound = !App.sound; onOff('bSnd', App.sound);
  if (App.sound && !actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
  if (actx && actx.state === 'suspended') actx.resume();
};
function thump(freq, dur, gain) {
  if (!actx) return;
  var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
  o.type = 'sine'; o.frequency.setValueAtTime(freq * 1.6, t); o.frequency.exponentialRampToValueAtTime(freq, t + dur * 0.5);
  f.type = 'lowpass'; f.frequency.value = 180;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
}
function applySee() {
  var a = App.see ? 0.3 : 1;
  [backG, lidG].forEach(function (g) {
    g.traverse(function (m) {
      if (!m.userData || !m.userData.tissue) return;
      m.material.forEach(function (mt) { mt.userData.baseOpacity = a; });
    });
  });
  setLidPose(App.openK);
}
/* Gefäße: im geöffneten Herzen durchscheinend wie im Nephron-Modell, damit man das Blut darin sieht */
var vesFade = 1, VALVES = ['mitral', 'tricus', 'aortic', 'pulm'];
function applyBackOpacity(k) { refreshOpacity(); }
/* Kreislauf-Auswahl: ausgewählte Seite kräftig, alles andere sehr blass */
var FOCUS = {
  lunge: ['ra', 'rv', 'svc', 'ivc', 'pt', 'tricus', 'pulm', 'Sehnenfaeden_chordT'],
  koerper: ['la', 'lv', 'pv', 'aorta', 'mitral', 'aortic', 'Sehnenfaeden_chordM']
};
var NEUTRAL = ['ivs', 'pap', 'ias', 'lig', 'cor'];
App.focus = null;
function focusTarget(m) {
  if (!App.focus) return 1;
  var sid = m.userData.sid, set = FOCUS[App.focus];
  if (sid === 'erl') return App.impulse ? 1 : 0.25;
  if (m.name && m.name.indexOf('Sehnenfaeden_') === 0) return set.indexOf(m.name) >= 0 ? 1 : 0.03;
  if (set.indexOf(sid) >= 0) return 1;
  if (NEUTRAL.indexOf(sid) >= 0) return 0.2;
  return 0.03;
}
function stepFocus(dt) {
  var ch = false;
  [backG, lidG].forEach(function (G) {
    G.traverse(function (m) {
      if (!m.isMesh) return;
      var t = focusTarget(m), c = m.userData.fk === undefined ? 1 : m.userData.fk;
      if (c !== t) { c += (t - c) * Math.min(1, dt * 7); if (Math.abs(t - c) < 0.01) c = t; m.userData.fk = c; ch = true; }
    });
  });
  return ch;
}
function refreshOpacity() {
  var vesK = 1 - (1 - vesFade) * sstep(0.4, 1, App.openK), g = glassU.value;
  [backG, lidG].forEach(function (G) {
    G.traverse(function (m) {
      if (!m.isMesh || !m.material) return;
      var fk = m.userData.fk === undefined ? 1 : m.userData.fk;
      var ves = (G === backG && m.userData.vessel) ? vesK : 1;
      (Array.isArray(m.material) ? m.material : [m.material]).forEach(function (mt) {
        if (mt.userData.erl) return;
        var base = mt.userData.baseOpacity !== undefined ? mt.userData.baseOpacity : 1;
        var op = base * ves * fk;
        mt.opacity = op;
        var tr = op < 0.999 || (mt.userData.glass && g > 0.001);
        mt.transparent = tr; mt.depthWrite = !tr;
      });
      if (G === backG && m.userData.vessel) m.visible = STRUCT[m.userData.sid].on && vesK > 0.02;
      if (m.userData.outline) m.userData.outline.visible = fk > 0.6;
    });
  });
  /* Erregungsleitung (gemeinsames Material) */
  if (App.condMat) {
    var cf = App.focus ? (App.impulse ? 1 : 0.25) : 1;
    App.condMat.opacity = cf; App.condMat.transparent = cf < 0.999 || App.impulse; App.condMat.depthWrite = !App.condMat.transparent;
  }
}
var clipOn = null;
function setClip(on) {
  if (clipOn === on) return; clipOn = on;
  clipMats.forEach(function (m) { m.clippingPlanes = on ? [CLIP] : null; m.needsUpdate = true; });
  clipMatsPv.forEach(function (m) { m.clippingPlanes = on ? [CLIP_PV] : null; m.needsUpdate = true; });
  clipMatsErl.forEach(function (m) { m.clippingPlanes = (on && !App.impulse) ? [CLIP_ERL] : null; m.needsUpdate = true; });
  /* Koronarien liegen außen – in der geöffneten Ansicht nur störende Reste am Rand */
  corBack.forEach(function (m) { m.userData.hideOpen = on; m.visible = STRUCT.cor.on && !on; });
}
function setLidPose(k) {
  setClip(k > 0.5);
  lidPivot.rotation.y = 0; lidPivot.position.z = 0.6;
  var g = sstep(0.05, 0.95, k);
  glassU.value = g;
  lidG.visible = true;
  lidG.traverse(function (m) {
    if (!m.material) return;
    (Array.isArray(m.material) ? m.material : [m.material]).forEach(function (mt) {
      if (mt.userData.lidCut) mt.visible = g < 0.5 && STRUCT.myo.on;
    });
  });
  refreshOpacity();
}

/* ---------- Kamera (wie im Nephron-Modell) ---------- */
var orbit = Kern.orbit(canvas, view, { minDist: 7, maxDist: 120 });
var cardK = 1;
function updateCamera() {
  var goal = (window.innerWidth >= 1000 && cardOpen()) ? 1.12 : 1;
  cardK += (goal - cardK) * 0.2; if (Math.abs(goal - cardK) < 0.002) cardK = goal;
  Kern.kamera(camera, view, cardK);
}
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
function inLid(o) { while (o) { if (o === lidG) return true; o = o.parent; } return false; }
canvas.addEventListener('click', function (e) {
  if (orbit.dragged || !App.ready) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var glas = App.openK > 0.5;
  var hits = ray.intersectObjects(App.pick.filter(function (m) { return shown(m) && !(glas && inLid(m)); }), false), sid = null;
  for (var i = 0; i < hits.length; i++) {
    var h = hits[i], m = h.object;
    if (m === blood) { if (h.instanceId === undefined) continue; sid = blood.userData.col[h.instanceId] === 1 ? 'blutR' : 'blutB'; break; }
    var mt = Array.isArray(m.material) ? m.material[h.face.materialIndex] : m.material;
    if (!mt.visible || mt.opacity < 0.2) continue;
    sid = m.userData.sid;
    if (m.userData.tissue && h.face.materialIndex === 2 && (sid === 'lv' || sid === 'rv' || sid === 'la' || sid === 'ra')) sid = 'myo';
    break;
  }
  if (App.quiz) { quizAnswer(sid); return; }
  if (LUPE.mode || LUPE.open) { var hp = hits.length ? hits[0].point.clone() : null; if (sid) lupeFromStruct(sid, hp); return; }
  setSelected(sid);
});
window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (App.quiz) quizEnd(); else { setSelected(null); closeCard(); } } });

/* =====================================================================
   8. Herzzyklus: EKG und Anzeige
   ===================================================================== */
var ekg = $('ekg'), ectx = ekg.getContext('2d');
function ekgSize() { var d = Math.min(window.devicePixelRatio || 1, 2); ekg.width = Math.round((ekg.clientWidth || 400) * d); ekg.height = Math.round((ekg.clientHeight || 92) * d); ectx.setTransform(d, 0, 0, d, 0, 0); }
function drawEKG(pos) {
  var b = ekg.clientWidth, h = ekg.clientHeight; if (!b || !h) return;
  var L = 6, br = b - 12, base = h * 0.58, amp = h * 0.42, small = h < 70, fl = engine.flimmern(), tz = engine.flimT, st = engine.S.par.infarkt;
  ectx.clearRect(0, 0, b, h);
  HerzZyklus.FELDER.forEach(function (f) {
    var on = pos >= f.von && pos < f.bis;
    ectx.fillStyle = on ? 'rgba(224,169,74,0.13)' : 'rgba(255,255,255,0.02)';
    ectx.fillRect(L + f.von * br, 2, (f.bis - f.von) * br - 1, h - (small ? 4 : 18));
    if (!small) {
      ectx.fillStyle = on ? '#E0A94A' : '#5E7883';
      ectx.font = '500 9.5px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
      ectx.textAlign = 'center';
      var nm = f.name.toUpperCase(), wmax = (f.bis - f.von) * br - 6;
      if (ectx.measureText(nm).width > wmax) nm = nm.split(' ')[0];
      ectx.fillText(nm, L + (f.von + f.bis) / 2 * br, h - 5);
    }
  });
  ectx.strokeStyle = '#23414D'; ectx.lineWidth = 1; ectx.beginPath(); ectx.moveTo(L, base); ectx.lineTo(L + br, base); ectx.stroke();
  ectx.strokeStyle = '#E7EFF0'; ectx.lineWidth = 1.8; ectx.lineJoin = 'round'; ectx.beginPath();
  for (var i = 0; i <= 300; i++) { var x = i / 300, px = L + x * br, py = base - HerzZyklus.ekgKurve(x, fl, tz, st) * amp; if (i) ectx.lineTo(px, py); else ectx.moveTo(px, py); }
  ectx.stroke();
  if (App.impulse && !small) {
    ectx.fillStyle = '#F2C94C'; ectx.font = '600 11px ui-monospace, Menlo, Consolas, monospace'; ectx.textAlign = 'center';
    var wl = [[0.06, fl > 0.5 ? 'f' : 'P', 0, 0], [0.188, 'QRS', 20, 1], [0.40, 'T', 0, 0]];
    if (st > 0.5) wl.push([0.30, 'ST', 0, 0]);
    wl.forEach(function (w) {
      var yy = w[3] ? 14 : base - HerzZyklus.ekgKurve(w[0], fl, tz, st) * amp - 7;
      ectx.fillText(w[1], L + w[0] * br + w[2], yy);
    });
  }
  var dx = L + pos * br, dy = base - HerzZyklus.ekgKurve(pos, fl, tz, st) * amp;
  ectx.strokeStyle = 'rgba(224,169,74,0.55)'; ectx.lineWidth = 1; ectx.beginPath(); ectx.moveTo(dx, 3); ectx.lineTo(dx, h - (small ? 3 : 18)); ectx.stroke();
  ectx.fillStyle = '#C8342F'; ectx.beginPath(); ectx.arc(dx, dy, 5.5, 0, Math.PI * 2); ectx.fill();
  ectx.strokeStyle = '#FFFFFF'; ectx.lineWidth = 1.6; ectx.stroke();
}
var lastPh = '', lastRead = '';
function updatePanel(W) {
  var ph = engine.phase();
  if (ph !== lastPh) { lastPh = ph; $('phT').textContent = INFO.phases[ph].t; $('phX').textContent = INFO.phases[ph].x; $('arPhase').textContent = INFO.phases[ph].t; }
  var two = function (r, l) { return r === l ? (r ? 'offen' : 'zu') : (r ? 'rechts offen, links zu' : 'rechts zu, links offen'); };
  var seg = two(W.tv > 0.5, W.mv > 0.5), tas = two(W.pv > 0.5, W.av > 0.5 * engine.S.par.avOeffnung);   // (enge Aortenklappe: Gewicht ist skaliert, Schwelle auch)
  var wk = engine.S.windkessel ? engine.imWK + (engine.imWK === 1 ? ' Portion' : ' Portionen') : 'starr \u2013 speichert nichts';
  var lv = Math.round(engine.speicher.lv) + ' Portionen';
  var key = seg + '|' + tas + '|' + wk + '|' + lv;
  if (key === lastRead) return; lastRead = key;
  $('kSeg').textContent = seg; $('kSeg').className = seg === 'zu' ? '' : 'auf';
  $('kTas').textContent = tas; $('kTas').className = tas === 'zu' ? '' : 'auf';
  $('kWk').textContent = wk; $('kLv').textContent = lv;
}

/* =====================================================================
   9. Export, Hinweise
   ===================================================================== */
function toast(msg) { Kern.toast(msg); }
var TEMPO_NAME = { 0.6: 'langsam', 1: 'normal', 1.6: 'schnell' };
var exCfg = {
  titel: '3D-Herz', praefix: 'herz', wurzelName: 'Herz', schild: [0.3, -7.4, 1.2],
  bereit: function () { return App.ready; },
  gruppen: function () { return App.openK > 0.5 ? [backG] : [backG, lidG]; },
  get zusatzStatisch() { var sc = szenarioExport(); return sc ? sc.datei : ''; },
  toast: toast,
  /* beide Herzhälften als eigene STL-Dateien (Ausgangslage, ohne Morph/Ausblendung) */
  stlTeile: function () {
    var files = [];
    var tis = function (g) { var a = []; g.traverse(function (m) { if (m.isMesh && m.userData.tissue) a.push(m); }); return a; };
    var tb = tis(backG), tl = tis(lidG), all = tb.concat(tl);
    var inf0 = all.map(function (m) { return (m.morphTargetInfluences || []).slice(); });
    all.forEach(function (m) { if (m.morphTargetInfluences) m.morphTargetInfluences.fill(0); });
    var vis0 = all.map(function (m) { return m.visible; }), mv0 = [];
    all.forEach(function (m) { m.visible = true; (Array.isArray(m.material) ? m.material : [m.material]).forEach(function (x) { mv0.push([x, x.visible, x.opacity]); x.visible = true; x.opacity = 1; }); });
    files.push({ name: 'herz_teil1_hinten.stl', data: Kern.Export.stl(tb, false, '3D-Herz') });
    files.push({ name: 'herz_teil2_vorderwand.stl', data: Kern.Export.stl(tl, false, '3D-Herz') });
    all.forEach(function (m, i) { m.visible = vis0[i]; if (m.morphTargetInfluences) inf0[i].forEach(function (w, k) { m.morphTargetInfluences[k] = w; }); });
    mv0.forEach(function (e) { e[0].visible = e[1]; e[0].opacity = e[2]; });
    setLidPose(App.openK);
    return files;
  },
  /* Herzzyklus backen: Morph-Spuren der Klone, Blutportionen als Knoten */
  animation: function (rootE, clones) {
    var eng = App.engine;
    var tempo = TEMPO_NAME[eng.S.tempo] || 'normal';
    var sz = szenarioExport();
    var snaps = [], tracks = [], nPort = 0;
    var bake = eng.bake(30, function (i, w) { snaps.push(App.portionsNow ? App.portionsNow(w) : []); });
    var T = bake.T;
    var times = new Float32Array(bake.frames.length); bake.frames.forEach(function (f, i) { times[i] = i * bake.dt; });
    for (var q = 0; q < clones.length; q++) {
      var c = clones[q].c, m = clones[q].m;
      var d = m.userData.drivers; if (!d || !c.morphTargetInfluences || !c.morphTargetInfluences.length) continue;
      var vals = new Float32Array(bake.frames.length * d.length);
      bake.frames.forEach(function (f, i) { d.forEach(function (k, j) { vals[i * d.length + j] = f[k] || 0; }); });
      tracks.push(new THREE.NumberKeyframeTrack(c.name + '.morphTargetInfluences', times, vals));
      d.forEach(function (k, j) { c.morphTargetInfluences[j] = vals[j]; });
    }
    // Blutportionen: je Portion ein Knoten, unsichtbar = Größe 0
    var keys = new Map();
    snaps.forEach(function (list, i) { list.forEach(function (o) { if (!keys.has(o.key)) keys.set(o.key, { red: o.red, f: new Array(snaps.length).fill(null) }); keys.get(o.key).f[i] = o.p; }); });
    if (keys.size) {
      var geo = new THREE.SphereGeometry(0.27, 12, 8);
      var matR = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xC8342F).convertSRGBToLinear(), roughness: 0.35, metalness: 0 }); matR.name = 'Blut_sauerstoffreich';
      var matB = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x2F6FB5).convertSRGBToLinear(), roughness: 0.35, metalness: 0 }); matB.name = 'Blut_sauerstoffarm';
      var n = 0;
      keys.forEach(function (v, key) {
        var f = v.f.slice();
        // unsichtbare Schlüsselbilder an die nächste sichtbare Stelle legen (nichts fliegt quer durchs Bild)
        for (var i = 0; i < f.length; i++) if (!f[i]) { var a = i - 1; while (a >= 0 && !v.f[a]) a--; var b = i + 1; while (b < f.length && !v.f[b]) b++; f[i] = (b < f.length ? v.f[b] : (a >= 0 ? v.f[a] : [0, 0, 0])); }
        var node = new THREE.Mesh(geo, v.red ? matR : matB); node.name = 'Blutportion_' + (++n);
        node.position.set(f[0][0], f[0][1], f[0][2]); node.scale.setScalar(v.f[0] ? 1 : 0);
        rootE.add(node);
        var P = new Float32Array(f.length * 3), Sc = new Float32Array(f.length * 3);
        f.forEach(function (qq, i) { P[i * 3] = qq[0]; P[i * 3 + 1] = qq[1]; P[i * 3 + 2] = qq[2]; var e = v.f[i] ? 1 : 0; Sc[i * 3] = e; Sc[i * 3 + 1] = e; Sc[i * 3 + 2] = e; });
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.position', times, P));
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.scale', times, Sc, THREE.InterpolateDiscrete));
      });
      nPort = n;
    }
    return { clips: [new THREE.AnimationClip('Herzschlag_' + (sz ? sz.datei : tempo), bake.T, tracks)], zusatz: sz ? sz.datei : tempo, tempo: tempo, T: T, nPort: nPort };
  },
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    animStart: 'Herzzyklus wird aufgezeichnet …',
    stlLiesmich: ['Dateien (Maßstab Millimeter, Z-Achse nach oben):', '- herz_ansicht.stl: alles, was beim Export sichtbar war', '- herz_teil1_hinten.stl und herz_teil2_vorderwand.stl: die beiden Herzhälften zum getrennten Drucken und Zusammensetzen', 'Klappen, Sehnenfäden und Leitungsbahnen sind sehr dünn und für den 3D-Druck nur bedingt geeignet.', 'STL kennt weder Farbe noch Bewegung – dafür gibt es die GLB-Dateien.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Dateien, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Beide Herzhälften liegen einzeln bei – zum Drucken und Zusammensetzen.';
    },
    glbLiesmich: function (i) {
      return [i.anim ? i.name + ': ein kompletter Herzzyklus (Tempo ' + i.a.tempo + ', ' + i.a.T.toFixed(1).replace('.', ',') + ' s) als Animation, läuft in Schleife.' : i.name + ': farbiges 3D-Modell in der Ansicht beim Export.', 'Maßstab: Meter (reale Größe). Die Signatur steht in den Metadaten und auf dem Schild unter dem Herzen.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span>' +
        (i.anim ? '<br>Ein Herzzyklus mit Klappen, Windkessel und ' + i.a.nPort + ' Blutportionen, ' + i.a.T.toFixed(1).replace('.', ',') + ' s Schleife. Im Viewer die Wiedergabe starten.' : '<br>Nur Geometrie, mit Farben, ohne Bewegung.');
    }
  }
};
$('bGlbA').onclick = function () { Kern.Export.run('glb-anim', exCfg); };
$('bGlbS').onclick = function () { Kern.Export.run('glb', exCfg); };
$('bStl').onclick = function () { Kern.Export.run('stl', exCfg); };

/* =====================================================================
   10. Renderschleife
   ===================================================================== */
var focusX = 0, focusGoal = 0;
function focusOffset(w, h) {
  if (w < 1000) { var top = 170, bot = h - h * 0.34 - 150; return { x: 0, y: h / 2 - (top + Math.max(top + 120, bot)) / 2 }; }
  var xMin = 282 + 150, xMax = w - 22 - 160 - (cardOpen() ? 342 : 0);
  return { x: w / 2 - (xMin + xMax) / 2, y: h / 2 - (96 + h - 30) / 2 };
}
function applyOffset() {
  var w = window.innerWidth, h = window.innerHeight, o = focusOffset(w, h);
  focusGoal = o.x;
  focusX += (focusGoal - focusX) * 0.22; if (Math.abs(focusGoal - focusX) < 0.5) focusX = focusGoal;
  camera.setViewOffset(w, h, focusX, o.y, w, h);
  camera.updateProjectionMatrix();
}
function fitRail() {
  if (window.innerWidth >= 1000) { var zt = $('zyk').getBoundingClientRect().top; $('rail').style.maxHeight = Math.max(160, zt - 12 - 124) + 'px'; } else $('rail').style.maxHeight = '';
}
function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  focusX = focusOffset(w, h).x; applyOffset();
  if (w < 1000) {
    var free = Math.max(160, (h - h * 0.34 - 150) - 170), pxcm = free / 17.5, fd = h / (2 * Math.tan(19 * Math.PI / 180) * pxcm);
    var wcm = (w - 40) / 14.5, fdw = h / (2 * Math.tan(19 * Math.PI / 180) * wcm);
    var nd = Math.max(fd, fdw);
    if (Math.abs(nd - fitDist) > 0.5) { view.dist *= nd / fitDist; fitDist = nd; }
  } else if (fitDist !== 34.5) { view.dist *= 34.5 / fitDist; fitDist = 34.5; }
  fitRail();
  Kern.linienFlaeche(leaderSvg, w, h);
  ekgSize();
  LABELS.forEach(function (a) { a.key = ''; });
}
window.addEventListener('resize', resize);
resize();

var last = performance.now();
function loop(now, frame) {
  if (App.ar) AR.frame(frame);
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (SZ.schritt(dt)) szenarioWirkung();                   /* Anteile weich \u00fcberblenden */
  if (App.ready) {
    engine.step(dt);
    if (engine.events.length) { if (App.sound) engine.events.forEach(function (ev) { if (ev === 'S1') thump(48, 0.16, 0.9); else thump(74, 0.11, 0.7); }); engine.events.length = 0; }
    var W = engine.weights();
    App.W = W;
    for (var i = 0; i < App.morph.length; i++) { var m = App.morph[i], d = m.userData.drivers, inf = m.morphTargetInfluences; for (var k = 0; k < d.length; k++) inf[k] = W[d[k]] || 0; }
    cond.uTau.value = W.pos;
    updateBlood(W);
    if (App.impulse) { updateEmissive(W.pos); updateSparks(W.pos, W, now); updateErr(W.pos); }
    if (App.schema) HerzSchema.update(engine, W, WEGE, { focus: App.focus });
    lupeTick(dt, W);
    var fokCh = stepFocus(dt);
    updatePanel(W);
    drawEKG(W.pos);
    var tg = App.opened ? 1 : 0;
    var fg = (App.preset === 1 || VALVES.indexOf(App.sel) >= 0) ? 0.3 : 1;
    var fch = vesFade !== fg;
    if (fch) { vesFade += (fg - vesFade) * Math.min(1, dt * 6); if (Math.abs(fg - vesFade) < 0.01) vesFade = fg; }
    if (App.openK !== tg) { App.openK = clamp(App.openK + Math.sign(tg - App.openK) * dt / 1.1, 0, 1); setLidPose(App.openK); }
    else if (fch || fokCh) refreshOpacity();
  }
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  root.updateMatrixWorld();
  CLIP.copy(CLIP0).applyMatrix4(root.matrixWorld); CLIP_PV.copy(CLIP_PV0).applyMatrix4(root.matrixWorld); CLIP_ERL.copy(CLIP_ERL0).applyMatrix4(root.matrixWorld);
  if (App.ar) { if (App.ready) { ARL.update(); renderer.render(scene, camera); } return; }
  updateCamera();
  if (App.ready && !App.schema) { applyOffset(); renderer.render(scene, camera); layoutLabels(window.innerWidth, window.innerHeight); }
}
App.dbgFade = function (v) { vesFade = v; applyBackOpacity(App.openK); LABELS.forEach(function (a) { a.key = ''; }); };
App.dbg = function () { return { vesFade: vesFade, preset: App.preset, openK: App.openK }; };
App.dbgFocusNow = function () { [backG, lidG].forEach(function (G) { G.traverse(function (m) { if (m.isMesh) m.userData.fk = focusTarget(m); }); }); refreshOpacity(); };
App.api = { setSelected: setSelected, goTo: goTo, setLidPose: setLidPose, openHelp: openHelp, quizStart: quizStart, quizEnd: quizEnd, setHand: setHand, setWK: setWK, view: view, camera: camera, scene: scene, backG: backG, lidG: lidG };
renderer.setAnimationLoop(loop);
build().then(function () {
  buildStructList();
  addStationLabels();
  buildLupe();
  arUIbind(); AR.check();
  applyVisibility();
  setLidPose(App.openK);
  App.ready = true;
  Kern.Export.pruefeZiel('exp');
  $('boot').classList.add('gone');
}).catch(function (e) { console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
})();
