/* ==========================================================================
   Leber - Form: Aussenform der Leber, Gallenblase, Gefaesse und Gaenge als
   Baustein fuer den Koerper (und spaeter das Detailmodell der Leber).
   Signed-Distance-Feld, Einheit cm, Innen < 0, aus den Bausteinen von
   Kern.SDF (core/sdf.js); nur Daten und Funktionen, keine three.js-Objekte,
   kein Zufall.
   Klassisches Skript (kein Modul). Beim Laden wird nur die Form mit Kern.form
   angemeldet, nichts aufgebaut; keine globalen Namen. Geladen wird sie ueber
   Kern.FORMEN/Kern.formLaden (core/rahmen.js). Die Zwerchfellkuppel und die
   Wirbelsaeule kommen aus der Form der Lunge (Kern.Formen.lunge); der Zugriff
   erfolgt erst beim Auswerten (fehlt sie, wirft die Form einen Fehler).

   Koordinaten wie im Koerper und in lunge-form.js (cm): x + links (die Leber
   liegt rechts, x < 0), y oben, z vorn.

   Die Leber ist der Ausguss des Raums unter der rechten Zwerchfellkuppel: oben
   die Kuppel (0,5 cm darunter), seitlich, vorn und hinten die Koerperhuelle
   abzueglich 2 cm Wand, unten die Eingeweideflaeche (Ebene), dazu die Mulden
   der Nachbarn (Dickdarm, rechte Niere, Zwoelffingerdarm, Magen, Speiseroehre,
   Aorta, Wirbelsaeule, Rinne der unteren Hohlvene) und die H-foermigen Furchen
   der Unterseite. Die Nachbarn sind einfache Nachbildungen der Formen aus
   organe/koerper/koerper.js (Tabellen AXT/AZT und RWT, Bahnen und Radien der
   Rohre, sdfMagen, Lage der rechten Niere), mit 0,15 bis 0,3 cm Abstand.

   Enthalten:
     leber(x,y,z)           die ganze Leber (fuer den Koerper, ohne Lappenspalten); grenzen = Gitterbox; ebeneY(x,z) = Hoehe der Eingeweideflaeche
     lappen()               Liste { id, sdf, grenzen } der Lappen lappenR, lappenL, quadrat, schwanz, durch Spalte SPALT getrennt
     gallenblase(x,y,z)     Gallenblase; GALLENBLASE { fundus, koerper, hals } (je { p, r }), grenzen;
                            gallenblaseMit(f) = Gallenblase mit Fuellung f (zusammengezogen: f < 1)
     GEFAESSE               Mittellinien ausserhalb der Leber: { pfortader, leberarterie, lebervenen, gallengang, pankreasgang }, je Liste
                            von { id, pts, r0, r1 }; ZUSAMMENFLUSS; STUMPF (3 cm: Laenge von Milz- und Mesenterialvene im Detailmodell),
                            stumpf(pts, laenge)
     baeume()               { pfortader, arterie, galle, venen, endpunkte }: Aeste { pts, r0, r1, gen, lappen } in der Leber,
                            endpunkte = [{ p, lappen, r }] (Enden der letzten Generation der Pfortader)
     HOHLVENE, hohlveneAbschnitt()   untere Hohlvene (Bahn wie im Koerper, r 1,1), Abschnitt y = 98 bis 119 von unten nach oben
     DUODENUM, duodenumLinie(), PAPILLE   Zwoelffingerdarm vom Pfoertner bis zum Beginn des unteren Teils (r 1,0) und die Papille
     sichelband(x,y,z), SICHELBAND, RUNDES_BAND   Baender (nur Detailmodell)
     kurve(pts, n), kette(poly, r)   Catmull-Rom-Kurve wie THREE.CatmullRomCurve3 im Koerper und Abstandsfeld einer Linienfolge
   ========================================================================== */
(function () {
'use strict';
var S = Kern.SDF;
var ell = S.ellipsoid, kap = S.kapsel, smax = S.smax, smin = S.smin;

/* ---- Hilfen ---- */
function interp(t, y) {   /* Verlauf mit glatter Zwischenstufe: Tabelle [[y, wert], ...] aufsteigend (wie im Koerper) */
  if (y <= t[0][0]) return t[0][1];
  for (var i = 1; i < t.length; i++) if (y <= t[i][0]) {
    var f = (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]); f = f * f * (3 - 2 * f);
    return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * f;
  }
  return t[t.length - 1][1];
}
function glatt(a, b, x) {   /* weicher Uebergang 0 -> 1 zwischen a und b (auch absteigend, a > b) */
  var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
}

/* Die Zwerchfellkuppel (Oberseite der Leber) und die Wirbelsaeule kommen aus der Form der Lunge; sie wird erst beim
   Auswerten gebraucht, nicht beim Laden (der Koerper laedt die Lungenform vorher) */
var LUNGE = null;
function lunge() {
  if (!LUNGE) {
    LUNGE = Kern.Formen && Kern.Formen.lunge;
    if (!LUNGE) throw new Error('Die Form der Leber braucht die Form der Lunge (Zwerchfellkuppel), sie ist nicht geladen.');
  }
  return LUNGE;
}
function kuppel(x, z) { return lunge().kuppel(x, z); }

/* Catmull-Rom-Kurve (Spannung 0,5, Enden verlaengert) durch die Steuerpunkte pts, n Punkte je Abschnitt: dieselbe Kurve wie
   THREE.CatmullRomCurve3 im Koerper (rohr in koerper.js), damit die Bahnen der Nachbarn und Gefaesse dort genau getroffen werden */
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

/* Abstandsfeld einer Linienfolge mit Radius r (Kapselkette); weit entfernt genuegt der Abstand zur Umhuellenden (untere Schranke) */
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
    if (lb > 1) return lb;
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

/* ---- Nachbarn der Leber (Lage und Form wie im Koerper, koerper.js; hier als einfache Nachbarformen nachgebildet) ---- */
/* Rumpf: Ellipse der Koerperhuelle um z = 0,3 (Tabellen AXT/AZT aus huelle in koerper.js); die Leber haelt WAND cm Abstand zur Haut */
var AXT = [[84, 16], [92, 17.2], [100, 16], [106, 15.5], [114, 16.2], [124, 17], [134, 17.2], [141, 15], [146, 8]];
var AZT = [[84, 10.6], [92, 11.6], [100, 11], [106, 11], [114, 11.8], [124, 12.6], [134, 11.8], [141, 8.8], [146, 5]];
var WAND = 2.0;
function wand(x, y, z) {   /* Abstand zur Ellipse (Naeherung erster Ordnung: f / |grad f|), innen < 0, minus WAND */
  var yy = y < 84 ? 84 : y > 146 ? 146 : y, ax = interp(AXT, yy), az = interp(AZT, yy), dz = z - 0.3;
  var e = Math.sqrt(x * x / (ax * ax) + dz * dz / (az * az));
  if (e < 0.1) return -az * (1 - e) + WAND;
  return (e - 1) * e / Math.sqrt(x * x / (ax * ax * ax * ax) + dz * dz / (az * az * az * az)) + WAND;
}
/* Wirbelsaeule: Wirbelkoerper (Radius nach Hoehe, Tabelle RWT aus koerper.js) auf der Linie zst(y) der Lungenform */
var RWT = [[100, 2.7], [114, 2.5], [117, 2.0], [140, 1.8], [143, 1.5], [150, 1.35]];
function wirbelsaeule(x, y, z) { var dz = z - lunge().zst(y); return Math.sqrt(x * x + dz * dz) - interp(RWT, y); }

/* Bahnen der Nachbarn: Steuerpunkte wie in koerper.js (rohr, Catmull-Rom); Punkte davor und danach stehen nur da, damit der
   Verlauf im benutzten Abschnitt derselbe ist wie im Koerper */
var BAHN = {
  dickdarm: [[-11.5, 95, 0], [-11.6, 100, -0.5], [-10.8, 103.4, 0.8], [-8.5, 102, 4], [-6, 99.6, 6.4], [-1, 98.6, 7], [4, 99.6, 6.8], [8, 103, 4], [10.8, 106.5, -2.5]],   /* rechte Biegung und querer Teil, r 1,8 */
  duenndarm: [[-2.0, 104.0, 3.2], [-3.4, 105, 1.6], [-5.8, 103.6, -0.2], [-7.0, 100, -0.8], [-6.6, 96.6, -0.8], [-3.6, 94.8, -0.6]],   /* Zwoelffingerdarm: oberer und absteigender Teil, r 1,0 */
  speiseroehre: [[0.9, 122, -3.4], [1.6, 115, -2.8], [2.4, 110.5, -1.5], [3.8, 107.6, 1.0]],   /* Ende vor dem Magen, r 0,8 */
  aorta: [[4.9, 121, -3.9], [5.0, 118, -3.9], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]],   /* r 1,25 */
  hohlvene: [[-1.65, 119.2, 0.65], [-1.9, 115, -0.3], [-2.2, 106, -2.2], [-2.4, 98, -2.4], [-2.0, 92, -1.6]]   /* untere Hohlvene, r 1,1 */
};
var NIERE_R = { p: [-7.5, 102.5, -6.2], r: [2.9, 5.8, 2.5] };   /* rechte Niere: Ersatz-Ellipsoid um ihre Mitte (nierenMitte(-1) in koerper.js) */
function magen(x, y, z) {   /* Magen wie sdfMagen in koerper.js */
  var d = ell(x, y, z, 7.8, 109.6, -1.8, 5.0, 4.6, 4.6);
  d = smin(d, kap(x, y, z, 7.6, 108, -1.4, 6.6, 101.6, 1.0, 4.4, 4.2), 3);
  d = smin(d, kap(x, y, z, 6.6, 101.6, 1.0, 2.5, 100.2, 3.0, 4.2, 3.0), 3);
  return smin(d, kap(x, y, z, 2.5, 100.2, 3.0, -2.0, 104.0, 3.2, 3.0, 1.7), 2);
}

/* Abstandsfeld f, in z-Richtung um bis zu l cm verlaengert (richtung 1 = nach vorn, -1 = nach hinten): hinter der Speiseroehre und unter dem
   Dickdarm bleibt so kein duenner Lebersaum stehen */
function verlaengert(f, l, richtung) {
  return function (x, y, z) {
    var d = f(x, y, z);
    for (var k = 1; k <= l; k++) { var e = f(x, y, z - richtung * k); if (e < d) d = e; }
    return d;
  };
}

var NACH = null;
function nachbarn() {
  if (NACH) return NACH;
  var dick = kurve(BAHN.dickdarm, 8).slice(8, 8 * 7 + 1);   /* Abschnitt von (-11,6; 100; -0,5) bis (8; 103; 4) */
  NACH = {
    dickdarm: verlaengert(kette(dick, 1.8), 3, 1),
    duenndarm: kette(kurve(BAHN.duenndarm, 8).slice(0, 8 * 4 + 1), 1.0),
    speiseroehre: verlaengert(kette(kurve(BAHN.speiseroehre, 8), 0.8), 4, -1),
    aorta: kette(kurve(BAHN.aorta, 8), 1.25),
    niere: function (x, y, z) { return ell(x, y, z, NIERE_R.p[0], NIERE_R.p[1], NIERE_R.p[2], NIERE_R.r[0], NIERE_R.r[1], NIERE_R.r[2]); }
  };
  return NACH;
}
/* Oberer Abschnitt der Hohlvene, Rinne an der Rueckseite: Querschnitt in x/z um die Mittellinie, nach hinten offen */
var HV = null;
function hohlveneLinie() {
  if (!HV) {
    var p = kurve(BAHN.hohlvene, 10).filter(function (q) { return q[1] > 96 && q[1] < 121; }).reverse();   /* von unten nach oben */
    HV = p;
  }
  return HV;
}
function hohlveneMitte(y) {   /* x und z der Mittellinie in der Hoehe y */
  var p = hohlveneLinie(), i = 1;
  if (y <= p[0][1]) return [p[0][0], p[0][2]];
  while (i < p.length - 1 && p[i][1] < y) i++;
  var f = (y - p[i - 1][1]) / ((p[i][1] - p[i - 1][1]) || 1);
  return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][2] + (p[i][2] - p[i - 1][2]) * f];
}
var HV_R = 1.1;
function hohlveneRinne(x, y, z) {   /* Abstand zur Rinne (Radius HV_R), hinter der Hohlvene offen */
  var m = hohlveneMitte(y), a = x - m[0], b = z - m[1];
  return b < 0 ? Math.abs(a) - HV_R : Math.sqrt(a * a + b * b) - HV_R;
}

/* ---- Leber insgesamt ---- */
/* Eingeweideflaeche (Unterseite): Ebene y = 109,0 + 0,36 x - 0,51 z, rechts aussen (x < -6) bis zu 2 cm tiefer */
function ebeneY(x, z) { return 109.0 + 0.36 * x - 0.51 * z - 2 * glatt(-6, -12, x); }
function unten(x, y, z) { return (ebeneY(x, z) - y) * 0.867; }

/* Ausguss des Raums unter der rechten Zwerchfellkuppel: oben die Kuppel (0,5 cm darunter), seitlich/vorn/hinten die Haut minus
   Wand, unten die Eingeweideflaeche; die Kante unten (Unterrand) ist schmal, aber verrundet (Radius ca. 0,5 cm): ein Messerrand braeche im
   Gitter des Koerpers (h = 0,6) zu Zacken und Loechern auf */
var OB = 0.5;
function ausguss(x, y, z) {
  var d = smax(0.4 * (y - (kuppel(x, z) - OB)), wand(x, y, z), 1.6);
  return smax(d, unten(x, y, z), 3.0);
}

/* Gallenblase: birnenfoermig, Grund (vorn unten) - Koerper - Hals (an der Leberpforte); Kenngroessen fuer das Zusammenziehen */
var GALLENBLASE = {
  fundus: { p: [-5.7, 103.45, 6.2], r: 1.4 },
  koerper: { p: [-5.4, 104.6, 4.0], r: 1.25 },
  hals: { p: [-4.5, 106.4, 2.1], r: 0.7 },
  grenzen: [[-7.5, 101.7, 1.0], [-3.4, 107.5, 8.0]]
};
function gallenblase(x, y, z) { return gallenblaseMit(1)(x, y, z); }
/* Gallenblase mit Fuellung f (1 = voll wie oben, kleiner = zusammengezogen: Radien und Laenge schrumpfen mit f, der Hals bleibt an der Pforte) */
function gallenblaseMit(f) {
  var G = GALLENBLASE, h = G.hals.p, k = G.koerper.p, g = G.fundus.p;
  var s = Math.pow(f, 1 / 3);
  var K = [h[0] + (k[0] - h[0]) * f, h[1] + (k[1] - h[1]) * f, h[2] + (k[2] - h[2]) * f];
  var Fu = [h[0] + (g[0] - h[0]) * f, h[1] + (g[1] - h[1]) * f, h[2] + (g[2] - h[2]) * f];
  var rf = G.fundus.r * s, rk = G.koerper.r * s, rh = G.hals.r * (0.55 + 0.45 * s);
  return function (x, y, z) {
    var d = kap(x, y, z, Fu[0], Fu[1], Fu[2], K[0], K[1], K[2], rf, rk);
    return smin(d, kap(x, y, z, K[0], K[1], K[2], h[0], h[1], h[2], rk, rh), 0.6);
  };
}

/* Furchen der Eingeweideflaeche (H-Form): Leberpforte quer, Furche des runden Leberbands nach vorn zum Unterrand, Furche des
   Venenbands nach hinten-oben zur Hohlvene; die Achsen folgen der Ebene (knapp darunter) */
var FURCHE = {
  pforte: { pts: [[-4.2, 0.9, -0.2], [-1.9, 0.9, -0.2], [0.4, 0.9, -0.2]], r: 0.85 },   /* [x, z, Tiefe unter der Ebene] */
  band: { pts: [[0.55, 0.95, -0.1], [0.9, 3.5, -0.1], [0.9, 6.0, -0.1], [0.9, 7.4, -0.1]], r: 0.45 }
};
var VENENBAND = [[0.5, 108.2, 1.1], [0.8, 110.4, -2.5], [0.7, 112.5, -3.15], [0.5, 113.8, -3.15]];   /* Venenband: Mittellinie (x, y, z) */
var FU = null;
function furchen() {
  if (FU) return FU;
  var auf = function (q) { return [q[0], ebeneY(q[0], q[1]) + q[2], q[1]]; };
  FU = {
    pforte: kette(kurve(FURCHE.pforte.pts.map(auf), 6), FURCHE.pforte.r),
    band: kette(kurve(FURCHE.band.pts.map(auf), 6), FURCHE.band.r),
    vene: kette(kurve(VENENBAND, 6), 0.3),
    grube: gallenblaseMit(1)
  };
  return FU;
}

var DICKE = 0.3, DICKE_MAGEN = 0.2;   /* Abstand der Leber zu den Nachbarn (zum Magen enger: unter der linken Kuppel ist kaum Platz) */
function leber(x, y, z) {
  var d = ausguss(x, y, z);
  if (d > 3) return d;
  var N = nachbarn();
  d = smax(d, DICKE - N.dickdarm(x, y, z), 0.5);
  d = smax(d, DICKE - N.niere(x, y, z), 0.5);
  d = smax(d, DICKE - N.duenndarm(x, y, z), 0.4);
  d = smax(d, DICKE_MAGEN - magen(x, y, z), 0.6);
  d = smax(d, DICKE - N.speiseroehre(x, y, z), 0.5);
  d = smax(d, DICKE - N.aorta(x, y, z), 0.5);
  d = smax(d, DICKE - wirbelsaeule(x, y, z), 0.6);
  d = smax(d, 0.15 - hohlveneRinne(x, y, z), 0.4);
  if (d > 1.5) return d;
  var F = furchen();
  d = smax(d, -F.pforte(x, y, z), 0.25);
  d = smax(d, -F.band(x, y, z), 0.2);
  d = smax(d, -F.vene(x, y, z), 0.15);
  d = smax(d, 0.15 - F.grube(x, y, z), 0.25);   /* Gallenblasengrube */
  return d;
}
var GRENZEN = [[-13.8, 103.2, -5.2], [7.6, 117.5, 6.6]];   /* Gitterbox der Leber (mit 0,3 cm Rand) */

/* ---- Lappen (fuer das Detailmodell): je ein eigenes Abstandsfeld, durch Spalte (SPALT cm) getrennt ----
   Rechter Lappen = der Rest; linker Lappen links der Ebene des Sichelbands; Quadratlappen nur an der Unterseite: zwischen Gallenblasengrube
   und Furche des runden Leberbands, vor der Leberpforte, als Schicht (QUADRAT_TIEFE) unter der Eingeweideflaeche, mindestens QUADRAT_TIEFE hinter
   dem Unterrand und der Vorderflaeche (dort laeuft keine Naht ueber die Vorderflaeche); Schwanzlappen an der Rueckseite zwischen Rinne der
   Hohlvene und Furche des Venenbands, hinter der Leberpforte, bis Y_SCHWANZ. */
var SPALT = 0.15;
var X_SICHEL = 0.9;                 /* Ebene des Sichelbands, der Furche des runden Leberbands und des Venenbands */
var X_GRUBE = -4.4;                 /* Gallenblasengrube: seitliche Grenze des Quadratlappens */
var Z_PFORTE = [0.05, 1.75];        /* hintere und vordere Kante der Leberpforte */
var X_HOHLVENE = -1.2;              /* rechte Grenze des Schwanzlappens */
var Y_SCHWANZ = 114;
var QUADRAT_TIEFE = 1.5;
function abstandKuppel(x, y, z) {   /* Abstand unter der Kuppel-Oberflaeche der Leber (innen > 0), mit der Neigung der Kuppel */
  var e = 0.1, kx = kuppel(x + e, z) - kuppel(x - e, z), kz = kuppel(x, z + e) - kuppel(x, z - e);
  return ((kuppel(x, z) - OB) - y) / Math.sqrt(1 + (kx * kx + kz * kz) / (4 * e * e));
}
var LAPPEN = null;
function lappen() {
  if (LAPPEN) return LAPPEN;
  var g = SPALT / 2;
  var fLinks = function (l, x) { return Math.max(l, X_SICHEL + g - x); };
  var fQuadrat = function (l, x, y, z) {
    if (l > 0.2) return l;
    return Math.max(l, x - (X_SICHEL - g), X_GRUBE + g - x, Z_PFORTE[1] + g - z, -unten(x, y, z) - QUADRAT_TIEFE, QUADRAT_TIEFE - abstandKuppel(x, y, z));
  };
  var fSchwanz = function (l, x, y, z) { return Math.max(l, x - (X_SICHEL - g), X_HOHLVENE + g - x, z - (Z_PFORTE[0] - g), y - Y_SCHWANZ); };
  var lap = function (id, f, gr) { return { id: id, sdf: f, grenzen: gr }; };
  LAPPEN = [
    lap('lappenR', function (x, y, z) {
      var l = leber(x, y, z);
      if (l > 0.2) return l;
      return Math.max(l, SPALT - Math.min(fLinks(l, x), fQuadrat(l, x, y, z), fSchwanz(l, x, y, z)));
    }, [[-13.8, 103.2, -5.2], [1.2, 117.5, 6.6]]),
    lap('lappenL', function (x, y, z) { return fLinks(leber(x, y, z), x); }, [[0.6, 106.7, -3.6], [7.6, 117.3, 6.3]]),
    lap('quadrat', function (x, y, z) { return fQuadrat(leber(x, y, z), x, y, z); }, [[-4.7, 104.6, 1.5], [1.2, 110.4, 5.7]]),
    lap('schwanz', function (x, y, z) { return fSchwanz(leber(x, y, z), x, y, z); }, [[-1.5, 108.3, -3.9], [1.2, 114.4, 0.3]])
  ];
  return LAPPEN;
}

/* ---- Gefaesse und Gaenge ausserhalb der Leber: Mittellinien ----
   Steuerpunkte [x, y, z] (cm, Koerper-Koordinaten) mit Radius r0 -> r1; als Kurve gelten die Punkte wie beim Rohr im Koerper (Catmull-Rom,
   kurve()). Die Reihenfolge der Punkte folgt der Beschreibung (Pfortader: zur Leber hin; Milz- und Mesenterialvene: vom Zusammenfluss
   weg; Lebervenen: von der Hohlvene weg - das Blut fliesst jeweils in umgekehrter Richtung). */
var ZUSAMMENFLUSS = [-0.4, 101.0, -2.2];   /* hinter der Bauchspeicheldruese: Milzvene + obere Mesenterialvene -> Pfortader */
var STUMPF = 3.0;                          /* Laenge (cm ab dem Zusammenfluss), die Milz- und Mesenterialvene im Detailmodell als Stumpf zeigen */
var GEFAESSE = {
  pfortader: [
    { id: 'pfortaderStamm', pts: [ZUSAMMENFLUSS, [-1.3, 104.4, -0.5], [-2.0, 107.4, 0.8]], r0: 0.65, r1: 0.65 },   /* endet mit der Teilung an der Pforte */
    { id: 'milzvene', pts: [ZUSAMMENFLUSS, [1.4, 101.8, -2.7], [3.8, 103.3, -3.4], [6.2, 105.2, -3.9], [7.3, 106.8, -4.2]], r0: 0.4, r1: 0.4 },   /* laeuft in der Bauchspeicheldruese zum Milzhilus */
    { id: 'mesenterialvene', pts: [ZUSAMMENFLUSS, [-0.1, 99.0, -1.0], [0.3, 96.4, 0.9], [0.4, 93.6, 1.5]], r0: 0.5, r1: 0.5 }   /* obere Mesenterialvene */
  ],
  leberarterie: [   /* Abgang vorn an der Aorta, Truncus coeliacus, gemeinsame und eigentliche Leberarterie bis zur Pforte (links-vorn) */
    { id: 'leberarterie', pts: [[4.0, 109.2, -1.4], [3.5, 108.4, -1.3], [2.6, 107.7, -0.6], [1.4, 107.5, 0.4], [-0.8, 107.0, 1.1], [-1.6, 107.6, 1.5]], r0: 0.3, r1: 0.25 }
  ],
  lebervenen: [     /* die drei Hauptstaemme, ganz in der Leber; Muendung in die Hohlvene knapp unter dem Zwerchfell */
    { id: 'lebervene-rechts', pts: [[-2.9, 115.4, -0.4], [-6.5, 113.0, -1.0], [-10.0, 109.5, -1.0]], r0: 0.55, r1: 0.3 },
    { id: 'lebervene-mitte', pts: [[-2.2, 115.8, 0.8], [-3.5, 112.5, 3.0], [-4.5, 108.5, 5.0]], r0: 0.55, r1: 0.3 },
    { id: 'lebervene-links', pts: [[-0.9, 116.0, 0.1], [1.6, 114.6, 0.7], [3.9, 113.1, 1.4]], r0: 0.55, r1: 0.3 }
  ],
  gallengang: [     /* an der Pforte: Gallengang rechts-vorn, Arterie links-vorn, Pfortader hinten */
    { id: 'lebergang-rechts', pts: [[-2.8, 107.9, 1.5], [-3.7, 108.35, 1.4], [-4.6, 108.7, 1.25]], r0: 0.25, r1: 0.22 },
    { id: 'lebergang-links', pts: [[-2.8, 107.9, 1.5], [-1.9, 108.25, 1.65], [-0.9, 108.5, 1.8]], r0: 0.25, r1: 0.22 },
    { id: 'lebergang', pts: [[-2.8, 107.9, 1.5], [-3.2, 106.9, 1.4], [-3.4, 106.2, 0.8]], r0: 0.3, r1: 0.3 },   /* gemeinsamer Lebergang */
    { id: 'blasengang', pts: [[-4.5, 106.4, 2.1], [-4.25, 106.7, 1.65], [-3.9, 106.55, 1.3], [-3.75, 106.45, 1.1], [-3.4, 106.2, 0.8]], r0: 0.18, r1: 0.18 },   /* leicht gewunden */
    { id: 'hauptgallengang', pts: [[-3.4, 106.2, 0.8], [-3.7, 104.9, -0.4], [-4.5, 102.4, -0.5], [-5.3, 100.3, -0.8], [-5.95, 99.4, -0.8]], r0: 0.3, r1: 0.3 }   /* hinter dem Zwoelffingerdarm, durch den Kopf der Bauchspeicheldruese zur Papille */
  ],
  pankreasgang: [   /* Ende des Bauchspeicheldruesengangs bis zur Papille (nur Detailmodell) */
    { id: 'pankreasgang', pts: [[-3.6, 99.6, -1.6], [-4.9, 99.3, -1.1], [-5.95, 99.4, -0.8]], r0: 0.15, r1: 0.15 }
  ]
};

/* Stumpf eines Gefaesses ab seinem ersten Punkt: Punktfolge der Kurve bis zur Laenge laenge (cm); fuer Milz- und Mesenterialvene im Detailmodell
   (STUMPF = 3 cm ab dem Zusammenfluss) */
function stumpf(pts, laenge) {
  var c = kurve(pts, 12), out = [c[0]], tot = 0, i;
  for (i = 1; i < c.length; i++) {
    var l = Math.sqrt(Math.pow(c[i][0] - c[i - 1][0], 2) + Math.pow(c[i][1] - c[i - 1][1], 2) + Math.pow(c[i][2] - c[i - 1][2], 2));
    if (tot + l >= laenge) {
      var f = (laenge - tot) / l;
      out.push([c[i - 1][0] + (c[i][0] - c[i - 1][0]) * f, c[i - 1][1] + (c[i][1] - c[i - 1][1]) * f, c[i - 1][2] + (c[i][2] - c[i - 1][2]) * f]);
      break;
    }
    tot += l; out.push(c[i]);
  }
  return out;
}

/* ---- Umgebung (nur Detailmodell) ---- */
/* untere Hohlvene: Bahn wie im Koerper (r 1,1); fuer das Detailmodell der Abschnitt y = 98 bis 119 als Punktfolge (von unten nach oben) */
var HOHLVENE = { pts: BAHN.hohlvene, r: HV_R, y0: 98, y1: 119 };
function hohlveneAbschnitt() {
  return kurve(BAHN.hohlvene, 10).filter(function (q) { return q[1] >= HOHLVENE.y0 && q[1] <= HOHLVENE.y1; }).reverse();
}
/* Zwoelffingerdarm-Abschnitt: Koerperbahn vom Pfoertner bis zum Beginn des unteren Teils (Punktfolge), r 1,0; Papille am Ende des Hauptgallengangs
   an der medialen Wand des absteigenden Teils (p = Muendung auf der Aussenwand, richtung = ins Darmlumen, r = Radius der Erhebung) */
var DUODENUM = { r: 1.0 };
function duodenumLinie() { return kurve(BAHN.duenndarm, 12).slice(0, 12 * 4 + 1); }
var PAPILLE = { p: [-5.95, 99.4, -0.8], richtung: [-1, 0, 0], r: 0.45 };
/* Baender: Sichelband = duenne Platte in der Ebene x = X_SICHEL auf Vorder- und Oberflaeche (Dicke 0,15, vorn 1,2 cm hoch, oben 0,4 cm: bis
   unter das Zwerchfell), vom Einschnitt am Unterrand bis nahe an die Hohlvene; rundes Leberband = Strang (r 0,3) im freien unteren Rand, in der
   Furche nach hinten bis zum linken Pfortaderast (Steuerpunkte [x, y, z], Catmull-Rom) */
function sichelband(x, y, z) {
  var l = leber(x, y, z), h = 1.2 - 0.8 * glatt(114.5, 117, y);
  var d = Math.max(Math.abs(x - X_SICHEL) - 0.075, l - h, -0.25 - l);
  return Math.max(d, z - 6.5, 0.8 - z, ebeneY(X_SICHEL, z) - 0.3 - y);
}
var SICHELBAND = { grenzen: [[0.5, 105.3, 0.4], [1.3, 118.3, 6.9]] };
var RUNDES_BAND = {
  pts: [[0.6, ebeneY(0.6, 1.0) - 0.1, 1.0], [0.9, ebeneY(0.9, 3.5) - 0.1, 3.5], [0.9, ebeneY(0.9, 6.0) - 0.1, 6.0], [1.0, 104.0, 7.6], [1.0, 101.5, 8.5]], r: 0.3
};

/* ---- Baeume in der Leber (Pfortader, Leberarterie, Gallengang, Lebervenen) ----
   Deterministisch (kein Zufall), einmal berechnet und zwischengespeichert. Jeder Ast: { pts: [[x, y, z], ...] (Steuerpunkte einer
   Catmull-Rom-Kurve, kurve()), r0, r1 (Radius am Anfang und Ende), gen (Generation), lappen (Lappen, in dem das Ende liegt) }.
   Vorgehen wie bei den Bronchien der Lunge: die Aeste der ersten Generationen sind vorgegeben (Pforte, Richtung des Zielgebiets), die
   folgenden Generationen entstehen aus festen Winkeln; jedes Ende wird gekuerzt, bis der Ast mit Abstand BAUM_RAND + Radius im Lebergewebe
   liegt (Leber-Abstandsfeld) und anderen Aesten nicht zu nahe kommt. Arterie und Gallengang laufen parallel zur Pfortader (gleiche
   Verzweigung, seitlich versetzt), die Lebervenen getrennt davon (>= VENE_ABSTAND zur Pfortader und ihren Begleitern). */
var BAUM_RAND = 0.3, VENE_ABSTAND = 0.5;
function vsub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vadd(a, b, k) { k = k === undefined ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function vlen(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function vnorm(a) { var l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function vkreuz(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vdot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function abstandSeg(p, a, b) {   /* Abstand des Punkts p zur Strecke a-b */
  var ab = vsub(b, a), ap = vsub(p, a), l2 = vdot(ab, ab), t = l2 > 0 ? vdot(ap, ab) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return vlen(vsub(ap, [ab[0] * t, ab[1] * t, ab[2] * t]));
}
function radiusBei(a, f) { return a.r0 + (a.r1 - a.r0) * f; }

var BAEUME = null;
function baeume() {
  if (BAEUME) return BAEUME;
  var lap = lappen();
  var lappenVon = function (p) {   /* Lappen, in dem p am tiefsten liegt */
    var best = lap[0].id, bd = 1e9;
    lap.forEach(function (l) { var d = l.sdf(p[0], p[1], p[2]); if (d < bd) { bd = d; best = l.id; } });
    return best;
  };
  var tiefe = function (p) { return -leber(p[0], p[1], p[2]); };   /* Abstand zur Leberoberflaeche (innen > 0) */
  /* geforderte Wandabstaende: Pfortaderbaum (haelt zu den Lebervenen Platz fuer die Begleiter), Begleiter, Lebervenen */
  var ANF_PF = { venen: VENE_ABSTAND + 0.7, pfortader: 0.15 };
  var ANF_BEGL = { pfortader: 0.03, arterie: 0.03, galle: 0.03, venen: VENE_ABSTAND };
  var ANF_HV = { pfortader: VENE_ABSTAND, arterie: VENE_ABSTAND, galle: VENE_ABSTAND, venen: 0.15 };
  var SEG = [];   /* alle Aeste als kurze Strecken fuer die Abstandspruefung: { a, b, r, ast, baum } */
  var eintragen = function (baum, ast) {
    var c = kurve(ast.pts, 3), n = c.length - 1;
    for (var i = 0; i < n; i++) SEG.push({ a: c[i], b: c[i + 1], r: radiusBei(ast, (i + 0.5) / n), ast: ast, baum: baum });
  };
  /* Spielraum der Rohrwand bei p (Radius r) gegenueber den Aesten: kleinster Wert von (Wandabstand - geforderter Abstand), anf = { Baum: geforderter
     Wandabstand }; >= 0 heisst: alle Abstaende eingehalten. Der Ast ohne (Liste) und seine Vorfahren zaehlen nicht. */
  var frei = function (p, r, anf, ohne) {
    var m = 1e9;
    for (var i = 0; i < SEG.length; i++) {
      var g = SEG[i], q = anf[g.baum];
      if (q === undefined || (ohne && ohne.indexOf(g.ast) >= 0)) continue;
      var d = abstandSeg(p, g.a, g.b) - g.r - r - q;
      if (d < m) m = d;
    }
    return m;
  };
  /* Ast von start in Richtung dir (Einheitsvektor), Laenge L0 (wird bis auf 45 % gekuerzt), Radien rr = [r0, r1]; null, wenn er nicht passt */
  var anlegen = function (baum, start, dir, L0, rr, gen, ohne, anf, bogen) {
    for (var k = 0; k < 6; k++) {
      var L = L0 * Math.pow(0.85, k);
      if (L < 0.45 * L0) break;
      var u = vnorm(vkreuz(dir, Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
      var e = vadd(start, dir, L), m = vadd(vadd(start, dir, L * 0.5), u, bogen * L);
      var q = [vadd(start, dir, L * 0.25), m, vadd(start, dir, L * 0.75), e], ok = true, i;
      for (i = 0; i < q.length && ok; i++) {
        var r = radiusBei({ r0: rr[0], r1: rr[1] }, (i + 1) / 4);
        if (tiefe(q[i]) < BAUM_RAND + r) ok = false;
        else if (i >= 1 && frei(q[i], r, anf, ohne) < 0) ok = false;
      }
      if (ok) return { pts: [start, m, e], r0: rr[0], r1: rr[1], gen: gen, lappen: lappenVon(e) };
    }
    return null;
  };
  /* Richtungen: 48 gleichmaessig verteilte Einheitsvektoren (Fibonacci-Kugel), deterministisch */
  var KUGEL = [], i0, ga = Math.PI * (3 - Math.sqrt(5));
  for (i0 = 0; i0 < 48; i0++) { var yk = 1 - 2 * (i0 + 0.5) / 48, rk = Math.sqrt(1 - yk * yk); KUGEL.push([Math.cos(i0 * ga) * rk, yk, Math.sin(i0 * ga) * rk]); }
  /* zwei Kinderaeste am Ende des Asts a (Winkel zur Richtung des Asts zwischen 15 und 75 Grad): die Richtung mit dem tiefsten und
     freiesten Ende gewinnt, der zweite Ast liegt mindestens 55 Grad davon entfernt */
  var kinder = function (baum, a, gen, L0, rr, anf, fernGewicht) {
    var n = a.pts.length, b = a.pts[n - 1], d = vnorm(vsub(b, a.pts[n - 2])), c = [];
    KUGEL.forEach(function (dir, k) {
      var co = vdot(dir, d);
      if (co < 0.26 || co > 0.97) return;
      var e = vadd(b, dir, L0), sc = Math.min(tiefe(e) - BAUM_RAND - rr[1], 1.5) + fernGewicht * Math.min(Math.max(frei(e, rr[1], anf, [a]), -1), 1.5) + 0.5 * co;
      c.push({ k: k, dir: dir, sc: sc });
    });
    c.sort(function (p, q) { return q.sc - p.sc || p.k - q.k; });
    var out = [], erste = null, i;
    for (i = 0; i < c.length && out.length < 2; i++) {
      if (erste && vdot(c[i].dir, erste) > Math.cos(55 * Math.PI / 180)) continue;
      var ast = anlegen(baum, b, c[i].dir, L0, rr, gen, [a], anf, 0.05 * (c[i].k % 2 ? 1 : -1));
      if (ast) { out.push(ast); erste = erste || c[i].dir; }
    }
    return out;
  };
  var einwaerts = function (p) {   /* Richtung ins Innere der Leber (negativer Gradient des Abstandsfelds) */
    var e = 0.15, g = [leber(p[0] + e, p[1], p[2]) - leber(p[0] - e, p[1], p[2]), leber(p[0], p[1] + e, p[2]) - leber(p[0], p[1] - e, p[2]), leber(p[0], p[1], p[2] + e) - leber(p[0], p[1], p[2] - e)];
    return vnorm([-g[0], -g[1], -g[2]]);
  };
  var baum = { pfortader: [], arterie: [], galle: [], venen: [] }, endpunkte = [];

  /* 1. Lebervenen: die drei Hauptstaemme (aus GEFAESSE) zuerst, damit die Pfortader ihnen ausweicht */
  GEFAESSE.lebervenen.forEach(function (g) {
    var a = { pts: g.pts, r0: g.r0, r1: g.r1, gen: 0, lappen: lappenVon(g.pts[g.pts.length - 1]) };
    baum.venen.push(a); eintragen('venen', a);
  });

  /* 2. Pfortaderbaum: Aeste der ersten zwei Generationen aus der Beschreibung, danach drei Generationen aus festen Winkeln */
  var P0 = GEFAESSE.pfortader[0].pts[2];   /* Teilung an der Pforte */
  var feste = function (start, ziel, rr, gen, ohne, laenge) {   /* Ast von start auf ziel zu (Laenge laenge oder bis ziel); passt er nicht, dreht die Richtung schrittweise ins Innere */
    var d = vsub(ziel, start), L = Math.min(vlen(d), laenge || 1e9), w = vnorm(d), inw = einwaerts(vadd(start, w, L * 0.7)), t, a = null;
    for (t = 0; t < 5 && !a; t++) a = anlegen('pfortader', start, vnorm(vadd(w, inw, 0.35 * t)), L, rr, gen, ohne, ANF_PF, 0.04);
    return a;
  };
  var vorgabe = function (pts, r0, r1, gen) { var a = { pts: pts, r0: r0, r1: r1, gen: gen, lappen: lappenVon(pts[pts.length - 1]) }; baum.pfortader.push(a); eintragen('pfortader', a); return a; };
  var R1 = vorgabe([P0, [-4.5, 108.2, 0.6], [-6.5, 108.6, 0.4]], 0.5, 0.42, 1);
  var L1 = vorgabe([P0, [-0.9, 107.8, 0.9], [0.2, 108.5, 1.1], [0.7, 109.7, 1.9], [0.85, 109.6, 3.2], [0.85, 108.9, 4.8]], 0.45, 0.35, 1);
  var gen2 = [];
  var zweig = function (eltern, start, ziel, rr, laenge) {
    var a = feste(start, ziel, rr, 2, [eltern], laenge);
    if (a) { baum.pfortader.push(a); eintragen('pfortader', a); gen2.push(a); }
    return a;
  };
  zweig(R1, R1.pts[2], [-8.5, 107.2, 3.5], [0.34, 0.26]);      /* rechts vorn */
  zweig(R1, R1.pts[2], [-9.0, 109.5, -3.0], [0.34, 0.26]);     /* rechts hinten */
  zweig(L1, L1.pts[3], [5.5, 111.0, 2.0], [0.3, 0.24], 5.5);   /* linker Lappen */
  zweig(L1, L1.pts[5], [4.5, 110.0, 4.2], [0.3, 0.24], 4.5);   /* linker Lappen, vorn */
  /* Quadrat- und Schwanzlappen sind duenn: der Ast sucht sich ueber einen Zwischenpunkt einen Weg im Gewebe zur tiefsten Stelle des Lappens
     (Ziel statt der Richtungen der Beschreibung: dort liegt die Leber nur 0,7 cm tief) */
  var weg = function (eltern, start, ziel, rr, gen) {
    var m0 = [(start[0] + ziel[0]) / 2, (start[1] + ziel[1]) / 2, (start[2] + ziel[2]) / 2], best = null, bl = 1e9, i, j, k;
    for (i = -4; i <= 4; i++) for (j = -4; j <= 4; j++) for (k = -4; k <= 4; k++) {
      var M = [m0[0] + 0.4 * i, m0[1] + 0.4 * j, m0[2] + 0.4 * k], len = vlen(vsub(M, start)) + vlen(vsub(ziel, M));
      if (len >= bl) continue;
      var c = kurve([start, M, ziel], 4), ok = true, q;
      for (q = 2; q < c.length && ok; q++) ok = tiefe(c[q]) >= BAUM_RAND + rr[0] && frei(c[q], rr[0], ANF_PF, [eltern]) >= 0;
      if (ok) { bl = len; best = M; }
    }
    if (!best) return null;
    var a = { pts: [start, best, ziel], r0: rr[0], r1: rr[1], gen: gen, lappen: lappenVon(ziel) };
    baum.pfortader.push(a); eintragen('pfortader', a); gen2.push(a);
    return a;
  };
  var tiefster = function (id) {   /* tiefste Stelle (groesster Abstand zur Oberflaeche) des Lappens id, Raster 0,25 cm */
    var l = lap.filter(function (q) { return q.id === id; })[0], g = l.grenzen, best = null, bd = -1e9, x, y, z;
    for (x = g[0][0]; x <= g[1][0]; x += 0.25) for (y = g[0][1]; y <= g[1][1]; y += 0.25) for (z = g[0][2]; z <= g[1][2]; z += 0.25) {
      var d = -l.sdf(x, y, z);
      if (d > bd) { bd = d; best = [x, y, z]; }
    }
    return best;
  };
  var zumLappen = function (id, starts) {   /* erster Steuerpunkt des linken Pfortaderasts in starts, von dem aus ein Weg gelingt */
    var ziel = tiefster(id);
    for (var i = 0; i < starts.length; i++) if (weg(L1, L1.pts[starts[i]], ziel, [0.17, 0.14], 2)) return;
  };
  zumLappen('quadrat', [5, 3, 2, 1]);   /* Quadratlappen */
  zumLappen('schwanz', [2, 3, 1, 5]);   /* Schwanzlappen */
  var LAENGE = [0, 0, 0, 2.4, 1.7, 1.2], RADIUS = [0, 0, 0, [0.22, 0.18], [0.18, 0.14], [0.14, 0.1]];
  var gelaende = function (eltern, gen) {
    if (gen > 5 || eltern.lappen === 'quadrat') return;   /* im Quadratlappen (nur 0,7 cm tief) endet der Ast: seine Kinder liefen in den rechten Lappen */
    var duenn = eltern.lappen === 'quadrat' || eltern.lappen === 'schwanz', f = duenn ? 0.5 : 1;
    kinder('pfortader', eltern, gen, LAENGE[gen] * f, [Math.min(RADIUS[gen][0], eltern.r1), RADIUS[gen][1] * (duenn ? 0.8 : 1)], ANF_PF, 0.6).forEach(function (a) {
      baum.pfortader.push(a); eintragen('pfortader', a);
      if (gen === 5) endpunkte.push({ p: a.pts[a.pts.length - 1], lappen: a.lappen, r: a.r1 });
      else gelaende(a, gen + 1);
    });
  };
  gen2.forEach(function (a) { gelaende(a, 3); });
  /* Aeste ohne Kinder in Generation < 5: ihr Ende zaehlt als Endpunkt, falls es keine tiefere Generation gibt */
  baum.pfortader.forEach(function (a) {
    if (a.gen >= 2 && a.gen < 5 && !baum.pfortader.some(function (b) { return b.pts[0] === a.pts[a.pts.length - 1]; })) endpunkte.push({ p: a.pts[a.pts.length - 1], lappen: a.lappen, r: a.r1 });
  });

  /* 3. Leberarterie und Gallengang: parallel zu jedem Ast der Pfortader, seitlich versetzt, Radius 0,4- bzw. 0,5-mal; der Versatz zeigt
     zunaechst nach vorn (+/- 55 Grad zur Seite) und weicht aus, wenn der Ast sonst zu nah an die Leberoberflaeche oder an einen anderen Ast kaeme */
  var begleiter = function (name, anteil, vorz) {
    var ZU = [], aus = [], WINKEL = [55, 85, 115, 145, 175, 25], FAKTOR = [1, 1.3, 1.7];
    baum.pfortader.forEach(function (pa, pi) {
      var c = kurve(pa.pts, 3), n = c.length, rr0 = pa.r0 * anteil, rr1 = pa.r1 * anteil;
      /* Eltern: der Ast, an dessen Steuerpunkt dieser Ast beginnt; der Begleiter beginnt am entsprechenden Punkt des Elternbegleiters */
      var start = null, q, k;
      for (q = 0; q < pi && !start; q++) for (k = 0; k < baum.pfortader[q].pts.length && !start; k++) if (baum.pfortader[q].pts[k] === pa.pts[0]) start = ZU[q].pts[3 * k];
      var beste = null, bm = -1e9, wi, fi;
      for (wi = 0; wi < WINKEL.length * 2 && !(beste && bm >= 0); wi++) for (fi = 0; fi < FAKTOR.length && !(beste && bm >= 0); fi++) {
        var wk = vorz * WINKEL[wi % WINKEL.length] * Math.PI / 180 * (wi >= WINKEL.length ? -1 : 1), pts = [], i, m = 1e9;
        for (i = 0; i < n; i++) {
          var t = vnorm(vsub(c[Math.min(n - 1, i + 1)], c[Math.max(0, i - 1)])), a = vsub([0, 0, 1], [t[2] * t[0], t[2] * t[1], t[2] * t[2]]);
          a = vlen(a) < 0.2 ? vnorm(vkreuz(t, [0, 1, 0])) : vnorm(a);
          var bb = vkreuz(t, a), f = i / (n - 1), rp = radiusBei(pa, f), rb = rr0 + (rr1 - rr0) * f, o = Math.max(0.35, rp + rb + 0.08) * FAKTOR[fi];
          pts.push(vadd(c[i], vadd([a[0] * Math.cos(wk), a[1] * Math.cos(wk), a[2] * Math.cos(wk)], bb, Math.sin(wk)), o));
        }
        if (start) pts[0] = start;
        var ast = { pts: pts, r0: rr0, r1: rr1, gen: pa.gen, lappen: pa.lappen };
        /* Pruefung: Tiefe im Gewebe (ausser nahe der Pforte bei Generation 1) und Abstand zu anderen Aesten (Anfang ausgenommen) */
        for (i = 1; i < n; i++) {
          var rf = rr0 + (rr1 - rr0) * i / (n - 1);
          if (pa.gen === 1 && vlen(vsub(pts[i], P0)) < 3.5) continue;
          var mm = Math.min(tiefe(pts[i]) - BAUM_RAND - rf, i < 3 ? 1 : frei(pts[i], rf, ANF_BEGL, null));
          if (mm < m) m = mm;
        }
        if (m > bm) { bm = m; beste = ast; }
      }
      ZU[pi] = beste; aus.push(beste); eintragen(name, beste);
    });
    return aus;
  };
  baum.arterie = begleiter('arterie', 0.4, 1);
  baum.galle = begleiter('galle', 0.5, -1);

  /* 4. Lebervenen: Aeste an den Hauptstaemmen (zwei Generationen), moeglichst weit von Pfortader und ihren Begleitern entfernt */
  var staemme = baum.venen.slice();
  staemme.forEach(function (st) {
    var c = kurve(st.pts, 6), nn = c.length;
    [0.4, 0.72].forEach(function (t, ti) {
      var i = Math.round((nn - 1) * t), pt = c[i], tg = vnorm(vsub(c[Math.min(nn - 1, i + 1)], c[Math.max(0, i - 1)])), cand = [];
      KUGEL.forEach(function (dir, k) {
        var co = vdot(dir, tg);
        if (co < 0.2 || co > 0.8) return;   /* seitlich vom Stamm abzweigend, zur Peripherie hin */
        var e = vadd(pt, dir, 3.2);
        cand.push({ k: k, dir: dir, sc: Math.min(tiefe(e) - 0.6, 1.5) + 0.8 * Math.min(Math.max(frei(e, 0.2, ANF_HV, null), -1), 2.5) });
      });
      cand.sort(function (p, q) { return q.sc - p.sc || p.k - q.k; });
      var n1 = 0, k, erste = null;
      for (k = 0; k < cand.length && n1 < 2; k++) {
        if (erste && vdot(cand[k].dir, erste) > Math.cos(70 * Math.PI / 180)) continue;
        var a = anlegen('venen', pt, cand[k].dir, 3.2, [0.3, 0.2], 1, [st], ANF_HV, 0.04);
        if (a) { baum.venen.push(a); eintragen('venen', a); n1++; erste = erste || cand[k].dir; }
      }
    });
  });
  baum.venen.filter(function (a) { return a.gen === 1; }).forEach(function (a) {
    kinder('venen', a, 2, 2.2, [0.2, 0.14], ANF_HV, 0.8).forEach(function (b) { baum.venen.push(b); eintragen('venen', b); });
  });

  BAEUME = { pfortader: baum.pfortader, arterie: baum.arterie, galle: baum.galle, venen: baum.venen, endpunkte: endpunkte };
  return BAEUME;
}

Kern.form('leber', {
  leber: leber, grenzen: GRENZEN, ebeneY: ebeneY, kurve: kurve, kette: kette,
  gallenblase: gallenblase, gallenblaseMit: gallenblaseMit, GALLENBLASE: GALLENBLASE,
  lappen: lappen, SPALT: SPALT,
  GEFAESSE: GEFAESSE, ZUSAMMENFLUSS: ZUSAMMENFLUSS, STUMPF: STUMPF,
  baeume: baeume, stumpf: stumpf,
  HOHLVENE: HOHLVENE, hohlveneAbschnitt: hohlveneAbschnitt, DUODENUM: DUODENUM, duodenumLinie: duodenumLinie, PAPILLE: PAPILLE,
  sichelband: sichelband, SICHELBAND: SICHELBAND, RUNDES_BAND: RUNDES_BAND
});
})();
