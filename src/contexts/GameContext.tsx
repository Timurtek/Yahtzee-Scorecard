'use client';

import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type Score = {
  [category: string]: number | null;
};

export type Player = {
  name: string;
};

export type Game = {
  id: number;
  scores: {
    [playerName: string]: Score;
  };
  currentPlayerIndex: number;
};

export type GameState = {
  players: Player[];
  games: Game[];
  currentGameId: number | null;
  gameSummaries: { [gameId: number]: { [playerName: string]: number } };
};

export type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; name: string }
  | { type: 'START_NEW_GAME' }
  | { type: 'UPDATE_SCORE'; gameId: number; playerName: string; category: string; value: number }
  | { type: 'CLEAR_SCORE'; gameId: number; playerName: string; category: string }
  | { type: 'SET_CURRENT_GAME'; gameId: number }
  | { type: 'END_GAME'; gameId: number }
  | { type: 'DELETE_GAME'; gameId: number }
  | { type: 'RESET_ALL' };

export const initialState: GameState = {
  players: [],
  games: [],
  currentGameId: null,
  gameSummaries: {},
};

const UPPER_CATEGORIES = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];

function calculateTotalScore(scores: Score): number {
  let upperBase = 0;
  let total = 0;
  for (const [category, score] of Object.entries(scores)) {
    if (score === null || score === undefined) continue;
    if (category === 'YAHTZEE BONUS') {
      total += score * 100;
      continue;
    }
    if (UPPER_CATEGORIES.includes(category)) {
      upperBase += score;
    }
    total += score;
  }
  if (upperBase >= 63) total += 35;
  return total;
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_PLAYER':
      if (state.players.some((p) => p.name === action.name)) return state;
      return { ...state, players: [...state.players, { name: action.name }] };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((p) => p.name !== action.name),
      };

    case 'START_NEW_GAME': {
      const newGameId =
        state.games.length > 0 ? Math.max(...state.games.map((g) => g.id)) + 1 : 1;
      const newGame: Game = {
        id: newGameId,
        scores: Object.fromEntries(state.players.map((p) => [p.name, {}])),
        currentPlayerIndex: 0,
      };
      return { ...state, games: [...state.games, newGame], currentGameId: newGameId };
    }

    case 'UPDATE_SCORE':
      return {
        ...state,
        games: state.games.map((game) => {
          if (game.id !== action.gameId) return game;
          const prev = game.scores[action.playerName]?.[action.category];
          const isFirstSet = prev === undefined || prev === null;
          const shouldAdvance = isFirstSet && action.category !== 'YAHTZEE BONUS';
          return {
            ...game,
            scores: {
              ...game.scores,
              [action.playerName]: {
                ...game.scores[action.playerName],
                [action.category]: action.value,
              },
            },
            currentPlayerIndex: shouldAdvance
              ? (game.currentPlayerIndex + 1) % state.players.length
              : game.currentPlayerIndex,
          };
        }),
      };

    case 'CLEAR_SCORE':
      return {
        ...state,
        games: state.games.map((game) => {
          if (game.id !== action.gameId) return game;
          const next = { ...game.scores[action.playerName] };
          delete next[action.category];
          return {
            ...game,
            scores: { ...game.scores, [action.playerName]: next },
          };
        }),
      };

    case 'SET_CURRENT_GAME':
      return { ...state, currentGameId: action.gameId };

    case 'END_GAME': {
      const endedGame = state.games.find((game) => game.id === action.gameId);
      if (!endedGame) return state;
      const gameSummary = Object.entries(endedGame.scores).reduce(
        (summary, [playerName, scores]) => {
          summary[playerName] = calculateTotalScore(scores);
          return summary;
        },
        {} as { [playerName: string]: number }
      );
      return {
        ...state,
        gameSummaries: { ...state.gameSummaries, [action.gameId]: gameSummary },
        currentGameId: null,
      };
    }

    case 'DELETE_GAME': {
      const newState = {
        ...state,
        games: state.games.filter((game) => game.id !== action.gameId),
        gameSummaries: { ...state.gameSummaries },
      };
      delete newState.gameSummaries[action.gameId];
      if (state.currentGameId === action.gameId) {
        newState.currentGameId =
          newState.games.length > 0 ? newState.games[newState.games.length - 1].id : null;
      }
      return newState;
    }

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}

export const GameContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [savedState, setSavedState] = useLocalStorage<GameState | null>('yahtzeeState', null);
  const [state, dispatch] = useReducer(gameReducer, savedState || initialState);

  useEffect(() => {
    setSavedState(state);
  }, [state, setSavedState]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
