'use client';

import GameSummary from '@/components/GameSummary';
import Scorecard from '@/components/Scorecard';
import SeoContent from '@/components/SeoContent';
import { useGame } from '@/contexts/GameContext';
import { AUTHOR_NAME, SITE_NAME } from '@/lib/seo';
import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';

export default function Home() {
  const { state, dispatch } = useGame();
  const currentGame = state.games.find((game) => game.id === state.currentGameId);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [endConfetti, setEndConfetti] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevGameIdRef = useRef(state.currentGameId);

  useEffect(() => {
    if (prevGameIdRef.current !== null && state.currentGameId === null) {
      setEndConfetti(true);
      const t = setTimeout(() => setEndConfetti(false), 5000);
      prevGameIdRef.current = state.currentGameId;
      return () => clearTimeout(t);
    }
    prevGameIdRef.current = state.currentGameId;
  }, [state.currentGameId]);

  const isGameInProgress = state.currentGameId !== null;
  const canAddPlayer = state.players.length < 10 && !isGameInProgress;
  const hasGames = state.games.length > 0;
  const showSetup = !isGameInProgress;

  const addPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed || state.players.length >= 10) return;
    if (state.players.some((p) => p.name === trimmed)) {
      setNewPlayerName('');
      return;
    }
    dispatch({ type: 'ADD_PLAYER', name: trimmed });
    setNewPlayerName('');
    inputRef.current?.focus();
  };

  const removePlayer = (name: string) => dispatch({ type: 'REMOVE_PLAYER', name });
  const startNewGame = () => dispatch({ type: 'START_NEW_GAME' });
  const switchGame = (gameId: number) => {
    dispatch({ type: 'SET_CURRENT_GAME', gameId });
    setMenuOpen(false);
  };
  const resetAll = () => {
    setMenuOpen(false);
    if (window.confirm('Reset all players and games? This cannot be undone.')) {
      dispatch({ type: 'RESET_ALL' });
    }
  };

  return (
    <main
      id="main-content"
      className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pb-20 pt-8 sm:gap-8 sm:px-6 sm:pt-12"
    >
      {endConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      {/* Header */}
      <header className="animate-fade-in flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="chip w-fit">
            <DiceIcon className="h-3.5 w-3.5" />
            <span>Scorecard</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">Yahtzee</span>{' '}
            <span className="text-white">Scorecard</span>
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Free online Yahtzee score sheet for up to 10 players. Auto-totals, +35 upper bonus,
            stacked Yahtzee bonuses. Saves automatically — no signup, no ads.
          </p>
        </div>
        {(hasGames || state.players.length > 0) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="glass-strong absolute right-0 top-12 z-50 w-48 rounded-2xl p-1.5 shadow-2xl"
                >
                  <button
                    role="menuitem"
                    onClick={resetAll}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
                  >
                    <RefreshIcon className="h-4 w-4" />
                    Reset everything
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* SETUP MODE: between games or initial */}
      {showSetup && (
        <>
          {/* Player intake */}
          <section className="glass animate-fade-in rounded-2xl p-4 sm:p-5">
            <label htmlFor="player-name" className="mb-3 block text-sm font-medium text-slate-300">
              Who&apos;s playing?{' '}
              <span className="text-slate-500">({state.players.length}/10)</span>
            </label>
            {state.players.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {state.players.map((player) => (
                  <span
                    key={player.name}
                    className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] py-1 pl-3 pr-1.5 text-sm text-white"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[10px] font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                    {player.name}
                    {canAddPlayer && (
                      <button
                        onClick={() => removePlayer(player.name)}
                        aria-label={`Remove ${player.name}`}
                        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-rose-500/20 hover:text-rose-200"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {canAddPlayer && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  ref={inputRef}
                  id="player-name"
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPlayer();
                  }}
                  placeholder="Enter player name"
                  maxLength={20}
                  aria-label="New player name"
                  className="input-field flex-1 text-base"
                />
                <button
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim() || state.players.length >= 10}
                  className="btn btn-primary justify-center focus-visible:ring-violet-400"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Player ({state.players.length}/10)
                </button>
              </div>
            )}
          </section>

          {/* Primary CTA */}
          <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={startNewGame}
              disabled={state.players.length < 2 || state.games.length >= 10}
              className="btn btn-success justify-center text-base focus-visible:ring-emerald-400"
            >
              <SparkIcon className="h-4 w-4" />
              {hasGames ? 'Start Another Game' : 'Start First Game'}
            </button>
            {state.players.length < 2 && (
              <p className="text-sm text-slate-400">
                {state.players.length === 0
                  ? 'Add at least 2 players to begin.'
                  : 'One more player needed.'}
              </p>
            )}
          </section>
        </>
      )}

      {/* In-game: compact game switcher when multiple games exist */}
      {isGameInProgress && state.games.length > 1 && (
        <section
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Switch game"
        >
          {state.games.map((game) => {
            const isActive = game.id === state.currentGameId;
            const filled = state.players.reduce((acc, p) => {
              const scores = game.scores[p.name] || {};
              return acc + Object.keys(scores).filter((k) => k !== 'YAHTZEE BONUS').length;
            }, 0);
            const total = state.players.length * 13;
            return (
              <button
                key={game.id}
                onClick={() => switchGame(game.id)}
                role="tab"
                aria-selected={isActive}
                className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  isActive
                    ? 'border-violet-400/60 bg-gradient-to-br from-violet-500/30 to-indigo-600/15 text-white'
                    : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                Game {game.id}
                <span className="text-xs font-normal text-slate-400">
                  {filled}/{total}
                </span>
              </button>
            );
          })}
        </section>
      )}

      {state.currentGameId !== null && <Scorecard />}
      {state.games.length >= 1 && <GameSummary />}

      <SeoContent />

      <footer className="mt-8 border-t border-white/5 pt-6 text-sm text-slate-400">
        <p>
          {SITE_NAME} is open source and built by{' '}
          <span className="font-semibold text-slate-200">{AUTHOR_NAME}</span>. Yahtzee is a
          trademark of Hasbro. This site is an unofficial fan-made scorekeeper.
        </p>
      </footer>
    </main>
  );
}

/* ---------------- Icons ---------------- */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M6 18 18 6" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
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
      <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function DiceIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
