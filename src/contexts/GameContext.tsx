'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { canAddYahtzeeBonus, grandTotal, Score, YAHTZEE_BONUS } from '@/lib/scoring';
import { loadSaved, save } from '@/lib/storage';

export type { Score };

export type Player = {
  name: string;
};

export type Game = {
  id: number;
  // Roster when the game started; the global player list can change between games.
  players: Player[];
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
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_STATE'; state: GameState };

export const initialState: GameState = {
  players: [],
  games: [],
  currentGameId: null,
  gameSummaries: {},
};

export const getCurrentPlayerName = (game: Game) => game.players[game.currentPlayerIndex]?.name;

// Saves from before per-game rosters only have player names as score keys.
export function migrateState(saved: GameState): GameState {
  return {
    ...saved,
    games: saved.games.map((game) => ({
      ...game,
      players: game.players ?? Object.keys(game.scores).map((name) => ({ name })),
    })),
  };
}

// Filled boxes can be corrected by anyone; empty boxes and bonuses only on your turn.
function isScoreAllowed(game: Game, playerName: string, category: string, value: number) {
  const scores = game.scores[playerName];
  if (!scores) return false;
  const isMyTurn = getCurrentPlayerName(game) === playerName;
  if (category === YAHTZEE_BONUS) {
    return isMyTurn && canAddYahtzeeBonus(scores) && value === (scores[YAHTZEE_BONUS] ?? 0) + 1;
  }
  const isFilled = scores[category] !== undefined && scores[category] !== null;
  return isFilled || isMyTurn;
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
      const newGameId = state.games.length > 0 ? Math.max(...state.games.map((g) => g.id)) + 1 : 1;
      const newGame: Game = {
        id: newGameId,
        players: state.players,
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
          if (!isScoreAllowed(game, action.playerName, action.category, action.value)) {
            return game;
          }
          const prev = game.scores[action.playerName]?.[action.category];
          const isFirstSet = prev === undefined || prev === null;
          const shouldAdvance = isFirstSet && action.category !== YAHTZEE_BONUS;
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
              ? (game.currentPlayerIndex + 1) % game.players.length
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
          summary[playerName] = grandTotal(scores);
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

    case 'LOAD_STATE':
      return migrateState(action.state);

    default:
      return state;
  }
}

export const GameContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<Action>;
      // False until the saved game has been read from localStorage after mount.
      isHydrated: boolean;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Start from initialState on server and client so hydration matches, then load the save.
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSaved<GameState>();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
    setIsHydrated(true);
  }, []);

  // Don't save before loading, or the empty initial state would overwrite the save.
  useEffect(() => {
    if (isHydrated) save(state);
  }, [state, isHydrated]);

  return (
    <GameContext.Provider value={{ state, dispatch, isHydrated }}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
