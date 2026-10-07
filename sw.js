/* ==========================================================================
   Gemeinsamer Kern - Service Worker: Offline-Speicher der App
   Klassischer Worker. Speichert nur die Dateien der App (Liste DATEIEN),
   keine Nutzerdaten und nichts zur Laufzeit. Eine neue Version wartet, bis
   die Seite per Nachricht 'aktivieren' zustimmt; die Seite, die den Worker
   zum ersten Mal anmeldet, bleibt ohne Worker (kein clients.claim).
   VERSION setzt `node tools/version.js` (nach jeder Änderung an einer App-Datei ausführen).
   ========================================================================== */
'use strict';

var VERSION = 'fe95dd868af9';
var SPEICHER = 'anatomie-' + VERSION;

/* Dateien der App (relativ zum Ordner von sw.js) */
var DATEIEN = [
  './', 'index.html', 'nephron.html', 'atlas.html', 'app.webmanifest',
  'icons/symbol-180.png', 'icons/symbol-192.png', 'icons/symbol-512.png', 'icons/symbol-maskable-512.png',
  'core/kern.css', 'core/atlas.css',
  'core/kern.js', 'core/rahmen.js', 'core/export.js', 'core/ar.js', 'core/szenarien.js', 'core/sdf.js', 'core/atlas.js', 'core/offline.js',
  'vendor/three.min.js', 'vendor/GLTFExporter.js',
  'organe/koerper/koerper.js', 'organe/koerper/koerper.css',
  'organe/herz/herz.js', 'organe/herz/herz.css',
  'organe/niere/nephron.js', 'organe/niere/nephron.css'
];

/* Absolute Adressen der Dateien, einmal vorberechnet */
var ADRESSEN = {};
DATEIEN.forEach(function (d) { ADRESSEN[new URL(d, self.registration.scope).href] = true; });

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SPEICHER).then(function (c) {
    /* am HTTP-Cache vorbei, damit nach einem Update keine alten Dateien gespeichert werden */
    return c.addAll(DATEIEN.map(function (d) { return new Request(d, { cache: 'reload' }); }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (namen) {
    return Promise.all(namen.filter(function (n) {
      return n.indexOf('anatomie-') === 0 && n !== SPEICHER;
    }).map(function (n) { return caches.delete(n); }));
  }));
});

self.addEventListener('message', function (e) {
  if (e.data === 'aktivieren') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var q = e.request;
  if (q.method !== 'GET') return;
  var u = new URL(q.url);
  if (u.origin !== self.location.origin) return;
  var url = u.origin + u.pathname;
  if (!ADRESSEN[url]) return;
  e.respondWith(caches.open(SPEICHER).then(function (c) {
    return c.match(url);
  }).then(function (r) {
    return r || fetch(q);
  }));
});
