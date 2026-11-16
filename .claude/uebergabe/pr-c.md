# Übergabe: C2b Darm und Zotte (Stand 16. November 2026)

## Stand

- C2a (Krankheitsbilder und Medikamente für Darm und Zotte) als PR nach `main` offen bzw. gemergt; voller Vergleichslauf in C2a, PRs mit Auswahl seitdem 0.
- Texte C2a: `docs/freigaben/darm-c2-texte.md` (6 Krankheitsbilder, 5 Medikamente). Daten `daten.darm` in `core/szenarien.js` mit `hinweis = { darm, zotte }`, `modell`-Wirkgrößen (durchfall, verstopfung, zoeliakie, divertikel, crohn, colitis, bremse, weich, daempf; Zotte zusätzlich `trink`).
- Wahl bleibt beim Zoomen Darm ↔ Zotte erhalten (`Kern.Szenarien.wahl.darm`, gesetzt in `beimWechsel`, übernommen bei `umg.von`). Leber/Läppchen machen das nicht.
- Darm: Abschnitt 7c (`krankBauen`, Shader an Haut und Schleimhaut). Bei Wahl eines Krankheitsbilds schaltet sich die Durchsicht ein (außer Divertikulitis). Das hat der Executor ergänzt; Jörn hat es nicht ausdrücklich bestätigt.
- Zotte: Abschnitt 6b (`krankLage`, `krankAnwenden`, `krankTeilchen`), Zöliakie-Abflachung über `pumpe()`/`flachA`, Beschriftungsanker verformt (Ruhelage in `VIS`).
- Offen an Jörn angeboten: Fistel bei Crohn deutlicher (länger oder anders gelegt).

## C2b (mit Jörn abgestimmt, Texte noch nicht entworfen)

- Lupe Analkanal: Chips Ruhe | Stuhldrang | Stuhlgang; läuft am Ende der Verdauung von selbst bis zur Entleerung (Stuhl am After seit #54, Phase P−18…P−4 in `lauf`).
- Lupe Zotte: Schema der Saumzelle, folgt den Stoff-Schaltern; zeigt Zöliakie, Durchfall, Trinklösung.
- Export und AR für Darm und Zotte wie Leber/Läppchen (`cfg.bake`, `cfg.klon`, `cfg.ohneMorph` in `core/export.js`); Exporte mit Krankheitsbild prüfen.

## Nächster Schritt

1. Jörn Fragen mit Optionen stellen (Empfehlung zuerst), dann alle Texte der Lupen wörtlich zur Freigabe nach `docs/freigaben/darm-c2b-texte.md`.
2. Umsetzung durch den Executor. Vorbilder: Magen-Lupe (Drüse, Belegzelle, `magen.js`), Läppchen 8b–8d, Nephron-Lupe (Abschnitt 11), Niere 5c.
3. `tools/vergleich.js`: neue Bilder hinter `sz-aus` (Darm/Zotte desktop), Exporte wie bei Leber.
