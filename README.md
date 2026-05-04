# Parti Liste / Bilet QR Sistemi — Proje Dokümantasyonu

Bu klasör, gerçek hayattaki bir parti/etkinlik için kullanıcı listesi, bilet tanımlama, QR bilet indirme ve girişte QR okutma sisteminin proje dokümantasyonunu içerir.

## Dosyalar

- `AGENTS.md` — Projede çalışacak AI/insan agent rolleri ve görev sınırları
- `DESIGN.md` — Ürün tasarımı, sayfalar, roller, güvenlik kararları ve UI yapısı
- `MEMORIES.md` — Proje kararları, değişmeyen kabuller ve geliştirme notları
- `MVP.md` — İlk yayınlanabilir sürüm kapsamı
- `ROADMAP.md` — Geliştirme aşamaları ve gelecek özellikler
- `SCHEMA.md` — Supabase/PostgreSQL veri modeli, RLS ve örnek SQL
- `TECHSTACK.md` — Önerilen teknoloji yığını
- `USER_FLOWS.md` — Kullanıcı, admin ve okuyucu/scanner akışları

## Proje Özeti

Site, gerçek hayatta yapılacak partiler için dijital liste ve bilet sistemi olarak çalışır.

Temel fikir:

1. Kullanıcı siteye Google ile veya e-posta/şifre ile kayıt olur.
2. E-posta ile kayıt olan kullanıcının mail adresi doğrulanır.
3. Admin panelinden parti oluşturulur.
4. Parti normal kullanıcıların anasayfasında görünür.
5. Admin, gerçek hayatta ödeme yapan veya davet edilen kişilere bilet tanımlar.
6. Kullanıcı biletini hesabından görüntüler ve PDF/QR olarak indirir.
7. Okuyucu hesabı, kapıda QR kodu okutur.
8. Her bilet yalnızca tanımlı kişi sayısı kadar giriş hakkı verir.
9. QR okutulunca giriş hakkı düşer ve tekrar kullanım engellenir.

## Sabit Teknoloji Kararları

- Yayınlama: Vercel
- Veritabanı/Auth/Storage: Supabase
- Önerilen frontend/backend framework: Next.js App Router + TypeScript

## Geliştirme Başlangıcı

Bu klasör artık Next.js App Router + TypeScript uygulama iskeletini de içerir.

```bash
npm run dev
```

Yerel adres:

```txt
http://localhost:3000
```

Supabase bağlantısı için `.env.example` dosyasını temel alarak `.env.local` oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

İlk database kurulumu için başlangıç migration dosyası:

```txt
supabase/migrations/0001_initial_schema.sql
```

Not: `SUPABASE_SERVICE_ROLE_KEY` sadece server ortamında tutulmalı, client tarafında kullanılmamalıdır.
