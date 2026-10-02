// src/__tests__/storage.test.tsx

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { loadSaved, save, STORAGE_KEY } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it('round-trips a saved value', () => {
    save({ n: 1 });
    expect(loadSaved()).toEqual({ n: 1 });
  });

  it('returns null when nothing or corrupt JSON is saved', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(loadSaved()).toBeNull();
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadSaved()).toBeNull();
  });

  it('keeps working when storage writes fail', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => save({ n: 1 })).not.toThrow();
  });
});

describe('GameProvider persistence', () => {
  beforeEach(() => window.localStorage.clear());

  function Probe() {
    const { state, dispatch, isHydrated } = useGame();
    if (!isHydrated) return <p>loading</p>;
    return (
      <>
        <p>{state.players.map((p) => p.name).join(',') || 'nobody'}</p>
        <button onClick={() => dispatch({ type: 'ADD_PLAYER', name: 'Carol' })}>add</button>
      </>
    );
  }

  it('loads and migrates the saved game after mount', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [{ id: 1, scores: { Alice: {}, Bob: {} }, currentPlayerIndex: 0 }],
        currentGameId: 1,
        gameSummaries: {},
      })
    );

    render(
      <GameProvider>
        <Probe />
      </GameProvider>
    );

    expect(screen.getByText('Alice,Bob')).toBeInTheDocument();
    // The loaded (and migrated) state is written back, not the empty initial state.
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.games[0].players).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('starts empty without a save and persists changes', () => {
    render(
      <GameProvider>
        <Probe />
      </GameProvider>
    );
    expect(screen.getByText('nobody')).toBeInTheDocument();

    act(() => screen.getByText('add').click());

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).players).toEqual([
      { name: 'Carol' },
    ]);
  });

  it('throws a clear error outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useGame must be used within a GameProvider');
  });
});
