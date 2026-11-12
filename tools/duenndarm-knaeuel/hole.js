// Holt die Dreiecke aller Koerper-Meshes im Bauchraum (Welt-Koordinaten) -> nachbarn.json
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const srv = http.createServer((q, r) => { let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0].split('#')[0])); if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } const t = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' }[path.extname(p)] || 'application/octet-stream'; r.writeHead(200, { 'Content-Type': t }); r.end(d); }); }).listen(8765);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.goto('http://localhost:8765/index.html');
  await pg.waitForFunction(() => window.KoerperApp && window.KoerperApp.ready && window.Kern && Kern.Rahmen, null, { timeout: 180000 });
  const daten = await pg.evaluate(() => {
    const B = [-16, 78, -6, 16, 102, 16], out = {};
    Kern.Rahmen.szene.updateMatrixWorld(true);
    Kern.Rahmen.szene.traverse((m) => {
      if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
      const sid = m.userData.sid || ('?' + (m.name || '')); if (sid === 'duenndarm') return;
      const g = m.geometry, P = g.attributes.position, I = g.index, v = new THREE.Vector3(), w = [];
      const n = I ? I.count : P.count; const tri = [];
      for (let k = 0; k < n; k += 3) { const a = []; let drin = false;
        for (let j = 0; j < 3; j++) { v.fromBufferAttribute(P, I ? I.getX(k + j) : k + j).applyMatrix4(m.matrixWorld); a.push(+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3));
          if (v.x > B[0] && v.x < B[3] && v.y > B[1] && v.y < B[4] && v.z > B[2] && v.z < B[5]) drin = true; }
        if (drin) tri.push(...a); }
      if (tri.length) (out[sid] = out[sid] || []).push(...tri);
    });
    return out;
  });
  const z = {}; for (const k in daten) z[k] = daten[k].length / 9;
  console.log(JSON.stringify(z));
  fs.writeFileSync('nachbarn.json', JSON.stringify(daten));
  await b.close(); srv.close();
})();
