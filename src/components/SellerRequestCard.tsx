import { CalendarDays, CircleDollarSign, Send, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import type { MoneyLike } from "@/lib/money";
import { formatMoney } from "@/lib/money";
import { formatPostedAge } from "@/lib/time";
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
};

function RequestFact({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{value}</span>
    </span>
  );
}

/**
 * One row in the seller's quote queue. The seller's triage question is
 * "which requests should I quote now?", so the row leads with the brief and
 * budget and parks the action at the row's end — dense, scannable, no card
 * chrome of its own; the list container draws the boundaries.
 */
export function SellerRequestCard({
  request,
  liveOffer,
  latestRejectedOffer,
}: SellerRequestCardProps) {
  const budget = formatMoney(request.budget);
  const wasRejected = !liveOffer && latestRejectedOffer;

  return (
    <article className="flex flex-col gap-3 p-4 transition-colors duration-150 ease-soft hover:bg-accent/50 sm:px-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {request.title}
          </h3>
          <StatusBadge value={request.type} />
          {liveOffer && <StatusBadge value={liveOffer.status} />}
          {request.sku && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {request.sku}
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {request.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <RequestFact
            icon={UserRound}
            value={
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Identity name={request.buyer.name} size="sm" />
                <span className="truncate">{request.buyer.name}</span>
              </span>
            }
          />
          <RequestFact
            icon={CircleDollarSign}
            value={
              budget ? (
                <>
                  Budget{" "}
                  <Money className="font-semibold text-foreground">
                    {budget}
                  </Money>
                </>
              ) : (
                "No budget given"
              )
            }
          />
          <RequestFact
            icon={CalendarDays}
            value={
              <time
                dateTime={request.createdAt.toISOString()}
                title={request.createdAt.toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              >
                Posted {formatPostedAge(request.createdAt)}
              </time>
            }
          />
        </div>

        {wasRejected && (
          <Alert variant="destructive" className="mt-3">
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

      <div className="shrink-0 lg:w-52">
        {liveOffer ? (
          <div className="text-sm lg:text-right">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground lg:justify-end">
              <Send className="size-4 text-muted-foreground" aria-hidden="true" />
              Offer sent
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              You offered{" "}
              <Money className="font-semibold text-foreground">
                {formatMoney(liveOffer.price)}
              </Money>
              . It stays here while the marketplace reviews it.
            </p>
          </div>
        ) : (
          <OfferForm
            requestId={request.id}
            budget={budget}
            requestType={request.type}
            requestTitle={request.title}
            requestSummary={request.sku ?? request.description}
            label={wasRejected ? "Send a new price" : "Make an offer"}
            buttonClassName="mt-0 w-full justify-center lg:w-auto"
          />
        )}
      </div>
    </article>
  );
}
