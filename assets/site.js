(function () {
  'use strict';
  var S = window.SITE;
  var UI = {
    tr: {
      skip: 'İçeriğe geç', nav_about: 'Hakkımda', nav_exp: 'Deneyim', nav_ventures: 'Arkhedemia & Arkhebook',
      nav_pubs: 'Yayınlar', nav_projects: 'Projeler', nav_contact: 'İletişim',
      cta_pubs: 'Yayınlarım', cta_projects: 'Projelerim', cta_cv: "CV'yi indir (PDF)", cta_cv_short: "CV'yi indir", cta_mail: 'E-posta gönder',
      band_kicker: 'Son yayın', band_all: 'Tüm yayınlar', band_read: 'Makaleyi oku', h_tools: 'Araçlar',
      plot_note: 'Her yüklemede yeni bir örneklem; doğru, en küçük kareler ile tarayıcıda hesaplanır.',
      h_about: 'Hakkımda', h_methods: 'Çalıştığım yöntemler', h_edu: 'Eğitim',
      h_exp: 'Deneyim', h_corporate: "Kigılı'da kurduğum sistemlerden bazıları", h_community: 'Topluluk ve gönüllülük',
      h_ventures: 'Arkhedemia ve Arkhebook', sub_ventures: 'Kurucu ortağı olduğum dergi ve onun için geliştirdiğim okuma uygulaması.',
      h_pubs: 'Yayınlar', scholar: 'Google Scholar profili', author_page: 'Arkhedemia yazar sayfası',
      h_projects: 'Projeler', sub_projects: 'Herkesin kullanabileceği uygulamalar ve yer aldığım araştırma projeleri.',
      h_research: 'Araştırma projeleri',
      h_contact: 'İletişim', sub_contact: 'Veri analizi, ekonometrik modelleme ya da İK analitiği üzerine iş birliği için yazabilirsiniz.',
      c_mail: 'E-posta', c_scholar: 'Akademik profil', back_top: 'Başa dön',
      f_all: 'Tümü', f_article: 'Makale', f_paper: 'Çalışma makalesi', f_thesis: 'Tez',
      pub_count: function (n, y) { return n + ' yayın, ' + y + ' yılları arasında.'; },
      lang_btn: 'EN', lang_aria: 'Switch to English', theme_aria: 'Temayı değiştir', menu: 'Menü',
      plot_x: 'x', plot_y: 'y', plot_aria: 'Rastgele örnek veriye uydurulmuş doğrusal regresyon grafiği',
      title: 'Mustafa Sabri Doğruyol | Veri Analisti ve Ekonometrist'
    },
    en: {
      skip: 'Skip to content', nav_about: 'About', nav_exp: 'Experience', nav_ventures: 'Arkhedemia & Arkhebook',
      nav_pubs: 'Publications', nav_projects: 'Projects', nav_contact: 'Contact',
      cta_pubs: 'Publications', cta_projects: 'Projects', cta_cv: 'Download CV (PDF)', cta_cv_short: 'Download CV', cta_mail: 'Send an email',
      band_kicker: 'Latest publication', band_all: 'All publications', band_read: 'Read the article', h_tools: 'Tools',
      plot_note: 'A fresh sample on every load; the line is fitted by least squares in your browser.',
      h_about: 'About', h_methods: 'Methods I work with', h_edu: 'Education',
      h_exp: 'Experience', h_corporate: 'Some of the systems I built at Kigılı', h_community: 'Community and volunteering',
      h_ventures: 'Arkhedemia and Arkhebook', sub_ventures: 'The journal I co-founded, and the reading app I built for it.',
      h_pubs: 'Publications', scholar: 'Google Scholar profile', author_page: 'Arkhedemia author page',
      h_projects: 'Projects', sub_projects: 'Apps anyone can use, and the research projects I have worked on.',
      h_research: 'Research projects',
      h_contact: 'Contact', sub_contact: 'Write to me about data analysis, econometric modelling or HR analytics collaborations.',
      c_mail: 'Email', c_scholar: 'Academic profile', back_top: 'Back to top',
      f_all: 'All', f_article: 'Article', f_paper: 'Working paper', f_thesis: 'Thesis',
      pub_count: function (n, y) { return n + ' publications, ' + y + '.'; },
      lang_btn: 'TR', lang_aria: 'Türkçeye geç', theme_aria: 'Toggle theme', menu: 'Menu',
      plot_x: 'x', plot_y: 'y', plot_aria: 'Linear regression line fitted to a random sample',
      title: 'Mustafa Sabri Doğruyol | Data Analyst and Econometrician'
    }
  };

  var lang = 'tr';
  try { lang = localStorage.getItem('lang') || 'tr'; } catch (e) {}
  if (!UI[lang]) lang = 'tr';
  var pubFilter = 'all';

  function t(v) { return v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] != null ? v[lang] : v.tr) : v; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function ext(href) { return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''; }
  function link(key) { return S.links[key] || key; }
  function get(path) { return path.split('.').reduce(function (o, k) { return o && o[k]; }, S); }

  /* ---------- Render ---------- */
  function render() {
    var u = UI[lang];
    document.documentElement.lang = lang;
    document.title = u.title;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var k = el.dataset.i18n; if (u[k]) el.textContent = u[k]; });
    document.querySelectorAll('[data-bind]').forEach(function (el) { el.textContent = t(get(el.dataset.bind)); });
    document.querySelectorAll('[data-href]').forEach(function (el) {
      el.href = link(el.dataset.href);
      if (/^https?:/.test(el.href)) { el.target = '_blank'; el.rel = 'noopener'; }
    });
    $('lang').textContent = u.lang_btn; $('lang').setAttribute('aria-label', u.lang_aria);
    $('theme').setAttribute('aria-label', u.theme_aria);
    $('menu').setAttribute('aria-label', u.menu);
    $('plot').setAttribute('aria-label', u.plot_aria);

    $('about-text').innerHTML = S.about.paragraphs.map(function (p) { return '<p>' + esc(t(p)) + '</p>'; }).join('');
    $('tools').innerHTML = S.about.toolGroups.map(function (g) {
      return '<div><dt>' + esc(t(g.label)) + '</dt><dd>' + g.items.map(esc).join(', ') + '</dd></div>';
    }).join('');
    $('areas').innerHTML = S.about.areas.map(function (a) {
      return '<article class="area" role="listitem"><div class="area__top"><h3>' + esc(t(a.label)) + '</h3><span class="area__n">' + esc(t(a.n)) + '</span></div><p>' + esc(t(a.desc)) + '</p></article>';
    }).join('');
    var latest = S.publications.filter(function (p) { return p.href; })[0];
    if (latest) { $('band-title').textContent = latest.title; $('band-venue').textContent = t(latest.venue); $('band-link').href = latest.href; }
    $('edu').innerHTML = S.education.map(function (e) {
      return '<li><span class="y">' + esc(e.years) + '</span><div><strong>' + esc(t(e.degree)) + '</strong><span class="s">' + esc(t(e.school)) + '</span></div></li>';
    }).join('');

    $('exp').innerHTML = S.experience.map(function (x, i) {
      var end = i === 0 ? '<span class="now">' + esc(t(x.end)) + '</span>' : esc(t(x.end));
      return '<li><div class="logo"><img src="' + x.logo + '" alt="" width="38" height="38" loading="lazy"></div><div>' +
        '<p class="when">' + esc(t(x.start)) + ' – ' + end + '</p>' +
        '<h3>' + esc(t(x.title)) + '</h3><p class="org">' + esc(t(x.org)) + '</p>' +
        '<p class="d">' + esc(t(x.desc)) + '</p></div></li>';
    }).join('');
    $('corporate').innerHTML = S.corporate.map(function (c) { return '<li>' + esc(t(c)) + '</li>'; }).join('');
    $('community').innerHTML = S.community.map(function (c) {
      var org = c.href ? '<a href="' + c.href + '"' + ext(c.href) + '>' + esc(t(c.org)) + '</a>' : esc(t(c.org));
      return '<li><div class="logo"><img src="' + c.logo + '" alt="" width="28" height="28" loading="lazy"></div><div><strong>' + esc(t(c.role)) + '</strong><span class="meta">' + org + ', ' + esc(t(c.years)) + '</span></div></li>';
    }).join('');

    $('ventures').innerHTML = S.ventures.map(function (v) {
      return '<article class="venture' + (v.key === 'arkhebook' ? ' venture--app' : '') + '">' +
        '<div class="venture__top"><img src="' + v.logo + '" alt="" width="64" height="64" loading="lazy"><div><h3>' + esc(v.name) + '</h3><p class="r">' + esc(t(v.role)) + '</p></div></div>' +
        '<p class="d">' + esc(t(v.desc)) + '</p><div class="venture__acts">' +
        v.actions.map(function (a) { var h = link(a.href); return '<a class="btn' + (a.primary ? ' btn--solid' : '') + '" href="' + h + '"' + ext(h) + '>' + esc(t(a.label)) + '</a>'; }).join('') +
        '</div></article>';
    }).join('');

    renderPubs();

    $('projects').innerHTML = S.projects.map(function (p) {
      return '<article class="proj"><h3>' + esc(t(p.title)) + '</h3><p>' + esc(t(p.desc)) + '</p>' +
        '<div class="tags">' + p.tags.map(function (g) { return '<span>' + esc(g) + '</span>'; }).join('') + '</div>' +
        '<a class="btn btn--sm" href="' + p.href + '"' + ext(p.href) + '>' + esc(t(p.cta)) + '</a></article>';
    }).join('');
    $('research').innerHTML = S.research.map(function (r) {
      return '<li><span class="c">' + esc(r.code) + '</span><div><strong>' + esc(t(r.title)) + '</strong><span class="m">' + esc(t(r.meta)) + '</span></div></li>';
    }).join('');

    document.querySelectorAll('.js-mail-text').forEach(function (el) { el.textContent = S.email; });
    $('year').textContent = new Date().getFullYear();
  }

  function renderPubs() {
    var u = UI[lang], P = S.publications;
    var types = ['all', 'article', 'paper', 'thesis'];
    $('pub-filters').innerHTML = types.map(function (k) {
      var n = k === 'all' ? P.length : P.filter(function (p) { return p.type === k; }).length;
      if (!n) return '';
      return '<button type="button" data-f="' + k + '" aria-pressed="' + (pubFilter === k) + '">' + u['f_' + k] + '<span class="n">' + n + '</span></button>';
    }).join('');
    var years = P.map(function (p) { return p.year; });
    $('pub-count').textContent = u.pub_count(P.length, Math.min.apply(null, years) + '–' + Math.max.apply(null, years));
    $('pubs').innerHTML = P.map(function (p) {
      var title = p.href ? '<a class="t" href="' + p.href + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' : '<span class="t">' + esc(p.title) + '</span>';
      return '<li class="pub" data-type="' + p.type + '"' + (pubFilter !== 'all' && p.type !== pubFilter ? ' hidden' : '') + '>' +
        '<span class="y">' + p.year + '</span><div>' + title + '<p class="v">' + esc(t(p.venue)) + '</p></div>' +
        '<span class="k">' + u['f_' + p.type] + '</span></li>';
    }).join('');
  }

  /* ---------- Regression plot ---------- */
  function plot() {
    var svg = $('plot'), NS = 'http://www.w3.org/2000/svg';
    var W = 560, H = 420, m = { l: 44, r: 16, t: 20, b: 40 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b, n = 34;
    // Box–Muller normal noise
    function rn() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    var b0 = 1.2 + Math.random() * 0.8, b1 = 0.65 + Math.random() * 0.25, xs = [], ys = [];
    for (var i = 0; i < n; i++) { var x = Math.random() * 10; xs.push(x); ys.push(b0 + b1 * x + rn() * 0.85); }
    // OLS
    var mx = xs.reduce(function (a, b) { return a + b; }) / n, my = ys.reduce(function (a, b) { return a + b; }) / n;
    var sxy = 0, sxx = 0, sst = 0, sse = 0;
    for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
    var B1 = sxy / sxx, B0 = my - B1 * mx;
    for (i = 0; i < n; i++) { var e = ys[i] - (B0 + B1 * xs[i]); sse += e * e; sst += (ys[i] - my) * (ys[i] - my); }
    var r2 = 1 - sse / sst, s = Math.sqrt(sse / (n - 2));
    var ymax = 12;
    function X(v) { return m.l + v / 10 * iw; } function Y(v) { return m.t + ih - Math.max(0, Math.min(ymax, v)) / ymax * ih; }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }

    svg.innerHTML = '';
    var g = el('g', { 'class': 'grid' });
    for (var gx = 0; gx <= 10; gx += 2) el('line', { x1: X(gx), x2: X(gx), y1: m.t, y2: m.t + ih }, g);
    for (var gy = 0; gy <= ymax; gy += 3) el('line', { x1: m.l, x2: m.l + iw, y1: Y(gy), y2: Y(gy) }, g);
    el('line', { 'class': 'axis', x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih });
    el('line', { 'class': 'axis', x1: m.l, x2: m.l, y1: m.t, y2: m.t + ih });
    for (gx = 0; gx <= 10; gx += 2) el('text', { 'class': 'tick', x: X(gx), y: m.t + ih + 18, 'text-anchor': 'middle' }).textContent = gx;
    for (gy = 0; gy <= ymax; gy += 3) el('text', { 'class': 'tick', x: m.l - 10, y: Y(gy) + 4, 'text-anchor': 'end' }).textContent = gy;
    el('text', { 'class': 'lab', x: m.l + iw, y: m.t + ih + 34, 'text-anchor': 'end' }).textContent = 'x';
    el('text', { 'class': 'lab', x: m.l - 30, y: m.t + 4 }).textContent = 'y';

    // ±1 standard error band around fit
    var x0 = 0, x1 = 10;
    el('polygon', { 'class': 'band-ci', points: [X(x0) + ',' + Y(B0 + B1 * x0 + s), X(x1) + ',' + Y(B0 + B1 * x1 + s), X(x1) + ',' + Y(B0 + B1 * x1 - s), X(x0) + ',' + Y(B0 + B1 * x0 - s)].join(' '), style: 'animation-delay:1.5s' });

    var order = xs.map(function (_, k) { return k; }).sort(function (a, b) { return xs[a] - xs[b]; });
    order.forEach(function (k, j) {
      el('line', { 'class': 'res', x1: X(xs[k]), x2: X(xs[k]), y1: Y(ys[k]), y2: Y(B0 + B1 * xs[k]), style: 'animation-delay:' + (1.4 + j * 0.015) + 's' });
    });
    order.forEach(function (k, j) {
      var c = el('circle', { 'class': 'pt', cx: X(xs[k]), cy: Y(ys[k]), r: 4.5, style: 'transform-origin:' + X(xs[k]) + 'px ' + Y(ys[k]) + 'px;animation-delay:' + (j * 0.022) + 's' });
      el('title', {}, c).textContent = 'x = ' + xs[k].toFixed(2) + ', y = ' + ys[k].toFixed(2);
    });
    var fit = el('line', { 'class': 'fit', x1: X(x0), y1: Y(B0 + B1 * x0), x2: X(x1), y2: Y(B0 + B1 * x1) });
    var len = Math.hypot(X(x1) - X(x0), Y(B0 + B1 * x1) - Y(B0 + B1 * x0));
    fit.style.strokeDasharray = len; fit.style.strokeDashoffset = len;
    fit.style.animation = 'draw .9s cubic-bezier(.4,0,.2,1) .8s forwards';

    function f(v) { return v.toFixed(2).replace('.', lang === 'tr' ? ',' : '.'); }
    $('plot-eq').textContent = 'ŷ = ' + f(B0) + ' + ' + f(B1) + 'x     R² = ' + f(r2) + '     n = ' + n;
    requestAnimationFrame(function () { svg.parentNode.classList.add('is-on'); });
    plot.refresh = function () { $('plot-eq').textContent = 'ŷ = ' + f(B0) + ' + ' + f(B1) + 'x     R² = ' + f(r2) + '     n = ' + n; };
  }

  /* ---------- Interactions ---------- */
  function init() {
    render();
    plot();

    $('lang').addEventListener('click', function () {
      lang = lang === 'tr' ? 'en' : 'tr';
      try { localStorage.setItem('lang', lang); } catch (e) {}
      render(); plot.refresh && plot.refresh();
    });

    $('theme').addEventListener('click', function () {
      var root = document.documentElement;
      var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });

    var menu = $('menu'), nav = $('nav');
    menu.addEventListener('click', function () {
      var open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); } });

    $('pub-filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      pubFilter = b.dataset.f; renderPubs();
      var nb = $('pub-filters').querySelector('[data-f="' + pubFilter + '"]'); nb && nb.focus();
    });

    // E-posta adresini botlardan saklayarak aç
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.js-mail'); if (!a) return;
      e.preventDefault(); window.location.href = 'mai' + 'lto:' + S.email;
    });

    var bar = document.querySelector('.bar');
    addEventListener('scroll', function () { bar.classList.toggle('is-scrolled', scrollY > 8); }, { passive: true });

    if ('IntersectionObserver' in window) {
      var links = {};
      nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && links[en.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
            links[en.target.id].classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
