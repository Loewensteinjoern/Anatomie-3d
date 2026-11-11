/* =====================================================================
   Dünndarmzotte - Saumzellen, Kapillaren und Lymphgefäß
   Ein Stück Schleimhaut des Dünndarms, stark vergrößert (Modelleinheit: 1 Einheit = 0,1 mm, Achsen: y nach oben = in den Darm hinein, z nach vorn): eine gewölbte
   Ringfalte mit sieben Zotten und den Krypten dazwischen. Die mittlere Zotte steht im Ursprung (Fuß auf der Falte) und ist aufgeschnitten (die vordere Hälfte fehlt): außen
   die Zellschicht der Saumzellen (einzelne Zellen, dazwischen Becherzellen, oben der Bürstensaum aus feinen Mikrovilli), darunter das Kapillarnetz, in der Mitte das
   zentrale Lymphgefäß (blind beginnend) mit Arteriole und Venole und die glatten Muskelfasern. Die sechs Nachbarzotten sind nur als durchscheinende Hüllen angedeutet.
   Alles ist festgelegt, kein Zufall (die kleinen Unterschiede kommen aus hash()). 11 Strukturen mit je eigenem Material, Ausschnitte, Durchsicht, Beschriftung,
   Infokarte, Strukturliste, Lesehilfe. Dazu (Schritt B6) die Strömung: Zucker, Aminosäuren, Fett, Wasser und Blut als Teilchen (nur aus clock und Index), Mahlzeit-Schalter,
   Zottenpumpe (die mittlere Zotte verkürzt sich rhythmisch, per Vertex-Shader und für die Teilchen mit derselben Formel), Schema (Oberfläche und Wege der Stoffe),
   Hilfekarten und Üben (Strukturen finden, Wege verfolgen).
   organ.start (Startansicht) und organ.form (Geometrie als reine Funktionen) dienen der Kamerafahrt aus dem Darm (darm.js, Zoomstufe Darm -> Zotte).
   ===================================================================== */
(function () {
'use strict';
var PI = Math.PI, DEG = PI / 180;
/* =====================================================================
   Inhalte (Daten, getrennt vom Code): Texte von Joern freigegeben (darm-b-texte.md, Teil 2)
   ===================================================================== */
var STRUKTUREN = [
  { id: 'saumzellen', de: 'Saumzellen', lat: 'Enterocyti', grp: 'Oberfläche', col: 0xE6B49A,
    txt: 'Die Zellen, die die Zotte außen bedecken. Sie nehmen Zucker, Aminosäuren, Fette, Vitamine, Salze und Wasser aus dem Darminhalt auf und geben sie nach innen weiter. Sie entstehen in den Krypten, wandern zur Spitze der Zotte und werden dort nach wenigen Tagen abgestoßen.',
    facts: { 'Lebensdauer': 'ca. 3–5 Tage', 'Aufgabe': 'Aufnahme der Nährstoffe', 'Enthalten': 'Enzyme für die letzten Spaltschritte' } },
  { id: 'buerstensaum', de: 'Bürstensaum', lat: 'Microvilli', grp: 'Oberfläche', col: 0xF4DFD0,
    txt: 'Feine, fingerförmige Ausstülpungen auf der Oberseite jeder Saumzelle, so dicht wie die Borsten einer Bürste. Sie vergrößern die Oberfläche noch einmal etwa 20-fach. In ihrer Hülle sitzen Enzyme, die Zweifachzucker und kurze Eiweißstücke fertig spalten.',
    facts: { 'Länge': 'ca. 1 µm', 'Vergrößerung': 'ca. 20-fach', 'Enthalten': 'z. B. Laktase (Milchzucker)' } },
  { id: 'becherzellen', de: 'Becherzellen', lat: 'Exocrinocyti caliciformes', grp: 'Oberfläche', col: 0x59B3C4,
    txt: 'Zwischen den Saumzellen liegen schleimbildende Zellen. Ihr Schleim lässt den Darminhalt gleiten und schützt die Oberfläche.',
    facts: { 'Bilden': 'Schleim', 'Lage': 'zwischen den Saumzellen', 'Im Dickdarm': 'besonders zahlreich' } },
  { id: 'kapillarnetz', de: 'Kapillarnetz', lat: 'Rete capillare', grp: 'Im Inneren der Zotte', col: 0xE0707A,
    txt: 'Ein dichtes Netz feinster Blutgefäße direkt unter den Saumzellen. Es nimmt Zucker, Aminosäuren, Salze und Wasser auf.',
    facts: { 'Nimmt auf': 'Zucker, Aminosäuren, Wasser', 'Abfluss': 'über die Venole zur Pfortader', 'Lage': 'dicht unter der Oberfläche' } },
  { id: 'arteriole', de: 'Arteriole', lat: 'Arteriola', grp: 'Im Inneren der Zotte', col: 0xC8372D,
    txt: 'Eine kleine Arterie bringt sauerstoffreiches Blut in die Zotte bis zur Spitze; von dort verteilt es sich im Kapillarnetz.',
    facts: { 'Bringt': 'sauerstoffreiches Blut', 'Herkunft': 'Äste der Darmarterien', 'Verlauf': 'in der Mitte nach oben' } },
  { id: 'venole', de: 'Venole', lat: 'Venula', grp: 'Im Inneren der Zotte', col: 0x7A5CB0,
    txt: 'Eine kleine Vene sammelt das Blut aus dem Kapillarnetz mit den aufgenommenen Nährstoffen und bringt es über die Darmvenen zur Pfortader.',
    facts: { 'Bringt': 'nährstoffreiches Blut', 'Ziel': 'Pfortader und Leber', 'Verlauf': 'nach unten zum Gekröse' } },
  { id: 'lymphgefaess', de: 'Zentrales Lymphgefäß', lat: 'Vas lymphaticum centrale', grp: 'Im Inneren der Zotte', col: 0xF3E39A,
    txt: 'Ein blind beginnendes Lymphgefäß in der Mitte der Zotte, auch Chylusgefäß genannt. Es nimmt die Fette auf, die die Saumzellen zu kleinen Fetttröpfchen (Chylomikronen) verpackt haben. Über den Milchbrustgang gelangen sie ins Venenblut am Hals – an der Leber vorbei.',
    facts: { 'Nimmt auf': 'Fette (Chylomikronen)', 'Nach dem Essen': 'milchig trüb', 'Weg': 'Milchbrustgang → Venenwinkel' } },
  { id: 'muskelfasern', de: 'Glatte Muskelfasern', lat: 'Myocyti nonstriati', grp: 'Im Inneren der Zotte', col: 0xB4545A,
    txt: 'Feine Muskelzellen ziehen längs durch die Zotte. Sie verkürzen sie immer wieder ein wenig (Zottenpumpe) und drücken so die Lymphe nach unten ab.',
    facts: { 'Bewegung': 'rhythmisches Verkürzen', 'Aufgabe': 'Lymphe abpumpen', 'Verstärkt': 'nach dem Essen' } },
  { id: 'krypten', de: 'Krypten', lat: 'Glandulae intestinales', grp: 'Umgebung', col: 0x9E5A86,
    txt: 'Schlauchförmige Vertiefungen zwischen den Zotten. In ihrem Grund teilen sich Stammzellen und ersetzen ständig die Zellen der Zotte; Abwehrzellen (Paneth-Zellen) schützen sie.',
    facts: { 'Enthalten': 'Stammzellen, Abwehrzellen', 'Bilden': 'Darmsaft', 'Erneuerung': 'der ganzen Oberfläche in wenigen Tagen' } },
  { id: 'ringfalte', de: 'Ringfalte', lat: 'Plica circularis', grp: 'Umgebung', col: 0xDDA08E,
    txt: 'Die Zotten sitzen auf einer Ringfalte (Kerckring-Falte) der Schleimhaut. Schon die Falten verdreifachen die Oberfläche des Dünndarms.',
    facts: { 'Höhe': 'bis ca. 1 cm', 'Vergrößerung': 'ca. 3-fach', 'Am dichtesten': 'im Leerdarm' } },
  { id: 'nachbarn', de: 'Nachbarzotten', lat: 'Villi intestinales', grp: 'Umgebung', col: 0xE9B7A8,
    txt: 'Die benachbarten Zotten, angedeutet. Auf einem Quadratmillimeter Schleimhaut stehen etwa 20–40 Zotten; sie vergrößern die Oberfläche etwa 10-fach.',
    facts: { 'Höhe einer Zotte': 'ca. 0,5–1 mm', 'Dichte': 'ca. 20–40 pro mm²', 'Vergrößerung': 'ca. 10-fach' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Dünndarmzotte &middot; Villus intestinalis</div>
  <h1>Saumzellen, Kapillaren &amp; <em>Lymphgefäß</em></h1>
  <div class="sub">Nimmt die Bausteine der Nahrung auf – Zucker und Aminosäuren ins Blut, Fett in die Lymphe.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Übersicht</button>
    <button id="cam1" class="gh" title="Die mittlere Zotte aufgeschnitten: Kapillarnetz und Lymphgefäß">Zotte innen</button>
    <button id="cam2" class="gh" title="Saumzellen mit Bürstensaum und Becherzellen">Oberfläche</button>
    <button id="cam3" class="gh" title="Die Vertiefungen zwischen den Zotten, in denen neue Zellen entstehen">Krypten</button>
    <span class="sep"></span>
    <button id="bSchema" class="gh" title="Wie die Oberfläche vergrößert wird und welchen Weg die Stoffe nehmen">Schema</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Saumzellen durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bNuechtern" class="gh on" title="Zwischen den Mahlzeiten: kaum Nährstoffe">nüchtern</button>
    <button id="bEssen" class="gh" title="Nach einer Mahlzeit: Nährstoffe werden aufgenommen">nach dem Essen</button>
  </div>
  <div class="trow">
    <span class="cap">Stoffe</span>
    <button id="bZucker" class="gh on" title="Zucker ein- oder ausblenden">Zucker</button>
    <button id="bAmino" class="gh on" title="Aminosäuren ein- oder ausblenden">Aminosäuren</button>
    <button id="bFett" class="gh on" title="Fett ein- oder ausblenden">Fett</button>
    <button id="bWasser" class="gh on" title="Wasser ein- oder ausblenden">Wasser</button>
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

<div class="panel" id="schema" aria-label="Schema: Oberfläche und Wege der Stoffe">
  <div class="sch-head"><span class="kick">Schema &middot; Oberfläche und Wege</span><span class="sch-hint">Gleiche Stoffe wie im 3D-Modell.</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schließen">&times;</button></div>
  <div id="schemaBox"></div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#E8C84F">Gelb</b> Zucker – aus den Kohlenhydraten, ins Blut.<br>
  <b style="color:#E88B3A">Orange</b> Aminosäuren – aus dem Eiweiß, ins Blut.<br>
  <b style="color:#F2F2F2">Weiß</b> Fett – als Fetttröpfchen ins Lymphgefäß.<br>
  <b style="color:#8FD0F0">Hellblau</b> Wasser – mit den Salzen ins Blut.<br>
  <b style="color:#E0584C">Rot</b> Arteriole, <b style="color:#A98BDC">Violett</b> Venole zur Pfortader, <b style="color:#F3E39A">Hellgelb</b> Lymphgefäß.</p>
  <p class="note">Die Teilchen zeigen den Weg der Stoffe – symbolisch, nicht maßstäblich; die Zeit läuft gerafft.</p>
  <p class="note kz">Höhe einer Zotte ca. 0,5–1 mm<br>
  Saumzellen leben ca. 3–5 Tage<br>
  Falten, Zotten und Mikrovilli vergrößern die Oberfläche etwa 600-fach</p>
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
/* Hilfekarten: [Schluessel, Titel, Text, Merke] (Texte von Joern freigegeben, darm-b-texte.md Abschnitt L) */
var HILFE = [
  ['aufbau', 'Aufbau der Zotte', 'Die Dünndarmzotte ist eine fingerförmige Ausstülpung der Schleimhaut, etwa 0,5–1 mm hoch. Außen bedecken sie Saumzellen mit Bürstensaum und Becherzellen. Innen liegen eine kleine Arterie, ein dichtes Kapillarnetz, eine kleine Vene, in der Mitte ein Lymphgefäß und feine Muskelfasern. Zwischen den Zotten liegen die Krypten, in denen ständig neue Zellen entstehen.',
    'Ringfalten, Zotten und Mikrovilli vergrößern die Oberfläche des Dünndarms etwa 600-fach.'],
  ['aufnahme', 'Wie die Stoffe aufgenommen werden', 'Am Bürstensaum spalten Enzyme die letzten Zweifachzucker und Eiweißstücke. Die Saumzellen nehmen Zucker und Aminosäuren mit Hilfe von Natrium auf und geben sie ins Kapillarnetz ab; Wasser folgt. Fette gelangen mit Hilfe der Gallensäuren in die Zelle, werden dort zu kleinen Fetttröpfchen verpackt und ins Lymphgefäß abgegeben.',
    'Zucker und Aminosäuren gehen über die Pfortader zuerst zur Leber, Fett über die Lymphe an der Leber vorbei.'],
  ['blut', 'Blut und Lymphe', 'Die Arteriole bringt Blut in die Zotte, das Kapillarnetz nimmt die wasserlöslichen Stoffe auf, die Venole bringt sie über die Darmvenen und die Pfortader zur Leber. Das zentrale Lymphgefäß sammelt die Fetttröpfchen; nach einer fettreichen Mahlzeit ist die Lymphe milchig trüb. Die Muskelfasern verkürzen die Zotte rhythmisch und pumpen die Lymphe ab.',
    'Die Lymphe aus dem Darm erreicht das Blut erst am Hals – über den Milchbrustgang im Venenwinkel.'],
  ['pflege', 'Pflege: Zöliakie und Durchfall', 'Bei der Zöliakie verträgt der Darm das Klebereiweiß Gluten aus Weizen, Roggen und Gerste nicht: Die Zotten entzünden sich und werden flach. Die Oberfläche schrumpft, Nährstoffe, Eisen und Vitamine werden schlecht aufgenommen – Folgen sind Durchfall, Gewichtsverlust und Mangelerscheinungen. Bei Durchfall geht viel Wasser mit Salzen verloren. Pflegende achten auf Trinkmenge, Ausscheidung, Gewicht, Kreislauf und Zeichen der Austrocknung (trockene Schleimhäute, stehende Hautfalten), auf Hautschutz am After und auf Hygiene, wenn eine Infektion möglich ist.',
    'Bei Zöliakie hilft nur eine lebenslang glutenfreie Ernährung – schon kleine Mengen Gluten schaden den Zotten.'],
  ['modell', 'So liest du das Modell', 'Ein kleines Stück einer Ringfalte ist stark vergrößert dargestellt, die mittlere Zotte ist aufgeschnitten. Die Teilchen stehen für Stoffe: gelb Zucker, orange Aminosäuren, weiß Fett, hellblau Wasser. Rot ist die Arteriole, violett die Venole, hellgelb das Lymphgefäß. Mit den Schaltern unter „Stoffe“ verfolgst du jeden Stoff einzeln, „Durchsicht“ macht die Saumzellen gläsern. Der Schalter „nüchtern / nach dem Essen“ zeigt, wie viel aufgenommen wird. Die Zeit läuft stark gerafft.',
    'Blutgefäße für die wasserlöslichen Stoffe, das Lymphgefäß für das Fett.']
];
/* Ueben "Strukturen finden": in welchen Ausschnitten (Nummer wie AUSSCHNITTE) eine Struktur sicher im Bild liegt und sich antippen laesst (der erste Eintrag ist der Ausschnitt, in den das Ueben wechselt);
   nicht aufgefuehrte Strukturen (Saumzellen, Ringfalte) gibt es in der Uebersicht. Die Nachbarzotten werden nicht gesucht. */
var NUR_INNEN = { buerstensaum: [2], becherzellen: [2], kapillarnetz: [1], arteriole: [1], venole: [1], lymphgefaess: [1], muskelfasern: [1], krypten: [3] };
var KEIN_QUIZ = ['nachbarn'];
/* Ueben "Wege verfolgen": feste Reihenfolge der drei Wege (Texte von Joern freigegeben, darm-b-texte.md Abschnitt M). Station = Liste von Struktur-ids (ids); an = Ausschnitt, in den der Weg fuer diese
   Station wechselt (sonst die Uebersicht); mahlzeit = true schaltet das Modell auf "nach dem Essen", fehlt sie, bleibt es wie es ist. Nur Daten. */
var WEGE = [
  { titel: 'Weg des Zuckers', aufgabe: 'Ein Zuckerteilchen liegt im Darminhalt. Tippe seine Stationen der Reihe nach an, bis es die Zotte verlässt.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['buerstensaum'], an: 2 }, { ids: ['saumzellen'], an: 2 }, { ids: ['kapillarnetz'], an: 1 }, { ids: ['venole'], an: 1 }],
    abschluss: 'Geschafft: Der Zucker gelangt über die Venole und die Pfortader zuerst zur Leber.' },
  { titel: 'Weg des Fetts', aufgabe: 'Ein Fetttröpfchen liegt im Darminhalt. Tippe seine Stationen der Reihe nach an, bis es die Zotte verlässt.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['buerstensaum'], an: 2 }, { ids: ['saumzellen'], an: 2 }, { ids: ['lymphgefaess'], an: 1 }],
    abschluss: 'Geschafft: Das Fett nimmt den Weg über die Lymphe und gelangt an der Leber vorbei ins Blut.' },
  { titel: 'Weg des Blutes', aufgabe: 'Das Blut kommt aus einer Darmarterie. Tippe seine Stationen der Reihe nach an, bis es die Zotte verlässt.',
    stationen: [{ ids: ['arteriole'], an: 1 }, { ids: ['kapillarnetz'], an: 1 }, { ids: ['venole'], an: 1 }],
    abschluss: 'Geschafft: Im Kapillarnetz nimmt das Blut die Nährstoffe auf und bringt sie zur Pfortader.' }
];
var organ = { renderer: {}, aufbauen: aufbauen };

/* =====================================================================
   Form (feste Größen, Modelleinheit 0,1 mm): reine Funktionen, die Geometrie als Daten liefern (organ.form). Erst der Aufruf erzeugt three.js-Objekte; der Darm nutzt
   dieselben Teile bei der Kamerafahrt (darm.js, Zoomstufe Zotte). Ursprung: Fuß der mittleren Zotte auf der Ringfalte; y zeigt in den Darm hinein.
   Winkel a um die mittlere Zotte: a = 0 nach hinten (-z), x = r*sin a, z = -r*cos a; die aufgeschnittene Zotte behält -90° bis 90° (die hintere Hälfte).
   ===================================================================== */
var CELL_TH = 0.26, CELL_PW = 0.17, CELL_HC = 0.17;      /* Zellschicht: hochprismatische Saumzellen (Dicke größer als Breite und Höhe) */
var HAAR_L = 0.04;                                       /* Bürstensaum: Dicke des Samtsaums (symbolisch, in Wirklichkeit ca. 1 µm) */
var CAP_R = 0.042;                                       /* Radius der Kapillaren */
/* Zotten: Lage des Fußes (x, z), Höhe, Fußradius, Neigung der Spitze (lx, lz), S-Schwung sx, Streckung ex und ez (abgeflacht, blattartig) und Drehung rot des Querschnitts, Verjüngung tp
   (je Zotte etwas anders); die erste ist die aufgeschnittene (gerade, rund, damit der Schnitt eben bleibt) */
var ZOTTEN = [
  { x: 0, z: 0, h: 7.2, r: 1.0, lx: 0, lz: 0, sx: 0, ex: 1, ez: 1, rot: 0, tp: 0.2 },
  { x: -3.5, z: -0.7, h: 6.5, r: 0.87, lx: -0.45, lz: 0.15, sx: 0.12, ex: 1.15, ez: 0.72, rot: 0.3, tp: 0.3 },
  { x: 3.4, z: -0.5, h: 7.0, r: 0.92, lx: 0.4, lz: -0.2, sx: -0.15, ex: 1.1, ez: 0.8, rot: -0.5, tp: 0.26 },
  { x: -5.0, z: -2.3, h: 6.7, r: 0.9, lx: 0.5, lz: -0.2, sx: 0.1, ex: 1.2, ez: 0.7, rot: 0.9, tp: 0.32 },
  { x: -2.4, z: -2.5, h: 7.4, r: 0.93, lx: -0.25, lz: 0.3, sx: -0.1, ex: 1.0, ez: 0.85, rot: -0.2, tp: 0.24 },
  { x: 2.5, z: -2.4, h: 6.4, r: 0.85, lx: 0.35, lz: 0.25, sx: 0.14, ex: 1.15, ez: 0.75, rot: 0.6, tp: 0.3 },
  { x: 5.0, z: -2.2, h: 6.9, r: 0.9, lx: -0.5, lz: -0.15, sx: -0.12, ex: 1.05, ez: 0.8, rot: -0.8, tp: 0.28 }
];
var KRYPTEN = [[-1.75, -0.35], [1.7, -0.25], [0, -1.4], [-1.2, -3.3], [1.3, -3.4], [-3.8, -3.4], [3.8, -3.2], [-2.1, 1.6], [1.8, 1.6], [-4.8, 0.4], [5.2, 0.3]];
var KR_R = 0.34, KR_T = 1.7;                             /* Krypten: Radius und Tiefe */
var SX0 = -7.4, SX1 = 7.4, SZ0 = -6.2, SZ1 = 1.6, SY0 = -3.0, SST = 0.07;   /* Ringfalte: Ausdehnung, Unterkante, Gitterweite; vorn (SZ1) ist sie senkrecht geschnitten */
var ZR0 = ZOTTEN[0];
function hash(i) { var s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); }
function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
/* Höhe der Ringfalte ohne Krypten: gewölbt, an den Rändern fällt sie bis zur Unterkante ab */
function basisY(x, z) {
  var u = Math.max(0, (Math.abs(x) - 5.6) / 1.8), v = Math.max(0, (-z - 4.4) / 1.8);
  return 0.25 * (Math.cos(x * 0.26) - 1) - 0.012 * z * z + 0.06 * Math.sin(2.1 * x + 1.3 * z) * Math.sin(1.7 * z - 1.1 * x) - 3.2 * (u * u + v * v);
}
function kryptaW(x, z) {   /* 1 im Schlauch, 0 außerhalb (weicher Rand) */
  var w = 0, i;
  for (i = 0; i < KRYPTEN.length; i++) {
    var d = Math.sqrt((x - KRYPTEN[i][0]) * (x - KRYPTEN[i][0]) + (z - KRYPTEN[i][1]) * (z - KRYPTEN[i][1])) / KR_R;
    w = Math.max(w, 1 - sstep(0.55, 1.15, d));
  }
  return w;
}
function sockelY(x, z) { return Math.max(SY0, basisY(x, z) - KR_T * kryptaW(x, z)); }
/* Radius einer Zotte (Höhe h, Fußradius R) in der Höhe y über dem Fuß: aufgeweiteter Fuß, leicht verjüngt, oben abgerundet */
function zr(h, R, y, tp) {
  if (tp === undefined) tp = 0.2;
  var rc = 1.1 * R, yc = h - rc;
  function koerper(yy) { yy = Math.max(yy, 0); return R * (1 + 0.28 * Math.exp(-yy / 0.6)) * (1 - tp * yy / h); }
  if (y <= yc) return koerper(y);
  var q = (y - yc) / rc;
  return koerper(yc) * Math.sqrt(Math.max(0, 1 - q * q));
}
function zhoehen(h, R, y0) {   /* Höhen der Ringe von y0 bis zur Spitze (oben dichter) */
  var rc = 1.1 * R, yc = h - rc, ys = [], y = y0, k;
  for (; y < yc; y += 0.25) ys.push(y);
  for (k = 0; k <= 8; k++) ys.push(yc + rc * Math.sin(k / 8 * PI / 2));
  return ys;
}
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
/* Rohr entlang einer Punktfolge pts ([x, y, z]) mit Radius rf(t), t = 0..1 entlang der Folge; kap: 1 = abgerundetes Ende am letzten Punkt, 2 = am ersten, 3 = beide */
function rohr(pts, rf, seiten, kap) {
  var n = pts.length, i, j, T = [], ringe = [], P = new THREE.Vector3(), Q = new THREE.Vector3();
  for (i = 0; i < n; i++) {
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    T.push(new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize());
  }
  var u = new THREE.Vector3(1, 0, 0);
  if (Math.abs(T[0].x) > 0.9) u.set(0, 0, 1);
  u.sub(T[0].clone().multiplyScalar(u.dot(T[0]))).normalize();
  for (i = 0; i < n; i++) {
    u.sub(T[i].clone().multiplyScalar(u.dot(T[i]))).normalize();
    ringe.push({ p: new THREE.Vector3(pts[i][0], pts[i][1], pts[i][2]), r: rf(n > 1 ? i / (n - 1) : 0), t: T[i], u: u.clone(), v: new THREE.Vector3().crossVectors(T[i], u) });
  }
  var R = ringe.slice();
  if (kap & 1) { var e = ringe[n - 1]; for (j = 1; j <= 4; j++) { var ph = j / 4 * PI / 2; R.push({ p: e.p.clone().addScaledVector(e.t, e.r * Math.sin(ph)), r: e.r * Math.cos(ph), t: e.t, u: e.u, v: e.v, c: e.p }); } }
  if (kap & 2) { var s = ringe[0]; for (j = 1; j <= 4; j++) { var ph2 = j / 4 * PI / 2; R.unshift({ p: s.p.clone().addScaledVector(s.t, -s.r * Math.sin(ph2)), r: s.r * Math.cos(ph2), t: s.t, u: s.u, v: s.v, c: s.p }); } }
  var pos = [], nor = [], idx = [], m, k;
  for (m = 0; m < R.length; m++) {
    var Rg = R[m];
    for (k = 0; k < seiten; k++) {
      var th = k / seiten * 2 * PI, c = Math.cos(th), sn = Math.sin(th);
      P.copy(Rg.u).multiplyScalar(c).addScaledVector(Rg.v, sn);   /* Richtung nach außen */
      Q.copy(Rg.p).addScaledVector(P, Rg.r);
      pos.push(Q.x, Q.y, Q.z);
      if (Rg.c) { P.copy(Q).sub(Rg.c); if (P.lengthSq() < 1e-12) P.copy(Rg.t); P.normalize(); }
      nor.push(P.x, P.y, P.z);
    }
  }
  for (m = 0; m < R.length - 1; m++) for (k = 0; k < seiten; k++) {
    var k1 = (k + 1) % seiten, a0 = m * seiten + k, b0 = (m + 1) * seiten + k, a1 = m * seiten + k1, b1 = (m + 1) * seiten + k1;
    idx.push(a0, a1, b0, b0, a1, b1);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
var ID = new THREE.Matrix4();
/* Ringfalte mit den Löchern der Krypten: Höhenfeld über (x, z) mit der senkrechten Schnittfläche vorn */
function sockelDaten() {
  var nx = Math.round((SX1 - SX0) / SST), nz = Math.round((SZ1 - SZ0) / SST), pos = [], nor = [], ix, iz, e = 0.03;
  for (iz = 0; iz <= nz; iz++) for (ix = 0; ix <= nx; ix++) {
    var x = SX0 + ix * SST, z = SZ0 + iz * SST, y = sockelY(x, z);
    var gx = (sockelY(x + e, z) - sockelY(x - e, z)) / (2 * e), gz = (sockelY(x, z + e) - sockelY(x, z - e)) / (2 * e), l = Math.sqrt(gx * gx + 1 + gz * gz);
    pos.push(x, y, z); nor.push(-gx / l, 1 / l, -gz / l);
  }
  var idxF = [], vi = function (a, b) { return b * (nx + 1) + a; };
  for (iz = 0; iz < nz; iz++) for (ix = 0; ix < nx; ix++) {
    var v00 = vi(ix, iz), v10 = vi(ix + 1, iz), v01 = vi(ix, iz + 1), v11 = vi(ix + 1, iz + 1);
    idxF.push(v00, v01, v10, v10, v01, v11);
  }
  for (ix = 0; ix < nx; ix++) {   /* senkrechte Schnittfläche vorn (z = SZ1) bis zur Unterkante */
    var xa = SX0 + ix * SST, xb = xa + SST, ya = sockelY(xa, SZ1), yb = sockelY(xb, SZ1), b0 = pos.length / 3;
    pos.push(xa, ya, SZ1, xa, SY0, SZ1, xb, SY0, SZ1, xb, yb, SZ1);
    for (var q = 0; q < 4; q++) nor.push(0, 0, 1);
    idxF.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idxF);
  return g;
}
/* Auskleidung der Krypten: je Krypte ein Drehkörper (Schlauch mit flachem Grund) knapp innerhalb des Lochs der Ringfalte (Radius aus dem weichen Rand von kryptaW);
   vorn wird er an der Schnittfläche (z = SZ1) abgeschnitten, so dass man in die halbe Krypte hineinsieht */
function kryptenGeo() {
  var NJ = 14, NA = 32, pos = [], idx = [], c, j, k;
  var qw = function (w) {   /* Abstand/KR_R, bei dem der Rand die Gewichtung w hat (Umkehrung von 1 - sstep(0.55, 1.15, q)) */
    var lo = 0.55, hi = 1.15, i;
    for (i = 0; i < 30; i++) { var mid = (lo + hi) / 2; if (1 - sstep(0.55, 1.15, mid) > w) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  KRYPTEN.forEach(function (K) {
    var b0 = pos.length / 3, rm = [];
    for (j = 0; j <= NJ; j++) { var w = 0.01 + 0.99 * Math.pow(j / NJ, 0.8); rm.push({ w: w, r: qw(w) * KR_R - 0.012 }); }
    for (j = 0; j <= NJ; j++) for (k = 0; k < NA; k++) {
      var a = k / NA * 2 * PI, x = K[0] + rm[j].r * Math.cos(a), z = K[1] + rm[j].r * Math.sin(a);
      pos.push(x, Math.max(SY0 + 0.01, basisY(x, z) - KR_T * rm[j].w + 0.012), z);   /* knapp über dem Loch (kein Flackern) */
    }
    var cen = pos.length / 3;
    pos.push(K[0], Math.max(SY0 + 0.01, basisY(K[0], K[1]) - KR_T + 0.012), K[1]);   /* Mitte des Grundes */
    for (j = 0; j < NJ; j++) for (k = 0; k < NA; k++) {
      var k1 = (k + 1) % NA, a0 = b0 + j * NA + k, a1 = b0 + j * NA + k1, c0 = b0 + (j + 1) * NA + k, c1 = b0 + (j + 1) * NA + k1;
      idx.push(a0, c0, a1, a1, c0, c1);
    }
    for (k = 0; k < NA; k++) idx.push(cen, b0 + NJ * NA + (k + 1) % NA, b0 + NJ * NA + k);
  });
  /* an der Schnittfläche abschneiden: Dreiecke ganz davor entfallen, Ecken davor werden auf die Ebene gelegt */
  var keep = [], t;
  for (t = 0; t < idx.length; t += 3) {
    var z0 = pos[idx[t] * 3 + 2], z1 = pos[idx[t + 1] * 3 + 2], z2 = pos[idx[t + 2] * 3 + 2];
    if (z0 > SZ1 + 1e-6 && z1 > SZ1 + 1e-6 && z2 > SZ1 + 1e-6) continue;
    keep.push(idx[t], idx[t + 1], idx[t + 2]);
  }
  for (c = 0; c < pos.length; c += 3) if (pos[c + 2] > SZ1) pos[c + 2] = SZ1;
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(keep);
  g.computeVertexNormals();
  return g;
}
/* Zotte als Drehkörper um ihre (leicht geneigte) Achse; Winkel von a0 bis a1 (voll: -PI bis PI mit Naht) */
function zachse(Z, y) {   /* Mittelpunkt der Zotte Z in der Höhe y über dem Fuß (Neigung und S-Schwung) */
  var f = Math.max(0, y) / Z.h;
  return [Z.x + Z.lx * f * f + Z.sx * Math.sin(f * PI * 1.4), basisY(Z.x, Z.z) - 0.1 + y, Z.z + Z.lz * f * f - 0.6 * Z.sx * Math.sin(f * PI * 1.1)];
}
function zotteGeo(Z) {
  var ys = zhoehen(Z.h, Z.r, -0.4), NA = 26, pos = [], idx = [], i, k, cr = Math.cos(Z.rot), sr = Math.sin(Z.rot);
  for (i = 0; i < ys.length; i++) {
    var y = ys[i], r = zr(Z.h, Z.r, y, Z.tp), c = zachse(Z, y);
    for (k = 0; k < NA; k++) {
      var a = k / NA * 2 * PI - PI, dx = r * Z.ex * Math.sin(a), dz = -r * Z.ez * Math.cos(a);
      pos.push(c[0] + dx * cr - dz * sr, c[1], c[2] + dx * sr + dz * cr);
    }
  }
  for (i = 0; i < ys.length - 1; i++) for (k = 0; k < NA; k++) {
    var k1 = (k + 1) % NA, a0 = i * NA + k, a1 = i * NA + k1, b0 = (i + 1) * NA + k, b1 = (i + 1) * NA + k1;
    idx.push(a0, b0, a1, a1, b0, b1);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function nachbarnGeo() {
  var t = [];
  ZOTTEN.forEach(function (Z, i) { if (i) t.push({ g: zotteGeo(Z), m: ID }); });
  return fuegen(t);
}
/* Quader mit abgerundeten Kanten und Ecken (Radius r, Einheitsgröße): weich schattierte Zellen statt eckiger Fliesen */
function rundBox(r) {
  var g = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3), p = g.attributes.position, n = g.attributes.normal, h = 0.5 - r, v = new THREE.Vector3(), q = new THREE.Vector3(), i;
  for (i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    q.set(Math.max(-h, Math.min(h, v.x)), Math.max(-h, Math.min(h, v.y)), Math.max(-h, Math.min(h, v.z)));
    v.sub(q); var l = v.length(); if (l < 1e-9) continue;
    v.divideScalar(l); n.setXYZ(i, v.x, v.y, v.z); p.setXYZ(i, q.x + v.x * r, q.y + v.y * r, q.z + v.z * r);
  }
  return g;
}
/* Zellen der Zellschicht um die aufgeschnittene Zotte: Raster entlang der Oberfläche (Bogenlänge) und um die Achse (hintere Hälfte; an der Schnittebene halbe Zellen).
   Liefert Instanzen der Saumzellen, des Samtsaums (eine feine Platte auf jeder Zelloberseite), der Zellkerne der angeschnittenen Zellen und die Lage der Becherzellen */
var ZELL = null;
function zellDaten() {
  if (ZELL) return ZELL;
  var Z = ZR0, ys = [], y, i, prof = [], L = 0;
  for (y = 0; y < Z.h - 1.1 * Z.r; y += 0.02) ys.push(y);
  for (i = 0; i <= 60; i++) ys.push(Z.h - 1.1 * Z.r + 1.1 * Z.r * Math.sin(i / 60 * PI / 2));
  ys.forEach(function (yy, k) {
    var r = zr(Z.h, Z.r, yy);
    if (k) { var dr = r - prof[k - 1].r, dy = yy - prof[k - 1].y; L += Math.sqrt(dr * dr + dy * dy); }
    prof.push({ r: r, y: yy, s: L });
  });
  function bei(s) {   /* Punkt, Tangente und Normale der Profillinie bei Bogenlänge s */
    var k = 1; while (k < prof.length - 1 && prof[k].s < s) k++;
    var a = prof[k - 1], b = prof[k], f = (s - a.s) / Math.max(1e-9, b.s - a.s), dr = b.r - a.r, dy = b.y - a.y, l = Math.sqrt(dr * dr + dy * dy) || 1;
    return { r: a.r + (b.r - a.r) * f, y: a.y + (b.y - a.y) * f, tr: dr / l, ty: dy / l };
  }
  function sp(sl, a, off) {   /* Punkt und Normale der Oberfläche bei Bogenlänge sl und Winkel a, um off nach außen */
    var Q = bei(sl), rho = [Math.sin(a), -Math.cos(a)], nr = Q.ty, ny = -Q.tr, r = Q.r + nr * off;
    return { p: [r * rho[0], Q.y + ny * off, r * rho[1]], n: [nr * rho[0], ny, nr * rho[1]] };
  }
  var mat = [], col = [], kmat = [], becher = [], nZ = 0, nK = 0, spos = [], snor = [], scol = [], saumC = new THREE.Color(0xF1DCCB).convertSRGBToLinear(), becherC = new THREE.Color(0xD6E4EC).convertSRGBToLinear(), base = new THREE.Color(0xE6B49A).convertSRGBToLinear();
  var m = new THREE.Matrix4(), ex = new THREE.Vector3(), ey = new THREE.Vector3(), en = new THREE.Vector3(), c = new THREE.Vector3(), pp = new THREE.Vector3();
  var rows = Math.floor((L - 0.2) / CELL_HC), j, k;
  for (j = 0; j < rows; j++) {
    var P = bei(0.05 + (j + 0.5) * CELL_HC), n = Math.max(1, Math.round(PI * P.r / CELL_PW));
    if (P.r < 0.28) continue;
    P.s = 0.05 + (j + 0.5) * CELL_HC;
    var dA = PI / n;
    for (k = 0; k <= n; k++) {
      var halb = k === 0 || k === n, a = -PI / 2 + k * dA + (k === 0 ? dA / 4 : k === n ? -dA / 4 : 0), sa = Math.sin(a), ca = Math.cos(a);
      var rho = [sa, 0, -ca], nr = P.ty, ny = -P.tr;   /* Normale (nr, ny) in der (Radial, y)-Ebene: nach außen */
      var w = P.r * dA * (halb ? 0.5 : 1) * 0.99;
      en.set(nr * rho[0], ny, nr * rho[2]);
      ey.set(P.tr * rho[0], P.ty, P.tr * rho[2]);
      ex.set(-ca, 0, -sa);
      c.set(P.r * rho[0], P.y, P.r * rho[2]);
      var istB = false;
      if (!halb && j >= 2 && j < rows - 4 && n >= 4 && hash(j * 31 + k * 7 + 3) < 0.085) { istB = true; becher.push({ p: c.clone().addScaledVector(en, HAAR_L).toArray(), ex: ex.toArray(), ey: ey.toArray(), en: en.toArray(), a: a, y: P.y, r: P.r }); }
      pp.copy(c).addScaledVector(en, -CELL_TH / 2);
      m.makeBasis(ex.clone().multiplyScalar(w), ey.clone().multiplyScalar(CELL_HC * 0.99), en.clone().multiplyScalar(CELL_TH)); m.setPosition(pp);
      m.toArray(mat, nZ * 16);
      var f = 0.93 + 0.14 * hash(j * 53 + k * 11 + 1);
      col.push(base.r * f, base.g * f, base.b * f);
      nZ++;
      /* Samtsaum: glatte Haut knapp über den Zelloberseiten, je Zelle weich getönt (Mitte hell, Ecken dunkler: feine Zellgrenzen); an der Schnittebene eine helle Kante */
      var sc = 0.94 + 0.12 * hash(j * 17 + k * 5 + 9), as = dA * (halb ? 0.5 : 1) / 2, hh = CELL_HC * 0.5 * 0.995, ctr = sp(P.s, a, HAAR_L), cn = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return sp(P.s + q[1] * hh, a - q[0] * as, HAAR_L); });
      var sCol = istB ? becherC : saumC, vv = function (o, f) { spos.push(o.p[0], o.p[1], o.p[2]); snor.push(o.n[0], o.n[1], o.n[2]); scol.push(sCol.r * f, sCol.g * f, sCol.b * f); };
      for (var q4 = 0; q4 < 4; q4++) { vv(ctr, sc); vv(cn[q4], sc * 0.86); vv(cn[(q4 + 1) % 4], sc * 0.86); }
      if (halb) {   /* Kante an der Schnittebene (z = 0) */
        var sg2 = k === 0 ? -1 : 1, e0 = sp(P.s - hh, sg2 * PI / 2, 0), e1 = sp(P.s + hh, sg2 * PI / 2, 0), f0 = sp(P.s - hh, sg2 * PI / 2, HAAR_L), f1 = sp(P.s + hh, sg2 * PI / 2, HAAR_L);
        [e0, e1, f1, e0, f1, f0].forEach(function (o) { spos.push(o.p[0], o.p[1], 0); snor.push(0, 0, 1); scol.push(saumC.r, saumC.g, saumC.b); });
      }
      if (halb) {   /* Zellkern: Halbkugel in der Schnittfläche, im inneren Drittel der Zelle */
        var sg = k === 0 ? -1 : 1, kc = new THREE.Vector3(sg * P.r, P.y, 0), ke = new THREE.Vector3(sg * nr, ny, 0);
        kc.addScaledVector(ke, -CELL_TH * 0.7);
        m.makeBasis(new THREE.Vector3(0, 0, 0.1), ey.clone().multiplyScalar(0.11), ke.clone().multiplyScalar(0.13)); m.setPosition(kc);
        m.toArray(kmat, nK * 16); nK++;
      }
    }
  }
  /* die Spitze: eine einzelne Zelle (hintere Hälfte) schließt die Zellschicht oben */
  ex.set(1, 0, 0); ey.set(0, 0, -1); en.set(0, 1, 0);
  m.makeBasis(ex.clone().multiplyScalar(0.4), ey.clone().multiplyScalar(0.2), en.clone().multiplyScalar(CELL_TH)); m.setPosition(0, Z.h - CELL_TH / 2, -0.1);
  m.toArray(mat, nZ * 16); col.push(base.r, base.g, base.b); nZ++;
  ZELL = { zellen: { n: nZ, mat: new Float32Array(mat), col: new Float32Array(col) }, saum: { pos: spos, nor: snor, col: scol }, kerne: { n: nK, mat: new Float32Array(kmat) }, becher: becher, hoehe: L };
  return ZELL;
}
function saumGeo(sd) {   /* glatte Haut des Samtsaums (Dreiecke einzeln, Farbe und Normalen je Ecke) */
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(sd.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(sd.nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(sd.col, 3));
  return g;
}
function kernGeo() { return new THREE.SphereGeometry(0.5, 10, 8); }
/* Becherzellen: kelchförmige Zellen IN der Zellschicht (sie ersetzen eine Saumzelle): breiter Kelch unter der Oberfläche, dünner Stiel nach innen, nach außen eine kleine Öffnung
   mit einem Tropfen Schleim */
function becherGeo(liste) {
  var prof = [[0.0, -0.26], [0.02, -0.25], [0.035, -0.2], [0.065, -0.15], [0.083, -0.09], [0.085, -0.04], [0.078, -0.008], [0.05, 0.0], [0.03, -0.004], [0.026, -0.03]], t = [], m = new THREE.Matrix4(), ex = new THREE.Vector3(), ey = new THREE.Vector3(), en = new THREE.Vector3();
  var pts = prof.map(function (q) { return new THREE.Vector2(q[0], q[1]); });
  liste.forEach(function (b) {
    ex.fromArray(b.ex); ey.fromArray(b.ey); en.fromArray(b.en);
    m.makeBasis(ey.clone(), en.clone(), ex.clone()); m.setPosition(b.p[0], b.p[1], b.p[2]);   /* Achse y des Drehkörpers = Normale der Oberfläche */
    t.push({ g: new THREE.LatheGeometry(pts, 14), m: m.clone() });
    var tr = new THREE.Matrix4().makeScale(1, 0.55, 1).premultiply(new THREE.Matrix4().makeTranslation(0, 0.004, 0)).premultiply(m);
    t.push({ g: new THREE.SphereGeometry(0.042, 8, 6), m: tr });
  });
  return fuegen(t);
}
/* Kapillarnetz: Ringbögen um die Achse dicht unter den Saumzellen, durch Längsstücke verbunden (versetzt wie ein Netz) */
var NETZ_Y = [], NETZ_N = 14;
(function () { for (var k = 0; k < 9; k++) NETZ_Y.push(0.55 + k * (0.82 * 7.2 - 0.55) / 8); })();
function netzPunkt(k, i) {   /* Punkt i (0..NETZ_N) auf dem Ring k */
  var y = NETZ_Y[k], a = -PI / 2 + PI * i / NETZ_N, rr = zr(ZR0.h, ZR0.r, y) - CELL_TH - 0.06 + 0.02 * Math.sin(3 * a + k * 1.7), yy = y + 0.05 * Math.sin(5 * a + k);
  return [rr * Math.sin(a), yy, -rr * Math.cos(a)];
}
function kapillarGeo() {
  var t = [], k, i, m;
  for (k = 0; k < NETZ_Y.length; k++) {
    var ring = []; for (i = 0; i <= NETZ_N; i++) ring.push(netzPunkt(k, i));
    t.push({ g: rohr(ring, function () { return CAP_R; }, 5, 3), m: ID });
    if (k < NETZ_Y.length - 1) for (m = 1 + (k % 2); m < NETZ_N; m += 2) {
      var A = netzPunkt(k, m), B = netzPunkt(k + 1, m), mid = [(A[0] + B[0]) / 2 * 1.0, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
      mid[0] += 0.03 * Math.sin(m + k); mid[2] += 0.03 * Math.cos(m + k);
      t.push({ g: rohr([A, mid, B], function () { return CAP_R; }, 5, 0), m: ID });
    }
  }
  return fuegen(t);
}
var AR_P = [-0.36, -0.15], VE_P = [0.39, -0.2], LY_P = [0, -0.24];   /* Lage (x, z) von Arteriole, Venole und Lymphgefäß in der Zotte */
function gk(y) { return Math.min(1, zr(ZR0.h, ZR0.r, Math.max(0, y)) / ZR0.r); }   /* Verkleinerung der Lage im Inneren in der Höhe y */
function senkrecht(p, y0, y1, n, wob) {   /* nahezu senkrechte Linie mit leichter Schlängelung */
  var o = [], i;
  for (i = 0; i <= n; i++) {
    var f = i / n, y = y0 + (y1 - y0) * f, k = gk(y);   /* die Gefäße rücken mit der Verjüngung der Zotte zur Achse */
    o.push([p[0] * k + wob * Math.sin(f * 9 + p[0] * 5), y, p[1] * k + wob * Math.cos(f * 7 + p[1] * 5)]);
  }
  return o;
}
function arterioleGeo() {
  var t = [{ g: rohr(senkrecht(AR_P, -0.8, 0.9 * ZR0.h, 30, 0.012), function (f) { return 0.095 - 0.025 * f; }, 8, 1), m: ID }];
  [4, 6].forEach(function (i) {   /* Äste zum obersten Ring des Netzes */
    var k8 = gk(0.9 * ZR0.h), A = netzPunkt(8, i), S = [AR_P[0] * k8 + 0.02, 0.9 * ZR0.h - 0.1 - (i - 4) * 0.05, AR_P[1] * k8];
    t.push({ g: rohr([S, [(S[0] + A[0]) / 2, (S[1] + A[1]) / 2 + 0.05, (S[2] + A[2]) / 2], A], function () { return 0.04; }, 6, 2), m: ID });
  });
  return fuegen(t);
}
function venoleGeo() {
  var t = [{ g: rohr(senkrecht(VE_P, -0.8, 0.84 * ZR0.h, 30, 0.012), function (f) { return 0.125 - 0.035 * f; }, 8, 1), m: ID }];
  [[1, 9], [4, 9], [7, 9]].forEach(function (q) {   /* Äste vom Netz zur Venole */
    var A = netzPunkt(q[0], q[1]), y = A[1], S = [VE_P[0] * gk(y) - 0.03, y - 0.04, VE_P[1] * gk(y)];
    t.push({ g: rohr([A, [(S[0] + A[0]) / 2, (S[1] + A[1]) / 2 - 0.03, (S[2] + A[2]) / 2], S], function () { return 0.045; }, 6, 1), m: ID });
  });
  return fuegen(t);
}
function lymphGeo() {
  return rohr(senkrecht(LY_P, -0.8, 0.87 * ZR0.h, 30, 0.01), function (f) { return 0.2 + 0.015 * Math.sin(f * 12); }, 14, 1);
}
function muskelGeo() {
  var t = [], i;
  for (i = 0; i < 7; i++) {
    var a = (-45 + 15 * i) * DEG, rr = 0.55, pts = [], n = 20, j;
    for (j = 0; j <= n; j++) { var f = j / n, yy = -0.8 + (0.84 * ZR0.h + 0.8) * f, w = 0.012 * Math.sin(f * 8 + i * 1.3), q = (rr + w) * gk(yy); pts.push([q * Math.sin(a), yy, -q * Math.cos(a)]); }
    t.push({ g: rohr(pts, function () { return 0.024; }, 4, 1), m: ID });
  }
  return fuegen(t);
}
/* =====================================================================
   Strömung: Wege der Teilchen (nur Daten und Formeln, kein three.js, kein Zufall) und Zottenpumpe
   ===================================================================== */
var TP = 5;                                              /* Zottenpumpe: Dauer eines Schlags (s bei "normal") */
var PUMPE_A0 = 0.03, PUMPE_A1 = 0.07;                    /* Verkuerzung der Zotte (Bruchteil der Hoehe) nuechtern und nach dem Essen */
function rz(y) { return zr(ZR0.h, ZR0.r, y); }
function bruch(v) { return v - Math.floor(v); }
/* Verformung der Zotte beim Schlag: Punkte ruecken um a * (Hoehe, hoechstens bis zur Spitze) nach unten, die Zotte wird dabei ein wenig dicker. Dieselbe Formel steht im Vertex-Shader
   der Materialien der mittleren Zotte (GLSL_PUMPE); die Teilchen werden mit pumpe() verformt, so bleiben Netze und Teilchen zusammen. o = { x, y, z } */
function pumpe(o, a) {
  var y = o.y, w = sstep(0.2, 2.0, y), f = 1 + 0.6 * a * w;
  o.x *= f; o.z *= f; o.y = y - a * Math.min(Math.max(y, 0), ZR0.h);
  return o;
}
var GLSL_PUMPE = [
  'uniform float uPump;',
  'vec3 zPumpe(vec3 p) {',
  '  float y = p.y;',
  '  float f = 1.0 + 0.6 * uPump * smoothstep(0.2, 2.0, y);',
  '  return vec3(p.x * f, y - uPump * min(max(y, 0.0), ' + ZR0.h.toFixed(3) + '), p.z * f);',
  '}'
].join('\n');
function polyMit(pts) {   /* Linienzug mit Bogenlaenge */
  var cum = [0], i;
  for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.sqrt(Math.pow(pts[i][0] - pts[i - 1][0], 2) + Math.pow(pts[i][1] - pts[i - 1][1], 2) + Math.pow(pts[i][2] - pts[i - 1][2], 2)));
  return { p: pts, cum: cum, L: cum[cum.length - 1] };
}
function polyBei(pf, s, o) {   /* Punkt bei Bogenlaenge s */
  s = Math.max(0, Math.min(pf.L, s));
  var lo = 0, hi = pf.p.length - 1;
  while (hi - lo > 1) { var m = (lo + hi) >> 1; if (pf.cum[m] <= s) lo = m; else hi = m; }
  var d = pf.cum[hi] - pf.cum[lo], t = d > 1e-9 ? (s - pf.cum[lo]) / d : 0, a = pf.p[lo], b = pf.p[hi];
  o.x = a[0] + (b[0] - a[0]) * t; o.y = a[1] + (b[1] - a[1]) * t; o.z = a[2] + (b[2] - a[2]) * t;
  return o;
}
function senkrechtBei(p, y0, y1, wob, y) {   /* Punkt der Linie von senkrecht() in der Hoehe y (stetig) */
  var f = (y - y0) / (y1 - y0), k = gk(y);
  return [p[0] * k + wob * Math.sin(f * 9 + p[0] * 5), y, p[1] * k + wob * Math.cos(f * 7 + p[1] * 5)];
}
var FL = null;
function fluss() {   /* Linien der Gefaesse (wie ihre Netze) und Abschnitte des Kapillarnetzes; je einmal berechnet */
  if (FL) return FL;
  FL = { art: senkrecht(AR_P, -0.8, 0.9 * ZR0.h, 30, 0.012), ven: senkrecht(VE_P, -0.8, 0.84 * ZR0.h, 30, 0.012), lym: senkrecht(LY_P, -0.8, 0.87 * ZR0.h, 30, 0.01), schwanz: {}, kopf: {} };
  return FL;
}
/* Weg im Kapillarnetz von Ring kS, Punkt iS zu Ring kE, Punkt iE: laengs der Ringe und ueber die Verbindungsstuecke (so wie kapillarGeo sie baut) */
function netzRoute(kS, iS, kE, iE) {
  var k = kS, i = iS, pts = [netzPunkt(k, i)], j;
  function ring(to) { var st = to > i ? 1 : -1; for (j = i + st; j !== to + st; j += st) pts.push(netzPunkt(k, j)); i = to; }
  while (k !== kE) {
    var st = kE > k ? 1 : -1, lo = Math.min(k, k + st), m, best = -1, bd = 99;
    for (m = 1 + (lo % 2); m < NETZ_N; m += 2) if (Math.abs(m - i) < bd) { bd = Math.abs(m - i); best = m; }
    ring(best);
    var A = netzPunkt(k, best), B = netzPunkt(k + st, best), mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
    mid[0] += 0.03 * Math.sin(best + lo); mid[2] += 0.03 * Math.cos(best + lo);
    pts.push(mid); k += st; i = best; pts.push(netzPunkt(k, i));
  }
  ring(iE);
  return pts;
}
function venenSchwanz(kE) {   /* vom Netz (Ring kE, Punkt 9) ueber den Ast zur Venole und an ihr hinunter */
  var F = fluss();
  if (F.schwanz[kE]) return F.schwanz[kE];
  var A = netzPunkt(kE, 9), y = A[1], g = gk(y), S = [VE_P[0] * g - 0.03, y - 0.04, VE_P[1] * g], out = [[(S[0] + A[0]) / 2, (S[1] + A[1]) / 2 - 0.03, (S[2] + A[2]) / 2], S], i;
  for (i = F.ven.length - 1; i >= 0; i--) if (F.ven[i][1] < S[1] - 0.02) out.push(F.ven[i]);
  return (F.schwanz[kE] = out);
}
function arterienKopf(i0) {   /* von unten an der Arteriole hinauf und ueber den Ast zum obersten Ring des Netzes (ohne den Netzpunkt selbst) */
  var F = fluss();
  if (F.kopf[i0]) return F.kopf[i0];
  var k8 = gk(0.9 * ZR0.h), S = [AR_P[0] * k8 + 0.02, 0.9 * ZR0.h - 0.1 - (i0 - 4) * 0.05, AR_P[1] * k8], A = netzPunkt(8, i0), out = [], i;
  for (i = 0; i < F.art.length; i++) if (F.art[i][1] < S[1] - 0.02) out.push(F.art[i]);
  out.push(S, [(S[0] + A[0]) / 2, (S[1] + A[1]) / 2 + 0.05, (S[2] + A[2]) / 2]);
  return (F.kopf[i0] = out);
}
/* Pumpe: Fortschritt der Lymphe. G waechst mit der Zeit und springt bei jedem Schlag (gleichzeitig mit dem Verkuerzen der Zotte) um ein Stueck vorwaerts */
function lymphG(t) { var c = t / TP, fl = Math.floor(c); return 0.3 * c + 0.7 * (fl + sstep(0, 0.45, c - fl)); }

/* Materialien (Farbe, Optionen für Kern.mat; dicht = zählt beim Antippen als undurchsichtig), Zeichenreihenfolge */
function matDef() {
  var D = THREE.DoubleSide;
  return {
    saumzellen: [0xFFFFFF, { rough: 0.75 }, 1],
    saumkerne: [0x8A5C78, { rough: 0.6 }, 1],
    buerstensaum: [0xFFFFFF, { rough: 1.0, vc: true, side: D }, 2],
    becherzellen: [0xCFE0EA, { rough: 0.3, coat: 0.3, side: D, dicht: true }, 2],
    kapillarnetz: [0xE0707A, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    arteriole: [0xC8372D, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    venole: [0x7A5CB0, { rough: 0.4, coat: 0.3, dicht: true }, 2],
    lymphgefaess: [0xF3E39A, { rough: 0.35, coat: 0.4, opacity: 0.75, dicht: true }, 4],
    muskelfasern: [0xB4545A, { rough: 0.5, dicht: true }, 2],
    krypten: [0x9E5A86, { rough: 0.5, coat: 0.2, side: D }, 1],
    ringfalte: [0xDDA08E, { rough: 0.6, side: D }, 1],
    nachbarn: [0xE9B7A8, { rough: 0.5, opacity: 0.5 }, 6]
  };
}
/* Alle Teile der Zotte: { sid, name, geo, inst (n, mat, col) oder null } */
function teile() {
  var z = zellDaten();
  return [
    { sid: 'ringfalte', name: 'Ringfalte', geo: sockelDaten(), inst: null },
    { sid: 'krypten', name: 'Krypten', geo: kryptenGeo(), inst: null },
    { sid: 'nachbarn', name: 'Nachbarzotten', geo: nachbarnGeo(), inst: null },
    { sid: 'saumzellen', name: 'Saumzellen', geo: rundBox(0.22), inst: z.zellen },
    { sid: 'saumzellen', mat: 'saumkerne', name: 'Zellkerne', geo: kernGeo(), inst: z.kerne },
    { sid: 'buerstensaum', name: 'Bürstensaum', geo: saumGeo(z.saum), inst: null },
    { sid: 'becherzellen', name: 'Becherzellen', geo: becherGeo(z.becher), inst: null },
    { sid: 'kapillarnetz', name: 'Kapillarnetz', geo: kapillarGeo(), inst: null },
    { sid: 'arteriole', name: 'Arteriole', geo: arterioleGeo(), inst: null },
    { sid: 'venole', name: 'Venole', geo: venoleGeo(), inst: null },
    { sid: 'lymphgefaess', name: 'Zentrales Lymphgefäß', geo: lymphGeo(), inst: null },
    { sid: 'muskelfasern', name: 'Glatte Muskelfasern', geo: muskelGeo(), inst: null }
  ];
}
/* Mesh (oder InstancedMesh) aus einem Teil; mt = Material (Kern.mat) */
function teilMesh(t, mt, order) {
  var m;
  if (t.inst) {
    m = new THREE.InstancedMesh(t.geo, mt, t.inst.n);
    m.instanceMatrix.array.set(t.inst.mat); m.instanceMatrix.needsUpdate = true;
    if (t.inst.col) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(t.inst.col), 3);   /* Farbe je Zelle */
    m.frustumCulled = false;
  } else m = new THREE.Mesh(t.geo, mt);
  m.name = t.name; m.renderOrder = order; m.userData.sid = t.sid;
  return m;
}
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
var UEBERSICHT = { ext: [16.4, 11.4], halb: 8.2, ziel: [0, 2.0, -1.6], theta: 0, phi: 1.2 };
function bereichFuer(w, h, toolsOben, toolsUnten, ueben) {
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 54, y1: Math.max(150, toolsOben - 14 - 0.20 * h), labW: 104, fit: 70 };   /* Handy beim Üben: die Karte (20 % der Höhe) liegt direkt über der Werkzeugleiste */
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schätzung ihrer Ränder nach gemessener Höhe (WERKZEUG_H, vier Zeilen; kommen Zeilen oder Knöpfe dazu, ist sie neu zu messen);
   aufbauen misst sie selbst, die Werte stimmen überein. Die Leiste folgt dem Handy-Layout bis einschließlich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
var WERKZEUG_H = { desktop: 150, handy: 126 };   /* gemessen bei 1280 x 800 und 390 x 844 (vier Zeilen) */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: über der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - WERKZEUG_H.handy, unten: u };
  }
  return { oben: 18, unten: 18 + WERKZEUG_H.desktop };
}
/* Startansicht bei Fenstergröße w x h: Kamera (Blickpunkt in Modell-Koordinaten) und View-Offset (Pixel); die Werte, mit denen aufbauen die Übersicht zeigt */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
organ.form = { matDef: matDef, teile: teile, teilMesh: teilMesh, hoehe: ZR0.h, breite: SX1 - SX0, tiefe: SZ1 - SZ0, unten: SY0 };

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
var GLAS = 0.22, GLAS_HAAR = 0.35;                         /* Deckkraft der Saumzellen und des Bürstensaums bei "Durchsicht" */
var MAT = {}, DEF = matDef();   /* Materialien je Schlüssel von matDef (meist = Struktur; saumkerne gehört zur Struktur saumzellen) */
/* Die Gefäße sind hier gläsern, damit man die Teilchen darin sieht (nur in diesem Modell; matDef der Form bleibt für die Fahrt aus dem Darm unverändert); sie zählen weiter als undurchsichtig (dicht) */
['kapillarnetz', 'arteriole', 'venole'].forEach(function (sid) { DEF[sid][1].opacity = 0.5; });
DEF.lymphgefaess[1].opacity = 0.62;
/* Zottenpumpe: alle Teile der mittleren Zotte werden im Vertex-Shader mit derselben Formel verformt wie die Teilchen (pumpe) */
var PU = { uPump: { value: 0 } };
var PUMPT = ['saumzellen', 'saumkerne', 'buerstensaum', 'becherzellen', 'kapillarnetz', 'arteriole', 'venole', 'lymphgefaess', 'muskelfasern'];
function pumpMat(m) {
  m.onBeforeCompile = function (sh) {
    sh.uniforms.uPump = PU.uPump;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_PUMPE)
      .replace('#include <project_vertex>', ['vec4 mvPosition = vec4( transformed, 1.0 );', '#ifdef USE_INSTANCING', '  mvPosition = instanceMatrix * mvPosition;', '#endif',
        'mvPosition = vec4( zPumpe( mvPosition.xyz ), 1.0 );', 'mvPosition = modelViewMatrix * mvPosition;', 'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  };
}
Object.keys(DEF).forEach(function (sid) {
  var d = DEF[sid], o = {}, k;
  for (k in d[1]) o[k] = d[1][k];
  MAT[sid] = Kern.mat(d[0], o, envTex); MAT[sid].name = sid;
  if (o.dicht) MAT[sid].userData.dicht = true;
  if (PUMPT.indexOf(sid) >= 0) pumpMat(MAT[sid]);
});
var root = new THREE.Group(); root.name = 'Dünndarmzotte'; scene.add(root);
var tris = { gesamt: 0 };
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* Aufbau (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
async function bauen() {
  await setLoad(0.2, 'Dünndarmzotte'); if (abgebaut) return;
  var liste = teile(), i;
  for (i = 0; i < liste.length; i++) {
    var t = liste[i], m = teilMesh(t, MAT[t.mat || t.sid], DEF[t.mat || t.sid][2]);
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
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait, vor, auto } */
var wege = null, wegeT = null;   /* Ueben "Wege verfolgen" (siehe Abschnitt vor dem Antippen) */
var autoGehe = false;            /* gehe wird vom Ueben selbst gerufen: keine neue Aufgabe */
ORDER.forEach(function (s) { enabled[s.id] = true; });

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (Gefaesse, Becherzellen) */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh && !o.userData.teilchen) o.visible = !!enabled[o.userData.sid]; });   /* Teilchen stellen sich selbst (Stoffe-Schalter) */
  if (ST) ST.letzt = '';
  lv++;
}
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  stelleMat(MAT.saumzellen, seeThrough, seeThrough ? GLAS : 1);
  stelleMat(MAT.buerstensaum, seeThrough, seeThrough ? GLAS_HAAR : 1);
  stelleMat(MAT.saumkerne, seeThrough, seeThrough ? 0.6 : 1);
}
function setSelected(id) {
  if (id && (quiz || wege)) id = null;                   /* beim Ueben keine Infokarte */
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
  if (!quiz && !wege) closeCard();                       /* die Infokarte ersetzt eine offene Hilfekarte; beim Ueben erscheint sie nicht */
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

function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility();
}
function waehleListe(id) {
  if (quiz || wege) return;
  setSelected(id);
}
(function leiste() {
  /* Reiter: Strukturen (nach Gruppen, Farbpunkt blendet die Struktur ein und aus), Hilfekarten, Ueben */
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
      $('legend').classList.toggle('zu', k !== 0);   /* Hilfekarten und Ueben zeigen ihren Inhalt ganz: die Lesehilfe ist dann zugeklappt (Klick auf die Ueberschrift klappt sie auf) */
      railHoehe(window.innerWidth);
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
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur an der Zotte und tippe sie an. Die Beschriftung verschwindet solange. Oder verfolge einen Weg: Tippe die Stationen der Reihe nach an.'; paneU.appendChild(iu);
  var pb = document.createElement('div'); pb.className = 'pane-btn';
  var bq = document.createElement('button'); bq.className = 'gh'; bq.id = 'bQuiz'; bq.textContent = 'Strukturen finden';
  bq.addEventListener('click', function () { quiz ? quizEnd() : quizStart(); });
  var bw = document.createElement('button'); bw.className = 'gh'; bw.id = 'bWege'; bw.textContent = 'Wege verfolgen';
  bw.addEventListener('click', function () { wege ? wegeEnd() : wegeStart(); });
  pb.appendChild(bq); pb.appendChild(bw); paneU.appendChild(pb);
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

function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  applyLook();
  lv++;
  if (quiz) quizNeu(true);                               /* andere Ansicht: neue Aufgabe aus den jetzt sichtbaren Strukturen */
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
   3. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
/* ext = Breite und Hoehe (Einheiten), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite, die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Zotte innen', theta: 0, phi: 1.38, target: V(0, 3.55, 0), ext: [3.6, 8.2], halb: 1.8 },
  { name: 'Oberfläche', theta: PI, phi: 1.3, target: V(0, 3.8, -0.4), ext: [3.4, 6.6], halb: 1.7 },
  { name: 'Krypten', theta: 0.25, phi: 0.85, target: V(0, -0.5, -0.8), ext: [11, 7.5], halb: 5.4 }
];
var view = { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: 20, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 1.2, maxDist: 60 });
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
  if (quiz && !autoGehe) quizNeu(true);
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
$('legend').querySelector('h4').addEventListener('click', function () { $('legend').classList.toggle('zu'); railHoehe(window.innerWidth); });
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
/* Ueben "Strukturen finden": "Tippe auf: ..." - alle Strukturen ausser den Nachbarzotten. Die inneren Strukturen (Kapillarnetz, Gefaesse, Muskelfasern) liegen nur im Ausschnitt "Zotte innen",
   Buerstensaum und Becherzellen im Ausschnitt "Oberflaeche", die Krypten im Ausschnitt "Krypten" im Bild (NUR_INNEN): wer sie wuerfelt, bekommt den passenden Ausschnitt (autoGehe); beim
   Beenden kehrt die Ansicht zurueck. Wechselt man den Ausschnitt selbst, gilt nur der Teil, der dort passt (bleibe). Math.random nur hier, bei der Auswahl der gesuchten Struktur. */
function quizAusschnitte(id) { return NUR_INNEN[id] || [0]; }
function quizPool(bleibe) {
  return ORDER.filter(function (s) {
    if (!s.meshes.length || !enabled[s.id] || KEIN_QUIZ.indexOf(s.id) >= 0) return false;
    if (bleibe && quizAusschnitte(s.id).indexOf(aktiv) < 0) return false;
    return true;
  }).map(function (s) { return s.id; });
}
function quizNext(bleibe) {
  var pool = quizPool(bleibe); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  var ziele = quizAusschnitte(id);
  if (ziele.indexOf(aktiv) < 0) { autoGehe = true; quiz.auto = true; gehe(ziele[0]); autoGehe = false; }
  showCard('Üben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe die Zotte, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizNeu(bleibe) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(bleibe); }
function uebenKlasse() { document.body.classList.toggle('ueben', !!(quiz || wege)); groesse(window.innerWidth, window.innerHeight); }   /* Handy: Karte unten, Bildbereich darueber */
function quizStart() {
  if (wege) wegeEnd();
  setSelected(null); quiz = { n: 0, ok: 0, target: null, last: null, wait: false, vor: aktiv, auto: false };
  $('bQuiz').classList.add('on'); $('bQuiz').textContent = 'Üben beenden';
  $('qNext').textContent = 'Nächste'; $('qNext').style.display = '';
  uebenKlasse(); lv++; quizNext();
}
function quizEnd() {
  clearTimeout(quizT);
  if (quiz && quiz.target) leuchte(quiz.target, false);
  var vor = quiz && quiz.auto ? quiz.vor : -1;
  quiz = null; closeCard(); $('bQuiz').classList.remove('on'); $('bQuiz').textContent = 'Strukturen finden';
  uebenKlasse();
  if (vor >= 0 && vor !== aktiv) gehe(vor);              /* Ansicht wie vor dem Ueben */
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
/* Ueben "Wege verfolgen": die Stationen eines Weges (WEGE, Daten oben) der Reihe nach antippen. Die Abfolge kennt nur Stationen (Listen von Struktur-ids), Karte und Leuchten.
   Zustand wege: nr = Weg, st = naechste Station, n = erledigte Stationen, ok = davon auf Anhieb richtig, fehl = Fehler in Folge bei der gesuchten Station, liste = Namen der erledigten
   Stationen, fertig = Weg abgeschlossen. Waehrend der Wege sind die Saumzellen durchsichtig (Zellen, Buerstensaum und Kapillarnetz liegen im selben Strahl: der Treffer zaehlt, was davor
   steht, steht in durch); der Weg wechselt je Station in den Ausschnitt (Feld an). Beim Beenden kehrt alles zurueck. */
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
function wegeAnsicht() {                                 /* Ausschnitt der naechsten Station */
  var s = WEGE[wege.nr].stationen[wege.st]; if (!s) return;
  var ziel = s.an || 0;
  if (ziel !== aktiv) { autoGehe = true; gehe(ziel); autoGehe = false; }
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
  var w = WEGE[nr];
  if (w.mahlzeit !== undefined) setMahlzeit(w.mahlzeit, true);   /* dieselbe Funktion wie die Knoepfe, ohne die Einblendung */
  wegeAnsicht();
  wegeZeigen();
}
function wegeStart() {
  if (quiz) quizEnd();
  setSelected(null);
  wege = { nr: 0, st: 0, n: 0, ok: 0, fehl: 0, liste: [], fertig: false, text: null, leucht: [], vorher: { mahlzeit: mahlzeit, durch: seeThrough, aktiv: aktiv } };
  durchsicht(true);                                      /* die Saumzellen glaesern: die Stationen liegen im selben Strahl */
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
  if (v) { setMahlzeit(v.mahlzeit, true); durchsicht(v.durch); if (v.aktiv !== aktiv) gehe(v.aktiv); }   /* Mahlzeit, Durchsicht und Ausschnitt wie vorher */
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
  if (W.st >= w.stationen.length) W.fertig = true; else wegeAnsicht();
  wegeZeigen();
}
$('sClose').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); else closeCard(); };
$('qNext').onclick = function () {
  if (quiz) quizNeu();
  else if (wege && wege.nr < WEGE.length - 1) wegeSetzen(wege.nr + 1);
};
$('qStop').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); };

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Nachbarzotten, Saumzellen bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function trefferAn(cx, cy) {   /* Bildschirmpunkt -> { treffer, weich, durch } */
  var r = canvas.getBoundingClientRect();
  ndc.x = ((cx - r.left) / r.width) * 2 - 1;
  ndc.y = -((cy - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, durch = [];
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    durch.push(sid);
    if (weichMat(o)) { if (!weich) weich = sid; }
    else treffer = sid;
  }
  return { treffer: treffer, weich: weich, durch: durch };
}
function canvasKlick(e) {
  if (orbit.dragged) return;
  var t = trefferAn(e.clientX, e.clientY), name = t.treffer || t.weich || null;
  if (wege) { wegeAntwort(name, t.durch); return; }
  if (quiz) { quizAntwort(name, t.durch); return; }
  setSelected(name);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Kandidaten fuer den Ankerpunkt je Ausschnitt und Struktur (Modell-Koordinaten); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren */
var KAND = [{}, {}, {}, {}];
function ankerBerechnen() {
  var P = function (a) { return V(a[0], a[1], a[2]); };
  var rz = function (y) { return zr(ZR0.h, ZR0.r, y); };
  var pol = function (r, grad, y) { return [r * Math.sin(grad * DEG), y, -r * Math.cos(grad * DEG)]; };
  var hs = [3.4, 4.6, 2.2, 5.4, 1.4, 3.9];
  var rim = function (dr) { var o = []; hs.forEach(function (y, i) { var s = i % 2 ? -1 : 1; o.push([s * (rz(y) + dr), y, 0]); o.push([-s * (rz(y) + dr), y, 0]); }); return o; };
  var innen = function (grad, y) { return pol(rz(y) - CELL_TH - 0.02, grad, y); };
  var aussen = function (grad, y) { return pol(rz(y) + HAAR_L * 0.9, grad, y); };
  var gkk = function (y) { return gk(y); };
  var Z = zellDaten();
  var bech = Z.becher.map(function (b) { return { b: b, d: Math.abs(b.a) }; }).sort(function (p, q) { return p.d - q.d; });
  var becherInnen = bech.map(function (e) { var b = e.b; return [b.p[0] - b.en[0] * (CELL_TH + 0.03), b.p[1] - b.en[1] * (CELL_TH + 0.03), b.p[2] - b.en[2] * (CELL_TH + 0.03)]; });
  var becherAussen = bech.map(function (e) { var b = e.b; return [b.p[0] + b.en[0] * 0.05, b.p[1] + b.en[1] * 0.05, b.p[2] + b.en[2] * 0.05]; });
  var netz = function (k, i) { return netzPunkt(k, i); };
  var entlang = function (p, ys, versatz) { return ys.map(function (y) { return [p[0] * gk(y) + versatz[0], y, p[1] * gk(y) + versatz[1]]; }); };
  var nb = function (i, y) { return zachse(ZOTTEN[i], y); };   /* Punkt auf der Achse der Nachbarzotte i */
  var Zr = [{
    saumzellen: rim(0.0).concat([innen(-60, 3.4), innen(60, 4.6)]),
    buerstensaum: rim(0.06),
    becherzellen: becherInnen.slice(0, 6).concat(becherAussen.slice(0, 6)),
    kapillarnetz: [netz(5, 3), netz(5, 11), netz(3, 4), netz(3, 10), netz(7, 4), netz(7, 10), netz(2, 2), netz(6, 12)],
    arteriole: entlang(AR_P, [4.0, 5.0, 2.5, 5.8, 1.5], [-0.09, 0.0]),
    venole: entlang(VE_P, [3.0, 2.0, 4.2, 1.2, 5.0], [0.12, 0.0]),
    lymphgefaess: entlang(LY_P, [3.4, 2.4, 4.4, 5.4, 1.2], [0, 0.2]),
    muskelfasern: [pol(0.55, 45, 4.2), pol(0.55, -30, 3.0), pol(0.55, 30, 5.0), pol(0.55, -15, 2.2), pol(0.55, 0, 4.6)],
    krypten: KRYPTEN.slice(0, 9).map(function (k) { return [k[0], sockelY(k[0], k[1]) - 0.15, k[1]]; }),
    ringfalte: [[-5.2, -0.1, 1.6], [4.2, -0.2, 1.6], [0.8, -0.6, 1.6], [-3.2, -1.0, 1.6], [1.0, 0.0, 1.0], [-1.0, 0.0, 0.8], [-6.4, -2.2, 0.5], [6.4, -2.2, 0.5]],
    nachbarn: [nb(1, 4.4), nb(2, 4.4), nb(3, 4.8), nb(6, 4.8), nb(4, 5.4), nb(5, 4.6)]
  }];
  Zr.push({   /* Zotte innen */
    saumzellen: rim(0.0).concat([innen(-60, 3.4), innen(60, 4.6), innen(-20, 2.6)]),
    buerstensaum: rim(0.06),
    becherzellen: becherInnen.concat(becherAussen),
    kapillarnetz: [netz(5, 3), netz(5, 11), netz(3, 4), netz(3, 10), netz(7, 4), netz(7, 10), netz(2, 2), netz(6, 12), netz(4, 6)],
    arteriole: entlang(AR_P, [4.0, 5.0, 2.5, 5.8, 1.5, 3.2], [-0.09, 0.0]),
    venole: entlang(VE_P, [3.0, 2.0, 4.2, 1.2, 5.0, 3.6], [0.12, 0.0]),
    lymphgefaess: entlang(LY_P, [3.4, 2.4, 4.4, 5.4, 1.2, 6.0], [0, 0.2]),
    muskelfasern: [pol(0.55, 45, 4.2), pol(0.55, -30, 3.0), pol(0.55, 30, 5.0), pol(0.55, -15, 2.2), pol(0.55, 0, 4.6), pol(0.55, -45, 2.0)],
    ringfalte: [[-1.5, -0.1, 1.6], [1.5, -0.1, 1.6], [0.0, 0.0, 1.0], [-1.0, 0.0, 0.8]]
  });
  Zr.push({   /* Oberfläche (von hinten) */
    saumzellen: [pol(rz(3.4), -40, 3.4), pol(rz(2.6), 30, 2.6), pol(rz(4.4), -30, 4.4), pol(rz(3.4), 10, 3.4)],
    buerstensaum: [aussen(-40, 3.4), aussen(30, 4.4), aussen(0, 2.4), aussen(50, 5.2)],
    becherzellen: becherAussen,
    nachbarn: [nb(4, 5.4), nb(5, 4.6), nb(3, 4.8), nb(6, 4.8)],
    ringfalte: [[-2.0, -0.2, -3.5], [2.0, -0.2, -3.5], [0.0, -0.8, -4.5]],
    krypten: [[0, sockelY(0, -1.4) - 0.1, -1.4], [-1.2, sockelY(-1.2, -3.3) - 0.1, -3.3], [1.3, sockelY(1.3, -3.4) - 0.1, -3.4]]
  });
  Zr.push({   /* Krypten */
    krypten: KRYPTEN.map(function (k) { return [k[0], sockelY(k[0], k[1]) - 0.2, k[1]]; }),
    ringfalte: [[-0.9, 0.0, -0.9], [0.9, 0.0, -0.9], [-2.5, -0.1, 0.6], [2.5, -0.1, 0.5], [0.0, -0.1, 1.6], [-4.0, -0.3, -0.4]],
    saumzellen: rim(0.0).slice(0, 4),
    nachbarn: [nb(1, 3.2), nb(2, 3.2), nb(4, 3.2), nb(5, 3.2)]
  });
  AUSSCHNITTE.forEach(function (a, i) { Object.keys(Zr[i]).forEach(function (id) { KAND[i][id] = Zr[i][id].map(function (q) { return P(Array.isArray(q) ? q : [0, 0, 0]); }); }); });
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
    if (sid === 'buerstensaum' && id === 'saumzellen') continue;   /* die Mikrovilli sitzen auf den Zellen: sie verdecken sie nicht */
    if (hits[i].distance < d - 0.02) return false;
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
var KURZ = { lymphgefaess: 'Lymphgefäß', muskelfasern: 'Muskelfasern' };
var HANDYNAME = { becherzellen: 'Becherzellen', lymphgefaess: 'Lymphgefäß', muskelfasern: 'Muskelfasern', kapillarnetz: 'Kapillarnetz' };   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
var HANDY_GROSS = ['saumzellen', 'lymphgefaess', 'kapillarnetz', 'ringfalte', 'nachbarn', 'krypten'];   /* Handy, Uebersicht: nur diese werden beschriftet */
var LISTEN = [
  ['saumzellen', 'buerstensaum', 'becherzellen', 'kapillarnetz', 'arteriole', 'venole', 'lymphgefaess', 'muskelfasern', 'krypten', 'ringfalte', 'nachbarn'],
  ['saumzellen', 'buerstensaum', 'becherzellen', 'kapillarnetz', 'arteriole', 'venole', 'lymphgefaess', 'muskelfasern', 'ringfalte'],
  ['saumzellen', 'buerstensaum', 'becherzellen', 'nachbarn', 'ringfalte', 'krypten'],
  ['krypten', 'ringfalte', 'saumzellen', 'nachbarn']
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
  if (showLabels && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt das Modell, ohne Beschriftung bleibt es frei */
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
   6. Stroemung: Zucker (gelb), Aminosaeuren (orange), Fett (weiss), Wasser (hellblau) und Blut (rot zu violett) als Teilchen, dazu der Mahlzeit-Schalter und die Zottenpumpe.
   Symbolisch, nicht massstaeblich, die Zeit ist stark gerafft. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des Teilchens: kein Zufall, die Zahl der
   Teilchen steht beim Aufbau fest (je Art ein InstancedMesh). Lagen werden in der Ruhelage der Zotte berechnet und dann mit pumpe() verformt (wie die Netze im Shader).
   Weg eines Stoffteilchens (Zyklus P = 30 s): Darminhalt neben und ueber den Zotten (Phase 1) -> Buerstensaum und Saumzelle (2) -> Kapillarnetz (3) -> Venole nach unten (4) und hinaus;
   Zucker, Aminosaeuren und Wasser gehen an den seitlichen Rand der Zotte (dort sieht man sie), das Fett an die Rueckwand: in der Zelle wird es kleiner (verpackt zu Chylomikronen), quert
   das Gewebe (7) und rutscht im zentralen Lymphgefaess (6) mit den Schlaegen der Pumpe stossweise nach unten. Das Blut fliesst immer: Arteriole (5) hinauf, durchs Netz, Venole hinunter.
   Nach dem Essen (Zeit te seit dem Wechsel) kommen die Teilchen nach und nach an (Fenster an), nuechtern laufen nur wenige (nR) Ruhe-Teilchen; der Wechsel blendet in Echtzeit ein bzw. aus.
   Zottenpumpe: alle TP s verkuerzt sich die Zotte ein wenig (nuechtern 3 %, nach dem Essen 7 % der Hoehe), gleichzeitig springt die Lymphe ein Stueck nach unten (lymphG).
   ===================================================================== */
var playing = true, speed = 1, clock = 0, tM = 0, mahlzeit = false, fzR = 0, fe = 0, fzFest = false, pumpA = 0, feMilch = -1;   /* fzR: Uebergang roh 0..1, fe: weich */
var SZ_ = { UEBERG: 1.5, P: 30, PB: 20 };
var R2A = 0.7548776662466927, R2B = 0.5698402909980532;   /* Plastikzahl-Folge (R2): gleichmaessig verteilte Paare aus dem Index */
/* Arten: an = Fenster der Ankunftszeiten (s nach dem Essen), nR = die ersten nR Teilchen sind die Ruhe-Teilchen (nuechtern) */
var KINDS = [
  { id: 'zucker', name: 'Zucker', col: 0xE6C94A, em: 0x7A5F10, n: 64, rad: 0.07, an: [0, 14], nR: 6, btn: 'bZucker' },
  { id: 'amino', name: 'Aminosäuren', col: 0xF09A3E, em: 0x7A3A08, n: 56, rad: 0.07, an: [1, 15], nR: 5, btn: 'bAmino' },
  { id: 'fett', name: 'Fett', col: 0xF2F2EE, em: 0x66665F, n: 44, rad: 0.1, an: [2, 18], nR: 3, btn: 'bFett' },
  { id: 'wasser', name: 'Wasser', col: 0x8FD0F0, em: 0x1F5A86, n: 70, rad: 0.056, an: [0, 12], nR: 7, btn: 'bWasser' },
  { id: 'blut', name: 'Blut', col: 0xC8372D, em: 0x5A1410, n: 80, rad: 0.038, nR: 0 }
];
var KI = { zucker: 0, amino: 1, fett: 2, wasser: 3, blut: 4 };
var kindOn = [true, true, true, true, true];
var TAG_SID = [null, null, 'saumzellen', 'kapillarnetz', 'venole', 'arteriole', 'lymphgefaess', null];   /* Etikett des Abschnitts (1 Darminhalt, 2 Zelle, 3 Kapillare, 4 Venole, 5 Arteriole, 6 Lymphe, 7 Gewebe) -> Struktur */
var BLUT_C0 = srgb(0xC8372D), BLUT_C1 = srgb(0x7A5CB0);
var ST = null, STM = new THREE.Matrix4(), LB = { x: 0, y: 0, z: 0, s: 0, t: 0, c: 0 }, TMPP = { x: 0, y: 0, z: 0 };
var IS_ = [0, 1, 2, 3, 11, 12, 13, 14], EXITR = [1, 4, 7];   /* Eintrittspunkte am Rand (Winkel ab 48 Grad) und Ringe mit Ast zur Venole */
var UA = 0.22, UB = 0.30, UC = 0.38;                       /* Zucker/Aminosaeuren/Wasser: Darminhalt bis UA, Buerstensaum und Zelle bis UB, zur Kapillare bis UC, dann im Gefaess */
var FA = 0.20, FB = 0.34, FC = 0.40, FD = 0.50;            /* Fett: Darminhalt, Zelle, innere Zellgrenze, Gewebe, ab FD im Lymphgefaess */

/* Feste Eigenschaften je Index (nur aus dem Index) und die Wege durch das Netz */
function teilchenDaten() {
  KINDS.forEach(function (K, ki) {
    var i;
    K.e = []; K.pz = []; K.rs = []; K.pf = []; K.l0 = []; K.l1 = []; K.aS = []; K.yS = []; K.rN = []; K.a0 = []; K.r0 = []; K.y0 = []; K.ox = []; K.oz = [];
    for (i = 0; i < K.n; i++) {
      var q = bruch(0.5 + i * R2A + ki * 0.37), ph = bruch(0.1 + i * R2B + ki * 0.21), w = bruch(0.3 + i * 0.6180339887 + ki * 0.11), v = bruch(0.7 + i * R2A * 1.7 + ki * 0.29), u = bruch(0.2 + i * 0.3247 + ki * 0.17);
      K.pz.push(ph); K.rs.push(0.85 + 0.3 * bruch(i * 0.37 + ki));
      K.e.push(K.an ? K.an[0] + (K.an[1] - K.an[0]) * q : 0);
      var aS = 0, yS = 0, rN = 0, a0 = 0, r0 = 0, y0 = 0, l0 = 0, l1 = 0, pf = null, ox = 0, oz = 0, sg;
      if (ki === KI.blut) {
        var i0 = i % 2 ? 6 : 4, kE = EXITR[Math.floor(w * 3)], kopf = arterienKopf(i0), route = netzRoute(8, i0, kE, 9), tail = venenSchwanz(kE);
        pf = polyMit(kopf.concat(route, tail));
        l0 = pf.cum[kopf.length - 2]; l1 = pf.cum[kopf.length + route.length + 1];
      } else if (ki === KI.fett) {
        aS = (bruch(0.43 + i * R2A * 1.1) - 0.5) * 2 * 25 * DEG; yS = 1.0 + bruch(0.21 + i * R2B * 1.3) * 4.5;
        sg = bruch(0.9 + i * R2A) < 0.5 ? -1 : 1; a0 = sg * Math.min(105 * DEG, Math.abs(aS) + (40 + 40 * u) * DEG);
        r0 = rz(yS) + HAAR_L + 0.7 + 0.5 * w; y0 = yS + 1.2 + 1.8 * v;
        var fi = 2 * PI * bruch(0.6 + i * 0.3247), fr = 0.06 * (0.4 + 0.6 * w); ox = fr * Math.cos(fi); oz = fr * Math.sin(fi);
      } else {
        var kS = Math.floor(bruch(0.31 + i * R2A * 1.3 + ki * 0.17) * 9), iS = IS_[Math.floor(bruch(0.77 + i * R2B * 1.9 + ki * 0.3) * 8)], kE2 = EXITR[0], d;
        for (d = 1; d < 3; d++) if (Math.abs(kS - EXITR[d]) < Math.abs(kS - kE2)) kE2 = EXITR[d];
        var rt = netzRoute(kS, iS, kE2, 9), net = netzPunkt(kS, iS);
        pf = polyMit(rt.concat(venenSchwanz(kE2)));
        l1 = pf.cum[rt.length + 1];
        aS = -PI / 2 + PI * iS / NETZ_N; yS = net[1]; rN = Math.sqrt(net[0] * net[0] + net[2] * net[2]);
        sg = aS < 0 ? -1 : 1; a0 = sg * Math.min(105 * DEG, Math.abs(aS) + (15 + 25 * u) * DEG);
        r0 = rz(yS) + HAAR_L + 0.7 + 0.5 * w; y0 = yS + 1.2 + 1.8 * v;
      }
      K.aS.push(aS); K.yS.push(yS); K.rN.push(rN); K.a0.push(a0); K.r0.push(r0); K.y0.push(y0); K.l0.push(l0); K.l1.push(l1); K.pf.push(pf); K.ox.push(ox); K.oz.push(oz);
    }
    K.vis = new Float32Array(K.n); K.tag = new Uint8Array(K.n); K.pos = new Float32Array(K.n * 3); K.cc = new Float32Array(K.n);
  });
}
function polar(o, r, a, y) { o.x = r * Math.sin(a); o.z = -r * Math.cos(a); o.y = y; }
/* Lage (Ruhelage) des Teilchens i der Art ki beim Fortschritt u (0..1) seines Zyklus: schreibt o.x, o.y, o.z, o.s (Groesse), o.t (Abschnitt), o.c (Farbe beim Blut) */
function ort(ki, i, u, o) {
  var K = KINDS[ki], f, pf = K.pf[i], P_ = SZ_.P;
  o.t = 0; o.s = 1; o.c = 0;
  if (ki === KI.blut) {
    var sl = u * pf.L; polyBei(pf, sl, o);
    o.t = sl <= K.l0[i] ? 5 : (sl <= K.l1[i] ? 3 : 4); o.c = sstep(K.l0[i], K.l1[i], sl);
    return;
  }
  var yN = K.yS[i], aS = K.aS[i], rzN = rz(yN);
  if (ki === KI.fett) {
    var rc = rzN - CELL_TH - 0.03, E = senkrechtBei(LY_P, -0.8, 0.87 * ZR0.h, 0.01, yN);
    if (u < FA) { f = sstep(0, 1, u / FA); polar(o, K.r0[i] + (rzN + HAAR_L * 0.5 - K.r0[i]) * f, K.a0[i] + (aS - K.a0[i]) * f, K.y0[i] + (yN - K.y0[i]) * f); o.t = 1; return; }
    if (u < FB) { f = (u - FA) / (FB - FA); polar(o, rzN + HAAR_L * 0.5 + (-0.12 - HAAR_L * 0.5) * f, aS, yN); o.t = 2; o.s = 1 - 0.3 * f; return; }
    if (u < FC) { f = (u - FB) / (FC - FB); polar(o, rzN - 0.12 + (rc - rzN + 0.12) * f, aS, yN); o.t = 2; o.s = 0.7; return; }
    if (u < FD) {
      f = sstep(0, 1, (u - FC) / (FD - FC)); polar(o, rc, aS, yN);
      o.x += (E[0] + K.ox[i] - o.x) * f; o.z += (E[2] + K.oz[i] - o.z) * f; o.t = 7; o.s = 0.7 - 0.15 * f; return;
    }
    var tau = (u - FD) * P_, TD = (1 - FD) * P_, Te = clock - tau, g0 = lymphG(Te), z = (lymphG(clock) - g0) / (lymphG(Te + TD) - g0), y = yN - z * (yN + 0.7);
    var L = senkrechtBei(LY_P, -0.8, 0.87 * ZR0.h, 0.01, y);
    o.x = L[0] + K.ox[i]; o.y = y; o.z = L[2] + K.oz[i]; o.t = 6; o.s = 0.55;
    return;
  }
  if (u < UA) { f = sstep(0, 1, u / UA); polar(o, K.r0[i] + (rzN + HAAR_L * 0.5 - K.r0[i]) * f, K.a0[i] + (aS - K.a0[i]) * f, K.y0[i] + (yN - K.y0[i]) * f); o.t = 1; return; }
  if (u < UB) { f = (u - UA) / (UB - UA); polar(o, rzN + HAAR_L * 0.5 + (-0.15 - HAAR_L * 0.5) * f, aS, yN); o.t = 2; o.s = 1 - 0.15 * f; return; }
  if (u < UC) { f = (u - UB) / (UC - UB); polar(o, rzN - 0.15 + (K.rN[i] - rzN + 0.15) * f, aS, yN); o.t = f < 0.85 ? 2 : 3; o.s = 0.85 - 0.35 * f; return; }
  var s = (u - UC) / (1 - UC) * pf.L; polyBei(pf, s, o);
  o.t = s <= K.l1[i] ? 3 : 4; o.s = 0.5 + 0.3 * sstep(K.l1[i] - 0.2, K.l1[i] + 0.2, s);
}
/* Teilchen i der Art ki zur Zeit clock (ruhende Teilchen laufen immer, die anderen nach dem Essen); o.s = 0: nicht da */
function lauf(ki, i, o) {
  var K = KINDS[ki], P_ = ki === KI.blut ? SZ_.PB : SZ_.P, tl, w = 1, u;
  o.s = 0; o.t = 0;
  if (ki === KI.blut || i < K.nR) tl = clock + K.pz[i] * P_;
  else {
    var te = clock - tM - K.e[i];
    if (fe < 0.001 || te <= 0) return;
    tl = te; w = sstep(0, 0.25, fe) * sstep(0, 1, te);
  }
  u = bruch(tl / P_);
  ort(ki, i, u, o);
  o.s *= w * sstep(0, 0.03, u) * (1 - sstep(0.95, 1, u));
}
function tmat(col, em) {
  var m = Kern.mat(col, { rough: 0.35 }, envTex);
  m.emissive.copy(srgb(em)).multiplyScalar(0.6);
  return m;
}
/* Aufbau: Wege, Tabellen, Teilchen (immer gleich viele Objekte, unabhaengig von der Auswahl) */
function stroemungBauen() {
  teilchenDaten();
  ST = { letzt: '' };
  KINDS.forEach(function (K, ki) {
    var m = tmat(K.col, K.em), geo = new THREE.SphereGeometry(1, 10, 7), im = new THREE.InstancedMesh(geo, m, K.n);
    m.name = 'teilchen-' + K.id;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (ki === KI.blut) { im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(K.n * 3), 3); im.instanceColor.setUsage(THREE.DynamicDrawUsage); }
    im.frustumCulled = false;
    im.name = K.name; im.userData.teilchen = K.id; im.userData.noexport = true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); K.im = im;
  });
  stroemungBild();
}
/* je Bild: Teilchen setzen (nur wenn sich Zeit, Uebergang, Auswahl oder Stoffe aendern) */
function stroemungBild() {
  if (!ST) return;
  var key = clock + '|' + fe + '|' + tM + '|' + kindOn.join('');
  if (key === ST.letzt) return;
  ST.letzt = key;
  var ki, i;
  for (ki = 0; ki < KINDS.length; ki++) {
    var K = KINDS[ki], im = K.im, col = ki === KI.blut ? im.instanceColor.array : null;
    im.visible = kindOn[ki];
    for (i = 0; i < K.n; i++) {
      lauf(ki, i, LB);
      var r = LB.s > 0 ? K.rad * K.rs[i] * LB.s : 0;
      if (r < 0.0008) r = 0;
      if (r > 0 && TAG_SID[LB.t] && !enabled[TAG_SID[LB.t]]) r = 0;   /* Inhalt einer ausgeblendeten Struktur */
      K.vis[i] = r; K.tag[i] = r > 0 ? LB.t : 0; K.pos[i * 3] = LB.x; K.pos[i * 3 + 1] = LB.y; K.pos[i * 3 + 2] = LB.z; K.cc[i] = LB.c;
      TMPP.x = LB.x; TMPP.y = LB.y; TMPP.z = LB.z; pumpe(TMPP, pumpA);
      if (col) { var c = LB.c; col[i * 3] = BLUT_C0.r + (BLUT_C1.r - BLUT_C0.r) * c; col[i * 3 + 1] = BLUT_C0.g + (BLUT_C1.g - BLUT_C0.g) * c; col[i * 3 + 2] = BLUT_C0.b + (BLUT_C1.b - BLUT_C0.b) * c; }
      STM.makeScale(r, r, r); STM.setPosition(TMPP.x, TMPP.y, TMPP.z);
      im.setMatrixAt(i, STM);
    }
    im.instanceMatrix.needsUpdate = true;
    if (col) im.instanceColor.needsUpdate = true;
  }
}
/* Zottenpumpe: Verkuerzung zur Zeit clock (Schlag in den ersten 45 % jedes Zyklus von TP s) */
function pumpWert() { var c = clock / TP, fr = c - Math.floor(c), p = fr < 0.45 ? Math.pow(Math.sin(PI * fr / 0.45), 2) : 0; return (PUMPE_A0 + (PUMPE_A1 - PUMPE_A0) * fe) * p; }
var LYM_C0 = srgb(0xF3E39A), LYM_C1 = srgb(0xFFF6DC);
/* je Bild: Uhr und Uebergang fortschreiben (Pause haelt die Stroemung an, der Uebergang laeuft in Echtzeit) */
function stroemungSchritt(dt) {
  var ziel = mahlzeit ? 1 : 0;
  if (!fzFest && fzR !== ziel) fzR = ziel > fzR ? Math.min(ziel, fzR + dt / SZ_.UEBERG) : Math.max(ziel, fzR - dt / SZ_.UEBERG);
  fe = sstep(0, 1, fzR);
  if (playing) clock += dt * speed;
  pumpA = pumpWert(); PU.uPump.value = pumpA;
  if (fe !== feMilch) {   /* nach dem Essen ist die Lymphe leicht milchig */
    feMilch = fe;
    MAT.lymphgefaess.color.copy(LYM_C0).lerp(LYM_C1, 0.8 * fe); MAT.lymphgefaess.opacity = 0.62 + 0.2 * fe;
  }
}
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
KINDS.forEach(function (K, ki) {
  if (!K.btn) return;
  $(K.btn).onclick = function () { stoffSetzen(ki, !kindOn[ki]); };
});
function stoffSetzen(ki, an) {
  kindOn[ki] = an; $(KINDS[ki].btn).classList.toggle('on', an);
  if (ST) ST.letzt = ''; lv++;
}
/* Mahlzeit-Schalter: nuechtern (kaum Naehrstoffe) oder nach dem Essen (Naehrstoffe werden aufgenommen); dieselben Saetze stehen als Hinweiszeile im Schema */
var MAHLZEIT_TXT = ['Nüchtern: Kaum Nährstoffe – die Zotte nimmt wenig auf.',
  'Nach dem Essen: Zucker und Aminosäuren gehen ins Blut, Fett ins Lymphgefäß; die Zotte pumpt stärker.'];
function setMahlzeit(an, still) {
  if (an === mahlzeit) return;
  mahlzeit = an; fzFest = false;
  if (an) tM = clock;
  $('bNuechtern').classList.toggle('on', !an);
  $('bEssen').classList.toggle('on', an);
  if (!still) Kern.toast(MAHLZEIT_TXT[an ? 1 : 0]);
  lv++;
}
$('bNuechtern').onclick = function () { setMahlzeit(false); };
$('bEssen').onclick = function () { setMahlzeit(true); };

/* =====================================================================
   7. Schema - Oberflaeche und Wege der Stoffe (Knopf "Schema", wie beim Darm)
   Links die Oberflaechenvergroesserung in drei Stufen (Ringfalte x 3, Zotten x 10, Mikrovilli x 20, zusammen etwa x 600), in der Mitte der Laengsschnitt einer Zotte mit Beschriftung,
   rechts (Handy: darunter) nummerierte Legende, Kennzahlen und eine Hinweiszeile je nach Mahlzeit. Die Punkte sind dieselben Teilchen wie im 3D-Modell (gleiche Farben, gleiche
   Zeitfunktion aus Abschnitt 6, Lage der Ruhelage von vorn auf x/y projiziert; Tempo, Pause, Mahlzeit und Stoffe-Schalter gelten mit). Das Schema legt nichts in der 3D-Szene an und
   zieht keinen Zufall; gebaut wird es erst beim ersten Oeffnen.
   ===================================================================== */
var SCH = (function () {
  var NS = 'http://www.w3.org/2000/svg', W = 900, H = 470, BREIT = false, SX = 52, CX = 330, SYM = 38, BASE = 400;   /* SX: Pixel je Einheit nach rechts, SYM: nach oben */
  var BRASS = '#E0A94A', DIM = '#8DA7B1', INK = '#E7EFF0', DARK = '#0B171C';
  var svg = null, built = false, DOT = [], DYN = {}, seen = {};
  function f1(v) { return Math.round(v * 10) / 10; }
  function px(x) { return CX + x * SX; }
  function py(y) { return BASE - y * SYM; }
  function E(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
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
  function pfadD(pts) { var d = ''; pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }); return d; }
  function rohr(g, pts, w, fill, opa, rand) {   /* Schlauch als dicke Linie mit dunklem Rand */
    var d = pfadD(pts);
    E('path', { d: d, fill: 'none', stroke: rand || DARK, 'stroke-width': w + 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    return E('path', { d: d, fill: 'none', stroke: fill, 'stroke-opacity': opa || 1, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  }
  function xy(p) { return [px(p[0]), py(p[1])]; }
  var FM = [['#F0DA6E', '#6A560A'], ['#F5AE60', '#6A3206'], ['#FFFFFF', '#55554F'], ['#A8DEF6', '#1A4E74'], ['#E0584C', '#4A140E']];
  var BLUTF = ['#E0584C', '#D5586A', '#C85A88', '#BA5BA2', '#AC5FBA', '#A06BC8', '#A98BDC'];

  function build(box) {
    if (built) return;
    box.innerHTML = '';
    BREIT = window.innerWidth > 1000;
    SX = BREIT ? 52 : 40; CX = BREIT ? 330 : 285;
    var SW = BREIT ? 124 : 108, OFF = Math.round(2.27 * SX);   /* SW: Breite der Bilder links; OFF: Abstand der Namen von der Achse */
    var PITCH = BREIT ? 56 : 50, LX = BREIT ? 534 : 8, LY = BREIT ? 40 : 462, ky = LY + 3 * PITCH + (BREIT ? 8 : 4);
    W = BREIT ? 900 : 460; H = BREIT ? 470 : Math.round(ky + 66 + 20 + 3 * 14 + 14);
    svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Inter, "Segoe UI", system-ui, sans-serif',
      'aria-label': 'Schema: wie die Oberfläche des Dünndarms vergrößert wird und welchen Weg die Stoffe durch die Zotte nehmen' }, box);
    var F = fluss(), i, k;
    /* ---- links: Oberflaechenvergroesserung ---- */
    var gl = E('g', null, svg), Y0 = [40, 156, 272], TIS = '#B87868', ZEL = '#E6B49A';
    text(gl, 4, 16, 'OBERFLÄCHENVERGRÖSSERUNG', 8.8, DIM, { 'letter-spacing': 0.5, 'font-weight': 600, 'stroke-width': 0 });
    function kopf(y, name, mal) {
      text(gl, 4, y - 6, name, 9.5, DIM, { 'letter-spacing': 1.2, 'font-weight': 600, 'stroke-width': 0 });
      text(gl, SW, y - 6, mal, 11, BRASS, { 'text-anchor': 'end', 'font-weight': 700, 'stroke-width': 0 });
    }
    kopf(Y0[0], 'RINGFALTE', '× 3');
    E('rect', { x: 4, y: Y0[0] + 46, width: SW - 4, height: 18, fill: TIS }, gl);
    [1, 3, 5].forEach(function (q) { E('ellipse', { cx: f1(4 + (SW - 4) * q / 6), cy: Y0[0] + 46, rx: f1((SW - 4) / 8.5), ry: 26, fill: TIS }, gl); });
    E('rect', { x: 4, y: Y0[0] + 46, width: SW - 4, height: 18, fill: TIS }, gl);
    E('line', { x1: 4, y1: Y0[0] + 46, x2: SW, y2: Y0[0] + 46, stroke: '#D9A090', 'stroke-width': 0.8, 'stroke-dasharray': '2 2', opacity: 0.0 }, gl);
    kopf(Y0[1], 'ZOTTEN', '× 10');
    E('rect', { x: 4, y: Y0[1] + 52, width: SW - 4, height: 12, fill: TIS }, gl);
    for (k = 0; k < 6; k++) E('rect', { x: f1(10 + k * (SW - 20) / 6), y: Y0[1] + 14, width: 11, height: 42, rx: 5.5, fill: ZEL }, gl);
    kopf(Y0[2], 'MIKROVILLI', '× 20');
    for (k = 0; k < 2; k++) {
      var cx0 = 8 + k * (SW - 8) / 2, cw = (SW - 8) / 2 - 4;
      E('rect', { x: f1(cx0), y: Y0[2] + 32, width: f1(cw), height: 32, rx: 3, fill: ZEL, stroke: '#9A6F5C', 'stroke-width': 0.8 }, gl);
      E('ellipse', { cx: f1(cx0 + cw / 2), cy: Y0[2] + 50, rx: 5, ry: 4, fill: '#8A5C78' }, gl);
      for (i = 0; i < 9; i++) E('line', { x1: f1(cx0 + 3 + i * (cw - 6) / 8), y1: Y0[2] + 32, x2: f1(cx0 + 3 + i * (cw - 6) / 8), y2: Y0[2] + 20, stroke: '#F4DFD0', 'stroke-width': 1.7, 'stroke-linecap': 'round' }, gl);
    }
    [Y0[0] + 76, Y0[1] + 76].forEach(function (y) { E('polygon', { points: f1(SW / 2 - 6) + ',' + y + ' ' + f1(SW / 2 + 6) + ',' + y + ' ' + f1(SW / 2) + ',' + (y + 9), fill: BRASS, opacity: 0.8 }, gl); });
    E('line', { x1: 4, y1: 352, x2: SW, y2: 352, stroke: '#9C7530', 'stroke-width': 0.9 }, gl);
    text(gl, 4, 368, 'zusammen etwa', 9.5, DIM, { 'letter-spacing': 0.8, 'stroke-width': 0, 'font-weight': 600 });
    text(gl, 4, 396, '× 600', 24, BRASS, { 'font-weight': 700, 'stroke-width': 0 });
    /* ---- Mitte: Laengsschnitt einer Zotte ---- */
    var gz = E('g', null, svg);
    text(gz, CX, 16, 'LÄNGSSCHNITT EINER ZOTTE', 8.8, DIM, { 'text-anchor': 'middle', 'letter-spacing': 0.5, 'font-weight': 600, 'stroke-width': 0 });
    E('rect', { x: f1(px(-2.6)), y: 26, width: f1(5.2 * SX), height: f1(BASE - 26), fill: '#1C3540', 'fill-opacity': 0.75 }, gz);
    E('rect', { x: f1(px(-2.6)), y: BASE, width: f1(5.2 * SX), height: f1(1.0 * SYM), fill: TIS }, gz);
    [-1.75, 1.7].forEach(function (cx) { E('rect', { x: f1(px(cx - 0.34)), y: BASE - 1, width: f1(0.68 * SX), height: f1(1.7 * SYM), fill: '#1C3540' }, gz); });
    var ys = zhoehen(ZR0.h, ZR0.r, -0.3);
    var umriss = function (dr) { return ys.map(function (y) { return [px(-(rz(y) + dr)), py(y)]; }).concat(ys.slice().reverse().map(function (y) { return [px(rz(y) + dr), py(y)]; })); };
    E('polygon', { points: umriss(0).map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' '), fill: ZEL, stroke: '#9A6F5C', 'stroke-width': 0.8 }, gz);
    E('polygon', { points: umriss(-CELL_TH).map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' '), fill: '#6A343C' }, gz);
    var saum = umriss(HAAR_L * 1.4); saum = saum.slice(0, ys.length).concat(saum.slice(ys.length));
    E('polyline', { points: saum.slice(1, saum.length - 1).map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' '), fill: 'none', stroke: '#F4DFD0', 'stroke-width': 3.2, 'stroke-dasharray': '0.9 1.5' }, gz);
    [[-1, 2.6], [1, 4.4], [-1, 5.0], [1, 1.6]].forEach(function (b) { E('ellipse', { cx: f1(px(b[0] * (rz(b[1]) - 0.09))), cy: f1(py(b[1])), rx: 2.6, ry: 4.2, fill: '#CFE0EA', stroke: '#6D8794', 'stroke-width': 0.7 }, gz); });
    /* Kapillarnetz: die Ringe und Verbindungsstuecke von vorn gesehen */
    for (k = 0; k < NETZ_Y.length; k++) {
      var ring = []; for (i = 0; i <= NETZ_N; i++) ring.push(xy(netzPunkt(k, i)));
      E('path', { d: pfadD(ring), fill: 'none', stroke: '#E0707A', 'stroke-width': 1.7, 'stroke-linejoin': 'round' }, gz);
      if (k < NETZ_Y.length - 1) for (var m = 1 + (k % 2); m < NETZ_N; m += 2) E('line', { x1: f1(xy(netzPunkt(k, m))[0]), y1: f1(xy(netzPunkt(k, m))[1]), x2: f1(xy(netzPunkt(k + 1, m))[0]), y2: f1(xy(netzPunkt(k + 1, m))[1]), stroke: '#E0707A', 'stroke-width': 1.4 }, gz);
    }
    DYN.lymph = rohr(gz, F.lym.map(xy), 0.4 * SX, '#F3E39A', 0.85);
    rohr(gz, F.art.map(xy), 0.17 * SX, '#C8372D', 1);
    rohr(gz, F.ven.map(xy), 0.22 * SX, '#7A5CB0', 1);
    /* ---- Teilchen: je Art ein Pool von Kreisen ---- */
    var gt = E('g', { 'pointer-events': 'none' }, svg);
    DOT = KINDS.map(function (K, ki) {
      var gg = E('g', null, gt), arr = [];
      for (i = 0; i < K.n; i++) arr.push({ el: E('circle', { r: 2, fill: FM[ki][0], stroke: FM[ki][1], 'stroke-width': 0.7, display: 'none' }, gg), on: false, x: -1, y: -1, r: -1, c: -1 });
      return arr;
    });
    /* ---- Beschriftung: Namen links und rechts der Zotte mit Fuehrungslinien ---- */
    var ga = E('g', { 'pointer-events': 'none' }, svg);
    function name(s, links, ly, tx, ty) {
      var lx = links ? CX - OFF : CX + OFF;
      E('line', { x1: f1(links ? lx + 4 : lx - 4), y1: ly, x2: f1(tx), y2: f1(ty), stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, ga);
      E('circle', { cx: f1(tx), cy: f1(ty), r: 1.8, fill: BRASS }, ga);
      text(ga, lx, ly + 3.3, s, 9, DIM, { 'letter-spacing': 0.8, 'font-weight': 600, 'text-anchor': links ? 'end' : 'start' });
    }
    var vp = senkrechtBei(VE_P, -0.8, 0.84 * ZR0.h, 0.012, 2.5), ap = senkrechtBei(AR_P, -0.8, 0.9 * ZR0.h, 0.012, 3.2), lp = senkrechtBei(LY_P, -0.8, 0.87 * ZR0.h, 0.01, 4.0), nk = netzPunkt(3, 12);
    name('DARMINHALT', false, 44, px(1.9), py(8.7));
    name('BÜRSTENSAUM', false, 104, px(rz(5.8) + HAAR_L * 1.4), py(5.8));
    name('SAUMZELLE', false, 164, px(rz(4.2) - 0.13), py(4.2));
    name('KAPILLARE', false, 224, px(nk[0]), py(nk[1]));
    name('VENOLE', false, 284, px(vp[0]), py(vp[1]));
    name('LYMPHGEFÄSS', true, 196, px(lp[0]), py(lp[1]));
    name('ARTERIOLE', true, 256, px(ap[0]), py(ap[1]));
    /* Legende */
    var LG = [
      ['Zucker und Aminosäuren', 'durch die Saumzelle in die Kapillare,', 'über die Venole zur Pfortader und Leber'],
      ['Fett', 'in der Saumzelle zu Fetttröpfchen verpackt,', 'ins Lymphgefäß und an der Leber vorbei ins Blut'],
      ['Wasser und Salze', 'folgen den Nährstoffen', 'ins Blut']
    ];
    var FT = 12.5, FZ = 10;
    LG.forEach(function (t, q) {
      var cy = LY + q * PITCH;
      abzeichen(ga, LX + 8, cy - 4, q + 1);
      text(ga, LX + 24, cy, t[0], FT, BRASS, { 'font-weight': 700 });
      text(ga, LX + 24, cy + 14, t[1], FZ, DIM, { 'stroke-width': 2.2 });
      text(ga, LX + 24, cy + 27, t[2], FZ, DIM, { 'stroke-width': 2.2 });
    });
    /* Kennzahlen */
    var kw = BREIT ? 340 : 444;
    E('rect', { x: LX, y: f1(ky), width: kw, height: 66, rx: 4, fill: DARK, 'fill-opacity': 0.88, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
    text(ga, LX + 10, ky + 16, 'KENNZAHLEN · ZOTTE', 10, BRASS, { 'font-weight': 700, 'letter-spacing': 0.8, 'stroke-width': 0 });
    ['Höhe: ca. 0,5–1 mm', 'Saumzellen leben ca. 3–5 Tage', 'Oberfläche: etwa 600-fach vergrößert'].forEach(function (s, q) { text(ga, LX + 10, ky + 32 + q * 13, s, FZ, DIM, { 'stroke-width': 0 }); });
    /* Hinweiszeile je nach Mahlzeit */
    DYN.hint = [0, 1, 2].map(function (q) { return text(ga, LX, ky + 88 + q * 14, '', 10.4, INK, { 'stroke-width': 2.2 }); });
    seen = { mz: -1, lm: -1 };
    built = true;
  }

  function update() {
    if (!built) return;
    var ki, i;
    for (ki = 0; ki < KINDS.length; ki++) {
      var K = KINDS[ki], pool = DOT[ki], show = K.im.visible;
      for (i = 0; i < K.n; i++) {
        var q = pool[i], v = show && K.vis[i] > 0.001;
        if (v) {
          var rr = Math.round(Math.max(1.5, Math.min(3.6, K.vis[i] * SX * 1.3)) * 10) / 10, x = f1(px(K.pos[i * 3])), y = f1(py(K.pos[i * 3 + 1]));
          if (x !== q.x) { q.el.setAttribute('cx', x); q.x = x; }
          if (y !== q.y) { q.el.setAttribute('cy', y); q.y = y; }
          if (rr !== q.r) { q.el.setAttribute('r', rr); q.r = rr; }
          if (ki === KI.blut) { var ci = Math.round(K.cc[i] * 6); if (ci !== q.c) { q.el.setAttribute('fill', BLUTF[ci]); q.c = ci; } }
          if (!q.on) { q.el.setAttribute('display', 'inline'); q.on = true; }
        } else if (q.on) { q.el.setAttribute('display', 'none'); q.on = false; }
      }
    }
    var lm = Math.round(fe * 10);
    if (lm !== seen.lm) { seen.lm = lm; DYN.lymph.setAttribute('stroke', lm > 4 ? '#FBF0C8' : '#F3E39A'); DYN.lymph.setAttribute('stroke-opacity', 0.85 + 0.012 * lm); }
    if (mahlzeit !== seen.mz) {
      seen.mz = mahlzeit;
      var wort = MAHLZEIT_TXT[mahlzeit ? 1 : 0].split(' '), zl = [''], mx = BREIT ? 62 : 82;   /* Hinweis auf Zeilen umbrechen */
      wort.forEach(function (w) { var l = zl[zl.length - 1]; if (l && (l + ' ' + w).length > mx) zl.push(w); else zl[zl.length - 1] = l ? l + ' ' + w : w; });
      DYN.hint.forEach(function (e, q) { e.textContent = zl[q] || ''; });
    }
  }
  function abbauen() { svg = null; built = false; DOT = []; DYN = {}; seen = {}; }
  return { build: build, update: update, abbauen: abbauen, get svg() { return svg; } };
})();

var schemaOn = false;
function setSchema(on) {
  if (on && !ST) return;                                  /* die Teilchen entstehen am Ende des Aufbaus */
  schemaOn = on;
  $('bSchema').classList.toggle('on', on);
  if (on) { if (quiz) quizEnd(); if (wege) wegeEnd(); closeCard(); SCH.build($('schemaBox')); SCH.update(); }   /* Hilfekarte und Ueben weichen dem Schema */
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  canvas.style.visibility = on ? 'hidden' : '';
  lv++;
}
/* Das Schema weicht anderen Ansichten (Hilfekarte, Ueben) */
function schemaWeicht() { if (schemaOn) setSchema(false); }
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var kamAlt = { near: camera.near, far: camera.far };
var App = window.ZotteApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris, treffer: trefferAn,
  mahlzeit: function (an) { setMahlzeit(!!an); },
  schema: function (an) { setSchema(!!an); },
  tippe: function (id) { if (wege) wegeAntwort(id, [id]); else if (quiz) quizAntwort(id, [id]); },
  wege: function () { return wege && { weg: wege.nr + 1, station: wege.st, n: wege.n, ok: wege.ok, fehl: wege.fehl, liste: wege.liste.slice(), fertig: wege.fertig, leucht: wege.leucht.slice(), ausschnitt: aktiv }; },
  quiz: function () { return quiz && { ziel: quiz.target, n: quiz.n, ok: quiz.ok }; },
  stoffe: function (id, an) { if (id in KI && KINDS[KI[id]].btn) stoffSetzen(KI[id], !!an); },
  /* fuer die Pruefung: Werte der Stroemung (Zahl der sichtbaren Teilchen je Art und Abschnitt, Uebergang, Uhr, Verkuerzung der Zotte) */
  stroemung: function () {
    var n = {}, t = {}; KINDS.forEach(function (K) { var c = 0, tt = [0, 0, 0, 0, 0, 0, 0, 0], i; for (i = 0; i < K.n; i++) if (K.vis[i] > 0.001) { c++; tt[K.tag[i]]++; } n[K.id] = K.im && K.im.visible ? c : 0; t[K.id] = tt; });
    return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, uebergang: fe, te: clock - tM, pumpe: Math.round(pumpA * 1e5) / 1e5, sichtbar: n, abschnitte: t };
  },
  /* fuer die Pruefung: Lage (Ruhelage), Radius und Abschnitt der sichtbaren Teilchen */
  teilchen: function () {
    var out = [];
    KINDS.forEach(function (K) { for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) out.push({ art: K.id, i: i, t: K.tag[i], r: K.vis[i], p: [K.pos[i * 3], K.pos[i * 3 + 1], K.pos[i * 3 + 2]] }); });
    return out;
  },
  /* fuer die Pruefung: Teilchen an falschen Orten (Lage in der Ruhelage gegen die Geometrie des Abschnitts, in dem sie nach ihrem Etikett sein sollen) */
  orte: function () {
    var F = fluss(), seg = [], n = 0, falsch = 0, bsp = null, k, i, m;
    for (k = 0; k < NETZ_Y.length; k++) {
      for (i = 0; i < NETZ_N; i++) seg.push([netzPunkt(k, i), netzPunkt(k, i + 1)]);
      if (k < NETZ_Y.length - 1) for (m = 1 + (k % 2); m < NETZ_N; m += 2) {
        var A = netzPunkt(k, m), B = netzPunkt(k + 1, m), md = [(A[0] + B[0]) / 2 + 0.03 * Math.sin(m + k), (A[1] + B[1]) / 2, (A[2] + B[2]) / 2 + 0.03 * Math.cos(m + k)];
        seg.push([A, md], [md, B]);
      }
    }
    [0, 1].forEach(function (q) {   /* Aeste von der Arteriole zum obersten Ring und von den Ringen zur Venole */
      var i0 = q ? 6 : 4, kp = arterienKopf(i0), l = kp.length; seg.push([kp[l - 2], kp[l - 1]], [kp[l - 1], netzPunkt(8, i0)]);
    });
    EXITR.forEach(function (kE) { var tl = venenSchwanz(kE); seg.push([netzPunkt(kE, 9), tl[0]], [tl[0], tl[1]]); });
    function dSeg(p, a, b) {
      var vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], l2 = vx * vx + vy * vy + vz * vz || 1e-12, t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy + (p[2] - a[2]) * vz) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.sqrt(Math.pow(p[0] - a[0] - vx * t, 2) + Math.pow(p[1] - a[1] - vy * t, 2) + Math.pow(p[2] - a[2] - vz * t, 2));
    }
    function dLinie(p, L) { var d = 1e9, j; for (j = 0; j < L.length - 1; j++) d = Math.min(d, dSeg(p, L[j], L[j + 1])); return d; }
    KINDS.forEach(function (K) {
      for (i = 0; i < K.n; i++) {
        if (!(K.vis[i] > 0.001)) continue;
        var p = [K.pos[i * 3], K.pos[i * 3 + 1], K.pos[i * 3 + 2]], t = K.tag[i], rr = Math.sqrt(p[0] * p[0] + p[2] * p[2]), y = p[1], zz = rz(y), ok = true, grund = '';
        n++;
        if (t === 1) {   /* Darminhalt: ausserhalb der mittleren Zotte und der Nachbarzotten */
          if (rr < zz - 0.02) { ok = false; grund = 'in der Zotte'; }
          ZOTTEN.forEach(function (Z, j) {
            if (!j || y < 0 || y > Z.h) return;
            var c = zachse(Z, y), dd = Math.sqrt(Math.pow(p[0] - c[0], 2) + Math.pow(p[2] - c[2], 2));
            if (dd < zr(Z.h, Z.r, y, Z.tp) * Math.max(Z.ex, Z.ez) - 0.02) { ok = false; grund = 'in Nachbarzotte ' + j; }
          });
        } else if (t === 2) { if (rr > zz + HAAR_L + 0.06 || rr < zz - CELL_TH - 0.06) { ok = false; grund = 'nicht in der Zellschicht'; } }
        else if (t === 3) { if (Math.min.apply(null, seg.map(function (sg) { return dSeg(p, sg[0], sg[1]); })) > CAP_R + 0.012) { ok = false; grund = 'nicht in der Kapillare'; } }
        else if (t === 4) { if (dLinie(p, F.ven) > 0.1) { ok = false; grund = 'nicht in der Venole'; } }
        else if (t === 5) { if (dLinie(p, F.art) > 0.085) { ok = false; grund = 'nicht in der Arteriole'; } }
        else if (t === 6) { if (dLinie(p, F.lym) > 0.17) { ok = false; grund = 'nicht im Lymphgefäß'; } }
        else if (t === 7) { if (rr > zz - CELL_TH + 0.05 || dLinie(p, F.art) < 0.1 || dLinie(p, F.ven) < 0.1) { ok = false; grund = 'nicht im Gewebe'; } }
        if (!ok) { falsch++; if (!bsp) bsp = { art: K.id, i: i, t: t, p: p, grund: grund }; }
      }
    });
    return { geprueft: n, falsch: falsch, beispiel: bsp };
  },
  /* fuer die Pruefung: Uebergang (roh 0..1), Zeit seit dem Essen und Uhr sofort setzen und festhalten */
  stand: function (f, te, c) { fzFest = true; fzR = f; fe = sstep(0, 1, f); mahlzeit = f > 0.5; if (c !== undefined) clock = c; if (te !== undefined) tM = clock - te; $('bNuechtern').classList.toggle('on', !mahlzeit); $('bEssen').classList.toggle('on', mahlzeit); pumpA = pumpWert(); PU.uPump.value = pumpA; if (ST) ST.letzt = ''; lv++; stroemungBild(); } };
var bereitMerker = false;
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  var neuBereit = false;
  if (bereitMerker && !App.ready) { bereitMerker = false; neuBereit = true; clock = 0; root.visible = true; App.aufbauMs = Math.round(performance.now() - t0); App.ready = true; }   /* die Uhr beginnt in diesem Bild bei 0 */
  if (ST) { if (App.ready && !neuBereit) stroemungSchritt(dt); stroemungBild(); if (schemaOn) SCH.update(); }
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  if (schemaOn) return;                                   /* Schema offen: das Bild der Zotte ist ausgeblendet und wird nicht gezeichnet */
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
  camera.near = kamAlt.near; camera.far = kamAlt.far; camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  var tt = $('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  delete window.ZotteApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  setSelected(selected);
  stroemungBauen();
  bereitMerker = true;   /* bereit wird das Organ im naechsten Bild (loop), damit die Uhr der Stroemung immer im selben Bild beginnt (unabhaengig von der Ladezeit) */
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('zotte', organ);
})();
