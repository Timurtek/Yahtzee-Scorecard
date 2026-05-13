import {
  AUTHOR_NAME,
  FAQS,
  HOW_TO_PLAY_STEPS,
  SCORE_CATEGORIES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from '@/lib/seo';

function jsonLd(obj: unknown) {
  return { __html: JSON.stringify(obj).replace(/</g, '\\u003c') };
}

export default function StructuredData() {
  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}#webapp`,
    name: SITE_NAME,
    alternateName: ['Yahtzee Scorecard', 'Yahtzee Score Sheet', 'Yahtzee Score Card'],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Score Tracker',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript and HTML5',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Score up to 10 players per game',
      'Auto-calculates upper-section +35 bonus',
      'Stacks Yahtzee bonuses (×100 each, up to 3)',
      'Saves games automatically in your browser',
      'Works offline after first load',
      'Mobile-first responsive design',
      'No signup, no ads, no tracking',
    ],
    aggregateRating: undefined,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}#how-to-play`,
    name: 'How to Play Yahtzee',
    description:
      'Step-by-step instructions for playing a complete game of Yahtzee using this online scorecard.',
    totalTime: 'PT30M',
    supply: [
      { '@type': 'HowToSupply', name: 'Five dice' },
      { '@type': 'HowToSupply', name: 'A device with a web browser' },
    ],
    tool: [{ '@type': 'HowToTool', name: `${SITE_NAME} (this site)` }],
    step: HOW_TO_PLAY_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${SITE_URL}#step-${i + 1}`,
    })),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}#faq`,
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
    ],
  };

  const game = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    '@id': `${SITE_URL}#game`,
    name: 'Yahtzee',
    alternateName: ['Yatzy', 'Yacht'],
    description:
      'Yahtzee is a classic dice game for 2+ players where you roll five dice up to three times per turn to score in 13 categories. Highest grand total wins.',
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
    },
    gameItem: SCORE_CATEGORIES.map((c) => ({
      '@type': 'Thing',
      name: c.name,
      description: `${c.section} Section · ${c.howToScore}`,
    })),
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}#author`,
    name: AUTHOR_NAME,
    url: SITE_URL,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': `${SITE_URL}#author` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(website)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(webApp)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(game)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(howTo)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faqPage)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbList)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(organization)}
      />
    </>
  );
}
