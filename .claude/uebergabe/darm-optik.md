# Übergabe: Optik des Darms nach anatomischer Vorlage (Stand 11. November 2026)

## Ziel

Jörn möchte, dass der Darm mehr einer anatomischen Vorlage ähnelt, die er im Chat hochlädt. Die Vorlage dient nur als Anschauung. Bilder oder Formen daraus nicht ins Repository übernehmen, denn fremde Inhalte brauchen Jörns Freigabe (siehe `LIZENZEN.md`).

## Stand

- Magen (#45) und Darm mit Dünndarmzotte (#46) sind gemergt. PR C (Krankheitsbilder usw., `pr-c.md`) wartet bis nach diesem Schritt.
- Die Texte sind freigegeben (`docs/freigaben/darm-b-texte.md`) und bleiben unverändert. Ändert sich ein Name oder eine Lage, nur mit Jörns Zustimmung.

## Entscheidungen (Runde 1, 11. November 2026)

- Dünndarm als dichtes Knäuel vieler kürzerer Schlingen, eng aneinander, ganz innerhalb des Dickdarmrahmens (heute: wenige lange, waagrechte Schlingen mit Lücken, ragen rechts und unten über den Dickdarm).
- Dünndarm etwas dicker (r 0,9 → ca. 1,1 cm), Dickdarm bleibt.
- Haustren flacher und etwas unregelmäßig statt Perlenkette, Tänien deutlich sichtbar.
- Farbe wie Vorlage: Dünndarm blassrosa mit dunkleren Furchen, Dickdarm heller graurosa statt braun-lachs.

## Vorgehen

1. Vorlage ansehen und den Unterschied zum heutigen Darm beschreiben. Dafür Bilder aufnehmen, zum Beispiel `darm-desktop-01-uebersicht`, sowie Körper/Bauch (`tools/vergleich.js --nur darm`). Dabei Lage, Schlingen, Dicke, Haustren, Farbe und Gekröse betrachten.
2. Jörn fragen: Fragen mit Optionen, die Empfehlung zuerst, was genau angepasst wird, zum Beispiel der Verlauf von Dick- und Dünndarm, die Dicke, die Oberfläche oder die Farbe.
3. Umsetzung mit dem Executor in kleinen Schritten. Nach jedem Schritt Bilder zeigen, Jörn entscheidet.

## Wo im Code

- Form: `organe/verdauung/verdauung-form.js` ab „Darm: Zwoelffingerdarm bis After“ (ca. Zeile 755): `DUENN_TAB` (Mittellinie des Dünndarms), `duenndarm()`, `dickdarm(opt)` (Haustren, Tänien), `ringfalte()`, `gekroese()`, `darmGefaesse()`, `darmKennpunkte()` (Ankerpunkte der Beschriftung).
- Darstellung: `organe/verdauung/darm.js`, Abschnitt 1 (Materialien/Farben) und 2 (Geometrie). Die Teilchenwege in Abschnitt 6 folgen der Mittellinie.
- Der Körper (`organe/koerper/koerper.js`) zeigt den Darm aus derselben Form. Auch die Kamerafahrt „Darm öffnen“ und die Fahrt zur Zotte (darm.js 7b) hängen daran.

## Achtung

- Der Magen nutzt dieselbe Formdatei und muss bytegleich bleiben. Erwartete Abweichungen: der Darm, der Körper im Bauchbereich und die Atlas-Übergänge. Die Zotte bleibt gleich.
- Partikel müssen im Darm bleiben, die Beschriftung muss lesbar sein, auch auf dem Handy (390×844). Leber und Pfortader müssen angeschlossen bleiben, die Fahrten weiterhin funktionieren.
- Prüfung vor dem PR wie in `CLAUDE.md` beschrieben.
