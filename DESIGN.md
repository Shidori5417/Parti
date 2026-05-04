# DESIGN.md

## Ürün Tanımı

Bu site, gerçek hayatta düzenlenen partiler için dijital liste ve QR bilet sistemi sağlar.

Sistemde üç ana rol vardır:

1. **Normal Kullanıcı**
   - Siteye kayıt olur/giriş yapar.
   - Yayındaki partileri görür.
   - Kendisine tanımlanmış biletleri görüntüler.
   - Biletini QR/PDF olarak indirir.

2. **Admin**
   - Parti oluşturur/düzenler.
   - Parti bilgilerini, fiyatı, tarihi, yeri, açıklamayı, önemli notları ve görselleri yönetir.
   - Kullanıcılara bilet tanımlar.
   - Biletin kaç kişilik olduğunu belirler.
   - Giriş kayıtlarını ve bilet durumlarını görür.

3. **Okuyucu / Scanner**
   - Kapıda QR okutur.
   - Biletin geçerli olup olmadığını görür.
   - Kaç kişilik giriş hakkı kaldığını görür.
   - Giriş yapılacak kişi sayısını onaylar.
   - Bilet hakkını düşürür.

## Tasarım Tarzı

Modern, premium, gece etkinliği/parti hissi veren bir tasarım önerilir.

Önerilen UI dili:

- Koyu tema varsayılan
- Büyük hero alanları
- Neon/gradient vurgular
- Glassmorphism kartlar
- Büyük parti görselleri
- Net CTA butonları
- Mobil öncelikli tasarım
- QR/PDF bilet alanında temiz ve okunabilir tasarım

## Sayfa Yapısı

### Public / Kullanıcı Sayfaları

#### `/`

Anasayfa.

İçerik:

- Hero alanı
- Yayındaki partiler
- Yaklaşan etkinlik kartları
- Giriş/kayıt butonları
- Kullanıcı giriş yaptıysa “Biletlerim” butonu

#### `/parties/[slug]`

Parti detay sayfası.

İçerik:

- Parti başlığı
- Tarih ve saat
- Yer/adres
- Fiyat
- Açıklama
- Önemli notlar
- Görseller
- Kullanıcının bileti varsa “Biletimi Görüntüle”
- Bileti yoksa “Listeye alınmak için admin ile iletişime geç” tarzı bilgi

#### `/login`

Giriş ekranı.

Özellikler:

- Google ile giriş
- E-posta/şifre ile giriş
- Şifremi unuttum
- Kayıt ekranına yönlendirme

#### `/register`

Kayıt ekranı.

Alanlar:

- İsim
- Soyisim
- Doğum yılı
- E-posta
- Şifre

Kayıt sonrası:

- E-posta doğrulaması gönderilir.
- Kullanıcı doğrulama yapmadan aktif işlem yapamaz.

#### `/dashboard`

Kullanıcı paneli.

İçerik:

- Profil özeti
- Yaklaşan partiler
- Kullanıcıya tanımlı biletler
- Kullanılmış/geçerli bilet durumları

#### `/dashboard/tickets`

Biletlerim sayfası.

İçerik:

- Aktif biletler
- Kullanılmış biletler
- İptal edilmiş biletler
- PDF indir butonu

#### `/dashboard/tickets/[ticketId]`

Bilet detay sayfası.

İçerik:

- Parti bilgisi
- İsim soyisim
- QR kod
- Kaç kişilik bilet
- Kullanılan giriş sayısı
- Kalan giriş sayısı
- PDF indir

### Admin Sayfaları

#### `/admin`

Admin dashboard.

Kartlar:

- Toplam kullanıcı
- Toplam parti
- Toplam bilet
- Bugünkü giriş sayısı
- Yaklaşan partiler

#### `/admin/parties`

Parti yönetimi.

Özellikler:

- Parti listeleme
- Taslak/yayında/iptal filtreleri
- Parti düzenleme
- Parti silme/iptal etme

#### `/admin/parties/new`

Parti oluşturma.

Alanlar:

- Parti adı
- Slug
- Açıklama
- Önemli notlar
- Başlangıç tarihi/saat
- Bitiş tarihi/saat
- Konum adı
- Adres
- Fiyat
- Para birimi
- Kapak görseli
- Ek görseller
- Durum: taslak/yayında

#### `/admin/users`

Kullanıcı yönetimi.

Özellikler:

- Kullanıcı arama
- İsim/e-posta filtreleme
- Kullanıcı rolünü görme
- Kullanıcıya bilet tanımlama

#### `/admin/tickets/assign`

Bilet tanımlama.

Alanlar:

- Parti seçimi
- Kullanıcı seçimi
- Kaç kişilik bilet
- Not
- Bilet durumu

İşlem sonrası:

- Kullanıcının hesabına bilet düşer.
- Kullanıcı biletini görüntüleyebilir.
- QR otomatik oluşur.

### Scanner Sayfaları

#### `/scanner`

Kapı okutma ekranı.

Özellikler:

- Kamera ile QR okuma
- Manuel QR/token girişi
- Okutulan bilet sonucunu gösterme
- Kişi sayısı seçme
- Giriş onaylama
- Hata mesajları

Olası sonuçlar:

- Geçerli bilet
- Bilet zaten tamamen kullanılmış
- Bilet iptal edilmiş
- Yanlış parti bileti
- QR geçersiz
- Kullanıcının e-posta doğrulaması yapılmamış
- Giriş hakkı yetersiz

## Bilet Tasarımı

PDF bilet içeriği:

- Parti adı
- Parti tarihi/saat
- Parti yeri
- İsim soyisim
- Bilet kişi sayısı
- QR kod
- Önemli notlar
- “Bu QR kod yalnızca belirtilen kişi sayısı kadar giriş için geçerlidir.”
- Bilet ID / kısa kod

## QR Güvenlik Tasarımı

QR kod içinde şu bilgiler olmamalı:

- Kullanıcının e-posta adresi
- Kullanıcının doğum yılı
- Admin bilgisi
- Açık veritabanı ID zinciri
- Tahmin edilebilir sıra numarası

QR kod içinde önerilen yapı:

```txt
https://site-adresi.com/scan?token=RANDOM_SECURE_TOKEN
```

veya:

```txt
PARTY_TICKET:RANDOM_SECURE_TOKEN
```

Scanner uygulaması token'ı backend'e gönderir.

Backend:

1. Scanner hesabının yetkisini kontrol eder.
2. Token ile bileti bulur.
3. Bilet aktif mi kontrol eder.
4. Parti doğru mu kontrol eder.
5. Kalan giriş hakkı var mı kontrol eder.
6. İstenen giriş sayısı kalan hakkı aşmıyor mu kontrol eder.
7. `used_entries` değerini artırır.
8. `ticket_scans` tablosuna kayıt atar.
9. Sonucu scanner ekranına döndürür.

## Durumlar

### Parti Durumu

- `draft` — sadece admin görür
- `published` — kullanıcılar görür
- `cancelled` — kullanıcıya iptal bilgisi gösterilebilir

### Bilet Durumu

- `active` — kullanılabilir
- `used` — tüm hakkı kullanılmış
- `revoked` — admin tarafından iptal edilmiş

## Mobil Tasarım Önceliği

Bu proje kapıda telefonla kullanılacağı için scanner paneli özellikle mobilde çok iyi çalışmalıdır.

Scanner ekranında:

- Büyük kamera alanı
- Büyük sonuç kartı
- Büyük “Girişi Onayla” butonu
- Karanlık ortamda okunabilir tasarım
- Hatalarda titreşim/ses opsiyonu
