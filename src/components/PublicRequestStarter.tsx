import { ArrowRight, PencilLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { RequestIntentType } from "@/lib/request-intent";
import { cn } from "@/lib/utils";

export function PublicRequestStarter({
  id,
  requestType,
  label,
  placeholder,
  buttonLabel,
  className,
}: {
  id: string;
  requestType?: RequestIntentType;
  label: string;
  placeholder: string;
  buttonLabel: string;
  className?: string;
}) {
  const helperId = `${id}-hint`;

  return (
    <form
      action="/register"
      method="get"
      className={cn("w-full max-w-2xl", className)}
      aria-describedby={helperId}
    >
      <input type="hidden" name="role" value="BUYER" />
      {requestType && <input type="hidden" name="type" value={requestType} />}

      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <PencilLine
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={id}
              name="need"
              type="text"
              required
              maxLength={120}
              autoComplete="off"
              placeholder={placeholder}
              className="h-12 rounded-lg bg-card pl-10 pr-3 text-base shadow-md placeholder:text-muted-foreground md:text-base"
            />
          </div>
          <button
            type="submit"
            className={buttonVariants({
              variant: "default",
              size: "lg",
              className: "h-12 w-full rounded-lg px-5 sm:min-w-40 sm:w-auto",
            })}
          >
            {buttonLabel}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </button>
        </div>
        <p id={helperId} className="text-xs font-medium text-muted-foreground">
          Your wording carries through signup so you do not start over.
        </p>
      </div>
    </form>
  );
}
