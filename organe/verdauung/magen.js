/* =====================================================================
   Magen - Mageneingang, Magensaft und Pförtner
   Der Magen von vorn wie im Koerper (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn), nuechtern: Aussenwand in Bereichen (Mageneingang, Magengrund,
   Magenkoerper, Magenvorhof, Pfoertner), innen die Schleimhaut mit Laengsfalten, an der Schnittkante die drei Muskelschichten (Laengs, Ring, schraeg) und die
   Wuelste von Pfoertner und Mageneingang, dazu das Ende der Speiseroehre, der Anfang des Zwoelffingerdarms, Magenarterien, Magenvenen, Pfortader-Anfang,
   Vagusnerv und das Zwerchfell (nur Lage). Die Form liefert organe/verdauung/verdauung-form.js (Kern.Formen.verdauung; Zwerchfellkuppel aus der Form der Lunge,
   Gefaesse aus der Form der Leber); hier wird sie vernetzt, eingefaerbt und bedient.
   Netze: Aussenflaeche und Innenraum (Lumen) je einmal aus dem Abstandsfeld, an der Schnittflaeche (ungefaehr frontal, form.schnitt) in vordere und hintere Haelfte
   geteilt (Dreiecke werden exakt beschnitten) und in Bereiche zerlegt; die Schnittflaeche selbst ist ein Hoehenfeld z = zs(x, y), aus dem die Kappen der Schichten
   entstehen (sauber geschlossene Schnittkante). Innenansicht: die vordere Haelfte (Deckel) gleitet nach vorn und blendet aus, wie bei der Niere.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste, Lesehilfe. Die Zeilen "Stoffe" und "Stroemung", der Mahlzeit-Schalter,
   das Schema, Hilfekarten und Ueben folgen in spaeteren Schritten.
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col = Grundfarbe des Materials), Text und
   Fakten der Infokarte (Texte von Joern freigegeben; fakten = Liste [Bezeichnung, Wert], ohne Bezeichnung steht der Wert ueber die ganze Breite).
   ===================================================================== */
var STRUKTUREN = [
  { id: 'mageneingang', de: 'Mageneingang', lat: 'Cardia', grp: 'Magen', col: 0xDE9F85,
    txt: 'Hier mündet die Speiseröhre knapp unter dem Zwerchfell in den Magen. Ein Muskelring und der spitze Winkel, in dem die Speiseröhre einmündet, verhindern, dass saurer Mageninhalt zurückfließt.',
    fakten: [['Lage', 'links neben der Wirbelsäule, unter dem Zwerchfell'], ['Aufgabe', 'Verschluss gegen Rückfluss'], ['Versagt er', 'Sodbrennen (Reflux)']] },
  { id: 'magengrund', de: 'Magengrund', lat: 'Fundus gastricus', grp: 'Magen', col: 0xE9B692,
    txt: 'Die Kuppel des Magens links unter dem Zwerchfell. Hier sammelt sich verschluckte Luft – im Röntgenbild als „Magenblase“ zu sehen. In seiner Schleimhaut liegen viele Drüsen, die Magensaft bilden.',
    fakten: [['Lage', 'oben links, unter der Zwerchfellkuppel'], ['Inhalt', 'oft eine Luftblase'], ['Drüsen', 'bilden Salzsäure und Pepsin']] },
  { id: 'magenkoerper', de: 'Magenkörper', lat: 'Corpus gastricum', grp: 'Magen', col: 0xE8B48E,
    txt: 'Der größte Teil des Magens zwischen Magengrund und Vorhof. Er nimmt die Nahrung auf und dehnt sich dabei stark. Seine Drüsen bilden den größten Teil des Magensafts. Der innere Rand heißt kleine, der äußere große Kurvatur.',
    fakten: [['Fassungsvermögen', 'ca. 1,5 l, gedehnt bis 2–3 l'], ['Drüsen', 'Salzsäure, Pepsin, Schleim, Intrinsic-Faktor'], ['Ränder', 'kleine und große Kurvatur']] },
  { id: 'magenvorhof', de: 'Magenvorhof', lat: 'Antrum pyloricum', grp: 'Magen', col: 0xE4AC86,
    txt: 'Der untere, enger werdende Teil vor dem Pförtner. Hier sind die Muskelwellen am kräftigsten: Sie zerkleinern und durchmischen die Nahrung zu einem feinen Speisebrei (Chymus) und drücken ihn gegen den Pförtner.',
    fakten: [['Lage', 'rechts unten, vor dem Pförtner'], ['Aufgabe', 'zerkleinern und mischen'], [null, 'Bildet das Hormon Gastrin (regt den Magensaft an)']] },
  { id: 'pfoertner', de: 'Pförtner', lat: 'Pylorus', grp: 'Magen', col: 0xD18B72,
    txt: 'Ein dicker Ringmuskel am Ausgang des Magens. Er öffnet sich nur kurz und lässt den Speisebrei in kleinen Portionen in den Zwölffingerdarm – so kann der Darm ihn Schritt für Schritt verdauen.',
    fakten: [['Lage', 'rechts der Mittellinie, am Übergang zum Zwölffingerdarm'], ['Aufgabe', 'portionsweise Entleerung'], [null, 'Bei Säuglingen kann er verdickt sein (Erbrechen im Schwall)']] },
  { id: 'schleimhaut', de: 'Magenschleimhaut', lat: 'Tunica mucosa gastrica', grp: 'Magen', col: 0xE88F8C,
    txt: 'Die innere Auskleidung mit Längsfalten, die sich beim Füllen glätten. Ihre Drüsen bilden täglich 2–3 Liter Magensaft. Eine dicke Schleimschicht mit Bicarbonat schützt sie davor, sich selbst zu verdauen.',
    fakten: [['Falten', 'glätten sich bei Füllung'], ['Magensaft', '2–3 l pro Tag, pH 1–2'], ['Schutz', 'Schleim und Bicarbonat, gute Durchblutung']] },
  { id: 'muskulatur', de: 'Magenmuskulatur', lat: 'Tunica muscularis', grp: 'Magen', col: 0xB8473F,
    txt: 'Drei Muskelschichten – längs, ringförmig und schräg – kneten den Mageninhalt. Muskelwellen (Peristaltik) laufen etwa dreimal pro Minute vom Magenkörper zum Pförtner.',
    fakten: [['Schichten', 'längs, ringförmig, schräg'], ['Wellen', 'ca. 3 pro Minute'], ['Steuerung', 'Vagusnerv und Hormone']] },
  { id: 'speiseroehre', de: 'Speiseröhre', lat: 'Oesophagus', grp: 'Zu- und Abfluss', col: 0xD99A8A,
    txt: 'Der Muskelschlauch bringt die Nahrung vom Rachen durch das Zwerchfell zum Mageneingang. Gezeigt ist ihr unteres Ende. Ein Bissen braucht für den Weg etwa 5–10 Sekunden.',
    fakten: [['Länge', 'ca. 25 cm'], ['Transport', 'Muskelwellen (Peristaltik)'], ['Durchtritt', 'durch das Zwerchfell']] },
  { id: 'zwoelffinger', de: 'Zwölffingerdarm', lat: 'Duodenum', grp: 'Zu- und Abfluss', col: 0xE3A58C,
    txt: 'Der erste Abschnitt des Dünndarms schließt an den Pförtner an. Hier kommen Galle und Pankreassaft hinzu, die den sauren Speisebrei neutralisieren und die eigentliche Verdauung übernehmen. Gezeigt ist sein Anfang.',
    fakten: [['Länge', 'ca. 25–30 cm'], ['Zuflüsse', 'Galle und Pankreassaft (an der Papille)'], [null, 'Weiter im Modell „Darm“']] },
  { id: 'arterien', de: 'Magenarterien', lat: 'Arteriae gastricae', grp: 'Gefäße und Nerv', col: 0xC9483A,
    txt: 'Mehrere Arterien aus dem Truncus coeliacus der Bauchaorta ziehen entlang der kleinen und großen Kurvatur und versorgen die Magenwand mit sauerstoffreichem Blut. Die gute Durchblutung schützt auch die Schleimhaut.',
    fakten: [['Herkunft', 'Truncus coeliacus (Bauchaorta)'], ['Verlauf', 'entlang beider Kurvaturen'], ['Blutung aus ihnen', 'z. B. bei einem Magengeschwür']] },
  { id: 'venen', de: 'Magenvenen', lat: 'Venae gastricae', grp: 'Gefäße und Nerv', col: 0x8E6FD0,
    txt: 'Sie begleiten die Arterien und bringen das Blut aus der Magenwand zur Pfortader und damit zur Leber. Bei Pfortaderhochdruck weichen Venen am Mageneingang aus – es entstehen Krampfadern (Varizen).',
    fakten: [['Abfluss', 'zur Pfortader'], ['Verlauf', 'mit den Arterien an den Kurvaturen'], ['Gefahr', 'Varizen bei Leberzirrhose']] },
  { id: 'pfortader', de: 'Pfortader', lat: 'Vena portae hepatis', grp: 'Gefäße und Nerv', col: 0x7A5CB0,
    txt: 'Sie sammelt das Blut aus Magen, Darm und Milz und bringt es zur Leber. Gezeigt ist ihr Anfang mit den Magenvenen.',
    fakten: [['Ziel', 'Leber'], ['Zuflüsse', 'Magen, Darm, Milz'], [null, 'Weiter im Modell „Leber“']] },
  { id: 'vagus', de: 'Vagusnerv', lat: 'Nervus vagus', grp: 'Gefäße und Nerv', col: 0xE8D05A,
    txt: 'Zwei Stränge des Vagusnervs ziehen mit der Speiseröhre durch das Zwerchfell an die Vorder- und Rückseite des Magens. Schon der Anblick oder Geruch von Essen regt über ihn Magensaft und Muskelwellen an.',
    fakten: [['Herkunft', 'Hirnstamm'], ['Wirkung', 'mehr Magensaft, mehr Bewegung'], [null, 'Teil des Parasympathikus („Ruhe und Verdauung“)']] },
  { id: 'zwerchfell', de: 'Zwerchfell (Lage)', lat: 'Diaphragma', grp: 'Umgebung', col: 0xB5655A,
    txt: 'Die Muskelplatte über dem Magen. Die Speiseröhre tritt durch eine Lücke im Zwerchfell zum Magen. Ist diese Lücke zu weit, kann ein Teil des Magens in den Brustraum rutschen (Hiatushernie).',
    fakten: [] }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt; die Zeilen "Stoffe" und "Stroemung" kommen spaeter dazu (je eine weitere .trow) */
var MARKUP = `<div id="title">
  <div class="kicker">Magen &middot; Gaster</div>
  <h1>Mageneingang, Magensaft &amp; <em>Pförtner</em></h1>
  <div class="sub">Speichert die Nahrung, durchmischt sie mit Magensaft und gibt sie portionsweise an den Darm weiter.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Übersicht</button>
    <button id="cam1" class="gh" title="Die vordere Magenwand ist abgehoben: Falten und Muskelschichten">Innenansicht</button>
    <button id="cam2" class="gh">Mageneingang</button>
    <button id="cam3" class="gh">Pförtner</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Magenwand durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#E8C84F">Gelb</b> Kohlenhydrate – im Mund angedaut, im Magen kaum verändert.<br>
  <b style="color:#E88B3A">Orange</b> Eiweiß – Säure und Pepsin spalten es in kürzere Stücke.<br>
  <b style="color:#F2F2F2">Weiß</b> Fett – schwimmt oben und verlässt den Magen zuletzt.<br>
  <b style="color:#8FD0F0">Hellblau</b> Wasser – fließt entlang der kleinen Kurvatur rasch weiter.<br>
  <b style="color:#3FC9B8">Türkis</b> Magensaft – aus den Drüsen von Magengrund und Magenkörper.<br>
  <b style="color:#E0584C">Rot</b> Magenarterien, <b style="color:#A98BDC">Violett</b> Magenvenen und Pfortader.</p>
  <p class="note" id="legNote">Der Magen von vorn, wie er im Körper liegt. „Innenansicht“ und „Durchsicht“ zeigen den Inhalt.</p>
  <p class="note">Die Teilchen zeigen den Weg der Stoffe – symbolisch, nicht maßstäblich; die Zeit läuft gerafft.</p>
  <p class="note kz">Magensaft ca. 2–3 l pro Tag, pH 1–2<br>
  Fassungsvermögen ca. 1,5 l<br>
  Verweildauer 1–5 Stunden, Fettreiches am längsten</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schließen">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>`;
/* Notiz der Lesehilfe: ohne und mit Durchsicht bzw. Innenansicht */
var LEGNOTE = ['Der Magen von vorn, wie er im Körper liegt. „Innenansicht“ und „Durchsicht“ zeigen den Inhalt.',
  'Die Teilchen zeigen den Weg der Stoffe – symbolisch, nicht maßstäblich; die Zeit läuft gerafft.'];
var organ = { renderer: {}, aufbauen: aufbauen };
/* Mitte des Magens im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, der Magen steht im Modell mittig (Ziel der Kamerafahrt aus dem Koerper) */
var M = [4, 105, 0];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und fuer die Fahrt aus dem Koerper;
   ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt ZIEL_K minus M); leicht von unten links, damit Pfoertner, Kurvaturen und Magengrund gut zu sehen sind */
var ZIEL_K = [3, 106, 1];
var UEBERSICHT = { theta: -0.3, phi: 1.75, ext: [24, 24], halb: 12, ziel: [ZIEL_K[0] - M[0], ZIEL_K[1] - M[1], ZIEL_K[2] - M[2]] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
var DECKEL_WEG = 7;                                /* so weit gleitet die vordere Haelfte nach vorn (cm) */
/* Freier Bereich fuer Magen und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, der Magen steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (WERKZEUG_H, zwei Zeilen; kommen Zeilen dazu, ist sie neu zu messen); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (WERKZEUG_H.handy + (w < WERKZEUG_H.umbruch ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + WERKZEUG_H.desktop };
}
var WERKZEUG_H = { desktop: 80, handy: 70, umbruch: 345 };   /* Hoehe der Leiste (Pixel), unter der Breite umbruch bricht die erste Reihe (Ausschnitt) um (+32) */
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten, also relativ zu M) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.mitte = M;   /* Mitte des Magens im Koerper (cm): Koerper-Punkt = Modell-Punkt + mitte */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = null, lform = null;   /* form: Form der Verdauung, lform: Form der Lunge (Zwerchfellkuppel); beide werden in bauen geladen */
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var PI = Math.PI, DEG = PI / 180;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };
var sstep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* =====================================================================
   1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie; die Muskulatur hat drei Materialien (eines je Schicht),
   die gemeinsam leuchten; die vordere Haelfte (Deckel) hat eigene Materialien mit Endung D, damit sie ausblenden kann)
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var WAND = ['mageneingang', 'magengrund', 'magenkoerper', 'magenvorhof', 'pfoertner', 'zwoelffinger'];   /* Bereiche der Aussenwand (bei "Durchsicht" Glas) */
var GLAS = 0.22;                                             /* Deckkraft der Aussenwand bei "Durchsicht" */
var MAT = {};
WAND.forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.5, coat: 0.4 }); MAT[sid + 'D'] = mat(STRUCT[sid].col, { rough: 0.5, coat: 0.4 }); });
/* Innenseite (Schleimhaut, Zonen von Mageneingang und Pfoertner) und Schnittflaechen; DoubleSide, weil die Innenflaeche von innen angesehen wird */
function innen(hex) { return mat(hex, { rough: 0.6, coat: 0.2, side: THREE.DoubleSide }); }
MAT.schleimhaut = innen(0xE88F8C); MAT.schleimhautD = innen(0xE88F8C);   /* Falten mit mattem Glanz: sonst glitzern die Flanken */
MAT.eingangI = innen(0xD9798F); MAT.eingangID = innen(0xD9798F);
MAT.pfoertnerI = innen(0xCB6A6A); MAT.pfoertnerID = innen(0xCB6A6A);
function kappeMat(hex) { return mat(hex, { rough: 0.55, side: THREE.DoubleSide }); }
MAT.kLaengs = kappeMat(0xD9776A); MAT.kRing = kappeMat(0xB8473F); MAT.kSchraeg = kappeMat(0x8F3030);
MAT.kPfoertner = kappeMat(0x7C3A3A); MAT.kEingang = kappeMat(0x8A3F5F);
MAT.speiseroehre = mat(STRUCT.speiseroehre.col, { rough: 0.5, coat: 0.3, side: THREE.DoubleSide });   /* oben offen: innen sichtbar */
MAT.zwoelffingerRohr = mat(STRUCT.zwoelffinger.col, { rough: 0.5, coat: 0.35, side: THREE.DoubleSide });
['arterien', 'venen', 'pfortader'].forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.4, coat: 0.3 }); });
MAT.vagus = mat(STRUCT.vagus.col, { rough: 0.5, coat: 0.2 });
MAT.zwerchfell = mat(STRUCT.zwerchfell.col, { rough: 0.6, opacity: 0.18, side: THREE.DoubleSide });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

var root = new THREE.Group(); root.name = 'Magen'; root.position.set(-M[0], -M[1], -M[2]); scene.add(root);   /* Koerper-Koordinaten, um die Mitte M verschoben */
var deckel = new THREE.Group(); deckel.name = 'Deckel (vordere Haelfte)'; root.add(deckel);                 /* vordere Haelfte der Wand: gleitet bei der Innenansicht nach vorn */
var tris = { wand: 0, innen: 0, kappen: 0, rohre: 0, zwerchfell: 0 };
var hinten = [], vorn = [], kappen = [];   /* alle Meshes der hinteren Haelfte, des Deckels und der Kappen (fuer Beschriftung und Antippen) */
function addMesh(sid, geo, material, name, order, art, anz_) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order; m.userData.sid = sid; STRUCT[sid].meshes.push(m);
  if (art === 'deckel') { m.userData.deckel = true; deckel.add(m); vorn.push(m); }
  else {
    root.add(m);
    if (art === 'kappe') { m.userData.kappe = true; kappen.push(m); } else if (art === 'hinten') hinten.push(m);
  }
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* =====================================================================
   2. Geometrie: Aussenwand und Innenraum in Bereichen, Kappen der Schnittflaeche, Rohre (Speiseroehre, Zwoelffingerdarm, Gefaesse, Nerv), Zwerchfell
   ===================================================================== */
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var HA = klein ? 0.28 : 0.2;                      /* Gitterweite der Aussenflaeche (cm) */
var HI = klein ? 0.2 : 0.16;                      /* Gitterweite des Innenraums (mit den Falten) */
var HC = klein ? 0.14 : 0.1;                      /* Raster der Schnittflaeche (Kappen) */
var BAND = 1.0, BAND_I = 2.4;                     /* Breite des genau ausgewerteten Bandes (S.evalFeld, schwelle): Aussenflaeche und Innenraum (die Falten ueberschaetzen den Abstand etwas) */

/* Normalen aus dem Gradienten des Abstandsfelds (zentrale Differenzen): glatter als die Mittelung der Dreiecksnormalen */
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
async function netz(fn, bounds, h, fortschritt, schwelle) {
  var G = S.makeGrid(bounds, h), F = await S.evalFeld(G, fn, fortschritt, schwelle);
  if (abgebaut) return null;
  var g = S.geometrie(G, F);
  feldNormalen(g, fn);
  return g;
}
function weiter(a, b) { return function (f) { return setLoad(a + f * (b - a)); }; }

/* Netz an der Flaeche g = 0 teilen (g < 0: neg, sonst pos): Dreiecke, die die Flaeche schneiden, werden exakt beschnitten (lineare Naehe zwischen den Ecken), Normalen
   werden mitgefuehrt; Ergebnis { neg, pos } als Geometrie ohne Index (null, wenn leer) */
function schneide(geo, g) {
  if (!geo) return { neg: null, pos: null };
  var P = geo.attributes.position.array, N = geo.attributes.normal.array, I = geo.index ? geo.index.array : null, nt = I ? I.length / 3 : P.length / 9, nv = P.length / 3, i, t;
  var val = new Float32Array(nv);
  for (i = 0; i < nv; i++) val[i] = g(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
  var A = { p: [], n: [] }, B = { p: [], n: [] };
  function ecke(k) { return { x: P[k * 3], y: P[k * 3 + 1], z: P[k * 3 + 2], nx: N[k * 3], ny: N[k * 3 + 1], nz: N[k * 3 + 2], v: val[k] }; }
  function lerp(p, q, u) {
    var nx = p.nx + (q.nx - p.nx) * u, ny = p.ny + (q.ny - p.ny) * u, nz = p.nz + (q.nz - p.nz) * u, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, z: p.z + (q.z - p.z) * u, nx: nx / l, ny: ny / l, nz: nz / l, v: 0 };
  }
  function dreieck(d, a, b, c) { d.p.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); d.n.push(a.nx, a.ny, a.nz, b.nx, b.ny, b.nz, c.nx, c.ny, c.nz); }
  function klip(v, d, neg) {
    var out = [], k;
    for (k = 0; k < 3; k++) {
      var p = v[k], q = v[(k + 1) % 3], pin = neg ? p.v < 0 : p.v >= 0, qin = neg ? q.v < 0 : q.v >= 0;
      if (pin) out.push(p);
      if (pin !== qin) out.push(lerp(p, q, p.v / (p.v - q.v)));
    }
    for (k = 1; k < out.length - 1; k++) dreieck(d, out[0], out[k], out[k + 1]);
  }
  for (t = 0; t < nt; t++) {
    var a = I ? I[t * 3] : t * 3, b = I ? I[t * 3 + 1] : t * 3 + 1, c = I ? I[t * 3 + 2] : t * 3 + 2;
    var va = val[a], vb = val[b], vc = val[c];
    if (va < 0 && vb < 0 && vc < 0) dreieck(A, ecke(a), ecke(b), ecke(c));
    else if (va >= 0 && vb >= 0 && vc >= 0) dreieck(B, ecke(a), ecke(b), ecke(c));
    else { var v = [ecke(a), ecke(b), ecke(c)]; klip(v, A, true); klip(v, B, false); }
  }
  function geo_(d) {
    if (!d.p.length) return null;
    var r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
    r.setAttribute('normal', new THREE.Float32BufferAttribute(d.n, 3));
    return r;
  }
  return { neg: geo_(A), pos: geo_(B) };
}
/* Netz nacheinander in Bereiche zerlegen: defs = [{ id, g }] (g < 0: gehoert zum Bereich), was uebrig bleibt, bekommt den Namen rest; Ergebnis id -> Geometrie */
function zerlegen(geo, defs, rest) {
  var out = {}, cur = geo, k;
  for (k = 0; k < defs.length; k++) {
    var r = schneide(cur, defs[k].g);
    out[defs[k].id] = r.neg; cur = r.pos;
  }
  out[rest] = cur;
  return out;
}

/* Rohre entlang von Linien { pts, r0, r1 [, seiten, segmente, offen] } (Koerper-Koordinaten): der Radius gleitet weich (smoothstep) von r0 nach r1; Enden mit Kappe
   (offen: ohne); alle Linien zu einer Geometrie. Die Steuerpunkte laufen wie in der Form als Catmull-Rom-Kurve (wie rohre in leber.js). */
function rohre(linien) {
  var pos = [], nor = [], idx = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rm = Math.max(l.r0, l.r1), rad = l.seiten || (rm > 0.5 ? 14 : rm > 0.2 ? 10 : 7), tub = l.segmente || Math.max(6, l.pts.length * 5);
    var radius = function (t) { return l.r0 + (l.r1 - l.r0) * t * t * (3 - 2 * t); };
    var g = new THREE.TubeGeometry(kurve, tub, rm, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    for (i = 0; i <= tub; i++) {   /* jeden Ring um seine Mitte auf den Radius an dieser Stelle skalieren */
      var rr = radius(i / tub), f = rr / rm, c0 = kurve.getPointAt(i / tub);
      for (j = 0; j <= rad; j++) {
        var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f);
      }
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
/* Teil einer Punktfolge zwischen den Bogenlaengen s0 und s1 (cm vom Anfang) */
function bogenTeil(poly, s0, s1) {
  var out = [], tot = 0, i;
  for (i = 1; i < poly.length; i++) {
    var a = poly[i - 1], b = poly[i], l = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2));
    var pt = function (s) { var f = l > 0 ? (s - tot) / l : 0; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; };
    if (s0 >= tot && s0 < tot + l) out.push(pt(s0));
    if (tot + l > s0 && tot + l <= s1) out.push(b.slice());
    if (s1 > tot && s1 <= tot + l) { out.push(pt(s1)); break; }
    tot += l;
  }
  return out;
}

/* Kappen der Schnittflaeche: die Schnittflaeche ist ein Hoehenfeld z = zs(x, y); die Randflaechen der Schichten (form.schichtFeld, Werte B[0..6] und Kanal der Speiseroehre)
   werden auf einem Raster (HC) ausgewertet, jedes Dreieck des Rasters wird nacheinander an den Nullstellen der Randflaechen einer Schicht beschnitten (Schicht = zwischen
   Randflaeche a und b, ausserhalb des Kanals; lineare Naehe zwischen den Rasterpunkten): die Kanten sind glatt, benachbarte Schichten teilen sich dieselbe Kante, auch
   wenn eine Schicht duenner als eine Rasterzelle ist. Ausgewertet wird nur im Band um die Wand (grobe Vorpruefung mit der Aussenflaeche). Reihenfolge der Schichten wie
   form.schichten: schleimhaut, schraeg, ring, laengs, pfoertnerRing, eingangRing. */
var SCHICHTEN = [[[5, 1], [6, -1], [7, -1]], [[2, 1], [3, -1], [7, -1]], [[1, 1], [2, -1], [7, -1]], [[0, 1], [1, -1], [7, -1]], [[3, 1], [4, -1], [7, -1]], [[4, 1], [5, -1], [7, -1]]];   /* je Schicht: [Feld, Vorzeichen]: Vorzeichen * Wert < 0 = innerhalb; Feld 0..6 = B[k], 7 = Kanal */
function kappenGeo() {
  var SF = form.schichtFeld(0), zsF = form.schnittZ(0), aus = form.aussen(0), g = aus.grenzen;
  var x0 = g[0][0], y0 = g[0][1], h = HC, nx = Math.ceil((g[1][0] - x0) / h) + 1, ny = Math.ceil((g[1][1] - y0) / h) + 1, i, j, k, m, NL = SCHICHTEN.length, NFLD = 8;
  var Z = new Float32Array(nx * ny), akt = new Uint8Array(nx * ny), W = [], idx = function (a, b) { return a + nx * b; };
  for (k = 0; k < NFLD; k++) W.push(new Float32Array(nx * ny).fill(3));
  for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) Z[idx(i, j)] = zsF(x0 + i * h, y0 + j * h);
  /* grobe Vorpruefung: Aussenflaeche auf einem groeberen Raster (alle 4 Knoten); aktiv, wo die Wand (Tiefe bis 2,6 cm) in der Naehe liegt */
  var st = 4, cx = Math.ceil((nx - 1) / st) + 1, cy = Math.ceil((ny - 1) / st) + 1, C = new Float32Array(cx * cy);
  for (j = 0; j < cy; j++) for (i = 0; i < cx; i++) { var gi = Math.min(i * st, nx - 1), gj = Math.min(j * st, ny - 1); C[i + cx * j] = aus.sdf(x0 + gi * h, y0 + gj * h, Z[idx(gi, gj)]); }
  for (j = 0; j < cy - 1; j++) for (i = 0; i < cx - 1; i++) {
    var mn = Math.min(C[i + cx * j], C[i + 1 + cx * j], C[i + cx * (j + 1)], C[i + 1 + cx * (j + 1)]), mx = Math.max(C[i + cx * j], C[i + 1 + cx * j], C[i + cx * (j + 1)], C[i + 1 + cx * (j + 1)]);
    if (mn > 1.0 + st * h || mx < -2.6 - st * h) continue;   /* weit ausserhalb bzw. tief im Innenraum: keine Schicht */
    var a, b;
    for (b = j * st; b <= Math.min((j + 1) * st, ny - 1); b++) for (a = i * st; a <= Math.min((i + 1) * st, nx - 1); a++) akt[idx(a, b)] = 1;
  }
  for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
    if (!akt[idx(i, j)]) continue;
    var o = SF(x0 + i * h, y0 + j * h, Z[idx(i, j)]);
    for (k = 0; k < 7; k++) W[k][idx(i, j)] = o[8 + k];
    W[0][idx(i, j)] -= 0.03; W[6][idx(i, j)] += 0.03;   /* aussen und innen 0,03 cm ueber den Rand hinaus: die Kappen schliessen an die beschnittenen Netze von Aussenwand und Innenraum an, ohne Spalt */
    W[7][idx(i, j)] = o[15];
  }
  var P = [], Nn = [];
  for (k = 0; k < NL; k++) { P.push([]); Nn.push([]); }
  function knoten(a, b) {   /* Ecke mit Normale aus dem Gefaelle von zs und den Werten der Felder */
    var ax = Math.max(a - 1, 0), bx = Math.min(a + 1, nx - 1), ay = Math.max(b - 1, 0), by = Math.min(b + 1, ny - 1);
    var sx = (Z[idx(bx, b)] - Z[idx(ax, b)]) / ((bx - ax) * h), sy = (Z[idx(a, by)] - Z[idx(a, ay)]) / ((by - ay) * h), l = Math.sqrt(sx * sx + sy * sy + 1), f = new Float32Array(NFLD);
    for (var q = 0; q < NFLD; q++) f[q] = W[q][idx(a, b)];
    return { x: x0 + a * h, y: y0 + b * h, z: Z[idx(a, b)], nx: -sx / l, ny: -sy / l, nz: 1 / l, f: f };
  }
  function mischen(p, q, u) {
    var nxx = p.nx + (q.nx - p.nx) * u, nyy = p.ny + (q.ny - p.ny) * u, nzz = p.nz + (q.nz - p.nz) * u, ll = Math.sqrt(nxx * nxx + nyy * nyy + nzz * nzz) || 1, f = new Float32Array(NFLD), w;
    for (w = 0; w < NFLD; w++) f[w] = p.f[w] + (q.f[w] - p.f[w]) * u;
    return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, z: p.z + (q.z - p.z) * u, nx: nxx / ll, ny: nyy / ll, nz: nzz / ll, f: f };
  }
  function klipp(poly, fj, sg) {   /* Vieleck an der Halbebene sg * Feld[fj] < 0 beschneiden */
    var out = [], n = poly.length, w;
    for (w = 0; w < n; w++) {
      var p = poly[w], q = poly[(w + 1) % n], vp = sg * p.f[fj], vq = sg * q.f[fj], pin = vp < 0, qin = vq < 0;
      if (pin) out.push(p);
      if (pin !== qin) out.push(mischen(p, q, vp / (vp - vq)));
    }
    return out;
  }
  for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
    if (!(akt[idx(i, j)] && akt[idx(i + 1, j)] && akt[idx(i, j + 1)] && akt[idx(i + 1, j + 1)])) continue;   /* nur Zellen, deren vier Ecken ausgewertet sind */
    var c00 = null, c10, c01, c11;
    for (k = 0; k < NL; k++) {
      var conds = SCHICHTEN[k], aus_ = false;
      for (m = 0; m < conds.length && !aus_; m++) {   /* alle vier Ecken auf der falschen Seite: die Schicht liegt nicht in der Zelle */
        var fj = conds[m][0], sg = conds[m][1];
        if (sg * W[fj][idx(i, j)] >= 0 && sg * W[fj][idx(i + 1, j)] >= 0 && sg * W[fj][idx(i, j + 1)] >= 0 && sg * W[fj][idx(i + 1, j + 1)] >= 0) aus_ = true;
      }
      if (aus_) continue;
      if (!c00) { c00 = knoten(i, j); c10 = knoten(i + 1, j); c01 = knoten(i, j + 1); c11 = knoten(i + 1, j + 1); }
      [[c00, c10, c11], [c00, c11, c01]].forEach(function (tri) {
        var poly = tri, q;
        for (q = 0; q < conds.length && poly.length > 2; q++) poly = klipp(poly, conds[q][0], conds[q][1]);
        for (q = 1; q < poly.length - 1; q++) {
          [poly[0], poly[q], poly[q + 1]].forEach(function (e) { P[k].push(e.x, e.y, e.z); Nn[k].push(e.nx, e.ny, e.nz); });
        }
      });
    }
  }
  return P.map(function (p, k) {
    if (!p.length) return null;
    var r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    r.setAttribute('normal', new THREE.Float32BufferAttribute(Nn[k], 3));
    return r;
  });
}

/* Bogenlaenge entlang der Mittellinie (nuechtern): Abstand vom Anfang im Magengrund bis zum Fusspunkt des Punktes auf dem Linienzug (hinter dem Pfoertner: Gesamtlaenge) */
function bogenFunktion() {
  var ml = form.mittellinie(0), n = ml.length, Sc = new Float64Array(n), j, seg = [];
  for (j = 1; j < n; j++) {
    var a = ml[j - 1].p, b = ml[j].p, vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], l2 = vx * vx + vy * vy + vz * vz;
    Sc[j] = Sc[j - 1] + Math.sqrt(l2);
    seg.push(a[0], a[1], a[2], vx, vy, vz, l2 > 0 ? 1 / l2 : 0);
  }
  var f = function (x, y, z) {
    var best = 1e30, bs = 0, k;
    for (k = 0; k < seg.length; k += 7) {
      var px = x - seg[k], py = y - seg[k + 1], pz = z - seg[k + 2], t = (px * seg[k + 3] + py * seg[k + 4] + pz * seg[k + 5]) * seg[k + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
      var dx = px - seg[k + 3] * t, dy = py - seg[k + 4] * t, dz = pz - seg[k + 5] * t, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < best) { best = d2; bs = Sc[k / 7] + t * (Sc[k / 7 + 1] - Sc[k / 7]); }
    }
    return bs;
  };
  f.L = Sc[n - 1];
  return f;
}

/* Zwerchfell: duenne Kuppelflaeche (form.kuppel der Lunge) ueber dem Magen, nur dort, wo form.zwerchfell() sie zeigt (Ausschnitt ueber dem linken Oberbauch mit der Luecke
   fuer die Speiseroehre; ohne Boden, damit der Rand glatt bleibt); Gitter in x/z mit Weite ZW_H, Dreiecke am Rand und am Loch werden an der Nullstelle des Felds (Wert der Form auf der Kuppel) beschnitten
   (linear zwischen den Gitterpunkten), Normalen aus der Neigung der Kuppel (wie zwerchfellGeo in leber.js) */
var ZW_H = 0.15, ZW_RAND = 2.2, ZW_LOCH = 3.6;
function zwerchfellGeo(zf) {
  var kup = lform.kuppel, X0 = zf.grenzen[0][0], X1 = zf.grenzen[1][0], Z0 = zf.grenzen[0][2], Z1 = zf.grenzen[1][2];
  var nx = Math.ceil((X1 - X0) / ZW_H), nz = Math.ceil((Z1 - Z0) / ZW_H), F = new Float32Array((nx + 1) * (nz + 1)), i, j;
  /* nur ueber dem Magen (bis ZW_RAND cm daneben) und um die Luecke der Speiseroehre (ZW_LOCH cm): sonst waere der Ausschnitt eine grosse Kuppel, die den Magen verdeckt */
  var feld = form.aussen(0).sdf, hia = zf.hiatus;
  for (i = 0; i <= nx; i++) for (j = 0; j <= nz; j++) {
    var x = X0 + i * ZW_H, z = Z0 + j * ZW_H, k = kup(x, z), nah = feld(x, k - 0.7, z) - ZW_RAND;
    if (hia) nah = Math.min(nah, Math.sqrt((x - hia[0]) * (x - hia[0]) + (z - hia[2]) * (z - hia[2])) - ZW_LOCH);
    F[i * (nz + 1) + j] = Math.max(zf.rand[0] - x, x - zf.rand[1], zf.rand[2] - z, z - zf.rand[3], zf.loch ? -zf.loch(x, k, z) : -1e9, nah);   /* < 0: Zwerchfell dort zeigen */
  }
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

var geoDaten = null;   /* Kennpunkte fuer die Beschriftung (Koerper-Koordinaten), nach dem Aufbau */
/* Aufbau: Formen laden -> Aussenwand -> Innenraum -> Kappen -> Rohre -> Zwerchfell (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
async function bauen() {
  await setLoad(0.01, 'Formen laden'); if (abgebaut) return;
  lform = await Kern.formLaden('lunge'); if (abgebaut) return;
  await Kern.formLaden('leber'); if (abgebaut) return;   /* Pfortader und Leberarterie fuer die Gefaesse (die Form der Verdauung greift beim Auswerten darauf zu) */
  form = await Kern.formLaden('verdauung'); if (abgebaut) return;
  await setLoad(0.03, 'Magenwand'); if (abgebaut) return;
  var bogen = bogenFunktion(), L = bogen.L, E = form.EINGANG.p, P = form.PFOERTNER.p, kp = form.kennpunkte(0), scAng = bogen(kp.ANGULUS.p[0], kp.ANGULUS.p[1], kp.ANGULUS.p[2]);
  var duo = form.kurve(form.BAHN.zwoelffingerdarm.pts, 12), td = [duo[1][0] - duo[0][0], duo[1][1] - duo[0][1], duo[1][2] - duo[0][2]], tl = Math.sqrt(td[0] * td[0] + td[1] * td[1] + td[2] * td[2]);
  td = [td[0] / tl, td[1] / tl, td[2] / tl];
  var cut = form.schnitt(0), yF = E[1] - 0.3;
  /* Bereiche der Aussenwand: Verlaengerung ins Duodenum (hinter der Ebene durch den Pfoertner), Mageneingang (Kugel), Pfoertner (die letzten 1,5 cm), Magengrund (ueber der Ebene
     durch den Mageneingang), Magenvorhof (hinter der Incisura angularis), Rest = Magenkoerper */
  var ZONEN = [
    { id: 'zwoelffinger', g: function (x, y, z) { return -((x - P[0]) * td[0] + (y - P[1]) * td[1] + (z - P[2]) * td[2]); } },
    { id: 'mageneingang', g: function (x, y, z) { return Math.sqrt((x - E[0]) * (x - E[0]) + (y - E[1]) * (y - E[1]) + (z - E[2]) * (z - E[2])) - 2.3; } },
    { id: 'pfoertner', g: function (x, y, z) { return L - 1.5 - bogen(x, y, z); } },
    { id: 'magengrund', g: function (x, y, z) { return yF - y; } },
    { id: 'magenvorhof', g: function (x, y, z) { return scAng - bogen(x, y, z); } }
  ];
  var ZONEN_I = [ZONEN[0], ZONEN[1], { id: 'pfoertner', g: function (x, y, z) { return L - 1.7 - bogen(x, y, z); } }];
  var aus = form.aussen(0);
  var gA = await netz(aus.sdf, aus.grenzen, HA, weiter(0.03, 0.2), BAND); if (abgebaut) return;
  await setLoad(0.2, 'Magenwand'); if (abgebaut) return;
  var tA = schneide(gA, cut); gA.dispose();
  [['hinten', tA.neg], ['deckel', tA.pos]].forEach(function (h) {
    var z = zerlegen(h[1], ZONEN, 'magenkoerper');
    Object.keys(z).forEach(function (sid) {
      if (!z[sid]) return;
      var d = h[0] === 'deckel';
      addMesh(sid, z[sid], MAT[sid + (d ? 'D' : '')], STRUCT[sid].de + (d ? ' (vorn)' : ''), 3, h[0]); tris.wand += anz(z[sid]);
    });
  });
  await setLoad(0.24, 'Schleimhaut mit Falten'); if (abgebaut) return;
  var lu = form.lumen(0);
  var gI = await netz(lu.sdf, lu.grenzen, HI, weiter(0.24, 0.62), BAND_I); if (abgebaut) return;
  await setLoad(0.62, 'Schleimhaut mit Falten'); if (abgebaut) return;
  var tI = schneide(gI, cut); gI.dispose();
  var INNEN = { zwoelffinger: ['schleimhaut', 'schleimhaut'], mageneingang: ['mageneingang', 'eingangI'], pfoertner: ['pfoertner', 'pfoertnerI'], schleimhaut: ['schleimhaut', 'schleimhaut'] };
  [['hinten', tI.neg], ['deckel', tI.pos]].forEach(function (h) {
    var z = zerlegen(h[1], ZONEN_I, 'schleimhaut');
    Object.keys(z).forEach(function (zid) {
      if (!z[zid]) return;
      var d = h[0] === 'deckel', e = INNEN[zid];
      addMesh(e[0], z[zid], MAT[e[1] + (d ? 'D' : '')], STRUCT[e[0]].de + ' (innen' + (d ? ', vorn' : '') + ')', 2, h[0]); tris.innen += anz(z[zid]);
    });
  });
  await setLoad(0.66, 'Schnittflächen'); if (abgebaut) return;
  var kg = kappenGeo(), KS = [['schleimhaut', 'schleimhaut'], ['muskulatur', 'kSchraeg'], ['muskulatur', 'kRing'], ['muskulatur', 'kLaengs'], ['pfoertner', 'kPfoertner'], ['mageneingang', 'kEingang']];
  kg.forEach(function (g, k) {
    if (!g) return;
    addMesh(KS[k][0], g, MAT[KS[k][1]], STRUCT[KS[k][0]].de + ' (Schnittfläche)', 2, 'kappe'); tris.kappen += anz(g);
  });
  await setLoad(0.72, 'Speiseröhre und Zwölffingerdarm'); if (abgebaut) return;
  /* Speiseroehre: die letzten 6,2 cm bis 0,5 cm vor dem Ende des Stumpfs in der Wand (ueberlappt dessen oberes Ende); oben offen */
  var eso = form.kurve(form.BAHN.speiseroehre.pts, 12), el = 0, i;
  for (i = 1; i < eso.length; i++) el += Math.sqrt(Math.pow(eso[i][0] - eso[i - 1][0], 2) + Math.pow(eso[i][1] - eso[i - 1][1], 2) + Math.pow(eso[i][2] - eso[i - 1][2], 2));
  var ep = bogenTeil(eso, el - 6.2, el - 1.5);   /* gezeigter Teil der Speiseroehre */
  var eg = rohre([{ pts: ep, r0: form.BAHN.speiseroehre.r, r1: form.BAHN.speiseroehre.r, seiten: 20, segmente: 40, offen: true }]);
  addMesh('speiseroehre', eg, MAT.speiseroehre, STRUCT.speiseroehre.de, 3); tris.rohre += anz(eg);
  /* Zwoelffingerdarm: ab 1,2 cm hinter dem Pfoertner (ueberlappt die Verlaengerung der Wand) bis zum absteigenden Teil; am Ende offen */
  var dp = bogenTeil(duo.slice(0, 12 * 3 + 7), 1.2, 1e9);
  var dg = rohre([{ pts: dp, r0: 1.03, r1: 1.03, seiten: 24, segmente: 48, offen: true }]);
  addMesh('zwoelffinger', dg, MAT.zwoelffingerRohr, STRUCT.zwoelffinger.de + ' (Rohr)', 3); tris.rohre += anz(dg);
  await setLoad(0.78, 'Gefäße und Nerv'); if (abgebaut) return;
  var G = form.gefaesse(0), ln = function (g) { return { pts: g.pts, r0: g.r0, r1: g.r1 }; };
  [['arterien', G.magenarterien], ['venen', G.magenvenen], ['pfortader', G.pfortader], ['vagus', G.vagus]].forEach(function (a) {
    var geo = rohre(a[1].map(ln));
    addMesh(a[0], geo, MAT[a[0]], STRUCT[a[0]].de, 4); tris.rohre += anz(geo);
  });
  await setLoad(0.84, 'Zwerchfell'); if (abgebaut) return;
  var zf = form.zwerchfell(), zg = zwerchfellGeo(zf);
  addMesh('zwerchfell', zg, MAT.zwerchfell, STRUCT.zwerchfell.de, 5); tris.zwerchfell = anz(zg);
  geoDaten = { E: E, P: P, eso: ep, duo: dp, G: G };
  await setLoad(0.97, 'Beschriftung'); if (abgebaut) return;
  ankerBerechnen();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var openK = 0, openZiel = 0;   /* 1 = Innenansicht (vordere Haelfte weg), 0 = geschlossen; laeuft weich */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt: das Zwerchfell zaehlt nicht, die Wand bei Durchsicht auch nicht */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = !!enabled[o.userData.sid] && (!o.userData.kappe || openK > 0.02); });
  lv++;
}
/* Glas (Durchsicht) der Wand und Ausblenden des Deckels; Material nur neu uebersetzen, wenn sich transparent oder side aendert */
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  var a = 1 - sstep(0.25, 1, openK), s = sstep(0, 1, openK);   /* a: Deckkraft des Deckels, s: Weg */
  deckel.position.set(0, 0, DECKEL_WEG * s);
  deckel.visible = a > 0.004;
  WAND.forEach(function (sid) {
    stelleMat(MAT[sid], seeThrough, seeThrough ? GLAS : 1);
    stelleMat(MAT[sid + 'D'], seeThrough || a < 0.999, (seeThrough ? GLAS : 1) * a);
  });
  ['schleimhaut', 'eingangI', 'pfoertnerI'].forEach(function (k) { stelleMat(MAT[k + 'D'], a < 0.999, a); });
  var kv = openK > 0.02;
  kappen.forEach(function (m) { m.visible = kv && !!enabled[m.userData.sid]; });
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
  s.fakten.forEach(function (f) {
    if (f[0] !== null) { var dt = document.createElement('dt'); dt.textContent = f[0]; dl.appendChild(dt); }
    var dd = document.createElement('dd'); dd.textContent = f[1]; if (f[0] === null) dd.className = 'voll';
    dl.appendChild(dd);
  });
  box.classList.add('show');
}

/* Ebene ein- oder ausschalten (Schalter der Leiste) */
function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility(); applyLook();
}
/* Schleimhaut und Muskulatur sind nur in der Innenansicht oder bei Durchsicht zu sehen: wer sie in der Liste waehlt, bekommt die Innenansicht */
function waehleListe(id) {
  if ((id === 'schleimhaut' || id === 'muskulatur') && !openZiel && !seeThrough) gehe(1);
  setSelected(id);
}

(function leiste() {
  /* Strukturen: nach Gruppen, Farbpunkt blendet die Struktur ein und aus (die Reiter Hilfekarten und Ueben folgen spaeter) */
  var rail = $('rail');
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
      row.addEventListener('click', function () { waehleListe(s.id); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); waehleListe(s.id); }
        if (e.key === ' ') { e.preventDefault(); flip(); }
      });
      wrap.appendChild(row);
    });
    rail.appendChild(wrap);
  });
})();

function legNoteSetzen() { $('legNote').textContent = LEGNOTE[(seeThrough || openZiel) ? 1 : 0]; }
function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  legNoteSetzen();
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
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var K3 = function (x, y, z) { return V(x - M[0], y - M[1], z - M[2]); };   /* Koerper-Koordinaten -> Modell */
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die Beschriftungsspalten freilassen; innen: Innenansicht */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb, innen: false },
  { name: 'Innenansicht', theta: 0, phi: 1.5, target: K3(3, 105.5, 1), ext: [22, 23], halb: 11, innen: true },
  { name: 'Mageneingang', theta: -0.15, phi: 1.45, target: K3(5, 108, 1), ext: [15, 14], halb: 7.5, innen: true },
  { name: 'Pförtner', theta: 0.25, phi: 1.5, target: K3(-1.5, 102.5, 2.5), ext: [18, 13], halb: 9, innen: true }
];
var view = { theta: AUSSCHNITTE[0].theta, phi: AUSSCHNITTE[0].phi, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 4, maxDist: 160 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Magen und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  openZiel = a.innen ? 1 : 0;   /* Innenansicht, Mageneingang und Pfoertner: vordere Haelfte abgehoben */
  legNoteSetzen();
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Zwerchfell, Wand bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
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
   Bei den Bereichen der Wand: Punkt auf der Oberflaeche an der Stelle, an der die Gerade durch den Koerper-Punkt q in Blickrichtung des Ausschnitts auf das Netz trifft;
   sonst Punkte auf den Mittellinien. */
var KAND = [{}, {}, {}, {}], rayA = new THREE.Raycaster();
function ankerBerechnen() {
  root.updateMatrixWorld(true);
  var D = geoDaten, P = function (a) { return K3(a[0], a[1], a[2]); };
  var liste = function (arr) { return arr.filter(Boolean).map(P); };
  var blick = AUSSCHNITTE.map(function (a) { var sp = Math.sin(a.phi); return V(sp * Math.sin(a.theta), Math.cos(a.phi), sp * Math.cos(a.theta)); });   /* Richtung Koerper -> Kamera */
  var oberflaeche = function (i, meshes, qs) {   /* Oberflaechenpunkte (Koerper-Koordinaten) der Meshes zu den Geraden durch qs in Blickrichtung des Ausschnitts i */
    var out = [];
    qs.forEach(function (q) {
      var p = K3(q[0], q[1], q[2]);
      rayA.set(p.clone().addScaledVector(blick[i], 40), blick[i].clone().negate()); rayA.far = 80;
      var hit = rayA.intersectObjects(meshes, false);
      if (hit.length) out.push([hit[0].point.x + M[0], hit[0].point.y + M[1], hit[0].point.z + M[2]]);
    });
    return out;
  };
  var vonSid = function (sid, art) { return STRUCT[sid].meshes.filter(function (m) { return art === 'hinten' ? hinten.indexOf(m) >= 0 : art === 'kappe' ? m.userData.kappe : !m.userData.kappe; }); };
  var bogenPunkt = function (poly, f) { return poly[Math.min(poly.length - 1, Math.round(f * (poly.length - 1)))]; };
  var G = D.G, zw = function (x, z) { return [x, lform.kuppel(x, z), z]; };
  var eso = D.eso;
  var linie = function (l, f) { return bogenPunkt(l.pts, f); };
  var seite = function (p, dz) { return [p[0], p[1], p[2] + dz]; };
  var mitte = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; };
  var nahe = function (poly, p) { var b = poly[0], bd = 1e9; poly.forEach(function (q) { var d = Math.pow(q[0] - p[0], 2) + Math.pow(q[1] - p[1], 2) + Math.pow(q[2] - p[2], 2); if (d < bd) { bd = d; b = q; } }); return b; };
  var Q = [
    /* Uebersicht: geschlossen, von vorn */
    { mageneingang: [[3.9, 107.6, 1], [4.6, 108.4, 1], [3.2, 106.8, 1]], magengrund: [[8.5, 111, 0], [7, 112, 0], [9.5, 110, 0]], magenkoerper: [[10, 105, 0], [11, 103, 0], [9, 101, 0], [8, 106, 0]],
      magenvorhof: [[2, 100.8, 0], [3, 100, 0], [1, 101.8, 0]], pfoertner: [[-1.0, 103.3, 0], [-0.5, 102.5, 0]] },
    /* Innenansicht: Muskulatur und Schleimhaut an der Schnittkante, Pfoertner- und Eingangsring innen */
    {}, {}, {}
  ];
  KAND[0].schleimhaut = liste(oberflaeche(0, STRUCT.schleimhaut.meshes.filter(function (m) { return !m.userData.kappe; }), [[8, 105, 0], [9, 108, 0], [5, 102, 0], [10, 103, 0]]));   /* bei Durchsicht in der Uebersicht */
  var Z = AUSSCHNITTE.map(function (a, i) {
    var o = {
      speiseroehre: [bogenPunkt(eso, 0.55), bogenPunkt(eso, 0.7), bogenPunkt(eso, 0.4), bogenPunkt(eso, 0.8)].map(function (p) { return seite(p, 0); }),
      zwoelffinger: [nahe(D.duo, [-5.4, 104.2, 0.6]), nahe(D.duo, [-6.6, 102, -0.4]), nahe(D.duo, [-4.2, 105, 1.2])].map(function (p) { return seite(p, 0.0); }),
      arterien: [linie(G.magenarterien[4], 0.3), linie(G.magenarterien[3], 0.6), linie(G.magenarterien[2], 0.5), linie(G.magenarterien[1], 0.5), linie(G.magenarterien[0], 0.5)],
      venen: [linie(G.magenvenen[2], 0.5), linie(G.magenvenen[3], 0.5), linie(G.magenvenen[0], 0.4), linie(G.magenvenen[1], 0.4)],
      pfortader: [mitte(G.pfortader[0].pts[1], G.pfortader[0].pts[2]), linie(G.pfortader[0], 1), linie(G.pfortader[1], 0.5), linie(G.pfortader[2], 0.5)],
      vagus: [linie(G.vagus[0], 0.15), linie(G.vagus[0], 0.6), linie(G.vagus[1], 0.3), linie(G.vagus[1], 0.7)],
      zwerchfell: [zw(8, 0), zw(4, 3), zw(10, -2), zw(0, 3), zw(6, -3)]
    };
    if (i > 0) {   /* hinter der abgehobenen Haelfte: Eingang, Pfoertner und Schleimhaut innen */
      o.mageneingang = [seite(D.E, 0.2)];
      o.pfoertner = [seite(D.P, -0.3), [D.P[0] + 0.7, D.P[1] - 1.2, D.P[2] - 0.4]];
    }
    return o;
  });
  AUSSCHNITTE.forEach(function (a, i) {
    Object.keys(Z[i]).forEach(function (id) { KAND[i][id] = liste(Z[i][id]); });
    var q = Q[i];
    Object.keys(q).forEach(function (id) { KAND[i][id] = liste(oberflaeche(i, vonSid(id), q[id])); });
  });
  /* Innenansicht: Schleimhaut (Falten hinten) und Muskulatur (Schnittkante) aus den Netzen der hinteren Haelfte bzw. der Kappen */
  var punktAus = function (meshes, zielP) {   /* Eckpunkt der Netze, der dem Zielpunkt (Koerper) am naechsten liegt */
    var b = null, bd = 1e30;
    meshes.forEach(function (m) {
      var p = m.geometry.attributes.position.array;
      for (var k = 0; k < p.length; k += 3) {
        var d = Math.pow(p[k] - zielP[0], 2) + Math.pow(p[k + 1] - zielP[1], 2) + Math.pow(p[k + 2] - zielP[2], 2);
        if (d < bd) { bd = d; b = [p[k], p[k + 1], p[k + 2]]; }
      }
    });
    return b;
  };
  var kapMus = STRUCT.muskulatur.meshes;
  var rueck = STRUCT.schleimhaut.meshes.filter(function (m) { return hinten.indexOf(m) >= 0; });
  var mm = [[10.5, 103, 0], [11.5, 106, 0], [6, 98.8, 0]], ss = [[8, 105, -1], [9, 108, -2], [5, 102, 0]];
  [1, 2, 3].forEach(function (i) {
    var ziele = i === 3 ? [[0, 100, 0], [3, 100.6, 2]] : mm;
    KAND[i].muskulatur = liste(ziele.map(function (t) { return punktAus(kapMus, t); }));
    KAND[i].schleimhaut = liste((i === 3 ? [[1.5, 101.3, -1.2], [4, 101, -1]] : ss).map(function (t) { return punktAus(rueck, t); }));
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
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, openK > 0.999 ? 1 : 0].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || openK !== openZiel || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  beschriftet().forEach(function (id) {
    if (!enabled[id]) return;
    var c = KAND[aktiv][id] || [], i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { zwerchfell: 'Zwerchfell' };   /* kuerzere Namen, damit die Beschriftung in die Spalte passt */
var HANDYNAME = { magenkoerper: 'Magenkörper', schleimhaut: 'Schleimhaut', muskulatur: 'Muskulatur', arterien: 'Magenarterien', zwoelffinger: 'Zwölffinger-darm' };
var HANDY_GROSS = ['magengrund', 'magenkoerper', 'magenvorhof', 'pfoertner', 'mageneingang', 'speiseroehre', 'zwoelffinger'];   /* Handy, Uebersicht: nur diese werden beschriftet */
/* je Ausschnitt: Strukturen in der Beschriftung (was in der Ansicht nicht zu sehen ist, steht nicht darin) */
var LISTEN = [
  ['magengrund', 'magenkoerper', 'magenvorhof', 'pfoertner', 'mageneingang', 'speiseroehre', 'zwoelffinger', 'arterien', 'venen', 'pfortader', 'vagus', 'zwerchfell'],
  ['schleimhaut', 'muskulatur', 'pfoertner', 'mageneingang', 'speiseroehre', 'zwoelffinger', 'arterien', 'venen', 'pfortader', 'vagus', 'zwerchfell'],
  ['mageneingang', 'schleimhaut', 'muskulatur', 'speiseroehre', 'vagus', 'arterien', 'venen', 'zwerchfell'],
  ['pfoertner', 'schleimhaut', 'muskulatur', 'zwoelffinger', 'arterien', 'venen', 'pfortader']
];
/* Strukturen der Beschriftung in der aktuellen Ansicht: in der Uebersicht kommt bei Durchsicht die Schleimhaut dazu (sie ist dann durch die Wand zu sehen) */
function beschriftet() { return aktiv === 0 && seeThrough ? LISTEN[0].concat(['schleimhaut']) : LISTEN[aktiv]; }
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
  if (showLabels && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt den Magen, ohne Beschriftung bleibt sie frei */
    beschriftet().forEach(function (id) {
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
var t0 = performance.now(), last = t0;
var App = window.MagenApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris, offen: function () { return openK; } };
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (openK !== openZiel) {   /* Deckel gleitet weich (ca. 600 ms) */
    openK = Math.max(0, Math.min(1, openK + Math.sign(openZiel - openK) * dt / 0.6));
    applyLook(); lv++;
  }
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  renderer.render(scene, camera);
  sichtPruefen(now, window.innerWidth, window.innerHeight);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
var kamAlt = { near: camera.near, far: camera.far };
organ.abbauen = function () {
  abgebaut = true;
  canvas.style.pointerEvents = '';
  orbit.loesen();
  wzEnde();
  canvas.removeEventListener('click', canvasKlick);
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  camera.clearViewOffset();
  camera.near = kamAlt.near; camera.far = kamAlt.far; camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  delete window.MagenApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  applyLook();
  setSelected(selected);
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('magen', organ);
})();
