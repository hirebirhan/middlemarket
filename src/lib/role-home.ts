import type { Role } from "@prisma/client";
import type { RequestIntentType } from "@/lib/request-intent";

export function getRoleHome(
  role: Role,
  options: {
    buyerNeed?: string | null;
    requestType?: RequestIntentType | null;
  } = {}
) {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";

  const params = new URLSearchParams();
  const buyerNeed = options.buyerNeed?.trim();
  if (buyerNeed) params.set("need", buyerNeed);
  if (options.requestType) params.set("type", options.requestType);

  const query = params.toString();
  return query ? `/buyer/new?${query}` : "/buyer";
}
