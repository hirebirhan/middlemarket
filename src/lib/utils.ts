import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Prices are Prisma `Decimal`, which stringifies to a bare "450" — formatting
 * here keeps every price in the app rendering as $450.00.
 */
export function formatMoney(value: { toString(): string } | null | undefined) {
  if (value === null || value === undefined) return null;
  const amount = Number(value.toString());
  return Number.isFinite(amount) ? currency.format(amount) : null;
}
