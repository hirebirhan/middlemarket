import type { User } from "@prisma/client";
import AuthNav from "@/components/AuthNav";
import DashboardLink from "@/components/DashboardLink";
import { Identity } from "@/components/Identity";
import { Logo } from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import PublicNav from "@/components/PublicNav";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader({
  user,
  home,
}: {
  user: Pick<User, "name" | "role"> | null;
  home: string;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-page items-center gap-3 px-4 sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-5">
          <Logo compact={Boolean(user)} className="shrink-0" />
          {!user && <PublicNav />}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <DashboardLink href={home} />
              <span className="hidden min-w-0 items-center gap-2 pl-1 sm:flex">
                <Identity name={user.name} size="sm" />
                <span className="max-w-32 truncate text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <AuthNav />
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
