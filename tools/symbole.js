#!/usr/bin/env node
/* =====================================================================
   App-Symbole des Anatomie-Atlas

   Rendert icons/symbol.svg pixelgenau als PNG (headless Chromium über Playwright):
     icons/symbol-180.png            apple-touch-icon
     icons/symbol-192.png, symbol-512.png
     icons/symbol-maskable-512.png   gleiche Grafik (Inhalt liegt schon in der sicheren Zone)

   Aufruf (nach Änderungen an icons/symbol.svg neu ausführen):
     node tools/symbole.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function ladePlaywright() {
  try { return require('playwright'); } catch (e) { /* global installiert? */ }
  try { return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch (e) { /* fehlt */ }
  console.error('Playwright fehlt: npm install -g playwright && npx playwright install chromium');
  process.exit(2);
}

const ORDNER = path.join(__dirname, '..', 'icons');
const GROESSEN = { 'symbol-180.png': 180, 'symbol-192.png': 192, 'symbol-512.png': 512, 'symbol-maskable-512.png': 512 };

(async () => {
  const svg = fs.readFileSync(path.join(ORDNER, 'symbol.svg'), 'utf8');
  const url = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  const browser = await ladePlaywright().chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  for (const [name, g] of Object.entries(GROESSEN)) {
    await page.setViewportSize({ width: g, height: g });
    await page.setContent('<style>html,body{margin:0;background:#0B171C}img{display:block;width:' + g + 'px;height:' + g + 'px}</style><img src="' + url + '">');
    await page.waitForFunction(() => document.images[0].complete);
    fs.writeFileSync(path.join(ORDNER, name), await page.screenshot({ clip: { x: 0, y: 0, width: g, height: g } }));
    console.log(name + ' (' + g + '×' + g + ')');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
