/* ==========================================================================
   Verdauung - Form: Speiseroehre, Magen, Duenndarm (mit Zwoelffingerdarm) und
   Dickdarm als Baustein fuer den Koerper (und spaeter die Detailmodelle von
   Magen und Darm). Signed-Distance-Feld, Einheit cm, Innen < 0, aus den
   Bausteinen von Kern.SDF (core/sdf.js); nur Daten und Funktionen, keine
   three.js-Objekte, kein Zufall.
   Klassisches Skript (kein Modul). Beim Laden wird nur die Form mit Kern.form
   angemeldet, nichts aufgebaut; keine globalen Namen. Geladen wird sie ueber
   Kern.FORMEN/Kern.formLaden (core/rahmen.js). Die Zwerchfellkuppel kommt aus
   der Form der Lunge (Kern.Formen.lunge), Pfortader und Leberarterie aus der
   Form der Leber (Kern.Formen.leber); der Zugriff erfolgt erst beim Auswerten
   bzw. Aufruf (fehlt die Lunge, wirft die Form einen Fehler).

   Koordinaten wie im Koerper (cm): x + links (der Magen liegt links, x > 0),
   y oben, z vorn.

   Enthalten:
     BAHN                   Bahnen der Rohre im Koerper (Steuerpunkte pts, Radius r, Segmentzahl seg): speiseroehre, zwoelffingerdarm,
                            duenndarm (pts ist eine Funktion: Schlingen in vier Lagen), dickdarm (mit kappe = [x, y, z, r] der Kugel am Anfang)
     magen(f)               Abstandsfeld der Aussenflaeche des Magens bei Fuellung f (0 = nuechtern, 1 = nach dem Essen), magenGrenzen(f) = Gitterbox;
                            J-foermiger Schlauch um eine Mittellinie (Magengrund, Magenkoerper, Magenvorhof, Pfoertner), der Pfoertner endet
                            bei PFOERTNER.p mit dem Radius 1,0 des Zwoelffingerdarms; die Speiseroehre ist am Mageneingang weich angeschlossen
                            (His-Winkel); oben haelt der Magen 0,35 cm Abstand zur Zwerchfellkuppel
     schichten(f)           Wandschichten fuer das Detailmodell: Liste { id, sdf, grenzen } mit schleimhaut, schraeg, ring, laengs,
                            pfoertnerRing, eingangRing (Tiefe von aussen: Laengsmuskel 0-0,12, Ringmuskel 0,12-0,30..0,40, schraege Schicht
                            0,30-0,40 (nur Fundus und Korpus), Schleimhaut 0,40-0,60 cm, dazu die Wuelste von Pfoertner und Mageneingang);
                            die Schleimhaut traegt die Falten (Rugae); lumen(f) = Innenraum (mit dem Kanal zur Speiseroehre)
     mittellinie(f), kurvaturen(f, ab, dz), kennpunkte(f), EINGANG, PFOERTNER, FUNDUS, ANGULUS (je { p }), schnitt(f)
     gefaesse(f)            { magenarterien, magenvenen, pfortader, vagus }: je Liste von { id, pts, r0, r1 } (Venen und Pfortader
                            in Fliessrichtung, Arterien und Nerven vom Ursprung weg)
     zwerchfell()           { sdf, grenzen }: Ausschnitt der Zwerchfellkuppel ueber dem linken Oberbauch mit dem Hiatus
     kurve(pts, n), kette(poly, r)   Catmull-Rom-Kurve wie THREE.CatmullRomCurve3 im Koerper und Abstandsfeld einer Linienfolge
   ========================================================================== */
(function () {
'use strict';
var S = Kern.SDF;
var smin = S.smin, smax = S.smax;

/* ---- Hilfen ---- */
function glatt(a, b, x) {   /* weicher Uebergang 0 -> 1 zwischen a und b (auch absteigend, a > b) */
  var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}
/* Catmull-Rom-Kurve (Spannung 0,5, Enden verlaengert) durch die Steuerpunkte pts, n Punkte je Abschnitt: dieselbe Kurve wie
   THREE.CatmullRomCurve3 im Koerper (rohr in koerper.js); gleiches Verfahren wie kurve() in leber-form.js */
function kurve(pts, n) {
  var l = pts.length, out = [], s, k, c;
  for (s = 0; s < l - 1; s++) {
    var p1 = pts[s], p2 = pts[s + 1], p0 = [], p3 = [];
    for (c = 0; c < 3; c++) {
      p0.push(s > 0 ? pts[s - 1][c] : 2 * p1[c] - p2[c]);
      p3.push(s + 2 < l ? pts[s + 2][c] : 2 * p2[c] - p1[c]);
    }
    for (k = 0; k < n; k++) {
      var t = k / n, q = [];
      for (c = 0; c < 3; c++) {
        var a = 0.5 * (p2[c] - p0[c]), b = 0.5 * (p3[c] - p1[c]);
        q.push(p1[c] + a * t + (-3 * p1[c] + 3 * p2[c] - 2 * a - b) * t * t + (2 * p1[c] - 2 * p2[c] + a + b) * t * t * t);
      }
      out.push(q);
    }
  }
  out.push(pts[l - 1].slice());
  return out;
}
/* Abstandsfeld einer Linienfolge mit Radius r (Kapselkette), wie kette() in leber-form.js */
function kette(poly, r) {
  var n = poly.length - 1, seg = [], bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9], i, c;
  for (i = 0; i <= n; i++) for (c = 0; c < 3; c++) { if (poly[i][c] < bb[c]) bb[c] = poly[i][c]; if (poly[i][c] > bb[c + 3]) bb[c + 3] = poly[i][c]; }
  for (i = 0; i < n; i++) {
    var a = poly[i], b = poly[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], l2 = vx * vx + vy * vy + vz * vz;
    seg.push(a[0], a[1], a[2], vx, vy, vz, l2 > 0 ? 1 / l2 : 0);
  }
  return function (x, y, z) {
    var ex = Math.max(bb[0] - x, 0, x - bb[3]), ey = Math.max(bb[1] - y, 0, y - bb[4]), ez = Math.max(bb[2] - z, 0, z - bb[5]);
    var lb = Math.sqrt(ex * ex + ey * ey + ez * ez) - r;
    if (lb > 4) return lb;
    var m = 1e9, j, px, py, pz, t, dx, dy, dz, d2;
    for (j = 0; j < seg.length; j += 7) {
      px = x - seg[j]; py = y - seg[j + 1]; pz = z - seg[j + 2];
      t = (px * seg[j + 3] + py * seg[j + 4] + pz * seg[j + 5]) * seg[j + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
      dx = px - seg[j + 3] * t; dy = py - seg[j + 4] * t; dz = pz - seg[j + 5] * t;
      d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < m) m = d2;
    }
    return Math.sqrt(m) - r;
  };
}
function laenge(poly) {
  var s = 0, i;
  for (i = 1; i < poly.length; i++) s += Math.sqrt(Math.pow(poly[i][0] - poly[i - 1][0], 2) + Math.pow(poly[i][1] - poly[i - 1][1], 2) + Math.pow(poly[i][2] - poly[i - 1][2], 2));
  return s;
}
/* Punkt im Abstand s (cm) vom Anfang der Punktfolge */
function amBogen(poly, s) {
  var tot = 0, i;
  for (i = 1; i < poly.length; i++) {
    var l = laenge([poly[i - 1], poly[i]]);
    if (tot + l >= s) { var f = l > 0 ? (s - tot) / l : 0; return [poly[i - 1][0] + (poly[i][0] - poly[i - 1][0]) * f, poly[i - 1][1] + (poly[i][1] - poly[i - 1][1]) * f, poly[i - 1][2] + (poly[i][2] - poly[i - 1][2]) * f]; }
    tot += l;
  }
  return poly[poly.length - 1].slice();
}
/* Punktfolge in gleichen Schritten (cm) neu abtasten */
function neuAbtasten(poly, schritt) {
  var L = laenge(poly), n = Math.max(1, Math.round(L / schritt)), out = [], i;
  for (i = 0; i <= n; i++) out.push(amBogen(poly, L * i / n));
  return out;
}
function glaetten(poly, n) {   /* gleitendes Mittel ueber drei Punkte, Enden fest */
  var p = poly, k, i;
  for (k = 0; k < n; k++) {
    var q = [p[0].slice()];
    for (i = 1; i < p.length - 1; i++) q.push([(p[i - 1][0] + 2 * p[i][0] + p[i + 1][0]) / 4, (p[i - 1][1] + 2 * p[i][1] + p[i + 1][1]) / 4, (p[i - 1][2] + 2 * p[i][2] + p[i + 1][2]) / 4]);
    q.push(p[p.length - 1].slice()); p = q;
  }
  return p;
}

/* Zwerchfellkuppel aus der Form der Lunge, erst beim Auswerten geholt */
var LUNGE = null;
function lunge() {
  if (!LUNGE) {
    LUNGE = Kern.Formen && Kern.Formen.lunge;
    if (!LUNGE) throw new Error('Die Form der Verdauung braucht die Form der Lunge (Zwerchfellkuppel), sie ist nicht geladen.');
  }
  return LUNGE;
}
function kuppel(x, z) { return lunge().kuppel(x, z); }

/* ---- Bahnen der Rohre im Koerper (Zahlen und Radien wie in organe/koerper/koerper.js) ---- */
var DUENN_DY = -1.5;   /* Die Schlingen des Duenndarms liegen um 1,5 cm tiefer als frueher (Platz fuer den Querkolon unter dem Magen) */
function schlingen() {   /* Duenndarm: Schlingen in vier Lagen */
  var dd = [], r, k;
  for (r = 0; r < 4; r++) {
    var yy = 95.5 + DUENN_DY - 2.5 * r;
    for (k = 0; k <= 8; k++) {
      var t = r % 2 ? 8 - k : k;
      dd.push([-8 + 2 * t + (k % 2 ? 0.6 : -0.6), yy + (k % 2 ? 0.5 : -0.5), 3.5 + 1.8 * Math.sin(k * 1.9 + r * 1.3)]);
    }
  }
  return dd;
}
var BAHN = {
  speiseroehre: { pts: [[0, 148, -3.0], [0, 140, -3.6], [0.3, 130, -3.6], [0.9, 122, -3.4], [1.6, 115, -2.8], [2.4, 110.5, -1.5], [3.8, 107.6, 1.0]], r: 0.8, seg: 40 },
  zwoelffingerdarm: { pts: [[-2.0, 104.0, 3.2], [-3.4, 105, 1.6], [-5.8, 103.6, -0.2], [-7.0, 100, -0.8], [-6.6, 96.6, -0.8], [-3.6, 94.8, -0.6], [0, 95.6, -0.5]], r: 1.0, seg: 50 },
  duenndarm: { pts: schlingen, r: 1.2, seg: 420 },
  dickdarm: { pts: [[-11.2, 89.5, 0.5], [-11.5, 95, 0], [-11.6, 100, -0.5], [-10.8, 103.4, 0.8], [-8.5, 102, 4], [-6, 99.6, 6.4], [-1, 98.6, 7], [4, 99.6, 6.8],
    [8.8, 97.5, 6.0], [13.3, 99.2, 2.4], [13.3, 103.6, -3.2], [11.8, 100.5, -2.8], [11.8, 95, -2.6], [11, 89.5, -2], [9.0, 86.3, -2.0], [5, 85.2, -2.4], [2, 85.8, -2.6], [0.6, 84, -2.8], [0.3, 81.5, -4.8], [0, 79.5, -6]],
    r: 1.8, seg: 260, kappe: [-11.3, 89.2, 0.5, 2.4] }
};

/* ---- Kennpunkte (Magen nuechtern; bei Fuellung f siehe kennpunkte(f)) ---- */
var EINGANG = { p: [3.8, 107.6, 1.0] };     /* Ende der Speiseroehre, Mageneingang (Kardia) */
var PFOERTNER = { p: [-2.0, 104.0, 3.2] };  /* Uebergang in den Zwoelffingerdarm */
var FUNDUS = { p: [7.5, 112.8, -1.5] };      /* hoechster Punkt des Magengrunds */
var ANGULUS = { p: [3.6, 103.4, 2.3] };     /* Knick der kleinen Kurvatur (Incisura angularis) */

/* ---- Magen: Mittellinie mit Radien ----
   Steuerpunkte c (Mitte), r (Radius in der Ebene des Schlauchs), rz (Radius in der Tiefe, der Magen ist flacher als breit), g (Richtung zur grossen
   Kurvatur, in x/y); r1, rz1: Radien bei Fuellung 1. Beim Fuellen bleibt die kleine Kurvatur an ihrem Ort: die Mitte wandert um den Zuwachs
   des Radius in Richtung g (0,95) und um 0,7 des Zuwachses nach vorn. */
var KP = [
  { c: [7.5, 109.5, -1.5], r: 4.0, rz: 3.5, g: [0.7, 0.7], r1: 5.1, rz1: 4.8 },     /* Magengrund (Fundus) */
  { c: [7.8, 107.5, -0.8], r: 4.0, rz: 3.0, g: [1.0, 0.1], r1: 5.2, rz1: 4.5 },     /* Magenkoerper oben */
  { c: [7.3, 102.5, 1.0], r: 3.9, rz: 2.9, g: [0.9, -0.4], r1: 5.1, rz1: 4.4 },     /* Magenkoerper unten */
  { c: [5.3, 99.8, 2.2], r: 3.5, rz: 2.5, g: [0.25, -1.0], r1: 4.4, rz1: 3.7 },     /* tiefster Punkt der grossen Kurvatur */
  { c: [2.0, 100.0, 2.6], r: 2.8, rz: 2.0, g: [0.0, -1.0], r1: 3.4, rz1: 3.1 },     /* Magenvorhof (Antrum) */
  { c: [0.0, 101.5, 3.2], r: 2.0, rz: 1.8, g: [-0.3, -1.0], r1: 2.3, rz1: 2.1 },
  { c: [-1.3, 103.0, 3.2], r: 1.3, rz: 1.3, g: [-0.5, -1.0], r1: 1.4, rz1: 1.4 },   /* Pfoertnerkanal */
  { c: [-2.0, 104.0, 3.2], r: 1.1, rz: 1.1, g: [-0.5, -1.0], r1: 1.1, rz1: 1.1 }    /* Pfoertner = Anfang des Zwoelffingerdarms */
];
var PRO = 9;          /* Abtastpunkte je Abschnitt der Mittellinie */
var DUO_EXT = [0.8, 1.6];   /* Verlaengerung ins Duodenum (nur fuer Schichten und Innenraum): Abstaende (cm) vom Pfoertner auf der Bahn des Zwoelffingerdarms */
var ESO_STUMPF = 1.8;       /* Laenge (cm) der Speiseroehre, die im Feld des Magens mitgefuehrt wird (weicher Anschluss) */
var ESO_R_AUSSEN = 0.7;     /* Radius des Speiseroehren-Stumpfs im Feld der Aussenflaeche (Rohr im Koerper: 0,8) */
var ESO_TIEF = 1.0;         /* der Kanal der Speiseroehre laeuft so weit (cm) ueber den Mageneingang hinaus in den Magen */
var ZW_ABSTAND = 0.7;       /* Abstand des Magens zur Zwerchfellkuppel (cm) */

/* Nachbarn, denen der Magen ausweicht: Leber (Form der Leber, erst beim Auswerten geholt), Milz, linke Niere, Bauchspeicheldruese und Aorta (Lage wie im
   Koerper, koerper.js); der Magen haelt GAP cm Abstand, die Flaeche gibt weich nach (smax). Die Schichten folgen um ihre Tiefe weiter innen. */
var GAP = 0.25, GAP_MILZ = 0.55, WEICH = 0.5;   /* zwischen Magen und Milz bleibt Platz fuer die kurzen Magengefaesse am Milzhilus */
var MILZ_ROT = (function () {   /* Drehung der Milz (Euler XYZ 0,1 / 0,2 / -0,15 wie ellM im Koerper), transponiert */
  var a = 0.1, b = 0.2, c = -0.15, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
  return [cb * cc, cb * sc, -sb, sa * sb * cc - ca * sc, sa * sb * sc + ca * cc, sa * cb, ca * sb * cc + sa * sc, ca * sb * sc - sa * cc, ca * cb];
})();
function milz(x, y, z) {
  var px = x - 9.2, py = y - 108, pz = z + 5.2, R = MILZ_ROT;
  return S.ellipsoid(R[0] * px + R[1] * py + R[2] * pz, R[3] * px + R[4] * py + R[5] * pz, R[6] * px + R[7] * py + R[8] * pz, 0, 0, 0, 2.3, 4.8, 3.2);
}
function pankreas(x, y, z) {
  var d = S.kapsel(x, y, z, -4.5, 99, -1.2, -1, 100.2, -2.8, 2.3, 1.7);
  d = smin(d, S.kapsel(x, y, z, -1, 100.2, -2.8, 3.5, 102.2, -3.4, 1.7, 1.5), 1.5);
  return smin(d, S.kapsel(x, y, z, 3.5, 102.2, -3.4, 9.5, 105.5, -4.4, 1.5, 1.2), 1.5);
}
var AORTA_F = null;
function aortaFeld() { return AORTA_F || (AORTA_F = kette(kurve(AORTA.pts, 8), AORTA.r)); }
/* Noetiger Abstand: c = max ueber die Nachbarn von (GAP - Abstand); die Flaeche des Magens muss mindestens so weit nach innen (c > 0 = Eingriff) */
function ausweichen(x, y, z) {
  var c = -1e9, d;
  if (x < 9 && y > 101 && z > -7) { var LE = Kern.Formen && Kern.Formen.leber; if (LE) { d = LE.leber(x, y, z); if (GAP - d > c) c = GAP - d; } }
  if (x > 4 && y > 101 && z < 3) { d = milz(x, y, z); if (GAP_MILZ - d > c) c = GAP_MILZ - d; }
  if (y < 109 && z < 3 && x > -6) { d = pankreas(x, y, z); if (GAP - d > c) c = GAP - d; }
  if (x > 3 && z < 0 && y > 98) { d = S.ellipsoid(x, y, z, 7.5, 105, -6.2, 2.7, 5.6, 2.3); if (GAP - d > c) c = GAP - d; }   /* linke Niere */
  if (x < 9 && z < 3) { d = aortaFeld()(x, y, z); if (GAP - d > c) c = GAP - d; }
  return c;
}

var STATE = {};
function zustand(f, ext) {
  var key = f + ':' + (ext ? 1 : 0);
  if (STATE[key]) return STATE[key];
  var steuer = [], i, j, c;
  for (i = 0; i < KP.length; i++) {
    var k = KP[i], gl = Math.sqrt(k.g[0] * k.g[0] + k.g[1] * k.g[1]), dr = k.r1 - k.r, dz = k.rz1 - k.rz;
    steuer.push({
      c: [k.c[0] + f * 0.95 * dr * k.g[0] / gl, k.c[1] + f * 0.95 * dr * k.g[1] / gl, k.c[2] + f * 0.7 * dz],
      r: k.r + f * dr, rz: k.rz + f * dz, g: [k.g[0] / gl, k.g[1] / gl]
    });
  }
  var nSt = KP.length - 1;   /* Zahl der Abschnitte des Magens */
  if (ext) {
    var duo = kurve(BAHN.zwoelffingerdarm.pts, 12);
    DUO_EXT.forEach(function (d) { steuer.push({ c: amBogen(duo, d), r: 1.0, rz: 1.0, g: [-0.45, -0.9] }); });
  }
  var pts = steuer.map(function (s) { return s.c; }), cu = kurve(pts, PRO), n = cu.length, st = { f: f, ext: !!ext };
  var X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n), R = new Float64Array(n), RZ = new Float64Array(n);
  var GX = new Float64Array(n), GY = new Float64Array(n), SC = new Float64Array(n), W = new Float64Array(n), LP = new Float64Array(n);
  var iEnde = nSt * PRO;
  /* Radien und Richtung zur grossen Kurvatur laufen als Catmull-Rom-Kurve mit (glatt, ohne Absaetze an den Steuerpunkten) */
  var ar = kurve(steuer.map(function (s) { return [s.r, s.rz, s.g[0]]; }), PRO), ag = kurve(steuer.map(function (s) { return [s.g[1], 0, 0]; }), PRO);
  for (j = 0; j < n; j++) {
    X[j] = cu[j][0]; Y[j] = cu[j][1]; Z[j] = cu[j][2];
    R[j] = ar[j][0]; RZ[j] = ar[j][1];
    var gx = ar[j][2], gy = ag[j][0], gl2 = Math.sqrt(gx * gx + gy * gy) || 1;
    GX[j] = gx / gl2; GY[j] = gy / gl2;
    SC[j] = j ? SC[j - 1] + Math.sqrt(Math.pow(X[j] - X[j - 1], 2) + Math.pow(Y[j] - Y[j - 1], 2) + Math.pow(Z[j] - Z[j - 1], 2)) : 0;
  }
  var L = SC[iEnde];
  for (j = 0; j < n; j++) {
    var sf = SC[j] / L;
    W[j] = j > iEnde ? 0 : 1 - glatt(0.5, 0.78, sf);   /* Gewicht der schraegen Muskelschicht: Fundus und Korpus, laeuft zum Antrum aus */
    LP[j] = L - SC[j];                                  /* Abstand (cm) zum Pfoertner (hinter dem Pfoertner negativ) */
  }
  var m = n - 1, SG = new Float64Array(m * 7), TX = new Float64Array(n * 3);
  for (j = 0; j < n; j++) {   /* Richtung der Mittellinie je Abtastpunkt (zentrale Differenz), zwischen den Punkten wird gemischt: keine Spruenge der Falten */
    var ta = Math.max(j - 1, 0), tb2 = Math.min(j + 1, n - 1), ux = X[tb2] - X[ta], uy = Y[tb2] - Y[ta], uz = Z[tb2] - Z[ta], ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
    TX[j * 3] = ux / ul; TX[j * 3 + 1] = uy / ul; TX[j * 3 + 2] = uz / ul;
  }
  for (j = 0; j < m; j++) {
    var vx = X[j + 1] - X[j], vy = Y[j + 1] - Y[j], vz = Z[j + 1] - Z[j], l2 = vx * vx + vy * vy + vz * vz;
    SG[j * 7] = X[j]; SG[j * 7 + 1] = Y[j]; SG[j * 7 + 2] = Z[j]; SG[j * 7 + 3] = vx; SG[j * 7 + 4] = vy; SG[j * 7 + 5] = vz; SG[j * 7 + 6] = l2 > 0 ? 1 / l2 : 0;
  }
  st.n = n; st.m = m; st.mSt = iEnde;   /* mSt: Zahl der Abschnitte bis zum Pfoertner */
  st.X = X; st.Y = Y; st.Z = Z; st.R = R; st.RZ = RZ; st.GX = GX; st.GY = GY; st.SC = SC; st.W = W; st.LP = LP; st.SG = SG; st.TX = TX; st.L = L;
  /* Speiseroehre: Stumpf vor dem Mageneingang, dazu der Kanal ein Stueck in den Magen hinein */
  var eso = kurve(BAHN.speiseroehre.pts, 12), le = laenge(eso), ende = eso[eso.length - 1], vor = eso[eso.length - 3];
  var richt = [ende[0] - vor[0], ende[1] - vor[1], ende[2] - vor[2]], rl = Math.sqrt(richt[0] * richt[0] + richt[1] * richt[1] + richt[2] * richt[2]);
  var innen = [ende[0] + richt[0] / rl * ESO_TIEF, ende[1] + richt[1] / rl * ESO_TIEF, ende[2] + richt[2] / rl * ESO_TIEF];
  var stumpf = [], tot = 0;
  for (j = 0; j < eso.length; j++) { if (le - laenge(eso.slice(0, j + 1)) <= ESO_STUMPF + 0.3) stumpf.push(eso[j]); }
  stumpf.push(innen);
  st.stumpfAussen = stumpf.slice(0, stumpf.length - 1);   /* bis zum Mageneingang */
  /* Stumpf als Segmente fuer die Schichten (Radius je Tiefe) */
  st.es = []; for (j = 0; j < stumpf.length - 1; j++) {
    var a2 = stumpf[j], b2 = stumpf[j + 1], wx = b2[0] - a2[0], wy = b2[1] - a2[1], wz = b2[2] - a2[2], w2 = wx * wx + wy * wy + wz * wz;
    st.es.push(a2[0], a2[1], a2[2], wx, wy, wz, w2 > 0 ? 1 / w2 : 0);
  }
  st.esEnde = stumpf.length - 2;   /* letztes Segment: das Ende liegt im Magen (nur der Kanal) */
  STATE[key] = st;
  return st;
}

/* Abstand zum Stumpf der Speiseroehre (Segmente 0 bis nseg-1) */
function stumpfAbstand(st, x, y, z, nseg) {
  var m = 1e9, j, E = st.es, px, py, pz, t, dx, dy, dz, d2;
  for (j = 0; j < nseg; j++) {
    px = x - E[j * 7]; py = y - E[j * 7 + 1]; pz = z - E[j * 7 + 2];
    t = (px * E[j * 7 + 3] + py * E[j * 7 + 4] + pz * E[j * 7 + 5]) * E[j * 7 + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
    dx = px - E[j * 7 + 3] * t; dy = py - E[j * 7 + 4] * t; dz = pz - E[j * 7 + 5] * t;
    d2 = dx * dx + dy * dy + dz * dz; if (d2 < m) m = d2;
  }
  return Math.sqrt(m);
}

/* ---- Wandschichten ----
   Randflaechen B[k] (Tiefe von aussen, B < 0 = tiefer als die Randflaeche): 0 aussen, 1 Ende Laengsmuskel (0,12), 2 Ende Ringmuskel
   (0,30 im Korpus, 0,40 im Antrum), 3 Ende schraege Schicht (0,40), 4 Ende Pfoertnerwulst, 5 Ende Wulst des Mageneingangs (= Beginn der
   Schleimhaut), 6 Innenflaeche der Schleimhaut samt Falten. QCH = Abstand zum Kanal der Speiseroehre (< 0 im Kanal). */
var B = new Float64Array(8), QCH = 0;
var NF = 18;       /* Zahl der Falten um den Umfang */
var FALTE = 0.5;   /* Hoehe der Falten (cm) im nuechternen Magen */
function faltenHoehe(f) { return FALTE * (1 - f) * (1 - f) * (1 - 0.5 * f) + 0.01 * f; }

/* je Abschnitt der Mittellinie fuer den aktuellen Punkt: Wert der Aussenflaeche (KZ), Versatz zur Mittellinie (DX, DY, DZ), Radien (RTA, RZA), Lage u im Abschnitt */
var KZ = new Float64Array(512), DXA = new Float64Array(512), DYA = new Float64Array(512), DZA = new Float64Array(512), RTA = new Float64Array(512), RZA = new Float64Array(512), UA = new Float64Array(512);
function werte(st, x, y, z, voll) {
  var nseg = voll ? st.m : st.mSt, SG = st.SG, j, jb = 0, db = 1e30;   /* db: kleinster Wert der Aussenflaeche ueber alle Abschnitte */
  for (j = 0; j < nseg; j++) {
    var o = j * 7, px = x - SG[o], py = y - SG[o + 1], pz = z - SG[o + 2];
    var t = (px * SG[o + 3] + py * SG[o + 4] + pz * SG[o + 5]) * SG[o + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
    var dx = px - SG[o + 3] * t, dy = py - SG[o + 4] * t, dz = pz - SG[o + 5] * t;
    var rt = st.R[j] + (st.R[j + 1] - st.R[j]) * t, rzt = st.RZ[j] + (st.RZ[j + 1] - st.RZ[j]) * t, at = rt / rzt, zt = dz * at;
    var kz = (Math.sqrt(dx * dx + dy * dy + zt * zt) - rt) / (at > 1 ? at : 1);
    KZ[j] = kz; DXA[j] = dx; DYA[j] = dy; DZA[j] = dz; RTA[j] = rt; RZA[j] = rzt; UA[j] = t;
    if (kz < db) { db = kz; jb = j; }
  }
  var tb = UA[jb], j1 = jb + 1, X = st.X, Y = st.Y, Z = st.Z;
  var kup = y > 94 ? kuppel(x, z) - ZW_ABSTAND : 1e9;
  var nah = (x - EINGANG.p[0]) * (x - EINGANG.p[0]) + (y - EINGANG.p[1]) * (y - EINGANG.p[1]) + (z - EINGANG.p[2]) * (z - EINGANG.p[2]) < 64;
  var dSt = nah ? stumpfAbstand(st, x, y, z, st.esEnde) : 1e9;   /* nur der Teil bis zum Mageneingang */
  var cN = db < 8 ? ausweichen(x, y, z) : -1e9;   /* Eingriff der Nachbarn (nur in Naehe des Magens) */
  var o0, k, rr, rrz, a, zz, q, c, qc;
  if (!voll) {
    q = db;
    if (nah) q = smin(q, dSt - ESO_R_AUSSEN, 0.9);   /* etwas schlanker als das Rohr der Speiseroehre im Koerper (keine doppelte Flaeche) */
    if (kup < 1e8) q = smax(q, 0.5 * (y - kup), 1.2);
    if (cN > -2) q = smax(q, cN, WEICH);
    return q;
  }
  var lp = st.LP[jb] + (st.LP[j1] - st.LP[jb]) * tb, w = st.W[jb] + (st.W[j1] - st.W[jb]) * tb;
  var Ep = 0.42 * glatt(2.6, 1.3, lp) * glatt(0.1, 0.9, lp);
  var de = Math.sqrt((x - EINGANG.p[0]) * (x - EINGANG.p[0]) + (y - EINGANG.p[1]) * (y - EINGANG.p[1]) + (z - EINGANG.p[2]) * (z - EINGANG.p[2]));
  var Ee = 0.26 * glatt(2.2, 1.0, de);
  var off = OFF; off[0] = 0; off[1] = 0.12; off[2] = 0.30 + 0.10 * (1 - w); off[3] = 0.40; off[4] = 0.40 + Ep; off[5] = off[4] + Ee; off[6] = off[5] + 0.20;
  /* Randflaeche k = Vereinigung aller Abschnitte, die in Frage kommen (Wert der Aussenflaeche hoechstens 2 cm ueber dem kleinsten): stetig auch an der Innenseite der Biegung */
  for (k = 0; k < 7; k++) {
    o0 = off[k]; q = 1e9;
    for (c = 0; c < nseg; c++) {
      if (KZ[c] > db + 2) continue;
      rr = RTA[c] - o0; rrz = RZA[c] - o0; if (rr < 0.02) rr = 0.02; if (rrz < 0.02) rrz = 0.02;
      a = rr / rrz; if (a > 4) a = 4; zz = DZA[c] * a; qc = (Math.sqrt(DXA[c] * DXA[c] + DYA[c] * DYA[c] + zz * zz) - rr) / (a > 1 ? a : 1);   /* durch a geteilt: der Abstand wird nicht ueberschaetzt */
      if (qc < q) q = qc;
    }
    if (nah) q = smin(q, dSt - Math.max(0.77 - o0, 0.02), 0.9);
    if (kup < 1e8) q = smax(q, 0.5 * (y - (kup - o0)), 1.2);
    if (cN > -2) q = smax(q, cN + o0, WEICH);
    B[k] = k >= 4 ? q / 1.5 : q;   /* Wuelste: die Dicke aendert sich mit dem Ort, durch 1,5 geteilt */
  }
  QCH = nah ? stumpfAbstand(st, x, y, z, st.es.length / 7) - 0.3 : 1e9;
  /* Falten (Rugae): Laengsfalten der Schleimhaut nach innen */
  var H = faltenHoehe(st.f);
  if (H > 0.005 && B[5] < 0.6) {
    /* Richtung, Lage zur Mittellinie und Bogenlaenge gemittelt ueber alle Abschnitte, die fast so nah sind wie der naechste (weiches Minimum): ohne das springen die Falten, wenn der naechste Abschnitt wechselt */
    var swt = 0, tx = 0, ty = 0, tz = 0, gx = 0, gy = 0, mx = 0, my = 0, mz = 0, sCm = 0, n3, w3, u3;
    for (c = 0; c < nseg; c++) {
      var kk = KZ[c] - db;
      if (kk > 0.8) continue;
      w3 = Math.exp(-kk * 8); n3 = c + 1; u3 = UA[c];
      swt += w3;
      tx += w3 * (st.TX[c * 3] + (st.TX[n3 * 3] - st.TX[c * 3]) * u3); ty += w3 * (st.TX[c * 3 + 1] + (st.TX[n3 * 3 + 1] - st.TX[c * 3 + 1]) * u3); tz += w3 * (st.TX[c * 3 + 2] + (st.TX[n3 * 3 + 2] - st.TX[c * 3 + 2]) * u3);
      gx += w3 * (st.GX[c] + (st.GX[n3] - st.GX[c]) * u3); gy += w3 * (st.GY[c] + (st.GY[n3] - st.GY[c]) * u3);
      mx += w3 * DXA[c]; my += w3 * DYA[c]; mz += w3 * DZA[c];
      sCm += w3 * (st.SC[c] + (st.SC[n3] - st.SC[c]) * u3);
    }
    tx /= swt; ty /= swt; tz /= swt; gx /= swt; gy /= swt; mx /= swt; my /= swt; mz /= swt; sCm /= swt;
    var tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
    var gt = gx * tx + gy * ty;
    var nx = gx - gt * tx, ny = gy - gt * ty, nz = -gt * tz, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    var bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx; if (bz < 0) { bx = -bx; by = -by; bz = -bz; }
    var pa = mx * nx + my * ny + mz * nz, pb = mx * bx + my * by + mz * bz;
    var th = Math.atan2(pb, pa), ct = Math.cos(th), sn = Math.sin(th);
    var sf = sCm / st.L;
    var gross = glatt(-0.2, 0.5, ct);   /* 1 an der grossen Kurvatur: Falten wellen sich; an der kleinen Kurvatur laufen sie gerade und parallel (Magenstrasse) */
    var ph = NF * th + gross * (1.2 * Math.sin(0.8 * sCm) + 0.5 * Math.sin(1.9 * sCm + 2 * th));
    var u = 0.5 + 0.5 * Math.cos(ph), prof = u * u * (3 - 2 * u);
    var wth = 0.35 + 0.65 * glatt(-0.4, 0.9, ct - 0.8 * sn), amp = (1 - glatt(0.55, 0.9, sf)) * glatt(0, 0.06, sf);
    var rho = Math.sqrt(pa * pa + pb * pb) + 0.4, amW = H * amp * wth;
    B[6] = (B[6] + amW * prof * glatt(0.3, -0.3, B[5])) / (1 + glatt(0.6, 0.3, B[5]) * 0.75 * (NF + 3) * amW / rho);   /* durch die groesste Steigung der Falten geteilt: das Feld ueberschaetzt den Abstand nicht */
  }
  return 0;
}
var OFF = new Float64Array(8);

function gitterbox(st, voll) {
  var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], j, rm = 0, n = voll ? st.n : st.mSt + 1;
  for (j = 0; j < n; j++) {
    var r = st.R[j] + 0.4, rz = st.RZ[j] + 0.4;
    lo[0] = Math.min(lo[0], st.X[j] - r); hi[0] = Math.max(hi[0], st.X[j] + r);
    lo[1] = Math.min(lo[1], st.Y[j] - r); hi[1] = Math.max(hi[1], st.Y[j] + r);
    lo[2] = Math.min(lo[2], st.Z[j] - rz); hi[2] = Math.max(hi[2], st.Z[j] + rz);
  }
  st.stumpfAussen.forEach(function (p) {
    for (var c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], p[c] - 1.2); hi[c] = Math.max(hi[c], p[c] + 1.2); }
  });
  return [lo.map(function (v) { return Math.floor(v * 10) / 10; }), hi.map(function (v) { return Math.ceil(v * 10) / 10; })];
}

function magen(f) {
  var st = zustand(f || 0, false);
  return function (x, y, z) { return werte(st, x, y, z, false); };
}
function magenGrenzen(f) { return gitterbox(zustand(f || 0, false), false); }

function schichtDef(st, id, a, b) {
  return {
    id: id,
    sdf: function (x, y, z) {
      werte(st, x, y, z, true);
      var v = Math.max(B[a], -B[b]);
      return Math.max(v, -QCH);
    },
    grenzen: gitterbox(st, true)
  };
}
function schichten(f) {
  var st = zustand(f || 0, true);
  return [
    schichtDef(st, 'schleimhaut', 5, 6),
    schichtDef(st, 'schraeg', 2, 3),
    schichtDef(st, 'ring', 1, 2),
    schichtDef(st, 'laengs', 0, 1),
    schichtDef(st, 'pfoertnerRing', 3, 4),
    schichtDef(st, 'eingangRing', 4, 5)
  ];
}
function lumen(f) {
  var st = zustand(f || 0, true);
  return { sdf: function (x, y, z) { werte(st, x, y, z, true); return Math.min(B[6], QCH); }, grenzen: gitterbox(st, true) };
}

/* ---- Hilfen fuer das Detailmodell ---- */
function mittellinie(f) {
  var st = zustand(f || 0, false), out = [], j;
  for (j = 0; j <= st.mSt; j++) out.push({ p: [st.X[j], st.Y[j], st.Z[j]], r: st.R[j], rz: st.RZ[j] });
  return out;
}

/* Randpunkt auf der Aussenflaeche: von der Mitte c in Richtung dir, bis das Feld den Wert ab erreicht */
function randpunkt(feld, c, dir, ab) {
  if (feld(c[0], c[1], c[2]) > 0) return null;
  var t = 0, schritt = 0.15, lo, hi;
  while (t < 14) {
    t += schritt;
    if (feld(c[0] + dir[0] * t, c[1] + dir[1] * t, c[2] + dir[2] * t) >= ab) break;
  }
  lo = t - schritt; hi = t;
  for (var i = 0; i < 12; i++) {
    var mi = (lo + hi) / 2;
    if (feld(c[0] + dir[0] * mi, c[1] + dir[1] * mi, c[2] + dir[2] * mi) >= ab) hi = mi; else lo = mi;
  }
  t = (lo + hi) / 2;
  return [c[0] + dir[0] * t, c[1] + dir[1] * t, c[2] + dir[2] * t];
}
/* Kurvaturen auf der Aussenflaeche: klein (vom Mageneingang zum Pfoertner), gross (vom Fundus zum Pfoertner); ab = Abstand ausserhalb
   der Flaeche (cm), dz = Versatz der Schnittebene nach vorn (cm); Punkte alle 0,5 cm */
function kurvaturen(f, ab, dz) {
  f = f || 0; ab = ab || 0; dz = dz || 0;
  var st = zustand(f, false), feld = magen(f), kl = [], gr = [], j;
  var j0 = 0;
  while (j0 < st.mSt && st.Y[j0] > EINGANG.p[1]) j0++;
  for (j = 0; j <= st.mSt; j++) {
    var c = [st.X[j], st.Y[j], st.Z[j] + dz], d = [st.GX[j], st.GY[j], 0], p;
    if (j >= 1) { p = randpunkt(feld, c, d, ab); if (p) gr.push(p); }
    if (j >= j0) { p = randpunkt(feld, c, [-d[0], -d[1], 0], ab); if (p) kl.push(p); }
  }
  gr = neuAbtasten(glaetten(gr, 2), 0.5); kl = neuAbtasten(glaetten(neuAbtasten(glaetten(kl, 3), 0.5), 6), 0.5);
  /* Knick der kleinen Kurvatur: staerkste Richtungsaenderung ueber +-1 cm */
  var best = 0, bi = Math.floor(kl.length / 2), i, w = 3;
  for (i = w; i < kl.length - w; i++) {
    var a = [kl[i][0] - kl[i - w][0], kl[i][1] - kl[i - w][1], kl[i][2] - kl[i - w][2]], b = [kl[i + w][0] - kl[i][0], kl[i + w][1] - kl[i][1], kl[i + w][2] - kl[i][2]];
    var cs = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) * Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]) || 1);
    if (1 - cs > best) { best = 1 - cs; bi = i; }
  }
  return { klein: kl, gross: gr, angulus: bi };
}
function kennpunkte(f) {
  f = f || 0;
  var st = zustand(f, false), k = kurvaturen(f), feld = magen(f);
  var top = randpunkt(feld, [st.X[0], st.Y[0], st.Z[0]], [0, 1, 0], 0);
  return { EINGANG: EINGANG, PFOERTNER: PFOERTNER, FUNDUS: { p: top }, ANGULUS: { p: k.klein[k.angulus] } };
}

/* Schnittflaeche durch die Mittellinie, ungefaehr frontal: s = z - z_s(x, y) mit z_s = gewichtetes Mittel der Mitte der Mittellinie
   (weiche Gewichte in x/y); s > 0 = vordere Wand. Fuer die Innenansicht (vordere Wand abgehoben). */
function schnitt(f) {
  var st = zustand(f || 0, false), n = st.mSt + 1, m = n >> 1, zm = st.Z[m];
  return function (x, y, z) {
    var sw = 0.05, s = 0.05 * zm, j, dx, dy, w;   /* kleiner Anteil der mittleren Hoehe: weit weg wird die Flaeche eben und das Feld glatt */
    for (j = 0; j < n; j += 2) {
      dx = x - st.X[j]; dy = y - st.Y[j]; w = Math.exp(-(dx * dx + dy * dy) / 5);
      sw += w; s += w * st.Z[j];
    }
    return (z - s / sw) / 2.5;   /* durch die groesste Steigung der Flaeche geteilt */
  };
}

/* ---- Gefaesse und Nerv ---- */
var AORTA = { pts: [[4.9, 121, -3.9], [5.0, 118, -3.9], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]], r: 1.25 };   /* wie im Koerper (nur als Hindernis) */
/* Punkte aus den Hindernissen (Abstandsfelder, innen < 0) herausschieben, bis die Rohre mit Radius r mindestens 0,04 cm Luft haben;
   die ersten und letzten fest Punkte bleiben stehen (Ursprung und Muendung) */
function abdraengen(pts, r, hindernisse, fest0, fest1) {
  var p = pts.map(function (q) { return q.slice(); }), it, i, k, e = 0.04, n = p.length;
  for (it = 0; it < 10; it++) {
    for (i = fest0; i < n - fest1; i++) {
      for (k = 0; k < hindernisse.length; k++) {
        var h = hindernisse[k], v = h(p[i][0], p[i][1], p[i][2]) - (r + 0.04);
        if (v >= 0) continue;
        var gx = h(p[i][0] + e, p[i][1], p[i][2]) - h(p[i][0] - e, p[i][1], p[i][2]), gy = h(p[i][0], p[i][1] + e, p[i][2]) - h(p[i][0], p[i][1] - e, p[i][2]), gz = h(p[i][0], p[i][1], p[i][2] + e) - h(p[i][0], p[i][1], p[i][2] - e);
        var gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
        p[i][0] -= v * gx / gl * 1.02; p[i][1] -= v * gy / gl * 1.02; p[i][2] -= v * gz / gl * 1.02;
      }
    }
    if (it === 4) p = glaetten(p, 1).map(function (q, j) { return j < fest0 || j >= n - fest1 ? pts[j].slice() : q; });
  }
  return p;
}
/* Linienzug als Gefaess: Kurve durch die Wegpunkte, aus den Hindernissen geschoben, in Schritten von 0,5 cm */
function strecke(pts, r, hindernisse, fest0, fest1) {
  var c = neuAbtasten(kurve(pts, 6), 0.5), n = c.length, i;
  /* feste Enden bleiben die ersten und letzten Wegpunkte */
  c[0] = pts[0].slice(); c[n - 1] = pts[pts.length - 1].slice();
  return abdraengen(c, r, hindernisse, fest0 || 0, fest1 || 0);
}
function gefaesse(f) {
  f = f || 0;
  var LE = Kern.Formen && Kern.Formen.leber;
  if (!LE) throw new Error('Die Gefaesse brauchen die Form der Leber, sie ist nicht geladen.');
  var feld = magen(f), eso = kette(kurve(BAHN.speiseroehre.pts, 8), 0.8), aorta = kette(kurve(AORTA.pts, 8), AORTA.r);
  var duo = kette(kurve(BAHN.zwoelffingerdarm.pts, 8).slice(8), 1.0), kolon = kette(kurve(BAHN.dickdarm.pts, 6), BAHN.dickdarm.r);
  var kA = kurvaturen(f, 0.25, 0.3), kV = kurvaturen(f, 0.3, -0.3), kN = kurvaturen(f, 0.14, 0.9), kM = kurvaturen(f, 0.14, -0.9), kH = kurvaturen(f, 0.25, -1.2);
  var klA = kA.klein, grA = kA.gross, klV = kV.klein, grV = kV.gross, ia = kA.angulus, iv = kV.angulus;
  function von(poly, i0, i1) { return i0 <= i1 ? poly.slice(i0, i1 + 1) : poly.slice(i1, i0 + 1).reverse(); }
  function naechster(poly, p) { var b = 0, bd = 1e9, i; for (i = 0; i < poly.length; i++) { var d = Math.pow(poly[i][0] - p[0], 2) + Math.pow(poly[i][1] - p[1], 2) + Math.pow(poly[i][2] - p[2], 2); if (d < bd) { bd = d; b = i; } } return b; }
  var GE = LE.GEFAESSE, A = GE.leberarterie[0].pts[0], truncusEnde = [A[0] - 0.1, A[1] - 0.7, A[2] + 0.5];
  var stamm = GE.pfortader[0].pts[1], milzM = amBogen(kurve(GE.pfortader[1].pts, 12), LE.STUMPF - 0.2), mesM = amBogen(kurve(GE.pfortader[2].pts, 12), 2.2);
  var gm = Math.floor(grA.length * 0.6), gmV = Math.floor(grV.length * 0.6);   /* Mitte der grossen Kurvatur: Treffpunkt der Gefaesse */
  var hilus = (function () {   /* Milzhilus: Punkt der Milzoberflaeche auf dem Weg zur Magenhinterwand */
    var a = [9.2, 108, -5.2], b = [7.4, 106.4, -1.0], lo = 0, hi = 1, i, m;
    for (i = 0; i < 24; i++) { m = (lo + hi) / 2; if (milz(a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m) < 0.05) lo = m; else hi = m; }
    return [a[0] + (b[0] - a[0]) * hi, a[1] + (b[1] - a[1]) * hi, a[2] + (b[2] - a[2]) * hi];
  })();
  var iH = kH.gross.findIndex(function (p) { return p[1] <= 107.6; }), pH = kH.gross[iH];   /* Magenwand hinten-seitlich auf Hoehe des Hilus */
  var oM = [feld, eso, kolon, aorta, milz], oM2 = [feld, eso, duo, kolon, aorta];
  /* Arterien (vom Ursprung weg) */
  var arterien = [
    { id: 'truncus', pts: strecke([A.slice(), truncusEnde], 0.3, [feld, eso], 1, 0), r0: 0.32, r1: 0.3 },
    { id: 'gastrica-sinistra', pts: strecke([truncusEnde, [3.5, 107.6, -1.3], [3.7, 106.5, -0.2]].concat(von(klA, klA.findIndex(function (p) { return p[1] < 106.4; }), ia)), 0.22, oM, 2, 0), r0: 0.24, r1: 0.18 },
    { id: 'gastrica-dextra', pts: strecke([GE.leberarterie[0].pts[4].slice(), [-1.0, 106.2, 1.6]].concat(von(klA, klA.length - 1, ia)), 0.17, oM2, 1, 0), r0: 0.17, r1: 0.18 },
    { id: 'gastroomentalis-dextra', pts: strecke([[-0.8, 102.8, 0.7]].concat(von(grA, grA.length - 1, gm)), 0.2, oM2, 1, 0), r0: 0.2, r1: 0.2 },
    { id: 'gastroomentalis-sinistra', pts: strecke([hilus, pH].concat(von(grA, naechster(grA, pH), gm)), 0.21, oM, 1, 0), r0: 0.22, r1: 0.2 }
  ];
  [1, 3, 5].forEach(function (i, k) {   /* kurze Aeste zum Fundus */
    var q = kH.gross[Math.min(i, kH.gross.length - 1)], m = [(hilus[0] + q[0]) / 2, (hilus[1] + q[1]) / 2 + 0.2, (hilus[2] + q[2]) / 2];
    arterien.push({ id: 'gastricae-breves-' + (k + 1), pts: strecke([hilus, m, q], 0.14, [feld], 1, 0), r0: 0.15, r1: 0.13 });
  });
  /* Venen (Fliessrichtung zur Muendung) */
  var venen = [
    { id: 'gastrica-sinistra', pts: strecke(von(klV, iv, klV.findIndex(function (p) { return p[1] < 106.4; })).concat([[3.4, 106.0, -0.6], [2.4, 105.4, -0.8], [0.9, 104.8, -0.6], stamm.slice()]), 0.25, oM, 0, 1), r0: 0.22, r1: 0.28 },
    { id: 'gastrica-dextra', pts: strecke(von(klV, iv, klV.length - 1).concat([[-1.1, 105.5, 2.4], [-1.2, 105.0, 0.8], stamm.slice()]), 0.22, oM2, 0, 1), r0: 0.2, r1: 0.25 },
    { id: 'gastroomentalis-sinistra', pts: strecke(von(grV, gmV, naechster(grV, pH)).concat([pH, hilus, [5.4, 104.6, -3.0], milzM]), 0.26, [feld, kolon, milz], 0, 1), r0: 0.24, r1: 0.3 },
    { id: 'gastroomentalis-dextra', pts: strecke(von(grV, gmV, grV.length - 1).concat([[-0.2, 98.8, 1.6], mesM]), 0.26, oM2, 0, 1), r0: 0.24, r1: 0.3 }
  ];
  /* Pfortader: Stamm ab Zusammenfluss, dazu die Stuempfe von Milz- und Mesenterialvene wie im Lebermodell */
  var pf = GE.pfortader.map(function (g) {
    return { id: g.id, pts: g.id === 'pfortaderStamm' ? g.pts : LE.stumpf(g.pts, LE.STUMPF), r0: g.r0, r1: g.r1 };
  });
  /* Vagus: vorderer und hinterer Strang auf der Speiseroehre (ab 6 cm ueber dem Mageneingang), dann Aeste an der kleinen Kurvatur bis zum Antrum */
  var ec = neuAbtasten(kurve(BAHN.speiseroehre.pts, 12).filter(function (p) { return p[1] <= EINGANG.p[1] + 6; }), 0.8);
  function strang(vz, kl) {
    var pts = ec.map(function (p, i) {
      var q = ec[Math.min(i + 1, ec.length - 1)], o = ec[Math.max(i - 1, 0)], tx = q[0] - o[0], ty = q[1] - o[1], tz = q[2] - o[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      var nx = -tz * tx, ny = -tz * ty, nz = 1 - tz * tz, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;   /* z-Achse senkrecht zur Speiseroehre */
      return [p[0] + vz * nx / nl * 0.93, p[1] + vz * ny / nl * 0.93, p[2] + vz * nz / nl * 0.93];
    });
    var ast = kl.slice(0, Math.max(2, kl.length - 3));
    return strecke(pts.concat(ast), 0.14, [feld], 0, 0);
  }
  var vagus = [
    { id: 'vagus-vorn', pts: strang(1, kN.klein), r0: 0.14, r1: 0.1 },
    { id: 'vagus-hinten', pts: strang(-1, kM.klein), r0: 0.14, r1: 0.1 }
  ];
  return { magenarterien: arterien, magenvenen: venen, pfortader: pf, vagus: vagus };
}

/* ---- Zwerchfell (nur Lage): Ausschnitt der Kuppel ueber dem linken Oberbauch, 0,3 cm dick, mit der Luecke fuer die Speiseroehre (Hiatus) ---- */
var ZW = { x0: -2, x1: 13, z0: -4.5, z1: 7, y0: 103.5, dicke: 0.3 };
function zwerchfell() {
  var eso = kurve(BAHN.speiseroehre.pts, 12), i, hia = null;
  for (i = 1; i < eso.length; i++) {
    var d0 = eso[i - 1][1] - kuppel(eso[i - 1][0], eso[i - 1][2]), d1 = eso[i][1] - kuppel(eso[i][0], eso[i][2]);
    if (d0 >= 0 && d1 < 0) { hia = eso.slice(Math.max(0, i - 6), Math.min(eso.length, i + 6)); break; }
  }
  var loch = hia ? kette(hia, 0.8 + 0.5) : null;
  var hi = -1e9, x, z;
  for (x = ZW.x0; x <= ZW.x1; x += 0.5) for (z = ZW.z0; z <= ZW.z1; z += 0.5) { var k = kuppel(x, z); if (k > hi) hi = k; }
  return {
    sdf: function (x, y, z) {
      var k = kuppel(x, z), kx = kuppel(x + 0.05, z) - k, kz = kuppel(x, z + 0.05) - k;
      var d = Math.abs(y - k) / Math.sqrt(1 + (kx * kx + kz * kz) / 0.0025) - ZW.dicke / 2;   /* senkrecht zur Flaeche gemessen */
      d = Math.max(d, ZW.x0 - x, x - ZW.x1, ZW.z0 - z, z - ZW.z1, ZW.y0 - y);
      return loch ? Math.max(d, -loch(x, y, z)) : d;
    },
    grenzen: [[ZW.x0, ZW.y0 - 0.3, ZW.z0], [ZW.x1, Math.ceil(hi + 0.3), ZW.z1]],
    hiatus: hia ? hia[Math.floor(hia.length / 2)] : null
  };
}

Kern.form('verdauung', {
  BAHN: BAHN, magen: magen, magenGrenzen: magenGrenzen, schichten: schichten, lumen: lumen,
  mittellinie: mittellinie, kurvaturen: kurvaturen, kennpunkte: kennpunkte, schnitt: schnitt,
  EINGANG: EINGANG, PFOERTNER: PFOERTNER, FUNDUS: FUNDUS, ANGULUS: ANGULUS,
  gefaesse: gefaesse, zwerchfell: zwerchfell, kurve: kurve, kette: kette
});
})();
