/* ==========================================================================
   Verdauung - Form: Speiseroehre, Magen, Duenndarm (mit Zwoelffingerdarm) und
   Dickdarm als Baustein fuer den Koerper und die Detailmodelle von Magen und
   Darm. Signed-Distance-Feld, Einheit cm, Innen < 0, aus den
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
     BAHN                   Bahnen der Rohre im Koerper (Steuerpunkte pts, Radius r, Segmentzahl seg): speiseroehre, zwoelffingerdarm, duodenum (Zwoelffingerdarm bis zur Flexur),
                            duenndarm (pts ist eine Funktion: die Tabelle DUENN_TAB, r 0,9), dickdarm (der alte Rahmen, nur noch Hindernis fuer die Magengefaesse; der Darm im
                            Koerper kommt aus dickdarm())
     magen(f)               Abstandsfeld der Aussenflaeche des Magens bei Fuellung f (0 = nuechtern, 1 = nach dem Essen), magenGrenzen(f) = Gitterbox;
                            J-foermiger Schlauch um eine Mittellinie (Magengrund, Magenkoerper, Magenvorhof, Pfoertner), der Pfoertner endet
                            bei PFOERTNER.p mit dem Radius 1,0 des Zwoelffingerdarms; die Speiseroehre ist am Mageneingang weich angeschlossen
                            (His-Winkel); oben haelt der Magen 0,35 cm Abstand zur Zwerchfellkuppel
     schichten(f)           Wandschichten fuer das Detailmodell: Liste { id, sdf, grenzen } mit schleimhaut, schraeg, ring, laengs,
                            pfoertnerRing, eingangRing (Wand fuer die Darstellung etwa 0,8 cm dick, Tiefe von aussen: Laengsmuskel 0-0,2, Ringmuskel
                            0,2-0,4..0,55, schraege Schicht 0,4-0,55 (nur Fundus und Korpus), Schleimhaut 0,55-0,8 cm, dazu die Wuelste von Pfoertner
                            und Mageneingang; im Zwoelffingerdarm duenner); die Schleimhaut traegt die Falten (Rugae); lumen(f) = Innenraum (mit dem
                            Kanal zur Speiseroehre; im Pfoertnerkanal mindestens PYL_KANAL = 0,3 cm weit, damit das Netz geschlossen bleibt und die Muskelwellen den Pfoertner oeffnen und schliessen koennen); aussen(f) = Aussenflaeche samt Verlaengerung ins Duodenum und Stumpf der Speiseroehre (Gitterbox
                            in .grenzen); schichtFeld(f) = Funktion (x, y, z) -> Werte aller sechs Schichten (in der Reihenfolge von schichten) und der Randflaechen mit
                            nur einer Auswertung; schnittZ(f) = Hoehe z der Schnittflaeche (z = zs(x, y)); abbilden(p, f) = Punkt p der Form bei f = 0
                            auf den entsprechenden Punkt bei f (Parameter der Mittellinie, Querschnitt, Falten geglaettet, Speiseroehre bleibt; optional
                            abbilden(p, f, true): zusaetzlich nachgezogen an die Aussenflaeche)
     mittellinie(f), kurvaturen(f, ab, dz), kennpunkte(f), EINGANG, PFOERTNER, FUNDUS, ANGULUS (je { p }), schnitt(f)
     gefaesse(f)            { magenarterien, magenvenen, pfortader, vagus }: je Liste von { id, pts, r0, r1 } (Venen und Pfortader
                            in Fliessrichtung, Arterien und Nerven vom Ursprung weg)
     speiseroehreAnzeige()  Teil der Speiseroehre von 2,5 cm ueber dem Hiatus bis zum Mageneingang (Punkte von oben nach unten)
     zwerchfell()           { sdf, grenzen, hiatus, loch, rand }: Ausschnitt der Zwerchfellkuppel ueber dem linken Oberbauch mit dem Hiatus (Mitte, Abstandsfeld loch der Luecke, rand = x0, x1, z0, z1)
     Darm (ab PR B): Zwoelffingerdarm, Duenndarm, Dickdarm mit Blinddarm, Wurmfortsatz, Sigma, Mastdarm und Analkanal, Gekroese, Gefaesse
     zwoelffingerdarm()     { pts, r, flexur }: Mittellinie des Zwoelffingerdarms (r 1,0) von BAHN.zwoelffingerdarm bis zur Flexura duodenojejunalis (FLEXUR)
     duenndarm()            { pts (Steuerpunkte), r (0,9), laenge, leerEnde (Bogenlaenge, ab hier Krummdarm), achse, punkt(s), richtung(s), schnitt { s0, s1, p }, grenzen(),
                            sdf({ ohne: [s0, s1] }) }: ein durchgehender glatter Schlauch von der Flexur bis zur Bauhin-Klappe (BAUHIN), ca. 270 cm in dicht gepackten Schlingen;
                            die ersten 40 % der Laenge sind Leerdarm (links oben), der Rest Krummdarm (rechts unten); Mittellinie aus der Tabelle DUENN_TAB (einmal berechnet,
                            ohne Zufall; Mindestabstand 0,1 cm zwischen den Schlingen und zu allen Nachbarn im Koerper)
     dickdarm(opt)          { sdf, grenzen, achse, laenge, R(s, phi), R0(s), abschnitte }: Abstandsfeld des Dickdarms vom blinden Ende des Blinddarms bis zum After (Haustren und drei
                            Taenien bis zum Sigma, Mastdarm und Analkanal glatt); abschnitte = Bogenlaenge der Grenzen (blinddarm, aufsteigend, quer, absteigend, sigma, mastdarm,
                            analkanal); opt: ohneAppendix, glatt, von/bis (Bereich der Mittellinie); wurmfortsatz() { pts, r }
     duennSchichten(s0, s1, opt), blinddarmSchichten(), mastdarmSchichten(opt: von = Anfang des Bereichs), zwoelffingerdarmSchichten()   Wandschichten nur fuer die aufgeschnittenen Abschnitte (Laengsmuskel, Ringmuskel, Schleimhaut
                            mit Ringfalten bzw. Analsaeulen, bauhin, wurmfortsatz, sphinkterInnen, sphinkterAussen): { schichten: [{ id, sdf, grenzen }], grenzen, mitte, schnitt }
     gekroese()             { pts, tris, nu, nv, wurzel, rand, richtung, laenge }: halbdurchsichtige Platte von der Wurzel (ca. 14 cm) zu den Schlingen (Netz-Daten)
     darmGefaesse()         { darmarterien, darmvenen, pfortader }: je Liste von { id, pts, r0, r1 }; darmKennpunkte() { PAPILLE, FLEXUR, BAUHIN, AFTER, DUENN_SCHNITT, ... }
     Achse(pts, opt)        dichte Mittellinie mit Bogenlaenge, Begleitdreibein und Gitter (a.q(x, y, z) = Abstand zur Mittellinie, a.s, a.phi() ...)
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
function kette(poly, r, weit) {   /* weit: ab diesem Abstand von der Gitterbox wird nur noch der Abstand zur Box geliefert (Standard 4) */
  var n = poly.length - 1, seg = [], bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9], i, c;
  for (i = 0; i <= n; i++) for (c = 0; c < 3; c++) { if (poly[i][c] < bb[c]) bb[c] = poly[i][c]; if (poly[i][c] > bb[c + 3]) bb[c + 3] = poly[i][c]; }
  for (i = 0; i < n; i++) {
    var a = poly[i], b = poly[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], l2 = vx * vx + vy * vy + vz * vz;
    seg.push(a[0], a[1], a[2], vx, vy, vz, l2 > 0 ? 1 / l2 : 0);
  }
  return function (x, y, z) {
    var ex = Math.max(bb[0] - x, 0, x - bb[3]), ey = Math.max(bb[1] - y, 0, y - bb[4]), ez = Math.max(bb[2] - z, 0, z - bb[5]);
    var lb = Math.sqrt(ex * ex + ey * ey + ez * ez) - r;
    if (lb > (weit || 4)) return lb;
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
var BAHN = {
  speiseroehre: { pts: [[0, 148, -3.0], [0, 140, -3.6], [0.3, 130, -3.6], [0.9, 122, -3.4], [1.6, 115, -2.8], [2.4, 110.5, -1.5], [3.8, 107.6, 1.0]], r: 0.8, seg: 40 },
  zwoelffingerdarm: { pts: [[-2.0, 104.0, 3.2], [-3.4, 105, 1.6], [-5.8, 103.6, -0.2], [-7.0, 100, -0.8], [-6.6, 96.6, -0.8], [-3.6, 94.8, -0.6], [0, 95.6, -0.5]], r: 1.0, seg: 50 },
  duenndarm: { pts: duennPts, r: 0.9, seg: 2200 },   /* Tabelle DUENN_TAB (Abschnitt Darm), r = DUENN_R */
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
var PRO = 9;          /* Abtastpunkte je Abschnitt der Mittellinie (Koerper: magen(f)) */
var PRO_D = 5;        /* ... fuer das Detailmodell (Schichten, Lumen, Aussenflaeche mit Verlaengerung): gleiche Kurve, groeberer Linienzug (Abweichung unter 0,05 cm), schnellere Auswertung */
var DUO_EXT = [0.8, 1.6];   /* Verlaengerung ins Duodenum (nur fuer Schichten und Innenraum): Abstaende (cm) vom Pfoertner auf der Bahn des Zwoelffingerdarms */
var ESO_STUMPF = 1.8;       /* Laenge (cm) der Speiseroehre, die im Feld des Magens mitgefuehrt wird (weicher Anschluss) */
var ESO_R_AUSSEN = 0.7;     /* Radius des Speiseroehren-Stumpfs im Feld der Aussenflaeche (Rohr im Koerper: 0,8) */
var ESO_TIEF = 1.5;         /* der Kanal der Speiseroehre laeuft so weit (cm) ueber den Mageneingang hinaus in den Magen */
var PYL_KANAL = 0.3;        /* Mindestradius (cm) des Innenraums im Pfoertnerkanal (nur Detailmodell: lumen, schichten) */
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
function aortaFeld() { return AORTA_F || (AORTA_F = kette(kurve(AORTA.pts, 8), AORTA.r, 2.5)); }   /* nur als Hindernis: weiter als 2,5 cm entfernt ohne Wirkung (GAP + 2 < 2,5) */
/* Noetiger Abstand: c = max ueber die Nachbarn von (GAP - Abstand); die Flaeche des Magens muss mindestens so weit nach innen (c > 0 = Eingriff) */
function ausweichen(x, y, z) {
  var c = -1e9, d;
  if (x < 9 && y > 101 && z > -7) {
    var LE = Kern.Formen && Kern.Formen.leber, gb = LE && LE.grenzen;
    /* nur in der Naehe der Leber (Gitterbox + 3 cm) wird ihr Feld ausgewertet: weiter weg ist GAP - d kleiner als -2 und ohne Wirkung */
    if (LE && !(x < gb[0][0] - 3 || x > gb[1][0] + 3 || y < gb[0][1] - 3 || y > gb[1][1] + 3 || z < gb[0][2] - 3 || z > gb[1][2] + 3)) { d = LE.leber(x, y, z); if (GAP - d > c) c = GAP - d; }
  }
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
  var pts = steuer.map(function (s) { return s.c; }), pro = ext ? PRO_D : PRO, cu = kurve(pts, pro), n = cu.length, st = { f: f, ext: !!ext };
  var X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n), R = new Float64Array(n), RZ = new Float64Array(n);
  var GX = new Float64Array(n), GY = new Float64Array(n), SC = new Float64Array(n), W = new Float64Array(n), LP = new Float64Array(n);
  var iEnde = nSt * pro;
  /* Radien und Richtung zur grossen Kurvatur laufen als Catmull-Rom-Kurve mit (glatt, ohne Absaetze an den Steuerpunkten) */
  var ar = kurve(steuer.map(function (s) { return [s.r, s.rz, s.g[0]]; }), pro), ag = kurve(steuer.map(function (s) { return [s.g[1], 0, 0]; }), pro);
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
  st.PM = new Float64Array(m * 5); st.AMAX = 1;   /* je Abschnitt: Mitte, halbe Laenge, groesster Radius (fuer das Ueberspringen in werte); AMAX: groesstes Verhaeltnis Radius / Tiefenradius */
  for (j = 0; j < m; j++) {
    st.PM[j * 5] = (X[j] + X[j + 1]) / 2; st.PM[j * 5 + 1] = (Y[j] + Y[j + 1]) / 2; st.PM[j * 5 + 2] = (Z[j] + Z[j + 1]) / 2;
    st.PM[j * 5 + 3] = Math.sqrt(Math.pow(X[j + 1] - X[j], 2) + Math.pow(Y[j + 1] - Y[j], 2) + Math.pow(Z[j + 1] - Z[j], 2)) / 2;
    st.PM[j * 5 + 4] = Math.max(R[j], R[j + 1]);
  }
  for (j = 0; j < n; j++) st.AMAX = Math.max(st.AMAX, R[j] / RZ[j]);
  st.n = n; st.m = m; st.mSt = iEnde;   /* mSt: Zahl der Abschnitte bis zum Pfoertner */
  st.X = X; st.Y = Y; st.Z = Z; st.R = R; st.RZ = RZ; st.GX = GX; st.GY = GY; st.SC = SC; st.W = W; st.LP = LP; st.SG = SG; st.TX = TX; st.L = L;
  /* Speiseroehre: Stumpf vor dem Mageneingang, dazu der Kanal ein Stueck in den Magen hinein */
  var eso = kurve(BAHN.speiseroehre.pts, 12), le = laenge(eso), ende = eso[eso.length - 1], vor = eso[eso.length - 3];
  var richt = [ende[0] - vor[0], ende[1] - vor[1], ende[2] - vor[2]], rl = Math.sqrt(richt[0] * richt[0] + richt[1] * richt[1] + richt[2] * richt[2]);
  /* Ende des Kanals im Magen: die Speiseroehre zieht schraeg an der Wand entlang, ein Kanal in ihrer Richtung wuerde vorn aus der Wand treten; er biegt zur Mitte des Magenkoerpers ab */
  var c1 = steuer[1].c, u = [c1[0] - ende[0], c1[1] - ende[1], c1[2] - ende[2]], ul = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]) || 1;
  var dv = [0.3 * richt[0] / rl + u[0] / ul, 0.3 * richt[1] / rl + u[1] / ul, 0.3 * richt[2] / rl + u[2] / ul], dl = Math.sqrt(dv[0] * dv[0] + dv[1] * dv[1] + dv[2] * dv[2]) || 1;
  var innen = [ende[0] + dv[0] / dl * ESO_TIEF, ende[1] + dv[1] / dl * ESO_TIEF, ende[2] + dv[2] / dl * ESO_TIEF];
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
var NF = 10;       /* Zahl der Falten um den Umfang (wenige, breite Laengsfalten: feinere waeren vom Gitter der Netze nicht aufzuloesen) */
var FALTE = 0.3;   /* Hoehe der Falten (cm) im nuechternen Magen (die Wand ist fuer die Darstellung dick, der leere Magen flach: hoehere Falten stiessen in der Mitte zusammen) */
function faltenHoehe(f) { return FALTE * (1 - f) * (1 - f) * (1 - 0.5 * f) + 0.01 * f; }

/* Randtiefen (cm von aussen) der Schichten am Punkt: in OFF. Die Wand ist fuer die Darstellung etwa 0,8 cm dick (wd = 1), im Duodenum duenner (wd 0,38). */
function offsets(st, jb, j1, tb, x, y, z) {
  var lp = st.LP[jb] + (st.LP[j1] - st.LP[jb]) * tb, w = st.W[jb] + (st.W[j1] - st.W[jb]) * tb;
  var Ep = 0.42 * glatt(2.6, 1.3, lp) * glatt(0.1, 0.9, lp);
  var de = Math.sqrt((x - EINGANG.p[0]) * (x - EINGANG.p[0]) + (y - EINGANG.p[1]) * (y - EINGANG.p[1]) + (z - EINGANG.p[2]) * (z - EINGANG.p[2]));
  var Ee = 0.26 * glatt(2.2, 1.0, de), wd = 0.38 + 0.62 * glatt(-1.0, 0.2, lp), off = OFF;
  off[0] = 0; off[1] = 0.2 * wd; off[2] = (0.40 + 0.15 * (1 - w)) * wd; off[3] = 0.55 * wd; off[4] = off[3] + Ep; off[5] = off[4] + Ee; off[6] = off[5] + 0.25 * wd;
}

/* je Abschnitt der Mittellinie fuer den aktuellen Punkt: Wert der Aussenflaeche (KZ), Versatz zur Mittellinie (DX, DY, DZ), Radien (RTA, RZA), Lage u im Abschnitt */
var LETZTER = 0;   /* Abschnitt mit dem kleinsten Wert bei der letzten Auswertung */
var KZ = new Float64Array(512), DXA = new Float64Array(512), DYA = new Float64Array(512), DZA = new Float64Array(512), RTA = new Float64Array(512), RZA = new Float64Array(512), UA = new Float64Array(512);
function werte(st, x, y, z, voll) {
  var nseg = voll ? st.m : st.mSt, SG = st.SG, j, jb = 0, db = 1e30, PM = st.PM, AM = st.AMAX, i, j0 = LETZTER < nseg ? LETZTER : 0;   /* db: kleinster Wert der Aussenflaeche ueber alle Abschnitte */
  /* Reihenfolge: zuerst der Abschnitt der letzten Auswertung (Nachbarpunkte im Gitter), dann die uebrigen; Abschnitte, die sicher mehr als 2 cm hinter dem
     bisher besten liegen (Kugel um die Mitte des Abschnitts), werden uebersprungen (KZ = 1e9, wie sonst durch KZ[c] > db + 2 ausgeschlossen) */
  for (i = 0; i < nseg; i++) {
    j = i === 0 ? j0 : i <= j0 ? i - 1 : i;
    var o = j * 7;
    if (i) {
      var mdx = x - PM[j * 5], mdy = y - PM[j * 5 + 1], mdz = z - PM[j * 5 + 2], T = PM[j * 5 + 3] + PM[j * 5 + 4] + ((db > 0 ? db : 0) + 2) * AM;
      if (mdx * mdx + mdy * mdy + mdz * mdz > T * T) { KZ[j] = 1e9; continue; }
    }
    var px = x - SG[o], py = y - SG[o + 1], pz = z - SG[o + 2];
    var t = (px * SG[o + 3] + py * SG[o + 4] + pz * SG[o + 5]) * SG[o + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
    var dx = px - SG[o + 3] * t, dy = py - SG[o + 4] * t, dz = pz - SG[o + 5] * t;
    var rt = st.R[j] + (st.R[j + 1] - st.R[j]) * t, rzt = st.RZ[j] + (st.RZ[j + 1] - st.RZ[j]) * t, at = rt / rzt, zt = dz * at;
    var kz = (Math.sqrt(dx * dx + dy * dy + zt * zt) - rt) / (at > 1 ? at : 1);
    KZ[j] = kz; DXA[j] = dx; DYA[j] = dy; DZA[j] = dz; RTA[j] = rt; RZA[j] = rzt; UA[j] = t;
    if (kz < db) { db = kz; jb = j; }
  }
  LETZTER = jb;
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
  var kmax = voll === 2 ? 1 : 7, kmin = voll === 3 ? 5 : 0;   /* voll === 2: nur die Aussenflaeche B[0] (mit Verlaengerung ins Duodenum), voll === 3: nur B[5] und B[6] (Lumen) */
  if (kmax > 1) offsets(st, jb, j1, tb, x, y, z); else OFF[0] = 0;
  var off = OFF;
  var pylK = kmax > 6 || voll === 3 ? glatt(2.6, 1.4, st.LP[jb] + (st.LP[j1] - st.LP[jb]) * tb) : 0;   /* Gewicht des Pfoertnerkanals (Abstand zum Pfoertner unter 2,6 cm) */
  /* Randflaeche k = Vereinigung aller Abschnitte, die in Frage kommen (Wert der Aussenflaeche hoechstens 2 cm ueber dem kleinsten): stetig auch an der Innenseite der Biegung */
  for (k = kmin; k < kmax; k++) {
    o0 = off[k]; q = 1e9;
    for (c = 0; c < nseg; c++) {
      if (KZ[c] > db + 2) continue;
      rr = RTA[c] - o0; rrz = RZA[c] - o0; if (rr < 0.02) rr = 0.02; if (rrz < 0.02) rrz = 0.02;
      if (k === 6 && pylK > 0) {   /* Kanal des Pfoertners: der Innenraum bleibt hier mindestens PYL_KANAL weit offen (sonst waere er zu eng fuer das Netz und die Wellen koennten ihn nicht oeffnen), die Schleimhaut darunter bleibt duenn */
        var fl = PYL_KANAL * pylK, m5 = RTA[c] - off[5] - 0.03;
        if (fl > m5) fl = m5 > 0.02 ? m5 : 0.02;
        if (rr < fl) rr = fl; if (rrz < fl) rrz = fl;
      }
      a = rr / rrz; if (a > 4) a = 4; zz = DZA[c] * a; qc = (Math.sqrt(DXA[c] * DXA[c] + DYA[c] * DYA[c] + zz * zz) - rr) / (a > 1 ? a : 1);   /* durch a geteilt: der Abstand wird nicht ueberschaetzt */
      if (qc < q) q = qc;
    }
    if (nah) q = smin(q, dSt - Math.max(0.77 - o0, 0.02), 0.9);
    if (kup < 1e8) q = smax(q, 0.5 * (y - (kup - o0)), 1.2);
    if (cN > -2) q = smax(q, cN + o0, WEICH);
    B[k] = k >= 4 ? q / 1.5 : q;   /* Wuelste: die Dicke aendert sich mit dem Ort, durch 1,5 geteilt */
  }
  if (kmax === 1) return 0;
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
    var ph = NF * th + gross * 0.25 * Math.sin(0.5 * sCm);   /* Laengsfalten, an der grossen Kurvatur sanft gewellt */
    var u = 0.5 + 0.5 * Math.cos(ph), prof = u * u * (3 - 2 * u);
    var wth = 0.35 + 0.65 * glatt(-0.4, 0.9, ct - 0.8 * sn), amp = (1 - glatt(0.45, 0.8, sf)) * glatt(0, 0.06, sf);
    var rho = Math.sqrt(pa * pa + pb * pb) + 0.4, amW = H * amp * wth;
    /* Falten: die Innenflaeche rueckt um die Faltenhoehe nach innen; die Verschiebung klingt tiefer im Innenraum als die Faltenhoehe ab (im fast leeren Magen liegen
       gegenueberliegende Seiten der Wand nah beieinander, in der Mitte waere die Phase der Falten sonst zufaellig); das Feld ueberschaetzt den Abstand an steilen Flanken. */
    B[6] = B[6] + amW * prof * glatt(0.3, -0.3, B[5]) * (1 - glatt(amW + 0.05, amW + 0.5, -B[6])) * glatt(0.2, 0.9, rho - 0.4);   /* auf der Achse ist der Winkel der Falten nicht definiert: dort keine */
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
  return { sdf: function (x, y, z) { werte(st, x, y, z, 3); return Math.min(B[6], QCH); }, grenzen: gitterbox(st, true) };
}

/* Aussenflaeche samt Verlaengerung ins Duodenum und Stumpf der Speiseroehre (Feld der Schichten, nur B[0]; Gitterbox grenzen(f)) */
function aussen(f) {
  var st = zustand(f || 0, true);
  return { sdf: function (x, y, z) { werte(st, x, y, z, 2); return B[0]; }, grenzen: gitterbox(st, true) };
}
/* Werte aller sechs Schichten (Reihenfolge wie in schichten) und der Randflaechen mit einer Auswertung: Funktion (x, y, z) -> gemeinsames Feld out
   (out[0..5] Schichten, out[6] Lumen, out[7] Aussenflaeche, out[8..14] die Randflaechen B[0..6] (Tiefe von aussen, < 0 = tiefer als die Flaeche), out[15] Abstand
   zum Kanal der Speiseroehre (< 0 im Kanal, auf 5 begrenzt)); wird bei jedem Aufruf ueberschrieben */
function schichtFeld(f) {
  var st = zustand(f || 0, true), out = new Float64Array(16), k;
  return function (x, y, z) {
    werte(st, x, y, z, true);
    var q = -QCH;
    out[0] = Math.max(Math.max(B[5], -B[6]), q); out[1] = Math.max(Math.max(B[2], -B[3]), q); out[2] = Math.max(Math.max(B[1], -B[2]), q);
    out[3] = Math.max(Math.max(B[0], -B[1]), q); out[4] = Math.max(Math.max(B[3], -B[4]), q); out[5] = Math.max(Math.max(B[4], -B[5]), q);
    out[6] = Math.min(B[6], QCH); out[7] = B[0];
    for (k = 0; k < 7; k++) out[8 + k] = B[k];
    out[15] = QCH > 5 ? 5 : QCH;
    return out;
  };
}
/* Hoehe z der Schnittflaeche an der Stelle (x, y): schnitt(f) ist (z - zs(x, y)) / 2,5 */
function schnittZ(f) {
  var s = schnitt(f || 0);
  return function (x, y) { return -2.5 * s(x, y, 0); };
}

/* Punkt der Form bei f = 0 auf den entsprechenden Punkt bei f abbilden (Fuellung, ohne neu zu vernetzen): der Punkt behaelt seinen Platz im
   Abschnitt der Mittellinie (Parameter), im Querschnitt (Tiefe unter der Aussenflaeche und Richtung) bleibt die Wanddicke erhalten, Falten (Tiefen jenseits der
   Schleimhautbasis) werden um faltenHoehe(f) / faltenHoehe(0) gestaucht; nahe am Stumpf der Speiseroehre bleibt der Punkt stehen */
function abbilden(p, f, nachziehen) {
  f = f || 0;
  if (!f) return p.slice();
  var s0 = zustand(0, true), s1 = zustand(f, true), x = p[0], y = p[1], z = p[2], SG = s0.SG, j, db = 1e30;
  var kzs = [], dxs = [], dys = [], dzs = [], ts = [];
  for (j = 0; j < s0.m; j++) {
    var o = j * 7, px = x - SG[o], py = y - SG[o + 1], pz = z - SG[o + 2];
    var t = (px * SG[o + 3] + py * SG[o + 4] + pz * SG[o + 5]) * SG[o + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
    var dx = px - SG[o + 3] * t, dy = py - SG[o + 4] * t, dz = pz - SG[o + 5] * t;
    var rt = s0.R[j] + (s0.R[j + 1] - s0.R[j]) * t, rzt = s0.RZ[j] + (s0.RZ[j + 1] - s0.RZ[j]) * t, at = rt / rzt, zt = dz * at;
    var kz = (Math.sqrt(dx * dx + dy * dy + zt * zt) - rt) / (at > 1 ? at : 1);
    kzs.push(kz); dxs.push(dx); dys.push(dy); dzs.push(dz); ts.push(t);
    if (kz < db) db = kz;
  }
  /* Abbildung je Abschnitt der Mittellinie, die fast so nah sind wie der naechste (weiches Minimum wie bei den Falten): ohne die Mischung springt die Abbildung an den Knicken des Linienzugs */
  var sx = 0, sy = 0, sz = 0, sw = 0;
  for (j = 0; j < s0.m; j++) {
    var kk = kzs[j] - db;
    if (kk > 0.8) continue;
    var w = Math.exp(-kk * 8), j1 = j + 1, t2 = ts[j], o2 = j * 7;
    var cx0 = SG[o2] + SG[o2 + 3] * t2, cy0 = SG[o2 + 1] + SG[o2 + 4] * t2, cz0 = SG[o2 + 2] + SG[o2 + 5] * t2;
    var dx2 = dxs[j], dy2 = dys[j], dz2 = dzs[j];
    var R0 = s0.R[j] + (s0.R[j1] - s0.R[j]) * t2, RZ0 = s0.RZ[j] + (s0.RZ[j1] - s0.RZ[j]) * t2;
    var R1 = s1.R[j] + (s1.R[j1] - s1.R[j]) * t2, RZ1 = s1.RZ[j] + (s1.RZ[j1] - s1.RZ[j]) * t2;
    var a0 = R0 / RZ0, a1 = R1 / RZ1;
    var cx1 = s1.X[j] + (s1.X[j1] - s1.X[j]) * t2, cy1 = s1.Y[j] + (s1.Y[j1] - s1.Y[j]) * t2, cz1 = s1.Z[j] + (s1.Z[j1] - s1.Z[j]) * t2;
    var ez = dz2 * a0, rho = Math.sqrt(dx2 * dx2 + dy2 * dy2 + ez * ez), tiefe = R0 - rho;
    offsets(s0, j, j1, t2, x, y, z); var base0 = OFF[6];
    offsets(s1, j, j1, t2, x, y, z); var base1 = OFF[6];
    var tiefe1 = tiefe;
    if (tiefe > base0) tiefe1 = base1 + (tiefe - base0) * faltenHoehe(f) / faltenHoehe(0);
    var rho1 = Math.max(R1 - tiefe1, 0), q = rho > 1e-6 ? rho1 / rho : 0;
    sx += w * (cx1 + dx2 * q); sy += w * (cy1 + dy2 * q); sz += w * (cz1 + ez * q / a1); sw += w;
  }
  var nx = sx / sw, ny = sy / sw, nz = sz / sw;
  var dSt = stumpfAbstand(s0, x, y, z, s0.esEnde), we = glatt(0.9, 2.4, dSt);   /* 1: weit weg vom Stumpf, 0: am Stumpf */
  var q0 = [x + (nx - x) * we, y + (ny - y) * we, z + (nz - z) * we];
  /* Nachziehen (nur mit nachziehen = true): bei Fuellung geben Zwerchfell, Milz, Niere und Leber nach (die Aussenflaeche weicht ab); ein Schritt des Newton-Verfahrens
     auf dem Feld der Aussenflaeche haelt die Tiefe unter der Aussenflaeche (Wanddicke) auch dort, macht aber Zacken am Stumpf der Speiseroehre: Standard aus */
  var m0 = magen(0), m1 = magen(f), a = m0(x, y, z);
  if (nachziehen === true && a < 2 && a > -8) {
    var e = 0.1, g0 = m1(q0[0], q0[1], q0[2]), gx = (m1(q0[0] + e, q0[1], q0[2]) - g0) / e, gy = (m1(q0[0], q0[1] + e, q0[2]) - g0) / e, gz = (m1(q0[0], q0[1], q0[2] + e) - g0) / e;
    var gg = gx * gx + gy * gy + gz * gz, d = Math.max(-1.5, Math.min(1.5, g0 - a));
    if (gg > 1e-6) { q0[0] -= d * gx / gg; q0[1] -= d * gy / gg; q0[2] -= d * gz / gg; }
  }
  return q0;
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
/* Linie auf der Aussenflaeche parallel zur kleinen Kurvatur, um den Winkel psi (rad) aus der Ebene des Schlauchs nach vorn (psi > 0) oder hinten (psi < 0) gedreht:
   vom Mageneingang zum Pfoertner, im Abstand ab ausserhalb der Flaeche, Punkte alle 0,5 cm (fuer Aeste des Vagus, die auf der Vorder- und Hinterwand laufen) */
function kleineKurvatur(f, ab, psi) {
  f = f || 0;
  var st = zustand(f, false), feld = magen(f), kl = [], j, j0 = 0, cs = Math.cos(psi), sn = Math.sin(psi);
  while (j0 < st.mSt && st.Y[j0] > EINGANG.p[1]) j0++;
  for (j = j0; j <= st.mSt; j++) {
    var p = randpunkt(feld, [st.X[j], st.Y[j], st.Z[j]], [-st.GX[j] * cs, -st.GY[j] * cs, sn], ab);
    if (p) kl.push(p);
  }
  return neuAbtasten(glaetten(neuAbtasten(glaetten(kl, 3), 0.5), 6), 0.5);
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

/* Teil der Speiseroehre fuer die Detailmodelle: von 2,5 cm ueber der Luecke im Zwerchfell (Hiatus, wo der Weg die Kuppel durchstoesst) bis zum Mageneingang (Punkte von oben nach unten) */
function speiseroehreAnzeige() {
  var eso = kurve(BAHN.speiseroehre.pts, 12), i, j = 0;
  for (i = 1; i < eso.length; i++) {
    if (eso[i - 1][1] - kuppel(eso[i - 1][0], eso[i - 1][2]) >= 0 && eso[i][1] - kuppel(eso[i][0], eso[i][2]) < 0) {
      var acc = 0; j = i;
      while (j > 0 && acc < 2.5) { acc += laenge([eso[j], eso[j - 1]]); j--; }
      break;
    }
  }
  return eso.slice(j);
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
  var kA = kurvaturen(f, 0.25, 0.3), kV = kurvaturen(f, 0.3, -0.3), kN = { klein: kleineKurvatur(f, 0.14, 0.75) }, kM = { klein: kleineKurvatur(f, 0.14, -0.75) }, kH = kurvaturen(f, 0.25, -1.2);
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
    { id: 'gastrica-sinistra', pts: strecke(von(klV, 0, iv).concat([[2.9, 104.5, 1.6], [1.7, 104.7, 0.4], [0.4, 104.6, -0.4], stamm.slice()]), 0.25, oM, 0, 1), r0: 0.22, r1: 0.28 },   /* vom Mageneingang an der kleinen Kurvatur entlang zur Pfortader */
    { id: 'gastrica-dextra', pts: strecke(von(klV, iv, klV.length - 1).concat([[-1.1, 105.5, 2.4], [-1.2, 105.0, 0.8], stamm.slice()]), 0.22, oM2, 0, 1), r0: 0.2, r1: 0.25 },
    { id: 'gastroomentalis-sinistra', pts: strecke(von(grV, gmV, naechster(grV, pH)).concat([pH, hilus, [5.4, 104.6, -3.0], milzM]), 0.26, [feld, kolon, milz], 0, 1), r0: 0.24, r1: 0.3 },
    { id: 'gastroomentalis-dextra', pts: strecke(von(grV, gmV, grV.length - 1).concat([[-0.2, 98.8, 1.6], mesM]), 0.26, oM2, 0, 1), r0: 0.24, r1: 0.3 }
  ];
  /* Pfortader: Stamm ab Zusammenfluss, dazu die Stuempfe von Milz- und Mesenterialvene wie im Lebermodell */
  var pf = GE.pfortader.map(function (g) {
    return { id: g.id, pts: g.id === 'pfortaderStamm' ? g.pts : LE.stumpf(g.pts, LE.STUMPF), r0: g.r0, r1: g.r1 };
  });
  /* Vagus: vorderer und hinterer Strang auf der Speiseroehre (ab 2,5 cm ueber dem Hiatus), dann Aeste an der kleinen Kurvatur bis zum Antrum */
  var ec = neuAbtasten(speiseroehreAnzeige(), 0.8);
  function strang(vz, kl) {
    var pts = ec.map(function (p, i) {
      var q = ec[Math.min(i + 1, ec.length - 1)], o = ec[Math.max(i - 1, 0)], tx = q[0] - o[0], ty = q[1] - o[1], tz = q[2] - o[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      var nx = -tz * tx, ny = -tz * ty, nz = 1 - tz * tz, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;   /* z-Achse senkrecht zur Speiseroehre */
      return [p[0] + vz * nx / nl * 0.93, p[1] + vz * ny / nl * 0.93, p[2] + vz * nz / nl * 0.93];
    });
    var ast = kl.slice(naechster(kl, pts[pts.length - 1]), Math.max(2, kl.length - 3));   /* der Ast beginnt dort, wo der Strang auf die Wand trifft: keine Schlaufe am Mageneingang */
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
    hiatus: hia ? hia[Math.floor(hia.length / 2)] : null,
    loch: loch, rand: [ZW.x0, ZW.x1, ZW.z0, ZW.z1]   /* Abstandsfeld der Luecke (Radius 1,3 cm, Innen < 0; null ohne Luecke) und Rand des Ausschnitts in x und z */
  };
}

/* ==========================================================================
   Darm: Zwoelffingerdarm bis After (Koerper-Koordinaten, cm)
   Duenndarm und Dickdarm entstehen aus festen Tabellen von Steuerpunkten (Catmull-Rom wie im Koerper). Der Duenndarm ist ein glatter Schlauch (r 0,9)
   in dicht gepackten Schlingen; die Tabelle wurde einmal berechnet (Schlingen im Rahmen des Dickdarms, die Schlauchwaende halten untereinander
   und zu allen Nachbarn im Koerper mindestens 0,1 cm Abstand). Der Dickdarm ist ein Abstandsfeld um die Mittellinie mit Haustren und drei Taenien.
   ========================================================================== */
var DUENN_R = 0.9;                                   /* Radius des Duenndarms */
var DUENN_LEER = 0.4;                                /* die ersten 40 % der Laenge sind Leerdarm (Jejunum), der Rest Krummdarm (Ileum) */
var FLEXUR = { p: [4.9, 94.6, 1.5] };             /* Flexura duodenojejunalis: Ende des Zwoelffingerdarms, Anfang des Leerdarms (links neben der Wirbelsaeule) */
var BAUHIN = { p: [-9.1, 92.6, 2.9] };               /* Bauhin-Klappe: Muendung des Krummdarms (Ende des Duenndarms) in die mediale Wand des Blinddarms */
var AFTER = { p: [0, 78.9, -4.3] };                  /* Mitte der Afteroeffnung (Haut) */
var DUENN_SCHNITT = { s0: 42, s1: 53 };              /* aufgeschnittene Duenndarmschlinge: Bereich der Mittellinie (cm ab der Flexur; vordere Schlinge im Leerdarm); p = Mitte, kommt aus duenndarm() */
var DUODENUM_FORT = [[-1.4, 95.2, 1.0], [-0.8, 94.2, 3.3], [1.0, 93.6, 3.9], [3.0, 93.6, 3.2], [4.4, 94.1, 2.2], [4.9, 94.6, 1.5]];   /* Fortsetzung des Zwoelffingerdarms ab dem Ende von BAHN.zwoelffingerdarm (r 1,0) bis zur Flexur */
BAHN.duodenum = { pts: BAHN.zwoelffingerdarm.pts.concat(DUODENUM_FORT), r: 1.0, seg: 90 };

/* ---- Achse: dichte Mittellinie mit Bogenlaenge, Begleitdreibein und Gitter fuer schnelle Abstandsabfragen ----
   Achse(pts, { schritt, zelle, flachEnde, flachAnfang, bezug }): pts = Steuerpunkte (Catmull-Rom). a.q(x, y, z) liefert den Abstand zur Mittellinie
   und setzt a.s (Bogenlaenge des naechsten Punkts), a.i (Abschnitt, -1 = weiter als a.zelle - 0,35 entfernt), a.t (Lage im Abschnitt), a.ax/ay/az
   (naechster Punkt der Mittellinie); a.phi() = Winkel um die Achse im Begleitdreibein (Parallelverschiebung). Mit flachEnde/flachAnfang endet die Achse
   mit einer ebenen Flaeche statt einer runden Kappe (s ausserhalb der Linie laeuft weiter). */
function Achse(pts, o) {
  o = o || {};
  var c = neuAbtasten(kurve(pts, o.n || 10), o.schritt || 0.3), n = c.length, i, k;
  var X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n), S = new Float64Array(n);
  var TX = new Float64Array(n), TY = new Float64Array(n), TZ = new Float64Array(n), NX = new Float64Array(n), NY = new Float64Array(n), NZ = new Float64Array(n);
  var BX = new Float64Array(n), BY = new Float64Array(n), BZ = new Float64Array(n);
  var bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  for (i = 0; i < n; i++) {
    X[i] = c[i][0]; Y[i] = c[i][1]; Z[i] = c[i][2];
    S[i] = i ? S[i - 1] + Math.sqrt(Math.pow(X[i] - X[i - 1], 2) + Math.pow(Y[i] - Y[i - 1], 2) + Math.pow(Z[i] - Z[i - 1], 2)) : 0;
    for (k = 0; k < 3; k++) { if (c[i][k] < bb[k]) bb[k] = c[i][k]; if (c[i][k] > bb[k + 3]) bb[k + 3] = c[i][k]; }
  }
  for (i = 0; i < n; i++) {
    var a0 = Math.max(i - 1, 0), a1 = Math.min(i + 1, n - 1), tx = X[a1] - X[a0], ty = Y[a1] - Y[a0], tz = Z[a1] - Z[a0], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    TX[i] = tx / tl; TY[i] = ty / tl; TZ[i] = tz / tl;
  }
  /* Begleitdreibein: N ist senkrecht zur Tangente T und wird von Punkt zu Punkt parallel verschoben (kein Drehen um die Achse), B = T x N */
  var ref = o.bezug || (Math.abs(TZ[0]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  for (i = 0; i < n; i++) {
    var px = i ? NX[i - 1] : ref[0], py = i ? NY[i - 1] : ref[1], pz = i ? NZ[i - 1] : ref[2], dp = px * TX[i] + py * TY[i] + pz * TZ[i];
    var qx = px - dp * TX[i], qy = py - dp * TY[i], qz = pz - dp * TZ[i], ql = Math.sqrt(qx * qx + qy * qy + qz * qz) || 1;
    NX[i] = qx / ql; NY[i] = qy / ql; NZ[i] = qz / ql;
    BX[i] = TY[i] * NZ[i] - TZ[i] * NY[i]; BY[i] = TZ[i] * NX[i] - TX[i] * NZ[i]; BZ[i] = TX[i] * NY[i] - TY[i] * NX[i];
  }
  /* Gitter: je Zelle die Abschnitte, deren Anfangs- oder Endpunkt in der Zelle liegt (CSR) */
  var C = o.zelle || 3.0, gx = Math.floor((bb[3] - bb[0]) / C) + 3, gy = Math.floor((bb[4] - bb[1]) / C) + 3, gz = Math.floor((bb[5] - bb[2]) / C) + 3;
  var ox = bb[0] - C, oy = bb[1] - C, oz = bb[2] - C, cnt = new Int32Array(gx * gy * gz + 1);
  function zelle(x, y, z) { return Math.floor((x - ox) / C) + gx * (Math.floor((y - oy) / C) + gy * Math.floor((z - oz) / C)); }
  for (i = 0; i < n - 1; i++) { var z0 = zelle(X[i], Y[i], Z[i]), z1 = zelle(X[i + 1], Y[i + 1], Z[i + 1]); cnt[z0 + 1]++; if (z1 !== z0) cnt[z1 + 1]++; }
  for (i = 1; i < cnt.length; i++) cnt[i] += cnt[i - 1];
  var fill = new Int32Array(cnt.length - 1), liste = new Int32Array(cnt[cnt.length - 1]);
  for (i = 0; i < n - 1; i++) {
    var y0 = zelle(X[i], Y[i], Z[i]), y1 = zelle(X[i + 1], Y[i + 1], Z[i + 1]);
    liste[cnt[y0] + fill[y0]++] = i; if (y1 !== y0) liste[cnt[y1] + fill[y1]++] = i;
  }
  var a = { n: n, laenge: S[n - 1], X: X, Y: Y, Z: Z, S: S, TX: TX, TY: TY, TZ: TZ, NX: NX, NY: NY, NZ: NZ, BX: BX, BY: BY, BZ: BZ, bb: bb, zelle: C,
    s: 0, i: -1, t: 0, ax: 0, ay: 0, az: 0, vx: 0, vy: 0, vz: 0 };
  a.q = function (x, y, z) {
    var ci = Math.floor((x - ox) / C), cj = Math.floor((y - oy) / C), ck = Math.floor((z - oz) / C);
    if (ci < 0 || cj < 0 || ck < 0 || ci >= gx || cj >= gy || ck >= gz) {
      var ex = Math.max(bb[0] - x, 0, x - bb[3]), ey = Math.max(bb[1] - y, 0, y - bb[4]), ez = Math.max(bb[2] - z, 0, z - bb[5]);
      a.i = -1; return Math.max(Math.sqrt(ex * ex + ey * ey + ez * ez), C - 0.35);
    }
    var best = 1e30, bi = -1, bt = 0, ii, jj, kk, m, j, ce, px, py, pz, vx, vy, vz, l2, t, dx, dy, dz, d2;
    for (kk = Math.max(ck - 1, 0); kk <= Math.min(ck + 1, gz - 1); kk++) for (jj = Math.max(cj - 1, 0); jj <= Math.min(cj + 1, gy - 1); jj++) for (ii = Math.max(ci - 1, 0); ii <= Math.min(ci + 1, gx - 1); ii++) {
      ce = ii + gx * (jj + gy * kk);
      for (m = cnt[ce]; m < cnt[ce + 1]; m++) {
        j = liste[m];
        vx = X[j + 1] - X[j]; vy = Y[j + 1] - Y[j]; vz = Z[j + 1] - Z[j]; l2 = vx * vx + vy * vy + vz * vz;
        px = x - X[j]; py = y - Y[j]; pz = z - Z[j];
        t = l2 > 0 ? (px * vx + py * vy + pz * vz) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        dx = px - vx * t; dy = py - vy * t; dz = pz - vz * t; d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < best) { best = d2; bi = j; bt = t; }
      }
    }
    if (bi < 0) { a.i = -1; return C - 0.35; }
    var s = S[bi] + (S[bi + 1] - S[bi]) * bt, d = Math.sqrt(best);
    a.i = bi; a.t = bt;
    a.ax = X[bi] + (X[bi + 1] - X[bi]) * bt; a.ay = Y[bi] + (Y[bi + 1] - Y[bi]) * bt; a.az = Z[bi] + (Z[bi + 1] - Z[bi]) * bt;
    a.vx = x - a.ax; a.vy = y - a.ay; a.vz = z - a.az;
    if (o.flachEnde && bi === n - 2 && bt >= 1) {
      var u = a.vx * TX[n - 1] + a.vy * TY[n - 1] + a.vz * TZ[n - 1];
      if (u > 0) { s = S[n - 1] + u; d = Math.sqrt(Math.max(0, best - u * u)); }
    }
    if (o.flachAnfang && bi === 0 && bt <= 0) {
      var u0 = a.vx * TX[0] + a.vy * TY[0] + a.vz * TZ[0];
      if (u0 < 0) { s = u0; d = Math.sqrt(Math.max(0, best - u0 * u0)); }
    }
    a.s = s;
    return d;
  };
  a.phi = function () {
    var i0 = a.i, t0 = a.t, nx = NX[i0] + (NX[i0 + 1] - NX[i0]) * t0, ny = NY[i0] + (NY[i0 + 1] - NY[i0]) * t0, nz = NZ[i0] + (NZ[i0 + 1] - NZ[i0]) * t0;
    var bx = BX[i0] + (BX[i0 + 1] - BX[i0]) * t0, by = BY[i0] + (BY[i0 + 1] - BY[i0]) * t0, bz = BZ[i0] + (BZ[i0 + 1] - BZ[i0]) * t0;
    return Math.atan2(a.vx * bx + a.vy * by + a.vz * bz, a.vx * nx + a.vy * ny + a.vz * nz);
  };
  a.punkt = function (s) {   /* Punkt der Mittellinie bei Bogenlaenge s (ausserhalb: Ende) */
    if (s <= 0) return [X[0], Y[0], Z[0]];
    if (s >= S[n - 1]) return [X[n - 1], Y[n - 1], Z[n - 1]];
    var lo = 0, hi = n - 1, m2;
    while (hi - lo > 1) { m2 = (lo + hi) >> 1; if (S[m2] <= s) lo = m2; else hi = m2; }
    var f = (s - S[lo]) / (S[lo + 1] - S[lo]);
    return [X[lo] + (X[lo + 1] - X[lo]) * f, Y[lo] + (Y[lo + 1] - Y[lo]) * f, Z[lo] + (Z[lo + 1] - Z[lo]) * f];
  };
  a.richtung = function (s) {   /* Einheitsvektor der Tangente bei s */
    var p0 = a.punkt(s - 0.15), p1 = a.punkt(s + 0.15), tx = p1[0] - p0[0], ty = p1[1] - p0[1], tz = p1[2] - p0[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    return [tx / tl, ty / tl, tz / tl];
  };
  a.von = function (p) {   /* Bogenlaenge des naechsten Punkts der Mittellinie zu p */
    var b = 0, bd = 1e30, j2;
    for (j2 = 0; j2 < n; j2++) { var d3 = Math.pow(X[j2] - p[0], 2) + Math.pow(Y[j2] - p[1], 2) + Math.pow(Z[j2] - p[2], 2); if (d3 < bd) { bd = d3; b = j2; } }
    return S[b];
  };
  a.grenzen = function (s0, s1, r) {   /* Gitterbox um den Abschnitt s0 bis s1 mit Rand r */
    var g = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9], j3;
    for (j3 = 0; j3 < n; j3++) if (S[j3] >= s0 - 0.5 && S[j3] <= s1 + 0.5) {
      if (X[j3] < g[0]) g[0] = X[j3]; if (Y[j3] < g[1]) g[1] = Y[j3]; if (Z[j3] < g[2]) g[2] = Z[j3];
      if (X[j3] > g[3]) g[3] = X[j3]; if (Y[j3] > g[4]) g[4] = Y[j3]; if (Z[j3] > g[5]) g[5] = Z[j3];
    }
    return [[Math.floor((g[0] - r) * 10) / 10, Math.floor((g[1] - r) * 10) / 10, Math.floor((g[2] - r) * 10) / 10], [Math.ceil((g[3] + r) * 10) / 10, Math.ceil((g[4] + r) * 10) / 10, Math.ceil((g[5] + r) * 10) / 10]];
  };
  return a;
}

var DUENN_TAB = [
  [4.9, 94.6, 1.5], [5.73, 94.36, 2.09], [6.27, 94.24, 2.99], [7.21, 94.52, 2.86],
  [8.14, 94.75, 2.77], [9.09, 94.93, 2.75], [10.04, 95.03, 2.85], [10.97, 95.08, 3.14],
  [11.77, 95.09, 3.68], [12.28, 95.1, 4.51], [12.15, 95.14, 5.48], [11.52, 95, 6.21],
  [10.64, 94.81, 6.58], [9.69, 94.62, 6.51], [8.8, 94.51, 6.17], [7.92, 94.58, 5.79],
  [7.02, 94.74, 5.47], [6.11, 94.93, 5.24], [5.17, 95.14, 5.14], [4.24, 95.35, 5.17],
  [3.32, 95.59, 5.36], [2.47, 95.86, 5.75], [2, 96.17, 6.57], [2.43, 96.32, 7.45],
  [3.37, 96.22, 7.68], [4.3, 96.01, 7.53], [5.2, 95.72, 7.33], [6.1, 95.37, 7.29],
  [7.01, 95.15, 7.59], [7.62, 95.48, 8.32], [7.1, 96.06, 8.94], [6.19, 96.13, 9.24],
  [5.31, 95.87, 9.56], [4.46, 95.54, 9.83], [3.53, 95.3, 9.96], [2.58, 95.25, 9.9],
  [1.64, 95.36, 9.7], [0.75, 95.58, 9.43], [-0.15, 95.81, 9.17], [-1.08, 95.97, 8.98],
  [-2.05, 95.96, 8.93], [-2.96, 95.69, 9.09], [-3.61, 95.07, 9.5], [-3.63, 94.24, 10.03],
  [-3.04, 93.59, 10.43], [-2.17, 93.22, 10.63], [-1.23, 93.03, 10.73], [-0.28, 92.92, 10.78],
  [0.68, 92.88, 10.78], [1.64, 92.91, 10.72], [2.59, 93, 10.62], [3.54, 93.11, 10.47],
  [4.47, 93.21, 10.29], [5.41, 93.24, 10.07], [6.35, 93.11, 9.83], [7.06, 92.67, 9.28],
  [6.7, 92.09, 8.55], [5.75, 91.99, 8.36], [4.79, 92.04, 8.32], [3.86, 92.26, 8.38],
  [2.95, 92.56, 8.48], [2.06, 92.89, 8.59], [1.16, 93.2, 8.7], [0.24, 93.46, 8.79],
  [-0.71, 93.63, 8.79], [-1.66, 93.67, 8.65], [-2.58, 93.54, 8.35], [-3.22, 93.26, 7.66],
  [-3.16, 92.94, 6.73], [-2.45, 92.83, 6.07], [-1.55, 92.99, 5.74], [-0.64, 93.32, 5.82],
  [0.2, 93.66, 6.13], [1.04, 93.93, 6.51], [1.92, 94.1, 6.85], [2.85, 94.13, 7.09],
  [3.8, 94, 7.18], [4.7, 93.71, 7.05], [5.58, 93.39, 6.82], [6.46, 93.04, 6.68],
  [7.36, 92.69, 6.58], [8.26, 92.38, 6.5], [9.19, 92.14, 6.4], [10.13, 92, 6.25],
  [11.06, 92, 5.95], [11.74, 92.48, 5.41], [11.36, 93.28, 4.97], [10.5, 93.74, 4.78],
  [9.61, 93.45, 4.49], [9.44, 92.78, 3.8], [9.43, 92.33, 2.94], [9.02, 92.13, 2.08],
  [8.18, 92.08, 1.61], [7.21, 92, 1.44], [6.48, 92, 2.08], [6.13, 92.12, 2.97],
  [5.79, 92.38, 3.83], [5.25, 92.72, 4.55], [4.48, 92.84, 5.12], [3.65, 92.67, 5.56],
  [2.8, 92.29, 5.84], [1.96, 91.84, 5.73], [1.18, 91.51, 5.27], [0.45, 91.34, 4.66],
  [-0.35, 91.42, 4.13], [-1.23, 91.66, 3.82], [-2.15, 91.95, 3.83], [-3.04, 92.16, 4.14],
  [-3.85, 92.2, 4.65], [-4.59, 92.02, 5.25], [-5.4, 91.72, 5.66], [-6.27, 91.39, 5.93],
  [-7.18, 91.11, 6.04], [-8.12, 90.96, 6.17], [-9.04, 91.04, 6.47], [-9.77, 91.45, 6.99],
  [-9.93, 92.15, 7.67], [-9.35, 92.76, 8.17], [-8.41, 92.98, 8.32], [-7.46, 92.86, 8.24],
  [-6.56, 92.55, 8.09], [-5.7, 92.14, 7.97], [-4.85, 91.7, 7.9], [-3.98, 91.31, 7.79],
  [-3.07, 91.04, 7.61], [-2.16, 90.85, 7.38], [-1.24, 90.71, 7.16], [-0.3, 90.56, 7],
  [0.66, 90.47, 7.02], [1.59, 90.48, 7.33], [2.23, 90.58, 8.07], [2.19, 90.69, 9.04],
  [1.49, 90.82, 9.71], [0.56, 90.92, 9.95], [-0.4, 91, 9.95], [-1.36, 91.1, 9.91],
  [-2.3, 91.26, 9.91], [-3.24, 91.46, 9.98], [-4.18, 91.62, 10.04], [-5.14, 91.7, 10.04],
  [-6.1, 91.65, 9.97], [-7.03, 91.42, 9.8], [-7.82, 90.89, 9.6], [-8.21, 89.98, 9.52],
  [-7.79, 89.09, 9.64], [-6.87, 88.88, 9.87], [-5.96, 89.1, 10.12], [-5.08, 89.4, 10.35],
  [-4.15, 89.52, 10.56], [-3.2, 89.49, 10.7], [-2.25, 89.37, 10.81], [-1.31, 89.23, 10.87],
  [-0.35, 89.12, 10.89], [0.61, 89.04, 10.88], [1.57, 88.97, 10.79], [2.4, 88.85, 10.29],
  [2.73, 88.69, 9.38], [2.34, 88.53, 8.5], [1.53, 88.41, 7.98], [0.56, 88.37, 7.95],
  [-0.37, 88.4, 8.19], [-1.28, 88.52, 8.48], [-2.2, 88.72, 8.66], [-3.12, 88.99, 8.66],
  [-4.02, 89.26, 8.48], [-4.93, 89.5, 8.27], [-5.86, 89.66, 8.08], [-6.8, 89.65, 7.87],
  [-7.69, 89.42, 7.57], [-8.45, 88.94, 7.15], [-8.34, 88.45, 6.29], [-7.5, 88.62, 5.81],
  [-6.61, 88.97, 5.66], [-5.69, 89.19, 5.83], [-4.78, 89.2, 6.13], [-3.87, 89.06, 6.4],
  [-2.93, 88.91, 6.58], [-1.97, 88.88, 6.44], [-1.23, 89.05, 5.83], [-0.98, 89.28, 4.92],
  [-1.1, 89.47, 3.98], [-1.45, 89.55, 3.08], [-2.11, 89.45, 2.38], [-2.99, 89.27, 2.02],
  [-3.94, 89.1, 2.09], [-4.84, 88.98, 2.4], [-5.7, 88.91, 2.83], [-6.54, 88.86, 3.3],
  [-7.42, 88.75, 3.71], [-8.17, 88.12, 3.89], [-8.06, 87.14, 3.72], [-7.28, 86.76, 3.28],
  [-6.46, 86.76, 2.77], [-5.7, 86.75, 2.18], [-4.84, 86.82, 1.74], [-3.9, 86.96, 1.57],
  [-2.97, 87.16, 1.72], [-2.17, 87.35, 2.22], [-1.6, 87.47, 3.01], [-1.41, 87.35, 3.95],
  [-1.71, 87.13, 4.85], [-2.4, 86.9, 5.49], [-3.32, 86.73, 5.73], [-4.28, 86.6, 5.7],
  [-5.21, 86.43, 5.56], [-6.16, 86.29, 5.44], [-7.12, 86.21, 5.43], [-8.06, 86.2, 5.64],
  [-8.87, 86.31, 6.17], [-9.28, 86.56, 7.03], [-8.98, 86.92, 7.9], [-8.15, 87.22, 8.31],
  [-7.2, 87.4, 8.3], [-6.26, 87.45, 8.12], [-5.32, 87.37, 7.95], [-4.37, 87.2, 7.89],
  [-3.44, 87.01, 7.81], [-2.51, 86.81, 7.67], [-1.58, 86.63, 7.48], [-0.65, 86.49, 7.32],
  [0.31, 86.39, 7.3], [1.25, 86.37, 7.54], [2.03, 86.38, 8.13], [2.35, 86.51, 9.05],
  [2, 86.73, 9.94], [1.19, 86.88, 10.45], [0.25, 86.97, 10.63], [-0.71, 87.06, 10.63],
  [-1.66, 87.18, 10.59], [-2.61, 87.32, 10.51], [-3.56, 87.45, 10.4], [-4.51, 87.38, 10.23],
  [-5.34, 86.9, 10], [-5.47, 85.94, 9.79], [-4.76, 85.26, 9.81], [-3.87, 84.92, 9.92],
  [-2.92, 84.83, 10.05], [-1.97, 84.86, 10.16], [-1.01, 84.91, 10.23], [-0.05, 84.9, 10.25],
  [0.91, 84.81, 10.22], [1.84, 84.63, 10], [2.49, 84.42, 9.28], [2.31, 84.3, 8.31],
  [1.49, 84.3, 7.78], [0.53, 84.33, 7.71], [-0.43, 84.23, 7.78], [-1.36, 84.02, 7.86],
  [-2.29, 83.83, 7.96], [-3.24, 83.7, 8.06], [-4.19, 83.68, 8.2], [-5.13, 83.78, 8.38],
  [-6.03, 84.02, 8.63], [-6.95, 84.23, 8.8], [-7.89, 84.4, 8.87], [-8.85, 84.52, 8.78],
  [-9.77, 84.54, 8.47], [-10.31, 84.45, 7.63], [-9.83, 84.3, 6.78], [-8.9, 84.24, 6.51],
  [-7.94, 84.26, 6.51], [-6.98, 84.32, 6.57], [-6.03, 84.4, 6.56], [-5.08, 84.46, 6.39],
  [-4.3, 84.5, 5.81], [-3.91, 84.51, 4.92], [-3.78, 84.98, 4.07], [-3.76, 85.85, 3.65],
  [-3.67, 86.81, 3.67], [-3.48, 87.73, 3.89], [-3.21, 88.64, 4.08], [-3.35, 89.6, 4.06],
  [-4, 90.28, 3.82], [-4.89, 90.64, 3.7], [-5.83, 90.78, 3.79], [-6.83, 90.82, 3.99],
  [-7.48, 91.62, 3.78], [-8.24, 92.12, 3.28], [-9.1, 92.6, 2.9]
];
/* Duenndarm: Mittellinie aus der Tabelle (von der Flexur bis zur Bauhin-Klappe), Achse mit Gitter */
function duennPts() { return DUENN_TAB.map(function (p) { return p.slice(); }); }
var DUENN_ZUSTAND = null;
function duennZustand() {
  if (!DUENN_ZUSTAND) {
    var A = Achse(DUENN_TAB, { schritt: 0.3 });
    DUENN_ZUSTAND = { A: A, L: A.laenge, sLeer: DUENN_LEER * A.laenge };
    DUENN_SCHNITT.p = A.punkt((DUENN_SCHNITT.s0 + DUENN_SCHNITT.s1) / 2);
  }
  return DUENN_ZUSTAND;
}
/* Mittellinie des Zwoelffingerdarms bis zur Flexur: Steuerpunkte und Radius */
function zwoelffingerdarm() { return { pts: BAHN.duodenum.pts.map(function (p) { return p.slice(); }), r: BAHN.duodenum.r, flexur: FLEXUR.p.slice() }; }
/* Duenndarm: { pts (Steuerpunkte), r, laenge (cm), leerEnde (Bogenlaenge, ab hier Krummdarm), achse, punkt(s), richtung(s), sdf(opt), grenzen(opt) }
   sdf({ ohne: [s0, s1] }) = Aussenflaeche (glatter Schlauch); ohne schneidet den Bereich mit ebenen Enden heraus */
function duenndarm() {
  var st = duennZustand(), A = st.A;
  return {
    pts: duennPts(), r: DUENN_R, laenge: st.L, leerEnde: st.sLeer, achse: A, schnitt: { s0: DUENN_SCHNITT.s0, s1: DUENN_SCHNITT.s1, p: DUENN_SCHNITT.p.slice() },
    punkt: A.punkt, richtung: A.richtung,
    grenzen: function () { return A.grenzen(0, st.L, DUENN_R + 0.3); },
    sdf: function (opt) {
      var o0 = opt && opt.ohne ? opt.ohne[0] : null, o1 = opt && opt.ohne ? opt.ohne[1] : null;
      return function (x, y, z) {
        var d = A.q(x, y, z);
        if (A.i < 0) return d - DUENN_R;
        var v = d - DUENN_R;
        if (o0 !== null) v = Math.max(v, Math.min(A.s - o0, o1 - A.s));   /* Bereich herausgeschnitten (Differenz mit der Platte o0 < s < o1) */
        return v;
      };
    }
  };
}

/* ---- Dickdarm ----
   Steuerpunkte der Mittellinie vom blinden Ende des Blinddarms bis zum After. Der rechte Teil (ab (-11,5; 95; 0) bis (4; 99,6; 6,8)) und der linke Teil
   bis (11,8; 95; -2,6) wie BAHN.dickdarm; der Blinddarm liegt vor der Hueftpfanne, der absteigende Teil laeuft seitlich an ihr vorbei, das Sigma
   haengt in einer S-Schlinge im linken Unterbauch, der Mastdarm liegt vor dem Kreuzbein und hinter der Harnblase, der Analkanal endet an der Haut. */
var DICK_PTS = [[-11.8, 88.6, 5.0], [-11.7, 91.8, 3.0], [-11.5, 95, 0], [-11.6, 100, -0.5], [-10.8, 103.4, 0.8], [-8.5, 102, 4], [-6, 99.6, 6.4], [-1, 98.6, 7], [4, 99.6, 6.8],
  [8.8, 97.5, 6.0], [13.3, 99.2, 2.4], [13.3, 103.6, -3.2], [11.8, 100.5, -2.8], [11.8, 95, -2.6],
  [12.8, 92, -1.2], [13.2, 89.6, 1.6], [12.2, 88, 4.4], [9.6, 87.6, 6.4], [6.4, 88.4, 6.2], [4.4, 89.8, 4.6], [2.8, 90.2, 3], [1.6, 88.6, 1.4], [0.5, 87.6, -0.8],
  [0, 86.6, -2.6], [0, 85, -3.4], [0, 82.8, -3.6], [0, 80.8, -3.9], [0, 78.9, -4.3]];
var DICK_I = { blind: 0, flexurRechts: 4, flexurLinks: 11, sigma: 14, mastdarm: 20, kanal: 25 };   /* Indizes der Steuerpunkte an den Abschnittsgrenzen */
var WURM_PTS = [[-11.6, 87.2, 4.4], [-11.0, 85.4, 4.8], [-10.04, 84.3, 4.86], [-8.03, 82.34, 5.72], [-7.31, 81.67, 6.01], [-5.8, 80.4, 6.6]];   /* Wurmfortsatz (r 0,35, frei haengend, ca. 9,5 cm) */
var WURM_R = 0.35;
var HAUSTRE = 3.2;      /* Abstand der Haustren (cm) */
var DICK_ZUSTAND = null;
function dickZustand() {
  if (DICK_ZUSTAND) return DICK_ZUSTAND;
  var A = Achse(DICK_PTS, { schritt: 0.3, zelle: 4.0, flachEnde: true }), st = { A: A, L: A.laenge };
  st.s = {
    bauhin: A.von(BAUHIN.p), flexurRechts: A.von(DICK_PTS[DICK_I.flexurRechts]), flexurLinks: A.von(DICK_PTS[DICK_I.flexurLinks]),
    sigma: A.von(DICK_PTS[DICK_I.sigma]), mastdarm: A.von(DICK_PTS[DICK_I.mastdarm]), kanal: A.von(DICK_PTS[DICK_I.kanal]), ende: A.laenge
  };
  /* Taenien: der Anfangswinkel liegt so, dass eine Taenie nach vorn (+z) zeigt, wo die Mittellinie senkrecht steht (nur eine Festlegung, keine Anatomie) */
  st.phi0 = 0.4;
  /* Grundradius (ohne Haustren): Blinddarm weiter, Sigma enger, Analkanal enger */
  var S = st.s;
  st.R0 = function (s) {
    var r = 1.8;
    r += 0.6 * (1 - glatt(S.bauhin - 0.2, S.bauhin + 1.8, s));
    r -= 0.25 * glatt(S.sigma - 1.5, S.sigma + 1.0, s) * (1 - glatt(S.mastdarm - 2.0, S.mastdarm, s));
    r -= 0.35 * glatt(S.kanal - 1.2, S.kanal, s);
    return r;
  };
  st.W = function (s) { return glatt(S.mastdarm - 0.5, S.mastdarm - 3.0, s); };   /* Gewicht der Haustren und Taenien: 1 bis zum Sigma, 0 im Mastdarm und Analkanal */
  /* Aussenradius mit Haustren (flache, leicht unregelmaessige Einschnuerungen alle HAUSTRE cm) und drei deutliche Taenien (Laengsmuskelstreifen, im Querschnitt um 120 Grad versetzt) */
  /* Winkelabstand zur naechsten Taenie, 0 bis pi/3 */
  function taenieDa(phi) { var m = (phi - st.phi0) * 0.477464829; return Math.abs(m - Math.round(m)) * 2.0943951; }   /* m = Winkel / (2 pi / 3) */
  st.R = function (s, phi) {
    var R = st.R0(s), w = st.W(s);
    if (w <= 0) return R;
    var b = 0.5 + 0.5 * Math.cos(6.283185307 * s / HAUSTRE);
    var da = taenieDa(phi);
    var f = 1 + 0.25 * Math.sin(1.7 * Math.floor(s / HAUSTRE) + 0.6);                          /* feste, je Haustrum leicht verschiedene Tiefe (kein Zufall); wechselt bei b = 1, wo die Einschnuerung 0 ist */
    return R + w * (-0.22 * f * (1 - b) * (1 - b) + 0.10 * b * (da / 1.0471976) + 0.13 * Math.exp(-(da / 0.26) * (da / 0.26)));
  };
  /* Gewicht 0..1 der Taenien-Faerbung (Mitte des Streifens 1, weich auslaufend; nur wo Haustren und Taenien sind) */
  st.T = function (s, phi, k) { var w = st.W(s), da = taenieDa(phi); k = k || 0.025; return w * glatt(0.275 + k, 0.275 - k, da); };   /* klar begrenzter Streifen, ca. 1 cm breit; k = halbe Breite der Kante (rad), groesser fuer grobe Netze */
  var wp = kurve(WURM_PTS, 8);
  st.wurm = kette(wp, WURM_R, 3);
  DICK_ZUSTAND = st;
  return st;
}
/* Wurmfortsatz: { pts, r } (Steuerpunkte, der Anfang liegt im Blinddarm) */
function wurmfortsatz() { return { pts: WURM_PTS.map(function (p) { return p.slice(); }), r: WURM_R }; }
/* Dickdarm als Abstandsfeld: { sdf, grenzen, achse, laenge, abschnitte, R(s, phi) }
   opt: ohneAppendix, glatt (ohne Haustren und Taenien), von/bis (nur dieser Bereich der Mittellinie, Bogenlaenge in cm vom blinden Ende, mit ebenen Schnittflaechen)
   abschnitte: Bogenlaenge der Grenzen: blinddarm [0, bauhin], aufsteigend [bauhin, flexurRechts], quer [flexurRechts, flexurLinks], absteigend [flexurLinks, sigma],
   sigma [sigma, mastdarm], mastdarm [mastdarm, kanal], analkanal [kanal, ende] */
function dickdarm(opt) {
  opt = opt || {};
  var st = dickZustand(), A = st.A, S = st.s, wurm = opt.ohneAppendix ? null : st.wurm, glattO = !!opt.glatt;
  var von = opt.von === undefined ? null : opt.von, bis = opt.bis === undefined ? null : opt.bis;
  var rmax = 2.9;
  var sdf = function (x, y, z) {
    var d = A.q(x, y, z), v;
    if (A.i < 0) v = d - rmax; else {
      var s = A.s, R = glattO ? st.R0(s) : st.R(s, A.phi());
      v = Math.max(d - R, s - A.laenge);   /* ebene Endflaeche am After */
      if (von !== null) v = Math.max(v, von - s);
      if (bis !== null) v = Math.max(v, s - bis);
    }
    if (wurm) v = smin(v, wurm(x, y, z), 0.3);
    return v;
  };
  var g = A.grenzen(von === null ? 0 : von, bis === null ? A.laenge : bis, rmax);
  if (wurm) for (var k = 0; k < WURM_PTS.length; k++) for (var c = 0; c < 3; c++) { if (WURM_PTS[k][c] - 0.8 < g[0][c]) g[0][c] = Math.floor((WURM_PTS[k][c] - 0.8) * 10) / 10; if (WURM_PTS[k][c] + 0.8 > g[1][c]) g[1][c] = Math.ceil((WURM_PTS[k][c] + 0.8) * 10) / 10; }
  return {
    sdf: sdf, grenzen: g, achse: A, laenge: A.laenge, R: st.R, R0: st.R0,
    taenie: function (x, y, z, k) { A.q(x, y, z); if (A.i < 0) return 0; return glattO ? 0 : st.T(A.s, A.phi(), k); },   /* Gewicht 0..1 der Taenie an dieser Stelle der Aussenflaeche (zum Einfaerben) */
    abschnitte: { blinddarm: [0, S.bauhin], aufsteigend: [S.bauhin, S.flexurRechts], quer: [S.flexurRechts, S.flexurLinks], absteigend: [S.flexurLinks, S.sigma], sigma: [S.sigma, S.mastdarm], mastdarm: [S.mastdarm, S.kanal], analkanal: [S.kanal, S.ende] }
  };
}

/* ---- Wandschichten (nur lokal, fuer die aufgeschnittenen Abschnitte des Detailmodells) ----
   Jede Schicht ist ein Abstandsfeld zwischen zwei Tiefen unter der Aussenflaeche (Tiefe = Aussenradius - Abstand zur Mittellinie); die Wand ist fuer die
   Darstellung dicker als in Wirklichkeit (ca. 0,6 bis 0,9 cm), damit ein Gitter von 0,1 cm sie aufloest. Rueckgabe: { schichten: [{ id, sdf, grenzen }],
   grenzen, mitte, schnitt, def } mit schnitt(x, y, z) > 0 dort, wo die Wand zum Aufschneiden entfernt ist (schon in allen Schichten enthalten; -1 weit weg); def = die Beschreibung
   (s0, s1, rand, R(s, phi), ebene = [hx, hy, hz, off] der Schnittebene, schichten mit id, a(s, phi), b(s, phi), von, bis: die Wand liegt zwischen den Tiefen a und b), damit sich die Schnittflaeche
   und die Innenflaeche auch ohne Gitter aufbauen lassen. */
function wandSchichten(A, def) {
  var gr = A.grenzen(def.s0, def.s1, def.rand || 2.6);
  var liste = def.schichten.map(function (L) {
    var von = L.von === undefined ? def.s0 : L.von, bis = L.bis === undefined ? def.s1 : L.bis, grL = (L.von === undefined && L.bis === undefined) ? gr : A.grenzen(von, bis, def.rand || 2.6);
    return {
      id: L.id, grenzen: grL,
      sdf: function (x, y, z) {
        var d = A.q(x, y, z);
        if (A.i < 0) return d - def.rand;
        var s = A.s, phi = A.phi(), tief = def.R(s, phi) - d;
        var v = Math.max(L.a(s, phi) - tief, tief - L.b(s, phi), von - s, s - bis);
        if (def.schnitt) v = Math.max(v, def.schnitt(A, x, y, z));
        if (def.loch) v = Math.max(v, -def.loch(x, y, z));
        if (L.zusatz) v = L.zusatz(v, x, y, z, A);
        return v;
      }
    };
  });
  return { schichten: liste, grenzen: gr, schnitt: def.schnitt ? function (x, y, z) { A.q(x, y, z); return A.i < 0 ? -1 : def.schnitt(A); } : null, def: def };
}
/* Schnittebene durch die Mittellinie: Wert > 0 vor der Ebene, die von der Tangente der Achse und dem Bezugsvektor h (hx, hy, hz) aufgespannt wird, um off cm nach vorn versetzt
   (a.q muss vorher fuer den Punkt aufgerufen sein, a.i >= 0); entfernt die vordere Haelfte der Wand und oeffnet den Schlauch */
function schnittEbene(a, hx, hy, hz, off) {
  var i = a.i, tx = a.TX[i], ty = a.TY[i], tz = a.TZ[i], dp = hx * tx + hy * ty + hz * tz, nx = hx - dp * tx, ny = hy - dp * ty, nz = hz - dp * tz, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return (a.vx * nx + a.vy * ny + a.vz * nz) / nl - off;
}
/* Ringfalten (Kerckring-Falten) im Duenndarm: Hoehe (cm) der Schleimhautleisten bei Bogenlaenge s und Winkel phi; schmale halbmondfoermige Leisten quer zur Achse (ca. 60 % des Umfangs, von Leiste zu Leiste versetzt) mit Taelern dazwischen; hoch und dicht im Leerdarm, flach und weiter im Krummdarm */
function ringfalte(st, s, phi) {
  var u = glatt(st.sLeer, 0.85 * st.L, s), hf = 0.27 - 0.13 * u, P = 0.9 + 0.3 * u;
  var k = Math.floor(s / P + 0.5), x = (s - k * P) / 0.17;
  var dphi = phi - k * 2.4, w = Math.abs(dphi - 6.283185307 * Math.round(dphi / 6.283185307));   /* Leiste k liegt um 2,4 rad versetzt zur vorigen: halbmondfoermig, ca. 60 % des Umfangs */
  return hf * Math.exp(-x * x) * glatt(2.0, 1.0, w);
}
/* Duenndarm-Abschnitt s0 bis s1 (cm ab der Flexur) mit Laengsmuskel, Ringmuskel und Schleimhaut samt Ringfalten, vorn aufgeschnitten (cut = Abstand
   der Schnittflaeche vor der Mittellinie, Standard 0: Schnitt durch die Mittellinie, die vordere Haelfte (z grosser) fehlt) */
function duennSchichten(s0, s1, opt) {
  opt = opt || {};
  var st = duennZustand(), A = st.A, cut = opt.cut || 0;
  var def = {
    s0: s0, s1: s1, rand: DUENN_R + 0.3, R: function () { return DUENN_R; },
    schnitt: opt.ohneSchnitt ? null : function (a) { return schnittEbene(a, 0, 0, 1, cut); }, ebene: [0, 0, 1, cut],
    schichten: [
      { id: 'laengsmuskel', a: function () { return 0; }, b: function () { return 0.18; } },
      { id: 'ringmuskel', a: function () { return 0.18; }, b: function () { return 0.36; } },
      { id: 'schleimhaut', a: function () { return 0.36; }, b: function (s, phi) { return 0.52 + ringfalte(st, s, phi); } }
    ]
  };
  var r = wandSchichten(A, def);
  r.mitte = A.punkt((s0 + s1) / 2);
  return r;
}
/* Blinddarm mit Bauhin-Klappe und Wurmfortsatz: Wand des Blinddarms (Laengs-, Ringmuskel, Schleimhaut) von der Kappe bis 3 cm ueber die Klappe, vorn
   aufgeschnitten (1,2 cm vor der Mittellinie); 'bauhin' = Klappe als Wulst mit Schlitz an der medialen Wand (zeigt in den Blinddarm; Richtung des Krummdarms);
   'wurmfortsatz' = Wand mit Lichtung, nicht aufgeschnitten; die Wand hat ein Loch am Abgang des Wurmfortsatzes */
function blinddarmSchichten() {
  var st = dickZustand(), A = st.A, SB = st.s;
  A.q(BAUHIN.p[0], BAUHIN.p[1], BAUHIN.p[2]);
  var dl = Math.sqrt(A.vx * A.vx + A.vy * A.vy + A.vz * A.vz) || 1, dir = [-A.vx / dl, -A.vy / dl, -A.vz / dl], p0 = [BAUHIN.p[0] + dir[0] * 0.5, BAUHIN.p[1] + dir[1] * 0.5, BAUHIN.p[2] + dir[2] * 0.5], p1 = [p0[0] + dir[0] * 1.4, p0[1] + dir[1] * 1.4, p0[2] + dir[2] * 1.4];
  var wp = kurve(WURM_PTS, 8), wl = kurve(WURM_PTS.slice(0, 3), 8), lochW = kette(wl, 0.15, 2.5), wAussen = kette(wp, WURM_R, 3), wInnen = kette(wp, 0.14, 3);
  var def = {
    s0: -1, s1: SB.bauhin + 3.0, rand: 3.0, R: st.R,
    schnitt: function (a) { return schnittEbene(a, 0, 0, 1, 1.2); }, ebene: [0, 0, 1, 1.2], loch: lochW,
    schichten: [
      { id: 'laengsmuskel', a: function () { return 0; }, b: function () { return 0.2; } },
      { id: 'ringmuskel', a: function () { return 0.2; }, b: function () { return 0.42; } },
      { id: 'schleimhaut', a: function () { return 0.42; }, b: function () { return 0.72; } }
    ]
  };
  var r = wandSchichten(A, def);
  var gb = [[Math.min(p0[0], p1[0]) - 1.3, Math.min(p0[1], p1[1]) - 1.3, Math.min(p0[2], p1[2]) - 1.3], [Math.max(p0[0], p1[0]) + 1.3, Math.max(p0[1], p1[1]) + 1.3, Math.max(p0[2], p1[2]) + 1.3]];
  /* Bauhin-Klappe: zwei Lippen (oben und unten, quer zur Mittellinie des Blinddarms ca. 2 cm lang) mit einem queren Schlitz dazwischen, innen an der medialen Wand */
  var pm = [p0[0] + dir[0] * 0.5, p0[1] + dir[1] * 0.5, p0[2] + dir[2] * 0.5], ez = [0, 0, 1], LP = 0.72;
  r.schichten.push({
    id: 'bauhin', grenzen: [[pm[0] - 1.8, pm[1] - 1.8, pm[2] - 2.2], [pm[0] + 1.8, pm[1] + 1.8, pm[2] + 2.2]],
    sdf: function (x, y, z) {
      var dc = A.q(x, y, z), v = Math.min(
        S.kapsel(x, y, z, pm[0] - ez[0] * 1.0, pm[1] + LP, pm[2] - 1.0, pm[0], pm[1] + LP, pm[2] + 1.0, 0.5, 0.5),
        S.kapsel(x, y, z, pm[0] - ez[0] * 1.0, pm[1] - LP, pm[2] - 1.0, pm[0], pm[1] - LP, pm[2] + 1.0, 0.5, 0.5));
      v = Math.min(v, S.kapsel(x, y, z, p0[0], p0[1] + LP, p0[2] - 1.0, p0[0], p0[1] + LP, p0[2] + 1.0, 0.6, 0.6), S.kapsel(x, y, z, p0[0], p0[1] - LP, p0[2] - 1.0, p0[0], p0[1] - LP, p0[2] + 1.0, 0.6, 0.6));
      if (A.i < 0) return v;
      v = Math.max(v, dc - st.R(A.s, A.phi()) + 0.12);   /* nur innerhalb des Blinddarms */
      return Math.max(v, schnittEbene(A, 0, 0, 1, 1.2));
    }
  });
  var gw = [[0, 0, 0], [0, 0, 0]], k, c;
  for (c = 0; c < 3; c++) { gw[0][c] = 1e9; gw[1][c] = -1e9; }
  for (k = 0; k < WURM_PTS.length; k++) for (c = 0; c < 3; c++) { gw[0][c] = Math.min(gw[0][c], WURM_PTS[k][c] - 0.7); gw[1][c] = Math.max(gw[1][c], WURM_PTS[k][c] + 0.7); }
  r.schichten.push({
    id: 'wurmfortsatz', grenzen: gw,
    sdf: function (x, y, z) {
      var d = A.q(x, y, z), v = Math.max(wAussen(x, y, z), -wInnen(x, y, z));
      if (A.i >= 0) v = Math.max(v, -(d - st.R(A.s, A.phi())));   /* im Blinddarm selbst nicht */
      return v;
    }
  });
  r.mitte = [BAUHIN.p[0] - 1.0, BAUHIN.p[1] - 1.5, BAUHIN.p[2]];
  r.klappe = { p0: p0, p1: p1, richtung: dir };
  return r;
}
/* Zwoelffingerdarm mit der Papille: Wand (Laengsmuskel, Ringmuskel, Schleimhaut mit Ringfalten wie im Leerdarm) auf 10 cm um die Papille, vorn aufgeschnitten; 'papille' =
   Erhebung an der medialen Wand (Lage und Richtung aus der Leberform) mit dem gemeinsamen Gang, in den Hauptgallengang und Pankreasgang muenden */
var DUO_ZUSTAND = null;
function zwoelffingerdarmSchichten() {
  var LE = Kern.Formen && Kern.Formen.leber;
  if (!LE) throw new Error('Der Zwoelffingerdarm braucht die Form der Leber (Papille), sie ist nicht geladen.');
  if (!DUO_ZUSTAND) DUO_ZUSTAND = { A: Achse(BAHN.duodenum.pts, { schritt: 0.3 }), sLeer: 1e9, L: 1e9 };
  var st = DUO_ZUSTAND, A = st.A, PA = LE.PAPILLE, sP = A.von(PA.p), s0 = Math.max(sP - 5, 0), s1 = sP + 5;
  var def = {
    s0: s0, s1: s1, rand: 1.6, R: function () { return 1.0; },
    schnitt: function (a) { return schnittEbene(a, 0, 0, 1, 0); }, ebene: [0, 0, 1, 0],
    schichten: [
      { id: 'laengsmuskel', a: function () { return 0; }, b: function () { return 0.16; } },
      { id: 'ringmuskel', a: function () { return 0.16; }, b: function () { return 0.34; } },
      { id: 'schleimhaut', a: function () { return 0.34; }, b: function (s, phi) { return 0.56 + ringfalte(st, s, phi); } }
    ]
  };
  var r = wandSchichten(A, def), q = PA.p, d = PA.richtung;
  var p0 = [q[0] + d[0] * 0.1, q[1] + d[1] * 0.1, q[2] + d[2] * 0.1], p1 = [q[0] + d[0] * 0.75, q[1] + d[1] * 0.75, q[2] + d[2] * 0.75];
  r.schichten.push({
    id: 'papille', grenzen: [[q[0] - 1.2, q[1] - 1.2, q[2] - 1.2], [q[0] + 1.2, q[1] + 1.2, q[2] + 1.2]],
    sdf: function (x, y, z) {
      var v = S.kapsel(x, y, z, p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], PA.r, PA.r * 0.7);
      v = Math.max(v, -S.kapsel(x, y, z, q[0], q[1], q[2], p1[0] + d[0] * 0.3, p1[1] + d[1] * 0.3, p1[2] + d[2] * 0.3, 0.12, 0.12));
      A.q(x, y, z);
      return A.i < 0 ? v : Math.max(v, schnittEbene(A, 0, 0, 1, 0));
    }
  });
  r.mitte = PA.p.slice(); r.papille = { p: q.slice(), richtung: d.slice(), r: PA.r };
  return r;
}

/* Mastdarm und Analkanal: von knapp oberhalb des Mastdarms bis zum After; Laengs- und Ringmuskel, innerer Schliessmuskel (verdickter Ringmuskel im
   Analkanal), aeusserer Schliessmuskel (unten aussen), Schleimhaut mit Analsaeulen; aufgeschnitten in der Mittelebene (links fehlt, x > 0 wird entfernt) */
function mastdarmSchichten(opt) {
  var st = dickZustand(), A = st.A, S = st.s;
  function wc(s) { return glatt(S.kanal - 1.4, S.kanal - 0.2, s); }
  var def = {
    s0: opt && opt.von !== undefined ? opt.von : S.mastdarm + 6.0, s1: S.ende, rand: 2.6, R: st.R,
    schnitt: function (a) { return schnittEbene(a, 1, 0, 0, 0); }, ebene: [1, 0, 0, 0],
    schichten: [
      { id: 'laengsmuskel', a: function () { return 0; }, b: function () { return 0.2; }, bis: S.kanal + 0.5 },
      { id: 'ringmuskel', a: function () { return 0.2; }, b: function () { return 0.45; }, bis: S.kanal - 1.0 },
      { id: 'sphinkterInnen', a: function (s) { return 0.2 + 0.25 * wc(s); }, b: function (s) { return 0.45 + 0.45 * wc(s); }, von: S.kanal - 1.0, bis: S.ende - 0.6 },
      { id: 'sphinkterAussen', a: function () { return 0; }, b: function () { return 0.45; }, von: S.kanal + 0.5 },
      { id: 'schleimhaut', a: function (s) { return 0.45 + 0.45 * wc(s); }, b: function (s, phi) { return 0.95 + 0.3 * wc(s) - wc(s) * 0.12 * (0.5 + 0.5 * Math.cos(6 * phi)); } }
    ]
  };
  var r = wandSchichten(A, def);
  r.mitte = A.punkt(S.kanal);
  r.kanalStart = S.kanal;
  return r;
}

/* ---- Gekroese (Mesenterium) ----
   Halbdurchsichtige Platte von der Wurzel (ca. 17 cm; von der Flexur ueber die Gefaesse am Anfang des Duenndarms schraeg nach rechts unten zur Bauhin-Klappe,
   an der hinteren Bauchwand) nach vorn zu den Duenndarmschlingen. Von jedem Punkt der Wurzel laeuft ein Strahl nach vorn und etwas nach unten, bis er die
   Wand einer Schlinge (oder den Zwoelffingerdarm) beruehrt oder 7 cm lang ist; die Platte reicht bis dorthin und durchdringt keine Schlinge. */
var GEKR_WURZEL = [[3.9, 94.4, 2.0], [3.2, 95.0, 2.1], [2.0, 96.0, 2.6], [1.13, 96.52, 2.94], [0.43, 96.47, 3.83], [-0.41, 96.16, 4.36], [-1.58, 95.63, 4.5], [-3.26, 95.11, 4.48],
  [-4.83, 94.61, 4.48], [-6.6, 93.9, 4.0], [-8.0, 93.3, 3.5]];
var GEKR = null;
function gekroese() {
  if (GEKR) return GEKR;
  var du = duennZustand(), A = du.A, duo = kette(kurve(BAHN.duodenum.pts, 8), 1.0, 3);
  var wurzel = neuAbtasten(kurve(GEKR_WURZEL, 8), 0.7), nu = wurzel.length, nv = 6, i, j, k, c;
  var dir = [], len = [];
  for (i = 0; i < nu; i++) {
    var a = wurzel[Math.max(i - 1, 0)], b = wurzel[Math.min(i + 1, nu - 1)], tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    tx /= tl; ty /= tl; tz /= tl;
    var dp = -0.35 * ty + tz, ux = -dp * tx, uy = -0.35 - dp * ty, uz = 1 - dp * tz, ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;   /* (0; -0,35; 1) senkrecht zur Wurzel */
    ux /= ul; uy /= ul; uz /= ul;
    dir.push([ux, uy, uz]);
    var t = 0, p = wurzel[i];
    while (t < 7) {
      var x = p[0] + ux * t, y = p[1] + uy * t, z = p[2] + uz * t, dd = A.q(x, y, z);
      if ((A.i >= 0 && dd < DUENN_R + 0.03) || duo(x, y, z) < 0.03) break;
      t += 0.1;
    }
    len.push(Math.max(t - 0.1, 0.3));
  }
  var l2 = len.map(function (l, q) { return 0.5 * l + 0.5 * Math.min(len[Math.max(q - 1, 0)], l, len[Math.min(q + 1, nu - 1)]); });   /* nur kuerzer, nie laenger: haelt Abstand zu den Schlingen */
  var pts = [], tris = [], rand = [];
  for (i = 0; i < nu; i++) for (j = 0; j <= nv; j++) {
    var f = l2[i] * j / nv, p0 = wurzel[i];
    pts.push([p0[0] + dir[i][0] * f, p0[1] + dir[i][1] * f, p0[2] + dir[i][2] * f]);
    if (j === nv) rand.push(pts[pts.length - 1].slice());
  }
  for (i = 0; i < nu - 1; i++) for (j = 0; j < nv; j++) {
    var q0 = i * (nv + 1) + j, q1 = (i + 1) * (nv + 1) + j;
    tris.push(q0, q1, q0 + 1, q1, q1 + 1, q0 + 1);
  }
  GEKR = { pts: pts, tris: tris, nu: nu, nv: nv, wurzel: wurzel, rand: rand, richtung: dir, laenge: l2, wurzelLaenge: laenge(wurzel) };
  return GEKR;
}

/* ---- Gefaesse des Darms ----
   darmGefaesse() -> { darmarterien, darmvenen, pfortader }: je Liste von { id, pts, r0, r1 } (Venen in Fliessrichtung, Arterien vom Ursprung weg).
   Arterien: obere Mesenterialarterie aus der Bauchaorta (unterhalb des Truncus coeliacus, vor dem Zwoelffingerdarm) mit Aesten zum Leer- und Krummdarm (Arkaden im
   Gekroese, vereinfacht), zur Bauhin-Klappe und zum rechten und queren Dickdarm; untere Mesenterialarterie mit Aesten zum absteigenden Dickdarm, Sigma und Mastdarm.
   Venen laufen daneben; die obere Mesenterialvene setzt die Mesenterialvene der Leberform fort, die untere Mesenterialvene muendet in die Milzvene.
   pfortader: Stamm mit Stumpf der Milzvene und die ganze obere Mesenterialvene (wie in der Leberform, id mesenterialvene). */
var SMA_PTS = [[2.4, 96.4, 0.9], [1.13, 96.52, 2.94], [0.43, 96.47, 3.83], [-0.41, 96.16, 4.36], [-1.58, 95.63, 4.5], [-3.26, 95.11, 4.48], [-4.83, 94.61, 4.48]];
var SMV_PTS = [[0.4, 93.6, 1.5], [-0.3, 92.4, 1.9], [-2.2, 92.0, 2.3], [-4.0, 92.4, 2.5], [-5.6, 93.2, 2.7], [-7.4, 94.2, 3.2]];   /* ab dem Ende der Mesenterialvene der Leberform */
var IMA_PTS = [[3, 95.4, 0.7], [3.83, 94.05, -0.19], [3.9, 92.92, -0.85], [3.44, 90.9, -1.84], [2.86, 89.33, -2.42], [2.2, 87.8, -2.8]];
var IMV_PTS = [[2.6, 87.8, -3.4], [3.9, 90.9, -2.5], [4.7, 92.9, -2.2], [5.2, 95.0, -2.4], [5.4, 97.5, -3.0], [5.0, 100.5, -3.4], [3.8, 103.3, -3.4]];   /* letzter Punkt: wird durch die Muendung in die Milzvene ersetzt */
var ARTERIEN_AST = [
  { id: 'ileocolica', pts: [[-4.83, 94.61, 4.48], [-7.6, 94.9, 4.4], [-9.2, 94.2, 3.9]], r0: 0.2, r1: 0.14 },
  { id: 'colica-dextra', pts: [[-3.26, 95.11, 4.48], [-5.2, 96.6, 3.8], [-8.0, 98.0, 2.6], [-9.9, 98.5, 0.9]], r0: 0.17, r1: 0.12 },
  { id: 'colica-media', pts: [[0.43, 96.47, 3.83], [-0.1, 96.7, 5.2], [-0.7, 96.9, 6.3]], r0: 0.17, r1: 0.12 },
  { id: 'colica-sinistra', pts: [[3.83, 94.05, -0.19], [6.58, 95, -1.26], [8.91, 95.79, -2.17], [10.2, 96.2, -2.7]], r0: 0.17, r1: 0.12 },
  { id: 'sigmoideae', pts: [[3.44, 90.9, -1.84], [4.16, 90.89, -1.12], [5.45, 90.23, 1.58], [6.5, 89.4, 5.4]], r0: 0.15, r1: 0.1 }
];
function darmGefaesse() {
  var LE = Kern.Formen && Kern.Formen.leber;
  if (!LE) throw new Error('Die Gefaesse brauchen die Form der Leber, sie ist nicht geladen.');
  var GE = LE.GEFAESSE, g = gekroese(), k;
  function kopie(pts) { return pts.map(function (p) { return p.slice(); }); }
  function versatz(pts, o) { return pts.map(function (p) { return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; }); }
  function umkehr(pts) { return kopie(pts).reverse(); }
  function naechster(poly, p) { var b = 0, bd = 1e30, q; for (q = 0; q < poly.length; q++) { var d = Math.pow(poly[q][0] - p[0], 2) + Math.pow(poly[q][1] - p[1], 2) + Math.pow(poly[q][2] - p[2], 2); if (d < bd) { bd = d; b = q; } } return poly[b]; }
  var sma = kurve(SMA_PTS, 8), smv = kurve([GE.pfortader[2].pts[GE.pfortader[2].pts.length - 1]].concat(SMV_PTS), 8);
  var arterien = [{ id: 'mesenterica-superior', pts: kopie(SMA_PTS), r0: 0.3, r1: 0.2 }, { id: 'mesenterica-inferior', pts: kopie(IMA_PTS), r0: 0.25, r1: 0.14 }];
  ARTERIEN_AST.forEach(function (a) { arterien.push({ id: a.id, pts: kopie(a.pts), r0: a.r0, r1: a.r1 }); });
  var venen = [{ id: 'mesenterica-superior-vene', pts: umkehr(SMV_PTS), r0: 0.4, r1: 0.5 }];   /* Fliessrichtung: von der Bauhin-Klappe zur Leber */
  var ive = IMV_PTS.map(function (p) { return p.slice(); }), milzM = amBogen(kurve(GE.pfortader[1].pts, 12), LE.STUMPF - 0.2);
  ive[ive.length - 1] = milzM;
  venen.push({ id: 'mesenterica-inferior-vene', pts: ive, r0: 0.25, r1: 0.32 });
  ARTERIEN_AST.forEach(function (a) { venen.push({ id: a.id + '-vene', pts: umkehr(versatz(a.pts, [0.0, 0.45, -0.4])), r0: a.r1 * 1.2, r1: a.r0 * 1.2 }); });
  /* Aeste des Leer- und Krummdarms: von der oberen Mesenterialarterie ueber die Wurzel und eine Arkade (60 % der Plattenbreite) zur Schlinge */
  var N = 11, arkade = [];
  for (k = 0; k < N; k++) {
    var u = Math.min(g.nu - 1, Math.round((k + 0.5) * g.nu / N)), R = g.wurzel[u], d = g.richtung[u], L = g.laenge[u];
    var M = [R[0] + d[0] * L * 0.6, R[1] + d[1] * L * 0.6, R[2] + d[2] * L * 0.6], E = [R[0] + d[0] * L * 0.97, R[1] + d[1] * L * 0.97, R[2] + d[2] * L * 0.97];
    var S0 = naechster(sma, R), w = [R[0] + d[0] * L * 0.15, R[1] + d[1] * L * 0.15, R[2] + d[2] * L * 0.15];
    var pk = [S0, w, M, E];
    arterien.push({ id: 'darmast-' + (k + 1), pts: pk, r0: 0.13, r1: 0.08 });
    arkade.push(M);
    var V0 = naechster(smv, R);
    venen.push({ id: 'darmvene-' + (k + 1), pts: [[E[0] + 0.4, E[1], E[2]], [M[0] + 0.4, M[1], M[2]], [w[0] + 0.4, w[1], w[2]], V0], r0: 0.1, r1: 0.14 });   /* neben der Arterie, in Fliessrichtung zur Wurzel */
  }
  arterien.push({ id: 'arkade', pts: kurve(arkade, 4), r0: 0.07, r1: 0.07 });
  var pf = GE.pfortader.map(function (q) { return { id: q.id, pts: (q.id === 'pfortaderStamm' || q.id === 'mesenterialvene') ? kopie(q.pts) : LE.stumpf(q.pts, LE.STUMPF), r0: q.r0, r1: q.r1 }; });
  return { darmarterien: arterien, darmvenen: venen, pfortader: pf };
}

/* ---- Kennpunkte des Darms ----
   darmKennpunkte() -> { PAPILLE, FLEXUR, BAUHIN, AFTER, DUENN_SCHNITT, ... } je { p } (PAPILLE mit richtung und r wie in der Leberform, DUENN_SCHNITT mit s0, s1 = Bereich der
   Mittellinie des Duenndarms in cm ab der Flexur); Mittellinien mit Bogenlaenge: duenndarm().achse / dickdarm().achse (punkt(s), richtung(s)),
   Abschnittsgrenzen: duenndarm().leerEnde und dickdarm().abschnitte */
function darmKennpunkte() {
  var LE = Kern.Formen && Kern.Formen.leber;
  if (!LE) throw new Error('Die Kennpunkte des Darms brauchen die Form der Leber (Papille), sie ist nicht geladen.');
  var du = duennZustand(), dk = dickZustand();
  return {
    PAPILLE: { p: LE.PAPILLE.p.slice(), richtung: LE.PAPILLE.richtung.slice(), r: LE.PAPILLE.r },
    GANGENDEN: { gallengang: LE.GEFAESSE.gallengang.filter(function (g) { return g.id === 'hauptgallengang'; })[0].pts.slice(-1)[0].slice(), pankreasgang: LE.GEFAESSE.pankreasgang[0].pts.slice(-1)[0].slice() },
    FLEXUR: { p: FLEXUR.p.slice() }, BAUHIN: { p: BAUHIN.p.slice() }, AFTER: { p: AFTER.p.slice() },
    DUENN_SCHNITT: { p: DUENN_SCHNITT.p.slice(), s0: DUENN_SCHNITT.s0, s1: DUENN_SCHNITT.s1 },
    BLINDDARM: { p: dk.A.punkt(0) }, WURMFORTSATZ: { p: WURM_PTS[WURM_PTS.length - 1].slice() },
    MASTDARM: { p: dk.A.punkt(dk.s.mastdarm) }, ANALKANAL: { p: dk.A.punkt(dk.s.kanal) }, LEERDARM: { p: du.A.punkt(du.sLeer / 2) }, KRUMMDARM: { p: du.A.punkt((du.sLeer + du.L) / 2) }
  };
}

Kern.form('verdauung', {
  BAHN: BAHN, magen: magen, magenGrenzen: magenGrenzen, schichten: schichten, lumen: lumen, aussen: aussen, schichtFeld: schichtFeld, schnittZ: schnittZ, abbilden: abbilden,
  mittellinie: mittellinie, kurvaturen: kurvaturen, kennpunkte: kennpunkte, schnitt: schnitt,
  EINGANG: EINGANG, PFOERTNER: PFOERTNER, FUNDUS: FUNDUS, ANGULUS: ANGULUS,
  gefaesse: gefaesse, zwerchfell: zwerchfell, speiseroehreAnzeige: speiseroehreAnzeige, kurve: kurve, kette: kette,
  BAUHIN: BAUHIN, AFTER: AFTER, DUENN_R: DUENN_R, zwoelffingerdarm: zwoelffingerdarm, duenndarm: duenndarm, dickdarm: dickdarm, wurmfortsatz: wurmfortsatz, Achse: Achse,
  duennSchichten: duennSchichten, blinddarmSchichten: blinddarmSchichten, mastdarmSchichten: mastdarmSchichten, zwoelffingerdarmSchichten: zwoelffingerdarmSchichten, gekroese: gekroese, darmGefaesse: darmGefaesse, darmKennpunkte: darmKennpunkte, FLEXUR: FLEXUR
});
})();
