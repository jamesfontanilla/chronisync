"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  LayoutDashboard,
  MoreHorizontal,
  PlusCircle,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BottomNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  accent?: boolean;
};

const NAV_ITEMS: BottomNavItem[] = [
  {
    href: "/patient/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/patient/diary",
    label: "Diary",
    icon: BookOpenText,
  },
  {
    href: "/patient/add",
    label: "Add",
    icon: PlusCircle,
    accent: true,
  },
  {
    href: "/patient/partners",
    label: "Partners",
    icon: Users,
  },
  {
    href: "/patient/more",
    label: "More",
    icon: MoreHorizontal,
  },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Patient navigation"
      className={cn(
        "sticky bottom-4 z-30 mx-auto w-full max-w-2xl",
        className
      )}
    >
      <div className="grid grid-cols-5 gap-2 rounded-[1.8rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-2 shadow-[0_20px_60px_rgba(9,30,36,0.15)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid justify-items-center gap-1 rounded-[1.35rem] px-2 py-2 text-center text-xs font-medium transition",
                item.accent
                  ? "bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)] shadow-sm"
                  : active
                    ? "bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]"
                    : "text-[color:var(--ui-muted)] hover:bg-[color:var(--ui-accent-soft)] hover:text-[color:var(--ui-accent)]"
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border border-transparent",
                  item.accent
                    ? "bg-[color:var(--ui-accent)] text-white"
                    : active
                      ? "border-[color:var(--ui-accent)] bg-white/70 text-[color:var(--ui-accent)]"
                      : "bg-transparent text-[color:var(--ui-muted)]"
                )}
              >
                <Icon size={18} />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
