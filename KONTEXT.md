# Kontext-Karte

Erzeugt mit `node tools/kontext.js` – nicht von Hand ändern. Abschnitte je Datei mit Zeilennummer.
Gebrauch: `grep -n -A40 "^## organe/leber/leber.js" KONTEXT.md`, dann im Code nur den Abschnitt lesen (`Read` mit `offset`/`limit`, ca. 100–200 Zeilen).
Was die Dateien enthalten und warum: `docs/dateien.md` (nur bei Bedarf, per `grep`).

## sw.js (64 Zeilen) – Gemeinsamer Kern - Service Worker: Offline-Speicher der App

## core/ar.js (221 Zeilen) – Gemeinsamer Kern - AR: WebXR-Sitzung (Android), USDZ-Erzeugung und AR Quick Look (iPhone/iPad)

## core/atlas.css (42 Zeilen)

## core/atlas.js (135 Zeilen) – Gemeinsamer Kern - Atlas: Adresssteuerung der Rahmenseite index.html

## core/export.js (298 Zeilen) – Gemeinsamer Kern - Export: STL (3D-Druck, im ZIP), GLB (statisch) und

## core/kern.css (164 Zeilen)

## core/kern.js (180 Zeilen) – Gemeinsamer Kern - Szenen-Licht von Herz und Nephron

## core/offline.js (83 Zeilen) – Gemeinsamer Kern - Offline: meldet den Service Worker (sw.js) an

## core/rahmen.js (256 Zeilen) – Gemeinsamer Kern - Rahmen: Andockpunkte der Organ-Module

## core/sdf.js (188 Zeilen) – Gemeinsamer Kern - SDF: Gitter, Auswertung und Surface Nets fuer

## core/szenarien.js (237 Zeilen) – Gemeinsamer Kern - Krankheitsbilder und Medikamente (Reiter + Erklaerkarte)

## organe/herz/herz.css (147 Zeilen)

## organe/herz/herz.js (4010 Zeilen) – HERZ – Anatomie als Signed-Distance-Field (Einheit: cm)
- 83: Anatomie-Parameter
- 367: Gitter + Surface Nets: erzeugt aus dem SDF zwei Teile
- 508: Aus Surface-Nets-Daten werden Regionen-Meshes mit Farben,
- 853: HERZKLAPPEN + SEHNENFÄDEN (explizite Geometrie mit Morph-Zielen)
- 1053: KORONARIEN, ERREGUNGSLEITUNG, BLUTFLUSS-PFADE
- 1316: HERZZYKLUS – Physik aus dem Windkessel-Modell (Herz und Kreislauf)
- 1598: INHALTE – Strukturen, Hilfekarten, Tipps, Phasen
- 1740: SCHEMA – Herz, Lunge und Körper als Kreislaufbild
- 1995: LUPE – Nahansicht wie im Nephron-Modell
- 2257: HERZ – 3D-Anatomie
- 2433: 1. Szene, Licht, Material (wie im Nephron-Modell)
- 2500: 2. Strukturen
- 2515: 3. Aufbau
- 2775: 4. Blut in Portionen (Windkessel-Physik)
- 2942: Lupe – Nahansicht (wie im Nephron-Modell)
- 3088: AR – ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore)
- 3126: Schema – Kreislaufbild mit derselben Physik
- 3146: 5. Beschriftung (Spalten mit F\u00fchrungslinien, wie im Nephron-Modell)
- 3259: 6. Leiste: Strukturen, Krankheiten, Medikamente, Hilfekarten, \u00dcben
- 3342: Krankheitsbilder und Medikamente – Daten für Reiter und Erklärkarte
- 3546: 7. Bedienung
- 3755: 8. Herzzyklus: EKG und Anzeige
- 3810: 9. Export, Hinweise
- 3899: 10. Renderschleife

## organe/koerper/koerper.css (50 Zeilen)

## organe/koerper/koerper.js (1357 Zeilen) – Koerper - stilisiertes Lehrmodell eines ganzen Menschen
- 10: Inhalte (Daten, getrennt vom Code)
- 154: 1. Systeme, Materialien, Steuerung
- 219: 2. Geometrie-Bausteine (three.js-Koerper)
- 280: 3. Koerperhuelle (Abstandsfeld)
- 322: 4. Skelett
- 426: 5. Organe
- 746: 6. Aufbau
- 788: 6b. Bedienung: Leiste (Organsysteme, Strukturen), Auswahl, Infokarte
- 932: 7. Kamera: Ausschnitte, freier Bildbereich, Renderschleife
- 998: 8. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt,
- 1099: 9. Kamerafahrt zum Organ (Knopf der Infokarte): alles ausser dem Organ blendet aus,
- 1243: 9b. AR - WebXR im Browser (Android, Chrome mit ARCore) ueber Kern.AR.xr.

## organe/leber/laeppchen.css (133 Zeilen)

## organe/leber/laeppchen.js (2168 Zeilen) – Leberläppchen - Sinusoide, Leberzellbalken und Galle
- 17: Inhalte (Daten, getrennt vom Code): Texte von Joern freigegeben
- 188: Form (feste Größen, Modelleinheit 0,1 mm): reine Funktionen, die Geometrie als Daten liefern (organ.form). …
- 448: 1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie)
- 480: 2. Zustand, Bedienung
- 655: Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (H…
- 865: 3. Kamera: Ausschnitte, freier Bildbereich
- 943: 4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1108: 6. Stroemung: Blut (violett aus den Pfortaderaesten, rot aus den Arterienaesten, auf dem Weg zur Mitte allm…
- 1346: 6b. Krankheitsbilder und Medikamente im Laeppchen. Wirkgroessen SZW = Summe der (weich ueberblendeten) Ante…
- 1522: 7. Schema - das Laeppchen als flaches Bild (Knopf "Schema", wie bei der Leber)
- 1736: 8b. Lupe: Querschnitt durch die Wand eines Sinusoids bis zur Leberzelle (Knopf "Lupe" in der Zeile "Ansicht…
- 1906: 8c. Export (Kern.Export): GLB statisch und STL, jeweils der sichtbare Zustand (Durchsicht, ausgeblendete St…
- 2030: 8d. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, …
- 2100: 8. Renderschleife, Aufbau, Abbau

## organe/leber/leber-form.js (711 Zeilen) – Leber - Form: Aussenform der Leber, Gallenblase, Gefaesse und Gaenge als

## organe/leber/leber.css (132 Zeilen)

## organe/leber/leber.js (2507 Zeilen) – Leber - Lappen, Pfortader und Gallenwege
- 19: Inhalte (Daten, getrennt vom Code)
- 267: 1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie)
- 302: 2. Geometrie: Lappen, Gallenblase, Baender, Gefaesse und Gaenge, Zwoelffingerdarm, Papille, Zwerchfell
- 485: 3. Zustand, Bedienung
- 696: 4. Kamera: Ausschnitte, freier Bildbereich
- 759: Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (H…
- 946: 5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1128: 6. Stroemung: Blut (violett Pfortader, rot Leberarterie, blau Lebervenen und Hohlvene) und Galle (gruen) al…
- 1411: 7. Schema - die Leber als flaches Bild (Knopf "Schema", wie bei der Niere)
- 1737: 7b. Kamerafahrt zum Leberlaeppchen (Infokarte "Leberlaeppchen hier ansehen" bei den vier Lappen, Knopf "Lae…
- 1938: 7c. Krankheitsbilder und Medikamente in 3D. Wirkgroessen SZW = Summe der (weich ueberblendeten) Anteile * W…
- 2131: 7d. Lupe: Laengsschnitt durch die Papille (Knopf "Lupe" in der Zeile "Ansicht", Panel #lupe, Canvas #lpCv; …
- 2281: 7e. Export (Kern.Export): GLB statisch und STL, jeweils der sichtbare Zustand (Durchsicht, ausgeblendete St…
- 2355: 7f. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, …
- 2428: 8. Renderschleife, Aufbau, Abbau

## organe/lunge/alveole.css (191 Zeilen)

## organe/lunge/alveole.js (2675 Zeilen) – Alveole - Lungenbläschen und Gasaustausch
- 16: Inhalte (Daten, getrennt vom Code)
- 449: Form (feste Tabellen, Modelleinheit 0,1 mm): Rohre und Bläschen als Abstandsfeld
- 479: organ.form: Geometrie des Saeckchens fuer die Zoomstufe der Lunge (Kamerafahrt "Alveole hier ansehen"). Nur…
- 602: Aufbau
- 615: 1. Strukturen, Materialien
- 934: 2. Zustand, Bedienung
- 1205: 3. Kamera: Ausschnitte, freier Bildbereich
- 1287: 4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1436: 5. Gasaustausch (aus dem Alveolen-Modell): Zustand, Geometrie des Schemas, Simulation, Darstellung und Bedi…
- 2052: 6. Gasaustausch in 3D: die Simulation (gas) steuert das Modell, an der Physik des Originals aendert sich ni…
- 2296: 6b. Lupe: Querschnitt durch die Blut-Luft-Schranke (Knopf "Lupe" in der Zeile "Ansicht", Panel #lupe, Canva…
- 2485: 6c. Export (Kern.Export): GLB statisch und STL (Wand, Kapillaren, Gefaesse; der sichtbare Zustand, ohne Gas…
- 2551: 6d. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, …
- 2620: 7. Renderschleife, Aufbau, Abbau

## organe/lunge/lunge-form.js (286 Zeilen) – Lunge - Form: Brustkorb-Innenraum (Rippenparameter) und Aussenform der

## organe/lunge/lunge.css (198 Zeilen)

## organe/lunge/lunge.js (3132 Zeilen) – Lunge - Lappen, Atemwege und Atemmechanik
- 18: Inhalte (Daten, getrennt vom Code)
- 451: 1. Strukturen, Materialien
- 495: 2. Geometrie: Lappen, Rippenfell, Herz, Atemwege, Gefaesse, Zwerchfell, Brustkorb
- 831: 3. Zustand, Bedienung
- 1101: 4. Kamera: Ausschnitte, freier Bildbereich
- 1186: 5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1359: 6. Atmung (aus dem Thorax-Modell): Zustand, Geometrie des Schemas, Physik, Darstellung und Bedienung im Rei…
- 1827: 7. Atmung in 3D: Zwerchfell, Lunge und Brustkorb folgen den Muskeln des Schemas (S.d, S.i), die Luftteilche…
- 2225: 6b. Lupe: Querschnitt durch die Brustwand mit dem Pleuraspalt (Knopf "Lupe" in der Zeile "Ansicht", Panel #…
- 2398: 7c. Krankheitsbilder und Medikamente in 3D: Obstruktion o (Summe der Anteile * Wert des Eintrags, weich ueb…
- 2419: 7b. Kamerafahrt zur Alveole (Infokarte "Alveole hier ansehen" bei den Lungenlappen, Knopf "Alveole"): Der B…
- 2646: 7d. Export (Kern.Export): GLB statisch und STL (nur die geschlossenen Koerper: Lappen, Luftwege, Rippen, Br…
- 2791: 7e. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look (iPhone/iPad, …
- 2872: 7f. Herzschlag und kleiner Kreislauf: Das Herz zur Orientierung schlaegt, Blutportionen fliessen durch Herz…
- 3060: 8. Renderschleife, Aufbau, Abbau

## organe/niere/nephron.css (123 Zeilen)

## organe/niere/nephron.js (2737 Zeilen) – Nephron - Nierenkoerperchen und Tubulussystem
- 215: 1. Geometrie-Werkzeuge
- 419: 2. Szene, Licht, Material
- 498: 3. Strukturen
- 568: 4. Bahnen und Bauteile
- 845: 5. Stroemung
- 1301: 6. Zustand, Bedienung
- 1348: Krankheitsbilder - Daten fuer Reiter und Erklaerkarte.
- 1421: 6b. Hilfekarten und Ueben (wie in der Niere): Erklaerkarte #hcard unten links, Ueben "Strukturen finden"
- 1656: 7. Kamera
- 1687: 8. Beschriftung - wird nur neu gesetzt, wenn sich die Ansicht aendert
- 1769: 11. Lupe - Nahansicht quer durch die Wand eines Abschnitts.
- 2181: 9. Export
- 2258: AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore)
- 2301: 12. Schema - das Nephron als flaches Bild
- 2675: 10. Renderschleife

## organe/niere/niere-form.js (301 Zeilen) – Niere - Form: Aussenform der Niere als Baustein fuer den Koerper (und

## organe/niere/niere.css (115 Zeilen)

## organe/niere/niere.js (2710 Zeilen) – Niere - Rinde, Mark und Nierenbecken
- 20: Inhalte (Daten, getrennt vom Code)
- 283: 1. Strukturen, Materialien
- 341: 2. Geometrie: Gewebe in zwei Haelften, Hohlsystem, Nebenniere, Gefaesse
- 629: 3. Zustand, Bedienung
- 920: 4. Kamera: Ausschnitte, freier Bildbereich
- 1082: 5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1195: 5b. Stroemung: Blut (rot zur Niere hin, blau zurueck) und Harn (gelb) als Teilchen, dazu die Welle im Harnl…
- 1466: 5d. Krankheitsbilder und Medikamente: Wirkgroessen (FAKT), weich ueberblendet nach SZ.anteil (Zielwerte je …
- 1585: 5c. Lupe: Laengsschnitt durch die Spitze einer Nierenpapille (Knopf "Lupe", Tippen auf eine Papille waehlt …
- 1859: 5e. Schema - die Niere als flaches Bild (Knopf "Schema", wie beim Nephron)
- 2356: 6. Export (Kern.Export): GLB statisch und STL, jeweils der sichtbare Zustand (aufgeschnitten: ohne Deckel);…
- 2415: 7. AR - ohne weitere Apps: WebXR im Browser (Android, Chrome mit ARCore) oder AR Quick Look
- 2468: 7b. Kamerafahrt zum Nephron (Infokarte "Nephron hier ansehen" bei Rinde, Saeulen, Pyramiden und Papillen, K…
- 2640: 8. Renderschleife, Aufbau, Abbau

## organe/verdauung/darm.css (111 Zeilen)

## organe/verdauung/darm.js (2170 Zeilen) – Darm - Duenndarm, Dickdarm und Mastdarm
- 20: Inhalte (Daten, getrennt vom Code)
- 256: 1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie; die …
- 318: 2. Geometrie: Aussenhaut als Schlauch um die Mittellinie, Schichten und Kappen der vier Bereiche, Gekroese,…
- 681: 3. Zustand, Bedienung
- 893: 4. Kamera: Ausschnitte, freier Bildbereich
- 958: Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (H…
- 1169: 5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1375: 6. Stroemung: Kohlenhydrate (gelb), Eiweiss (orange), Fett (weiss), Wasser (hellblau), Galle (gruen), Pankr…
- 1640: 7. Schema - Wo wird was aufgenommen (Knopf "Schema", wie beim Magen)
- 1872: 7b. Kamerafahrt zur Duenndarmzotte (Knopf "Zotte", Infokarte "Duenndarmzotte hier ansehen" bei Leerdarm und…
- 2055: 8. Renderschleife, Aufbau, Abbau

## organe/verdauung/magen.css (109 Zeilen)

## organe/verdauung/magen.js (2245 Zeilen) – Magen - Mageneingang, Magensaft und Pförtner
- 16: Inhalte (Daten, getrennt vom Code)
- 226: 1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie; die …
- 274: 2. Geometrie: Aussenwand und Innenraum in Bereichen, Kappen der Schnittflaeche, Rohre (Speiseroehre, Zwoelf…
- 548: 2b. Fuellung (nuechtern <-> nach dem Essen) und Muskelwellen - ohne neu zu vernetzen
- 918: 3. Zustand, Bedienung
- 1100: 4. Kamera: Ausschnitte, freier Bildbereich
- 1164: Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (H…
- 1366: 5. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1584: 6. Stroemung: Kohlenhydrate (gelb), Eiweiss (orange), Fett (weiss), Wasser (hellblau) und Magensaft (tuerki…
- 1889: 7. Schema - der Weg der Nahrung von Mund bis After (Knopf "Schema", wie bei der Leber)
- 2144: 8. Renderschleife, Aufbau, Abbau

## organe/verdauung/verdauung-form.js (1363 Zeilen) – Verdauung - Form: Speiseroehre, Magen, Duenndarm (mit Zwoelffingerdarm) und
- 755: Darm: Zwoelffingerdarm bis After (Koerper-Koordinaten, cm)

## organe/verdauung/zotte.css (110 Zeilen)

## organe/verdauung/zotte.js (1865 Zeilen) – Dünndarmzotte - Saumzellen, Kapillaren und Lymphgefäß
- 16: Inhalte (Daten, getrennt vom Code): Texte von Joern freigegeben (darm-b-texte.md, Teil 2)
- 166: Form (feste Größen, Modelleinheit 0,1 mm): reine Funktionen, die Geometrie als Daten liefern (organ.form). …
- 531: Strömung: Wege der Teilchen (nur Daten und Formeln, kein three.js, kein Zufall) und Zottenpumpe
- 696: 1. Strukturen, Materialien (jede Struktur hat ihr eigenes Material: beim Hervorheben leuchtet nur sie)
- 742: 2. Zustand, Bedienung
- 905: 3. Kamera: Ausschnitte, freier Bildbereich
- 963: Erklaerkarte (Hilfekarten, Ueben): Kicker, Titel, Text, Abschnitt "Merke"; unten links wie die Infokarte (H…
- 1169: 4. Beschriftung mit Fuehrungslinien in Spalten - wird nur neu gelegt, wenn sich die Ansicht aendert
- 1349: 6. Stroemung: Zucker (gelb), Aminosaeuren (orange), Fett (weiss), Wasser (hellblau) und Blut (rot zu violet…
- 1554: 7. Schema - Oberflaeche und Wege der Stoffe (Knopf "Schema", wie beim Darm)
- 1747: 8. Renderschleife, Aufbau, Abbau

## tools/duenndarm-knaeuel/abstand.js (54 Zeilen)

## tools/duenndarm-knaeuel/einbauen.js (12 Zeilen)

## tools/duenndarm-knaeuel/formen.js (16 Zeilen)

## tools/duenndarm-knaeuel/hole.js (32 Zeilen)

## tools/duenndarm-knaeuel/index.js (36 Zeilen) – Duenndarm als dichtes Knaeuel: berechnet die Tabelle DUENN_TAB in

## tools/duenndarm-knaeuel/lagen.js (38 Zeilen)

## tools/duenndarm-knaeuel/pruefe.js (11 Zeilen)

## tools/duenndarm-knaeuel/relax.js (45 Zeilen)

## tools/duenndarm-knaeuel/schnitt.js (11 Zeilen)

## tools/duenndarm-knaeuel/weg.js (68 Zeilen)

## tools/kontext.js (141 Zeilen) – Kontext-Karte und Doku-Budget

## tools/live.js (188 Zeilen) – Prüfung der veröffentlichten Seite (GitHub Pages) gegen den lokalen Stand

## tools/nachweis.js (374 Zeilen) – Nachweis: Atmungs-Schema der App gegen das Original-Modell
- 196: Alveole: Schema des Gasaustauschs gegen das Original-Modell

## tools/symbole.js (42 Zeilen) – App-Symbole des Anatomie-Atlas

## tools/vergleich.js (2067 Zeilen) – Vergleichsaufnahmen für den Anatomie-Atlas (index.html) mit Körper, Herz, Niere und Nephron
- 165: 1. Im Browser (vor allen Skripten der Seite)
- 343: 2. Abläufe je Modell
- 1712: 3. Aufnehmen
- 1889: 4. Vergleichen
- 2051: 5. Aufruf

## tools/version.js (198 Zeilen) – Versionsnummer des Service Workers (sw.js)
