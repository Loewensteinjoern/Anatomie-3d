/* =====================================================================
   Leber - Lappen, Pfortader und Gallenwege
   Die Leber von vorn wie im Koerper (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn): vier Lappen (rechter und linker Lappen,
   Quadrat- und Schwanzlappen, durch schmale Spalten getrennt), Gallenblase, Pfortader mit Stuempfen von Milz- und Mesenterialvene, Leberarterie,
   Lebervenen und untere Hohlvene, Lebergaenge, Gallenblasengang und Hauptgallengang bis zur Papille im Zwoelffingerdarm (Abschnitt),
   Ende des Bauchspeicheldruesengangs, Sichelband und rundes Leberband und das Zwerchfell darueber. Die Form liefert
   organe/leber/leber-form.js (Kern.Formen.leber; die Zwerchfellkuppel kommt aus organe/lunge/lunge-form.js); hier wird sie vernetzt, eingefaerbt
   und bedient.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste, Lesehilfe. Dazu Stroemung mit Mahlzeit-Schalter
   (Abschnitt 6: Blut und Galle als Teilchen auf den Mittellinien der Form, nuechtern oder nach dem Essen) und das Schema (Abschnitt 7, 2D mit
   denselben Teilchen). Die Karte fuer Hilfekarten und Ueben ist im Markup nur vorbereitet und wird in einem spaeteren Schritt gefuellt.
   Zoomstufe Leber -> Leberlaeppchen (Abschnitt 7b): Lebergewebe antippen -> "Leberlaeppchen hier ansehen" (naechster Endast des Pfortaderbaums im Lappen), Knopf
   "Laeppchen" (feste Stelle im rechten Lappen); das Laeppchen entsteht aus organe/leber/laeppchen.js (organ.form), die Kamera landet in dessen Startansicht (Adresse leber/laeppchen).
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
/* Hilfekarten: [Schluessel, Titel, Text, Merke] (Texte von Joern freigegeben) */
var HILFE = [
  ['aufgaben', 'Aufgaben der Leber', 'Die Leber ist das wichtigste Stoffwechselorgan. Sie speichert Zucker als Glykogen und gibt ihn bei Bedarf wieder ins Blut ab, baut Fette und Eiweiße um und speichert Vitamine und Eisen. Sie stellt wichtige Eiweiße her, zum Beispiel Albumin und die meisten Gerinnungsfaktoren. Giftstoffe, Alkohol und viele Medikamente baut sie ab, das giftige Ammoniak wandelt sie in Harnstoff um. Außerdem bildet sie die Galle.',
    'Arbeitet die Leber nicht mehr, zeigt sich das an vielen Stellen: Blutungsneigung, Wasser im Bauch, Gelbsucht und Verwirrtheit durch Ammoniak.'],
  ['blut', 'Pfortader und Leberarterie', 'Die Leber bekommt Blut aus zwei Quellen: Etwa drei Viertel kommen über die Pfortader aus Magen, Darm und Milz, ein Viertel über die Leberarterie aus der Aorta. Zusammen fließen rund 1,5 Liter Blut pro Minute durch die Leber. In den Leberläppchen mischen sich beide Ströme; danach verlässt das Blut die Leber über die Lebervenen und die untere Hohlvene zum Herzen.',
    'Was der Darm aufnimmt, kommt zuerst zur Leber. Geschluckte Medikamente werden dabei teilweise schon abgebaut, bevor sie wirken (First-Pass-Effekt) – deshalb ist die Dosis als Tablette oft höher als in die Vene.'],
  ['galle', 'Galle und Gallenwege', 'Die Leberzellen bilden täglich etwa 0,5 bis 1 Liter Galle. Ihre Gallensäuren zerlegen Fette im Darm in feine Tröpfchen, damit sie verdaut werden können. Außerdem scheidet die Leber mit der Galle Abbaustoffe aus, etwa den gelben Farbstoff Bilirubin aus dem roten Blutfarbstoff. Zwischen den Mahlzeiten ist der Schließmuskel an der Papille geschlossen: Die Galle fließt in die Gallenblase und wird eingedickt. Nach dem Essen zieht sich die Gallenblase zusammen, und die Galle fließt in den Zwölffingerdarm.',
    'Ist der Abfluss der Galle versperrt, gelangt Bilirubin ins Blut: Haut und Augen werden gelb, der Urin dunkel und der Stuhl hell.'],
  ['pflege', 'Pflege: Leberwerte und Gelbsucht', 'Sind Leberzellen geschädigt, steigen die Enzyme GPT (ALT) und GOT (AST) im Blut, bei einem Gallenstau vor allem Gamma-GT und alkalische Phosphatase. Wie gut die Leber arbeitet, zeigen Albumin und Gerinnung: Stellt die Leber zu wenig her, sinken Albumin und Quick-Wert, die INR steigt. Bilirubin steigt bei Gelbsucht. Pflegende achten auf gelbe Augen und Haut, Juckreiz, die Farbe von Urin und Stuhl, Blutungszeichen und Veränderungen des Bewusstseins.',
    'Gelbsucht sieht man zuerst im Weiß der Augen, etwa ab 2 mg/dl Bilirubin – am besten bei Tageslicht ansehen.'],
  ['modell', 'So liest du das Modell', 'Die Leber ist von vorn dargestellt, so wie sie im Körper liegt. Violett ist die Pfortader, rot die Leberarterie, blau sind Lebervenen und Hohlvene, grün die Gallenwege. Mit „Durchsicht“ wird das Lebergewebe gläsern: Dann sieht man, dass Pfortader, Leberarterie und Gallengang gemeinsam verzweigen und die Lebervenen getrennt davon laufen. Der Schalter „nüchtern / nach dem Essen“ zeigt, wohin die Galle fließt. Die Teilchen zeigen die Richtung der Strömung – symbolisch, nicht maßstäblich.',
    'In der Leber laufen Pfortader, Leberarterie und Gallengang immer zu dritt (Glisson-Trias) – bis in die Ecken der Leberläppchen.']
];
/* Ueben "Wege verfolgen": feste Reihenfolge der vier Wege. Station = Liste von Struktur-ids (ids), Anzeigename de (sonst der Name der ersten Struktur); mahlzeit = false (nuechtern) oder true (nach dem Essen)
   schaltet das Modell, fehlt sie, bleibt es wie es ist. Nur Daten: die Abfolge im Code (wegeStart bis wegeAntwort) kennt keine Leber-Besonderheiten. */
var LEBER_LAPPEN = ['lappenR', 'lappenL', 'quadrat', 'schwanz'];
var WEGE = [
  { titel: 'Blut aus dem Darm', aufgabe: 'Das Blut kommt aus Magen und Darm. Tippe seine Stationen der Reihe nach an, bis es die Leber wieder verlässt.',
    stationen: [{ ids: ['pfortader'] }, { ids: LEBER_LAPPEN, de: 'Leber' }, { ids: ['lebervenen'] }, { ids: ['hohlvene'] }],
    abschluss: 'Geschafft: Was der Darm aufnimmt, fließt über die Pfortader zuerst durch die Leber und erst dann über die Lebervenen zum Herzen.' },
  { titel: 'Blut aus der Aorta', aufgabe: 'Das Blut kommt aus der Aorta. Tippe seine Stationen der Reihe nach an, bis es die Leber wieder verlässt.',
    stationen: [{ ids: ['arterie'] }, { ids: LEBER_LAPPEN, de: 'Leber' }, { ids: ['lebervenen'] }, { ids: ['hohlvene'] }],
    abschluss: 'Geschafft: Die Leberarterie bringt sauerstoffreiches Blut; in der Leber mischt es sich mit dem Blut der Pfortader.' },
  { titel: 'Galle zwischen den Mahlzeiten', aufgabe: 'Die Galle kommt aus der Leber, der Mensch ist nüchtern. Tippe ihre Stationen der Reihe nach an.',
    hinweis: 'Das Modell zeigt jetzt „nüchtern“.', mahlzeit: false,
    stationen: [{ ids: ['lebergang'] }, { ids: ['blasengang'] }, { ids: ['gallenblase'] }],
    abschluss: 'Geschafft: Nüchtern ist der Schließmuskel an der Papille zu – die Galle weicht in die Gallenblase aus und wird dort eingedickt.' },
  { titel: 'Galle nach dem Essen', aufgabe: 'Der Mensch hat gegessen. Tippe die Stationen der Galle aus der Gallenblase der Reihe nach an.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['gallenblase'] }, { ids: ['blasengang'] }, { ids: ['hauptgang'] }, { ids: ['papille'] }],
    abschluss: 'Geschafft: Nach dem Essen zieht sich die Gallenblase zusammen, der Schließmuskel öffnet sich, und die Galle fließt in den Zwölffingerdarm.' }
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
    <button id="bLaeppchen" class="gh" title="In ein Leberläppchen hineinzoomen">Läppchen</button>
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
  <b style="color:#7CC66E">Grün</b> Gallenwege – Galle zum Darm.<br>
  <b style="color:#E0A94A">Leberläppchen:</b> Lebergewebe antippen → „Leberläppchen hier ansehen“.</p>
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
var lpLetzte = null;   /* zuletzt gewaehlte Stelle fuer das Leberlaeppchen (Index in baeume().endpunkte, fuer die Rueckfahrt; nur im Speicher der Seite, ueberdauert den Abbau der Leber) */
/* Mitte der Leber im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, die Leber steht im Modell mittig (Ziel der Kamerafahrt aus dem Koerper) */
var M = [-2, 107, 0];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und fuer die Fahrt aus dem Koerper;
   ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt ZIEL_K minus M) */
var ZIEL_K = [-2.9, 107.6, 0.5];
var UEBERSICHT = { ext: [28, 26], halb: 14, ziel: [ZIEL_K[0] - M[0], ZIEL_K[1] - M[1], ZIEL_K[2] - M[2]] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer Leber und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten, ueben) {
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 60, y1: Math.max(150, toolsOben - 14 - 0.26 * h), labW: 104, fit: 70 };   /* Handy beim Ueben: die Karte (26 % der Hoehe) liegt direkt ueber der Werkzeugleiste, die Leber steht darueber */
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
   Reihen umbricht: Reihe 1 (Ausschnitt mit Laeppchen und Schema) unter Breite 465 (zweite Zeile) und unter 255 (dritte), Reihe 2 (mit nuechtern und nach dem Essen) unter 364,
   Reihe 3 (Stroemung) unter 256); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (100 + (w < 465 ? 32 : 0) + (w < 364 ? 32 : 0) + (w < 256 ? 32 : 0) + (w < 255 ? 32 : 0)), unten: u };
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
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait } */
var wege = null, wegeT = null;   /* Ueben "Wege verfolgen" (siehe Abschnitt vor dem Antippen) */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (Gefaesse, Gaenge, Gallenblase) */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh && !o.userData.teilchen) o.visible = !!enabled[o.userData.sid]; });   /* Teilchen blendet die Stroemung selbst aus */
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
/* punkt (optional, Vector3 im Raum der Szene wie ein Treffer beim Antippen): wo die Struktur angetippt wurde; bestimmt bei den Lappen die Stelle fuer "Leberlaeppchen hier ansehen" */
function setSelected(id, punkt) {
  if (id && (quiz || wege)) id = null;                   /* beim Ueben keine Infokarte */
  selected = id;
  lpWahl = id && LAPPEN.indexOf(id) >= 0 ? laeppchenWahl(id, punkt) : null;
  $('iOpen').style.display = lpWahl !== null ? '' : 'none';   /* Knopf "Leberlaeppchen hier ansehen" nur bei den Lappen */
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

/* Ebene ein- oder ausschalten (Schalter der Leiste und Ausschnitte) */
function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility();
}
(function leiste() {
  /* Reiter: Strukturen, Hilfekarten, Ueben */
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
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur an der Leber und tippe sie an. Die Beschriftung verschwindet solange. Oder verfolge den Weg von Blut und Galle: Tippe die Stationen der Reihe nach an.'; paneU.appendChild(iu);
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
      function flip() {
        hand[s.id] = true;
        ebene(s.id, !enabled[s.id]);
      }
      sw.addEventListener('click', function (e) { e.stopPropagation(); flip(); });
      row.addEventListener('click', function () { if (!quiz && !wege) setSelected(s.id); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); if (!quiz && !wege) setSelected(s.id); }
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
  if (quiz) quizNeu();                                   /* andere Ansicht: neue Aufgabe aus den jetzt sichtbaren Strukturen */
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
  return bereichFuer(w, h, tr.top, tr.bottom, document.body.classList.contains('ueben'));
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
  if (quiz) quizNeu();
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
/* Ueben "Strukturen finden": "Tippe auf: ..." - alle eingeblendeten Strukturen ausser dem Zwerchfell, die Lebervenen nur bei Durchsicht
   (sonst verdeckt sie das Lebergewebe). Math.random nur hier, bei der Auswahl der gesuchten Struktur (wie bei der Niere). */
function quizPool() {
  return ORDER.filter(function (s) { return s.meshes.length && enabled[s.id] && s.id !== 'zwerchfell' && (s.id !== 'lebervenen' || seeThrough); }).map(function (s) { return s.id; });
}
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  showCard('Üben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe die Leber, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizNeu() { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); }
function uebenKlasse() { document.body.classList.toggle('ueben', !!(quiz || wege)); groesse(window.innerWidth, window.innerHeight); }   /* Handy: Karte unten, Bildbereich der Leber darueber */
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
/* Ueben "Wege verfolgen": die Stationen eines Weges (WEGE, Daten oben) der Reihe nach antippen. Die Abfolge kennt nur Stationen (Listen von Struktur-ids),
   Karte und Leuchten; das Leberlaeppchen kann dieselbe Abfolge mit eigenen Wegen nutzen. Zustand wege: nr = Weg, st = naechste Station, n = erledigte Stationen,
   ok = davon auf Anhieb richtig, fehl = Fehler in Folge bei der gesuchten Station, liste = Namen der erledigten Stationen, fertig = Weg abgeschlossen. */
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
    if (last) zeile('wg-ab', 'Alle vier Wege geschafft.', ab);
  }
  $('sScore').textContent = wege.ok + ' von ' + wege.n + ' Stationen auf Anhieb richtig';
  $('qNext').style.display = last ? 'none' : '';
}
function wegeSetzen(nr) {
  wegeLeuchtAus();
  wege.nr = nr; wege.st = 0; wege.fehl = 0; wege.liste = []; wege.fertig = false; wege.text = null;
  var w = WEGE[nr];
  if (w.mahlzeit !== undefined) setMahlzeit(w.mahlzeit, true);   /* dieselbe Funktion wie die Knoepfe, ohne die Einblendung */
  wegeZeigen();
}
function wegeStart() {
  if (quiz) quizEnd();
  setSelected(null);
  wege = { nr: 0, st: 0, n: 0, ok: 0, fehl: 0, liste: [], fertig: false, text: null, leucht: [], vorher: { mahlzeit: mahlzeit, durch: seeThrough } };
  durchsicht(true);                                      /* die Lebervenen liegen im Lebergewebe: nur bei Durchsicht antippbar */
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
  if (v) { setMahlzeit(v.mahlzeit, true); durchsicht(v.durch); }   /* Mahlzeit und Durchsicht wie vorher */
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Zwerchfell, Zwoelffingerdarm, Lappen bei Durchsicht) zaehlen nur,
   wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, durch = [], punkt = null, weichPunkt = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    durch.push(sid);                                     /* Strukturen bis zum ersten undurchsichtigen Treffer (fuer das Ueben) */
    if (weichMat(o)) { if (!weich) { weich = sid; weichPunkt = hits[i].point; } }
    else { treffer = sid; punkt = hits[i].point; }
  }
  if (wege) { wegeAntwort(treffer || weich || null, durch); return; }
  if (quiz) { quizAntwort(treffer || weich || null, durch); return; }
  setSelected(treffer || weich || null, treffer ? punkt : weichPunkt);
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
   6. Stroemung: Blut (violett Pfortader, rot Leberarterie, blau Lebervenen und Hohlvene) und Galle (gruen) als Teilchen, dazu der Mahlzeit-Schalter.
   Symbolisch, nicht massstaeblich. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des Teilchens: kein Zufall, die Anzahl steht
   beim Aufbau fest. Je Art ein InstancedMesh (ein Zeichenaufruf). Die Wege folgen den Mittellinien der Form (dieselben Kurven wie die 3D-Rohre): jedes Teilchen hat
   eine feste Route (Blatt des Baums nach Index, gleichmaessig ueber alle Endaeste, das heisst nach der Zahl der Endaeste im Teilbaum gewichtet) und laeuft darauf
   mit einer Phase aus Index und clock; am Anfang und Ende der Route blendet es weich ein bzw. aus. Das Tempo folgt dem Radius (gross = schnell).
   Pfortader: Stuempfe von Mesenterial- und Milzvene -> Stamm -> Teilung an der Pforte -> Aeste bis zu den Endaesten. Leberarterie: Stumpf am Truncus coeliacus -> Aeste.
   Lebervenen: Endaeste -> Staemme -> untere Hohlvene, dort gemeinsam mit dem Blut aus dem unteren Stumpf nach oben zum Herzen.
   Galle: Endaeste der Gallengaenge -> rechter/linker Lebergang -> gemeinsamer Lebergang; dort gabelt sich der Weg. Nuechtern (Schliessmuskel zu) durch den
   Gallenblasengang in die Gallenblase, nach dem Essen durch den Hauptgallengang zur Papille in den Zwoelffingerdarm, dazu Galle aus der Gallenblase rueckwaerts
   durch den Gallenblasengang in den Hauptgallengang. `anteil` blendet die beiden Wege weich ueber (1,5 s); die Gallenblase zieht sich nach dem Essen in 3 s auf
   72 % ihres Volumens zusammen (Skalierung zum Hals hin) und fuellt sich nuechtern in 6 s wieder. Die Blutstroeme bleiben dabei gleich.
   ===================================================================== */
var playing = true, speed = 1, clock = 0;
var mahlzeit = false, anteil = 0, kontr = 0;   /* mahlzeit: true = nach dem Essen; anteil: Ueberblendung der Gallenwege 0..1; kontr: Zusammenziehen der Gallenblase 0..1 */
var STR = { ANTEIL: 1.5, ZIEHEN: 3, FUELLEN: 6, REST: 0.72, FADE: 0.6, N: { pfortader: 180, arterie: 60, vene: 100, becken: 40, galle: 70, rueck: 14 } };
var ST = null;                                 /* nach dem Aufbau: Gruppen { art, list, im }, Gallenblase */
var SIDS = ['pfortader', 'arterie', 'lebervenen', 'hohlvene', 'lebergang', 'blasengang', 'hauptgang', 'gallenblase', 'zwoelffinger'], SIDX = {};
SIDS.forEach(function (s, i) { SIDX[s] = i; });
var STQ = { x: 0, y: 0, z: 0, s: 0 }, STM = new THREE.Matrix4();
var R2A = 0.7548776662466927, R2B = 0.5698402909980532;   /* Plastikzahl-Folge (R2): gleichmaessig verteilte Paare aus dem Index */
function bruch(v) { return v - Math.floor(v); }
function sstep6(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
/* Suche in einer aufsteigenden Tabelle A (n Werte): groesstes i <= n - 2 mit A[i] <= x */
function finde(A, x, n) {
  var lo = 0, hi = n - 1;
  while (hi - lo > 1) { var m = (lo + hi) >> 1; if (A[m] <= x) lo = m; else hi = m; }
  return lo;
}
/* Stueck einer Bahn: dichte Punktfolge der Mittellinie (Catmull-Rom wie das 3D-Rohr) mit Radius (wie rohre: weich von r0 nach r1) und Struktur */
function dicht(pts, r0, r1, sid) {
  var c = form.kurve(pts, 6), n = c.length, S = [0], r = [], i;
  for (i = 1; i < n; i++) S.push(S[i - 1] + Math.sqrt(Math.pow(c[i][0] - c[i - 1][0], 2) + Math.pow(c[i][1] - c[i - 1][1], 2) + Math.pow(c[i][2] - c[i - 1][2], 2)));
  for (i = 0; i < n; i++) { var f = S[n - 1] > 0 ? S[i] / S[n - 1] : 0; r.push(r0 + (r1 - r0) * f * f * (3 - 2 * f)); }
  return { p: c, r: r, sid: SIDX[sid] };
}
function teil(d, i0, i1) {   /* Teilstueck von Index i0 bis i1 (einschliesslich); i0 > i1 = rueckwaerts */
  var p = [], r = [], k;
  if (i0 <= i1) for (k = i0; k <= i1; k++) { p.push(d.p[k]); r.push(d.r[k]); }
  else for (k = i0; k >= i1; k--) { p.push(d.p[k]); r.push(d.r[k]); }
  return { p: p, r: r, sid: d.sid };
}
function um(d) { return teil(d, d.p.length - 1, 0); }
function rueck(st) { return st.slice().reverse().map(um); }
function naechster(d, q) {   /* Index des Punkts der Bahn, der q am naechsten liegt */
  var b = 1e9, bi = 0;
  d.p.forEach(function (p, k) { var e = Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2) + Math.pow(p[2] - q[2], 2); if (e < b) { b = e; bi = k; } });
  return bi;
}
/* Baum aus form.baeume(): dichte Bahnen, Eltern (der Ast der vorigen Generation, an dem der Ast beginnt) und Abzweigstelle (Index in der Bahn der Eltern); Blaetter = Aeste ohne Kinder.
   parFix: Eltern von aussen (Leberarterie und Gallengang laufen parallel zur Pfortader, Index gleich) */
function baumDaten(br, sid, gen0, parFix) {
  var D = br.map(function (a) { return dicht(a.pts, a.r0, a.r1, sid); }), par = [], cut = [], kind = {}, leaves = [];
  br.forEach(function (b, i) {
    par[i] = -1; cut[i] = 0;
    if (parFix) par[i] = parFix[i];
    else if (b.gen > gen0) {
      var best = 1e9;
      br.forEach(function (a, j) {
        if (a.gen !== b.gen - 1) return;
        var e = D[j].p[naechster(D[j], b.pts[0])], dd = Math.pow(e[0] - b.pts[0][0], 2) + Math.pow(e[1] - b.pts[0][1], 2) + Math.pow(e[2] - b.pts[0][2], 2);
        if (dd < best) { best = dd; par[i] = j; }
      });
    }
    if (par[i] >= 0) { cut[i] = naechster(D[par[i]], b.pts[0]); kind[par[i]] = true; }
  });
  br.forEach(function (b, i) { if (!kind[i]) leaves.push(i); });
  return { br: br, D: D, par: par, cut: cut, leaves: leaves };
}
function kette(T, leaf) {   /* Teilstuecke von der Wurzel bis zum Blatt (in Richtung der Pfortader) */
  var chain = [], b;
  for (b = leaf; b >= 0; b = T.par[b]) chain.unshift(b);
  return chain.map(function (bi, k) { return teil(T.D[bi], 0, k < chain.length - 1 ? T.cut[chain[k + 1]] : T.D[bi].p.length - 1); });
}
/* Tempo (cm/s bei "normal") nach dem Radius: gross = schnell; in der Gallenblase fest langsam */
function tempo6(r, sid) { return sid === SIDX.gallenblase ? 1.2 : 1.2 + 5 * Math.min(1, r / 0.65); }
/* Route aus Teilstuecken: Punkte, Radius, Struktur je Segment und die Laufzeit bis zu jedem Punkt */
function routeAus(stuecke) {
  var X = [], Y = [], Z = [], R = [], Q = [];
  stuecke.forEach(function (s) {
    s.p.forEach(function (q, k) {
      var n = X.length;
      if (n && Math.abs(X[n - 1] - q[0]) + Math.abs(Y[n - 1] - q[1]) + Math.abs(Z[n - 1] - q[2]) < 1e-6) { Q[n - 1] = s.sid; return; }   /* gleicher Punkt wie der letzte: Struktur gilt ab hier */
      X.push(q[0]); Y.push(q[1]); Z.push(q[2]); R.push(s.r[k]); Q.push(s.sid);
    });
  });
  var n = X.length, T = new Float32Array(n), k;
  for (k = 1; k < n; k++) {
    var len = Math.sqrt(Math.pow(X[k] - X[k - 1], 2) + Math.pow(Y[k] - Y[k - 1], 2) + Math.pow(Z[k] - Z[k - 1], 2));
    T[k] = T[k - 1] + len / tempo6((R[k] + R[k - 1]) / 2, Q[k - 1]);
  }
  return { n: n, X: X, Y: Y, Z: Z, R: R, Q: Q, T: T, W: T[n - 1], tJ: 0 };
}
/* Punkt der Route zur Zeit t (s) -> STQ (Mitte, Radius); liefert die Nummer des Segments */
function routePunkt(rt, t, o) {
  var i = finde(rt.T, t, rt.n), j = i + 1, d = rt.T[j] - rt.T[i], f = d > 1e-9 ? Math.max(0, Math.min(1, (t - rt.T[i]) / d)) : 0;
  o.x = rt.X[i] + (rt.X[j] - rt.X[i]) * f; o.y = rt.Y[i] + (rt.Y[j] - rt.Y[i]) * f; o.z = rt.Z[i] + (rt.Z[j] - rt.Z[i]) * f;
  o.s = rt.R[i] + (rt.R[j] - rt.R[i]) * f;
  return i;
}
var GBH = form.GALLENBLASE.hals.p;   /* Hals der Gallenblase = Fixpunkt beim Zusammenziehen */
function gbSkala() {   /* Skalierung der Gallenblase aus kontr (Fuellung f = 1 ... REST, Volumen ~ s^3) */
  var f = 1 - (1 - STR.REST) * sstep6(kontr);
  return Math.pow(f, 1 / 3);
}
function gbSetzen() {
  var s = gbSkala(), m = STRUCT.gallenblase.meshes[0];
  if (!m) return s;
  m.scale.setScalar(s);
  m.position.set(GBH[0] * (1 - s), GBH[1] * (1 - s), GBH[2] * (1 - s));
  return s;
}
/* Teilchen einer Gruppe: p = { rt, phi, ang, rho, kind, q }; kind 0 immer, 1 = Weg nuechtern, 2 = Weg nach dem Essen, 3 = Rueckfluss aus der Gallenblase.
   Setzt Lage und Groesse in STQ (s = Radius der Kugel, 0 = unsichtbar) */
function pose(p, c, sg, o) {
  var rt = p.rt, W = rt.W, u = c / W + p.phi, t, i, sid, ok, r, m, rad, w = 1, fade, ft;
  u -= Math.floor(u); t = u * W;
  i = routePunkt(rt, t, o);
  r = o.s; sid = rt.Q[i]; ok = ST.an[sid];
  var tx = rt.X[i + 1] - rt.X[i], ty = rt.Y[i + 1] - rt.Y[i], tz = rt.Z[i + 1] - rt.Z[i], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
  tx /= tl; ty /= tl; tz /= tl;
  if (sid === SIDX.gallenblase) {   /* in der Gallenblase mit ihr zusammenziehen */
    o.x = GBH[0] + sg * (o.x - GBH[0]); o.y = GBH[1] + sg * (o.y - GBH[1]); o.z = GBH[2] + sg * (o.z - GBH[2]); r *= sg;
  } else if (sid === SIDX.hohlvene && (aktiv === 2 || (aktiv === 1 && o.y < HV_KURZ))) ok = false;   /* der Teil der Hohlvene, den der Ausschnitt weglaesst */
  if (p.kind) {
    var vN = Math.max(0, Math.min(1, (p.q - anteil) / 0.15 + 0.5));   /* Anteil der Teilchen, die noch den Weg "nuechtern" nehmen (je Teilchen eine feste Schwelle) */
    if (p.kind === 3) w = sstep6(anteil);
    else {
      var wj = sstep6((t - rt.tJ + 0.4) / 0.8);   /* an der Gabelung weich von einem auf den anderen Weg */
      w = p.kind === 1 ? 1 + (vN - 1) * wj : (1 - vN) * wj;
    }
  }
  rad = Math.min(0.22, 0.5 * r);
  m = (r - rad) * 0.9 * p.rho;   /* Abstand von der Mittellinie: im Rohr verteilt, nie ueber die Wand hinaus */
  var ax = Math.abs(ty) < 0.9 ? 0 : 1, ay = Math.abs(ty) < 0.9 ? 1 : 0;   /* Hilfsachse fuer den Rahmen quer zur Bahn */
  var n1x = ty * 0 - tz * ay, n1y = tz * ax - tx * 0, n1z = tx * ay - ty * ax, nl = Math.sqrt(n1x * n1x + n1y * n1y + n1z * n1z) || 1;
  n1x /= nl; n1y /= nl; n1z /= nl;
  var n2x = ty * n1z - tz * n1y, n2y = tz * n1x - tx * n1z, n2z = tx * n1y - ty * n1x, ca = Math.cos(p.ang) * m, sa = Math.sin(p.ang) * m;
  o.x += n1x * ca + n2x * sa; o.y += n1y * ca + n2y * sa; o.z += n1z * ca + n2z * sa;
  ft = Math.min(t, W - t) / STR.FADE; fade = ft >= 1 ? 1 : (ft <= 0 ? 0 : ft * ft * (3 - 2 * ft));
  o.s = ok ? rad * w * fade : 0;
}
function tmat(col, em) {
  var m = mat(col, { rough: 0.35 });
  m.emissive.copy(srgb(em)).multiplyScalar(0.6);
  return m;
}
/* Aufbau: Routen und Teilchen (nach den Gefaessen, mit ihren Mittellinien) */
function stroemungBauen() {
  var B = form.baeume(), G = form.GEFAESSE, PA = form.PAPILLE, hvD, i;
  var TP = baumDaten(B.pfortader, 'pfortader', 1), TA = baumDaten(B.arterie, 'arterie', 1, TP.par), TG = baumDaten(B.galle, 'lebergang', 1, TP.par), TV = baumDaten(B.venen, 'lebervenen', 0);
  var hvp = form.hohlveneAbschnitt();
  hvD = { p: hvp, r: hvp.map(function () { return form.HOHLVENE.r; }), sid: SIDX.hohlvene };
  var stammD = dicht(G.pfortader[0].pts, G.pfortader[0].r0, G.pfortader[0].r1, 'pfortader');
  var stumpfD = G.pfortader.slice(1).map(function (g) { return dicht(form.stumpf(g.pts, form.STUMPF), g.r0, g.r1, 'pfortader'); });   /* [Milzvene, Mesenterialvene] */
  var artD = dicht(G.leberarterie[0].pts, G.leberarterie[0].r0, G.leberarterie[0].r1, 'arterie');
  var gg = G.gallengang, lgD = [dicht(gg[0].pts, gg[0].r0, gg[0].r1, 'lebergang'), dicht(gg[1].pts, gg[1].r0, gg[1].r1, 'lebergang')];
  var gemD = dicht(gg[2].pts, gg[2].r0, gg[2].r1, 'lebergang'), blaD = dicht(gg[3].pts, gg[3].r0, gg[3].r1, 'blasengang'), hauD = dicht(gg[4].pts, gg[4].r0, gg[4].r1, 'hauptgang');
  /* Gallenblase innen: vom Hals ueber den Koerper bis zum Grund (Radius etwas unter der Wand) */
  var GB = form.GALLENBLASE, gh = GB.hals.p, gk = GB.koerper.p, gf = GB.fundus.p, gend = [gk[0] + (gf[0] - gk[0]) * 0.6, gk[1] + (gf[1] - gk[1]) * 0.6, gk[2] + (gf[2] - gk[2]) * 0.6];
  var gbD = { p: form.kurve([gh, gk, gend], 8), r: null, sid: SIDX.gallenblase };
  gbD.r = gbD.p.map(function (q, k) { var f = k / (gbD.p.length - 1); return f < 0.5 ? 0.7 + (1.2 - 0.7) * f * 2 : 1.2 + 0.05 * (f - 0.5) * 2; });
  var papD = { p: [PA.p, [PA.p[0] + PA.richtung[0] * 0.8, PA.p[1] + PA.richtung[1] * 0.8, PA.p[2] + PA.richtung[2] * 0.8]], r: [0.3, 0.45], sid: SIDX.zwoelffinger };   /* Mitte der Papille in den Zwoelffingerdarm hinein */
  var cache = {};
  function route(key, bau) { return cache[key] || (cache[key] = routeAus(bau())); }
  var routenPf = function (leaf, s) { return route('pf' + leaf + '_' + s, function () { return [um(stumpfD[s]), stammD].concat(kette(TP, leaf)); }); };
  var routenArt = function (leaf) { return route('ar' + leaf, function () { return [artD].concat(kette(TA, leaf)); }); };
  var routenVene = function (leaf) {
    return route('ve' + leaf, function () {
      var ch = kette(TV, leaf), b;
      for (b = leaf; TV.par[b] >= 0; b = TV.par[b]);
      return rueck(ch).concat([teil(hvD, naechster(hvD, TV.br[b].pts[0]), hvD.p.length - 1)]);   /* vom Stamm in die Hohlvene und nach oben zum Herzen */
    });
  };
  var becken = routeAus([teil(hvD, 0, hvD.p.length - 1)]);
  /* Galle: vom Blatt ueber die Wurzel des Astes zum rechten bzw. linken Lebergang (Ast und Gang liegen nebeneinander: der Ast endet dort, wo er dem Gang am naechsten kommt),
     dann der gemeinsame Gang bis zur Gabelung (Einmuendung des Gallenblasengangs) */
  var vorC = {};
  var galleVor = function (leaf) {
    if (vorC[leaf]) return vorC[leaf];
    var ch = kette(TG, leaf), b, seite;
    for (b = leaf; TG.par[b] >= 0; b = TG.par[b]);
    seite = b === 0 ? 0 : 1;   /* Wurzel 0 = rechter Ast (wie in der Pfortader), 1 = linker */
    var d = TG.D[b], ende = lgD[seite].p[lgD[seite].p.length - 1], k = ch[0].p.length - 1;   /* ch[0]: Wurzelast von 0 bis zur Abzweigung (oder bis zum Ende) */
    ch[0] = teil(d, Math.min(naechster(d, ende), k), k);
    return (vorC[leaf] = rueck(ch).concat([um(lgD[seite]), gemD]));
  };
  var tailN = [um(blaD), gbD], tailE = [hauD, papD];   /* nuechtern: in die Gallenblase; nach dem Essen: zur Papille */
  var galleRoute = function (leaf, nuechtern) {
    var r = route('g' + (nuechtern ? 'n' : 'e') + leaf, function () { return galleVor(leaf).concat(nuechtern ? tailN : tailE); });
    r.tJ = route('gv' + leaf, function () { return galleVor(leaf); }).W;
    return r;
  };
  var rueckR = routeAus([um(gbD), blaD, hauD, papD]);   /* Rueckfluss: aus der Gallenblase durch den Gallenblasengang in den Hauptgallengang */
  var gruppen = [
    { art: 'pfortader', name: 'Pfortaderblut', col: 0xA58BE6, em: 0x5A3FB8, list: [] },
    { art: 'arterie', name: 'Arterienblut', col: 0xE0584C, em: 0xA01810, list: [] },
    { art: 'vene', name: 'Blut zum Herzen', col: 0x6F93E0, em: 0x20409A, list: [] },
    { art: 'galle', name: 'Galle', col: 0x8CCB6A, em: 0x3F8A22, list: [] }
  ];
  var N = STR.N, leaf;
  function eintrag(rt, i, kind, q, phi) { return { rt: rt, phi: phi === undefined ? bruch(0.5 + i * R2B) : phi, ang: i * 2.399963, rho: Math.sqrt(bruch(0.1 + i * 0.3247)), kind: kind, q: q }; }
  var blatt = function (T, i) { return T.leaves[Math.floor(bruch(0.5 + i * R2A) * T.leaves.length)]; };
  for (i = 0; i < N.pfortader; i++) gruppen[0].list.push(eintrag(routenPf(blatt(TP, i), i % 5 < 3 ? 1 : 0), i, 0, 0));   /* 3/5 aus der Mesenterialvene, 2/5 aus der Milzvene */
  for (i = 0; i < N.arterie; i++) gruppen[1].list.push(eintrag(routenArt(blatt(TA, i)), i, 0, 0));
  for (i = 0; i < N.vene; i++) gruppen[2].list.push(eintrag(routenVene(blatt(TV, i)), i, 0, 0));
  for (i = 0; i < N.becken; i++) gruppen[2].list.push(eintrag(becken, i, 0, 0, i / N.becken));   /* Blut aus Becken und Beinen */
  /* Galle: je Teilchen zwei Routen mit gleicher Phase (nuechtern, nach dem Essen) und einer festen Schwelle q, dazu der Rueckfluss */
  for (i = 0; i < N.galle; i++) gruppen[3].list.push(eintrag(galleRoute(blatt(TG, i), true), i, 1, 0.075 + 0.85 * bruch(0.5 + i * 0.6180339887)));
  for (i = 0; i < N.galle; i++) gruppen[3].list.push(eintrag(galleRoute(blatt(TG, i), false), i, 2, 0.075 + 0.85 * bruch(0.5 + i * 0.6180339887)));
  for (i = 0; i < N.rueck; i++) gruppen[3].list.push(eintrag(rueckR, i, 3, 0, i / N.rueck));
  ST = { gruppen: gruppen, an: [], letzt: '', sg: 1 };
  gruppen.forEach(function (g) {
    var m = tmat(g.col, g.em), geo = new THREE.SphereGeometry(1, 10, 7), im = new THREE.InstancedMesh(geo, m, g.list.length);
    m.name = 'teilchen-' + g.art;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    im.name = g.name; im.userData.teilchen = g.art; im.userData.noexport = true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); g.im = im;
  });
  stroemungBild();
}
/* je Bild: Teilchen setzen (nur wenn sich Zeit, Mahlzeit, Sichtbarkeit oder Ausschnitt geaendert haben) */
function stroemungBild() {
  if (!ST) return;
  var key = clock + '|' + anteil + '|' + kontr + '|' + lv + '|' + aktiv;
  if (key === ST.letzt) return;
  ST.letzt = key;
  ST.sg = gbSetzen();
  SIDS.forEach(function (s, k) { ST.an[k] = !!enabled[s]; });
  ST.gruppen.forEach(function (g) {
    for (var i = 0; i < g.list.length; i++) {
      pose(g.list[i], clock, ST.sg, STQ);
      STM.makeScale(STQ.s, STQ.s, STQ.s); STM.setPosition(STQ.x, STQ.y, STQ.z);
      g.im.setMatrixAt(i, STM);
    }
    g.im.instanceMatrix.needsUpdate = true;
  });
}
/* je Bild: Uhr, Ueberblendung der Gallenwege und Gallenblase fortschreiben (Pause haelt alles an, das Tempo wirkt auf alles) */
function stroemungSchritt(dt) {
  if (!playing) return;
  var d = dt * speed, ziel = mahlzeit ? 1 : 0;
  clock += d;
  if (anteil !== ziel) anteil = ziel > anteil ? Math.min(ziel, anteil + d / STR.ANTEIL) : Math.max(ziel, anteil - d / STR.ANTEIL);
  if (kontr !== ziel) kontr = ziel > kontr ? Math.min(ziel, kontr + d / STR.ZIEHEN) : Math.max(ziel, kontr - d / STR.FUELLEN);
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
/* Mahlzeit-Schalter: nuechtern (Schliessmuskel an der Papille zu: die Galle fliesst in die Gallenblase) oder nach dem Essen (Gallenblase zieht sich zusammen, die Galle fliesst in den Zwoelffingerdarm) */
var MAHLZEIT_TXT = ['Nüchtern: Der Schließmuskel an der Papille ist zu – die Galle fließt in die Gallenblase.',
  'Nach dem Essen: Die Gallenblase zieht sich zusammen, die Galle fließt in den Zwölffingerdarm.'];
function setMahlzeit(an, still) {
  if (an === mahlzeit) return;
  mahlzeit = an;
  $('bNuechtern').classList.toggle('on', !an);
  $('bEssen').classList.toggle('on', an);
  if (!still) Kern.toast(MAHLZEIT_TXT[an ? 1 : 0]);
}
$('bNuechtern').onclick = function () { setMahlzeit(false); };
$('bEssen').onclick = function () { setMahlzeit(true); };

/* =====================================================================
   7. Schema - die Leber als flaches Bild (Knopf "Schema", wie bei der Niere)
   Blick von vorn wie die Uebersicht, auf die Bildebene projiziert (x nach rechts = links im Koerper, y nach oben): Umrisse der vier Lappen, der Gallenblase und des
   Sichelbands kommen aus denselben Abstandsfeldern wie das 3D-Modell (form.lappen, form.gallenblase, form.sichelband; Projektion entlang z = kleinster Feldwert
   ueber z, Umrisslinien per Marching Squares - bekanntes Verfahren, selbst umgesetzt; dieselbe Loesung steht in niere.js, Organ-Dateien teilen keine
   Funktionen). Gefaesse, Gaenge, Hohlvene und Zwoelffingerdarm kommen aus denselben Mittellinien wie die 3D-Rohre (dicht), die Teilchen sind die Instanzen der
   3D-Teilchen (Matrizen der InstancedMeshes aus stroemungBild; Tempo, Pause, Mahlzeit und das Zusammenziehen der Gallenblase gelten damit mit). Das Schema legt nichts
   in der 3D-Szene an und zieht keinen Zufall; gebaut wird es erst beim ersten Oeffnen. Bildkoordinaten: 1 cm = K Bildpunkte.
   ===================================================================== */
var SCH = (function () {
  var NS = 'http://www.w3.org/2000/svg', K = 19, W = 460, H = 722, X0 = -14.9, Y1 = 121.2;
  var BRASS = '#E0A94A', DIM = '#8DA7B1', INK = '#E7EFF0', DARK = '#0B171C';
  var svg = null, built = false, onPick = null, SG = {}, POOL = [], DYN = {}, seen = {}, GBP = null;
  function f1(v) { return Math.round(v * 10) / 10; }
  function E(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function BX(x) { return f1((x - X0) * K); }
  function BY(y) { return f1((Y1 - y) * K); }
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

  /* ---- Marching Squares: Umrisslinien (Feld = 0) eines Gitters als geschlossene Linienzuege (bekanntes Verfahren, selbst umgesetzt) ----
     Innen: Wert < 0. Je Zelle ein oder zwei Strecken zwischen den Kantenpunkten (Kanten-ID: Gitterpunkt * 2 + 0 waagerecht, + 1 senkrecht),
     die Strecken werden ueber gemeinsame Kanten zu Linienzuegen verkettet; der Rand des Gitters muss ausserhalb liegen. */
  function gitter(x0, y0, x1, y1, h) { return { x0: x0, y0: y0, h: h, nx: Math.ceil((x1 - x0) / h) + 1, ny: Math.ceil((y1 - y0) / h) + 1 }; }
  /* Feld in der Bildebene: kleinster Wert von fn ueber z (Raster hz) im Quader gr; ausserhalb des Quaders (x, y) gilt "aussen" */
  function projekt(fn, gr, G, hz) {
    var f = new Float32Array(G.nx * G.ny), i, j, z;
    for (j = 0; j < G.ny; j++) for (i = 0; i < G.nx; i++) {
      var x = G.x0 + i * G.h, y = G.y0 + j * G.h, m = 1;
      if (x >= gr[0][0] - 0.2 && x <= gr[1][0] + 0.2 && y >= gr[0][1] - 0.2 && y <= gr[1][1] + 0.2) {
        m = 1e9;
        for (z = gr[0][2]; z <= gr[1][2]; z += hz) { var v = fn(x, y, z); if (v < m) { m = v; if (m < -0.4) break; } }   /* tief im Innern genuegt das Vorzeichen */
      }
      f[i + G.nx * j] = m;
    }
    return f;
  }
  var CASE = [[], [[0, 3]], [[0, 1]], [[3, 1]], [[1, 2]], null, [[0, 2]], [[3, 2]], [[3, 2]], [[0, 2]], null, [[1, 2]], [[3, 1]], [[0, 1]], [[0, 3]], []];   /* Kanten je Zelle: 0 unten, 1 rechts, 2 oben, 3 links */
  function linien(G, v) {
    var nx = G.nx, ny = G.ny, nb = {}, ids = [], i, j, c;
    function kante(i, j, k) { return k === 0 ? (i + nx * j) * 2 : (k === 1 ? (i + 1 + nx * j) * 2 + 1 : (k === 2 ? (i + nx * (j + 1)) * 2 : (i + nx * j) * 2 + 1)); }
    function verbinde(a, b) { if (nb[a] === undefined) { nb[a] = [b, -1]; ids.push(a); } else nb[a][1] = b; }
    for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
      var p = i + nx * j, a = v[p], b = v[p + 1], d = v[p + nx + 1], e = v[p + nx];
      c = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (d < 0 ? 4 : 0) | (e < 0 ? 8 : 0);
      var s = CASE[c];
      if (c === 5) s = (a + b + d + e) < 0 ? [[0, 1], [3, 2]] : [[0, 3], [1, 2]];
      else if (c === 10) s = (a + b + d + e) < 0 ? [[0, 3], [1, 2]] : [[0, 1], [3, 2]];
      for (var q = 0; q < s.length; q++) { var k0 = kante(i, j, s[q][0]), k1 = kante(i, j, s[q][1]); verbinde(k0, k1); verbinde(k1, k0); }
    }
    function punkt(id) {
      var idx = id >> 1, i0 = idx % nx, j0 = (idx - i0) / nx, va = v[idx], vb = (id & 1) ? v[idx + nx] : v[idx + 1], t = va / (va - vb);
      return (id & 1) ? [G.x0 + i0 * G.h, G.y0 + (j0 + t) * G.h] : [G.x0 + (i0 + t) * G.h, G.y0 + j0 * G.h];
    }
    var besucht = {}, out = [];
    ids.forEach(function (start) {
      if (besucht[start]) return;
      var zug = [], prev = -1, cur = start;
      while (cur >= 0 && !besucht[cur]) {
        besucht[cur] = 1; zug.push(punkt(cur));
        var n = nb[cur], nxt = n[0] !== prev && !besucht[n[0]] ? n[0] : (n[1] !== prev && n[1] >= 0 && !besucht[n[1]] ? n[1] : -1);
        prev = cur; cur = nxt;
      }
      if (zug.length > 2) out.push(zug);
    });
    return out;
  }
  /* Linienzuege (cm) -> Pfad in Bildpunkten, Punkte dichter als 0,6 Bildpunkte entfallen */
  function pfad(zuege) {
    var d = '';
    zuege.forEach(function (z) {
      var lx = 1e9, ly = 1e9, n = 0;
      z.forEach(function (p) {
        var x = BX(p[0]), y = BY(p[1]);
        if (n && Math.abs(x - lx) + Math.abs(y - ly) < 0.6) return;
        d += (n ? 'L' : 'M') + x + ' ' + y; lx = x; ly = y; n++;
      });
      d += 'Z';
    });
    return d;
  }
  /* Rohr als Band um eine Mittellinie (Bildpunkte, halbe Breiten hw) */
  function band(px, py, hw) {
    var n = px.length, A = '', B = '', i;
    for (i = 0; i < n; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1), dx = px[i1] - px[i0], dy = py[i1] - py[i0], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l * hw[i], ny = dx / l * hw[i];
      A += (i ? 'L' : 'M') + f1(px[i] + nx) + ' ' + f1(py[i] + ny);
      B = 'L' + f1(px[i] - nx) + ' ' + f1(py[i] - ny) + B;
    }
    return A + B + 'Z';
  }
  function linienPfad(px, py) { var d = ''; for (var i = 0; i < px.length; i++) d += (i ? 'L' : 'M') + px[i] + ' ' + py[i]; return d; }

  function build(box, pick) {
    if (built) return;
    onPick = pick;
    box.innerHTML = '';
    svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Inter, "Segoe UI", system-ui, sans-serif',
      'aria-label': 'Schema: Blick von vorn auf die Leber, die Teilchen fließen wie im 3D-Modell' }, box);
    var i, G = form.GEFAESSE, B = form.baeume(), hits = [];

    /* ---- Zwoelffingerdarm (hinten) ---- */
    var dl = form.duodenumLinie(), dpx = [], dpy = [], dhw = [];
    dl.forEach(function (q, k) { if (k % 2 === 0 || k === dl.length - 1) { dpx.push(BX(q[0])); dpy.push(BY(q[1])); dhw.push(K * form.DUODENUM.r); } });
    E('path', { d: band(dpx, dpy, dhw), fill: hex(STRUCT.zwoelffinger.col), 'fill-opacity': 0.5, stroke: '#8A5A48', 'stroke-width': 1, 'stroke-linejoin': 'round', 'class': 'sz', 'data-info': 'zwoelffinger' }, grp(svg, 'zwoelffinger'));

    /* ---- Lappen: Umrisse aus den Abstandsfeldern (ein gemeinsames Gitter), darunter der Gesamtumriss der Leber ---- */
    var GL = gitter(-14.6, 101.8, 7.9, 117.7, 0.14), lap = form.lappen(), F = {}, uni = null;
    lap.forEach(function (l) {
      F[l.id] = projekt(l.sdf, l.grenzen, GL, 0.7);
      if (!uni) uni = F[l.id].slice(); else for (i = 0; i < uni.length; i++) if (F[l.id][i] < uni[i]) uni[i] = F[l.id][i];
    });
    E('path', { d: pfad(linien(GL, uni)), fill: '#2A1210', stroke: '#2A1210', 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'fill-rule': 'evenodd', 'pointer-events': 'none' }, svg);
    var LF = { lappenR: '#7A4038', lappenL: '#83473E', quadrat: '#8C5146', schwanz: '#6A332C' };
    ['schwanz', 'quadrat', 'lappenR', 'lappenL'].forEach(function (sid) {
      E('path', { d: pfad(linien(GL, F[sid])), fill: LF[sid], stroke: '#2A1210', 'stroke-width': 1.1, 'stroke-linejoin': 'round', 'fill-rule': 'evenodd', 'class': 'sz', 'data-info': sid }, grp(svg, sid));
    });
    /* Sichelband (Grenze zwischen rechtem und linkem Lappen) und rundes Leberband */
    var SB = form.SICHELBAND.grenzen, GS = gitter(SB[0][0] - 0.3, SB[0][1] - 0.3, SB[1][0] + 0.3, SB[1][1] + 0.3, 0.05), gB = grp(svg, 'baender');
    E('path', { d: pfad(linien(GS, projekt(form.sichelband, SB, GS, 0.4))), fill: hex(STRUCT.baender.col), stroke: '#8A7A6A', 'stroke-width': 0.7, 'stroke-linejoin': 'round', 'fill-rule': 'evenodd', 'class': 'sz', 'data-info': 'baender' }, gB);
    var rb = form.kurve(form.RUNDES_BAND.pts, 6), rpx = rb.map(function (q) { return BX(q[0]); }), rpy = rb.map(function (q) { return BY(q[1]); });
    E('path', { d: linienPfad(rpx, rpy), fill: 'none', stroke: hex(STRUCT.baender.col), 'stroke-width': f1(2 * K * form.RUNDES_BAND.r), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'sz', 'data-info': 'baender' }, gB);

    /* ---- Gefaesse und Gaenge: Rohre aus denselben Linien wie in bauen (dicht), je Struktur eine Gruppe ---- */
    function rohr(g, d, fill) {
      var px = [], py = [], hw = [], k, n = d.p.length;
      for (k = 0; k < n; k += 2) { px.push(BX(d.p[k][0])); py.push(BY(d.p[k][1])); hw.push(Math.max(1, K * d.r[k])); }
      if ((n - 1) % 2) { px.push(BX(d.p[n - 1][0])); py.push(BY(d.p[n - 1][1])); hw.push(Math.max(1, K * d.r[n - 1])); }
      var mx = Math.max.apply(null, hw);
      E('path', { d: band(px, py, hw), fill: fill, 'fill-opacity': 0.92, stroke: mx > 2.6 ? DARK : 'none', 'stroke-width': 1, 'stroke-linejoin': 'round' }, g);
      return { px: px, py: py, w: Math.max(9, 2 * mx + 5) };
    }
    function gruppeRohre(sid, liste, fill) {
      var g = grp(svg, sid);
      g.setAttribute('pointer-events', 'none');   /* Gefaesse fangen keine Klicks: das tun die Antippflaechen */
      liste.forEach(function (d) { var h = rohr(g, d, fill); h.sid = sid; hits.push(h); });
    }
    var hvp = form.hohlveneAbschnitt(), hvD = { p: hvp, r: hvp.map(function () { return form.HOHLVENE.r; }) };
    var gv = grp(svg, 'hohlvene'), hvr = rohr(gv, hvD, hex(STRUCT.hohlvene.col));
    gv.setAttribute('pointer-events', 'none'); gv.firstChild.setAttribute('fill-opacity', 0.6); hvr.sid = 'hohlvene'; hits.push(hvr);
    var zu = function (arr, sid) { return arr.map(function (a) { return dicht(a.pts, a.r0, a.r1, sid); }); };
    gruppeRohre('lebervenen', zu(B.venen, 'lebervenen'), '#4B74D0');
    gruppeRohre('pfortader', [dicht(G.pfortader[0].pts, G.pfortader[0].r0, G.pfortader[0].r1, 'pfortader')]
      .concat(G.pfortader.slice(1).map(function (g) { return dicht(form.stumpf(g.pts, form.STUMPF), g.r0, g.r1, 'pfortader'); }), zu(B.pfortader, 'pfortader')), '#8E6FC8');
    gruppeRohre('arterie', [dicht(G.leberarterie[0].pts, G.leberarterie[0].r0, G.leberarterie[0].r1, 'arterie')].concat(zu(B.arterie, 'arterie')), '#D8453A');
    var gg = G.gallengang;
    gruppeRohre('lebergang', gg.slice(0, 3).map(function (a) { return dicht(a.pts, a.r0, a.r1, 'lebergang'); }).concat(zu(B.galle, 'lebergang')), '#5FB365');
    /* Gallenblase: Umriss aus dem Abstandsfeld; zieht sich zum Hals hin zusammen (transform, Strich bleibt gleich dick) */
    var GB = form.GALLENBLASE, GG = gitter(GB.grenzen[0][0] - 0.4, GB.grenzen[0][1] - 0.4, GB.grenzen[1][0] + 0.4, GB.grenzen[1][1] + 0.4, 0.06);
    GBP = { el: E('path', { d: pfad(linien(GG, projekt(form.gallenblase, GB.grenzen, GG, 0.3))), fill: hex(STRUCT.gallenblase.col), 'fill-opacity': 0.85, stroke: '#2F5A22', 'stroke-width': 1.1, 'stroke-linejoin': 'round',
      'vector-effect': 'non-scaling-stroke', 'class': 'sz', 'data-info': 'gallenblase' }, grp(svg, 'gallenblase')), hx: BX(GB.hals.p[0]), hy: BY(GB.hals.p[1]), s: -1 };
    gruppeRohre('blasengang', [dicht(gg[3].pts, gg[3].r0, gg[3].r1, 'blasengang')], '#5FB365');
    gruppeRohre('hauptgang', [dicht(gg[4].pts, gg[4].r0, gg[4].r1, 'hauptgang')], '#4F9A55');
    gruppeRohre('pankreasgang', form.GEFAESSE.pankreasgang.map(function (a) { return dicht(a.pts, a.r0, a.r1, 'pankreasgang'); }), hex(STRUCT.pankreasgang.col));
    var PA = form.PAPILLE;
    E('circle', { cx: BX(PA.p[0]) + 4, cy: BY(PA.p[1]), r: f1(K * PA.r * 0.8), fill: hex(STRUCT.papille.col), stroke: '#6A3A2C', 'stroke-width': 0.9, 'class': 'sz', 'data-info': 'papille' }, grp(svg, 'papille'));

    /* ---- Teilchen: je Gruppe der 3D-Teilchen ein Pool; Lage und Groesse aus den Instanzmatrizen ---- */
    var gt = E('g', { 'pointer-events': 'none' }, svg);
    var FM = { pfortader: ['#B9A3F0', '#2E1A6A'], arterie: ['#F0786C', '#4A0A12'], vene: ['#8BAEF0', '#0E2058'], galle: ['#A5DC83', '#1F4A10'] };
    POOL = ST.gruppen.map(function (g) {
      var gg2 = E('g', null, gt), c = FM[g.art], arr = [];
      for (var q = 0; q < g.list.length; q++) arr.push({ el: E('circle', { r: 1, fill: c[0], stroke: c[1], 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke', display: 'none' }, gg2), on: false, tf: '' });
      return arr;
    });

    /* ---- Beschriftung: Bereiche, Kaestchen an den Gefaessenden, Abzeichen, Legende, Kennzahlen, Hinweis ---- */
    var ga = E('g', { 'pointer-events': 'none' }, svg), LBL = { 'letter-spacing': 1.2, 'font-weight': 600 };
    function leiter(x0, y0, x1, y1) {
      E('line', { x1: f1(x0), y1: f1(y0), x2: f1(x1), y2: f1(y1), stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, ga);
      E('circle', { cx: f1(x0), cy: f1(y0), r: 1.8, fill: BRASS }, ga);
    }
    function bereich(s, tx, ty, anker, px, py, lx, ly) {   /* Text bei (tx, ty), Leiter von (px, py) nach (lx, ly) */
      leiter(px, py, lx, ly); text(ga, tx, ty, s, 9.5, DIM, anker ? { 'text-anchor': anker, 'letter-spacing': 1.2, 'font-weight': 600 } : LBL);
    }
    var gbm = form.GALLENBLASE.koerper.p;
    bereich('RECHTER LAPPEN', 8, BY(117.4), null, BX(-10.8), BY(112), 60, BY(117.4) + 5);
    bereich('LINKER LAPPEN', W - 8, BY(117.4), 'end', BX(4.6), BY(111.5), W - 70, BY(117.4) + 5);
    bereich('GALLENBLASE', 8, BY(100.8), null, BX(gbm[0]) - 6, BY(gbm[1]), 60, BY(100.8) - 4);
    bereich('LEBERPFORTE', W - 8, BY(104.2), 'end', BX(-2.6), BY(107.6), W - 74, BY(104.2) - 4);
    function kasten(cx, cy, s) {
      var w = Math.round(s.length * 5.5 + 12);
      E('rect', { x: f1(cx - w / 2), y: f1(cy - 8), width: w, height: 16, rx: 3, fill: DARK, 'fill-opacity': 0.9, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
      text(ga, cx, cy + 3.3, s, 9.5, INK, { 'text-anchor': 'middle', 'stroke-width': 0, 'font-weight': 600 });
    }
    var mes = form.stumpf(G.pfortader[2].pts, form.STUMPF), milz = form.stumpf(G.pfortader[1].pts, form.STUMPF);
    var mEnd = mes[mes.length - 1], zEnd = milz[milz.length - 1], aOr = G.leberarterie[0].pts[0], hv0 = hvp[0], hv1 = hvp[hvp.length - 1];
    kasten(BX(mEnd[0]) + 22, BY(mEnd[1]) + 18, 'Darm');
    kasten(BX(zEnd[0]) + 30, BY(zEnd[1]), 'Milz');
    kasten(BX(aOr[0]) + 28, BY(aOr[1]), 'Aorta');
    kasten(BX(hv1[0]), BY(hv1[1]) - 15, 'Herz');
    kasten(BX(hv0[0]) - 30, BY(hv0[1]) + 24, 'Becken und Beine');
    kasten(BX(dl[48][0]) - 10, BY(dl[48][1]) + 22, 'Zwölffingerdarm');   /* am unteren Ende des Abschnitts */

    /* Abzeichen an den Wegen */
    function aufRohr(d, f) { var q = d.p[Math.round(f * (d.p.length - 1))]; return [BX(q[0]), BY(q[1])]; }
    var stammP = dicht(G.pfortader[0].pts, 0.65, 0.65, 'pfortader'), artP = dicht(G.leberarterie[0].pts, 0.3, 0.25, 'arterie');
    var vene1 = dicht(B.venen[0].pts, B.venen[0].r0, B.venen[0].r1, 'lebervenen'), hg = dicht(gg[4].pts, gg[4].r0, gg[4].r1, 'hauptgang');
    var ast3 = B.pfortader.filter(function (a) { return a.gen === 3; })[0], gast = B.galle.filter(function (a) { return a.gen === 2; })[1] || B.galle[2];
    var bp = [aufRohr(stammP, 0.5), aufRohr(artP, 0.5), aufRohr(dicht(ast3.pts, ast3.r0, ast3.r1, 'pfortader'), 0.5), aufRohr(vene1, 0.5),
      aufRohr(dicht(gast.pts, gast.r0, gast.r1, 'lebergang'), 0.5), [BX(gbm[0]), BY(gbm[1])], aufRohr(hg, 0.55)];
    bp.forEach(function (p, q) { abzeichen(ga, p[0], p[1], q + 1); });

    /* Legende der Wege unter dem Bild, zwei Spalten */
    var LG = [
      ['Blut aus dem Darm', 'Pfortader: nährstoffreiches Blut', 'aus Magen, Darm und Milz'],
      ['Blut aus der Aorta', 'Leberarterie: sauerstoffreiches Blut', 'für das Lebergewebe'],
      ['Durch die Leber', 'Beide Ströme verzweigen sich und', 'mischen sich in den Leberläppchen'],
      ['Blut fließt ab', 'Lebervenen führen das Blut über', 'die untere Hohlvene zum Herzen'],
      ['Galle entsteht', 'Leberzellen bilden Galle, die Lebergänge', 'sammeln sie an der Leberpforte'],
      ['Speicher Gallenblase', 'Nüchtern fließt die Galle in die', 'Gallenblase und wird eingedickt'],
      ['Galle in den Darm', 'Nach dem Essen über den Hauptgallengang', 'und die Papille in den Zwölffingerdarm']
    ];
    var COL = [8, 236], ly0 = 520;
    LG.forEach(function (t, q) {
      var cx = COL[q < 4 ? 0 : 1], cy = ly0 + (q % 4) * 40.5;
      abzeichen(ga, cx + 7, cy - 3, q + 1);
      text(ga, cx + 20, cy, t[0], 10.5, BRASS, { 'font-weight': 700 });
      text(ga, cx + 20, cy + 11.5, t[1], 8.6, DIM, { 'stroke-width': 2.2 });
      text(ga, cx + 20, cy + 22, t[2], 8.6, DIM, { 'stroke-width': 2.2 });
    });
    /* Kennzahlen */
    var kx = COL[1], ky = ly0 + 3 * 40.5 - 13;
    E('rect', { x: kx, y: f1(ky), width: 216, height: 66, rx: 4, fill: DARK, 'fill-opacity': 0.88, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
    text(ga, kx + 8, ky + 14, 'KENNZAHLEN · LEBER', 8.5, BRASS, { 'font-weight': 700, 'letter-spacing': 0.8, 'stroke-width': 0 });
    ['Durchblutung: ca. 1,5 l Blut pro Minute', 'davon ¾ Pfortader, ¼ Leberarterie', 'Galle: ca. 0,5–1 l pro Tag', 'Gallenblase: fasst ca. 50 ml'].forEach(function (s, q) {
      text(ga, kx + 8, ky + 27 + q * 11, s, 8.6, DIM, { 'stroke-width': 0 });
    });
    /* Hinweiszeile je nach Mahlzeit, zwei Zeilen */
    DYN.hint = [text(ga, 8, ly0 + 3 * 40.5 + 62, '', 8.8, INK, { 'stroke-width': 2.2 }), text(ga, 8, ly0 + 3 * 40.5 + 74, '', 8.8, INK, { 'stroke-width': 2.2 })];

    /* ---- Antippflaechen der Gefaesse (unsichtbar, ueber allem) ---- */
    var gh = E('g', { fill: 'none', stroke: '#000', 'stroke-opacity': 0, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'stroke' }, svg), hg2 = {};
    hits.forEach(function (h) {
      var g = hg2[h.sid] || (hg2[h.sid] = grp(gh, h.sid));
      E('path', { d: linienPfad(h.px, h.py), 'stroke-width': h.w, 'class': 'sz', 'data-info': h.sid }, g);
    });
    svg.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.sz') : null;
      if (onPick) onPick(t ? t.getAttribute('data-info') : null, e);
    });
    seen = { vis: -1, mz: -1 };
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
    /* Gallenblase: Skalierung zum Hals hin wie im 3D-Modell */
    var sg = ST.sg;
    if (sg !== GBP.s) { GBP.s = sg; GBP.el.setAttribute('transform', 'translate(' + f1(GBP.hx * (1 - sg) * 100) / 100 + ' ' + f1(GBP.hy * (1 - sg) * 100) / 100 + ') scale(' + Math.round(sg * 1000) / 1000 + ')'); }
    /* Teilchen */
    ST.gruppen.forEach(function (g, gi) {
      var pool = POOL[gi], A = g.im.instanceMatrix.array, show = g.im.visible;
      for (i = 0; i < pool.length; i++) {
        var q = pool[i], s = A[i * 16], v = show && s > 0.02;
        if (v) {
          var tf = 'translate(' + BX(A[i * 16 + 12]) + ' ' + BY(A[i * 16 + 13]) + ') scale(' + (Math.round(Math.max(1.4, s * K * 1.1) * 10) / 10) + ')';
          if (tf !== q.tf) { q.el.setAttribute('transform', tf); q.tf = tf; }
          if (!q.on) { q.el.setAttribute('display', 'inline'); q.on = true; }
        } else if (q.on) { q.el.setAttribute('display', 'none'); q.on = false; }
      }
    });
    /* Hinweiszeile: der Satz der Mahlzeit (siehe MAHLZEIT_TXT), nach dem Gedankenstrich bzw. dem ersten Komma umbrochen */
    if (mahlzeit !== seen.mz) {
      seen.mz = mahlzeit;
      var t = MAHLZEIT_TXT[mahlzeit ? 1 : 0], k = t.indexOf(' – '), z1, z2;
      if (k >= 0) { z1 = t.slice(0, k + 2); z2 = t.slice(k + 3); } else { k = t.indexOf(', '); z1 = t.slice(0, k + 1); z2 = t.slice(k + 2); }
      DYN.hint[0].textContent = z1; DYN.hint[1].textContent = z2;
    }
  }
  function abbauen() {
    svg = null; built = false; onPick = null; SG = {}; POOL = []; DYN = {}; seen = {}; GBP = null;
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
/* Das Schema weicht anderen Ansichten: hier ergaenzen spaetere Schritte ihre Gruende (Hilfekarte und Ueben, Lupe, AR, Fahrt in die Leberlaeppchen) */
function schemaWeicht() { if (schemaOn) setSchema(false); }   /* wird von showCard (Hilfekarte, Ueben, Wege) aufgerufen */
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };
function schemaTick() { SCH.update(selected, enabled, lv); }

/* =====================================================================
   7b. Kamerafahrt zum Leberlaeppchen (Infokarte "Leberlaeppchen hier ansehen" bei den vier Lappen, Knopf "Laeppchen"): Alles Uebrige blendet aus, die Lappen werden in der
   ersten Haelfte zu Glas (danach noch blasser), der Pfortaderbaum bleibt und fuehrt zur Stelle. Dort waechst in der zweiten Haelfte das Laeppchen aus der Form des
   Laeppchen-Moduls (organ.form) an den Endast des Pfortaderbaums; es erscheint vergroessert (Massstab: der Pfortaderast des Laeppchens hat den Radius des Endasts).
   Die Leber dreht sich dabei (alle Achsen, um den Ursprung des Laeppchens), bis die Achse des Laeppchens senkrecht steht: dann gilt in Weltachsen dieselbe Lage wie im
   Laeppchen-Modell, und die Kamera landet in dessen Startansicht (umgerechnet in Welt-Koordinaten); dann wird die Adresse gesetzt. Beim Zurueckkommen
   (umg.von === 'laeppchen') steht die Leber gedreht im Nahbild und faehrt nach 450 ms zur Uebersicht zurueck (Drehung zurueck, Laeppchen blendet aus, Lappen werden wieder
   deckend). Die Stroemung steht waehrend der Fahrt. Neue three.js-Objekte (das Laeppchen) entstehen erst bei der Fahrt.
   ===================================================================== */
var LP_STANDARD = [-11.4, 107.1, 1.5];     /* Standardstelle (Knopf "Laeppchen"): der naechste Endast im rechten Lappen (Koerper-Koordinaten, cm) */
var LP_START = { theta: 0, phi: 1.0, dist: 40, target: [0, 3.2, 0] };   /* Ersatz fuer die Startansicht des Laeppchen-Moduls, falls dessen Skript fehlt */
var LP_LOBE_ENDE = 0.08;                   /* Deckkraft der Lappen am Ende der Fahrt (Glas: GLAS) */
var lpWahl = null;                         /* Endast (Index in baeume().endpunkte) zum angetippten Punkt */
var lpGruppe = null, lpM = [];             /* Gruppe des Laeppchens (Kind von root) und seine Materialien [{ m, op }] */
var LP = null;                             /* Lage der aktuellen Fahrt: { idx, s (Massstab), pc (Ursprung des Laeppchens, Raum der Leber), qa (Laeppchen -> Leber), qEnd (Leber -> Welt am Ende) } */
var lpP = null, lpWartet = false;          /* Laden des Laeppchen-Moduls im Hintergrund, Wartezeit nach dem Klick */
var fz = null;                             /* laufende Fahrt */
var lpStep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
var ROOT0 = V(-M[0], -M[1], -M[2]), Q_ID = new THREE.Quaternion();
/* naechster Endast im Lappen id zum Punkt punkt (Vector3, Raum der Szene); ohne Punkt der am weitesten vorn gelegene. null, wenn es keinen gibt */
function laeppchenWahl(id, punkt) {
  var B = form.baeume(), q = punkt ? root.worldToLocal(punkt.clone()) : null, best = null, bd = 1e9;
  B.endpunkte.forEach(function (e, i) {
    if (e.lappen !== id) return;
    var d = q ? Math.pow(e.p[0] - q.x, 2) + Math.pow(e.p[1] - q.y, 2) + Math.pow(e.p[2] - q.z, 2) : -e.p[2];
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
function laeppchenStandard() {   /* Index des Endasts im rechten Lappen, der LP_STANDARD am naechsten liegt */
  var best = null, bd = 1e9;
  form.baeume().endpunkte.forEach(function (e, i) {
    if (e.lappen !== 'lappenR') return;
    var d = Math.pow(e.p[0] - LP_STANDARD[0], 2) + Math.pow(e.p[1] - LP_STANDARD[1], 2) + Math.pow(e.p[2] - LP_STANDARD[2], 2);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
function lpModul() { return Kern.Organe && Kern.Organe.laeppchen; }
/* Lage des Laeppchens am Endast idx: das untere Ende seines Pfortaderasts (form.anschluss) liegt auf dem Ende des Endasts, die Achse des Laeppchens (Modell +y) zeigt in
   Richtung des Endasts, die Vorderseite (Modell +z) moeglichst nach vorn (+z der Leber); LP.qEnd dreht das zurueck */
function laeppchenLage(idx) {
  var B = form.baeume(), ep = B.endpunkte[idx], ast = B.pfortader.filter(function (a) { return a.pts[a.pts.length - 1] === ep.p; })[0];
  var e = V(ep.p[0], ep.p[1], ep.p[2]), m = V(ast.pts[1][0], ast.pts[1][1], ast.pts[1][2]);
  var d = e.clone().sub(m).normalize(), vorn = V(0, 0, 1);
  if (Math.abs(d.z) > 0.95) vorn = V(1, 0, 0);
  var az = vorn.sub(d.clone().multiplyScalar(vorn.dot(d))).normalize(), ay = d.clone(), ax = new THREE.Vector3().crossVectors(ay, az);
  var qa = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, ay, az));
  var lm = lpModul(), an = lm && lm.form ? lm.form.anschluss() : { p: [0, -1, 0], r: 0.5 }, s = ep.r / an.r;
  var pc = e.clone().sub(V(an.p[0], an.p[1], an.p[2]).multiplyScalar(s).applyQuaternion(qa));
  return { idx: idx, s: s, pc: pc, qa: qa, qEnd: qa.clone().invert() };
}
/* Startansicht des Laeppchen-Moduls in Welt-Koordinaten: gleiche Blickrichtung, Abstand und Ziel mit dem Massstab und der Lage des Laeppchens umgerechnet, Versatz des Bildbereichs wie im Modell */
function laeppchenZiel(w, h) {
  var lm = lpModul(), st = lm && lm.start ? lm.start(w, h) : null, r = bereich(w, h);
  if (!st) st = Object.assign({ versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] }, LP_START);
  return { theta: st.theta, phi: st.phi, dist: LP.s * st.dist, target: ROOT0.clone().add(LP.pc).addScaledVector(V(st.target[0], st.target[1], st.target[2]), LP.s), versatz: st.versatz };
}
/* Die ganze Leber um den Ursprung des Laeppchens drehen: f = 0 ohne Drehung, 1 mit der Achse senkrecht (der Ursprung bleibt an seinem Platz) */
function lpDrehung(f) {
  root.quaternion.copy(Q_ID).slerp(LP.qEnd, f);
  root.position.copy(ROOT0).add(LP.pc).sub(V(LP.pc.x, LP.pc.y, LP.pc.z).applyQuaternion(root.quaternion));
}
/* Das Laeppchen in der Leber (unsichtbar bis zum Einblenden): Teile und Materialien aus organ.form; ohne Modul bleibt die Gruppe leer */
function lpBauen() {
  lpGruppe = new THREE.Group(); lpGruppe.name = 'Leberläppchen'; lpGruppe.visible = false;
  lpGruppe.position.copy(LP.pc); lpGruppe.quaternion.copy(LP.qa); lpGruppe.scale.setScalar(LP.s); root.add(lpGruppe);
  lpM = [];
  var lm = lpModul(); if (!lm || !lm.form) return;
  var def = lm.form.matDef();
  lm.form.teile().forEach(function (t) {
    var d = def[t.sid], o = {}, k, mt;
    for (k in d[1]) o[k] = d[1][k];
    mt = mat(d[0], o); mt.transparent = true; mt.opacity = 0; lpM.push({ m: mt, op: o.opacity === undefined ? 1 : o.opacity });
    lpGruppe.add(lm.form.teilMesh(t, mt, d[2] + 3));
  });
}
function lpDeckkraft(f) {   /* Deckkraft des Laeppchens 0..1 */
  lpM.forEach(function (e) { e.m.opacity = e.op * f; });
  lpGruppe.visible = f > 0.002;
}
function lpAbbau() {   /* Laeppchen entsorgen, Leber in die Ausgangslage */
  if (lpGruppe) Kern.entsorgen(lpGruppe, envTex);
  lpGruppe = null; lpM = [];
  root.quaternion.copy(Q_ID); root.position.copy(ROOT0);
}
/* Alles ausser Pfortaderbaum und Lappen zum Ausblenden vorbereiten (Hin- und Rueckfahrt); merkt die Ursprungswerte. Die Lappen werden Glas (transparent, ohne Tiefenschreiben). */
function ausblendVorbereiten() {
  var keep = new Set(), ausMat = new Map(), glas = new Map(), altT = new Map(), altD = new Map(), ausObj = [];
  STRUCT.pfortader.meshes.forEach(function (m) { keep.add(m.material); });
  LAPPEN.forEach(function (sid) {
    STRUCT[sid].meshes.forEach(function (m) {
      var x = m.material; keep.add(x);
      if (glas.has(x)) return;
      glas.set(x, x.opacity); altT.set(x, x.transparent); altD.set(x, x.depthWrite);
      x.transparent = true; x.depthWrite = false; x.needsUpdate = true;
    });
  });
  root.traverse(function (o) {
    if (!o.material || !o.visible || o === lpGruppe || o.parent === lpGruppe || keep.has(o.material)) return;
    var ms = [].concat(o.material);
    ausObj.push(o);
    ms.forEach(function (x) { if (!ausMat.has(x)) { ausMat.set(x, x.opacity); altT.set(x, x.transparent); altD.set(x, x.depthWrite); x.transparent = true; x.needsUpdate = true; } });
  });
  var ui = Array.prototype.slice.call(umg.bereich.children);
  var altUi = ui.map(function (e) { return { op: e.style.opacity, pe: e.style.pointerEvents }; });
  ui.forEach(function (e) { e.style.pointerEvents = 'none'; });
  canvas.style.pointerEvents = 'none';
  labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
  return { mats: ausMat, glas: glas, altT: altT, altD: altD, obj: ausObj, ui: ui, altUi: altUi, fertig: false };
}
/* Fahrt zum Laeppchen am Endast idx (null: die Standardstelle); wartet, falls das Modul noch im Hintergrund geladen wird */
function laeppchenOeffnen(idx) {
  if (fz || abgebaut || lpWartet || !ST) return;
  if (lpP && !lpModul() && !lpFehl) { lpWartet = true; lpP.then(function () { lpWartet = false; if (!abgebaut) laeppchenOeffnen(idx); }); return; }
  schemaWeicht();
  if (quiz) quizEnd();
  if (wege) wegeEnd();
  closeCard();
  lpLetzte = idx = (idx === null || idx === undefined) ? laeppchenStandard() : idx;
  LP = laeppchenLage(idx);
  var w = window.innerWidth, h = window.innerHeight, ziel = laeppchenZiel(w, h), r = bereich(w, h);
  var dth = ziel.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI; ziel.theta = view.theta + dth;
  ORDER.forEach(function (d) { d.meshes.forEach(function (m) { var mt = m.material; if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)); }); });   /* Hervorhebung weg */
  lpBauen();
  var f = ausblendVorbereiten();
  orbit.anim = Kern.fahrt(view, { theta: ziel.theta, phi: ziel.phi, dist: ziel.dist, target: ziel.target }, 1200);
  f.hin = true; f.adresse = Kern.organAdresse('laeppchen'); f.a = orbit.anim;
  f.von = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2]; f.nach = ziel.versatz;
  fz = f;
}
var lpFehl = false;
$('iOpen').onclick = function () { laeppchenOeffnen(lpWahl); };
$('bLaeppchen').onclick = function () { laeppchenOeffnen(null); };
/* Rueckkehr aus dem Laeppchen-Modell: die Leber steht gedreht im Nahbild (am zuletzt gewaehlten Endast), das Laeppchen ist sichtbar, alles andere ausgeblendet; die Fahrt zur Uebersicht beginnt nach 450 ms */
function rueckkehr() {
  var B = form.baeume(); if (!B.endpunkte.length) return;
  LP = laeppchenLage(lpLetzte !== null ? lpLetzte : laeppchenStandard());
  var w = window.innerWidth, h = window.innerHeight, ziel = laeppchenZiel(w, h), r = bereich(w, h);
  lpBauen();
  var f = ausblendVorbereiten();
  f.mats.forEach(function (op, m) { m.opacity = 0; });
  f.glas.forEach(function (op, m) { m.opacity = LP_LOBE_ENDE; });
  f.ui.forEach(function (e) { e.style.opacity = '0'; });
  f.obj.forEach(function (o) { o.visible = false; });
  lpDrehung(1); lpDeckkraft(1);
  view.theta = ziel.theta; view.phi = ziel.phi; view.dist = ziel.dist; view.target.copy(ziel.target);
  orbit.anim = null;
  f.hin = false; f.a = null; f.warte = performance.now() + 450;
  f.von = ziel.versatz; f.nach = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2];
  camera.setViewOffset(w, h, f.von[0], f.von[1], w, h);
  camera.updateProjectionMatrix();
  fz = f;
}
function rueckEnde() {   /* Ursprungszustand wie nach einem normalen Aufbau */
  var w = window.innerWidth, h = window.innerHeight, r = bereich(w, h), a0 = AUSSCHNITTE[0], d = distFuer(a0, w, h);
  var zurueck = function (op, m) {
    m.opacity = op;
    if (m.transparent !== fz.altT.get(m) || m.depthWrite !== fz.altD.get(m)) { m.transparent = fz.altT.get(m); m.depthWrite = fz.altD.get(m); m.needsUpdate = true; }
  };
  fz.mats.forEach(zurueck); fz.glas.forEach(zurueck);
  fz.obj.forEach(function (o) { o.visible = true; });
  fz.ui.forEach(function (e, i) { e.style.opacity = fz.altUi[i].op; e.style.pointerEvents = fz.altUi[i].pe; });
  canvas.style.pointerEvents = '';
  labelBox.style.display = showLabels ? '' : 'none'; leaderSvg.style.display = showLabels ? '' : 'none';
  lpAbbau();
  view.theta = a0.theta; view.phi = a0.phi; view.dist = d; view.target.copy(a0.target);
  orbit.anim = null;
  camera.setViewOffset(w, h, w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2, w, h);
  camera.updateProjectionMatrix();
  aktiv = 0; fitDist = d; VIS = {};
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === 0);
  lv++;
  fz = null;
}
/* je Bild waehrend der Fahrt: Bildbereich, Deckkraft und Drehung mit derselben Glaettung wie die Kamera; u: 0 = Ausgangslage (Uebersicht), 1 = Nahbild */
function fahrtBild(now) {
  if (!fz.a && now >= fz.warte) {   /* Rueckfahrt beginnt: zur Uebersicht, kuerzester Weg beim Drehen */
    var w0 = window.innerWidth, h0 = window.innerHeight, a0 = AUSSCHNITTE[0];
    var dth = a0.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
    orbit.anim = fz.a = Kern.fahrt(view, { theta: view.theta + dth, phi: a0.phi, dist: distFuer(a0, w0, h0), target: a0.target.clone() }, 1200);
    fz.obj.forEach(function (o) { o.visible = true; });
  }
  var t = fz.a ? Math.min(1, Math.max(0, (now - fz.a.t0) / fz.a.d)) : 0, s = t * t * (3 - 2 * t), u = fz.hin ? s : 1 - s;
  var w = window.innerWidth, h = window.innerHeight;
  camera.setViewOffset(w, h, fz.von[0] + (fz.nach[0] - fz.von[0]) * s, fz.von[1] + (fz.nach[1] - fz.von[1]) * s, w, h);
  camera.updateProjectionMatrix();
  fz.mats.forEach(function (op, m) { m.opacity = op * (1 - u); });
  fz.glas.forEach(function (op, m) { m.opacity = u < 0.5 ? op + (GLAS - op) * lpStep(0, 0.5, u) : GLAS + (LP_LOBE_ENDE - GLAS) * lpStep(0.5, 1, u); });   /* erst Glas, dann noch blasser */
  fz.ui.forEach(function (e) { e.style.opacity = String(1 - u); });
  if (!fz.hin && t >= 1) { rueckEnde(); return false; }
  lpDrehung(u);
  lpDeckkraft(lpStep(0.5, 1, u));                                     /* erscheint in der zweiten Haelfte der Hinfahrt, geht in der ersten der Rueckfahrt */
  if (!fz.hin) return false;
  if (t >= 1 && !fz.fertig) { fz.fertig = true; fz.obj.forEach(function (o) { o.visible = false; }); return false; }
  return fz.fertig;   /* true erst ab dem Bild nach dem Endbild */
}

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var App = window.LeberApp = { ready: false, aufbauMs: 0, schema: function (an) { setSchema(!!an); }, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris,
  mahlzeit: function (an) { setMahlzeit(!!an); },
  /* fuer die Pruefung: Antippen einer Struktur wie mit dem Finger (nur beim Ueben), Zustaende von "Wege verfolgen" und "Strukturen finden" */
  tippe: function (id) { if (wege) wegeAntwort(id, [id]); else if (quiz) quizAntwort(id, [id]); },
  wege: function () { return wege && { weg: wege.nr + 1, station: wege.st, n: wege.n, ok: wege.ok, fehl: wege.fehl, liste: wege.liste.slice(), fertig: wege.fertig, leucht: wege.leucht.slice() }; },
  quiz: function () { return quiz && { ziel: quiz.target, n: quiz.n, ok: quiz.ok }; },
  laeppchen: function (i) { laeppchenOeffnen(i === undefined ? null : i); }, endpunkte: function () { return form.baeume().endpunkte.map(function (e) { return { p: e.p.slice(), lappen: e.lappen, r: e.r }; }); },
  stroemung: function () { return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, anteil: anteil, gallenblase: 1 - (1 - STR.REST) * sstep6(kontr) }; } };
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!fz) { stroemungSchritt(dt); stroemungBild(); }     /* waehrend der Fahrt zum Laeppchen steht die Stroemung */
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  var weiter = fz ? fahrtBild(now) : false;
  if (schemaOn) schemaTick();
  Kern.kamera(camera, view);
  if (schemaOn) return;                                   /* Schema offen: das Bild der Leber ist ausgeblendet und wird nicht gezeichnet */
  renderer.render(scene, camera);
  if (fz) {
    if (weiter && fz.hin && !fz.gesetzt) { fz.gesetzt = true; location.hash = fz.adresse; }   /* Endbild ist gezeichnet */
    return;
  }
  sichtPruefen(now, window.innerWidth, window.innerHeight);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  fz = null; canvas.style.pointerEvents = '';
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
  delete window.LeberApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  setSelected(selected);
  stroemungBauen();
  lpP = Kern.organLaden('laeppchen', { ohneCss: true }).then(function (o) { return o; }, function (e) { lpFehl = true; console.warn(e && e.message || e); return null; });   /* nur das Skript, im Hintergrund: liefert organ.form und organ.start fuer die Fahrt */
  if (umg.von === 'laeppchen') return lpP.then(function () { if (!abgebaut) rueckkehr(); }).then(fertig);   /* Rueckweg aus dem Laeppchen-Modell */
  fertig();
  function fertig() {
    if (abgebaut) return;
    App.aufbauMs = Math.round(performance.now() - t0);
    App.ready = true;
  }
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('leber', organ);
})();
