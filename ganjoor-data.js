// Ganjoor poems — dynamic loader
// Uses GANJOOR_INDEX to know what poets exist, loads them on demand.
// Only the union of already-loaded poet data becomes GANJOOR_POEMS.

const GANJOOR_POEMS = [];

function ganjoorRebuildPoems() {
  GANJOOR_POEMS.length = 0;
  if (typeof GANJOOR_INDEX === 'undefined') return;
  var loadedCount = 0;
  GANJOOR_INDEX.forEach(function(poet) {
    try {
      // Function constructor can access script-level const vars
      var data = Function('return ' + poet.varName)();
      if (data && data.length) {
        GANJOOR_POEMS.push.apply(GANJOOR_POEMS, data);
        loadedCount += data.length;
      }
    } catch(e) {}
  });
  return loadedCount;
}
// Initial rebuild
ganjoorRebuildPoems();
