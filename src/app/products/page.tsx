import type { Metadata } from "next";
import { BadgeCheck, ClipboardList, MapPin } from "lucide-react";
import { PublicRequestTypePage } from "@/components/PublicRequestTypePage";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Post the exact product you need and compare seller offers after MiddleMarket reviews the price.",
};

export default function ProductsPage() {
  return (
    <PublicRequestTypePage
      type="PRODUCT"
      eyebrow="Product Requests"
      title="Products"
      headline="Ask for the exact item. Compare after price review."
      description="Use MiddleMarket when model, condition, quantity, warranty, or delivery timing changes the price. Shops quote one clear request, and the buyer-visible price is reviewed before you decide."
      ctaLabel="Start a product request"
      includeTitle="A better product request gives sellers less room to guess."
      includeDescription="The more precise the brief, the easier it is for shops to quote the same thing and for MiddleMarket to review the price fairly."
      includeItems={[
        {
          title: "Exact item",
          body: "Name the product and model a shop would recognize.",
          icon: BadgeCheck,
        },
        {
          title: "Quantity and timing",
          body: "Say how many you need and when delivery matters.",
          icon: ClipboardList,
        },
        {
          title: "Delivery area",
          body: "Add the area in Addis Ababa so offers include realistic delivery.",
          icon: MapPin,
        },
      ]}
      bestFor={[
        "Products where model, condition, or warranty changes the fair price.",
        "Office items, electronics, furniture, and equipment that shops can quote clearly.",
        "Purchases where you want the price checked before choosing a seller.",
      ]}
      notFor={[
        "Browsing live shop inventory like an instant catalog.",
        "In-app payment, escrow, or checkout flows.",
        "Requests with many unrelated product lines in one brief.",
      ]}
    />
  );
}
