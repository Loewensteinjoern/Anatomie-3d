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
   Krankheitsbilder und Medikamente (Kern.Szenarien, Daten SZ_DATEN): Reiter und Erklaerkarte; in 3D wirken Gastritis (roeter, dickere Falten, Erosionen am Magenvorhof), Geschwuer
   (Krater am Magenwinkel), Reflux (Wulst weiter, Saft steigt in die Speiseroehre, Speiseroehre gerroetet), weniger Saeure, schnellere Muskelwellen (Abschnitt 7c).
   Lupe (Abschnitt 7d): Nahansicht einer Magendruese und ihrer Belegzelle als Canvas-Schema, folgt Mahlzeit-Schalter und Krankheitsbildern.
   Export (7e: GLB statisch und animiert, STL; Krankheitsbilder werden aus denselben Formeln in die Kopie gebacken) und AR (7f: WebXR, USDZ fuer AR Quick Look) wie bei der Leber.
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
    <span class="sep"></span>
    <button id="bSchema" class="gh" title="Der Weg der Nahrung von Mund bis After – der Magen hervorgehoben">Schema</button>
    <button id="bLupe" class="gh" title="Lupe: Nahansicht einer Magendrüse">Lupe</button>
    <button id="bAR" class="gh" title="Den Magen mit der Kamera in den Raum stellen">AR</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bSee" class="gh" title="Magenwand durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <span class="sep"></span>
    <button id="bNuechtern" class="gh on" title="Zwischen den Mahlzeiten: Der Magen ist klein, die Falten sind hoch">nüchtern</button>
    <button id="bEssen" class="gh" title="Nach einer Mahlzeit: Der Magen ist gefüllt, Muskelwellen treiben den Speisebrei zum Pförtner">nach dem Essen</button>
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

<div class="panel" id="schema" aria-label="Schema: Weg der Nahrung">
  <div class="sch-head"><span class="kick">Schema &middot; Weg der Nahrung</span><span class="sch-hint">Gleiche Stoffe wie im 3D-Modell, der Magen hervorgehoben.</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schließen">&times;</button></div>
  <div id="schemaBox"></div>
</div>

<div class="panel" id="lupe" aria-live="polite">
  <button class="gh hbtn" id="bLupeX" aria-label="Lupe schließen">&times;</button>
  <div class="lp-kick">Lupe &middot; Nahansicht</div>
  <h3 id="lpTitle">Magendrüse &ndash; Schnitt durch die Schleimhaut</h3>
  <div class="lp-chips" id="lpChips"><button class="gh on" data-m="0" title="Die Drüse bildet wenig Säure">nüchtern</button><button class="gh" data-m="1" title="Die Belegzellen pumpen viel Säure in den Magen">nach dem Essen</button><button class="gh" id="lpZurueck" style="display:none">← zurück zur Drüse</button></div>
  <div class="lp-main"><div class="lp-bild"><canvas id="lpCv"></canvas><p class="lp-hint" id="lpHint">Tippe auf eine Belegzelle, um hineinzusehen.</p></div>
  <div class="lp-text" id="lpText"></div></div>
  <div class="lp-leg" id="lpLeg"><span><i style="background:#FF8A78"></i>Säure (H⁺)</span><span><i style="background:#D9C2FF"></i>Pepsin</span><span><i style="background:#F3E7A8"></i>Schleim</span><span><i style="background:#9FD6F2"></i>Bicarbonat</span></div>
</div>

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

<div class="panel" id="exp">
  <span class="tag">Export</span>
  <button id="bGlbA" class="gh">GLB &middot; animiert</button>
  <button id="bGlbS" class="gh">GLB &middot; statisch</button>
  <button id="bStl" class="gh">STL</button>
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
</div>

<div id="arUI" aria-live="polite">
  <div class="ar-top"><span class="ar-title">Magen in AR</span><span class="ar-phase" id="arPhase"></span><button class="ar-b" id="arEnd">Beenden</button></div>
  <div class="ar-hint" id="arHint">Bewege das Gerät langsam über den Tisch, bis ein Ring erscheint &ndash; dann tippen, um den Magen hinzustellen.</div>
  <div class="ar-bot">
    <button class="ar-b" id="arSmall">Kleiner</button>
    <button class="ar-b" id="arBig">Gr&ouml;&szlig;er</button>
    <button class="ar-b" id="arPlace">Neu hinstellen</button>
    <button class="ar-b" id="arPause">Pause</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
/* Hilfekarten: [Schluessel, Titel, Text, Merke] (Texte von Joern freigegeben) */
var HILFE = [
  ['aufgaben', 'Aufgaben des Magens', 'Der Magen nimmt eine Mahlzeit auf und speichert sie. Seine Muskeln kneten die Nahrung und mischen sie mit Magensaft zu einem feinen Speisebrei. Die Salzsäure tötet die meisten Keime ab, und das Enzym Pepsin beginnt mit der Verdauung der Eiweiße. Über den Pförtner gibt der Magen den Speisebrei in kleinen Portionen an den Zwölffingerdarm weiter. Außerdem bildet er den Intrinsic-Faktor, ohne den Vitamin B12 im Darm nicht aufgenommen werden kann.',
    'Nach einer Magenentfernung fehlt der Intrinsic-Faktor – Vitamin B12 muss dann lebenslang gespritzt werden.'],
  ['magensaft', 'Magensaft und Schutz der Schleimhaut', 'Die Drüsen in Magengrund und Magenkörper bilden täglich 2–3 Liter Magensaft: Salzsäure (pH 1–2), Pepsin, Schleim und Intrinsic-Faktor. Angeregt wird er schon durch Anblick und Geruch von Essen (Vagusnerv), dann durch die Dehnung des Magens und das Hormon Gastrin. Vor der eigenen Säure schützt sich der Magen mit einer dicken Schleimschicht, Bicarbonat und einer guten Durchblutung.',
    'Schmerzmittel wie Ibuprofen oder Diclofenac (NSAR), Kortison, Stress und das Bakterium Helicobacter pylori schwächen diesen Schutz – es können Geschwüre entstehen.'],
  ['entleerung', 'Wie der Magen sich leert', 'Muskelwellen laufen etwa dreimal pro Minute vom Magenkörper zum Pförtner. Nur fein zerkleinerte Teile kommen hindurch, größere werden zurückgeworfen und weiter zerrieben. Wasser fließt entlang der kleinen Kurvatur in wenigen Minuten weiter, Kohlenhydrate verlassen den Magen schneller als Eiweiß, Fett am langsamsten. Eine Mahlzeit bleibt so 1–5 Stunden im Magen.',
    'Fettreiches Essen „liegt schwer im Magen“ – Fett im Zwölffingerdarm bremst die Entleerung.'],
  ['pflege', 'Pflege: nüchtern, Erbrechen, Magensonde', 'Vor einer Narkose bleiben Patientinnen und Patienten nüchtern, damit kein Mageninhalt in die Lunge gelangt (Aspiration) – wie lange, legen die ärztliche Anordnung bzw. der Hausstandard fest. Beim Erbrechen achten Pflegende auf Menge, Farbe und Beimengungen: kaffeesatzartiges Erbrechen spricht für eine Blutung im Magen. Die Lage einer Magensonde wird vor jeder Gabe geprüft, zum Beispiel durch Abhören (mit einer Blasenspritze Luft in die Sonde geben und mit dem Stethoskop über dem Magen hören, ob sie dort ankommt) oder durch einen pH-Test des Magensafts – nach Hausstandard.',
    'Bei Bewusstseinsstörungen droht beim Erbrechen die Aspiration – Seitenlage, Absaugbereitschaft.'],
  ['modell', 'So liest du das Modell', 'Der Magen ist von vorn dargestellt, so wie er im Körper liegt, mit dem Ende der Speiseröhre und dem Anfang des Zwölffingerdarms. Die Teilchen stehen für Stoffe: gelb Kohlenhydrate, orange Eiweiß, weiß Fett, hellblau Wasser, türkis Magensaft. Mit den Schaltern unter „Stoffe“ kannst du jeden Stoff einzeln verfolgen. „Innenansicht“ hebt die vordere Wand ab, „Durchsicht“ macht sie gläsern. Der Schalter „nüchtern / nach dem Essen“ füllt den Magen. Die Zeit läuft stark gerafft.',
    'Säure und Pepsin verdauen im Magen nur Eiweiß an – die eigentliche Verdauung aller Nährstoffe beginnt erst im Zwölffingerdarm.']
];
/* Ueben "Wege verfolgen": feste Reihenfolge der drei Wege (Texte von Joern freigegeben). Station = Liste von Struktur-ids (ids), Anzeigename de (sonst der Name der ersten Struktur);
   mahlzeit = false (nuechtern) oder true (nach dem Essen) schaltet das Modell, fehlt sie, bleibt es wie es ist. Nur Daten: die Abfolge im Code (wegeStart bis wegeAntwort) kennt keine Magen-Besonderheiten. */
var MAGEN_TEIL = ['magenkoerper', 'magengrund', 'magenvorhof'];
var WEGE = [
  { titel: 'Weg der Nahrung', aufgabe: 'Ein Bissen wurde geschluckt. Tippe seine Stationen der Reihe nach an, bis er den Magen verlässt.',
    hinweis: 'Das Modell zeigt jetzt „nach dem Essen“.', mahlzeit: true,
    stationen: [{ ids: ['speiseroehre'] }, { ids: ['mageneingang'] }, { ids: ['magenkoerper'] }, { ids: ['magenvorhof'] }, { ids: ['pfoertner'] }, { ids: ['zwoelffinger'] }],
    abschluss: 'Geschafft: Im Magenkörper wird die Nahrung gesammelt, im Vorhof zerkleinert, und der Pförtner gibt sie portionsweise an den Zwölffingerdarm weiter.' },
  { titel: 'Weg des Magensafts', aufgabe: 'Du riechst etwas Leckeres. Tippe der Reihe nach an, wie der Magensaft angeregt wird und wohin er fließt.',
    stationen: [{ ids: ['vagus'] }, { ids: ['schleimhaut'] }, { ids: ['magenkoerper'] }, { ids: ['magenvorhof'] }, { ids: ['pfoertner'] }],
    abschluss: 'Geschafft: Schon der Geruch regt über den Vagusnerv die Drüsen an; der Magensaft mischt sich mit der Nahrung und gelangt mit ihr zum Pförtner.' },
  { titel: 'Weg des Blutes', aufgabe: 'Das Blut kommt aus der Bauchaorta. Tippe seine Stationen der Reihe nach an, bis es den Magen verlässt.',
    stationen: [{ ids: ['arterien'] }, { ids: MAGEN_TEIL, de: 'Magenkörper' }, { ids: ['venen'] }, { ids: ['pfortader'] }],
    abschluss: 'Geschafft: Das Blut aus dem Magen fließt über die Pfortader zuerst zur Leber.' }
];
/* Notiz der Lesehilfe: ohne und mit Durchsicht bzw. Innenansicht */
var LEGNOTE = ['Der Magen von vorn, wie er im Körper liegt. „Innenansicht“ und „Durchsicht“ zeigen den Inhalt.',
  'Die Teilchen zeigen den Weg der Stoffe – symbolisch, nicht maßstäblich; die Zeit läuft gerafft.'];
/* Krankheitsbilder und Medikamente (Reiter Krankheitsbilder und Medikamente, Texte von Joern freigegeben: docs/freigaben/magen-c1-texte.md). Felder wie bei Kern.Szenarien (id, kind,
   name, short, kicker, lead, values, steps, after, note), dazu datei (Namensteil fuer den Export) und modell = Wirkgroessen 0..1 (gastritis, erosion, ulkus, reflux, helico, schleim,
   pumpe, eingang, essen; nicht genannte sind neutral 0) sowie die Faktoren saeure (Menge des Magensafts) und wellen (tempo der Muskelwellen), neutral 1. helico, schleim und pumpe
   wirken erst in der Lupe (spaeterer Schritt). Die Wirkung in 3D steht in Abschnitt 7c. */
var SZ_EINLEITUNG = { disease: 'Wähle ein Krankheitsbild – im Magen siehst du, wie sich Schleimhaut, Wand und Mageneingang verändern.',
  drug: 'Wähle ein Medikament – es wirkt an dem genannten Krankheitsbild oder zeigt seine Wirkung am Magen.' };
var SZ_AUS = 'Krankheitsbild oder Medikament ausschalten';
var SZ_DATEN = [
  { id: 'gastritis', kind: 'disease', name: 'Magenschleimhautentzündung (Gastritis)', short: 'die Schleimhaut ist gerötet und geschwollen', kicker: 'Entzündung des Magens · akut oder chronisch',
    lead: 'Die Schleimhaut des Magens ist entzündet. Auslöser sind meist das Bakterium Helicobacter pylori, Schmerzmittel wie Ibuprofen, Alkohol oder der Stress einer schweren Krankheit. Die Schleimhaut ist nicht mehr gut gegen die eigene Säure geschützt.',
    values: [['Schleimhaut', 'gerötet, geschwollen, kleine Defekte (Erosionen)'], ['Beschwerden', 'Druck und Schmerz im Oberbauch, Übelkeit, Appetitlosigkeit'], ['Ursachen', 'Helicobacter, Schmerzmittel (NSAR), Alkohol, schwere Krankheit'], ['Verlauf', 'akut meist rasch vorbei, chronisch oft lange ohne Beschwerden']],
    steps: [['Der Schutz wird schwächer.', 'Bakterien, Schmerzmittel oder Alkohol greifen die Schleimschicht an, die die Wand vor der Säure schützt.'], ['Säure erreicht die Zellen.', 'Magensaft dringt in die Schleimhaut ein und reizt sie.'], ['Die Schleimhaut entzündet sich.', 'Sie wird stärker durchblutet, rot und schwillt an; die Falten werden dicker.'], ['Kleine Defekte entstehen.', 'An der Oberfläche gehen Zellen verloren (Erosionen). Reicht der Schaden tiefer, wird daraus ein Geschwür.']],
    after: [['Behandlung', 'Auslöser meiden (Schmerzmittel prüfen, kein Alkohol, nicht rauchen), Säure hemmen (z. B. Pantoprazol), bei Helicobacter Antibiotika.'], ['Pflege beobachtet', 'Schmerzen und ihren Zusammenhang mit dem Essen, Übelkeit und Erbrechen, Appetit, Blutungszeichen (Bluterbrechen, Teerstuhl); Medikamentenplan auf Schmerzmittel prüfen lassen; kleine, leichte Mahlzeiten.']],
    note: 'In 3D ist die Schleimhaut röter, die Falten sind dicker, am Magenvorhof liegen kleine dunkelrote Erosionen. In der Lupe sitzen Helicobacter-Bakterien in der Schleimschicht.',
    datei: 'gastritis', modell: { gastritis: 1, erosion: 1, helico: 1 } },
  { id: 'geschwuer', kind: 'disease', name: 'Magengeschwür (Ulkus)', short: 'ein Defekt reicht tief in die Magenwand', kicker: 'Geschwürkrankheit · Magen und Zwölffingerdarm',
    lead: 'An einer Stelle ist die Schleimhaut zerstört, der Defekt reicht bis in die tieferen Wandschichten. Das Magengeschwür sitzt meist an der kleinen Kurvatur am Magenwinkel. Häufigste Ursachen sind Helicobacter pylori und Schmerzmittel wie Ibuprofen.',
    values: [['Lage', 'kleine Kurvatur am Magenwinkel (noch häufiger im Zwölffingerdarm)'], ['Schmerz', 'im Oberbauch, oft kurz nach dem Essen'], ['Ursachen', 'Helicobacter, NSAR (besonders zusammen mit Kortison), Rauchen'], ['Gefahren', 'Blutung, Durchbruch (Perforation)']],
    steps: [['Säure gegen Schutz.', 'Normalerweise halten Schleim und Bicarbonat die Säure von der Wand fern.'], ['Der Schutz bricht ein.', 'Helicobacter oder Schmerzmittel schwächen ihn an einer Stelle.'], ['Säure und Pepsin dringen ein.', 'Der Magen beginnt, seine eigene Wand anzudauen – es entsteht ein Krater bis in die Unterschleimhaut.'], ['Ein Gefäß kann aufbrechen.', 'Liegt eine Arterie im Grund des Geschwürs, blutet es; im Magen färbt die Säure das Blut schwarz.']],
    after: [['Behandlung', 'Säure hemmen (z. B. Pantoprazol), bei Helicobacter zusätzlich zwei Antibiotika, auslösende Schmerzmittel absetzen; bei Blutung Magenspiegelung mit Blutstillung.'], ['Pflege beobachtet', 'Blutungszeichen – Bluterbrechen (hellrot oder kaffeesatzartig), Teerstuhl, Blässe, schneller Puls, fallender Blutdruck; plötzlich brettharter Bauch (Durchbruch) – sofort ärztlich melden; bis zur Klärung nüchtern lassen.']],
    note: 'In 3D liegt am Magenwinkel ein Krater mit hellem Grund und gerötetem Rand (am besten in der Innenansicht). In der Lupe reicht der Defekt durch die Schleimhaut, Helicobacter sitzt in der Schleimschicht.',
    datei: 'geschwuer', modell: { ulkus: 1, helico: 1 } },
  { id: 'reflux', kind: 'disease', name: 'Refluxkrankheit', short: 'Magensaft fließt zurück in die Speiseröhre', kicker: 'Erkrankung am Mageneingang · Sodbrennen',
    lead: 'Der Verschluss am Mageneingang hält nicht dicht. Saurer Magensaft steigt in die Speiseröhre, deren Schleimhaut dafür nicht gemacht ist. Sie entzündet sich (Refluxösophagitis).',
    values: [['Leitzeichen', 'Sodbrennen, saures Aufstoßen'], ['Verstärkt durch', 'Liegen, große und fette Mahlzeiten, Übergewicht, Alkohol, Rauchen'], ['Speiseröhre', 'unteres Ende gerötet, entzündet'], ['Folgen', 'Engstellen, Umbau der Schleimhaut (Barrett), selten Krebs']],
    steps: [['Der Verschluss wird schwach.', 'Der Muskelring am Mageneingang und der Halt im Zwerchfell schließen nicht mehr fest.'], ['Magensaft steigt auf.', 'Vor allem nach dem Essen und im Liegen fließt Säure zurück in die Speiseröhre.'], ['Die Speiseröhre entzündet sich.', 'Ihre Schleimhaut ist nicht gegen Säure geschützt – sie brennt, wird rot und wund.'], ['Auf Dauer baut sie sich um.', 'Ständiger Reflux kann die Schleimhaut verändern (Barrett) und Engstellen bilden; das wird regelmäßig kontrolliert.']],
    after: [['Behandlung', 'Säure hemmen (z. B. Pantoprazol), Gewicht senken, kleine Mahlzeiten, abends spät nichts mehr essen, Oberkörper im Bett höher lagern; selten eine Operation.'], ['Pflege beobachtet', 'Sodbrennen und seinen Zusammenhang mit Essen und Lage, Schluckbeschwerden, nächtlichen Husten; Oberkörper hochlagern, nach dem Essen nicht flach hinlegen; bei Magensonde und Sondenkost auf die Oberkörperhochlage achten (Aspiration).']],
    note: 'In 3D ist der Wulst am Mageneingang schlaffer, türkiser Magensaft steigt in die Speiseröhre, ihr unteres Ende ist gerötet. Nach dem Essen ist es deutlicher.',
    datei: 'reflux', modell: { reflux: 1 } },
  { id: 'pantoprazol', kind: 'drug', name: 'Pantoprazol beim Magengeschwür (z. B. Pantozol®)', short: 'hemmt die Säurebildung, das Geschwür kann heilen', kicker: 'Medikament · Protonenpumpenhemmer (PPI)',
    lead: 'Pantoprazol sperrt in den Belegzellen die Protonenpumpe, die die Säure herstellt. Es entsteht viel weniger Säure, und das Geschwür kann abheilen.',
    values: [['Wirkung', 'Magensäure stark ↓'], ['Einnahme', 'morgens, etwa 30 Minuten vor dem Frühstück'], ['Dauer', 'beim Geschwür meist 4–8 Wochen'], ['Nebenwirkungen', 'Kopfschmerz, Durchfall; bei Dauergabe Magnesium- und Vitamin-B12-Mangel, mehr Darminfektionen']],
    steps: [['', 'Pantoprazol wird im Darm aufgenommen und erreicht mit dem Blut die Belegzellen.'], ['', 'In den sauren Kanälchen der Zelle wird es wirksam und sperrt die Protonenpumpen dauerhaft.'], ['', 'Kaum noch Säure wird in den Magen gepumpt – erst neu gebildete Pumpen arbeiten wieder.'], ['', 'Ohne Säure kann die Schleimhaut den Krater von den Rändern her schließen.']],
    after: [['Achtung', 'Nicht ohne Grund auf Dauer geben; nach langer Gabe langsam absetzen (die Säure kann überschießend zurückkommen). Bei Helicobacter allein nicht ausreichend – zusammen mit Antibiotika.'], ['Pflege beobachtet', 'Einnahme vor dem Frühstück, Schmerzen, Blutungszeichen; Tablette nicht zerkleinern (magensaftresistent) – bei Magensonde die Darreichung mit der Apotheke klären.']],
    note: 'Wirkt beim Magengeschwür. In 3D kommt weniger türkiser Magensaft, der Krater wird kleiner. Tippe in der Lupe auf eine Belegzelle: Dort sind die Protonenpumpen gesperrt.',
    datei: 'pantoprazol', modell: { ulkus: 0.4, helico: 1, saeure: 0.3, pumpe: 1 } },
  { id: 'nsar', kind: 'drug', name: 'Ibuprofen und Diclofenac – Schaden am Magen (NSAR)', short: 'Schmerzmittel schwächen den Schutz der Schleimhaut', kicker: 'Medikament · nichtsteroidales Antirheumatikum, Nebenwirkung',
    lead: 'NSAR hemmen die Bildung von Prostaglandinen. Das lindert Schmerz und Entzündung – aber Prostaglandine schützen auch die Magenschleimhaut. Ohne sie wird die Schleimschicht dünn, und die Säure greift die Wand an.',
    values: [['Wirkstoffe', 'Ibuprofen, Diclofenac, Naproxen, ASS'], ['Schaden', 'Erosionen bis Geschwür, oft ohne Schmerz'], ['Höheres Risiko', 'Alter, frühere Geschwüre, Kortison, Blutverdünner'], ['Schutz', 'bei Dauergabe Pantoprazol nach Anordnung']],
    steps: [['', 'Das Schmerzmittel wirkt im ganzen Körper, nicht nur am Ort des Schmerzes.'], ['', 'In der Magenschleimhaut fehlen die Prostaglandine: weniger Schleim, weniger Bicarbonat, schlechtere Durchblutung.'], ['', 'Die Schleimschicht wird dünn, Säure und Pepsin erreichen die Zellen.'], ['', 'Es entstehen kleine Defekte (Erosionen), daraus kann ein Geschwür werden.']],
    after: [['Achtung', 'NSAR schaden dem Magen auch als Zäpfchen oder Spritze; die Schmerzlinderung kann Warnzeichen verdecken. Rezeptfrei gekaufte Mittel mit erfragen.'], ['Pflege beobachtet', 'Magenschmerzen, Übelkeit, Teerstuhl und Blässe; Einnahme zu den Mahlzeiten; bei Dauergabe nachfragen, ob ein Magenschutz angeordnet ist.']],
    note: 'In 3D liegen am Magenvorhof kleine Erosionen, die Schleimhaut ist leicht gerötet. In der Lupe ist die Schleimschicht dünn.',
    datei: 'nsar', modell: { gastritis: 0.35, erosion: 1, schleim: 1 } },
  { id: 'mcp', kind: 'drug', name: 'Metoclopramid bei Übelkeit (z. B. Paspertin®)', short: 'beschleunigt die Magenentleerung', kicker: 'Medikament · Mittel gegen Übelkeit (Prokinetikum)',
    lead: 'Metoclopramid dämpft das Brechzentrum im Gehirn und regt die Muskulatur von Magen und Zwölffingerdarm an. Der Mageneingang schließt fester, der Magen leert sich schneller.',
    values: [['Wirkung', 'Übelkeit ↓, Magenentleerung schneller'], ['Wirkbeginn', 'nach 30–60 Minuten (Tablette), i. v. nach wenigen Minuten'], ['Dauer der Gabe', 'höchstens 5 Tage'], ['Nebenwirkungen', 'Unruhe, Müdigkeit, Bewegungsstörungen (z. B. Zungen- und Blickkrämpfe)']],
    steps: [['', 'Metoclopramid blockiert Andockstellen für Dopamin im Brechzentrum und im Magen.'], ['', 'Der Muskelring am Mageneingang spannt sich stärker.'], ['', 'Die Muskelwellen laufen schneller über den Magen, der Pförtner öffnet öfter.'], ['', 'Der Speisebrei gelangt rascher in den Zwölffingerdarm, die Übelkeit lässt nach.']],
    after: [['Achtung', 'Nicht bei Darmverschluss, Blutung im Magen-Darm-Trakt oder Parkinson (verstärkt die Bewegungsstörung); bei Kindern nur eingeschränkt.'], ['Pflege beobachtet', 'Übelkeit und Erbrechen vorher und nachher, Unruhe, ungewöhnliche Bewegungen in Gesicht, Zunge und Augen – sofort melden; i. v. langsam geben.']],
    note: 'In 3D steht der Magen auf „nach dem Essen“: Die Muskelwellen laufen schneller, der Pförtner öffnet öfter, der Mageneingang schließt fester.',
    datei: 'mcp', modell: { wellen: 1.6, eingang: 1, essen: 1 } }
];
var organ = { renderer: {}, aufbauen: aufbauen };
/* Mitte des Magens im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, der Magen steht im Modell mittig (Ziel der Kamerafahrt aus dem Koerper) */
var M = [4, 105, 0];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und fuer die Fahrt aus dem Koerper;
   ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt ZIEL_K minus M); leicht von unten links, damit Pfoertner, Kurvaturen und Magengrund gut zu sehen sind */
var ZIEL_K = [3, 106, 1];
var UEBERSICHT = { theta: -0.3, phi: 1.75, ext: [24, 26], halb: 12, ziel: [ZIEL_K[0] - M[0], ZIEL_K[1] - M[1], ZIEL_K[2] - M[2]] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
var DECKEL_WEG = 7;                                /* so weit gleitet die vordere Haelfte nach vorn (cm) */
/* Freier Bereich fuer Magen und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten, ueben) {
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 54, y1: Math.max(150, toolsOben - 14 - 0.20 * h), labW: 104, fit: 70 };   /* Handy beim Ueben: die Karte (20 % der Hoehe) liegt direkt ueber der Werkzeugleiste, der Magen steht darueber */
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 70 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, der Magen steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (WERKZEUG_H, vier Zeilen; kommen Zeilen dazu, ist sie neu zu messen); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (WERKZEUG_H.handy + (w < WERKZEUG_H.umbruch ? WERKZEUG_H.zeile : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + WERKZEUG_H.desktop };
}
var WERKZEUG_H = { desktop: 150, handy: 126, umbruch: 434, zeile: 30 };   /* Hoehe der Leiste (Pixel); in der ersten Reihe (Ausschnitt) stehen auch Lupe und AR: unter der Breite umbruch (gemessen) bricht sie um und die Leiste wird um zeile (gemessen) hoeher */
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
['arterien', 'venen', 'vagus'].forEach(function (k) { MAT[k + 'D'] = mat(STRUCT[k].col, { rough: 0.4, coat: 0.3 }); });   /* Teile an der vorderen Wand (blenden mit dem Deckel aus) */
MAT.zwerchfell = mat(0xC98378, { rough: 0.6, opacity: 0.3, side: THREE.DoubleSide });   /* heller als der Farbpunkt: sonst liest sich die Platte vor dem dunklen Grund als Schatten */
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });
/* Wand, Schleimhaut, Kappen und Gefaesse nehmen an der Fuellung und an den Wellen teil (Abschnitt 2b) */
Object.keys(MAT).forEach(function (k) { if (k !== 'speiseroehre' && k !== 'zwoelffingerRohr' && k !== 'zwerchfell') welleMat(MAT[k]); });

var root = new THREE.Group(); root.name = 'Magen'; root.position.set(-M[0], -M[1], -M[2]); scene.add(root);   /* Koerper-Koordinaten, um die Mitte M verschoben */
root.visible = false;   /* erst nach dem Aufbau zeigen: three.js (r128) legt die Morph-Tabelle eines Netzes beim ersten Zeichnen an, die Morph-Ziele (Abschnitt 2b) muessen davor da sein */
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
var VORN_Y = 109.5;                               /* Gefaesse und Nerven der vorderen Wand: nur unterhalb dieser Hoehe (cm) gehoeren sie zum Deckel */
var HA = klein ? 0.28 : 0.2;                      /* Gitterweite der Aussenflaeche (cm) */
var HI = klein ? 0.2 : 0.16;                      /* Gitterweite des Innenraums (mit den Falten) */
var HC = klein ? 0.14 : 0.1;                      /* Raster der Schnittflaeche (Kappen) */

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
async function netz(fn, bounds, h, fortschritt) {
  var G = S.makeGrid(bounds, h), F = await S.evalFeld(G, fn, fortschritt);
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
var ZW_H = 0.15, ZW_RAND = 3.0, ZW_LOCH = 4.4;
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

/* =====================================================================
   2b. Fuellung (nuechtern <-> nach dem Essen) und Muskelwellen - ohne neu zu vernetzen
   Jedes Netz der Wand (Aussenflaeche, Schleimhaut, Kappen, Gefaesse) bekommt ein Morph-Ziel: die Lage seiner Punkte bei Fuellung f = 1 (der Magen dehnt sich, die Falten
   glaetten sich). Die Abbildung eines Punkts p (nuechtern) auf f = 1 ist form.abbilden(p, 1) (Parameter in der Mittellinie, Tiefe in der Wand, Falten gestaucht), die Hoehe
   wird weich unter der sichtbaren Zwerchfellkuppel begrenzt (den unsichtbaren Nachbarn weicht das Detailmodell nicht aus). Danach werden die neuen Lagen ueber die Kanten aller
   Netze geglaettet und umgeklappte Dreiecke entwirrt (alle Netze nutzen dieselbe Abbildung und bleiben aneinander haengen; die Punkte der Schnittkappen bleiben beim
   Glaetten stehen: glatte Kanten). Die Gefaesse folgen ueber ihre Mittellinien (Rohre mit gleicher Aufteilung). Die Muskelwellen und der Pfoertner
   laufen im Vertex-Shader (onBeforeCompile): je Punkt sind Lage s entlang der Mittellinie (Bogenlaenge, 0 = Magengrund, 1 = Pfoertner), Gewicht w, Vektor von der Mittellinie
   zum Punkt (nuechtern d0 und gefuellt d1) und Richtung der Mittellinie hinterlegt; die Welle schnuert die Wand um die Mittellinie ein (Gauss-Profil in s, in den
   Uniforms uWelle), der Pfoertner schliesst den Innenraum im Kanal (uKc). Wo die Zuordnung zur Mittellinie mehrdeutig ist (Innenseite der Biegung), wird sie ueber ein
   grobes Gitter weich gemischt (keine Spruenge, keine Risse).
   ===================================================================== */
var ML = null, FA = null;                                   /* Tabellen der Mittellinie (nuechtern, gefuellt) und Abbildung */
var GS = 0.5;                                               /* Gitterweite der Verschiebung durch die Nachbarn (cm) */
var MG = { aussen: [], innen: [], kappe: [], rohr: [] };    /* Netze je Gruppe (mit Morph-Ziel) */
var MORPH_ENTWIRRT = 0;
var MORPH = [];                                             /* alle Netze mit Morph-Ziel (Fuellung) */
var WU = { uWelle: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] }, uKc: { value: 0.85 }, uPyl: { value: new THREE.Vector2(0.9, 0.95) }, uL: { value: 20 } };
var WELLE_B = 0.055;                                        /* halbe Breite der Welle (in s, Anteil der Bogenlaenge) */
var GLSL_KOPF = [
  'attribute vec2 aS;', 'attribute vec3 aD0;', 'attribute vec3 aD1;', 'attribute vec3 aT;',
  'uniform vec3 uWelle[3];', 'uniform float uKc;', 'uniform vec2 uPyl;', 'uniform float uL;',
  'float wK(float s) { float k = 0.0; for (int i = 0; i < 3; i++) { float t = (s - uWelle[i].x) / uWelle[i].z; k += uWelle[i].y * exp(-t * t); } return min(k, 0.7) * (1.0 - smoothstep(0.93, 0.985, s)); }',
  'float wDK(float s) { float k = 0.0; for (int i = 0; i < 3; i++) { float t = (s - uWelle[i].x) / uWelle[i].z; k += uWelle[i].y * exp(-t * t) * (-2.0 * t / uWelle[i].z); } return k * (1.0 - smoothstep(0.93, 0.985, s)); }'
].join('\n');
var GLSL_POS = [
  '{', '  vec3 dd = mix(aD0, aD1, morphTargetInfluences[0]);',
  '  float kw = wK(aS.x) * aS.y;',
  '  float gg = 1.0 - smoothstep(0.35, 1.2, length(dd));',
  '  float sc = (1.0 - kw) * (1.0 - uKc * smoothstep(uPyl.x, uPyl.y, aS.x) * gg * aS.y);',
  '  transformed += dd * (sc - 1.0);', '}'
].join('\n');
var GLSL_NOR = [
  '{', '  vec3 dd2 = mix(aD0, aD1, morphTargetInfluences[0]);', '  float dl = length(dd2);',
  '  float ct = dl > 1e-4 ? abs(dot(normalize(objectNormal), dd2 / dl)) : 0.0;',
  '  float sg = dot(objectNormal, dd2) >= 0.0 ? 1.0 : -1.0;',
  '  objectNormal = normalize(objectNormal + aT * (wDK(aS.x) * aS.y * dl / uL * sg * ct));', '}'
].join('\n');
function welleMat(m) {   /* Material fuer Morph-Ziel und Wellen */
  m.morphTargets = true; m.morphNormals = true;
  m.onBeforeCompile = function (sh) {
    sh.uniforms.uWelle = WU.uWelle; sh.uniforms.uKc = WU.uKc; sh.uniforms.uPyl = WU.uPyl; sh.uniforms.uL = WU.uL;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_KOPF)
      .replace('#include <morphnormal_vertex>', '#include <morphnormal_vertex>\n' + GLSL_NOR)
      .replace('#include <morphtarget_vertex>', '#include <morphtarget_vertex>\n' + GLSL_POS);
  };
}

/* Tabellen: Mittellinie nuechtern und gefuellt (gleiche Parameter), Bogenlaenge nuechtern */
function mlBauen() {
  var m0 = form.mittellinie(0), m1 = form.mittellinie(1), n = m0.length, i;
  ML = { n: n, m: n - 1, P0: [], P1: [], R: [], RZ: [], SC: [0], L: 0 };
  for (i = 0; i < n; i++) {
    ML.P0.push(m0[i].p); ML.P1.push(m1[i].p); ML.R.push(m0[i].r); ML.RZ.push(m0[i].rz);
    if (i) ML.SC.push(ML.SC[i - 1] + Math.sqrt(Math.pow(m0[i].p[0] - m0[i - 1].p[0], 2) + Math.pow(m0[i].p[1] - m0[i - 1].p[1], 2) + Math.pow(m0[i].p[2] - m0[i - 1].p[2], 2)));
  }
  ML.L = ML.SC[n - 1];
  WU.uL.value = ML.L;
  WU.uPyl.value.set((ML.L - 2.2) / ML.L, (ML.L - 1.2) / ML.L);   /* Pfoertnerkanal: die letzten 2,2 cm vor dem Pfoertner (Einschnuerung des Innenraums ab hier) */
}
function mlU(P, u, o) {   /* Punkt der Mittellinie zum Parameter u (Index mit Nachkomma) */
  var i0 = Math.min(ML.m - 1, Math.max(0, Math.floor(u))), t = u - i0, a = P[i0], b = P[i0 + 1];
  o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t;
  return o;
}
function mlSig(u) { var i0 = Math.min(ML.m - 1, Math.max(0, Math.floor(u))), t = u - i0; return (ML.SC[i0] + (ML.SC[i0 + 1] - ML.SC[i0]) * t) / ML.L; }
function mlUvonSig(s) {   /* Umkehrung: Parameter u zur Bogenlaenge s (0..1) */
  var x = Math.max(0, Math.min(1, s)) * ML.L, lo = 0, hi = ML.m;
  while (hi - lo > 1) { var mi = (lo + hi) >> 1; if (ML.SC[mi] <= x) lo = mi; else hi = mi; }
  return lo + (x - ML.SC[lo]) / Math.max(1e-9, ML.SC[lo + 1] - ML.SC[lo]);
}
function mlTang(u, o) {   /* Richtung der Mittellinie (Mittel aus nuechtern und gefuellt) */
  var i0 = Math.min(ML.m - 1, Math.max(0, Math.floor(u))), k, l = 0;
  for (k = 0; k < 3; k++) o[k] = (ML.P0[i0 + 1][k] - ML.P0[i0][k]) + (ML.P1[i0 + 1][k] - ML.P1[i0][k]);
  l = Math.sqrt(o[0] * o[0] + o[1] * o[1] + o[2] * o[2]) || 1;
  o[0] /= l; o[1] /= l; o[2] /= l;
  return o;
}
/* Lage eines nuechternen Punkts zur Mittellinie: Parameter u (weiches Minimum ueber die Nachbarabschnitte). An der Innenseite der Biegung (Incisura) ist die Zuordnung
   mehrdeutig und springt; deshalb wird sie nur an den Knoten eines groben Gitters (GW) berechnet und dazwischen linear gemischt: die Einschnuerung haengt dann stetig vom
   Ort ab (keine Risse), an der Biegung gleitet sie weich aus. */
var KO = { u: 0, s: 0 }, GW = 0.7, KN = new Map();
function koord(p) {
  var m = ML.m, P = ML.P0, R = ML.R, RZ = ML.RZ, j, b = 1e9, bj = 0, kz = KZ_, tt = TT_;
  for (j = 0; j < m; j++) {
    var a = P[j], c = P[j + 1], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], l2 = vx * vx + vy * vy + vz * vz;
    var t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy + (p[2] - a[2]) * vz) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    var dx = p[0] - a[0] - vx * t, dy = p[1] - a[1] - vy * t, dz = p[2] - a[2] - vz * t;
    var rt = R[j] + (R[j + 1] - R[j]) * t, rzt = RZ[j] + (RZ[j + 1] - RZ[j]) * t, at = rt / rzt, zt = dz * at;
    kz[j] = (Math.sqrt(dx * dx + dy * dy + zt * zt) - rt) / (at > 1 ? at : 1); tt[j] = t;
    if (kz[j] < b) { b = kz[j]; bj = j; }
  }
  var sw = 0, su = 0;
  for (j = Math.max(0, bj - 3); j <= Math.min(m - 1, bj + 3); j++) { var w = Math.exp(-(kz[j] - b) * 8); sw += w; su += w * (j + tt[j]); }
  KO.u = su / sw; KO.s = mlSig(KO.u);
  return KO;
}
function wellenKnoten(i, j, k) {   /* Knoten des Gitters: Bogenlaenge s, Punkt der Mittellinie (nuechtern, gefuellt) und Richtung */
  var key = i + 4096 * (j + 4096 * k), v = KN.get(key);
  if (v) return v;
  var o = koord([i * GW, 90 + j * GW, -12 + k * GW]);
  v = { s: o.s, c0: mlU(ML.P0, o.u, [0, 0, 0]), c1: mlU(ML.P1, o.u, [0, 0, 0]), t: mlTang(o.u, [0, 0, 0]) };
  KN.set(key, v);
  return v;
}
function wellenFeld(p, o) {   /* s, c0, c1, t am Ort p (trilinear aus den Knoten) */
  var fx = p[0] / GW, fy = (p[1] - 90) / GW, fz_ = (p[2] + 12) / GW, i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz_), u = fx - i, v = fy - j, w = fz_ - k, c, q;
  o.s = 0; o.c0[0] = o.c0[1] = o.c0[2] = 0; o.c1[0] = o.c1[1] = o.c1[2] = 0; o.t[0] = o.t[1] = o.t[2] = 0;
  for (c = 0; c < 8; c++) {
    var di = c & 1, dj = (c >> 1) & 1, dk = c >> 2, wt = (di ? u : 1 - u) * (dj ? v : 1 - v) * (dk ? w : 1 - w);
    if (wt < 1e-9) continue;
    var n = wellenKnoten(i + di, j + dj, k + dk);
    o.s += wt * n.s;
    for (q = 0; q < 3; q++) { o.c0[q] += wt * n.c0[q]; o.c1[q] += wt * n.c1[q]; o.t[q] += wt * n.t[q]; }
  }
  var l = Math.sqrt(o.t[0] * o.t[0] + o.t[1] * o.t[1] + o.t[2] * o.t[2]) || 1; o.t[0] /= l; o.t[1] /= l; o.t[2] /= l;
  return o;
}
var KZ_ = new Float64Array(128), TT_ = new Float64Array(128);

/* Abbildung auf f = 1: form.abbilden (Parameter in der Mittellinie, Tiefe in der Wand, Falten gestaucht). Im Detailmodell sind Leber, Milz, Niere usw. nicht zu sehen, ihnen
   weicht die Form hier nicht aus; nur dem sichtbaren Zwerchfell: die Hoehe waechst weich nur bis knapp unter die Kuppel (monoton in y, keine Knicke). */
function abbildungBauen() {
  var a0 = form.aussen(0).sdf, ZA = 0.45, ZW = 1.8;
  function entfernt(x, y, z) {   /* so viel wird von der Hoehe y abgezogen (weiche Begrenzung unter der Kuppel) */
    var lim = lform.kuppel(x, z) - ZA - ZW, e = y - lim;
    return e > 0 ? e - ZW * (1 - Math.exp(-e / ZW)) : 0;
  }
  FA = {
    a0: a0,
    abb: function (p) {
      var q = form.abbilden(p, 1), r = entfernt(q[0], q[1], q[2]) - entfernt(p[0], p[1], p[2]);
      if (r > 0) q[1] -= r;
      return q;
    }
  };
  FA.abbF = function (p) {   /* wie abb, fuer Punkte ausserhalb der Wand (Gefaesse): weit weg vom Magen keine Verschiebung */
    var q = FA.abb(p), wf = 1 - sstep(1.2, 2.6, a0(p[0], p[1], p[2]));
    return [p[0] + (q[0] - p[0]) * wf, p[1] + (q[1] - p[1]) * wf, p[2] + (q[2] - p[2]) * wf];
  };
}

/* Daten je Punkt (nuechtern p, gefuellt q): s und w (Welle), d0, d1 (Vektor von der Mittellinie), t (Richtung) */
var WF = { s: 0, c0: [0, 0, 0], c1: [0, 0, 0], t: [0, 0, 0] };
function punktDaten(p, q, fade) {
  var o = wellenFeld(p, WF), c0 = o.c0, c1 = o.c1;
  return { p: p, q: q, c1: [c1[0], c1[1], c1[2]], s: o.s, w: fade, d0: [p[0] - c0[0], p[1] - c0[1], p[2] - c0[2]], d1: [q[0] - c1[0], q[1] - c1[1], q[2] - c1[2]], t: [o.t[0], o.t[1], o.t[2]], n: null };
}
/* Netze einer Gruppe (Aussenflaeche, Schleimhaut, Kappen: Dreiecke ohne Index): Morph-Ziel, Normalen des gefuellten Netzes (gemeinsam ueber die Gruppe, damit an den Nahtstellen
   keine Spruenge entstehen) und die Attribute der Welle; async in Scheiben, damit der Ladebalken weiterlaeuft */
async function morphAlle(gruppen, von, bis, titel) {
  var tab = new Map(), uniq = [], mi, i, k, meshes = [];
  var key = function (x, y, z) { return Math.round(x * 400) + 8192 * (Math.round((y - 90) * 400) + 8192 * Math.round((z + 12) * 400)); };
  var vorher = performance.now(), gesamt = 0, fertig = 0;
  gruppen.forEach(function (gr) { gr.meshes.forEach(function (m) { m.userData.feld = gr.feld; m.userData.fid = gr.fid; meshes.push(m); gesamt += m.geometry.attributes.position.count; }); });
  for (mi = 0; mi < meshes.length; mi++) {
    var P = meshes[mi].geometry.attributes.position.array, ids = new Int32Array(P.length / 3);
    for (i = 0; i < ids.length; i++) {
      var kk = key(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]), id = tab.get(kk);
      if (id === undefined) {
        var p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
        id = uniq.length; uniq.push(punktDaten(p, FA.abb(p), 1)); tab.set(kk, id);
      }
      ids[i] = id;
      if (performance.now() - vorher > 40) { await setLoad(von + (bis - von) * 0.8 * (fertig + i) / gesamt, titel); vorher = performance.now(); if (abgebaut) return; }
    }
    fertig += ids.length;
    meshes[mi].userData.ids = ids;
  }
  /* Glaetten: die neue Lage jedes Punkts wird ueber die Kanten aller Netze (gemeinsame Punkte) in 3 Schritten zur Haelfte mit dem Mittel der Nachbarn gemischt; so klappen keine
     Dreiecke um (dort, wo die Falten oder die Zwerchfellkuppel das Netz stark verziehen), alle Netze bekommen dieselbe Lage an gemeinsamen Punkten */
  var nb = uniq.map(function () { return []; });
  gruppen.forEach(function (gr) { if (!gr.feld) gr.meshes.forEach(function (m) { var ids = m.userData.ids, t; for (t = 0; t < ids.length; t++) uniq[ids[t]].fix = true; }); });   /* Punkte der Schnittkappen bleiben, wie die Abbildung sie setzt (glatte Kanten) */
  meshes.forEach(function (m) {
    var ids = m.userData.ids, t, a, b, c;
    for (t = 0; t + 2 < ids.length; t += 3) {
      a = ids[t]; b = ids[t + 1]; c = ids[t + 2];
      nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b);
    }
  });
  var it, nq = uniq.length;
  for (it = 0; it < 3; it++) {
    var neu = new Float64Array(nq * 3);
    for (i = 0; i < nq; i++) {
      var L = nb[i], q = uniq[i].q, sx = 0, sy = 0, sz = 0, nn = L.length;
      if (!nn || uniq[i].fix) { neu[i * 3] = q[0]; neu[i * 3 + 1] = q[1]; neu[i * 3 + 2] = q[2]; continue; }
      for (k = 0; k < nn; k++) { var r = uniq[L[k]].q; sx += r[0]; sy += r[1]; sz += r[2]; }
      neu[i * 3] = 0.5 * q[0] + 0.5 * sx / nn; neu[i * 3 + 1] = 0.5 * q[1] + 0.5 * sy / nn; neu[i * 3 + 2] = 0.5 * q[2] + 0.5 * sz / nn;
    }
    for (i = 0; i < nq; i++) { uniq[i].q = [neu[i * 3], neu[i * 3 + 1], neu[i * 3 + 2]]; }
  }
  /* Umgeklappte Dreiecke (Normale gegenueber nuechtern um mehr als ca. 70 Grad gedreht) entwirren: ihre Ecken und deren Nachbarn werden stark geglaettet, bis keines mehr uebrig ist */
  var bad = function (t, ids) {
    var A = uniq[ids[t]], B = uniq[ids[t + 1]], C = uniq[ids[t + 2]], u0 = [B.p[0] - A.p[0], B.p[1] - A.p[1], B.p[2] - A.p[2]], w0 = [C.p[0] - A.p[0], C.p[1] - A.p[1], C.p[2] - A.p[2]];
    var u1 = [B.q[0] - A.q[0], B.q[1] - A.q[1], B.q[2] - A.q[2]], w1 = [C.q[0] - A.q[0], C.q[1] - A.q[1], C.q[2] - A.q[2]];
    var n0 = [u0[1] * w0[2] - u0[2] * w0[1], u0[2] * w0[0] - u0[0] * w0[2], u0[0] * w0[1] - u0[1] * w0[0]], n1 = [u1[1] * w1[2] - u1[2] * w1[1], u1[2] * w1[0] - u1[0] * w1[2], u1[0] * w1[1] - u1[1] * w1[0]];
    var l0 = Math.sqrt(n0[0] * n0[0] + n0[1] * n0[1] + n0[2] * n0[2]), l1 = Math.sqrt(n1[0] * n1[0] + n1[1] * n1[1] + n1[2] * n1[2]);
    return l0 > 1e-9 && n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2] < 0.35 * l0 * l1;
  };
  for (it = 0; it < 250; it++) {
    var mark = new Uint8Array(nq), cnt = 0;
    meshes.forEach(function (m) { var ids = m.userData.ids, t; for (t = 0; t + 2 < ids.length; t += 3) if (bad(t, ids)) { mark[ids[t]] = mark[ids[t + 1]] = mark[ids[t + 2]] = 1; cnt++; } });
    if (!cnt) break;
    var m2 = new Uint8Array(mark);
    for (i = 0; i < nq; i++) if (mark[i]) nb[i].forEach(function (j) { m2[j] = 1; });
    var neu2 = [];
    for (i = 0; i < nq; i++) {
      if (!m2[i] || !nb[i].length) { neu2.push(null); continue; }
      var L2 = nb[i], q2 = uniq[i].q, tx = 0, ty = 0, tz = 0;
      for (k = 0; k < L2.length; k++) { var r2 = uniq[L2[k]].q; tx += r2[0]; ty += r2[1]; tz += r2[2]; }
      neu2.push([0.15 * q2[0] + 0.85 * tx / L2.length, 0.15 * q2[1] + 0.85 * ty / L2.length, 0.15 * q2[2] + 0.85 * tz / L2.length]);
    }
    for (i = 0; i < nq; i++) if (neu2[i]) uniq[i].q = neu2[i];
    MORPH_ENTWIRRT = it + 1;
  }
  for (i = 0; i < nq; i++) { var o = uniq[i]; o.d1 = [o.q[0] - o.c1[0], o.q[1] - o.c1[1], o.q[2] - o.c1[2]]; }
  await setLoad(von + (bis - von) * 0.85, titel); if (abgebaut) return;
  /* Normalen des gefuellten Netzes: aus dem Gefaelle des Abstandsfelds der Gruppe an der neuen Lage (glatt; zeigt wie bei den nuechternen Netzen nach aussen); Netze ohne
     Feld (Schnittkappen, eben) behalten ihre Normalen */
  var e = 0.04;
  meshes.forEach(function (m) {
    var feld = m.userData.feld, fid = m.userData.fid, ids = m.userData.ids, g = m.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, nv = ids.length, v;
    var dP = new Float32Array(nv * 3), dN = new Float32Array(nv * 3), S = new Float32Array(nv * 2), D0 = new Float32Array(nv * 3), D1 = new Float32Array(nv * 3), T = new Float32Array(nv * 3);
    for (v = 0; v < nv; v++) {
      var o = uniq[ids[v]], n1x = N[v * 3], n1y = N[v * 3 + 1], n1z = N[v * 3 + 2];
      if (feld) {
        if (o.nf === undefined) o.nf = {};
        var nf = o.nf[fid];
        if (nf === undefined) {
          var q = o.q, g0 = feld(q[0], q[1], q[2]), gx = feld(q[0] + e, q[1], q[2]) - g0, gy = feld(q[0], q[1] + e, q[2]) - g0, gz = feld(q[0], q[1], q[2] + e) - g0, gl = Math.sqrt(gx * gx + gy * gy + gz * gz);
          nf = o.nf[fid] = gl > 1e-9 ? [gx / gl, gy / gl, gz / gl] : null;
        }
        if (nf) { n1x = nf[0]; n1y = nf[1]; n1z = nf[2]; }
      }
      for (k = 0; k < 3; k++) { dP[v * 3 + k] = o.q[k] - P[v * 3 + k]; D0[v * 3 + k] = o.d0[k]; D1[v * 3 + k] = o.d1[k]; T[v * 3 + k] = o.t[k]; }
      dN[v * 3] = n1x - N[v * 3]; dN[v * 3 + 1] = n1y - N[v * 3 + 1]; dN[v * 3 + 2] = n1z - N[v * 3 + 2];
      S[v * 2] = o.s; S[v * 2 + 1] = o.w;
    }
    morphSetzen(m, dP, dN, S, D0, D1, T);
    delete m.userData.ids; delete m.userData.feld;
  });
}
function morphSetzen(m, dP, dN, S, D0, D1, T) {
  var g = m.geometry;
  g.morphAttributes.position = [new THREE.BufferAttribute(dP, 3)]; g.morphAttributes.normal = [new THREE.BufferAttribute(dN, 3)]; g.morphTargetsRelative = true;
  g.setAttribute('aS', new THREE.BufferAttribute(S, 2)); g.setAttribute('aD0', new THREE.BufferAttribute(D0, 3)); g.setAttribute('aD1', new THREE.BufferAttribute(D1, 3)); g.setAttribute('aT', new THREE.BufferAttribute(T, 3));
  m.updateMorphTargets(); m.frustumCulled = false;
  if (MORPH.indexOf(m) < 0) MORPH.push(m);
}
/* Gefaesse und Nerv: Rohre entlang der abgebildeten Mittellinien (gleiche Aufteilung wie das nuechterne Rohr): Differenz der Punkte ist das Morph-Ziel */
function morphRohr(m, geo1) {
  var g = m.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, P1 = geo1.attributes.position.array, N1 = geo1.attributes.normal.array, nv = P.length / 3, i, k;
  var dP = new Float32Array(nv * 3), dN = new Float32Array(nv * 3), S = new Float32Array(nv * 2), D0 = new Float32Array(nv * 3), D1 = new Float32Array(nv * 3), T = new Float32Array(nv * 3);
  for (i = 0; i < nv; i++) {
    var p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], q = [P1[i * 3], P1[i * 3 + 1], P1[i * 3 + 2]], a = FA.a0(p[0], p[1], p[2]);
    var o = punktDaten(p, q, 1 - sstep(1.2, 2.6, a));   /* weit weg von der Wand (Pfortader) keine Einschnuerung */
    for (k = 0; k < 3; k++) { dP[i * 3 + k] = q[k] - p[k]; dN[i * 3 + k] = N1[i * 3 + k] - N[i * 3 + k]; D0[i * 3 + k] = o.d0[k]; D1[i * 3 + k] = o.d1[k]; T[i * 3 + k] = o.t[k]; }
    S[i * 2] = o.s; S[i * 2 + 1] = o.w;
  }
  morphSetzen(m, dP, dN, S, D0, D1, T);
}
/* Fuellung setzen (0 = nuechtern, 1 = nach dem Essen) */
function fuellungSetzen(f) { for (var i = 0; i < MORPH.length; i++) MORPH[i].morphTargetInfluences[0] = f; }

var geoDaten = null;   /* Kennpunkte fuer die Beschriftung (Koerper-Koordinaten), nach dem Aufbau */
/* Aufbau: Formen laden -> Aussenwand -> Innenraum -> Kappen -> Rohre -> Zwerchfell (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
async function bauen() {
  await setLoad(0.01, 'Formen laden'); if (abgebaut) return;
  lform = await Kern.formLaden('lunge'); if (abgebaut) return;
  await Kern.formLaden('leber'); if (abgebaut) return;   /* Pfortader und Leberarterie fuer die Gefaesse (die Form der Verdauung greift beim Auswerten darauf zu) */
  form = await Kern.formLaden('verdauung'); if (abgebaut) return;
  mlBauen(); abbildungBauen();
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
  var gA = await netz(aus.sdf, aus.grenzen, HA, weiter(0.03, 0.2)); if (abgebaut) return;
  await setLoad(0.2, 'Magenwand'); if (abgebaut) return;
  var tA = schneide(gA, cut); gA.dispose();
  [['hinten', tA.neg], ['deckel', tA.pos]].forEach(function (h) {
    var z = zerlegen(h[1], ZONEN, 'magenkoerper');
    Object.keys(z).forEach(function (sid) {
      if (!z[sid]) return;
      var d = h[0] === 'deckel';
      MG.aussen.push(addMesh(sid, z[sid], MAT[sid + (d ? 'D' : '')], STRUCT[sid].de + (d ? ' (vorn)' : ''), 3, h[0])); tris.wand += anz(z[sid]);
    });
  });
  await setLoad(0.24, 'Schleimhaut mit Falten'); if (abgebaut) return;
  var lu = form.lumen(0);
  var gI = await netz(lu.sdf, lu.grenzen, HI, weiter(0.24, 0.62)); if (abgebaut) return;
  await setLoad(0.62, 'Schleimhaut mit Falten'); if (abgebaut) return;
  var tI = schneide(gI, cut); gI.dispose();
  var INNEN = { zwoelffinger: ['schleimhaut', 'schleimhaut'], mageneingang: ['mageneingang', 'eingangI'], pfoertner: ['pfoertner', 'pfoertnerI'], schleimhaut: ['schleimhaut', 'schleimhaut'] };
  [['hinten', tI.neg], ['deckel', tI.pos]].forEach(function (h) {
    var z = zerlegen(h[1], ZONEN_I, 'schleimhaut');
    Object.keys(z).forEach(function (zid) {
      if (!z[zid]) return;
      var d = h[0] === 'deckel', e = INNEN[zid];
      MG.innen.push(addMesh(e[0], z[zid], MAT[e[1] + (d ? 'D' : '')], STRUCT[e[0]].de + ' (innen' + (d ? ', vorn' : '') + ')', 2, h[0])); tris.innen += anz(z[zid]);
    });
  });
  await setLoad(0.66, 'Schnittflächen'); if (abgebaut) return;
  var kg = kappenGeo(), KS = [['schleimhaut', 'schleimhaut'], ['muskulatur', 'kSchraeg'], ['muskulatur', 'kRing'], ['muskulatur', 'kLaengs'], ['pfoertner', 'kPfoertner'], ['mageneingang', 'kEingang']];
  kg.forEach(function (g, k) {
    if (!g) return;
    MG.kappe.push(addMesh(KS[k][0], g, MAT[KS[k][1]], STRUCT[KS[k][0]].de + ' (Schnittfläche)', 2, 'kappe')); tris.kappen += anz(g);
  });
  await setLoad(0.72, 'Speiseröhre und Zwölffingerdarm'); if (abgebaut) return;
  /* Speiseroehre: von 2,5 cm ueber der Luecke im Zwerchfell bis 1,5 cm vor dem Ende des Stumpfs in der Wand (ueberlappt dessen oberes Ende); oben offen */
  var eso = form.speiseroehreAnzeige(), el = 0, i;
  for (i = 1; i < eso.length; i++) el += Math.sqrt(Math.pow(eso[i][0] - eso[i - 1][0], 2) + Math.pow(eso[i][1] - eso[i - 1][1], 2) + Math.pow(eso[i][2] - eso[i - 1][2], 2));
  var ep = bogenTeil(eso, 0, el - 1.5);   /* gezeigter Teil der Speiseroehre */
  var eg = rohre([{ pts: ep, r0: form.BAHN.speiseroehre.r, r1: form.BAHN.speiseroehre.r, seiten: 20, segmente: 40, offen: true }]);
  addMesh('speiseroehre', eg, MAT.speiseroehre, STRUCT.speiseroehre.de, 3); tris.rohre += anz(eg);
  /* Zwoelffingerdarm: ab 1,2 cm hinter dem Pfoertner (ueberlappt die Verlaengerung der Wand) bis zum absteigenden Teil; am Ende offen */
  var dp = bogenTeil(duo.slice(0, 12 * 3 + 7), 1.2, 1e9);
  var dg = rohre([{ pts: dp, r0: 1.03, r1: 1.03, seiten: 24, segmente: 48, offen: true }]);
  addMesh('zwoelffinger', dg, MAT.zwoelffingerRohr, STRUCT.zwoelffinger.de + ' (Rohr)', 3); tris.rohre += anz(dg);
  await setLoad(0.78, 'Gefäße und Nerv'); if (abgebaut) return;
  var G = form.gefaesse(0), ln = function (g) { return { pts: g.pts, r0: g.r0, r1: g.r1 }; }, rohrPaare = [];
  /* Was an der vorderen Wand liegt (Aeste der Gefaesse und der vordere Vagusstrang unterhalb der Hoehe VORN_Y), gehoert zum Deckel und blendet mit ihm aus: die Linien werden an der
     Schnittflaeche geteilt (die Teile teilen sich den Grenzpunkt, es bleibt keine Luecke); die Pfortader und alles oberhalb bleiben stehen */
  var istVorn = function (p) { return cut(p[0], p[1], p[2]) > 0 && p[1] < VORN_Y; };
  function teilen(l) {
    var n = l.pts.length, hin = [], vor = [], run = [], flag = null, i, rad = function (t) { return l.r0 + (l.r1 - l.r0) * t * t * (3 - 2 * t); };
    function ab(ende) {
      if (run.length > 1) (flag ? vor : hin).push({ pts: run.map(function (q) { return q.p; }), r0: rad(run[0].i / (n - 1)), r1: rad(run[run.length - 1].i / (n - 1)) });
      run = ende ? [run[run.length - 1]] : [];
    }
    for (i = 0; i < n; i++) {
      var f = istVorn(l.pts[i]);
      if (flag !== null && f !== flag) { run.push({ p: l.pts[i], i: i }); ab(true); flag = f; continue; }   /* Grenzpunkt gehoert zu beiden Teilen */
      flag = f; run.push({ p: l.pts[i], i: i });
    }
    ab(false);
    return { hin: hin, vor: vor };
  }
  [['arterien', G.magenarterien, true], ['venen', G.magenvenen, true], ['pfortader', G.pfortader, false], ['vagus', G.vagus, true]].forEach(function (a) {
    var hin = [], vor = [];
    a[1].forEach(function (l) { if (a[2]) { var t = teilen(l); hin = hin.concat(t.hin); vor = vor.concat(t.vor); } else hin.push(ln(l)); });
    if (hin.length) { var geo = rohre(hin), mh = addMesh(a[0], geo, MAT[a[0]], STRUCT[a[0]].de, 4, 'hinten'); tris.rohre += anz(geo); rohrPaare.push({ m: mh, lin: hin }); }
    if (vor.length) { var gv = rohre(vor), mv = addMesh(a[0], gv, MAT[a[0] + 'D'], STRUCT[a[0]].de + ' (vorn)', 4, 'deckel'); tris.rohre += anz(gv); rohrPaare.push({ m: mv, lin: vor }); }
  });
  await setLoad(0.84, 'Zwerchfell'); if (abgebaut) return;
  var zf = form.zwerchfell(), zg = zwerchfellGeo(zf);
  addMesh('zwerchfell', zg, MAT.zwerchfell, STRUCT.zwerchfell.de, 5); tris.zwerchfell = anz(zg);
  geoDaten = { E: E, P: P, eso: ep, duo: dp, G: G, G1: form.gefaesse(1), vorn: istVorn };
  /* Fuellung: Morph-Ziele aller Netze der Wand und der Gefaesse (Abschnitt 2b) */
  await setLoad(0.86, 'Magen dehnt sich'); if (abgebaut) return;
  await morphAlle([{ meshes: MG.aussen, feld: form.aussen(1).sdf, fid: 'a' }, { meshes: MG.innen, feld: form.lumen(1).sdf, fid: 'i' }, { meshes: MG.kappe, feld: null, fid: 'k' }], 0.86, 0.95, 'Magen dehnt sich'); if (abgebaut) return;
  rohrPaare.forEach(function (rp) {
    var lin1 = rp.lin.map(function (l) { return { pts: l.pts.map(FA.abbF), r0: l.r0, r1: l.r1 }; });
    var g1 = rohre(lin1); morphRohr(rp.m, g1); g1.dispose();
  });
  await setLoad(0.97, 'Beschriftung'); if (abgebaut) return;
  ankerBeide();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, lv = 0;   /* lv: Version fuer die Beschriftung */
ORDER.forEach(function (s) { enabled[s.id] = true; });
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait, vor, auto } */
var wege = null, wegeT = null;   /* Ueben "Wege verfolgen" (siehe Abschnitt vor dem Antippen) */
var autoGehe = false;            /* gehe wird vom Ueben selbst gerufen: keine neue Aufgabe */
var openK = 0, openZiel = 0;   /* 1 = Innenansicht (vordere Haelfte weg), 0 = geschlossen; laeuft weich */

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt: das Zwerchfell zaehlt nicht, die Wand bei Durchsicht auch nicht */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
function applyVisibility() {
  root.traverse(function (o) { if (o.isMesh && !o.userData.teilchen) o.visible = !!enabled[o.userData.sid] && (!o.userData.kappe || openK > 0.02); });   /* Teilchen stellen sich selbst (Stoffe-Schalter) */
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
  ['schleimhaut', 'eingangI', 'pfoertnerI', 'arterien', 'venen', 'vagus'].forEach(function (k) { stelleMat(MAT[k + 'D'], a < 0.999, a); });
  var kv = openK > 0.02;
  kappen.forEach(function (m) { m.visible = kv && !!enabled[m.userData.sid]; });
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
  if (!id) { box.classList.remove('show'); kartenLage(); return; }
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
  lupeClose();                                           /* die Infokarte steht an der Stelle der Lupe */
  kartenLage();
}

/* Krankheitsbilder und Medikamente (Kern.Szenarien, Daten SZ_DATEN): Reiter und Erklaerkarte (id kcard) unten links wie die Infokarte. Die Wirkung in 3D steht in Abschnitt 7c. */
var SZW = { gastritis: 0, erosion: 0, ulkus: 0, reflux: 0, helico: 0, schleim: 0, pumpe: 0, eingang: 0, essen: 0, saeure: 1, wellen: 1 };   /* Wirkgroessen (weich ueberblendet, Summe der Anteile * Werte des Eintrags); saeure und wellen sind Faktoren, neutral 1 */
var KR = null;                                                                            /* Daten der Krankheitsbilder (Abschnitt 7c); entstehen erst bei der ersten Wahl */
var SZ = Kern.Szenarien({
  daten: SZ_DATEN, karte: 'kcard', dauer: 1.2, ausTitel: SZ_AUS,
  beimWechsel: function (id) {
    if (id) {                                          /* Hilfekarte, Info und Ueben weichen der Szenariokarte */
      if (quiz) quizEnd();
      if (wege) wegeEnd();
      setSelected(null); closeCard();
      schemaWeicht();
      lupeClose();                                     /* die Szenariokarte steht an der Stelle der Lupe */
      krankBauen();                                    /* erst jetzt entstehen die three.js-Objekte der Krankheitsbilder */
      if (SZ_DATEN.some(function (sc) { return sc.id === id && sc.modell.essen; })) setMahlzeit(true);   /* Metoclopramid: der Magen steht auf "nach dem Essen" (wie ein Klick auf den Schalter; beim Abwaehlen nicht zurueck) */
      if (window.innerWidth <= 1000) szWeichen();      /* Handy: die Karte deckt den Magen, sie beginnt eingeklappt (Titelzeile) */
    }
    kartenLage();
  },
  beimEinklappen: function () {
    if (SZ.offen) { if (quiz) quizEnd(); if (wege) wegeEnd(); lupeClose(); setSelected(null); closeCard(); }   /* wieder aufgeklappt: die anderen Karten weichen */
    kartenLage();
  }
});
function szWeichen() {
  if (SZ.aktiv && SZ.offen) {
    SZ.zuklappen();
    var bm = SZ.el.querySelector('#bCardMin'); if (bm) bm.textContent = '+';
  }
}
/* Die Szenariokarte steht an der Stelle der Info- und Erklaerkarte: solange eine von ihnen offen ist, ist sie weg */
function kartenLage() {
  if (!SZ || !SZ.el) return;
  SZ.el.classList.toggle('weg', $('scard').classList.contains('show') || $('info').classList.contains('show') || $('lupe').classList.contains('show'));
  lv++;
}

/* Ebene ein- oder ausschalten (Schalter der Leiste) */
function ebene(sid, an) {
  enabled[sid] = an;
  var row = $('row-' + sid); if (row) row.classList.toggle('off', !an);
  applyVisibility(); applyLook();
}
/* Schleimhaut und Muskulatur sind nur in der Innenansicht oder bei Durchsicht zu sehen: wer sie in der Liste waehlt, bekommt die Innenansicht */
function waehleListe(id) {
  if (quiz || wege) return;
  if ((id === 'schleimhaut' || id === 'muskulatur') && !openZiel && !seeThrough) gehe(1);
  setSelected(id);
}

(function leiste() {
  /* Reiter: Strukturen, Hilfekarten, Ueben, Krankheitsbilder, Medikamente */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneH = document.createElement('div'); paneH.id = 'paneHelp';
  var paneU = document.createElement('div'); paneU.id = 'paneUeben';
  var paneD = document.createElement('div'); paneD.id = 'paneDis';
  var paneM = document.createElement('div'); paneM.id = 'paneMed';
  var panes = [rail, paneH, paneU, paneD, paneM];
  ['Strukturen', 'Hilfekarten', 'Üben', 'Krankheitsbilder', 'Medikamente'].forEach(function (name, k) {
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
  /* Krankheitsbilder, Medikamente */
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', SZ_EINLEITUNG.disease);
  SZ.liste(paneM, 'drug', 'Medikamente', SZ_EINLEITUNG.drug);
  /* Ueben: Strukturen finden und Wege verfolgen (schliessen sich gegenseitig aus) */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur am Magen und tippe sie an. Die Beschriftung verschwindet solange. Oder verfolge einen Weg: Tippe die Stationen der Reihe nach an.'; paneU.appendChild(iu);
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

function legNoteSetzen() {   /* erste Notiz nur ohne Durchsicht und ohne Innenansicht; die zweite steht immer (im Markup) genau einmal */
  var n = $('legNote'), zeigen = !(seeThrough || openZiel);
  n.textContent = zeigen ? LEGNOTE[0] : ''; n.style.display = zeigen ? '' : 'none';
  railHoehe(window.innerWidth);                          /* die Lesehilfe wird kuerzer oder laenger */
}
function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  legNoteSetzen();
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
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var K3 = function (x, y, z) { return V(x - M[0], y - M[1], z - M[2]); };   /* Koerper-Koordinaten -> Modell */
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die Beschriftungsspalten freilassen; innen: Innenansicht */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: UEBERSICHT.theta, phi: UEBERSICHT.phi, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb, innen: false },
  { name: 'Innenansicht', theta: 0, phi: 1.5, target: K3(3, 105.5, 1), ext: [22, 23], halb: 11, innen: true },
  { name: 'Mageneingang', theta: -0.15, phi: 1.45, target: K3(5, 108, 1), ext: [15, 14], halb: 7.5, innen: true },
  { name: 'Pförtner', theta: 0.3, phi: 1.45, target: K3(-2.2, 103.5, 3), ext: [11, 7.5], halb: 5.5, innen: true }
];
var view = { theta: AUSSCHNITTE[0].theta, phi: AUSSCHNITTE[0].phi, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 4, maxDist: 160 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Magen und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  openZiel = a.innen ? 1 : 0;   /* Innenansicht, Mageneingang und Pfoertner: vordere Haelfte abgehoben */
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
  lupeClose();                                           /* ebenso die Lupe */
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  $('sLead').textContent = lead;
  var A = $('sAfter'); A.innerHTML = '';
  if (after) { var h5 = document.createElement('h5'); h5.textContent = after.h; var p = document.createElement('p'); p.textContent = after.t; A.appendChild(h5); A.appendChild(p); }
  $('sQa').style.display = istQuiz ? 'flex' : 'none';
  if (selected && !istQuiz) setSelected(null);
  $('scard').classList.add('show');
  $('info').classList.remove('show');
  kartenLage();
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
/* Ueben "Strukturen finden": "Tippe auf: ..." - alle eingeblendeten Strukturen ausser dem Zwerchfell. Magenschleimhaut und Magenmuskulatur sind nur in der Innenansicht zu
   sehen und anzutippen (NUR_INNEN), die Bereiche der Aussenwand nur bei geschlossener Wand (NUR_AUSSEN: in der Innenansicht liegt die Schleimhaut davor): wer sie
   wuerfelt, bekommt die passende Ansicht (autoGehe); beim Beenden kehrt die Ansicht zurueck. Wechselt man die Ansicht selbst, gilt nur der Teil, der dort passt
   (bleibe). Math.random nur hier, bei der Auswahl der gesuchten Struktur (wie bei der Leber). */
var NUR_INNEN = ['schleimhaut', 'muskulatur'], NUR_AUSSEN = ['mageneingang', 'magengrund', 'magenkoerper', 'magenvorhof'];
function quizPool(bleibe) {
  return ORDER.filter(function (s) {
    if (!s.meshes.length || !enabled[s.id] || s.id === 'zwerchfell') return false;
    if (bleibe && NUR_INNEN.indexOf(s.id) >= 0 && !openZiel) return false;
    if (bleibe && NUR_AUSSEN.indexOf(s.id) >= 0 && openZiel) return false;
    return true;
  }).map(function (s) { return s.id; });
}
function quizNext(bleibe) {
  var pool = quizPool(bleibe); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  var braucheInnen = NUR_INNEN.indexOf(id) >= 0, braucheAussen = NUR_AUSSEN.indexOf(id) >= 0;
  if ((braucheInnen && !openZiel) || (braucheAussen && openZiel)) { autoGehe = true; quiz.auto = true; gehe(braucheInnen ? 1 : 0); autoGehe = false; }
  showCard('Üben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe den Magen, wenn du die Struktur nicht gleich siehst.', null, true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizNeu(bleibe) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(bleibe); }
function uebenKlasse() { document.body.classList.toggle('ueben', !!(quiz || wege)); groesse(window.innerWidth, window.innerHeight); }   /* Handy: Karte unten, Bildbereich des Magens darueber */
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
   liste = Namen der erledigten Stationen, fertig = Weg abgeschlossen. Waehrend der Wege ist die Wand durchsichtig (Magenschleimhaut und Wandbereiche liegen im selben Strahl:
   der Treffer der Schleimhaut zaehlt, die Wand davor steht in durch) und die Uebersicht gewaehlt; beim Beenden kehrt alles zurueck. */
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
  var w = WEGE[nr];
  if (w.mahlzeit !== undefined) setMahlzeit(w.mahlzeit, true);   /* dieselbe Funktion wie die Knoepfe, ohne die Einblendung */
  wegeZeigen();
}
function wegeStart() {
  if (quiz) quizEnd();
  setSelected(null);
  wege = { nr: 0, st: 0, n: 0, ok: 0, fehl: 0, liste: [], fertig: false, text: null, leucht: [], vorher: { mahlzeit: mahlzeit, durch: seeThrough, aktiv: aktiv } };
  if (aktiv !== 0) { autoGehe = true; gehe(0); autoGehe = false; }   /* Uebersicht: nur dort sind alle Stationen zu sehen */
  durchsicht(true);                                      /* die Magenschleimhaut liegt hinter der Wand: nur bei Durchsicht antippbar */
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
  if (W.st >= w.stationen.length) W.fertig = true;
  wegeZeigen();
}
$('sClose').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); else closeCard(); };
$('qNext').onclick = function () {
  if (quiz) quizNeu();
  else if (wege && wege.nr < WEGE.length - 1) wegeSetzen(wege.nr + 1);
};
$('qStop').onclick = function () { if (quiz) quizEnd(); else if (wege) wegeEnd(); };

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Zwerchfell, Wand bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird */
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
  /* Beim Ueben nennt die Rueckmeldung bei Durchsicht den Bereich der Wand statt der Schleimhaut dahinter (die Schleimhaut zaehlt trotzdem, sie steht in durch) */
  var name = treffer || weich || null;
  if (name === 'schleimhaut') for (var k = 0; k < durch.length; k++) if (WAND.indexOf(durch[k]) >= 0) { name = durch[k]; break; }
  if (wege) { wegeAntwort(name, durch); return; }
  if (quiz) { quizAntwort(name, durch); return; }
  setSelected(treffer || weich || null);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Kandidaten fuer den Ankerpunkt je Ausschnitt und Struktur (Raum der Szene); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren.
   Bei den Bereichen der Wand: Punkt auf der Oberflaeche an der Stelle, an der die Gerade durch den Koerper-Punkt q in Blickrichtung des Ausschnitts auf das Netz trifft;
   sonst Punkte auf den Mittellinien. */
var KAND = [{}, {}, {}, {}], KAND0 = null, KAND1 = null, rayA = new THREE.Raycaster();
/* Ankerpunkte fuer die Fuellung f (0 nuechtern, 1 nach dem Essen; die Netze stehen dabei auf f): ankerBerechnen fuellt KAND, ankerBeide merkt sich beide Zustaende */
function ankerBeide() {
  [0, 1].forEach(function (f) { KAND = [{}, {}, {}, {}]; fuellungSetzen(f); ankerBerechnen(f); if (f) KAND1 = KAND; else KAND0 = KAND; });
  fuellungSetzen(fe);
}
/* Kandidaten fuer die Ankerpunkte der Struktur id im Ausschnitt i bei der aktuellen Fuellung: zwischen den beiden Zustaenden gemischt (Punkt fuer Punkt, wenn beide gleich viele haben) */
function kand(i, id) {
  if (!KAND0) return [];   /* vor dem Ende des Aufbaus */
  var a = KAND0[i][id] || [], b = KAND1[i][id] || [];
  if (fe <= 0.001) return a;
  if (fe >= 0.999) return b;
  if (a.length !== b.length) return fe < 0.5 ? a : b;
  return a.map(function (p, k) { return p.clone().lerp(b[k], fe); });
}
function ankerBerechnen(fuell) {
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
  var G = fuell ? D.G1 : D.G, zw = function (x, z) { return [x, lform.kuppel(x, z), z]; };
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
    if (i > 0) {   /* Aeste an der vorderen Wand blenden mit dem Deckel aus: nur die Punkte dahinter beschriften */
      ['arterien', 'venen', 'vagus'].forEach(function (k) { o[k] = o[k].filter(function (q) { return !D.vorn(q); }); });
      if (!o.vagus.length) o.vagus = [linie(G.vagus[1], 0.5), linie(G.vagus[1], 0.8)].filter(function (q) { return !D.vorn(q); });
    }
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
      var p = m.geometry.attributes.position.array, mp = fuell && m.geometry.morphAttributes.position ? m.geometry.morphAttributes.position[0].array : null;
      for (var k = 0; k < p.length; k += 3) {
        var px = p[k] + (mp ? mp[k] : 0), py = p[k + 1] + (mp ? mp[k + 1] : 0), pz = p[k + 2] + (mp ? mp[k + 2] : 0);
        var d = Math.pow(px - zielP[0], 2) + Math.pow(py - zielP[1], 2) + Math.pow(pz - zielP[2], 2);
        if (d < bd) { bd = d; b = [px, py, pz]; }
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
    var c = kand(aktiv, id), i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = i; break; }   /* Nummer des Kandidaten: der Punkt folgt der Fuellung */
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
  ['pfoertner', 'schleimhaut', 'muskulatur', 'zwoelffinger', 'pfortader']   /* Pfoertner: nur das, was in der Naehe wichtig ist */
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
  var botL = narrow ? r.y1 - 6 : h - 58, botR = botL;
  var unten = $('info').classList.contains('show');   /* Infokarte unten links: Beschriftung links darueber */
  var kk = SZ.el && SZ.el.classList.contains('show') && !SZ.el.classList.contains('weg') ? SZ.el : null;   /* offene Szenariokarte (Krankheitsbild, Medikament): ebenso */
  if (!narrow && (unten || kk)) botL = Math.min(botL, h - 22 - (unten ? $('info') : kk).offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !$('scard').classList.contains('show') && !(narrow && (selected || unten || LUPE.open || (kk && !kk.classList.contains('min'))))) {   /* Handy: die Karte deckt den Magen, ohne Beschriftung bleibt sie frei; bei einer Hilfekarte und beim Ueben keine Beschriftung */
    beschriftet().forEach(function (id) {
      if (!enabled[id]) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen, die Namen stehen dann neben dem Modell */
      var kc = kand(aktiv, id), an = kc[id in VIS ? VIS[id] : 0];   /* VIS: Nummer des gewaehlten Kandidaten (null = verdeckt) */
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
    var bw = b.el.offsetWidth; lx = it.side === 'l' ? Math.max(lx, bw + 8) : Math.min(lx, w - bw - 10);   /* nicht ueber den Bildrand hinaus */
    b.el.style.left = lx + 'px'; b.el.style.top = it.ly + 'px';
    b.el.style.transform = it.side === 'l' ? 'translate(-100%,-50%)' : 'translateY(-50%)';
    var ex = it.side === 'l' ? lx + 7 : lx - 7;
    b.ln.setAttribute('points', it.sx + ',' + it.sy + ' ' + (ex + (it.side === 'l' ? 16 : -16)) + ',' + it.ly + ' ' + ex + ',' + it.ly);
    b.dot.setAttribute('cx', it.sx); b.dot.setAttribute('cy', it.sy);
  });
}

/* =====================================================================
   6. Stroemung: Kohlenhydrate (gelb), Eiweiss (orange), Fett (weiss), Wasser (hellblau) und Magensaft (tuerkis) als Teilchen, dazu der Mahlzeit-Schalter.
   Symbolisch, nicht massstaeblich, die Zeit ist stark gerafft. Alles ist eine reine Funktion von clock (Sekunden bei "normal") und dem Index des Teilchens: kein Zufall,
   die Zahl der Teilchen steht beim Aufbau fest. Je Art ein InstancedMesh. Die Teilchen liegen in Schlauchkoordinaten des Innenraums: Stelle s entlang der Mittellinie,
   Winkel und Abstand; der Abstand ist ein Bruchteil der Reichweite bis zur Schleimhaut (mit Rand), die beim Aufbau in acht Richtungen aus dem Feld des Innenraums gemessen
   wird (nuechtern und gefuellt, dazwischen linear): so bleiben die Teilchen im Innenraum, auch waehrend der Fuellung und der Wellen (dort schrumpft der Abstand mit).
   Nach dem Essen (Zeit te seit dem Wechsel, Zyklus P = 126 s, damit sich die Wellen im Takt wiederholen): jedes Teilchen schluckt sich durch die Speiseroehre, kommt im Magen
   an, sammelt sich im Magenkoerper, wird von den Wellen zum Antrum geschoben (kleine Vor- und Rueckbewegung beim Durchlaufen der Welle) und verlaesst den Magen mit einer
   Welle durch den Pfoertner (bei offenem Pfoertner) in den Zwoelffingerdarm, wo es ein Stueck weiterlaeuft. Aufenthaltszeit: Wasser kurz (laeuft an der kleinen Kurvatur
   entlang), Kohlenhydrate, dann Eiweiss (wird kleiner: Spaltung), Fett am laengsten (schwimmt oben). Magensaft tritt aus der Wand von Magengrund und Magenkoerper nach
   innen. Nuechtern: wenig Magensaft, keine Wellen, der Pfoertner ist zu. Die Welle: Gauss-Profil, laeuft in 3,2 s von der Mitte des Magenkoerpers zum Pfoertner, alle 4,5 s
   eine; wenn sie ankommt, oeffnet sich der Pfoertner kurz. Pause haelt alles an; die Fuellung des Magens laeuft in Echtzeit (der Schalter soll auch in der Pause wirken).
   ===================================================================== */
var playing = true, speed = 1, clock = 0, clockM = 0, tM = 0, mahlzeit = false, fzR = 0, fe = 0, fzFest = false;   /* clockM: Uhr der Mahlzeit (laeuft wie clock, mit dem Faktor SZW.wellen); tM: Uhrzeit (clockM) des Wechsels zu "nach dem Essen"; fzR: Fuellung roh 0..1, fe: weich */
var SZ_ = { FUELL: 1.8, P: 126, TW: 4.5, TA0: 5.0, TT: 3.2, SCHLUCK: 3.6, EIN: 2.2, WS0: 0.34, WE: 0.96, DUO: 6.5, DUOV: 1.5, KC: 0.85 };
var R2A = 0.7548776662466927, R2B = 0.5698402909980532;   /* Plastikzahl-Folge (R2): gleichmaessig verteilte Paare aus dem Index */
function bruch(v) { return v - Math.floor(v); }
var KINDS = [
  { id: 'kh', name: 'Kohlenhydrate', col: 0xE6C94A, em: 0x7A5F10, n: 60, res: 32, rad: 0.13, a: [0.30, 0.50], b: [0.80, 0.92], btn: 'bKh' },
  { id: 'eiweiss', name: 'Eiweiß', col: 0xF09A3E, em: 0x7A3A08, n: 54, res: 58, rad: 0.17, a: [0.28, 0.48], b: [0.74, 0.90], btn: 'bEiw' },
  { id: 'fett', name: 'Fett', col: 0xF2F2EE, em: 0x66665F, n: 36, res: 82, rad: 0.15, a: [0.13, 0.27], b: [0.78, 0.92], btn: 'bFett' },
  { id: 'wasser', name: 'Wasser', col: 0x8FD0F0, em: 0x1F5A86, n: 48, res: 17, rad: 0.11, a: [0.17, 0.19], b: [0.90, 0.96], btn: 'bWasser' },
  { id: 'saft', name: 'Magensaft', col: 0x3FC9B8, em: 0x0E6A5E, n: 50, rad: 0.10 }
];
var KI = { kh: 0, eiweiss: 1, fett: 2, wasser: 3, saft: 4 };
var SAFT_N0 = 12;                       /* soviele Tropfen Magensaft gibt es auch nuechtern */
var kindOn = [true, true, true, true, true];
var SL = null, WL = [], WOFF = 0, ST = null, ENT = null, DUOP = null, wellenKey = '';
var SQ = { x: 0, y: 0, z: 0, s: 0 }, STM = new THREE.Matrix4(), LB = { st: 0, sig: 0, u: 0, tb: 0, ta: 0, x: 0, y: 0, z: 0, r: 0 };

/* ---- Schlauchtabellen: Mittellinie, Rahmen und Reichweite bis zur Schleimhaut in acht Richtungen (nuechtern, gefuellt) ---- */
function reichweite(f, c, d) {
  if (f(c[0], c[1], c[2]) >= 0) return 0;
  var t = 0, st = 0.12, k;
  while (t < 7) { t += st; if (f(c[0] + d[0] * t, c[1] + d[1] * t, c[2] + d[2] * t) >= 0) break; }
  if (t >= 7) return 7;
  var lo = t - st, hi = t;
  for (k = 0; k < 6; k++) { var mi = (lo + hi) / 2; if (f(c[0] + d[0] * mi, c[1] + d[1] * mi, c[2] + d[2] * mi) >= 0) hi = mi; else lo = mi; }
  return lo;
}
function schlauchBauen() {
  var NK = 40, lu = [form.lumen(0).sdf, form.lumen(1).sdf], fi, i, j, c = [0, 0, 0], a = [0, 0, 0], b = [0, 0, 0];
  SL = { NK: NK, C: [], EN: [], EZ: [], EX: [], WC: [], WS: [] };
  for (fi = 0; fi < 2; fi++) {
    var P = fi ? ML.P1 : ML.P0, C = new Float32Array(NK * 3), EN = new Float32Array(NK * 3), EZ = new Float32Array(NK * 3), EX = new Float32Array(NK * 8), WC = new Float32Array(NK), WS = new Float32Array(NK), lastC = 1, lastS = 0;
    for (i = 0; i < NK; i++) {
      var u = mlUvonSig(i / (NK - 1)), i0 = Math.min(ML.m - 1, Math.floor(u)), k;
      mlU(P, u, c);
      var T = [P[i0 + 1][0] - P[i0][0], P[i0 + 1][1] - P[i0][1], P[i0 + 1][2] - P[i0][2]], tl = Math.sqrt(T[0] * T[0] + T[1] * T[1] + T[2] * T[2]) || 1;
      T = [T[0] / tl, T[1] / tl, T[2] / tl];
      var ez = [-T[2] * T[0], -T[2] * T[1], 1 - T[2] * T[2]], el = Math.sqrt(ez[0] * ez[0] + ez[1] * ez[1] + ez[2] * ez[2]);
      if (el < 1e-3) { ez = [1, 0, 0]; el = 1; }
      ez = [ez[0] / el, ez[1] / el, ez[2] / el];
      var en = [T[1] * ez[2] - T[2] * ez[1], T[2] * ez[0] - T[0] * ez[2], T[0] * ez[1] - T[1] * ez[0]];
      for (k = 0; k < 3; k++) { C[i * 3 + k] = c[k]; EN[i * 3 + k] = en[k]; EZ[i * 3 + k] = ez[k]; }
      for (j = 0; j < 8; j++) {
        var ca = Math.cos(j * PI / 4), sa = Math.sin(j * PI / 4), d = [ca * en[0] + sa * ez[0], ca * en[1] + sa * ez[1], ca * en[2] + sa * ez[2]];
        EX[i * 8 + j] = reichweite(lu[fi], c, d);
      }
      /* Richtung zur Innenseite der Biegung (kleine Kurvatur): Mitte der Sehne im Fenster von 7 Abschnitten, senkrecht zur Mittellinie */
      mlU(P, Math.max(0, u - 7), a); mlU(P, Math.min(ML.m, u + 7), b);
      var cv = [(a[0] + b[0]) / 2 - c[0], (a[1] + b[1]) / 2 - c[1], (a[2] + b[2]) / 2 - c[2]], dt = cv[0] * T[0] + cv[1] * T[1] + cv[2] * T[2];
      cv = [cv[0] - dt * T[0], cv[1] - dt * T[1], cv[2] - dt * T[2]];
      if (Math.sqrt(cv[0] * cv[0] + cv[1] * cv[1] + cv[2] * cv[2]) > 0.25) {
        var gx = cv[0] * en[0] + cv[1] * en[1] + cv[2] * en[2], gz = cv[0] * ez[0] + cv[1] * ez[1] + cv[2] * ez[2], gl = Math.sqrt(gx * gx + gz * gz) || 1;
        lastC = gx / gl; lastS = gz / gl;
      }
      WC[i] = lastC; WS[i] = lastS;
    }
    SL.C.push(C); SL.EN.push(EN); SL.EZ.push(EZ); SL.EX.push(EX); SL.WC.push(WC); SL.WS.push(WS);
  }
}
/* Wellenstaerke (Einschnuerung) am Ort s */
function wellenK(s) {
  var k = 0, i;
  for (i = 0; i < WL.length; i++) { var t = (s - WL[i].s) / WELLE_B; k += WL[i].a * Math.exp(-t * t); }
  return Math.min(k, 0.7) * (1 - sstep(0.93, 0.985, s));   /* wie im Shader: am Ende des Antrums laeuft die Welle aus (der Pfoertner schliesst sich selbst) */
}
/* Punkt in Schlauchkoordinaten (s, Winkel phi, Abstand rho 0..1 der nutzbaren Reichweite, Radius des Teilchens) in SQ; kw = Einschnuerung durch die Welle.
   Der nutzbare Abstand haelt Rand zur Schleimhaut (Netz und Feld weichen bis ca. 0,1 cm voneinander ab; Falten nuechtern bis 0,3 cm hoch) */
function schlauchPunkt(sig, phi, rho, rad, kw, out) {
  var NK = SL.NK, x = Math.max(0, Math.min(1, sig)) * (NK - 1), i0 = Math.min(NK - 2, Math.floor(x)), t = x - i0, f = fe, k, i1 = i0 + 1;
  var jj = (phi / (PI / 4)) % 8; if (jj < 0) jj += 8;
  var j0 = Math.floor(jj), tj = jj - j0, j1 = (j0 + 1) % 8, ex = 0, cx = 0, cy = 0, cz = 0, nx = 0, ny = 0, nz = 0, zx = 0, zy = 0, zz = 0, fi;
  for (fi = 0; fi < 2; fi++) {
    var w = fi ? f : 1 - f; if (w <= 0) continue;
    var E = SL.EX[fi], C = SL.C[fi], EN = SL.EN[fi], EZ = SL.EZ[fi];
    ex += w * ((E[i0 * 8 + j0] + (E[i0 * 8 + j1] - E[i0 * 8 + j0]) * tj) * (1 - t) + (E[i1 * 8 + j0] + (E[i1 * 8 + j1] - E[i1 * 8 + j0]) * tj) * t);
    cx += w * (C[i0 * 3] + (C[i1 * 3] - C[i0 * 3]) * t); cy += w * (C[i0 * 3 + 1] + (C[i1 * 3 + 1] - C[i0 * 3 + 1]) * t); cz += w * (C[i0 * 3 + 2] + (C[i1 * 3 + 2] - C[i0 * 3 + 2]) * t);
    nx += w * (EN[i0 * 3] + (EN[i1 * 3] - EN[i0 * 3]) * t); ny += w * (EN[i0 * 3 + 1] + (EN[i1 * 3 + 1] - EN[i0 * 3 + 1]) * t); nz += w * (EN[i0 * 3 + 2] + (EN[i1 * 3 + 2] - EN[i0 * 3 + 2]) * t);
    zx += w * (EZ[i0 * 3] + (EZ[i1 * 3] - EZ[i0 * 3]) * t); zy += w * (EZ[i0 * 3 + 1] + (EZ[i1 * 3 + 1] - EZ[i0 * 3 + 1]) * t); zz += w * (EZ[i0 * 3 + 2] + (EZ[i1 * 3 + 2] - EZ[i0 * 3 + 2]) * t);
  }
  var use = Math.max(0, ex * 0.75 - 0.08 - rad - 0.12 * (1 - f)), off = rho * use * (1 - kw) * (1 - WU.uKc.value * sstep(WU.uPyl.value.x, WU.uPyl.value.y, sig)), ca = Math.cos(phi) * off, sa = Math.sin(phi) * off;
  out.x = cx + nx * ca + zx * sa; out.y = cy + ny * ca + zy * sa; out.z = cz + nz * ca + zz * sa;
  return out;
}
function innenWinkel(sig) {   /* Richtung zur kleinen Kurvatur (Winkel in der Querschnittsebene) bei s */
  var NK = SL.NK, x = Math.max(0, Math.min(1, sig)) * (NK - 1), i0 = Math.min(NK - 2, Math.floor(x)), t = x - i0, c = 0, s = 0, fi;
  for (fi = 0; fi < 2; fi++) {
    var w = fi ? fe : 1 - fe; if (w <= 0) continue;
    c += w * (SL.WC[fi][i0] + (SL.WC[fi][i0 + 1] - SL.WC[fi][i0]) * t); s += w * (SL.WS[fi][i0] + (SL.WS[fi][i0 + 1] - SL.WS[fi][i0]) * t);
  }
  return Math.atan2(s, c);
}
/* Linienzug mit Bogenlaenge: Punkt bei Bogenlaenge s (Entfernung in cm), Richtung in tg */
function linieBauen(pts) {
  var cum = [0], i;
  for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.sqrt(Math.pow(pts[i][0] - pts[i - 1][0], 2) + Math.pow(pts[i][1] - pts[i - 1][1], 2) + Math.pow(pts[i][2] - pts[i - 1][2], 2)));
  return { p: pts, cum: cum, L: cum[cum.length - 1] };
}
var TG = [0, 0, 1];
function linieBei(ln, s, o) {
  var n = ln.p.length, lo = 0, hi = n - 1;
  s = Math.max(0, Math.min(ln.L, s));
  while (hi - lo > 1) { var mi = (lo + hi) >> 1; if (ln.cum[mi] <= s) lo = mi; else hi = mi; }
  var d = ln.cum[hi] - ln.cum[lo], t = d > 1e-9 ? (s - ln.cum[lo]) / d : 0, a = ln.p[lo], b = ln.p[hi], k, l = 0;
  for (k = 0; k < 3; k++) { o[k] = a[k] + (b[k] - a[k]) * t; TG[k] = b[k] - a[k]; l += TG[k] * TG[k]; }
  l = Math.sqrt(l) || 1; TG[0] /= l; TG[1] /= l; TG[2] /= l;
  return o;
}
function querVersatz(ang, r, out) {   /* Versatz r senkrecht zur Richtung TG unter dem Winkel ang */
  var ax = Math.abs(TG[1]) < 0.9 ? 0 : 1, ay = Math.abs(TG[1]) < 0.9 ? 1 : 0;
  var n1x = -TG[2] * ay, n1y = TG[2] * ax, n1z = TG[0] * ay - TG[1] * ax, nl = Math.sqrt(n1x * n1x + n1y * n1y + n1z * n1z) || 1;
  n1x /= nl; n1y /= nl; n1z /= nl;
  var n2x = TG[1] * n1z - TG[2] * n1y, n2y = TG[2] * n1x - TG[0] * n1z, n2z = TG[0] * n1y - TG[1] * n1x, ca = Math.cos(ang) * r, sa = Math.sin(ang) * r;
  out[0] += n1x * ca + n2x * sa; out[1] += n1y * ca + n2y * sa; out[2] += n1z * ca + n2z * sa;
}
/* Wege der Teilchen ausserhalb des Magens: Speiseroehre bis in den Magen (Kanal der Schleimhaut), Zwoelffingerdarm */
function wegeBauen() {
  var ea = form.speiseroehreAnzeige(), eso = form.kurve(form.BAHN.speiseroehre.pts, 12), ende = eso[eso.length - 1], vor = eso[eso.length - 3], c1 = ML.P0[9];
  var rc = [ende[0] - vor[0], ende[1] - vor[1], ende[2] - vor[2]], rl = Math.sqrt(rc[0] * rc[0] + rc[1] * rc[1] + rc[2] * rc[2]) || 1;
  var uu = [c1[0] - ende[0], c1[1] - ende[1], c1[2] - ende[2]], ul = Math.sqrt(uu[0] * uu[0] + uu[1] * uu[1] + uu[2] * uu[2]) || 1;
  var dv = [0.3 * rc[0] / rl + uu[0] / ul, 0.3 * rc[1] / rl + uu[1] / ul, 0.3 * rc[2] / rl + uu[2] / ul], dl = Math.sqrt(dv[0] * dv[0] + dv[1] * dv[1] + dv[2] * dv[2]) || 1;
  var innen = [ende[0] + dv[0] / dl * 1.5, ende[1] + dv[1] / dl * 1.5, ende[2] + dv[2] / dl * 1.5];   /* Ende des Kanals im Magen (Tiefe 1,5 cm wie ESO_TIEF der Form) */
  ENT = linieBauen(ea.concat([ende, innen]));
  var duo = form.kurve(form.BAHN.zwoelffingerdarm.pts, 12);
  DUOP = linieBauen(duo.slice(0, 12 * 3 + 7));
}
/* Teilchen: feste Eigenschaften je Index */
function teilchenDaten() {
  KINDS.forEach(function (K, ki) {
    var n = K.n, i;
    K.e = []; K.x = []; K.sa = []; K.sb = []; K.phi0 = []; K.rho = []; K.pz = []; K.ta = [];
    for (i = 0; i < n; i++) {
      var q = bruch(0.5 + i * R2A + ki * 0.37), ph = bruch(0.1 + i * R2B + ki * 0.21);
      if (ki === KI.saft) { K.pz.push(ph); K.e.push(0); K.x.push(0); K.sa.push(0.06 + 0.5 * bruch(0.3 + i * R2A)); K.sb.push(7 + 5 * bruch(0.7 + i * 0.6180339887)); K.phi0.push(2 * PI * bruch(0.2 + i * R2B)); K.rho.push(0); K.ta.push(0); continue; }
      var e = SZ_.SCHLUCK + 0.4 + 24 * q, ziel = e + K.res * (0.92 + 0.16 * bruch(0.3 + i * R2B)), nw = Math.ceil((ziel - SZ_.TA0) / SZ_.TW), x = SZ_.TA0 + nw * SZ_.TW;
      K.e.push(e); K.x.push(x); K.pz.push(ph);
      K.sa.push(K.a[0] + (K.a[1] - K.a[0]) * bruch(0.3 + i * 0.6180339887)); K.sb.push(K.b[0] + (K.b[1] - K.b[0]) * bruch(0.7 + i * R2A));
      K.phi0.push(2 * PI * bruch(0.2 + i * R2B)); K.rho.push(ki === KI.wasser ? 0.55 + 0.35 * bruch(0.4 + i * R2A) : Math.sqrt(bruch(0.1 + i * 0.3247)));
      K.ta.push(Math.max(0, Math.min(36, SZ_.P - (x - e) - SZ_.DUO - 3)));   /* Schema: so lange laeuft das Teilchen hinter dem Magen, bevor der Zyklus von vorn beginnt */
    }
    K.st = new Int8Array(n); K.sg = new Float32Array(n); K.tb = new Float32Array(n); K.tA = new Float32Array(n); K.vis = new Float32Array(n);
  });
}
/* Zustand eines Teilchens nach dem Essen zur Zyklusphase ph (0 .. P); schreibt die Stufe in LB.st (0 aus, 1 Speiseroehre, 2 Magen, 3 Pfoertner, 4 Zwoelffingerdarm,
   5 weiter im Darm und 6 vor dem Schlucken (die beiden nur im Schema)), s, Lage und Groesse */
var PUSH = 0.045;
function lauf(ki, i, ph, o) {
  var K = KINDS[ki], e = K.e[i], x = K.x[i], tl = ph - e, tex = x - e - 0.9, rad = K.rad, f = fe;
  o.st = 0; o.r = 0; o.sig = 0; o.tb = e - ph; o.ta = ph - x - 0.5;
  if (ph < e - SZ_.SCHLUCK) { if (o.tb < 8) o.st = 6; return; }
  if (ph < e) {   /* Speiseroehre: Bogenlaenge in cm, kleiner Abstand von der Achse (Rohr 0,8 cm) */
    o.st = 1; var u = (ph - (e - SZ_.SCHLUCK)) / SZ_.SCHLUCK, o3 = [0, 0, 0];
    linieBei(ENT, u * ENT.L, o3); querVersatz(2 * PI * K.pz[i] * 7 + i, 0.22 * K.rho[i], o3);
    o.x = o3[0]; o.y = o3[1]; o.z = o3[2]; o.r = rad * Math.min(1, u * 4, (1 - u) * 6 + 0.35) * sstep(0, 0.2, f); o.sig = 0; return;
  }
  if (ph < x - 0.9) {   /* im Magen */
    o.st = 2;
    var pi_, sig, phi, rho, sz = rad;
    if (ki === KI.fett) pi_ = sstep(0, 1, (tl - (tex - 17)) / 15);
    else if (ki === KI.wasser) pi_ = sstep(0, 1, (tl - 0.5) / 5.5);
    else pi_ = sstep(0, 1, (tl - SZ_.EIN) / Math.max(4, tex - SZ_.EIN - 2));
    sig = K.sa[i] + (K.sb[i] - K.sa[i]) * pi_ + 0.012 * Math.sin(2 * PI * (ph / SZ_.TW + K.pz[i]));
    for (var w = 0; w < WL.length; w++) { var dz = (WL[w].s - sig) / 0.08; if (WL[w].a > 0.01) sig += PUSH * Math.exp(-dz * dz) * Math.min(1, WL[w].a / 0.2); }   /* die Welle schiebt das Teilchen ein Stueck vor */
    sig = Math.max(0.03, Math.min(0.965, sig));
    if (ki === KI.wasser) { phi = innenWinkel(sig); rho = K.rho[i]; }   /* Magenstrasse: an der kleinen Kurvatur entlang */
    else { phi = K.phi0[i] + 0.5 * Math.sin(0.25 * ph + K.pz[i] * 6.2832); rho = K.rho[i]; }
    if (ki === KI.eiweiss) sz = rad * (1 - 0.45 * sstep(0, 1, tl / Math.max(1, tex)));   /* Eiweiss wird gespalten: die Teilchen werden kleiner */
    schlauchPunkt(sig, phi, rho, sz, wellenK(sig), SQ);
    if (tl < SZ_.EIN) {   /* Ankunft: vom Ende des Kanals zur Stelle im Magen */
      var a = sstep(0, 1, tl / SZ_.EIN), ek = linieBei(ENT, ENT.L, [0, 0, 0]);
      SQ.x = ek[0] + (SQ.x - ek[0]) * a; SQ.y = ek[1] + (SQ.y - ek[1]) * a; SQ.z = ek[2] + (SQ.z - ek[2]) * a;
    }
    o.x = SQ.x; o.y = SQ.y; o.z = SQ.z; o.sig = sig; o.r = sz * Math.min(1, 0.3 + tl * 1.2) * sstep(0, 0.25, f);
    return;
  }
  if (ph < x + 0.5) {   /* Pfoertner: von der Wartestelle durch den Kanal */
    o.st = 3; var v = (ph - (x - 0.9)) / 1.4, s2 = K.sb[i] + (1 - K.sb[i]) * sstep(0, 1, v), sz2 = rad * (1 - 0.35 * sstep(0, 1, tl / Math.max(1, tex)) * (ki === KI.eiweiss ? 1.2 : 0)) * 0.55;
    schlauchPunkt(s2, K.phi0[i], 0.3 * K.rho[i], sz2, wellenK(s2), SQ);
    o.x = SQ.x; o.y = SQ.y; o.z = SQ.z; o.sig = s2; o.r = sz2 * sstep(0, 0.25, f); return;
  }
  if (ph < x + 0.5 + SZ_.DUO) {   /* Zwoelffingerdarm: ein Stueck weiter (kleine Portion) */
    o.st = 4; var d = ph - x - 0.5, o4 = [0, 0, 0];
    linieBei(DUOP, d * SZ_.DUOV, o4); querVersatz(K.phi0[i], 0.18 * K.rho[i] + 0.05, o4);
    o.x = o4[0]; o.y = o4[1]; o.z = o4[2]; o.sig = 1; o.r = rad * 0.55 * Math.min(1, (SZ_.DUO - d) * 1.5) * Math.min(1, 0.4 + d * 1.5) * sstep(0, 0.25, f); return;
  }
  if (o.ta < K.ta[i]) o.st = 5;
}
/* Magensaft: aus der Wand von Magengrund und Magenkoerper nach innen (Lebensdauer 7..12 s, ueber clock) */
function saftZustand(i, o) {
  var K = KINDS[KI.saft], L = K.sb[i], u = bruch((clock + K.pz[i] * L * 3.7) / L), sig = K.sa[i] + 0.05 * u, phi = K.phi0[i] + 0.7 * u, rho = 1 - 0.78 * sstep(0, 0.6, u), rad = K.rad;
  var vis = i < SAFT_N0 ? 1 : sstep(0, 1, (fe - (i - SAFT_N0) / (K.n - SAFT_N0) * 0.8) / 0.2);
  if (SZW.saeure < 1) { var lim = SZW.saeure * (SAFT_N0 + (K.n - SAFT_N0) * Math.min(1, fe / 0.8)); vis *= 1 - sstep(lim - 1, lim, i); }   /* Pantoprazol: weniger Magensaft (der Anteil saeure der gerade sichtbaren Tropfen; die mit hoher Nummer fehlen zuerst) */
  schlauchPunkt(sig, phi, rho, rad, wellenK(sig), SQ);
  o.x = SQ.x; o.y = SQ.y; o.z = SQ.z; o.sig = sig; o.r = rad * vis * sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u)); o.st = o.r > 0.001 ? 2 : 0;
  if (SZW.reflux > 0.002 && i % 3 === 0) {   /* Reflux: jeder dritte Tropfen steigt statt dessen aus dem Magen in die Speiseroehre (weicher Wechsel ueber die Wirkgroesse) */
    var rf = SZW.reflux;
    if (rf < 0.5) o.r *= 1 - 2 * rf;
    else {
      var hoch = (2.2 + 3.8 * fe) * (0.65 + 0.35 * K.pz[i]), p3 = [0, 0, 0];   /* nach dem Essen steigt der Saft hoeher */
      linieBei(ENT, ENT.L - 0.2 - hoch * sstep(0, 1, u), p3); querVersatz(2 * PI * K.pz[i] * 7 + i, 0.18 * (0.3 + 0.7 * bruch(i * R2A)), p3);
      o.x = p3[0]; o.y = p3[1]; o.z = p3[2]; o.sig = 0;
      o.r = rad * 1.4 * vis * sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u)) * (2 * rf - 1); o.st = o.r > 0.001 ? 2 : 0;
    }
  }
}
function tmat(col, em) {
  var m = mat(col, { rough: 0.35 });
  m.emissive.copy(srgb(em)).multiplyScalar(0.6);
  return m;
}
/* Aufbau: Tabellen, Wege, Teilchen (immer gleich viele Objekte, unabhaengig von der Auswahl) */
function stroemungBauen() {
  schlauchBauen(); wegeBauen(); teilchenDaten();
  ST = { gruppen: [], letzt: '' };
  KINDS.forEach(function (K, ki) {
    var m = tmat(K.col, K.em), geo = new THREE.SphereGeometry(1, 10, 7), im = new THREE.InstancedMesh(geo, m, K.n);
    m.name = 'teilchen-' + K.id;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    im.name = K.name; im.userData.teilchen = K.id; im.userData.noexport = true;
    im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
    root.add(im); K.im = im; ST.gruppen.push(im);
  });
  stroemungBild();
}
/* Wellen und Pfoertner fuer die Zeit te nach dem Essen: Uniforms des Shaders, Liste WL fuer die Teilchen; WOFF = Oeffnung des Pfoertners 0..1 */
function wellenSetzen() {
  var te = clockM - tM, TW = SZ_.TW, TT = SZ_.TT, n0 = Math.floor((te - SZ_.TA0) / TW) - 1, n, c = 0, i, offen = 0;
  WL.length = 0;
  for (n = n0; n <= n0 + 3; n++) {
    var tn = SZ_.TA0 + n * TW, u = 1 - (tn - te) / TT;
    if (n < 0) continue;
    var x = (te - tn) / 0.8; if (x > -1 && x < 1) offen = Math.max(offen, (1 - x * x) * (1 - x * x));
    if (u < 0 || u > 1.15) continue;
    var s = SZ_.WS0 + (SZ_.WE - SZ_.WS0) * Math.min(1, u), base = 0.14 + 0.34 * sstep(0.45, 0.82, s), env = sstep(0, 0.12, u) * (1 - sstep(1.0, 1.15, u));
    WL.push({ s: s, a: base * env * fe });
  }
  for (i = 0; i < 3; i++) { var w = WL[i]; WU.uWelle.value[i].set(w ? w.s : 0, w ? w.a : 0, WELLE_B); }
  WOFF = offen * fe;
  WU.uKc.value = SZ_.KC * (1 - WOFF);
}
/* je Bild: Teilchen setzen (nur wenn sich Zeit, Fuellung, Auswahl oder Ausschnitt aendern) */
function stroemungBild() {
  if (!ST || !SL) return;
  var key = clock + '|' + clockM + '|' + fe + '|' + lv + '|' + tM + '|' + kindOn.join('');
  if (key === ST.letzt) return;
  ST.letzt = key;
  var te = clockM - tM, ph = te - Math.floor(te / SZ_.P) * SZ_.P, ki, i;
  for (ki = 0; ki < KINDS.length; ki++) {
    var K = KINDS[ki], im = K.im;
    im.visible = kindOn[ki];
    for (i = 0; i < K.n; i++) {
      if (ki === KI.saft) saftZustand(i, LB); else lauf(ki, i, ph, LB);
      K.st[i] = LB.st; K.sg[i] = LB.sig; K.tb[i] = LB.tb; K.tA[i] = LB.ta;
      var r = (LB.st >= 1 && LB.st <= 4) ? LB.r : 0;
      K.vis[i] = r;
      STM.makeScale(r, r, r); STM.setPosition(LB.x, LB.y, LB.z);
      im.setMatrixAt(i, STM);
    }
    im.instanceMatrix.needsUpdate = true;
  }
}
/* je Bild: Uhr und Fuellung fortschreiben (Pause haelt die Strömung an, die Fuellung laeuft in Echtzeit) */
function stroemungSchritt(dt) {
  var ziel = mahlzeit ? 1 : 0;
  if (!fzFest && fzR !== ziel) fzR = ziel > fzR ? Math.min(ziel, fzR + dt / SZ_.FUELL) : Math.max(ziel, fzR - dt / SZ_.FUELL);
  fe = sstep(0, 1, fzR);
  if (playing) { clock += dt * speed; clockM += dt * speed * SZW.wellen; }   /* Metoclopramid: die Muskelwellen und alles danach (Pfoertner, Entleerung) laufen schneller */
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
/* Mahlzeit-Schalter: nuechtern (klein, Falten hoch, kaum Magensaft, Pfoertner zu) oder nach dem Essen (gedehnt, Falten flach, Muskelwellen) */
var MAHLZEIT_TXT = ['Nüchtern: Der Magen ist klein und fast leer, der Pförtner bleibt meist zu.',
  'Nach dem Essen: Der Magen dehnt sich, Magensaft fließt, Muskelwellen treiben den Speisebrei portionsweise durch den Pförtner.'];
function setMahlzeit(an, still) {
  if (an === mahlzeit) return;
  mahlzeit = an; fzFest = false;
  if (an) tM = clockM;
  $('bNuechtern').classList.toggle('on', !an);
  $('bEssen').classList.toggle('on', an);
  if (!still) Kern.toast(MAHLZEIT_TXT[an ? 1 : 0]);
  lv++;
}
$('bNuechtern').onclick = function () { setMahlzeit(false); };
$('bEssen').onclick = function () { setMahlzeit(true); };

/* =====================================================================
   7. Schema - der Weg der Nahrung von Mund bis After (Knopf "Schema", wie bei der Leber)
   Flaches Bild von oben nach unten (Bildkoordinaten 460 x 722): Mund, Speiseroehre, Magen (hervorgehoben), Zwoelffingerdarm, Duenndarm, Dickdarm, Mastdarm,
   dazu Kaestchen der Zufluesse, nummerierte Legende, Kennzahlen und eine Hinweiszeile je nach Mahlzeit. Die Punkte sind dieselben Teilchen wie im 3D-Modell (gleiche
   Farben, gleiche Zeitfunktion lauf/saftZustand aus Abschnitt 6; Tempo, Pause, Mahlzeit und Stoffe-Schalter gelten mit): im Magen laufen sie entlang der Mittellinie des
   Schema-Magens (Lage s wie im 3D-Magen), davor durch Mund und Speiseroehre, danach durch Zwoelffingerdarm, Duenndarm und Dickdarm. Nuechtern gibt es nur wenig
   Magensaft. Das Schema legt nichts in der 3D-Szene an und zieht keinen Zufall; gebaut wird es erst beim ersten Oeffnen.
   ===================================================================== */
var SCH = (function () {
  var NS = 'http://www.w3.org/2000/svg', W = 460, H = 722, BREIT = false;   /* BREIT: Desktop, Legende rechts neben dem Weg; sonst (Handy) darunter, das Panel scrollt */
  var BRASS = '#E0A94A', DIM = '#8DA7B1', INK = '#E7EFF0', DARK = '#0B171C';
  var svg = null, built = false, DOT = [], DYN = {}, seen = {}, PTH = null;
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
  /* Catmull-Rom durch Punkte [x, y, r] (Spannung 0,5), n Punkte je Abschnitt */
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
  function bei(ln, s, o) {   /* Punkt, Richtung (o.tx, o.ty), Radius (o.r, falls vorhanden) bei Bogenlaenge s */
    s = Math.max(0, Math.min(ln.L, s));
    var lo = 0, hi = ln.p.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (ln.cum[m] <= s) lo = m; else hi = m; }
    var d = ln.cum[hi] - ln.cum[lo], t = d > 1e-9 ? (s - ln.cum[lo]) / d : 0, a = ln.p[lo], b = ln.p[hi], l;
    o.x = a[0] + (b[0] - a[0]) * t; o.y = a[1] + (b[1] - a[1]) * t; o.r = a.length > 2 ? a[2] + (b[2] - a[2]) * t : 0;
    o.tx = b[0] - a[0]; o.ty = b[1] - a[1]; l = Math.sqrt(o.tx * o.tx + o.ty * o.ty) || 1; o.tx /= l; o.ty /= l;
    return o;
  }
  function band(poly) {   /* Rohr mit wechselnder Breite um eine Mittellinie [x, y, r] */
    var n = poly.length, A = '', B = '', i;
    for (i = 0; i < n; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1), dx = poly[i1][0] - poly[i0][0], dy = poly[i1][1] - poly[i0][1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l * poly[i][2], ny = dx / l * poly[i][2];
      A += (i ? 'L' : 'M') + f1(poly[i][0] + nx) + ' ' + f1(poly[i][1] + ny);
      B = 'L' + f1(poly[i][0] - nx) + ' ' + f1(poly[i][1] - ny) + B;
    }
    return A + B + 'Z';
  }
  function linienPfad(pts) { var d = ''; pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }); return d; }
  function rohr(g, pts, w, fill, rand) {   /* Schlauch als dicke Linie mit dunklem Rand */
    var d = linienPfad(pts);
    E('path', { d: d, fill: 'none', stroke: rand || DARK, 'stroke-width': w + 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    E('path', { d: d, fill: 'none', stroke: fill, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  }

  /* ---- Lage der Stationen (Bildpunkte) ---- */
  var MUND = [230, 31];
  var ESO = [[230, 46], [231, 70], [262, 98], [286, 126], [288, 152]];
  var MAG = glatt([[326, 126, 24], [332, 158, 40], [326, 196, 42], [308, 228, 37], [268, 250, 29], [222, 254, 22], [184, 244, 16], [160, 230, 12]], 8);
  var DUO = glatt([[160, 230], [144, 240], [138, 262], [150, 282], [176, 290]], 6);
  var SI = glatt([[176, 290], [178, 326], [330, 326], [334, 348], [124, 348], [120, 370], [330, 370], [334, 392], [124, 392], [120, 414], [330, 414], [338, 432]], 4);
  var DICK = glatt([[338, 432], [372, 440], [372, 322], [360, 310], [80, 310], [68, 322], [68, 440], [100, 462], [190, 456], [230, 474]], 5);
  var REKT = [[230, 474], [230, 494]];
  var ZEITEN = [4.5, 17, 12, 2.5];   /* Sekunden, die ein Teilchen fuer Zwoelffingerdarm, Duenndarm, Dickdarm und Mastdarm braucht */
  var LN = null;

  function bauePfade() {
    LN = { eso: laenge([MUND].concat(ESO)), mag: laenge(MAG), strecken: [laenge(DUO), laenge(SI), laenge(DICK), laenge(REKT)] };
  }
  /* Lage eines Teilchens im Schema: Stufe st, Zeiten tb / ta, Lage s im Magen, Index i; schreibt P.x, P.y */
  var P = { x: 0, y: 0, r: 0, tx: 0, ty: 0 };
  function lage(K, ki, i, o) {
    var st = K.st[i], seitl = Math.sin(i * 2.399963 + ki) * 0.55, lat;
    if (st === 6) { o.x = MUND[0] + seitl * 14; o.y = MUND[1] + Math.cos(i * 1.7) * 4; return; }
    if (st === 1) {   /* Mund -> Speiseroehre */
      var u = 1 - K.tb[i] / SZ_.SCHLUCK; bei(LN.eso, (0.25 + 0.75 * u) * LN.eso.L, P);
      o.x = P.x - P.ty * seitl * 3; o.y = P.y + P.tx * seitl * 3; return;
    }
    if (st === 2 || st === 3) {
      var s = K.sg[i]; bei(LN.mag, s * LN.mag.L, P);
      lat = ki === KI.saft ? seitl : (ki === KI.wasser ? 0.75 : seitl);   /* Wasser an der inneren Seite (kleine Kurvatur) */
      var ox = P.x - P.ty * lat * P.r * 0.55, oy = P.y + P.tx * lat * P.r * 0.55;
      var tl = -K.tb[i];
      if (st === 2 && ki !== KI.saft && tl < SZ_.EIN) {   /* Ankunft vom Ende der Speiseroehre */
        var a = tl <= 0 ? 0 : tl / SZ_.EIN; a = a * a * (3 - 2 * a);
        ox = ESO[4][0] + (ox - ESO[4][0]) * a; oy = ESO[4][1] + (oy - ESO[4][1]) * a;
      }
      o.x = ox; o.y = oy; return;
    }
    /* hinter dem Magen: Zeit ta seit dem Pfoertner */
    var ta = K.tA[i], k = 0, t0 = 0;
    while (k < 3 && ta > t0 + ZEITEN[k]) { t0 += ZEITEN[k]; k++; }
    var fr = Math.max(0, Math.min(1, (ta - t0) / ZEITEN[k])), ln = LN.strecken[k];
    bei(ln, fr * ln.L, P);
    o.x = P.x - P.ty * seitl * 2.5; o.y = P.y + P.tx * seitl * 2.5;
  }

  function build(box) {
    if (built) return;
    box.innerHTML = '';
    BREIT = window.innerWidth > 1000; W = BREIT ? 800 : 460; H = BREIT ? 540 : 1010;
    bauePfade();
    svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Inter, "Segoe UI", system-ui, sans-serif',
      'aria-label': 'Schema: der Weg der Nahrung von Mund bis After, der Magen hervorgehoben' }, box);
    var i;
    /* ---- Darm: Dickdarm hinten, dann Duenndarm, Zwoelffingerdarm; Mastdarm ---- */
    var gd = E('g', null, svg);
    rohr(gd, DICK.map(function (q) { return [q[0], q[1]]; }), 15, '#B87868');
    rohr(gd, REKT, 14, '#B87868');
    rohr(gd, SI.map(function (q) { return [q[0], q[1]]; }), 11, '#D9937E');
    rohr(gd, DUO.map(function (q) { return [q[0], q[1]]; }), 13, '#E3A58C');
    E('circle', { cx: 230, cy: 499, r: 5, fill: DARK, stroke: '#B87868', 'stroke-width': 1.4 }, gd);
    /* ---- Mund und Speiseroehre ---- */
    var gm = E('g', null, svg);
    rohr(gm, ESO, 11, '#D99A8A');
    E('path', { d: 'M196 31 Q230 8 264 31 Q230 54 196 31 Z', fill: '#C96B6B', stroke: DARK, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, gm);
    E('path', { d: 'M204 31 Q230 37 256 31', fill: 'none', stroke: '#6A2A2A', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, gm);
    /* ---- Magen: hervorgehoben (groesser, kraeftiger Rand) ---- */
    var gs = E('g', null, svg);
    E('path', { d: band(MAG), fill: '#E88F8C', 'fill-opacity': 0.96, stroke: BRASS, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, gs);
    E('circle', { cx: MAG[0][0], cy: MAG[0][1], r: MAG[0][2], fill: '#E88F8C', 'fill-opacity': 0.96, stroke: BRASS, 'stroke-width': 2.6 }, gs);
    E('path', { d: band(MAG), fill: '#E88F8C', stroke: 'none' }, gs);   /* Rand der Kappe am Beginn nicht doppelt zeichnen */
    var ml = MAG.map(function (q) { return [q[0], q[1]]; });
    E('path', { d: linienPfad(ml.slice(6)), fill: 'none', stroke: '#B8605E', 'stroke-opacity': 0.5, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, gs);
    /* ---- Teilchen: je Art ein Pool von Kreisen ---- */
    var gt = E('g', { 'pointer-events': 'none' }, svg), FM = [['#F0DA6E', '#6A560A'], ['#F5AE60', '#6A3206'], ['#FFFFFF', '#55554F'], ['#A8DEF6', '#1A4E74'], ['#5FDAC8', '#0B5A50']];
    DOT = KINDS.map(function (K, ki) {
      var gg = E('g', null, gt), arr = [];
      for (i = 0; i < K.n; i++) arr.push({ el: E('circle', { r: 2, fill: FM[ki][0], stroke: FM[ki][1], 'stroke-width': 0.7, display: 'none' }, gg), on: false, x: -1, y: -1, r: -1 });
      return arr;
    });
    /* ---- Beschriftung ---- */
    var ga = E('g', { 'pointer-events': 'none' }, svg), LBL = { 'letter-spacing': 1.2, 'font-weight': 600 };
    function leiter(x0, y0, x1, y1) {
      E('line', { x1: f1(x0), y1: f1(y0), x2: f1(x1), y2: f1(y1), stroke: BRASS, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, ga);
      E('circle', { cx: f1(x0), cy: f1(y0), r: 1.8, fill: BRASS }, ga);
    }
    function station(s, tx, ty, anker, px, py, lx, ly, o) {
      if (px !== undefined) leiter(px, py, lx, ly);
      var a = { 'letter-spacing': 1.2, 'font-weight': 600 }; if (anker) a['text-anchor'] = anker; if (o) Object.keys(o).forEach(function (k) { a[k] = o[k]; });
      text(ga, tx, ty, s, 9.5, DIM, a);
    }
    station('MUND', 8, 34, null, 196, 31, 56, 31);
    station('SPEISERÖHRE', 8, 96, null, 258, 96, 100, 92);
    text(ga, 262, 202, 'MAGEN', 14, INK, { 'text-anchor': 'middle', 'letter-spacing': 2.4, 'font-weight': 700 });
    station('ZWÖLFFINGERDARM', 8, 258, null, 140, 262, 124, 254);
    station('DÜNNDARM', 8, 378, null, 121, 372, 76, 374);
    station('DICKDARM', 388, 378, null, 372, 372, 384, 374, { 'font-size': 9 });
    station('MASTDARM', 250, 490, null, 232, 486, 247, 487);
    function kasten(cx, cy, s, px, py) {
      var w = Math.round(s.length * 5.5 + 12);
      if (px !== undefined) E('line', { x1: f1(cx), y1: f1(cy), x2: f1(px), y2: f1(py), stroke: '#9C7530', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, ga);
      E('rect', { x: f1(cx - w / 2), y: f1(cy - 8), width: w, height: 16, rx: 3, fill: DARK, 'fill-opacity': 0.9, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
      text(ga, cx, cy + 3.3, s, 9.5, INK, { 'text-anchor': 'middle', 'stroke-width': 0, 'font-weight': 600 });
    }
    kasten(330, 31, 'Speichel', 262, 31);
    kasten(410, 158, 'Magensaft', 352, 162);
    kasten(238, 276, 'Galle', 164, 288);
    kasten(300, 288, 'Pankreassaft', 176, 292);
    /* Abzeichen an den Stationen */
    [[218, 24], [236, 76], [262, 202 + 18], [166, 266], [96, 352], [352, 340], [244, 480]].forEach(function (p, q) { abzeichen(ga, p[0], p[1], q + 1); });
    /* Legende, zwei Spalten */
    var LG = [
      ['Mund', 'Zähne zerkleinern, Speichel beginnt', 'die Verdauung der Kohlenhydrate'],
      ['Speiseröhre', 'Muskelwellen bringen den Bissen', 'in 5–10 Sekunden zum Magen'],
      ['Magen', 'Säure und Pepsin spalten Eiweiß,', 'der Speisebrei wird portionsweise weitergegeben'],
      ['Zwölffingerdarm', 'Galle und Pankreassaft neutralisieren', 'und spalten alle Nährstoffe'],
      ['Dünndarm', 'Die Bausteine gehen über die Zotten', 'ins Blut und in die Lymphe'],
      ['Dickdarm', 'Wasser und Salze werden entzogen,', 'der Stuhl wird eingedickt'],
      ['Mastdarm', 'Der Stuhl wird gesammelt', 'und ausgeschieden']
    ];
    var LX = BREIT ? 478 : 8, LY = BREIT ? 34 : 540, PITCH = BREIT ? 49 : 46, FT = 12.5, FZ = 10.4;
    LG.forEach(function (t, q) {
      var cy = LY + q * PITCH;
      abzeichen(ga, LX + 8, cy - 4, q + 1);
      text(ga, LX + 24, cy, t[0], FT, q === 2 ? INK : BRASS, { 'font-weight': 700 });
      text(ga, LX + 24, cy + 14, t[1], FZ, DIM, { 'stroke-width': 2.2 });
      text(ga, LX + 24, cy + 27, t[2], FZ, DIM, { 'stroke-width': 2.2 });
    });
    /* Kennzahlen */
    var kx = LX, ky = LY + 7 * PITCH - 6, kw = BREIT ? 300 : 444;
    E('rect', { x: kx, y: f1(ky), width: kw, height: 80, rx: 4, fill: DARK, 'fill-opacity': 0.88, stroke: '#9C7530', 'stroke-width': 0.9 }, ga);
    text(ga, kx + 10, ky + 16, 'KENNZAHLEN · VERDAUUNG', 10, BRASS, { 'font-weight': 700, 'letter-spacing': 0.8, 'stroke-width': 0 });
    ['Mund und Speiseröhre: Sekunden', 'Magen: 1–5 Stunden', 'Dünndarm: 3–6 Stunden', 'Dickdarm: 1–3 Tage'].forEach(function (s, q) {
      text(ga, kx + 10, ky + 32 + q * 13, s, FZ, DIM, { 'stroke-width': 0 });
    });
    /* Hinweiszeile je nach Mahlzeit, zwei Zeilen */
    var hx = BREIT ? 8 : 8, hy = BREIT ? 530 : ky + 100;
    DYN.hint = [0, 1, 2, 3].map(function (q) { return text(ga, BREIT ? 478 : hx, (BREIT ? ky + 102 : hy) + q * 14, '', 10.4, INK, { 'stroke-width': 2.2 }); });
    seen = { mz: -1 };
    built = true;
  }

  function update() {
    if (!built) return;
    var ki, i, o = { x: 0, y: 0 };
    for (ki = 0; ki < KINDS.length; ki++) {
      var K = KINDS[ki], pool = DOT[ki], show = K.im.visible;
      for (i = 0; i < K.n; i++) {
        var q = pool[i], st = K.st[i], v = show && st > 0 && (ki === KI.saft ? K.vis[i] > 0.01 : (K.st[i] >= 1 && fe > 0.05));
        if (v) {
          lage(K, ki, i, o);
          var rr = Math.round(Math.max(1.7, Math.min(4.2, (K.vis[i] > 0 ? K.vis[i] : K.rad * 0.55) * 19)) * 10) / 10, x = f1(o.x), y = f1(o.y);
          if (x !== q.x) { q.el.setAttribute('cx', x); q.x = x; }
          if (y !== q.y) { q.el.setAttribute('cy', y); q.y = y; }
          if (rr !== q.r) { q.el.setAttribute('r', rr); q.r = rr; }
          if (!q.on) { q.el.setAttribute('display', 'inline'); q.on = true; }
        } else if (q.on) { q.el.setAttribute('display', 'none'); q.on = false; }
      }
    }
    if (mahlzeit !== seen.mz) {
      seen.mz = mahlzeit;
      var wort = MAHLZEIT_TXT[mahlzeit ? 1 : 0].split(' '), zl = [''], mx = BREIT ? 48 : 82;   /* Hinweis auf Zeilen umbrechen */
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
  if (on) { if (quiz) quizEnd(); if (wege) wegeEnd(); closeCard(); lupeClose(); SCH.build($('schemaBox')); SCH.update(); }   /* Hilfekarte und Ueben weichen dem Schema */
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
   7c. Krankheitsbilder und Medikamente in 3D. Wirkgroessen SZW = Summe der (weich ueberblendeten) Anteile * Werte des Eintrags (SZ_DATEN: gastritis, erosion, ulkus, reflux, eingang,
   essen; saeure und wellen als Faktoren). Alle three.js-Objekte entstehen erst bei der ersten Wahl (krankBauen), ohne Wahl aendert sich nichts.
   Die Netze der Schleimhaut bekommen dann (einmal) einen Zusatz im Vertex- und Fragment-Shader (onBeforeCompile, dazu je Punkt das Gewicht aW: 0 an der Schnittkante, damit die Kappen
   passen, 1 sonst): Verschiebung entlang der Normale (uDisp; Gastritis: die Schleimhaut schwillt an und die Falten werden dicker; Reflux: der Wulst am Mageneingang wird weiter und
   schlaffer, Metoclopramid: minimal kraeftiger) und, in Ruhelage-Koordinaten der Punkte (die Zeichen wandern mit der Dehnung des Magens), der Krater des Geschwuers (uUlk: Mitte und
   Radius; Vertiefung, heller gelblich-weisser Grund, geroeteter Rand) und die Erosionen am Magenvorhof (uErs: kleine dunkelrote Punkte aus einem Zellraster der Lage, kein Zufall).
   Gastritis: die Farbe der Schleimhaut (alle drei Netze teilen sich die Materialien) mit der Wirkgroesse roeter. Reflux: das untere Ende der Speiseroehre ueber Vertexfarben
   gerroetet, die Speiseroehre wird durchscheinend (sonst sieht man die aufsteigenden Tropfen nicht), ein Teil der Magensaft-Tropfen steigt in die Speiseroehre (saftZustand, Abschnitt 6).
   Saeure: weniger Magensaft-Tropfen (saftZustand). Wellen: die Uhr der Mahlzeit clockM laeuft schneller (stroemungSchritt). Essen: beimWechsel stellt den Mahlzeit-Schalter auf "nach dem Essen".
   ===================================================================== */
var KR_ULK = 1.3;                                  /* Radius des Kraters bei Wirkgroesse 1 (cm) */
var KR_DICK = 0.22, KR_WEIT = 0.22, KR_FEST = 0.07;   /* Verschiebung (cm): Falten bei Gastritis, Wulst bei Reflux (weiter), Wulst bei Metoclopramid (fester) */
var KR_FARBE = srgb(0xC5262B);                     /* Zielfarbe der entzuendeten Schleimhaut */
var KR_GLSL = {
  kopf: ['attribute float aW;', 'uniform float uDisp;', 'uniform vec4 uUlk;', 'varying vec3 vP0;'].join('\n'),
  nor: ['{', '  vec3 dq = position - uUlk.xyz; float du = length(dq); float t = du / max(uUlk.w, 1e-4);',   /* Normale am Krater: zum Rand hin gekippt (Hang der Vertiefung) */
    '  if (uUlk.w > 0.0 && t < 1.0) { vec3 rd = dq / max(du, 1e-4); rd -= objectNormal * dot(rd, objectNormal); objectNormal = normalize(objectNormal + rd * (2.4 * t * (1.0 - t)) * aW); }', '}'].join('\n'),
  pos: ['{', '  float dep = uDisp * aW;',
    '  float t = length(position - uUlk.xyz) / max(uUlk.w, 1e-4);',
    '  if (uUlk.w > 0.0 && t < 1.0) dep += 0.4 * uUlk.w * (1.0 - t * t * (3.0 - 2.0 * t)) * aW;',
    '  transformed += normalize(objectNormal) * dep;', '  vP0 = position;', '}'].join('\n'),
  fkopf: ['varying vec3 vP0;', 'uniform vec4 uUlk;', 'uniform vec4 uEro;', 'uniform float uErs;', 'uniform float uUlkF;',
    'float krH(vec3 c) { return fract(sin(dot(c, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }'].join('\n'),
  frag: ['{', '  if (uUlk.w > 0.0) {',
    '    float t = distance(vP0, uUlk.xyz) / uUlk.w;',
    '    float boden = 1.0 - smoothstep(0.46, 0.6, t);',
    '    float rand = smoothstep(0.40, 0.56, t) * (1.0 - smoothstep(1.15, 1.75, t));',   /* breiter, dunkelroter Rand mit weichem Auslaufen; heilend (uUlkF klein): blasser */
    '    vec3 rc = mix(vec3(0.62, 0.15, 0.13), vec3(0.20, 0.002, 0.008), uUlkF);',
    '    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.80, 0.68, 0.40), boden);',
    '    diffuseColor.rgb = mix(diffuseColor.rgb, rc, rand * (0.5 + 0.5 * uUlkF));', '  }',
    '  if (uErs > 0.0) {',
    '    vec3 q = vP0 / 0.7; vec3 c = floor(q); float h = krH(c);',
    '    vec3 mid = c + 0.5 + 0.3 * vec3(krH(c + 1.7) - 0.5, krH(c + 3.1) - 0.5, krH(c + 5.3) - 0.5);',
    '    float punkt = (1.0 - smoothstep(0.2, 0.3, distance(q, mid))) * step(0.62, h);',
    '    float ort = 1.0 - smoothstep(0.55 * uEro.w, uEro.w, distance(vP0, uEro.xyz));',
    '    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.20, 0.004, 0.01), punkt * ort * uErs * 0.92);', '  }', '}'].join('\n')
};
function krankHaken(m, disp) {   /* Zusatz im Shader eines Materials der Schleimhaut (nach welleMat), Programm wird neu gebaut */
  var alt = m.onBeforeCompile;
  m.onBeforeCompile = function (sh) {
    alt(sh);
    sh.uniforms.uDisp = disp; sh.uniforms.uUlk = KR.ulk; sh.uniforms.uEro = KR.ero; sh.uniforms.uErs = KR.ers; sh.uniforms.uUlkF = KR.ulkF;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + KR_GLSL.kopf).replace('#include <morphnormal_vertex>', '#include <morphnormal_vertex>\n' + KR_GLSL.nor).replace('#include <project_vertex>', KR_GLSL.pos + '\n#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + KR_GLSL.fkopf).replace('#include <color_fragment>', '#include <color_fragment>\n' + KR_GLSL.frag);
  };
  m.needsUpdate = true;
}
/* Ort des Geschwuers (Ruhelage): auf der Schleimhaut der hinteren Haelfte am Magenwinkel (Knick der kleinen Kurvatur), Innenseite der Hinterwand */
function ulkusOrt() {
  var A = form.kennpunkte(0).ANGULUS.p, T = [A[0] + KR_ULK_D[0], A[1] + KR_ULK_D[1]], best = null, bz = 1e9;
  MG.innen.forEach(function (m) {
    if (m.userData.sid !== 'schleimhaut' || m.userData.deckel || m.material !== MAT.schleimhaut) return;
    var P = m.geometry.attributes.position.array, i;
    for (i = 0; i < P.length; i += 3) if ((P[i] - T[0]) * (P[i] - T[0]) + (P[i + 1] - T[1]) * (P[i + 1] - T[1]) < 0.36 && P[i + 2] < bz) { bz = P[i + 2]; best = [P[i], P[i + 1], P[i + 2]]; }   /* in einem Rohr um (x, y) der Punkt ganz hinten */
  });
  return best;
}
var KR_ULK_D = [1.9, 0.3];                         /* Lage des Geschwuers zum Magenwinkel (x, y, cm) */
function krankBauen() {
  if (KR || abgebaut || !App.ready) return;
  var cut = form.schnitt(0), E = form.EINGANG.p, i;
  KR = { ulk: { value: new THREE.Vector4(0, 0, 0, 0) }, ero: { value: new THREE.Vector4(0, 0, 0, 1) }, ers: { value: 0 }, ulkF: { value: 1 }, dS: { value: 0 }, dE: { value: 0 }, col: {}, eso: null };
  var uo = ulkusOrt(); if (uo) KR.ulk.value.set(uo[0], uo[1], uo[2], 0);
  var ua = mlU(ML.P0, mlUvonSig(0.82), [0, 0, 0]); KR.ero.value.set(ua[0], ua[1], ua[2], 3.8);   /* Magenvorhof: Mitte der Mittellinie bei s = 0,82 */
  var gedacht = [MAT.schleimhaut, MAT.schleimhautD, MAT.eingangI, MAT.eingangID];
  /* Gewicht aW je Punkt: 0 an den Kappen und an der Schnittkante (|Abstand| < 0,1 cm), 1 ab 0,9 cm Abstand */
  root.traverse(function (o) {
    if (!o.isMesh || gedacht.indexOf(o.material) < 0) return;
    var g = o.geometry, P = g.attributes.position.array, n = P.length / 3, W = new Float32Array(n), v;
    if (!o.userData.kappe) for (v = 0; v < n; v++) W[v] = sstep(0.1, 0.9, Math.abs(cut(P[v * 3], P[v * 3 + 1], P[v * 3 + 2])));
    g.setAttribute('aW', new THREE.BufferAttribute(W, 1));
  });
  ['schleimhaut', 'schleimhautD'].forEach(function (k) { KR.col[k] = MAT[k].color.clone(); krankHaken(MAT[k], KR.dS); });
  ['eingangI', 'eingangID'].forEach(function (k) { krankHaken(MAT[k], KR.dE); });
  /* Speiseroehre: Vertexfarben (unteres Ende, Gewicht je Punkt aus dem Abstand zum Mageneingang) und durchscheinend */
  var em = STRUCT.speiseroehre.meshes[0], eg = em.geometry, EP = eg.attributes.position.array, ev = EP.length / 3, EW = new Float32Array(ev);
  var ET = new Float32Array(ev), ed;
  for (i = 0; i < ev; i++) {
    ed = Math.sqrt(Math.pow(EP[i * 3] - E[0], 2) + Math.pow(EP[i * 3 + 1] - E[1], 2) + Math.pow(EP[i * 3 + 2] - E[2], 2));
    EW[i] = 1 - sstep(3.5, 7.5, ed);                  /* Roetung: unteres Ende, weich auslaufend */
    ET[i] = 1 - sstep(3.5, 6.0, ed);                  /* durchscheinend: nur die letzten 5 bis 6 cm ueber dem Mageneingang */
  }
  eg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(ev * 3).fill(1), 3));
  eg.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(ev).fill(1), 1));
  KR.eso = { geo: eg, W: EW, T: ET, n: ev };
  var altE = MAT.speiseroehre.onBeforeCompile;        /* Deckkraft je Punkt (Attribut aA), Material wird bei Reflux durchscheinend */
  MAT.speiseroehre.onBeforeCompile = function (sh) {
    altE(sh);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aA; varying float vA;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvA = aA;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vA;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vA;');
  };
  MAT.speiseroehre.vertexColors = true; MAT.speiseroehre.needsUpdate = true;
}
/* Netze, Farben, Speiseroehre nach den Wirkgroessen setzen */
function krAnwenden() {
  var g = SZW.gastritis, rf = SZW.reflux, i;
  KR.dS.value = -KR_DICK * g;                                           /* Gastritis: die Schleimhaut schwillt an, die Falten werden dicker (gegen die Normale: ins Lumen) */
  KR.dE.value = KR_WEIT * rf - KR_FEST * SZW.eingang;                   /* Reflux: Wulst weiter und schlaffer (mit der Normale), Metoclopramid: minimal kraeftiger */
  KR.ulk.value.w = SZW.ulkus > 0.002 ? KR_ULK * SZW.ulkus : 0;
  KR.ulkF.value = Math.min(1, SZW.ulkus);
  KR.ers.value = SZW.erosion > 0.002 ? SZW.erosion : 0;
  ['schleimhaut', 'schleimhautD'].forEach(function (k) { MAT[k].color.copy(KR.col[k]); if (g > 0) MAT[k].color.lerp(KR_FARBE, 0.72 * g); });
  var C = KR.eso.geo.attributes.color, a = C.array, W = KR.eso.W;       /* unteres Ende der Speiseroehre geroetet: Gruen und Blau abdunkeln */
  var A = KR.eso.geo.attributes.aA, aa = A.array, T = KR.eso.T, rm = Math.min(1, rf);
  for (i = 0; i < KR.eso.n; i++) { var w = W[i] * rm; a[i * 3] = 1 - 0.55 * w; a[i * 3 + 1] = 1 - 0.99 * w; a[i * 3 + 2] = 1 - 0.99 * w; aa[i] = 1 - 0.42 * T[i] * rm; }
  C.needsUpdate = true; A.needsUpdate = true;
  var tr = rf > 0.002;
  if (MAT.speiseroehre.transparent !== tr) { MAT.speiseroehre.transparent = tr; MAT.speiseroehre.needsUpdate = true; }
}
function szenarioWirkung() {
  var n = { gastritis: 0, erosion: 0, ulkus: 0, reflux: 0, helico: 0, schleim: 0, pumpe: 0, eingang: 0, essen: 0, saeure: 1, wellen: 1 }, neutral = { saeure: 1, wellen: 1 };
  SZ_DATEN.forEach(function (sc) {
    var a = SZ.anteil[sc.id], m = sc.modell;
    if (!a) return;
    Object.keys(n).forEach(function (k) { var nv = neutral[k] === undefined ? 0 : neutral[k]; n[k] += a * ((m[k] === undefined ? nv : m[k]) - nv); });
  });
  if (Object.keys(n).every(function (k) { return n[k] === SZW[k]; })) return;
  Object.keys(n).forEach(function (k) { SZW[k] = n[k]; });
  if (!KR) krankBauen();
  if (KR) krAnwenden();
  lv++;
}

/* =====================================================================
   7d. Lupe: Nahansicht einer Magendruese (Knopf "Lupe" in der Zeile "Ausschnitt", Panel #lupe, Canvas #lpCv; kein three.js; Texte von Joern freigegeben, magen-c1-texte.md Teil D)
   Ansicht 0 "Druese": Schnitt durch die Schleimhaut von oben nach unten - Mageninneres, Schleimschicht (mit Bicarbonat), Oberflaechenzellen mit Magengruebchen, zwei schlauchfoermige
   Druesen (oben Nebenzellen, in der Mitte Belegzellen, am Grund Hauptzellen), Blutgefaess, Unterschleimhaut. Ansicht 1 "Belegzelle" (Antippen einer Belegzelle, Knopf zurueck):
   Blut links, die Zelle mit Protonenpumpen, Chloridkanaelen und Bicarbonat-Transport, rechts das Druesen-Innere. Die Chips folgen dem Mahlzeit-Schalter und schalten ihn mit. Teilchen nur aus
   clock und Index (kein Zufall); Mengen aus der Fuellung fe (weich) und den Wirkgroessen SZW (helico, gastritis, ulkus, schleim, saeure, pumpe; Abschnitt 7c, weich ueberblendet).
   Die Lupe zeichnet nur, solange sie offen ist (lupeTick in der Renderschleife); Schema, Infokarte, Erklaer- und Szenariokarte schliessen sie bzw. weichen ihr; nach dem Schliessen
   beginnt sie wieder mit der Druese.
   ===================================================================== */
var LUPE = { open: false, ctx: null, dpr: 1, W: 400, H: 260, an: 0, key: '' };   /* an: 0 Druese, 1 Belegzelle */
var LP_T = {
  druese: {
    nuechtern: 'Die Drüse ruht fast. Eine dicke Schleimschicht mit Bicarbonat liegt auf der Schleimhaut – die Säure im Mageninneren erreicht die Zellen nicht.',
    essen: 'Geruch, Geschmack und Dehnung des Magens geben das Signal (Vagusnerv, Gastrin). Die Belegzellen pumpen Säure, die Hauptzellen geben Pepsinogen ab, das in der Säure zu Pepsin wird und Eiweiß spaltet. Die Nebenzellen halten mit Schleim dagegen.',
    gastritis: 'Helicobacter lebt in der Schleimschicht und schwächt sie. Säure dringt in die Schleimhaut, Abwehrzellen wandern ein – die Schleimhaut entzündet sich.',
    geschwuer: 'Wo der Schutz eingebrochen ist, haben Säure und Pepsin die Schleimhaut durchgedaut. Der Defekt reicht bis in die Unterschleimhaut, wo größere Gefäße liegen.',
    nsar: 'Ohne Prostaglandine bilden die Nebenzellen wenig Schleim und Bicarbonat. Die Schicht ist dünn – Säure erreicht die Oberfläche, es entstehen kleine Defekte.',
    pantoprazol: 'Die Belegzellen pumpen kaum noch Säure. Im Grund des Geschwürs wachsen von den Rändern her neue Zellen ein.'
  },
  zelle: {
    nuechtern: 'Die Pumpen ruhen größtenteils in Bläschen im Inneren der Zelle. Die Belegzelle bildet auch den Intrinsic Factor, ohne den Vitamin B12 im Darm nicht aufgenommen wird.',
    essen: 'Die Pumpen wandern an die Oberfläche. Jede tauscht ein Säureteilchen (H⁺) gegen Kalium; Chlorid folgt – im Drüseninneren entsteht Salzsäure. Zum Ausgleich gibt die Zelle Bicarbonat ins Blut ab.',
    pantoprazol: 'Pantoprazol hat sich fest an die Pumpen gebunden. Sie stehen still, es gelangt kaum Säure in die Drüse – auch nach dem Essen. Erst neu gebildete Pumpen arbeiten wieder.'
  }
};
var LP_GX = [150, 232];                              /* Mitten der beiden Druesen im Bild */
var LP_HIT = { y0: 102, y1: 168, halb: 44 };         /* Trefferflaeche der Belegzellen je Druese (grosszuegig, auch fuer den Finger) */
function lpFrac(x) { return x - Math.floor(x); }
function lpHash(n, k) { var q = Math.sin(n * 127.1 + k * 311.7) * 43758.5453; return q - Math.floor(q); }
function lpRampe(v, e) { return Math.max(0, Math.min(1, v / e, (1 - v) / e)); }
function lpKlemm(v) { return Math.max(0, Math.min(1, v)); }
function lpFarbe(a, b, t) {   /* Mischfarbe zweier Hexwerte */
  t = lpKlemm(t);
  var r = (a >> 16) & 255, g = (a >> 8) & 255, bl = a & 255;
  return 'rgb(' + Math.round(r + (((b >> 16) & 255) - r) * t) + ',' + Math.round(g + (((b >> 8) & 255) - g) * t) + ',' + Math.round(bl + ((b & 255) - bl) * t) + ')';
}
function lpWeg(pts) {   /* Polylinie mit Laengen: Punkt bei Anteil u (0..1) */
  var cum = [0], i;
  for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  var len = cum[cum.length - 1];
  return { at: function (u) {
    var d = lpKlemm(u) * len, k = 1;
    while (k < pts.length - 1 && cum[k] < d) k++;
    var a = pts[k - 1], b = pts[k], t = (d - cum[k - 1]) / (cum[k] - cum[k - 1]);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  } };
}
var LP_W = null;   /* Wege der Teilchen in der Druese: je Druese drei Varianten (Saeure, Pepsin, Schleim) */
function lpWegeBauen() {
  LP_W = LP_GX.map(function (cx) {
    var o = { saeure: [], pepsin: [], schleim: [] };
    [0, 1, 2].forEach(function (v) {
      var s = v % 2 ? 1 : -1, yc = [120, 136, 152][v];
      o.saeure.push(lpWeg([[cx + s * 16, yc], [cx, yc - 4], [cx, 64], [cx + 3 * (v - 1), 40], [cx + 9 * (v - 1), 6]]));
      o.pepsin.push(lpWeg([[cx + s * 10, 184], [cx, 176], [cx, 64], [cx - 3 * (v - 1), 40], [cx + 8 * (v - 1) - 4, 6]]));
      o.schleim.push(lpWeg([[cx + s * 12, 92], [cx, 78], [cx, 64], [cx + s * 22, 50]]));
    });
    return o;
  });
}
function lpLabel(c, text, x, y, rechts) {
  c.font = '9.5px system-ui, sans-serif'; c.textBaseline = 'alphabetic'; c.textAlign = rechts ? 'right' : 'left';
  var w = c.measureText(text).width, x0 = rechts ? x - w : x;
  c.fillStyle = 'rgba(12,26,32,0.82)'; c.fillRect(x0 - 3, y - 9, w + 6, 12);
  c.fillStyle = '#E7EFF0'; c.fillText(text, x, y);
}
function lpLeiter(c, x1, y1, x2, y2) {
  c.strokeStyle = 'rgba(231,239,240,0.55)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function lpPunkt(c, x, y, alpha, farbe, r) {
  if (alpha <= 0.01) return;
  c.globalAlpha = Math.min(1, alpha); c.fillStyle = farbe;
  c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
  c.globalAlpha = 1;
}
var LP_F = { saeure: '#FF8A78', pepsin: '#D9C2FF', schleim: '#F3E7A8', bicarb: '#9FD6F2', kalium: '#F2C75C', chlorid: '#8FE0A8' };
function lupeDruese(c) {
  var W = LUPE.W, H = LUPE.H, f = fe, g = SZW.gastritis, sl = Math.min(1, SZW.schleim), ul = Math.min(1, SZW.ulkus), he = Math.min(1, SZW.helico), pu = Math.min(1, SZW.pumpe), i, k, u, p, gi;
  var sa = (0.1 + 0.9 * f) * SZW.saeure * (1 - 0.6 * pu);          /* Saeuremenge 0..1 */
  var th = 24 * (1 - 0.65 * sl), top = 58 - th;                     /* Schleimschicht: Dicke, Oberkante */
  if (!LP_W) lpWegeBauen();
  c.fillStyle = '#10222A'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#162C35'; c.fillRect(0, 0, W, top);                 /* Mageninneres */
  /* Unterschleimhaut mit Fasern, Muskelschicht der Schleimhaut, Schleimhaut (bei Gastritis roeter) */
  c.fillStyle = '#B8927E'; c.fillRect(0, 204, W, H - 204);
  c.strokeStyle = 'rgba(120,80,70,0.5)'; c.lineWidth = 1;
  for (i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 26 + lpHash(i, 1) * 10, 210 + lpHash(i, 2) * 44); c.lineTo(i * 26 + 24, 210 + lpHash(i, 2) * 44 + 7 * (lpHash(i, 3) - 0.5)); c.stroke(); }
  c.fillStyle = '#8C4A4A'; c.fillRect(0, 198, W, 6);
  c.fillStyle = lpFarbe(0x9A5658, 0xB8323A, 0.85 * g); c.fillRect(0, 72, W, 126);
  c.fillStyle = lpFarbe(0xC77A7A, 0xD0484C, 0.85 * g); c.fillRect(0, 58, W, 14);   /* Oberflaechenzellen */
  c.strokeStyle = 'rgba(90,40,44,0.45)'; c.lineWidth = 0.8;
  for (i = 0; i < 44; i++) { c.beginPath(); c.moveTo(i * 9.2, 58); c.lineTo(i * 9.2, 72); c.stroke(); }
  /* Blutgefaess in der Unterschleimhaut mit Ast in die Schleimhaut, Blutkoerperchen laufen */
  [[0, 232, 400, 232], [292, 100, 292, 232]].forEach(function (l, q) {
    c.lineCap = 'round'; c.strokeStyle = '#6E2A26'; c.lineWidth = q ? 11 : 17; c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke();
    c.strokeStyle = '#D04A3E'; c.lineWidth = q ? 8 : 13; c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke();
  });
  for (i = 0; i < 7; i++) lpPunkt(c, lpFrac(i / 7 + clock * 0.03) * W, 232 + (lpHash(i, 4) - 0.5) * 6, 0.9, '#F29A8E', 2.4);
  for (i = 0; i < 3; i++) lpPunkt(c, 292 + (lpHash(i, 5) - 0.5) * 3, 232 - lpFrac(i / 3 + clock * 0.03) * 132, 0.9, '#F29A8E', 2.2);
  /* Gastritis: Abwehrzellen in der Schleimhaut */
  if (g > 0.01) [[48, 100], [76, 150], [104, 186], [110, 124], [276, 112], [268, 176], [318, 150], [196, 188]].forEach(function (q, n) {
    c.globalAlpha = lpKlemm(g * 1.2 - n * 0.03); c.fillStyle = '#F0E8F4'; c.strokeStyle = '#9C84B0'; c.lineWidth = 1;
    c.beginPath(); c.arc(q[0], q[1], 5.5, 0, 6.2832); c.fill(); c.stroke();
    c.fillStyle = '#7A5C9C'; c.beginPath(); c.arc(q[0] - 1.5, q[1], 2.4, 0, 6.2832); c.arc(q[0] + 2, q[1] + 1.2, 2, 0, 6.2832); c.fill(); c.globalAlpha = 1;
  });
  /* Druesen */
  LP_GX.forEach(function (cx) {
    c.fillStyle = '#2A1C22'; c.beginPath(); c.moveTo(cx - 9, 58); c.lineTo(cx + 9, 58); c.lineTo(cx + 4, 72); c.lineTo(cx - 4, 72); c.closePath(); c.fill();   /* Magengruebchen */
    [[-13, 84], [13, 92], [-13, 100]].forEach(function (q) {                                                                                            /* Nebenzellen (Schleim) */
      c.fillStyle = '#EBC0CC'; c.strokeStyle = '#B48898'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx + q[0], q[1], 9, 8, 0, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#F6DEE4'; c.beginPath(); c.arc(cx + q[0] - Math.sign(q[0]) * 2, q[1] - 2, 3, 0, 6.2832); c.fill();
    });
    [[-18, 122], [18, 134], [-18, 146], [18, 158]].forEach(function (q) {                                                                               /* Belegzellen (Saeure) */
      var s = q[0] < 0 ? 1 : -1, x = cx + q[0], y = q[1];
      c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = '#E8806F'; c.fillStyle = '#E8806F';
      c.beginPath(); c.moveTo(x + s * 6, y); c.lineTo(x - s * 7, y - 7); c.lineTo(x - s * 7, y + 7); c.closePath(); c.stroke(); c.fill();
      c.fillStyle = '#8E3C60'; c.beginPath(); c.arc(x - s * 5, y, 3, 0, 6.2832); c.fill();
    });
    [[-12, 172], [12, 176], [-12, 186], [12, 190]].forEach(function (q, n) {                                                                            /* Hauptzellen (Pepsinogen) */
      c.fillStyle = '#7C84C4'; c.strokeStyle = '#4F5693'; c.lineWidth = 1; c.beginPath(); c.arc(cx + q[0], q[1], 7.5, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#C9CCF0'; c.beginPath(); c.arc(cx + q[0] + 2, q[1] - 2, 1.6, 0, 6.2832); c.arc(cx + q[0] - 2, q[1] + 2, 1.4, 0, 6.2832); c.fill();
    });
    c.lineCap = 'round'; c.strokeStyle = '#241A20'; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, 70); c.lineTo(cx, 194); c.stroke();                       /* Drüsenlumen */
  });
  /* Defekt (Geschwuer): Krater durch die Schleimhaut bis in die Unterschleimhaut, Groesse mit der Wirkgroesse; Pantoprazol: neue Zellen von den Raendern */
  if (ul > 0.01) {
    var cx2 = 345, hw = 30 * ul, bo = 58 + 158 * ul;
    c.fillStyle = '#4A1C24'; c.strokeStyle = '#C03238'; c.lineWidth = 2.5; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(cx2 - hw - 8, 58); c.lineTo(cx2 + hw + 8, 58); c.lineTo(cx2 + hw * 0.6, bo); c.lineTo(cx2 - hw * 0.6, bo); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E6D8A0'; c.beginPath(); c.moveTo(cx2 - hw * 0.6 - 1, bo - 9); c.lineTo(cx2 + hw * 0.6 + 1, bo - 9); c.lineTo(cx2 + hw * 0.6, bo); c.lineTo(cx2 - hw * 0.6, bo); c.closePath(); c.fill();
    if (pu > 0.01) for (i = 0; i < 12; i++) {
      var t = 0.2 + 0.75 * (Math.floor(i / 2) / 5), sd = i % 2 ? 1 : -1, ex = cx2 + sd * (hw + 8 - (hw * 0.4 + 8) * t) - sd * 3, ey = 58 + (bo - 58) * t;
      c.globalAlpha = pu; c.fillStyle = '#E9A9A4'; c.strokeStyle = '#B45A58'; c.lineWidth = 1; c.beginPath(); c.arc(ex, ey, 3.4, 0, 6.2832); c.fill(); c.stroke(); c.globalAlpha = 1;
    }
  }
  /* Schleimschicht mit Bicarbonat; dahinter kleine Defekte der Oberflaeche bei duenner Schicht */
  if (sl > 0.01) [70, 122, 196, 262, 318].forEach(function (x, n) { c.globalAlpha = sl; c.fillStyle = '#3A1218'; c.beginPath(); c.arc(x, 58, 3.6 + (n % 2), 0, Math.PI); c.fill(); c.globalAlpha = 1; });
  c.fillStyle = 'rgba(222,214,150,0.5)'; c.fillRect(0, top, W, th);
  c.strokeStyle = 'rgba(222,214,150,0.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, top); c.lineTo(W, top); c.stroke();
  for (i = 0, k = Math.round(34 * (1 - 0.85 * sl)); i < k; i++) lpPunkt(c, lpHash(i, 5) * W + 4 * Math.sin(clock * 0.6 + i), top + 3 + lpHash(i, 6) * (th - 6), 0.9, LP_F.bicarb, 1.7);
  /* Helicobacter: kleine gebogene Staebchen in der Schleimschicht */
  if (he > 0.01) for (i = 0; i < 6; i++) {
    var hx = 40 + lpHash(i, 7) * (W - 90) + 8 * Math.sin(clock * 0.5 + i * 2), hy = top + th * (0.3 + 0.4 * lpHash(i, 8)), ha = 0.6 * Math.sin(clock * 0.7 + i) + lpHash(i, 9) * 3;
    c.globalAlpha = he; c.strokeStyle = '#B7E35A'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.arc(hx, hy, 4.6, ha, ha + 2.4); c.stroke(); c.globalAlpha = 1;
  }
  /* Teilchen: Saeure und Pepsin steigen aus der Druese ins Mageninnere, Schleim in die Schicht; Saeure aus dem Mageninneren wird in der Schicht abgefangen (duenn: erreicht die Oberflaeche) */
  LP_GX.forEach(function (cx, gi) {
    for (k = 0; k < 12; k++) { u = lpFrac(k / 12 + clock * 0.1 + lpHash(k, gi) * 0.5); p = LP_W[gi].saeure[k % 3].at(u); lpPunkt(c, p[0], p[1], lpKlemm(sa * 12 - k) * lpRampe(u, 0.08), LP_F.saeure, 2.3); }
    for (k = 0; k < 8; k++) { u = lpFrac(k / 8 + clock * 0.08 + lpHash(k, gi + 3) * 0.5); p = LP_W[gi].pepsin[k % 3].at(u); lpPunkt(c, p[0], p[1], lpKlemm((0.1 + 0.9 * f) * 8 - k) * lpRampe(u, 0.08), LP_F.pepsin, 2); }
    for (k = 0; k < 6; k++) { u = lpFrac(k / 6 + clock * 0.07 + lpHash(k, gi + 6) * 0.5); p = LP_W[gi].schleim[k % 3].at(u); lpPunkt(c, p[0], p[1], lpKlemm((1 - 0.8 * sl) * (0.4 + 0.6 * f) * 6 - k) * lpRampe(u, 0.1), LP_F.schleim, 1.9); }
  });
  var bound = top + th * (0.5 + 0.5 * sl) + 2 * sl;
  for (k = 0; k < 10; k++) { u = lpFrac(k / 10 + clock * 0.06 + lpHash(k, 11) * 0.4); lpPunkt(c, 20 + lpHash(k, 12) * (W - 40) + 5 * Math.sin(clock * 0.5 + k), 6 + u * (bound - 6), lpKlemm((0.15 + 0.85 * f) * SZW.saeure * 10 - k) * (1 - lpKlemm((u - 0.8) / 0.2)), LP_F.saeure, 2.1); }
  /* Beschriftung (Fuehrungslinien wie in der Lupe der Leber) */
  lpLabel(c, 'Mageninneres', 4, 16, false);
  lpLeiter(c, 80, 44, 118, 46); lpLabel(c, 'Schleimschicht', 4, 48, false);
  lpLeiter(c, 70, 66, 142, 62); lpLabel(c, 'Magengrübchen', 4, 70, false);
  lpLeiter(c, 102, 90, 138, 86); lpLabel(c, 'Nebenzellen (Schleim)', 4, 94, false);
  lpLeiter(c, 94, 136, 132, 130); lpLabel(c, 'Belegzellen (Säure)', 4, 140, false);
  lpLeiter(c, 124, 182, 140, 178); lpLabel(c, 'Hauptzellen (Pepsinogen)', 4, 186, false);
  lpLabel(c, 'Unterschleimhaut', 4, 218, false);
  lpLeiter(c, 340, 238, 330, 232); lpLabel(c, 'Blutgefäß', 396, 252, true);
  if (he > 0.5) { lpLeiter(c, 130, 20, 120, 40); lpLabel(c, 'Helicobacter', 100, 18, false); }
  if (ul > 0.3) { lpLeiter(c, 360, 20, 350, 74); lpLabel(c, 'Defekt (Geschwür)', 396, 18, true); }
  if (sl > 0.5) { lpLeiter(c, 250, 20, 256, 50); lpLabel(c, 'dünner Schleim (NSAR)', 200, 18, false); }
}
var LP_PY = [48, 92, 136, 180, 224], LP_CY = [70, 114, 158, 202], LP_TY = [62, 130, 198];   /* Pumpen, Chloridkanaele, Bicarbonat-Transporter (y im Bild) */
function lupeZelle(c) {
  var W = LUPE.W, H = LUPE.H, f = fe, pu = Math.min(1, SZW.pumpe), a = (0.08 + 0.92 * f) * (1 - 0.95 * pu), b = (0.1 + 0.9 * f) * (1 - 0.9 * pu), i, j, k, u, idx;
  c.fillStyle = '#10222A'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#3A1A20'; c.fillRect(0, 0, 100, H);                                         /* Blut */
  for (i = 0; i < 7; i++) { c.fillStyle = '#C9483A'; c.beginPath(); c.ellipse(16 + (i % 3) * 28 + lpHash(i, 1) * 6, lpFrac(i / 7 + clock * 0.04) * H, 9, 5, 0, 0, 6.2832); c.fill(); }
  c.fillStyle = '#241A20'; c.fillRect(288, 0, W - 288, H);                                  /* Druesen-Inneres */
  c.strokeStyle = 'rgba(200,120,120,0.22)'; c.lineWidth = 2;
  for (i = 0; i < 6; i++) { c.beginPath(); c.moveTo(290, 20 + i * 40); c.bezierCurveTo(312, 30 + i * 40, 308, 44 + i * 40, 292, 52 + i * 40); c.stroke(); }
  c.fillStyle = '#C75A58'; c.strokeStyle = '#7E3F3F'; c.lineWidth = 2;                       /* Zelle */
  c.beginPath(); c.moveTo(128, 20); c.lineTo(256, 20); c.arcTo(284, 20, 284, 48, 28); c.lineTo(284, 212); c.arcTo(284, 240, 256, 240, 28); c.lineTo(128, 240); c.arcTo(100, 240, 100, 212, 28); c.lineTo(100, 48); c.arcTo(100, 20, 128, 20, 28); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#8E3C60'; c.beginPath(); c.ellipse(150, 130, 26, 38, 0, 0, 6.2832); c.fill();
  c.strokeStyle = '#6A2E2E'; c.lineWidth = 6; c.beginPath(); c.moveTo(284, 20); c.lineTo(284, 240); c.moveTo(100, 20); c.lineTo(100, 240); c.stroke();   /* Zellwand */
  /* Bicarbonat-Transporter (Blutseite) und Chloridkanaele (zum Druesen-Inneren) */
  LP_TY.forEach(function (y) { c.fillStyle = '#6FA9CF'; c.strokeStyle = '#2E6A8C'; c.lineWidth = 1.2; c.fillRect(95, y - 9, 10, 18); c.strokeRect(95, y - 9, 10, 18); });
  LP_CY.forEach(function (y) { c.fillStyle = '#2F6B45'; c.strokeStyle = '#8FE0A8'; c.lineWidth = 1.2; c.fillRect(280, y - 7, 8, 14); c.strokeRect(280, y - 7, 8, 14); });
  /* Pumpen: nuechtern (meist) in Blaeschen im Zellinneren, nach dem Essen in der Wand; Pantoprazol sperrt sie */
  LP_PY.forEach(function (y, jj) {
    var wand = jj === 2 ? 1 : f, xp = 236 + 48 * wand, vr = jj === 2 ? 0 : 12 * (1 - f);
    if (vr > 0.5) { c.fillStyle = '#A8423F'; c.strokeStyle = '#6A2E2E'; c.lineWidth = 1.2; c.beginPath(); c.arc(236, y, vr, 0, 6.2832); c.fill(); c.stroke(); }
    c.fillStyle = lpFarbe(0x7DA2E8, 0x8A8F9A, pu); c.strokeStyle = '#3C5EA8'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(xp - 6, y - 11); c.lineTo(xp + 6, y - 11); c.lineTo(xp + 6, y + 11); c.lineTo(xp - 6, y + 11); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(xp - 2, y - 4); c.lineTo(xp + 2, y); c.lineTo(xp - 2, y + 4); c.stroke();
    if (pu > 0.01) { c.globalAlpha = pu; c.strokeStyle = '#F05A4A'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(xp - 11, y - 14); c.lineTo(xp + 11, y + 14); c.moveTo(xp + 11, y - 14); c.lineTo(xp - 11, y + 14); c.stroke(); c.globalAlpha = 1; }
  });
  /* Teilchen: H+ hinaus (Pumpe), K+ hinein (Pumpe), Cl- hinaus (Kanal), Bicarbonat ins Blut */
  LP_PY.forEach(function (y, jj) {
    for (k = 0; k < 3; k++) {
      idx = jj * 3 + k; u = lpFrac(idx * 0.37 + clock * 0.12 + k / 3);
      lpPunkt(c, 262 + u * 118, y + (lpHash(idx, 3) - 0.5) * 8 + (u > 0.4 ? (u - 0.4) * (lpHash(idx, 4) - 0.5) * 70 : 0), lpKlemm(a * 15 - idx) * lpRampe(u, 0.1), LP_F.saeure, 2.6);
      u = lpFrac(idx * 0.29 + 0.5 - clock * 0.1 + k / 3);
      lpPunkt(c, 262 + u * 118, y + (lpHash(idx, 5) - 0.5) * 8, lpKlemm(a * 15 - idx) * lpRampe(u, 0.1), LP_F.kalium, 2.4);
    }
  });
  LP_CY.forEach(function (y, jj) {
    for (k = 0; k < 2; k++) { idx = jj * 2 + k; u = lpFrac(idx * 0.41 + clock * 0.1 + k / 2); lpPunkt(c, 232 + u * 150, y + (lpHash(idx, 6) - 0.5) * 6, lpKlemm(a * 8 - idx) * lpRampe(u, 0.1), LP_F.chlorid, 2.4); }
  });
  LP_TY.forEach(function (y, jj) {
    for (k = 0; k < 3; k++) { idx = jj * 3 + k; u = lpFrac(idx * 0.33 + clock * 0.1 + k / 3); lpPunkt(c, 140 - u * 110, y + (lpHash(idx, 7) - 0.5) * 8, lpKlemm(b * 9 - idx) * lpRampe(u, 0.1), LP_F.bicarb, 2.4); }
  });
  /* Beschriftung */
  lpLabel(c, 'Blut', 4, 16, false);
  lpLabel(c, 'Drüseninneres', 396, 16, true);
  lpLeiter(c, 340, 66, 290, 50); lpLabel(c, 'Protonenpumpe', 396, 70, true);
  lpLeiter(c, 330, 114, 360, 100); lpLabel(c, 'Kalium (K⁺)', 396, 118, true);
  lpLeiter(c, 330, 160, 292, 158); lpLabel(c, 'Chlorid (Cl⁻)', 396, 162, true);
  lpLeiter(c, 360, 206, 340, 190); lpLabel(c, 'Säure (H⁺)', 396, 210, true);
  lpLeiter(c, 60, 124, 98, 130); lpLabel(c, 'Bicarbonat (ins Blut)', 4, 122, false);
  if (pu > 0.5) { lpLeiter(c, 340, 238, 290, 226); lpLabel(c, 'Pantoprazol (Pumpe gesperrt)', 396, 252, true); }
}
function lupeDraw() {
  var c = LUPE.ctx; if (!c) return;
  c.setTransform(LUPE.dpr, 0, 0, LUPE.dpr, 0, 0);
  if (LUPE.an) lupeZelle(c); else lupeDruese(c);
}
function lupeZustand() {   /* Schluessel des Textes: Pantoprazol, NSAR, Geschwuer, Gastritis (in dieser Rangfolge), sonst die Mahlzeit; in der Belegzelle nur Pantoprazol */
  var r = LUPE.an ? ['pantoprazol'] : ['pantoprazol', 'nsar', 'geschwuer', 'gastritis'], q = null, n;
  for (n = 0; n < r.length && !q; n++) if (SZ.anteil[r[n]] > 0.5) q = r[n];
  return q || (mahlzeit ? 'essen' : 'nuechtern');
}
function lupeText() {
  var z = lupeZustand();
  LUPE.key = LUPE.an + z;
  $('lpTitle').textContent = LUPE.an ? 'Belegzelle – so entsteht die Säure' : 'Magendrüse – Schnitt durch die Schleimhaut';
  $('lpText').textContent = (LUPE.an ? LP_T.zelle : LP_T.druese)[z];
  $('lpHint').style.display = LUPE.an ? 'none' : ''; $('lpLeg').style.display = LUPE.an ? 'none' : '';
  $('lpZurueck').style.display = LUPE.an ? '' : 'none';   /* Knopf neben den Chips */
  $('lpCv').classList.remove('klick');
}
function lupeChips() {
  Array.prototype.forEach.call($('lpChips').querySelectorAll('button[data-m]'), function (b) { b.classList.toggle('on', (b.getAttribute('data-m') === '1') === mahlzeit); });
}
function lupeOeffnen() {
  if (abgebaut) return;
  if (schemaOn) setSchema(false);
  if (quiz) quizEnd();
  if (wege) wegeEnd();
  closeCard(); setSelected(null);
  szWeichen();
  LUPE.an = 0; lupeChips(); lupeText();                  /* die Lupe beginnt mit der Druese im Zustand des Mahlzeit-Schalters */
  LUPE.open = true; $('lupe').classList.add('show'); $('bLupe').classList.add('on');
  kartenLage();
  lupeDraw();
}
function lupeClose() {
  if (!LUPE.open) return;
  LUPE.open = false; LUPE.an = 0; $('lupe').classList.remove('show'); $('bLupe').classList.remove('on');
  kartenLage();
}
function lupeBelegzelle(an) {   /* in die Belegzelle wechseln (Antippen) oder zurueck zur Druese */
  if (!LUPE.open) lupeOeffnen();
  LUPE.an = an ? 1 : 0; lupeText(); lupeDraw();
}
function lupeTreffer(e) {   /* Klick im Canvas: liegt er auf den Belegzellen einer Druese? (Bildkoordinaten) */
  var cv = $('lpCv'), r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * LUPE.W, y = (e.clientY - r.top) / r.height * LUPE.H;
  return LP_GX.some(function (cx) { return Math.abs(x - cx) < LP_HIT.halb && y > LP_HIT.y0 && y < LP_HIT.y1; });
}
(function lupeBauen() {
  LUPE.dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cv = $('lpCv'); cv.width = LUPE.W * LUPE.dpr; cv.height = LUPE.H * LUPE.dpr;
  try { LUPE.ctx = cv.getContext('2d'); } catch (e) { LUPE.ctx = null; }
  Array.prototype.forEach.call($('lpChips').querySelectorAll('button[data-m]'), function (b) { b.addEventListener('click', function () { setMahlzeit(b.getAttribute('data-m') === '1', true); lupeChips(); lupeText(); }); });
  cv.addEventListener('click', function (e) { if (!LUPE.an && lupeTreffer(e)) lupeBelegzelle(true); });
  cv.addEventListener('mousemove', function (e) { cv.classList.toggle('klick', !LUPE.an && lupeTreffer(e)); });
  $('lpZurueck').addEventListener('click', function () { lupeBelegzelle(false); });
  $('bLupeX').addEventListener('click', lupeClose);
  $('bLupe').addEventListener('click', function () { if (LUPE.open) lupeClose(); else lupeOeffnen(); });
})();
function lupeTick() {   /* nur solange offen: Text bei Wechsel des Zustands nachziehen und neu zeichnen */
  if (!LUPE.open) return;
  if (LUPE.key !== LUPE.an + lupeZustand()) lupeText();
  lupeChips(); lupeDraw();
}

/* =====================================================================
   7e. Export (Kern.Export): GLB statisch, GLB animiert und STL, jeweils der sichtbare Zustand (Durchsicht, ausgeblendete Strukturen, Innenansicht, Krankheitsbild; ohne Teilchen
   im statischen Export, ohne Beschriftung, Lupe und Schema). Wie bei der Leber; Besonderheiten des Magens:
   - Fuellung (Morph-Ziel) wird in die Lage gebacken (ohneMorph); die Muskelwellen (Shader) bleiben ausser Betracht.
   - Krankheitsbilder (Abschnitt 7c) wirken im Shader und werden fuer den Export aus denselben Formeln auf die Kopie angewendet: krBake verschiebt die Punkte der Schleimhaut und
     des Mageneingangs entlang der Normale (Falten, Wulst, Krater), krKlon legt Vertexfarben fuer Krater (Grund, Rand) und Erosionen an (die Punkte sind dabei groesser als im Bild, damit
     die Dreiecke sie tragen; der Zellraster kommt aus Math.sin statt aus dem Shader, die Lage der Erosionen weicht daher etwas ab). Die Speiseroehre behaelt die Vertexfarben der Roetung,
     ihre Durchsichtigkeit (Attribut aA im Shader) entfaellt im Export. Die gleiche Verschiebung gilt fuer STL und USDZ (cfg.bake); die Farbe von Krater und Erosionen gibt es in der USDZ nicht.
   - GLB animiert: die Stroemung (Kohlenhydrate, Eiweiss, Fett, Wasser, Magensaft) als eine Schleife von EX.P = SZ_.P Sekunden (ein Zyklus nach dem Essen, im zweiten Durchlauf, damit die Wellen
     eingeschwungen sind): jedes Teilchen ein Knoten mit Spuren fuer Lage und Groesse, berechnet mit lauf/saftZustand bei Mahlzeit, Fuellung und Wirkgroessen wie in der Ansicht. Magensaft
     laeuft ganze Umlaeufe je Schleife (sein Tempo weicht dadurch etwas ab). Nuechtern bewegen sich nur die Magensaft-Tropfen.
   Massstab: 1 Modelleinheit = 1 cm, die Datei hat Meter (reale Groesse).
   ===================================================================== */
var EX = { P: SZ_.P, NKEY: 252 };
function szenarioExport() {   /* aktives Krankheitsbild bzw. Medikament (Anteil > 0,5) fuer den Dateinamen, sonst null */
  var r = null;
  SZ_DATEN.forEach(function (sc) { if (SZ.anteil[sc.id] > 0.5) r = sc; });
  return r;
}
/* Verschiebung der Punkte (Export, USDZ): wie im Shader dep = uDisp * aW + Krater (Abschnitt 7c), entlang der Normale (mit dem Morph-Ziel der Normalen) */
function krBake(mesh) {
  if (!KR) return null;
  var g = mesh.geometry, aw = g.attributes.aW;
  if (!aw) return null;
  var mt = mesh.material, disp = (mt === MAT.schleimhaut || mt === MAT.schleimhautD) ? KR.dS.value : (mt === MAT.eingangI || mt === MAT.eingangID) ? KR.dE.value : null;
  var u = KR.ulk.value, R = u.w;
  if (disp === null || (!disp && !(R > 0))) return null;
  var P = g.attributes.position, N = g.attributes.normal, MN = g.morphAttributes.normal && g.morphAttributes.normal[0], inf = (mesh.morphTargetInfluences && mesh.morphTargetInfluences[0]) || 0, n = new THREE.Vector3();
  return function (i, v) {
    var w = aw.getX(i), dep = disp * w;
    if (R > 0) { var t = Math.sqrt(Math.pow(P.getX(i) - u.x, 2) + Math.pow(P.getY(i) - u.y, 2) + Math.pow(P.getZ(i) - u.z, 2)) / R; if (t < 1) dep += 0.4 * R * (1 - t * t * (3 - 2 * t)) * w; }
    if (!dep) return;
    n.set(N.getX(i), N.getY(i), N.getZ(i));
    if (MN && inf) n.set(n.x + MN.getX(i) * inf, n.y + MN.getY(i) * inf, n.z + MN.getZ(i) * inf);
    v.addScaledVector(n.normalize(), dep);
  };
}
function krFract(x) { return x - Math.floor(x); }
function krHash(x, y, z) { return krFract(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453); }
/* Vertexfarben der Kopie: Farbe der Schleimhaut (Gastritis), Krater (heller Grund, dunkelroter Rand, blasser bei Heilung) und Erosionen, gleiche Formeln wie der Fragment-Shader */
function krKlon(klon, mesh) {
  if (!KR || (mesh.material !== MAT.schleimhaut && mesh.material !== MAT.schleimhautD)) return;
  var u = KR.ulk.value, R = u.w, E = KR.ers.value, F = KR.ulkF.value, e = KR.ero.value;
  if (!(R > 0) && !(E > 0)) return;
  var P = mesh.geometry.attributes.position, n = P.count, C = new Float32Array(n * 3), b = mesh.material.color, i, c = new THREE.Color(), fl = new THREE.Color(0.80, 0.68, 0.40);
  var rc = new THREE.Color(0.62, 0.15, 0.13).lerp(new THREE.Color(0.20, 0.002, 0.008), F), er = new THREE.Color(0.20, 0.004, 0.01);
  for (i = 0; i < n; i++) {
    var x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    c.copy(b);
    if (R > 0) {
      var t = Math.sqrt(Math.pow(x - u.x, 2) + Math.pow(y - u.y, 2) + Math.pow(z - u.z, 2)) / R;
      var boden = 1 - sstep(0.46, 0.6, t), rand = sstep(0.40, 0.56, t) * (1 - sstep(1.15, 1.75, t));
      c.lerp(fl, boden); c.lerp(rc, rand * (0.5 + 0.5 * F));
    }
    if (E > 0) {
      var qx = x / 0.7, qy = y / 0.7, qz = z / 0.7, cx = Math.floor(qx), cy = Math.floor(qy), cz = Math.floor(qz), h = krHash(cx, cy, cz);
      var mx = cx + 0.5 + 0.3 * (krHash(cx + 1.7, cy + 1.7, cz + 1.7) - 0.5), my = cy + 0.5 + 0.3 * (krHash(cx + 3.1, cy + 3.1, cz + 3.1) - 0.5), mz = cz + 0.5 + 0.3 * (krHash(cx + 5.3, cy + 5.3, cz + 5.3) - 0.5);
      var punkt = (1 - sstep(0.32, 0.44, Math.sqrt((qx - mx) * (qx - mx) + (qy - my) * (qy - my) + (qz - mz) * (qz - mz)))) * (h >= 0.62 ? 1 : 0);
      var ort = 1 - sstep(0.55 * e.w, e.w, Math.sqrt(Math.pow(x - e.x, 2) + Math.pow(y - e.y, 2) + Math.pow(z - e.z, 2)));
      c.lerp(er, punkt * ort * E * 0.92);
    }
    C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b;
  }
  klon.geometry.setAttribute('color', new THREE.BufferAttribute(C, 3));
  klon.material.color.setRGB(1, 1, 1); klon.material.vertexColors = true;
}
var exCfg = {
  titel: 'Magen', praefix: 'magen', wurzelName: 'Magen',
  /* Schild unter dem Modell: Bounding-Box der exportierten Teile (Wurzel um -M verschoben, ohne Teilchen, Uebersicht) x -12,1 bis 10,9, y -13,0 bis 14,5, z -6,0 bis 7,3 -> x Mitte, y 1,5 cm unter der Unterkante, z vorn */
  schild: [-0.6, -14.5, 7.4],
  bereit: function () { return App.ready; },
  gruppen: function () { root.updateMatrixWorld(true); return [root]; },
  get zusatzStatisch() { var sc = szenarioExport(); return sc ? sc.datei : ''; },   /* aktives Krankheitsbild bzw. Medikament im Dateinamen */
  toast: function (msg) { Kern.toast(msg); },
  transparenz: true,
  ohneMorph: true,                                    /* Fuellung in die Lage backen (auch beim animierten GLB) */
  bake: krBake, klon: krKlon,
  /* Stroemung backen: je Teilchen ein Knoten (Groesse 0 = unsichtbar), Lage und Groesse als Spuren ueber eine Periode (EX.P) */
  animation: function (rootE) {
    var NK = EX.NKEY, times = new Float32Array(NK + 1), tracks = [], nPart = 0, i, j, ki, K, v = new THREE.Vector3(), alt = { clock: clock, clockM: clockM }, te0 = SZ_.P, list = [];
    for (j = 0; j <= NK; j++) times[j] = j * EX.P / NK;
    root.updateMatrixWorld(true);
    KINDS.forEach(function (Kd, k) {
      if (!kindOn[k]) return;
      for (i = 0; i < Kd.n; i++) {
        var L = k === KI.saft ? Kd.sb[i] : 0;
        list.push({ ki: k, i: i, rate: k === KI.saft ? Math.max(1, Math.round(EX.P / L)) * L / EX.P : 1, P: new Float32Array((NK + 1) * 3), S: new Float32Array((NK + 1) * 3), smax: 0 });
      }
    });
    for (j = 0; j <= NK; j++) {
      clockM = tM + te0 + times[j]; wellenSetzen();
      var te = clockM - tM, ph = te - Math.floor(te / SZ_.P) * SZ_.P;
      list.forEach(function (p) {
        if (p.ki === KI.saft) { clock = alt.clock + times[j] * p.rate; saftZustand(p.i, LB); } else lauf(p.ki, p.i, ph, LB);
        var r = (LB.st >= 1 && LB.st <= 4) ? LB.r : 0;
        v.set(LB.x, LB.y, LB.z).applyMatrix4(root.matrixWorld);
        p.P[j * 3] = v.x; p.P[j * 3 + 1] = v.y; p.P[j * 3 + 2] = v.z;
        p.S[j * 3] = p.S[j * 3 + 1] = p.S[j * 3 + 2] = r;
        if (r > p.smax) p.smax = r;
      });
    }
    clock = alt.clock; clockM = alt.clockM; wellenSetzen(); if (ST) ST.letzt = '';
    list.forEach(function (p) {
      if (p.smax <= 0) return;   /* nie sichtbar (nuechtern, ausgeblendeter Stoff): gar nicht erst aufnehmen */
      K = KINDS[p.ki];
      var node = new THREE.Mesh(K.im.geometry, K.im.material); node.name = K.name.replace(/[^A-Za-z0-9_]/g, '_') + '_' + (p.i + 1);
      node.position.set(p.P[0], p.P[1], p.P[2]); node.scale.set(p.S[0], p.S[1], p.S[2]);
      rootE.add(node);
      tracks.push(new THREE.VectorKeyframeTrack(node.name + '.position', times, p.P));
      tracks.push(new THREE.VectorKeyframeTrack(node.name + '.scale', times, p.S));
      nPart++;
    });
    var sz = szenarioExport();
    return { clips: [new THREE.AnimationClip('Magen_Stroemung', EX.P, tracks)], zusatz: sz ? sz.datei : (mahlzeit ? 'nach-dem-essen' : 'nuechtern'), nPart: nPart };
  },
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    animStart: 'Strömung wird aufgezeichnet …',
    stlLiesmich: ['Datei (Maßstab Millimeter, Z-Achse nach oben, reale Größe):', '- magen_ansicht.stl: alles, was beim Export sichtbar war', 'STL kennt keine Farbe – dafür gibt es die GLB-Datei.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Datei, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Reale Größe – STL kennt keine Farbe.';
    },
    glbLiesmich: function (i) {
      return [i.anim ? i.name + ': die Strömung von Kohlenhydraten, Eiweiß, Fett, Wasser und Magensaft (' + i.a.nPart + ' Teilchen, ' + EX.P + ' s) als Animation, läuft in Schleife. Die Teilchen sind symbolisch, nicht maßstäblich.' : i.name + ': farbiges 3D-Modell des Magens in der Ansicht beim Export, ohne Bewegung.', 'Maßstab: Meter (reale Größe). Die Signatur steht in den Metadaten und auf dem Schild unter dem Magen.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span><br>Reale Größe, mit Farben, ' + (i.anim ? 'mit Strömung: ' + i.a.nPart + ' Teilchen mit ' + (EX.NKEY + 1) + ' Keyframes, ' + EX.P + ' s Schleife. Im Viewer die Wiedergabe starten.' : 'ohne Bewegung.');
    }
  }
};
$('bGlbA').onclick = function () { Kern.Export.run('glb-anim', exCfg); };
$('bGlbS').onclick = function () { Kern.Export.run('glb', exCfg); };
$('bStl').onclick = function () { Kern.Export.run('stl', exCfg); };

/* =====================================================================
   7f. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, Safari) mit selbst erzeugter USDZ-Datei.
   Der Magen wird in cm modelliert: 0,01 m je cm ist die reale Groesse, gestartet wird in dieser Groesse. Die Stroemung laeuft weiter (Knopf Pause),
   Beschriftung und Teilchen gibt es in der USDZ bzw. in AR nicht. Die Gruppe arG und der AR-Aufbau entstehen erst beim ersten Klick: root ist um -M verschoben
   und bleibt unveraendert, arG wird hingestellt. Die Shader (Wellen, Krankheitsbilder) laufen in WebXR; die USDZ ist eine Momentaufnahme (Fuellung gebacken, Verschiebung ueber cfg.bake).
   ===================================================================== */
var AR_SKALA = 0.01;
var inAR = false, AR = null, arG = null, arCfg = null, xrOK = false;
if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-ar').then(function (ok) { xrOK = ok; }).catch(function () { xrOK = false; });   /* nur die Abfrage: three.js-Objekte entstehen erst beim ersten Klick */
function arFuss() {   /* Hoehe der Unterkante des sichtbaren Modells (ohne Teilchen) ueber dem Ursprung */
  var b = new THREE.Box3();
  root.updateMatrixWorld(true);
  root.traverse(function (o) {
    for (var q = o; q; q = q.parent) if (!q.visible) return;
    if (o.isMesh && !o.userData.teilchen && !o.userData.noexport) b.expandByObject(o);
  });
  return b.isEmpty() ? 0 : -b.min.y;
}
function arTexte() { $('arPause').textContent = playing ? 'Pause' : 'Weiter'; }
function arErzeugen() {
  arG = new THREE.Group(); arG.name = 'Magen_AR';
  arCfg = {
    renderer: renderer, scene: scene, camera: camera, root: arG,
    stufen: [0.005, 0.0075, 0.01, 0.015, 0.02, 0.03], skala: AR_SKALA,
    fuss: 0,                                          /* Unterkante steht auf der Flaeche; wird beim Start gesetzt */
    hintergrund: 0x0b171c,
    ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
    knoepfe: ['arEnd', 'arSmall', 'arBig', 'arPlace', 'arPause'],
    quickLook: function () { arQuickLook(); },
    beimStart: function () {
      inAR = true;
      if (schemaOn) setSchema(false);                 /* Schema, Lupe und Karten schliessen vor AR */
      lupeClose(); if (quiz) quizEnd(); if (wege) wegeEnd(); closeCard(); setSelected(null); szWeichen();
      scene.add(arG); arG.add(root);                  /* das Modell steht in der Gruppe, die in AR hingestellt wird */
      arCfg.fuss = arFuss();
      camera.near = 0.01; camera.far = 100;           /* Meter statt cm */
      $('labels').style.display = 'none'; $('leaders').style.display = 'none';
      arTexte();
    },
    beimEnde: function () {
      inAR = false;
      scene.add(root); scene.remove(arG);
      camera.near = kamAlt.near; camera.far = kamAlt.far;
      $('labels').style.display = showLabels ? '' : 'none'; $('leaders').style.display = showLabels ? '' : 'none';
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      groesse(w, h);
      lv++;
    }
  };
  AR = Kern.AR.xr(arCfg);
  return AR;
}
$('arPause').onclick = function () { $('bPlay').click(); arTexte(); };
$('bAR').onclick = function () {
  if (abgebaut) return;
  if (!AR) arErzeugen();
  AR.xr = xrOK;
  AR.start();
};
/* ---- USDZ fuer AR Quick Look: Momentaufnahme des Magens in der aktuellen Ansicht (ohne Teilchen) ---- */
function usdzBuild() {
  root.updateMatrixWorld(true);
  return Kern.AR.usdz({
    name: 'Magen', creator: 'Magen 3D - ' + Kern.WM, datei: 'magen.usda', skala: AR_SKALA,
    gruppen: [root], bake: krBake
  });
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: $('arQL'), fertig: 'Der Magen öffnet sich in AR Quick Look. Mit zwei Fingern lässt er sich vergrößern und drehen.' });
}

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now(), last = t0;
var App = window.MagenApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, ansicht: ansicht, dreiecke: tris, offen: function () { return openK; },
  mahlzeit: function (an) { setMahlzeit(!!an); },
  schema: function (an) { setSchema(!!an); },
  tippe: function (id) { if (wege) wegeAntwort(id, [id]); else if (quiz) quizAntwort(id, [id]); },
  wege: function () { return wege && { weg: wege.nr + 1, station: wege.st, n: wege.n, ok: wege.ok, fehl: wege.fehl, liste: wege.liste.slice(), fertig: wege.fertig, leucht: wege.leucht.slice() }; },
  quiz: function () { return quiz && { ziel: quiz.target, n: quiz.n, ok: quiz.ok }; },
  stoffe: function (id, an) { if (id in KI && KINDS[KI[id]].btn) stoffSetzen(KI[id], !!an); },
  /* fuer die Pruefung: Werte der Stroemung (Zahl der sichtbaren Teilchen je Art, Pfoertner, Fuellung, Wellen) und Lage der Teilchen (Koerper-Koordinaten) */
  stroemung: function () {
    var n = {}; KINDS.forEach(function (K) { var c = 0; for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) c++; n[K.id] = K.im && K.im.visible ? c : 0; });
    return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, fuellung: fe, te: clockM - tM, pfoertnerOffen: WOFF, wellen: WL.map(function (w) { return { s: w.s, a: w.a }; }), sichtbar: n };
  },
  teilchen: function () {
    var out = [];
    KINDS.forEach(function (K, ki) { for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) { K.im.getMatrixAt(i, STM); out.push({ art: K.id, st: K.st[i], s: K.sg[i], r: K.vis[i], p: [STM.elements[12], STM.elements[13], STM.elements[14]] }); } });
    return out;
  },
  lupe: function (an, z) { /* fuer die Pruefung: Lupe oeffnen/schliessen, optional Zustand 'nuechtern' | 'essen' (schaltet den Mahlzeit-Schalter mit) */ if (an) lupeOeffnen(); else lupeClose(); if (an && z !== undefined && z !== null) { setMahlzeit(z === 'essen' || z === 1 || z === true, true); lupeChips(); lupeText(); } return { offen: LUPE.open, belegzelle: !!LUPE.an, mahlzeit: mahlzeit }; },
  lupeBelegzelle: function (an) { lupeBelegzelle(an === undefined ? true : !!an); return { offen: LUPE.open, belegzelle: !!LUPE.an }; },   /* wie das Antippen einer Belegzelle bzw. der Knopf zurueck */
  szenario: function (id) { SZ.direkt(id || null); szenarioWirkung(); }, szw: function () { return Object.assign({}, SZW); },   /* Krankheitsbild oder Medikament sofort setzen (fuer die Pruefung), aktuelle Wirkgroessen */
    stand: function (f, te) { /* fuer die Pruefung: Fuellung (roh 0..1) und Zeit sofort setzen und festhalten */ fzFest = true; fzR = f; fe = sstep(0, 1, f); mahlzeit = f > 0.5; if (te !== undefined) { tM = clockM - te; } $('bNuechtern').classList.toggle('on', !mahlzeit); $('bEssen').classList.toggle('on', mahlzeit); lv++; },
  /* fuer die Pruefung: umgeklappte Dreiecke (Normale bei f = 1 gegenueber f = 0 um mehr als 90 Grad gedreht) und groesste Kantendehnung der Netze der Wand */
  netz: function () {
    var tot = 0, flip = 0, maxD = 0, je = {};
    MORPH.forEach(function (m) {
      var f0 = flip, d0 = maxD, t0 = tot;
      var g = m.geometry, P = g.attributes.position.array, D = g.morphAttributes.position[0].array, n = P.length / 9, t, a, b, c;
      if (g.index) return;
      for (t = 0; t < n; t++) {
        var v0 = [], v1 = [];
        for (c = 0; c < 3; c++) { var k = (t * 3 + c) * 3; v0.push([P[k], P[k + 1], P[k + 2]]); v1.push([P[k] + D[k], P[k + 1] + D[k + 1], P[k + 2] + D[k + 2]]); }
        var nr = function (v) { var ux = v[1][0] - v[0][0], uy = v[1][1] - v[0][1], uz = v[1][2] - v[0][2], wx = v[2][0] - v[0][0], wy = v[2][1] - v[0][1], wz = v[2][2] - v[0][2]; return [uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx]; };
        var n0 = nr(v0), n1 = nr(v1), l0 = Math.sqrt(n0[0] * n0[0] + n0[1] * n0[1] + n0[2] * n0[2]), l1 = Math.sqrt(n1[0] * n1[0] + n1[1] * n1[1] + n1[2] * n1[2]);
        var s2 = 0; for (a = 0; a < 3; a++) { b = (a + 1) % 3; s2 += Math.pow(v0[a][0] - v0[b][0], 2) + Math.pow(v0[a][1] - v0[b][1], 2) + Math.pow(v0[a][2] - v0[b][2], 2); }
        if (l0 / 2 / s2 < 0.1) continue;   /* Splitterdreiecke der Schnittkanten (schlechte Form, Flaeche/Kantenquadrate unter 0,1) zaehlen nicht */
        tot++;
        if (n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2] < 0) flip++;
        for (a = 0; a < 3; a++) { b = (a + 1) % 3; var e0 = Math.sqrt(Math.pow(v0[a][0] - v0[b][0], 2) + Math.pow(v0[a][1] - v0[b][1], 2) + Math.pow(v0[a][2] - v0[b][2], 2)), e1 = Math.sqrt(Math.pow(v1[a][0] - v1[b][0], 2) + Math.pow(v1[a][1] - v1[b][1], 2) + Math.pow(v1[a][2] - v1[b][2], 2)); if (e0 > 0.1 && e1 / e0 > maxD) maxD = e1 / e0; }
      }
      je[m.name] = (je[m.name] || 0) + (flip - f0);
    });
    return { dreiecke: tot, umgeklappt: flip, maxDehnung: Math.round(maxD * 100) / 100, je: je };
  },
  form: function () { return form; }, aussenSdf: function () { return form.aussen(fe); } };
function loop(now, frame) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (openK !== openZiel) {   /* Deckel gleitet weich (ca. 600 ms) */
    openK = Math.max(0, Math.min(1, openK + Math.sign(openZiel - openK) * dt / 0.6));
    applyLook(); lv++;
  }
  if (SZ.schritt(dt)) szenarioWirkung();                  /* Krankheitsbilder weich ueberblenden */
  if (ST) { stroemungSchritt(dt); wellenSetzen(); fuellungSetzen(fe); stroemungBild(); if (schemaOn) SCH.update(); lupeTick(); }
  if (inAR) { AR.frame(frame); renderer.render(scene, camera); return; }   /* in AR bestimmt die Sitzung die Kamera */
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  if (schemaOn) return;                                   /* Schema offen: das Bild des Magens ist ausgeblendet und wird nicht gezeichnet */
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
  AR && AR.abbauen();
  schemaWeicht(); lupeClose(); SCH.abbauen(); SZ.abbauen();
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
  stroemungBauen();
  Kern.Export.pruefeZiel('exp');
  root.visible = true;
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
  szenarioWirkung();                                      /* ein schon gewaehltes Krankheitsbild (vor dem Ende des Aufbaus) wirkt jetzt */
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('magen', organ);
})();
