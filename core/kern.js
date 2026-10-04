/* ==========================================================================
   Gemeinsamer Kern - Szenen-Licht von Herz und Nephron
   Klassisches Skript (kein Modul), nutzt das globale THREE. Beim Laden
   werden nur Funktionen definiert, keine THREE-Objekte erzeugt.
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  /* sRGB-Hexwert -> lineare Farbe */
  K.srgb = function (hex) { return new THREE.Color(hex).convertSRGBToLinear(); };

  /* Weiches Umgebungslicht aus einer kleinen Lichtkuppel - gibt feuchten
     Gewebeglanz statt Plastikoptik. Faellt auf alten Geraeten still weg
     (Rueckgabe null). */
  K.umgebung = function (renderer) {
    var envTex = null;
    try {
      var pm = new THREE.PMREMGenerator(renderer);
      var es = new THREE.Scene();
      var sg = new THREE.SphereGeometry(20, 32, 16), cols = [], p = sg.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var y = p.getY(i) / 20;
        var c = y > 0 ? new THREE.Color(0x2a3b42).lerp(new THREE.Color(0x9fb4bc), y)
                      : new THREE.Color(0x2a3b42).lerp(new THREE.Color(0x1a1512), -y);
        cols.push(c.r, c.g, c.b);
      }
      sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
      [[8, 12, 12, 0xfff1dc, 3.0], [-14, 4, 6, 0xbfd8e6, 1.4], [0, -10, -12, 0xffd0a0, 0.9]].forEach(function (L) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(9, 6),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(L[3]).multiplyScalar(L[4]), side: THREE.DoubleSide }));
        m.position.set(L[0], L[1], L[2]); m.lookAt(0, 0, 0); es.add(m);
      });
      envTex = pm.fromScene(es, 0.04).texture;
      pm.dispose();
    } catch (e) { envTex = null; }
    return envTex;
  };

  /* Gewebematerial. Optionen o: rough (0.6), coat (Clearcoat, sonst Standard-
     material), coatRough (0.35), side, vc (Vertexfarben), morph (Morph
     Targets), opacity (<1: transparent), env (Umgebungsstaerke, 0.28).
     envTex stammt aus K.umgebung (kann null sein). */
  K.mat = function (hex, o, envTex) {
    var M = o.coat ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
    var m = new M({ color: o.vc ? new THREE.Color(1, 1, 1) : K.srgb(hex), roughness: o.rough === undefined ? 0.6 : o.rough, metalness: 0,
      side: o.side || THREE.FrontSide, vertexColors: !!o.vc, morphTargets: !!o.morph });
    if (o.coat) { m.clearcoat = o.coat; m.clearcoatRoughness = o.coatRough === undefined ? 0.35 : o.coatRough; }
    if (o.opacity !== undefined && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
    if (envTex) { m.envMap = envTex; m.envMapIntensity = o.env === undefined ? 0.28 : o.env; }
    m.emissive = new THREE.Color(0, 0, 0);
    m.userData.baseEmissive = m.emissive.clone();
    return m;
  };

  /* Hemisphaerenlicht plus Haupt-, Fuell- und Gegenlicht */
  K.licht = function (scene, envTex) {
    scene.add(new THREE.HemisphereLight(0xbcd6e0, 0x2a1d18, envTex ? 0.42 : 0.6));
    var key = new THREE.DirectionalLight(0xfff4e2, 0.95); key.position.set(6, 8, 14); scene.add(key);
    var fill = new THREE.DirectionalLight(0x9dc4d8, 0.35); fill.position.set(-12, 3, 8); scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffd9a8, 0.45); rim.position.set(-4, -6, -12); scene.add(rim);
    return { key: key, fill: fill, rim: rim };
  };

  /* Kamerasteuerung per Zeiger: Ziehen dreht, zwei Finger zoomen, Mausrad
     zoomt. view = { theta, phi, dist, target }; o.minDist/o.maxDist begrenzen
     den Abstand. Rueckgabe ctl: dragged (wurde gezogen, dann kein Klick-Pick)
     und anim (laufende Kamerafahrt, siehe K.fahrt; jede Eingabe bricht sie ab). */
  K.orbit = function (canvas, view, o) {
    var ptrs = new Map(), lastPinch = 0;
    var ctl = { dragged: false, anim: null };
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      ctl.dragged = false; ctl.anim = null;
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!ptrs.has(e.pointerId)) return;
      var p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size === 1) {
        if (Math.abs(dx) + Math.abs(dy) > 2) ctl.dragged = true;
        view.theta -= dx * 0.0072;
        view.phi = Math.max(0.1, Math.min(3.04, view.phi - dy * 0.0072));
      } else if (ptrs.size === 2) {
        ctl.dragged = true;
        var a = Array.from(ptrs.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (lastPinch) view.dist = Math.max(o.minDist, Math.min(o.maxDist, view.dist * (lastPinch / d)));
        lastPinch = d;
      }
    });
    function endPtr(e) { ptrs.delete(e.pointerId); if (ptrs.size < 2) lastPinch = 0; }
    canvas.addEventListener('pointerup', endPtr);
    canvas.addEventListener('pointercancel', endPtr);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault(); ctl.anim = null;
      view.dist = Math.max(o.minDist, Math.min(o.maxDist, view.dist * (1 + Math.sign(e.deltaY) * 0.09)));
    }, { passive: false });
    return ctl;
  };

  /* Beschriftung anlegen: div.lbl (fett deutsch, kursiv lateinisch) in
     labelBox sowie Fuehrungslinie (polyline) und Punkt (circle) im SVG. */
  K.beschriftung = function (labelBox, leaderSvg, de, lat) {
    var el = document.createElement('div'); el.className = 'lbl';
    el.innerHTML = '<b></b><i></i>';
    el.querySelector('b').textContent = de; el.querySelector('i').textContent = lat;
    labelBox.appendChild(el);
    var ln = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'), dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '2'); leaderSvg.appendChild(ln); leaderSvg.appendChild(dot);
    return { el: el, ln: ln, dot: dot };
  };

  /* Zeichenflaeche der Fuehrungslinien auf Fenstergroesse w x h setzen. */
  K.linienFlaeche = function (leaderSvg, w, h) {
    leaderSvg.setAttribute('width', w); leaderSvg.setAttribute('height', h); leaderSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  };

  /* Kamera aus view (Kugelkoordinaten um view.target) setzen. k skaliert
     optional den Abstand (Herz: Platz fuer die Info-Karte). */
  K.kamera = function (camera, view, k) {
    var sp = Math.sin(view.phi), dd = view.dist * (k === undefined ? 1 : k);
    camera.position.set(view.target.x + dd * sp * Math.sin(view.theta), view.target.y + dd * Math.cos(view.phi), view.target.z + dd * sp * Math.cos(view.theta));
    camera.lookAt(view.target);
  };

  /* Kamerafahrt von der aktuellen Ansicht zu ziel ({ theta, phi, dist,
     target }) in dauer ms; K.fahrtSchritt wird je Bild aufgerufen. */
  K.fahrt = function (view, ziel, dauer) {
    return { f: { theta: view.theta, phi: view.phi, dist: view.dist, target: view.target.clone() }, t: ziel, t0: performance.now(), d: dauer };
  };
  K.fahrtSchritt = function (view, anim, now) {
    var t = Math.min(1, (now - anim.t0) / anim.d), s = t * t * (3 - 2 * t);
    view.theta = anim.f.theta + (anim.t.theta - anim.f.theta) * s;
    view.phi = anim.f.phi + (anim.t.phi - anim.f.phi) * s;
    view.dist = anim.f.dist + (anim.t.dist - anim.f.dist) * s;
    view.target.lerpVectors(anim.f.target, anim.t.target, s);
    return t >= 1 ? null : anim;
  };

  /* Kurzer Hinweis unten (#toast, HTML erlaubt); verschwindet nach 5,6 s. */
  K.toast = function (msg) {
    var t = document.getElementById('toast');
    t.innerHTML = msg; t.classList.add('show');
    clearTimeout(K.toast._t);
    K.toast._t = setTimeout(function () { t.classList.remove('show'); }, 5600);
  };
})(Kern);
