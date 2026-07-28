import { ShieldCheck, TrendingDown } from "lucide-react";
import { formatMoney, type MoneyLike } from "@/lib/money";
import AcceptOfferButton from "@/components/AcceptOfferButton";
import { Identity } from "@/components/Identity";
import { OrderProgress } from "@/components/OrderProgress";
import StatusBadge from "@/components/StatusBadge";
import { Money } from "@/components/Typography";
import { Badge } from "@/components/ui/badge";

type BuyerOfferCardProps = {
  offer: {
    id: string;
    status: string;
    price: MoneyLike;
    adminPrice: MoneyLike | null;
    message: string;
    adminNote: string | null;
    condition: string | null;
    seller: { name: string };
    order: { status: string } | null;
  };
};

function savingOn(price: MoneyLike, adminPrice: MoneyLike | null) {
  if (adminPrice === null) return 0;
  const saving = Number(price.toString()) - Number(adminPrice.toString());
  return Number.isFinite(saving) && saving > 0 ? saving : 0;
}

export function BuyerOfferCard({ offer }: BuyerOfferCardProps) {
  const finalPrice = formatMoney(offer.adminPrice ?? offer.price);
  const askedPrice = formatMoney(offer.price);
  const wasAdjusted = offer.adminPrice !== null;
  const saving = savingOn(offer.price, offer.adminPrice);
  const reviewedShare = wasAdjusted
    ? Math.min(
        100,
        Math.round(
          (Number(offer.adminPrice?.toString()) /
            Number(offer.price.toString())) *
            100
        )
      )
    : null;

  return (
    <article className="grid gap-4 border-t border-border px-5 py-5 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(12rem,auto)]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Identity name={offer.seller.name} />
          <span className="font-medium">{offer.seller.name}</span>
          {offer.condition && <StatusBadge value={offer.condition} />}
          <Badge variant="outline">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Price reviewed
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Seller pitch
            </p>
            <p className="mt-1 text-sm text-foreground">{offer.message}</p>
          </div>
          {offer.adminNote && (
            <div className="rounded-lg border border-brand-border bg-brand-muted p-3">
              <p className="text-xs font-medium text-brand">From our review</p>
              <p className="mt-1 text-sm text-brand">{offer.adminNote}</p>
            </div>
          )}
        </div>

        {offer.order && (
          <div className="mt-4 max-w-sm">
            <OrderProgress status={offer.order.status} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4 md:items-end md:text-right">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Reviewed price
          </p>
          <Money className="mt-1 block text-title font-semibold text-foreground">
            {finalPrice}
          </Money>
          {wasAdjusted && (
            <p className="mt-1 text-xs text-muted-foreground">
              Seller asked{" "}
              <Money className="line-through">{askedPrice}</Money>
            </p>
          )}
        </div>

        {reviewedShare !== null && (
          <div className="w-full space-y-1.5" aria-hidden="true">
            <div className="h-1.5 rounded-pill bg-border" />
            <div
              className="h-1.5 rounded-pill bg-brand"
              style={{ width: `${reviewedShare}%` }}
            />
          </div>
        )}

        {saving > 0 && (
          <p className="inline-flex w-fit items-center gap-1 rounded-pill bg-brand-muted px-2.5 py-1 text-xs font-semibold text-brand">
            <TrendingDown className="size-3" aria-hidden="true" />
            You save {formatMoney(saving)}
          </p>
        )}

        {offer.status === "APPROVED" ? (
          <AcceptOfferButton offerId={offer.id} price={finalPrice ?? ""} />
        ) : (
          <StatusBadge value={offer.status} />
        )}
      </div>
    </article>
  );
}
