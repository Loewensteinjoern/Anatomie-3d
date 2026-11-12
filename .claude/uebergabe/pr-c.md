# Übergabe: Magen, Darm und Zotte – PR C (Stand 12. November 2026)

## Stand

- PR A (#45), B (#46), Optik des Darms (#49) gemergt. Texte: `docs/freigaben/magen-a-texte.md`, `darm-b-texte.md`.
- Später: bei der Leber prüfen, ob alle Medikamente die richtige Wirkung zeigen (`PLAN.md`).

## Mit Jörn entschieden (Runden 1–3)

- Reihenfolge: **C1 Magen** → **Aufnahme ins Blut** (Darm: Teilchen wandern sichtbar in Darmvenen/Pfortader, Fett in Lymphe; Gefäße von vorn vom Knäuel verdeckt – Ansicht klären) → **C2 Darm und Zotte**.
- Daten: Magen in `magen.js` (Inhalte, `SZ_DATEN`; nur ein Modell, kein gemeinsamer Code); Darm+Zotte gemeinsam `daten.darm` mit `hinweis = { darm, zotte }`. 3D-Wirkung wie Leber (weich überblendet). Export, AR wie Leber/Läppchen.
- Magen: Gastritis (röter, Falten dicker, Erosionen am Vorhof); Geschwür am Magenwinkel (Krater, heller Grund, roter Rand; Blutung nur im Text); Reflux (Eingangswulst schlaff, Magensaft steigt, Speiseröhrenende rot). Pantoprazol bei Geschwür (weniger Magensaft, Krater kleiner); NSAR als Auslöser (Erosionen, leicht rot, Lupe: dünner Schleim); MCP (stellt auf „nach dem Essen“, Wellen schneller, Pförtner öfter offen, Eingang fester).
- Magen-Lupe: Drüsenschnitt (Neben-, Beleg-, Hauptzellen, Schleim), Chips nüchtern/nach dem Essen, Krankheiten sichtbar (Helicobacter, Defekt, dünner Schleim); **Antippen der Belegzelle** zoomt ins Schema wie Nephron-Lupe (Protonenpumpe; Pantoprazol sperrt sie), mit Hinweis.
- Darm/Zotte: Durchfall (Darm: Wasser in den Dünndarm, schneller, flüssig; Zotte: Wasser aus den Krypten hinaus); Verstopfung (Stuhl dunkel, dicht, langsam, **Dickdarm gebläht**, Haustren/Tänien gehen mit); Zöliakie (Zotte flach, Krypten tiefer; Leerdarm blasser, glatter); Divertikulitis (mehrere Ausstülpungen am Sigma, eine entzündet). Trinklösung (Zotte holt Wasser zurück, Durchfall bleibt), Loperamid (Wellen langsamer), Macrogol (Stuhl weich, Dickdarm schlanker), je bei ihrem Krankheitsbild.
- Lupe Analkanal: Chips Ruhe | Stuhldrang | Stuhlgang; am Ende der Verdauung läuft sie von selbst bis zur Entleerung (Jörn; wohl auch Stuhl im 3D am After hinaus – im PR „Aufnahme“ prüfen).
- Lupe Zotte: Schema der Saumzelle, folgt den Stoff-Schaltern; Zöliakie, Durchfall, Trinklösung sichtbar.

## Nächster Schritt

- Texte C1 freigegeben (`docs/freigaben/magen-c1-texte.md`); Umsetzung C1 in drei Executor-Schritten: 1 Szenarien + 3D (läuft), 2 Lupe, 3 Export/AR. Texte C2 vor C2.
- Vorbilder: `core/szenarien.js` (`daten.leber`), Leber 7c–7f, Läppchen 6b, 8b–8d, Nephron-Lupe (Abschnitt 11).
