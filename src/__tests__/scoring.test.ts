// src/__tests__/scoring.test.ts

import {
  allCategories,
  canAddYahtzeeBonus,
  filledCount,
  grandTotal,
  isScorecardComplete,
  lowerTotal,
  upperBonus,
  upperTotal,
} from '@/lib/scoring';

describe('scoring', () => {
  it('awards the +35 upper bonus at exactly 63', () => {
    expect(upperBonus({ Sixes: 30, Fives: 25, Fours: 8 })).toBe(35);
    expect(upperBonus({ Sixes: 30, Fives: 25, Fours: 4 })).toBe(0);
  });

  it('counts each Yahtzee bonus as 100 in the lower section', () => {
    expect(lowerTotal({ YAHTZEE: 50, 'YAHTZEE BONUS': 2, Chance: 10 })).toBe(260);
  });

  it('adds upper, upper bonus and lower into the grand total', () => {
    const scores = { Sixes: 30, Fives: 25, Fours: 8, YAHTZEE: 50, 'YAHTZEE BONUS': 1 };
    expect(upperTotal(scores)).toBe(63);
    expect(grandTotal(scores)).toBe(63 + 35 + 150);
  });

  it('ignores keys that are not scorecard categories', () => {
    expect(grandTotal({ Aces: 3, Ones: 99 })).toBe(3);
  });

  it('treats a missing scorecard as empty', () => {
    expect(grandTotal(undefined)).toBe(0);
    expect(filledCount(undefined)).toBe(0);
  });

  it('is complete only when all 13 boxes are filled (0 counts as filled)', () => {
    const full = Object.fromEntries(allCategories.map((c) => [c.name, 0]));
    expect(allCategories).toHaveLength(13);
    expect(isScorecardComplete(full)).toBe(true);
    const { Chance: _omit, ...missingOne } = full;
    expect(filledCount(missingOne)).toBe(12);
    expect(isScorecardComplete(missingOne)).toBe(false);
  });

  it('allows a Yahtzee bonus only after a 50 in YAHTZEE, up to three', () => {
    expect(canAddYahtzeeBonus({})).toBe(false);
    expect(canAddYahtzeeBonus({ YAHTZEE: 0 })).toBe(false);
    expect(canAddYahtzeeBonus({ YAHTZEE: 50, 'YAHTZEE BONUS': 2 })).toBe(true);
    expect(canAddYahtzeeBonus({ YAHTZEE: 50, 'YAHTZEE BONUS': 3 })).toBe(false);
  });
});
