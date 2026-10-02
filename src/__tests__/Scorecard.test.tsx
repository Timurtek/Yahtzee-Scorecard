// __tests__/components/Scorecard.test.tsx

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Scorecard from '@/components/Scorecard';
import { GameProvider, GameState, initialState } from '@/contexts/GameContext';
import { allCategories } from '@/lib/scoring';
import { STORAGE_KEY } from '@/lib/storage';

const renderWithSave = (saved: Partial<GameState>) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState, ...saved }));
  return render(
    <GameProvider>
      <Scorecard />
    </GameProvider>
  );
};

const desktopTable = () => screen.getByRole('table');

describe('Scorecard', () => {
  beforeEach(() => window.localStorage.clear());

  it('renders correctly', () => {
    render(
      <GameProvider>
        <Scorecard />
      </GameProvider>
    );
    expect(screen.getByTestId('scorecard-empty')).toBeInTheDocument();
  });

  it("shows only the game's own players after the roster changed", () => {
    renderWithSave({
      // Carol was added after game 1 started.
      players: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }],
      games: [
        {
          id: 1,
          players: [{ name: 'Alice' }, { name: 'Bob' }],
          scores: { Alice: { Aces: 3 }, Bob: {} },
          currentPlayerIndex: 1,
        },
      ],
      currentGameId: 1,
    });

    const headers = within(desktopTable())
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(headers).toEqual(['Category', 'How to Score', 'Alice', 'Bob']);
    expect(screen.queryByText('Carol')).not.toBeInTheDocument();
  });

  it('offers End Game once every player in the game has filled all 13 boxes', () => {
    const full = Object.fromEntries(allCategories.map((c) => [c.name, 0]));
    renderWithSave({
      // A player added after the game started must not block completion.
      players: [{ name: 'Alice' }, { name: 'Carol' }],
      games: [
        { id: 1, players: [{ name: 'Alice' }], scores: { Alice: full }, currentPlayerIndex: 0 },
      ],
      currentGameId: 1,
    });
    expect(screen.getByRole('button', { name: /End Game/ })).toBeInTheDocument();
  });

  describe('Yahtzee bonus button', () => {
    const bonusButton = () =>
      within(desktopTable()).getByRole('button', { name: 'Add Yahtzee bonus for Alice' });

    const renderAlice = (aliceScores: Record<string, number>) =>
      renderWithSave({
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: aliceScores, Bob: {} },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      });

    it('is disabled with an explanation until YAHTZEE holds 50', () => {
      renderAlice({ YAHTZEE: 0 });
      expect(bonusButton()).toBeDisabled();
      expect(bonusButton()).toHaveAttribute('title', 'Score 50 in the YAHTZEE box first');
      expect(screen.getByText('Score 50 in YAHTZEE first')).toBeInTheDocument();
    });

    it('adds 100 to the lower total once YAHTZEE holds 50', () => {
      renderAlice({ YAHTZEE: 50 });
      expect(bonusButton()).toBeEnabled();

      fireEvent.click(bonusButton());

      const lowerRow = within(desktopTable()).getByText('Lower Total').closest('tr')!;
      expect(within(lowerRow).getAllByRole('cell')[1]).toHaveTextContent('150');
    });
  });
});
