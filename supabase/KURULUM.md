# Supabase kurulumu (yaklaşık 10 dakika)

Yönetim paneli ve ziyaret analizleri için gereken tek seferlik adımlar.

## 1. Proje oluştur

1. https://supabase.com adresinde giriş yapın ve **New project** deyin.
2. Proje adı olarak örneğin `msabridogruyol-site` yazın, bir veritabanı şifresi belirleyin.
3. Bölge olarak **Central EU (Frankfurt)** seçin; Türkiye'ye en yakın bölge budur.
4. Proje hazır olana kadar 1-2 dakika bekleyin.

## 2. Veritabanını kur

1. Sol menüden **SQL Editor** > **New query**.
2. Bu klasördeki `kurulum.sql` dosyasının tamamını yapıştırın ve **Run** deyin.
3. Çıktıda "Success. No rows returned" görmelisiniz.

> **Güncelleme:** `kurulum.sql` dosyasının yeni bir sürümünü aldığınızda aynı şekilde tamamını yeniden çalıştırın. Dosya tekrar çalıştırılmaya uygundur; mevcut ziyaret kayıtları ve içerik silinmez.

## 3. Yönetici hesabını oluştur

1. **Authentication** > **Users** > **Add user** > **Create new user**.
2. E-posta ve güçlü bir şifre girin, **Auto Confirm User** kutusunu işaretleyin.
3. Tekrar **SQL Editor**'e gidin ve e-postayı kendi adresinizle değiştirerek şunu çalıştırın:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'SIZIN-EPOSTANIZ@ornek.com'
on conflict do nothing;
```

4. Önerilir: **Authentication** > **Sign In / Providers** altında **Allow new users to sign up** seçeneğini kapatın. Veriler zaten yalnızca `admins` tablosundaki hesaba açık, ama başkalarının hesap açamaması daha temizdir.

## 4. Siteye bağla

1. **Project Settings** > **API Keys** (ya da **Data API**) sayfasından iki değeri alın:
   - **Project URL** (ör. `https://abcdxyz.supabase.co`)
   - **Publishable key** (`sb_publishable_...`) ya da eski tip **anon public** anahtarı
2. `assets/config.js` dosyasına yazın:

```js
window.SUPABASE = {
  url: "https://abcdxyz.supabase.co",
  key: "sb_publishable_..."
};
```

Bu anahtar herkese açık olacak şekilde tasarlanmıştır; güvenliği veritabanındaki kurallar sağlar. **service_role** ya da **secret** anahtarını asla bu dosyaya yazmayın.

## 5. Kullanmaya başla

1. Siteyi GitHub'a yükleyin.
2. Sitenin altındaki **Yönetici** bağlantısından giriş yapın.
3. **İçerik** sekmesinde ilk değişikliğinizi yapıp **Yayınla** dediğinizde içerik Supabase'e taşınır. O zamana kadar site `data.js` içeriğini gösterir.

## Bilmeniz gerekenler

- **Yedek:** Supabase'e ulaşılamazsa site `data.js` içeriğiyle açılır. Panelde **data.js indir** butonuyla güncel içeriği indirip arada bir GitHub'daki dosyanın yerine koymanız iyi olur.
- **Saklama süresi:** Gizlilik metni kayıtların en fazla 12 ay saklandığını söylüyor. Panelin Analiz sekmesinin altındaki **12 aydan eski kayıtları sil** butonunu ayda bir kullanın.
- **Ücretsiz plan:** Supabase ücretsiz planda uzun süre hiç kullanılmayan projeleri duraklatabilir. Duraklatılırsa Supabase panelinden tek tıkla yeniden başlatılır; bu sürede site `data.js` ile çalışmaya devam eder.
- **Botlar:** Otomatik tarayıcılar (`navigator.webdriver`) istatistiğe dahil edilmez.
