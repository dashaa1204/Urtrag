# Urtrag

A platform that connects travellers flying between Austria and Mongolia with people who need something shipped.

**Stack:** Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Auth) · Drizzle ORM · Cloudinary (images)

---

## Getting started

### 1. Create a Supabase project

Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
Pick the `eu-central` (Frankfurt) region — it is the closest one to Austria.

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from your Supabase Dashboard:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (keep it secret!) |
| `DATABASE_URL` | Settings → Database → Connection string → Transaction pooler (6543) |
| `DIRECT_URL` | Same place, but port 5432 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | [cloudinary.com](https://cloudinary.com) → Dashboard (the secret stays secret!) |

### 3. Create the tables

```bash
npm run db:migrate
```

This runs the migrations in `drizzle/`, creating the tables, the RLS policies and
the `auth.users` → `profiles` trigger.

### 4. Authentication (email and Google)

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (the real domain in production)
- **Redirect URLs**: add `http://localhost:3000/auth/callback`

That single route serves both signup confirmation and password recovery
(`/auth/callback` decides where to go next from the `?next=` parameter).

> Supabase's free SMTP sends only a handful of emails per hour, and only to
> addresses belonging to team members. Connect your own SMTP (Resend, Postmark,
> etc.) under Authentication → Emails before you work with real users.

**Signing in with Google** needs two extra pieces of setup:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Create credentials → OAuth client ID → Web application**. Under
   *Authorized redirect URIs*, enter Supabase's callback address:
   `https://<project-id>.supabase.co/auth/v1/callback`
   (copy it from Supabase → Authentication → Sign In / Providers → Google).
2. Paste the resulting **Client ID / Client secret** into that Google provider
   and enable it.

The app itself needs no extra environment variables — the button only redirects
to `/auth/callback`, which is already in the Redirect URLs list from step 2.

> A user created through Google arrives without a phone number. They can
> complete their profile at `/settings`.

### 5. File storage

```bash
npm run setup:storage
```

This creates one bucket in Supabase:

- **`identity-docs` (private)** — identity documents. Only the server side
  (service role) can reach them, and moderators get a 5-minute signed URL. The
  file is deleted as soon as a decision is made.

**Profile pictures live on Cloudinary** (`crowdshipping/avatars/<uuid>/<timestamp>`)
— no setup required, the folder is created on the first upload. Images are
delivered through the `f_auto,q_auto,c_fill,g_face,w_160,h_160` transformation,
so a 5 MB file reaches the browser as roughly 15 KB. The `profiles.avatar_path`
column stores the Cloudinary `public_id`; uploading a new picture deletes the
old one.

Moderator access is granted through `ADMIN_USER_IDS` in `.env.local` (user
uuids, comma-separated). Someone with access gets a "Moderation dashboard" link
in their profile menu; for everyone else the whole of `/admin` returns 404 — it
does not even reveal that the page exists.

| Page | What it does |
| --- | --- |
| `/admin` | Overview: user, listing, deal and message counts, plus recent activity |
| `/admin/users` | User list — search by name, see listings/deals/reviews |
| `/admin/listings` | All listings — filter by type/status, close, reopen, delete |
| `/admin/deals` | Deals by status. Only the message COUNT is shown, never the content |
| `/admin/verifications` | Review identity document requests |
| `/admin/log` | Moderator action history — who, when, what |

Because moderators act on other people's listings, every action is written to
the `admin_actions` table (closing/reopening/deleting a listing, approving or
rejecting a document). The log is append-only: there is no path in the app to
edit or delete an entry. The moderator's name is copied in as it was at the
time, with no FK into `profiles` — the record must outlive the person who
created it.

### 6. Test data (optional)

```bash
npm run db:seed
```

Creates the users `bataa@test.mn` and `saraa@test.mn` (password `test12345`)
along with sample listings and parcels.

### 7. Run it

```bash
npm run dev
```

---

## Structure

```
src/
  app/          # routing only — thin pages
  views/        # the main UI for each page (+ components/)
  components/   # shared layout / ui
  lib/
    db/         # Drizzle schema + Postgres connection
    supabase/   # Supabase clients (server / admin / client — realtime)
    cloudinary.ts # image upload / delete (server side)
    avatar.ts   # public_id → delivery URL
    auth.ts     # getCurrentUser / requireUser / requireAdmin
    data.ts     # every DB query
    actions.ts  # server actions
    admin-data.ts    # moderator-only queries (overview, lists)
    admin-actions.ts # moderator-only actions (on other people's listings)
  proxy.ts      # refreshes the Supabase session (replaces middleware.ts in Next 16)
drizzle/        # SQL migrations
scripts/        # seed.ts (test data), setup-storage.ts (bucket)
```

## DB commands

| Command | What it does |
|---|---|
| `npm run db:generate` | Generates a new migration from schema changes |
| `npm run db:migrate` | Runs the pending migrations |
| `npm run db:studio` | Drizzle Studio — browse the data from the browser |
| `npm run db:seed` | Test data |
| `npm run setup:storage` | Creates the private document bucket |

## Security notes

RLS is enabled on every table. The app connects directly through `DATABASE_URL`
and does its authorization checks in the server actions and in `requireUser`.

Policies exist only on `conversations`, `messages` and `reviews`, and only for
SELECT — the first two for the participants of a conversation, `reviews` for the
person who received the review. They are required so that realtime notifications
can be filtered per Supabase user (see the section below). The remaining tables
have no policies, so nothing can be read through the public REST API with the
anon key; INSERT / UPDATE / DELETE are equally closed on every table.

## Realtime

When a new message or review arrives, `RealtimeSync` (inside the navbar) listens
to the `messages` (INSERT / UPDATE) and `reviews` (INSERT) tables over Supabase
Realtime and calls `router.refresh()`. Nothing is assembled on the client — the
server re-renders, so the unread counter, the notifications, the inbox and any
open conversation all update at once, and the authorization checks stay on the
server.

The client does not pick which rows it receives — the
`messages_select_participant` and `reviews_select_reviewee` policies make sure an
unrelated user never gets the notification at all. On a fresh Supabase project,
migrations `0007` and `0008` add `messages` and `reviews` to the
`supabase_realtime` publication.

The notification bell shows the unread count from `reviews.read_at` — opening the
bell marks everything as seen. If a review is edited, `read_at` is cleared again
and the notification comes back.

Online status (`PresenceProvider`) and the "typing" indicator never touch the
database — they run purely over Realtime's presence / broadcast channels.
