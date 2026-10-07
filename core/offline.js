/* ==========================================================================
   Gemeinsamer Kern - Offline: meldet den Service Worker (sw.js) an
   Klassisches Skript (kein Modul). Nur ueber http(s); per file:// geschieht
   nichts. Kern.Offline.anmeldung haelt das Promise der Registrierung (oder
   null) fuer Pruefungen und spaetere Erweiterungen.
   Neue Version: haelt der Service Worker eine neue Version bereit (wartet),
   zeigt #atlasUpdateBox einen Hinweis; Klick = aktivieren und neu
   laden, Kreuz = fuer diese Sitzung ausblenden. Ohne Klick uebernimmt die neue Version
   von selbst beim naechsten Start der App (Verhalten des Browsers).
   Beim Wiedersichtbarwerden der Seite wird hoechstens alle 10 Minuten nach
   einer neuen Version gesucht.
   ========================================================================== */
(function (K) {
  'use strict';

  var anmeldung = null;
  var registrierung = null;
  var neuLaden = false;
  var zu = false;  /* Kreuz gedrueckt: Hinweis bleibt fuer diese Sitzung aus */
  var letztePruefung = Date.now();
  var PAUSE = 10 * 60 * 1000;

  /* Hinweis nur, wenn schon eine alte Version laeuft (sonst Erstinstallation) */
  function zeigeHinweis() {
    var b = document.getElementById('atlasUpdateBox');
    if (b && !zu) b.hidden = false;
  }

  function beobachten(w) {
    if (!w) return;
    w.addEventListener('statechange', function () {
      if (w.state === 'installed' && navigator.serviceWorker.controller) zeigeHinweis();
    });
  }

  function melden() {
    anmeldung = navigator.serviceWorker.register('sw.js');
    anmeldung.catch(function (e) { console.warn('Offline-Speicher nicht verfügbar:', e); });
    K.Offline.anmeldung = anmeldung;
    anmeldung.then(function (reg) {
      registrierung = reg;
      if (reg.waiting && navigator.serviceWorker.controller) zeigeHinweis();
      reg.addEventListener('updatefound', function () { beobachten(reg.installing); });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') return;
        var jetzt = Date.now();
        if (jetzt - letztePruefung < PAUSE) return;
        letztePruefung = jetzt;
        try { reg.update().catch(function () {}); } catch (e) {}
      });
    }, function () {});
  }

  function knopf() {
    var b = document.getElementById('atlasUpdate');
    if (!b) return;
    b.addEventListener('click', function () {
      neuLaden = true;
      b.disabled = true;
      if (registrierung && registrierung.waiting) registrierung.waiting.postMessage('aktivieren');
      else location.reload();
    });
    var z = document.getElementById('atlasUpdateZu');
    if (z) z.addEventListener('click', function () {
      zu = true;
      document.getElementById('atlasUpdateBox').hidden = true;
    });
  }

  K.Offline = { anmeldung: null, zeigeHinweis: zeigeHinweis };

  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    knopf();
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!neuLaden) return;
      neuLaden = false;
      location.reload();
    });
    if (document.readyState === 'complete') melden();
    else window.addEventListener('load', melden);
  }
})(Kern);
