import {
  AUTHOR_NAME,
  DATE_MODIFIED,
  DATE_PUBLISHED,
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
} from '@/lib/seo';

function jsonLd(obj: unknown) {
  return { __html: JSON.stringify(obj).replace(/</g, '\\u003c') };
}

const OG_IMAGE = `${SITE_URL}/opengraph-image`;

export default function StructuredData() {
  const author = {
    '@type': 'Person',
    '@id': `${SITE_URL}#author`,
    name: AUTHOR_NAME,
    url: SITE_URL,
  };

  const image = {
    '@type': 'ImageObject',
    url: OG_IMAGE,
    width: 1200,
    height: 630,
    caption: `${SITE_NAME} — ${SITE_TAGLINE}`,
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
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image,
    // Voice-assistant friendly content regions
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        '#how-to-play-heading',
        '#scoring-guide-heading',
        '#faq-heading',
        '#what-is-yahtzee',
      ],
    },
  };

  const webApp = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': `${SITE_URL}#webapp`,
    name: SITE_NAME,
    alternateName: ['Yahtzee Scorecard', 'Yahtzee Score Sheet', 'Yahtzee Score Card'],
    url: SITE_URL,
    mainEntityOfPage: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Score Tracker',
    operatingSystem: 'Web, iOS, Android, Windows, macOS, Linux',
    browserRequirements: 'Requires JavaScript and HTML5',
    softwareVersion: '1.0',
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Score up to 10 players per game',
      'Auto-calculates upper-section +35 bonus',
      'Stacks Yahtzee bonuses (×100 each, up to 3)',
      'Tap-only score entry, no typing',
      'Edit or clear any cell after the fact',
      'Saves games automatically in your browser',
      'Works offline after first load',
      'Mobile-first responsive design',
      'No signup, no ads, no tracking',
    ],
    author,
  };

  const game = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    '@id': `${SITE_URL}#game`,
    name: 'Yahtzee',
    alternateName: ['Yatzy', 'Yacht', 'Yatzee'],
    description: DEFINITION.short,
    image,
    sameAs: [SAME_AS.wikipedia, SAME_AS.boardGameGeek, SAME_AS.hasbro],
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
    },
    gamePlatform: 'Web Browser',
    gameItem: SCORE_CATEGORIES.map((c) => ({
      '@type': 'Thing',
      name: c.name,
      description: `${c.section} Section · ${c.howToScore}`,
    })),
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}#how-to-play`,
    name: 'How to Play Yahtzee',
    description:
      'Step-by-step instructions for playing a complete game of Yahtzee using this online scorecard.',
    image,
    totalTime: 'PT30M',
    mainEntityOfPage: `${SITE_URL}/#how-to-play`,
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
    mainEntityOfPage: `${SITE_URL}/#faq`,
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const glossary = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}#glossary`,
    name: 'Yahtzee Glossary',
    description: 'Definitions of common Yahtzee terms and scoring categories.',
    hasDefinedTerm: GLOSSARY.map((g) => ({
      '@type': 'DefinedTerm',
      name: g.term,
      description: g.definition,
      inDefinedTermSet: { '@id': `${SITE_URL}#glossary` },
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

  const authorEntity = {
    '@context': 'https://schema.org',
    ...author,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(website)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(webApp)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(game)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(howTo)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqPage)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(glossary)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbList)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(authorEntity)} />
    </>
  );
}
