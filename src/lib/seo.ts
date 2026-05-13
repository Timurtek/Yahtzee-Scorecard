/**
 * Central SEO config. Set NEXT_PUBLIC_SITE_URL on deploy.
 * All metadata, JSON-LD, sitemap, robots, and llms.txt pull from here.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://yahtzee-scorecard.app';

export const SITE_NAME = 'Yahtzee Scorecard';

export const SITE_TAGLINE = 'Free Online Yahtzee Score Sheet & Scorekeeper';

export const SITE_DESCRIPTION =
  'Free online Yahtzee scorecard for up to 10 players. Auto-calculates totals, +35 upper bonus, Yahtzee bonus stacks, and saved automatically. Plays in your browser — no signup, no ads.';

export const SITE_SHORT_DESCRIPTION =
  'A modern, free, no-signup Yahtzee scorecard that auto-totals your game.';

export const AUTHOR_NAME = 'Timurtek';

export const KEYWORDS = [
  'yahtzee scorecard',
  'yahtzee score sheet',
  'yahtzee scorekeeper',
  'yahtzee score card',
  'online yahtzee scorecard',
  'free yahtzee scorecard',
  'yahtzee scoring',
  'yahtzee score tracker',
  'yahtzee score calculator',
  'digital yahtzee score sheet',
  'yahtzee rules',
  'how to score yahtzee',
  'yahtzee categories',
  'yahtzee upper section bonus',
  'yahtzee bonus',
];

/* ---------------- Yahtzee scoring reference ---------------- */

export type ScoreCategory = {
  name: string;
  section: 'Upper' | 'Lower';
  howToScore: string;
  maxScore: number;
  example: string;
};

export const SCORE_CATEGORIES: ScoreCategory[] = [
  {
    name: 'Aces',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 1. Multiples of 1, range 0–5.',
    maxScore: 5,
    example: 'Roll 1-1-1-3-5 → score 3 in Aces.',
  },
  {
    name: 'Twos',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 2. Multiples of 2, range 0–10.',
    maxScore: 10,
    example: 'Roll 2-2-4-5-6 → score 4 in Twos.',
  },
  {
    name: 'Threes',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 3. Multiples of 3, range 0–15.',
    maxScore: 15,
    example: 'Roll 3-3-3-1-6 → score 9 in Threes.',
  },
  {
    name: 'Fours',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 4. Multiples of 4, range 0–20.',
    maxScore: 20,
    example: 'Roll 4-4-4-4-2 → score 16 in Fours.',
  },
  {
    name: 'Fives',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 5. Multiples of 5, range 0–25.',
    maxScore: 25,
    example: 'Roll 5-5-5-2-3 → score 15 in Fives.',
  },
  {
    name: 'Sixes',
    section: 'Upper',
    howToScore: 'Sum of all dice showing 6. Multiples of 6, range 0–30.',
    maxScore: 30,
    example: 'Roll 6-6-6-6-1 → score 24 in Sixes.',
  },
  {
    name: '3 of a Kind',
    section: 'Lower',
    howToScore: 'At least three dice the same. Score the sum of all five dice.',
    maxScore: 30,
    example: 'Roll 4-4-4-5-6 → score 23 (sum of all dice).',
  },
  {
    name: '4 of a Kind',
    section: 'Lower',
    howToScore: 'At least four dice the same. Score the sum of all five dice.',
    maxScore: 30,
    example: 'Roll 5-5-5-5-2 → score 22 (sum of all dice).',
  },
  {
    name: 'Full House',
    section: 'Lower',
    howToScore: 'Three of a kind plus a pair. Score 25 (or 0 if not achieved).',
    maxScore: 25,
    example: 'Roll 3-3-3-6-6 → score 25.',
  },
  {
    name: 'Small Straight',
    section: 'Lower',
    howToScore: 'Four sequential dice (e.g. 1-2-3-4). Score 30 (or 0).',
    maxScore: 30,
    example: 'Roll 2-3-4-5-5 → score 30.',
  },
  {
    name: 'Large Straight',
    section: 'Lower',
    howToScore: 'Five sequential dice (1-2-3-4-5 or 2-3-4-5-6). Score 40 (or 0).',
    maxScore: 40,
    example: 'Roll 1-2-3-4-5 → score 40.',
  },
  {
    name: 'Yahtzee',
    section: 'Lower',
    howToScore: 'All five dice the same. Score 50 (or 0). Subsequent Yahtzees add a 100-point bonus.',
    maxScore: 50,
    example: 'Roll 6-6-6-6-6 → score 50.',
  },
  {
    name: 'Chance',
    section: 'Lower',
    howToScore: 'Any combination. Score the sum of all five dice (5–30).',
    maxScore: 30,
    example: 'Roll 1-3-4-5-6 → score 19.',
  },
];

/* ---------------- HowTo steps ---------------- */

export const HOW_TO_PLAY_STEPS = [
  {
    name: 'Add players',
    text: 'Enter each player\'s name and add them to the scorecard. Up to 10 players are supported.',
  },
  {
    name: 'Start a new game',
    text: 'Click "Start First Game" once at least two players are added. A blank scorecard appears.',
  },
  {
    name: 'Roll the dice',
    text: 'On your turn, roll five dice up to three times. After each roll, set aside dice you want to keep.',
  },
  {
    name: 'Choose a category',
    text: 'After your final roll, choose one of the 13 categories on the scorecard to record your score.',
  },
  {
    name: 'Tap to score',
    text: 'Tap the category in the scorekeeper for the current player. A score picker opens with valid values pre-filled.',
  },
  {
    name: 'Continue play',
    text: 'The next player takes their turn automatically. Repeat until every player has filled all 13 categories.',
  },
  {
    name: 'See the winner',
    text: 'Tap "End Game" when complete. The scorekeeper calculates the +35 upper bonus, Yahtzee bonuses, and crowns the winner.',
  },
];

/* ---------------- FAQs ---------------- */

export const FAQS = [
  {
    q: 'What is the maximum possible Yahtzee score?',
    a: 'The theoretical maximum Yahtzee score is 1,575 points. This requires filling every category at its max and rolling Yahtzee at least 13 times (12 bonus Yahtzees worth 100 each, plus optimal Joker scoring in the lower section).',
  },
  {
    q: 'How do you get the upper section bonus?',
    a: 'Score at least 63 points in the upper section (Aces through Sixes) and you receive a 35-point bonus. 63 is the average of three of each number (3×1 + 3×2 + 3×3 + 3×4 + 3×5 + 3×6 = 63).',
  },
  {
    q: 'How does the Yahtzee bonus work?',
    a: 'After scoring your first Yahtzee (50 points), every additional Yahtzee earns a 100-point bonus, recorded separately. You can stack up to three bonus Yahtzees (300 extra points).',
  },
  {
    q: 'How many categories are on a Yahtzee scorecard?',
    a: 'There are 13 categories total: 6 in the upper section (Aces, Twos, Threes, Fours, Fives, Sixes) and 7 in the lower section (3 of a Kind, 4 of a Kind, Full House, Small Straight, Large Straight, Yahtzee, Chance).',
  },
  {
    q: 'Can I score zero in a category?',
    a: 'Yes. If you can\'t (or don\'t want to) score in a particular category, enter 0. This is called "scratching" the category. You must enter exactly one score per turn.',
  },
  {
    q: 'Do I need to download anything to use this Yahtzee scorecard?',
    a: 'No. The scorecard runs entirely in your browser. It works offline after the first load, saves your game automatically, and requires no signup.',
  },
  {
    q: 'How many players can play Yahtzee?',
    a: 'This scorekeeper supports up to 10 players per game. Standard Yahtzee is designed for 2 or more players, though it can be played solo.',
  },
  {
    q: 'What is a Full House in Yahtzee?',
    a: 'A Full House is three of one number plus two of another (e.g. 3-3-3-6-6). It scores a flat 25 points regardless of the dice values.',
  },
  {
    q: 'Is this Yahtzee scorecard free?',
    a: 'Yes. It is completely free, with no ads, no signup, and no tracking beyond what you allow your browser. Your scores are saved only on your own device.',
  },
];
