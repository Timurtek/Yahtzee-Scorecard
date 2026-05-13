'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Confetti from 'react-confetti';
import ScorePicker, { PickerCategory } from './ScorePicker';
import Toast from './Toast';

type Category = {
  name: string;
  description: string;
  kind: PickerCategory['kind'];
};

const upperSectionCategories: Category[] = [
  { name: 'Aces', description: 'Sum of 1s', kind: { type: 'multiples', step: 1, max: 5 } },
  { name: 'Twos', description: 'Sum of 2s', kind: { type: 'multiples', step: 2, max: 10 } },
  { name: 'Threes', description: 'Sum of 3s', kind: { type: 'multiples', step: 3, max: 15 } },
  { name: 'Fours', description: 'Sum of 4s', kind: { type: 'multiples', step: 4, max: 20 } },
  { name: 'Fives', description: 'Sum of 5s', kind: { type: 'multiples', step: 5, max: 25 } },
  { name: 'Sixes', description: 'Sum of 6s', kind: { type: 'multiples', step: 6, max: 30 } },
];

const lowerSectionCategories: Category[] = [
  {
    name: '3 of a Kind',
    description: 'Sum of all dice',
    kind: { type: 'sum', min: 5, max: 30 },
  },
  {
    name: '4 of a Kind',
    description: 'Sum of all dice',
    kind: { type: 'sum', min: 5, max: 30 },
  },
  { name: 'Full House', description: 'Score 25', kind: { type: 'fixed', value: 25 } },
  { name: 'SM Straight', description: 'Score 30', kind: { type: 'fixed', value: 30 } },
  { name: 'LG Straight', description: 'Score 40', kind: { type: 'fixed', value: 40 } },
  { name: 'YAHTZEE', description: 'Score 50', kind: { type: 'fixed', value: 50 } },
  { name: 'Chance', description: 'Sum of all dice', kind: { type: 'sum', min: 5, max: 30 } },
];

const allCategories = [...upperSectionCategories, ...lowerSectionCategories];

type EditingCell = { playerName: string; category: Category } | null;

export default function Scorecard() {
  const { state, dispatch } = useGame();
  const currentGame = state.games.find((game) => game.id === state.currentGameId);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editing, setEditing] = useState<EditingCell>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<string | null>(null);

  const isGameComplete = useMemo(() => {
    if (!currentGame) return false;
    return state.players.every((player) => {
      const playerScores = currentGame.scores[player.name] || {};
      return allCategories.every((c) => playerScores[c.name] !== undefined);
    });
  }, [currentGame, state.players]);

  useEffect(() => {
    setEditing(null);
    setViewingPlayer(null);
  }, [state.currentGameId]);

  if (!currentGame) {
    return (
      <div
        data-testid="scorecard-empty"
        className="glass rounded-2xl p-8 text-center text-slate-300"
      >
        No active game. Start a new game to see the scorecard.
      </div>
    );
  }

  const currentPlayer = state.players[currentGame.currentPlayerIndex];
  const focusPlayer = viewingPlayer ?? currentPlayer?.name ?? state.players[0]?.name;
  const isViewingCurrent = focusPlayer === currentPlayer?.name;

  const upperTotal = (p: string) =>
    upperSectionCategories.reduce((t, c) => t + (currentGame.scores[p]?.[c.name] || 0), 0);
  const bonus = (p: string) => (upperTotal(p) >= 63 ? 35 : 0);
  const lowerTotal = (p: string) => {
    const base = lowerSectionCategories.reduce(
      (t, c) => t + (currentGame.scores[p]?.[c.name] || 0),
      0
    );
    const bonusCount = currentGame.scores[p]?.['YAHTZEE BONUS'] || 0;
    return base + bonusCount * 100;
  };
  const grandTotal = (p: string) => upperTotal(p) + bonus(p) + lowerTotal(p);
  const filledCount = (p: string) =>
    allCategories.filter((c) => currentGame.scores[p]?.[c.name] !== undefined).length;

  const leaderName = ((): string | null => {
    let best = -Infinity;
    let leader: string | null = null;
    for (const p of state.players) {
      const g = grandTotal(p.name);
      if (g > best) {
        best = g;
        leader = p.name;
      } else if (g === best) {
        leader = null;
      }
    }
    return best > 0 ? leader : null;
  })();

  const handleOpen = (playerName: string, category: Category) => {
    const isFilled = currentGame.scores[playerName]?.[category.name] !== undefined;
    // Empty cells: only the current player can score
    if (!isFilled && playerName !== currentPlayer?.name) return;
    setEditing({ playerName, category });
  };

  const handleSave = (value: number) => {
    if (!editing) return;
    const { playerName, category } = editing;
    dispatch({
      type: 'UPDATE_SCORE',
      gameId: currentGame.id,
      playerName,
      category: category.name,
      value,
    });
    setToast(`Saved ${value} · ${category.name} · ${playerName}`);
    if (category.name === 'YAHTZEE' && value === 50) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    setEditing(null);
    // After scoring as current player, snap back to current player view
    setViewingPlayer(null);
  };

  const handleClear = () => {
    if (!editing) return;
    const { playerName, category } = editing;
    dispatch({
      type: 'CLEAR_SCORE',
      gameId: currentGame.id,
      playerName,
      category: category.name,
    });
    setToast(`Cleared · ${category.name} · ${playerName}`);
    setEditing(null);
  };

  const handleYahtzeeBonus = (playerName: string) => {
    if (playerName !== currentPlayer?.name) return;
    const current = currentGame.scores[playerName]?.['YAHTZEE BONUS'] || 0;
    if (current >= 3) return;
    dispatch({
      type: 'UPDATE_SCORE',
      gameId: currentGame.id,
      playerName,
      category: 'YAHTZEE BONUS',
      value: current + 1,
    });
    setToast(`+100 Bonus · ${playerName}`);
  };

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME', gameId: currentGame.id });
  };

  return (
    <section className="animate-fade-in flex flex-col gap-4" data-testid="scorecard">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Sticky turn indicator (mobile) */}
      <div className="sticky top-0 z-30 -mx-4 px-4 pb-1 pt-2 md:hidden">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              {currentGame.id}
            </div>
            {!isGameComplete && currentPlayer ? (
              <div className="flex min-w-0 items-baseline gap-1.5">
                <span className="text-xs text-slate-400">Turn:</span>
                <span className="truncate font-display text-sm font-bold text-amber-300">
                  {currentPlayer.name}
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  · {filledCount(currentPlayer.name)}/13
                </span>
              </div>
            ) : (
              <span className="font-display text-sm font-bold text-emerald-300">
                Game complete!
              </span>
            )}
          </div>
          {isGameComplete && (
            <button
              onClick={handleEndGame}
              className="btn btn-success px-3 py-1 text-xs focus-visible:ring-emerald-400"
            >
              Finish
            </button>
          )}
        </div>
      </div>

      {/* Desktop header */}
      <div className="glass hidden flex-wrap items-center justify-between gap-3 rounded-2xl p-4 md:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 font-display text-base font-bold text-white shadow-lg">
            {currentGame.id}
          </div>
          <div className="flex flex-col leading-tight">
            <h2 className="font-display text-xl font-bold text-white">
              Game {currentGame.id} · Scorecard
            </h2>
            {!isGameComplete && currentPlayer && (
              <p className="text-sm text-slate-300">
                Turn: <span className="font-semibold text-amber-300">{currentPlayer.name}</span>{' '}
                <span className="text-slate-500">· {filledCount(currentPlayer.name)}/13</span>
              </p>
            )}
            {isGameComplete && (
              <p className="text-sm font-semibold text-emerald-300">Game complete!</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {leaderName && !isGameComplete && (
            <span className="chip chip-active">
              <CrownIcon className="h-3.5 w-3.5" />
              Leading: {leaderName}
            </span>
          )}
          {isGameComplete && (
            <button
              onClick={handleEndGame}
              className="btn btn-success focus-visible:ring-emerald-400"
            >
              <CheckIcon className="h-4 w-4" />
              End Game
            </button>
          )}
        </div>
      </div>

      {/* Scoreboard pill row — visible on all sizes, scrollable on mobile */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {state.players.map((p, i) => {
            const isCurrent = i === currentGame.currentPlayerIndex;
            const isFocused = focusPlayer === p.name;
            const total = grandTotal(p.name);
            const isLeader = leaderName === p.name && total > 0;
            return (
              <button
                key={p.name}
                onClick={() => setViewingPlayer(isCurrent ? null : p.name)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  isFocused
                    ? 'border-white/25 bg-white/10 shadow-lg'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                } ${isCurrent ? 'ring-1 ring-amber-400/40' : ''}`}
                aria-label={`View ${p.name}'s scorecard (${total} points)`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950'
                      : isLeader
                        ? 'bg-gradient-to-br from-violet-400 to-cyan-400 text-white'
                        : 'bg-white/15 text-white'
                  }`}
                >
                  {isLeader ? (
                    <CrownIcon className="h-3.5 w-3.5" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-xs font-semibold text-white">{p.name}</span>
                  <span className="font-display text-sm font-bold text-slate-200">{total}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE: Stacked categories for focused player */}
      <div className="md:hidden">
        {!isViewingCurrent && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-400/10 px-3 py-2 text-xs">
            <span className="text-amber-200">
              Viewing <span className="font-bold">{focusPlayer}</span> (read-only)
            </span>
            <button
              onClick={() => setViewingPlayer(null)}
              className="font-semibold text-amber-200 underline-offset-2 hover:underline"
            >
              Back to {currentPlayer?.name}
            </button>
          </div>
        )}
        <MobileCategoryList
          categories={upperSectionCategories}
          sectionTitle="Upper Section"
          focusPlayer={focusPlayer}
          currentGame={currentGame}
          isMyTurn={isViewingCurrent}
          onOpen={handleOpen}
          footer={
            <>
              <SummaryRow label="Total" value={upperTotal(focusPlayer)} />
              <SummaryRow
                label="Bonus (63+ → 35)"
                value={bonus(focusPlayer)}
                accent={bonus(focusPlayer) > 0 ? 'emerald' : undefined}
              />
              <SummaryRow
                label="Upper + Bonus"
                value={upperTotal(focusPlayer) + bonus(focusPlayer)}
                emphasis
              />
            </>
          }
        />

        <MobileCategoryList
          categories={lowerSectionCategories}
          sectionTitle="Lower Section"
          focusPlayer={focusPlayer}
          currentGame={currentGame}
          isMyTurn={isViewingCurrent}
          onOpen={handleOpen}
          extraRow={
            <YahtzeeBonusRow
              count={currentGame.scores[focusPlayer]?.['YAHTZEE BONUS'] || 0}
              canIncrement={isViewingCurrent}
              onIncrement={() => handleYahtzeeBonus(focusPlayer)}
            />
          }
          footer={<SummaryRow label="Lower Total" value={lowerTotal(focusPlayer)} />}
        />

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-cyan-500/20 px-4 py-3">
          <span className="font-display text-base font-bold text-white">Grand Total</span>
          <span
            className={`font-display text-2xl font-bold ${
              leaderName === focusPlayer && grandTotal(focusPlayer) > 0
                ? 'gradient-text'
                : 'text-white'
            }`}
          >
            {grandTotal(focusPlayer)}
          </span>
        </div>
      </div>

      {/* DESKTOP: Full table */}
      <DesktopTable
        currentGame={currentGame}
        players={state.players}
        leaderName={leaderName}
        currentPlayerName={currentPlayer?.name}
        onOpen={handleOpen}
        onYahtzeeBonus={handleYahtzeeBonus}
        upperTotal={upperTotal}
        bonus={bonus}
        lowerTotal={lowerTotal}
        grandTotal={grandTotal}
      />

      {editing && (
        <ScorePicker
          category={editing.category}
          playerName={editing.playerName}
          existingValue={
            currentGame.scores[editing.playerName]?.[editing.category.name] ?? undefined
          }
          onSave={handleSave}
          onClear={handleClear}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

/* -------------------- Mobile category list -------------------- */

function MobileCategoryList({
  categories,
  sectionTitle,
  focusPlayer,
  currentGame,
  isMyTurn,
  onOpen,
  footer,
  extraRow,
}: {
  categories: Category[];
  sectionTitle: string;
  focusPlayer: string;
  currentGame: { scores: { [k: string]: { [k: string]: number | null } } };
  isMyTurn: boolean;
  onOpen: (playerName: string, category: Category) => void;
  footer?: React.ReactNode;
  extraRow?: React.ReactNode;
}) {
  return (
    <div className="glass mt-3 overflow-hidden rounded-2xl">
      <div className="border-b border-white/5 bg-white/[0.04] px-4 py-2 font-display text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {sectionTitle}
      </div>
      <ul className="divide-y divide-white/5">
        {categories.map((cat) => {
          const value = currentGame.scores[focusPlayer]?.[cat.name];
          const isFilled = value !== undefined;
          const canTap = isFilled || isMyTurn;
          return (
            <li key={cat.name}>
              <button
                onClick={() => onOpen(focusPlayer, cat)}
                disabled={!canTap}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:bg-white/5 ${
                  canTap
                    ? 'cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.08]'
                    : 'cursor-not-allowed opacity-50'
                }`}
                aria-label={`${cat.name} — ${isFilled ? `current value ${value}` : 'tap to score'}`}
              >
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isFilled ? (
                    <span className="font-display text-xl font-bold text-white">{value}</span>
                  ) : isMyTurn ? (
                    <span className="rounded-lg bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-200">
                      Tap to score
                    </span>
                  ) : (
                    <span className="font-display text-xl text-slate-600">—</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
        {extraRow}
      </ul>
      {footer && <div className="border-t border-white/5 bg-white/[0.02]">{footer}</div>}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
  accent,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  accent?: 'emerald';
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span
        className={`${
          emphasis
            ? 'font-display text-sm font-bold text-white'
            : 'text-xs font-semibold text-slate-300'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-display text-base font-bold ${
          accent === 'emerald' ? 'text-emerald-300' : emphasis ? 'text-white' : 'text-slate-100'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function YahtzeeBonusRow({
  count,
  canIncrement,
  onIncrement,
}: {
  count: number;
  canIncrement: boolean;
  onIncrement: () => void;
}) {
  return (
    <li className="bg-gradient-to-r from-violet-500/[0.06] to-cyan-500/[0.04]">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CrownIcon className="h-4 w-4 flex-shrink-0 text-amber-300" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-semibold text-white">Yahtzee Bonus</span>
            <span className="text-xs text-slate-400">100 per ✓ (max 3)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i < count ? 'bg-amber-400' : 'bg-white/15'}`}
              />
            ))}
          </div>
          <span className="min-w-[3ch] text-right font-display text-base font-bold text-white">
            {count * 100}
          </span>
          <button
            onClick={onIncrement}
            disabled={!canIncrement || count >= 3}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Add Yahtzee bonus"
          >
            <span className="text-base font-bold leading-none">+</span>
          </button>
        </div>
      </div>
    </li>
  );
}

/* -------------------- Desktop table -------------------- */

function DesktopTable({
  currentGame,
  players,
  leaderName,
  currentPlayerName,
  onOpen,
  onYahtzeeBonus,
  upperTotal,
  bonus,
  lowerTotal,
  grandTotal,
}: {
  currentGame: {
    id: number;
    currentPlayerIndex: number;
    scores: { [k: string]: { [k: string]: number | null } };
  };
  players: { name: string }[];
  leaderName: string | null;
  currentPlayerName: string | undefined;
  onOpen: (playerName: string, category: Category) => void;
  onYahtzeeBonus: (playerName: string) => void;
  upperTotal: (p: string) => number;
  bonus: (p: string) => number;
  lowerTotal: (p: string) => number;
  grandTotal: (p: string) => number;
}) {
  const renderCell = (cat: Category, playerName: string, isCurrent: boolean) => {
    const value = currentGame.scores[playerName]?.[cat.name];
    const isFilled = value !== undefined;
    const isMyTurn = playerName === currentPlayerName;
    const canTap = isFilled || isMyTurn;
    return (
      <td
        key={playerName}
        className={`border-b border-white/5 px-2 py-1.5 text-center ${
          isCurrent ? 'bg-amber-400/10' : ''
        }`}
      >
        <button
          onClick={() => onOpen(playerName, cat)}
          disabled={!canTap}
          aria-label={`Set ${cat.name} score for ${playerName}`}
          className={`group relative inline-flex h-9 w-full min-w-[3rem] items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
            isFilled
              ? 'cursor-pointer text-white hover:bg-white/10'
              : isMyTurn
                ? 'cursor-pointer text-amber-200 hover:bg-amber-400/15 hover:text-amber-100'
                : 'text-slate-500'
          }`}
        >
          {isFilled ? (
            value
          ) : isMyTurn ? (
            <span className="text-base font-bold opacity-60 group-hover:opacity-100">+</span>
          ) : (
            <span className="opacity-40">—</span>
          )}
        </button>
      </td>
    );
  };

  return (
    <div className="glass-strong hidden overflow-x-auto rounded-2xl md:block">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.03]">
            <th className="sticky left-0 z-10 bg-[#161630]/80 px-4 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider text-slate-400 backdrop-blur">
              Category
            </th>
            <th className="px-4 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
              How to Score
            </th>
            {players.map((player, index) => {
              const isCurrent = index === currentGame.currentPlayerIndex;
              return (
                <th
                  key={player.name}
                  className={`px-2 py-3 text-center font-display text-xs font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-amber-300' : 'text-slate-300'
                  }`}
                >
                  {player.name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <SectionHeader title="Upper Section" colSpan={2 + players.length} />
          {upperSectionCategories.map((category) => (
            <tr key={category.name} className="hover:bg-white/[0.02]">
              <td className="sticky left-0 z-10 bg-[#161630]/70 px-4 py-1.5 font-semibold text-white backdrop-blur">
                {category.name}
              </td>
              <td className="px-4 py-1.5 text-xs text-slate-400">{category.description}</td>
              {players.map((player, index) =>
                renderCell(category, player.name, index === currentGame.currentPlayerIndex)
              )}
            </tr>
          ))}
          <SubtotalRow
            label="Upper Total"
            players={players}
            currentIndex={currentGame.currentPlayerIndex}
            value={(p) => upperTotal(p)}
          />
          <SubtotalRow
            label="Bonus (63+ → 35)"
            players={players}
            currentIndex={currentGame.currentPlayerIndex}
            value={(p) => bonus(p)}
            highlightWhen={(p) => bonus(p) > 0}
          />
          <SubtotalRow
            label="Upper + Bonus"
            players={players}
            currentIndex={currentGame.currentPlayerIndex}
            value={(p) => upperTotal(p) + bonus(p)}
            emphasis
          />

          <SectionHeader title="Lower Section" colSpan={2 + players.length} />
          {lowerSectionCategories.map((category) => (
            <tr key={category.name} className="hover:bg-white/[0.02]">
              <td className="sticky left-0 z-10 bg-[#161630]/70 px-4 py-1.5 font-semibold text-white backdrop-blur">
                {category.name}
              </td>
              <td className="px-4 py-1.5 text-xs text-slate-400">{category.description}</td>
              {players.map((player, index) =>
                renderCell(category, player.name, index === currentGame.currentPlayerIndex)
              )}
            </tr>
          ))}

          <tr className="bg-gradient-to-r from-violet-500/[0.08] to-cyan-500/[0.05]">
            <td className="sticky left-0 z-10 bg-[#161630]/80 px-4 py-2 font-semibold text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <CrownIcon className="h-4 w-4 text-amber-300" />
                Yahtzee Bonus
              </div>
            </td>
            <td className="px-4 py-2 text-xs text-slate-400">100 per ✓ (max 3)</td>
            {players.map((player, index) => {
              const count = currentGame.scores[player.name]?.['YAHTZEE BONUS'] || 0;
              const isCurrent = index === currentGame.currentPlayerIndex;
              const isMyTurn = player.name === currentPlayerName;
              return (
                <td
                  key={player.name}
                  className={`border-b border-white/5 px-2 py-2 ${
                    isCurrent ? 'bg-amber-400/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-0.5" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < count ? 'bg-amber-400' : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="min-w-[2ch] text-right text-sm font-bold text-white">
                      {count * 100}
                    </span>
                    <button
                      onClick={() => onYahtzeeBonus(player.name)}
                      disabled={!isMyTurn || count >= 3}
                      aria-label={`Add Yahtzee bonus for ${player.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white shadow transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <span className="text-sm font-bold leading-none">+</span>
                    </button>
                  </div>
                </td>
              );
            })}
          </tr>

          <SubtotalRow
            label="Lower Total"
            players={players}
            currentIndex={currentGame.currentPlayerIndex}
            value={(p) => lowerTotal(p)}
          />

          <tr className="bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15">
            <td
              className="sticky left-0 z-10 bg-[#161630]/90 px-4 py-3 font-display text-base font-bold text-white backdrop-blur"
              colSpan={2}
            >
              Grand Total
            </td>
            {players.map((player) => {
              const total = grandTotal(player.name);
              const isLeader = leaderName === player.name;
              return (
                <td
                  key={player.name}
                  className={`px-2 py-3 text-center font-display text-lg font-bold ${
                    isLeader ? 'gradient-text' : 'text-white'
                  }`}
                >
                  {total}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ title, colSpan }: { title: string; colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="bg-white/[0.04] px-4 py-2 font-display text-[11px] font-bold uppercase tracking-widest text-slate-400"
      >
        {title}
      </td>
    </tr>
  );
}

function SubtotalRow({
  label,
  players,
  currentIndex,
  value,
  emphasis,
  highlightWhen,
}: {
  label: string;
  players: { name: string }[];
  currentIndex: number;
  value: (p: string) => number;
  emphasis?: boolean;
  highlightWhen?: (p: string) => boolean;
}) {
  return (
    <tr className={emphasis ? 'bg-white/[0.04]' : 'bg-white/[0.02]'}>
      <td
        colSpan={2}
        className={`sticky left-0 z-10 bg-[#161630]/80 px-4 py-2 backdrop-blur ${
          emphasis
            ? 'font-display text-sm font-bold text-white'
            : 'text-xs font-semibold text-slate-300'
        }`}
      >
        {label}
      </td>
      {players.map((p, i) => {
        const v = value(p.name);
        const isCurrent = i === currentIndex;
        const highlighted = highlightWhen?.(p.name);
        return (
          <td
            key={p.name}
            className={`px-2 py-2 text-center ${
              emphasis ? 'font-bold text-white' : 'text-sm text-slate-200'
            } ${isCurrent ? 'bg-amber-400/10' : ''} ${highlighted ? 'text-emerald-300' : ''}`}
          >
            {v}
          </td>
        );
      })}
    </tr>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
