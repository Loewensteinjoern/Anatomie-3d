# Anatomie-3d – Arbeitsweise mit Claude

Jörn möchte geduzt werden. Zielgruppe der App: Pflege und Gesundheitsberufe.

## Sparsam mit Kontext (gilt für jede Sitzung)

- Lesereihenfolge: diese Datei → `PLAN.md` → `.claude/uebergabe/` (nur die aktuelle Übergabe). `docs/` und `KONTEXT.md` nur gezielt per `grep`, nie ganz.
- Code nie ganz lesen: `grep -n -A40 "^## <pfad>" KONTEXT.md`, dann nur den Abschnitt (ca. 100–200 Zeilen). `vendor/` nie lesen. Von Vergleichsläufen nur die Zusammenfassung lesen (`tail`, `grep ABWEICHUNG\|ABBRUCH\|anders`).
- Kleine Änderungen (eine Stelle, ein Text) selbst machen; den Executor für größere Schritte, mit Datei, Abschnitt/Zeilen und Vorbild im Auftrag, damit er nicht selbst sucht. Den Diff prüfen statt die Dateien neu zu lesen.
- Eine Sitzung je Schritt bzw. PR. Am Ende eine kurze Übergabe (höchstens 3 KB) nach `.claude/uebergabe/`, die vorige ersetzen; nach dem Merge löschen. Freigegebene Texte nach `docs/freigaben/`.
- Wachstum begrenzen: `node tools/kontext.js --pruefen` vor jedem Commit (Exit 0). Es prüft, dass `KONTEXT.md` aktuell ist und `CLAUDE.md`, `executor.md`, `PLAN.md` und die Übergaben unter ihren Obergrenzen bleiben. Ein neues Organ fügt `executor.md` höchstens eine Tabellenzeile und `PLAN.md` eine Zeile hinzu; Einzelheiten gehören in `docs/` oder als Kommentar an den Abschnitt im Code. Obergrenzen nur mit Jörn anheben.

## Vorgehen (wie bei der Leber, von Jörn so gewünscht)

- Jörn zuerst fragen: Fragen mit Optionen, Empfehlung zuerst, in Runden (Grundsätzliches, dann vor jedem PR Einzelheiten und Texte). Alle Texte entwirft Claude, legt sie wörtlich zur Freigabe vor; freigegebene Texte unverändert übernehmen; spätere Textänderungen nur mit Jörns Zustimmung. Zielgruppe Pflege und Gesundheitsberufe.
- Planen und Prüfen im Hauptgespräch; Umsetzung durch den Executor (Subagent `executor`) mit genauen Aufträgen (Dateien, Vorbilder, wörtliche Texte aus der freigegebenen Datei, Regeln, Prüfung mit Bildern im Scratchpad, Bericht). Der Executor bricht ab und berichtet, statt zu improvisieren. Er ändert `executor.md` und `PLAN.md` nicht; die pflegt Claude im Hauptgespräch.
- Commit, Push und PR macht Claude selbst; ein PR je Schritt nach `main`; Zwischenstände dürfen auf den Arbeitszweig; PR erst nach vollständiger Prüfung. Erst weiterpushen, wenn klar ist, dass Jörn den PR noch nicht gemergt hat (bei PR #43 kam eine Korrektur nach dem Merge nicht mehr nach `main` und musste in PR C nachgezogen werden).

## Prüfung vor jedem PR

- Vollständiger Vergleichslauf mit `tools/vergleich.js` gegen die Referenz von `main`: `git archive origin/main` in den Scratchpad entpacken und mit `--quelle <ordner>` aufnehmen. Jede Abweichung einem Bereich zuordnen; nur vereinbarte Bereiche dürfen abweichen. Herz, Niere, Nephron, Lunge, Alveole (und alles, was der PR nicht berührt, z. B. Leber und Läppchen in PR A nur, wenn der Körper sie nicht verändert) müssen bytegleich sein. `vergleich.js` um neue Bilder erweitern (am Ende eines Kontexts oder als neuer Kontext). Ausnahme: reine Doku-Änderungen – `node tools/kontext.js --doku-pr` endet mit 0 (nur `*.md` im Hauptordner, `docs/`, `.claude/`, `tools/kontext.js` geändert) und `node tools/version.js --pruefen` ebenso; dann entfällt der Vergleichslauf, im PR-Text die Ausgabe beider Befehle nennen.
- Ein vollständiger Lauf dauert über eine Stunde, Hintergrundbefehle werden nach 2 Stunden beendet: Referenz und neuen Stand je in zwei Teilen aufnehmen, z. B. `--nur` nacheinander für `koerper herz niere lunge` und für `alveole nephron leber laeppchen atlas` (Skript, das `--nur <modell>` je Modell in dasselbe Ziel aufruft). Nie zwei Läufe gleichzeitig, auch keinen Lauf neben einer Browserprüfung. Warten mit `pgrep -f "^node tools/(vergleich|nachweis)"` – nie ohne `^`, sonst findet die Warteschleife sich selbst.
- Nach einem Neustart der Umgebung die Referenz neu aufnehmen. In der Referenz sind „version.js: ABWEICHUNG … git ls-files nicht möglich“ und Abbrüche bei Knöpfen, die `main` noch nicht hat, harmlos. Bei einem Abbruch mit Zeitüberschreitung den Kontext mit `--nur modell:kontext` für beide Stände wiederholen und nur Teilaufnahmen miteinander vergleichen. Eine einzelne kleine Abweichung an einer Schriftkante oder bei der Deckkraft einer Beschriftung (CSS-Übergang in Echtzeit) zuerst mit `--nur` wiederholen.
- Selbst im Browser ansehen: Desktop 1280×800 und Handy 390×844.
- Erfahrungen aus PR B: Teile mit vielen Modellen überschreiten die 2 Stunden – lieber je Modell einen Hintergrundbefehl (Zeitlimit 7200000 ms angeben, sonst endet er nach 30 Minuten). Wird ein Lauf beim Atlas abgebrochen, sind dessen Ergebnisse nicht gespeichert: die fehlenden Atlas-Kontexte mit `--nur atlas:<kontext>` nachholen. Eine längere Liste `DATEIEN` in `sw.js` verschiebt die Phase der Leberteilchen (Leber-Modell, alle Bilder mit Teilchen und die animierten GLB); geprüft mit `main` plus nur dem neuen `sw.js` – harmlos, im PR erklären.
- Danach PLAN.md (Spalte und Schritte) und `docs/dateien.md`/`docs/vergleich-kontexte.md` knapp nachtragen (Regeln in `executor.md` nur, wenn eine neue Regel nötig ist), Erledigtes nach `docs/plan-archiv.md`; `node tools/kontext.js` ausführen.

## Commits und PR

- Commit-Nachrichten auf Deutsch, am Ende die Zeilen für Mitautor und Sitzung, die die Umgebung vorgibt. PR-Text: Inhalt, Prüfung (was bytegleich ist, welche Abweichungen wo und warum), am Ende die von der Umgebung vorgegebene Zeile.
