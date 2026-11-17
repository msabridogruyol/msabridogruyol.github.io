/* Supabase bağlantısı
   Supabase panelinde: Project Settings > API (ya da Data API)
   - url: Project URL
   - key: anon / publishable key (herkese açık anahtardır; veriler RLS kurallarıyla korunur)
   Bu iki alan boş kalırsa site normal çalışır, yalnızca analiz ve panel devre dışı kalır. */
window.SUPABASE = {
  url: "",
  key: ""
};
