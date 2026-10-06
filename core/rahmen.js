/* ==========================================================================
   Gemeinsamer Kern - Rahmen: Andockpunkte der Organ-Module
   Klassisches Skript (kein Modul). Beim Laden wird nur das Verzeichnis
   angelegt, nichts aufgebaut. Organ-Dateien melden sich mit Kern.organ an.
   Kern.ORGANE/Kern.organLaden laden Organ-Skript und -CSS bei Bedarf nach
   (script/link-Elemente, daher auch per file:// moeglich).
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  /* Verzeichnis der Organ-Module (Name -> Definition) */
  K.Organe = {};

  /* Verzeichnis ladbarer Organe (Name -> Titel, Seitentitel, Skript, CSS) */
  K.ORGANE = {
    herz: { titel: 'Herz', seitentitel: 'Herz \u2013 Herzh\u00f6hlen, Klappen und Windkessel', skript: 'organe/herz/herz.js', css: 'organe/herz/herz.css' },
    nephron: { titel: 'Nephron', seitentitel: 'Nephron \u2013 Nierenk\u00f6rperchen und Tubulussystem', skript: 'organe/niere/nephron.js', css: 'organe/niere/nephron.css' },
    koerper: { titel: 'K\u00f6rper', seitentitel: 'K\u00f6rper \u2013 Organe und Organsysteme', skript: 'organe/koerper/koerper.js', css: 'organe/koerper/koerper.css' }
  };

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

  function rahmenAnlegen(ro) {   /* auch oeffentlich: Kern.rahmenAnlegen (Atlas) */
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
    R = { bereich: document.getElementById('organ'), canvas: canvas, renderer: renderer, szene: szene, kamera: kamera, envTex: envTex, alpha: !!ro.alpha };
    K.Rahmen = { renderer: renderer, szene: szene, kamera: kamera };   /* Ablage fuer Pruefungen */
  }

  K.rahmenAnlegen = rahmenAnlegen;

  /* Rahmen freigeben und Canvas durch ein neues (gleiche Attribute, gleiche Stelle) ersetzen:
     ein WebGL-Kontext laesst sich auf demselben Canvas nicht mit anderen Optionen neu holen. */
  function rahmenErneuern() {
    var alt = R.canvas;
    R.renderer.setAnimationLoop(null);
    R.envTex.dispose();
    R.renderer.dispose();
    R.renderer.forceContextLoss();
    var neu = document.createElement('canvas');
    for (var i = 0; i < alt.attributes.length; i++) neu.setAttribute(alt.attributes[i].name, alt.attributes[i].value);
    alt.parentNode.replaceChild(neu, alt);
    R = null;
    K.Rahmen = null;
  }

  /* Organ im Rahmen starten; ein schon aktives Organ wird vorher beendet. */
  K.organStarten = function (name) {
    if (aktiv) K.organBeenden();
    var o = K.Organe[name];
    var ro = o.renderer || {};
    if (R && R.alpha !== !!ro.alpha) rahmenErneuern();   /* Renderer-Optionen des Organs weichen ab */
    rahmenAnlegen(ro);
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
    R.renderer.setClearColor(0x0b171c, 1);   /* letztes Bild vom Canvas nehmen (sonst Geisterbild hinter der Auswahl) */
    R.renderer.clear();
  };

  /* Organ-Skript und -CSS nachladen (falls noch nicht geschehen). Gibt ein
     Promise zurueck, das mit der Organ-Definition (Kern.Organe[name]) erfuellt
     wird; unbekannter Name, Lade- oder Anmeldefehler lehnen es ab. */
  var ladend = {};

  function cssLink(name, e) {
    var l = document.querySelector('link[data-organ="' + name + '"]');
    if (l) return l.sheet || l.getAttribute('data-geladen') ? Promise.resolve() : (l.__p || Promise.resolve());
    l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = e.css;
    l.setAttribute('data-organ', name);
    l.__p = new Promise(function (ok, fehl) {
      l.onload = function () { l.setAttribute('data-geladen', '1'); ok(); };
      l.onerror = function () { if (l.parentNode) l.parentNode.removeChild(l); fehl(new Error('Die Gestaltung des Organs "' + e.titel + '" konnte nicht geladen werden (' + e.css + ').')); };
    });
    document.head.appendChild(l);
    return l.__p;
  }

  K.organLaden = function (name) {
    var e = Object.prototype.hasOwnProperty.call(K.ORGANE, name) ? K.ORGANE[name] : null;
    if (!e) return Promise.reject(new Error('Unbekanntes Organ: ' + name));
    var css = cssLink(name, e);
    if (K.Organe[name]) return css.then(function () { return K.Organe[name]; });
    if (!ladend[name]) {
      ladend[name] = new Promise(function (ok, fehl) {
        var s = document.createElement('script');
        s.src = e.skript;
        s.onload = function () {
          if (K.Organe[name]) ok(K.Organe[name]);
          else fehl(new Error('Das Organ "' + e.titel + '" hat sich nicht angemeldet (' + e.skript + ').'));
        };
        s.onerror = function () {
          if (s.parentNode) s.parentNode.removeChild(s);
          fehl(new Error('Das Organ "' + e.titel + '" konnte nicht geladen werden (' + e.skript + ').'));
        };
        (document.body || document.head).appendChild(s);
      });
      var weg = function () { delete ladend[name]; };
      ladend[name].then(weg, weg);
    }
    return Promise.all([ladend[name], css]).then(function () { return K.Organe[name]; });
  };

  /* Organ-CSS wieder entfernen (nach organBeenden, beim Wechsel). */
  K.organCssEntfernen = function (name) {
    var l = document.querySelector('link[data-organ="' + name + '"]');
    if (l && l.parentNode) l.parentNode.removeChild(l);
  };
})(Kern);
