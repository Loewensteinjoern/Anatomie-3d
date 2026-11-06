# Übergabe: Magen und Darm mit Dünndarmzotte (Stand 6. November 2026)

Für einen neuen Chat. Zuerst lesen: `PLAN.md` (Phase 3, Abschnitt „Magen und Darm mit Dünndarmzotte“ – dort stehen alle mit Jörn abgestimmten Entscheidungen), `.claude/agents/executor.md`, dann diese Datei und `.claude/uebergabe/magen-a-texte.md`.

## Stand

- Leber mit Leberläppchen ist fertig (PR #42, #43, #44 gemergt).
- Magen und Darm: Grundsatzfragen und Einzelheiten für PR A sind abgestimmt (siehe PLAN.md).
- Die Texte für PR A hat Jörn am 6. November 2026 freigegeben (mit Änderungen, siehe Kopf von `magen-a-texte.md`). Jörn möchte geduzt werden.
- Arbeitszweig: `claude/magen-darm-a` (von `main`, enthält nur PLAN.md und diese Übergabe; noch kein Code).

## Vorgehen (wie bei der Leber, von Jörn so gewünscht)

- Jörn zuerst fragen: Fragen mit Optionen, Empfehlung zuerst, in Runden (Grundsätzliches, dann vor jedem PR Einzelheiten und Texte). Alle Texte entwirft Claude, legt sie wörtlich zur Freigabe vor; freigegebene Texte unverändert übernehmen; spätere Textänderungen nur mit Jörns Zustimmung. Zielgruppe Pflege und Gesundheitsberufe.
- Planen und Prüfen im Hauptgespräch; Umsetzung durch den Executor (Subagent `executor`) mit genauen Aufträgen (Dateien, Vorbilder, wörtliche Texte aus der freigegebenen Datei, Regeln, Prüfung mit Bildern im Scratchpad, Bericht). Der Executor bricht ab und berichtet, statt zu improvisieren. Er ändert `executor.md` und `PLAN.md` nicht; die pflegt Claude im Hauptgespräch.
- Commit, Push und PR macht Claude selbst; ein PR je Schritt nach `main`; Zwischenstände dürfen auf den Arbeitszweig; PR erst nach vollständiger Prüfung. Erst weiterpushen, wenn klar ist, dass Jörn den PR noch nicht gemergt hat (bei PR #43 kam eine Korrektur nach dem Merge nicht mehr nach `main` und musste in PR C nachgezogen werden).

## Regeln (aus executor.md, besonders wichtig)

- Content-Security-Policy: keine `<style>`-Elemente, keine Inline-Skripte, keine fremden Adressen (die Kennung des SVG-Namensraums ist erlaubt). Kein fremder Code ohne Jörns Freigabe (LIZENZEN.md).
- Neue Dateien in `DATEIEN` (sw.js) und `Kern.ORGANE`/`Kern.FORMEN` (core/rahmen.js), dann `node tools/version.js`; `node tools/version.js --pruefen` muss mit 0 enden.
- Jedes neue three.js-Objekt verbraucht Zufallszahlen: Objekte, die nicht sofort gebraucht werden (AR, Zoomstufe, Krankheitsbilder), erst bei Bedarf anlegen; Schemata als SVG im DOM, Lupen als Canvas. Kein `Math.random` (außer der Aufgabenauswahl beim Üben).
- Jede Struktur, die man einzeln auswählen oder beim Üben suchen kann, bekommt ein eigenes Material.
- Ein neuer Knopf in der Werkzeugleiste darf auf dem Handy keine neue Zeile erzwingen (Lupe und AR stehen wie bei Niere und Leber in der Zeile „Ausschnitt“ nach „Schema“); Panels, Karten und Schemata dürfen die Werkzeugleiste nicht verdecken (`--wz`); der Zurück-Knopf des Atlas nicht über einer offenen Karte; Handy-Layout immer bei 390×844 prüfen.

## Prüfung vor jedem PR

- Vollständiger Vergleichslauf mit `tools/vergleich.js` gegen die Referenz von `main`: `git archive origin/main` in den Scratchpad entpacken und mit `--quelle <ordner>` aufnehmen. Jede Abweichung einem Bereich zuordnen; nur vereinbarte Bereiche dürfen abweichen. Herz, Niere, Nephron, Lunge, Alveole (und alles, was der PR nicht berührt, z. B. Leber und Läppchen in PR A nur, wenn der Körper sie nicht verändert) müssen bytegleich sein. `vergleich.js` um neue Bilder erweitern (am Ende eines Kontexts oder als neuer Kontext).
- Ein vollständiger Lauf dauert über eine Stunde, Hintergrundbefehle werden nach 2 Stunden beendet: Referenz und neuen Stand je in zwei Teilen aufnehmen, z. B. `--nur` nacheinander für `koerper herz niere lunge` und für `alveole nephron leber laeppchen atlas` (Skript, das `--nur <modell>` je Modell in dasselbe Ziel aufruft). Nie zwei Läufe gleichzeitig, auch keinen Lauf neben einer Browserprüfung. Warten mit `pgrep -f "^node tools/(vergleich|nachweis)"` – nie ohne `^`, sonst findet die Warteschleife sich selbst.
- Nach einem Neustart der Umgebung die Referenz neu aufnehmen. In der Referenz sind „version.js: ABWEICHUNG … git ls-files nicht möglich“ und Abbrüche bei Knöpfen, die `main` noch nicht hat, harmlos. Bei einem Abbruch mit Zeitüberschreitung den Kontext mit `--nur modell:kontext` für beide Stände wiederholen und nur Teilaufnahmen miteinander vergleichen. Eine einzelne kleine Abweichung an einer Schriftkante oder bei der Deckkraft einer Beschriftung (CSS-Übergang in Echtzeit) zuerst mit `--nur` wiederholen.
- Selbst im Browser ansehen: Desktop 1280×800 und Handy 390×844.
- Danach PLAN.md (Spalte und Schritte) und executor.md (Dateien, `vergleich.js`-Kontexte) nachtragen.

## Commits und PR

- Commit-Nachrichten auf Deutsch, am Ende die Zeilen für Mitautor und Sitzung, die die Umgebung vorgibt. PR-Text: Inhalt, Prüfung (was bytegleich ist, welche Abweichungen wo und warum), am Ende die von der Umgebung vorgegebene Zeile.
