/* ==========================================================================
   Gemeinsamer Kern - SDF: Gitter, Auswertung und Surface Nets fuer
   Signed-Distance-Felder (Einheit frei, Innen < 0) plus kleine Bausteine.
   Klassisches Skript (kein Modul). Beim Laden wird nichts ausgefuehrt.
   Gitter, evalFeld und surfaceNets sind aus organe/herz/herz.js uebernommen
   (HeartMesher); das Herz nutzt vorerst noch seine eigene Kopie.
   ========================================================================== */
var Kern = window.Kern = window.Kern || {};
(function (K) {
  'use strict';

  /* Gitter ueber bounds = [[x0,y0,z0],[x1,y1,z1]] mit Weite h */
  function makeGrid(bounds, h) {
    const nx = Math.ceil((bounds[1][0] - bounds[0][0]) / h) + 1;
    const ny = Math.ceil((bounds[1][1] - bounds[0][1]) / h) + 1;
    const nz = Math.ceil((bounds[1][2] - bounds[0][2]) / h) + 1;
    return { o: bounds[0], h, nx, ny, nz };
  }

  /* Wertet fn(x,y,z) auf dem Gitter aus - blockweise, grobe Vorpruefung
     (Bloecke weit weg von der Flaeche werden nur interpoliert). Async:
     fortschritt(0..1) darf ein Promise liefern (Ladebalken). fn sollte den
     Abstand nicht ueberschaetzen. */
  async function evalFeld(G, fn, fortschritt) {
    const { nx, ny, nz, h, o } = G;
    const N = nx * ny * nz;
    const T = new Float32Array(N);
    const B = 4; // Blockgroesse
    const bx = Math.ceil((nx - 1) / B), by = Math.ceil((ny - 1) / B), bz = Math.ceil((nz - 1) / B);
    const cx = bx + 1, cy = by + 1, cz = bz + 1;
    const coarse = new Float32Array(cx * cy * cz);
    for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
      const gi = Math.min(i * B, nx - 1), gj = Math.min(j * B, ny - 1), gk = Math.min(k * B, nz - 1);
      coarse[i + cx * (j + cy * k)] = fn(o[0] + gi * h, o[1] + gj * h, o[2] + gk * h);
    }
    const thr = 1.15 * B * h * Math.sqrt(3);
    let t0 = Date.now();
    for (let kb = 0; kb < bz; kb++) {
      for (let jb = 0; jb < by; jb++) for (let ib = 0; ib < bx; ib++) {
        let mn = 1e9, mx = -1e9;
        const c = [];
        for (let dk = 0; dk < 2; dk++) for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
          const v = coarse[(ib + di) + cx * ((jb + dj) + cy * (kb + dk))]; c.push(v);
          if (v < mn) mn = v; if (v > mx) mx = v;
        }
        const i0 = ib * B, j0 = jb * B, k0 = kb * B;
        const i1 = Math.min(i0 + B, nx - 1), j1 = Math.min(j0 + B, ny - 1), k1 = Math.min(k0 + B, nz - 1);
        const exact = !((mn > thr) || (mx < -thr));
        const ke = (kb === bz - 1) ? k1 : k1 - 1, je = (jb === by - 1) ? j1 : j1 - 1, ie = (ib === bx - 1) ? i1 : i1 - 1;
        for (let k = k0; k <= ke; k++) for (let j = j0; j <= je; j++) for (let i = i0; i <= ie; i++) {
          const idx = i + nx * (j + ny * k);
          if (exact) {
            T[idx] = fn(o[0] + i * h, o[1] + j * h, o[2] + k * h);
          } else {
            const u = (i - i0) / B, v = (j - j0) / B, w = (k - k0) / B;
            const a = c[0] * (1 - u) + c[1] * u, b = c[2] * (1 - u) + c[3] * u;
            const d = c[4] * (1 - u) + c[5] * u, e = c[6] * (1 - u) + c[7] * u;
            T[idx] = (a * (1 - v) + b * v) * (1 - w) + (d * (1 - v) + e * v) * w;
          }
        }
      }
      if (fortschritt && Date.now() - t0 > 40) { t0 = Date.now(); await fortschritt((kb + 1) / bz); }
    }
    return T;
  }

  /* Surface Nets fuer Feld F (Innen < 0) -> { positions, index } */
  function surfaceNets(G, F) {
    const { nx, ny, nz, h, o } = G;
    const cellIdx = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
    const pos = [];
    const cornerOff = [];
    for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) cornerOff.push([i, j, k]);
    const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const val = new Float32Array(8);
    let nv = 0;
    for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      let mask = 0;
      for (let c = 0; c < 8; c++) {
        const off = cornerOff[c];
        const v = F[(i + off[0]) + nx * ((j + off[1]) + ny * (k + off[2]))];
        val[c] = v; if (v < 0) mask |= (1 << c);
      }
      if (mask === 0 || mask === 255) continue;
      let sx = 0, sy = 0, sz = 0, cnt = 0;
      for (const [a, b] of edges) {
        const va = val[a], vb = val[b];
        if ((va < 0) === (vb < 0)) continue;
        const t = va / (va - vb);
        const A = cornerOff[a], Bc = cornerOff[b];
        sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; cnt++;
      }
      pos.push(o[0] + (i + sx / cnt) * h, o[1] + (j + sy / cnt) * h, o[2] + (k + sz / cnt) * h);
      cellIdx[i + (nx - 1) * (j + (ny - 1) * k)] = nv++;
    }
    const idx = [];
    const cid = (i, j, k) => cellIdx[i + (nx - 1) * (j + (ny - 1) * k)];
    const P = pos;
    const d2 = (a, b) => { const dx = P[a * 3] - P[b * 3], dy = P[a * 3 + 1] - P[b * 3 + 1], dz = P[a * 3 + 2] - P[b * 3 + 2]; return dx * dx + dy * dy + dz * dz; };
    function quad(a, b, c, d, flip) {
      if (a < 0 || b < 0 || c < 0 || d < 0) return;
      if (flip) { const t = b; b = d; d = t; }
      if (d2(a, c) < d2(b, d)) idx.push(a, b, c, a, c, d); else idx.push(a, b, d, b, c, d);
    }
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v0 = F[i + nx * (j + ny * k)];
      const in0 = v0 < 0;
      // Kante in x
      if (i < nx - 1 && j > 0 && k > 0 && j < ny - 1 && k < nz - 1) {
        const v1 = F[(i + 1) + nx * (j + ny * k)];
        if (in0 !== (v1 < 0)) quad(cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k), !in0);
      }
      // Kante in y  (u = z, v = x)
      if (j < ny - 1 && i > 0 && k > 0 && i < nx - 1 && k < nz - 1) {
        const v1 = F[i + nx * ((j + 1) + ny * k)];
        if (in0 !== (v1 < 0)) quad(cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1), !in0);
      }
      // Kante in z  (u = x, v = y)
      if (k < nz - 1 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1) {
        const v1 = F[i + nx * (j + ny * (k + 1))];
        if (in0 !== (v1 < 0)) quad(cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k), !in0);
      }
    }
    return { positions: new Float32Array(pos), index: new Uint32Array(idx) };
  }

  /* three.js-Geometrie aus Surface-Nets-Daten (glatte Normalen) */
  function geometrie(G, F) {
    const m = surfaceNets(G, F);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
    g.setIndex(new THREE.BufferAttribute(m.index, 1));
    g.computeVertexNormals();
    return g;
  }

  /* ---- Bausteine: Abstand von Punkt (x,y,z) zur Form (Innen < 0) ---- */

  /* Kugel um (cx,cy,cz) mit Radius r */
  function kugel(x, y, z, cx, cy, cz, r) {
    const dx = x - cx, dy = y - cy, dz = z - cz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
  }

  /* Ellipsoid mit Halbachsen rx, ry, rz (Naeherung, Vorzeichen exakt) */
  function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz) {
    const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz;
    const k0 = Math.sqrt(px * px + py * py + pz * pz);
    if (k0 < 1e-6) return -Math.min(rx, ry, rz);
    const qx = px / rx, qy = py / ry, qz = pz / rz;
    const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
    return k0 * (k0 - 1) / k1;
  }

  /* Kapsel: Strecke a-b mit Radius ra (bei a) und rb (bei b; ohne rb zylindrisch,
     mit rb konisch) */
  function kapsel(x, y, z, ax, ay, az, bx, by, bz, ra, rb) {
    const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
    let t = (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = pax - bax * t, dy = pay - bay * t, dz = paz - baz * t;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (rb === undefined ? ra : ra + (rb - ra) * t);
  }

  /* Box mit Mitte (cx,cy,cz), Halbmassen hx,hy,hz und Rundung r (r <= kleinste Halbmass) */
  function box(x, y, z, cx, cy, cz, hx, hy, hz, r) {
    r = r || 0;
    const qx = Math.abs(x - cx) - (hx - r), qy = Math.abs(y - cy) - (hy - r), qz = Math.abs(z - cz) - (hz - r);
    const ax = qx > 0 ? qx : 0, ay = qy > 0 ? qy : 0, az = qz > 0 ? qz : 0;
    return Math.sqrt(ax * ax + ay * ay + az * az) + Math.min(Math.max(qx, qy, qz), 0) - r;
  }

  /* glatte Vereinigung / glatter Schnitt (k = Weite der Verrundung) */
  function smin(a, b, k) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
  }
  function smax(a, b, k) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  }

  K.SDF = {
    makeGrid: makeGrid, evalFeld: evalFeld, surfaceNets: surfaceNets, geometrie: geometrie,
    kugel: kugel, ellipsoid: ellipsoid, kapsel: kapsel, box: box, smin: smin, smax: smax
  };
})(Kern);
