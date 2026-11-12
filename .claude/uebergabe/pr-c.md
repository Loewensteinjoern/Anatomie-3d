# Übergabe: Magen, Darm und Zotte – PR C (Stand 12. November 2026)

## Stand

- PR A (#45), PR B (#46) und die Optik des Darms (#49) sind gemergt; `darm-optik.md` mit C1 löschen.
- Freigegebene Texte: `docs/freigaben/magen-a-texte.md`, `docs/freigaben/darm-b-texte.md`.
- Später: bei der Leber prüfen, ob alle Medikamente die richtige Wirkung zeigen (`PLAN.md`, Offene Punkte).

## Mit Jörn entschieden (12. November 2026, Runden 1 und 2)

- Zwei PRs: **C1 Magen**, **C2 Darm und Zotte**. Die Texte für beide jetzt abstimmen.
- Listen: Magen eigen (`Kern.Szenarien.daten.magen`); Darm und Zotte gemeinsam (`Kern.Szenarien.daten.darm`, `hinweis = { darm, zotte }`), wie Leber und Läppchen.
- Wirkung in 3D wie bei der Leber: jeder Eintrag zeigt in mindestens einem Modell eine sichtbare Wirkung, weich überblendet; wo ein Modell nichts zeigt, steht das im Hinweis.
- Magen (3 + 3): Gastritis (Schleimhaut gerötet und geschwollen); Magengeschwür (Krater an der kleinen Kurvatur, Blutung als Komplikation im Text); Refluxkrankheit (Mageneingang schließt nicht, Magensaft steigt in die Speiseröhre). Medikamente: Pantoprazol (weniger Magensaft); NSAR als Auslöser (Ibuprofen/Diclofenac, Schleimschutz fällt weg, wie Paracetamol bei der Leber); Metoclopramid (schnellere Wellen, raschere Entleerung).
- Darm und Zotte (4 + 3): infektiöser Durchfall (z. B. Noroviren; Darm flüssig und schnell, Zotte: Wasser strömt hinaus); Verstopfung (auch durch Opioide; Stuhl staut sich im Dickdarm); Zöliakie (Zotten flach, Leerdarm glatter); Divertikulitis (Sigma). Medikamente: Trinklösung mit Zucker und Salz (Zotte: Wasser zurück ins Blut); Loperamid (Darmbewegung gebremst); Macrogol (Stuhl weicher).
- Lupen: Magen – Magendrüse im Schnitt (Neben-, Beleg-, Hauptzellen, Schleimschicht); Darm – Analkanal im Längsschnitt (innerer und äußerer Schließmuskel, Gefäßpolster); Zotte – Saumzelle mit Bürstensaum und Transportern (Natrium-Zucker gemeinsam, Aminosäuren, Fett über Fetttröpfchen ins Lymphgefäß).
- Export (GLB, STL) und AR wie bei Leber und Läppchen (7e/7f, 8c/8d).

## Nächster Schritt

- Runde 3 (vor C1): Einzelheiten der 3D-Wirkung im Magen, dann alle Texte für Magen und Darm/Zotte wörtlich zur Freigabe vorlegen → `docs/freigaben/magen-darm-c-texte.md`.
- Vorbilder: `core/szenarien.js` (`daten.leber`), Leber 7c–7f, Läppchen 6b, 8b–8d.
