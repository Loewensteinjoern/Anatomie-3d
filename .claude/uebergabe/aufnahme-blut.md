# Übergabe: PR „Aufnahme ins Blut“ (Darm) – Stand 13. November 2026

C1 Magen gemergt (#52). Reihenfolge laut `pr-c.md`: C1 → **Aufnahme ins Blut** → C2. Texte freigegeben: `docs/freigaben/darm-aufnahme-texte.md` (A–E), wörtlich übernehmen.

## Code heute (`organe/verdauung/darm.js`)

- Abschnitt 6 Strömung (Z. ~1375): Teilchen je Art als InstancedMesh, Weg entlang der Mittellinie (`wegBauen`, `WGX`), nur aus `clock` und Index. Aufnahme in `lauf`: im Bereich `xaa` kleiner, zur Wand (`rho`→1), verschwinden. Stuhl löst sich am Zyklusende auf (`1 - sstep(P-5, P, ph)`).
- Gefäße aus `form.gefaesse` (Z. ~673); in `verdauung-form.js` `darmGefaesse()` (Z. ~1287): 11 Äste `darmvene-k` von der Schlinge über die Arkade zur oberen Mesenterialvene, Dickdarmvenen `*-vene`. Kein Lymphgefäß im Darm. Durchsicht: `GLAS` 0.22.

## Entschieden mit Jörn

- Ansicht: nichts Neues; Teilchen in den Gefäßen immer da, deutlich bei „Durchsicht“. Übersicht ohne Durchsicht und `pause`-Bilder bleiben gleich (außer neue Strukturen sichtbar? prüfen).
- Weg: Kohlenhydrate, Eiweiß, Wasser von der Wand in die nächste Darmvene (Dickdarm-Wasser in die Dickdarmvenen), verblassen dort, nicht bis zur Pfortader. Fett in die Lymphgefäße bis zur Wurzel, verblasst dort. Gleiche Farbe, kleiner, sanft verblassen; Stoffe-Schalter gelten.
- Neue Strukturen: Lymphgefäße des Darms (im Gekröse neben den Venen), Lendenzisterne, Anfang des Milchbrustgangs; keine Lymphknoten; ohne Teilchen in Zisterne/Milchbrustgang. Farbe hellgelb wie Zotte #F3E39A, kräftiger als Gekröse #E8D9A0.
- Gefäße bei Durchsicht gläsern (Venen, Pfortader, Lymph-Strukturen; Arterien nicht), Teilchen laufen innen (Jörn, nach Browserbild).
- Teilchen im Gefäß: Variante B „Perlen“ (Radius 1,35 × Gefäßradius, Glas 0,5; `GEF_RF`, `GEF_OP`), Jörn nach Bildern. Üben-Abschluss „Alle vier Wege geschafft.“ freigegeben.
- Stuhl: nur nach dem Essen, am Zyklusende am After hinaus, verblasst kurz darunter.
- Schema: Bahnen DARMVENEN/LYMPHE, Teilchen nur kurz hinein, dahinter Pfeile.
- Üben: vierter Weg „Weg des Fetts“ (Leerdarm/Krummdarm → Lymphgefäße → Lendenzisterne → Milchbrustgang); neue Strukturen beim Finden; Hilfekarte neu vor „So liest du das Modell“.

## Stand

E1–E4 fertig (Lymphe, Glas, Teilchen in Gefäße, Stuhl, `DarmApp.uhr`, Schema-Bahnen, vierter Weg, neue Vergleichsbilder am Ende von `darm:desktop` und `darm:handy`). Voller Vergleichslauf (gemeinsamer Code `tools/vergleich.js`): Abweichungen nur im Darm erwartet. Nächstes: PR nach `main`, danach C2 (`pr-c.md`). Nach dem Merge diese Datei löschen.
