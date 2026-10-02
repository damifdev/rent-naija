"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, Home, LayoutGrid, Search } from "lucide-react";
import { Suspense } from "react";

function Items() {
  const path = usePathname();
  const tab = useSearchParams().get("tab");
  const items = [
    { href: "/", label: "Home", icon: Home, active: path === "/" },
    { href: "/listings", label: "Search", icon: Search, active: path.startsWith("/listings") },
    { href: "/dashboard?tab=saved", label: "Saved", icon: Heart, active: path === "/dashboard" && tab === "saved" },
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, active: (path.startsWith("/dashboard") || path.startsWith("/admin")) && tab !== "saved" },
  ];
  return (
    <ul className="mx-auto grid max-w-md grid-cols-4">
      {items.map(({ href, label, icon: Icon, active }) => (
        <li key={label}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-palm" : "text-clay"}`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function BottomNav() {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-stone bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <Suspense fallback={<div className="h-14" />}>
        <Items />
      </Suspense>
    </nav>
  );
}
