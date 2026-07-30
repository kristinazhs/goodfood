"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "@/components/ui/icons";
import type { NavItem } from "@/lib/nav";

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex shrink-0 justify-around border-t border-sage-line bg-white px-2 pb-[18px] pt-2.5">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.iconKey ? NAV_ICONS[item.iconKey] : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            // 44px minimum touch target, per the design's accessibility pass.
            className="flex min-h-[44px] min-w-16 flex-col items-center justify-center gap-[5px]"
          >
            <span className="flex h-[22px] items-center justify-center leading-none">
              {Icon ? (
                <Icon active={active} />
              ) : (
                <span className="text-lg">{item.icon}</span>
              )}
            </span>
            <span
              className={`text-xs leading-none ${
                active ? "font-bold text-brand" : "font-semibold text-muted"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
