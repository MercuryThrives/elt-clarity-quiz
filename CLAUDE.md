# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- **`main` is production.** Vercel deploys every push to `main` straight to the live site, so anything pushed to `main` goes live immediately.
- **Run `npm run build` before every commit**, and don't commit if it fails.
- **Always ask before running SQL or applying migrations against Supabase**, including through the Supabase MCP tools (`execute_sql`, `apply_migration`). The project is the live production database.
- **Never use em-dashes (—) in any copy**: UI text, email templates, or page content. Use a comma, period, colon, or parentheses instead.

## Commands

```bash
npm run dev        # Next.js dev server (localhost:3000)
npm run build      # production build
npm run lint       # eslint (flat config, eslint-config-next)
npm test           # vitest run (all tests)
npx vitest run src/lib/sc/scScoring.test.ts   # single test file
npx vitest run -t "name of test"              # single test by name
```

Tests are plain Node-environment vitest (no DOM) and cover only the pure scoring logic (`src/lib/quiz/snf-scoring.test.ts`, `src/lib/sc/scScoring.test.ts`).

## What this is

A Next.js 16 (App Router, React 19, Tailwind v4) app for Elder Life Transitions (ELT) that hosts several independent lead-generation funnels (quizzes, calculators, booking pages). It deploys to Vercel from `main` and uses Supabase (Postgres) for storage and Resend for email. Path alias: `@/*` → `src/*`.

## Funnels and subdomain routing

`src/middleware.ts` rewrites the **root path only** of each subdomain to a funnel route. Every other path is served as normal, so all funnels can also be reached directly on any host.

| Host | Root rewrites to | Funnel |
|---|---|---|
| `transition.*` | `/snf` | SNF (skilled nursing facility discharge) quiz → `/snf/results` |
| `rm.elderlifetransitions.net` | `/funding/reverse-mortgage` | Reverse-mortgage funding quiz |
| `sc.elderlifetransitions.net` | `/sc` | Senior Care Clarity quiz (`/sc/quiz` → `/sc/results`) |
| `runway.elderlifetransitions.net` | `/runway` | Care-cost "runway" calculator (multi-screen, `src/components/runway/`) |
| `review.elderlifetransitions.net` | `/memory-care-review` | Memory Care Review booking page (Calendly) → `/thank-you` |
| (default) | `/` | HCA (Home Care Agency) Clarity Quiz: `/` → `/quiz` → `/quiz/results` |

`/[facility]` is a catch-all that redirects to `/snf?partner=<facility>`, so short facility URLs work. `/lp` is a standalone landing page.

## Partner attribution

Funnels are white-labeled for referral partners. The partner ID arrives as `?partner=<id>`, is validated with `normalizePartnerId` (`src/lib/partner.ts`), and is persisted in an `elt_partner` cookie (120 days). Partner display info is read client-side from the `public_partners` Supabase view via the anon client (`PartnerHeader`, `SCHeader`). Server actions look up the full `partners` row with the service-role client.

## Quiz track abstraction

`src/lib/quiz/track.ts` defines `TrackConfig` and `resolveTrack()`, which maps a track id (`hca`, `snf`, `funding-rm`, `senior_care`) to its questions, guide content and scoring functions. HCA and SNF use it fully. `funding-rm` and `senior_care` carry stub scoring because they have their own results pages and scoring modules (`src/lib/quiz/funding-rm-scoring.ts`, `src/lib/sc/scScoring.ts`). Quiz answers live only in React context (`QuizStore.tsx`) during the session, by design for privacy minimization, and are not persisted client-side.

Content and copy are split by funnel:
- HCA: `src/lib/quiz/questions.ts` (canonical, locked question library), `scoring.ts`, `src/lib/guideContent.ts`
- SNF: `src/lib/quiz/snf-config.ts`, `snf-scoring.ts`, `src/lib/snf-pathway-content.ts`
- SC: `src/lib/sc/scScoring.ts`, `scPathwayContent.ts`, UI in `src/components/sc/`
- Funding RM: `src/lib/funding-rm-questions.ts`, `funding-rm-content.ts`
- All transactional email HTML: `src/lib/emailTemplates.ts`

## Data and email flow

Submissions are written by server actions in `src/app/actions/*` using `supabaseAdmin` (`src/lib/supabase/admin.ts`, which is `server-only` and service-role). Never import it into client components; use `supabaseBrowser` (anon key) there instead.

- Most funnels insert into the shared `submissions` table, distinguished by `partner_type` (`snf`, `senior_care`, `funding-rm`; null/absent for HCA). Flags such as `snf_followup_sent`, `sc_followup_sent` and `was_clicked` drive the follow-up crons.
- The runway calculator writes to a separate `runway_leads` table.
- After the insert, each action sends emails via Resend: a report or guide to the family, plus internal notifications to the address in a per-funnel env var.

Follow-up emails are sent by Vercel crons defined in `vercel.json`: `/api/cron/snf-followup` and `/api/cron/sc-followup`. Each queries submissions older than 48h that are not yet followed up and not clicked. They are protected by `Authorization: Bearer $CRON_SECRET` when that var is set. `/api/cron/runway-followup` is a stub and is not scheduled.

Schema migrations live in `supabase/migrations/`. The Supabase MCP server is configured (`.mcp.json`) for inspecting and migrating the remote project.

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_RUNWAY_BOOKING_URL`, and the notification recipients `ELT_NOTIFICATION_EMAIL`, `SNF_NOTIFICATION_EMAIL`, `SC_NOTIFICATION_EMAIL`, `RM_NOTIFICATION_EMAIL`, `RUNWAY_NOTIFICATION_EMAIL`. Both Supabase client modules throw at import time if their vars are missing. Local values are in `.env.local` (gitignored).

## Styling

The HCA, SNF, SC and funding quizzes use Tailwind classes. The newer standalone pages (`/runway`, `/memory-care-review`, `/lp`, `/thank-you`) use inline `CSSProperties` style objects instead (see `src/components/runway/styles.ts`). Match whichever convention the file you're editing already uses.

## Copy rules

`docs/build-log.md` is the running history and spec log. Tier and results messaging is treated as **locked copy**: don't reword it unless asked. A banned-word list is enforced across UI copy. The one documented exception is the word "needs" inside the HCA Tier 3 required paragraph.
