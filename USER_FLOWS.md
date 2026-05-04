# USER_FLOWS.md

## Güncel Akış Kararları

- Google ile giriş bu sürümde kapalıdır; kullanıcılar e-posta/şifre ile kayıt olur ve giriş yapar.
- Doğum yılı kayıt ve profil ekranlarında tam 4 hanelidir.
- Admin girişten sonra `/admin`, scanner girişten sonra `/scanner`, normal kullanıcı girişten sonra `/dashboard` sayfasına gider.
- Girişsiz protected linke tıklayan kullanıcı `/login?next=...` sayfasına alınır ve girişten sonra hedef sayfaya döner.
- Admin menüsü yalnız admin işleri, scanner menüsü yalnız scanner işi gösterir.

## 1. Normal Kullanıcı Kayıt Akışı

1. Kullanıcı siteye girer.
2. “Kayıt Ol” butonuna basar.
3. Şu bilgileri girer:
   - İsim
   - Soyisim
   - Doğum yılı
   - E-posta
   - Şifre
4. Sistem doğrulama e-postası gönderir.
5. Kullanıcı e-postadaki linke tıklar.
6. Hesap doğrulanır.
7. Kullanıcı dashboard'a yönlendirilir.

Başarı durumu:

- Profil oluşturulur.
- Rol `user` olur.
- Kullanıcı yayındaki partileri görebilir.

Hata durumları:

- E-posta zaten kayıtlı
- Şifre zayıf
- Doğum yılı geçersiz
- E-posta doğrulanmamış

## 2. Google ile Giriş Akışı (Kapalı)

Bu sürümde Google ile giriş kapalıdır. Kullanıcı e-posta/şifre ile giriş yapar.
Google tekrar açılırsa ayrı bir OAuth kurulum fazında profil tamamlama akışıyla birlikte ele alınacaktır.

## 3. Kullanıcının Parti Görme Akışı

1. Kullanıcı anasayfaya girer.
2. Sistem `published` partileri listeler.
3. Kullanıcı parti kartına tıklar.
4. Parti detay sayfası açılır.
5. Parti bilgileri görüntülenir:
   - Tarih/saat
   - Yer
   - Fiyat
   - Açıklama
   - Önemli notlar
   - Görseller

Eğer kullanıcıya o parti için bilet tanımlıysa:

- “Biletimi Görüntüle” butonu görünür.

Eğer bilet tanımlı değilse:

- “Bu parti için biletiniz bulunmuyor” mesajı görünür.

## 4. Admin Parti Oluşturma Akışı

1. Admin `/admin` paneline girer.
2. “Yeni Parti Oluştur” butonuna basar.
3. Formu doldurur:
   - Parti adı
   - Açıklama
   - Önemli notlar
   - Başlangıç tarihi/saat
   - Bitiş tarihi/saat
   - Yer
   - Adres
   - Fiyat
   - Görseller
   - Durum
4. Kaydet butonuna basar.
5. Sistem partiyi oluşturur.
6. Eğer durum `published` ise parti anasayfada görünür.

Hata durumları:

- Tarih geçmişte
- Başlık boş
- Fiyat geçersiz
- Görsel yükleme başarısız
- Admin yetkisi yok

## 5. Admin Bilet Tanımlama Akışı

1. Admin `/admin/tickets/assign` sayfasına girer.
2. Parti seçer.
3. Kullanıcı arar/seçer.
4. Bilet kişi sayısını girer.
5. Not ekleyebilir.
6. “Bilet Tanımla” butonuna basar.
7. Sistem benzersiz QR token üretir.
8. Bilet `active` durumuyla oluşturulur.
9. Kullanıcı panelinde bilet görünür.

Başarı durumu:

- Bilet oluşturulur.
- `max_entries` belirlenir.
- `used_entries = 0` olur.
- QR token benzersiz olur.

Hata durumları:

- Kullanıcı bulunamadı
- Parti bulunamadı
- Kişi sayısı 1'den küçük
- Aynı parti için aynı kullanıcıya tekrar bilet verme kuralı engelledi
- Admin yetkisi yok

## 6. Kullanıcının Bilet Görüntüleme Akışı

1. Kullanıcı dashboard'a girer.
2. “Biletlerim” sayfasını açar.
3. Aktif biletlerini görür.
4. Bir bilete tıklar.
5. Bilet detayında QR kodu görür.
6. “PDF İndir” butonuna basabilir.

Bilet detayında gösterilecek bilgiler:

- Parti adı
- Parti tarihi/saat
- Parti yeri
- İsim soyisim
- Bilet kişi sayısı
- Kullanılan giriş hakkı
- Kalan giriş hakkı
- QR kod
- Bilet durumu

## 7. Scanner QR Okutma Akışı

1. Scanner hesabı `/scanner` sayfasına girer.
2. Kamera izni verir.
3. QR kod okutulur.
4. Sistem token'ı backend'e gönderir.
5. Backend bileti doğrular.
6. Scanner ekranında sonuç görünür.

Geçerli biletse:

- Kullanıcı adı
- Parti adı
- Bilet kişi sayısı
- Kalan giriş hakkı
- Giriş için kişi sayısı seçimi
- “Girişi Onayla” butonu

Scanner kişi sayısını seçip onaylar.

Sistem:

- `used_entries` değerini artırır.
- `ticket_scans` kaydı oluşturur.
- Kalan hakkı günceller.
- Giriş onaylandı mesajı döndürür.

## 8. Çok Kişilik Bilet Akışı

Örnek:

- Bilet 4 kişilik.
- İlk okutma: 2 kişi alındı.
- `used_entries = 2`
- `remaining_entries = 2`

İkinci okutma:

- 2 kişi daha alınabilir.
- 3 kişi alınmaya çalışılırsa sistem reddeder.

Kural:

```txt
used_entries + requested_entries <= max_entries
```

## 9. Kullanılmış Bilet Akışı

1. QR okutulur.
2. Backend bileti bulur.
3. `used_entries >= max_entries` ise işlem reddedilir.
4. Scanner ekranında “Bu bilet tamamen kullanılmış” mesajı çıkar.
5. Yeni scan log `rejected` olarak kaydedilebilir.

## 10. İptal Edilmiş Bilet Akışı

1. Admin bileti iptal eder.
2. Ticket status `revoked` olur.
3. Kullanıcı biletini görür ama “iptal edildi” bilgisi çıkar.
4. Scanner QR okutursa sistem reddeder.

## 11. Admin Giriş Kontrol Akışı

1. Admin parti detay raporuna girer.
2. Şunları görür:
   - Toplam bilet
   - Toplam giriş hakkı
   - Kullanılan giriş hakkı
   - Kalan giriş hakkı
   - Son okutmalar
   - Giriş yapan kullanıcılar
   - Giriş yapmayan kullanıcılar
3. Gerekirse bilet iptal eder veya yeni bilet tanımlar.
