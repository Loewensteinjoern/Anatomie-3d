# Übergabe: PR „Aufnahme ins Blut“ (Darm) – Stand 13. November 2026

## Stand

- C1 Magen gemergt (PR #52).
- Reihenfolge laut `pr-c.md`: C1 → **Aufnahme ins Blut** → C2 Darm und Zotte. Entscheidungen für C2 stehen in `pr-c.md`, nicht hier.

## Wunsch von Jörn

- Im Darm (`#darm`) sollen die aufgenommenen Teilchen sichtbar ins Blut wandern: Kohlenhydrate, Eiweiß, Wasser über die Darmvenen in die Pfortader, Fett in die Lymphe. Wichtig für spätere Krankheitsbilder (Zöliakie: weniger Aufnahme, Durchfall).
- Analkanal: wohl auch Stuhl im 3D am After hinaus (passt zur Lupe Analkanal in C2: am Ende der Verdauung Entleerung von selbst) – hier mit Jörn klären.

## Was der Code heute macht (`organe/verdauung/darm.js`)

- Abschnitt 6 Strömung (ab Z. ~1375): Teilchen je Art als InstancedMesh, Weg = Messpunkte entlang der Mittellinie (`wegBauen`, `X`), nur aus `clock` und Index (kein Zufall). Aufnahme heute: Teilchen werden im Bereich `xa` kleiner und wandern zur Wand, dann verschwinden sie.
- Gefäße: Strukturen `arterien`, `venen`, `pfortader` aus `form.gefaesse` (`G.darmvenen`, `G.pfortader`, Abschnitt 2, Z. ~673). Ein Lymphgefäß gibt es im Darm **nicht** (nur im Text beim Gekröse); in der Zotte schon (`zotte.js`, Fett ins Lymphgefäß).
- Von vorn verdeckt das Dünndarm-Knäuel die Gefäße (Optik-PR #49).

## Offene Fragen an Jörn (erste Runde, Grundsätzliches)

1. Ansicht: eigener Ausschnitt „Aufnahme“ (Knäuel durchsichtig, Gefäße hervor) · Durchsicht automatisch, sobald Teilchen ins Blut gehen · Kamerafahrt von hinten/seitlich.
2. Weg der Teilchen: von der Wand über die nächste Darmvene bis zur Pfortader (und Leberrand) · nur bis in die Darmvenen.
3. Lymphe: neues Gefäß (Lymphgefäße im Gekröse bis zur Cisterna chyli / Milchbrustgang) · Fett nur symbolisch zur Wurzel des Gekröses.
4. Stuhl am After: hinaus, mit Schalter oder am Ende des Zyklus · nicht im 3D, nur in der Lupe (C2).
5. Gilt es auch fürs Schema „Wo wird was aufgenommen“ und für Üben (Weg „Blut zur Pfortader“)?

Dann Einzelheiten und Texte (neue Strukturen, Hilfekarte, Lesehilfe) wörtlich zur Freigabe.

## Prüfung

- Betroffen voraussichtlich `darm` (ggf. Form → auch Körper, Magen, Zotte über `verdauung-form.js`): `node tools/betroffen.js`. `pause`-Bilder müssen weiter gleich sein; neue Bilder am Ende von `darm:desktop`.
- Vorbilder: Teilchen in Gefäßen bei Leber/Läppchen (Abschnitt Strömung), Zotte (Fett ins Lymphgefäß), Magen 7c für weich überblendete Zusätze.
