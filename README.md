# Yahtzee Scorekeeper

> Free online Yahtzee scorecard for up to 10 players. Auto-totals, +35 upper bonus, stacked Yahtzee bonuses. No signup, no ads.
>
> Live at <https://yahtzeescorekeeper.com>

A modern, mobile-first Yahtzee scorekeeper built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. State persists to `localStorage` so unfinished games resume on reload.

## Features

- 2–10 players per game
- Tap-only score entry — no typing, no validation errors
- Mobile-first single-player view, desktop table view
- Auto-calculates the +35 upper-section bonus
- Stacks Yahtzee bonuses (×100 each, up to 3)
- Edit or clear any cell after the fact
- Unlimited concurrent games + game history
- Saves to your browser automatically
- Dark glass UI with accessible focus states and keyboard nav

## Getting started

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
- `llms.txt`
- All JSON-LD `@id` and `url` fields

```bash
# .env.production (or your hosting provider's dashboard)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If unset, it defaults to `https://yahtzeescorekeeper.com`.

## SEO / AEO / LLM SEO

This site ships with comprehensive findability tooling:

| Endpoint                | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `/sitemap.xml`          | Auto-generated sitemap                                                          |
| `/robots.txt`           | Crawler config (explicit allow-list for GPTBot, ClaudeBot, PerplexityBot, etc.) |
| `/manifest.webmanifest` | PWA manifest                                                                    |
| `/opengraph-image`      | Dynamic 1200×630 OG image                                                       |
| `/icon` + `/apple-icon` | Dynamic favicon + Apple touch icon                                              |
| `/llms.txt`             | LLM-friendly content surface (proposed standard)                                |

The page renders JSON-LD for `WebSite`, `WebApplication`, `Game`, `HowTo`, `FAQPage`, `BreadcrumbList`, and `Person` schemas.

## Scripts

| Command            | What it does             |
| ------------------ | ------------------------ |
| `npm run dev`      | Start the dev server     |
| `npm run build`    | Production build         |
| `npm run start`    | Run the production build |
| `npm test`         | Run Jest tests           |
| `npm run lint`     | ESLint                   |
| `npm run prettier` | Format with Prettier     |

## Tech

Next.js 14 · React 18 · TypeScript · Tailwind CSS · `react-confetti`

## License

MIT. Yahtzee is a trademark of Hasbro. This site is an unofficial fan-made scorekeeper.
