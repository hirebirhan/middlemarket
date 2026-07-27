import { CalendarDays, CircleDollarSign, Send, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import type { MoneyLike } from "@/lib/money";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import OfferForm from "@/components/OfferForm";
import StatusBadge from "@/components/StatusBadge";
import { Alert } from "@/components/ui/alert";
import { Identity } from "@/components/Identity";
import { Money } from "@/components/Typography";

type SellerRequestCardProps = {
  request: {
    id: string;
    type: "PRODUCT" | "SERVICE";
    title: string;
    sku: string | null;
    description: string;
    budget: MoneyLike | null;
    createdAt: Date;
    buyer: { name: string };
  };
  liveOffer:
    | {
        status: string;
        price: MoneyLike;
      }
    | undefined;
  latestRejectedOffer:
    | {
        price: MoneyLike;
        adminNote: string | null;
      }
    | undefined;
  className?: string;
};

function RequestFact({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{value}</span>
    </span>
  );
}

export function SellerRequestCard({
  request,
  liveOffer,
  latestRejectedOffer,
  className,
}: SellerRequestCardProps) {
  const budget = formatMoney(request.budget);
  const wasRejected = !liveOffer && latestRejectedOffer;

  return (
    <article
      className={cn(
        "h-full rounded-card border border-border bg-card shadow-sm transition-colors duration-150 ease-soft hover:border-border-strong",
        className
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="line-clamp-1 text-base leading-snug font-semibold text-foreground">
                  {request.title}
                </h3>
                <StatusBadge value={request.type} />
              </div>
              {request.sku && (
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {request.sku}
                </p>
              )}
            </div>
            {liveOffer && <StatusBadge value={liveOffer.status} />}
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {request.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
            <RequestFact
              icon={UserRound}
              label="Buyer"
              value={
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Identity name={request.buyer.name} size="sm" />
                  <span className="truncate">{request.buyer.name}</span>
                </span>
              }
            />
            <RequestFact
              icon={CircleDollarSign}
              label="Budget"
              value={
                budget ? (
                  <>
                    Budget <Money>{budget}</Money>
                  </>
                ) : (
                  "No budget"
                )
              }
            />
            <RequestFact
              icon={CalendarDays}
              label="Posted"
              value={
                <time dateTime={request.createdAt.toISOString()}>
                  Posted {request.createdAt.toLocaleDateString()}
                </time>
              }
            />
          </div>

          {wasRejected && (
            <Alert variant="destructive" className="mt-4">
              <p className="font-medium">
                Your offer of {formatMoney(latestRejectedOffer.price)} was not
                approved.
              </p>
              {latestRejectedOffer.adminNote && (
                <p>{latestRejectedOffer.adminNote}</p>
              )}
              <p>You can send a new price for this request.</p>
            </Alert>
          )}
        </div>

        <div className="mt-auto flex min-w-0 items-start">
          {liveOffer ? (
            <div className="text-sm">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Send className="size-4 text-muted-foreground" aria-hidden="true" />
                Offer sent
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You offered{" "}
                <Money className="font-semibold text-foreground">
                  {formatMoney(liveOffer.price)}
                </Money>
                . It stays here while the marketplace reviews it.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <OfferForm
                requestId={request.id}
                budget={budget}
                requestType={request.type}
                requestTitle={request.title}
                requestSummary={request.sku ?? request.description}
                label={wasRejected ? "Send a new price" : "Make an offer"}
                buttonClassName="mt-0 w-full justify-center sm:w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
