"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";

export function Sidebar({
  homeHref,
  subtitle,
  items,
  accountName,
  accountDetail,
  accountEmoji,
  exitHref,
  exitLabel,
}: {
  homeHref: string;
  subtitle: string;
  items: NavItem[];
  accountName: string;
  accountDetail: string;
  accountEmoji: string;
  exitHref: string;
  exitLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-[248px] shrink-0 flex-col border-r-[1.5px] border-sage-line bg-cream">
      <Link href={homeHref} className="block px-6 pb-5 pt-7">
        <span className="font-display text-[26px] font-bold leading-none text-brand-dark">
          GoodFood
        </span>
        <span className="mt-1.5 block text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
          {subtitle}
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {items.map((item) => {
          const active =
            item.href === homeHref
              ? pathname === homeHref
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-sage hover:text-brand-dark"
              }`}
            >
              <span aria-hidden className="w-5 text-center text-base">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-[1.5px] border-sage-line px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="blob-b flex h-10 w-10 shrink-0 items-center justify-center bg-sage text-lg">
            {accountEmoji}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold">{accountName}</div>
            <div className="truncate text-[11px] text-muted">
              {accountDetail}
            </div>
          </div>
        </div>
        <Link
          href={exitHref}
          className="mt-3 block rounded-full border-[1.5px] border-sage-line bg-white py-2 text-center text-[11.5px] font-bold text-muted hover:border-brand hover:text-brand-dark"
        >
          {exitLabel}
        </Link>
      </div>
    </aside>
  );
}
