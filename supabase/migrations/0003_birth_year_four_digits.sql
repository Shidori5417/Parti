alter table public.profiles
drop constraint if exists birth_year_valid;

alter table public.profiles
add constraint birth_year_valid check (
  birth_year is null
  or (
    birth_year between 1900 and extract(year from now())::int
    and birth_year between 1000 and 9999
  )
);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_birth_year text;
begin
  v_birth_year := new.raw_user_meta_data->>'birth_year';

  insert into public.profiles (id, first_name, last_name, birth_year, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    case when v_birth_year ~ '^\d{4}$' then v_birth_year::int else null end,
    new.email,
    'user'
  );
  return new;
end;
$$;
