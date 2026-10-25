# Lizenzen

Die App besteht fast vollständig aus eigenem Code. Fremder Code steckt nur in `vendor/` (three.js). Diese Datei nennt alles, was nicht für die App selbst geschrieben wurde, und die Bedingungen, unter denen es genutzt wird.

## three.js r128 (`vendor/three.min.js`, `vendor/GLTFExporter.js`)

3D-Bibliothek (Szene, Licht, Kamera, Zeichnen im Browser) und der Zusatz für den GLB-Export. Beide Dateien stammen unverändert aus dem npm-Paket `three@0.128.0` (https://github.com/mrdoob/three.js, Version r128) und stehen unter der MIT-Lizenz. Der Lizenztext gilt für beide Dateien; `GLTFExporter.js` trägt selbst keinen Hinweis, im Paket deckt ihn die Lizenzdatei des Projekts ab. Wortlaut der Lizenz von three.js r128:

```
The MIT License

Copyright © 2010-2021 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Bekannte Verfahren, selbst umgesetzt

Diese Teile sind eigener Code nach allgemein bekannten Verfahren; Verfahren selbst sind nicht urheberrechtlich geschützt.

- **mulberry32** (Zufallszahlen mit fester Saat; `organe/herz/herz.js`, `tools/vergleich.js`): Verfahren von Tommy Ettinger (2017), vom Urheber in die Public Domain gegeben (CC0 1.0, https://gist.github.com/tommyettinger/46a874533244883189143505d203312c).
- **Surface Nets** (Oberflächen aus Signed-Distance-Fields; `core/sdf.js`, `organe/herz/herz.js`): Verfahren von Sarah F. Gibson (1998).
- **Weiches Minimum „smin“** (runde Übergänge zwischen Formen): bekannte Formel, verbreitet durch Inigo Quilez.
- **CRC32** (Prüfsumme im ZIP-Format für STL-Export und USDZ; `core/export.js`, `core/ar.js`): Standardverfahren des ZIP-Formats.

## Nur in den Prüfwerkzeugen (nicht Teil der App)

`tools/vergleich.js`, `tools/nachweis.js`, `tools/live.js` und `tools/symbole.js` nutzen Playwright (Microsoft, Apache-2.0) und Chromium (Chromium-Projekt, BSD-Lizenz). Beide werden nur in der Arbeitsumgebung installiert und weder im Repository noch mit der App verteilt.

## Vorlagen und eigener Code

- `tools/originale/`: Original-Modelle von Jörn Löwenstein (Thorax- und Alveolen-Modell), Vorlage für Lunge und Alveole.
- Alles Übrige (Modelle, Simulationen, Bedienung, Texte, App-Symbol) ist für die App geschrieben. Für den eigenen Code ist keine Lizenz vergeben.
- Schriften werden nicht mitgeliefert: Die App nennt nur Schriftnamen und nutzt die Schriften des Geräts.
