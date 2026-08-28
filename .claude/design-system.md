# Crowdshipping design system

## The product in one line

A Mongolian peer-to-peer marketplace where travellers with spare luggage space
(`trips`) are matched with people who need something carried (`shipments`),
with messaging, reviews and identity verification around the match.

## Themes

**Light only.** No `.dark` block, no `data-theme`, no `prefers-color-scheme`
colour query anywhere in the source. Do not write `dark:` variants — they are
dead weight here, and a half-built dark theme is worse than none.

Tokens live in `src/app/globals.css`, in a Tailwind v4 `@theme` block. They are
**additive**: Tailwind's stock palette (`slate`, `emerald`, `amber`, `red`)
still works alongside them and is used in real components.

## Colour roles

The palette is taken from the hand-drawn sketches the product uses as
illustration — paper and ink, so the PNG sketches sit *inside* the interface
instead of looking pasted on. That is the reason for every value below, and it
is written down in `globals.css`.

| Token | Role |
| --- | --- |
| `--color-paper` `#f4f4ec` | Page background. The "paper". |
| `--color-card` `#fbfbf6` | Raised surface — cards, panels. Slightly lighter than paper. |
| `--color-ink` `#16204d` | Primary text, headings, and the strong-emphasis fill. |
| `--color-ink-soft` `#59628a` | Secondary text, descriptions, metadata. |
| `--color-stamp` `#b45309` | Price and stamp-like marks. The one warm accent. |

**Ink-with-opacity is the border and tint system.** `border-ink/12` on cards,
`border-ink/10` on rows, `hover:bg-ink/5` on pressable rows, `bg-ink/8` and
`bg-ink/10` for neutral badge fills. There is no separate `--border` token;
do not introduce one, follow the pattern.

**Status colours** live in `Badge`'s `toneCls`, not in the theme block:

- `green` — `bg-emerald-50 text-emerald-700` — active, available
- `amber` — `bg-amber-50 text-amber-700` — matched, or date passed
- `slate` — `bg-ink/8 text-ink-soft` — closed, inactive
- `indigo` — `bg-ink/10 text-ink` — neutral emphasis
- `CountBadge` red — `bg-red-600` with white text — unread counts only

Measured on `--color-card`: ink 15.0, ink-soft 5.7, stamp 4.8, green badge 5.2,
amber badge 4.8, slate badge 4.9, count badge 4.8. All clear AA.

Prohibitions worth stating: `--color-stamp` is for price and stamp marks, not
general emphasis. Red appears only as an unread count. There is no dedicated
"danger" or "destructive" colour yet — see Open gaps.

## Type

**Inter**, via `--font-inter`, one family, no display face. Applied on `body`
and re-declared in the `@theme` `--font-sans`.

The scale in actual use is narrow and worth keeping that way:

| Use | Class |
| --- | --- |
| Page title | `text-2xl font-bold text-ink` |
| Section heading, large | `text-xl font-bold text-ink` |
| Section heading, small | `font-semibold text-ink` (inherits base) |
| Card title | `text-xl font-bold text-ink` |
| Body | base, `text-ink` |
| Description / metadata | `text-sm text-ink-soft` |
| Badge | `text-xs font-medium` |
| Count badge | `text-[11px] font-bold` |

Weights are 500/600/700 only. Headings are `font-bold`, not `font-semibold`.

**Two text tiers, not three.** `text-ink` and `text-ink-soft` — that is all the
palette supports. `text-ink-soft/70` was in use at 33 sites and measured
**3.04:1**, and there is no room to rescue it: `ink-soft` already sits at
5.37:1 on paper, so any value visibly lighter falls under 4.5 (the closest
candidate reaches 4.19). If a third level of quiet is wanted, get it from size
or weight, not from a lighter colour.

## Space and shape

- **Radius:** `rounded-xl` on cards and panels, `rounded-full` on badges. There
  is no radius scale token — `xl` is effectively the house radius.
- **Borders, not shadows.** Surfaces are separated by `border-2 border-ink/12`.
  No `shadow-*` anywhere in the component library. Do not add elevation.
- **Container widths** are a named set in `PageShell`, and this is the strongest
  convention in the codebase — always pick one rather than writing `max-w-*`:

  | Name | Width | For |
  | --- | --- | --- |
  | `form` | `max-w-md` | login, signup |
  | `narrow` | `max-w-xl` | create/edit listing |
  | `reading` | `max-w-2xl` | detail pages, conversations |
  | `list` | `max-w-3xl` | my listings, profile |
  | `wide` | `max-w-5xl` | listings index, home |

- **Page padding:** `px-4` with `py-8`, or `py-12` when `roomy`.
- **Section rhythm:** `mb-6` under a page header, `mb-4`/`mb-3` under a section
  header, `mt-6` and `space-y-2` between blocks.

## Components that already exist

Reuse these before writing anything new. `src/components/ui/`:

- `page-shell` — `PageContainer`, `PageHeader`, `SectionHeader`. **Every page
  starts here.**
- `card` — bordered surface, optional title + description
- `panel` — `Panel`, `PanelRow`, `EmptyState`; the row-list container
- `badge` — `Badge`, `StatusBadge`, `CountBadge`
- `listing-card`, `listing-grid` — the marketplace item and its grid
- `segmented-nav` — tab strip with counts
- `route-filter`, `combobox` — origin/destination filtering
- `form`, `fields`, `phone-field` — form primitives
- `avatar`, `stars`, `review-list` — identity and reputation
- `message-form`, `local-time` — messaging
- `logo`, `sketch-icon`, `social-icons`, `share-buttons`, `lottie-player`

`src/components/layout/`: `navbar`, `mobile-nav`, `footer`, `dropdown`,
`user-menu`, `notification-bell`, `presence-provider`, `realtime-sync`.

## Conventions observed in real screens

- A page is `PageContainer` → `PageHeader` → content. The header carries the
  title, an optional description, and one action on the right.
- Lists are `Panel` + `PanelRow`, not stacks of cards. `PanelRow` with `href`
  is the pressable row.
- **Empty states are a first-class component** (`EmptyState`, with title,
  description and action). Use it; do not write "no data".
- Tabs are `SegmentedNav` with counts baked into each item.
- Filters that cannot apply to the current tab are **removed, not disabled**
  (see `dashboard-view.tsx` dropping the "expired" filter for shipments).
- Copy is Mongolian Cyrillic throughout, including code comments. Budget extra
  width for labels and test the longest realistic string, not the shortest.

## Motion

Sparse and deliberate — 25 uses of `transition`, one `animate-*`. The only real
animation is the home-page hero sketch in `globals.css`:

- `hero-sketch-draw` — 1.5s `cubic-bezier(0.22, 0.61, 0.36, 1)`, a mask sweep
  that "draws" the illustration
- `hero-sketch-walk` — an infinite 2px sway, `ease-in-out`

`prefers-reduced-motion: reduce` is already handled for both. Any new motion
must be added to that block too. Elsewhere, plain `transition` on hover is the
whole vocabulary; match it.

## Open gaps

Places a new design is allowed to invent, deliberately:

- **No destructive/danger colour.** Red exists only as an unread count. Delete
  and cancel flows have no colour language yet.
- **No loading or skeleton treatment** in the component library.
- **No focus-visible convention.** Nothing in `components/ui` sets a focus ring;
  keyboard users currently rely on the browser default.
- **No number, date or currency formatting helper.** No `Intl` or
  `toLocaleString` call anywhere — prices and dates are formatted ad hoc.
- **No dark theme**, and that is a decision, not an omission.
- **No spacing or radius scale tokens** — the values are conventions in the
  components rather than named steps.

## Scope note

`src/views/home/` is a **marketing surface** (`Hero`, `HowItWorks`,
`LatestListings`) and belongs to the `taste-frontend` skill, not this one.
Everything under `my/`, `listings/`, `messages/`, `admin/`, `auth/` and
`settings/` is product UI and belongs to `ui-design`.

---

Probed 2026-08-28 against `1603c74` (main).
