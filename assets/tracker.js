/* Ziyaret istatistikleri ve KVKK rıza bandı
   - Herkesten (rızasız, kişiyi tanımlamayan): tarih, sayfa, geldiği site, dil, cihaz türü,
     işletim sistemi, tarayıcı, saat dilimi, tıklamalar, sayfada ve bölümlerde geçen süre.
     Bunlar yalnızca sayfa açıkken var olan geçici bir oturum numarasına bağlanır;
     tarayıcıya hiçbir şey yazılmaz.
   - Rıza ile ek olarak: tarayıcıda saklanan ziyaretçi numarası, şehir düzeyinde konum
     ve internet sağlayıcısı/kurum (GeoJS servisi üzerinden), ekran çözünürlüğü,
     cihaz modeli, işletim sistemi ve tarayıcı sürümü, tema, bağlantı türü, diller.
   - IP adresi hiçbir durumda saklanmaz. */
(function () {
  'use strict';
  var C = window.SUPABASE || {};
  if (!C.url || !C.key || navigator.webdriver && !/[?&]track=1/.test(location.search)) return;
  var API = C.url.replace(/\/+$/, '') + '/rest/v1/';

  var T = {
    tr: {
      text: 'Sitede kişisel veri içermeyen anonim istatistikler tutuluyor. İzin verirseniz şehir düzeyinde konum, internet sağlayıcısı, cihaz ayrıntıları ve tekrar ziyaret bilgisi de kaydedilir; IP adresiniz saklanmaz.',
      more: 'Gizlilik', yes: 'Kabul et', no: 'Reddet', aria: 'Çerez ve istatistik tercihi'
    },
    en: {
      text: 'This site keeps anonymous statistics without personal data. If you agree, city-level location, internet provider, device details and return-visit information are also recorded; your IP address is not stored.',
      more: 'Privacy', yes: 'Accept', no: 'Decline', aria: 'Cookie and statistics preference'
    }
  };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function lang() { return ls('lang') === 'en' ? 'en' : 'tr'; }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  function headers() {
    var h = { apikey: C.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
    if (/^eyJ/.test(C.key)) h.Authorization = 'Bearer ' + C.key; // eski tip anon anahtarı
    return h;
  }
  function post(path, body, keepalive) {
    return fetch(API + path, { method: 'POST', headers: headers(), body: JSON.stringify(body), keepalive: !!keepalive, mode: 'cors' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r; });
  }

  /* ---------- Cihaz bilgisi ---------- */
  function device() {
    var ua = navigator.userAgent, os = 'Diğer', br = 'Diğer', dev;
    if (/iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) dev = 'Tablet';
    else if (/Mobi|Android|iPhone/i.test(ua)) dev = 'Mobil';
    else dev = 'Masaüstü';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) os = 'iOS';
    else if (/Mac OS X/.test(ua)) os = 'macOS';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    if (/Edg\//.test(ua)) br = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) br = 'Opera';
    else if (/SamsungBrowser/.test(ua)) br = 'Samsung Internet';
    else if (/YaBrowser/.test(ua)) br = 'Yandex';
    else if (/Firefox|FxiOS/.test(ua)) br = 'Firefox';
    else if (/Chrome|CriOS/.test(ua)) br = 'Chrome';
    else if (/Safari/.test(ua)) br = 'Safari';
    if (/LinkedInApp/i.test(ua)) br = 'LinkedIn uygulaması';
    else if (/Instagram/i.test(ua)) br = 'Instagram uygulaması';
    return { device: dev, os: os, browser: br };
  }
  function referrer() {
    var r = document.referrer;
    if (!r) return null;
    try { var u = new URL(r); if (u.host === location.host) return null; return (u.host + u.pathname).replace(/\/$/, '').slice(0, 300); } catch (e) { return null; }
  }
  function geo() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { ctrl && ctrl.abort(); }, 2500);
    return fetch('https://get.geojs.io/v1/ip/geo.json', { signal: ctrl && ctrl.signal })
      .then(function (r) { return r.json(); })
      .then(function (g) { clearTimeout(timer); return { country: g.country || null, region: g.region || null, city: g.city || null, org: (g.organization_name || '').slice(0, 120) || null }; })
      .catch(function () { return {}; });
  }

  // Rıza ile: tarayıcının paylaştığı ek cihaz bilgileri
  function extraInfo() {
    var ua = navigator.userAgent, x = {};
    var m;
    if ((m = ua.match(/Android ([\d.]+)/))) x.os_version = 'Android ' + m[1];
    else if ((m = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/))) x.os_version = 'iOS ' + m[1].replace(/_/g, '.');
    else if ((m = ua.match(/Mac OS X ([\d_]+)/))) x.os_version = 'macOS ' + m[1].replace(/_/g, '.');
    else if (/Windows NT 10/.test(ua)) x.os_version = 'Windows 10/11';
    if ((m = ua.match(/(Edg|OPR|SamsungBrowser|YaBrowser|Firefox|FxiOS|CriOS|Chrome|Version)\/([\d.]+)/))) x.browser_version = m[2].split('.').slice(0, 2).join('.');
    if ((m = ua.match(/Android [\d.]+; ([^;)]+)\)/)) && m[1] !== 'K') x.model = m[1].trim();
    try { x.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'koyu' : 'açık'; } catch (e) {}
    var c = navigator.connection; if (c && c.effectiveType) x.connection = (c.type && c.type !== 'unknown' ? c.type + ', ' : '') + c.effectiveType;
    if (navigator.languages && navigator.languages.length) x.languages = navigator.languages.slice(0, 4).join(', ');
    x.touch = navigator.maxTouchPoints > 0;
    x.pixel_ratio = Math.round((window.devicePixelRatio || 1) * 100) / 100;
    var hi = navigator.userAgentData && navigator.userAgentData.getHighEntropyValues
      ? navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']).then(function (h) {
          if (h.model) x.model = h.model;
          if (h.platform === 'Windows' && h.platformVersion) x.os_version = parseInt(h.platformVersion, 10) >= 13 ? 'Windows 11' : 'Windows 10';
          else if (h.platformVersion && !x.os_version) x.os_version = (h.platform || '') + ' ' + h.platformVersion.split('.').slice(0, 2).join('.');
          return x;
        }).catch(function () { return x; })
      : Promise.resolve(x);
    return hi;
  }

  /* ---------- Oturum ---------- */
  var S = { id: uuid(), start: Date.now(), visibleMs: 0, visibleSince: document.visibilityState === 'visible' ? Date.now() : 0, mode: null, ready: null, queue: [], sections: {}, done: false };
  function secs() { return Math.round((S.visibleMs + (S.visibleSince ? Date.now() - S.visibleSince : 0)) / 1000); }
  function offset() { return Math.min(86400, Math.round((Date.now() - S.start) / 1000)); }

  // Herkes için: kişiyi tanımlamayan oturum kaydı, sayfa açılır açılmaz
  function startBase() {
    if (S.mode) return;
    S.mode = 'base';
    var q = new URLSearchParams(location.search);
    var row = Object.assign({
      id: S.id, consent: false,
      page: location.pathname.slice(0, 200),
      referrer: referrer(),
      utm_source: (q.get('utm_source') || '').slice(0, 100) || null,
      lang: (navigator.language || '').slice(0, 20),
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 60)
    }, device());
    S.ready = post('visits', row).then(function () { S.ok = true; flush(false); if (S.wantUpgrade) upgrade(); }).catch(function () {});
    watchSections();
    document.addEventListener('click', onClick, true);
    S.timer = setInterval(function () { if (document.visibilityState === 'visible') { flush(false); touch(false); } }, 10000);
  }

  // Rıza ile: aynı oturumu ziyaretçi numarası ve konumla zenginleştir
  function upgrade() {
    if (S.upgraded) return;
    if (!S.ok) { S.wantUpgrade = true; return; }
    S.upgraded = true;
    var vid = ls('vid'); if (!vid) { vid = uuid(); ls('vid', vid); }
    var n = (parseInt(ls('vno'), 10) || 0) + 1; ls('vno', String(n));
    Promise.all([geo(), extraInfo()]).then(function (r) {
      var g = r[0], x = r[1];
      if (g.org) x.org = g.org;
      return post('rpc/upgrade_visit', {
        p_id: S.id, p_visitor: vid, p_visit_no: n,
        p_country: g.country || null, p_region: g.region || null, p_city: g.city || null,
        p_screen: (screen.width + 'x' + screen.height).slice(0, 20),
        p_extra: x
      });
    }).catch(function () {});
  }

  function touch(keepalive) {
    if (!S.ok) return Promise.resolve();
    return post('rpc/touch_visit', { p_id: S.id, p_duration: secs(), p_sections: S.snapshot ? S.snapshot() : null }, keepalive).catch(function () {});
  }
  function flush(keepalive) {
    clearTimeout(S.debounce);
    if (!S.ok || !S.queue.length) return Promise.resolve();
    var batch = S.queue.splice(0, 50);
    return post('events', batch, keepalive).catch(function () {});
  }

  /* ---------- Tıklamalar ---------- */
  function onClick(e) {
    var el = e.target.closest && e.target.closest('a,button,[role="button"],summary,[data-track]');
    if (!el || el.closest('.consent')) return;
    var text = Array.prototype.map.call(el.childNodes, function (n) { return n.textContent; }).join(' ');
    var label = (el.getAttribute('data-track') || el.getAttribute('aria-label') || text || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    var target = el.tagName === 'A' ? (el.href || '').slice(0, 400) : (el.id ? '#' + el.id : el.tagName.toLowerCase());
    var sec = el.closest('section[id]');
    var where = sec ? sec.id : (el.closest('header') ? 'menü' : el.closest('footer') ? 'alt bilgi' : el.closest('.band') ? 'son yayın bandı' : 'sayfa');
    S.queue.push({ visit_id: S.id, type: 'click', label: label || null, target: target || null, section: where.slice(0, 60), t_offset: offset() });
    clearTimeout(S.debounce); S.debounce = setTimeout(function () { flush(false); }, 1500);
    // Aynı sekmede başka sayfaya giden link: sayfa kapanmadan önce gönder
    if (el.tagName === 'A' && S.ok && !e.defaultPrevented && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey &&
        (!el.target || el.target === '_self') && !el.hasAttribute('download')) {
      var u; try { u = new URL(el.href, location.href); } catch (x) { return; }
      var samePage = u.origin === location.origin && u.pathname === location.pathname && u.search === location.search;
      if (samePage || !/^https?:$/.test(u.protocol)) return;
      e.preventDefault();
      var go = function () { if (!go.done) { go.done = true; location.href = u.href; } };
      Promise.all([flush(false), touch(false)]).then(go, go);
      setTimeout(go, 400);
    }
  }

  /* ---------- Bölümlerde geçen süre ---------- */
  function watchSections() {
    if (!('IntersectionObserver' in window)) return;
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting) { if (!(id in visible)) visible[id] = document.visibilityState === 'visible' ? Date.now() : 0; }
        else if (id in visible) { if (visible[id]) S.sections[id] = (S.sections[id] || 0) + (Date.now() - visible[id]); delete visible[id]; }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
    S.snapshot = function () {
      var out = {}, now = Date.now();
      Object.keys(S.sections).forEach(function (id) { out[id] = S.sections[id]; });
      Object.keys(visible).forEach(function (id) { if (visible[id]) out[id] = (out[id] || 0) + (now - visible[id]); });
      Object.keys(out).forEach(function (id) { out[id] = Math.round(out[id] / 1000); if (out[id] < 1) delete out[id]; });
      return out;
    };
    // Sekme gizlenince görünür bölümlerin sayacı durur, geri gelince devam eder
    document.addEventListener('visibilitychange', function () {
      var now = Date.now();
      if (document.visibilityState === 'hidden') Object.keys(visible).forEach(function (id) { S.sections[id] = (S.sections[id] || 0) + (now - visible[id]); visible[id] = 0; });
      else Object.keys(visible).forEach(function (id) { visible[id] = now; });
    });
  }

  /* ---------- Sayfadan ayrılma ---------- */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      if (S.visibleSince) { S.visibleMs += Date.now() - S.visibleSince; S.visibleSince = 0; }
      leave();
    } else {
      S.visibleSince = Date.now();
    }
  });
  addEventListener('pagehide', leave);

  function leave() {
    if (!S.mode) return;
    flush(true); touch(true);
  }

  /* ---------- Rıza bandı ---------- */
  function banner() {
    var t = T[lang()];
    var el = document.createElement('div');
    el.className = 'consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', t.aria);
    el.innerHTML = '<p>' + t.text + ' <a href="gizlilik.html">' + t.more + '</a></p>' +
      '<div class="consent__acts"><button type="button" class="consent__no">' + t.no + '</button><button type="button" class="consent__yes">' + t.yes + '</button></div>';
    document.body.appendChild(el);
    el.querySelector('.consent__yes').addEventListener('click', function () { ls('consent', 'yes'); el.remove(); upgrade(); });
    el.querySelector('.consent__no').addEventListener('click', function () { ls('consent', 'no'); ls('vid', null); ls('vno', null); el.remove(); });
  }

  // Gizlilik sayfasından tercihi sıfırlamak için
  window.resetConsent = function () { ls('consent', null); ls('vid', null); ls('vno', null); location.reload(); };

  function init() {
    startBase();
    var c = ls('consent');
    if (c === 'yes') upgrade();
    else if (c !== 'no') banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
