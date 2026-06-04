# Anı Kutusu

Nişan ve düğün etkinlikleri için QR kod ile fotoğraf-video toplama platformu. Misafirler etkinlik QR kodunu okutup dosyalarını doğrudan Contabo Object Storage'a yükler; admin paneli ise yüklemeleri onaylar, reddeder, siler ve indirir.

## 1. Proje kurulumu

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Local adres: `http://localhost:3000`

## 2. Env değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın ve değerleri doldurun.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CONTABO_S3_ENDPOINT=https://eu2.contabostorage.com
CONTABO_S3_REGION=default
CONTABO_S3_ACCESS_KEY_ID=
CONTABO_S3_SECRET_ACCESS_KEY=
CONTABO_S3_BUCKET_NAME=event-media
CONTABO_S3_PUBLIC_BASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## 3. Supabase database kurulumu

1. Supabase projesi oluşturun.
2. SQL editor içinde `supabase/schema.sql` dosyasını çalıştırın.
3. Ardından `supabase/seed.sql` dosyasını çalıştırın.
4. `SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini `.env.local` içine ekleyin.

Public taraf sadece aktif etkinlik bilgisini okuyarak QR'dan gelen yükleme sayfasını açar. Medya kayıtlarını listeleme, onaylama, silme ve indirme işlemleri admin tarafında server-side service role key ile yapılır.

## 4. Contabo Object Storage kurulumu

Contabo Object Storage S3 uyumludur. Türkiye'den erişim için Europe region önerilir; gecikme düşük kalır ve Avrupa altyapısıyla uyumlu çalışır.

1. Contabo panelinde Object Storage oluşturun.
2. `event-media` gibi bir bucket açın.
3. S3 access key ve secret key oluşturun.
4. Endpoint, region, bucket adı ve public base URL değerlerini env içine ekleyin.

Contabo S3 API için Europe endpoint'i `https://eu2.contabostorage.com`, region değeri genelde `default` olmalıdır ve path-style bucket URL kullanılır.

## 5. Bucket ayarları

Bu MVP'de medya URL'leri `CONTABO_S3_PUBLIC_BASE_URL` üzerinden servis edilir. Bu yüzden bucket veya ilgili object path'leri okunabilir olmalıdır. Upload yine public endpoint'e açık değildir; client önce kısa süreli signed upload URL alır, sonra dosyayı doğrudan Contabo'ya PUT eder.

Tarayıcıdan direkt `PUT` yapılacağı için bucket CORS ayarını da uygulayın:

```bash
aws --endpoint-url https://eu2.contabostorage.com s3api put-bucket-cors --bucket event-media --cors-configuration file://cors.json
aws --endpoint-url https://eu2.contabostorage.com s3api get-bucket-cors --bucket event-media
```

Production domaininiz `cors.json` içindeki `AllowedOrigins` listesinde birebir yer almalıdır. Örneğin `https://es.selwise.com` ile `https://www.es.selwise.com` farklı origin sayılır.

Dosya yolu yapısı:

```text
events/{event-slug}/images/{timestamp}-{randomId}-{safeFileName}.jpg
events/{event-slug}/videos/{timestamp}-{randomId}-{safeFileName}.mp4
```

İleride CDN veya Cloudflare proxy eklenebilir.

## 6. Admin kullanıcı oluşturma

Basit admin auth env üzerinden çalışır:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=guclu-bir-sifre
```

Giriş: `/admin/login`

Production'da güçlü bir şifre kullanın. İsterseniz `AUTH_SECRET` env değeri de ekleyerek cookie imzasını admin şifresinden ayrı yönetebilirsiniz.

## 7. Seed data ekleme

Başlangıç etkinlikleri `supabase/seed.sql` içindedir:

- `21.06.2026` Nişan
- `02.08.2026` 1. Düğün
- `29.08.2026` 2. Düğün

Local env eksikken public sayfalar bu seed verinin TypeScript karşılığıyla açılır; gerçek upload ve admin veri işlemleri Supabase ister.

## 8. Local development

```bash
pnpm dev
pnpm typecheck
pnpm build
```

Ana route'lar:

- `/`
- `/events/[slug]`
- `/admin/login`
- `/admin`
- `/admin/events`
- `/admin/events/[id]`
- `/admin/qr`
- `/admin/qr/[slug]`
- `/admin/uploads`

## 9. Production deploy

1. Supabase schema ve seed'i production projesinde çalıştırın.
2. Contabo Object Storage bucket ve access key'leri oluşturun.
3. Deploy ortamında tüm env değişkenlerini tanımlayın.
4. `NEXT_PUBLIC_APP_URL` değerini gerçek domain yapın.
5. `pnpm build` çıktısını doğrulayın.
6. Admin şifresini güçlü ve benzersiz tutun.

## 10. QR kodların indirilmesi

QR kodlar public sitede görünmez. Admin panelde `/admin/qr` sayfasında tüm etkinlik QR kartları bulunur. Her kartta PNG indir ve baskı görünümü butonları vardır. Tek etkinlik poster görünümü:

```text
/admin/qr/nisan-21-06-2026?print=1
/admin/qr/dugun-1-02-08-2026?print=1
/admin/qr/dugun-2-29-08-2026?print=1
```

`print=1` parametresi tarayıcı print penceresini otomatik açar.

## 11. Storage limitleri ve öneriler

Limitler `lib/constants.ts` içinde tutulur:

- Fotoğraf: 15 MB
- Video: 300 MB
- Tek seferde: 10 dosya

Büyük video dosyaları Next.js server üzerinden akmaz. Akış:

1. Client dosya bilgisini `/api/upload/presign` endpoint'ine gönderir.
2. Server etkinlik, mime type ve boyut kontrolü yapar.
3. Server Contabo için kısa süreli signed URL üretir.
4. Client dosyayı doğrudan Contabo Object Storage'a PUT eder.
5. Client `/api/upload/complete` ile metadata kaydını oluşturur.
6. Kayıt `pending` olur; medya yalnızca admin panelinde yönetilir.

Contabo tarafında kullanım büyürse lifecycle policy, CDN cache ve video thumbnail üretimi eklemek iyi bir sonraki adımdır.
