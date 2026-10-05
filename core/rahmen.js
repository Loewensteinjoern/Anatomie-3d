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
       groesse(w, h)         Fenstergroesse geaendert (setzt aufbauen)
       abbauen()             raeumt das Organ vollstaendig weg (setzt aufbauen): Sitzungen, Listener, Timer, three.js-Objekte, DOM; Rahmen-Objekte bleiben */
  K.organ = function (name, def) {
    K.Organe[name] = def;
    return def;
  };

  /* Rahmen (Renderer, Szene, Kamera, Umgebung/Licht) - einmalig angelegt und
     fuer alle Organe wiederverwendet; aktives Organ und Groessen-Listener */
  var R = null, aktiv = null, groesseFn = null;

  function rahmenAnlegen(ro) {
    if (R) return;
    var canvas = document.getElementById('cv');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: !!ro.alpha });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x0b171c, 1);
    var szene = new THREE.Scene();
    var kamera = new THREE.PerspectiveCamera(38, 1, 0.3, 300);
    var envTex = K.umgebung(renderer);
    K.licht(szene, envTex);
    R = { bereich: document.getElementById('organ'), canvas: canvas, renderer: renderer, szene: szene, kamera: kamera, envTex: envTex };
    K.Rahmen = { renderer: renderer, szene: szene, kamera: kamera };   /* Ablage fuer Pruefungen */
  }

  /* Organ im Rahmen starten; ein schon aktives Organ wird vorher beendet. */
  K.organStarten = function (name) {
    if (aktiv) K.organBeenden();
    var o = K.Organe[name];
    rahmenAnlegen(o.renderer || {});
    var fertig = o.aufbauen(R);
    groesseFn = function () {
      var w = window.innerWidth, h = window.innerHeight;
      R.renderer.setSize(w, h, false);
      R.kamera.aspect = w / h;
      o.groesse(w, h);
    };
    window.addEventListener('resize', groesseFn);
    groesseFn();
    R.renderer.setAnimationLoop(o.bild);
    aktiv = o;
    return fertig === undefined ? Promise.resolve() : fertig;
  };

  /* Aktives Organ beenden und vollstaendig wegraeumen. */
  K.organBeenden = function () {
    if (!aktiv) return;
    var o = aktiv;
    aktiv = null;
    R.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', groesseFn);
    groesseFn = null;
    try { if (o.abbauen) o.abbauen(); } catch (e) { console.error('Fehler beim Abbauen:', e); }
  };

  /* Start einer Einzelseite: Rahmen anlegen und das Organ starten. */
  K.einzelseite = function (name) {
    rahmenAnlegen(K.Organe[name].renderer || {});
    return K.organStarten(name);
  };
})(Kern);
