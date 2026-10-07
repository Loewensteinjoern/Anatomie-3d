/* ==========================================================================
   Niere - Form: Aussenform der Niere als Baustein fuer den Koerper (und
   spaeter das Detailmodell der Niere). Signed-Distance-Feld, Einheit cm,
   Innen < 0, aus den Bausteinen von Kern.SDF (core/sdf.js).
   Klassisches Skript (kein Modul). Beim Laden wird nur die Form mit Kern.form
   angemeldet, nichts aufgebaut; keine globalen Namen. Geladen wird sie ueber
   Kern.FORMEN/Kern.formLaden (core/rahmen.js).

   Lokale (aufrechte) Achsen, Mitte der Niere im Ursprung:
     y  Laengsachse (oben +)
     x  + lateral (konvexer Rand), - medial (Hilus)
     z  + vorn
   Anatomische Achsen wie im Koerper (x + links, y oben, z vorn), relativ zur
   Mitte der LINKEN Niere: die Laengsachse ist um z gekippt (oberer Pol nach
   medial, LAGE.kipp) und um y gedreht (Hilus nach vorn-medial, LAGE.dreh):
     anatomisch = Ry(dreh) * Rz(kipp) * lokal       (Winkel in Grad)
   Die rechte Niere ist die an der Koerpermitte gespiegelte linke (x -> -x).

   Ausser der Aussenform (fuer den Koerper) enthaelt die Form alles fuer das
   Detailmodell der Niere (Frontalschnitt in der lokalen Ebene z = 0): Sinus,
   Gewebe (Parenchym), Pyramiden, Nierenkelche, Nierenbecken, Harnleiter,
   Nebenniere und den Gefaessbaum. Die Funktionen dazu arbeiten in LOKALEN
   Achsen; anatomisch() rechnet Punkte und Richtungen um. Alles Rechenintensive
   (Pyramiden, Gefaesse) entsteht erst beim ersten Gebrauch, nicht beim Laden.
   ========================================================================== */
(function () {
'use strict';
var S = Kern.SDF;

var LY = 5.6;                                   /* halbe Laenge (cm) */
var LAGE = { kipp: 10, dreh: 25 };              /* Lage der linken Niere im Koerper (Grad) */
var cK = Math.cos(LAGE.kipp * Math.PI / 180), sK = Math.sin(LAGE.kipp * Math.PI / 180);
var cD = Math.cos(LAGE.dreh * Math.PI / 180), sD = Math.sin(LAGE.dreh * Math.PI / 180);

/* lokal -> anatomisch: erst um z kippen, dann um y drehen; [x, y, z] -> [x, y, z] */
function anatomisch(p) {
  var x = p[0] * cK - p[1] * sK, y = p[0] * sK + p[1] * cK;
  return [x * cD + p[2] * sD, y, -x * sD + p[2] * cD];
}
/* anatomisch -> lokal (Umkehrung von anatomisch) */
function lokal(p) {
  var x = p[0] * cD - p[2] * sD, z = p[0] * sD + p[2] * cD;
  return [x * cK + p[1] * sK, -x * sK + p[1] * cK, z];
}

/* Aussenform in lokalen Achsen: Bohne mit Hilus-Einbuchtung, geschlossen (ohne Innenraum) */
function aussenLokal(x, y, z) {
  var t = Math.max(-1, Math.min(1, y / LY));
  var bulge = 0.85 * (1 - t * t);                                    // Mitte nach lateral: medialer Rand hohl (Bohnenform)
  var rx = 2.75 * (1 + 0.05 * t), rz = 1.8 * (1 + 0.07 * t);
  var d = S.ellipsoid(x - bulge, y, z, 0, 0, 0, rx, LY, rz);
  return S.smax(d, -S.ellipsoid(x, y, z, -2.75, -0.3, 0, 1.4, 1.65, 0.95), 0.55);   // Hilus
}

/* Aussenform in anatomischen Achsen (relativ zur Mitte der linken Niere): der Punkt wird in die lokalen Achsen gedreht */
function aussen(x, y, z) {
  var u = x * cD - z * sD, w = x * sD + z * cD;
  return aussenLokal(u * cK + y * sK, -u * sK + y * cK, w);
}

/* ---- Detailmodell (lokale Achsen, Schnittebene z = 0) ---- */

/* Sinus renalis: Hohlraum im Inneren, zum Hilus offen */
var SC = [-0.7, -0.25];                         /* Mitte des Sinus */
function sinus(x, y, z) {
  var d = S.ellipsoid(x, y, z, SC[0], SC[1], 0, 1.45, 3.0, 0.95);
  return S.smin(d, S.ellipsoid(x, y, z, -2.25, -0.3, 0, 1.2, 1.45, 0.85), 0.6);
}
/* Nierengewebe: Aussenform ohne Sinus. Weit weg vom Sinus (Kugel SB) hat er keinen Einfluss auf das Vorzeichen: dann gilt die
   Aussenform (im Inneren dann nur ein Naeherungswert, die Flaeche aendert sich nicht). */
var SB = [SC[0], SC[1], 0, 3.2];
function parenchym(x, y, z) {
  var a = aussenLokal(x, y, z), ex = x - SB[0], ey = y - SB[1];
  if (Math.sqrt(ex * ex + ey * ey + z * z) - SB[3] > 0.6) return a;
  return S.smax(a, -sinus(x, y, z), 0.35);
}

/* Pyramiden (Mark): Achsen in der Frontalebene, Winkel ab +x (lateral) gegen den Uhrzeigersinn. Pyramide i: Spitze (Papille)
   auf der Sinus-Ellipse (Parameterwinkel a), Basis auf einem Strahl aus KM (Winkel b) in der Tiefe RINDE unter der Aussenflaeche;
   Achse u = von der Spitze zur Basis. Entsteht erst beim ersten Gebrauch (pyr()). */
var RINDE = 0.8;                                /* Rindendicke unter der Kapsel (cm) */
var KM = [0.65, -0.1];
var PAARE = [[98, 92], [60, 62], [22, 24], [-16, -14], [-54, -52], [-92, -88]];   /* [b, a] in Grad */
var PYR = null;
function pyr() {
  if (PYR) return PYR;
  PYR = PAARE.map(function (q) {
    var b = q[0] * Math.PI / 180, a = q[1] * Math.PI / 180;
    var apex = [SC[0] + 1.45 * 0.88 * Math.cos(a), SC[1] + 3.0 * 0.92 * Math.sin(a), 0];
    var s = 0;
    while (aussenLokal(KM[0] + Math.cos(b) * s, KM[1] + Math.sin(b) * s, 0) < -RINDE) s += 0.01;
    var basis = [KM[0] + Math.cos(b) * s, KM[1] + Math.sin(b) * s, 0];
    var ux = basis[0] - apex[0], uy = basis[1] - apex[1], l = Math.hypot(ux, uy);
    ux /= l; uy /= l;
    return { w: q[0], u: [ux, uy, 0], apex: apex, basis: basis, lang: l, rb: 0 };
  });
  PYR.forEach(function (P, i) {
    var ab = function (Q) { return Math.hypot(Q.basis[0] - P.basis[0], Q.basis[1] - P.basis[1]); };
    var n = [PYR[i - 1], PYR[i + 1]].filter(Boolean).map(ab);
    P.rb = Math.max(0.45, Math.min(0.95, Math.min.apply(null, n) / 2 - 0.2));
    /* dieselben Daten in anatomischen Achsen (anatomisch ist eine Drehung: gilt auch fuer die Richtung u) */
    P.apexA = anatomisch(P.apex); P.basisA = anatomisch(P.basis); P.uA = anatomisch(P.u);
    /* Kugel um den kleinen Kelch (Becher und Hals): weit ausserhalb muss er nicht ausgewertet werden */
    var c0 = [P.apex[0] + P.u[0] * 0.3, P.apex[1] + P.u[1] * 0.3], z1 = zielKelch(i);
    P.kb = [(c0[0] + z1[0]) / 2, (c0[1] + z1[1]) / 2, Math.hypot(c0[0] - z1[0], c0[1] - z1[1]) / 2 + 0.62];
  });
  return PYR;
}
function pyramide(i, x, y, z, a) {   /* a: Aussenform an dieser Stelle, falls schon berechnet (spart die Auswertung bei Schleifen ueber alle Pyramiden) */
  var P = pyr()[i], u = P.u;
  var bx = P.basis[0] + u[0] * 0.8, by = P.basis[1] + u[1] * 0.8;   /* ueber die Basis hinaus, dann an der Rindengrenze gekappt */
  var d = S.kapsel(x, y, z, bx, by, 0, P.apex[0], P.apex[1], 0, P.rb * 1.25, 0.2);
  return S.smax(d, (a === undefined ? aussenLokal(x, y, z) : a) + RINDE, 0.15);
}

/* Nierenkelche, Nierenbecken, Harnleiter (das Hohlsystem, das den Harn ableitet) */
var BECKEN = [-1.6, -0.5, 0];
var UR0 = [-3.0, -1.75, 0], UR1 = [-3.45, -3.0, 0.1], UR2 = [-3.55, -6.2, 0.3];
var OBEN = [-0.75, 1.25, 0], MITTE = [-0.65, -0.35, 0], UNTEN = [-0.75, -1.85, 0];   /* Treffpunkte der grossen Kelche */
function zielKelch(i) { var w = pyr()[i].w; return w > 45 ? OBEN : (w < -45 ? UNTEN : MITTE); }
/* kleiner Kelch um die Papille der Pyramide i: Becher, Hals zum grossen Kelch. Ab 0,5 cm Abstand zaehlt die Papille nicht mehr
   (dann nur eine untere Schranke: spart die Pyramide in der Auswertung, die Flaeche aendert sich nicht) */
function kelchKlein(i, x, y, z) {
  var P = pyr()[i], u = P.u, a = P.apex, kb = P.kb, ex = x - kb[0], ey = y - kb[1], dk = Math.sqrt(ex * ex + ey * ey + z * z) - kb[2];
  if (dk > 0.5) return dk;                                                  /* weit ausserhalb: untere Schranke genuegt */
  var c0x = a[0] + u[0] * 0.3, c0y = a[1] + u[1] * 0.3, c1x = a[0] - u[0] * 0.3, c1y = a[1] - u[1] * 0.3;
  var d = S.kapsel(x, y, z, c0x, c0y, 0, c1x, c1y, 0, 0.52, 0.34);          /* Becher um die Papille */
  var z1 = zielKelch(i);
  d = S.smin(d, S.kapsel(x, y, z, c1x, c1y, 0, z1[0], z1[1], 0, 0.26, 0.32), 0.2);   /* Hals zum grossen Kelch */
  if (d > 0.5) return d;
  return S.smax(d, -(pyramide(i, x, y, z) - 0.05), 0.05);                   /* Papille ragt hinein */
}
var KGB = (function () {   /* Kugel um die grossen Kelche */
  var p = [OBEN, MITTE, UNTEN, BECKEN], c = [0, 0, 0], r = 0, i, k;
  for (i = 0; i < p.length; i++) for (k = 0; k < 3; k++) c[k] += p[i][k] / p.length;
  for (i = 0; i < p.length; i++) r = Math.max(r, Math.hypot(p[i][0] - c[0], p[i][1] - c[1], p[i][2] - c[2]));
  return [c[0], c[1], c[2], r + 0.6];
})();
var URB = [(UR0[0] + UR2[0]) / 2, (UR0[1] + UR2[1]) / 2, (UR0[2] + UR2[2]) / 2,
  Math.hypot(UR0[0] - UR2[0], UR0[1] - UR2[1], UR0[2] - UR2[2]) / 2 + 0.6];   /* Kugel um den Harnleiter */
function kelchGross(x, y, z) {
  var ex = x - KGB[0], ey = y - KGB[1], ez = z - KGB[2], dk = Math.sqrt(ex * ex + ey * ey + ez * ez) - KGB[3];
  if (dk > 0.5) return dk;
  var d = S.kapsel(x, y, z, OBEN[0], OBEN[1], 0, BECKEN[0] + 0.1, BECKEN[1] + 0.4, 0, 0.32, 0.45);
  d = S.smin(d, S.kapsel(x, y, z, MITTE[0], MITTE[1], 0, BECKEN[0] + 0.2, BECKEN[1], 0, 0.32, 0.45), 0.2);
  return S.smin(d, S.kapsel(x, y, z, UNTEN[0], UNTEN[1], 0, BECKEN[0] + 0.1, BECKEN[1] - 0.4, 0, 0.32, 0.45), 0.2);
}
function becken(x, y, z) {
  var d = S.ellipsoid(x, y, z, BECKEN[0], BECKEN[1], BECKEN[2], 0.85, 1.1, 0.55);
  return S.smin(d, S.kapsel(x, y, z, BECKEN[0], BECKEN[1], 0, UR0[0], UR0[1], UR0[2], 0.55, 0.3), 0.4);
}
/* Mittellinie des Harnleiters: quadratische Kurve durch UR0, UR1, UR2 (Stuetzstellen bei 0, 0,5 und 1), in kurzen Stuecken; die Knicke der
   zwei Strecken fallen so weg */
var URP = (function () {
  var n = 10, p = [], i, k;
  for (i = 0; i <= n; i++) {
    var s = i / n, a = 2 * (s - 0.5) * (s - 1), b = -4 * s * (s - 1), c = 2 * s * (s - 0.5), q = [];
    for (k = 0; k < 3; k++) q.push(UR0[k] * a + UR1[k] * b + UR2[k] * c);
    p.push(q);
  }
  return p;
})();
function harnleiter(x, y, z) {
  var ex = x - URB[0], ey = y - URB[1], ez = z - URB[2], dk = Math.sqrt(ex * ex + ey * ey + ez * ez) - URB[3];
  if (dk > 0.5) return dk;
  var d = 1e9, n = URP.length - 1;
  for (var i = 0; i < n; i++) {
    var a = URP[i], b = URP[i + 1], v = S.kapsel(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], i < 3 ? 0.3 - 0.01 * i : 0.28);
    if (v < d) d = v;
  }
  return d;
}
function hohlsystem(x, y, z) {
  var d = S.smin(becken(x, y, z), kelchGross(x, y, z), 0.3), P = pyr(), n = P.length;
  for (var i = 0; i < n; i++) {
    var kb = P[i].kb, ex = x - kb[0], ey = y - kb[1], dk = Math.sqrt(ex * ex + ey * ey + z * z) - kb[2];
    if (dk > 0.5) { if (dk < d) d = dk; continue; }   /* weit weg vom kleinen Kelch: untere Schranke genuegt */
    d = S.smin(d, kelchKlein(i, x, y, z), 0.12);
  }
  return Math.min(d, harnleiter(x, y, z));
}
/* Nebenniere (links: halbmondfoermig auf dem oberen Pol, medial) */
function nebenniere(x, y, z) {
  var d = S.ellipsoid(x, y, z, -1.0, 4.95, 0.15, 1.45, 1.3, 0.5);
  return S.smax(d, -(aussenLokal(x, y, z) - 0.06), 0.3);
}

/* Einteilung des Gewebes an einem Punkt: 'leer' (ausserhalb), 'sinus' (Hohlraum), 'kapsel' (aeusserste 0,06 cm), 'papillen'
   (letzte 0,45 cm einer Pyramide vor der Spitze), 'pyramiden', 'saeulen' (Rindengewebe tiefer als RINDE + 0,15 cm), 'rinde' */
function region(x, y, z) {
  var a = aussenLokal(x, y, z);
  if (a > 0) return 'leer';
  if (parenchym(x, y, z) > 0) return 'sinus';
  if (a > -0.06) return 'kapsel';
  var P = pyr();
  for (var i = 0; i < P.length; i++) {
    if (pyramide(i, x, y, z, a) < 0) return (x - P[i].apex[0]) * P[i].u[0] + (y - P[i].apex[1]) * P[i].u[1] < 0.45 ? 'papillen' : 'pyramiden';
  }
  return a < -(RINDE + 0.15) ? 'saeulen' : 'rinde';
}

/* Gefaessbaum in der Schnittebene: Linien { art: 'arterie' | 'vene', stufe: 'arterie' | 'vene' | 'interlobaer' | 'bogen' | 'interlobular',
   r (groesster Radius, cm), pts: [[x, y, z], ...], optional rt: [[t, faktor], ...] (Radius = r * faktor an der Stelle t = 0..1 der
   Linie, dazwischen weich; sonst gleichbleibend) }. 'arterie'/'vene' = Nierenarterie/-vene mit den Segmentgefaessen durch den Sinus. */
function normale2(x, y) {   /* Gradient der Aussenform in der Frontalebene (nach aussen) */
  var e = 0.01, gx = aussenLokal(x + e, y, 0) - aussenLokal(x - e, y, 0), gy = aussenLokal(x, y + e, 0) - aussenLokal(x, y - e, 0), l = Math.hypot(gx, gy) || 1;
  return [gx / l, gy / l];
}
function aufTiefe(p, tiefe) {   /* Punkt p entlang der Normalen auf die Tiefe "tiefe" unter die Aussenflaeche schieben */
  var q = p.slice();
  for (var k = 0; k < 30; k++) {
    var d = aussenLokal(q[0], q[1], 0) + tiefe, n = normale2(q[0], q[1]);
    q = [q[0] - n[0] * d, q[1] - n[1] * d, 0];
    if (Math.abs(d) < 1e-3) break;
  }
  return q;
}
function gefaesse() {
  var L = [], P = pyr(), n = P.length, i, k;
  var ART = { teil: [-1.85, 0.35, 0.3], hilus: [-4.1, 0.45, 0.4], aussen: [-5.3, 0.55, 0.45] };
  var VEN = { teil: [-1.95, -0.05, 0.62], hilus: [-4.1, -0.05, 0.75], aussen: [-5.3, -0.05, 0.85] };
  L.push({ art: 'arterie', stufe: 'arterie', r: 0.26, pts: [ART.aussen, ART.hilus, ART.teil] });
  L.push({ art: 'vene', stufe: 'vene', r: 0.36, pts: [VEN.aussen, VEN.hilus, VEN.teil] });
  /* Luecken zwischen benachbarten Pyramiden (i, i + 1): dort steigen die Zwischenlappengefaesse auf */
  for (i = 0; i < n - 1; i++) {
    var A = P[i], B = P[i + 1];
    var s0 = [(A.apex[0] + B.apex[0]) / 2, (A.apex[1] + B.apex[1]) / 2, 0];
    var bm = [(A.basis[0] + B.basis[0]) / 2, (A.basis[1] + B.basis[1]) / 2, 0];
    var e0 = aufTiefe(bm, RINDE + 0.05);
    /* Startpunkt an der Sinuswand: von s0 Richtung e0, bis das Gewebe beginnt */
    var dx = e0[0] - s0[0], dy = e0[1] - s0[1], dl = Math.hypot(dx, dy);
    dx /= dl; dy /= dl;
    var t = 0;
    while (parenchym(s0[0] + dx * t, s0[1] + dy * t, 0) > 0 && t < dl) t += 0.02;
    var st = [s0[0] + dx * t, s0[1] + dy * t, 0];
    var quer = [-dy, dx];   /* in der Ebene quer zur Richtung: die Vene liegt daneben */
    [['arterie', -0.1, 0.07, 0.3], ['vene', 0.11, 0.08, 0.62]].forEach(function (g) {
      var art = g[0], off = g[1], r = g[2], rz = g[3];
      var o = function (p) { return [p[0] + quer[0] * off, p[1] + quer[1] * off, 0]; };
      var T = art === 'arterie' ? ART.teil : VEN.teil;
      var mitte = [(T[0] + st[0]) / 2, (T[1] + st[1]) / 2, rz * 0.9];
      /* Segmentgefaess durch den Sinus: verjuengt sich auf den Radius des Zwischenlappengefaesses (r); dieses auf den des Bogengefaesses (0,7 r) */
      L.push({ art: art, stufe: art, r: r * 1.5, rt: [[0, 1], [0.3, 1], [1, 1 / 1.5]], pts: [T, mitte, [st[0] - dx * 0.25 + quer[0] * off, st[1] - dy * 0.25 + quer[1] * off, rz * 0.3], o(st)] });
      L.push({ art: art, stufe: 'interlobaer', r: r, rt: [[0, 1], [0.4, 1], [1, 0.7]], pts: [o(st), o([(st[0] + e0[0]) / 2, (st[1] + e0[1]) / 2, 0]), o(e0)] });
      /* Bogengefaesse ueber die Basis der beiden Nachbarpyramiden (je bis kurz vor deren Mitte) */
      [A, B].forEach(function (Q) {
        var bogen = [], schritte = 8, zielB = aufTiefe(Q.basis, RINDE + 0.05);
        for (var m = 0; m <= schritte; m++) {
          var f = m / schritte * 0.88;
          bogen.push(aufTiefe([e0[0] + (zielB[0] - e0[0]) * f, e0[1] + (zielB[1] - e0[1]) * f, 0], RINDE + 0.05 + (art === 'vene' ? 0.1 : 0)));
        }
        L.push({ art: art, stufe: 'bogen', r: r * 0.7, pts: bogen });
        /* Rindengefaesse: alle ~0,45 cm vom Bogen nach aussen bis 0,15 cm unter die Kapsel */
        for (var m2 = 2; m2 <= schritte; m2 += 3) {
          var q = bogen[m2], nn = normale2(q[0], q[1]);
          var p1 = aufTiefe([q[0] + nn[0] * 0.3, q[1] + nn[1] * 0.3, 0], 0.15);
          /* Rindengefaess: geht mit dem Radius des Bogengefaesses (0,7 r) ab und wird zu 0,42 r schmal */
          L.push({ art: art, stufe: 'interlobular', r: r * 0.7, rt: [[0, 1], [0.5, 0.6], [1, 0.6]], pts: [q, [(q[0] + p1[0]) / 2, (q[1] + p1[1]) / 2, 0], p1] });
        }
      });
    });
  }
  return L;
}
/* dieselben Linien in anatomischen Achsen */
function gefaesseAnatomisch() {
  return gefaesse().map(function (l) { return { art: l.art, stufe: l.stufe, r: l.r, rt: l.rt, pts: l.pts.map(anatomisch) }; });
}

Kern.form('niere', {
  aussen: aussen,
  aussenLokal: aussenLokal,
  lokal: lokal,
  anatomisch: anatomisch,
  LAGE: LAGE,
  /* Bounding-Box der Aussenform in anatomischen Achsen mit 0,3 cm Rand: [[x0, y0, z0], [x1, y1, z1]] (Gitter fuer Kern.SDF.makeGrid);
     der Rand haelt die aeussersten Gitterpunkte ausserhalb der Form, sonst bleibt das Netz an den Polen offen */
  grenzen: [[-2.47, -5.84, -2.67], [3.70, 5.84, 2.05]],
  /* Anfang des Harnleiters fuer den Koerper, anatomisch: Nierenbecken im Hilus (lokal (-1.6, -0.5, 0)) und Austritt aus dem
     Hilus (lokal (-3.0, -1.75, 0)); die geschlossene Aussenform enthaelt kein Nierenbecken: der erste Punkt liegt in der
     Hilus-Mulde (ca. 0,24 cm vor ihrem Grund), der Harnleiter tritt von dort aus */
  harnleiterKoerper: [anatomisch([-1.6, -0.5, 0]), anatomisch([-3.0, -1.75, 0])],

  /* ---- Detailmodell: alle Funktionen in LOKALEN Achsen (x, y, z in cm, Innen < 0), Schnittebene z = 0 ---- */
  /* Normale der Schnittebene in anatomischen Achsen (= anatomisch((0, 0, 1)), zeigt nach vorn-lateral); die vordere Haelfte
     (Deckel) liegt auf der Seite n * p > 0 */
  SCHNITT_N: anatomisch([0, 0, 1]),
  LY: LY, RINDE: RINDE, KM: KM, SC: SC,
  BECKEN: BECKEN, UR0: UR0, UR1: UR1, UR2: UR2, OBEN: OBEN, MITTE: MITTE, UNTEN: UNTEN,
  URP: URP,   /* Mittellinie des Harnleiters in kurzen Stuecken (lokal), URP[0] = UR0, URP[10] = UR2 */
  /* Pyramiden (entstehen beim ersten Zugriff): { w, u, apex, basis, lang, rb, apexA, basisA, uA } (A = anatomisch) */
  get PYR() { return pyr(); },
  sinus: sinus, parenchym: parenchym, pyramide: pyramide,
  kelchKlein: kelchKlein, kelchGross: kelchGross, becken: becken, harnleiter: harnleiter, hohlsystem: hohlsystem,
  nebenniere: nebenniere, region: region,
  gefaesse: gefaesse, gefaesseAnatomisch: gefaesseAnatomisch,
  /* Bounding-Boxen in lokalen Achsen mit 0,3 cm Rand je Teil: [[x0, y0, z0], [x1, y1, z1]] */
  grenzenLokal: { gewebe: [[-2.15, -5.85, -2.1], [3.9, 5.9, 2.1]], hohl: [[-4.1, -6.75, -0.95], [1.5, 3.5, 0.95]], nebenniere: [[-2.75, 3.6, -0.65], [0.35, 6.55, 0.9]] }
});
})();
