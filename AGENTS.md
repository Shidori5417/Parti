# AGENTS.md

Bu dosya, projede AI agent/ekip görevlerini düzenlemek için hazırlanmıştır.

## Genel Proje Kuralı

Her agent şu kararlara uymalıdır:

- Proje Next.js + TypeScript ile geliştirilecek.
- Database/Auth/Storage Supabase olacak.
- Deployment Vercel olacak.
- Roller: `user`, `admin`, `scanner`.
- QR token güvenli ve tahmin edilemez olacak.
- RLS tüm kritik tablolarda açık olacak.
- Service role key asla client tarafında kullanılmayacak.
- Scanner işlemleri backend/Supabase function ile doğrulanacak.
- Çok kişilik biletlerde kalan giriş hakkı doğru hesaplanacak.

## 1. Product Architect Agent

Görevleri:

- Ürün kapsamını net tutar.
- MVP dışı özellikleri ayırır.
- User flow'ları günceller.
- Edge case'leri belirler.
- Parti günü gerçek kullanım senaryolarını düşünür.

Kontrol listesi:

- Normal kullanıcı akışı tamam mı?
- Admin akışı tamam mı?
- Scanner akışı tamam mı?
- Çok kişilik bilet senaryosu doğru mu?
- İptal edilmiş/kullanılmış bilet akışı var mı?

## 2. UI/UX Design Agent

Görevleri:

- Modern ve mobil uyumlu arayüz oluşturur.
- Dark theme ve parti atmosferine uygun tasarım yapar.
- Admin panelini sade ve hızlı kullanılabilir tutar.
- Scanner ekranını kapı kullanımına uygun yapar.

Kontrol listesi:

- Mobil görünüm iyi mi?
- Scanner butonları büyük mü?
- QR sonucu net görünüyor mu?
- Hata/başarı mesajları anlaşılır mı?
- PDF bilet okunabilir mi?

## 3. Frontend Agent

Görevleri:

- Next.js App Router sayfalarını oluşturur.
- UI component'lerini yazar.
- Formları React Hook Form + Zod ile yapar.
- Supabase client işlemlerini bağlar.
- Loading, empty ve error state'leri ekler.

Kontrol listesi:

- TypeScript hatasız mı?
- Form validasyonları çalışıyor mu?
- Yetkisiz kullanıcılar admin/scanner sayfalarına giremiyor mu?
- Kullanıcı kendi biletini görebiliyor mu?
- Responsive tasarım düzgün mü?

## 4. Supabase / Backend Agent

Görevleri:

- Veritabanı tablolarını oluşturur.
- RLS policy'lerini yazar.
- SQL function/RPC'leri oluşturur.
- Trigger ve index'leri ekler.
- Auth callback/profil oluşturma sürecini kurar.

Kontrol listesi:

- RLS açık mı?
- Kullanıcı sadece kendi verisini görüyor mu?
- Admin tüm gerekli verileri görebiliyor mu?
- Scanner sadece scan işlemi yapabiliyor mu?
- `scan_ticket` atomic mi?
- Aynı QR aynı anda iki kez okutulunca çifte giriş engelleniyor mu?

## 5. QR/PDF Agent

Görevleri:

- QR token üretimini yapar.
- QR görselini üretir.
- PDF bilet template'ini tasarlar.
- PDF indirme endpoint'ini oluşturur.

Kontrol listesi:

- QR kod tahmin edilemez mi?
- QR içinde kişisel bilgi yok mu?
- PDF mobilde ve yazıcıda okunabilir mi?
- PDF'deki QR scanner tarafından okunuyor mu?
- Çok kişilik bilgi PDF'de görünüyor mu?

## 6. Security Agent

Görevleri:

- Auth ve role kontrollerini inceler.
- RLS açıklarını test eder.
- Service role kullanımını kontrol eder.
- QR token güvenliğini inceler.
- Rate-limit ve audit log önerir.

Kontrol listesi:

- Client tarafında admin yetkisi taklit edilemiyor mu?
- API route'larda session kontrolü var mı?
- Service key sızma riski var mı?
- Scanner endpoint spamlenebilir mi?
- Kullanıcı başka kullanıcının biletini görebiliyor mu?

## 7. QA/Test Agent

Görevleri:

- Manuel test senaryoları yazar.
- Playwright e2e testlerini hazırlar.
- Edge case'leri test eder.
- Mobil cihaz testleri yapar.

Test senaryoları:

- E-posta ile kayıt
- Google ile giriş
- Admin parti oluşturma
- Kullanıcıya bilet tanımlama
- Kullanıcı bilet PDF indirme
- Scanner QR okutma
- Aynı QR tekrar okutma
- Çok kişilik bilet kısmi kullanım
- İptal edilmiş bilet okutma
- Yetkisiz admin sayfasına erişim

## 8. Deploy/DevOps Agent

Görevleri:

- Vercel deploy ayarlarını yapar.
- Environment variable'ları kontrol eder.
- Supabase migration sürecini düzenler.
- Production checklist hazırlar.

Kontrol listesi:

- Env değişkenleri doğru mu?
- Production Supabase URL/key doğru mu?
- Service role sadece server'da mı?
- Vercel build başarılı mı?
- Domain bağlandı mı?
- Auth redirect URL'leri doğru mu?
