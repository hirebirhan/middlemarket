import { cn } from "@/lib/utils";

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
        "mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2",
        className
      )}
    >
      <div>
        <h2 id={id} className="text-heading font-semibold">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
