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
})(Kern);
