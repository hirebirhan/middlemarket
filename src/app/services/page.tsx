import type { Metadata } from "next";
import { ClipboardList, MapPin, Timer } from "lucide-react";
import { PublicRequestTypePage } from "@/components/PublicRequestTypePage";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Describe the service you need and compare seller quotes after MiddleMarket reviews the price.",
};

export default function ServicesPage() {
  return (
    <PublicRequestTypePage
      type="SERVICE"
      eyebrow="Service Requests"
      title="Services"
      headline="Describe the work. Compare reviewed service quotes."
      description="Use MiddleMarket for clear service jobs where scope, location, and timing need to be quoted before you choose. Service requests use the same reviewed-offer flow as products today."
      ctaLabel="Start a service request"
      includeTitle="A service request needs scope before price."
      includeDescription="Services are harder to compare when the brief is vague. Give providers the job shape before they quote."
      includeItems={[
        {
          title: "Scope",
          body: "Describe the work, expected result, and anything included or excluded.",
          icon: ClipboardList,
        },
        {
          title: "Location",
          body: "Add where the work happens so providers can price travel and timing.",
          icon: MapPin,
        },
        {
          title: "Timing",
          body: "Say whether it is urgent, scheduled, one-time, or recurring.",
          icon: Timer,
        },
      ]}
      bestFor={[
        "Repair, installation, cleaning, setup, delivery, or maintenance jobs with a clear scope.",
        "Work where timing and location affect the offer.",
        "Services where you want another person to review the price before you compare.",
      ]}
      notFor={[
        "Milestone contracts with complex procurement terms.",
        "In-app payment, escrow, or dispute workflows.",
        "Jobs that need provider ratings or verification data the app does not store yet.",
      ]}
    />
  );
}
