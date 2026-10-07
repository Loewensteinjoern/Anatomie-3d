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
  harnleiterKoerper: [anatomisch([-1.6, -0.5, 0]), anatomisch([-3.0, -1.75, 0])]
});
})();
