/* =====================================================================
   Darm - Duenndarm, Dickdarm und Mastdarm
   Der Darm von vorn wie im Koerper (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn): Zwoelffingerdarm, Duenndarm (Leerdarm und Krummdarm), Dickdarm
   (Blinddarm mit Wurmfortsatz, aufsteigender, querer und absteigender Teil, Sigma, Mastdarm) und After mit Schliessmuskeln, dazu Gekroese, Darmarterien, Darmvenen
   und Pfortader. Die Form liefert organe/verdauung/verdauung-form.js (Kern.Formen.verdauung; Pfortader und Papille aus der Form der Leber, Zwerchfellkuppel aus der
   Form der Lunge); hier wird sie vernetzt, eingefaerbt und bedient.
   Netze: Die Aussenhaut des ganzen Darms ist ein Schlauch um die Mittellinie (Ringe entlang der Achse, glatte Normalen, ohne Abstandsfeld; Haustren und Taenien kommen aus
   der Formel des Dickdarms). In vier Bereichen kann die vordere Wand abgehoben werden (Zwoelffingerdarm mit der Papille, eine Duenndarmschlinge, Blinddarm mit der
   Bauhin-Klappe, Mastdarm mit dem After): dort ist die Haut an der Schnittflaeche der Form in hintere Haelfte und Deckel geteilt (Dreiecke werden exakt beschnitten),
   die Schichten der Wand (Laengsmuskel, Ringmuskel, Schleimhaut mit Falten, Klappe, Papille, Schliessmuskeln) kommen aus den Abstandsfeldern der Form und werden nur dort
   fein vernetzt; von den Muskelschichten bleibt die Schnittflaeche (Kappe), die Haut der Muskelschichten ersetzt die Aussenhaut. Der Deckel gleitet nach vorn und blendet aus,
   wie beim Magen.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste, Lesehilfe. Abschnitt 6: Stoffe und Stroemung (Teilchen auf dem Weg durch den
   ganzen Darm, nuechtern / nach dem Essen), Abschnitt 7: Schema "Wo wird was aufgenommen". Reiter Hilfekarten und Ueben (Strukturen finden, Wege verfolgen) wie beim Magen;
   die Duenndarmzotte (Abschnitt 7b: Knopf "Zotte", Infokarte "Duenndarmzotte hier ansehen" bei Leerdarm und Krummdarm, Kamerafahrt in die Darmwand) ist ein eigenes
   Modell (organe/verdauung/zotte.js, #darm/zotte).
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col = Grundfarbe des Materials), Text und
   Fakten der Infokarte (Texte von Joern freigegeben; fakten = Liste [Bezeichnung, Wert]).
   ===================================================================== */
var STRUKTUREN = [
  { id: 'zwoelffinger', de: 'Zwölffingerdarm', lat: 'Duodenum', grp: 'Dünndarm', col: 0xEAB0A2,
    txt: 'Der erste Abschnitt des Dünndarms legt sich wie ein C um den Kopf der Bauchspeicheldrüse. An der Papille kommen Galle und Pankreassaft hinzu. Sie neutralisieren den sauren Speisebrei aus dem Magen und spalten alle Nährstoffe weiter auf.',
    fakten: [['Länge', 'ca. 25–30 cm'], ['Zuflüsse', 'Galle und Pankreassaft'], [null, 'Nimmt besonders Eisen und Calcium auf']] },
  { id: 'papille', de: 'Papille', lat: 'Papilla duodeni major', grp: 'Dünndarm', col: 0xEAD07A,
    txt: 'Eine kleine Erhebung an der Innenwand des Zwölffingerdarms. Hier münden der Hauptgallengang und der Gang der Bauchspeicheldrüse, meist gemeinsam. Ein Schließmuskel öffnet sich vor allem nach dem Essen.',
    fakten: [['Lage', 'absteigender Teil des Zwölffingerdarms'], ['Mündung', 'Gallengang und Pankreasgang'], ['Schließmuskel', 'Sphinkter Oddi']] },
  { id: 'leerdarm', de: 'Leerdarm', lat: 'Jejunum', grp: 'Dünndarm', col: 0xEDB4A6,
    txt: 'Er folgt auf den Zwölffingerdarm und liegt vor allem im linken Oberbauch. Hohe Ringfalten und dichte Zotten geben ihm eine große Oberfläche: Hier wird der größte Teil der Nährstoffe aufgenommen. Er heißt so, weil er bei Verstorbenen meist leer gefunden wird.',
    fakten: [['Länge', 'ca. 2/5 des Dünndarms'], ['Ringfalten', 'hoch und dicht'], ['Nimmt auf', 'Zucker, Aminosäuren, Fette, Vitamine']] },
  { id: 'krummdarm', de: 'Krummdarm', lat: 'Ileum', grp: 'Dünndarm', col: 0xE6AA9C,
    txt: 'Der letzte und längste Abschnitt des Dünndarms liegt vor allem im rechten Unterbauch. Seine Falten werden flacher. Am Ende werden Vitamin B12 und die Gallensäuren aufgenommen, die über die Pfortader zur Leber zurückkehren.',
    fakten: [['Länge', 'ca. 3/5 des Dünndarms'], ['Endet', 'an der Bauhin-Klappe'], ['Nimmt auf', 'Vitamin B12, Gallensäuren']] },
  { id: 'bauhin', de: 'Bauhin-Klappe', lat: 'Valva ileocaecalis', grp: 'Dickdarm', col: 0xD9798F,
    txt: 'Hier mündet der Krummdarm seitlich in den Dickdarm. Die Klappe lässt den Darminhalt portionsweise in den Dickdarm und verhindert, dass er mit seinen vielen Bakterien in den Dünndarm zurückfließt.',
    fakten: [['Lage', 'rechter Unterbauch'], ['Aufgabe', 'Rückfluss verhindern'], ['Übergang', 'Krummdarm → Dickdarm']] },
  { id: 'blinddarm', de: 'Blinddarm', lat: 'Caecum', grp: 'Dickdarm', col: 0xC38D80,
    txt: 'Der Anfang des Dickdarms unterhalb der Bauhin-Klappe, ein kurzer, blind endender Sack. An ihm hängt der Wurmfortsatz.',
    fakten: [['Länge', 'ca. 7 cm'], ['Lage', 'rechter Unterbauch'], ['Trägt', 'den Wurmfortsatz']] },
  { id: 'wurmfortsatz', de: 'Wurmfortsatz', lat: 'Appendix vermiformis', grp: 'Dickdarm', col: 0xC99385,
    txt: 'Ein dünner, etwa fingerlanger Anhang des Blinddarms mit viel lymphatischem Gewebe. Entzündet er sich, spricht man umgangssprachlich von einer „Blinddarmentzündung“ (Appendizitis).',
    fakten: [['Länge', 'ca. 8–10 cm'], ['Gewebe', 'viel Abwehrgewebe'], ['Entzündung', 'Schmerz wandert in den rechten Unterbauch']] },
  { id: 'aufsteigend', de: 'Aufsteigender Dickdarm', lat: 'Colon ascendens', grp: 'Dickdarm', col: 0xC08A7C,
    txt: 'Er steigt auf der rechten Seite bis unter die Leber auf und biegt dort in den queren Dickdarm um. Typisch für den Dickdarm sind drei Längsmuskelstreifen (Tänien) und Ausbuchtungen (Haustren).',
    fakten: [['Lage', 'rechte Bauchseite'], ['Biegung', 'unter der Leber'], ['Kennzeichen', 'Tänien und Haustren']] },
  { id: 'quer', de: 'Querer Dickdarm', lat: 'Colon transversum', grp: 'Dickdarm', col: 0xBD8779,
    txt: 'Er hängt quer durch den Oberbauch unter dem Magen durch und ist am Gekröse beweglich aufgehängt. Hier wird dem Darminhalt weiter Wasser entzogen.',
    fakten: [['Lage', 'quer unter Magen und Leber'], ['Aufhängung', 'beweglich am Gekröse'], ['Biegung links', 'unter der Milz']] },
  { id: 'absteigend', de: 'Absteigender Dickdarm', lat: 'Colon descendens', grp: 'Dickdarm', col: 0xC28C7E,
    txt: 'Er zieht auf der linken Seite nach unten. Der Darminhalt ist hier schon weitgehend eingedickt.',
    fakten: [['Lage', 'linke Bauchseite'], ['Inhalt', 'schon fester Stuhl'], ['Weiter', 'ins Sigma']] },
  { id: 'sigma', de: 'Sigma', lat: 'Colon sigmoideum', grp: 'Dickdarm', col: 0xBC8677,
    txt: 'Die S-förmige Schlinge im linken Unterbauch verbindet den absteigenden Dickdarm mit dem Mastdarm. Hier sammelt sich der Stuhl vor der Entleerung.',
    fakten: [['Lage', 'linker Unterbauch'], ['Form', 'S-förmig'], ['Häufig betroffen', 'Divertikel']] },
  { id: 'mastdarm', de: 'Mastdarm', lat: 'Rectum', grp: 'Dickdarm', col: 0xB47D70,
    txt: 'Der letzte Abschnitt des Darms vor dem After. Füllt er sich, melden Dehnungsfühler in der Wand den Stuhldrang.',
    fakten: [['Länge', 'ca. 12–15 cm'], ['Lage', 'im kleinen Becken vor dem Kreuzbein'], ['Aufgabe', 'Stuhl sammeln, Stuhldrang auslösen']] },
  { id: 'after', de: 'After mit Schließmuskeln', lat: 'Canalis analis, Mm. sphincteres ani', grp: 'Dickdarm', col: 0xAD7466,
    txt: 'Der Analkanal wird von zwei Schließmuskeln verschlossen: Der innere arbeitet unwillkürlich, den äußeren können wir bewusst anspannen. Zusammen halten sie den Stuhl zurück, bis wir eine Toilette erreichen (Kontinenz).',
    fakten: [['Länge', 'ca. 4 cm'], ['Innerer Schließmuskel', 'unwillkürlich'], ['Äußerer Schließmuskel', 'willkürlich']] },
  { id: 'schleimhaut', de: 'Darmschleimhaut', lat: 'Tunica mucosa', grp: 'Darmwand', col: 0xE88F8C,
    txt: 'Die innere Auskleidung. Im Dünndarm bildet sie Ringfalten (Kerckring-Falten), darauf sitzen die Zotten und auf deren Zellen die Mikrovilli – so wird die Oberfläche etwa 600-fach vergrößert. Im Dickdarm gibt es keine Zotten, dafür viele schleimbildende Zellen.',
    fakten: [['Dünndarm', 'Ringfalten, Zotten, Mikrovilli'], ['Dickdarm', 'glatt, viele Becherzellen'], ['Erneuert sich', 'alle 3–5 Tage']] },
  { id: 'muskulatur', de: 'Darmmuskulatur', lat: 'Tunica muscularis', grp: 'Darmwand', col: 0xB8473F,
    txt: 'Eine innere Ring- und eine äußere Längsmuskelschicht. Mischbewegungen bringen den Speisebrei an die Schleimhaut, Muskelwellen (Peristaltik) schieben ihn weiter. Im Dickdarm treiben wenige kräftige Massenbewegungen am Tag den Stuhl voran, oft nach dem Frühstück.',
    fakten: [['Schichten', 'Ring- und Längsmuskel'], ['Bewegungen', 'mischen und weiterschieben'], ['Steuerung', 'eigenes Nervengeflecht der Darmwand']] },
  { id: 'gekroese', de: 'Gekröse', lat: 'Mesenterium', grp: 'Gekröse und Gefäße', col: 0xE8D9A0,
    txt: 'Eine Bauchfellplatte, an der der Dünndarm beweglich an der hinteren Bauchwand aufgehängt ist. In ihr laufen die Gefäße, Lymphgefäße und Nerven zum Darm.',
    fakten: [['Wurzel', 'ca. 15 cm, schräg an der hinteren Bauchwand'], ['Enthält', 'Gefäße, Lymphgefäße, Nerven'], ['Erlaubt', 'Beweglichkeit der Schlingen']] },
  { id: 'arterien', de: 'Darmarterien', lat: 'Arteriae mesentericae', grp: 'Gekröse und Gefäße', col: 0xC9483A,
    txt: 'Die obere Mesenterialarterie versorgt den Dünndarm und den Dickdarm bis etwa zur Mitte des queren Teils, die untere den Rest bis zum Mastdarm. Beide entspringen der Bauchaorta.',
    fakten: [['Herkunft', 'Bauchaorta'], ['Obere', 'Dünndarm, rechter Dickdarm'], ['Verschluss', 'Darminfarkt (Notfall)']] },
  { id: 'venen', de: 'Darmvenen', lat: 'Venae mesentericae', grp: 'Gekröse und Gefäße', col: 0x8E6FD0,
    txt: 'Sie begleiten die Arterien und sammeln das nährstoffreiche Blut aus dem Darm. Obere und untere Mesenterialvene fließen zur Pfortader.',
    fakten: [['Abfluss', 'zur Pfortader'], ['Inhalt', 'Blut mit den aufgenommenen Nährstoffen'], ['Verlauf', 'im Gekröse']] },
  { id: 'pfortader', de: 'Pfortader', lat: 'Vena portae hepatis', grp: 'Gekröse und Gefäße', col: 0x7A5CB0,
    txt: 'Sie sammelt das Blut aus Magen, Darm und Milz und bringt es zur Leber. Gezeigt ist ihr Anfang.',
    fakten: [['Ziel', 'Leber'], ['Zuflüsse', 'Magen, Darm, Milz'], [null, 'Weiter im Modell „Leber“']] },
  { id: 'lymphe', de: 'Lymphgefäße des Darms', lat: 'Vasa lymphatica (Vasa chylifera)', grp: 'Gekröse und Gefäße', col: 0xF3E39A,
    txt: 'Sie beginnen in jeder Zotte als zentrales Lymphgefäß und laufen im Gekröse neben den Venen zur Wurzel. Sie bringen das aufgenommene Fett als feine Tröpfchen (Chylomikronen) fort; nach einer fettreichen Mahlzeit ist ihr Inhalt milchig trüb (Chylus). Unterwegs fließt die Lymphe durch die Lymphknoten des Gekröses.',
    fakten: [['Inhalt', 'Lymphe mit Fett (Chylus)'], ['Abfluss', 'zur Lendenzisterne'], ['Unterwegs', 'Lymphknoten im Gekröse']] },
  { id: 'zisterne', de: 'Lendenzisterne', lat: 'Cisterna chyli', grp: 'Gekröse und Gefäße', col: 0xF3E39A,
    txt: 'Eine kleine sackartige Erweiterung vor dem 1. bis 2. Lendenwirbel, rechts hinter der Bauchaorta. Hier fließt die Lymphe aus dem Darm mit der Lymphe aus Beinen und Becken zusammen; aus ihr geht der Milchbrustgang hervor.',
    fakten: [['Lage', 'vor dem 1.–2. Lendenwirbel'], ['Zuflüsse', 'Darm, Beine, Becken'], ['Weiter', 'Milchbrustgang']] },
  { id: 'milchbrustgang', de: 'Milchbrustgang', lat: 'Ductus thoracicus', grp: 'Gekröse und Gefäße', col: 0xF3E39A,
    txt: 'Das größte Lymphgefäß des Körpers. Es zieht vor der Wirbelsäule durch das Zwerchfell nach oben und mündet am linken Venenwinkel ins Blut, dort, wo am Hals die linke innere Drosselvene und die Schlüsselbeinvene zusammenfließen. So gelangt das Fett aus dem Darm an der Leber vorbei in den Kreislauf. Gezeigt ist sein Anfang.',
    fakten: [['Länge', 'ca. 40 cm'], ['Mündung', 'linker Venenwinkel'], ['Lymphe', 'ca. 2–4 l pro Tag']] }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt; B5: Knopf "Zotte" */
var MARKUP = `<div id="title">
  <div class="kicker">Darm &middot; Intestinum</div>
  <h1>Dünndarm, Dickdarm &amp; <em>Mastdarm</em></h1>
  <div class="sub">Spaltet die Nahrung mit Galle und Pankreassaft, nimmt die Nährstoffe auf und dickt den Rest zu Stuhl ein.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">Übersicht</button>
    <button id="cam1" class="gh" title="Zwölffingerdarm mit der Papille, an der Galle und Pankreassaft münden">Zwölffingerdarm</button>
    <button id="cam2" class="gh" title="Eine Dünndarmschlinge, aufgeschnitten: Ringfalten und Zotten">Dünndarm</button>
    <button id="cam3" class="gh" title="Übergang vom Krummdarm in den Dickdarm mit Blinddarm und Wurmfortsatz">Blinddarm</button>
    <button id="cam4" class="gh" title="Mastdarm und After mit den Schließmuskeln">Mastdarm</button>
    <button id="bZotte" class="gh" title="Zur Dünndarmzotte – ein kleines Stück Schleimhaut, stark vergrößert">Zotte</button>
    <span class="sep"></span>
    <button id="bSchema" class="gh" title="Wo wird was aufgenommen – entlang des ganzen Darms">Schema</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Darmwand durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bNuechtern" class="gh on" title="Zwischen den Mahlzeiten: Der Darm ist fast leer">nüchtern</button>
    <button id="bEssen" class="gh" title="Nach einer Mahlzeit: Speisebrei, Galle und Pankreassaft fließen">nach dem Essen</button>
  </div>
  <div class="trow">
    <span class="cap">Stoffe</span>
    <button id="bKh" class="gh on" title="Kohlenhydrate ein- oder ausblenden">Kohlenhydrate</button>
    <button id="bEiw" class="gh on" title="Eiweiß ein- oder ausblenden">Eiweiß</button>
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

<div class="panel" id="schema" aria-label="Schema: Wo wird was aufgenommen">
  <div class="sch-head"><span class="kick">Schema &middot; Wo wird was aufgenommen</span><span class="sch-hint">Gleiche Stoffe wie im 3D-Modell, entlang des ganzen Darms.</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schließen">&times;</button></div>
  <div id="schemaBox"></div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#E8C84F">Gelb</b> Kohlenhydrate – werden zu Zucker gespalten, im Dünndarm aufgenommen und gehen ins Blut der Darmvenen.<br>
  <b style="color:#E88B3A">Orange</b> Eiweiß – wird zu Aminosäuren gespalten, im Dünndarm aufgenommen und geht ins Blut der Darmvenen.<br>
  <b style="color:#F2F2F2">Weiß</b> Fett – braucht die Galle, wird im Dünndarm aufgenommen und geht in die Lymphe.<br>
  <b style="color:#8FD0F0">Hellblau</b> Wasser – wird im Dünndarm und im Dickdarm ins Blut zurückgeholt.<br>
  <b style="color:#5FB85A">Grün</b> Galle, <b style="color:#C9B6E6">Blassviolett</b> Pankreassaft – fließen an der Papille zu.<br>
  <b style="color:#A8794F">Braun</b> Stuhl – im Dickdarm eingedickt, verlässt den Darm am After.<br>
  <b style="color:#E0584C">Rot</b> Darmarterien, <b style="color:#A98BDC">Violett</b> Darmvenen und Pfortader.<br>
  <b style="color:#F3E39A">Hellgelb</b> Lymphgefäße, Lendenzisterne und Milchbrustgang.<br>
  <b>Dünndarmzotte:</b> Leerdarm oder Krummdarm antippen → „Dünndarmzotte hier ansehen“.</p>
  <p class="note" id="legNote">Der Darm von vorn, wie er im Körper liegt. „Durchsicht“ zeigt den Inhalt und seinen Weg in Blut und Lymphe.</p>
  <p class="note">Die Teilchen zeigen den Weg der Stoffe – symbolisch, nicht maßstäblich; die Zeit läuft gerafft.</p>
  <p class="note kz">Dünndarm ca. 3–5 m, Dickdarm ca. 1,5 m<br>
  Verweildauer: Dünndarm 3–6 Stunden, Dickdarm 1–3 Tage<br>
  Flüssigkeit: ca. 9 l pro Tag gelangen in den Darm, nur ca. 0,1–0,2 l bleiben im Stuhl</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schließen">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
  <button class="gh" id="iOpen" style="display:none">Dünndarmzotte hier ansehen</button>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schließen">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">Nächste</button><button class="gh" id="qStop">Beenden</button></div>
</div>`;
/* Hilfekarten: [Schluessel, Titel, Text, Merke] (Texte von Joern freigegeben, darm-b-texte.md Abschnitt F) */
var HILFE = [
  ['aufgaben', 'Aufgaben des Darms', 'Im Zwölffingerdarm mischen sich Galle und Pankreassaft unter den Speisebrei und spalten Kohlenhydrate, Eiweiße und Fette in ihre Bausteine. Leerdarm und Krummdarm nehmen diese Bausteine über die Zotten auf, dazu Vitamine, Salze und den größten Teil des Wassers. Im Dickdarm wird dem Rest weiter Wasser entzogen; Bakterien der Darmflora bauen unverdauliche Reste ab. Der Mastdarm sammelt den Stuhl bis zur Entleerung.',
    'Der Dünndarm nimmt die Nährstoffe auf, der Dickdarm vor allem Wasser und Salze.'],
  ['saefte', 'Galle und Pankreassaft', 'Die Bauchspeicheldrüse gibt täglich etwa 1–1,5 Liter Pankreassaft ab. Er enthält Bicarbonat, das die Magensäure neutralisiert, und Enzyme für Kohlenhydrate, Eiweiße und Fette. Die Galle aus Leber und Gallenblase (ca. 0,5–1 Liter am Tag) zerlegt Fette in feine Tröpfchen, damit die Enzyme sie angreifen können. Beide münden an der Papille in den Zwölffingerdarm. Die Gallensäuren werden am Ende des Krummdarms zurückgeholt und kehren über die Pfortader zur Leber zurück.',
    'Fehlt die Galle, wird Fett schlecht aufgenommen – der Stuhl wird hell, fettig und glänzend.'],
  ['bewegung', 'Wie der Darm den Inhalt bewegt', 'Im Dünndarm schnüren Mischbewegungen den Speisebrei immer wieder ein und bringen ihn an die Schleimhaut; Muskelwellen schieben ihn langsam weiter. Nüchtern laufen in Abständen kräftigere Wellen durch den Darm und räumen ihn auf. Im Dickdarm bewegt sich der Inhalt nur langsam, wenige kräftige Massenbewegungen am Tag treiben den Stuhl voran – oft kurz nach dem Frühstück. Gesteuert wird das vom Nervengeflecht der Darmwand, verstärkt vom Vagusnerv, gebremst vom Sympathikus.',
    'Bewegung, ausreichend Trinken und Ballaststoffe regen die Darmbewegung an – Bettruhe und Opioide bremsen sie.'],
  ['pflege', 'Pflege: Stuhlbeobachtung und Obstipation', 'Pflegende beobachten Häufigkeit, Menge, Farbe, Geruch und Form des Stuhls sowie Beimengungen. Die Bristol-Stuhlformen-Skala beschreibt die Form von Typ 1 (harte Kugeln) bis Typ 7 (flüssig); Typ 3 und 4 gelten als normal. Schwarzer Teerstuhl kann auf eine Blutung im oberen Verdauungstrakt hinweisen, frisches Blut auf eine Blutung im Dickdarm oder am After, heller Stuhl auf einen Gallenstau. Zur Obstipationsprophylaxe gehören Bewegung, ausreichend Flüssigkeit (sofern nicht beschränkt), ballaststoffreiche Kost, feste Toilettenzeiten mit Ruhe und Privatsphäre und eine Kolonmassage im Uhrzeigersinn.',
    'Eisenpräparate färben den Stuhl ebenfalls schwarz – bei schwarzem Stuhl immer nach Medikamenten fragen und die Beobachtung weitergeben.'],
  ['aufnahme', 'Aufnahme ins Blut und in die Lymphe', 'Zucker, Aminosäuren, Wasser, Salze und die meisten Vitamine gehen aus den Zotten in die Kapillaren und über die Darmvenen in die Pfortader. So erreichen sie zuerst die Leber, die sie verarbeitet, speichert oder entgiftet. Fette werden in den Saumzellen zu Chylomikronen verpackt; sie sind zu groß für die Kapillaren und gehen in die Lymphgefäße. Über Lendenzisterne und Milchbrustgang gelangen sie am linken Venenwinkel ins Blut, an der Leber vorbei. Mit „Durchsicht“ siehst du, wie die Teilchen die Darmwand verlassen.',
    'Ist die Schleimhaut geschädigt, etwa bei Zöliakie, wird weniger aufgenommen: Es fehlen Nährstoffe und Vitamine, oft kommen Durchfall und Gewichtsverlust dazu.'],
  ['modell', 'So liest du das Modell', 'Der Darm ist von vorn dargestellt, so wie er im Körper liegt: vom Zwölffingerdarm über die Dünndarmschlingen bis zum After. Die Teilchen stehen für Stoffe: gelb Kohlenhydrate, orange Eiweiß, weiß Fett, hellblau Wasser, grün Galle, blassviolett Pankreassaft, braun Stuhl. Mit den Schaltern unter „Stoffe“ kannst du jeden Stoff einzeln verfolgen. „Durchsicht“ macht die Darmwand gläsern; dann siehst du auch, wie die Teilchen in die Darmvenen und Lymphgefäße übertreten. Am Ende jedes Durchgangs nach dem Essen verlässt der Stuhl den Darm am After. Der Ausschnitt „Dünndarm“ zeigt eine aufgeschnittene Schlinge mit Ringfalten. Über „Zotte“ oder durch Antippen von Leerdarm und Krummdarm kommst du zur Dünndarmzotte. Die Zeit läuft stark gerafft.',
    'Je weiter der Inhalt im Darm wandert, desto weniger Nährstoffe und desto weniger Wasser enthält er.']
];
/* Ueben "Strukturen finden": in welchen Ausschnitten (Nummer wie AUSSCHNITTE) eine Struktur im Bild liegt und sich antippen laesst. Die Waende der vier Bereiche sind in einem geoeffneten
   Ausschnitt von der Schleimhaut verdeckt, darum werden sie nur in der Uebersicht gesucht; Schleimhaut, Muskulatur, Papille, Bauhin-Klappe und After nur dort, wo sie zu sehen sind.
   Reihenfolge: der erste Eintrag ist der Ausschnitt, in den das Ueben wechselt. */
var NUR_INNEN = { schleimhaut: [2, 1, 3, 4], muskulatur: [2, 1, 3, 4], papille: [1], bauhin: [3], after: [4] };
/* Ueben "Wege verfolgen": feste Reihenfolge der vier Wege (Texte von Joern freigegeben, darm-b-texte.md Abschnitt G). Station = Liste von Struktur-ids (ids), Anzeigename de (sonst der Name
   der ersten Struktur); an = Ausschnitt, in den der Weg fuer diese Station wechselt (sonst die Uebersicht; Papille und Bauhin-Klappe liegen innen); mahlzeit = false (nuechtern) oder
   true (nach dem Essen) schaltet das Modell, fehlt sie, bleibt es wie es ist. Nur Daten: die Abfolge im Code kennt keine Darm-Besonderheiten. */
var DICKDARM_TEIL = ['leerdarm', 'krummdarm', 'blinddarm', 'aufsteigend', 'quer', 'absteigend', 'sigma'];   /* "Leerdarm" gilt bei Weg 3 auch fuer Krummdarm und die Dickdarmabschnitte */
var WEGE = [
  { titel: 'Weg der Nahrung', aufgabe: 'Der Speisebrei verlässt den Magen. Tippe seine Stationen der Reihe nach an, bis er den Körper verlässt.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['zwoelffinger'] }, { ids: ['leerdarm'] }, { ids: ['krummdarm'] }, { ids: ['bauhin'], an: 3 }, { ids: ['aufsteigend'] }, { ids: ['quer'] }, { ids: ['absteigend'] }, { ids: ['sigma'] }, { ids: ['mastdarm'] }, { ids: ['after'] }],
    abschluss: 'Geschafft: Im Dünndarm werden die Nährstoffe aufgenommen, im Dickdarm wird der Rest eingedickt, der Mastdarm sammelt den Stuhl.' },
  { titel: 'Weg der Verdauungssäfte', aufgabe: 'Nach dem Essen fließen Galle und Pankreassaft. Tippe der Reihe nach an, wo sie in den Darm gelangen und wohin sie wandern.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['papille'], an: 1 }, { ids: ['zwoelffinger'] }, { ids: ['leerdarm'] }, { ids: ['krummdarm'] }],
    abschluss: 'Geschafft: Galle und Pankreassaft wirken vor allem im Zwölffingerdarm und Leerdarm; die Gallensäuren werden am Ende des Krummdarms zurückgeholt.' },
  { titel: 'Weg des Blutes', aufgabe: 'Das Blut kommt aus der Bauchaorta. Tippe seine Stationen der Reihe nach an, bis es den Darm verlässt.',
    stationen: [{ ids: ['arterien'] }, { ids: DICKDARM_TEIL, de: 'Leerdarm' }, { ids: ['venen'] }, { ids: ['pfortader'] }],
    abschluss: 'Geschafft: Das nährstoffreiche Blut aus dem Darm fließt über die Pfortader zuerst zur Leber.' },
  { titel: 'Weg des Fetts', aufgabe: 'Fett wird im Dünndarm aufgenommen, aber nicht ins Blut. Tippe der Reihe nach an, wohin es geht.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['leerdarm', 'krummdarm'], de: 'Leerdarm' }, { ids: ['lymphe'] }, { ids: ['zisterne'] }, { ids: ['milchbrustgang'] }],
    abschluss: 'Geschafft: Das Fett gelangt über die Lymphe und den Milchbrustgang ins Blut, an der Leber vorbei.' }
];
/* Notiz der Lesehilfe: nur ohne Durchsicht und ohne geoeffneten Bereich */
var LEGNOTE = 'Der Darm von vorn, wie er im Körper liegt. „Durchsicht“ zeigt den Inhalt und seinen Weg in Blut und Lymphe.';
var organ = { renderer: {}, aufbauen: aufbauen };
var zoLetzte = null;   /* zuletzt gewaehlte Stelle fuer die Duenndarmzotte (Bogenlaenge s der Mittellinie in cm, fuer die Rueckfahrt; nur im Speicher der Seite, ueberdauert den Abbau des Darms) */
/* Mitte des Darms im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, der Darm steht im Modell mittig (Ziel der Kamerafahrt aus dem Koerper) */
var M = [0, 91, 3];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und fuer die Fahrt aus dem Koerper;
   ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt ZIEL_K minus M); von vorn wie im Koerper */
var ZIEL_K = [0, 91.5, 3];
var UEBERSICHT = { theta: 0, phi: 1.5708, ext: [32, 33], halb: 15.5, ziel: [ZIEL_K[0] - M[0], ZIEL_K[1] - M[1], ZIEL_K[2] - M[2]] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
var DECKEL_WEG = 7;                                /* so weit gleitet die vordere Haelfte nach vorn bzw. zur Seite (cm) */
/* Freier Bereich fuer den Darm und die Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten, ueben) {
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 54, y1: Math.max(150, toolsOben - 14 - 0.20 * h), labW: 104, fit: 70 };   /* Handy beim Ueben: die Karte (20 % der Hoehe) liegt direkt ueber der Werkzeugleiste, der Darm steht darueber */
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, der Darm steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (WERKZEUG_H, vier Zeilen; kommen Zeilen oder Knoepfe dazu, ist sie neu zu messen); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (WERKZEUG_H.handy + (w < WERKZEUG_H.umbruch ? 30 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + WERKZEUG_H.desktop };
}
var WERKZEUG_H = { desktop: 150, handy: 126, umbruch: 478 };   /* Hoehe der Leiste (Pixel), unter der Breite umbruch bricht die erste Reihe (Ausschnitt, mit Schema) um (+30; zweizeilig ist erlaubt, Joern). 478 gemessen mit dem Knopf Zotte (sieben Knoepfe in der Reihe Ausschnitt) */
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten, also relativ zu M) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.mitte = M;   /* Mitte des Darms im Koerper (cm): Koerper-Punkt = Modell-Punkt + mitte */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = null;   /* form: Form der Verdauung (Darm), wird in bauen geladen */
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var PI = Math.PI, DEG = PI / 180;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };
var sstep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* =====================================================================
   1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie; die Muskulatur hat zwei Materialien (Laengs- und Ringmuskel),
   der After drei (Haut, innerer und aeusserer Schliessmuskel), die gemeinsam leuchten; die vordere Haelfte (Deckel) hat eigene Materialien mit Endung D, damit sie ausblenden kann)
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
/* Aussenhaut: DoubleSide, weil die offenen Schlaeuche von innen angesehen werden; bei "Durchsicht" Glas */
var WAND = ['zwoelffinger', 'leerdarm', 'krummdarm', 'blinddarm', 'aufsteigend', 'quer', 'absteigend', 'sigma', 'mastdarm', 'after', 'wurmfortsatz'];
var DECK = ['zwoelffinger', 'leerdarm', 'blinddarm', 'aufsteigend', 'mastdarm', 'after'];   /* Strukturen mit einem Deckel (vordere Haelfte in einem der vier Bereiche) */
var GLAS = 0.22;                                             /* Deckkraft der Aussenhaut bei "Durchsicht" */
var MAT = {};
WAND.forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.5, coat: 0.35, side: THREE.DoubleSide }); });
DECK.forEach(function (sid) { MAT[sid + 'D'] = mat(STRUCT[sid].col, { rough: 0.5, coat: 0.35, side: THREE.DoubleSide }); });
function innen(hex) { return mat(hex, { rough: 0.6, coat: 0.2, side: THREE.DoubleSide }); }
MAT.schleimhaut = innen(0xE88F8C);
MAT.schleimhautL = mat(0xE88F8C, { rough: 0.6, coat: 0.2, side: THREE.DoubleSide, opacity: 0.3 });   /* einfache Innenflaeche (nur bei Durchsicht): durchscheinend, damit man den Inhalt sieht */
MAT.papille = innen(STRUCT.papille.col);
MAT.bauhin = innen(STRUCT.bauhin.col);
MAT.gangGalle = mat(0x5E9A4A, { rough: 0.4, coat: 0.3 }); MAT.gangPankreas = mat(0xC9B6E6, { rough: 0.4, coat: 0.3 });   /* Gaenge an der Papille (gehoeren zur Struktur Papille) */
function kappeMat(hex) { return mat(hex, { rough: 0.55, side: THREE.DoubleSide }); }
MAT.kLaengs = kappeMat(0xD9776A); MAT.kRing = kappeMat(0xB8473F);                       /* Darmmuskulatur */
MAT.kSphInnen = kappeMat(0x8F3030); MAT.kSphAussen = kappeMat(0xA84A3C);                /* Schliessmuskeln (After) */
['arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang'].forEach(function (sid) { MAT[sid] = mat(STRUCT[sid].col, { rough: 0.4, coat: 0.3 }); });
var GEF_RF = 1.35, GEF_OP = 0.5;   /* Teilchen im Gefaess: Radius als Vielfaches des Gefaessradius; Deckkraft der Gefaesse bei Durchsicht */
var DURCH_GEF = ['venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang'];   /* bei Durchsicht halbdurchsichtig (applyLook) */
MAT.gekroese = mat(STRUCT.gekroese.col, { rough: 0.7, opacity: 0.4, side: THREE.DoubleSide });
/* Taenien heller abgesetzt: die Aussenhaut des Dickdarms (Blinddarm bis Sigma) bekommt Vertexfarben (Faktor auf die Materialfarbe, linear je Kanal: 1 ausserhalb der Taenien,
   zur Mitte des Streifens hin das Verhaeltnis Zielfarbe / Grundfarbe) */
var TAENIE = ['blinddarm', 'aufsteigend', 'quer', 'absteigend', 'sigma'], TAENIE_ZIEL = srgb(0xEBD3C8);
TAENIE.forEach(function (sid) { MAT[sid].vertexColors = true; if (MAT[sid + 'D']) MAT[sid + 'D'].vertexColors = true; });
function taenieFarbe(g, sid, taenie) {
  var b = srgb(STRUCT[sid].col), p = g.attributes.position, c = new Float32Array(p.count * 3), i, t;
  var fr = TAENIE_ZIEL.r / b.r - 1, fg = TAENIE_ZIEL.g / b.g - 1, fb = TAENIE_ZIEL.b / b.b - 1;
  for (i = 0; i < p.count; i++) { t = taenie(p.getX(i), p.getY(i), p.getZ(i)); c[i * 3] = 1 + t * fr; c[i * 3 + 1] = 1 + t * fg; c[i * 3 + 2] = 1 + t * fb; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
}
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

var root = new THREE.Group(); root.name = 'Darm'; root.position.set(-M[0], -M[1], -M[2]); scene.add(root);   /* Koerper-Koordinaten, um die Mitte M verschoben */
root.visible = false;   /* erst nach dem Aufbau zeigen: waehrend des Aufbaus zeichnet der Rahmen sonst bei jedem Schritt die halbfertige Szene */
/* Bereiche, in denen die vordere Wand abgehoben werden kann: 1 Zwoelffingerdarm, 2 Duenndarm, 3 Blinddarm, 4 Mastdarm; je Bereich ein Deckel (Gruppe) und die Richtung, in die er gleitet */
var REG = [null,
  { name: 'Zwölffingerdarm', dir: [0, 0, 1] }, { name: 'Dünndarm', dir: [0, 0, 1] }, { name: 'Blinddarm', dir: [0, 0, 1] }, { name: 'Mastdarm', dir: [1, 0, 0] }];
REG.forEach(function (r) { if (!r) return; r.deckel = new THREE.Group(); r.deckel.name = 'Deckel (' + r.name + ')'; root.add(r.deckel); });
var tris = { haut: 0, schichten: 0, rohre: 0, gekroese: 0 };
var kappen = [], schichten = [];   /* Meshes der Schnittflaechen (Kappen) und der feinen Schichten (Schleimhaut, Papille, Klappe), je mit userData.reg */
function addMesh(sid, geo, material, name, order, art, reg) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order; m.userData.sid = sid; STRUCT[sid].meshes.push(m);
  if (reg) m.userData.reg = reg;
  if (art === 'deckel') { m.userData.deckel = true; REG[reg].deckel.add(m); }
  else {
    root.add(m);
    if (art === 'kappe') { m.userData.kappe = true; kappen.push(m); }
    else if (art === 'schicht') { m.userData.schicht = true; schichten.push(m); }
    else if (art === 'lumen') m.userData.lumen = true;
  }
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* =====================================================================
   2. Geometrie: Aussenhaut als Schlauch um die Mittellinie, Schichten und Kappen der vier Bereiche, Gekroese, Gefaesse
   ===================================================================== */
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var HC = klein ? 0.14 : 0.1;                      /* Gitterweite der feinen Schichten (cm) */
var DS = klein ? 0.35 : 0.25;                     /* Ringabstand des Schlauchs (cm) */

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
/* Netz aus einem Abstandsfeld: Gitter ueber bounds mit Weite h, Normalen aus dem Feld (ohne: nur die Dreiecksnormalen) */
async function netz(fn, bounds, h, fortschritt, ohneFeldNormalen) {
  var G = S.makeGrid(bounds, h), F = await S.evalFeld(G, fn, fortschritt);
  if (abgebaut) return null;
  var g = S.geometrie(G, F);
  if (!ohneFeldNormalen) feldNormalen(g, fn);
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

/* Schlauch um die Mittellinie A (Achse der Form) zwischen den Bogenlaengen s0 und s1: Ringe im Begleitdreibein der Achse, Radius Rf(s, phi) (phi wie A.phi() in der Form),
   Normalen aus den Ableitungen der Flaeche (gleich ueber die Grenzen mehrerer Schlaeuche hinweg). o: seiten, ds (Ringabstand), kappe0 / kappe1 ('flach' oder 'rund' am Anfang bzw. Ende).
   Rueckgabe: indizierte Geometrie (Position, Normale). */
var FR = { i: 0, x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, nx: 0, ny: 0, nz: 0, bx: 0, by: 0, bz: 0 };
function rahmen(A, s) {
  var n = A.n, Sa = A.S, lo, f, h, m, hi;
  if (s <= 0) { lo = 0; f = 0; } else if (s >= Sa[n - 1]) { lo = n - 2; f = 1; } else {
    lo = 0; hi = n - 1;
    while (hi - lo > 1) { m = (lo + hi) >> 1; if (Sa[m] <= s) lo = m; else hi = m; }
    f = (s - Sa[lo]) / (Sa[lo + 1] - Sa[lo]);
  }
  h = lo + 1; FR.i = lo;
  FR.x = A.X[lo] + (A.X[h] - A.X[lo]) * f; FR.y = A.Y[lo] + (A.Y[h] - A.Y[lo]) * f; FR.z = A.Z[lo] + (A.Z[h] - A.Z[lo]) * f;
  var tx = A.TX[lo] + (A.TX[h] - A.TX[lo]) * f, ty = A.TY[lo] + (A.TY[h] - A.TY[lo]) * f, tz = A.TZ[lo] + (A.TZ[h] - A.TZ[lo]) * f, tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
  tx /= tl; ty /= tl; tz /= tl;
  var nx = A.NX[lo] + (A.NX[h] - A.NX[lo]) * f, ny = A.NY[lo] + (A.NY[h] - A.NY[lo]) * f, nz = A.NZ[lo] + (A.NZ[h] - A.NZ[lo]) * f, dp = nx * tx + ny * ty + nz * tz;
  nx -= dp * tx; ny -= dp * ty; nz -= dp * tz;
  var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
  FR.tx = tx; FR.ty = ty; FR.tz = tz; FR.nx = nx; FR.ny = ny; FR.nz = nz;
  FR.bx = ty * nz - tz * ny; FR.by = tz * nx - tx * nz; FR.bz = tx * ny - ty * nx;
  return FR;
}
function schlauch(A, s0, s1, Rf, o) {
  o = o || {};
  var seiten = o.seiten || 24, eS = o.eS || 0.05, nR = Math.max(2, Math.ceil((s1 - s0) / (o.ds || DS))), pos = [], nor = [], idx = [], k, j, TWO = 2 * PI;
  var a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0], d = [0, 0, 0];
  function punkt(s, phi, out) {
    var fr = rahmen(A, s), R = Rf(s, phi), cs = Math.cos(phi) * R, sn = Math.sin(phi) * R;
    out[0] = fr.x + cs * fr.nx + sn * fr.bx; out[1] = fr.y + cs * fr.ny + sn * fr.by; out[2] = fr.z + cs * fr.nz + sn * fr.bz;
  }
  function ring(s) {
    var base = pos.length / 3;
    for (j = 0; j < seiten; j++) {
      var phi = TWO * j / seiten;
      punkt(s, phi, c);
      punkt(s + eS, phi, a); punkt(s - eS, phi, b);
      var sx = a[0] - b[0], sy = a[1] - b[1], sz = a[2] - b[2];
      punkt(s, phi + 0.02, a); punkt(s, phi - 0.02, b);
      var px = a[0] - b[0], py = a[1] - b[1], pz = a[2] - b[2];
      var nx = py * sz - pz * sy, ny = pz * sx - px * sz, nz = px * sy - py * sx, nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (nl < 1e-9) { var fr = rahmen(A, s); nx = Math.cos(phi) * fr.nx + Math.sin(phi) * fr.bx; ny = Math.cos(phi) * fr.ny + Math.sin(phi) * fr.by; nz = Math.cos(phi) * fr.nz + Math.sin(phi) * fr.bz; nl = 1; }
      pos.push(c[0], c[1], c[2]); nor.push(nx / nl, ny / nl, nz / nl);
    }
    return base;
  }
  var rings = [];
  if (o.kappe0 === 'rund') {   /* runde Kappe: Halbkugel hinter s0 (ein Ring mit Radius 0 an der Spitze) */
    var m = 6, fr0 = rahmen(A, s0), tx = fr0.tx, ty = fr0.ty, tz = fr0.tz, ox = fr0.x, oy = fr0.y, oz = fr0.z, nxx = fr0.nx, nyy = fr0.ny, nzz = fr0.nz, bxx = fr0.bx, byy = fr0.by, bzz = fr0.bz;
    for (k = 0; k < m; k++) {
      var psi = PI / 2 * (1 - k / m), cp = Math.cos(psi), sp = Math.sin(psi), base0 = pos.length / 3;
      for (j = 0; j < seiten; j++) {
        var ph = TWO * j / seiten, R0 = Rf(s0, ph), ux = Math.cos(ph) * nxx + Math.sin(ph) * bxx, uy = Math.cos(ph) * nyy + Math.sin(ph) * byy, uz = Math.cos(ph) * nzz + Math.sin(ph) * bzz;
        pos.push(ox - tx * R0 * sp + ux * R0 * cp, oy - ty * R0 * sp + uy * R0 * cp, oz - tz * R0 * sp + uz * R0 * cp);
        nor.push(-tx * sp + ux * cp, -ty * sp + uy * cp, -tz * sp + uz * cp);
      }
      rings.push(base0);
    }
  }
  for (k = 0; k <= nR; k++) rings.push(ring(s0 + (s1 - s0) * k / nR));
  for (k = 0; k < rings.length - 1; k++) for (j = 0; j < seiten; j++) {
    var j1 = (j + 1) % seiten, p0 = rings[k] + j, p1 = rings[k] + j1, q0 = rings[k + 1] + j, q1 = rings[k + 1] + j1;
    idx.push(p0, p1, q0, p1, q1, q0);
  }
  function flach(s, vz) {   /* ebene Kappe: Mitte plus Ring mit Normale +-T; vz = +1 am Ende, -1 am Anfang */
    var fr = rahmen(A, s), base = pos.length / 3, mid = base + seiten, tx = fr.tx * vz, ty = fr.ty * vz, tz = fr.tz * vz;
    for (j = 0; j < seiten; j++) { punkt(s, TWO * j / seiten, c); pos.push(c[0], c[1], c[2]); nor.push(tx, ty, tz); }
    pos.push(fr.x, fr.y, fr.z); nor.push(tx, ty, tz);
    for (j = 0; j < seiten; j++) { var j1 = (j + 1) % seiten; if (vz > 0) idx.push(mid, base + j, base + j1); else idx.push(mid, base + j1, base + j); }
  }
  if (o.kappe0 === 'flach') flach(s0, -1);
  if (o.kappe1 === 'flach') flach(s1, 1);
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return geo;
}

/* Schnittflaeche einer Wandschicht (Beschreibung def aus der Form: Schnittebene def.ebene = [hx, hy, hz, off], Radius def.R(s, phi), Schicht L zwischen den Tiefen a und b unter der
   Aussenflaeche): ein Raster auf der Schnittebene (Bogenlaenge s der Mittellinie mal Abstand w in der Ebene; Ebene wie schnittEbene in der Form: senkrecht zur Tangente, um off nach vorn
   versetzt), jedes Dreieck wird an den Rand der Schicht beschnitten (tief = R - Abstand zur Mittellinie liegt zwischen a und b; lineare Naehe zwischen den Rasterpunkten). Am blinden Ende
   (def.s0 < 0) setzt sich das Raster hinter dem Anfang fort (Halbkugel). Die Flaeche zeigt zur abgehobenen Seite (Normale = Normale der Ebene). Rueckgabe: Geometrie ohne Index oder null. */
function kappenBand(A, def, L) {
  var h = def.ebene, off = h[3], wm = def.rand || 2.6, DSK = 0.1, DWK = 0.1;
  var s0 = Math.max(L.von === undefined ? def.s0 : L.von, def.s0), s1 = Math.min(L.bis === undefined ? def.s1 : L.bis, def.s1), sg = [], k, j;
  function strecke(a, b) { var n = Math.max(1, Math.ceil((b - a) / DSK - 1e-9)); for (var q = (sg.length && sg[sg.length - 1] === a) ? 1 : 0; q <= n; q++) sg.push(a + (b - a) * q / n); }
  if (s0 < 0) { strecke(-wm, 0); strecke(0, s1); } else strecke(s0, s1);
  var nw = Math.ceil(2 * wm / DWK) + 1, ns = sg.length, P = [];
  function eck(sig, w) {
    var fr = rahmen(A, Math.max(sig, 0)), lo = fr.i, tx = A.TX[lo], ty = A.TY[lo], tz = A.TZ[lo];
    var dp = h[0] * tx + h[1] * ty + h[2] * tz, nx = h[0] - dp * tx, ny = h[1] - dp * ty, nz = h[2] - dp * tz, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    var ex = ty * nz - tz * ny, ey = tz * nx - tx * nz, ez = tx * ny - ty * nx;
    var vx = off * nx + w * ex, vy = off * ny + w * ey, vz = off * nz + w * ez, ax = fr.x, ay = fr.y, az = fr.z, sv = sig;
    if (sig < 0) { vx += sig * tx; vy += sig * ty; vz += sig * tz; sv = 0; }
    var d = Math.sqrt(vx * vx + vy * vy + vz * vz), phi = Math.atan2(vx * fr.bx + vy * fr.by + vz * fr.bz, vx * fr.nx + vy * fr.ny + vz * fr.nz);
    var tief = def.R(sv, phi) - d;
    return { x: ax + vx, y: ay + vy, z: az + vz, nx: nx, ny: ny, nz: nz, fa: L.a(sv, phi) - tief, fb: tief - L.b(sv, phi) };
  }
  for (k = 0; k < ns; k++) for (j = 0; j < nw; j++) P.push(eck(sg[k], -wm + 2 * wm * j / (nw - 1)));
  var pos = [], nor = [];
  function mix(p, q, u) { return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, z: p.z + (q.z - p.z) * u, nx: p.nx + (q.nx - p.nx) * u, ny: p.ny + (q.ny - p.ny) * u, nz: p.nz + (q.nz - p.nz) * u, fa: p.fa + (q.fa - p.fa) * u, fb: p.fb + (q.fb - p.fb) * u }; }
  function klipp(poly, key) {   /* Vieleck an key <= 0 beschneiden */
    var out = [], n = poly.length, w;
    for (w = 0; w < n; w++) {
      var p = poly[w], q = poly[(w + 1) % n], pin = p[key] <= 0, qin = q[key] <= 0;
      if (pin) out.push(p);
      if (pin !== qin) out.push(mix(p, q, p[key] / (p[key] - q[key])));
    }
    return out;
  }
  function tri(a, b, c) {
    if (a.fa > 0 && b.fa > 0 && c.fa > 0) return; if (a.fb > 0 && b.fb > 0 && c.fb > 0) return;
    var poly = klipp(klipp([a, b, c], 'fa'), 'fb'), q;
    for (q = 1; q < poly.length - 1; q++) {
      var t = [poly[0], poly[q], poly[q + 1]], ux = t[1].x - t[0].x, uy = t[1].y - t[0].y, uz = t[1].z - t[0].z, wx = t[2].x - t[0].x, wy = t[2].y - t[0].y, wz = t[2].z - t[0].z;
      var zx = uy * wz - uz * wy, zy = uz * wx - ux * wz, zz = ux * wy - uy * wx, dr = zx * t[0].nx + zy * t[0].ny + zz * t[0].nz;
      if (dr < 0) t = [t[0], t[2], t[1]];
      t.forEach(function (e) { pos.push(e.x, e.y, e.z); nor.push(e.nx, e.ny, e.nz); });
    }
  }
  for (k = 0; k < ns - 1; k++) for (j = 0; j < nw - 1; j++) {
    var c00 = P[k * nw + j], c10 = P[(k + 1) * nw + j], c01 = P[k * nw + j + 1], c11 = P[(k + 1) * nw + j + 1];
    tri(c00, c10, c11); tri(c00, c11, c01);
  }
  if (!pos.length) return null;
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

/* Teil einer Punktfolge mit Bogenlaenge s0..s1 der Achse (Punkte der Mittellinie) */
function achsenPunkte(A, s0, s1, n) {
  var out = [], i;
  for (i = 0; i < n; i++) out.push(A.punkt(s0 + (s1 - s0) * (i + 0.5) / n));
  return out;
}
/* Anker (Koerper-Koordinaten) fuer die Beschriftung: Kandidaten je Struktur */
var ANKER = {};

var geoDaten = null;
/* Aufbau: Formen laden -> Haut des ganzen Darms -> feine Schichten der vier Bereiche -> Gekroese und Gefaesse (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
async function bauen() {
  await setLoad(0.01, 'Formen laden'); if (abgebaut) return;
  await Kern.formLaden('lunge'); if (abgebaut) return;
  await Kern.formLaden('leber'); if (abgebaut) return;   /* Pfortader und Papille (die Form der Verdauung greift beim Auswerten darauf zu) */
  form = await Kern.formLaden('verdauung'); if (abgebaut) return;
  await setLoad(0.03, 'Darmwand'); if (abgebaut) return;
  var du = form.duenndarm(), dk = form.dickdarm(), kp = form.darmKennpunkte(), AB = dk.abschnitte, Adk = dk.achse, Adu = du.achse;
  var Aduo = form.Achse(form.BAHN.duodenum.pts, { schritt: 0.3 }), Lduo = Aduo.laenge, sP = Aduo.von(kp.PAPILLE.p);
  var DUO_R = form.BAHN.duodenum.r, DU_R = form.DUENN_R;
  /* Schichten der vier Bereiche (Funktionen der Form; das Vernetzen geschieht spaeter) */
  var RZ = [null, form.zwoelffingerdarmSchichten(), form.duennSchichten(du.schnitt.s0, du.schnitt.s1), form.blinddarmSchichten(), form.mastdarmSchichten({ von: AB.mastdarm[0] })];
  /* Bereiche der Mittellinie (Bogenlaenge) */
  var B1 = [Math.max(sP - 5, 0), sP + 5], B2 = [du.schnitt.s0, du.schnitt.s1], B3 = [0, AB.blinddarm[1] + 3.0], B4 = [AB.mastdarm[0], Adk.laenge];   /* der Bereich Mastdarm beginnt mit dem Mastdarm: keine Stufe zum groben Teil */
  var RDUO = function (s) { return DUO_R + (DU_R - DUO_R) * sstep(Lduo - 1.4, Lduo, s); };   /* Radius des Zwoelffingerdarms: laeuft am Ende in den des Duenndarms */
  var RDU = function () { return DU_R; };
  var RDK = function (s, phi) { return dk.R(s, phi); };
  /* ein Stueck der Haut: reg > 0 teilt es an der Schnittflaeche des Bereichs in hintere Haelfte und Deckel */
  function haut(sid, A, s0, s1, Rf, o, reg) {
    var g = schlauch(A, s0, s1, Rf, o), tn = TAENIE.indexOf(sid) >= 0;
    if (!reg) {
      if (tn) taenieFarbe(g, sid, dk.taenie);
      var m0 = addMesh(sid, g, MAT[sid], STRUCT[sid].de, 3, 'hinten'); if (o && o.ende) m0.userData.ende = true; if (o && o.fern) m0.userData.fern = true; tris.haut += anz(g); return; }
    var t = schneide(g, RZ[reg].schnitt); g.dispose();
    if (tn) { if (t.neg) taenieFarbe(t.neg, sid, dk.taenie); if (t.pos) taenieFarbe(t.pos, sid, dk.taenie); }
    if (t.neg) { addMesh(sid, t.neg, MAT[sid], STRUCT[sid].de, 3, 'hinten', reg); tris.haut += anz(t.neg); }
    if (t.pos) { addMesh(sid, t.pos, MAT[sid + 'D'], STRUCT[sid].de + ' (vorn)', 3, 'deckel', reg); tris.haut += anz(t.pos); }
  }
  /* Zwoelffingerdarm */
  haut('zwoelffinger', Aduo, 0, B1[0], RDUO, { seiten: 24, kappe0: 'flach' });
  haut('zwoelffinger', Aduo, B1[0], B1[1], RDUO, { seiten: 24 }, 1);
  haut('zwoelffinger', Aduo, B1[1], Lduo, RDUO, { seiten: 24, kappe1: 'flach' });
  await setLoad(0.06, 'Dünndarm'); if (abgebaut) return;
  /* Duenndarm: Leerdarm bis leerEnde, davon eine aufschneidbare Schlinge, dann Krummdarm */
  haut('leerdarm', Adu, 0, B2[0], RDU, { seiten: 20, kappe0: 'flach' });
  haut('leerdarm', Adu, B2[0], B2[1], RDU, { seiten: 20 }, 2);
  haut('leerdarm', Adu, B2[1], du.leerEnde, RDU, { seiten: 20 });
  haut('krummdarm', Adu, du.leerEnde, du.laenge - 7, RDU, { seiten: 20 });
  haut('krummdarm', Adu, du.laenge - 7, du.laenge, RDU, { seiten: 20, kappe1: 'flach', ende: true });   /* die letzten 7 cm vor der Bauhin-Klappe bleiben im Ausschnitt Blinddarm stehen */
  await setLoad(0.1, 'Dickdarm'); if (abgebaut) return;
  /* Dickdarm: Blinddarm (runde Kappe) und der Anfang des aufsteigenden Teils im Bereich 3, dann die Abschnitte bis zum After */
  haut('blinddarm', Adk, 0, AB.blinddarm[1], RDK, { seiten: 36, kappe0: 'rund' }, 3);
  haut('aufsteigend', Adk, AB.blinddarm[1], B3[1], RDK, { seiten: 36 }, 3);
  haut('aufsteigend', Adk, B3[1], B3[1] + 4.5, RDK, { seiten: 36 });
  haut('aufsteigend', Adk, B3[1] + 4.5, AB.aufsteigend[1], RDK, { seiten: 36, fern: true });   /* der obere Teil bis zur Biegung unter der Leber liegt im Ausschnitt Blinddarm im Weg */
  haut('quer', Adk, AB.quer[0], AB.quer[1], RDK, { seiten: 36 });
  haut('absteigend', Adk, AB.absteigend[0], AB.absteigend[1], RDK, { seiten: 36 });
  haut('sigma', Adk, AB.sigma[0], AB.sigma[1], RDK, { seiten: 36 });
  haut('mastdarm', Adk, B4[0], AB.mastdarm[1], RDK, { seiten: 36 }, 4);
  haut('after', Adk, AB.analkanal[0], Adk.laenge, RDK, { seiten: 36 }, 4);
  /* Schleimhaut als einfacher Schlauch unter der Wand: nur bei Durchsicht zu sehen (in den vier Bereichen sind es die feinen Schichten, solange sie geschlossen sind) */
  function lumen(A, s0, s1, tiefe, Rf, reg, seiten) {
    var g = schlauch(A, s0, s1, function (s, phi) { return Rf(s, phi) - tiefe; }, { seiten: seiten || 16, ds: DS * 1.6 });
    addMesh('schleimhaut', g, MAT.schleimhautL, STRUCT.schleimhaut.de + ' (innen)', 2, 'lumen', reg || undefined);
    tris.haut += anz(g);
  }
  lumen(Aduo, 0, B1[0], 0.45, RDUO); lumen(Aduo, B1[0], B1[1], 0.45, RDUO, 1); lumen(Aduo, B1[1], Lduo, 0.45, RDUO);
  lumen(Adu, 0, B2[0], 0.5, RDU); lumen(Adu, B2[0], B2[1], 0.5, RDU, 2); lumen(Adu, B2[1], du.laenge, 0.5, RDU);
  lumen(Adk, 0, B3[1], 0.55, RDK, 3, 24); lumen(Adk, B3[1], B4[0], 0.55, RDK, 0, 24); lumen(Adk, B4[0], Adk.laenge, 0.55, RDK, 4, 24);
  await setLoad(0.14, 'Schnittflächen'); if (abgebaut) return;
  /* Schichten der vier Bereiche: die Schnittflaeche (Kappen von Laengsmuskel, Ringmuskel, Schliessmuskeln und Schleimhaut) wird aus den Tiefen a und b der Wand auf einem
     Raster der Schnittebene gebaut, die Innenflaeche der Schleimhaut (mit Ringfalten, Saeulen) als Schlauch mit dem Radius R - b und an der Schnittebene beschnitten; nur
     Papille, Klappe und Wurmfortsatz sind kleine Abstandsfelder (Gitter HC) */
  var AX = [null, Aduo, Adu, Adk, Adk], KAPPE = {
    laengsmuskel: ['muskulatur', 'kLaengs'], ringmuskel: ['muskulatur', 'kRing'], sphinkterInnen: ['after', 'kSphInnen'], sphinkterAussen: ['after', 'kSphAussen'], schleimhaut: ['schleimhaut', 'schleimhaut']
  }, FELD = { papille: ['papille', 'papille'], bauhin: ['bauhin', 'bauhin'] };
  var r;
  for (r = 1; r <= 4; r++) {
    var Z = RZ[r], def = Z.def, A = AX[r], k;
    for (k = 0; k < def.schichten.length; k++) {
      var L = def.schichten[k], kz = KAPPE[L.id];
      if (kz) {
        var kg = kappenBand(A, def, L);
        if (kg) { addMesh(kz[0], kg, MAT[kz[1]], STRUCT[kz[0]].de + ' (Schnittfläche)', 2, 'kappe', r); tris.schichten += anz(kg); }
      }
    }
    /* Innenflaeche der Schleimhaut: hintere Haelfte */
    var LS = def.schichten.filter(function (l) { return l.id === 'schleimhaut'; })[0];
    var lg = schlauch(A, Math.max(def.s0, 0), def.s1, function (s, phi) { return def.R(s, phi) - LS.b(s, phi); }, { seiten: 64, ds: r === 3 ? 0.1 : r === 4 ? 0.08 : 0.05, kappe0: def.s0 < 0 ? 'rund' : null, eS: 0.02 });
    var lt = schneide(lg, Z.schnitt); lg.dispose();
    if (lt.neg) { addMesh('schleimhaut', lt.neg, MAT.schleimhaut, STRUCT.schleimhaut.de + ' (innen)', 2, 'schicht', r); tris.schichten += anz(lt.neg); }
    if (lt.pos) lt.pos.dispose();
    /* kleine Teile als Abstandsfeld: Papille, Klappe, Wurmfortsatz */
    for (k = 0; k < Z.schichten.length; k++) {
      var L2 = Z.schichten[k], f2 = FELD[L2.id];
      if (!f2) continue;
      var g = await netz(L2.sdf, L2.grenzen, HC, null, false); if (abgebaut) return;
      addMesh(f2[0], g, MAT[f2[1]], STRUCT[f2[0]].de, 2, 'schicht', r);
      tris.schichten += anz(g);
    }
      await setLoad(0.14 + 0.7 * r / 4, 'Schnittflächen'); if (abgebaut) return;
  }
  /* Wurmfortsatz: glattes Rohr entlang der Kurve (Anfang in der Wand des Blinddarms), nicht aufgeschnitten */
  var wk = form.kurve(form.wurmfortsatz().pts, 8), wA = Adk.punkt(0), wi = 0;
  while (wi < wk.length - 2 && Math.sqrt(Math.pow(wk[wi][0] - wA[0], 2) + Math.pow(wk[wi][1] - wA[1], 2) + Math.pow(wk[wi][2] - wA[2], 2)) < 2.2) wi++;
  var wg = rohre([{ pts: wk.slice(wi), r0: form.wurmfortsatz().r, r1: form.wurmfortsatz().r * 0.9, seiten: 14, segmente: 60 }]);
  addMesh('wurmfortsatz', wg, MAT.wurmfortsatz, STRUCT.wurmfortsatz.de, 3, 'hinten', 3); tris.rohre += anz(wg);
  /* Ende des Gallengangs und des Pankreasgangs: kommen von aussen an die Papille (Teil der Struktur Papille) */
  var LF = Kern.Formen.leber.GEFAESSE, gg = LF.gallengang.filter(function (q) { return q.id === 'hauptgallengang'; })[0], pg = LF.pankreasgang[0];
  var ga = rohre([{ pts: gg.pts.slice(-3), r0: gg.r0, r1: gg.r1, seiten: 12 }]), gb = rohre([{ pts: pg.pts, r0: pg.r0, r1: pg.r1, seiten: 10 }]);
  addMesh('papille', ga, MAT.gangGalle, STRUCT.papille.de + ' (Gallengang)', 3, 'hinten', 1); addMesh('papille', gb, MAT.gangPankreas, STRUCT.papille.de + ' (Pankreasgang)', 3, 'hinten', 1);
  await setLoad(0.86, 'Gekröse und Gefäße'); if (abgebaut) return;
  /* Gekroese: halbdurchsichtige Platte */
  var gk = form.gekroese(), gg = new THREE.BufferGeometry(), gp = new Float32Array(gk.pts.length * 3), i;
  for (i = 0; i < gk.pts.length; i++) { gp[i * 3] = gk.pts[i][0]; gp[i * 3 + 1] = gk.pts[i][1]; gp[i * 3 + 2] = gk.pts[i][2]; }
  gg.setAttribute('position', new THREE.BufferAttribute(gp, 3));
  gg.setIndex(gk.tris); gg.computeVertexNormals();
  addMesh('gekroese', gg, MAT.gekroese, STRUCT.gekroese.de, 5, 'hinten'); tris.gekroese = anz(gg);
  /* Gefaesse: je Struktur ein Netz */
  var G = form.darmGefaesse(), ln = function (g) { return { pts: g.pts, r0: g.r0, r1: g.r1 }; };
  [['arterien', G.darmarterien], ['venen', G.darmvenen], ['pfortader', G.pfortader]].forEach(function (a) {
    var geo = rohre(a[1].map(ln)); addMesh(a[0], geo, MAT[a[0]], STRUCT[a[0]].de, 4, 'hinten'); tris.rohre += anz(geo);
  });
  /* Lymphgefaesse mit den Staemmen, Lendenzisterne und Anfang des Milchbrustgangs */
  var L = form.darmLymphe();
  [['lymphe', L.lymphgefaesse], ['zisterne', [L.zisterne]], ['milchbrustgang', [L.milchbrustgang]]].forEach(function (a) {
    var geo = rohre(a[1].map(ln)); addMesh(a[0], geo, MAT[a[0]], STRUCT[a[0]].de, 4, 'hinten'); tris.rohre += anz(geo);
  });
  await setLoad(0.95, 'Beschriftung'); if (abgebaut) return;
  geoDaten = { G: G, L: L, gk: gk, kp: kp, du: du, dk: dk, Aduo: Aduo, RZ: RZ, B1: B1, B2: B2, B3: B3, B4: B4 };
  ankerBauen();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var zoWahl = null;               /* Stelle (Bogenlaenge s) fuer die Duenndarmzotte zur gewaehlten Struktur (Leerdarm, Krummdarm), sonst null */
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait, vor, auto } */
var wege = null, wegeT = null;   /* Ueben "Wege verfolgen" (siehe Abschnitt vor dem Antippen) */
var autoGehe = false;            /* gehe wird vom Ueben selbst gerufen: keine neue Aufgabe */
/* Strukturen, die im Ausschnitt vor dem geoeffneten Bereich liegen und dann ausgeblendet werden (sobald der Deckel zur Haelfte abgehoben ist); vom Krummdarm bleibt im Ausschnitt Blinddarm das Ende */
var WEG = [[], ['quer', 'aufsteigend', 'leerdarm', 'krummdarm', 'gekroese', 'arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang'], ['quer', 'aufsteigend', 'absteigend', 'blinddarm', 'wurmfortsatz', 'sigma', 'mastdarm', 'after', 'zwoelffinger', 'krummdarm', 'gekroese', 'arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang', 'papille'], ['quer', 'leerdarm', 'krummdarm', 'gekroese', 'arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang'],
  ['leerdarm', 'krummdarm', 'gekroese', 'arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang', 'absteigend', 'sigma']];
function verborgen(sid, ende, fern) {
  var r = AUSSCHNITTE[aktiv].reg;
  if (r === 0 || OPEN[r] <= 0.5) return false;
  if (r === 3 && fern) return true;   /* oberer Teil des aufsteigenden Dickdarms */
  return WEG[r].indexOf(sid) >= 0 && !(sid === 'krummdarm' && ende && r === 3);
}
var OPEN = [0, 0, 0, 0, 0], OZ = [0, 0, 0, 0, 0];   /* je Bereich: 1 = vordere Haelfte abgehoben, 0 = geschlossen; laeuft weich */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt: das Gekroese zaehlt nicht, die Haut bei Durchsicht auch nicht */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function irgendOffen() { return OZ.some(function (z) { return z > 0; }); }
function applyVisibility() {
  root.traverse(function (o) {
    if (!o.isMesh || o.userData.teilchen) return;   /* Teilchen stellen sich selbst (Stoffe-Schalter) */
    var u = o.userData, r = u.reg, ok = !!enabled[u.sid];
    if (u.kappe || u.schicht) ok = ok && OPEN[r] > 0.02;
    if (u.lumen) ok = ok && seeThrough && (!r || OPEN[r] <= 0.02);
    if (verborgen(u.sid, u.ende, u.fern)) ok = false;
    o.visible = ok;
  });
  lv++;
}
/* Glas (Durchsicht) der Haut und Ausblenden der Deckel; Material nur neu uebersetzen, wenn sich transparent oder side aendert */
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
/* Haut und Deckel: bei Durchsicht nur die Vorderseite (eine Glasschicht statt zwei), sonst beide Seiten (offene Schlaeuche werden von innen gesehen) */
function stelleHaut(m, glas, opacity) {
  var side = glas ? THREE.FrontSide : THREE.DoubleSide;
  if (m.side !== side) { m.side = side; m.needsUpdate = true; }
  stelleMat(m, glas, opacity);
}
function applyLook() {
  WAND.forEach(function (sid) { stelleHaut(MAT[sid], seeThrough, seeThrough ? GLAS : 1); });
  var r;
  for (r = 1; r <= 4; r++) {
    var a = 1 - sstep(0.25, 1, OPEN[r]), s = sstep(0, 1, OPEN[r]), d = REG[r].dir;
    REG[r].deckel.position.set(d[0] * DECKEL_WEG * s, d[1] * DECKEL_WEG * s, d[2] * DECKEL_WEG * s);
    REG[r].deckel.visible = a > 0.004;
    REG[r].deckel.traverse(function (o) { if (o.isMesh) o.visible = !!enabled[o.userData.sid]; });
  }
  DECK.forEach(function (sid) {
    var reg = { zwoelffinger: 1, leerdarm: 2, blinddarm: 3, aufsteigend: 3, mastdarm: 4, after: 4 }[sid], a2 = 1 - sstep(0.25, 1, OPEN[reg]);
    stelleHaut(MAT[sid + 'D'], seeThrough || a2 < 0.999, (seeThrough ? GLAS : 1) * a2);
  });
  stelleMat(MAT.gekroese, true, seeThrough ? 0.3 : 0.4);
  /* Venen und Lymphgefaesse bei Durchsicht halbdurchsichtig (die Teilchen treten durch ihre Wand), die Arterien bleiben undurchsichtig; beim Antippen zaehlen sie als dicht */
  DURCH_GEF.forEach(function (sid) { MAT[sid].userData.dicht = true; stelleMat(MAT[sid], seeThrough, seeThrough ? GEF_OP : 1); });
}
function setSelected(id, punkt) {
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
  zoWahl = id === 'leerdarm' || id === 'krummdarm' ? zoStelle(id, punkt) : null;
  $('iOpen').style.display = zoWahl !== null ? '' : 'none';   /* Knopf "Duenndarmzotte hier ansehen" nur bei Leerdarm und Krummdarm */
  if (!id) { box.classList.remove('show'); return; }
  if (!quiz && !wege) closeCard();                       /* die Infokarte ersetzt eine offene Hilfekarte; beim Ueben erscheint sie nicht */
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
/* Schleimhaut, Muskulatur, Papille und Klappe sind nur in einem geoeffneten Bereich oder bei Durchsicht zu sehen: wer sie in der Liste waehlt, bekommt den passenden Ausschnitt */
var IM_AUSSCHNITT = { schleimhaut: 2, muskulatur: 2, papille: 1, bauhin: 3 };
function waehleListe(id) {
  if (quiz || wege) return;
  if (id in IM_AUSSCHNITT && !irgendOffen() && !seeThrough) gehe(IM_AUSSCHNITT[id]);
  setSelected(id);
}

(function leiste() {
  /* Strukturen: nach Gruppen, Farbpunkt blendet die Struktur ein und aus */
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
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur am Darm und tippe sie an. Die Beschriftung verschwindet solange. Oder verfolge einen Weg: Tippe die Stationen der Reihe nach an.'; paneU.appendChild(iu);
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

function legNoteSetzen() {   /* die Notiz steht nur ohne Durchsicht und ohne geoeffneten Bereich */
  var n = $('legNote'), zeigen = !(seeThrough || irgendOffen());
  n.textContent = zeigen ? LEGNOTE : ''; n.style.display = zeigen ? '' : 'none';
  railHoehe(window.innerWidth);                          /* die Lesehilfe wird kuerzer oder laenger */
}
function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  legNoteSetzen();
  applyVisibility(); applyLook();
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
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var K3 = function (x, y, z) { return V(x - M[0], y - M[1], z - M[2]); };   /* Koerper-Koordinaten -> Modell */
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die Beschriftungsspalten freilassen; reg: geoeffneter Bereich (0 = keiner) */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb, reg: 0 },
  { name: 'Zwölffingerdarm', theta: -0.55, phi: 1.5, target: K3(-2, 99.5, 0), ext: [17, 15], halb: 8, reg: 1 },
  { name: 'Dünndarm', theta: 0, phi: 1.3, target: K3(4.7, 94.5, 10.0), ext: [14, 9], halb: 7, reg: 2 },
  { name: 'Blinddarm', theta: -0.7, phi: 1.5, target: K3(-10.2, 90.5, 2.9), ext: [14, 16], halb: 7, reg: 3 },
  { name: 'Mastdarm', theta: 1.5708, phi: 1.5, target: K3(0, 83.5, -3), ext: [14, 16], halb: 7, reg: 4 }
];
var view = { theta: AUSSCHNITTE[0].theta, phi: AUSSCHNITTE[0].phi, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 4, maxDist: 160 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer den Darm und die Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  for (k = 1; k <= 4; k++) OZ[k] = a.reg === k ? 1 : 0;   /* der Bereich des Ausschnitts wird geoeffnet, alle anderen schliessen sich */
  legNoteSetzen();
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
/* Ueben "Strukturen finden": "Tippe auf: ..." - alle Strukturen. Schleimhaut, Muskulatur, Papille, Bauhin-Klappe und After sind nur in bestimmten Ausschnitten zu sehen und anzutippen
   (NUR_INNEN), alle anderen nur in der Uebersicht (in einem geoeffneten Ausschnitt liegt die Schleimhaut vor den Waenden, Gekroese und Gefaesse sind dort ausgeblendet): wer sie
   wuerfelt, bekommt den passenden Ausschnitt (autoGehe); beim Beenden kehrt die Ansicht zurueck. Wechselt man den Ausschnitt selbst, gilt nur der Teil, der dort passt (bleibe).
   Math.random nur hier, bei der Auswahl der gesuchten Struktur (wie beim Magen). */
function quizAusschnitte(id) { return NUR_INNEN[id] || [0]; }
function quizPool(bleibe) {
  return ORDER.filter(function (s) {
    if (!s.meshes.length || !enabled[s.id]) return false;
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
  showCard('Üben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe den Darm, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizNeu(bleibe) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(bleibe); }
function uebenKlasse() { document.body.classList.toggle('ueben', !!(quiz || wege)); groesse(window.innerWidth, window.innerHeight); }   /* Handy: Karte unten, Bildbereich des Darms darueber */
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
/* Ueben "Wege verfolgen": die Stationen eines Weges (WEGE, Daten oben) der Reihe nach antippen. Die Abfolge kennt nur Stationen (Listen von Struktur-ids),
   Karte und Leuchten. Zustand wege: nr = Weg, st = naechste Station, n = erledigte Stationen, ok = davon auf Anhieb richtig, fehl = Fehler in Folge bei der gesuchten Station,
   liste = Namen der erledigten Stationen, fertig = Weg abgeschlossen. Waehrend der Wege ist die Wand durchsichtig (Wandbereiche, Gekroese und Schleimhaut liegen im selben Strahl:
   der Treffer zaehlt, was davor steht, steht in durch) und die Uebersicht gewaehlt; nur Papille und Bauhin-Klappe liegen innen: fuer sie wechselt der Weg in den Ausschnitt
   Zwoelffingerdarm bzw. Blinddarm (Station an) und danach zurueck in die Uebersicht. Beim Beenden kehrt alles zurueck. */
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
  wegeAnsicht();
  wegeZeigen();
}
function wegeStart() {
  if (quiz) quizEnd();
  setSelected(null);
  wege = { nr: 0, st: 0, n: 0, ok: 0, fehl: 0, liste: [], fertig: false, text: null, leucht: [], vorher: { mahlzeit: mahlzeit, durch: seeThrough, aktiv: aktiv } };
  durchsicht(true);                                      /* die Wand glaesern: die Stationen liegen im selben Strahl */
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Gekroese, Haut bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function trefferAn(cx, cy) {   /* Bildschirmpunkt -> { treffer, weich, durch } (durch: Strukturen bis zum ersten undurchsichtigen Treffer, fuer das Ueben) */
  var r = canvas.getBoundingClientRect();
  ndc.x = ((cx - r.left) / r.width) * 2 - 1;
  ndc.y = -((cy - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, durch = [], punkt = null, pw = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    durch.push(sid);
    if (weichMat(o)) { if (!weich) { weich = sid; pw = hits[i].point; } }
    else { treffer = sid; punkt = hits[i].point; }
  }
  return { treffer: treffer, weich: weich, durch: durch, punkt: treffer ? punkt : pw };   /* punkt: Trefferpunkt (Welt) des gewaehlten Netzes, fuer die Duenndarmzotte */
}
function canvasKlick(e) {
  if (orbit.dragged) return;
  var t = trefferAn(e.clientX, e.clientY), durch = t.durch;
  /* Beim Ueben nennt die Rueckmeldung bei Durchsicht den Bereich der Wand statt der Schleimhaut dahinter (die Schleimhaut zaehlt trotzdem, sie steht in durch) */
  var name = t.treffer || t.weich || null;
  if (name === 'schleimhaut') for (var k = 0; k < durch.length; k++) if (WAND.indexOf(durch[k]) >= 0) { name = durch[k]; break; }
  if (wege) { wegeAntwort(name, durch); return; }
  if (quiz) { quizAntwort(name, durch); return; }
  setSelected(t.treffer || t.weich || null, t.punkt);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Kandidaten fuer den Ankerpunkt je Struktur (Koerper-Koordinaten); je Ausschnitt nach der Blickrichtung sortiert (vorn zuerst), sichtPruefen waehlt in der ruhenden Ansicht den
   ersten sichtbaren. Die Punkte liegen auf den Mittellinien (innerhalb der Struktur: Netze derselben Struktur verdecken sie nicht). */
function ankerBauen() {
  var D = geoDaten, kp = D.kp, dk = D.dk, AB = dk.abschnitte, Adk = dk.achse, du = D.du, Adu = du.achse, A = ANKER;
  var linie = function (l, fs) { return fs.map(function (f) { return l.pts[Math.min(l.pts.length - 1, Math.round(f * (l.pts.length - 1)))]; }); };
  var nahe = function (id, list) { return list.filter(function (l) { return l.id === id; })[0]; };
  A.zwoelffinger = achsenPunkte(D.Aduo, 0, D.Aduo.laenge, 14);
  A.papille = [[kp.PAPILLE.p[0] + kp.PAPILLE.richtung[0] * 0.5, kp.PAPILLE.p[1] + kp.PAPILLE.richtung[1] * 0.5, kp.PAPILLE.p[2] + kp.PAPILLE.richtung[2] * 0.5]];
  A.leerdarm = achsenPunkte(Adu, 0, du.leerEnde, 36);
  A.schleimhaut = A.leerdarm;   /* in der Uebersicht bei Durchsicht: im Inneren des Duenndarms */
  A.krummdarm = achsenPunkte(Adu, du.leerEnde, du.laenge, 36);
  var kl = D.RZ[3].klappe;
  A.bauhin = [[(kl.p0[0] + kl.p1[0]) / 2, (kl.p0[1] + kl.p1[1]) / 2, (kl.p0[2] + kl.p1[2]) / 2]];
  A.blinddarm = achsenPunkte(Adk, 0.5, AB.blinddarm[1] - 0.3, 6);
  A.wurmfortsatz = [[-10.04, 84.3, 4.86], [-8.03, 82.34, 5.72], [-7.31, 81.67, 6.01]];
  A.aufsteigend = achsenPunkte(Adk, AB.aufsteigend[0] + 1, AB.aufsteigend[1] - 1, 12);
  A.quer = achsenPunkte(Adk, AB.quer[0] + 2, AB.quer[1] - 2, 20);
  A.absteigend = achsenPunkte(Adk, AB.absteigend[0] + 1, AB.absteigend[1] - 1, 8);
  A.sigma = achsenPunkte(Adk, AB.sigma[0] + 1, AB.sigma[1] - 1, 14);
  A.mastdarm = achsenPunkte(Adk, AB.mastdarm[0] + 1, AB.mastdarm[1] - 1, 8);
  A.after = achsenPunkte(Adk, AB.analkanal[0] + 0.5, Adk.laenge - 0.5, 3);
  A.gekroese = [0.3, 0.5, 0.7].map(function (f) { var u = Math.round(f * (D.gk.nu - 1)); return D.gk.pts[u * (D.gk.nv + 1) + 3]; });
  A.arterien = linie(nahe('mesenterica-superior', D.G.darmarterien), [0.3, 0.7]).concat(linie(nahe('mesenterica-inferior', D.G.darmarterien), [0.4, 0.7]), linie(nahe('darmast-4', D.G.darmarterien), [0.5, 0.8]));
  A.venen = linie(nahe('mesenterica-superior-vene', D.G.darmvenen), [0.3, 0.7]).concat(linie(nahe('mesenterica-inferior-vene', D.G.darmvenen), [0.4, 0.7]), linie(nahe('darmvene-6', D.G.darmvenen), [0.5]));
  A.pfortader = linie(D.G.pfortader[0], [0.5, 1]).concat(linie(D.G.pfortader[2], [0.5]));
  A.lymphe = linie(nahe('lymphe-6', D.L.lymphgefaesse), [0.5]).concat(linie(nahe('lymphe-3', D.L.lymphgefaesse), [0.5]), linie(nahe('lymphe-9', D.L.lymphgefaesse), [0.5]));
  A.zisterne = linie(D.L.zisterne, [0.5]);
  A.milchbrustgang = linie(D.L.milchbrustgang, [0.6]);
  /* Schleimhaut und Muskulatur: Punkt der Netze im geoeffneten Bereich, der einem Zielpunkt am naechsten liegt (Koerper-Koordinaten) */
  var punktAus = function (meshes, ziel) {
    var b = null, bd = 1e30;
    meshes.forEach(function (m) {
      var p = m.geometry.attributes.position.array;
      for (var k = 0; k < p.length; k += 3) {
        var d = Math.pow(p[k] - ziel[0], 2) + Math.pow(p[k + 1] - ziel[1], 2) + Math.pow(p[k + 2] - ziel[2], 2);
        if (d < bd) { bd = d; b = [p[k], p[k + 1], p[k + 2]]; }
      }
    });
    return b;
  };
  var mitte = [null, D.RZ[1].mitte, D.RZ[2].mitte, D.RZ[3].mitte, D.RZ[4].mitte];
  A.reg = [null];
  [1, 2, 3, 4].forEach(function (r) {
    var mu = kappen.filter(function (m) { return m.userData.reg === r && m.userData.sid === 'muskulatur'; });
    var sc = schichten.filter(function (m) { return m.userData.reg === r && m.userData.sid === 'schleimhaut'; });
    var c = mitte[r], o = { muskulatur: [], schleimhaut: [] };
    [[0, 0.8, -0.5], [0.7, -0.6, 0.6], [-0.7, 0.6, 0.2], [0.4, 1.2, 0.8]].forEach(function (d) {
      var z = [c[0] + d[0] * 2, c[1] + d[1] * 2, c[2] + d[2] * 2], p = mu.length ? punktAus(mu, z) : null, q = sc.length ? punktAus(sc, z) : null;
      if (p) o.muskulatur.push(p);
      if (q) o.schleimhaut.push(q);
    });
    A.reg.push(o);
  });
}
var KAND_CACHE = {};
function kand(i, id) {
  if (!geoDaten) return [];   /* vor dem Ende des Aufbaus */
  var key = i + '|' + id;
  if (KAND_CACHE[key]) return KAND_CACHE[key];
  var pts = (id === 'schleimhaut' || id === 'muskulatur') && i > 0 ? ANKER.reg[AUSSCHNITTE[i].reg][id] : (ANKER[id] || []);   /* Ausschnitt 0: nur die Schleimhaut bei Durchsicht */
  var a = AUSSCHNITTE[i], sp = Math.sin(a.phi), blick = [sp * Math.sin(a.theta), Math.cos(a.phi), sp * Math.cos(a.theta)];   /* Richtung Koerper -> Kamera */
  var l = pts.filter(Boolean).map(function (p) { return { p: p, d: p[0] * blick[0] + p[1] * blick[1] + p[2] * blick[2] }; });
  l.sort(function (p, q) { return q.d - p.d; });
  // mehrere Kandidaten, vorn zuerst; bei sehr vielen werden die vordersten Punkte ausgeduennt (nicht alle liegen dicht beisammen)
  var out = [];
  l.forEach(function (e, k) { if (l.length <= 8 || k % Math.ceil(l.length / 8) === 0) out.push(K3(e.p[0], e.p[1], e.p[2])); });
  KAND_CACHE[key] = out;
  return out;
}
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, vor dem kein undurchsichtiges
   Netz einer anderen Struktur liegt; sonst keine Beschriftung. Waehrend der Bewegung bleibt die letzte Wahl. */
var sKey = '', sT = 0, sOk = true, sichtVer = 0, VIS = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
var rayS = new THREE.Raycaster(), dirS = new THREE.Vector3();
/* Ein Strahl von der Kamera zum Punkt: liegt vor ihm ein undurchsichtiges Netz einer anderen Struktur? */
function strahlFrei(id, p) {
  dirS.copy(p).sub(camera.position); var d = dirS.length(); dirS.normalize();
  rayS.set(camera.position, dirS); rayS.far = d;
  var hits = rayS.intersectObjects(root.children, true);
  for (var i = 0; i < hits.length; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || sid === id || !sichtbar(o) || !enabled[sid] || weichMat(o) || o.userData.lumen) continue;   /* die einfache Innenflaeche (nur bei Durchsicht) verdeckt nichts */
    if (hits[i].distance < d - 0.3) return false;
  }
  return true;
}
/* Der Mittelpunkt allein genuegt nicht: in dem dichten Knaeuel des Duenndarms laesst eine schmale Luecke zwischen zwei Schlingen den Strahl zum Anker durch, obwohl die Struktur
   dort verdeckt ist. Darum muessen auch vier Nachbarstrahlen (0,15 cm seitlich und oben/unten, quer zur Blickrichtung) frei sein. */
var nbR = new THREE.Vector3(), nbU = new THREE.Vector3(), nbP = new THREE.Vector3();
function frei(id, p) {
  if (!strahlFrei(id, p)) return false;
  nbR.setFromMatrixColumn(camera.matrixWorld, 0); nbU.setFromMatrixColumn(camera.matrixWorld, 1);
  var o = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var k = 0; k < 4; k++) {
    nbP.copy(p).addScaledVector(nbR, 0.15 * o[k][0]).addScaledVector(nbU, 0.15 * o[k][1]);
    if (!strahlFrei(id, nbP)) return false;
  }
  return true;
}
function offenFertig() { for (var k = 1; k <= 4; k++) if (OPEN[k] !== OZ[k]) return false; return true; }
function sichtPruefen(now, w, h) {
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || !offenFertig() || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  beschriftet().forEach(function (id) {
    if (!enabled[id] || verborgen(id)) return;
    var c = kand(aktiv, id), i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = i; break; }
  });
  sichtVer++;
}
var KURZ = {};   /* kuerzere Namen, damit die Beschriftung in die Spalte passt */
var HANDYNAME = { zwoelffinger: 'Zwölffinger-darm', aufsteigend: 'Aufsteig. Dickdarm', quer: 'Querer Dickdarm', absteigend: 'Absteig. Dickdarm', after: 'After', arterien: 'Darmarterien', venen: 'Darmvenen', lymphe: 'Lymphgefäße', wurmfortsatz: 'Wurmfortsatz', schleimhaut: 'Schleimhaut', muskulatur: 'Muskulatur' };
var HANDY_GROSS = ['zwoelffinger', 'leerdarm', 'krummdarm', 'blinddarm', 'aufsteigend', 'quer', 'absteigend', 'sigma', 'mastdarm'];   /* Handy, Uebersicht: nur diese werden beschriftet */
/* je Ausschnitt: Strukturen in der Beschriftung (was in der Ansicht nicht zu sehen ist, steht nicht darin) */
var LISTEN = [
  ['zwoelffinger', 'leerdarm', 'krummdarm', 'blinddarm', 'wurmfortsatz', 'aufsteigend', 'quer', 'absteigend', 'sigma', 'mastdarm', 'after', 'gekroese', 'arterien', 'venen', 'pfortader', 'lymphe', 'zisterne', 'milchbrustgang'],
  ['papille', 'schleimhaut', 'muskulatur', 'zwoelffinger', 'leerdarm', 'pfortader', 'arterien', 'venen', 'quer'],
  ['schleimhaut', 'muskulatur', 'leerdarm', 'krummdarm', 'gekroese', 'arterien', 'venen', 'quer'],
  ['bauhin', 'schleimhaut', 'muskulatur', 'blinddarm', 'wurmfortsatz', 'aufsteigend', 'krummdarm', 'arterien', 'venen'],
  ['schleimhaut', 'muskulatur', 'mastdarm', 'after', 'sigma']
];
/* Strukturen der Beschriftung in der aktuellen Ansicht: in der Uebersicht bei Durchsicht nur die Hauptabschnitte (sonst zu viele Schilder, die Linien kreuzen sich) */
function beschriftet() { return aktiv === 0 && seeThrough ? HANDY_GROSS : LISTEN[aktiv]; }
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
  var botL = narrow ? r.y1 - 6 : h - 58, botR = botL;
  var unten = $('info').classList.contains('show');   /* Infokarte unten links: Beschriftung links darueber */
  if (!narrow && unten) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt den Darm, ohne Beschriftung bleibt sie frei; bei einer Hilfekarte und beim Ueben keine Beschriftung */
    beschriftet().forEach(function (id) {
      if (!enabled[id] || verborgen(id)) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen, die Namen stehen dann neben dem Modell */
      var kc = kand(aktiv, id), an = kc[id in VIS ? VIS[id] : 0];   /* VIS: Nummer des gewaehlten Kandidaten (null = verdeckt) */
      if (!an) return;
      pv.copy(an).project(camera);   /* ANKER liegen schon im Raum der Szene (Koerper-Koordinaten minus M) */
      if (pv.z > 1) return;
      var psx = (pv.x * 0.5 + 0.5) * w, psy = (-pv.y * 0.5 + 0.5) * h;
      if (psx < r.x0 || psx > r.x1 || psy < r.y0 - 20 || psy > r.y1 + 20) return;   /* Anker ausserhalb des freien Bereichs: keine Beschriftung */
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
    var bw = b.el.offsetWidth; lx = it.side === 'l' ? Math.max(lx, bw + 8) : Math.min(lx, w - bw - 10);   /* nicht ueber den Bildrand hinaus */
    b.el.style.left = lx + 'px'; b.el.style.top = it.ly + 'px';
    b.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    b.ln.setAttribute('points', it.sx + ',' + it.sy + ' ' + (ex + (it.side === 'l' ? 16 : -16)) + ',' + it.ly + ' ' + ex + ',' + it.ly);
    b.dot.setAttribute('cx', it.sx); b.dot.setAttribute('cy', it.sy);
  });
}

/* =====================================================================
   6. Stroemung: Kohlenhydrate (gelb), Eiweiss (orange), Fett (weiss), Wasser (hellblau), Galle (gruen), Pankreassaft (blassviolett) und Stuhl (braun) als Teilchen,
   dazu der Mahlzeit-Schalter. Symbolisch, nicht massstaeblich, die Zeit ist stark gerafft. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des
   Teilchens: kein Zufall, die Zahl der Teilchen steht beim Aufbau fest. Je Art ein InstancedMesh. Der Weg aller Teilchen ist eine Folge von Messpunkten (Abstand 0,15 cm)
   entlang der Mittellinien von Zwoelffingerdarm, Duenndarm (Leerdarm, Krummdarm) und Dickdarm (ab der Bauhin-Klappe bis zum Ende des Mastdarms); je Messpunkt stehen Lage,
   Begleitdreibein und der freie Radius bis zur Schleimhaut in 16 Richtungen in einer Tabelle (aus den Schichten der Form, samt Ringfalten). Ein Teilchen sitzt bei der
   Wegstelle x (cm), im Winkel phi und mit dem Abstand rho (0..1) des freien Radius - es bleibt so im Innenraum, auch an den Ringfalten.
   Nach dem Essen (Zeit te seit dem Wechsel, Zyklus P = 170 s): der Speisebrei kommt in Portionen am Anfang des Zwoelffingerdarms an (Wasser zuerst, Fett zuletzt), Galle und
   Pankreassaft fliessen an der Papille zu. Im Duenndarm pendeln die Teilchen hin und her (Mischbewegung) und rueckeln weiter; Kohlenhydrate, Eiweiss und Fett werden
   gestaffelt aufgenommen (sie werden kleiner und wandern zur Wand), das meiste im Leerdarm; Wasser vor allem im Duenndarm, ein Rest im Dickdarm; Galle am Ende des Krummdarms
   (die Gallensaeuren), Pankreassaft im Leerdarm. Im Dickdarm entsteht der Stuhl: Teilchen werden dunkler, groesser, sind langsamer und sammeln sich im Mastdarm. Am Ende des
   Zyklus loest sich der gesammelte Stuhl auf. Nuechtern: kaum Inhalt, ein paar Reste (Wasser) werden von einer schwachen Welle weitergeschoben, wenige Tropfen Galle und
   Pankreassaft, im Dickdarm etwas Stuhl. Pause haelt alles an; der Wechsel nuechtern <-> nach dem Essen blendet in Echtzeit ein bzw. aus.
   ===================================================================== */
var playing = true, speed = 1, clock = 0, tM = 0, mahlzeit = false, fzR = 0, fe = 0, fzFest = false;   /* tM: Uhrzeit des Wechsels zu "nach dem Essen"; fzR: Uebergang roh 0..1, fe: weich */
var SZ_ = { UEBERG: 1.5, P: 150, DS: 0.15, AW: 12, TAU: 5.5, VS: 2.6, TRICKLE: 60, TWV: 48, VW: 7, DW: 28, KW: 6,
  UT: 1.2, GV: 1.6, GMAX: 6, ST0: 18, ST1: 4, STD: 7, STV: 5, NACH: 2 };   /* Aufnahme: UT Uebertritt in das Gefaess (s), GV Tempo im Gefaess (cm/s), GMAX Weg in Dickdarmvenen (cm); Stuhl am After: Fenster P-ST0 .. P-ST1, STD Dauer, STV Staffelung (s), NACH cm hinter dem After */
var R2A = 0.7548776662466927, R2B = 0.5698402909980532;   /* Plastikzahl-Folge (R2): gleichmaessig verteilte Paare aus dem Index */
function bruch(v) { return v - Math.floor(v); }
/* Arten: e = Fenster der Ankunftszeiten (s nach dem Essen), xa = Bereich der Aufnahme (cm ab Anfang des Duenndarms), tsc = Tempo, nR = die ersten nR Teilchen sind die Ruhe-Teilchen (nuechtern) */
var KINDS = [
  { id: 'kh', name: 'Kohlenhydrate', col: 0xE6C94A, em: 0x7A5F10, n: 80, rad: 0.115, e: [2, 17], xa: [14, 100], tsc: 1.0, btn: 'bKh', nR: 0 },
  { id: 'eiweiss', name: 'Eiweiß', col: 0xF09A3E, em: 0x7A3A08, n: 72, rad: 0.135, e: [3.5, 20], xa: [20, 125], tsc: 0.96, btn: 'bEiw', nR: 0 },
  { id: 'fett', name: 'Fett', col: 0xF2F2EE, em: 0x66665F, n: 56, rad: 0.13, e: [8, 28], xa: [30, 185], tsc: 0.9, btn: 'bFett', nR: 0 },
  { id: 'wasser', name: 'Wasser', col: 0x8FD0F0, em: 0x1F5A86, n: 96, rad: 0.10, e: [0.5, 12], xa: [18, 262], tsc: 1.12, btn: 'bWasser', nR: 10 },
  { id: 'galle', name: 'Galle', col: 0x7CC66E, em: 0x2E5A28, n: 44, rad: 0.125, e: [1.5, 25], xa: [0.78, 0.97], tsc: 1.0, nR: 3 },
  { id: 'pank', name: 'Pankreassaft', col: 0xC9B6E6, em: 0x4A3A78, n: 44, rad: 0.12, e: [1.5, 25], xa: [20, 120], tsc: 1.0, nR: 3 },
  { id: 'stuhl', name: 'Stuhl', col: 0xFFFFFF, em: 0x2A1A0C, n: 84, rad: 0.12, nR: 34 }
];
var KI = { kh: 0, eiweiss: 1, fett: 2, wasser: 3, galle: 4, pank: 5, stuhl: 6 };
var kindOn = [true, true, true, true, true, true, true];
var STUHL_C0 = srgb(0xC9A15B), STUHL_C1 = srgb(0x6E4222);   /* hellbraun am Anfang des Dickdarms, dunkelbraun im Mastdarm */
var ST = null, WG = null, TT = null, WGX = null, STM = new THREE.Matrix4(), SQ = { x: 0, y: 0, z: 0, rmax: 1 }, LB = { st: 0, x: 0, r: 0, rho: 0, phi: 0, tip: 0, c: 0, tl: 0, g: 0, gf: 0, gx: 0, gy: 0, gz: 0, rs: -1, xs: 0 }, GT = { x: 0, y: 0, z: 0, rmax: 1 }, GP = { x: 0, y: 0, z: 0 }, GFL = null;

/* ---- Weg: Messpunkte, Zeittabelle ---- */
function wegBauen() {
  var D = geoDaten, du = D.du, dk = D.dk, AB = dk.abschnitte, Aduo = D.Aduo, Adu = du.achse, Adk = dk.achse, RZ = D.RZ, NP = 16, TWO = 2 * PI, DSW = SZ_.DS;
  var Lduo = Aduo.laenge, DUO_R = form.BAHN.duodenum.r, DU_R = form.DUENN_R;
  var bDuo = RZ[1].def.schichten[2].b, bDu = RZ[2].def.schichten[2].b, bMast = RZ[4].def.schichten[4].b;
  var sB = AB.blinddarm[1], sE = AB.analkanal[0] - 1.2, sM = AB.mastdarm[0];
  var pa = Adu.punkt(du.laenge), pb = Adk.punkt(sB), cn = Math.max(0.6, Math.sqrt(Math.pow(pa[0] - pb[0], 2) + Math.pow(pa[1] - pb[1], 2) + Math.pow(pa[2] - pb[2], 2)));
  var X = { d1: Lduo, u0: Lduo, u1: Lduo + du.laenge, c0: Lduo + du.laenge + cn, sB: sB, sM: sM, leer: Lduo + du.leerEnde };
  X.e = X.c0 + (sE - sB);
  /* Abschnitte des Weges und ihre Strukturen (wie die Haut in bauen): ist eine Struktur im Ausschnitt ausgeblendet, zeigt ihr Inhalt sich auch nicht */
  X.seg = [{ x0: 0, sid: 'zwoelffinger' }, { x0: X.u0, sid: 'leerdarm' }, { x0: X.leer, sid: 'krummdarm' }, { x0: X.u1 - 7, sid: 'krummdarm', ende: true },
    { x0: X.c0, sid: 'aufsteigend' }, { x0: X.c0 + 7.5, sid: 'aufsteigend', fern: true }, { x0: X.c0 + AB.aufsteigend[1] - sB, sid: 'quer' }, { x0: X.c0 + AB.absteigend[0] - sB, sid: 'absteigend' },
    { x0: X.c0 + AB.sigma[0] - sB, sid: 'sigma' }, { x0: X.c0 + sM - sB, sid: 'mastdarm' }];
  var n = Math.ceil(X.e / DSW) + 2, C = new Float32Array(n * 3), N = new Float32Array(n * 3), B = new Float32Array(n * 3), F = new Float32Array(n * NP), k, j, kA = -1, kB = -1;
  function frei(sec, s, phi) {
    if (sec === 0) return DUO_R + (DU_R - DUO_R) * sstep(Lduo - 1.4, Lduo, s) - bDuo(s, phi);
    if (sec === 1) return DU_R - bDu(s, phi);
    return dk.R(s, phi) - (s >= sM ? bMast(s, phi) : 0.72);
  }
  for (k = 0; k < n; k++) {
    var x = k * DSW, sec, A, s;
    if (x < X.u0) { sec = 0; A = Aduo; s = x; } else if (x <= X.u1) { sec = 1; A = Adu; s = x - X.u0; } else if (x < X.c0) { sec = -1; } else { sec = 2; A = Adk; s = sB + (x - X.c0); }
    if (sec < 0) continue;
    if (sec === 1) kA = k; if (sec === 2 && kB < 0) kB = k;
    var fr = rahmen(A, s);
    C[k * 3] = fr.x; C[k * 3 + 1] = fr.y; C[k * 3 + 2] = fr.z; N[k * 3] = fr.nx; N[k * 3 + 1] = fr.ny; N[k * 3 + 2] = fr.nz; B[k * 3] = fr.bx; B[k * 3 + 1] = fr.by; B[k * 3 + 2] = fr.bz;
    for (j = 0; j < NP; j++) F[k * NP + j] = Math.max(0, frei(sec, s, TWO * j / NP));
  }
  if (kB < 0) kB = n - 1;
  for (k = kA + 1; k < kB; k++) {   /* Verbindung Krummdarm - Dickdarm (Bauhin-Klappe): linear */
    var t = (k - kA) / (kB - kA), q;
    for (q = 0; q < 3; q++) { C[k * 3 + q] = C[kA * 3 + q] + (C[kB * 3 + q] - C[kA * 3 + q]) * t; N[k * 3 + q] = N[kA * 3 + q] + (N[kB * 3 + q] - N[kA * 3 + q]) * t; B[k * 3 + q] = B[kA * 3 + q] + (B[kB * 3 + q] - B[kA * 3 + q]) * t; }
    for (j = 0; j < NP; j++) F[k * NP + j] = F[kA * NP + j] + (F[kB * NP + j] - F[kA * NP + j]) * t;
  }
  WG = { ds: DSW, n: n, NP: NP, C: C, N: N, B: B, F: F, kA: kA, kB: kB };
  /* Analkanal hinter dem Ende der Wegtabelle (nur fuer den Stuhl am After): kleinster freier Radius bis zur Schleimhaut je 0,1 cm ab sE */
  var nK = Math.max(2, Math.ceil((Adk.laenge - sE) / 0.1) + 1), KF = new Float32Array(nK);
  for (k = 0; k < nK; k++) { var mn = 1e9, sk = Math.min(Adk.laenge, sE + k * 0.1); for (j = 0; j < 8; j++) mn = Math.min(mn, frei(2, sk, TWO * j / 8)); KF[k] = Math.max(0, mn); }
  WG.kf = KF; WG.sE = sE; WG.pEnd = X.e + (Adk.laenge - sE) + SZ_.NACH;
  WGX = X;
  /* Zeit, die ein Teilchen vom Anfang bis zur Stelle x braucht (Tempo je Abschnitt in cm/s) */
  var V = { duo: 5.0, leer: 5.6, krumm: 6.4, conn: 2.5, kolon: 2.0 };
  TT = new Float32Array(n);
  for (k = 1; k < n; k++) {
    var xm = (k - 0.5) * DSW, v = xm < X.d1 ? V.duo : xm < X.leer ? V.leer : xm < X.u1 ? V.krumm : xm < X.c0 ? V.conn : V.kolon;
    TT[k] = TT[k - 1] + DSW / v;
  }
}
function xVonT(t) {   /* Wegstelle (cm) nach der Zeit t */
  var n = WG.n, lo = 0, hi = n - 1;
  if (t <= 0) return 0;
  if (t >= TT[n - 1]) return (n - 1) * WG.ds;
  while (hi - lo > 1) { var m = (lo + hi) >> 1; if (TT[m] <= t) lo = m; else hi = m; }
  return (lo + (t - TT[lo]) / (TT[hi] - TT[lo])) * WG.ds;
}
function tVonX(x) { var u = Math.max(0, Math.min(WG.n - 1.001, x / WG.ds)), i = Math.floor(u); return TT[i] + (TT[i + 1] - TT[i]) * (u - i); }
/* Punkt bei Wegstelle x, Winkel phi, Abstand rho (Bruchteil des freien Radius abzueglich Teilchenradius rad und Rand) -> SQ */
function wegPunkt(x, phi, rho, rad, out) {
  var NP = WG.NP, u = Math.max(0, Math.min(WG.n - 1.001, x / WG.ds)), i0 = Math.floor(u), t = u - i0, i1 = i0 + 1, C = WG.C, N = WG.N, B = WG.B, F = WG.F;
  var jj = (phi / (2 * PI)) * NP; jj -= Math.floor(jj / NP) * NP;
  var j0 = Math.floor(jj) % NP, j1 = (j0 + 1) % NP;
  var fr = Math.min(F[i0 * NP + j0], F[i0 * NP + j1], F[i1 * NP + j0], F[i1 * NP + j1]);   /* der kleinste der vier Nachbarwerte: kein Ausreissen an Falten */
  var off = rho * Math.max(0, fr - rad - 0.05), ca = Math.cos(phi) * off, sa = Math.sin(phi) * off, q;
  var cx = C[i0 * 3] + (C[i1 * 3] - C[i0 * 3]) * t, cy = C[i0 * 3 + 1] + (C[i1 * 3 + 1] - C[i0 * 3 + 1]) * t, cz = C[i0 * 3 + 2] + (C[i1 * 3 + 2] - C[i0 * 3 + 2]) * t;
  var nx = N[i0 * 3] + (N[i1 * 3] - N[i0 * 3]) * t, ny = N[i0 * 3 + 1] + (N[i1 * 3 + 1] - N[i0 * 3 + 1]) * t, nz = N[i0 * 3 + 2] + (N[i1 * 3 + 2] - N[i0 * 3 + 2]) * t;
  var bx = B[i0 * 3] + (B[i1 * 3] - B[i0 * 3]) * t, by = B[i0 * 3 + 1] + (B[i1 * 3 + 1] - B[i0 * 3 + 1]) * t, bz = B[i0 * 3 + 2] + (B[i1 * 3 + 2] - B[i0 * 3 + 2]) * t;
  out.x = cx + nx * ca + bx * sa; out.y = cy + ny * ca + by * sa; out.z = cz + nz * ca + bz * sa;
  out.rmax = fr * 0.8;   /* groesster Teilchenradius an dieser Stelle (an hohen Ringfalten ist der Innenraum schmal) */
  return out;
}
/* Mischbewegung: Hin- und Herpendeln um die Wegstelle (Amplitude in cm) */
function pendel(x, pz, c) {   /* c: Uhr (Standard clock) */
  var X = WGX, amp = 0.5 * (1 - sstep(X.d1 - 1, X.d1, x)) * sstep(0, 3, x) + 2.4 * sstep(X.u0, X.u0 + 6, x) * (1 - sstep(X.u1 - 6, X.u1, x)) + 0.8 * sstep(X.c0, X.c0 + 4, x);
  return amp * Math.sin(2 * PI * ((c === undefined ? clock : c) / SZ_.TAU + pz));
}
/* ---- Gefaesse, in die Nahrungsbestandteile uebertreten (Aufnahme ins Blut und in die Lymphe) ----
   Linienzuege wie die Netze der Gefaesse (Catmull-Rom-Kurve der Form, dieselbe Kurve wie in rohre) mit Bogenlaenge; gleiche Verfahren wie polyMit/polyBei in zotte.js. */
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
function polyNah(pf, w) {   /* naechster Punkt des Linienzugs zu w: { d, s, x, y, z } */
  var best = { d: 1e30, s: 0, x: 0, y: 0, z: 0 }, i;
  for (i = 0; i < pf.p.length - 1; i++) {
    var a = pf.p[i], b = pf.p[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], l2 = vx * vx + vy * vy + vz * vz;
    var t = l2 > 1e-12 ? Math.max(0, Math.min(1, ((w[0] - a[0]) * vx + (w[1] - a[1]) * vy + (w[2] - a[2]) * vz) / l2)) : 0;
    var qx = a[0] + vx * t, qy = a[1] + vy * t, qz = a[2] + vz * t, d = Math.sqrt(Math.pow(w[0] - qx, 2) + Math.pow(w[1] - qy, 2) + Math.pow(w[2] - qz, 2));
    if (d < best.d) { best.d = d; best.s = pf.cum[i] + (pf.cum[i + 1] - pf.cum[i]) * t; best.x = qx; best.y = qy; best.z = qz; }
  }
  return best;
}
function gefaessRadius(g, s) { var t = Math.max(0, Math.min(1, s / g.pm.L)); return g.r0 + (g.r1 - g.r0) * t * t * (3 - 2 * t); }   /* wie der Radius in rohre */
var DICKDARMVENEN = ['ileocolica-vene', 'colica-dextra-vene', 'colica-media-vene', 'colica-sinistra-vene', 'sigmoideae-vene', 'mesenterica-inferior-vene'];
function gefaessListen() {
  var G = geoDaten.G, L = geoDaten.L;
  function lin(g) { return { id: g.id, pm: polyMit(form.kurve(g.pts, 8)), r0: g.r0, r1: g.r1 }; }
  return {
    dv: G.darmvenen.filter(function (g) { return /^darmvene-\d+$/.test(g.id); }).map(lin),
    dc: G.darmvenen.filter(function (g) { return DICKDARMVENEN.indexOf(g.id) >= 0; }).map(lin),
    ly: L.lymphgefaesse.filter(function (g) { return /^lymphe-\d+$/.test(g.id); }).map(lin)
  };
}
/* Teilchen: feste Eigenschaften je Index */
function teilchenDaten() {
  var X = WGX, Ldu = X.u1 - X.u0, kp = geoDaten.kp, Aduo = geoDaten.Aduo, dk = geoDaten.dk, AB = dk.abschnitte;
  var sP = Aduo.von(kp.PAPILLE.p);
  WG.xP = sP; GFL = gefaessListen();
  WG.tip = [kp.PAPILLE.p[0] + kp.PAPILLE.richtung[0] * 0.75, kp.PAPILLE.p[1] + kp.PAPILLE.richtung[1] * 0.75, kp.PAPILLE.p[2] + kp.PAPILLE.richtung[2] * 0.75];
  KINDS.forEach(function (K, ki) {
    var n = K.n, i;
    K.es = []; K.ts = []; K.xaa = []; K.pz = []; K.phi0 = []; K.rho = []; K.rs = []; K.xr = []; K.xt = [];
    for (i = 0; i < n; i++) {
      var q = bruch(0.5 + i * R2A + ki * 0.37), ph = bruch(0.1 + i * R2B + ki * 0.21), w = bruch(0.3 + i * 0.6180339887 + ki * 0.11), v = bruch(0.7 + i * R2A * 1.7 + ki * 0.29), u = bruch(0.2 + i * 0.3247 + ki * 0.17);
      K.pz.push(ph); K.phi0.push(2 * PI * bruch(0.2 + i * R2B + ki * 0.13)); K.rho.push(Math.sqrt(w) * 0.9); K.rs.push(0.85 + 0.3 * bruch(i * 0.37 + ki));
      K.ts.push((K.tsc || 1) * (0.94 + 0.12 * v));
      var e = 0, xa = 1e9, xr = 0, xt = 0;
      if (ki === KI.stuhl) {
        if (i < K.nR) xr = X.c0 + (AB.quer[0] + 10 - X.sB) + (X.e - X.c0 - (AB.quer[0] + 10 - X.sB) - 2) * (0.25 + 0.75 * Math.pow(q, 0.7));   /* Ruhe-Stuhl: quer bis Mastdarm, mehr im Mastdarm */
        else { e = 55 + 23 * q; xt = X.e - 0.8 - 14 * u; }
      } else if (i >= K.nR) {
        e = K.e[0] + (K.e[1] - K.e[0]) * (Math.floor(q * (ki >= KI.galle ? 3 : 5)) / (ki >= KI.galle ? 3 : 5) + (ki >= KI.galle ? 0.28 : 0.15) * w);
        if (ki === KI.galle) xa = X.u0 + Ldu * (K.xa[0] + (K.xa[1] - K.xa[0]) * u);
        else if (ki === KI.wasser && bruch(0.37 + i * R2A) < 0.15) xa = X.c0 + 6 + 60 * u;   /* ein Rest des Wassers geht in den Dickdarm */
        else xa = X.u0 + K.xa[0] + (K.xa[1] - K.xa[0]) * u;
      } else if (ki === KI.galle) xa = X.u0 + Ldu * (K.xa[0] + (K.xa[1] - K.xa[0]) * u);
      else if (ki === KI.pank) xa = X.u0 + K.xa[0] + (K.xa[1] - K.xa[0]) * u;
      else if (ki === KI.wasser) xr = X.u0 + 8 + (Ldu - 40) * u;   /* Ruhe-Wasser: verteilt im Duenndarm */
      K.es.push(e); K.xaa.push(xa); K.xr.push(xr); K.xt.push(xt);
    }
    K.vis = new Float32Array(n); K.xg = new Float32Array(n); K.tip = new Float32Array(n);
    K.gv = new Float32Array(n); K.sch = new Float32Array(n); K.sx = new Float32Array(n);   /* gv: Radius im Gefaess (sichtbar), sch/sx: Radius und Wegstelle fuer das Schema (Darm) */
    /* Gefaess je Teilchen: Kohlenhydrate, Eiweiss, Wasser (Duenndarm) -> naechste Darmvene, Wasser im Dickdarm -> naechste Dickdarmvene, Fett -> naechstes Lymphgefaess */
    K.gf = []; K.gs = []; K.gE = []; K.gS = []; K.gr = []; K.tA = [];
    for (i = 0; i < n; i++) {
      var gx = null, xa2 = K.xaa[i];
      if (ki <= KI.wasser && i >= K.nR && xa2 < 1e8) {
        var lst = ki === KI.fett ? GFL.ly : (ki === KI.wasser && xa2 >= X.c0) ? GFL.dc : GFL.dv, wp = wegPunkt(xa2, K.phi0[i], 1, K.rad * K.rs[i], GT), W = [wp.x, wp.y, wp.z], bd = 1e30, q;
        for (q = 0; q < lst.length; q++) { var h = polyNah(lst[q].pm, W); if (h.d < bd) { bd = h.d; gx = { g: lst[q], h: h }; } }
      }
      if (gx) {
        var gg = gx.g, hh = gx.h, sEnd = gg.pm.L;
        if (lst === GFL.dc) sEnd = Math.min(sEnd, hh.s + SZ_.GMAX);
        else if (ki !== KI.fett) sEnd = Math.max(Math.min(sEnd, sEnd - 0.25), hh.s + 0.5);   /* Venen: kurz vor der Muendung in die Mesenterialvene */
        sEnd = Math.min(gg.pm.L, Math.max(sEnd, hh.s + 0.3));
        K.gf.push(gg); K.gs.push(hh.s); K.gE.push(sEnd); K.gS.push(hh.x, hh.y, hh.z); K.gr.push(GEF_RF * gefaessRadius(gg, hh.s)); K.tA.push(tVonX(xa2) / K.ts[i]);
      } else { K.gf.push(null); K.gs.push(0); K.gE.push(0); K.gS.push(0, 0, 0); K.gr.push(0); K.tA.push(1e9); }
    }
  });
}
function lauf(ki, i, ph, o) {
  var K = KINDS[ki], tl, tt, xb, x, w = 1, a, r, rho = K.rho[i], X = WGX;
  o.st = 0; o.r = 0; o.tip = 0; o.c = 0; o.phi = K.phi0[i]; o.rho = rho; o.g = 0; o.gf = 0; o.rs = -1; o.xs = 0;   /* g: 1 = Lage direkt in gx, gy, gz (Gefaess, Uebertritt, Analkanal); gf: 0 Segment bei x, 1 Darmvenen, 2 Lymphgefaesse, 3 After; rs, xs: Radius und Wegstelle der Darmansicht fuer das Schema (rs < 0: wie r, x) */
  if (ki === KI.stuhl) {
    if (i < K.nR) { x = K.xr[i] + 0.25 * Math.sin(0.3 * clock + K.pz[i] * 6.2832); o.x = x; o.r = K.rad * 1.4 * K.rs[i]; o.c = 1; o.st = 1; return; }
    tl = ph - K.es[i];
    if (tl <= 0 || fe < 0.001) return;
    var xl = X.c0 + SZ_.VS * tl, L = 6, xt = K.xt[i];
    x = xl > xt - L ? xt - L + L * (1 - Math.exp(-(xl - (xt - L)) / L)) : xl;
    var fr = Math.max(0, Math.min(1, (x - X.c0) / (X.e - X.c0)));
    o.x = x; o.c = fr; o.rho = Math.min(0.85, rho); o.r = (K.rad * 0.9 + 0.1 * fr) * K.rs[i] * sstep(0, 1, tl) * sstep(0, 0.25, fe) * (1 - sstep(SZ_.P - 5, SZ_.P, ph)); o.st = o.r > 0.001 ? 1 : 0;
    /* am Zyklusende laeuft der gesammelte Stuhl nacheinander (vorderster zuerst) durch den Analkanal zum After und ein Stueck dahinter */
    var sf = Math.max(0, Math.min(1, (X.e - 0.8 - xt) / 14)), us = sstep(0, 1, (ph - (SZ_.P - SZ_.ST0 + SZ_.STV * sf)) / SZ_.STD);
    if (us > 0 && o.r > 0) {
      var pp = x + (WG.pEnd - x) * us, rm = o.r;
      o.rs = o.st ? o.r : 0; o.xs = x;
      o.rho = Math.min(0.85, rho) * (1 - sstep(X.e - 3, X.e, pp)); o.x = pp; o.c = Math.max(0, Math.min(1, (pp - X.c0) / (X.e - X.c0)));
      if (pp > X.e) {   /* hinter dem Ende der Wegtabelle: auf der Mittellinie des Analkanals, danach gerade weiter */
        var sk = WG.sE + (pp - X.e), A = geoDaten.dk.achse, sl = A.laenge, kf = WG.kf, kk = Math.min(kf.length - 1, (Math.min(sk, sl) - WG.sE) / 0.1), k0 = Math.floor(kk), k1 = Math.min(kf.length - 1, k0 + 1);
        rahmen(A, Math.min(sk, sl));
        var ex = Math.max(0, sk - sl);
        o.gx = FR.x + FR.tx * ex; o.gy = FR.y + FR.ty * ex; o.gz = FR.z + FR.tz * ex;
        rm = Math.min(rm, Math.max(0.03, 0.8 * (kf[k0] + (kf[k1] - kf[k0]) * (kk - k0))));
        o.r = rm * (1 - sstep(sl, sl + 1.5, sk)); o.g = 1; o.gf = 3; o.st = o.r > 0.001 ? 1 : 0;
      }
    }
    return;
  }
  if (i < K.nR) {
    if (ki === KI.wasser) {   /* nuechtern: Reste, die von einer schwachen Welle (alle TWV s) weitergeschoben werden */
      var kw = Math.floor(clock / SZ_.TWV), c = clock - kw * SZ_.TWV, kk = ((kw % SZ_.KW) + SZ_.KW) % SZ_.KW, base = K.xr[i] + SZ_.DW * kk, ci = base / SZ_.VW, uu = sstep(ci - 1.5, ci + 1.5, c), pp = kk + uu;
      o.x = base + SZ_.DW * uu + 0.8 * Math.sin(2 * PI * (clock / SZ_.TAU + K.pz[i]));
      o.r = K.rad * K.rs[i] * sstep(0, 0.5, pp) * (1 - sstep(SZ_.KW - 0.6, SZ_.KW, pp)) * (1 - sstep(0, 0.4, fe)); o.st = o.r > 0.001 ? 1 : 0;
      return;
    }
    tl = (clock + K.pz[i] * SZ_.TRICKLE * 7) % SZ_.TRICKLE;   /* wenige Tropfen Galle und Pankreassaft auch nuechtern */
  } else {
    tl = ph - K.es[i];
    if (tl <= 0 || fe < 0.001) return;
    w = sstep(0, 0.25, fe);
  }
  tt = (ki >= KI.galle ? tVonX(WG.xP) : 0) + tl * K.ts[i];
  xb = xVonT(tt);
  x = Math.max(ki >= KI.galle ? WG.xP : 0, Math.min(X.e, xb + pendel(xb, K.pz[i])));
  var xa = K.xaa[i];
  a = sstep(xa - SZ_.AW, xa, xb);
  r = K.rad * K.rs[i] * sstep(0, 0.8, tl) * (1 - a) * (1 - 0.3 * sstep(X.u0, xa, xb)) * w;
  if (ki === KI.wasser) r *= 1 + 0.5 * sstep(X.c0, X.c0 + 10, xb);
  o.x = x; o.r = r; o.rho = rho + (1 - rho) * a; o.st = r > 0.001 ? 1 : 0; o.tl = tl;
  var gf = K.gf ? K.gf[i] : null;
  if (gf) {   /* Aufnahme: das Teilchen schrumpft nicht zu nichts, sondern auf die Groesse im Gefaess und tritt dort ueber (Radius rG), dann stromab bis zum Ende des Linienzugs */
    var rG = K.gr[i] * w, d = tl - K.tA[i];
    o.rs = o.st ? r : 0; o.xs = x;   /* Darmansicht fuer das Schema: wie bisher verschwindet das Teilchen an der Wand */
    if (d < 0) {
      r = K.rad * K.rs[i] * sstep(0, 0.8, tl) * (1 - 0.3 * sstep(X.u0, xa, xb)) * w;
      if (ki === KI.wasser) r *= 1 + 0.5 * sstep(X.c0, X.c0 + 10, xb);
      o.r = r * (1 - a) + rG * a; o.st = o.r > 0.001 ? 1 : 0;
    } else if (d < SZ_.UT) {   /* Uebertritt: vom Ort bei tA (mit Pendeln zu dieser Zeit) gerade zum Einstieg S */
      var cA = clock - d, xA = Math.max(0, Math.min(X.e, xa + pendel(xa, K.pz[i], cA))), pA = K.phi0[i] + 0.5 * Math.sin(0.25 * cA + K.pz[i] * 6.2832), e = sstep(0, 1, d / SZ_.UT), S = K.gS;
      wegPunkt(xA, pA, 1, K.gr[i], GT);
      o.gx = GT.x + (S[i * 3] - GT.x) * e; o.gy = GT.y + (S[i * 3 + 1] - GT.y) * e; o.gz = GT.z + (S[i * 3 + 2] - GT.z) * e;
      o.x = xA; o.r = rG; o.g = 1; o.gf = 0; o.st = o.r > 0.001 ? 1 : 0;
    } else {
      var sS = K.gs[i], sE = K.gE[i], sg = sS + SZ_.GV * (d - SZ_.UT);
      o.g = 1; o.gf = gf.id.charAt(0) === 'l' ? 2 : 1; o.x = xa;
      if (sg >= sE) { o.r = 0; o.st = 0; } else {
        polyBei(gf.pm, sg, GP); o.gx = GP.x; o.gy = GP.y; o.gz = GP.z;
        o.r = GEF_RF * gefaessRadius(gf, sg) * (1 - sstep(0.75, 1, (sg - sS) / (sE - sS))) * w; o.st = o.r > 0.001 ? 1 : 0;
      }
    }
  }
  if (ki >= KI.galle) o.tip = 1 - sstep(0, 1.2, tl);   /* Galle und Pankreassaft treten an der Papille aus */
}
function tmat(col, em) {
  var m = mat(col, { rough: 0.35 });
  m.emissive.copy(srgb(em)).multiplyScalar(0.6);
  return m;
}
/* Aufbau: Weg, Tabellen, Teilchen (immer gleich viele Objekte, unabhaengig von der Auswahl) */
function stroemungBauen() {
  wegBauen(); teilchenDaten();
  ST = { gruppen: [], letzt: '' };
  KINDS.forEach(function (K, ki) {
    var m = tmat(K.col, K.em), geo = new THREE.SphereGeometry(1, 10, 7), im = new THREE.InstancedMesh(geo, m, K.n);
    m.name = 'teilchen-' + K.id;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (ki === KI.stuhl) { im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(K.n * 3), 3); im.instanceColor.setUsage(THREE.DynamicDrawUsage); }
    im.frustumCulled = false;
    im.name = K.name; im.userData.teilchen = K.id; im.userData.noexport = true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); K.im = im; ST.gruppen.push(im);
  });
  stroemungBild();
}
/* je Bild: Teilchen setzen (nur wenn sich Zeit, Uebergang, Auswahl oder Ausschnitt aendern) */
function stroemungBild() {
  if (!ST || !WG) return;
  var key = clock + '|' + fe + '|' + lv + '|' + tM + '|' + kindOn.join('');
  if (key === ST.letzt) return;
  ST.letzt = key;
  var te = clock - tM, ph = te - Math.floor(te / SZ_.P) * SZ_.P, ki, i, tp = WG.tip, seg = WGX.seg, sv = seg.map(function (g) { return !enabled[g.sid] || verborgen(g.sid, g.ende, g.fern); });
  var svG = [false, !enabled.venen || verborgen('venen'), !enabled.lymphe || verborgen('lymphe'), !enabled.after || verborgen('after')];   /* Gefaesse und After (gf 1-3) */
  function segAus(x) { var sg = seg.length - 1; while (sg > 0 && seg[sg].x0 > x) sg--; return sv[sg]; }
  for (ki = 0; ki < KINDS.length; ki++) {
    var K = KINDS[ki], im = K.im, col = ki === KI.stuhl ? im.instanceColor.array : null;
    im.visible = kindOn[ki];
    for (i = 0; i < K.n; i++) {
      lauf(ki, i, ph, LB);
      var r = LB.st ? LB.r : 0, rs = LB.rs < 0 ? r : LB.rs, xs = LB.rs < 0 ? LB.x : LB.xs, gd = LB.g;
      if (r > 0) { if (gd && LB.gf > 0) { if (svG[LB.gf]) r = 0; } else if (segAus(LB.x)) r = 0; }   /* Inhalt einer ausgeblendeten Struktur */
      if (rs > 0 && segAus(xs)) rs = 0;
      var phi = LB.phi + (ki === KI.stuhl ? 0 : 0.5 * Math.sin(0.25 * clock + K.pz[i] * 6.2832)), rmaxS = 1;
      if (r > 0 && gd) { SQ.x = LB.gx; SQ.y = LB.gy; SQ.z = LB.gz; }
      else if (r > 0) {
        wegPunkt(LB.x, phi, LB.rho, r, SQ);
        if (r > SQ.rmax) r = SQ.rmax;
        if (LB.tip > 0) {   /* Spitze der Papille -> in den Innenraum */
          var m = LB.tip * LB.tip * (3 - 2 * LB.tip);
          SQ.x += (tp[0] - SQ.x) * m; SQ.y += (tp[1] - SQ.y) * m; SQ.z += (tp[2] - SQ.z) * m;
        }
        rmaxS = SQ.rmax;
      }
      if (rs > 0) { if (r > 0 && !gd && xs === LB.x) { if (rs > rmaxS) rs = rmaxS; } else { wegPunkt(xs, phi, 0, rs, GT); if (rs > GT.rmax) rs = GT.rmax; } }
      K.vis[i] = gd ? 0 : r; K.gv[i] = gd ? r : 0; K.xg[i] = LB.x; K.tip[i] = LB.tip; K.sch[i] = rs; K.sx[i] = xs;
      if (col) { var c = LB.c; col[i * 3] = STUHL_C0.r + (STUHL_C1.r - STUHL_C0.r) * c; col[i * 3 + 1] = STUHL_C0.g + (STUHL_C1.g - STUHL_C0.g) * c; col[i * 3 + 2] = STUHL_C0.b + (STUHL_C1.b - STUHL_C0.b) * c; }
      STM.makeScale(r, r, r); STM.setPosition(SQ.x, SQ.y, SQ.z);
      im.setMatrixAt(i, STM);
    }
    im.instanceMatrix.needsUpdate = true;
    if (col) im.instanceColor.needsUpdate = true;
  }
}
/* je Bild: Uhr und Uebergang fortschreiben (Pause haelt die Stroemung an, der Uebergang laeuft in Echtzeit) */
function stroemungSchritt(dt) {
  var ziel = mahlzeit ? 1 : 0;
  if (!fzFest && fzR !== ziel) fzR = ziel > fzR ? Math.min(ziel, fzR + dt / SZ_.UEBERG) : Math.max(ziel, fzR - dt / SZ_.UEBERG);
  fe = sstep(0, 1, fzR);
  if (playing) clock += dt * speed;
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
/* Mahlzeit-Schalter: nuechtern (fast leer) oder nach dem Essen (Speisebrei, Galle und Pankreassaft fliessen) */
var MAHLZEIT_TXT = ['Nüchtern: Der Darm ist fast leer, schwache Muskelwellen räumen ihn auf.',
  'Nach dem Essen: Speisebrei kommt aus dem Magen, Galle und Pankreassaft fließen zu, Mischbewegungen bringen die Nährstoffe an die Schleimhaut.'];
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
   7. Schema - Wo wird was aufgenommen (Knopf "Schema", wie beim Magen)
   Der Darm als gestreckter Weg (Bildkoordinaten 460 breit): Zwoelffingerdarm, Leerdarm, Krummdarm in Schlingen, Dickdarm als Rahmen darum, Mastdarm; dazu die Kaestchen der
   Zufluesse (Galle, Pankreassaft), Pfeile an den Orten der Aufnahme, nummerierte Legende, Kennzahlen und eine Hinweiszeile je nach Mahlzeit. Die Punkte sind dieselben
   Teilchen wie im 3D-Modell (gleiche Farben, gleiche Zeitfunktion lauf aus Abschnitt 6, Wegstelle x -> Lage im Schema; Tempo, Pause, Mahlzeit und Stoffe-Schalter gelten mit).
   Das Schema legt nichts in der 3D-Szene an und zieht keinen Zufall; gebaut wird es erst beim ersten Oeffnen.
   ===================================================================== */
var SCH = (function () {
  var NS = 'http://www.w3.org/2000/svg', W = 460, H = 470, BREIT = false;   /* BREIT: Desktop, Legende rechts neben dem Weg; sonst (Handy) darunter, das Panel scrollt */
  var BRASS = '#E0A94A', DIM = '#8DA7B1', INK = '#E7EFF0', DARK = '#0B171C';
  var svg = null, built = false, DOT = [], DYN = {}, seen = {};
  function f1(v) { return Math.round(v * 10) / 10; }
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
  /* Catmull-Rom durch Punkte [x, y] (Spannung 0,5), n Punkte je Abschnitt */
  function glatt(pts, n) {
    var out = [], i, k, m = pts.length;
    for (i = 0; i < m - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(m - 1, i + 2)];
      for (k = 0; k < n; k++) {
        var t = k / n, t2 = t * t, t3 = t2 * t, o = [];
        for (var c = 0; c < p1.length; c++) o.push(0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
        out.push(o);
      }
    }
    out.push(pts[m - 1].slice());
    return out;
  }
  function laenge(poly) {
    var cum = [0], i;
    for (i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.sqrt(Math.pow(poly[i][0] - poly[i - 1][0], 2) + Math.pow(poly[i][1] - poly[i - 1][1], 2)));
    return { p: poly, cum: cum, L: cum[cum.length - 1] };
  }
  function bei(ln, s, o) {   /* Punkt und Richtung (o.tx, o.ty) bei Bogenlaenge s */
    s = Math.max(0, Math.min(ln.L, s));
    var lo = 0, hi = ln.p.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (ln.cum[m] <= s) lo = m; else hi = m; }
    var d = ln.cum[hi] - ln.cum[lo], t = d > 1e-9 ? (s - ln.cum[lo]) / d : 0, a = ln.p[lo], b = ln.p[hi], l;
    o.x = a[0] + (b[0] - a[0]) * t; o.y = a[1] + (b[1] - a[1]) * t;
    o.tx = b[0] - a[0]; o.ty = b[1] - a[1]; l = Math.sqrt(o.tx * o.tx + o.ty * o.ty) || 1; o.tx /= l; o.ty /= l;
    return o;
  }
  function linienPfad(pts) { var d = ''; pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }); return d; }
  function rohr(g, pts, w, fill, rand) {   /* Schlauch als dicke Linie mit dunklem Rand */
    var d = linienPfad(pts);
    E('path', { d: d, fill: 'none', stroke: rand || DARK, 'stroke-width': w + 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    E('path', { d: d, fill: 'none', stroke: fill, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  }

  /* ---- Lage der Stationen (Bildpunkte) ---- */
  var DUO = glatt([[300, 34], [314, 49], [320, 82], [308, 112], [282, 122]], 6);   /* Blick von vorn wie im 3D-Modell: Blinddarm und aufsteigender Dickdarm links im Bild (rechte Koerperseite), absteigender Dickdarm rechts */
  var SI = glatt([[282, 122], [280, 186], [144, 186], [140, 219], [310, 219], [314, 252], [144, 252], [140, 285], [310, 285], [314, 318], [144, 318], [138, 338]], 4);
  var DICK = glatt([[138, 338], [114, 350], [114, 170], [124, 138], [346, 138], [356, 170], [356, 350], [328, 382], [264, 374], [230, 400]], 5);
  var REKT = [[230, 400], [230, 430]];
  var LN = null, FM = null, FMASTDARM = 0.89;
  function bauePfade() {
    LN = { duo: laenge(DUO), si: laenge(SI), dick: laenge(DICK), rekt: laenge(REKT) };
    FMASTDARM = (WGX.sM - WGX.sB) / (WGX.e - WGX.c0);   /* ab hier der Mastdarm (Bruchteil des Weges im Dickdarm) */
  }
  /* Lage eines Teilchens im Schema: Wegstelle x (cm), Index i; schreibt o.x, o.y */
  var P = { x: 0, y: 0, tx: 0, ty: 0 };
  function lage(K, ki, i, o) {
    var X = WGX, x = K.sx[i], seitl = Math.sin(i * 2.399963 + ki) * 0.55, breite;
    if (x < X.u0) { bei(LN.duo, x / X.d1 * LN.duo.L, P); breite = 2.8; }
    else if (x <= X.u1) { bei(LN.si, (x - X.u0) / (X.u1 - X.u0) * LN.si.L, P); breite = 2.6; }
    else {
      var fc = Math.max(0, Math.min(1, (x - X.c0) / (X.e - X.c0)));
      if (fc <= FMASTDARM) bei(LN.dick, fc / FMASTDARM * LN.dick.L, P); else bei(LN.rekt, (fc - FMASTDARM) / (1 - FMASTDARM) * LN.rekt.L, P);
      breite = 3.6;
    }
    o.x = P.x - P.ty * seitl * breite; o.y = P.y + P.tx * seitl * breite;
  }
  /* Stelle der Papille im Schema (Bruchteil des Zwoelffingerdarms) */
  function papilleBild(o) { return bei(LN.duo, WG.xP / WGX.d1 * LN.duo.L, o); }

  function build(box) {
    if (built) return;
    box.innerHTML = '';
    BREIT = window.innerWidth > 1000;
    var PITCH = BREIT ? 49 : 46, LX = BREIT ? 478 : 8, LY = BREIT ? 34 : 462, ky = LY + 5 * PITCH - 6;
    W = BREIT ? 800 : 460; H = BREIT ? 470 : Math.round(ky + 100 + 4 * 14 + 14);
    bauePfade();
    svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Inter, "Segoe UI", system-ui, sans-serif',
      'aria-label': 'Schema: der Darm als gestreckter Weg, an welchen Stellen welche Stoffe aufgenommen werden' }, box);
    var i;
    /* ---- Darm: Dickdarm hinten, dann Duenndarm (Leerdarm, Krummdarm), Zwoelffingerdarm; Mastdarm ---- */
    var gd = E('g', null, svg), sk = 0;
    while (sk < LN.si.cum.length - 1 && LN.si.cum[sk] < 0.4 * LN.si.L) sk++;
    rohr(gd, DICK.map(function (q) { return [q[0], q[1]]; }), 15, '#B87868');
    rohr(gd, REKT, 14, '#B87868');
    rohr(gd, SI.slice(sk).map(function (q) { return [q[0], q[1]]; }), 11, '#DDA088');
    rohr(gd, SI.slice(0, sk + 1).map(function (q) { return [q[0], q[1]]; }), 11, '#E8A98F');
    rohr(gd, DUO.map(function (q) { return [q[0], q[1]]; }), 13, '#E3A58C');
    E('circle', { cx: 230, cy: 435, r: 5, fill: DARK, stroke: '#B87868', 'stroke-width': 1.4 }, gd);
    /* ---- Teilchen: je Art ein Pool von Kreisen ---- */
    var gt = E('g', { 'pointer-events': 'none' }, svg);
    FM = [['#F0DA6E', '#6A560A'], ['#F5AE60', '#6A3206'], ['#FFFFFF', '#55554F'], ['#A8DEF6', '#1A4E74'], ['#8FDC80', '#2E5A28'], ['#D9CAF0', '#4A3A78'], ['#9A6A3A', '#3A2412']];
    DOT = KINDS.map(function (K, ki) {
      var gg = E('g', null, gt), arr = [];
      for (i = 0; i < K.n; i++) arr.push({ el: E('circle', { r: 2, fill: FM[ki][0], stroke: FM[ki][1], 'stroke-width': 0.7, display: 'none' }, gg), on: false, x: -1, y: -1, r: -1 });
      return arr;
    });
    /* ---- Beschriftung ---- */
    var ga = E('g', { 'pointer-events': 'none' }, svg);
    function leiter(x0, y0, x1, y1) {
      E('line', { x1: f1(x0), y1: f1(y0), x2: f1(x1), y2: f1(y1), stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, ga);
      E('circle', { cx: f1(x0), cy: f1(y0), r: 1.8, fill: BRASS }, ga);
    }
    function station(s, tx, ty, anker, px, py, lx, ly, o) {
      if (px !== undefined) leiter(px, py, lx, ly);
      var a = { 'letter-spacing': 1.2, 'font-weight': 600 }; if (anker) a['text-anchor'] = anker; if (o) Object.keys(o).forEach(function (k) { a[k] = o[k]; });
      text(ga, tx, ty, s, 9.5, DIM, a);
    }
    function kasten(cx, cy, s, px, py) {
      var w = Math.round(s.length * 5.5 + 12);
      if (px !== undefined) E('line', { x1: f1(cx), y1: f1(cy), x2: f1(px), y2: f1(py), stroke: '#9C7530', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, ga);
      E('rect', { x: f1(cx - w / 2), y: f1(cy - 8), width: w, height: 16, rx: 3, fill: DARK, 'fill-opacity': 0.9, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
      text(ga, cx, cy + 3.3, s, 9.5, INK, { 'text-anchor': 'middle', 'stroke-width': 0, 'font-weight': 600 });
    }
    /* Pfeil von (x, y) in Richtung (dx, dy), Laenge len: der Stoff verlaesst den Darm (Ort der Aufnahme) */
    function pfeil(x, y, dx, dy, len, fill) {
      var tx = x + dx * len, ty = y + dy * len, nx = -dy, ny = dx, k = 4.4, b = 3.4;
      E('line', { x1: f1(x), y1: f1(y), x2: f1(tx - dx * k), y2: f1(ty - dy * k), stroke: fill, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, ga);
      E('polygon', { points: f1(tx) + ',' + f1(ty) + ' ' + f1(tx - dx * k + nx * b) + ',' + f1(ty - dy * k + ny * b) + ' ' + f1(tx - dx * k - nx * b) + ',' + f1(ty - dy * k - ny * b), fill: fill, stroke: DARK, 'stroke-width': 0.6, 'stroke-linejoin': 'round' }, ga);
    }
    var AUF = { 'font-size': 8.8, 'stroke-width': 2.2 };
    /* Orte der Aufnahme: Pfeile in den Farben der Stoffe, daneben nur die Stoffe aus der Legende */
    pfeil(328, 76, 1, 0, 16, '#C5D0D6'); pfeil(326, 88, 1, 0, 16, '#9FB4C0');
    text(ga, 352, 94, 'Eisen, Calcium', AUF['font-size'], DIM, { 'stroke-width': 2.2 });
    [[150, '#F0DA6E'], [164, '#F5AE60'], [178, '#FFFFFF'], [192, '#C5D0D6']].forEach(function (a) { pfeil(a[0], 178, 0, -1, 12, a[1]); });
    text(ga, 268, 156, 'Zucker, Aminosäuren,', AUF['font-size'], DIM, { 'text-anchor': 'end', 'stroke-width': 2.2 }); text(ga, 268, 167, 'Fette, Vitamine', AUF['font-size'], DIM, { 'text-anchor': 'end', 'stroke-width': 2.2 });
    pfeil(216, 326, 0, 1, 12, '#C5D0D6'); pfeil(246, 326, 0, 1, 12, '#8FDC80');
    text(ga, 231, 353, 'Vitamin B12, Gallensäuren', AUF['font-size'], DIM, { 'text-anchor': 'middle', 'stroke-width': 2.2 });
    pfeil(106, 244, -1, 0, 14, '#A8DEF6'); pfeil(106, 256, -1, 0, 14, '#C5D0D6');
    text(ga, 86, 247, 'Wasser,', AUF['font-size'], DIM, { 'text-anchor': 'end', 'stroke-width': 2.2 }); text(ga, 86, 259, 'Salze', AUF['font-size'], DIM, { 'text-anchor': 'end', 'stroke-width': 2.2 });
    /* Stationen: die Linien enden mit einem Punkt auf dem Abschnitt (Leerdarm: obere Schlinge, Krummdarm: unterste Schlinge, Dickdarm: Rahmen) */
    station('ZWÖLFFINGERDARM', 452, 40, 'end', 314, 44, 336, 36);
    station('LEERDARM', 372, 226, null, 300, 219, 368, 222);
    station('KRUMMDARM', 8, 316, null, 160, 318, 74, 312);
    station('DICKDARM', 372, 294, null, 356, 290, 368, 290);
    station('MASTDARM', 248, 428, null, 234, 424, 244, 425);
    var pp = papilleBild({});
    kasten(200, 52, 'Galle', pp.x - 5, pp.y); kasten(190, 78, 'Pankreassaft', pp.x - 5, pp.y + 2);
    /* Abzeichen an den Stationen */
    [[340, 62], [228, 202], [228, 301], [198, 126], [210, 418]].forEach(function (p, q) { abzeichen(ga, p[0], p[1], q + 1); });
    /* Legende */
    var LG = [
      ['Zwölffingerdarm', 'Galle und Pankreassaft spalten die Nährstoffe;', 'aufgenommen werden vor allem Eisen und Calcium'],
      ['Leerdarm', 'Hier wird das meiste aufgenommen:', 'Zucker, Aminosäuren, Fette und Vitamine'],
      ['Krummdarm', 'Am Ende werden Vitamin B12', 'und die Gallensäuren zurückgeholt'],
      ['Dickdarm', 'Wasser und Salze werden entzogen,', 'Bakterien bauen Reste ab'],
      ['Mastdarm', 'Der Stuhl wird gesammelt', 'und ausgeschieden']
    ];
    var FT = 12.5, FZ = 10.4;
    LG.forEach(function (t, q) {
      var cy = LY + q * PITCH;
      abzeichen(ga, LX + 8, cy - 4, q + 1);
      text(ga, LX + 24, cy, t[0], FT, BRASS, { 'font-weight': 700 });
      text(ga, LX + 24, cy + 14, t[1], FZ, DIM, { 'stroke-width': 2.2 });
      text(ga, LX + 24, cy + 27, t[2], FZ, DIM, { 'stroke-width': 2.2 });
    });
    /* Kennzahlen */
    var kx = LX, kw = BREIT ? 312 : 444;
    E('rect', { x: kx, y: f1(ky), width: kw, height: 80, rx: 4, fill: DARK, 'fill-opacity': 0.88, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
    text(ga, kx + 10, ky + 16, 'KENNZAHLEN · FLÜSSIGKEIT', 10, BRASS, { 'font-weight': 700, 'letter-spacing': 0.8, 'stroke-width': 0 });
    ['In den Darm: ca. 9 l pro Tag (Getränke und Verdauungssäfte)', 'Dünndarm holt zurück: ca. 7–8 l', 'Dickdarm holt zurück: ca. 1–1,5 l', 'Im Stuhl: ca. 0,1–0,2 l'].forEach(function (s, q) {
      text(ga, kx + 10, ky + 32 + q * 13, s, q === 0 && BREIT ? 9.8 : FZ, DIM, { 'stroke-width': 0 });
    });
    /* Hinweiszeile je nach Mahlzeit, bis zu vier Zeilen */
    DYN.hint = [0, 1, 2, 3].map(function (q) { return text(ga, LX, ky + 102 + q * 14, '', 10.4, INK, { 'stroke-width': 2.2 }); });
    seen = { mz: -1 };
    built = true;
  }

  function update() {
    if (!built) return;
    var ki, i, o = { x: 0, y: 0 };
    for (ki = 0; ki < KINDS.length; ki++) {
      var K = KINDS[ki], pool = DOT[ki], show = K.im.visible;
      for (i = 0; i < K.n; i++) {
        var q = pool[i], v = show && K.sch[i] > 0.001;
        if (v) {
          lage(K, ki, i, o);
          var rr = Math.round(Math.max(1.7, Math.min(4.2, K.sch[i] * 19)) * 10) / 10, x = f1(o.x), y = f1(o.y);
          if (x !== q.x) { q.el.setAttribute('cx', x); q.x = x; }
          if (y !== q.y) { q.el.setAttribute('cy', y); q.y = y; }
          if (rr !== q.r) { q.el.setAttribute('r', rr); q.r = rr; }
          if (!q.on) { q.el.setAttribute('display', 'inline'); q.on = true; }
        } else if (q.on) { q.el.setAttribute('display', 'none'); q.on = false; }
      }
    }
    if (mahlzeit !== seen.mz) {
      seen.mz = mahlzeit;
      var wort = MAHLZEIT_TXT[mahlzeit ? 1 : 0].split(' '), zl = [''], mx = BREIT ? 56 : 82;   /* Hinweis auf Zeilen umbrechen */
      wort.forEach(function (w) { var l = zl[zl.length - 1]; if (l && (l + ' ' + w).length > mx) zl.push(w); else zl[zl.length - 1] = l ? l + ' ' + w : w; });
      DYN.hint.forEach(function (e, q) { e.textContent = zl[q] || ''; });
    }
  }
  function abbauen() { svg = null; built = false; DOT = []; DYN = {}; seen = {}; LN = null; }
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
/* Das Schema weicht anderen Ansichten: hier ergaenzen spaetere Schritte ihre Gruende (Hilfekarten, Ueben, Lupe, AR) */
function schemaWeicht() { if (schemaOn) setSchema(false); }
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };

/* =====================================================================
   7b. Kamerafahrt zur Duenndarmzotte (Knopf "Zotte", Infokarte "Duenndarmzotte hier ansehen" bei Leerdarm und Krummdarm): Der Darm blendet aus, an der hinteren Wand des
   Duenndarms (bei einer aufgeschnittenen Schlinge: die Innenseite, in die man hineinsieht) waechst in der zweiten Haelfte das Stueck Ringfalte mit den Zotten aus der Form des
   Zotten-Moduls (organ.form) ein, stark vergroessert (ZO_S). Der Darm dreht sich dabei (alle Achsen, um den Fusspunkt der mittleren Zotte), bis die Zotte aufrecht steht: dann gilt
   in Weltachsen dieselbe Lage wie im Zotten-Modell, und die Kamera landet in dessen Startansicht (umgerechnet in Welt-Koordinaten); dann wird die Adresse gesetzt. Beim
   Zurueckkommen (umg.von === 'zotte') steht der Darm gedreht im Nahbild und faehrt nach 450 ms zur Uebersicht zurueck. Die Stroemung steht waehrend der Fahrt. Neue
   three.js-Objekte (die Zotte) entstehen erst bei der Fahrt.
   ===================================================================== */
var ZO_S = 0.08;                           /* Massstab: cm im Darm je Einheit (0,1 mm) des Zotten-Modells (stark vergroessert; in Wirklichkeit waeren es 0,01 cm) */
var ZO_RW = 0.72;                          /* Abstand der Schleimhautoberflaeche von der Mittellinie des Duenndarms (cm) */
var ZO_START = { theta: 0, phi: 1.2, dist: 20, target: [0, 2, -1.6] };   /* Ersatz fuer die Startansicht des Zotten-Moduls, falls dessen Skript fehlt */
var zoStandard = 0;                        /* Standardstelle (Knopf "Zotte"): Mitte der aufgeschnittenen Duenndarmschlinge (Bogenlaenge s in cm); wird beim ersten Gebrauch gesetzt */
var zoGruppe = null, zoM = [];             /* Gruppe der Zotte (Kind von root) und ihre Materialien [{ m, op }] */
var ZO = null;                             /* Lage der aktuellen Fahrt: { s, pc (Fusspunkt, Koerper-Koordinaten), qa (Zotte -> Darm), qEnd (Darm -> Welt am Ende) } */
var zoP = null, zoWartet = false, zoFehl = false;   /* Laden des Zotten-Moduls im Hintergrund, Wartezeit nach dem Klick */
var fz = null;                             /* laufende Fahrt */
var zoStep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
var ROOT0 = V(-M[0], -M[1], -M[2]), Q_ID = new THREE.Quaternion();
function zoModul() { return Kern.Organe && Kern.Organe.zotte; }
/* Stelle (Bogenlaenge s auf der Mittellinie des Duenndarms) zum angetippten Punkt (Welt) in Leerdarm bzw. Krummdarm; ohne Punkt oder ausserhalb des Abschnitts die Mitte des Abschnitts */
function zoStelle(id, punkt) {
  var du = geoDaten && geoDaten.du; if (!du) return null;
  zoStandard = (du.schnitt.s0 + du.schnitt.s1) / 2;
  var leer = id === 'leerdarm';
  if (punkt) {
    var q = root.worldToLocal(punkt.clone());
    du.achse.q(q.x, q.y, q.z);
    var s = du.achse.s;
    if (du.achse.i >= 0 && (leer ? s < du.leerEnde : s >= du.leerEnde)) return Math.max(2, Math.min(du.laenge - 2, s));
  }
  return leer ? zoStandard : (du.leerEnde + du.laenge) / 2;
}
/* Lage der Zotte an der Stelle s: Fusspunkt an der hinteren Wand, Achse (Modell +y) in den Darm hinein (zum Betrachter), Vorderseite (Modell +z) nach unten; zoLage.qEnd dreht das zurueck */
function zoLage(s) {
  var du = geoDaten.du, c = du.punkt(s), t = du.richtung(s), C = V(c[0], c[1], c[2]), T = V(t[0], t[1], t[2]);
  var u = V(0, 0, 1).sub(T.clone().multiplyScalar(T.z));
  if (u.length() < 0.2) u = V(1, 0, 0).sub(T.clone().multiplyScalar(T.x));
  u.normalize();
  var ay = u.clone(), az = V(0, -1, 0).sub(ay.clone().multiplyScalar(-ay.y));
  if (az.length() < 0.2) az = T.clone().sub(ay.clone().multiplyScalar(T.dot(ay)));
  az.normalize();
  var ax = new THREE.Vector3().crossVectors(ay, az);
  var qa = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, ay, az));
  return { s: s, pc: C.addScaledVector(u, -ZO_RW), qa: qa, qEnd: qa.clone().invert() };
}
/* Startansicht des Zotten-Moduls in Welt-Koordinaten: gleiche Blickrichtung, Abstand und Ziel mit dem Massstab und der Lage der Zotte umgerechnet, Versatz des Bildbereichs wie im Modell */
function zoZiel(w, h) {
  var zm = zoModul(), st = zm && zm.start ? zm.start(w, h) : null, r = bereich(w, h);
  if (!st) st = Object.assign({ versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] }, ZO_START);
  return { theta: st.theta, phi: st.phi, dist: ZO_S * st.dist, target: ROOT0.clone().add(ZO.pc).addScaledVector(V(st.target[0], st.target[1], st.target[2]), ZO_S), versatz: st.versatz };
}
/* Den ganzen Darm um den Fusspunkt der Zotte drehen: f = 0 ohne Drehung, 1 mit aufrechter Zotte (der Fusspunkt bleibt an seinem Platz) */
function zoDrehung(f) {
  root.quaternion.copy(Q_ID).slerp(ZO.qEnd, f);
  root.position.copy(ROOT0).add(ZO.pc).sub(V(ZO.pc.x, ZO.pc.y, ZO.pc.z).applyQuaternion(root.quaternion));
}
/* Die Zotte im Darm (unsichtbar bis zum Einblenden): Teile und Materialien aus organ.form; ohne Modul bleibt die Gruppe leer. Die Materialien sind durchscheinend (Deckkraft 0),
   undurchsichtige schreiben weiter in den Tiefenpuffer, damit das Endbild dem Zotten-Modell gleicht. */
function zoBauen() {
  zoGruppe = new THREE.Group(); zoGruppe.name = 'Dünndarmzotte'; zoGruppe.visible = false;
  zoGruppe.position.copy(ZO.pc); zoGruppe.quaternion.copy(ZO.qa); zoGruppe.scale.setScalar(ZO_S); root.add(zoGruppe);
  zoM = [];
  var zm = zoModul(); if (!zm || !zm.form) return;
  var def = zm.form.matDef();
  zm.form.teile().forEach(function (t) {
    var d = def[t.mat || t.sid], o = {}, k, mt, op;
    for (k in d[1]) o[k] = d[1][k];
    mt = mat(d[0], o); op = o.opacity === undefined ? 1 : o.opacity;
    mt.transparent = true; mt.opacity = 0; mt.depthWrite = op >= 1;
    zoM.push({ m: mt, op: op });
    zoGruppe.add(zm.form.teilMesh(t, mt, d[2] + 10));
  });
}
function zoDeckkraft(f) {   /* Deckkraft der Zotte 0..1 */
  zoM.forEach(function (e) { e.m.opacity = e.op * f; });
  zoGruppe.visible = f > 0.002;
}
function zoAbbau() {   /* Zotte entsorgen, Darm in die Ausgangslage */
  if (zoGruppe) Kern.entsorgen(zoGruppe, envTex);
  zoGruppe = null; zoM = [];
  root.quaternion.copy(Q_ID); root.position.copy(ROOT0);
}
/* Alles ausser der Zotte zum Ausblenden vorbereiten (Hin- und Rueckfahrt); merkt die Ursprungswerte. Ausblendende Materialien werden durchscheinend und schreiben nicht mehr in den Tiefenpuffer. */
function zoAusblenden() {
  var ausMat = new Map(), altT = new Map(), altD = new Map(), ausObj = [];
  root.traverse(function (o) {
    if (!o.material || !o.visible || o === zoGruppe || o.parent === zoGruppe) return;
    ausObj.push(o);
    [].concat(o.material).forEach(function (x) {
      if (!ausMat.has(x)) { ausMat.set(x, x.opacity); altT.set(x, x.transparent); altD.set(x, x.depthWrite); x.transparent = true; x.depthWrite = false; x.needsUpdate = true; }
    });
  });
  var ui = Array.prototype.slice.call(umg.bereich.children);
  var altUi = ui.map(function (e) { return { op: e.style.opacity, pe: e.style.pointerEvents }; });
  ui.forEach(function (e) { e.style.pointerEvents = 'none'; });
  canvas.style.pointerEvents = 'none';
  labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
  return { mats: ausMat, altT: altT, altD: altD, obj: ausObj, ui: ui, altUi: altUi, fertig: false };
}
/* Fahrt zur Zotte an der Stelle s (null: die Standardstelle); wartet, falls das Modul noch im Hintergrund geladen wird */
function zoOeffnen(s) {
  if (fz || abgebaut || zoWartet || !App.ready) return;
  if (zoP && !zoModul() && !zoFehl) { zoWartet = true; zoP.then(function () { zoWartet = false; if (!abgebaut) zoOeffnen(s); }); return; }
  schemaWeicht();
  if (quiz) quizEnd();
  if (wege) wegeEnd();
  closeCard();
  zoStandard = (geoDaten.du.schnitt.s0 + geoDaten.du.schnitt.s1) / 2;
  zoLetzte = s = (s === null || s === undefined) ? zoStandard : s;
  ZO = zoLage(s);
  var w = window.innerWidth, h = window.innerHeight, ziel = zoZiel(w, h), r = bereich(w, h);
  var dth = ziel.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI; ziel.theta = view.theta + dth;
  setSelected(null);                                     /* Infokarte schliessen, Hervorhebung weg */
  zoBauen();
  var f = zoAusblenden();
  orbit.anim = Kern.fahrt(view, { theta: ziel.theta, phi: ziel.phi, dist: ziel.dist, target: ziel.target }, 1200);
  f.hin = true; f.adresse = Kern.organAdresse('zotte'); f.a = orbit.anim;
  f.von = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2]; f.nach = ziel.versatz;
  fz = f;
}
$('iOpen').onclick = function () { zoOeffnen(zoWahl); };
$('bZotte').onclick = function () { zoOeffnen(null); };
/* Rueckkehr aus dem Zotten-Modell: der Darm steht gedreht im Nahbild (an der zuletzt gewaehlten Stelle), die Zotte ist sichtbar, alles andere ausgeblendet; die Fahrt zur Uebersicht beginnt nach 450 ms */
function zoRueckkehr() {
  zoStandard = (geoDaten.du.schnitt.s0 + geoDaten.du.schnitt.s1) / 2;
  ZO = zoLage(zoLetzte !== null ? zoLetzte : zoStandard);
  var w = window.innerWidth, h = window.innerHeight, ziel = zoZiel(w, h), r = bereich(w, h);
  zoBauen();
  var f = zoAusblenden();
  f.mats.forEach(function (op, m) { m.opacity = 0; });
  f.ui.forEach(function (e) { e.style.opacity = '0'; });
  f.obj.forEach(function (o) { o.visible = false; });
  zoDrehung(1); zoDeckkraft(1);
  view.theta = ziel.theta; view.phi = ziel.phi; view.dist = ziel.dist; view.target.copy(ziel.target);
  orbit.anim = null;
  f.hin = false; f.a = null; f.warte = performance.now() + 450;
  f.von = ziel.versatz; f.nach = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2];
  camera.setViewOffset(w, h, f.von[0], f.von[1], w, h);
  camera.updateProjectionMatrix();
  fz = f;
}
function zoRueckEnde() {   /* Ursprungszustand wie nach einem normalen Aufbau */
  var w = window.innerWidth, h = window.innerHeight, r = bereich(w, h), a0 = AUSSCHNITTE[0], d = distFuer(a0, w, h);
  fz.mats.forEach(function (op, m) {
    m.opacity = op;
    if (m.transparent !== fz.altT.get(m) || m.depthWrite !== fz.altD.get(m)) { m.transparent = fz.altT.get(m); m.depthWrite = fz.altD.get(m); m.needsUpdate = true; }
  });
  fz.obj.forEach(function (o) { o.visible = true; });
  fz.ui.forEach(function (e, i) { e.style.opacity = fz.altUi[i].op; e.style.pointerEvents = fz.altUi[i].pe; });
  canvas.style.pointerEvents = '';
  labelBox.style.display = showLabels ? '' : 'none'; leaderSvg.style.display = showLabels ? '' : 'none';
  zoAbbau();
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
function zoFahrtBild(now) {
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
  fz.ui.forEach(function (e) { e.style.opacity = String(1 - u); });
  if (!fz.hin && t >= 1) { zoRueckEnde(); return false; }
  zoDrehung(u);
  zoDeckkraft(zoStep(0.5, 1, u));                                     /* erscheint in der zweiten Haelfte der Hinfahrt, geht in der ersten der Rueckfahrt */
  if (!fz.hin) return false;
  if (t >= 1 && !fz.fertig) { fz.fertig = true; fz.obj.forEach(function (o) { o.visible = false; }); return false; }
  return fz.fertig;   /* true erst ab dem Bild nach dem Endbild */
}

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var App = window.DarmApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris, offen: function () { return OPEN.slice(); },
  mahlzeit: function (an) { setMahlzeit(!!an); },
  schema: function (an) { setSchema(!!an); },
  tippe: function (id) { if (wege) wegeAntwort(id, [id]); else if (quiz) quizAntwort(id, [id]); },
  wege: function () { return wege && { weg: wege.nr + 1, station: wege.st, n: wege.n, ok: wege.ok, fehl: wege.fehl, liste: wege.liste.slice(), fertig: wege.fertig, leucht: wege.leucht.slice(), ausschnitt: aktiv }; },
  quiz: function () { return quiz && { ziel: quiz.target, n: quiz.n, ok: quiz.ok }; },
  /* fuer die Pruefung (Strahltest): was liegt unter dem Bildschirmpunkt - { treffer, weich, durch } wie beim Antippen */
  treffer: trefferAn,
  stoffe: function (id, an) { if (id in KI && KINDS[KI[id]].btn) stoffSetzen(KI[id], !!an); },
  /* fuer die Pruefung: Werte der Stroemung (Zahl der sichtbaren Teilchen je Art, Uebergang, Uhr) und Lage der Teilchen (Koerper-Koordinaten, Wegstelle x in cm) */
  stroemung: function () {
    var n = {}; KINDS.forEach(function (K) { var c = 0; for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) c++; n[K.id] = K.im && K.im.visible ? c : 0; });
    var g = {}; KINDS.forEach(function (K) { var c = 0; for (var i = 0; i < K.n; i++) if (K.gv[i] > 0.001) c++; g[K.id] = K.im && K.im.visible ? c : 0; });   /* imGefaess: sichtbare Teilchen in Gefaessen (und hinter dem After) */
    return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, uebergang: fe, te: clock - tM, sichtbar: n, imGefaess: g };
  },
  teilchen: function () {
    var out = [];
    KINDS.forEach(function (K, ki) { for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) { K.im.getMatrixAt(i, STM); out.push({ art: K.id, x: K.xg[i], r: K.vis[i], tip: K.tip[i], p: [STM.elements[12], STM.elements[13], STM.elements[14]] }); } });
    return out;
  },
  /* fuer die Pruefung: Teilchen ausserhalb des Innenraums (Abstand zur Mittellinie + Radius groesser als der freie Radius bis zur Schleimhaut, gemessen an den Feldern der Form,
     nicht an der Tabelle der Stroemung); ohne die Verbindung zur Bauhin-Klappe und ohne den Austritt an der Papille */
  innen: function () {
    var D = geoDaten, X = WGX, AB = D.dk.abschnitte, bDuo = D.RZ[1].def.schichten[2].b, bDu = D.RZ[2].def.schichten[2].b, bMast = D.RZ[4].def.schichten[4].b, DUO_R = form.BAHN.duodenum.r, DU_R = form.DUENN_R;
    var n = 0, aus = 0, schlimm = 0, bsp = null;
    KINDS.forEach(function (K, ki) {
      for (var i = 0; i < K.n; i++) {
        if (!(K.vis[i] > 0.001) || K.tip[i] > 0) continue;
        var x = K.xg[i]; if (x > X.u1 && x < X.c0) continue;
        K.im.getMatrixAt(i, STM);
        var px = STM.elements[12] + M[0], py = STM.elements[13] + M[1], pz = STM.elements[14] + M[2], A, fr, d, s;
        if (x < X.u0) { A = D.Aduo; d = A.q(px, py, pz); s = A.s; fr = DUO_R + (DU_R - DUO_R) * sstep(A.laenge - 1.4, A.laenge, s) - bDuo(s, A.phi()); }
        else if (x <= X.u1) { A = D.du.achse; d = A.q(px, py, pz); s = A.s; fr = DU_R - bDu(s, A.phi()); }
        else { A = D.dk.achse; d = A.q(px, py, pz); s = A.s; fr = D.dk.R(s, A.phi()) - (s >= X.sM ? bMast(s, A.phi()) : 0.72); }
        n++;
        var ueber = d + K.vis[i] - fr;
        if (ueber > 0.02) { aus++; if (ueber > schlimm) { schlimm = ueber; bsp = { art: K.id, i: i, x: x, d: d, r: K.vis[i], frei: fr, s: s }; } }
      }
    });
    return { geprueft: n, ausserhalb: aus, schlimmster: schlimm, beispiel: bsp };
  },
  /* fuer die Pruefung: Uhr lesen oder setzen (Sekunden bei "normal") */
  uhr: function (t) { if (t !== undefined) { clock = t; if (ST) ST.letzt = ''; lv++; } return clock; },
  /* fuer die Pruefung: Uebergang (roh 0..1) und Zeit sofort setzen und festhalten */
  stand: function (f, te) { fzFest = true; fzR = f; fe = sstep(0, 1, f); mahlzeit = f > 0.5; if (te !== undefined) tM = clock - te; $('bNuechtern').classList.toggle('on', !mahlzeit); $('bEssen').classList.toggle('on', mahlzeit); lv++; },
  form: function () { return form; },
  zotte: function (s) { zoOeffnen(s === undefined ? null : s); }, stelle: function () { return { wahl: zoWahl, letzte: zoLetzte, standard: zoStandard }; } };   /* Fahrt zur Duenndarmzotte (fuer die Pruefung), gewaehlte Stelle */
var bereitMerker = false;
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  var k, bewegt = false, neuBereit = false;
  if (bereitMerker && !App.ready) { bereitMerker = false; neuBereit = true; clock = 0; root.visible = true; App.aufbauMs = Math.round(performance.now() - t0); App.ready = true; }   /* die Uhr beginnt in diesem Bild bei 0 */
  for (k = 1; k <= 4; k++) if (OPEN[k] !== OZ[k]) {   /* Deckel gleitet weich (ca. 600 ms) */
    OPEN[k] = Math.max(0, Math.min(1, OPEN[k] + Math.sign(OZ[k] - OPEN[k]) * dt / 0.6));
    if (Math.abs(OPEN[k] - OZ[k]) < 1e-6) OPEN[k] = OZ[k];
    bewegt = true;
  }
  if (bewegt && !fz) { applyVisibility(); applyLook(); lv++; }
  if (ST && !fz) { if (App.ready && !neuBereit) stroemungSchritt(dt); stroemungBild(); if (schemaOn) SCH.update(); }
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  var weiter = fz ? zoFahrtBild(now) : false;
  Kern.kamera(camera, view);
  if (schemaOn) return;                                   /* Schema offen: das Bild des Darms ist ausgeblendet und wird nicht gezeichnet */
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
var kamAlt = { near: camera.near, far: camera.far };
organ.abbauen = function () {
  abgebaut = true;
  fz = null;
  canvas.style.pointerEvents = '';
  orbit.loesen();
  wzEnde();
  schemaWeicht(); SCH.abbauen();
  clearTimeout(quizT); clearTimeout(wegeT);
  document.body.classList.remove('ueben');
  clearTimeout(Kern.toast._t);
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
  var tt = $('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  delete window.DarmApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  applyLook();
  setSelected(selected);
  stroemungBauen();
  zoP = Kern.organLaden('zotte', { ohneCss: true }).then(function (o) { return o; }, function (e) { zoFehl = true; console.warn(e && e.message || e); return null; });   /* nur das Skript, im Hintergrund: liefert organ.form und organ.start fuer die Fahrt (erzeugt keine three.js-Objekte) */
  if (umg.von === 'zotte') { zoP.then(function () { if (!abgebaut) { zoRueckkehr(); bereitMerker = true; } }); return; }   /* Rueckweg aus dem Zotten-Modell */
  bereitMerker = true;   /* sichtbar und bereit wird das Organ im naechsten Bild (loop), damit die Uhr der Stroemung immer im selben Bild beginnt (unabhaengig von der Ladezeit) */
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('darm', organ);
})();
