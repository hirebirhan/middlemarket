import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container size="narrow" className="flex flex-col items-center py-section text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-title font-semibold">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        The link may be out of date, or the page may have moved. Everything you
        can do on MiddleMarket starts from one of these.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Back to home
        </Link>
        <Link
          href="/register?role=BUYER"
          className={buttonVariants({ variant: "outline" })}
        >
          Post a request
        </Link>
      </div>
    </Container>
  );
}
