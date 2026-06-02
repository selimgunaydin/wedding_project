insert into public.events (title, slug, event_type, event_date, description, is_active)
values
  (
    'Nişan',
    'nisan-21-06-2026',
    'engagement',
    '2026-06-21',
    'Bu ilk kutlamada yakaladığınız zarif anları bizimle paylaşın; her kare bu hikayeyi biraz daha büyütecek.',
    true
  ),
  (
    '1. Düğün',
    'dugun-1-02-08-2026',
    'wedding_1',
    '2026-08-02',
    'Sevdiklerimizle bir araya geldiğimiz bu özel günden fotoğraf ve videolarınızı bekliyoruz.',
    true
  ),
  (
    '2. Düğün',
    'dugun-2-29-08-2026',
    'wedding_2',
    '2026-08-29',
    'Kutlamamızın ikinci buluşmasında gördüğünüz en güzel anları tek yerde toplayalım.',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  event_type = excluded.event_type,
  event_date = excluded.event_date,
  description = excluded.description,
  is_active = excluded.is_active;
