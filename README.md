# Замдаа

Австри ↔ Монголын хооронд зорчих аялагчид болон ачаа илгээгчдийг холбох платформ.

**Стек:** Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Auth) · Drizzle ORM

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

### 5. Тест дата (заавал биш)

```bash
npm run db:seed
```

`bataa@test.mn` болон `saraa@test.mn` (нууц үг `test12345`) хэрэглэгчид
жишээ зар/ачаатайгаар үүснэ.

### 6. Ажиллуулах

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
    supabase/   # Supabase клиентүүд (server / admin)
    auth.ts     # getCurrentUser / requireUser
    data.ts     # бүх DB query
    actions.ts  # server action-ууд
  proxy.ts      # Supabase session сэргээх (Next 16-д middleware.ts-ийг орлоно)
drizzle/        # SQL migration-ууд
scripts/seed.ts # хөгжүүлэлтийн тест дата
```

## DB командууд

| Команд | Үйлдэл |
|---|---|
| `npm run db:generate` | Schema-гийн өөрчлөлтөөс шинэ migration үүсгэнэ |
| `npm run db:migrate` | Хүлээгдэж буй migration-уудыг ажиллуулна |
| `npm run db:studio` | Drizzle Studio — өгөгдлийг браузераас харах |
| `npm run db:seed` | Тест дата |

## Аюулгүй байдлын тэмдэглэл

Бүх хүснэгт дээр RLS асаалттай бөгөөд policy үүсгээгүй. Өөрөөр хэлбэл Supabase-ийн
нээлттэй REST API-аар (anon түлхүүр) эдгээр хүснэгтэд хандах боломжгүй. Апп нь
`DATABASE_URL`-ээр шууд холбогдож, хандах эрхийн шалгалтыг server action болон
`requireUser` дээр хийдэг. Хэрэв ирээдүйд клиент талаас `supabase-js`-ээр шууд
хандах бол хүснэгт бүрт policy бичих шаардлагатай.
