create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_type text not null check (event_type in ('engagement', 'wedding_1', 'wedding_2')),
  event_date date not null,
  description text not null,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_slug text not null,
  file_name text not null,
  original_file_name text not null,
  file_path text not null unique,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'video')),
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  uploaded_by_name text,
  uploaded_by_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists uploads_event_slug_idx on public.uploads(event_slug);
create index if not exists uploads_status_idx on public.uploads(status);
create index if not exists uploads_created_at_idx on public.uploads(created_at desc);
create index if not exists uploads_file_type_idx on public.uploads(file_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists uploads_set_updated_at on public.uploads;
create trigger uploads_set_updated_at
before update on public.uploads
for each row execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.uploads enable row level security;

drop policy if exists "Public can read active events" on public.events;
create policy "Public can read active events"
on public.events for select
using (is_active = true);

drop policy if exists "Public can read approved uploads" on public.uploads;
