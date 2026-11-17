# msabridogruyol.com

Kişisel web sitesi (GitHub Pages) + Supabase ile yönetim paneli ve ziyaret analizleri.

## Günlük kullanım

Sitenin en altındaki **Yönetici** bağlantısından giriş yapın.

- **Analiz:** Ziyaretlerin tarihi ve saati, şehri, cihazı, geldiği kaynak, tıklamalar ve bölümlerde geçirilen süre. Bir satıra tıklayınca o ziyaretin dakika dakika akışı açılır.
- **İçerik:** Yayın ekleme, düzenleme, sıralama ve silme; deneyim, projeler, bağlantılar ve diğer bölümler. **Yayınla** dediğiniz anda sitede görünür.

## Kurulum

Tek seferlik Supabase kurulumu için `supabase/KURULUM.md` dosyasına bakın.

## Dosyalar

- `index.html`: ana sayfa
- `admin.html`: yönetim paneli (arama motorlarına kapalı)
- `gizlilik.html`: KVKK aydınlatma metni ve rıza tercihi
- `veri-koprusu.html`: Power BI paneli
- `data.js`: içeriğin yedeği; Supabase'e ulaşılamazsa kullanılır
- `assets/config.js`: Supabase adresi ve herkese açık anahtar
- `assets/site.js`, `assets/site.css`: site
- `assets/tracker.js`: rıza bandı ve ziyaret istatistikleri
- `assets/admin.js`, `assets/admin.css`: yönetim paneli
- `supabase/kurulum.sql`: veritabanı tabloları ve güvenlik kuralları
- `img/`: görseller
