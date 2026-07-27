"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { MapPin, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Eyebrow } from "@/components/Typography";

type FooterColumn = {
  heading: string;
  links: { href: string; label: string }[];
};

const PUBLIC_COLUMNS: FooterColumn[] = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/services", label: "Services" },
    ],
  },
  {
    heading: "Buyers",
    links: [{ href: "/register?role=BUYER", label: "Post a request" }],
  },
  {
    heading: "Shops",
    links: [
      { href: "/register?role=SELLER", label: "Start selling" },
      { href: "/login", label: "Log in" },
    ],
  },
];

function signedInColumns(role: Role, userHome: string): FooterColumn[] {
  if (role === "ADMIN") {
    return [
      {
        heading: "Admin",
        links: [
          { href: userHome, label: "Overview" },
          { href: "/admin/queue", label: "Review queue" },
        ],
      },
      {
        heading: "Operations",
        links: [
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/decisions", label: "Decisions" },
        ],
      },
    ];
  }

  if (role === "SELLER") {
    return [
      {
        heading: "Shop",
        links: [
          { href: userHome, label: "Quote requests" },
          { href: "/seller/offers", label: "Your offers" },
        ],
      },
      {
        heading: "MiddleMarket",
        links: [{ href: "/", label: "Home" }],
      },
    ];
  }

  return [
    {
      heading: "Buyer",
      links: [
        { href: userHome, label: "Dashboard" },
        { href: "/buyer/new", label: "New request" },
      ],
    },
    {
      heading: "MiddleMarket",
      links: [{ href: "/", label: "Home" }],
    },
  ];
}

export default function SiteFooter({
  userRole,
  userHome,
}: {
  userRole: Role | null;
  userHome: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const columns = userRole ? signedInColumns(userRole, userHome) : PUBLIC_COLUMNS;

  if (isAdmin) {
    return (
      <footer className="border-t border-border bg-sidebar/50 px-4 py-3 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
            <span className="font-medium text-foreground">
              Control Room
            </span>
            <span aria-hidden="true">·</span>
            <span>MiddleMarket Admin Console</span>
          </div>

          <div className="flex items-center gap-4 text-2xs">
            <Link href="/admin" className="hover:text-foreground">
              Overview
            </Link>
            <Link href="/admin/queue" className="hover:text-foreground">
              Queue
            </Link>
            <Link href="/admin/orders" className="hover:text-foreground">
              Orders
            </Link>
            <Link href="/admin/decisions" className="hover:text-foreground">
              Decisions
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-2xs">
            <MapPin className="size-3 text-muted-foreground" aria-hidden="true" />
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <span className="flex items-center gap-2">
              <LogoMark className="size-5" />
              <span className="font-display text-base font-semibold tracking-tight">
                MiddleMarket
              </span>
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              A mediated marketplace for Addis Ababa. Every price is checked by
              a person before it reaches a buyer.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <Eyebrow as="p">{column.heading}</Eyebrow>
              <ul className="mt-2 space-y-0.5 text-sm">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-6 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MiddleMarket</p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            Addis Ababa, Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
