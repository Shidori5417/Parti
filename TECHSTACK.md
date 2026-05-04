# TECHSTACK.md

## Ana Kararlar

Bu proje için önerilen ana yapı:

- **Framework:** Next.js App Router
- **Dil:** TypeScript
- **Deployment:** Vercel
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Authorization:** Supabase RLS policies
- **Dosya/Görsel depolama:** Supabase Storage
- **UI:** Tailwind CSS + shadcn/ui + Lucide React
- **Animasyon:** Framer Motion
- **Form yönetimi:** React Hook Form
- **Validasyon:** Zod
- **QR oluşturma:** `qrcode` veya `react-qr-code`
- **QR okuma:** `@zxing/browser` veya `html5-qrcode`
- **PDF bilet üretimi:** `@react-pdf/renderer`
- **Tarih/saat:** `date-fns`
- **Bildirim/toast:** Sonner
- **Kod kalite:** ESLint + Prettier
- **Test:** Playwright, gerekirse Vitest

## Neden Next.js?

Bu proje hem frontend hem backend ihtiyaçları olan bir uygulama:

- Normal kullanıcı sayfaları
- Admin paneli
- Okuyucu/scanner paneli
- API route/server action ihtiyaçları
- PDF üretimi
- Supabase ile güvenli server-side işlemler

Next.js App Router, bu yapıya uygun olur çünkü route yapısı düzenli tutulabilir, server component/server action kullanılabilir ve Vercel ile kolay deploy edilir.

## Neden Supabase?

Supabase bu proje için tek başına birçok ihtiyacı karşılar:

- Kullanıcı kaydı/girişi
- Google ile giriş
- E-posta doğrulama
- PostgreSQL veritabanı
- Row Level Security
- Dosya/görsel depolama
- Admin/scanner/user yetkilendirme
- SQL fonksiyonları ile güvenli QR okutma işlemi

## Tavsiye Edilen Paketler

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install qrcode @zxing/browser
npm install @react-pdf/renderer
npm install date-fns sonner lucide-react framer-motion
```

shadcn/ui kurulumu:

```bash
npx shadcn@latest init
```

Önerilen shadcn bileşenleri:

```bash
npx shadcn@latest add button card input label textarea dialog dropdown-menu table badge tabs sheet alert form select
```

## Proje Klasör Yapısı

```txt
party-ticket-app/
  app/
    (public)/
      page.tsx
      parties/
        [slug]/
          page.tsx
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
      callback/
        route.ts
    dashboard/
      page.tsx
      tickets/
        page.tsx
      tickets/
        [ticketId]/
          page.tsx
    admin/
      page.tsx
      parties/
        page.tsx
      parties/
        new/
          page.tsx
      parties/
        [partyId]/
          edit/
            page.tsx
      users/
        page.tsx
      tickets/
        assign/
          page.tsx
    scanner/
      page.tsx
    api/
      tickets/
        [ticketId]/
          pdf/
            route.ts
      scan/
        route.ts

  components/
    auth/
    layout/
    party/
    ticket/
    admin/
    scanner/
    ui/

  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth/
      roles.ts
      guards.ts
    qr/
      generate.ts
      validate.ts
    pdf/
      ticket-template.tsx
    validators/
      party.ts
      profile.ts
      ticket.ts

  supabase/
    migrations/
    seed.sql

  docs/
    AGENTS.md
    DESIGN.md
    MEMORIES.md
    MVP.md
    ROADMAP.md
    SCHEMA.md
    TECHSTACK.md
    USER_FLOWS.md
```

## Ortam Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
TICKET_QR_SECRET=
```

Notlar:

- `NEXT_PUBLIC_*` değişkenleri tarayıcıya gider.
- `SUPABASE_SERVICE_ROLE_KEY` asla client tarafında kullanılmaz.
- `TICKET_QR_SECRET` QR imzalama/hashing için server tarafında kalır.

## Güvenlik Prensipleri

1. Admin ve scanner kontrolü sadece frontend'de yapılmaz, Supabase RLS ve server-side kontrollerle de yapılır.
2. QR kodun içinde hassas kullanıcı bilgisi tutulmaz.
3. QR kod, tahmin edilemez bir token veya imzalı payload taşır.
4. QR okutma işlemi atomic yapılır; aynı bilet iki cihazda aynı anda okutulursa çifte giriş engellenir.
5. Ticket `used_entries` değeri güvenli SQL function/RPC ile artırılır.
6. Kullanıcı yalnızca kendi biletlerini görebilir.
7. Scanner hesabı kullanıcı listesini değil, sadece okutulan QR sonucunu görebilir.
