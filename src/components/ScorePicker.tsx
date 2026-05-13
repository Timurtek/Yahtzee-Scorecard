'use client';

import React, { useEffect, useRef, useState } from 'react';

export type CategoryKind =
  | { type: 'multiples'; step: number; max: number } // upper: 0..max step
  | { type: 'fixed'; value: number } // Full House (25), SM Straight (30), LG Straight (40), YAHTZEE (50)
  | { type: 'sum'; min: number; max: number }; // 3/4 of a Kind, Chance

export type PickerCategory = {
  name: string;
  description: string;
  kind: CategoryKind;
};

type Props = {
  category: PickerCategory;
  playerName: string;
  existingValue: number | undefined;
  onSave: (value: number) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function ScorePicker({
  category,
  playerName,
  existingValue,
  onSave,
  onClear,
  onClose,
}: Props) {
  const [value, setValue] = useState<number | null>(existingValue ?? null);
  const [inputText, setInputText] = useState(
    existingValue !== undefined ? String(existingValue) : ''
  );
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the sheet so screen readers announce it and Tab order starts inside
    sheetRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const isExisting = existingValue !== undefined;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderControls = () => {
    if (category.kind.type === 'multiples') {
      const { step, max } = category.kind;
      const options: number[] = [];
      for (let v = 0; v <= max; v += step) options.push(v);
      return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {options.map((v) => (
            <PickerButton key={v} selected={value === v} onClick={() => setValue(v)}>
              {v}
            </PickerButton>
          ))}
        </div>
      );
    }

    if (category.kind.type === 'fixed') {
      const v = category.kind.value;
      return (
        <div className="grid grid-cols-2 gap-3">
          <BigToggle
            tone="emerald"
            selected={value === v}
            onClick={() => setValue(v)}
            label={`Got it`}
            sub={`Score ${v}`}
          />
          <BigToggle
            tone="rose"
            selected={value === 0}
            onClick={() => setValue(0)}
            label={`Scratch`}
            sub={`Score 0`}
          />
        </div>
      );
    }

    // sum
    const { min, max } = category.kind;
    const presets = [0];
    for (let v = min; v <= max; v += 1) presets.push(v);
    const setBoth = (n: number) => {
      setValue(n);
      setInputText(String(n));
    };
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={max}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              const n = parseInt(e.target.value, 10);
              setValue(Number.isFinite(n) ? n : null);
            }}
            placeholder={`0 or ${min}–${max}`}
            className="input-field w-full text-base"
            autoFocus
            aria-label={`Enter score for ${category.name}`}
          />
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {presets.map((v) => (
            <PickerButton key={v} small selected={value === v} onClick={() => setBoth(v)}>
              {v}
            </PickerButton>
          ))}
        </div>
      </div>
    );
  };

  const isValid = (() => {
    if (value === null || !Number.isInteger(value)) return false;
    if (category.kind.type === 'multiples') {
      const { step, max } = category.kind;
      return value >= 0 && value <= max && value % step === 0;
    }
    if (category.kind.type === 'fixed') {
      return value === 0 || value === category.kind.value;
    }
    const { min, max } = category.kind;
    return value === 0 || (value >= min && value <= max);
  })();

  const handleSave = () => {
    if (!isValid || value === null) return;
    onSave(value);
  };

  return (
    <div
      onMouseDown={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="glass-strong sheet-in flex max-h-[88vh] w-full flex-col gap-5 overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:p-6 md:max-h-[80vh] md:max-w-lg md:rounded-3xl md:pb-6"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-white/20 md:hidden" aria-hidden="true" />

        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">{playerName}</p>
            <h2 id="picker-title" className="font-display text-2xl font-bold text-white">
              {category.name}
            </h2>
            <p className="text-sm text-slate-400">{category.description}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div>{renderControls()}</div>

        <footer className="flex flex-wrap items-center gap-2">
          {isExisting && (
            <button
              onClick={onClear}
              className="btn btn-danger focus-visible:ring-rose-400"
              aria-label="Clear score"
            >
              <TrashIcon className="h-4 w-4" />
              Clear
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="btn btn-ghost focus-visible:ring-white/50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="btn btn-success focus-visible:ring-emerald-400"
            >
              <CheckIcon className="h-4 w-4" />
              Save{value !== null && isValid ? ` ${value}` : ''}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PickerButton({
  children,
  selected,
  onClick,
  small,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border font-display font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
        small ? 'min-h-[40px] px-2 py-1.5 text-sm' : 'min-h-[56px] px-3 py-3 text-xl'
      } ${
        selected
          ? 'border-emerald-400/60 bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.18)]'
          : 'border-white/10 bg-white/[0.05] text-slate-200 hover:border-white/25 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function BigToggle({
  tone,
  selected,
  onClick,
  label,
  sub,
}: {
  tone: 'emerald' | 'rose';
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  const tones = {
    emerald: selected
      ? 'border-emerald-400/60 bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.18)]'
      : 'border-white/10 bg-white/[0.05] text-slate-200 hover:border-emerald-400/40',
    rose: selected
      ? 'border-rose-400/60 bg-gradient-to-br from-rose-500/30 to-rose-600/10 text-white shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
      : 'border-white/10 bg-white/[0.05] text-slate-200 hover:border-rose-400/40',
  } as const;
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[88px] flex-col items-start justify-center gap-1 rounded-2xl border px-5 py-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${tones[tone]}`}
    >
      <span className="font-display text-lg font-bold">{label}</span>
      <span className="text-sm text-slate-400">{sub}</span>
    </button>
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
