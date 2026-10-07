/* ==========================================================================
   Gemeinsamer Kern - Atlas: Adresssteuerung der Rahmenseite index.html
   Klassisches Skript (kein Modul). Liest den Teil nach # der Adresse
   (#herz, #niere/nephron, #koerper; die Adressen der Organe stehen in
   Kern.ORGANE), laedt das Organ per Kern.organLaden nach, startet es im
   Rahmen und baut es beim Wechsel wieder ab. Leere Adresse und #koerper
   zeigen den Koerper (Startansicht); die Adresse wird dafuer nicht
   veraendert. Eine alte Adresse (#nephron) wird sofort per location.replace
   auf die aktuelle umgeleitet (kein neuer Verlaufseintrag). Der
   Zurueck-Knopf geht eine Ebene hoch (uebergeordnetes Organ laut Adresse,
   sonst Koerper): location.hash = Adresse bzw. '' fuer den Koerper (neuer
   Verlaufseintrag, daher fuehrt auch der Zurueck-Knopf des Browsers sauber
   zum vorigen Organ). Beim Wechsel zwischen Organen bleibt das letzte Bild des
   alten Organs als Standbild (#uebergang) stehen, bis das neue aufgebaut ist,
   und wird dann weich ausgeblendet.
   ========================================================================== */
(function (K) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var zaehler = 0;      /* wird bei jeder Adresse erhoeht; veraltete Laeufe brechen ab */
  var aktuell = null;   /* Name des Organs, dessen Skript/CSS zuletzt angefordert wurde */

  var ausblendung = 0;  /* Handle der laufenden Ausblendung des Standbilds (requestAnimationFrame) */

  function standbildWeg() {   /* Standbild sofort verstecken, Ausblendung abbrechen */
    var u = $('uebergang');
    if (ausblendung) { cancelAnimationFrame(ausblendung); ausblendung = 0; }
    u.setAttribute('hidden', '');
    u.style.opacity = '';
    u.style.pointerEvents = '';
    u.width = 0; u.height = 0;
  }

  function ausblenden() {   /* ~400 ms per rAF/performance.now (keine CSS-Transition) */
    var u = $('uebergang');
    if (u.hasAttribute('hidden')) return;
    if (ausblendung) cancelAnimationFrame(ausblendung);
    var t0 = performance.now();
    u.style.pointerEvents = 'none';
    function schritt() {
      var s = Math.min(1, (performance.now() - t0) / 400);
      if (s >= 1) { ausblendung = 0; standbildWeg(); return; }
      u.style.opacity = String(1 - s * s * (3 - 2 * s));
      ausblendung = requestAnimationFrame(schritt);
    }
    ausblendung = requestAnimationFrame(schritt);
  }

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
    standbildWeg();
    $('boot').classList.remove('leise');
    $('boot').classList.add('gone');
    $('atlasFehlerText').textContent = (e && e.message) || String(e);
    zeige($('atlasZurueck'), false);
    zeige($('atlasFehler'), true);
    document.title = 'Anatomie-Atlas';
  }

  function route() {
    var adresse = decodeURIComponent(location.hash.replace(/^#/, '')) || K.organAdresse('koerper');
    var z = K.organZuAdresse(adresse);
    /* alte Adresse: vor allem anderen (kein Zaehler, kein Standbild, kein Abbau) auf die aktuelle umleiten, ohne neuen Verlaufseintrag; das hashchange danach ruft route erneut auf */
    if (z && z.alt) { location.replace('#' + K.organAdresse(z.name)); return; }
    var name = z && z.name;   /* Name des Organs, null bei unbekannter Adresse */
    if (name && name === aktuell && $('atlasFehler').hasAttribute('hidden')) return;   /* gleiche Ansicht (z. B. '' und #koerper) */
    var nr = ++zaehler;
    var u = $('uebergang');
    var standbild = !u.hasAttribute('hidden');   /* schneller Wechsel im Aufbau: Standbild steht schon */
    if (!standbild && K.standbild(u)) { standbild = true; u.removeAttribute('hidden'); }
    if (standbild) {
      if (ausblendung) { cancelAnimationFrame(ausblendung); ausblendung = 0; }
      u.style.opacity = '1';
      u.style.pointerEvents = '';
    }
    var vorher = $('atlasFehler').hasAttribute('hidden') ? aktuell : null;   /* vorheriges Organ (nicht nach Fehler) */
    beenden();
    zeige($('atlasFehler'), false);
    zeige($('atlasZurueck'), false);
    var e = name ? K.ORGANE[name] : null;
    if (!e) { fehler(new Error('Unbekanntes Organ: ' + adresse), nr); return; }
    $('boot').querySelector('span').textContent = e.titel + ' wird aufgebaut';
    $('bootBar').style.width = '0';
    $('bootSt').textContent = '';
    $('boot').classList.toggle('leise', standbild);
    $('boot').classList.remove('gone');
    aktuell = name;
    K.organLaden(name).then(function () {
      if (nr !== zaehler) return;
      $('organ').className = 'organ-' + name;
      document.title = e.seitentitel;
      $('atlasZurueck').textContent = '\u2190 ' + K.ORGANE[zurueckZiel(name)].titel;   /* Beschriftung nach dem Ziel (eine Ebene hoch) */
      zeige($('atlasZurueck'), name !== 'koerper');   /* im Koerper selbst gibt es kein Zurueck */
      return K.organStarten(name, { von: vorher });
    }).then(function () {
      if (nr !== zaehler) return;
      $('boot').classList.add('gone');
      ausblenden();
    }).catch(function (err) { fehler(err, nr); });
  }

  function zumKoerper() {
    if (location.hash.replace(/^#/, '') === '') route();   /* Adresse ist schon leer: kein hashchange, Neuversuch */
    else location.hash = '';
  }

  function zurueckZiel(name) {   /* Ziel des Zurueck-Knopfs: uebergeordnetes Organ (Adresse eine Ebene hoeher), sonst der Koerper */
    return K.organEltern(name) || 'koerper';
  }

  function zurueck() {   /* eine Ebene hoch */
    var ziel = aktuell ? zurueckZiel(aktuell) : 'koerper';
    if (ziel === 'koerper') zumKoerper();
    else location.hash = K.organAdresse(ziel);   /* neuer Verlaufseintrag, wie zumKoerper */
  }

  $('atlasZurueck').addEventListener('click', zurueck);
  $('atlasFehlerZurueck').addEventListener('click', zumKoerper);
  window.addEventListener('hashchange', route);
  K.Atlas = { route: route };
  route();
})(Kern);
