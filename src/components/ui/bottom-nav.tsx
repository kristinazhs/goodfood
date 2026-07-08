"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex justify-around border-t border-sage-line bg-white px-2 pb-4 pt-2.5">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-[3px] text-[10.5px] font-semibold ${
              active ? "text-brand" : "text-[#B5B5A8]"
            }`}
          >
            <span className="flex h-5 items-center justify-center text-lg leading-none">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
