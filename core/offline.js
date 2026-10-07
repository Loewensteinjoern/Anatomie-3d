/* ==========================================================================
   Gemeinsamer Kern - Offline: meldet den Service Worker (sw.js) an
   Klassisches Skript (kein Modul). Nur ueber http(s); per file:// geschieht
   nichts. Kern.Offline.anmeldung haelt das Promise der Registrierung (oder
   null) fuer Pruefungen und spaetere Erweiterungen.
   ========================================================================== */
(function (K) {
  'use strict';

  var anmeldung = null;

  function melden() {
    anmeldung = navigator.serviceWorker.register('sw.js');
    anmeldung.catch(function (e) { console.warn('Offline-Speicher nicht verfügbar:', e); });
    K.Offline.anmeldung = anmeldung;
  }

  K.Offline = { anmeldung: null };

  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    if (document.readyState === 'complete') melden();
    else window.addEventListener('load', melden);
  }
})(Kern);
