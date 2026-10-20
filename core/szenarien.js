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
  /* Gemeinsame Daten fuer Alveole und Lunge (Reiter Krankheitsbilder und Medikamente): Kern.Szenarien.daten.atmung. Felder wie oben; dazu
     modell = { sz: Schluessel in der Werttabelle SZENARIEN des Alveolen-Modells, o: Obstruktion (fuer die Lunge in 3D; Alveole: Werte aus ihrer Tabelle),
     frisch: Sauerstoff der Frischluft, spaeter: { nach (s Simulationszeit), t, f } = danach Tiefe und Frequenz (nur Alveole) }. Texte freigegeben (PR C). */
  K.Szenarien.daten = {
    atmung: [
      { id: 'hyper', kind: 'disease', name: 'Hyperventilation', short: 'zu tief, zu schnell', kicker: 'Störung der Atmung · zu viel Atmung',
        lead: 'Es wird tiefer und schneller geatmet, als der Körper braucht. Dabei wird mehr Kohlendioxid abgeatmet, als im Stoffwechsel entsteht.',
        values: [['Atmung', 'tief und schnell'], ['CO₂ im Blut', 'zu niedrig'], ['Säure-Basen', 'alkalisch (respiratorische Alkalose)'], ['Sauerstoff', 'kaum verändert']],
        steps: [['Die Lüftung steigt.', 'Mit jedem Atemzug kommt mehr frische Luft in die Alveolen.'], ['CO₂ wird ausgewaschen.', 'In der Alveole sinkt das CO₂, aus dem Blut wandert mehr hinüber.'], ['Das Blut wird basisch.', 'Mit dem CO₂ fehlt Kohlensäure – der pH-Wert steigt.'], ['Kribbeln und Krämpfe.', 'Weniger freies Calcium im Blut: Kribbeln an Händen und Mund, Pfötchenstellung.']],
        after: [['Behandlung', 'Ursache klären (Angst, Schmerz, aber auch Fieber oder Stoffwechselentgleisung), beruhigen, langsam und bewusst ausatmen lassen. Rückatmung in eine Tüte nur nach ärztlicher Anordnung.'], ['Pflege beobachtet', 'Atemfrequenz und -tiefe, Angst, Kribbeln und Verkrampfungen; daneben bleiben, ruhig anleiten.']],
        note: 'Der Sauerstoff im Blut ändert sich kaum, weil er schon bei Ruheatmung fast voll aufgenommen wird – das CO₂ reagiert deutlich.',
        modell: { sz: 'hyper', o: 0 } },
      { id: 'hypo', kind: 'disease', name: 'Hypoventilation', short: 'z. B. Schädigung des Atemzentrums', kicker: 'Störung der Atmung · zu wenig Atmung',
        lead: 'Es wird zu flach und zu langsam geatmet. Kohlendioxid staut sich an, später fällt auch der Sauerstoff ab.',
        values: [['Atmung', 'flach und langsam'], ['CO₂ im Blut', 'erhöht'], ['Sauerstoff', 'vermindert'], ['Ursachen', 'Opiate, Narkose, Schädel-Hirn-Trauma, Erschöpfung']],
        steps: [['Die Lüftung sinkt.', 'Pro Minute kommt zu wenig frische Luft in die Alveolen.'], ['CO₂ staut sich.', 'In der Alveole bleibt CO₂ zurück, das Blut gibt weniger ab.'], ['Der Sauerstoff sinkt.', 'Mit der Zeit kommt auch zu wenig O₂ nach.'], ['Müdigkeit bis Bewusstlosigkeit.', 'Viel CO₂ macht schläfrig – das bremst die Atmung weiter (Teufelskreis).']],
        after: [['Behandlung', 'Ursache behandeln (z. B. Opiat-Antagonist), Atemwege frei halten, Atmung unterstützen bis zur Beatmung.'], ['Pflege beobachtet', 'Atemfrequenz (Alarmzeichen unter 8–10/min), Bewusstsein, Sauerstoffsättigung; nach Opiaten engmaschig überwachen.']],
        note: 'Im Ergebnisfeld steigt zuerst das CO₂, der Sauerstoff folgt langsamer.',
        modell: { sz: 'hypo', o: 0 } },
      { id: 'asthma', kind: 'disease', name: 'Asthmaanfall', short: 'Atemwege verengt, Luft bleibt gefangen', kicker: 'Obstruktive Atemwegserkrankung · anfallsweise',
        lead: 'Die Bronchien verkrampfen, die Schleimhaut schwillt an und bildet zähen Schleim. Vor allem das Ausatmen ist erschwert.',
        values: [['Atemwege', 'stark verengt'], ['Lunge', 'überbläht'], ['Ausatmung', 'verlängert, pfeifend (Giemen)'], ['Gasaustausch', 'vermindert']],
        steps: [['Die Bronchien werden eng.', 'Verkrampfte Muskulatur, Schwellung und Schleim verengen den Weg.'], ['Die Luft kommt nicht hinaus.', 'Beim Ausatmen fallen die engen Wege zusammen – Luft bleibt gefangen.'], ['Die Lunge bläht sich.', 'Sie bleibt größer als in Ruhe, das Atmen wird anstrengend.'], ['Weniger frische Luft.', 'Die Alveolen werden schlechter belüftet, CO₂ steigt, O₂ sinkt.']],
        after: [['Behandlung', 'Bronchien erweiterndes Spray (z. B. Salbutamol), Kortison, Sauerstoff nach Anordnung; im schweren Anfall Notfall.'], ['Pflege beobachtet', 'Atemnot, Sprechen in kurzen Sätzen, Atemhilfsmuskulatur, Atemfrequenz, Sättigung; aufrecht sitzen lassen (Kutschersitz, Lippenbremse), Ruhe vermitteln.']],
        note: 'In der Lunge (3D) sind die Bronchien sichtbar verengt und die Lunge bleibt größer. In der Alveole zeigt die kleine Lunge links die Überblähung.',
        modell: { sz: 'asthma', o: 0.85 } },
      { id: 'copd', kind: 'disease', name: 'COPD', short: 'verengt und Austauschfläche zerstört', kicker: 'Chronisch obstruktive Lungenerkrankung · dauerhaft',
        lead: 'Meist nach jahrelangem Rauchen: Die Atemwege sind dauerhaft verengt, und Alveolenwände sind zerstört (Lungenemphysem). Es fehlt Austauschfläche.',
        values: [['Atemwege', 'verengt (nicht ganz rückbildbar)'], ['Austauschfläche', 'vermindert'], ['Sauerstoff im Blut', 'vermindert'], ['Ursache', 'meist Rauchen']],
        steps: [['Chronische Entzündung.', 'Die Bronchien sind dauerhaft gereizt, verengt und verschleimt.'], ['Alveolen gehen zugrunde.', 'Wände zwischen den Bläschen lösen sich auf, es entstehen große Blasen mit wenig Fläche.'], ['Weniger Fläche, weniger Austausch.', 'Selbst wenn in der Alveole genug O₂ ist, kommt zu wenig ins Blut (Diffusionsstörung).'], ['Luft bleibt gefangen.', 'Wie beim Asthma ist das Ausatmen erschwert, die Lunge überbläht.']],
        after: [['Behandlung', 'Rauchstopp, inhalative Bronchien erweiternde Mittel, Atemtherapie, Sauerstoff-Langzeittherapie nach Anordnung, Impfungen.'], ['Pflege beobachtet', 'Atemnot bei Belastung, Husten und Auswurf, Lippenbremse und atemerleichternde Haltungen anleiten; Sauerstoff nur in der angeordneten Menge.']],
        note: 'Im Ergebnisfeld ist der O₂ in der Alveole deutlich höher als im Blut danach – das ist die Diffusionsstörung. Die Alveolenwand ist gestrichelt (zerstörte Abschnitte).',
        modell: { sz: 'copd', o: 0.60 } },
      { id: 'azidose', kind: 'disease', name: 'Respiratorische Azidose', short: 'CO₂ staut sich an, Blut übersäuert', kicker: 'Säure-Basen-Störung · durch die Atmung',
        lead: 'Wird zu wenig CO₂ abgeatmet, entsteht im Blut mehr Kohlensäure. Der pH-Wert fällt – das Blut übersäuert.',
        values: [['CO₂ im Blut', 'stark erhöht'], ['Säure-Basen', 'übersäuert (Azidose)'], ['Atmung', 'flach, langsam, Atemwege leicht verengt'], ['Folgen', 'Kopfschmerz, Verwirrtheit, Schläfrigkeit']],
        steps: [['Zu wenig Abatmung.', 'Flache, langsame Atmung und leicht verengte Atemwege.'], ['CO₂ bleibt im Blut.', 'Das abfließende Blut ist mit CO₂ überladen.'], ['Mehr Kohlensäure.', 'CO₂ und Wasser bilden Kohlensäure – das Blut wird sauer.'], ['Die Niere gleicht langsam aus.', 'Über Tage hält sie mehr Bicarbonat zurück; akut hilft nur bessere Atmung.']],
        after: [['Behandlung', 'Atmung verbessern (Ursache behandeln, Atemwege frei, ggf. nicht-invasive Beatmung).'], ['Pflege beobachtet', 'Bewusstsein, Atemfrequenz, Hautfarbe, Kopfschmerz, Verwirrtheit; Blutgaswerte nach Anordnung.']],
        note: 'Die unterste Zeile im Ergebnisfeld springt auf „übersäuert (Azidose)“.',
        modell: { sz: 'azidose', o: 0.25 } },
      { id: 'cheyne', kind: 'disease', name: 'Cheyne-Stokes-Atmung', short: 'An- und Abschwellen mit Atempausen', kicker: 'Pathologisches Atemmuster',
        lead: 'Die Atmung wird tiefer und tiefer, dann flacher und flacher, dann folgt eine Atempause – und alles beginnt von vorn.',
        values: [['Muster', 'periodisch, Zyklus ca. 24 s im Modell'], ['Atempausen', 'ja'], ['Vorkommen', 'Herzschwäche, Hirnschädigung, Sterbephase'], ['Steuerung', 'Atemzentrum reagiert verzögert']],
        steps: [['Atempause.', 'Der Sauerstoff fällt, das CO₂ steigt an.'], ['Das Atemzentrum reagiert verspätet.', 'Es merkt den Anstieg erst spät und steigert die Atmung stark.'], ['Überschießende Atmung.', 'Tiefe Atemzüge waschen das CO₂ wieder aus – oft zu sehr.'], ['Der Antrieb fällt weg.', 'Mit wenig CO₂ fehlt der Reiz – die nächste Pause beginnt.']],
        after: [['Behandlung', 'Grunderkrankung behandeln (z. B. Herzschwäche); in der Sterbephase steht Begleitung im Vordergrund.'], ['Pflege beobachtet', 'Muster und Länge der Pausen dokumentieren und weitergeben, nicht nur die Atemfrequenz zählen; Angehörige aufklären.']],
        note: 'Eine volle Minute beobachten – die Werte schwanken mit dem Muster.',
        modell: { sz: 'cheyne', o: 0 } },
      { id: 'salbutamol', kind: 'drug', name: 'Salbutamol beim Asthmaanfall (z. B. Sultanol®)', short: 'erweitert die Bronchien in wenigen Minuten', kicker: 'Medikament · β₂-Sympathomimetikum (Spray)',
        lead: 'Salbutamol entspannt die glatte Muskulatur der Bronchien. Es ist das Notfallspray beim Asthmaanfall.',
        values: [['Wirkung', 'Bronchien weit'], ['Wirkbeginn', 'nach wenigen Minuten'], ['Dauer', 'ca. 4–6 Stunden'], ['Nebenwirkungen', 'Herzrasen, Zittern, Unruhe']],
        steps: [['', 'Das Spray erreicht die Bronchien.'], ['', 'Die Muskulatur entspannt sich, die Wege werden weiter.'], ['', 'Die gefangene Luft kann hinaus, die Überblähung lässt nach.'], ['', 'Die Alveolen werden wieder besser belüftet.']],
        after: [['Achtung', 'Inhalationstechnik ist entscheidend (ggf. mit Spacer). Häufiger Bedarf zeigt ein schlecht kontrolliertes Asthma.'], ['Pflege beobachtet', 'Atemnot vorher und nachher, Puls, Zittern, richtige Inhalation.']],
        note: '',
        modell: { sz: 'asthma', o: 0.25 } },
      { id: 'sauerstoff', kind: 'drug', name: 'Sauerstoffgabe bei COPD', short: 'mehr Sauerstoff in der Einatemluft – aber kein Mittel gegen CO₂', kicker: 'Therapie · Sauerstoff über Nasenbrille',
        lead: 'Über eine Nasenbrille wird zusätzlicher Sauerstoff gegeben. In der Alveole ist dann mehr O₂ – das gleicht einen Teil der Diffusionsstörung aus.',
        values: [['Wirkung', 'O₂ im Blut ↑'], ['CO₂', 'unverändert'], ['Menge', 'nur nach Anordnung (l/min)'], ['Achtung', 'bei COPD Ziel-Sättigung meist 88–92 %']],
        steps: [['', 'Die Einatemluft enthält mehr Sauerstoff.'], ['', 'In der Alveole steigt der O₂.'], ['', 'Der größere Unterschied treibt trotz kleiner Fläche mehr O₂ ins Blut.'], ['', 'Das CO₂ bleibt – Sauerstoff ersetzt keine Atmung.']],
        after: [['Achtung', 'Bei manchen COPD-Kranken kann zu viel Sauerstoff die Atmung dämpfen und das CO₂ weiter ansteigen lassen.'], ['Pflege beobachtet', 'Sättigung im Zielbereich, Bewusstsein, Atemfrequenz; Nasenschleimhaut befeuchten, Brandschutz (kein offenes Feuer).']],
        note: '',
        modell: { sz: 'copd', o: 0.60, frisch: 1.00 } },
      { id: 'naloxon', kind: 'drug', name: 'Naloxon bei Opiat-Hypoventilation', short: 'hebt die Atemdämpfung durch Opiate auf', kicker: 'Medikament · Opioid-Antagonist',
        lead: 'Opiate (z. B. Morphin) dämpfen das Atemzentrum. Naloxon verdrängt sie von ihren Rezeptoren – die Atmung kommt in Minuten wieder in Gang.',
        values: [['Wirkung', 'Atemantrieb ↑'], ['Wirkbeginn', '1–2 Minuten (i. v.)'], ['Dauer', 'kürzer als viele Opiate'], ['Nebenwirkung', 'Schmerzen kehren zurück, Entzug']],
        steps: [['', 'Naloxon besetzt die Opioid-Rezeptoren.'], ['', 'Das Atemzentrum wird wieder empfindlich für CO₂.'], ['', 'Atmung wird tiefer und schneller.'], ['', 'CO₂ sinkt, Sauerstoff steigt.']],
        after: [['Achtung', 'Die Wirkung kann vor dem Opiat nachlassen – die Atmung kann erneut versagen (Rebound).'], ['Pflege beobachtet', 'Atemfrequenz und Bewusstsein auch nach der Gabe engmaschig, Schmerzen, Entzugszeichen.']],
        note: '',
        modell: { sz: 'hypo', o: 0, spaeter: { nach: 4, t: 0.50, f: 0.50 } } }
    ]
  };
})(Kern);
