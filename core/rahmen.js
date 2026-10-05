/* ==========================================================================
   Gemeinsamer Kern - Rahmen: Andockpunkte der Organ-Module
   Klassisches Skript (kein Modul). Beim Laden wird nur das Verzeichnis
   angelegt, nichts aufgebaut. Organ-Dateien melden sich mit Kern.organ an.
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  /* Verzeichnis der Organ-Module (Name -> Definition) */
  K.Organe = {};

  /* Organ-Modul anmelden; def hat (vorerst) aufbauen(umg) */
  K.organ = function (name, def) {
    K.Organe[name] = def;
    return def;
  };

  /* Start einer Einzelseite. In spaeteren Schritten uebernimmt der Rahmen
     hier Renderer, Szene, Kamera, Licht und Renderschleife. */
  K.einzelseite = function (name) {
    return K.Organe[name].aufbauen({ bereich: document.body });
  };
})(Kern);
