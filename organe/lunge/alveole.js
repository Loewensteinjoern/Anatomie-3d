/* =====================================================================
   Alveole - Lungenbläschen und Gasaustausch
   Ein Alveolarsäckchen stark vergrößert (Modelleinheit 1 = 0,1 mm, also 100 µm; eine Alveole misst 0,2-0,3 mm, Radius 1,1-1,5): Bronchiolus
   respiratorius von oben, Alveolargang mit Alveolen ringsum, darunter das Säckchen als Traube verschmolzener Bläschen (Wand als dünne Schale),
   eine Alveole vorn aufgeschnitten, das Kapillarnetz auf der Außenseite (blau auf der Seite der Lungenarterie, rot auf der der Lungenvene) und
   die zuführenden und abführenden Gefäße. Achsen wie im Körper: x + links im Bild nach rechts, y oben, z zur Kamera. Alles aus Abstandsfeldern
   (Kern.SDF) und festen Tabellen, ohne Zufall.
   Grundgerüst: Strukturen, Ausschnitte, Durchsicht, aufgeschnitten/geschlossen, Beschriftung, Infokarte, Strukturliste. Andockpunkte für später:
   KAP_BAHNEN (Kapillarbahnen um die aufgeschnittene Alveole für die fließenden Gasteilchen) und OFFEN (Innenraum für die Gasteilchen), beide
   in AlveoleApp.daten; Teilchen kommen in eine eigene Gruppe `dyn` (noexport) und werden je Bild aus der Uhr gesetzt. organ.start für die Kamerafahrt.
   Reiter Krankheitsbilder und Medikamente (Kern.Szenarien, Daten Kern.Szenarien.daten.atmung): setzen die Werte des Gasaustauschs (gas.szenario, Abschnitt 5).
   ===================================================================== */
(function () {
'use strict';
/* =====================================================================
   Inhalte (Daten, getrennt vom Code)
   Strukturen: id (= userData.sid der Meshes), deutscher und lateinischer Name, Gruppe der Leiste, Farbpunkt (col), Text und Fakten der Infokarte.
   ===================================================================== */
var STRUKTUREN = [
  { id: 'bronchiolus', de: 'Bronchiolus respiratorius', lat: 'Bronchiolus respiratorius', grp: 'Atemwege', col: 0xBAC6C4,
    txt: 'Feinster Ast des Bronchialbaums, weniger als 0,5 mm weit. In seiner Wand sitzen schon die ersten Lungenbläschen – hier beginnt der Abschnitt, in dem Gasaustausch stattfindet. Knorpel gibt es hier nicht mehr.',
    facts: { 'Weite': 'unter 0,5 mm', 'Wand': 'ohne Knorpel, mit ersten Alveolen', 'Danach': 'Alveolargang' } },
  { id: 'gang', de: 'Alveolargang', lat: 'Ductus alveolaris', grp: 'Atemwege', col: 0xA9B7B5,
    txt: 'Kurzer Gang, dessen Wand ringsum aus Lungenbläschen besteht. Er führt die Luft in die Alveolarsäckchen.',
    facts: { 'Wand': 'ringsum Alveolen', 'Führt zu': 'Alveolarsäckchen' } },
  { id: 'alveolen', de: 'Alveolen (Lungenbläschen)', lat: 'Alveoli pulmonales', grp: 'Alveolen', col: 0xE6C7C9,
    txt: 'Winzige, dünnwandige Luftbläschen am Ende der Atemwege, traubenförmig zu Alveolarsäckchen gruppiert. Beide Lungen haben rund 300 Millionen davon – ausgebreitet etwa die Fläche eines halben Tennisplatzes. Durch ihre hauchdünne Wand wandern Sauerstoff und Kohlendioxid.',
    facts: { 'Durchmesser': 'ca. 0,2–0,3 mm', 'Anzahl': 'ca. 300 Millionen', 'Fläche': 'ca. 100 m²' } },
  { id: 'alveoleOffen', de: 'Aufgeschnittene Alveole', lat: 'Alveolus pulmonis', grp: 'Alveolen', col: 0xDDB9BC,
    txt: 'Eine Alveole ist hier aufgeschnitten, damit man hineinsehen kann. Innen ist Luft; die Wand ist nur Bruchteile eines Tausendstelmillimeters dick und innen von einem Flüssigkeitsfilm mit Surfactant ausgekleidet, der das Bläschen vor dem Zusammenfallen schützt.',
    facts: { 'Inhalt': 'Luft', 'Wand': 'hauchdünn', 'Innen': 'Surfactant-Film' } },
  { id: 'kapillaren', de: 'Kapillarnetz', lat: 'Rete capillare', grp: 'Blutgefäße', col: 0xB04A55,
    txt: 'Ein dichtes Netz feinster Blutgefäße umspinnt jede Alveole. Hier liegen Luft und Blut nur durch eine hauchdünne Wand getrennt – hier findet der Gasaustausch statt. Ein rotes Blutkörperchen braucht für den Weg um eine Alveole weniger als eine Sekunde.',
    facts: { 'Durchmesser': 'ca. 5–8 µm', 'Kontaktzeit': 'unter 1 Sekunde', 'Aufgabe': 'Gasaustausch' } },
  { id: 'arteriole', de: 'Ast der Lungenarterie', lat: 'Arteriola pulmonalis', grp: 'Blutgefäße', col: 0x3F63B5,
    txt: 'Bringt sauerstoffarmes Blut aus der rechten Herzkammer zu den Alveolen. Deshalb ist es hier blau dargestellt.',
    facts: { 'Blut': 'sauerstoffarm', 'Kommt aus': 'rechter Herzkammer' } },
  { id: 'venole', de: 'Ast der Lungenvene', lat: 'Venula pulmonalis', grp: 'Blutgefäße', col: 0xC8372D,
    txt: 'Sammelt das mit Sauerstoff beladene Blut aus dem Kapillarnetz und führt es über die Lungenvenen zum linken Vorhof.',
    facts: { 'Blut': 'sauerstoffreich', 'Fließt zu': 'linkem Vorhof' } }
];
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">Lunge &middot; Alveole</div>
  <h1>Lungenbl&auml;schen &amp; <em>Gasaustausch</em></h1>
  <div class="sub">Hier gelangt Sauerstoff ins Blut und Kohlendioxid hinaus.</div>
</div>

<div class="panel" id="tools">
  <div class="trow">
    <span class="cap">Ausschnitt</span>
    <button id="cam0" class="gh on">&Uuml;bersicht</button>
    <button id="cam1" class="gh">Alveole</button>
    <button id="cam2" class="gh">Kapillarnetz</button>
    <button id="cam3" class="gh">Bronchiolus</button>
  </div>
  <div class="trow">
    <span class="cap">Ansicht</span>
    <button id="bOffen" class="gh on" title="Eine Alveole vorn ist aufgeschnitten: Blick ins Innere">Aufgeschnitten</button>
    <button id="bZu" class="gh" title="Alle Alveolen sind geschlossen">Geschlossen</button>
    <span class="sep"></span>
    <button id="bSee" class="gh" title="Die Wand durchsichtig oder undurchsichtig zeigen">Durchsicht</button>
    <button id="bLab" class="gh on">Beschriftung</button>
  </div>
  <div class="trow">
    <span class="cap">Gasaustausch</span>
    <button id="bPlay" class="gh on">Pause</button>
    <button id="bSchema" class="gh" title="Der Gasaustausch als flaches Schema: Alveole, Kapillare, Blutk&ouml;rperchen und Ergebnis">Schema</button>
  </div>
</div>

<div class="panel" id="rail"></div>

<div class="panel" id="schema" aria-label="Schema Alveole und Kapillare">
  <div class="sch-head"><span class="kick">Schema &middot; Alveole und Kapillare</span>
  <button class="gh hbtn" id="bSchemaX" aria-label="Schema schlie&szlig;en">&times;</button></div>
  <div id="schemaBox">
  <div id="laBild">
    <svg id="laSvg" viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="Rundes Lungenbläschen mit ringförmig umlaufender Kapillare">

      <!-- ---------- Linke Spalte: Mini-Lunge ---------- -->
      <g id="laMiniLunge">
        <rect x="12" y="12" width="172" height="164" rx="10" fill="#FFFFFF" stroke="#C7D2CE" stroke-width="1.5"/>
        <text x="98" y="34" text-anchor="middle" font-family="var(--mono)" font-size="10" letter-spacing="2" fill="#8A9A96">ATMUNG</text>
        <path d="M98 42 L98 58" stroke="#A9B4B1" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M98 58 L82 68" stroke="#A9B4B1" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M98 58 L114 68" stroke="#A9B4B1" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse id="laMiniL1" cx="82" cy="88" rx="15" ry="20" fill="#E6D6D7" stroke="#8E6A6C" stroke-width="1.6"/>
        <ellipse id="laMiniL2" cx="114" cy="88" rx="15" ry="20" fill="#E6D6D7" stroke="#8E6A6C" stroke-width="1.6"/>
        <path id="laMiniZwerch" d="" fill="none" stroke="#A24E4E" stroke-width="5" stroke-linecap="round"/>
        <text id="laMiniText" x="98" y="160" text-anchor="middle" font-family="var(--mono)" font-size="11" font-weight="600" fill="#6E7C7A">Atempause</text>
      </g>

      <!-- ---------- Linke Spalte: Legende ---------- -->
      <g>
        <rect x="12" y="188" width="172" height="84" rx="10" fill="#FFFFFF" stroke="#C7D2CE" stroke-width="1.5"/>
        <circle id="laLegO2p" cx="32" cy="212" r="4.2" fill="var(--o2)"/>
        <text id="laLegO2t" x="46" y="217" font-family="var(--mono)" font-size="11.5" fill="#6E7C7A">Sauerstoff O₂</text>
        <circle id="laLegCO2p" cx="32" cy="236" r="4.2" fill="var(--co2)"/>
        <text id="laLegCO2t" x="46" y="241" font-family="var(--mono)" font-size="11.5" fill="#6E7C7A">Kohlendioxid CO₂</text>
        <text x="26" y="262" font-family="var(--mono)" font-size="10.5" fill="#8A9A96">viele Punkte = viel davon</text>
      </g>

      <!-- ---------- Linke Spalte: Die Regel ---------- -->
      <g>
        <rect x="12" y="284" width="172" height="126" rx="10" fill="#FFFFFF" stroke="var(--sog)" stroke-width="1.5"/>
        <rect x="12" y="284" width="5" height="126" rx="2.5" fill="var(--sog)"/>
        <text x="28" y="306" font-family="var(--mono)" font-size="10" letter-spacing="2" fill="var(--sog)">DIE REGEL</text>
        <g font-family="var(--sans)" font-size="13" fill="#16282F">
          <text x="28" y="330">Es wandert immer</text>
          <text x="28" y="349">von viel nach wenig –</text>
          <text x="28" y="368">und es hört auf,</text>
          <text x="28" y="387">sobald kein Unterschied</text>
          <text x="28" y="402">mehr da ist.</text>
        </g>
      </g>

      <g id="laBefund" opacity="0">
        <rect x="12" y="424" width="172" height="104" rx="10" fill="#FFF6E8" stroke="var(--warn)" stroke-width="1.5"/>
        <rect x="12" y="424" width="5" height="104" rx="2.5" fill="var(--warn)"/>
        <text x="28" y="446" font-family="var(--mono)" font-size="10" letter-spacing="2" fill="#8A6A1E">BEFUND</text>
        <g font-family="var(--sans)" font-size="12.5" fill="#16282F">
          <text id="laBef1" x="28" y="470"></text>
          <text id="laBef2" x="28" y="491"></text>
          <text id="laBef3" x="28" y="512"></text>
        </g>
      </g>

      <!-- ---------- Mitte: Alveole mit umlaufender Kapillare ---------- -->
      <path id="laKapWand" d="" fill="none" stroke="#C3A99A" stroke-width="52" stroke-linecap="round"/>
      <path id="laKapLumen" d="" fill="none" stroke="#FBF6F4" stroke-width="46" stroke-linecap="round"/>

      <path d="M335 121 L310 52" stroke="#C3A99A" stroke-width="30" stroke-linecap="round" fill="none"/>
      <path d="M335 121 L310 52" stroke="var(--blutarm)" stroke-width="24" stroke-linecap="round" fill="none" opacity=".55"/>
      <path d="M465 121 L490 52" stroke="#C3A99A" stroke-width="30" stroke-linecap="round" fill="none"/>
      <path id="laAbflussRohr" d="M465 121 L490 52" stroke="var(--blutreich)" stroke-width="24" stroke-linecap="round" fill="none" opacity=".55"/>
      <text x="296" y="40" text-anchor="middle" font-family="var(--mono)" font-size="11.5" fill="#6E7C7A">Blut kommt an</text>
      <text x="506" y="40" text-anchor="middle" font-family="var(--mono)" font-size="11.5" fill="#6E7C7A">Blut fließt ab</text>

      <!-- Luftweg -->
      <path id="laWegWand" d="M400 16 L400 168" stroke="#A9B4B1" stroke-width="30" stroke-linecap="round" fill="none"/>
      <path id="laWegLumen" d="M400 16 L400 168" stroke="#F4F7F5" stroke-width="24" stroke-linecap="round" fill="none"/>
      <g id="laEngeMarke" opacity="0">
        <path d="M366 95 L381 103 L366 111 Z" fill="var(--schlecht)"/>
        <path d="M434 95 L419 103 L434 111 Z" fill="var(--schlecht)"/>
      </g>
      <text x="422" y="26" font-family="var(--mono)" font-size="11.5" fill="#6E7C7A">von der Bronchiole</text>

      <!-- Alveole -->
      <circle id="laAlveole" cx="400" cy="300" r="148" fill="#F7F9F7" stroke="var(--wand)" stroke-width="3"/>
      <text x="400" y="300" text-anchor="middle" font-family="var(--mono)" font-size="12"
            letter-spacing="2.5" fill="#D8CFC6">ALVEOLE · LUFT</text>

      <g id="laAlvO2"></g>
      <g id="laAlvCO2"></g>
      <g id="laBlut"></g>
      <g id="laUebertritt"></g>

      <path d="M511 411 L596 486" stroke="#B0A093" stroke-width="1.5" fill="none"/>
      <text x="600" y="492" font-family="var(--mono)" font-size="11.5" fill="#8A7A6E">dünne Wand</text>

      <!-- ---------- Rechte Spalte: Ergebnis ---------- -->
      <g id="laErgebnis">
        <rect x="620" y="12" width="268" height="410" rx="10" fill="#FFFFFF" stroke="#C7D2CE" stroke-width="1.5"/>
        <text x="638" y="34" font-family="var(--mono)" font-size="10" letter-spacing="2" fill="#8A9A96">ERGEBNIS</text>
        <text id="laErgSz" x="638" y="56" font-family="var(--sans)" font-size="14" font-weight="700" fill="#16282F">Normale Ruheatmung</text>

        <text x="638" y="86" font-family="var(--mono)" font-size="10.5" letter-spacing="1.5" fill="#8A9A96">IN DER ALVEOLE</text>
        <text x="638" y="108" font-family="var(--mono)" font-size="12" fill="#6E7C7A">O₂</text>
        <rect x="668" y="96" width="200" height="15" rx="4" fill="#E7ECEA"/>
        <rect id="laBarAO" x="668" y="96" width="0" height="15" rx="4" fill="var(--o2)"/>
        <text x="638" y="132" font-family="var(--mono)" font-size="12" fill="#6E7C7A">CO₂</text>
        <rect x="668" y="120" width="200" height="15" rx="4" fill="#E7ECEA"/>
        <rect id="laBarAC" x="668" y="120" width="0" height="15" rx="4" fill="var(--co2)"/>

        <text x="638" y="166" font-family="var(--mono)" font-size="10.5" letter-spacing="1.5" fill="#8A9A96">IM BLUT DANACH</text>
        <text x="638" y="188" font-family="var(--mono)" font-size="12" fill="#6E7C7A">O₂</text>
        <rect x="668" y="176" width="200" height="15" rx="4" fill="#E7ECEA"/>
        <rect id="laBarBO" x="668" y="176" width="0" height="15" rx="4" fill="var(--o2)"/>
        <text x="638" y="212" font-family="var(--mono)" font-size="12" fill="#6E7C7A">CO₂</text>
        <rect x="668" y="200" width="200" height="15" rx="4" fill="#E7ECEA"/>
        <rect id="laBarBC" x="668" y="200" width="0" height="15" rx="4" fill="var(--co2)"/>

        <text x="638" y="248" font-family="var(--mono)" font-size="10.5" letter-spacing="1.5" fill="#8A9A96">GASAUSTAUSCH GERADE JETZT</text>
        <rect x="638" y="258" width="230" height="18" rx="5" fill="#E7ECEA"/>
        <rect id="laBarAus" x="638" y="258" width="0" height="18" rx="5" fill="var(--gut)"/>
        <line x1="787" y1="253" x2="787" y2="281" stroke="#16282F" stroke-width="2"/>
        <text x="787" y="295" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="#6E7C7A">normale Ruheatmung</text>
        <text id="laUrtAus" x="638" y="318" font-family="var(--sans)" font-size="14" font-weight="700" fill="var(--gut)">voll</text>

        <line x1="638" y1="336" x2="870" y2="336" stroke="#DCE3E1" stroke-width="1.5"/>
        <text x="638" y="362" font-family="var(--sans)" font-size="13.5" fill="#6E7C7A">Sauerstoff</text>
        <text id="laUrtO" x="870" y="362" text-anchor="end" font-family="var(--sans)" font-size="13.5" font-weight="700" fill="var(--gut)">in Ordnung</text>
        <text x="638" y="388" font-family="var(--sans)" font-size="13.5" fill="#6E7C7A">Kohlendioxid</text>
        <text id="laUrtC" x="870" y="388" text-anchor="end" font-family="var(--sans)" font-size="13.5" font-weight="700" fill="var(--gut)">in Ordnung</text>
        <text x="638" y="414" font-family="var(--sans)" font-size="13.5" fill="#6E7C7A">Säure-Basen-Lage</text>
        <text id="laUrtS" x="870" y="414" text-anchor="end" font-family="var(--sans)" font-size="13.5" font-weight="700" fill="var(--gut)">ausgeglichen</text>
      </g>
    </svg>

    <div id="laTempoBadge"><span>Tempo</span><b id="laTempoFaktor">¼×</b></div>
  </div>

  <div id="laKette">
    <div class="glied" id="laG1">
      <div class="marke"><i>1</i> <span id="laM1">Unterschied</span></div>
      <div class="wert" id="laW1">groß</div>
      <div class="dichte">
        <span>Alveole <u><i id="laD1a"></i></u></span>
        <span>Blut <u><i id="laD1b"></i></u></span>
      </div>
    </div>
    <div class="glied" id="laG2">
      <div class="marke"><i>2</i> Richtung</div>
      <div class="wert"><span class="pfeilGross" id="laP2">→</span><span id="laW2">in das Blut</span></div>
    </div>
    <div class="glied" id="laG3">
      <div class="marke"><i>3</i> Übertritt</div>
      <div class="wert" id="laW3">stark</div>
      <div class="balken"><i id="laB3"></i></div>
    </div>
    <div class="glied" id="laG4">
      <div class="marke"><i>4</i> Blut fließt ab</div>
      <div class="wert"><span class="tupfer" id="laT4"></span><span id="laW4">sauerstoffreich</span></div>
    </div>
  </div>
  </div>
</div>

<div class="panel" id="legend">
  <h4>Lesehilfe</h4>
  <p><b style="color:#6F93E0">Blau</b> sauerstoffarmes Blut aus der Lungenarterie.<br>
  <b style="color:#E0584C">Rot</b> sauerstoffreiches Blut zur Lungenvene.<br>
  <b style="color:#E8B4B8">Rosa</b> Alveolen, eine ist aufgeschnitten.</p>
  <p class="note">Stark vergr&ouml;&szlig;ert: Eine Alveole ist etwa 0,2&ndash;0,3&nbsp;mm gro&szlig;.</p>
</div>

<div class="panel" id="info">
  <button class="cls" id="bCls" aria-label="Schlie&szlig;en">&times;</button>
  <span class="lat" id="iLat"></span>
  <h3 id="iDe"></h3>
  <p id="iTx"></p>
  <dl id="iDl"></dl>
</div>

<div class="panel" id="scard">
  <button class="gh hbtn" id="sClose" aria-label="Schlie&szlig;en">&times;</button>
  <div class="kick" id="sKick"></div>
  <h3 id="sTitle"></h3>
  <div class="lead" id="sLead"></div>
  <div class="after" id="sAfter"></div>
  <div class="qa" id="sQa" style="display:none"><span class="score" id="sScore"></span><button class="gh" id="qNext">N&auml;chste</button><button class="gh" id="qStop">Beenden</button></div>
</div>`;
/* Reiter "Gasaustausch" (Regler und Schalter aus dem Alveolen-Modell; die IDs tragen das Praefix la). Die Statushinweise des Originals (laStAtemwege usw.) stehen
   im Reiter "Krankheitsbilder" (STATUS, unter der Liste). */
var STATUS = `<div class="status" id="laStatus">
  <span id="laStAtemwege">Atemwege frei</span>
  <span id="laStFlaeche">Austauschfläche normal</span>
  <span id="laStMuster">Atemmuster regelmäßig</span>
</div>`;
var GAS_PANE = `<div class="karte">
  <div class="titel"><span>Was soll sichtbar sein?</span></div>
  <div class="segment" id="laGasWahl">
    <button data-gas="o2" class="o2">nur O₂</button>
    <button data-gas="co2" class="co2">nur CO₂</button>
    <button data-gas="beide" class="on">beide</button>
  </div>
</div>

<div class="karte">
  <div class="titel"><span>Atemtiefe</span><b id="laLblTiefe">ruhig</b></div>
  <input type="range" id="laTiefe" min="0" max="100" value="50" aria-label="Wie tief geatmet wird">
  <div class="enden"><span>Atempause</span><span>tief</span></div>
  <div class="titel" style="margin-top:14px"><span>Atemfrequenz</span><b id="laLblFreq">ruhig</b></div>
  <input type="range" id="laFreq" min="0" max="100" value="50" aria-label="Wie schnell geatmet wird">
  <div class="enden"><span>langsam</span><span>schnell</span></div>
</div>

<div class="karte">
  <div class="titel"><span>Blutfluss</span><b id="laLblFluss">ruhig</b></div>
  <input type="range" id="laFluss" min="0" max="100" value="50" aria-label="Geschwindigkeit des Blutflusses">
  <div class="enden"><span>angehalten</span><span>schnell</span></div>
  <div class="schnell">
    <button class="gh" data-set="fluss" data-wert="0">Stopp</button>
    <button class="gh" data-set="fluss" data-wert="50">ruhig</button>
    <button class="gh" data-set="fluss" data-wert="100">schnell</button>
  </div>
</div>

<div class="karte">
  <label class="schalter" for="laFreiAn"><span>Freier Modus (O₂ selbst einstellen)</span>
    <input type="checkbox" id="laFreiAn"></label>
  <div id="laFreiFeld">
    <div class="titel" style="margin-top:8px"><span>O₂ in der Alveole</span></div>
    <input type="range" id="laFreiAlv" min="0" max="100" value="85" aria-label="Sauerstoff in der Alveole">
    <div class="titel"><span>O₂ im ankommenden Blut</span></div>
    <input type="range" id="laFreiBlut" min="0" max="100" value="28" aria-label="Sauerstoff im ankommenden Blut">
  </div>
</div>

<div class="karte">
  <div class="titel"><span>Tempo</span></div>
  <div class="segment" id="laTempoWahl">
    <button data-tempo="1">normal</button>
    <button data-tempo="0.5" class="on">langsam</button>
    <button data-tempo="0.25">Zeitlupe</button>
  </div>
</div>
`;
/* Hilfekarten und "Probier das aus" (aus dem Alveolen-Modell, Texte und HTML woertlich): t = Titel, u = Untertitel, h = Inhalt als HTML.
   Die Liste KARTEN_LISTE traegt die Knopftexte des Originals (data-karte) in dessen Reihenfolge. */
var karten = {
  diffusion: { t:"Diffusion – die eine Regel", u:"Von viel nach wenig",
    h:"<p><b>Diffusion</b> heißt: Teilchen verteilen sich von selbst dorthin, wo weniger von ihnen sind. Es gibt keine Pumpe, niemand transportiert sie.</p>"+
      "<ul><li>Je größer der Unterschied, desto mehr wandert.</li><li>Wird der Unterschied kleiner, wandert weniger.</li><li>Ist kein Unterschied mehr da, hört es auf – ganz von allein.</li></ul>"+
      "<div class='merk'>Verwechsle das nicht mit <b>Osmose</b>. Bei der Osmose wandert <b>Wasser</b> durch eine Membran. Beim Gasaustausch wandern <b>Gase</b> – das ist Diffusion.</div>" },
  wand: { t:"Die Alveole und die dünne Wand", u:"Warum das überhaupt funktioniert",
    h:"<p>Eine Alveole ist ein winziges, rundes Luftbläschen am Ende der Atemwege. Um sie herum liegt ein Netz feinster Blutgefäße, der <b>Kapillaren</b> – im Modell siehst du eine davon rundherum verlaufen.</p>"+
      "<p>Zwischen Luft und Blut liegt nur eine hauchdünne Wand. Sie ist so dünn, dass Gase mühelos hindurchwandern.</p>"+
      "<ul><li>Beide Lungen zusammen haben rund 300 Millionen Alveolen.</li><li>Ausgebreitet ergäbe das etwa die Fläche eines halben Tennisplatzes.</li></ul>"+
      "<div class='merk'>Wird diese Wand dicker oder legt sich Flüssigkeit dazwischen, wird der Weg länger und der Austausch schlechter. Deshalb geraten Menschen mit Wasser in der Lunge in Atemnot.</div>" },
  farbe: { t:"Warum das Blut die Farbe wechselt", u:"Hämoglobin",
    h:"<p>Der Sauerstoff schwimmt nicht einfach im Blut herum. Er wird an den <b>roten Blutfarbstoff Hämoglobin</b> in den roten Blutkörperchen gebunden.</p>"+
      "<p>Beladenes Hämoglobin ist hellrot, unbeladenes dunkel und bläulich. Deshalb wechseln die Blutkörperchen auf ihrer Rundreise um die Alveole von blau nach rot.</p><p>Im Modell trägt jedes Blutkörperchen beide Gase sichtbar in sich: oben die roten Sauerstoffpunkte, unten die graublauen Kohlendioxidpunkte. So kannst du beide direkt miteinander vergleichen.</p><div class='merk'>Vereinfachung: In Wirklichkeit wird der <b>Sauerstoff an Hämoglobin gebunden</b>, das <b>Kohlendioxid</b> dagegen zum größten Teil im Plasma transportiert. Für den Vergleich sind hier beide in der Zelle dargestellt.</div>"+
      "<div class='merk'>Bei einer Blutarmut ist zu wenig Hämoglobin da. Die Lunge arbeitet dann einwandfrei – und der Mensch ist trotzdem unterversorgt.</div>" },
  co2: { t:"Warum CO₂ andersherum wandert", u:"Zwei Wege, eine Regel",
    h:"<p>Es gilt genau dieselbe Regel – nur sind die Verhältnisse umgekehrt.</p>"+
      "<ul><li><b>Sauerstoff:</b> viel in der Alveole, wenig im ankommenden Blut → er wandert ins Blut.</li>"+
      "<li><b>Kohlendioxid:</b> viel im ankommenden Blut, wenig in der Alveole → es wandert in die Alveole und wird beim nächsten Ausatmen hinausbefördert.</li></ul>"+
      "<div class='merk'>Der Gasaustausch ist <b>kein Tausch</b>. Beide Gase wandern völlig unabhängig voneinander – jedes einfach dorthin, wo weniger davon ist.</div>" },
  ventil: { t:"Hyper- und Hypoventilation", u:"Zu viel und zu wenig Atmung",
    h:"<p>Beides verändert vor allem das <b>Kohlendioxid</b>. Der Sauerstoff folgt langsamer, weil er schon bei normaler Atmung fast vollständig aufgenommen wird.</p>"+
      "<ul><li><b>Hyperventilation:</b> zu tief und zu schnell. Es wird mehr CO₂ abgeatmet, als anfällt – der CO₂-Wert fällt unter die Norm. Typisch sind Kribbeln in Händen und um den Mund sowie Muskelkrämpfe.</li>"+
      "<li><b>Hypoventilation:</b> zu flach und zu langsam, etwa bei einer Schädigung des Atemzentrums, nach Opiatgabe oder bei Bewusstlosigkeit. CO₂ staut sich an, der Mensch wird müde und zunehmend benommen.</li></ul>"+
      "<div class='merk'>Merke dir die Richtung: <b>Wie viel jemand atmet, entscheidet in erster Linie über das CO₂.</b> Deshalb ist die Atemfrequenz ein so wichtiges Beobachtungskriterium.</div>" },
  obstruktiv: { t:"Asthma und COPD", u:"Wenn die Luft nicht mehr hinaus kommt",
    h:"<p>Bei beiden sind die Atemwege verengt. Das Problem ist vor allem das <b>Ausatmen</b>: Die Luft kommt hinein, aber nicht vollständig wieder heraus.</p>"+
      "<ul><li>Es bleibt Luft in der Lunge gefangen – sie wird <b>überbläht</b>. Im Modell siehst du das an der kleinen Lunge links: Sie bleibt größer als in Ruhe.</li>"+
      "<li>Weil weniger frische Luft nachkommt, staut sich CO₂ und der Sauerstoff fällt ab.</li>"+
      "<li>Bei der <b>COPD</b> kommt hinzu, dass Alveolen zerstört sind. Die Austauschfläche schrumpft, und der Sauerstoff schafft es selbst dann schlechter ins Blut, wenn in der Alveole genug davon ist.</li></ul>"+
      "<div class='merk'>Achte im Ergebnisfeld auf den Unterschied: Bei COPD ist der O₂ in der Alveole deutlich höher als im Blut danach. Genau das ist eine Diffusionsstörung.</div>" },
  saeure: { t:"Azidose und Alkalose", u:"Warum das CO₂ über den Säuregrad entscheidet",
    h:"<p>Kohlendioxid ist im Blut nicht neutral: Zusammen mit Wasser bildet es <b>Kohlensäure</b>. Je mehr CO₂ sich anstaut, desto saurer wird das Blut.</p>"+
      "<ul><li>Wird zu wenig geatmet, staut sich CO₂ an – das Blut übersäuert. Das ist die <b>respiratorische Azidose</b>.</li>"+
      "<li>Wird zu viel geatmet, wird zu viel CO₂ abgeatmet – das Blut wird zu basisch. Das ist die <b>respiratorische Alkalose</b>, typisch bei Hyperventilation.</li></ul>"+
      "<p>Im Modell siehst du das in der untersten Zeile des Ergebnisfeldes. Stelle nacheinander Hyperventilation und Azidose ein und beobachte, wie sie umspringt.</p>"+
      "<div class='merk'>Deshalb ist die Atmung nicht nur für den Sauerstoff zuständig. Sie ist zugleich die schnellste Stellschraube des Körpers für den Säuregrad des Blutes.</div>" },
  cheyne: { t:"Cheyne-Stokes-Atmung", u:"Atmung, die an- und abschwillt",
    h:"<p>Bei der Cheyne-Stokes-Atmung wechseln sich immer wieder dieselben Phasen ab: Die Atmung wird <b>tiefer und tiefer</b>, dann wieder <b>flacher und flacher</b>, und schließlich folgt eine <b>Atempause</b>. Danach beginnt alles von vorn.</p>"+
      "<p>Beobachte im Modell, was währenddessen passiert: In der Atempause fällt der Sauerstoff ab und das CO₂ staut sich an. In der tiefen Phase wird beides wieder ausgeglichen – oft sogar überschießend.</p>"+
      "<p>Sie tritt vor allem bei <b>Herzschwäche</b>, bei Schädigungen des Gehirns und in der Sterbephase auf. Die Steuerung im Atemzentrum reagiert dabei verzögert und schießt über das Ziel hinaus.</p>"+
      "<div class='merk'>Für die Pflege wichtig: Dieses Muster ist ein <b>Beobachtungsbefund</b>, den man dokumentiert und weitergibt. Zähle nicht nur die Atemzüge pro Minute, sondern achte auf das Muster und auf die Länge der Atempausen.</div>" },
  kreislauf: { t:"Warum der Kreislauf nicht anhalten darf", u:"Der Unterschied muss erhalten bleiben",
    h:"<p>Halte im Modell den Blutfluss an: Der Austausch läuft noch kurz weiter und kommt dann zum Erliegen. Nicht weil etwas kaputt ist, sondern weil sich Alveole und Blut angeglichen haben.</p>"+
      "<p>Nur weil ständig frisches, sauerstoffarmes Blut nachströmt und ständig frische Luft nachkommt, bleibt der Unterschied bestehen – und nur deshalb wandert überhaupt etwas.</p>"+
      "<div class='merk'>Atmung und Kreislauf sind deshalb nicht zwei getrennte Dinge. Fällt eines von beiden aus, nützt das andere allein nichts.</div>" },
  begriffe: { t:"Fachbegriffe zum Schreiben", u:"Schreibhilfe für deine Erläuterung",
    h:"<ul><li><b>Alveole</b> – Lungenbläschen</li><li><b>Kapillare</b> – feinstes Blutgefäß, umläuft die Alveole</li>"+
      "<li><b>Diffusion</b> – Wanderung von Teilchen von viel nach wenig</li><li><b>Gasaustausch</b> – Aufnahme von O₂ und Abgabe von CO₂</li>"+
      "<li><b>Erythrozyt</b> – rotes Blutkörperchen</li><li><b>Hämoglobin</b> – roter Blutfarbstoff, bindet den Sauerstoff</li>"+
      "<li><b>Hyperventilation / Hypoventilation</b> – zu viel bzw. zu wenig Atmung</li>"+
      "<li><b>Obstruktion</b> – Verengung der Atemwege</li><li><b>Überblähung</b> – Luft bleibt in der Lunge gefangen</li>"+
      "<li><b>Diffusionsstörung</b> – der Weg durch die Wand ist zu lang oder die Fläche zu klein</li></ul>"+
      "<div class='merk'>Beschreibe die Reihenfolge: Wo ist wovon viel, wo wenig? In welche Richtung wandert es deshalb? Und woran erkennst du am Blut, dass es geklappt hat?</div>" }
};
var KARTEN_LISTE = [["diffusion", "Diffusion – die eine Regel"], ["wand", "Die Alveole und die dünne Wand"], ["farbe", "Warum das Blut die Farbe wechselt"],
  ["co2", "Warum CO₂ andersherum wandert"], ["ventil", "Hyper- und Hypoventilation"], ["obstruktiv", "Asthma und COPD"], ["saeure", "Azidose und Alkalose"],
  ["cheyne", "Cheyne-Stokes-Atmung"], ["kreislauf", "Warum der Kreislauf nicht anhalten darf"], ["begriffe", "Fachbegriffe zum Schreiben"]];
var PROBIER = `      <ol>
        <li><b>Zähle die roten Punkte</b> in einem Blutkörperchen, wenn es oben links ankommt – und noch einmal, wenn es oben rechts abfließt. Zähle danach die roten Punkte in der Alveole. Wo waren vorher viele, wo wenige?</li>
        <li>Schalte auf <b>nur CO₂</b> und zähle dasselbe noch einmal. In welche Richtung sind hier viele und wenige verteilt?</li>
        <li>Blutfluss auf <b>Stopp</b>. Der Übertritt läuft aus und kommt von selbst zum Stillstand. Warum hört er auf, obwohl niemand ihn abschaltet?</li>
        <li>Atemtiefe ganz nach links (Atempause) und warten. Wie verändert sich die Punktdichte – und die Farbe des abfließenden Blutes?</li>
        <li>Auf <b>nur CO₂</b> schalten und die Zuleitung oben beobachten. Wann verlässt das CO₂ die Alveole – beim Einatmen oder beim Ausatmen?</li>
        <li>Vergleiche <b>Hyperventilation</b> und <b>Hypoventilation</b> im Ergebnisfeld rechts. Welcher Wert verändert sich stärker: O₂ oder CO₂?</li>
        <li>Stelle <b>Asthmaanfall</b> ein und schau auf die kleine Lunge links. Warum bleibt sie größer als in Ruhe, obwohl der Mensch zu wenig Luft bekommt?</li>
        <li>Bei <b>COPD</b>: Vergleiche im Ergebnisfeld den O₂ in der Alveole mit dem O₂ im Blut danach. Woran liegt es, dass beide nicht gleich sind?</li>
        <li>Blutfluss auf <b>schnell</b>. An welcher Stelle der Rundreise ist ein Blutkörperchen fertig beladen?</li>
        <li>Vergleiche den Balken <b>Gasaustausch</b> zwischen normaler Ruheatmung und <b>Asthmaanfall</b>. Zähle dazu die roten Punkte in einem abfließenden Blutkörperchen und schau, wie viele Moleküle den Bronchialast passieren.</li>
        <li>Stelle <b>Respiratorische Azidose</b> ein und lies die unterste Zeile im Ergebnisfeld. Woher kommt die Übersäuerung – aus dem Sauerstoff oder aus dem Kohlendioxid?</li>
        <li>Stelle <b>Cheyne-Stokes-Atmung</b> ein und beobachte eine volle Minute. Beschreibe, was mit den Werten während der Atempause passiert und was danach.</li>
      </ol>`;
var organ = { renderer: {}, aufbauen: aufbauen };
var PI = Math.PI, DEG = PI / 180;
/* Ausschnitt 'Uebersicht' (Breite und Hoehe im freien Bereich, Modelleinheiten) und Kamera: gemeinsam fuer das Modell und spaeter fuer die Fahrt aus der Lunge */
var UEBERSICHT = { ext: [10.4, 17.4], halb: 4.6, ziel: [0, 1.6, 0] };
var KAMERA_FOV = 38;                               /* wie die Kamera des Rahmens */
/* Freier Bereich fuer das Modell und die Beschriftung (Pixel); toolsOben/toolsUnten = Ober- und Unterkante der Werkzeugleiste */
function bereichFuer(w, h, toolsOben, toolsUnten) {
  if (w < 1000) return { x0: 0, x1: w, y0: 78, y1: Math.max(260, (toolsOben > 100 ? toolsOben : h * 0.6) - 6), labW: 104, fit: 104 };   /* Handy: links und rechts bleibt je eine Namensspalte (labW) frei, das Modell steht dazwischen */
  return { x0: 290, x1: w - 22, y0: Math.max(76, Math.ceil(toolsUnten) + 6), y1: h - 30, labW: 142, fit: 100 };
}
/* Kameraabstand, bei dem ext (Breite, Hoehe in Modelleinheiten) in den Bereich r passt */
function abstandFuer(ext, r, fov, h) {
  var th = Math.tan(fov * PI / 360);
  var pxcm = Math.min((r.y1 - r.y0) / ext[1], (r.x1 - r.x0 - 2 * r.fit) / ext[0]);
  return h / (2 * th * Math.max(pxcm, 0.5));
}
/* Werkzeugleiste vor dem Aufbau (noch nicht im DOM): Schaetzung ihrer Raender nach gemessener Hoehe (drei Zeilen: Desktop 115, Handy 100, dazu je 32,
   wenn eine der Reihen umbricht: unter Breite 379, dann unter 320); aufbauen misst sie selbst, die Werte stimmen ueberein. Die Leiste folgt dem Handy-Layout
   bis einschliesslich 1000 px (CSS), bereichFuer schaltet erst darunter um. */
function werkzeugRand(w, h) {
  if (w <= 1000) {
    var u = h - 6 - Math.floor(0.34 * h * 64) / 64;   /* Unterkante: ueber der Leiste (34vh), die der Browser auf 1/64 px abrundet */
    return { oben: u - (100 + (w < 379 ? 32 : 0) + (w < 320 ? 32 : 0)), unten: u };
  }
  return { oben: 18, unten: 18 + 115 };
}
/* Startansicht bei Fenstergroesse w x h: Kamera (Blickpunkt in Modell-Koordinaten) und View-Offset (Pixel); die Werte, mit denen aufbauen die Uebersicht zeigt */
organ.start = function (w, h) {
  var t = werkzeugRand(w, h), r = bereichFuer(w, h, t.oben, t.unten);
  return { theta: 0, phi: PI / 2, dist: abstandFuer(UEBERSICHT.ext, r, KAMERA_FOV, h), target: UEBERSICHT.ziel.slice(),
    versatz: [w / 2 - (r.x0 + r.x1) / 2, h / 2 - (r.y0 + r.y1) / 2] };
};

/* =====================================================================
   Form (feste Tabellen, Modelleinheit 0,1 mm): Rohre und Bläschen als Abstandsfeld
   ===================================================================== */
var Y_OBEN0 = 9.6;       /* der Bronchiolus ist hier abgeschnitten (offenes Ende) */
var K_SM = 0.35;         /* Weite der glatten Uebergaenge zwischen den Bläschen */
var ALV = [];            /* Bläschen: { c: Mitte, r: Radius, n: Richtung nach aussen (Einheitsvektor), offen } */
var OFFEN_I = -1;        /* Index der aufgeschnittenen Alveole in ALV */
(function tabelle() {
  function ring(y, n, R, r, a0, offenI) {
    for (var i = 0; i < n; i++) {
      var a = (a0 + 360 * i / n) * DEG, s = Math.sin(a), c = Math.cos(a);
      if (i === offenI) OFFEN_I = ALV.length;
      ALV.push({ c: [R * s, y, R * c], r: r, n: [s, 0, c], offen: i === offenI });
    }
  }
  /* In der Wand des Bronchiolus: drei einzelne Ausbuchtungen */
  [[40, 6.0, 0.9], [-75, 7.3, 0.85], [165, 5.4, 0.85]].forEach(function (q) {
    var a = q[0] * DEG, s = Math.sin(a), c = Math.cos(a);
    ALV.push({ c: [1.2 * s, q[1], 1.2 * c], r: q[2], n: [s, 0, c], offen: false });
  });
  ring(3.6, 4, 1.6, 1.05, 45);       /* Alveolargang: zwei Ringe zu je vier */
  ring(1.6, 4, 1.65, 1.1, 0);
  ring(-0.7, 5, 1.9, 1.3, 36);       /* Alveolarsäckchen: Traube aus 14 Bläschen */
  ring(-2.9, 5, 2.1, 1.45, 0, 0);    /* Bläschen 0 dieses Rings zeigt zur Kamera: die aufgeschnittene Alveole */
  ring(-4.7, 3, 1.5, 1.15, 60);
  ALV.push({ c: [0, -5.3, 0.1], r: 1.25, n: [0, -0.99, 0.12], offen: false });
})();
/* Aufgeschnitten: entfernt wird die vordere Kappe der Alveole OFFEN_I (Kugel um die Alveole, vor der Ebene z = zc) */
var SCHNITT_DZ = 0.3;    /* Ebene liegt so weit vor der Mitte der Alveole */

/* =====================================================================
   organ.form: Geometrie des Saeckchens fuer die Zoomstufe der Lunge (Kamerafahrt "Alveole hier ansehen"). Nur Funktionen und Daten (Modelleinheit wie oben,
   keine three.js-Objekte, kein Math.random); das Modell selbst nutzt sie nicht und bleibt unveraendert. Die Lunge vernetzt das Abstandsfeld mit groeberem
   Gitter (feld(H).wand), faerbt es (feld(H).farbe), baut aus kapillaren(F) und gefaesse(seite, punkte) die Rohre und setzt alles an den Endast
   des Bronchialbaums. Die Wand ist der aufgeschnittene Zustand des Modells (vordere Kappe der Alveole OFFEN_I fehlt, Kapillarnetz ohne diese Kappe).
   Gleiche Rechnung wie im Aufbau des Modells (Abstandsfeld, Farbe, Kapillarnetz, Gefaesse), Kapillarnetz und Gefaesse ohne die Feinheiten des Modells.
   ===================================================================== */
var FORM_GITTER = [[-4.0, -7.0, -4.0], [4.0, 9.8, 4.0]];   /* Grenzen des Gitters (wie im Aufbau des Modells) */
var FORM_STAMM = [[-3.2, 10.2, -0.2], [-3.3, 7.0, -0.2], [-3.4, 3.0, -0.2], [-3.65, -0.6, -0.2], [-3.95, -2.9, -0.2], [-4.0, -5.2, -0.2]];   /* Stamm der Arterie (links), die Vene spiegelt ihn */
var FORM_ASTHOEHEN = [8.0, 5.6, 3.0, 0.4, -1.8, -4.0];     /* y der Abzweigungen der Gefaessaeste */
/* Abstandsfeld der Schale mit Gitterweite H: wand(x, y, z) (aufgeschnitten, oben am Bronchiolus abgeschnitten), farbe(x, y, z) -> THREE.Color (linear, wiederverwendet),
   U (Luftraum), besitzer (Index des naechsten Koerpers), PA (Index des ersten Blaeschens), yOben, T (Dicke) */
function formFeld(H) {
  var S = Kern.SDF, srgb = Kern.srgb, T = 2.2 * H, K = K_SM, i;
  var PK = [{ s: false, a: [0, 10.8, 0], b: [0, 4.8, 0], r: 0.9, kl: 'bronchiolus' }, { s: false, a: [0, 4.8, 0], b: [0, -0.2, 0], r: 1.0, kl: 'gang' },
    { s: true, c: [0, -2.8, 0], r: 1.35, kl: 'alveolen' }, { s: true, c: [0, -4.3, 0], r: 1.0, kl: 'alveolen' }];
  var PA = PK.length;
  ALV.forEach(function (a, k) { PK.push({ s: true, c: a.c, r: a.r, kl: k === OFFEN_I ? 'alveoleOffen' : 'alveolen' }); });
  var mitteZelle = function (w, achse) { var o = FORM_GITTER[0][achse]; return o + (Math.round((w - o) / H - 0.5) + 0.5) * H; };
  var yOben = mitteZelle(Y_OBEN0, 1), OF = ALV[OFFEN_I], zc = mitteZelle(OF.c[2] + SCHNITT_DZ, 2), rc = OF.r + 0.18;
  function dPrim(p, x, y, z) {
    if (p.s) { var dx = x - p.c[0], dy = y - p.c[1], dz = z - p.c[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz) - p.r; }
    return S.kapsel(x, y, z, p.a[0], p.a[1], p.a[2], p.b[0], p.b[1], p.b[2], p.r);
  }
  function U(x, y, z) { var d = dPrim(PK[0], x, y, z); for (i = 1; i < PK.length; i++) d = S.smin(d, dPrim(PK[i], x, y, z), K); return d; }
  function besitzer(x, y, z) { var b = 0, bd = 1e9; for (var k = 0; k < PK.length; k++) { var d = dPrim(PK[k], x, y, z); if (d < bd) { bd = d; b = k; } } return b; }
  function schnitt(x, y, z) { return Math.max(S.kugel(x, y, z, OF.c[0], OF.c[1], OF.c[2], rc), zc - z); }
  function wand(x, y, z) { var u = U(x, y, z); return Math.max(Math.max(Math.max(u, -u - T), y - yOben), -schnitt(x, y, z)); }
  var BA = { bronchiolus: srgb(0xB4C3C1), gang: srgb(0xA6B6B4), alveolen: srgb(0xEDBABF), alveoleOffen: srgb(0xE6B0B6) }, KANTE = srgb(0xFFF3EE), C = new THREE.Color();
  var sm = function (t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  function farbe(x, y, z) {   /* Grundfarbe ueberblendet nach dem Abstand zu den Koerpern, innen dunkler, Kanten (oben, Schnitt) hell */
    var dB = 1e9, dG = 1e9, dA = 1e9, dO = 1e9, k, d, p;
    for (k = 0; k < PK.length; k++) {
      p = PK[k]; d = dPrim(p, x, y, z);
      if (p.kl === 'bronchiolus') { if (d < dB) dB = d; } else if (p.kl === 'gang') { if (d < dG) dG = d; }
      else if (p.kl === 'alveoleOffen') { if (d < dO) dO = d; } else if (d < dA) dA = d;
    }
    var wb = sm(0.5 + (dG - dB) / 0.5), wa = sm(0.5 + (Math.min(dB, dG) - Math.min(dA, dO)) / 0.5), wo = sm(0.5 + (dA - dO) / 0.5);
    var r = BA.gang.r + (BA.bronchiolus.r - BA.gang.r) * wb, g = BA.gang.g + (BA.bronchiolus.g - BA.gang.g) * wb, b = BA.gang.b + (BA.bronchiolus.b - BA.gang.b) * wb;
    var ar = BA.alveolen.r + (BA.alveoleOffen.r - BA.alveolen.r) * wo, ag = BA.alveolen.g + (BA.alveoleOffen.g - BA.alveolen.g) * wo, ab = BA.alveolen.b + (BA.alveoleOffen.b - BA.alveolen.b) * wo;
    r += (ar - r) * wa; g += (ag - g) * wa; b += (ab - b) * wa;
    var f = U(x, y, z) < -T * 0.5 ? 0.9 : 1;
    var ke = Math.max(Math.max(0, 1 - Math.abs(y - yOben) / 0.08), 1 - Math.abs(schnitt(x, y, z)) / 0.07);
    ke = Math.min(1, Math.max(0, ke)); ke = ke * ke * (3 - 2 * ke);
    return C.setRGB(r * f + (KANTE.r - r * f) * ke, g * f + (KANTE.g - g * f) * ke, b * f + (KANTE.b - b * f) * ke);
  }
  return { wand: wand, farbe: farbe, U: U, besitzer: besitzer, schnitt: schnitt, PA: PA, yOben: yOben, T: T };
}
/* Kapillarnetz der Aussenseite: Breiten- und Laengenkreise je Blaeschen auf die Wand projiziert (wie im Modell, Laeufe ohne die vordere Kappe);
   F = formFeld(H); Rueckgabe { linien: [{ pts, r }], punkte: alle Punkte } */
function formKapillaren(F) {
  var U = F.U, besitzer = F.besitzer, PA = F.PA, linien = [], punkte = [];
  var hash = function (i, j) { var s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };
  function flaeche(i, dx, dy, dz) {   /* Punkt auf der Aussenseite der Wand von Blaeschen i in Richtung d, null wenn dort die Wand eines anderen Koerpers liegt */
    var a = ALV[i], c = a.c, s = a.r * 0.55, ds = 0.04, smax = a.r + 1.0, x, y, z;
    while (s < smax) { s += ds; if (U(c[0] + dx * s, c[1] + dy * s, c[2] + dz * s) > 0) break; }
    if (s >= smax) return null;
    var lo = s - ds, hi = s;
    for (var k = 0; k < 14; k++) { var m = (lo + hi) / 2; if (U(c[0] + dx * m, c[1] + dy * m, c[2] + dz * m) > 0) hi = m; else lo = m; }
    s = (lo + hi) / 2; x = c[0] + dx * s; y = c[1] + dy * s; z = c[2] + dz * s;
    if (besitzer(x, y, z) !== PA + i) return null;
    var e = 0.03, gx = U(x + e, y, z) - U(x - e, y, z), gy = U(x, y + e, z) - U(x, y - e, z), gz = U(x, y, z + e) - U(x, y, z - e), gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
    return [x + gx / gl * 0.02, y + gy / gl * 0.02, z + gz / gl * 0.02];
  }
  function basis(n) {
    var u = [n[2], 0, -n[0]], l = Math.sqrt(u[0] * u[0] + u[2] * u[2]) || 1;
    u = [u[0] / l, 0, u[2] / l];
    return { u: u, v: [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]] };
  }
  var B = ALV.map(function (a) { return basis(a.n); });
  function punkt(i, th, ph) {
    var a = ALV[i], b = B[i], st = Math.sin(th), ct = Math.cos(th), cp = Math.cos(ph), sp = Math.sin(ph);
    var p = flaeche(i, a.n[0] * ct + (b.u[0] * cp + b.v[0] * sp) * st, a.n[1] * ct + (b.u[1] * cp + b.v[1] * sp) * st, a.n[2] * ct + (b.u[2] * cp + b.v[2] * sp) * st);
    return p && !(i === OFFEN_I && F.schnitt(p[0], p[1], p[2]) < 0.04) ? p : null;   /* in der entfernten Kappe: Unterbrechung */
  }
  function sammeln(folge, r) {   /* Folge von Punkten (null = Unterbrechung) in Laeufe teilen */
    var cur = [];
    var fertig = function () { if (cur.length >= 2) { linien.push({ pts: cur, r: r }); cur.forEach(function (p) { punkte.push(p); }); } cur = []; };
    folge.forEach(function (p) { if (p) cur.push(p); else fertig(); });
    fertig();
  }
  ALV.forEach(function (a, i) {
    var offen = i === OFFEN_I, rad = offen ? 0.06 : 0.05, j, k;
    var breiten = offen ? [30, 50, 70, 82, 90, 98, 110, 122] : [35, 60, 85, 110, 135], laengen = offen ? 12 : 7;
    breiten.forEach(function (gr, bk) {
      var th = (gr + (offen ? 0 : 5 * (hash(i, bk) - 0.5))) * PI / 180, folge = [];
      for (j = 0; j <= 36; j++) folge.push(punkt(i, th, j / 36 * 2 * PI + (offen ? 0 : 0.2 * hash(i, 9 + bk))));
      sammeln(folge, rad);
    });
    for (k = 0; k < laengen; k++) {
      var ph = (k / laengen + 0.04 * (offen ? 0 : hash(i, 40 + k))) * 2 * PI, folge = [];
      for (j = 0; j <= 18; j++) folge.push(punkt(i, (32 + j * 6.55) * PI / 180, ph));
      sammeln(folge, rad);
    }
  });
  return { linien: linien, punkte: punkte };
}
/* Zufuehrendes (seite -1, Arterie, links) und abfuehrendes Gefaess (seite +1, Vene): Stamm neben dem Bronchiolus, Aeste zum naechsten Punkt des Kapillarnetzes
   (punkte aus formKapillaren); Rueckgabe Linien { pts, r0, r1, seiten, segmente } */
function formGefaesse(seite, punkte) {
  var stamm = FORM_STAMM.map(function (p) { return [p[0] * (seite < 0 ? 1 : -1), p[1], p[2]]; });
  var linien = [{ pts: stamm, r0: 0.27, r1: 0.18, seiten: 14, segmente: 40 }];
  var stammPunkt = function (y) {
    for (var i = 0; i < stamm.length - 1; i++) {
      var a = stamm[i], b = stamm[i + 1];
      if (y <= a[1] && y >= b[1]) { var t = (a[1] - y) / (a[1] - b[1]); return [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t]; }
    }
    return stamm[stamm.length - 1].slice();
  };
  FORM_ASTHOEHEN.forEach(function (y) {
    var Tp = stammPunkt(y), best = null, bd = 1e9;
    punkte.forEach(function (p) {
      if (p[0] * seite < 0.2 || p[2] < -1.5) return;
      var d = (p[0] - Tp[0]) * (p[0] - Tp[0]) + (p[1] - Tp[1]) * (p[1] - Tp[1]) + (p[2] - Tp[2]) * (p[2] - Tp[2]);
      if (d < bd) { bd = d; best = p; }
    });
    if (!best) return;
    linien.push({ pts: [Tp, [(Tp[0] + best[0]) / 2, (Tp[1] + best[1]) / 2, (Tp[2] + best[2]) / 2 + 0.25], best], r0: 0.11, r1: 0.06, seiten: 8, segmente: 10 });
  });
  return linien;
}
organ.form = { gitter: FORM_GITTER, yOben: Y_OBEN0, feld: formFeld, kapillaren: formKapillaren, gefaesse: formGefaesse };

/* =====================================================================
   Aufbau
   ===================================================================== */
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
var S = Kern.SDF;
umg.bereich.innerHTML = MARKUP;

var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Strukturen, Materialien
   ===================================================================== */
var STRUCT = {}, ORDER = [];
STRUKTUREN.forEach(function (d) { d.meshes = []; STRUCT[d.id] = d; ORDER.push(d); });

var srgb = Kern.srgb;
function mat(hex, o) { return Kern.mat(hex, o || {}, envTex); }
var WAND = ['bronchiolus', 'gang', 'alveolen', 'alveoleOffen'];   /* Strukturen der Schale (bei "Durchsicht" Glas) */
var GLAS = 0.3;                                                    /* Deckkraft der Wand bei "Durchsicht" */
var MAT = {};
/* Farbe der Wand je Eckpunkt (vc): Grundfarbe je Struktur, innen etwas dunkler, die Schnittkante hell */
var BASIS = { bronchiolus: srgb(0xB4C3C1), gang: srgb(0xA6B6B4), alveolen: srgb(0xEDBABF), alveoleOffen: srgb(0xE6B0B6) };
var KANTE = srgb(0xFFF3EE);
WAND.forEach(function (sid) { MAT[sid] = mat(0xffffff, { vc: true, rough: 0.5, coat: 0.3, coatRough: 0.45 }); });
MAT.kapillaren = mat(0xffffff, { vc: true, rough: 0.45, coat: 0.2 });
MAT.arteriole = mat(0x3F63B5, { rough: 0.4, coat: 0.3 });
MAT.venole = mat(0xC8372D, { rough: 0.4, coat: 0.3 });
Object.keys(MAT).forEach(function (k) { MAT[k].name = k; });

var root = new THREE.Group(); root.name = 'Alveole'; scene.add(root);
var dyn = new THREE.Group(); dyn.name = 'dyn'; dyn.userData.noexport = true; root.add(dyn);   /* spaeter: Blutkoerperchen und Gasteilchen, je Bild aus der Uhr gesetzt */
var tris = { wand: 0, kapillaren: 0, gefaesse: 0 };
/* zustand: 'zu' = nur geschlossen sichtbar, 'offen' = nur aufgeschnitten sichtbar, sonst immer */
function addMesh(sid, geo, material, name, order, zustand) {
  var m = new THREE.Mesh(geo, material);
  m.name = name; m.renderOrder = order;
  m.userData.sid = sid; STRUCT[sid].meshes.push(m);
  if (zustand) m.userData.zustand = zustand;
  root.add(m);
  return m;
}
var anz = function (g) { return g.index ? g.index.count / 3 : g.attributes.position.count / 3; };
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var H = klein ? 0.09 : 0.07;     /* Gitterweite der Wand */
var T_WAND = 2.2 * H;            /* Dicke der Schale (zwei Gitterzellen, damit sie dicht bleibt) */
var GITTER = [[-4.0, -7.0, -4.0], [4.0, 9.8, 4.0]];
/* Schnittebenen in die Mitte einer Gitterzelle legen: Surface Nets setzt die Schnittflaeche dann eben und glatt, ohne Zacken */
function mitteZelle(w, achse) { var o = GITTER[0][achse]; return o + (Math.round((w - o) / H - 0.5) + 0.5) * H; }
var Y_OBEN = mitteZelle(Y_OBEN0, 1);

/* ---- Abstandsfeld ---- */
var PK = [];   /* Grundkörper: Rohre und Kugeln; kl = Struktur, zu der ihre Wand zaehlt */
PK.push({ s: false, a: [0, 10.8, 0], b: [0, 4.8, 0], r: 0.9, kl: 'bronchiolus' });
PK.push({ s: false, a: [0, 4.8, 0], b: [0, -0.2, 0], r: 1.0, kl: 'gang' });
PK.push({ s: true, c: [0, -2.8, 0], r: 1.35, kl: 'alveolen' });    /* gemeinsamer Raum des Säckchens */
PK.push({ s: true, c: [0, -4.3, 0], r: 1.0, kl: 'alveolen' });
var PA = PK.length;                                                /* ab hier die Bläschen */
ALV.forEach(function (a, i) { PK.push({ s: true, c: a.c, r: a.r, kl: i === OFFEN_I ? 'alveoleOffen' : 'alveolen' }); });
function dPrim(p, x, y, z) {
  if (p.s) { var dx = x - p.c[0], dy = y - p.c[1], dz = z - p.c[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz) - p.r; }
  return S.kapsel(x, y, z, p.a[0], p.a[1], p.a[2], p.b[0], p.b[1], p.b[2], p.r);
}
/* Luftraum (innen < 0): alle Körper glatt vereinigt */
function U(x, y, z) {
  var d = dPrim(PK[0], x, y, z);
  for (var i = 1; i < PK.length; i++) d = S.smin(d, dPrim(PK[i], x, y, z), K_SM);
  return d;
}
/* welcher Körper ist am naechsten (Index in PK) */
function besitzer(x, y, z) {
  var b = 0, bd = 1e9;
  for (var i = 0; i < PK.length; i++) { var d = dPrim(PK[i], x, y, z); if (d < bd) { bd = d; b = i; } }
  return b;
}
/* Schale: die Wand zwischen U = -T_WAND und U = 0; oben am Bronchiolus abgeschnitten */
function wand(x, y, z) {
  var u = U(x, y, z);
  return Math.max(Math.max(u, -u - T_WAND), y - Y_OBEN);
}
var OF = ALV[OFFEN_I], OF_ZC = mitteZelle(OF.c[2] + SCHNITT_DZ, 2), OF_RC = OF.r + 0.18;
/* entfernte Kappe der aufgeschnittenen Alveole (innen < 0) */
function schnitt(x, y, z) { return Math.max(S.kugel(x, y, z, OF.c[0], OF.c[1], OF.c[2], OF_RC), OF_ZC - z); }

/* Grundfarbe der Wand an einem Punkt: weich ueberblendet zwischen Bronchiolus, Gang, Alveolen und aufgeschnittener Alveole (nach dem Abstand zu den Koerpern),
   unabhaengig davon, zu welchem Teilnetz das Dreieck zaehlt - so bleibt der Uebergang glatt, auch wo die Teilnetze gezackt aneinanderstossen */
var WC = new THREE.Color();
function wandBasis(x, y, z) {
  var dB = 1e9, dG = 1e9, dA = 1e9, dO = 1e9, i, d, p;
  for (i = 0; i < PK.length; i++) {
    p = PK[i]; d = dPrim(p, x, y, z);
    if (p.kl === 'bronchiolus') { if (d < dB) dB = d; } else if (p.kl === 'gang') { if (d < dG) dG = d; }
    else if (p.kl === 'alveoleOffen') { if (d < dO) dO = d; } else if (d < dA) dA = d;
  }
  var sm = function (t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  var wb = sm(0.5 + (dG - dB) / 0.5);                 /* 1 = Bronchiolus */
  var wa = sm(0.5 + (Math.min(dB, dG) - Math.min(dA, dO)) / 0.5);   /* 1 = Bläschen */
  var wo = sm(0.5 + (dA - dO) / 0.5);                 /* 1 = aufgeschnittene Alveole */
  var r = BASIS.gang.r + (BASIS.bronchiolus.r - BASIS.gang.r) * wb, g = BASIS.gang.g + (BASIS.bronchiolus.g - BASIS.gang.g) * wb, b = BASIS.gang.b + (BASIS.bronchiolus.b - BASIS.gang.b) * wb;
  var ar = BASIS.alveolen.r + (BASIS.alveoleOffen.r - BASIS.alveolen.r) * wo, ag = BASIS.alveolen.g + (BASIS.alveoleOffen.g - BASIS.alveolen.g) * wo, ab = BASIS.alveolen.b + (BASIS.alveoleOffen.b - BASIS.alveolen.b) * wo;
  return WC.setRGB(r + (ar - r) * wa, g + (ag - g) * wa, b + (ab - b) * wa);
}

/* Netz in Teilnetze je Struktur zerlegen (Besitzer des Dreiecks) und Eckpunktfarben setzen; nur: nur diese Struktur behalten */
function aufteilen(geo, mitSchnitt, nur) {
  var P = geo.attributes.position.array, N = geo.attributes.normal.array, I = geo.index.array, nT = I.length / 3, t, c, g = {};
  WAND.forEach(function (k) { g[k] = []; });
  for (t = 0; t < nT; t++) {
    var a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, d = I[t * 3 + 2] * 3;
    var k = PK[besitzer((P[a] + P[b] + P[d]) / 3, (P[a + 1] + P[b + 1] + P[d + 1]) / 3, (P[a + 2] + P[b + 2] + P[d + 2]) / 3)].kl;
    if (!nur || k === nur) g[k].push(t);
  }
  var aus = {};
  WAND.forEach(function (kl) {
    var T = g[kl]; if (!T.length) return;
    var map = new Int32Array(P.length / 3).fill(-1), pos = [], nor = [], col = [], idx = [];
    T.forEach(function (tt) {
      for (c = 0; c < 3; c++) {
        var v = I[tt * 3 + c];
        if (map[v] < 0) {
          map[v] = pos.length / 3;
          var x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
          pos.push(x, y, z); nor.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]);
          var u = U(x, y, z), f = u < -T_WAND * 0.5 ? 0.9 : 1, bc = wandBasis(x, y, z);   /* Innenseite (Surfactant-Film) etwas dunkler */
          var ke = Math.max(0, 1 - Math.abs(y - Y_OBEN) / 0.08);
          if (mitSchnitt) ke = Math.max(ke, 1 - Math.abs(schnitt(x, y, z)) / 0.07);
          ke = Math.min(1, Math.max(0, ke)); ke = ke * ke * (3 - 2 * ke);
          col.push(bc.r * f + (KANTE.r - bc.r * f) * ke, bc.g * f + (KANTE.g - bc.g * f) * ke, bc.b * f + (KANTE.b - bc.b * f) * ke);
        }
        idx.push(map[v]);
      }
    });
    var ge = new THREE.BufferGeometry();
    ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    ge.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    ge.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    ge.setIndex(idx);
    aus[kl] = ge;
  });
  geo.dispose();
  return aus;
}

/* Rohre entlang von Linien { pts, r0, r1 }, Radius gleitet von r0 nach r1; Enden mit Kappe; alle zu einer Geometrie */
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

/* ---- Kapillarnetz: Breiten- und Laengenkreise je Bläschen, auf die Aussenseite der Wand projiziert ---- */
var KAP_R = 0.05, KAP_R_OFFEN = 0.06;   /* Radius der Kapillaren */
var BLAU = srgb(0x3F63B5), ROT = srgb(0xC8372D);
function hash(i, j) { var s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); }   /* feste Zufallszahl 0..1 aus (i, j) */
var KAP = { rest: [], kappe: [] };   /* Laeufe { pts, r }: rest = immer sichtbar, kappe = auf der vorderen Kappe der aufgeschnittenen Alveole (nur geschlossen) */
var KAP_PUNKTE = [];                 /* alle Punkte der Laeufe in rest (fuer Anschluesse und Anker) */
var KAP_BAHNEN = [];                 /* Daten fuer die Blutkoerperchen (spaeter): Mittellinien von der Arterienseite (links) zur Venenseite (rechts) um die aufgeschnittene Alveole */
/* Punkt auf der Aussenseite der Wand von Bläschen i in Richtung d (Einheitsvektor von der Mitte); null, wenn dort die Wand eines anderen Körpers liegt */
function flaechenpunkt(i, dx, dy, dz) {
  var a = ALV[i], c = a.c, s = a.r * 0.55, ds = 0.04, smax = a.r + 1.0, x, y, z;
  while (s < smax) { s += ds; if (U(c[0] + dx * s, c[1] + dy * s, c[2] + dz * s) > 0) break; }
  if (s >= smax) return null;
  var lo = s - ds, hi = s;
  for (var k = 0; k < 14; k++) { var m = (lo + hi) / 2; if (U(c[0] + dx * m, c[1] + dy * m, c[2] + dz * m) > 0) hi = m; else lo = m; }
  s = (lo + hi) / 2; x = c[0] + dx * s; y = c[1] + dy * s; z = c[2] + dz * s;
  if (besitzer(x, y, z) !== PA + i) return null;
  var e = 0.03, gx = U(x + e, y, z) - U(x - e, y, z), gy = U(x, y + e, z) - U(x, y - e, z), gz = U(x, y, z + e) - U(x, y, z - e), gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
  return [x + gx / gl * 0.02, y + gy / gl * 0.02, z + gz / gl * 0.02];   /* zur Haelfte in der Wand */
}
function basis(n) {   /* u, v senkrecht zu n; u zeigt bei n = +z nach +x */
  var u = [n[2], 0, -n[0]], l = Math.sqrt(u[0] * u[0] + u[2] * u[2]) || 1;
  u = [u[0] / l, 0, u[2] / l];
  var v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  return { u: u, v: v };
}
/* Folge von Punkten { p, k } (null = Unterbrechung) in Laeufe teilen; beim Wechsel zwischen Kappe und Rest ueberlappen die Laeufe um einen Punkt */
function sammeln(folge, radius) {
  var cur = [], curK = null, prev = null;
  function flush() { if (cur.length >= 2) (curK ? KAP.kappe : KAP.rest).push({ pts: cur, r: radius }); cur = []; }
  folge.forEach(function (e) {
    if (!e) { flush(); curK = null; prev = null; return; }
    if (curK === null) { curK = e.k; cur = [e.p]; }
    else if (e.k === curK) cur.push(e.p);
    else { cur.push(e.p); flush(); curK = e.k; cur = [prev, e.p]; }
    prev = e.p;
  });
  flush();
}
function punkt(i, th, ph) {   /* Punkt { p, k } bei Polarwinkel th (von n) und Umlaufwinkel ph, oder null */
  var a = ALV[i], B = a._b || (a._b = basis(a.n)), st = Math.sin(th), ct = Math.cos(th);
  var dx = a.n[0] * ct + (B.u[0] * Math.cos(ph) + B.v[0] * Math.sin(ph)) * st, dy = a.n[1] * ct + (B.u[1] * Math.cos(ph) + B.v[1] * Math.sin(ph)) * st, dz = a.n[2] * ct + (B.u[2] * Math.cos(ph) + B.v[2] * Math.sin(ph)) * st;
  var p = flaechenpunkt(i, dx, dy, dz);
  if (!p) return null;
  return { p: p, k: i === OFFEN_I && schnitt(p[0], p[1], p[2]) < 0.04 };
}
function kapillarnetz() {
  ALV.forEach(function (a, i) {
    var offen = i === OFFEN_I, rad = offen ? KAP_R_OFFEN : KAP_R, j, k;
    var breiten = offen ? [30, 50, 70, 82, 90, 98, 110, 122] : [35, 60, 85, 110, 135], laengen = offen ? 12 : 7;
    breiten.forEach(function (gr, bk) {   /* Breitenkreise (die Bahnen der aufgeschnittenen Alveole bleiben ohne Versatz) */
      var th = (gr + (offen ? 0 : 5 * (hash(i, bk) - 0.5))) * DEG, folge = [];
      for (j = 0; j <= 36; j++) folge.push(punkt(i, th, j / 36 * 2 * PI + (offen ? 0 : 0.2 * hash(i, 9 + bk))));
      sammeln(folge, rad);
    });
    for (k = 0; k < laengen; k++) {   /* Laengenkreise */
      var ph = (k / laengen + 0.04 * (offen ? 0 : hash(i, 40 + k))) * 2 * PI, folge = [];
      for (j = 0; j <= 18; j++) folge.push(punkt(i, (32 + j * 6.55) * DEG, ph));
      sammeln(folge, rad);
    }
  });
  KAP.rest.forEach(function (l) { l.pts.forEach(function (p) { KAP_PUNKTE.push(p); }); });
  /* Bahnen fuer die Blutkoerperchen: die Breitenkreise 82, 90 und 98 Grad der aufgeschnittenen Alveole (ohne Versatz, wie im Netz gezeichnet), ab dem oberen Punkt umlaufend
     in zusammenhaengende Stuecke geteilt (wo Nachbarbläschen die Wand verdecken, bricht sie ab), jedes von links (Arterienseite) nach rechts (Venenseite) gerichtet */
  [82, 90, 98].forEach(function (gr) {
    var run = [], fertig = function () {
      if (run.length >= 6) { if (run[0][0] > run[run.length - 1][0]) run.reverse(); KAP_BAHNEN.push({ pts: run, r: KAP_R_OFFEN, breite: gr }); }
      run = [];
    };
    for (var j = 0; j <= 48; j++) {
      var q = punkt(OFFEN_I, gr * DEG, PI / 2 + j / 48 * 2 * PI);
      if (q && !q.k) run.push(q.p); else fertig();
    }
    fertig();
  });
}
function farbeKap(g, c0, c1) {   /* Farbverlauf von c0 (links, Arterienseite) nach c1 (rechts, Venenseite) nach x; ohne Angabe blau nach rot, mit Angabe (Gasaustausch) wird die Farbe je Bild nachgefuehrt */
  c0 = c0 || BLAU; c1 = c1 || ROT;
  var p = g.attributes.position, a = g.attributes.color, col = a ? a.array : new Float32Array(p.count * 3), i;
  for (i = 0; i < p.count; i++) {
    var t = Math.min(1, Math.max(0, (p.getX(i) + 2.2) / 4.4)); t = t * t * (3 - 2 * t);
    col[i * 3] = c0.r + (c1.r - c0.r) * t; col[i * 3 + 1] = c0.g + (c1.g - c0.g) * t; col[i * 3 + 2] = c0.b + (c1.b - c0.b) * t;
  }
  if (a) a.needsUpdate = true; else g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
/* Zufuehrendes und abfuehrendes Gefaess: Stamm neben dem Bronchiolus, Aeste zum naechsten Punkt des Kapillarnetzes */
var STAMM = [[-3.2, 10.2, -0.2], [-3.3, 7.0, -0.2], [-3.4, 3.0, -0.2], [-3.65, -0.6, -0.2], [-3.95, -2.9, -0.2], [-4.0, -5.2, -0.2]];
var ASTHOEHEN = [8.0, 5.6, 3.0, 0.4, -1.8, -4.0];   /* y der Abzweigungen */
function stammPunkt(stamm, y) {   /* Punkt auf dem Stamm in Hoehe y (lineare Naeherung zwischen den Stuetzpunkten) */
  for (var i = 0; i < stamm.length - 1; i++) {
    var a = stamm[i], b = stamm[i + 1];
    if (y <= a[1] && y >= b[1]) { var t = (a[1] - y) / (a[1] - b[1]); return [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t]; }
  }
  return stamm[stamm.length - 1].slice();
}
function gefaesse(seite) {   /* seite -1: Arterie (links), +1: Vene (rechts) */
  var stamm = STAMM.map(function (p) { return [p[0] * (seite < 0 ? 1 : -1), p[1], p[2]]; });   /* die Tabelle STAMM liegt links (Arterie), die Vene spiegelt sie */
  var linien = [{ pts: stamm, r0: 0.27, r1: 0.18, seiten: 14, segmente: 40 }];
  ASTHOEHEN.forEach(function (y) {
    var T = stammPunkt(stamm, y), best = null, bd = 1e9;
    KAP_PUNKTE.forEach(function (p) {
      if (p[0] * seite < 0.2 || p[2] < -1.5) return;   /* auf der eigenen Seite, nicht ganz hinten */
      var d = (p[0] - T[0]) * (p[0] - T[0]) + (p[1] - T[1]) * (p[1] - T[1]) + (p[2] - T[2]) * (p[2] - T[2]);
      if (d < bd) { bd = d; best = p; }
    });
    if (!best) return;
    var mid = [(T[0] + best[0]) / 2, (T[1] + best[1]) / 2, (T[2] + best[2]) / 2 + 0.25];
    linien.push({ pts: [T, mid, best], r0: 0.11, r1: 0.06, seiten: 8, segmente: 10 });
  });
  return { stamm: stamm, linien: linien };
}

/* Aufbau: Wand (Feld, zwei Netze, Teilnetze) -> Kapillarnetz -> Gefaesse -> Anker */
var KAND = {}, KAND_OFFEN = {}, KAND_ZU = {}, VIS = {}, GEF = {};   /* VIS: gewaehlter Ankerpunkt je Struktur (null = verdeckt) */
var feldZu = null, feldOffen = null;
async function bauen() {
  await setLoad(0.02, 'Alveolen werden geformt'); if (abgebaut) return;
  var G = S.makeGrid(GITTER, H);
  var F = await S.evalFeld(G, wand, function (f) { return setLoad(0.02 + 0.5 * f); }); if (abgebaut) return;
  var Fc = new Float32Array(F.length), i, j, k;   /* aufgeschnitten: dieselbe Schale ohne die vordere Kappe */
  for (k = 0; k < G.nz; k++) for (j = 0; j < G.ny; j++) for (i = 0; i < G.nx; i++) {
    var ix = i + G.nx * (j + G.ny * k);
    Fc[ix] = Math.max(F[ix], -schnitt(G.o[0] + i * H, G.o[1] + j * H, G.o[2] + k * H));
  }
  feldZu = { G: G, F: F }; feldOffen = { G: G, F: Fc };
  await setLoad(0.55, 'Wand'); if (abgebaut) return;
  var gz = aufteilen(S.geometrie(G, F), false);
  await setLoad(0.68, 'Wand'); if (abgebaut) return;
  var go = aufteilen(S.geometrie(G, Fc), true, 'alveoleOffen');
  if (abgebaut) return;
  addMesh('bronchiolus', gz.bronchiolus, MAT.bronchiolus, 'Bronchiolus respiratorius', 2);
  addMesh('gang', gz.gang, MAT.gang, 'Alveolargang', 2);
  addMesh('alveolen', gz.alveolen, MAT.alveolen, 'Alveolen', 2);
  addMesh('alveoleOffen', gz.alveoleOffen, MAT.alveoleOffen, 'Alveole (geschlossen)', 2, 'zu');
  addMesh('alveoleOffen', go.alveoleOffen, MAT.alveoleOffen, 'Alveole (aufgeschnitten)', 2, 'offen');
  tris.wand = anz(gz.bronchiolus) + anz(gz.gang) + anz(gz.alveolen) + anz(gz.alveoleOffen) + anz(go.alveoleOffen);
  await setLoad(0.78, 'Kapillarnetz'); if (abgebaut) return;
  kapillarnetz();
  [['rest', null], ['kappe', 'zu']].forEach(function (q) {
    var g = rohre(KAP[q[0]].map(function (l) { return { pts: l.pts, r0: l.r, r1: l.r, seiten: 5, segmente: Math.max(3, l.pts.length - 1) }; }));
    farbeKap(g);
    addMesh('kapillaren', g, MAT.kapillaren, q[0] === 'rest' ? 'Kapillarnetz' : 'Kapillarnetz (vordere Kappe)', 3, q[1]); tris.kapillaren += anz(g);
  });
  await setLoad(0.9, 'Gefäße'); if (abgebaut) return;
  GEF.arteriole = gefaesse(-1); GEF.venole = gefaesse(1);
  ['arteriole', 'venole'].forEach(function (id) {
    var g = rohre(GEF[id].linien);
    addMesh(id, g, MAT[id], STRUCT[id].de, 3); tris.gefaesse += anz(g);
  });
  await setLoad(0.96, 'Beschriftung'); if (abgebaut) return;
  gas3DBauen();
  ankerBerechnen();
}

/* =====================================================================
   2. Zustand, Bedienung
   ===================================================================== */
var enabled = {}, selected = null, showLabels = true, seeThrough = false, seeCam = false, offenAn = true, lv = 0;   /* lv: Version fuer die Beschriftung; seeCam: Durchsicht kommt vom Ausschnitt Kapillarnetz */
ORDER.forEach(function (s) { enabled[s.id] = true; });

function sichtbar(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
/* Durchscheinende Huelle, die beim Antippen und in der Sichtpruefung wie ein undurchsichtiges Netz zaehlt (hier keine: auch die Glaswand zaehlt nur, wenn dahinter nichts anderes liegt) */
function weichMat(o) { return o.material.transparent; }
/* Teilchen des Gasaustauschs (userData.teilchen): Punkte im Blut (Netz, Arterie, Vene; je Bahn nach enabled), Gasteilchen mit der aufgeschnittenen Alveole (innen sichtbar, wenn
   sie offen ist oder die Wand durchsichtig) */
function teilchenSichtbar(art) { return art === 'gas' ? !!enabled.alveoleOffen && (offenAn || seeThrough) : !!(enabled.kapillaren || enabled.arteriole || enabled.venole); }
function applyVisibility() {
  root.traverse(function (o) {
    if (!o.isMesh) return;
    if (o.userData.teilchen) { o.visible = teilchenSichtbar(o.userData.teilchen); return; }
    var sid = o.userData.sid, z = o.userData.zustand;
    o.visible = !!sid && enabled[sid] && (!z || (z === 'offen') === offenAn);
  });
  lv++;
}
/* Glas (Durchsicht) der Wand; Material nur neu uebersetzen, wenn sich transparent aendert */
function stelleMat(m, transparent, opacity) {
  var neu = m.transparent !== transparent;
  m.transparent = transparent; m.opacity = opacity; m.depthWrite = !transparent;
  if (neu) m.needsUpdate = true;
}
function applyLook() {
  WAND.forEach(function (sid) { stelleMat(MAT[sid], seeThrough, seeThrough ? GLAS : 1); });
}
/* punkt (optional, Vector3 oder [x, y, z]): wo die Struktur angetippt wurde */
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
  box.classList.add('show');
  kartenLage();
}

/* Krankheitsbilder und Medikamente (Kern.Szenarien, gemeinsame Daten mit der Lunge: Kern.Szenarien.daten.atmung): Reiter und Erklaerkarte (id kcard) unten links wie die
   Infokarte. Wirkung: beim Wechsel setzt gas.szenario die Werte des Original-Handlers (sofort, kein Ueberblenden); "Eigene Einstellung" (Regler bewegt) schliesst
   Karte und Liste (gas.beiEigene, unten nach dem Gasaustausch). */
var SZ_DATEN = Kern.Szenarien.daten.atmung, szEigen = false;
var SZ = Kern.Szenarien({
  daten: SZ_DATEN, karte: 'kcard', ausTitel: 'Krankheitsbild oder Medikament ausschalten',
  beimWechsel: function (id) {
    if (id) {                                          /* Hilfekarte, Info und Ueben weichen der Szenariokarte */
      if (quiz) quizEnd();
      setSelected(null); closeCard();
      if (window.innerWidth <= 1000) szWeichen();      /* Handy: die Karte deckt das Modell, sie beginnt eingeklappt (Titelzeile) */
    }
    if (!szEigen) {
      var sc = id ? SZ_DATEN.filter(function (x) { return x.id === id; })[0] : null, m = sc && sc.modell;
      gas.szenario(m ? m.sz : null, m && sc.kind === 'drug' ? { name: sc.name, o: m.o, frisch: m.frisch, spaeter: m.spaeter } : null);
    }
    kartenLage();
  },
  beimEinklappen: function () {
    if (SZ.offen) { if (quiz) quizEnd(); setSelected(null); closeCard(); }   /* wieder aufgeklappt: die anderen Karten weichen */
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
  SZ.el.classList.toggle('weg', $('scard').classList.contains('show') || $('info').classList.contains('show'));
  lv++;
}

(function leiste() {
  /* Reiter: Strukturen, Gasaustausch, Hilfekarten, Ueben, Krankheitsbilder, Medikamente */
  var tabs = document.createElement('div'); tabs.className = 'tabs';
  var rail = document.createElement('div'); rail.id = 'paneStruct';
  var paneGas = document.createElement('div'); paneGas.id = 'paneGas'; paneGas.innerHTML = GAS_PANE;
  var paneH = document.createElement('div'); paneH.id = 'paneHelp';
  var paneU = document.createElement('div'); paneU.id = 'paneUeben';
  var paneD = document.createElement('div'); paneD.id = 'paneDis';
  var paneM = document.createElement('div'); paneM.id = 'paneMed';
  var panes = [rail, paneGas, paneH, paneU, paneD, paneM];
  ['Strukturen', 'Gasaustausch', 'Hilfekarten', '\u00dcben', 'Krankheitsbilder', 'Medikamente'].forEach(function (name, k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === 0 ? ' on' : ''); b.textContent = name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on'); panes.forEach(function (pn, pk) { pn.style.display = pk === k ? '' : 'none'; });
    });
    tabs.appendChild(b);
  });
  $('rail').appendChild(tabs);
  panes.forEach(function (pn, k) { if (k) pn.style.display = 'none'; $('rail').appendChild(pn); });
  /* Krankheitsbilder (mit den Statushinweisen des Originals darunter), Medikamente */
  SZ.liste(paneD, 'disease', 'Krankheitsbilder', 'W\u00e4hle ein Krankheitsbild \u2013 die Simulation und das Schema zeigen die Wirkung.');
  paneD.insertAdjacentHTML('beforeend', STATUS);
  SZ.liste(paneM, 'drug', 'Medikamente', 'W\u00e4hle ein Medikament \u2013 es wirkt an dem genannten Krankheitsbild.');
  /* Hilfekarten: die zehn Karten des Alveolen-Modells und "Probier das aus" (Muster wie bei der Lunge) */
  var ih = document.createElement('p'); ih.className = 'dis-intro'; ih.textContent = 'Kurz erkl\u00e4rt \u2013 tippe eine Karte an, sie erscheint unten.'; paneH.appendChild(ih);
  KARTEN_LISTE.concat([['probier', 'Probier das aus']]).forEach(function (c) {
    var d = document.createElement('div'); d.className = 'dis'; d.tabIndex = 0; d.dataset.card = c[0];
    d.innerHTML = '<span><b></b></span>'; d.querySelector('b').textContent = c[1];
    d.addEventListener('click', function () { openHelp(c[0]); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter') openHelp(c[0]); });
    paneH.appendChild(d);
  });
  /* Ueben: Strukturen finden */
  var iu = document.createElement('p'); iu.className = 'dis-intro'; iu.textContent = 'Finde die gesuchte Struktur am Modell und tippe sie an. Die Beschriftung verschwindet solange.'; paneU.appendChild(iu);
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

/* Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Inhalt als HTML (die Hilfekarten bringen ihr HTML aus dem Alveolen-Modell mit); unten links wie die Infokarte */
function showCard(kick, title, html, istQuiz) {
  $('sKick').textContent = kick; $('sTitle').textContent = title;
  $('sLead').innerHTML = html;
  $('sAfter').innerHTML = '';
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
  var k = key === 'probier' ? { t: 'Probier das aus', u: 'Hilfekarte', h: PROBIER } : karten[key]; if (!k) return;
  if (quiz) quizEnd();
  document.querySelectorAll('.dis[data-card]').forEach(function (d) { d.classList.toggle('on', d.dataset.card === key); });
  showCard(k.u, k.t, k.h, false);
}
/* Ueben: "Tippe auf: ..." - nur Strukturen, die in der aktuellen Ansicht sichtbar (eingeschaltet) sind */
var quiz = null, quizT = null;   /* Ueben "Strukturen finden": { n, ok, target, last, wait } */
function quizPool() {
  return ORDER.filter(function (s) { return s.meshes.length && enabled[s.id]; }).map(function (s) { return s.id; });
}
function quizNext() {
  var pool = quizPool(); if (!pool.length) return quizEnd();
  var id; do { id = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && id === quiz.last);
  quiz.target = id; quiz.last = id; quiz.wait = false;
  showCard('\u00dcben', 'Tippe auf: ' + STRUCT[id].de, 'Drehe das Modell, wenn du die Struktur nicht gleich siehst.', true);
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
  applyVisibility();   /* Gasteilchen in der geschlossenen Alveole sind bei Durchsicht zu sehen */
  if (quiz) { if (quiz.target) leuchte(quiz.target, false); clearTimeout(quizT); quizNext(); }   /* andere Ansicht: neue Aufgabe aus den jetzt sichtbaren Strukturen */
}
$('bSee').onclick = function () { seeCam = false; durchsicht(!seeThrough); };
/* aufgeschnitten oder geschlossen: die aufgeschnittene Alveole (und ihre vordere Kappe des Kapillarnetzes) wechselt, der Anker der Beschriftung folgt */
function offen(an) {
  offenAn = an;
  $('bOffen').classList.toggle('on', an);
  $('bZu').classList.toggle('on', !an);
  KAND.alveoleOffen = an ? KAND_OFFEN.alveoleOffen : KAND_ZU.alveoleOffen;
  VIS = {};
  applyVisibility();
}
$('bOffen').onclick = function () { offen(true); };
$('bZu').onclick = function () { offen(false); };
$('bCls').onclick = function () { setSelected(null); };
$('bLab').onclick = function () {
  showLabels = !showLabels;
  this.classList.toggle('on', showLabels);
  $('labels').style.display = showLabels ? '' : 'none';
  $('leaders').style.display = showLabels ? '' : 'none';
  lv++;
};

/* =====================================================================
   3. Kamera: Ausschnitte, freier Bildbereich
   ===================================================================== */
/* ext = Breite und Hoehe, die im freien Bereich ganz sichtbar sein sollen; halb = halbe Breite, die die Beschriftungsspalten freilassen */
var AUSSCHNITTE = [
  { name: 'Übersicht', theta: 0, phi: PI / 2, target: V(UEBERSICHT.ziel[0], UEBERSICHT.ziel[1], UEBERSICHT.ziel[2]), ext: UEBERSICHT.ext, halb: UEBERSICHT.halb },
  { name: 'Alveole', theta: 0, phi: 1.5, target: V(OF.c[0], OF.c[1], OF.c[2] - 0.5), ext: [8.4, 8.2], halb: 4.0 },
  { name: 'Kapillarnetz', theta: -0.4, phi: 1.45, target: V(-0.7, -2.6, 1.9), ext: [5.2, 5.4], halb: 2.8 },
  { name: 'Bronchiolus', theta: 0, phi: PI / 2, target: V(0, 5.6, 0), ext: [8.4, 6.4], halb: 4.2 }
];
var view = { theta: 0, phi: PI / 2, dist: 31, target: AUSSCHNITTE[0].target.clone() };
var orbit = Kern.orbit(canvas, view, { minDist: 3.5, maxDist: 70 });
var aktiv = 0, fitDist = 0;
/* Freier Bereich fuer das Modell und die Beschriftung (Pixel): Desktop rechts der Leiste, Handy zwischen Titel und Werkzeugleiste */
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
  /* Kapillarnetz: die Wand wird durchsichtig; beim Verlassen wieder undurchsichtig, wenn der Knopf nicht selbst bedient wurde */
  if (i === 2 && !seeThrough) { seeCam = true; durchsicht(true); }
  else if (i !== 2 && seeCam) { seeCam = false; durchsicht(false); }
  VIS = {};
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

/* Antippen: sichtbare Strukturen; durchscheinende Huellen (Wand bei Durchsicht) zaehlen nur, wenn dahinter nichts Dichteres getroffen wird; die Teilchen sind nicht anklickbar */
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
   4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
   ===================================================================== */
/* Punkt auf der Oberflaeche: von vorn entlang z bis ins Innere des Feldes fn */
function vorn(fn, x, y) {
  for (var z = 8; z > -8; z -= 0.02) if (fn(x, y, z) < 0) return [x, y, z];
  return null;
}
/* Kandidaten fuer den Ankerpunkt je Struktur (Raum der Szene); sichtPruefen waehlt in der ruhenden Ansicht den ersten sichtbaren */
function ankerBerechnen() {
  var P = function (a) { return V(a[0], a[1], a[2]); };
  var liste = function (arr) { return arr.filter(Boolean).map(P); };
  var vorU = function (pts) { return pts.map(function (q) { return vorn(U, q[0], q[1]); }); };
  var kapNah = function (ziele) {   /* Kapillarpunkte nahe den Zielen (vorn, rest) */
    return ziele.map(function (t) {
      var best = null, bd = 1e9;
      KAP_PUNKTE.forEach(function (p) { if (p[2] < 0.5) return; var d = (p[0] - t[0]) * (p[0] - t[0]) + (p[1] - t[1]) * (p[1] - t[1]) + (p[2] - t[2]) * (p[2] - t[2]); if (d < bd) { bd = d; best = p; } });
      return best;
    });
  };
  var stammA = function (id, ys) { return ys.map(function (y) { var p = stammPunkt(GEF[id].stamm, y); return [p[0], p[1], p[2] + 0.2]; }); };
  KAND.bronchiolus = liste(vorU([[0, 8.7], [0.3, 9.2], [-0.3, 8.0]]));
  KAND.gang = liste(vorU([[0, 2.7], [0, 4.2], [0.1, 3.6]]));
  KAND.alveolen = liste(vorU([[1.15, -0.7], [-1.15, -0.7], [1.7, 1.6], [-2.0, -2.9], [2.0, -2.9], [0, -5.3]]));
  KAND.kapillaren = liste(kapNah([[-1.2, -2.9, 3.0], [0.9, -2.2, 3.0], [-1.6, -0.7, 2.6], [1.4, -4.5, 2.0]]));
  KAND.arteriole = liste(stammA('arteriole', [8.3, 4.6, 0.8, -3.6]));
  KAND.venole = liste(stammA('venole', [8.3, 4.6, 0.8, -3.6]));
  /* aufgeschnittene Alveole: geschlossen die Vorderseite der Wand, aufgeschnitten die helle Schnittkante (Ring um die Schnittebene) */
  var rho = Math.sqrt(OF.r * OF.r - SCHNITT_DZ * SCHNITT_DZ) - T_WAND * 0.5, c = OF.c;
  KAND_ZU.alveoleOffen = liste(vorU([[c[0] + 0.3, c[1]], [c[0] - 0.6, c[1] + 0.5], [c[0] + 0.6, c[1] - 0.5]]));
  KAND_OFFEN.alveoleOffen = liste([[c[0] - rho, c[1], OF_ZC], [c[0] + rho, c[1], OF_ZC], [c[0], c[1] - rho, OF_ZC], [c[0], c[1] + rho, OF_ZC]]);
  KAND.alveoleOffen = offenAn ? KAND_OFFEN.alveoleOffen : KAND_ZU.alveoleOffen;
}
/* Sichtpruefung der Anker: in der ruhenden Ansicht (150 ms unveraendert) je Struktur den ersten Kandidaten waehlen, vor dem kein undurchsichtiges
   Netz einer anderen Struktur liegt; sonst keine Beschriftung. Waehrend der Bewegung bleibt die letzte Wahl. */
var sKey = '', sT = 0, sOk = true, sichtVer = 0;
var rayS = new THREE.Raycaster(), dirS = new THREE.Vector3();
function frei(id, p) {
  dirS.copy(p).applyMatrix4(root.matrixWorld).sub(camera.position); var d = dirS.length(); dirS.normalize();   /* Anker liegen in Modell-Koordinaten, root atmet (Skalierung) */
  rayS.set(camera.position, dirS); rayS.far = d;
  var hits = rayS.intersectObjects(root.children, true);
  for (var i = 0; i < hits.length; i++) {
    var o = hits[i].object, sid = o.userData.sid;
    if (!sid || sid === id || !sichtbar(o) || !enabled[sid] || weichMat(o)) continue;
    if (hits[i].distance < d - 0.12) return false;
  }
  return true;
}
function sichtPruefen(now, w, h) {
  var k = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, offenAn].join('|');
  if (k !== sKey) { sKey = k; sT = now; sOk = false; return; }
  if (sOk || orbit.anim || now - sT < 150) return;
  sOk = true;
  camera.updateMatrixWorld(); root.updateMatrixWorld(true);
  LISTEN[aktiv].forEach(function (id) {
    if (!enabled[id]) return;
    var c = KAND[id] || [], i;
    VIS[id] = null;
    for (i = 0; i < c.length; i++) if (frei(id, c[i])) { VIS[id] = c[i]; break; }
  });
  sichtVer++;
}
var KURZ = { bronchiolus: 'Bronchiolus', alveolen: 'Alveolen', alveoleOffen: 'Aufgeschnittene Alveole' };   /* kürzere Namen, damit die Beschriftung in die Spalte passt */
var LATKURZ = { bronchiolus: 'Bronchiolus respiratorius' };
var HANDYNAME = { alveoleOffen: 'Aufgeschn. Alveole', arteriole: 'Lungenarterie', venole: 'Lungenvene', kapillaren: 'Kapillaren' };   /* noch kürzer, wo die Spalte auf dem Handy schmal ist */
/* je Ausschnitt: Strukturen in der Beschriftung */
var LISTEN = [
  ['bronchiolus', 'gang', 'alveolen', 'alveoleOffen', 'kapillaren', 'arteriole', 'venole'],
  ['alveoleOffen', 'alveolen', 'kapillaren', 'arteriole', 'venole'],
  ['kapillaren', 'alveolen', 'alveoleOffen', 'arteriole', 'venole'],
  ['bronchiolus', 'gang', 'alveolen', 'arteriole', 'venole']
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
  var key = [view.theta.toFixed(4), view.phi.toFixed(4), view.dist.toFixed(3), view.target.x.toFixed(3), view.target.y.toFixed(3), view.target.z.toFixed(3), w, h, lv, aktiv, offenAn, sichtVer, root.scale.x.toFixed(3)].join('|');   /* auch die Atmung (Skalierung von root): die Anker wandern mit */
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
  if (showLabels && !quiz && !$('scard').classList.contains('show') && !(narrow && (selected || unten))) {   /* Handy: die Karte deckt das Modell, ohne Beschriftung bleibt es frei; beim Ueben und bei einer Hilfekarte keine Beschriftung */
    LISTEN[aktiv].forEach(function (id) {
      if (!enabled[id]) return;
      var an = id in VIS ? VIS[id] : (KAND[id] || [])[0];
      if (!an) return;
      pv.copy(an).applyMatrix4(root.matrixWorld);   /* Anker in Modell-Koordinaten: root atmet (leichte Skalierung) */
      pv.project(camera);
      if (pv.z > 1) return;
      items.push({ id: id, sx: (pv.x * 0.5 + 0.5) * w, sy: (-pv.y * 0.5 + 0.5) * h });
    });
  }
  items.forEach(function (it) { it.side = (it.sx < cx || (narrow && (it.id === 'bronchiolus' || it.id === 'gang'))) ? 'l' : 'r'; });   /* Handy: Bronchiolus und Gang (Mitte, oben) stehen links, damit ihre Linien nicht quer ueber das Modell laufen */
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
   5. Gasaustausch (aus dem Alveolen-Modell): Zustand, Geometrie des Schemas, Simulation, Darstellung und Bedienung im Reiter "Gasaustausch"
   Der Code steht unveraendert wie im Alveolen-Modell (eigener Gueltigkeitsbereich, weil S und $ hier anders belegt sind; Math.random wie im Original);
   angepasst sind nur die IDs (Praefix la), die Schleife (tick wird aus der Renderschleife gerufen, erstes Bild 0.016, Pause), die Klasse on statt an bei den
   Bedienelementen, die Suche der Bedienelemente nur im Reiter, der Wegfall der Hilfekarten-Modals (die Karten stehen oben, sie erscheinen in #scard) und der
   Anschluss des 3D-Modells (haken: ein Aufruf am Ende von zeichne; Abschnitt 6). Die Liste "Situationen und Krankheitsbilder" steht im Reiter
   "Krankheitsbilder" (Kern.Szenarien, Abschnitt 2): ihr Einstieg in den Original-Code ist gas.szenario (unten, ruft den unveraenderten Handler von data-sz) und
   gas.beiEigene (Rueckmeldung bei "Eigene Einstellung"); die drei Medikamente (Salbutamol, Sauerstoff, Naloxon) setzen dazu eine neue Wirkung (zusatz).
   ===================================================================== */
var gas = (function(){
function $(id){ return document.getElementById(id); }
function ID(k){ return "la" + k.charAt(0).toUpperCase() + k.slice(1); }   // Praefix la: eindeutige IDs im Atlas
var NS = "http://www.w3.org/2000/svg";
var PANE = $("paneGas");
var haken = null;   // Einbindung: Anschluss des 3D-Modells (Abschnitt 6), wird am Ende von zeichne gerufen

/* ---------------- Zustand ---------------- */
var A = { o2:0.84, co2:0.21 };
var ANKUNFT = { o2:0.28, co2:0.55 };
var FRISCH = { o2:0.94, co2:0.02 };
var fluss = 0.5, tiefe = 0.5, frequenz = 0.5, obstruktion = 0, flaeche = 1, tempo = 0.5;
var atemP = 0, fLunge = 0, vLunge = 0;
var cheyne = false, csP = 0, T_CS = 24, tiefeEff = 0.5;
var gas = "beide", frei = false, freiAlv = 0.85, freiBlut = 0.28;
var abO2 = 0.84, abCO2 = 0.21;
var austausch = 1.41, REF_AUSTAUSCH = 1.41;   // Sauerstoffaufnahme bei normaler Ruheatmung
var ausStufe = 2;                             // Haltespanne, damit das Urteil nicht flackert
var szName = "Normale Ruheatmung";

var K_BASIS = 2.14, R2 = 10.5, W_O2 = 0.14, W_CO2 = 0.42, BAHN = 0.857;

var el = {};
["alvO2","alvCO2","uebertritt","blut","kapWand","kapLumen","abflussRohr",
 "legO2p","legO2t","legCO2p","legCO2t","tempoBadge","tempoFaktor",
 "miniL1","miniL2","miniZwerch","miniText","stAtemwege","stFlaeche",
 "ergSz","barAO","barAC","barBO","barBC","barAus","urtAus","urtO","urtC","urtS","stMuster",
 "wegWand","wegLumen","engeMarke","befund","bef1","bef2","bef3","alveole",
 "m1","w1","d1a","d1b","p2","w2","w3","b3","t4","w4","g1","g2","g3","g4",
 "lblFluss","lblTiefe","lblFreq","freiFeld"].forEach(function(k){ el[k]=$(ID(k)); });

/* ---------------- Geometrie: Kreis und Ringkapillare ---------------- */
var CX = 400, CY = 300, RA = 148, RK = 190;
var TH0 = 250, TH1 = -70;                     // Grad: Eintritt oben links, Austritt oben rechts
function winkel(t){ return (TH0 + (TH1-TH0)*t) * Math.PI/180; }
function ort(t, r){ var a = winkel(t); return { x: CX + r*Math.cos(a), y: CY + r*Math.sin(a), a:a }; }
(function bahnZeichnen(){
  var d = "", i, p;
  for (i=0; i<=64; i++){
    p = ort(i/64, RK);
    d += (i ? " L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1);
  }
  el.kapWand.setAttribute("d", d);
  el.kapLumen.setAttribute("d", d);
})();

/* ---------------- Farben ---------------- */
var ARM=[70,112,155], REICH=[196,55,44];
var ARM_B=[176,198,219], REICH_B=[240,197,190];
function mische(a,b,o2){
  var t = Math.max(0,Math.min(1,(o2-0.15)/0.75)), c=[0,0,0], i;
  for(i=0;i<3;i++) c[i]=Math.round(a[i]+(b[i]-a[i])*t);
  return "rgb("+c[0]+","+c[1]+","+c[2]+")";
}
function blutfarbe(o2){ return mische(ARM,REICH,o2); }        // kraeftig: Anzeigen, Abflussrohr
function blutfarbeBlass(o2){ return mische(ARM_B,REICH_B,o2); } // blass: Zellkoerper

// Feste Plaetze fuer die Punkte im Blutkoerperchen und im Plasma daneben
var R_MOL = 4.2;                                                // gilt ueberall: Alveole, Flug, Zelle
var PLATZ_O2  = [[-25,-7],[-15,-7],[-5,-7],[5,-7],[15,-7],[25,-7]];  // obere Reihe in der Zelle
var PLATZ_CO2 = [[-15,7],[-5,7],[5,7],[15,7]];                       // untere Reihe in der Zelle
function anzahlO2(v){ return Math.round(Math.max(0,Math.min(1,(v-0.18)/0.76))*PLATZ_O2.length); }
function anzahlCO2(v){ return Math.round(Math.max(0,Math.min(1,v/0.60))*PLATZ_CO2.length); }

/* ---------------- Bausteine ---------------- */
var sparsam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function kreis(eltern, r, farbe){
  var c = document.createElementNS(NS,"circle");
  c.setAttribute("r", r); c.setAttribute("fill", farbe);
  c.setAttribute("stroke","rgba(255,255,255,.85)"); c.setAttribute("stroke-width","0.9");
  eltern.appendChild(c); return c;
}
function schwarm(eltern, anzahl, farbe){
  var a = [], i, w, rr;
  for (i=0;i<anzahl;i++){
    w = Math.random()*Math.PI*2; rr = Math.sqrt(Math.random())*(RA-26);
    a.push({ el:kreis(eltern, R_MOL, farbe), x:CX+rr*Math.cos(w), y:CY+rr*Math.sin(w),
             vx:(Math.random()*2-1)*24, vy:(Math.random()*2-1)*24 });
  }
  return a;
}
var O2MAX = sparsam ? 20 : 32, CO2MAX = sparsam ? 12 : 20;
var punkteO2 = schwarm(el.alvO2, O2MAX, "var(--o2)");
var punkteCO2 = schwarm(el.alvCO2, CO2MAX, "var(--co2)");

var ERY = sparsam ? 4 : 6, ery = [];
(function(){
  for (var i=0;i<ERY;i++){
    var g = document.createElementNS(NS,"g");
    var k = document.createElementNS(NS,"ellipse");
    k.setAttribute("rx","34"); k.setAttribute("ry","21");
    k.setAttribute("stroke","rgba(0,0,0,.22)"); k.setAttribute("stroke-width","1.5");
    g.appendChild(k);
    var pC = [], pO = [], j, c;
    function punktReihe(plaetze, farbe, ziel){   // beide Gase liegen IN der Zelle
      for (var q=0;q<plaetze.length;q++){
        var pt = document.createElementNS(NS,"circle");
        pt.setAttribute("r",R_MOL); pt.setAttribute("fill",farbe);
        pt.setAttribute("stroke","rgba(255,255,255,.85)"); pt.setAttribute("stroke-width","0.9");
        pt.setAttribute("cx",plaetze[q][0]); pt.setAttribute("cy",plaetze[q][1]);
        pt.setAttribute("opacity","0"); g.appendChild(pt); ziel.push(pt);
      }
    }
    punktReihe(PLATZ_CO2, "var(--co2)", pC);
    punktReihe(PLATZ_O2, "var(--o2)", pO);
    el.blut.appendChild(g);
    ery.push({ g:g, k:k, pO:pO, pC:pC, rO:-1, rC:-1, x:i/ERY, o2:ANKUNFT.o2, co2:ANKUNFT.co2,
               sO2:anzahlO2(ANKUNFT.o2), sCO2:anzahlCO2(ANKUNFT.co2),
               zuO2:0, abfO2:0, zuCO2:0, abfCO2:0 });
  }
})();

/* --- Molekuelbuchhaltung: nichts entsteht, nichts verschwindet --- */
var FLUG = [], FLUGDAUER = 0.34;
(function(){
  var n = sparsam ? 16 : 30, i, c;
  for (i=0;i<n;i++){
    c = kreis(el.uebertritt, R_MOL, "var(--o2)");
    c.setAttribute("opacity","0");
    FLUG.push({ el:c, aktiv:false });
  }
})();
function alvZielO2(){ return Math.round(Math.max(0,Math.min(1,(A.o2-0.25)/0.70))*O2MAX); }
function alvZielCO2(){ return Math.round(Math.max(0,Math.min(1,A.co2/0.60))*CO2MAX); }

function zufallImBlaeschen(){
  var w = Math.random()*Math.PI*2, r = Math.sqrt(Math.random())*(RA-40);
  return { x:CX + r*Math.cos(w), y:CY + r*Math.sin(w) };
}
function platzAmKoerperchen(e, art, slot){
  var p = ort(e.x, RK), th = p.a + Math.PI/2;
  var v = (art === "o2" ? PLATZ_O2 : PLATZ_CO2)[Math.max(0,Math.min(slot,(art==="o2"?PLATZ_O2:PLATZ_CO2).length-1))];
  return { x: p.x + v[0]*Math.cos(th) - v[1]*Math.sin(th),
           y: p.y + v[0]*Math.sin(th) + v[1]*Math.cos(th) };
}
function freierFlug(){ for (var i=0;i<FLUG.length;i++) if (!FLUG[i].aktiv) return FLUG[i]; return null; }
var MUND = { x:CX, y:150 };      // Uebergang Alveole -> Bronchialast
var AUSSEN = { x:CX, y:6 };      // oberes Ende des Bronchialastes

function punktAufBahn(bahn, t){
  var i, L = [], ges = 0, dx, dy, d;
  for (i=0;i<bahn.length-1;i++){
    dx = bahn[i+1].x-bahn[i].x; dy = bahn[i+1].y-bahn[i].y;
    d = Math.sqrt(dx*dx+dy*dy); L.push(d); ges += d;
  }
  var rest = t*ges, q;
  for (i=0;i<L.length;i++){
    if (rest <= L[i] || i === L.length-1){
      q = L[i] > 0 ? Math.max(0, Math.min(1, rest/L[i])) : 0;
      return { x: bahn[i].x + (bahn[i+1].x-bahn[i].x)*q,
               y: bahn[i].y + (bahn[i+1].y-bahn[i].y)*q };
    }
    rest -= L[i];
  }
  return bahn[bahn.length-1];
}

function starteFlug(art, richtung, e, slot, von, nach){
  var f = freierFlug(); if (!f) return null;
  f.aktiv = true; f.art = art; f.richtung = richtung; f.zelle = e || null; f.slot = slot;
  f.von = von; f.nach = nach || null; f.t = 0; f.bahn = null; f.dauer = FLUGDAUER;
  f.el.setAttribute("fill", art === "o2" ? "var(--o2)" : "var(--co2)");
  return f;
}
function flugZiel(f){
  if (f.richtung === "zuZelle") return platzAmKoerperchen(f.zelle, f.art, f.slot);
  if (f.richtung === "zuAlveole") return f.nach;
  if (f.richtung === "einatmen") return f.nach;
  return { x:CX, y:8 };                       // ausatmen: hinaus durch den Atemweg
}
function fluegeSchritt(dt){
  for (var i=0;i<FLUG.length;i++){
    var f = FLUG[i]; if (!f.aktiv) continue;
    f.t += dt/f.dauer;
    var z = flugZiel(f);
    if (f.t >= 1){
      f.aktiv = false; f.el.setAttribute("opacity","0");
      if (f.richtung === "zuZelle"){
        if (f.art === "o2"){ f.zelle.sO2++; f.zelle.zuO2--; } else { f.zelle.sCO2++; f.zelle.zuCO2--; }
      } else if (f.richtung === "zuAlveole"){
        if (f.art === "o2") f.zelle.abfO2--; else f.zelle.abfCO2--;
      }
    } else {
      var pos = f.bahn ? punktAufBahn(f.bahn, f.t)
                       : { x: f.von.x + (z.x-f.von.x)*f.t, y: f.von.y + (z.y-f.von.y)*f.t };
      f.el.setAttribute("cx", pos.x.toFixed(1));
      f.el.setAttribute("cy", pos.y.toFixed(1));
      f.el.setAttribute("opacity","1");
    }
  }
}
function neueZelle(e){
  for (var i=0;i<FLUG.length;i++){
    var f = FLUG[i];
    if (f.aktiv && f.zelle === e){ f.aktiv = false; f.el.setAttribute("opacity","0"); }
  }
  e.zuO2 = e.abfO2 = e.zuCO2 = e.abfCO2 = 0;
  e.sO2 = anzahlO2(e.o2); e.sCO2 = anzahlCO2(e.co2);
}

/* Jede sichtbare Aenderung laeuft als Flug: erst abbuchen, bei Ankunft gutschreiben */
function ereignisse(dt){
  var i, e, ziel;
  atemwegVerkehr(dt);
  for (i=0;i<ery.length;i++){
    e = ery[i];
    // Sauerstoff
    ziel = anzahlO2(e.o2);
    if (ziel > e.sO2 + e.zuO2 && alvZielO2() > 0){
      if (starteFlug("o2","zuZelle", e, e.sO2 + e.zuO2, ort(e.x, RA))){ e.zuO2++; bremse(); }
    } else if (ziel < e.sO2 - e.abfO2){
      if (starteFlug("o2","zuAlveole", e, 0,
                     platzAmKoerperchen(e,"o2", e.sO2 - e.abfO2 - 1), ort(e.x, RA-30))){
        e.sO2--; e.abfO2++;
      }
    }
    // Kohlendioxid
    ziel = anzahlCO2(e.co2);
    if (ziel < e.sCO2 - e.abfCO2){
      if (starteFlug("co2","zuAlveole", e, 0,
                     platzAmKoerperchen(e,"co2", e.sCO2 - e.abfCO2 - 1), ort(e.x, RA-30))){
        e.sCO2--; e.abfCO2++;
      }
    } else if (ziel > e.sCO2 + e.zuCO2 && alvZielCO2() > 0){
      if (starteFlug("co2","zuZelle", e, e.sCO2 + e.zuCO2, ort(e.x, RA))){ e.zuCO2++; bremse(); }
    }
  }
}
/* Luftverkehr im Atemweg: beim Einatmen kommt O2 herein,
   beim Ausatmen geht ueberwiegend CO2 hinaus - etwas O2 aber auch. */
function bremse(){                       // zuletzt gestarteter Flug: langsamer bei geschaedigter Wand
  for (var i=FLUG.length-1;i>=0;i--) if (FLUG[i].aktiv && FLUG[i].t === 0){
    FLUG[i].dauer = FLUGDAUER * Math.min(2.5, 1/Math.max(0.3, flaeche)); return;
  }
}
function atemwegVerkehr(dt){
  if (Math.abs(vLunge) < 0.012) return;
  if (Math.random() > Math.abs(vLunge)*14*(1 - 0.85*obstruktion)*dt) return;
  var f, innen = zufallImBlaeschen();
  if (vLunge > 0){
    f = starteFlug("o2", "einatmen", null, 0, AUSSEN, innen);
    if (f){ f.bahn = [AUSSEN, MUND, innen]; f.dauer = 0.9; }   // Ast hinunter, dann ins Blaeschen
  } else {
    f = starteFlug(Math.random() < 0.25 ? "o2" : "co2", "ausatmen", null, 0, innen);
    if (f){ f.bahn = [innen, MUND, AUSSEN]; f.dauer = 0.9; }   // zur Öffnung, dann den Ast hinauf
  }
}

/* ---------------- Atemzyklus ---------------- */
function atemSchritt(dt){
  tiefeEff = tiefe;
  if (cheyne){                                  // An- und Abschwellen mit Atempause
    csP = (csP + dt/T_CS) % 1;
    tiefeEff = tiefe * (csP < 0.62 ? 0.5*(1 - Math.cos(2*Math.PI*csP/0.62)) : 0);
  }
  var T = 8.0 - 6.0*frequenz;   // Regler 0,5 = 12 Atemzuege/min
  atemP = (atemP + dt/T) % 1;
  var trap = 0.35*obstruktion;
  var f = (atemP < 0.42)
    ? trap + tiefeEff*(1 - Math.cos(Math.PI*(atemP/0.42)))/2
    : trap + tiefeEff*Math.pow(1 - (atemP-0.42)/0.58, 2.2*(1 - 0.6*obstruktion));
  vLunge = dt > 0 ? (f - fLunge)/dt : 0;
  fLunge = f;
}

/* ---------------- Rechenschritt ---------------- */
function schritt(dt){
  var i, e, dO2 = 0, dCO2 = 0, K = K_BASIS*flaeche;
  atemSchritt(dt);
  if (frei) A.o2 = freiAlv;

  for (i=0;i<ery.length;i++){
    e = ery[i];
    e.x += fluss*BAHN*dt;
    if (e.x >= 1){
      abO2 = e.o2; abCO2 = e.co2; e.x -= 1;
      e.o2 = frei ? freiBlut : ANKUNFT.o2; e.co2 = ANKUNFT.co2;
      neueZelle(e);
    }
    var n1 = K*(A.o2 - e.o2)*dt, n2 = K*(A.co2 - e.co2)*dt;
    e.o2 += n1; e.co2 += n2; dO2 += n1; dCO2 += n2;
  }

  if (!frei){
    var ern = Math.abs(vLunge)*R2*(1 - 0.85*obstruktion);
    A.o2  += ern*(FRISCH.o2 - A.o2)*dt  - dO2*W_O2;
    A.co2 += ern*(FRISCH.co2 - A.co2)*dt - dCO2*W_CO2;
    A.o2 = Math.max(0.02, Math.min(1, A.o2));
    A.co2 = Math.max(0, Math.min(1, A.co2));
  }

  if (dt > 0) austausch += ((dO2/dt) - austausch)*Math.min(1, dt*0.14);
  var mo=0, mc=0;
  for (i=0;i<ery.length;i++){ mo += ery[i].o2; mc += ery[i].co2; }
  mo /= ery.length; mc /= ery.length;
  return { mo2:mo, mco2:mc, uo2:A.o2-mo, uco2:A.co2-mc };
}

/* ---------------- Darstellung ---------------- */
var zeigO2 = true, zeigCO2 = true;
function drift(liste, dt, sicht){
  for (var i=0;i<liste.length;i++){
    var p = liste[i];
    p.x += p.vx*dt; p.y += p.vy*dt;
    var dx = p.x-CX, dy = p.y-CY;
    if (dx*dx + dy*dy > (RA-24)*(RA-24)){ p.vx = -p.vx; p.vy = -p.vy; p.x += p.vx*dt*2; p.y += p.vy*dt*2; }
    p.el.setAttribute("cx", p.x.toFixed(1));
    p.el.setAttribute("cy", p.y.toFixed(1));
    p.el.setAttribute("opacity", i < sicht ? "1" : "0");
  }
}

function zeichne(m, dt){
  var i;
  ereignisse(dt);
  fluegeSchritt(dt);
  drift(punkteO2, dt, zeigO2 ? alvZielO2() : 0);
  drift(punkteCO2, dt, zeigCO2 ? alvZielCO2() : 0);

  for (i=0;i<ery.length;i++){
    var e = ery[i], p = ort(e.x, RK), j;
    e.g.setAttribute("transform","translate("+p.x.toFixed(1)+","+p.y.toFixed(1)+") rotate("+(p.a*180/Math.PI+90).toFixed(1)+")");
    e.k.setAttribute("fill", blutfarbeBlass(e.o2));
    var nO = zeigO2 ? e.sO2 : 0;
    if (nO !== e.rO){
      for (j=0;j<e.pO.length;j++) e.pO[j].setAttribute("opacity", j < nO ? "1" : "0");
      e.rO = nO;
    }
    var nC = zeigCO2 ? e.sCO2 : 0;
    if (nC !== e.rC){
      for (j=0;j<e.pC.length;j++) e.pC[j].setAttribute("opacity", j < nC ? "1" : "0");
      e.rC = nC;
    }
  }

  var stroemt = Math.abs(vLunge) > 0.035, ein = vLunge > 0;

  var fL = fLunge;
  el.miniL1.setAttribute("cy", (88 + 7*fL).toFixed(1));
  el.miniL2.setAttribute("cy", (88 + 7*fL).toFixed(1));
  el.miniL1.setAttribute("ry", (20 + 7*fL).toFixed(1));
  el.miniL2.setAttribute("ry", (20 + 7*fL).toFixed(1));
  el.miniL1.setAttribute("rx", (15 + 1.5*fL).toFixed(1));
  el.miniL2.setAttribute("rx", (15 + 1.5*fL).toFixed(1));
  var apex = 112 + 14*fL;
  el.miniZwerch.setAttribute("d","M58 124 Q98 "+(2*apex-124).toFixed(1)+" 138 124");
  el.miniText.textContent = !stroemt ? (tiefeEff < 0.03 ? "Atempause" : "…") : (ein ? "einatmen ↓" : "ausatmen ↑");
  el.miniText.setAttribute("fill", !stroemt ? "#6E7C7A" : (ein ? "var(--o2)" : "var(--co2)"));

  el.abflussRohr.setAttribute("stroke", blutfarbe(abO2));
  zeichneErgebnis();
  zeichneKette(m);
  if (haken) haken(zustand(), dt);   // Einbindung: das 3D-Modell folgt dem Zustand
}

function zeichneErgebnis(){
  el.barAO.setAttribute("width", (Math.max(0,Math.min(1,A.o2))*200).toFixed(0));
  el.barAC.setAttribute("width", (Math.max(0,Math.min(1,A.co2/0.6))*200).toFixed(0));
  el.barBO.setAttribute("width", (Math.max(0,Math.min(1,abO2))*200).toFixed(0));
  el.barBC.setAttribute("width", (Math.max(0,Math.min(1,abCO2/0.6))*200).toFixed(0));

  var to, fo;
  if (abO2 > 0.78){ to = "in Ordnung"; fo = "var(--gut)"; }
  else if (abO2 > 0.60){ to = "vermindert"; fo = "var(--warn)"; }
  else { to = "stark vermindert"; fo = "var(--schlecht)"; }
  el.urtO.textContent = to; el.urtO.setAttribute("fill", fo);

  var tc, fc;
  if (abCO2 < 0.16){ tc = "zu niedrig"; fc = "var(--warn)"; }
  else if (abCO2 < 0.27){ tc = "in Ordnung"; fc = "var(--gut)"; }
  else if (abCO2 < 0.42){ tc = "erhöht"; fc = "var(--warn)"; }
  else { tc = "stark erhöht"; fc = "var(--schlecht)"; }
  el.urtC.textContent = tc; el.urtC.setAttribute("fill", fc);

  var anteil = Math.max(0, austausch/REF_AUSTAUSCH);
  el.barAus.setAttribute("width", (Math.min(1, anteil*0.65)*230).toFixed(0));
  if (anteil > (ausStufe >= 2 ? 0.88 : 0.94)) ausStufe = 2;
  else if (anteil > (ausStufe >= 1 ? 0.64 : 0.72)) ausStufe = 1;
  else ausStufe = 0;
  var ta = ["stark vermindert","vermindert","voll"][ausStufe];
  var fa = ["var(--schlecht)","var(--warn)","var(--gut)"][ausStufe];
  el.barAus.setAttribute("fill", fa);
  el.urtAus.textContent = ta; el.urtAus.setAttribute("fill", fa);

  var ts, fs;
  if (abCO2 < 0.16){ ts = "alkalisch"; fs = "var(--warn)"; }
  else if (abCO2 < 0.27){ ts = "ausgeglichen"; fs = "var(--gut)"; }
  else if (abCO2 < 0.42){ ts = "leicht übersäuert"; fs = "var(--warn)"; }
  else { ts = "übersäuert (Azidose)"; fs = "var(--schlecht)"; }
  el.urtS.textContent = ts; el.urtS.setAttribute("fill", fs);
}

function zeichneKette(m){
  var istCO2 = (gas === "co2");
  var u = istCO2 ? m.uco2 : m.uo2;
  var alvW = istCO2 ? Math.min(1,A.co2/0.6) : A.o2;
  var blutW = istCO2 ? Math.min(1,m.mco2/0.6) : m.mo2;
  var farbe = istCO2 ? "var(--co2)" : "var(--o2)";
  var betrag = Math.abs(u), spuerbar = betrag > 0.02;

  el.m1.textContent = (istCO2 ? "CO₂ · " : "O₂ · ") + "Unterschied";
  el.g1.classList.toggle("aktiv", spuerbar);
  el.w1.textContent = betrag < 0.02 ? "kein Unterschied mehr" : betrag < 0.18 ? "klein" : "groß";
  el.d1a.style.width = Math.round(alvW*100)+"%"; el.d1a.style.background = farbe;
  el.d1b.style.width = Math.round(blutW*100)+"%"; el.d1b.style.background = farbe;

  el.g2.classList.toggle("aktiv", spuerbar);
  el.p2.textContent = !spuerbar ? "–" : (u > 0 ? "→" : "←");
  el.p2.style.color = spuerbar ? farbe : "#7C949B";
  el.w2.textContent = !spuerbar ? "keine Richtung" : (u > 0 ? "in das Blut" : "in die Alveole");

  el.g3.classList.toggle("aktiv", spuerbar);
  el.w3.textContent = betrag < 0.02 ? "keiner" : betrag < 0.18 ? "schwach" : "stark";
  el.b3.style.width = Math.min(100, betrag*220)+"%";
  el.b3.style.background = farbe;

  el.g4.classList.add("aktiv");
  el.t4.style.background = blutfarbe(abO2);
  el.w4.textContent = abO2 > 0.78 ? "sauerstoffreich" : abO2 > 0.6 ? "nur teilweise beladen" : "bleibt sauerstoffarm";
}

/* --- Krankheitszeichen im Bild sichtbar machen --- */
function zeichneBefund(){
  // Bronchialast: Lumen verengt sich, die Wand schwillt an und färbt sich
  el.wegLumen.setAttribute("stroke-width", (24 - 13*obstruktion).toFixed(1));
  var rot = Math.round(169 + (181-169)*obstruktion),
      gr  = Math.round(180 + (118-180)*obstruktion),
      bl  = Math.round(177 + (106-177)*obstruktion);
  el.wegWand.setAttribute("stroke", "rgb("+rot+","+gr+","+bl+")");
  el.engeMarke.setAttribute("opacity", obstruktion >= 0.05 ? "1" : "0");

  // Alveolenwand: zerstörte Wandabschnitte als Lücken
  if (flaeche < 0.9){
    el.alveole.setAttribute("stroke-dasharray", "34 18");
    el.alveole.setAttribute("stroke-width", "4.5");
    el.alveole.setAttribute("stroke", "#C9A48E");
  } else {
    el.alveole.removeAttribute("stroke-dasharray");
    el.alveole.setAttribute("stroke-width", "3");
    el.alveole.setAttribute("stroke", "var(--wand)");
  }

  var zeilen = [];
  if (obstruktion >= 0.05) zeilen.push(obstruktion >= 0.5 ? "Atemwege stark verengt" : "Atemwege verengt");
  if (obstruktion >= 0.30) zeilen.push("Lunge überbläht");
  if (flaeche <= 0.9)      zeilen.push("Austauschfläche zerstört");
  if (cheyne)              zeilen.push("Atmung schwillt an und ab");
  el.befund.setAttribute("opacity", zeilen.length ? "1" : "0");
  el.bef1.textContent = zeilen[0] || "";
  el.bef2.textContent = zeilen[1] || "";
  el.bef3.textContent = zeilen[2] || "";
}

/* ---------------- Schleife ---------------- */
var tAlt = 0, pausiert = false, takte = 0;
function tick(t){
  if (pausiert){                    // Pause: Schritt ganz uebersprungen (alles steht); tAlt mitfuehren, damit nach der Pause kein Sprung entsteht
    tAlt = t;
    return;
  }
  var dtEcht = tAlt ? Math.min(0.05,(t-tAlt)/1000) : 0.016;
  tAlt = t;
  var dt = dtEcht*tempo;
  takte++;
  zeitplan(dt);   // Einbindung: Naloxon stellt nach 4 s Simulationszeit Tiefe und Frequenz um (zaehlt mit Tempo, steht in der Pause)
  zeichne(schritt(dt), dt);
}

/* ---------------- Bedienung ---------------- */
function stufeFluss(v){ return v<0.03?"angehalten":v<0.4?"langsam":v<0.75?"ruhig":"schnell"; }
function stufeTiefe(v){ return v<0.03?"Atempause":v<0.4?"flach":v<0.75?"ruhig":"tief"; }
function stufeFreq(v){ return v<0.3?"langsam":v<0.75?"ruhig":"schnell"; }
function beschrifte(){
  el.lblFluss.textContent = stufeFluss(fluss);
  el.lblTiefe.textContent = stufeTiefe(tiefe);
  el.lblFreq.textContent = stufeFreq(frequenz);
  el.stAtemwege.textContent = obstruktion < 0.05 ? "Atemwege frei" : (obstruktion < 0.5 ? "Atemwege verengt" : "Atemwege stark verengt");
  el.stAtemwege.classList.toggle("warn", obstruktion >= 0.05);
  el.stFlaeche.textContent = flaeche > 0.9 ? "Austauschfläche normal" : "Austauschfläche vermindert";
  el.stFlaeche.classList.toggle("warn", flaeche <= 0.9);
  el.stMuster.textContent = cheyne ? "Cheyne-Stokes-Atmung" : "Atemmuster regelmäßig";
  el.stMuster.classList.toggle("warn", cheyne);
  zeichneBefund();
  el.ergSz.textContent = szName;
}
function eigeneEinstellung(){
  PANE.querySelectorAll("[data-sz]").forEach(function(x){ x.classList.remove("on"); });
  szName = "Eigene Einstellung";
  spaeter = null; FRISCH.o2 = 0.94;   // Einbindung: ein Medikament endet mit der eigenen Einstellung (kein Zeitplan, Frischluft wie im Original)
  beschrifte();
  if (beiEigene) beiEigene();   // Einbindung: die Liste markiert dann keinen Eintrag, die Karte schliesst sich
}

$(ID("fluss")).addEventListener("input", function(){ fluss = +this.value/100; eigeneEinstellung(); });
$(ID("tiefe")).addEventListener("input", function(){ tiefe = +this.value/100; eigeneEinstellung(); });
$(ID("freq")).addEventListener("input", function(){ frequenz = +this.value/100; eigeneEinstellung(); });
$(ID("freiAlv")).addEventListener("input", function(){ freiAlv = +this.value/100; });
$(ID("freiBlut")).addEventListener("input", function(){ freiBlut = +this.value/100; });

PANE.querySelectorAll("[data-set]").forEach(function(b){
  b.addEventListener("click", function(){
    fluss = +b.dataset.wert/100; $(ID("fluss")).value = b.dataset.wert; eigeneEinstellung();
  });
});

var SZENARIEN = {
  normal: { n:"Normale Ruheatmung", t:0.50, f:0.50, o:0.00, a:1.00 },
  hyper:  { n:"Hyperventilation",   t:0.85, f:0.95, o:0.00, a:1.00 },
  hypo:   { n:"Hypoventilation",    t:0.16, f:0.20, o:0.00, a:1.00 },
  asthma: { n:"Asthmaanfall",       t:0.40, f:0.75, o:0.85, a:1.00 },
  copd:   { n:"COPD",               t:0.38, f:0.55, o:0.60, a:0.35 },
  azidose:{ n:"Respiratorische Azidose", t:0.12, f:0.15, o:0.25, a:1.00 },
  cheyne: { n:"Cheyne-Stokes-Atmung",    t:0.75, f:0.50, o:0.00, a:1.00, cs:true }
};
function segment(attr, aktion){
  PANE.querySelectorAll("["+attr+"]").forEach(function(b){
    b.addEventListener("click", function(){
      PANE.querySelectorAll("["+attr+"]").forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on");
      aktion(b.dataset[attr.replace("data-","")]);
    });
  });
}
function szenarioSetzen(w){   // Einbindung: der Handler als benannte Funktion (Inhalt unveraendert), damit gas.szenario ihn aufrufen kann
  var s = SZENARIEN[w];
  szName = s.n; tiefe = s.t; frequenz = s.f; obstruktion = s.o; flaeche = s.a;
  cheyne = !!s.cs; csP = 0;
  $(ID("tiefe")).value = Math.round(s.t*100); $(ID("freq")).value = Math.round(s.f*100);
  beschrifte();
}
segment("data-sz", szenarioSetzen);
segment("data-gas", function(w){
  gas = w; zeigO2 = (w!=="co2"); zeigCO2 = (w!=="o2");
  for (var q=0;q<ery.length;q++){ ery[q].rO = -1; ery[q].rC = -1; }
  [el.legO2p, el.legO2t].forEach(function(x){ x.setAttribute("opacity", zeigO2?"1":"0.18"); });
  [el.legCO2p, el.legCO2t].forEach(function(x){ x.setAttribute("opacity", zeigCO2?"1":"0.18"); });
});
segment("data-tempo", function(w){
  tempo = parseFloat(w);
  el.tempoBadge.classList.toggle("an", tempo < 1);
  el.tempoFaktor.textContent = tempo === 0.5 ? "½×" : "¼×";
});

$(ID("freiAn")).addEventListener("change", function(){
  frei = this.checked;
  el.freiFeld.classList.toggle("auf", frei);
  if (frei){
    PANE.querySelectorAll("[data-gas]").forEach(function(x){ x.classList.remove("on"); });
    PANE.querySelector('[data-gas="o2"]').classList.add("on");
    gas = "o2"; zeigO2 = true; zeigCO2 = false;
    el.legCO2p.setAttribute("opacity","0.18"); el.legCO2t.setAttribute("opacity","0.18");
  }
});

el.tempoBadge.classList.add("an"); el.tempoFaktor.textContent = "½×";
beschrifte();

/* Einbindung: Krankheitsbilder und Medikamente (Reiter, Kern.Szenarien). szenario(w, zusatz) tut genau das, was der Handler von data-sz tut (szenarioSetzen,
   Werte aus SZENARIEN, Regler setzen, beschrifte); w = null: "normal" (Karte zu). Die Werte springen sofort. zusatz (nur Medikamente): name (statt des Namens aus
   SZENARIEN), o (Obstruktion), frisch (Sauerstoff der Frischluft, sonst 0,94), spaeter { nach (s Simulationszeit), t, f } (danach Tiefe und Frequenz, Regler mit). */
var spaeter = null, beiEigene = null;
function szenario(w, zusatz){
  spaeter = null; FRISCH.o2 = 0.94;
  szenarioSetzen(w || "normal");
  if (zusatz){
    if (zusatz.o !== undefined) obstruktion = zusatz.o;
    if (zusatz.frisch !== undefined) FRISCH.o2 = zusatz.frisch;
    if (zusatz.spaeter) spaeter = { rest: zusatz.spaeter.nach, t: zusatz.spaeter.t, f: zusatz.spaeter.f };
    if (zusatz.name) szName = zusatz.name;
    beschrifte();
  }
}
function zeitplan(dt){
  if (!spaeter) return;
  spaeter.rest -= dt;
  if (spaeter.rest > 0) return;
  tiefe = spaeter.t; frequenz = spaeter.f;
  $(ID("tiefe")).value = Math.round(tiefe*100); $(ID("freq")).value = Math.round(frequenz*100);
  spaeter = null;
  beschrifte();
}

/* Einbindung: Zustand fuer das 3D-Modell (nur lesen) */
function zustand(){
  return { A:A, ery:ery, ANKUNFT:ANKUNFT, frei:frei, freiBlut:freiBlut, abO2:abO2, abCO2:abCO2, fLunge:fLunge, zeigO2:zeigO2, zeigCO2:zeigCO2,
           nO2:alvZielO2(), nCO2:alvZielCO2(), O2MAX:O2MAX, CO2MAX:CO2MAX, PLATZ_O2:PLATZ_O2, PLATZ_CO2:PLATZ_CO2, ERY:ERY,
           fluss:fluss, BAHN:BAHN, FLUG:FLUG,   // nur lesen: Blutfluss und Flugliste (aktiv, art, richtung, zelle, t) fuer den Austausch in 3D
           blutfarbe:blutfarbe, blutfarbeBlass:blutfarbeBlass };
}
/* Zugriff fuer die Bedienung ausserhalb (Pause) und fuer die Pruefung (nur lesen) */
function lesen(){
  var r4 = function(x){ return Math.round(x*10000)/10000; };
  var T = function(k){ return el[k].textContent; }, W = function(k){ return el[k].getAttribute("width"); };
  return {
    A: { o2: r4(A.o2), co2: r4(A.co2) }, abO2: r4(abO2), abCO2: r4(abCO2), austausch: r4(austausch), fluss: r4(fluss), tiefe: r4(tiefe), frequenz: r4(frequenz),
    tempo: tempo, gas: gas, frei: frei, pausiert: pausiert, takte: takte,
    kette: { m1: T("m1"), w1: T("w1"), p2: T("p2"), w2: T("w2"), w3: T("w3"), w4: T("w4") },
    ergebnis: { sz: T("ergSz"), barAO: W("barAO"), barAC: W("barAC"), barBO: W("barBO"), barBC: W("barBC"), barAus: W("barAus"),
                urtAus: T("urtAus"), urtO: T("urtO"), urtC: T("urtC"), urtS: T("urtS") },
    ery: ery.map(function(e){ return { x: r4(e.x), o2: r4(e.o2), co2: r4(e.co2), sO2: e.sO2, sCO2: e.sCO2 }; })
  };
}
return { tick: tick, pause: function (an) { pausiert = an; }, lesen: lesen, zustand: zustand, anschliessen: function (f) { haken = f; },
         szenario: szenario, beiEigene: function (f) { beiEigene = f; } };
})();
gas.beiEigene(function () { szEigen = true; SZ.setzen(null); szEigen = false; });   /* eigene Reglerbewegung: kein Eintrag markiert, Karte zu */

/* =====================================================================
   6. Gasaustausch in 3D: die Simulation (gas) steuert das Modell, an der Physik des Originals aendert sich nichts. Neu gegenueber dem Original (Darstellung),
   ohne Blutkoerperchen, nur Gasteilchen einer einzigen Groesse (GAS_R) in den Farben des Schemas (O2 #CE3A2F, CO2 #6B7F8C), alle Plaetze fest (Halton-Folge, kein Math.random):
   - Kapillarnetz, Arterie und Vene: auf jeder Bahn (Lauf des Kapillarnetzes, Aeste und Stamm der Gefaesse) fliessen Punkte von der Arterienseite zur Venenseite (Lauf: vom
     linken zum rechten Ende; Arterie von oben nach unten, Vene von unten nach oben). Weg je Bild = fluss * BAHN * dt * Laenge der Ringbahn (Stopp und Pause: sie stehen).
     Mischung entlang der Bahn (relative Lage u = 0 Eingang, 1 Ausgang) aus den sichtbaren Zaehlern der Zellen der Simulation (ery[i].sO2/sCO2 bei Lage e.x, vom Eingang
     mit anzahlO2/anzahlCO2 des ankommenden Blutes bis zum Ausgang mit dem abfliessenden Blut abO2/abCO2, Skala PLATZ_*.length wie im Original): jeder Platz hat einen festen
     Rang; er ist da, wenn der Anteil an seiner Stelle ueber dem Rang liegt (O2 kommen im Lauf dazu, CO2 gehen weg, nichts wechselt die Art). Arterie: Ankunft, Vene: Abfluss.
   - Austausch an der aufgeschnittenen Alveole: jeder aktive Flug der Simulation (FLUG: zuZelle = O2 aus der Alveole ins Blut, zuAlveole = CO2/O2 aus dem Blut in die Alveole,
     Fortschritt f.t, Lage der Zelle f.zelle.x) wird als Punkt zwischen Innenraum und Kapillare an der Stelle e.x der Ringbahn gezeigt (Rate und Richtung also wie im Schema).
   - Gasteilchen in der aufgeschnittenen Alveole: alvZielO2() rote, alvZielCO2() graublaue Kugeln (mit Gasfilter), feste Plaetze mit ruhiger Bewegung aus der Uhr der Simulation.
   - Gefaesse: Arterie und zufuehrende Seite des Kapillarnetzes in blutfarbe(Ankunft bzw. freies Blut), Vene und abfuehrende Seite in blutfarbe(abO2) (wie abflussRohr).
   - Atmung: root dehnt sich um die Mitte des Saeckchens mit 1 + 0,04 * fLunge.
   Alles ist je Bild aus dem Zustand der Simulation gesetzt (Pause haelt es an); die Teilchen tragen userData.teilchen und noexport und sind nicht anklickbar.
   ===================================================================== */
var G3 = null;                                   /* Zustand der 3D-Darstellung (wird nach dem Kapillarnetz gebaut) */
var GAS_R = 0.06, GAS_AMP = 0.10;               /* Radius ALLER Gasteilchen (passt neben die Kapillaren, Radius 0,05-0,06), Schwingung der Gasteilchen in der Alveole */
var NETZ_ABST = 0.42, GEF_ABST = 0.60;           /* Abstand der festen Plaetze entlang einer Bahn (Netz, Gefaesse) */
var ATEM_DEHNUNG = 0.04, ATEM_MITTE_Y = -2.8;    /* Atmung: Skalierung 1 + ATEM_DEHNUNG * fLunge um den Punkt (0, ATEM_MITTE_Y, 0) */
function rgbFarbe(str) {                         /* "rgb(r,g,b)" aus der Simulation -> Farbe (linear, wie srgb) */
  var m = /(\d+),\s*(\d+),\s*(\d+)/.exec(str);
  return srgb((+m[1] << 16) | (+m[2] << 8) | +m[3]);
}
function halton(i, b) { var f = 1, r = 0; i++; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }
/* Anzahl sichtbarer Punkte einer Zelle im Schema bei Konzentration v (Formeln wie anzahlO2/anzahlCO2 des Originals), als Anteil der Plaetze */
function anteilO2(Z, v) { return Math.round(Math.max(0, Math.min(1, (v - 0.18) / 0.76)) * Z.PLATZ_O2.length) / Z.PLATZ_O2.length; }
function anteilCO2(Z, v) { return Math.round(Math.max(0, Math.min(1, v / 0.60)) * Z.PLATZ_CO2.length) / Z.PLATZ_CO2.length; }
function gas3DBauen() {
  var Z0 = gas.zustand(), bahn = KAP_BAHNEN[0], i, k;
  KAP_BAHNEN.forEach(function (b) { if (b.pts.length > bahn.pts.length) bahn = b; });   /* die laengste zusammenhaengende Bahn = die Ringkapillare der Zellen */
  var kurve = new THREE.CatmullRomCurve3(bahn.pts.map(function (q) { return V(q[0], q[1], q[2]); }), false, 'catmullrom', 0.5), NB = 240, bp = [];
  for (i = 0; i <= NB; i++) bp.push(kurve.getPointAt(i / NB));
  /* Bahnen fuer die fliessenden Punkte: Laeufe des Netzes (Normale nach aussen von der Wand, Punkte sitzen leicht vor der Roehre), Aeste und Staemme der Gefaesse (vor der Roehre, Stamm in drei Spuren) */
  var pfade = [];
  function nahAlv(p) {                           /* Richtung nach aussen vom naechsten Blaeschen */
    var best = null, bd = 1e9, a, d, q;
    for (var m = 0; m < ALV.length; m++) { a = ALV[m]; q = Math.sqrt((p.x - a.c[0]) * (p.x - a.c[0]) + (p.y - a.c[1]) * (p.y - a.c[1]) + (p.z - a.c[2]) * (p.z - a.c[2])); d = Math.abs(q - a.r); if (d < bd) { bd = d; best = V((p.x - a.c[0]) / q, (p.y - a.c[1]) / q, (p.z - a.c[2]) / q); } }
    return best;
  }
  function pfad(pts, r0, r1, modus, sid, kappe) {
    var kv = new THREE.CatmullRomCurve3(pts.map(function (q) { return V(q[0], q[1], q[2]); }), false, 'catmullrom', 0.5);
    var L = kv.getLength(), n = Math.max(6, Math.ceil(L / 0.05)), sp = kv.getSpacedPoints(n), lanen = (modus === 'netz' || r0 < 0.2) ? [0] : [-1, 0, 1], t, lat, nm, o, r, j;
    lanen.forEach(function (ln) {
      var tab = new Float32Array((n + 1) * 3);
      for (j = 0; j <= n; j++) {
        r = r0 + (r1 - r0) * j / n;
        if (modus === 'netz') { nm = nahAlv(sp[j]); o = nm.multiplyScalar(r * 0.9); }
        else {
          t = sp[Math.min(n, j + 1)].clone().sub(sp[Math.max(0, j - 1)]); lat = V(-t.y, t.x, 0);
          if (lat.lengthSq() < 1e-8) lat.set(1, 0, 0);
          o = lat.normalize().multiplyScalar(ln * r * 0.55); o.z += r * 0.8;
        }
        tab[j * 3] = sp[j].x + o.x; tab[j * 3 + 1] = sp[j].y + o.y; tab[j * 3 + 2] = sp[j].z + o.z;
      }
      pfade.push({ tab: tab, n: n, L: L, modus: modus, sid: sid, kappe: !!kappe, abst: modus === 'netz' ? NETZ_ABST : (lanen.length > 1 ? GEF_ABST * 1.6 : GEF_ABST) });
    });
  }
  ['rest', 'kappe'].forEach(function (q) {
    KAP[q].forEach(function (l) {
      var pts = l.pts;
      if (pts[0][0] > pts[pts.length - 1][0]) pts = pts.slice().reverse();   /* vom linken (Arterienseite) zum rechten Ende (Venenseite) */
      pfad(pts, l.r, l.r, 'netz', 'kapillaren', q === 'kappe');
    });
  });
  GEF.arteriole.linien.forEach(function (l) { pfad(l.pts, l.r0, l.r1, 'art', 'arteriole', false); });
  GEF.venole.linien.forEach(function (l) { pfad(l.pts.slice().reverse(), l.r1, l.r0, 'vene', 'venole', false); });   /* Vene: von den Kapillaren zum Stamm, dort nach oben */
  var nO = 0, nC = 0;
  pfade.forEach(function (p, j) {
    p.nO = Math.max(1, Math.round(p.L / p.abst)); p.nC = Math.max(1, Math.round(p.L / (p.abst * 1.25)));
    p.o = nO; p.c = nC; nO += p.nO; nC += p.nC; p.ph = halton(j, 7);
  });
  var rangO = new Float32Array(nO), rangC = new Float32Array(nC);
  pfade.forEach(function (p, j) {
    for (k = 0; k < p.nO; k++) rangO[p.o + k] = halton(k + 11 * j, 2);
    for (k = 0; k < p.nC; k++) rangC[p.c + k] = halton(k + 5 * j, 3);
  });
  var geoG = new THREE.SphereGeometry(GAS_R, 8, 5), matO = mat(0xCE3A2F, { rough: 0.35 }), matC = mat(0x6B7F8C, { rough: 0.35 });
  var nzO = new THREE.InstancedMesh(geoG, matO, nO), nzC = new THREE.InstancedMesh(geoG, matC, nC);
  var fO = new THREE.InstancedMesh(geoG, matO, Z0.FLUG.length), fC = new THREE.InstancedMesh(geoG, matC, Z0.FLUG.length);
  /* Gasteilchen in der aufgeschnittenen Alveole: feste Plaetze im Innenraum (Kugel um die Mitte, vor der Schnittebene) */
  var OFd = App.daten.offen, c = OFd.mitte, Rin = OFd.radius - T_WAND - GAS_R - 0.06, zmax = OFd.schnittZ - 0.14;
  var gO = new THREE.InstancedMesh(geoG, matO, Z0.O2MAX);
  var gC = new THREE.InstancedMesh(geoG, matC, Z0.CO2MAX);
  function plaetze(n, versatz) {
    var a = [];
    for (k = 0; k < n; k++) {
      var rr = Rin * Math.cbrt(halton(k + versatz, 2)), ct = 1 - 2 * halton(k + versatz, 3), st = Math.sqrt(1 - ct * ct), ph = 2 * Math.PI * halton(k + versatz, 5);
      var x = rr * st * Math.cos(ph), y = rr * st * Math.sin(ph), z = rr * ct;
      if (c[2] + z > zmax) z = 2 * (zmax - c[2]) - z;   /* hinter der Schnittebene bleiben (spiegeln) */
      a.push({ b: [c[0] + x, c[1] + y, c[2] + z], w: [0.7 + 0.6 * halton(k + versatz, 7), 0.7 + 0.6 * halton(k + versatz, 11), 0.7 + 0.6 * halton(k + versatz, 13)], p: [6.28 * halton(k + versatz, 17), 6.28 * halton(k + versatz, 19), 6.28 * halton(k + versatz, 23)] });
    }
    return a;
  }
  G3 = { bp: bp, NB: NB, pfade: pfade, rangO: rangO, rangC: rangC, nzO: nzO, nzC: nzC, fO: fO, fC: fC, gO: gO, gC: gC, pO: plaetze(Z0.O2MAX, 0), pC: plaetze(Z0.CO2MAX, 41), c: c, Rin: Rin, zmax: zmax, t: 0, weg: 0,
         Lb: kurve.getLength(), cA: '', cV: '', M: new THREE.Matrix4(), tO: new Float32Array(33), tC: new Float32Array(33), nul: new THREE.Matrix4().makeScale(0, 0, 0), P: new THREE.Vector3() };
  [[nzO, 'Sauerstoff im Blut', 'netz'], [nzC, 'Kohlendioxid im Blut', 'netz'], [fO, 'Sauerstoff beim Austausch', 'gas'], [fC, 'Kohlendioxid beim Austausch', 'gas'], [gO, 'Sauerstoff in der Alveole', 'gas'], [gC, 'Kohlendioxid in der Alveole', 'gas']].forEach(function (q) {
    var m = q[0];
    m.name = q[1]; m.userData.teilchen = q[2]; m.userData.noexport = true;
    m.frustumCulled = false; m.renderOrder = 4;
    m.raycast = function () {};                  /* Teilchen sind nicht anklickbar */
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (i = 0; i < m.count; i++) m.setMatrixAt(i, G3.nul);
    dyn.add(m);
  });
}
/* Lage auf der Ringbahn bei u (0..1), nach aussen versetzt wie die Punkte des Netzes: in g.P */
function ringAn(u) {
  var g = G3, f = Math.max(0, Math.min(1, u)) * g.NB, i = Math.min(g.NB - 1, Math.floor(f)), t = f - i, a = g.bp[i], b = g.bp[i + 1], c = g.c, dx, dy, dz, d;
  g.P.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  dx = g.P.x - c[0]; dy = g.P.y - c[1]; dz = g.P.z - c[2]; d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  g.P.x += dx / d * KAP_R_OFFEN * 0.9; g.P.y += dy / d * KAP_R_OFFEN * 0.9; g.P.z += dz / d * KAP_R_OFFEN * 0.9;
}
/* Punkt der Bahn p bei u in den Matrixeintrag e (Position) */
function setzeAn(im, idx, e, x, y, z, s) {
  e[0] = e[5] = e[10] = s; e[12] = x; e[13] = y; e[14] = z;
  im.setMatrixAt(idx, G3.M);
}
function gas3D(Z, dt) {
  if (!G3) return;
  var i, j, k, g = G3, M = g.M, me = M.elements, P = g.P;
  g.t += dt;
  M.identity();
  /* Atmung */
  var sk = 1 + ATEM_DEHNUNG * Z.fLunge;
  root.scale.setScalar(sk); root.position.set(0, ATEM_MITTE_Y * (1 - sk), 0);
  /* Gefaesse: Arterienseite in der Farbe des ankommenden Blutes, Venenseite in der des abfliessenden */
  var o2In = Z.frei ? Z.freiBlut : Z.ANKUNFT.o2, cA = Z.blutfarbe(o2In), cV = Z.blutfarbe(Z.abO2);
  if (cA !== g.cA || cV !== g.cV) {
    g.cA = cA; g.cV = cV;
    var kA = rgbFarbe(cA), kV = rgbFarbe(cV);
    MAT.arteriole.color.copy(kA); MAT.venole.color.copy(kV);
    STRUCT.kapillaren.meshes.forEach(function (m) { farbeKap(m.geometry, kA, kV); });
  }
  /* Blutstrom: Weg je Bild (Stopp: fluss = 0, Pause: kein Aufruf) */
  g.weg += Z.fluss * Z.BAHN * dt * g.Lb;
  /* Mischung entlang des Laufs: Anteile der Plaetze, Tabelle ueber u = 0..1 aus Eingang, den Zellen nach Lage e.x und Ausgang */
  var cz = Z.ery.slice().sort(function (a, b) { return a.x - b.x; }), px = [0], po = [anteilO2(Z, o2In)], pc = [anteilCO2(Z, Z.ANKUNFT.co2)];
  cz.forEach(function (c) { px.push(c.x); po.push(c.sO2 / Z.PLATZ_O2.length); pc.push(c.sCO2 / Z.PLATZ_CO2.length); });
  px.push(1); po.push(anteilO2(Z, Z.abO2)); pc.push(anteilCO2(Z, Z.abCO2));
  var q = 0, u, tt;
  for (j = 0; j <= 32; j++) {
    u = j / 32;
    while (q < px.length - 2 && px[q + 1] < u) q++;
    tt = px[q + 1] > px[q] ? Math.max(0, Math.min(1, (u - px[q]) / (px[q + 1] - px[q]))) : 1;
    g.tO[j] = po[q] + (po[q + 1] - po[q]) * tt; g.tC[j] = pc[q] + (pc[q + 1] - pc[q]) * tt;
  }
  var aO = po[0], aC = pc[0], vO = po[po.length - 1], vC = pc[pc.length - 1];
  /* Punkte auf den Bahnen */
  var KRAMP = 10;                                /* Anteil-Unterschied, ueber den ein Punkt ein- bzw. ausblendet (1/KRAMP) */
  [[g.nzO, 'nO', 'o', g.rangO, g.tO, Z.zeigO2, aO, vO], [g.nzC, 'nC', 'c', g.rangC, g.tC, Z.zeigCO2, aC, vC]].forEach(function (w) {
    var im = w[0], rang = w[3], tab = w[4], zeig = w[5];
    g.pfade.forEach(function (p) {
      var an = zeig && enabled[p.sid] && !(p.kappe && offenAn), N = p[w[1]], off = p[w[2]], u0 = g.weg / p.L + p.ph, f, s, ed, pos, a, b, tl, ix, fr;
      for (k = 0; k < N; k++) {
        ix = off + k;
        if (!an) { im.setMatrixAt(ix, g.nul); continue; }
        u = k / N + u0; u -= Math.floor(u);
        f = p.modus === 'art' ? w[6] : p.modus === 'vene' ? w[7] : (fr = u * 32, a = Math.min(31, Math.floor(fr)), tl = fr - a, tab[a] + (tab[a + 1] - tab[a]) * tl);
        s = Math.max(0, Math.min(1, (f - rang[ix]) * KRAMP));
        ed = Math.min(u, 1 - u) / 0.04; if (ed < 1) s *= ed;   /* an den Enden ein- und ausblenden */
        if (s < 0.02) { im.setMatrixAt(ix, g.nul); continue; }
        fr = u * p.n; a = Math.min(p.n - 1, Math.floor(fr)); tl = fr - a; pos = p.tab; b = a * 3;
        setzeAn(im, ix, me, pos[b] + (pos[b + 3] - pos[b]) * tl, pos[b + 1] + (pos[b + 4] - pos[b + 1]) * tl, pos[b + 2] + (pos[b + 5] - pos[b + 2]) * tl, s);
      }
    });
    im.instanceMatrix.needsUpdate = true;
  });
  /* Austausch an der aufgeschnittenen Alveole: die aktiven Fluege der Simulation (Alveole <-> Kapillare an der Stelle der Zelle) */
  var c0 = g.c, nf = [0, 0];
  for (i = 0; i < Z.FLUG.length; i++) {
    var f = Z.FLUG[i], zu = f.richtung === 'zuZelle', ab = f.richtung === 'zuAlveole', im = f.art === 'o2' ? g.fO : g.fC;
    if (!f.aktiv || !(zu || ab) || !(f.art === 'o2' ? Z.zeigO2 : Z.zeigCO2)) continue;
    ringAn(f.zelle.x);
    var X, Y, Zz, cx = P.x, cy = P.y, cz2 = P.z, ix2 = c0[0] + (cx - c0[0]) * 0.55 + (halton(i, 2) - 0.5) * 0.5, iy = c0[1] + (cy - c0[1]) * 0.55 + (halton(i, 3) - 0.5) * 0.5, iz = c0[2] + (cz2 - c0[2]) * 0.55 + (halton(i, 5) - 0.5) * 0.5;
    if (iz > g.zmax) iz = g.zmax;
    var tf = Math.max(0, Math.min(1, f.t)); tf = tf * tf * (3 - 2 * tf);
    if (zu) { X = ix2 + (cx - ix2) * tf; Y = iy + (cy - iy) * tf; Zz = iz + (cz2 - iz) * tf; }   /* zuZelle: Alveole -> Kapillare */
    else { X = cx + (ix2 - cx) * tf; Y = cy + (iy - cy) * tf; Zz = cz2 + (iz - cz2) * tf; }   /* zuAlveole: Kapillare -> Alveole */
    setzeAn(im, nf[f.art === 'o2' ? 0 : 1]++, me, X, Y, Zz, 1);
  }
  for (j = 0; j < 2; j++) { var imf = j ? g.fC : g.fO; for (i = nf[j]; i < imf.count; i++) imf.setMatrixAt(i, g.nul); imf.instanceMatrix.needsUpdate = true; }
  /* Gasteilchen: die ersten alvZiel sind sichtbar (wie im Original), ruhig schwebend */
  [[g.gO, g.pO, Z.zeigO2 ? Z.nO2 : 0], [g.gC, g.pC, Z.zeigCO2 ? Z.nCO2 : 0]].forEach(function (q) {
    var im = q[0], pl = q[1], n = q[2], a, x, y, z, dx, dy, dz, d;
    for (i = 0; i < pl.length; i++) {
      if (i >= n) { im.setMatrixAt(i, g.nul); continue; }
      a = pl[i];
      x = a.b[0] + GAS_AMP * Math.sin(a.w[0] * g.t + a.p[0]); y = a.b[1] + GAS_AMP * Math.sin(a.w[1] * g.t + a.p[1]); z = a.b[2] + GAS_AMP * Math.sin(a.w[2] * g.t + a.p[2]);
      if (z > g.zmax) z = g.zmax;
      dx = x - g.c[0]; dy = y - g.c[1]; dz = z - g.c[2]; d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > g.Rin) { d = g.Rin / d; x = g.c[0] + dx * d; y = g.c[1] + dy * d; z = g.c[2] + dz * d; }
      setzeAn(im, i, me, x, y, z, 1);
    }
    im.instanceMatrix.needsUpdate = true;
  });
}
gas.anschliessen(gas3D);

/* Knoepfe der Werkzeugleiste: Pause/Weiter des Gasaustauschs und Schema (Muster wie bei der Lunge) */
var gasLaeuft = true;
$('bPlay').onclick = function () {
  gasLaeuft = !gasLaeuft;
  gas.pause(!gasLaeuft);
  this.textContent = gasLaeuft ? 'Pause' : 'Abspielen';
  this.classList.toggle('on', gasLaeuft);
};
/* Schema: Panel rechts (Desktop) bzw. oben (Handy); die 3D-Ansicht wird dabei ausgeblendet und nicht gezeichnet, die Beschriftung ebenso.
   Handy: Hoehe der Werkzeugleiste als --wz (das Schema endet darueber); aendert sich die Leiste (Umbruch), misst der Beobachter neu */
var schemaOn = false, schemaWz = null;
/* Abzeichen im Schema: Skala = Breite des Bildes / 950 px (Buehnenbreite des Originals bei 1280 x 800), Variable --sk am Bild */
var BUEHNE_B = 950;
function schemaSkala() {
  var b = $('laBild'), w = b && b.clientWidth;
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
  schemaOn = on;
  $('bSchema').classList.toggle('on', on);
  $('schema').classList.toggle('show', on);
  document.body.classList.toggle('schema', on);
  if (on) {
    schemaMessen();
    if (window.ResizeObserver && !schemaWz) { schemaWz = new ResizeObserver(schemaMessen); schemaWz.observe($('tools')); schemaWz.observe($('laBild')); }
  } else schemaWzEnde();
  canvas.style.visibility = on ? 'hidden' : '';
  lv++;
}
$('bSchema').onclick = function () { setSchema(!schemaOn); };
$('bSchemaX').onclick = function () { setSchema(false); };

/* =====================================================================
   7. Renderschleife, Aufbau, Abbau
   ===================================================================== */
var t0 = performance.now();
/* daten: Andockpunkte fuer die Simulation (B2): Kapillarbahnen und Innenraum der aufgeschnittenen Alveole (Modelleinheiten), dyn = Gruppe der Teilchen */
var App = window.AlveoleApp = { ready: false, aufbauMs: 0, waehle: setSelected, gehe: gehe, durchsicht: durchsicht, offen: offen, ansicht: ansicht, dreiecke: tris, gas: gas.lesen,
  daten: { kapBahnen: KAP_BAHNEN, offen: { mitte: OF.c, radius: OF.r, richtung: OF.n, schnittZ: OF_ZC }, dyn: dyn } };
function loop(now) {
  gas.tick(now);
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
  clearTimeout(quizT);
  SZ.abbauen();
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
  delete window.AlveoleApp;
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
Kern.organ('alveole', organ);
})();
