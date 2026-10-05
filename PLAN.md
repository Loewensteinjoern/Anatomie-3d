# Plan: Anatomie-App (3D)

Ziel ist eine Anatomie-App, in der der ganze Körper existiert und alle Organe mit ihren Funktionen darstellbar sind. Jedes Organ wird nach demselben Bauplan aufgebaut wie die beiden vorhandenen Modelle Herz (`index.html`) und Nephron (`nephron.html`).

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

Beide Modelle bestehen aus einem HTML-Gerüst, je einer CSS- und JS-Datei unter `organe/`, dem gemeinsamen Kern (`kern.css`, `kern.js`, `export.js`, `ar.js`, `szenarien.js`) in `core/` und dem gemeinsam genutzten three.js (r128) in `vendor/`; die Geometrie wird per Code erzeugt.

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
index.html                Körper-Atlas (Start); alte Adressen leiten weiter
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

- [ ] Herz und Nephron bekommen die Andockpunkte (`aufbauen`/`abbauen`, Bedienelemente), bleiben aber zunächst eigene Seiten (Prüfung: bytegleich)
- [ ] Rahmenseite, die Organe per Adresse lädt (`#herz`, `#nephron`) und wieder abbaut
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

### Laufend

- [ ] Schema wächst mit (Herz, Lunge, Niere, Leber im Kreislauf verbunden; Simulationen beeinflussen sich, z. B. Blutdruck und Nierenfunktion)
- [ ] Krankheitsbilder und Medikamente pro Organ

## Entscheidungen

- [x] Zielgruppe: Pflege und Gesundheitsberufe – verständliche Funktionen, wichtige Strukturen, Krankheitsbilder und Medikamente (Niveau wie Herz und Nephron)
- [x] Ganzkörpermodell: selbst gebaut und stilisiert, per Code wie Herz und Nephron (einheitlicher Stil, kleine Dateien, keine Lizenzauflagen)
- [x] Reihenfolge der Organe wie in Phase 3 vorgeschlagen
- [x] Repository in „Anatomie-3d“ umbenennen, sobald es mehr als das Herz enthält
- [x] Zusammenhängende App: eine Seite, Organe werden in dieselbe 3D-Szene nachgeladen (statt getrennter Seiten mit Seitenwechsel); jede Ansicht mit eigener Adresse
- [x] Offline: installierbare Web-App (PWA) als Hauptweg; Ordner/ZIP ohne Server bleibt möglich; eine Einzeldatei nur bei Bedarf als zusätzliches Werkzeug

## Arbeitsweise

- Planung und Prüfung im Hauptgespräch; Umsetzung einzelner Schritte durch den Executor-Subagenten (`.claude/agents/executor.md`, Sonnet). Commit und Push nur durch den Aufrufer.
- Änderungen über Pull Requests nach `main`; veröffentlicht über GitHub Pages.
