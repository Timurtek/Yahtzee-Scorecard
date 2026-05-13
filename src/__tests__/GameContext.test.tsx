// src/__tests__/GameContext.test.tsx

import { gameReducer, initialState, GameState, Action } from '../contexts/GameContext';

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
        category: 'Ones',
        value: 3,
      };
      const newState = gameReducer(stateWithGame, action);
      expect(newState.games[0].scores['Alice']['Ones']).toBe(3);
      expect(newState.games[0].currentPlayerIndex).toBe(1);
    });

    it('should end a game and calculate summary', () => {
      const stateWithGame: GameState = {
        ...initialState,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        games: [
          {
            id: 1,
            scores: {
              Alice: { Ones: 3, Twos: 6 },
              Bob: { Ones: 2, Twos: 4 },
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
            scores: { Alice: {}, Bob: {} },
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
});
