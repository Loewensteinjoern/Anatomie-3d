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
     lunge(s, herz)       SDF-Funktion des Lungenfluegels s; herz = { smp, v }
                          (Abtaster der Herzform und Verschiebung Herz -> Koerper)
                          oder null (dann Ersatz-Herzbucht)
     grenzen(s)           Gitterbox [[x0,y0,z0],[x1,y1,z1]] des Fluegels s
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

/* Lungenfluegel s (-1 rechts, 1 links); herz = { smp, v } formt die Herzbucht nach dem Herzen, null = Ersatz-Herzbucht */
function lunge(s, herz) {
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

Kern.form('lunge', {
  interp: interp, zst: zst, zSternum: zSternum,
  RIP_R: RIP_R, RIP_YA: RIP_YA, rippen: rippenParam,
  thoraxInnen: thoraxInnen, domY: domY, DOM_R: DOM_R, DOM_L: DOM_L,
  lunge: lunge, grenzen: grenzen
});
})();
