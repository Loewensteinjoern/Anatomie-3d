/* =====================================================================
   Nephron - Nierenkoerperchen und Tubulussystem
   Didaktische Fassung: Blut bringt Wasser mit, Wasser tritt aus,
   geloeste Teilchen im Gewebe ziehen es ins Blutgefaess zurueck.
   ===================================================================== */
(function () {
'use strict';
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Nephron &middot; funktionelle Einheit der Niere</div>
  <h1>Nierenk&ouml;rperchen &amp; <em>Tubulus</em></h1>
  <div class="sub">Das Blut bringt das Wasser mit &ndash; und holt es sich zur&uuml;ck.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">&Uuml;bersicht</button>
    <button id="cam1" class="gh">Nierenk&ouml;rperchen</button>
    <button id="cam2" class="gh">Henle-Schleife</button>
    <button id="cam3" class="gh">Sammelrohr</button>
    <span class="sep"></span>
    <button id="bLupe" class="gh" title="Lupe: Nahansicht eines Abschnitts">Lupe</button>
    <button id="bAR" class="gh" title="Das Nephron mit der Kamera in den Raum stellen">AR</button>
  </div>
  <div class="trow">
    <span class="cap">Str&ouml;mung</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bS0" class="gh">langsam</button>
    <button id="bS1" class="gh on">normal</button>
    <button id="bS2" class="gh">schnell</button>
    <span class="sep"></span>
    <button id="bSee" class="gh on" title="Tubulus durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <div id="ramp"></div>
  <div class="sc"><span>verd&uuml;nnt</span><span>Inhalt des Rohrs</span><span>konzentriert</span></div>
  <p><b style="color:#C0303C">Rot</b> Blutzellen &ndash; bleiben im Gef&auml;&szlig;.<br>
  <b style="color:#3A9BEA">Blau</b> Wasser &ndash; kommt mit dem Blut, wird im Kn&auml;uel abgepresst und folgt dem Salz zur&uuml;ck ins Blut.<br>
  <b style="color:#B98BD9">Violett</b> Salz &ndash; im Blut gel&ouml;st, wird mit abgepresst und zur&uuml;ckgeholt. Wo Salz ist, zieht es Wasser hin.</p>
  <p id="legDrug" style="display:none"><b style="color:#33E0A0">Gr&uuml;n</b> Torasemid &ndash; wird ins Rohr ausgeschieden und blockiert die Salzpumpe im aufsteigenden Schenkel.</p>
  <p id="legGluc" style="display:none"><b style="color:#F5B301">Gelb</b> Zucker (Sechsring) &ndash; bleibt bei Hyperglyk&auml;mie im Rohr und h&auml;lt das Wasser fest.</p>
  <p class="note">Gef&auml;&szlig;e und Tubulus sind durchscheinend: Im Tubulus flie&szlig;en Wasser und Salz, die Blutzellen bleiben in den Gef&auml;&szlig;en.</p>
</div>

<div class="panel" id="exp">
  <span class="tag">Export</span>
  <button id="bGlbA" class="gh">GLB &middot; animiert</button>
  <button id="bGlbS" class="gh">GLB &middot; statisch</button>
  <button id="bStl" class="gh">STL</button>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>

<div id="arUI" aria-live="polite">
  <div class="ar-top"><span class="ar-title">Nephron in AR</span><span class="ar-phase" id="arPhase"></span><button class="ar-b" id="arEnd">Beenden</button></div>
  <div class="ar-hint" id="arHint">Bewege das Gerät langsam über den Tisch, bis ein Ring erscheint &ndash; dann tippen, um das Nephron hinzustellen.</div>
  <div class="ar-bot">
    <button class="ar-b" id="arSee">Undurchsichtig</button>
    <button class="ar-b" id="arLab">Beschriftung aus</button>
    <button class="ar-b" id="arSmall">Kleiner</button>
    <button class="ar-b" id="arBig">Gr&ouml;&szlig;er</button>
    <button class="ar-b" id="arPlace">Neu hinstellen</button>
    <button class="ar-b" id="arPause">Pause</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
function smooth(pts, n) {
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5).getSpacedPoints(n);
}
/* Glatter Abschnitt mit Nachbarpunkten: Die Kurve wird durch [prev, pts..., next]
   gelegt, ausgegeben wird nur das Stueck zwischen erstem und letztem Punkt von pts.
   So stossen benachbarte Rohrabschnitte ohne Knick und ohne Kerbe aneinander. */
function smoothSeg(pts, n, prev, next) {
  var all = (prev ? [prev] : []).concat(pts, next ? [next] : []);
  var c = new THREE.CatmullRomCurve3(all, false, 'catmullrom', 0.5);
  c.arcLengthDivisions = Math.max(400, all.length * 60);
  var N = all.length, D = c.arcLengthDivisions, L = c.getLengths(D);
  function uAt(idx) { var k = idx / (N - 1) * D, k0 = Math.min(D - 1, Math.floor(k)); return (L[k0] + (L[k0 + 1] - L[k0]) * (k - k0)) / L[D]; }
  var u0 = prev ? uAt(1) : 0, u1 = next ? uAt(N - 2) : 1, out = [];
  for (var i = 0; i <= n; i++) out.push(c.getPointAt(u0 + (u1 - u0) * i / n));
  return out;
}
/* ---------------------------------------------------------------------
   Bahnen des Nephrons: Kontrollpunkte und Radien in Nephron-Koordinaten (Einheit = Modelleinheit, Nephron ca. 17 lang). Reine Funktion
   (kein Zufall, keine three.js-Objekte ausser Vektoren): das Modell (aufbauen) und organ.form.bahnen (Niere) nutzen dieselben Werte.
   --------------------------------------------------------------------- */
function bahnenDef() {
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var DEG = Math.PI / 180;
var GC = V(0, 5.80, 0), GR = 1.45, RO = GR + 0.05, RI = GR - 0.05;
var POLE = V(-1.42, 5.78, 0);
var AX = V(0.880, -0.440, 0.180).normalize();               // Achse zum Harnpol
var AU = V(0, 0, 1).addScaledVector(AX, -AX.z).normalize(); // Fenster zeigt nach vorn
var AW = new THREE.Vector3().crossVectors(AX, AU).normalize();
var TH0 = 27 * DEG, NECK_L = 1.02, NECK_R = 0.30, WALL = 0.048;
var MOUTH = GC.clone().addScaledVector(AX, RO * Math.cos(TH0) + NECK_L);
var WIN = 66 * DEG;                                           // halbe Fensterbreite

/* Gefaesspol: hier tritt die zufuehrende Arteriole ein und teilt sich,
   daneben verlaesst die abfuehrende Arteriole das Knaeuel. */
var HUB = GC.clone().add(V(-1.18, 0, 0));
var HA = HUB.clone().add(V(0, 0.13, 0.04));
var HE = HUB.clone().add(V(0, -0.15, -0.04));

var AFF = [V(-5.40, 7.60, 0.50), V(-3.60, 7.00, 0.30), V(-2.40, 6.32, 0.10), V(-1.66, 6.00, 0.06), HA.clone()];
var EFF = [HE.clone(), V(-1.66, 5.58, -0.08), V(-2.22, 5.16, -0.20), V(-2.92, 4.48, -0.35)];
var VASA = [
  V(-2.92, 4.48, -0.35), V(-1.70, 3.70, -0.95), V(0.40, 2.75, -1.05), V(2.30, 1.75, -1.02),
  V(3.02, -0.50, -0.98), V(3.10, -3.50, -0.96), V(3.05, -6.50, -0.94),
  V(2.55, -8.55, -0.92), V(1.40, -8.95, -0.92), V(0.25, -8.45, -0.92),
  V(-0.15, -6.00, -0.94), V(-0.20, -3.00, -0.96), V(-0.25, 0.00, -0.96),
  V(-0.38, 2.60, -0.98), V(-1.00, 4.35, -1.60), V(-2.05, 6.25, -1.52), V(-3.65, 7.65, -1.15)
];
/* Windungen so weich, dass das Rohr sich nirgends selbst durchdringt
   (engste Kurve 1,09-mal so weit wie der Rohrradius). */
var PROX = [MOUTH.clone(), V(2.56, 4.52, 0.54), V(3.10, 4.72, 0.72), V(3.60, 5.28, 0.40), V(4.14, 5.30, -0.12),
            V(4.56, 4.74, -0.08), V(4.38, 4.10, 0.25), V(3.74, 3.78, 0.32), V(3.10, 3.55, -0.02),
            V(2.62, 3.06, 0.14), V(2.30, 2.55, 0)];
var DESC = [V(2.30, 2.55, 0), V(2.20, 0.60, 0.10), V(2.10, -1.80, 0), V(2.02, -4.20, 0.08), V(1.96, -6.40, 0)];
var LOOP = [V(1.96, -6.40, 0), V(1.90, -7.45, 0), V(1.42, -8.05, 0), V(0.85, -7.55, 0), V(0.72, -6.55, 0)];
var ASC = [V(0.72, -6.55, 0), V(0.72, -4.20, -0.08), V(0.76, -1.60, 0), V(0.82, 1.00, 0.06),
           V(0.95, 3.20, -0.18), V(0.10, 4.10, -0.95), V(-0.90, 4.35, -1.05), V(-1.50, 5.28, -0.86)];
var DIST = [V(-1.50, 5.28, -0.86), V(-1.55, 6.30, -1.05), V(-0.60, 7.30, -0.95), V(0.90, 7.35, -0.95),
            V(2.60, 7.50, -0.60), V(4.12, 6.90, -0.62), V(5.50, 5.85, -0.32)];
var COLL = [V(5.50, 5.85, -0.32), V(5.85, 4.90, -0.12), V(5.92, 2.50, 0), V(5.96, -0.50, 0),
            V(5.98, -3.50, 0), V(6.00, -6.50, 0), V(6.02, -8.90, 0)];
/* Aufsteigendes Vas rectum neben dem Sammelrohr: nimmt das Wasser aus dem
   Mark auf und bringt es nach oben zurueck in den Kreislauf. */
var CAPC = [V(5.12, -8.55, -0.52), V(5.10, -6.00, -0.56), V(5.08, -3.00, -0.58), V(5.06, 0.00, -0.58),
            V(5.04, 2.10, -0.62), V(4.92, 3.30, -1.05), V(4.80, 3.75, -2.25)];
/* Rohrradien je Abschnitt (gleichmaessig ueber die Laenge verteilt) */
var RAD = { afferens: [0.25, 0.24, 0.22, 0.2, 0.17], efferens: [0.13, 0.14, 0.145, 0.15],
  prox: [0.30, 0.29, 0.27, 0.25, 0.23], desc: [0.23, 0.16, 0.15, 0.15, 0.15], loop: [0.15, 0.15, 0.15], asc: [0.15, 0.20, 0.24, 0.24, 0.24],
  dist: [0.23, 0.22, 0.22, 0.23], coll: [0.23, 0.36, 0.40, 0.44, 0.46] };
return { GC: GC, GR: GR, RO: RO, RI: RI, POLE: POLE, AX: AX, AU: AU, AW: AW, TH0: TH0, NECK_L: NECK_L, NECK_R: NECK_R, WALL: WALL, MOUTH: MOUTH, WIN: WIN,
  HUB: HUB, HA: HA, HE: HE, AFF: AFF, EFF: EFF, VASA: VASA, PROX: PROX, DESC: DESC, LOOP: LOOP, ASC: ASC, DIST: DIST, COLL: COLL, CAPC: CAPC, RAD: RAD };
}

/* Startansicht des Modells (Kamera in Nephron-Koordinaten, ohne Versatz des Bildbereichs): gemeinsam fuer das Modell (aufbauen) und den
   Andockpunkt organ.start (Kamerafahrt aus der Niere), damit Fahrt-Ende und Modell zusammenpassen */
var START = { theta: 0.26, phi: 1.46, dist: 27, target: [1.2, -0.5, 0], versatz: [0, 0] };
/* Hintergrundtafel Rinde/Mark: Breite, Hoehe, Mitte (x, y), Tiefe z; grenze = y der Grenze Rinde/Mark */
var TAFEL = { b: 14.4, h: 18.2, mx: 0.5, my: -0.6, z: -2.6, grenze: 3 };
var organ = { renderer: {}, aufbauen: aufbauen };
/* Startansicht bei Fenstergroesse w x h: die Werte, mit denen aufbauen die Uebersicht zeigt (hier unabhaengig von der Fenstergroesse,
   kein Versatz des Bildbereichs) */
organ.start = function (w, h) {
  return { theta: START.theta, phi: START.phi, dist: START.dist, target: START.target.slice(), versatz: START.versatz.slice() };
};
/* Form fuer die Niere (Kern.Organe.nephron.form): Mittellinien der Bahnen aus denselben Kontrollpunkten wie das Modell (bahnenDef).
   Jede Bahn: id, pts (Punktliste [x, y, z] in Nephron-Koordinaten), r (Radien gleichmaessig ueber die Laenge). glomerulus: Mitte und
   Radius der Kugel (Nierenkoerperchen). tafel: Grenzen der Hintergrundtafel (x0, x1, y0, y1, z, grenze = Rinde/Mark). Kein Zufall. */
organ.form = {
  START: START,
  tafel: { x0: TAFEL.mx - TAFEL.b / 2, x1: TAFEL.mx + TAFEL.b / 2, y0: TAFEL.my - TAFEL.h / 2, y1: TAFEL.my + TAFEL.h / 2, z: TAFEL.z, grenze: TAFEL.grenze },
  bahnen: function () {
    var B = bahnenDef(), arr = function (p) { return [p.x, p.y, p.z]; };
    function laenge(pts) { var l = 0; for (var i = 1; i < pts.length; i++) l += pts[i].distanceTo(pts[i - 1]); return l; }
    function bahn(id, pts, prev, next, r) {   /* geglaettet wie im Modell (smoothSeg), etwa alle 0,4 Einheiten ein Punkt */
      var n = Math.max(6, Math.ceil(laenge(pts) / 0.4));
      return { id: id, pts: smoothSeg(pts, n, prev, next).map(arr), r: r.slice() };
    }
    return {
      glomerulus: { mitte: arr(B.GC), r: B.GR },
      linien: [
        bahn('afferens', B.AFF, null, null, B.RAD.afferens),
        bahn('efferens', B.EFF, null, null, B.RAD.efferens),
        bahn('prox', B.PROX, null, B.DESC[1], B.RAD.prox),
        bahn('desc', B.DESC, B.PROX[B.PROX.length - 2], B.LOOP[1], B.RAD.desc),
        bahn('loop', B.LOOP, B.DESC[B.DESC.length - 2], B.ASC[1], B.RAD.loop),
        bahn('asc', B.ASC, B.LOOP[B.LOOP.length - 2], B.DIST[1], B.RAD.asc),
        bahn('dist', B.DIST, B.ASC[B.ASC.length - 2], B.COLL[1], B.RAD.dist),
        bahn('coll', B.COLL, B.DIST[B.DIST.length - 2], null, B.RAD.coll)
      ]
    };
  }
};
function aufbauen(umg) {
umg.bereich.innerHTML = MARKUP;

var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var DEG = Math.PI / 180;
var DUR = 12.0;    // Sekunden pro Umlauf
var NKEY = 120;    // Stuetzstellen, teilbar durch alle Teilchenzahlen

/* =====================================================================
   1. Geometrie-Werkzeuge
   ===================================================================== */
/* Laplace-Glaettung mit festen Enden: nimmt engen Kurven die Schaerfe */
function relax(pts, iters, lam) {
  var p = pts.map(function (q) { return q.clone(); }), n = p.length, i, it;
  for (it = 0; it < iters; it++) {
    var q = p.map(function (v) { return v.clone(); });
    for (i = 1; i < n - 1; i++) q[i].copy(p[i]).multiplyScalar(1 - lam).addScaledVector(p[i - 1].clone().add(p[i + 1]), lam / 2);
    p = q;
  }
  return p;
}
function lerpArr(arr, n) {
  var out = [], i;
  for (i = 0; i <= n; i++) {
    var t = i / n * (arr.length - 1), i0 = Math.floor(t),
        i1 = Math.min(arr.length - 1, i0 + 1), f = t - i0;
    out.push(arr[i0] * (1 - f) + arr[i1] * f);
  }
  return out;
}
function frames(pts) {
  var n = pts.length, T = [], N = [], B = [], i;
  for (i = 0; i < n; i++) {
    var t;
    if (i === 0) t = pts[1].clone().sub(pts[0]);
    else if (i === n - 1) t = pts[n - 1].clone().sub(pts[n - 2]);
    else t = pts[i + 1].clone().sub(pts[i - 1]);
    if (t.lengthSq() < 1e-12) t.set(0, 1, 0);
    T.push(t.normalize());
  }
  var seed = V(0, 0, 1);
  if (Math.abs(seed.dot(T[0])) > 0.9) seed.set(0, 1, 0);
  N[0] = new THREE.Vector3().crossVectors(T[0], seed).normalize();
  for (i = 1; i < n; i++) {
    var v = N[i - 1].clone();
    v.addScaledVector(T[i], -v.dot(T[i]));
    if (v.lengthSq() < 1e-8) v.crossVectors(T[i], V(0, 1, 0));
    N[i] = v.normalize();
  }
  for (i = 0; i < n; i++) B[i] = new THREE.Vector3().crossVectors(T[i], N[i]).normalize();
  return { T: T, N: N, B: B };
}

/* Roehre mit veraenderlichem Radius, optional Farbe je Stuetzpunkt */
function tube(pts, radii, seg, capA, capB, cols) {
  seg = seg || 12;
  var n = pts.length, i, j, f = frames(pts);
  var pos = [], nor = [], col = [], idx = [];
  for (i = 0; i < n; i++) {
    var r = radii[i];
    for (j = 0; j <= seg; j++) {
      var th = 2 * Math.PI * j / seg, c = Math.cos(th), s = Math.sin(th);
      var nx = f.N[i].x * c + f.B[i].x * s, ny = f.N[i].y * c + f.B[i].y * s, nz = f.N[i].z * c + f.B[i].z * s;
      pos.push(pts[i].x + r * nx, pts[i].y + r * ny, pts[i].z + r * nz);
      nor.push(nx, ny, nz);
      if (cols) col.push(cols[i].r, cols[i].g, cols[i].b);
    }
  }
  /* Wicklung so, dass die Flaechen nach aussen zeigen - passend zu den Normalen.
     (Frueher umgekehrt: dann fehlte die vordere Wand und Slicer sahen die
     Roehren von innen nach aussen gestuelpt.) */
  for (i = 0; i < n - 1; i++) for (j = 0; j < seg; j++) {
    var a = i * (seg + 1) + j, b = a + 1, c2 = a + seg + 1, d = c2 + 1;
    idx.push(a, b, c2, b, d, c2);
  }
  function cap(ring, dir, tv) {
    var ci = pos.length / 3;
    pos.push(pts[ring].x, pts[ring].y, pts[ring].z);
    nor.push(tv.x * dir, tv.y * dir, tv.z * dir);
    if (cols) col.push(cols[ring].r, cols[ring].g, cols[ring].b);
    for (var k = 0; k < seg; k++) {
      var v0 = ring * (seg + 1) + k, v1 = v0 + 1;
      if (dir > 0) idx.push(ci, v0, v1); else idx.push(ci, v1, v0);
    }
  }
  if (capA) cap(0, -1, f.T[0]);
  if (capB) cap(n - 1, 1, f.T[n - 1]);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (cols) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}
function flatCols(hex, n) {
  var c = new THREE.Color(hex).convertSRGBToLinear(), out = [];
  for (var i = 0; i < n; i++) out.push(c);
  return out;
}

function helixAround(pts, offFn, turns, phase) {
  var f = frames(pts), out = [], n = pts.length;
  for (var i = 0; i < n; i++) {
    var t = i / (n - 1), a = (phase || 0) + turns * 2 * Math.PI * t, o = offFn(t);
    out.push(pts[i].clone()
      .addScaledVector(f.N[i], o * Math.cos(a))
      .addScaledVector(f.B[i], o * Math.sin(a)));
  }
  return out;
}

/* Rotationsschale um eine freie Achse, mit Wandstaerke, Sichtfenster und
   eigenen Farben fuer Aussen-, Innenwand und Schnittkante. */
function revShell(c, A, U, W, prof, phi0, phiLen, nPhi, colO, colI, colR) {
  var pos = [], col = [], idx = [], i, j, base;
  function P(ax, rad, ph) {
    var cp = Math.cos(ph), sp = Math.sin(ph);
    return [c.x + A.x * ax + rad * (cp * U.x + sp * W.x),
            c.y + A.y * ax + rad * (cp * U.y + sp * W.y),
            c.z + A.z * ax + rad * (cp * U.z + sp * W.z)];
  }
  function push(p, cc) { pos.push(p[0], p[1], p[2]); col.push(cc.r, cc.g, cc.b); }
  function sheet(ka, kr, flip, cc) {
    base = pos.length / 3;
    for (i = 0; i < prof.length; i++)
      for (j = 0; j <= nPhi; j++) push(P(prof[i][ka], prof[i][kr], phi0 + phiLen * j / nPhi), cc);
    for (i = 0; i < prof.length - 1; i++) for (j = 0; j < nPhi; j++) {
      var a = base + i * (nPhi + 1) + j, b = a + 1, q = a + nPhi + 1, d = q + 1;
      if (flip) idx.push(a, b, q, b, d, q); else idx.push(a, q, b, b, q, d);
    }
  }
  sheet('ao', 'ro', false, colO);
  sheet('ai', 'ri', true, colI);
  [0, prof.length - 1].forEach(function (pi, e) {
    base = pos.length / 3;
    for (j = 0; j <= nPhi; j++) {
      var ph = phi0 + phiLen * j / nPhi;
      push(P(prof[pi].ao, prof[pi].ro, ph), colR);
      push(P(prof[pi].ai, prof[pi].ri, ph), colR);
    }
    for (j = 0; j < nPhi; j++) {
      var a = base + j * 2, b = a + 1, q = a + 2, d = a + 3;
      if (e === 0) idx.push(a, b, q, b, d, q); else idx.push(a, q, b, b, q, d);
    }
  });
  [0, nPhi].forEach(function (edge, e) {
    var ph = phi0 + phiLen * edge / nPhi;
    base = pos.length / 3;
    for (i = 0; i < prof.length; i++) {
      push(P(prof[i].ao, prof[i].ro, ph), colR);
      push(P(prof[i].ai, prof[i].ri, ph), colR);
    }
    for (i = 0; i < prof.length - 1; i++) {
      var a = base + i * 2, b = a + 1, q = a + 2, d = a + 3;
      if (e === 0) idx.push(a, b, q, b, d, q); else idx.push(a, q, b, b, q, d);
    }
  });
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  var nn = g.attributes.normal.array;
  for (i = 0; i < nn.length; i += 3) {
    var l = nn[i] * nn[i] + nn[i + 1] * nn[i + 1] + nn[i + 2] * nn[i + 2];
    if (!isFinite(l) || l < 1e-10) { nn[i] = 0; nn[i + 1] = 1; nn[i + 2] = 0; }
  }
  return g;
}

function arrowGeom(a, dir, len, r) {
  var d = dir.clone().normalize();
  return tube([a.clone(),
               a.clone().addScaledVector(d, len * 0.56),
               a.clone().addScaledVector(d, len * 0.565),
               a.clone().addScaledVector(d, len)],
              [r, r, r * 2.9, 0.005], 10, true, true);
}

/* Mehrere Geometrien zu einer zusammenfassen: weniger Zeichenaufrufe,
   fluessiger auf den Tablets, und ein einziges Objekt im Export. */
function mergeGeos(list) {
  var withCol = list.every(function (g) { return !!g.attributes.color; });
  var pos = [], nor = [], col = [], idx = [], base = 0;
  list.forEach(function (g) {
    var p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color, ix = g.index, i;
    for (i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      if (withCol) col.push(c.getX(i), c.getY(i), c.getZ(i));
    }
    if (ix) for (i = 0; i < ix.count; i++) idx.push(base + ix.getX(i));
    else for (i = 0; i < p.count; i++) idx.push(base + i);
    base += p.count;
  });
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (withCol) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

function dotCloud(pts, r) {
  var list = pts.map(function (p) {
    var s = new THREE.SphereGeometry(r, 8, 6);
    s.translate(p.x, p.y, p.z);
    return s;
  });
  return mergeGeos(list);
}

/* =====================================================================
   2. Szene, Licht, Material
   ===================================================================== */
var canvas = umg.canvas;
var renderer = umg.renderer;

var scene = umg.szene;
var camera = umg.kamera;
var view = { theta: START.theta, phi: START.phi, dist: START.dist, target: V(START.target[0], START.target[1], START.target[2]) };

var envTex = umg.envTex;

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
function conc(m) {
  var t = Math.max(0, Math.min(1, (m - 100) / 1100));
  t = Math.pow(t, 0.78);
  return new THREE.Color(0xF3EEDC).lerp(new THREE.Color(0xAE7C1C), t).convertSRGBToLinear();
}
function concRamp(a, b, n) {
  var out = [];
  for (var i = 0; i <= n; i++) out.push(conc(a + (b - a) * i / n));
  return out;
}

var COL = {
  bowman: 0xB9A49C, visceral: 0xD8BCAE, glomerulus: 0xE39088,
  afferens: 0xD65A4A, efferens: 0xA8453A, macula: 0x74B189,
  peritub: 0xC8707A, vasa: 0xA87890, solute: 0x9C7BC6, grad: 0x4A2E28,
  flowBlood: 0x8E0A16, flowWater: 0x2E9BFF, flowSalt: 0xC266FF, flowGluc: 0xF5B301, flowDrug: 0x33E0A0
};
var MAT = {
  bowman: mat(0xffffff, { rough: 0.5, side: THREE.DoubleSide, vc: true, coat: 0.35 }),
  visceral: mat(COL.visceral, { rough: 0.55, coat: 0.2 }),
  glomerulus: mat(COL.glomerulus, { rough: 0.3, opacity: 0.5, env: 0.4 }),
  afferens: mat(COL.afferens, { rough: 0.3, opacity: 0.55, env: 0.45, side: THREE.DoubleSide }),
  efferens: mat(COL.efferens, { rough: 0.3, opacity: 0.6, env: 0.45, side: THREE.DoubleSide }),
  macula: mat(COL.macula, { rough: 0.5, coat: 0.3 }),
  peritub: mat(0xffffff, { rough: 0.3, vc: true, opacity: 0.46, env: 0.5 }),
  vasa: mat(0xffffff, { rough: 0.3, vc: true, opacity: 0.46, env: 0.5 }),
  solute: mat(COL.solute, { rough: 0.35 }),
  grad: mat(0xffffff, { rough: 1, vc: true, side: THREE.DoubleSide, env: 0 }),
  tubule: mat(0xffffff, { rough: 0.5, vc: true, coat: 0.4 }),
  flowBlood: mat(COL.flowBlood, { rough: 0.35, coat: 0.5 }),
  flowWater: mat(COL.flowWater, { rough: 0.15, coat: 0.8, env: 0.7 }),
  flowSalt: mat(COL.flowSalt, { rough: 0.25 }),
  flowGluc: mat(COL.flowGluc, { rough: 0.3, coat: 0.5 }),
  flowDrug: mat(COL.flowDrug, { rough: 0.3, coat: 0.6 }),
};
MAT.flowWater.emissive = srgb(0x1a66c8).multiplyScalar(0.85);
MAT.flowGluc.emissive = srgb(0x7a4a00).multiplyScalar(0.8);
MAT.flowSalt.emissive = srgb(0x6a1fb0).multiplyScalar(0.8);   /* wanderndes Salz hebt sich vom ruhenden Feld ab */
MAT.flowDrug.emissive = srgb(0x0a6b45).multiplyScalar(0.9);
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; MAT[k].userData.baseEmissive = MAT[k].emissive.clone(); });
/* ausblendbare Varianten fuer Medikamentenwirkungen */
MAT.soluteWash = MAT.solute.clone(); MAT.soluteWash.transparent = true; MAT.soluteWash.name = 'soluteWash';
MAT.soluteWash.userData.baseEmissive = MAT.solute.emissive.clone();
MAT.saltArrow = MAT.flowSalt.clone(); MAT.saltArrow.transparent = true; MAT.saltArrow.name = 'saltArrow';
MAT.waterArrow = MAT.flowWater.clone(); MAT.waterArrow.transparent = true; MAT.waterArrow.name = 'waterArrow';
MAT.waterArrow.userData.baseEmissive = MAT.flowWater.emissive.clone();
MAT.saltArrow.userData.baseEmissive = MAT.flowSalt.emissive.clone();
/* Deckkraft in AR (WebXR und AR Quick Look): Tubulus und Gefaesse weniger durchsichtig als am Bildschirm.
   userData.op merkt die Bildschirm-Deckkraft der Gefaesse; userData.usdzOp gilt als Deckkraft in der USDZ (Kern.AR.usdz) */
var AR_DECK = { tubule: 0.6, glomerulus: 0.8, afferens: 0.8, efferens: 0.8, peritub: 0.8, vasa: 0.8 };
var AR_GEFAESSE = ['glomerulus', 'afferens', 'efferens', 'peritub', 'vasa'];
AR_GEFAESSE.forEach(function (k) { MAT[k].userData.op = MAT[k].opacity; MAT[k].userData.usdzOp = AR_DECK[k]; });

var root = new THREE.Group();
scene.add(root);
var STRUCT = {}, ORDER = [];
function reg(id, def_) { STRUCT[id] = def_; def_.id = id; def_.meshes = []; ORDER.push(def_); }
function add(sid, geo, material, name, flags) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.userData.sid = sid;
  if (flags) Object.keys(flags).forEach(function (k) { m.userData[k] = flags[k]; });
  root.add(m); STRUCT[sid].meshes.push(m);
  return m;
}

/* =====================================================================
   3. Strukturen
   ===================================================================== */
reg('bowman', { de: 'Bowman-Kapsel', lat: 'Capsula glomeruli', grp: 'Nierenk\u00f6rperchen', col: COL.bowman,
  txt: 'Die \u00e4u\u00dfere Wand der Bowman-Kapsel, hier aufgeschnitten dargestellt. Zwischen ihr und dem inneren Blatt liegt der Kapselraum, in dem sich der Prim\u00e4rharn sammelt und zum Harnpol abflie\u00dft.',
  facts: { 'Filterbarriere': 'Endothel, Basalmembran, Podozyten', 'Prim\u00e4rharn': 'ca. 180 l/Tag' } });
reg('visceral', { de: 'Podozyten', lat: 'Paries visceralis', grp: 'Nierenk\u00f6rperchen', col: COL.visceral,
  txt: 'Die Podozyten liegen dem Kapillarkn\u00e4uel unmittelbar auf und bilden mit Endothel und Basalmembran den eigentlichen Filter. Zwischen ihnen und dem \u00e4u\u00dferen Blatt liegt der Kapselraum \u2013 Blut und Prim\u00e4rharn sind also durch nur drei Schichten getrennt.',
  facts: { 'Zelltyp': 'Podozyten', 'Filterschlitze': 'ca. 25 nm', 'H\u00e4lt zur\u00fcck': 'Zellen und gro\u00dfe Proteine' } });
reg('glomerulus', { de: 'Glomerulus', lat: 'Glomerulus', grp: 'Nierenk\u00f6rperchen', col: COL.glomerulus,
  txt: 'Kn\u00e4uel aus rund 30 Kapillarschlingen. Weil die abf\u00fchrende Arteriole enger ist als die zuf\u00fchrende, staut sich das Blut \u2013 so entsteht der Druck, der das Filtrat aus dem Blut presst. Wasser und Salz werden gemeinsam abgepresst; die Blutzellen bleiben im Gef\u00e4\u00df, und ein Teil des Salzes auch.',
  facts: { 'Kapillardruck': 'ca. 50 mmHg', 'Filtrationsrate': 'ca. 120 ml/min' } });
reg('afferens', { de: 'Zuf\u00fchrende Arteriole', lat: 'Arteriola afferens', grp: 'Nierenk\u00f6rperchen', col: COL.afferens,
  txt: 'Bringt das Blut aus der A. interlobularis heran. \u00dcber ihre Weite reguliert die Niere ihre eigene Durchblutung; in ihrer Wand sitzen die reninbildenden Zellen.',
  facts: { 'Weit gestellt': 'Filtration steigt', 'Bildet': 'Renin' } });
reg('efferens', { de: 'Abf\u00fchrende Arteriole', lat: 'Arteriola efferens', grp: 'Nierenk\u00f6rperchen', col: COL.efferens,
  txt: 'F\u00fchrt das Blut ab und ist deutlich enger als die zuf\u00fchrende Arteriole. Genau dieser Engpass h\u00e4lt den Druck im Kn\u00e4uel hoch. Danach umspinnt das Blut als Kapillarnetz den Tubulus.',
  facts: { 'Durchmesser': 'enger als afferens', 'Danach': 'Vasa recta' } });
reg('macula', { de: 'Macula densa', lat: 'Macula densa', grp: 'Nierenk\u00f6rperchen', col: COL.macula,
  txt: 'Zellgruppe des aufsteigenden Schenkels, die am eigenen Gef\u00e4\u00dfpol vorbeizieht. Sie misst die Natriumkonzentration im Harn und steuert dar\u00fcber Durchblutung und Reninfreisetzung.',
  facts: { 'Teil des': 'juxtaglomerul\u00e4ren Apparats', 'Misst': 'NaCl im Tubulus' } });

reg('prox', { de: 'Proximaler Tubulus', lat: 'Tubulus contortus proximalis', grp: 'Tubulussystem', col: 0xE0D2A6,
  txt: 'Hier werden rund zwei Drittel des Prim\u00e4rharns zur\u00fcckgeholt \u2013 Glukose, Aminos\u00e4uren, Salz und Wasser. Das Salz geht voran, das Wasser folgt ihm: Im Modell tritt zuerst ein Salzteilchen ins Blut \u00fcber, kurz danach folgen an derselben Stelle zwei Wassertropfen. Weil beides zusammen geht, bleibt die Fl\u00fcssigkeit isoton bei etwa 300 mosmol/l.',
  facts: { 'Resorption': 'ca. 65 %', 'Oberfl\u00e4che': 'B\u00fcrstensaum', 'Osmolarit\u00e4t': 'bleibt 300' } });
reg('desc', { de: 'Absteigender Schenkel', lat: 'Pars descendens, d\u00fcnn', grp: 'Tubulussystem', col: 0xD3B478,
  txt: 'D\u00fcnnwandig und wasserdurchl\u00e4ssig, aber dicht f\u00fcr Salz. Weil das Gewebe nach unten immer salziger wird, str\u00f6mt Wasser heraus, w\u00e4hrend das Salz im Rohr weiterflie\u00dft \u2013 der Harn dickt bis auf 1200 mosmol/l ein.',
  facts: { 'Durchl\u00e4ssig f\u00fcr': 'Wasser', 'Am Scheitel': 'bis 1200 mosmol/l' } });
reg('loop', { de: 'Henle-Schleife', lat: 'Ansa nephroni', grp: 'Tubulussystem', col: 0xB0801F,
  txt: 'Der Scheitel liegt tief im Nierenmark. Absteigender und aufsteigender Schenkel arbeiten gegenl\u00e4ufig \u2013 dieses Gegenstromprinzip baut den osmotischen Gradienten \u00fcberhaupt erst auf.',
  facts: { 'Prinzip': 'Gegenstrom-Multiplikation', 'Lage': 'Nierenmark' } });
reg('asc', { de: 'Aufsteigender Schenkel', lat: 'Pars ascendens, dick', grp: 'Tubulussystem', col: 0xC9A459,
  txt: 'Dickwandig und f\u00fcr Wasser undurchl\u00e4ssig. Hier wird aktiv Natriumchlorid ins Gewebe gepumpt, ohne dass Wasser folgen kann. Der Harn verl\u00e4sst die Schleife deshalb verd\u00fcnnt \u2013 daher der Name Verd\u00fcnnungssegment.',
  facts: { 'Pumpt heraus': 'Na\u207a und Cl\u207b', 'Am Ende': 'ca. 100 mosmol/l', 'Medikament': 'Schleifendiuretika' } });
reg('dist', { de: 'Distaler Tubulus', lat: 'Tubulus contortus distalis', grp: 'Tubulussystem', col: 0xEAE0C4,
  txt: 'Feinabstimmung des Harns. Unter Aldosteron wird hier Natrium gegen Kalium getauscht, dazu kommt die Kalziumregulation \u00fcber Parathormon.',
  facts: { 'Aldosteron': 'Na\u207a hinein, K\u207a hinaus', 'Medikament': 'Thiaziddiuretika' } });
reg('coll', { de: 'Sammelrohr', lat: 'Ductus colligens', grp: 'Tubulussystem', col: 0xC9A459,
  txt: 'Sammelt den Harn mehrerer Nephrone und zieht durch das salzige Mark zur Papille. Nur wenn ADH wirkt, wird die Wand wasserdurchl\u00e4ssig: Das Wasser wandert ins aufsteigende Vas rectum daneben, und der Harn konzentriert sich auf bis zu 1200 mosmol/l.',
  facts: { 'Mit ADH': 'konzentrierter Harn', 'Ohne ADH': 'bis 20 l verd\u00fcnnter Harn/Tag', 'M\u00fcndet': 'auf der Papille' } });

reg('peritub', { de: 'Peritubul\u00e4re Kapillaren', lat: 'Rete capillare peritubulare', grp: 'Umgebung', col: COL.peritub,
  txt: 'Aus der abf\u00fchrenden Arteriole entsteht ein Kapillarnetz, das sich um den gewundenen Tubulus windet. Hier sieht man, wie das Wasser aus dem Tubulus austritt, den Spalt \u00fcberquert und ins Blut hineinwandert \u2013 dann flie\u00dft es mit den Blutzellen davon. In Wirklichkeit liegen Rohr und Gef\u00e4\u00df noch dichter beieinander; der Abstand ist im Modell vergr\u00f6\u00dfert, damit man den \u00dcbertritt sieht.',
  facts: { 'Herkunft': 'Arteriola efferens', 'Umschlingt': 'proximalen und distalen Tubulus', 'Nimmt auf': 'Wasser, Glukose, Salze', 'Im Modell': 'Abstand vergr\u00f6\u00dfert' } });
reg('vasa', { de: 'Vasa recta', lat: 'Vasa recta', grp: 'Umgebung', col: COL.vasa,
  txt: 'Haarnadelf\u00f6rmige Gef\u00e4\u00dfe parallel zur Henle-Schleife. Sie nehmen das Wasser auf, das der Sog der gel\u00f6sten Teilchen aus dem absteigenden Schenkel zieht, ohne den Salzgradienten des Gewebes auszuwaschen. Neben dem Sammelrohr steigt ein weiteres Vas rectum auf und bringt auch dieses Wasser zur\u00fcck in den Kreislauf.',
  facts: { 'Form': 'Haarnadel', 'Aufgabe': 'Gradient erhalten', 'Am Sammelrohr': 'aufsteigendes Vas rectum' } });
reg('solute', { de: 'Gel\u00f6ste Teilchen', lat: 'Particulae solutae', grp: 'Umgebung', col: COL.solute,
  txt: 'Salz und Harnstoff im Gewebe zwischen Rohr und Gef\u00e4\u00df. Nach unten werden es immer mehr. Wo mehr gel\u00f6ste Teilchen liegen, wird Wasser hingezogen \u2013 deshalb verl\u00e4sst es das Rohr und geht ins Blutgef\u00e4\u00df.',
  facts: { 'Herkunft': 'aus dem aufsteigenden Schenkel', 'Oben': 'wenige, Rinde ist isoton', 'Unten': 'viele, Mark ist konzentriert' } });
reg('grad', { de: 'Rinde und Mark', lat: 'Cortex et medulla', grp: 'Umgebung', col: 0x4A2E28,
  txt: 'Die Hintergrundtafel trennt Rinde von Mark. Nierenk\u00f6rperchen und gewundene Tubuli liegen in der Rinde, die Henle-Schleife reicht tief ins Mark hinunter.',
  facts: { 'Rinde': 'Filtration und Hauptresorption', 'Mark': 'Konzentrierung' } });

reg('flowBlood', { de: 'Blut', lat: 'Sanguis', grp: 'Str\u00f6mung', col: COL.flowBlood, dot: 1,
  txt: 'Jede Blutzelle bringt zwei Wassertropfen mit \u2013 Blut besteht zu mehr als der H\u00e4lfte aus Plasma, also vor allem aus Wasser. Im Kn\u00e4uel treten die Tropfen aus, die Zelle bleibt im Gef\u00e4\u00df. Danach flie\u00dft das Blut durch die Kapillaren um den Tubulus und durch die Vasa recta und nimmt dort das zur\u00fcckgeholte Wasser wieder mit.',
  facts: { 'Bleibt im Gef\u00e4\u00df': 'Zellen und Eiwei\u00df', 'Tritt aus': 'Wasser und kleine Stoffe' } });
reg('flowWater', { de: 'Wassertropfen', lat: 'Aqua', grp: 'Str\u00f6mung', col: COL.flowWater, dot: 1,
  txt: 'Kommt mit dem Blut herein, wird im Kn\u00e4uel zusammen mit dem Salz abgepresst und flie\u00dft ohne Unterbrechung weiter in den Tubulus \u2013 Blutzellen kommen nicht hinein. Wasser folgt dem Salz: Wo Salz hinwandert oder im Gewebe gel\u00f6st ist, zieht es das Wasser nach. So wandert das Wasser immer wieder durch die Wand zur\u00fcck ins Blut, am meisten im proximalen Tubulus. Im Modell bleibt nur etwa jeder sechzehnte Tropfen im Rohr und wird zu Harn; in Wirklichkeit ist es sogar nur rund jeder hundertste.',
  facts: { 'Filtriert': 'ca. 180 l/Tag', 'Zur\u00fcck ins Blut': 'ca. 99 %', 'Bleibt als Harn': 'ca. 1,5 l/Tag' } });
reg('flowSalt', { de: 'Salz wird gepumpt', lat: 'Transportus activus', grp: 'Str\u00f6mung', col: COL.flowSalt, dot: 1,
  txt: 'Salz ist von Anfang an im Blut gel\u00f6st. Im Kn\u00e4uel wird ein Teil zusammen mit dem Wasser abgepresst, der Rest bleibt im Blut. Im Tubulus wird das Salz fast vollst\u00e4ndig zur\u00fcckgeholt \u2013 am meisten im proximalen Tubulus, wo das Wasser ihm folgt. Im dicken aufsteigenden Schenkel wird Salz ins Gewebe gepumpt, ohne dass Wasser folgen kann: Dieses Salz macht das Mark salzig und zieht weiter unten das Wasser aus dem absteigenden Schenkel und dem Sammelrohr. Ein kleiner Rest wird im distalen Tubulus zur\u00fcckgeholt oder geht in den Harn.',
  facts: { 'Grundsatz': 'Wasser folgt dem Salz', 'Transport': 'aktiv, ATP-abh\u00e4ngig', 'Ergebnis': 'viele gel\u00f6ste Teilchen im Mark' } });
reg('flowGluc', { de: 'Zucker', lat: 'Glucosum', grp: 'Str\u00f6mung', col: 0xF5B301, dot: true,
  txt: 'Traubenzucker (Glukose), als Sechsring dargestellt \u2013 so wird er auch in Lehrb\u00fcchern gezeichnet. Normalerweise wird er im proximalen Tubulus vollst\u00e4ndig ins Blut zur\u00fcckgeholt; Wasser folgt ihm. Er erscheint im Modell, wenn unter \u201eKrankheiten\u201c die Hyperglyk\u00e4mie eingeschaltet ist: Dann sind die Transporter ausgelastet, der Rest bleibt im Harn und h\u00e4lt das Wasser fest.',
  facts: { 'Nierenschwelle': 'ca. 180 mg/dl Blutzucker', 'Transporter': 'SGLT2 und SGLT1', 'Sichtbar bei': 'Krankheiten \u2192 Hyperglyk\u00e4mie' } });
reg('flowDrug', { de: 'Torasemid', lat: 'Torasemidum', grp: 'Str\u00f6mung', col: 0x33E0A0, dot: true,
  txt: 'Wirkstoff von Torem\u00ae, ein Schleifendiuretikum \u2013 als gr\u00fcner Achtfl\u00e4chner dargestellt. Es kommt mit dem Blut, wird im proximalen Tubulus ins Rohr ausgeschieden und flie\u00dft mit dem Harn zum dicken aufsteigenden Schenkel. Dort blockiert es von innen die Salzpumpe (Na\u207a-K\u207a-2Cl\u207b-Kotransporter). Es erscheint, wenn unter \u201eMedikamente\u201c Torem eingeschaltet ist.',
  facts: { 'Gruppe': 'Schleifendiuretikum', 'Wirkort': 'dicker aufsteigender Schenkel', 'Angriffspunkt': 'Na\u207a-K\u207a-2Cl\u207b-Kotransporter' } });

/* =====================================================================
   4. Bahnen und Bauteile
   ===================================================================== */
var BD = bahnenDef();
var GC = BD.GC, GR = BD.GR, RO = BD.RO, RI = BD.RI, POLE = BD.POLE, AX = BD.AX, AU = BD.AU, AW = BD.AW, TH0 = BD.TH0, NECK_L = BD.NECK_L, NECK_R = BD.NECK_R, WALL = BD.WALL, MOUTH = BD.MOUTH, WIN = BD.WIN, HUB = BD.HUB, HA = BD.HA, HE = BD.HE, AFF = BD.AFF, EFF = BD.EFF, VASA = BD.VASA, PROX = BD.PROX, DESC = BD.DESC, LOOP = BD.LOOP, ASC = BD.ASC, DIST = BD.DIST, COLL = BD.COLL, CAPC = BD.CAPC;

/* ---- Kapsel und Trichter zum Tubulus: ein durchgehendes Stueck ---- */
(function () {
  var prof = [], i, th;
  for (i = 34; i >= 0; i--) {
    th = TH0 + (179 * DEG - TH0) * i / 34;
    prof.push({ ao: RO * Math.cos(th), ro: RO * Math.sin(th), ai: RI * Math.cos(th), ri: RI * Math.sin(th) });
  }
  var a0 = RO * Math.cos(TH0), r0 = RO * Math.sin(TH0) - WALL;
  for (i = 1; i <= 14; i++) {
    var u = i / 14, sm = u * u * (3 - 2 * u);
    var ax = a0 + NECK_L * u, m = r0 + (NECK_R - r0) * sm;
    prof.push({ ao: ax, ro: m + WALL, ai: ax, ri: m - WALL });
  }
  add('bowman', revShell(GC, AX, AU, AW, prof, WIN, 2 * Math.PI - 2 * WIN, 52,
      srgb(0xBFA9A0), srgb(0x8A746D), srgb(0xD6C3BA)),
    MAT.bowman, 'Capsula_et_collum');
})();

/* ---- Kapillarknaeuel: 7 Laeppchen mit je 2 Schlingen, die vom Gefaesspol
        aus die Kapsel fuellen. Weiche Begrenzung haelt einen schmalen
        Kapselraum frei, durch den das Filtrat zum Harnpol fliesst. ---- */
var LOOPS = [];
var CAP_R = 0.10;
(function () {
  var TIPS = [V(1, 0.05, 0.12), V(0.35, 0.86, 0.36), V(0.38, -0.86, -0.30), V(0.30, 0.28, 0.92),
              V(0.30, -0.30, -0.90), V(-0.28, 0.80, -0.52), V(-0.28, -0.80, 0.52)]
    .map(function (d) { return GC.clone().addScaledVector(d.normalize(), 0.93); });
  var K0 = 0.86, MX = 1.02;
  function soft(p, w) {
    var rel = p.clone().sub(GC), l = rel.length();
    if (l <= K0 || l < 1e-4) return p;
    var l2 = K0 + (MX - K0) * Math.tanh((l - K0) / (MX - K0));
    return p.copy(GC).addScaledVector(rel.divideScalar(l), l + (l2 - l) * w);
  }
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  TIPS.forEach(function (tip, j) {
    var out = tip.clone().sub(HUB), ax = out.clone().normalize();
    var ref = Math.abs(ax.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    var w0 = new THREE.Vector3().crossVectors(ax, ref).normalize();
    for (var k = 0; k < 2; k++) {
      var w = w0.clone().applyAxisAngle(ax, k * Math.PI / 2 + j * 0.7);
      var ctrl = [
        HA.clone(),
        HA.clone().addScaledVector(out, 0.28).addScaledVector(w, 0.16),
        HUB.clone().addScaledVector(out, 0.66).addScaledVector(w, 0.27),
        tip.clone().addScaledVector(w, 0.21),
        tip.clone().addScaledVector(ax, 0.15),
        tip.clone().addScaledVector(w, -0.21),
        HUB.clone().addScaledVector(out, 0.66).addScaledVector(w, -0.27),
        HE.clone().addScaledVector(out, 0.28).addScaledVector(w, -0.16),
        HE.clone()
      ];
      var pts = smooth(ctrl, 72), f = frames(pts);
      for (var i = 1; i < pts.length - 1; i++) {
        var t = i / (pts.length - 1), a = Math.sin(Math.PI * t);
        pts[i].addScaledVector(f.N[i], 0.065 * a * Math.sin(11 * Math.PI * t + j + k))
              .addScaledVector(f.B[i], 0.05 * a * Math.cos(7 * Math.PI * t + 2 * j));
        soft(pts[i], sstep(0.06, 0.22, t) * sstep(0.06, 0.22, 1 - t));
      }
      LOOPS.push(pts);
    }
  });

  /* Kapillaren: durchscheinend, damit man Blutzellen und Wasser darin sieht */
  var caps = LOOPS.map(function (pts) {
    var rr = pts.map(function (_, i) {
      var t = i / (pts.length - 1);
      return CAP_R * (1 + 0.18 * Math.max(0, 1 - Math.min(t, 1 - t) / 0.12));
    });
    return tube(pts, rr, 14, false, false);
  });
  add('glomerulus', mergeGeos(caps), MAT.glomerulus, 'Capillares_glomeruli');

  /* Podozyten: Zellkoerper sitzen aussen auf der Kapillare, Fuesschen umgreifen sie */
  var parts = [], unit = new THREE.SphereGeometry(1, 12, 9);
  LOOPS.forEach(function (pts, li) {
    var f = frames(pts), n = pts.length;
    [0.30, 0.50, 0.70].forEach(function (tt, bi) {
      var i = Math.round(tt * (n - 1)) + ((li + bi) % 2 ? 2 : -2);
      var p = pts[i], T = f.T[i];
      var out = p.clone().sub(GC); out.addScaledVector(T, -out.dot(T));
      if (out.lengthSq() < 1e-6) out.copy(f.N[i]);
      out.normalize();
      var side = new THREE.Vector3().crossVectors(out, T).normalize();
      var body = unit.clone();
      var m4 = new THREE.Matrix4().makeBasis(T, side, out);
      m4.scale(V(0.068, 0.058, 0.036));
      m4.setPosition(p.clone().addScaledVector(out, CAP_R + 0.03));
      body.applyMatrix4(m4);
      parts.push(body);
      [-3, 3].forEach(function (di) {
        var ii = Math.max(1, Math.min(n - 2, i + di)), c = pts[ii];
        var a0 = Math.atan2(out.dot(f.B[ii]), out.dot(f.N[ii])), arc = [];
        for (var s = 0; s <= 10; s++) {
          var a = a0 - 1.9 + 3.8 * s / 10, R = CAP_R + 0.014;
          arc.push(c.clone().addScaledVector(f.N[ii], R * Math.cos(a)).addScaledVector(f.B[ii], R * Math.sin(a)));
        }
        parts.push(tube(arc, lerpArr([0.008, 0.014, 0.008], 10), 6, true, true));
      });
    });
  });
  add('visceral', mergeGeos(parts), MAT.visceral, 'Podocyti');
})();

/* ---- Arteriolen (durchscheinend) und Vasa recta ---- */
(function () {
  add('afferens', tube(smooth(AFF, 48), lerpArr(BD.RAD.afferens, 48), 20, true, false),
    MAT.afferens, 'Arteriola_afferens');
  add('efferens', tube(smooth(EFF, 30), lerpArr(BD.RAD.efferens, 30), 18, false, false),
    MAT.efferens, 'Arteriola_efferens');
  var p = smooth(VASA, 90), cols = [], i;
  for (i = 0; i <= 90; i++)
    cols.push(new THREE.Color(0xC8605E).lerp(new THREE.Color(0x6F98C8), Math.pow(i / 90, 1.25)).convertSRGBToLinear());
  add('vasa', tube(p, lerpArr([0.13, 0.13, 0.14, 0.14, 0.15, 0.15, 0.15, 0.16, 0.16, 0.17, 0.17], 90), 16, true, true, cols),
    MAT.vasa, 'Vasa_recta');
})();

/* ---- Tubulus, Farbe = Konzentration im Rohr ---- */
var NB = {};                                   /* Nachbarpunkte je Abschnitt */
/* Krankheitsbilder aendern die Konzentration im Rohr. Jeder Abschnitt kennt zwei
   Farbreihen (normal / Hyperglykaemie) und wird stufenlos zwischen ihnen gemischt. */
var TUBE_MESHES = [];
var HG_CONC = { prox: [300, 300], desc: [300, 700], loop: [700, 720], asc: [720, 180], dist: [180, 300], coll: [300, 450] };
/* Torasemid: ohne Salzpumpe kein Gradient - der Harn bleibt fast isoton */
var LT_CONC = { prox: [300, 300], desc: [300, 420], loop: [420, 430], asc: [430, 310], dist: [310, 300], coll: [300, 320] };
function seg(sid, pts, n, rad, c0, c1, name, capA, capB) {
  var sp = smoothSeg(pts, n, NB[sid][0], NB[sid][1]), rr = lerpArr(rad, n);
  var geo = tube(sp, rr, 18, !!capA, !!capB, concRamp(c0, c1, n));
  var geoH = tube(sp, rr, 18, !!capA, !!capB, concRamp(HG_CONC[sid][0], HG_CONC[sid][1], n));
  var geoT = tube(sp, rr, 18, !!capA, !!capB, concRamp(LT_CONC[sid][0], LT_CONC[sid][1], n));
  var m = add(sid, geo, MAT.tubule, name);
  m.userData.colN = geo.attributes.color.array.slice();
  m.userData.colH = geoH.attributes.color.array.slice();
  m.userData.colT = geoT.attributes.color.array.slice();
  geoH.dispose(); geoT.dispose();
  TUBE_MESHES.push(m);
}
function setTubuleMix(wH, wT) {
  wT = wT || 0;
  TUBE_MESHES.forEach(function (m) {
    var a = m.geometry.attributes.color, N = m.userData.colN, H = m.userData.colH, T = m.userData.colT;
    for (var i = 0; i < a.array.length; i++) a.array[i] = N[i] + (H[i] - N[i]) * wH + (T[i] - N[i]) * wT;
    a.needsUpdate = true;
  });
}
function segPts(sid, pts, n) { return smoothSeg(pts, n, NB[sid][0], NB[sid][1]); }
NB.prox = [null, DESC[1]]; NB.desc = [PROX[PROX.length - 2], LOOP[1]]; NB.loop = [DESC[DESC.length - 2], ASC[1]];
NB.asc = [LOOP[LOOP.length - 2], DIST[1]]; NB.dist = [ASC[ASC.length - 2], COLL[1]]; NB.coll = [DIST[DIST.length - 2], null];
seg('prox', PROX, 110, BD.RAD.prox, 300, 300, 'Tubulus_proximalis', false, false);
seg('desc', DESC, 55, BD.RAD.desc, 300, 1150, 'Pars_descendens', false, false);
seg('loop', LOOP, 34, BD.RAD.loop, 1150, 1200, 'Ansa_nephroni', false, false);
seg('asc', ASC, 70, BD.RAD.asc, 1200, 110, 'Pars_ascendens', false, false);
seg('dist', DIST, 55, BD.RAD.dist, 110, 300, 'Tubulus_distalis', false, false);
seg('coll', COLL, 60, BD.RAD.coll, 300, 1200, 'Ductus_colligens', false, true);

/* ---- Peritubulaeres Netz ----
   Die Kapillare laeuft mit deutlichem Abstand um den Tubulus, damit man
   sieht, wie das Wasser den Spalt ueberquert und ins Blut hineinwandert.
   HELIX merkt sich Tubulus- und Kapillarpunkte paarweise (gleicher Index). */
var HELIX = {}, CAP_PT = 0.085, RELAX_IT = 420;
function tubeColsRB(n) {
  var c = [];
  for (var i = 0; i < n; i++) c.push(new THREE.Color(0xD8747A).lerp(new THREE.Color(0x7FA6D2), i / Math.max(1, n - 1)).convertSRGBToLinear());
  return c;
}
(function () {
  var pieces = [];
  function proxR(s) { var r = [0.30, 0.29, 0.27, 0.25, 0.23], t = Math.min(3.999, s * 4), i0 = Math.floor(t); return r[i0] + (r[i0 + 1] - r[i0]) * (t - i0); }
  /* Windungszahl und Phase so waehlen, dass Anfang und Ende hinten liegen:
     dort docken Zu- und Abfluss an, ohne vor dem Tubulus zu kreuzen. */
  function helixSpec(pathPts, n, from, to, radFn, tMin, tMax) {
    var all = segPts(pathPts === PROX ? 'prox' : 'dist', pathPts, n), tub = all.slice(Math.round(n * from), Math.round(n * to) + 1);
    var base = relax(tub, RELAX_IT, 0.5);
    var f = frames(base), last = base.length - 1, back = V(0, 0, -1), best = null;
    function ang(i) { return Math.atan2(back.dot(f.B[i]), back.dot(f.N[i])); }
    for (var tt = tMin; tt <= tMax + 1e-9; tt += 0.01) {
      var ph = ang(last) - tt * 2 * Math.PI, a0 = ph;
      var d0 = f.N[0].clone().multiplyScalar(Math.cos(a0)).addScaledVector(f.B[0], Math.sin(a0));
      var score = d0.dot(back);
      if (!best || score > best.score) best = { score: score, turns: tt, phase: ph };
    }
    var hx = helixAround(base, radFn, best.turns, best.phase);
    return { base: base, tub: tub, hx: hx, turns: best.turns };
  }
  var F0 = 0.14;
  HELIX.prox = helixSpec(PROX, 440, F0, 1.0, function (t) { return proxR(F0 + (1 - F0) * t) + 0.36; }, 4.0, 5.0);
  HELIX.dist = helixSpec(DIST, 320, 0.46, 0.88, function () { return 0.225 + 0.33; }, 2.3, 3.2);

  var hp = HELIX.prox.hx, hd = HELIX.dist.hx;
  pieces.push(tube(hp, hp.map(function () { return CAP_PT; }), 12, false, false, tubeColsRB(hp.length)));
  pieces.push(tube(hd, hd.map(function () { return CAP_PT; }), 12, true, true, tubeColsRB(hd.length)));

  /* Zufluss: zweigt hinten von den Vasa recta ab und muendet tangential in die Wendel */
  var h0 = hp[0], t0 = hp[1].clone().sub(hp[0]).normalize();
  HELIX.feed = [V(0.62, 2.63, -1.04), V(1.30, 2.95, -1.30), V(2.05, 3.70, -1.15),
                h0.clone().addScaledVector(t0, -0.45), h0.clone()];
  var fp = smooth(HELIX.feed, 40), fc = [];
  for (var i = 0; i <= 40; i++) fc.push(new THREE.Color(0xC8605E).lerp(new THREE.Color(0xD8747A), i / 40).convertSRGBToLinear());
  pieces.push(tube(fp, lerpArr([0.11, 0.095, CAP_PT], 40), 12, false, false, fc));

  /* Abfluss: vom Wendelende nach hinten ins Gewebe (zur Vene) */
  var hn = hp[hp.length - 1], tn = hn.clone().sub(hp[hp.length - 2]).normalize();
  HELIX.drain = [hn.clone(), hn.clone().addScaledVector(tn, 0.45), hn.clone().add(V(0.10, 0.25, -0.95)), hn.clone().add(V(0.15, 0.35, -2.15))];
  var dp = smooth(HELIX.drain, 30);
  var dc = []; for (i = 0; i <= 30; i++) dc.push(new THREE.Color(0x7FA6D2).convertSRGBToLinear());
  pieces.push(tube(dp, lerpArr([CAP_PT, 0.10, 0.11], 30), 12, false, true, dc));

  add('peritub', mergeGeos(pieces), MAT.peritub, 'Rete_peritubulare');
})();

/* ---- Aufsteigendes Vas rectum am Sammelrohr (gehoert zu den Vasa recta) ---- */
(function () {
  var p = smooth(CAPC, 70), c = [];
  for (var i = 0; i <= 70; i++) c.push(new THREE.Color(0x9A7EB0).lerp(new THREE.Color(0x6F98C8), i / 70).convertSRGBToLinear());
  add('vasa', tube(p, lerpArr([0.10, 0.10, 0.105, 0.11, 0.11, 0.12, 0.12], 70), 14, true, true, c), MAT.vasa, 'Vas_rectum_ascendens');
})();

/* ---- Macula densa ---- */
(function () {
  var g = new THREE.SphereGeometry(0.22, 18, 14);
  g.scale(1, 1.2, 0.7);
  g.translate(-1.50, 5.28, -0.86);
  add('macula', g, MAT.macula, 'Macula_densa');
})();

/* ---- Hintergrundtafel Rinde/Mark ---- */
(function () {
  var g = new THREE.PlaneGeometry(TAFEL.b, TAFEL.h, 2, 40);
  g.translate(TAFEL.mx, TAFEL.my, TAFEL.z);
  var pos = g.attributes.position, cols = [];
  for (var i = 0; i < pos.count; i++) {
    var y = pos.getY(i), t = y >= TAFEL.grenze ? 0 : Math.min(1, (TAFEL.grenze - y) / 12);
    cols.push.apply(cols, new THREE.Color(0x16262D).lerp(new THREE.Color(0x53332A), t).convertSRGBToLinear().toArray());
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  add('grad', g, MAT.grad, 'Cortex_et_medulla', { noexport: true });
})();

/* ---- Feld geloester Teilchen: nach unten immer dichter ---- */
(function () {
  var seed = 20260828;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  var lines = [smooth(PROX, 40), smooth(DESC, 30), smooth(LOOP, 20), smooth(ASC, 40),
               smooth(DIST, 30), smooth(COLL, 34), smooth(VASA, 60), smooth(CAPC, 40),
               HELIX.prox.hx.filter(function (_, i) { return i % 3 === 0; }),
               HELIX.dist.hx.filter(function (_, i) { return i % 3 === 0; })];
  var rads = [0.30, 0.16, 0.16, 0.25, 0.24, 0.47, 0.20, 0.12, 0.09, 0.09];
  function clear(p) {
    for (var i = 0; i < lines.length; i++)
      for (var j = 0; j < lines[i].length; j++)
        if (p.distanceTo(lines[i][j]) < rads[i] + 0.17) return false;
    return p.distanceTo(GC) > 2.1;
  }
  var pts = [], tries = 0;
  while (pts.length < 140 && tries < 40000) {
    tries++;
    var p = rnd() < 0.72
      ? V(-1.0 + rnd() * 4.6, -8.6 + rnd() * 11.9, -1.5 + rnd() * 2.2)
      : V(4.2 + rnd() * 2.9, -8.6 + rnd() * 11.9, -1.3 + rnd() * 2.4);
    var dens = Math.pow(Math.max(0, Math.min(1, (3.3 - p.y) / 11.9)), 0.85);
    if (rnd() > dens * 0.96 + 0.02) continue;
    if (!clear(p)) continue;
    pts.push(p);
  }
  /* ein Drittel bleibt immer, zwei Drittel koennen ausgewaschen werden (Schleifendiuretikum) */
  add('solute', dotCloud(pts.filter(function (_, i) { return i % 3 === 0; }), 0.058), MAT.solute, 'Particulae_solutae');
  add('solute', dotCloud(pts.filter(function (_, i) { return i % 3 !== 0; }), 0.058), MAT.soluteWash, 'Particulae_solutae_elutae');
})();

/* =====================================================================
   5. Stroemung
   Alle Teilchen einer Stroemung teilen sich ein Objekt (Instancing):
   ein Zeichenaufruf statt hundert - das macht es auf Tablets fluessig.
   ===================================================================== */
var PSTREAMS = {
  flowBlood: { list: [], name: 'Erythrocyti', geo: (function () { var g = new THREE.SphereGeometry(0.062, 12, 8); g.scale(1, 1, 0.42); return g; })() },
  flowWater: { list: [], name: 'Aqua', geo: new THREE.SphereGeometry(0.05, 10, 7) },
  flowSalt: { list: [], name: 'NaCl', geo: new THREE.SphereGeometry(0.048, 10, 7) },
  flowGluc: { list: [], name: 'Glucosum', geo: new THREE.CylinderGeometry(0.058, 0.058, 0.046, 6, 1) },
  flowDrug: { list: [], name: 'Torasemidum', geo: new THREE.OctahedronGeometry(0.076, 0) }
};
/* Krankheitsbilder: Teilchen mit scen erscheinen nur im Krankheitsbild, Teilchen mit nscen
   nur ohne. SW[id] laeuft beim Umschalten weich von 0 nach 1 (und zurueck). */
var SW = { hg: 0, lt: 0 };                          /* Anteil je Krankheitsbild/Medikament */
function scenMul(p) { return p.scen ? SW[p.scen] : (p.nscen ? 1 - SW[p.nscen] : 1); }
var seedR = 777;
function rndR() { seedR = (seedR * 1103515245 + 12345) & 0x7fffffff; return seedR / 0x7fffffff; }

function curveOf(list) {
  var c = new THREE.CatmullRomCurve3(list, false, 'catmullrom', 0.5);
  c.arcLengthDivisions = Math.max(200, list.length * 8);
  return c;
}
/* weiches Ein- und Ausblenden am Anfang und Ende jedes Weges */
function env(v) { var e = Math.max(0, Math.min(1, Math.min(v / 0.07, (1 - v) / 0.07))); return e * e * (3 - 2 * e); }
function sizeAt(p, v) {
  var pr = p.prof;
  if (!pr) return 1;
  if (v <= pr[0][0]) return pr[0][1];
  for (var i = 1; i < pr.length; i++) if (v <= pr[i][0]) {
    var a = pr[i - 1], b = pr[i], t = (v - a[0]) / Math.max(1e-6, b[0] - a[0]);
    t = t * t * (3 - 2 * t);
    return a[1] + (b[1] - a[1]) * t;
  }
  return pr[pr.length - 1][1];
}
/* Zeit -> Weg. Ein Tropfen laeuft mit seiner Blutzelle herein; nach dem
   Austritt fliesst das Filtrat langsamer weiter (warp) - so sind im
   Kapselraum immer mehrere Tropfen gleichzeitig zu sehen. */
function arcAt(p, v) {
  var w = p.warp;
  if (!w) return v;
  for (var k = 1; k < w.tv.length; k++) if (v <= w.tv[k] || k === w.tv.length - 1) {
    var f = (v - w.tv[k - 1]) / Math.max(1e-9, w.tv[k] - w.tv[k - 1]);
    return w.a[k - 1] + Math.max(0, Math.min(1, f)) * (w.a[k] - w.a[k - 1]);
  }
  return v;
}
/* Anteil der Bogenlaenge bis Kontrollpunkt idx (Catmull-Rom: Punkt i liegt bei t = i/(n-1)) */
function arcFrac(curve, idx, n) {
  var D = curve.arcLengthDivisions, L = curve.getLengths(D);
  var k = idx / (n - 1) * D, k0 = Math.min(D - 1, Math.floor(k)), fr = k - k0;
  return (L[k0] + (L[k0 + 1] - L[k0]) * fr) / L[D];
}
/* Weg aus Abschnitten mit eigenem Tempo (Einheiten/Sekunde). Passt der Weg
   nicht in eine Schleife, wird das Ende gekuerzt - der Tropfen blendet dann
   eben etwas frueher aus, waehrend er mit dem Blut davonfliesst. */
/* ---- Etappen ("Staffellauf") ----
   Ein Wassertropfen legt einen langen Weg zurueck: Knaeuel, Kapselraum,
   Tubulus, Durchtritt, Blutgefaess. Das dauert laenger als eine Schleife von
   12 s. Darum wird der Weg in Etappen geteilt; jede Etappe ist ein eigenes
   Teilchen und startet genau dort und dann, wo die vorige endet. So kann das
   Wasser langsam fliessen, und die Schleife bleibt trotzdem nahtlos. */
function laneFade(p, tau) {
  var sec = tau * p.T, e = Math.max(0, Math.min(1, Math.min(sec, p.T - sec) / p.fade));
  return e * e * (3 - 2 * e);
}
function sample(p, u) {
  if (p.fixed) return { pos: p.fixedPos, s: 1 };
  if (u > p.span) return null;
  var v = u / p.span, a;
  if (p.lane) {
    var tau = p.t0 + v * (p.t1 - p.t0);
    a = arcAt(p, tau);
    return { pos: p.curve.getPointAt(a), s: laneFade(p, tau) * sizeAt(p, a) };
  }
  a = arcAt(p, v);
  return { pos: p.curve.getPointAt(a), s: env(v) * sizeAt(p, a) };
}
/* segs: [{pts, v}] - Abschnitte mit eigenem Tempo (Einheiten/s);
   marks: Kontrollpunkt-Indizes, deren Bogenanteil das Groessenprofil braucht */
function spawnLane(sid, segs, off0, profFn, fade, marks, tags) {
  var ctrl = [], ends = [], i;
  segs.forEach(function (s, k) { (k === 0 ? s.pts : s.pts.slice(1)).forEach(function (q) { ctrl.push(q); }); ends.push(ctrl.length - 1); });
  var curve = curveOf(ctrl), len = curve.getLength(), a = [0], tv = [0], T = 0;
  for (i = 0; i < segs.length; i++) {
    a.push(i === segs.length - 1 ? 1 : arcFrac(curve, ends[i], ctrl.length));
    T += (a[i + 1] - a[i]) * len / segs[i].v;
    tv.push(T);
  }
  for (i = 0; i < tv.length; i++) tv[i] /= T;
  var mk = (marks || []).map(function (idx) { return arcFrac(curve, idx, ctrl.length); });
  var warp = { tv: tv, a: a }, prof = profFn ? profFn(a, len, mk) : null;
  /* Laufzeit: u = (Uhr/DUR + off) mod 1. Etappe i beginnt also, wenn Uhr/DUR = -off_i.
     Damit sie genau dann startet, wenn die vorige endet, gilt off_i = off0 - cuts[i]*T/DUR
     (frueher faelschlich mit Plus - dann blinkten die Tropfen). Die Grenzen liegen auf
     dem Keyframe-Raster, damit auch der Export sauber uebergibt. */
  var n = Math.max(1, Math.ceil(T / (0.9 * DUR))), cuts = [0];
  for (i = 1; i < n; i++) {
    var m = Math.round(((i / n) * T / DUR - off0) * NKEY);
    cuts.push(Math.max(cuts[i - 1] + 1e-3, Math.min(1 - 1e-3, (m / NKEY + off0) * DUR / T)));
  }
  cuts.push(1);
  var rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(rndR() * 6.28, rndR() * 6.28, rndR() * 6.28));
  for (i = 0; i < n; i++) {
    var p = { sid: sid, lane: true, curve: curve, len: len, warp: warp, prof: prof, T: T, fade: fade || 0.45,
              t0: cuts[i], t1: cuts[i + 1], span: (cuts[i + 1] - cuts[i]) * T / DUR,
              off: ((off0 - cuts[i] * T / DUR) % 1 + 1) % 1, rot: rot, last: new THREE.Vector3() };
    p.last.copy(curve.getPointAt(arcAt(p, p.t0)));
    if (tags) Object.keys(tags).forEach(function (k) { p[k] = tags[k]; });
    PSTREAMS[sid].list.push(p);
  }
  return { T: T, n: n };
}
function chordFr(ctrl) {
  var acc = [0], L = 0, i;
  for (i = 1; i < ctrl.length; i++) { L += ctrl[i].distanceTo(ctrl[i - 1]); acc.push(L); }
  return acc.map(function (a) { return a / L; });
}
function spawn(sid, ctrl, off, prof) {
  var curve = curveOf(ctrl);
  var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rndR() * 6.28, rndR() * 6.28, rndR() * 6.28));
  /* zwei Keyframes Pause an der Schleifennaht: dort springt das Teilchen unsichtbar zurueck */
  var p = { sid: sid, curve: curve, len: curve.getLength(), off: off, span: 1 - 2 / NKEY, prof: prof || null,
            rot: q, last: curve.getPointAt(0).clone() };
  PSTREAMS[sid].list.push(p);
  return p;
}

/* ---- Blut und Wasser im Nierenkoerperchen ----
   Jede Kapillarschlinge ist ein eigener Blutweg: Arteriole - Schlinge -
   abfuehrende Arteriole - Vasa recta. Jede Blutzelle bringt einen Tropfen
   mit. Der Tropfen laeuft dicht hinter ihr herein, wird in der Schlinge
   durch die Wand gepresst und fliesst durch den Kapselraum zum Harnpol. */
var LSUB = LOOPS.map(function (pts) {
  return pts.filter(function (_, i) { return i % 2 === 0 || i === pts.length - 1; });
});
function capsulePath(p) {
  var d0 = p.clone().sub(GC).normalize();
  var out = [GC.clone().addScaledVector(d0, 1.22)];
  var ang = Math.acos(Math.max(-1, Math.min(1, d0.dot(AX))));
  var axis = new THREE.Vector3().crossVectors(d0, AX);
  if (axis.lengthSq() < 1e-6) axis.copy(AU); else axis.normalize();
  var steps = Math.max(2, Math.ceil(ang / 0.42));
  for (var s = 1; s <= steps; s++)
    out.push(GC.clone().addScaledVector(d0.clone().applyAxisAngle(axis, ang * s / steps), s === steps ? 1.18 : 1.29));
  out.push(GC.clone().addScaledVector(AX, 1.52), GC.clone().addScaledVector(AX, 1.96), MOUTH.clone());
  return out;
}
var RBC_PER_LOOP = 4, GROUPS = [];
(function () {
  var head = AFF.slice(0, -1), tail = EFF.slice(1).concat(VASA.slice(1));
  LSUB.forEach(function (loop, k) {
    var route = head.concat(loop, tail), fr = chordFr(route);
    var l0 = fr[head.length], l1 = fr[head.length + loop.length - 1];
    var profB = [[0, 1.45], [l0 - 0.02, 1.45], [l0 + 0.012, 1.0], [l1 - 0.004, 1.0], [l1 + 0.03, 1.3], [1, 1.3]];
    for (var i = 0; i < RBC_PER_LOOP; i++) {
      var off = ((i + k * 0.37) / RBC_PER_LOOP) % 1;
      var rbc = spawn('flowBlood', route, off, profB);
      /* Salz, das im Blut bleibt: fliesst durch Knaeuel, abfuehrende Arteriole und Vasa recta */
      spawn('flowSalt', route, (off - 0.02 + 1) % 1, null);
      spawn('flowGluc', route, (off - 0.034 + 1) % 1, null).scen = 'hg';     /* viel Zucker im Blut */
      /* Blutportion: ihre Wasser- und Salzwege werden unten als durchgehende Wege angelegt */
      GROUPS.push({ head: head, loop: loop, sIdx: Math.round((loop.length - 1) * [0.36, 0.46, 0.56, 0.66][i]),
                    off: off, vb: rbc.len / (rbc.span * DUR) });
    }
  });
})();

/* ---- Blut in den Kapillaren um den Tubulus ----
   Die Wendel am proximalen Tubulus wird von den Vasa recta gespeist, die am
   distalen Tubulus ist ein Kapillarstueck, das Vas rectum am Sammelrohr
   steigt von unten auf. Ueberall fliesst sichtbar Blut. */
function thin(arr, step) { return arr.filter(function (_, i) { return i % step === 0 || i === arr.length - 1; }); }
var HROUTE = HELIX.feed.slice(0, -1).concat(thin(HELIX.prox.hx, 4), HELIX.drain.slice(1));
var V_HELIX, V_DIST, V_CAPC, V_VASA;
(function () {
  var i, p;
  for (i = 0; i < 40; i++) { p = spawn('flowBlood', HROUTE, i / 40, [[0, 1.2], [1, 1.2]]); if (i === 0) V_HELIX = p.len / (p.span * DUR); }
  var dr = thin(HELIX.dist.hx, 4);
  for (i = 0; i < 16; i++) { p = spawn('flowBlood', dr, (i + 0.5) / 16, [[0, 1.2], [1, 1.2]]); if (i === 0) V_DIST = p.len / (p.span * DUR); }
  for (i = 0; i < 22; i++) { p = spawn('flowBlood', CAPC, (i + 0.2) / 22, [[0, 1.4], [1, 1.4]]); if (i === 0) V_CAPC = p.len / (p.span * DUR); }
  /* Salz, das schon im Blut gelöst ist */
  for (i = 0; i < 16; i++) spawn('flowSalt', HROUTE, (i + 0.5) / 16, null);
  for (i = 0; i < 12; i++) spawn('flowGluc', HROUTE, (i + 0.8) / 12, null).scen = 'hg';
  for (i = 0; i < 4; i++) spawn('flowGluc', dr, (i + 0.6) / 4, null).scen = 'hg';
  for (i = 0; i < 6; i++) spawn('flowGluc', CAPC, (i + 0.35) / 6, null).scen = 'hg';
  for (i = 0; i < 6; i++) spawn('flowSalt', dr, (i + 0.25) / 6, null);
  for (i = 0; i < 8; i++) spawn('flowSalt', CAPC, (i + 0.6) / 8, null);
  /* Blutgeschwindigkeit in den Vasa recta = Mittel der Glomerulus-Wege */
  var s = 0, n = 0;
  PSTREAMS.flowBlood.list.forEach(function (q) { if (q.prof && q.prof.length === 6) { s += q.len; n++; } });
  V_VASA = s / n / ((1 - 2 / NKEY) * DUR);
})();

/* ---- Der Weg des Wassers ----
   Jeder Tropfen, der im Knaeuel abgepresst wird, fliesst ohne Unterbrechung
   weiter in den Tubulus. Dort entscheidet sich sein Schicksal: rund zwei
   Drittel treten im proximalen Tubulus ins Blut ueber, einige im absteigenden
   Schenkel, einige im Sammelrohr - der kleine Rest wird Harn. Im Tubulus ist
   nur Wasser; die Tropfen fliessen ueber den Querschnitt verteilt. */
var EXITS = [];
var V_CROSS = 0.3;                                  /* Durchtritt langsam, damit man ihn verfolgt */
var TUB = (function () {                            /* Tubulus-Mittellinie am Stueck, mit Radius */
  var parts = [['prox', PROX, 440, [0.30, 0.29, 0.27, 0.25, 0.23]], ['desc', DESC, 120, [0.23, 0.16, 0.15, 0.15, 0.15]],
               ['loop', LOOP, 50, [0.15, 0.15, 0.15]], ['asc', ASC, 160, [0.15, 0.20, 0.24, 0.24, 0.24]],
               ['dist', DIST, 140, [0.23, 0.22, 0.22, 0.23]], ['coll', COLL, 180, [0.23, 0.36, 0.40, 0.44, 0.46]]];
  var pts = [], rad = [], start = {};
  parts.forEach(function (pt, k) {
    var s = segPts(pt[0], pt[1], pt[2]), r = lerpArr(pt[3], pt[2]);
    start[pt[0]] = k ? pts.length - 1 : 0;
    for (var i = k ? 1 : 0; i <= pt[2]; i++) { pts.push(s[i]); rad.push(r[i]); }
  });
  var fr = frames(pts);
  return { pts: pts, rad: rad, N: fr.N, B: fr.B, start: start };
})();
function nearestIdx(pts, q, i0, i1) {
  var bi = i0 || 0, bd = 1e9, e = i1 === undefined ? pts.length - 1 : i1;
  for (var k = i0 || 0; k <= e; k++) { var d = pts[k].distanceTo(q); if (d < bd) { bd = d; bi = k; } }
  return bi;
}
/* Tubulusweg von der Muendung bis Index i1, seitlich versetzt (phi, m) */
function tubPath(i1, phi, m) {
  var out = [], last = null;
  for (var i = 0; i <= i1; i++) {
    var ramp = Math.min(1, i / 45), r = Math.max(0, TUB.rad[i] - 0.075) * m * ramp;
    var q = TUB.pts[i].clone().addScaledVector(TUB.N[i], r * Math.cos(phi)).addScaledVector(TUB.B[i], r * Math.sin(phi));
    if (!last || q.distanceTo(last) >= 0.12 || i === i1) { out.push(q); last = q; }
  }
  return out;
}
function crossPath(from, to) {
  var dir = to.clone().sub(from).normalize();
  return [from.clone(), from.clone().addScaledVector(dir, 0.2), from.clone().lerp(to, 0.8), to.clone()];
}
/* Groessenprofil: im weiten Gefaess etwas groesser; alle Uebergaenge langsam, nichts blinkt */
function laneProf(exitKind) {
  return function (a, len, mk) {
    var d = function (u) { return u / len; }, dl0 = mk[0];
    var pr = [[0, 1.3], [dl0 - d(0.8), 1.3], [dl0 + d(0.3), 1.0]];
    if (exitKind) pr.push([a[3], 1.0], [a[4] + d(0.6), 1.15], [1, 1.15]);
    else pr.push([1, 1.0]);
    for (var k = 1; k < pr.length; k++) pr[k][0] = Math.max(pr[k][0], pr[k - 1][0] + 1e-5);
    return pr;
  };
}
function tubPathRange(i0, i1, phi, m) {          /* Tubulusweg ab Index i0, seitlich versetzt */
  var out = [], last = null;
  for (var i = i0; i <= i1; i++) {
    var r = Math.max(0, TUB.rad[i] - 0.075) * m;
    var q = TUB.pts[i].clone().addScaledVector(TUB.N[i], r * Math.cos(phi)).addScaledVector(TUB.B[i], r * Math.sin(phi));
    if (!last || q.distanceTo(last) >= 0.12 || i === i1) { out.push(q); last = q; }
  }
  return out;
}
var V_TUBE = 0.4 * V_VASA;                       /* so schnell wie das Filtrat im Kapselraum */
/* Schicksal je Blutportion:
   P  proximal: Salz tritt ins Blut ueber, die zwei Wassertropfen folgen an derselben Stelle
   A  Mark:     Wasser 1 verlaesst den absteigenden Schenkel, Wasser 2 das Sammelrohr,
                das Salz wird im aufsteigenden Schenkel ins Gewebe gepumpt
   T  distal:   Wasser 1 absteigender Schenkel, Wasser 2 Harn, Salz im distalen Tubulus zurueck
   U  Harn:     Wasser 1 Sammelrohr, Wasser 2 und Salz bleiben im Harn */
var LANE_STATS = { water: { P: 0, D: 0, C: 0, U: 0 }, salt: { P: 0, A: 0, T: 0, U: 0 }, parts: 0 };
var SALT = [];
(function () {
  var V_T = V_TUBE, LEAD = 0.5, FOLLOW = 0.35;                      /* Sekunden: Salz voraus, Wasser folgt */
  var hx = HELIX.prox.hx, hd = HELIX.dist.hx, vasaPts = smooth(VASA, 240), capPts = smooth(CAPC, 90);
  var descSpots = [0.22, 0.42, 0.62, 0.82], collSpots = [0.34, 0.50, 0.66, 0.82];
  var aLen = TUB.start.dist - TUB.start.asc;
  function outDir(k, bias) {                                       /* aus dem aufsteigenden Schenkel ins Gewebe */
    var T = TUB.pts[Math.min(TUB.pts.length - 1, k + 1)].clone().sub(TUB.pts[Math.max(0, k - 1)]).normalize();
    var dir = V(0.75, 0, -0.66 + bias).normalize();
    return dir.addScaledVector(T, -dir.dot(T)).normalize();
  }
  var NG = GROUPS.length, gP = Math.round(0.66 * NG), gA = Math.round(0.21 * NG), gT = Math.round(0.07 * NG);
  var want = { P: gP, A: gA, T: gT, U: NG - gP - gA - gT }, got = { P: 0, A: 0, T: 0, U: 0 }, order = [];
  GROUPS.slice().sort(function (x, y) { return x.off - y.off; }).forEach(function (g, i) {
    var best = null, bestErr = -1e9;
    Object.keys(want).forEach(function (k) {
      var err = want[k] * (i + 1) / NG - got[k];
      if (got[k] < want[k] && err > bestErr) { bestErr = err; best = k; }
    });
    got[best]++; order.push({ g: g, fate: best, n: got[best] - 1 });
  });

  /* ein durchgehender Weg: Blut -> Kapselraum -> Tubulus -> (Durchtritt -> Ziel) */
  function lane(sid, g, off, dest, phi, m, tags) {
    var loop = g.loop, sIdx = g.sIdx;
    var segs = [{ pts: g.head.concat(loop.slice(0, sIdx + 1)), v: g.vb },
                { pts: [loop[sIdx]].concat(capsulePath(loop[sIdx])), v: g.vb * 0.4 }];
    var tp = tubPath(dest.kc, phi, m), fade = 0.45;
    segs.push({ pts: tp, v: V_T });
    if (dest.entry) {
      segs.push({ pts: crossPath(tp[tp.length - 1], dest.entry), v: V_CROSS });
      segs.push({ pts: dest.vessel, v: dest.v });
    }
    if (dest.fade) fade = dest.fade;
    var prof = sid === 'flowWater' ? laneProf(!!dest.entry) : null;
    var r = spawnLane(sid, segs, (off % 1 + 1) % 1, prof, fade, [g.head.length], tags);
    LANE_STATS.parts += r.n;
  }
  function dP(j) {                               /* proximal: in die Kapillarwendel */
    return { kc: nearestIdx(TUB.pts, hx[j], 0, TUB.start.desc), entry: hx[j],
             vessel: [hx[j]].concat(thin(hx.slice(j + 1), 4), HELIX.drain.slice(1)), v: V_HELIX };
  }
  function dD(n) {                               /* absteigender Schenkel: in die Vasa recta */
    var kc = TUB.start.desc + Math.round(descSpots[n % 4] * (TUB.start.loop - TUB.start.desc)), vi = nearestIdx(vasaPts, TUB.pts[kc]);
    return { kc: kc, entry: vasaPts[vi], vessel: [vasaPts[vi]].concat(thin(vasaPts.slice(vi + 1), 5)), v: V_VASA };
  }
  function dC(n) {                               /* Sammelrohr: ins aufsteigende Vas rectum */
    var kc = TUB.start.coll + Math.round(collSpots[n % 4] * (TUB.pts.length - 1 - TUB.start.coll)), ci = nearestIdx(capPts, TUB.pts[kc]);
    return { kc: kc, entry: capPts[ci], vessel: [capPts[ci]].concat(thin(capPts.slice(ci + 1), 4)), v: V_CAPC };
  }
  function dU() { return { kc: TUB.pts.length - 1 }; }
  function dA(n) {                               /* aufsteigender Schenkel: Salz wird ins Gewebe gepumpt */
    var h = 0.04 + 0.56 * ((n * 0.6180339887 + 0.21) % 1), kx = TUB.start.asc + Math.round(h * aLen);
    var dir = outDir(kx, (n % 2 ? 1 : -1) * 0.35), c = TUB.pts[kx];
    var out1 = c.clone().addScaledVector(dir, TUB.rad[kx] + 0.32), out2 = out1.clone().addScaledVector(dir, 0.3);
    return { kc: kx, entry: out1, vessel: [out1, out1.clone().lerp(out2, 0.5), out2], v: 0.16, fade: 0.8 };
  }
  function dT(n) {                               /* distaler Tubulus: Salz in die distale Kapillarwendel */
    var j = Math.round((0.2 + 0.6 * ((n * 0.6180339887 + 0.4) % 1)) * (hd.length - 1));
    return { kc: nearestIdx(TUB.pts, hd[j], TUB.start.dist, TUB.start.coll), entry: hd[j],
             vessel: [hd[j]].concat(thin(hd.slice(j + 1), 4)), v: V_DIST };
  }
  function ph() { return rndR() * Math.PI * 2; }
  function mm() { return Math.sqrt(rndR()) * 0.9; }
  /* Hyperglykaemie: SGLT-Transporter am Limit. Bei etwa jeder dritten proximalen Portion
     bleibt der Zucker im Rohr - und das Wasser bleibt bei ihm, statt dem Salz zu folgen. */
  var nP = want.P, nHold = Math.round(nP / 3), HOLD = {};
  for (var q = 0; q < nP; q++) if (Math.floor((q + 1) * nHold / nP) > Math.floor(q * nHold / nP)) HOLD[q] = true;
  LANE_STATS.hg = { held: nHold, reabsorbed: nP - nHold };
  order.forEach(function (o) {
    var g = o.g, w1 = g.off - 0.0045, w2 = w1 - FOLLOW / DUR, sl = w1 + LEAD / DUR, gl = w1 + 0.22 / DUR;
    var phi = ph(), mv = mm();                         /* eine Spur je Portion: Teilchen voran, Wasser folgt */
    if (o.fate === 'P') {
      var j = Math.round((0.06 + 0.88 * ((o.n * 0.6180339887 + 0.13) % 1)) * (hx.length - 1)), d = dP(j);
      lane('flowSalt', g, sl, d, phi, mv);
      if (HOLD[o.n]) {
        /* normal: Wasser folgt dem Salz ins Blut - im Krankheitsbild ausgeblendet */
        lane('flowWater', g, w1, d, phi, mv, { nscen: 'hg' }); lane('flowWater', g, w2, d, phi, mv, { nscen: 'hg' });
        /* Hyperglykaemie: derselbe Weg bis zur Austrittsstelle, dann bleibt das Wasser beim Zucker im Rohr */
        lane('flowGluc', g, gl, dU(), phi, mv, { scen: 'hg' });
        lane('flowWater', g, w1, dU(), phi, mv, { scen: 'hg' }); lane('flowWater', g, w2, dU(), phi, mv, { scen: 'hg' });
      } else {
        lane('flowGluc', g, gl, d, phi, mv, { scen: 'hg' });   /* SGLT holt diesen Zucker zurueck */
        lane('flowWater', g, w1, d, phi, mv); lane('flowWater', g, w2, d, phi, mv);
      }
      LANE_STATS.salt.P++; LANE_STATS.water.P += 2;
    } else if (o.fate === 'A') {
      lane('flowWater', g, w1, dD(o.n), phi, mv, { nscen: 'lt' }); lane('flowWater', g, w2, dC(o.n), phi, mv, { nscen: 'lt' });
      lane('flowSalt', g, sl, dA(o.n), phi, mv * 0.8, { nscen: 'lt' });
      /* Torasemid: Salzpumpe blockiert - das Salz bleibt im Rohr, das Wasser bleibt bei ihm,
         und weil das Mark sein Salz verliert, zieht auch nichts mehr Wasser heraus */
      lane('flowSalt', g, sl, dU(), phi, mv * 0.8, { scen: 'lt' });
      lane('flowWater', g, w1, dU(), phi, mv, { scen: 'lt' }); lane('flowWater', g, w2, dU(), phi, mv, { scen: 'lt' });
      LANE_STATS.water.D++; LANE_STATS.water.C++; LANE_STATS.salt.A++;
    } else if (o.fate === 'T') {
      lane('flowWater', g, w1, dD(o.n + 1), phi, mv); lane('flowWater', g, w2, dU(), phi, mv);
      lane('flowSalt', g, sl, dT(o.n), phi, mv);
      LANE_STATS.water.D++; LANE_STATS.water.U++; LANE_STATS.salt.T++;
    } else {
      lane('flowWater', g, w1, dC(o.n + 2), phi, mv); lane('flowWater', g, w2, dU(), phi, mv);
      lane('flowSalt', g, sl, dU(), phi, mv);
      LANE_STATS.water.C++; LANE_STATS.water.U++; LANE_STATS.salt.U++;
    }
  });

  /* Pfeile: Wasser am absteigenden Schenkel und am Sammelrohr, Salz am aufsteigenden */
  [0, 2].forEach(function (q) {
    var k = TUB.start.desc + Math.round(descSpots[q] * (TUB.start.loop - TUB.start.desc)), c = TUB.pts[k];
    var vp = vasaPts[nearestIdx(vasaPts, c)], dir = vp.clone().sub(c).normalize();
    EXITS.push({ a: c.clone().addScaledVector(dir, 0.22), d: dir, l: vp.distanceTo(c) - 0.22 - 0.16 });
  });
  [1, 3].forEach(function (q) {
    var k = TUB.start.coll + Math.round(collSpots[q] * (TUB.pts.length - 1 - TUB.start.coll)), c = TUB.pts[k];
    var cp = capPts[nearestIdx(capPts, c)], dir = cp.clone().sub(c).normalize();
    EXITS.push({ a: c.clone().addScaledVector(dir, 0.50), d: dir, l: Math.max(0.12, cp.distanceTo(c) - 0.50 - 0.13) });
  });
  [0.12, 0.33, 0.54].forEach(function (h) {
    var k = TUB.start.asc + Math.round(h * aLen), d = outDir(k, 0);
    SALT.push({ a: TUB.pts[k].clone().addScaledVector(d, TUB.rad[k] + 0.06), d: d, l: 0.7 });
  });
})();

/* ---- Pfeile genau dort, wo Wasser und Salz austreten ---- */
add('flowWater', mergeGeos(EXITS.map(function (e) { return arrowGeom(e.a, e.d, e.l, 0.036); })), MAT.waterArrow, 'Sagittae_H2O');
add('flowSalt', mergeGeos(SALT.map(function (e) { return arrowGeom(e.a, e.d, e.l, 0.036); })), MAT.saltArrow, 'Sagittae_NaCl');

/* ---- Torasemid (Torem): nur im Medikamenten-Modus ----
   Kommt mit dem Blut, wird im proximalen Tubulus ins Rohr ausgeschieden (vom Blut ins
   Rohr - andersherum als sonst), fliesst mit dem Harn zum dicken aufsteigenden Schenkel
   und dockt dort von innen an der Salzpumpe an. */
var DOCKS = [], DRUG_STATS = { lanes: 0, docks: 0, parts: 0 };
(function () {
  var aLen = TUB.start.dist - TUB.start.asc, hx = HELIX.prox.hx, i;
  function tubRange(i0, i1, phi, m) {
    var out = [], last = null;
    for (var k = i0; k <= i1; k++) {
      var r = Math.max(0, TUB.rad[k] - 0.075) * m;
      var q = TUB.pts[k].clone().addScaledVector(TUB.N[k], r * Math.cos(phi)).addScaledVector(TUB.B[k], r * Math.sin(phi));
      if (!last || q.distanceTo(last) >= 0.12 || k === i1) { out.push(q); last = q; }
    }
    return out;
  }
  for (i = 0; i < 12; i++) {                                  /* Andockstellen an der Innenwand */
    var h = 0.06 + 0.56 * ((i * 0.6180339887 + 0.05) % 1), k = TUB.start.asc + Math.round(h * aLen), ang = i * 2.39996;
    var dir = TUB.N[k].clone().multiplyScalar(Math.cos(ang)).addScaledVector(TUB.B[k], Math.sin(ang));
    DOCKS.push({ k: k, pos: TUB.pts[k].clone().addScaledVector(dir, TUB.rad[k] - 0.07), dir: dir });
  }
  DOCKS.forEach(function (dk) {                               /* fest angedockt */
    var p = spawn('flowDrug', [dk.pos.clone(), dk.pos.clone().addScaledVector(dk.dir, 0.01)], 0, null);
    p.fixed = true; p.fixedPos = dk.pos.clone(); p.scen = 'lt'; DRUG_STATS.docks++;
  });
  for (var q = 0; q < 24; q++) {                              /* unterwegs zum Wirkort */
    var dk = DOCKS[q % DOCKS.length];
    var j0 = Math.round((0.02 + 0.10 * ((q * 0.37) % 1)) * (hx.length - 1));
    var j = Math.round((0.18 + 0.52 * ((q * 0.6180339887 + 0.3) % 1)) * (hx.length - 1));
    var kc = nearestIdx(TUB.pts, hx[j], 0, TUB.start.desc);
    var tp = tubRange(kc, dk.k, rndR() * Math.PI * 2, 0.3 + 0.5 * rndR());
    var segs = [{ pts: thin(hx.slice(j0, j + 1), 4), v: V_HELIX },           /* im Blut der Kapillarwendel */
                { pts: crossPath(hx[j], tp[0]), v: V_CROSS },                  /* Sekretion ins Rohr */
                { pts: tp, v: V_TUBE },                                        /* mit dem Harn zur Schleife */
                { pts: [tp[tp.length - 1], tp[tp.length - 1].clone().lerp(dk.pos, 0.5), dk.pos.clone()], v: 0.2 }];
    var r = spawnLane('flowDrug', segs, (q / 24 + 0.03) % 1, null, 0.5, [], { scen: 'lt' });
    DRUG_STATS.lanes++; DRUG_STATS.parts += r.n;
  }
})();

/* ---- Instanzen anlegen ---- */
Object.keys(PSTREAMS).forEach(function (sid) {
  var S = PSTREAMS[sid];
  var im = new THREE.InstancedMesh(S.geo, MAT[sid], S.list.length);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false;
  im.name = S.name; im.userData.sid = sid; im.userData.part = true; im.userData.noexport = true;
  root.add(im); STRUCT[sid].meshes.push(im);
  S.mesh = im;
});
var _m4 = new THREE.Matrix4(), _sc = new THREE.Vector3();
function updateParticles() {
  var base = clock / DUR;
  Object.keys(PSTREAMS).forEach(function (sid) {
    var S = PSTREAMS[sid];
    if (!S.mesh.visible) return;
    for (var i = 0; i < S.list.length; i++) {
      var p = S.list[i], mu = scenMul(p), r = mu > 0.002 ? sample(p, ((base + p.off) % 1 + 1) % 1) : null;
      if (r) { p.last.copy(r.pos); _sc.setScalar(r.s * mu); } else _sc.setScalar(0);
      _m4.compose(p.last, p.rot, _sc);
      S.mesh.setMatrixAt(i, _m4);
    }
    S.mesh.instanceMatrix.needsUpdate = true;
  });
}

/* =====================================================================
   6. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = true, visVersion = 0;
ORDER.forEach(function (s) { enabled[s.id] = true; });
var playing = true, speed = 1, clock = 0;

function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = enabled[o.userData.sid]; });
  /* Durchsicht: der Tubulus wird glasig, damit man das Wasser darin fliessen sieht */
  MAT.tubule.transparent = seeThrough; MAT.tubule.opacity = seeThrough ? (inAR ? AR_DECK.tubule : 0.32) : 1;
  MAT.tubule.depthWrite = !seeThrough; MAT.tubule.side = seeThrough ? THREE.DoubleSide : THREE.FrontSide;
  MAT.tubule.needsUpdate = true;
  /* AR: Gefaesse weniger durchsichtig (am Bildschirm unveraendert); die USDZ fuer AR Quick Look folgt der Durchsicht */
  MAT.tubule.userData.usdzOp = seeThrough ? AR_DECK.tubule : 1;
  AR_GEFAESSE.forEach(function (k) { MAT[k].opacity = inAR ? AR_DECK[k] : MAT[k].userData.op; });
  visVersion++;
}
function setSelected(id) {
  selected = id;
  var brass = srgb(0xE0A94A);
  ORDER.forEach(function (s) {
    var em = (s.id === id) ? 0.28 : 0;
    s.meshes.forEach(function (m) {
      var mt = m.material;
      if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)).add(brass.clone().multiplyScalar(em));
    });
    var row = document.getElementById('row-' + s.id);
    if (row) row.classList.toggle('sel', s.id === id);
  });
  visVersion++;
  var box = document.getElementById('info');
  if (!id) { box.classList.remove('show'); return; }
  var s = STRUCT[id];
  document.getElementById('iLat').textContent = s.lat;
  document.getElementById('iDe').textContent = s.de;
  document.getElementById('iTx').textContent = s.txt;
  var dl = document.getElementById('iDl'); dl.innerHTML = '';
  Object.keys(s.facts).forEach(function (k) {
    var dt = document.createElement('dt'); dt.textContent = k;
    var dd = document.createElement('dd'); dd.textContent = s.facts[k];
    dl.appendChild(dt); dl.appendChild(dd);
  });
  box.classList.add('show');
}

/* =====================================================================
   Krankheitsbilder - Daten fuer Reiter und Erklaerkarte.
   Weitere Krankheitsbilder und Medikamente werden hier ergaenzt.
   ===================================================================== */
var SCENARIOS = [{
  id: 'hg', kind: 'disease', leg: 'legGluc',
  name: 'Polyurie bei Hyperglyk\u00e4mie',
  short: 'Zucker im Harn h\u00e4lt Wasser fest \u2013 osmotische Diurese',
  kicker: 'Krankheitsbild \u00b7 osmotische Diurese',
  lead: 'Zu viel Zucker im Blut: Die Niere kann ihn nicht mehr ganz zur\u00fcckholen. Der Zucker, der im Rohr bleibt, h\u00e4lt das Wasser fest.',
  values: [['Blutzucker', 'z.\u00a0B. 350 mg/dl'], ['Nierenschwelle', 'ca. 180 mg/dl'], ['Harnzucker', 'positiv'], ['Harnmenge', 'deutlich erh\u00f6ht']],
  steps: [
    ['Viel Zucker im Blut.', 'Gelbe Sechsringe flie\u00dfen mit den Blutzellen durch alle Gef\u00e4\u00dfe.'],
    ['Zucker wird mitgefiltert.', 'Im Glomerulus gelangt er frei in den Prim\u00e4rharn \u2013 so viel, wie im Blut ist.'],
    ['Transporter am Limit.', 'Im proximalen Tubulus holen SGLT-Transporter Zucker zur\u00fcck, aber nur bis zu einer H\u00f6chstmenge. Ab etwa 180 mg/dl Blutzucker bleibt Zucker \u00fcbrig.'],
    ['Das Wasser bleibt beim Zucker.', 'Das Salz tritt wie gewohnt ins Blut \u00fcber \u2013 doch das Wasser folgt ihm nicht mehr \u00fcberall, weil der Zucker im Rohr es osmotisch festh\u00e4lt.'],
    ['Mehr Harn, verd\u00fcnnter.', 'Zucker und Wasser flie\u00dfen bis in den Harn: Glukosurie und Polyurie. Das Sammelrohr wird heller \u2013 der Harn ist weniger konzentriert.']
  ],
  after: [
    ['Folgen', 'Durst (Polydipsie), Fl\u00fcssigkeitsverlust bis zur Exsikkose, Elektrolytverluste, Gewichtsabnahme \u2013 typische Zeichen eines entgleisten Diabetes mellitus.'],
    ['Pflege beobachtet', 'Ein- und Ausfuhr bilanzieren, Blut- und Urinzucker kontrollieren, Hautturgor, Schleimh\u00e4ute und Vitalzeichen beobachten, auf die Trinkmenge achten.']
  ],
  note: 'Im Modell ist die Harnmenge \u00fcberzeichnet, damit man den Effekt gut sieht.'
}, {
  id: 'lt', kind: 'drug', leg: 'legDrug',
  name: 'Torem\u00ae (Torasemid)',
  short: 'Schleifendiuretikum \u2013 blockiert die Salzpumpe im aufsteigenden Schenkel',
  kicker: 'Medikament \u00b7 Schleifendiuretikum',
  lead: 'Torasemid blockiert im dicken aufsteigenden Schenkel die Salzpumpe. Das Salz bleibt im Rohr \u2013 und mit ihm das Wasser.',
  values: [['Wirkstoff', 'Torasemid'], ['Wirkort', 'dicker aufsteigender Schenkel'], ['Angriff', 'Na\u207a-K\u207a-2Cl\u207b-Kotransporter'], ['Wirkung (oral)', 'nach ca. 1 h, etwa 6\u20138 h lang']],
  steps: [
    ['Vom Blut ins Rohr.', 'Torasemid kommt mit dem Blut und wird im proximalen Tubulus ins Rohr ausgeschieden \u2013 die gr\u00fcnen Teilchen wandern andersherum als sonst: vom Blut ins Rohr. Mit dem Harn flie\u00dfen sie zur Henle-Schleife.'],
    ['Die Salzpumpe wird blockiert.', 'Im dicken aufsteigenden Schenkel docken sie von innen an der Salzpumpe an. Die violetten Pumppfeile erl\u00f6schen.'],
    ['Das Salz bleibt im Rohr.', 'Es flie\u00dft weiter bis in den Harn \u2013 und h\u00e4lt sein Wasser fest, wie der Zucker bei der Hyperglyk\u00e4mie.'],
    ['Das Mark wird ausgewaschen.', 'Ohne Salznachschub verschwinden die violetten Punkte im Gewebe. Jetzt zieht kaum noch etwas Wasser aus dem absteigenden Schenkel und dem Sammelrohr.'],
    ['Viel Harn, kaum konzentriert.', 'Bis zu einem Viertel des gefilterten Salzes und Wassers geht in den Harn. Schleifendiuretika sind die st\u00e4rksten Diuretika; der Harn bleibt fast isoton.']
  ],
  after: [
    ['Einsatz', '\u00d6deme, z.\u00a0B. bei Herzinsuffizienz, Bluthochdruck, eingeschr\u00e4nkte Nierenfunktion.'],
    ['Nebenwirkungen', 'Kaliumverlust (Hypokali\u00e4mie), Fl\u00fcssigkeitsmangel bis zur Exsikkose, Blutdruckabfall, Natriummangel, Anstieg der Harns\u00e4ure.'],
    ['Pflege beobachtet', 'T\u00e4glich wiegen (gleiche Bedingungen), Ein- und Ausfuhr bilanzieren, Blutdruck und Kalium im Blick, auf Schwindel und Sturzgefahr achten. Einnahme morgens, damit der Harndrang nicht die Nacht st\u00f6rt.']
  ],
  note: 'Kalium ist im Modell nicht eigens dargestellt. Die Harnmenge ist \u00fcberzeichnet, damit man den Effekt gut sieht.'
}];
var SZ = Kern.Szenarien({
  daten: SCENARIOS, karte: 'scard', dauer: 1.2, anteil: SW,
  beimWechsel: function () {
    SCENARIOS.forEach(function (s) {
      var leg = document.getElementById(s.leg);
      if (leg) leg.style.display = SZ.aktiv === s.id ? '' : 'none';
    });
    visVersion++;
  },
  beimEinklappen: function () { visVersion++; }
});
/* fuer die Pruefung ohne Bildschirm: Zustand sofort setzen */
function setScenarioDirect(id) {
  if (id === true) id = 'hg';
  SZ.direkt(id);
  applyScenarioVisuals();
}
/* alles, was vom Anteil der Zustaende abhaengt, ausser den Teilchen */
function applyScenarioVisuals() {
  setTubuleMix(SW.hg, SW.lt);
  MAT.soluteWash.opacity = 1 - 0.94 * SW.lt;             /* Mark wird ausgewaschen */
  MAT.saltArrow.opacity = 1 - SW.lt;                     /* Salzpumpe steht still */
  MAT.waterArrow.opacity = 1 - 0.65 * SW.lt;             /* kaum noch Sog aus dem Mark */
}

(function buildRail() {
  var railRoot = document.getElementById('rail'), groups = [];
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneD = document.createElement('div'); paneD.id = 'paneDis'; paneD.style.display = 'none';
  var paneM = document.createElement('div'); paneM.id = 'paneMed'; paneM.style.display = 'none';
  var panes = [rail, paneD, paneM];
  [['Strukturen', rail], ['Krankheiten', paneD], ['Medikamente', paneM]].forEach(function (t, k) {
    var b = document.createElement('button');
    b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = t[0];
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  railRoot.appendChild(tabs); railRoot.appendChild(rail); railRoot.appendChild(paneD); railRoot.appendChild(paneM);
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', 'Schalte ein Krankheitsbild ein: Das Modell ver\u00e4ndert sich, und rechts erscheint eine Erkl\u00e4rkarte.');
  SZ.liste(paneM, 'drug', 'Diuretika', 'Schalte ein Medikament ein: Das Modell zeigt seine Wirkung, und rechts erscheint eine Erkl\u00e4rkarte.');
  ORDER.forEach(function (s) { if (groups.indexOf(s.grp) < 0) groups.push(s.grp); });
  groups.forEach(function (g) {
    var wrap = document.createElement('div'); wrap.className = 'grp';
    var h = document.createElement('h2'); h.textContent = g; wrap.appendChild(h);
    ORDER.filter(function (s) { return s.grp === g; }).forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'row'; row.id = 'row-' + s.id; row.tabIndex = 0;
      row.innerHTML = '<span class="sw' + (s.dot ? ' dot' : '') + '" style="background:#' +
        s.col.toString(16).padStart(6, '0') + '"></span><span class="nm"><b></b><i></i></span>';
      row.querySelector('b').textContent = s.de;
      row.querySelector('i').textContent = s.lat;
      var sw = row.querySelector('.sw');
      sw.title = 'Ebene ein- oder ausblenden';
      function flip() {
        enabled[s.id] = !enabled[s.id];
        row.classList.toggle('off', !enabled[s.id]);
        applyVisibility();
      }
      sw.addEventListener('click', function (e) { e.stopPropagation(); flip(); });
      row.addEventListener('click', function () { setSelected(s.id); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); setSelected(s.id); }
        if (e.key === ' ') { e.preventDefault(); flip(); }
      });
      wrap.appendChild(row);
    });
    rail.appendChild(wrap);
  });
})();

var PRESETS = [
  { theta: START.theta, phi: START.phi, dist: START.dist, target: V(START.target[0], START.target[1], START.target[2]) },
  { theta: 0.30, phi: 1.42, dist: 7.0, target: V(0.2, 5.62, 0) },
  { theta: 0.20, phi: 1.50, dist: 9.5, target: V(1.3, -6.9, -0.3) },
  { theta: 0.55, phi: 1.50, dist: 15, target: V(5.3, -2.5, 0) }
];
function goTo(i) {
  ['cam0', 'cam1', 'cam2', 'cam3'].forEach(function (id, k) {
    document.getElementById(id).classList.toggle('on', k === i);
  });
  orbit.anim = Kern.fahrt(view, PRESETS[i], 700);
}
[0, 1, 2, 3].forEach(function (i) { document.getElementById('cam' + i).onclick = function () { goTo(i); }; });

document.getElementById('bPlay').onclick = function () {
  playing = !playing;
  this.textContent = playing ? 'Pause' : 'Abspielen';
  this.classList.toggle('on', playing);
};
[['bS0', 0.35], ['bS1', 1], ['bS2', 2.0]].forEach(function (b) {
  document.getElementById(b[0]).onclick = function () {
    speed = b[1];
    ['bS0', 'bS1', 'bS2'].forEach(function (id) { document.getElementById(id).classList.remove('on'); });
    this.classList.add('on');
  };
});
document.getElementById('bSee').onclick = function () {
  seeThrough = !seeThrough;
  this.classList.toggle('on', seeThrough);
  applyVisibility();
};
document.getElementById('bCls').onclick = function () { setSelected(null); };
document.getElementById('bLab').onclick = function () {
  showLabels = !showLabels;
  this.classList.toggle('on', showLabels);
  document.getElementById('labels').style.display = showLabels ? '' : 'none';
  document.getElementById('leaders').style.display = showLabels ? '' : 'none';
  visVersion++;
};

/* =====================================================================
   7. Kamera
   ===================================================================== */
var orbit = Kern.orbit(canvas, view, { minDist: 2.5, maxDist: 60 });
function updateCamera() { Kern.kamera(camera, view); }

var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  if (LUPE.mode) { lupePick(ray); return; }              /* Lupe: Nahansicht statt Strukturinfo */
  var hits = ray.intersectObjects(root.children, false).filter(function (h) {
    return h.object.visible && h.object.userData.sid !== 'grad';
  });
  setSelected(hits.length ? hits[0].object.userData.sid : null);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   8. Beschriftung - wird nur neu gesetzt, wenn sich die Ansicht aendert
   ===================================================================== */
var ANCHORS = [
  { sid: 'afferens', p: V(-3.5, 6.95, 0.3) },
  { sid: 'glomerulus', p: GC.clone().add(V(0.15, 0.45, 0.62)) },
  { sid: 'efferens', p: V(-2.55, 4.80, -0.3) },
  { sid: 'bowman', p: GC.clone().add(V(0.10, -1.47, -0.25)) },
  { sid: 'visceral', p: GC.clone().add(V(0.62, -0.25, 0.62)) },
  { sid: 'macula', p: V(-1.50, 5.28, -0.86) },
  { sid: 'prox', p: V(4.40, 5.10, 0.05) },
  { sid: 'peritub', p: HELIX.prox.hx[Math.round(HELIX.prox.hx.length * 0.58)].clone() },
  { sid: 'desc', p: V(2.12, -2.60, 0) },
  { sid: 'loop', p: V(1.42, -8.05, 0) },
  { sid: 'asc', p: V(0.76, -1.90, 0) },
  { sid: 'solute', p: V(1.45, -5.40, -0.60) },
  { sid: 'dist', p: V(0.90, 7.35, -0.95) },
  { sid: 'coll', p: V(5.99, -4.60, 0) },
  { sid: 'vasa', p: V(3.08, -4.80, -0.95) }
];
var TICKS = [{ y: 5.6, t: 'Rinde' }, { y: -6.2, t: 'Mark' }];
var labelBox = document.getElementById('labels'), leaderSvg = document.getElementById('leaders');
ANCHORS.forEach(function (a) {
  var b = Kern.beschriftung(labelBox, leaderSvg, STRUCT[a.sid].de, STRUCT[a.sid].lat);
  a.el = b.el; a.ln = b.ln; a.dot = b.dot;
});
TICKS.forEach(function (t) {
  var el = document.createElement('div'); el.className = 'tick';
  el.textContent = t.t; labelBox.appendChild(el); t.el = el;
  t.p = V(-6.4, t.y, -2.5);
});

var pv = new THREE.Vector3(), lastLabelKey = '';
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3),
             view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, visVersion].join('|');
  if (key === lastLabelKey) return;
  lastLabelKey = key;
  var narrow = w < 1000;
  var cardW = (SZ.aktiv && SZ.offen && !narrow) ? 352 : 0;
  var colL = narrow ? 14 : 282, colR = narrow ? w - 14 : w - 214 - cardW;
  var topLim = narrow ? 84 : 152;
  var botL = narrow ? h * 0.55 : h - 216, botR = narrow ? h * 0.55 : h - 118;
  if (LUPE.open && !narrow) { botL = Math.min(botL, h - 400); botR = Math.min(botR, h - 400); }
  var items = [];
  function hide(a) { a.el.style.display = 'none'; a.ln.style.display = 'none'; a.dot.style.display = 'none'; }
  ANCHORS.forEach(function (a) {
    if (!showLabels || !enabled[a.sid]) { hide(a); return; }
    pv.copy(a.p).project(camera);
    if (pv.z > 1 || Math.abs(pv.x) > 1.35 || Math.abs(pv.y) > 1.35) { hide(a); return; }
    items.push({ a: a, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
  });
  items.forEach(function (it) { it.side = it.sx < w * 0.44 ? 'l' : 'r'; });
  ['l', 'r'].forEach(function (side) {
    var g = items.filter(function (it) { return it.side === side; }).sort(function (p, q) { return p.sy - q.sy; });
    var lim = side === 'l' ? botL : botR, gap = 40, y = topLim;
    g.forEach(function (it) { it.ly = Math.max(y, Math.min(lim, it.sy)); y = it.ly + gap; });
    var over = y - gap - lim;
    if (over > 0) g.forEach(function (it) { it.ly -= over; });
  });
  items.forEach(function (it) {
    var a = it.a, lx = it.side === 'l' ? colL : colR;
    a.el.style.display = ''; a.ln.style.display = ''; a.dot.style.display = '';
    a.el.className = 'lbl ' + it.side + ((selected && a.sid !== selected) ? ' dim' : '');
    a.el.style.left = lx + 'px'; a.el.style.top = it.ly + 'px';
    a.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    a.ln.setAttribute('points', it.sx + ',' + it.sy + ' ' +
      (ex + (it.side === 'l' ? 16 : -16)) + ',' + it.ly + ' ' + ex + ',' + it.ly);
    a.dot.setAttribute('cx', it.sx); a.dot.setAttribute('cy', it.sy);
  });
  TICKS.forEach(function (t) {
    if (!showLabels || !enabled.grad) { t.el.style.display = 'none'; return; }
    pv.copy(t.p).project(camera);
    if (pv.z > 1) { t.el.style.display = 'none'; return; }
    var sx = (pv.x * 0.5 + 0.5) * w, sy = (-pv.y * 0.5 + 0.5) * h;
    if (sx < (narrow ? 40 : 268) || sx > w - 40 || sy < 40 || sy > h - 40) { t.el.style.display = 'none'; return; }
    t.el.style.display = '';
    t.el.style.left = sx + 'px'; t.el.style.top = sy + 'px';
  });
}

/* =====================================================================
   11. Lupe - Nahansicht quer durch die Wand eines Abschnitts.
   Links das Rohr (bzw. im Knaeuel das Blut), in der Mitte die Wand mit
   Kanaelen und Pumpen, rechts Gewebe, Blut oder Kapselraum. Wo viele
   geloeste Teilchen sind, stehen sie dicht - und man sieht, was wohin
   wandert. Die Werte haengen davon ab, wo man hintippt, und vom Zustand
   (normal, Hyperglykaemie, Torasemid).
   ===================================================================== */
var LUPE = { mode: false, open: false, sec: null, depth: 0.5, st: 'n', pts: [], acc: {}, m: null,
             box: null, cv: null, ctx: null, dpr: 1, W: 340, H: 236, point: V(0, 0, 0), ring: null, line: null };
var LP = { x0: 6, x1: 134, w0: 134, w1: 206, r0: 206, r1: 334, top: 40, bot: 230 };
var LP_COL = { w: '#3AA0FF', s: '#B98BD9', g: '#F5B301', d: '#33E0A0', r: '#B3202A', p: '#E4D6C4' };
var LUPE_SECS = ['glom', 'prox', 'desc', 'asc', 'dist', 'coll'];
var LUPE_NAMES = { glom: 'Glomerulus', prox: 'Prox. Tubulus', desc: 'Abst. Schenkel', asc: 'Aufst. Schenkel', dist: 'Dist. Tubulus', coll: 'Sammelrohr' };
var LUPE_TITLES = { glom: 'Nierenk\u00f6rperchen \u2013 Filtration', prox: 'Proximaler Tubulus \u2013 R\u00fcckresorption',
                    desc: 'Absteigender Schenkel', asc: 'Dicker aufsteigender Schenkel', dist: 'Distaler Tubulus', coll: 'Sammelrohr' };

function lpClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lpMed(depth, st) {                         /* Salzgehalt des Gewebes im Mark */
  if (st === 'lt') return 300 + 60 * depth;
  if (st === 'hg') return 300 + 600 * depth;
  return 300 + 900 * depth;
}
function lpR(n) { return Math.round(n / 10) * 10; }

/* ---- Modell eines Abschnitts: Raeume, Wand, Transporte, Texte ---- */
function lupeModel(sec, depth, st) {
  var med = lpMed(depth, st), L, R, wall, tr = [], tx = {}, depthWord = depth < 0.34 ? 'oben im Mark' : (depth < 0.67 ? 'mitten im Mark' : 'tief im Mark');
  function cnt(osm, extra) { var c = { w: 24, s: Math.max(2, Math.round(osm / 30)) }; if (extra) Object.keys(extra).forEach(function (k) { c[k] = extra[k]; }); return c; }
  function gradRate(lo, hi, base) { return base * lpClamp((hi - lo) / 150, 0.08, 1); }
  if (sec === 'glom') {
    L = { name: 'Blut', kind: 'blood', flow: 1, osm: 290, c: cnt(290, { r: 4, p: 5, g: st === 'hg' ? 6 : 0 }) };
    R = { name: 'Kapselraum', kind: 'capsule', flow: 1, osm: 290, c: cnt(290, { g: st === 'hg' ? 6 : 0 }) };
    L.c.s -= st === 'hg' ? 2 : 0; R.c.s -= st === 'hg' ? 2 : 0;
    wall = { kind: 'filter', label: 'Filter', slots: [70, 104, 138, 172, 206].map(function (y) { return { y: y, type: 'filter' }; }) };
    tr.push({ t: 'w', from: 'L', to: 'R', rate: 5, slot: 'filter' }, { t: 's', from: 'L', to: 'R', rate: 1.4, slot: 'filter' });
    if (st === 'hg') tr.push({ t: 'g', from: 'L', to: 'R', rate: 0.9, slot: 'filter' });
    tx.many = 'Im Blut und im Kapselraum gleich viele (\u2248 290 mosmol/l) \u2013 Salz' + (st === 'hg' ? ' und Zucker passen' : ' passt') + ' durch den Filter.';
    tx.few = 'Gro\u00dfe Eiwei\u00dfe und Blutzellen: Sie kommen nicht durch und bleiben im Blut.';
    tx.move = 'Wasser und kleine gel\u00f6ste Teilchen \u2013 vom Blut in den Kapselraum.';
    tx.why = 'Hier treibt nicht die Osmose, sondern der Blutdruck. Die Eiwei\u00dfe im Blut halten etwas Wasser zur\u00fcck.';
    if (st === 'hg') tx.note = 'Hyperglyk\u00e4mie: Viel Zucker im Blut \u2013 und genauso viel im Filtrat.';
    if (st === 'lt') { tx.note = 'Torasemid ist im Blut an Eiwei\u00df gebunden (gr\u00fcn) und wird deshalb nicht gefiltert \u2013 es gelangt erst im proximalen Tubulus ins Rohr.'; L.c.d = 3; }
  } else if (sec === 'prox') {
    L = { name: 'Im Rohr', kind: 'lumen', flow: 1, osm: 300, c: cnt(300, { g: st === 'hg' ? 9 : 0, d: st === 'lt' ? 2 : 0 }) };
    R = { name: 'Blut', kind: 'blood', flow: -1, osm: 300, c: cnt(300, { r: 3, p: 2, g: st === 'hg' ? 5 : 0, d: st === 'lt' ? 4 : 0 }) };
    if (st === 'hg') L.c.s -= 3;
    wall = { kind: 'cells', brush: true, label: 'Zelle', slots: [{ y: 72, type: 'pump' }, { y: 116, type: 'chan' },
             { y: 160, type: st === 'lt' ? 'secr' : 'sglt', busy: st === 'hg' }, { y: 204, type: 'chan' }] };
    tr.push({ t: 's', from: 'L', to: 'R', rate: 1.6, slot: 'pump' }, { t: 'w', from: 'L', to: 'R', rate: st === 'hg' ? 1.6 : 3.2, slot: 'chan' });
    if (st === 'hg') tr.push({ t: 'g', from: 'L', to: 'R', rate: 0.7, slot: 'sglt' });
    if (st === 'lt') tr.push({ t: 'd', from: 'R', to: 'L', rate: 0.5, slot: 'secr' });
    tx.many = 'Im Rohr und im Blut gleich viele (\u2248 300 mosmol/l).';
    tx.few = 'Kein gro\u00dfer Unterschied \u2013 und trotzdem wandert viel.';
    tx.move = 'Die Zelle pumpt Salz aus dem Rohr ins Blut (das kostet Energie). Kurz danach folgt Wasser durch Wasserkan\u00e4le.';
    tx.why = 'Wo das Salz hinkommt, sind kurz mehr gel\u00f6ste Teilchen \u2013 das Wasser folgt sofort. Deshalb bleibt es isoton.';
    if (st === 'hg') tx.note = 'Hyperglyk\u00e4mie: Alle Zuckertransporter (SGLT) sind besetzt. Der \u00fcbrige Zucker bleibt im Rohr und h\u00e4lt Wasser fest \u2013 es folgt dem Salz nicht mehr ganz.';
    if (st === 'lt') tx.note = 'Torasemid wird hier aus dem Blut ins Rohr ausgeschieden (gr\u00fcn) \u2013 so erreicht es seinen Wirkort in der Henle-Schleife.';
  } else if (sec === 'desc') {
    var lo = Math.max(300, med - (st === 'lt' ? 20 : (st === 'hg' ? 80 : 250)));
    L = { name: 'Im Rohr', kind: 'lumen', flow: 1, osm: lo, c: cnt(lo, { g: st === 'hg' ? 3 : 0, d: st === 'lt' ? 2 : 0 }) };
    R = { name: 'Gewebe', kind: 'tissue', flow: 0, osm: med, c: cnt(med) };
    wall = { kind: 'thin', label: 'd\u00fcnne Wand', slots: [80, 140, 200].map(function (y) { return { y: y, type: 'chan' }; }) };
    tr.push({ t: 'w', from: 'L', to: 'R', rate: gradRate(lo, med, 4.5) * (st === 'hg' ? 0.6 : 1), slot: 'chan' });
    tx.many = 'Im Gewebe (\u2248 ' + lpR(med) + ' mosmol/l) \u2013 ' + depthWord + '.';
    tx.few = 'Im Rohr (\u2248 ' + lpR(lo) + ' mosmol/l).';
    tx.move = 'Wasser \u2013 aus dem Rohr ins Gewebe, durch Wasserkan\u00e4le. Salz kann diese Wand nicht passieren.';
    tx.why = 'Wasser str\u00f6mt dorthin, wo mehr gel\u00f6ste Teilchen sind. So wird der Harn im Rohr nach unten immer konzentrierter.';
    if (st === 'hg') tx.note = 'Hyperglyk\u00e4mie: Der Zucker im Rohr h\u00e4lt einen Teil des Wassers fest \u2013 es tritt weniger aus.';
    if (st === 'lt') tx.note = 'Torasemid: Das Gewebe ist ausgewaschen \u2013 kaum ein Unterschied, kaum Wasser wandert.';
  } else if (sec === 'asc') {
    var la = st === 'lt' ? 300 + 50 * depth : (st === 'hg' ? 120 + 520 * depth : 100 + 800 * depth);
    L = { name: 'Im Rohr', kind: 'lumen', flow: -1, osm: la, c: cnt(la, { g: st === 'hg' ? 3 : 0, d: st === 'lt' ? 3 : 0 }) };
    R = { name: 'Gewebe', kind: 'tissue', flow: 0, osm: med, c: cnt(med) };
    wall = { kind: 'thick', label: 'wasserdicht', slots: [80, 140, 200].map(function (y) { return { y: y, type: 'pump', blocked: st === 'lt' }; }) };
    tr.push({ t: 's', from: 'L', to: 'R', rate: st === 'lt' ? 0.12 : 2.4, slot: 'pump' });
    tx.many = 'Im Gewebe (\u2248 ' + lpR(med) + ' mosmol/l).';
    tx.few = 'Im Rohr (\u2248 ' + lpR(la) + ' mosmol/l) \u2013 nach oben immer weniger.';
    tx.move = 'Salz \u2013 die Salzpumpe (Na\u207a-K\u207a-2Cl\u207b) holt es aus dem Rohr ins Gewebe, aktiv und mit Energie.';
    tx.why = 'Wasser kann nicht folgen, die Wand ist wasserdicht. So wird der Harn verd\u00fcnnt \u2013 und das Mark salzig.';
    if (st === 'lt') { tx.move = 'Fast nichts mehr: Torasemid sitzt auf den Salzpumpen (gr\u00fcn).'; tx.note = 'Torasemid: Das Salz bleibt im Rohr, das Gewebe bekommt keinen Nachschub \u2013 der Sog f\u00fcr das Wasser geht verloren.'; }
  } else if (sec === 'dist') {
    var ld = st === 'lt' ? 280 : (st === 'hg' ? 170 : 150);
    L = { name: 'Im Rohr', kind: 'lumen', flow: 1, osm: ld, c: cnt(ld, { g: st === 'hg' ? 3 : 0, d: st === 'lt' ? 2 : 0 }) };
    R = { name: 'Blut', kind: 'blood', flow: -1, osm: 300, c: cnt(300, { r: 3, p: 2 }) };
    wall = { kind: 'cells', label: 'fast dicht', slots: [{ y: 95, type: 'pump' }, { y: 175, type: 'pump' }] };
    tr.push({ t: 's', from: 'L', to: 'R', rate: st === 'lt' ? 1.7 : 1.2, slot: 'pump' });
    tx.many = 'Im Blut (\u2248 300 mosmol/l).';
    tx.few = 'Im Rohr (\u2248 ' + ld + ' mosmol/l) \u2013 der Harn ist verd\u00fcnnt.';
    tx.move = 'Salz \u2013 ein anderer Transporter holt es weiter ins Blut.';
    tx.why = 'Wasser kann hier kaum folgen, weil die Wand fast wasserdicht ist.';
    if (st === 'lt') tx.note = 'Torasemid: Hier kommt jetzt viel mehr Salz an. Im Austausch geht vermehrt Kalium verloren \u2013 daher die Gefahr der Hypokali\u00e4mie.';
    if (st === 'hg') tx.note = 'Hyperglyk\u00e4mie: Der Zucker flie\u00dft hier einfach weiter \u2013 f\u00fcr ihn gibt es keinen Transporter mehr.';
  } else {                                           /* Sammelrohr */
    var lc = st === 'lt' ? 300 + 30 * depth : (st === 'hg' ? 350 + 450 * depth : 150 + 750 * depth);
    L = { name: 'Im Rohr', kind: 'lumen', flow: 1, osm: lc, c: cnt(lc, { g: st === 'hg' ? 5 : 0, d: st === 'lt' ? 2 : 0 }) };
    R = { name: 'Gewebe', kind: 'tissue', flow: 0, osm: med, c: cnt(med) };
    wall = { kind: 'cells', label: 'ADH-Kan\u00e4le', slots: [80, 140, 200].map(function (y) { return { y: y, type: 'chan' }; }) };
    tr.push({ t: 'w', from: 'L', to: 'R', rate: gradRate(lc, med, 4.5), slot: 'chan' });
    tx.many = 'Im Gewebe (\u2248 ' + lpR(med) + ' mosmol/l) \u2013 ' + depthWord + '.';
    tx.few = 'Im Rohr (\u2248 ' + lpR(lc) + ' mosmol/l).';
    tx.move = 'Wasser \u2013 aus dem Rohr ins Gewebe, durch Wasserkan\u00e4le, die das Hormon ADH \u00f6ffnet.';
    tx.why = 'Wasser str\u00f6mt immer dorthin, wo mehr gel\u00f6ste Teilchen sind. So entsteht konzentrierter Harn.';
    if (st === 'hg') tx.note = 'Hyperglyk\u00e4mie: Der Zucker im Rohr h\u00e4lt Wasser fest \u2013 es bleibt im Harn: Polyurie.';
    if (st === 'lt') tx.note = 'Torasemid: Das Mark ist ausgewaschen \u2013 es zieht kaum noch Wasser heraus. Viel verd\u00fcnnter Harn.';
  }
  return { sec: sec, depth: depth, st: st, L: L, R: R, wall: wall, tr: tr, tx: tx };
}

/* ---- Teilchen der Nahansicht ---- */
function lpRand(a, b) { return a + Math.random() * (b - a); }
function lpSpawn(t, c, edge) {
  var x0 = c === 'L' ? LP.x0 : LP.r0, x1 = c === 'L' ? LP.x1 : LP.r1, big = t === 'r' || t === 'p' ? 9 : 5;
  var comp = c === 'L' ? LUPE.m.L : LUPE.m.R, y;
  if (edge && comp.flow > 0) y = LP.top + big; else if (edge && comp.flow < 0) y = LP.bot - big; else y = lpRand(LP.top + big, LP.bot - big);
  var p = { t: t, c: c, x: lpRand(x0 + big, x1 - big), y: y, vx: 0, vy: 0, a: edge ? 0 : 1, fade: edge ? 1 : 0, cross: null,
            bound: t === 'd' && ((LUPE.m.sec === 'glom' && c === 'L')) };
  LUPE.pts.push(p);
  return p;
}
function lupeBuild() {
  LUPE.pts = []; LUPE.acc = {};
  var m = LUPE.m;
  ['L', 'R'].forEach(function (c) {
    var comp = m[c];
    Object.keys(comp.c).forEach(function (t) { for (var i = 0; i < comp.c[t]; i++) lpSpawn(t, c, false); });
  });
}
function lpWallX(c) { return c === 'L' ? LP.w0 : LP.w1; }
function lpStartCross(tr) {
  var slots = LUPE.m.wall.slots.filter(function (s) { return s.type === tr.slot; });
  if (!slots.length) return;
  var sl = slots[Math.floor(Math.random() * slots.length)], wx = lpWallX(tr.from), best = null, bd = 1e9;
  LUPE.pts.forEach(function (p) {
    if (p.t !== tr.t || p.c !== tr.from || p.cross || p.fade < 0 || p.a < 0.9 || p.bound) return;
    var d = Math.abs(p.x - wx) + Math.abs(p.y - sl.y) * 0.6;
    if (d < bd) { bd = d; best = p; }
  });
  if (!best) return;
  var ex = lpWallX(tr.from), ox = lpWallX(tr.to), dir = tr.to === 'R' ? 1 : -1;
  var dest = { x: ox + dir * lpRand(14, 60), y: lpClamp(sl.y + lpRand(-26, 26), LP.top + 6, LP.bot - 6) };
  best.cross = { t: 0, dur: tr.slot === 'pump' || tr.slot === 'secr' || tr.slot === 'sglt' ? 1.7 : 1.3,
                 p: [{ x: best.x, y: best.y }, { x: ex - dir * 3, y: sl.y }, { x: ox + dir * 3, y: sl.y }, dest], to: tr.to };
  /* Dichte bleibt gleich: Nachschub auf der Herkunftsseite sofort (der Harn fliesst nach) ... */
  lpSpawn(tr.t, tr.from, true);
}
/* ... Abtransport auf der Zielseite erst, wenn das Teilchen dort ankommt (Blut/Vasa recta nehmen es mit) */
function lpArrive(p) {
  var far = null, fd = -1, twx = lpWallX(p.c);
  LUPE.pts.forEach(function (q) {
    if (q === p || q.t !== p.t || q.c !== p.c || q.cross || q.fade < 0) return;
    var d = Math.abs(q.x - twx);
    if (d > fd) { fd = d; far = q; }
  });
  if (far) far.fade = -1;
}
function lupeStep(dt) {
  var m = LUPE.m;
  m.tr.forEach(function (tr, k) {
    LUPE.acc[k] = (LUPE.acc[k] || 0) + tr.rate * dt;
    while (LUPE.acc[k] >= 1) { LUPE.acc[k] -= 1; lpStartCross(tr); }
  });
  var keep = [];
  LUPE.pts.forEach(function (p) {
    if (p.fade > 0) { p.a = Math.min(1, p.a + dt * 2); if (p.a >= 1) p.fade = 0; }
    if (p.fade < 0) { p.a -= dt * 1.6; if (p.a <= 0) return; }
    if (p.cross) {
      var c = p.cross; c.t += dt / c.dur;
      var u = Math.min(1, c.t), seg = u * 3, i = Math.min(2, Math.floor(seg)), f = seg - i;
      f = f * f * (3 - 2 * f);
      p.x = c.p[i].x + (c.p[i + 1].x - c.p[i].x) * f; p.y = c.p[i].y + (c.p[i + 1].y - c.p[i].y) * f;
      if (u >= 1) { p.c = c.to; p.cross = null; p.vx = 0; p.vy = 0; lpArrive(p); }
      keep.push(p); return;
    }
    var comp = p.c === 'L' ? m.L : m.R, x0 = p.c === 'L' ? LP.x0 : LP.r0, x1 = p.c === 'L' ? LP.x1 : LP.r1;
    var big = p.t === 'r' || p.t === 'p' ? 9 : 5, jit = p.t === 'w' ? 60 : (p.t === 'r' || p.t === 'p' ? 16 : 34);
    p.vx = p.vx * 0.9 + (Math.random() - 0.5) * jit * dt * 10; p.vy = p.vy * 0.9 + (Math.random() - 0.5) * jit * dt * 10;
    var flowV = comp.flow * (comp.kind === 'blood' ? 22 : 14);
    p.x += p.vx * dt; p.y += (p.vy + flowV) * dt;
    if (p.x < x0 + big) { p.x = x0 + big; p.vx = Math.abs(p.vx); }
    if (p.x > x1 - big) { p.x = x1 - big; p.vx = -Math.abs(p.vx); }
    if (comp.flow > 0 && p.y > LP.bot - big) p.y = LP.top + big;
    else if (comp.flow < 0 && p.y < LP.top + big) p.y = LP.bot - big;
    else if (comp.flow === 0) {
      if (p.y < LP.top + big) { p.y = LP.top + big; p.vy = Math.abs(p.vy); }
      if (p.y > LP.bot - big) { p.y = LP.bot - big; p.vy = -Math.abs(p.vy); }
    }
    keep.push(p);
  });
  LUPE.pts = keep;
}

/* ---- Zeichnen ---- */
function lpUrineColor(osm) {
  var t = Math.pow(lpClamp((osm - 100) / 1100, 0, 1), 0.78);
  var a = [243, 238, 220], b = [174, 124, 28];
  return 'rgba(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ',0.22)';
}
function lpBg(c, comp, x0, x1) {
  var fill = comp.kind === 'blood' ? 'rgba(150,30,40,0.30)' : comp.kind === 'capsule' ? 'rgba(235,225,190,0.12)'
           : comp.kind === 'tissue' ? 'rgba(96,58,44,0.55)' : lpUrineColor(comp.osm);
  c.fillStyle = fill; c.fillRect(x0, LP.top - 4, x1 - x0, LP.bot - LP.top + 8);
  /* je mehr geloeste Teilchen, desto violetter der Raum */
  c.fillStyle = 'rgba(160,110,220,' + (0.03 + 0.22 * lpClamp((comp.osm - 150) / 1050, 0, 1)).toFixed(3) + ')';
  c.fillRect(x0, LP.top - 4, x1 - x0, LP.bot - LP.top + 8);
}
function lpHex(c, x, y, r) { c.beginPath(); for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; c[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); } c.closePath(); }
function lpDiamond(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); }
function lpParticle(c, p) {
  c.globalAlpha = lpClamp(p.a, 0, 1);
  c.fillStyle = LP_COL[p.t];
  if (p.t === 'w') { c.globalAlpha *= p.cross ? 1 : 0.6; c.beginPath(); c.arc(p.x, p.y, p.cross ? 2.8 : 2.1, 0, 6.283); c.fill(); }
  else if (p.t === 's') { c.beginPath(); c.arc(p.x, p.y, 3.9, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(40,10,60,0.85)'; c.lineWidth = 1; c.stroke(); }
  else if (p.t === 'g') { lpHex(c, p.x, p.y, 4.4); c.fill(); }
  else if (p.t === 'd') { lpDiamond(c, p.x, p.y, 4.4); c.fill(); }
  else if (p.t === 'r') { c.beginPath(); c.ellipse(p.x, p.y, 8, 5, 0, 0, 6.283); c.fill(); c.fillStyle = 'rgba(70,0,10,0.55)'; c.beginPath(); c.ellipse(p.x, p.y, 3.5, 2, 0, 0, 6.283); c.fill(); }
  else if (p.t === 'p') { c.beginPath(); c.arc(p.x, p.y, 6.5, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(120,100,80,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x - 3, p.y); c.quadraticCurveTo(p.x, p.y - 4, p.x + 3, p.y); c.stroke(); }
  if (p.bound) { c.fillStyle = LP_COL.d; lpDiamond(c, p.x + 4, p.y - 4, 3.2); c.fill(); }
  c.globalAlpha = 1;
}
function lpWall(c, wall) {
  var x0 = LP.w0, x1 = LP.w1, cx = (x0 + x1) / 2;
  if (wall.kind === 'filter') {
    c.fillStyle = 'rgba(230,200,190,0.18)'; c.fillRect(x0 + 18, LP.top - 4, x1 - x0 - 36, LP.bot - LP.top + 8);
    c.strokeStyle = 'rgba(234,223,214,0.85)'; c.lineWidth = 2;
    for (var y = LP.top; y < LP.bot; y += 12) { c.beginPath(); c.moveTo(cx - 12, y); c.lineTo(cx + 12, y + 6); c.stroke(); }
  } else {
    var thin = wall.kind === 'thin', w = thin ? 18 : (x1 - x0 - 8), left = cx - w / 2;
    var n = thin ? 5 : 4, hgt = (LP.bot - LP.top + 8) / n;
    for (var k = 0; k < n; k++) {
      var yy = LP.top - 4 + k * hgt;
      c.fillStyle = wall.kind === 'thick' ? 'rgba(214,170,120,0.55)' : 'rgba(214,190,160,0.42)';
      c.strokeStyle = 'rgba(40,30,25,0.6)'; c.lineWidth = 1;
      c.beginPath(); c.rect(left, yy + 1, w, hgt - 2); c.fill(); c.stroke();
      c.fillStyle = 'rgba(90,60,80,0.75)'; c.beginPath(); c.ellipse(cx + (thin ? 0 : 8), yy + hgt / 2, thin ? 3 : 7, thin ? 5 : 5, 0, 0, 6.283); c.fill();
      if (wall.kind === 'thick') { c.fillStyle = 'rgba(120,70,40,0.6)'; for (var q = 0; q < 3; q++) { c.beginPath(); c.ellipse(left + 8 + q * 7, yy + 8 + q * 5, 3, 1.5, 0.5, 0, 6.283); c.fill(); } }
    }
    if (wall.brush) { c.strokeStyle = 'rgba(214,190,160,0.7)'; c.lineWidth = 1; for (var b = LP.top; b < LP.bot; b += 4) { c.beginPath(); c.moveTo(left, b); c.lineTo(left - 5, b); c.stroke(); } }
  }
  wall.slots.forEach(function (s) {
    if (s.type === 'filter') return;
    var y = s.y;
    if (s.type === 'chan') {
      c.fillStyle = 'rgba(12,26,32,0.9)'; c.fillRect(x0 + 2, y - 4, x1 - x0 - 4, 8);
      c.strokeStyle = LP_COL.w; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0 + 2, y - 5); c.lineTo(x1 - 2, y - 5); c.moveTo(x0 + 2, y + 5); c.lineTo(x1 - 2, y + 5); c.stroke();
    } else {
      var col = s.type === 'sglt' ? LP_COL.g : (s.type === 'secr' ? LP_COL.d : LP_COL.s);
      c.fillStyle = 'rgba(12,26,32,0.85)'; c.beginPath(); c.arc(cx, y, 10, 0, 6.283); c.fill();
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(cx, y, 10, 0, 6.283); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(cx - 4, y - 4); c.lineTo(cx + 5, y); c.lineTo(cx - 4, y + 4); c.closePath();
      if (s.type === 'secr') { c.beginPath(); c.moveTo(cx + 4, y - 4); c.lineTo(cx - 5, y); c.lineTo(cx + 4, y + 4); c.closePath(); }
      c.fill();
      if (s.busy) { c.fillStyle = LP_COL.g; lpHex(c, cx, y - 14, 4); c.fill(); lpHex(c, cx, y + 14, 4); c.fill(); }
      if (s.blocked) {
        c.fillStyle = LP_COL.d; lpDiamond(c, cx - 11, y - 9, 4.5); c.fill();
        c.strokeStyle = '#E0523F'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(cx - 7, y - 7); c.lineTo(cx + 7, y + 7); c.moveTo(cx + 7, y - 7); c.lineTo(cx - 7, y + 7); c.stroke();
      }
    }
  });
}
function lpHeader(c, m) {
  c.textBaseline = 'alphabetic'; c.textAlign = 'center';
  [['L', LP.x0, LP.x1], ['R', LP.r0, LP.r1]].forEach(function (h) {
    var comp = m[h[0]], cx = (h[1] + h[2]) / 2;
    c.fillStyle = '#E7EFF0'; c.font = '600 11px system-ui, sans-serif'; c.fillText(comp.name, cx, 14);
    c.fillStyle = '#8DA7B1'; c.font = '10px ui-monospace, monospace'; c.fillText('\u2248 ' + lpR(comp.osm) + ' mosmol/l', cx, 28);
  });
  c.fillStyle = '#8DA7B1'; c.font = '9.5px ui-monospace, monospace'; c.fillText(m.wall.label, (LP.w0 + LP.w1) / 2, 14);
  /* Richtungspfeile der Transporte auf der Wand */
  var y = LP.bot + 4;
  m.tr.forEach(function (tr, k) {
    if (tr.rate < 0.2) return;
    var col = LP_COL[tr.t], dir = tr.to === 'R' ? 1 : -1, x0 = (LP.w0 + LP.w1) / 2 - dir * 14, yy = LP.top + 4 + k * 9;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + dir * 22, yy); c.stroke();
    c.beginPath(); c.moveTo(x0 + dir * 28, yy); c.lineTo(x0 + dir * 21, yy - 4); c.lineTo(x0 + dir * 21, yy + 4); c.closePath(); c.fill();
  });
  /* Fliessrichtung */
  c.fillStyle = 'rgba(141,167,177,0.8)'; c.font = '10px system-ui, sans-serif';
  ['L', 'R'].forEach(function (k) {
    var comp = m[k]; if (!comp.flow) return;
    var x = k === 'L' ? LP.x0 + 8 : LP.r1 - 8, y1 = comp.flow > 0 ? LP.bot - 4 : LP.top + 10;
    c.fillText(comp.flow > 0 ? '\u2193' : '\u2191', x, y1);
  });
}
function lupeDraw() {
  var c = LUPE.ctx, m = LUPE.m;
  if (!c || !m) return;
  c.setTransform(LUPE.dpr, 0, 0, LUPE.dpr, 0, 0);
  c.clearRect(0, 0, LUPE.W, LUPE.H);
  c.fillStyle = '#0C1A20'; c.fillRect(0, 0, LUPE.W, LUPE.H);
  lpBg(c, m.L, LP.x0, LP.x1); lpBg(c, m.R, LP.r0, LP.r1);
  lpWall(c, m.wall);
  LUPE.pts.forEach(function (p) { if (!p.cross && p.t === 'w') lpParticle(c, p); });
  LUPE.pts.forEach(function (p) { if (!p.cross && p.t !== 'w') lpParticle(c, p); });
  LUPE.pts.forEach(function (p) { if (p.cross) lpParticle(c, p); });
  lpHeader(c, m);
}

/* ---- Kaestchen, Ring im Modell, Verbindungslinie ---- */
function lupeState() { return SW.hg > 0.5 ? 'hg' : (SW.lt > 0.5 ? 'lt' : 'n'); }
function lupeText(m) {
  var t = m.tx, h = '';
  [['Viele gel\u00f6ste Teilchen:', t.many], ['Wenige:', t.few], ['Es wandert:', t.move], ['Darum:', t.why]].forEach(function (r) {
    h += '<p><b>' + r[0] + '</b> ' + r[1] + '</p>';
  });
  if (t.note) h += '<p class="lp-note">' + t.note + '</p>';
  return h;
}
function lupeSetSection(sec, depth, point) {
  LUPE.sec = sec; LUPE.depth = depth; LUPE.st = lupeState();
  if (point) LUPE.point.copy(point);
  LUPE.m = lupeModel(sec, depth, LUPE.st);
  lupeBuild();
  var dw = (sec === 'desc' || sec === 'asc' || sec === 'coll') ? (depth < 0.34 ? ' \u00b7 oben' : depth < 0.67 ? ' \u00b7 Mitte' : ' \u00b7 tief im Mark') : '';
  document.getElementById('lpTitle').textContent = LUPE_TITLES[sec] + dw;
  document.getElementById('lpText').innerHTML = lupeText(LUPE.m);
  Array.prototype.forEach.call(document.querySelectorAll('#lpChips button'), function (b) { b.classList.toggle('on', b.getAttribute('data-sec') === sec); });
  LUPE.ring.position.copy(LUPE.point); LUPE.ring.visible = true;
  LUPE.open = true; LUPE.box.classList.add('show');
  if (window.innerWidth < 1000 && SZ.aktiv && SZ.offen) SZ.zuklappen();
  setSelected(null); visVersion++;
}
function lupeRepPoint(sec) {                       /* typische Stelle je Abschnitt */
  if (sec === 'glom') return GC.clone().add(V(0.3, 0.2, 0.5));
  var f = { prox: [0, 'desc', 0.5], desc: ['desc', 'loop', 0.55], asc: ['asc', 'dist', 0.45], dist: ['dist', 'coll', 0.5], coll: ['coll', null, 0.55] }[sec];
  var a = f[0] === 0 ? 0 : TUB.start[f[0]], b = f[1] ? TUB.start[f[1]] : TUB.pts.length - 1;
  return TUB.pts[Math.round(a + (b - a) * f[2])].clone();
}
function lupeSectionAt(p) {
  if (p.distanceTo(GC) < 2.05) return { sec: 'glom', depth: 0 };
  var bi = 0, bd = 1e9;
  for (var i = 0; i < TUB.pts.length; i += 2) {
    var q = TUB.pts[i], dx = q.x - p.x, dy = q.y - p.y, dz = (q.z - p.z) * 0.5, d = dx * dx + dy * dy + dz * dz;
    if (d < bd) { bd = d; bi = i; }
  }
  var s = bi < TUB.start.desc ? 'prox' : bi < TUB.start.asc ? 'desc' : bi < TUB.start.dist ? 'asc' : bi < TUB.start.coll ? 'dist' : 'coll';
  return { sec: s, depth: lpClamp((3.0 - TUB.pts[bi].y) / 11.5, 0, 1) };
}
function lupePick(ray) {
  var hits = ray.intersectObjects(root.children, false).filter(function (h) { return h.object.visible; });
  if (!hits.length) return;
  var p = hits[0].point, s = lupeSectionAt(p);
  lupeSetSection(s.sec, s.depth, p);
}
function lupeClose() {
  LUPE.open = false; LUPE.mode = false;
  LUPE.box.classList.remove('show'); LUPE.ring.visible = false;
  LUPE.line.style.display = 'none';
  canvas.style.cursor = '';
  document.getElementById('bLupe').classList.remove('on');
  visVersion++;
}
(function buildLupe() {
  var box = document.createElement('div');
  box.className = 'panel'; box.id = 'lupe';
  box.innerHTML = '<button class="gh hbtn" id="bLupeX" title="Lupe schlie\u00dfen" style="right:8px">\u00d7</button>' +
    '<div class="lp-kick">Lupe \u00b7 Nahansicht</div><h3 id="lpTitle"></h3><div class="lp-chips" id="lpChips"></div>' +
    '<div class="lp-main"><canvas id="lpCv"></canvas><div class="lp-text" id="lpText"></div></div>' +
    '<div class="lp-leg"><span><i style="background:#3AA0FF"></i>Wasser</span><span><i style="background:#B98BD9"></i>Salz</span>' +
    '<span><i class="hx" style="background:#F5B301"></i>Zucker</span><span><i class="dm" style="background:#33E0A0"></i>Torasemid</span>' +
    '<span><i style="background:#B3202A"></i>Blutzelle</span><span><i style="background:#E4D6C4"></i>Eiwei\u00df</span></div>';
  document.body.appendChild(box);
  LUPE.box = box;
  var chips = box.querySelector('#lpChips');
  LUPE_SECS.forEach(function (s) {
    var b = document.createElement('button'); b.className = 'gh'; b.textContent = LUPE_NAMES[s]; b.setAttribute('data-sec', s);
    b.addEventListener('click', function () { var p = lupeRepPoint(s); lupeSetSection(s, s === 'glom' ? 0 : lupeSectionAt(p).depth, p); });
    chips.appendChild(b);
  });
  box.querySelector('#bLupeX').addEventListener('click', lupeClose);
  LUPE.cv = box.querySelector('#lpCv');
  LUPE.dpr = Math.min(window.devicePixelRatio || 1, 2);
  LUPE.cv.width = LUPE.W * LUPE.dpr; LUPE.cv.height = LUPE.H * LUPE.dpr;
  try { LUPE.ctx = LUPE.cv.getContext('2d'); } catch (e) { LUPE.ctx = null; }
  /* Ring im Modell: zeigt, wo die Lupe hinschaut */
  LUPE.ring = new THREE.Mesh(new THREE.RingGeometry(0.30, 0.38, 48),
    new THREE.MeshBasicMaterial({ color: 0xE0A94A, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide }));
  LUPE.ring.renderOrder = 999; LUPE.ring.visible = false; LUPE.ring.raycast = function () {};
  scene.add(LUPE.ring);
  LUPE.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  LUPE.line.setAttribute('class', 'lp-line'); LUPE.line.style.display = 'none';
  leaderSvg.appendChild(LUPE.line);
  document.getElementById('bLupe').addEventListener('click', function () {
    if (LUPE.mode || LUPE.open) { lupeClose(); return; }
    LUPE.mode = true; this.classList.add('on'); canvas.style.cursor = 'zoom-in';
    toast('Lupe: Tippe auf eine Stelle des Nephrons \u2013 oder w\u00e4hle unten einen Abschnitt.');
    var p = lupeRepPoint('desc'); lupeSetSection('desc', lupeSectionAt(p).depth, p);
  });
})();
var _lpV = new THREE.Vector3();
function lupeTick(dt) {
  if (!LUPE.open) return;
  if (lupeState() !== LUPE.st) lupeSetSection(LUPE.sec, LUPE.depth, null);      /* Zustand gewechselt */
  lupeStep(Math.min(dt, 0.05));
  lupeDraw();
  LUPE.ring.quaternion.copy(camera.quaternion);
  LUPE.ring.scale.setScalar(Math.max(0.35, view.dist / 14));
  /* Linie vom Ring zum Kaestchen */
  _lpV.copy(LUPE.point).project(camera);
  var w = window.innerWidth, h = window.innerHeight, r = LUPE.box.getBoundingClientRect();
  if (_lpV.z < 1 && r.width > 0) {
    var sx = (_lpV.x * 0.5 + 0.5) * w, sy = (-_lpV.y * 0.5 + 0.5) * h;
    var bx = Math.max(r.left + 12, Math.min(r.right - 12, sx)), by = sy < r.top ? r.top : (sy > r.bottom ? r.bottom : r.top);
    LUPE.line.setAttribute('x1', sx); LUPE.line.setAttribute('y1', sy);
    LUPE.line.setAttribute('x2', bx); LUPE.line.setAttribute('y2', by);
    LUPE.line.style.display = '';
  } else LUPE.line.style.display = 'none';
}

/* =====================================================================
   9. Export
   ===================================================================== */
function toast(msg) { Kern.toast(msg); }
var exCfg = {
  titel: 'Nephron', praefix: 'nephron', wurzelName: 'Nephron',
  /* Schild unter dem Modell: Bounding-Box der exportierten Teile (ohne Teilchen) x -5,48 bis 7,10, y -9,10 bis 8,09, z bis 1,19
     -> x Mitte 0,8; y 1,5 cm unter der Unterkante (-10,6); z vorn (max z) */
  schild: [0.8, -10.6, 1.2],
  bereit: function () { return true; },
  gruppen: function () { return [root]; },
  toast: toast,
  transparenz: true,
  unlit: true,
  /* Szenario zur Laufzeit: Namensteil auch im statischen Export (z. B. nephron_statisch_torasemid.glb) */
  get zusatzStatisch() { return SW.hg > 0.5 ? 'hyperglykaemie' : (SW.lt > 0.5 ? 'torasemid' : ''); },
  /* Strömung backen: je Teilchen ein Knoten (Größe 0 = unsichtbar), Position und Größe als Spuren */
  animation: function (rootE) {
    var times = new Float32Array(NKEY + 1), i, tracks = [], nPart = 0;
    for (i = 0; i <= NKEY; i++) times[i] = i * DUR / NKEY;
    /* Unsichtbare Keyframes: Das Teilchen parkt dort, wo es gerade verschwunden ist
       oder gleich auftaucht - bei Etappen sogar genau auf dem Weg der Nachbaretappe.
       So fliegt beim Interpolieren nichts quer durchs Modell. */
    var keyPos = function (p, u) {
      var r = sample(p, u);
      if (r) return r;
      var after = u - p.span, before = 1 - u, tau;
      if (p.lane) {
        tau = after <= before ? p.t1 + after * DUR / p.T : p.t0 - before * DUR / p.T;
        return { pos: p.curve.getPointAt(arcAt(p, Math.max(0, Math.min(1, tau)))), s: 0 };
      }
      return { pos: p.curve.getPointAt(arcAt(p, after <= before ? 1 : 0)), s: 0 };
    };
    Object.keys(PSTREAMS).forEach(function (sid) {
      var S = PSTREAMS[sid];
      if (!S.mesh.visible) return;
      S.list.forEach(function (p, n) {
        var mu = scenMul(p);
        if (mu < 0.002) return;                                      /* im aktuellen Zustand unsichtbar */
        var node = new THREE.Mesh(S.geo, MAT[sid]); node.name = S.name + '_' + (n + 1);
        node.quaternion.copy(p.rot);
        var P = new Float32Array((NKEY + 1) * 3), Sc = new Float32Array((NKEY + 1) * 3);
        for (i = 0; i <= NKEY; i++) {
          var r = keyPos(p, (i / NKEY + p.off) % 1), pt = r.pos, e = r.s * mu;
          P[i * 3] = pt.x; P[i * 3 + 1] = pt.y; P[i * 3 + 2] = pt.z;
          Sc[i * 3] = e; Sc[i * 3 + 1] = e; Sc[i * 3 + 2] = e;
        }
        node.position.set(P[0], P[1], P[2]); node.scale.set(Sc[0], Sc[1], Sc[2]);
        rootE.add(node);
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.position', times, P));
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.scale', times, Sc));
        nPart++;
      });
    });
    return { clips: [new THREE.AnimationClip('Nephron_Stroemung', DUR, tracks)], zusatz: SW.hg > 0.5 ? 'hyperglykaemie' : (SW.lt > 0.5 ? 'torasemid' : 'normal'), nPart: nPart };
  },
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    animStart: 'Strömung wird aufgezeichnet …',
    stlLiesmich: ['Datei (Maßstab Millimeter, Z-Achse nach oben):', '- nephron_ansicht.stl: alles, was beim Export sichtbar war', 'STL kennt weder Farbe noch Bewegung – dafür gibt es die GLB-Dateien.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Datei, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Ohne Strömung – STL kennt weder Farbe noch Bewegung.';
    },
    glbLiesmich: function (i) {
      return [i.anim ? i.name + ': die Strömung (' + i.a.nPart + ' Teilchen, ' + DUR + ' s) als Animation, läuft in Schleife.' : i.name + ': farbiges 3D-Modell in der Ansicht beim Export, ohne Strömung.', 'Maßstab: Meter (reale Größe). Die Signatur steht in den Metadaten und auf dem Schild unter dem Nephron.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span>' +
        (i.anim ? '<br>' + i.a.nPart + ' Teilchen mit ' + (NKEY + 1) + ' Keyframes, ' + DUR + ' s Schleife. Im Viewer die Wiedergabe starten.' : '<br>Nur Geometrie, mit Farben, ohne Strömung.');
    }
  }
};
document.getElementById('bGlbA').onclick = function () { Kern.Export.run('glb-anim', exCfg); };
document.getElementById('bGlbS').onclick = function () { Kern.Export.run('glb', exCfg); };
document.getElementById('bStl').onclick = function () { Kern.Export.run('stl', exCfg); };

/* =====================================================================
   AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore)
   oder AR Quick Look (iPhone/iPad, Safari) mit selbst erzeugter USDZ-Datei
   ===================================================================== */
var inAR = false;
var AR = Kern.AR.xr({
  renderer: renderer, scene: scene, camera: camera, root: root,
  stufen: [0.008, 0.012, 0.0175, 0.025, 0.035, 0.05], skala: 0.0175,
  fuss: 9.1,                                        /* Unterkante des Modells steht auf der Fläche */
  hintergrund: 0x0b171c,
  ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
  knoepfe: ['arEnd', 'arSee', 'arLab', 'arSmall', 'arBig', 'arPlace', 'arPause'],
  quickLook: function () { arQuickLook(); },
  beimStart: function () {
    inAR = true;
    applyVisibility();
    document.getElementById('arSee').textContent = seeThrough ? 'Undurchsichtig' : 'Durchsichtig';
    document.getElementById('arLab').textContent = showLabels ? 'Beschriftung aus' : 'Beschriftung an';
    document.getElementById('arPause').textContent = playing ? 'Pause' : 'Weiter';
  },
  beimEnde: function () {
    inAR = false;
    applyVisibility();
    ARL.ausblenden();
    resize();
    lastLabelKey = '';
  }
});
document.getElementById('arSee').onclick = function () { document.getElementById('bSee').click(); this.textContent = seeThrough ? 'Undurchsichtig' : 'Durchsichtig'; };
document.getElementById('arLab').onclick = function () { document.getElementById('bLab').click(); this.textContent = showLabels ? 'Beschriftung aus' : 'Beschriftung an'; };
document.getElementById('arPause').onclick = function () { document.getElementById('bPlay').click(); this.textContent = playing ? 'Pause' : 'Weiter'; };
document.getElementById('bAR').onclick = function () { AR.start(); };
AR.check();
/* ---- Beschriftung im AR: Schilder mit Führungslinien (Kern.AR.schilder) ---- */
var ARL = Kern.AR.schilder({
  root: root, renderer: renderer, camera: camera, xr: AR,
  name: 'Nephron', anzahl: ANCHORS.length,
  masse: { mitte: 1.0, spalte: 8.6, hoehe: 1.3, abstand: 1.75, z: 2.2, oben: 7.6, unten: -8.2, px: 128 },
  liste: function () {
    var out = [];
    ANCHORS.forEach(function (a) {
      a.s = STRUCT[a.sid];
      if (showLabels && enabled[a.sid]) out.push({ a: a, p: [a.p.x, a.p.y, a.p.z] });
    });
    return out;
  },
  auswahl: function () { return selected; }
});
/* ---- USDZ für AR Quick Look: Momentaufnahme des Modells (ohne Teilchen) ---- */
function usdzBuild() {
  return Kern.AR.usdz({
    name: 'Nephron', creator: 'Nephron 3D - ' + Kern.WM, datei: 'nephron.usda', skala: 0.0175,
    gruppen: [root],
    beschriftung: function (f4) {
      var v = new THREE.Vector3();
      root.updateWorldMatrix(true, false);
      return ARL.usd(f4, function (x, y, z) { v.set(x, y, z).applyMatrix4(root.matrixWorld); return [v.x * 0.0175, v.y * 0.0175, v.z * 0.0175]; });
    }
  });
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: document.getElementById('arQL'), fertig: 'Das Nephron öffnet sich in AR Quick Look. Mit zwei Fingern lässt es sich vergrößern und drehen.' });
}

/* =====================================================================
   10. Renderschleife
   ===================================================================== */
function groesse(w, h) {
  camera.updateProjectionMatrix();
  Kern.linienFlaeche(leaderSvg, w, h);
}
/* volle Anpassung (Renderer, Kamera, Organ) für den Aufruf aus dem Organ, z. B. nach dem AR-Ende */
function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  groesse(w, h);
}

var last = performance.now();
function loop(now, frame) {
  if (inAR) AR.frame(frame);
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (playing) clock += dt * speed;
  var scChanged = SZ.schritt(dt);                           /* weich ein- und ausblenden, auch in der Pause */
  if (scChanged) applyScenarioVisuals();
  updateParticles();
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  if (inAR) { ARL.update(); renderer.render(scene, camera); return; }
  updateCamera();
  renderer.render(scene, camera);
  lupeTick(dt);
  layoutLabels(window.innerWidth, window.innerHeight);
}

applyVisibility();
setSelected(null);
var bereitT = null, bereitOk = null;
organ.bild = loop; organ.groesse = groesse;
/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  if (bereitT !== null) { clearTimeout(bereitT); bereitT = null; bereitOk(); }
  clearTimeout(Kern.toast._t);
  AR.abbauen(); ARL.abbauen();
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  SZ.abbauen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  canvas.style.cursor = '';
  /* DOM */
  if (LUPE.box.parentNode) LUPE.box.parentNode.removeChild(LUPE.box);
  umg.bereich.innerHTML = '';
  labelBox.innerHTML = ''; leaderSvg.innerHTML = '';
  var tt = document.getElementById('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  document.getElementById('boot').classList.remove('gone');
};
return new Promise(function (ok) { bereitOk = ok; bereitT = setTimeout(function () { bereitT = null; Kern.Export.pruefeZiel('exp'); document.getElementById('boot').classList.add('gone'); ok(); }, 240); });

}
Kern.organ('nephron', organ);
})();
