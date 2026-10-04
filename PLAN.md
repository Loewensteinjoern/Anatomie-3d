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
| Krankheitsbilder und Medikamente | – | ✓ (z. B. Torasemid, Hyperglykämie) |
| Schema (2D-Kreislaufbild) | ✓ | – |
| Export GLB/STL mit Signatur | ✓ | ✓ |
| AR (WebXR und AR Quick Look) inkl. Beschriftung | ✓ | – |
| Einheitliches Design und Handy-Layout | ✓ | ✓ |

Beide Modelle bestehen aus einem HTML-Gerüst, je einer CSS- und JS-Datei unter `organe/` und dem gemeinsam genutzten three.js (r128) in `vendor/`; die Geometrie wird per Code erzeugt.

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
- Mögliche Dateistruktur:

```
index.html                Körper-Atlas (Start)
core/                     gemeinsamer Kern (JS, CSS)
vendor/three.min.js       three.js, unverändert
organe/herz/              Herz-Modul + Inhalte
organe/niere/             Niere + Nephron
```

## Phasen

### Phase 0 – Fundament

- [x] Nephron-Modell ins Repository aufnehmen (`nephron.html`)
- [x] Auf mehrere Dateien umstellen (CSS, App-Code, three.js getrennt)
- [ ] Gemeinsamen Kern aus Herz und Nephron herauslösen
  - dabei klären: `vendor/RoomEnvironment.js` wird vom Herz geladen, aber nicht benutzt
- [ ] Prüfen: beide Modelle sehen aus und funktionieren wie vorher (Vergleichsbilder vorher/nachher mit `tools/vergleich.js`)
- [ ] Nephron bekommt AR, Herz bekommt Krankheitsbilder
- [x] `.claude/agents/executor.md` an die Mehrdatei-Struktur anpassen

### Phase 1 – Körper-Atlas

- [ ] Ganzer Körper mit allen Organen in einfacher Form
- [ ] Organsysteme ein-/ausblendbar (Skelett, Kreislauf, Verdauung …)
- [ ] Klick auf Organ öffnet das Detailmodell; fehlende Organe als „in Arbeit“
- [ ] AR für den ganzen Körper
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

## Arbeitsweise

- Planung und Prüfung im Hauptgespräch; Umsetzung einzelner Schritte durch den Executor-Subagenten (`.claude/agents/executor.md`, Sonnet). Commit und Push nur durch den Aufrufer.
- Änderungen über Pull Requests nach `main`; veröffentlicht über GitHub Pages.
