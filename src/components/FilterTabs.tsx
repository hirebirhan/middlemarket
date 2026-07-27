import Link from "next/link";
import { cn } from "@/lib/utils";
import { listHref, type SearchParams } from "@/lib/list-params";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  /** Rendered as a trailing count. Shown even at zero — "0 declined" is an answer. */
  count?: number;
};

/**
 * The filter for a list, as links rather than a client-side control.
 *
 * Visually this is the same track-and-thumb as `Segmented`, deliberately: a
 * filter and a form's type-picker are the same gesture, and the product should
 * not invent two looks for it. The difference is underneath — `Segmented` is a
 * radiogroup that owns React state, this is navigation, so it ships no
 * JavaScript and the selection survives a reload.
 *
 * Selecting a filter always returns to page one; staying on page 4 of a list
 * you just narrowed to six rows is how people conclude a filter is broken.
 */
export function FilterTabs<T extends string>({
  options,
  value,
  paramKey,
  pageKey,
  basePath,
  params,
  label,
  className,
}: {
  options: readonly FilterOption<T>[];
  value: T;
  paramKey: string;
  /** Cleared whenever the filter changes. */
  pageKey?: string;
  basePath: string;
  params: SearchParams;
  /** Accessible name for the group, e.g. "Filter offers". */
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "flex w-full max-w-full flex-wrap gap-1 rounded-xl border border-input bg-muted p-1 sm:inline-flex sm:w-auto sm:flex-nowrap",
        className
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Link
            key={option.value}
            href={listHref(basePath, params, {
              // The default option clears the key instead of spelling it out.
              [paramKey]: option.value === options[0].value ? null : option.value,
              ...(pageKey ? { [pageKey]: null } : {}),
            })}
            // `page`, because each filter is a distinct URL — this is the one
            // that is currently rendered.
            aria-current={selected ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
              "transition duration-150 ease-soft",
              selected
                ? "bg-raised text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "tabular-nums",
                  selected ? "text-muted-foreground" : "opacity-70"
                )}
              >
                {option.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
