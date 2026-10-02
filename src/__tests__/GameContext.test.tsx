// src/__tests__/GameContext.test.tsx

import {
  gameReducer,
  initialState,
  migrateState,
  Game,
  GameState,
  Action,
} from '../contexts/GameContext';

describe('GameContext', () => {
  describe('gameReducer', () => {
    it('should add a player', () => {
      const action: Action = { type: 'ADD_PLAYER', name: 'Alice' };
      const newState = gameReducer(initialState, action);
      expect(newState.players).toHaveLength(1);
      expect(newState.players[0].name).toBe('Alice');
    });

    it('should not add a duplicate player', () => {
      const stateWithPlayer: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }],
      };
      const action: Action = { type: 'ADD_PLAYER', name: 'Alice' };
      const newState = gameReducer(stateWithPlayer, action);
      expect(newState.players).toHaveLength(1);
    });

    it('should remove a player', () => {
      const stateWithPlayers: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
      };
      const action: Action = { type: 'REMOVE_PLAYER', name: 'Alice' };
      const newState = gameReducer(stateWithPlayers, action);
      expect(newState.players).toHaveLength(1);
      expect(newState.players[0].name).toBe('Bob');
    });

    it('should start a new game', () => {
      const stateWithPlayers: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
      };
      const action: Action = { type: 'START_NEW_GAME' };
      const newState = gameReducer(stateWithPlayers, action);
      expect(newState.games).toHaveLength(1);
      expect(newState.currentGameId).toBe(1);
      expect(newState.games[0].currentPlayerIndex).toBe(0);
      expect(Object.keys(newState.games[0].scores)).toEqual(['Alice', 'Bob']);
    });

    it('should update score and move to next player', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: {}, Bob: {} },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      };
      const action: Action = {
        type: 'UPDATE_SCORE',
        gameId: 1,
        playerName: 'Alice',
        category: 'Aces',
        value: 3,
      };
      const newState = gameReducer(stateWithGame, action);
      expect(newState.games[0].scores['Alice']['Aces']).toBe(3);
      expect(newState.games[0].currentPlayerIndex).toBe(1);
    });

    it('should end a game and calculate summary', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: {
              Alice: { Aces: 3, Twos: 6 },
              Bob: { Aces: 2, Twos: 4 },
            },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      };
      const action: Action = { type: 'END_GAME', gameId: 1 };
      const newState = gameReducer(stateWithGame, action);
      expect(newState.gameSummaries[1]).toEqual({ Alice: 9, Bob: 6 });
      expect(newState.currentGameId).toBeNull();
    });

    it('END_GAME summary includes the +35 upper bonus when upper ≥ 63', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }],
            scores: {
              Alice: {
                Aces: 3,
                Twos: 8,
                Threes: 12,
                Fours: 16,
                Fives: 10,
                Sixes: 18, // upper = 67, gets +35 bonus
                Chance: 22,
              },
            },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      };
      const newState = gameReducer(stateWithGame, { type: 'END_GAME', gameId: 1 });
      // base = 3+8+12+16+10+18+22 = 89; + 35 upper bonus = 124
      expect(newState.gameSummaries[1]).toEqual({ Alice: 124 });
    });

    it('END_GAME summary multiplies YAHTZEE BONUS by 100', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }],
            scores: {
              Alice: { YAHTZEE: 50, 'YAHTZEE BONUS': 2, Chance: 10 },
            },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      };
      const newState = gameReducer(stateWithGame, { type: 'END_GAME', gameId: 1 });
      // 50 + 10 + (2 × 100) = 260
      expect(newState.gameSummaries[1]).toEqual({ Alice: 260 });
    });

    it('UPDATE_SCORE on an already-set category does NOT advance the turn', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: { Aces: 3 }, Bob: {} },
            currentPlayerIndex: 1, // Bob's turn
          },
        ],
        currentGameId: 1,
      };
      // Edit Alice's already-set Aces score
      const newState = gameReducer(stateWithGame, {
        type: 'UPDATE_SCORE',
        gameId: 1,
        playerName: 'Alice',
        category: 'Aces',
        value: 5,
      });
      expect(newState.games[0].scores['Alice']['Aces']).toBe(5);
      expect(newState.games[0].currentPlayerIndex).toBe(1); // still Bob
    });

    it('UPDATE_SCORE on YAHTZEE BONUS does not advance turn even on first set', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: { YAHTZEE: 50 }, Bob: {} },
            currentPlayerIndex: 0,
          },
        ],
        currentGameId: 1,
      };
      const newState = gameReducer(stateWithGame, {
        type: 'UPDATE_SCORE',
        gameId: 1,
        playerName: 'Alice',
        category: 'YAHTZEE BONUS',
        value: 1,
      });
      expect(newState.games[0].scores['Alice']['YAHTZEE BONUS']).toBe(1);
      expect(newState.games[0].currentPlayerIndex).toBe(0); // still Alice
    });

    it('CLEAR_SCORE removes the category and leaves turn order intact', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: { Aces: 4, Twos: 6 }, Bob: {} },
            currentPlayerIndex: 1,
          },
        ],
        currentGameId: 1,
      };
      const newState = gameReducer(stateWithGame, {
        type: 'CLEAR_SCORE',
        gameId: 1,
        playerName: 'Alice',
        category: 'Aces',
      });
      expect(newState.games[0].scores['Alice']).toEqual({ Twos: 6 });
      expect(newState.games[0].currentPlayerIndex).toBe(1);
    });
  });
  describe('per-game rosters', () => {
    it('stores the roster on the game when it starts', () => {
      const state = gameReducer(
        { ...initialState, players: [{ name: 'Alice' }, { name: 'Bob' }] },
        { type: 'START_NEW_GAME' }
      );
      expect(state.games[0].players).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });

    it("rotates turns within the game's roster, not the current player list", () => {
      const state: GameState = {
        ...initialState,
        // Carol joined after game 1 started.
        players: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }],
        games: [
          {
            id: 1,
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            scores: { Alice: {}, Bob: {} },
            currentPlayerIndex: 1,
          },
        ],
        currentGameId: 1,
      };
      const next = gameReducer(state, {
        type: 'UPDATE_SCORE',
        gameId: 1,
        playerName: 'Bob',
        category: 'Aces',
        value: 2,
      });
      expect(next.games[0].currentPlayerIndex).toBe(0);
    });

    it('rebuilds a missing roster from score keys when loading an older save', () => {
      const legacy = {
        ...initialState,
        games: [{ id: 1, scores: { Alice: {}, Bob: {} }, currentPlayerIndex: 0 }],
      } as unknown as GameState;
      expect(migrateState(legacy).games[0].players).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
      expect(
        gameReducer(initialState, { type: 'LOAD_STATE', state: legacy }).games[0].players
      ).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });
  });

  describe('score guards', () => {
    const game = (overrides: Partial<Game> = {}): GameState => ({
      ...initialState,
      players: [{ name: 'Alice' }, { name: 'Bob' }],
      games: [
        {
          id: 1,
          players: [{ name: 'Alice' }, { name: 'Bob' }],
          scores: { Alice: {}, Bob: {} },
          currentPlayerIndex: 0,
          ...overrides,
        },
      ],
      currentGameId: 1,
    });
    const score = (playerName: string, category: string, value: number): Action => ({
      type: 'UPDATE_SCORE',
      gameId: 1,
      playerName,
      category,
      value,
    });

    it("ignores a score in an empty box when it is not that player's turn", () => {
      const state = game();
      expect(gameReducer(state, score('Bob', 'Aces', 2))).toEqual(state);
    });

    it('ignores scores for players who are not in the game', () => {
      const state = game();
      expect(gameReducer(state, score('Carol', 'Aces', 2))).toEqual(state);
    });

    it('still lets anyone correct a filled box', () => {
      const next = gameReducer(
        game({ scores: { Alice: {}, Bob: { Aces: 2 } } }),
        score('Bob', 'Aces', 4)
      );
      expect(next.games[0].scores.Bob.Aces).toBe(4);
    });

    it('refuses a Yahtzee bonus until the YAHTZEE box holds 50', () => {
      const scratched = game({ scores: { Alice: { YAHTZEE: 0 }, Bob: {} } });
      expect(gameReducer(scratched, score('Alice', 'YAHTZEE BONUS', 1))).toEqual(scratched);
    });

    it('caps Yahtzee bonuses at three and only counts up by one', () => {
      const atCap = game({ scores: { Alice: { YAHTZEE: 50, 'YAHTZEE BONUS': 3 }, Bob: {} } });
      expect(gameReducer(atCap, score('Alice', 'YAHTZEE BONUS', 4))).toEqual(atCap);

      const fresh = game({ scores: { Alice: { YAHTZEE: 50 }, Bob: {} } });
      expect(gameReducer(fresh, score('Alice', 'YAHTZEE BONUS', 3))).toEqual(fresh);
    });

    it("refuses a Yahtzee bonus on another player's turn", () => {
      const state = game({ scores: { Alice: {}, Bob: { YAHTZEE: 50 } } });
      expect(gameReducer(state, score('Bob', 'YAHTZEE BONUS', 1))).toEqual(state);
    });
  });
  describe('ended games', () => {
    // Game 1 has ended; game 2 is still being played.
    const state: GameState = {
      ...initialState,
      players: [{ name: 'Alice' }, { name: 'Bob' }],
      games: [
        {
          id: 1,
          players: [{ name: 'Alice' }, { name: 'Bob' }],
          scores: { Alice: { Aces: 3 }, Bob: { Twos: 4 } },
          currentPlayerIndex: 0,
        },
        {
          id: 2,
          players: [{ name: 'Alice' }, { name: 'Bob' }],
          scores: { Alice: {}, Bob: {} },
          currentPlayerIndex: 0,
        },
      ],
      currentGameId: 2,
      gameSummaries: { 1: { Alice: 3, Bob: 4 } },
    };

    it('ignores score updates and corrections', () => {
      expect(
        gameReducer(state, {
          type: 'UPDATE_SCORE',
          gameId: 1,
          playerName: 'Alice',
          category: 'Aces',
          value: 5,
        })
      ).toBe(state);
      expect(
        gameReducer(state, {
          type: 'UPDATE_SCORE',
          gameId: 1,
          playerName: 'Alice',
          category: 'Chance',
          value: 20,
        })
      ).toBe(state);
    });

    it('ignores clearing a score', () => {
      expect(
        gameReducer(state, { type: 'CLEAR_SCORE', gameId: 1, playerName: 'Bob', category: 'Twos' })
      ).toBe(state);
    });

    it('cannot be reopened', () => {
      expect(gameReducer(state, { type: 'SET_CURRENT_GAME', gameId: 1 })).toBe(state);
      expect(gameReducer(state, { type: 'SET_CURRENT_GAME', gameId: 2 }).currentGameId).toBe(2);
    });

    it('keeps its final scores when ended again', () => {
      expect(gameReducer(state, { type: 'END_GAME', gameId: 1 })).toBe(state);
    });

    it('can still be deleted', () => {
      const next = gameReducer(state, { type: 'DELETE_GAME', gameId: 1 });
      expect(next.games.map((g) => g.id)).toEqual([2]);
      expect(next.gameSummaries).toEqual({});
    });

    it('is deselected when an older save still has it open', () => {
      expect(migrateState({ ...state, currentGameId: 1 }).currentGameId).toBeNull();
      expect(migrateState(state).currentGameId).toBe(2);
    });
  });
});
