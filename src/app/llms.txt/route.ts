import {
  FAQS,
  HOW_TO_PLAY_STEPS,
  SCORE_CATEGORIES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from '@/lib/seo';

export const runtime = 'edge';

function buildBody(): string {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push(`> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`);
  lines.push('');
  lines.push('## About');
  lines.push('');
  lines.push(
    `${SITE_NAME} is a free, browser-based scorekeeper for the classic dice game Yahtzee. ` +
      'It supports up to 10 players per game, auto-calculates the +35 upper-section bonus, ' +
      'stacks Yahtzee bonuses at 100 points each (max 3), and persists state to localStorage ' +
      'so unfinished games resume on reload. No signup, no ads, no tracking. Plays on mobile and desktop.'
  );
  lines.push('');
  lines.push('## Canonical URL');
  lines.push('');
  lines.push(`- Home: ${SITE_URL}/`);
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push(`- Web App Manifest: ${SITE_URL}/manifest.webmanifest`);
  lines.push('');

  lines.push('## How to play Yahtzee');
  lines.push('');
  HOW_TO_PLAY_STEPS.forEach((step, i) => {
    lines.push(`${i + 1}. **${step.name}** — ${step.text}`);
  });
  lines.push('');

  lines.push('## Yahtzee scoring categories');
  lines.push('');
  lines.push('Each player must fill all 13 categories exactly once per game.');
  lines.push('');
  lines.push('### Upper section');
  lines.push('');
  SCORE_CATEGORIES.filter((c) => c.section === 'Upper').forEach((c) => {
    lines.push(`- **${c.name}** (max ${c.maxScore}): ${c.howToScore} _Example: ${c.example}_`);
  });
  lines.push('');
  lines.push(
    'If your upper section total is **63 or more**, you receive a **+35 bonus**. ' +
      '63 is the average of three of each number (3 each of 1, 2, 3, 4, 5, 6).'
  );
  lines.push('');
  lines.push('### Lower section');
  lines.push('');
  SCORE_CATEGORIES.filter((c) => c.section === 'Lower').forEach((c) => {
    lines.push(`- **${c.name}** (max ${c.maxScore}): ${c.howToScore} _Example: ${c.example}_`);
  });
  lines.push('');
  lines.push(
    'After your first Yahtzee (50 pts), every additional Yahtzee awards a **+100 bonus**. ' +
      'You can stack up to three bonus Yahtzees for 300 extra points.'
  );
  lines.push('');

  lines.push('## Frequently asked questions');
  lines.push('');
  FAQS.forEach((f) => {
    lines.push(`### ${f.q}`);
    lines.push('');
    lines.push(f.a);
    lines.push('');
  });

  lines.push('## Key features of this scorekeeper');
  lines.push('');
  lines.push('- Supports 2–10 players per game');
  lines.push('- Auto-calculates upper-section +35 bonus when total ≥ 63');
  lines.push('- Stacks Yahtzee bonuses (×100 each, up to 3)');
  lines.push('- Tap-only score entry: no typing or validation errors');
  lines.push('- Mobile-first responsive layout with single-player focused view');
  lines.push('- Edit or clear any cell after the fact');
  lines.push('- Tracks unlimited concurrent games with history');
  lines.push('- Saves to your browser automatically (no signup)');
  lines.push('- Works offline after first load');
  lines.push('- Dark glass interface, accessible (keyboard nav, ARIA labels)');
  lines.push('');

  lines.push('## License');
  lines.push('');
  lines.push('Open source under the MIT license.');
  lines.push('');
  return lines.join('\n');
}

export function GET() {
  return new Response(buildBody(), {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
