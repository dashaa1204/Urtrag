# Уртраг

Австри ↔ Монголын хооронд зорчих аялагчид болон ачаа илгээгчдийг холбох платформ.

**Стек:** Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Auth) · Drizzle ORM · Cloudinary (зураг)

---

## Эхлүүлэх

### 1. Supabase төсөл үүсгэх

[supabase.com/dashboard](https://supabase.com/dashboard) дээр шинэ төсөл үүсгэнэ.
Бүс нутгаар `eu-central` (Frankfurt) сонговол Австриас хамгийн ойр.

### 2. Орчны хувьсагч

```bash
cp .env.example .env.local
```

`.env.local`-г Supabase Dashboard-оос авсан утгуудаар дүүргэнэ:

| Хувьсагч | Хаанаас авах |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (нууц!) |
| `DATABASE_URL` | Settings → Database → Connection string → Transaction pooler (6543) |
| `DIRECT_URL` | Мөн тэндээс, харин порт 5432 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | [cloudinary.com](https://cloudinary.com) → Dashboard (secret нь нууц!) |

### 3. Хүснэгтүүдийг үүсгэх

```bash
npm run db:migrate
```

Энэ нь `drizzle/` доторх migration-уудыг ажиллуулж, хүснэгт, RLS болон
`auth.users` → `profiles` trigger-ийг үүсгэнэ.

### 4. Имэйл баталгаажуулалт ба нууц үг сэргээх

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (production дээр жинхэнэ домэйн)
- **Redirect URLs**: `http://localhost:3000/auth/callback` нэмэх

Энэ нэг зам нь бүртгэл баталгаажуулах болон нууц үг сэргээх хоёуланд үйлчилнэ
(`/auth/callback` нь `?next=` параметрээр дараагийн хуудсыг шийднэ).

> Supabase-ийн үнэгүй SMTP нь цагт хэдхэн имэйл л илгээдэг бөгөөд зөвхөн
> баг гишүүдийн хаяг руу явдаг. Жинхэнэ хэрэглэгчидтэй ажиллахын өмнө
> Authentication → Emails хэсэгт өөрийн SMTP (Resend, Postmark г.м.) холбоно уу.

### 5. Файлын хадгалалт

```bash
npm run setup:storage
```

Supabase дээр нэг bucket үүсгэнэ:

- **`identity-docs` (хаалттай)** — иргэний баримт. Зөвхөн сервер тал (service
  role) хандаж, хянагчид 5 минутын signed URL үүсгэнэ. Шийдвэр гармагц устна.

**Профайлын зураг нь Cloudinary дээр** (`crowdshipping/avatars/<uuid>/<timestamp>`)
— тохируулга шаардахгүй, эхний байршуулалт дээр хавтас нь өөрөө үүснэ. Зургийг
`f_auto,q_auto,c_fill,g_face,w_160,h_160` хувиргалтаар хүргэдэг тул 5МБ файл
браузарт ~15КБ болж ирнэ. `profiles.avatar_path` баганад Cloudinary-ийн
`public_id` хадгалагдана; шинэ зураг тавихад хуучин нь устна.

Хүсэлт шалгах эрхийг `.env.local` дахь `ADMIN_USER_IDS`-ээр өгнө (хэрэглэгчийн
uuid, таслалаар тусгаарлана). Шалгах хуудас: `/admin/verifications` — эрхгүй
хүнд 404 буцаана.

### 6. Тест дата (заавал биш)

```bash
npm run db:seed
```

`bataa@test.mn` болон `saraa@test.mn` (нууц үг `test12345`) хэрэглэгчид
жишээ зар/ачаатайгаар үүснэ.

### 7. Ажиллуулах

```bash
npm run dev
```

---

## Бүтэц

```
src/
  app/          # зөвхөн routing — нимгэн page-үүд
  views/        # хуудас тус бүрийн үндсэн UI (+ components/)
  components/   # хуваалцсан layout / ui
  lib/
    db/         # Drizzle schema + Postgres холболт
    supabase/   # Supabase клиентүүд (server / admin / client — realtime)
    cloudinary.ts # зураг байршуулах / устгах (сервер тал)
    avatar.ts   # public_id → хүргэх URL
    auth.ts     # getCurrentUser / requireUser
    data.ts     # бүх DB query
    actions.ts  # server action-ууд
  proxy.ts      # Supabase session сэргээх (Next 16-д middleware.ts-ийг орлоно)
drizzle/        # SQL migration-ууд
scripts/         # seed.ts (тест дата), setup-storage.ts (bucket)
```

## DB командууд

| Команд | Үйлдэл |
|---|---|
| `npm run db:generate` | Schema-гийн өөрчлөлтөөс шинэ migration үүсгэнэ |
| `npm run db:migrate` | Хүлээгдэж буй migration-уудыг ажиллуулна |
| `npm run db:studio` | Drizzle Studio — өгөгдлийг браузераас харах |
| `npm run db:seed` | Тест дата |
| `npm run setup:storage` | Баримтын хаалттай bucket үүсгэнэ |

## Аюулгүй байдлын тэмдэглэл

Бүх хүснэгт дээр RLS асаалттай. Апп нь `DATABASE_URL`-ээр шууд холбогдож, хандах
эрхийн шалгалтыг server action болон `requireUser` дээр хийдэг.

Policy нь зөвхөн `conversations`, `messages`, `reviews` дээр, зөвхөн SELECT-д
байдаг — эхний хоёрт нь харилцан ярианы оролцогчид, `reviews` дээр үнэлгээ авсан
хүн өөрөө. Энэ нь realtime мэдэгдлийг Supabase хэрэглэгч бүрээр шүүхэд
шаардлагатай (доорх хэсгийг үзнэ үү). Бусад хүснэгт policy-гүй тул нээлттэй REST
API-аар (anon түлхүүр) юу ч уншигдахгүй; INSERT / UPDATE / DELETE нь бүх хүснэгт
дээр мөн адил хаалттай.

## Realtime

Шинэ мессеж, үнэлгээ орж ирэхэд `RealtimeSync` (navbar доторх) нь Supabase
Realtime-аар `messages` (INSERT / UPDATE) ба `reviews` (INSERT) хүснэгтийг
сонсоод `router.refresh()` дуудна. Өгөгдлийг клиент дээр угсрахгүй — сервер дахин
render хийдэг тул уншаагүйн тоолуур, мэдэгдэл, inbox, нээлттэй харилцан яриа нэг
дор шинэчлэгдэж, эрхийн шалгалт сервер талдаа хэвээр үлддэг.

Клиент нь ямар мөр авахаа өөрөө шүүхгүй — `messages_select_participant` болон
`reviews_select_reviewee` policy нь хамааралгүй хүнд мэдэгдэл огт хүргэхгүй. Шинэ
Supabase төсөл дээр `0007`, `0008` migration нь `messages`, `reviews`-ийг
`supabase_realtime` publication-д нэмнэ.

Мэдэгдлийн хонх нь `reviews.read_at`-аар уншаагүйн тоог харуулна — хонх нээгдмэгц
бүх мэдэгдэл үзсэнд тооцогдоно. Үнэлгээ засварлагдвал `read_at` дахин хоосорч
мэдэгдэл сэргэнэ.

Идэвхтэй төлөв (`PresenceProvider`) болон "бичиж байна" дохио нь өгөгдлийн санг
огт хөндөхгүй — Realtime-ийн presence / broadcast сувгаар л явна.
