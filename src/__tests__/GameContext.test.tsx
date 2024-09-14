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

    // Add more tests for other actions...
  });
});
