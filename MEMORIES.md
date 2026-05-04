# MEMORIES.md

Bu dosya, proje boyunca unutulmaması gereken sabit kararları ve bağlamı tutar.

## Sabit Kararlar

- Proje gerçek hayatta yapılacak parti/etkinlikler için kullanılacak.
- Sistem rezervasyon/liste mantığıyla çalışacak.
- Kullanıcılar siteye Google ile veya e-posta/şifre ile giriş yapabilecek.
- Kullanıcı kayıt alanları:
  - İsim
  - Soyisim
  - Doğum yılı
  - E-posta
- E-posta/şifre ile kayıt olan kullanıcılara doğrulama e-postası gönderilecek.
- Deployment Vercel ile yapılacak.
- Database ve auth Supabase ile yapılacak.
- Admin hesabı olacak.
- Okuyucu/scanner hesabı olacak.
- Normal kullanıcı hesabı olacak.
- Admin parti oluşturabilecek.
- Admin partiye saat, yer, fiyat, açıklama, önemli notlar ve görseller ekleyebilecek.
- Yayındaki partiler normal kullanıcıların anasayfasında görünecek.
- Admin kullanıcılara bilet tanımlayacak.
- Bilette isim soyisim ve QR kod olacak.
- Kullanıcı bileti PDF/dosya olarak indirebilecek.
- Bilet tek kişilik veya birkaç kişilik olabilir.
- Kaç kişilik olduğu bilette görünecek.
- QR okutulunca biletin giriş hakkı düşecek.
- Bir bilet yalnızca tanımlı kişi sayısı kadar kullanılabilecek.
- Aynı QR ile hakkından fazla kişi alınamayacak.

## Güvenlik Hafızası

- QR kod içine kişisel bilgi yazılmayacak.
- QR kod sadece gizli/tahmin edilemez token taşıyacak.
- Scanner işlemi sadece yetkili scanner/admin hesabı ile yapılacak.
- Kullanıcı kendi bileti dışında bilet göremeyecek.
- Admin rolü client tarafında değil, server/RLS tarafında kontrol edilecek.
- Service role key sadece server ortamında kullanılacak.
- Supabase RLS tüm kritik tablolarda açık olacak.
- Bilet okutma atomic SQL function ile yapılacak.

## MVP Öncelikleri

Önce yapılacaklar:

1. Auth
2. Profil oluşturma
3. Rol sistemi
4. Parti oluşturma/listeleme
5. Bilet tanımlama
6. Kullanıcı bilet görüntüleme
7. QR üretme
8. Scanner ile QR okutma
9. PDF indirme
10. Vercel deploy

Sonra yapılacaklar:

- Online ödeme
- Mail ile bilet gönderme
- Gelişmiş analitik
- Çoklu parti organizatörü
- Kapıdaki scanner cihazları için gelişmiş offline mod
- SMS/WhatsApp bilgilendirme

## Ürün Dili

Site dili ilk aşamada Türkçe olacak.

Kullanılacak bazı UI metinleri:

- “Biletlerim”
- “Partiler”
- “Giriş Yap”
- “Kayıt Ol”
- “Biletini İndir”
- “QR Okut”
- “Giriş Onaylandı”
- “Bilet Kullanılmış”
- “Giriş Hakkı Yetersiz”
- “Bu bilet iptal edilmiş”
- “Bu parti için geçerli değil”

## Kodlama Hafızası

- TypeScript strict mod kullanılmalı.
- Her form için Zod schema yazılmalı.
- Admin/scanner guard server-side çalışmalı.
- Supabase client ve server client ayrı dosyalarda tutulmalı.
- RLS testleri yapılmadan production deploy edilmemeli.
- QR scan endpoint'i rate-limit edilebilecek şekilde tasarlanmalı.
