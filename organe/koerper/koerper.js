/* =====================================================================
   Koerper - stilisiertes Lehrmodell eines ganzen Menschen
   Stilprobe: Hülle, Skelett und Organe als Geometrie, noch ohne
   Strukturliste, Beschriftung und Infokarten.
   Einheit cm; y oben, Fuss bei y = 0, Scheitel bei y = 175;
   x = LINKE Koerperseite (Betrachter rechts in der Vorderansicht), z = vorn.
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   SYSTEME: Reihenfolge der Liste; id = Name der Gruppe in der Szene.
   STRUKTUREN: de/lat, system, Text (Lage und Hauptaufgabe);
   oeffnen = Adresse des Detailmodells, knopf = Beschriftung des Knopfes;
   ohne oeffnen: detail false = noch kein Detailmodell.
   ===================================================================== */
var SYSTEME = [
  { id: 'haut', name: 'Haut', farbe: 0xE0C3A8 },
  { id: 'skelett', name: 'Skelett', farbe: 0xE6DCC6 },
  { id: 'nerven', name: 'Nervensystem', farbe: 0xE2C25A },
  { id: 'sinne', name: 'Sinnesorgane', farbe: 0x3D6FA8 },
  { id: 'hormon', name: 'Hormonsystem', farbe: 0x9C7BC6 },
  { id: 'kreislauf', name: 'Kreislauf', farbe: 0xC9483A },
  { id: 'atmung', name: 'Atmung', farbe: 0xE39AA4 },
  { id: 'verdauung', name: 'Verdauung', farbe: 0xD9A06A },
  { id: 'harn', name: 'Harnsystem', farbe: 0xD9B44A }
];
var STRUKTUREN = [
  { id: 'haut', de: 'Haut', lat: 'Cutis', system: 'haut', detail: false,
    text: 'Die Haut bedeckt die gesamte Körperoberfläche (etwa 1,5–2 m²) und besteht aus Oberhaut, Lederhaut und Unterhaut. Sie schützt vor Keimen, Austrocknung und mechanischer Belastung, hilft bei der Temperaturregulation und enthält Sinnesrezeptoren für Berührung, Schmerz und Temperatur.' },
  { id: 'schaedel', de: 'Schädel', lat: 'Cranium', system: 'skelett', detail: false,
    text: 'Der Schädel sitzt auf der Halswirbelsäule und besteht aus Hirnschädel und Gesichtsschädel mit dem beweglichen Unterkiefer. Er umschließt und schützt Gehirn und Sinnesorgane und bietet Ansatzflächen für Kau- und Nackenmuskeln.' },
  { id: 'wirbelsaeule', de: 'Wirbelsäule', lat: 'Columna vertebralis', system: 'skelett', detail: false,
    text: 'Sieben Halswirbel, zwölf Brustwirbel, fünf Lendenwirbel sowie Kreuz- und Steißbein bilden die doppelt-S-förmige Körperachse; Zwischenwirbelscheiben federn Belastungen ab. Sie trägt den Rumpf, macht ihn beweglich und schützt im Wirbelkanal das Rückenmark.' },
  { id: 'brustkorb', de: 'Brustkorb', lat: 'Thorax', system: 'skelett', detail: false,
    text: 'Zwölf Rippenpaare, Brustbein und Brustwirbelsäule bilden den knorpelig-knöchernen Korb des Brustraums. Er schützt Herz und Lunge und bewegt sich bei jedem Atemzug mit: Die Rippen heben sich beim Einatmen und senken sich beim Ausatmen.' },
  { id: 'becken', de: 'Becken', lat: 'Pelvis', system: 'skelett', detail: false,
    text: 'Der Beckenring besteht aus den beiden Hüftbeinen (Darm-, Sitz- und Schambein), die hinten mit dem Kreuzbein verbunden sind. Er trägt das Gewicht des Oberkörpers auf die Beine, bildet die Pfannen der Hüftgelenke und umschließt Harnblase und Enddarm.' },
  { id: 'armknochen', de: 'Arm- und Schultergürtelknochen', lat: 'Ossa membri superioris', system: 'skelett', detail: false,
    text: 'Schlüsselbein und Schulterblatt bilden den Schultergürtel, daran schließen Oberarmknochen, Elle und Speiche sowie die Handknochen an. Sie machen den Arm beweglich; das Schultergelenk ist das beweglichste Gelenk des Körpers.' },
  { id: 'beinknochen', de: 'Bein- und Fußknochen', lat: 'Ossa membri inferioris', system: 'skelett', detail: false,
    text: 'Oberschenkelknochen (der längste und stärkste Knochen), Kniescheibe, Schien- und Wadenbein sowie die Fußknochen. Sie tragen das Körpergewicht und ermöglichen Stehen, Gehen und Laufen.' },
  { id: 'gehirn', de: 'Gehirn', lat: 'Encephalon', system: 'nerven', detail: false,
    text: 'Das Gehirn liegt geschützt in der Schädelhöhle und besteht aus Großhirn, Kleinhirn und Hirnstamm. Es steuert Bewusstsein, Wahrnehmung, Denken und Bewegung sowie lebenswichtige Funktionen wie Atmung und Kreislauf.' },
  { id: 'rueckenmark', de: 'Rückenmark', lat: 'Medulla spinalis', system: 'nerven', detail: false,
    text: 'Das Rückenmark verläuft im Wirbelkanal vom Hinterhauptsloch bis etwa zum ersten bis zweiten Lendenwirbel. Es leitet Signale zwischen Gehirn und Körper und steuert einfache Reflexe; zwischen den Wirbeln treten paarig die Spinalnerven aus.' },
  { id: 'augen', de: 'Augen', lat: 'Oculi', system: 'sinne', detail: false,
    text: 'Die Augen liegen geschützt in den knöchernen Augenhöhlen. Hornhaut und Linse bündeln das Licht auf die Netzhaut; deren Sinneszellen wandeln es in Nervensignale um, die der Sehnerv zum Gehirn leitet.' },
  { id: 'schilddruese', de: 'Schilddrüse', lat: 'Glandula thyroidea', system: 'hormon', detail: false,
    text: 'Die schmetterlingsförmige Schilddrüse liegt am Hals vor der Luftröhre unterhalb des Kehlkopfes. Sie bildet die jodhaltigen Hormone Thyroxin (T4) und Trijodthyronin (T3), die Stoffwechsel, Herzfrequenz und Wachstum beeinflussen.' },
  { id: 'herz', de: 'Herz', lat: 'Cor', system: 'kreislauf', oeffnen: '#herz', knopf: 'Herz öffnen',
    text: 'Das faustgroße Hohlmuskelorgan liegt im Mittelfellraum auf dem Zwerchfell, mit der Spitze nach links unten. Als Doppelpumpe treibt es das Blut durch Lungen- und Körperkreislauf (in Ruhe etwa 5 Liter pro Minute).' },
  { id: 'herzkranz', de: 'Herzkranzgefäße', lat: 'Arteriae coronariae', system: 'kreislauf', detail: false,
    text: 'Die rechte und die linke Koronararterie entspringen der Aorta direkt oberhalb der Aortenklappe und umziehen das Herz. Sie versorgen den Herzmuskel selbst mit sauerstoffreichem Blut; ein Verschluss führt zum Herzinfarkt.' },
  { id: 'aorta', de: 'Aorta und große Arterien', lat: 'Aorta', system: 'kreislauf', detail: false,
    text: 'Die Hauptschlagader entspringt der linken Herzkammer, bildet den Aortenbogen mit den Abgängen zu Kopf und Armen und zieht vor der Wirbelsäule durch Brust und Bauch, bis sie sich in die Beckenarterien teilt. Sie verteilt sauerstoffreiches Blut an alle Organe.' },
  { id: 'hohlvenen', de: 'Hohlvenen', lat: 'Venae cavae', system: 'kreislauf', detail: false,
    text: 'Die obere Hohlvene sammelt das Blut aus Kopf, Hals und Armen, die untere aus Bauch, Becken und Beinen. Beide münden in den rechten Vorhof und bringen sauerstoffarmes Blut zum Herzen zurück.' },
  { id: 'milz', de: 'Milz', lat: 'Splen', system: 'kreislauf', detail: false,
    text: 'Die Milz liegt im linken Oberbauch unter dem Zwerchfell, hinter dem Magen. Als größtes lymphatisches Organ filtert sie das Blut, baut alte rote Blutkörperchen ab und bildet Abwehrzellen; zudem dient sie als Blutspeicher.' },
  { id: 'luftroehre', de: 'Luftröhre und Bronchien', lat: 'Trachea et bronchi', system: 'atmung', detail: false,
    text: 'Die etwa 10–12 cm lange Luftröhre führt vom Kehlkopf in den Brustraum und teilt sich in die beiden Hauptbronchien. Knorpelspangen halten sie offen; das Flimmerepithel befördert Schleim und Fremdkörper Richtung Rachen.' },
  { id: 'lunge', de: 'Lunge', lat: 'Pulmo', system: 'atmung', detail: false,
    text: 'Die rechte Lunge hat drei, die linke zwei Lappen; sie füllen den Brustraum beiderseits des Herzens. In den Lungenbläschen (Alveolen) tritt Sauerstoff ins Blut über und Kohlendioxid wird abgegeben.' },
  { id: 'zwerchfell', de: 'Zwerchfell', lat: 'Diaphragma', system: 'atmung', detail: false,
    text: 'Die kuppelförmige Muskelplatte trennt Brust- und Bauchraum. Als wichtigster Atemmuskel flacht es sich beim Einatmen ab und erweitert so den Brustraum; Speiseröhre, Aorta und untere Hohlvene treten durch Lücken hindurch.' },
  { id: 'speiseroehre', de: 'Speiseröhre', lat: 'Oesophagus', system: 'verdauung', detail: false,
    text: 'Der etwa 25 cm lange Muskelschlauch verläuft hinter der Luftröhre durch den Brustraum und das Zwerchfell zum Magen. Durch wellenförmige Bewegungen (Peristaltik) transportiert er den Speisebrei; ein Schließmuskel am Mageneingang verhindert Rückfluss.' },
  { id: 'magen', de: 'Magen', lat: 'Gaster', system: 'verdauung', detail: false,
    text: 'Der Magen liegt im linken Oberbauch unter dem Zwerchfell. Er speichert die Nahrung, durchmischt sie mit Magensaft (Salzsäure, Pepsin) und gibt sie portionsweise an den Zwölffingerdarm weiter; seine Schleimhaut schützt sich durch eine Schleimschicht selbst.' },
  { id: 'leber', de: 'Leber', lat: 'Hepar', system: 'verdauung', detail: false,
    text: 'Die Leber ist die größte Stoffwechseldrüse und liegt im rechten Oberbauch unter dem Zwerchfell. Sie bildet Galle, verwertet Nährstoffe, baut Medikamente und Giftstoffe ab und stellt Eiweiße wie Gerinnungsfaktoren und Albumin her.' },
  { id: 'gallenblase', de: 'Gallenblase', lat: 'Vesica biliaris', system: 'verdauung', detail: false,
    text: 'Die birnenförmige Gallenblase haftet an der Unterseite der Leber. Sie speichert und konzentriert die Galle und gibt sie bei fetthaltiger Nahrung über den Gallengang in den Zwölffingerdarm ab, wo sie die Fettverdauung unterstützt.' },
  { id: 'pankreas', de: 'Bauchspeicheldrüse', lat: 'Pancreas', system: 'verdauung', detail: false,
    text: 'Die Bauchspeicheldrüse liegt quer im Oberbauch hinter dem Magen, ihr Kopf in der Schlinge des Zwölffingerdarms. Sie gibt Verdauungsenzyme in den Darm ab und bildet in den Langerhans-Inseln Insulin und Glukagon, die den Blutzucker regeln.' },
  { id: 'duenndarm', de: 'Dünndarm', lat: 'Intestinum tenue', system: 'verdauung', detail: false,
    text: 'Der Dünndarm ist etwa 3–5 m lang und gliedert sich in Zwölffingerdarm, Leerdarm und Krummdarm. Hier wird die Nahrung fertig verdaut; über die Darmzotten gelangen Nährstoffe, Wasser und Elektrolyte ins Blut und in die Lymphe.' },
  { id: 'dickdarm', de: 'Dickdarm', lat: 'Intestinum crassum', system: 'verdauung', detail: false,
    text: 'Der etwa 1,5 m lange Dickdarm rahmt den Dünndarm ein: Blinddarm mit Wurmfortsatz, aufsteigender, querer und absteigender Teil, S-förmiges Sigma und Mastdarm. Er entzieht dem Darminhalt Wasser und Salze, dickt den Stuhl ein und beherbergt die Darmflora.' },
  { id: 'nieren', de: 'Nieren', lat: 'Renes', system: 'harn', oeffnen: '#niere', knopf: 'Niere öffnen',
    text: 'Die beiden bohnenförmigen Nieren liegen hinter dem Bauchfell beiderseits der Wirbelsäule auf H\u00f6he der untersten Rippen. Sie filtern das Blut, bilden den Harn und regeln Wasser-, Salz- und Säure-Basen-Haushalt sowie den Blutdruck. Funktionseinheit ist das Nephron.' },
  { id: 'harnleiter', de: 'Harnleiter', lat: 'Ureteres', system: 'harn', detail: false,
    text: 'Die beiden 25–30 cm langen Muskelschläuche führen vom Nierenbecken zur Harnblase und befördern den Urin durch Peristaltik. An drei natürlichen Engstellen können Nierensteine hängen bleiben und Koliken auslösen.' },
  { id: 'harnblase', de: 'Harnblase', lat: 'Vesica urinaria', system: 'harn', detail: false,
    text: 'Die Harnblase liegt im kleinen Becken hinter dem Schambein. Ihr Hohlmuskel (Detrusor) speichert den Urin (Fassungsvermögen etwa 500 ml, Harndrang ab 200–300 ml) und entleert ihn über die Harnröhre.' }
];

/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">K&ouml;rper &middot; Organe und Organsysteme</div>
  <h1>Der <em>Mensch</em></h1>
  <div class="sub">Organsysteme ein- und ausblenden, Organe antippen.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Ganzk&ouml;rper</button>
    <button id="cam1" class="gh">Kopf/Hals</button>
    <button id="cam2" class="gh">Brustkorb</button>
    <button id="cam3" class="gh">Bauch</button>
    <button id="cam4" class="gh">Becken</button>
    <button id="cam5" class="gh">R&uuml;cken</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bAR" class="gh" title="Den K&ouml;rper mit der Kamera in den Raum stellen">AR</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <div class="kick" id="iKick"></div>
  <h3 id="iDe"></h3>
  <span class="lat" id="iLat"></span>
  <p id="iTx"></p>
  <button class="gh" id="iOpen" style="display:none"></button>
</div>

<div id="arUI" aria-live="polite">
  <div class="ar-top"><span class="ar-title">K&ouml;rper in AR</span><span class="ar-phase" id="arPhase"></span><button class="ar-b" id="arEnd">Beenden</button></div>
  <div class="ar-hint" id="arHint">Bewege das Ger&auml;t langsam &uuml;ber den Boden oder Tisch, bis ein Ring erscheint &ndash; dann tippen, um den K&ouml;rper hinzustellen.</div>
  <div class="ar-bot">
    <button class="ar-b" id="arHaut">Haut aus</button>
    <button class="ar-b" id="arSmall">Kleiner</button>
    <button class="ar-b" id="arBig">Gr&ouml;&szlig;er</button>
    <button class="ar-b" id="arPlace">Neu hinstellen</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
var organ = { renderer: {}, aufbauen: aufbauen };
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
umg.bereich.innerHTML = MARKUP;

var S = Kern.SDF;
var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var UP = new THREE.Vector3(0, 1, 0);
var PI = Math.PI;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Systeme, Materialien, Steuerung
   ===================================================================== */
var wurzel = new THREE.Group(); scene.add(wurzel);
var STR = {};   /* Struktur-id -> { def, meshes } */
STRUKTUREN.forEach(function (d) { STR[d.id] = { def: d, meshes: [] }; });
var SYS = {};
SYSTEME.forEach(function (d) {
  var n = d.id, g = new THREE.Group(); g.name = n; wurzel.add(g);
  SYS[n] = { grp: g, mats: [], modus: 'an', def: d };
});

/* Gewebematerial eines Systems; o.opacity = Grundzustand, 'glas' setzt darunter */
function mat(sys, hex, o) {
  o = o || {};
  var m = Kern.mat(hex, o, envTex);
  m.userData.op0 = m.opacity; m.userData.tr0 = m.transparent; m.userData.dw0 = m.depthWrite;
  SYS[sys].mats.push(m);
  return m;
}

/* Glasartiges Material (Mitte durchsichtig, Kanten dichter, wie glassify im Herz);
   u.value skaliert die Deckkraft (1 = an, kleiner = glas) */
function glasMat(sys, hex, a0, a1, ex) {
  ex = ex || 2.2;
  var m = Kern.mat(hex, { rough: 0.45, coat: 0.3, env: 0.4 }, envTex);
  m.transparent = true; m.opacity = 1; m.depthWrite = false;
  var u = { value: 1 };
  m.userData.gu = u;
  m.onBeforeCompile = function (sh) {
    sh.uniforms.uKoerperGlas = u;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uKoerperGlas;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' +
        'float frg = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));\n' +
        'gl_FragColor.a *= uKoerperGlas * mix(' + a0.toFixed(3) + ', ' + a1.toFixed(3) + ', pow(frg, ' + ex.toFixed(2) + '));');
  };
  m.customProgramCacheKey = function () { return 'koerperGlas' + a0 + '_' + a1 + '_' + ex; };
  SYS[sys].mats.push(m);
  return m;
}

/* Darstellung eines Systems: 'an' | 'glas' | 'aus' (gemerkt pro System) */
function modus(sys, m) {
  var s = SYS[sys];
  if (!s || (m !== 'an' && m !== 'glas' && m !== 'aus')) return;
  s.modus = m;
  s.grp.visible = m !== 'aus';
  s.mats.forEach(function (x) {
    if (x.userData.gu) { x.userData.gu.value = m === 'glas' ? 0.35 : 1; return; }
    if (m === 'glas') { x.transparent = true; x.opacity = 0.38; x.depthWrite = false; }
    else { x.transparent = x.userData.tr0; x.opacity = x.userData.op0; x.depthWrite = x.userData.dw0; }
  });
}

/* Struktur, zu der die gerade gebauten Meshes gehoeren (userData.sid, wie im Nephron) */
var SID = null;
function als(id) { SID = id; }
function dazu(sys, mesh) {
  mesh.userData.sid = SID;
  if (SID && STR[SID]) STR[SID].meshes.push(mesh);
  mesh.renderOrder = sys === 'haut' ? 10 : (mesh.material.userData.gu ? 5 : 2);
  SYS[sys].grp.add(mesh);
  return mesh;
}

/* =====================================================================
   2. Geometrie-Bausteine (three.js-Koerper)
   ===================================================================== */
var sphG = new THREE.SphereGeometry(1, 22, 14);
function kugelM(sys, m, x, y, z, r) {
  var o = new THREE.Mesh(sphG, m); o.position.set(x, y, z); o.scale.setScalar(r); return dazu(sys, o);
}
function ellM(sys, m, x, y, z, rx, ry, rz, rot) {
  var o = new THREE.Mesh(sphG, m); o.position.set(x, y, z); o.scale.set(rx, ry, rz);
  if (rot) o.rotation.set(rot[0], rot[1], rot[2]);
  return dazu(sys, o);
}
/* Ellipsoid, dessen lange Achse von a nach b laeuft (rx, rz = Halbmasse quer) */
function ellAchse(sys, m, a, b, rx, rz) {
  var d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  var o = new THREE.Mesh(sphG, m);
  o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  o.quaternion.setFromUnitVectors(UP, d.normalize());
  o.scale.set(rx, L / 2, rz);
  return dazu(sys, o);
}
/* Stab von a nach b (Radius r0 bei a, r1 bei b); rund = Kugelenden */
function stab(sys, m, a, b, r0, r1, rund) {
  var d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  var o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, 12, 1), m);
  o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  o.quaternion.setFromUnitVectors(UP, d.normalize());
  dazu(sys, o);
  if (rund) { kugelM(sys, m, a[0], a[1], a[2], r0); kugelM(sys, m, b[0], b[1], b[2], r1); }
  return o;
}
/* Rohr entlang einer glatten Kurve durch pts (Arrays [x,y,z]) */
function rohr(sys, m, pts, r, seg, rund) {
  var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
  var o = new THREE.Mesh(new THREE.TubeGeometry(c, seg || Math.max(8, pts.length * 8), r, 8, false), m);
  dazu(sys, o);
  if (rund !== false) {
    var a = pts[0], b = pts[pts.length - 1];
    kugelM(sys, m, a[0], a[1], a[2], r); kugelM(sys, m, b[0], b[1], b[2], r);
  }
  return o;
}
/* Verlauf mit glatter Zwischenstufe: Tabelle [[y, wert], ...] aufsteigend */
function interp(t, y) {
  if (y <= t[0][0]) return t[0][1];
  for (var i = 1; i < t.length; i++) if (y <= t[i][0]) {
    var f = (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]); f = f * f * (3 - 2 * f);
    return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * f;
  }
  return t[t.length - 1][1];
}

/* Organ aus einem Abstandsfeld: Gitter ueber bounds mit Weite h */
async function sdfMesh(sys, m, fn, bounds, h, fortschritt) {
  var G = S.makeGrid(bounds, h);
  var F = await S.evalFeld(G, fn, fortschritt);
  if (abgebaut) return null;
  var o = new THREE.Mesh(S.geometrie(G, F), m);
  return dazu(sys, o);
}

/* =====================================================================
   3. Koerperhuelle (Abstandsfeld)
   ===================================================================== */
var AXT = [[84, 16], [92, 17.2], [100, 16], [106, 15.5], [114, 16.2], [124, 17], [134, 17.2], [141, 15], [146, 8]];
var AZT = [[84, 10.6], [92, 11.6], [100, 11], [106, 11], [114, 11.8], [124, 12.6], [134, 11.8], [141, 8.8], [146, 5]];
var ell = S.ellipsoid, kap = S.kapsel, smin = S.smin;
function huelle(x, y, z) {
  var sx = x < 0 ? -x : x, d;
  /* Teile nur dort auswerten, wo sie die Huelle noch beeinflussen koennen */
  if (y > 72 && y < 150) {
    var yy = y < 84 ? 84 : y > 146 ? 146 : y;
    var ax = interp(AXT, yy), az = interp(AZT, yy), dz = z - 0.3;
    d = (Math.sqrt(sx * sx / (ax * ax) + dz * dz / (az * az)) - 1) * az;
    d = Math.max(d, y - 146, 84 - y);
  } else d = 1e3;
  if (y > 128) {
    d = smin(d, ell(sx, y, z, 0, 164, 0.5, 7.8, 11.4, 9.8), 6);          // Kopf
    d = smin(d, ell(sx, y, z, 0, 157.5, 2.6, 6.2, 6.6, 7.6), 4);         // Gesicht/Kiefer
    d = smin(d, kap(sx, y, z, 0, 141, -2, 0, 154, -1.6, 5.8, 5.4), 4);   // Hals
  }
  if (y > 60 && y < 152) {
    d = smin(d, kap(sx, y, z, 0, 141.5, 0, 19.5, 141, 0, 6.4, 5.2), 5);  // Schultern
    d = smin(d, kap(sx, y, z, 19.5, 141, 0, 27, 110.9, 0, 5.2, 4.1), 3); // Oberarm
    d = smin(d, kap(sx, y, z, 27, 110.9, 0, 33.5, 86.8, 0.5, 4.1, 2.8), 2);   // Unterarm
    var hd = kap(sx, y, z * 2.2, 33.5, 86.8, 1.1, 37.6, 69.5, 1.1, 4.2, 2.4);  // flache Hand
    d = smin(d, hd / 1.6, 1.5);
    d = smin(d, kap(sx, y, z * 1.8, 35.2, 83.5, 1.6, 40.6, 77.0, 2.2, 1.7, 1.2) / 1.4, 1.2);   // Daumen
  }
  if (y < 106) {
    d = smin(d, ell(sx, y, z, 0, 88.5, 0, 15.8, 10.5, 10.6), 5);         // Becken
    d = smin(d, ell(sx, y, z, 7, 86, -6.5, 7.5, 8, 5.5), 5);             // Gesaess
    d = smin(d, kap(sx, y, z, 9.5, 87, 0.3, 11, 49, 0.5, 8.4, 5.4), 4);  // Oberschenkel
    d = smin(d, kap(sx, y, z, 11, 49, 0.5, 13.5, 8, 0.3, 5.4, 3.6), 3);  // Unterschenkel
    d = smin(d, ell(sx, y, z, 12.2, 39, -2.8, 5.0, 10.5, 6.0), 3);       // Wade
    d = smin(d, kap(sx, y, z, 13.5, 8, 0.3, 14, 4, 1.0, 3.6, 3.2), 2);   // Knoechel
    var fu = smin(S.box(sx, y, z, 14.3, 2.8, 4.8, 3.4, 2.8, 9.3, 2.2), ell(sx, y, z, 13.8, 4.6, -2.4, 3.5, 4.4, 3.5), 2.5);   // Fuss mit Ferse
    fu = S.smax(fu, -ell(sx, y, z, 11.6, 0.4, 3.6, 2.4, 1.8, 5.2), 1);  // Fusswoelbung innen
    d = smin(d, fu, 2);
  }
  return d;
}

/* =====================================================================
   4. Skelett
   ===================================================================== */
var RWT = [[100, 2.7], [114, 2.5], [117, 2.0], [140, 1.8], [143, 1.5], [150, 1.35]];
/* Wirbelsaeule, Brustbein, Rippen- und Lungenform stammen aus dem Form-Baustein der Lunge (organe/lunge/lunge-form.js); er wird in bauen geladen, bevor das Skelett entsteht */
var LF = null, RIP_R, RIP_YA, domY, DOM_R, DOM_L;
function zst(y) { return LF.zst(y); }
function zSternum(y) { return LF.zSternum(y); }

/* Rippe i, Seite s: Stuetzpunkte; Abstand zur Lunge (lg) und Haut (hh) werden eingehalten */
function rippeStuetz(i, s, lg, hh) {
  var P = LF.rippen()[i], n = 15, pts = [], k, u, ph, x, z, y, dx, dz, l, m;
  for (k = 0; k <= n; k++) {
    u = k / n; ph = P.p0 + (P.p1 - P.p0) * u;
    x = P.A * Math.sin(ph);
    z = P.zc - P.B * Math.cos(ph) - 0.5 * Math.sin(PI * Math.min(1, u / 0.3));   /* erst nach hinten-seitlich */
    y = P.yb + (P.ye - P.yb) * Math.pow(u, 1.4);
    if (k === 0) x = 3.3;
    pts.push([s * x, y, z]);
  }
  /* radial nach aussen schieben, bis Lunge und Haut passen */
  for (k = 1; k <= n; k++) {
    var p = pts[k];
    dx = p[0]; dz = p[2] - P.zc; l = Math.sqrt(dx * dx + dz * dz); dx /= l; dz /= l;
    for (m = 0; m < 40 && lg(p[0], p[1], p[2]) < RIP_R + 0.6; m++) {
      var qx = p[0] + dx * 0.15, qz = p[2] + dz * 0.15;
      if (huelle(qx, p[1], qz) > -(RIP_R + 0.8)) break;
      p[0] = qx; p[2] = qz;
    }
  }
  /* glaetten (Enden bleiben) */
  for (m = 0; m < 2; m++) {
    var q = pts.map(function (a) { return a.slice(); });
    for (k = 1; k < n; k++) for (var c = 0; c < 3; c++) pts[k][c] = 0.25 * q[k - 1][c] + 0.5 * q[k][c] + 0.25 * q[k + 1][c];
  }
  return pts;
}

function skelett() {
  var kn = mat('skelett', 0xE6DCC6, { rough: 0.8, env: 0.2 });
  var sk = 'skelett';
  var knD = mat(sk, 0xE6DCC6, { rough: 0.8, env: 0.2, side: THREE.DoubleSide });
  /* Schaedel: gläsern, damit das Gehirn sichtbar bleibt */
  var sch = glasMat(sk, 0xE6DCC6, 0.2, 0.85);
  als('schaedel');
  ellM(sk, sch, 0, 164.6, 0.3, 6.9, 10.2, 8.6);
  ellM(sk, sch, 0, 156.8, 3.6, 4.6, 4.2, 4.8);
  /* Augenhoehlen, Jochbeine, Nasenwurzel */
  [-1, 1].forEach(function (s) {
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.38, 8, 20), kn); o.position.set(s * 3.4, 161.8, 7.7); o.rotation.y = s * 0.25; dazu(sk, o);
    rohr(sk, kn, [[s * 5.2, 161, 6.2], [s * 6.2, 159.5, 3.8], [s * 6.4, 159.5, 0.5]], 0.5, 12);
    kugelM(sk, kn, s * 4.6, 158.4, 6.6, 1.0);
  });
  ellM(sk, kn, 0, 160.6, 8.1, 0.8, 1.5, 0.6);
  /* Unterkiefer: Bogen */
  rohr(sk, kn, [[-5.6, 159, -1.8], [-5.0, 154.5, 1.8], [-2.6, 152.6, 5.0], [0, 152.0, 6.0], [2.6, 152.6, 5.0], [5.0, 154.5, 1.8], [5.6, 159, -1.8]], 0.8, 40);
  /* Wirbelsaeule: 7 + 12 + 5 Wirbelkoerper, Kreuz- und Steissbein */
  als('wirbelsaeule');
  var wy = [], i;
  for (i = 0; i < 7; i++) wy.push([150 - i * 1.4, 0.95]);
  for (i = 0; i < 12; i++) wy.push([140 - i * 2.1, 1.5]);
  for (i = 0; i < 5; i++) wy.push([114 - i * 3.1, 2.2]);
  wy.forEach(function (w) {
    var y = w[0], z = zst(y), r = interp(RWT, y), hh = w[1] / 2;
    stab(sk, kn, [0, y + hh, z], [0, y - hh, z], r, r, false);
    var lang = y > 140 ? 1.6 : y > 115 ? 2.4 : 2.2;
    stab(sk, kn, [0, y, z - r + 0.2], [0, y - (y > 115 ? 1.3 : 0.4), z - r - lang], 0.5, 0.4, true);
  });
  stab(sk, kn, [0, 99.5, zst(99.5)], [0, 84, -7.6], 3.6, 1.5, true);
  stab(sk, kn, [0, 84, -7.6], [0, 80.4, -6.2], 0.9, 0.4, true);
  /* Brustkorb: 12 Rippenpaare, Querfortsaetze, Rippenknorpel */
  als('brustkorb');
  var knorpel = mat(sk, 0xD5DDE3, { rough: 0.7, env: 0.25 }), enden = [], lgs = { '-1': LF.lunge(-1, null), '1': LF.lunge(1, null) };
  LF.rippen().forEach(function (P, i) {
    [-1, 1].forEach(function (s) {
      var pts = rippeStuetz(i, s, lgs[s], huelle), e = pts[pts.length - 1], ziel;
      stab(sk, kn, [s * 0.9, P.yb, zst(P.yb) - 1.2], [s * 3.3, P.yb, P.zb], 0.5, 0.45, true);   /* Querfortsatz */
      rohr(sk, kn, pts, RIP_R, 48);
      (enden[i] = enden[i] || {})[s] = e;
      if (i < 7) ziel = [s * 1.2, RIP_YA[i], zSternum(RIP_YA[i]) - 0.1];
      else if (i < 10) ziel = enden[i - 1][s];
      if (ziel) rohr(sk, knorpel, [e, ziel], 0.45, 8);
    });
  });
  /* Brustbein: Griff, Koerper, Schwertfortsatz als flache, sich verjuengende Form */
  var tilt = Math.atan((zSternum(125) - zSternum(143)) / 18);
  var sh = new THREE.Shape();
  [[-2.1, 0], [2.1, 0], [1.6, -4.8], [1.9, -6.4], [1.2, -17.4], [0.6, -18.0], [0, -20.6], [-0.6, -18.0], [-1.2, -17.4], [-1.9, -6.4], [-1.6, -4.8]].forEach(function (q, i) {
    if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]);
  });
  var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2 });
  sg.translate(0, 0, -0.4);
  var so = new THREE.Mesh(sg, kn); so.position.set(0, 143, zSternum(143)); so.rotation.x = -tilt; dazu(sk, so);
  [-1, 1].forEach(function (s) {
    /* Schluesselbein, Schulterblatt */
    als('armknochen');
    rohr(sk, kn, [[s * 1.6, 142.2, 4.6], [s * 7, 143.3, 6.0], [s * 13, 143.4, 4.2], [s * 18.5, 141.6, 0.5]], 0.75, 30);
    ellM(sk, kn, s * 11.5, 131, -8.8, 4.2, 6.5, 0.6, [0.1, s * 0.2, s * 0.12]);
    /* Arm */
    kugelM(sk, kn, s * 18.8, 140, 0, 2.0);
    stab(sk, kn, [s * 18.8, 140, 0], [s * 27, 110.9, 0], 1.4, 1.2, true);
    stab(sk, kn, [s * 26.8, 110.9, -0.9], [s * 33.0, 86.8, -0.5], 0.8, 0.6, true);
    stab(sk, kn, [s * 28.0, 110.9, 0.4], [s * 34.5, 86.8, 0.4], 0.65, 0.85, true);
    ellAchse(sk, kn, [s * 33.6, 87.2, 0.5], [s * 34.9, 82.8, 0.5], 2.8, 1.2);       // Handwurzel
    [-2.4, -0.8, 0.8, 2.4].forEach(function (o, k) {                                // Mittelhand und Finger
      var ax = [0.231, -0.973], px = [0.973, 0.231], le = [12.0, 13.4, 12.8, 11.0][k];
      stab(sk, kn, [s * (34.9 + 4.2 * ax[0] + o * px[0]), 82.8 + 4.2 * ax[1] + o * px[1], 0.5], [s * (34.9 + le * ax[0] + o * 1.15 * px[0]), 82.8 + le * ax[1] + o * 1.15 * px[1], 0.5], 0.4, 0.3, true);
    });
    stab(sk, kn, [s * 35.2, 83.6, 1.0], [s * 40.4, 77.2, 1.6], 0.5, 0.35, true);     // Daumen
    /* Becken */
    als('becken');
    var il = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, PI, PI, 0, PI * 0.62), knD);   // Darmbeinschale, nach vorn offen
    il.position.set(s * 9.4, 98.2, -1.0); il.scale.set(6.2, 8.0, 6.2); il.rotation.y = -s * 0.35; dazu(sk, il);
    ellM(sk, kn, 0, 82.6, 6.3, 1.4, 1.2, 0.7);
    kugelM(sk, kn, s * 8.5, 88.5, 0.3, 2.4);
    rohr(sk, kn, [[s * 9, 93, -1], [s * 8.8, 90, -0.2], [s * 8.5, 88, 0.5]], 1.2, 12);
    rohr(sk, kn, [[s * 8, 86, 0.8], [s * 5.8, 82.5, 5.2], [s * 1.0, 82.3, 6.0]], 0.9, 20);
    rohr(sk, kn, [[s * 8.2, 86.5, -1.0], [s * 7.5, 81.5, -3.2]], 1.0, 10);
    kugelM(sk, kn, s * 7.4, 80.8, -3.6, 1.5);
    /* Bein */
    als('beinknochen');
    rohr(sk, kn, [[s * 8.5, 89, 0.3], [s * 9.5, 75, 1.2], [s * 10.3, 62, 1.5], [s * 10.8, 50, 0.9]], 1.5, 24);
    kugelM(sk, kn, s * 11.0, 48.8, 1.0, 2.5);
    ellM(sk, kn, s * 11.3, 48.5, 5.0, 1.6, 1.9, 0.8);
    stab(sk, kn, [s * 11.2, 47.5, 0.8], [s * 13.4, 9.2, 0.3], 1.4, 1.7, true);
    stab(sk, kn, [s * 13.2, 46.5, -1.0], [s * 15.8, 9.5, -1.0], 0.6, 0.7, true);
    /* Fuss */
    ellM(sk, kn, s * 13.6, 7.0, 0.3, 2.4, 2.0, 2.8);                   // Sprungbein
    ellM(sk, kn, s * 13.8, 4.0, -2.4, 2.2, 2.5, 2.8);                  // Ferse
    ellM(sk, kn, s * 14.3, 2.7, 5.6, 3.0, 1.3, 8.6, [0.05, 0, 0]);     // Fusswurzel und Mittelfuss
  });
}

/* =====================================================================
   5. Organe
   ===================================================================== */
/* Herz aus dem Herz-Modell: Verschiebung (Herz-Koordinaten -> Koerper) und Abtaster der Herzform (fuer die Lungenbucht); leer = einfaches Ersatzherz */
var HERZ_V = [2.0, 122.5, 2.4], herzSmp = null, herzP = null;

function sdfHerz(x, y, z) {
  /* gerundeter Kegel: Basis oben-rechts-hinten, stumpfe Spitze links unten, Dicke ca. 6 cm (z gestaucht) */
  var zz = 2.8 + (z - 2.8) * 1.45;
  var d = kap(x, y, zz, 3.1, 123.6, 2.8, 6.3, 119.9, 3.3, 4.5, 2.7) / 1.25;
  d = smin(d, ell(x, y, z, 0.2, 125.6, 1.6, 3.4, 3.0, 2.6), 2);      // Vorhoefe
  d = smin(d, ell(x, y, z, -0.6, 121.6, 3.2, 2.6, 3.6, 2.4), 1.6);   // rechter Rand (rechter Vorhof/Kammer)
  return d;
}
function sdfLeber(x, y, z) {
  var d = ell(x, y, z, -4.0, 109.8, 0.8, 9.0, 8.4, 7.0);             // rechter Lappen
  d = smin(d, ell(x, y, z, 2.6, 111.6, 3.4, 7.4, 4.0, 4.6), 4);       // linker Lappen, duenn auslaufend
  d = Math.max(d, 0.4 * (y - (domY(x, z, -6.5, DOM_R) - 0.6)));         // Oberseite folgt der Kuppel
  return Math.max(d, -(y - 100.2 - 0.5 * (x + 12)) * 0.89);            // schraeger, scharfer Unterrand
}
function sdfMagen(x, y, z) {
  var d = ell(x, y, z, 7.8, 109.6, -1.8, 5.0, 4.6, 4.6);                  // Fundus unter der linken Kuppel
  d = smin(d, kap(x, y, z, 7.6, 108, -1.4, 6.6, 101.6, 1.0, 4.4, 4.2), 3);    // Korpus
  d = smin(d, kap(x, y, z, 6.6, 101.6, 1.0, 2.5, 100.2, 3.0, 4.2, 3.0), 3);   // grosse Kurvatur unten
  d = smin(d, kap(x, y, z, 2.5, 100.2, 3.0, -2.0, 104.0, 3.2, 3.0, 1.7), 2);  // Antrum steigt zum Pfoertner
  return d;
}
/* Nieren aus dem Form-Baustein der Niere (organe/niere/niere-form.js; er wird mit dem Niere-Modul nachgeladen): Promise der Form, Wert null = einfacher Ersatz.
   Die Form liegt in anatomischen Achsen um die Mitte der linken Niere; die rechte Niere ist die gespiegelte linke (x -> -x), damit der Hilus zur Mitte zeigt. */
var nierenP = null, lungenP = null;
/* Mitte der Niere s (1 = links, -1 = rechts) */
function nierenMitte(s) { return [s * 7.5, s > 0 ? 105 : 102.5, -6.2]; }
function sdfNiere(s, form) {
  var m = nierenMitte(s), cx = m[0], cy = m[1], cz = m[2];
  if (form) return function (x, y, z) { return form.aussen(s * (x - cx), y - cy, z - cz); };
  return function (x, y, z) {
    var d = ell(x, y, z, cx, cy, cz, 2.7, 5.6, 2.3);
    return S.smax(d, -S.kugel(x, y, z, cx - s * 2.8, cy, cz, 1.5), 1.0);
  };
}
/* Gitter um die Niere s aus den Grenzen der Form (anatomisch um die Mitte; rechts gespiegelt) */
function nierenGrenzen(s, form) {
  var m = nierenMitte(s), g = form.grenzen;
  return [[s > 0 ? m[0] + g[0][0] : m[0] - g[1][0], m[1] + g[0][1], m[2] + g[0][2]],
    [s > 0 ? m[0] + g[1][0] : m[0] - g[0][0], m[1] + g[1][1], m[2] + g[1][2]]];
}
function sdfHirn(x, y, z) {
  var sx = x < 0 ? -x : x;
  var d = ell(sx, y, z, 2.6, 167.6, -1.6, 4.0, 5.8, 6.6);
  d = smin(d, ell(sx, y, z, 0, 159.6, -6.4, 3.8, 2.3, 2.8), 1.2);
  d = smin(d, kap(sx, y, z, 0, 160.5, -3.6, 0, 152, -4.2, 1.3, 1.0), 1.5);
  return d + 0.2 * Math.sin(2.6 * x + 0.7) * Math.sin(2.5 * y) * Math.sin(2.7 * z + 1.3);
}
/* Zwerchfell: dünne Kuppelfläche (zwei Kuppeln, Rand an den unteren Rippen) */
function zwerchfellGeo() {
  var g = new THREE.RingGeometry(0.02, 1, 56, 18), p = g.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var rx = p.getX(i), rz = p.getY(i);
    var x = 13.0 * rx, z = 0.6 + 9.4 * rz;
    var yd = Math.max(domY(x, z, -6.5, DOM_R), domY(x, z, 6.5, DOM_L));
    p.setXYZ(i, x, S.smax(yd, 106.5, 7), z);
  }
  g.computeVertexNormals();
  return g;
}
function sdfPankreas(x, y, z) {
  var d = kap(x, y, z, -4.5, 99, -1.2, -1, 100.2, -2.8, 2.3, 1.7);
  d = smin(d, kap(x, y, z, -1, 100.2, -2.8, 3.5, 102.2, -3.4, 1.7, 1.5), 1.5);
  return smin(d, kap(x, y, z, 3.5, 102.2, -3.4, 9.5, 105.5, -4.4, 1.5, 1.2), 1.5);
}
function sdfBlase(x, y, z) { return ell(x, y, z, 0, 83, 2.8, 3.2, 3.6, 3.0); }
function sdfGalle(x, y, z) { return smin(ell(x, y, z, -6.4, 101.0, 6.2, 1.5, 3.0, 1.5), kap(x, y, z, -6.0, 99, 5.6, -4.6, 97, 4.6, 0.35, 0.3), 0.6); }

/* Herz aus den Formbausteinen des Herz-Modells: ganzes Herz geschlossen (nur die Aussenform samt Gefaessstuempfen),
   Farben pro Vertex wie dort; keine Klappen, Faeden, Leitungsbahnen. Gibt das Mesh zurueck (noch nicht eingebaut). */
async function herzBauen(form, h) {
  var HS = form.sdf, C2 = {};
  var G = form.mesher.makeGrid([[-6.4, -6.6, -7.0], [6.6, 9.9, 3.7]], h);
  var T = await form.mesher.evalTissue(G, function (x, y, z) { HS.tissue(x, y, z, C2); return C2.outer; });
  if (abgebaut) return null;
  var smp = form.assemble.makeSampler(G, T);
  var P = form.mesher.surfaceNets(G, T), pos = P.positions, nv = pos.length / 3, col = new Float32Array(nv * 3);
  for (var v = 0; v < nv; v++) {
    var x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    var r = HS.classify(x, y, z);
    var c = form.assemble.colorFor(r, false, 0, HS.C, x, y, z);
    col[v * 3] = c[0]; col[v * 3 + 1] = c[1]; col[v * 3 + 2] = c[2];
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(P.index, 1));
  g.computeVertexNormals();
  var mesh = new THREE.Mesh(g, mat('kreislauf', 0xffffff, { vc: true, rough: 0.55, coat: 0.25, env: 0.3 }));
  mesh.position.set(HERZ_V[0], HERZ_V[1], HERZ_V[2]);
  /* Herzkranzgefaesse (Rohre auf der Oberflaeche) */
  var km = mat('kreislauf', 0xB02A22, { rough: 0.45, coat: 0.4, env: 0.3 });
  form.extras.coronaries().forEach(function (cr) {
    var curve = new THREE.CatmullRomCurve3(cr.pts.map(function (q) { return V(q[0], q[1], q[2]); }));
    var segs = Math.max(4, Math.round(cr.pts.length * 2.2)), rs = 7;
    var tg = new THREE.TubeGeometry(curve, segs, 1, rs, false), tp = tg.attributes.position, tn = tg.attributes.normal;
    for (var i = 0; i <= segs; i++) {
      var t = i / segs, rr = cr.r0 + (cr.r1 - cr.r0) * t, cp = curve.getPointAt(t);
      for (var k = 0; k <= rs; k++) { var id = i * (rs + 1) + k; tp.setXYZ(id, cp.x + tn.getX(id) * rr, cp.y + tn.getY(id) * rr, cp.z + tn.getZ(id) * rr); }
    }
    var tm = new THREE.Mesh(tg, km); tm.renderOrder = 2; tm.userData.sid = 'herzkranz'; STR.herzkranz.meshes.push(tm); mesh.add(tm);
  });
  return { mesh: mesh, smp: smp };
}

async function organe() {
  var b = function (x0, y0, z0, x1, y1, z1) { return [[x0, y0, z0], [x1, y1, z1]]; };
  var n = 0, N = 17;
  var weiter = function (t) { return setLoad(0.58 + 0.42 * (++n) / N, t); };
  var h = 0.6;
  /* Nerven */
  als('gehirn');
  await sdfMesh('nerven', mat('nerven', 0xE2C25A, { rough: 0.55, coat: 0.3 }), sdfHirn, b(-8.5, 149, -10.5, 8.5, 176, 9), 0.5);
  if (abgebaut) return; await weiter('Gehirn');
  als('rueckenmark');
  var zrd = [];
  for (var y = 150; y >= 100; y -= 7) zrd.push([0, y, zst(y) - interp(RWT, y) - 1.0]);
  rohr('nerven', mat('nerven', 0xE2C25A, { rough: 0.5 }), zrd, 0.5, 40);
  /* Sinne */
  var aw = mat('sinne', 0xEDE6DA, { rough: 0.3, coat: 0.6 }), ir = mat('sinne', 0x3D6FA8, { rough: 0.3, coat: 0.5 }), pu = mat('sinne', 0x111111, { rough: 0.4 });
  als('augen');
  [-1, 1].forEach(function (s) {
    kugelM('sinne', aw, s * 3.4, 161.8, 7.1, 1.25);
    ellM('sinne', ir, s * 3.4, 161.8, 8.15, 0.78, 0.78, 0.28);
    ellM('sinne', pu, s * 3.4, 161.8, 8.4, 0.34, 0.34, 0.12);
  });
  /* Hormon */
  als('schilddruese');
  var th = mat('hormon', 0x9C7BC6, { rough: 0.5, coat: 0.3 });
  [-1, 1].forEach(function (s) { ellM('hormon', th, s * 2.1, 145.2, 1.8, 1.3, 2.3, 1.1, [0, 0, s * 0.15]); });
  ellM('hormon', th, 0, 144.2, 2.2, 1.7, 0.6, 0.8);
  /* Kreislauf */
  var rot = mat('kreislauf', 0xC9483A, { rough: 0.45, coat: 0.5 }), blau = mat('kreislauf', 0x4F70B8, { rough: 0.45, coat: 0.4 });
  var hz = null, hform = await herzP;
  if (hform) {
    try { hz = await herzBauen(hform, klein ? 0.3 : 0.2); } catch (e) { console.warn('Herz-Modell konnte nicht eingebaut werden, einfaches Herz als Ersatz:', e); }
  } else console.warn('Herz-Modell nicht geladen, einfaches Herz als Ersatz.');
  if (abgebaut) return;
  var iliaka = function (s) { rohr('kreislauf', rot, [[1.8, 94, 0.2], [s * 4, 88.5, -1.0], [s * 6.5, 84.5, 0.5]], 0.7, 14); };
  if (hz) {
    als('herz'); dazu('kreislauf', hz.mesh); herzSmp = hz.smp;
    await weiter('Herz');
    /* Anschluss an die Gefaessstuempfe des Herzens (Herz-Koordinaten + HERZ_V) */
    als('aorta');
    rohr('kreislauf', rot, [[4.5, 125.2, -3.1], [4.9, 121, -3.9], [5.0, 118, -3.9], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]], 1.25, 80);
    [-1, 1].forEach(iliaka);
    rohr('kreislauf', rot, [[2.3, 130.2, 0.45], [2.5, 136, -0.4], [2.9, 143, -1.6], [3.0, 152, -1.8]], 0.55, 20);     // linke Halsschlagader
    rohr('kreislauf', rot, [[0.35, 130.2, 1.4], [-1.0, 135, 0.6], [-2.6, 143, -1.6], [-3.0, 152, -1.8]], 0.55, 20);   // rechte Halsschlagader
    rohr('kreislauf', rot, [[3.7, 130.2, -0.7], [7, 133, -0.5], [12, 138.5, 0.8]], 0.6, 14);                          // linke Schluesselbeinarterie
    rohr('kreislauf', rot, [[0.35, 130.2, 1.4], [-4, 133.2, 1.0], [-12, 138.5, 0.8]], 0.6, 14);                        // rechte Schluesselbeinarterie
    als('hohlvenen');
    rohr('kreislauf', blau, [[-1.65, 130.1, 1.6], [-1.9, 134, 0.9], [-2.1, 141, -0.2]], 1.0, 14);                      // obere Hohlvene nach oben
    rohr('kreislauf', blau, [[-1.65, 119.2, 0.65], [-1.9, 115, -0.3], [-2.2, 106, -2.2], [-2.4, 98, -2.4], [-2.0, 92, -1.6]], 1.1, 30);   // untere Hohlvene nach unten
    als('herz');
    var anschlussAb = STR.herz.meshes.length;   /* Stummel (samt Endkugeln) gehoeren nicht zum Detail-Herz */
    rohr('kreislauf', mat('kreislauf', 0x4F6CBF, { rough: 0.45, coat: 0.4 }), [[-2.3, 127.4, -1.15], [-5.5, 126.9, -1.6]], 0.9, 10);      // rechte Lungenarterie bis zum Hilus
    var pvm = mat('kreislauf', 0xC04C43, { rough: 0.45, coat: 0.4 });
    rohr('kreislauf', pvm, [[1.7, 126, -1.55], [-1.5, 125.4, -1.9], [-5.6, 123.8, -1.9]], 0.62, 16);                    // rechte Lungenvenen
    rohr('kreislauf', pvm, [[1.7, 124.1, -1.6], [-1.2, 124.3, -2.0]], 0.62, 10);
    STR.herz.meshes.slice(anschlussAb).forEach(function (o) { o.userData.anschluss = true; });
  } else {
    als('herz');
    await sdfMesh('kreislauf', rot, sdfHerz, b(-6, 108, -3, 14, 132, 10), h);
    if (abgebaut) return; await weiter('Herz');
    als('aorta');
    rohr('kreislauf', rot, [[2.6, 122.5, 1.4], [2.6, 127, 1.0], [2.2, 132, 0.4], [1.6, 135.6, -0.8], [2.8, 135.8, -2.4], [4.4, 133.8, -3.8],
      [5.2, 129.5, -4.3], [5.2, 124, -4.2], [5.0, 118, -3.6], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]], 1.25, 80);
    [-1, 1].forEach(function (s) {
      iliaka(s);
      rohr('kreislauf', rot, [[s * 2.4, 135.4, -0.6], [s * 2.8, 143, -1.6], [s * 3.0, 152, -1.8]], 0.55, 20);
    });
    als('hohlvenen');
    rohr('kreislauf', blau, [[-1.3, 129, 2.2], [-1.8, 135, 1.0], [-2.0, 141, -0.2]], 1.0, 14);
    rohr('kreislauf', blau, [[-1.0, 118.5, 1.6], [-1.6, 112, -0.5], [-2.2, 106, -2.2], [-2.4, 98, -2.4], [-2.0, 92, -1.6]], 1.1, 30);
  }
  /* Atmung */
  als('luftroehre');
  var ros = mat('atmung', 0xE39AA4, { rough: 0.55, coat: 0.35, coatRough: 0.4 });
  var lu = mat('atmung', 0xE39AA4, { rough: 0.5 });
  rohr('atmung', lu, [[0, 150, -0.6], [0, 140, -1.4], [0, 134, -2.2], [0, 128.5, -3.3]], 1.0, 24);
  [-1, 1].forEach(function (s) {
    rohr('atmung', lu, [[0, 128.5, -3.3], [s * 3.2, 126, -3.3], [s * 6.2, 123, -2.5]], 0.7, 14);
    rohr('atmung', lu, [[s * 6.2, 123, -2.5], [s * 9, 127, -1.5]], 0.45, 8);
    rohr('atmung', lu, [[s * 6.2, 123, -2.5], [s * 9.5, 118, -1.0]], 0.45, 8);
  });
  als('lunge');
  var lh = herzSmp ? { smp: herzSmp, v: HERZ_V } : null;   // Herzbucht nach dem Herzen, falls vorhanden
  var lm = mat('atmung', 0xE39AA4, { rough: 0.5, coat: 0.3, coatRough: 0.45 });
  await sdfMesh('atmung', lm, LF.lunge(-1, lh), LF.grenzen(-1), h);
  if (abgebaut) return; await weiter('Lungen');
  await sdfMesh('atmung', lm, LF.lunge(1, lh), LF.grenzen(1), h);
  if (abgebaut) return; await weiter('Lungen');
  als('zwerchfell');
  var zw = mat('atmung', 0xB5655A, { rough: 0.6, opacity: 0.3, side: THREE.DoubleSide });
  dazu('atmung', new THREE.Mesh(zwerchfellGeo(), zw));
  await weiter('Zwerchfell');
  /* Verdauung */
  als('speiseroehre');
  rohr('verdauung', mat('verdauung', 0xD99A8A, { rough: 0.5, coat: 0.3 }), [[0, 148, -3.0], [0, 140, -3.6], [0.3, 130, -3.6], [0.9, 122, -3.4], [1.6, 115, -2.8], [2.4, 110.5, -1.5], [3.8, 107.6, 1.0]], 0.8, 40);
  als('leber');
  var le = mat('verdauung', 0x8B3A2E, { rough: 0.45, coat: 0.5 });
  await sdfMesh('verdauung', le, sdfLeber, b(-15, 97, -10, 14, 119, 11), h);
  if (abgebaut) return; await weiter('Leber');
  als('magen');
  await sdfMesh('verdauung', mat('verdauung', 0xE8B48E, { rough: 0.5, coat: 0.4 }), sdfMagen, b(-6, 94, -7, 14, 115, 8), h);
  if (abgebaut) return; await weiter('Magen');
  als('gallenblase');
  await sdfMesh('verdauung', mat('verdauung', 0x5E9A4A, { rough: 0.4, coat: 0.5 }), sdfGalle, b(-10, 92, 0, -1, 106, 9), 0.4);
  if (abgebaut) return; await weiter('Gallenblase');
  als('pankreas');
  await sdfMesh('verdauung', mat('verdauung', 0xE8C27A, { rough: 0.6 }), sdfPankreas, b(-8, 96, -8, 12, 109, 2), 0.45);
  if (abgebaut) return; await weiter('Bauchspeicheldrüse');
  als('duenndarm');
  rohr('verdauung', mat('verdauung', 0xE3A58C, { rough: 0.5, coat: 0.35 }), [[-2.0, 104.0, 3.2], [-3.4, 105, 1.6], [-5.8, 103.6, -0.2], [-7.0, 100, -0.8], [-6.6, 96.6, -0.8], [-3.6, 94.8, -0.6], [0, 95.6, -0.5]], 1.0, 50);
  als('milz');
  ellM('kreislauf', mat('kreislauf', 0x7A2F4F, { rough: 0.5, coat: 0.4 }), 9.2, 108, -5.2, 2.3, 4.8, 3.2, [0.1, 0.2, -0.15]);
  /* Duenndarm: Schlingen in vier Lagen */
  als('duenndarm');
  var dd = [], r, k;
  for (r = 0; r < 4; r++) {
    var yy = 95.5 - 2.5 * r;
    for (k = 0; k <= 8; k++) {
      var t = r % 2 ? 8 - k : k;
      dd.push([-8 + 2 * t + (k % 2 ? 0.6 : -0.6), yy + (k % 2 ? 0.5 : -0.5), 3.5 + 1.8 * Math.sin(k * 1.9 + r * 1.3)]);
    }
  }
  rohr('verdauung', mat('verdauung', 0xE3A58C, { rough: 0.5, coat: 0.35 }), dd, 1.2, 420);
  /* Dickdarm: Rahmen um den Duenndarm */
  als('dickdarm');
  var dk = mat('verdauung', 0xB8775A, { rough: 0.55, coat: 0.3 });
  rohr('verdauung', dk, [[-11.2, 89.5, 0.5], [-11.5, 95, 0], [-11.6, 100, -0.5], [-10.8, 103.4, 0.8], [-8.5, 102, 4], [-6, 99.6, 6.4], [-1, 98.6, 7], [4, 99.6, 6.8],
    [8, 103, 4], [10.8, 106.5, -2.5], [11.8, 102, -2.6], [11.8, 95, -2.6], [11, 89.5, -2], [8.5, 86.3, 0], [5, 85.2, 1.6], [2, 86.2, 0.2], [0.6, 84, -2.4], [0.3, 81.5, -4.8], [0, 79.5, -6]], 1.8, 260);
  kugelM('verdauung', dk, -11.3, 89.2, 0.5, 2.4);
  /* Harn */
  var nform = await nierenP;   // null: Form nicht geladen, dann einfache Nieren als Ersatz
  if (abgebaut) return;
  als('nieren');
  var ni = mat('harn', 0x9C4A3A, { rough: 0.5, coat: 0.45 });
  var niR = mat('harn', 0x9C4A3A, { rough: 0.5, coat: 0.45 });   /* eigenes Material der rechten Niere: sie blendet bei der Fahrt zur linken Niere mit aus */
  var nierR = await sdfMesh('harn', niR, sdfNiere(-1, nform), nform ? nierenGrenzen(-1, nform) : b(-12, 94, -11, -3, 111, -1), 0.5);
  if (abgebaut) return; await weiter('Nieren');
  nierR.userData.anschluss = true;   /* gehoert zur Struktur, aber nicht zum Detailmodell der linken Niere */
  await sdfMesh('harn', ni, sdfNiere(1, nform), nform ? nierenGrenzen(1, nform) : b(3, 96, -11, 12, 113, -1), 0.5);
  if (abgebaut) return; await weiter('Nieren');
  als('harnleiter');
  var ur = mat('harn', 0xD9B44A, { rough: 0.5 });
  [-1, 1].forEach(function (s) {
    /* Anfang aus der Form: Nierenbecken und Austritt aus dem Hilus (rechts gespiegelt); ohne Form wie bisher ein Punkt.
       Die uebrigen Punkte gelten fuer beide Faelle; Segmentzahl des Rohrs fest, es entsteht kein weiteres Objekt */
    var m = nierenMitte(s), a = nform ? nform.harnleiterKoerper : null;
    var anfang = a ? a.map(function (p) { return [m[0] + s * p[0], m[1] + p[1], m[2] + p[2]]; }) : [[s * 5.8, 101 + (s < 0 ? -2.5 : 0), -5]];
    rohr('harn', ur, anfang.concat([[s * 5.3, 95, -4.8], [s * 5, 88, -3.5], [s * 4, 84, -0.5], [s * 2.6, 83.6, 2.4]]), 0.28, 40);
  });
  als('harnblase');
  await sdfMesh('harn', mat('harn', 0xD9B44A, { rough: 0.4, coat: 0.5 }), sdfBlase, b(-6, 77, -3, 6, 90, 8), 0.5);
  if (abgebaut) return; await weiter('Harnblase');
}

/* =====================================================================
   6. Aufbau
   ===================================================================== */
var t0;
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var App = window.KoerperApp = { ready: false, ar: false, aufbauMs: 0, modus: systemModus, systemModus: systemModus, waehle: waehle, oeffnen: oeffnen, ansicht: ansicht, ansichtWaehlen: function (i) { gehe(i); } };
async function bauen() {
  await setLoad(0.02, 'Körperhülle wird geformt'); if (abgebaut) return;
  /* Herz-Modell nur als Skript nachladen (ohne Gestaltung); Fehler werden erst beim Herz-Schritt behandelt */
  herzP = Kern.organLaden('herz', { ohneCss: true }).then(function (o) { return o.form || null; }, function (e) { console.warn(e && e.message || e); return null; });
  /* Niere-Modell nur als Skript nachladen (ohne Gestaltung; zuerst die Form, die der Koerper ohnehin braucht); ohne Modul bleibt die Form, ohne Form gilt der Ersatz */
  nierenP = Kern.organLaden('niere', { ohneCss: true }).then(function () { return Kern.Formen.niere || null; },
    function (e) { console.warn(e && e.message || e); return Kern.Formen && Kern.Formen.niere || null; });
  /* Form der Lunge (Brustkorb, Rippen, Zwerchfellkuppel, Lungenfluegel): ohne sie kein Koerper, ein Ladefehler bricht den Aufbau ab */
  lungenP = Kern.formLaden('lunge'); lungenP.catch(function () {});
  t0 = performance.now();   /* Aufbauzeit ohne das Warten des Browsers vor dem ersten Schritt */
  als('haut');
  var hm = glasMat('haut', 0xE0C3A8, 0.2, 0.85, 1.7);
  hm.emissive.copy(Kern.srgb(0xE0C3A8)).multiplyScalar(0.8);   /* Eigenleuchten in Hautfarbe: liest sich vor dem dunklen Grund als Haut */
  await sdfMesh('haut', hm, huelle, [[-44, -1, -17], [44, 179, 19]], klein ? 1.6 : 1.2, function (f) { return setLoad(0.02 + f * 0.4); });
  if (abgebaut) return;
  await setLoad(0.45, 'Skelett'); if (abgebaut) return;
  LF = await lungenP; if (abgebaut) return;
  RIP_R = LF.RIP_R; RIP_YA = LF.RIP_YA; domY = LF.domY; DOM_R = LF.DOM_R; DOM_L = LF.DOM_L;
  skelett();
  await setLoad(0.58, 'Organe'); if (abgebaut) return;
  await organe(); if (abgebaut) return;
}

/* =====================================================================
   6b. Bedienung: Leiste (Organsysteme, Strukturen), Auswahl, Infokarte
   ===================================================================== */
var gewaehlt = null, rows = {}, sysRows = {}, hl = [], lv = 0;   /* lv: Version fuer die Beschriftung (Auswahl, Systemmodus, Schalter) */
var hlMat = new THREE.MeshBasicMaterial({ color: 0xE0A94A, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending,
  depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
function hex6(c) { return '#' + c.toString(16).padStart(6, '0'); }
var MODI = [['an', 'an', 'sichtbar'], ['glas', 'glas', 'durchsichtig'], ['aus', 'aus', 'ausgeblendet']];

/* Hervorhebung: Deckschicht in Messing auf den Meshes der Struktur (Materialien sind zwischen Strukturen geteilt) */
function hervorheben(id) {
  hl.forEach(function (o) { if (o.parent) o.parent.remove(o); });
  hl = [];
  if (!id) return;
  STR[id].meshes.forEach(function (m) {
    var o = new THREE.Mesh(m.geometry, hlMat);
    o.raycast = function () {}; o.userData.hl = true; o.renderOrder = 30;
    m.add(o); hl.push(o);
  });
}
function waehle(id) {
  if (fz) return;
  if (id && (!STR[id] || SYS[STR[id].def.system].modus === 'aus')) id = null;
  gewaehlt = id; lv++;
  hervorheben(id);
  Object.keys(rows).forEach(function (k) { rows[k].classList.toggle('sel', k === id); });
  var box = $('info');
  if (!id) { box.classList.remove('show'); return; }
  var d = STR[id].def;
  $('iKick').textContent = SYS[d.system].def.name;
  $('iDe').textContent = d.de;
  $('iLat').textContent = d.lat;
  $('iTx').textContent = d.text;
  $('iOpen').style.display = '';
  $('iOpen').disabled = !d.oeffnen;
  $('iOpen').textContent = d.oeffnen ? (d.knopf || 'Detailmodell öffnen') : 'Detailmodell in Arbeit';
  box.classList.add('show');
  if (rows[id]) rows[id].scrollIntoView({ block: 'nearest' });
}
/* Schalter eines Systems (an | glas | aus), Liste und Auswahl nachziehen */
function systemModus(id, m) {
  if (!SYS[id]) return;
  modus(id, m); lv++;
  var r = sysRows[id];
  if (r) {
    r.classList.toggle('off', SYS[id].modus === 'aus');
    Array.prototype.forEach.call(r.querySelectorAll('.seg button'), function (b) { b.classList.toggle('on', b.dataset.m === SYS[id].modus); });
  }
  STRUKTUREN.forEach(function (d) { if (d.system === id && rows[d.id]) rows[d.id].classList.toggle('off', SYS[id].modus === 'aus'); });
  if (gewaehlt && STR[gewaehlt].def.system === id && SYS[id].modus === 'aus') waehle(null);
}

(function leiste() {
  var railRoot = $('rail');
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var paneS = document.createElement('div'), paneT = document.createElement('div'); paneT.style.display = 'none';
  var panes = [paneS, paneT];
  [['Organsysteme', paneS], ['Strukturen', paneT]].forEach(function (t, k) {
    var b = document.createElement('button');
    b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = t[0];
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  railRoot.appendChild(tabs); railRoot.appendChild(paneS); railRoot.appendChild(paneT);

  /* Reiter Organsysteme: je System ein dreistufiger Schalter */
  var alle = document.createElement('div'); alle.className = 'sysall';
  var ab = document.createElement('button'); ab.className = 'gh'; ab.id = 'bAlle'; ab.textContent = 'Alle sichtbar';
  ab.addEventListener('click', function () { SYSTEME.forEach(function (d) { systemModus(d.id, 'an'); }); });
  alle.appendChild(ab); paneS.appendChild(alle);
  var wrapS = document.createElement('div'); wrapS.className = 'grp'; paneS.appendChild(wrapS);
  SYSTEME.forEach(function (d) {
    var row = document.createElement('div'); row.className = 'row sys'; row.id = 'sys-' + d.id;
    row.innerHTML = '<span class="sw dot"></span><span class="nm"><b></b></span><span class="seg"></span>';
    row.querySelector('.sw').style.background = hex6(d.farbe);
    row.querySelector('b').textContent = d.name;
    var seg = row.querySelector('.seg');
    MODI.forEach(function (m) {
      var b = document.createElement('button');
      b.textContent = m[1]; b.title = d.name + ': ' + m[2]; b.dataset.m = m[0];
      b.setAttribute('aria-label', d.name + ' ' + m[2]);
      if (m[0] === 'an') b.className = 'on';
      b.addEventListener('click', function () { systemModus(d.id, m[0]); });
      seg.appendChild(b);
    });
    sysRows[d.id] = row; wrapS.appendChild(row);
  });

  /* Reiter Strukturen: nach System gruppiert */
  SYSTEME.forEach(function (sd) {
    var wrap = document.createElement('div'); wrap.className = 'grp';
    var h = document.createElement('h2'); h.textContent = sd.name; wrap.appendChild(h);
    STRUKTUREN.filter(function (d) { return d.system === sd.id; }).forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'row'; row.id = 'row-' + d.id; row.tabIndex = 0;
      row.innerHTML = '<span class="sw dot"></span><span class="nm"><b></b><i></i></span>' + (d.oeffnen ? '<span class="mdl" title="Detailmodell vorhanden">3D</span>' : '');
      row.querySelector('.sw').style.background = hex6(sd.farbe);
      row.querySelector('b').textContent = d.de;
      row.querySelector('i').textContent = d.lat;
      function wahl() {
        if (SYS[sd.id].modus === 'aus') systemModus(sd.id, 'an');
        waehle(d.id);
      }
      row.addEventListener('click', wahl);
      row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wahl(); } });
      rows[d.id] = row; wrap.appendChild(row);
    });
    paneT.appendChild(wrap);
  });
})();

$('bCls').onclick = function () { waehle(null); };
$('iOpen').onclick = function () { oeffnen(gewaehlt); };
function taste(e) { if (fz) return; if (e.key === 'Escape') waehle(null); }
document.addEventListener('keydown', taste);

/* Antippen im 3D: nur sichtbare Systeme; durchsichtige und die Haut zaehlen nur, wenn nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged || fz) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(wurzel.children, true), treffer = null, glas = null, haut = false;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = null;
    if (o.userData.hl) continue;
    for (var q = o; q && !sid; q = q.parent) sid = q.userData.sid;
    if (!sid || !STR[sid]) continue;
    var m = SYS[STR[sid].def.system].modus;
    if (m === 'aus') continue;
    if (sid === 'haut') haut = true;
    else if (m === 'glas') glas = glas || sid;   /* durchsichtige Systeme verdecken nichts */
    else treffer = sid;
  }
  waehle(treffer || glas || (haut ? 'haut' : null));
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   7. Kamera: Ausschnitte, freier Bildbereich, Renderschleife
   ===================================================================== */
var view = { theta: 0, phi: PI / 2, dist: 290, target: V(0, 88, 0) };
var orbit = Kern.orbit(canvas, view, { minDist: 25, maxDist: 520 });
var kamAlt = { near: camera.near, far: camera.far };
camera.near = 2; camera.far = 1200; camera.updateProjectionMatrix();
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen;
   halb = halbe Koerperbreite (cm), die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Ganzkörper', theta: 0, target: V(0, 88, 0), ext: [90, 184], halb: 42 },
  { name: 'Kopf/Hals', theta: 0, target: V(0, 157, 0), ext: [44, 42], halb: 20 },
  { name: 'Brustkorb', theta: 0, target: V(0, 124.5, 0), ext: [40, 44], halb: 18 },
  { name: 'Bauch', theta: 0, target: V(0, 101.5, 0), ext: [36, 36], halb: 18 },
  { name: 'Becken', theta: 0, target: V(0, 92.5, 0), ext: [36, 32], halb: 18 },
  { name: 'Rücken', theta: PI, target: V(0, 88, 0), ext: [90, 184], halb: 42 }
];
var aktiv = 0, fitDist = 0;

/* Freier Bereich fuer Koerper und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
function bereich(w, h) {
  if (w < 1000) {
    var tt = $('tools').getBoundingClientRect().top;
    return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (tt > 100 ? tt : h * 0.6) - 6), labW: 104, fit: 30 };   /* fit: Platz je Seite, den die Beschriftung beim Einpassen abzieht (sie darf auf dem Handy den Koerperrand ueberdecken) */
  }
  return { x0: 330, x1: w - 22, y0: Math.max(76, Math.ceil($('tools').getBoundingClientRect().bottom) + 6), y1: h - 30, labW: 142, fit: 100 };
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
  /* kuerzester Weg beim Drehen (Vorder- <-> Rueckansicht) */
  var th = a.theta, dth = th - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
  orbit.anim = Kern.fahrt(view, { theta: view.theta + dth, phi: PI / 2, dist: d, target: a.target }, 700);
  fitDist = d;
  lv++;
}
for (var ci = 0; ci < AUSSCHNITTE.length; ci++) (function (i) { $('cam' + i).onclick = function () { gehe(i); }; })(ci);

function groesse(w, h) {
  if (inAR) return;   /* in AR bestimmt die Sitzung die Kamera */
  var r = bereich(w, h), a = AUSSCHNITTE[aktiv];
  camera.setViewOffset(w, h, w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2, w, h);
  camera.updateProjectionMatrix();
  var d = distFuer(a, w, h);
  if (!fitDist || (!orbit.anim && Math.abs(view.dist - fitDist) < 1e-6)) view.dist = d;
  fitDist = d;
  /* Infokarte auf dem Handy ueber der Werkzeugleiste */
  $('info').style.bottom = w < 1000 ? (h - $('tools').getBoundingClientRect().top + 8) + 'px' : '';
  Kern.linienFlaeche($('leaders'), w, h);
  lv++;
}
function ansicht(theta, phi, dist, target) {
  if (theta !== undefined) view.theta = theta * PI / 180;
  if (phi !== undefined) view.phi = phi * PI / 180;
  if (dist !== undefined) view.dist = dist;
  if (target) view.target.set(target[0], target[1], target[2]);
  orbit.anim = null;
}

/* =====================================================================
   8. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt,
   wenn sich die Ansicht aendert. Je Ausschnitt eine eigene Auswahl.
   ===================================================================== */
/* Ankerpunkt je Struktur (x, y, z in cm; x > 0 = linke Koerperseite) */
var ANKER = {
  gehirn: [-3, 166, 1], schaedel: [-6.6, 168, 0], augen: [-3, 161.8, 8.4], rueckenmark: [0, 146, -6],
  schilddruese: [2.3, 145, 2.6], luftroehre: [0, 132, 0], speiseroehre: [1.5, 124, -2.5],
  herz: [3, 124, 5], herzkranz: [4.2, 121, 5], lunge: [-9, 128, 5], zwerchfell: [-8, 112, 8],
  brustkorb: [-11, 134, 9], aorta: [3.1, 128.9, 1.4], hohlvenen: [-2.2, 132, 1],
  leber: [-8, 110, 7], gallenblase: [-6.3, 100, 7.5], magen: [9, 106, 6], milz: [10, 108, -6],
  pankreas: [3, 101, 1], duenndarm: [-1, 92, 6], dickdarm: [-11, 93, 8], nieren: [8, 104, -6],
  harnleiter: [-4.5, 92, -1], harnblase: [0, 83, 5.5], wirbelsaeule: [0, 96, -8], becken: [-13.5, 88, 5]
};
var HANDYNAME = { pankreas: 'Pankreas', herzkranz: 'Koronargef\u00e4\u00dfe', luftroehre: 'Luftr\u00f6hre' };   /* kuerzere Namen, wo die Spalte auf dem Handy schmal ist */
var KURZ = { aorta: 'Aorta', luftroehre: 'Luftröhre', pankreas: 'Bauchspeicheldrüse' };
/* je Ausschnitt: Strukturen in der Beschriftung; [id, x, y, z] ersetzt den Standardanker */
var LISTEN = [
  ['gehirn', 'schilddruese', 'herz', 'lunge', 'leber', 'magen', 'duenndarm', 'dickdarm', 'nieren', 'harnblase', 'wirbelsaeule', 'becken'],
  ['gehirn', 'augen', 'schaedel', 'rueckenmark', 'schilddruese', 'luftroehre', 'speiseroehre', ['aorta', -3.6, 148, 0.5], ['hohlvenen', -2.4, 140, 1]],
  ['herz', 'lunge', 'luftroehre', 'speiseroehre', ['aorta', 3.1, 128.9, 1.4], 'hohlvenen', 'zwerchfell', 'brustkorb', 'herzkranz'],
  ['leber', 'gallenblase', 'magen', 'milz', 'pankreas', 'duenndarm', 'dickdarm', 'nieren', ['aorta', 1.5, 100, -3]],
  ['harnblase', 'harnleiter', 'dickdarm', 'becken', 'wirbelsaeule'],
  ['wirbelsaeule', 'rueckenmark', 'nieren', 'milz', ['lunge', 8, 128, -6], 'becken']
];
var labelBox = $('labels'), leaderSvg = $('leaders');
var LAB = {};   /* Struktur-id -> { el, ln, dot } */
var zeigeLabels = true, lastKey = '';
LISTEN.forEach(function (l) {
  l.forEach(function (e) {
    var id = typeof e === 'string' ? e : e[0];
    if (LAB[id]) return;
    var d = STR[id].def, b = Kern.beschriftung(labelBox, leaderSvg, KURZ[id] || d.de, d.lat);
    b.el.style.pointerEvents = 'auto'; b.el.style.cursor = 'pointer';
    b.el.onclick = function () {
      if (SYS[d.system].modus === 'aus') systemModus(d.system, 'an');
      waehle(id);
    };
    b.nm = b.el.querySelector('b'); b.de = KURZ[id] || d.de;
    LAB[id] = b;
  });
});
$('bLab').onclick = function () {
  zeigeLabels = !zeigeLabels;
  this.classList.toggle('on', zeigeLabels);
  labelBox.style.display = (zeigeLabels && !inAR) ? '' : 'none';   /* in AR bleibt die HTML-Ebene aus */
  leaderSvg.style.display = (zeigeLabels && !inAR) ? '' : 'none';
  lv++;
};

var pv = new THREE.Vector3();
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(2), view.target.y.toFixed(2), w, h, lv, aktiv].join('|');
  if (key === lastKey) return;
  lastKey = key;
  var narrow = w < 1000, r = bereich(w, h), a = AUSSCHNITTE[aktiv], th = Math.tan(camera.fov * PI / 360);
  var pxcm = h / (2 * view.dist * th), cx = (r.x0 + r.x1) / 2;
  var colL = Math.min(cx - 20, Math.max(r.x0 + r.labW + 4, cx - a.halb * pxcm - 12));
  var colR = Math.max(cx + 20, Math.min(r.x1 - r.labW - 4, cx + a.halb * pxcm + 12));
  var topL = narrow ? r.y0 : 30, topR = narrow ? r.y0 : $('tools').getBoundingClientRect().bottom + 16;
  var botL = narrow ? r.y1 - 6 : h - 40, botR = botL;
  if (!narrow && $('info').classList.contains('show')) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [], shown = {};
  var ls = LISTEN[aktiv];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  ls.forEach(function (e) {
    var id = typeof e === 'string' ? e : e[0], p = typeof e === 'string' ? ANKER[id] : [e[1], e[2], e[3]];
    if (SYS[STR[id].def.system].modus === 'aus') return;
    if (narrow && gewaehlt) return;   /* Handy: die Infokarte deckt den Koerper, ohne Beschriftung bleibt er frei */
    pv.set(p[0], p[1], p[2]).project(camera);
    if (pv.z > 1) return;
    var sx = (pv.x * 0.5 + 0.5) * w, sy = (-pv.y * 0.5 + 0.5) * h;
    items.push({ id: id, sx: sx, sy: sy });
  });
  /* Seite: nach Lage zur Koerperachse; fast mittige Anker gleichen die Spalten aus */
  var nl = 0, nr = 0;
  items.forEach(function (it) { it.dx = it.sx - cx; if (it.dx < -8) { it.side = 'l'; nl++; } else if (it.dx > 8) { it.side = 'r'; nr++; } });
  items.filter(function (it) { return !it.side; }).sort(function (p, q) { return p.sy - q.sy; }).forEach(function (it) {
    if (nl <= nr) { it.side = 'l'; nl++; } else { it.side = 'r'; nr++; }
  });
  ['l', 'r'].forEach(function (side) {
    var g = items.filter(function (it) { return it.side === side; }).sort(function (p, q) { return p.sy - q.sy; });
    var top = side === 'l' ? topL : topR, bot = side === 'l' ? botL : botR, gp = g.length > 1 ? Math.min(gap, (bot - top) / (g.length - 1)) : gap, y = top;
    g.forEach(function (it) { it.ly = Math.max(y, Math.min(bot, it.sy)); y = it.ly + gp; });
    var over = y - gp - bot;
    if (over > 0) g.forEach(function (it) { it.ly -= over; });
  });
  var sichtbarSel = items.some(function (it) { return it.id === gewaehlt; });
  items.forEach(function (it) {
    var b = LAB[it.id], lx = it.side === 'l' ? colL : colR;
    b.el.style.display = ''; b.ln.style.display = ''; b.dot.style.display = '';
    b.nm.textContent = narrow && HANDYNAME[it.id] || b.de;
    b.el.className = 'lbl ' + it.side + ((sichtbarSel && it.id !== gewaehlt) ? ' dim' : '') + (it.id === gewaehlt ? ' sel' : '');
    b.el.style.left = lx + 'px'; b.el.style.top = it.ly + 'px';
    b.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    b.ln.setAttribute('points', it.sx + ',' + it.sy + ' ' + (ex + (it.side === 'l' ? 16 : -16)) + ',' + it.ly + ' ' + ex + ',' + it.ly);
    b.dot.setAttribute('cx', it.sx); b.dot.setAttribute('cy', it.sy);
  });
}

/* =====================================================================
   9. Kamerafahrt zum Organ (Knopf der Infokarte): alles ausser dem Organ blendet aus,
   die Kamera landet in der Startansicht des Detailmodells, dann wird die Adresse gesetzt
   ===================================================================== */
/* Ziel je Struktur: Kamera in Koerper-Koordinaten (cm); ext = Breite und Hoehe (cm), die im freien Bereich Platz finden sollen */
var ZIELE = {
  herz: { theta: 0, phi: 1.52, dist: 34.5, target: [0.4 + HERZ_V[0], 1.0 + HERZ_V[1], -1.2 + HERZ_V[2]] },   /* Startansicht des Herz-Modells (Ersatz, wenn das Herz-Modul fehlt) */
  nieren: { phi: PI / 2, ext: [16, 24], target: [7.5, 104.5, -6] }   /* linke Niere (x > 0) von vorn, senkrecht auf die Schnittflaeche (Ersatz, wenn das Niere-Modul fehlt); theta s. zielFuer */
};
var fz = null;   /* laufende Fahrt */
function zielFuer(id, w, h) {
  var z = ZIELE[id], r = bereich(w, h), versatz = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2];
  var hz = Kern.Organe && Kern.Organe.herz, ni = Kern.Organe && Kern.Organe.niere;
  if (id === 'herz' && hz && hz.start) {
    var st = hz.start(w, h);
    return { theta: st.theta, phi: st.phi, dist: st.dist, target: V(st.target[0] + HERZ_V[0], st.target[1] + HERZ_V[1], st.target[2] + HERZ_V[2]), versatz: st.versatz };
  }
  if (id === 'nieren' && ni && ni.start) {   /* Startansicht der Niere, um die Mitte der linken Niere im Koerper verschoben */
    var sn = ni.start(w, h), nm = nierenMitte(1);
    return { theta: sn.theta, phi: sn.phi, dist: sn.dist, target: V(sn.target[0] + nm[0], sn.target[1] + nm[1], sn.target[2] + nm[2]), versatz: sn.versatz };
  }
  var nf = Kern.Formen && Kern.Formen.niere;
  if (id === 'nieren') return { theta: (nf ? nf.LAGE.dreh : 25) * PI / 180, phi: z.phi, dist: distFuer(z, w, h), target: V(z.target[0], z.target[1], z.target[2]), versatz: versatz };
  return { theta: z.theta, phi: z.phi, dist: z.dist || distFuer(z, w, h), target: V(z.target[0], z.target[1], z.target[2]), versatz: versatz };
}
/* Vorheriges Detailmodell (umg.von) -> Struktur, in deren Nahbild der Koerper beim Zurueckkommen startet */
var VON = { herz: 'herz', niere: 'nieren', nephron: 'nieren' };
/* Alles ausser der Zielstruktur zum Ausblenden vorbereiten (Hin- und Rueckfahrt); merkt die Ursprungswerte */
function ausblendVorbereiten(id) {
  /* Material der Zielstruktur (samt Kindern) bleibt; alles andere blendet aus (Materialien sind zwischen Strukturen geteilt) */
  var zielObj = new Set(), keep = new Set(), ausMat = new Map(), altT = new Map(), ausObj = [], sofort = [];
  /* userData.anschluss: gehoert zur Struktur, aber nicht zum Detailmodell (Lungengefaessstummel, rechte Niere) - blendet mit aus */
  STR[id].meshes.forEach(function (m) { if (m.userData.anschluss) return; m.traverse(function (o) { zielObj.add(o); if (o.material) [].concat(o.material).forEach(function (x) { keep.add(x); }); }); });
  wurzel.traverse(function (o) {
    if (zielObj.has(o) || !o.material || !o.visible) return;
    var ms = [].concat(o.material), frei = true;
    ms.forEach(function (x) { if (keep.has(x)) frei = false; });
    if (!frei) { o.visible = false; sofort.push(o); return; }   /* teilt ein Material mit dem Organ: sofort weg */
    ausObj.push(o);
    ms.forEach(function (x) { if (!ausMat.has(x)) { ausMat.set(x, x.opacity); altT.set(x, x.transparent); x.transparent = true; x.needsUpdate = true; } });
  });
  var ui = Array.prototype.slice.call(umg.bereich.children);
  var altUi = ui.map(function (e) { return { op: e.style.opacity, pe: e.style.pointerEvents }; });
  ui.forEach(function (e) { e.style.pointerEvents = 'none'; });
  canvas.style.pointerEvents = 'none';
  labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
  return { mats: ausMat, altT: altT, obj: ausObj, sofort: sofort, ui: ui, altUi: altUi, fertig: false };
}
function oeffnen(id) {
  var d = id && STR[id] && STR[id].def;
  if (fz || abgebaut || !d || !d.oeffnen || !ZIELE[id]) return;
  var w = window.innerWidth, h = window.innerHeight, ziel = zielFuer(id, w, h), r = bereich(w, h);
  var dth = ziel.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI; ziel.theta = view.theta + dth;
  hervorheben(null);
  var f = ausblendVorbereiten(id);
  orbit.anim = Kern.fahrt(view, { theta: ziel.theta, phi: ziel.phi, dist: ziel.dist, target: ziel.target }, 1200);
  f.hin = true; f.id = id; f.adresse = d.oeffnen; f.a = orbit.anim;
  f.von = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2]; f.nach = ziel.versatz;
  fz = f;
}
/* Rueckkehr aus dem Detailmodell: Koerper steht im Nahbild der Struktur, alles andere ist ausgeblendet; die Fahrt zur Ganzkoerperansicht beginnt nach 450 ms */
function rueckkehr(id) {
  var w = window.innerWidth, h = window.innerHeight, ziel = zielFuer(id, w, h), r = bereich(w, h);
  var f = ausblendVorbereiten(id);
  f.mats.forEach(function (op, m) { m.opacity = 0; });
  f.ui.forEach(function (e) { e.style.opacity = '0'; });
  f.obj.forEach(function (o) { o.visible = false; });
  view.theta = ziel.theta; view.phi = ziel.phi; view.dist = ziel.dist; view.target.copy(ziel.target);
  orbit.anim = null;
  f.hin = false; f.id = id; f.a = null; f.warte = performance.now() + 450;
  f.von = ziel.versatz; f.nach = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2];
  camera.setViewOffset(w, h, f.von[0], f.von[1], w, h);
  camera.updateProjectionMatrix();
  fz = f;
}
function rueckEnde() {   /* Ursprungszustand wie nach einem normalen Aufbau */
  var w = window.innerWidth, h = window.innerHeight, r = bereich(w, h), a0 = AUSSCHNITTE[0], d = distFuer(a0, w, h);
  fz.mats.forEach(function (op, m) { m.opacity = op; if (m.transparent !== fz.altT.get(m)) { m.transparent = fz.altT.get(m); m.needsUpdate = true; } });
  fz.obj.forEach(function (o) { o.visible = true; });
  fz.sofort.forEach(function (o) { o.visible = true; });
  fz.ui.forEach(function (e, i) { e.style.opacity = fz.altUi[i].op; e.style.pointerEvents = fz.altUi[i].pe; });
  canvas.style.pointerEvents = '';
  labelBox.style.display = zeigeLabels ? '' : 'none'; leaderSvg.style.display = zeigeLabels ? '' : 'none';
  view.theta = fz.a.t.theta; view.phi = PI / 2; view.dist = d; view.target.copy(a0.target);
  orbit.anim = null;
  camera.setViewOffset(w, h, w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2, w, h);
  camera.updateProjectionMatrix();
  aktiv = 0; fitDist = d;
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === 0);
  lv++;
  fz = null;
}
/* je Bild waehrend der Fahrt: Bildbereich und Deckkraft mit derselben Glaettung wie die Kamera */
function fahrtBild(now) {
  if (!fz.a && now >= fz.warte) {   /* Rueckfahrt beginnt: zur Ganzkoerperansicht, kuerzester Weg beim Drehen */
    var w0 = window.innerWidth, h0 = window.innerHeight, a0 = AUSSCHNITTE[0];
    var dth = a0.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
    orbit.anim = fz.a = Kern.fahrt(view, { theta: view.theta + dth, phi: PI / 2, dist: distFuer(a0, w0, h0), target: a0.target }, 1200);
    fz.obj.forEach(function (o) { o.visible = true; });
  }
  var t = fz.a ? Math.min(1, Math.max(0, (now - fz.a.t0) / fz.a.d)) : 0, s = t * t * (3 - 2 * t), f = fz.hin ? 1 - s : s;
  var w = window.innerWidth, h = window.innerHeight;
  camera.setViewOffset(w, h, fz.von[0] + (fz.nach[0] - fz.von[0]) * s, fz.von[1] + (fz.nach[1] - fz.von[1]) * s, w, h);
  camera.updateProjectionMatrix();
  fz.mats.forEach(function (op, m) { m.opacity = op * f; });
  fz.ui.forEach(function (e) { e.style.opacity = String(f); });
  if (!fz.hin) { if (t >= 1) rueckEnde(); return false; }
  if (t >= 1 && !fz.fertig) { fz.fertig = true; fz.obj.forEach(function (o) { o.visible = false; }); return false; }
  return fz.fertig;   /* true erst ab dem Bild nach dem Endbild */
}

/* =====================================================================
   9b. AR - WebXR im Browser (Android, Chrome mit ARCore) ueber Kern.AR.xr.
   AR Quick Look (iPhone) ueber eine USDZ-Momentaufnahme; in AR gibt es keine Beschriftung.
   ===================================================================== */
var inAR = false, hautAlt = 'glas', arBigAlt = false;
var arCfg = {
  renderer: renderer, scene: scene, camera: camera, root: wurzel,
  stufen: [0.0015, 0.0025, 0.004, 0.006, 0.01], skala: 0.0025,   /* 27 / 45 / 72 / 108 / 180 cm; 0.01 = lebensgross */
  fuss: 0,                                                      /* Fusssohlen unter dem Ursprung; wird nach dem Aufbau gesetzt */
  hintergrund: 0x0b171c,
  quickLook: function () { arQuickLook(); },
  ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
  knoepfe: ['arEnd', 'arHaut', 'arSmall', 'arBig', 'arPlace'],
  beimStart: function () {
    inAR = true; App.ar = true;
    camera.near = 0.01; camera.far = 100;   /* Meter statt cm */
    labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
    arHautText();
  },
  beimEnde: function () {
    inAR = false; App.ar = false;
    camera.near = 2; camera.far = 1200;
    labelBox.style.display = zeigeLabels ? '' : 'none'; leaderSvg.style.display = zeigeLabels ? '' : 'none';
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    groesse(w, h);
    lv++;
  }
};
var AR = Kern.AR.xr(arCfg);
function arHautText() { $('arHaut').textContent = SYS.haut.modus === 'aus' ? 'Haut an' : 'Haut aus'; }
$('arHaut').onclick = function () {
  if (SYS.haut.modus === 'aus') systemModus('haut', hautAlt);
  else { hautAlt = SYS.haut.modus; systemModus('haut', 'aus'); }
  arHautText();
};
$('arBig').addEventListener('click', function () {
  var max = AR.scale === arCfg.stufen[arCfg.stufen.length - 1];
  if (max && !arBigAlt) Kern.toast('Lebensgro\u00df \u2013 am besten auf den Boden stellen.');
  arBigAlt = max;
});
$('arSmall').addEventListener('click', function () { arBigAlt = false; });
/* ---- USDZ fuer AR Quick Look: Momentaufnahme des Koerpers ---- */
function usdzBuild() {
  /* Glas ist nur im Shader durchsichtig (opacity 1): in der USDZ Deckkraft ueber userData.usdzOp */
  var gesetzt = [];
  Object.keys(SYS).forEach(function (k) {
    SYS[k].mats.forEach(function (x) {
      if (!x.userData.gu) return;
      x.userData.usdzOp = SYS[k].modus === 'glas' ? 0.15 : 0.3;
      gesetzt.push(x);
    });
  });
  try {
    return Kern.AR.usdz({
      name: 'Koerper', creator: 'Koerper 3D - ' + Kern.WM, datei: 'koerper.usda', skala: 0.0025,
      gruppen: [wurzel]
    });
  } finally {
    gesetzt.forEach(function (x) { delete x.userData.usdzOp; });
  }
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: $('arQL'), fertig: 'Der K\u00f6rper \u00f6ffnet sich in AR Quick Look. Mit zwei Fingern l\u00e4sst er sich vergr\u00f6\u00dfern und drehen.' });
}
App.usdzBuild = usdzBuild;
$('bAR').onclick = function () { if (fz) return; AR.start(); };
AR.check();

function loop(now, frame) {
  if (inAR) { AR.frame(frame); renderer.render(scene, camera); return; }
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  var weiter = fz ? fahrtBild(now) : false;
  Kern.kamera(camera, view);
  renderer.render(scene, camera);
  if (fz) {
    if (weiter && fz.hin && !fz.gesetzt) { fz.gesetzt = true; location.hash = fz.adresse; }   /* Endbild ist gezeichnet */
    return;
  }
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  AR.abbauen();
  fz = null; canvas.style.pointerEvents = '';
  orbit.loesen();
  canvas.removeEventListener('click', canvasKlick);
  document.removeEventListener('keydown', taste);
  hlMat.dispose();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  camera.clearViewOffset();
  camera.near = kamAlt.near; camera.far = kamAlt.far; camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  delete window.KoerperApp;
};
return bauen().then(function () {
  if (abgebaut) return;
  App.aufbauMs = Math.round(performance.now() - t0);
  arCfg.fuss = -new THREE.Box3().setFromObject(wurzel).min.y;   /* Fusssohlen stehen auf der Flaeche */
  if (umg.von && VON[umg.von] && STR[VON[umg.von]]) rueckkehr(VON[umg.von]);   /* Rueckweg aus einem Detailmodell */
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('koerper', organ);
})();
