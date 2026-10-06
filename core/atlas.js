/* ==========================================================================
   Gemeinsamer Kern - Atlas: Adresssteuerung der Rahmenseite index.html
   Klassisches Skript (kein Modul). Liest den Teil nach # der Adresse
   (#herz, #nephron, #koerper), laedt das Organ per Kern.organLaden nach,
   startet es im Rahmen und baut es beim Wechsel wieder ab. Leere Adresse
   und #koerper zeigen den Koerper (Startansicht); die Adresse wird dafuer
   nicht veraendert. Zurueck zum Koerper: location.hash = '' (neuer
   Verlaufseintrag, daher fuehrt auch der Zurueck-Knopf des Browsers sauber
   zum vorigen Organ).
   ========================================================================== */
(function (K) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var zaehler = 0;      /* wird bei jeder Adresse erhoeht; veraltete Laeufe brechen ab */
  var aktuell = null;   /* Name des Organs, dessen Skript/CSS zuletzt angefordert wurde */

  function beenden() {
    K.organBeenden();
    if (aktuell) K.organCssEntfernen(aktuell);
    aktuell = null;
    $('organ').className = '';
  }

  function zeige(el, an) { if (an) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); }

  function fehler(e, nr) {
    if (nr !== zaehler) return;
    console.error(e);
    beenden();
    $('boot').classList.add('gone');
    $('atlasFehlerText').textContent = (e && e.message) || String(e);
    zeige($('atlasZurueck'), false);
    zeige($('atlasFehler'), true);
    document.title = 'Anatomie-Atlas';
  }

  function route() {
    var name = decodeURIComponent(location.hash.replace(/^#/, '')) || 'koerper';
    if (name === aktuell && $('atlasFehler').hasAttribute('hidden')) return;   /* gleiche Ansicht (z. B. '' und #koerper) */
    var nr = ++zaehler;
    beenden();
    zeige($('atlasFehler'), false);
    zeige($('atlasZurueck'), false);
    var e = Object.prototype.hasOwnProperty.call(K.ORGANE, name) ? K.ORGANE[name] : null;
    if (!e) { fehler(new Error('Unbekanntes Organ: ' + name), nr); return; }
    $('boot').querySelector('span').textContent = e.titel + ' wird aufgebaut';
    $('bootBar').style.width = '0';
    $('bootSt').textContent = '';
    $('boot').classList.remove('gone');
    aktuell = name;
    K.organLaden(name).then(function () {
      if (nr !== zaehler) return;
      $('organ').className = 'organ-' + name;
      document.title = e.seitentitel;
      zeige($('atlasZurueck'), name !== 'koerper');   /* im Koerper selbst gibt es kein Zurueck */
      return K.organStarten(name);
    }).then(function () {
      if (nr !== zaehler) return;
      $('boot').classList.add('gone');
    }).catch(function (err) { fehler(err, nr); });
  }

  function zumKoerper() {
    if (location.hash.replace(/^#/, '') === '') route();   /* Adresse ist schon leer: kein hashchange, Neuversuch */
    else location.hash = '';
  }

  $('atlasZurueck').addEventListener('click', zumKoerper);
  $('atlasFehlerZurueck').addEventListener('click', zumKoerper);
  window.addEventListener('hashchange', route);
  K.Atlas = { route: route };
  route();
})(Kern);
