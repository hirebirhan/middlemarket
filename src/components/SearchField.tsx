"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * Search for a server-rendered list.
 *
 * It is a real `<form>` first and a live search second: typing filters after a
 * pause, but pressing Enter submits immediately, and with JavaScript disabled
 * the GET submission still works. The URL is the state, so a search can be
 * shared and survives a reload.
 *
 * `replace` rather than `push`, so a ten-character query does not leave ten
 * history entries between the user and the page they arrived from.
 */
export function SearchField({
  paramKey,
  pageKey,
  placeholder,
  label,
  className,
}: {
  paramKey: string;
  /** Cleared on every new search — results for a new term start at page one. */
  pageKey?: string;
  placeholder: string;
  /** Accessible name. There is no visible label; the icon and placeholder are visual. */
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const committed = params.get(paramKey) ?? "";
  const [value, setValue] = useState(committed);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keeps the box honest when the URL changes from outside it — a filter link,
  // the back button, or the "clear search" action in an empty state.
  //
  // Adjusted during render against the last URL we saw, rather than in an
  // effect. React re-runs this component immediately without painting the
  // stale value, where the effect version would paint the old text first and
  // then correct it.
  const [lastCommitted, setLastCommitted] = useState(committed);
  if (committed !== lastCommitted) {
    setLastCommitted(committed);
    setValue(committed);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(next: string) {
    const query = new URLSearchParams(params.toString());
    const trimmed = next.trim();
    if (trimmed) query.set(paramKey, trimmed);
    else query.delete(paramKey);
    if (pageKey) query.delete(pageKey);

    const search = query.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  }

  // Debounced so a five-word search is one query, not five. 300ms covers
  // ordinary typing without feeling laggy. Driven from the change handler
  // rather than from an effect: the keystroke is the event, and an effect here
  // would have to re-fire on every unrelated re-render to stay correct.
  function onChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), 300);
  }

  // A pending keystroke must not fire a navigation after the field is gone.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        commit(value);
      }}
      className={cn("relative", className)}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        name={paramKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "h-10 pr-10 pl-9",
          // Safari draws its own clear button on type="search"; this component
          // provides one that matches the rest of the app.
          "[&::-webkit-search-cancel-button]:appearance-none"
        )}
      />

      <span className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center text-muted-foreground">
        {pending ? (
          <Spinner aria-label="Searching" className="size-4" />
        ) : (
          value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                commit("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid size-6 place-items-center rounded-md transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )
        )}
      </span>
    </form>
  );
}
