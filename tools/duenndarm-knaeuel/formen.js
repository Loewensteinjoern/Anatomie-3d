// Laedt Kern.SDF und die Formen (Lunge, Leber, Verdauung) in node
const fs = require('fs'), vm = require('vm');
const R = require('path').join(__dirname, '..', '..') + '/';
module.exports = function (verdauungDatei) {
  const window = {}; const ctx = { window, console, Math, Float32Array, Float64Array, Int32Array, Uint8Array, Uint32Array, Int16Array, Uint16Array, Array, Object, Promise, Error, JSON, Number, String, Map, Set };
  vm.createContext(ctx);
  ctx.Kern = undefined;
  vm.runInContext(fs.readFileSync(R + 'core/sdf.js', 'utf8'), ctx);
  const K = ctx.window.Kern; K.Formen = {}; K.form = function (n, d) { K.Formen[n] = d; }; K.FORMEN = {}; K.formLaden = function () {};
  ctx.Kern = K;
  for (const f of ['organe/lunge/lunge-form.js', 'organe/leber/leber-form.js', verdauungDatei || 'organe/verdauung/verdauung-form.js'])
    vm.runInContext(fs.readFileSync(f.startsWith('/') ? f : R + f, 'utf8'), ctx);
  return K;
};
if (require.main === module) { const K = module.exports(); const v = K.Formen.verdauung; const d = v.duenndarm(); console.log(Object.keys(K.Formen), d.laenge, d.pts.length, v.dickdarm().laenge); }
