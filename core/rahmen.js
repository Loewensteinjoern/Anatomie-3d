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

  /* Organ-Modul anmelden. def:
       renderer: { alpha }   Optionen fuer den Renderer des Rahmens
       aufbauen(umg)         baut das Organ auf (umg: bereich (Element #organ, nimmt das Markup der Bedienelemente auf), canvas, renderer, szene, kamera, envTex), gibt ein Promise oder nichts zurueck
       bild(now, frame)      Renderschleife (setzt aufbauen)
       groesse(w, h)         Fenstergroesse geaendert (setzt aufbauen) */
  K.organ = function (name, def) {
    K.Organe[name] = def;
    return def;
  };

  /* Start einer Einzelseite: Renderer, Szene, Kamera, Umgebung/Licht,
     Groessenanpassung und Renderschleife gehoeren dem Rahmen. */
  K.einzelseite = function (name) {
    var o = K.Organe[name], ro = o.renderer || {};
    var canvas = document.getElementById('cv');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: !!ro.alpha });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x0b171c, 1);
    var szene = new THREE.Scene();
    var kamera = new THREE.PerspectiveCamera(38, 1, 0.3, 300);
    var envTex = K.umgebung(renderer);
    K.licht(szene, envTex);
    var fertig = o.aufbauen({ bereich: document.getElementById('organ'), canvas: canvas, renderer: renderer, szene: szene, kamera: kamera, envTex: envTex });
    function groesse() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      o.groesse(w, h);
    }
    window.addEventListener('resize', groesse);
    groesse();
    renderer.setAnimationLoop(o.bild);
    return fertig;
  };
})(Kern);
