/* =====================================================================
   Niere - Rinde, Mark und Nierenbecken
   Die linke Niere als Frontalschnitt wie im Lehrbuch (ca. 11 cm): Die vordere
   Haelfte ("Deckel") laesst sich abheben (aufgeschnitten) oder aufsetzen
   (geschlossen). Die Form liefert organe/niere/niere-form.js (Kern.Formen.niere);
   hier wird sie vernetzt, eingefaerbt und bedient.
   Einheit cm; Achsen anatomisch wie im Koerper (x + links, y oben, z vorn),
   Mitte der Niere im Ursprung.
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name,
   Gruppe der Leiste, Farbpunkt (col, bei Arterie und Vene gemeinsamer Struktur
   zusaetzlich col2), Text und Fakten der Infokarte.
   ===================================================================== */
var STRUKTUREN = [
  { id: 'kapsel', de: 'Nierenkapsel', lat: 'Capsula fibrosa', grp: 'Nierengewebe', col: 0x9C4A3A,
    txt: 'Dünne, feste Bindegewebshülle, die die Niere eng umschließt. Sie schützt das Nierengewebe und lässt sich kaum dehnen: Schwillt die Niere an, etwa bei einer Entzündung oder einem Harnstau, spannt sich die Kapsel – das verursacht den typischen Flankenschmerz. Außen liegt die Fettkapsel, die hier nicht dargestellt ist.',
    facts: { 'Aufbau': 'straffes Bindegewebe', 'Spannt sich': 'Flankenschmerz', 'Außen davon': 'Fettkapsel (nicht dargestellt)' } },
  { id: 'rinde', de: 'Nierenrinde', lat: 'Cortex renalis', grp: 'Nierengewebe', col: 0xC27A62,
    txt: 'Die äußere, etwa 1 cm dicke Schicht unter der Kapsel. Hier liegen die Nierenkörperchen mit den Glomeruli und die gewundenen Abschnitte der Tubuli: In der Rinde wird das Blut gefiltert und der größte Teil des Primärharns zurückgeholt. Sie ist sehr gut durchblutet und wirkt deshalb körnig und rotbraun.',
    facts: { 'Dicke': 'ca. 1 cm', 'Enthält': 'Nierenkörperchen, gewundene Tubuli', 'Aufgabe': 'Filtration und Rückresorption' } },
  { id: 'saeulen', de: 'Nierensäulen', lat: 'Columnae renales', grp: 'Nierengewebe', col: 0xB47058,
    txt: 'Rindengewebe, das zwischen den Markpyramiden bis zum Nierensinus hinunterreicht. In den Nierensäulen verlaufen die Zwischenlappengefäße zur Rinde hinauf und wieder zurück.',
    facts: { 'Gewebe': 'wie die Rinde', 'Lage': 'zwischen den Pyramiden', 'Enthalten': 'Zwischenlappengefäße' } },
  { id: 'pyramiden', de: 'Nierenpyramiden (Mark)', lat: 'Pyramides renales', grp: 'Nierengewebe', col: 0x8E3B33,
    txt: 'Das Nierenmark besteht aus etwa 8 bis 18 kegelförmigen Pyramiden; ihre breite Basis liegt an der Rinde, die Spitze zeigt zum Nierenbecken. Die feine Streifung entsteht durch Henle-Schleifen, Sammelrohre und Vasa recta, die alle zur Spitze ziehen. Hier wird der Harn konzentriert: Das Gewebe wird zur Spitze hin immer salziger.',
    facts: { 'Anzahl': 'ca. 8–18 je Niere', 'Enthält': 'Henle-Schleifen, Sammelrohre, Vasa recta', 'Aufgabe': 'Harnkonzentrierung' } },
  { id: 'papillen', de: 'Nierenpapillen', lat: 'Papillae renales', grp: 'Nierengewebe', col: 0xB0584A,
    txt: 'Die Spitze jeder Pyramide ragt als Papille in einen kleinen Nierenkelch. Auf ihr münden die Sammelrohre mit vielen feinen Öffnungen: Hier tropft der fertige Harn ins Hohlsystem. Ab hier wird er nicht mehr verändert, nur noch abgeleitet.',
    facts: { 'Mündungen': 'Sammelrohre', 'Ab hier': 'Harn wird nur noch abgeleitet', 'Gefährdet durch': 'Schmerzmittel-Missbrauch (Papillennekrose)' } },
  { id: 'kelcheKlein', de: 'Kleine Nierenkelche', lat: 'Calices renales minores', grp: 'Harnableitung', col: 0xEAD27A,
    txt: 'Becherförmige Teile des Hohlsystems, die je eine Papille umfassen und den abtropfenden Harn auffangen. Mehrere kleine Kelche vereinigen sich zu einem großen Kelch. Glatte Muskulatur in ihrer Wand schiebt den Harn weiter.',
    facts: { 'Anzahl': 'ca. 8–10', 'Fängt auf': 'Harn einer Papille', 'Wand': 'glatte Muskulatur, Urothel' } },
  { id: 'kelcheGross', de: 'Große Nierenkelche', lat: 'Calices renales majores', grp: 'Harnableitung', col: 0xDCC060,
    txt: 'Meist zwei bis drei kurze Röhren (oberer, mittlerer, unterer Kelch), in die die kleinen Kelche münden. Sie leiten den Harn ins Nierenbecken. In den Kelchen können sich Nierensteine bilden und festsetzen.',
    facts: { 'Anzahl': 'meist 2–3', 'Leiten': 'Harn ins Nierenbecken', 'Ort von': 'Kelchsteinen' } },
  { id: 'becken', de: 'Nierenbecken', lat: 'Pelvis renalis', grp: 'Harnableitung', col: 0xD9B44A,
    txt: 'Trichterförmiger Sammelraum im Nierensinus, in dem sich der Harn aus den Kelchen vereinigt. Am Nierenhilus geht das Nierenbecken in den Harnleiter über. Wellenförmige Kontraktionen seiner Wand treiben den Harn in Portionen weiter. Eine Entzündung von Nierenbecken und Nierengewebe heißt Pyelonephritis.',
    facts: { 'Fassungsvermögen': 'ca. 5–10 ml', 'Übergang': 'Harnleiter am Hilus', 'Entzündung': 'Pyelonephritis' } },
  { id: 'harnleiter', de: 'Harnleiter', lat: 'Ureter', grp: 'Harnableitung', col: 0xC9A43A,
    txt: 'Muskelschlauch von 25–30 cm Länge, der den Harn vom Nierenbecken zur Harnblase bringt; hier ist nur sein Anfang dargestellt. Peristaltische Wellen schieben den Harn in kleinen Portionen weiter. Der Abgang aus dem Nierenbecken ist die erste von drei Engstellen, an denen Nierensteine hängen bleiben können.',
    facts: { 'Länge': '25–30 cm', 'Transport': 'Peristaltik, 1–5 Wellen pro Minute', 'Erste Engstelle': 'Abgang aus dem Nierenbecken' } },
  { id: 'arterie', de: 'Nierenarterie', lat: 'Arteria renalis', grp: 'Gefäße', col: 0xC8372D,
    txt: 'Entspringt direkt aus der Bauchaorta und bringt sauerstoffreiches Blut unter hohem Druck zur Niere. Schon im Nierensinus teilt sie sich in Segmentarterien. Beide Nieren erhalten zusammen etwa ein Fünftel des Herzzeitvolumens – rund 1,2 Liter Blut pro Minute.',
    facts: { 'Ursprung': 'Bauchaorta', 'Durchblutung': 'ca. 1,2 l/min (20–25 % des Herzzeitvolumens)', 'Teilt sich in': 'Segmentarterien' } },
  { id: 'vene', de: 'Nierenvene', lat: 'Vena renalis', grp: 'Gefäße', col: 0x3F63B5,
    txt: 'Führt das gefilterte Blut zur unteren Hohlvene. Am Hilus liegt sie vorn, dahinter die Arterie und ganz hinten das Nierenbecken. Die linke Nierenvene ist länger und kreuzt vor der Aorta auf die rechte Seite.',
    facts: { 'Mündet in': 'untere Hohlvene', 'Am Hilus': 'vorn Vene, dann Arterie, hinten Becken', 'Links': 'länger, kreuzt vor der Aorta' } },
  { id: 'interlobaer', de: 'Zwischenlappengefäße', lat: 'Arteriae et venae interlobares', grp: 'Gefäße', col: 0xC8372D, col2: 0x3F63B5,
    txt: 'Die Äste der Segmentarterien steigen in den Nierensäulen zwischen den Pyramiden zur Rinde hinauf; gleichnamige Venen begleiten sie zurück. Die Arterien der Niere sind Endarterien: Verschließt sich eine, stirbt das von ihr versorgte Gewebe ab (Niereninfarkt).',
    facts: { 'Verlauf': 'in den Nierensäulen', 'Arterien': 'Endarterien', 'Verschluss': 'keilförmiger Niereninfarkt' } },
  { id: 'bogen', de: 'Bogengefäße', lat: 'Arteriae et venae arcuatae', grp: 'Gefäße', col: 0xC8372D, col2: 0x3F63B5,
    txt: 'An der Grenze zwischen Rinde und Mark biegen die Zwischenlappengefäße bogenförmig um und laufen über die Basis der Pyramiden. Von ihnen gehen die feinen Gefäße der Rinde ab.',
    facts: { 'Lage': 'Rinden-Mark-Grenze', 'Verlauf': 'über der Pyramidenbasis', 'Gehen über in': 'Rindengefäße' } },
  { id: 'interlobular', de: 'Rindengefäße', lat: 'Arteriae et venae corticales radiatae', grp: 'Gefäße', col: 0xC8372D, col2: 0x3F63B5,
    txt: 'Feine Gefäße, die strahlenförmig von den Bogengefäßen zur Kapsel ziehen (früher Interlobulargefäße). Aus den Arterien entspringen die zuführenden Arteriolen der Glomeruli – hier beginnt die Filtration im Nephron.',
    facts: { 'Verlauf': 'strahlenförmig zur Kapsel', 'Geben ab': 'zuführende Arteriolen', 'Danach': 'Glomerulus im Nephron' } },
  { id: 'nebenniere', de: 'Nebenniere', lat: 'Glandula suprarenalis', grp: 'Umgebung', col: 0xD8A13E,
    txt: 'Hormondrüse, die der Niere oben aufsitzt, aber eigenständig arbeitet. Ihre Rinde bildet Aldosteron (hält Natrium und Wasser im Körper), Cortisol und Geschlechtshormone, ihr Mark Adrenalin und Noradrenalin. Aldosteron wirkt direkt auf die Niere – im distalen Tubulus und im Sammelrohr.',
    facts: { 'Rinde bildet': 'Aldosteron, Cortisol', 'Mark bildet': 'Adrenalin, Noradrenalin', 'Wirkt auf die Niere': 'Aldosteron (Na⁺ hinein, K⁺ hinaus)' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Niere &middot; Ren</div>
  <h1>Rinde, Mark &amp; <em>Nierenbecken</em></h1>
  <div class="sub">Filtert das Blut, bildet den Harn und leitet ihn ab.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">&Uuml;bersicht</button>
    <button id="cam1" class="gh">Rinde und Mark</button>
    <button id="cam2" class="gh">Nierenbecken</button>
    <button id="cam3" class="gh">Hilus</button>
    <span class="sep"></span>
    <button id="bAR" class="gh" title="Die Niere mit der Kamera in den Raum stellen">AR</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bOffen" class="gh on" title="Die vordere H&auml;lfte ist abgehoben: Blick auf die Schnittfl&auml;che">Aufgeschnitten</button>
    <button id="bZu" class="gh" title="Die vordere H&auml;lfte sitzt wieder auf">Geschlossen</button>
    <span class="sep"></span>
    <button id="bSee" class="gh" title="Nierengewebe durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#E0584C">Rot</b> Arterien &ndash; bringen das Blut zur Niere.<br>
  <b style="color:#6F93E0">Blau</b> Venen &ndash; f&uuml;hren es zur&uuml;ck.<br>
  <b style="color:#E3C75A">Gelb</b> Harnwege &ndash; Kelche, Becken und Harnleiter.</p>
  <p class="note" id="legNote">Schnitt durch die linke Niere von vorn; die vordere H&auml;lfte ist abgehoben.</p>
</div>

<div class="panel" id="exp">
  <span class="tag">Export</span>
  <button id="bGlbS" class="gh">GLB &middot; statisch</button>
  <button id="bStl" class="gh">STL</button>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>

<div id="arUI" aria-live="polite">
  <div class="ar-top"><span class="ar-title">Niere in AR</span><span class="ar-phase" id="arPhase"></span><button class="ar-b" id="arEnd">Beenden</button></div>
  <div class="ar-hint" id="arHint">Bewege das Gerät langsam über den Tisch, bis ein Ring erscheint &ndash; dann tippen, um die Niere hinzustellen.</div>
  <div class="ar-bot">
    <button class="ar-b" id="arOffen">Geschlossen</button>
    <button class="ar-b" id="arLab">Beschriftung aus</button>
    <button class="ar-b" id="arSmall">Kleiner</button>
    <button class="ar-b" id="arBig">Gr&ouml;&szlig;er</button>
    <button class="ar-b" id="arPlace">Neu hinstellen</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
var organ = { renderer: {}, aufbauen: aufbauen };
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = Kern.Formen && Kern.Formen.niere;
if (!form) throw new Error('Die Form der Niere ist nicht geladen.');
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var PI = Math.PI, DEG = PI / 180;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };
var sstep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* =====================================================================
   1. Strukturen, Materialien
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var GEWEBE = ['kapsel', 'rinde', 'saeulen', 'pyramiden', 'papillen'];   /* Strukturen des Nierengewebes (geschnitten, mit Deckel) */
var GLAS = 0.22;                                                         /* Deckkraft des Gewebes bei "Durchsicht" */
var ROT = 0xC8372D, BLAU = 0x3F63B5;
/* Gewebe: Kapsel einfarbig, Rinde, Saeulen, Pyramiden und Papillen ueber Vertexfarben (Grundfarbe in BASIS) */
var MATOPT = {
  kapsel: [0x9C4A3A, { rough: 0.5, coat: 0.45 }],
  rinde: [0xffffff, { rough: 0.62, coat: 0.12, vc: true }],
  saeulen: [0xffffff, { rough: 0.62, coat: 0.12, vc: true }],
  pyramiden: [0xffffff, { rough: 0.5, coat: 0.22, vc: true }],
  papillen: [0xffffff, { rough: 0.45, coat: 0.3, vc: true }]
};
var BASIS = { rinde: srgb(0xC27A62), saeulen: srgb(0xB47058), pyramiden: srgb(0x8E3B33), papillen: srgb(0xB0584A) };
var MAT = {};
GEWEBE.forEach(function (sid) {
  MAT[sid] = mat(MATOPT[sid][0], MATOPT[sid][1]);       /* hintere Haelfte */
  MAT[sid + 'D'] = mat(MATOPT[sid][0], MATOPT[sid][1]); /* Deckel (eigenes Material, blendet aus) */
});
/* Hohlsystem: gelb, leicht durchscheinend, glaenzend (Deckkraft 0.6, depthWrite aus) */
var HOHL = { rough: 0.25, coat: 0.6, opacity: 0.6, env: 0.5 };
MAT.kelcheKlein = mat(0xEAD27A, HOHL);
MAT.kelcheGross = mat(0xDCC060, HOHL);
MAT.becken = mat(0xD9B44A, HOHL);
MAT.harnleiter = mat(0xC9A43A, HOHL);
/* Gefaesse: Arterien rot, Venen blau; je Stufe ein Material je Art (gleiche Struktur-ID) */
['arterie', 'vene', 'interlobaer', 'bogen', 'interlobular'].forEach(function (sid) {
  MAT[sid + 'A'] = mat(ROT, { rough: 0.4, coat: 0.3 });
  MAT[sid + 'V'] = mat(BLAU, { rough: 0.4, coat: 0.3 });
});
MAT.nebenniere = mat(0xD8A13E, { rough: 0.55, coat: 0.2 });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

var root = new THREE.Group(); root.name = 'Niere'; scene.add(root);
var deckel = new THREE.Group(); deckel.name = 'Deckel'; root.add(deckel);   /* vordere Haelfte */
function addMesh(parent, sid, geo, material, name, order) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.userData.sid = sid; m.renderOrder = order;
  parent.add(m); STRUCT[sid].meshes.push(m);
  return m;
}

/* =====================================================================
   2. Geometrie: Gewebe in zwei Haelften, Hohlsystem, Nebenniere, Gefaesse
   Vernetzt wird in LOKALEN Achsen (Schnittebene z = 0, Gitter parallel dazu); die fertigen
   Netze werden nach anatomischen Achsen gedreht (Modell und Kamera arbeiten anatomisch).
   ===================================================================== */
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var H = klein ? 0.1 : 0.07;                       /* Gitterweite des Gewebes (cm) */
var HH = klein ? 0.06 : 0.045;                    /* Gitterweite des Hohlsystems (cm) */
var GR = form.grenzenLokal;
var N = form.SCHNITT_N;                           /* Normale der Schnittebene (anatomisch), Deckel auf der Seite n * p > 0 */
var EX = form.anatomisch([1, 0, 0]), EY = form.anatomisch([0, 1, 0]), EZ = form.anatomisch([0, 0, 1]);
function anat(x, y, z, o, k) {   /* lokal -> anatomisch, schreibt o[k..k+2] */
  o[k] = x * EX[0] + y * EY[0] + z * EZ[0]; o[k + 1] = x * EX[1] + y * EY[1] + z * EZ[1]; o[k + 2] = x * EX[2] + y * EY[2] + z * EZ[2];
}
var PY = form.PYR;

/* Zufall aus der Lage (fest, kein Math.random): 0..1 */
function rausch(x, y, z) { var s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
/* Streifen der Markpyramide i: Helligkeit -1..1 nach dem Strahl aus der Papille (die Streifen laufen auf die Spitze zu);
   die feinen Streifen verschwinden, wo ihr Abstand kleiner wird als die Gitterweite */
function streifen(i, x, y, z) {
  var P = PY[i], d0 = x - P.apex[0], d1 = y - P.apex[1];
  var laengs = d0 * P.u[0] + d1 * P.u[1], quer = -d0 * P.u[1] + d1 * P.u[0], a = Math.max(laengs, 0.35);
  var q = (quer + 1.7 * z) / a, ph = i * 1.9;
  var grob = 2 * PI * P.lang / 0.62, fein = 2 * PI * P.lang / 0.27;
  var ag = Math.max(0, Math.min(1, (0.62 * a / P.lang - 1.4 * H) / (1.6 * H)));
  var af = Math.max(0, Math.min(1, (0.27 * a / P.lang - 1.4 * H) / (1.6 * H)));
  var sg = 0.62 * Math.sin(grob * q + ph) + 0.38 * Math.sin(grob * 2.7 * q + ph * 2.3);
  var sf = Math.sin(fein * q + ph * 0.7);
  return 0.65 * ag * sg + 0.35 * af * sf;
}
/* Pyramide mit dem kleinsten Abstand zu einem Punkt (lokale Achsen) */
function naechstePyramide(x, y, z) {
  var a = form.aussenLokal(x, y, z), k = 0, dm = 1e9;
  for (var i = 0; i < PY.length; i++) { var d = form.pyramide(i, x, y, z, a); if (d < dm) { dm = d; k = i; } }
  return k;
}
/* Vertexfarbe (linear) fuer Struktur sid an der lokalen Lage; null = einfarbig (Materialfarbe). Die Schwankung (Pyramiden
   +-8 %, Rinde und Saeulen +-4 %) gilt fuer die Helligkeit im Auge (sRGB), daher der Exponent 2.2 fuer den linearen Faktor. */
function vertexFarbe(sid, x, y, z) {
  var b = BASIS[sid];
  if (!b) return null;
  var f;
  if (sid === 'pyramiden' || sid === 'papillen') f = 1 + 0.08 * streifen(naechstePyramide(x, y, z), x, y, z) + 0.015 * (rausch(x, y, z) - 0.5) * 2;
  else f = 1 + 0.04 * (rausch(x, y, z) - 0.5) * 2;   /* Rinde und Saeulen: koernig */
  f = Math.pow(f, 2.2);
  return [b.r * f, b.g * f, b.b * f];
}

/* Eckpunkte nahe der Schnittebene (Gitternetz einer Haelfte) auf die Ebene ziehen, damit die Schnittflaeche genau eben ist; die
   Eckpunkte am Rand der Schnittflaeche (Kante zur Aussenflaeche, zum Sinus) zusaetzlich auf die Gewebegrenze in der Ebene: Surface
   Nets mittelt dort und laesst die Kante zackig. Die angrenzende Wand steht senkrecht zur Ebene, dabei aendert sich ihre Form kaum. */
function ebeneAnpassen(netz) {
  var pos = netz.positions, n = pos.length / 3, e = 0.01;
  for (var v = 0; v < n; v++) {
    if (Math.abs(pos[v * 3 + 2]) >= 0.5 * H) continue;
    var x = pos[v * 3], y = pos[v * 3 + 1], f = form.parenchym(x, y, 0);
    pos[v * 3 + 2] = 0;
    if (Math.abs(f) > 0.6 * H) continue;
    for (var it = 0; it < 3; it++) {
      var gx = (form.parenchym(x + e, y, 0) - form.parenchym(x - e, y, 0)) / (2 * e), gy = (form.parenchym(x, y + e, 0) - form.parenchym(x, y - e, 0)) / (2 * e), g2 = gx * gx + gy * gy;
      if (g2 < 1e-6) break;
      x -= f * gx / g2; y -= f * gy / g2;
      f = form.parenchym(x, y, 0);
    }
    pos[v * 3] = x; pos[v * 3 + 1] = y;
  }
}
/* Netz (lokale Achsen) in Geometrien je Struktur zerlegen (nach anatomischen Achsen gedreht).
   klasse(mx, my, mz, nx, ny, nz) liefert die Struktur eines Dreiecks (Mittelpunkt, Flaechennormale). Mit ebenN (Normale der
   Schnittflaeche, anatomisch) und etikett(x, y) (Struktur eines Punktes der Schnittebene) werden die Dreiecke auf der
   Schnittflaeche entlang der Strukturgrenzen geteilt (Grenzen genauer als die Gitterweite). Die Schnittflaeche bekommt eigene
   Eckpunkte mit der Normale ebenN (scharfe Kante zur Aussenflaeche, flach schattiert), die uebrige Flaeche glatte Normalen
   ueber die Strukturgrenzen hinweg. */
function zerlegen(netz, klasse, ebenN, etikett) {
  var pos = netz.positions, idx = netz.index, nV = pos.length / 3, nT = idx.length / 3, t, k;
  var vn = new Float32Array(nV * 3), ta = [], tb = [], tc = [], ts = [], te = [];   /* Dreiecke: Eckpunkte, Struktur, eben */
  var extra = [], kanten = {}, vl = etikett ? new Array(nV) : null;

  function vlab(v) { var q = vl[v]; if (q === undefined) q = vl[v] = etikett(pos[v * 3], pos[v * 3 + 1]); return q; }
  function lage(v, c) { return v < nV ? pos[v * 3 + c] : extra[(v - nV) * 3 + c]; }
  /* neuer Eckpunkt dort, wo sich das Etikett auf der Kante i-j (Etikette li bei i, lj bei j) aendert; je Kante nur einmal */
  function kreuz(i, j, li) {
    if (i > j) { var q = i; i = j; j = q; li = vlab(i); }
    var kk = i + '_' + j, e = kanten[kk];
    if (e !== undefined) return e;
    var x0 = pos[i * 3], y0 = pos[i * 3 + 1], z0 = pos[i * 3 + 2], dx = pos[j * 3] - x0, dy = pos[j * 3 + 1] - y0, dz = pos[j * 3 + 2] - z0, lo = 0, hi = 1;
    for (var n = 0; n < 8; n++) { var m = (lo + hi) / 2; if (etikett(x0 + dx * m, y0 + dy * m) === li) lo = m; else hi = m; }
    var f = (lo + hi) / 2;
    extra.push(x0 + dx * f, y0 + dy * f, z0 + dz * f);
    return (kanten[kk] = nV + extra.length / 3 - 1);
  }
  function dreieck(a, b, c, sid) { ta.push(a); tb.push(b); tc.push(c); ts.push(sid); te.push(1); }
  for (t = 0; t < nT; t++) {
    var ia = idx[t * 3], ib = idx[t * 3 + 1], ic = idx[t * 3 + 2], a = ia * 3, b = ib * 3, c = ic * 3;
    var ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    var wx = pos[c] - pos[a], wy = pos[c + 1] - pos[a + 1], wz = pos[c + 2] - pos[a + 2];
    var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    var mx = (pos[a] + pos[b] + pos[c]) / 3, my = (pos[a + 1] + pos[b + 1] + pos[c + 1]) / 3, mz = (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3;
    if (!(ebenN && pos[a + 2] === 0 && pos[b + 2] === 0 && pos[c + 2] === 0)) {   /* nicht auf der Schnittflaeche */
      ta.push(ia); tb.push(ib); tc.push(ic); ts.push(klasse(mx, my, mz, nx / l, ny / l, nz / l)); te.push(0);
      var ids = [a, b, c];
      for (k = 0; k < 3; k++) { vn[ids[k]] += nx; vn[ids[k] + 1] += ny; vn[ids[k] + 2] += nz; }
      continue;
    }
    var la = vlab(ia), lb = vlab(ib), lc = vlab(ic);
    if (la === lb && lb === lc) dreieck(ia, ib, ic, la);
    else if (la !== lb && lb !== lc && la !== lc) dreieck(ia, ib, ic, etikett(mx, my));   /* drei Strukturen: nach dem Mittelpunkt */
    else {   /* zwei Strukturen: der einzelne Eckpunkt o, daneben u und w (zyklisch gedreht, gleiche Windung) */
      var o, u, w;
      if (lb === lc) { o = ia; u = ib; w = ic; } else if (lc === la) { o = ib; u = ic; w = ia; } else { o = ic; u = ia; w = ib; }
      var p = kreuz(o, u, vlab(o)), q = kreuz(o, w, vlab(o));
      dreieck(o, p, q, vlab(o)); dreieck(p, u, w, vlab(u)); dreieck(p, w, q, vlab(u));
    }
  }
  var nE = extra.length / 3, R = {}, o3 = [0, 0, 0], nt = ta.length;
  for (t = 0; t < nt; t++) {
    var sid = ts[t], r = R[sid], vs = [ta[t], tb[t], tc[t]];
    if (!r) r = R[sid] = { map: new Int32Array((nV + nE) * 2).fill(-1), pos: [], nor: [], col: [], idx: [] };
    for (k = 0; k < 3; k++) {
      var vi = vs[k], key = vi * 2 + te[t], nv = r.map[key];
      if (nv < 0) {
        nv = r.map[key] = r.pos.length / 3;
        var x = lage(vi, 0), y = lage(vi, 1), z = lage(vi, 2);
        anat(x, y, z, o3, 0); r.pos.push(o3[0], o3[1], o3[2]);
        if (te[t]) r.nor.push(ebenN[0], ebenN[1], ebenN[2]);
        else {
          var qx = vn[vi * 3], qy = vn[vi * 3 + 1], qz = vn[vi * 3 + 2], ql = Math.sqrt(qx * qx + qy * qy + qz * qz) || 1;
          anat(qx / ql, qy / ql, qz / ql, o3, 0); r.nor.push(o3[0], o3[1], o3[2]);
        }
        var f = vertexFarbe(sid, x, y, z);
        if (f) r.col.push(f[0], f[1], f[2]);
      }
      r.idx.push(nv);
    }
  }
  var out = {};
  Object.keys(R).forEach(function (sid) {
    var r = R[sid], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(r.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(r.nor, 3));
    if (r.col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(r.col, 3));
    g.setIndex(r.idx);
    out[sid] = g;
  });
  return out;
}

/* Struktur eines Punktes der Schnittflaeche (lokale Achsen, z = 0); ausserhalb und im Sinus: das Gewebe daneben */
function schnittEtikett(x, y) {
  var r = form.region(x, y, 0);
  if (r === 'leer') return 'kapsel';
  if (r === 'sinus') {
    var e = 0.02, gx = form.parenchym(x + e, y, 0) - form.parenchym(x - e, y, 0), gy = form.parenchym(x, y + e, 0) - form.parenchym(x, y - e, 0), gl = Math.sqrt(gx * gx + gy * gy) || 1;
    r = form.region(x - gx / gl * 0.04, y - gy / gl * 0.04, 0);
    return r === 'leer' || r === 'sinus' ? 'saeulen' : r;
  }
  return r;
}
/* Struktur eines Dreiecks des Nierengewebes ausserhalb der Schnittflaeche */
function gewebeKlasse(mx, my, mz, nx, ny, nz) {
  if (form.aussenLokal(mx, my, mz) > -0.6 * H) return 'kapsel';
  var r = form.region(mx - nx * 0.06, my - ny * 0.06, mz - nz * 0.06);   /* Sinuswand: ins Gewebe schieben */
  return r === 'leer' || r === 'sinus' ? 'saeulen' : r;
}
/* Struktur eines Dreiecks des Hohlsystems: Teilform mit dem kleinsten Abstand */
function hohlKlasse(mx, my, mz) {
  var best = form.becken(mx, my, mz), id = 'becken', d = form.harnleiter(mx, my, mz), i;
  if (d < best) { best = d; id = 'harnleiter'; }
  d = form.kelchGross(mx, my, mz); if (d < best) { best = d; id = 'kelcheGross'; }
  for (i = 0; i < PY.length; i++) {
    var kb = PY[i].kb, ex = mx - kb[0], ey = my - kb[1];
    if (Math.sqrt(ex * ex + ey * ey + mz * mz) - kb[2] >= best) continue;   /* Kugel um den kleinen Kelch ist untere Schranke: weiter weg als der beste, nicht auswerten */
    d = form.kelchKlein(i, mx, my, mz); if (d < best) { best = d; id = 'kelcheKlein'; }
  }
  return id;
}

/* Radiusfaktor an der Stelle t (0..1) einer Linie aus den Stuetzstellen rt = [[t, faktor], ...], dazwischen weich (smoothstep) */
function radiusFaktor(rt, t) {
  if (t <= rt[0][0]) return rt[0][1];
  for (var k = 1; k < rt.length; k++) if (t <= rt[k][0]) return rt[k - 1][1] + (rt[k][1] - rt[k - 1][1]) * sstep(rt[k - 1][0], rt[k][0], t);
  return rt[rt.length - 1][1];
}
/* Rohre entlang der Gefaesslinien (anatomisch), je Gruppe zu einer Geometrie zusammengefasst; Enden mit Kappe */
function rohre(linien) {
  var pos = [], nor = [], idx = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rad = l.r > 0.2 ? 12 : l.r > 0.09 ? 8 : l.r > 0.04 ? 6 : 5, tub = Math.max(6, l.pts.length * 4);
    var g = new THREE.TubeGeometry(kurve, tub, l.r, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    if (l.rt) {   /* veraenderlicher Radius: jeden Ring um seine Mitte auf r * Faktor(t) skalieren (Faktor weich zwischen den Stuetzstellen) */
      for (i = 0; i <= tub; i++) {
        var f = radiusFaktor(l.rt, i / tub), c0 = kurve.getPointAt(i / tub);
        for (j = 0; j <= rad; j++) { var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f); }
      }
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

/* Aufbau: Gewebe -> Hohlsystem -> Nebenniere -> Gefaesse (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
var tris = { gewebe: 0, hohl: 0, gefaesse: 0, nebenniere: 0 };
async function bauen() {
  await setLoad(0.02, 'Nierengewebe wird geformt'); if (abgebaut) return;
  /* Gewebe: ein Feld, daraus zwei Haelften (hinten: max(Gewebe, z), vorn: max(Gewebe, -z); die Schnittebene liegt auf z = 0) */
  /* Gitter symmetrisch zur Schnittebene, die Ebene liegt mitten zwischen zwei Gitterebenen (liegt sie genau auf einer, sind die
     Werte dort zufaellig +-0 und die Kante der Schnittflaeche wird unregelmaessig) */
  var gb = [GR.gewebe[0].slice(), GR.gewebe[1].slice()];
  gb[1][2] = (Math.ceil(gb[1][2] / H) + 0.5) * H; gb[0][2] = -gb[1][2];
  var G = S.makeGrid(gb, H);
  var T = await S.evalFeld(G, form.parenchym, function (f) { return setLoad(0.03 + f * 0.33); });
  if (abgebaut) return;
  var hinten = new Float32Array(T.length), vorn = new Float32Array(T.length), i, j, k;
  for (k = 0; k < G.nz; k++) {
    var z = G.o[2] + k * G.h;
    for (j = 0; j < G.ny; j++) for (i = 0; i < G.nx; i++) {
      var q = i + G.nx * (j + G.ny * k), t = T[q];
      hinten[q] = t > z ? t : z; vorn[q] = t > -z ? t : -z;
    }
  }
  T = null;
  await setLoad(0.38, 'Nierengewebe: hintere Hälfte'); if (abgebaut) return;
  var n1 = S.surfaceNets(G, hinten); ebeneAnpassen(n1);
  var h1 = zerlegen(n1, gewebeKlasse, [N[0], N[1], N[2]], schnittEtikett);
  await setLoad(0.48, 'Nierengewebe: vordere Hälfte'); if (abgebaut) return;
  var n2 = S.surfaceNets(G, vorn); ebeneAnpassen(n2);
  var h2 = zerlegen(n2, gewebeKlasse, [-N[0], -N[1], -N[2]], schnittEtikett);
  GEWEBE.forEach(function (sid) {
    if (h1[sid]) { addMesh(root, sid, h1[sid], MAT[sid], STRUCT[sid].de, 1); tris.gewebe += h1[sid].index.count / 3; }
    if (h2[sid]) { addMesh(deckel, sid, h2[sid], MAT[sid + 'D'], STRUCT[sid].de + ' (Deckel)', 1); tris.gewebe += h2[sid].index.count / 3; }
  });
  await setLoad(0.58, 'Nierenkelche und Nierenbecken'); if (abgebaut) return;
  /* Hohlsystem: ganz, nicht geschnitten */
  var G2 = S.makeGrid(GR.hohl, HH);   /* eigenes, feineres Gitter: das Hohlsystem ist klein, Becher, Haelse und Becken sollen glatt sein */
  var T2 = await S.evalFeld(G2, form.hohlsystem);   /* dauert nur Sekundenbruchteile: ohne Zwischenstand (jeder braeche den Aufbau fuer ein Bild ab) */
  if (abgebaut) return;
  var hg = zerlegen(S.surfaceNets(G2, T2), hohlKlasse, null);
  ['kelcheKlein', 'kelcheGross', 'becken', 'harnleiter'].forEach(function (sid) {
    if (hg[sid]) { addMesh(root, sid, hg[sid], MAT[sid], STRUCT[sid].de, 3); tris.hohl += hg[sid].index.count / 3; }
  });
  await setLoad(0.84, 'Nebenniere'); if (abgebaut) return;
  var G3 = S.makeGrid(GR.nebenniere, H);
  var T3 = await S.evalFeld(G3, form.nebenniere);
  if (abgebaut) return;
  var nb = zerlegen(S.surfaceNets(G3, T3), function () { return 'nebenniere'; }, null);
  addMesh(root, 'nebenniere', nb.nebenniere, MAT.nebenniere, STRUCT.nebenniere.de, 0); tris.nebenniere = nb.nebenniere.index.count / 3;
  await setLoad(0.9, 'Gefäße'); if (abgebaut) return;
  var L = form.gefaesseAnatomisch();
  ['arterie', 'vene', 'interlobaer', 'bogen', 'interlobular'].forEach(function (sid) {
    [['A', 'arterie'], ['V', 'vene']].forEach(function (a) {
      var liste = L.filter(function (l) { return l.stufe === sid && l.art === a[1]; });
      if (!liste.length) return;
      var g = rohre(liste);
      addMesh(root, sid, g, MAT[sid + a[0]], STRUCT[sid].de + (a[0] === 'A' ? ' (Arterien)' : ' (Venen)'), 0);
      tris.gefaesse += g.index.count / 3;
    });
  });
  await setLoad(0.97, 'Beschriftung'); if (abgebaut) return;
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0, inAR = false;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var openK = 1, openZiel = 1;   /* 1 = aufgeschnitten (Deckel weg), 0 = geschlossen; laeuft weich */
var DECKEL_WEG = 6;            /* so weit gleitet der Deckel nach vorn (cm) */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = enabled[o.userData.sid]; });
  lv++;
}
/* Gewebe: Glas (Durchsicht) und Ausblenden des Deckels; Material nur neu uebersetzen, wenn sich transparent oder side aendert */
function stelleMat(m, transparent, opacity, doppelt) {
  var neu = m.transparent !== transparent || (m.side === THREE.DoubleSide) !== doppelt;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  m.side = doppelt ? THREE.DoubleSide : THREE.FrontSide;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  var a = 1 - sstep(0.25, 1, openK), s = sstep(0, 1, openK);   /* a: Deckkraft des Deckels, s: Weg */
  deckel.position.set(N[0] * DECKEL_WEG * s, N[1] * DECKEL_WEG * s, N[2] * DECKEL_WEG * s);
  deckel.visible = a > 0.004;
  GEWEBE.forEach(function (sid) {
    var b = MAT[sid], d = MAT[sid + 'D'];
    stelleMat(b, seeThrough, seeThrough ? GLAS : 1, seeThrough);
    stelleMat(d, seeThrough || a < 0.999, (seeThrough ? GLAS : 1) * a, seeThrough);
    /* Deckkraft in der USDZ (AR Quick Look) fuer das Glas: Wert unter 0.3 wuerde das Material weglassen */
    b.userData.usdzOp = d.userData.usdzOp = seeThrough ? 0.3 : 1;
  });
  /* Hohlsystem und Gefaesse laufen im Glas-Modus nach dem Gewebe */
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

(function leiste() {
  var rail = document.createElement('div'); rail.id = 'paneStruct';
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
      row.innerHTML = '<span class="sw" style="background:' + (s.col2 ? 'linear-gradient(135deg,#' + hex(s.col) + ' 50%,#' + hex(s.col2) + ' 50%)' : '#' + hex(s.col)) +
        '"></span><span class="nm"><b></b><i></i></span>';
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

/* Aufgeschnitten / Geschlossen */
var LEGNOTE = ['Die linke Niere von vorn, geschlossen. „Aufgeschnitten“ zeigt das Innere.', 'Schnitt durch die linke Niere von vorn; die vordere Hälfte ist abgehoben.'];
function offen(an) {
  openZiel = an ? 1 : 0;
  $('bOffen').classList.toggle('on', an);
  $('bZu').classList.toggle('on', !an);
  $('legNote').textContent = LEGNOTE[an ? 1 : 0];
  lv++;
}
$('bOffen').onclick = function () { offen(true); };
$('bZu').onclick = function () { offen(false); };
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
  $('labels').style.display = (showLabels && !inAR) ? '' : 'none';   /* in AR bleibt die HTML-Ebene aus */
  $('leaders').style.display = (showLabels && !inAR) ? '' : 'none';
  lv++;
};

/* =====================================================================
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var kamAlt = { near: camera.near, far: camera.far };   /* Kamera ausserhalb von AR */
var DREH = form.LAGE.dreh * DEG;   /* Blickrichtung senkrecht auf die Schnittflaeche (n) */
function lokalAnat(p) { var q = form.anatomisch(p); return V(q[0], q[1], q[2]); }
var view = { theta: DREH, phi: PI / 2, dist: 28, target: V(0, 0, 0) };
var orbit = Kern.orbit(canvas, view, { minDist: 3, maxDist: 80 });
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die
   Beschriftungsspalten freilassen. Ziele in lokalen Achsen (Schnittebene z = 0), hier nach anatomisch gedreht. */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: DREH, phi: PI / 2, target: lokalAnat([0, -0.1, 0]), ext: [8.8, 14], halb: 4.4 },
  { name: 'Rinde und Mark', theta: DREH, phi: PI / 2, target: lokalAnat([2.0, 0.4, 0]), ext: [4.6, 4.4], halb: 2.3 },
  { name: 'Nierenbecken', theta: DREH, phi: PI / 2, target: lokalAnat([-1.3, -0.3, 0]), ext: [5.6, 8.2], halb: 2.8 },
  { name: 'Hilus', theta: DREH - 50 * DEG, phi: 1.45, target: lokalAnat([-2.3, -0.7, 0.3]), ext: [5.4, 6.6], halb: 2.7 }
];
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Niere und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
function bereich(w, h) {
  if (w < 1000) {
    var tt = $('tools').getBoundingClientRect().top;
    return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (tt > 100 ? tt : h * 0.6) - 6), labW: 104, fit: 30 };
  }
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil($('tools').getBoundingClientRect().bottom) + 6), y1: h - 30, labW: 142, fit: 100 };
}
function distFuer(a, w, h) {
  var r = bereich(w, h), th = Math.tan(camera.fov * PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / a.ext[1], (r.x1 - r.x0 - 2 * r.fit) / a.ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
function gehe(i) {
  var a = AUSSCHNITTE[i]; if (!a) return;
  aktiv = i;
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === i);
  var w = window.innerWidth, h = window.innerHeight, d = distFuer(a, w, h);
  /* kuerzester Weg beim Drehen */
  var dth = a.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
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
  lv++;
}
function ansicht(theta, phi, dist, target) {
  if (theta !== undefined) view.theta = theta * DEG;
  if (phi !== undefined) view.phi = phi * DEG;
  if (dist !== undefined) view.dist = dist;
  if (target) view.target.set(target[0], target[1], target[2]);
  orbit.anim = null;
}

/* Antippen: sichtbare Strukturen; das Glas des Gewebes zaehlt nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, glas = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    if (seeThrough && GEWEBE.indexOf(sid) >= 0) glas = glas || sid; else treffer = sid;
  }
  setSelected(treffer || glas || null);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Ankerpunkte je Struktur: aus der Form berechnet (lokale Achsen, Schnittebene), nach anatomisch gedreht */
function strahl(grad, tiefe) {   /* Punkt auf dem Strahl aus KM in der Schnittebene, "tiefe" cm unter der Aussenflaeche */
  var w = grad * DEG, dx = Math.cos(w), dy = Math.sin(w), s = 0;
  while (form.aussenLokal(form.KM[0] + dx * s, form.KM[1] + dy * s, 0) < -tiefe) s += 0.01;
  return [form.KM[0] + dx * s, form.KM[1] + dy * s, 0];
}
function mitte(a, b, f) { f = f === undefined ? 0.5 : f; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
function saeule(i) {   /* Mitte der Saeule zwischen den Pyramiden i und i + 1 (auf der Schnittflaeche) */
  var A = PY[i], B = PY[i + 1], s0 = mitte(A.apex, B.apex), s1 = mitte(A.basis, B.basis), best = null, bd = -1e9, f, j;
  for (f = 0.3; f <= 0.9; f += 0.02) {
    var p = mitte(s0, s1, f);
    if (form.region(p[0], p[1], 0) !== 'saeulen') continue;
    var kl = 1e9;
    for (j = 0; j < PY.length; j++) kl = Math.min(kl, form.pyramide(j, p[0], p[1], 0));
    var c = Math.min(-form.aussenLokal(p[0], p[1], 0) - 0.95, kl);
    if (c > bd) { bd = c; best = p; }
  }
  return best || mitte(s0, s1);
}
var GEF = form.gefaesse();
function linie(stufe, art, k) { return GEF.filter(function (l) { return l.stufe === stufe && l.art === art; })[k]; }
var ANKER = {};
(function () {
  var p = PY[2], q = PY[3], oben = form.OBEN, becken = form.BECKEN, ur0 = form.UR0, ur1 = form.UR1;
  var a = {
    kapsel: strahl(-40, 0.03),
    rinde: strahl(30, 0.4),
    saeulen: saeule(1),
    pyramiden: mitte(p.apex, p.basis, 0.62),
    papillen: [q.apex[0] + q.u[0] * 0.15, q.apex[1] + q.u[1] * 0.15, 0],
    kelcheKlein: [PY[4].apex[0], PY[4].apex[1], 0],
    kelcheGross: mitte(oben, [becken[0] + 0.1, becken[1] + 0.4, 0]),
    becken: [becken[0] - 0.15, becken[1] - 0.2, 0],
    harnleiter: mitte(ur0, ur1),
    arterie: linie('arterie', 'arterie', 0).pts[1],
    vene: linie('vene', 'vene', 0).pts[1],
    interlobaer: linie('interlobaer', 'arterie', 2).pts[1],
    bogen: linie('bogen', 'arterie', 2).pts[4],
    interlobular: linie('interlobular', 'arterie', 7).pts[1],
    nebenniere: [-1.78, 5.28, 0.15]
  };
  Object.keys(a).forEach(function (id) { ANKER[id] = lokalAnat(a[id]); });
})();
var AUSSEN = ['kapsel', 'arterie', 'vene', 'harnleiter', 'becken', 'nebenniere'];   /* geschlossen von aussen sichtbar */
var KURZ = { pyramiden: 'Nierenpyramiden', interlobaer: 'Zwischenlappengefäße', interlobular: 'Rindengefäße' };
var HANDYNAME = { interlobaer: 'Interlobärgefäße', kelcheKlein: 'Kleine Kelche', kelcheGross: 'Große Kelche' };   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
/* je Ausschnitt: Strukturen in der Beschriftung */
var LISTEN = [
  ['kapsel', 'rinde', 'saeulen', 'pyramiden', 'papillen', 'kelcheKlein', 'kelcheGross', 'becken', 'harnleiter', 'arterie', 'vene', 'interlobaer', 'bogen', 'interlobular', 'nebenniere'],
  ['kapsel', 'rinde', 'saeulen', 'pyramiden', 'papillen', 'interlobaer', 'bogen', 'interlobular'],
  ['pyramiden', 'papillen', 'kelcheKlein', 'kelcheGross', 'becken', 'harnleiter', 'arterie', 'vene', 'interlobaer'],
  ['arterie', 'vene', 'becken', 'harnleiter', 'kapsel']
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
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, openZiel].join('|');
  if (key === lastKey) return;
  lastKey = key;
  var narrow = w < 1000, r = bereich(w, h), a = AUSSCHNITTE[aktiv], th = Math.tan(camera.fov * PI / 360);
  var pxcm = h / (2 * view.dist * th), cx = (r.x0 + r.x1) / 2;
  var colL = Math.min(cx - 20, Math.max(r.x0 + r.labW + 4, cx - a.halb * pxcm - 12));
  var colR = Math.max(cx + 20, Math.min(r.x1 - r.labW - 4, cx + a.halb * pxcm + 12));
  var topL = narrow ? r.y0 : 100, topR = narrow ? Math.max(r.y0, 214) : $('tools').getBoundingClientRect().bottom + 16;
  var botL = narrow ? r.y1 - 6 : h - 40, botR = botL;
  if (!narrow && $('info').classList.contains('show')) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !(narrow && selected)) {   /* Handy: die Infokarte deckt die Niere, ohne Beschriftung bleibt sie frei */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id] || (!openZiel && AUSSEN.indexOf(id) < 0)) return;
      pv.copy(ANKER[id]).project(camera);
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
    if (over > 0) g.forEach(function (it) { it.ly -= over; });
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
   6. Export (Kern.Export): GLB statisch und STL, jeweils der sichtbare Zustand (aufgeschnitten: ohne Deckel)
   ===================================================================== */
var LAENGE_TXT = 'Niere ca. 11 cm lang';
var exCfg = {
  titel: 'Niere', praefix: 'niere', wurzelName: 'Niere',
  /* Schild unter dem Modell: Bounding-Box der exportierten Teile (geschlossen, mit Gefaessstummeln) x -4,75 bis 4,66,
     y -7,00 bis 6,00, z -2,36 bis 4,46 -> x Mitte 0; y 1,5 cm unter der Unterkante (-8,5); z vorn (max z) */
  schild: [0, -8.5, 4.5],
  bereit: function () { return App.ready; },
  gruppen: function () { return [root]; },
  toast: function (msg) { Kern.toast(msg); },
  transparenz: true,
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    stlLiesmich: ['Datei (Maßstab Millimeter, Z-Achse nach oben, reale Größe: ' + LAENGE_TXT + '):', '- niere_ansicht.stl: alles, was beim Export sichtbar war (aufgeschnitten ohne die abgehobene vordere Hälfte)', 'STL kennt keine Farbe – dafür gibt es die GLB-Datei.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Datei, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Reale Größe (' + LAENGE_TXT + ') – STL kennt keine Farbe.';
    },
    glbLiesmich: function (i) {
      return [i.name + ': farbiges 3D-Modell der Niere in der Ansicht beim Export (aufgeschnitten oder geschlossen), ohne Bewegung.', 'Maßstab: Meter (reale Größe: ' + LAENGE_TXT + '). Die Signatur steht in den Metadaten und auf dem Schild unter der Niere.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span><br>Reale Größe (' + LAENGE_TXT + '), mit Farben, ohne Bewegung.';
    }
  }
};
$('bGlbS').onclick = function () { Kern.Export.run('glb', exCfg); };
$('bStl').onclick = function () { Kern.Export.run('stl', exCfg); };

/* =====================================================================
   7. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look
   (iPhone/iPad, Safari) mit selbst erzeugter USDZ-Datei. Die Niere wird in cm modelliert: 0,01 m je cm
   ist die reale Groesse, gestartet wird mit der doppelten (ca. 22 cm).
   ===================================================================== */
var AR_SKALA = 0.02;
var arCfg = {
  renderer: renderer, scene: scene, camera: camera, root: root,
  stufen: [0.01, 0.015, 0.02, 0.03, 0.045, 0.06], skala: AR_SKALA,
  fuss: 0,                                          /* Unterkante (Harnleiter-Ende) steht auf der Flaeche; wird nach dem Aufbau gesetzt */
  hintergrund: 0x0b171c,
  ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
  knoepfe: ['arEnd', 'arOffen', 'arLab', 'arSmall', 'arBig', 'arPlace'],
  quickLook: function () { arQuickLook(); },
  beimStart: function () {
    inAR = true;
    camera.near = 0.01; camera.far = 100;   /* Meter statt cm */
    labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
    arTexte();
  },
  beimEnde: function () {
    inAR = false;
    ARL.ausblenden();
    camera.near = kamAlt.near; camera.far = kamAlt.far;
    labelBox.style.display = showLabels ? '' : 'none'; leaderSvg.style.display = showLabels ? '' : 'none';
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    groesse(w, h);
    lv++;
  }
};
var AR = Kern.AR.xr(arCfg);
function arTexte() {
  $('arOffen').textContent = openZiel ? 'Geschlossen' : 'Aufgeschnitten';
  $('arLab').textContent = showLabels ? 'Beschriftung aus' : 'Beschriftung an';
}
$('arOffen').onclick = function () { offen(!openZiel); arTexte(); };
$('arLab').onclick = function () { $('bLab').click(); arTexte(); };
$('bAR').onclick = function () { AR.start(); };
AR.check();
/* ---- Beschriftung in AR: Schilder mit Fuehrungslinien (Kern.AR.schilder), Strukturen der aktuellen Ansicht ---- */
var ARL_EINTR = {};
Object.keys(LAB).forEach(function (id) { var d = STRUCT[id]; ARL_EINTR[id] = { s: { id: id, de: KURZ[id] || d.de, lat: d.lat } }; });
var ARL = Kern.AR.schilder({
  root: root, renderer: renderer, camera: camera, xr: AR,
  name: 'Niere', anzahl: Object.keys(ARL_EINTR).length,
  masse: { mitte: 0, spalte: 6.4, hoehe: 1.1, abstand: 1.3, z: 5.0, oben: 6.6, unten: -7.0, px: 128 },
  liste: function () {
    var out = [];
    if (!showLabels) return out;
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id] || (!openZiel && AUSSEN.indexOf(id) < 0)) return;
      var p = ANKER[id];
      out.push({ a: ARL_EINTR[id], p: [p.x, p.y, p.z] });
    });
    return out;
  },
  auswahl: function () { return selected; }
});
/* ---- USDZ fuer AR Quick Look: Momentaufnahme der Niere in der aktuellen Ansicht ---- */
function usdzBuild() {
  return Kern.AR.usdz({
    name: 'Niere', creator: 'Niere 3D - ' + Kern.WM, datei: 'niere.usda', skala: AR_SKALA,
    gruppen: [root],
    beschriftung: function (f4) {
      var v = new THREE.Vector3();
      root.updateWorldMatrix(true, false);
      return ARL.usd(f4, function (x, y, z) { v.set(x, y, z).applyMatrix4(root.matrixWorld); return [v.x * AR_SKALA, v.y * AR_SKALA, v.z * AR_SKALA]; });
    }
  });
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: $('arQL'), fertig: 'Die Niere öffnet sich in AR Quick Look. Mit zwei Fingern lässt sie sich vergrößern und drehen.' });
}

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var App = window.NiereApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, offen: offen, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris };
function loop(now, frame) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (openK !== openZiel) {   /* Deckel gleitet weich (ca. 600 ms) */
    openK = Math.max(0, Math.min(1, openK + Math.sign(openZiel - openK) * dt / 0.6));
    applyLook();
  }
  if (inAR) { AR.frame(frame); ARL.update(); renderer.render(scene, camera); return; }   /* in AR bestimmt die Sitzung die Kamera */
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  renderer.render(scene, camera);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  AR.abbauen(); ARL.abbauen();
  clearTimeout(Kern.toast._t);
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  camera.clearViewOffset();
  camera.near = kamAlt.near; camera.far = kamAlt.far; camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  var tt = $('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  delete window.NiereApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  setSelected(selected);
  arCfg.fuss = -new THREE.Box3().setFromObject(root).min.y;   /* Unterkante (Harnleiter-Ende) steht auf der Flaeche */
  Kern.Export.pruefeZiel('exp');
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('niere', organ);
})();
