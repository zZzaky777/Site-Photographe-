-- ZakyPhoto : à exécuter dans Supabase > SQL Editor.
-- Les photos publiées sont visibles publiquement. Seuls les comptes connectés peuvent modifier la bibliothèque.
create table if not exists public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('sport','evenements','portrait','nature','mariage')),
  image_url text not null,
  storage_path text not null,
  alt text not null default '',
  caption text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.portfolio_photos enable row level security;

drop policy if exists "Published photos are visible to everyone" on public.portfolio_photos;
create policy "Published photos are visible to everyone"
on public.portfolio_photos for select
to anon, authenticated
using (published = true);

drop policy if exists "Admin can read all portfolio photos" on public.portfolio_photos;
create policy "Admin can read all portfolio photos"
on public.portfolio_photos for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can add portfolio photos" on public.portfolio_photos;
create policy "Authenticated admins can add portfolio photos"
on public.portfolio_photos for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can edit portfolio photos" on public.portfolio_photos;
create policy "Authenticated admins can edit portfolio photos"
on public.portfolio_photos for update
to authenticated
using (true) with check (true);

drop policy if exists "Authenticated admins can delete portfolio photos" on public.portfolio_photos;
create policy "Authenticated admins can delete portfolio photos"
on public.portfolio_photos for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 12582912, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 12582912, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "Portfolio images are publicly readable" on storage.objects;
create policy "Portfolio images are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio');

drop policy if exists "Authenticated users can upload portfolio images" on storage.objects;
create policy "Authenticated users can upload portfolio images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio');

drop policy if exists "Authenticated users can delete portfolio images" on storage.objects;
create policy "Authenticated users can delete portfolio images"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio');

-- Galeries clients : le contenu n'est pas lisible directement via l'API publique Supabase.
-- Les fonctions serveur vérifient que la galerie est publiée et que chaque photo appartient au dossier Drive associé.
create table if not exists public.client_galleries (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  title text not null default 'Galerie privée',
  slug text not null unique,
  drive_folder_id text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.client_galleries enable row level security;
drop policy if exists "Admins can read client galleries" on public.client_galleries;
create policy "Admins can read client galleries" on public.client_galleries
  for select to authenticated using (true);
drop policy if exists "Admins can create client galleries" on public.client_galleries;
create policy "Admins can create client galleries" on public.client_galleries
  for insert to authenticated with check (true);
drop policy if exists "Admins can update client galleries" on public.client_galleries;
create policy "Admins can update client galleries" on public.client_galleries
  for update to authenticated using (true) with check (true);
drop policy if exists "Admins can delete client galleries" on public.client_galleries;
create policy "Admins can delete client galleries" on public.client_galleries
  for delete to authenticated using (true);
