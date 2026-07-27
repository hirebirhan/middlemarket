import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * A person's avatar + name, inline. The stock shadcn `Avatar` takes an image
 * and a fallback, not a `name`, so this wrapper derives initials from the name
 * and renders them in `AvatarFallback`.
 *
 * Used in dashboards and list rows where only the name is known — there are no
 * profile images in this product.
 */
export function Identity({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar size={size} className={cn("bg-muted", className)}>
      <AvatarFallback>{initials || "?"}</AvatarFallback>
    </Avatar>
  );
}
