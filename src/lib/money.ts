/**
 * Money formatting — one source of truth for every price in the product.
 *
 * MiddleMarket trades in Addis Ababa, so amounts are Ethiopian Birr. This
 * matters more than it looks: the app previously formatted with `currency:
 * "USD"`, so a seeded 62,000-birr iPhone rendered as "$62,000.00" — a figure
 * roughly fifty times the real price, sitting next to landing-page copy that
 * said ETB. A marketplace whose entire promise is "the price you see is the
 * right price" cannot show the wrong currency.
 *
 * Fraction digits are conditional rather than fixed at two: retail prices here
 * are whole birr, and "ETB 62,000.00" spends four characters saying nothing.
 * Amounts that genuinely carry santim still print them.
 */

export const CURRENCY = "ETB";

/** Locale is fixed so the server and the client can never format differently. */
const LOCALE = "en-US";

/**
 * `Intl` separates the currency code from the amount with U+00A0, which is
 * what keeps "ETB" from being left stranded at the end of a wrapped line.
 * Anything built by hand here has to use the same character or prices would
 * break differently depending on which function produced them.
 */
const NBSP = " ";

function formatter(amount: number) {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Anything with a `toString` — covers Prisma `Decimal`, `number` and `string`. */
export type MoneyLike = { toString(): string } | number | string;

/**
 * "ETB 54,500" / "ETB 54,500.50". Returns null for absent or unparseable
 * values so callers can decide what an unknown price should look like rather
 * than being handed a misleading "ETB 0".
 */
export function formatMoney(value: MoneyLike | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const amount = Number(value.toString());
  return Number.isFinite(amount) ? formatter(amount) : null;
}

/**
 * Shortens six- and seven-figure sums for headline metrics, where the exact
 * santim is noise and the width of a sidebar tile is the real constraint:
 * "ETB 1.2M". Below 10,000 it falls through to the full figure, because at
 * that size the abbreviation saves nothing and costs precision.
 */
export function formatMoneyCompact(
  value: MoneyLike | null | undefined
): string | null {
  if (value === null || value === undefined) return null;
  const amount = Number(value.toString());
  if (!Number.isFinite(amount)) return null;
  if (Math.abs(amount) < 10_000) return formatter(amount);

  const compact = new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return `${CURRENCY}${NBSP}${compact}`;
}
