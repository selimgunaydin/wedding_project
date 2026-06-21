-- Mevcut "uploads" tablosuna küçük önizleme (thumbnail) alanları ekler.
-- Supabase SQL editöründe bir kez çalıştırın. Var olan kayıtlarda bu alanlar
-- NULL kalır; backfill script'i (scripts/backfill-thumbnails.mjs) onları doldurur.

alter table public.uploads
  add column if not exists thumbnail_path text,
  add column if not exists thumbnail_url text;
