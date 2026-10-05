/* ==========================================================================
   Gemeinsamer Kern - Atlas: Adresssteuerung der Rahmenseite atlas.html
   Klassisches Skript (kein Modul). Liest den Teil nach # der Adresse
   (#herz, #nephron), laedt das Organ per Kern.organLaden nach, startet es
   im Rahmen und baut es beim Wechsel oder bei leerer Adresse wieder ab.
   Zurueck zur Auswahl: location.hash = '' (neuer Verlaufseintrag, daher
   fuehrt auch der Zurueck-Knopf des Browsers sauber zum vorigen Organ).
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
    zeige($('atlasStart'), false);
    zeige($('atlasZurueck'), false);
    zeige($('atlasFehler'), true);
    document.title = 'Anatomie-Atlas';
  }

  function route() {
    var nr = ++zaehler;
    var name = decodeURIComponent(location.hash.replace(/^#/, ''));
    beenden();
    if (!name) {
      $('boot').classList.add('gone');
      zeige($('atlasFehler'), false);
      zeige($('atlasZurueck'), false);
      zeige($('atlasStart'), true);
      document.title = 'Anatomie-Atlas';
      return;
    }
    zeige($('atlasStart'), false);
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
      K.rahmenAnlegen({ alpha: true });
      $('organ').className = 'organ-' + name;
      document.title = e.seitentitel;
      zeige($('atlasZurueck'), true);
      return K.organStarten(name);
    }).then(function () {
      if (nr !== zaehler) return;
      $('boot').classList.add('gone');
    }).catch(function (err) { fehler(err, nr); });
  }

  function zurAuswahl() { location.hash = ''; }

  $('atlasZurueck').addEventListener('click', zurAuswahl);
  $('atlasFehlerZurueck').addEventListener('click', zurAuswahl);
  window.addEventListener('hashchange', route);
  K.Atlas = { route: route };
  route();
})(Kern);
