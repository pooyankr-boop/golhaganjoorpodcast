/* =====================================================================
   رادیو آواک — منطق کامل برنامه
   رادیو گل‌ها + شعرخوان گنجور + داستان‌خوانی + مدیتیشن
   ===================================================================== */

const audio = new Audio();
audio.preload = "none";

/* ===================================================================
   Media Session — پخش پیوسته در پس‌زمینه (موبایل) + کنترل از صفحهٔ قفل
   (هر action جدا try/catch می‌شود چون نبود پشتیبانی از یکی نباید
   ثبت بقیهٔ دکمه‌ها، مخصوصاً قبلی/بعدی، را متوقف کند)
   =================================================================== */
function setMediaAction(action, handler) {
  if (!('mediaSession' in navigator)) return;
  try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
}
setMediaAction('play', () => { audio.play().catch(function(){}); });
setMediaAction('pause', () => { audio.pause(); });
setMediaAction('previoustrack', () => { prevTrack(); });
setMediaAction('nexttrack', () => { nextTrack(); });
setMediaAction('stop', () => { audio.pause(); });
setMediaAction('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
setMediaAction('seekforward', () => { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10); });
function updateMediaSessionMetadata(item) {
  if (!item) return;
  document.title = 'رادیو آواک-' + (item.title || '');
  if (!('mediaSession' in navigator)) return;
  var artist = '';
  var album = 'رادیو آواک';
  switch (item.mode) {
    case 'golha': artist = item.performer || ''; break;
    case 'ganjoor': artist = item.poet || ''; break;
    case 'hekayat': artist = item.author || 'رادیو حکایت'; break;
    case 'meditation': artist = item.category || 'مدیتیشن'; break;
  }
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title || 'رادیو آواک',
      artist: artist,
      album: album
    });
  } catch (e) {}
}

/* ===================================================================
   نویز سفید/صورتی/قهوه‌ای — تولید زنده با Web Audio API
   =================================================================== */
let noiseCtx = null;
let noiseSource = null;
let noiseGain = null;

function stopSynthNoise() {
  if (noiseSource) {
    try { noiseSource.stop(); } catch (e) {}
    try { noiseSource.disconnect(); } catch (e) {}
    noiseSource = null;
  }
}

function makeNoiseBuffer(ctx, type) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11;
    }
  } else {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

function playSynthNoise(type) {
  audio.pause();
  stopSynthNoise();
  if (!noiseCtx) noiseCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (noiseCtx.state === 'suspended') noiseCtx.resume();
  const buffer = makeNoiseBuffer(noiseCtx, type);
  noiseSource = noiseCtx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;
  if (!noiseGain) {
    noiseGain = noiseCtx.createGain();
    noiseGain.connect(noiseCtx.destination);
  }
  noiseGain.gain.value = audio.volume;
  noiseSource.connect(noiseGain);
  noiseSource.start();
  state.playing = true;
  updateTransportUI();
}

let state = {
  mode: "golha",
  theme: "abgineh",
  fontPack: "modern",
  weightLevel: "bold",
  fontScale: 23,
  golhaList: [],
  ganjoorList: [],
  hekayatList: [],
  meditationList: [],
  currentIndex: -1,
  playing: false,
  drawerOpen: false,
  randomStartDone: false,
  playingMode: null,
  shuffleMode: 'allModes', // 'off' | 'allModes' | 'modeList' | 'list' | 'subList' — پیش‌فرض: کل حالات
  repeatMode: 'off',    // 'off' | 'list' | 'one'
  sleepTimerEndAt: null,
  sleepTimerId: null,
  // فهرست پخش
  playlist: [],
  playlistEnabled: false,
  playlistRepeat: 'off',
  playlistShuffle: false // 'off' | 'one' | 'all'
};

/* ===================================================================
   ابزارهای کمکی
   =================================================================== */
const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function toFa(str) {
  return String(str).replace(/[0-9]/g, (d) => faDigits[d]);
}

function formatTime(s) {
  if (!isFinite(s) || s < 0) return "۰:۰۰";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return toFa(`${m}:${sec}`);
}

/* ===================================================================
   حالت‌ها و نام‌های فارسی
   =================================================================== */
const MODE_NAMES = {
  golha: "رادیو آواک",
  ganjoor: "شعرخوان گنجور",
  hekayat: "نثرخوان",
  meditation: "مدیتیشن و آرامش"
};

const MODE_PLAYLIST_TITLES = {
  golha: "فهرست برنامه‌ها و خوانندگان",
  ganjoor: "فهرست شاعران و خوانش‌ها",
  hekayat: "فهرست داستان‌های صوتی",
  meditation: "فهرست صداهای آرامش‌بخش"
};

const MODE_ORDER = ["golha", "ganjoor", "hekayat", "meditation"];

/* ===================================================================
   قلم‌ها (دسته‌های سه‌تایی) و ضخامت
   =================================================================== */
const FONT_PACKS = {
  classic: {
    ui: "'Noto Nastaliq Urdu', 'Vazirmatn', serif",
    heading: "'Noto Nastaliq Urdu', 'Vazirmatn', serif",
    decorative: "'Noto Nastaliq Urdu', 'Vazirmatn', serif",
    weights: {
      thin:   { ui: 300, heading: 400, decorative: 400, strokeUi: 0,    strokeHeading: 0 },
      normal: { ui: 400, heading: 400, decorative: 400, strokeUi: 0,    strokeHeading: 0 },
      bold:   { ui: 700, heading: 700, decorative: 400, strokeUi: 0.2,  strokeHeading: 0.3 },
      black:  { ui: 900, heading: 700, decorative: 400, strokeUi: 0.5,  strokeHeading: 0.6 }
    }
  },
  modern: {
    ui: "'Estedad', 'Vazirmatn', sans-serif",
    heading: "'IBM Plex Sans Arabic', 'Estedad', sans-serif",
    decorative: "'Rakkas', 'Estedad', sans-serif",
    weights: {
      thin:   { ui: 300, heading: 300, decorative: 400, strokeUi: 0,    strokeHeading: 0 },
      normal: { ui: 500, heading: 400, decorative: 400, strokeUi: 0,    strokeHeading: 0 },
      bold:   { ui: 700, heading: 600, decorative: 400, strokeUi: 0.25, strokeHeading: 0.25 },
      black:  { ui: 900, heading: 700, decorative: 400, strokeUi: 0.55, strokeHeading: 0.5 }
    }
  },
  traditional: {
    ui: "'Scheherazade New', 'Vazirmatn', serif",
    heading: "'Aref Ruqaa', 'Scheherazade New', serif",
    decorative: "'Lalezar', serif",
    weights: {
      thin:   { ui: 400, heading: 400, decorative: 400, strokeUi: 0,    strokeHeading: 0 },
      normal: { ui: 400, heading: 400, decorative: 400, strokeUi: 0.15, strokeHeading: 0 },
      bold:   { ui: 700, heading: 700, decorative: 400, strokeUi: 0.35, strokeHeading: 0.3 },
      black:  { ui: 700, heading: 700, decorative: 400, strokeUi: 0.7,  strokeHeading: 0.6 }
    }
  }
};

function applyFontPack(packId) {
  if (!FONT_PACKS[packId]) packId = 'classic';
  state.fontPack = packId;
  const pack = FONT_PACKS[packId];
  document.documentElement.style.setProperty('--font-ui', pack.ui);
  document.documentElement.style.setProperty('--font-heading', pack.heading);
  document.documentElement.style.setProperty('--font-decorative', pack.decorative);
  // پنل تنظیمات: برای دسته‌های کلاسیک/سنتی فونت بزرگ (نستعلیق/شهرزاد) پنل را
  // خراب می‌کند — از فونت UI معمولی استفاده کن تا اندازه ثابت بماند
  const settingsFont = (packId === 'classic' || packId === 'traditional') ? "'Vazirmatn', sans-serif" : pack.ui;
  document.documentElement.style.setProperty('--font-settings', settingsFont);
  document.querySelectorAll('[data-fontpack]').forEach((b) => {
    b.classList.toggle('active', b.dataset.fontpack === packId);
  });
  applyFontWeight(state.weightLevel || 'normal');
  try { localStorage.setItem('golava-fontpack', packId); } catch (e) {}
}

function applyFontWeight(level) {
  state.weightLevel = level;
  const pack = FONT_PACKS[state.fontPack] || FONT_PACKS.classic;
  const w = pack.weights[level] || pack.weights.normal;
  document.documentElement.style.setProperty('--weight-ui', w.ui);
  document.documentElement.style.setProperty('--weight-heading', w.heading);
  document.documentElement.style.setProperty('--weight-decorative', w.decorative);
  document.documentElement.style.setProperty('--stroke-ui', w.strokeUi + 'px');
  document.documentElement.style.setProperty('--stroke-heading', w.strokeHeading + 'px');
  document.querySelectorAll('[data-weight]').forEach((b) => {
    b.classList.toggle('active', b.dataset.weight === level);
  });
  try { localStorage.setItem('golava-weightlevel', level); } catch (e) {}
}

/* ===================================================================
   تنظیمات
   =================================================================== */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-swatch").forEach((el) => {
    el.classList.toggle("active", el.dataset.theme === theme);
  });
  try { localStorage.setItem("golava-theme", theme); } catch (e) {}
}

function applyFontScale(px) {
  state.fontScale = px;
  document.documentElement.style.setProperty("--drawer-scale", px + "px");
  document.getElementById("fontSizeLabel").textContent = toFa(px);
  try { localStorage.setItem("golava-scale", px); } catch (e) {}
}

function loadSavedSettings() {
  try {
    const t = localStorage.getItem("golava-theme");
    const fp = localStorage.getItem("golava-fontpack");
    const wl = localStorage.getItem("golava-weightlevel");
    const s = localStorage.getItem("golava-scale");
    applyTheme(t || "abgineh");
    applyFontPack(fp || "modern");
    applyFontWeight(wl || "bold");
    applyFontScale(s ? parseInt(s, 10) : 23);
    document.getElementById("fontSizeRange").value = state.fontScale;
    // رنگ پیش‌فرض اولین ورود: پوستهٔ سرمه‌ای + متن سبز — فقط وقتی کاربر هنوز
    // رنگی انتخاب نکرده (بعداً انتخاب خودش از localStorage می‌آید)
    try {
      if (!localStorage.getItem('golava-skincolor')) applySkinColor('#1a2a4a');
    } catch (e) {}
    try {
      if (!localStorage.getItem('golava-fontcolor')) {
        document.querySelectorAll('.drawer-content .drawer-body, .drawer-content h3, .drawer-content .drawer-meta').forEach(function(el) {
          el.style.color = '#2d5a27';
        });
      }
    } catch (e) {}
  } catch (e) {
    applyTheme("abgineh");
    applyFontPack("modern");
    applyFontWeight("bold");
    applyFontScale(23);
  }
}

/* ===================================================================
   ساخت فهرست تخت
   =================================================================== */
function listForMode(m) {
  switch (m) {
    case "golha": return state.golhaList;
    case "ganjoor": return state.ganjoorList;
    case "hekayat": return state.hekayatList;
    case "meditation": return state.meditationList;
    default: return state.golhaList;
  }
}

function currentList() {
  return listForMode(state.mode);
}

function playbackList() {
  return listForMode(state.playingMode || state.mode);
}

const ORDINAL_WORDS = { "اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10 };
function extractOrdinalInfo(name) {
  const words = String(name).split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (ORDINAL_WORDS[words[i]] !== undefined) {
      return { prefix: words.slice(0, i).join(" "), num: ORDINAL_WORDS[words[i]] };
    }
  }
  return null;
}

function sortFormKeys(subOrder, subGroups) {
  const clusters = {};
  const standalone = [];
  subOrder.forEach((key) => {
    const info = extractOrdinalInfo(key);
    if (info) {
      if (!clusters[info.prefix]) clusters[info.prefix] = [];
      clusters[info.prefix].push({ key, num: info.num });
    } else {
      standalone.push(key);
    }
  });
  const blocks = [];
  Object.keys(clusters).forEach((prefix) => {
    const members = clusters[prefix].slice().sort((a, b) => a.num - b.num);
    const maxCount = Math.max(...members.map((m) => subGroups[m.key].length));
    blocks.push({ repCount: maxCount, keys: members.map((m) => m.key) });
  });
  standalone.forEach((key) => {
    blocks.push({ repCount: subGroups[key].length, keys: [key] });
  });
  blocks.sort((a, b) => b.repCount - a.repCount);
  const result = [];
  blocks.forEach((b) => result.push(...b.keys));
  return result;
}

const HEKAYAT_SUB_TEXT = {
  radiohekayat: "داستان‌های صوتی فارسی",
  ketabsoti: "کتاب صوتی فارسی",
  hezar: "قصه‌های هزار و یکشب — چند خوانش",
  golestan: "حکایات گلستان سعدی فارسی",
  ghesegoo: "قصه‌های صوتی",
  khabcast: "داستان‌های آرامش‌بخش برای خواب"
};

function groupedForRender() {
  const list = currentList();
  const groups = {};
  const order = [];

  list.forEach((item, i) => {
    let key, name, sub;

    switch (state.mode) {
      case "golha":
        key = item.collectionId;
        name = item.performer;
        sub = item.subtitle;
        break;
      case "ganjoor":
        key = item.poet;
        name = item.poet;
        sub = "";
        break;
      case "hekayat":
        key = item.collectionId || "all";
        name = item.collection || "داستان‌خوانی";
        sub = HEKAYAT_SUB_TEXT[item.collectionId] || "داستان‌های صوتی فارسی";
        break;
      case "meditation":
        key = item.categoryId;
        name = item.category;
        sub = item.subtitle;
        break;
    }

    if (!groups[key]) {
      groups[key] = {
        key, name, sub, items: [],
        works: {},
        workOrder: []
      };
      order.push(key);
    }

    const augmented = { ...item, globalIndex: i };
    groups[key].items.push(augmented);

    const workKey = state.mode === "ganjoor" ? (item.formLabel || "شعر") : item.subCollection;
    if (workKey) {
      const g = groups[key];
      if (!g.works[workKey]) {
        g.works[workKey] = { items: [], chapters: {}, chapterOrder: [] };
        g.workOrder.push(workKey);
      }
      const work = g.works[workKey];
      work.items.push(augmented);
      if (state.mode === "ganjoor" && item.chapterLabel) {
        if (!work.chapters[item.chapterLabel]) {
          work.chapters[item.chapterLabel] = [];
          work.chapterOrder.push(item.chapterLabel);
        }
        work.chapters[item.chapterLabel].push(augmented);
      }
    }
  });

  if (state.mode === "ganjoor") {
    order.forEach((k) => {
      const g = groups[k];
      const workItemMap = {};
      g.workOrder.forEach((w) => { workItemMap[w] = g.works[w].items; });
      g.workOrder = sortFormKeys(g.workOrder, workItemMap);
      g.sub = g.workOrder.join("، ");
      g.workOrder.forEach((w) => {
        const work = g.works[w];
        if (work.chapterOrder.length > 1) {
          work.chapterOrder = sortFormKeys(work.chapterOrder, work.chapters);
        }
      });
      // شاهنامهٔ فردوسی: فصل‌ها به ترتیب روایی خودشان، نه بر اساس تعداد آیتم
      if (k === "ابوالقاسم فردوسی" && g.works["شاهنامه"] && g.works["شاهنامه"].chapterOrder.length > 1) {
        const SHAHNAMEH_ORDER = [
          "آغاز کتاب", "کیومرث", "هوشنگ", "طهمورث", "جمشید", "ضحاک", "فریدون",
          "پادشاهی زوطهماسپ", "پادشاهی گرشاسپ", "منوچهر", "پادشاهی نوذر",
          "پادشاهی کیکاووس و رفتن او به مازندران", "رزم کاووس با شاه هاماوران",
          "داستان کاموس کشانی", "سهراب", "داستان سیاوش", "کیقباد",
          "پادشاهی یزدگرد", "پادشاهی شاپور پسر اردشیر سی و یک سال بود"
        ];
        const pos = {};
        SHAHNAMEH_ORDER.forEach((c, i) => { pos[c] = i; });
        const sh = g.works["شاهنامه"];
        sh.chapterOrder.sort((a, b) => (pos[a] !== undefined ? pos[a] : 999) - (pos[b] !== undefined ? pos[b] : 999));
      }
    });
  }

  // شاعرانی که هنوز (همهٔ) فایلشان بارگذاری نشده، به‌عنوان یک باکس بسته
  // نشان داده می‌شوند — با کلیک، فقط فایل‌های همان شاعر (ممکن است چند
  // فایل باشد، مثلاً مولانا: دیوان شمس + مثنوی) بارگذاری می‌شود.
  // توجه مهم: بعضی شاعران چند فایل دارند با poetName یکسان (مثلاً مولانا
  // هم «فیه ما فیه» را دارد که سبک/غیرتنبل است، هم دیوان شمس و مثنوی که
  // سنگین/تنبل‌اند) — باید فایل‌های تنبلِ باقی‌مانده را حتی وقتی گروه از
  // قبل با محتوای فایل سبک ساخته شده هم پیدا کنیم، وگرنه آن فایل‌های
  // تنبل هیچ‌وقت راهی برای بارگذاری شدن پیدا نمی‌کنند.
  if (state.mode === "ganjoor" && typeof GANJOOR_INDEX !== 'undefined') {
    const pendingByPoet = {};
    GANJOOR_INDEX.forEach((poet) => {
      if (!poet.lazy || _loadedScripts.has(poet.file)) return;
      if (!pendingByPoet[poet.poetName]) pendingByPoet[poet.poetName] = { files: [], sections: [], sizeKB: 0 };
      const p = pendingByPoet[poet.poetName];
      p.files.push(poet.file);
      p.sizeKB += (poet.sizeKB || 0);
      (poet.sections || []).forEach((s) => { if (p.sections.indexOf(s) === -1) p.sections.push(s); });
    });
    Object.keys(pendingByPoet).forEach((poetName) => {
      const p = pendingByPoet[poetName];
      if (groups[poetName]) {
        // شاعر بخشی از آثارش (مثل «فیه ما فیه» برای مولانا) از قبل لود شده،
        // فقط اعلام می‌کنیم بقیهٔ فایل‌ها هنوز مانده‌اند
        groups[poetName].unloadedFiles = p.files;
        groups[poetName].unloadedSub = p.sections.join('، ');
      } else {
        groups[poetName] = {
          key: poetName,
          name: poetName,
          sub: p.sections.join('، '),
          items: [],
          works: {},
          workOrder: [],
          unloadedFiles: p.files,
          sortWeight: p.sizeKB
        };
        order.push(poetName);
      }
    });
  }

  return order.map((k) => groups[k]).sort((a, b) => {
    const wa = a.items.length || a.sortWeight || 0;
    const wb = b.items.length || b.sortWeight || 0;
    return wb - wa;
  });
}

/* ===================================================================
   رندر فهرست پخش
   =================================================================== */
var _justOpenedPoetKey = null;
var _loadingPoetKeys = {};
function loadOnePoetLazy(poetKey, files) {
  if (_loadingPoetKeys[poetKey]) return;
  _loadingPoetKeys[poetKey] = true;
  const fileList = Array.isArray(files) ? files : [files];
  Promise.all(fileList.map((f) => loadScript(f))).then(function() {
    try { if (typeof ganjoorRebuildPoems === 'function') ganjoorRebuildPoems(); } catch (e) {}
    buildGanjoorList();
    _justOpenedPoetKey = poetKey;
    renderPlaylist();
    renderDrawer();
  }).catch(function() {}).finally(function() {
    delete _loadingPoetKeys[poetKey];
  });
}

// وقتی کاربر خودش صریحاً شافلِ «کل فهرست‌های این حالت» یا «کل حالات» را
// فعال می‌کند، یعنی واقعاً دنبال تنوع کامل است — پس همین‌جا (نه در بارگذاری
// اولیهٔ صفحه) بقیهٔ شاعران سنگین را هم در پس‌زمینه بارگذاری می‌کنیم تا
// شافل واقعاً از کل گنجور پخش کند، نه فقط از چیزهایی که تا الان کلیک شده
var _loadingGanjoorProgress = { total: 0, loaded: 0 };
function ensureAllGanjoorPoetsLoaded() {
  if (typeof GANJOOR_INDEX === 'undefined') return Promise.resolve();
  const files = GANJOOR_INDEX.filter((p) => p.lazy && !_loadedScripts.has(p.file)).map((p) => p.file);
  if (!files.length) return Promise.resolve();
  _loadingGanjoorProgress.total = files.length;
  _loadingGanjoorProgress.loaded = 0;
  var BATCH = 4;
  var chain = Promise.resolve();
  function loadBatch(batch) {
    return Promise.all(batch.map(function(f) {
      return loadScript(f).then(function() {
        _loadingGanjoorProgress.loaded++;
        try { if (typeof ganjoorRebuildPoems === 'function') ganjoorRebuildPoems(); } catch (e) {}
        buildGanjoorList();
        if (state.mode === 'ganjoor') { renderPlaylist(); renderDrawer(); }
      }).catch(function() { _loadingGanjoorProgress.loaded++; });
    }));
  }
  for (var i = 0; i < files.length; i += BATCH) {
    (function(b) { chain = chain.then(function() { return loadBatch(b); }); })(files.slice(i, i + BATCH));
  }
  return chain;
}

function renderPlaylist() {
  const root = document.getElementById("playlistRoot");
  root.innerHTML = "";

  if (!currentList().length) {
    root.innerHTML = `<div class="playlist-status">در حال بارگذاری…</div>`;
    return;
  }

  // جستجو فعال: فهرست تخت
  if (_searchQuery && _searchQuery.trim() !== '') {
    var master = currentList();
    var flat = filterListBySearch(master, _searchQuery);
    if (!flat.length) {
      root.innerHTML = '<div class="playlist-status">نتیجه‌ای یافت نشد</div>';
      return;
    }
    flat.forEach(function(item, i) {
      item.globalIndex = master.indexOf(item);
      if (item.globalIndex < 0) item.globalIndex = i;
      appendTrackRow(root, item, i);
    });
    return;
  }

  const groups = groupedForRender();
  if (!groups.length) {
    root.innerHTML = `<div class="playlist-status">فهرستی برای نمایش وجود ندارد.</div>`;
    return;
  }

  groups.forEach((g, gi) => {
    const hasUnloaded = g.unloadedFiles && g.unloadedFiles.length > 0;
    const isPurePlaceholder = hasUnloaded && g.items.length === 0;

    const details = document.createElement("details");
    details.className = "collection";
    if (isPurePlaceholder) details.classList.add("collection-unloaded");
    if (_justOpenedPoetKey && g.key === _justOpenedPoetKey) {
      details.open = true;
    } else if (!_justOpenedPoetKey && gi === 0) {
      details.open = true;
    }
    const summary = document.createElement("summary");

    let countHtml = isPurePlaceholder
      ? `<span class="c-count c-count-lazy">بارگذاری…</span>`
      : `<span class="c-count">${toFa(g.items.length)}</span>`;
    summary.innerHTML = `
      <span>
        <span class="c-name">${g.name}</span>
        <span class="c-sub">${g.sub || ""}</span>
      </span>
      <span style="display:flex;align-items:center;gap:8px;">
        ${countHtml}
        <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    `;
    details.appendChild(summary);

    if (isPurePlaceholder) {
      // فقط همین شاعر (همهٔ فایل‌هایش، شاید چندتا) با کلیک بارگذاری می‌شود
      details.addEventListener('toggle', function onOpenLazyPoet() {
        if (!details.open) return;
        details.removeEventListener('toggle', onOpenLazyPoet);
        loadOnePoetLazy(g.key, g.unloadedFiles);
      });
      root.appendChild(details);
      return;
    }

    if (g.workOrder && g.workOrder.length > 1) {
      g.workOrder.forEach((workKey) => {
        const work = g.works[workKey];
        if (!work || !work.items.length) return;
        const workDetails = document.createElement("details");
        workDetails.className = "sub-collection";
        const workSummary = document.createElement("summary");
        const workCountHtml = `<span class="c-count">${toFa(work.items.length)}</span>`;
        workSummary.innerHTML = `
          <span>
            <span class="c-name">${workKey}</span>
          </span>
          <span style="display:flex;align-items:center;gap:8px;">
            ${workCountHtml}
            <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        `;
        workDetails.appendChild(workSummary);
        details.appendChild(workDetails);

        if (work.chapterOrder.length > 1) {
          work.chapterOrder.forEach((chapterKey) => {
            const chapterItems = work.chapters[chapterKey];
            if (!chapterItems || !chapterItems.length) return;
            const chDetails = document.createElement("details");
            chDetails.className = "sub-sub-collection";
            const chSummary = document.createElement("summary");
            const chCountHtml = `<span class="c-count">${toFa(chapterItems.length)}</span>`;
            chSummary.innerHTML = `
              <span>
                <span class="c-name">${chapterKey}</span>
              </span>
              <span style="display:flex;align-items:center;gap:8px;">
                ${chCountHtml}
                <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            `;
            chDetails.appendChild(chSummary);
            workDetails.appendChild(chDetails);
            chapterItems.forEach((item, i) => appendTrackRow(chDetails, item, i));
          });
        } else {
          work.items.forEach((item, i) => appendTrackRow(workDetails, item, i));
        }
      });
    } else if (state.mode === "ganjoor") {
      g.items.forEach((item, i) => appendTrackRow(details, item, i));
    } else {
      g.items.forEach((item, i) => appendTrackRow(details, item, i));
    }

    if (hasUnloaded) {
      // این شاعر بخشی‌اش لود شده (مثلاً فیه‌ما‌فیهِ مولانا) ولی بقیهٔ
      // آثارش (مثلاً دیوان شمس/مثنوی) هنوز مانده — یک دکمه برای لود بقیه
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'load-more-poet-btn';
      moreBtn.textContent = 'بارگذاری بقیهٔ آثار' + (g.unloadedSub ? (' (' + g.unloadedSub + ')') : '');
      moreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        moreBtn.disabled = true;
        moreBtn.textContent = 'در حال بارگذاری…';
        loadOnePoetLazy(g.key, g.unloadedFiles);
      });
      details.appendChild(moreBtn);
    }

    root.appendChild(details);
  });

  _justOpenedPoetKey = null;
}

function buildTrackTooltip(item) {
  var parts = [];
  if (item.title) parts.push('عنوان: ' + item.title);
  switch (state.mode) {
    case 'golha': parts.push('برنامه: ' + (item.subtitle || '')); parts.push('خواننده: ' + (item.performer || '')); break;
    case 'ganjoor': parts.push('شاعر: ' + (item.poet || '')); parts.push('بخش: ' + (item.formLabel || '')); if (item.chapterLabel) parts.push('فصل: ' + item.chapterLabel); parts.push('خوانش: ' + (item.reciter || '')); break;
    case 'hekayat': parts.push('مجموعه: ' + (item.collection || '')); if (item.subCollection) parts.push('زیرمجموعه: ' + item.subCollection); break;
    case 'meditation': parts.push('دسته: ' + (item.category || '')); if (item.subCollection) parts.push('زیرمجموعه: ' + item.subCollection); break;
  }
  parts.push('حالت: ' + MODE_NAMES[state.mode]);
  return parts.join(' | ');
}

function appendTrackRow(parent, item, i) {
  const row = document.createElement("div");
  row.className = "track-row";
  row.dataset.index = item.globalIndex;
  if (item.globalIndex === state.currentIndex) row.classList.add("active");

  let tag = "";
  const tdisplay = item.title;

  if (state.mode === "ganjoor" && item.formLabel) {
    tag = `<span class="form-tag">${item.formLabel}</span>`;
  }
  if (state.mode === "hekayat" && item.duration) {
    tag = `<span class="form-tag">${toFa(item.duration)}</span>`;
  }
  if (state.mode === "meditation" && item.duration) {
    tag = `<span class="form-tag">${toFa(item.duration)}</span>`;
  }

  row.innerHTML = `
    <span class="idx">${toFa(i + 1)}</span>
    <span class="name">${tdisplay}</span>
    ${tag}
    <span class="eq"><span></span><span></span><span></span></span>
    <button class="pl-add-btn" title="اضافه به فهرست پخش" aria-label="اضافه به فهرست پخش">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </button>
  `;
  row.addEventListener("click", (e) => {
    if (e.target.closest('.pl-add-btn')) {
      addToPlaylist(item);
      return;
    }
    state.playingMode = state.mode;
    state.randomStartDone = true;
    _searchQuery = '';
    var si = document.getElementById('searchInput');
    if (si) si.value = '';
    playIndex(item.globalIndex);
  });
  // hover tooltip
  row.title = buildTrackTooltip(item);
  parent.appendChild(row);
}

function refreshActiveRow() {
  document.querySelectorAll(".track-row").forEach((r) => {
    r.classList.toggle("active", parseInt(r.dataset.index, 10) === state.currentIndex);
  });
}

/* ===================================================================
   به‌روزرسانی ظاهر حالت (mode)
   =================================================================== */
function updateModeUI() {
  const modeName = MODE_NAMES[state.mode] || state.mode;
  document.getElementById("modeLabel").textContent = "حالت: " + modeName;
  document.getElementById("playlistTitle").textContent = MODE_PLAYLIST_TITLES[state.mode] || "فهرست";

  document.body.classList.remove("mode-golha", "mode-ganjoor", "mode-hekayat", "mode-meditation");
  document.body.classList.add("mode-" + state.mode);

  document.querySelectorAll("[id^=modeIcon]").forEach(el => el.style.display = "none");
  const iconId = "modeIcon" + state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  const icon = document.getElementById(iconId);
  if (icon) icon.style.display = "block";

  const colors = {
    golha: "var(--gold)",
    ganjoor: "var(--accent-2)",
    hekayat: "var(--accent)",
    meditation: "#9b6db5"
  };
  document.getElementById("modeEmblem").style.borderColor = colors[state.mode] || "var(--gold)";

  document.querySelectorAll(".mode-dot").forEach(dot => {
    dot.classList.toggle("active", dot.dataset.mode === state.mode);
  });
  document.querySelectorAll(".mode-choice").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === state.mode);
  });
}

/* ===================================================================
   کشوی اطلاعات
   =================================================================== */
function renderDrawer() {
  const content = document.getElementById("drawerContent");
  const list = playbackList();
  const item = list[state.currentIndex];
  if (!item) {
    content.innerHTML = `<div class="drawer-empty">برای دیدن اطلاعات، گزینه‌ای را انتخاب کنید.</div>`;
    return;
  }
  // re-apply saved font color helper
  function applyFontColor() {
    try {
      var c = localStorage.getItem('golava-fontcolor');
      if (c) document.querySelectorAll('.drawer-content .drawer-body, .drawer-content h3, .drawer-content .drawer-meta').forEach(function(el) { el.style.color = c; });
    } catch(e) {}
  }

  switch (item.mode) {
    case "golha": {
      const golhaSrc = (item.collectionId === 'playlist')
        ? { label: 'پلی‌لیست — مختار رزمجو', url: 'https://castbox.fm/vh/2480138' }
        : { label: 'آرشیو آزاد اینترنت (archive.org) — مجموعهٔ موسیقی اصیل ایرانی', url: 'https://archive.org/details/mousighi-irani' };
      content.innerHTML = `
        <h3>${item.title}</h3>
        <div class="drawer-meta">${item.performer} — ${item.subtitle || ""}</div>
        <div class="drawer-body">${item.info || ""}</div>
        <div class="drawer-meta" style="margin-top:12px;">منبع: <a href="${golhaSrc.url}" target="_blank" style="color:var(--accent);">${golhaSrc.label}</a></div>
      `;
      break;
    }

    case "ganjoor": {
      const isFerdowsiReading = item.formLabel === 'فردوسی‌خوانی-امیر خادم';
      const ganjoorSrcHtml = isFerdowsiReading
        ? ('منبع: فردوسی‌خوانی — امیر خادم' + (item.url ? ' — <a href="' + item.url + '" target="_blank" style="color:var(--accent);">مشاهدهٔ صفحهٔ پادکست</a>' : ''))
        : ('خوانشگر: ' + (item.reciter || "نامشخص") + ' — منبع: گنجور (ganjoor.net)' + (item.url ? ' — <a href="' + item.url + '" target="_blank" style="color:var(--accent);">مشاهده در گنجور</a>' : ''));
      content.innerHTML = `
        <h3>${item.fullTitle || item.title}</h3>
        <div class="drawer-meta">شاعر: ${item.poet}${item.formLabel ? " — بخش: " + item.formLabel : ""}</div>
        <div class="drawer-body">${(item.text || "").replace(/\n/g, "<br>")}</div>
        <div class="drawer-meta" style="margin-top:12px;">${ganjoorSrcHtml}</div>
      `;
      break;
    }

    case "hekayat": {
      const srcMap = {
        ketabsoti: { label: 'کتاب صوتی ناصر زراعتی — CastBox', url: 'https://castbox.fm/vh/3469150' },
        hezaroiekshab: { label: 'هزار و یکشب — archive.org', url: 'https://hezaroiekshab.blogspot.com' },
        golestan: { label: 'گلستان سعدی', url: 'https://ganjoor.net/saadi/golestan' },
        ghesegoo: { label: 'قصه‌گو — CastBox', url: 'https://castbox.fm/vh/6684477' },
        ketabkhane_baba: { label: 'کتابخانه بابا — CastBox', url: 'https://castbox.fm/vh/6159947' },
        tarikh_beihaghi: { label: 'دیبای دیداری — تاریخ بیهقی', url: 'https://castbox.fm/vh/4558343' }
      };
      const src = srcMap[item.collectionId] || { label: 'رادیو حکایت — تهران پادکست', url: 'https://tehranpodcast.ir/radiohekayat/' };
      content.innerHTML = `
        <h3>${item.title}</h3>
        <div class="drawer-meta">${item.collection || item.author || ""}${item.duration ? " — مدت: " + item.duration : ""}</div>
        <div class="drawer-body">${(item.info || "").replace(/\n/g, "<br>")}</div>
        <div class="drawer-meta" style="margin-top:12px;">منبع: <a href="${src.url}" target="_blank" style="color:var(--accent);">${src.label}</a>${item.url ? ' — <a href="' + item.url + '" target="_blank" style="color:var(--accent-2);">مشاهده صفحه اپیزود</a>' : ""}</div>
      `;
      break;
    }

    case "meditation": {
      const medSrc = (function() {
        const id = item.collectionId || item.categoryId;
        if (id === "khabcast") return { label: "خوابکست — CastBox", url: "https://castbox.fm/channel/id6408013" };
        if (id === "mother-child") return { label: "کانال همراه مادر و کودک — CastBox", url: "https://castbox.fm/channel/id2538237" };
        if (id === "shab-bekheir") return { label: "شب بخیر کوچولو — CastBox", url: "https://castbox.fm/channel/id4946220" };
        if (id === "cafe-khial") return { label: "کافه خیال — CastBox", url: "https://castbox.fm/channel/id5655497" };
        if (id === "dastan-shab") return { label: "داستان شب کودک — CastBox", url: "https://castbox.fm/channel/id4801837" };
        if (id === "mindful") return { label: "آشنایی با مدیتیشن و این پادکست", url: "https://tehranpodcast.ir/mindful-life/" };
        if (id === "persian-instruments") return { label: "سازهای ایرانی — سنتور، تار و کمانچه (archive.org)", url: "https://archive.org/details/santur-faramarz-payvar" };
        if (id === "tibetan") return { label: "زنگ‌های تبتی و صداهای معنوی (archive.org)", url: "https://archive.org/details/TibetanBowls_201809" };
        return { label: "مدیتیشن و آرامش", url: "#" };
      })();
      content.innerHTML = `
        <h3>${item.title}</h3>
        <div class="drawer-meta">${item.category || item.collection || "مدیتیشن"}${item.duration ? " — مدت: " + item.duration : ""}</div>
        <div class="drawer-body">${item.info || ""}</div>
        <div class="drawer-meta" style="margin-top:12px;">منبع: <a href="${medSrc.url}" target="_blank" style="color:var(--accent);">${medSrc.label}</a></div>
      `;
      break;
    }
}
  applyFontColor();
}


/* ===================================================================
   جستجو
   =================================================================== */
var _searchQuery = '';

function filterListBySearch(list, query) {
  if (!query || query.trim() === '') return list;
  var q = query.trim().toLowerCase();
  return list.filter(function(item) {
    var title = (item.title || '').toLowerCase();
    var author = (item.author || item.performer || item.category || item.poet || item.collection || '').toLowerCase();
    var info = (item.info || '').toLowerCase();
    var collection = (item.collection || item.category || '').toLowerCase();
    return title.indexOf(q) >= 0 || author.indexOf(q) >= 0 || info.indexOf(q) >= 0 || collection.indexOf(q) >= 0;
  });
}
/* ===================================================================
   فهرست پخش (Playlist Queue)
   =================================================================== */
function addToPlaylist(item) {
  var entry = { src: item.src, url: item.url, title: item.title, mode: item.mode, performer: item.performer, poet: item.poet, author: item.author, category: item.category, collection: item.collection, subtitle: item.subtitle, reciter: item.reciter, formLabel: item.formLabel, categoryId: item.categoryId, collectionId: item.collectionId, subCollection: item.subCollection, duration: item.duration, info: item.info, text: item.text, fullTitle: item.fullTitle, chapterLabel: item.chapterLabel, synthType: item.synthType };
  state.playlist.push(entry);
  renderPlaylistQueue();
  showToast('به فهرست پخش اضافه شد: ' + item.title);
}

function removeFromPlaylist(index) {
  state.playlist.splice(index, 1);
  renderPlaylistQueue();
}

function movePlaylistItem(fromIdx, toIdx) {
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= state.playlist.length || toIdx >= state.playlist.length) return;
  var item = state.playlist.splice(fromIdx, 1)[0];
  state.playlist.splice(toIdx, 0, item);
  renderPlaylistQueue();
}

var _playlistQueuePlaying = false;

function playFromPlaylist(index) {
  if (index < 0 || index >= state.playlist.length) return;
  state.playingMode = state.playlist[index].mode;
  var targetMode = state.playlist[index].mode;
  var targetList = listForMode(targetMode);
  var src = state.playlist[index].src;
  var gi = targetList.findIndex(function(it) { return it.src === src; });
  if (gi >= 0) {
    if (state.mode !== targetMode) {
      state.mode = targetMode;
      updateModeUI();
      renderPlaylist();
    }
    _playlistQueuePlaying = true;
    state.randomStartDone = true;
    playIndex(gi);
  } else {
    var item = state.playlist[index];
    if (item.synthType) {
      playSynthNoise(item.synthType);
      document.getElementById('npTitle').textContent = item.title;
      document.getElementById('npSub').textContent = item.category || 'مدیتیشن';
      document.getElementById('npArtist').textContent = item.title;
      if (document.getElementById('miniTitle')) document.getElementById('miniTitle').textContent = item.title;
      state.playing = true;
      updateTransportUI();
    } else {
      stopSynthNoise();
      audio.src = item.src;
      audio.play().then(function() {
        state.playing = true;
        updateTransportUI();
      }).catch(function() {
        state.playing = false;
        updateTransportUI();
      });
      document.getElementById('npTitle').textContent = item.title;
      document.getElementById('npSub').textContent = item.subtitle || item.category || item.collection || '';
      document.getElementById('npArtist').textContent = item.performer || item.poet || item.author || '';
      if (document.getElementById('miniTitle')) document.getElementById('miniTitle').textContent = item.title;
    }
    state.playingMode = item.mode;
    updateMediaSessionMetadata(item);
    state.currentIndex = -1;
    refreshActiveRow();
    renderDrawer();
    updateTransportUI();
  }
  renderPlaylistQueue();
}

function renderPlaylistQueue() {
  var container = document.getElementById('playlistItems');
  if (!container) return;
  var countEl = document.getElementById('playlistCount');
  if (countEl) countEl.textContent = toFa(state.playlist.length);
  if (!state.playlist.length) {
    container.innerHTML = '<div class="playlist-empty">هنوز هیچ فایلی اضافه نشده</div>';
    return;
  }
  container.innerHTML = '';
  state.playlist.forEach(function(item, i) {
    var row = document.createElement('div');
    row.className = 'playlist-item';
    row.draggable = true;
    row.dataset.index = i;

    var label = '';
    if (item.mode === 'golha') label = 'گل‌ها';
    else if (item.mode === 'ganjoor') label = 'شعرخوان';
    else if (item.mode === 'hekayat') label = 'نثرخوان';
    else if (item.mode === 'meditation') label = 'مدیتیشن';

    var subInfo = item.subtitle || item.collection || item.category || item.poet || '';

    // هایلایت آیتم در حال پخش
    if (state.currentIndex >= 0) {
      var currentTrack = playbackList()[state.currentIndex];
      if (currentTrack && currentTrack.src === item.src) row.classList.add('active');
    }

    row.innerHTML = '<div class="pl-item-drag">≡</div><div class="pl-item-info"><span class="pl-item-title">' + item.title + '</span><span class="pl-item-sub">' + label + ' — ' + subInfo + '</span></div><button class="pl-item-remove" data-plidx="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';

    row.addEventListener('click', function(e) {
      if (e.target.closest('.pl-item-remove')) return;
      state.playlistEnabled = true;
      togglePlaylistOnOff(true);
      _playlistQueuePlaying = true;
      playFromPlaylist(parseInt(this.dataset.index, 10));
    });

    var rmv = row.querySelector('.pl-item-remove');
    rmv.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(this.dataset.plidx, 10);
      removeFromPlaylist(idx);
    });

    row.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', this.dataset.index);
      this.classList.add('pl-dragging');
    });
    row.addEventListener('dragend', function(e) {
      this.classList.remove('pl-dragging');
      document.querySelectorAll('.pl-drag-over').forEach(function(el) { el.classList.remove('pl-drag-over'); });
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      document.querySelectorAll('.pl-drag-over').forEach(function(el) { el.classList.remove('pl-drag-over'); });
      this.classList.add('pl-drag-over');
    });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('pl-drag-over');
      var fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      var toIdx = parseInt(this.dataset.index, 10);
      if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
        movePlaylistItem(fromIdx, toIdx);
      }
    });

    var fullInfo = item.title;
    var pathParts = [];
    if (subInfo) pathParts.push(subInfo);
    if (label) pathParts.push(label);
    if (pathParts.length) fullInfo += '\n' + pathParts.join(' › ');
    if (item.performer && item.performer !== subInfo) fullInfo += '\nخواننده: ' + item.performer;
    if (item.duration) fullInfo += '\nمدت: ' + item.duration;
    row.title = fullInfo;

    container.appendChild(row);
  });
  updatePlaylistOnOffUI();
  updatePlaylistRepeatUI();
  updatePlaylistShuffleUI();
}

function togglePlaylistOnOff(forceOn) {
  if (forceOn === true) state.playlistEnabled = true;
  else if (forceOn === false) state.playlistEnabled = false;
  else state.playlistEnabled = !state.playlistEnabled;
  updatePlaylistOnOffUI();
  var sb = document.getElementById('shuffleBtn');
  var rb = document.getElementById('repeatBtn');
  var q = document.getElementById('playlistQueue');
  if (state.playlistEnabled) {
    if (sb) sb.classList.add('pl-disabled');
    if (rb) rb.classList.add('pl-disabled');
    if (q) q.classList.add('pl-enabled');
  } else {
    if (sb) sb.classList.remove('pl-disabled');
    if (rb) rb.classList.remove('pl-disabled');
    if (q) q.classList.remove('pl-enabled');
  }
}

function updatePlaylistOnOffUI() {
  var btn = document.getElementById('playlistOnOffBtn');
  if (!btn) return;
  btn.classList.toggle('active', !!state.playlistEnabled);
  var q = document.getElementById('playlistQueue');
  if (q) q.classList.toggle('pl-on', !!state.playlistEnabled);
}

function cyclePlaylistRepeat() {
  var modes = ['off', 'all', 'one'];
  var curIdx = modes.indexOf(state.playlistRepeat);
  state.playlistRepeat = modes[(curIdx + 1) % modes.length];
  updatePlaylistRepeatUI();
}

function cyclePlaylistShuffle() {
  state.playlistShuffle = !state.playlistShuffle;
  updatePlaylistShuffleUI();
}

function updatePlaylistShuffleUI() {
  var btn = document.getElementById('playlistShuffleBtn');
  if (!btn) return;
  btn.classList.toggle('active', !!state.playlistShuffle);
  btn.title = state.playlistShuffle ? 'شافل: روشن' : 'شافل: خاموش';
}

function updatePlaylistRepeatUI() {
  var btn = document.getElementById('playlistRepeatBtn');
  if (!btn) return;
  var titles = { off: 'تکرار: خاموش', all: 'تکرار: کل فهرست پخش', one: 'تکرار: همین فایل' };
  btn.title = titles[state.playlistRepeat] || titles.off;
  btn.classList.toggle('active', state.playlistRepeat !== 'off');
  var badge = state.playlistRepeat === 'one' ? '۱' : '';
  var existing = btn.querySelector('.pl-repeat-badge');
  if (badge) {
    if (!existing) { var el = document.createElement('span'); el.className = 'pl-repeat-badge'; btn.appendChild(el); existing = el; }
    existing.textContent = badge;
  } else if (existing) existing.remove();
}

function playlistAdvance(direction) {
  if (!state.playlistEnabled || !state.playlist.length) return;
  if (state.playlistRepeat === 'one' && state.currentIndex !== -1 && direction === 'next') {
    playIndex(state.currentIndex);
    return;
  }
  var currentItem = playbackList()[state.currentIndex];
  var src = currentItem ? currentItem.src : '';
  var currentPlIdx = -1;
  state.playlist.forEach(function(pl, idx) { if (pl.src === src) currentPlIdx = idx; });

  // شافل: پخش تصادفی
  if (state.playlistShuffle && state.playlist.length > 1) {
    var avail = [];
    for (var i = 0; i < state.playlist.length; i++) {
      if (i !== currentPlIdx) avail.push(i);
    }
    if (avail.length) {
      playFromPlaylist(avail[Math.floor(Math.random() * avail.length)]);
    }
    return;
  }

  if (currentPlIdx < 0) {
    if (state.playlist.length) { playFromPlaylist(0); }
    return;
  }
  var nextIdx;
  if (direction === 'next') {
    nextIdx = currentPlIdx + 1;
    if (nextIdx >= state.playlist.length) {
      if (state.playlistRepeat === 'all') nextIdx = 0;
      else { stopPlaybackAtEnd(); return; }
    }
  } else {
    nextIdx = currentPlIdx - 1;
    if (nextIdx < 0) {
      if (state.playlistRepeat === 'all') nextIdx = state.playlist.length - 1;
      else return;
    }
  }
  playFromPlaylist(nextIdx);
}

/* ===================================================================
   پخش
   =================================================================== */
function playIndex(i) {
  const list = playbackList();
  if (!list.length) return;
  if (i < 0) i = list.length - 1;
  if (i >= list.length) i = 0;
  state.currentIndex = i;
  const item = list[i];
  updateMediaSessionMetadata(item);

  if (item.synthType) {
    playSynthNoise(item.synthType);
  } else {
    stopSynthNoise();
    audio.src = item.src;
    audio.play().then(() => {
      state.playing = true;
      updateTransportUI();
    }).catch(() => {
      state.playing = false;
      updateTransportUI();
    });
  }

  document.getElementById("npTitle").textContent = item.title;
  const miniTitleEl = document.getElementById("miniTitle");
  if (miniTitleEl) miniTitleEl.textContent = item.title;

  switch (item.mode) {
    case "golha":
      document.getElementById("npArtist").textContent = item.performer || "";
      document.getElementById("npSub").textContent = item.subtitle || "رادیو آواک";
      break;
    case "ganjoor":
      document.getElementById("npArtist").textContent = item.poet || "";
      document.getElementById("npSub").textContent = item.reciter ? "خوانش: " + item.reciter : "شعرخوان گنجور";
      break;
    case "hekayat":
      document.getElementById("npArtist").textContent = item.author || "رادیو حکایت";
      document.getElementById("npSub").textContent = item.duration ? "مدت: " + toFa(item.duration) : "داستان‌خوانی";
      break;
    case "meditation":
      document.getElementById("npArtist").textContent = item.category || "مدیتیشن";
      document.getElementById("npSub").textContent = item.duration ? "مدت: " + toFa(item.duration) : "آرامش و مدیتیشن";
      break;
  }

  refreshActiveRow();
  renderDrawer();
  updateTransportUI();
}

function togglePlay() {
  if (!state.randomStartDone) {
    const list = currentList();
    if (!list.length) return;
    let startIdx = Math.floor(Math.random() * list.length);
    state.playingMode = state.mode;
    state.randomStartDone = true;
    playIndex(startIdx);
    return;
  }
  const item = playbackList()[state.currentIndex];
  if (item && item.synthType) {
    if (noiseCtx && noiseCtx.state === 'running') {
      noiseCtx.suspend();
      state.playing = false;
      updateTransportUI();
    } else if (noiseCtx) {
      noiseCtx.resume();
      state.playing = true;
      updateTransportUI();
    }
    return;
  }
  if (audio.paused) {
    audio.play().then(() => {
      state.playing = true;
      updateTransportUI();
    }).catch(() => {});
  } else {
    audio.pause();
    state.playing = false;
    updateTransportUI();
  }
}

function sameCategoryIndices(list, categoryId) {
  const out = [];
  list.forEach((it, idx) => { if (it.categoryId === categoryId) out.push(idx); });
  return out;
}

function activeGroupKey(mode, item) {
  if (!item) return null;
  switch (mode) {
    case "golha": return item.collectionId;
    case "ganjoor": return item.poet;
    case "hekayat": return item.collectionId;
    case "meditation": return item.categoryId;
    default: return null;
  }
}

function sameGroupIndices(list, mode, key) {
  const out = [];
  list.forEach((it, idx) => { if (activeGroupKey(mode, it) === key) out.push(idx); });
  return out;
}

/* زیرفهرست — سطح ریزتر از «فهرست». در گنجور یعنی «همین شاعر + همین قالب
   شعر + همین باب/فصل» (باید حتماً شاعر هم در کلید باشد، وگرنه مثلاً
   «ترجیع‌بند» عبید و «ترجیع‌بند» سعدی قاطی می‌شوند). در حالت‌هایی که
   زیرفهرست واقعی دارند (مثل هزار و یک شب یا موسیقی نواحی، با فیلد
   subCollection) یعنی «همین فهرست + همین زیرمجموعه». اگر فهرستی اصلاً
   زیرفهرست ندارد (مثل گلستان سعدی)، به همان «فهرست» برمی‌گردد — یعنی
   شافل/تکرارِ زیرفهرست، در چنین فهرستی خودش را با فهرست یکی می‌کند. */
function subGroupKeyFor(mode, item) {
  if (mode === 'ganjoor') {
    return (item.poet || '') + '|' + (item.formLabel || '') + '|' + (item.chapterLabel || '');
  }
  if (item.subCollection) {
    return activeGroupKey(mode, item) + '|' + item.subCollection;
  }
  return activeGroupKey(mode, item);
}
function subGroupIndices(list, mode, key) {
  const out = [];
  list.forEach((it, idx) => { if (subGroupKeyFor(mode, it) === key) out.push(idx); });
  return out;
}

/* ===================================================================
   شافل کل حالت‌ها — پخش تصادفی از میان هر چهار حالت
   =================================================================== */
function ensureAllModesLoaded() {
  return Promise.all(MODE_ORDER.map((m) => ensureModeLoaded(m)));
}

function allModesFlatIndex() {
  const out = [];
  MODE_ORDER.forEach(function(m) {
    if (m === 'ganjoor') {
      state.ganjoorList.forEach(function(item, idx) { out.push({ mode: 'ganjoor', idx: idx }); });
      // شاعران لودنشدهٔ گنجور: یک جایگزین مجازی
      if (typeof GANJOOR_INDEX !== 'undefined') {
        GANJOOR_INDEX.forEach(function(poet) {
          if (!poet.lazy) return;
          if (_loadedScripts.has(poet.file)) return;
          out.push({ mode: 'ganjoor', idx: -1, lazyPoet: poet });
        });
      }
    } else {
      if (_modeLoaded[m]) {
        listForMode(m).forEach(function(item, idx) { out.push({ mode: m, idx: idx }); });
      } else {
        // حالت لود نشده (هکایت یا مدیتیشن): یه placeholder تا شافل همه حالات رو ببینه
        out.push({ mode: m, idx: -1, lazyMode: true });
      }
    }
  });
  return out;
}

function playAcrossModes(excludeMode, excludeIdx) {
  const all = allModesFlatIndex();
  if (!all.length) return;
  function randomPick() {
    let pick;
    if (all.length === 1) {
      pick = all[0];
    } else {
      do {
        pick = all[Math.floor(Math.random() * all.length)];
      } while (pick.mode === excludeMode && pick.idx === excludeIdx);
    }
    return pick;
  }
  var pick = randomPick();
  if (!pick) return;

  // حالت لودنشده (هکایت/مدیتیشن): لود کن، بعد یک آیتم تصادفی انتخاب کن
  if (pick.lazyMode) {
    ensureModeLoaded(pick.mode).then(function() {
      // حالا شافل رو دوباره صدا بزن — این بار حالت لود شده هست
      playAcrossModes(excludeMode, excludeIdx);
    });
    return;
  }

  // شاعر لودنشده: لود کن، بعد یک شعر تصادفی ازش پخش کن
  // نکته مهم: چند فایلِ یک شاعر (مثل دیوان شمس و مثنوی مولانا) ممکن است
  // هم‌زمان در صف لود باشند یا لود شده باشند؛ این‌جا فقط همان فایلی که
  // انتخاب شد لود می‌شود تا رفتار شافل سبک بماند و از همهٔ شاعران پخش کند
  if (pick.lazyPoet) {
    loadScript(pick.lazyPoet.file).then(function() {
      try { if (typeof ganjoorRebuildPoems === 'function') ganjoorRebuildPoems(); } catch (e) {}
      buildGanjoorList();
      if (state.mode === 'ganjoor') { renderPlaylist(); renderDrawer(); }
      // یک شعر تصادفی از این شاعر پیدا کن — نکته: بعضی شاعران (مثل مولانا)
      // چند فایل دارند با poetName یکسان؛ همهٔ فایل‌های لودشدهٔ همین شاعر را
      // در نظر بگیر، نه فقط فایلی که الان لود کردیم
      var poetName = pick.lazyPoet.poetName;
      var candidates = [];
      state.ganjoorList.forEach(function(it, idx) { if (it.poet === poetName) candidates.push(idx); });
      if (candidates.length) {
        var pickIdx = candidates[Math.floor(Math.random() * candidates.length)];
        if (state.mode !== 'ganjoor') {
          state.mode = 'ganjoor';
          state.randomStartDone = true;
          updateModeUI();
          renderPlaylist();
        }
        state.playingMode = 'ganjoor';
        playIndex(pickIdx);
      } else {
        // اگر شعری پیدا نشد دوباره امتحان کن
        playAcrossModes(excludeMode, excludeIdx);
      }
    }).catch(function() {
      playAcrossModes(excludeMode, excludeIdx);
    });
    return;
  }

  ensureModeLoaded(pick.mode).then(function() {
    if (state.mode !== pick.mode) {
      state.mode = pick.mode;
      state.randomStartDone = true;
      updateModeUI();
      renderPlaylist();
    }
    state.playingMode = pick.mode;
    playIndex(pick.idx);
  });
}

function stopPlaybackAtEnd() {
  audio.pause();
  stopSynthNoise();
  if (noiseCtx) { try { noiseCtx.suspend(); } catch (e) {} }
  state.playing = false;
  updateTransportUI();
}

function pickRandomExcluding(indices, exclude) {
  if (!indices.length) return -1;
  if (indices.length === 1) return indices[0];
  let idx;
  do { idx = indices[Math.floor(Math.random() * indices.length)]; } while (idx === exclude);
  return idx;
}

function nextTrack() {
  if (state.playlistEnabled && state.playlist.length) {
    playlistAdvance('next');
    return;
  }
  const list = playbackList();
  if (!list.length) return;

  if (state.currentIndex === -1) { togglePlay(); return; }

  if (state.shuffleMode === 'allModes') {
    playAcrossModes(state.playingMode || state.mode, state.currentIndex);
    return;
  }

  if (state.shuffleMode === 'modeList') {
    const allIdx = list.map((_, i) => i);
    playIndex(pickRandomExcluding(allIdx, state.currentIndex));
    return;
  }

  if (state.mode === "meditation") {
    const cat = list[state.currentIndex].categoryId;
    const sameCat = sameCategoryIndices(list, cat);
    if (state.shuffleMode === 'list' || state.shuffleMode === 'subList') {
      playIndex(pickRandomExcluding(sameCat, state.currentIndex));
      return;
    }
    const pos = sameCat.indexOf(state.currentIndex);
    if (pos === -1 || pos === sameCat.length - 1) {
      if (state.repeatMode === 'list' && sameCat.length) { playIndex(sameCat[0]); return; }
      stopPlaybackAtEnd();
      return;
    }
    playIndex(sameCat[pos + 1]);
    return;
  }

  if (state.shuffleMode === 'list') {
    const curKey = activeGroupKey(state.mode, list[state.currentIndex]);
    const sameGroup = sameGroupIndices(list, state.mode, curKey);
    playIndex(pickRandomExcluding(sameGroup, state.currentIndex));
    return;
  }
  if (state.shuffleMode === 'subList') {
    const curSubKey = subGroupKeyFor(state.mode, list[state.currentIndex]);
    const sameSub = subGroupIndices(list, state.mode, curSubKey);
    playIndex(pickRandomExcluding(sameSub, state.currentIndex));
    return;
  }

  if (state.repeatMode === 'list') {
    const curSubKey = subGroupKeyFor(state.mode, list[state.currentIndex]);
    const sameSub = subGroupIndices(list, state.mode, curSubKey);
    const pos = sameSub.indexOf(state.currentIndex);
    if (pos === -1 || pos === sameSub.length - 1) { playIndex(sameSub[0]); return; }
    playIndex(sameSub[pos + 1]);
    return;
  }
  let idx = state.currentIndex + 1;
  if (idx >= list.length) { stopPlaybackAtEnd(); return; }
  playIndex(idx);
}

function prevTrack() {
  if (state.playlistEnabled && state.playlist.length) {
    playlistAdvance('prev');
    return;
  }
  const list = playbackList();
  if (!list.length) return;

  if (state.currentIndex === -1) { togglePlay(); return; }

  if (state.shuffleMode === 'allModes') {
    playAcrossModes(state.playingMode || state.mode, state.currentIndex);
    return;
  }

  if (state.shuffleMode === 'modeList') {
    const allIdx = list.map((_, i) => i);
    playIndex(pickRandomExcluding(allIdx, state.currentIndex));
    return;
  }

  if (state.mode === "meditation") {
    const cat = list[state.currentIndex].categoryId;
    const sameCat = sameCategoryIndices(list, cat);
    if (state.shuffleMode === 'list' || state.shuffleMode === 'subList') {
      playIndex(pickRandomExcluding(sameCat, state.currentIndex));
      return;
    }
    const pos = sameCat.indexOf(state.currentIndex);
    if (pos <= 0) {
      if (state.repeatMode === 'list' && sameCat.length) { playIndex(sameCat[sameCat.length - 1]); return; }
      return;
    }
    playIndex(sameCat[pos - 1]);
    return;
  }

  if (state.shuffleMode === 'list') {
    const curKey = activeGroupKey(state.mode, list[state.currentIndex]);
    const sameGroup = sameGroupIndices(list, state.mode, curKey);
    playIndex(pickRandomExcluding(sameGroup, state.currentIndex));
    return;
  }
  if (state.shuffleMode === 'subList') {
    const curSubKey = subGroupKeyFor(state.mode, list[state.currentIndex]);
    const sameSub = subGroupIndices(list, state.mode, curSubKey);
    playIndex(pickRandomExcluding(sameSub, state.currentIndex));
    return;
  }

  if (state.repeatMode === 'list') {
    const curSubKey = subGroupKeyFor(state.mode, list[state.currentIndex]);
    const sameSub = subGroupIndices(list, state.mode, curSubKey);
    const pos = sameSub.indexOf(state.currentIndex);
    if (pos <= 0) { playIndex(sameSub[sameSub.length - 1]); return; }
    playIndex(sameSub[pos - 1]);
    return;
  }
  let idx = state.currentIndex - 1;
  if (idx < 0) { return; }
  playIndex(idx);
}

function updateTransportUI() {
  const playIcon = document.getElementById("playIcon");
  const pauseIcon = document.getElementById("pauseIcon");
  playIcon.style.display = state.playing ? "none" : "block";
  pauseIcon.style.display = state.playing ? "block" : "none";
  document.getElementById("disc").classList.toggle("spinning", state.playing);
  document.getElementById("tonearm").classList.toggle("playing", state.playing);

  const miniPlayIcon = document.getElementById("miniPlayIcon");
  const miniPauseIcon = document.getElementById("miniPauseIcon");
  if (miniPlayIcon && miniPauseIcon) {
    miniPlayIcon.style.display = state.playing ? "none" : "block";
    miniPauseIcon.style.display = state.playing ? "block" : "none";
  }
}

/* ===================================================================
   شافل و تکرار — دکمه‌های چند حالته
   =================================================================== */
const SHUFFLE_CYCLE = ['allModes', 'modeList', 'list', 'subList', 'off'];
const REPEAT_CYCLE = ['one', 'list', 'off'];
const SHUFFLE_TITLES = {
  off: 'شافل: خاموش',
  allModes: 'شافل: کل فهرست‌های کل حالات',
  modeList: 'شافل: کل فهرست‌های این حالت',
  list: 'شافل: این فهرست',
  subList: 'شافل: این زیرفهرست'
};
const SHUFFLE_BADGES = {
  allModes: 'همه حالت‌ها',
  modeList: 'این حالت',
  list: 'این فهرست',
  subList: 'این زیرفهرست'
};
const REPEAT_TITLES = {
  off: 'تکرار: خاموش',
  list: 'تکرار: همین زیرفهرست',
  one: 'تکرار: همین فایل در حال پخش'
};

/*
 * قانون هماهنگی شافل و تکرار — این دو دکمه دو بعد جداگانه از یک پخش‌کننده‌اند
 * (شافل = «ترتیب» پخش، تکرار = «مرز» پخش) اما بعضی ترکیب‌ها بی‌معنی یا
 * گمراه‌کننده‌اند و باید خودکار حل شوند تا کاربر با دو دکمهٔ روشن که با هم
 * تناقض دارند مواجه نشود:
 *  ۱) «تکرار همین فایل» یعنی هیچ‌وقت جای دیگری نرو؛ این با هر نوع شافل
 *     (که یعنی همیشه برو جای دیگر) در تضاد است، پس با فعال شدن هرکدام،
 *     آن یکی خاموش می‌شود.
 *  ۲) «تکرار همین فهرست» وقتی با «شافل کل حالت‌ها» ترکیب شود بی‌معنی است،
 *     چون در آن حالت اصلاً یک «فهرست» واحد وجود ندارد که تکرار شود.
 * ترکیب «شافل فهرست/حالت» با «تکرار همین فهرست» مشکلی ندارد و مثل بیشتر
 * پخش‌کننده‌ها (مثلاً شافل + تکرار همه در اسپاتیفای) قابل فهم و کاربردی است.
 */
function resolveShuffleRepeatConflict() {
  if (state.shuffleMode !== 'off' && state.repeatMode === 'one') {
    state.repeatMode = 'off';
  }
  if (state.shuffleMode === 'allModes' && state.repeatMode === 'list') {
    state.repeatMode = 'off';
  }
}

function setStateBadge(btn, text, extraClass) {
  let badgeEl = btn.querySelector('.' + extraClass);
  if (text) {
    if (!badgeEl) {
      badgeEl = document.createElement('span');
      badgeEl.className = extraClass;
      btn.appendChild(badgeEl);
    }
    badgeEl.textContent = text;
  } else if (badgeEl) {
    badgeEl.remove();
  }
}

function updateShuffleUI() {
  const btn = document.getElementById('shuffleBtn');
  if (!btn) return;
  btn.classList.toggle('active', state.shuffleMode !== 'off');
  const title = SHUFFLE_TITLES[state.shuffleMode] || SHUFFLE_TITLES.off;
  btn.title = title;
  btn.setAttribute('aria-label', title);
  let badge = SHUFFLE_BADGES[state.shuffleMode] || '';
  setStateBadge(btn, badge, 'state-badge');
}

function updateRepeatUI() {
  const btn = document.getElementById('repeatBtn');
  if (!btn) return;
  btn.classList.toggle('active', state.repeatMode !== 'off');
  const title = REPEAT_TITLES[state.repeatMode] || REPEAT_TITLES.off;
  btn.title = title;
  btn.setAttribute('aria-label', title);
  setStateBadge(btn, state.repeatMode === 'one' ? '۱' : '', 'one-badge');
}

/* ===================================================================
   رنگ متن / رنگ پوسته
   =================================================================== */
let _colorMode = 'text';

/* ابزار ترکیب رنگ — برای ساخت طیف‌های روشن/تیره از رنگ انتخابی، با توجه
   به پالت رنگ تمِ فعلی (روشن/تیره/رنگ‌های واسطه‌ای هر تم) */
function parseCssColor(str) {
  str = (str || '').trim();
  if (!str) return null;
  if (str[0] === '#') {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
  }
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (m) {
    return { r: parseFloat(m[1]), g: parseFloat(m[2]), b: parseFloat(m[3]), a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
  }
  return null;
}
function mixColors(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
    a: c1.a + (c2.a - c1.a) * t
  };
}
function colorToCss(c) {
  const r = Math.round(Math.max(0, Math.min(255, c.r)));
  const g = Math.round(Math.max(0, Math.min(255, c.g)));
  const b = Math.round(Math.max(0, Math.min(255, c.b)));
  const a = Math.max(0, Math.min(1, c.a));
  if (a >= 1) {
    return '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
  }
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (Math.round(a * 1000) / 1000) + ')';
}
function themeVar(name, fallback) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) { return fallback; }
}

function applySkinColor(color) {
  const base = parseCssColor(color);
  if (!base) return;
  const root = document.documentElement;
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };

  // پردهٔ پررنگ‌تر (برای هایلایت/هاور) و پردهٔ کم‌رنگ‌تر (برای گرادینت حباب)
  const strong = mixColors(base, black, 0.28);
  const soft   = mixColors(base, white, 0.35);

  // رنگ‌های فعلیِ پالتِ تم — تا طیف تازه با همان تم هماهنگ بماند
  const curSurface  = parseCssColor(themeVar('--surface', '#fffdf8')) || white;
  const curSurface2 = parseCssColor(themeVar('--surface-2', '#ece3d1')) || white;
  const curBorder   = parseCssColor(themeVar('--border', 'rgba(0,0,0,.14)')) || { r: 0, g: 0, b: 0, a: .14 };
  const curPaper    = parseCssColor(themeVar('--paper-bg', '#fffaf0')) || white;

  const skinSurface  = mixColors(curSurface, base, 0.10);
  const skinSurface2 = mixColors(curSurface2, base, 0.15);
  const skinBorder   = mixColors(curBorder, base, 0.5);
  const skinPaper    = mixColors(curPaper, base, 0.08);

  root.style.setProperty('--accent', color);
  root.style.setProperty('--gold', color);
  root.style.setProperty('--skin-accent', color);
  root.style.setProperty('--skin-accent-strong', colorToCss(strong));
  root.style.setProperty('--skin-accent-2', colorToCss(soft));
  root.style.setProperty('--skin-surface', colorToCss(skinSurface));
  root.style.setProperty('--skin-surface-2', colorToCss(skinSurface2));
  root.style.setProperty('--skin-border', colorToCss(skinBorder));
  root.style.setProperty('--skin-glass', 'rgba(' + Math.round(base.r) + ',' + Math.round(base.g) + ',' + Math.round(base.b) + ',0.16)');
  root.style.setProperty('--skin-paper', colorToCss(skinPaper));
}
function refreshColorBtnsActiveState() {
  const saved = _colorMode === 'skin'
    ? (function() { try { return localStorage.getItem('golava-skincolor'); } catch(e) { return null; } })()
    : (function() { try { return localStorage.getItem('golava-fontcolor'); } catch(e) { return null; } })();
  document.querySelectorAll('.color-btn').forEach(function(b) {
    b.classList.toggle('active', !!saved && b.dataset.color === saved);
  });
}

/* رویدادهای پخش */
audio.addEventListener("timeupdate", () => {
  const bar = document.getElementById("seekBar");
  if (!isNaN(audio.duration)) {
    bar.value = (audio.currentTime / audio.duration) * 100 || 0;
  }
  document.getElementById("curTime").textContent = formatTime(audio.currentTime);
  document.getElementById("durTime").textContent = formatTime(audio.duration);
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    try {
      if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate || 1,
          position: Math.min(audio.currentTime, audio.duration)
        });
      }
    } catch (e) {}
  }
});
audio.addEventListener("ended", () => {
  if (state.playlistEnabled && state.playlist.length) {
    if (state.playlistRepeat === 'one' && state.currentIndex !== -1) {
      playIndex(state.currentIndex);
      return;
    }
    playlistAdvance('next');
    return;
  }
  if (state.repeatMode === 'one' && state.currentIndex !== -1) {
    playIndex(state.currentIndex);
    return;
  }
  nextTrack();
});
audio.addEventListener("pause", () => {
  state.playing = false;
  updateTransportUI();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
});
audio.addEventListener("play", () => {
  state.playing = true;
  updateTransportUI();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
});
audio.addEventListener("error", () => {
  document.getElementById("npTitle").textContent = "خطا در پخش — رد شدن به بعدی";
  setTimeout(() => nextTrack(), 2000);
});

/* ===================================================================
   تایمر خواب
   =================================================================== */
function clearSleepTimer() {
  if (state.sleepTimerId) {
    clearInterval(state.sleepTimerId);
    state.sleepTimerId = null;
  }
  state.sleepTimerEndAt = null;
  const label = document.getElementById("sleepTimerLabel");
  if (label) label.textContent = "خاموش";
  document.querySelectorAll(".sleep-option").forEach(b => b.classList.remove("active"));
  const inline = document.getElementById("sleepTimerInline");
  if (inline) inline.style.display = "none";
}

function setSleepTimer(minutes) {
  clearSleepTimer();
  if (!minutes) return;
  state.sleepTimerEndAt = Date.now() + minutes * 60 * 1000;
  document.querySelectorAll(".sleep-option").forEach(b => {
    b.classList.toggle("active", parseInt(b.dataset.minutes, 10) === minutes);
  });
  const inline = document.getElementById("sleepTimerInline");
  if (inline) inline.style.display = "inline-flex";
  state.sleepTimerId = setInterval(() => {
    const remain = state.sleepTimerEndAt - Date.now();
    const label = document.getElementById("sleepTimerLabel");
    const inlineLabel = document.getElementById("sleepTimerInlineLabel");
    if (remain <= 0) {
      audio.pause();
      stopSynthNoise();
      if (noiseCtx) { try { noiseCtx.suspend(); } catch (e) {} }
      state.playing = false;
      updateTransportUI();
      clearSleepTimer();
      return;
    }
    const m = Math.floor(remain / 60000);
    const s = Math.floor((remain % 60000) / 1000).toString().padStart(2, "0");
    const txt = toFa(`${m}:${s}`);
    if (label) label.textContent = txt;
    if (inlineLabel) inlineLabel.textContent = txt;
  }, 1000);
}

/* ===================================================================
   اشتراک‌گذاری و مینی‌پلیر
   =================================================================== */
function showToast(msg) {
  let t = document.getElementById('golavaToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'golavaToast';
    t.className = 'golava-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

async function shareCurrentTrack() {
  const list = playbackList();
  const item = list[state.currentIndex];
  if (!item || !item.src) { showToast('ابتدا چیزی را پخش کنید'); return; }
  const link = buildDeepLink(item);
  const shareData = { title: item.title, text: 'رادیو آواک — ' + item.title, url: link };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(link);
      showToast('لینک صفحه کپی شد');
    }
  } catch (e) {
    try {
      await navigator.clipboard.writeText(link);
      showToast('لینک صفحه کپی شد');
    } catch (e2) {}
  }
}

/* ===================================================================
   لینک مستقیم پخش — برای اشتراک‌گذاری (مثلاً در تلگرام) و پخش خودکار
   =================================================================== */
function buildDeepLink(item) {
  const key = item.src || item.url || '';
  const base = window.location.origin + window.location.pathname;
  return base + '?play=' + encodeURIComponent(item.mode) + '&src=' + encodeURIComponent(key);
}

function tryDeepLinkPlay() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('play');
  const src = params.get('src');
  if (!mode || !src) return false;
  ensureModeLoaded(mode).then(function() {
    const list = listForMode(mode);
    var idx = list.findIndex(function(it) { return it.src === src || it.url === src; });
    // در گنجور، شعر ممکن است مال شاعری باشد که لود نشده — بارگذاری کامل
    if (idx === -1 && mode === 'ganjoor') {
      ensureAllGanjoorPoetsLoaded().then(function() {
        const list2 = listForMode(mode);
        var idx2 = list2.findIndex(function(it) { return it.src === src || it.url === src; });
        if (idx2 === -1) return;
        state.mode = mode;
        state.playingMode = mode;
        state.randomStartDone = true;
        updateModeUI();
        renderPlaylist();
        playIndex(idx2);
        audio.play().catch(function() {});
      });
      return;
    }
    if (idx === -1) return;
    state.mode = mode;
    state.playingMode = mode;
    state.randomStartDone = true;
    updateModeUI();
    renderPlaylist();
    playIndex(idx);
    audio.play().catch(function() {});
  });
  return true;
}

/* ===================================================================
   اشتراک‌گذاری فهرست پخش با لینک (۴۸ ساعت معتبر)
   =================================================================== */
const PLAYLIST_SHARE_TTL = 48 * 60 * 60 * 1000; // ۴۸ ساعت

function buildPlaylistSharePayload() {
  return state.playlist.map(function(item) {
    var p = {
      src: item.src || '',
      url: item.url || '',
      title: item.title || '',
      mode: item.mode || ''
    };
    // فقط فیلدهای لازم برای پخش — بقیهٔ متادیتا از فهرست حالت بازسازی می‌شود
    if (item.performer) p.performer = item.performer;
    if (item.poet) p.poet = item.poet;
    if (item.author) p.author = item.author;
    if (item.category) p.category = item.category;
    if (item.collection) p.collection = item.collection;
    if (item.subtitle) p.subtitle = item.subtitle;
    if (item.reciter) p.reciter = item.reciter;
    if (item.formLabel) p.formLabel = item.formLabel;
    if (item.categoryId) p.categoryId = item.categoryId;
    if (item.collectionId) p.collectionId = item.collectionId;
    if (item.subCollection) p.subCollection = item.subCollection;
    if (item.duration) p.duration = item.duration;
    if (item.synthType) p.synthType = item.synthType;
    return p;
  });
}

function sharePlaylist() {
  if (!state.playlist.length) { showToast('فهرست پخش خالی است — اول چیزی اضافه کنید'); return; }
  var payload = buildPlaylistSharePayload();
  var id = 'pl' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  // Firebase بین دستگاه‌ها کار می‌کند؛ localStorage فقط همین مرورگر
  var hasFirebase = typeof window.golavaSharedPlaylistSave === 'function';
  if (!hasFirebase) {
    try {
      localStorage.setItem('golava-shared-playlist-' + id, JSON.stringify({ items: payload, createdAt: Date.now() }));
    } catch (e) {
      // localStorage پر/خطا — فهرست را مستقیم در لینک بگذار (فقط اگر جا شود)
      try {
        var enc = encodeURIComponent(JSON.stringify(payload));
        if (enc.length < 3500) {
          var url2 = window.location.origin + window.location.pathname + '?pl=' + enc;
          copyShareLink(url2, payload.length);
          return;
        }
      } catch (e2) {}
      showToast('فهرست پخش برای اشتراک‌گذاری خیلی بزرگ است');
      return;
    }
  }
  var url = window.location.origin + window.location.pathname + '?pl=' + id;
  if (hasFirebase) {
    window.golavaSharedPlaylistSave(id, payload).then(function() {
      copyShareLink(url, payload.length);
    });
  } else {
    copyShareLink(url, payload.length);
  }
}

function copyShareLink(url, count) {
  var text = 'رادیو آواک — فهرست پخش ' + toFa(count) + ' فایل\n' + url;
  var shareData = { title: 'فهرست پخش رادیو آواک', text: text, url: url };
  if (navigator.share) {
    navigator.share(shareData).catch(function() {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('لینک فهرست پخش کپی شد');
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('لینک فهرست پخش کپی شد');
  } catch (e) { showToast('لینک: ' + url); }
}

function trySharedPlaylist() {
  var params = new URLSearchParams(window.location.search);
  var pl = params.get('pl');
  if (!pl) return false;
  var payload = null;
  var hasFirebase = typeof window.golavaSharedPlaylistLoad === 'function';
  var raw = null;
  try { raw = localStorage.getItem('golava-shared-playlist-' + pl); } catch (e) {}
  if (raw) {
    try {
      var data = JSON.parse(raw);
      if (data.createdAt && (Date.now() - data.createdAt) > PLAYLIST_SHARE_TTL) {
        try { localStorage.removeItem('golava-shared-playlist-' + pl); } catch (e) {}
        raw = null;
      } else {
        payload = data.items;
      }
    } catch (e) { raw = null; }
  }
  if (!payload && hasFirebase) {
    // لینک از دستگاه دیگر آمده — از Firebase بخوان
    window.golavaSharedPlaylistLoad(pl).then(function(items) {
      if (!items || !items.length) return; // منقضی یا ناشناخته — صفحهٔ اول
      applySharedPlaylist(items);
    });
    return true; // لینک پلی‌لیست است؛ حتی اگر خالی بود صفحهٔ اول بماند
  }
  if (!payload || !payload.length) return false;
  applySharedPlaylist(payload);
  return true;
}

// پلی‌لیست اشتراکی را نشان بده + روشن کن + فهرست همهٔ حالت‌های لازم را از قبل لود کن
// (بدون پخش خودکار — کاربر با کلیک روی پلی‌لیست یا دکمهٔ پلی، پخش را شروع می‌کند)
function applySharedPlaylist(items) {
  state.playlist = items;
  state.playlistEnabled = true;
  togglePlaylistOnOff(true);
  renderPlaylistQueue();
  // برای هر فایل پلی‌لیست، حالتش را لود کن تا به‌محض کلیک روی پلی، فایل همان‌جا آماده باشد
  var modes = [];
  items.forEach(function(it) {
    var m = it.mode || 'golha';
    if (modes.indexOf(m) < 0) modes.push(m);
  });
  var chain = Promise.resolve();
  modes.forEach(function(m) {
    chain = chain.then(function() { return ensureModeLoaded(m); });
  });
  chain.then(function() {
    // حالت را روی حالتِ اولین فایل بگذار تا فهرست اصلی هم همان محتوا را نشان دهد
    var firstMode = items[0].mode || 'golha';
    if (state.mode !== firstMode) {
      state.mode = firstMode;
      updateModeUI();
    }
    renderPlaylist();
    renderDrawer();
  });
}

function setupMiniPlayer() {
  const wrap = document.querySelector('.player-wrap');
  const mini = document.getElementById('miniPlayer');
  if (!wrap || !mini || !window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const scrolledPast = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
      mini.classList.toggle('show', scrolledPast);
    });
  }, { threshold: 0 });
  observer.observe(wrap);

  document.getElementById('miniPlayBtn').addEventListener('click', togglePlay);
  document.getElementById('miniNextBtn').addEventListener('click', nextTrack);
  document.getElementById('miniPrevBtn').addEventListener('click', prevTrack);
}

/* ===================================================================
   Build Ganjoor flat list
   =================================================================== */
function buildGanjoorFlatList() {
  return GANJOOR_POEMS.map(p => ({
    mode: 'ganjoor',
    poet: p.poetName,
    poetNickname: p.poetNickname || '',
    formLabel: p.catTitle || 'شعر',
    chapterLabel: p.subCat || null,
    title: p.title || p.fullTitle || '',
    fullTitle: p.fullTitle || '',
    text: p.plainText || '',
    reciter: p.audioArtist || 'نامشخص',
    src: p.mp3Url || '',
    url: (p.fullUrl && p.fullUrl.startsWith('/')) ? ('https://ganjoor.net' + p.fullUrl) : (p.fullUrl || '')
  })).filter(p => p.src);
}

/* ===================================================================
   مقداردهی اولیه
   =================================================================== */
/* ===================================================================
   لود تنبل اسکریپت‌های داده بر اساس حالت انتخابی
   =================================================================== */
const MODE_SCRIPTS = {
  golha: ['golha-data.js', 'playlist-data.js', 'regional-music-data.js'],
  ganjoor: [
    // index first (5KB) — shows all 28 poets immediately
    'ganjoor-index.js',
    // Ferdowsi (715KB but user wants all readings visible)
    'ganjoor-ferdousi.js',
    // eager poets (<50KB each) load upfront
    'ganjoor-khajoo.js', 'ganjoor-obeyd.js', 'ganjoor-seyf.js', 'ganjoor-salim.js', 'ganjoor-anvari.js', 'ganjoor-eshghi.js', 'ganjoor-nezami.js',
    // aggregator + extra
    'ganjoor-data.js', 'amirkhadem-data.js'
  ],
  hekayat: ['hekayat-data.js', 'redcircle-data.js', 'hezar-data.js', 'golestan-data.js', 'ghesegoo-data.js', 'castbox-hekayat-data.js'],
  meditation: ['khabcast-data.js', 'meditation-data.js', 'mindful-data.js', 'castbox-meditation-data.js']
};

const _loadedScripts = new Set();
const _loadingScripts = {};
function loadScript(src) {
  if (_loadedScripts.has(src)) return Promise.resolve();
  if (_loadingScripts[src]) return _loadingScripts[src];
  _loadingScripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { _loadedScripts.add(src); delete _loadingScripts[src]; resolve(); };
    s.onerror = () => { delete _loadingScripts[src]; reject(new Error('خطا در بارگذاری ' + src)); };
    document.body.appendChild(s);
  });
  return _loadingScripts[src];
}

function loadModeScripts(mode) {
  const files = MODE_SCRIPTS[mode] || [];
  // ganjoor-data.js + amirkhadem-data.js depend on GANJOOR_POEMS_* vars from
  // ganjoor-index.js + aggregators must run after their deps
  const aggregate = files.filter(function(f) { return f === 'ganjoor-data.js' || f === 'amirkhadem-data.js'; });
  const other = files.filter(function(f) { return aggregate.indexOf(f) < 0; });
  return Promise.all(other.map(loadScript)).then(function() {
    return Promise.all(aggregate.map(loadScript));
  });
}

// Lazy-load remaining large ganjoor poet files in background
// Called after initial UI render so user sees something immediately


function buildGolhaList() {
  state.golhaList = [
    ...(typeof buildGolhaFlatList === 'function' ? buildGolhaFlatList() : []),
    ...(typeof buildPlaylistFlatList === 'function' ? buildPlaylistFlatList() : [])
  ];
  const plLen = typeof buildPlaylistFlatList === 'function' ? buildPlaylistFlatList().length : 0;
  const plStart = state.golhaList.length - plLen;
  if (plStart >= 0 && plLen > 0) {
    const pl = state.golhaList.splice(plStart);
    pl.reverse();
    state.golhaList.push(...pl);
  }
  state.golhaList.push(...(typeof buildRegionalMusicFlatList === 'function' ? buildRegionalMusicFlatList() : []));
}

function buildGanjoorList() {
  // Rebuild GANJOOR_POEMS from currently-loaded poet vars
  try { if (typeof ganjoorRebuildPoems === 'function') ganjoorRebuildPoems(); } catch(e) {}
  state.ganjoorList = [
    ...((typeof GANJOOR_POEMS !== 'undefined' && GANJOOR_POEMS.length) ? buildGanjoorFlatList() : []),
    ...(typeof buildAmirKhademFlatList === 'function' ? buildAmirKhademFlatList() : [])
  ];
}

function buildHekayatList() {
  const hezarList = typeof buildHezarFlatList === 'function' ? buildHezarFlatList().slice().reverse() : [];
  state.hekayatList = [
    ...(typeof buildHekayatFlatList === 'function' ? buildHekayatFlatList() : []),
    ...(typeof buildRedcircleFlatList === 'function' ? buildRedcircleFlatList() : []),
    ...hezarList,
    ...(typeof buildGolestanFlatList === 'function' ? buildGolestanFlatList() : []),
    ...(typeof buildGhesegooFlatList === 'function' ? buildGhesegooFlatList() : []),
    ...(typeof buildCastboxHekayatFlatList === 'function' ? buildCastboxHekayatFlatList() : [])
  ];
  state.hekayatList.reverse();
}

function buildMeditationList() {
  state.meditationList = [
    ...(typeof buildKhabcastFlatList === 'function' ? buildKhabcastFlatList() : []),
    ...(typeof buildMeditationFlatList === 'function' ? buildMeditationFlatList() : []),
    ...(typeof buildMindfulFlatList === 'function' ? buildMindfulFlatList() : []),
    ...(typeof buildCastboxMeditationFlatList === 'function' ? buildCastboxMeditationFlatList() : [])
  ];
  // Fix items missing categoryId (khabcast from hekayat mode)
  state.meditationList.forEach(function(m) {
    if (!m.categoryId) m.categoryId = m.collectionId || 'other';
    if (!m.category) m.category = m.collection || 'مدیتیشن';
  });
  // Reorder meditation: khabcast first, then mother-child, then rest. Each group reversed.
  if (state.meditationList.length) {
    var khabcastItems = [];
    var motherChild = [];
    var rest = [];
    state.meditationList.forEach(function(item) {
      if (item.collectionId === 'khabcast') khabcastItems.push(item);
      else if (item.categoryId === 'mother-child') motherChild.push(item);
      else rest.push(item);
    });
    khabcastItems.reverse();
    motherChild.reverse();
    rest.reverse();
    state.meditationList = [].concat(khabcastItems, motherChild, rest);
  }
}

function buildListForMode(mode) {
  switch (mode) {
    case 'golha': buildGolhaList(); break;
    case 'ganjoor': buildGanjoorList(); break;
    case 'hekayat': buildHekayatList(); break;
    case 'meditation': buildMeditationList(); break;
  }
}

const _modeLoaded = { golha: false, ganjoor: false, hekayat: false, meditation: false };
const _modeLoadingPromise = {};
function ensureModeLoaded(mode) {
  if (_modeLoaded[mode]) return Promise.resolve();
  if (_modeLoadingPromise[mode]) return _modeLoadingPromise[mode];
  const p = loadModeScripts(mode).then(() => {
    buildListForMode(mode);
    _modeLoaded[mode] = true;
    // شاعران سنگین گنجور lazy می‌مانند — فقط با کلیک کاربر روی شاعر یا در
    // شافل کل حالات که به شاعری می‌رسد بارگذاری می‌شوند (یک‌یکی، بر اساس تقاضا)
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    delete _modeLoadingPromise[mode];
  });
  _modeLoadingPromise[mode] = p;
  return p;
}

function init() {
  loadSavedSettings();
  wireUI();

  // پیش‌فرض شافل «کل فهرست‌های کل حالات» — فقط index.js و ۷ شاعر سبک لود می‌شن
  // بقیه شاعران گنجور lazy می‌مانند تا شافل بهشون برسه (یک‌یکی در پس‌زمینه)
  ensureModeLoaded('ganjoor');
  ensureModeLoaded('hekayat');
  ensureModeLoaded('meditation');

  state.golhaList = [];
  state.ganjoorList = [];
  state.hekayatList = [];
  state.meditationList = [];

  updateModeUI();
  renderPlaylist();
  renderDrawer();

  if (tryDeepLinkPlay()) return;
  if (trySharedPlaylist()) return;

  ensureModeLoaded('golha').then(function() {
    renderPlaylist();
    renderDrawer();

    // Start in golha mode — random from regional music playlist
    if (state.golhaList.length) {
      var regIdxs = [];
      state.golhaList.forEach(function(it, i) {
        if (it.collectionId === 'regional-music') regIdxs.push(i);
      });
      var pool = regIdxs.length ? regIdxs : state.golhaList.map(function(_, i) { return i; });
      var startIdx = pool[Math.floor(Math.random() * pool.length)];
      document.getElementById("npTitle").textContent = "رادیو آواک";
      document.getElementById("npArtist").textContent = "";
      document.getElementById("npSub").textContent = "حالت گل‌ها — پخش تصادفی از موسیقی نواحی";
      setTimeout(function() {
        state.mode = 'golha';
        state.playingMode = 'golha';
        state.randomStartDone = true;
        playIndex(startIdx);
      }, 800);
    }
  });
}

/* ===================================================================
   رویدادهای UI
   =================================================================== */
function wireUI() {
  document.getElementById("playBtn").addEventListener("click", togglePlay);
  document.getElementById("nextBtn").addEventListener("click", nextTrack);
  document.getElementById("prevBtn").addEventListener("click", prevTrack);

  document.getElementById("seekBar").addEventListener("input", (e) => {
    if (!isNaN(audio.duration)) {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    }
  });
  document.getElementById("volBar").addEventListener("input", (e) => {
    audio.volume = e.target.value / 100;
    if (noiseGain) noiseGain.gain.value = audio.volume;
  });
  audio.volume = 0.85;
  document.getElementById("volBar").value = 85;

  document.getElementById("drawerToggle").addEventListener("click", () => {
    state.drawerOpen = !state.drawerOpen;
    document.getElementById("drawer").classList.toggle("open", state.drawerOpen);
    if (state.drawerOpen) {
      // فقط در موبایل (عرض ≤720px) باکس هواشناسی بسته شود
      if (window.innerWidth <= 720) {
        document.getElementById('weatherWidget').classList.add('collapsed');
      }
      document.getElementById('playlistQueue').classList.remove('pl-on','pl-enabled');
      if (state.playlistEnabled) { state.playlistEnabled = false; togglePlaylistOnOff(false); }
    }
  });

  document.getElementById("modeToggleBtn").addEventListener("click", cycleMode);

  document.querySelectorAll(".mode-dot").forEach(dot => {
    dot.addEventListener("click", () => switchToMode(dot.dataset.mode));
  });

  document.getElementById("settingsBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("settingsPanel").classList.add("open");
  });
  document.getElementById("settingsCloseBtn").addEventListener("click", () => {
    document.getElementById("settingsPanel").classList.remove("open");
  });
  document.getElementById("settingsPanel").addEventListener("click", (e) => {
    if (e.target.id === "settingsPanel") e.currentTarget.classList.remove("open");
  });

  document.querySelectorAll(".mode-choice").forEach(btn => {
    btn.addEventListener("click", () => switchToMode(btn.dataset.mode));
  });

  document.querySelectorAll(".theme-swatch").forEach((el) => {
    el.addEventListener("click", () => {
      applyTheme(el.dataset.theme);
      // اگر رنگ پوسته‌ای انتخاب شده، طیفش را با پالت تم تازه دوباره بساز
      try {
        const savedSkin = localStorage.getItem('golava-skincolor');
        if (savedSkin) applySkinColor(savedSkin);
      } catch(e) {}
    });
  });

  document.querySelectorAll("[data-fontpack]").forEach((el) => {
    el.addEventListener("click", () => applyFontPack(el.dataset.fontpack));
  });
  document.querySelectorAll("[data-weight]").forEach((el) => {
    el.addEventListener("click", () => applyFontWeight(el.dataset.weight));
  });

  document.getElementById("fontSizeRange").addEventListener("input", (e) => {
    applyFontScale(parseInt(e.target.value, 10));
  });

  document.getElementById('lineHeightRange').addEventListener('input', (e) => {
    const v = e.target.value;
    document.getElementById('lineHeightLabel').textContent = toFa(v.replace('.', '٫'));
    document.documentElement.style.setProperty('--line-height', v);
    try { localStorage.setItem('golava-lineheight', v); } catch(e) {}
  });
  try {
    const lh = localStorage.getItem('golava-lineheight') || '1.3';
    document.getElementById('lineHeightRange').value = lh;
    document.getElementById('lineHeightLabel').textContent = toFa(lh.replace('.', '٫'));
    document.documentElement.style.setProperty('--line-height', lh);
  } catch(e) {}

  document.getElementById('volBarSettings').addEventListener('input', (e) => {
    const v = e.target.value;
    document.getElementById('volBar').value = v;
    document.getElementById('volLabelSettings').textContent = toFa(v);
    audio.volume = v / 100;
    if (noiseGain) noiseGain.gain.value = audio.volume;
    try { localStorage.setItem('golava-volume', v); } catch(e) {}
  });
  document.getElementById('volBar').addEventListener('input', (e) => {
    const v = e.target.value;
    document.getElementById('volBarSettings').value = v;
    document.getElementById('volLabelSettings').textContent = toFa(v);
  });
  try {
    const sv = localStorage.getItem('golava-volume');
    if (sv) {
      document.getElementById('volBar').value = sv;
      document.getElementById('volBarSettings').value = sv;
      document.getElementById('volLabelSettings').textContent = toFa(sv);
      audio.volume = sv / 100;
    }
  } catch(e) {}

  document.querySelectorAll('.sleep-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.minutes, 10);
      if (!m) { clearSleepTimer(); } else { setSleepTimer(m); }
    });
  });

  // فهرست پخش
  var plCollapse = document.getElementById('playlistCollapseBtn');
  if (plCollapse) {
    plCollapse.addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('playlistQueue').classList.toggle('pl-collapsed');
    });
  }
  var plOnOff = document.getElementById('playlistOnOffBtn');
  if (plOnOff) plOnOff.addEventListener('click', function(e) {
    e.stopPropagation();
    togglePlaylistOnOff();
    document.getElementById('playlistQueue').classList.remove('pl-collapsed');
  });
  var plShuffle = document.getElementById('playlistShuffleBtn');
  if (plShuffle) plShuffle.addEventListener('click', function() { cyclePlaylistShuffle(); });
  var plRepeat = document.getElementById('playlistRepeatBtn');
  if (plRepeat) plRepeat.addEventListener('click', function() { cyclePlaylistRepeat(); });
  var plShare = document.getElementById('playlistShareBtn');
  if (plShare) plShare.addEventListener('click', function() { sharePlaylist(); });
  var plClear = document.getElementById('playlistClearBtn');
  if (plClear) plClear.addEventListener('click', function() {
    if (state.playlist.length) {
      state.playlist = [];
      renderPlaylistQueue();
      showToast('فهرست پخش پاک شد');
    }
  });
  renderPlaylistQueue();

  document.getElementById('shuffleBtn').addEventListener('click', () => {
    const curIdx = SHUFFLE_CYCLE.indexOf(state.shuffleMode);
    state.shuffleMode = SHUFFLE_CYCLE[(curIdx + 1) % SHUFFLE_CYCLE.length];
    resolveShuffleRepeatConflict('shuffle');
    if (state.shuffleMode === 'allModes') { ensureAllModesLoaded(); }
    // شافل کل حالات و modeList: دیگه ensureAllGanjoorPoetsLoaded رو صدا نمی‌زنیم
    // چون playAcrossModes خودش لود lazy روی تقاضا رو انجام می‌ده
    updateShuffleUI();
    updateRepeatUI();
  });
  document.getElementById('repeatBtn').addEventListener('click', () => {
    const curIdx = REPEAT_CYCLE.indexOf(state.repeatMode);
    state.repeatMode = REPEAT_CYCLE[(curIdx + 1) % REPEAT_CYCLE.length];
    resolveShuffleRepeatConflict('repeat');
    updateRepeatUI();
    updateShuffleUI();
  });
  updateShuffleUI();
  updateRepeatUI();
  document.getElementById('shareBtn').addEventListener('click', shareCurrentTrack);

  // Font/skin color buttons
  document.querySelectorAll('.color-mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _colorMode = this.dataset.colormode;
      document.querySelectorAll('.color-mode-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      refreshColorBtnsActiveState();
    });
  });
  document.querySelectorAll('.color-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var color = this.dataset.color;
      if (_colorMode === 'skin') {
        applySkinColor(color);
        try { localStorage.setItem('golava-skincolor', color); } catch(e) {}
      } else {
        document.querySelectorAll('.drawer-content .drawer-body, .drawer-content h3, .drawer-content .drawer-meta').forEach(function(el) {
          el.style.color = color;
        });
        try { localStorage.setItem('golava-fontcolor', color); } catch(e) {}
      }
      refreshColorBtnsActiveState();
    });
  });
  // Restore saved font color
  try {
    var savedColor = localStorage.getItem('golava-fontcolor');
    if (savedColor) {
      document.querySelectorAll('.drawer-content .drawer-body, .drawer-content h3, .drawer-content .drawer-meta').forEach(function(el) {
        el.style.color = savedColor;
      });
    }
  } catch(e) {}
  // Restore saved skin color
  try {
    var savedSkin = localStorage.getItem('golava-skincolor');
    if (savedSkin) applySkinColor(savedSkin);
  } catch(e) {}
  refreshColorBtnsActiveState();

  // Search
  var searchInput = document.getElementById('searchInput');
  var searchClearBtn = document.getElementById('searchClearBtn');
  if (searchInput) {
    var searchTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        _searchQuery = searchInput.value.trim();
        renderPlaylist();
      }, 300);
    });
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function() {
        searchInput.value = '';
        _searchQuery = '';
        renderPlaylist();
        searchInput.focus();
      });
    }
  }

  setupMiniPlayer();

  var jumpBtn = document.getElementById('jumpToPlayingBtn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', jumpToPlayingTrack);
  }
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ===================================================================
   پرش به فایل در حال پخش در فهرست
   =================================================================== */
function revealPlayingRow() {
  if (state.currentIndex === -1) return;
  var row = document.querySelector('.track-row[data-index="' + state.currentIndex + '"]');
  if (!row) return;
  var el = row;
  while (el && el !== document.body) {
    if (el.tagName === 'DETAILS') el.open = true;
    el = el.parentElement;
  }
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  row.classList.remove('flash-highlight');
  void row.offsetWidth;
  row.classList.add('flash-highlight');
  setTimeout(function() { row.classList.remove('flash-highlight'); }, 1700);
}

function jumpToPlayingTrack() {
  if (state.currentIndex === -1) return;
  var targetMode = state.playingMode || state.mode;
  var needsModeSwitch = state.mode !== targetMode;
  var needsSearchClear = !!_searchQuery;

  if (needsModeSwitch) {
    state.mode = targetMode;
    state.randomStartDone = true;
    updateModeUI();
  }
  if (needsSearchClear) {
    _searchQuery = '';
    var si = document.getElementById('searchInput');
    if (si) si.value = '';
  }
  if (needsModeSwitch || needsSearchClear) {
    renderPlaylist();
    requestAnimationFrame(function() { requestAnimationFrame(revealPlayingRow); });
  } else {
    revealPlayingRow();
  }
}

/* ===================================================================
   تعویض حالت
   =================================================================== */
function cycleMode() {
  const curIdx = MODE_ORDER.indexOf(state.mode);
  const nextIdx = (curIdx + 1) % MODE_ORDER.length;
  switchToMode(MODE_ORDER[nextIdx]);
}

function switchToMode(newMode) {
  if (state.mode === newMode) return;

  state.mode = newMode;
  // پخش فعلی قطع نمی‌شود؛ فقط با زدن پلی یا انتخاب از فهرست، پخش این حالت آغاز می‌شود
  state.randomStartDone = false;

  updateModeUI();

  if (state.currentIndex === -1) {
    document.getElementById("npTitle").textContent = "برای شروع، از فهرست انتخاب کنید یا پلی را بزنید";
    document.getElementById("npArtist").textContent = "";
    document.getElementById("npSub").textContent = "";
  }

  renderPlaylist();
  renderDrawer();

  // اگر داده‌های این حالت هنوز لود نشده، همین الان لودشان را شروع کن
  ensureModeLoaded(newMode).then(() => {
    if (state.mode === newMode) {
      renderPlaylist();
      renderDrawer();
    }
    // توجه: دیگر همهٔ شاعران گنجور یک‌جا بارگذاری نمی‌شوند — هرکدام فقط با
    // کلیک روی خودش (در groupedForRender/renderPlaylist → loadOnePoetLazy)
    // بارگذاری می‌شود. توجه: این‌جا عمداً بر اساس state.shuffleMode
    // تصمیم نمی‌گیریم، چون «کل حالات» پیش‌فرضِ همیشگی برنامه است و اگر
    // این‌جا هم بررسی‌اش کنیم، تقریباً هر بازدیدکننده‌ای با اولین ورود
    // به گنجور کل ۳۰ مگابایت را دانلود می‌کرد. آن تصمیم فقط در کلیک
    // واقعی روی دکمهٔ شافل (پایین‌تر) گرفته می‌شود، که نشانهٔ قصد آگاهانه
    // است.
  });
}

/* شروع */
document.addEventListener("DOMContentLoaded", init);
