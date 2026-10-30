/* =====================================================================
   Leberläppchen - Sinusoide, Leberzellbalken und Galle
   Ein einzelnes Leberläppchen (Lobulus hepatis), stark vergrößert: eine sechseckige Säule (Achse senkrecht, y nach oben, Ecken bei 30° + 60° · k; Winkel α von +z
   aus, x = r·sin α, z = r·cos α) mit der Zentralvene in der Mitte, den Leberzellbalken (einzelne Zellen, strahlenförmig von den Ecken zur Mitte), den Sinusoiden
   dazwischen, Gallenkanälchen, Kupffer-Zellen und an jeder Ecke der Glisson-Trias (Pfortaderast, Leberarterienast, Gallengang). Ein Keil von 60° vorn ist
   aufgeschnitten, damit Zentralvene und Balken im Inneren sichtbar sind. Darunter liegt die Sammelvene, ringsum sind die Nachbarläppchen als Glas angedeutet.
   Modelleinheit: 1 Einheit = 0,1 mm (Läppchen: Ecke zu Mitte 8 Einheiten, Höhe der gezeigten Säule 8 Einheiten); die Größen sind symbolisch.
   Alles ist festgelegt, kein Zufall. Grundgerüst wie die Leber: 10 Strukturen mit je eigenem Material, Ausschnitte, Durchsicht, Beschriftung, Infokarte,
   Strukturliste, Lesehilfe. Dazu Strömung mit Mahlzeit und den Stoffen Zucker, Ammoniak/Harnstoff und Bilirubin (Abschnitt 6), Schema als Querschnitt von oben
   (Abschnitt 7), Hilfekarten und Üben (Strukturen finden, drei Wege).
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
    txt: 'Jedes Läppchen ist von weiteren umgeben; sie teilen sich die Periportalfelder an den Ecken. Eine Leber hat Hunderttausende davon. Hier sind die Nachbarläppchen nur angedeutet.',
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
    <button id="bSchema" class="gh" title="Das Leberläppchen als flaches Schema: gleiche Teilchen, gleiche Strömung">Schema</button>
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
/* Hilfekarten: [Schlüssel, Titel, Text, Merke] */
var HILFE = [
  ['aufbau', 'Aufbau des Leberläppchens', 'Die Leber besteht aus Hunderttausenden Läppchen, jedes nur 1–2 mm groß und im Schnitt sechseckig. In der Mitte liegt die Zentralvene, an den Ecken die Periportalfelder mit je einem Ast von Pfortader und Leberarterie und einem Gallengang (Glisson-Trias). Dazwischen ziehen die Leberzellbalken strahlenförmig zur Mitte, getrennt von den Sinusoiden.',
    'Jedes Periportalfeld gehört zu mehreren Nachbarläppchen zugleich.'],
  ['richtung', 'Blut nach innen, Galle nach außen', 'Das Blut aus Pfortader und Leberarterie strömt an den Ecken in die Sinusoide, mischt sich und fließt langsam an den Leberzellen vorbei zur Zentralvene. Die Wand der Sinusoide hat Lücken, deshalb erreicht das Blutplasma die Leberzellen direkt; Kupffer-Zellen fangen Keime aus dem Darm ab. Die Galle fließt in den Gallenkanälchen in die Gegenrichtung zu den Gallengängen an den Ecken.',
    'Blut und Galle berühren sich nie – die Leberzelle liegt immer dazwischen.'],
  ['fabrik', 'Die Leberzelle als Fabrik', 'Eine Leberzelle hat viele Aufgaben: Nach dem Essen nimmt sie Zucker auf und speichert ihn als Glykogen, nüchtern gibt sie ihn wieder ab. Sie bildet Albumin und Gerinnungsfaktoren. Giftiges Ammoniak aus dem Eiweißabbau wandelt sie in Harnstoff um, den die Niere ausscheidet. Den gelben Farbstoff Bilirubin aus alten roten Blutkörperchen macht sie wasserlöslich und gibt ihn mit der Galle ab. Auch Alkohol und viele Medikamente baut sie ab.',
    'Steigt das Ammoniak im Blut, weil die Leber versagt, wird der Mensch verwirrt und schläfrig (hepatische Enzephalopathie).'],
  ['zonen', 'Zonen des Läppchens', 'Das Blut gibt auf dem Weg zur Mitte Sauerstoff ab. Außen, nah an den Periportalfeldern (Zone 1), ist es noch sauerstoffreich, um die Zentralvene (Zone 3) sauerstoffarm. Die Zellen um die Zentralvene sind deshalb am empfindlichsten: Bei Sauerstoffmangel, etwa im Schock, und bei einer Paracetamol-Überdosis gehen sie zuerst zugrunde. Hier bauen die Zellen auch viel Alkohol und Medikamente ab.',
    'Schäden der Leber beginnen oft um die Zentralvene.'],
  ['modell', 'So liest du das Modell', 'Ein einzelnes Läppchen ist stark vergrößert dargestellt, ein Keil ist aufgeschnitten. Violett ist Blut aus der Pfortader, rot aus der Leberarterie, blau das Blut zur Zentralvene, grün die Galle. Mit den Schaltern unter „Stoffe“ zeigst du Zucker, Ammoniak (mit Harnstoff) und Bilirubin. Der Schalter „nüchtern / nach dem Essen“ zeigt, ob die Leberzellen Zucker speichern oder abgeben. Die Teilchen zeigen die Richtung – symbolisch, nicht maßstäblich.',
    'Das Leberläppchen ist die kleinste Baueinheit der Leber – so wie das Nephron in der Niere.']
];
/* Üben "Wege verfolgen": feste Reihenfolge der drei Wege (Daten; die Abfolge im Code kennt keine Läppchen-Besonderheiten) */
var WEGE = [
  { titel: 'Blut aus der Pfortader', aufgabe: 'Das Blut kommt aus dem Darm. Tippe seine Stationen im Läppchen der Reihe nach an.',
    stationen: [{ ids: ['pfortaderast'] }, { ids: ['sinusoide'] }, { ids: ['zentralvene'] }],
    abschluss: 'Geschafft: Das Pfortaderblut fließt an den Leberzellen vorbei zur Zentralvene – dabei holen die Zellen heraus, was sie brauchen und was sie entgiften.' },
  { titel: 'Blut aus der Leberarterie', aufgabe: 'Das Blut kommt aus der Aorta. Tippe seine Stationen im Läppchen der Reihe nach an.',
    stationen: [{ ids: ['arterienast'] }, { ids: ['sinusoide'] }, { ids: ['zentralvene'] }],
    abschluss: 'Geschafft: Arterien- und Pfortaderblut mischen sich in den Sinusoiden und fließen gemeinsam zur Zentralvene.' },
  { titel: 'Galle', aufgabe: 'Die Galle entsteht in den Leberzellen. Tippe ihre Stationen der Reihe nach an.',
    stationen: [{ ids: ['balken'] }, { ids: ['kanaelchen'] }, { ids: ['gallengang'] }],
    abschluss: 'Geschafft: Die Galle fließt von innen nach außen – genau entgegen dem Blut.' }
];
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
  var base = Kern.srgb(0xC27B62), n = 0, hg = [];
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
          hg.push(hash(n + 101));   /* Reihenfolge, in der sich die Zellen mit Glykogen füllen (Abschnitt 6) */
          n++;
        }
      }
    }
  });
  return { n: n, mat: new Float32Array(mat), col: new Float32Array(col), h: new Float32Array(hg) };
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
function nachbarnGeo() {   /* Seitenwände der sechs Nachbarsäulen (gemeinsame Wände nur einmal) und ihre Kanten als dünne Rohre */
  var pos = [], nor = [], idx = [], schon = {}, kanten = [], kv = {}, kh = {};
  NACHBAR_WINKEL.forEach(function (w) {
    var cx = 2 * FAPO * Math.sin(w * DEG), cz = 2 * FAPO * Math.cos(w * DEG), k;
    for (k = 0; k < 6; k++) {
      var a0 = eckeWinkel(k), a1 = eckeWinkel(k + 1);
      var x0 = cx + FR * Math.sin(a0), z0 = cz + FR * Math.cos(a0), x1 = cx + FR * Math.sin(a1), z1 = cz + FR * Math.cos(a1);
      var kA = x0.toFixed(2) + ',' + z0.toFixed(2), kB = x1.toFixed(2) + ',' + z1.toFixed(2), key = kA < kB ? kA + '|' + kB : kB + '|' + kA;
      if (schon[key]) continue; schon[key] = true;
      if (!kv[kA]) { kv[kA] = true; kanten.push(strecke([x0, 0, z0], [x0, FH, z0], 0.09, 3, true)); }
      if (!kv[kB]) { kv[kB] = true; kanten.push(strecke([x1, 0, z1], [x1, FH, z1], 0.09, 3, true)); }
      kanten.push(strecke([x0, 0, z0], [x1, 0, z1], 0.09, 3, true), strecke([x0, FH, z0], [x1, FH, z1], 0.09, 3, true));
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
  var nw = pos.length / 3, kg = fuegen(kanten), alle = fuegen([{ g: g, m: new THREE.Matrix4() }, { g: kg, m: new THREE.Matrix4() }]), col = [], i;
  for (i = 0; i < alle.attributes.position.count; i++) col.push(1, 1, 1, i < nw ? 0.125 : 1);   /* Alpha: Wände 0,125, Kanten 1 (mal Materialdeckkraft 0,4) */
  alle.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  return alle;
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
    nachbarn: [0xC7A58F, { rough: 0.6, opacity: 0.4, side: D, vc: true }, 6]   /* Deckkraft je Ecke über die Vertexfarbe (Alpha): Wände ca. 0,05, Kanten 0,4 */
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
function bereichFuer(w, h, toolsOben, toolsUnten, ueben) {
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 60, y1: Math.max(150, toolsOben - 14 - 0.26 * h), labW: 104, fit: 70 };   /* Handy beim Üben: die Karte (26 % der Höhe) liegt direkt über der Werkzeugleiste, das Läppchen steht darüber */
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
    if (t.sid === 'balken') { zellH = t.inst.h; zellBasis = new Float32Array(t.inst.col); zellMesh = m; }   /* für das Glykogen (Abschnitt 6) */
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
var playing = true, speed = 1, clock = 0, mahlzeit = false, stoffe = { zucker: true, ammoniak: true, bilirubin: true };   /* Zustand der Schalter und die Uhr der Strömung (Abschnitt 6) */

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
var quiz = null, quizT = null;   /* Üben "Strukturen finden": { n, ok, target, last, wait } */
var wege = null, wegeT = null;   /* Üben "Wege verfolgen" */

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
  /* Hilfekarten */
  var ih = document.createElement('p'); ih.className = 'dis-intro'; ih.textContent = 'Kurz erklärt – tippe eine Karte an, sie erscheint unten.'; paneH.appendChild(ih);
  HILFE.forEach(function (c) {
    var d = document.createElement('div'); d.className = 'dis'; d.tabIndex = 0; d.dataset.card = c[0];
    d.innerHTML = '<span><b></b></span>'; d.querySelector('b').textContent = c[1];
    d.addEventListener('click', function () { openHelp(c[0]); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter') openHelp(c[0]); });
    paneH.appendChild(d);
  });
  /* Ueben: Strukturen finden und Wege verfolgen (schliessen sich gegenseitig aus) */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur am Leberläppchen und tippe sie an. Die Beschriftung verschwindet solange. Oder verfolge den Weg von Blut und Galle: Tippe die Stationen der Reihe nach an.'; paneU.appendChild(iu);
  var pb = document.createElement('div'); pb.className = 'pane-btn';
  var bq = document.createElement('button'); bq.className = 'gh'; bq.id = 'bQuiz'; bq.textContent = 'Strukturen finden';
  bq.addEventListener('click', function () { quiz ? quizEnd() : quizStart(); });
  var bw = document.createElement('button'); bw.className = 'gh'; bw.id = 'bWege'; bw.textContent = 'Wege verfolgen';
  bw.addEventListener('click', function () { wege ? wegeEnd() : wegeStart(); });
  pb.appendChild(bq); pb.appendChild(bw); paneU.appendChild(pb);
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
/* =====================================================================
   Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (Handy: oben, endet ueber der Werkzeugleiste)
   ===================================================================== */
function showCard(kick, title, lead, after, istQuiz) {
  schemaWeicht();                                        /* das Schema weicht der Hilfekarte und dem Ueben */
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  $('sLead').textContent = lead;
  var A = $('sAfter'); A.innerHTML = '';
  if (after) { var h5 = document.createElement('h5'); h5.textContent = after.h; var p = document.createElement('p'); p.textContent = after.t; A.appendChild(h5); A.appendChild(p); }
  $('sQa').style.display = istQuiz ? 'flex' : 'none';
  if (selected && !istQuiz) setSelected(null);
  $('scard').classList.add('show');
  $('info').classList.remove('show');
  lv++;
}
function closeCard() {
  $('scard').classList.remove('show');
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.remove('on'); });
  lv++;
}
function openHelp(key) {
  var c = HILFE.filter(function (x) { return x[0] === key; })[0]; if (!c) return;
  if (quiz) quizEnd();
  if (wege) wegeEnd();
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.toggle('on', d.dataset.card === key); });
  showCard('Hilfekarte', c[1], c[2], c[3] ? { h: 'Merke', t: c[3] } : null, false);
}
/* Eine Struktur kurz hervorheben (Antwort beim Ueben), ohne Infokarte; jede Struktur hat ihr eigenes Material, es leuchtet nur sie */
function leuchte(id, an) {
  if (!STRUCT[id]) return;
  var brass = srgb(0xE0A94A);
  STRUCT[id].meshes.forEach(function (m) {
    var mt = m.material;
    if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)).add(brass.clone().multiplyScalar(an ? 0.28 : 0));
  });
}
/* Ueben "Strukturen finden": alle eingeblendeten Strukturen ausser den Nachbarlaeppchen. Math.random nur hier, bei der Auswahl der gesuchten Struktur (wie bei Leber und Niere). */
function quizPool() {
  return ORDER.filter(function (s) { return s.meshes.length && enabled[s.id] && s.id !== 'nachbarn'; }).map(function (s) { return s.id; });
}
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  showCard('Üben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe das Läppchen, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizNeu() { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); }
function uebenKlasse() { document.body.classList.toggle('ueben', !!(quiz || wege)); groesse(window.innerWidth, window.innerHeight); }   /* Handy: Karte unten, Bildbereich darueber */
function quizStart() {
  if (wege) wegeEnd();
  setSelected(null); quiz = { n: 0, ok: 0, target: null, last: null, wait: false };
  $('bQuiz').classList.add('on'); $('bQuiz').textContent = 'Üben beenden';
  $('qNext').textContent = 'Nächste'; $('qNext').style.display = '';
  uebenKlasse(); lv++; quizNext();
}
function quizEnd() {
  clearTimeout(quizT);
  if (quiz && quiz.target) leuchte(quiz.target, false);
  quiz = null; closeCard(); $('bQuiz').classList.remove('on'); $('bQuiz').textContent = 'Strukturen finden';
  uebenKlasse();
}
function quizAntwort(sid, durch) {   /* durch: Strukturen, durch die man hindurchsieht (durchscheinende Treffer vor dem ersten undurchsichtigen) */
  var Q = quiz; if (!Q || !Q.target || Q.wait) return;
  Q.n++; Q.wait = true;
  var ok = sid === Q.target || durch.indexOf(Q.target) >= 0; if (ok) { Q.ok++; sid = Q.target; }
  var L = $('sLead'); L.innerHTML = '';
  var sp = document.createElement('span'); sp.className = ok ? 'ok' : 'no';
  sp.textContent = ok ? 'Richtig.' : (sid && STRUCT[sid] ? 'Das war: ' + STRUCT[sid].de + '. Die gesuchte Struktur leuchtet jetzt.' : 'Daneben – die gesuchte Struktur leuchtet jetzt.');
  L.appendChild(sp);
  $('sScore').textContent = Q.ok + ' von ' + Q.n + ' richtig';
  leuchte(Q.target, true);
  var tg = Q.target;
  quizT = setTimeout(function () { leuchte(tg, false); if (quiz) quizNext(); }, ok ? 1200 : 2400);
}
/* Ueben "Wege verfolgen": die Stationen eines Weges (WEGE) der Reihe nach antippen. Zustand wege: nr = Weg, st = naechste Station, n = erledigte Stationen,
   ok = davon auf Anhieb richtig, fehl = Fehler in Folge bei der gesuchten Station, liste = Namen der erledigten Stationen, fertig = Weg abgeschlossen.
   Die Wege schalten am Modell nichts um ausser der Durchsicht (die Sinusoide liegen zwischen den Zellbalken); beim Beenden kehrt sie zurueck. */
function wegeName(s) { return s.de || STRUCT[s.ids[0]].de; }
function wegeLeuchtAus() {
  clearTimeout(wegeT);
  if (wege && wege.leucht) wege.leucht.forEach(function (id) { leuchte(id, false); });
  if (wege) wege.leucht = [];
}
function wegeLeuchte(ids, ms) {
  wegeLeuchtAus();
  ids.forEach(function (id) { leuchte(id, true); });
  wege.leucht = ids.slice();
  wegeT = setTimeout(wegeLeuchtAus, ms);
}
function wegeZeigen() {
  var w = WEGE[wege.nr], last = wege.nr === WEGE.length - 1;
  showCard('Üben · Wege verfolgen', 'Weg ' + (wege.nr + 1) + ' von ' + WEGE.length + ': ' + w.titel, '', null, true);
  var L = $('sLead');
  var kasten = function (kl) { var d = document.createElement('div'); d.className = kl; L.appendChild(d); return d; };
  var zeile = function (kl, t, in_) { var d = document.createElement('div'); d.className = kl; d.textContent = t; (in_ || L).appendChild(d); return d; };
  var txt = kasten('wg-text' + (wege.fertig ? ' fertig' : ''));   /* Aufgabe und Hinweis: scrollen auf dem Handy */
  zeile('wg-auf', w.aufgabe, txt);
  if (w.hinweis) zeile('wg-hint', w.hinweis, txt);
  zeile('wg-liste', wege.liste.length || wege.fertig ? wege.liste.join(' → ') + (wege.fertig ? '' : ' → …') : '…');
  if (wege.text) zeile('wg-rueck ' + (wege.text.ok ? 'ok' : 'no'), wege.text.t);
  if (wege.fertig) {
    var ab = kasten('wg-abw');
    zeile('wg-ab', w.abschluss, ab);
    if (last) zeile('wg-ab', 'Alle drei Wege geschafft.', ab);
  }
  $('sScore').textContent = wege.ok + ' von ' + wege.n + ' Stationen auf Anhieb richtig';
  $('qNext').style.display = last ? 'none' : '';
}
function wegeSetzen(nr) {
  wegeLeuchtAus();
  wege.nr = nr; wege.st = 0; wege.fehl = 0; wege.liste = []; wege.fertig = false; wege.text = null;
  wegeZeigen();
}
function wegeStart() {
  if (quiz) quizEnd();
  setSelected(null);
  wege = { nr: 0, st: 0, n: 0, ok: 0, fehl: 0, liste: [], fertig: false, text: null, leucht: [], vorher: { durch: seeThrough } };
  durchsicht(true);                                      /* Sinusoide, Kanälchen und Zentralvene liegen zwischen und in den Zellbalken: nur bei Durchsicht sicher antippbar */
  $('bWege').classList.add('on'); $('bWege').textContent = 'Wege beenden';
  $('qNext').textContent = 'Nächster Weg';
  uebenKlasse();
  wegeSetzen(0);
}
function wegeEnd() {
  var v = wege && wege.vorher;
  wegeLeuchtAus();
  wege = null; closeCard(); uebenKlasse();
  $('bWege').classList.remove('on'); $('bWege').textContent = 'Wege verfolgen';
  if (v) durchsicht(v.durch);                            /* Durchsicht wie vorher */
}
function wegeAntwort(sid, durch) {
  var W = wege; if (!W || W.fertig || !sid) return;    /* ins Leere getippt: keine Wertung */
  var w = WEGE[W.nr], s = w.stationen[W.st], name = wegeName(s);
  var ok = s.ids.some(function (id) { return id === sid || durch.indexOf(id) >= 0; });
  if (ok) {
    if (!W.fehl) W.ok++;
    W.n++; W.liste.push(name); W.st++; W.fehl = 0;
    W.text = { ok: true, t: 'Richtig: ' + name + '.' };
    wegeLeuchte(s.ids, 1200);
  } else {
    W.fehl++;
    var das = 'Das war: ' + (STRUCT[sid] ? STRUCT[sid].de : '?') + '. ';
    if (W.fehl < 2) W.text = { ok: false, t: das + 'Gesucht ist die ' + (W.st === 0 ? 'erste' : 'nächste') + ' Station.' };
    else {                                               /* zweiter Fehler in Folge: die Station leuchtet, gilt als erledigt, zaehlt nicht als "auf Anhieb" */
      W.text = { ok: false, t: das + 'Die gesuchte Station leuchtet jetzt.' };
      W.n++; W.liste.push(name); W.st++; W.fehl = 0;
      wegeLeuchte(s.ids, 2400);
    }
  }
  if (W.st >= w.stationen.length) W.fertig = true;
  wegeZeigen();
}
$('sClose').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); else closeCard(); };
$('qNext').onclick = function () {
  if (quiz) quizNeu();
  else if (wege && wege.nr < WEGE.length - 1) wegeSetzen(wege.nr + 1);
};
$('qStop').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); };

/* Schalter der Stroemung, der Mahlzeit und der Stoffe (Abschnitt 6) */
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
/* Mahlzeit-Schalter: nuechtern (die Leberzellen geben Zucker aus dem Glykogen ab) oder nach dem Essen (sie nehmen Zucker auf und speichern ihn) */
function setMahlzeit(an, still) {
  if (an === mahlzeit) return;
  mahlzeit = an;
  $('bNuechtern').classList.toggle('on', !an);
  $('bEssen').classList.toggle('on', an);
  if (!still) Kern.toast(MAHLZEIT_TXT[an ? 1 : 0]);
}
$('bNuechtern').onclick = function () { setMahlzeit(false); };
$('bEssen').onclick = function () { setMahlzeit(true); };
var STOFFE = [['bZucker', 'zucker'], ['bAmmoniak', 'ammoniak'], ['bBilirubin', 'bilirubin']];
function setStoff(name, an) {
  stoffe[name] = !!an;
  STOFFE.forEach(function (b) { if (b[1] === name) $(b[0]).classList.toggle('on', !!an); });
  if (ST) ST.gruppen.forEach(function (g) { if (g.stoff === name) g.im.visible = !!an; });
}
STOFFE.forEach(function (b) { $(b[0]).onclick = function () { setStoff(b[1], !stoffe[b[1]]); }; });

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
  return bereichFuer(w, h, tr.top, tr.bottom, document.body.classList.contains('ueben'));
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
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, durch = [];
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    durch.push(sid);                                     /* Strukturen bis zum ersten undurchsichtigen Treffer (fuer das Ueben) */
    if (weichMat(o)) { if (!weich) weich = sid; }
    else treffer = sid;
  }
  if (wege) { wegeAntwort(treffer || weich || null, durch); return; }
  if (quiz) { quizAntwort(treffer || weich || null, durch); return; }
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
    nachbarn: [90, 270, 30, 330, 150, 210].map(function (g) { return pol(16, g, FH / 2); })   /* Mitte der äußeren senkrechten Kanten der Nachbarsäulen */
  }];
  Z.push({
    pfortaderast: tria('pf'), arterienast: tria('art'), gallengang: tria('gang'),
    balken: [platte(50, 5.4, OBEN), platte(70, 5.4, OBEN), platte(50, 3.6, OBEN)],
    sinusoide: [pol(4.2, 30, KANAL), pol(5.0, 60, KANAL), pol(3.5, 30, KANAL)],
    kanaelchen: [pol(5.4, 50, TUBE), pol(4.0, 50, TUBE), pol(5.4, 70, TUBE)],
    nachbarn: [pol(16, 30, FH / 2), pol(16, 90, FH / 2), pol(16, 330, FH / 2), pol(16, 30, FH * 0.8), pol(16, 90, FH * 0.8), pol(16, 330, FH * 0.8)]
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
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, der im Bild liegt und vor dem kein undurchsichtiges
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
var pS = new THREE.Vector3();
function imBild(p) {   /* Anker liegt sichtbar im Bild (nicht am Rand, nicht hinter der Kamera) */
  pS.copy(p).project(camera);
  return pS.z < 1 && Math.abs(pS.x) < 0.9 && Math.abs(pS.y) < 0.9;
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
    for (i = 0; i < c.length; i++) if (imBild(c[i]) && frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { pfortaderast: 'Pfortaderast', arterienast: 'Leberarterienast', zentralvene: 'Zentralvene', balken: 'Leberzellbalken' };
var HANDYNAME = { balken: 'Zellbalken', kanaelchen: 'Gallenkanälchen', arterienast: 'Arterienast', pfortaderast: 'Pfortaderast' };   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
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
   6. Stroemung: Blut (violett aus den Pfortaderaesten, rot aus den Arterienaesten, auf dem Weg zur Mitte allmaehlich blau), Galle (gruen) und die Stoffe Zucker (gelb),
   Ammoniak (orange, in den Leberzellen zu Harnstoff, weiss) und Bilirubin (braun, in den Leberzellen zu gruener Galle), dazu der Mahlzeit-Schalter.
   Symbolisch, nicht massstaeblich. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des Teilchens: kein Zufall, die Anzahl steht beim
   Aufbau fest. Je Art ein InstancedMesh (ein Zeichenaufruf, Farbe je Teilchen ueber instanceColor). Jedes Teilchen hat eine feste Route (Linienzug aus Knoten mit
   Tempo, Rohrradius und Farbwert) und laeuft darauf mit einer Phase aus Index und clock; am Anfang und Ende blendet es weich ein bzw. aus.
   Blut: Pfortader-/Arterienast an einer Ecke -> Rand des Laeppchens -> Sinusoid (an der Ecke oder in der Mitte eines Sechstels; die Kanaele im aufgeschnittenen Keil
   entfallen) zur Mitte -> Zentralvene -> nach unten -> Sammelvene. Galle: Kanaelchen in der Plattenmitte -> nach aussen -> Gallengang an der Ecke -> laengs nach unten/oben.
   Zucker: nach dem Essen biegt er aus dem Sinusoid in eine Leberzelle ab (Zellen werden heller: Glykogen), nuechtern kommt er aus der Zelle ins Sinusoid zurueck.
   Ammoniak geht in die Zelle und kommt als Harnstoff ins Sinusoid zurueck; Bilirubin geht in die Zelle und fliesst als Galle durch das Kanaelchen ab.
   `anteil` blendet die beiden Zuckerwege weich ueber (1,5 s), `glyk` (0..1) fuellt bzw. leert die Zellen (nach dem Essen 5 s, nuechtern 8 s).
   ===================================================================== */
var anteil = 0, glyk = 0, glykGezeigt = -1;   /* anteil: Ueberblendung der Zuckerwege 0..1; glyk: Glykogenfuellung der Zellen 0..1 */
var STR = { ANTEIL: 1.5, AUFNAHME: 5, ABGABE: 8, FADE: 0.5 };
var ST = null;                                 /* nach dem Aufbau: Gruppen { art, stoff, list, im, ... } */
var zellH = null, zellBasis = null, zellMesh = null;   /* Zellen der Leberzellbalken: Reihenfolge der Fuellung, Grundfarben, Netz */
var STQ = { x: 0, y: 0, z: 0, s: 0, c: 0 }, STM = new THREE.Matrix4();
var R2A = 0.7548776662466927, R2B = 0.5698402909980532;   /* Plastikzahl-Folge (R2): gleichmaessig verteilte Paare aus dem Index */
function bruch(v) { return v - Math.floor(v); }
function sstep6(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
function klemme(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function norm6(a) { return ((a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI; }
function polar(r, a, y) { return [r * Math.sin(a), y, r * Math.cos(a)]; }
function finde(A, x, n) {   /* Suche in einer aufsteigenden Tabelle A (n Werte): groesstes i <= n - 2 mit A[i] <= x */
  var lo = 0, hi = n - 1;
  while (hi - lo > 1) { var m = (lo + hi) >> 1; if (A[m] <= x) lo = m; else hi = m; }
  return lo;
}
/* Die Wege im Laeppchen: Sinusoide (ohne die Kanaele im Keil) mit den benachbarten Zellbalken, Zellbalken ohne die im Keil */
var RAND = 6.85;                               /* Radius der Bahn am Rand des Laeppchens, von den Aesten der Ecke zum Sinusoid */
var PL = PLATTEN.filter(function (p) { return !p.keil; });
var LANES = [];
LUECKEN.forEach(function (g) {
  if (Math.abs(norm6(g.a)) < FWK + DEG) return;   /* wie sinusoidDaten */
  LANES.push({ a: g.a, rin: g.rin, raus: g.raus, pl: PL.filter(function (p) { return Math.abs(norm6(p.a - g.a)) < 21 * DEG; }) });
});
var ECKLANES = [0, 1, 2, 3, 4, 5].map(function (k) { return LANES.filter(function (l) { return Math.abs(norm6(l.a - eckeWinkel(k))) < 31 * DEG; }); });
/* Farben (Grundfarbe, Zielfarbe: der Farbwert 0..1 der Route mischt sie) und Groesse; Anzahl je Gruppe */
var GRP = [
  { art: 'pfortader', name: 'Pfortaderblut', c0: 0xA58BE6, c1: 0x6F93E0, s: 0.18, n: 56 },
  { art: 'arterie', name: 'Arterienblut', c0: 0xE0584C, c1: 0x6F93E0, s: 0.18, n: 34 },
  { art: 'zucker-ein', stoff: 'zucker', name: 'Zucker (in die Leberzellen)', c0: 0xE6C94A, c1: 0xE6C94A, s: 0.2, n: 26, kind: 1 },
  { art: 'zucker-aus', stoff: 'zucker', name: 'Zucker (aus den Leberzellen)', c0: 0xE6C94A, c1: 0xE6C94A, s: 0.2, n: 26, kind: 2 },
  { art: 'ammoniak', stoff: 'ammoniak', name: 'Ammoniak', c0: 0xF09A3E, c1: 0xF09A3E, s: 0.2, n: 22, mode: 1 },
  { art: 'harnstoff', stoff: 'ammoniak', name: 'Harnstoff', c0: 0xF2F2EE, c1: 0xF2F2EE, s: 0.19, n: 22, mode: 2 },
  { art: 'bilirubin', stoff: 'bilirubin', name: 'Bilirubin', c0: 0xB98A5E, c1: 0x8CCB6A, s: 0.2, n: 22 },
  { art: 'galle', name: 'Galle', c0: 0x8CCB6A, c1: 0x8CCB6A, s: 0.14, n: 48 }
];
function knoten(p, v, rad, c) { return [p[0], p[1], p[2], v, rad, c]; }   /* x, y, z, Tempo auf dem Stueck dorthin (Einheiten/s), Rohrradius, Farbwert */
function routeAus6(N, iC) {
  var n = N.length, T = new Float32Array(n), k;
  for (k = 1; k < n; k++) {
    var len = Math.sqrt(Math.pow(N[k][0] - N[k - 1][0], 2) + Math.pow(N[k][1] - N[k - 1][1], 2) + Math.pow(N[k][2] - N[k - 1][2], 2));
    T[k] = T[k - 1] + len / N[k][3];
  }
  return { n: n, N: N, T: T, W: T[n - 1], tC: iC === undefined ? -1 : T[iC] };
}
/* Bausteine der Routen */
function laneKnoten(lane, r, y, v, blau) { return knoten(polar(r, lane.a, y), v, 0.25, blau ? klemme((lane.raus - r) / (lane.raus - 1.0)) : 0); }
function einlauf(k, art, lane, y, blau) {   /* vom unteren Ende des Astes an der Ecke k bis zum Anfang des Sinusoids */
  var e = eckePunkt(k, art), a = eckeWinkel(k), dd = norm6(lane.a - a), m = Math.abs(dd) > 1e-6 ? 3 : 0, s, N = [];
  N.push(knoten([e[0], UNTEN + 0.3, e[1]], 1, TR[art], 0));
  N.push(knoten([e[0], y, e[1]], art === 'pf' ? 3.0 : 3.4, TR[art], 0));
  N.push(knoten(polar(RAND, a, y), 2.4, 0.1, 0));
  for (s = 1; s <= m; s++) N.push(knoten(polar(RAND, a + dd * s / m, y), 2.4, 0.1, 0));
  N.push(laneKnoten(lane, lane.raus, y, 2.0, blau));
  return N;
}
function abfluss(lane, y, sign) {   /* vom inneren Ende des Sinusoids durch die Zentralvene nach unten und in die Sammelvene */
  return [laneKnoten(lane, 1.0, y, 1.4, true), knoten([0, y, 0], 1.4, RZ, 1), knoten([0, SAMMEL_Y, 0], 3.2, RZ, 1), knoten([sign * 13, SAMMEL_Y, 0], 3.5, SAMMEL_R, 1)];
}
/* Zelle neben dem Sinusoid: Zellbalken pl, Radius rc im Sinusoid; Mitte der Zelle auf der Seite zum Sinusoid */
function zelle(lane, pl, rc, y) {
  var side = norm6(lane.a - pl.a) > 0 ? 1 : -1, cw = colW(rc), v = side * (cw / 2 + ZLUECKE / 2), si = Math.sin(pl.a), co = Math.cos(pl.a);
  return [rc * si + v * co, y, rc * co - v * si];
}
function naechsteYK(y) { var b = YK[0]; YK.forEach(function (q) { if (Math.abs(q - y) < Math.abs(b - y)) b = q; }); return b; }
/* Auswahl je Teilchen aus dem Index j: Ecke, Sinusoid, Zellbalken, Zellreihe (Hoehe), Radius der Abbiegestelle, Abflussrichtung */
function wahl(j) {
  var k = Math.floor(bruch(0.5 + j * R2A) * 6), opt = ECKLANES[k], lane = opt[Math.floor(bruch(0.3 + j * R2B) * opt.length)];
  var pl = lane.pl[Math.floor(bruch(0.2 + j * 0.7320508) * lane.pl.length)];
  var rmin = Math.max(lane.rin, pl.rin) + 0.5, rmax = Math.min(lane.raus, pl.raus) - 0.5;
  return { k: k, lane: lane, pl: pl, y: (Math.floor(bruch(0.7 + j * 0.41421356) * NREIHEN) + 0.5) * DR, rc: rmin + (rmax - rmin) * bruch(0.4 + j * 0.6180339887),
    art: bruch(0.6 + j * 0.8660254) < 0.62 ? 'pf' : 'art', sign: bruch(0.1 + j * 0.2360679) < 0.5 ? -1 : 1, hoch: bruch(0.9 + j * 0.3027756) < 0.5 };
}
/* Route des Teilchens i der Gruppe g */
function routeFuer(g, i) {   /* g: Eintrag aus GRP */
  var j = i + 53 * GRP.indexOf(g) + 1, w, N, iC, gp, yk, e;
  if (g.art === 'pfortader' || g.art === 'arterie') {
    w = wahl(j); w.art = g.art === 'pfortader' ? 'pf' : 'art';
    return routeAus6(einlauf(w.k, w.art, w.lane, w.y, true).concat(abfluss(w.lane, w.y, w.sign)));
  }
  if (g.art === 'zucker-ein') {   /* im Pfortaderblut bis zur Abbiegestelle, dann in die Zelle */
    w = wahl(j);
    N = einlauf(w.k, 'pf', w.lane, w.y, false); N.push(laneKnoten(w.lane, w.rc, w.y, 1.6, false)); N.push(knoten(zelle(w.lane, w.pl, w.rc, w.y), 1.2, 0, 0));
    return routeAus6(N);
  }
  if (g.art === 'zucker-aus') {   /* aus der Zelle ins Sinusoid und weiter zur Zentralvene */
    w = wahl(j);
    N = [knoten(zelle(w.lane, w.pl, w.rc, w.y), 1, 0, 0), laneKnoten(w.lane, w.rc, w.y, 1.2, false)];
    return routeAus6(N.concat(abfluss(w.lane, w.y, w.sign)));
  }
  if (g.art === 'ammoniak' || g.art === 'harnstoff') {   /* eine Route fuer beide: Ammoniak bis in die Zelle, Harnstoff ab dort */
    w = wahl(i + 53 * 4 + 1);
    N = einlauf(w.k, 'pf', w.lane, w.y, false); N.push(laneKnoten(w.lane, w.rc, w.y, 1.6, false));
    N.push(knoten(zelle(w.lane, w.pl, w.rc, w.y), 1.2, 0, 0)); iC = N.length - 1;
    N.push(laneKnoten(w.lane, Math.max(w.lane.rin, w.rc - 0.9), w.y, 1.2, false));
    return routeAus6(N.concat(abfluss(w.lane, w.y, w.sign)), iC);
  }
  if (g.art === 'bilirubin') {   /* aus dem Blut in die Zelle, dort braun -> gruen, durch das Kanaelchen zum Gallengang */
    w = wahl(j); yk = naechsteYK(w.y); gp = eckePunkt(w.pl.ecke, 'gang');
    N = einlauf(w.k, 'pf', w.lane, w.y, false); N.push(laneKnoten(w.lane, w.rc, w.y, 1.6, false));
    N.push(knoten(zelle(w.lane, w.pl, w.rc, w.y), 1.2, 0, 0));
    N.push(knoten(polar(w.rc, w.pl.a, yk), 1.0, 0.1, 1));
    N.push(knoten(polar(w.pl.raus, w.pl.a, yk), 0.9, 0.1, 1));
    N.push(knoten([gp[0], yk, gp[1]], 1.0, 0.1, 1));
    N.push(knoten([gp[0], w.hoch ? FH - 0.1 : UNTEN + 0.2, gp[1]], 1.8, TR.gang, 1));
    return routeAus6(N);
  }
  /* Galle: Kanaelchen in der Plattenmitte -> nach aussen -> Gallengang -> laengs nach unten oder oben */
  w = wahl(j); yk = YK[Math.floor(bruch(0.3 + j * 0.5773502) * YK.length)]; gp = eckePunkt(w.pl.ecke, 'gang');
  e = w.pl.rin + 0.2 + (w.pl.raus - w.pl.rin - 0.4) * 0.8 * bruch(0.7 + j * 0.4472136);
  N = [knoten(polar(e, w.pl.a, yk), 1, 0.1, 1), knoten(polar(w.pl.raus, w.pl.a, yk), 0.9, 0.1, 1), knoten([gp[0], yk, gp[1]], 1.0, 0.1, 1),
    knoten([gp[0], w.hoch ? FH - 0.1 : UNTEN + 0.2, gp[1]], 1.8, TR.gang, 1)];
  return routeAus6(N);
}
/* Lage, Groesse und Farbwert eines Teilchens zur Zeit c (Sekunden) -> STQ; s = Radius der Kugel, 0 = unsichtbar */
function pose(p, c, o) {
  var rt = p.rt, W = rt.W, u = c / W + p.phi, t, i, j, d, f, N0, N1, tx, ty, tz, tl, rad, m, w = 1, fade, ft, g = p.g;
  u -= Math.floor(u); t = u * W;
  i = finde(rt.T, t, rt.n); j = i + 1; d = rt.T[j] - rt.T[i]; f = d > 1e-9 ? klemme((t - rt.T[i]) / d) : 0;
  N0 = rt.N[i]; N1 = rt.N[j];
  o.x = N0[0] + (N1[0] - N0[0]) * f; o.y = N0[1] + (N1[1] - N0[1]) * f; o.z = N0[2] + (N1[2] - N0[2]) * f;
  rad = N0[4] + (N1[4] - N0[4]) * f; o.c = N0[5] + (N1[5] - N0[5]) * f;
  tx = N1[0] - N0[0]; ty = N1[1] - N0[1]; tz = N1[2] - N0[2]; tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
  tx /= tl; ty /= tl; tz /= tl;
  if (g.kind) {   /* Zuckerwege: nach dem Essen "ein" (in die Zellen), nuechtern "aus" (aus den Zellen); je Teilchen eine feste Schwelle */
    var vE = klemme((anteil - p.q) / 0.15 + 0.5);
    w = g.kind === 1 ? vE : 1 - vE;
  }
  m = Math.max(0, rad - g.s) * 0.9 * p.rho;   /* Abstand von der Mittellinie: im Rohr verteilt, nie ueber die Wand hinaus */
  var ax = Math.abs(ty) < 0.9 ? 0 : 1, ay = Math.abs(ty) < 0.9 ? 1 : 0;   /* Hilfsachse fuer den Rahmen quer zur Bahn */
  var n1x = -tz * ay, n1y = tz * ax, n1z = tx * ay - ty * ax, nl = Math.sqrt(n1x * n1x + n1y * n1y + n1z * n1z) || 1;
  n1x /= nl; n1y /= nl; n1z /= nl;
  var n2x = ty * n1z - tz * n1y, n2y = tz * n1x - tx * n1z, n2z = tx * n1y - ty * n1x, ca = Math.cos(p.ang) * m, sa = Math.sin(p.ang) * m;
  o.x += n1x * ca + n2x * sa; o.y += n1y * ca + n2y * sa; o.z += n1z * ca + n2z * sa;
  ft = Math.min(t, W - t) / STR.FADE; fade = ft >= 1 ? 1 : (ft <= 0 ? 0 : ft * ft * (3 - 2 * ft));
  if (g.mode === 1) fade *= sstep6((rt.tC - t) / 0.35);        /* Ammoniak: bis in die Zelle */
  else if (g.mode === 2) fade *= sstep6((t - rt.tC) / 0.35);   /* Harnstoff: ab der Zelle */
  o.s = g.s * w * fade;
}
function tmat6(em) {
  var m = Kern.mat(0xFFFFFF, { rough: 0.35 }, envTex);
  m.emissive.copy(srgb(em)).multiplyScalar(0.6);
  return m;
}
/* Aufbau: Routen und Teilchen (nach den Teilen des Laeppchens) */
function stroemungBauen() {
  var gruppen = GRP.map(function (d) {
    var g = { art: d.art, stoff: d.stoff, name: d.name, s: d.s, kind: d.kind, mode: d.mode, c0: srgb(d.c0), c1: srgb(d.c1), css0: d.c0, css1: d.c1, list: [] }, i;
    for (i = 0; i < d.n; i++) {
      g.list.push({ g: g, rt: routeFuer(d, i), phi: bruch(0.5 + (i + 11 * GRP.indexOf(d)) * R2B), ang: i * 2.399963, rho: Math.sqrt(bruch(0.1 + i * 0.3247)),
        q: 0.075 + 0.85 * bruch(0.5 + i * 0.6180339887) });
    }
    g.cw = new Float32Array(d.n);
    return g;
  });
  /* Ammoniak und Harnstoff teilen die Routen (gleiche Phase): Harnstoff nimmt die Routen und Phasen des Ammoniaks */
  var am = gruppen[4], ha = gruppen[5];
  ha.list.forEach(function (p, i) { p.rt = am.list[i].rt; p.phi = am.list[i].phi; p.ang = am.list[i].ang; p.rho = am.list[i].rho; });
  ST = { gruppen: gruppen, letzt: '' };
  gruppen.forEach(function (g) {
    var m = tmat6(g.css0), geo = new THREE.SphereGeometry(1, 10, 7), im = new THREE.InstancedMesh(geo, m, g.list.length);
    m.name = 'teilchen-' + g.art;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(g.list.length * 3), 3);
    im.frustumCulled = false;
    im.name = g.name; im.userData.teilchen = g.art; im.userData.noexport = true;
    im.visible = g.stoff ? !!stoffe[g.stoff] : true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); g.im = im;
  });
  stroemungBild();
}
/* Zellen mit Glykogen heller: jede Zelle fuellt sich zu ihrer Zeit (zellH), weich */
var GLYK_HELL = srgb(0xEBCFB0);
function glykSetzen() {
  if (!zellMesh || Math.abs(glyk - glykGezeigt) < 0.002) return;
  glykGezeigt = glyk;
  var A = zellMesh.instanceColor.array, n = zellH.length, i, a, b;
  for (i = 0; i < n; i++) {
    a = 0.6 * sstep6(glyk * 1.5 - 0.5 * zellH[i]); b = 1 - a;
    A[i * 3] = zellBasis[i * 3] * b + GLYK_HELL.r * a; A[i * 3 + 1] = zellBasis[i * 3 + 1] * b + GLYK_HELL.g * a; A[i * 3 + 2] = zellBasis[i * 3 + 2] * b + GLYK_HELL.b * a;
  }
  zellMesh.instanceColor.needsUpdate = true;
}
/* je Bild: Teilchen setzen (nur wenn sich Zeit oder Zuckerwege geaendert haben) */
function stroemungBild() {
  if (!ST) return;
  glykSetzen();
  var key = clock + '|' + anteil;
  if (key === ST.letzt) return;
  ST.letzt = key;
  ST.gruppen.forEach(function (g) {
    var C = g.im.instanceColor.array, c0 = g.c0, c1 = g.c1;
    for (var i = 0; i < g.list.length; i++) {
      pose(g.list[i], clock, STQ);
      STM.makeScale(STQ.s, STQ.s, STQ.s); STM.setPosition(STQ.x, STQ.y, STQ.z);
      g.im.setMatrixAt(i, STM);
      C[i * 3] = c0.r + (c1.r - c0.r) * STQ.c; C[i * 3 + 1] = c0.g + (c1.g - c0.g) * STQ.c; C[i * 3 + 2] = c0.b + (c1.b - c0.b) * STQ.c;
      g.cw[i] = STQ.c;
    }
    g.im.instanceMatrix.needsUpdate = true; g.im.instanceColor.needsUpdate = true;
  });
}
/* je Bild: Uhr, Ueberblendung der Zuckerwege und Glykogenfuellung fortschreiben (Pause haelt alles an, das Tempo wirkt auf alles) */
function stroemungSchritt(dt) {
  if (!playing) return;
  var d = dt * speed, ziel = mahlzeit ? 1 : 0;
  clock += d;
  if (anteil !== ziel) anteil = ziel > anteil ? Math.min(ziel, anteil + d / STR.ANTEIL) : Math.max(ziel, anteil - d / STR.ANTEIL);
  if (glyk !== ziel) glyk = ziel > glyk ? Math.min(ziel, glyk + d / STR.AUFNAHME) : Math.max(ziel, glyk - d / STR.ABGABE);
}

/* =====================================================================
   7. Schema - das Laeppchen als flaches Bild (Knopf "Schema", wie bei der Leber)
   Querschnitt von oben (Sechseck, vorn = unten, x nach rechts): Periportalfelder an den Ecken, Zentralvene in der Mitte; Zellbalken, Sinusoide, Kanaelchen und
   Kupffer-Zellen aus denselben Daten wie das 3D-Modell (PLATTEN, LUECKEN, YK, KUPFFER, Konstanten), die Teilchen sind die Instanzen der 3D-Teilchen (Matrizen der
   InstancedMeshes aus stroemungBild; Tempo, Pause, Mahlzeit und Stoffe gelten damit mit; was unter dem Laeppchen fliesst (y < 0), zeigt das Schema nicht). Das Schema
   legt nichts in der 3D-Szene an und zieht keinen Zufall; gebaut wird es erst beim ersten Oeffnen. Bildkoordinaten: 1 Einheit = K Bildpunkte.
   ===================================================================== */
var SCH = (function () {
  var NS = 'http://www.w3.org/2000/svg', K = 24, W = 460, H = 722, CX = 230, CY = 262;
  var BRASS = '#E0A94A', DIM = '#8DA7B1', INK = '#E7EFF0', DARK = '#0B171C';
  var svg = null, built = false, onPick = null, SG = {}, POOL = [], DYN = {}, seen = {}, PLP = [];
  function f1(v) { return Math.round(v * 10) / 10; }
  function E(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function BX(x) { return f1(CX + x * K); }
  function BY(z) { return f1(CY + z * K); }
  function grp(parent, sid) {   /* Gruppe je Struktur: wird bei Auswahl und beim Ein-/Ausblenden der Ebenen gedimmt bzw. versteckt */
    var g = E('g', null, parent);
    (SG[sid] = SG[sid] || []).push(g);
    return g;
  }
  function text(g, x, y, s, size, fill, o) {
    var a = { x: f1(x), y: f1(y), fill: fill, 'font-size': size, 'font-weight': 500, stroke: '#122229', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'paint-order': 'stroke' };
    if (o) Object.keys(o).forEach(function (k) { a[k] = o[k]; });
    return E('text', a, g, s);
  }
  function abzeichen(g, x, y, n) {
    E('circle', { cx: f1(x), cy: f1(y), r: 6.6, fill: DARK, stroke: BRASS, 'stroke-width': 1.3 }, g);
    E('text', { x: f1(x), y: f1(y + 3.3), 'text-anchor': 'middle', fill: BRASS, 'font-size': 9.5, 'font-weight': 700 }, g, String(n));
  }
  function hex(c) { return '#' + c.toString(16).padStart(6, '0'); }
  function rgb(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }
  function mische(c0, c1, f) { var a = rgb(c0), b = rgb(c1); return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')'; }
  /* Viereck um die Strecke von (r0, a) nach (r1, a) mit halber Breite h0 bzw. h1 (Einheiten) */
  function streifen(a, r0, r1, h0, h1) {
    var si = Math.sin(a), co = Math.cos(a), P = function (r, h) { return BX(r * si + h * co) + ' ' + BY(r * co - h * si); };
    return 'M' + P(r0, -h0) + 'L' + P(r1, -h1) + 'L' + P(r1, h1) + 'L' + P(r0, h0) + 'Z';
  }
  function kreis(sid, x, z, r, fill, stroke, attrs) {
    var a = { cx: BX(x), cy: BY(z), r: f1(r * K), fill: fill, stroke: stroke, 'stroke-width': 1, 'class': 'sz', 'data-info': sid };
    if (attrs) Object.keys(attrs).forEach(function (k) { a[k] = attrs[k]; });
    return E('circle', a, grp(svg, sid));
  }

  function build(box, pick) {
    if (built) return;
    onPick = pick;
    box.innerHTML = '';
    svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Inter, "Segoe UI", system-ui, sans-serif',
      'aria-label': 'Schema: Querschnitt durch ein Leberläppchen von oben, die Teilchen fließen wie im 3D-Modell' }, box);
    var i, k, pts = '';
    /* ---- Sechseck mit den Zonen als zarten Ringen (Zone 1 aussen, Zone 3 um die Zentralvene) ---- */
    for (k = 0; k < 6; k++) { var e0 = polar(FR, eckeWinkel(k), 0); pts += (k ? ' ' : '') + BX(e0[0]) + ',' + BY(e0[2]); }
    E('polygon', { points: pts, fill: '#16282E', stroke: '#5C7882', 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
    var zonen = [[FAPO - 0.03, 'rgba(224,88,76,.11)'], [4.7, 'rgba(160,120,170,.10)'], [2.9, 'rgba(111,147,224,.14)']];
    zonen.forEach(function (z) { E('circle', { cx: CX, cy: CY, r: f1(z[0] * K), fill: z[1], 'pointer-events': 'none' }, svg); });

    /* ---- Sinusoide (Kanaele), Zellbalken, Kanaelchen ---- */
    var gs = grp(svg, 'sinusoide');
    LUECKEN.forEach(function (g) {
      var w0 = g.breit ? Math.min(0.9, 0.205 * g.rin) : Math.min(0.8, 0.104 * g.rin), w1 = g.breit ? Math.min(0.9, 0.205 * g.raus) : Math.min(0.8, 0.104 * g.raus);
      E('path', { d: streifen(g.a, g.rin, g.raus, Math.max(0.2, w0) / 2, Math.max(0.2, w1) / 2), fill: '#A45A8A', 'fill-opacity': 0.75, stroke: '#6B3558', 'stroke-width': 0.7, 'class': 'sz', 'data-info': 'sinusoide' }, gs);
    });
    var gb = grp(svg, 'balken');
    PLATTEN.forEach(function (pl) {
      var el = E('path', { d: streifen(pl.a, pl.rin, pl.raus, colW(pl.rin) + ZLUECKE / 2, colW(pl.raus) + ZLUECKE / 2), fill: '#C27B62', stroke: '#6E3E2F', 'stroke-width': 0.8, 'stroke-linejoin': 'round', 'class': 'sz', 'data-info': 'balken' }, gb);
      PLP.push(el);
    });
    var gk = grp(svg, 'kanaelchen');
    PLATTEN.forEach(function (pl) {
      var gp = eckePunkt(pl.ecke, 'gang'), s0 = polar(pl.rin, pl.a, 0), s1 = polar(pl.raus, pl.a, 0), d = 'M' + BX(s0[0]) + ' ' + BY(s0[2]) + 'L' + BX(s1[0]) + ' ' + BY(s1[2]) + 'L' + BX(gp[0]) + ' ' + BY(gp[1]);
      E('path', { d: d, fill: 'none', stroke: '#5FB05C', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'sz', 'data-info': 'kanaelchen' }, gk);
      E('path', { d: d, fill: 'none', stroke: '#000', 'stroke-opacity': 0, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'stroke', 'class': 'sz', 'data-info': 'kanaelchen' }, gk);
    });
    /* ---- Kupffer-Zellen, Zentralvene, Aeste an den Ecken ---- */
    KUPFFER.forEach(function (q) { var p = polar(q[0], q[1] * DEG, 0); kreis('kupffer', p[0], p[2], 0.3, '#D9A441', '#6A4A12'); });
    kreis('zentralvene', 0, 0, RZ, '#3F63B5', '#1B2F66', { 'stroke-width': 1.4 });
    for (k = 0; k < 6; k++) {
      var pf = eckePunkt(k, 'pf'), ar = eckePunkt(k, 'art'), ga = eckePunkt(k, 'gang');
      kreis('pfortaderast', pf[0], pf[1], TR.pf, '#7A5CB0', '#3A2A66');
      kreis('arterienast', ar[0], ar[1], TR.art, '#C8372D', '#6A1812');
      kreis('gallengang', ga[0], ga[1], TR.gang, '#3F8F4A', '#1C4A24');
    }
    /* Ringe der Zonen (nur Linien, fangen keine Klicks) */
    [4.7, 2.9].forEach(function (r) { E('circle', { cx: CX, cy: CY, r: f1(r * K), fill: 'none', stroke: '#B7C9CF', 'stroke-opacity': 0.5, 'stroke-width': 0.9, 'stroke-dasharray': '3 3', 'pointer-events': 'none' }, svg); });

    /* ---- Teilchen: je Gruppe der 3D-Teilchen ein Pool; Lage und Groesse aus den Instanzmatrizen ---- */
    var gt = E('g', { 'pointer-events': 'none' }, svg);
    POOL = ST.gruppen.map(function (g) {
      var gg2 = E('g', null, gt), arr = [];
      for (var q = 0; q < g.list.length; q++) arr.push({ el: E('circle', { r: 1, fill: hex(g.css0), stroke: '#101C20', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke', display: 'none' }, gg2), on: false, tf: '', fill: '' });
      return arr;
    });

    /* ---- Beschriftung: Bereiche, Zonen, Abzeichen, Legende, Kennzahlen, Hinweis ---- */
    var gn = E('g', { 'pointer-events': 'none' }, svg), LBL = { 'letter-spacing': 1.2, 'font-weight': 600 };
    function leiter(x0, y0, x1, y1) {
      E('line', { x1: f1(x0), y1: f1(y0), x2: f1(x1), y2: f1(y1), stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, gn);
      E('circle', { cx: f1(x0), cy: f1(y0), r: 1.8, fill: BRASS }, gn);
    }
    function bereich(s, tx, ty, anker, px, py, lx, ly) {   /* Text bei (tx, ty), Leiter von (px, py) nach (lx, ly) */
      leiter(px, py, lx, ly); text(gn, tx, ty, s, 9.5, DIM, anker ? { 'text-anchor': anker, 'letter-spacing': 1.2, 'font-weight': 600 } : LBL);
    }
    var pfk = eckePunkt(2, 'pf'), sl = polar(4.4, 300 * DEG, 0), bl = polar(4.8, 70 * DEG, 0);
    bereich('ZENTRALVENE', 8, 26, null, CX, CY, 104, 22);
    bereich('PERIPORTALFELD', W - 8, 26, 'end', BX(pfk[0]), BY(pfk[1]), W - 120, 22);
    bereich('SINUSOID', 8, 456, null, BX(sl[0]), BY(sl[2]), 72, 451);
    bereich('LEBERZELLBALKEN', W - 8, 456, 'end', BX(bl[0]), BY(bl[2]), W - 148, 451);
    ['ZONE 1', 'ZONE 2', 'ZONE 3'].forEach(function (s, q) { text(gn, CX, CY - [5.8, 3.8, 1.9][q] * K + 3, s, 8.5, INK, { 'text-anchor': 'middle', 'stroke-width': 2.2, 'letter-spacing': 1, 'font-weight': 600 }); });
    /* Abzeichen an den Wegen 1-5 */
    var b1 = eckePunkt(3, 'pf'), b2 = polar(3.0, 150 * DEG, 0), b4 = polar(4.2, 230 * DEG, 0), b5 = eckePunkt(3, 'gang');
    [[BX(b1[0]) - 19, BY(b1[1]) - 8], [BX(b2[0]) + 17, BY(b2[2]) + 2], [CX + 33, CY + 3], [BX(b4[0]) - 14, BY(b4[2]) + 10], [BX(b5[0]) - 14, BY(b5[1]) + 14]].forEach(function (p, q) { abzeichen(gn, p[0], p[1], q + 1); });

    /* Legende der Wege unter dem Bild, zwei Spalten */
    var LG = [
      ['Blut strömt ein', 'Pfortader- und Arterienast an den', 'Ecken des Läppchens'],
      ['Durch die Sinusoide', 'Das Blut mischt sich und fließt', 'an den Leberzellen vorbei zur Mitte'],
      ['Blut fließt ab', 'Zentralvene, dann Sammelvene', 'und Lebervenen'],
      ['Galle entsteht', 'Leberzellen geben Galle in die', 'Gallenkanälchen'],
      ['Galle fließt ab', 'Nach außen zum Gallengang', 'an den Ecken']
    ];
    var COL = [8, 236], ly0 = 482;
    LG.forEach(function (t, q) {
      var cx = COL[q < 3 ? 0 : 1], cy = ly0 + (q % 3) * 40.5;
      abzeichen(gn, cx + 7, cy - 3, q + 1);
      text(gn, cx + 20, cy, t[0], 10.5, BRASS, { 'font-weight': 700 });
      text(gn, cx + 20, cy + 11.5, t[1], 8.6, DIM, { 'stroke-width': 2.2 });
      text(gn, cx + 20, cy + 22, t[2], 8.6, DIM, { 'stroke-width': 2.2 });
    });
    /* Kennzahlen */
    var kx = COL[1], ky = ly0 + 2 * 40.5 - 13;
    E('rect', { x: kx, y: f1(ky), width: 216, height: 56, rx: 4, fill: DARK, 'fill-opacity': 0.88, stroke: '#9C7530', 'stroke-width': 0.9 }, gn);
    text(gn, kx + 8, ky + 14, 'KENNZAHLEN · LÄPPCHEN', 8.5, BRASS, { 'font-weight': 700, 'letter-spacing': 0.8, 'stroke-width': 0 });
    ['Größe: ca. 1–2 mm', 'Zone 1 außen: viel Sauerstoff', 'Zone 3 innen: wenig Sauerstoff'].forEach(function (s, q) {
      text(gn, kx + 8, ky + 27 + q * 11, s, 8.6, DIM, { 'stroke-width': 0 });
    });
    /* Hinweiszeile je nach Mahlzeit, zwei Zeilen */
    DYN.hint = [text(gn, 8, ly0 + 3 * 40.5 + 30, '', 8.8, INK, { 'stroke-width': 2.2 }), text(gn, 8, ly0 + 3 * 40.5 + 42, '', 8.8, INK, { 'stroke-width': 2.2 })];

    svg.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.sz') : null;
      if (onPick) onPick(t ? t.getAttribute('data-info') : null, e);
    });
    seen = { vis: -1, mz: -1, gl: -1 };
    built = true;
  }

  function update(sel, enabledMap, visV) {
    if (!built) return;
    var i;
    if (visV !== seen.vis || sel !== seen.sel) {
      seen.vis = visV; seen.sel = sel;
      Object.keys(SG).forEach(function (sid) {
        var on = enabledMap[sid] !== false, op = !on ? 0 : ((sel && sel !== sid) ? 0.3 : 1);
        SG[sid].forEach(function (g) { g.setAttribute('opacity', op); g.setAttribute('display', on ? 'inline' : 'none'); });
      });
    }
    /* Zellbalken mit Glykogen heller wie im 3D-Modell */
    if (glyk !== seen.gl) { seen.gl = glyk; var fl = mische(0xC27B62, 0xEBCFB0, 0.6 * sstep6(glyk)); PLP.forEach(function (p) { p.setAttribute('fill', fl); }); }
    /* Teilchen */
    ST.gruppen.forEach(function (g, gi) {
      var pool = POOL[gi], A = g.im.instanceMatrix.array, show = g.im.visible;
      for (i = 0; i < pool.length; i++) {
        var q = pool[i], s = A[i * 16], v = show && s > 0.02 && A[i * 16 + 13] > 0;   /* unter dem Laeppchen (Sammelvene, Ast ganz unten) nicht zeigen */
        if (v) {
          var tf = 'translate(' + BX(A[i * 16 + 12]) + ' ' + BY(A[i * 16 + 14]) + ') scale(' + (Math.round(Math.max(1.6, s * K * 1.1) * 10) / 10) + ')';
          if (tf !== q.tf) { q.el.setAttribute('transform', tf); q.tf = tf; }
          var fc = g.css0 === g.css1 ? '' : mische(g.css0, g.css1, g.cw[i]);
          if (fc !== q.fill && fc) { q.el.setAttribute('fill', fc); q.fill = fc; }
          if (!q.on) { q.el.setAttribute('display', 'inline'); q.on = true; }
        } else if (q.on) { q.el.setAttribute('display', 'none'); q.on = false; }
      }
    });
    /* Hinweiszeile: der Satz der Mahlzeit (siehe MAHLZEIT_TXT), am Leerzeichen nahe der Mitte umbrochen */
    if (mahlzeit !== seen.mz) {
      seen.mz = mahlzeit;
      var t = MAHLZEIT_TXT[mahlzeit ? 1 : 0], k = t.indexOf(' ', Math.floor(t.length / 2));
      DYN.hint[0].textContent = t.slice(0, k); DYN.hint[1].textContent = t.slice(k + 1);
    }
  }
  function abbauen() {
    svg = null; built = false; onPick = null; SG = {}; POOL = []; DYN = {}; seen = {}; PLP = [];
  }
  return { build: build, update: update, abbauen: abbauen, get svg() { return svg; } };
})();

/* Schema: Knopf, Schliessen, Antippen (eine Struktur oeffnet die Infokarte wie in 3D). Handy: --wz (Hoehe der Werkzeugleiste) setzt wzMessen schon fuer die Infokarte */
var schemaOn = false;
function schemaPick(info) {
  if (!info) { setSelected(null); return; }
  if (STRUCT[info]) setSelected(info);
}
function setSchema(on) {
  if (on && !ST) return;                                  /* die Teilchen entstehen am Ende des Aufbaus */
  schemaOn = on;
  if (on) { if (quiz) quizEnd(); if (wege) wegeEnd(); closeCard(); }   /* Hilfekarte und Ueben weichen dem Schema */
  $('bSchema').classList.toggle('on', on);
  if (on) { SCH.build($('schemaBox'), schemaPick); SCH.update(selected, enabled, lv); }
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  canvas.style.visibility = on ? 'hidden' : '';
  lv++;
}
/* Das Schema weicht anderen Ansichten (Hilfekarte, Ueben, Wege) */
function schemaWeicht() { if (schemaOn) setSchema(false); }
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };
function schemaTick() { SCH.update(selected, enabled, lv); }

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
var last = t0;
var App = window.LaeppchenApp = { ready: false, aufbauMs: 0, schema: function (an) { setSchema(!!an); }, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris,
  mahlzeit: function (an) { setMahlzeit(!!an); },
  stoff: function (name, an) { if (name in stoffe) setStoff(name, !!an); }, stoffe: function () { return { zucker: stoffe.zucker, ammoniak: stoffe.ammoniak, bilirubin: stoffe.bilirubin }; },
  /* fuer die Pruefung: Antippen einer Struktur wie mit dem Finger (nur beim Ueben), Zustaende von "Wege verfolgen" und "Strukturen finden" */
  tippe: function (id) { if (wege) wegeAntwort(id, [id]); else if (quiz) quizAntwort(id, [id]); },
  wege: function () { return wege && { weg: wege.nr + 1, station: wege.st, n: wege.n, ok: wege.ok, fehl: wege.fehl, liste: wege.liste.slice(), fertig: wege.fertig, leucht: wege.leucht.slice() }; },
  quiz: function () { return quiz && { ziel: quiz.target, n: quiz.n, ok: quiz.ok }; },
  stroemung: function () { return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, anteil: anteil, glykogen: glyk }; } };
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  stroemungSchritt(dt); stroemungBild();
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  if (schemaOn) schemaTick();
  Kern.kamera(camera, view);
  if (schemaOn) return;                                   /* Schema offen: das Bild des Läppchens ist ausgeblendet und wird nicht gezeichnet */
  renderer.render(scene, camera);
  sichtPruefen(now, window.innerWidth, window.innerHeight);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  schemaWeicht(); SCH.abbauen();
  clearTimeout(quizT); clearTimeout(wegeT);
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
  stroemungBauen();
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('laeppchen', organ);
})();
