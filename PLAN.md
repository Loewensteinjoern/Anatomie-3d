# Plan: Anatomie-App (3D)

Ziel ist eine Anatomie-App, in der der ganze Körper existiert und alle Organe mit ihren Funktionen darstellbar sind. Jedes Organ wird nach demselben Bauplan aufgebaut wie die beiden vorhandenen Modelle Herz (`index.html#herz`) und Nephron (`index.html#nephron`).

## Bauplan je Organ

✓ = vorhanden, – = fehlt, (✓) = teilweise

| Baustein | Herz | Nephron | Niere |
|---|---|---|---|
| Strukturliste mit deutschem und lateinischem Namen, farbcodiert | ✓ | ✓ | ✓ |
| Beschriftung in Spalten mit Führungslinien | ✓ | ✓ | ✓ |
| Feste Ansichten („Ausschnitt“) mit Kamerafahrt | ✓ | ✓ | ✓ |
| Durchsicht, Tempo (Pause/langsam/normal/schnell) | ✓ | ✓ | ✓ |
| Funktion als Simulation | Herzzyklus mit Windkessel-Physik | Teilchenströmung (Wasser, Salz, Zucker) | Durchblutung und Harnabfluss mit Peristaltik |
| Lupe (Nahansicht, was in einer Struktur passiert) | ✓ | ✓ | ✓ (Papille, mit/ohne ADH) |
| Hilfekarten und Üben (Quiz) | ✓ | (✓) | ✓ |
| Krankheitsbilder und Medikamente | ✓ (z. B. Vorhofflimmern, Metoprolol) | ✓ (z. B. Torasemid, Hyperglykämie) | ✓ (Harnstau, Nierenarterienstenose, Ramipril, Ibuprofen) |
| Schema (2D-Bild) | ✓ (Kreislauf) | ✓ (Nephron von vorn, live mit denselben Teilchen) | – |
| Export GLB/STL mit Signatur | ✓ | ✓ | ✓ |
| AR (WebXR und AR Quick Look) inkl. Beschriftung | ✓ | ✓ | ✓ |
| Einheitliches Design und Handy-Layout | ✓ | ✓ | ✓ |
| Form als eigener Baustein für den Körper-Atlas | (✓) über `organ.form` in `herz.js` (dazu `organ.start`: Startansicht des Herz-Modells für die Kamerafahrt) | `organ.form` (Bahnen) und `organ.start` für die Zoomstufe aus der Niere | ✓ `niere-form.js` (Körper nutzt die Außenform), `organ.start` für die Fahrt aus dem Körper |

Alle Modelle bestehen aus einem HTML-Gerüst, je einer CSS- und JS-Datei unter `organe/`, dem gemeinsamen Kern (`kern.css`, `kern.js`, `rahmen.js`, `export.js`, `ar.js`, `szenarien.js`) in `core/` und dem gemeinsam genutzten three.js (r128) in `vendor/`; die Geometrie wird per Code erzeugt.

Eine Form je Organ: Jedes Organ-Modul liefert seine Form als eigenen Baustein (`organe/<organ>/<organ>-form.js`). Körper-Atlas und Detailmodell nutzen dieselbe Form (im Körper gröber gerastert); so passen Körper und Organ zusammen, und jede Verbesserung am Organ zeigt sich auch im Körper. Der Körper lädt nur die Form-Bausteine, nicht den übrigen Organ-Code. Organe ohne Detailmodell erscheinen im Körper vorerst als vereinfachte Platzhalter und werden ersetzt, sobald ihr Modul fertig ist. Das Herz stellt seine Form vorerst über `organ.form` in `herz.js` bereit; die Auslagerung nach `herz-form.js` folgt, wenn sie sich lohnt.

## Ebenen

```
Körper  →  Organsystem  →  Organ  →  Funktionseinheit  →  Lupe
Mensch     Harnsystem      Niere     Nephron              Wand des Tubulus
Mensch     Kreislauf       Herz      (Herzklappe)         Klappe/Erregung
Mensch     Atmung          Lunge     Alveole              Gasaustausch
```

## Architektur

- Gemeinsamer Kern für alle Organe: Szene, Licht, Design, Beschriftung, Leiste, Lupe, Quiz, Szenarien, Export, AR.
- Ein Modul pro Organ: Geometrie, Strukturliste, Simulation, Lupen-Inhalte, Hilfetexte, Krankheitsbilder.
- Inhalte (Namen, Texte, Quizfragen) als Daten getrennt vom Code.
- Organe werden erst beim Öffnen geladen.
- Eine einzige Seite: Körper und Organe teilen sich eine 3D-Szene (Renderer, Licht, Kamera, Kern). Beim Antippen eines Organs fliegt die Kamera im Körper in die Startansicht des Detailmodells (`organ.start`), die Organdatei wird per eingefügtem `<script>` nachgeladen (funktioniert auch per `file://`), der Körper wird abgebaut und das Detailmodell darunter aufgebaut; ein Standbild des letzten Bildes verdeckt den Wechsel und wird weich ausgeblendet. Das Detailmodell liegt nicht gleichzeitig mit dem Körper in der Szene; „Zurück“ baut es ab und fährt im Körper aus dem Nahbild zur Ganzkörperansicht. Ebenso eine Ebene tiefer (Niere → Nephron).
- Jedes Organ-Modul hat feste Andockpunkte, z. B. `aufbauen(szene, bereich)`, `abbauen()`, Bedienelemente, Beschriftung, Kamera-Ansichten; der Rahmen ruft sie auf.
- Jede Ansicht hat eine eigene Adresse (`#herz`, `#niere/nephron`): Zurück-Knopf des Browsers, Lesezeichen und Links direkt auf ein Organ funktionieren.
- Regeln gegen die Nachteile einer einzigen Seite:
  - Speicher: `abbauen()` räumt das Organ vollständig weg (Geometrien, Materialien, Texturen, Bedienelemente); es ist immer nur ein Detail-Organ geladen.
  - Keine gegenseitige Störung: jedes Organ in eigenem Namensraum im Code; sein CSS gilt nur in seinem Bereich (z. B. unter einer Organ-Klasse am Rahmen).
  - Fehler abfangen: scheitert das Laden oder Aufbauen eines Organs, erscheint „Organ konnte nicht geladen werden“, Körper und Rahmen bleiben bedienbar.
  - Wartezeit: das Organ-Skript wird schon im Körper geladen (beim Herz), CSS und Aufbau starten nach der Kamerafahrt unter dem Standbild, mit leiser Ladeanzeige (`#boot.leise`); erneutes Öffnen in derselben Sitzung nutzt die bereits geladene Datei.
  - Umbau in kleinen Schritten mit Vergleichsbildern (`tools/vergleich.js`), wie in Phase 0.
  - Prüfung der Übergänge: `tools/vergleich.js` bekommt Abläufe wie Körper → Organ → zurück.
- Offline: Die App läuft weiterhin ohne Server und ohne Build-Schritt (Ordner/ZIP, `index.html` doppelklicken). Zusätzlich wird sie eine installierbare Web-App (PWA: Manifest mit Name und Symbol, Service Worker als Offline-Speicher): einmal über GitHub Pages öffnen, „Zum Startbildschirm hinzufügen“, danach ohne Internet nutzbar – auch mit AR. Der Service Worker speichert alle Organdateien vorab, damit auch noch nicht geöffnete Organe offline funktionieren (umgesetzt in `sw.js`, `core/offline.js`).
- Dateistruktur (Ziel):

```
index.html                Körper-Atlas (Start); nephron.html und atlas.html leiten weiter
sw.js, app.webmanifest    Service Worker (Offline-Speicher) und Web-App-Manifest
icons/                    App-Symbol (symbol.svg, PNGs)
core/                     gemeinsamer Kern (JS, CSS)
vendor/three.min.js       three.js, unverändert
organe/herz/              Herz-Modul + Inhalte
organe/niere/             Niere + Nephron
```

## Phasen

### Phase 0 – Fundament

- [x] Nephron-Modell ins Repository aufnehmen (`nephron.html`)
- [x] Auf mehrere Dateien umstellen (CSS, App-Code, three.js getrennt)
- [x] Gemeinsamen Kern aus Herz und Nephron herauslösen (`core/kern.css`, `core/kern.js`)
  - `vendor/RoomEnvironment.js` war unbenutzt und ist entfernt
  - Export ist vereinheitlicht (`core/export.js`, `Kern.Export`): eine Signatur (`Kern.WM`), ein GLB-Weg über GLTFExporter, gleiche Dateinamen (`<organ>_statisch.glb`, `<organ>_animiert_<zusatz>.glb`, `<organ>_stl_3d-druck.zip`); das Organ liefert nur die Konfiguration
  - noch je Organ, kann später in den Kern wandern: Lupe, Üben, Beschriftungs-Layout
- [x] Prüfen: beide Modelle sehen aus und funktionieren wie vorher (Vergleichsbilder vorher/nachher mit `tools/vergleich.js`; für die Aufteilung und den Kern erledigt)
- [x] Nephron bekommt AR, Herz bekommt Krankheitsbilder
  - [x] AR im gemeinsamen Kern (`core/ar.js`, `Kern.AR`): WebXR-Sitzung, AR-Schilder, USDZ für AR Quick Look; Herz umgestellt (bytegleich), Nephron mit AR (Durchsicht, Beschriftung, Größe, Pause; Quick Look ohne Teilchen); `tools/vergleich.js` nimmt AR bei beiden Modellen auf
  - [x] Herz: Krankheitsbilder (Links-, Rechts- und Globalinsuffizienz, Aortenklappenstenose, Vorhofflimmern, Herzinfarkt Vorderwand) und Medikamente (Metoprolol, Glyceroltrinitrat) in zwei Reitern wie beim Nephron; gemeinsamer Szenario-Baustein `core/szenarien.js` (`Kern.Szenarien`: Reiterliste, Erklärkarte, Überblenden), Wirkung über Faktoren in der Herzzyklus-Physik (Kammerkraft, Frequenz, Klappenöffnung, Vorhofschub, Rhythmus, Vorlast, Infarkt); `tools/vergleich.js` nimmt sie im Herz-Kontext `szenarien` auf
- [x] `.claude/agents/executor.md` an die Mehrdatei-Struktur anpassen

### Phase 1 – Körper-Atlas

- [x] Herz und Nephron bekommen die Andockpunkte (`aufbauen`/`abbauen`, Bedienelemente), bleiben aber zunächst eigene Seiten (Prüfung: bytegleich)
  - `core/rahmen.js`: `Kern.organ(name, def)` meldet ein Organ an (`Kern.Organe`); der Rahmen legt Renderer, Szene, Kamera, Umgebung und Licht einmal an, `Kern.organStarten(name)`/`Kern.organBeenden()` bauen Organe darin auf und ab; (`Kern.einzelseite(name)` für Einzelseiten entfiel mit dem Atlas als `index.html`)
  - Organ-Modul `def`: `renderer` (Optionen, z. B. `alpha`), `aufbauen(umg)` → Promise (`umg`: `bereich` = `#organ`, `canvas`, `renderer`, `szene`, `kamera`, `envTex`), setzt `bild(now, frame)`, `groesse(w, h)`, `abbauen()`
  - Organ-Dateien lösen beim Laden nichts aus und haben keine globalen Namen (vorerst außer `window.HerzApp` für `tools/vergleich.js`); die Bedienelemente liegen als `MARKUP` in der Organ-Datei, im HTML stehen nur die Rahmen-Elemente
  - `abbauen()` beendet AR und Audio, meldet Listener ab, stoppt Timer (auch mitten im Aufbau), gibt alle three.js-Objekte frei und leert das DOM; `tools/vergleich.js` prüft das im Kontext `abbau` (Speicher, Szene, DOM, Listener nach dem Abbauen jedes Mal gleich)
  - noch offen für die Rahmenseite: Organ-CSS nur im eigenen Bereich (`.organ-herz`), Renderer-Optionen je Organ (Herz `alpha`) beim Wechsel, Ladeanzeige `#boot` im Rahmen
- [x] Rahmenseite, die Organe per Adresse lädt (`#herz`, `#nephron`) und wieder abbaut
  - Rahmenseite (zuerst `atlas.html`, jetzt `index.html`) enthält nur den Rahmen; `core/atlas.js` steuert per Adresse (leer = Startansicht, `#herz`, `#nephron`), Browser-Zurück und Lesezeichen funktionieren; Knopf „← Atlas“ (`core/atlas.css`)
  - `Kern.ORGANE` (Titel, Seitentitel, Skript, CSS je Organ), `Kern.organLaden` fügt Skript und CSS per `<script>`/`<link>` ein (auch per `file://`), lädt in einer Sitzung nur einmal; die Organ-CSS wird beim Wechsel wieder entfernt (immer nur ein Organ, daher noch keine Beschränkung auf `.organ-herz`)
  - Fehler (unbekannte Adresse, Ladefehler, Fehler beim Aufbau) zeigen „Organ konnte nicht geladen werden“, der Rahmen bleibt bedienbar; veraltete Ladevorgänge bei schnellem Wechsel werden verworfen
  - Renderer-Optionen je Organ: unterscheiden sie sich beim Wechsel (Herz `alpha`), legt der Rahmen Canvas und Renderer neu an; so sind Herz und Nephron im Atlas bytegleich zu den Einzelseiten
  - `tools/vergleich.js`, Modell `atlas`: Herz und Nephron im Atlas laufen dieselben Abläufe wie die Einzelseiten und müssen bytegleich zu deren Bildern und Exporten sein; dazu Übergänge (Messung vor/nach gleich), Fehlerfälle und Startauswahl
- [x] `index.html` wird der Atlas; das Herz zieht um, die bisherigen Adressen (`index.html` als Herz, `nephron.html`) leiten weiter
  - `index.html` ohne Adresse zeigte zunächst eine Startauswahl, jetzt den Körper, Herz unter `#herz`, Nephron unter `#nephron`; eigene Organ-Seiten gibt es nicht mehr (`Kern.einzelseite` entfällt)
  - `nephron.html` leitet auf `index.html#nephron`, `atlas.html` auf `index.html` weiter (Adresse nach `#` bleibt), per `location.replace` mit meta-refresh als Rückfall, auch per `file://`
  - `tools/vergleich.js`: Modelle `herz` und `nephron` laufen im Atlas und sind bytegleich zu den Aufnahmen der früheren Einzelseiten; `atlas` prüft zusätzlich die Weiterleitungen
- [x] Ganzer Körper mit allen Organen in einfacher Form
  - Organ-Modul `koerper` (`organe/koerper/`), Startansicht von `index.html` (auch `#koerper`); stilisiertes Lehrmodell: glasartige Körperhülle, vereinfachtes Skelett, Organe in anatomischer Lage, farbig nach Organsystem; Geometrie per Signed-Distance-Field (`core/sdf.js`, `Kern.SDF`)
  - Das Herz kommt aus dem Herz-Modell (`organ.form` in `herz.js`, geschlossen und gröber gerastert, Herz-Modell bleibt bytegleich); die übrigen Organe sind Platzhalter bis zu ihrem Detailmodell
  - Strukturliste (29 Strukturen, Texte als Daten), Auswahl per Tippen mit Infokarte, „Herz öffnen“ bzw. „Nephron ansehen“; Ausschnitte Ganzkörper, Kopf/Hals, Brustkorb, Bauch, Becken, Rücken; Beschriftung mit Führungslinien; Handy-Layout
  - `tools/vergleich.js`: Modell `koerper` (Desktop, Handy, Datei, Abbau); Übergänge starten im Körper
- [x] Organsysteme ein-/ausblendbar (Skelett, Kreislauf, Verdauung …)
  - je System „an / glas / aus“ (Haut, Skelett, Nerven, Sinnesorgane, Hormone, Kreislauf, Atmung, Verdauung, Harnsystem), „Alle sichtbar“; Muskeln und weitere Systeme kommen mit ihren Modulen dazu
- [x] Klick auf Organ: Kamerafahrt ins Organ, Detailmodell in derselben Szene, weicher Übergang; fehlende Organe als „in Arbeit“
  - Standbild beim Wechsel (`Kern.standbild` in `core/rahmen.js`, `core/atlas.js`, `<canvas id="uebergang">`, `#boot.leise`): das letzte Bild bleibt stehen, das neue Organ baut sich darunter mit leiser Ladeanzeige auf, danach blendet das Standbild in ca. 400 ms per `requestAnimationFrame` aus (keine CSS-Transition, wegen der virtuellen Zeit in `vergleich.js`); Direktaufruf ohne vorheriges Organ zeigt wie bisher das Vollbild-`#boot`, bei Fehler verschwindet das Standbild sofort
  - `Kern.organStarten(name, opt)`: `opt.von` kommt als `umg.von` (voriges Organ) beim Organ an
  - Herz: neuer Andockpunkt `organ.start(w, h)` (Startansicht: Kamera in Herz-Koordinaten und View-Offset bei geschlossener Karte; Hilfsfunktionen `fokusVersatz`, `handyAbstand`, Konstante `START`); Herz-Modell bleibt bytegleich
  - Körper: der Knopf der Infokarte startet eine Kamerafahrt (1200 ms): Herz genau in die Startansicht des Herz-Modells (`organ.start` + `HERZ_V`), Nieren in die Startansicht der Niere (`organ.start` + Mitte der linken Niere; zuerst eine Nahansicht von hinten); alle anderen Strukturen und die Bedienelemente blenden dabei aus, danach wird die Adresse gesetzt
  - Rückweg (`umg.von`): der Körper startet im Nahbild und fährt nach 450 ms zur Ganzkörperansicht zurück; danach pixelgleich zum frisch geladenen Körper
  - Organe ohne Detailmodell: ausgegrauter Knopf „Detailmodell in Arbeit“ in der Infokarte; Organe mit Detailmodell tragen in der Strukturliste das Zeichen „3D“
  - Verworfen: Körper-Renderer mit `alpha` (wie das Herz), damit beim Wechsel kein neuer WebGL-Kontext nötig wäre; die Handy-Aufnahmen des Körpers waren damit nicht bytegleich (Skalierung des Canvas mit Alphakanal, bis 15/255). Beim Wechsel Körper ↔ Herz legt der Rahmen weiter Canvas und Renderer neu an, das Standbild verdeckt das
  - `tools/vergleich.js`: `atlas:uebergaenge` mit Bildern `fahrt-herz` und `rueckfahrt` und Prüfung des Endzustands (Standbild weg, keine inline-Styles an `#organ`-Kindern); neuer Kontext `atlas:uebergaenge-niere` (Körper → Niere → zurück, dann Nephron und zurück zur Niere); `atlas:fehler` mit Fall „Ladefehler nach der Fahrt“ (`herz.css` blockiert)
  - Kamerafahrt zum Herz: die Anschluss-Stummel der rechten Lungenarterie/-venen (Struktur `herz`, Markierung `userData.anschluss`) blenden bei der Fahrt mit aus; vorher standen sie am Übergang als Geisterbild neben dem Detail-Herz (der scheinbare „Versatz auf dem Handy“, die Kamera traf auf < 1 px)
- [x] AR für den ganzen Körper
  - WebXR über `Kern.AR.xr`, `root` = `wurzel`, Füße auf der Fläche (`fuss` aus der Bounding Box)
  - Größenstufen 27/45/72/108/180 cm, Start als Tischfigur mit 45 cm, bei lebensgroß ein Hinweis
  - Die Einstellungen der Organsysteme (an, glas, aus) gelten in AR; in AR zusätzlich „Haut an/aus“ (bleibt nach dem Ende) und „Beschriftung an/aus“
  - Kamera in AR mit near/far in Metern (0.01/100), danach wieder 2/1200
  - AR-Schilder über `Kern.AR.schilder` mit den Strukturen der Ganzkörperansicht
  - AR Quick Look: USDZ-Momentaufnahme (ca. 17–19 MB) mit Beschriftung; Glas, das nur im Shader durchsichtig ist (Haut, Schädel), bekommt über die neue Kern-Option `userData.usdzOp` 30 % Deckkraft (im Modus „glas“ 15 %); Herz- und Nephron-USDZ bleiben bytegleich
  - `tools/vergleich.js`: Kontexte `koerper:webxr` und `koerper:quicklook`
  - Mit dem Nutzer abgestimmt: Tischfigur bis lebensgroß, Einstellungen übernehmen, iPhone gleich mit
  - Getestet auf dem iPhone (AR Quick Look): funktioniert gut; Android (WebXR, Chrome) auf einem echten Gerät noch nicht getestet
- [x] Offline als installierbare Web-App (Manifest, Symbol, Service Worker mit allen Organdateien); Ordner/ZIP per `file://` funktioniert weiterhin
  - Manifest und Symbol: `app.webmanifest` (Name „Anatomie-Atlas für Pflegeberufe“, Kurzname „Anatomie“, standalone, Farben #0B171C); Symbol `icons/symbol.svg` (Körpersilhouette in Messing mit rotem Herz) → PNGs 180/192/512/maskable per `node tools/symbole.js`; Kopf von `index.html` mit manifest, apple-touch-icon, theme-color, apple-mobile-web-app-* (Statusleiste `black`)
  - Service Worker `sw.js`: speichert genau die Dateien der Liste `DATEIEN` vorab (am HTTP-Cache vorbei), beantwortet nur diese aus dem Speicher, schreibt zur Laufzeit nichts und speichert keine Nutzerdaten; Speichername `anatomie-<VERSION>`; neue Version wartet (kein `skipWaiting`/`clients.claim`), Nachricht `'aktivieren'`; alte `anatomie-*`-Speicher werden beim Aktivieren gelöscht; `core/offline.js` meldet ihn nur über http(s) an, per `file://` ändert sich nichts
  - Update-Hinweis (`#atlasUpdateBox`, `core/offline.js`, `core/atlas.css`): „Neue Version verfügbar – neu laden“ mit Kreuz „Später“; Desktop unten mittig, Handy oben links neben dem Zurück-Knopf; Klick aktiviert und lädt neu, ohne Klick gilt die neue Version beim nächsten Start; beim Wiedersichtbarwerden höchstens alle 10 Min. Suche nach Updates (`Kern.Offline`)
  - `tools/version.js`: VERSION = SHA-256 (12 Hex) über alle Dateien in `DATEIEN`; `node tools/version.js` schreibt sie, `--pruefen` prüft sie und die Vollständigkeit der Liste (index.html, Manifest, `Kern.ORGANE`, Weiterleitungen); nach jeder Änderung an einer App-Datei ausführen
  - `tools/vergleich.js`: Atlas-Kontexte `offline`, `update`, `update-handy`, `offline-datei` und Versionsprüfung (`erg.version`); der Testserver liefert für Ordneradressen `index.html`
  - Mit dem Nutzer abgestimmt: Name „Anatomie-Atlas für Pflegeberufe“ (Kurzname „Anatomie“), Symbol Körper mit Herz, Update-Hinweis mit Knopf
  - Auf dem iPhone getestet: Installation als Startbildschirm-App und Offline-Betrieb funktionieren
  - Noch auf echten Geräten zu testen: AR Quick Look und Export-Downloads in der Startbildschirm-App (iPhone) sowie Android
- [x] Repository in „Anatomie-3d“ umbenennen (GitHub-Pages-Adresse ändert sich mit)
  - Neue Adresse: https://loewensteinjoern.github.io/Anatomie-3d/; Verweise im Repository (README.md, executor.md) angepasst, an der App selbst ändert sich nichts
  - Die alte Adresse https://loewensteinjoern.github.io/Herz-3d/ leitet GitHub nicht weiter (alte Lesezeichen und geteilte Links funktionieren nicht mehr); eine Weiterleitung (eigenes Repository „Herz-3d“ nur mit Weiterleitungsseite) entfällt, weil die App noch nicht weitergegeben wurde – eigene Lesezeichen und Startbildschirm-Symbole neu anlegen
  - Bewusst nicht geändert: `creator: 'Herz 3D - …'` in der USDZ des Herzens (`organe/herz/herz.js`), das ist der Name des Herz-Modells; eine Änderung würde die Herz-USDZ verändern

### Phase 2 – Niere komplett

Mit Jörn abgestimmt (Oktober 2026). Reihenfolge der Schritte: AR-Deckkraft des Nephrons, Adressen, Form-Baustein der Niere, Niere (Grundgerüst), Körper → Niere, Niere → Nephron, Funktion, Lupe und Hilfe, Krankheitsbilder und Medikamente, Nephron-Schema. Jeder Schritt ist ein eigener Pull Request und wird mit `tools/vergleich.js` gegen die Referenz von `main` geprüft; Abweichungen nur, wo vereinbart.

- [x] Nephron in AR weniger durchsichtig (Rückmeldung von Jörn: wirkt in AR zu durchsichtig)
  - nur in AR (WebXR und AR Quick Look): Tubulus bei Durchsicht 60 % statt 32 % deckend; Glomerulus, Arteriolen, peritubuläre Kapillaren und Vasa recta 80 % statt 46–60 %; am Bildschirm unverändert
- [x] Adressen gestuft: `#niere` (Niere), `#niere/nephron` (Nephron); alte Links `#nephron` und `nephron.html` führen auf `#niere/nephron`; der Zurück-Knopf geht eine Ebene hoch (Nephron → Niere → Körper)
- [x] Form-Baustein `organe/niere/niere-form.js`; der Körper zeigt beide Nieren daraus statt der Platzhalter und lädt nur die Form
- [x] Ganze Niere (Rinde, Mark, Nierenbecken, Gefäße) als Detailmodell nach dem Bauplan
  - Frontalschnitt wie im Lehrbuch (aufgeschnitten oder geschlossen), ca. 11 cm groß
  - Strukturen: Nierenkapsel, Rinde, Mark mit Pyramiden, Nierensäulen, Papillen, kleine und große Kelche, Nierenbecken, Anfang des Harnleiters, Nierenarterie und -vene mit Segment-, Interlobär-, Bogen- und Interlobulargefäßen, Nebenniere; ohne Fettkapsel
  - Funktion als Simulation: Durchblutung (Arterie → Rinde → Vene) und Harnabfluss (Papille → Kelche → Becken → Harnleiter) als Teilchen, Tempo wie beim Nephron, Kennzahlen (ca. 1,2 l Blut/min, 180 l Primärharn → 1,5 l Harn am Tag)
  - Lupe: Papille (Sammelrohre münden, Harn tropft in den Kelch); Hilfekarten
  - Krankheitsbilder: Harnstau durch Nierenstein, Nierenarterienstenose (Renin, Bluthochdruck); Medikamente: Ramipril (ACE-Hemmer), Ibuprofen (NSAR, drosselt die Nierendurchblutung); Reiter und Erklärkarte über `Kern.Szenarien` wie beim Herz, Wirkung über weich überblendete Größen (Blut, Harn, Stau, Stein, Stenose, Renin) in der Strömung und an der Geometrie (erweitertes Hohlsystem, Stein im Harnleiter, Taille in der Nierenarterie, Renin-Markierungen); `tools/vergleich.js`: Kontexte `szenarien` und `szenarien-handy`
  - Körper → Niere: Kamerafahrt wie zum Herz (`organ.start` der Niere, Rückfahrt aus Niere und Nephron ins Nahbild der linken Niere; die rechte Niere blendet mit aus); die Infokarte der Nieren im Körper zeigt „Niere öffnen“ statt „Nephron ansehen“
- [x] Nephron als Zoomstufe innerhalb der Niere
  - markiertes Nephron in einer Pyramide; Knopf „Nephron ansehen“ in der Niere und Antippen des Nephrons; die Kamerafahrt endet in der Startansicht des Nephrons (`organ.start`), der Rückweg mit Rückfahrt wie beim Körper
- [x] Nephron: Schema (2D-Bild wie beim Herz) – Bauplan-Lücke, Wunsch von Jörn
  - Form des 3D-Modells in 2D beibehalten (kein gestrecktes Längsbild), live mit denselben Teilchen wie im 3D-Modell (auch bei Torasemid und Hyperglykämie); Pfeile für Filtration, Rückresorption und Sekretion, Osmolarität an den Stationen (300 → 1200 → 100 → bis 1200 mosmol/l)
- Umsetzung: Schritte 1–4 als #23–#26, Schritt 5 als #27, Schritte 6–10 zusammen in einem Pull Request (Wunsch von Jörn); nach einem Container-Neustart zeichnete Chromium minimal anders (ca. 110 Pixel), ab Schritt 9 wurde daher gegen eine neu aufgenommene Referenz verglichen
- Noch auf echten Geräten zu testen: Nephron in AR (Deckkraft), Niere in AR Quick Look (USDZ ca. 9,7 MB), Fahrt Körper → Niere → Nephron und Handy-Layout (Schema überdeckt dort die Werkzeugleiste, Kennzahlen der Niere stehen nur in der Lesehilfe am Desktop)

### Phase 3 und weiter – Organ für Organ

- [ ] Lunge mit Alveole
- [ ] Leber mit Leberläppchen
- [ ] Magen und Darm mit Dünndarmzotte
- [ ] Gehirn mit Neuron und Synapse
- [ ] Muskel mit Sarkomer, Skelett und Gelenk
- [ ] Auge, Ohr, Haut, Hormondrüsen

### Meilenstein: Version 1.0 für die Kollegen

Die Kollegen bekommen die App erst als fertige Version 1.0 und testen sie dann je für ihren Fachbereich.

- [ ] Umfang: alle Organe aus Phase 1 bis 3 – Körper-Atlas, Herz, Niere mit Nephron, Lunge, Leber, Magen und Darm, Gehirn, Muskel/Skelett/Gelenk, Auge, Ohr, Haut, Hormondrüsen – jeweils nach dem Bauplan (Strukturen, Beschriftung, Funktion, Lupe, Hilfe und Üben, Krankheitsbilder und Medikamente, Export, AR)
- [ ] Offline als installierbare Web-App
- [ ] Kurze Startanleitung in der App
- [ ] Vor der Weitergabe: fachliche Durchsicht der Texte, Test auf echten Geräten (Android, iPhone/iPad, Laptop)
- Rückmeldungen danach: Die Kollegen sagen oder schreiben sie Jörn, er gibt sie gesammelt an Claude weiter (Organ und Stelle, was fehlt oder falsch ist, Fachbereich); Claude sortiert sie (fachlicher Fehler, Verständlichkeit, Bedienung, Wunsch) und schlägt die Reihenfolge vor; keine Rückmeldefunktion in der App.

### Laufend

- [ ] Schema wächst mit (Herz, Lunge, Niere, Leber im Kreislauf verbunden; Simulationen beeinflussen sich, z. B. Blutdruck und Nierenfunktion)
- [ ] Krankheitsbilder und Medikamente pro Organ

## Entscheidungen

- [x] Zielgruppe: Pflege und Gesundheitsberufe – verständliche Funktionen, wichtige Strukturen, Krankheitsbilder und Medikamente (Niveau wie Herz und Nephron)
- [x] Ganzkörpermodell: selbst gebaut und stilisiert, per Code wie Herz und Nephron (einheitlicher Stil, kleine Dateien, keine Lizenzauflagen)
- [x] Reihenfolge der Organe wie in Phase 3 vorgeschlagen
- [x] Repository in „Anatomie-3d“ umbenennen, sobald es mehr als das Herz enthält
- [x] Zusammenhängende App: eine Seite, Organe werden in dieselbe 3D-Szene nachgeladen (statt getrennter Seiten mit Seitenwechsel); jede Ansicht mit eigener Adresse
- [x] Erste Weitergabe an Kollegen erst als Version 1.0 mit allen Organen; bis dahin testen nur Jörn und Claude
- [x] Offline: installierbare Web-App (PWA) als Hauptweg; Ordner/ZIP ohne Server bleibt möglich; eine Einzeldatei nur bei Bedarf als zusätzliches Werkzeug
- [x] Phase 2: Adressen gestuft (`#niere/nephron`, alte Links leiten weiter), Niere als Frontalschnitt mit Durchblutung und Harnabfluss, Lupe an der Papille, Nephron als Zoomstufe mit Kamerafahrt, Nephron-Schema in der Form des 3D-Modells (Einzelheiten unter Phase 2)

## Arbeitsweise

- Planung und Prüfung im Hauptgespräch; Umsetzung einzelner Schritte durch den Executor-Subagenten (`.claude/agents/executor.md`, Sonnet). Commit und Push nur durch den Aufrufer.
- Änderungen über Pull Requests nach `main`; veröffentlicht über GitHub Pages.
