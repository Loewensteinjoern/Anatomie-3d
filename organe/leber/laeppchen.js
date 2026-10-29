/* =====================================================================
   Leberläppchen - Sinusoide, Leberzellbalken und Galle
   Ein einzelnes Leberläppchen (Lobulus hepatis), stark vergrößert: eine sechseckige Säule (Achse senkrecht, y nach oben, Ecken bei 30° + 60° · k; Winkel α von +z
   aus, x = r·sin α, z = r·cos α) mit der Zentralvene in der Mitte, den Leberzellbalken (einzelne Zellen, strahlenförmig von den Ecken zur Mitte), den Sinusoiden
   dazwischen, Gallenkanälchen, Kupffer-Zellen und an jeder Ecke der Glisson-Trias (Pfortaderast, Leberarterienast, Gallengang). Ein Keil von 60° vorn ist
   aufgeschnitten, damit Zentralvene und Balken im Inneren sichtbar sind. Darunter liegt die Sammelvene, ringsum sind die Nachbarläppchen als Glas angedeutet.
   Modelleinheit: 1 Einheit = 0,1 mm (Läppchen: Ecke zu Mitte 8 Einheiten, Höhe der gezeigten Säule 8 Einheiten); die Größen sind symbolisch.
   Alles ist festgelegt, kein Zufall. Grundgerüst wie die Leber: 10 Strukturen mit je eigenem Material, Ausschnitte, Durchsicht, Beschriftung, Infokarte,
   Strukturliste, Lesehilfe. Schema, Strömung, Stoffe, Hilfekarten und Üben sind in Leiste und Markup vorbereitet und folgen in späteren Schritten.
   organ.start (Startansicht) und organ.form (Geometrie als reine Funktionen) dienen der Kamerafahrt aus der Leber (leber.js, Zoomstufe Leber -> Läppchen).
   ===================================================================== */
(function () {
'use strict';
var PI = Math.PI, DEG = PI / 180;
/* =====================================================================
   Inhalte (Daten, getrennt vom Code): Texte von Joern freigegeben
   ===================================================================== */
var STRUKTUREN = [
  { id: 'zentralvene', de: 'Zentralvene', lat: 'Vena centralis', grp: 'Läppchen', col: 0x3F63B5,
    txt: 'Die Vene in der Mitte jedes Leberläppchens. In sie münden alle Sinusoide: Hier kommt das Blut an, nachdem es an den Leberzellen vorbeigeflossen ist. Die Zentralvenen führen es über Sammelvenen zu den Lebervenen.',
    facts: { 'Lage': 'Mitte des Läppchens', 'Nimmt auf': 'Blut aus den Sinusoiden', 'Weiter zu': 'Sammelvene, Lebervenen' } },
  { id: 'balken', de: 'Leberzellbalken', lat: 'Laminae hepatocytorum', grp: 'Läppchen', col: 0xC27B62,
    txt: 'Die Leberzellen (Hepatozyten) liegen in Reihen, die strahlenförmig von den Ecken des Läppchens zur Zentralvene ziehen. Jede Zelle grenzt an mindestens ein Sinusoid und an Gallenkanälchen. Leberzellen speichern Zucker, bilden Eiweiße, entgiften und bilden die Galle – und sie können sich teilen und nachwachsen.',
    facts: { 'Anordnung': 'strahlenförmig zur Zentralvene', 'Grenzen an': 'Sinusoide und Gallenkanälchen', 'Besonderheit': 'Leber wächst nach (Regeneration)' } },
  { id: 'sinusoide', de: 'Sinusoide', lat: 'Vasa sinusoidea', grp: 'Läppchen', col: 0xA45A8A,
    txt: 'Weite, durchlässige Kapillaren zwischen den Zellbalken. In ihnen mischt sich das Blut aus Pfortader und Leberarterie und fließt langsam von den Ecken zur Zentralvene. Ihre Wand hat Lücken: Das Blutplasma erreicht die Leberzellen direkt.',
    facts: { 'Blut': 'gemischt aus Pfortader und Leberarterie', 'Richtung': 'von außen zur Zentralvene', 'Wand': 'mit Lücken, ohne feste Grundschicht' } },
  { id: 'kanaelchen', de: 'Gallenkanälchen', lat: 'Canaliculi biliferi', grp: 'Läppchen', col: 0x5FB05C,
    txt: 'Feinste Gänge zwischen benachbarten Leberzellen; sie haben keine eigene Wand. Die Leberzellen geben die Galle hinein, und sie fließt nach außen zu den Ecken des Läppchens – entgegen dem Blut.',
    facts: { 'Wand': 'Zellmembran der Leberzellen', 'Richtung': 'von innen nach außen', 'Münden in': 'Gallengang im Periportalfeld' } },
  { id: 'kupffer', de: 'Kupffer-Zellen', lat: 'Macrophagocyti stellati', grp: 'Läppchen', col: 0xD9A441,
    txt: 'Fresszellen, die in den Sinusoiden sitzen. Sie fangen Bakterien und Giftstoffe ab, die mit dem Pfortaderblut aus dem Darm kommen, und bauen alte rote Blutkörperchen ab.',
    facts: { 'Art': 'ortsständige Fresszellen (Makrophagen)', 'Fangen ab': 'Bakterien und Fremdstoffe aus dem Darm', 'Bauen ab': 'alte rote Blutkörperchen' } },
  { id: 'pfortaderast', de: 'Pfortaderast', lat: 'Vena interlobularis', grp: 'Periportalfeld', col: 0x7A5CB0,
    txt: 'Feiner Ast der Pfortader an der Ecke des Läppchens. Er bringt das nährstoffreiche, sauerstoffarme Blut aus dem Darm, das in die Sinusoide einströmt. Zusammen mit Arterienast und Gallengang bildet er die Glisson-Trias.',
    facts: { 'Lage': 'Ecke des Läppchens', 'Blut': 'aus Darm und Milz', 'Teil der': 'Glisson-Trias' } },
  { id: 'arterienast', de: 'Leberarterienast', lat: 'Arteria interlobularis', grp: 'Periportalfeld', col: 0xC8372D,
    txt: 'Kleiner Ast der Leberarterie neben dem Pfortaderast. Er bringt sauerstoffreiches Blut, das sich in den Sinusoiden mit dem Pfortaderblut mischt.',
    facts: { 'Lage': 'Ecke des Läppchens', 'Blut': 'sauerstoffreich, aus der Aorta', 'Teil der': 'Glisson-Trias' } },
  { id: 'gallengang', de: 'Gallengang', lat: 'Ductus biliferus interlobularis', grp: 'Periportalfeld', col: 0x3F8F4A,
    txt: 'Kleiner Gallengang an der Ecke des Läppchens. Er nimmt die Galle aus den Gallenkanälchen auf und leitet sie über immer größere Gänge zur Leberpforte.',
    facts: { 'Lage': 'Ecke des Läppchens', 'Nimmt auf': 'Galle aus den Gallenkanälchen', 'Teil der': 'Glisson-Trias' } },
  { id: 'sammelvene', de: 'Sammelvene', lat: 'Vena sublobularis', grp: 'Umgebung', col: 0x34559E,
    txt: 'Die Zentralvenen mehrerer Läppchen münden in eine Sammelvene. Sie führt das Blut weiter zu den großen Lebervenen und damit zur unteren Hohlvene.',
    facts: { 'Nimmt auf': 'Zentralvenen', 'Weiter zu': 'Lebervenen', 'Lage': 'unter dem Läppchen' } },
  { id: 'nachbarn', de: 'Nachbarläppchen', lat: 'Lobuli hepatis', grp: 'Umgebung', col: 0xC7A58F,
    txt: 'Jedes Läppchen ist von weiteren umgeben; sie teilen sich die Periportalfelder an den Ecken. Eine Leber hat Hunderttausende davon. Hier sind die Nachbarn nur angedeutet.',
    facts: { 'Form': 'sechseckige Säulen, ca. 1–2 mm', 'Gemeinsam': 'Periportalfelder an den Ecken', 'Anzahl': 'Hunderttausende je Leber' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Leberläppchen &middot; Lobulus hepatis</div>
  <h1>Sinusoide, Zellbalken &amp; <em>Zentralvene</em></h1>
  <div class="sub">Hier verarbeiten die Leberzellen, was das Blut bringt, und bilden die Galle.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Übersicht</button>
    <button id="cam1" class="gh">Periportalfeld</button>
    <button id="cam2" class="gh">Zentralvene</button>
    <button id="cam3" class="gh">Sinusoid</button>
    <span class="sep"></span>
    <button id="bSchema" class="gh" disabled title="Das Leberläppchen als flaches Schema: gleiche Teilchen, gleiche Strömung">Schema</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Leberzellen durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bNuechtern" class="gh on" title="Zwischen den Mahlzeiten: Die Leberzellen geben Zucker ins Blut ab">nüchtern</button>
    <button id="bEssen" class="gh" title="Nach einer Mahlzeit: Die Leberzellen nehmen Zucker auf und speichern ihn">nach dem Essen</button>
  </div>
  <div class="trow">
    <span class="cap">Stoffe</span>
    <button id="bZucker" class="gh on" title="Zucker ein- oder ausblenden">Zucker</button>
    <button id="bAmmoniak" class="gh on" title="Ammoniak und Harnstoff ein- oder ausblenden">Ammoniak</button>
    <button id="bBilirubin" class="gh on" title="Bilirubin ein- oder ausblenden">Bilirubin</button>
  </div>
  <div class="trow">
    <span class="cap">Strömung</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bS0" class="gh">langsam</button>
    <button id="bS1" class="gh on">normal</button>
    <button id="bS2" class="gh">schnell</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="schema" aria-label="Schema des Leberläppchens">
  <div class="sch-head"><span class="kick">Schema &middot; Leberläppchen</span><span class="sch-hint">Gleiche Teilchen wie im 3D-Modell, Querschnitt von oben.</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schließen">&times;</button></div>
  <div id="schemaBox"></div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#A98BDC">Violett</b> Blut aus der Pfortader.<br>
  <b style="color:#E0584C">Rot</b> Blut aus der Leberarterie.<br>
  <b style="color:#6F93E0">Blau</b> Blut zur Zentralvene.<br>
  <b style="color:#7CC66E">Grün</b> Galle.<br>
  <b style="color:#E6C94A">Gelb</b> Zucker – nach dem Essen speichern die Leberzellen ihn als Glykogen, nüchtern geben sie ihn ab.<br>
  <b style="color:#F09A3E">Orange</b> Ammoniak – wird in den Leberzellen zu Harnstoff (<b style="color:#F2F2EE">weiß</b>).<br>
  <b style="color:#B98A5E">Braun</b> Bilirubin – wird in den Leberzellen umgebaut und mit der Galle ausgeschieden.</p>
  <p class="note" id="legNote">Ein Läppchen, stark vergrößert (in Wirklichkeit ca. 1–2 mm); ein Keil ist aufgeschnitten. Blut fließt von den Ecken zur Mitte, Galle von der Mitte zu den Ecken.</p>
  <p class="note kz">Läppchen ca. 1–2 mm groß, Hunderttausende je Leber</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schließen">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schließen">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">Nächste</button><button class="gh" id="qStop">Beenden</button></div>
</div>`;
var MAHLZEIT_TXT = ['Nüchtern: Die Leberzellen geben Zucker aus dem Glykogen ins Blut ab.',
  'Nach dem Essen: Die Leberzellen nehmen Zucker auf und speichern ihn als Glykogen.'];
var organ = { renderer: {}, aufbauen: aufbauen };

/* =====================================================================
   Form (feste Größen, Modelleinheit 0,1 mm): reine Funktionen, die Geometrie als Daten liefern (organ.form). Erst der Aufruf erzeugt three.js-Objekte; die
   Leber nutzt dieselben Teile bei der Kamerafahrt (Abschnitt "Zoomstufe" in leber.js). Das Läppchen steht mit der Mitte der Grundfläche im Ursprung.
   ===================================================================== */
var FR = 8, FAPO = FR * Math.cos(PI / 6), FH = 8;       /* Abstand Ecke - Mitte, Abstand Seitenmitte - Mitte (Apothem), Höhe der gezeigten Säule */
var FWK = 30 * DEG;                                      /* halber Öffnungswinkel des aufgeschnittenen Keils (vorn, +z) */
var RZ = 0.9, SAMMEL_Y = -3, SAMMEL_R = 1.3;             /* Zentralvene (Radius), Sammelvene (Höhe der Achse, Radius) */
var UNTEN = -1.0;                                        /* unteres Ende der Glisson-Trias (setzt sich nach unten in den Gefäßen der Leber fort) */
var TRIAS_R = FR - 1.2;                                  /* Abstand der Mitte jeder Glisson-Trias von der Läppchenmitte */
var TR = { pf: 0.5, art: 0.3, gang: 0.36 };              /* Radien von Pfortaderast, Arterienast, Gallengang */
var TO = { pf: [-0.55, 0], art: [0.35, 0.75], gang: [0.35, -0.75] };   /* Lage im Dreieck: [radial nach außen, tangential] */
var DR = 0.8, ZH = 0.76, NREIHEN = 10, ZLUECKE = 0.22;   /* Zellen: Raster in Höhe und Länge, Kantenlänge, Reihen übereinander, Spalt zwischen den beiden Zellreihen eines Balkens */
var YK = [1.9, 3.9, 5.9, 7.9];                           /* Höhen der Gallenkanälchen */
function eckeWinkel(k) { return (30 + 60 * k) * DEG; }
function eckePunkt(k, art) {   /* [x, z] von Pfortaderast, Arterienast bzw. Gallengang an der Ecke k */
  var a = eckeWinkel(k), s = Math.sin(a), c = Math.cos(a), o = TO[art], r = TRIAS_R + o[0];
  return [r * s + o[1] * c, r * c - o[1] * s];
}
function rHex(a) {   /* Abstand der Sechseckkante von der Mitte in Richtung a */
  var d = ((a / DEG) % 60 + 60) % 60; d = Math.min(d, 60 - d);
  return FAPO / Math.cos(d * DEG);
}
function imKeil(a) { var d = ((a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI; return Math.abs(d) < FWK - DEG; }
function colW(r) { return 0.14 + 0.05 * r; }             /* Breite einer Zellreihe: nimmt zur Mitte hin ab */
function hash(i) { var s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); }
/* Balken: je Sechstel zwei Platten (20° und 40° hinter der Ecke k), abwechselnd lang (bis nahe an die Zentralvene) und kurz; Platten im Keil entfallen */
var PLATTEN = [];
(function () {
  for (var k = 0; k < 6; k++) for (var j = 0; j < 2; j++) {
    var a = eckeWinkel(k) + 20 * (j + 1) * DEG;
    PLATTEN.push({ a: a, lang: j === 0, rin: j === 0 ? 1.6 : 3.2, raus: rHex(a) - 0.45, keil: imKeil(a), ecke: (k + j) % 6 });
  }
})();
/* Sinusoide: Kanäle in den Lücken zwischen den Platten (breit: an den Ecken, schmal: in der Mitte eines Sechstels) */
var LUECKEN = [];
(function () {
  for (var k = 0; k < 6; k++) {
    LUECKEN.push({ a: eckeWinkel(k), breit: true, rin: 1.0, raus: 5.4 });
    LUECKEN.push({ a: (60 + 60 * k) * DEG, breit: false, rin: 1.0, raus: FAPO - 0.85 });
  }
})();
/* Kupffer-Zellen: [Radius, Winkel in Grad, Höhe] in den Sinusoiden */
var KUPFFER = [[4.2, 150, 6.8], [3.2, 90, 5.2], [4.8, 150, 2.6], [3.6, 210, 6.6], [4.6, 270, 4.2], [3.0, 210, 2.4], [5.6, 60, 6.9], [5.4, 180, 5.0], [5.5, 240, 3.2], [5.6, 300, 6.5]];
var NACHBAR_WINKEL = [0, 60, 120, 180, 240, 300];
/* Geometrien zu einer zusammenfügen: teile = [{ g (indiziert, mit Normalen), m (Matrix4) }] */
function fuegen(teile) {
  var pos = [], nor = [], idx = [], nm = new THREE.Matrix3(), v = new THREE.Vector3();
  teile.forEach(function (t) {
    var g = t.g, p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i;
    nm.getNormalMatrix(t.m);
    for (i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(t.m); pos.push(v.x, v.y, v.z);
      v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z);
    }
    for (i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    g.dispose();
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return geo;
}
function mTrans(x, y, z) { return new THREE.Matrix4().makeTranslation(x, y, z); }
/* Rohr von a nach b (Radius r, Mittelachse y des Zylinders wird auf die Strecke gelegt) */
function strecke(a, b, r, seiten, offen) {
  var A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), L = d.length();
  var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return { g: new THREE.CylinderGeometry(r, r, L, seiten, 1, !!offen), m: new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)) };
}
/* Zellen der Leberzellbalken als Instanzen einer Einheitsbox (Matrizen und Farben je Zelle) */
function zellenDaten() {
  var mat = [], col = [], p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), m = new THREE.Matrix4(), Y = new THREE.Vector3(0, 1, 0);
  var base = Kern.srgb(0xC27B62), n = 0;
  PLATTEN.forEach(function (pl) {
    if (pl.keil) return;
    var si = Math.sin(pl.a), co = Math.cos(pl.a), nj = Math.floor((pl.raus - pl.rin) / DR), j, side, i;
    q.setFromAxisAngle(Y, pl.a);
    for (j = 0; j < nj; j++) {
      var r = pl.rin + DR * (j + 0.5), cw = colW(r);
      for (side = -1; side <= 1; side += 2) {
        var v = side * (cw / 2 + ZLUECKE / 2);
        for (i = 0; i < NREIHEN; i++) {
          p.set(r * si + v * co, (i + 0.5) * DR, r * co - v * si); s.set(cw, ZH, ZH);
          m.compose(p, q, s); m.toArray(mat, n * 16);
          var f = 0.88 + 0.24 * hash(n + 1);
          col.push(base.r * f, base.g * f, base.b * f);
          n++;
        }
      }
    }
  });
  return { n: n, mat: new Float32Array(mat), col: new Float32Array(col) };
}
/* Kanäle der Sinusoide: Abschnitte von je einer Zelllänge, Breite nach dem Platz zwischen den Platten */
function sinusoidDaten() {
  var mat = [], p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), m = new THREE.Matrix4(), Y = new THREE.Vector3(0, 1, 0), n = 0;
  LUECKEN.forEach(function (g) {
    if (Math.abs(((g.a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI) < FWK + DEG) return;   /* Kanäle am Rand des Keils entfallen ebenfalls (sie verdeckten die Zentralvene) */
    var si = Math.sin(g.a), co = Math.cos(g.a), nj = Math.floor((g.raus - g.rin) / DR), j;
    q.setFromAxisAngle(Y, g.a);
    for (j = 0; j < nj; j++) {
      var r = g.rin + DR * (j + 0.5), w = g.breit ? Math.min(0.9, 0.205 * r) : Math.min(0.8, 0.104 * r);
      p.set(r * si, FH / 2, r * co); s.set(Math.max(0.2, w), FH - 0.3, DR + 0.03);
      m.compose(p, q, s); m.toArray(mat, n * 16); n++;
    }
  });
  return { n: n, mat: new Float32Array(mat) };
}
function zentralveneGeo() {   /* Rohr von der Sammelvene bis zum oberen Rand; im Keil oberhalb der Grundfläche aufgeschnitten */
  var oben = new THREE.CylinderGeometry(RZ, RZ, FH, 28, 1, true, FWK, 2 * PI - 2 * FWK), unten = new THREE.CylinderGeometry(RZ, RZ, -SAMMEL_Y, 28, 1, true);
  return fuegen([{ g: oben, m: mTrans(0, FH / 2, 0) }, { g: unten, m: mTrans(0, SAMMEL_Y / 2, 0) }]);
}
function sammelveneGeo() {
  var g = new THREE.CylinderGeometry(SAMMEL_R, SAMMEL_R, 28, 20, 1, false);
  return fuegen([{ g: g, m: new THREE.Matrix4().makeRotationZ(PI / 2).premultiply(mTrans(0, SAMMEL_Y, 0)) }]);
}
function triasGeo(art) {   /* die sechs Äste einer Art, vom unteren Ende bis zum oberen Rand der Säule */
  var t = [], k;
  for (k = 0; k < 6; k++) {
    var e = eckePunkt(k, art);
    t.push({ g: new THREE.CylinderGeometry(TR[art], TR[art], FH - UNTEN, 12, 1, false), m: mTrans(e[0], (FH + UNTEN) / 2, e[1]) });
  }
  return fuegen(t);
}
function kanaelchenGeo() {   /* feine Rinnen in der Mitte jedes Balkens (zwischen den beiden Zellreihen) und von dort zum Gallengang der Ecke */
  var t = [];
  PLATTEN.forEach(function (pl) {
    if (pl.keil) return;
    var si = Math.sin(pl.a), co = Math.cos(pl.a), gp = eckePunkt(pl.ecke, 'gang');
    YK.forEach(function (y) {
      var s0 = strecke([pl.rin * si, y, pl.rin * co], [pl.raus * si, y, pl.raus * co], 0.11, 5, true);
      t.push(s0);
      t.push(strecke([pl.raus * si, y, pl.raus * co], [gp[0], y, gp[1]], 0.1, 5, true));
    });
  });
  return fuegen(t);
}
function kupfferGeo() {   /* sternförmige Fresszellen: Körper mit kleinen Fortsätzen */
  var t = [], F = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0.7, 0.7, 0], [-0.7, 0.7, 0]];
  KUPFFER.forEach(function (k) {
    var a = k[1] * DEG, x = k[0] * Math.sin(a), z = k[0] * Math.cos(a), y = k[2];
    t.push({ g: new THREE.SphereGeometry(0.3, 12, 8), m: mTrans(x, y, z) });
    F.forEach(function (f) { t.push({ g: new THREE.SphereGeometry(0.13, 6, 5), m: mTrans(x + 0.27 * f[0], y + 0.27 * f[1], z + 0.27 * f[2]) }); });
  });
  return fuegen(t);
}
function nachbarnGeo() {   /* Seitenwände der sechs Nachbarsäulen (gemeinsame Wände nur einmal) */
  var pos = [], nor = [], idx = [], schon = {};
  NACHBAR_WINKEL.forEach(function (w) {
    var cx = 2 * FAPO * Math.sin(w * DEG), cz = 2 * FAPO * Math.cos(w * DEG), k;
    for (k = 0; k < 6; k++) {
      var a0 = eckeWinkel(k), a1 = eckeWinkel(k + 1);
      var x0 = cx + FR * Math.sin(a0), z0 = cz + FR * Math.cos(a0), x1 = cx + FR * Math.sin(a1), z1 = cz + FR * Math.cos(a1);
      var kA = x0.toFixed(2) + ',' + z0.toFixed(2), kB = x1.toFixed(2) + ',' + z1.toFixed(2), key = kA < kB ? kA + '|' + kB : kB + '|' + kA;
      if (schon[key]) continue; schon[key] = true;
      var nx = Math.sin((a0 + a1) / 2), nz = Math.cos((a0 + a1) / 2), b = pos.length / 3;
      pos.push(x0, 0, z0, x1, 0, z1, x1, FH, z1, x0, FH, z0);
      for (var i = 0; i < 4; i++) nor.push(nx, 0, nz);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  });
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
/* Materialien (Farbe, Optionen für Kern.mat; dicht = zählt beim Antippen als undurchsichtig), Zeichenreihenfolge */
function matDef() {
  var D = THREE.DoubleSide;
  return {
    zentralvene: [0x3F63B5, { rough: 0.4, coat: 0.3, opacity: 0.6, side: D, dicht: true }, 3],
    balken: [0xFFFFFF, { rough: 0.55, coat: 0.25 }, 1],
    sinusoide: [0xA45A8A, { rough: 0.4, coat: 0.3, opacity: 0.3, dicht: true }, 4],
    kanaelchen: [0x5FB05C, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    kupffer: [0xD9A441, { rough: 0.5, coat: 0.2, dicht: true }, 3],
    pfortaderast: [0x7A5CB0, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    arterienast: [0xC8372D, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    gallengang: [0x3F8F4A, { rough: 0.4, coat: 0.5, dicht: true }, 2],
    sammelvene: [0x34559E, { rough: 0.4, coat: 0.3, opacity: 0.6, dicht: true }, 3],
    nachbarn: [0xC7A58F, { rough: 0.6, opacity: 0.13, side: D }, 6]
  };
}
/* Alle Teile des Läppchens: { sid, name, geo, inst (n, mat, col) oder null, order } */
function teile() {
  var z = zellenDaten(), s = sinusoidDaten();
  return [
    { sid: 'zentralvene', name: 'Zentralvene', geo: zentralveneGeo(), inst: null },
    { sid: 'balken', name: 'Leberzellbalken', geo: new THREE.BoxGeometry(1, 1, 1), inst: z },
    { sid: 'sinusoide', name: 'Sinusoide', geo: new THREE.BoxGeometry(1, 1, 1), inst: s },
    { sid: 'kanaelchen', name: 'Gallenkanälchen', geo: kanaelchenGeo(), inst: null },
    { sid: 'kupffer', name: 'Kupffer-Zellen', geo: kupfferGeo(), inst: null },
    { sid: 'pfortaderast', name: 'Pfortaderäste', geo: triasGeo('pf'), inst: null },
    { sid: 'arterienast', name: 'Leberarterienäste', geo: triasGeo('art'), inst: null },
    { sid: 'gallengang', name: 'Gallengänge', geo: triasGeo('gang'), inst: null },
    { sid: 'sammelvene', name: 'Sammelvene', geo: sammelveneGeo(), inst: null },
    { sid: 'nachbarn', name: 'Nachbarläppchen', geo: nachbarnGeo(), inst: null }
  ];
}
/* Mesh (oder InstancedMesh) aus einem Teil; mt = Material (Kern.mat) */
function teilMesh(t, mt, order) {
  var m;
  if (t.inst) {
    m = new THREE.InstancedMesh(t.geo, mt, t.inst.n);
    m.instanceMatrix.array.set(t.inst.mat); m.instanceMatrix.needsUpdate = true;
    if (t.inst.col) m.instanceColor = new THREE.InstancedBufferAttribute(t.inst.col, 3);   /* Farbe je Zelle (später einzeln veränderbar) */
    m.frustumCulled = false;
  } else m = new THREE.Mesh(t.geo, mt);
  m.name = t.name; m.renderOrder = order; m.userData.sid = t.sid;
  return m;
}
/* Anschluss an die Leber: unteres Ende des Pfortaderasts an der Ecke 0 (Modell-Koordinaten) und sein Radius; dort setzt die Leber den Endast des Pfortaderbaums an */
function anschluss() { var e = eckePunkt(0, 'pf'); return { p: [e[0], UNTEN, e[1]], r: TR.pf }; }
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
var UEBERSICHT = { ext: [22, 16], halb: 11, ziel: [0, 3.2, 0], theta: 0, phi: 1.0 };
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (Desktop 150, Handy 130 bei vier Zeilen, je 32 mehr, wenn eine der
   Reihen umbricht: Reihe 1 (Ausschnitt mit Schema) unter Breite 396, Reihe 2 unter 364, Reihe 4 unter 256); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (130 + (w < 396 ? 32 : 0) + (w < 364 ? 32 : 0) + (w < 256 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 150 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
organ.form = { matDef: matDef, teile: teile, teilMesh: teilMesh, anschluss: anschluss, hoehe: FH, radius: FR, unten: UNTEN };

function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie)
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });
var srgb = Kern.srgb;
var GLAS = 0.22;                                             /* Deckkraft der Leberzellen bei "Durchsicht" */
var MAT = {}, DEF = matDef();
Object.keys(DEF).forEach(function (sid) {
  var d = DEF[sid], o = {}, k;
  for (k in d[1]) o[k] = d[1][k];
  MAT[sid] = Kern.mat(d[0], o, envTex); MAT[sid].name = sid;
  if (o.dicht) MAT[sid].userData.dicht = true;
});
var root = new THREE.Group(); root.name = 'Leberläppchen'; scene.add(root);
var tris = { gesamt: 0 };
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* Aufbau (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
async function bauen() {
  await setLoad(0.2, 'Leberläppchen'); if (abgebaut) return;
  var liste = teile(), i;
  for (i = 0; i < liste.length; i++) {
    var t = liste[i], m = teilMesh(t, MAT[t.sid], DEF[t.sid][2]);
    STRUCT[t.sid].meshes.push(m); root.add(m);
    tris.gesamt += anz(t.geo) * (t.inst ? t.inst.n : 1);
    await setLoad(0.2 + 0.7 * (i + 1) / liste.length); if (abgebaut) return;
  }
  ankerBerechnen();
}

/* =====================================================================
   2. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var playing = true, speed = 1, mahlzeit = false, stoffe = { zucker: true, ammoniak: true, bilirubin: true };   /* Zustand der Schalter; die Wirkung folgt mit der Strömung */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (Gefaesse, Kanaele, Kupffer-Zellen) */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = !!enabled[o.userData.sid]; });
  lv++;
}
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() { stelleMat(MAT.balken, seeThrough, seeThrough ? GLAS : 1); }
function setSelected(id) {
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
  closeCard();
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
function closeCard() { $('scard').classList.remove('show'); lv++; }
$('sClose').onclick = closeCard;
$('qStop').onclick = closeCard;

function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility();
}
(function leiste() {
  /* Reiter: Strukturen, Hilfekarten, Ueben (die beiden letzten folgen in spaeteren Schritten) */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneH = document.createElement('div'); paneH.id = 'paneHelp';
  var paneU = document.createElement('div'); paneU.id = 'paneUeben';
  var panes = [rail, paneH, paneU];
  ['Strukturen', 'Hilfekarten', 'Üben'].forEach(function (name, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  $('rail').appendChild(tabs);
  panes.forEach(function (pn, k) { if (k) pn.style.display = 'none'; $('rail').appendChild(pn); });
  /* Strukturen: nach Gruppen, Farbpunkt blendet die Struktur ein und aus */
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
      function flip() { ebene(s.id, !enabled[s.id]); }
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
$('bSee').onclick = function () { durchsicht(!seeThrough); };
$('bCls').onclick = function () { setSelected(null); };
$('bLab').onclick = function () {
  showLabels = !showLabels;
  this.classList.toggle('on', showLabels);
  $('labels').style.display = showLabels ? '' : 'none';
  $('leaders').style.display = showLabels ? '' : 'none';
  lv++;
};
/* Schalter der Strömung, der Mahlzeit und der Stoffe: halten vorerst nur ihren Zustand (die Wirkung folgt in einem späteren Schritt) */
$('bPlay').onclick = function () {
  playing = !playing;
  this.textContent = playing ? 'Pause' : 'Abspielen';
  this.classList.toggle('on', playing);
};
[['bS0', 0.35], ['bS1', 1], ['bS2', 2.0]].forEach(function (b) {
  $(b[0]).onclick = function () {
    speed = b[1];
    ['bS0', 'bS1', 'bS2'].forEach(function (id) { $(id).classList.remove('on'); });
    this.classList.add('on');
  };
});
function setMahlzeit(an) {
  if (an === mahlzeit) return;
  mahlzeit = an;
  $('bNuechtern').classList.toggle('on', !an);
  $('bEssen').classList.toggle('on', an);
  Kern.toast(MAHLZEIT_TXT[an ? 1 : 0]);
}
$('bNuechtern').onclick = function () { setMahlzeit(false); };
$('bEssen').onclick = function () { setMahlzeit(true); };
[['bZucker', 'zucker'], ['bAmmoniak', 'ammoniak'], ['bBilirubin', 'bilirubin']].forEach(function (b) {
  $(b[0]).onclick = function () { stoffe[b[1]] = !stoffe[b[1]]; this.classList.toggle('on', stoffe[b[1]]); };
});

/* Handy: Hoehe der Werkzeugleiste als --wz (Infokarte endet darueber); aendert sich die Leiste (Umbruch), misst der Beobachter neu */
var wzBeob = null;
function wzLoeschen() {
  document.body.style.removeProperty('--wz');
  if (!document.body.getAttribute('style')) document.body.removeAttribute('style');
}
function wzMessen() {
  if (!window.matchMedia('(max-width:1000px)').matches) { wzLoeschen(); return; }   /* Desktop: nichts setzen */
  document.body.style.setProperty('--wz', Math.ceil($('tools').getBoundingClientRect().height) + 'px');
}
function wzEnde() {
  if (wzBeob) { wzBeob.disconnect(); wzBeob = null; }
  wzLoeschen();
}
wzMessen();
if (window.ResizeObserver) { wzBeob = new ResizeObserver(wzMessen); wzBeob.observe($('tools')); }

/* =====================================================================
   3. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
/* ext = Breite und Hoehe (Einheiten), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite, die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Periportalfeld', theta: eckeWinkel(0), phi: 1.1, target: V(TRIAS_R * Math.sin(eckeWinkel(0)), 4.0, TRIAS_R * Math.cos(eckeWinkel(0))), ext: [12, 9], halb: 6 },
  { name: 'Zentralvene', theta: 0, phi: 1.05, target: V(0, 3.8, 0), ext: [16, 11], halb: 8 },
  { name: 'Sinusoid', theta: 60 * DEG, phi: 1.15, target: V(4.8 * Math.sin(60 * DEG), 4.2, 4.8 * Math.cos(60 * DEG)), ext: [9, 7], halb: 4.5 }
];
var view = { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 2, maxDist: 120 });
var aktiv = 0, fitDist = 0;
function bereich(w, h) {
  var tr = $('tools').getBoundingClientRect();
  return bereichFuer(w, h, tr.top, tr.bottom);
}
function distFuer(a, w, h) { return abstandFuer(a.ext, bereich(w, h), camera.fov, h); }
function gehe(i) {
  var a = AUSSCHNITTE[i]; if (!a) return;
  aktiv = i;
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === i);
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
  wzMessen();
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Nachbarlaeppchen, Zellen bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    if (weichMat(o)) { if (!weich) weich = sid; }
    else treffer = sid;
  }
  setSelected(treffer || weich || null);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Kandidaten fuer den Ankerpunkt je Ausschnitt und Struktur (Modell-Koordinaten); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren */
var KAND = [{}, {}, {}, {}];
function ankerBerechnen() {
  var P = function (a) { return V(a[0], a[1], a[2]); };
  var pol = function (r, grad, y) { return [r * Math.sin(grad * DEG), y, r * Math.cos(grad * DEG)]; };
  var platte = function (grad, r, y) { return pol(r, grad, y); };
  var OBEN = FH - 0.02, TUBE = FH + 0.02, KANAL = FH - 0.15;   /* Oberkante der Zellen, der obersten Kanälchen und der Kanäle */
  var ecken = [0, 5, 1, 4, 2, 3];
  var tria = function (art) { return ecken.map(function (k) { var e = eckePunkt(k, art); return [e[0], FH, e[1]]; }); };
  var kup = KUPFFER.map(function (q) { var p = pol(q[0], q[1], q[2]); return [p[0], p[1] + 0.3, p[2]]; });
  var Z = [{
    zentralvene: [[0, 6.5, -RZ], [0, 3.0, -RZ], [0, 1.0, -RZ]],
    balken: [platte(50, 4.6, OBEN), platte(310, 4.6, OBEN), platte(70, 5.0, OBEN), platte(290, 5.0, OBEN)],
    sinusoide: [pol(3.5, 30, KANAL), pol(3.5, 330, KANAL), pol(5.2, 60, KANAL), pol(3.5, 90, KANAL)],
    kanaelchen: [pol(4.0, 50, TUBE), pol(4.0, 310, TUBE), pol(4.5, 70, TUBE)],
    kupffer: [kup[0], kup[9], kup[6], kup[1], kup[5]],
    pfortaderast: tria('pf'), arterienast: tria('art'), gallengang: tria('gang'),
    sammelvene: [[11, SAMMEL_Y + SAMMEL_R, 0], [-11, SAMMEL_Y + SAMMEL_R, 0]],
    nachbarn: [90, 270, 30, 330, 150, 210].map(function (g) { return pol(12, g, FH); })
  }];
  Z.push({
    pfortaderast: tria('pf'), arterienast: tria('art'), gallengang: tria('gang'),
    balken: [platte(50, 5.4, OBEN), platte(70, 5.4, OBEN), platte(50, 3.6, OBEN)],
    sinusoide: [pol(4.2, 30, KANAL), pol(5.0, 60, KANAL), pol(3.5, 30, KANAL)],
    kanaelchen: [pol(5.4, 50, TUBE), pol(4.0, 50, TUBE), pol(5.4, 70, TUBE)],
    nachbarn: [pol(12, 30, FH), pol(12, 90, FH), pol(12, 330, FH)]
  });
  Z.push({
    zentralvene: [[0, 6.5, -RZ], [0, 3.0, -RZ], [0, 1.0, -RZ], [-0.64, 4.5, -0.64]],
    balken: [platte(50, 3.0, OBEN), platte(310, 3.0, OBEN), platte(50, 2.2, OBEN)],
    sinusoide: [pol(2.6, 30, KANAL), pol(2.6, 330, KANAL), pol(3.4, 60, KANAL)],
    kanaelchen: [pol(2.6, 50, TUBE), pol(2.6, 310, TUBE)],
    kupffer: [kup[5], kup[1], kup[0], kup[9]]
  });
  Z.push({
    sinusoide: [pol(3.6, 60, KANAL), pol(4.4, 60, KANAL), pol(5.2, 60, KANAL)],
    balken: [platte(50, 4.0, OBEN), platte(70, 4.0, OBEN), platte(50, 5.4, OBEN)],
    kanaelchen: [pol(5.4, 70, TUBE), pol(4.0, 70, TUBE), pol(5.4, 50, TUBE)],
    kupffer: [kup[6], kup[0]]
  });
  AUSSCHNITTE.forEach(function (a, i) { Object.keys(Z[i]).forEach(function (id) { KAND[i][id] = Z[i][id].map(P); }); });
}
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, vor dem kein undurchsichtiges
   Netz einer anderen Struktur liegt; sonst keine Beschriftung. Waehrend der Bewegung bleibt die letzte Wahl. */
var sKey = '', sT = 0, sOk = true, sichtVer = 0, VIS = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
var rayS = new THREE.Raycaster(), dirS = new THREE.Vector3();
function frei(id, p) {
  dirS.copy(p).sub(camera.position); var d = dirS.length(); dirS.normalize();
  rayS.set(camera.position, dirS); rayS.far = d;
  var hits = rayS.intersectObjects(root.children, true);
  for (var i = 0; i < hits.length; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || sid === id || !sichtbar(o) || !enabled[sid] || weichMat(o)) continue;
    if (hits[i].distance < d - 0.15) return false;
  }
  return true;
}
function sichtPruefen(now, w, h) {
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  LISTEN[aktiv].forEach(function (id) {
    if (!enabled[id]) return;
    var c = KAND[aktiv][id] || [], i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { pfortaderast: 'Pfortaderast', arterienast: 'Leberarterienast', zentralvene: 'Zentralvene', balken: 'Leberzellbalken' };
var HANDYNAME = { balken: 'Zellbalken', kanaelchen: 'Gallenkanälchen', arterienast: 'Arterienast', nachbarn: 'Nachbarn', pfortaderast: 'Pfortaderast' };   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
var HANDY_GROSS = ['zentralvene', 'balken', 'pfortaderast', 'sammelvene', 'nachbarn'];   /* Handy, Uebersicht: nur diese werden beschriftet */
var LISTEN = [
  ['zentralvene', 'balken', 'sinusoide', 'kanaelchen', 'kupffer', 'pfortaderast', 'arterienast', 'gallengang', 'sammelvene', 'nachbarn'],
  ['pfortaderast', 'arterienast', 'gallengang', 'balken', 'sinusoide', 'kanaelchen', 'nachbarn'],
  ['zentralvene', 'balken', 'sinusoide', 'kanaelchen', 'kupffer'],
  ['sinusoide', 'balken', 'kanaelchen', 'kupffer']
];
var labelBox = $('labels'), leaderSvg = $('leaders');
var LAB = {};   /* Struktur-id -> { el, ln, dot, nm, de } */
LISTEN.forEach(function (l) {
  l.forEach(function (id) {
    if (LAB[id]) return;
    var d = STRUCT[id], b = Kern.beschriftung(labelBox, leaderSvg, KURZ[id] || d.de, d.lat);
    b.nm = b.el.querySelector('b'); b.de = KURZ[id] || d.de;
    LAB[id] = b;
  });
});
var pv = new THREE.Vector3(), lastKey = '';
function schneiden(ax, ay, bx, by, cx, cy, dx, dy) {   /* Schneiden sich die Strecken (ax,ay)-(bx,by) und (cx,cy)-(dx,dy)? */
  var o = function (px, py, qx, qy, rx, ry) { return (qx - px) * (ry - py) - (qy - py) * (rx - px); };
  var d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx, dy), d3 = o(cx, cy, dx, dy, ax, ay), d4 = o(cx, cy, dx, dy, bx, by);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, sichtVer].join('|');
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
  if (showLabels && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt das Modell, ohne Beschriftung bleibt es frei */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id]) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen */
      var an = id in VIS ? VIS[id] : (KAND[aktiv][id] || [])[0];
      if (!an) return;
      pv.copy(an).project(camera);
      if (pv.z > 1) return;
      items.push({ id: id, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
    });
  }
  items.forEach(function (it) { it.side = it.sx < cx ? 'l' : 'r'; });
  ['l', 'r'].forEach(function (side) {
    var g = items.filter(function (it) { return it.side === side; }).sort(function (p, q) { return p.sy - q.sy; });
    var top = side === 'l' ? topL : topR, bot = side === 'l' ? botL : botR, gp = g.length > 1 ? Math.min(gap, (bot - top) / (g.length - 1)) : gap, y = top;
    g.forEach(function (it) { it.ly = Math.max(y, Math.min(bot, it.sy)); y = it.ly + gp; });
    var over = y - gp - bot;
    if (over > 0) {   /* zu weit nach unten geschoben: hochruecken, dabei nicht ueber den Rand der Spalte hinaus (von oben neu ordnen) */
      g.forEach(function (it) { it.ly -= over; });
      y = top; g.forEach(function (it) { it.ly = Math.max(it.ly, y); y = it.ly + gp; });
    }
    /* Fuehrungslinien duerfen sich nicht kreuzen: kreuzen sich zwei Linien, tauschen ihre Namen die Plaetze */
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
var App = window.LaeppchenApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris };
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
  document.body.classList.remove('ueben');
  clearTimeout(Kern.toast._t);
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  wzEnde();
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
  delete window.LaeppchenApp;
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
Kern.organ('laeppchen', organ);
})();
