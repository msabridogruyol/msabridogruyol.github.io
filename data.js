/* ==========================================================================
   SİTE İÇERİĞİ — Tüm metinler ve linkler burada.
   Bir linki ya da bilgiyi güncellemek için yalnızca bu dosyayı düzenleyin.
   Her metin { tr: "...", en: "..." } biçimindedir.
   ========================================================================== */

window.SITE = {
  email: "info@msabridogruyol.com",

  links: {
    linkedin: "https://www.linkedin.com/in/msabridogruyol99",
    github: "https://github.com/msabridogruyol",
    scholar: "https://scholar.google.com/citations?user=fi-3L8cAAAAJ",
    orcid: "https://orcid.org/0000-0002-9382-1689",
    arkhedemia: "https://arkhedemia-dergisi.vercel.app/",
    arkhedemiaAuthor: "https://arkhedemia-dergisi.vercel.app/yazarlar/mustafa-sabri-dogruyol",
    arkhebookPlay: "https://play.google.com/store/apps/details?id=com.arkhebook.app",
    arkhebookInfo: "https://arkhedemia-dergisi.vercel.app/uygulama",
    cv: "cv.pdf"
  },

  hero: {
    status: { tr: "Kigılı'da İK ve veri analitiği", en: "HR and data analytics at Kigılı" },
    role: { tr: "Veri analisti ve ekonometrist", en: "Data analyst and econometrician" },
    lead: {
      tr: "Ham veriyi karar alınabilir bilgiye çeviriyorum. Kigılı'da İK ve satış analitiği altyapısı kuruyor, akademide ekonometrik modelleme çalışıyor, boş zamanımda Arkhedemia Dergisi'ni ve Arkhebook uygulamasını geliştiriyorum.",
      en: "I turn raw data into information people can decide on. I build HR and sales analytics at Kigılı, do econometric research, and in my spare time develop Arkhedemia Journal and the Arkhebook app."
    }
  },

  about: {
    paragraphs: [
      {
        tr: "Ekonometri lisansımı Gazi Üniversitesi'nde, yüksek lisansımı Sakarya Üniversitesi'nde tamamladım. Şu anda Ankara Hacı Bayram Veli Üniversitesi'nde Yöneylem Araştırması yüksek lisansına devam ediyorum.",
        en: "I studied Econometrics at Gazi University (BSc) and Sakarya University (MSc), and I am currently pursuing an MSc in Operations Research at Ankara Hacı Bayram Veli University."
      },
      {
        tr: "Kigılı İnsan Kaynakları'nda çoklu veri kaynaklarını birleştiren analitik altyapıyı tasarlıyorum: performans ölçüm sistemleri, prim ve maliyet simülasyonları, mağaza karneleri, nine-box matrisi ve Power BI yönetim panelleri. Öncesinde SAUTEK'te Sakarya Üniversitesi'nin akademik performans ölçüm altyapısını kurdum ve iki TÜBİTAK projesinde bursiyer olarak yer aldım.",
        en: "At Kigılı HR I design the analytics layer that joins multiple data sources: performance measurement, bonus and cost simulations, store scorecards, a nine-box matrix and Power BI management dashboards. Before that, at SAUTEK, I built Sakarya University's academic performance measurement infrastructure and worked as a scholar on two TÜBİTAK projects."
      },
      {
        tr: "Kurduğum sistemlerin sürdürülebilir, ölçülebilir ve karar verenler için anlaşılır olmasına önem veriyorum. Manuel süreçleri otomatikleştirmek ve veriyi standart hale getirmek işimin ayrılmaz parçası.",
        en: "I care that the systems I build are sustainable, measurable and readable by the people who decide. Automating manual work and standardising data are a core part of the job."
      }
    ],
    toolGroups: [
      { label: { tr: "Modelleme", en: "Modelling" }, items: ["Python", "R", "Stata", "E-Views", "SPSS", "Gretl", "MATLAB"] },
      { label: { tr: "İş zekası", en: "Business intelligence" }, items: ["Power BI (DAX)", "Excel / VBA", "SQL", "Tableau", "Qlik"] },
      { label: { tr: "Uygulama", en: "Apps" }, items: ["Streamlit", "Plotly", "scikit-learn", "HTML / CSS"] },
      { label: { tr: "Akademik veri", en: "Research data" }, items: ["Web of Science / InCites", "Scopus / SciVal", "MAXQDA"] }
    ],
    areas: [
      { label: { tr: "Ekonometri", en: "Econometrics" }, n: { tr: "5 yayın", en: "5 papers" }, desc: { tr: "Panel veri, zaman serisi, eşbütünleşme ve nedensellik analizleri.", en: "Panel data, time series, cointegration and causality." } },
      { label: { tr: "İK analitiği", en: "HR analytics" }, n: { tr: "Kigılı", en: "Kigılı" }, desc: { tr: "Performans ölçümü, nine-box, işten çıkış ve norm analizleri.", en: "Performance measurement, nine-box, attrition and headcount models." } },
      { label: { tr: "Karar modelleri", en: "Decision models" }, n: { tr: "ÇKKV", en: "MCDM" }, desc: { tr: "Fuzzy AHP ve çok kriterli karar verme ile aday değerlendirme.", en: "Fuzzy AHP and multi-criteria decision making for candidate evaluation." } },
      { label: { tr: "İş zekası", en: "Business intelligence" }, n: { tr: "Power BI", en: "Power BI" }, desc: { tr: "DAX ile veri modelleme, yönetim panelleri ve otomatik raporlar.", en: "DAX data models, management dashboards and automated reports." } },
      { label: { tr: "Bilimetri", en: "Scientometrics" }, n: { tr: "SAUTEK", en: "SAUTEK" }, desc: { tr: "Web of Science, InCites ve SciVal ile yayın ve atıf analizi.", en: "Publication and citation analysis with Web of Science, InCites and SciVal." } },
      { label: { tr: "Uygulama geliştirme", en: "App development" }, n: { tr: "Arkhebook", en: "Arkhebook" }, desc: { tr: "Streamlit analiz araçları ve Android okuma uygulaması.", en: "Streamlit analysis tools and an Android reading app." } }
    ],
    methods: {
      tr: ["Panel veri", "Zaman serisi (ARIMA, VAR, GARCH)", "Eşbütünleşme ve nedensellik", "ÇKKV, Fuzzy AHP", "KPI mimarisi", "İK analitiği"],
      en: ["Panel data", "Time series (ARIMA, VAR, GARCH)", "Cointegration and causality", "MCDM, Fuzzy AHP", "KPI architecture", "HR analytics"]
    }
  },

  education: [
    { years: "2025 –", degree: { tr: "Yüksek lisans, Yöneylem Araştırması", en: "MSc, Operations Research" }, school: { tr: "Ankara Hacı Bayram Veli Üniversitesi (devam ediyor)", en: "Ankara Hacı Bayram Veli University (ongoing)" } },
    { years: "2024", degree: { tr: "Yüksek lisans, Ekonometri", en: "MSc, Econometrics" }, school: { tr: "Sakarya Üniversitesi", en: "Sakarya University" } },
    { years: "2022", degree: { tr: "Lisans, Ekonometri", en: "BSc, Econometrics" }, school: { tr: "Gazi Üniversitesi", en: "Gazi University" } }
  ],

  experience: [
    {
      start: { tr: "Eyl 2025", en: "Sep 2025" }, end: { tr: "Bugün", en: "Present" },
      logo: "img/logo-kigili.png",
      title: { tr: "Organizasyonel Gelişim ve Veri Analitiği Uzmanı", en: "Organisational Development & Data Analytics Specialist" },
      org: { tr: "Kigılı, İnsan Kaynakları, İstanbul", en: "Kigılı, Human Resources, Istanbul" },
      desc: {
        tr: "Satış performansı ve İK metrikleri için Power BI (DAX), SQL ve ileri Excel ile ölçüm sistemleri kuruyorum. Geçmiş veriden prim ve maliyet simülasyonları, senaryo analizleri ve tahminler üretiyor; veri standardizasyonu ve doğrulama kurallarıyla güvenilir bir veri altyapısı oluşturuyorum.",
        en: "I build measurement systems for sales performance and HR metrics with Power BI (DAX), SQL and advanced Excel, produce bonus and cost simulations, scenario analyses and forecasts from historical data, and keep the data trustworthy through standardisation and validation rules."
      }
    },
    {
      start: { tr: "Kas 2022", en: "Nov 2022" }, end: { tr: "Eyl 2025", en: "Sep 2025" },
      logo: "img/logo-sautek.png",
      title: { tr: "Uzman Veri Analisti", en: "Senior Data Analyst" },
      org: { tr: "SAUTEK, Sakarya Üniversitesi Kurumsal Veri Yönetimi Ofisi", en: "SAUTEK, Sakarya University Institutional Data Office" },
      desc: {
        tr: "Fakülte, bölüm ve üniversite düzeyinde karşılaştırmalı akademik performans analizleri ürettim. Web of Science, InCites ve SciVal ile yayın, atıf ve iş birliği analizleri yaptım; kurumsal raporlamayı Power BI ve Excel ile otomatikleştirdim; akademisyenlere veri yönetimi eğitimleri verdim.",
        en: "Produced comparative academic performance analyses at faculty, department and university level; ran publication, citation and collaboration analyses with Web of Science, InCites and SciVal; automated institutional reporting with Power BI and Excel; trained faculty on data management."
      }
    },
    {
      start: { tr: "Ağu 2019", en: "Aug 2019" }, end: { tr: "Haz 2021", en: "Jun 2021" },
      logo: "img/logo-kuveytturk.png",
      title: { tr: "Müşteri Temsilcisi Yetkilisi", en: "Customer Relations Officer" },
      org: { tr: "Kuveyt Türk Katılım Bankası, Ankara", en: "Kuveyt Türk Participation Bank, Ankara" },
      desc: {
        tr: "Bireysel bankacılık operasyonlarında müşteri ilişkileri yönetimi ve süreç takibi.",
        en: "Customer relationship management and process follow-up in retail banking."
      }
    }
  ],

  ventures: [
    {
      key: "arkhedemia",
      logo: "img/logo-arkhedemia.png",
      name: "Arkhedemia Dergisi",
      role: { tr: "Kurucu ortak, iş geliştirme · Şubat 2025'ten beri", en: "Co-founder, business development · since February 2025" },
      desc: {
        tr: "Genç araştırmacıların makale, deneme ve edebi metinlerini yayımlayan bağımsız, disiplinler arası dergi. Yayın süreçlerini ve dijital platformu yönetiyorum.",
        en: "An independent, interdisciplinary journal publishing research articles, essays and literary work by young researchers. I run its publishing workflow and digital platform."
      },
      actions: [
        { label: { tr: "Dergiyi aç", en: "Open the journal" }, href: "arkhedemia", primary: true },
        { label: { tr: "Yazar sayfam", en: "My author page" }, href: "arkhedemiaAuthor" }
      ]
    },
    {
      key: "arkhebook",
      logo: "img/arkhebook.svg",
      name: "Arkhebook",
      role: { tr: "Geliştirici ve tasarımcı · Android", en: "Developer and designer · Android" },
      desc: {
        tr: "Okuma takibi uygulaması: okuduğunuz ve okuyacağınız kitapları listeler, okuma istatistiklerinizi grafiklerle gösterir, arkadaşlarınızla okuma yarışmalarına katılmanızı sağlar. iOS sürümü yakında.",
        en: "A reading tracker: list the books you've read and plan to read, see your reading statistics as charts, and join reading challenges with friends. iOS version coming soon."
      },
      actions: [
        { label: { tr: "Google Play'den indir", en: "Get it on Google Play" }, href: "arkhebookPlay", primary: true },
        { label: { tr: "Uygulama sayfası", en: "App page" }, href: "arkhebookInfo" }
      ]
    }
  ],

  /* type: article | paper | thesis */
  publications: [
    {
      year: 2026, type: "article",
      title: "Halk Algısı ve Ticari Kopukluk: Güney Kore-Japonya Üzerine Bir Ekonometrik Analiz",
      venue: { tr: "Arkhedemia Dergisi, Sayı 007, Temmuz 2026", en: "Arkhedemia Journal, Issue 007, July 2026" },
      href: "https://arkhedemia-dergisi.vercel.app/yazi/halk-algisi-ve-ticari-kopukluk-guney-kore-japonya-uzerine-bir-ekonometrik-analiz"
    },
    {
      year: 2026, type: "article",
      title: "İK Yönetiminde Pozisyon Bazlı Aday Değerlendirme: Fuzzy AHP ve ÇKKV Yöntemleri ile Bootstrap Destekli Bir Model Önerisi",
      venue: { tr: "Arkhedemia Dergisi, Sayı 006, Mayıs 2026", en: "Arkhedemia Journal, Issue 006, May 2026" },
      href: "https://arkhedemia-dergisi.vercel.app/yazi/ik-yonetiminde-pozisyon-bazli-aday-degerlendirme"
    },
    {
      year: 2025, type: "paper",
      title: "How Did Foreign and Domestic Institutional Changes Impact Investor Risk Perception in the Late Ottoman Period?",
      venue: { tr: "SSRN (Elsevier), çalışma makalesi, 2025", en: "SSRN (Elsevier), working paper, 2025" },
      href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5272905"
    },
    {
      year: 2025, type: "article",
      title: "Ekonomik Büyümenin Yoksulluk Üzerine Etkisi",
      venue: { tr: "Arkhedemia Dergisi, Sayı 002, Nisan 2025", en: "Arkhedemia Journal, Issue 002, April 2025" },
      href: "https://arkhedemia-dergisi.vercel.app/yazi/ekonomik-buyumenin-yoksulluk-uzerine-etkisi"
    },
    {
      year: 2025, type: "article",
      title: "Mülkiyet Hakları ile Ekonomik Büyümenin Ampirik İlişkisi",
      venue: { tr: "Arkhedemia Dergisi, Sayı 001, Mart 2025", en: "Arkhedemia Journal, Issue 001, March 2025" },
      href: "https://arkhedemia-dergisi.vercel.app/yazi/mulkiyet-haklari-ile-ekonomik-buyumenin-ampirik-iliskisi"
    },
    {
      year: 2024, type: "thesis",
      title: "Kurumsal Değişimlerin ve Politik Sorunların Yansımaları: Osmanlı Tahvilleri ile Ekonometrik Uygulamalı Tarihsel Değerlendirme (1903–1914)",
      venue: { tr: "Yüksek lisans tezi, Sakarya Üniversitesi, Ağustos 2024", en: "MSc thesis, Sakarya University, August 2024" },
      href: "https://tez.yok.gov.tr/UlusalTezMerkezi/TezGoster?key=usXiZIM9Lp0wk-YzRoaT-zrgAe9BlOk2l7jsGC409JooRd0c7vX7vCJbhmPRO4ME"
    },
    {
      year: 2023, type: "article",
      title: "Sakarya Üniversitesinde Öğrenim Gören Balkan Ülkeleri Uyruklu Öğrencilerin Sosyo-Kültürel ve Ekonomik Durumu",
      venue: { tr: "Sakarya İktisat Dergisi, Cilt 12, Sayı 2, 2023, ss. 253–271", en: "Sakarya Journal of Economics, Vol. 12, No. 2, 2023, pp. 253–271" },
      href: ""
    }
  ],

  /* Çalışan uygulamalar ve açık projeler */
  projects: [
    {
      title: { tr: "Ekonometrik Test Paketi", en: "Econometric Test Suite" },
      desc: { tr: "Durağanlık, nedensellik, eşbütünleşme ve tahmin modellerini, sonuçları otomatik yorumlayarak tek arayüzde sunan web uygulaması.", en: "A web app that runs stationarity, causality, cointegration and forecasting tests in one interface and interprets the results automatically." },
      tags: ["Python", "Streamlit"],
      href: "https://ekonometrik-modeller-k4ubshuq4jd3ketm7ebsqw.streamlit.app/",
      cta: { tr: "Uygulamayı aç", en: "Open the app" }
    },
    {
      title: { tr: "İstatistik Analiz Paketi", en: "Statistics Toolkit" },
      desc: { tr: "Tanımlayıcı istatistik, hipotez testleri, regresyon ve dağılım tanıları için web uygulaması.", en: "A web app for descriptive statistics, hypothesis tests, regression and distribution diagnostics." },
      tags: ["Python", "Streamlit"],
      href: "https://draxywkhqpb6kfs5nhmwgm.streamlit.app/",
      cta: { tr: "Uygulamayı aç", en: "Open the app" }
    },
    {
      title: { tr: "Veri Köprüsü", en: "Veri Köprüsü (Data Bridge)" },
      desc: { tr: "Türkiye geneli ve il bazlı açık kamu verilerini tek panelde birleştiren interaktif gösterge paneli. Afyonkarahisar paneli Bol-Dav ile birlikte hazırlandı.", en: "An interactive dashboard joining national and provincial open public data in one place. The Afyonkarahisar panel was built with the Bol-Dav foundation." },
      tags: ["Power BI"],
      href: "veri-koprusu.html",
      cta: { tr: "Paneli aç", en: "Open the dashboard" }
    }
  ],

  research: [
    {
      code: "TÜBİTAK 1001",
      title: { tr: "Sürdürülebilir Afet Yönetimi Planlamasında İnsani Güvenliğin İnşası: Kahramanmaraş Konteyner Kentleri Örneği", en: "Building Human Security in Sustainable Disaster Management Planning: The Case of Kahramanmaraş Container Cities" },
      meta: { tr: "Bursiyer, Mayıs 2024 – Mayıs 2025, saha araştırması", en: "Scholar, May 2024 – May 2025, field research" }
    },
    {
      code: "TÜBİTAK 3005",
      title: { tr: "Politik Risklerin Türkiye Ekonomisine Yansımaları: Reel ve Finansal Piyasalara Etkileri, 1925–1980", en: "Political Risk and the Turkish Economy: Effects on Real and Financial Markets, 1925–1980" },
      meta: { tr: "Bursiyer, ekonometrik modelleme ve tarihsel veri analizi", en: "Scholar, econometric modelling and historical data analysis" }
    }
  ],

  /* Kurumsal sistemler (Kigılı) — kısa liste */
  corporate: [
    { tr: "Prim ve maliyet simülasyon modeli", en: "Bonus and cost simulation model" },
    { tr: "Çok boyutlu performans değerlendirme sistemi", en: "Multi-dimensional performance scoring" },
    { tr: "Nine-box potansiyel-performans matrisi", en: "Nine-box potential/performance matrix" },
    { tr: "Mağaza segmentasyonu ve performans karnesi", en: "Store segmentation and scorecards" },
    { tr: "İdeal norm ve iş yükü analiz modeli", en: "Ideal headcount and workload model" },
    { tr: "İşten çıkış verisi sınıflandırma sistemi (Python)", en: "Exit-reason classification system (Python)" },
    { tr: "İK ve satış performans panelleri (Power BI, Nebim)", en: "HR and sales dashboards (Power BI, Nebim)" },
    { tr: "Haftalık otomatik yönetim raporu", en: "Automated weekly management report" }
  ],

  community: [
    { years: "2022", logo: "img/logo-vebet.png", role: { tr: "Kurucu başkan yardımcısı", en: "Founding vice-president" }, org: { tr: "Veri Bilimi ve Ekonometri Topluluğu (VEBET), AHBVÜ", en: "Data Science & Econometrics Society (VEBET), AHBVU" }, href: "https://veribilimveekonometri.com" },
    { years: "2019 – 2021", logo: "img/logo-riders.png", role: { tr: "Kurucu başkan", en: "Founding president" }, org: { tr: "AHBVÜ Riders Motosiklet Topluluğu", en: "AHBVU Riders Motorcycle Club" }, href: "" },
    { years: { tr: "Devam ediyor", en: "Ongoing" }, logo: "img/logo-boldav.png", role: { tr: "Gönüllü", en: "Volunteer" }, org: { tr: "Bolvadinliler Dayanışma Vakfı (Bol-Dav)", en: "Bolvadin Solidarity Foundation (Bol-Dav)" }, href: "http://www.boldav.org.tr/" }
  ]
};
