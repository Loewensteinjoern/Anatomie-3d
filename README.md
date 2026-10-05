# Herz-3d
Ein 3 D Modell des Herzens dass in AR dargestellt werden soll

## App

Die App ist eine statische Webanwendung ohne Installation und ohne Build-Schritt. three.js (r128) liegt unverändert in `vendor/`, der gemeinsame Kern in `core/`, Gestaltung und App-Code der Modelle unter `organe/`.

- **Lokal öffnen:** `index.html` im Browser öffnen. Dafür muss der ganze Ordner vorhanden sein (z. B. Repository als ZIP herunterladen und entpacken), nicht nur die HTML-Datei.
- **Online (GitHub Pages):** In den Repository-Einstellungen unter *Settings → Pages* als Quelle den Branch `main` und den Ordner `/ (root)` wählen. Die App ist dann erreichbar unter
  `https://loewensteinjoern.github.io/Herz-3d/`

Das Repository enthält zwei Modelle:

- `index.html` – Herz (Herzhöhlen, Klappen, Windkessel, Krankheitsbilder, AR)
- `nephron.html` – Nephron (Nierenkörperchen und Tubulussystem, Strömung, Krankheitsbilder, AR)

Das Nephron ist online erreichbar unter `https://loewensteinjoern.github.io/Herz-3d/nephron.html`.

### Dateien

```
index.html, nephron.html   HTML-Gerüst der beiden Modelle
core/                      kern.css, kern.js, export.js, ar.js, szenarien.js – gemeinsamer Kern (Gestaltung, Licht, Material, Kamera, Beschriftung, Export, AR-USDZ, Krankheitsbilder)
organe/herz/               herz.css, herz.js – Gestaltung und App-Code des Herzens
organe/niere/              nephron.css, nephron.js – Gestaltung und App-Code des Nephrons
vendor/                    three.js r128 mit GLTFExporter (von beiden Modellen genutzt), unverändert
tools/vergleich.js         Vergleichsbilder vorher/nachher (Prüfwerkzeug, braucht Playwright)
```

Den Plan für die Anatomie-App beschreibt `PLAN.md`.
