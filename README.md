# Yahtzee Scorekeeper

> Free online Yahtzee scorecard for up to 10 players. Auto-totals, +35 upper bonus, stacked Yahtzee bonuses. No signup, no ads.
>
> Live at <https://www.yahtzeescorekeeper.com>

A modern, mobile-first Yahtzee scorekeeper built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. State persists to `localStorage` so unfinished games resume on reload.

## Features

- 2–10 players per game, up to 10 games
- Tap-to-pick score entry that only offers legal values (sum boxes also accept a typed total)
- Mobile-first single-player view, desktop table view
- Turn order: only the current player can fill an empty box; anyone can correct or clear a filled one
- Auto-calculates the +35 upper-section bonus
- Stacks Yahtzee bonuses (×100 each, up to 3) once the YAHTZEE box holds 50
- Each game keeps its own player list, so changing players between games doesn't affect earlier games
- Game history with final totals
- Saves to your browser automatically
- Dark glass UI with accessible focus states and keyboard nav

## Getting started

Requires Node.js 24 (pinned in `package.json` `engines`).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Site address

The site's own address is `SITE_URL` in `src/lib/seo.ts`: `https://www.yahtzeescorekeeper.com`, the address the site serves (the apex domain redirects to it). It is a constant, not an environment variable, so no deploy setting can change the canonical. It's used in:

- `<title>` / OG / Twitter / canonical meta tags
- `sitemap.xml`
- `robots.txt`
- `llms.txt` and `llms-full.txt`
- All JSON-LD `@id` and `url` fields

To deploy a fork under another domain, change `SITE_URL` and the tests in `src/__tests__/seo.test.tsx`.

### Domain redirect (Vercel)

In the Vercel project `yahtzee-scorecard`, **Settings → Domains**: `www.yahtzeescorekeeper.com` is the primary domain with no redirect, and `yahtzeescorekeeper.com` redirects to it with **308 Permanent Redirect** (Edit on that row, choose 308, Save). A 307 tells Google the move may be temporary; a 308 matches the canonical. Check with `curl -I https://yahtzeescorekeeper.com`: it should answer `308` with `location: https://www.yahtzeescorekeeper.com/`. In Search Console, the submitted sitemap is `https://www.yahtzeescorekeeper.com/sitemap.xml`.

## How it works

| Path                             | Role                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/lib/scoring.ts`             | Categories, legal values and all totals; the single source used by the UI and the reducer |
| `src/contexts/GameContext.tsx`   | Game state (`useReducer`), turn and bonus rules, migration of older saves                 |
| `src/lib/storage.ts`             | `localStorage` load/save                                                                  |
| `src/app/page.tsx`               | Player setup, game switcher, page layout                                                  |
| `src/components/Scorecard.tsx`   | Scorecard (mobile list + desktop table)                                                   |
| `src/components/ScorePicker.tsx` | Score entry dialog                                                                        |
| `src/lib/seo.ts`                 | Site-wide SEO constants                                                                   |

The saved game loads after the page mounts, so the server-rendered HTML always matches the first client render. The header, SEO content and structured data are server-rendered; the player setup and scorecard appear once the save has loaded.

## SEO / AEO / LLM SEO

This site ships with comprehensive findability tooling:

| Endpoint                    | Purpose                                                                         |
| --------------------------- | ------------------------------------------------------------------------------- |
| `/sitemap.xml`              | Auto-generated sitemap                                                          |
| `/robots.txt`               | Crawler config (explicit allow-list for GPTBot, ClaudeBot, PerplexityBot, etc.) |
| `/manifest.webmanifest`     | PWA manifest                                                                    |
| `/opengraph-image`          | Dynamic 1200×630 OG image                                                       |
| `/icon.svg` + `/apple-icon` | Favicon + dynamic Apple touch icon                                              |
| `/llms.txt`                 | LLM-friendly content surface (proposed standard)                                |
| `/llms-full.txt`            | Full rules, scoring reference, strategy tips, glossary and FAQ                  |

The page renders JSON-LD for `WebSite`, `WebApplication`, `Game`, `HowTo`, `FAQPage`, `BreadcrumbList`, and `Person` schemas.

## Scripts

| Command                  | What it does                     |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start the dev server             |
| `npm run build`          | Production build                 |
| `npm run start`          | Run the production build         |
| `npm test`               | Run Jest tests                   |
| `npm run test:watch`     | Run Jest in watch mode           |
| `npm run test:coverage`  | Run Jest with a coverage report  |
| `npm run lint`           | ESLint                           |
| `npm run lint:css`       | Stylelint                        |
| `npm run prettier`       | Format with Prettier             |
| `npm run prettier:check` | Check formatting without writing |
| `npm run format`         | Format, then lint                |

## Tech

Next.js 14 · React 18 · TypeScript · Tailwind CSS · `react-confetti` · Vercel Analytics · Jest + Testing Library

## License

MIT; see [LICENSE](LICENSE). Yahtzee is a trademark of Hasbro. This site is an unofficial fan-made scorekeeper.
