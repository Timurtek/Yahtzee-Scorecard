// Single source of truth for Yahtzee categories and score totals, shared by the
// scorecard UI and the reducer's end-of-game summary.

export type Score = {
  [category: string]: number | null;
};

export type CategoryKind =
  | { type: 'multiples'; step: number; max: number } // upper: 0..max step
  | { type: 'fixed'; value: number } // Full House (25), SM Straight (30), LG Straight (40), YAHTZEE (50)
  | { type: 'sum'; min: number; max: number }; // 3/4 of a Kind, Chance

export type Category = {
  name: string;
  description: string;
  kind: CategoryKind;
};

export const YAHTZEE = 'YAHTZEE';
export const YAHTZEE_BONUS = 'YAHTZEE BONUS';
export const YAHTZEE_BONUS_POINTS = 100;
export const MAX_YAHTZEE_BONUSES = 3;
export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS_POINTS = 35;

export const upperSectionCategories: Category[] = [
  { name: 'Aces', description: 'Sum of 1s', kind: { type: 'multiples', step: 1, max: 5 } },
  { name: 'Twos', description: 'Sum of 2s', kind: { type: 'multiples', step: 2, max: 10 } },
  { name: 'Threes', description: 'Sum of 3s', kind: { type: 'multiples', step: 3, max: 15 } },
  { name: 'Fours', description: 'Sum of 4s', kind: { type: 'multiples', step: 4, max: 20 } },
  { name: 'Fives', description: 'Sum of 5s', kind: { type: 'multiples', step: 5, max: 25 } },
  { name: 'Sixes', description: 'Sum of 6s', kind: { type: 'multiples', step: 6, max: 30 } },
];

export const lowerSectionCategories: Category[] = [
  {
    name: '3 of a Kind',
    description: 'Sum of all dice',
    kind: { type: 'sum', min: 5, max: 30 },
  },
  {
    name: '4 of a Kind',
    description: 'Sum of all dice',
    kind: { type: 'sum', min: 5, max: 30 },
  },
  { name: 'Full House', description: 'Score 25', kind: { type: 'fixed', value: 25 } },
  { name: 'SM Straight', description: 'Score 30', kind: { type: 'fixed', value: 30 } },
  { name: 'LG Straight', description: 'Score 40', kind: { type: 'fixed', value: 40 } },
  { name: YAHTZEE, description: 'Score 50', kind: { type: 'fixed', value: 50 } },
  { name: 'Chance', description: 'Sum of all dice', kind: { type: 'sum', min: 5, max: 30 } },
];

export const allCategories = [...upperSectionCategories, ...lowerSectionCategories];

const sumCategories = (scores: Score | undefined, categories: Category[]) =>
  categories.reduce((total, c) => total + (scores?.[c.name] ?? 0), 0);

export const upperTotal = (scores: Score | undefined) =>
  sumCategories(scores, upperSectionCategories);

export const upperBonus = (scores: Score | undefined) =>
  upperTotal(scores) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_POINTS : 0;

// YAHTZEE BONUS is stored as a count of extra Yahtzees, not points.
export const yahtzeeBonusCount = (scores: Score | undefined) => scores?.[YAHTZEE_BONUS] ?? 0;

export const lowerTotal = (scores: Score | undefined) =>
  sumCategories(scores, lowerSectionCategories) + yahtzeeBonusCount(scores) * YAHTZEE_BONUS_POINTS;

export const grandTotal = (scores: Score | undefined) =>
  upperTotal(scores) + upperBonus(scores) + lowerTotal(scores);

export const filledCount = (scores: Score | undefined) =>
  allCategories.filter((c) => scores?.[c.name] !== undefined).length;

export const isScorecardComplete = (scores: Score | undefined) =>
  filledCount(scores) === allCategories.length;

// Extra Yahtzees only count once the YAHTZEE box itself scored 50.
export const canAddYahtzeeBonus = (scores: Score | undefined) =>
  scores?.[YAHTZEE] === 50 && yahtzeeBonusCount(scores) < MAX_YAHTZEE_BONUSES;
