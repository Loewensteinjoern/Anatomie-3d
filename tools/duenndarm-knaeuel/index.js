/* =====================================================================
   Duenndarm als dichtes Knaeuel: berechnet die Tabelle DUENN_TAB in
   organe/verdauung/verdauung-form.js (Mittellinie von der Flexur bis zur
   Bauhin-Klappe, Radius DUENN_R). Wird von der App nie geladen.

   Aufruf aus einem leeren Arbeitsordner (dort entstehen die Zwischendateien):
     node <repo>/tools/duenndarm-knaeuel/index.js            alle Schritte mit den Einstellungen unten
     node <repo>/tools/duenndarm-knaeuel/index.js --ab weg   ab einem Schritt (hole, lagen, weg, relax)
   Danach: node schnitt.js <datei> nennt freie, flache Strecken im Leerdarm fuer DUENN_SCHNITT,
   node einbauen.js tab-<seed>.json <s0> <s1> schreibt Tabelle und Schnitt in die Formdatei,
   node pruefe.js prueft die Formdatei (Abstaende der Schlingen, zu den Nachbarn, Ueberdeckung des Dickdarms).

   Schritte:
   1. hole.js    Dreiecke aller Koerper-Meshes im Bauchraum (ohne den Duenndarm) aus der laufenden App -> nachbarn.json
                 (Playwright; vor dem Neuberechnen ausfuehren, wenn sich Nachbarorgane geaendert haben)
   2. lagen.js   Gitter (Abstand H) in Lagen hinter der Bauchwand: die vordere Lage endet an der Haut, jede weitere 2 R + GAP + 0,05 cm dahinter;
                 Zellen nur, wo Nachbarn, Zwoelffingerdarm, Darmgefaesse und Dickdarm Platz lassen (Spielraum TOL) und der Rahmen des Dickdarms
                 von vorn hoechstens UEBER cm ueberdeckt wird -> lagen-gitter.json
   3. weg.js     Weg durch das Gitter (Backbite, fester Anfang an der Flexur, Zufallszahlen mit festem Startwert seed): zuerst der Leerdarm
                 links oben, dann der Krummdarm bis zur Bauhin-Klappe; Luecken mit Umwegen gefuellt -> weg-<seed>.json
   4. relax.js   Entspannung: Glaetten, Abstossung der Schlingen, Anziehung (ZUG, verdichtet), Druck zum Rahmen (DRUCK), Abstand zu den
                 Nachbarn (GAP); Anschluss am Zwoelffingerdarm (3,5 cm) und am Blinddarm (5 cm) -> tab-<seed>.json (Punkte ca. 1 cm)
   Der Startwert wird so gewaehlt, dass der Leerdarm vorn eine gerade Strecke von 5 Zellen hat (weg.js meldet „Gerade vorn im Leerdarm“).
   ===================================================================== */
const { execFileSync } = require('child_process'), path = require('path');
const EINST = { SEED: '11', R: '1.1', H: '2.35', LAGEN: '4', TOL: '0.5', X0: '-11', X1: '11.6', YMAX: '98', UEBER: '0.36', AB: '0.95', GAP_LAGEN: '0.12', GAP: '0.24', ZUG: '0.006', DRUCK: '0.06', IT: '2000' };
const ab = process.argv.indexOf('--ab') > 0 ? process.argv[process.argv.indexOf('--ab') + 1] : 'hole';
const SCHRITTE = ['hole', 'lagen', 'weg', 'relax'];
const lauf = (datei, args, env) => { console.log('>', datei, args.join(' ')); execFileSync('node', [path.join(__dirname, datei)].concat(args), { stdio: 'inherit', env: Object.assign({}, process.env, EINST, env || {}) }); };
for (const s of SCHRITTE.slice(SCHRITTE.indexOf(ab))) {
  if (s === 'hole') lauf('hole.js', []);
  if (s === 'lagen') lauf('lagen.js', ['1'], { GAP: EINST.GAP_LAGEN });
  if (s === 'weg') lauf('weg.js', [EINST.SEED], { GAP: EINST.GAP_LAGEN });
  if (s === 'relax') lauf('relax.js', [EINST.SEED]);
}
