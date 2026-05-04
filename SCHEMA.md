# SCHEMA.md

Bu dosya Supabase/PostgreSQL veri modeli için başlangıç şemasıdır.

> Not: Bu SQL bir MVP başlangıç taslağıdır. Production öncesi Supabase SQL Editor veya migration sistemiyle test edilmelidir.

## Tablolar

Ana tablolar:

- `profiles`
- `parties`
- `party_images`
- `tickets`
- `ticket_scans`

## Enum Yerine Check Constraint

Supabase/PostgreSQL enum kullanılabilir, fakat MVP'de değiştirmesi daha kolay olduğu için `check constraint` tercih edilebilir.

Roller:

- `user`
- `admin`
- `scanner`

Parti durumları:

- `draft`
- `published`
- `cancelled`

Bilet durumları:

- `active`
- `used`
- `revoked`

Scan sonuçları:

- `approved`
- `rejected`

---

## SQL Başlangıç Şeması

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_year int,
  email text not null,
  role text not null default 'user'
    check (role in ('user', 'admin', 'scanner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint birth_year_valid
    check (birth_year is null or (birth_year between 1900 and extract(year from now())::int))
);

create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  important_notes text,
  location_name text,
  address text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price numeric(10,2),
  currency text not null default 'TRY',
  cover_image_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.party_images (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,

  holder_first_name text not null,
  holder_last_name text not null,

  qr_token text not null unique default encode(gen_random_bytes(32), 'hex'),

  max_entries int not null default 1 check (max_entries > 0),
  used_entries int not null default 0 check (used_entries >= 0),

  status text not null default 'active'
    check (status in ('active', 'used', 'revoked')),

  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint used_entries_not_more_than_max
    check (used_entries <= max_entries)
);

create table if not exists public.ticket_scans (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  party_id uuid references public.parties(id) on delete set null,
  scanned_by uuid references public.profiles(id) on delete set null,

  requested_entries int not null default 1 check (requested_entries > 0),
  result text not null check (result in ('approved', 'rejected')),
  reason text,
  scanned_at timestamptz not null default now()
);
```

---

## Indexler

```sql
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_parties_status_starts_at on public.parties(status, starts_at);
create index if not exists idx_tickets_user_id on public.tickets(user_id);
create index if not exists idx_tickets_party_id on public.tickets(party_id);
create index if not exists idx_tickets_qr_token on public.tickets(qr_token);
create index if not exists idx_ticket_scans_ticket_id on public.ticket_scans(ticket_id);
create index if not exists idx_ticket_scans_party_id on public.ticket_scans(party_id);
create index if not exists idx_ticket_scans_scanned_at on public.ticket_scans(scanned_at desc);
```

---

## Updated At Trigger

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_parties_updated_at on public.parties;
create trigger set_parties_updated_at
before update on public.parties
for each row execute function public.set_updated_at();

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();
```

---

## Role Helper Function

RLS içinde doğrudan profiles tablosuna tekrar tekrar bakmak recursion sorunlarına yol açabilir. Bu yüzden `security definer` helper kullanılır.

```sql
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;
```

---

## RLS Aktifleştirme

```sql
alter table public.profiles enable row level security;
alter table public.parties enable row level security;
alter table public.party_images enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_scans enable row level security;
```

---

## Profiles RLS

```sql
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Users can update own basic profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
);

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
```

> İlk admin hesabını Supabase SQL Editor ile manuel vermen gerekir:
>
> ```sql
> update public.profiles
> set role = 'admin'
> where email = 'admin@example.com';
> ```

---

## Parties RLS

```sql
create policy "Published parties are visible to authenticated users"
on public.parties
for select
to authenticated
using (status = 'published' or public.current_user_role() = 'admin');

create policy "Admins can insert parties"
on public.parties
for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "Admins can update parties"
on public.parties
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Admins can delete parties"
on public.parties
for delete
to authenticated
using (public.current_user_role() = 'admin');
```

---

## Party Images RLS

```sql
create policy "Party images visible for published parties"
on public.party_images
for select
to authenticated
using (
  exists (
    select 1
    from public.parties p
    where p.id = party_images.party_id
    and (p.status = 'published' or public.current_user_role() = 'admin')
  )
);

create policy "Admins can manage party images"
on public.party_images
for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
```

---

## Tickets RLS

```sql
create policy "Users can read own tickets"
on public.tickets
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read all tickets"
on public.tickets
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Admins can insert tickets"
on public.tickets
for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "Admins can update tickets"
on public.tickets
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
```

---

## Ticket Scans RLS

```sql
create policy "Admins can read all scans"
on public.ticket_scans
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Scanners can read own scans"
on public.ticket_scans
for select
to authenticated
using (scanned_by = auth.uid() or public.current_user_role() = 'admin');
```

Scan insert işlemi doğrudan client tarafından yapılmamalı, `scan_ticket` function üzerinden yapılmalıdır.

---

## QR Scan Function

Bu function QR okutma işlemini tek transaction içinde yapar.

```sql
create or replace function public.scan_ticket(
  p_qr_token text,
  p_party_id uuid,
  p_requested_entries int default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_ticket public.tickets%rowtype;
  v_remaining int;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();

  if v_role not in ('admin', 'scanner') then
    return jsonb_build_object(
      'ok', false,
      'reason', 'unauthorized',
      'message', 'Bu işlem için yetkiniz yok.'
    );
  end if;

  if p_requested_entries is null or p_requested_entries < 1 then
    return jsonb_build_object(
      'ok', false,
      'reason', 'invalid_requested_entries',
      'message', 'Giriş kişi sayısı geçersiz.'
    );
  end if;

  select *
  into v_ticket
  from public.tickets
  where qr_token = p_qr_token
  for update;

  if not found then
    insert into public.ticket_scans (
      ticket_id,
      party_id,
      scanned_by,
      requested_entries,
      result,
      reason
    )
    values (
      null,
      p_party_id,
      auth.uid(),
      p_requested_entries,
      'rejected',
      'ticket_not_found'
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'ticket_not_found',
      'message', 'Bilet bulunamadı.'
    );
  end if;

  if v_ticket.party_id <> p_party_id then
    insert into public.ticket_scans (
      ticket_id,
      party_id,
      scanned_by,
      requested_entries,
      result,
      reason
    )
    values (
      v_ticket.id,
      p_party_id,
      auth.uid(),
      p_requested_entries,
      'rejected',
      'wrong_party'
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'wrong_party',
      'message', 'Bu bilet bu parti için geçerli değil.'
    );
  end if;

  if v_ticket.status <> 'active' then
    insert into public.ticket_scans (
      ticket_id,
      party_id,
      scanned_by,
      requested_entries,
      result,
      reason
    )
    values (
      v_ticket.id,
      v_ticket.party_id,
      auth.uid(),
      p_requested_entries,
      'rejected',
      'ticket_not_active'
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'ticket_not_active',
      'message', 'Bu bilet aktif değil.'
    );
  end if;

  v_remaining := v_ticket.max_entries - v_ticket.used_entries;

  if v_remaining < p_requested_entries then
    insert into public.ticket_scans (
      ticket_id,
      party_id,
      scanned_by,
      requested_entries,
      result,
      reason
    )
    values (
      v_ticket.id,
      v_ticket.party_id,
      auth.uid(),
      p_requested_entries,
      'rejected',
      'not_enough_entries'
    );

    return jsonb_build_object(
      'ok', false,
      'reason', 'not_enough_entries',
      'message', 'Biletin kalan giriş hakkı yetersiz.',
      'remaining_entries', v_remaining
    );
  end if;

  update public.tickets
  set
    used_entries = used_entries + p_requested_entries,
    status = case
      when used_entries + p_requested_entries >= max_entries then 'used'
      else status
    end
  where id = v_ticket.id;

  insert into public.ticket_scans (
    ticket_id,
    party_id,
    scanned_by,
    requested_entries,
    result,
    reason
  )
  values (
    v_ticket.id,
    v_ticket.party_id,
    auth.uid(),
    p_requested_entries,
    'approved',
    'ok'
  );

  return jsonb_build_object(
    'ok', true,
    'message', 'Giriş onaylandı.',
    'ticket_id', v_ticket.id,
    'party_id', v_ticket.party_id,
    'holder_first_name', v_ticket.holder_first_name,
    'holder_last_name', v_ticket.holder_last_name,
    'requested_entries', p_requested_entries,
    'used_entries', v_ticket.used_entries + p_requested_entries,
    'max_entries', v_ticket.max_entries,
    'remaining_entries', v_ticket.max_entries - (v_ticket.used_entries + p_requested_entries)
  );
end;
$$;
```

---

## Auth Sonrası Profil Oluşturma

Supabase Auth ile kullanıcı oluşturulduğunda profil satırı oluşturmak için trigger kullanılabilir.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    birth_year,
    email,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'birth_year', '')::int,
    new.email,
    'user'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

Google ile girişte doğum yılı genelde gelmeyeceği için kullanıcıdan profil tamamlama ekranında istenmelidir.

---

## Storage Buckets

Önerilen bucket'lar:

```txt
party-images
ticket-pdfs
```

### `party-images`

- Public olabilir.
- Sadece admin upload/update/delete yapabilir.
- Kullanıcılar yayındaki parti görsellerini okuyabilir.

### `ticket-pdfs`

- Private olmalıdır.
- Kullanıcı sadece kendi bilet PDF'ini indirebilmelidir.
- Alternatif olarak PDF anlık route üzerinden üretilebilir, bucket'a kaydedilmeyebilir.

## Production Notları

MVP için `qr_token` veritabanında tutulabilir. Daha güvenli sürümde:

- QR token hashlenerek tutulabilir.
- PDF üretimi sırasında signed token kullanılabilir.
- Token rotasyonu yapılabilir.
- Bilet iptal edildiğinde eski token geçersiz olur.
