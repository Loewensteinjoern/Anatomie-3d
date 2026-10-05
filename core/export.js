/* ==========================================================================
   Gemeinsamer Kern - Export: STL (3D-Druck, im ZIP), GLB (statisch) und
   GLB mit Animation. Immer mit Signatur „erstellt von Jörn Löwenstein
   mithilfe von Claude (Künstliche Intelligenz)“.
   Klassisches Skript (kein Modul); setzt voraus, dass core/kern.js und
   three.js (samt GLTFExporter) vorher geladen sind.

   Aufruf: Kern.Export.run(kind, cfg)
     kind  'stl' | 'glb' | 'glb-anim'
     cfg   Konfiguration des Organs (Felder; mit * = Pflicht):
       titel *            Name im Export, z. B. '3D-Herz' (STL-Kopf, LIESMICH-Kopf, GLB-generator)
       praefix *          Dateipräfix, z. B. 'herz' -> herz_ansicht.stl, herz_stl_3d-druck.zip,
                          herz_statisch, herz_animiert_<zusatz>
       wurzelName *       Name des Wurzelknotens im GLB, z. B. 'Herz'
       schild *           [x, y, z] des Signaturschilds im GLB (Einheit des Modells)
       bereit() *         true, sobald das Modell fertig aufgebaut ist
       gruppen() *        Liste der THREE-Gruppen, deren sichtbare Meshes exportiert werden
       toast(msg) *       Meldungen anzeigen
       knoepfe            Selektor der Export-Knöpfe (Standard '#bGlbA,#bGlbS,#bStl')
       texte *            Meldungen und LIESMICH-Zeilen:
         stlStart            Text vor dem STL-Export
         glbStart            Text vor dem statischen GLB-Export
         animStart           Text vor dem animierten GLB-Export
         stlLiesmich         Array LIESMICH-Zeilen (STL)
         stlFertig(i)        Toast nach STL; i = { dateien, dreiecke, groesse (ZIP, Bytes) }
         glbLiesmich(i)      Array LIESMICH-Zeilen (GLB); i = { anim, name (Datei), a (Rückgabe von animation) }
         glbFertig(i)        Toast nach GLB; i = { anim, objekte, groesse (Bytes), a }
       stlTeile()         optional: zusätzliche STL-Dateien [{ name, data }] (Uint8Array, z. B. via
                          Kern.Export.stl); ohne Hook nur die Ansicht. Muss den Zustand selbst
                          zurücksetzen.
       animation(rootE, klone)  optional, nur für 'glb-anim' (darf Promise liefern): hängt
                          Animationsobjekte an rootE (klone = [{ c: Klon, m: Original }]) und
                          liefert { clips: [THREE.AnimationClip], zusatz: Namensteil, … };
                          weitere Felder landen als `a` in den Text-Funktionen.
       zusatzStatisch     optional: Namensteil für den statischen Export (Standard keiner)
       transparenz        optional: Transparenz/Opazität der Materialien übernehmen (Standard aus)
       unlit              optional: MeshBasicMaterial bleibt unbeleuchtet (KHR_materials_unlit; Standard aus)
   Kern.Export.pruefeZiel(id): blendet das Element (Standard '#exp') aus, wenn
   die Seite in Claude eingebettet ist und keine Fähigkeit „downloads“ hat.
   ========================================================================== */
Kern.Export = (function () {
  'use strict';
  const WM = Kern.WM;
  const WM_ASCII = Kern.WM_ASCII;

  /* ---------- ZIP (ohne Fremdbibliothek) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  async function deflateRaw(u8) {
    if (typeof CompressionStream === 'undefined') return null;
    try { const s = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw')); return new Uint8Array(await new Response(s).arrayBuffer()); } catch (e) { return null; }
  }
  async function makeZip(files, comment) {
    const enc = new TextEncoder(); const parts = [], central = []; let offset = 0;
    const d = new Date();
    const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of files) {
      const name = enc.encode(f.name); const crc = crc32(f.data);
      let comp = await deflateRaw(f.data), method = 8;
      if (!comp || comp.length >= f.data.length) { comp = f.data; method = 0; }
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, method, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true); lh.setUint32(18, comp.length, true); lh.setUint32(22, f.data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, comp);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, method, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true); ch.setUint32(20, comp.length, true); ch.setUint32(24, f.data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + comp.length;
    }
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const cm = enc.encode(comment || '');
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, cm.length, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer), cm]), { type: 'application/zip' });
  }

  /* ---------- Auslieferung ---------- */
  // In Claude: Fähigkeit „downloads“ (nur ZIP u. a. erlaubt). Außerhalb: klassischer Download.
  async function getDL() {
    if (!(window.claude && typeof window.claude.use === 'function')) return null;
    try { return await window.claude.use('downloads'); } catch (e) { return null; }
  }
  async function deliver(filename, blob, dl) {
    if (dl) { await dl.save({ filename, data: blob }); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  }
  // Export-Bereich ausblenden, wenn in Claude eingebettet und ohne „downloads“
  function pruefeZiel(id) {
    if (window.claude && typeof window.claude.use === 'function') {
      window.claude.use('downloads').then(function (dl) {
        var framed = true; try { framed = window.top !== window.self; } catch (e) { framed = true; }
        if (!dl && framed) document.getElementById(id || 'exp').style.display = 'none';
      }).catch(function () {});
    }
  }

  /* ---------- Sammeln + Backen ---------- */
  function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  function collect(groups, opts) {
    const out = [];
    for (const g of groups) g.traverse((m) => {
      if (!m.isMesh || !shown(m) || m.userData.noexport) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      if (mats.every(x => !x.visible || x.opacity < 0.05)) return;
      out.push(m);
    });
    return out;
  }
  function baked(mesh, useWorld) {
    const g = mesh.geometry, p = g.attributes.position, n = p.count;
    const ma = (g.morphAttributes && g.morphAttributes.position) || [], inf = mesh.morphTargetInfluences || [];
    const out = new Float32Array(n * 3); const v = new THREE.Vector3();
    mesh.updateWorldMatrix(true, false);
    for (let i = 0; i < n; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      for (let k = 0; k < ma.length; k++) { const w = inf[k] || 0; if (!w) continue; x += ma[k].getX(i) * w; y += ma[k].getY(i) * w; z += ma[k].getZ(i) * w; }
      if (useWorld) { v.set(x, y, z).applyMatrix4(mesh.matrixWorld); x = v.x; y = v.y; z = v.z; }
      out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
    }
    return out;
  }
  function triList(mesh) {
    const g = mesh.geometry; const idx = g.index ? g.index.array : null; const cnt = idx ? idx.length : g.attributes.position.count;
    const mats = Array.isArray(mesh.material) ? mesh.material : null;
    const tris = [];
    const groups = mats && g.groups.length ? g.groups : [{ start: 0, count: cnt, materialIndex: 0 }];
    for (const gr of groups) {
      const mat = mats ? mats[gr.materialIndex] : mesh.material;
      if (!mat || !mat.visible || mat.opacity < 0.05) continue;
      for (let i = gr.start; i < gr.start + gr.count; i++) tris.push(idx ? idx[i] : i);
    }
    return tris;
  }

  /* ---------- STL ---------- */
  function stl(meshes, useWorld, titel) {
    const items = meshes.map(m => ({ pos: baked(m, useWorld), tris: triList(m) }));
    const nt = items.reduce((a, it) => a + it.tris.length / 3, 0);
    const buf = new ArrayBuffer(84 + nt * 50), dv = new DataView(buf);
    const head = (WM_ASCII + ' | ' + titel).slice(0, 80);
    for (let i = 0; i < 80; i++) dv.setUint8(i, i < head.length ? head.charCodeAt(i) : 32);
    dv.setUint32(80, nt, true);
    let o = 84;
    const S = 10; // cm -> mm
    for (const it of items) {
      const P = it.pos, T = it.tris;
      for (let t = 0; t < T.length; t += 3) {
        const a = T[t] * 3, b = T[t + 1] * 3, c = T[t + 2] * 3;
        // Y-oben -> Z-oben (Druckbett)
        const ax = P[a] * S, ay = -P[a + 2] * S, az = P[a + 1] * S;
        const bx = P[b] * S, by = -P[b + 2] * S, bz = P[b + 1] * S;
        const cx = P[c] * S, cy = -P[c + 2] * S, cz = P[c + 1] * S;
        const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1;
        dv.setFloat32(o, nx / nl, true); dv.setFloat32(o + 4, ny / nl, true); dv.setFloat32(o + 8, nz / nl, true);
        dv.setFloat32(o + 12, ax, true); dv.setFloat32(o + 16, ay, true); dv.setFloat32(o + 20, az, true);
        dv.setFloat32(o + 24, bx, true); dv.setFloat32(o + 28, by, true); dv.setFloat32(o + 32, bz, true);
        dv.setFloat32(o + 36, cx, true); dv.setFloat32(o + 40, cy, true); dv.setFloat32(o + 44, cz, true);
        dv.setUint16(o + 48, 0, true); o += 50;
      }
    }
    return new Uint8Array(buf);
  }

  /* ---------- Signaturschild für GLB ---------- */
  function signPlate(pos) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#122229'; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = '#E0A94A'; x.lineWidth = 6; x.strokeRect(10, 10, c.width - 20, c.height - 20);
    x.fillStyle = '#E7EFF0'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'italic 400 66px Georgia, "Times New Roman", serif';
    x.fillText('erstellt von Jörn Löwenstein', c.width / 2, 92);
    x.font = '400 52px "Segoe UI", Roboto, Arial, sans-serif';
    x.fillText('mithilfe von Claude (Künstliche Intelligenz)', c.width / 2, 170);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 1.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0 }));
    m.position.set(pos[0], pos[1], pos[2]); m.name = 'Signatur';
    return m;
  }

  function cleanMaterial(mat, opt) {
    if (opt && opt.unlit && mat.isMeshBasicMaterial) {
      // unbeleuchtet: bleibt MeshBasicMaterial -> KHR_materials_unlit
      const u = new THREE.MeshBasicMaterial({
        color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
        vertexColors: !!mat.vertexColors, side: mat.side,
        transparent: !!(opt.transparenz && mat.transparent && mat.opacity < 1), opacity: (opt.transparenz && mat.transparent && mat.opacity < 1) ? mat.opacity : 1
      });
      if (mat.name) u.name = mat.name;
      return u;
    }
    const m = new THREE.MeshStandardMaterial({
      color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff), roughness: mat.roughness, metalness: 0,
      vertexColors: !!mat.vertexColors, side: mat.side, transparent: false, opacity: 1
    });
    if (mat.name) m.name = mat.name;
    m.emissive.setHex(0x000000);
    if (opt && opt.transparenz && mat.transparent && mat.opacity < 1) { m.transparent = true; m.opacity = mat.opacity; }
    return m;
  }
  const matNames = ['Aussen', 'Innen', 'Schnitt'];
  function exportClone(mesh, i, keepMorph, opt) {
    const src = mesh.geometry, g = new THREE.BufferGeometry();
    if (keepMorph) {
      mesh.updateWorldMatrix(true, false);
      g.setAttribute('position', src.attributes.position.clone());
      if (src.morphAttributes.position) { g.morphAttributes.position = src.morphAttributes.position.map(a => a.clone()); g.morphTargetsRelative = true; }
    } else g.setAttribute('position', new THREE.BufferAttribute(baked(mesh, false), 3));
    if (src.attributes.normal) g.setAttribute('normal', src.attributes.normal.clone());
    if (src.attributes.color) g.setAttribute('color', src.attributes.color.clone());
    if (src.index) g.setIndex(src.index.clone());
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const outMats = mats.map((m, k) => { const c = cleanMaterial(m, opt); c.name = (mesh.userData.sid || 'teil') + (mats.length > 1 ? '_' + matNames[k] : ''); c.visible = m.visible; return c; });
    if (Array.isArray(mesh.material)) {
      for (const gr of src.groups) if (mats[gr.materialIndex].visible && mats[gr.materialIndex].opacity > 0.05) g.addGroup(gr.start, gr.count, gr.materialIndex);
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    const m = new THREE.Mesh(g, Array.isArray(mesh.material) ? outMats : outMats[0]);
    m.name = (mesh.name || 'Teil').replace(/[^A-Za-z0-9_]/g, '_') + '_' + i;
    // Lage (Vorderwand-Drehung) übernehmen
    mesh.updateWorldMatrix(true, false);
    m.applyMatrix4(mesh.matrixWorld);
    if (keepMorph) m.updateMorphTargets();
    m.userData = { struktur: mesh.userData.sid || '' };
    return m;
  }
  function glb(scene, animations, titel) {
    return new Promise((resolve, reject) => {
      const ex = new THREE.GLTFExporter();
      ex.register((writer) => ({ afterParse() { writer.json.asset.copyright = WM; writer.json.asset.generator = titel + ' (three.js GLTFExporter)'; writer.json.asset.extras = { signatur: WM }; } }));
      try { ex.parse(scene, (res) => resolve(new Uint8Array(res)), { binary: true, onlyVisible: true, animations: animations || [], truncateDrawRange: true }); } catch (e) { reject(e); }
    });
  }
  function readme(titel, extra) {
    return new TextEncoder().encode([titel + ' – Export', WM, '', ...extra, '', 'Erstellt am ' + new Date().toLocaleString('de-DE')].join('\r\n'));
  }

  /* ---------- Ablauf ---------- */
  const kb = (n) => n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.round(n / 1024) + ' kB';
  let busy = false;
  async function run(kind, cfg) {
    if (busy || !cfg.bereit()) return;
    busy = true;
    const say = cfg.toast, tx = cfg.texte;
    const btns = document.querySelectorAll(cfg.knoepfe || '#bGlbA,#bGlbS,#bStl'); btns.forEach(b => b.disabled = true);
    await new Promise(r => setTimeout(r, 30));
    try {
      const dl = await getDL();
      if (kind === 'stl') {
        say(tx.stlStart); await new Promise(r => setTimeout(r, 30));
        const view = collect(cfg.gruppen());
        const files = [{ name: cfg.praefix + '_ansicht.stl', data: stl(view, true, cfg.titel) }];
        if (cfg.stlTeile) for (const f of cfg.stlTeile()) files.push(f);
        const tris = files.reduce((a, f) => a + (f.data.length - 84) / 50, 0);
        const nDateien = files.length;
        files.push({ name: 'LIESMICH.txt', data: readme(cfg.titel, tx.stlLiesmich) });
        const zip = await makeZip(files, WM_ASCII);
        await deliver(cfg.praefix + '_stl_3d-druck.zip', zip, dl);
        say(tx.stlFertig({ dateien: nDateien, dreiecke: tris, groesse: zip.size }));
      } else {
        const anim = kind === 'glb-anim';
        say(anim ? tx.animStart : tx.glbStart); await new Promise(r => setTimeout(r, 30));
        const scene = new THREE.Scene(); const rootE = new THREE.Group(); rootE.name = cfg.wurzelName; rootE.scale.setScalar(0.01); scene.add(rootE);
        rootE.userData = { signatur: WM, einheit: 'Meter' };
        const src = collect(cfg.gruppen());
        const clones = src.map((m, i) => { const c = exportClone(m, i, anim, cfg); rootE.add(c); return { c, m }; });
        rootE.add(signPlate(cfg.schild));
        let clips = [], a = null;
        if (anim) {
          a = await cfg.animation(rootE, clones);
          clips = a.clips;
        }
        const data = await glb(scene, clips, cfg.titel);
        const zus = anim ? a.zusatz : cfg.zusatzStatisch;
        const base = cfg.praefix + (anim ? '_animiert' : '_statisch') + (zus ? '_' + zus : '');
        if (dl) {
          const zip = await makeZip([{ name: base + '.glb', data }, { name: 'LIESMICH.txt', data: readme(cfg.titel, tx.glbLiesmich({ anim, name: base + '.glb', a })) }], WM_ASCII);
          await deliver(base + '_glb.zip', zip, dl);
        } else await deliver(base + '.glb', new Blob([data], { type: 'model/gltf-binary' }), null);
        say(tx.glbFertig({ anim, objekte: clones.length, groesse: data.length, a }));
      }
    } catch (e) {
      console.error(e);
      const code = e && e.code;
      say(code === 'declined' ? 'Speichern abgebrochen.' : code === 'rate_limited' ? 'Es ist noch ein Speichern-Dialog offen – bitte kurz warten.' : code === 'too_large' ? 'Die Datei ist für dieses Ziel zu groß.' : 'Export fehlgeschlagen: ' + ((e && e.message) || e));
    } finally { btns.forEach(b => { b.disabled = false; }); busy = false; }
  }
  return { run, pruefeZiel, kb, stl, makeZip, glb, collect, baked, WM, WM_ASCII };
})();
