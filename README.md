# Anatomie-3d
Anatomie-App in 3D: Körper-Atlas mit Organsystemen und Organen, Detailmodelle von Herz und Nephron, alles auch in AR.

## App

Die App ist eine statische Webanwendung ohne Installation und ohne Build-Schritt. three.js (r128) liegt unverändert in `vendor/`, der gemeinsame Kern in `core/`, Gestaltung und App-Code der Modelle unter `organe/`.

- **Lokal öffnen:** `index.html` im Browser öffnen. Dafür muss der ganze Ordner vorhanden sein (z. B. Repository als ZIP herunterladen und entpacken), nicht nur die HTML-Datei.
- **Online (GitHub Pages):** In den Repository-Einstellungen unter *Settings → Pages* als Quelle den Branch `main` und den Ordner `/ (root)` wählen. Die App ist dann erreichbar unter
  `https://loewensteinjoern.github.io/Anatomie-3d/`

Bis Oktober 2026 hieß das Repository „Herz-3d“; die alte Adresse `https://loewensteinjoern.github.io/Herz-3d/` wird von GitHub nicht weitergeleitet.

`index.html` ist der Anatomie-Atlas. Ohne Zusatz (oder mit `#koerper`) zeigt er den Körper mit Organsystemen und Organen; die Detailmodelle liegen unter

- `index.html#koerper` – Körper (Startansicht, auch ohne Zusatz)
- `index.html#herz` – Herz (Herzhöhlen, Klappen, Windkessel, Krankheitsbilder, AR)
- `index.html#nephron` – Nephron (Nierenkörperchen und Tubulussystem, Strömung, Krankheitsbilder, AR)

Die alten Adressen `nephron.html` und `atlas.html` leiten auf den Atlas weiter.

### Dateien

```
index.html                 Atlas: HTML-Rahmen, lädt die Ansicht per Adresse (leer/#koerper, #herz, #nephron)
nephron.html, atlas.html   Weiterleitungen auf index.html
core/                      kern.css, kern.js, rahmen.js, atlas.js, atlas.css, export.js, ar.js, szenarien.js, sdf.js – gemeinsamer Kern und Atlas-Steuerung (Gestaltung, Licht, Material, Kamera, Beschriftung, Export, AR-USDZ, Krankheitsbilder)
organe/koerper/            koerper.css, koerper.js – Gestaltung und App-Code des Körpers (Startansicht)
organe/herz/               herz.css, herz.js – Gestaltung und App-Code des Herzens
organe/niere/              nephron.css, nephron.js – Gestaltung und App-Code des Nephrons
vendor/                    three.js r128 mit GLTFExporter (von beiden Modellen genutzt), unverändert
tools/vergleich.js         Vergleichsbilder vorher/nachher (Prüfwerkzeug, braucht Playwright)
```

Den Plan für die Anatomie-App beschreibt `PLAN.md`.
