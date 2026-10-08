# Anatomie-3d
Anatomie-App in 3D: Körper-Atlas mit Organsystemen und Organen, Detailmodelle von Herz, Niere und Nephron, alles auch in AR.

## App

Die App ist eine statische Webanwendung ohne Installation und ohne Build-Schritt. three.js (r128) liegt unverändert in `vendor/`, der gemeinsame Kern in `core/`, Gestaltung und App-Code der Modelle unter `organe/`.

- **Lokal öffnen:** `index.html` im Browser öffnen. Dafür muss der ganze Ordner vorhanden sein (z. B. Repository als ZIP herunterladen und entpacken), nicht nur die HTML-Datei.
- **Online (GitHub Pages):** In den Repository-Einstellungen unter *Settings → Pages* als Quelle den Branch `main` und den Ordner `/ (root)` wählen. Die App ist dann erreichbar unter
  `https://loewensteinjoern.github.io/Anatomie-3d/`

Bis Oktober 2026 hieß das Repository „Herz-3d“; die alte Adresse `https://loewensteinjoern.github.io/Herz-3d/` wird von GitHub nicht weitergeleitet.

`index.html` ist der Anatomie-Atlas. Ohne Zusatz (oder mit `#koerper`) zeigt er den Körper mit Organsystemen und Organen; die Detailmodelle liegen unter

- `index.html#koerper` – Körper (Startansicht, auch ohne Zusatz)
- `index.html#herz` – Herz (Herzhöhlen, Klappen, Windkessel, Krankheitsbilder, AR)
- `index.html#niere` – Niere (Frontalschnitt der linken Niere: Rinde, Mark, Nierenbecken und Gefäße; aufgeschnitten oder geschlossen; Strömung: Durchblutung mit roten und blauen Blutteilchen, Harnbildung und Harnabfluss mit gelben Tropfen und einer peristaltischen Welle im Harnleiter, mit Pause und drei Tempi; Lupe an der Nierenpapille (Sammelrohre, Harn tropft in den kleinen Kelch, mit und ohne ADH); Reiter Strukturen, Krankheiten, Medikamente, Hilfekarten und Üben – Harnstau durch Nierenstein und Nierenarterienstenose, Ramipril und Ibuprofen mit Erklärkarte; Export als GLB (statisch und animiert, bei aktivem Szenario mit dessen Namen in der Datei) und STL, AR); ein Nephron ist markiert, „Nephron ansehen“ fährt hinein
- `index.html#niere/nephron` – Nephron (Nierenkörperchen und Tubulussystem, Strömung, Krankheitsbilder, Schema als flaches Bild von vorn mit denselben Teilchen und Osmolarität an den Stationen, AR)

Die Adressen sind gestuft (`niere/nephron` liegt unter der Niere); der Zurück-Knopf des Atlas geht eine Ebene hoch: vom Nephron zur Niere, von der Niere zum Körper.
Das Nephron ist eine Zoomstufe der Niere: In der Niere ist ein Nephron in der oberen Markpyramide markiert; sein Knopf „Nephron ansehen“ (Infokarte) fährt die Kamera in dieses Nephron und endet in der Startansicht des Nephron-Modells. Zurück zur Niere (Zurück-Knopf oder Browser) startet die Niere im Nahbild des Nephrons und fährt zur Übersicht zurück.

Die alten Adressen `index.html#nephron` und `nephron.html` leiten auf `index.html#niere/nephron` weiter, `atlas.html` auf den Atlas.

### Als App installieren (offline)

Die App lässt sich als installierbare Web-App nutzen:

1. Einmal über https://loewensteinjoern.github.io/Anatomie-3d/ öffnen.
2. iPhone/iPad: Safari → Teilen → „Zum Home-Bildschirm“. Android: Chrome → Menü → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
3. Danach läuft sie auch ohne Internet, einschließlich der noch nicht geöffneten Organe.

Updates: Gibt es eine neue Version, erscheint der Hinweis „Neue Version verfügbar – neu laden“. Ohne Klick gilt die neue Version beim nächsten Start.

Der Ordner bzw. die ZIP-Datei per `file://` funktioniert weiterhin, aber ohne Offline-Speicher und ohne Installation.

Für Entwickler: Nach Änderungen an App-Dateien `node tools/version.js` ausführen (aktualisiert die Version des Offline-Speichers in `sw.js`; `--pruefen` prüft nur).

### Dateien

```
index.html                 Atlas: HTML-Rahmen, lädt die Ansicht per Adresse (leer/#koerper, #herz, #niere, #niere/nephron)
nephron.html, atlas.html   Weiterleitungen auf index.html
sw.js, app.webmanifest     Service Worker (Offline-Speicher) und Web-App-Manifest
icons/                     App-Symbol (symbol.svg, PNGs)
core/                      kern.css, kern.js, rahmen.js, atlas.js, atlas.css, offline.js, export.js, ar.js, szenarien.js, sdf.js – gemeinsamer Kern und Atlas-Steuerung (Gestaltung, Licht, Material, Kamera, Beschriftung, Export, AR-USDZ, Krankheitsbilder)
organe/koerper/            koerper.css, koerper.js – Gestaltung und App-Code des Körpers (Startansicht)
organe/herz/               herz.css, herz.js – Gestaltung und App-Code des Herzens
organe/niere/              niere-form.js, niere.css, niere.js, nephron.css, nephron.js – Form der Niere (eigener Baustein, den der Körper mit dem Niere-Modul nachlädt), Gestaltung und App-Code der Niere, Gestaltung und App-Code des Nephrons
vendor/                    three.js r128 mit GLTFExporter (von beiden Modellen genutzt), unverändert
tools/vergleich.js         Vergleichsbilder vorher/nachher (Prüfwerkzeug, braucht Playwright)
tools/version.js           Version des Offline-Speichers in sw.js berechnen/prüfen
tools/symbole.js           PNG-Symbole aus icons/symbol.svg erzeugen
```

Den Plan für die Anatomie-App beschreibt `PLAN.md`.
