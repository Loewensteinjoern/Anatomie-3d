/* =====================================================================
   Koerper - stilisiertes Lehrmodell eines ganzen Menschen
   Stilprobe: Hülle, Skelett und Organe als Geometrie, noch ohne
   Strukturliste, Beschriftung und Infokarten.
   Einheit cm; y oben, Fuss bei y = 0, Scheitel bei y = 175;
   x = LINKE Koerperseite (Betrachter rechts in der Vorderansicht), z = vorn.
   ===================================================================== */
(function () {
'use strict';
/* Bedienelemente (Markup), wird von aufbauen in umg.bereich eingesetzt */
var MARKUP = `<div id="title">
  <div class="kicker">K&ouml;rper &middot; Organe und Organsysteme</div>
  <h1>Der <em>Mensch</em></h1>
  <div class="sub">Stilisiertes Lehrmodell: H&uuml;lle, Skelett und Organe.</div>
</div>`;
var organ = { renderer: {}, aufbauen: aufbauen };
function aufbauen(umg) {
var canvas = umg.canvas, renderer = umg.renderer, scene = umg.szene, camera = umg.kamera, envTex = umg.envTex;
umg.bereich.innerHTML = MARKUP;

var S = Kern.SDF;
var abgebaut = false;
var $ = function (id) { return document.getElementById(id); };
var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
var UP = new THREE.Vector3(0, 1, 0);
var PI = Math.PI;
var setLoad = function (f, t) { $('bootBar').style.width = Math.round(f * 100) + '%'; if (t) $('bootSt').textContent = t; return new Promise(function (r) { setTimeout(r, 0); }); };

/* =====================================================================
   1. Systeme, Materialien, Steuerung
   ===================================================================== */
var wurzel = new THREE.Group(); scene.add(wurzel);
var SYS = {};
['haut', 'skelett', 'nerven', 'sinne', 'hormon', 'kreislauf', 'atmung', 'verdauung', 'harn'].forEach(function (n) {
  var g = new THREE.Group(); g.name = n; wurzel.add(g);
  SYS[n] = { grp: g, mats: [], modus: 'an' };
});

/* Gewebematerial eines Systems; o.opacity = Grundzustand, 'glas' setzt darunter */
function mat(sys, hex, o) {
  o = o || {};
  var m = Kern.mat(hex, o, envTex);
  m.userData.op0 = m.opacity; m.userData.tr0 = m.transparent; m.userData.dw0 = m.depthWrite;
  SYS[sys].mats.push(m);
  return m;
}

/* Glasartiges Material (Mitte durchsichtig, Kanten dichter, wie glassify im Herz);
   u.value skaliert die Deckkraft (1 = an, kleiner = glas) */
function glasMat(sys, hex, a0, a1, ex) {
  ex = ex || 2.2;
  var m = Kern.mat(hex, { rough: 0.45, coat: 0.3, env: 0.4 }, envTex);
  m.transparent = true; m.opacity = 1; m.depthWrite = false;
  var u = { value: 1 };
  m.userData.gu = u;
  m.onBeforeCompile = function (sh) {
    sh.uniforms.uKoerperGlas = u;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uKoerperGlas;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' +
        'float frg = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));\n' +
        'gl_FragColor.a *= uKoerperGlas * mix(' + a0.toFixed(3) + ', ' + a1.toFixed(3) + ', pow(frg, ' + ex.toFixed(2) + '));');
  };
  m.customProgramCacheKey = function () { return 'koerperGlas' + a0 + '_' + a1 + '_' + ex; };
  SYS[sys].mats.push(m);
  return m;
}

/* Darstellung eines Systems: 'an' | 'glas' | 'aus' (gemerkt pro System) */
function modus(sys, m) {
  var s = SYS[sys];
  if (!s || (m !== 'an' && m !== 'glas' && m !== 'aus')) return;
  s.modus = m;
  s.grp.visible = m !== 'aus';
  s.mats.forEach(function (x) {
    if (x.userData.gu) { x.userData.gu.value = m === 'glas' ? 0.35 : 1; return; }
    if (m === 'glas') { x.transparent = true; x.opacity = 0.38; x.depthWrite = false; }
    else { x.transparent = x.userData.tr0; x.opacity = x.userData.op0; x.depthWrite = x.userData.dw0; }
  });
}

function dazu(sys, mesh) {
  mesh.renderOrder = sys === 'haut' ? 10 : (mesh.material.userData.gu ? 5 : 2);
  SYS[sys].grp.add(mesh);
  return mesh;
}

/* =====================================================================
   2. Geometrie-Bausteine (three.js-Koerper)
   ===================================================================== */
var sphG = new THREE.SphereGeometry(1, 22, 14);
function kugelM(sys, m, x, y, z, r) {
  var o = new THREE.Mesh(sphG, m); o.position.set(x, y, z); o.scale.setScalar(r); return dazu(sys, o);
}
function ellM(sys, m, x, y, z, rx, ry, rz, rot) {
  var o = new THREE.Mesh(sphG, m); o.position.set(x, y, z); o.scale.set(rx, ry, rz);
  if (rot) o.rotation.set(rot[0], rot[1], rot[2]);
  return dazu(sys, o);
}
/* Ellipsoid, dessen lange Achse von a nach b laeuft (rx, rz = Halbmasse quer) */
function ellAchse(sys, m, a, b, rx, rz) {
  var d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  var o = new THREE.Mesh(sphG, m);
  o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  o.quaternion.setFromUnitVectors(UP, d.normalize());
  o.scale.set(rx, L / 2, rz);
  return dazu(sys, o);
}
/* Stab von a nach b (Radius r0 bei a, r1 bei b); rund = Kugelenden */
function stab(sys, m, a, b, r0, r1, rund) {
  var d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  var o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, 12, 1), m);
  o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  o.quaternion.setFromUnitVectors(UP, d.normalize());
  dazu(sys, o);
  if (rund) { kugelM(sys, m, a[0], a[1], a[2], r0); kugelM(sys, m, b[0], b[1], b[2], r1); }
  return o;
}
/* Rohr entlang einer glatten Kurve durch pts (Arrays [x,y,z]) */
function rohr(sys, m, pts, r, seg, rund) {
  var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5);
  var o = new THREE.Mesh(new THREE.TubeGeometry(c, seg || Math.max(8, pts.length * 8), r, 8, false), m);
  dazu(sys, o);
  if (rund !== false) {
    var a = pts[0], b = pts[pts.length - 1];
    kugelM(sys, m, a[0], a[1], a[2], r); kugelM(sys, m, b[0], b[1], b[2], r);
  }
  return o;
}
/* Verlauf mit glatter Zwischenstufe: Tabelle [[y, wert], ...] aufsteigend */
function interp(t, y) {
  if (y <= t[0][0]) return t[0][1];
  for (var i = 1; i < t.length; i++) if (y <= t[i][0]) {
    var f = (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]); f = f * f * (3 - 2 * f);
    return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * f;
  }
  return t[t.length - 1][1];
}

/* Organ aus einem Abstandsfeld: Gitter ueber bounds mit Weite h */
async function sdfMesh(sys, m, fn, bounds, h, fortschritt) {
  var G = S.makeGrid(bounds, h);
  var F = await S.evalFeld(G, fn, fortschritt);
  if (abgebaut) return null;
  var o = new THREE.Mesh(S.geometrie(G, F), m);
  return dazu(sys, o);
}

/* =====================================================================
   3. Koerperhuelle (Abstandsfeld)
   ===================================================================== */
var AXT = [[84, 16], [92, 17.2], [100, 16], [106, 15.5], [114, 16.2], [124, 17], [134, 17.2], [141, 15], [146, 8]];
var AZT = [[84, 10.6], [92, 11.6], [100, 11], [106, 11], [114, 11.8], [124, 12.6], [134, 11.8], [141, 8.8], [146, 5]];
var ell = S.ellipsoid, kap = S.kapsel, smin = S.smin;
function huelle(x, y, z) {
  var sx = x < 0 ? -x : x, d;
  /* Teile nur dort auswerten, wo sie die Huelle noch beeinflussen koennen */
  if (y > 72 && y < 150) {
    var yy = y < 84 ? 84 : y > 146 ? 146 : y;
    var ax = interp(AXT, yy), az = interp(AZT, yy), dz = z - 0.3;
    d = (Math.sqrt(sx * sx / (ax * ax) + dz * dz / (az * az)) - 1) * az;
    d = Math.max(d, y - 146, 84 - y);
  } else d = 1e3;
  if (y > 128) {
    d = smin(d, ell(sx, y, z, 0, 164, 0.5, 7.8, 11.4, 9.8), 6);          // Kopf
    d = smin(d, ell(sx, y, z, 0, 157.5, 2.6, 6.2, 6.6, 7.6), 4);         // Gesicht/Kiefer
    d = smin(d, kap(sx, y, z, 0, 141, -2, 0, 154, -1.6, 5.8, 5.4), 4);   // Hals
  }
  if (y > 60 && y < 152) {
    d = smin(d, kap(sx, y, z, 0, 141.5, 0, 19.5, 141, 0, 6.4, 5.2), 5);  // Schultern
    d = smin(d, kap(sx, y, z, 19.5, 141, 0, 27, 110.9, 0, 5.2, 4.1), 3); // Oberarm
    d = smin(d, kap(sx, y, z, 27, 110.9, 0, 33.5, 86.8, 0.5, 4.1, 2.8), 2);   // Unterarm
    var hd = kap(sx, y, z * 2.2, 33.5, 86.8, 1.1, 37.6, 69.5, 1.1, 4.2, 2.4);  // flache Hand
    d = smin(d, hd / 1.6, 1.5);
    d = smin(d, kap(sx, y, z * 1.8, 35.2, 83.5, 1.6, 40.6, 77.0, 2.2, 1.7, 1.2) / 1.4, 1.2);   // Daumen
  }
  if (y < 106) {
    d = smin(d, ell(sx, y, z, 0, 88.5, 0, 15.8, 10.5, 10.6), 5);         // Becken
    d = smin(d, ell(sx, y, z, 7, 86, -6.5, 7.5, 8, 5.5), 5);             // Gesaess
    d = smin(d, kap(sx, y, z, 9.5, 87, 0.3, 11, 49, 0.5, 8.4, 5.4), 4);  // Oberschenkel
    d = smin(d, kap(sx, y, z, 11, 49, 0.5, 13.5, 8, 0.3, 5.4, 3.6), 3);  // Unterschenkel
    d = smin(d, ell(sx, y, z, 12.2, 39, -2.8, 5.0, 10.5, 6.0), 3);       // Wade
    d = smin(d, kap(sx, y, z, 13.5, 8, 0.3, 14, 4, 1.0, 3.6, 3.2), 2);   // Knoechel
    var fu = smin(S.box(sx, y, z, 14.3, 2.8, 4.8, 3.4, 2.8, 9.3, 2.2), ell(sx, y, z, 13.8, 4.6, -2.4, 3.5, 4.4, 3.5), 2.5);   // Fuss mit Ferse
    fu = S.smax(fu, -ell(sx, y, z, 11.6, 0.4, 3.6, 2.4, 1.8, 5.2), 1);  // Fusswoelbung innen
    d = smin(d, fu, 2);
  }
  return d;
}

/* =====================================================================
   4. Skelett
   ===================================================================== */
var ZST = [[82, -7.5], [92, -4.8], [100, -4.2], [110, -5.8], [120, -7.5], [130, -7.6], [142, -6.2], [150, -4.5]];
var RWT = [[100, 2.7], [114, 2.5], [117, 2.0], [140, 1.8], [143, 1.5], [150, 1.35]];
function zst(y) { return interp(ZST, y); }
function zSternum(y) { return 4.3 + (143 - y) * 0.31; }

function skelett() {
  var kn = mat('skelett', 0xE6DCC6, { rough: 0.8, env: 0.2 });
  var sk = 'skelett';
  var knD = mat(sk, 0xE6DCC6, { rough: 0.8, env: 0.2, side: THREE.DoubleSide });
  /* Schaedel: gläsern, damit das Gehirn sichtbar bleibt */
  var sch = glasMat(sk, 0xE6DCC6, 0.2, 0.85);
  ellM(sk, sch, 0, 164.6, 0.3, 6.9, 10.2, 8.6);
  ellM(sk, sch, 0, 156.8, 3.6, 4.6, 4.2, 4.8);
  /* Augenhoehlen, Jochbeine, Nasenwurzel */
  [-1, 1].forEach(function (s) {
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.38, 8, 20), kn); o.position.set(s * 3.4, 161.8, 7.7); o.rotation.y = s * 0.25; dazu(sk, o);
    rohr(sk, kn, [[s * 5.2, 161, 6.2], [s * 6.2, 159.5, 3.8], [s * 6.4, 159.5, 0.5]], 0.5, 12);
    kugelM(sk, kn, s * 4.6, 158.4, 6.6, 1.0);
  });
  ellM(sk, kn, 0, 160.6, 8.1, 0.8, 1.5, 0.6);
  /* Unterkiefer: Bogen */
  rohr(sk, kn, [[-5.6, 159, -1.8], [-5.0, 154.5, 1.8], [-2.6, 152.6, 5.0], [0, 152.0, 6.0], [2.6, 152.6, 5.0], [5.0, 154.5, 1.8], [5.6, 159, -1.8]], 0.8, 40);
  /* Wirbelsaeule: 7 + 12 + 5 Wirbelkoerper, Kreuz- und Steissbein */
  var wy = [], i;
  for (i = 0; i < 7; i++) wy.push([150 - i * 1.4, 0.95]);
  for (i = 0; i < 12; i++) wy.push([140 - i * 2.1, 1.5]);
  for (i = 0; i < 5; i++) wy.push([114 - i * 3.1, 2.2]);
  wy.forEach(function (w) {
    var y = w[0], z = zst(y), r = interp(RWT, y), hh = w[1] / 2;
    stab(sk, kn, [0, y + hh, z], [0, y - hh, z], r, r, false);
    var lang = y > 140 ? 1.6 : y > 115 ? 2.4 : 2.2;
    stab(sk, kn, [0, y, z - r + 0.2], [0, y - (y > 115 ? 1.3 : 0.4), z - r - lang], 0.5, 0.4, true);
  });
  stab(sk, kn, [0, 99.5, zst(99.5)], [0, 84, -7.6], 3.6, 1.5, true);
  stab(sk, kn, [0, 84, -7.6], [0, 80.4, -6.2], 0.9, 0.4, true);
  /* Brustkorb: 12 Rippenpaare */
  var R = [[5.6, 141.0, 1.5, 3.6], [8.4, 136.6, 3.5, 5.6], [10.6, 132.0, 5.5, 7.6], [12.2, 129.6, 7.5, 8.8], [13.2, 127.6, 9, 9.8],
    [13.9, 125.9, 10.2, 10.4], [14.3, 124.6, 11, 10.8], [14.4, 123.6, 8, 9.4], [14.2, 123.0, 8, 10.8], [13.8, 122.6, 7, 11.8],
    [13.0, 109.5, 1.5, 0, 2.1, 7.0], [12.0, 108.5, 1, 0, 1.8, 5.0]];
  var knorpel = mat(sk, 0xD5DDE3, { rough: 0.7, env: 0.25 }), enden = [];
  R.forEach(function (r, i) {
    var yb = 141.5 - 2.15 * i, a = r[0], yf = r[1], sag = r[2];
    var yfb = i < 7 ? yf - [0.8, 1.8, 2.8, 3.6, 4.4, 5.2, 6.0][i] : i < 10 ? [114.5, 112, 110.5][i - 7] : yf;   /* Knochenende: Knorpel steigt zum Brustbein an */
    var te = r[4] !== undefined ? r[4] : PI - Math.asin(r[3] / a);
    var zb = zst(yb) + 0.2, zf = r[5] !== undefined ? r[5] : zSternum(yf);
    var b = (zf - zb) / (1 + Math.abs(Math.cos(te))), zc = zb + b * Math.cos(0.12);
    [-1, 1].forEach(function (s) {
      var pts = [], n = 26;
      for (var k = 0; k <= n; k++) {
        var t = k / n, th = 0.12 + (te - 0.12) * t;
        pts.push([s * a * Math.sin(th), yb + (yfb - yb) * t * t - sag * Math.sin(PI * t), zc - b * Math.cos(th)]);
      }
      rohr(sk, kn, pts, 0.5, 40);
      var e = pts[n], ziel;
      (enden[i] = enden[i] || {})[s] = e;
      if (i < 7) ziel = [s * 1.2, yf, zSternum(yf) - 0.1];
      else if (i === 7) ziel = [s * 1.0, 123.6, zSternum(123.6) - 0.1];
      else if (i < 10) ziel = enden[i - 1][s];
      if (ziel) rohr(sk, knorpel, [e, ziel], 0.45, 8);
    });
  });
  /* Brustbein: Griff, Koerper, Schwertfortsatz als flache, sich verjuengende Form */
  var tilt = Math.atan((zSternum(125) - zSternum(143)) / 18);
  var sh = new THREE.Shape();
  [[-2.1, 0], [2.1, 0], [1.6, -4.8], [1.9, -6.4], [1.2, -17.4], [0.6, -18.0], [0, -20.6], [-0.6, -18.0], [-1.2, -17.4], [-1.9, -6.4], [-1.6, -4.8]].forEach(function (q, i) {
    if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]);
  });
  var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2 });
  sg.translate(0, 0, -0.4);
  var so = new THREE.Mesh(sg, kn); so.position.set(0, 143, zSternum(143)); so.rotation.x = -tilt; dazu(sk, so);
  [-1, 1].forEach(function (s) {
    /* Schluesselbein, Schulterblatt */
    rohr(sk, kn, [[s * 1.6, 142.2, 4.6], [s * 7, 143.3, 6.0], [s * 13, 143.4, 4.2], [s * 18.5, 141.6, 0.5]], 0.75, 30);
    ellM(sk, kn, s * 11.5, 131, -8.8, 4.2, 6.5, 0.6, [0.1, s * 0.2, s * 0.12]);
    /* Arm */
    kugelM(sk, kn, s * 18.8, 140, 0, 2.0);
    stab(sk, kn, [s * 18.8, 140, 0], [s * 27, 110.9, 0], 1.4, 1.2, true);
    stab(sk, kn, [s * 26.8, 110.9, -0.9], [s * 33.0, 86.8, -0.5], 0.8, 0.6, true);
    stab(sk, kn, [s * 28.0, 110.9, 0.4], [s * 34.5, 86.8, 0.4], 0.65, 0.85, true);
    ellAchse(sk, kn, [s * 33.6, 87.2, 0.5], [s * 34.9, 82.8, 0.5], 2.8, 1.2);       // Handwurzel
    [-2.4, -0.8, 0.8, 2.4].forEach(function (o, k) {                                // Mittelhand und Finger
      var ax = [0.231, -0.973], px = [0.973, 0.231], le = [12.0, 13.4, 12.8, 11.0][k];
      stab(sk, kn, [s * (34.9 + 4.2 * ax[0] + o * px[0]), 82.8 + 4.2 * ax[1] + o * px[1], 0.5], [s * (34.9 + le * ax[0] + o * 1.15 * px[0]), 82.8 + le * ax[1] + o * 1.15 * px[1], 0.5], 0.4, 0.3, true);
    });
    stab(sk, kn, [s * 35.2, 83.6, 1.0], [s * 40.4, 77.2, 1.6], 0.5, 0.35, true);     // Daumen
    /* Becken */
    var il = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, PI, PI, 0, PI * 0.62), knD);   // Darmbeinschale, nach vorn offen
    il.position.set(s * 9.4, 98.2, -1.0); il.scale.set(6.2, 8.0, 6.2); il.rotation.y = -s * 0.35; dazu(sk, il);
    ellM(sk, kn, 0, 82.6, 6.3, 1.4, 1.2, 0.7);
    kugelM(sk, kn, s * 8.5, 88.5, 0.3, 2.4);
    rohr(sk, kn, [[s * 9, 93, -1], [s * 8.8, 90, -0.2], [s * 8.5, 88, 0.5]], 1.2, 12);
    rohr(sk, kn, [[s * 8, 86, 0.8], [s * 5.8, 82.5, 5.2], [s * 1.0, 82.3, 6.0]], 0.9, 20);
    rohr(sk, kn, [[s * 8.2, 86.5, -1.0], [s * 7.5, 81.5, -3.2]], 1.0, 10);
    kugelM(sk, kn, s * 7.4, 80.8, -3.6, 1.5);
    /* Bein */
    rohr(sk, kn, [[s * 8.5, 89, 0.3], [s * 9.5, 75, 1.2], [s * 10.3, 62, 1.5], [s * 10.8, 50, 0.9]], 1.5, 24);
    kugelM(sk, kn, s * 11.0, 48.8, 1.0, 2.5);
    ellM(sk, kn, s * 11.3, 48.5, 5.0, 1.6, 1.9, 0.8);
    stab(sk, kn, [s * 11.2, 47.5, 0.8], [s * 13.4, 9.2, 0.3], 1.4, 1.7, true);
    stab(sk, kn, [s * 13.2, 46.5, -1.0], [s * 15.8, 9.5, -1.0], 0.6, 0.7, true);
    /* Fuss */
    ellM(sk, kn, s * 13.6, 7.0, 0.3, 2.4, 2.0, 2.8);                   // Sprungbein
    ellM(sk, kn, s * 13.8, 4.0, -2.4, 2.2, 2.5, 2.8);                  // Ferse
    ellM(sk, kn, s * 14.3, 2.7, 5.6, 3.0, 1.3, 8.6, [0.05, 0, 0]);     // Fusswurzel und Mittelfuss
  });
}

/* =====================================================================
   5. Organe
   ===================================================================== */
/* Zwerchfellkuppel: Hoehe der Flaeche ueber (x,z); xc = Mitte der Kuppel */
function domY(x, z, xc, ytop) {
  var u = (x - xc) / 9.5, v = (z - 0.5) / 10.5;
  return ytop - 16 * (u * u + v * v);
}

var DOM_R = 118, DOM_L = 115.5;
/* Herz aus dem Herz-Modell: Verschiebung (Herz-Koordinaten -> Koerper) und Abtaster der Herzform (fuer die Lungenbucht); leer = einfaches Ersatzherz */
var HERZ_V = [2.0, 122.5, 2.4], herzSmp = null, herzP = null;

function sdfHerz(x, y, z) {
  /* gerundeter Kegel: Basis oben-rechts-hinten, stumpfe Spitze links unten, Dicke ca. 6 cm (z gestaucht) */
  var zz = 2.8 + (z - 2.8) * 1.45;
  var d = kap(x, y, zz, 3.1, 123.6, 2.8, 6.3, 119.9, 3.3, 4.5, 2.7) / 1.25;
  d = smin(d, ell(x, y, z, 0.2, 125.6, 1.6, 3.4, 3.0, 2.6), 2);      // Vorhoefe
  d = smin(d, ell(x, y, z, -0.6, 121.6, 3.2, 2.6, 3.6, 2.4), 1.6);   // rechter Rand (rechter Vorhof/Kammer)
  return d;
}
function sdfLunge(s) {
  var cx = s * 8.4, ytop = s < 0 ? DOM_R : DOM_L, xc = s * 6.5;
  var rx = s < 0 ? 5.2 : 4.9;
  return function (x, y, z) {
    var d = ell(x, y, z, cx, 125, -0.8, rx, 19, 7.8);
    d = Math.max(d, 0.4 * (domY(x, z, xc, ytop) + 0.5 - y));
    if (herzSmp) {
      d = S.smax(d, -(herzSmp.val(x - HERZ_V[0], y - HERZ_V[1], z - HERZ_V[2]) - 0.4), 0.8);   // Herzbucht nach der Form des Herzens
      if (s > 0) d = S.smax(d, -kap(x, y, z, 4.7, 127, -3.2, 3.8, 110, -2.6, 2.1), 0.8);       // Aortenrinne
    } else if (s > 0) {
      d = S.smax(d, -ell(x, y, z, 4.6, 120.5, 2.8, 6.4, 8.0, 5.2), 1);          // Herzbucht
      d = S.smax(d, -kap(x, y, z, 5.1, 134, -4.1, 3.8, 110, -2.6, 2.1), 0.8);  // Aortenrinne
    }
    /* Lappengrenzen: flache Furchen */
    var sc = Math.max(Math.abs(0.515 * (y - 123) + 0.857 * z) - 0.5, -(d + 2.0));
    d = Math.max(d, -sc);
    if (s < 0) {
      var sh = Math.max(Math.abs(y - 129.5) - 0.5, -(d + 2.0), 1 - z);
      d = Math.max(d, -sh);
    }
    return d;
  };
}
function sdfLeber(x, y, z) {
  var d = ell(x, y, z, -4.0, 109.8, 0.8, 9.0, 8.4, 7.0);             // rechter Lappen
  d = smin(d, ell(x, y, z, 2.6, 111.6, 3.4, 7.4, 4.0, 4.6), 4);       // linker Lappen, duenn auslaufend
  d = Math.max(d, 0.4 * (y - (domY(x, z, -6.5, DOM_R) - 0.6)));         // Oberseite folgt der Kuppel
  return Math.max(d, -(y - 100.2 - 0.5 * (x + 12)) * 0.89);            // schraeger, scharfer Unterrand
}
function sdfMagen(x, y, z) {
  var d = ell(x, y, z, 7.8, 109.6, -1.8, 5.0, 4.6, 4.6);                  // Fundus unter der linken Kuppel
  d = smin(d, kap(x, y, z, 7.6, 108, -1.4, 6.6, 101.6, 1.0, 4.4, 4.2), 3);    // Korpus
  d = smin(d, kap(x, y, z, 6.6, 101.6, 1.0, 2.5, 100.2, 3.0, 4.2, 3.0), 3);   // grosse Kurvatur unten
  d = smin(d, kap(x, y, z, 2.5, 100.2, 3.0, -2.0, 104.0, 3.2, 3.0, 1.7), 2);  // Antrum steigt zum Pfoertner
  return d;
}
function sdfNiere(s) {
  var cx = s * 7.5, cy = s > 0 ? 105 : 102.5;
  return function (x, y, z) {
    var d = ell(x, y, z, cx, cy, -6.2, 2.7, 5.6, 2.3);
    return S.smax(d, -S.kugel(x, y, z, cx - s * 2.8, cy, -6.2, 1.5), 1.0);
  };
}
function sdfHirn(x, y, z) {
  var sx = x < 0 ? -x : x;
  var d = ell(sx, y, z, 2.6, 167.6, -1.6, 4.0, 5.8, 6.6);
  d = smin(d, ell(sx, y, z, 0, 159.6, -6.4, 3.8, 2.3, 2.8), 1.2);
  d = smin(d, kap(sx, y, z, 0, 160.5, -3.6, 0, 152, -4.2, 1.3, 1.0), 1.5);
  return d + 0.2 * Math.sin(2.6 * x + 0.7) * Math.sin(2.5 * y) * Math.sin(2.7 * z + 1.3);
}
/* Zwerchfell: dünne Kuppelfläche (zwei Kuppeln, Rand an den unteren Rippen) */
function zwerchfellGeo() {
  var g = new THREE.RingGeometry(0.02, 1, 56, 18), p = g.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var rx = p.getX(i), rz = p.getY(i);
    var x = 13.0 * rx, z = 0.6 + 9.4 * rz;
    var yd = Math.max(domY(x, z, -6.5, DOM_R), domY(x, z, 6.5, DOM_L));
    p.setXYZ(i, x, S.smax(yd, 106.5, 7), z);
  }
  g.computeVertexNormals();
  return g;
}
function sdfPankreas(x, y, z) {
  var d = kap(x, y, z, -4.5, 99, -1.2, -1, 100.2, -2.8, 2.3, 1.7);
  d = smin(d, kap(x, y, z, -1, 100.2, -2.8, 3.5, 102.2, -3.4, 1.7, 1.5), 1.5);
  return smin(d, kap(x, y, z, 3.5, 102.2, -3.4, 9.5, 105.5, -4.4, 1.5, 1.2), 1.5);
}
function sdfBlase(x, y, z) { return ell(x, y, z, 0, 83, 2.8, 3.2, 3.6, 3.0); }
function sdfGalle(x, y, z) { return smin(ell(x, y, z, -6.4, 101.0, 6.2, 1.5, 3.0, 1.5), kap(x, y, z, -6.0, 99, 5.6, -4.6, 97, 4.6, 0.35, 0.3), 0.6); }

/* Herz aus den Formbausteinen des Herz-Modells: ganzes Herz geschlossen (nur die Aussenform samt Gefaessstuempfen),
   Farben pro Vertex wie dort; keine Klappen, Faeden, Leitungsbahnen. Gibt das Mesh zurueck (noch nicht eingebaut). */
async function herzBauen(form, h) {
  var HS = form.sdf, C2 = {};
  var G = form.mesher.makeGrid([[-6.4, -6.6, -7.0], [6.6, 9.9, 3.7]], h);
  var T = await form.mesher.evalTissue(G, function (x, y, z) { HS.tissue(x, y, z, C2); return C2.outer; });
  if (abgebaut) return null;
  var smp = form.assemble.makeSampler(G, T);
  var P = form.mesher.surfaceNets(G, T), pos = P.positions, nv = pos.length / 3, col = new Float32Array(nv * 3);
  for (var v = 0; v < nv; v++) {
    var x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    var r = HS.classify(x, y, z);
    var c = form.assemble.colorFor(r, false, 0, HS.C, x, y, z);
    col[v * 3] = c[0]; col[v * 3 + 1] = c[1]; col[v * 3 + 2] = c[2];
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(P.index, 1));
  g.computeVertexNormals();
  var mesh = new THREE.Mesh(g, mat('kreislauf', 0xffffff, { vc: true, rough: 0.55, coat: 0.25, env: 0.3 }));
  mesh.position.set(HERZ_V[0], HERZ_V[1], HERZ_V[2]);
  /* Herzkranzgefaesse (Rohre auf der Oberflaeche) */
  var km = mat('kreislauf', 0xB02A22, { rough: 0.45, coat: 0.4, env: 0.3 });
  form.extras.coronaries().forEach(function (cr) {
    var curve = new THREE.CatmullRomCurve3(cr.pts.map(function (q) { return V(q[0], q[1], q[2]); }));
    var segs = Math.max(4, Math.round(cr.pts.length * 2.2)), rs = 7;
    var tg = new THREE.TubeGeometry(curve, segs, 1, rs, false), tp = tg.attributes.position, tn = tg.attributes.normal;
    for (var i = 0; i <= segs; i++) {
      var t = i / segs, rr = cr.r0 + (cr.r1 - cr.r0) * t, cp = curve.getPointAt(t);
      for (var k = 0; k <= rs; k++) { var id = i * (rs + 1) + k; tp.setXYZ(id, cp.x + tn.getX(id) * rr, cp.y + tn.getY(id) * rr, cp.z + tn.getZ(id) * rr); }
    }
    var tm = new THREE.Mesh(tg, km); tm.renderOrder = 2; mesh.add(tm);
  });
  return { mesh: mesh, smp: smp };
}

async function organe() {
  var b = function (x0, y0, z0, x1, y1, z1) { return [[x0, y0, z0], [x1, y1, z1]]; };
  var n = 0, N = 17;
  var weiter = function (t) { return setLoad(0.58 + 0.42 * (++n) / N, t); };
  var h = 0.6;
  /* Nerven */
  await sdfMesh('nerven', mat('nerven', 0xE2C25A, { rough: 0.55, coat: 0.3 }), sdfHirn, b(-8.5, 149, -10.5, 8.5, 176, 9), 0.5);
  if (abgebaut) return; await weiter('Gehirn');
  var zrd = [];
  for (var y = 150; y >= 100; y -= 7) zrd.push([0, y, zst(y) - interp(RWT, y) - 1.0]);
  rohr('nerven', mat('nerven', 0xE2C25A, { rough: 0.5 }), zrd, 0.5, 40);
  /* Sinne */
  var aw = mat('sinne', 0xEDE6DA, { rough: 0.3, coat: 0.6 }), ir = mat('sinne', 0x3D6FA8, { rough: 0.3, coat: 0.5 }), pu = mat('sinne', 0x111111, { rough: 0.4 });
  [-1, 1].forEach(function (s) {
    kugelM('sinne', aw, s * 3.4, 161.8, 7.1, 1.25);
    ellM('sinne', ir, s * 3.4, 161.8, 8.15, 0.78, 0.78, 0.28);
    ellM('sinne', pu, s * 3.4, 161.8, 8.4, 0.34, 0.34, 0.12);
  });
  /* Hormon */
  var th = mat('hormon', 0x9C7BC6, { rough: 0.5, coat: 0.3 });
  [-1, 1].forEach(function (s) { ellM('hormon', th, s * 2.1, 145.2, 1.8, 1.3, 2.3, 1.1, [0, 0, s * 0.15]); });
  ellM('hormon', th, 0, 144.2, 2.2, 1.7, 0.6, 0.8);
  /* Kreislauf */
  var rot = mat('kreislauf', 0xC9483A, { rough: 0.45, coat: 0.5 }), blau = mat('kreislauf', 0x4F70B8, { rough: 0.45, coat: 0.4 });
  var hz = null, hform = await herzP;
  if (hform) {
    try { hz = await herzBauen(hform, klein ? 0.3 : 0.2); } catch (e) { console.warn('Herz-Modell konnte nicht eingebaut werden, einfaches Herz als Ersatz:', e); }
  } else console.warn('Herz-Modell nicht geladen, einfaches Herz als Ersatz.');
  if (abgebaut) return;
  var iliaka = function (s) { rohr('kreislauf', rot, [[1.8, 94, 0.2], [s * 4, 88.5, -1.0], [s * 6.5, 84.5, 0.5]], 0.7, 14); };
  if (hz) {
    dazu('kreislauf', hz.mesh); herzSmp = hz.smp;
    await weiter('Herz');
    /* Anschluss an die Gefaessstuempfe des Herzens (Herz-Koordinaten + HERZ_V) */
    rohr('kreislauf', rot, [[4.5, 125.2, -3.1], [4.9, 121, -3.9], [5.0, 118, -3.9], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]], 1.25, 80);
    [-1, 1].forEach(iliaka);
    rohr('kreislauf', rot, [[2.3, 130.2, 0.45], [2.5, 136, -0.4], [2.9, 143, -1.6], [3.0, 152, -1.8]], 0.55, 20);     // linke Halsschlagader
    rohr('kreislauf', rot, [[0.35, 130.2, 1.4], [-1.0, 135, 0.6], [-2.6, 143, -1.6], [-3.0, 152, -1.8]], 0.55, 20);   // rechte Halsschlagader
    rohr('kreislauf', rot, [[3.7, 130.2, -0.7], [7, 133, -0.5], [12, 138.5, 0.8]], 0.6, 14);                          // linke Schluesselbeinarterie
    rohr('kreislauf', rot, [[0.35, 130.2, 1.4], [-4, 133.2, 1.0], [-12, 138.5, 0.8]], 0.6, 14);                        // rechte Schluesselbeinarterie
    rohr('kreislauf', blau, [[-1.65, 130.1, 1.6], [-1.9, 134, 0.9], [-2.1, 141, -0.2]], 1.0, 14);                      // obere Hohlvene nach oben
    rohr('kreislauf', blau, [[-1.65, 119.2, 0.65], [-1.9, 115, -0.3], [-2.2, 106, -2.2], [-2.4, 98, -2.4], [-2.0, 92, -1.6]], 1.1, 30);   // untere Hohlvene nach unten
    rohr('kreislauf', mat('kreislauf', 0x4F6CBF, { rough: 0.45, coat: 0.4 }), [[-2.3, 127.4, -1.15], [-5.5, 126.9, -1.6]], 0.9, 10);      // rechte Lungenarterie bis zum Hilus
    var pvm = mat('kreislauf', 0xC04C43, { rough: 0.45, coat: 0.4 });
    rohr('kreislauf', pvm, [[1.7, 126, -1.55], [-1.5, 125.4, -1.9], [-5.6, 123.8, -1.9]], 0.62, 16);                    // rechte Lungenvenen
    rohr('kreislauf', pvm, [[1.7, 124.1, -1.6], [-1.2, 124.3, -2.0]], 0.62, 10);
  } else {
    await sdfMesh('kreislauf', rot, sdfHerz, b(-6, 108, -3, 14, 132, 10), h);
    if (abgebaut) return; await weiter('Herz');
    rohr('kreislauf', rot, [[2.6, 122.5, 1.4], [2.6, 127, 1.0], [2.2, 132, 0.4], [1.6, 135.6, -0.8], [2.8, 135.8, -2.4], [4.4, 133.8, -3.8],
      [5.2, 129.5, -4.3], [5.2, 124, -4.2], [5.0, 118, -3.6], [4.4, 110, -2.6], [3.2, 102, -0.8], [1.8, 94, 0.2]], 1.25, 80);
    [-1, 1].forEach(function (s) {
      iliaka(s);
      rohr('kreislauf', rot, [[s * 2.4, 135.4, -0.6], [s * 2.8, 143, -1.6], [s * 3.0, 152, -1.8]], 0.55, 20);
    });
    rohr('kreislauf', blau, [[-1.3, 129, 2.2], [-1.8, 135, 1.0], [-2.0, 141, -0.2]], 1.0, 14);
    rohr('kreislauf', blau, [[-1.0, 118.5, 1.6], [-1.6, 112, -0.5], [-2.2, 106, -2.2], [-2.4, 98, -2.4], [-2.0, 92, -1.6]], 1.1, 30);
  }
  /* Atmung */
  var ros = mat('atmung', 0xE39AA4, { rough: 0.55, coat: 0.35, coatRough: 0.4 });
  var lu = mat('atmung', 0xE39AA4, { rough: 0.5 });
  rohr('atmung', lu, [[0, 150, -0.6], [0, 140, -1.4], [0, 134, -2.2], [0, 128.5, -3.3]], 1.0, 24);
  [-1, 1].forEach(function (s) {
    rohr('atmung', lu, [[0, 128.5, -3.3], [s * 3.2, 126, -3.3], [s * 6.2, 123, -2.5]], 0.7, 14);
    rohr('atmung', lu, [[s * 6.2, 123, -2.5], [s * 9, 127, -1.5]], 0.45, 8);
    rohr('atmung', lu, [[s * 6.2, 123, -2.5], [s * 9.5, 118, -1.0]], 0.45, 8);
  });
  var lm = mat('atmung', 0xE39AA4, { rough: 0.5, coat: 0.3, coatRough: 0.45 });
  await sdfMesh('atmung', lm, sdfLunge(-1), b(-15, 105, -10, -1.5, 146.5, 9.5), h);
  if (abgebaut) return; await weiter('Lungen');
  await sdfMesh('atmung', lm, sdfLunge(1), b(1.5, 105, -10, 15, 146.5, 9.5), h);
  if (abgebaut) return; await weiter('Lungen');
  var zw = mat('atmung', 0xB5655A, { rough: 0.6, opacity: 0.3, side: THREE.DoubleSide });
  dazu('atmung', new THREE.Mesh(zwerchfellGeo(), zw));
  await weiter('Zwerchfell');
  /* Verdauung */
  rohr('verdauung', mat('verdauung', 0xD99A8A, { rough: 0.5, coat: 0.3 }), [[0, 148, -3.0], [0, 140, -3.6], [0.3, 130, -3.6], [0.9, 122, -3.4], [1.6, 115, -2.8], [2.4, 110.5, -1.5], [3.8, 107.6, 1.0]], 0.8, 40);
  var le = mat('verdauung', 0x8B3A2E, { rough: 0.45, coat: 0.5 });
  await sdfMesh('verdauung', le, sdfLeber, b(-15, 97, -10, 14, 119, 11), h);
  if (abgebaut) return; await weiter('Leber');
  await sdfMesh('verdauung', mat('verdauung', 0xE8B48E, { rough: 0.5, coat: 0.4 }), sdfMagen, b(-6, 94, -7, 14, 115, 8), h);
  if (abgebaut) return; await weiter('Magen');
  await sdfMesh('verdauung', mat('verdauung', 0x5E9A4A, { rough: 0.4, coat: 0.5 }), sdfGalle, b(-10, 92, 0, -1, 106, 9), 0.4);
  if (abgebaut) return; await weiter('Gallenblase');
  await sdfMesh('verdauung', mat('verdauung', 0xE8C27A, { rough: 0.6 }), sdfPankreas, b(-8, 96, -8, 12, 109, 2), 0.45);
  if (abgebaut) return; await weiter('Bauchspeicheldrüse');
  rohr('verdauung', mat('verdauung', 0xE3A58C, { rough: 0.5, coat: 0.35 }), [[-2.0, 104.0, 3.2], [-3.4, 105, 1.6], [-5.8, 103.6, -0.2], [-7.0, 100, -0.8], [-6.6, 96.6, -0.8], [-3.6, 94.8, -0.6], [0, 95.6, -0.5]], 1.0, 50);
  ellM('verdauung', mat('verdauung', 0x7A2F4F, { rough: 0.5, coat: 0.4 }), 9.2, 108, -5.2, 2.3, 4.8, 3.2, [0.1, 0.2, -0.15]);
  /* Duenndarm: Schlingen in vier Lagen */
  var dd = [], r, k;
  for (r = 0; r < 4; r++) {
    var yy = 95.5 - 2.5 * r;
    for (k = 0; k <= 8; k++) {
      var t = r % 2 ? 8 - k : k;
      dd.push([-8 + 2 * t + (k % 2 ? 0.6 : -0.6), yy + (k % 2 ? 0.5 : -0.5), 3.5 + 1.8 * Math.sin(k * 1.9 + r * 1.3)]);
    }
  }
  rohr('verdauung', mat('verdauung', 0xE3A58C, { rough: 0.5, coat: 0.35 }), dd, 1.2, 420);
  /* Dickdarm: Rahmen um den Duenndarm */
  var dk = mat('verdauung', 0xB8775A, { rough: 0.55, coat: 0.3 });
  rohr('verdauung', dk, [[-11.2, 89.5, 0.5], [-11.5, 95, 0], [-11.6, 100, -0.5], [-10.8, 103.4, 0.8], [-8.5, 102, 4], [-6, 99.6, 6.4], [-1, 98.6, 7], [4, 99.6, 6.8],
    [8, 103, 4], [10.8, 106.5, -2.5], [11.8, 102, -2.6], [11.8, 95, -2.6], [11, 89.5, -2], [8.5, 86.3, 0], [5, 85.2, 1.6], [2, 86.2, 0.2], [0.6, 84, -2.4], [0.3, 81.5, -4.8], [0, 79.5, -6]], 1.8, 260);
  kugelM('verdauung', dk, -11.3, 89.2, 0.5, 2.4);
  /* Harn */
  var ni = mat('harn', 0x9C4A3A, { rough: 0.5, coat: 0.45 });
  await sdfMesh('harn', ni, sdfNiere(-1), b(-12, 94, -11, -3, 111, -1), 0.5);
  if (abgebaut) return; await weiter('Nieren');
  await sdfMesh('harn', ni, sdfNiere(1), b(3, 96, -11, 12, 113, -1), 0.5);
  if (abgebaut) return; await weiter('Nieren');
  var ur = mat('harn', 0xD9B44A, { rough: 0.5 });
  [-1, 1].forEach(function (s) {
    rohr('harn', ur, [[s * 5.8, 101 + (s < 0 ? -2.5 : 0), -5], [s * 5.3, 95, -4.8], [s * 5, 88, -3.5], [s * 4, 84, -0.5], [s * 2.6, 83.6, 2.4]], 0.28, 40);
  });
  await sdfMesh('harn', mat('harn', 0xD9B44A, { rough: 0.4, coat: 0.5 }), sdfBlase, b(-6, 77, -3, 6, 90, 8), 0.5);
  if (abgebaut) return; await weiter('Harnblase');
}

/* =====================================================================
   6. Aufbau
   ===================================================================== */
var t0;
var klein = Math.min(screen.width, screen.height) < 500 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.maxTouchPoints || 0) > 0;
var App = window.KoerperApp = { ready: false, aufbauMs: 0, modus: modus, ansicht: ansicht };
async function bauen() {
  await setLoad(0.02, 'Körperhülle wird geformt'); if (abgebaut) return;
  /* Herz-Modell nur als Skript nachladen (ohne Gestaltung); Fehler werden erst beim Herz-Schritt behandelt */
  herzP = Kern.organLaden('herz', { ohneCss: true }).then(function (o) { return o.form || null; }, function (e) { console.warn(e && e.message || e); return null; });
  t0 = performance.now();   /* Aufbauzeit ohne das Warten des Browsers vor dem ersten Schritt */
  var hm = glasMat('haut', 0xE0C3A8, 0.2, 0.85, 1.7);
  hm.emissive.copy(Kern.srgb(0xE0C3A8)).multiplyScalar(0.8);   /* Eigenleuchten in Hautfarbe: liest sich vor dem dunklen Grund als Haut */
  await sdfMesh('haut', hm, huelle, [[-44, -1, -17], [44, 179, 19]], klein ? 1.6 : 1.2, function (f) { return setLoad(0.02 + f * 0.4); });
  if (abgebaut) return;
  await setLoad(0.45, 'Skelett'); if (abgebaut) return;
  skelett();
  await setLoad(0.58, 'Organe'); if (abgebaut) return;
  await organe(); if (abgebaut) return;
}

/* =====================================================================
   7. Kamera und Renderschleife
   ===================================================================== */
var view = { theta: 0, phi: PI / 2, dist: 290, target: V(0, 88, 0) };
var orbit = Kern.orbit(canvas, view, { minDist: 25, maxDist: 520 });
var kamAlt = { near: camera.near, far: camera.far };
camera.near = 2; camera.far = 1200; camera.updateProjectionMatrix();
var fitDist = 0;
function passen(w, h) {
  var th = Math.tan(camera.fov * PI / 360), asp = w / h;
  var d = Math.max(104 / th, 50 / (th * asp));
  if (!fitDist || Math.abs(view.dist - fitDist) < 1e-6) view.dist = d;
  fitDist = d;
}
function groesse(w, h) { passen(w, h); }
function ansicht(theta, phi, dist, target) {
  if (theta !== undefined) view.theta = theta * PI / 180;
  if (phi !== undefined) view.phi = phi * PI / 180;
  if (dist !== undefined) view.dist = dist;
  if (target) view.target.set(target[0], target[1], target[2]);
  orbit.anim = null;
}
function loop(now) {
  if (orbit.anim) orbit.anim = Kern.fahrtSchritt(view, orbit.anim, now);
  Kern.kamera(camera, view);
  renderer.render(scene, camera);
}
organ.bild = loop; organ.groesse = groesse;

/* Organ vollstaendig wegraeumen (Rahmen-Objekte bleiben) */
organ.abbauen = function () {
  abgebaut = true;
  orbit.loesen();
  /* three.js: alles bis auf die Lichter des Rahmens freigeben */
  scene.children.filter(function (o) { return !o.isLight; }).forEach(function (o) { Kern.entsorgen(o, envTex); });
  camera.near = kamAlt.near; camera.far = kamAlt.far; camera.updateProjectionMatrix();
  /* DOM */
  umg.bereich.innerHTML = '';
  $('bootBar').style.width = ''; $('bootSt').textContent = '';
  delete window.KoerperApp;
};
return bauen().then(function () {
  if (abgebaut) return;
  App.aufbauMs = Math.round(performance.now() - t0);
  App.ready = true;
}).catch(function (e) { if (abgebaut) return; console.error(e); $('bootSt').textContent = 'Fehler beim Aufbau: ' + e.message; });
}
Kern.organ('koerper', organ);
})();
