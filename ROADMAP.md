# ROADMAP.md

## Güncel Durum Notu

- Google OAuth bu fazda kapalıdır ve gelecek özellik olarak değerlendirilecektir.
- Rol bazlı ana ekran ve menü ayrımı production davranışıdır.
- Doğum yılı validasyonu frontend, Zod ve database constraint katmanlarında 4 hane olarak uygulanır.
- Auth/session yönlendirmesi `next` parametresiyle protected sayfalara geri dönüşü destekler.

## Faz 0 — Proje Kurulumu

Hedef: Temel iskeleti kurmak.

Yapılacaklar:

- Next.js + TypeScript projesi oluştur
- Tailwind CSS kur
- shadcn/ui kur
- Supabase projesi oluştur
- Supabase URL/key env değişkenlerini ekle
- Vercel projesi oluştur
- GitHub repo bağla
- Temel layout ve tema kur
- ESLint/Prettier ayarla

Teslim:

- Boş ama deploy edilebilir proje
- Vercel preview çalışıyor
- Supabase bağlantısı test edildi

## Faz 1 — Auth ve Profil

Hedef: Kullanıcı sistemi.

Yapılacaklar:

- Supabase Auth ayarla
- Email/password kayıt
- Email confirmation
- Google OAuth kapalı kararını koru; ileride gerekirse ayrı fazda aç.
- Auth callback route
- `profiles` tablosu
- Kayıt sonrası profil oluşturma
- Kullanıcı rol sistemi
- Admin/scanner route guard

Teslim:

- Kullanıcı kayıt/giriş yapabiliyor
- Profil oluşuyor
- Roller çalışıyor

## Faz 2 — UI Temeli ve Public Sayfalar

Hedef: Modern parti sitesi görünümü.

Yapılacaklar:

- Landing page
- Parti kartları
- Parti detay sayfası
- Auth sayfaları
- Dashboard layout
- Responsive navbar
- Dark theme
- Loading/empty/error state tasarımları

Teslim:

- Kullanıcı deneyimi temel olarak hazır
- Yayındaki partiler listelenebiliyor

## Faz 3 — Admin Parti Yönetimi

Hedef: Admin parti oluşturabilsin.

Yapılacaklar:

- `parties` tablosu
- `party_images` tablosu
- Admin parti listeleme
- Parti oluşturma formu
- Parti düzenleme formu
- Görsel yükleme
- Taslak/yayında/iptal durumu
- RLS policies

Teslim:

- Admin panelinden parti yönetimi yapılabiliyor

## Faz 4 — Bilet Sistemi

Hedef: Admin kullanıcıya bilet tanımlayabilsin.

Yapılacaklar:

- `tickets` tablosu
- Bilet kişi sayısı
- QR token üretimi
- Kullanıcıya bilet tanımlama
- Kullanıcı bilet listeleme
- Bilet detay sayfası
- Bilet iptal etme
- RLS policies

Teslim:

- Kullanıcı hesabında biletini görebiliyor

## Faz 5 — QR ve PDF

Hedef: Bilet gerçek hayatta kullanılabilir hale gelsin.

Yapılacaklar:

- QR kod üretimi
- Bilet PDF template
- PDF download endpoint
- PDF üzerinde:
  - Parti adı
  - İsim soyisim
  - Tarih/saat
  - Yer
  - Kişi sayısı
  - QR kod
  - Önemli notlar
- Mobilde bilet görüntüleme

Teslim:

- Kullanıcı QR/PDF bilet indirebiliyor

## Faz 6 — Scanner / Kapı Girişi

Hedef: QR okutma ve giriş onaylama.

Yapılacaklar:

- Scanner role guard
- Kamera ile QR okuma
- Manuel token girişi
- `ticket_scans` tablosu
- `scan_ticket` SQL function
- Atomic giriş hakkı düşme
- Scanner sonuç ekranı
- Başarılı/başarısız ses/titreşim opsiyonları

Teslim:

- Kapıda QR okutularak giriş yapılabiliyor
- Bilet hakkından fazla kullanım engelleniyor

## Faz 7 — Admin Raporlama

Hedef: Parti günü kontrol paneli.

Yapılacaklar:

- Parti bazlı bilet listesi
- Giriş yapanlar
- Giriş yapmayanlar
- Kullanılan/kalan giriş hakkı
- Son okutmalar
- CSV export opsiyonu

Teslim:

- Admin parti durumunu takip edebiliyor

## Faz 8 — Production Hazırlığı

Hedef: Gerçek kullanıma hazır hale getirmek.

Yapılacaklar:

- RLS testleri
- Rate-limit
- Error logging
- Vercel env kontrolü
- Supabase backup ayarları
- Custom SMTP ayarı
- Domain bağlama
- SEO metadata
- Mobil test
- Kamera izin testleri
- Gerçek cihazlarla QR testleri

Teslim:

- Production deploy
- Gerçek parti için kullanılabilir sistem

## Gelecek Özellikler

- Online ödeme
- Otomatik ödeme sonrası bilet oluşturma
- Mail ile PDF bilet gönderme
- WhatsApp/SMS bildirimleri
- Bilet transferi
- Kampanya kodu
- Davet linki
- Organizatör paneli
- Birden fazla scanner cihazı yönetimi
- Offline scanner cache
- Sahte QR risk analizi
- Kapıdaki yoğunluk analitiği
