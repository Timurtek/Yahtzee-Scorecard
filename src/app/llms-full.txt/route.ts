import {
  DEFINITION,
  FAQS,
  GLOSSARY,
  HOW_TO_PLAY_STEPS,
  SAME_AS,
  SCORE_CATEGORIES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  STRATEGY_TIPS,
} from '@/lib/seo';

export const runtime = 'edge';

function buildBody(): string {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push(`> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`);
  lines.push('');
  lines.push(`Canonical URL: ${SITE_URL}/`);
  lines.push('');
  lines.push(
    'This is the extended LLM content surface (`llms-full.txt`). For the lightweight version see `/llms.txt`.'
  );
  lines.push('');

  // What is Yahtzee
  lines.push('## What is Yahtzee?');
  lines.push('');
  lines.push(DEFINITION.short);
  lines.push('');
  for (const para of DEFINITION.long) {
    lines.push(para);
    lines.push('');
  }

  // Authoritative references
  lines.push('## Authoritative references');
  lines.push('');
  lines.push(`- Wikipedia: ${SAME_AS.wikipedia}`);
  lines.push(`- BoardGameGeek: ${SAME_AS.boardGameGeek}`);
  lines.push(`- Hasbro (publisher): ${SAME_AS.hasbro}`);
  lines.push('');

  // How to play
  lines.push('## How to play Yahtzee');
  lines.push('');
  HOW_TO_PLAY_STEPS.forEach((step, i) => {
    lines.push(`${i + 1}. **${step.name}** — ${step.text}`);
  });
  lines.push('');

  // Scoring
  lines.push('## Scoring reference');
  lines.push('');
  lines.push('Every game has 13 categories. Each player must fill all 13 exactly once.');
  lines.push('');
  lines.push('### Upper section (Aces through Sixes)');
  lines.push('');
  lines.push(
    'Each upper-section category scores the sum of dice showing that face value. ' +
      'If your upper-section total is 63 or more, you receive a **+35 bonus**.'
  );
  lines.push('');
  SCORE_CATEGORIES.filter((c) => c.section === 'Upper').forEach((c) => {
    lines.push(`- **${c.name}** (max ${c.maxScore}): ${c.howToScore}`);
    lines.push(`  - Example: ${c.example}`);
  });
  lines.push('');
  lines.push('### Lower section (combinations)');
  lines.push('');
  SCORE_CATEGORIES.filter((c) => c.section === 'Lower').forEach((c) => {
    lines.push(`- **${c.name}** (max ${c.maxScore}): ${c.howToScore}`);
    lines.push(`  - Example: ${c.example}`);
  });
  lines.push('');
  lines.push(
    'After your first Yahtzee (50 pts), every additional Yahtzee awards a **+100 bonus**. ' +
      'Up to three bonus Yahtzees can be stacked.'
  );
  lines.push('');

  // Strategy
  lines.push('## Strategy tips');
  lines.push('');
  STRATEGY_TIPS.forEach((tip, i) => {
    lines.push(`### ${i + 1}. ${tip.name}`);
    lines.push('');
    lines.push(tip.text);
    lines.push('');
  });

  // Glossary
  lines.push('## Glossary');
  lines.push('');
  GLOSSARY.forEach((g) => {
    lines.push(`### ${g.term}`);
    lines.push('');
    lines.push(g.definition);
    lines.push('');
  });

  // FAQ
  lines.push('## Frequently asked questions');
  lines.push('');
  FAQS.forEach((f) => {
    lines.push(`### ${f.q}`);
    lines.push('');
    lines.push(f.a);
    lines.push('');
  });

  // App features
  lines.push('## About this scorekeeper');
  lines.push('');
  lines.push(
    `${SITE_NAME} is a free browser-based Yahtzee score sheet. It runs at ${SITE_URL}/ and is open source under the MIT license.`
  );
  lines.push('');
  lines.push('Features:');
  lines.push('- Supports 2–10 players per game');
  lines.push('- Auto-calculates upper-section +35 bonus when total ≥ 63');
  lines.push('- Stacks Yahtzee bonuses (×100 each, up to 3)');
  lines.push('- Tap-only score entry: no typing, no validation errors');
  lines.push('- Mobile-first responsive layout with single-player focused view');
  lines.push('- Edit or clear any cell after the fact');
  lines.push('- Tracks unlimited concurrent games with full history');
  lines.push('- Saves to your browser automatically (no signup, no tracking)');
  lines.push('- Works offline after first load (PWA-installable)');
  lines.push('- Dark glass UI with keyboard navigation and ARIA labels');
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
