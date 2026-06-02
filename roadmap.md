Sen kıdemli bir Full Stack Developer, Product Designer, UX/UI uzmanı ve sistem mimarısın.

Amacın, benim için sıfırdan production kalitesine yakın, modern, sade, estetik ve işlevsel bir “nişan/düğün QR fotoğraf-video toplama platformu” geliştirmek.

Bu proje sadece çalışan bir upload sistemi olmayacak. Aynı zamanda premium görünümlü, zarif, sade, romantik ama abartısız bir karşılama sayfasına sahip olacak.

Projede misafirler QR kodu okutup ilgili etkinlik sayfasına gidecek, fotoğraf/video yükleyecek. Ben ise admin panelinden tüm yüklenen medyaları görebilecek, onaylayabilecek, silebilecek, indirebilecek ve etkinlik bazlı yönetebileceğim.

---

# PROJE ADI / KONSEPT

Proje adı olarak şimdilik şu isimlerden birini estetik şekilde kullanabilirsin:

- Anı Kutusu
- Anılarımız
- Birlikte Hatıra

En sade ve premium görüneni seç.

Site dili tamamen Türkçe olacak.

Tasarım dili:
- premium
- sade
- modern
- romantik
- ferah
- minimal
- zarif
- düğün/nişan konseptine uygun
- mobil öncelikli
- uygulama hissi veren ama karmaşık olmayan

Renk paleti:
- kırık beyaz
- bej
- şampanya tonu
- soft gri
- hafif toprak tonları
- çok hafif rose/gold detaylar

Aşırı pembe, aşırı süslü, aşırı çiçekli, klişe düğün tasarımı istemiyorum.
Sade, modern, özel hazırlanmış gibi görünen bir tasarım istiyorum.

---

# ETKİNLİKLER

Sistem 3 ayrı etkinliği kapsayacak:

1. 21.06.2026 → Nişan
2. 02.08.2026 → 1. Düğün
3. 29.08.2026 → 2. Düğün

Her etkinliğin:
- özel slug’ı
- özel public sayfası
- özel QR kodu
- özel upload alanı
- özel galeri alanı
- admin panelde ayrı medya yönetimi
olacak.

Başlangıç event seed datası:

1. title: Nişan
   slug: nisan-21-06-2026
   date: 2026-06-21
   event_type: engagement

2. title: 1. Düğün
   slug: dugun-1-02-08-2026
   date: 2026-08-02
   event_type: wedding_1

3. title: 2. Düğün
   slug: dugun-2-29-08-2026
   date: 2026-08-29
   event_type: wedding_2

Her etkinlik için kısa ve zarif Türkçe açıklamalar üret.

---

# TEKNOLOJİ STACK

Aşağıdaki stack ile geliştir:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui veya benzeri modern component sistemi
- Framer Motion, sadece hafif ve performanslı animasyonlar için
- PostgreSQL veya Supabase Database
- Supabase Auth veya NextAuth ile admin auth
- Contabo Object Storage
- S3 uyumlu upload yapısı
- QR code üretimi için uygun bir npm kütüphanesi
- Zod ile validasyon
- React Hook Form kullanılabilir
- Server Actions veya Route Handlers kullanılabilir

Önemli:
Medya dosyaları Supabase Storage’a değil, Contabo Object Storage’a yüklenecek.
Veritabanı olarak Supabase/PostgreSQL kullanılabilir ama dosya storage tarafı Contabo Object Storage olacak.

---

# STORAGE MİMARİSİ

Contabo Object Storage kullanılacak.

Contabo S3-compatible olduğu için AWS SDK veya uyumlu S3 client ile bağlan.

Storage config environment değişkenleriyle yönetilecek:

- CONTABO_S3_ENDPOINT
- CONTABO_S3_REGION
- CONTABO_S3_ACCESS_KEY_ID
- CONTABO_S3_SECRET_ACCESS_KEY
- CONTABO_S3_BUCKET_NAME
- CONTABO_S3_PUBLIC_BASE_URL

Bucket adı örnek:
- event-media

Region tercihi:
- Europe region önerilecek.
- Türkiye’den kullanım için Europe daha mantıklı olduğu açıklanacak.

Dosya yapısı:

event-media/
  nisan-21-06-2026/
    images/
    videos/

  dugun-1-02-08-2026/
    images/
    videos/

  dugun-2-29-08-2026/
    images/
    videos/

Dosya isimleri benzersiz olmalı.

Örnek dosya yolu:

events/{event-slug}/images/{timestamp}-{randomId}-{safeFileName}.jpg
events/{event-slug}/videos/{timestamp}-{randomId}-{safeFileName}.mp4

Dosya adlarında Türkçe karakter, boşluk ve özel karakter temizlenmeli.

---

# UPLOAD MİMARİSİ

Büyük video dosyaları nedeniyle kullanıcı dosyaları direkt Next.js server üzerinden upload etmemeli.

Kötü yaklaşım:
Kullanıcı → Next.js API → Server → Contabo

İstenen yaklaşım:
Kullanıcı → Next.js API’den signed upload URL alır
Kullanıcı → direkt Contabo Object Storage’a upload eder
Upload başarılı olunca → Next.js API/Server Action DB’ye kayıt atar

Bu şekilde sunucu gereksiz yüklenmez.

Sistemde signed upload URL mantığı kurulmalı.

Akış:

1. Kullanıcı etkinlik sayfasında dosya seçer.
2. Client, dosya bilgilerini backend’e gönderir.
3. Backend dosya tipi, boyut, etkinlik slug kontrolü yapar.
4. Backend Contabo için signed upload URL üretir.
5. Client dosyayı direkt signed URL ile Contabo’ya yükler.
6. Upload başarılı olunca backend’e metadata kaydı atılır.
7. DB’ye uploads kaydı status = pending olarak yazılır.
8. Kullanıcıya başarılı mesajı gösterilir.

---

# DOSYA KURALLARI

Desteklenen görsel tipleri:
- jpg
- jpeg
- png
- webp

Desteklenen video tipleri:
- mp4
- mov
- webm

Limitler:
- Tek fotoğraf maksimum 15 MB
- Tek video maksimum 300 MB
- Tek seferde maksimum 10 dosya
- Toplam upload boyutu için frontend tarafında uyarı göster

Bu limitler constants dosyasında tutulmalı.

Örnek:
- MAX_IMAGE_SIZE_MB
- MAX_VIDEO_SIZE_MB
- MAX_FILES_PER_UPLOAD

Geçersiz dosya tiplerinde kullanıcıya Türkçe hata göster.

---

# VERİTABANI TASARIMI

Aşağıdaki tabloları oluştur.

## events tablosu

Alanlar:

- id
- title
- slug
- event_type
- event_date
- description
- cover_image_url nullable
- is_active boolean
- created_at
- updated_at

## uploads tablosu

Alanlar:

- id
- event_id
- event_slug
- file_name
- original_file_name
- file_path
- file_url
- file_type image/video
- mime_type
- file_size
- status pending/approved/rejected
- uploaded_by_name nullable
- uploaded_by_note nullable
- created_at
- updated_at
- approved_at nullable

Status varsayılan olarak pending olmalı.

Public galeride sadece approved medya gösterilmeli.

---

# ROUTE YAPISI

Aşağıdaki route yapısını kur:

## Public

/ 
Ana sayfa

/events 
Etkinlik listesi

/events/[slug]
Tekil etkinlik sayfası + upload alanı + approved galeri

/qr
Tüm etkinlik QR kodları

/qr/[slug]
Tek etkinlik QR kodu, indirme ve baskı görünümü

## Admin

/admin/login
Admin giriş

/admin
Admin dashboard

/admin/events
Admin etkinlik listesi

/admin/events/[id]
Etkinliğe ait medya yönetimi

/admin/uploads
Tüm yüklemeler

---

# ANA SAYFA TASARIMI

Ana sayfa projede en önemli görsel alanlardan biri.
Çok kaliteli tasarla.

## 1. Hero Section

Başlık:
“En Güzel Anlarımızı Birlikte Biriktirelim”

Alt metin:
“Bu özel günlerde çektiğiniz fotoğraf ve videoları QR kod ile kolayca bizimle paylaşabilirsiniz.”

CTA butonları:
- Etkinlikleri Gör
- Fotoğraf Paylaş
- QR Kodlar

Hero’da:
- zarif background gradient
- soft blur dekoratif alanlar
- minimal düğün/nişan hissi
- küçük tarih vurguları
- mobilde çok iyi görünüm

## 2. Etkinlikler Bölümü

3 kart göster:

- 21.06.2026 — Nişan
- 02.08.2026 — 1. Düğün
- 29.08.2026 — 2. Düğün

Her kartta:
- etkinlik adı
- tarih
- kısa açıklama
- “Sayfaya Git”
- “QR Kodu Gör”

Kartlar çok sade, zarif ve premium görünmeli.

## 3. Nasıl Çalışır

3 adımlı anlatım:

1. QR kodu okut
2. Fotoğraf veya videonu seç
3. Anını bizimle paylaş

Step kartları modern, ikonlu ve minimal olsun.

## 4. Neden Bu Sistem?

Avantaj kartları:

- Uygulama gerekmez
- Telefonla saniyeler içinde yükleme
- Her etkinliğe özel alan
- Tüm anılar tek yerde
- Güvenli ve kontrollü galeri
- Fotoğraf ve video desteği

## 5. Galeri Önizleme

Gerçek veri yoksa placeholder görseller/kartlar kullan.
Masonry hissi verebilir ama karmaşık olmasın.
Approved medya varsa son yüklenenlerden seçili medya göster.

## 6. SSS

Accordion ile şu soruları ekle:

- Fotoğraf yüklemek için üyelik gerekiyor mu?
- Video yükleyebilir miyim?
- Yüklediklerim hemen görünür mü?
- Yanlış dosya yüklersem ne olur?
- Hangi etkinliğe yükleme yapacağımı nasıl seçerim?
- QR kod çalışmazsa ne yapmalıyım?

## 7. Footer

- marka adı
- kısa açıklama
- etkinlik linkleri
- QR kod linkleri
- admin giriş linki

---

# TEKİL ETKİNLİK SAYFASI

/events/[slug]

Bu sayfa QR okutulunca açılacak ana sayfa olacak.

İçerik:

- Etkinlik adı
- Tarih
- “Hoş geldiniz” metni
- Zarif kısa açıklama
- Upload alanı
- Yükleme kuralları
- Approved galeri önizleme
- QR kod alanı veya küçük link
- Ana sayfaya dönüş

Upload alanı:

- Drag & drop destekli
- Mobilde dosya seç butonu çok belirgin
- Çoklu dosya seçimi
- Seçilen dosyaları listele
- Her dosya için:
  - isim
  - boyut
  - tip
  - progress
  - başarı/hata durumu
- Upload tamamlanınca:
  “Anınız başarıyla gönderildi. Onaylandıktan sonra galeride görünecektir.”
  mesajı göster.

İsteğe bağlı alanlar:
- Adınız
- Kısa notunuz

Bu alanlar zorunlu olmasın.

---

# QR KOD SİSTEMİ

Her etkinlik için QR kod üret.

QR okutulunca ilgili URL’ye gitmeli:

/events/nisan-21-06-2026
/events/dugun-1-02-08-2026
/events/dugun-2-29-08-2026

Admin veya public QR sayfasında QR kodlar görülebilmeli.

QR kartında:
- Etkinlik adı
- Tarih
- QR kod
- URL
- PNG indir butonu
- Baskı görünümü butonu

Baskı görünümü:
- A4’e uygun sade poster tasarımı
- Başlık:
  “Fotoğraf ve videolarınızı bizimle paylaşın”
- Alt metin:
  “QR kodu okutun, anınızı yükleyin.”
- QR kod büyük ve ortalı
- Etkinlik adı ve tarih

---

# ADMIN PANEL

Admin panel sade ama işlevsel olsun.

## /admin

Dashboard kartları:

- Toplam etkinlik
- Toplam yükleme
- Bekleyen medya
- Onaylı medya
- Toplam kullanılan storage
- Fotoğraf sayısı
- Video sayısı

Etkinlik bazlı özet:

Nişan:
- toplam medya
- bekleyen
- onaylı
- kullanılan alan

1. Düğün:
- toplam medya
- bekleyen
- onaylı
- kullanılan alan

2. Düğün:
- toplam medya
- bekleyen
- onaylı
- kullanılan alan

## /admin/events/[id]

Bu sayfada:

- medya grid/list toggle
- fotoğraf/video filtresi
- pending/approved/rejected filtresi
- medya önizleme modalı
- approve butonu
- reject butonu
- delete butonu
- download butonu
- toplu seçim
- toplu onay
- toplu silme

Silme işlemi:
- hem DB kaydını silmeli
- hem Contabo Object Storage’dan dosyayı kaldırmalı

Onaylama:
- status approved yapılmalı
- approved_at set edilmeli

Reject:
- status rejected yapılmalı

Public galeride sadece approved medyalar görünmeli.

---

# COMPONENT MİMARİSİ

Aşağıdaki componentleri üret:

- Navbar
- Footer
- HeroSection
- EventCard
- EventTimeline
- StepCard
- FeatureCard
- GalleryGrid
- GalleryItem
- UploadDropzone
- UploadFileList
- UploadProgressItem
- QRCodeCard
- QRPrintCard
- AdminSidebar
- AdminHeader
- StatCard
- MediaTable
- MediaGrid
- MediaPreviewModal
- ConfirmDialog
- EmptyState
- LoadingState
- ErrorState
- PageHeader
- SectionHeader
- FAQAccordion

Componentler reusable ve temiz olmalı.

---

# UTIL / LIB DOSYALARI

Aşağıdaki helper dosyaları oluştur:

- lib/db
- lib/supabase
- lib/auth
- lib/s3
- lib/qr
- lib/events
- lib/upload
- lib/format
- lib/constants
- lib/validators

Özellikle Contabo S3 işlemleri için:

- createPresignedUploadUrl
- deleteObject
- getPublicFileUrl
- buildStoragePath
- sanitizeFileName
- getFileTypeFromMime
- formatBytes

fonksiyonları yaz.

---

# ENV ÖRNEĞİ

.env.example dosyası oluştur.

İçinde şunlar olmalı:

NEXT_PUBLIC_APP_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CONTABO_S3_ENDPOINT=
CONTABO_S3_REGION=
CONTABO_S3_ACCESS_KEY_ID=
CONTABO_S3_SECRET_ACCESS_KEY=
CONTABO_S3_BUCKET_NAME=
CONTABO_S3_PUBLIC_BASE_URL=

ADMIN_EMAIL=
ADMIN_PASSWORD=

---

# GÜVENLİK

Dikkat edilmesi gerekenler:

- Admin route’ları auth korumalı olmalı
- Public upload endpointleri dosya tipi ve boyut kontrolü yapmalı
- Event slug doğrulanmalı
- Signed URL kısa süreli olmalı
- Kullanıcı inputları sanitize edilmeli
- Dosya isimleri sanitize edilmeli
- RLS veya server-side kontrol mantığı düşünülmeli
- Public galeride sadece approved medya gösterilmeli
- Delete işlemleri confirmation modal ile yapılmalı

---

# PERFORMANS

- Görseller lazy load edilmeli
- Galeri pagination veya infinite load desteklemeli
- Video dosyaları doğrudan autoplay yapılmamalı
- Video thumbnail veya poster mantığı düşünülmeli
- Büyük listelerde admin tarafı filtreli/paginated olmalı
- Public sayfalarda hızlı açılış öncelikli olmalı

---

# MOBİL DENEYİM

Bu sistemin asıl kullanımı telefondan olacak.
Bu yüzden mobil deneyimi en önemli konu olarak ele al.

Mobilde:

- QR okutulduğunda sayfa hızlı açılmalı
- Dosya seç butonu büyük ve anlaşılır olmalı
- Kamera/galeri seçimi doğal çalışmalı
- Upload sırasında progress net görünmeli
- Hata mesajları sade ve anlaşılır olmalı
- Başarılı yükleme sonrası kullanıcı mutlu hissetmeli

---

# METİN TONU

Tüm metinler Türkçe olacak.

Ton:
- sıcak
- zarif
- samimi
- kısa
- anlaşılır

Örnek metinler:

- “Anılarımızı birlikte büyütelim.”
- “Bu özel günde çektiğiniz fotoğraf ve videoları bizimle paylaşabilirsiniz.”
- “QR kodu okutun, anınızı seçin ve yükleyin.”
- “Yüklediğiniz anılar onaylandıktan sonra galeride görünecektir.”
- “Katkınız için teşekkür ederiz.”

Metinleri tasarım bütünlüğüne göre daha iyi hale getirebilirsin.

---

# README

README dosyasında şunları anlat:

1. Proje kurulumu
2. Env değişkenleri
3. Supabase database kurulumu
4. Contabo Object Storage kurulumu
5. Bucket ayarları
6. Admin kullanıcı oluşturma
7. Seed data ekleme
8. Local development
9. Production deploy
10. QR kodların nasıl indirileceği
11. Storage limitleri ve öneriler

Contabo için ayrıca şunları yaz:

- Object Storage Europe region önerilir.
- Bucket public/private kararını açıkla.
- Signed upload URL kullanıldığı için direkt server upload yapılmaz.
- Medya URL’leri public base URL üzerinden servis edilir.
- Gerekirse ileride CDN/Cloudflare proxy eklenebilir.

---

# TASARIM KALİTE BEKLENTİSİ

Bu proje sıradan bir upload formu gibi görünmemeli.

Beklentim:
- ana sayfa premium hissettirsin
- event kartları özel hazırlanmış gibi dursun
- upload alanı çok kolay kullanılsın
- admin panel sade ama güçlü olsun
- QR kod sayfaları baskıya uygun olsun
- mobil deneyim çok iyi olsun

Tasarımda “az ama kaliteli” yaklaşımını kullan.

---

# TESLİM ŞEKLİ

Projeyi üretirken şu sırayla ilerle:

1. Kısa proje planı
2. Klasör yapısı
3. Database schema SQL
4. Env örneği
5. Core lib dosyaları
6. Public sayfalar
7. Upload sistemi
8. QR sistemi
9. Admin auth
10. Admin panel
11. README
12. Kurulum ve çalıştırma adımları

Her dosyanın yolunu başlık olarak belirt.
Kodlar birbirleriyle tutarlı, çalışabilir ve eksiksiz olsun.
Placeholder bırakmak zorunda kalırsan nedenini açıkla.
Mümkün olduğunca tek seferde çalışan bir MVP+ üret.

---

# EN ÖNEMLİ KARARLAR

- Medya storage: Contabo Object Storage
- Upload yöntemi: signed URL ile direkt Contabo’ya upload
- Database: Supabase/PostgreSQL
- Public galeri: sadece approved medya
- Admin: auth korumalı
- Tasarım: premium, sade, romantik, modern
- Öncelik: mobil deneyim

Şimdi bu projeyi uçtan uca tasarla ve geliştir.