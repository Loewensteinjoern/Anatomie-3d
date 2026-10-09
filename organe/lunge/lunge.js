/* =====================================================================
   Lunge - Lappen, Atemwege und Atemmechanik
   Beide Lungenfluegel von vorn wie im Lehrbuch (Einheit cm, Achsen wie im Koerper: x + links, y oben, z vorn):
   fuenf Lappen (rechts 3, links 2) getrennt durch die Spalten, Luftroehre mit Knorpelspangen, Hauptbronchien und Bronchialbaum
   in den Lappen, Lungenarterien und -venen, Rippenfell, Zwerchfell, Brustkorb (Rippen, Brustbein, Zwischenrippenmuskeln) und das Herz
   zur Orientierung. Die Form liefert organe/lunge/lunge-form.js (Kern.Formen.lunge), das Herz kommt aus dem Herz-Modell (organe/herz/herz.js);
   hier wird sie vernetzt, eingefaerbt und bedient.
   Grundgeruest: Strukturen, Ausschnitte, Durchsicht, Beschriftung, Infokarte, Strukturliste. Die Rippen und Zwischenrippenbaender sind
   so gebaut, dass sie spaeter pro Bild bewegt werden koennen (Atmung): RIPPEN und baenderSetzen.
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
    txt: 'Das Herz liegt zwischen den Lungenflügeln, mit der Spitze nach links. Deshalb ist der linke Lungenflügel kleiner und hat die Herzbucht. Im Lungenmodell ist es nur zur Orientierung angedeutet.',
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
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bBrust" class="gh on" title="Rippen, Brustbein und Zwischenrippenmuskeln ein- oder ausblenden">Brustkorb</button>
    <span class="sep"></span>
    <button id="bSee" class="gh" title="Lungenlappen durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
  <div class="trow">
    <span class="cap">Atmung</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bSchema" class="gh" title="Die Atemmechanik als flaches Schema: Muskeln, Brustkorb, Druck und Luftstrom">Schema</button>
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

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#6F93E0">Blau</b> Lungenarterien &ndash; bringen sauerstoffarmes Blut aus der rechten Kammer.<br>
  <b style="color:#E0584C">Rot</b> Lungenvenen &ndash; f&uuml;hren sauerstoffreiches Blut zum linken Vorhof.<br>
  <b style="color:#3FB3D6">Petrol</b> Rippenfell und Pleuraspalt.</p>
  <p class="note">Von vorn gesehen; rechts im Bild liegt die linke Lunge.</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
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
var organ = { renderer: {}, aufbauen: aufbauen };
/* Mitte der Lunge im Koerper (cm): die Wurzelgruppe root ist um -M verschoben, die Lunge steht im Modell mittig (spaeter: Ziel der Kamerafahrt aus dem Koerper) */
var M = [0, 126, -0.5];
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, cm) und Kamera: gemeinsam fuer das Modell und spaeter fuer die Fahrt aus dem Koerper */
var UEBERSICHT = { ext: [36, 52], halb: 18.5 };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer Lunge und Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
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
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF, form = Kern.Formen && Kern.Formen.lunge;
if (!form) throw new Error('Die Form der Lunge ist nicht geladen.');
umg.bereich.innerHTML = MARKUP;
/* Herz-Modell nur als Skript nachladen (ohne Gestaltung): das Herz zur Orientierung und die Herzbucht der Lunge; ohne Modul gilt ein einfaches Ersatzherz */
var herzP = Kern.organLaden('herz', { ohneCss: true }).then(function (o) { return o.form || null; }, function (e) { console.warn(e && e.message || e); return null; });

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
var GLAS = 0.25;                                                                                /* Deckkraft der Lappen bei "Durchsicht" */
var MAT = {};
/* Material der Lappen kraeftiger als der Farbpunkt der Liste (die hellen Punktfarben wirken im Licht fast weiss); Unterlappen dunkler als Oberlappen */
var LAPPENFARBE = { oberlappenR: 0xE3A2A8, mittellappen: 0xDB949D, unterlappenR: 0xD0868F, oberlappenL: 0xE3A2A8, unterlappenL: 0xD0868F };
LAPPEN.forEach(function (sid) { MAT[sid] = mat(LAPPENFARBE[sid], { rough: 0.5, coat: 0.3, coatRough: 0.45 }); });
MAT.luftroehre = mat(0xC9D3D1, { rough: 0.5, coat: 0.25 });
MAT.spangen = mat(0xE6EDEB, { rough: 0.45, coat: 0.3 });                   /* Knorpelspangen der Luftroehre, etwas heller */
MAT.hauptbronchien = mat(0xBAC6C4, { rough: 0.5, coat: 0.25 });
MAT.bronchien = mat(0xA9B7B5, { rough: 0.5, coat: 0.25 });
MAT.pleura = mat(0x1B7F9E, { rough: 0.3, coat: 0.5, opacity: 0.22, side: THREE.DoubleSide });
MAT.herz = mat(0x8C4747, { rough: 0.55, coat: 0.25, opacity: 0.35 });
MAT.zwerchfell = mat(0xffffff, { rough: 0.6, side: THREE.DoubleSide, opacity: 0.85, vc: true });   /* Farbe je Eckpunkt: Muskel dunkler, Sehnenplatte (Centrum tendineum) in der Mitte heller */
MAT.zwischenrippen = mat(0xA24E4E, { rough: 0.6, opacity: 0.35, side: THREE.DoubleSide });
MAT.rippen = mat(0xD8CDB3, { rough: 0.8, env: 0.2 });
MAT.knorpel = mat(0xF4F6F2, { rough: 0.7, env: 0.25 });                    /* Rippenknorpel, heller als der Knochen */
MAT.brustbein = mat(0xD8CDB3, { rough: 0.8, env: 0.2 });   /* wie die Rippen */
MAT.wirbel = mat(0x8C8676, { rough: 0.85, env: 0.2 });                     /* Andeutung der Wirbelsaeule (keine Struktur) */
MAT.lungenarterien = mat(0x3F63B5, { rough: 0.4, coat: 0.3 });
MAT.lungenvenen = mat(0xC8372D, { rough: 0.4, coat: 0.3 });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

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
/* Rohre entlang von Linien { pts, r0, r1 } (Koerper-Koordinaten), Radius gleitet von r0 nach r1; Enden mit Kappe; alle zu einer Geometrie */
function rohre(linien) {
  var pos = [], nor = [], idx = [];
  linien.forEach(function (l) {
    var kurve = new THREE.CatmullRomCurve3(l.pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
    var rm = Math.max(l.r0, l.r1), rad = l.seiten || (rm > 0.5 ? 14 : rm > 0.2 ? 10 : 7), tub = l.segmente || Math.max(6, l.pts.length * 5);
    var g = new THREE.TubeGeometry(kurve, tub, rm, rad, false), p = g.attributes.position, n = g.attributes.normal, base = pos.length / 3, i, j;
    for (i = 0; i <= tub; i++) {   /* jeden Ring um seine Mitte auf den Radius an dieser Stelle skalieren */
      var f = (l.r0 + (l.r1 - l.r0) * (i / tub)) / rm, c0 = kurve.getPointAt(i / tub);
      for (j = 0; j <= rad; j++) { var v0 = i * (rad + 1) + j; p.setXYZ(v0, c0.x + (p.getX(v0) - c0.x) * f, c0.y + (p.getY(v0) - c0.y) * f, c0.z + (p.getZ(v0) - c0.z) * f); }
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
  return { geo: g, smp: smp, pos: HV };
}

/* Zwerchfell: Kuppelflaeche aus domY (rechts DOM_R, links DOM_L), knapp unter der Lungenbasis. Der Rand liegt dort, wo die Flaeche auf Hoehe des
   Rippenbogens (RAND_Y) ausstreicht; dazu in der Mitte ein flacher Streifen unter dem Herzen (Centrum tendineum, heller). Polargitter: Winkel mal
   Anteil des Wegs von der Mitte zum Rand, Ellipse der Brustwand. */
var RAND_Y = 113.5, MITTE_Y = 111.2;
function zwerchfellGeo() {
  var NA = 72, NR = 20, a, j, f;
  var hoehe = function (x, z) { return Math.max(form.domY(x, z, -6.5, form.DOM_R), form.domY(x, z, 6.5, form.DOM_L)); };
  var sehne = function (x, z) { var u = Math.sqrt(Math.pow(x / 5.5, 2) + Math.pow((z - 0.6) / 5.5, 2)); return 1 - Math.min(1, Math.max(0, (u - 0.7) / 0.5)); };   /* 1 in der Mitte, 0 aussen */
  var cm = srgb(0xA85A58), cs = srgb(0xDDB4A4);
  var pos = [], col = [], idx = [];
  for (a = 0; a < NA; a++) {
    var w = a / NA * 2 * PI, ca = 11.8 * Math.cos(w), sa = 9.4 * Math.sin(w), fe = 0.05;
    for (f = 1; f > 0.05; f -= 0.005) { var x0 = f * ca, z0 = 0.6 + f * sa; if (hoehe(x0, z0) >= RAND_Y || sehne(x0, z0) > 0.99) { fe = f; break; } }   /* aeusserster Punkt ueber dem Rand oder im Mittelstreifen */
    for (j = 0; j <= NR; j++) {
      var fj = fe * j / NR, x = fj * ca, z = 0.6 + fj * sa, t = sehne(x, z), y = hoehe(x, z);
      y += (Math.max(y, MITTE_Y) - y) * t;
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
var BAND_PUNKTE = 16;                    /* Stuetzpunkte je Rippe (rippeStuetz: 15 Abschnitte) */
/* Band zwischen Rippe i und i + 1 neu aus den Stuetzpunkten der beiden Rippen legen (untere Kante der oberen, obere Kante der unteren Rippe) */
function baenderSetzen(s, i) {
  var m = BAENDER[s][i], A = RIPPEN[s][i], B = RIPPEN[s][i + 1], p = m.geometry.attributes.position, k, r = form.RIP_R * 0.85;
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
      addMesh('rippen', gk, MAT.knorpel, 'Rippenknorpel ' + (i + 1) + (sd < 0 ? ' rechts' : ' links'), 2); tris.brustkorb += anz(gk);
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

/* Gefaesse: Lungenarterien (blau) und -venen (rot) bis in die Lappen, entlang der Lappenbronchien (aeste = Bronchialbaum der Form) */
function gefaesseBauen(aeste) {
  var art = [], ven = [];
  var offA = [0, 0.85, 0.55], offV = [0, -0.9, 0.5];
  var versch = function (pts, o, f) { return pts.map(function (p) { return [p[0] + o[0] * f, p[1] + o[1] * f, p[2] + o[2] * f]; }); };
  /* Truncus pulmonalis: vorderstes Gefaess (vorn ueber dem Herzen), teilt sich unter dem Aortenbogen; die Arterien laufen vor und ueber den
     Hauptbronchien zum Hilus. Die Venen liegen hinten-unten und muenden hinten in den linken Vorhof (hinter dem Herzen). */
  var rpaEnde = [-5.0, 126.8, -1.0], lpaEnde = [6.2, 127.6, -1.4];
  art.push({ pts: [[1.8, 124.8, 3.4], [1.7, 127.8, 2.4], [1.0, 129.2, 0.4]], r0: 0.95, r1: 0.88, segmente: 16 });                // Truncus pulmonalis
  art.push({ pts: [[1.0, 129.2, 0.4], [-2.4, 129.0, -0.6], rpaEnde], r0: 0.85, r1: 0.62 });                                   // rechte Lungenarterie
  art.push({ pts: [[1.0, 129.2, 0.4], [3.6, 129.6, -0.8], lpaEnde], r0: 0.85, r1: 0.62 });                                    // linke Lungenarterie
  var venEnde = { oben: { '-1': [-5.8, 122.2, -1.8], '1': [6.8, 122.0, -1.8] }, unten: { '-1': [-5.6, 120.4, -2.2], '1': [6.6, 119.8, -2.4] } };
  ven.push({ pts: [[1.0, 124.0, -2.2], [-2.2, 123.2, -2.3], venEnde.oben['-1']], r0: 0.62, r1: 0.55 });                        // rechte Lungenvenen
  ven.push({ pts: [[1.0, 122.6, -2.2], [-2.2, 121.8, -2.4], venEnde.unten['-1']], r0: 0.62, r1: 0.55 });
  ven.push({ pts: [[1.0, 124.0, -2.2], [3.6, 123.0, -2.3], venEnde.oben['1']], r0: 0.62, r1: 0.55 });                          // linke Lungenvenen
  ven.push({ pts: [[1.0, 122.6, -2.2], [3.6, 121.2, -2.4], venEnde.unten['1']], r0: 0.62, r1: 0.55 });
  LAPPEN.forEach(function (id) {
    var seite = id.slice(-1) === 'L' ? 1 : -1, a = aeste.filter(function (x) { return x.lappen === id && x.gen === 0; })[0];
    var g1 = aeste.filter(function (x) { return x.lappen === id && x.gen === 1; });
    var ae = seite < 0 ? rpaEnde : lpaEnde, ve = (id === 'unterlappenR' || id === 'unterlappenL') ? venEnde.unten[seite] : venEnde.oben[seite];
    var drin = function (pts, o, r) {   /* neben dem Bronchus, soweit der Lappen reicht: Versatz je Punkt verkleinern, bis das Gefaess im Lappen liegt */
      return pts.map(function (p) {
        for (var f = 1; f > 0.05; f -= 0.15) { var q = [p[0] + o[0] * f, p[1] + o[1] * f, p[2] + o[2] * f]; if (LAP[id](q[0], q[1], q[2]) < -(r + 0.1)) return q; }
        return p;
      });
    };
    art.push({ pts: [ae].concat(drin(a.pts.slice(1), offA, 0.5)), r0: 0.5, r1: 0.3 });
    ven.push({ pts: [ve].concat(drin(a.pts.slice(1), offV, 0.45)), r0: 0.45, r1: 0.28 });
    var innen = function (pts, r) { return pts.every(function (p) { return LAP[id](p[0], p[1], p[2]) < -(r + 0.15); }); };   /* Aeste bleiben im Lappen */
    g1.slice(0, 3).filter(function (b) { return innen(versch(b.pts, offA, 0.8), 0.3); }).slice(0, 2).forEach(function (b) { art.push({ pts: versch(b.pts, offA, 0.8), r0: 0.3, r1: 0.16 }); });
    g1.slice(0, 3).filter(function (b) { return innen(versch(b.pts, offV, 0.8), 0.28); }).slice(0, 1).forEach(function (b) { ven.push({ pts: versch(b.pts, offV, 0.8), r0: 0.28, r1: 0.14 }); });
  });
  var ga = rohre(art), gv = rohre(ven);
  addMesh('lungenarterien', ga, MAT.lungenarterien, 'Lungenarterien', 2); addMesh('lungenvenen', gv, MAT.lungenvenen, 'Lungenvenen', 2);
  tris.gefaesse += anz(ga) + anz(gv);
  return { arterie: art, vene: ven };
}

/* Aufbau: Herz -> Lappen -> Rippenfell -> Atemwege -> Gefaesse -> Zwerchfell -> Brustkorb (asynchron mit Ladebalken; nach jedem await prueft abgebaut) */
var LAP = {}, LH = null, GEF = null, BAUM = null, KAND = {}, KAND3 = {}, VIS = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
async function bauen() {
  await setLoad(0.02, 'Herz wird geformt'); if (abgebaut) return;
  var hform = await herzP; if (abgebaut) return;
  var hz = await herzBauen(hform); if (abgebaut || !hz) return;
  LH = hz.smp ? { smp: hz.smp, v: form.HERZ_V } : null;   /* Herzbucht nach dem Herzen; ohne Herz-Modell die Ersatz-Herzbucht der Form */
  var hm = addMesh('herz', hz.geo, MAT.herz, 'Herz (Lage)', 3); hm.position.set(hz.pos[0], hz.pos[1], hz.pos[2]); tris.herz = anz(hz.geo);
  await setLoad(0.2, 'Lungenlappen'); if (abgebaut) return;
  var alle = form.lappen(-1, LH).concat(form.lappen(1, LH)), n = 0;
  for (var i = 0; i < alle.length; i++) {
    var l = alle[i];
    LAP[l.id] = l.sdf;
    var g = await netz(l.sdf, l.grenzen, HL, weiter(0.2 + 0.32 * i / alle.length, 0.2 + 0.32 * (i + 1) / alle.length)); if (abgebaut) return;
    addMesh(l.id, g, MAT[l.id], STRUCT[l.id].de, 1); tris.lappen += anz(g);
  }
  await setLoad(0.54, 'Rippenfell'); if (abgebaut) return;
  var lg = {};
  for (var si = 0; si < 2; si++) {
    var s = si ? 1 : -1, f = form.fluegel(s, LH), gb = form.grenzen(s);
    lg[s] = f;
    var pg = await netz(function (x, y, z) { return f(x, y, z) - 0.45; }, [[gb[0][0] - 0.7, gb[0][1] - 0.7, gb[0][2] - 0.7], [gb[1][0] + 0.7, gb[1][1] + 0.7, gb[1][2] + 0.7]], HP, weiter(0.54 + 0.1 * si, 0.64 + 0.1 * si)); if (abgebaut) return;
    addMesh('pleura', pg, MAT.pleura, 'Rippenfell ' + (s < 0 ? 'rechts' : 'links'), 4); tris.pleura += anz(pg);
  }
  await setLoad(0.76, 'Atemwege'); if (abgebaut) return;
  luftroehreBauen();
  BAUM = form.bronchien(LH);
  var bg = rohre(BAUM.map(function (a) { return { pts: a.pts, r0: a.r0, r1: a.r1 }; }));
  addMesh('bronchien', bg, MAT.bronchien, 'Lappen- und Segmentbronchien', 2); tris.atemwege += anz(bg);
  await setLoad(0.82, 'Gefäße'); if (abgebaut) return;
  GEF = gefaesseBauen(BAUM);
  await setLoad(0.86, 'Zwerchfell'); if (abgebaut) return;
  var zg = zwerchfellGeo();
  addMesh('zwerchfell', zg, MAT.zwerchfell, 'Zwerchfell', 2); tris.brustkorb += anz(zg);
  await setLoad(0.9, 'Brustkorb'); if (abgebaut) return;
  brustkorbBauen(lg);
  await setLoad(0.96, 'Beschriftung'); if (abgebaut) return;
  ankerBerechnen();
}

/* =====================================================================
   3. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, brustAn = true, seeCam = false, brustHand = false, lv = 0;   /* lv: Version fuer die Beschriftung; seeCam: Durchsicht kommt vom Ausschnitt Bronchialbaum; brustHand: der Knopf Brustkorb wurde bedient (dann schaltet kein Ausschnitt ihn mehr) */
ORDER.forEach(function (s) { enabled[s.id] = true; });

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
function applyVisibility() {
  root.traverse(function (o) {
    if (!o.isMesh) return;
    var sid = o.userData.sid;
    o.visible = sid ? (enabled[sid] && (brustAn || BRUST.indexOf(sid) < 0)) : brustAn;   /* ohne Struktur: Andeutung der Wirbelsaeule, gehoert zum Brustkorb */
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
/* punkt (optional, Vector3 oder [x, y, z]): wo die Struktur angetippt wurde (spaeter z. B. fuer die Alveole) */
function setSelected(id, punkt) {
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
  /* Reiter (erweiterbar: weitere Namen und Bereiche kommen spaeter dazu, z. B. Hilfekarten, Ueben, Krankheiten) */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneAtmung = document.createElement('div'); paneAtmung.id = 'paneAtmung'; paneAtmung.innerHTML = ATMUNG_PANE;
  var panes = [rail, paneAtmung];
  ['Strukturen', 'Atmung'].forEach(function (name, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  $('rail').appendChild(tabs);
  panes.forEach(function (pn, k) { if (k) pn.style.display = 'none'; $('rail').appendChild(pn); });
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

function durchsicht(an) {
  seeThrough = an;
  $('bSee').classList.toggle('on', an);
  applyLook();
  lv++;
}
$('bSee').onclick = function () { seeCam = false; durchsicht(!seeThrough); };
function brust(an) {
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
  { name: 'Übersicht', theta: 0, phi: PI / 2, target: K3(0, 127, 0), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
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
  var hits = ray.intersectObjects(root.children, true), treffer = null, weich = null, punkt = null, weichPunkt = null;
  for (var i = 0; i < hits.length && !treffer; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || !sichtbar(o) || !enabled[sid]) continue;
    if (o.material.transparent) { if (!weich) { weich = sid; weichPunkt = hits[i].point; } }
    else { treffer = sid; punkt = hits[i].point; }
  }
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
  var fl = form.fluegel(-1, LH), pl = function (x, y, z) { return fl(x, y, z) - 0.45; };
  var herzS = LH ? function (x, y, z) { return LH.smp.val(x - LH.v[0], y - LH.v[1], z - LH.v[2]); } : sdfHerz;
  var rb = RIPPEN['-1'], rl = RIPPEN['1'];
  var bandMitte = function (s, i, k) { var q = BAENDER[s][i].geometry.attributes.position; return [(q.getX(k * 2) + q.getX(k * 2 + 1)) / 2, (q.getY(k * 2) + q.getY(k * 2 + 1)) / 2, (q.getZ(k * 2) + q.getZ(k * 2 + 1)) / 2]; };
  var dom = function (x, z) { return [x, Math.max(form.domY(x, z, -6.5, form.DOM_R), form.domY(x, z, 6.5, form.DOM_L)), z]; };
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
    if (!sid || sid === id || !sichtbar(o) || !enabled[sid] || o.material.transparent) continue;
    if (hits[i].distance < d - 0.3) return false;
  }
  return true;
}
function sichtPruefen(now, w, h) {
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, brustAn].join('|');
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
function layoutLabels(w, h) {
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, brustAn, sichtVer].join('|');
  if (key === lastKey) return;
  lastKey = key;
  var narrow = w < 1000, r = bereich(w, h), a = AUSSCHNITTE[aktiv];
  var pxcm = h / (2 * view.dist * Math.tan(camera.fov * PI / 360)), cx = (r.x0 + r.x1) / 2;
  var colL = Math.min(cx - 20, Math.max(r.x0 + r.labW + 4, cx - a.halb * pxcm - 12));
  var colR = Math.max(cx + 20, Math.min(r.x1 - r.labW - 4, cx + a.halb * pxcm + 12));
  var topL = narrow ? r.y0 : 100, topR = narrow ? Math.max(r.y0, 214) : $('tools').getBoundingClientRect().bottom + 16;
  var botL = narrow ? r.y1 - 6 : h - 40, botR = botL;
  var unten = $('info').classList.contains('show');   /* Infokarte unten links: Beschriftung links darueber */
  if (!narrow && unten) botL = Math.min(botL, h - 22 - $('info').offsetHeight - 24);
  var gap = narrow ? 27 : 36, items = [];
  Object.keys(LAB).forEach(function (id) { var b = LAB[id]; b.el.style.display = 'none'; b.ln.style.display = 'none'; b.dot.style.display = 'none'; });
  if (showLabels && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt die Lunge, ohne Beschriftung bleibt sie frei */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id] || (!brustAn && BRUST.indexOf(id) >= 0)) return;
      if (narrow && aktiv === 0 && HANDY_GROSS.indexOf(id) < 0) return;   /* Handy-Uebersicht: nur die grossen Strukturen, die Namen stehen dann neben dem Modell */
      var an = id in VIS ? VIS[id] : ((aktiv === 3 && KAND3[id]) || KAND[id] || [])[0];
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
   die IDs (Praefix lo), die Schleife (tick wird aus der Renderschleife gerufen, Pause), die Klasse on statt an bei den Knoepfen und die
   Suche der Bedienelemente nur im Reiter.
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
});
segment("data-muskel", function(w){
  el.muskeln.setAttribute("opacity", w === "aus" ? "0" : "1");
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
return { tick: tick, pause: function (an) { pausiert = an; }, lesen: lesen };
})();

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
function schemaMessen() {
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
  schemaOn = on;
  $('bSchema').classList.toggle('on', on);
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  if (on) {
    schemaMessen();
    if (window.ResizeObserver && !schemaWz) { schemaWz = new ResizeObserver(schemaMessen); schemaWz.observe($('tools')); }
  } else schemaWzEnde();
  canvas.style.visibility = on ? 'hidden' : '';
  lv++;
}
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };

/* =====================================================================
   8. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
var App = window.LungeApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, brust: brust, ansicht: ansicht, dreiecke: tris, atmung: atmen.lesen };
function loop(now) {
  atmen.tick(now);
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  if (!schemaOn) renderer.render(scene, camera);   /* bei offenem Schema ist die 3D-Ansicht ausgeblendet */
  sichtPruefen(now, window.innerWidth, window.innerHeight);
  layoutLabels(window.innerWidth, window.innerHeight);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  clearTimeout(Kern.toast._t);
  canvas.removeEventListener('click', canvasKlick);
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
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
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('lunge', organ);
})();
