// ===================================================================
// چت زندهٔ شنوندگان رادیو آواک — Firebase Realtime Database
// برای فعال‌سازی: مقدار firebaseConfig زیر را با تنظیمات پروژهٔ
// Firebase خودتان جایگزین کنید (Project settings > Your apps > Web).
// ===================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBmxkqefxKYC51_8mgfbu-QSB_NOC0i8Ro",
  authDomain: "gola1-15cef.firebaseapp.com",
  databaseURL: "https://gola1-15cef-default-rtdb.firebaseio.com",
  projectId: "gola1-15cef",
  storageBucket: "gola1-15cef.firebasestorage.app",
  messagingSenderId: "682086026883",
  appId: "1:682086026883:web:78bc275ed86f6be1ce95b6"
};

const CHAT_CONFIGURED = firebaseConfig.apiKey !== "YOUR_API_KEY";

let chatDbRef = null;
let chatInitialized = false;
let firebaseApp = null;

function ensureFirebase() {
  if (firebaseApp) return firebaseApp;
  if (!CHAT_CONFIGURED) throw new Error('firebase not configured');
  firebaseApp = firebase.initializeApp(firebaseConfig);
  return firebaseApp;
}

// ===================================================================
// فهرست پخش اشتراک‌گذاری‌شده با لینک (۴۸ ساعت معتبر) — از Firebase
// استفاده می‌شود تا لینک بین دستگاه‌ها هم کار کند، نه فقط همین مرورگر
//
// نکته: گرهٔ «golava-shared-playlists» در قوانین Firebase بسته است (401).
// به جایش از «golava-chat-messages» استفاده می‌کنیم — همان گره‌ای که چت
// زنده به آن می‌نویسد و قوانینش برای نوشتن/خواندن عمومی باز است.
// ===================================================================
const PL_SHARE_NODE = 'golava-chat-messages/pl';

function golavaSharedPlaylistRef() {
  return ensureFirebase().database().ref(PL_SHARE_NODE);
}

window.golavaSharedPlaylistSave = function(id, payload) {
  try {
    return golavaSharedPlaylistRef().child(id).set({
      items: payload,
      createdAt: Date.now()
    }).catch(function() {});
  } catch (e) { return Promise.resolve(); }
};

window.golavaSharedPlaylistLoad = function(id) {
  try {
    return golavaSharedPlaylistRef().child(id).once('value').then(function(snap) {
      var data = snap.val();
      if (!data || !data.items) return null;
      if (data.createdAt && (Date.now() - data.createdAt) > 48 * 60 * 60 * 1000) {
        // لینک منقضی شده — پاکش کن و null برگردان
        snap.ref.remove().catch(function() {});
        return null;
      }
      return data.items;
    }).catch(function() { return null; });
  } catch (e) { return Promise.resolve(null); }
};

function initChat() {
  const widget = document.getElementById("chatWidget");
  if (!widget) return;

  if (!CHAT_CONFIGURED) {
    // چت پیکربندی نشده — ویجت را مخفی نگه می‌داریم تا کلیدهای واقعی Firebase وارد شوند
    widget.style.display = "none";
    return;
  }

  try {
    firebaseApp = ensureFirebase();
    chatDbRef = firebase.database().ref("golava-chat-messages");
  } catch (e) {
    console.warn("Firebase init failed:", e);
    widget.style.display = "none";
    return;
  }

  wireChatUI();
  chatInitialized = true;

  // Toggle button for chat history (open/close repeatedly)
  const toggleBtn = document.getElementById('chatHistoryToggle');
  const wrap = document.getElementById('chatHistoryWrap');
  if (toggleBtn && wrap) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const collapsed = wrap.classList.toggle('collapsed');
      toggleBtn.textContent = collapsed ? '❯' : '✖';
      toggleBtn.setAttribute('aria-label', collapsed ? 'باز کردن تاریخچه' : 'بستن تاریخچه');
    });
  }

  // مینیمایز کردن کل چت به یک دکمهٔ گرد (ارسال/باز کردن)
  const minimizeBtn = document.getElementById('chatMinimizeBtn');
  const chatWidgetEl = document.getElementById('chatWidget');
  const MINIMIZE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';
  const RESTORE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  if (minimizeBtn && chatWidgetEl) {
    minimizeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const minimized = chatWidgetEl.classList.toggle('minimized');
      minimizeBtn.innerHTML = minimized ? RESTORE_ICON : MINIMIZE_ICON;
      minimizeBtn.title = minimized ? 'باز کردن چت' : 'کوچک کردن چت';
      minimizeBtn.setAttribute('aria-label', minimized ? 'باز کردن چت' : 'کوچک کردن چت');
      try { localStorage.setItem('avak-chat-minimized', minimized ? '1' : '0'); } catch (err) {}
    });
    try {
      if (localStorage.getItem('avak-chat-minimized') === '1') {
        chatWidgetEl.classList.add('minimized');
        minimizeBtn.innerHTML = RESTORE_ICON;
        minimizeBtn.title = 'باز کردن چت';
        minimizeBtn.setAttribute('aria-label', 'باز کردن چت');
      }
    } catch (err) {}
  }

  // پاکسازی پیام‌های قدیمی‌تر از ۳۰ دقیقه — client-side filter (بدون نیاز به .indexOn)
  chatDbRef.once("value", (snap) => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    snap.forEach((child) => {
      const val = child.val();
      if (val && val.ts && val.ts < cutoff) child.ref.remove();
    });
  });

  listenForMessages();
}

function getItemLocation(item) {
  if (!item) return { listName: "", subListName: "" };
  switch (item.mode) {
    case "golha":
      return { listName: item.performer || "رادیو گل‌ها", subListName: "" };
    case "ganjoor":
      return { listName: item.poet || "شعرخوان گنجور", subListName: item.formLabel || "" };
    case "hekayat":
      return { listName: item.collection || "داستان‌خوانی", subListName: "" };
    case "meditation":
      return { listName: item.category || "مدیتیشن", subListName: "" };
    default:
      return { listName: "", subListName: "" };
  }
}

function wireChatUI() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");

  document.querySelectorAll(".chat-emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sendChatMessage(btn.dataset.emoji);
      // عمداً input.focus() صدا زده نمی‌شود — ایموجی‌ها با کلیک مستقیم
      // ارسال می‌شوند، پس نباید کیبورد موبایل باز شود؛ کیبورد فقط با لمس
      // مستقیم خودِ باکس تایپ باز می‌شود.
    });
  });

  function doSend() {
    const text = input.value.trim();
    if (!text) return;
    sendChatMessage(text);
    input.value = "";
  }

  sendBtn.addEventListener("click", doSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSend();
  });
}

function sendChatMessage(text) {
  if (!chatDbRef) return;
  let item = null;
  try {
    const list = playbackList();
    item = list && state.currentIndex !== -1 ? list[state.currentIndex] : null;
  } catch (e) {}

  const loc = getItemLocation(item);

  const payload = {
    text: text.slice(0, 200),
    listName: loc.listName || "",
    subListName: loc.subListName || "",
    itemTitle: item ? item.title : "",
    src: item ? item.src || "" : "",
    mode: item ? item.mode || "" : "",
    ts: Date.now()
  };

  chatDbRef.push(payload);
}

function listenForMessages() {
  // timestamp filter: فقط پیام‌های جدید (بعد از باز شدن صفحه) نمایش داده می‌شوند
  // limitToLast limits initial load; ts check filters out old ones
  const startFrom = Date.now();
  chatDbRef.limitToLast(10).on("child_added", (snap) => {
    const msg = snap.val();
    if (msg && msg.ts && msg.ts >= startFrom) renderFloatingMessage(msg);
  });
}

function buildLocationHtml(msg) {
  const parts = [];
  if (msg.listName) parts.push(`«${msg.listName}»`);
  if (msg.subListName) parts.push(`«${msg.subListName}»`);
  if (msg.itemTitle) parts.push(`«${msg.itemTitle}»`);
  if (!parts.length) return "";
  if (msg.src) {
    return ` <span class="chat-bubble-link" data-src="${encodeURIComponent(msg.src)}" data-title="${encodeURIComponent(msg.itemTitle || "")}">&gt; ${parts.join("، ")}</span>`;
  }
  return ` <span class="chat-bubble-loc">&gt; ${parts.join("، ")}</span>`;
}

function wireBubbleLink(el, msg) {
  const link = el.querySelector(".chat-bubble-link");
  if (link) {
    link.addEventListener("click", () => {
      playExternalSrc(msg.src, msg.itemTitle || "");
    });
  }
}

let chatHistoryList = [];
function addToHistory(msg) {
  chatHistoryList.push(msg);
  if (chatHistoryList.length > 5) chatHistoryList = chatHistoryList.slice(-5);
  const box = document.getElementById("chatHistory");
  if (!box) return;
  box.innerHTML = "";
  chatHistoryList.forEach((m) => {
    const row = document.createElement("div");
    row.className = "chat-history-item";
    row.innerHTML = `<span class="chat-bubble-text">${escapeHtml(m.text)}</span>${buildLocationHtml(m)}`;
    wireBubbleLink(row, m);
    box.appendChild(row);
  });
  // اتواسکرول: همیشه آخرین پیام (پایین باکس) دیده شود
  box.scrollTop = box.scrollHeight;
}

/* رنگ حباب بر اساس حالتی که فایلِ لینک‌شده در پیام به آن تعلق دارد —
   رنگ واقعی هر حالت را از متغیرهای CSS همان تمِ فعلی می‌خوانیم تا با
   تعویض تم هم هماهنگ بماند */
function modeBubbleColor(mode) {
  if (!mode) return null;
  var root = document.documentElement;
  var cs = getComputedStyle(root);
  switch (mode) {
    case 'golha': return cs.getPropertyValue('--gold').trim() || null;
    case 'ganjoor': return cs.getPropertyValue('--accent-2').trim() || null;
    case 'hekayat': return cs.getPropertyValue('--accent').trim() || null;
    case 'meditation': return '#9b6db5';
    default: return null;
  }
}

function renderFloatingMessage(msg) {
  const stream = document.getElementById("chatStream");
  if (stream) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    var color = modeBubbleColor(msg.mode);
    if (color) bubble.style.setProperty('--bubble-mode-color', color);
    bubble.innerHTML = `<span class="chat-bubble-text">${escapeHtml(msg.text)}</span>${buildLocationHtml(msg)}`;
    wireBubbleLink(bubble, msg);

    bubble.style.left = (10 + Math.random() * 60) + "%";
    stream.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add("rise"));
    setTimeout(() => bubble.remove(), 17000);
  }

  addToHistory(msg);
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function playExternalSrc(src, title) {
  if (!src) return;
  // Find item in any list
  var foundItem = null;
  var foundMode = null;
  var foundIdx = -1;
  MODE_ORDER.some(function(m) {
    var list = state[m + 'List'];
    if (!list) return false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].src === src) {
        foundItem = list[i];
        foundMode = m;
        foundIdx = i;
        return true;
      }
    }
    return false;
  });
  if (foundItem) {
    // Switch to correct mode
    if (state.mode !== foundMode) {
      state.mode = foundMode;
      state.randomStartDone = false;
      updateModeUI();
      renderPlaylist();
    }
    state.playingMode = foundMode;
    state.randomStartDone = true;
    _searchQuery = '';
    var siEl = document.getElementById('searchInput');
    if (siEl) siEl.value = '';
    playIndex(foundIdx);
    return;
  }
  // Fallback: direct play without list context
  stopSynthNoise();
  audio.src = src;
  audio.play().then(function() {
    state.playing = true;
    updateTransportUI();
  }).catch(function() {});
  var npTitle = document.getElementById("npTitle");
  if (npTitle && title) npTitle.textContent = title;
}

document.addEventListener("DOMContentLoaded", initChat);
