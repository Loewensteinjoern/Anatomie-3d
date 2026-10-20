/* =====================================================================
   Lunge - Lappen, Atemwege und Atemmechanik
   Beide Lungenfluegel von vorn wie im Lehrbuch (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn):
   fuenf Lappen (rechts 3, links 2) getrennt durch die Spalten, Luftroehre mit Knorpelspangen, Hauptbronchien und Bronchialbaum
   in den Lappen, Lungenarterien und -venen, Rippenfell, Zwerchfell, Brustkorb (Rippen, Brustbein, Zwischenrippenmuskeln) und das Herz
   zur Orientierung. Die Form liefert organe/lunge/lunge-form.js (Kern.Formen.lunge), das Herz kommt aus dem Herz-Modell (organe/herz/herz.js);
   hier wird sie vernetzt, eingefaerbt und bedient.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste. Atmung: Reiter Atmung und Schema aus dem Thorax-Modell
   (Abschnitt 6), dazu atmet das 3D-Modell mit (Abschnitt 7: Zwerchfell, Lunge, Rippen, Luftteilchen). Hilfekarten und Ueben wie bei der Niere.
   Krankheitsbilder und Medikamente (Kern.Szenarien, Daten Kern.Szenarien.daten.atmung): Reiter und Erklaerkarte; in 3D wirkt die Obstruktion (Abschnitt 7c).
   Export (GLB statisch, GLB animiert mit einer Ruheatmung, STL) und AR (WebXR, AR Quick Look): Abschnitte 7d und 7e.
   Zoomstufe: Wer einen Lungenlappen antippt, bekommt in der Infokarte "Alveole hier ansehen" (der Punkt bestimmt den naechsten Endast des Bronchialbaums
   im selben Lappen); der Knopf "Alveole" faehrt an eine feste Stelle im rechten Unterlappen (Abschnitt 7b). Das Saeckchen entsteht aus der Form des
   Alveolen-Moduls (organe/lunge/alveole.js, organ.form), die Kamera landet in dessen Startansicht (Adresse lunge/alveole).
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col), Text und Fakten der Infokarte.
   ===================================================================== */
/* Strukturliste der Lunge (vom Aufrufer vorgegeben, so uebernehmen; col = Farbpunkt/Material-Grundfarbe) */
var STRUKTUREN = [
  { id: 'luftroehre', de: 'Luftröhre', lat: 'Trachea', grp: 'Atemwege', col: 0xC9D3D1,
    txt: 'Etwa 10–12 cm langes Rohr vom Kehlkopf bis in den Brustraum. Hufeisenförmige Knorpelspangen halten sie offen, hinten schließt sie eine Wand aus Bindegewebe und glatter Muskulatur. Innen ist sie mit Flimmerepithel und Schleim ausgekleidet, die Staub und Keime zum Rachen zurückbefördern.',
    facts: { 'Länge': 'ca. 10–12 cm', 'Gerüst': '16–20 Knorpelspangen', 'Teilt sich': 'in Höhe des 4.–5. Brustwirbels' } },
  { id: 'hauptbronchien', de: 'Hauptbronchien', lat: 'Bronchi principales', grp: 'Atemwege', col: 0xBAC6C4,
    txt: 'An der Gabelung (Bifurkation) teilt sich die Luftröhre in den rechten und den linken Hauptbronchus. Der rechte verläuft steiler, ist kürzer und weiter – deshalb landen eingeatmete Fremdkörper meist rechts.',
    facts: { 'Rechts': 'steil, kurz, weit', 'Links': 'flacher, länger (unter dem Aortenbogen)', 'Fremdkörper': 'meist rechts' } },
  { id: 'bronchien', de: 'Lappen- und Segmentbronchien', lat: 'Bronchi lobares et segmentales', grp: 'Atemwege', col: 0xA9B7B5,
    txt: 'Die Hauptbronchien verzweigen sich wie ein umgekehrter Baum: zuerst in einen Lappenbronchus je Lungenlappen (rechts 3, links 2), dann in Segmentbronchien und immer feinere Äste bis zu den Bronchiolen. Am Ende jeder Verzweigung sitzen die Lungenbläschen (Alveolen).',
    facts: { 'Rechts': '3 Lappenbronchien', 'Links': '2 Lappenbronchien', 'Verzweigungen bis zur Alveole': 'ca. 23' } },
  { id: 'oberlappenR', de: 'Rechter Oberlappen', lat: 'Lobus superior dexter', grp: 'Lunge', col: 0xE6C7C9,
    txt: 'Oberster der drei Lappen der rechten Lunge. Seine Spitze (Lungenspitze) ragt bis über das Schlüsselbein. Die waagerechte Spalte trennt ihn vom Mittellappen.',
    facts: { 'Lunge': 'rechts, 3 Lappen', 'Grenze unten': 'Fissura horizontalis', 'Spitze': 'reicht über das Schlüsselbein' } },
  { id: 'mittellappen', de: 'Mittellappen', lat: 'Lobus medius', grp: 'Lunge', col: 0xDDB9BC,
    txt: 'Den Mittellappen gibt es nur rechts. Er liegt vorn zwischen der waagerechten und der schrägen Spalte und grenzt an das Herz.',
    facts: { 'Nur': 'rechts', 'Grenzen': 'Fissura horizontalis und Fissura obliqua', 'Lage': 'vorn, neben dem Herzen' } },
  { id: 'unterlappenR', de: 'Rechter Unterlappen', lat: 'Lobus inferior dexter', grp: 'Lunge', col: 0xD3ADB1,
    txt: 'Größter Lappen der rechten Lunge. Er liegt hinten-unten auf der Zwerchfellkuppel; die schräge Spalte trennt ihn von Ober- und Mittellappen. Hier sammeln sich bei bettlägerigen Menschen leicht Sekret und Keime (Pneumoniegefahr).',
    facts: { 'Lage': 'hinten-unten, auf dem Zwerchfell', 'Grenze': 'Fissura obliqua', 'Gefährdet': 'Pneumonie bei Bettlägerigkeit' } },
  { id: 'oberlappenL', de: 'Linker Oberlappen', lat: 'Lobus superior sinister', grp: 'Lunge', col: 0xE6C7C9,
    txt: 'Oberer der zwei Lappen der linken Lunge. An seinem Vorderrand ist die Herzbucht (Incisura cardiaca) ausgespart, darunter läuft er in einer schmalen Zunge (Lingula) aus.',
    facts: { 'Lunge': 'links, 2 Lappen', 'Aussparung': 'Incisura cardiaca', 'Zunge': 'Lingula' } },
  { id: 'unterlappenL', de: 'Linker Unterlappen', lat: 'Lobus inferior sinister', grp: 'Lunge', col: 0xD3ADB1,
    txt: 'Unterer Lappen der linken Lunge, hinten-unten auf der Zwerchfellkuppel. Die schräge Spalte trennt ihn vom Oberlappen.',
    facts: { 'Lage': 'hinten-unten', 'Grenze': 'Fissura obliqua', 'Links kleiner': 'wegen des Herzens' } },
  { id: 'pleura', de: 'Rippenfell und Pleuraspalt', lat: 'Pleura parietalis, Cavitas pleuralis', grp: 'Pleura', col: 0x1B7F9E,
    txt: 'Das Lungenfell überzieht die Lunge, das Rippenfell kleidet den Brustkorb von innen aus. Dazwischen liegt der Pleuraspalt mit einem dünnen Flüssigkeitsfilm und ständigem Unterdruck: Die Lunge haftet so an der Brustwand und folgt jeder Bewegung des Brustkorbs.',
    facts: { 'Inhalt': 'wenige ml Flüssigkeit', 'Druck': 'immer Unterdruck', 'Dringt Luft ein': 'Pneumothorax – die Lunge fällt zusammen' } },
  { id: 'zwerchfell', de: 'Zwerchfell', lat: 'Diaphragma', grp: 'Atemmuskeln und Brustkorb', col: 0xA24E4E,
    txt: 'Kuppelförmige Muskelplatte zwischen Brust- und Bauchraum und wichtigster Atemmuskel. Spannt es sich an, wird es flacher und tritt tiefer – der Brustraum wird größer, Luft strömt ein.',
    facts: { 'Anteil an der Ruheatmung': 'ca. zwei Drittel', 'Nerv': 'N. phrenicus (C3–C5)', 'Rechts höher': 'wegen der Leber' } },
  { id: 'zwischenrippen', de: 'Zwischenrippenmuskeln', lat: 'Musculi intercostales', grp: 'Atemmuskeln und Brustkorb', col: 0xA24E4E,
    txt: 'Muskeln in den Zwischenrippenräumen. Die äußeren heben die Rippen beim Einatmen, der Brustkorb wird weiter; die inneren senken sie bei der angestrengten Ausatmung.',
    facts: { 'Äußere': 'Einatmung', 'Innere': 'angestrengte Ausatmung', 'Ruheausatmung': 'passiv, ohne Muskel' } },
  { id: 'rippen', de: 'Rippen', lat: 'Costae', grp: 'Atemmuskeln und Brustkorb', col: 0xF4F6F2,
    txt: 'Zwölf Rippenpaare bilden mit Brustbein und Brustwirbelsäule den Brustkorb. Sie sind hinten gelenkig an der Wirbelsäule befestigt und heben sich beim Einatmen wie ein Eimerhenkel.',
    facts: { 'Anzahl': '12 Paare', 'Hinten': 'gelenkig an der Wirbelsäule', 'Beim Einatmen': 'heben sich' } },
  { id: 'brustbein', de: 'Brustbein', lat: 'Sternum', grp: 'Atemmuskeln und Brustkorb', col: 0xF4F6F2,
    txt: 'Flacher Knochen vorn in der Mitte des Brustkorbs. Die oberen Rippen sind über Knorpel mit ihm verbunden; beim Einatmen hebt es sich mit nach vorn-oben. Hier wird bei der Herzdruckmassage gedrückt.',
    facts: { 'Teile': 'Griff, Körper, Schwertfortsatz', 'Verbunden mit': 'Rippe 1–7 über Knorpel', 'Reanimation': 'Druckpunkt untere Hälfte' } },
  { id: 'lungenarterien', de: 'Lungenarterien', lat: 'Truncus pulmonalis, Arteriae pulmonales', grp: 'Gefäße', col: 0x3F63B5,
    txt: 'Sie bringen das sauerstoffarme Blut aus der rechten Herzkammer zur Lunge. Deshalb sind sie hier blau dargestellt – im Lungenkreislauf führen die Arterien das sauerstoffarme Blut.',
    facts: { 'Kommen aus': 'rechter Herzkammer', 'Blut': 'sauerstoffarm', 'Verschluss': 'Lungenembolie' } },
  { id: 'lungenvenen', de: 'Lungenvenen', lat: 'Venae pulmonales', grp: 'Gefäße', col: 0xC8372D,
    txt: 'Meist vier Lungenvenen führen das in den Alveolen mit Sauerstoff beladene Blut in den linken Vorhof. Im Lungenkreislauf führen also die Venen das sauerstoffreiche Blut.',
    facts: { 'Anzahl': 'meist 4', 'Münden in': 'linken Vorhof', 'Blut': 'sauerstoffreich' } },
  { id: 'herz', de: 'Herz (Lage)', lat: 'Cor', grp: 'Umgebung', col: 0x8C4747,
    txt: 'Das Herz liegt zwischen den Lungenflügeln, mit der Spitze nach links. Deshalb ist der linke Lungenflügel kleiner und hat die Herzbucht. Hier schlägt es: Die rechte Kammer pumpt das sauerstoffarme Blut in die Lungenarterien, über die Lungenvenen kommt es sauerstoffreich in den linken Vorhof zurück.',
    facts: { 'Lage': 'Mittelfellraum, Spitze links', 'Folge': 'linke Lunge nur 2 Lappen', 'Detailmodell': 'Herz öffnen im Körper' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Lunge &middot; Pulmo</div>
  <h1>Lappen, Atemwege &amp; <em>Atemmechanik</em></h1>
  <div class="sub">Holt Sauerstoff ins Blut und gibt Kohlendioxid ab.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">&Uuml;bersicht</button>
    <button id="cam1" class="gh">Bronchialbaum</button>
    <button id="cam2" class="gh">Hilus und Gef&auml;&szlig;e</button>
    <button id="cam3" class="gh">Zwerchfell und Pleura</button>
    <button id="bAlveole" class="gh" title="In ein Lungenbl&auml;schen hineinzoomen">Alveole</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bBrust" class="gh on" title="Rippen, Brustbein und Zwischenrippenmuskeln ein- oder ausblenden">Brustkorb</button>
    <span class="sep"></span>
    <button id="bSee" class="gh" title="Lungenlappen durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
    <button id="bLupe" class="gh" title="Lupe: Querschnitt durch die Brustwand mit dem Pleuraspalt">Lupe</button>
  </div>
  <div class="trow">
    <span class="cap">Atmung</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bSchema" class="gh" title="Die Atemmechanik als flaches Schema: Muskeln, Brustkorb, Druck und Luftstrom">Schema</button>
    <button id="bAR" class="gh" title="Die Lunge mit der Kamera in den Raum stellen">AR</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="schema" aria-label="Schema der Atemmechanik">
  <div class="sch-head"><span class="kick">Schema &middot; Thorax und Atemmechanik</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schlie&szlig;en">&times;</button></div>
  <div id="schemaBox">
  <div id="loBild">
    <svg id="loSvg" viewBox="0 0 800 620" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="Schematischer Brustkorb mit Lunge, Zwerchfell, Rippen und Zwischenrippenmuskeln">

      <path id="loKoerper" fill="var(--paper-2)" d=""/>

      <g id="loAtemweg" stroke="#9AA8A5" stroke-width="9" fill="none" stroke-linecap="round">
        <path d="M400 46 L400 152"/>
        <path id="loBronchL" d="M400 152 L336 206"/>
        <path id="loBronchR" d="M400 152 L464 206"/>
      </g>

      <path id="loHerz" fill="var(--herz)" opacity=".85" d=""/>

      <g id="loLungen">
        <path id="loPleuraR" fill="none" stroke="var(--sog)" stroke-width="15" stroke-linejoin="round" d="" opacity=".25"/>
        <path id="loPleuraL" fill="none" stroke="var(--sog)" stroke-width="15" stroke-linejoin="round" d="" opacity=".25"/>
        <path id="loLungeR" fill="var(--lunge)" stroke="var(--lunge-linie)" stroke-width="2.5" stroke-linejoin="round" d=""/>
        <path id="loLungeL" fill="var(--lunge)" stroke="var(--lunge-linie)" stroke-width="2.5" stroke-linejoin="round" d=""/>
        <path id="loLappenR1" stroke="var(--lunge-linie)" stroke-width="1.6" fill="none" opacity=".55" d=""/>
        <path id="loLappenR2" stroke="var(--lunge-linie)" stroke-width="1.6" fill="none" opacity=".55" d=""/>
        <path id="loLappenL1" stroke="var(--lunge-linie)" stroke-width="1.6" fill="none" opacity=".55" d=""/>
      </g>

      <!-- Luftpunkte laufen durch Luftröhre und Bronchien bis in die Lunge -->
      <g id="loLuftpunkte"></g>
      <text id="loAtemLabel" x="400" y="28" text-anchor="middle" font-size="21" font-weight="700"
            fill="#8A9A96" font-family="var(--sans)">kein Luftstrom</text>

      <!-- Brustwand LIEGT ÜBER der Lunge: Zwischenrippenmuskeln, Rippen, Brustbein -->
      <g id="loThoraxwand">
        <g id="loMuskeln"></g>
        <g id="loRippenKontur" stroke="var(--knochenkante)" stroke-width="14.5" fill="none" stroke-linecap="round"></g>
        <g id="loRippen" stroke="var(--knochen)" stroke-width="11" fill="none" stroke-linecap="round"></g>
        <rect id="loSternum" x="391" y="188" width="18" height="196" rx="9"
              fill="var(--knochen)" stroke="var(--knochenkante)" stroke-width="2"/>
      </g>

      <path id="loZwerchfell" fill="none" stroke="var(--muskel)" stroke-width="13" stroke-linecap="round" d=""/>
      <text id="loZwerchLabel" x="280" y="0" text-anchor="middle" font-family="var(--mono)" font-size="13"
            fill="var(--muskel)" font-weight="600">Zwerchfell</text>

      <!-- Bewegungspfeile -->
      <g id="loPfeile" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path id="loPfZwerch" stroke="var(--muskel)" stroke-width="5" d="" opacity="0"/>
        <path id="loPfRipL"  stroke="var(--muskel)" stroke-width="5" d="" opacity="0"/>
        <path id="loPfRipR"  stroke="var(--muskel)" stroke-width="5" d="" opacity="0"/>
      </g>
      <g font-family="var(--mono)" font-size="12" font-weight="600" text-anchor="middle" fill="var(--muskel)">
        <text id="loTxZwerch" x="400" y="0" opacity="0"></text>
        <text id="loTxRipL" x="0" y="342" opacity="0"></text>
        <text id="loTxRipR" x="0" y="342" opacity="0"></text>
      </g>

      <text x="424" y="96" font-family="var(--mono)" font-size="12.5" fill="#6E7C7A">Luftröhre</text>
      <text x="150" y="196" font-family="var(--mono)" font-size="12.5" fill="#6E7C7A">rechter Lungenflügel</text>
      <text x="562" y="196" font-family="var(--mono)" font-size="12.5" fill="#6E7C7A">linker Lungenflügel</text>
    </svg>

    <div id="loTempoBadge"><span>Tempo</span><b id="loTempoFaktor">¼×</b></div>

    <div class="pleura-chip">
      <b class="kopfzeile">Pleuraspalt</b>
    Der blaue Saum ist der Spalt zwischen Lunge und Brustwand. Hier herrscht immer Unterdruck – deshalb folgt die Lunge dem Brustkorb.
    <div id="loPleuraZahl" style="margin-top:5px;color:var(--sog);display:none"></div>
    </div>
  </div>

  <div id="loKette">
    <div class="glied" id="loG1">
      <div class="marke"><i>1</i> Muskeln</div>
      <div class="chips">
    <span class="chip" id="loChipZ">Zwerchfell</span>
    <span class="chip" id="loChipR">Rippen</span>
    <span class="chip" id="loChipA">Bauchpresse</span>
      </div>
      <div class="zahl" id="loZ1"></div>
    </div>
    <div class="glied" id="loG2">
      <div class="marke"><i>2</i> Brustkorb</div>
      <div class="wert" id="loW2">unverändert</div>
      <div class="skala"><span class="mitte" id="loM2"></span><span class="fuell" id="loB2"></span>
    <span class="beschr"><span>enger</span><span>weiter</span></span></div>
    </div>
    <div class="glied" id="loG3">
      <div class="marke"><i>3</i> Druck in der Lunge</div>
      <div class="wert" id="loW3">wie außen</div>
      <div class="skala"><span class="mitte" id="loM3" style="left:50%"></span><span class="fuell" id="loB3"></span>
    <span class="beschr"><span>niedriger</span><span>höher</span></span></div>
      <div class="zahl" id="loZ3"></div>
    </div>
    <div class="glied" id="loG4">
      <div class="marke"><i>4</i> Luftstrom</div>
      <div class="wert"><span class="strompfeil" id="loP4">–</span><span id="loW4">kein Luftstrom</span></div>
      <div class="zahl" id="loZ4">Atemzugvolumen: 0 ml</div>
    </div>
  </div>
  </div>
</div>

<div class="panel" id="lupe" aria-live="polite">
  <button class="gh hbtn" id="bLupeX" aria-label="Lupe schlie&szlig;en">&times;</button>
  <div class="lp-kick">Lupe &middot; Querschnitt</div>
  <h3 id="lpTitle">Pleuraspalt &ndash; warum die Lunge am Brustkorb haftet</h3>
  <div class="lp-chips" id="lpChips"><button class="gh on" data-pt="0" title="Normaler Pleuraspalt mit Unterdruck">normal</button><button class="gh" data-pt="1" title="Luft dringt in den Spalt, der Unterdruck geht verloren, die Lunge l&ouml;st sich und f&auml;llt zusammen.">Pneumothorax</button></div>
  <div class="lp-main"><canvas id="lpCv"></canvas><div class="lp-text" id="lpText"></div></div>
  <div class="lp-leg"><span><i style="background:#1B7F9E"></i>Rippenfell</span><span><i style="background:#8FD3F0"></i>Pleuraspalt (Fl&uuml;ssigkeit)</span><span><i style="background:#D9959B"></i>Lungenfell</span><span id="lpLegLuft" style="display:none"><i style="background:#DEE5E7"></i>Luft</span></div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#6F93E0">Blau</b> Lungenarterien &ndash; bringen sauerstoffarmes Blut aus der rechten Kammer.<br>
  <b style="color:#E0584C">Rot</b> Lungenvenen &ndash; f&uuml;hren sauerstoffreiches Blut zum linken Vorhof.<br>
  <b style="color:#3FB3D6">Petrol</b> Rippenfell und Pleuraspalt.</p>
  <p class="note">Von vorn gesehen; rechts im Bild liegt die linke Lunge.</p>
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
  <button class="gh" id="iOpen" style="display:none">Alveole hier ansehen</button>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schlie&szlig;en">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">N&auml;chste</button><button class="gh" id="qStop">Beenden</button></div>
</div>

<div id="arUI" aria-live="polite">
  <div class="ar-top"><span class="ar-title">Lunge in AR</span><span class="ar-phase" id="arPhase"></span><button class="ar-b" id="arEnd">Beenden</button></div>
  <div class="ar-hint" id="arHint">Bewege das Gerät langsam über den Tisch, bis ein Ring erscheint &ndash; dann tippen, um die Lunge hinzustellen.</div>
  <div class="ar-bot">
    <button class="ar-b" id="arSmall">Kleiner</button>
    <button class="ar-b" id="arBig">Gr&ouml;&szlig;er</button>
    <button class="ar-b" id="arPlace">Neu hinstellen</button>
    <button class="ar-b" id="arPause">Pause</button>
  </div>
  <div class="ar-wm">erstellt von J&ouml;rn L&ouml;wenstein mithilfe von Claude (K&uuml;nstliche Intelligenz)</div>
</div>`;
/* Reiter "Atmung" (Regler und Schalter aus dem Thorax-Modell; die IDs tragen das Praefix lo) */
var ATMUNG_PANE = `<div class="karte">
  <div class="titel"><span>Zwerchfell</span><b id="loLblZwerch">entspannt</b></div>
  <input type="range" id="loZwerchRegler" min="0" max="100" value="0" aria-label="Zwerchfell: Anspannung">
  <div class="enden"><span>entspannt</span><span>voll angespannt</span></div>
  <div class="schnell">
    <button class="gh" data-set="zwerch" data-wert="0">aus</button>
    <button class="gh" data-set="zwerch" data-wert="50">halb</button>
    <button class="gh" data-set="zwerch" data-wert="100">voll</button>
  </div>
</div>

<div class="karte">
  <div class="titel"><span>Zwischenrippenmuskeln</span><b id="loLblRippen">entspannt</b></div>
  <input type="range" id="loRippenRegler" min="0" max="100" value="0" aria-label="Äußere Zwischenrippenmuskulatur: Anspannung">
  <div class="enden"><span>entspannt</span><span>voll angespannt</span></div>
  <div class="schnell">
    <button class="gh" data-set="rippen" data-wert="0">aus</button>
    <button class="gh" data-set="rippen" data-wert="50">halb</button>
    <button class="gh" data-set="rippen" data-wert="100">voll</button>
  </div>
</div>

<button class="gh voll" id="loEntspannen">Alle Muskeln entspannen</button>
<button class="gh voll" id="loDemoRuhe">Ruheatmung starten</button>
<button class="gh voll" id="loDemoStress">Angestrengte Atmung starten</button>

<div class="karte">
  <div class="titel"><span>Rippen</span></div>
  <div class="segment" id="loRippenWahl">
    <button data-rippen="voll" class="on">sichtbar</button>
    <button data-rippen="kontur">durchsichtig</button>
    <button data-rippen="aus">aus</button>
  </div>
  <div class="titel" style="margin-top:14px"><span>Zwischenrippenmuskeln</span></div>
  <div class="segment" id="loMuskelWahl">
    <button data-muskel="voll" class="on">sichtbar</button>
    <button data-muskel="aus">aus</button>
  </div>
</div>

<div class="karte">
  <div class="titel"><span>Tempo</span></div>
  <div class="segment" id="loTempoWahl">
    <button data-tempo="1" class="on">normal</button>
    <button data-tempo="0.5">langsam</button>
    <button data-tempo="0.25">Zeitlupe</button>
  </div>
  <label class="schalter" for="loPfeileAn" style="margin-top:10px">
    <span>Bewegungspfeile</span><input type="checkbox" id="loPfeileAn" checked>
  </label>
  <label class="schalter" for="loZahlen">
    <span>Druckzahlen einblenden</span><input type="checkbox" id="loZahlen">
  </label>
</div>`;
/* Hilfekarten und "Probier das aus" (aus dem Thorax-Modell, Texte und HTML woertlich; dazu die eigene Karte "kreislauf"): t = Titel, u = Untertitel, h = Inhalt als HTML.
   Die Liste KARTEN_LISTE traegt die Knopftexte des Originals (data-karte) in dessen Reihenfolge. */
var karten = {
  pleura: {
    t:"Pleura und Pleuraspalt", u:"Warum die Lunge dem Brustkorb folgt",
    h:"<p>Die Lunge hat <b>keine eigene Muskulatur</b>. Sie kann sich nicht selbst ausdehnen und nicht selbst zusammenziehen.</p>"+
      "<p>Sie ist von einem doppelten Häutchen überzogen: Das <b>Lungenfell (Pleura visceralis)</b> liegt direkt auf der Lunge, das <b>Rippenfell (Pleura parietalis)</b> kleidet den Brustkorb von innen aus. Dazwischen liegt der <b>Pleuraspalt</b> mit einem dünnen Flüssigkeitsfilm.</p>"+
      "<p>In diesem Spalt herrscht ständig ein Unterdruck. Die beiden Blätter haften dadurch aneinander wie zwei nasse Glasplatten: verschiebbar, aber nicht trennbar.</p>"+
      "<div class='merk'>Der Brustkorb zieht die Lunge auf. Die Lunge wird gedehnt – sie dehnt sich nicht selbst.</div>"
  },
  zwerchfell: {
    t:"Das Zwerchfell", u:"Der wichtigste Atemmuskel",
    h:"<p>Das Zwerchfell (Diaphragma) ist eine Muskelplatte zwischen Brust- und Bauchraum. Entspannt wölbt es sich <b>kuppelförmig nach oben</b> in den Brustkorb hinein.</p>"+
      "<p>Spannt es sich an, wird es <b>flacher und tritt nach unten</b>. Der Brustraum wird höher – das ist der größte Anteil an der Einatmung.</p>"+
      "<ul><li>Rund zwei Drittel des Atemzugvolumens gehen auf das Zwerchfell zurück.</li>"+
      "<li>Gesteuert über den <b>Nervus phrenicus</b> aus dem Halsmark (C3–C5).</li>"+
      "<li>Alles, was von unten drückt – Schwangerschaft, Aszites, ein voller Magen, flaches Liegen – macht das Atmen schwerer.</li></ul>"
  },
  rippen: {
    t:"Zwischenrippenmuskulatur", u:"Der Brustkorb wird weiter",
    h:"<p>Die <b>äußeren Zwischenrippenmuskeln (Mm. intercostales externi)</b> liegen in den Zwischenrippenräumen. Bei Anspannung ziehen sie die Rippen nach oben und außen, der Brustkorb wird weiter und tiefer.</p>"+
      "<p>Im Modell sind sie die Felder zwischen den Rippen. Je stärker sie angespannt sind, desto kräftiger färben sie sich.</p>"+
      "<p>Die <b>inneren</b> Zwischenrippenmuskeln arbeiten in die Gegenrichtung und werden erst bei der <b>angestrengten</b> Ausatmung gebraucht – beim Husten, Pressen, Sprechen –, in Ruhe nicht.</p>"+
      "<div class='merk'>Stell den Brustkorb auf „sichtbar“: Dann siehst du, dass die Lunge unmittelbar an der Brustwand hängt und jede Rippenbewegung mitmacht.</div>"
  },
  fluegel: {
    t:"Warum der linke Flügel kleiner ist", u:"Das Herz braucht Platz",
    h:"<p>Das Herz liegt nicht mittig, sondern mit seiner Spitze <b>nach links verlagert</b>. Der linke Lungenflügel muss ihm ausweichen.</p>"+
      "<ul><li>Dafür ist am linken Flügel eine Einbuchtung ausgespart: die <b>Incisura cardiaca</b> (Herzeinschnitt). Du siehst sie als Delle an der Innenkante.</li>"+
      "<li><b>Rechts: 3 Lappen</b> (Ober-, Mittel-, Unterlappen).</li>"+
      "<li><b>Links: 2 Lappen</b> (Ober- und Unterlappen).</li></ul>"+
      "<p>Der rechte Hauptbronchus verläuft außerdem steiler und weiter als der linke. Deshalb landen aspirierte Fremdkörper meist rechts.</p>"
  },
  kreislauf: {   /* eigene Karte fuer das schlagende Herz (Abschnitt 7f), nicht aus dem Thorax-Modell */
    t:"Kleiner Kreislauf", u:"Das Blut zwischen Herz und Lunge",
    h:"<p>Jeder Punkt in den Gefäßen ist eine Portion Blut. Die rechte Kammer pumpt sie blau in die Lungenarterien. In den Lungenbläschen nimmt das Blut Sauerstoff auf und gibt Kohlendioxid ab; deshalb kommt es rot über die Lungenvenen zurück in den linken Vorhof. In Wirklichkeit schlägt das Herz etwa 60- bis 80-mal pro Minute, du atmest etwa 12- bis 16-mal – im Modell sind beide verlangsamt.</p>"
  },
  ausatmen: {
    t:"Ausatmen geht von allein", u:"Passive Ausatmung",
    h:"<p>Für die ruhige Ausatmung wird <b>kein Muskel</b> gebraucht. Es reicht, dass Zwerchfell und Zwischenrippenmuskeln <b>aufhören zu arbeiten</b>.</p>"+
      "<p>Lunge und Brustkorb sind elastisch. Wie ein gedehntes Gummiband kehren sie von selbst in ihre Ruhelage zurück – der Brustraum wird kleiner, der Druck in der Lunge steigt über den Außendruck, die Luft strömt hinaus.</p>"+
      "<div class='merk'>Probier es aus: tief einatmen, dann alle Muskeln entspannen. Die Luft geht hinaus, ohne dass du etwas anspannst.</div>"
  },
  angestrengt: {
    t:"Angestrengte Atmung", u:"Wenn die Ruheatmung nicht mehr reicht",
    h:"<p>Bei Belastung oder Atemnot reicht die Ruheatmung nicht aus. Dann ändern sich <b>drei</b> Dinge gleichzeitig:</p>"+
      "<ul><li>Die Atmung wird <b>tiefer</b> – Zwerchfell und Rippenmuskeln arbeiten kräftiger.</li>"+
      "<li>Die Atmung wird <b>schneller</b>.</li>"+
      "<li>Die Ausatmung wird <b>aktiv</b>: Bauchmuskeln und innere Zwischenrippenmuskeln pressen die Luft heraus. Der Brustkorb wird dabei sogar <b>enger als in Ruhe</b>.</li></ul>"+
      "<p>Im Modell siehst du das daran, dass beim Ausatmen der Balken „Brustkorb“ nach links über die Ruhelage hinausgeht und das Feld <b>Bauchpresse</b> aufleuchtet.</p>"+
      "<div class='merk'>Genau das beobachtest du bei einem Menschen in Atemnot: aufgestützte Arme, sichtbar arbeitende Hals- und Bauchmuskeln, hohe Atemfrequenz.</div>"
  },
  begriffe: {
    t:"Fachbegriffe zum Schreiben", u:"Schreibhilfe für deine Erläuterung",
    h:"<ul>"+
      "<li><b>Diaphragma</b> – Zwerchfell</li>"+
      "<li><b>Mm. intercostales externi</b> – äußere Zwischenrippenmuskeln</li>"+
      "<li><b>Mm. intercostales interni</b> – innere Zwischenrippenmuskeln, aktive Ausatmung</li>"+
      "<li><b>Pleura visceralis</b> – Lungenfell, liegt der Lunge auf</li>"+
      "<li><b>Pleura parietalis</b> – Rippenfell, kleidet den Brustkorb aus</li>"+
      "<li><b>Pleuraspalt</b> – Spalt dazwischen, ständiger Unterdruck</li>"+
      "<li><b>Inspiration</b> – Einatmung (aktiv)</li>"+
      "<li><b>Exspiration</b> – Ausatmung (in Ruhe passiv, angestrengt aktiv)</li>"+
      "<li><b>Atemzugvolumen</b> – Luftmenge pro Atemzug, in Ruhe etwa 500 ml</li>"+
      "<li><b>Incisura cardiaca</b> – Herzeinschnitt am linken Lungenflügel</li>"+
      "<li><b>Trachea</b> – Luftröhre; <b>Hauptbronchus</b> – erster Ast danach</li>"+
      "</ul>"+
      "<div class='merk'>Beschreibe die Reihenfolge: Welcher Muskel bewegt sich zuerst? Was macht der Brustkorb? Was macht der Druck? Und erst dann: Wohin strömt die Luft?</div>"
  }
};
var KARTEN_LISTE = [["pleura", "Pleura und Pleuraspalt"], ["zwerchfell", "Das Zwerchfell"], ["rippen", "Zwischenrippenmuskulatur"],
  ["fluegel", "Warum der linke Flügel kleiner ist"], ["kreislauf", "Kleiner Kreislauf"], ["ausatmen", "Ausatmen geht von allein"], ["angestrengt", "Angestrengte Atmung"], ["begriffe", "Fachbegriffe zum Schreiben"]];
var PROBIER = `      <ol>
        <li>Zwerchfell voll anspannen – und den Regler dort <b>stehen lassen</b>. Was passiert mit dem Luftstrom, obwohl die Lunge maximal gedehnt bleibt?</li>
        <li>Rippen auf <b>sichtbar</b>, dann langsam einatmen. Wohin geht die Lunge, wenn sich die Rippen heben? Danach die Rippen <b>ausschalten</b> und dasselbe noch einmal ansehen.</li>
        <li>Nur das Zwerchfell benutzen, dann nur die Rippenmuskeln. Womit holst du mehr Luft?</li>
        <li>Zwerchfell voll anspannen und die Rippenmuskeln <b>ganz aus</b> lassen – dann umgekehrt. Wann strömt gar nichts?</li>
        <li>Tief einatmen und dann alle Muskeln entspannen. Welcher Muskel schiebt die Luft wieder hinaus?</li>
        <li>Ruheatmung und angestrengte Atmung nacheinander laufen lassen. Vergleiche die ml – und achte darauf, welche Muskeln beim <b>Ausatmen</b> aufleuchten.</li>
        <li>Beobachte den Pleuraspalt (blauer Saum). Wird dort jemals ein Überdruck daraus?</li>
        <li>Ruheatmung starten und auf <b>Zeitlupe</b> stellen. Schau unten auf die vier Felder: In welcher Reihenfolge leuchten sie auf? Was kommt zuerst – der Druck oder der Luftstrom?</li>
      </ol>`;
var organ = { renderer: {}, aufbauen: aufbauen };
/* Mitte der Lunge im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, die Lunge steht im Modell mittig (spaeter: Ziel der Kamerafahrt aus dem Koerper) */
var M = [0, 126, -0.5];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und spaeter fuer die Fahrt aus dem Koerper */
var UEBERSICHT = { ext: [36, 52], halb: 18.5, ziel: [0 - M[0], 127 - M[1], 0 - M[2]] };   /* ziel = Blickpunkt in Modell-Koordinaten (Koerper-Punkt 0/127/0) */
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer Lunge und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 104 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, die Lunge steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand (cm), bei dem ext (Breite, Hoehe in cm) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * Math.PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (Desktop 115, Handy 100 bei drei Zeilen, je
   32 mehr, wenn eine der ersten Reihen umbricht: Reihe 1 (Ausschnitt, mit dem Knopf Alveole) unter Breite 497, dann unter 308 und unter 264); aufbauen misst sie selbst, die Werte stimmen ueberein.
   Die Leiste folgt dem Handy-Layout bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (100 + (w < 497 ? 32 : 0) + (w < 308 ? 32 : 0) + (w < 264 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 115 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten, also relativ zu M) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.mitte = M;   /* Mitte der Lunge im Koerper (cm): Koerper-Punkt = Modell-Punkt + mitte */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: 0, phi: Math.PI / 2, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = Kern.Formen && Kern.Formen.lunge;
if (!form) throw new Error('Die Form der Lunge ist nicht geladen.');
umg.bereich.innerHTML = MARKUP;
/* Herz-Modell nur als Skript nachladen (ohne Gestaltung): das Herz zur Orientierung und die Herzbucht der Lunge; ohne Modul gilt ein einfaches Ersatzherz */
var herzP = Kern.organLaden('herz', { ohneCss: true }).then(function (o) { return o.form || null; }, function (e) { console.warn(e && e.message || e); return null; });
/* Alveolen-Modul nur als Skript nachladen (ohne Gestaltung): liefert die Form des Saeckchens und die Startansicht der Fahrt (Abschnitt 7b); ohne Modul fehlt das Saeckchen, die Fahrt bleibt moeglich (Ersatz-Startansicht) */
var alvP = Kern.organLaden('alveole', { ohneCss: true }).then(function (o) { return o; }, function (e) { console.warn(e && e.message || e); return null; });

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var PI = Math.PI, DEG = PI / 180;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Strukturen, Materialien
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var LAPPEN = ['oberlappenR', 'mittellappen', 'unterlappenR', 'oberlappenL', 'unterlappenL'];   /* Strukturen der Lungenlappen (bei "Durchsicht" Glas) */
var BRUST = ['rippen', 'brustbein', 'zwischenrippen'];                                          /* Strukturen des Knopfes "Brustkorb" */
var GLAS = 0.25;                                                                                /* Deckkraft der Lappen bei "Durchsicht" (und der Rippen bei "durchsichtig") */
var LUFT_GLAS = 0.55;                                                                           /* Deckkraft der Luftwege (Luftroehre, Haupt- und Segmentbronchien) */
var MAT = {};
/* Material der Lappen kraeftiger als der Farbpunkt der Liste (die hellen Punktfarben wirken im Licht fast weiss); Unterlappen dunkler als Oberlappen */
var LAPPENFARBE = { oberlappenR: 0xE3A2A8, mittellappen: 0xDB949D, unterlappenR: 0xD0868F, oberlappenL: 0xE3A2A8, unterlappenL: 0xD0868F };
LAPPEN.forEach(function (sid) { MAT[sid] = mat(LAPPENFARBE[sid], { rough: 0.5, coat: 0.3, coatRough: 0.45 }); });
MAT.luftroehre = mat(0xC9D3D1, { rough: 0.5, coat: 0.25, opacity: LUFT_GLAS });   /* Luftwege wie Glas, damit man die Luftteilchen darin sieht; beim Antippen und fuer die Sichtpruefung zaehlen sie als undurchsichtig (userData.dicht) */
MAT.spangen = mat(0xE6EDEB, { rough: 0.45, coat: 0.3 });                   /* Knorpelspangen der Luftroehre, etwas heller */
MAT.hauptbronchien = mat(0xBAC6C4, { rough: 0.5, coat: 0.25, opacity: LUFT_GLAS });
MAT.bronchien = mat(0xA9B7B5, { rough: 0.5, coat: 0.25, opacity: LUFT_GLAS });
MAT.pleura = mat(0x1B7F9E, { rough: 0.3, coat: 0.5, opacity: 0.22 * 0.45, side: THREE.DoubleSide });
MAT.herz = mat(0x8C4747, { rough: 0.55, coat: 0.25, opacity: 0.35 });
MAT.zwerchfell = mat(0xffffff, { rough: 0.6, side: THREE.DoubleSide, opacity: 0.85, vc: true });   /* Farbe je Eckpunkt: Muskel dunkler, Sehnenplatte (Centrum tendineum) in der Mitte heller */
MAT.zwischenrippen = mat(0xA24E4E, { rough: 0.6, opacity: 0.16, side: THREE.DoubleSide });   /* Deckkraft folgt der Anspannung: 0.16 + 0.46 * clamp01(S.i), wie im Schema */
MAT.rippen = mat(0xD8CDB3, { rough: 0.8, env: 0.2 });
MAT.knorpel = mat(0xF4F6F2, { rough: 0.7, env: 0.25 });                    /* Rippenknorpel, heller als der Knochen */
MAT.brustbein = mat(0xD8CDB3, { rough: 0.8, env: 0.2 });   /* wie die Rippen */
MAT.wirbel = mat(0x8C8676, { rough: 0.85, env: 0.2 });                     /* Andeutung der Wirbelsaeule (keine Struktur) */
MAT.lungenarterien = mat(0x3F63B5, { rough: 0.4, coat: 0.3, opacity: LUFT_GLAS });   /* Gefaesse wie Glas, damit man die Blutportionen darin sieht (Abschnitt 7f); beim Antippen zaehlen sie als undurchsichtig (userData.dicht) */
MAT.lungenvenen = mat(0xC8372D, { rough: 0.4, coat: 0.3, opacity: LUFT_GLAS });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });
['luftroehre', 'hauptbronchien', 'bronchien', 'lungenarterien', 'lungenvenen'].forEach(function (k) { MAT[k].userData.dicht = true; });

var root = new THREE.Group(); root.name = 'Lunge'; root.position.set(-M[0], -M[1], -M[2]); scene.add(root);   /* Koerper-Koordinaten, um die Mitte M verschoben */
var tris = { lappen: 0, pleura: 0, atemwege: 0, gefaesse: 0, brustkorb: 0, herz: 0 };
function addMesh(sid, geo, material, name, order, eltern) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order;
  if (sid) { m.userData.sid = sid; STRUCT[sid].meshes.push(m); } else m.userData.deko = true;
  (eltern || root).add(m);
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };

/* =====================================================================
   2. Geometrie: Lappen, Rippenfell, Herz, Atemwege, Gefaesse, Zwerchfell, Brustkorb
   ===================================================================== */
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var HL = klein ? 0.5 : 0.35;                      /* Gitterweite der Lappen (cm) */
var HP = klein ? 0.55 : 0.4;                      /* Gitterweite des Rippenfells */
var HH = klein ? 0.4 : 0.3;                       /* Gitterweite des Herzens (gerastert genug fuer die Herzbucht) */
var ell = S.ellipsoid, kap = S.kapsel;
var RUND = 1.5;                                   /* Verrundung der Lappen-Unterkante an der Zwerchfellkuppel (cm): keine duennen, ausgefransten Raender unten (nur Detailmodell) */

/* Netz aus einem Abstandsfeld: Gitter ueber bounds mit Weite h, glatte Normalen */
async function netz(fn, bounds, h, fortschritt) {
  var G = S.makeGrid(bounds, h), F = await S.evalFeld(G, fn, fortschritt);
  if (abgebaut) return null;
  return S.geometrie(G, F);
}
function weiter(a, b) { return function (f) { return setLoad(a + f * (b - a)); }; }

/* Mehrere Geometrien zu einer zusammenfassen (Position, Normale, Index) */
function zusammen(liste) {
  var pos = [], nor = [], idx = [];
  liste.forEach(function (g) {
    var p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i;
    for (i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
    if (g.index) for (i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    else for (i = 0; i < p.count; i++) idx.push(base + i);
    g.dispose();
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return geo;
}
/* Rohre entlang von Linien { pts, r0, r1 } (Koerper-Koordinaten), Radius gleitet von r0 nach r1; Enden mit Kappe; alle zu einer Geometrie.
   mitZentren: je Eckpunkt die Mitte seines Rings (geo.userData.zentren, x y z), damit sich der Radius spaeter verstellen laesst (Verengung bei Asthma und COPD) */
function rohre(linien, mitZentren) {
  var pos = [], nor = [], idx = [], zen = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rm = Math.max(l.r0, l.r1), rad = l.seiten || (rm > 0.5 ? 14 : rm > 0.2 ? 10 : 7), tub = l.segmente || Math.max(6, l.pts.length * 5);
    var g = new THREE.TubeGeometry(kurve, tub, rm, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    for (i = 0; i <= tub; i++) {   /* jeden Ring um seine Mitte auf den Radius an dieser Stelle skalieren */
      var f = (l.r0 + (l.r1 - l.r0) * (i / tub)) / rm, c0 = kurve.getPointAt(i / tub);
      for (j = 0; j <= rad; j++) { var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f); if (mitZentren) zen.push(c0.x, c0.y, c0.z); }
    }
    for (i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); }
    for (i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
    [[0, -1, 0], [1, 1, tub * (rad + 1)]].forEach(function (e) {   /* [Ort auf der Kurve, Richtung der Kappe, Ring im Rohr] */
      var c = kurve.getPointAt(e[0]), T = kurve.getTangentAt(e[0]), b0 = pos.length / 3;
      pos.push(c.x, c.y, c.z); nor.push(T.x * e[1], T.y * e[1], T.z * e[1]);
      for (j = 0; j < rad; j++) { var v = e[2] + j; pos.push(p.getX(v), p.getY(v), p.getZ(v)); nor.push(T.x * e[1], T.y * e[1], T.z * e[1]); }
      if (mitZentren) for (j = 0; j <= rad; j++) zen.push(c.x, c.y, c.z);
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
  if (mitZentren) geo.userData.zentren = new Float32Array(zen);
  return geo;
}

/* einfaches Ersatzherz (wie im Koerper), falls das Herz-Modell fehlt: gerundeter Kegel mit Vorhoefen */
function sdfHerz(x, y, z) {
  var zz = 2.8 + (z - 2.8) * 1.45;
  var d = kap(x, y, zz, 3.1, 123.6, 2.8, 6.3, 119.9, 3.3, 4.5, 2.7) / 1.25;
  d = S.smin(d, ell(x, y, z, 0.2, 125.6, 1.6, 3.4, 3.0, 2.6), 2);
  return S.smin(d, ell(x, y, z, -0.6, 121.6, 3.2, 2.6, 3.6, 2.4), 1.6);
}
/* Herz aus dem Herz-Modell: Aussenform (Abtaster fuer die Herzbucht) und Netz; Position = HERZ_V. Ohne Modul: Ersatzherz, Abtaster null */
async function herzBauen(hform) {
  var HV = form.HERZ_V;
  if (!hform) {
    var ge = await netz(sdfHerz, [[-6, 108, -3], [14, 132, 10]], 0.5);
    return ge ? { geo: ge, smp: null, pos: [0, 0, 0] } : null;
  }
  var HS = hform.sdf, C2 = {};
  var G = hform.mesher.makeGrid([[-6.4, -6.6, -7.0], [6.6, 9.9, 3.7]], HH);
  var T = await hform.mesher.evalTissue(G, function (x, y, z) { HS.tissue(x, y, z, C2); return C2.outer; }, weiter(0.03, 0.2));
  if (abgebaut) return null;
  var smp = hform.assemble.makeSampler(G, T), P = hform.mesher.surfaceNets(G, T);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P.positions, 3));
  g.setIndex(new THREE.BufferAttribute(P.index, 1));
  g.computeVertexNormals();
  /* Herzschlag (Abschnitt 7f): je Eckpunkt die Bewegung des Herz-Modells (Herz-Koordinaten, vor der Verschiebung) als fuenf Morph-Ziele VR, VL, A, Ao, PT */
  var pp = g.attributes.position, nv = pp.count, MZ = [0, 1, 2, 3, 4].map(function () { return new Float32Array(nv * 3); }), i, j, m;
  for (i = 0; i < nv; i++) {
    m = hform.assemble.motionSimple(pp.getX(i), pp.getY(i), pp.getZ(i));
    for (j = 0; j < 5; j++) { MZ[j][i * 3] = m[j * 3]; MZ[j][i * 3 + 1] = m[j * 3 + 1]; MZ[j][i * 3 + 2] = m[j * 3 + 2]; }
  }
  g.morphAttributes.position = MZ.map(function (a) { return new THREE.BufferAttribute(a, 3); });
  g.morphTargetsRelative = true;
  return { geo: g, smp: smp, pos: HV, morph: true };
}

/* Zwerchfell: eine zusammenhaengende Kuppelflaeche aus form.kuppel (rechts hoeher), knapp unter der Lungenbasis. Der Rand liegt dort, wo die Flaeche auf Hoehe
   des Rands (form.kuppelRand: hinten/seitlich tief im Recessus, vorn am Rippenbogen) ausstreicht; die Sehnenplatte (Centrum tendineum) in der Mitte ist nur heller gefaerbt, nicht tiefer. Polargitter: Winkel mal
   Anteil des Wegs von der Mitte zum Rand, Ellipse der Brustwand. */
function zwerchfellGeo() {
  var NA = 72, NR = 20, a, j, f;
  var hoehe = form.kuppel;
  var sehne = function (x, z) { var u = Math.sqrt(Math.pow(x / 5.5, 2) + Math.pow((z - 0.6) / 5.5, 2)); return 1 - Math.min(1, Math.max(0, (u - 0.7) / 0.5)); };   /* 1 in der Mitte, 0 aussen */
  var cm = srgb(0xA85A58), cs = srgb(0xDDB4A4);
  var pos = [], col = [], idx = [];
  for (a = 0; a < NA; a++) {
    var w = a / NA * 2 * PI, ca = 17 * Math.cos(w), sa = 11 * Math.sin(w), fe = 0.05;
    for (f = 1; f > 0.05; f -= 0.005) { var x0 = f * ca, z0 = 0.6 + f * sa; if (hoehe(x0, z0) >= form.kuppelRand(x0, z0)) { fe = f; break; } }   /* aeusserster Punkt ueber dem Rand */
    for (j = 0; j <= NR; j++) {
      var fj = fe * j / NR, x = fj * ca, z = 0.6 + fj * sa, t = sehne(x, z), y = hoehe(x, z);
      pos.push(x, y, z);
      col.push(cm.r + (cs.r - cm.r) * t, cm.g + (cs.g - cm.g) * t, cm.b + (cs.b - cm.b) * t);
    }
  }
  for (a = 0; a < NA; a++) for (j = 0; j < NR; j++) {
    var a1 = (a + 1) % NA, p0 = a * (NR + 1) + j, p1 = a1 * (NR + 1) + j, p2 = p0 + 1, p3 = p1 + 1;
    idx.push(p0, p1, p2, p1, p3, p2);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* Brustkorb: Rippen (RIPPEN[s][i] = Stuetzpunkte, bei Atmung pro Bild neu zu setzen), Knorpel, Brustbein, Wirbelsaeule */
var RIPPEN = { '-1': [], '1': [] };      /* Stuetzpunkte je Rippe i (0..11) und Seite s */
var RIPPE_MESH = { '-1': [], '1': [] };  /* Mesh je Rippe */
var BAENDER = { '-1': [], '1': [] };     /* Zwischenrippenbaender i = 0..10 (zwischen Rippe i und i + 1) */
var KNORPEL = [];                        /* Rippenknorpel: { m, sd, i, e (Ende der Rippe), ziel (Ziel des Knorpels) } fuer die Atmung */
var BAND_PUNKTE = 16;                    /* Stuetzpunkte je Rippe (rippeStuetz: 15 Abschnitte) */
/* Band zwischen Rippe i und i + 1 neu aus den Stuetzpunkten der beiden Rippen legen (untere Kante der oberen, obere Kante der unteren Rippe);
   R = Stuetzpunkte der Rippen (Standard: Ruhelage RIPPEN, bei der Atmung die gedrehten Rippen) */
function baenderSetzen(s, i, R) {
  R = R || RIPPEN;
  var m = BAENDER[s][i], A = R[s][i], B = R[s][i + 1], p = m.geometry.attributes.position, k, r = form.RIP_R * 0.85;
  for (k = 0; k < BAND_PUNKTE; k++) {
    p.setXYZ(k * 2, A[k][0], A[k][1] - r, A[k][2]);
    p.setXYZ(k * 2 + 1, B[k][0], B[k][1] + r, B[k][2]);
  }
  p.needsUpdate = true;
  m.geometry.computeVertexNormals();
  m.geometry.computeBoundingSphere();
}
function baenderGeo() {
  var g = new THREE.BufferGeometry(), idx = [], k;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BAND_PUNKTE * 2 * 3), 3));
  for (k = 0; k < BAND_PUNKTE - 1; k++) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 2, k * 2 + 1, k * 2 + 3);
  g.setIndex(idx);
  return g;
}
function brustkorbBauen(lg) {
  var RR = form.RIP_R, i, s;
  [-1, 1].forEach(function (sd) {
    for (i = 0; i < 12; i++) {
      var pts = form.rippeStuetz(i, sd, lg[sd], null);
      RIPPEN[sd][i] = pts;
      var g = rohre([{ pts: pts, r0: RR, r1: RR, seiten: 8, segmente: 48 }]);
      RIPPE_MESH[sd][i] = addMesh('rippen', g, MAT.rippen, 'Rippe ' + (i + 1) + (sd < 0 ? ' rechts' : ' links'), 2);
      tris.brustkorb += anz(g);
    }
    /* Knorpel: Rippe 1-7 zum Brustbein, 8-10 zur Rippe darueber (Rippenbogen) */
    for (i = 0; i < 10; i++) {
      var e = RIPPEN[sd][i][BAND_PUNKTE - 1], ziel = i < 7 ? [sd * 1.2, form.RIP_YA[i], form.zSternum(form.RIP_YA[i]) - 0.1] : RIPPEN[sd][i - 1][BAND_PUNKTE - 1];
      var gk = rohre([{ pts: [e, ziel], r0: 0.45, r1: 0.45, seiten: 8, segmente: 8 }]);
      var mk = addMesh('rippen', gk, MAT.knorpel, 'Rippenknorpel ' + (i + 1) + (sd < 0 ? ' rechts' : ' links'), 2); tris.brustkorb += anz(gk);
      KNORPEL.push({ m: mk, sd: sd, i: i, e: e, ziel: ziel });
    }
  });
  /* Zwischenrippenmuskeln: Baender zwischen Rippe i und i + 1 */
  [-1, 1].forEach(function (sd) {
    for (i = 0; i < 11; i++) {
      var gb = baenderGeo();
      BAENDER[sd][i] = addMesh('zwischenrippen', gb, MAT.zwischenrippen, 'Zwischenrippenmuskel ' + (i + 1) + (sd < 0 ? ' rechts' : ' links'), 4);
      baenderSetzen(sd, i);
      tris.brustkorb += anz(gb);
    }
  });
  /* Brustbein: Griff (oben ca. 4,5 cm breit, Drosselgrube bei y = 143), Koerper (ca. 2,8 cm), schmaler Schwertfortsatz (Ende ca. y = 121), flach (ca. 1 cm) */
  var tilt = Math.atan((form.zSternum(125) - form.zSternum(143)) / 18);
  var sh = new THREE.Shape();
  [[-2.2, 0], [2.2, 0], [2.0, -4.4], [1.35, -5.6], [1.4, -18.6], [0.55, -19.8], [0.5, -22.8], [-0.5, -22.8], [-0.55, -19.8], [-1.4, -18.6], [-1.35, -5.6], [-2.0, -4.4]].forEach(function (q, k) {
    if (k) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]);
  });
  var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.15, bevelSegments: 2 });
  sg.translate(0, 0, -0.3);
  var so = addMesh('brustbein', sg, MAT.brustbein, 'Brustbein', 2); so.position.set(0, 143, form.zSternum(143)); so.rotation.x = -tilt;
  tris.brustkorb += anz(sg);
  /* Wirbelsaeule: nur eine dunkle Andeutung hinter den Rippen */
  var wl = [];
  for (var y = 146; y >= 108; y -= 2.1) {
    var wg = new THREE.CylinderGeometry(1.45, 1.45, 1.7, 14, 1); wg.translate(0, y, form.zst(y)); wl.push(wg);
  }
  var wgeo = zusammen(wl);
  addMesh(null, wgeo, MAT.wirbel, 'Wirbelsaeule (Andeutung)', 2); tris.brustkorb += anz(wgeo);
}

/* Luftroehre mit Knorpelspangen (ca. 14 Ringe, hinten offen), Hauptbronchien */
function luftroehreBauen() {
  var T = form.TRACHEA, g = rohre([{ pts: T, r0: 1.0, r1: 1.0, seiten: 20, segmente: 24 }]);
  addMesh('luftroehre', g, MAT.luftroehre, 'Luftröhre', 2); tris.atemwege += anz(g);
  var kurve = new THREE.CatmullRomCurve3(T.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5), ringe = [], n = 14, k;
  for (k = 0; k < n; k++) {
    var t = 0.05 + k * 0.9 / (n - 1), c = kurve.getPointAt(t), tg = kurve.getTangentAt(t);
    var rg = new THREE.TorusGeometry(1.06, 0.15, 8, 22, 1.7 * PI);
    rg.rotateZ(PI / 2 - 1.85 * PI); rg.rotateX(-PI / 2);      /* Luecke nach hinten (-z) */
    rg.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), tg)));
    rg.translate(c.x, c.y, c.z);
    ringe.push(rg);
  }
  var rgeo = zusammen(ringe);
  addMesh('luftroehre', rgeo, MAT.spangen, 'Knorpelspangen', 2); tris.atemwege += anz(rgeo);
  var haupt = [-1, 1].map(function (s) { return { pts: form.hauptbronchus(s), r0: s < 0 ? 0.8 : 0.68, r1: s < 0 ? 0.62 : 0.54, seiten: 14, segmente: 14 }; });
  var hg = rohre(haupt);
  addMesh('hauptbronchien', hg, MAT.hauptbronchien, 'Hauptbronchien', 2); tris.atemwege += anz(hg);
}

/* Anschluss der Lungengefaesse am Herz-Modell (Koerper-Koordinaten): die Lungenarterien beginnen am Ende des sichtbaren Lungenstamms (letzter sichtbarer Punkt der Wege
   lungeLinks/lungeRechts vor dem unsichtbaren Teil), die Lungenvenen an den Muendungen der vier Venenstuempfe (Anfang des sichtbaren Rueckwegs: A.LSPV/A.LIPV/A.RSPV/A.RIPV).
   p = Anschlusspunkt, ext = 0,5 cm weiter im Stumpf (die Rohre ueberlappen so den Stumpf, auch wenn sich das Herz bewegt). Ohne Herz-Modell null. */
function herzAnschluss(hform) {
  if (!hform || !hform.extras || !hform.extras.wkPaths || !hform.extras.venen) return null;
  var HV = form.HERZ_V, wk = hform.extras.wkPaths(), ve = hform.extras.venen();
  var wp = function (q) { return [q[0] + HV[0], q[1] + HV[1], q[2] + HV[2]]; };
  var mit = function (q, a, r) {   /* Punkt q (Herz-Koordinaten) plus Rueckverlaengerung um r cm entgegen der Richtung a -> q */
    var d = [q[0] - a[0], q[1] - a[1], q[2] - a[2]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1;
    return { p: wp(q), ext: wp([q[0] - d[0] / l * r, q[1] - d[1] / l * r, q[2] - d[2] / l * r]), h: q.slice(), h0: a.slice() };
  };
  var arterie = function (w) { var hi = w.seg.findIndex(function (sg) { return !sg.vis; }); return mit(w.pts[hi], w.pts[hi - 1], 0.5); };
  var vene = function (T) { return mit(T[1], T[0], 0.5); };
  return { wk: wk, paL: arterie(wk.lungeLinks), paR: arterie(wk.lungeRechts),
    mund: { '1': [vene(ve.LSPV), vene(ve.LIPV)], '-1': [vene(ve.RSPV), vene(ve.RIPV)] } };
}
/* Gefaesse: Lungenarterien (blau) und -venen (rot) bis in die Lappen, entlang der Lappenbronchien (aeste = Bronchialbaum der Form). an = Anschluss am Herzen (herzAnschluss) oder null.
   Rueckgabe auch die Wege der Blutportionen je Lappen (routen, Abschnitt 7f): Lungenarterie -> Lappen -> Lungenvene, aus denselben Linien wie die Rohre. */
function gefaesseBauen(aeste, an) {
  var art = [], ven = [], routen = {}, wurzelA = {}, wurzelV = {};
  var offA = [0, 0.85, 0.55], offV = [0, -0.9, 0.5];
  var versch = function (pts, o, f) { return pts.map(function (p) { return [p[0] + o[0] * f, p[1] + o[1] * f, p[2] + o[2] * f]; }); };
  /* Mit Herz-Modell: die Arterien beginnen am Lungenstamm des Herzens, die Venen an seinen Venenmuendungen; die Rohre laufen vor und ueber (Arterien) bzw. hinter und unter (Venen)
     den Hauptbronchien zum Hilus. Ohne Herz-Modell (Ersatzherz): Truncus pulmonalis vorn ueber dem Herzen, teilt sich unter dem Aortenbogen; die Venen muenden hinten in den linken Vorhof. */
  var rpaEnde = [-5.0, 126.8, -1.0], lpaEnde = [6.2, 127.6, -1.4];
  var venEnde = { oben: { '-1': [-5.8, 122.2, -1.8], '1': [6.8, 122.0, -1.8] }, unten: { '-1': [-5.6, 120.4, -2.2], '1': [6.6, 119.8, -2.4] } };
  if (an) {
    wurzelA['-1'] = [an.paR.p, [-3.7, 127.1, -1.1], rpaEnde]; wurzelA['1'] = [an.paL.p, [7.0, 127.6, -0.5], lpaEnde];
    art.push({ pts: [an.paR.ext].concat(wurzelA['-1']), r0: 0.82, r1: 0.62, segmente: 20 });                                    // rechte Lungenarterie
    art.push({ pts: [an.paL.ext].concat(wurzelA['1']), r0: 0.85, r1: 0.62, segmente: 20 });                                     // linke Lungenarterie
    wurzelV['-1'] = [[an.mund['-1'][0].p, [-2.0, 124.6, -2.2], venEnde.oben['-1']], [an.mund['-1'][1].p, [-2.0, 122.8, -2.3], venEnde.unten['-1']]];
    wurzelV['1'] = [[an.mund['1'][0].p, [7.4, 124.2, -1.3], venEnde.oben['1']], [an.mund['1'][1].p, [7.4, 122.0, -1.9], venEnde.unten['1']]];
    [-1, 1].forEach(function (sd) { [0, 1].forEach(function (k) { ven.push({ pts: [an.mund[sd][k].ext].concat(wurzelV[sd][k]), r0: 0.6, r1: 0.55, segmente: 20 }); }); });   // rechte, dann linke Lungenvenen (oben, unten)
  } else {
    art.push({ pts: [[1.8, 124.8, 3.4], [1.7, 127.8, 2.4], [1.0, 129.2, 0.4]], r0: 0.95, r1: 0.88, segmente: 16 });                // Truncus pulmonalis
    art.push({ pts: [[1.0, 129.2, 0.4], [-2.4, 129.0, -0.6], rpaEnde], r0: 0.85, r1: 0.62 });                                   // rechte Lungenarterie
    art.push({ pts: [[1.0, 129.2, 0.4], [3.6, 129.6, -0.8], lpaEnde], r0: 0.85, r1: 0.62 });                                    // linke Lungenarterie
    ven.push({ pts: [[1.0, 124.0, -2.2], [-2.2, 123.2, -2.3], venEnde.oben['-1']], r0: 0.62, r1: 0.55 });                        // rechte Lungenvenen
    ven.push({ pts: [[1.0, 122.6, -2.2], [-2.2, 121.8, -2.4], venEnde.unten['-1']], r0: 0.62, r1: 0.55 });
    ven.push({ pts: [[1.0, 124.0, -2.2], [3.6, 123.0, -2.3], venEnde.oben['1']], r0: 0.62, r1: 0.55 });                          // linke Lungenvenen
    ven.push({ pts: [[1.0, 122.6, -2.2], [3.6, 121.2, -2.4], venEnde.unten['1']], r0: 0.62, r1: 0.55 });
  }
  LAPPEN.forEach(function (id) {
    var seite = id.slice(-1) === 'L' ? 1 : -1, a = aeste.filter(function (x) { return x.lappen === id && x.gen === 0; })[0];
    var g1 = aeste.filter(function (x) { return x.lappen === id && x.gen === 1; });
    var unten = id === 'unterlappenR' || id === 'unterlappenL', ae = seite < 0 ? rpaEnde : lpaEnde, ve = unten ? venEnde.unten[seite] : venEnde.oben[seite];
    var drin = function (pts, o, r) {   /* neben dem Bronchus, soweit der Lappen reicht: Versatz je Punkt verkleinern, bis das Gefaess im Lappen liegt */
      return pts.map(function (p) {
        for (var f = 1; f > 0.05; f -= 0.15) { var q = [p[0] + o[0] * f, p[1] + o[1] * f, p[2] + o[2] * f]; if (LAP[id](q[0], q[1], q[2]) < -(r + 0.1)) return q; }
        return p;
      });
    };
    var artL = [ae].concat(drin(a.pts.slice(1), offA, 0.5)), venL = [ve].concat(drin(a.pts.slice(1), offV, 0.45));
    art.push({ pts: artL, r0: 0.5, r1: 0.3 });
    ven.push({ pts: venL, r0: 0.45, r1: 0.28 });
    if (an) routen[id] = { seite: seite, mund: unten ? 1 : 0, teile: [{ pts: wurzelA[seite] }, { pts: artL }, { pts: [artL[artL.length - 1], venL[venL.length - 1]], gerade: true }, { pts: venL, rev: true }, { pts: wurzelV[seite][unten ? 1 : 0], rev: true }] };
    var innen = function (pts, r) { return pts.every(function (p) { return LAP[id](p[0], p[1], p[2]) < -(r + 0.15); }); };   /* Aeste bleiben im Lappen */
    g1.slice(0, 3).filter(function (b) { return innen(versch(b.pts, offA, 0.8), 0.3); }).slice(0, 2).forEach(function (b) { art.push({ pts: versch(b.pts, offA, 0.8), r0: 0.3, r1: 0.16 }); });
    g1.slice(0, 3).filter(function (b) { return innen(versch(b.pts, offV, 0.8), 0.28); }).slice(0, 1).forEach(function (b) { ven.push({ pts: versch(b.pts, offV, 0.8), r0: 0.28, r1: 0.14 }); });
  });
  var ga = rohre(art), gv = rohre(ven);
  addMesh('lungenarterien', ga, MAT.lungenarterien, 'Lungenarterien', 2); addMesh('lungenvenen', gv, MAT.lungenvenen, 'Lungenvenen', 2);
  tris.gefaesse += anz(ga) + anz(gv);
  return { arterie: art, vene: ven, routen: an ? routen : null };
}

/* Aufbau: Herz -> Lappen -> Rippenfell -> Atemwege -> Gefaesse -> Zwerchfell -> Brustkorb (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
var LAP = {}, LH = null, GEF = null, BAUM = null, KAND = {}, KAND3 = {}, VIS = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
async function bauen() {
  await setLoad(0.02, 'Herz wird geformt'); if (abgebaut) return;
  var hform = await herzP; if (abgebaut) return;
  var hz = await herzBauen(hform); if (abgebaut || !hz) return;
  LH = hz.smp ? { smp: hz.smp, v: form.HERZ_V } : null;   /* Herzbucht nach dem Herzen; ohne Herz-Modell die Ersatz-Herzbucht der Form */
  var hm = addMesh('herz', hz.geo, MAT.herz, 'Herz (Lage)', 3); hm.position.set(hz.pos[0], hz.pos[1], hz.pos[2]); tris.herz = anz(hz.geo);
  if (hz.morph) { MAT.herz.morphTargets = true; MAT.herz.needsUpdate = true; hm.updateMorphTargets(); HZ.mesh = hm; HZ.hform = hform; }   /* das Herz schlaegt (Abschnitt 7f); ohne Herz-Modell (Ersatzherz) gibt es keinen Schlag */
  await setLoad(0.2, 'Lungenlappen'); if (abgebaut) return;
  var alle = form.lappen(-1, LH, RUND).concat(form.lappen(1, LH, RUND)), n = 0;
  for (var i = 0; i < alle.length; i++) {
    var l = alle[i];
    LAP[l.id] = l.sdf;
    var g = await netz(l.sdf, l.grenzen, HL, weiter(0.2 + 0.32 * i / alle.length, 0.2 + 0.32 * (i + 1) / alle.length)); if (abgebaut) return;
    addMesh(l.id, g, MAT[l.id], STRUCT[l.id].de, 1); tris.lappen += anz(g);
  }
  await setLoad(0.54, 'Rippenfell'); if (abgebaut) return;
  var lg = {};
  for (var si = 0; si < 2; si++) {
    var s = si ? 1 : -1, f = form.fluegel(s, LH, RUND), gb = form.grenzen(s);
    lg[s] = f;
    var pg = await netz(function (x, y, z) { return f(x, y, z) - 0.45; }, [[gb[0][0] - 0.7, gb[0][1] - 0.7, gb[0][2] - 0.7], [gb[1][0] + 0.7, gb[1][1] + 0.7, gb[1][2] + 0.7]], HP, weiter(0.54 + 0.1 * si, 0.64 + 0.1 * si)); if (abgebaut) return;
    addMesh('pleura', pg, MAT.pleura, 'Rippenfell ' + (s < 0 ? 'rechts' : 'links'), 4); tris.pleura += anz(pg);
  }
  await setLoad(0.76, 'Atemwege'); if (abgebaut) return;
  luftroehreBauen();
  BAUM = form.bronchien(LH, RUND);
  var bg = rohre(BAUM.map(function (a) { return { pts: a.pts, r0: a.r0, r1: a.r1 }; }), true);
  addMesh('bronchien', bg, MAT.bronchien, 'Lappen- und Segmentbronchien', 2); tris.atemwege += anz(bg);
  await setLoad(0.82, 'Gefäße'); if (abgebaut) return;
  HZ.an = HZ.hform ? herzAnschluss(HZ.hform) : null;
  GEF = gefaesseBauen(BAUM, HZ.an);
  await setLoad(0.86, 'Zwerchfell'); if (abgebaut) return;
  var zg = zwerchfellGeo();
  addMesh('zwerchfell', zg, MAT.zwerchfell, 'Zwerchfell', 2); tris.brustkorb += anz(zg);
  await setLoad(0.9, 'Brustkorb'); if (abgebaut) return;
  brustkorbBauen(lg);
  await setLoad(0.96, 'Beschriftung'); if (abgebaut) return;
  ankerBerechnen();
  atmungVorbereiten();
  kreislaufVorbereiten();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var rippenW = 'voll', muskelW = 'voll';   /* Schalter im Reiter Atmung: Rippen (voll | kontur | aus), Zwischenrippenmuskeln (voll | aus); wirken auch im 3D-Modell */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, brustAn = true, seeCam = false, brustHand = false, lv = 0;   /* lv: Version fuer die Beschriftung; seeCam: Durchsicht kommt vom Ausschnitt Bronchialbaum; brustHand: der Knopf Brustkorb wurde bedient (dann schaltet kein Ausschnitt ihn mehr) */
ORDER.forEach(function (s) { enabled[s.id] = true; });

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (Luftwege) */
function weichMat(o) { return o.material.transparent && !o.material.userData.dicht; }
/* Struktur der Atmung: nicht durch die Schalter Rippen/Zwischenrippenmuskeln ausgeblendet */
function sidAn(sid) { return sid === 'rippen' || sid === 'brustbein' ? rippenW !== 'aus' : sid === 'zwischenrippen' ? muskelW !== 'aus' : true; }
/* Luftteilchen (userData.teilchen = 'luft'): sichtbar, solange eine Ebene der Luftwege sichtbar ist */
function luftSichtbar() { return !!(enabled.luftroehre || enabled.hauptbronchien || enabled.bronchien); }
function applyVisibility() {
  root.traverse(function (o) {
    if (!o.isMesh) return;
    var sid = o.userData.sid;
    o.visible = o.userData.teilchen === 'blut' ? (enabled.herz || enabled.lungenarterien || enabled.lungenvenen) : o.userData.teilchen ? luftSichtbar() : sid ? (enabled[sid] && sidAn(sid)) : brustAn;   /* ohne Struktur: Andeutung der Wirbelsaeule, gehoert zum Brustkorb */
  });
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
/* punkt (optional, Vector3 oder [x, y, z] im Raum der Szene wie ein Treffer beim Antippen): wo die Struktur angetippt wurde; bestimmt bei den Lappen die Stelle fuer "Alveole hier ansehen" */
function setSelected(id, punkt) {
  selected = id;
  alWahl = id && LAPPEN.indexOf(id) >= 0 ? alveoleWahl(id, punkt) : null;
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
  $('iOpen').style.display = alWahl !== null ? '' : 'none';   /* Knopf "Alveole hier ansehen" nur bei den Lungenlappen */
  box.classList.add('show');
  lupeClose();   /* die Infokarte steht an der Stelle der Lupe */
  kartenLage();
}

/* Krankheitsbilder und Medikamente (Kern.Szenarien, gemeinsame Daten mit der Alveole: Kern.Szenarien.daten.atmung): Reiter und Erklaerkarte (id kcard) unten links wie die
   Infokarte. In 3D wirkt nur die Obstruktion (Abschnitt 7c): die Segmentbronchien werden enger und die Lunge ueberblaeht; Thorax-Physik und Schema bleiben unveraendert.
   Alle anderen Eintraege zeigen nur die Karte. */
var SZ_DATEN = Kern.Szenarien.daten.atmung;
var SZW = { o: 0, trap: 0 };   /* Wirkgroessen (weich ueberblendet): o = Obstruktion, trap = 0,35 * o (Ueberblaehung, wie im Alveolen-Modell) */
var SZ = Kern.Szenarien({
  daten: SZ_DATEN, karte: 'kcard', dauer: 1.2, ausTitel: 'Krankheitsbild oder Medikament ausschalten',
  beimWechsel: function (id) {
    if (id) {                                          /* Hilfekarte, Info und Ueben weichen der Szenariokarte */
      if (quiz) quizEnd();
      if (LUPE.open) lupeClose();
      setSelected(null); closeCard();
      if (window.innerWidth <= 1000) szWeichen();      /* Handy: die Karte deckt die Lunge, sie beginnt eingeklappt (Titelzeile) */
    }
    kartenLage();
  },
  beimEinklappen: function () {
    if (SZ.offen) { if (quiz) quizEnd(); if (LUPE.open) lupeClose(); setSelected(null); closeCard(); }   /* wieder aufgeklappt: die anderen Karten weichen */
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

(function leiste() {
  /* Reiter: Strukturen, Atmung, Hilfekarten, Ueben, Krankheitsbilder, Medikamente */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneAtmung = document.createElement('div'); paneAtmung.id = 'paneAtmung'; paneAtmung.innerHTML = ATMUNG_PANE;
  var paneH = document.createElement('div'); paneH.id = 'paneHelp';
  var paneU = document.createElement('div'); paneU.id = 'paneUeben';
  var paneD = document.createElement('div'); paneD.id = 'paneDis';
  var paneM = document.createElement('div'); paneM.id = 'paneMed';
  var panes = [rail, paneAtmung, paneH, paneU, paneD, paneM];
  ['Strukturen', 'Atmung', 'Hilfekarten', '\u00dcben', 'Krankheitsbilder', 'Medikamente'].forEach(function (name, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  $('rail').appendChild(tabs);
  panes.forEach(function (pn, k) { if (k) pn.style.display = 'none'; $('rail').appendChild(pn); });
  /* Krankheitsbilder, Medikamente */
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', 'W\u00e4hle ein Krankheitsbild \u2013 bei Asthma und COPD verengen sich die Bronchien und die Lunge bl\u00e4ht sich auf.');
  SZ.liste(paneM, 'drug', 'Medikamente', 'W\u00e4hle ein Medikament \u2013 es wirkt an dem genannten Krankheitsbild.');
  /* Hilfekarten: die sieben Karten des Thorax-Modells, die Karte "Kleiner Kreislauf" und "Probier das aus" (Muster wie bei der Niere) */
  var ih = document.createElement('p'); ih.className = 'dis-intro'; ih.textContent = 'Kurz erkl\u00e4rt \u2013 tippe eine Karte an, sie erscheint unten.'; paneH.appendChild(ih);
  KARTEN_LISTE.concat([['probier', 'Probier das aus']]).forEach(function (c) {
    var d = document.createElement('div'); d.className = 'dis'; d.tabIndex = 0; d.dataset.card = c[0];
    d.innerHTML = '<span><b></b></span>'; d.querySelector('b').textContent = c[1];
    d.addEventListener('click', function () { openHelp(c[0]); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter') openHelp(c[0]); });
    paneH.appendChild(d);
  });
  /* Ueben: Strukturen finden */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur an der Lunge und tippe sie an. Die Beschriftung verschwindet solange.'; paneU.appendChild(iu);
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
      row.innerHTML = '<span class="sw" style="background:#' + hex(s.col) + '"></span><span class="nm"><b></b><i></i></span>';
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

/* Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Inhalt als HTML (die Hilfekarten bringen ihr HTML aus dem Thorax-Modell mit); unten links wie die Infokarte */
function showCard(kick, title, html, istQuiz) {
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  $('sLead').innerHTML = html;
  $('sAfter').innerHTML = '';
  $('sQa').style.display = istQuiz ? 'flex' : 'none';
  if (selected && !istQuiz) setSelected(null);
  lupeClose();   /* die Erklaerkarte steht an der Stelle der Lupe */
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
  var k = key === 'probier' ? { t: 'Probier das aus', u: 'Hilfekarte', h: PROBIER } : karten[key]; if (!k) return;
  if (quiz) quizEnd();
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.toggle('on', d.dataset.card === key); });
  showCard(k.u, k.t, k.h, false);
}
/* Ueben: "Tippe auf: ..." - nur Strukturen, die in der aktuellen Ansicht sichtbar sind (die Bronchien liegen in den Lappen: nur bei Durchsicht) */
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait } */
function quizPool() {
  return ORDER.filter(function (s) { return s.meshes.length && enabled[s.id] && sidAn(s.id) && (brustAn || BRUST.indexOf(s.id) < 0) && (s.id !== 'bronchien' || seeThrough); }).map(function (s) { return s.id; });
}
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  showCard('\u00dcben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe die Lunge, wenn du die Struktur nicht gleich siehst.', true);
  $('sScore').textContent = quiz.ok + ' von ' + quiz.n + ' richtig';
}
function quizStart() {
  setSelected(null); closeCard();
  if (schemaOn) setSchema(false);   /* das Schema verdeckt die 3D-Ansicht */
  quiz = { n: 0, ok: 0, target: null, last: null, wait: false };
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

function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  applyLook();
  lv++;
  if (quiz) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); }   /* andere Ansicht: neue Aufgabe aus den jetzt sichtbaren Strukturen */
}
$('bSee').onclick = function () { seeCam = false; durchsicht(!seeThrough); };
/* Brustkorb ein/aus: gleicht die Schalter Rippen und Zwischenrippenmuskeln im Reiter Atmung ab (aus = beide aus; an = beide sichtbar, ein Schalter auf
   "durchsichtig" bleibt); die Schalter wirken ueber ihre Knoepfe, damit auch das Schema folgt */
function brust(an) {
  var wahl = function (g, w) { var b = $('paneAtmung').querySelector('[data-' + g + '="' + w + '"]'); if (b) b.click(); };
  if (an) { if (rippenW === 'aus') wahl('rippen', 'voll'); if (muskelW === 'aus') wahl('muskel', 'voll'); }
  else { wahl('rippen', 'aus'); wahl('muskel', 'aus'); }
  brustAn = an;
  $('bBrust').classList.toggle('on', an);
  applyVisibility();
}
$('bBrust').onclick = function () { brustHand = true; brust(!brustAn); };
$('bCls').onclick = function () { setSelected(null); };
$('bLab').onclick = function () {
  showLabels = !showLabels;
  this.classList.toggle('on', showLabels);
  $('labels').style.display = showLabels ? '' : 'none';
  $('leaders').style.display = showLabels ? '' : 'none';
  lv++;
};

/* =====================================================================
   4. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
var K3 = function (x, y, z) { return V(x - M[0], y - M[1], z - M[2]); };   /* Koerper-Koordinaten -> Modell */
/* ext = Breite und Hoehe (cm), die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite (cm), die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: 0, phi: PI / 2, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Bronchialbaum', theta: 0, phi: PI / 2, target: K3(0, 126, 0), ext: [32, 44], halb: 16.5 },
  { name: 'Hilus und Gefäße', theta: 0, phi: 1.2, target: K3(0, 125, 0), ext: [28, 24], halb: 14.5 },
  { name: 'Zwerchfell und Pleura', theta: -PI / 2, phi: 1.85, target: K3(-3, 120, 0), ext: [28, 42], halb: 14.5 }
];
var view = { theta: 0, phi: PI / 2, dist: 70, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 5, maxDist: 160 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer Lunge und Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  /* Bronchialbaum, Hilus: die Lappen werden durchsichtig; beim Verlassen wieder undurchsichtig, wenn der Knopf nicht selbst bedient wurde */
  if ((i === 1 || i === 2) && !seeThrough) { seeCam = true; durchsicht(true); }
  else if (i !== 1 && i !== 2 && seeCam) { seeCam = false; durchsicht(false); }
  VIS = {};
  if (!brustHand) brust(i === 0);   /* die Ausschnitte 1 bis 3 zeigen das Innere: der Brustkorb ist ausgeblendet, solange man den Knopf nicht selbst bedient hat */
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Rippenfell, Zwischenrippenmuskeln, Herz, Lappen bei Durchsicht) zaehlen nur,
   wenn dahinter nichts Dichteres getroffen wird */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function canvasKlick(e) {
  if (orbit.dragged) return;
  var r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, punkt = null, weichPunkt = null, durch = [];
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    durch.push(sid);   /* Strukturen auf dem Strahl bis zum ersten undurchsichtigen Treffer (fuer das Ueben) */
    if (weichMat(o)) { if (!weich) { weich = sid; weichPunkt = hits[i].point; } }
    else { treffer = sid; punkt = hits[i].point; }
  }
  if (quiz) { quizAntwort(treffer || weich || null, durch); return; }
  setSelected(treffer || weich || null, treffer ? punkt : weichPunkt);
}
canvas.addEventListener('click', canvasKlick);

/* =====================================================================
   5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Punkt auf der Oberflaeche eines Lappens/Rippenfells: von aussen (vorn bzw. rechts) entlang z (bzw. x) bis ins Innere */
function vorn(sdf, x, y, fallback) {
  for (var z = 14; z > -14; z -= 0.1) if (sdf(x, y, z) < 0) return [x, y, z];
  return fallback;
}
function rechts(sdf, y, z, fallback) {
  for (var x = -22; x < 0; x += 0.1) if (sdf(x, y, z) < 0) return [x, y, z];
  return fallback;
}
/* Kandidaten fuer den Ankerpunkt je Struktur (Raum der Szene); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren */
function ankerBerechnen() {
  var P = function (a) { return K3(a[0], a[1], a[2]); };
  var liste = function (arr) { return arr.filter(Boolean).map(P); };
  var ast = function (lap, gen) { return BAUM.filter(function (x) { return x.lappen === lap && x.gen === gen; }); };
  var fl = form.fluegel(-1, LH, RUND), pl = function (x, y, z) { return fl(x, y, z) - 0.45; };
  var herzS = LH ? function (x, y, z) { return LH.smp.val(x - LH.v[0], y - LH.v[1], z - LH.v[2]); } : sdfHerz;
  var rb = RIPPEN['-1'], rl = RIPPEN['1'];
  var bandMitte = function (s, i, k) { var q = BAENDER[s][i].geometry.attributes.position; return [(q.getX(k * 2) + q.getX(k * 2 + 1)) / 2, (q.getY(k * 2) + q.getY(k * 2 + 1)) / 2, (q.getZ(k * 2) + q.getZ(k * 2 + 1)) / 2]; };
  var dom = function (x, z) { return [x, form.kuppel(x, z), z]; };
  var vornPunkte = function (sdf, xs, ys) { var r = []; ys.forEach(function (y) { xs.forEach(function (x) { r.push(vorn(sdf, x, y, null)); }); }); return r; };
  var seitePunkte = function (sdf, yz) { return yz.map(function (q) { return rechts(sdf, q[0], q[1], null); }); };
  var mp = function (a) { return a.pts[1]; };
  var aeste = function (lap, gen) { return ast(lap, gen).map(mp); };
  KAND.luftroehre = liste([[0, 147, -0.4], [0, 141, -0.4], [0, 134, -1.2]]);
  KAND.hauptbronchien = liste([[-4.0, 125.0, -2.0], [4.6, 125.4, -2.2], [-2.0, 127.4, -2.4]]);
  KAND.bronchien = liste([].concat(aeste('oberlappenR', 1), aeste('unterlappenR', 1), aeste('mittellappen', 1), aeste('oberlappenR', 2), aeste('oberlappenL', 1), aeste('unterlappenL', 1)));
  KAND.oberlappenR = liste(vornPunkte(LAP.oberlappenR, [-8, -6, -10], [139, 136, 133]));
  KAND.mittellappen = liste(vornPunkte(LAP.mittellappen, [-8.5, -7, -10], [124.5, 122, 127]));
  KAND.unterlappenR = liste(vornPunkte(LAP.unterlappenR, [-9, -7, -11], [114, 112, 118, 110]));
  KAND.oberlappenL = liste(vornPunkte(LAP.oberlappenL, [8.5, 6.5, 10], [137, 134, 131]));
  KAND.unterlappenL = liste(vornPunkte(LAP.unterlappenL, [9, 7, 11], [114, 112, 118, 110]));
  KAND.pleura = liste(vornPunkte(pl, [-12.2, -11], [121, 126, 114]));
  KAND.zwerchfell = liste([dom(-8, 3), dom(8, 3), dom(-2.5, 7), dom(3, 6), dom(-9, -2)]);
  KAND.zwischenrippen = liste([bandMitte(-1, 3, 11), bandMitte(1, 3, 11), bandMitte(-1, 5, 12), bandMitte(1, 5, 12), bandMitte(-1, 7, 10)]);
  KAND.rippen = liste([rb[5][13], rl[5][13], rb[3][12], rl[3][12], rb[7][10]]);
  KAND.brustbein = liste([[0, 134, form.zSternum(134) + 0.5], [0, 128, form.zSternum(128) + 0.5]]);
  KAND.lungenarterien = liste(GEF.arterie.slice(0, 3).map(mp).concat([GEF.arterie[0].pts[2]]));
  KAND.lungenvenen = liste(GEF.vene.slice(0, 4).map(mp));
  KAND.herz = liste([vorn(herzS, 3, 122, null), vorn(herzS, 4, 119, null), vorn(herzS, 2, 125, null)]);
  /* Ausschnitt Zwerchfell und Pleura (Blick von rechts): Punkte auf der rechten Seite */
  KAND3.pleura = liste(seitePunkte(pl, [[121, -1], [116, -2], [126, 0]]));
  KAND3.unterlappenR = liste(seitePunkte(LAP.unterlappenR, [[114, -3], [118, -3], [112, -4]]));
  KAND3.oberlappenR = liste(seitePunkte(LAP.oberlappenR, [[138, 0], [134, -1]]));
  KAND3.mittellappen = liste(seitePunkte(LAP.mittellappen, [[125, 3], [123, 4]]));
  KAND3.zwerchfell = liste([[-9, dom(-9, 0.5)[1], 0.5], dom(-6, -3), dom(-4, 5)]);
  KAND3.rippen = liste([rb[7][8], rb[9][8], rb[5][8]]);
  KAND3.zwischenrippen = liste([bandMitte(-1, 7, 8), bandMitte(-1, 5, 8), bandMitte(-1, 9, 8)]);
}
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, vor dem kein undurchsichtiges
   Netz einer anderen Struktur liegt; sonst keine Beschriftung. Waehrend der Bewegung bleibt die letzte Wahl. */
var sKey = '', sT = 0, sOk = true, sichtVer = 0;
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
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, brustAn, rippenW, muskelW].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  LISTEN[aktiv].forEach(function (id) {
    if (!enabled[id]) return;
    var c = (aktiv === 3 && KAND3[id]) || KAND[id] || [], i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { bronchien: 'Segmentbronchien', pleura: 'Rippenfell' };   /* kürzere Namen und lateinische Namen, damit die Beschriftung in die Spalte passt */
var LATKURZ = { bronchien: 'Bronchi lobares et segmentales', lungenarterien: 'Arteriae pulmonales', pleura: 'Pleura parietalis' };
var HANDYNAME = {
  bronchien: 'Bronchien', oberlappenR: 'Oberlappen re.', unterlappenR: 'Unterlappen re.', oberlappenL: 'Oberlappen li.', unterlappenL: 'Unterlappen li.',
  pleura: 'Rippenfell', zwischenrippen: 'Zwischenrippen', lungenarterien: 'Lungenarterien', lungenvenen: 'Lungenvenen', hauptbronchien: 'Hauptbronchien'
};   /* kürzere Namen, wo die Spalte auf dem Handy schmal ist */
var HANDY_GROSS = ['luftroehre', 'oberlappenR', 'mittellappen', 'unterlappenR', 'oberlappenL', 'unterlappenL', 'herz', 'zwerchfell'];   /* Handy, Uebersicht: nur diese werden beschriftet */
/* je Ausschnitt: Strukturen in der Beschriftung */
var LISTEN = [
  ['luftroehre', 'hauptbronchien', 'bronchien', 'oberlappenR', 'mittellappen', 'unterlappenR', 'oberlappenL', 'unterlappenL', 'pleura', 'zwerchfell', 'zwischenrippen', 'rippen', 'brustbein', 'lungenarterien', 'lungenvenen', 'herz'],
  ['luftroehre', 'hauptbronchien', 'bronchien', 'oberlappenR', 'mittellappen', 'unterlappenR', 'oberlappenL', 'unterlappenL'],
  ['luftroehre', 'hauptbronchien', 'bronchien', 'lungenarterien', 'lungenvenen', 'herz'],
  ['oberlappenR', 'mittellappen', 'unterlappenR', 'pleura', 'zwerchfell', 'zwischenrippen', 'rippen']
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
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, brustAn, rippenW, muskelW, sichtVer, A3.q].join('|');
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
  if (showLabels && !quiz && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt die Lunge, ohne Beschriftung bleibt sie frei; beim Ueben und bei einer Hilfekarte keine Beschriftung */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id] || !sidAn(id) || (!brustAn && BRUST.indexOf(id) >= 0)) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen, die Namen stehen dann neben dem Modell */
      var an = id in VIS ? VIS[id] : ((aktiv === 3 && KAND3[id]) || KAND[id] || [])[0];
      if (!an) return;
      pv.copy(an);
      if (an._dyn) ankerVerschiebung(an._dyn, pv);   /* Anker folgt der Atmung (die Anker selbst liegen in der Ruhelage) */
      pv.project(camera);   /* ANKER liegen schon im Raum der Szene (Koerper-Koordinaten minus M) */
      if (pv.z > 1) return;
      items.push({ id: id, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
    });
  }
  items.forEach(function (it) { it.side = (it.sx < cx || (narrow && it.id === 'luftroehre')) ? 'l' : 'r'; });   /* Handy: die Luftroehre (Mitte, oben) steht links, damit ihre Linie nicht quer ueber das Modell laeuft */
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
    var ex = function (it) { return side === 'l' ? colL + 7 + 16 : colR - 7 - 16; };
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
   6. Atmung (aus dem Thorax-Modell): Zustand, Geometrie des Schemas, Physik, Darstellung und Bedienung im Reiter "Atmung"
   Der Code steht unveraendert wie im Thorax-Modell (eigener Gueltigkeitsbereich, weil S und $ hier anders belegt sind); angepasst sind nur
   die IDs (Praefix lo), die Schleife (tick wird aus der Renderschleife gerufen, Pause), die Klasse on statt an bei den Knoepfen, die Suche
   der Bedienelemente nur im Reiter und der Anschluss des 3D-Modells (haken, hakenWahl: je ein Aufruf am Ende von zeichne bzw. im Schalter
   Rippen/Zwischenrippenmuskeln; Abschnitt 7).
   ===================================================================== */
var atmen = (function () {
/* ---------------- Zustand ---------------- */
var S = { d:0, i:0, V:0 };
var VMAX_D = 800, VMAX_I = 400;
var TAU = 0.48, K_DRUCK = 0.0125;
var vD = 0, vI = 0;
var modus = null;                 // null | "ruhe" | "stress"
var demoT = 0, entspannenAn = false;
var zeigeZahlen = false, zeigePfeile = true;
var tempo = 1;
var haken = null, hakenWahl = null;   // Einbindung: Anschluss des 3D-Modells (Abschnitt 7), wird am Ende von zeichne bzw. beim Schalter Rippen/Muskeln gerufen

function $(id){ return document.getElementById(id); }
function ID(k){ return "lo" + k.charAt(0).toUpperCase() + k.slice(1); }   // Praefix lo: eindeutige IDs im Atlas
var PANE = $("paneAtmung");
var el = {};
["koerper","herz","lungeR","lungeL","pleuraR","pleuraL","lappenR1","lappenR2","lappenL1",
 "thoraxwand","muskeln","rippen","rippenKontur","sternum","tempoBadge","tempoFaktor","zwerchfell","zwerchLabel","luftpunkte","atemLabel",
 "bronchL","bronchR","pfZwerch","pfRipL","pfRipR","txZwerch","txRipL","txRipR",
 "chipZ","chipR","chipA","z1","w2","b2","m2","w3","b3","z3","p4","w4","z4","g1","g2","g3","g4",
 "lblZwerch","lblRippen","pleuraZahl"].forEach(function(k){ el[k]=$(ID(k)); });

/* ---------------- Geometrie ---------------- */
var MITTE = 400, BASIS_Y = 452, HALB_RUHE = 176;
function halbBreite(){ return HALB_RUHE + 13*S.i; }
function apexY(){ return 372 + 62*S.d; }

function zwerchY(x){
  var hw = halbBreite();
  var t = (x - MITTE)/(2*hw) + 0.5;
  t = Math.max(0, Math.min(1, t));
  var Cy = 2*apexY() - BASIS_Y;
  return BASIS_Y*((1-t)*(1-t) + t*t) + 2*(1-t)*t*Cy;
}
function zwerchfellPfad(){
  var hw = halbBreite(), Cy = 2*apexY() - BASIS_Y;
  return "M"+(MITTE-hw)+" "+BASIS_Y+" Q"+MITTE+" "+Cy+" "+(MITTE+hw)+" "+BASIS_Y;
}
function koerperPfad(){
  var hw = halbBreite() + 26;
  return "M"+(MITTE-hw+30)+" 118 Q"+(MITTE-hw)+" 150 "+(MITTE-hw)+" 250"
       + " L"+(MITTE-hw)+" 470 Q"+(MITTE-hw)+" 512 "+(MITTE-hw+38)+" 512"
       + " L"+(MITTE+hw-38)+" 512 Q"+(MITTE+hw)+" 512 "+(MITTE+hw)+" 470"
       + " L"+(MITTE+hw)+" 250 Q"+(MITTE+hw)+" 150 "+(MITTE+hw-30)+" 118 Z";
}
function lungenPfad(seite){
  var hw = halbBreite();
  var xAussen = MITTE + seite*(hw - 15), xInnen = MITTE + seite*46, yOben = 178, p = [];
  p.push("M"+(MITTE + seite*(hw*0.30))+" "+yOben);
  p.push("Q"+(MITTE + seite*(hw-6))+" "+(yOben+16)+" "+xAussen+" "+(yOben+78));
  p.push("L"+xAussen+" "+(zwerchY(xAussen)-11));
  var N = 7, k, x;
  for (k=1; k<=N; k++){
    x = xAussen + (xInnen - xAussen)*(k/N);
    p.push("L"+x.toFixed(1)+" "+(zwerchY(x)-11).toFixed(1));
  }
  var yUntenInnen = zwerchY(xInnen)-11, M2 = 8, m, y, kerbe;
  for (m=1; m<=M2; m++){
    y = yUntenInnen + (yOben+52 - yUntenInnen)*(m/M2);
    kerbe = (seite > 0 && y > 322 && y < 424) ? 36*Math.sin(Math.PI*(y-322)/102) : 0;
    p.push("L"+(xInnen + seite*kerbe).toFixed(1)+" "+y.toFixed(1));
  }
  p.push("Q"+xInnen+" "+yOben+" "+(MITTE + seite*(hw*0.30))+" "+yOben+" Z");
  return p.join(" ");
}
function lappenPfad(seite, anteil){
  var hw = halbBreite(), xA = MITTE + seite*(hw-18), xI = MITTE + seite*52;
  return "M"+xA+" "+(178 + (zwerchY(xA)-190)*anteil).toFixed(1)
       + " L"+xI+" "+(178 + (zwerchY(xI)-190)*(anteil+0.18)).toFixed(1);
}
function herzPfad(){
  return "M362 318 Q352 372 386 424 Q420 462 452 424 Q476 392 470 330 Q450 300 412 302 Q378 300 362 318 Z";
}

/* ---------------- Rippen und Zwischenrippenmuskeln ---------------- */
function dreh(pt, piv, a){
  var dx = pt.x-piv.x, dy = pt.y-piv.y, ca = Math.cos(a), sa = Math.sin(a);
  return { x: piv.x + dx*ca - dy*sa, y: piv.y + dx*sa + dy*ca };
}
function rippeGeo(r, s){
  var hw = halbBreite(), y0 = 192 + r*40;
  var piv = { x: MITTE + s*24, y: y0 };
  var c   = { x: MITTE + s*(hw*0.70), y: y0 - 10 };
  var e   = { x: MITTE + s*(hw*0.94), y: y0 + 40 };
  var a = -s * (7.5*Math.PI/180) * S.i;
  return { p:piv, c:dreh(c,piv,a), e:dreh(e,piv,a) };
}
var rippenEl = [], muskelEl = [];
(function baueWand(){
  var r, s, g;
  for (r=0; r<6; r++){
    for (s=-1; s<=1; s+=2){
      var k = document.createElementNS("http://www.w3.org/2000/svg","path");
      el.rippenKontur.appendChild(k);
      g = document.createElementNS("http://www.w3.org/2000/svg","path");
      g.dataset.reihe = r; g.dataset.seite = s;
      el.rippen.appendChild(g);
      rippenEl.push({ knochen:g, kontur:k, r:r, s:s });
    }
  }
  for (r=0; r<5; r++){
    for (s=-1; s<=1; s+=2){
      g = document.createElementNS("http://www.w3.org/2000/svg","path");
      g.dataset.reihe = r; g.dataset.seite = s;
      g.setAttribute("fill","var(--muskel)"); g.setAttribute("stroke","none");
      el.muskeln.appendChild(g); muskelEl.push(g);
    }
  }
})();
function zeichneWand(){
  rippenEl.forEach(function(o){
    var G = rippeGeo(o.r, o.s);
    var d = "M"+G.p.x.toFixed(1)+" "+G.p.y.toFixed(1)
          + " Q"+G.c.x.toFixed(1)+" "+G.c.y.toFixed(1)+" "+G.e.x.toFixed(1)+" "+G.e.y.toFixed(1);
    o.knochen.setAttribute("d", d);
    o.kontur.setAttribute("d", d);
  });
  var spannung = Math.max(0, Math.min(1, S.i));
  var deck = (0.16 + 0.46*spannung).toFixed(2);
  muskelEl.forEach(function(g){
    var r = +g.dataset.reihe, s = +g.dataset.seite;
    var A = rippeGeo(r, s), B = rippeGeo(r+1, s);
    g.setAttribute("d",
      "M"+A.p.x.toFixed(1)+" "+A.p.y.toFixed(1)+
      " Q"+A.c.x.toFixed(1)+" "+A.c.y.toFixed(1)+" "+A.e.x.toFixed(1)+" "+A.e.y.toFixed(1)+
      " L"+B.e.x.toFixed(1)+" "+B.e.y.toFixed(1)+
      " Q"+B.c.x.toFixed(1)+" "+B.c.y.toFixed(1)+" "+B.p.x.toFixed(1)+" "+B.p.y.toFixed(1)+" Z");
    g.setAttribute("opacity", deck);
  });
}

/* ---------------- Luftpunkte bis in die Lunge ---------------- */
var punkte = [];
(function baueLuft(){
  var sparsam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var n = sparsam ? 6 : 14, k, c, s;
  for (k=0; k<n; k++){
    s = (k % 2 === 0) ? -1 : 1;
    c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("r","5"); c.setAttribute("cx","400"); c.setAttribute("cy","60");
    el.luftpunkte.appendChild(c);
    punkte.push({
      el:c, s:s, ph:(k/n),
      fx: (s < 0 ? 0.22 : 0.44) + 0.62*((k*0.37) % 1),
      fy: 0.18 + 0.66*((k*0.61) % 1)
    });
  }
})();
function bahn(dot){
  var hw = halbBreite(), s = dot.s;
  var hx = MITTE + s*(64 + 6*S.i);
  var xMed = MITTE + s*54, xLat = MITTE + s*(hw-30);
  var x = xMed + (xLat - xMed)*dot.fx;
  var yTop = 218, yBot = zwerchY(x) - 24;
  return [ {x:MITTE,y:42}, {x:MITTE,y:150}, {x:hx,y:206}, {x:x,y:yTop + (yBot-yTop)*dot.fy} ];
}
function punktAuf(pts, f){
  var segs = [], total = 0, k, dx, dy, L;
  for (k=0; k<pts.length-1; k++){
    dx = pts[k+1].x-pts[k].x; dy = pts[k+1].y-pts[k].y;
    L = Math.sqrt(dx*dx+dy*dy); segs.push(L); total += L;
  }
  var rest = f*total, t;
  for (k=0; k<segs.length; k++){
    if (rest <= segs[k] || k === segs.length-1){
      t = segs[k] > 0 ? Math.min(1, rest/segs[k]) : 0;
      return { x: pts[k].x + (pts[k+1].x-pts[k].x)*t, y: pts[k].y + (pts[k+1].y-pts[k].y)*t };
    }
    rest -= segs[k];
  }
  return pts[pts.length-1];
}

/* ---------------- Bewegungspfeile ---------------- */
function pfeilPfad(x, y0, laenge, richtung){
  var y1 = y0 + richtung*laenge;
  return "M"+x+" "+y0.toFixed(1)+" L"+x+" "+y1.toFixed(1)
       + " M"+(x-9)+" "+(y1 - richtung*12).toFixed(1)+" L"+x+" "+y1.toFixed(1)
       + " L"+(x+9)+" "+(y1 - richtung*12).toFixed(1);
}
function zeichnePfeile(){
  var schwelle = 0.05;
  // Zwerchfell
  var aktivZ = zeigePfeile && Math.abs(vD) > schwelle;
  if (aktivZ){
    var rZ2 = vD > 0 ? 1 : -1;
    var yStart = zwerchY(MITTE) + (rZ2 > 0 ? 16 : 48);
    el.pfZwerch.setAttribute("d", pfeilPfad(MITTE, yStart, 34, rZ2));
    el.pfZwerch.setAttribute("opacity", Math.min(1, 0.35 + Math.abs(vD)*1.6).toFixed(2));
    el.txZwerch.setAttribute("y", (zwerchY(MITTE) + 74).toFixed(0));
    el.txZwerch.setAttribute("opacity","1");
    el.txZwerch.textContent = rZ2 > 0 ? "tritt tiefer" : "weicht zurück";
  } else {
    el.pfZwerch.setAttribute("opacity","0"); el.txZwerch.setAttribute("opacity","0");
  }
  // Rippen
  var aktivR = zeigePfeile && Math.abs(vI) > schwelle;
  if (aktivR){
    var rR2 = vI > 0 ? -1 : 1;               // Anspannung steigt -> Rippen heben sich
    var hw = halbBreite(), yStart = rR2 > 0 ? 262 : 306;
    var deck = Math.min(1, 0.35 + Math.abs(vI)*1.6).toFixed(2);
    var txt = rR2 > 0 ? "senken sich" : "heben sich";
    [[-1, el.pfRipL, el.txRipL], [1, el.pfRipR, el.txRipR]].forEach(function(a){
      var x = MITTE + a[0]*(hw + 34);
      a[1].setAttribute("d", pfeilPfad(x, yStart, 40, rR2));
      a[1].setAttribute("opacity", deck);
      a[2].setAttribute("x", x.toFixed(0)); a[2].setAttribute("opacity","1");
      a[2].textContent = txt;
    });
  } else {
    el.pfRipL.setAttribute("opacity","0"); el.pfRipR.setAttribute("opacity","0");
    el.txRipL.setAttribute("opacity","0"); el.txRipR.setAttribute("opacity","0");
  }
}

/* ---------------- Physik ---------------- */
function schritt(dt){
  var Vziel = VMAX_D*S.d + VMAX_I*S.i;
  var fluss = (Vziel - S.V)/TAU;
  S.V += fluss*dt;
  if (Math.abs(Vziel - S.V) < 0.4) S.V = Vziel;
  return { Vziel:Vziel, fluss:fluss, pAlv:(S.V - Vziel)*K_DRUCK, pPleura:-5 - 0.0055*Math.max(0,Vziel) };
}

/* ---------------- Darstellung ---------------- */
var letzterZustand = "";
function zeichne(m, dt){
  var sig = S.d.toFixed(3)+"|"+S.i.toFixed(3);
  if (sig !== letzterZustand){
    letzterZustand = sig;
    el.koerper.setAttribute("d", koerperPfad());
    el.herz.setAttribute("d", herzPfad());
    var pR = lungenPfad(-1), pL = lungenPfad(1);
    el.lungeR.setAttribute("d", pR); el.pleuraR.setAttribute("d", pR);
    el.lungeL.setAttribute("d", pL); el.pleuraL.setAttribute("d", pL);
    el.lappenR1.setAttribute("d", lappenPfad(-1, 0.30));
    el.lappenR2.setAttribute("d", lappenPfad(-1, 0.60));
    el.lappenL1.setAttribute("d", lappenPfad(1, 0.46));
    el.zwerchfell.setAttribute("d", zwerchfellPfad());
    el.zwerchLabel.setAttribute("y", (zwerchY(280)+30).toFixed(0));
    el.sternum.setAttribute("y", (188 - 7*S.i).toFixed(1));
    el.bronchL.setAttribute("d", "M400 152 L"+(MITTE-64-6*S.i).toFixed(1)+" 206");
    el.bronchR.setAttribute("d", "M400 152 L"+(MITTE+64+6*S.i).toFixed(1)+" 206");
    zeichneWand();
  }

  var pStaerke = Math.min(1, (Math.abs(m.pPleura)-5)/3);
  var op = (0.22 + 0.40*pStaerke).toFixed(2);
  el.pleuraR.setAttribute("opacity", op);
  el.pleuraL.setAttribute("opacity", op);

  var f = m.fluss, absF = Math.abs(f), stroemt = absF > 12;
  var farbe = f > 0 ? "var(--ein)" : "var(--aus)";
  punkte.forEach(function(p){
    if (stroemt){
      p.ph = p.ph + (f/450)*dt;
      p.ph = p.ph - Math.floor(p.ph);
    }
    var pos = punktAuf(bahn(p), p.ph);
    p.el.setAttribute("cx", pos.x.toFixed(1));
    p.el.setAttribute("cy", pos.y.toFixed(1));
    p.el.setAttribute("fill", farbe);
    var rand = Math.min(1, Math.min(p.ph, 1-p.ph)*7);
    p.el.setAttribute("opacity", stroemt ? (rand*Math.min(1, absF/220)).toFixed(2) : "0.12");
  });
  el.atemLabel.textContent = !stroemt ? "kein Luftstrom"
        : (f > 0 ? "▼  Einatmen (Inspiration)" : "▲  Ausatmen (Exspiration)");
  el.atemLabel.setAttribute("fill", stroemt ? farbe : "#8A9A96");

  zeichnePfeile();
  zeichneKette(m, stroemt);
  if (haken) haken(S, m, dt, punkte);   // Einbindung: das 3D-Modell folgt dem Zustand
}

function zeichneKette(m, stroemt){
  var ein = S.d > 0.02 || S.i > 0.02, aus = S.d < -0.01 || S.i < -0.01;
  el.chipZ.classList.toggle("an", S.d > 0.02);
  el.chipR.classList.toggle("an", S.i > 0.02);
  el.chipA.classList.toggle("an", aus);
  el.chipA.classList.toggle("aus", aus);
  el.g1.classList.toggle("aktiv", ein || aus);
  el.z1.textContent = aus ? "presst aktiv aus" : (ein ? "angespannt" : "alles entspannt");

  var v = m.Vziel;
  el.g2.classList.toggle("aktiv", Math.abs(v) > 6);
  el.w2.textContent = v > 6 ? "dehnt sich aus" : (v < -6 ? "enger als in Ruhe" : "unverändert");
  el.m2.style.left = "18%";
  if (v >= 0){
    el.b2.style.left = "18%";
    el.b2.style.width = Math.min(80, v/1300*80) + "%";
    el.b2.style.background = "var(--sog)";
  } else {
    var br = Math.min(17, Math.abs(v)/560*17);
    el.b2.style.left = (18-br) + "%";
    el.b2.style.width = br + "%";
    el.b2.style.background = "var(--strom)";
  }

  var p = m.pAlv, spuerbar = Math.abs(p) > 0.05;
  el.g3.classList.toggle("aktiv", spuerbar);
  el.w3.textContent = !spuerbar ? "wie außen" : (p < 0 ? "niedriger als außen" : "höher als außen");
  var breite = Math.min(48, Math.abs(p)*16);
  el.b3.style.left = (p < 0 ? 50-breite : 50) + "%";
  el.b3.style.width = breite + "%";
  el.b3.style.background = p < 0 ? "var(--sog)" : "var(--strom)";
  el.z3.textContent = zeigeZahlen ? (p>=0?"+":"") + p.toFixed(2) + " cmH₂O" : "";

  var f = m.fluss;
  el.g4.classList.toggle("aktiv", stroemt);
  el.p4.textContent = stroemt ? (f > 0 ? "↓" : "↑") : "–";
  el.p4.style.color = stroemt ? (f > 0 ? "var(--ein)" : "var(--aus)") : "#7C949B";
  el.w4.textContent = !stroemt ? "kein Luftstrom" : (f > 0 ? "Einatmen (Inspiration)" : "Ausatmen (Exspiration)");
  el.z4.textContent = S.V >= 0
    ? "Atemzugvolumen: " + Math.round(S.V) + " ml"
    : "unter Ruhelage: " + Math.round(-S.V) + " ml";

  el.pleuraZahl.style.display = zeigeZahlen ? "block" : "none";
  el.pleuraZahl.textContent = m.pPleura.toFixed(1) + " cmH₂O";
}

/* ---------------- Schleife ---------------- */
var tAlt = 0, pausiert = false;
function tick(t){
  if (pausiert){                    // Pause: Schritt ganz uebersprungen (dt = 0 teilt unten durch 0); tAlt mitfuehren, damit nach der Pause kein Sprung entsteht
    tAlt = t;
    if (S.d.toFixed(3)+"|"+S.i.toFixed(3) !== letzterZustand) zeichne(schritt(0), 0);   // von Hand verstellt: nur neu zeichnen
    return;
  }
  var dtEcht = tAlt ? Math.min(0.05, (t - tAlt)/1000) : 0.016;
  tAlt = t;
  var dt = dtEcht * tempo;
  var dAlt = S.d, iAlt = S.i;

  if (modus === "ruhe"){
    demoT += dt;
    var Z = 4.2, ph = demoT % Z, w;
    if (ph < 1.7){ w = 0.52*(1 - Math.cos(Math.PI*(ph/1.7)))/2; }
    else { w = 0.52*Math.pow(1 - (ph-1.7)/2.5, 2.2); }
    S.d = w; S.i = w*0.95;
    setzeRegler();
  } else if (modus === "stress"){
    demoT += dt;
    var Zs = 2.1, phs = demoT % Zs, boden = -0.70, gd = 1.00, gi = 0.95, u, kd, ki;
    if (phs < 0.85){
      u = (1 - Math.cos(Math.PI*(phs/0.85)))/2;
      kd = boden + (gd-boden)*u; ki = boden + (gi-boden)*u;
    } else {
      u = (1 - Math.cos(Math.PI*((phs-0.85)/1.25)))/2;
      kd = gd - (gd-boden)*u; ki = gi - (gi-boden)*u;
    }
    S.d = kd; S.i = ki;
    setzeRegler();
  } else if (entspannenAn){
    S.d = Math.max(0, S.d - dt*0.75);
    S.i = Math.max(0, S.i - dt*0.75);
    if (S.d === 0 && S.i === 0) entspannenAn = false;
    setzeRegler();
  }

  var gl = Math.min(1, dt*9);
  vD += (((S.d - dAlt)/dt) - vD)*gl;
  vI += (((S.i - iAlt)/dt) - vI)*gl;

  zeichne(schritt(dt), dt);
}

/* ---------------- Bedienung ---------------- */
var rZ = $("loZwerchRegler"), rR = $("loRippenRegler");
function setzeRegler(){
  rZ.value = Math.round(Math.max(0, S.d)*100);
  rR.value = Math.round(Math.max(0, S.i)*100);
  beschrifte();
}
function stufe(v){
  if (v < -0.02) return "presst aus";
  return v < 0.03 ? "entspannt" : v < 0.35 ? "leicht" : v < 0.72 ? "deutlich" : "maximal";
}
function beschrifte(){
  el.lblZwerch.textContent = stufe(S.d);
  el.lblRippen.textContent = stufe(S.i);
}
function demoAus(){
  modus = null;
  $(ID("demoRuhe")).classList.remove("on"); $(ID("demoRuhe")).textContent = "Ruheatmung starten";
  $(ID("demoStress")).classList.remove("on"); $(ID("demoStress")).textContent = "Angestrengte Atmung starten";
}
function handbetrieb(){ demoAus(); entspannenAn = false; }

rZ.addEventListener("input", function(){ handbetrieb(); S.d = +rZ.value/100; beschrifte(); });
rR.addEventListener("input", function(){ handbetrieb(); S.i = +rR.value/100; beschrifte(); });

PANE.querySelectorAll("[data-set]").forEach(function(b){
  b.addEventListener("click", function(){
    handbetrieb();
    var w = +b.dataset.wert/100;
    if (b.dataset.set === "zwerch") S.d = w; else S.i = w;
    setzeRegler();
  });
});

$(ID("entspannen")).addEventListener("click", function(){ demoAus(); entspannenAn = true; });

$(ID("demoRuhe")).addEventListener("click", function(){
  var an = modus !== "ruhe"; demoAus(); entspannenAn = false;
  if (an){ modus = "ruhe"; demoT = 0; this.classList.add("on"); this.textContent = "Ruheatmung anhalten"; }
});
$(ID("demoStress")).addEventListener("click", function(){
  var an = modus !== "stress"; demoAus(); entspannenAn = false;
  if (an){ modus = "stress"; demoT = 0; this.classList.add("on","stress"); this.textContent = "Angestrengte Atmung anhalten"; }
});

function segment(gruppe, aktion){
  PANE.querySelectorAll("["+gruppe+"]").forEach(function(b){
    b.addEventListener("click", function(){
      PANE.querySelectorAll("["+gruppe+"]").forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on");
      aktion(b.dataset[gruppe.replace("data-","")]);
    });
  });
}
segment("data-rippen", function(w){
  el.rippen.setAttribute("opacity", w === "voll" ? "1" : "0");
  el.rippenKontur.setAttribute("stroke-width", w === "voll" ? "14.5" : "2.5");
  el.rippenKontur.setAttribute("opacity", w === "aus" ? "0" : "1");
  el.sternum.setAttribute("opacity", w === "aus" ? "0" : (w === "voll" ? "1" : "0.35"));
  if (hakenWahl) hakenWahl("rippen", w);   // Einbindung: auch im 3D-Modell
});
segment("data-muskel", function(w){
  el.muskeln.setAttribute("opacity", w === "aus" ? "0" : "1");
  if (hakenWahl) hakenWahl("muskel", w);   // Einbindung: auch im 3D-Modell
});
segment("data-tempo", function(w){
  tempo = parseFloat(w);
  el.tempoBadge.classList.toggle("an", tempo < 1);
  el.tempoFaktor.textContent = tempo === 0.5 ? "½×" : "¼×";
});

$("loPfeileAn").addEventListener("change", function(){ zeigePfeile = this.checked; });
$("loZahlen").addEventListener("change", function(){ zeigeZahlen = this.checked; });
setzeRegler();

/* Zugriff fuer die Bedienung ausserhalb (Pause) und fuer die Pruefung (nur lesen) */
function lesen(){
  var r4 = function(x){ return Math.round(x*10000)/10000; };
  return {
    S: { d: r4(S.d), i: r4(S.i), V: r4(S.V) }, modus: modus, tempo: tempo, pausiert: pausiert,
    kette: {
      z1: el.z1.textContent, w2: el.w2.textContent, w3: el.w3.textContent, z3: el.z3.textContent, w4: el.w4.textContent, z4: el.z4.textContent,
      chips: { zwerchfell: el.chipZ.classList.contains("an"), rippen: el.chipR.classList.contains("an"), bauchpresse: el.chipA.classList.contains("an") }
    },
    pleura: el.pleuraZahl.textContent
  };
}
/* Einbindung fuer die Lupe (Abschnitt 6b, nur lesen): Muskeln des Schemas und Druck im Pleuraspalt (Formel wie in schritt) */
function lupeWerte(){
  var Vziel = VMAX_D*S.d + VMAX_I*S.i;
  return { d: S.d, i: S.i, pPleura: -5 - 0.0055*Math.max(0,Vziel) };
}
return { tick: tick, pause: function (an) { pausiert = an; }, faktor: function () { return pausiert ? 0 : tempo; }, lesen: lesen, lupeWerte: lupeWerte, anschliessen: function (f, w) { haken = f; hakenWahl = w; }, punkte: punkte };
})();

/* =====================================================================
   7. Atmung in 3D: Zwerchfell, Lunge und Brustkorb folgen den Muskeln des Schemas (S.d, S.i), die Luftteilchen laufen durch Luftroehre und Bronchien
   Der Zustand kommt aus dem Abschnitt 6 (atmen.anschliessen: Aufruf am Ende von zeichne), die Geometrie folgt wie im Schema direkt den Muskeln
   (S.d, S.i), nicht dem Volumen S.V; negative Werte (angestrengte Atmung) wirken in die Gegenrichtung. Es wird nur neu gerechnet, wenn sich
   S.d oder S.i aendern. Alle Netze werden aus ihrer Ruhelage verschoben (Ruhepositionen einmal gespeichert).
   Zwerchfell: der Scheitel sinkt um dA = 62 * S.d * (Hoehe der Kuppel im Modell / 80 px) (Schema: apexY = 372 + 62 * d bei 80 px Kuppelhoehe, also
   sinkt er um denselben Anteil der Kuppel wie dort; mit PX_CM laege der Scheitel bei S.d = 1 unter dem Rand, die Kuppel waere umgestuelpt),
   der Rand bleibt: dy = -dA * w, w = Hoehe der Kuppel ueber dem Rand an dieser Stelle (cm), dA = 62 * d / 80 px je cm. Seitlich waechst die Halbbreite um
   dB = 13 * S.i * PX_CM (Schema: halbBreite = 176 + 13 * i).
   Lunge (Lappen, Rippenfell, Atemwege und Gefaesse in der Lunge): unten folgt sie dem Zwerchfell, die Spitze bleibt; seitlich wird sie weiter.
   Rippen: Drehung um die hintere Gelenkachse (Wirbelende) um 7,5 Grad * S.i, die vorderen Teile heben sich (Eimerhenkel); Knorpel folgen,
   das Brustbein hebt sich um 7 * S.i * PX_CM (und etwas nach vorn).
   ===================================================================== */
var PX_CM = 0.11;                        /* Schema (Pixel) -> Modell (cm): die Lungenhoehe im Schema (274 px) entspricht ca. 30 cm im Modell */
var Y_SPITZE = 146.5, X_MAX = 15;        /* Lunge: Oberkante (y, cm) bleibt fest; seitlich wirkt die Verschiebung voll ab |x| = X_MAX (groesste Breite der Rippen) */
var RIPPE_WINKEL = 7.5 * DEG;            /* Drehung der Rippen bei S.i = 1 (Schema: 7,5 Grad) */
var Z_GELENK = -7, WAND_Z0 = -2, WAND_Z1 = 6, WAND_Y0 = 118, WAND_Y1 = 128;   /* Lunge an der Brustwand: Gelenkachse der Rippen (z), Uebergang hinten -> vorn (z) und unten -> oben (y) */
var PLEURA_3D = 0.45;                    /* Daempfung der Rippenfell-Deckkraft in 3D (0,10 in Ruhe bis ca. 0,28) */
var KUPPEL_PX = 80;                      /* Hoehe der Zwerchfellkuppel im Schema (px): BASIS_Y 452 - apexY 372 */
var STERNUM_ZU_VOR = 0.5;                /* das Brustbein geht um diesen Anteil seines Hubs auch nach vorn */
var A3 = { bereit: false, neu: false, sig: '', q: '', S: null, S0: null, bronch: null, dB: 0, rc: 1, rs: 0, sx: 1, dyS: 0, dzS: 0, dA: 0, sinW: 0, rest: new Map(), feld: [], zwerch: null, sternum: null, luft: null };
var KQ = { h: 0, hx: 0, hz: 0, w: 0, wx: 0, wz: 0, dA: 0 }, FO = { x: 0, y: 0, z: 0, a: 1, bx: 0, by: 1, bz: 0 };
var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };

/* Kuppel des Zwerchfells ueber (x, z): Hoehe h, Hoehe w (cm) ueber dem Rand an dieser Stelle (0 am Rand und darunter) und die Ableitungen nach x und z */
function kuppel(x, z, q) {
  var e = 0.05, r = form.kuppelRand;
  q.h = form.kuppel(x, z); q.dA = A3.dA;   /* Senkung je cm Hoehe ueber dem Rand */
  q.hx = (form.kuppel(x + e, z) - form.kuppel(x - e, z)) / (2 * e);
  q.hz = (form.kuppel(x, z + e) - form.kuppel(x, z - e)) / (2 * e);
  var rd = r(x, z);
  if (q.h <= rd) { q.w = 0; q.wx = 0; q.wz = 0; }
  else { q.w = q.h - rd; q.wx = q.hx - (r(x + e, z) - r(x - e, z)) / (2 * e); q.wz = q.hz - (r(x, z + e) - r(x, z - e)) / (2 * e); }
}
/* Verschiebung der Lunge fuer einen Punkt der Ruhelage (x, y, z) -> o.x, o.y, o.z; dazu die Jacobi-Matrix (o.a, o.bx, o.by, o.bz) fuer die Normalen:
   y' = y - dA * w(x,z) * t, t = Anteil des Wegs von der Spitze (0) zur Basis (1) = clamp01((Y_SPITZE - y) / (Y_SPITZE - yBasis)), yBasis = Kuppel + 0.5
   x' = x + sign(x) * dB * clamp01(|x| / X_MAX)
   Dazu haftet der obere, vordere Teil an der Brustwand (Pleura): y' += sin(7,5 Grad * S.i) * (z - Z_GELENK) * wz * wy, das ist die Hebung bzw. Senkung
   der Rippen an dieser Stelle (wz: 0 hinten, 1 vorn; wy: 0 unten, 1 oben). Ohne sie stiessen die Rippen bei der angestrengten Ausatmung (S.i < 0)
   auf die Lunge. */
function lungeFeld(x, y, z, o) {
  var dB = A3.dB, q = KQ, dA;
  kuppel(x, z, q); dA = q.dA;
  var nen = Y_SPITZE - (q.h + 0.5), roh = (Y_SPITZE - y) / nen, t = clamp01(roh), inn = roh > 0 && roh < 1, ax = Math.abs(x);
  var uz = clamp01((z - WAND_Z0) / (WAND_Z1 - WAND_Z0)), wz = uz * uz * (3 - 2 * uz), dwz = (uz > 0 && uz < 1) ? 6 * uz * (1 - uz) / (WAND_Z1 - WAND_Z0) : 0;
  var uy = clamp01((y - WAND_Y0) / (WAND_Y1 - WAND_Y0)), wy = uy * uy * (3 - 2 * uy), dwy = (uy > 0 && uy < 1) ? 6 * uy * (1 - uy) / (WAND_Y1 - WAND_Y0) : 0;
  var sg = A3.sinW, zr = z - Z_GELENK;
  o.x = x + (x < 0 ? -1 : 1) * dB * (ax < X_MAX ? ax / X_MAX : 1);
  o.y = y - dA * q.w * t + sg * zr * wz * wy;
  o.z = z;
  o.a = 1 + (ax < X_MAX ? dB / X_MAX : 0);
  o.by = 1 + (inn ? dA * q.w / nen : 0) + sg * zr * wz * dwy;
  o.bx = -dA * (q.wx * t + (inn ? q.w * (Y_SPITZE - y) * q.hx / (nen * nen) : 0));
  o.bz = -dA * (q.wz * t + (inn ? q.w * (Y_SPITZE - y) * q.hz / (nen * nen) : 0)) + sg * wy * (wz + zr * dwz);
}
function lungeAnwenden(e) {
  var g = e.m.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, p0 = e.pos0, n0 = e.nor0, o = FO, wt = e.wt, i, j, m1, m2, m3, l, w;
  for (i = 0; i < p0.length; i += 3) {
    lungeFeld(p0[i], p0[i + 1], p0[i + 2], o);
    m2 = n0[i + 1] / o.by; m1 = (n0[i] - o.bx * m2) / o.a; m3 = n0[i + 2] - o.bz * m2;   /* Normale: Jacobi^-T * n */
    if (wt) {   /* Lungengefaesse: am Herzen bleiben sie stehen (Gewicht 0), erst weiter weg folgen sie der Lunge (Gewicht 1), Normale entsprechend gemischt */
      w = wt[i / 3];
      P[i] = p0[i] + (o.x - p0[i]) * w; P[i + 1] = p0[i + 1] + (o.y - p0[i + 1]) * w; P[i + 2] = p0[i + 2] + (o.z - p0[i + 2]) * w;
      l = Math.sqrt(m1 * m1 + m2 * m2 + m3 * m3) || 1;
      m1 = n0[i] + (m1 / l - n0[i]) * w; m2 = n0[i + 1] + (m2 / l - n0[i + 1]) * w; m3 = n0[i + 2] + (m3 / l - n0[i + 2]) * w;
    } else { P[i] = o.x; P[i + 1] = o.y; P[i + 2] = o.z; }
    l = Math.sqrt(m1 * m1 + m2 * m2 + m3 * m3) || 1;
    N[i] = m1 / l; N[i + 1] = m2 / l; N[i + 2] = m3 / l;
  }
  g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
}
/* Rippen und Lunge: die Rippen duerfen die Lunge nicht durchstossen. Die Stuetzstrecken der gedrehten Rippen kommen in ein grobes Gitter; Eckpunkte von
   Rippenfell und Lappen, die der Mittellinie einer Rippe naeher kommen als RIP_R + Rand (Rippenfell: anliegend, Lappen: 0,45 cm Spalt wie in Ruhe),
   werden von ihr weggeschoben (in Ruhe ist nichts zu tun). */
var KG = { c: 3, x0: -18, y0: 100, z0: -14, nx: 12, ny: 17, nz: 10, zellen: [], segs: [] };
function kollisionGitter() {
  var G = KG, n = G.nx * G.ny * G.nz, i, k, sd, r = form.RIP_R + 0.6;
  if (!G.zellen.length) for (i = 0; i < n; i++) G.zellen.push([]);
  for (i = 0; i < n; i++) G.zellen[i].length = 0;
  G.segs.length = 0;
  [-1, 1].forEach(function (sd) {
    for (i = 0; i < 12; i++) {
      var P = RIPPEN_J[sd][i];
      for (k = 0; k < P.length - 1; k++) {
        var a = P[k], b = P[k + 1], id = G.segs.length, x, y, z;
        G.segs.push([a, b]);
        var ix0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - r - G.x0) / G.c)), ix1 = Math.min(G.nx - 1, Math.floor((Math.max(a[0], b[0]) + r - G.x0) / G.c));
        var iy0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - r - G.y0) / G.c)), iy1 = Math.min(G.ny - 1, Math.floor((Math.max(a[1], b[1]) + r - G.y0) / G.c));
        var iz0 = Math.max(0, Math.floor((Math.min(a[2], b[2]) - r - G.z0) / G.c)), iz1 = Math.min(G.nz - 1, Math.floor((Math.max(a[2], b[2]) + r - G.z0) / G.c));
        for (x = ix0; x <= ix1; x++) for (y = iy0; y <= iy1; y++) for (z = iz0; z <= iz1; z++) G.zellen[x + G.nx * (y + G.ny * z)].push(id);
      }
    }
  });
}
function kollisionAnwenden(e) {
  var G = KG, P = e.m.geometry.attributes.position.array, R = form.RIP_R + e.rand, i, j, c, ix, iy, iz, q, s, a, b, dx, dy, dz, L2, t, ex, ey, ez, d2, d, hit = false;
  for (i = 0; i < P.length; i += 3) {
    ix = Math.floor((P[i] - G.x0) / G.c); iy = Math.floor((P[i + 1] - G.y0) / G.c); iz = Math.floor((P[i + 2] - G.z0) / G.c);
    if (ix < 0 || iy < 0 || iz < 0 || ix >= G.nx || iy >= G.ny || iz >= G.nz) continue;
    c = G.zellen[ix + G.nx * (iy + G.ny * iz)];
    for (j = 0; j < c.length; j++) {
      s = G.segs[c[j]]; a = s[0]; b = s[1];
      dx = b[0] - a[0]; dy = b[1] - a[1]; dz = b[2] - a[2]; L2 = dx * dx + dy * dy + dz * dz || 1;
      t = ((P[i] - a[0]) * dx + (P[i + 1] - a[1]) * dy + (P[i + 2] - a[2]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      ex = P[i] - (a[0] + dx * t); ey = P[i + 1] - (a[1] + dy * t); ez = P[i + 2] - (a[2] + dz * t);
      d2 = ex * ex + ey * ey + ez * ez;
      if (d2 < R * R && d2 > 1e-10) { d = R / Math.sqrt(d2); P[i] = a[0] + dx * t + ex * d; P[i + 1] = a[1] + dy * t + ey * d; P[i + 2] = a[2] + dz * t + ez * d; hit = true; }
    }
  }
  if (hit) e.m.geometry.attributes.position.needsUpdate = true;
}
function zwerchfellAnwenden() {
  var e = A3.zwerch, g = e.m.geometry, P = g.attributes.position.array, p0 = e.pos0, q = KQ, i, x, ax;
  for (i = 0; i < p0.length; i += 3) {
    x = p0[i]; ax = Math.abs(x);
    kuppel(x, p0[i + 2], q);
    P[i] = x + (x < 0 ? -1 : 1) * A3.dB * (ax < X_MAX ? ax / X_MAX : 1);
    P[i + 1] = p0[i + 1] - q.dA * q.w;
    P[i + 2] = p0[i + 2];
  }
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
}
/* Punkt p der Rippe i (Ruhelage) nach Drehung um die hintere Gelenkachse (Wirbelende, Achse in x-Richtung) und Verbreiterung -> o */
function rippePunkt(sd, i, p, o) {
  var piv = RIPPEN[sd][i][0], dy = p[1] - piv[1], dz = p[2] - piv[2];
  o[0] = p[0] * A3.sx; o[1] = piv[1] + dy * A3.rc - dz * A3.rs; o[2] = piv[2] + dy * A3.rs + dz * A3.rc;
  return o;
}
var RIPPEN_J = { '-1': [], '1': [] };   /* Stuetzpunkte der gedrehten Rippen (fuer die Zwischenrippenmuskeln) */
function brustkorbAnwenden() {
  var th = -RIPPE_WINKEL * A3.S.i, sd, i, k, tmp = [0, 0, 0];
  A3.rc = Math.cos(th); A3.rs = Math.sin(th); A3.sx = 1 + A3.dB / X_MAX;
  A3.dyS = 7 * A3.S.i * PX_CM; A3.dzS = STERNUM_ZU_VOR * A3.dyS;
  [-1, 1].forEach(function (sd) {
    for (i = 0; i < 12; i++) {
      var piv = RIPPEN[sd][i][0], m = RIPPE_MESH[sd][i];   /* Rippe als Ganzes: Drehung um die Achse durch das Wirbelende, dann Verbreiterung (beide vertauschen) */
      m.rotation.x = th; m.scale.x = A3.sx;
      m.position.set(0, piv[1] - (piv[1] * A3.rc - piv[2] * A3.rs), piv[2] - (piv[1] * A3.rs + piv[2] * A3.rc));
      RIPPEN_J[sd][i] = RIPPEN[sd][i].map(function (p) { return rippePunkt(sd, i, p, [0, 0, 0]); });
    }
    for (i = 0; i < 11; i++) baenderSetzen(sd, i, RIPPEN_J);
  });
  var so = A3.sternum; so.m.position.set(so.p0[0], so.p0[1] + A3.dyS, so.p0[2] + A3.dzS);
  KNORPEL.forEach(function (kn) {   /* Knorpel: Ende an der Rippe und Ziel (Brustbein bzw. Rippe darueber) verschoben, dazwischen anteilig */
    var e1 = rippePunkt(kn.sd, kn.i, kn.e, [0, 0, 0]), z1 = kn.i < 7 ? [kn.ziel[0], kn.ziel[1] + A3.dyS, kn.ziel[2] + A3.dzS] : rippePunkt(kn.sd, kn.i - 1, kn.ziel, [0, 0, 0]);
    var re = A3.rest.get(kn.m), P = kn.m.geometry.attributes.position, a = P.array, p0 = re.pos0, lam = re.lam, c;
    for (k = 0; k < lam.length; k++) for (c = 0; c < 3; c++) a[k * 3 + c] = p0[k * 3 + c] + (1 - lam[k]) * (e1[c] - kn.e[c]) + lam[k] * (z1[c] - kn.ziel[c]);
    P.needsUpdate = true;
  });
  MAT.zwischenrippen.opacity = 0.16 + 0.46 * clamp01(A3.S.i);   /* wie im Schema */
}
/* Rippen, Brustbein: Glas bei "durchsichtig" */
function rippenLook() {
  var glas = rippenW === 'kontur';
  [MAT.rippen, MAT.knorpel, MAT.brustbein].forEach(function (m) { stelleMat(m, glas, glas ? GLAS : 1); });
}
/* Schalter Rippen/Zwischenrippenmuskeln des Schemas wirken auch im 3D-Modell; der Knopf Brustkorb folgt (beide aus = aus) */
function atmungWahl(gruppe, w) {
  if (gruppe === 'rippen') rippenW = w; else muskelW = w;
  brustAn = !(rippenW === 'aus' && muskelW === 'aus');
  $('bBrust').classList.toggle('on', brustAn);
  rippenLook();
  applyVisibility();
}

/* Luftteilchen: die Punkte des Schemas (atmen.punkte) laufen in 3D von der Luftroehre ueber die Gabelung und den Hauptbronchus der Seite s durch den
   Bronchialbaum bis zu einem Endpunkt (deterministisch aus fy des Punktes); Phase p.ph, Richtung, Farbe und Deckkraft wie im Schema */
var LUFT_R = 0.175;                      /* Kugelradius (cm): Groesse 0,35 cm */
function pfadZu(e, s) {
  var kette = [], a = BAUM.filter(function (b) { return b.lappen === e.lappen && b.gen === 3 && b.pts[2] === e.p; })[0], st, g;
  while (a && a.gen > 0) {
    kette.unshift(a); st = a.pts[0]; g = a.gen - 1;
    a = BAUM.filter(function (b) { return b.lappen === e.lappen && b.gen === g && (g === 0 || b.pts[b.pts.length - 1] === st); })[0];
  }
  var pts = form.TRACHEA.map(function (p) { return p.slice(); }), hb = form.hauptbronchus(s);
  pts.push(hb[1].slice(), hb[2].slice());
  if (!a || !kette.length) return pts;
  /* Lappenbronchus bis zum Abzweig der Generation 1 (st liegt auf seiner Mittellinie) */
  var w = a.pts, best = 1e9, bj = 1, k, d, f, L2;
  st = kette[0].pts[0];
  for (k = 0; k < w.length - 1; k++) {
    L2 = Math.pow(w[k + 1][0] - w[k][0], 2) + Math.pow(w[k + 1][1] - w[k][1], 2) + Math.pow(w[k + 1][2] - w[k][2], 2) || 1;
    f = clamp01(((st[0] - w[k][0]) * (w[k + 1][0] - w[k][0]) + (st[1] - w[k][1]) * (w[k + 1][1] - w[k][1]) + (st[2] - w[k][2]) * (w[k + 1][2] - w[k][2])) / L2);
    d = Math.pow(w[k][0] + (w[k + 1][0] - w[k][0]) * f - st[0], 2) + Math.pow(w[k][1] + (w[k + 1][1] - w[k][1]) * f - st[1], 2) + Math.pow(w[k][2] + (w[k + 1][2] - w[k][2]) * f - st[2], 2);
    if (d < best) { best = d; bj = k + 1; }
  }
  for (k = 1; k < bj; k++) pts.push(w[k].slice());
  pts.push(st.slice());
  kette.forEach(function (b) { pts.push(b.pts[1].slice(), b.pts[2].slice()); });
  return pts;
}
function luftBauen(punkte) {
  var ends = { '-1': [], '1': [] };
  BAUM.endpunkte.forEach(function (e) { ends[e.lappen.slice(-1) === 'L' ? '1' : '-1'].push(e); });
  var pfade = punkte.map(function (p) {
    var l = ends[p.s], e = l[Math.min(l.length - 1, Math.floor((p.fy - 0.18) / 0.66 * l.length))];
    var pts = pfadZu(e, p.s);
    return { ruhe: pts, pts: pts.map(function (q) { return q.slice(); }), L: new Float32Array(pts.length), gesamt: 0 };
  });
  var n = punkte.length, geo = new THREE.SphereGeometry(LUFT_R, 10, 7), alpha = new THREE.InstancedBufferAttribute(new Float32Array(n), 1), farbe = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  alpha.setUsage(THREE.DynamicDrawUsage); farbe.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aAlpha', alpha); geo.setAttribute('aFarbe', farbe);
  var mt = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });   /* Farbe und Deckkraft je Teilchen (Attribute aFarbe, aAlpha) */
  mt.onBeforeCompile = function (sh) {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aAlpha;\nattribute vec3 aFarbe;\nvarying float vAl;\nvarying vec3 vFa;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAl = aAlpha; vFa = aFarbe;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vAl;\nvarying vec3 vFa;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = vFa; diffuseColor.a *= vAl;');
  };
  mt.name = 'luftteilchen';
  var im = new THREE.InstancedMesh(geo, mt, n);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false; im.renderOrder = 5;
  im.name = 'Luft'; im.userData.teilchen = 'luft'; im.userData.noexport = true;
  im.raycast = function () {};   /* Teilchen sind nicht anklickbar */
  root.add(im);
  return { im: im, pfade: pfade, alpha: alpha, farbe: farbe, ein: srgb(0xCE3A2F), aus: srgb(0x6B7F8C), M: new THREE.Matrix4() };
}
/* Pfade in die aktuelle Lage der Lunge setzen (Feld wie bei den Netzen) und die Laengen neu bestimmen */
function luftPfade() {
  A3.luft.pfade.forEach(function (pf) {
    var k, o = FO, t = 0;
    for (k = 0; k < pf.ruhe.length; k++) {
      lungeFeld(pf.ruhe[k][0], pf.ruhe[k][1], pf.ruhe[k][2], o);
      pf.pts[k][0] = o.x; pf.pts[k][1] = o.y; pf.pts[k][2] = o.z;
      if (k) t += Math.sqrt(Math.pow(pf.pts[k][0] - pf.pts[k - 1][0], 2) + Math.pow(pf.pts[k][1] - pf.pts[k - 1][1], 2) + Math.pow(pf.pts[k][2] - pf.pts[k - 1][2], 2));
      pf.L[k] = t;
    }
    pf.gesamt = t;
  });
}
function luftSetzen(m, punkte) {
  var Lf = A3.luft, f = m.fluss, absF = Math.abs(f), stroemt = absF > 12, farbe = f > 0 ? Lf.ein : Lf.aus;
  punkte.forEach(function (p, k) {
    var pf = Lf.pfade[k], rest = p.ph * pf.gesamt, j = 1;
    while (j < pf.L.length - 1 && rest > pf.L[j]) j++;
    var d = pf.L[j] - pf.L[j - 1], u = d > 0 ? clamp01((rest - pf.L[j - 1]) / d) : 0, a = pf.pts[j - 1], b = pf.pts[j];
    Lf.M.makeTranslation(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u);
    Lf.im.setMatrixAt(k, Lf.M);
    var rand = Math.min(1, Math.min(p.ph, 1 - p.ph) * 7);
    Lf.alpha.array[k] = stroemt ? rand * Math.min(1, absF / 220) : 0.12;
    Lf.farbe.array[k * 3] = farbe.r; Lf.farbe.array[k * 3 + 1] = farbe.g; Lf.farbe.array[k * 3 + 2] = farbe.b;
  });
  Lf.im.instanceMatrix.needsUpdate = true; Lf.alpha.needsUpdate = true; Lf.farbe.needsUpdate = true;
}

/* Anker der Beschriftung folgen den bewegten Strukturen: je Anker der naechste Eckpunkt der Struktur (Ruhelage); die Verschiebung dieses Punktes
   (aktuell minus Ruhe) wird beim Legen der Beschriftung auf den Anker addiert */
var AV = new THREE.Vector3(), AW = new THREE.Vector3();
function ankerVerschiebung(dd, out) {
  var e = A3.rest.get(dd.m), j = dd.vi * 3, a;
  if (e.m0) {
    dd.m.updateMatrix();
    AV.set(e.pos0[j], e.pos0[j + 1], e.pos0[j + 2]); AW.copy(AV);
    AV.applyMatrix4(dd.m.matrix); AW.applyMatrix4(e.m0);
    out.add(AV.sub(AW));
  } else {
    a = dd.m.geometry.attributes.position.array;
    out.x += a[j] - e.pos0[j]; out.y += a[j + 1] - e.pos0[j + 1]; out.z += a[j + 2] - e.pos0[j + 2];
  }
}
function ankerKoppeln() {
  [KAND, KAND3].forEach(function (K) {
    Object.keys(K).forEach(function (id) {
      var ms = STRUCT[id].meshes.filter(function (m) { return A3.rest.has(m); });
      if (!ms.length) return;
      K[id].forEach(function (v) {
        var best = 1e18, x = v.x - root.position.x, y = v.y - root.position.y, z = v.z - root.position.z;   /* Szene -> Koordinaten der Meshes */
        ms.forEach(function (m) {
          var p = A3.rest.get(m).pos0, i, d;
          for (i = 0; i < p.length; i += 3) {
            d = (p[i] - x) * (p[i] - x) + (p[i + 1] - y) * (p[i + 1] - y) + (p[i + 2] - z) * (p[i + 2] - z);
            if (d < best) { best = d; v._dyn = { m: m, vi: i / 3 }; }
          }
        });
      });
    });
  });
}

/* Ruhelagen speichern, Teilchen bauen, Anker koppeln (am Ende des Aufbaus) */
function atmungVorbereiten() {
  var festhalten = function (m, art) {
    var g = m.geometry, e = { m: m, pos0: new Float32Array(g.attributes.position.array) };
    if (art === 'feld') e.nor0 = new Float32Array(g.attributes.normal.array);
    A3.rest.set(m, e);
    m.frustumCulled = false;
    g.computeBoundingSphere(); g.boundingSphere.radius += 10;   /* Treffer beim Antippen: Huelle gross genug fuer die Verschiebung */
    return e;
  };
  LAPPEN.concat(['pleura', 'hauptbronchien', 'bronchien', 'lungenarterien', 'lungenvenen']).forEach(function (sid) {
    STRUCT[sid].meshes.forEach(function (m) {
      var e = festhalten(m, 'feld');
      if (sid === 'pleura') e.rand = 0.01; else if (LAPPEN.indexOf(sid) >= 0) e.rand = 0.45;
      else if (HZ.an && (sid === 'lungenarterien' || sid === 'lungenvenen')) { e.wt = new Float32Array(e.pos0.length / 3); for (var vi = 0; vi < e.wt.length; vi++) e.wt[vi] = gefGewicht(e.pos0[vi * 3], e.pos0[vi * 3 + 1], e.pos0[vi * 3 + 2]); }   /* Abstand zur Rippenmitte jenseits von RIP_R (Rippenfell liegt an, Lappen 0,45 cm dahinter) */
      A3.feld.push(e);
    });
  });
  var be = A3.rest.get(STRUCT.bronchien.meshes[0]);   /* Segmentbronchien: Ruhelage und Ringmitten, der Radius laesst sich damit verstellen (Abschnitt 7c) */
  be.zen = STRUCT.bronchien.meshes[0].geometry.userData.zentren; be.roh = new Float32Array(be.pos0); A3.bronch = be;
  bronchienRadius();
  A3.zwerch = festhalten(STRUCT.zwerchfell.meshes[0], 'zwerchfell');
  [-1, 1].forEach(function (sd) {
    var i;
    for (i = 0; i < 12; i++) A3.rest.set(RIPPE_MESH[sd][i], { m: RIPPE_MESH[sd][i], pos0: new Float32Array(RIPPE_MESH[sd][i].geometry.attributes.position.array), m0: new THREE.Matrix4() });   /* Rippen bewegen sich als Ganzes (Matrix), m0 = Ruhelage */
    for (i = 0; i < 11; i++) festhalten(BAENDER[sd][i], 'band');
  });
  KNORPEL.forEach(function (kn) {
    var e = festhalten(kn.m, 'knorpel'), p = e.pos0, k, c = [kn.ziel[0] - kn.e[0], kn.ziel[1] - kn.e[1], kn.ziel[2] - kn.e[2]], L2 = c[0] * c[0] + c[1] * c[1] + c[2] * c[2];
    e.lam = new Float32Array(p.length / 3);
    for (k = 0; k < e.lam.length; k++) e.lam[k] = clamp01(((p[k * 3] - kn.e[0]) * c[0] + (p[k * 3 + 1] - kn.e[1]) * c[1] + (p[k * 3 + 2] - kn.e[2]) * c[2]) / L2);
  });
  var so = STRUCT.brustbein.meshes[0];
  A3.sternum = { m: so, p0: [so.position.x, so.position.y, so.position.z] };
  so.updateMatrix();
  A3.rest.set(so, { m: so, pos0: new Float32Array(so.geometry.attributes.position.array), m0: so.matrix.clone() });
  A3.luft = luftBauen(atmen.punkte);
  ankerKoppeln();
  rippenLook();
  A3.bereit = true; A3.neu = true;
}
/* Anschluss an die Atmung: am Ende von zeichne (Abschnitt 6) mit dem Zustand S, den Werten m der Physik und den Luftpunkten */
function atmung3D(S, m, dt, punkte) {
  A3.S0 = S;
  if (!A3.bereit) return;
  atmungForm();
  var pStaerke = Math.min(1, (Math.abs(m.pPleura) - 5) / 3);
  MAT.pleura.opacity = PLEURA_3D * (0.22 + 0.40 * pStaerke);   /* Rippenfell: Deckkraft aus der Formel des Schemas (dort ein Saum hinter der Lunge), in 3D als Huelle vor der Lunge gedaempft */
  luftSetzen(m, punkte);
}
/* Form von Lunge, Zwerchfell und Brustkorb aus den Muskeln S0 des Schemas plus der Ueberblaehung bei verengten Atemwegen (SZW.trap, Abschnitt 7c: wie eine Einatmung
   mit d = i = trap, additiv); nur bei geaenderten Werten neu gerechnet. Auch ohne Takt des Schemas (Pause) nach einem Wechsel des Krankheitsbildes gerufen. */
function atmungForm() {
  var S0 = A3.S0;
  if (!A3.bereit || !S0) return;
  var S = A3.S = { d: S0.d + SZW.trap, i: S0.i + SZW.trap };
  var sig = S.d.toFixed(3) + '|' + S.i.toFixed(3);
  if (sig !== A3.sig || A3.neu) {
    A3.sig = sig; A3.neu = false;
    A3.q = Math.round(S.d * 25) + '|' + Math.round(S.i * 25);   /* grob: die Beschriftung legt sich nur bei merklicher Aenderung neu */
    A3.dA = 62 * S.d / KUPPEL_PX; A3.dB = 13 * S.i * PX_CM; A3.sinW = Math.sin(RIPPE_WINKEL * S.i);
    brustkorbAnwenden();   /* zuerst die Rippen (gedrehte Stuetzpunkte), dann die Lunge, die ihnen ausweicht */
    A3.feld.forEach(lungeAnwenden);
    kollisionGitter();
    A3.feld.forEach(function (e) { if (e.rand !== undefined) kollisionAnwenden(e); });
    zwerchfellAnwenden();
    luftPfade();
  }
}
atmen.anschliessen(atmung3D, atmungWahl);

/* Knoepfe der Werkzeugleiste: Pause/Weiter der Atmung und Schema (Muster wie bei der Niere bzw. beim Nephron) */
var atmenLaeuft = true;
$('bPlay').onclick = function () {
  atmenLaeuft = !atmenLaeuft;
  atmen.pause(!atmenLaeuft);
  this.textContent = atmenLaeuft ? 'Pause' : 'Abspielen';
  this.classList.toggle('on', atmenLaeuft);
};
/* Schema: Panel rechts (Desktop) bzw. oben (Handy); die 3D-Ansicht wird dabei ausgeblendet und nicht gezeichnet, die Beschriftung ebenso.
   Handy: Hoehe der Werkzeugleiste als --wz (das Schema endet darueber); aendert sich die Leiste (Umbruch), misst der Beobachter neu */
var schemaOn = false, schemaWz = null;
/* Hinweis und Abzeichen im Schema: Skala = Breite des Bildes / 958 px (Buehnenbreite des Originals bei 1280 x 800), Variable --sk am Bild */
var BUEHNE_B = 958;
function schemaSkala() {
  var b = $('loBild'), w = b && b.clientWidth;
  if (w) b.style.setProperty('--sk', (w / BUEHNE_B).toFixed(4));
}
function schemaMessen() {
  schemaSkala();
  if (!window.matchMedia('(max-width:1000px)').matches) { schemaWzLoeschen(); return; }   /* Desktop: nichts setzen */
  document.body.style.setProperty('--wz', Math.ceil($('tools').getBoundingClientRect().height) + 'px');
}
function schemaWzLoeschen() {
  document.body.style.removeProperty('--wz');
  if (!document.body.getAttribute('style')) document.body.removeAttribute('style');
}
function schemaWzEnde() {
  if (schemaWz) { schemaWz.disconnect(); schemaWz = null; }
  schemaWzLoeschen();
}
function setSchema(on) {
  if (on) lupeClose();   /* Schema und Lupe schliessen sich gegenseitig: die Lupe wuerde das Schema verdecken */
  schemaOn = on;
  $('bSchema').classList.toggle('on', on);
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  if (on) {
    schemaMessen();
    if (window.ResizeObserver && !schemaWz) { schemaWz = new ResizeObserver(schemaMessen); schemaWz.observe($('tools')); schemaWz.observe($('loBild')); }
  } else schemaWzEnde();
  canvas.style.visibility = on ? 'hidden' : '';
  lv++;
}
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };

/* =====================================================================
   6b. Lupe: Querschnitt durch die Brustwand mit dem Pleuraspalt (Knopf "Lupe" in der Zeile "Ansicht", Panel #lupe, Canvas #lpCv)
   Von aussen nach innen (links nach rechts): Haut und Unterhaut, Rippe (Querschnitt) mit Zwischenrippenmuskel, Rippenfell (Pleura parietalis),
   Pleuraspalt mit Fluessigkeitsfilm, Lungenfell (Pleura visceralis), Lungengewebe mit angedeuteten Alveolen. Die Zeichnung ist rein berechnet, ohne Zufall:
   Brustwand und Lunge verschieben sich gemeinsam mit den Muskeln des Schemas (atmen.lupeWerte: S.d, S.i; Einatmung = nach aussen), der Spalt bleibt gleich
   schmal; die Zahl im Spalt ist m.pPleura der Thorax-Physik. Schalter "Pneumothorax": Luft fuellt den Spalt, die Lunge loest sich und zieht sich zusammen
   (weich ueber ca. 1,5 s), die Lunge folgt der Brustwand nicht mehr, der Druck ist 0. Das gilt nur fuer die Lupe: 3D-Modell, Thorax-Simulation und Schema
   bleiben unveraendert. Schema und Lupe schliessen sich gegenseitig (die Lupe wuerde das Schema verdecken).
   ===================================================================== */
var LUPE = { open: false, pt: 0, ptZiel: 0, ctx: null, dpr: 1, W: 340, H: 236, zeit: 0 };   /* pt: 0 = normal ... 1 = Pneumothorax (weich) */
var LU_XW = 118, LU_GAP = 6;                      /* Lage des Rippenfells (Ruhe) und Breite des Spalts in Bildpunkten */
var LU_TEXT = 'Zwischen Rippenfell und Lungenfell liegt nur ein hauchdünner Flüssigkeitsfilm. Darin herrscht ständig ein Unterdruck. Wie zwei nasse Glasplatten gleiten die Blätter aneinander, lassen sich aber nicht trennen: Hebt sich der Brustkorb, wird die Lunge mitgezogen.';
var LU_PTX = 'Gelangt Luft in den Pleuraspalt – durch eine Verletzung oder eine geplatzte Blase an der Lunge –, ist der Unterdruck weg. Die Lunge folgt dem Brustkorb nicht mehr und fällt in sich zusammen. Typisch: plötzlicher Brustschmerz und Atemnot.';
var LU_SCHALTER = '„Pneumothorax“ – Luft dringt in den Spalt, der Unterdruck geht verloren, die Lunge löst sich und fällt zusammen.';
function luFmt(p) { return p.toFixed(1).replace('.', ',').replace('-', '−'); }
function luMix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function luRgb(c, al) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + al + ')'; }
function luLabel(c, text, x, y, rechts, al) {
  c.font = '9.5px system-ui, sans-serif'; c.textBaseline = 'alphabetic'; c.textAlign = rechts ? 'right' : 'left';
  var w = c.measureText(text).width, x0 = rechts ? x - w : x;
  c.globalAlpha = al === undefined ? 1 : al;
  c.fillStyle = 'rgba(12,26,32,0.82)'; c.fillRect(x0 - 3, y - 9, w + 6, 12);
  c.fillStyle = '#E7EFF0'; c.fillText(text, x, y);
  c.globalAlpha = 1;
}
function luLeiter(c, x1, y1, x2, y2) {
  c.strokeStyle = 'rgba(231,239,240,0.55)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
/* Oberflaeche der Lunge bei Hoehe y: Basis xl, beim Pneumothorax woelbt sich der Rand (oben und unten weiter weg von der Wand) */
function luOberflaeche(y, xl, pt) { var u = (y - 118) / 118; return xl + pt * 44 * u * u; }
function luHash(n, k) { var q = Math.sin(n * 127.1 + k * 311.7) * 43758.5453; return q - Math.floor(q); }
function lupeDraw() {
  var c = LUPE.ctx; if (!c) return;
  var W = LUPE.W, H = LUPE.H, w = atmen.lupeWerte(), p = LUPE.pt, y, i, j;
  var e = Math.max(-1, Math.min(1, 0.5 * w.d + 0.5 * w.i)), sh = -9 * e;   /* Einatmung (e > 0): Brustwand und Lunge nach aussen = nach links */
  var xW = LU_XW + sh, xV = xW + LU_GAP, xl = xV + (192 - xV) * p;        /* Lungenrand: folgt der Wand, beim Pneumothorax bleibt er zusammengezogen stehen */
  c.setTransform(LUPE.dpr, 0, 0, LUPE.dpr, 0, 0);
  c.fillStyle = '#0C1A20'; c.fillRect(0, 0, W, H);
  /* feste Bezugslinie: daran sieht man die Verschiebung */
  c.setLineDash([3, 4]); c.strokeStyle = 'rgba(231,239,240,0.28)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(LU_XW + 0.5, 0); c.lineTo(LU_XW + 0.5, H); c.stroke(); c.setLineDash([]);
  /* Brustwand (verschoben mit sh) */
  c.save(); c.translate(sh, 0);
  c.fillStyle = '#C99A7A'; c.fillRect(-40, 0, 54, H);                                   /* Haut */
  c.fillStyle = '#E3C77A'; c.fillRect(14, 0, 20, H);                                    /* Unterhaut (Fett) */
  c.fillStyle = '#8E4545'; c.fillRect(34, 0, LU_XW - 34, H);                            /* Zwischenrippenmuskel */
  c.save(); c.beginPath(); c.rect(34, 0, LU_XW - 34, H); c.clip();
  c.strokeStyle = 'rgba(255,200,200,0.20)'; c.lineWidth = 1;
  for (i = -H; i < H; i += 7) { c.beginPath(); c.moveTo(34, i + 40); c.lineTo(LU_XW, i + 40 + 46); c.stroke(); }
  c.restore();
  [50, 186].forEach(function (ry) {                                                      /* Rippen im Querschnitt */
    c.beginPath(); c.ellipse(72, ry, 22, 26, 0, 0, 6.2832); c.fillStyle = '#EFE7D2'; c.fill(); c.strokeStyle = '#9C8F73'; c.lineWidth = 1.2; c.stroke();
    c.beginPath(); c.ellipse(72, ry, 12, 16, 0, 0, 6.2832); c.fillStyle = '#D8A58A'; c.fill();
  });
  c.strokeStyle = '#1B7F9E'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(LU_XW, 0); c.lineTo(LU_XW, H); c.stroke();   /* Rippenfell */
  c.restore();
  /* Spalt: Fluessigkeitsfilm (normal) bzw. Luft (Pneumothorax), bis zur Lungenoberflaeche */
  var YS = [];                                                                          /* Stuetzstellen der Lungenoberflaeche, mit Ober- und Unterkante */
  for (y = 0; y < H; y += 8) YS.push(y);
  YS.push(H);
  function flaeche(x0, spaltBis) {
    c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0, H);
    for (i = YS.length - 1; i >= 0; i--) c.lineTo(spaltBis(YS[i]), YS[i]);
    c.closePath();
  }
  var surf = function (yy) { return luOberflaeche(yy, xl, p); };
  flaeche(xW + 1.2, function (yy) { return surf(yy) - 0.9; });
  c.fillStyle = luRgb([143, 211, 240], 0.95 * (1 - p)); c.fill();
  c.fillStyle = luRgb([222, 229, 231], 0.92 * p); c.fill();
  if (p > 0.05) {                                                                        /* feine Luftblaeschen */
    c.strokeStyle = 'rgba(255,255,255,' + (0.5 * p).toFixed(3) + ')'; c.lineWidth = 0.8;
    for (i = 0; i < 16; i++) {
      var by = 8 + 220 * luHash(i, 1), bx0 = xW + 5, bx1 = surf(by) - 5;
      if (bx1 - bx0 < 6) continue;
      c.beginPath(); c.arc(bx0 + (bx1 - bx0) * luHash(i, 2), by, 1.6 + 2.4 * luHash(i, 3), 0, 6.2832); c.stroke();
    }
  }
  /* Lungengewebe: Rand folgt dem Lungenfell */
  c.beginPath(); c.moveTo(W + 4, 0);
  for (i = 0; i < YS.length; i++) c.lineTo(surf(YS[i]) + 0.9, YS[i]);
  c.lineTo(W + 4, H); c.closePath();
  var gewebe = luMix([201, 142, 148], [150, 96, 106], p);
  c.fillStyle = luRgb(gewebe, 0.60); c.fill();
  /* angedeutete Alveolen: waagerechtes Sechseckraster, am Lungenrand verankert; Einatmung weitet, Pneumothorax zieht sie zusammen */
  c.save(); c.clip();
  var r = 8.2 + 1.0 * e - 3.4 * p, dx = 2 * r + 1.6, dy = dx * 0.866;
  c.fillStyle = 'rgba(30,14,20,' + (0.30 + 0.12 * p).toFixed(3) + ')'; c.strokeStyle = 'rgba(247,200,204,0.55)'; c.lineWidth = 1;
  for (j = 0; j * dy < H + dy; j++) {
    var yy = j * dy + 4;
    for (i = 0; i < 40; i++) {
      var xx = xl + 3 + r + i * dx + (j % 2 ? dx / 2 : 0);
      if (xx > W + r) break;
      if (xx - r < surf(yy) + 3) continue;
      c.beginPath(); c.arc(xx, yy, r, 0, 6.2832); c.fill(); c.stroke();
    }
  }
  c.restore();
  /* Lungenfell */
  c.beginPath();
  for (i = 0; i < YS.length; i++) { if (i === 0) c.moveTo(surf(0), 0); else c.lineTo(surf(YS[i]), YS[i]); }
  c.strokeStyle = '#D9959B'; c.lineWidth = 1.9; c.stroke();
  /* Unterdruck: Pfeil von der Lunge zur Wand (nur solange der Spalt dicht ist) */
  var ua = 1 - p;
  if (ua > 0.02) {
    var ax = xV + 52, ay = 118, lang = 20 + 2.5 * Math.max(0, -w.pPleura - 5);
    c.globalAlpha = ua; c.strokeStyle = '#E0A94A'; c.fillStyle = '#E0A94A'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax - lang, ay); c.stroke();
    c.beginPath(); c.moveTo(ax - lang - 7, ay); c.lineTo(ax - lang + 1, ay - 5); c.lineTo(ax - lang + 1, ay + 5); c.closePath(); c.fill();
    c.globalAlpha = 1;
    luLabel(c, 'Unterdruck', ax - lang - 7, ay - 9, false, ua);
  }
  /* Beschriftungen (feste Plaetze, Fuehrungslinien zu den bewegten Teilen) */
  luLabel(c, 'Haut', 5, 13, false);
  luLabel(c, 'Rippe', 50, 12, false);
  luLabel(c, 'Zwischenrippen-', 36, 114, false); luLabel(c, 'muskel', 36, 126, false);
  luLeiter(c, 150, 24, xW, 24); luLabel(c, 'Rippenfell (Pleura parietalis)', 153, 28, false);
  luLeiter(c, 150, 46, xW + LU_GAP / 2 + 0.5, 46); luLabel(c, 'Pleuraspalt mit Flüssigkeitsfilm', 153, 50, false);
  luLeiter(c, 150, 68, surf(68), 68); luLabel(c, 'Lungenfell (Pleura visceralis)', 153, 72, false);
  luLabel(c, 'Lungengewebe (Alveolen)', W - 4, 184, true);
  if (p > 0.3) luLabel(c, 'Luft', xW + 8, 138, false, p);
  /* Druck im Spalt (aus der Thorax-Physik); beim Pneumothorax wie ausserhalb */
  var txt = p >= 0.99 ? '0 cmH₂O (wie außen)' : luFmt(w.pPleura * (1 - p)) + ' cmH₂O';
  c.font = '9px ui-monospace, monospace'; c.textAlign = 'right'; c.textBaseline = 'alphabetic'; c.fillStyle = '#8DA7B1';
  c.fillStyle = 'rgba(12,26,32,0.82)'; c.fillRect(W - 6 - c.measureText('Druck im Spalt').width - 3, 197, c.measureText('Druck im Spalt').width + 6, 12); c.fillStyle = '#8DA7B1';
  c.fillText('Druck im Spalt', W - 6, 206);
  c.font = 'bold 13px ui-monospace, monospace';
  var tw = c.measureText(txt).width;
  c.fillStyle = 'rgba(12,26,32,0.82)'; c.fillRect(W - 6 - tw - 4, 211, tw + 8, 19);
  c.fillStyle = p > 0.5 ? '#F08A7E' : '#7FD0EA'; c.fillText(txt, W - 6, 226);
  luLabel(c, 'feste Linie', LU_XW + 7, 231, false);
}
function lupeText() {
  $('lpText').innerHTML = '<p>' + LU_TEXT + '</p>' + (LUPE.ptZiel ? '<p class="lp-note">' + LU_PTX + '</p>' : '<p class="lp-hint">' + LU_SCHALTER + '</p>');
  $('lpLegLuft').style.display = LUPE.ptZiel ? '' : 'none';
}
function lupePt(an) {
  LUPE.ptZiel = an ? 1 : 0;
  Array.prototype.forEach.call($('lpChips').children, function (b) { b.classList.toggle('on', b.getAttribute('data-pt') === String(LUPE.ptZiel)); });
  lupeText();
}
function lupeOeffnen() {
  if (fz || abgebaut) return;
  if (schemaOn) setSchema(false);
  if (quiz) quizEnd();
  closeCard(); setSelected(null);
  szWeichen();
  if (!LUPE.open) { LUPE.pt = 0; lupePt(false); }   /* die Lupe beginnt immer im Normalzustand */
  LUPE.open = true; $('lupe').classList.add('show'); $('bLupe').classList.add('on');
  kartenLage();
}
function lupeClose() {
  if (!LUPE.open) return;
  LUPE.open = false; $('lupe').classList.remove('show'); $('bLupe').classList.remove('on');
  kartenLage();
}
(function lupeBauen() {
  LUPE.dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cv = $('lpCv'); cv.width = LUPE.W * LUPE.dpr; cv.height = LUPE.H * LUPE.dpr;
  try { LUPE.ctx = cv.getContext('2d'); } catch (e) { LUPE.ctx = null; }
  Array.prototype.forEach.call($('lpChips').children, function (b) { b.addEventListener('click', function () { lupePt(b.getAttribute('data-pt') === '1'); }); });
  $('bLupeX').addEventListener('click', lupeClose);
  $('bLupe').addEventListener('click', function () { if (LUPE.open) lupeClose(); else lupeOeffnen(); });
  lupeText();
})();
function lupeTick(now) {   /* Pneumothorax weich ueberblenden (ca. 1,5 s) und neu zeichnen */
  if (!LUPE.open) { LUPE.zeit = 0; return; }
  var dt = LUPE.zeit ? Math.min(0.05, (now - LUPE.zeit) / 1000) : 0.016; LUPE.zeit = now;
  var dz = LUPE.ptZiel - LUPE.pt;
  if (dz) { LUPE.pt += dz * (1 - Math.exp(-dt * 3)); if (Math.abs(LUPE.ptZiel - LUPE.pt) < 0.003) LUPE.pt = LUPE.ptZiel; }
  lupeDraw();
}

/* =====================================================================
   7c. Krankheitsbilder und Medikamente in 3D: Obstruktion o (Summe der Anteile * Wert des Eintrags, weich ueberblendet; asthma 0,85, copd 0,60, azidose 0,25, Salbutamol 0,25,
   Sauerstoff 0,60, sonst 0) verengt die Segmentbronchien (Radius * (1 - 0,5 * o), aus den Ringmitten der Ruhelage) und ueberblaeht die Lunge: zusaetzliche Grundverformung
   wie eine Einatmung mit d = i = 0,35 * o (im Alveolen-Modell "trap = 0,35 * Obstruktion"), additiv zur Atmung des Schemas (atmungForm). Sonst aendert sich nichts.
   ===================================================================== */
function bronchienRadius() {
  var e = A3.bronch;
  if (!e) return;
  var f = 1 - 0.5 * SZW.o, P = e.pos0, R = e.roh, Z = e.zen, i;
  for (i = 0; i < P.length; i++) P[i] = Z[i] + (R[i] - Z[i]) * f;
}
function szenarioWirkung() {
  var o = 0;
  SZ_DATEN.forEach(function (sc) { o += SZ.anteil[sc.id] * sc.modell.o; });
  if (o === SZW.o) return;
  SZW.o = o; SZW.trap = 0.35 * o;
  if (!A3.bereit) return;
  bronchienRadius();
  A3.neu = true; atmungForm();   /* neu rechnen, auch wenn die Atmung pausiert */
}

/* =====================================================================
   7b. Kamerafahrt zur Alveole (Infokarte "Alveole hier ansehen" bei den Lungenlappen, Knopf "Alveole"): Der Brustkorb und alles Uebrige blenden aus, die Lappen werden in
   der ersten Haelfte zu Glas (danach noch blasser), der Bronchialbaum bleibt und fuehrt zur Stelle. Dort waechst in der zweiten Haelfte das Alveolarsaeckchen aus der Form
   des Alveolen-Moduls (organ.form) an den Endast des Bronchialbaums; es erscheint vergroessert (Massstab AL_S: der Bronchiolus des Saeckchens hat den Radius des Endasts).
   Die Lunge dreht sich dabei (alle Achsen, um die Mitte des Saeckchens), bis der Endast senkrecht nach unten zeigt: dann gilt in Weltachsen dieselbe Lage wie im Alveolen-Modell,
   und die Kamera landet in dessen Startansicht (umgerechnet in Welt-Koordinaten); dann wird die Adresse gesetzt. Beim Zurueckkommen (umg.von === 'alveole') steht die Lunge
   gedreht im Nahbild und faehrt nach 450 ms zur Uebersicht zurueck (Drehung zurueck, Saeckchen blendet aus, Lappen werden wieder deckend).
   Die Atmung steht waehrend der Fahrt (Pause), damit der Endast an seinem Platz bleibt.
   ===================================================================== */
var AL_S = 0.12 / 0.9;                    /* Massstab (cm je Einheit des Alveolen-Modells): Radius des Endasts (0,12 cm) durch Radius des Bronchiolus (0,9) */
var AL_STANDARD = [-5.5, 118.5, -5.0];     /* Standardstelle (Knopf "Alveole"): der naechste Endast im rechten Unterlappen, vorn-seitlich (Koerper-Koordinaten, cm) */
var AL_START = { theta: 0, phi: PI / 2, dist: 26, target: [0, 1.6, 0] };   /* Ersatz fuer die Startansicht des Alveolen-Moduls, falls dessen Skript fehlt */
var AL_LOBE_ENDE = 0.08;                  /* Deckkraft der Lappen am Ende der Fahrt (Glas: GLAS) */
var alWahl = null, alLetzte = null;       /* Endast (Index in BAUM.endpunkte) zum angetippten Punkt; zuletzt gewaehlter (fuer die Rueckfahrt; nur im Speicher der Seite) */
var alG = null, alFertig = false, alWartet = false, sackP = null;   /* Teile des Saeckchens (Geometrien im Raum des Alveolen-Modells), fertig, Wartezeit nach dem Klick, Versprechen */
var AL = null;                            /* Lage der aktuellen Fahrt: { idx, pc (Mitte des Saeckchens, Raum der Lunge), qa (Saeckchen -> Lunge), qEnd (Lunge -> Welt am Ende) } */
var alGruppe = null, alM = [];            /* Gruppe des Saeckchens (Kind von root) und seine Materialien [{ m, op }] */
var fz = null;                            /* laufende Fahrt */
var sstep = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
var ROOT0 = V(-M[0], -M[1], -M[2]), Q_ID = new THREE.Quaternion();
/* Punkt der Ruhelage -> Lage bei der gerade eingestellten Atmung (wie die Atemwege) */
function verschoben(p) { var o = { x: 0, y: 0, z: 0, a: 1, bx: 0, by: 1, bz: 0 }; lungeFeld(p[0], p[1], p[2], o); return [o.x, o.y, o.z]; }
/* naechster Endast im Lappen id zum Punkt punkt (Vector3 oder [x, y, z], Raum der Szene); ohne Punkt der am weitesten vorn gelegene. null, wenn es keinen gibt */
function alveoleWahl(id, punkt) {
  if (!BAUM || !BAUM.endpunkte) return null;
  var q = punkt ? root.worldToLocal(punkt.isVector3 ? punkt.clone() : V(punkt[0], punkt[1], punkt[2])) : null, best = null, bd = 1e9;
  BAUM.endpunkte.forEach(function (e, i) {
    if (e.lappen !== id) return;
    var v = verschoben(e.p), d = q ? (v[0] - q.x) * (v[0] - q.x) + (v[1] - q.y) * (v[1] - q.y) + (v[2] - q.z) * (v[2] - q.z) : -v[2];
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
function alStandard() {   /* Index des Endasts im rechten Unterlappen, der AL_STANDARD am naechsten liegt (Ruhelage) */
  var best = null, bd = 1e9;
  BAUM.endpunkte.forEach(function (e, i) {
    if (e.lappen !== 'unterlappenR') return;
    var d = Math.pow(e.p[0] - AL_STANDARD[0], 2) + Math.pow(e.p[1] - AL_STANDARD[1], 2) + Math.pow(e.p[2] - AL_STANDARD[2], 2);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
/* Das Saeckchen im Raum des Alveolen-Modells als Geometrien (Wand mit Farben, Kapillarnetz, Arterie, Vene), einmal je Sitzung; ohne Modul oder bei Fehler null */
async function alveoleNetze() {
  try {
    var am = await alvP; if (abgebaut || !am || !am.form) { alFertig = true; return null; }
    var af = am.form, H = klein ? 0.12 : 0.09, F = af.feld(H), G = S.makeGrid(af.gitter, H);
    var pause = function () { return new Promise(function (r) { setTimeout(r, 0); }); };   /* zwischen den Schritten ein Bild zeichnen lassen (je Schritt unter einer halben Sekunde) */
    await pause(); if (abgebaut) return null;
    var T = await S.evalFeld(G, F.wand); if (abgebaut) return null;
    await pause(); if (abgebaut) return null;
    var g = S.geometrie(G, T), P = g.attributes.position.array, col = new Float32Array(P.length), i, c;
    for (i = 0; i < P.length; i += 3) { c = F.farbe(P[i], P[i + 1], P[i + 2]); col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    await pause(); if (abgebaut) return null;
    var kn = af.kapillaren(F), BLAU = srgb(0x3F63B5), ROT = srgb(0xC8372D);
    var gk = rohre(kn.linien.map(function (l) { return { pts: l.pts, r0: l.r, r1: l.r, seiten: 5, segmente: Math.max(3, l.pts.length - 1) }; })), pk = gk.attributes.position, ck = new Float32Array(pk.count * 3);
    for (i = 0; i < pk.count; i++) {   /* Farbverlauf nach x: blau (Arterienseite, links) nach rot (Venenseite, rechts) */
      var t = Math.min(1, Math.max(0, (pk.getX(i) + 2.2) / 4.4)); t = t * t * (3 - 2 * t);
      ck[i * 3] = BLAU.r + (ROT.r - BLAU.r) * t; ck[i * 3 + 1] = BLAU.g + (ROT.g - BLAU.g) * t; ck[i * 3 + 2] = BLAU.b + (ROT.b - BLAU.b) * t;
    }
    gk.setAttribute('color', new THREE.BufferAttribute(ck, 3));
    alG = { wand: g, kap: gk, art: rohre(af.gefaesse(-1, kn.punkte)), ven: rohre(af.gefaesse(1, kn.punkte)) };
  } catch (e) { console.warn(e && e.message || e); alG = null; }
  alFertig = true;
  return alG;
}
/* Lage des Saeckchens am Endast idx (bei der gerade eingestellten Atmung): das Ende des Bronchiolus (Alveolen-Modell y = Y_OBEN0) liegt auf dem Ende des Endasts, die
   Achse des Saeckchens (Modell -y) zeigt in Richtung des Endasts, die Vorderseite (Modell +z) moeglichst nach vorn (+z der Lunge); AL.qEnd dreht das zurueck */
function alveoleLage(idx) {
  var ep = BAUM.endpunkte[idx], ast = BAUM.filter(function (a) { return a.pts[a.pts.length - 1] === ep.p; })[0];
  var e = V.apply(null, verschoben(ep.p)), m = V.apply(null, verschoben(ast.pts[1]));
  var d = e.clone().sub(m).normalize(), vorn = V(0, 0, 1);
  if (Math.abs(d.z) > 0.95) vorn = V(1, 0, 0);
  var az = vorn.sub(d.clone().multiplyScalar(vorn.dot(d))).normalize(), ay = d.clone().negate(), ax = new THREE.Vector3().crossVectors(ay, az);
  var qa = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, ay, az));
  var yO = (Kern.Organe.alveole && Kern.Organe.alveole.form ? Kern.Organe.alveole.form.yOben : 9.6);
  return { idx: idx, pc: e.clone().addScaledVector(d, AL_S * yO), qa: qa, qEnd: qa.clone().invert() };
}
/* Startansicht des Alveolen-Modells in Welt-Koordinaten: gleiche Blickrichtung, Abstand und Ziel mit dem Massstab und der Lage des Saeckchens umgerechnet, Versatz des Bildbereichs wie im Modell */
function alveoleZiel(w, h) {
  var am = Kern.Organe && Kern.Organe.alveole, st = am && am.start ? am.start(w, h) : null, r = bereich(w, h);
  if (!st) st = Object.assign({ versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] }, AL_START);
  return { theta: st.theta, phi: st.phi, dist: AL_S * st.dist, target: ROOT0.clone().add(AL.pc).addScaledVector(V(st.target[0], st.target[1], st.target[2]), AL_S), versatz: st.versatz };
}
/* Die ganze Lunge um die Mitte des Saeckchens drehen: f = 0 ohne Drehung, 1 mit dem Endast senkrecht (die Mitte bleibt an ihrem Platz) */
function alDrehung(f) {
  root.quaternion.copy(Q_ID).slerp(AL.qEnd, f);
  root.position.copy(ROOT0).add(AL.pc).sub(V(AL.pc.x, AL.pc.y, AL.pc.z).applyQuaternion(root.quaternion));
}
/* Das Saeckchen in der Lunge (unsichtbar bis zum Einblenden); ohne Teile bleibt die Gruppe leer */
function alBauen() {
  alGruppe = new THREE.Group(); alGruppe.name = 'Alveole'; alGruppe.visible = false;
  alGruppe.position.copy(AL.pc); alGruppe.quaternion.copy(AL.qa); alGruppe.scale.setScalar(AL_S); root.add(alGruppe);
  alM = [];
  if (!alG) return;
  var teile = [['wand', mat(0xffffff, { vc: true, rough: 0.5, coat: 0.3, coatRough: 0.45 }), 'Alveolarsäckchen'], ['kap', mat(0xffffff, { vc: true, rough: 0.45, coat: 0.2 }), 'Kapillarnetz'],
    ['art', mat(0x3F63B5, { rough: 0.4, coat: 0.3 }), 'Arteriole'], ['ven', mat(0xC8372D, { rough: 0.4, coat: 0.3 }), 'Venole']];
  teile.forEach(function (q) {
    q[1].transparent = true; q[1].opacity = 0; alM.push({ m: q[1], op: 1 });
    var m = new THREE.Mesh(alG[q[0]], q[1]); m.name = q[2]; m.renderOrder = 3; alGruppe.add(m);
  });
}
function alDeckkraft(f) {   /* Deckkraft des Saeckchens 0..1 */
  alM.forEach(function (e) { e.m.opacity = e.op * f; });
  alGruppe.visible = f > 0.002;
}
function alAbbau() {   /* Saeckchen entsorgen (die Geometrien bleiben im Speicher), Lunge in die Ausgangslage */
  if (alGruppe) { root.remove(alGruppe); alM.forEach(function (e) { e.m.dispose(); }); }
  alGruppe = null; alM = [];
  root.quaternion.copy(Q_ID); root.position.copy(ROOT0);
}
/* Alles ausser Atemwegen und Lappen zum Ausblenden vorbereiten (Hin- und Rueckfahrt); merkt die Ursprungswerte. Die Lappen werden Glas (transparent, ohne Tiefenschreiben). */
function ausblendVorbereiten() {
  var keep = new Set(), ausMat = new Map(), glas = new Map(), altT = new Map(), altD = new Map(), ausObj = [];
  ['luftroehre', 'hauptbronchien', 'bronchien'].forEach(function (sid) { STRUCT[sid].meshes.forEach(function (m) { keep.add(m.material); }); });
  LAPPEN.forEach(function (sid) {
    STRUCT[sid].meshes.forEach(function (m) {
      var x = m.material; keep.add(x);
      if (glas.has(x)) return;
      glas.set(x, x.opacity); altT.set(x, x.transparent); altD.set(x, x.depthWrite);
      x.transparent = true; x.depthWrite = false; x.needsUpdate = true;
    });
  });
  root.traverse(function (o) {
    if (!o.material || !o.visible || o === alGruppe || o.parent === alGruppe || keep.has(o.material)) return;
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
/* Fahrt zur Alveole am Endast idx (null: die Standardstelle); wartet, falls das Saeckchen noch im Hintergrund entsteht */
function alveoleOeffnen(idx) {
  if (fz || abgebaut || alWartet || !BAUM || !BAUM.endpunkte.length) return;
  if (sackP && !alFertig) { alWartet = true; sackP.then(function () { alWartet = false; if (!abgebaut) alveoleOeffnen(idx); }); return; }
  if (schemaOn) setSchema(false);
  lupeClose();
  if (quiz) quizEnd();
  closeCard();
  SZ.el.classList.add('weg');   /* die Szenariokarte weicht der Fahrt (bei der Rueckkehr ist alles neu aufgebaut) */
  atmen.pause(true);   /* der Endast bleibt an seinem Platz */
  alLetzte = idx = (idx === null || idx === undefined) ? alStandard() : idx;
  AL = alveoleLage(idx);
  var w = window.innerWidth, h = window.innerHeight, ziel = alveoleZiel(w, h), r = bereich(w, h);
  var dth = ziel.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI; ziel.theta = view.theta + dth;
  ORDER.forEach(function (d) { d.meshes.forEach(function (m) { var mt = m.material; if (mt.emissive) mt.emissive.copy(mt.userData.baseEmissive || new THREE.Color(0, 0, 0)); }); });   /* Hervorhebung weg */
  alBauen();
  var f = ausblendVorbereiten();
  orbit.anim = Kern.fahrt(view, { theta: ziel.theta, phi: ziel.phi, dist: ziel.dist, target: ziel.target }, 1200);
  f.hin = true; f.adresse = Kern.organAdresse('alveole'); f.a = orbit.anim;
  f.von = [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2]; f.nach = ziel.versatz;
  fz = f;
}
$('iOpen').onclick = function () { alveoleOeffnen(alWahl); };
$('bAlveole').onclick = function () { alveoleOeffnen(null); };
/* Rueckkehr aus dem Alveolen-Modell: die Lunge steht gedreht im Nahbild (am zuletzt gewaehlten Endast), das Saeckchen ist sichtbar, alles andere ausgeblendet; die Fahrt zur Uebersicht beginnt nach 450 ms */
function rueckkehr() {
  if (!BAUM || !BAUM.endpunkte.length) return;
  atmen.pause(true);
  AL = alveoleLage(alLetzte !== null ? alLetzte : alStandard());
  var w = window.innerWidth, h = window.innerHeight, ziel = alveoleZiel(w, h), r = bereich(w, h);
  alBauen();
  var f = ausblendVorbereiten();
  f.mats.forEach(function (op, m) { m.opacity = 0; });
  f.glas.forEach(function (op, m) { m.opacity = AL_LOBE_ENDE; });
  f.ui.forEach(function (e) { e.style.opacity = '0'; });
  f.obj.forEach(function (o) { o.visible = false; });
  alDrehung(1); alDeckkraft(1);
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
  alAbbau();
  view.theta = 0; view.phi = PI / 2; view.dist = d; view.target.copy(a0.target);
  orbit.anim = null;
  camera.setViewOffset(w, h, w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2, w, h);
  camera.updateProjectionMatrix();
  aktiv = 0; fitDist = d;
  for (var k = 0; k < AUSSCHNITTE.length; k++) $('cam' + k).classList.toggle('on', k === 0);
  atmen.pause(!atmenLaeuft);
  lv++;
  fz = null;
}
/* je Bild waehrend der Fahrt: Bildbereich, Deckkraft und Drehung mit derselben Glaettung wie die Kamera; u: 0 = Ausgangslage (Uebersicht), 1 = Nahbild */
function fahrtBild(now) {
  if (!fz.a && now >= fz.warte) {   /* Rueckfahrt beginnt: zur Uebersicht, kuerzester Weg beim Drehen */
    var w0 = window.innerWidth, h0 = window.innerHeight, a0 = AUSSCHNITTE[0];
    var dth = a0.theta - view.theta; dth -= Math.round(dth / (2 * PI)) * 2 * PI;
    orbit.anim = fz.a = Kern.fahrt(view, { theta: view.theta + dth, phi: PI / 2, dist: distFuer(a0, w0, h0), target: a0.target.clone() }, 1200);
    fz.obj.forEach(function (o) { o.visible = true; });
  }
  var t = fz.a ? Math.min(1, Math.max(0, (now - fz.a.t0) / fz.a.d)) : 0, s = t * t * (3 - 2 * t), u = fz.hin ? s : 1 - s;
  var w = window.innerWidth, h = window.innerHeight;
  camera.setViewOffset(w, h, fz.von[0] + (fz.nach[0] - fz.von[0]) * s, fz.von[1] + (fz.nach[1] - fz.von[1]) * s, w, h);
  camera.updateProjectionMatrix();
  fz.mats.forEach(function (op, m) { m.opacity = op * (1 - u); });
  fz.glas.forEach(function (op, m) { m.opacity = u < 0.5 ? op + (GLAS - op) * sstep(0, 0.5, u) : GLAS + (AL_LOBE_ENDE - GLAS) * sstep(0.5, 1, u); });   /* erst Glas, dann noch blasser */
  fz.ui.forEach(function (e) { e.style.opacity = String(1 - u); });
  if (!fz.hin && t >= 1) { rueckEnde(); return false; }
  alDrehung(u);
  alDeckkraft(sstep(0.5, 1, u));                                      /* erscheint in der zweiten Haelfte der Hinfahrt, geht in der ersten der Rueckfahrt */
  if (!fz.hin) return false;
  if (t >= 1 && !fz.fertig) { fz.fertig = true; fz.obj.forEach(function (o) { o.visible = false; }); return false; }
  return fz.fertig;   /* true erst ab dem Bild nach dem Endbild */
}

/* =====================================================================
   7d. Export (Kern.Export): GLB statisch und STL (nur die geschlossenen Koerper: Lappen, Luftwege, Rippen, Brustbein, Zwerchfell, Herz; ohne Rippenfell,
   Gefaesse, Zwischenrippenmuskeln und Teilchen), GLB animiert: eine Periode der Ruheatmung des Schemas (4,2 s, Formel wie in atmen.tick). Starre Teile (Rippen, Brustbein)
   bekommen Spuren fuer Lage, Drehung und Groesse, verformte Teile (Lappen, Atemwege, Gefaesse, Zwerchfell, Knorpel, Zwischenrippenmuskeln) ein Morph-Ziel (Pose bei
   voller Einatmung, Einfluss = w / wMax; die Verformung ist in w linear). Die Pose der Ausgangslage (w = 0) steht beim Anlegen der Klone, danach geht die Atmung weiter.
   ===================================================================== */
var STL_STRUKTUREN = LAPPEN.concat(['luftroehre', 'hauptbronchien', 'bronchien', 'rippen', 'brustbein', 'zwerchfell', 'herz']);
var exArt = '';                           /* 'stl' | 'glb' | 'anim': Art des laufenden Exports (gruppen kennt sie sonst nicht) */
var RUHE_Z = 4.2, RUHE_W = 0.52, RUHE_NKEY = 42;   /* Periode, Hoechstwert von w (Muskeln: d = w, i = 0,95 w) und Zahl der Zeitschritte */
function ruheW(ph) {   /* wie in atmen.tick (Modus ruhe) */
  return ph < 1.7 ? RUHE_W * (1 - Math.cos(Math.PI * (ph / 1.7))) / 2 : RUHE_W * Math.pow(Math.max(0, 1 - (ph - 1.7) / 2.5), 2.2);
}
function atmungPose(w) {   /* Zustand der Muskeln setzen und Lunge, Zwerchfell und Brustkorb neu rechnen */
  A3.S0 = { d: w, i: w * 0.95 }; A3.neu = true; atmungForm();
}
function szenarioExport() {   /* aktives Krankheitsbild bzw. Medikament (Anteil > 0,5) fuer den Dateinamen, sonst null */
  var r = null;
  SZ_DATEN.forEach(function (sc) { if (SZ.anteil[sc.id] > 0.5) r = sc; });
  return r;
}
var LAENGE_TXT = 'Brustkorb ca. 30 cm breit';
var exCfg = {
  titel: 'Lunge', praefix: 'lunge', wurzelName: 'Lunge',
  /* Schild unter dem Modell: Unterkante des Zwerchfells bei voller Einatmung ca. -21,5, Brustbein vorn bis z 11,3, x Mitte */
  schild: [0, -23.5, 12],
  bereit: function () { return App.ready; },
  gruppen: function () {
    exportVorbereiten();
    if (exArt === 'stl') {
      var l = [];
      ORDER.forEach(function (d) { if (STL_STRUKTUREN.indexOf(d.id) >= 0) d.meshes.forEach(function (m) { l.push(m); }); });
      return l;
    }
    if (exArt === 'anim' && A3.bereit) { exAlt = A3.S0; atmungPose(0); }   /* Klone in der Ausgangslage anlegen */
    return [root];
  },
  get zusatzStatisch() { var sc = szenarioExport(); return sc ? sc.id : ''; },
  toast: function (msg) { Kern.toast(msg); },
  transparenz: true,
  /* Normalen des Klons auf Laenge 1 bringen (das Herz zur Orientierung hat einzelne Normalen mit Laenge ungleich 1 (Abweichung bis 1,0); der Exporter wuerde sie sonst mit einer Warnung selbst normalisieren (Laenge 0: (1, 0, 0))) */
  klon: function (c) {
    var n = c.geometry.attributes.normal, a = n && n.array, i, l;
    if (!a) return;
    for (i = 0; i < a.length; i += 3) {
      l = Math.sqrt(a[i] * a[i] + a[i + 1] * a[i + 1] + a[i + 2] * a[i + 2]);
      if (Math.abs(l - 1) <= 5e-4) continue;
      if (l === 0) { a[i] = 1; a[i + 1] = 0; a[i + 2] = 0; } else { a[i] /= l; a[i + 1] /= l; a[i + 2] /= l; }
    }
  },
  animation: function (rootE, clones) {
    var N = RUHE_NKEY, times = new Float32Array(N + 1), tracks = [], i, q, nStarr = 0, nVerf = 0;
    for (i = 0; i <= N; i++) times[i] = i * RUHE_Z / N;
    var W = new Float32Array(N + 1);
    for (i = 0; i <= N; i++) W[i] = ruheW(times[i]);
    /* verformte Teile: Morph-Ziel = Pose bei w = RUHE_W minus Ausgangslage */
    atmungPose(RUHE_W);
    var traeger = [];
    for (q = 0; q < clones.length; q++) {
      var c = clones[q].c, m = clones[q].m, e = A3.rest.get(m);
      if (m === HZ.mesh && HZ.eng) { herzSpur(c, tracks, times); continue; }   /* das Herz schlaegt */
      if (!e) continue;
      if (e.m0) { traeger.push({ c: c, m: m }); continue; }   /* starr: Rippen, Brustbein */
      var P0 = c.geometry.attributes.position.array, P1 = m.geometry.attributes.position.array, d = new Float32Array(P0.length), mx = 0, k;
      for (k = 0; k < d.length; k++) { d[k] = P1[k] - P0[k]; if (Math.abs(d[k]) > mx) mx = Math.abs(d[k]); }
      if (mx < 1e-4) continue;
      c.geometry.morphAttributes.position = [new THREE.BufferAttribute(d, 3)]; c.geometry.morphTargetsRelative = true;
      c.updateMorphTargets(); c.morphTargetInfluences[0] = 0;
      var inf = new Float32Array(N + 1);
      for (i = 0; i <= N; i++) inf[i] = W[i] / RUHE_W;
      tracks.push(new THREE.NumberKeyframeTrack(c.name + '.morphTargetInfluences', times, inf));
      if (m.material === MAT.zwischenrippen) c.material.opacity = 0.3;   /* die Deckkraft folgt in 3D der Anspannung (0,16 bis 0,39): in der Datei ein fester Mittelwert */
      nVerf++;
    }
    /* starre Teile: Lage, Drehung, Groesse je Zeitschritt aus der Brustkorb-Bewegung des Programms */
    var pos = traeger.map(function () { return new Float32Array((N + 1) * 3); }), rot = traeger.map(function () { return new Float32Array((N + 1) * 4); }), skl = traeger.map(function () { return new Float32Array((N + 1) * 3); });
    var vp = new THREE.Vector3(), vq = new THREE.Quaternion(), vs = new THREE.Vector3(), vor = traeger.map(function () { return new THREE.Quaternion(); });
    for (i = 0; i <= N; i++) {
      var S = A3.S = { d: W[i] + SZW.trap, i: 0.95 * W[i] + SZW.trap };
      A3.dA = 62 * S.d / KUPPEL_PX; A3.dB = 13 * S.i * PX_CM; A3.sinW = Math.sin(RIPPE_WINKEL * S.i);
      brustkorbAnwenden();
      traeger.forEach(function (t, j) {
        t.m.updateWorldMatrix(true, false); t.m.matrixWorld.decompose(vp, vq, vs);
        var qa = vor[j];
        if (i && (vq.x * qa.x + vq.y * qa.y + vq.z * qa.z + vq.w * qa.w) < 0) { vq.x = -vq.x; vq.y = -vq.y; vq.z = -vq.z; vq.w = -vq.w; }   /* kurzer Weg beim Mischen */
        qa.copy(vq);
        pos[j][i * 3] = vp.x; pos[j][i * 3 + 1] = vp.y; pos[j][i * 3 + 2] = vp.z;
        rot[j][i * 4] = vq.x; rot[j][i * 4 + 1] = vq.y; rot[j][i * 4 + 2] = vq.z; rot[j][i * 4 + 3] = vq.w;
        skl[j][i * 3] = vs.x; skl[j][i * 3 + 1] = vs.y; skl[j][i * 3 + 2] = vs.z;
      });
    }
    traeger.forEach(function (t, j) {
      tracks.push(new THREE.VectorKeyframeTrack(t.c.name + '.position', times, pos[j]));
      tracks.push(new THREE.QuaternionKeyframeTrack(t.c.name + '.quaternion', times, rot[j]));
      tracks.push(new THREE.VectorKeyframeTrack(t.c.name + '.scale', times, skl[j]));
      nStarr++;
    });
    var sz = szenarioExport();
    return { clips: [new THREE.AnimationClip('Lunge_Ruheatmung', RUHE_Z, tracks)], zusatz: sz ? sz.id : 'normal', nStarr: nStarr, nVerf: nVerf };
  },
  texte: {
    stlStart: 'STL wird erzeugt …',
    glbStart: 'GLB wird erzeugt …',
    animStart: 'Atmung wird aufgezeichnet …',
    stlLiesmich: ['Datei (Maßstab Millimeter, Z-Achse nach oben, reale Größe: ' + LAENGE_TXT + '):', '- lunge_ansicht.stl: die geschlossenen Körper, die beim Export sichtbar waren: Lungenlappen, Luftröhre und Bronchien, Rippen, Brustbein, Zwerchfell und Herz (ohne Rippenfell, Gefäße, Zwischenrippenmuskeln)', 'STL kennt keine Farbe – dafür gibt es die GLB-Datei.'],
    stlFertig: function (i) {
      return 'STL gespeichert &middot; <span class="em">' + i.dateien + ' Datei, ' + Math.round(i.dreiecke).toLocaleString('de-DE') + ' Dreiecke, ' + Kern.Export.kb(i.groesse) + ', Einheit mm</span><br>Reale Größe (' + LAENGE_TXT + ') – STL kennt keine Farbe.';
    },
    glbLiesmich: function (i) {
      return [i.anim ? i.name + ': eine Ruheatmung (' + RUHE_Z + ' s) als Animation, läuft in Schleife: Zwerchfell, Lungenlappen, Atemwege, Rippen, Brustbein und Zwischenrippenmuskeln bewegen sich wie im Programm, das Herz schlägt (ein Schlag je Atemzug).' : i.name + ': farbiges 3D-Modell der Lunge mit Atemwegen, Gefäßen, Zwerchfell und Brustkorb in der Stellung beim Export, ohne Bewegung.', 'Maßstab: Meter (reale Größe: ' + LAENGE_TXT + '). Die Signatur steht in den Metadaten und auf dem Schild unter dem Modell.'];
    },
    glbFertig: function (i) {
      return 'GLB gespeichert &middot; <span class="em">' + i.objekte + ' Objekte, ' + Kern.Export.kb(i.groesse) + ', Einheit Meter</span><br>Reale Größe (' + LAENGE_TXT + '), mit Farben, ' + (i.anim ? 'mit Ruheatmung: ' + (RUHE_NKEY + 1) + ' Keyframes, ' + RUHE_Z + ' s Schleife. Im Viewer die Wiedergabe starten.' : 'ohne Bewegung.');
    }
  }
};
/* Herz und Gefaesse sehen im Export aus wie vorher: das Herz in Ruhe (Morph-Einfluesse 0, die Schleife setzt sie im naechsten Bild wieder), die Gefaesse undurchsichtig (im
   Programm sind sie Glas, damit man das Blut sieht); die Klone entstehen noch im selben Aufruf, danach (naechster Takt) steht alles wieder wie es war */
function exportVorbereiten() {
  var alt = [MAT.lungenarterien, MAT.lungenvenen].map(function (m) { var a = [m, m.transparent, m.opacity, m.depthWrite]; m.transparent = false; m.opacity = 1; m.depthWrite = true; m.needsUpdate = true; return a; });
  if (HZ.mesh) HZ.mesh.morphTargetInfluences.fill(0);
  setTimeout(function () { alt.forEach(function (a) { a[0].transparent = a[1]; a[0].opacity = a[2]; a[0].depthWrite = a[3]; a[0].needsUpdate = true; }); }, 0);
}
/* Herzschlag fuer die Animation: Morph-Spur des Herz-Klons (VR, VL, A, Ao, PT); die Periode der Atmung (RUHE_Z) enthaelt eine ganze Zahl Schlaege (n), jeder um den Faktor gestreckt;
   gerechnet mit einer eigenen Engine (die laufende bleibt unberuehrt) */
function herzSpur(c, tracks, times) {
  var Z = HZ.hform.zyklus, N = times.length - 1, n = Math.max(1, Math.round(RUHE_Z / Z.ZYKLUS)), be = new Z.Engine(HZ.eng.wege), vals = new Float32Array((N + 1) * 5), i, k, bk, W;
  be.S.tempo = n * Z.ZYKLUS / RUHE_Z;
  bk = be.bake(RUHE_NKEY / RUHE_Z);
  for (i = 0; i <= N; i++) {
    W = bk.frames[Math.round(((i * n) / N) % 1 * (bk.frames.length - 1))];
    for (k = 0; k < 5; k++) vals[i * 5 + k] = W[HZ_N[k]] || 0;
  }
  tracks.push(new THREE.NumberKeyframeTrack(c.name + '.morphTargetInfluences', times, vals));
}
var exAlt = null;   /* Zustand der Muskeln vor dem Aufzeichnen der Atmung */
function exportNach() { if (exAlt) { A3.S0 = exAlt; exAlt = null; A3.neu = true; atmungForm(); } }
function exportRun(art, kind) {
  exArt = art; exAlt = null;
  var p = Kern.Export.run(kind, exCfg);
  return p && p.then ? p.then(exportNach, function (e) { exportNach(); throw e; }) : p;
}
$('bGlbA').onclick = function () { exportRun('anim', 'glb-anim'); };
$('bGlbS').onclick = function () { exportRun('glb', 'glb'); };
$('bStl').onclick = function () { exportRun('stl', 'stl'); };

/* =====================================================================
   7e. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, Safari) mit selbst erzeugter USDZ-Datei.
   Die Lunge wird in cm modelliert: 0,01 m je cm ist die reale Groesse (Brustkorb ca. 30 cm breit, ein Tischmodell). Die Atmung laeuft weiter (Knopf Pause), das Rippenfell
   (Huelle), die Luftteilchen und die Beschriftung gibt es in AR nicht. Das Modell entsteht erst beim Start in einer eigenen Gruppe (arG, um die Mitte M des Modells): so
   aendert AR nichts an der Szene, solange sie nicht gestartet wird.
   ===================================================================== */
var AR_SKALA = 0.01;
var inAR = false, AR = null, arG = null, arCfg = null, xrOK = false, kamAlt = { near: camera.near, far: camera.far };
if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-ar').then(function (ok) { xrOK = ok; }).catch(function () { xrOK = false; });
function arFuss() {   /* Hoehe der Unterkante des sichtbaren Modells (ohne Teilchen) ueber der Mitte M, die in AR auf der Flaeche steht */
  var b = new THREE.Box3();
  root.traverse(function (o) { if (o.isMesh && !o.userData.teilchen && sichtbar(o)) b.expandByObject(o); });
  return b.isEmpty() ? 0 : -b.min.y;
}
function arTexte() {
  $('arPause').textContent = atmenLaeuft ? 'Pause' : 'Weiter';
}
function arErzeugen() {
  arG = new THREE.Group(); arG.name = 'Lunge_AR';
  arCfg = {
    renderer: renderer, scene: scene, camera: camera, root: arG,
    stufen: [0.004, 0.006, 0.01, 0.015, 0.02, 0.03], skala: AR_SKALA,
    fuss: 0,                                          /* Unterkante steht auf der Flaeche; wird beim Start gesetzt */
    hintergrund: 0x0b171c,
    ids: { ui: 'arUI', hint: 'arHint', ende: 'arEnd', kleiner: 'arSmall', groesser: 'arBig', neu: 'arPlace' },
    knoepfe: ['arEnd', 'arSmall', 'arBig', 'arPlace', 'arPause'],
    quickLook: function () { arQuickLook(); },
    beimStart: function () {
      inAR = true;
      if (schemaOn) setSchema(false);                 /* Schema, Lupe und Karten schliessen vor AR */
      lupeClose(); if (quiz) quizEnd(); closeCard(); setSelected(null); szWeichen();
      scene.add(arG); arG.add(root);                  /* das Modell steht in der Gruppe, die in AR hingestellt wird */
      arCfg.fuss = arFuss();
      camera.near = 0.01; camera.far = 100;           /* Meter statt cm */
      labelBox.style.display = 'none'; leaderSvg.style.display = 'none';
      if (atmen.lesen().modus === null && atmenLaeuft) $('loDemoRuhe').click();   /* ohne laufende Atmung: Ruheatmung, sonst gaebe es nichts zu pausieren */
      arTexte();
    },
    beimEnde: function () {
      inAR = false;
      scene.add(root); scene.remove(arG);
      camera.near = kamAlt.near; camera.far = kamAlt.far;
      labelBox.style.display = showLabels ? '' : 'none'; leaderSvg.style.display = showLabels ? '' : 'none';
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
  if (fz || abgebaut) return;
  if (!AR) arErzeugen();
  AR.xr = xrOK;
  AR.start();
};
/* ---- USDZ fuer AR Quick Look: Momentaufnahme in der aktuellen Ansicht, ohne Teilchen und ohne Rippenfell-Huelle; Glas (Durchsicht, durchsichtige Rippen) mit fester Deckkraft ---- */
function usdzBuild() {
  var pl = STRUCT.pleura.meshes, vis = pl.map(function (m) { return m.visible; });
  var glas = LAPPEN.map(function (sid) { return MAT[sid]; }).concat([MAT.rippen, MAT.knorpel, MAT.brustbein]).filter(function (m) { return m.transparent && m.opacity < 0.3; });
  pl.forEach(function (m) { m.visible = false; });
  glas.forEach(function (m) { m.userData.usdzOp = 0.35; });
  var gef = [MAT.lungenarterien, MAT.lungenvenen];   /* Gefaesse in der USDZ wie vorher undurchsichtig (im Programm Glas fuer das Blut), das Herz in Ruhe */
  gef.forEach(function (m) { m.userData.usdzOp = 1; });
  if (HZ.mesh) HZ.mesh.morphTargetInfluences.fill(0);
  try {
    return Kern.AR.usdz({ name: 'Lunge', creator: 'Lunge 3D - ' + Kern.WM, datei: 'lunge.usda', skala: AR_SKALA, gruppen: [root] });
  } finally {
    pl.forEach(function (m, i) { m.visible = vis[i]; });
    glas.forEach(function (m) { delete m.userData.usdzOp; });
    gef.forEach(function (m) { delete m.userData.usdzOp; });
  }
}
function arQuickLook() {
  Kern.AR.quickLook({ bauen: usdzBuild, link: $('arQL'), fertig: 'Die Lunge öffnet sich in AR Quick Look. Mit zwei Fingern lässt sie sich vergrößern und drehen.' });
}

/* =====================================================================
   7f. Herzschlag und kleiner Kreislauf: Das Herz zur Orientierung schlaegt, Blutportionen fliessen durch Herz, Lungenarterien, Lappen und Lungenvenen.
   Physik und Wege kommen unveraendert aus dem Herz-Modell (organ.form: zyklus = HerzZyklus, extras.wkPaths/wkPoint): eine eigene Engine (Automatik, Tempo normal = 3,2 s je Schlag),
   multipliziert mit dem Tempo der Atmung und angehalten bei Pause. Das Herz-Netz hat die Morph-Ziele VR, VL, A, Ao, PT aus motionSimple und folgt den Gewichten der Engine
   wie im Herz-Modell. Gezeigt wird nur der kleine Kreislauf: Portionen auf den Wegen lungeLinks/lungeRechts, im sichtbaren Teil an der Stelle aus wkPoint (mit der Herzbewegung).
   Der unsichtbare Teil (Lunge) ist hier sichtbar: je Seite eine Warteschlange (aelteste zuerst); jede Portion, die in die Lunge geht, folgt einer Lungenarterie in einen Lappen,
   wechselt dort von blau zu rot und kehrt ueber die Lungenvene zurueck; ihre Zahl ist immer imLu der Engine, die Abgabe am Venenende folgt der Engine (es verlaesst die Lunge die
   Portion, die einer Muendung am naechsten ist; im Herzen laeuft die Engine-Portion dann auf deren Seite und Vene weiter). Die Rangordnung in der Schlange bestimmt den Ort
   (die aelteste steht an der Muendung); Punkte wie im Herz-Modell: Kugel 0,23 cm, blau/rot. Ohne Herz-Modul: kein Schlag, kein Blut.
   ===================================================================== */
var HZ_N = ['VR', 'VL', 'A', 'Ao', 'PT'];                 /* Reihenfolge der Morph-Ziele (wie MNAMES im Herz-Modell) */
var HZ_MAX = 64, HZ_R = 0.23, HZ_V = 11, HZ_RAUM = 6;       /* Hoechstzahl Punkte, Kugelradius, Hoechsttempo in der Lunge (cm/s), Auslauf der Herzbewegung entlang der Gefaesse (cm) */
var HZ_BLAU = srgb(0x2F6FB5), HZ_ROT = srgb(0xC8342F);     /* Farben wie im Herz-Modell */
var HZ = { hform: null, mesh: null, an: null, eng: null, blut: null, wk: null, wkU: null, R: null, lappen: null, q: { '-1': [], '1': [] }, rr: { '-1': 0, '1': 0 }, ziel: {}, mot: null, t: 0 };
var hzP = { p: [0, 0, 0], m: new Array(15).fill(0), tan: [0, 0, 0] }, hzV = new THREE.Vector3(), hzM = new THREE.Matrix4(), hzC = new THREE.Color();
/* Gewicht, mit dem ein Punkt der Lungengefaesse der Lunge folgt: 0 an den Anschluessen am Herzen (Stumpf), 1 ab 8 cm Abstand */
function gefGewicht(x, y, z) {
  var a = HZ.an, d = 1e9, k, q, u;
  [a.paL.p, a.paR.p, a.mund['1'][0].p, a.mund['1'][1].p, a.mund['-1'][0].p, a.mund['-1'][1].p].forEach(function (q) { d = Math.min(d, Math.sqrt(Math.pow(x - q[0], 2) + Math.pow(y - q[1], 2) + Math.pow(z - q[2], 2))); });
  u = clamp01((d - 1.5) / 6.5);
  return u * u * (3 - 2 * u);
}
/* Weg einer Portion durch die Lunge: Stuecke aus denselben Linien wie die Rohre (Catmull-Rom wie in rohre), Bogenlaenge; sA/sB: Anteil am Weg, an dem der Lappen beginnt/endet */
function routeBauen(r) {
  var tot = 0, teile = r.teile.map(function (t) {
    var c = t.gerade ? new THREE.LineCurve3(V(t.pts[0][0], t.pts[0][1], t.pts[0][2]), V(t.pts[1][0], t.pts[1][1], t.pts[1][2]))
      : new THREE.CatmullRomCurve3(t.pts.map(function (q) { return V(q[0], q[1], q[2]); }), false, 'catmullrom', 0.5);
    var L = c.getLength(); tot += L;
    return { c: c, L: L, rev: !!t.rev };
  });
  var a = teile[0].L + teile[1].L, b = a + teile[2].L;
  return { teile: teile, L: tot, sA: a / tot, sB: b / tot, seite: r.seite, mund: r.mund };
}
function routePunkt(R, s, out) {   /* Punkt bei Anteil s (0 = Ende des Lungenstamms am Herzen, 1 = Venenmuendung) in Ruhelage -> out (Vector3) */
  var d = s * R.L, i = 0, t, u;
  while (i < R.teile.length - 1 && d > R.teile[i].L) { d -= R.teile[i].L; i++; }
  t = R.teile[i]; u = t.L > 0 ? clamp01(d / t.L) : 0;
  return t.c.getPointAt(t.rev ? 1 - u : u, out);
}
/* Verschiebung eines Punktes durch die Herzbewegung: Summe m * Gewicht (m = motionSimple, 15 Werte) -> o [x, y, z] */
function herzVersatz(m, W, o) {
  var j, w;
  o[0] = o[1] = o[2] = 0;
  for (j = 0; j < 5; j++) { w = W[HZ_N[j]] || 0; o[0] += m[j * 3] * w; o[1] += m[j * 3 + 1] * w; o[2] += m[j * 3 + 2] * w; }
  return o;
}
/* Weg lungeLinks/lungeRechts mit der unteren Lungenvene (LIPV/RIPV) statt der oberen als Rueckweg im Herzen (gleiche Laengen, nur die beiden Punkte der Muendung getauscht) */
function wkVariante(w, mund) {
  var hi = w.seg.findIndex(function (sg) { return !sg.vis; }), v = Object.assign({}, w), M = HZ.hform.assemble.motionSimple;
  v.pts = w.pts.slice(); v.mot = w.mot.slice();
  v.pts[hi + 1] = mund.h.slice(); v.pts[hi + 2] = mund.h0.slice();
  v.mot[hi + 1] = M(mund.h[0], mund.h[1], mund.h[2]); v.mot[hi + 2] = M(mund.h0[0], mund.h0[1], mund.h0[2]);
  return v;
}
/* neue Portion in der Lunge (Seite sd: 1 = links, -1 = rechts; reihum in einen Lappen dieser Seite); s0 = Anteil am Weg */
function portionNeu(sd, s0) {
  var L = HZ.lappen[sd], id = L[HZ.rr[sd]++ % L.length], R = HZ.R[id];
  HZ.q[sd].push({ R: R, s: s0 || 0, sd: sd, mund: R.mund });
}
/* Zielort nach der Rangordnung: die aelteste steht an der Muendung (1), jede weitere weiter hinten (exp(-0,22 * Rang)); nicht im Wechselbereich des Lappens */
function portionZiel(p, r) {
  var z = Math.exp(-0.22 * r), cA = p.R.sA - 0.012, cB = p.R.sB + 0.012;
  if (z > cA && z < cB) z = z < (cA + cB) / 2 ? cA : cB;
  return z;
}
function portionenFolgen(dt, sofort) {
  [-1, 1].forEach(function (sd) {
    HZ.q[sd].forEach(function (p, r) {
      var z = portionZiel(p, r), diff = z - p.s, sp, ds;
      if (sofort) { p.s = z; return; }
      if (diff <= 0) return;
      sp = Math.max(0.4, Math.min(HZ_V * (p.s > p.R.sA - 0.02 && p.s < p.R.sB + 0.02 ? 0.35 : 1), 3 * diff * p.R.L));
      ds = Math.min(diff, sp * dt / p.R.L);
      p.s += ds;
    });
  });
}
/* Ein Schritt (dt in Sekunden der Engine): Engine rechnen, Eintritte in die Lunge und Abgaben an die Venen erkennen, Zahl der Portionen mit imLu abgleichen */
function kreislaufSchritt(dt) {
  var eng = HZ.eng, W = eng.wege, snap = {};
  eng.teilchen.forEach(function (t) { if (W[t.weg].luEin !== undefined) snap[t.id] = [t.weg, t.d]; });
  eng.step(dt); eng.events.length = 0;
  var jetzt = {};
  eng.teilchen.forEach(function (t) { jetzt[t.id] = true; });
  Object.keys(snap).forEach(function (id) {   /* weg und noch vor dem Lungenbett: in die Lunge eingetreten */
    var sn = snap[id];
    if (!jetzt[id] && sn[1] < W[sn[0]].luEin) portionNeu(sn[0] === 'lungeLinks' ? 1 : -1, 0);
  });
  eng.teilchen.forEach(function (t) {   /* neu und schon am Venenanfang: die Engine gibt eine Portion an die Lungenvene ab; es verlaesst die Lunge die Portion, die der Muendung am naechsten ist (die Engine selbst gibt oft nur an einer Seite ab) */
    var w = W[t.weg];
    if (w.luEin === undefined || snap[t.id] || t.d < w.luTor - 1e-6) return;
    var qa = HZ.q['-1'][0], qb = HZ.q['1'][0], sd = qa && (!qb || qa.s >= qb.s) ? -1 : 1, p = HZ.q[sd].shift();
    HZ.ziel[t.id] = p ? { sd: sd, mund: p.mund } : { sd: t.weg === 'lungeLinks' ? 1 : -1, mund: t.id & 1 };
  });
  Object.keys(HZ.ziel).forEach(function (id) { if (!jetzt[id]) delete HZ.ziel[id]; });
  var n = HZ.q['-1'].length + HZ.q['1'].length;
  while (n < eng.imLu) { portionNeu(HZ.q['-1'].length <= HZ.q['1'].length ? -1 : 1, 0); n++; }
  while (n > eng.imLu && n > 0) { HZ.q[HZ.q['-1'].length > HZ.q['1'].length ? '-1' : '1'].shift(); n--; }
  portionenFolgen(dt, false);
}
function blutSetzen(k, x, y, z, t) {   /* Punkt k an (x, y, z), Farbe t: 0 = blau, 1 = rot */
  hzM.makeTranslation(x, y, z); HZ.blut.setMatrixAt(k, hzM);
  HZ.blut.setColorAt(k, hzC.copy(HZ_BLAU).lerp(HZ_ROT, t));
}
function blutZeichnen(W) {
  var k = 0, B = HZ.blut, eng = HZ.eng, HV = form.HERZ_V, ow = [0, 0, 0], oa = [0, 0, 0], om = [0, 0, 0], Z = enabled;
  if (!B.visible) return;
  if (Z.herz) {   /* im Herzen und im Lungenstamm: Weg aus dem Herz-Modell, mit der Herzbewegung */
    eng.teilchen.forEach(function (t) {
      var w0 = eng.wege[t.weg], w, z, nm, w1, d = t.d;
      if (w0.luEin === undefined || k >= HZ_MAX) return;
      if (d >= w0.luTor) {   /* Rueckweg im Herzen: auf der Seite und ueber die Muendung der Portion, die die Lunge verlassen hat (Laenge angepasst) */
        z = HZ.ziel[t.id] || { sd: t.weg === 'lungeLinks' ? 1 : -1, mund: t.id & 1 };
        nm = z.sd > 0 ? 'lungeLinks' : 'lungeRechts'; w1 = eng.wege[nm];
        d = w1.luTor + (d - w0.luTor) / (w0.len - w0.luTor) * (w1.len - w1.luTor);
        w = z.mund ? HZ.wkU[nm] : HZ.wk[nm];
      } else w = HZ.wk[t.weg];
      HZ.hform.extras.wkPoint(w, d, hzP);
      if (!hzP.vis) return;
      herzVersatz(hzP.m, W, ow);
      blutSetzen(k++, hzP.p[0] + ow[0] + HV[0], hzP.p[1] + ow[1] + HV[1], hzP.p[2] + ow[2] + HV[2], hzP.col === 'r' ? 1 : 0);
    });
  }
  [-1, 1].forEach(function (sd) {   /* in der Lunge: die Warteschlangen */
    var ka = HZ.mot.pa[sd];
    herzVersatz(ka, W, oa);
    HZ.q[sd].forEach(function (p) {
      var R = p.R, s = p.s, rot, x, y, z, w, fa, fm;
      if (k >= HZ_MAX) return;
      rot = clamp01((s - (R.sA - 0.012)) / (R.sB - R.sA + 0.024)); rot = rot * rot * (3 - 2 * rot);
      if (rot < 0.5 ? !Z.lungenarterien : !Z.lungenvenen) return;
      routePunkt(R, s, hzV);
      x = hzV.x; y = hzV.y; z = hzV.z;
      w = gefGewicht(x, y, z); lungeFeld(x, y, z, FO);
      x += (FO.x - x) * w; y += (FO.y - y) * w; z += (FO.z - z) * w;
      fa = Math.max(0, 1 - s * R.L / HZ_RAUM); fm = Math.max(0, 1 - (1 - s) * R.L / HZ_RAUM);   /* die Herzbewegung klingt entlang des Gefaesses ab */
      herzVersatz(HZ.mot.mund[sd][p.mund], W, om);
      blutSetzen(k++, x + oa[0] * fa + om[0] * fm, y + oa[1] * fa + om[1] * fm, z + oa[2] * fa + om[2] * fm, rot);
    });
  });
  hzM.makeScale(0, 0, 0);
  for (; k < HZ_MAX; k++) B.setMatrixAt(k, hzM);
  B.instanceMatrix.needsUpdate = true; B.instanceColor.needsUpdate = true;
}
/* aus der Renderschleife: Engine weiterrechnen (mit Tempo der Atmung, bei Pause nicht), Herz verformen, Punkte setzen */
function herzSchritt(now) {
  var Z = HZ, dt, f, W, k;
  if (!Z.blut) { Z.t = now; return; }
  dt = Z.t ? Math.min(0.05, (now - Z.t) / 1000) : 0.016; Z.t = now;
  f = atmen.faktor();
  if (f > 0) kreislaufSchritt(dt * f);
  W = Z.eng.weights();
  for (k = 0; k < 5; k++) Z.mesh.morphTargetInfluences[k] = W[HZ_N[k]] || 0;
  blutZeichnen(W);
}
/* Engine, Wege und Portionen (am Ende des Aufbaus, ohne three.js-Objekte); ohne Herz-Modell oder Anschluss nichts */
function kreislaufVorbereiten() {
  var an = HZ.an;
  if (!HZ.hform || !HZ.mesh || !an || !GEF || !GEF.routen || !HZ.hform.zyklus) return;
  var wk = an.wk, def = {}, M = HZ.hform.assemble.motionSimple, i;
  Object.keys(wk).forEach(function (k) { var w = wk[k]; def[k] = { len: w.len, klappeBei: w.klappeBei, tempo: w.tempo, abstand: w.abstand, ziel: w.ziel, ein: w.ein, tor: w.tor, jet: w.jet, luEin: w.luEin, luTor: w.luTor }; });
  HZ.eng = new HZ.hform.zyklus.Engine(def);
  HZ.wk = { lungeLinks: wk.lungeLinks, lungeRechts: wk.lungeRechts };
  HZ.wkU = { lungeLinks: wkVariante(wk.lungeLinks, an.mund['1'][1]), lungeRechts: wkVariante(wk.lungeRechts, an.mund['-1'][1]) };
  HZ.R = {}; HZ.lappen = { '-1': [], '1': [] };
  Object.keys(GEF.routen).forEach(function (id) { var r = GEF.routen[id]; HZ.R[id] = routeBauen(r); HZ.lappen[r.seite].push(id); });
  HZ.mot = { pa: { '1': M(an.paL.h[0], an.paL.h[1], an.paL.h[2]), '-1': M(an.paR.h[0], an.paR.h[1], an.paR.h[2]) }, mund: { '1': [], '-1': [] } };
  [-1, 1].forEach(function (sd) { an.mund[sd].forEach(function (q) { HZ.mot.mund[sd].push(M(q.h[0], q.h[1], q.h[2])); }); });
  for (i = 0; i < HZ.eng.imLu; i++) portionNeu(i % 2 ? 1 : -1, 0);   /* die Portionen, die beim Start schon in der Lunge sind */
  portionenFolgen(0, true);
}
/* Die Punkte (eine InstancedMesh, erst am Ende des Aufbaus angelegt: jedes three.js-Objekt verbraucht Zufallszahlen) */
function blutErzeugen() {
  if (!HZ.eng) return;
  var m = mat(0xffffff, { rough: 0.3, coat: 0.5, coatRough: 0.3, env: 0.45 }), i;
  m.emissive.setRGB(0.06, 0.06, 0.08);
  var im = new THREE.InstancedMesh(new THREE.SphereGeometry(HZ_R, 14, 10), m, HZ_MAX);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for (i = 0; i < HZ_MAX; i++) im.setColorAt(i, HZ_ROT);
  im.instanceColor.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false; im.renderOrder = 3;
  im.name = 'Blutportionen'; im.userData.teilchen = 'blut'; im.userData.noexport = true;
  im.raycast = function () {};   /* Punkte sind nicht anklickbar */
  root.add(im);
  HZ.blut = im;
  applyVisibility();
}

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
var App = window.LungeApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, brust: brust, ansicht: ansicht, dreiecke: tris, atmung: atmen.lesen,
  alveole: function (i) { alveoleOeffnen(i === undefined ? null : i); }, alveoleBereit: function () { return alFertig; }, endpunkte: function () { return BAUM ? BAUM.endpunkte.map(function (e) { return { p: e.p.slice(), lappen: e.lappen }; }) : []; } };
var szT = 0;
function loop(now, frame) {
  atmen.tick(now);
  herzSchritt(now);   /* Herzschlag und Blut (Abschnitt 7f), auch in der Pause (dann nur neu gesetzt) und in AR */
  if (SZ.schritt(szT ? Math.min(0.05, (now - szT) / 1000) : 0.016)) szenarioWirkung();   /* Anteile weich ueberblenden, auch in der Pause */
  szT = now;
  lupeTick(now);
  if (inAR) { AR.frame(frame); renderer.render(scene, camera); return; }   /* in AR bestimmt die Sitzung die Kamera */
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  var weiter = fz ? fahrtBild(now) : false;
  Kern.kamera(camera, view);
  if (!schemaOn) renderer.render(scene, camera);   /* bei offenem Schema ist die 3D-Ansicht ausgeblendet */
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
  if (AR) AR.abbauen();
  fz = null; canvas.style.pointerEvents = '';
  clearTimeout(Kern.toast._t);
  clearTimeout(quizT);
  SZ.abbauen();
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  if (alG) Object.keys(alG).forEach(function (k) { alG[k].dispose(); });   /* Teile des Saeckchens (nur bei einer Fahrt in der Szene) */
  camera.clearViewOffset();
  camera.updateProjectionMatrix();
  /* DOM */
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; [b.el, b.ln, b.dot].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); });
  labelBox.style.display = ''; leaderSvg.style.display = '';
  schemaWzEnde(); document.body.classList.remove('schema'); canvas.style.visibility = '';
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  var tt = $('toast'); tt.classList.remove('show'); tt.innerHTML = '';
  delete window.LungeApp;
};
applyVisibility();
setSelected(null);
applyLook();
return bauen().then(function () {
  if (abgebaut) return;
  applyVisibility();
  setSelected(selected);
  Kern.Export.pruefeZiel('exp');
  sackP = alveoleNetze();   /* das Saeckchen entsteht im Hintergrund; die Rueckkehr aus der Alveole wartet darauf */
  return umg.von === 'alveole' ? sackP : null;
}).then(function () {
  if (abgebaut) return;
  if (umg.von === 'alveole') rueckkehr();   /* Rueckweg aus dem Alveolen-Modell */
  blutErzeugen();   /* Herzschlag und Blut (Abschnitt 7f): zuletzt, damit es nichts verschiebt */
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('lunge', organ);
})();
