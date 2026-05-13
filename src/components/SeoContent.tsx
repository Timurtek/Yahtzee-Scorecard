import React from 'react';
import { FAQS, HOW_TO_PLAY_STEPS, SCORE_CATEGORIES } from '@/lib/seo';

export default function SeoContent() {
  const upper = SCORE_CATEGORIES.filter((c) => c.section === 'Upper');
  const lower = SCORE_CATEGORIES.filter((c) => c.section === 'Lower');

  return (
    <article className="flex flex-col gap-12 pt-6" aria-label="Yahtzee rules and reference">
      {/* How to play */}
      <section id="how-to-play" aria-labelledby="how-to-play-heading">
        <header className="mb-5 flex flex-col gap-2">
          <span className="chip w-fit">Guide</span>
          <h2
            id="how-to-play-heading"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            How to play Yahtzee
          </h2>
          <p className="max-w-2xl text-base text-slate-300">
            Yahtzee is a classic dice game where you roll five dice up to three times per turn,
            trying to score in 13 categories. Here is the complete flow using this scorekeeper.
          </p>
        </header>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HOW_TO_PLAY_STEPS.map((step, i) => (
            <li key={step.name} id={`step-${i + 1}`} className="glass flex gap-4 rounded-2xl p-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 font-display text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-base font-bold text-white">{step.name}</h3>
                <p className="text-sm text-slate-300">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Scoring guide */}
      <section id="scoring-guide" aria-labelledby="scoring-guide-heading">
        <header className="mb-5 flex flex-col gap-2">
          <span className="chip w-fit">Reference</span>
          <h2
            id="scoring-guide-heading"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Yahtzee scoring guide
          </h2>
          <p className="max-w-2xl text-base text-slate-300">
            All 13 categories, what they score, and an example for each. This scorekeeper enforces
            valid values so you can&apos;t accidentally enter an impossible score.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CategoryTable
            title="Upper section"
            subtitle="Score the sum of matching dice. Reach 63 for a +35 bonus."
            categories={upper}
          />
          <CategoryTable
            title="Lower section"
            subtitle="Special combinations with fixed or summed values."
            categories={lower}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Callout
            title="Upper-section bonus"
            body="Score 63 or more across Aces through Sixes and earn an automatic +35. The threshold matches three of each number (3 each of 1–6)."
          />
          <Callout
            title="Yahtzee bonus"
            body="After your first Yahtzee (50 pts), each additional Yahtzee awards +100. You can stack up to three bonus Yahtzees for 300 extra points."
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading">
        <header className="mb-5 flex flex-col gap-2">
          <span className="chip w-fit">FAQ</span>
          <h2
            id="faq-heading"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Frequently asked questions
          </h2>
        </header>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <details
              key={faq.q}
              className="glass group rounded-2xl"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 font-display text-base font-bold text-white list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                <span>{faq.q}</span>
                <ChevronIcon className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed text-slate-300">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}

function CategoryTable({
  title,
  subtitle,
  categories,
}: {
  title: string;
  subtitle: string;
  categories: typeof SCORE_CATEGORIES;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <header className="border-b border-white/5 bg-white/[0.04] px-5 py-3">
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </header>
      <ul className="divide-y divide-white/5">
        {categories.map((c) => (
          <li key={c.name} className="px-5 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-display text-base font-bold text-white">{c.name}</h4>
              <span className="font-display text-sm font-semibold text-emerald-300">
                max {c.maxScore}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-300">{c.howToScore}</p>
            <p className="mt-1 text-xs italic text-slate-500">{c.example}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Callout({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-display text-base font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
