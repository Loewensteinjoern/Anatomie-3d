/* =====================================================================
   Leber - Lappen, Pfortader und Gallenwege
   Die Leber von vorn wie im Koerper (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn): vier Lappen (rechter und linker Lappen,
   Quadrat- und Schwanzlappen, durch schmale Spalten getrennt), Gallenblase, Pfortader mit Stuempfen von Milz- und Mesenterialvene, Leberarterie,
   Lebervenen und untere Hohlvene, Lebergaenge, Gallenblasengang und Hauptgallengang bis zur Papille im Zwoelffingerdarm (Abschnitt),
   Ende des Bauchspeicheldruesengangs, Sichelband und rundes Leberband und das Zwerchfell darueber. Die Form liefert
   organe/leber/leber-form.js (Kern.Formen.leber; die Zwerchfellkuppel kommt aus organe/lunge/lunge-form.js); hier wird sie vernetzt, eingefaerbt
   und bedient.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste, Lesehilfe. Die Knoepfe fuer Stroemung, Mahlzeit und
   Schema stehen schon in der Werkzeugleiste, bekommen ihre Wirkung aber erst in spaeteren Schritten (Stroemung und Mahlzeit, Schema, Hilfekarten
   und Ueben); ebenso sind Panel und Karte dafuer im Markup nur vorbereitet.
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col = Grundfarbe des Materials), Text und
   Fakten der Infokarte (Texte von Joern freigegeben).
   ===================================================================== */
var STRUKTUREN = [
  { id: 'lappenR', de: 'Rechter Leberlappen', lat: 'Lobus hepatis dexter', grp: 'Leber', col: 0x8E3B2F,
    txt: 'Der größte Teil der Leber. Er füllt den rechten Oberbauch unter der rechten Zwerchfellkuppel und wird von den unteren Rippen geschützt. An seiner Unterseite liegt die Gallenblase; dort grenzt er an die rechte Niere, den Dickdarm und den Zwölffingerdarm.',
    facts: { 'Lage': 'rechter Oberbauch, unter dem Zwerchfell', 'Geschützt durch': 'untere Rippen', 'An der Unterseite': 'Gallenblase' } },
  { id: 'lappenL', de: 'Linker Leberlappen', lat: 'Lobus hepatis sinister', grp: 'Leber', col: 0x9A4535,
    txt: 'Kleiner und flacher als der rechte Lappen. Er reicht über die Mittellinie bis unter die linke Zwerchfellkuppel und liegt vorn auf dem Magen. Außen grenzt ihn das Sichelband vom rechten Lappen ab.',
    facts: { 'Lage': 'Oberbauch, links der Mitte', 'Liegt auf': 'dem Magen', 'Grenze zum rechten Lappen': 'Sichelband' } },
  { id: 'quadrat', de: 'Quadratlappen', lat: 'Lobus quadratus', grp: 'Leber', col: 0xA44E3B,
    txt: 'Kleiner, viereckiger Abschnitt an der Unterseite der Leber. Er liegt vorn zwischen der Gallenblase und dem runden Leberband, hinten begrenzt ihn die Leberpforte. Von vorn ist er kaum zu sehen.',
    facts: { 'Lage': 'Unterseite, vor der Leberpforte', 'Seitlich': 'Gallenblase und rundes Leberband', 'Gut zu sehen': 'im Ausschnitt „Unterseite“' } },
  { id: 'schwanz', de: 'Schwanzlappen', lat: 'Lobus caudatus', grp: 'Leber', col: 0x84352A,
    txt: 'Kleiner Abschnitt an der Rückseite der Leber, hinter der Leberpforte und direkt neben der unteren Hohlvene. Sein Blut fließt über eigene kleine Venen direkt in die Hohlvene ab.',
    facts: { 'Lage': 'Rückseite, hinter der Leberpforte', 'Nachbar': 'untere Hohlvene', 'Abfluss': 'eigene kleine Venen' } },
  { id: 'baender', de: 'Sichelband und rundes Leberband', lat: 'Ligamentum falciforme et Ligamentum teres hepatis', grp: 'Leber', col: 0xE2D3C3,
    txt: 'Das sichelförmige Leberband ist eine Falte des Bauchfells, die die Leber mit der vorderen Bauchwand und dem Zwerchfell verbindet. In seinem freien unteren Rand zieht das runde Leberband zum Nabel (dargestellt ist sein Anfang). Es ist der Rest der Nabelvene, über die das ungeborene Kind Blut aus dem Mutterkuchen erhielt.',
    facts: { 'Aufbau': 'Falte des Bauchfells', 'Verbindet die Leber mit': 'Bauchwand und Zwerchfell', 'Rundes Leberband': 'Rest der Nabelvene' } },
  { id: 'pfortader', de: 'Pfortader', lat: 'Vena portae hepatis', grp: 'Blutgefäße', col: 0x7A5CB0,
    txt: 'Sie entsteht hinter der Bauchspeicheldrüse aus Milzvene und oberer Mesenterialvene und bringt das Blut aus Magen, Darm, Bauchspeicheldrüse und Milz zur Leber. Dieses Blut ist sauerstoffarm, aber reich an Nährstoffen; es enthält auch Giftstoffe und Medikamente, die der Darm aufgenommen hat. An der Leberpforte teilt sich die Pfortader in einen rechten und einen linken Ast, die sich bis zu den Leberläppchen verzweigen.',
    facts: { 'Anteil am Leberblut': 'etwa drei Viertel', 'Blut': 'sauerstoffarm, nährstoffreich', 'Staut es sich': 'Pfortaderhochdruck' } },
  { id: 'arterie', de: 'Leberarterie', lat: 'Arteria hepatica propria', grp: 'Blutgefäße', col: 0xC8372D,
    txt: 'Sie zweigt über den Truncus coeliacus aus der Bauchaorta ab und bringt sauerstoffreiches Blut zur Leber. Gemeinsam mit Pfortader und Gallengang zieht sie zur Leberpforte und verzweigt sich mit ihnen. Sie liefert nur etwa ein Viertel des Leberbluts, aber rund die Hälfte des Sauerstoffs.',
    facts: { 'Ursprung': 'Bauchaorta (Truncus coeliacus)', 'Anteil am Leberblut': 'etwa ein Viertel', 'Anteil am Sauerstoff': 'etwa die Hälfte' } },
  { id: 'lebervenen', de: 'Lebervenen', lat: 'Venae hepaticae', grp: 'Blutgefäße', col: 0x3F63B5,
    txt: 'Meist drei große Venen – rechte, mittlere und linke – sammeln das Blut, das durch die Leberläppchen geflossen ist. Sie verlaufen getrennt von Pfortader und Gallengang und münden an der Rückseite der Leber, knapp unter dem Zwerchfell, in die untere Hohlvene.',
    facts: { 'Anzahl': 'meist 3 große', 'Münden in': 'untere Hohlvene', 'Verlauf': 'getrennt von Pfortader und Gallengang' } },
  { id: 'hohlvene', de: 'Untere Hohlvene', lat: 'Vena cava inferior', grp: 'Blutgefäße', col: 0x34559E,
    txt: 'Die große Vene bringt das Blut aus Beinen, Becken und Bauch zum Herzen. Hinter der Leber liegt sie in einer tiefen Rinne, nimmt dort die Lebervenen auf, tritt durch das Zwerchfell und mündet in den rechten Vorhof.',
    facts: { 'Lage': 'Rinne an der Rückseite der Leber', 'Nimmt auf': 'Lebervenen', 'Mündet in': 'rechten Vorhof' } },
  { id: 'gallenblase', de: 'Gallenblase', lat: 'Vesica biliaris', grp: 'Gallenwege', col: 0x5E9A4A,
    txt: 'Birnenförmiger Beutel an der Unterseite der Leber, etwa 8–10 cm lang. Zwischen den Mahlzeiten speichert sie die Galle und dickt sie ein, indem sie ihr Wasser entzieht. Nach einer fettreichen Mahlzeit zieht sie sich zusammen und gibt die Galle über den Hauptgallengang in den Zwölffingerdarm ab.',
    facts: { 'Fasst': 'ca. 50 ml', 'Dickt die Galle ein': 'etwa 5- bis 10-fach', 'Entzündung': 'Cholezystitis' } },
  { id: 'lebergang', de: 'Lebergänge', lat: 'Ductus hepatici', grp: 'Gallenwege', col: 0x4F9A55,
    txt: 'Die Galle entsteht in den Leberzellen und fließt über immer größere Gallengänge zur Leberpforte. In der Leber laufen die Gallengänge zusammen mit den Ästen von Pfortader und Leberarterie. An der Leberpforte vereinigen sich der rechte und der linke Lebergang zum gemeinsamen Lebergang.',
    facts: { 'Beginn': 'Gallenkanälchen zwischen den Leberzellen', 'In der Leber': 'neben Pfortader- und Arterienästen', 'Vereinigen sich zum': 'gemeinsamen Lebergang' } },
  { id: 'blasengang', de: 'Gallenblasengang', lat: 'Ductus cysticus', grp: 'Gallenwege', col: 0x5AA45E,
    txt: 'Kurzer, gewundener Gang zwischen der Gallenblase und dem gemeinsamen Lebergang. Durch ihn fließt die Galle in beide Richtungen: nüchtern in die Gallenblase hinein, nach dem Essen wieder heraus. Innen bilden Schleimhautfalten eine Spirale.',
    facts: { 'Länge': 'ca. 3–4 cm', 'Fluss': 'in beide Richtungen', 'Klemmt hier ein Stein': 'Gallenkolik' } },
  { id: 'hauptgang', de: 'Hauptgallengang', lat: 'Ductus choledochus', grp: 'Gallenwege', col: 0x3F8F4A,
    txt: 'Er beginnt, wo der Gallenblasengang in den gemeinsamen Lebergang mündet, und ist etwa 6–8 cm lang. Er zieht hinter dem Zwölffingerdarm und durch den Kopf der Bauchspeicheldrüse zur Papille. Verschließt ihn ein Stein, staut sich die Galle bis in die Leber zurück.',
    facts: { 'Länge': 'ca. 6–8 cm', 'Mündet': 'an der Papille, meist mit dem Pankreasgang', 'Verschluss': 'Gelbsucht, heller Stuhl, dunkler Urin' } },
  { id: 'zwoelffinger', de: 'Zwölffingerdarm (Abschnitt)', lat: 'Duodenum', grp: 'Umgebung', col: 0xE3A58C,
    txt: 'Erster Abschnitt des Dünndarms, etwa 25–30 cm lang. Er legt sich C-förmig um den Kopf der Bauchspeicheldrüse und nimmt den Speisebrei aus dem Magen auf; hier fließen Galle und Bauchspeichel hinzu. Dargestellt ist nur der Abschnitt mit der Papille.',
    facts: { 'Länge': 'ca. 25–30 cm', 'Nimmt auf': 'Galle und Bauchspeichel', 'Dargestellt': 'Abschnitt mit der Papille' } },
  { id: 'papille', de: 'Papille', lat: 'Papilla duodeni major', grp: 'Umgebung', col: 0xC97C66,
    txt: 'Kleine Erhebung an der Innenwand des absteigenden Zwölffingerdarms, auch Vater-Papille genannt. Hier münden Hauptgallengang und Bauchspeicheldrüsengang, meist gemeinsam. Ein Schließmuskel (Sphinkter Oddi) regelt den Abfluss: Nüchtern ist er geschlossen, nach dem Essen öffnet er sich.',
    facts: { 'Lage': 'absteigender Zwölffingerdarm', 'Schließmuskel': 'Sphinkter Oddi', 'Untersuchung': 'ERCP (Spiegelung mit Kontrastmittel)' } },
  { id: 'pankreasgang', de: 'Bauchspeicheldrüsengang', lat: 'Ductus pancreaticus', grp: 'Umgebung', col: 0xE8C27A,
    txt: 'Er durchzieht die Bauchspeicheldrüse der Länge nach und bringt ihre Verdauungssäfte zur Papille, wo er meist mit dem Hauptgallengang zusammenläuft. Steckt dort ein Gallenstein, staut sich auch der Bauchspeichel – eine Entzündung der Bauchspeicheldrüse (Pankreatitis) kann folgen. Dargestellt ist nur sein Ende.',
    facts: { 'Bringt': 'Verdauungssäfte der Bauchspeicheldrüse', 'Mündet': 'an der Papille', 'Gefahr bei Gallenstein': 'Pankreatitis' } },
  { id: 'zwerchfell', de: 'Zwerchfell (Lage)', lat: 'Diaphragma', grp: 'Umgebung', col: 0xB5655A,
    txt: 'Die Muskelkuppel trennt Brust- und Bauchraum; die Leber liegt direkt darunter. Bei jedem Atemzug bewegt sie sich mit: Beim Einatmen schiebt das Zwerchfell sie nach unten. Deshalb tastet man den Leberrand am besten, wenn der Mensch tief einatmet.',
    facts: { 'Liegt': 'direkt über der Leber', 'Rechts': 'höher als links – wegen der Leber', 'Beim Einatmen': 'schiebt die Leber nach unten' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Leber &middot; Hepar</div>
  <h1>Lappen, Pfortader &amp; <em>Gallenwege</em></h1>
  <div class="sub">Verwertet Nährstoffe, entgiftet das Blut und bildet die Galle.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Übersicht</button>
    <button id="cam1" class="gh">Unterseite</button>
    <button id="cam2" class="gh">Leberpforte</button>
    <button id="cam3" class="gh">Gallenwege</button>
    <span class="sep"></span>
    <button id="bSchema" class="gh" title="Die Leber als flaches Schema: gleiche Teilchen, gleiche Strömung">Schema</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Lebergewebe durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bNuechtern" class="gh on" title="Zwischen den Mahlzeiten: Die Galle fließt in die Gallenblase">nüchtern</button>
    <button id="bEssen" class="gh" title="Nach einer Mahlzeit: Die Gallenblase entleert sich in den Zwölffingerdarm">nach dem Essen</button>
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

<div class="panel" id="schema" aria-label="Schema der Leber">
  <div class="sch-head"><span class="kick">Schema &middot; Leber</span><span class="sch-hint">Gleiche Teilchen wie im 3D-Modell, Blick von vorn.</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schließen">&times;</button></div>
  <div id="schemaBox"></div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#A98BDC">Violett</b> Pfortader – Blut aus Darm und Milz.<br>
  <b style="color:#E0584C">Rot</b> Leberarterie – Blut aus der Aorta.<br>
  <b style="color:#6F93E0">Blau</b> Lebervenen und Hohlvene – Blut zum Herzen.<br>
  <b style="color:#7CC66E">Grün</b> Gallenwege – Galle zum Darm.</p>
  <p class="note" id="legNote">Die Leber von vorn, wie sie im Körper liegt. „Durchsicht“ zeigt die Gefäße im Inneren.</p>
  <p class="note">Die Teilchen zeigen die Strömung – symbolisch, nicht maßstäblich: violett und rot Blut zur Leber, blau Blut zum Herzen, grün Galle.</p>
  <p class="note kz">Durchblutung ca. 1,5 l Blut pro Minute (ein Viertel des Herzzeitvolumens)<br>
  davon ¾ über die Pfortader, ¼ über die Leberarterie<br>
  Galle ca. 0,5–1 l pro Tag, Gallenblase fasst ca. 50 ml</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schließen">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
  <button class="gh" id="iOpen" style="display:none">Leberläppchen hier ansehen</button>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schließen">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">Nächste</button><button class="gh" id="qStop">Beenden</button></div>
</div>`;
/* Notiz der Lesehilfe: ohne und mit Durchsicht */
var LEGNOTE = ['Die Leber von vorn, wie sie im Körper liegt. „Durchsicht“ zeigt die Gefäße im Inneren.',
  'In der Leber verzweigen sich Pfortader, Leberarterie und Gallengang gemeinsam, die Lebervenen laufen getrennt davon.'];
var organ = { renderer: {}, aufbauen: aufbauen };
/* Mitte der Leber im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, die Leber steht im Modell mittig (Ziel der Kamerafahrt aus dem Koerper) */
var M = [-2, 107, 0];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und fuer die Fahrt aus dem Koerper;
   ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt ZIEL_K minus M) */
var ZIEL_K = [-2.9, 107.6, 0.5];
var UEBERSICHT = { ext: [28, 26], halb: 14, ziel: [ZIEL_K[0] - M[0], ZIEL_K[1] - M[1], ZIEL_K[2] - M[2]] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer Leber und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, die Leber steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (Desktop 115, Handy 100 bei drei Zeilen, je 32 mehr, wenn eine der
   Reihen umbricht: Reihe 1 (Ausschnitt mit Schema) unter Breite 395 (zweite Zeile) und unter 253 (dritte), Reihe 2 (mit nuechtern und nach dem Essen) unter 364,
   Reihe 3 (Stroemung) unter 256); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (100 + (w < 395 ? 32 : 0) + (w < 364 ? 32 : 0) + (w < 256 ? 32 : 0) + (w < 253 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 115 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten, also relativ zu M) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.mitte = M;   /* Mitte der Leber im Koerper (cm): Koerper-Punkt = Modell-Punkt + mitte */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: 0, phi: Math.PI / 2, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = Kern.Formen && Kern.Formen.leber, lform = null;   /* lform: Form der Lunge (Zwerchfellkuppel), wird in bauen geladen */
if (!form) throw new Error('Die Form der Leber ist nicht geladen.');
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var PI = Math.PI, DEG = PI / 180;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie)
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var LAPPEN = ['lappenR', 'lappenL', 'quadrat', 'schwanz'];   /* Strukturen des Lebergewebes (bei "Durchsicht" Glas) */
var GEFAESS = ['pfortader', 'arterie', 'lebervenen', 'hohlvene', 'gallenblase', 'lebergang', 'blasengang', 'hauptgang', 'pankreasgang'];   /* Gefaesse, Gaenge und Gallenblase: durchscheinend, zaehlen beim Antippen als undurchsichtig */
var GLAS = 0.22;                                             /* Deckkraft der Lappen bei "Durchsicht" */
var DURCH = 0.55;                                            /* Deckkraft der Gefaesse, Gaenge und der Gallenblase (spaeter sieht man die Teilchen darin) */
var MAT = {};
LAPPEN.forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.45, coat: 0.5 }); });
MAT.baender = mat(STRUCT.baender.col, { rough: 0.6 });
['pfortader', 'arterie', 'lebervenen'].forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.4, coat: 0.3, opacity: DURCH }); });
MAT.hohlvene = mat(STRUCT.hohlvene.col, { rough: 0.4, coat: 0.3, opacity: DURCH, side: THREE.DoubleSide });   /* der Abschnitt ist an beiden Enden offen: innen sichtbar */
['gallenblase', 'lebergang', 'blasengang', 'hauptgang'].forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.4, coat: 0.5, opacity: DURCH }); });
MAT.pankreasgang = mat(STRUCT.pankreasgang.col, { rough: 0.5, coat: 0.3, opacity: DURCH });
MAT.zwoelffinger = mat(STRUCT.zwoelffinger.col, { rough: 0.5, coat: 0.35, opacity: 0.4, side: THREE.DoubleSide });   /* durchscheinend: Papille und Gangenden innen bleiben sichtbar */
MAT.papille = mat(STRUCT.papille.col, { rough: 0.5, coat: 0.4 });
MAT.zwerchfell = mat(STRUCT.zwerchfell.col, { rough: 0.6, opacity: 0.25, side: THREE.DoubleSide });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });
GEFAESS.forEach(function (k) { MAT[k].userData.dicht = true; });

var root = new THREE.Group(); root.name = 'Leber'; root.position.set(-M[0], -M[1], -M[2]); scene.add(root);   /* Koerper-Koordinaten, um die Mitte M verschoben */
var tris = { lappen: 0, gallenblase: 0, baender: 0, gefaesse: 0, umgebung: 0 };
function addMesh(sid, geo, material, name, order) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order; m.userData.sid = sid; STRUCT[sid].meshes.push(m);
  root.add(m);
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* =====================================================================
   2. Geometrie: Lappen, Gallenblase, Baender, Gefaesse und Gaenge, Zwoelffingerdarm, Papille, Zwerchfell
   ===================================================================== */
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var HL = klein ? 0.35 : 0.25;                     /* Gitterweite des rechten Lappens (cm) */
var HK = klein ? 0.2 : 0.15;                      /* Gitterweite der kleinen Lappen mit ebenen Flaechen (Quadrat- und Schwanzlappen: feiner, sonst zackige Kanten) */
var HLI = klein ? 0.3 : 0.2;                      /* Gitterweite des linken Lappens */
var HG = klein ? 0.25 : 0.2;                      /* Gitterweite der Gallenblase */
var HB = 0.1;                                     /* Gitterweite des Sichelbands (duenne Platte) */

/* Normalen aus dem Gradienten des Abstandsfelds (zentrale Differenzen): glatter als die Mittelung der Dreiecksnormalen, auch auf ebenen Flaechen, die schief zum Gitter liegen */
function feldNormalen(g, fn) {
  var p = g.attributes.position, n = g.attributes.normal, e = 0.03, i;
  for (i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var gx = fn(x + e, y, z) - fn(x - e, y, z), gy = fn(x, y + e, z) - fn(x, y - e, z), gz = fn(x, y, z + e) - fn(x, y, z - e), l = Math.sqrt(gx * gx + gy * gy + gz * gz);
    if (l > 1e-9) n.setXYZ(i, gx / l, gy / l, gz / l);
  }
  n.needsUpdate = true;
}
/* Netz aus einem Abstandsfeld: Gitter ueber bounds mit Weite h, Normalen aus dem Feld */
async function netz(fn, bounds, h, fortschritt) {
  var G = S.makeGrid(bounds, h), F = await S.evalFeld(G, fn, fortschritt);
  if (abgebaut) return null;
  var g = S.geometrie(G, F);
  feldNormalen(g, fn);
  return g;
}
function weiter(a, b) { return function (f) { return setLoad(a + f * (b - a)); }; }

/* Rohre entlang von Linien { pts, r0, r1 [, radien, seiten, segmente] } (Koerper-Koordinaten): der Radius gleitet weich (smoothstep) von r0 nach r1,
   mit radien (Radius je Steuerpunkt) stueckweise linear; Enden mit Kappe (offen: ohne); alle Linien zu einer Geometrie. Die Steuerpunkte laufen wie in der Form
   (kurve in leber-form.js) als Catmull-Rom-Kurve. */
function rohre(linien) {
  var pos = [], nor = [], idx = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rm = l.radien ? Math.max.apply(null, l.radien) : Math.max(l.r0, l.r1), rad = l.seiten || (rm > 0.5 ? 14 : rm > 0.2 ? 10 : 7), tub = l.segmente || Math.max(6, l.pts.length * 5);
    var radius = function (t) {
      if (l.radien) { var u = t * (l.radien.length - 1), k = Math.min(l.radien.length - 2, Math.floor(u)); return l.radien[k] + (l.radien[k + 1] - l.radien[k]) * (u - k); }
      return l.r0 + (l.r1 - l.r0) * t * t * (3 - 2 * t);
    };
    var g = new THREE.TubeGeometry(kurve, tub, rm, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    for (i = 0; i <= tub; i++) {   /* jeden Ring um seine Mitte auf den Radius an dieser Stelle skalieren */
      var f = radius(i / tub) / rm, c0 = kurve.getPointAt(i / tub);
      for (j = 0; j <= rad; j++) { var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f); }
    }
    for (i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
    for (i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    if (!l.offen) [[0, -1, 0], [1, 1, tub * (rad + 1)]].forEach(function (e) {   /* [Ort auf der Kurve, Richtung der Kappe, Ring im Rohr] */
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

/* Zwerchfell: duenne Kuppelflaeche (form.kuppel der Lunge, rechts hoeher) ueber der Leber, nur dort, wo die Kuppel ueber dem Rand an der Brustwand liegt
   (kuppelRand: wie zwerchfellGeo im Koerper), und nur ueber der Leber und ZW_RAND cm daneben. Gitter in x/z mit Weite ZW_H; Dreiecke am Rand werden an der
   Grenze (linear zwischen den Gitterpunkten) beschnitten, Normalen aus der Neigung der Kuppel. */
var ZW_H = 0.3, ZW_RAND = 0.4, ZW_UNTER = 0.75;   /* ZW_UNTER: Die Oberseite der Leber liegt 0,5 cm unter der Kuppel; geprueft wird 0,25 cm darunter */
function zwerchfellGeo() {
  var kup = lform.kuppel, rand = lform.kuppelRand, X0 = -15.7, X1 = 9.5, Z0 = -7.6, Z1 = 9.2;
  var nx = Math.ceil((X1 - X0) / ZW_H), nz = Math.ceil((Z1 - Z0) / ZW_H), F = new Float32Array((nx + 1) * (nz + 1)), i, j;
  var wert = function (x, z) { var y = kup(x, z); return Math.max(form.leber(x, y - ZW_UNTER, z) - ZW_RAND, rand(x, z) - y); };   /* < 0: Zwerchfell dort zeigen */
  for (i = 0; i <= nx; i++) for (j = 0; j <= nz; j++) F[i * (nz + 1) + j] = wert(X0 + i * ZW_H, Z0 + j * ZW_H);
  var pos = [], nor = [], idx = [];
  var punkt = function (q) {   /* Eckpunkt [x, z] auf der Kuppel mit Normale */
    var x = q[0], z = q[1], e = 0.05, gx = (kup(x + e, z) - kup(x - e, z)) / (2 * e), gz = (kup(x, z + e) - kup(x, z - e)) / (2 * e), l = Math.sqrt(gx * gx + 1 + gz * gz);
    pos.push(x, kup(x, z), z); nor.push(-gx / l, 1 / l, -gz / l);
    return pos.length / 3 - 1;
  };
  var beschnitten = function (tri) {   /* Teil des Dreiecks (Ecken [x, z, wert]) mit wert < 0, als Vieleck */
    var out = [], k;
    for (k = 0; k < tri.length; k++) {
      var p = tri[k], q = tri[(k + 1) % tri.length], pin = p[2] < 0, qin = q[2] < 0;
      if (pin) out.push(p);
      if (pin !== qin) { var t = p[2] / (p[2] - q[2]); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, 0]); }
    }
    return out;
  };
  var ecke = function (a, b) { return [X0 + a * ZW_H, Z0 + b * ZW_H, F[a * (nz + 1) + b]]; };
  for (i = 0; i < nx; i++) for (j = 0; j < nz; j++) {
    var c00 = ecke(i, j), c10 = ecke(i + 1, j), c01 = ecke(i, j + 1), c11 = ecke(i + 1, j + 1);
    [[c00, c10, c11], [c00, c11, c01]].forEach(function (tri) {
      if (tri[0][2] >= 0 && tri[1][2] >= 0 && tri[2][2] >= 0) return;
      var poly = beschnitten(tri), v = poly.map(punkt), k;
      for (k = 1; k < v.length - 1; k++) idx.push(v[0], v[k], v[k + 1]);
    });
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/* Papille: kleine Erhebung (Halbkugel, etwas flacher) innen an der Wand des absteigenden Zwoelffingerdarms; form.PAPILLE.p = Muendung des Gangs an der Aussenwand
   (1,1 cm von der Achse), richtung = Einheitsvektor ins Lumen, r = Radius der Erhebung; die Wand (Radius 1,0) liegt 0,1 cm vor p */
function papilleGeo() {
  var P = form.PAPILLE, d = V(P.richtung[0], P.richtung[1], P.richtung[2]).normalize();
  var g = new THREE.SphereGeometry(1, 20, 10, 0, 2 * PI, 0, PI / 2);   /* Halbkugel, Pol nach +y */
  g.scale(P.r, P.r * 0.8, P.r);
  g.applyMatrix4(new THREE.Matrix4().compose(V(P.p[0] + d.x * 0.1, P.p[1] + d.y * 0.1, P.p[2] + d.z * 0.1), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d), V(1, 1, 1)));
  return g;
}

/* Aufbau: Lappen -> Gallenblase -> Baender -> Gefaesse und Gaenge -> Umgebung (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
var hvMesh = null, hvStart = 0, HV_KURZ = 107.5;   /* Hohlvene: ganzer Abschnitt oder (Unterseite) nur der Teil ab der Hoehe HV_KURZ, der in der Rinne an der Leber liegt; hvStart = erster Index dieses Teils */
async function bauen() {
  await setLoad(0.01, 'Form der Lunge'); if (abgebaut) return;
  lform = await Kern.formLaden('lunge'); if (abgebaut) return;   /* liefert die Zwerchfellkuppel (die Leberform greift beim Auswerten darauf zu) */
  await setLoad(0.03, 'Leberlappen'); if (abgebaut) return;
  var lap = form.lappen(), vol = lap.map(function (l) { var g = l.grenzen; return (g[1][0] - g[0][0]) * (g[1][1] - g[0][1]) * (g[1][2] - g[0][2]); }), vs = 0, acc = 0, i;
  vol.forEach(function (v) { vs += v; });
  for (i = 0; i < lap.length; i++) {
    var l = lap[i], a = 0.03 + 0.55 * acc / vs, b = 0.03 + 0.55 * (acc + vol[i]) / vs;
    acc += vol[i];
    var g = await netz(l.sdf, l.grenzen, l.id === 'lappenR' ? HL : l.id === 'lappenL' ? HLI : HK, weiter(a, b)); if (abgebaut) return;
    addMesh(l.id, g, MAT[l.id], STRUCT[l.id].de, 1); tris.lappen += anz(g);
  }
  await setLoad(0.58, 'Gallenblase'); if (abgebaut) return;
  var gb = await netz(form.gallenblase, form.GALLENBLASE.grenzen, HG, weiter(0.58, 0.64)); if (abgebaut) return;
  addMesh('gallenblase', gb, MAT.gallenblase, STRUCT.gallenblase.de, 4); tris.gallenblase = anz(gb);
  await setLoad(0.64, 'Sichelband'); if (abgebaut) return;
  var sb = await netz(form.sichelband, form.SICHELBAND.grenzen, HB, weiter(0.64, 0.68)); if (abgebaut) return;
  addMesh('baender', sb, MAT.baender, 'Sichelband', 2); tris.baender += anz(sb);
  var RB = form.RUNDES_BAND, rg = rohre([{ pts: RB.pts, r0: RB.r, r1: RB.r, radien: RB.radien, seiten: 8, segmente: 40 }]);
  addMesh('baender', rg, MAT.baender, 'Rundes Leberband', 2); tris.baender += anz(rg);
  await setLoad(0.7, 'Gefäße und Gänge'); if (abgebaut) return;
  var G = form.GEFAESSE, B = form.baeume(), ln = function (g) { return { pts: g.pts, r0: g.r0, r1: g.r1 }; };
  await setLoad(0.84, 'Gefäße und Gänge'); if (abgebaut) return;
  var stamm = ln(G.pfortader[0]), stuempfe = G.pfortader.slice(1).map(function (g) { return { pts: form.stumpf(g.pts, form.STUMPF), r0: g.r0, r1: g.r1, segmente: 24 }; });
  var gef = {
    pfortader: [stamm].concat(stuempfe, B.pfortader),                                          /* Stamm bis zur Teilung, Stuempfe von Milz- und Mesenterialvene, Aeste in der Leber */
    arterie: [ln(G.leberarterie[0])].concat(B.arterie),
    lebervenen: B.venen,                                                                      /* die drei Staemme und ihre Aeste */
    lebergang: G.gallengang.filter(function (g) { return g.id !== 'blasengang' && g.id !== 'hauptgallengang'; }).map(ln).concat(B.galle),
    blasengang: G.gallengang.filter(function (g) { return g.id === 'blasengang'; }).map(ln),
    hauptgang: G.gallengang.filter(function (g) { return g.id === 'hauptgallengang'; }).map(ln),
    pankreasgang: G.pankreasgang.map(ln)
  };
  Object.keys(gef).forEach(function (sid) {
    var geo = rohre(gef[sid]);
    addMesh(sid, geo, MAT[sid], STRUCT[sid].de, 2); tris.gefaesse += anz(geo);
  });
  await setLoad(0.92, 'Zwölffingerdarm und Zwerchfell'); if (abgebaut) return;
  var hv = form.hohlveneAbschnitt(), dl = form.duodenumLinie(), jedes = function (pts, n) { return pts.filter(function (q, k) { return k % n === 0 || k === pts.length - 1; }); };
  var HV_SEITEN = 20, HV_RINGE = 120, hg = rohre([{ pts: jedes(hv, 3), r0: form.HOHLVENE.r, r1: form.HOHLVENE.r, seiten: HV_SEITEN, segmente: HV_RINGE, offen: true }]);
  hvMesh = addMesh('hohlvene', hg, MAT.hohlvene, STRUCT.hohlvene.de, 2); tris.umgebung += anz(hg);
  /* Start des kurzen Abschnitts: erster Ring ab der Hoehe HV_KURZ; die Dreiecke des offenen Rohrs liegen Ring fuer Ring im Index (je Ring HV_SEITEN * 6 Indizes), setDrawRange zeigt den Rest */
  var hp = hg.attributes.position;
  for (hvStart = 0; hvStart < HV_RINGE; hvStart++) {
    var ym = 0, q; for (q = 0; q < HV_SEITEN; q++) ym += hp.getY(hvStart * (HV_SEITEN + 1) + q);
    if (ym / HV_SEITEN >= HV_KURZ) break;
  }
  hvStart *= HV_SEITEN * 6;
  var pg = papilleGeo();
  addMesh('papille', pg, MAT.papille, STRUCT.papille.de, 2); tris.umgebung += anz(pg);
  var dg = rohre([{ pts: jedes(dl, 2), r0: form.DUODENUM.r, r1: form.DUODENUM.r, seiten: 24, segmente: 60 }]);
  addMesh('zwoelffinger', dg, MAT.zwoelffinger, STRUCT.zwoelffinger.de, 3); tris.umgebung += anz(dg);
  var zg = zwerchfellGeo();
  addMesh('zwerchfell', zg, MAT.zwerchfell, STRUCT.zwerchfell.de, 5); tris.umgebung += anz(zg);
  await setLoad(0.97, 'Beschriftung'); if (abgebaut) return;
  ankerBerechnen();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
/* Die Ausschnitte 'Unterseite' und 'Leberpforte' blicken von unten auf die Eingeweideflaeche: Zwoelffingerdarm, Papille und Zwerchfell verdecken dann den Blick und sind
   ausgeblendet, solange man die Ebene nicht selbst bedient hat (wie der Brustkorb bei der Lunge) */
var AUSBLEND = ['zwoelffinger', 'papille', 'zwerchfell'], hand = {};

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (Gefaesse, Gaenge, Gallenblase) */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = !!enabled[o.userData.sid]; });
  lv++;
}
/* Glas (Durchsicht) der Lappen; Material nur neu uebersetzen, wenn sich transparent aendert */
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  LAPPEN.forEach(function (sid) { stelleMat(MAT[sid], seeThrough, seeThrough ? GLAS : 1); });
}
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

/* Ebene ein- oder ausschalten (Schalter der Leiste und Ausschnitte) */
function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility();
}
(function leiste() {
  /* Reiter: Strukturen, Hilfekarten, Ueben (die beiden letzten Reiter sind vorbereitet und noch leer) */
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
      function flip() {
        hand[s.id] = true;
        ebene(s.id, !enabled[s.id]);
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
  $('legNote').textContent = LEGNOTE[an ? 1 : 0];
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

/* Handy: Hoehe der Werkzeugleiste als --wz (Infokarte und spaeter Schema und Hilfekarte enden darueber); aendert sich die Leiste (Umbruch), misst der Beobachter neu */
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
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var K3 = function (x, y, z) { return V(x - M[0], y - M[1], z - M[2]); };   /* Koerper-Koordinaten -> Modell */
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: 0, phi: PI / 2, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Unterseite', theta: PI, phi: 2.62, target: K3(-4.7, 106.8, 0.7), ext: [25, 18], halb: 12.5 },
  { name: 'Leberpforte', theta: 0.45, phi: 2.6, target: K3(-2.7, 107.4, 1.0), ext: [11, 8.5], halb: 5.5 },
  { name: 'Gallenwege', theta: -0.7, phi: 2.0, target: K3(-4.6, 101.6, 1.0), ext: [15, 14], halb: 7.5 }
];
var view = { theta: 0, phi: PI / 2, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 4, maxDist: 160 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Leber und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  AUSBLEND.forEach(function (sid) { if (!hand[sid]) ebene(sid, i !== 1 && i !== 2); });   /* Unterseite und Leberpforte: Blick von unten frei */
  if (hvMesh) hvMesh.geometry.setDrawRange(i === 1 ? hvStart : 0, i === 2 ? 0 : Infinity);   /* ... und von der Hohlvene bei der Unterseite nur der Teil in der Rinne der Leber, bei der Leberpforte nichts */
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Zwerchfell, Zwoelffingerdarm, Lappen bei Durchsicht) zaehlen nur,
   wenn dahinter nichts Dichteres getroffen wird */
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
   5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Kandidaten fuer den Ankerpunkt je Ausschnitt und Struktur (Raum der Szene); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren.
   Bei den Lappen: Punkt auf der Oberflaeche an der Stelle, an der die Gerade durch den Koerper-Punkt q in Blickrichtung des Ausschnitts auf das Netz trifft; sonst Punkte auf den Mittellinien. */
var KAND = [{}, {}, {}, {}], rayA = new THREE.Raycaster();
function ankerBerechnen() {
  root.updateMatrixWorld(true);
  var P = function (a) { return K3(a[0], a[1], a[2]); };
  var liste = function (arr) { return arr.filter(Boolean).map(P); };
  var blick = AUSSCHNITTE.map(function (a) { var sp = Math.sin(a.phi); return V(sp * Math.sin(a.theta), Math.cos(a.phi), sp * Math.cos(a.theta)); });   /* Richtung Koerper -> Kamera */
  var oberflaeche = function (i, sid, qs) {   /* Oberflaechenpunkte (Koerper-Koordinaten) der Struktur sid zu den Geraden durch qs in Blickrichtung des Ausschnitts i */
    var out = [];
    qs.forEach(function (q) {
      var p = K3(q[0], q[1], q[2]);
      rayA.set(p.clone().addScaledVector(blick[i], 40), blick[i].clone().negate()); rayA.far = 80;
      var hit = rayA.intersectObjects(STRUCT[sid].meshes, false);
      if (hit.length) out.push([hit[0].point.x + M[0], hit[0].point.y + M[1], hit[0].point.z + M[2]]);
    });
    return out;
  };
  var kurve = form.kurve, G = form.GEFAESSE, B = form.baeume();
  var auf = function (pts, f) { var c = kurve(pts, 8); return c[Math.min(c.length - 1, Math.round(f * (c.length - 1)))]; };   /* Punkt bei Bruchteil f entlang der Kurve durch pts */
  var seitlich = function (p, dz) { return [p[0], p[1], p[2] + dz]; };
  var dl = form.duodenumLinie(), hv = form.hohlveneAbschnitt(), PA = form.PAPILLE, zw = function (x, z) { return [x, lform.kuppel(x, z), z]; };
  var hoehe = function (y) { for (var k = 0; k < hv.length; k++) if (hv[k][1] >= y) return hv[k]; return hv[hv.length - 1]; };   /* Punkt der Hohlvene in der Hoehe y */
  var ast = function (liste_, k) { return liste_[Math.min(k, liste_.length - 1)]; };
  var gg = G.gallengang;
  /* Mittellinien je Ausschnitt (die Reihenfolge zaehlt: der erste Punkt ohne Verdeckung wird genommen); von der Hohlvene liegt in den Ausschnitten von unten nur der Teil ab HV_KURZ vor */
  var Z = AUSSCHNITTE.map(function (a, i) {
    var unten = i === 1;
    return {
      pfortader: i === 0 ? [auf(G.pfortader[1].pts, 0.2), auf(G.pfortader[2].pts, 0.3), auf(G.pfortader[0].pts, 0.5)]
        : [auf(G.pfortader[0].pts, 0.7), auf(G.pfortader[0].pts, 0.4), auf(ast(B.pfortader, 0).pts, 0.5), auf(G.pfortader[2].pts, 0.3), auf(G.pfortader[1].pts, 0.2)],
      arterie: [auf(G.leberarterie[0].pts, 0.5), auf(G.leberarterie[0].pts, 0.25), auf(G.leberarterie[0].pts, 0.8)],
      lebervenen: [auf(ast(B.venen, 0).pts, 0.6), auf(ast(B.venen, 1).pts, 0.6), auf(ast(B.venen, 2).pts, 0.6)],
      hohlvene: unten ? [hoehe(112), hoehe(109), hoehe(116)] : [hoehe(101), hoehe(99.5), hoehe(103)].concat([hoehe(113), hoehe(116)]),
      lebergang: [auf(gg[0].pts, 0.8), auf(gg[1].pts, 0.8), auf(gg[2].pts, 0.5), auf(gg[0].pts, 0.4), auf(gg[1].pts, 0.4)],
      blasengang: [auf(gg[3].pts, 0.5), auf(gg[3].pts, 0.25), auf(gg[3].pts, 0.75)],
      hauptgang: [auf(gg[4].pts, 0.4), auf(gg[4].pts, 0.7), auf(gg[4].pts, 0.2)],
      pankreasgang: [auf(G.pankreasgang[0].pts, 0.5), auf(G.pankreasgang[0].pts, 0.3)],
      papille: [[PA.p[0] + PA.richtung[0] * 0.3, PA.p[1] + PA.richtung[1] * 0.3, PA.p[2] + PA.richtung[2] * 0.3]],
      zwoelffinger: [seitlich(dl[28], 0.9), seitlich(dl[36], 0.9), seitlich(dl[20], 0.9), seitlich(dl[44], 0.9)],
      baender: [auf(form.RUNDES_BAND.pts, 0.85), auf(form.RUNDES_BAND.pts, 0.65), auf(form.RUNDES_BAND.pts, 0.45)],
      zwerchfell: [zw(-8, 1), zw(-12, -1), zw(4, 2), zw(-3, 3)]
    };
  });
  /* Lappen und Gallenblase: je Ausschnitt eigene Suchgeraden (Koerper-Punkte, durch die der Blick geht) */
  var Q = [
    { lappenR: [[-9, 110, 0], [-7, 112.5, 0], [-11.5, 107, 0]], lappenL: [[4, 111, 0], [3, 113.5, 0], [5.5, 109.5, 0]], gallenblase: [[-5.6, 103.6, 5], [-5.4, 104.6, 4]] },
    { lappenR: [[-9.5, 106, 2], [-10, 108, -2.5], [-7.5, 109.5, -3.5]], lappenL: [[3, 108.3, 0.5], [4.5, 109, 2]], quadrat: [[-1.5, 108.1, 4.0], [-2.5, 108, 3.3]],
      schwanz: [[0.6, 108, -1.8], [0.2, 108.6, -2.6], [-0.5, 108.2, -0.8], [0.9, 109.5, -3.2], [-1, 109, -1.5]], gallenblase: [[-5.4, 104.6, 4]] },
    { lappenR: [[-9, 106, 0.5], [-8, 107, 3]], quadrat: [[-2, 107.9, 3.2], [-1.5, 108, 4]], gallenblase: [[-5, 105.5, 3], [-5.4, 104.6, 4]] },
    { lappenR: [[-8, 106.5, 0.5], [-9, 107, 3]], gallenblase: [[-5.4, 104.6, 4], [-5.6, 103.6, 5]] }
  ];
  AUSSCHNITTE.forEach(function (a, i) {
    Object.keys(Z[i]).forEach(function (id) { KAND[i][id] = liste(Z[i][id]); });
    Object.keys(Q[i]).forEach(function (id) { KAND[i][id] = liste(oberflaeche(i, id, Q[i][id])); });
  });
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
    if (hits[i].distance < d - 0.3) return false;
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
var KURZ = { baender: 'Leberbänder', zwoelffinger: 'Zwölffingerdarm', zwerchfell: 'Zwerchfell' };   /* kürzere Namen und lateinische Namen, damit die Beschriftung in die Spalte passt */
var LATKURZ = { baender: 'Lig. falciforme et teres' };
var HANDYNAME = {
  lappenR: 'Rechter Lappen', lappenL: 'Linker Lappen', baender: 'Leberbänder', arterie: 'Leberarterie', blasengang: 'Blasengang', hauptgang: 'Hauptgallengang',
  pankreasgang: 'Pankreasgang'
};   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
var HANDY_GROSS = ['lappenR', 'lappenL', 'baender', 'pfortader', 'hohlvene', 'gallenblase', 'zwoelffinger', 'zwerchfell'];   /* Handy, Uebersicht: nur diese werden beschriftet */
/* je Ausschnitt: Strukturen in der Beschriftung (die Lebervenen erscheinen nur bei Durchsicht: sonst verdeckt sie das Lebergewebe) */
var LISTEN = [
  ['lappenR', 'lappenL', 'baender', 'pfortader', 'hohlvene', 'gallenblase', 'hauptgang', 'zwoelffinger', 'papille', 'zwerchfell', 'lebervenen'],
  ['lappenR', 'lappenL', 'quadrat', 'schwanz', 'baender', 'pfortader', 'arterie', 'lebergang', 'gallenblase', 'hohlvene', 'lebervenen'],
  ['lappenR', 'quadrat', 'baender', 'pfortader', 'arterie', 'lebergang', 'blasengang', 'hauptgang', 'gallenblase'],
  ['gallenblase', 'blasengang', 'lebergang', 'hauptgang', 'zwoelffinger', 'papille', 'pankreasgang', 'pfortader', 'lappenR']
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
  if (showLabels && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt die Leber, ohne Beschriftung bleibt sie frei; bei einer Hilfekarte keine Beschriftung */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id]) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen, die Namen stehen dann neben dem Modell */
      var an = id in VIS ? VIS[id] : (KAND[aktiv][id] || [])[0];
      if (!an) return;
      pv.copy(an).project(camera);   /* ANKER liegen schon im Raum der Szene (Koerper-Koordinaten minus M) */
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
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
var App = window.LeberApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris };
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
  delete window.LeberApp;
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
Kern.organ('leber', organ);
})();
