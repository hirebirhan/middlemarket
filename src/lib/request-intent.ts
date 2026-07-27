export const REQUEST_INTENT_TYPES = ["PRODUCT", "SERVICE"] as const;

export type RequestIntentType = (typeof REQUEST_INTENT_TYPES)[number];

export function readRequestIntentType(
  value: string | string[] | null | undefined
): RequestIntentType | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const normalized = first?.trim().toUpperCase();
  return REQUEST_INTENT_TYPES.includes(normalized as RequestIntentType)
    ? (normalized as RequestIntentType)
    : undefined;
}
