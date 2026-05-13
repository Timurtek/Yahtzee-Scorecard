'use client';

import React from 'react';
import { useGame } from '../contexts/GameContext';

export default function GameSummary() {
  const { state, dispatch } = useGame();

  const endGame = (gameId: number) => dispatch({ type: 'END_GAME', gameId });
  const deleteGame = (gameId: number) => {
    if (window.confirm('Delete this game permanently?')) {
      dispatch({ type: 'DELETE_GAME', gameId });
    }
  };

  return (
    <section className="animate-fade-in flex flex-col gap-4" data-testid="game-summary">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-bold text-white">Game History</h2>
        <span className="chip">
          {state.games.length} game{state.games.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {state.games.map((game) => {
          const summary = state.gameSummaries?.[game.id];
          const sortedEntries = summary
            ? Object.entries(summary).sort(([, a], [, b]) => b - a)
            : [];
          const topScore = sortedEntries[0]?.[1] ?? -Infinity;

          return (
            <div key={game.id} className="glass animate-fade-in flex flex-col gap-3 rounded-2xl p-5">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 font-display text-sm font-bold text-white shadow-lg">
                    {game.id}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-display text-base font-bold text-white">
                      Game {game.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {summary ? 'Final scores' : 'In progress'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!summary && (
                    <button
                      onClick={() => endGame(game.id)}
                      className="btn btn-ghost px-3 py-1.5 text-xs focus-visible:ring-amber-400"
                    >
                      End
                    </button>
                  )}
                  <button
                    onClick={() => deleteGame(game.id)}
                    className="btn btn-danger px-3 py-1.5 text-xs focus-visible:ring-rose-400"
                    aria-label={`Delete Game ${game.id}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </header>

              {summary ? (
                <ul className="flex flex-col gap-1.5">
                  {sortedEntries.map(([playerName, score], idx) => {
                    const isWinner = idx === 0 && score === topScore;
                    return (
                      <li
                        key={playerName}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
                          isWinner
                            ? 'bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-transparent ring-1 ring-amber-400/40'
                            : 'bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                              isWinner
                                ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isWinner ? 'text-amber-100' : 'text-slate-200'
                            }`}
                          >
                            {playerName}
                          </span>
                          {isWinner && (
                            <span className="chip chip-active px-2 py-0.5 text-[10px]">
                              <CrownIcon className="h-3 w-3" />
                              Winner
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-display text-base font-bold ${
                            isWinner ? 'gradient-text' : 'text-white'
                          }`}
                        >
                          {score}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-slate-400">
                  Game in progress — finish all categories to see the final scores.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 18h18M5 18l-2-9 5 4 4-7 4 7 5-4-2 9" />
    </svg>
  );
}
