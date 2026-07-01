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
        "patient-nav z-40 mx-auto w-full max-w-2xl",
        className
      )}
    >
      <div className="patient-nav__shell grid grid-cols-5 gap-2 rounded-[1.85rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-2.5 shadow-[0_22px_60px_rgba(9,30,36,0.16)] backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "patient-nav__item grid justify-items-center gap-1 rounded-[1.45rem] px-2 py-2 text-center text-xs font-medium transition duration-200",
                item.accent
                  ? "bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)] shadow-[0_10px_26px_rgba(11,101,116,0.16)]"
                  : active
                    ? "bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]"
                    : "text-[color:var(--ui-muted)] hover:bg-[color:var(--ui-accent-soft)] hover:text-[color:var(--ui-accent)]"
              )}
            >
              <span
                className={cn(
                  "patient-nav__icon grid h-11 w-11 place-items-center rounded-full border border-transparent transition duration-200",
                  item.accent
                    ? "bg-[color:var(--ui-accent)] text-white shadow-[0_8px_18px_rgba(11,101,116,0.24)]"
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

      <style jsx>{`
        .patient-nav {
          position: fixed;
          left: 50%;
          bottom: calc(1rem + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          padding-inline: 0.5rem;
        }

        .patient-nav__item {
          min-height: 4.75rem;
        }

        .patient-nav__item[aria-current="page"] {
          transform: translateY(-1px);
        }

        .patient-nav__item:hover .patient-nav__icon {
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .patient-nav {
            width: min(calc(100% - 0.75rem), 42rem);
            bottom: calc(0.75rem + env(safe-area-inset-bottom));
            padding-inline: 0;
          }

          .patient-nav__item {
            min-height: 4.5rem;
            padding-inline: 0.35rem;
          }
        }
      `}</style>
    </nav>
  );
}
