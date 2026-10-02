# Yahtzee Scorekeeper

> Free online Yahtzee scorecard for up to 10 players. Auto-totals, +35 upper bonus, stacked Yahtzee bonuses. No signup, no ads.
>
> Live at <https://yahtzeescorekeeper.com>

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

### Required environment variable for production

Set `NEXT_PUBLIC_SITE_URL` to your deployed canonical URL before building. It's used in:

- `<title>` / OG / Twitter / canonical meta tags
- `sitemap.xml`
- `robots.txt`
- `llms.txt` and `llms-full.txt`
- All JSON-LD `@id` and `url` fields

```bash
# .env.production (or your hosting provider's dashboard)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If unset, it defaults to `https://yahtzeescorekeeper.com`.

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

Next.js 14 · React 18 · TypeScript · Tailwind CSS · `react-confetti` · Jest + Testing Library

## License

MIT. Yahtzee is a trademark of Hasbro. This site is an unofficial fan-made scorekeeper.
