(function () {
  'use strict';
  var C = window.SUPABASE || {};
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  if (!C.url || !C.key) { $('setup').hidden = false; return; }
  var BASE = C.url.replace(/\/+$/, '');

  /* =====================================================================
     Oturum
     ===================================================================== */
  var sess = null;
  try { sess = JSON.parse(sessionStorage.getItem('adm_sess') || 'null'); } catch (e) {}
  function saveSess(s) { sess = s; try { if (s) sessionStorage.setItem('adm_sess', JSON.stringify(s)); else sessionStorage.removeItem('adm_sess'); } catch (e) {} }

  function authReq(grant, body) {
    return fetch(BASE + '/auth/v1/token?grant_type=' + grant, {
      method: 'POST', headers: { apikey: C.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error_description || j.msg || j.message || ('HTTP ' + r.status)); e.status = r.status; throw e; }
        return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000, email: j.user && j.user.email };
      });
    });
  }
  function ensureToken() {
    if (!sess) return Promise.reject(new Error('oturum yok'));
    if (Date.now() < sess.expires_at - 60000) return Promise.resolve();
    return authReq('refresh_token', { refresh_token: sess.refresh_token }).then(function (s) { s.email = s.email || sess.email; saveSess(s); });
  }
  function api(path, opt) {
    opt = opt || {};
    return ensureToken().then(function () {
      var h = Object.assign({ apikey: C.key, Authorization: 'Bearer ' + sess.access_token, 'Content-Type': 'application/json' }, opt.headers || {});
      return fetch(BASE + '/rest/v1/' + path, { method: opt.method || 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined });
    }).then(function (r) {
      if (r.status === 401) { saveSess(null); showLogin('Oturumun süresi doldu. Lütfen yeniden giriş yapın.'); throw new Error('401'); }
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.message || ('HTTP ' + r.status)); });
      return r;
    });
  }
  // PostgREST varsayılan 1000 satır sınırı için sayfalı çekim
  function fetchAll(path) {
    var out = [], step = 1000;
    function page(from) {
      return api(path, { headers: { 'Range-Unit': 'items', Range: from + '-' + (from + step - 1) } })
        .then(function (r) { return r.json(); })
        .then(function (rows) { out = out.concat(rows); return rows.length === step && out.length < 50000 ? page(from + step) : out; });
    }
    return page(0);
  }

  function showLogin(msg) {
    $('app').hidden = true; $('login').hidden = false;
    $('login-err').textContent = msg || '';
    var f = $('login-form'); f.email.focus();
  }
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, btn = $('login-btn');
    if (!f.email.value || !f.password.value) { $('login-err').textContent = 'E-posta ve şifreyi girin.'; return; }
    btn.disabled = true; btn.textContent = 'Giriş yapılıyor…'; $('login-err').textContent = '';
    authReq('password', { email: f.email.value.trim(), password: f.password.value })
      .then(function (s) { saveSess(s); return checkAdmin(); })
      .then(function () { f.password.value = ''; startApp(); })
      .catch(function (err) {
        $('login-err').textContent = /invalid/i.test(err.message) ? 'E-posta ya da şifre hatalı.' : err.message;
      })
      .finally(function () { btn.disabled = false; btn.textContent = 'Giriş yap'; });
  });
  function checkAdmin() {
    return api('admins?select=user_id').then(function (r) { return r.json(); }).then(function (rows) {
      if (!rows.length) { saveSess(null); throw new Error('Bu hesabın yönetici yetkisi yok. Kurulum rehberindeki son SQL adımını çalıştırın.'); }
    });
  }
  $('logout').addEventListener('click', function () {
    if (dirty() && !confirm('Yayınlanmamış değişiklikler kaybolacak. Çıkış yapılsın mı?')) return;
    var t = sess && sess.access_token;
    if (t) fetch(BASE + '/auth/v1/logout', { method: 'POST', headers: { apikey: C.key, Authorization: 'Bearer ' + t } }).catch(function () {});
    saveSess(null); location.reload();
  });
  $('theme').addEventListener('click', function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  function toast(msg, isErr) {
    var t = $('toast'); t.textContent = msg; t.className = 'toast' + (isErr ? ' is-err' : ''); t.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 3800);
  }

  /* Sekmeler */
  function selectTab(which) {
    ['analytics', 'content'].forEach(function (k) {
      $('tab-' + k).setAttribute('aria-selected', String(k === which));
      $('view-' + k).hidden = k !== which;
    });
    try { sessionStorage.setItem('adm_tab', which); } catch (e) {}
    if (which === 'content' && !CT.loaded) loadContent();
  }
  $('tab-analytics').addEventListener('click', function () { selectTab('analytics'); });
  $('tab-content').addEventListener('click', function () { selectTab('content'); });

  function startApp() {
    $('login').hidden = true; $('app').hidden = false;
    $('who').textContent = sess.email || '';
    var tab = 'analytics'; try { tab = sessionStorage.getItem('adm_tab') || 'analytics'; } catch (e) {}
    selectTab(tab);
    loadAnalytics();
  }

  /* =====================================================================
     ANALİZ
     ===================================================================== */
  var A = { days: 7, visits: [], events: [], byVisit: {}, visitor: null, q: '', limit: 50 };
  var SECTION_NAMES = { top: 'Açılış', hakkimda: 'Hakkımda', deneyim: 'Deneyim', girisimler: 'Arkhedemia & Arkhebook', yayinlar: 'Yayınlar', projeler: 'Projeler', iletisim: 'İletişim' };
  var PAGE_NAMES = { '/': 'Ana sayfa', '/index.html': 'Ana sayfa', '/veri-koprusu.html': 'Veri Köprüsü', '/gizlilik.html': 'Gizlilik' };
  function secName(s) { return SECTION_NAMES[s] || s || '—'; }
  // Rızasız ziyaretlerde konum yok; saat diliminden yaklaşık ülke
  var TZ_COUNTRY = { 'Europe/Istanbul': 'Türkiye', 'Asia/Istanbul': 'Türkiye', 'Europe/Berlin': 'Almanya', 'Europe/London': 'Birleşik Krallık', 'Europe/Amsterdam': 'Hollanda', 'Europe/Paris': 'Fransa', 'Europe/Vienna': 'Avusturya', 'Europe/Zurich': 'İsviçre', 'Europe/Brussels': 'Belçika', 'Europe/Stockholm': 'İsveç', 'Europe/Rome': 'İtalya', 'Europe/Madrid': 'İspanya', 'Europe/Athens': 'Yunanistan', 'Europe/Sofia': 'Bulgaristan', 'Europe/Moscow': 'Rusya', 'Europe/Kiev': 'Ukrayna', 'Europe/Kyiv': 'Ukrayna', 'Asia/Baku': 'Azerbaycan', 'Asia/Tashkent': 'Özbekistan', 'Asia/Almaty': 'Kazakistan', 'Asia/Dubai': 'BAE', 'Asia/Riyadh': 'Suudi Arabistan', 'Asia/Qatar': 'Katar', 'Asia/Tokyo': 'Japonya', 'Asia/Seoul': 'Güney Kore', 'Asia/Shanghai': 'Çin', 'America/New_York': 'ABD', 'America/Chicago': 'ABD', 'America/Denver': 'ABD', 'America/Los_Angeles': 'ABD', 'America/Toronto': 'Kanada', 'Australia/Sydney': 'Avustralya', 'Europe/Nicosia': 'Kıbrıs', 'Asia/Nicosia': 'Kıbrıs', 'Asia/Famagusta': 'Kıbrıs' };
  function approxCountry(v) { return v.tz ? (TZ_COUNTRY[v.tz] || v.tz) : null; }
  function ex(v) { return v.extra && typeof v.extra === 'object' ? v.extra : {}; }
  function langName(l) {
    var n = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', ru: 'Rusça', ar: 'Arapça', uz: 'Özbekçe', az: 'Azerbaycanca', zh: 'Çince', es: 'İspanyolca', it: 'İtalyanca', nl: 'Felemenkçe', ko: 'Korece', ja: 'Japonca' };
    var b = l.slice(0, 2).toLowerCase(); return n[b] || l;
  }
  function locKey(v) { return v.city ? v.city + (v.country ? ', ' + v.country : '') : (v.country || (approxCountry(v) ? approxCountry(v) + ' (saat dilimi)' : null)); }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(d) { return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function fmtDur(s) { s = Math.round(s || 0); if (s < 60) return s + ' sn'; var m = Math.floor(s / 60); if (m < 60) return m + ' dk ' + pad(s % 60) + ' sn'; return Math.floor(m / 60) + ' sa ' + pad(m % 60) + ' dk'; }
  function shortId(id) { return id ? '#' + id.slice(0, 4) : ''; }
  function nf(n) { return new Intl.NumberFormat('tr-TR').format(n); }

  $('range').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    A.days = +b.dataset.days; A.limit = 50;
    this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    loadAnalytics();
  });
  $('refresh').addEventListener('click', loadAnalytics);
  $('q').addEventListener('input', function () { A.q = this.value.toLowerCase(); A.limit = 50; renderSessions(); });

  function since() {
    var d = new Date();
    if (A.days === 1) { d.setHours(0, 0, 0, 0); return d; }
    d.setDate(d.getDate() - A.days + 1); d.setHours(0, 0, 0, 0); return d;
  }

  function loadAnalytics() {
    var from = since().toISOString();
    $('a-state').className = 'state'; $('a-state').textContent = 'Yükleniyor…';
    Promise.all([
      fetchAll('visits?select=*&started_at=gte.' + encodeURIComponent(from) + '&order=started_at.desc'),
      fetchAll('events?select=*&ts=gte.' + encodeURIComponent(from) + '&order=ts.asc')
    ]).then(function (res) {
      A.visits = res[0]; A.events = res[1]; A.byVisit = {};
      A.events.forEach(function (e) { (A.byVisit[e.visit_id] = A.byVisit[e.visit_id] || []).push(e); });
      $('a-state').textContent = A.visits.length ? '' : 'Bu aralıkta kayıtlı ziyaret yok.';
      renderAnalytics();
    }).catch(function (err) {
      if (err.message === '401') return;
      $('a-state').className = 'state is-err'; $('a-state').textContent = 'Veriler alınamadı: ' + err.message;
    });
  }

  function scoped() { return A.visitor ? A.visits.filter(function (v) { return v.visitor_id === A.visitor; }) : A.visits; }

  function renderAnalytics() {
    var vs = scoped(), full = vs.filter(function (v) { return v.consent; });
    var uniq = {}; full.forEach(function (v) { if (v.visitor_id) uniq[v.visitor_id] = 1; });
    var durs = vs.map(function (v) { return v.duration_sec; }).filter(function (d) { return d > 0; });
    var avg = durs.length ? durs.reduce(function (a, b) { return a + b; }, 0) / durs.length : 0;
    var returning = full.filter(function (v) { return v.visit_no > 1; }).length;
    var clicks = 0; vs.forEach(function (v) { (A.byVisit[v.id] || []).forEach(function (e) { if (e.type === 'click') clicks++; }); });
    var kp = [
      ['Ziyaret', nf(vs.length), nf(clicks) + ' tıklama'],
      ['Ortalama süre', fmtDur(avg), durs.length + ' ölçülen oturum'],
      ['Tekil ziyaretçi', nf(Object.keys(uniq).length), 'İzin verenler arasında'],
      ['Geri dönen', full.length ? Math.round(returning / full.length * 100) + '%' : '—', 'İzin verenler arasında'],
      ['İzin oranı', vs.length ? Math.round(full.length / vs.length * 100) + '%' : '—', nf(full.length) + ' ziyaret konum paylaştı']
    ];
    $('kpis').innerHTML = kp.map(function (k) { return '<div class="kpi"><p class="kpi__l">' + k[0] + '</p><p class="kpi__v">' + k[1] + '</p><p class="kpi__s">' + esc(k[2]) + '</p></div>'; }).join('');

    var vf = $('visitor-filter');
    if (A.visitor) { vf.hidden = false; vf.innerHTML = 'Ziyaretçi ' + esc(shortId(A.visitor)) + '<button type="button" aria-label="Filtreyi kaldır">×</button>'; vf.querySelector('button').onclick = function () { A.visitor = null; renderAnalytics(); }; }
    else vf.hidden = true;

    renderTrend(vs);
    bars('b-city', count(vs, locKey), 'ziyaret');
    bars('b-ref', count(vs, function (v) { return v.utm_source ? 'utm: ' + v.utm_source : (v.referrer ? v.referrer.split('/')[0].replace(/^www\./, '') : 'Doğrudan giriş'); }), 'ziyaret');
    bars('b-org', count(full, function (v) { return ex(v).org; }), 'ziyaret');
    bars('b-lang', count(vs, function (v) { return v.lang ? langName(v.lang) : null; }), 'ziyaret');
    bars('b-device', count(vs, function (v) { return v.device; }), 'ziyaret');
    bars('b-os', count(vs, function (v) { return v.os; }), 'ziyaret');
    bars('b-browser', count(vs, function (v) { return v.browser; }), 'ziyaret');

    var ids = {}; vs.forEach(function (v) { ids[v.id] = 1; });
    var evs = A.events.filter(function (e) { return ids[e.visit_id]; });
    bars('b-clicks', count(evs.filter(function (e) { return e.type === 'click'; }), function (e) { return e.label || e.target; }), 'tıklama');

    var secTot = {}, secN = {};
    vs.forEach(function (v) { sectionsOf(v).forEach(function (s) { secTot[s[0]] = (secTot[s[0]] || 0) + s[1]; secN[s[0]] = (secN[s[0]] || 0) + 1; }); });
    var secRows = Object.keys(secTot).map(function (k) { return [secName(k), secTot[k] / secN[k], secN[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    bars('b-sections', secRows, null, function (r) { return fmtDur(r[1]); }, function (r) { return r[2] + ' oturumda görüldü'; });

    renderSessions();
  }

  // Bölüm süreleri: ziyaret satırındaki sections alanı (eski kayıtlar için 'section' olayları)
  function sectionsOf(v) {
    var m = {};
    if (v.sections && typeof v.sections === 'object') Object.keys(v.sections).forEach(function (k) { var n = +v.sections[k]; if (n > 0) m[k] = n; });
    (A.byVisit[v.id] || []).forEach(function (e) { if (e.type === 'section' && e.value > 0) m[e.section] = Math.max(m[e.section] || 0, e.value); });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }

  function count(arr, key) {
    var m = {}; arr.forEach(function (x) { var k = key(x); if (k) m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function bars(id, rows, unit, fmtV, fmtSub) {
    var el = $(id);
    if (!rows.length) { el.innerHTML = '<p class="empty">Henüz veri yok.</p>'; return; }
    var max = rows[0][1], top = rows.slice(0, 8), rest = rows.slice(8);
    if (rest.length) top.push(['Diğer (' + rest.length + ')', rest.reduce(function (a, r) { return a + r[1]; }, 0)]);
    el.innerHTML = top.map(function (r) {
      var v = fmtV ? fmtV(r) : nf(r[1]);
      var tip = esc(r[0]) + ': ' + esc(v) + (unit ? ' ' + unit : '') + (fmtSub ? ' (' + esc(fmtSub(r)) + ')' : '');
      return '<div class="hbar" data-tip="' + tip + '"><span class="hbar__l" title="' + esc(r[0]) + '">' + esc(r[0]) + '</span><span class="hbar__v">' + esc(v) + '</span>' +
        '<span class="hbar__t"><span class="hbar__f" style="width:' + Math.max(2, Math.min(100, r[1] / max * 100)) + '%"></span></span></div>';
    }).join('');
  }

  function renderTrend(vs) {
    var buckets = [], keyOf, label;
    var start = since(), now = new Date();
    if (A.days === 1) {
      $('trend-title').textContent = 'Saatlik ziyaret (bugün)';
      for (var h = 0; h < 24; h++) buckets.push({ k: h, l: pad(h) + ':00', n: 0 });
      keyOf = function (d) { return d.getHours(); };
    } else if (A.days <= 90) {
      $('trend-title').textContent = 'Günlük ziyaret';
      for (var d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) buckets.push({ k: d.toDateString(), l: pad(d.getDate()) + '.' + pad(d.getMonth() + 1), n: 0 });
      keyOf = function (x) { return x.toDateString(); };
    } else {
      $('trend-title').textContent = 'Aylık ziyaret';
      var ay = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      for (var m = new Date(start.getFullYear(), start.getMonth(), 1); m <= now; m.setMonth(m.getMonth() + 1)) buckets.push({ k: m.getFullYear() + '-' + m.getMonth(), l: ay[m.getMonth()] + ' ' + String(m.getFullYear()).slice(2), n: 0 });
      keyOf = function (x) { return x.getFullYear() + '-' + x.getMonth(); };
    }
    var idx = {}; buckets.forEach(function (b, i) { idx[b.k] = i; });
    vs.forEach(function (v) { var i = idx[keyOf(new Date(v.started_at))]; if (i != null) buckets[i].n++; });
    var max = Math.max(1, Math.max.apply(null, buckets.map(function (b) { return b.n; })));
    $('trend').innerHTML = buckets.map(function (b) {
      return '<div class="trend__col" data-tip="' + esc(b.l) + ': ' + b.n + ' ziyaret"><div class="trend__bar" style="height:' + (b.n ? Math.max(2, b.n / max * 100) : 0) + '%"></div></div>';
    }).join('') + '<span class="sr">En yüksek: ' + max + '</span>';
    var ax = document.createElement('div'); ax.className = 'trend__axis';
    ax.innerHTML = '<span>' + esc(buckets[0].l) + '</span><span>En yüksek ' + max + '</span><span>' + esc(buckets[buckets.length - 1].l) + '</span>';
    var old = $('trend').nextElementSibling; if (old && old.classList.contains('trend__axis')) old.remove();
    $('trend').after(ax);
  }

  function platform(v) { return [v.device, v.os, v.browser].filter(Boolean).join(', '); }
  function source(v) { return v.utm_source ? 'utm: ' + v.utm_source : (v.referrer || 'Doğrudan'); }

  function renderSessions() {
    var vs = scoped().filter(function (v) {
      if (!A.q) return true;
      return [v.city, v.country, v.region, v.device, v.os, v.browser, v.referrer, v.utm_source, v.page].join(' ').toLowerCase().indexOf(A.q) >= 0;
    });
    var shown = vs.slice(0, A.limit);
    $('sessions').innerHTML = shown.map(function (v) {
      var evs = A.byVisit[v.id] || [];
      var clicks = evs.filter(function (e) { return e.type === 'click'; }).length;
      var who = v.consent
        ? '<button type="button" class="vlink" data-visitor="' + esc(v.visitor_id) + '">Ziyaretçi ' + esc(shortId(v.visitor_id)) + '</button><div class="dim">' + (v.visit_no > 1 ? v.visit_no + '. ziyaret' : 'İlk ziyaret') + '</div>'
        : '<span class="tag">Anonim</span><div class="dim">konum izni yok</div>';
      var loc = v.city ? esc(v.city) + '<div class="dim">' + esc([v.region, v.country].filter(Boolean).join(', ')) + '</div>' + (ex(v).org ? '<div class="dim">' + esc(ex(v).org) + '</div>' : '')
        : (v.country ? esc(v.country) : (approxCountry(v) ? esc(approxCountry(v)) + '<div class="dim">saat dilimine göre</div>' : '<span class="dim">—</span>'));
      var page = PAGE_NAMES[v.page] || v.page || '';
      return '<tr class="row" tabindex="0" data-id="' + esc(v.id) + '" aria-expanded="false">' +
        '<td class="when">' + fmtDate(new Date(v.started_at)) + '<div class="dim">' + esc(page) + '</div></td>' +
        '<td>' + who + '</td><td>' + loc + '</td>' +
        '<td>' + (platform(v) ? esc(platform(v)) : '<span class="dim">—</span>') + '<div class="dim">' + esc([ex(v).model, ex(v).os_version, v.screen, v.lang].filter(Boolean).join(', ')) + '</div></td>' +
        '<td>' + esc(source(v)) + '</td>' +
        '<td class="num">' + fmtDur(v.duration_sec) + '</td>' +
        '<td class="num">' + clicks + '</td></tr>';
    }).join('');
    var note = $('sessions-note');
    note.innerHTML = vs.length > shown.length
      ? '<span>' + nf(shown.length) + ' / ' + nf(vs.length) + ' ziyaret gösteriliyor. Ayrıntı için bir satıra tıklayın.</span><span class="more"><button type="button" class="btn btn--sm" id="more">50 ziyaret daha göster</button></span>'
      : (vs.length ? 'Ayrıntı için bir satıra tıklayın.' : '');
    var mb = $('more'); if (mb) mb.onclick = function () { A.limit += 50; renderSessions(); };
  }

  $('sessions').addEventListener('click', function (e) {
    var vb = e.target.closest('.vlink');
    if (vb) { e.stopPropagation(); A.visitor = vb.dataset.visitor; renderAnalytics(); scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var tr = e.target.closest('tr.row'); if (tr) toggleDetail(tr);
  });
  $('sessions').addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr.row')) { e.preventDefault(); toggleDetail(e.target); }
  });

  function toggleDetail(tr) {
    var next = tr.nextElementSibling;
    if (next && next.classList.contains('detail')) { next.remove(); tr.setAttribute('aria-expanded', 'false'); return; }
    tr.setAttribute('aria-expanded', 'true');
    var v = A.visits.filter(function (x) { return x.id === tr.dataset.id; })[0];
    var evs = (A.byVisit[v.id] || []).slice().sort(function (a, b) { return (a.t_offset || 0) - (b.t_offset || 0); });
    var start = new Date(v.started_at), html;
    {
      var clicks = evs.filter(function (e) { return e.type === 'click'; });
      var secs = sectionsOf(v);
      html = '<div class="timeline2"><span class="t">' + fmtTime(start) + '</span><span class="o">0:00</span><span class="e"><b>Sayfayı açtı</b> (' + esc(PAGE_NAMES[v.page] || v.page) + ')' + (v.referrer ? ', ' + esc(v.referrer) + ' üzerinden' : '') + '</span>';
      clicks.forEach(function (e) {
        var at = new Date(start.getTime() + (e.t_offset || 0) * 1000);
        var tgt = e.target && /^https?:/.test(e.target) ? ' <a href="' + esc(e.target) + '" target="_blank" rel="noopener">' + esc(e.target.replace(/^https?:\/\//, '').slice(0, 70)) + '</a>' : '';
        html += '<span class="t">' + fmtTime(at) + '</span><span class="o">+' + Math.floor(e.t_offset / 60) + ':' + pad(e.t_offset % 60) + '</span><span class="e"><b>' + esc(e.label || 'Tıklama') + '</b>, ' + esc(secName(e.section)) + tgt + '</span>';
      });
      var end = new Date(start.getTime() + v.duration_sec * 1000);
      html += '<span class="t">' + fmtTime(end) + '</span><span class="o">+' + Math.floor(v.duration_sec / 60) + ':' + pad(v.duration_sec % 60) + '</span><span class="e"><b>Son etkinlik</b>, sayfada aktif geçen süre ' + fmtDur(v.duration_sec) + '</span></div>';
      if (!clicks.length) html += '<p class="muted small" style="margin-top:.6rem">Bu oturumda tıklama yok.</p>';
      if (secs.length) html += '<div class="secs">' + secs.map(function (s) { return '<span>' + esc(secName(s[0])) + ': ' + fmtDur(s[1]) + '</span>'; }).join('') + '</div>';
      var x = ex(v), facts = [
        ['Kurum / İSS', x.org], ['Cihaz modeli', x.model], ['İşletim sistemi', x.os_version || v.os], ['Tarayıcı', v.browser ? v.browser + (x.browser_version ? ' ' + x.browser_version : '') : ''],
        ['Ekran', v.screen ? v.screen + (x.pixel_ratio && x.pixel_ratio !== 1 ? ' (' + x.pixel_ratio + 'x)' : '') : ''], ['Bağlantı', x.connection], ['Tema', x.theme],
        ['Diller', x.languages || v.lang], ['Saat dilimi', v.tz], ['Dokunmatik', x.touch == null ? '' : (x.touch ? 'Evet' : 'Hayır')]
      ].filter(function (f) { return f[1]; });
      html += '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>';
      if (!v.consent) html += '<p class="muted small" style="margin-top:.6rem">Ziyaretçi konum ve cihaz ayrıntılarına izin vermedi.</p>';
    }
    var d = document.createElement('tr'); d.className = 'detail';
    d.innerHTML = '<td colspan="7">' + html + '</td>';
    tr.after(d);
  }

  /* İpucu (grafikler) */
  var tip = $('tip');
  document.addEventListener('mousemove', function (e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.getAttribute('data-tip'); tip.hidden = false;
    var x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = e.clientY - tip.offsetHeight - 12;
    tip.style.left = x + 'px'; tip.style.top = (y < 8 ? e.clientY + 16 : y) + 'px';
  });

  $('csv').addEventListener('click', function () {
    var cols = ['started_at', 'consent', 'visitor_id', 'visit_no', 'page', 'city', 'region', 'country', 'device', 'os', 'browser', 'screen', 'lang', 'tz', 'referrer', 'utm_source', 'duration_sec'];
    var xcols = ['org', 'model', 'os_version', 'browser_version', 'connection', 'theme', 'languages'];
    var lines = [cols.concat(xcols, 'clicks').join(';')];
    scoped().forEach(function (v) {
      var c = (A.byVisit[v.id] || []).filter(function (e) { return e.type === 'click'; }).length;
      var cell = function (val) { var s = val == null ? '' : String(val); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      lines.push(cols.map(function (k) { return cell(v[k]); }).concat(xcols.map(function (k) { return cell(ex(v)[k]); }), c).join(';'));
    });
    download('ziyaretler-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + lines.join('\n'), 'text/csv');
  });

  $('purge').addEventListener('click', function () {
    var cut = new Date(); cut.setFullYear(cut.getFullYear() - 1);
    if (!confirm(fmtDate(cut) + ' öncesindeki tüm ziyaret ve tıklama kayıtları kalıcı olarak silinecek. Devam edilsin mi?')) return;
    api('visits?started_at=lt.' + encodeURIComponent(cut.toISOString()), { method: 'DELETE', headers: { Prefer: 'return=representation' } })
      .then(function (r) { return r.json(); })
      .then(function (rows) { toast(rows.length + ' eski kayıt silindi.'); loadAnalytics(); })
      .catch(function (err) { if (err.message !== '401') toast('Silinemedi: ' + err.message, true); });
  });

  function download(name, text, type) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* =====================================================================
     İÇERİK
     ===================================================================== */
  var I18N = 'i18n', AREA = 'i18n-area';
  var PUB_TYPES = [['article', 'Makale'], ['paper', 'Çalışma makalesi'], ['thesis', 'Tez']];
  var SCHEMA = [
    { key: 'publications', title: 'Yayınlar', desc: 'Listenin en üstündeki linkli yayın sitede "Son yayın" bandında gösterilir.', list: true, addTop: true,
      fields: [
        { k: 'title', l: 'Başlık', t: 'text', full: true, req: true },
        { k: 'year', l: 'Yıl', t: 'number', req: true },
        { k: 'type', l: 'Tür', t: 'select', opts: PUB_TYPES },
        { k: 'venue', l: 'Yayın yeri (dergi, sayı, tarih)', t: I18N, full: true },
        { k: 'href', l: 'Link', t: 'url', full: true, hint: 'Boş bırakılırsa başlık link olmadan gösterilir.' }
      ],
      blank: function () { return { year: new Date().getFullYear(), type: 'article', title: '', venue: { tr: 'Arkhedemia Dergisi, Sayı ', en: 'Arkhedemia Journal, Issue ' }, href: '' }; },
      summary: function (x) { return x.title || 'Yeni yayın'; }, meta: function (x) { return x.year + ', ' + (PUB_TYPES.filter(function (p) { return p[0] === x.type; })[0] || ['', ''])[1]; } },
    { key: 'hero', title: 'Açılış', obj: true,
      fields: [
        { k: 'status', l: 'Durum etiketi (bordo)', t: I18N, full: true },
        { k: 'role', l: 'Unvan', t: I18N, full: true },
        { k: 'lead', l: 'Tanıtım paragrafı', t: AREA, full: true }
      ] },
    { key: 'about.paragraphs', title: 'Hakkımda', list: true, self: AREA,
      blank: function () { return { tr: '', en: '' }; }, summary: function (x) { return (x.tr || '').slice(0, 90) || 'Yeni paragraf'; } },
    { key: 'experience', title: 'Deneyim', list: true, addTop: true,
      fields: [
        { k: 'title', l: 'Pozisyon', t: I18N, full: true, req: true },
        { k: 'org', l: 'Kurum, birim, şehir', t: I18N, full: true },
        { k: 'start', l: 'Başlangıç (ör. Eyl 2025)', t: I18N },
        { k: 'end', l: 'Bitiş (ör. Bugün)', t: I18N },
        { k: 'logo', l: 'Logo dosyası', t: 'text', hint: 'ör. img/logo-kigili.png' },
        { k: 'desc', l: 'Açıklama', t: AREA, full: true }
      ],
      blank: function () { return { start: { tr: '', en: '' }, end: { tr: 'Bugün', en: 'Present' }, logo: '', title: { tr: '', en: '' }, org: { tr: '', en: '' }, desc: { tr: '', en: '' } }; },
      summary: function (x) { return (x.title && x.title.tr) || 'Yeni pozisyon'; }, meta: function (x) { return (x.org && x.org.tr || '').split(',')[0]; } },
    { key: 'education', title: 'Eğitim', list: true, addTop: true,
      fields: [
        { k: 'degree', l: 'Derece ve bölüm', t: I18N, full: true },
        { k: 'school', l: 'Okul', t: I18N, full: true },
        { k: 'years', l: 'Yıl', t: 'text' }
      ],
      blank: function () { return { years: '', degree: { tr: '', en: '' }, school: { tr: '', en: '' } }; },
      summary: function (x) { return (x.degree && x.degree.tr) || 'Yeni eğitim'; }, meta: function (x) { return x.years; } },
    { key: 'projects', title: 'Projeler', list: true,
      fields: [
        { k: 'title', l: 'Proje adı', t: I18N, full: true },
        { k: 'desc', l: 'Açıklama', t: AREA, full: true },
        { k: 'href', l: 'Link', t: 'url', full: true },
        { k: 'cta', l: 'Buton yazısı', t: I18N },
        { k: 'tags', l: 'Etiketler', t: 'tags', hint: 'Virgülle ayırın: Python, Streamlit' }
      ],
      blank: function () { return { title: { tr: '', en: '' }, desc: { tr: '', en: '' }, tags: [], href: '', cta: { tr: 'Uygulamayı aç', en: 'Open the app' } }; },
      summary: function (x) { return (x.title && x.title.tr) || 'Yeni proje'; } },
    { key: 'research', title: 'Araştırma projeleri', list: true,
      fields: [
        { k: 'code', l: 'Program (ör. TÜBİTAK 1001)', t: 'text' },
        { k: 'title', l: 'Proje adı', t: I18N, full: true },
        { k: 'meta', l: 'Rol ve tarih', t: I18N, full: true }
      ],
      blank: function () { return { code: '', title: { tr: '', en: '' }, meta: { tr: '', en: '' } }; },
      summary: function (x) { return (x.title && x.title.tr) || 'Yeni proje'; }, meta: function (x) { return x.code; } },
    { key: 'corporate', title: 'Kigılı sistemleri', list: true, self: I18N,
      blank: function () { return { tr: '', en: '' }; }, summary: function (x) { return x.tr || 'Yeni madde'; } },
    { key: 'about.areas', title: 'Uzmanlık şeridi', list: true,
      fields: [
        { k: 'label', l: 'Başlık', t: I18N, full: true },
        { k: 'n', l: 'Sağdaki kısa not', t: I18N, full: true },
        { k: 'desc', l: 'Açıklama', t: AREA, full: true }
      ],
      blank: function () { return { label: { tr: '', en: '' }, n: { tr: '', en: '' }, desc: { tr: '', en: '' } }; },
      summary: function (x) { return (x.label && x.label.tr) || 'Yeni alan'; } },
    { key: 'about.toolGroups', title: 'Araçlar', list: true,
      fields: [
        { k: 'label', l: 'Grup adı', t: I18N, full: true },
        { k: 'items', l: 'Araçlar', t: 'tags', full: true, hint: 'Virgülle ayırın' }
      ],
      blank: function () { return { label: { tr: '', en: '' }, items: [] }; },
      summary: function (x) { return (x.label && x.label.tr) || 'Yeni grup'; } },
    { key: 'community', title: 'Topluluk', list: true,
      fields: [
        { k: 'role', l: 'Rol', t: I18N, full: true },
        { k: 'org', l: 'Kurum', t: I18N, full: true },
        { k: 'years', l: 'Yıl', t: I18N },
        { k: 'logo', l: 'Logo dosyası', t: 'text' },
        { k: 'href', l: 'Link', t: 'url', full: true }
      ],
      blank: function () { return { years: { tr: '', en: '' }, logo: '', role: { tr: '', en: '' }, org: { tr: '', en: '' }, href: '' }; },
      summary: function (x) { return (x.org && (x.org.tr || x.org)) || 'Yeni kayıt'; } },
    { key: 'ventures', title: 'Arkhedemia & Arkhebook', list: true, noAdd: true,
      desc: 'Buton linkleri Bağlantılar bölümünden yönetilir.',
      fields: [
        { k: 'name', l: 'Ad', t: 'text' },
        { k: 'logo', l: 'Logo dosyası', t: 'text' },
        { k: 'role', l: 'Rol', t: I18N, full: true },
        { k: 'desc', l: 'Açıklama', t: AREA, full: true }
      ],
      summary: function (x) { return x.name; } },
    { key: 'links', title: 'Bağlantılar', obj: true, extra: [{ k: 'email', l: 'E-posta', t: 'text', root: true, full: true }],
      fields: [
        { k: 'linkedin', l: 'LinkedIn', t: 'url' }, { k: 'github', l: 'GitHub', t: 'url' },
        { k: 'scholar', l: 'Google Scholar', t: 'url' }, { k: 'orcid', l: 'ORCID', t: 'url' },
        { k: 'arkhedemia', l: 'Arkhedemia', t: 'url' }, { k: 'arkhedemiaAuthor', l: 'Arkhedemia yazar sayfası', t: 'url' },
        { k: 'arkhebookPlay', l: 'Arkhebook Google Play', t: 'url' }, { k: 'arkhebookInfo', l: 'Arkhebook uygulama sayfası', t: 'url' },
        { k: 'cv', l: 'CV dosyası', t: 'text' }
      ] },
    { key: '__json', title: 'Gelişmiş (JSON)', json: true }
  ];

  var CT = { loaded: false, saved: null, draft: null, sec: 'publications', open: {} };

  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, p, v) { var ks = p.split('.'), last = ks.pop(); var t = ks.reduce(function (a, k) { return a[k] = a[k] || {}; }, o); t[last] = v; }
  function dirty() { return CT.loaded && JSON.stringify(CT.draft) !== JSON.stringify(CT.saved); }
  function normI18n(v) { return v && typeof v === 'object' ? v : { tr: v || '', en: v || '' }; }

  function loadContent() {
    $('ed-body').innerHTML = '<p class="state">Yükleniyor…</p>';
    api('site_content?select=data,updated_at&id=eq.1').then(function (r) { return r.json(); }).then(function (rows) {
      var base = clone(window.SITE);
      var data = rows[0] && rows[0].data ? Object.assign(base, rows[0].data) : base;
      CT.saved = clone(data); CT.draft = clone(data); CT.loaded = true;
      CT.updated = rows[0] && rows[0].updated_at;
      renderEditor(); updateState();
    }).catch(function (err) { if (err.message !== '401') $('ed-body').innerHTML = '<p class="state is-err">İçerik alınamadı: ' + esc(err.message) + '</p>'; });
  }

  function updateState() {
    var d = dirty(), st = $('ed-state');
    st.className = 'publishbar__state' + (d ? ' is-dirty' : '');
    st.textContent = d ? 'Yayınlanmamış değişiklikler var' : (CT.updated ? 'Son yayın: ' + fmtDate(new Date(CT.updated)) : 'Sitede data.js içeriği kullanılıyor; ilk yayından sonra panelden yönetilir.');
    $('ed-publish').disabled = !d; $('ed-discard').disabled = !d;
    renderNav();
  }
  addEventListener('beforeunload', function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  function renderNav() {
    $('ed-nav').innerHTML = SCHEMA.map(function (s) {
      var n = s.list ? (getPath(CT.draft, s.key) || []).length : '';
      return '<button type="button" data-sec="' + s.key + '"' + (CT.sec === s.key ? ' aria-current="true"' : '') + '><span>' + esc(s.title) + '</span><span class="n">' + n + '</span></button>';
    }).join('');
  }
  $('ed-nav').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (CT.sec === '__json' && !applyJson(true)) return;
    CT.sec = b.dataset.sec; renderEditor(); renderNav();
  });

  function fieldHtml(f, val, path) {
    var cls = 'fld' + (f.full ? ' full' : ''), hint = f.hint ? '<span class="hint">' + esc(f.hint) + '</span>' : '';
    if (f.t === I18N || f.t === AREA) {
      var v = normI18n(val), tag = f.t === AREA ? 'textarea' : 'input';
      function one(lang, lab) {
        var attr = ' data-path="' + path + '" data-lang="' + lang + '"';
        return '<label class="fld"><span>' + lab + '</span>' + (tag === 'textarea' ? '<textarea' + attr + '>' + esc(v[lang]) + '</textarea>' : '<input type="text"' + attr + ' value="' + esc(v[lang]) + '">') + '</label>';
      }
      return '<div class="' + (f.full ? 'full' : '') + '"><p class="fld" style="margin-bottom:.4rem"><span>' + esc(f.l) + (f.req ? ' *' : '') + '</span></p><div class="i18n">' + one('tr', 'Türkçe') + one('en', 'İngilizce') + '</div>' + hint + '</div>';
    }
    if (f.t === 'select') {
      return '<label class="' + cls + '"><span>' + esc(f.l) + '</span><select data-path="' + path + '">' + f.opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' + hint + '</label>';
    }
    var type = f.t === 'number' ? 'number' : f.t === 'url' ? 'url' : 'text';
    var shown = f.t === 'tags' ? (val || []).join(', ') : (val == null ? '' : val);
    return '<label class="' + cls + '"><span>' + esc(f.l) + (f.req ? ' *' : '') + '</span><input type="' + type + '" data-path="' + path + '" data-t="' + f.t + '" value="' + esc(shown) + '"' + (f.t === 'url' ? ' placeholder="https://"' : '') + '>' + hint + '</label>';
  }

  function renderEditor() {
    var s = SCHEMA.filter(function (x) { return x.key === CT.sec; })[0], html;
    if (s.json) {
      html = '<div class="ed-head"><div><h2>Gelişmiş (JSON)</h2><p>Tüm içerik tek bir JSON olarak. Değişiklikten sonra "Uygula"ya basın, ardından yayınlayın.</p></div><button class="btn btn--sm" type="button" id="json-apply">Uygula</button></div>' +
        '<p class="err" id="json-err"></p><textarea class="jsonbox" id="json-box" spellcheck="false" aria-label="İçerik JSON">' + esc(JSON.stringify(CT.draft, null, 2)) + '</textarea>';
      $('ed-body').innerHTML = html;
      $('json-apply').onclick = function () { if (applyJson(false)) toast('JSON uygulandı. Yayınlamayı unutmayın.'); };
      return;
    }
    html = '<div class="ed-head"><div><h2>' + esc(s.title) + '</h2>' + (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') + '</div>' +
      (s.list && !s.noAdd ? '<button class="btn btn--sm btn--solid" type="button" data-add>' + (s.addTop ? 'Başa ekle' : 'Yeni ekle') + '</button>' : '') + '</div>';
    if (s.obj) {
      var o = getPath(CT.draft, s.key) || {};
      html += '<div class="obj">' + (s.extra || []).map(function (f) { return fieldHtml(f, CT.draft[f.k], '@' + f.k); }).join('') +
        s.fields.map(function (f) { return fieldHtml(f, o[f.k], s.key + '.' + f.k); }).join('') + '</div>';
    } else {
      var list = getPath(CT.draft, s.key) || [];
      html += '<div class="items">' + list.map(function (it, i) {
        var p = s.key + '.' + i, open = CT.open[p];
        var body = s.self ? fieldHtml({ t: s.self, l: 'Metin', full: true }, it, p) : s.fields.map(function (f) { return fieldHtml(f, it[f.k], p + '.' + f.k); }).join('');
        return '<details class="item"' + (open ? ' open' : '') + ' data-i="' + i + '"><summary><span class="item__t">' + esc(s.summary(it)) + '</span>' +
          (s.meta ? '<span class="item__meta">' + esc(s.meta(it) || '') + '</span>' : '') +
          '<span class="item__ops"><button type="button" class="iconbtn" data-op="up" aria-label="Yukarı taşı"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" class="iconbtn" data-op="down" aria-label="Aşağı taşı"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
          (s.noAdd ? '' : '<button type="button" class="iconbtn del" data-op="del" aria-label="Sil">✕</button>') + '</span></summary>' +
          '<div class="item__body">' + body + '</div></details>';
      }).join('') + (list.length ? '' : '<p class="empty">Henüz kayıt yok.</p>') + '</div>';
    }
    $('ed-body').innerHTML = html;
  }

  function applyJson(silent) {
    var box = $('json-box'); if (!box) return true;
    try { var v = JSON.parse(box.value); if (!v || typeof v !== 'object' || !Array.isArray(v.publications)) throw new Error('publications listesi bulunamadı'); CT.draft = v; updateState(); $('json-err').textContent = ''; return true; }
    catch (e) { $('json-err').textContent = 'JSON geçersiz: ' + e.message; if (silent) toast('JSON geçersiz; önce düzeltin ya da "Değişiklikleri geri al"ı kullanın.', true); return false; }
  }

  // Alan değişiklikleri
  $('ed-body').addEventListener('input', function (e) {
    var el = e.target, p = el.dataset.path; if (!p) return;
    var root = p.charAt(0) === '@', path = root ? p.slice(1) : p, v;
    if (el.dataset.lang) {
      var cur = normI18n(getPath(CT.draft, path)); cur = clone(cur); cur[el.dataset.lang] = el.value; v = cur;
    } else if (el.dataset.t === 'number') v = el.value === '' ? '' : Number(el.value);
    else if (el.dataset.t === 'tags') v = el.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    else v = el.value;
    setPath(CT.draft, path, v);
    var item = el.closest('.item');
    if (item) {
      var s = SCHEMA.filter(function (x) { return x.key === CT.sec; })[0], it = getPath(CT.draft, s.key)[+item.dataset.i];
      item.querySelector('.item__t').textContent = s.summary(it);
      var m = item.querySelector('.item__meta'); if (m && s.meta) m.textContent = s.meta(it) || '';
    }
    updateState();
  });
  $('ed-body').addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') e.target.dispatchEvent(new Event('input', { bubbles: true })); });
  $('ed-body').addEventListener('toggle', function (e) {
    var d = e.target; if (!d.classList || !d.classList.contains('item')) return;
    CT.open[CT.sec + '.' + d.dataset.i] = d.open;
  }, true);

  $('ed-body').addEventListener('click', function (e) {
    var s = SCHEMA.filter(function (x) { return x.key === CT.sec; })[0];
    if (e.target.closest('[data-add]')) {
      var list = getPath(CT.draft, s.key) || []; setPath(CT.draft, s.key, list);
      var shifted = {};
      if (s.addTop) { list.unshift(s.blank()); Object.keys(CT.open).forEach(function (k) { var m = k.match(/^(.*)\.(\d+)$/); if (m && m[1] === s.key) shifted[s.key + '.' + (+m[2] + 1)] = CT.open[k]; else shifted[k] = CT.open[k]; }); CT.open = shifted; CT.open[s.key + '.0'] = true; }
      else { list.push(s.blank()); CT.open[s.key + '.' + (list.length - 1)] = true; }
      renderEditor(); updateState();
      var first = $('ed-body').querySelector('.item[open] input, .item[open] textarea'); if (first && s.addTop) first.focus();
      return;
    }
    var op = e.target.closest('[data-op]'); if (!op) return;
    e.preventDefault(); e.stopPropagation();
    var item = op.closest('.item'), i = +item.dataset.i, arr = getPath(CT.draft, s.key);
    if (op.dataset.op === 'del') {
      if (!confirm('"' + s.summary(arr[i]) + '" silinsin mi? (Yayınlayana kadar geri alabilirsiniz.)')) return;
      arr.splice(i, 1); CT.open = {};
    } else {
      var j = op.dataset.op === 'up' ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return;
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      var oi = CT.open[s.key + '.' + i], oj = CT.open[s.key + '.' + j]; CT.open[s.key + '.' + i] = oj; CT.open[s.key + '.' + j] = oi;
    }
    renderEditor(); updateState();
  });

  $('ed-discard').addEventListener('click', function () {
    if (!confirm('Yayınlanmamış tüm değişiklikler geri alınsın mı?')) return;
    CT.draft = clone(CT.saved); CT.open = {}; renderEditor(); updateState();
  });

  function validate(d) {
    var errs = [];
    (d.publications || []).forEach(function (p, i) {
      if (!p.title || !String(p.title).trim()) errs.push('Yayınlar: ' + (i + 1) + '. kaydın başlığı boş.');
      if (!p.year || isNaN(p.year)) errs.push('Yayınlar: "' + (p.title || (i + 1) + '. kayıt') + '" için yıl girilmeli.');
      if (p.href && !/^https?:\/\//.test(p.href)) errs.push('Yayınlar: "' + p.title + '" linki http:// ya da https:// ile başlamalı.');
    });
    return errs;
  }

  $('ed-publish').addEventListener('click', function () {
    if (CT.sec === '__json' && !applyJson(false)) return;
    var errs = validate(CT.draft);
    if (errs.length) { toast(errs[0], true); return; }
    var btn = this; btn.disabled = true; btn.textContent = 'Yayınlanıyor…';
    api('site_content?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: { id: 1, data: CT.draft, updated_at: new Date().toISOString() } })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        CT.saved = clone(CT.draft); CT.updated = rows[0] && rows[0].updated_at || new Date().toISOString();
        updateState(); toast('Yayınlandı. Değişiklik sitede hemen görünür.');
      })
      .catch(function (err) { if (err.message !== '401') toast('Yayınlanamadı: ' + err.message, true); })
      .finally(function () { btn.textContent = 'Yayınla'; updateState(); });
  });

  $('ed-download').addEventListener('click', function () {
    var head = '/* ==========================================================================\n   SİTE İÇERİĞİ — yönetim panelinden ' + fmtDate(new Date()) + ' tarihinde dışa aktarıldı.\n   Supabase\'e ulaşılamadığında site bu içerikle açılır.\n   ========================================================================== */\n\n';
    download('data.js', head + 'window.SITE = ' + JSON.stringify(CT.draft, null, 2) + ';\n', 'text/javascript');
  });

  /* =====================================================================
     Başlangıç
     ===================================================================== */
  if (sess) checkAdmin().then(startApp).catch(function (e) { showLogin(e.message === '401' ? '' : e.message); });
  else showLogin();
})();
