/* =====================================================================
   گل‌آوا — منطق کامل برنامه
   رادیو گل‌ها + شعرخوان گنجور + داستان‌خوانی + مدیتیشن
   ===================================================================== */

const audio = new Audio();
audio.preload = "none";

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
  theme: "sunrise",
  fontChoice: "vazir",
  fontScale: 16,
  golhaList: [],
  ganjoorList: [],
  hekayatList: [],
  meditationList: [],
  currentIndex: -1,
  playing: false,
  drawerOpen: false,
  randomStartDone: false,
  sleepTimerEndAt: null,
  sleepTimerId: null
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
  golha: "رادیو گل‌ها",
  ganjoor: "شعرخوان گنجور",
  hekayat: "داستان‌خوانی",
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

function applyFont(choice) {
  state.fontChoice = choice;
  const map = {
    vazir: "'Vazirmatn', sans-serif",
    nastaliq: "'Noto Nastaliq Urdu', 'Vazirmatn', serif",
    lalezar: "'Lalezar', 'Vazirmatn', sans-serif",
  };
  document.documentElement.style.setProperty("--font-ui", map[choice] || map.vazir);
  document.querySelectorAll(".font-options button").forEach((b) => {
    b.classList.toggle("active", b.dataset.font === choice);
  });
  try { localStorage.setItem("golava-font", choice); } catch (e) {}
}

function applyFontScale(px) {
  state.fontScale = px;
  document.documentElement.style.setProperty("--font-scale", px + "px");
  document.getElementById("fontSizeLabel").textContent = toFa(px);
  try { localStorage.setItem("golava-scale", px); } catch (e) {}
}

function loadSavedSettings() {
  try {
    const t = localStorage.getItem("golava-theme");
    const f = localStorage.getItem("golava-font");
    const s = localStorage.getItem("golava-scale");
    applyTheme(t || "sunrise");
    applyFont(f || "vazir");
    applyFontScale(s ? parseInt(s, 10) : 16);
    document.getElementById("fontSizeRange").value = state.fontScale;
  } catch (e) {
    applyTheme("sunrise");
    applyFont("vazir");
    applyFontScale(16);
  }
}

/* ===================================================================
   ساخت فهرست تخت
   =================================================================== */
function currentList() {
  switch (state.mode) {
    case "golha": return state.golhaList;
    case "ganjoor": return state.ganjoorList;
    case "hekayat": return state.hekayatList;
    case "meditation": return state.meditationList;
    default: return state.golhaList;
  }
}

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
        sub = item.poetNickname || "شاعر";
        break;
      case "hekayat":
        key = item.collectionId || "all";
        name = item.collection || "داستان‌خوانی";
        sub = "داستان‌های صوتی فارسی";
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
        subGroups: state.mode === "ganjoor" ? {} : null,
        subOrder: state.mode === "ganjoor" ? [] : null
      };
      order.push(key);
    }

    const augmented = { ...item, globalIndex: i };
    groups[key].items.push(augmented);

    if (state.mode === "ganjoor") {
      const formKey = item.formLabel || "شعر";
      if (!groups[key].subGroups[formKey]) {
        groups[key].subGroups[formKey] = [];
        groups[key].subOrder.push(formKey);
      }
      groups[key].subGroups[formKey].push(augmented);
    }
  });

  return order.map((k) => groups[k]);
}

/* ===================================================================
   رندر فهرست پخش
   =================================================================== */
function renderPlaylist() {
  const root = document.getElementById("playlistRoot");
  root.innerHTML = "";

  if (!currentList().length) {
    root.innerHTML = `<div class="playlist-status">در حال بارگذاری…</div>`;
    return;
  }

  const groups = groupedForRender();
  if (!groups.length) {
    root.innerHTML = `<div class="playlist-status">فهرستی برای نمایش وجود ندارد.</div>`;
    return;
  }

  groups.forEach((g, gi) => {
    const details = document.createElement("details");
    details.className = "collection";
    if (gi === 0) details.open = true;
    const summary = document.createElement("summary");

    let countHtml = `<span class="c-count">${toFa(g.items.length)}</span>`;
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

    if (state.mode === "ganjoor" && g.subOrder && g.subOrder.length > 1) {
      g.subOrder.forEach((formKey, fi) => {
        const subItems = g.subGroups[formKey];
        if (!subItems || !subItems.length) return;
        const subDetails = document.createElement("details");
        subDetails.className = "sub-collection";
        const subSummary = document.createElement("summary");
        const subCountHtml = `<span class="c-count">${toFa(subItems.length)}</span>`;
        subSummary.innerHTML = `
          <span>
            <span class="c-name">${formKey}</span>
            <span class="c-sub">قالب شعر</span>
          </span>
          <span style="display:flex;align-items:center;gap:8px;">
            ${subCountHtml}
            <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        `;
        subDetails.appendChild(subSummary);
        details.appendChild(subDetails);
        subItems.forEach((item, i) => appendTrackRow(subDetails, item, i));
      });
    } else {
      g.items.forEach((item, i) => appendTrackRow(details, item, i));
    }

    root.appendChild(details);
  });
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
    tag = `<span class="form-tag">${item.duration}</span>`;
  }
  if (state.mode === "meditation" && item.duration) {
    tag = `<span class="form-tag">${item.duration}</span>`;
  }

  row.innerHTML = `
    <span class="idx">${toFa(i + 1)}</span>
    <span class="name">${tdisplay}</span>
    ${tag}
    <span class="eq"><span></span><span></span><span></span></span>
  `;
  row.addEventListener("click", () => {
    state.randomStartDone = true;
    playIndex(item.globalIndex);
  });
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
  const list = currentList();
  const item = list[state.currentIndex];
  if (!item) {
    content.innerHTML = `<div class="drawer-empty">برای دیدن اطلاعات، گزینه‌ای را انتخاب کنید.</div>`;
    return;
  }

  switch (state.mode) {
    case "golha":
      content.innerHTML = `
        <h3>${item.title}</h3>
        <div class="drawer-meta">${item.performer} — ${item.subtitle || ""}</div>
        <div class="drawer-body">${item.info || ""}</div>
        <div class="drawer-meta" style="margin-top:12px;">منبع: آرشیو آزاد اینترنت (archive.org) — مجموعهٔ موسیقی اصیل ایرانی</div>
      `;
      break;

    case "ganjoor":
      content.innerHTML = `
        <h3>${item.fullTitle || item.title}</h3>
        <div class="drawer-meta">شاعر: ${item.poet}${item.formLabel ? " — بخش: " + item.formLabel : ""}</div>
        <div class="drawer-body">${(item.text || "").replace(/\n/g, "<br>")}</div>
        <div class="drawer-meta" style="margin-top:12px;">خوانشگر: ${item.reciter || "نامشخص"} — منبع: گنجور (ganjoor.net)${item.url ? ' — <a href="' + item.url + '" target="_blank" style="color:var(--accent);">مشاهده در گنجور</a>' : ""}</div>
      `;
      break;

    case "hekayat": {
      const srcMap = {
        ketabsoti: { label: 'کتاب صوتی ناصر زراعتی — RedCircle', url: 'https://feeds.redcircle.com/af0f4c01-435b-4829-a7a7-f9cf1fefa3bb' },
        hezaroiekshab: { label: 'هزار و یکشب — archive.org', url: 'https://hezaroiekshab.blogspot.com' },
        golestan: { label: 'گلستان سعدی', url: 'https://ganjoor.net/saadi/golestan' }
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

    case "meditation":
      content.innerHTML = `
        <h3>${item.title}</h3>
        <div class="drawer-meta">${item.category || "مدیتیشن"}${item.duration ? " — مدت: " + item.duration : ""}</div>
        <div class="drawer-body">${item.info || ""}</div>
        <div class="drawer-meta" style="margin-top:12px;">صداهای آرامش‌بخش برای مدیتیشن، یوگا، مطالعه و خواب — این فایل تا پایان فهرست همین دسته پخش می‌شود.</div>
      `;
      break;
  }
}

/* ===================================================================
   پخش
   قوانین:
   - شروع اول هر حالت: تصادفی (به‌جز داستان‌خوانی که همیشه از ابتدای فهرست شروع می‌شود)
   - پس از شروع، پخش به ترتیب فهرست ادامه می‌یابد (نه شافل)
   - در مدیتیشن، «بعدی» فقط داخل همان دسته حرکت می‌کند و در انتهای دسته متوقف می‌شود
   =================================================================== */
function playIndex(i) {
  const list = currentList();
  if (!list.length) return;
  if (i < 0) i = list.length - 1;
  if (i >= list.length) i = 0;
  state.currentIndex = i;
  const item = list[i];

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

  switch (state.mode) {
    case "golha":
      document.getElementById("npArtist").textContent = item.performer || "";
      document.getElementById("npSub").textContent = item.subtitle || "رادیو گل‌ها";
      break;
    case "ganjoor":
      document.getElementById("npArtist").textContent = item.poet || "";
      document.getElementById("npSub").textContent = item.reciter ? "خوانش: " + item.reciter : "شعرخوان گنجور";
      break;
    case "hekayat":
      document.getElementById("npArtist").textContent = item.author || "رادیو حکایت";
      document.getElementById("npSub").textContent = item.duration ? "مدت: " + item.duration : "داستان‌خوانی";
      break;
    case "meditation":
      document.getElementById("npArtist").textContent = item.category || "مدیتیشن";
      document.getElementById("npSub").textContent = item.duration ? "مدت: " + item.duration : "آرامش و مدیتیشن";
      break;
  }

  refreshActiveRow();
  renderDrawer();
  updateTransportUI();
}

function togglePlay() {
  if (state.currentIndex === -1) {
    const list = currentList();
    if (!list.length) return;
    let startIdx;
    if (state.mode === "hekayat") {
      startIdx = 0;
    } else {
      startIdx = Math.floor(Math.random() * list.length);
    }
    state.randomStartDone = true;
    playIndex(startIdx);
    return;
  }
  const item = currentList()[state.currentIndex];
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

function nextTrack() {
  const list = currentList();
  if (!list.length) return;

  if (state.currentIndex === -1) { togglePlay(); return; }

  if (state.mode === "meditation") {
    const cat = list[state.currentIndex].categoryId;
    const sameCat = sameCategoryIndices(list, cat);
    const pos = sameCat.indexOf(state.currentIndex);
    if (pos === -1 || pos === sameCat.length - 1) {
      audio.pause();
      stopSynthNoise();
      if (noiseCtx) { try { noiseCtx.suspend(); } catch (e) {} }
      state.playing = false;
      updateTransportUI();
      return;
    }
    playIndex(sameCat[pos + 1]);
    return;
  }

  let idx = state.currentIndex + 1;
  if (idx >= list.length) idx = 0;
  playIndex(idx);
}

function prevTrack() {
  const list = currentList();
  if (!list.length) return;

  if (state.currentIndex === -1) { togglePlay(); return; }

  if (state.mode === "meditation") {
    const cat = list[state.currentIndex].categoryId;
    const sameCat = sameCategoryIndices(list, cat);
    const pos = sameCat.indexOf(state.currentIndex);
    if (pos <= 0) return;
    playIndex(sameCat[pos - 1]);
    return;
  }

  let idx = state.currentIndex - 1;
  if (idx < 0) idx = list.length - 1;
  playIndex(idx);
}

function updateTransportUI() {
  const playIcon = document.getElementById("playIcon");
  const pauseIcon = document.getElementById("pauseIcon");
  playIcon.style.display = state.playing ? "none" : "block";
  pauseIcon.style.display = state.playing ? "block" : "none";
  document.getElementById("disc").classList.toggle("spinning", state.playing);
  document.getElementById("tonearm").classList.toggle("playing", state.playing);
}

/* رویدادهای پخش */
audio.addEventListener("timeupdate", () => {
  const bar = document.getElementById("seekBar");
  if (!isNaN(audio.duration)) {
    bar.value = (audio.currentTime / audio.duration) * 100 || 0;
  }
  document.getElementById("curTime").textContent = formatTime(audio.currentTime);
  document.getElementById("durTime").textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", () => nextTrack());
audio.addEventListener("pause", () => {
  state.playing = false;
  updateTransportUI();
});
audio.addEventListener("play", () => {
  state.playing = true;
  updateTransportUI();
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
}

function setSleepTimer(minutes) {
  clearSleepTimer();
  if (!minutes) return;
  state.sleepTimerEndAt = Date.now() + minutes * 60 * 1000;
  document.querySelectorAll(".sleep-option").forEach(b => {
    b.classList.toggle("active", parseInt(b.dataset.minutes, 10) === minutes);
  });
  state.sleepTimerId = setInterval(() => {
    const remain = state.sleepTimerEndAt - Date.now();
    const label = document.getElementById("sleepTimerLabel");
    if (remain <= 0) {
      audio.pause();
      stopSynthNoise();
      if (noiseCtx) { try { noiseCtx.suspend(); } catch (e) {} }
      state.playing = false;
      updateTransportUI();
      clearSleepTimer();
      return;
    }
    if (label) {
      const m = Math.floor(remain / 60000);
      const s = Math.floor((remain % 60000) / 1000).toString().padStart(2, "0");
      label.textContent = toFa(`${m}:${s}`);
    }
  }, 1000);
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
function init() {
  loadSavedSettings();
  wireUI();

  state.golhaList = buildGolhaFlatList();
  state.ganjoorList = (typeof GANJOOR_POEMS !== 'undefined' && GANJOOR_POEMS.length) ? buildGanjoorFlatList() : [];
  state.hekayatList = [
    ...(typeof buildHekayatFlatList === 'function' ? buildHekayatFlatList() : []),
    ...(typeof buildRedcircleFlatList === 'function' ? buildRedcircleFlatList() : []),
    ...(typeof buildHezarFlatList === 'function' ? buildHezarFlatList() : []),
    ...(typeof buildGolestanFlatList === 'function' ? buildGolestanFlatList() : [])
  ];
  state.meditationList = typeof buildMeditationFlatList === 'function' ? buildMeditationFlatList() : [];

  updateModeUI();
  renderPlaylist();
  renderDrawer();

  if (state.golhaList.length) {
    document.getElementById("npTitle").textContent = "رادیو گل‌ها — شروع پخش";
    document.getElementById("npArtist").textContent = "";
    document.getElementById("npSub").textContent = "در حال پخش از آرشیو آزاد";
    setTimeout(() => {
      state.randomStartDone = true;
      playIndex(Math.floor(Math.random() * state.golhaList.length));
    }, 500);
  }
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
    el.addEventListener("click", () => applyTheme(el.dataset.theme));
  });
  document.querySelectorAll(".font-options button").forEach((el) => {
    if (el.dataset.font) el.addEventListener("click", () => applyFont(el.dataset.font));
  });
  document.getElementById("fontSizeRange").addEventListener("input", (e) => {
    applyFontScale(parseInt(e.target.value, 10));
  });

  document.querySelectorAll('[data-weight]').forEach(el => {
    el.addEventListener('click', () => {
      const w = el.dataset.weight;
      document.documentElement.style.setProperty('--font-weight', w);
      document.querySelectorAll('[data-weight]').forEach(b => b.classList.toggle('active', b.dataset.weight === w));
      try { localStorage.setItem('golava-weight', w); } catch(e) {}
    });
  });
  try {
    const w = localStorage.getItem('golava-weight') || '400';
    document.documentElement.style.setProperty('--font-weight', w);
    document.querySelectorAll('[data-weight]').forEach(b => b.classList.toggle('active', b.dataset.weight === w));
  } catch(e) {}

  document.getElementById('lineHeightRange').addEventListener('input', (e) => {
    const v = e.target.value;
    document.getElementById('lineHeightLabel').textContent = v.replace('.', '٫');
    document.documentElement.style.setProperty('--line-height', v);
    try { localStorage.setItem('golava-lineheight', v); } catch(e) {}
  });
  try {
    const lh = localStorage.getItem('golava-lineheight') || '1.8';
    document.getElementById('lineHeightRange').value = lh;
    document.getElementById('lineHeightLabel').textContent = lh.replace('.', '٫');
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

  audio.pause();
  stopSynthNoise();
  if (noiseCtx) { try { noiseCtx.suspend(); } catch (e) {} }
  state.playing = false;
  state.currentIndex = -1;
  state.randomStartDone = false;
  updateTransportUI();

  updateModeUI();

  const list = currentList();
  if (list.length === 0) {
    document.getElementById("npTitle").textContent = "برای شروع، از فهرست انتخاب کنید";
    document.getElementById("npArtist").textContent = "";
    document.getElementById("npSub").textContent = "";
  }

  renderPlaylist();
  renderDrawer();
}

/* شروع */
document.addEventListener("DOMContentLoaded", init);
