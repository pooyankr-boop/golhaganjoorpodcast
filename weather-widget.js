/* ===================================================================
   گجت هواشناسی — شهرهای مهم فارسی‌زبان (ایران، افغانستان، تاجیکستان)
   داده‌ها از Open-Meteo (رایگان، بدون نیاز به کلید API)
   =================================================================== */
(function () {
  // دسته اول: پایتخت‌های فارسی‌زبان + ۲ شهر پراهمیت
  var FIRST_BATCH = [
    { name: 'تهران', lat: 35.6892, lon: 51.3890 },
    { name: 'کابل', lat: 34.5553, lon: 69.2075 },
    { name: 'دوشنبه', lat: 38.5598, lon: 68.7870 },
    { name: 'اصفهان', lat: 32.6546, lon: 51.6680 },
    { name: 'شیراز', lat: 29.5918, lon: 52.5837 }
  ];
  // سایر شهرهای مهم
  var OTHER_CITIES = [
    { name: 'تبریز', lat: 38.0800, lon: 46.2919 },
    { name: 'مشهد', lat: 36.2605, lon: 59.6168 },
    { name: 'اهواز', lat: 31.3183, lon: 48.6706 },
    { name: 'رشت', lat: 37.2809, lon: 49.5832 },
    { name: 'کرمان', lat: 30.2839, lon: 57.0834 },
    { name: 'یزد', lat: 31.8974, lon: 54.3569 },
    { name: 'اراک', lat: 34.0917, lon: 49.6892 },
    { name: 'همدان', lat: 34.7992, lon: 48.5146 },
    { name: 'ارومیه', lat: 37.5527, lon: 45.0761 },
    { name: 'بندرعباس', lat: 27.1865, lon: 56.2808 },
    { name: 'زاهدان', lat: 29.4963, lon: 60.8629 },
    { name: 'بوشهر', lat: 28.9234, lon: 50.8203 },
    { name: 'سنندج', lat: 35.3145, lon: 46.9923 },
    { name: 'کرمانشاه', lat: 34.3277, lon: 47.0778 },
    { name: 'ساری', lat: 36.5633, lon: 53.0601 },
    { name: 'گرگان', lat: 36.8427, lon: 54.4351 },
    { name: 'قزوین', lat: 36.2688, lon: 50.0041 },
    { name: 'زنجان', lat: 36.6736, lon: 48.4787 },
    { name: 'اردبیل', lat: 38.2498, lon: 48.2933 },
    { name: 'ایلام', lat: 33.6374, lon: 46.4227 },
    { name: 'شهرکرد', lat: 32.3256, lon: 50.8641 },
    { name: 'یاسوج', lat: 30.6682, lon: 51.5880 },
    { name: 'بیرجند', lat: 32.8663, lon: 59.2211 },
    { name: 'قم', lat: 34.6416, lon: 50.8746 },
    { name: 'خرم‌آباد', lat: 33.4878, lon: 48.3558 },
    { name: 'کرج', lat: 35.8400, lon: 50.9391 },
    { name: 'بجنورد', lat: 37.4747, lon: 57.3290 },
    { name: 'سمنان', lat: 35.5729, lon: 53.3971 },
    { name: 'هرات', lat: 34.3529, lon: 62.2042 },
    { name: 'مزار شریف', lat: 36.7090, lon: 67.1109 },
    { name: 'قندهار', lat: 31.6289, lon: 65.7372 },
    { name: 'جلال‌آباد', lat: 34.4415, lon: 70.4361 },
    { name: 'قندوز', lat: 36.7286, lon: 68.8574 },
    { name: 'بامیان', lat: 34.8180, lon: 67.8210 },
    { name: 'غزنی', lat: 33.5539, lon: 68.4213 },
    { name: 'بلخ', lat: 36.7550, lon: 66.8975 },
    { name: 'فراه', lat: 32.3454, lon: 62.1123 },
    { name: 'خجند', lat: 40.2833, lon: 69.6222 },
    { name: 'کولاب', lat: 37.9139, lon: 69.7822 }
  ];

  var PAGE_SIZE = 5;
  var firstShown = false;
  var usedIdx = [];

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function nextBatch() {
    if (!firstShown) {
      firstShown = true;
      return FIRST_BATCH;
    }
    if (usedIdx.length >= OTHER_CITIES.length) {
      usedIdx = [];
      firstShown = false;
      return nextBatch();
    }
    var avail = [];
    for (var i = 0; i < OTHER_CITIES.length; i++) {
      if (usedIdx.indexOf(i) === -1) avail.push(i);
    }
    shuffle(avail);
    var take = Math.min(PAGE_SIZE, avail.length);
    var picks = avail.slice(0, take);
    usedIdx = usedIdx.concat(picks);
    return picks.map(function (idx) { return OTHER_CITIES[idx]; });
  }

  var WEATHER_ICONS = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️', 80: '🌦️', 81: '🌦️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  var faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  function toFaNum(s) { return String(s).replace(/[0-9]/g, function (d) { return faDigits[d]; }); }

  function tempColor(t) {
    if (t <= 0) return '#2563eb';
    if (t <= 10) return '#0ea5b7';
    if (t <= 20) return '#16a34a';
    if (t <= 30) return '#d97706';
    return '#dc2626';
  }

  function windArrow(deg) {
    if (deg < 22.5 || deg >= 337.5) return '↑';
    if (deg < 67.5) return '↗';
    if (deg < 112.5) return '→';
    if (deg < 157.5) return '↘';
    if (deg < 202.5) return '↓';
    if (deg < 247.5) return '↙';
    if (deg < 292.5) return '←';
    return '↖';
  }

  function fetchWeather(city) {
    return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + city.lat +
      '&longitude=' + city.lon +
      '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto')
      .then(function (r) { return r.json(); });
  }

  // دو سطر: ۱) آیکون + اسم شهر  ۲) دما + رطوبت + باد + کیفیت هوا
  function buildRowHtml(city, data) {
    var temp = '—', icon = '🌡️', humidity = '', windHtml = '', color = 'inherit';
    if (data && data.current) {
      var t = Math.round(data.current.temperature_2m);
      temp = toFaNum(t) + '°';
      color = tempColor(t);
      icon = WEATHER_ICONS[data.current.weather_code] || '🌡️';
      humidity = toFaNum(Math.round(data.current.relative_humidity_2m)) + '٪';
      if (data.current.wind_speed_10m !== undefined && data.current.wind_speed_10m !== null) {
        var ws = Math.round(data.current.wind_speed_10m);
        var wd = data.current.wind_direction_10m;
        var arrow = wd !== null && wd !== undefined ? windArrow(wd) : '';
        windHtml = '<span class="w-wind">' + arrow + toFaNum(ws) + '</span>';
      }
    }
    return (
      '<div class="weather-row">' +
        '<div class="w-city-line">' +
          '<span class="w-icon">' + icon + '</span>' +
          '<span class="w-city">' + city.name + '</span>' +
        '</div>' +
        '<div class="w-info-line">' +
          '<span class="w-temp" style="color:' + color + '">' + temp + '</span>' +
          '<span class="w-humidity">' + humidity + '</span>' +
          windHtml +
        '</div>' +
      '</div>'
    );
  }

  var loading = false;
  function showNextBatch() {
    if (loading) return;
    loading = true;
    var wrap = document.getElementById('weatherRows');
    var batch = nextBatch();

    function renderLoading() {
      wrap.innerHTML = batch.map(function (c) {
        return '<div class="weather-row"><span class="w-city">' + c.name + '</span><span class="w-temp">…</span></div>';
      }).join('');
    }

    function fetchAllAndRender() {
      Promise.all(batch.map(function (c) {
        return fetchWeather(c).then(function (d) { return { city: c, data: d }; })
          .catch(function () { return { city: c, data: null }; });
      })).then(function (results) {
        wrap.innerHTML = results.map(function (r) { return buildRowHtml(r.city, r.data); }).join('');
        wrap.classList.add('wind-in');
        setTimeout(function () { wrap.classList.remove('wind-in'); loading = false; }, 460);
      });
    }

    if (wrap.children.length === 0) {
      renderLoading();
      fetchAllAndRender();
    } else {
      wrap.classList.add('wind-out');
      setTimeout(function () {
        wrap.classList.remove('wind-out');
        renderLoading();
        fetchAllAndRender();
      }, 400);
    }
  }

  function renderJalaliDate() {
    var el = document.getElementById('weatherJalali');
    if (!el) return;
    try {
      var d = new Date();
      var iranFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      var iranParts = iranFmt.formatToParts(d);
      var dayName = '', iranDay = '', iranMonth = '', iranYear = '';
      iranParts.forEach(function(p) {
        if (p.type === 'weekday') dayName = p.value;
        if (p.type === 'day') iranDay = p.value;
        if (p.type === 'month') iranMonth = p.value;
        if (p.type === 'year') iranYear = p.value;
      });
      el.textContent = dayName + '، ' + iranDay + ' ' + iranMonth + ' ' + iranYear;
    } catch (e) { el.textContent = ''; }
  }

  function init() {
    var nextBtn = document.getElementById('weatherNextBtn');
    var collapseBtn = document.getElementById('weatherCollapseBtn');
    var widget = document.getElementById('weatherWidget');
    if (!nextBtn || !widget) return;
    nextBtn.addEventListener('click', showNextBatch);
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function () {
        widget.classList.toggle('collapsed');
        try { localStorage.setItem('golava-weather-collapsed', widget.classList.contains('collapsed') ? '1' : '0'); } catch (e) {}
      });
      try {
        if (localStorage.getItem('golava-weather-collapsed') === '1') widget.classList.add('collapsed');
      } catch (e) {}
    }
    renderJalaliDate();
    if (window.innerWidth <= 480) {
      widget.classList.add('collapsed');
    }
    showNextBatch();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();
