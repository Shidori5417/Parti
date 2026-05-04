# MVP.md

## MVP Hedefi

İlk sürümün amacı, partiyi gerçek hayatta yönetebilecek kadar çalışan, güvenli ve kullanılabilir bir sistem çıkarmaktır.

MVP sonunda şunlar yapılabiliyor olmalı:

1. Kullanıcı kayıt/giriş yapabilmeli.
2. E-posta doğrulaması çalışmalı.
3. Google ile giriş çalışmalı.
4. Admin parti oluşturabilmeli.
5. Kullanıcı yayındaki partileri görebilmeli.
6. Admin kullanıcıya bilet tanımlayabilmeli.
7. Bilet tek veya çok kişilik olabilmeli.
8. Kullanıcı biletini QR ile görüntüleyebilmeli.
9. Kullanıcı biletini PDF olarak indirebilmeli.
10. Scanner hesabı QR okutabilmeli.
11. QR okutulunca giriş hakkı düşmeli.
12. Aynı bilet hakkından fazla kullanılamamalı.
13. Admin giriş kayıtlarını görebilmeli.

## MVP Kapsamı

### Auth

- E-posta/şifre kayıt
- E-posta doğrulama
- Google ile giriş
- Çıkış yapma
- Protected routes
- Role-based redirect

### Profil

- İsim
- Soyisim
- Doğum yılı
- E-posta
- Rol

### Parti Yönetimi

Admin:

- Parti oluşturma
- Parti düzenleme
- Parti yayınlama/taslak yapma
- Parti iptal etme
- Görsel ekleme
- Açıklama/önemli not ekleme

Kullanıcı:

- Yayındaki partileri görme
- Parti detayına gitme

### Bilet Yönetimi

Admin:

- Kullanıcı seçme
- Parti seçme
- Bilet kişi sayısı belirleme
- Bilet tanımlama
- Bileti iptal etme
- Bilet durumunu görme

Kullanıcı:

- Biletlerini görme
- Bilet detayına gitme
- QR görüntüleme
- PDF indirme

### Scanner

- Kamera ile QR okuma
- QR token doğrulama
- Giriş sayısı seçme
- Giriş onaylama
- Sonuç gösterme

### Admin Raporları

MVP'de basit raporlar yeterli:

- Toplam bilet
- Kullanılan giriş sayısı
- Kalan giriş sayısı
- İptal edilmiş biletler
- Son okutmalar

## MVP Dışı Bırakılacaklar

İlk sürümde yapılmayacaklar:

- Online ödeme sistemi
- Otomatik fatura
- SMS gönderimi
- WhatsApp entegrasyonu
- Çoklu organizasyon/şirket desteği
- Koltuk/masa seçimi
- Bilet transferi
- Gelişmiş kampanya/indirim kodu
- Mobil uygulama
- Offline scanner modu

## MVP Kabul Kriterleri

### Kullanıcı Kayıt

- Kullanıcı kayıt olduğunda `profiles` tablosunda profil oluşmalı.
- E-posta doğrulaması yapılmadan kritik işlemler kısıtlanmalı.
- Google ile giriş yapan kullanıcı için de profil oluşturulmalı.

### Parti

- Admin parti oluşturduğunda `draft` veya `published` seçebilmeli.
- `published` partiler anasayfada görünmeli.
- `draft` partileri normal kullanıcı görmemeli.

### Bilet

- Admin bir kullanıcıya bilet tanımladığında kullanıcı panelinde görünmeli.
- Bilette kişi sayısı görünmeli.
- Bilet QR kodu benzersiz olmalı.
- Bilet PDF olarak indirilebilmeli.

### QR Okutma

- Scanner hesabı QR okutabilmeli.
- Normal kullanıcı scanner ekranına erişememeli.
- Bilet aktifse giriş onaylanmalı.
- Bilet tamamen kullanılmışsa tekrar giriş engellenmeli.
- Çok kişilik bilette kalan hak doğru hesaplanmalı.
- Her okutma `ticket_scans` tablosuna yazılmalı.

## MVP Başarı Ölçütü

Gerçek parti günü şu akış sorunsuz çalışıyorsa MVP başarılıdır:

1. Admin parti oluşturur.
2. Admin gelen kişilere bilet tanımlar.
3. Kullanıcı biletini telefondan veya PDF olarak gösterir.
4. Scanner QR okutur.
5. Sistem doğru şekilde “giriş onaylandı” veya “geçersiz” der.
6. Aynı bilet hakkından fazla kullanılamaz.
