/* ==========================================================================
   Gemeinsamer Kern - AR: WebXR-Sitzung (Android), USDZ-Erzeugung und AR Quick Look (iPhone/iPad)
   Klassisches Skript (kein Modul), nutzt das globale THREE und Kern.toast.
   Beim Laden werden nur Funktionen definiert, keine THREE-Objekte erzeugt.
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';
  var AR = K.AR = {};

  /* WebXR-Sitzung (Android, Chrome mit ARCore): Ring auf der Flaeche, Hinstellen,
     Groesse, Beenden. Liefert den Steuer-Zustand mit den Methoden
     check(), start() (async), frame(xrFrame), place(), end().
     cfg: renderer, scene, camera, root, stufen, skala, fuss (Hoehe des
     Fusspunkts in Modelleinheiten), hintergrund (Clear-Farbe nach dem Ende),
     ids { ui, hint, ende, kleiner, groesser, neu }, knoepfe (IDs, die
     beforexrselect unterdruecken), quickLook() (Rueckfall), beimStart(),
     beimEnde(). Der Ring entsteht erst beim Start. */
  AR.xr = function (cfg) {
    var st = { session: null, hit: null, ref: null, reticle: null, placed: false, scale: cfg.skala, saved: null, xr: false };
    var renderer = cfg.renderer, root = cfg.root, ids = cfg.ids, aktiv = false;
    var el = function (id) { return document.getElementById(id); };

    st.check = function () {
      if (navigator.xr && navigator.xr.isSessionSupported) navigator.xr.isSessionSupported('immersive-ar').then(function (ok) { st.xr = ok; }).catch(function () { st.xr = false; });
    };
    function reticle() {
      if (st.reticle) return;
      var g = new THREE.RingGeometry(0.06, 0.075, 40).rotateX(-Math.PI / 2);
      st.reticle = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xE0A94A, transparent: true, opacity: 0.9 }));
      st.reticle.matrixAutoUpdate = false; st.reticle.visible = false; cfg.scene.add(st.reticle);
    }
    st.start = async function () {
      if (st.xr) {
        var sess;
        try {
          sess = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: el(ids.ui) } });
        } catch (e) {
          K.toast('AR lässt sich hier nicht starten. Öffne den Link direkt in Chrome (eigener Tab), dann klappt es.');
          return;
        }
        reticle();
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');
        await renderer.xr.setSession(sess);
        st.session = sess; st.ref = renderer.xr.getReferenceSpace();
        try { var vs = await sess.requestReferenceSpace('viewer'); st.hit = await sess.requestHitTestSource({ space: vs }); } catch (e) { st.hit = null; }
        sess.addEventListener('select', function () { if (!st.placed && st.reticle.visible) st.place(); });
        sess.addEventListener('end', st.end);
        st.saved = { p: root.position.clone(), q: root.quaternion.clone(), s: root.scale.clone() };
        aktiv = true; st.placed = false; root.visible = false;
        renderer.setClearColor(0x000000, 0);
        el(ids.ui).style.display = 'block'; el(ids.hint).style.display = '';
        if (cfg.beimStart) cfg.beimStart();
        return;
      }
      if (AR.quickLookOK() && cfg.quickLook) { cfg.quickLook(); return; }
      if (navigator.xr) K.toast('Dieses Gerät kann im Browser kein AR. Auf Android: Chrome mit „Google Play-Dienste für AR“, auf iPhone/iPad: Safari.');
      else K.toast('AR braucht ein Smartphone oder Tablet mit Kamera: Android mit Chrome oder iPhone/iPad mit Safari.');
    };
    st.place = function () {
      var cam = renderer.xr.getCamera(cfg.camera), cp = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);
      var p = new THREE.Vector3().setFromMatrixPosition(st.reticle.matrix);
      root.position.copy(p);
      root.rotation.set(0, Math.atan2(cp.x - p.x, cp.z - p.z), 0);
      root.scale.setScalar(st.scale);
      root.position.y += cfg.fuss * st.scale;           /* Fusspunkt steht auf der Flaeche */
      root.visible = true; st.placed = true; st.reticle.visible = false;
      el(ids.hint).style.display = 'none';
    };
    st.frame = function (frame) {
      if (!frame || !st.hit || st.placed) return;
      var hits = frame.getHitTestResults(st.hit);
      if (hits.length) { var pose = hits[0].getPose(st.ref); if (pose) { st.reticle.visible = true; st.reticle.matrix.fromArray(pose.transform.matrix); } }
      else st.reticle.visible = false;
    };
    st.end = function () {
      if (!aktiv) return;
      aktiv = false; st.session = null;
      if (st.hit) { try { st.hit.cancel(); } catch (e) {} st.hit = null; }
      if (st.reticle) st.reticle.visible = false;
      if (st.saved) { root.position.copy(st.saved.p); root.quaternion.copy(st.saved.q); root.scale.copy(st.saved.s); }
      root.visible = true;
      renderer.setClearColor(cfg.hintergrund, 1);
      el(ids.ui).style.display = 'none';
      if (cfg.beimEnde) cfg.beimEnde();
    };

    cfg.knoepfe.forEach(function (id) { el(id).addEventListener('beforexrselect', function (e) { e.preventDefault(); }); });
    el(ids.ende).onclick = function () { if (st.session) st.session.end(); };
    var stufe = function (d) {
      var S = cfg.stufen, i = S.indexOf(st.scale); i = Math.max(0, Math.min(S.length - 1, (i < 0 ? S.indexOf(cfg.skala) : i) + d)); var alt = st.scale; st.scale = S[i];
      if (st.placed) { root.position.y += (st.scale - alt) * cfg.fuss; root.scale.setScalar(st.scale); }
    };
    el(ids.kleiner).onclick = function () { stufe(-1); };
    el(ids.groesser).onclick = function () { stufe(1); };
    el(ids.neu).onclick = function () { st.placed = false; root.visible = false; el(ids.hint).style.display = ''; };
    return st;
  };

  /* Unterstuetzt der Browser AR Quick Look (<a rel="ar">)? */
  AR.quickLookOK = function () { var a = document.createElement('a'); return !!(a.relList && a.relList.supports && a.relList.supports('ar')); };

  /* Sichtbar nur, wenn das Objekt und alle Eltern sichtbar sind */
  function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }

  var CRCT = null;
  function crc32b(u) { if (!CRCT) { CRCT = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRCT[n] = c >>> 0; } } var c2 = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c2 = CRCT[(c2 ^ u[i]) & 255] ^ (c2 >>> 8); return (c2 ^ 0xFFFFFFFF) >>> 0; }

  /* USDZ = ZIP ohne Kompression, Dateidaten auf 64 Byte ausgerichtet */
  AR.usdzZip = function (files) {
    var parts = [], cds = [], off = 0, cdLen = 0;
    files.forEach(function (f) {
      var nb = new TextEncoder().encode(f.name), data = f.data, crc = crc32b(data);
      var base = off + 30 + nb.length, pad = (64 - ((base + 4) % 64)) % 64, extra = 4 + pad;
      var lh = new DataView(new ArrayBuffer(30 + nb.length + extra));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0, true); lh.setUint16(8, 0, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, nb.length, true); lh.setUint16(28, extra, true);
      new Uint8Array(lh.buffer).set(nb, 30); lh.setUint16(30 + nb.length, 0x1986, true); lh.setUint16(32 + nb.length, pad, true);
      var ch = new DataView(new ArrayBuffer(46 + nb.length));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, nb.length, true); ch.setUint32(42, off, true); new Uint8Array(ch.buffer).set(nb, 46);
      parts.push(lh.buffer, data); cds.push(ch.buffer); cdLen += ch.byteLength;
      off += lh.byteLength + data.length;
    });
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdLen, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(cds, [end.buffer]), { type: 'model/vnd.usdz+zip' });
  };

  /* USDZ fuer AR Quick Look: Momentaufnahme der aktuellen Ansicht.
     cfg: name, creator, datei, gruppen, skala, beschriftung(f4) (optional,
     liefert { mats, meshes, png } oder null; Rueckruf laeuft nach den
     Teilen und darf Welt-Matrizen vorher aktualisieren) */
  AR.usdz = function (cfg) {
    var name = cfg.name, skala = cfg.skala;
    var meshes = [], mats = [], txt = [];
    var f4 = function (v) { return (Math.round(v * 10000) / 10000).toString(); };
    var v = new THREE.Vector3(), nm = new THREE.Vector3(), nmat = new THREE.Matrix3();
    cfg.gruppen.forEach(function (G) {
      G.traverse(function (m) {
        if (!m.isMesh || m.isInstancedMesh || !shown(m) || m.userData.noexport) return;
        var g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, col = g.attributes.color, idx = g.index ? g.index.array : null;
        var ma = (g.morphAttributes && g.morphAttributes.position) || [], inf = m.morphTargetInfluences || [];
        var list = Array.isArray(m.material) ? m.material : [m.material];
        var grs = Array.isArray(m.material) && g.groups.length ? g.groups : [{ start: 0, count: idx ? idx.length : pos.count, materialIndex: 0 }];
        m.updateWorldMatrix(true, false); nmat.getNormalMatrix(m.matrixWorld);
        grs.forEach(function (gr) {
          var mt = list[gr.materialIndex]; if (!mt || !mt.visible || mt.opacity < 0.3) return;
          var map = new Map(), P = [], N = [], I = [], cr = 0, cg = 0, cb = 0, cn = 0;
          for (var t = gr.start; t < gr.start + gr.count; t++) {
            var vi = idx ? idx[t] : t, ni = map.get(vi);
            if (ni === undefined) {
              ni = map.size; map.set(vi, ni);
              var x = pos.getX(vi), y = pos.getY(vi), z = pos.getZ(vi);
              for (var k = 0; k < ma.length; k++) { var w = inf[k] || 0; if (w) { x += ma[k].getX(vi) * w; y += ma[k].getY(vi) * w; z += ma[k].getZ(vi) * w; } }
              v.set(x, y, z).applyMatrix4(m.matrixWorld);
              P.push('(' + f4(v.x * skala) + ', ' + f4(v.y * skala) + ', ' + f4(v.z * skala) + ')');
              if (nor) { nm.set(nor.getX(vi), nor.getY(vi), nor.getZ(vi)).applyMatrix3(nmat).normalize(); N.push('(' + f4(nm.x) + ', ' + f4(nm.y) + ', ' + f4(nm.z) + ')'); }
              if (col && mt.vertexColors) { cr += col.getX(vi); cg += col.getY(vi); cb += col.getZ(vi); cn++; }
            }
            I.push(ni);
          }
          if (I.length < 3) return;
          var c = cn ? [cr / cn, cg / cn, cb / cn] : [mt.color.r, mt.color.g, mt.color.b];
          var mi = mats.length; mats.push({ c: c, r: mt.roughness === undefined ? 0.6 : mt.roughness, op: mt.userData.glass ? 1 : Math.min(1, mt.opacity) });
          meshes.push({ P: P, N: N, I: I, m: mi, ds: mt.side === THREE.DoubleSide });
        });
      });
    });
    txt.push('#usda 1.0\n(\n    customLayerData = { string creator = "' + cfg.creator + '" }\n    defaultPrim = "' + name + '"\n    metersPerUnit = 1\n    upAxis = "Y"\n)\n\ndef Xform "' + name + '" (\n    assetInfo = { string name = "' + name + '" }\n    kind = "component"\n)\n{\n');
    var lab = cfg.beschriftung ? cfg.beschriftung(f4) : null;
    txt.push('    def Scope "Materialien"\n    {\n');
    if (lab) txt.push(lab.mats);
    mats.forEach(function (M, i) {
      var c = M.c.map(function (x) { return Math.max(0, Math.min(1, x)).toFixed(4); }).join(', ');
      txt.push('        def Material "M' + i + '"\n        {\n            token outputs:surface.connect = </' + name + '/Materialien/M' + i + '/Oberflaeche.outputs:surface>\n            def Shader "Oberflaeche"\n            {\n                uniform token info:id = "UsdPreviewSurface"\n                color3f inputs:diffuseColor = (' + c + ')\n                float inputs:roughness = ' + M.r.toFixed(2) + '\n                float inputs:metallic = 0\n                float inputs:opacity = ' + M.op.toFixed(2) + '\n                token outputs:surface\n            }\n        }\n');
    });
    txt.push('    }\n');
    meshes.forEach(function (o, i) {
      var cnt = new Array(o.I.length / 3).fill(3).join(', ');
      txt.push('    def Mesh "Teil' + i + '"\n    {\n        uniform bool doubleSided = ' + (o.ds ? 1 : 0) + '\n        int[] faceVertexCounts = [' + cnt + ']\n        int[] faceVertexIndices = [' + o.I.join(', ') + ']\n        point3f[] points = [' + o.P.join(', ') + ']\n');
      if (o.N.length) txt.push('        normal3f[] normals = [' + o.N.join(', ') + '] (\n            interpolation = "vertex"\n        )\n');
      txt.push('        uniform token subdivisionScheme = "none"\n        rel material:binding = </' + name + '/Materialien/M' + o.m + '>\n    }\n');
    });
    if (lab) txt.push(lab.meshes);
    txt.push('}\n');
    var files = [{ name: cfg.datei, data: new TextEncoder().encode(txt.join('')) }];
    if (lab) files.push({ name: 'beschriftung.png', data: lab.png });
    return AR.usdzZip(files);
  };

  /* AR-Beschriftung: Schilder mit Fuehrungslinien als 3D-Objekte (WebXR) und
     als Beschriftungsbild fuer die USDZ-Datei. Im AR gibt es keine HTML-Ebene
     ueber dem Bild. Die Schilder stehen deshalb in Modellkoordinaten in zwei
     Spalten links und rechts neben dem Modell und drehen sich (WebXR) mit,
     sodass sie immer zum Betrachter zeigen.
     Liefert { update(), usd(f4, xf), ausblenden() }. Die Gruppe entsteht erst
     beim ersten update(), beim Laden und in schilder() selbst entsteht nichts.
     cfg:
       root, renderer, camera, xr (Steuer-Zustand aus AR.xr, nur .placed)
       name     Prim-Name fuer die Materialpfade der USDZ-Datei (/<name>/Materialien/...)
       masse    Laengen in Modelleinheiten; Vorgaben (Herz, cm) in M unten:
                spalte (Abstand der Spalten von der Mitte), hoehe (Schildhoehe),
                abstand (Zeilenabstand), z (Tiefe der Schilder), oben/unten
                (Bereich der Zeilen), px (Texturhoehe in Pixeln), knick (Weg der
                Linie bis zum Knick), luecke (Abstand Linienende-Schild), punkt
                (Radius des Ankerpunkts), band/punktBand (Halbbreiten in der
                USDZ-Datei), anker (Versatz des Ankers in z, USDZ), schwelle
                (Seiten-Schwelle), dim (Deckkraft nicht gewaehlter Schilder)
       anzahl   Hoechstzahl Schilder (Linienpuffer), Zahl oder Funktion
                (wird erst beim ersten update() gelesen)
       liste()  gewuenschte Schilder als Array { a, p }: p = Ankerpunkt [x, y, z]
                in Modellkoordinaten, a = Eintrag mit a.s.id, a.s.de (Titel) und
                a.s.lat (Untertitel). Der Kern speichert am Eintrag a das Bild
                (a.arC) und Mesh/Punkt (a.ar) zwischen.
       auswahl()  aktuell gewaehlte Struktur-ID (a.s.id) oder leer; alle
                anderen Schilder werden abgedunkelt */
  AR.schilder = function (cfg) {
    var M = { spalte: 7.4, hoehe: 1.15, abstand: 1.4, z: 3.2, oben: 8.8, unten: -7.2, px: 128,
      knick: 0.9, luecke: 0.12, punkt: 0.14, band: 0.035, punktBand: 0.13, anker: 0.05, schwelle: 0.4, dim: 0.4 };
    for (var key in cfg.masse) M[key] = cfg.masse[key];
    var root = cfg.root, ARL = { g: null, lines: null, side: {}, items: [] };
    var V = null;

    function canvas(a) {
      if (a.arC) return a.arC;
      var px = M.px, c = document.createElement('canvas'), x = c.getContext('2d');
      var f1 = '600 ' + Math.round(px * 0.34) + 'px "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
      var f2 = 'italic ' + Math.round(px * 0.28) + 'px Georgia, "Times New Roman", serif';
      x.font = f1; var w1 = x.measureText(a.s.de).width; x.font = f2; var w2 = x.measureText(a.s.lat).width;
      var pad = px * 0.15, W = Math.ceil(Math.max(w1, w2) + 2 * pad);
      c.width = W; c.height = px;
      x.fillStyle = 'rgba(11,23,28,0.84)'; x.fillRect(0, 0, W, px);
      x.strokeStyle = '#9C7530'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, W - 3, px - 3);
      x.font = f1; x.fillStyle = '#E7EFF0'; x.fillText(a.s.de, pad, px * 0.46);
      x.font = f2; x.fillStyle = '#E0A94A'; x.fillText(a.s.lat, pad, px * 0.82);
      a.arC = c;
      return c;
    }
    /* Anordnung in einem um die Hochachse gedrehten Rahmen (Blick des Betrachters = +z),
       Ergebnis in Modellkoordinaten: Ankerpunkt, Knick, Linienende und Schildmitte */
    function layout(list, yaw, sides) {
      var c = Math.cos(yaw), sn = Math.sin(yaw);
      var back = function (x, y, z) { return [x * c + z * sn, y, -x * sn + z * c]; };
      list.forEach(function (it) {
        var p = it.p, xr = p[0] * c - p[2] * sn, prev = sides[it.a.s.id + it.a.s.de];
        it.side = xr < -M.schwelle ? 'l' : (xr > M.schwelle ? 'r' : (prev || (xr < 0 ? 'l' : 'r')));
        sides[it.a.s.id + it.a.s.de] = it.side;
        var cv = canvas(it.a); it.w = M.hoehe * cv.width / cv.height;
      });
      ['l', 'r'].forEach(function (side) {
        var g = list.filter(function (it) { return it.side === side; }).sort(function (p, q) { return q.p[1] - p.p[1]; });
        var gap = M.abstand, y = M.oben;
        if (g.length > 1 && (g.length - 1) * gap > M.oben - M.unten) gap = Math.max(M.hoehe * 1.02, (M.oben - M.unten) / (g.length - 1));
        g.forEach(function (it) { it.ly = Math.min(y, Math.max(M.unten, it.p[1])); y = it.ly - gap; });
        var over = M.unten - (y + gap);
        if (over > 0) g.forEach(function (it) { it.ly = Math.min(M.oben, it.ly + over); });
      });
      list.forEach(function (it) {
        var sg = it.side === 'l' ? -1 : 1, ex = sg * M.spalte;
        it.k = back(ex - sg * M.knick, it.ly, M.z);
        it.e = back(ex, it.ly, M.z);
        it.m = back(ex + sg * (M.luecke + it.w / 2), it.ly, M.z + 0.01);
      });
      return list;
    }
    function init() {
      ARL.g = new THREE.Group(); ARL.g.visible = false; root.add(ARL.g);
      var n = (typeof cfg.anzahl === 'function' ? cfg.anzahl() : cfg.anzahl) * 4, geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      ARL.lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xE0A94A, depthTest: false, transparent: true }));
      ARL.lines.renderOrder = 998; ARL.lines.frustumCulled = false; ARL.g.add(ARL.lines);
      ARL.dotGeo = new THREE.SphereGeometry(M.punkt, 10, 8);
      ARL.dotMat = new THREE.MeshBasicMaterial({ color: 0xE0A94A, depthTest: false, transparent: true });
      V = new THREE.Vector3();
    }
    function item(a) {
      if (a.ar) return a.ar;
      var cv = canvas(a), tex = new THREE.CanvasTexture(cv);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(M.hoehe * cv.width / cv.height, M.hoehe),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
      mesh.renderOrder = 1000;
      var dot = new THREE.Mesh(ARL.dotGeo, ARL.dotMat); dot.renderOrder = 999;
      ARL.g.add(mesh); ARL.g.add(dot);
      a.ar = { mesh: mesh, dot: dot };
      ARL.items.push(a.ar);
      return a.ar;
    }

    var S = {};
    S.update = function () {
      if (!ARL.g) init();
      var list = cfg.xr.placed ? cfg.liste() : [];
      ARL.g.visible = list.length > 0;
      ARL.items.forEach(function (o) { o.mesh.visible = false; o.dot.visible = false; });
      if (!list.length) return;
      V.setFromMatrixPosition(cfg.renderer.xr.getCamera(cfg.camera).matrixWorld); root.worldToLocal(V);
      var yaw = Math.atan2(V.x, V.z);
      layout(list, yaw, ARL.side);
      var pos = ARL.lines.geometry.attributes.position, k = 0, sel = cfg.auswahl();
      list.forEach(function (it) {
        var o = item(it.a), dim = sel && it.a.s.id !== sel ? M.dim : 1;
        o.mesh.visible = true; o.mesh.position.set(it.m[0], it.m[1], it.m[2]); o.mesh.rotation.set(0, yaw, 0);
        o.mesh.material.opacity = dim;
        o.dot.visible = true; o.dot.position.set(it.p[0], it.p[1], it.p[2]);
        [it.p, it.k, it.k, it.e].forEach(function (q) { pos.setXYZ(k++, q[0], q[1], q[2]); });
      });
      for (var i = k; i < pos.count; i++) pos.setXYZ(i, 0, 0, 0);
      pos.needsUpdate = true;
      ARL.lines.geometry.setDrawRange(0, k);
    };
    S.ausblenden = function () { if (ARL.g) ARL.g.visible = false; };

    /* Beschriftung fuer die USDZ-Datei: ein Bild mit allen Schildern (Atlas),
       je Schild ein Rechteck, Fuehrungslinien als schmale Baender.
       f4: Zahlenformat, xf(x, y, z): Modell- in USDZ-Koordinaten [x, y, z].
       Liefert { mats, meshes, png } oder null (keine Schilder). */
    S.usd = function (f4, xf) {
      var list = cfg.liste();
      if (!list.length) return null;
      layout(list, 0, {});
      var AW = 0, AH = 0;
      list.forEach(function (it) { var cv = canvas(it.a); it.ay = AH; AH += cv.height; AW = Math.max(AW, cv.width); });
      var atlas = document.createElement('canvas'); atlas.width = AW; atlas.height = AH;
      var ax = atlas.getContext('2d');
      list.forEach(function (it) { ax.drawImage(canvas(it.a), 0, it.ay); });
      var bin = atob(atlas.toDataURL('image/png').split(',')[1]), png = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) png[i] = bin.charCodeAt(i);
      var pt = function (q) { var v = xf(q[0], q[1], q[2]); return '(' + f4(v[0]) + ', ' + f4(v[1]) + ', ' + f4(v[2]) + ')'; };
      var P = [], ST = [], I = [], LP = [], LI = [];
      list.forEach(function (it) {
        var cv = canvas(it.a), hw = it.w / 2, hh = M.hoehe / 2, m = it.m, b = P.length;
        P.push(pt([m[0] - hw, m[1] - hh, m[2]]), pt([m[0] + hw, m[1] - hh, m[2]]), pt([m[0] + hw, m[1] + hh, m[2]]), pt([m[0] - hw, m[1] + hh, m[2]]));
        var u1 = cv.width / AW, v0 = 1 - (it.ay + cv.height) / AH, v1 = 1 - it.ay / AH;
        ST.push('(0, ' + f4(v0) + ')', '(' + f4(u1) + ', ' + f4(v0) + ')', '(' + f4(u1) + ', ' + f4(v1) + ')', '(0, ' + f4(v1) + ')');
        I.push(b, b + 1, b + 2, b, b + 2, b + 3);
        /* Linien als Baender, Punkt am Anker als kleines Quadrat */
        var band = function (a, c, w) {
          var dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w, ny = dx / l * w, o = LP.length;
          LP.push(pt([a[0] - nx, a[1] - ny, a[2]]), pt([a[0] + nx, a[1] + ny, a[2]]), pt([c[0] + nx, c[1] + ny, c[2]]), pt([c[0] - nx, c[1] - ny, c[2]]));
          LI.push(o, o + 1, o + 2, o, o + 2, o + 3);
        };
        var an = [it.p[0], it.p[1], it.p[2] + M.anker];
        band(an, it.k, M.band); band(it.k, it.e, M.band);
        band([an[0] - M.punktBand, an[1], an[2]], [an[0] + M.punktBand, an[1], an[2]], M.punktBand);
      });
      var mat0 = '/' + cfg.name + '/Materialien/';
      var mesh = function (name, Pt, Ix, mat, st) {
        var t = '    def Mesh "' + name + '"\n    {\n        uniform bool doubleSided = 1\n        int[] faceVertexCounts = [' + new Array(Ix.length / 3).fill(3).join(', ') + ']\n        int[] faceVertexIndices = [' + Ix.join(', ') + ']\n        point3f[] points = [' + Pt.join(', ') + ']\n';
        if (st) t += '        texCoord2f[] primvars:st = [' + st.join(', ') + '] (\n            interpolation = "vertex"\n        )\n';
        return t + '        uniform token subdivisionScheme = "none"\n        rel material:binding = <' + mat0 + mat + '>\n    }\n';
      };
      var mats = '        def Material "Schild"\n        {\n            token outputs:surface.connect = <' + mat0 + 'Schild/Oberflaeche.outputs:surface>\n' +
        '            def Shader "Oberflaeche"\n            {\n                uniform token info:id = "UsdPreviewSurface"\n                color3f inputs:diffuseColor = (0, 0, 0)\n' +
        '                color3f inputs:emissiveColor.connect = <' + mat0 + 'Schild/Bild.outputs:rgb>\n                float inputs:opacity.connect = <' + mat0 + 'Schild/Bild.outputs:a>\n' +
        '                float inputs:roughness = 1\n                float inputs:metallic = 0\n                token outputs:surface\n            }\n' +
        '            def Shader "Uv"\n            {\n                uniform token info:id = "UsdPrimvarReader_float2"\n                token inputs:varname = "st"\n                float2 inputs:fallback = (0, 0)\n                float2 outputs:result\n            }\n' +
        '            def Shader "Bild"\n            {\n                uniform token info:id = "UsdUVTexture"\n                asset inputs:file = @beschriftung.png@\n                float2 inputs:st.connect = <' + mat0 + 'Schild/Uv.outputs:result>\n' +
        '                token inputs:sourceColorSpace = "sRGB"\n                token inputs:wrapS = "clamp"\n                token inputs:wrapT = "clamp"\n                float3 outputs:rgb\n                float outputs:a\n            }\n        }\n' +
        '        def Material "Linie"\n        {\n            token outputs:surface.connect = <' + mat0 + 'Linie/Oberflaeche.outputs:surface>\n' +
        '            def Shader "Oberflaeche"\n            {\n                uniform token info:id = "UsdPreviewSurface"\n                color3f inputs:diffuseColor = (0.878, 0.663, 0.290)\n                color3f inputs:emissiveColor = (0.6, 0.45, 0.2)\n' +
        '                float inputs:roughness = 1\n                float inputs:metallic = 0\n                token outputs:surface\n            }\n        }\n';
      return { mats: mats, meshes: mesh('Schilder', P, I, 'Schild', ST) + mesh('Linien', LP, LI, 'Linie'), png: png };
    };
    return S;
  };

  /* AR Quick Look oeffnen. cfg: bauen() -> Blob, link (<a rel="ar">),
     fertig (Text nach dem Oeffnen) */
  AR.quickLook = function (cfg) {
    K.toast('AR wird vorbereitet …');
    setTimeout(function () {
      try {
        var blob = cfg.bauen(), url = URL.createObjectURL(blob), a = cfg.link;
        a.setAttribute('href', url + '#allowsContentScaling=1');
        a.click();
        K.toast(cfg.fertig);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      } catch (e) { K.toast('AR konnte nicht vorbereitet werden: ' + e.message); }
    }, 60);
  };
})(Kern);
