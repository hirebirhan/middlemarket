import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, ClipboardList, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { readParam, type SearchParams } from "@/lib/list-params";
import { readRequestIntentType } from "@/lib/request-intent";
import NewRequestForm from "@/components/NewRequestForm";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/Typography";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Post a request",
  description:
    "Describe what you need so sellers can quote and MiddleMarket can review the price before you decide.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewBuyerRequestPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "BUYER") redirect(user.role === "ADMIN" ? "/admin" : "/seller");

  const params = await searchParams;
  const need = readParam(params, "need");
  const requestType = readRequestIntentType(params.type);

  return (
    <Container className="space-y-8">
      <PageHeader
        eyebrow="Buyer"
        title="Post a request"
        description="Start with the thing you need. The platform does not ask you to choose a seller until reviewed offers come back."
        action={
          <Link
            href="/buyer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <NewRequestForm
          initialTitle={need}
          initialType={requestType}
          variant="page"
          redirectTo="/buyer#requests"
        />

        <aside className="rounded-card border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-semibold">What happens next</h2>
          <ol className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <ClipboardList className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium">Shops see your request</span>
                <span className="text-muted-foreground">
                  They quote against the details and budget you provide.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium">We review each offer</span>
                <span className="text-muted-foreground">
                  Buyers only see offers after an admin price check.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <BadgeCheck className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-medium">You decide</span>
                <span className="text-muted-foreground">
                  Accepting an offer places the order. Until then, you are not
                  committed.
                </span>
              </span>
            </li>
          </ol>

          <div className="mt-5 rounded-lg border border-warning-border bg-warning p-3 text-sm text-warning-foreground">
            Combined product-and-service requests are not structured yet. For
            now, choose the closest type and describe the full need in Details.
          </div>
        </aside>
      </div>
    </Container>
  );
}
