# Übergabe: C2 Darm und Zotte (Stand 15. November 2026)

## Stand

- C1 Magen (#52) und „Aufnahme ins Blut“ (#54) gemergt. Offen in PR C nur noch **C2 Darm und Zotte**.
- Texte bisher: `docs/freigaben/darm-b-texte.md`, `darm-aufnahme-texte.md`, Vorbild Magen `magen-c1-texte.md`.
- Letzter voller Vergleichslauf: #54; PRs mit Auswahl seitdem 0 (`PLAN.md`).
- Später: bei der Leber prüfen, ob alle Medikamente die richtige Wirkung zeigen (`PLAN.md`).

## Mit Jörn entschieden (für C2)

- Daten Darm+Zotte gemeinsam `daten.darm` in `core/szenarien.js` mit `hinweis = { darm, zotte }`. 3D-Wirkung weich überblendet wie Leber/Magen. Export, AR wie Leber/Läppchen (Darm und Zotte haben noch kein Export/AR).
- Krankheitsbilder: Durchfall (Darm: Wasser in den Dünndarm, schneller, flüssig; Zotte: Wasser aus den Krypten hinaus); Verstopfung (Stuhl dunkel, dicht, langsam, Dickdarm gebläht, Haustren/Tänien gehen mit); Zöliakie (Zotte flach, Krypten tiefer; Leerdarm blasser, glatter); Divertikulitis (mehrere Ausstülpungen am Sigma, eine entzündet).
- Medikamente: Trinklösung (Zotte holt Wasser zurück, Durchfall bleibt), Loperamid (Wellen langsamer), Macrogol (Stuhl weich, Dickdarm schlanker), je bei ihrem Krankheitsbild.
- Lupe Analkanal: Chips Ruhe | Stuhldrang | Stuhlgang; am Ende der Verdauung läuft sie von selbst bis zur Entleerung (im 3D geht der Stuhl seit #54 am After hinaus, Phase P−18…P−4 in `lauf`).
- Lupe Zotte: Schema der Saumzelle, folgt den Stoff-Schaltern; Zöliakie, Durchfall, Trinklösung sichtbar.

## Aus #54 nutzbar

- `darm.js` Abschnitt 6: `lauf` mit Übertritt in Gefäße (`o.g`, `o.gf`), `DarmApp.uhr(t)`, `stroemung().imGefaess`; Durchsicht-Glas `DURCH_GEF`, `GEF_RF`/`GEF_OP`. Hilfekarte „Aufnahme“ hat schon das Merke Zöliakie.
- `tools/vergleich.js`: Darm-Bilder enden mit `info-lymphe` (desktop) und `schema-gefaesse` (handy); neue Bilder dahinter.

## Nächster Schritt

1. Jörn Fragen mit Optionen stellen (Empfehlung zuerst): Grundsätzliches (Aufteilung in mehrere PRs? z. B. Krankheitsbilder/Medikamente, dann Lupen, dann Export/AR), dann Einzelheiten und alle Texte wörtlich zur Freigabe nach `docs/freigaben/darm-c2-texte.md`.
2. Umsetzung durch den Executor. Vorbilder: Magen 7c–7f (`magen.js`), `core/szenarien.js` (`daten.leber`), Läppchen 6b, 8b–8d, Nephron-Lupe (Abschnitt 11), Export/AR-Haken `cfg.bake`, `cfg.klon`, `cfg.ohneMorph` in `core/export.js`.
