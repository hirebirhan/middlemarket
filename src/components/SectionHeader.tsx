import { cn } from "@/lib/utils";

/**
 * The heading for a band of content inside a page.
 *
 * The rule underneath is what separates one section from the next, so the
 * spacing is asymmetric on purpose: tight to its own rule, generous below it.
 * A description is strongly encouraged — most of these sections show data whose
 * rules are invisible ("you only see offers we have already reviewed"), and one
 * sentence there prevents a whole category of confusion.
 */
export function SectionHeader({
  title,
  description,
  action,
  id,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-4",
        className
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="text-heading font-semibold">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
