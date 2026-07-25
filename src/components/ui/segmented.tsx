"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

/**
 * A choice between a few mutually exclusive options, styled as a track with a
 * raised selected thumb.
 *
 * Deliberately never uses `bg-primary`: a selected segment is a *state*, not an
 * action, and giving it the same solid fill as the submit button makes the two
 * compete for the eye. Keep the emphasis budget for the button.
 *
 * Implements the radiogroup pattern — arrow keys move between options and only
 * the selected option is a tab stop.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** Accessible name, e.g. "Account type". Visible labels come from <Field>. */
  label: string;
  className?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent) {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    const current = options.findIndex((o) => o.value === value);
    const next = (current + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-grid w-full gap-1 rounded-lg border border-input bg-muted p-1",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              // 44px tap target on touch devices
              "min-h-[2.5rem]",
              selected
                ? "bg-raised text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
