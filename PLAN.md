# Plan: Anatomie-App (3D)

Ziel ist eine Anatomie-App, in der der ganze Körper existiert und alle Organe mit ihren Funktionen darstellbar sind. Jedes Organ wird nach demselben Bauplan aufgebaut wie die beiden vorhandenen Modelle Herz (`index.html#herz`) und Nephron (`index.html#nephron`).

Erledigtes, Bauplan-Tabelle, Ebenen und Architektur: `docs/plan-archiv.md` (nur bei Bedarf). Arbeitsweise und Sparregeln: `CLAUDE.md`.

## Stand je Organ

| Organ | Adresse | Stand |
|---|---|---|
| Körper | `index.html` | Atlas mit Organsystemen, Kamerafahrten, AR, offline |
| Herz | `#herz` | Bauplan komplett; Form noch über `organ.form` in `herz.js` |
| Niere mit Nephron | `#niere`, `#niere/nephron` | Bauplan komplett |
| Lunge mit Alveole | `#lunge`, `#lunge/alveole` | Bauplan komplett |
| Leber mit Leberläppchen | `#leber`, `#leber/laeppchen` | Bauplan komplett |
| Magen | `#magen` | PR A fertig (#45); Krankheitsbilder, Lupe, Export, AR folgen in PR C |
| Darm mit Dünndarmzotte | `#darm`, `#darm/zotte` | PR B fertig (#46); Krankheitsbilder, Lupe, Export, AR folgen in PR C |

Je Organ nur eine Zeile. Einzelheiten eines fertigen Schritts wandern nach dem Merge nach `docs/plan-archiv.md`.

## Aktuell und als Nächstes

- [ ] Magen und Darm mit Dünndarmzotte
  - Mit Jörn abgestimmt (November 2026): zwei Modelle – Magen (`#magen`) und Darm (`#darm`), die Dünndarmzotte als Zoomstufe des Darms (`#darm/zotte`, wie Lunge → Alveole und Leber → Läppchen); keine Vorlage, alle Texte entwirft Claude und Jörn gibt sie frei; Dateien unter `organe/verdauung/` (Form-Baustein `verdauung-form.js` für den ganzen Trakt, `magen.js`, `darm.js`, `zotte.js`)
  - Drei Pull Requests: A Form-Baustein für den ganzen Verdauungstrakt, Körper (Magen, Dünndarm und Dickdarm aus der Form statt der Platzhalter, angeschlossen an Speiseröhre, Leber, Zwölffingerdarm und Pfortader; „Magen öffnen“ mit Kamerafahrt) und das Magenmodell komplett; B Darm mit Dünndarmzotte und Zoomstufe („Darm öffnen“ im Körper); C Krankheitsbilder, Medikamente, Lupen, Export und AR für Magen, Darm und Zotte
  - Funktion: Stoffe schon im Organ sichtbar, eigene Schalterzeile „Stoffe“ mit vier Schaltern Kohlenhydrate, Eiweiß, Fett, Wasser (wie beim Leberläppchen); Magen: Eiweiß wird von Säure und Pepsin angedaut, Fett verlässt den Magen zuletzt, Wasser rasch entlang der kleinen Kurvatur; Darm: Aufspaltung mit Galle und Pankreassaft, Aufnahme im Dünndarm, Wasserentzug im Dickdarm; Zotte: Zucker und Aminosäuren ins Blut, Fett ins Lymphgefäß; Teilchen ohne Zufall, Zeit gerafft
  - Magen (PR A): Ende der Speiseröhre mit Mageneingang, Magengrund, Magenkörper, Magenvorhof, Pförtner, Schleimhaut mit Falten, drei Muskelschichten, Anfang des Zwölffingerdarms, Magenarterien, Magenvenen, Anfang der Pfortader, Vagusnerv; Zwerchfell nur als Lage (Leber und Milz nicht im Magenmodell, sie sind eigene Organe – Jörn); Ausschnitte Übersicht, Innenansicht (vordere Wand abgehoben), Mageneingang, Pförtner und Schema; Schalter nüchtern / nach dem Essen: der Magen dehnt sich, die Falten glätten sich, Magensaft fließt, Muskelwellen treiben den Speisebrei portionsweise durch den Pförtner; Schema = Weg der Nahrung durch den ganzen Trakt von Mund bis After mit dem Magen hervorgehoben; Hilfekarten und Üben wie bei der Leber (Strukturen finden, drei Wege: Nahrung, Magensaft, Blut zur Pfortader)
  - [x] A1: Form-Baustein `organe/verdauung/verdauung-form.js` (Bahnen von Speiseröhre und Darm, Magen als Beutel mit Füllung, der den Nachbarn ausweicht, Wandschichten mit Falten, Gefäße, Vagus, Zwerchfell-Ausschnitt); der Körper zeigt Speiseröhre, Magen und Darm daraus; das Querkolon liegt jetzt unter dem Magen, die Dünndarmschlingen 1,5 cm tiefer (der Darm selbst folgt in PR B); keine Magengefäße im Körper (Jörn)
  - [x] A2: Detailmodell `#magen` mit 14 Strukturen, Ausschnitten Übersicht, Innenansicht (vordere Wand gleitet ab), Mageneingang, Pförtner, Durchsicht, Beschriftung, Lesehilfe; Wand für die Darstellung ca. 0,8 cm dick (Ladezeit); „Magen öffnen“ mit Kamerafahrt aus dem Körper und zurück
  - [x] A3: Stoffe und Magensaft als Teilchen, Zeilen „Stoffe“ und „Strömung“ (Handy eine Zeile mehr), nüchtern / nach dem Essen mit Dehnung, glatteren Falten, Muskelwellen und Pförtner; Schema „Weg der Nahrung“; Blutteilchen in den Magengefäßen entfallen
  - [x] A4: Hilfekarten, Üben (Strukturen finden; drei Wege mit Durchsicht statt Innenansicht, damit alle Stationen antippbar sind); `tools/vergleich.js` mit Modell `magen` und Übergängen Körper–Magen
  - Texte für PR A: von Jörn freigegeben in `docs/freigaben/magen-a-texte.md` (Stofffarben gelb Kohlenhydrate, orange Eiweiß, weiß Fett, hellblau Wasser, türkis Magensaft; Nüchternzeiten ohne Stundenangabe; Magensonde: Abhören oder pH-Test nach Hausstandard; der Körper bekommt keine Magengefäße)
  - [x] B1–B6: Darm und Dünndarmzotte (PR #46; Abstimmung und Schritte in `docs/plan-archiv.md`, Texte in `docs/freigaben/darm-b-texte.md`)
  - [x] Optik des Darms nach einer anatomischen Vorlage von Jörn (Farben, Haustren und Tänien, Dünndarm als Knäuel; Einzelheiten in `docs/plan-archiv.md`)
  - [ ] C: Krankheitsbilder, Medikamente, Lupen, Export und AR für Magen, Darm und Zotte – zuerst Einzelheiten und Texte mit Jörn abstimmen
- [ ] Gehirn mit Neuron und Synapse
- [ ] Muskel mit Sarkomer, Skelett und Gelenk
- [ ] Auge, Ohr, Haut, Hormondrüsen

## Offene Punkte

Wörtlich aus den erledigten Phasen übernommen (Quelle in Klammern):

- Herz: Die Auslagerung der Form nach `herz-form.js` folgt, wenn sie sich lohnt. (Bauplan)
- Kern: noch je Organ, kann später in den Kern wandern: Lupe, Üben, Beschriftungs-Layout (Phase 0)
- noch offen für die Rahmenseite: Organ-CSS nur im eigenen Bereich (`.organ-herz`), Renderer-Optionen je Organ (Herz `alpha`) beim Wechsel, Ladeanzeige `#boot` im Rahmen (Phase 1)
- Getestet auf dem iPhone (AR Quick Look): funktioniert gut; Android (WebXR, Chrome) auf einem echten Gerät noch nicht getestet (Phase 1, AR Körper)
- Noch auf echten Geräten zu testen: AR Quick Look und Export-Downloads in der Startbildschirm-App (iPhone) sowie Android (Phase 1, Offline)
- Noch auf echten Geräten zu testen: Nephron in AR (Deckkraft), Niere in AR Quick Look (USDZ ca. 9,7 MB), Fahrt Körper → Niere → Nephron und Handy-Layout (Schema von Nephron und Niere: Leiste ausgeblendet, Werkzeugleiste unten, Schema darüber; die Kennzahlen der Niere stehen im Schema auch auf dem Handy) (Phase 2)
- Später: Wechselwirkung Herz und Lunge (z. B. Linksinsuffizienz → Lungenstauung, COPD → Rechtsherzbelastung), direkter Wechsel Herz ↔ Lunge, gemeinsames Schema; Ebenen 2 und 4 der Vorlagen, wenn Jörn sie liefert (Lunge)
- Offen (späterer Durchgang, Wunsch von Jörn, November 2026): Wirkung aller Medikamente in Leber und Läppchen fachlich kontrollieren – bei der Paracetamol-Überdosis zeigt die Leber keine Veränderung, bei Lactulose (Bifiteral) schrumpft sie dagegen; prüfen, ob das so richtig ist (Wirkgrößen in `Kern.Szenarien.daten.leber`, Abschnitt 7c in leber.js, 6b in laeppchen.js), dann mit Jörn abstimmen
- Offen (eigener Pull Request): Nephron – bei Auswahl eines Tubulusabschnitts (Strukturliste oder Antippen) leuchten die Abschnitte vom proximalen bis zum distalen Tubulus gar nicht und beim Sammelrohr das ganze Rohr: die sechs Abschnitte teilen sich `MAT.tubule`, `setSelected` setzt `emissive` nacheinander, der letzte gewinnt. Beim Üben ist es über ein Klon-Material schon gelöst (`leuchte` in nephron.js).

## Meilenstein: Version 1.0 für die Kollegen

Die Kollegen bekommen die App erst als fertige Version 1.0 und testen sie dann je für ihren Fachbereich.

- [ ] Umfang: alle Organe aus Phase 1 bis 3 – Körper-Atlas, Herz, Niere mit Nephron, Lunge, Leber, Magen und Darm, Gehirn, Muskel/Skelett/Gelenk, Auge, Ohr, Haut, Hormondrüsen – jeweils nach dem Bauplan (Strukturen, Beschriftung, Funktion, Lupe, Hilfe und Üben, Krankheitsbilder und Medikamente, Export, AR)
- [ ] Offline als installierbare Web-App
- [ ] Kurze Startanleitung in der App
- [ ] Vor der Weitergabe: fachliche Durchsicht der Texte, Test auf echten Geräten (Android, iPhone/iPad, Laptop)
- Rückmeldungen danach: Die Kollegen sagen oder schreiben sie Jörn, er gibt sie gesammelt an Claude weiter (Organ und Stelle, was fehlt oder falsch ist, Fachbereich); Claude sortiert sie (fachlicher Fehler, Verständlichkeit, Bedienung, Wunsch) und schlägt die Reihenfolge vor; keine Rückmeldefunktion in der App.

## Laufend

- [ ] Schema wächst mit (Herz, Lunge, Niere, Leber im Kreislauf verbunden; Simulationen beeinflussen sich, z. B. Blutdruck und Nierenfunktion)
- [ ] Krankheitsbilder und Medikamente pro Organ

## Entscheidungen

- [x] Zielgruppe: Pflege und Gesundheitsberufe – verständliche Funktionen, wichtige Strukturen, Krankheitsbilder und Medikamente (Niveau wie Herz und Nephron)
- [x] Ganzkörpermodell: selbst gebaut und stilisiert, per Code wie Herz und Nephron (einheitlicher Stil, kleine Dateien, keine Lizenzauflagen)
- [x] Reihenfolge der Organe wie in Phase 3 vorgeschlagen
- [x] Repository in „Anatomie-3d“ umbenennen, sobald es mehr als das Herz enthält
- [x] Zusammenhängende App: eine Seite, Organe werden in dieselbe 3D-Szene nachgeladen (statt getrennter Seiten mit Seitenwechsel); jede Ansicht mit eigener Adresse
- [x] Erste Weitergabe an Kollegen erst als Version 1.0 mit allen Organen; bis dahin testen nur Jörn und Claude
- [x] Offline: installierbare Web-App (PWA) als Hauptweg; Ordner/ZIP ohne Server bleibt möglich; eine Einzeldatei nur bei Bedarf als zusätzliches Werkzeug
- [x] Kein fremder Code ohne Freigabe von Jörn (Oktober 2026): fremde Bibliotheken nur unverändert in `vendor/` mit Lizenz und Prüfsumme, bekannte Verfahren werden selbst umgesetzt; Lizenzen in `LIZENZEN.md`
- [x] Phase 2: Adressen gestuft (`#niere/nephron`, alte Links leiten weiter), Niere als Frontalschnitt mit Durchblutung und Harnabfluss, Lupe an der Papille, Nephron als Zoomstufe mit Kamerafahrt, Nephron-Schema in der Form des 3D-Modells (Einzelheiten unter Phase 2)

## Arbeitsweise

- Planung und Prüfung im Hauptgespräch; Umsetzung einzelner Schritte durch den Executor-Subagenten (`.claude/agents/executor.md`, Sonnet). Commit und Push nur durch den Aufrufer. Der Executor ändert `executor.md` und `PLAN.md` nicht selbst, sondern schlägt Doku-Änderungen vor; der Aufrufer übernimmt sie und führt `PLAN.md`.
- Änderungen über Pull Requests nach `main`; veröffentlicht über GitHub Pages.
- Prüfen mit `tools/vergleich.js`: Während der Arbeit an einem Pull Request genügt es, die betroffenen Modelle zu prüfen (`--nur <modell>`); sobald gemeinsamer Code (`core/`, `sw.js`, `index.html`, `tools/`) geändert ist, werden alle Modelle geprüft. **Vor jedem Pull Request immer ein vollständiger Lauf gegen die Referenz von `main`** – ohne ihn kein Pull Request. Ausnahme: reine Doku-Änderungen – `node tools/kontext.js --doku-pr` endet mit 0 (nur `*.md` im Hauptordner, `docs/`, `.claude/`, `tools/kontext.js` geändert) und `node tools/version.js --pruefen` ebenso; dann entfällt der Vergleichslauf, im PR-Text die Ausgabe beider Befehle nennen. Abweichungen werden mit dem gemeldeten Bereich (umschließendes Rechteck der geänderten Pixel) eingeordnet: Liegt er im erwarteten Bereich, z. B. nur in der Werkzeugleiste? Vergleichsläufe und andere Browserprüfungen nie gleichzeitig laufen lassen. Nach einem Neustart der Umgebung die Referenz neu aufnehmen. Ein vollständiger Lauf dauert ca. 45–60 Minuten, Hintergrundbefehle enden nach 2 Stunden; beim Warten `pgrep -f "^node tools/(vergleich|nachweis)"`.
