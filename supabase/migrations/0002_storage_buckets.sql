insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('party-images', 'party-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('ticket-pdfs', 'ticket-pdfs', false, 5242880, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read party images" on storage.objects;
create policy "Public can read party images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'party-images');

drop policy if exists "Admins can manage party images storage" on storage.objects;
create policy "Admins can manage party images storage"
on storage.objects for all
to authenticated
using (bucket_id = 'party-images' and private.current_user_role() = 'admin')
with check (bucket_id = 'party-images' and private.current_user_role() = 'admin');

drop policy if exists "Users can read own ticket pdfs" on storage.objects;
create policy "Users can read own ticket pdfs"
on storage.objects for select
to authenticated
using (bucket_id = 'ticket-pdfs' and owner_id = auth.uid()::text);

drop policy if exists "Admins can manage ticket pdfs" on storage.objects;
create policy "Admins can manage ticket pdfs"
on storage.objects for all
to authenticated
using (bucket_id = 'ticket-pdfs' and private.current_user_role() = 'admin')
with check (bucket_id = 'ticket-pdfs' and private.current_user_role() = 'admin');
