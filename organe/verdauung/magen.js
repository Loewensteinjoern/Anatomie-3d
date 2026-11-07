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
    <span class="sep"></span>
    <button id="bSchema" class="gh" title="Der Weg der Nahrung von Mund bis After – der Magen hervorgehoben">Schema</button>
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
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schließen">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">Nächste</button><button class="gh" id="qStop">Beenden</button></div>
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
  if (w < 1000 && ueben) return { x0: 0, x1: w, y0: 60, y1: Math.max(150, toolsOben - 14 - 0.26 * h), labW: 104, fit: 70 };   /* Handy beim Ueben: die Karte (26 % der Hoehe) liegt direkt ueber der Werkzeugleiste, der Magen steht darueber */
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
    return { oben: u - (WERKZEUG_H.handy + (w < WERKZEUG_H.umbruch ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + WERKZEUG_H.desktop };
}
var WERKZEUG_H = { desktop: 150, handy: 126, umbruch: 345 };   /* Hoehe der Leiste (Pixel), unter der Breite umbruch bricht die erste Reihe (Ausschnitt) um (+32) */
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
/* Schleimhaut und Muskulatur sind nur in der Innenansicht oder bei Durchsicht zu sehen: wer sie in der Liste waehlt, bekommt die Innenansicht */
function waehleListe(id) {
  if (quiz || wege) return;
  if ((id === 'schleimhaut' || id === 'muskulatur') && !openZiel && !seeThrough) gehe(1);
  setSelected(id);
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
  if (!narrow && unten) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt den Magen, ohne Beschriftung bleibt sie frei; bei einer Hilfekarte und beim Ueben keine Beschriftung */
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
var playing = true, speed = 1, clock = 0, tM = 0, mahlzeit = false, fzR = 0, fe = 0, fzFest = false;   /* tM: Uhrzeit des Wechsels zu "nach dem Essen"; fzR: Fuellung roh 0..1, fe: weich */
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
  schlauchPunkt(sig, phi, rho, rad, wellenK(sig), SQ);
  o.x = SQ.x; o.y = SQ.y; o.z = SQ.z; o.sig = sig; o.r = rad * vis * sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u)); o.st = o.r > 0.001 ? 2 : 0;
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
  var te = clock - tM, TW = SZ_.TW, TT = SZ_.TT, n0 = Math.floor((te - SZ_.TA0) / TW) - 1, n, c = 0, i, offen = 0;
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
  var key = clock + '|' + fe + '|' + lv + '|' + tM + '|' + kindOn.join('');
  if (key === ST.letzt) return;
  ST.letzt = key;
  var te = clock - tM, ph = te - Math.floor(te / SZ_.P) * SZ_.P, ki, i;
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
/* Mahlzeit-Schalter: nuechtern (klein, Falten hoch, kaum Magensaft, Pfoertner zu) oder nach dem Essen (gedehnt, Falten flach, Muskelwellen) */
var MAHLZEIT_TXT = ['Nüchtern: Der Magen ist klein und fast leer, der Pförtner bleibt meist zu.',
  'Nach dem Essen: Der Magen dehnt sich, Magensaft fließt, Muskelwellen treiben den Speisebrei portionsweise durch den Pförtner.'];
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
    return { clock: clock, playing: playing, speed: speed, mahlzeit: mahlzeit, fuellung: fe, te: clock - tM, pfoertnerOffen: WOFF, wellen: WL.map(function (w) { return { s: w.s, a: w.a }; }), sichtbar: n };
  },
  teilchen: function () {
    var out = [];
    KINDS.forEach(function (K, ki) { for (var i = 0; i < K.n; i++) if (K.vis[i] > 0.001) { K.im.getMatrixAt(i, STM); out.push({ art: K.id, st: K.st[i], s: K.sg[i], r: K.vis[i], p: [STM.elements[12], STM.elements[13], STM.elements[14]] }); } });
    return out;
  },
  stand: function (f, te) { /* fuer die Pruefung: Fuellung (roh 0..1) und Zeit sofort setzen und festhalten */ fzFest = true; fzR = f; fe = sstep(0, 1, f); mahlzeit = f > 0.5; if (te !== undefined) { tM = clock - te; } $('bNuechtern').classList.toggle('on', !mahlzeit); $('bEssen').classList.toggle('on', mahlzeit); lv++; },
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
function loop(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (openK !== openZiel) {   /* Deckel gleitet weich (ca. 600 ms) */
    openK = Math.max(0, Math.min(1, openK + Math.sign(openZiel - openK) * dt / 0.6));
    applyLook(); lv++;
  }
  if (ST) { stroemungSchritt(dt); wellenSetzen(); fuellungSetzen(fe); stroemungBild(); if (schemaOn) SCH.update(); }
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
  root.visible = true;
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('magen', organ);
})();
