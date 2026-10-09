/* ==========================================================================
   Lunge - Form: Brustkorb-Innenraum (Rippenparameter) und Aussenform der
   Lungenfluegel als Baustein fuer den Koerper (und spaeter das Detailmodell
   der Lunge). Signed-Distance-Feld, Einheit cm, Innen < 0, aus den Bausteinen
   von Kern.SDF (core/sdf.js).
   Klassisches Skript (kein Modul). Beim Laden wird nur die Form mit Kern.form
   angemeldet, nichts aufgebaut; keine globalen Namen. Geladen wird sie ueber
   Kern.FORMEN/Kern.formLaden (core/rahmen.js).

   Koordinaten wie im Koerper (cm): x + links, y oben, z vorn. Die Lunge
   rechts hat s = -1, die linke s = 1.

   Enthalten:
     zst(y), zSternum(y)  Lage der Wirbelsaeule bzw. des Brustbeins (z) je Hoehe
     interp(t, y)         Verlauf mit glatter Zwischenstufe (Tabelle [[y, wert], ...])
     RIP_R, RIP_YA        Rippenradius, Ansatzhoehe am Brustbein (Rippe 1-7)
     rippen()             Verlauf je Rippe (i = 0..11) als Ellipsenbogen
     thoraxInnen(x,y,z)   Innenraum des Brustkorbs (aus den Rippen)
     domY(x,z,xc,ytop)    Zwerchfellkuppel; DOM_R, DOM_L = Scheitelhoehe rechts/links
     lunge(s, herz)       SDF-Funktion des Lungenfluegels s mit Lappenfurchen (Koerper); herz = { smp, v }
                          (Abtaster der Herzform und Verschiebung Herz -> Koerper)
                          oder null (dann Ersatz-Herzbucht)
     fluegel(s, herz)     wie lunge, aber ohne Furchen (Grundlage der Lappen und des Rippenfells)
     grenzen(s)           Gitterbox [[x0,y0,z0],[x1,y1,z1]] des Fluegels s
     HERZ_V               Verschiebung Herz-Modell -> Koerper (Herzbucht, Lage des Herzens)
     rippeStuetz(i,s,lg,hh) Stuetzpunkte der Rippe i, Seite s (lg = Lunge, hh = Haut oder null)
     lappen(s, herz)      Lungenlappen des Fluegels s: Liste { id, sdf, grenzen }, durch Spalten getrennt
     bronchien(herz)      Bronchialbaum: Liste von Aesten { pts, r0, r1, lappen, gen }, Eigenschaft endpunkte
     TRACHEA, hauptbronchus(s)  Mittellinien von Luftroehre und Hauptbronchus
   ========================================================================== */
(function () {
'use strict';
var S = Kern.SDF;
var PI = Math.PI;
var ell = S.ellipsoid, kap = S.kapsel;

/* Verlauf mit glatter Zwischenstufe: Tabelle [[y, wert], ...] aufsteigend */
function interp(t, y) {
  if (y <= t[0][0]) return t[0][1];
  for (var i = 1; i < t.length; i++) if (y <= t[i][0]) {
    var f = (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]); f = f * f * (3 - 2 * f);
    return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * f;
  }
  return t[t.length - 1][1];
}

var ZST = [[82, -7.5], [92, -4.8], [100, -4.2], [110, -5.8], [120, -7.5], [130, -7.6], [142, -6.2], [150, -4.5]];
function zst(y) { return interp(ZST, y); }
function zSternum(y) { return 4.3 + (143 - y) * 0.31; }

/* Rippen: Verlauf je Rippe (i = 0..11) als Ellipsenbogen um den Brustkorb; die Parameter dienen auch der Lunge (Innenraum) */
var RIP_R = 0.5;
var RIP_A = [6.6, 9.0, 11.4, 13.2, 14.3, 14.8, 15.0, 15.0, 14.8, 14.4, 13.4, 12.4];   /* halbe Breite der Rippenmittellinie */
var RIP_XE = [2.6, 4.6, 6.2, 7.2, 8.0, 8.4, 8.6, 12.4, 13.0, 13.4, 12.9, 11.7];       /* seitlicher Abstand des vorderen Knochenendes */
var RIP_YE = [139.1, 135.7, 132.0, 128.4, 124.8, 121.9, 119.8, 117.9, 116.2, 114.6, 112.4, 110.4];   /* Hoehe des vorderen Knochenendes */
var RIP_YA = [139.4, 136.8, 134.0, 131.2, 128.4, 125.6, 123.2];      /* Ansatzhoehe am Brustbein (Rippe 1-7) */
var RIP_ZE = [6.0, 4.6, 3.2, 0.8, -2.5];                             /* vorderes Ende Rippe 8-12 (z) */
var RIP_P = null;
function rippenParam() {
  if (RIP_P) return RIP_P;
  RIP_P = [];
  for (var i = 0; i < 12; i++) {
    var yb = 140 - 2.1 * i + 0.6, A = RIP_A[i], xe = RIP_XE[i];
    var zb = zst(yb) - (i < 2 ? 1.2 : 1.6), ze = i < 7 ? zSternum(RIP_YA[i]) - (i < 5 ? 0.3 : i === 5 ? 0.6 : 1.3) : RIP_ZE[i - 7];
    var ua = Math.sqrt(1 - Math.pow(3.3 / A, 2)), va = Math.sqrt(1 - Math.pow(xe / A, 2));
    var B = (ze - zb) / (ua + va);
    RIP_P.push({ yb: yb, ye: RIP_YE[i], A: A, B: B, zc: zb + B * ua, zb: zb, p0: Math.asin(3.3 / A), p1: PI - Math.asin(xe / A) });
  }
  return RIP_P;
}

/* Zwerchfellkuppel: Hoehe der Flaeche ueber (x,z); xc = Mitte der Kuppel */
function domY(x, z, xc, ytop) {
  var u = (x - xc) / 9.5, v = (z - 0.5) / 10.5;
  return ytop - 16 * (u * u + v * v);
}
var DOM_R = 118, DOM_L = 115.5;

/* Innenraum des Brustkorbs: elliptischer Querschnitt je Hoehe aus den Rippen (Abstand Rippe + 1.2 cm), schnuert die Lunge ein */
var THX = null;
function thoraxInnen(x, y, z) {
  if (!THX) {
    THX = rippenParam().map(function (P) { return [P.yb + (P.ye - P.yb) * 0.4, P.A - 1.7, P.B - 1.7, P.zc]; }).reverse();
  }
  var t = THX, n = t.length, a, i, f;
  if (y <= t[0][0]) a = t[0]; else if (y >= t[n - 1][0]) a = t[n - 1];
  else {
    for (i = 1; i < n && y > t[i][0]; i++);
    f = (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
    a = [0, t[i - 1][1] + (t[i][1] - t[i - 1][1]) * f, t[i - 1][2] + (t[i][2] - t[i - 1][2]) * f, t[i - 1][3] + (t[i][3] - t[i - 1][3]) * f];
  }
  var u = x / a[1], v = (z - a[3]) / a[2];
  return (Math.sqrt(u * u + v * v) - 1) * Math.min(a[1], a[2]);
}

/* Lungenfluegel s (-1 rechts, 1 links) ohne die Lappenfurchen; herz = { smp, v } formt die Herzbucht nach dem Herzen, null = Ersatz-Herzbucht */
function fluegel(s, herz) {
  var cx = s * 8.4, ytop = s < 0 ? DOM_R : DOM_L, xc = s * 6.5;
  var rx = s < 0 ? 5.2 : 4.9;
  return function (x, y, z) {
    var d = ell(x, y, z, cx - s * 0.18 * Math.max(0, y - 122), 125, -0.8, rx, 19, 7.8);   // Spitze neigt sich zur Mitte
    d = S.smax(d, thoraxInnen(x, y, z), 1.0);
    d = Math.max(d, 0.4 * (domY(x, z, xc, ytop) + 0.5 - y));
    if (herz) {
      d = S.smax(d, -(herz.smp.val(x - herz.v[0], y - herz.v[1], z - herz.v[2]) - 0.4), 0.8);   // Herzbucht nach der Form des Herzens
      if (s > 0) d = S.smax(d, -kap(x, y, z, 4.7, 127, -3.2, 3.8, 110, -2.6, 2.1), 0.8);       // Aortenrinne
    } else if (s > 0) {
      d = S.smax(d, -ell(x, y, z, 4.6, 120.5, 2.8, 6.4, 8.0, 5.2), 1);          // Herzbucht
      d = S.smax(d, -kap(x, y, z, 5.1, 134, -4.1, 3.8, 110, -2.6, 2.1), 0.8);  // Aortenrinne
    }
    return d;
  };
}

/* Lungenfluegel s mit flachen Furchen an den Lappengrenzen (fuer den Koerper) */
function lunge(s, herz) {
  var f = fluegel(s, herz);
  return function (x, y, z) {
    var d = f(x, y, z);
    /* Lappengrenzen: flache Furchen */
    var sc = Math.max(Math.abs(0.515 * (y - 123) + 0.857 * z) - 0.5, -(d + 2.0));
    d = Math.max(d, -sc);
    if (s < 0) {
      var sh = Math.max(Math.abs(y - 129.5) - 0.5, -(d + 2.0), 1 - z);
      d = Math.max(d, -sh);
    }
    return d;
  };
}

/* Gitterbox des Fluegels s (Koerper-Koordinaten) */
function grenzen(s) {
  return s < 0 ? [[-15, 105, -10], [-1.5, 146.5, 9.5]] : [[1.5, 105, -10], [15, 146.5, 9.5]];
}

/* Verschiebung Herz-Modell -> Koerper (wie im Koerper: Lage des Herzens, Herzbucht der Lunge) */
var HERZ_V = [2.0, 122.5, 2.4];

/* Rippe i, Seite s: Stuetzpunkte; Abstand zur Lunge (lg) und Haut (hh, null = keine Pruefung) werden eingehalten */
function rippeStuetz(i, s, lg, hh) {
  var P = rippenParam()[i], n = 15, pts = [], k, u, ph, x, z, y, dx, dz, l, m;
  for (k = 0; k <= n; k++) {
    u = k / n; ph = P.p0 + (P.p1 - P.p0) * u;
    x = P.A * Math.sin(ph);
    z = P.zc - P.B * Math.cos(ph) - 0.5 * Math.sin(PI * Math.min(1, u / 0.3));   /* erst nach hinten-seitlich */
    y = P.yb + (P.ye - P.yb) * Math.pow(u, 1.4);
    if (k === 0) x = 3.3;
    pts.push([s * x, y, z]);
  }
  /* radial nach aussen schieben, bis Lunge und Haut passen */
  for (k = 1; k <= n; k++) {
    var p = pts[k];
    dx = p[0]; dz = p[2] - P.zc; l = Math.sqrt(dx * dx + dz * dz); dx /= l; dz /= l;
    for (m = 0; m < 40 && lg(p[0], p[1], p[2]) < RIP_R + 0.6; m++) {
      var qx = p[0] + dx * 0.15, qz = p[2] + dz * 0.15;
      if (hh && hh(qx, p[1], qz) > -(RIP_R + 0.8)) break;
      p[0] = qx; p[2] = qz;
    }
  }
  /* glaetten (Enden bleiben) */
  for (m = 0; m < 2; m++) {
    var q = pts.map(function (a) { return a.slice(); });
    for (k = 1; k < n; k++) for (var c = 0; c < 3; c++) pts[k][c] = 0.25 * q[k - 1][c] + 0.5 * q[k][c] + 0.25 * q[k + 1][c];
  }
  return pts;
}

/* Lungenlappen des Fluegels s: Fluegel ohne Furchen, geschnitten mit den Spalten (Breite SPALT je Spalt, halbe Breite von jeder Seite).
   Schraege Spalte (Fissura obliqua): o > 0 ist vorn-oben (Ober- und Mittellappen), o < 0 der Unterlappen. Rechts zusaetzlich die
   waagerechte Spalte (Fissura horizontalis) bei y = 129.5, nur vorn (z > 1): darueber der Oberlappen, darunter der Mittellappen. */
var SPALT = 0.25, HOR_Y = 129.5, HOR_Z = 1;
function schraeg(y, z) { return 0.515 * (y - 123) + 0.857 * z; }
function lappen(s, herz) {
  var f = fluegel(s, herz), g = SPALT / 2, bx = grenzen(s), z0 = bx[0][2], z1 = bx[1][2], x0 = bx[0][0], x1 = bx[1][0];
  var box = function (y0, y1, zmin) { return [[x0, y0, zmin === undefined ? z0 : zmin], [x1, y1, z1]]; };
  if (s > 0) return [
    { id: 'oberlappenL', sdf: function (x, y, z) { return Math.max(f(x, y, z), g - schraeg(y, z)); }, grenzen: box(110, 146.5) },
    { id: 'unterlappenL', sdf: function (x, y, z) { return Math.max(f(x, y, z), g + schraeg(y, z)); }, grenzen: box(105, 136) }
  ];
  return [
    { id: 'oberlappenR', sdf: function (x, y, z) {
      return Math.max(f(x, y, z), g - schraeg(y, z), Math.min(HOR_Y + g - y, z - (HOR_Z - g)));
    }, grenzen: box(119, 146.5) },
    { id: 'mittellappen', sdf: function (x, y, z) {
      return Math.max(f(x, y, z), g - schraeg(y, z), y - (HOR_Y - g), (HOR_Z + g) - z);
    }, grenzen: box(112, 131, 0) },
    { id: 'unterlappenR', sdf: function (x, y, z) { return Math.max(f(x, y, z), g + schraeg(y, z)); }, grenzen: box(105, 136) }
  ];
}

/* Atemwege: Mittellinien (Koerper-Koordinaten). Luftroehre bis zur Gabelung, Hauptbronchus s bis zum Hilus (rechts steiler und kuerzer,
   links flacher und laenger) */
var TRACHEA = [[0, 149, -0.7], [0, 140, -1.4], [0, 134, -2.2], [0, 128.5, -3.3]];
function hauptbronchus(s) {
  return s < 0 ? [[0, 128.5, -3.3], [s * 2.6, 126.4, -3.2], [s * 5.4, 123.6, -2.6]]
    : [[0, 128.5, -3.3], [s * 3.6, 126.6, -3.3], [s * 7.0, 124.2, -2.6]];
}

/* Bronchialbaum: Lappenbronchus je Lappen (gen 0, Lappenmitte als Ziel) und darunter 3 Generationen Aeste (gen 1-3), deterministisch.
   Jeder Ast ab gen 1 wird gekuerzt, bis sein Ende im Lappen liegt (Lappen-SDF, Rand 0.3 cm + Radius); die Enden der letzten
   Generation sind die Endpunkte (Anschluss der Alveolen). Liste von { pts: [[x,y,z], ...], r0, r1, lappen, gen }; Eigenschaft endpunkte
   = [{ p: [x,y,z], lappen, r }]. Aeste liegen in Koerper-Koordinaten. */
var LAPPEN_WEG = {   /* Lappenbronchus: Abzweig am Hauptbronchus (Hilus), zwei Zwischenpunkte, Ziel; die Lunge ist duenn, die Punkte liegen in der Mitte der Lappen */
  oberlappenR: [[-5.4, 123.6, -2.6], [-6.4, 128.4, -1.6], [-5.6, 133.0, -0.7], [-4.8, 137.0, -0.6]],
  mittellappen: [[-5.4, 123.6, -2.6], [-6.5, 125.0, 0.6], [-7.1, 125.8, 2.6], [-7.4, 126.0, 4.0]],
  unterlappenR: [[-5.4, 123.6, -2.6], [-6.6, 120.5, -3.4], [-6.8, 118.8, -3.8], [-6.6, 117.2, -4.4]],
  oberlappenL: [[7.0, 124.2, -2.6], [6.5, 128.6, -1.2], [5.6, 133.0, 0.2], [4.8, 137.0, -0.4]],
  unterlappenL: [[7.0, 124.2, -2.6], [7.8, 121.2, -3.2], [8.4, 119.0, -3.2], [8.4, 117.2, -3.6]]
};
function bronchien(herz) {
  var aeste = [], endpunkte = [];
  var norm = function (v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  var kreuz = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
  var punktAuf = function (pts, t) {   /* Punkt bei Anteil t der Streckenfolge */
    var L = [0], i, tot = 0;
    for (i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]); L.push(tot); }
    var d = t * tot;
    for (i = 1; i < pts.length && L[i] < d; i++);
    i = Math.min(i, pts.length - 1);
    var f = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [0, 1, 2].map(function (c) { return pts[i - 1][c] + (pts[i][c] - pts[i - 1][c]) * f; });
  };
  var alle = lappen(-1, herz).concat(lappen(1, herz)), sdf = {};
  alle.forEach(function (l) { sdf[l.id] = l.sdf; });
  var LAENGE = [0, 3.4, 2.1, 1.3], RADIUS = [0, [0.36, 0.26], [0.26, 0.18], [0.18, 0.12]], ANZAHL = [0, 3, 2, 2];
  var wink = 0;
  /* Aeste der Generation gen unter dem Ast p (Punkte pts); ziel = Lappenmitte */
  function kinder(lap, pts, gen, ziel, r1) {
    if (gen > 3) return;
    var n = gen === 1 && lap === 'mittellappen' ? 2 : ANZAHL[gen], k;
    var a = pts[pts.length - 2], b = pts[pts.length - 1], d = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    var u = norm(kreuz(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = kreuz(d, u);
    for (k = 0; k < n; k++) {
      var t = gen === 1 ? 0.45 + 0.27 * k : 1;   /* gen 1 zweigen entlang des Lappenbronchus ab, spaetere am Ende */
      var st = gen === 1 ? punktAuf(pts, t) : b;
      var w = wink + (k + 0.37 * gen) * (2 * PI / n) + 0.9 * gen; wink += 0.7;
      var zu = norm([ziel[0] - st[0], ziel[1] - st[1], ziel[2] - st[2]]);
      var L0 = LAENGE[gen] * (0.85 + 0.15 * Math.sin(w * 1.7 + gen)), ende = null, dir = null, q, e, L;
      for (e = 0; e < 3 && !ende; e++) {   /* Richtung schrittweise mehr zur Lappenmitte, wenn der Ast sonst aus dem Lappen liefe */
        var sw = [0.8, 0.45, 0.15][e];
        dir = norm([0, 1, 2].map(function (c) { return 0.5 * d[c] + 0.25 * zu[c] + sw * (Math.cos(w) * u[c] + Math.sin(w) * v[c]) + (0.4 - 0.4 * sw) * zu[c]; }));
        L = L0;
        for (q = 0; q < 9; q++) {
          ende = [st[0] + dir[0] * L, st[1] + dir[1] * L, st[2] + dir[2] * L];
          var mi = [(st[0] + ende[0]) / 2, (st[1] + ende[1]) / 2, (st[2] + ende[2]) / 2];
          if (sdf[lap](ende[0], ende[1], ende[2]) < -(0.3 + RADIUS[gen][1]) && sdf[lap](mi[0], mi[1], mi[2]) < -(0.3 + RADIUS[gen][0])) break;
          L *= 0.82; ende = null;
          if (L < 0.5) break;
        }
      }
      if (!ende) continue;
      var m = [st[0] + dir[0] * L * 0.5 + u[0] * 0.06 * Math.cos(w), st[1] + dir[1] * L * 0.5 + u[1] * 0.06 * Math.cos(w), st[2] + dir[2] * L * 0.5 + u[2] * 0.06 * Math.cos(w)];
      var ast = { pts: [st, m, ende], r0: Math.min(RADIUS[gen][0], r1), r1: RADIUS[gen][1], lappen: lap, gen: gen };
      aeste.push(ast);
      if (gen === 3) endpunkte.push({ p: ende, lappen: lap, r: RADIUS[gen][1] });
      else kinder(lap, ast.pts, gen + 1, ziel, ast.r1);
    }
  }
  ['oberlappenR', 'mittellappen', 'unterlappenR', 'oberlappenL', 'unterlappenL'].forEach(function (id) {
    var pts = LAPPEN_WEG[id], z = pts[pts.length - 1];
    aeste.push({ pts: pts, r0: id.slice(-1) === 'R' ? 0.58 : 0.52, r1: 0.4, lappen: id, gen: 0 });
    kinder(id, pts, 1, z, 0.4);
  });
  aeste.endpunkte = endpunkte;
  return aeste;
}


Kern.form('lunge', {
  interp: interp, zst: zst, zSternum: zSternum,
  RIP_R: RIP_R, RIP_YA: RIP_YA, rippen: rippenParam,
  thoraxInnen: thoraxInnen, domY: domY, DOM_R: DOM_R, DOM_L: DOM_L,
  lunge: lunge, fluegel: fluegel, grenzen: grenzen,
  HERZ_V: HERZ_V, rippeStuetz: rippeStuetz, lappen: lappen, SPALT: SPALT, HOR_Y: HOR_Y, schraeg: schraeg,
  TRACHEA: TRACHEA, hauptbronchus: hauptbronchus, bronchien: bronchien
});
})();
