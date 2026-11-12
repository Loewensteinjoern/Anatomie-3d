# Übergabe: Magen, Darm und Zotte – PR C (Stand 12. November 2026)

## Stand

- Gemergt: PR A Magen (#45), PR B Darm mit Dünndarmzotte (#46), Optik des Darms (#49: Farben, Haustren/Tänien, Dünndarm als Knäuel r 1,1, ca. 298 cm; Werkzeug `tools/duenndarm-knaeuel/`), Prüfläufe nach Betroffenheit (#50: `tools/betroffen.js`, Schnelltest `<modell>:kurz`, siehe `CLAUDE.md`).
- Freigegebene Texte: `docs/freigaben/magen-a-texte.md`, `docs/freigaben/darm-b-texte.md` – unverändert lassen.
- Magen, Darm und Zotte haben noch keine Krankheitsbilder, Medikamente, Lupe, Export und AR (`vergleich.js`: dort „keine Exporte, kein AR“).

## Aufgabe PR C

Krankheitsbilder, Medikamente, Lupen, Export (GLB, STL) und AR (WebXR, AR Quick Look) für Magen, Darm und Zotte.

1. Zuerst mit Jörn abstimmen, in Runden mit Fragen und Optionen, die Empfehlung zuerst: grundsätzlich (welche Krankheitsbilder und Medikamente je Modell, für Pflege und Gesundheitsberufe; was die Lupe zeigt; ob ein PR oder mehrere), dann Einzelheiten. Alle Texte entwirft Claude und legt sie wörtlich zur Freigabe vor; danach `docs/freigaben/magen-darm-c-texte.md`.
2. Umsetzung durch den Executor in kleinen Schritten, nach jedem Schritt Bilder an Jörn.
3. `tools/vergleich.js` um die neuen Kontexte erweitern (Szenarien, Lupe, Exporte, webxr, quicklook wie bei der Leber), `docs/vergleich-kontexte.md` nachtragen.

## Vorbilder

- Leber (`organe/leber/leber.js`): 7c Krankheitsbilder und Medikamente in 3D (Wirkgrößen `SZW`), 7d Lupe, 7e Export, 7f AR. Läppchen (`laeppchen.js`): 6b, 8b Lupe, 8c Export, 8d AR.
- Daten: `Kern.Szenarien.daten.leber` in `core/szenarien.js` (Reiter, Erklärkarte `#kcard`).
- Abschnitte per `grep -n -A40 "^## <pfad>" KONTEXT.md` finden, nicht ganze Dateien lesen.

## Achtung

- Darm: Die Sichtprüfung der Beschriftung nutzt vier Nachbarstrahlen (`frei`/`strahlFrei` in `darm.js`); Sigma, Gekröse und Darmgefäße sind von vorn verdeckt.
- Im Körper bekommt die gemeinsame Kugel-Geometrie `sphG` ein ungenutztes Farbattribut (Tänien-Vertexfarben); beim Export prüfen, dass nichts Unerwartetes mitkommt.
- Offen und nicht Teil von PR C: Wirkung der Medikamente in Leber und Läppchen prüfen (`PLAN.md`, Offene Punkte).
