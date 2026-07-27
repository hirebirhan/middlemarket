"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/Container";

/**
 * What a person sees when a page throws.
 *
 * Deliberately not a stack trace and not a shrug. It says what happened in
 * plain words, offers the one action that usually fixes it, and gives a way
 * out if it doesn't. The digest is shown small because it is the only thing
 * that makes a support conversation possible — but it is never the headline.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="narrow" className="flex flex-col items-center py-section text-center">
      <span className="grid size-12 place-items-center rounded-full bg-danger text-danger-foreground">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-title font-semibold">
        Something went wrong at our end
      </h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        This one is on us, not on you. Nothing you submitted has been lost —
        try again, and if it keeps happening let us know.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 font-mono text-2xs text-muted-foreground">
          Reference {error.digest}
        </p>
      )}
    </Container>
  );
}
