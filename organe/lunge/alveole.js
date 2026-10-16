/* =====================================================================
   Alveole - Lungenbläschen und Gasaustausch
   Ein Alveolarsäckchen stark vergrößert (Modelleinheit 1 = 0,1 mm, also 100 µm; eine Alveole misst 0,2-0,3 mm, Radius 1,1-1,5): Bronchiolus
   respiratorius von oben, Alveolargang mit Alveolen ringsum, darunter das Säckchen als Traube verschmolzener Bläschen (Wand als dünne Schale),
   eine Alveole vorn aufgeschnitten, das Kapillarnetz auf der Außenseite (blau auf der Seite der Lungenarterie, rot auf der der Lungenvene) und
   die zuführenden und abführenden Gefäße. Achsen wie im Körper: x + links im Bild nach rechts, y oben, z zur Kamera. Alles aus Abstandsfeldern
   (Kern.SDF) und festen Tabellen, ohne Zufall.
   Grundgerüst: Strukturen, Ausschnitte, Durchsicht, aufgeschnitten/geschlossen, Beschriftung, Infokarte, Strukturliste. Andockpunkte für später:
   KAP_BAHNEN (Kapillarbahnen um die aufgeschnittene Alveole für die roten Blutkörperchen) und OFFEN (Innenraum für die Gasteilchen), beide
   in AlveoleApp.daten; Teilchen kommen in eine eigene Gruppe `dyn` (noexport) und werden je Bild aus der Uhr gesetzt. organ.start für die Kamerafahrt.
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col), Text und Fakten der Infokarte.
   ===================================================================== */
var STRUKTUREN = [
  { id: 'bronchiolus', de: 'Bronchiolus respiratorius', lat: 'Bronchiolus respiratorius', grp: 'Atemwege', col: 0xBAC6C4,
    txt: 'Feinster Ast des Bronchialbaums, weniger als 0,5 mm weit. In seiner Wand sitzen schon die ersten Lungenbläschen – hier beginnt der Abschnitt, in dem Gasaustausch stattfindet. Knorpel gibt es hier nicht mehr.',
    facts: { 'Weite': 'unter 0,5 mm', 'Wand': 'ohne Knorpel, mit ersten Alveolen', 'Danach': 'Alveolargang' } },
  { id: 'gang', de: 'Alveolargang', lat: 'Ductus alveolaris', grp: 'Atemwege', col: 0xA9B7B5,
    txt: 'Kurzer Gang, dessen Wand ringsum aus Lungenbläschen besteht. Er führt die Luft in die Alveolarsäckchen.',
    facts: { 'Wand': 'ringsum Alveolen', 'Führt zu': 'Alveolarsäckchen' } },
  { id: 'alveolen', de: 'Alveolen (Lungenbläschen)', lat: 'Alveoli pulmonales', grp: 'Alveolen', col: 0xE6C7C9,
    txt: 'Winzige, dünnwandige Luftbläschen am Ende der Atemwege, traubenförmig zu Alveolarsäckchen gruppiert. Beide Lungen haben rund 300 Millionen davon – ausgebreitet etwa die Fläche eines halben Tennisplatzes. Durch ihre hauchdünne Wand wandern Sauerstoff und Kohlendioxid.',
    facts: { 'Durchmesser': 'ca. 0,2–0,3 mm', 'Anzahl': 'ca. 300 Millionen', 'Fläche': 'ca. 100 m²' } },
  { id: 'alveoleOffen', de: 'Aufgeschnittene Alveole', lat: 'Alveolus pulmonis', grp: 'Alveolen', col: 0xDDB9BC,
    txt: 'Eine Alveole ist hier aufgeschnitten, damit man hineinsehen kann. Innen ist Luft; die Wand ist nur Bruchteile eines Tausendstelmillimeters dick und innen von einem Flüssigkeitsfilm mit Surfactant ausgekleidet, der das Bläschen vor dem Zusammenfallen schützt.',
    facts: { 'Inhalt': 'Luft', 'Wand': 'hauchdünn', 'Innen': 'Surfactant-Film' } },
  { id: 'kapillaren', de: 'Kapillarnetz', lat: 'Rete capillare', grp: 'Blutgefäße', col: 0xB04A55,
    txt: 'Ein dichtes Netz feinster Blutgefäße umspinnt jede Alveole. Hier liegen Luft und Blut nur durch eine hauchdünne Wand getrennt – hier findet der Gasaustausch statt. Ein rotes Blutkörperchen braucht für den Weg um eine Alveole weniger als eine Sekunde.',
    facts: { 'Durchmesser': 'ca. 5–8 µm', 'Kontaktzeit': 'unter 1 Sekunde', 'Aufgabe': 'Gasaustausch' } },
  { id: 'arteriole', de: 'Ast der Lungenarterie', lat: 'Arteriola pulmonalis', grp: 'Blutgefäße', col: 0x3F63B5,
    txt: 'Bringt sauerstoffarmes Blut aus der rechten Herzkammer zu den Alveolen. Deshalb ist es hier blau dargestellt.',
    facts: { 'Blut': 'sauerstoffarm', 'Kommt aus': 'rechter Herzkammer' } },
  { id: 'venole', de: 'Ast der Lungenvene', lat: 'Venula pulmonalis', grp: 'Blutgefäße', col: 0xC8372D,
    txt: 'Sammelt das mit Sauerstoff beladene Blut aus dem Kapillarnetz und führt es über die Lungenvenen zum linken Vorhof.',
    facts: { 'Blut': 'sauerstoffreich', 'Fließt zu': 'linkem Vorhof' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Lunge &middot; Alveole</div>
  <h1>Lungenbl&auml;schen &amp; <em>Gasaustausch</em></h1>
  <div class="sub">Hier gelangt Sauerstoff ins Blut und Kohlendioxid hinaus.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">&Uuml;bersicht</button>
    <button id="cam1" class="gh">Alveole</button>
    <button id="cam2" class="gh">Kapillarnetz</button>
    <button id="cam3" class="gh">Bronchiolus</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bOffen" class="gh on" title="Eine Alveole vorn ist aufgeschnitten: Blick ins Innere">Aufgeschnitten</button>
    <button id="bZu" class="gh" title="Alle Alveolen sind geschlossen">Geschlossen</button>
    <span class="sep"></span>
    <button id="bSee" class="gh" title="Die Wand durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
  <!-- Zeile "Gasaustausch" (Pause, Schema) kommt später hierher -->
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#6F93E0">Blau</b> sauerstoffarmes Blut aus der Lungenarterie.<br>
  <b style="color:#E0584C">Rot</b> sauerstoffreiches Blut zur Lungenvene.<br>
  <b style="color:#E8B4B8">Rosa</b> Alveolen, eine ist aufgeschnitten.</p>
  <p class="note">Stark vergr&ouml;&szlig;ert: Eine Alveole ist etwa 0,2&ndash;0,3&nbsp;mm gro&szlig;.</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>`;
var organ = { renderer: {}, aufbauen: aufbauen };
var PI = Math.PI, DEG = PI / 180;
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, Modelleinheiten) und Kamera: gemeinsam fuer das Modell und spaeter fuer die Fahrt aus der Lunge */
var UEBERSICHT = { ext: [10.4, 17.4], halb: 4.6, ziel: [0, 1.6, 0] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer das Modell und die Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 104 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, das Modell steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand, bei dem ext (Breite, Hoehe in Modelleinheiten) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (zwei Zeilen: Desktop 80, Handy 70, dazu je 32,
   wenn eine der Reihen umbricht: unter Breite 379, dann unter 320); aufbauen misst sie selbst, die Werte stimmen ueberein. Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px
   (CSS), bereichFuer schaltet erst darunter um. Kommt die Zeile "Gasaustausch" dazu, muessen die Werte neu gemessen werden. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (70 + (w < 379 ? 32 : 0) + (w < 320 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 80 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: 0, phi: PI / 2, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};

/* =====================================================================
   Form (feste Tabellen, Modelleinheit 0,1 mm): Rohre und Bläschen als Abstandsfeld
   ===================================================================== */
var Y_OBEN0 = 9.6;       /* der Bronchiolus ist hier abgeschnitten (offenes Ende) */
var K_SM = 0.35;         /* Weite der glatten Uebergaenge zwischen den Bläschen */
var ALV = [];            /* Bläschen: { c: Mitte, r: Radius, n: Richtung nach aussen (Einheitsvektor), offen } */
var OFFEN_I = -1;        /* Index der aufgeschnittenen Alveole in ALV */
(function tabelle() {
  function ring(y, n, R, r, a0, offenI) {
    for (var i = 0; i < n; i++) {
      var a = (a0 + 360 * i / n) * DEG, s = Math.sin(a), c = Math.cos(a);
      if (i === offenI) OFFEN_I = ALV.length;
      ALV.push({ c: [R * s, y, R * c], r: r, n: [s, 0, c], offen: i === offenI });
    }
  }
  /* In der Wand des Bronchiolus: drei einzelne Ausbuchtungen */
  [[40, 6.0, 0.9], [-75, 7.3, 0.85], [165, 5.4, 0.85]].forEach(function (q) {
    var a = q[0] * DEG, s = Math.sin(a), c = Math.cos(a);
    ALV.push({ c: [1.2 * s, q[1], 1.2 * c], r: q[2], n: [s, 0, c], offen: false });
  });
  ring(3.6, 4, 1.6, 1.05, 45);       /* Alveolargang: zwei Ringe zu je vier */
  ring(1.6, 4, 1.65, 1.1, 0);
  ring(-0.7, 5, 1.9, 1.3, 36);       /* Alveolarsäckchen: Traube aus 14 Bläschen */
  ring(-2.9, 5, 2.1, 1.45, 0, 0);    /* Bläschen 0 dieses Rings zeigt zur Kamera: die aufgeschnittene Alveole */
  ring(-4.7, 3, 1.5, 1.15, 60);
  ALV.push({ c: [0, -5.3, 0.1], r: 1.25, n: [0, -0.99, 0.12], offen: false });
})();
/* Aufgeschnitten: entfernt wird die vordere Kappe der Alveole OFFEN_I (Kugel um die Alveole, vor der Ebene z = zc) */
var SCHNITT_DZ = 0.3;    /* Ebene liegt so weit vor der Mitte der Alveole */

/* =====================================================================
   Aufbau
   ===================================================================== */
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF;
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Strukturen, Materialien
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var WAND = ['bronchiolus', 'gang', 'alveolen', 'alveoleOffen'];   /* Strukturen der Schale (bei "Durchsicht" Glas) */
var GLAS = 0.3;                                                    /* Deckkraft der Wand bei "Durchsicht" */
var MAT = {};
/* Farbe der Wand je Eckpunkt (vc): Grundfarbe je Struktur, innen etwas dunkler, die Schnittkante hell */
var BASIS = { bronchiolus: srgb(0xB4C3C1), gang: srgb(0xA6B6B4), alveolen: srgb(0xEDBABF), alveoleOffen: srgb(0xE6B0B6) };
var KANTE = srgb(0xFFF3EE);
WAND.forEach(function (sid) { MAT[sid] = mat(0xffffff, { vc: true, rough: 0.5, coat: 0.3, coatRough: 0.45 }); });
MAT.kapillaren = mat(0xffffff, { vc: true, rough: 0.45, coat: 0.2 });
MAT.arteriole = mat(0x3F63B5, { rough: 0.4, coat: 0.3 });
MAT.venole = mat(0xC8372D, { rough: 0.4, coat: 0.3 });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

var root = new THREE.Group(); root.name = 'Alveole'; scene.add(root);
var dyn = new THREE.Group(); dyn.name = 'dyn'; dyn.userData.noexport = true; root.add(dyn);   /* spaeter: Blutkoerperchen und Gasteilchen, je Bild aus der Uhr gesetzt */
var tris = { wand: 0, kapillaren: 0, gefaesse: 0 };
/* zustand: 'zu' = nur geschlossen sichtbar, 'offen' = nur aufgeschnitten sichtbar, sonst immer */
function addMesh(sid, geo, material, name, order, zustand) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order;
  m.userData.sid = sid; STRUCT[sid].meshes.push(m);
  if (zustand) m.userData.zustand = zustand;
  root.add(m);
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var H = klein ? 0.09 : 0.07;     /* Gitterweite der Wand */
var T_WAND = 2.2 * H;            /* Dicke der Schale (zwei Gitterzellen, damit sie dicht bleibt) */
var GITTER = [[-4.0, -7.0, -4.0], [4.0, 9.8, 4.0]];
/* Schnittebenen in die Mitte einer Gitterzelle legen: Surface Nets setzt die Schnittflaeche dann eben und glatt, ohne Zacken */
function mitteZelle(w, achse) { var o = GITTER[0][achse]; return o + (Math.round((w - o) / H - 0.5) + 0.5) * H; }
var Y_OBEN = mitteZelle(Y_OBEN0, 1);

/* ---- Abstandsfeld ---- */
var PK = [];   /* Grundkörper: Rohre und Kugeln; kl = Struktur, zu der ihre Wand zaehlt */
PK.push({ s: false, a: [0, 10.8, 0], b: [0, 4.8, 0], r: 0.9, kl: 'bronchiolus' });
PK.push({ s: false, a: [0, 4.8, 0], b: [0, -0.2, 0], r: 1.0, kl: 'gang' });
PK.push({ s: true, c: [0, -2.8, 0], r: 1.35, kl: 'alveolen' });    /* gemeinsamer Raum des Säckchens */
PK.push({ s: true, c: [0, -4.3, 0], r: 1.0, kl: 'alveolen' });
var PA = PK.length;                                                /* ab hier die Bläschen */
ALV.forEach(function (a, i) { PK.push({ s: true, c: a.c, r: a.r, kl: i === OFFEN_I ? 'alveoleOffen' : 'alveolen' }); });
function dPrim(p, x, y, z) {
  if (p.s) { var dx = x - p.c[0], dy = y - p.c[1], dz = z - p.c[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz) - p.r; }
  return S.kapsel(x, y, z, p.a[0], p.a[1], p.a[2], p.b[0], p.b[1], p.b[2], p.r);
}
/* Luftraum (innen < 0): alle Körper glatt vereinigt */
function U(x, y, z) {
  var d = dPrim(PK[0], x, y, z);
  for (var i = 1; i < PK.length; i++) d = S.smin(d, dPrim(PK[i], x, y, z), K_SM);
  return d;
}
/* welcher Körper ist am naechsten (Index in PK) */
function besitzer(x, y, z) {
  var b = 0, bd = 1e9;
  for (var i = 0; i < PK.length; i++) { var d = dPrim(PK[i], x, y, z); if (d < bd) { bd = d; b = i; } }
  return b;
}
/* Schale: die Wand zwischen U = -T_WAND und U = 0; oben am Bronchiolus abgeschnitten */
function wand(x, y, z) {
  var u = U(x, y, z);
  return Math.max(Math.max(u, -u - T_WAND), y - Y_OBEN);
}
var OF = ALV[OFFEN_I], OF_ZC = mitteZelle(OF.c[2] + SCHNITT_DZ, 2), OF_RC = OF.r + 0.18;
/* entfernte Kappe der aufgeschnittenen Alveole (innen < 0) */
function schnitt(x, y, z) { return Math.max(S.kugel(x, y, z, OF.c[0], OF.c[1], OF.c[2], OF_RC), OF_ZC - z); }

/* Grundfarbe der Wand an einem Punkt: weich ueberblendet zwischen Bronchiolus, Gang, Alveolen und aufgeschnittener Alveole (nach dem Abstand zu den Koerpern),
   unabhaengig davon, zu welchem Teilnetz das Dreieck zaehlt - so bleibt der Uebergang glatt, auch wo die Teilnetze gezackt aneinanderstossen */
var WC = new THREE.Color();
function wandBasis(x, y, z) {
  var dB = 1e9, dG = 1e9, dA = 1e9, dO = 1e9, i, d, p;
  for (i = 0; i < PK.length; i++) {
    p = PK[i]; d = dPrim(p, x, y, z);
    if (p.kl === 'bronchiolus') { if (d < dB) dB = d; } else if (p.kl === 'gang') { if (d < dG) dG = d; }
    else if (p.kl === 'alveoleOffen') { if (d < dO) dO = d; } else if (d < dA) dA = d;
  }
  var sm = function (t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  var wb = sm(0.5 + (dG - dB) / 0.5);                 /* 1 = Bronchiolus */
  var wa = sm(0.5 + (Math.min(dB, dG) - Math.min(dA, dO)) / 0.5);   /* 1 = Bläschen */
  var wo = sm(0.5 + (dA - dO) / 0.5);                 /* 1 = aufgeschnittene Alveole */
  var r = BASIS.gang.r + (BASIS.bronchiolus.r - BASIS.gang.r) * wb, g = BASIS.gang.g + (BASIS.bronchiolus.g - BASIS.gang.g) * wb, b = BASIS.gang.b + (BASIS.bronchiolus.b - BASIS.gang.b) * wb;
  var ar = BASIS.alveolen.r + (BASIS.alveoleOffen.r - BASIS.alveolen.r) * wo, ag = BASIS.alveolen.g + (BASIS.alveoleOffen.g - BASIS.alveolen.g) * wo, ab = BASIS.alveolen.b + (BASIS.alveoleOffen.b - BASIS.alveolen.b) * wo;
  return WC.setRGB(r + (ar - r) * wa, g + (ag - g) * wa, b + (ab - b) * wa);
}

/* Netz in Teilnetze je Struktur zerlegen (Besitzer des Dreiecks) und Eckpunktfarben setzen; nur: nur diese Struktur behalten */
function aufteilen(geo, mitSchnitt, nur) {
  var P = geo.attributes.position.array, N = geo.attributes.normal.array, I = geo.index.array, nT = I.length / 3, t, c, g = {};
  WAND.forEach(function (k) { g[k] = []; });
  for (t = 0; t < nT; t++) {
    var a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, d = I[t * 3 + 2] * 3;
    var k = PK[besitzer((P[a] + P[b] + P[d]) / 3, (P[a + 1] + P[b + 1] + P[d + 1]) / 3, (P[a + 2] + P[b + 2] + P[d + 2]) / 3)].kl;
    if (!nur || k === nur) g[k].push(t);
  }
  var aus = {};
  WAND.forEach(function (kl) {
    var T = g[kl]; if (!T.length) return;
    var map = new Int32Array(P.length / 3).fill(-1), pos = [], nor = [], col = [], idx = [];
    T.forEach(function (tt) {
      for (c = 0; c < 3; c++) {
        var v = I[tt * 3 + c];
        if (map[v] < 0) {
          map[v] = pos.length / 3;
          var x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
          pos.push(x, y, z); nor.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]);
          var u = U(x, y, z), f = u < -T_WAND * 0.5 ? 0.9 : 1, bc = wandBasis(x, y, z);   /* Innenseite (Surfactant-Film) etwas dunkler */
          var ke = Math.max(0, 1 - Math.abs(y - Y_OBEN) / 0.08);
          if (mitSchnitt) ke = Math.max(ke, 1 - Math.abs(schnitt(x, y, z)) / 0.07);
          ke = Math.min(1, Math.max(0, ke)); ke = ke * ke * (3 - 2 * ke);
          col.push(bc.r * f + (KANTE.r - bc.r * f) * ke, bc.g * f + (KANTE.g - bc.g * f) * ke, bc.b * f + (KANTE.b - bc.b * f) * ke);
        }
        idx.push(map[v]);
      }
    });
    var ge = new THREE.BufferGeometry();
    ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    ge.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    ge.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    ge.setIndex(idx);
    aus[kl] = ge;
  });
  geo.dispose();
  return aus;
}

/* Rohre entlang von Linien { pts, r0, r1 }, Radius gleitet von r0 nach r1; Enden mit Kappe; alle zu einer Geometrie */
function rohre(linien) {
  var pos = [], nor = [], idx = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rm = Math.max(l.r0, l.r1), rad = l.seiten || (rm > 0.5 ? 14 : rm > 0.2 ? 10 : 7), tub = l.segmente || Math.max(6, l.pts.length * 5);
    var g = new THREE.TubeGeometry(kurve, tub, rm, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    for (i = 0; i <= tub; i++) {   /* jeden Ring um seine Mitte auf den Radius an dieser Stelle skalieren */
      var f = (l.r0 + (l.r1 - l.r0) * (i / tub)) / rm, c0 = kurve.getPointAt(i / tub);
      for (j = 0; j <= rad; j++) { var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f); }
    }
    for (i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
    for (i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    [[0, -1, 0], [1, 1, tub * (rad + 1)]].forEach(function (e) {   /* [Ort auf der Kurve, Richtung der Kappe, Ring im Rohr] */
      var c = kurve.getPointAt(e[0]), T = kurve.getTangentAt(e[0]), b0 = pos.length / 3;
      pos.push(c.x, c.y, c.z); nor.push(T.x * e[1], T.y * e[1], T.z * e[1]);
      for (j = 0; j < rad; j++) { var v = e[2] + j; pos.push(p.getX(v), p.getY(v), p.getZ(v)); nor.push(T.x * e[1], T.y * e[1], T.z * e[1]); }
      for (j = 0; j < rad; j++) {
        var a = b0 + 1 + j, b = b0 + 1 + (j + 1) % rad;
        var ax = pos[a * 3] - c.x, ay = pos[a * 3 + 1] - c.y, az = pos[a * 3 + 2] - c.z, bx = pos[b * 3] - c.x, by = pos[b * 3 + 1] - c.y, bz = pos[b * 3 + 2] - c.z;
        var zx = ay * bz - az * by, zy = az * bx - ax * bz, zz = ax * by - ay * bx;
        if (zx * T.x * e[1] + zy * T.y * e[1] + zz * T.z * e[1] >= 0) idx.push(b0, a, b); else idx.push(b0, b, a);
      }
    });
    g.dispose();
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return geo;
}

/* ---- Kapillarnetz: Breiten- und Laengenkreise je Bläschen, auf die Aussenseite der Wand projiziert ---- */
var KAP_R = 0.05, KAP_R_OFFEN = 0.06;   /* Radius der Kapillaren */
var BLAU = srgb(0x3F63B5), ROT = srgb(0xC8372D);
function hash(i, j) { var s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); }   /* feste Zufallszahl 0..1 aus (i, j) */
var KAP = { rest: [], kappe: [] };   /* Laeufe { pts, r }: rest = immer sichtbar, kappe = auf der vorderen Kappe der aufgeschnittenen Alveole (nur geschlossen) */
var KAP_PUNKTE = [];                 /* alle Punkte der Laeufe in rest (fuer Anschluesse und Anker) */
var KAP_BAHNEN = [];                 /* Daten fuer die Blutkoerperchen (spaeter): Mittellinien von der Arterienseite (links) zur Venenseite (rechts) um die aufgeschnittene Alveole */
/* Punkt auf der Aussenseite der Wand von Bläschen i in Richtung d (Einheitsvektor von der Mitte); null, wenn dort die Wand eines anderen Körpers liegt */
function flaechenpunkt(i, dx, dy, dz) {
  var a = ALV[i], c = a.c, s = a.r * 0.55, ds = 0.04, smax = a.r + 1.0, x, y, z;
  while (s < smax) { s += ds; if (U(c[0] + dx * s, c[1] + dy * s, c[2] + dz * s) > 0) break; }
  if (s >= smax) return null;
  var lo = s - ds, hi = s;
  for (var k = 0; k < 14; k++) { var m = (lo + hi) / 2; if (U(c[0] + dx * m, c[1] + dy * m, c[2] + dz * m) > 0) hi = m; else lo = m; }
  s = (lo + hi) / 2; x = c[0] + dx * s; y = c[1] + dy * s; z = c[2] + dz * s;
  if (besitzer(x, y, z) !== PA + i) return null;
  var e = 0.03, gx = U(x + e, y, z) - U(x - e, y, z), gy = U(x, y + e, z) - U(x, y - e, z), gz = U(x, y, z + e) - U(x, y, z - e), gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
  return [x + gx / gl * 0.02, y + gy / gl * 0.02, z + gz / gl * 0.02];   /* zur Haelfte in der Wand */
}
function basis(n) {   /* u, v senkrecht zu n; u zeigt bei n = +z nach +x */
  var u = [n[2], 0, -n[0]], l = Math.sqrt(u[0] * u[0] + u[2] * u[2]) || 1;
  u = [u[0] / l, 0, u[2] / l];
  var v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  return { u: u, v: v };
}
/* Folge von Punkten { p, k } (null = Unterbrechung) in Laeufe teilen; beim Wechsel zwischen Kappe und Rest ueberlappen die Laeufe um einen Punkt */
function sammeln(folge, radius) {
  var cur = [], curK = null, prev = null;
  function flush() { if (cur.length >= 2) (curK ? KAP.kappe : KAP.rest).push({ pts: cur, r: radius }); cur = []; }
  folge.forEach(function (e) {
    if (!e) { flush(); curK = null; prev = null; return; }
    if (curK === null) { curK = e.k; cur = [e.p]; }
    else if (e.k === curK) cur.push(e.p);
    else { cur.push(e.p); flush(); curK = e.k; cur = [prev, e.p]; }
    prev = e.p;
  });
  flush();
}
function punkt(i, th, ph) {   /* Punkt { p, k } bei Polarwinkel th (von n) und Umlaufwinkel ph, oder null */
  var a = ALV[i], B = a._b || (a._b = basis(a.n)), st = Math.sin(th), ct = Math.cos(th);
  var dx = a.n[0] * ct + (B.u[0] * Math.cos(ph) + B.v[0] * Math.sin(ph)) * st, dy = a.n[1] * ct + (B.u[1] * Math.cos(ph) + B.v[1] * Math.sin(ph)) * st, dz = a.n[2] * ct + (B.u[2] * Math.cos(ph) + B.v[2] * Math.sin(ph)) * st;
  var p = flaechenpunkt(i, dx, dy, dz);
  if (!p) return null;
  return { p: p, k: i === OFFEN_I && schnitt(p[0], p[1], p[2]) < 0.04 };
}
function kapillarnetz() {
  ALV.forEach(function (a, i) {
    var offen = i === OFFEN_I, rad = offen ? KAP_R_OFFEN : KAP_R, j, k;
    var breiten = offen ? [30, 50, 70, 82, 90, 98, 110, 122] : [35, 60, 85, 110, 135], laengen = offen ? 12 : 7;
    breiten.forEach(function (gr, bk) {   /* Breitenkreise (die Bahnen der aufgeschnittenen Alveole bleiben ohne Versatz) */
      var th = (gr + (offen ? 0 : 5 * (hash(i, bk) - 0.5))) * DEG, folge = [];
      for (j = 0; j <= 36; j++) folge.push(punkt(i, th, j / 36 * 2 * PI + (offen ? 0 : 0.2 * hash(i, 9 + bk))));
      sammeln(folge, rad);
    });
    for (k = 0; k < laengen; k++) {   /* Laengenkreise */
      var ph = (k / laengen + 0.04 * (offen ? 0 : hash(i, 40 + k))) * 2 * PI, folge = [];
      for (j = 0; j <= 18; j++) folge.push(punkt(i, (32 + j * 6.55) * DEG, ph));
      sammeln(folge, rad);
    }
  });
  KAP.rest.forEach(function (l) { l.pts.forEach(function (p) { KAP_PUNKTE.push(p); }); });
  /* Bahnen fuer die Blutkoerperchen: die Breitenkreise 82, 90 und 98 Grad der aufgeschnittenen Alveole (ohne Versatz, wie im Netz gezeichnet), ab dem oberen Punkt umlaufend
     in zusammenhaengende Stuecke geteilt (wo Nachbarbläschen die Wand verdecken, bricht sie ab), jedes von links (Arterienseite) nach rechts (Venenseite) gerichtet */
  [82, 90, 98].forEach(function (gr) {
    var run = [], fertig = function () {
      if (run.length >= 6) { if (run[0][0] > run[run.length - 1][0]) run.reverse(); KAP_BAHNEN.push({ pts: run, r: KAP_R_OFFEN, breite: gr }); }
      run = [];
    };
    for (var j = 0; j <= 48; j++) {
      var q = punkt(OFFEN_I, gr * DEG, PI / 2 + j / 48 * 2 * PI);
      if (q && !q.k) run.push(q.p); else fertig();
    }
    fertig();
  });
}
function farbeKap(g) {   /* Farbverlauf blau (links, Arterienseite) nach rot (rechts, Venenseite) nach x */
  var p = g.attributes.position, col = new Float32Array(p.count * 3), i;
  for (i = 0; i < p.count; i++) {
    var t = Math.min(1, Math.max(0, (p.getX(i) + 2.2) / 4.4)); t = t * t * (3 - 2 * t);
    col[i * 3] = BLAU.r + (ROT.r - BLAU.r) * t; col[i * 3 + 1] = BLAU.g + (ROT.g - BLAU.g) * t; col[i * 3 + 2] = BLAU.b + (ROT.b - BLAU.b) * t;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
/* Zufuehrendes und abfuehrendes Gefaess: Stamm neben dem Bronchiolus, Aeste zum naechsten Punkt des Kapillarnetzes */
var STAMM = [[-3.2, 10.2, -0.2], [-3.3, 7.0, -0.2], [-3.4, 3.0, -0.2], [-3.65, -0.6, -0.2], [-3.95, -2.9, -0.2], [-4.0, -5.2, -0.2]];
var ASTHOEHEN = [8.0, 5.6, 3.0, 0.4, -1.8, -4.0];   /* y der Abzweigungen */
function stammPunkt(stamm, y) {   /* Punkt auf dem Stamm in Hoehe y (lineare Naeherung zwischen den Stuetzpunkten) */
  for (var i = 0; i < stamm.length - 1; i++) {
    var a = stamm[i], b = stamm[i + 1];
    if (y <= a[1] && y >= b[1]) { var t = (a[1] - y) / (a[1] - b[1]); return [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t]; }
  }
  return stamm[stamm.length - 1].slice();
}
function gefaesse(seite) {   /* seite -1: Arterie (links), +1: Vene (rechts) */
  var stamm = STAMM.map(function (p) { return [p[0] * (seite < 0 ? 1 : -1), p[1], p[2]]; });   /* die Tabelle STAMM liegt links (Arterie), die Vene spiegelt sie */
  var linien = [{ pts: stamm, r0: 0.27, r1: 0.18, seiten: 14, segmente: 40 }];
  ASTHOEHEN.forEach(function (y) {
    var T = stammPunkt(stamm, y), best = null, bd = 1e9;
    KAP_PUNKTE.forEach(function (p) {
      if (p[0] * seite < 0.2 || p[2] < -1.5) return;   /* auf der eigenen Seite, nicht ganz hinten */
      var d = (p[0] - T[0]) * (p[0] - T[0]) + (p[1] - T[1]) * (p[1] - T[1]) + (p[2] - T[2]) * (p[2] - T[2]);
      if (d < bd) { bd = d; best = p; }
    });
    if (!best) return;
    var mid = [(T[0] + best[0]) / 2, (T[1] + best[1]) / 2, (T[2] + best[2]) / 2 + 0.25];
    linien.push({ pts: [T, mid, best], r0: 0.11, r1: 0.06, seiten: 8, segmente: 10 });
  });
  return { stamm: stamm, linien: linien };
}

/* Aufbau: Wand (Feld, zwei Netze, Teilnetze) -> Kapillarnetz -> Gefaesse -> Anker */
var KAND = {}, KAND_OFFEN = {}, KAND_ZU = {}, VIS = {}, GEF = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
var feldZu = null, feldOffen = null;
async function bauen() {
  await setLoad(0.02, 'Alveolen werden geformt'); if (abgebaut) return;
  var G = S.makeGrid(GITTER, H);
  var F = await S.evalFeld(G, wand, function (f) { return setLoad(0.02 + 0.5 * f); }); if (abgebaut) return;
  var Fc = new Float32Array(F.length), i, j, k;   /* aufgeschnitten: dieselbe Schale ohne die vordere Kappe */
  for (k = 0; k < G.nz; k++) for (j = 0; j < G.ny; j++) for (i = 0; i < G.nx; i++) {
    var ix = i + G.nx * (j + G.ny * k);
    Fc[ix] = Math.max(F[ix], -schnitt(G.o[0] + i * H, G.o[1] + j * H, G.o[2] + k * H));
  }
  feldZu = { G: G, F: F }; feldOffen = { G: G, F: Fc };
  await setLoad(0.55, 'Wand'); if (abgebaut) return;
  var gz = aufteilen(S.geometrie(G, F), false);
  await setLoad(0.68, 'Wand'); if (abgebaut) return;
  var go = aufteilen(S.geometrie(G, Fc), true, 'alveoleOffen');
  if (abgebaut) return;
  addMesh('bronchiolus', gz.bronchiolus, MAT.bronchiolus, 'Bronchiolus respiratorius', 2);
  addMesh('gang', gz.gang, MAT.gang, 'Alveolargang', 2);
  addMesh('alveolen', gz.alveolen, MAT.alveolen, 'Alveolen', 2);
  addMesh('alveoleOffen', gz.alveoleOffen, MAT.alveoleOffen, 'Alveole (geschlossen)', 2, 'zu');
  addMesh('alveoleOffen', go.alveoleOffen, MAT.alveoleOffen, 'Alveole (aufgeschnitten)', 2, 'offen');
  tris.wand = anz(gz.bronchiolus) + anz(gz.gang) + anz(gz.alveolen) + anz(gz.alveoleOffen) + anz(go.alveoleOffen);
  await setLoad(0.78, 'Kapillarnetz'); if (abgebaut) return;
  kapillarnetz();
  [['rest', null], ['kappe', 'zu']].forEach(function (q) {
    var g = rohre(KAP[q[0]].map(function (l) { return { pts: l.pts, r0: l.r, r1: l.r, seiten: 5, segmente: Math.max(3, l.pts.length - 1) }; }));
    farbeKap(g);
    addMesh('kapillaren', g, MAT.kapillaren, q[0] === 'rest' ? 'Kapillarnetz' : 'Kapillarnetz (vordere Kappe)', 3, q[1]); tris.kapillaren += anz(g);
  });
  await setLoad(0.9, 'Gefäße'); if (abgebaut) return;
  GEF.arteriole = gefaesse(-1); GEF.venole = gefaesse(1);
  ['arteriole', 'venole'].forEach(function (id) {
    var g = rohre(GEF[id].linien);
    addMesh(id, g, MAT[id], STRUCT[id].de, 3); tris.gefaesse += anz(g);
  });
  await setLoad(0.96, 'Beschriftung'); if (abgebaut) return;
  ankerBerechnen();
}

/* =====================================================================
   2. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, seeCam = false, offenAn = true, lv = 0;   /* lv: Version fuer die Beschriftung; seeCam: Durchsicht kommt vom Ausschnitt Kapillarnetz */
ORDER.forEach(function (s) { enabled[s.id] = true; });

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (hier keine: auch die Glaswand zaehlt nur, wenn dahinter nichts anderes liegt) */
function weichMat(o) { return o.material.transparent; }
function applyVisibility() {
  root.traverse(function (o) {
    if (!o.isMesh) return;
    var sid = o.userData.sid, z = o.userData.zustand;
    o.visible = !!sid && enabled[sid] && (!z || (z === 'offen') === offenAn);
  });
  lv++;
}
/* Glas (Durchsicht) der Wand; Material nur neu uebersetzen, wenn sich transparent aendert */
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  WAND.forEach(function (sid) { stelleMat(MAT[sid], seeThrough, seeThrough ? GLAS : 1); });
}
/* punkt (optional, Vector3 oder [x, y, z]): wo die Struktur angetippt wurde */
function setSelected(id, punkt) {
  selected = id;
  var brass = srgb(0xE0A94A);
  ORDER.forEach(function (s) {
    var em = (s.id === id) ? 0.28 : 0;
    s.meshes.forEach(function (m) {
      var mt = m.material;
      if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)).add(brass.clone().multiplyScalar(em));
    });
    var row = $('row-' + s.id);
    if (row) row.classList.toggle('sel', s.id === id);
  });
  lv++;
  var box = $('info');
  if (!id) { box.classList.remove('show'); return; }
  var s = STRUCT[id];
  $('iLat').textContent = s.lat;
  $('iDe').textContent = s.de;
  $('iTx').textContent = s.txt;
  var dl = $('iDl'); dl.innerHTML = '';
  Object.keys(s.facts).forEach(function (k) {
    var dt = document.createElement('dt'); dt.textContent = k;
    var dd = document.createElement('dd'); dd.textContent = s.facts[k];
    dl.appendChild(dt); dl.appendChild(dd);
  });
  box.classList.add('show');
}

(function leiste() {
  /* Reiter: vorerst nur Strukturen (weitere kommen spaeter dazu, z. B. Gasaustausch) */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var b = document.createElement('button'); b.className = 'tab on'; b.textContent = 'Strukturen';
  tabs.appendChild(b);
  $('rail').appendChild(tabs);
  $('rail').appendChild(rail);
  var gruppen = [];
  ORDER.forEach(function (s) { if (gruppen.indexOf(s.grp) < 0) gruppen.push(s.grp); });
  var hex = function (c) { return c.toString(16).padStart(6, '0'); };
  gruppen.forEach(function (g) {
    var wrap = document.createElement('div'); wrap.className = 'grp';
    var h = document.createElement('h2'); h.textContent = g; wrap.appendChild(h);
    ORDER.filter(function (s) { return s.grp === g; }).forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'row'; row.id = 'row-' + s.id; row.tabIndex = 0;
      row.innerHTML = '<span class="sw" style="background:#' + hex(s.col) + '"></span><span class="nm"><b></b><i></i></span>';
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

function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  applyLook();
  lv++;
}
$('bSee').onclick = function () { seeCam = false; durchsicht(!seeThrough); };
/* aufgeschnitten oder geschlossen: die aufgeschnittene Alveole (und ihre vordere Kappe des Kapillarnetzes) wechselt, der Anker der Beschriftung folgt */
function offen(an) {
  offenAn = an;
  $('bOffen').classList.toggle('on', an);
  $('bZu').classList.toggle('on', !an);
  KAND.alveoleOffen = an ? KAND_OFFEN.alveoleOffen : KAND_ZU.alveoleOffen;
  VIS = {};
  applyVisibility();
}
$('bOffen').onclick = function () { offen(true); };
$('bZu').onclick = function () { offen(false); };
$('bCls').onclick = function () { setSelected(null); };
$('bLab').onclick = function () {
  showLabels = !showLabels;
  this.classList.toggle('on', showLabels);
  $('labels').style.display = showLabels ? '' : 'none';
  $('leaders').style.display = showLabels ? '' : 'none';
  lv++;
};

/* =====================================================================
   3. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
/* ext = Breite und Hoehe, die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite, die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: 0, phi: PI / 2, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Alveole', theta: 0, phi: 1.5, target: V(OF.c[0], OF.c[1], OF.c[2] - 0.5), ext: [8.4, 8.2], halb: 4.0 },
  { name: 'Kapillarnetz', theta: -0.4, phi: 1.45, target: V(-0.7, -2.6, 1.9), ext: [5.2, 5.4], halb: 2.8 },
  { name: 'Bronchiolus', theta: 0, phi: PI / 2, target: V(0, 5.6, 0), ext: [8.4, 6.4], halb: 4.2 }
];
var view = { theta: 0, phi: PI / 2, dist: 31, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 3.5, maxDist: 70 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer das Modell und die Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
function bereich(w, h) {
  var tr = $('tools').getBoundingClientRect();
  return bereichFuer(w, h, tr.top, tr.bottom);
}
function distFuer(a, w, h) {
  return abstandFuer(a.ext, bereich(w, h), camera.fov, h);
}
function gehe(i) {
  var a = AUSSCHNITTE[i]; if (!a) return;
  aktiv = i;
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === i);
  /* Kapillarnetz: die Wand wird durchsichtig; beim Verlassen wieder undurchsichtig, wenn der Knopf nicht selbst bedient wurde */
  if (i === 2 && !seeThrough) { seeCam = true; durchsicht(true); }
  else if (i !== 2 && seeCam) { seeCam = false; durchsicht(false); }
  VIS = {};
  var w = window.innerWidth, h = window.innerHeight, d = distFuer(a, w, h);
  var dth = a.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;   /* kuerzester Weg beim Drehen */
  orbit.anim = Kern.fahrt(view, { theta: view.theta + dth, phi: a.phi, dist: d, target: a.target }, 700);
  fitDist = d;
  lv++;
}
for (var ci = 0; ci < AUSSCHNITTE.length; ci++) (function (i) { $('cam' + i).onclick = function () { gehe(i); }; })(ci);

function groesse(w, h) {
  var r = bereich(w, h), a = AUSSCHNITTE[aktiv];
  camera.setViewOffset(w, h, w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2, w, h);
  camera.updateProjectionMatrix();
  var d = distFuer(a, w, h);
  if (!fitDist || (!orbit.anim && Math.abs(view.dist - fitDist) < 1e-6)) view.dist = d;
  fitDist = d;
  Kern.linienFlaeche($('leaders'), w, h);
  railHoehe(w);
  lv++;
}
/* Desktop: die Leiste endet ueber der Lesehilfe (sonst liegt diese ueber den unteren Zeilen, die dann nicht anklickbar sind) */
function railHoehe(w) {
  var rail = $('rail'), lg = $('legend').getBoundingClientRect(), rt = rail.getBoundingClientRect().top;
  rail.style.maxHeight = (w > 1000 && lg.height > 0 && lg.top > rt + 160) ? Math.floor(lg.top - 12 - rt) + 'px' : '';
}
function ansicht(theta, phi, dist, target) {
  if (theta !== undefined) view.theta = theta * DEG;
  if (phi !== undefined) view.phi = phi * DEG;
  if (dist !== undefined) view.dist = dist;
  if (target) view.target.set(target[0], target[1], target[2]);
  orbit.anim = null;
}

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Wand bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, punkt = null, weichPunkt = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    if (weichMat(o)) { if (!weich) { weich = sid; weichPunkt = hits[i].point; } }
    else { treffer = sid; punkt = hits[i].point; }
  }
  setSelected(treffer || weich || null, treffer ? punkt : weichPunkt);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Punkt auf der Oberflaeche: von vorn entlang z bis ins Innere des Feldes fn */
function vorn(fn, x, y) {
  for (var z = 8; z > -8; z -= 0.02) if (fn(x, y, z) < 0) return [x, y, z];
  return null;
}
/* Kandidaten fuer den Ankerpunkt je Struktur (Raum der Szene); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren */
function ankerBerechnen() {
  var P = function (a) { return V(a[0], a[1], a[2]); };
  var liste = function (arr) { return arr.filter(Boolean).map(P); };
  var vorU = function (pts) { return pts.map(function (q) { return vorn(U, q[0], q[1]); }); };
  var kapNah = function (ziele) {   /* Kapillarpunkte nahe den Zielen (vorn, rest) */
    return ziele.map(function (t) {
      var best = null, bd = 1e9;
      KAP_PUNKTE.forEach(function (p) { if (p[2] < 0.5) return; var d = (p[0] - t[0]) * (p[0] - t[0]) + (p[1] - t[1]) * (p[1] - t[1]) + (p[2] - t[2]) * (p[2] - t[2]); if (d < bd) { bd = d; best = p; } });
      return best;
    });
  };
  var stammA = function (id, ys) { return ys.map(function (y) { var p = stammPunkt(GEF[id].stamm, y); return [p[0], p[1], p[2] + 0.2]; }); };
  KAND.bronchiolus = liste(vorU([[0, 8.7], [0.3, 9.2], [-0.3, 8.0]]));
  KAND.gang = liste(vorU([[0, 2.7], [0, 4.2], [0.1, 3.6]]));
  KAND.alveolen = liste(vorU([[1.15, -0.7], [-1.15, -0.7], [1.7, 1.6], [-2.0, -2.9], [2.0, -2.9], [0, -5.3]]));
  KAND.kapillaren = liste(kapNah([[-1.2, -2.9, 3.0], [0.9, -2.2, 3.0], [-1.6, -0.7, 2.6], [1.4, -4.5, 2.0]]));
  KAND.arteriole = liste(stammA('arteriole', [8.3, 4.6, 0.8, -3.6]));
  KAND.venole = liste(stammA('venole', [8.3, 4.6, 0.8, -3.6]));
  /* aufgeschnittene Alveole: geschlossen die Vorderseite der Wand, aufgeschnitten die helle Schnittkante (Ring um die Schnittebene) */
  var rho = Math.sqrt(OF.r * OF.r - SCHNITT_DZ * SCHNITT_DZ) - T_WAND * 0.5, c = OF.c;
  KAND_ZU.alveoleOffen = liste(vorU([[c[0] + 0.3, c[1]], [c[0] - 0.6, c[1] + 0.5], [c[0] + 0.6, c[1] - 0.5]]));
  KAND_OFFEN.alveoleOffen = liste([[c[0] - rho, c[1], OF_ZC], [c[0] + rho, c[1], OF_ZC], [c[0], c[1] - rho, OF_ZC], [c[0], c[1] + rho, OF_ZC]]);
  KAND.alveoleOffen = offenAn ? KAND_OFFEN.alveoleOffen : KAND_ZU.alveoleOffen;
}
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, vor dem kein undurchsichtiges
   Netz einer anderen Struktur liegt; sonst keine Beschriftung. Waehrend der Bewegung bleibt die letzte Wahl. */
var sKey = '', sT = 0, sOk = true, sichtVer = 0;
var rayS = new THREE.Raycaster(), dirS = new THREE.Vector3();
function frei(id, p) {
  dirS.copy(p).sub(camera.position); var d = dirS.length(); dirS.normalize();
  rayS.set(camera.position, dirS); rayS.far = d;
  var hits = rayS.intersectObjects(root.children, true);
  for (var i = 0; i < hits.length; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || sid === id || !sichtbar(o) || !enabled[sid] || weichMat(o)) continue;
    if (hits[i].distance < d - 0.12) return false;
  }
  return true;
}
function sichtPruefen(now, w, h) {
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, offenAn].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  LISTEN[aktiv].forEach(function (id) {
    if (!enabled[id]) return;
    var c = KAND[id] || [], i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { bronchiolus: 'Bronchiolus', alveolen: 'Alveolen', alveoleOffen: 'Aufgeschnittene Alveole' };   /* kürzere Namen, damit die Beschriftung in die Spalte passt */
var LATKURZ = { bronchiolus: 'Bronchiolus respiratorius' };
var HANDYNAME = { alveoleOffen: 'Aufgeschn. Alveole', arteriole: 'Lungenarterie', venole: 'Lungenvene', kapillaren: 'Kapillaren' };   /* noch kürzer, wo die Spalte auf dem Handy schmal ist */
/* je Ausschnitt: Strukturen in der Beschriftung */
var LISTEN = [
  ['bronchiolus', 'gang', 'alveolen', 'alveoleOffen', 'kapillaren', 'arteriole', 'venole'],
  ['alveoleOffen', 'alveolen', 'kapillaren', 'arteriole', 'venole'],
  ['kapillaren', 'alveolen', 'alveoleOffen', 'arteriole', 'venole'],
  ['bronchiolus', 'gang', 'alveolen', 'arteriole', 'venole']
];
var labelBox = $('labels'), leaderSvg = $('leaders');
var LAB = {};   /* Struktur-id -> { el, ln, dot, nm, de } */
LISTEN.forEach(function (l) {
  l.forEach(function (id) {
    if (LAB[id]) return;
    var d = STRUCT[id], b = Kern.beschriftung(labelBox, leaderSvg, KURZ[id] || d.de, LATKURZ[id] || d.lat);
    b.nm = b.el.querySelector('b'); b.de = KURZ[id] || d.de;
    LAB[id] = b;
  });
});
var pv = new THREE.Vector3(), lastKey = '';
/* Schneiden sich die Strecken (ax,ay)-(bx,by) und (cx,cy)-(dx,dy)? */
function schneiden(ax, ay, bx, by, cx, cy, dx, dy) {
  var o = function (px, py, qx, qy, rx, ry) { return (qx - px) * (ry - py) - (qy - py) * (rx - px); };
  var d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx, dy), d3 = o(cx, cy, dx, dy, ax, ay), d4 = o(cx, cy, dx, dy, bx, by);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, offenAn, sichtVer].join('|');
  if (key === lastKey) return;
  lastKey = key;
  var narrow = w < 1000, r = bereich(w, h), a = AUSSCHNITTE[aktiv];
  var pxcm = h / (2 * view.dist * Math.tan(camera.fov * PI / 360)), cx = (r.x0 + r.x1) / 2;
  var colL = Math.min(cx - 20, Math.max(r.x0 + r.labW + 4, cx - a.halb * pxcm - 12));
  var colR = Math.max(cx + 20, Math.min(r.x1 - r.labW - 4, cx + a.halb * pxcm + 12));
  var topL = r.y0, topR = narrow ? Math.max(r.y0, 214) : Math.max(r.y0, $('tools').getBoundingClientRect().bottom + 16);   /* oben: Anfang des freien Bereichs (Desktop rechts unter der Werkzeugleiste, Handy unter dem Zurueck-Knopf des Atlas) */
  var botL = narrow ? r.y1 - 6 : h - 40, botR = botL;
  var unten = $('info').classList.contains('show');   /* Infokarte unten links: Beschriftung links darueber */
  if (!narrow && unten) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt das Modell, ohne Beschriftung bleibt es frei */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id]) return;
      var an = id in VIS ? VIS[id] : (KAND[id] || [])[0];
      if (!an) return;
      pv.copy(an);
      pv.project(camera);   /* Die Anker liegen schon im Raum der Szene */
      if (pv.z > 1) return;
      items.push({ id: id, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
    });
  }
  items.forEach(function (it) { it.side = (it.sx < cx || (narrow && (it.id === 'bronchiolus' || it.id === 'gang'))) ? 'l' : 'r'; });   /* Handy: Bronchiolus und Gang (Mitte, oben) stehen links, damit ihre Linien nicht quer ueber das Modell laufen */
  ['l', 'r'].forEach(function (side) {
    var g = items.filter(function (it) { return it.side === side; }).sort(function (p, q) { return p.sy - q.sy; });
    var top = side === 'l' ? topL : topR, bot = side === 'l' ? botL : botR, gp = g.length > 1 ? Math.min(gap, (bot - top) / (g.length - 1)) : gap, y = top;
    g.forEach(function (it) { it.ly = Math.max(y, Math.min(bot, it.sy)); y = it.ly + gp; });
    var over = y - gp - bot;
    if (over > 0) {   /* zu weit nach unten geschoben: hochruecken, dabei nicht ueber den Rand der Spalte hinaus (von oben neu ordnen) */
      g.forEach(function (it) { it.ly -= over; });
      y = top; g.forEach(function (it) { it.ly = Math.max(it.ly, y); y = it.ly + gp; });
    }
    /* Fuehrungslinien duerfen sich nicht kreuzen: kreuzen sich zwei Linien, tauschen ihre Namen die Plaetze (jeder Tausch macht die Linien
       zusammen kuerzer, daher endet das); die Plaetze selbst bleiben, wie sie nach der Hoehe der Anker verteilt wurden */
    var ex = function () { return side === 'l' ? colL + 7 + 16 : colR - 7 - 16; };
    for (var rd = 0, getauscht = true; getauscht && rd < 60; rd++) {
      getauscht = false;
      for (var m = 0; m < g.length; m++) for (var n = m + 1; n < g.length; n++) {
        if (schneiden(g[m].sx, g[m].sy, ex(g[m]), g[m].ly, g[n].sx, g[n].sy, ex(g[n]), g[n].ly)) {
          var t = g[m].ly; g[m].ly = g[n].ly; g[n].ly = t; getauscht = true;
        }
      }
    }
  });
  items.forEach(function (it) {
    var b = LAB[it.id], lx = it.side === 'l' ? colL : colR;
    b.el.style.display = ''; b.ln.style.display = ''; b.dot.style.display = '';
    b.nm.textContent = narrow && HANDYNAME[it.id] || b.de;
    b.el.className = 'lbl ' + it.side + ((selected && it.id !== selected) ? ' dim' : '') + (it.id === selected ? ' sel' : '');
    b.el.style.left = lx + 'px'; b.el.style.top = it.ly + 'px';
    b.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    b.ln.setAttribute('points', it.sx + ',' + it.sy + ' ' + (ex + (it.side === 'l' ? 16 : -16)) + ',' + it.ly + ' ' + ex + ',' + it.ly);
    b.dot.setAttribute('cx', it.sx); b.dot.setAttribute('cy', it.sy);
  });
}

/* =====================================================================
   5. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
/* daten: Andockpunkte fuer die Simulation (B2): Kapillarbahnen und Innenraum der aufgeschnittenen Alveole (Modelleinheiten), dyn = Gruppe der Teilchen */
var App = window.AlveoleApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, offen: offen, ansicht: ansicht, dreiecke: tris,
  daten: { kapBahnen: KAP_BAHNEN, offen: { mitte: OF.c, radius: OF.r, richtung: OF.n, schnittZ: OF_ZC }, dyn: dyn } };
function loop(now) {
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  renderer.render(scene, camera);
  sichtPruefen(now, window.innerWidth, window.innerHeight);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  clearTimeout(Kern.toast._t);
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  camera.clearViewOffset();
  camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  var tt = $('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  delete window.AlveoleApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  setSelected(selected);
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('alveole', organ);
})();
