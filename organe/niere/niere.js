/* =====================================================================
   Niere - Rinde, Mark und Nierenbecken
   Die linke Niere als Frontalschnitt wie im Lehrbuch (ca. 11 cm): Die vordere
   Haelfte ("Deckel") laesst sich abheben (aufgeschnitten) oder aufsetzen
   (geschlossen). Die Form liefert organe/niere/niere-form.js (Kern.Formen.niere);
   hier wird sie vernetzt, eingefaerbt und bedient.
   Einheit cm; Achsen anatomisch wie im Koerper (x + links, y oben, z vorn),
   Mitte der Niere im Ursprung.
   Strömung: rote und blaue Blutteilchen (Durchblutung), gelbe Harntropfen (Harnbildung und Abfluss, Welle im Harnleiter);
   Pause und drei Tempi wie beim Nephron, Export "GLB animiert".
   Krankheitsbilder (Harnstau durch Nierenstein, Nierenarterienstenose) und Medikamente (Ramipril, Ibuprofen): Reiter und Erklaerkarte
   (Kern.Szenarien); Wirkung ueber weich ueberblendete Wirkgroessen (Abschnitt 5d).
   Zoomstufe: In der oberen Polpyramide ist ein Nephron markiert (Bahnen aus dem Nephron-Modul,
   organe/niere/nephron.js); "Nephron ansehen" faehrt hinein (Adresse niere/nephron).
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
  { id: 'nephron', de: 'Nephron', lat: 'Nephronum', grp: 'Nierengewebe', col: 0xFFC21A,
    txt: 'Funktionseinheit der Niere: Nierenkörperchen und Tubulus. Jede Niere hat rund eine Million Nephrone; das markierte ist hier stark vergrößert dargestellt. Über „Nephron ansehen“ geht es in die Nahansicht.',
    facts: { 'Anzahl': 'ca. 1 Million je Niere', 'Länge': 'ca. 3–5 cm', 'Lage': 'Rinde und Mark' } },
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
/* Hilfekarten der Leiste: [Schluessel, Titel, Text, Merke] */
var HILFE = [
  ['aufgaben', 'Aufgaben der Niere', 'Die Nieren reinigen das Blut von Abfallstoffen wie Harnstoff, Kreatinin und vielen Medikamenten. Sie regeln Wasser- und Salzhaushalt, das Säure-Basen-Gleichgewicht und über Renin den Blutdruck. Außerdem bilden sie Hormone: Erythropoetin regt die Blutbildung an, und in der Niere wird Vitamin D aktiviert.',
    'Die Niere ist Klärwerk, Wasserwerk und Hormondrüse zugleich.'],
  ['harnbildung', 'Vom Blut zum Harn', 'Durch beide Nieren fließen etwa 1,2 Liter Blut pro Minute. In den Glomeruli wird daraus Primärharn abgepresst – rund 180 Liter am Tag. Davon holen die Tubuli etwa 99 Prozent zurück; übrig bleiben ungefähr 1,5 Liter Endharn.',
    'Glomeruläre Filtrationsrate (GFR) normal ca. 120 ml/min – sie sinkt bei Nierenschwäche und im Alter.'],
  ['harnweg', 'Der Weg des Harns', 'Vom Sammelrohr tropft der Harn auf der Papille in einen kleinen Nierenkelch, fließt über die großen Kelche ins Nierenbecken und wird vom Harnleiter mit peristaltischen Wellen zur Blase transportiert. Über die Harnröhre wird er ausgeschieden.',
    'Der Harnleiter hat drei Engstellen – dort bleiben Nierensteine besonders oft hängen (Kolik).'],
  ['durchblutung', 'Durchblutung der Niere', 'Die Nierenarterie verzweigt sich in Segment-, Zwischenlappen-, Bogen- und Rindenarterien. Von dort zieht je eine zuführende Arteriole zu einem Glomerulus; die abführende Arteriole versorgt danach als zweites Kapillarnetz die Tubuli. Das Blut fließt über die gleichnamigen Venen zur Nierenvene zurück.',
    'Zwei Kapillarnetze hintereinander: erst filtern, dann zurückholen.'],
  ['pflege', 'Pflege: Ausscheidung beobachten', 'Normal sind etwa 1 bis 2 Liter Urin am Tag. Unter 500 ml spricht man von Oligurie, unter 100 ml von Anurie, über 3 Liter von Polyurie. Beobachtet werden Menge, Farbe, Geruch und Beimengungen; bei Bedarf wird die Ein- und Ausfuhr bilanziert und das Gewicht täglich kontrolliert.',
    'Weniger als 0,5 ml Urin pro kg Körpergewicht und Stunde über mehrere Stunden ist ein Warnzeichen – Arzt informieren.']
];
/* Krankheitsbilder und Medikamente (Reiter "Krankheiten" und "Medikamente", Erklaerkarte rechts): Felder wie bei Kern.Szenarien;
   wirkung = Zielwerte der Wirkgroessen (Abschnitt 5d), alles andere bleibt neutral; datei = Namensteil der Exportdatei */
var SZENARIEN = [
  { id: 'stein', kind: 'disease', datei: 'harnstau', name: 'Harnstau durch Nierenstein',
    short: 'Ein Stein im Harnleiter staut den Harn zurück – Kolik und erweitertes Nierenbecken', kicker: 'Krankheitsbild · Urolithiasis',
    lead: 'Ein Stein ist aus dem Nierenbecken in den Harnleiter gerutscht und bleibt an der ersten Engstelle hängen. Der Harn kann nicht mehr abfließen und staut sich zurück.',
    values: [['Schmerz', 'wellenförmig, Flanke bis Leiste'], ['Urin', 'oft Blut (Hämaturie)'], ['Nierenbecken', 'erweitert (Ultraschall)'], ['Gefahr', 'Infektion – Urosepsis']],
    steps: [['Der Stein klemmt.', 'Er steckt im oberen Harnleiter kurz unter dem Abgang aus dem Nierenbecken.'], ['Der Harnleiter kämpft.', 'Die peristaltischen Wellen werden stärker und krampfen gegen den Stein – das ist der Kolikschmerz.'], ['Der Harn staut sich.', 'Die Niere bildet weiter Harn, doch er kommt nicht vorbei: Nierenbecken und Kelche füllen sich und weiten sich (Hydronephrose).'], ['Druck auf die Niere.', 'Der Gegendruck bremst die Filtration; hält der Stau lange an, nimmt das Nierengewebe Schaden.']],
    after: [['Behandlung', 'Schmerzmittel und krampflösende Mittel (z. B. Metamizol, Butylscopolamin), viel trinken, Bewegung; kleine Steine gehen oft spontan ab. Große oder infizierte Staus werden entlastet (Harnleiterschiene, Nierenfistel) oder der Stein wird zertrümmert bzw. entfernt.'], ['Pflege beobachtet', 'Schmerz (Stärke, Verlauf), Temperatur und Vitalzeichen – Fieber bei Harnstau ist ein Notfall –, Urinmenge und -farbe; Urin sieben, um den Stein aufzufangen; Ein- und Ausfuhr.']],
    note: 'Im Modell ist der Stein vergrößert und der Stau stärker gezeigt, damit man ihn gut sieht.', wirkung: { stein: 1, stau: 1, harn: 1, blut: 0.9 } },
  { id: 'stenose', kind: 'disease', datei: 'nierenarterienstenose', name: 'Nierenarterienstenose',
    short: 'Die Nierenarterie ist verengt – die Niere schlägt Alarm und treibt den Blutdruck hoch', kicker: 'Krankheitsbild · renovaskuläre Hypertonie',
    lead: 'Die Nierenarterie ist verengt, meist durch Arteriosklerose. Hinter der Engstelle kommt weniger Blut an – die Niere hält das für einen zu niedrigen Blutdruck.',
    values: [['Blutdruck', 'erhöht, oft schwer einstellbar'], ['Renin', 'erhöht'], ['Durchblutung', 'vermindert'], ['Ursache', 'meist Arteriosklerose']],
    steps: [['Die Arterie ist eng.', 'An der Engstelle schnürt sich die Nierenarterie ein; dahinter fließt weniger Blut in die Niere.'], ['Die Niere misst zu wenig Druck.', 'Die Zellen an den zuführenden Arteriolen spüren den niedrigen Druck und schütten Renin aus.'], ['Renin startet eine Kette.', 'Renin bildet Angiotensin I, das ACE wandelt es in Angiotensin II um: Die Gefäße im ganzen Körper ziehen sich zusammen, Aldosteron hält Salz und Wasser zurück.'], ['Der Blutdruck steigt.', 'So erzwingt die Niere mehr Druck – für den übrigen Körper ist er zu hoch (Hypertonie).']],
    after: [['Behandlung', 'Blutdrucksenkung, Behandlung der Arteriosklerose (Statine, Thrombozytenhemmer, Rauchstopp), bei hochgradiger Stenose ggf. Aufdehnung mit Stent.'], ['Pflege beobachtet', 'Blutdruck regelmäßig und unter gleichen Bedingungen messen, Nierenwerte (Kreatinin) und Kalium im Blick behalten, besonders nach Beginn eines ACE-Hemmers.']],
    note: 'Im Modell ist die Engstelle deutlich sichtbar gezeichnet; die verminderte Durchblutung zeigt sich an weniger und langsameren Blutteilchen.', wirkung: { stenose: 1, blut: 0.45, harn: 0.75, renin: 1 } },
  { id: 'ramipril', kind: 'drug', datei: 'ramipril', name: 'Delix® (Ramipril)',
    short: 'ACE-Hemmer: weniger Angiotensin II – Gefäße weit, Blutdruck sinkt', kicker: 'Medikament · ACE-Hemmer',
    lead: 'Ramipril hemmt das Enzym ACE. Dadurch entsteht weniger Angiotensin II – die Gefäße bleiben weit, und Aldosteron sinkt.',
    values: [['Wirkung', 'Blutdruck ↓, Herz entlastet'], ['Niere', 'Druck im Glomerulus ↓'], ['Kontrolle', 'Kreatinin und Kalium'], ['Nebenwirkung', 'trockener Reizhusten']],
    steps: [['ACE wird blockiert.', 'Aus Angiotensin I entsteht kaum noch Angiotensin II.'], ['Die Gefäße entspannen sich.', 'Im ganzen Körper sinkt der Widerstand; in der Niere weitet sich vor allem die abführende Arteriole.'], ['Weniger Druck im Knäuel.', 'Der Filtrationsdruck im Glomerulus nimmt etwas ab – das schont die Niere bei Diabetes und Bluthochdruck langfristig.'], ['Weniger Aldosteron.', 'Es wird weniger Salz und Wasser zurückgehalten; Kalium kann ansteigen.']],
    after: [['Achtung', 'Bei beidseitiger Nierenarterienstenose kann die Filtration stark abfallen; zusammen mit NSAR und Diuretika steigt das Risiko eines akuten Nierenversagens.'], ['Pflege beobachtet', 'Blutdruck (besonders nach der ersten Gabe: Schwindel, Sturzgefahr), Kreatinin und Kalium, Reizhusten, sehr selten Schwellungen im Gesicht (Angioödem – Notfall).']],
    note: 'Die Wirkung im Modell ist vereinfacht: etwas weniger Druck im Knäuel, etwas weniger Primärharn.', wirkung: { blut: 1, harn: 0.9, renin: 0 } },
  { id: 'ibuprofen', kind: 'drug', datei: 'ibuprofen', name: 'Ibuprofen (NSAR)',
    short: 'Schmerzmittel, das die Nierendurchblutung drosseln kann', kicker: 'Medikament · nichtsteroidales Antirheumatikum',
    lead: 'Ibuprofen hemmt die Bildung von Prostaglandinen. In der Niere halten Prostaglandine die zuführenden Arteriolen weit – fehlen sie, wird die Niere schlechter durchblutet.',
    values: [['Wirkung', 'Schmerz, Fieber, Entzündung ↓'], ['Niere', 'Durchblutung und Filtration ↓'], ['Risiko', 'bei Flüssigkeitsmangel, Alter'], ['Folge', 'Wasser- und Salzretention']],
    steps: [['Prostaglandine fehlen.', 'Ibuprofen blockiert das Enzym, das sie bildet.'], ['Die zuführende Arteriole wird eng.', 'Gerade wenn der Körper wenig Flüssigkeit hat, verlässt sich die Niere auf Prostaglandine – ohne sie zieht sich die Arteriole zusammen.'], ['Weniger Blut, weniger Filtrat.', 'Im Modell kommen weniger Blutteilchen in die Rinde, an den Papillen tropft weniger Harn.'], ['Salz und Wasser bleiben im Körper.', 'Ödeme und ein höherer Blutdruck sind möglich.']],
    after: [['Achtung', 'Besonders gefährlich bei Exsikkose, Herzschwäche, Nierenschwäche und hohem Alter – und in der Kombination mit ACE-Hemmer und Diuretikum („triple whammy“).'], ['Pflege beobachtet', 'Trinkmenge und Urinmenge, Ödeme, Gewicht, Nierenwerte; an Alternativen denken (z. B. Paracetamol oder Metamizol nach ärztlicher Anordnung).']],
    note: 'Der Effekt ist im Modell verstärkt dargestellt.', wirkung: { blut: 0.55, harn: 0.5 } }
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
    <button id="bNephron" class="gh" title="In ein Nephron hineinzoomen">Nephron</button>
    <span class="sep"></span>
    <button id="bLupe" class="gh" title="Lupe: Nahansicht einer Nierenpapille">Lupe</button>
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
  <div class="trow">
    <span class="cap">Str&ouml;mung</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bS0" class="gh">langsam</button>
    <button id="bS1" class="gh on">normal</button>
    <button id="bS2" class="gh">schnell</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#E0584C">Rot</b> Arterien &ndash; bringen das Blut zur Niere.<br>
  <b style="color:#6F93E0">Blau</b> Venen &ndash; f&uuml;hren es zur&uuml;ck.<br>
  <b style="color:#E3C75A">Gelb</b> Harnwege &ndash; Kelche, Becken und Harnleiter.<br>
  <b style="color:#FFC21A">Gold</b> das markierte Nephron (stark vergr&ouml;&szlig;ert).</p>
  <p class="note" id="legNote">Schnitt durch die linke Niere von vorn; die vordere H&auml;lfte ist abgehoben.</p>
  <p class="note">Die Teilchen zeigen die Str&ouml;mung &ndash; symbolisch, nicht ma&szlig;st&auml;blich: rot Blut zur Niere, blau Blut zur&uuml;ck, gelb Harn.</p>
  <p class="note kz">Durchblutung beider Nieren ca. 1,2 l Blut pro Minute (ein F&uuml;nftel des Herzzeitvolumens)<br>
  daraus ca. 180 l Prim&auml;rharn pro Tag<br>
  davon bleiben ca. 1,5 l Endharn</p>
</div>

<div class="panel" id="exp">
  <span class="tag">Export</span>
  <button id="bGlbA" class="gh">GLB &middot; animiert</button>
  <button id="bGlbS" class="gh">GLB &middot; statisch</button>
  <button id="bStl" class="gh">STL</button>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
  <button class="gh" id="iOpen" style="display:none">Nephron ansehen</button>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schlie&szlig;en">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">N&auml;chste</button><button class="gh" id="qStop">Beenden</button></div>
</div>

<div class="panel" id="lupe" aria-live="polite">
  <button class="gh hbtn" id="bLupeX" aria-label="Lupe schlie&szlig;en">&times;</button>
  <div class="lp-kick">Lupe &middot; Nahansicht</div>
  <h3 id="lpTitle">Nierenpapille &ndash; hier tropft der Harn ab</h3>
  <div class="lp-chips" id="lpChips"><button class="gh on" data-adh="1">mit ADH</button><button class="gh" data-adh="0">ohne ADH</button></div>
  <div class="lp-main"><canvas id="lpCv"></canvas><div class="lp-text" id="lpText"></div></div>
  <div class="lp-leg"><span><i style="background:#3AA0FF"></i>Wasser</span><span><i style="background:#B98BD9"></i>gel&ouml;ste Teilchen (Salz)</span><span><i style="background:#E8B923"></i>Harn</span><span><i style="background:#C8372D"></i>Blut im Vas rectum</span></div>
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
    <button class="ar-b" id="arPause">Pause</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
var organ = { renderer: {}, aufbauen: aufbauen };
/* Startansicht (Kamera in anatomischen Achsen, cm, Nierenmitte = 0) und Bildbereich: gemeinsam fuer das Modell (aufbauen) und den
   Andockpunkt organ.start (Kamerafahrt aus dem Koerper), damit Fahrt-Ende und Detailmodell zusammenpassen */
var UEBERSICHT = { ext: [8.8, 14], halb: 4.4 };   /* Ausschnitt 'Uebersicht': Breite und Hoehe (cm) im freien Bereich */
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer Niere und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 30 };
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (Desktop 115, Handy 100 bei drei Zeilen, je
   32 mehr, wenn eine der ersten beiden Reihen umbricht: Reihe 1 unter Breite 479 (zweite Zeile) und unter 294 (dritte), Reihe 2 unter 379; die Reihe Stroemung bricht nicht um); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (100 + (w < 479 ? 32 : 0) + (w < 294 ? 32 : 0) + (w < 379 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 115 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.start = function (w, h) {
  var f = Kern.Formen && Kern.Formen.niere;
  if (!f) throw new Error('Die Form der Niere ist nicht geladen.');
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: f.LAGE.dreh * (Math.PI / 180), phi: Math.PI / 2, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: [0, 0, 0],
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
/* Markiertes Nephron (Zoomstufe): Lage in der oberen Polpyramide und Startansicht des Nephron-Modells (Ersatz, wenn dessen Skript fehlt).
   Hoehe der Hintergrundtafel des Nephron-Modells (Rinde oben, Mark unten) in Nephron-Koordinaten wie organe/niere/nephron.js (TAFEL) */
var NE_TAFEL = [-9.7, 8.5];
var NE_DX = 0.6;      /* Nephron-Ursprung seitlich der Papille (cm in der Schnittebene): so liegt es ganz im Gewebe des oberen Pols */
var NE_Z = 0.25;      /* Nephron-Ursprung vor der Schnittflaeche (cm): das hinterste Rohr liegt knapp (ca. 0,02 cm) davor */
var NE_GC = [0, 5.80, 0];   /* Mitte des Nierenkoerperchens (Nephron-Koordinaten) */
var NE_START = { theta: 0.26, phi: 1.46, dist: 27, target: [1.2, -0.5, 0], versatz: [0, 0] };
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = Kern.Formen && Kern.Formen.niere;
if (!form) throw new Error('Die Form der Niere ist nicht geladen.');
umg.bereich.innerHTML = MARKUP;
/* Nephron-Modell nur als Skript nachladen (ohne Gestaltung): liefert die Bahnen des markierten Nephrons und die Startansicht der Fahrt; ohne Modul fehlt das Nephron, die Fahrt bleibt moeglich */
var nephP = Kern.organLaden('nephron', { ohneCss: true }).then(function (o) { return o.form || null; }, function (e) { console.warn(e && e.message || e); return null; });

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
/* Gefaesse: Arterien rot, Venen blau; je Stufe ein Material je Art (gleiche Struktur-ID); leicht durchscheinend (Deckkraft 0.55,
   depthWrite aus), damit man die Teilchen der Stroemung darin sieht; in der USDZ (ohne Teilchen) undurchsichtig */
['arterie', 'vene', 'interlobaer', 'bogen', 'interlobular'].forEach(function (sid) {
  MAT[sid + 'A'] = mat(ROT, { rough: 0.4, coat: 0.3, opacity: 0.55 });
  MAT[sid + 'V'] = mat(BLAU, { rough: 0.4, coat: 0.3, opacity: 0.55 });
  MAT[sid + 'A'].userData.usdzOp = MAT[sid + 'V'].userData.usdzOp = 1;
});
/* Teilchen der Stroemung: kraeftige Farben mit leichtem Leuchten (heben sich von den durchscheinenden Gefaessen ab) */
MAT.blutRot = mat(0xFF4B3C, { rough: 0.35 }); MAT.blutRot.emissive.copy(srgb(0xB01808)).multiplyScalar(0.6);
MAT.blutBlau = mat(0x5C8DFF, { rough: 0.35 }); MAT.blutBlau.emissive.copy(srgb(0x1B3FB0)).multiplyScalar(0.6);
MAT.harn = mat(0xFFF03A, { rough: 0.3 }); MAT.harn.emissive.copy(srgb(0xFFD400)).multiplyScalar(0.75);
['blutRot', 'blutBlau', 'harn'].forEach(function (k) { MAT[k].userData.baseEmissive = MAT[k].emissive.clone(); });
MAT.nebenniere = mat(0xD8A13E, { rough: 0.55, coat: 0.2 });
/* markiertes Nephron: kraeftiges Gold mit leichtem Leuchten (das Leuchten ist der Grundwert der Hervorhebung) */
MAT.nephron = mat(0xFFC21A, { rough: 0.35, coat: 0.4 });
MAT.nephron.emissive.copy(srgb(0xFFB020)).multiplyScalar(0.3); MAT.nephron.userData.baseEmissive = MAT.nephron.emissive.clone();
/* Krankheitsbilder: Nierenstein (gelblich weiss, matt) und Renin-Markierungen (leuchtendes Orange) */
MAT.stein = mat(0xF6F1E0, { rough: 0.85 }); MAT.stein.emissive.copy(srgb(0xFFF4D0)).multiplyScalar(0.18); MAT.stein.userData.baseEmissive = MAT.stein.emissive.clone();
MAT.renin = mat(0xFF9A2E, { rough: 0.4 }); MAT.renin.emissive.copy(srgb(0xFF6A00)).multiplyScalar(0.9); MAT.renin.userData.baseEmissive = MAT.renin.emissive.clone();
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
    var rad = l.seiten || (l.r > 0.2 ? 12 : l.r > 0.09 ? 8 : l.r > 0.04 ? 6 : 5), tub = Math.max(6, l.pts.length * 4);
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
var tris = { gewebe: 0, hohl: 0, gefaesse: 0, nebenniere: 0, nephron: 0 };
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
  await setLoad(0.93, 'Strömung'); if (abgebaut) return;
  stroemungBauen(L);
  szenarioBauen(L);
  await setLoad(0.95, 'Nephron'); if (abgebaut) return;
  var nform = await nephP; if (abgebaut) return;
  if (nform) {   /* ohne Nephron-Modell bleibt die Struktur ohne Netz (die Fahrt zum Nephron funktioniert trotzdem) */
    var nb2 = nform.bahnen(), nl = [];
    nb2.linien.forEach(function (l) {
      var rr = l.r.map(function (r) { return Math.max(0.03, r * NE.s); }), rm = Math.max.apply(null, rr), pts = l.pts.map(function (q) { var v = nephPunkt(q); return [v.x, v.y, v.z]; }), a0 = 0, a1 = pts.length;
      /* Anfang und Ende ausserhalb der Niere weglassen (die zufuehrende Arteriole kommt von aussen) */
      while (a0 < a1 - 2 && form.aussen(pts[a0][0], pts[a0][1], pts[a0][2]) > 0) a0++;
      while (a1 - 2 > a0 && form.aussen(pts[a1 - 1][0], pts[a1 - 1][1], pts[a1 - 1][2]) > 0) a1--;
      var f0 = a0 / (pts.length - 1), f1 = (a1 - 1) / (pts.length - 1);
      var rt = rr.map(function (r, i) { return [(i / (rr.length - 1) - f0) / (f1 - f0), r / rm]; }).filter(function (q) { return q[0] >= 0 && q[0] <= 1; });
      nl.push({ pts: pts.slice(a0, a1), r: rm, seiten: 10, rt: rt.length ? rt : undefined });
    });
    var ng = rohre(nl);
    addMesh(root, 'nephron', ng, MAT.nephron, STRUCT.nephron.de + ' (Tubulus)', 0); tris.nephron += ng.index.count / 3;
    var kg = new THREE.SphereGeometry(NE.s * nb2.glomerulus.r, 28, 18), km = nephPunkt(nb2.glomerulus.mitte);
    kg.translate(km.x, km.y, km.z);
    addMesh(root, 'nephron', kg, MAT.nephron, STRUCT.nephron.de + ' (Nierenkörperchen)', 0); tris.nephron += kg.index.count / 3;
  }
  await setLoad(0.97, 'Beschriftung'); if (abgebaut) return;
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0, inAR = false;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var openK = 1, openZiel = 1;   /* 1 = aufgeschnitten (Deckel weg), 0 = geschlossen; laeuft weich */
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait } */
var LUPE = { mode: false, open: false, papille: 0, adh: 1, adhZiel: 1, vorher: null, ring: null, line: null, ctx: null, dpr: 1, W: 340, H: 236, dots: null };   /* Lupe an der Papille (Abschnitt 5c) */
var DECKEL_WEG = 6;            /* so weit gleitet der Deckel nach vorn (cm) */
/* Wirkgroessen der Krankheitsbilder und Medikamente (Abschnitt 5d); neutral = ohne Szenario, das Modell sieht dann aus wie ohne diese Funktion */
var WIRKNEUTRAL = { blut: 1, harn: 1, stau: 0, stein: 0, stenose: 0, renin: 0 };
var FAKT = { blut: 1, harn: 1, stau: 0, stein: 0, stenose: 0, renin: 0, tempo: 1 };   /* tempo: Tempo der Blutteilchen, folgt aus blut */
var SZ = null, SZG = null;     /* Szenarien (Zustand und Karte), Geometrie dazu (nach dem Aufbau) */
var kartePlatz = 0;            /* 1 = Szenariokarte rechts offen (Desktop): der Bildbereich ist um ihre Breite schmaler */
var KARTE_B = 352;             /* Breite der Karte mit Rand (Pixel) */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Teilchen der Stroemung (userData.teilchen = 'blut' | 'harn'): sichtbar, solange eine Gefaess- bzw. Harnwegsebene sichtbar ist */
var GEFAESS_SID = ['arterie', 'vene', 'interlobaer', 'bogen', 'interlobular'], HARN_SID = ['kelcheKlein', 'kelcheGross', 'becken', 'harnleiter'];
function teilchenSichtbar(art) { return (art === 'blut' ? GEFAESS_SID : HARN_SID).some(function (sid) { return enabled[sid]; }); }
/* Stein und Renin-Markierungen: nur beim passenden Szenario, solange die Ebene des Harnleiters bzw. der Rindengefaesse sichtbar ist */
function szSichtbar(k) { return k === 'stein' ? FAKT.stein > 0.001 && !!enabled.harnleiter : FAKT.renin > 0.001 && !!enabled.interlobular; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh) o.visible = o.userData.sz ? szSichtbar(o.userData.sz) : (o.userData.teilchen ? teilchenSichtbar(o.userData.teilchen) : enabled[o.userData.sid]); });
  if (ST) ST.neu = true;
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
  if (!id) { box.classList.remove('show'); kartenLage(); return; }
  if (LUPE.open) lupeClose();
  if (!quiz) closeCard();
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
  $('iOpen').style.display = id === 'nephron' ? '' : 'none';   /* Knopf "Nephron ansehen" nur in der Infokarte des Nephrons */
  box.classList.add('show');
  szWeichen();
}

/* Krankheitsbilder und Medikamente: Reiter, Erklaerkarte rechts (id kcard) und weiches Ueberblenden der Wirkgroessen (Abschnitt 5d) */
SZ = Kern.Szenarien({
  daten: SZENARIEN, karte: 'kcard', dauer: 1.5,
  beimWechsel: function (id) {
    if (id) {                                          /* Hilfekarte, Info, Lupe und Ueben weichen der Szenariokarte */
      if (quiz) quizEnd();
      if (LUPE.open) lupeClose();
      setSelected(null); closeCard();
    }
    if (id && window.innerWidth <= 1000) szWeichen();   /* Handy: die Karte deckt die Niere, sie beginnt eingeklappt (Titelzeile) */
    else kartenLage();
    szenarioWirkung();
  },
  beimEinklappen: function () {
    if (SZ.offen) {                                    /* wieder aufgeklappt: die anderen Karten weichen */
      if (quiz) quizEnd();
      if (LUPE.open) lupeClose();
      setSelected(null); closeCard();
    }
    kartenLage();
  }
});
/* Szenariokarte klappt ein, wenn Hilfekarte, Info, Lupe oder Ueben aufgehen; das Szenario bleibt aktiv */
function szWeichen() {
  if (SZ.aktiv && SZ.offen) {
    SZ.zuklappen();
    var bm = SZ.el.querySelector('#bCardMin'); if (bm) bm.textContent = '+';
  }
  kartenLage();
}
/* Karte "weg", solange eine andere Karte offen ist; auf dem Desktop macht die offene Karte rechts Platz (schmalerer Bildbereich) */
function kartenLage() {
  if (!SZ || !SZ.el) return;
  var andere = $('scard').classList.contains('show') || $('info').classList.contains('show') || $('lupe').classList.contains('show');
  SZ.el.classList.toggle('weg', andere && !SZ.offen);
  var platz = (SZ.aktiv && SZ.offen && window.innerWidth > 1000) ? 1 : 0;
  if (platz !== kartePlatz) { kartePlatz = platz; groesse(window.innerWidth, window.innerHeight); }
  lv++;
}

(function leiste() {
  /* Reiter wie beim Herz: Strukturen, Krankheiten, Medikamente, Hilfekarten, Ueben */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneD = document.createElement('div'); paneD.id = 'paneDis';
  var paneM = document.createElement('div'); paneM.id = 'paneMed';
  var paneH = document.createElement('div'); paneH.id = 'paneHelp';
  var paneU = document.createElement('div'); paneU.id = 'paneUeben';
  var panes = [rail, paneD, paneM, paneH, paneU];
  ['Strukturen', 'Krankheiten', 'Medikamente', 'Hilfekarten', '\u00dcben'].forEach(function (name, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  $('rail').appendChild(tabs);
  panes.forEach(function (pn, k) { if (k) pn.style.display = 'none'; $('rail').appendChild(pn); });
  /* Krankheiten, Medikamente */
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', 'Schalte ein Krankheitsbild ein: Die Niere ver\u00e4ndert sich, und rechts erscheint eine Erkl\u00e4rkarte.');
  SZ.liste(paneM, 'drug', 'Medikamente', 'Schalte ein Medikament ein: Die Niere zeigt seine Wirkung, und rechts erscheint eine Erkl\u00e4rkarte.');
  /* Hilfekarten */
  var ih = document.createElement('p'); ih.className = 'dis-intro'; ih.textContent = 'Kurz erkl\u00e4rt \u2013 tippe eine Karte an, sie erscheint unten.'; paneH.appendChild(ih);
  HILFE.forEach(function (c) {
    var d = document.createElement('div'); d.className = 'dis'; d.tabIndex = 0; d.dataset.card = c[0];
    d.innerHTML = '<span><b></b></span>'; d.querySelector('b').textContent = c[1];
    d.addEventListener('click', function () { openHelp(c[0]); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter') openHelp(c[0]); });
    paneH.appendChild(d);
  });
  /* Ueben */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur an der Niere und tippe sie an. Die Beschriftung verschwindet solange.'; paneU.appendChild(iu);
  var pb = document.createElement('div'); pb.className = 'pane-btn';
  var bq = document.createElement('button'); bq.className = 'gh'; bq.id = 'bQuiz'; bq.textContent = 'Strukturen finden';
  bq.addEventListener('click', function () { quiz ? quizEnd() : quizStart(); });
  pb.appendChild(bq); paneU.appendChild(pb);
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
      row.addEventListener('click', function () { if (!quiz) setSelected(s.id); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); if (!quiz) setSelected(s.id); }
        if (e.key === ' ') { e.preventDefault(); flip(); }
      });
      wrap.appendChild(row);
    });
    rail.appendChild(wrap);
  });
})();

/* Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text (oder Liste), Abschnitt "Merke"; unten links wie die Infokarte */
function showCard(kick, title, lead, after, istQuiz) {
  if (LUPE.open) lupeClose();
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  $('sLead').textContent = lead;
  var A = $('sAfter'); A.innerHTML = '';
  if (after) { var h5 = document.createElement('h5'); h5.textContent = after.h; var p = document.createElement('p'); p.textContent = after.t; A.appendChild(h5); A.appendChild(p); }
  $('sQa').style.display = istQuiz ? 'flex' : 'none';
  if (selected && !istQuiz) setSelected(null);
  $('scard').classList.add('show');
  $('info').classList.remove('show');
  szWeichen();
  lv++;
}
function closeCard() {
  $('scard').classList.remove('show');
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.remove('on'); });
  kartenLage();
  lv++;
}
function openHelp(key) {
  var c = HILFE.filter(function (x) { return x[0] === key; })[0]; if (!c) return;
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.toggle('on', d.dataset.card === key); });
  showCard('Hilfekarte', c[1], c[2], c[3] ? { h: 'Merke', t: c[3] } : null, false);
}
/* Ueben: "Tippe auf: ..." - nur Strukturen, die in der aktuellen Ansicht (aufgeschnitten oder geschlossen) sichtbar sind */
function quizPool() {
  return ORDER.filter(function (s) { return s.meshes.length && enabled[s.id] && (openZiel || AUSSEN.indexOf(s.id) >= 0); }).map(function (s) { return s.id; });
}
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  showCard('\u00dcben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe die Niere, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizStart() {
  setSelected(null); quiz = { n: 0, ok: 0, target: null, last: null, wait: false };
  $('bQuiz').classList.add('on'); $('bQuiz').textContent = '\u00dcben beenden';
  lv++; quizNext();
}
function quizEnd() {
  clearTimeout(quizT);
  if (quiz && quiz.target) leuchte(quiz.target, false);
  quiz = null; closeCard(); $('bQuiz').classList.remove('on'); $('bQuiz').textContent = 'Strukturen finden';
}
function leuchte(id, an) {   /* Struktur kurz hervorheben (Antwort beim Ueben), ohne Infokarte */
  if (!STRUCT[id]) return;
  var brass = srgb(0xE0A94A);
  STRUCT[id].meshes.forEach(function (m) {
    var mt = m.material;
    if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)).add(brass.clone().multiplyScalar(an ? 0.28 : 0));
  });
}
function quizAntwort(sid, durch) {   /* durch: Strukturen, durch die man hindurchsieht (durchscheinende Treffer vor dem ersten undurchsichtigen) */
  var Q = quiz; if (!Q || !Q.target || Q.wait) return;
  Q.n++; Q.wait = true;
  var ok = sid === Q.target || durch.indexOf(Q.target) >= 0; if (ok) { Q.ok++; sid = Q.target; }
  var L = $('sLead'); L.innerHTML = '';
  var sp = document.createElement('span'); sp.className = ok ? 'ok' : 'no';
  sp.textContent = ok ? 'Richtig.' : (sid && STRUCT[sid] ? 'Das war: ' + STRUCT[sid].de + '. Die gesuchte Struktur leuchtet jetzt.' : 'Daneben \u2013 die gesuchte Struktur leuchtet jetzt.');
  L.appendChild(sp);
  $('sScore').textContent = Q.ok + ' von ' + Q.n + ' richtig';
  leuchte(Q.target, true);
  var tg = Q.target;
  quizT = setTimeout(function () { leuchte(tg, false); if (quiz) quizNext(); }, ok ? 1200 : 2400);
}
$('sClose').onclick = function () { if (quiz) quizEnd(); else closeCard(); };
$('qNext').onclick = function () { if (quiz) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); } };
$('qStop').onclick = quizEnd;

/* Aufgeschnitten / Geschlossen */
var LEGNOTE = ['Die linke Niere von vorn, geschlossen. „Aufgeschnitten“ zeigt das Innere.', 'Schnitt durch die linke Niere von vorn; die vordere Hälfte ist abgehoben.'];
function offen(an) {
  openZiel = an ? 1 : 0;
  $('bOffen').classList.toggle('on', an);
  $('bZu').classList.toggle('on', !an);
  $('legNote').textContent = LEGNOTE[an ? 1 : 0];
  lv++;
  if (quiz) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); }   /* andere Ansicht: neue Aufgabe aus den jetzt sichtbaren Strukturen */
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
/* Markiertes Nephron: Nephron-Koordinaten -> Niere (anatomisch). Nur Drehung um die senkrechte Achse (Nephron-z = Normale der
   Schnittebene), Massstab NE.s und Verschiebung NE.p0; die Hoehe der Hintergrundtafel des Nephron-Modells reicht von der Kapsel
   bis zur Papille der oberen Polpyramide (PY[0]), die Rinden-Mark-Grenze des Nephrons liegt dann etwa auf der der Pyramide. */
var cDr = Math.cos(DREH), sDr = Math.sin(DREH);
var NE = (function () {
  var P = PY[0], u = P.uA, b = P.basisA, t = 0, nn = form.SCHNITT_N;
  while (form.aussen(b[0] + u[0] * t, b[1] + u[1] * t, b[2] + u[2] * t) < 0) t += 0.005;   /* Kapsel ueber der Basis */
  var yk = b[1] + u[1] * t, ya = P.apexA[1], s = (yk - ya) / (NE_TAFEL[1] - NE_TAFEL[0]);
  var x0 = P.apexA[0] * cDr - P.apexA[2] * sDr + NE_DX;   /* Papille in der Ebene (Richtung ex = (cos, 0, -sin)) */
  var y0 = (yk + ya) / 2 - s * (NE_TAFEL[0] + NE_TAFEL[1]) / 2;
  return { s: s, p0: V(x0 * cDr + NE_Z * nn[0], y0, -x0 * sDr + NE_Z * nn[2]) };
})();
function nephPunkt(p) { return V(NE.p0.x + NE.s * (p[0] * cDr + p[2] * sDr), NE.p0.y + NE.s * p[1], NE.p0.z + NE.s * (-p[0] * sDr + p[2] * cDr)); }
var view = { theta: DREH, phi: PI / 2, dist: 28, target: V(0, 0, 0) };
var orbit = Kern.orbit(canvas, view, { minDist: 3, maxDist: 80 });
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die
   Beschriftungsspalten freilassen. Ziele in lokalen Achsen (Schnittebene z = 0), hier nach anatomisch gedreht. */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: DREH, phi: PI / 2, target: lokalAnat([0, -0.1, 0]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Rinde und Mark', theta: DREH, phi: PI / 2, target: lokalAnat([0.8, 1.9, 0]), ext: [5.0, 7.0], halb: 3.4 },
  { name: 'Nierenbecken', theta: DREH, phi: PI / 2, target: lokalAnat([-1.3, -0.3, 0]), ext: [5.6, 8.2], halb: 2.8 },
  { name: 'Hilus', theta: DREH - 50 * DEG, phi: 1.45, target: lokalAnat([-2.3, -0.7, 0.3]), ext: [5.4, 6.6], halb: 2.7 }
];
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Niere und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
function bereich(w, h) {
  var tr = $('tools').getBoundingClientRect(), r = bereichFuer(w, h, tr.top, tr.bottom);
  if (kartePlatz) r.x1 -= KARTE_B;   /* Szenariokarte rechts offen (Desktop): Niere und Beschriftung rutschen nach links */
  return r;
}
function distFuer(a, w, h) {
  return abstandFuer(a.ext, bereich(w, h), camera.fov, h);
}
function gehe(i) {
  var a = AUSSCHNITTE[i]; if (!a) return;
  aktiv = i; LUPE.vorher = null;   /* wer bei offener Lupe einen Ausschnitt waehlt, behaelt ihn beim Schliessen */
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

/* Antippen: sichtbare Strukturen; das Glas des Gewebes zaehlt nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged || fz) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, glas = null, erster = null, durch = [], dicht = false;
  for (var i = 0; i < hits.length && !(treffer && dicht); i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    erster = erster || hits[i].point;
    if (!dicht) { durch.push(sid); dicht = !o.material.transparent; }
    if (!treffer) { if (seeThrough && GEWEBE.indexOf(sid) >= 0) glas = glas || sid; else treffer = sid; }
  }
  if (LUPE.mode) { if (erster) lupeWahl(erster); return; }   /* Lupe: Papille waehlen statt Strukturinfo */
  if (quiz) { quizAntwort(treffer || glas || null, durch); return; }
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
  ANKER.nephron = nephPunkt(NE_GC);   /* Nierenkoerperchen des markierten Nephrons (anatomische Achsen) */
})();
var AUSSEN = ['kapsel', 'arterie', 'vene', 'harnleiter', 'becken', 'nebenniere'];   /* geschlossen von aussen sichtbar */
var KURZ = { pyramiden: 'Nierenpyramiden', interlobaer: 'Zwischenlappengefäße', interlobular: 'Rindengefäße' };
var HANDYNAME = { interlobaer: 'Interlobärgefäße', kelcheKlein: 'Kleine Kelche', kelcheGross: 'Große Kelche' };   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
/* je Ausschnitt: Strukturen in der Beschriftung */
var LISTEN = [
  ['kapsel', 'rinde', 'saeulen', 'pyramiden', 'papillen', 'nephron', 'kelcheKlein', 'kelcheGross', 'becken', 'harnleiter', 'arterie', 'vene', 'interlobaer', 'bogen', 'interlobular', 'nebenniere'],
  ['kapsel', 'rinde', 'saeulen', 'pyramiden', 'papillen', 'nephron', 'interlobaer', 'bogen', 'interlobular'],
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
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, openZiel, LUPE.open ? LUPE.papille : -1].join('|');
  if (key === lastKey) return;
  lastKey = key;
  var narrow = w < 1000, r = bereich(w, h), a = AUSSCHNITTE[aktiv], th = Math.tan(camera.fov * PI / 360);
  var pxcm = h / (2 * view.dist * th), cx = (r.x0 + r.x1) / 2;
  var colL = Math.min(cx - 20, Math.max(r.x0 + r.labW + 4, cx - a.halb * pxcm - 12));
  var colR = Math.max(cx + 20, Math.min(r.x1 - r.labW - 4, cx + a.halb * pxcm + 12));
  var topL = narrow ? r.y0 : 100, topR = narrow ? Math.max(r.y0, 214) : $('tools').getBoundingClientRect().bottom + 16;
  var botL = narrow ? r.y1 - 6 : h - 40, botR = botL;
  var unten = ['info', 'scard', 'lupe'].filter(function (id) { return $(id).classList.contains('show'); })[0];   /* Karte unten links: Beschriftung links darueber */
  var szKarte = !!(SZ.aktiv && SZ.offen);   /* Szenariokarte: Desktop rechts (der Bildbereich ist schon schmaler), Handy oben ueber der Niere */
  if (!narrow && unten) botL = Math.min(botL, h - 22 - $(unten).offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !quiz && !(narrow && (selected || unten || szKarte))) {   /* Handy: die Karte deckt die Niere, ohne Beschriftung bleibt sie frei; beim Ueben keine Beschriftung */
    (LUPE.open ? ['papillen'] : LISTEN[aktiv]).forEach(function (id) {   /* bei offener Lupe nur die Papille der Lupe */
      if (!enabled[id] || (!openZiel && AUSSEN.indexOf(id) < 0)) return;
      if (LUPE.open) papillenPunkt(LUPE.papille, pv); else pv.copy(ANKER[id]);
      pv.project(camera);
      if (pv.z > 1) return;
      if ((id === 'nephron' || aktiv === 1) && (Math.abs(pv.x) > 1 || Math.abs(pv.y) > 1)) return;   /* ausserhalb des Bildes (Ausschnitt Rinde und Mark zeigt nur den oberen Pol): keine Beschriftung */
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
   5b. Stroemung: Blut (rot zur Niere hin, blau zurueck) und Harn (gelb) als Teilchen, dazu die Welle im Harnleiter.
   Symbolisch, nicht massstaeblich. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des Teilchens:
   kein Zufall, die Anzahl steht beim Aufbau fest. Je Art ein InstancedMesh (ein Zeichenaufruf).
   Blut: Bahnen aus den Gefaesslinien der Form (Nierenarterie -> Segment- -> Zwischenlappen- -> Bogen- -> Rindenarterie bzw.
   umgekehrt bei den Venen); das Tempo folgt dem Radius (gross = schnell). Alle Teilchen starten zu festen, gleichmaessig verteilten
   Zeiten (Periode STR.P) und leben, bis sie das Ende der Bahn erreichen (Rinde bzw. Austritt aus der Niere).
   Harn: aus jeder Papille tropfen Tropfen durch den kleinen und grossen Kelch ins Nierenbecken; dort sammelt sich alle STR.PW
   Sekunden eine Portion, die in einer peristaltischen Welle (Verdickung vorn, Einschnuerung dahinter) den Harnleiter hinabwandert.
   ===================================================================== */
var playing = true, speed = 1, clock = 0, clockB = 0;   /* clockB: Uhr der Blutteilchen (laeuft mit FAKT.tempo langsamer, sonst gleich clock) */
var STR = { P: 12, PW: 6, NKEY: 120 };   /* Periode der Blutstroemung (s), Periode der Harnportionen (s), Stuetzstellen je Periode im Export */
var ST = null;                            /* nach dem Aufbau: Gruppen { im, list, pose, ... }, Harnleiter-Verformung */
var STQ = { x: 0, y: 0, z: 0 };           /* Ergebnis von bahnPunkt */
var STM = new THREE.Matrix4();

/* Suche in einer aufsteigenden Tabelle A (n Werte): groesstes i <= n - 2 mit A[i] <= x */
function finde(A, x, n) {
  var lo = 0, hi = n - 1;
  while (hi - lo > 1) { var m = (lo + hi) >> 1; if (A[m] <= x) lo = m; else hi = m; }
  return lo;
}
/* Punkt der Bahn b dort, wo die Tabelle A (b.S: Strecke, b.T: Zeit) den Wert x hat -> STQ; liefert den Radius der Bahn dort */
function bahnPunkt(b, A, x, o) {
  var i = finde(A, x, b.n), d = A[i + 1] - A[i], f = d > 1e-9 ? Math.max(0, Math.min(1, (x - A[i]) / d)) : 0, j = i * 3, P = b.P;
  o.x = P[j] + (P[j + 3] - P[j]) * f; o.y = P[j + 1] + (P[j + 4] - P[j + 1]) * f; o.z = P[j + 2] + (P[j + 5] - P[j + 2]) * f;
  return b.R ? b.R[i] + (b.R[i + 1] - b.R[i]) * f : 0;
}
function bahnEnde(b, ende, o) { var j = ende ? (b.n - 1) * 3 : 0; o.x = b.P[j]; o.y = b.P[j + 1]; o.z = b.P[j + 2]; }
/* Bahn aus Proben { x, y, z, r }: Strecke, Radius und Laufzeit (Tempo nach dem Radius: gross = schnell) */
function tempoFuerRadius(r) { return 0.5 + 2.0 * Math.max(0, Math.min(1, (r - 0.03) / 0.3)); }   /* cm/s vor der Normierung */
function bahnAus(pr, mitTempo) {
  var n = pr.length, b = { n: n, P: new Float32Array(n * 3), R: mitTempo ? new Float32Array(n) : null, S: new Float32Array(n), T: mitTempo ? new Float32Array(n) : null }, i;
  for (i = 0; i < n; i++) {
    b.P[i * 3] = pr[i].x; b.P[i * 3 + 1] = pr[i].y; b.P[i * 3 + 2] = pr[i].z;
    if (mitTempo) b.R[i] = pr[i].r;
    if (i) {
      var d = Math.hypot(pr[i].x - pr[i - 1].x, pr[i].y - pr[i - 1].y, pr[i].z - pr[i - 1].z);
      b.S[i] = b.S[i - 1] + d;
      if (mitTempo) b.T[i] = b.T[i - 1] + d / ((tempoFuerRadius(pr[i].r) + tempoFuerRadius(pr[i - 1].r)) / 2);
    }
  }
  b.L = b.S[n - 1]; b.W = mitTempo ? b.T[n - 1] : 0;
  return b;
}
/* Bahn aus einer Kurve (gleichmaessig nach Bogenlaenge, ca. 0,04 cm Abstand) */
function bahnAusKurve(punkte) {
  var kurve = new THREE.CatmullRomCurve3(punkte.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'centripetal'), n = Math.max(8, Math.ceil(kurve.getLength() / 0.04));
  return bahnAus(kurve.getSpacedPoints(n), false);
}

/* ---- Blut: Gefaessketten ---- */
/* Proben auf der Mittellinie einer Gefaesslinie (wie in rohre: CatmullRom durch die Punkte) zwischen den Bogenlaenge-Anteilen u0 und u1, Radius dazu */
function linienKurve(l) { return new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5); }
function linienProben(l, u0, u1) {
  var kurve = linienKurve(l), n = Math.max(2, Math.ceil(kurve.getLength() * Math.abs(u1 - u0) / 0.05)), out = [];
  for (var i = 0; i <= n; i++) {
    var u = u0 + (u1 - u0) * i / n, p = kurve.getPointAt(u);
    out.push({ x: p.x, y: p.y, z: p.z, r: l.r * (l.rt ? radiusFaktor(l.rt, u) : 1) });
  }
  return out;
}
/* Anteil der Bogenlaenge bis zum Kontrollpunkt idx einer Linie (der Kontrollpunkt i liegt bei t = i / (n - 1)) */
function anteilBeiPunkt(l, idx) {
  var kurve = linienKurve(l), D = kurve.arcLengthDivisions, Ls = kurve.getLengths(D), k = idx / (l.pts.length - 1) * D, k0 = Math.min(D - 1, Math.floor(k));
  return (Ls[k0] + (Ls[k0 + 1] - Ls[k0]) * (k - k0)) / Ls[D];
}
function abstand3(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
/* Ketten Nierenarterie/-vene -> Segment- -> Zwischenlappen- -> Bogen- -> Rindengefaess: je Rindengefaess eine Kette in Fliessrichtung der
   Arterie (von aussen zur Rinde); die Venen laufen umgekehrt. Die Linien haengen ueber ihre End- und Anfangspunkte zusammen. */
function gefaessKetten(L, art) {
  var ls = L.filter(function (l) { return l.art === art; });
  var haupt = ls.filter(function (l) { return l.stufe === art && !l.rt; })[0];
  var segs = ls.filter(function (l) { return l.stufe === art && l.rt; });
  var inter = ls.filter(function (l) { return l.stufe === 'interlobaer'; }), bogen = ls.filter(function (l) { return l.stufe === 'bogen'; });
  var rinde = ls.filter(function (l) { return l.stufe === 'interlobular'; });
  function naechsteEnde(liste, p) {   /* Linie, deren letzter Punkt p am naechsten liegt */
    var best = null, dm = 1e9;
    liste.forEach(function (l) { var d = abstand3(l.pts[l.pts.length - 1], p); if (d < dm) { dm = d; best = l; } });
    return best;
  }
  return rinde.map(function (li) {
    var q = li.pts[0], lb = null, ib = 0, dm = 1e9;
    bogen.forEach(function (b) { b.pts.forEach(function (p, j) { var d = abstand3(p, q); if (d < dm) { dm = d; lb = b; ib = j; } }); });
    var l2 = naechsteEnde(inter, lb.pts[0]), l1 = naechsteEnde(segs, l2.pts[0]);
    var proben = linienProben(haupt, 0, 1);
    [[l1, 0, 1], [l2, 0, 1], [lb, 0, anteilBeiPunkt(lb, ib)], [li, 0, 1]].forEach(function (a) { proben = proben.concat(linienProben(a[0], a[1], a[2]).slice(1)); });
    return art === 'vene' ? proben.reverse() : proben;
  });
}

/* ---- Harn: Bahnen durch das Hohlsystem ---- */
function harnBahnen() {
  var B = form.BECKEN, A = form.anatomisch, kelche = [];
  form.PYR.forEach(function (P) {
    var a = P.apex, u = P.u, z1 = P.w > 45 ? form.OBEN : (P.w < -45 ? form.UNTEN : form.MITTE);
    var gk = z1 === form.OBEN ? [B[0] + 0.1, B[1] + 0.4, 0] : (z1 === form.UNTEN ? [B[0] + 0.1, B[1] - 0.4, 0] : [B[0] + 0.2, B[1], 0]);   /* Einmuendung des grossen Kelchs ins Becken */
    var c1 = [a[0] - u[0] * 0.4, a[1] - u[1] * 0.4, 0];   /* Start knapp vor der Papillenspitze (die Spitze selbst liegt im Gewebe) */
    kelche.push(bahnAusKurve([[a[0] - u[0] * 0.2, a[1] - u[1] * 0.2, 0], c1, [(c1[0] + z1[0]) / 2, (c1[1] + z1[1]) / 2, 0], z1, gk, B].map(A)));
  });
  /* Becken -> Harnleiter: Mittellinie URP (URP[0] = UR0) */
  var ur = [B].concat(form.URP).map(A), hp = bahnAusKurve(ur), sBeginn = 0, dm = 1e9, u0 = A(form.UR0), i;
  for (i = 0; i < hp.n; i++) { var d = Math.hypot(hp.P[i * 3] - u0[0], hp.P[i * 3 + 1] - u0[1], hp.P[i * 3 + 2] - u0[2]); if (d < dm) { dm = d; sBeginn = hp.S[i]; } }
  hp.S0 = sBeginn;   /* Strecke, ab der der Harnleiter beginnt */
  return { kelche: kelche, hp: hp };
}
var KELCH_V = 1.0;                 /* Tempo der Tropfen im Kelch (cm/s, im Mittel) */
var WELLE = { SA: 1.0, V: 1.5, N: 3 };   /* Start der Portion im Becken (cm auf der Bahn), Tempo der Welle (cm/s), Tropfen je Portion */
var WELLE_OFF = [[0.05, 0, 0.03], [-0.04, 0.02, 0], [0, -0.02, -0.05]];

/* Anteil sichtbarer Teilchen: Teilchen mit Rang u (0..1, fest verteilt) sind sichtbar, solange u unter dem Faktor f liegt (weich ausgeblendet);
   f >= 1 = alle, ohne Rechnung (unveraendert) */
function sichtAnteil(u, f) { return f >= 1 ? 1 : Math.max(0, Math.min(1, (f * 1.15 - u) / 0.15)); }
/* Harnstau: Grenze (cm auf der Bahn) vor dem Stein; s wird mit dem Stau darauf begrenzt (stein 0..1) */
function steinSperre(s, grenze) { return FAKT.stein > 0 ? s + (Math.min(s, grenze) - s) * FAKT.stein : s; }

/* ---- Pose eines Teilchens zur Zeit c: Position nach STQ, Rueckgabe = Groesse (Radius in cm; 0 = unsichtbar, die Position gilt dann
   als Parkplatz am naechsten Ende der Bahn) ---- */
function poseBlut(p, c, o) {
  var b = p.b, ph = c / STR.P - p.e; ph -= Math.floor(ph);
  var tau = ph * STR.P;
  if (tau >= b.W) { bahnEnde(b, tau - b.W <= STR.P - tau, o); return 0; }
  var r = bahnPunkt(b, b.T, tau, o), en = sstep(0, 0.6, tau) * (1 - sstep(b.W - 0.6, b.W, tau));
  var gr = Math.min(0.1, Math.max(0.03, 0.62 * r)) * en;
  return FAKT.blut < 1 ? gr * sichtAnteil(p.u, FAKT.blut) : gr;
}
function poseKelch(p, c, o) {
  var b = p.b, ph = c / STR.PW - p.e; ph -= Math.floor(ph);
  var tau = ph * STR.PW, w = b.L / KELCH_V;
  if (tau >= w) { bahnEnde(b, tau - w <= STR.PW - tau, o); return 0; }
  var u = tau / w;
  bahnPunkt(b, b.S, b.L * (0.5 * u + 0.5 * u * u), o);   /* ein Tropfen faellt: erst langsam, dann schneller */
  var gr = 0.085 * sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u));
  return FAKT.harn < 1 ? gr * sichtAnteil(p.u, FAKT.harn) : gr;
}
/* Zustand der Welle zur Zeit c: Lage der Verdickung (cm auf der Bahn) und Staerke 0..1 (0 ausserhalb des Laufs) */
function welleZustand(c) {
  var ph = c / STR.PW - Math.floor(c / STR.PW), tau = ph * STR.PW, tw = ST.tw;
  if (tau >= tw) return { s: WELLE.SA, a: 0, tau: tau, lauf: false };
  return { s: WELLE.SA + WELLE.V * tau, a: sstep(0, 0.4, tau) * (1 - sstep(tw - 0.4, tw, tau)), tau: tau, lauf: true };
}
function posePortion(p, c, o) {
  var hp = ST.hp, w = welleZustand(c), g;
  var s = Math.max(0, Math.min(hp.L, w.s + 0.15 + (p.k - (WELLE.N - 1) / 2) * 0.2));
  if (w.lauf) g = 1 - sstep(hp.L - 0.9, hp.L - 0.3, s);                       /* am Ende des Harnleiters (weiter zur Blase) ausblenden */
  else g = sstep(ST.tw + 0.2, STR.PW - 0.1, w.tau);                           /* im Becken sammelt sich die naechste Portion */
  if (FAKT.stein > 0) {                                                       /* Stein: die Portionen stauen sich davor und kommen nicht vorbei */
    s = steinSperre(s, ST.steinS - 0.65 - (WELLE.N - 1 - p.k) * 0.14);
    if (w.lauf) g *= 1 - FAKT.stein * sstep(ST.tw - 1.0, ST.tw - 0.3, w.tau);
  }
  if (FAKT.harn < 1) g *= sichtAnteil(p.u, FAKT.harn);
  bahnPunkt(hp, hp.S, s, o);
  var f = WELLE_OFF[p.k % WELLE_OFF.length];
  o.x += f[0]; o.y += f[1]; o.z += f[2];
  return 0.1 * g;
}
function poseHarn(p, c, o) { return p.k >= 0 ? posePortion(p, c, o) : poseKelch(p, c, o); }

/* ---- Harnleiter: Verformung je Bild ---- */
/* Jeder Eckpunkt des Harnleiter-Netzes bekommt die Strecke s seines naechsten Punktes auf der Bahn und den Abstandsvektor dazu
   (nur Eckpunkte nahe der Bahn und hinter dem Beginn des Harnleiters). Je Bild: Punkt = Ruhelage + Abstand * (Faktor - 1). */
function welleVorbereiten(hp) {
  var m = STRUCT.harnleiter.meshes[0];
  if (!m) return null;
  var pos = m.geometry.attributes.position, n = pos.count, ruhe = new Float32Array(pos.array), idx = [], sv = [], rv = [], i, k;
  for (i = 0; i < n; i++) {
    var x = ruhe[i * 3], y = ruhe[i * 3 + 1], z = ruhe[i * 3 + 2], best = 1e9, bs = 0, bx = 0, by = 0, bz = 0;
    for (k = 0; k < hp.n - 1; k++) {
      var ax = hp.P[k * 3], ay = hp.P[k * 3 + 1], az = hp.P[k * 3 + 2], dx = hp.P[k * 3 + 3] - ax, dy = hp.P[k * 3 + 4] - ay, dz = hp.P[k * 3 + 5] - az;
      var l2 = dx * dx + dy * dy + dz * dz || 1e-12, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / l2));
      var cx = ax + dx * t, cy = ay + dy * t, cz = az + dz * t, d = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
      if (d < best) { best = d; bs = hp.S[k] + (hp.S[k + 1] - hp.S[k]) * t; bx = x - cx; by = y - cy; bz = z - cz; }
    }
    if (best < 0.6 * 0.6 && bs > hp.S0 - 0.3) { idx.push(i); sv.push(bs); rv.push(bx, by, bz); }
  }
  m.frustumCulled = false;
  return { mesh: m, attr: pos, ruhe: ruhe, idx: Int32Array.from(idx), s: Float32Array.from(sv), rad: Float32Array.from(rv) };
}
function welleSetzen(c) {
  var W = ST.welle;
  if (!W) return;
  var hp = ST.hp, z = welleZustand(c), arr = W.attr.array, a = z.a, mitte = z.s + 0.15, hinten, i, j;
  if (FAKT.stein > 0) { mitte = steinSperre(mitte, ST.steinS - 0.55); a *= 1 + 0.4 * FAKT.stein; }   /* Stein: die Welle drueckt vor dem Stein, kraeftiger (Kolik) */
  hinten = mitte - 0.85;
  arr.set(W.ruhe);
  if (a > 0.001) {
    for (i = 0; i < W.idx.length; i++) {
      var s = W.s[i], e = sstep(hp.S0, hp.S0 + 0.5, s) * (1 - sstep(hp.L - 0.5, hp.L, s)), d1 = (s - mitte) / 0.4, d2 = (s - hinten) / 0.45;
      var f = a * e * (0.6 * Math.exp(-d1 * d1) - 0.55 * Math.exp(-d2 * d2));   /* Verdickung vorn, Einschnuerung dahinter */
      if (Math.abs(f) < 1e-4) continue;
      j = W.idx[i] * 3;
      arr[j] += W.rad[i * 3] * f; arr[j + 1] += W.rad[i * 3 + 1] * f; arr[j + 2] += W.rad[i * 3 + 2] * f;
    }
  }
  W.attr.needsUpdate = true;
}
/* Harnleiter in die Ruhelage (vor Export und USDZ; das naechste Bild verformt wieder) */
function welleZurueck() {
  if (!ST || !ST.welle) return;
  ST.welle.attr.array.set(ST.welle.ruhe); ST.welle.attr.needsUpdate = true;
  ST.neu = true;
}

/* ---- Aufbau: Bahnen, Teilchen, Instanzen (nach dem Gefaess- und Hohlsystem-Netz) ---- */
function stroemungBauen(L) {
  var kette = { arterie: gefaessKetten(L, 'arterie'), vene: gefaessKetten(L, 'vene') }, bahnen = { arterie: [], vene: [] }, wmax = 0, art;
  ['arterie', 'vene'].forEach(function (a) { kette[a].forEach(function (pr) { var b = bahnAus(pr, true); bahnen[a].push(b); wmax = Math.max(wmax, b.W); }); });
  /* Laufzeit normieren: die laengste Bahn braucht 9,5 s (kleiner als die Periode von 12 s) */
  var nf = 9.5 / wmax;
  ['arterie', 'vene'].forEach(function (a) { bahnen[a].forEach(function (b) { for (var i = 0; i < b.n; i++) b.T[i] *= nf; b.W *= nf; }); });
  var frac = function (x) { return x - Math.floor(x); }, PHI = 0.6180339887;
  var gruppen = [], N_BLUT = 5;
  [['arterie', 'blut', 'blutRot', 'Sanguis_arteriosus'], ['vene', 'blut', 'blutBlau', 'Sanguis_venosus']].forEach(function (g) {
    var list = [];
    /* u = Rang des Teilchens (0..1, gleichmaessig verteilt) fuer den sichtbaren Anteil bei den Krankheitsbildern und Medikamenten */
    bahnen[g[0]].forEach(function (b, k) { for (var j = 0; j < N_BLUT; j++) list.push({ b: b, e: frac((j + frac((k + (g[0] === 'vene' ? 0.5 : 0)) * PHI)) / N_BLUT), u: frac((list.length + 1) * PHI) }); });
    gruppen.push({ art: g[1], mat: g[2], name: g[3], list: list, pose: poseBlut });
  });
  var hb = harnBahnen(), list = [], N_TROPF = 3;
  hb.kelche.forEach(function (b, i) { for (var j = 0; j < N_TROPF; j++) list.push({ b: b, k: -1, e: frac(j / N_TROPF + i * 0.17), u: frac((list.length + 1) * PHI) }); });
  for (var k = 0; k < WELLE.N; k++) list.push({ k: k, u: (k + 0.5) / WELLE.N * 0.8 });
  gruppen.push({ art: 'harn', mat: 'harn', name: 'Urina', list: list, pose: poseHarn });
  ST = { gruppen: gruppen, hp: hb.hp, tw: (hb.hp.L - WELLE.SA + 0.3) / WELLE.V, welle: welleVorbereiten(hb.hp), letzt: null, neu: true, steinS: hb.hp.S0 + 0.9 };
  gruppen.forEach(function (g) {
    var geo = new THREE.SphereGeometry(1, 10, 7);
    var im = new THREE.InstancedMesh(geo, MAT[g.mat], g.list.length);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    im.name = g.name; im.userData.teilchen = g.art; im.userData.noexport = true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); g.im = im; g.geo = geo;
  });
  stroemungBild();
}
/* je Bild: Teilchen und Welle setzen (nur wenn sich die Zeit geaendert hat oder die Sichtbarkeit) */
function stroemungBild() {
  if (!ST || (clock === ST.letzt && !ST.neu)) return;
  ST.letzt = clock; ST.neu = false;
  ST.gruppen.forEach(function (g) {
    var c = g.art === 'blut' ? clockB : clock;
    for (var i = 0; i < g.list.length; i++) {
      var s = g.pose(g.list[i], c, STQ);
      STM.makeScale(s, s, s); STM.setPosition(STQ.x, STQ.y, STQ.z);
      g.im.setMatrixAt(i, STM);
    }
    g.im.instanceMatrix.needsUpdate = true;
  });
  welleSetzen(clock);
  reninBild();
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

/* =====================================================================
   5d. Krankheitsbilder und Medikamente: Wirkgroessen (FAKT), weich ueberblendet nach SZ.anteil (Zielwerte je Szenario in SZENARIEN.wirkung)
     blut     Anzahl und Tempo der Blutteilchen (1 = normal)         harn    Anzahl der Harntropfen und -portionen (1 = normal)
     stau     0..1 Hohlsystem erweitert (Hydronephrose)              stein   0..1 Nierenstein im oberen Harnleiter, Harn staut sich davor
     stenose  0..1 Taille in der Nierenarterie                       renin   0..1 leuchtende Markierungen an den Rindengefaessen
   Neutral (kein Szenario) bleibt das Modell unveraendert: Stein und Markierungen sind unsichtbar, Stau und Taille 0, Teilchen wie sonst.
   Alles ist eine reine Funktion der Anteile und der Uhr - kein Zufall.
   ===================================================================== */
var WIRKFELDER = Object.keys(WIRKNEUTRAL);
function szenarioWirkung() {
  WIRKFELDER.forEach(function (f) {
    var n = WIRKNEUTRAL[f], v = n;
    SZENARIEN.forEach(function (sc) { if (sc.wirkung && sc.wirkung[f] !== undefined && SZ.anteil[sc.id] > 0) v += SZ.anteil[sc.id] * (sc.wirkung[f] - n); });
    FAKT[f] = v;
  });
  FAKT.tempo = FAKT.blut >= 1 ? 1 : 0.35 + 0.65 * Math.max(0, FAKT.blut);   /* weniger Blut = langsamer */
  szenarioAnwenden();
}
/* aktives Szenario (Anteil > 0,5) fuer den Export, sonst null */
function szenarioExport() {
  var r = null;
  SZENARIEN.forEach(function (sc) { if (SZ.anteil[sc.id] > 0.5) r = sc; });
  return r;
}
/* Geometrie der Szenarien (nach dem Aufbau der Stroemung, braucht Harnleiterbahn und Welle):
   - Stau: jeder Eckpunkt des Hohlsystems rueckt entlang seiner Normale nach aussen (am Becken 0,45 cm, an den kleinen Kelchen etwa 0,25 cm,
     im Harnleiter nur bis zum Stein), Verschiebung = Normale * Weite * stau
   - Stenose: Eckpunkte der Nierenarterie nahe der Stelle kurz vor dem Hilus ruecken zur Mittellinie (Taille, 70 % schmaler)
   - Stein: kantig (flach schattiertes Netz aus einem Ikosaeder, Eckpunkte nach der Lage gestoert), liegt in der Bahn des Harnleiters
   - Renin: kleine leuchtende Kugeln mitten auf einem Teil der Rindenarterien */
function szenarioBauen(L) {
  var hp = ST.hp, W = ST.welle, steinS = ST.steinS, i, k;
  SZG = { hohl: [], sten: null, stein: null, renin: [], stau: 0, stenose: 0, sicht: '' };
  /* Stau */
  var Bc = form.anatomisch(form.BECKEN), sV = null;
  if (W) { sV = new Float32Array(W.attr.count).fill(-1); for (i = 0; i < W.idx.length; i++) sV[W.idx[i]] = W.s[i]; }
  HARN_SID.forEach(function (sid) {
    var m = STRUCT[sid].meshes[0]; if (!m) return;
    var pos = m.geometry.attributes.position, nor = m.geometry.attributes.normal, n = pos.count, ist = !!(W && m === W.mesh);
    var delta = new Float32Array(n * 3), ruhe = new Float32Array(ist ? W.ruhe : pos.array);
    for (i = 0; i < n; i++) {
      var d = 0.2 + 0.25 * (1 - sstep(1.0, 4.0, Math.hypot(ruhe[i * 3] - Bc[0], ruhe[i * 3 + 1] - Bc[1], ruhe[i * 3 + 2] - Bc[2])));
      if (ist && sV[i] >= 0) d *= 1 - sstep(steinS - 0.5, steinS + 0.2, sV[i]);   /* unterhalb des Steins ist der Harnleiter nicht erweitert */
      delta[i * 3] = nor.getX(i) * d; delta[i * 3 + 1] = nor.getY(i) * d; delta[i * 3 + 2] = nor.getZ(i) * d;
    }
    SZG.hohl.push({ m: m, pos: pos, ruhe: ruhe, delta: delta, welle: ist });
  });
  /* Stenose */
  var haupt = L.filter(function (l) { return l.stufe === 'arterie' && l.art === 'arterie' && !l.rt; })[0], mA = STRUCT.arterie.meshes[0];
  if (haupt && mA) {
    var kurve = linienKurve(haupt), len = kurve.getLength(), NS = 240, cs = [], pa = mA.geometry.attributes.position, seg = len / 12;
    var s0 = Math.round(1.0 / seg) * seg;   /* Mitte der Taille auf einen Ring des Rohrs (12 Abschnitte) gelegt: dort ist sie am tiefsten */
    for (i = 0; i <= NS; i++) cs.push(kurve.getPointAt(i / NS));
    var idx = [], dv = [];
    for (i = 0; i < pa.count; i++) {
      var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), bj = 0, bd = 1e9;
      for (k = 0; k <= NS; k++) { var dd = (cs[k].x - x) * (cs[k].x - x) + (cs[k].y - y) * (cs[k].y - y) + (cs[k].z - z) * (cs[k].z - z); if (dd < bd) { bd = dd; bj = k; } }
      var sl = bj / NS * len, gs = Math.exp(-Math.pow((sl - s0) / 0.55, 2));
      if (gs < 0.01 || Math.sqrt(bd) > haupt.r * 1.35) continue;
      idx.push(i); dv.push((x - cs[bj].x) * -0.7 * gs, (y - cs[bj].y) * -0.7 * gs, (z - cs[bj].z) * -0.7 * gs);
    }
    SZG.sten = { m: mA, pos: pa, ruhe: new Float32Array(pa.array), idx: Int32Array.from(idx), delta: Float32Array.from(dv) };
  }
  /* Stein */
  var sg = new THREE.IcosahedronGeometry(1, 1), sp = sg.attributes.position;
  for (i = 0; i < sp.count; i++) {
    var vx = sp.getX(i), vy = sp.getY(i), vz = sp.getZ(i), vl = Math.hypot(vx, vy, vz), f = 1 + 0.2 * (rausch(vx * 3, vy * 3, vz * 3) - 0.5) * 2;
    sp.setXYZ(i, vx / vl * f * 0.62, vy / vl * f * 0.46, vz / vl * f * 0.46);
  }
  sg.computeVertexNormals();
  var stein = new THREE.Mesh(sg, MAT.stein); stein.name = 'Nierenstein'; stein.renderOrder = 2; stein.userData.sz = 'stein'; stein.visible = false;
  var P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), P2 = new THREE.Vector3();
  bahnPunkt(hp, hp.S, steinS, STQ); P0.set(STQ.x, STQ.y, STQ.z);
  bahnPunkt(hp, hp.S, steinS - 0.1, STQ); P1.set(STQ.x, STQ.y, STQ.z);
  bahnPunkt(hp, hp.S, steinS + 0.1, STQ); P2.set(STQ.x, STQ.y, STQ.z);
  stein.position.copy(P0); stein.quaternion.setFromUnitVectors(V(1, 0, 0), P2.sub(P1).normalize());
  root.add(stein); SZG.stein = stein;
  /* Renin */
  var rg = new THREE.SphereGeometry(1, 12, 8), rl = L.filter(function (l) { return l.stufe === 'interlobular' && l.art === 'arterie'; });
  for (i = 0; i < rl.length; i += 3) {
    var rm = new THREE.Mesh(rg, MAT.renin), q = rl[i].pts[1];
    rm.name = 'Renin_' + (SZG.renin.length + 1); rm.userData.sz = 'renin'; rm.position.set(q[0], q[1], q[2]); rm.visible = false; rm.scale.setScalar(0.001);
    rm.raycast = function () {};
    root.add(rm); SZG.renin.push(rm);
  }
  szenarioAnwenden();
}
/* Wirkgroessen auf die Geometrie uebertragen (nur was sich geaendert hat) */
function szenarioAnwenden() {
  if (!SZG || !ST) return;
  if (FAKT.stau !== SZG.stau) {
    SZG.stau = FAKT.stau;
    SZG.hohl.forEach(function (h) {
      var dst = h.welle ? ST.welle.ruhe : h.pos.array, a = h.ruhe, d = h.delta, n = a.length, i;   /* der Harnleiter laeuft ueber seine Ruhelage (welleSetzen) */
      for (i = 0; i < n; i++) dst[i] = a[i] + d[i] * SZG.stau;
      h.pos.needsUpdate = true; h.m.geometry.boundingSphere = null;
    });
  }
  if (SZG.sten && FAKT.stenose !== SZG.stenose) {
    SZG.stenose = FAKT.stenose;
    var S2 = SZG.sten, arr = S2.pos.array, j, v;
    arr.set(S2.ruhe);
    if (SZG.stenose > 0) for (j = 0; j < S2.idx.length; j++) { v = S2.idx[j] * 3; arr[v] += S2.delta[j * 3] * SZG.stenose; arr[v + 1] += S2.delta[j * 3 + 1] * SZG.stenose; arr[v + 2] += S2.delta[j * 3 + 2] * SZG.stenose; }
    S2.pos.needsUpdate = true; S2.m.geometry.boundingSphere = null;
  }
  SZG.stein.scale.setScalar(Math.max(0.001, FAKT.stein));   /* der Stein waechst beim Einblenden */
  var sicht = (FAKT.stein > 0.001 ? 's' : '') + (FAKT.renin > 0.001 ? 'r' : '');
  if (sicht !== SZG.sicht) { SZG.sicht = sicht; applyVisibility(); }
  ST.neu = true;
}
/* Renin: die Markierungen pulsieren (aus der Uhr), je Markierung versetzt */
function reninBild() {
  if (!SZG || FAKT.renin <= 0.001) return;
  for (var i = 0; i < SZG.renin.length; i++) {
    var p = 0.5 + 0.5 * Math.sin(2 * PI * (clock / 1.1 + i * 0.17));
    SZG.renin[i].scale.setScalar(0.1 * FAKT.renin * (0.75 + 0.45 * p));
  }
}

/* =====================================================================
   5c. Lupe: Laengsschnitt durch die Spitze einer Nierenpapille (Knopf "Lupe", Tippen auf eine Papille waehlt eine andere).
   Eine Zeichnung im Panel #lupe (Canvas #lpCv), rein aus der Zeit berechnet (clock): kein Zufall, feste Muster.
   Sammelrohre laufen von oben (Mark) zusammen und muenden auf der Papillenspitze (Area cribrosa); der Harn tropft in den Becher
   des kleinen Kelchs, sammelt sich und fliesst seitlich ab. Daneben das salzige Mark (gegen die Spitze dichter) und das Vas rectum.
   Schalter "mit ADH" / "ohne ADH": mit ADH tritt Wasser aus den Rohren ins Mark und ins Vas rectum ueber, der Harn wird dunkel
   und tropft wenig; ohne ADH bleibt das Wasser im Rohr, der Harn ist hell und tropft reichlich.
   ===================================================================== */
var LP_W = '#3AA0FF', LP_S = '#B98BD9';
var LP_GANG = [[86, 137], [142, 159], [198, 181], [254, 203]];   /* Sammelrohre: x oben, x an der Muendung */
var LP_Y_OBEN = 6, LP_Y_KNICK = 64, LP_Y_SPITZE = 150;
var LP_PERIODE = 8;                                              /* Sekunden je Tropfen (Rohr, Fall, Becken) */
var LP_REIHE = [0, 3, 1, 4, 2, 5];                               /* Reihenfolge der Tropfen: mit ADH (wenige) liegen sie weit auseinander */
function lpMix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function lpRgb(c, al) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + al + ')'; }
function lpFrac(v) { return v - Math.floor(v); }
function lpTipY(x) { var t = (x - 112) / 116; return LP_Y_SPITZE + 24 * t * (1 - t); }   /* Papillenspitze (Kurve) */
function lpGangX(j, y) { var g = LP_GANG[j]; return y <= LP_Y_KNICK ? g[0] : g[0] + (g[1] - g[0]) * (y - LP_Y_KNICK) / (lpTipY(g[1]) - LP_Y_KNICK); }
function lpGangPos(j, s, o) {   /* Punkt auf Rohr j bei s = 0..1 (oben bis Muendung) */
  var g = LP_GANG[j], ye = lpTipY(g[1]), l1 = LP_Y_KNICK - LP_Y_OBEN, dx = g[1] - g[0], dy = ye - LP_Y_KNICK, l2 = Math.sqrt(dx * dx + dy * dy), d = s * (l1 + l2);
  if (d <= l1) { o.x = g[0]; o.y = LP_Y_OBEN + d; } else { var f = (d - l1) / l2; o.x = g[0] + dx * f; o.y = LP_Y_KNICK + dy * f; }
  return o;
}
function lpVasPos(s, seite, o) {   /* Vas rectum: rote Schenkel hinab, Bogen, blauer Schenkel hinauf; seite 0 links, 1 rechts */
  var l = 80, b = Math.PI * 8, d = s * (2 * l + b), x, y;
  if (d <= l) { x = 48; y = 8 + d; } else if (d <= l + b) { var a = (d - l) / 8; x = 56 - 8 * Math.cos(a); y = 88 + 8 * Math.sin(a); } else { x = 64; y = 88 - (d - l - b); }
  o.x = seite ? 340 - x : x; o.y = y; return o;
}
/* Salzteilchen im Mark: feste Lagen aus einer Hashfunktion, gegen die Spitze dichter; nicht im Rohr, nicht im Vas rectum */
function lpDots() {
  var out = [], i = 0, o = { x: 0, y: 0 };
  function h(n, k) { var q = Math.sin(n * 127.1 + k * 311.7) * 43758.5453; return q - Math.floor(q); }
  while (out.length < 190 && i < 4000) {
    var x = 38 + 264 * h(i, 1), y = 8 + 142 * Math.sqrt(h(i, 2)); i++;
    var u = Math.max(0, Math.min(1, (y - 92) / 58)), kl = 34 + 78 * u * u * (3 - 2 * u);
    if (x < kl + 6 || x > 340 - kl - 6) continue;                                   /* ausserhalb der Papille */
    if (y < 104 && ((x > 38 && x < 74) || (x > 266 && x < 302))) continue;          /* Vas rectum */
    var frei = true;
    for (var j = 0; j < LP_GANG.length && frei; j++) {
      for (var s = 0; s <= 1.0001; s += 0.04) { lpGangPos(j, s, o); if (Math.abs(o.x - x) < 8 && Math.abs(o.y - y) < 8) { frei = false; break; } }
    }
    if (frei) out.push({ x: x, y: y, a: h(i, 3) * 6.28, b: h(i, 4) * 6.28 });
  }
  return out;
}
function lpBeschriftung(c, text, x, y, rechts) {
  c.font = '9.5px system-ui, sans-serif'; c.textBaseline = 'alphabetic'; c.textAlign = rechts ? 'right' : 'left';
  var w = c.measureText(text).width, x0 = rechts ? x - w : x;
  c.fillStyle = 'rgba(12,26,32,0.82)'; c.fillRect(x0 - 3, y - 9, w + 6, 12);
  c.fillStyle = '#E7EFF0'; c.fillText(text, x, y);
}
function lpTropfen(c, x, y, r, col, al) {
  c.globalAlpha = Math.max(0, Math.min(1, al)); c.fillStyle = col;
  c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
  c.strokeStyle = 'rgba(40,24,0,0.55)'; c.lineWidth = 0.8; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, 6.2832); c.fill();
  c.globalAlpha = 1;
}
function lupeDraw(t) {
  var c = LUPE.ctx; if (!c) return;
  var adh = LUPE.adh, o = { x: 0, y: 0 }, W = LUPE.W, H = LUPE.H, j, k, i, s;
  c.setTransform(LUPE.dpr, 0, 0, LUPE.dpr, 0, 0);
  c.fillStyle = '#0C1A20'; c.fillRect(0, 0, W, H);
  var harn = lpMix([250, 240, 150], [214, 148, 18], adh), tief = lpMix([243, 238, 220], [174, 124, 28], adh);
  var spiegel = 190 + 8 * adh;   /* Fuellstand im Becher: ohne ADH mehr Harn */
  /* kleiner Nierenkelch (Becher mit Hals nach rechts) */
  var kelch = new Path2D();
  kelch.moveTo(20, 70); kelch.bezierCurveTo(20, 150, 48, 214, 112, 214); kelch.lineTo(340, 214); kelch.lineTo(340, 188); kelch.lineTo(298, 188);
  kelch.bezierCurveTo(316, 176, 320, 128, 320, 70); kelch.closePath();
  c.fillStyle = 'rgba(234,210,122,0.10)'; c.fill(kelch);
  /* Papille (Mark): Gewebe, dazu Violett gegen die Spitze */
  var pap = new Path2D();
  pap.moveTo(34, 6); pap.lineTo(34, 92); pap.bezierCurveTo(34, 126, 72, 146, 112, 150); pap.quadraticCurveTo(170, 162, 228, 150);
  pap.bezierCurveTo(268, 146, 306, 126, 306, 92); pap.lineTo(306, 6); pap.closePath();
  var gr = c.createLinearGradient(0, 6, 0, 160);
  gr.addColorStop(0, 'rgba(96,58,44,0.80)'); gr.addColorStop(1, 'rgba(112,60,86,0.92)');
  c.fillStyle = gr; c.fill(pap);
  c.save(); c.clip(pap);
  var vg = c.createLinearGradient(0, 6, 0, 160);
  vg.addColorStop(0, 'rgba(160,110,220,0.03)'); vg.addColorStop(1, 'rgba(160,110,220,0.34)');
  c.fillStyle = vg; c.fillRect(0, 0, W, 170);
  /* salziges Mark: gelöste Teilchen, schwingen leicht */
  if (!LUPE.dots) LUPE.dots = lpDots();
  c.fillStyle = LP_S; c.strokeStyle = 'rgba(40,10,60,0.8)'; c.lineWidth = 0.8;
  LUPE.dots.forEach(function (d) {
    c.beginPath(); c.arc(d.x + 1.2 * Math.sin(t * 0.8 + d.a), d.y + 1.2 * Math.cos(t * 0.7 + d.b), 2.5, 0, 6.2832); c.fill(); c.stroke();
  });
  /* Wasser verlaesst die Rohre (nur mit ADH): quer durch das Mark ins Vas rectum, darin hinauf */
  if (adh > 0.02) {
    for (j = 0; j < LP_GANG.length; j++) {
      var xl = j < 2 ? 64 : 276;
      for (k = 0; k < 3; k++) {
        var u = lpFrac(t / 6 + k / 3 + j * 0.13), y0 = 34 + 17 * k + 5 * j, px, py, al;
        if (u < 0.55) { var q = u / 0.55, xd = lpGangX(j, y0); px = xd + (xl - xd) * q; py = y0 - 6 * q; al = Math.min(1, u * 12); }
        else { var q2 = (u - 0.55) / 0.45; px = xl; py = y0 - 6 - (y0 - 6 - 10) * q2; al = Math.min(1, (1 - u) * 8); }
        lpTropfen(c, px, py, 2.6, LP_W, al * adh);
      }
    }
  }
  c.restore();
  /* Vas rectum: Haarnadel links und rechts, Blut rot hinab, blau hinauf */
  [0, 1].forEach(function (sd) {
    var st = new Path2D(), x1 = sd ? 292 : 48, x2 = sd ? 276 : 64, xm = (x1 + x2) / 2, dir = sd ? -1 : 1;
    st.moveTo(x1, 8); st.lineTo(x1, 88); st.arc(xm, 88, 8, sd ? 0 : Math.PI, sd ? Math.PI : 0, !sd); st.lineTo(x2, 8);
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(214,170,150,0.75)'; c.lineWidth = 8; c.stroke(st);
    c.strokeStyle = 'rgba(40,18,24,0.95)'; c.lineWidth = 5; c.stroke(st);
    for (i = 0; i < 7; i++) {
      s = lpFrac(t / 9 + i / 7 + sd * 0.31); lpVasPos(s, sd, o);
      var m = Math.max(0, Math.min(1, (s - 0.4) / 0.2)), col = lpMix([200, 55, 45], [63, 99, 181], m), gerade = s < 0.4 || s > 0.6;
      c.fillStyle = lpRgb(col, 1); c.beginPath(); c.ellipse(o.x, o.y, gerade ? 2.2 : 3, gerade ? 3.3 : 2.4, 0, 0, 6.2832); c.fill();
    }
  });
  /* Sammelrohre */
  var rohr = LP_GANG.map(function (g, jj) { var pts = []; for (var q = 0; q <= 1.0001; q += 0.05) pts.push(lpGangPos(jj, q, { x: 0, y: 0 })); return pts; });
  rohr.forEach(function (pts) {
    var pf = new Path2D(); pts.forEach(function (p, n) { n ? pf.lineTo(p.x, p.y) : pf.moveTo(p.x, p.y); });
    c.lineCap = 'butt'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(232,206,176,0.9)'; c.lineWidth = 8; c.stroke(pf);
    c.strokeStyle = lpRgb(lpMix([235, 228, 150], [196, 136, 20], adh), 1); c.lineWidth = 4.8; c.stroke(pf);
  });
  /* Wasser im Rohr: ohne ADH reichlich, mit ADH wenig (das meiste ist ins Mark uebergetreten) */
  var nW = 8 - 5 * adh;
  for (j = 0; j < LP_GANG.length; j++) for (i = 0; i < 8; i++) {
    lpGangPos(j, lpFrac(t / 5 + i / 8 + j * 0.21), o);
    lpTropfen(c, o.x + 1.3 * Math.sin(i * 2.1 + j), o.y, 1.6, LP_W, nW - i);
  }
  /* Papillenspitze mit den Muendungen */
  c.strokeStyle = 'rgba(176,88,74,0.95)'; c.lineWidth = 2; c.stroke(pap);
  var tip = new Path2D(); tip.moveTo(112, 150); tip.quadraticCurveTo(170, 162, 228, 150);
  c.strokeStyle = 'rgba(244,214,190,0.95)'; c.lineWidth = 2.6; c.stroke(tip);
  LP_GANG.forEach(function (g) { c.fillStyle = 'rgba(10,20,25,0.95)'; c.beginPath(); c.ellipse(g[1], lpTipY(g[1]), 3.4, 1.7, 0, 0, 6.2832); c.fill(); });
  /* Harn im Becher */
  c.save(); c.clip(kelch);
  var fl = new Path2D(); fl.moveTo(0, spiegel);
  for (i = 0; i <= 340; i += 6) fl.lineTo(i, spiegel + 1.2 * Math.sin(i * 0.09 + t * 2.2));
  fl.lineTo(340, 240); fl.lineTo(0, 240); fl.closePath();
  c.fillStyle = lpRgb(harn, 0.62); c.fill(fl);
  c.restore();
  c.lineCap = 'round'; c.lineJoin = 'round';
  var wand = new Path2D();
  wand.moveTo(20, 70); wand.bezierCurveTo(20, 150, 48, 214, 112, 214); wand.lineTo(340, 214);
  wand.moveTo(340, 188); wand.lineTo(298, 188); wand.bezierCurveTo(316, 176, 320, 128, 320, 70);
  c.strokeStyle = 'rgba(234,210,122,0.95)'; c.lineWidth = 2.6; c.stroke(wand);
  /* Tropfen: im Rohr, im freien Fall, im Becher; mit ADH wenige und dunkle, ohne ADH viele und helle */
  var nT = 6 - 4 * adh, r = 3.6 - 0.9 * adh, dcol = lpRgb(harn, 1);
  for (j = 0; j < LP_GANG.length; j++) {
    var ox = LP_GANG[j][1], oy = lpTipY(ox);
    for (k = 0; k < 6; k++) {
      var v = lpFrac(t / LP_PERIODE + LP_REIHE[k] / 6 + j * 0.05), al = nT - k, px2, py2;
      if (v < 0.56) { lpGangPos(j, v / 0.56, o); px2 = o.x; py2 = o.y; }
      else if (v < 0.66) { var f = (v - 0.56) / 0.1; px2 = ox; py2 = oy + 2 + (spiegel + 3 - oy - 2) * f * f; }
      else { var f2 = (v - 0.66) / 0.34; px2 = ox + (346 - ox) * f2; py2 = spiegel + 8 + 1.2 * Math.sin(px2 * 0.09 + t * 2.2); }
      lpTropfen(c, px2, py2, r, dcol, al);
    }
  }
  /* Beschriftung */
  c.strokeStyle = 'rgba(231,239,240,0.55)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(lpGangX(3, 118) + 4, 116); c.lineTo(228, 116); c.moveTo(224, 156); c.lineTo(236, 166); c.stroke();
  lpBeschriftung(c, 'Sammelrohre', 230, 119, false);
  lpBeschriftung(c, 'salziges Mark', 50, 134, false);
  lpBeschriftung(c, 'Vas rectum', 38, 108, false);
  lpBeschriftung(c, 'Papillenspitze', 236, 170, false);
  lpBeschriftung(c, '(Area cribrosa)', 236, 181, false);
  lpBeschriftung(c, 'kleiner', 48, 172, false);
  lpBeschriftung(c, 'Nierenkelch', 48, 183, false);
  c.font = '9px ui-monospace, monospace'; c.textAlign = 'right'; c.fillStyle = '#8DA7B1'; c.fillText('weiter zum großen Kelch →', 336, 230);
}

/* ---- Panel, Ring in der Niere, Verbindungslinie ---- */
var LP_TEXT = 'Auf jeder Papille m\u00fcnden 10 bis 25 Sammelrohre. Was hier austritt, ist der fertige Harn: Er wird ab jetzt nicht mehr ver\u00e4ndert, nur noch abgeleitet. Wie konzentriert er ist, entscheidet sich kurz davor im Sammelrohr: Mit ADH (antidiuretisches Hormon) wird die Wand f\u00fcr Wasser durchl\u00e4ssig, das salzige Mark zieht Wasser heraus \u2013 wenig, konzentrierter Harn. Ohne ADH bleibt das Wasser im Rohr \u2013 viel, verd\u00fcnnter Harn.';
var LP_WERTE = ['<b>Ohne ADH:</b> Harn bis 50 mosmol/l, bis 20 l/Tag (z.\u00a0B. Diabetes insipidus)', '<b>Mit ADH:</b> Harn bis 1200 mosmol/l, ca. 0,5\u20131,5 l/Tag'];
function lupeText() {
  var h = '<p>' + LP_TEXT + '</p><p class="lp-note">' + LP_WERTE[LUPE.adhZiel ? 1 : 0] + '</p><p class="lp-hint">Tippe im Modell auf eine andere Papille, um sie anzusehen.</p>';
  $('lpText').innerHTML = h;
}
function lupeAdh(an) {
  LUPE.adhZiel = an ? 1 : 0;
  Array.prototype.forEach.call($('lpChips').children, function (b) { b.classList.toggle('on', b.getAttribute('data-adh') === String(LUPE.adhZiel)); });
  lupeText();
}
function papillenPunkt(i, o) { var P = PY[i]; return o.set(P.apexA[0] + P.uA[0] * 0.15, P.apexA[1] + P.uA[1] * 0.15, P.apexA[2] + P.uA[2] * 0.15); }
/* Kamera: die Papille mit etwas Umgebung in die Mitte des freien Bereichs ueber dem Panel (Desktop: rechts des Panels, Handy: Panel unten) */
function lupeKamera(i) {
  var w = window.innerWidth, h = window.innerHeight, r = bereich(w, h), pr = $('lupe').getBoundingClientRect(), nar = w < 1000;
  var fr = nar ? { x0: 0, x1: w, y0: 90, y1: pr.top - 6, fit: 12 } : { x0: r.x0, x1: r.x1, y0: 140, y1: pr.top - 10, fit: 30 };
  fr.y1 = Math.max(fr.y1, fr.y0 + 80);
  var dist = Math.max(7, Math.min(view.dist, abstandFuer([5.2, 5.2], fr, camera.fov, h)));
  var k = 2 * dist * Math.tan(camera.fov * PI / 360) / h;   /* cm je Pixel im Abstand dist */
  var dx = (fr.x0 + fr.x1) / 2 - (r.x0 + r.x1) / 2, dy = (fr.y0 + fr.y1) / 2 - (r.y0 + r.y1) / 2;
  var rechts = V(1, 0, 0).applyQuaternion(camera.quaternion), oben = V(0, 1, 0).applyQuaternion(camera.quaternion);
  var ziel = papillenPunkt(i, V(0, 0, 0)).addScaledVector(rechts, -dx * k).addScaledVector(oben, dy * k);
  orbit.anim = Kern.fahrt(view, { theta: view.theta, phi: view.phi, dist: dist, target: ziel }, 700);
}
function lupeOeffnen(i) {
  if (quiz) quizEnd();
  closeCard();
  if (!LUPE.open) {   /* Ansicht merken, beim Schliessen geht es dorthin zurueck */
    var a = orbit.anim && orbit.anim.t;
    LUPE.vorher = { theta: a ? a.theta : view.theta, phi: a ? a.phi : view.phi, dist: a ? a.dist : view.dist, target: (a ? a.target : view.target).clone(), fit: fitDist };
  }
  LUPE.papille = i; papillenPunkt(i, LUPE.ring.position);
  LUPE.ring.visible = true;
  if (!LUPE.open) { LUPE.adh = LUPE.adhZiel; lupeAdh(LUPE.adhZiel); }
  LUPE.open = true; $('lupe').classList.add('show');
  if (selected) setSelected(null);
  $('info').classList.remove('show');
  szWeichen();
  lupeKamera(i);
  lv++;
}
/* wie: 'fahrt' (Standard) zurueck zur vorherigen Ansicht, 'sofort' ohne Fahrt (AR), 'nichts' Kamera bleibt (die Fahrt zum Nephron uebernimmt) */
function lupeClose(wie) {
  var v = LUPE.vorher; LUPE.vorher = null;
  LUPE.open = false; LUPE.mode = false;
  $('lupe').classList.remove('show'); LUPE.ring.visible = false; LUPE.line.style.display = 'none';
  kartenLage();
  canvas.style.cursor = '';
  $('bLupe').classList.remove('on');
  if (v && wie !== 'nichts' && !fz) {
    fitDist = v.fit;
    if (wie === 'sofort') { view.theta = v.theta; view.phi = v.phi; view.dist = v.dist; view.target.copy(v.target); orbit.anim = null; }
    else orbit.anim = Kern.fahrt(view, { theta: v.theta, phi: v.phi, dist: v.dist, target: v.target }, 700);
  }
  lv++;
}
function lupeWahl(p) {   /* naechste Papille zum angetippten Punkt */
  var best = 0, bd = 1e9, q = new THREE.Vector3();
  for (var i = 0; i < PY.length; i++) { var d = papillenPunkt(i, q).distanceToSquared(p); if (d < bd) { bd = d; best = i; } }
  lupeOeffnen(best);
}
(function lupeBauen() {
  LUPE.dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cv = $('lpCv'); cv.width = LUPE.W * LUPE.dpr; cv.height = LUPE.H * LUPE.dpr;
  try { LUPE.ctx = cv.getContext('2d'); } catch (e) { LUPE.ctx = null; }
  Array.prototype.forEach.call($('lpChips').children, function (b) { b.addEventListener('click', function () { lupeAdh(b.getAttribute('data-adh') === '1'); }); });
  $('bLupeX').addEventListener('click', lupeClose);
  /* Ring in der Niere: zeigt, welche Papille die Lupe zeigt */
  LUPE.ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 48),
    new THREE.MeshBasicMaterial({ color: 0xE0A94A, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide }));
  LUPE.ring.renderOrder = 999; LUPE.ring.visible = false; LUPE.ring.raycast = function () {};
  scene.add(LUPE.ring);
  LUPE.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  LUPE.line.setAttribute('class', 'lp-line'); LUPE.line.style.display = 'none';
  leaderSvg.appendChild(LUPE.line);
  $('bLupe').addEventListener('click', function () {
    if (fz || inAR) return;
    if (LUPE.mode || LUPE.open) { lupeClose(); return; }
    LUPE.mode = true; this.classList.add('on'); canvas.style.cursor = 'zoom-in';
    if (!openZiel) offen(true);   /* die Papillen liegen auf der Schnittflaeche */
    lupeOeffnen(1);
  });
})();
var _lpV = new THREE.Vector3();
function lupeTick(dt) {
  if (!LUPE.open) return;
  var dz = LUPE.adhZiel - LUPE.adh;
  if (dz) { LUPE.adh += dz * (1 - Math.exp(-dt * 4)); if (Math.abs(LUPE.adhZiel - LUPE.adh) < 0.003) LUPE.adh = LUPE.adhZiel; }
  lupeDraw(clock);
  LUPE.ring.quaternion.copy(camera.quaternion);
  LUPE.ring.scale.setScalar(Math.max(0.35, view.dist / 30));
  /* Linie vom Ring zum Panel */
  _lpV.copy(LUPE.ring.position).project(camera);
  var w = window.innerWidth, h = window.innerHeight, r = $('lupe').getBoundingClientRect();
  if (_lpV.z < 1 && r.width > 0) {
    var sx = (_lpV.x * 0.5 + 0.5) * w, sy = (-_lpV.y * 0.5 + 0.5) * h;
    var bx = Math.max(r.left + 12, Math.min(r.right - 12, sx)), by = sy < r.top ? r.top : (sy > r.bottom ? r.bottom : r.top);
    LUPE.line.setAttribute('x1', sx); LUPE.line.setAttribute('y1', sy);
    LUPE.line.setAttribute('x2', bx); LUPE.line.setAttribute('y2', by);
    LUPE.line.style.display = '';
  } else LUPE.line.style.display = 'none';
}

/* =====================================================================
   6. Export (Kern.Export): GLB statisch und STL, jeweils der sichtbare Zustand (aufgeschnitten: ohne Deckel); GLB animiert mit der Stroemung
   ===================================================================== */
var LAENGE_TXT = 'Niere ca. 11 cm lang';
var exCfg = {
  titel: 'Niere', praefix: 'niere', wurzelName: 'Niere',
  /* Schild unter dem Modell: Bounding-Box der exportierten Teile (geschlossen, mit Gefaessstummeln) x -4,75 bis 4,66,
     y -7,00 bis 6,00, z -2,36 bis 4,46 -> x Mitte 0; y 1,5 cm unter der Unterkante (-8,5); z vorn (max z) */
  schild: [0, -8.5, 4.5],
  bereit: function () { return App.ready; },
  gruppen: function () { welleZurueck(); return [root]; },   /* der Harnleiter wird in Ruhelage exportiert (ohne die Welle) */
  get zusatzStatisch() { var sc = szenarioExport(); return sc ? sc.datei : ''; },   /* aktives Krankheitsbild bzw. Medikament im Dateinamen */
  toast: function (msg) { Kern.toast(msg); },
  transparenz: true,
  /* Stroemung backen: je Teilchen ein Knoten (Groesse 0 = unsichtbar), Position und Groesse als Spuren ueber eine Periode (STR.P) */
  animation: function (rootE) {
    var times = new Float32Array(STR.NKEY + 1), tracks = [], nPart = 0, i;
    for (i = 0; i <= STR.NKEY; i++) times[i] = i * STR.P / STR.NKEY;
    ST.gruppen.forEach(function (g) {
      if (!g.im.visible) return;
      g.list.forEach(function (p, n) {
        if (p.u !== undefined && sichtAnteil(p.u, g.art === 'blut' ? FAKT.blut : FAKT.harn) <= 0) return;   /* Szenario: ausgeblendete Teilchen gar nicht erst aufnehmen */
        var node = new THREE.Mesh(g.geo, g.im.material); node.name = g.name + '_' + (n + 1);
        var P = new Float32Array((STR.NKEY + 1) * 3), Sc = new Float32Array((STR.NKEY + 1) * 3);
        for (i = 0; i <= STR.NKEY; i++) {
          var e = g.pose(p, times[i], STQ);
          P[i * 3] = STQ.x; P[i * 3 + 1] = STQ.y; P[i * 3 + 2] = STQ.z;
          Sc[i * 3] = e; Sc[i * 3 + 1] = e; Sc[i * 3 + 2] = e;
        }
        node.position.set(P[0], P[1], P[2]); node.scale.set(Sc[0], Sc[1], Sc[2]);
        rootE.add(node);
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.position', times, P));
        tracks.push(new THREE.VectorKeyframeTrack(node.name + '.scale', times, Sc));
        nPart++;
      });
    });
    var sz = szenarioExport();
    return { clips: [new THREE.AnimationClip('Niere_Stroemung', STR.P, tracks)], zusatz: sz ? sz.datei : 'normal', nPart: nPart };
  },
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    animStart: 'Strömung wird aufgezeichnet …',
    stlLiesmich: ['Datei (Maßstab Millimeter, Z-Achse nach oben, reale Größe: ' + LAENGE_TXT + '):', '- niere_ansicht.stl: alles, was beim Export sichtbar war (aufgeschnitten ohne die abgehobene vordere Hälfte)', 'STL kennt keine Farbe – dafür gibt es die GLB-Datei.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Datei, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Reale Größe (' + LAENGE_TXT + ') – STL kennt keine Farbe.';
    },
    glbLiesmich: function (i) {
      return [i.anim ? i.name + ': die Strömung von Blut und Harn (' + i.a.nPart + ' Teilchen, ' + STR.P + ' s) als Animation, läuft in Schleife. Die Teilchen sind symbolisch, nicht maßstäblich; die Welle im Harnleiter gibt es nur im Programm.' : i.name + ': farbiges 3D-Modell der Niere in der Ansicht beim Export (aufgeschnitten oder geschlossen), ohne Bewegung.', 'Maßstab: Meter (reale Größe: ' + LAENGE_TXT + '). Die Signatur steht in den Metadaten und auf dem Schild unter der Niere.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span><br>Reale Größe (' + LAENGE_TXT + '), mit Farben, ' + (i.anim ? 'mit Strömung: ' + i.a.nPart + ' Teilchen mit ' + (STR.NKEY + 1) + ' Keyframes, ' + STR.P + ' s Schleife. Im Viewer die Wiedergabe starten.' : 'ohne Bewegung.');
    }
  }
};
$('bGlbA').onclick = function () { Kern.Export.run('glb-anim', exCfg); };
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
  knoepfe: ['arEnd', 'arOffen', 'arLab', 'arSmall', 'arBig', 'arPlace', 'arPause'],
  quickLook: function () { arQuickLook(); },
  beimStart: function () {
    inAR = true;
    if (LUPE.open) lupeClose('sofort');
    camera.near = 0.01; camera.far = 100;   /* Meter statt cm */
    labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
    arTexte();
    $('arPause').textContent = playing ? 'Pause' : 'Weiter';
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
$('arPause').onclick = function () { $('bPlay').click(); this.textContent = playing ? 'Pause' : 'Weiter'; };
$('bAR').onclick = function () { if (fz) return; AR.start(); };
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
  welleZurueck();   /* Harnleiter in Ruhelage, die USDZ hat keine Teilchen und keine Welle */
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
   7b. Kamerafahrt zum markierten Nephron (Knopf "Nephron ansehen"): alles ausser dem Nephron und dem Gewebe blendet aus, die Kamera
   landet in der Startansicht des Nephron-Modells (umgerechnet in Nieren-Koordinaten), dann wird die Adresse gesetzt. Beim Zurueckkommen
   (umg.von === 'nephron') steht die Niere im Nahbild des Nephrons und faehrt nach 450 ms zur Uebersicht zurueck.
   ===================================================================== */
var fz = null;   /* laufende Fahrt */
/* Startansicht des Nephron-Modells in Nieren-Koordinaten: gleiche Blickrichtung (um die Drehung der Schnittebene gedreht), Abstand und Ziel
   mit dem Massstab und der Lage des Nephrons umgerechnet, Versatz des Bildbereichs wie im Modell */
function nephronZiel(w, h) {
  var ne = Kern.Organe && Kern.Organe.nephron, st = ne && ne.start ? ne.start(w, h) : NE_START;
  return { theta: st.theta + DREH, phi: st.phi, dist: NE.s * st.dist, target: nephPunkt(st.target), versatz: st.versatz };
}
function imDeckel(o) { while (o) { if (o === deckel) return true; o = o.parent; } return false; }
/* Alles ausser dem Nephron und dem Gewebe zum Ausblenden vorbereiten (Hin- und Rueckfahrt); merkt die Ursprungswerte. Der Deckel
   gehoert nicht dazu (er ist bei der Fahrt abgehoben). */
function ausblendVorbereiten() {
  var zielObj = new Set(), keep = new Set(), ausMat = new Map(), altT = new Map(), ausObj = [], sofort = [];
  ['nephron'].concat(GEWEBE).forEach(function (sid) {
    STRUCT[sid].meshes.forEach(function (m) {
      if (imDeckel(m)) return;
      zielObj.add(m);
      if (m.material) [].concat(m.material).forEach(function (x) { keep.add(x); });
    });
  });
  root.traverse(function (o) {
    if (zielObj.has(o) || !o.material || !o.visible || imDeckel(o)) return;
    var ms = [].concat(o.material), frei = true;
    ms.forEach(function (x) { if (keep.has(x)) frei = false; });
    if (!frei) { o.visible = false; sofort.push(o); return; }   /* teilt ein Material mit dem Zielgewebe: sofort weg */
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
function nephronOeffnen() {
  if (fz || abgebaut || inAR) return;
  if (LUPE.open) lupeClose('nichts');
  if (quiz) quizEnd();
  if (SZ.aktiv) { SZ.direkt(null); szenarioWirkung(); }   /* Krankheitsbild/Medikament aus: die Karte schliesst sich, Stein und Markierungen verschwinden sofort */
  var w = window.innerWidth, h = window.innerHeight, ziel = nephronZiel(w, h), r = bereich(w, h);
  var dth = ziel.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI; ziel.theta = view.theta + dth;
  if (!openZiel) offen(true);   /* der Deckel verdeckt das Nephron: abheben */
  ORDER.forEach(function (d) { d.meshes.forEach(function (m) { var mt = m.material; if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)); }); });   /* Hervorhebung weg */
  var f = ausblendVorbereiten();
  orbit.anim = Kern.fahrt(view, { theta: ziel.theta, phi: ziel.phi, dist: ziel.dist, target: ziel.target }, 1200);
  f.hin = true; f.adresse = Kern.organAdresse('nephron'); f.a = orbit.anim;
  f.von = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2]; f.nach = ziel.versatz;
  fz = f;
}
$('iOpen').onclick = nephronOeffnen;
$('bNephron').onclick = nephronOeffnen;
/* Rueckkehr aus dem Nephron-Modell: die Niere steht im Nahbild des Nephrons, alles andere ist ausgeblendet; die Fahrt zur Uebersicht beginnt nach 450 ms */
function rueckkehr() {
  var w = window.innerWidth, h = window.innerHeight, ziel = nephronZiel(w, h), r = bereich(w, h);
  var f = ausblendVorbereiten();
  f.mats.forEach(function (op, m) { m.opacity = 0; });
  f.ui.forEach(function (e) { e.style.opacity = '0'; });
  f.obj.forEach(function (o) { o.visible = false; });
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
  fz.mats.forEach(function (op, m) { m.opacity = op; if (m.transparent !== fz.altT.get(m)) { m.transparent = fz.altT.get(m); m.needsUpdate = true; } });
  fz.obj.forEach(function (o) { o.visible = true; });
  fz.sofort.forEach(function (o) { o.visible = true; });
  fz.ui.forEach(function (e, i) { e.style.opacity = fz.altUi[i].op; e.style.pointerEvents = fz.altUi[i].pe; });
  canvas.style.pointerEvents = '';
  labelBox.style.display = showLabels ? '' : 'none'; leaderSvg.style.display = showLabels ? '' : 'none';
  view.theta = DREH; view.phi = PI / 2; view.dist = d; view.target.set(0, 0, 0);
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
  if (!fz.a && now >= fz.warte) {   /* Rueckfahrt beginnt: zur Uebersicht, kuerzester Weg beim Drehen */
    var w0 = window.innerWidth, h0 = window.innerHeight, a0 = AUSSCHNITTE[0];
    var dth = a0.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
    orbit.anim = fz.a = Kern.fahrt(view, { theta: view.theta + dth, phi: PI / 2, dist: distFuer(a0, w0, h0), target: V(0, 0, 0) }, 1200);   /* Ziel wie die frisch aufgebaute Ansicht (view.target = Nierenmitte) */
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
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var App = window.NiereApp = { ready: false, aufbauMs: 0, szenario: function (id) { SZ.direkt(id || null); szenarioWirkung(); }, waehle: setSelected, nephron: nephronOeffnen, gehe: gehe, offen: offen, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris };
function loop(now, frame) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (openK !== openZiel) {   /* Deckel gleitet weich (ca. 600 ms) */
    openK = Math.max(0, Math.min(1, openK + Math.sign(openZiel - openK) * dt / 0.6));
    applyLook();
  }
  if (playing) { clock += dt * speed; clockB += dt * speed * FAKT.tempo; }
  if (SZ.schritt(dt)) szenarioWirkung();                  /* Anteile weich ueberblenden, auch in der Pause */
  stroemungBild();
  lupeTick(dt);
  if (inAR) { AR.frame(frame); ARL.update(); renderer.render(scene, camera); return; }   /* in AR bestimmt die Sitzung die Kamera */
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
  AR.abbauen(); ARL.abbauen(); SZ.abbauen();
  fz = null; canvas.style.pointerEvents = '';
  clearTimeout(Kern.toast._t); clearTimeout(quizT);
  if (LUPE.line && LUPE.line.parentNode) LUPE.line.parentNode.removeChild(LUPE.line);
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });   /* auch die Instanzen und Materialien der Teilchen */
  ST = null; SZG = null;
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
  if (umg.von === 'nephron') rueckkehr();   /* Rueckweg aus dem Nephron-Modell */
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('niere', organ);
})();
