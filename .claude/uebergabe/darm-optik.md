# Übergabe: Optik des Darms nach anatomischer Vorlage (Stand 12. November 2026)

Vorlage (Torso-Modell, von Jörn im Chat) nur als Anschauung, nichts daraus ins Repository (`LIZENZEN.md`). Texte freigegeben (`docs/freigaben/darm-b-texte.md`), bleiben unverändert. PR C (`pr-c.md`) wartet bis nach diesem Schritt.

## Entschieden und umgesetzt (Arbeitszweig)

- Schritt 1: Dünndarm blassrosa, Dickdarm mittleres Graurosa (#C08A7C u. a.), Haustren flacher und je Haustrum leicht verschieden tief, Tänien als klar begrenzte helle Streifen (ca. 1 cm, Vertexfarben aus `st.T` in der Formdatei; im Körper breitere Kante). Magen bytegleich.
- Schritt 2: Dünndarm als dichtes Knäuel, r 1,1, ca. 298 cm, Leerdarm-Anteil 0,45, aufgeschnittene Schlinge 44–55 cm; von vorn höchstens ca. 10 % über dem Dickdarm (Jörn); Gekröse und Gefäße von vorn verdeckt; Körper zieht mit. Berechnet mit `tools/duenndarm-knaeuel/` (`index.js` erklärt die Schritte; Startwert 11; erzeugt dieselbe Tabelle).

## Offen

- PR nach `main` ist offen (vollständiger Vergleichslauf: nur Darm, Zotte-Übergänge, Körper im Bauch/Becken und Atlas-Bilder mit dem Körper anders; Seitentext des Darms ohne Sigma, Gekröse, Darmvenen; Körper-USDZ anders). Nach dem Merge diese Übergabe löschen; dann PR C (`pr-c.md`).

## Wo im Code

- Form: `organe/verdauung/verdauung-form.js` ab „Darm: Zwoelffingerdarm bis After“: `DUENN_TAB`, `DUENN_R`, `DUENN_SCHNITT`, `dickZustand` (`st.R`, `st.T`), `dickdarm()` (`taenie`).
- Darstellung: `organe/verdauung/darm.js` Abschnitt 1 (Farben, `TAENIE`), 2 (Geometrie), `ankerBauen`, Sichtprüfung; Körper `organe/koerper/koerper.js` Abschnitt Dickdarm.
