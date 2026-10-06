# Plan: Anatomie-App (3D)

Ziel ist eine Anatomie-App, in der der ganze Körper existiert und alle Organe mit ihren Funktionen darstellbar sind. Jedes Organ wird nach demselben Bauplan aufgebaut wie die beiden vorhandenen Modelle Herz (`index.html#herz`) und Nephron (`index.html#nephron`).

## Bauplan je Organ

✓ = vorhanden, – = fehlt, (✓) = teilweise

| Baustein | Herz | Nephron |
|---|---|---|
| Strukturliste mit deutschem und lateinischem Namen, farbcodiert | ✓ | ✓ |
| Beschriftung in Spalten mit Führungslinien | ✓ | ✓ |
| Feste Ansichten („Ausschnitt“) mit Kamerafahrt | ✓ | ✓ |
| Durchsicht, Tempo (Pause/langsam/normal/schnell) | ✓ | ✓ |
| Funktion als Simulation | Herzzyklus mit Windkessel-Physik | Teilchenströmung (Wasser, Salz, Zucker) |
| Lupe (Nahansicht, was in einer Struktur passiert) | ✓ | ✓ |
| Hilfekarten und Üben (Quiz) | ✓ | (✓) |
| Krankheitsbilder und Medikamente | ✓ (z. B. Vorhofflimmern, Metoprolol) | ✓ (z. B. Torasemid, Hyperglykämie) |
| Schema (2D-Kreislaufbild) | ✓ | – |
| Export GLB/STL mit Signatur | ✓ | ✓ |
| AR (WebXR und AR Quick Look) inkl. Beschriftung | ✓ | ✓ |
| Einheitliches Design und Handy-Layout | ✓ | ✓ |

Beide Modelle bestehen aus einem HTML-Gerüst, je einer CSS- und JS-Datei unter `organe/`, dem gemeinsamen Kern (`kern.css`, `kern.js`, `rahmen.js`, `export.js`, `ar.js`, `szenarien.js`) in `core/` und dem gemeinsam genutzten three.js (r128) in `vendor/`; die Geometrie wird per Code erzeugt.

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
- Eine einzige Seite: Körper und Organe teilen sich eine 3D-Szene (Renderer, Licht, Kamera, Kern). Beim Antippen eines Organs fliegt die Kamera hin, die Organdatei wird per eingefügtem `<script>` nachgeladen (funktioniert auch per `file://`), das Organ wird an seiner Stelle im Körper eingesetzt und der Körper ausgeblendet; „Zurück“ baut es wieder ab. Ebenso eine Ebene tiefer (Niere → Nephron).
- Jedes Organ-Modul hat feste Andockpunkte, z. B. `aufbauen(szene, bereich)`, `abbauen()`, Bedienelemente, Beschriftung, Kamera-Ansichten; der Rahmen ruft sie auf.
- Jede Ansicht hat eine eigene Adresse (`#herz`, `#niere/nephron`): Zurück-Knopf des Browsers, Lesezeichen und Links direkt auf ein Organ funktionieren.
- Regeln gegen die Nachteile einer einzigen Seite:
  - Speicher: `abbauen()` räumt das Organ vollständig weg (Geometrien, Materialien, Texturen, Bedienelemente); es ist immer nur ein Detail-Organ geladen.
  - Keine gegenseitige Störung: jedes Organ in eigenem Namensraum im Code; sein CSS gilt nur in seinem Bereich (z. B. unter einer Organ-Klasse am Rahmen).
  - Fehler abfangen: scheitert das Laden oder Aufbauen eines Organs, erscheint „Organ konnte nicht geladen werden“, Körper und Rahmen bleiben bedienbar.
  - Wartezeit: Laden und Aufbau starten schon während der Kamerafahrt, mit Fortschrittsanzeige; erneutes Öffnen in derselben Sitzung nutzt die bereits geladene Datei.
  - Umbau in kleinen Schritten mit Vergleichsbildern (`tools/vergleich.js`), wie in Phase 0.
  - Prüfung der Übergänge: `tools/vergleich.js` bekommt Abläufe wie Körper → Organ → zurück.
- Offline: Die App läuft weiterhin ohne Server und ohne Build-Schritt (Ordner/ZIP, `index.html` doppelklicken). Zusätzlich wird sie eine installierbare Web-App (PWA: Manifest mit Name und Symbol, Service Worker als Offline-Speicher): einmal über GitHub Pages öffnen, „Zum Startbildschirm hinzufügen“, danach ohne Internet nutzbar – auch mit AR. Der Service Worker speichert alle Organdateien vorab, damit auch noch nicht geöffnete Organe offline funktionieren.
- Dateistruktur (Ziel):

```
index.html                Körper-Atlas (Start); nephron.html und atlas.html leiten weiter
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
  - `atlas.html` (Übergangsname bis zum nächsten Punkt) enthält nur den Rahmen; `core/atlas.js` steuert per Adresse (leer = Startauswahl, `#herz`, `#nephron`), Browser-Zurück und Lesezeichen funktionieren; Knopf „← Atlas“ (`core/atlas.css`)
  - `Kern.ORGANE` (Titel, Seitentitel, Skript, CSS je Organ), `Kern.organLaden` fügt Skript und CSS per `<script>`/`<link>` ein (auch per `file://`), lädt in einer Sitzung nur einmal; die Organ-CSS wird beim Wechsel wieder entfernt (immer nur ein Organ, daher noch keine Beschränkung auf `.organ-herz`)
  - Fehler (unbekannte Adresse, Ladefehler, Fehler beim Aufbau) zeigen „Organ konnte nicht geladen werden“, der Rahmen bleibt bedienbar; veraltete Ladevorgänge bei schnellem Wechsel werden verworfen
  - Renderer-Optionen je Organ: unterscheiden sie sich beim Wechsel (Herz `alpha`), legt der Rahmen Canvas und Renderer neu an; so sind Herz und Nephron im Atlas bytegleich zu den Einzelseiten
  - `tools/vergleich.js`, Modell `atlas`: Herz und Nephron im Atlas laufen dieselben Abläufe wie die Einzelseiten und müssen bytegleich zu deren Bildern und Exporten sein; dazu Übergänge (Messung vor/nach gleich), Fehlerfälle und Startauswahl
- [ ] `index.html` wird der Atlas; das Herz zieht um, die bisherigen Adressen (`index.html` als Herz, `nephron.html`) leiten weiter
- [ ] Ganzer Körper mit allen Organen in einfacher Form
- [ ] Organsysteme ein-/ausblendbar (Skelett, Kreislauf, Verdauung …)
- [ ] Klick auf Organ: Kamerafahrt ins Organ, Detailmodell in derselben Szene, weicher Übergang; fehlende Organe als „in Arbeit“
- [ ] AR für den ganzen Körper
- [ ] Offline als installierbare Web-App (Manifest, Symbol, Service Worker mit allen Organdateien); Ordner/ZIP per `file://` funktioniert weiterhin
- [ ] Repository in „Anatomie-3d“ umbenennen (GitHub-Pages-Adresse ändert sich mit)

### Phase 2 – Niere komplett

- [ ] Ganze Niere (Rinde, Mark, Nierenbecken, Gefäße)
- [ ] Nephron als Zoomstufe innerhalb der Niere

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

## Arbeitsweise

- Planung und Prüfung im Hauptgespräch; Umsetzung einzelner Schritte durch den Executor-Subagenten (`.claude/agents/executor.md`, Sonnet). Commit und Push nur durch den Aufrufer.
- Änderungen über Pull Requests nach `main`; veröffentlicht über GitHub Pages.
