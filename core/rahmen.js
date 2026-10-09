/* ==========================================================================
   Gemeinsamer Kern - Rahmen: Andockpunkte der Organ-Module
   Klassisches Skript (kein Modul). Beim Laden wird nur das Verzeichnis
   angelegt, nichts aufgebaut. Organ-Dateien melden sich mit Kern.organ an.
   Kern.ORGANE/Kern.organLaden laden Organ-Skript und -CSS bei Bedarf nach
   (script/link-Elemente, daher auch per file:// moeglich).
   Formbausteine (Kern.FORMEN, Kern.form, Kern.formLaden): die Form eines Organs
   als eigenes Skript, das Koerper und Detailmodell gemeinsam nutzen; sie meldet
   sich mit Kern.form an und wird ebenso nachgeladen.
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  /* Verzeichnis der Organ-Module (Name -> Definition) */
  K.Organe = {};

  /* Verzeichnis ladbarer Organe (Name -> Titel, Seitentitel, Skript, CSS, optional adresse und alt).
     Der Name ist der interne Schluessel (Kern.Organe, Klasse organ-<Name>, umg.von).
     adresse: Teil der Seitenadresse nach # (fehlt sie, gilt der Name). Gestufte Adressen wie
       'niere/nephron' legen die Ebene fest: der Teil vor dem letzten Schraegstrich ist die Adresse
       des uebergeordneten Organs (Kern.organEltern).
     alt: fruehere Adressen (Liste), die auf adresse umgeleitet werden (alte Links und Lesezeichen). */
  K.ORGANE = {
    herz: { titel: 'Herz', seitentitel: 'Herz \u2013 Herzh\u00f6hlen, Klappen und Windkessel', skript: 'organe/herz/herz.js', css: 'organe/herz/herz.css' },
    niere: { titel: 'Niere', seitentitel: 'Niere \u2013 Rinde, Mark und Nierenbecken', skript: 'organe/niere/niere.js', css: 'organe/niere/niere.css' },
    nephron: { titel: 'Nephron', seitentitel: 'Nephron \u2013 Nierenk\u00f6rperchen und Tubulussystem', skript: 'organe/niere/nephron.js', css: 'organe/niere/nephron.css', adresse: 'niere/nephron', alt: ['nephron'] },
    koerper: { titel: 'K\u00f6rper', seitentitel: 'K\u00f6rper \u2013 Organe und Organsysteme', skript: 'organe/koerper/koerper.js', css: 'organe/koerper/koerper.css' }
  };

  /* Adresse eines Organs (Teil nach #): adresse, sonst der Name */
  K.organAdresse = function (name) {
    var e = Object.prototype.hasOwnProperty.call(K.ORGANE, name) ? K.ORGANE[name] : null;
    return (e && e.adresse) || name;
  };

  /* Adresse -> { name, alt } oder null (unbekannt). Gesucht wird zuerst unter den
     Adressen der Organe (adresse oder Name), dann unter den frueheren (alt: true). */
  K.organZuAdresse = function (adr) {
    var namen = Object.keys(K.ORGANE), i;
    for (i = 0; i < namen.length; i++) if (K.organAdresse(namen[i]) === adr) return { name: namen[i], alt: false };
    for (i = 0; i < namen.length; i++) if ((K.ORGANE[namen[i]].alt || []).indexOf(adr) >= 0) return { name: namen[i], alt: true };
    return null;
  };

  /* Name des uebergeordneten Organs: das Organ, dessen Adresse der Adresse dieses Organs ohne den
     letzten Abschnitt entspricht ('niere/nephron' -> das Organ mit der Adresse 'niere'); sonst null */
  K.organEltern = function (name) {
    var adr = K.organAdresse(name), i = adr.lastIndexOf('/');
    if (i < 0) return null;
    var z = K.organZuAdresse(adr.slice(0, i));
    return z && !z.alt ? z.name : null;
  };

  /* Organ-Modul anmelden. def:
       renderer: { alpha }   Optionen fuer den Renderer des Rahmens
       aufbauen(umg)         baut das Organ auf (umg: bereich (Element #organ, nimmt das Markup der Bedienelemente auf), canvas, renderer, szene, kamera, envTex, von (Name des vorigen Organs beim Wechsel, sonst null)), gibt ein Promise oder nichts zurueck
       bild(now, frame)      Renderschleife (setzt aufbauen)
       groesse(w, h)         Fenstergroesse geaendert (setzt aufbauen)
       abbauen()             raeumt das Organ vollstaendig weg (setzt aufbauen): Sitzungen, Listener, Timer, three.js-Objekte, DOM; Rahmen-Objekte bleiben */
  K.organ = function (name, def) {
    K.Organe[name] = def;
    return def;
  };

  /* Verzeichnis der Formbausteine (Name -> Definition): die Form eines Organs (eine Form je Organ), die der
     Koerper und das Detailmodell des Organs gemeinsam nutzen */
  K.Formen = {};

  /* Verzeichnis ladbarer Formen (Name -> Titel, Skript). Hat ein Organ in Kern.ORGANE denselben Namen,
     laedt Kern.organLaden zuerst die Form und dann das Organ-Skript. */
  K.FORMEN = {
    niere: { titel: 'Niere', form: 'organe/niere/niere-form.js' },
    lunge: { titel: 'Lunge', form: 'organe/lunge/lunge-form.js' }
  };

  /* Formbaustein anmelden (die Form-Datei ruft das beim Laden auf; def: Funktionen und Daten der Form, je Organ eigen) */
  K.form = function (name, def) {
    K.Formen[name] = def;
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
  K.organStarten = function (name, opt) {
    if (aktiv) K.organBeenden();
    var o = K.Organe[name];
    var ro = o.renderer || {};
    if (R && R.alpha !== !!ro.alpha) rahmenErneuern();   /* Renderer-Optionen des Organs weichen ab */
    rahmenAnlegen(ro);
    R.von = (opt && opt.von) || null;
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

  /* Standbild: aktuelles Bild des Organs in ein 2D-Canvas kopieren (Atlas, weicher Wechsel).
     Rendern und Kopieren im selben Aufruf, weil der WebGL-Puffer sonst leer sein kann. */
  K.standbild = function (ziel) {
    if (!aktiv || !R) return false;
    try {
      R.renderer.render(R.szene, R.kamera);
      ziel.width = R.canvas.width;
      ziel.height = R.canvas.height;
      ziel.getContext('2d').drawImage(R.canvas, 0, 0);
      return true;
    } catch (e) { return false; }
  };

  /* Organ-Skript und -CSS nachladen (falls noch nicht geschehen). Gibt ein
     Promise zurueck, das mit der Organ-Definition (Kern.Organe[name]) erfuellt
     wird; unbekannter Name, Lade- oder Anmeldefehler lehnen es ab.
     opt.ohneCss: nur das Skript laden (z. B. um Bausteine eines anderen Organs zu nutzen).
     Hat das Organ eine Form (Kern.FORMEN), wird sie vor dem Organ-Skript geladen. */
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

  /* Skript per script-Element einfuegen (daher auch per file:// moeglich). Gibt ein Promise zurueck, das mit dem
     Ergebnis von angemeldet() erfuellt wird, sobald sich das Skript angemeldet hat; scheitert das Laden (das Element
     wird dann wieder entfernt) oder fehlt die Anmeldung, wird es abgelehnt. was: 'Das Organ' bzw. 'Die Form' (Fehlertext). */
  function skriptLaden(was, titel, url, angemeldet) {
    return new Promise(function (ok, fehl) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = function () {
        var d = angemeldet();
        if (d) ok(d);
        else fehl(new Error(was + ' "' + titel + '" hat sich nicht angemeldet (' + url + ').'));
      };
      s.onerror = function () {
        if (s.parentNode) s.parentNode.removeChild(s);
        fehl(new Error(was + ' "' + titel + '" konnte nicht geladen werden (' + url + ').'));
      };
      (document.body || document.head).appendChild(s);
    });
  }

  /* Formbaustein nachladen (falls noch nicht geschehen; das Skript wird je Sitzung nur einmal eingefuegt). Gibt ein
     Promise zurueck, das mit der Form (Kern.Formen[name]) erfuellt wird; unbekannter Name, Lade- oder
     Anmeldefehler lehnen es ab. */
  var formLadend = {};

  K.formLaden = function (name) {
    var e = Object.prototype.hasOwnProperty.call(K.FORMEN, name) ? K.FORMEN[name] : null;
    if (!e) return Promise.reject(new Error('Unbekannte Form: ' + name));
    if (K.Formen[name]) return Promise.resolve(K.Formen[name]);
    if (!formLadend[name]) {
      formLadend[name] = skriptLaden('Die Form', e.titel, e.form, function () { return K.Formen[name]; });
      var weg = function () { delete formLadend[name]; };
      formLadend[name].then(weg, weg);
    }
    return formLadend[name];
  };

  K.organLaden = function (name, opt) {
    var e = Object.prototype.hasOwnProperty.call(K.ORGANE, name) ? K.ORGANE[name] : null;
    if (!e) return Promise.reject(new Error('Unbekanntes Organ: ' + name));
    var css = opt && opt.ohneCss ? Promise.resolve() : cssLink(name, e);
    if (K.Organe[name]) return css.then(function () { return K.Organe[name]; });
    if (!ladend[name]) {
      var skript = function () { return skriptLaden('Das Organ', e.titel, e.skript, function () { return K.Organe[name]; }); };
      /* hat das Organ eine Form (Kern.FORMEN), wird zuerst sie geladen, dann das Organ-Skript */
      ladend[name] = Object.prototype.hasOwnProperty.call(K.FORMEN, name) ? K.formLaden(name).then(skript) : skript();
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
