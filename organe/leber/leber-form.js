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
   abzueglich 2 cm Wand, unten die Eingeweideflaeche (Ebene, hinten mit dem
   Wulst des Schwanzlappens, rechts aussen mit der Lippe vor der rechten
   Dickdarmbiegung), dazu die Mulden der Nachbarn (Dickdarm, rechte Niere,
   Zwoelffingerdarm, Magen, Speiseroehre, Aorta, Wirbelsaeule, Rinne der unteren
   Hohlvene) und die H-foermigen Furchen der Unterseite. Die Nachbarn sind einfache Nachbildungen der Formen aus
   organe/koerper/koerper.js (Tabellen AXT/AZT und RWT, Bahnen und Radien der
   Rohre, sdfMagen, Lage der rechten Niere), mit 0,15 bis 0,3 cm Abstand.

   Enthalten:
     leber(x,y,z)           die ganze Leber (fuer den Koerper, ohne Lappenspalten); grenzen = Gitterbox; ebeneY(x,z) = Hoehe der Eingeweideflaeche (mit Wulst)
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

/* Abstandsfeld einer Linienfolge mit Radius r (Kapselkette); weit entfernt (mehr als 4 cm) genuegt der Abstand zur Umhuellenden (untere Schranke):
   die Rundungen (smax) der Mulden reichen hoechstens 1,5 cm weit, bis dorthin muss das Feld stetig und genau sein, sonst riffeln Spruenge die Oberflaeche */
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

/* ---- Nachbarn der Leber (Lage und Form wie im Koerper, koerper.js; hier als einfache Nachbarformen nachgebildet) ---- */
/* Rumpf: Ellipse der Koerperhuelle um z = 0,3 (Tabellen AXT/AZT aus huelle in koerper.js); die Leber haelt WAND cm Abstand zur Haut */
var AXT = [[84, 16], [92, 17.2], [100, 16], [106, 15.5], [114, 16.2], [124, 17], [134, 17.2], [141, 15], [146, 8]];
var AZT = [[84, 10.6], [92, 11.6], [100, 11], [106, 11], [114, 11.8], [124, 12.6], [134, 11.8], [141, 8.8], [146, 5]];
var WAND = 2.0, WAND_LIPPE = 0.3;
function wand(x, y, z) {   /* Abstand zur Ellipse (Naeherung erster Ordnung: f / |grad f|), innen < 0, minus WAND; an der Lippe rechts aussen (unterer Rand, x < -11) um WAND_LIPPE schmaler */
  var yy = y < 84 ? 84 : y > 146 ? 146 : y, ax = interp(AXT, yy), az = interp(AZT, yy), dz = z - 0.3;
  var e = Math.sqrt(x * x / (ax * ax) + dz * dz / (az * az)), w = WAND - WAND_LIPPE * glatt(-10.5, -12.5, x) * glatt(105.8, 104.3, y);
  if (e < 0.1) return -az * (1 - e) + w;
  return (e - 1) * e / Math.sqrt(x * x / (ax * ax * ax * ax) + dz * dz / (az * az * az * az)) + w;
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

/* Abstandsfeld f, in z-Richtung um bis zu l cm verlaengert (richtung 1 = nach vorn, -1 = nach hinten): hinter der Speiseroehre bleibt so
   kein duenner Lebersaum stehen */
function verlaengert(f, l, richtung, schritt) {
  schritt = schritt || 1;
  return function (x, y, z) {
    var d = f(x, y, z);
    for (var k = schritt; k <= l + 1e-9; k += schritt) { var e = f(x, y, z - richtung * k); if (e < d) d = e; }
    return d;
  };
}

var NACH = null;
function nachbarn() {
  if (NACH) return NACH;
  var dick = kurve(BAHN.dickdarm, 8).slice(8, 8 * 7 + 1);   /* Abschnitt von (-11,6; 100; -0,5) bis (8; 103; 4) */
  NACH = {
    dickdarm: kette(dick, 1.8),
    duenndarm: kette(kurve(BAHN.duenndarm, 8).slice(0, 8 * 4 + 1), 1.0),
    speiseroehre: verlaengert(kette(kurve(BAHN.speiseroehre, 8), 0.8), 4, -1, 0.25),   /* feine Schritte: die Verlaengerung soll die Oberflaeche nicht riffeln */
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
/* Eingeweideflaeche (Unterseite): Ebene y = 109,0 + 0,36 x - 0,51 z, rechts aussen (x < -6) bis zu 2 cm tiefer; hinter der Leberpforte
   zwischen Hohlvenenrinne und Venenband-Furche ragt der Schwanzlappen als flacher, runder Wulst bis zu WULST.h cm tiefer vor
   (Form (1 - r^2)^2 auf einer Ellipse um [WULST.x, WULST.z] mit den Halbachsen rx, rz, null ausserhalb) */
var WULST = { x: 0.05, z: -1.5, rx: 1.2, rz: 2.0, h: 1.8 };
function wulst(x, z) {
  var u = (x - WULST.x) / WULST.rx, v = (z - WULST.z) / WULST.rz, r2 = u * u + v * v;
  return r2 >= 1 ? 0 : (1 - r2) * (1 - r2);
}
function ebeneY(x, z) { return 109.0 + 0.36 * x - 0.51 * z - 2 * glatt(-6, -12, x) - WULST.h * wulst(x, z); }
/* Unterrand rechts: Die rechte Seite der Leber haengt vor der rechten Dickdarmbiegung (Lippe, Dickdarm hinten ausgespart) bis auf diese Hoehe
   herunter (Tabelle [x, y], aufsteigend); wo der Dickdarm vor der Lippe wenig Platz laesst (x > -11), steigt der Rand weich an und folgt dann
   der Oberseite des querlaufenden Dickdarms. Der Boden wirkt nur rechts von x = -7 (dort liegt die Ebene tiefer), weiter links liegt er unter der Ebene. */
var UNTERRAND = [[-14, 101.7], [-12.6, 101.8], [-12, 101.95], [-11.6, 102.4], [-11.2, 103.1], [-10.8, 103.8], [-10.4, 104.4], [-10, 104.8], [-9, 104.7], [-8, 104.5], [-7.5, 104.5], [-6.5, 98]];
function unten(x, y, z) { return (smax(ebeneY(x, z), interp(UNTERRAND, x), 1.2) - y) * 0.867; }

/* Ausguss des Raums unter der rechten Zwerchfellkuppel: oben die Kuppel (0,5 cm darunter), seitlich/vorn/hinten die Haut minus
   Wand, unten die Eingeweideflaeche; die Kante unten (Unterrand) ist schmal, aber verrundet: ein Messerrand braeche im Gitter des
   Koerpers (h = 0,6) zu Zacken und Loechern auf. Die Rundung (smax-Radius) ist 3 cm; nur an der duennen Lippe rechts aussen (x < -12,5)
   1 cm (dazwischen weicher Uebergang), damit die Lippe nicht abgetragen wird. */
var OB = 0.5;
function ausguss(x, y, z) {
  var d = smax(0.4 * (y - (kuppel(x, z) - OB)), wand(x, y, z), 1.6);
  return smax(d, unten(x, y, z), 1.0 + 2.0 * glatt(-12.5, -9.0, x));
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
   Venenbands nach hinten zur Rueckseite (dort geht sie in die Mulde der Speiseroehre ueber); die Achsen folgen der Ebene (knapp darunter);
   alle Furchen sind klar, aber ruhig: breit, flach und mit verrundeten Raendern */
var FURCHE = {
  pforte: { pts: [[-4.2, 0.9, -0.2], [-1.9, 0.9, -0.2], [0.4, 0.9, -0.2]], r: 0.85 },   /* [x, z, Tiefe unter der Ebene] */
  band: { pts: [[0.55, 0.95, -0.1], [0.9, 3.5, -0.1], [0.9, 6.0, -0.1], [0.9, 7.4, -0.1]], r: 0.45 },
  vene: { pts: [[0.55, 0.95, -0.05], [0.8, -0.6, -0.05], [1.0, -2.0, -0.05], [1.05, -3.3, -0.05]], r: 0.45 }   /* Venenband: von der Pforte nach hinten */
};
var FU = null;
function furchen() {
  if (FU) return FU;
  var auf = function (q) { return [q[0], ebeneY(q[0], q[1]) + q[2], q[1]]; };
  FU = {
    pforte: kette(kurve(FURCHE.pforte.pts.map(auf), 6), FURCHE.pforte.r),
    band: kette(kurve(FURCHE.band.pts.map(auf), 6), FURCHE.band.r),
    vene: kette(kurve(FURCHE.vene.pts.map(auf), 6), FURCHE.vene.r),
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
  d = smax(d, DICKE - N.speiseroehre(x, y, z), 1.5);
  d = smax(d, DICKE - N.aorta(x, y, z), 0.5);
  d = smax(d, DICKE - wirbelsaeule(x, y, z), 0.6);
  d = smax(d, 0.15 - hohlveneRinne(x, y, z), 1.2);
  if (d > 1.5) return d;
  var F = furchen();
  d = smax(d, -F.pforte(x, y, z), 0.6);
  d = smax(d, -F.band(x, y, z), 0.5);
  d = smax(d, -F.vene(x, y, z), 0.5);
  d = smax(d, 0.15 - F.grube(x, y, z), 0.5);   /* Gallenblasengrube */
  return d;
}
var GRENZEN = [[-14.3, 101.6, -5.1], [7.5, 117.3, 6.5]];   /* Gitterbox der Leber (mit 0,3 cm Rand) */

/* ---- Lappen (fuer das Detailmodell): je ein eigenes Abstandsfeld, durch Spalte (SPALT cm) getrennt ----
   Rechter Lappen = der Rest; linker Lappen links der Ebene des Sichelbands; Quadratlappen nur an der Unterseite: zwischen Gallenblasengrube
   und Furche des runden Leberbands, vor der Leberpforte, als Schicht (QUADRAT_TIEFE) unter der Eingeweideflaeche, mindestens QUADRAT_RAND vom
   Unterrand und von der Vorderflaeche entfernt (dort laeuft keine Naht ueber die Vorderflaeche); Schwanzlappen an der Rueckseite zwischen Rinne
   der Hohlvene und Furche des Venenbands (links davon die Mulde der Speiseroehre), hinter der Leberpforte, bis Y_SCHWANZ: oberhalb der Pforte
   (ab y = 109,8 bis 112,2) reicht er um bis zu SCHWANZ_VORN nach vorn ueber die Pforte (dort liegt das Gewebe zwischen Hohlvene und Pforte, der
   Fortsatz des Schwanzlappens); die obere Grenze y = Y_SCHWANZ liegt im Gewebe und trifft die Oberflaeche nur am hinteren
   Rand der Rueckseite (keine Naht auf der Oberflaeche, kein duenner Rest ueber dem Schwanzlappen). */
var SPALT = 0.15;
var X_SICHEL = 0.9;                 /* Ebene des Sichelbands, der Furche des runden Leberbands und des Venenbands */
var X_GRUBE = -4.6;                 /* Gallenblasengrube: seitliche Grenze des Quadratlappens */
var Z_PFORTE = [0.05, 1.75];        /* hintere und vordere Kante der Leberpforte */
var X_HOHLVENE = [-1.2, -2.6];        /* rechte Grenze des Schwanzlappens [unten, oben]: hinter der Hohlvene bildet deren Rinne die Grenze; davor (zwischen Rinne und
                                          Pforte) reicht der Lappen ab y = 112,5 bis -2,6 (die Naht trifft die Rinnenwand nicht in einer spitzen Kante), weiter unten
                                          nur bis -1,2, weil das Gewebe zwischen Rinne und Pforte dort sehr duenn ist */
var Y_SCHWANZ = 115.3;
var SCHWANZ_VORN = 1.65;
var QUADRAT_TIEFE = 2.5, QUADRAT_RAND = 1.0;
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
    return Math.max(l, x - (X_SICHEL - g), X_GRUBE + g - x, Z_PFORTE[1] + g - z, -unten(x, y, z) - QUADRAT_TIEFE, QUADRAT_RAND - abstandKuppel(x, y, z));
  };
  var fSchwanz = function (l, x, y, z) {
    if (l > 0.2) return l;
    var xr = X_HOHLVENE[0] + (X_HOHLVENE[1] - X_HOHLVENE[0]) * glatt(110.5, 112.5, y);
    return Math.max(l, x - (X_SICHEL - g), xr + g - x, z - (Z_PFORTE[0] - g + SCHWANZ_VORN * glatt(109.8, 112.2, y)), y - Y_SCHWANZ);
  };
  var lap = function (id, f, gr) { return { id: id, sdf: f, grenzen: gr }; };
  LAPPEN = [
    lap('lappenR', function (x, y, z) {
      var l = leber(x, y, z);
      if (l > 0.2) return l;
      return Math.max(l, SPALT - Math.min(fLinks(l, x), fQuadrat(l, x, y, z), fSchwanz(l, x, y, z)));
    }, [[-14.3, 101.6, -5.1], [1.1, 117.3, 6.5]]),
    lap('lappenL', function (x, y, z) { return fLinks(leber(x, y, z), x); }, [[0.7, 106.9, -2.6], [7.5, 117.2, 6.2]]),
    lap('quadrat', function (x, y, z) { return fQuadrat(leber(x, y, z), x, y, z); }, [[-4.8, 104.7, 1.6], [1.1, 111.5, 6.0]]),
    lap('schwanz', function (x, y, z) { return fSchwanz(leber(x, y, z), x, y, z); }, [[-2.8, 107.7, -3.6], [1.1, 115.6, 1.9]])
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
/* Zwoelffingerdarm-Abschnitt: dieselbe Bahn wie das Rohr im Koerper (BAHN.duenndarm), die ganze C-Biegung als dichte Punktfolge (12 je Abschnitt, 49 Punkte, 13,1 cm)
   vom Pfoertner (Bulbus, Ende des Magens) ueber den oberen und den absteigenden Teil bis zum Beginn des unteren Teils; als Rohr (r 1,0) mit Endkappen
   geschlossen darstellbar. Papille am Ende des Hauptgallengangs an der medialen Wand des absteigenden Teils (p = Muendung des Gangs an der Aussenwand,
   1,1 cm von der Achse, richtung = Einheitsvektor ins Darmlumen zur Achse, r = Radius der Erhebung; die Papille sitzt innen an der Wand) */
var DUODENUM = { r: 1.0 };
function duodenumLinie() { return kurve(BAHN.duenndarm, 12).slice(0, 12 * 4 + 1); }
var PAPILLE = { p: [-5.95, 99.4, -0.8], richtung: [-0.997, 0.08, -0.03], r: 0.45 };
/* Baender: Sichelband = duenne Platte in der Ebene x = X_SICHEL auf Vorder- und Oberflaeche (Dicke 0,15, SICHELBAND_H = 0,8 cm hoch ueber der
   Oberflaeche, gemessen als Abstand zur Leberoberflaeche, 0,2 cm tief in die Leber eingelassen); oben nie ueber der Zwerchfellkuppel
   (y <= Kuppel - 0,05, nur dort, wo das Zwerchfell die Kuppel bildet, also nicht vor dem Rippenbogen); am Einschnitt des Unterrands laeuft
   sie duenn aus (Hoehe 0 an der Eingeweideflaeche + 0,5 cm, volle Hoehe 1,5 cm weiter oben), wird zwischen y = 112,3 und y = 114,3 weich auf 30 % flacher
   (unter der Kuppel ist nur Platz fuer ca. 0,2 cm) und reicht nach hinten bis z = 0,8, nahe an die
   Hohlvene; rundes Leberband = Strang (r 0,3) in der Furche an der Eingeweideflaeche und ab dem Einschnitt noch ca. 3 cm frei nach unten
   (Steuerpunkte [x, y, z], Catmull-Rom) */
var SICHELBAND_H = 0.8;
function abstandLeber(x, y, z) {   /* Abstand zur Leberoberflaeche in cm (Naeherung erster Ordnung: Wert / Steigung des Felds); innen < 0 */
  var e = 0.05, l = leber(x, y, z);
  var gx = leber(x + e, y, z) - leber(x - e, y, z), gy = leber(x, y + e, z) - leber(x, y - e, z), gz = leber(x, y, z + e) - leber(x, y, z - e);
  return l / Math.max(Math.sqrt(gx * gx + gy * gy + gz * gz) / (2 * e), 0.3);
}
function sichelband(x, y, z) {
  var k = kuppel(x, z), r = lunge().kuppelRand(x, z), ymax = k - 0.05 + 6 * (1 - glatt(-1.0, 0.4, k - r));   /* Zwerchfell nur, wo die Kuppel ueber dem Rand an der Brustwand liegt, mit weichem Uebergang */
  if (Math.abs(x - X_SICHEL) > 0.08 || y > ymax + 0.3) return 1;
  var l = abstandLeber(x, y, z), yb = ebeneY(X_SICHEL, z) + 0.5, h = SICHELBAND_H * glatt(yb, yb + 1.5, y) * (1 - 0.7 * glatt(112.3, 114.3, y));   /* oben flacher: dort liegt das Zwerchfell nur 0,5 cm ueber der Leber */
  var d = Math.max(Math.abs(x - X_SICHEL) - 0.075, l - h, -0.2 - l);
  return Math.max(d, z - 7.2, 0.8 - z, yb - y, 113.5 - 1.43 * (z - 0.8) - y, y - ymax);   /* 5. Grenze: nicht um den Rand auf die Eingeweideflaeche herum */
}
var SICHELBAND = { grenzen: [[0.6, 106.8, 0.5], [1.3, 117.7, 7.3]] };
var RUNDES_BAND = {
  pts: [[0.6, ebeneY(0.6, 1.0) - 0.1, 1.0], [0.9, ebeneY(0.9, 3.5) - 0.1, 3.5], [0.9, ebeneY(0.9, 6.0) - 0.1, 6.0], [0.95, 104.7, 6.9], [1.0, 103.8, 7.3]], r: 0.3
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

  /* 3. Leberarterie und Gallengang: glatte Parallelen zu jedem Ast der Pfortader (Radius 0,4- bzw. 0,5-mal): fester seitlicher Versatz im mitgefuehrten
     Rahmen des Asts (Paralleltransport entlang derselben Kurve, kein Verdrehen), der Versatz zeigt zunaechst nach vorn (+/- 55 Grad zur Seite).
     Am Abzweig uebernimmt der Begleiter des Kinds den Versatz und den Rahmen des Elternbegleiters und geht innerhalb von BLEND cm weich in den
     eigenen Versatz ueber; der Winkel wird vom Eltern uebernommen und nur gewechselt, wenn der Ast sonst zu nah an die Leberoberflaeche oder an
     einen anderen Ast kaeme */
  var begleiter = function (name, anteil, vorz) {
    var ZU = [], aus = [], WINKEL = [55, 85, 115, 25, 145, 175, 40, 70, 100, 130, 10, 160], FAKTOR = [1, 1.3, 1.7, 2.2], FEIN = 6, BLEND = 1.2;
    var glattS = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
    baum.pfortader.forEach(function (pa, pi) {
      var c = kurve(pa.pts, FEIN), n = c.length, rr0 = pa.r0 * anteil, rr1 = pa.r1 * anteil, i, q, k;
      /* Rahmen entlang der Kurve: Tangenten T, Laenge S, Normalen U (Paralleltransport), V = T x U */
      var T = [], S = [0], U = [], V = [];
      for (i = 0; i < n; i++) T.push(vnorm(vsub(c[Math.min(n - 1, i + 1)], c[Math.max(0, i - 1)])));
      for (i = 1; i < n; i++) S.push(S[i - 1] + vlen(vsub(c[i], c[i - 1])));
      /* Eltern: der Ast, an dessen Steuerpunkt dieser Ast beginnt; der Begleiter beginnt am entsprechenden Punkt des Elternbegleiters */
      var eltern = null, ei = 0;
      for (q = 0; q < pi && !eltern; q++) for (k = 0; k < baum.pfortader[q].pts.length && !eltern; k++) if (baum.pfortader[q].pts[k] === pa.pts[0]) { eltern = ZU[q]; ei = FEIN * k; }
      var u0 = eltern ? eltern.U[ei] : [0, 0, 1];   /* Wurzeln: Rahmen nach vorn (+z) */
      u0 = vsub(u0, [T[0][0] * vdot(u0, T[0]), T[0][1] * vdot(u0, T[0]), T[0][2] * vdot(u0, T[0])]);
      if (vlen(u0) < 0.2) u0 = vkreuz(T[0], Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
      U.push(vnorm(u0)); V.push(vkreuz(T[0], U[0]));
      for (i = 1; i < n; i++) {
        var up = U[i - 1], un = vsub(up, [T[i][0] * vdot(up, T[i]), T[i][1] * vdot(up, T[i]), T[i][2] * vdot(up, T[i])]);
        U.push(vnorm(un)); V.push(vkreuz(T[i], U[i]));
      }
      /* Versatz des Elternbegleiters am Abzweig, im Rahmen dieses Asts: Winkel und Betrag quer zum Ast, Anteil laengs (klingt ueber BLEND ab) */
      var pv = eltern ? eltern.off[ei] : null, pLaengs = null, pWinkel = 0, pBetrag = 0;
      if (pv) {
        var pl = vdot(pv, T[0]), pq = vsub(pv, [T[0][0] * pl, T[0][1] * pl, T[0][2] * pl]);
        pLaengs = [T[0][0] * pl, T[0][1] * pl, T[0][2] * pl]; pBetrag = vlen(pq);
        pWinkel = pBetrag > 1e-6 ? Math.atan2(vdot(pq, V[0]), vdot(pq, U[0])) : null;
      }
      /* Kandidaten: zuerst Winkel und Abstandsfaktor des Eltern, danach die Liste */
      var kand = [];
      if (eltern) kand.push([eltern.wi, eltern.fi]);
      for (var wi = 0; wi < WINKEL.length * 2; wi++) for (var fi = 0; fi < FAKTOR.length; fi++) if (!eltern || wi !== eltern.wi || fi !== eltern.fi) kand.push([wi, fi]);
      var beste = null, bm = -1e9, bi;
      for (bi = 0; bi < kand.length && !(beste && bm >= 0); bi++) {
        var wi2 = kand[bi][0], fi2 = kand[bi][1], wk = vorz * WINKEL[wi2 % WINKEL.length] * Math.PI / 180 * (wi2 >= WINKEL.length ? -1 : 1), off = [], pts = [], m = 1e9;
        var w0 = pWinkel === null ? wk : pWinkel, dw = wk - w0;
        dw -= 2 * Math.PI * Math.round(dw / (2 * Math.PI));   /* kuerzester Drehsinn: der Begleiter wickelt sich um den Ast, statt durch ihn zu laufen */
        for (i = 0; i < n; i++) {
          var f = i / (n - 1), rp = radiusBei(pa, f), rb = rr0 + (rr1 - rr0) * f, o = Math.max(0.35, rp + rb + 0.08) * FAKTOR[fi2], ang = wk, ov;
          if (pv) {   /* am Abzweig weich vom Versatz des Elternbegleiters in den eigenen uebergehen (Winkel und Betrag), Mindestabstand zur Pfortader wahren */
            var w = glattS(S[i] / BLEND);
            ang = w0 + dw * w; o = Math.max(rp + rb + 0.05, pBetrag * (1 - w) + o * w);
          }
          ov = vadd([U[i][0] * Math.cos(ang) * o, U[i][1] * Math.cos(ang) * o, U[i][2] * Math.cos(ang) * o], V[i], Math.sin(ang) * o);
          if (pv) ov = vadd(ov, pLaengs, 1 - glattS(S[i] / BLEND));
          off.push(ov); pts.push(vadd(c[i], ov));
        }
        /* Pruefung: Tiefe im Gewebe (ausser nahe der Pforte bei Generation 1) und Abstand zu anderen Aesten (Anfang ausgenommen) */
        for (i = 1; i < n; i++) {
          var rf = rr0 + (rr1 - rr0) * i / (n - 1);
          if (pa.gen === 1 && vlen(vsub(pts[i], P0)) < 3.5) continue;
          var mm = Math.min(tiefe(pts[i]) - BAUM_RAND - rf, S[i] < 0.6 ? 1 : frei(pts[i], rf, ANF_BEGL, null));
          if (mm < m) m = mm;
        }
        if (m > bm) { bm = m; beste = { wi: wi2, fi: fi2, off: off, pts: pts }; }
      }
      beste.U = U;
      ZU[pi] = beste;
      /* Ausgabe: jeder zweite Stuetzpunkt (3 je Abschnitt wie die Pfortaderkurve in eintragen) */
      var ast = { pts: beste.pts.filter(function (p, j) { return j % 2 === 0; }), r0: rr0, r1: rr1, gen: pa.gen, lappen: pa.lappen };
      aus.push(ast); eintragen(name, ast);
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
