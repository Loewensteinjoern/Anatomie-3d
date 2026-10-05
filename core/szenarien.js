/* ==========================================================================
   Gemeinsamer Kern - Krankheitsbilder und Medikamente (Reiter + Erklaerkarte)
   Klassisches Skript (kein Modul). Beim Laden werden nur Funktionen definiert.
   Kern.Szenarien(cfg) liefert den Zustand:
     aktiv (ID oder null), offen (Karte aufgeklappt), anteil (ID -> 0..1),
     setzen(id), liste(pane, kind, ueberschrift, einleitung), schritt(dt),
     direkt(id), zuklappen(), abbauen() (entfernt die Karte aus dem body).
   cfg: daten (Array: id, kind, name, short, kicker, lead, values, steps,
        after, note), karte (ID des Karten-Elements), dauer (Ueberblendzeit
        in s), anteil (optional: vorhandenes Objekt), beimWechsel(id),
        beimEinklappen(), ausTitel (Titel des Ausschalt-Knopfs).
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  K.Szenarien = function (cfg) {
    var daten = cfg.daten;
    var anteil = cfg.anteil || {};
    daten.forEach(function (s) { if (!(s.id in anteil)) anteil[s.id] = 0; });
    var dauer = cfg.dauer || 1.2;
    var ausTitel = cfg.ausTitel || 'Krankheitsbild ausschalten';
    var zeilen = {};
    var Z = { aktiv: null, offen: true, anteil: anteil, el: null };

    function karteBauen() {
      Z.el = document.createElement('div');
      Z.el.className = 'panel szkarte'; Z.el.id = cfg.karte;
      document.body.appendChild(Z.el);
    }
    function karteFuellen(sc) {
      var el = Z.el;
      var h = '<button class="gh hbtn" id="bCardMin" title="Einklappen" style="right:44px">–</button>' +
              '<button class="gh hbtn" id="bCardOff" title="' + ausTitel + '" style="right:8px">×</button>' +
              '<div class="kick"></div><h3></h3><div class="body"><p class="lead"></p><dl class="vals"></dl><ol></ol><div class="after"></div><p class="note"></p></div>';
      el.innerHTML = h;
      el.querySelector('.kick').textContent = sc.kicker;
      el.querySelector('h3').textContent = sc.name;
      el.querySelector('.lead').textContent = sc.lead;
      var dl = el.querySelector('.vals'), ol = el.querySelector('ol'), af = el.querySelector('.after');
      sc.values.forEach(function (v) {
        var dt = document.createElement('dt'); dt.textContent = v[0];
        var dd = document.createElement('dd'); dd.textContent = v[1];
        dl.appendChild(dt); dl.appendChild(dd);
      });
      sc.steps.forEach(function (s) {
        var li = document.createElement('li'), b = document.createElement('b');
        b.textContent = s[0] + ' '; li.appendChild(b); li.appendChild(document.createTextNode(s[1])); ol.appendChild(li);
      });
      sc.after.forEach(function (a) {
        var h5 = document.createElement('h5'); h5.textContent = a[0];
        var p = document.createElement('p'); p.textContent = a[1];
        af.appendChild(h5); af.appendChild(p);
      });
      el.querySelector('.note').textContent = sc.note;
      var bMin = el.querySelector('#bCardMin'), bOff = el.querySelector('#bCardOff');
      if (bMin) bMin.addEventListener('click', function () {
        Z.offen = !Z.offen; el.classList.toggle('min', !Z.offen);
        bMin.textContent = Z.offen ? '–' : '+';
        if (cfg.beimEinklappen) cfg.beimEinklappen();
      });
      if (bOff) bOff.addEventListener('click', function () { Z.setzen(null); });
    }

    Z.setzen = function (id) {
      Z.aktiv = id;
      Object.keys(zeilen).forEach(function (k) { zeilen[k].classList.toggle('on', k === id); });
      if (id) {
        karteFuellen(daten.filter(function (s) { return s.id === id; })[0]);
        Z.offen = true; Z.el.classList.remove('min'); Z.el.classList.add('show');
      } else Z.el.classList.remove('show');
      if (cfg.beimWechsel) cfg.beimWechsel(id);
    };
    Z.liste = function (pane, kind, kopf, einleitung) {
      var intro = document.createElement('p'); intro.className = 'dis-intro';
      intro.textContent = einleitung;
      pane.appendChild(intro);
      var h = document.createElement('h2'); h.className = 'dis-h'; h.textContent = kopf; pane.appendChild(h);
      daten.filter(function (sc) { return sc.kind === kind; }).forEach(function (sc) {
        var row = document.createElement('div'); row.className = 'dis'; row.tabIndex = 0;
        row.innerHTML = '<span class="knob"></span><span><b></b><i></i></span>';
        row.querySelector('b').textContent = sc.name; row.querySelector('i').textContent = sc.short;
        function flip() { Z.setzen(Z.aktiv === sc.id ? null : sc.id); }
        row.addEventListener('click', flip);
        row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
        zeilen[sc.id] = row; pane.appendChild(row);
      });
    };
    /* weiches Ueberblenden; true, wenn sich ein Anteil geaendert hat */
    Z.schritt = function (dt) {
      var geaendert = false;
      Object.keys(anteil).forEach(function (k) {
        var tg = Z.aktiv === k ? 1 : 0;
        if (anteil[k] !== tg) { anteil[k] += Math.max(-dt / dauer, Math.min(dt / dauer, tg - anteil[k])); geaendert = true; }
      });
      return geaendert;
    };
    /* sofort setzen, ohne Ueberblenden */
    Z.direkt = function (id) {
      Z.setzen(id || null);
      Object.keys(anteil).forEach(function (k) { anteil[k] = (k === id) ? 1 : 0; });
    };
    /* Karte einklappen, ohne Rueckruf */
    Z.zuklappen = function () { Z.offen = false; Z.el.classList.add('min'); };

    Z.abbauen = function () { if (Z.el && Z.el.parentNode) Z.el.parentNode.removeChild(Z.el); Z.el = null; zeilen = {}; };

    karteBauen();
    return Z;
  };
})(Kern);
