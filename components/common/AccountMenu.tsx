"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/route";
import {
  getRoleCookie,
  getRoleHomePath,
  getRoleLabel,
  type UserRole,
} from "@/lib/auth/roles";
import { getCurrentUser, observeAuthState } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import type { User as FirebaseUser } from "firebase/auth";

type AccountMenuProps = {
  className?: string;
  compact?: boolean;
};

function getInitials(value: string | null | undefined): string {
  if (!value) {
    return "A";
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    const first = parts[0] ?? "A";

    return first.slice(0, 2).toUpperCase();
  }

  const first = parts[0] ?? "A";
  const second = parts[1] ?? "";

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

function getSettingsPath(role: UserRole | null): string {
  if (role === "physician") {
    return ROUTES.PHYSICIAN.SETTINGS;
  }

  return ROUTES.PATIENT.SETTINGS;
}

export function AccountMenu({ className, compact = false }: AccountMenuProps) {
  const [user, setUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const role = getRoleCookie();

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      setUser(nextUser);
    });

    return unsubscribe;
  }, []);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const detailLabel =
    user?.email || (role ? `${getRoleLabel(role)} session` : null);
  const initials = getInitials(user?.displayName || user?.email);
  const homePath = role ? getRoleHomePath(role) : ROUTES.AUTH.LOGIN;
  const settingsPath = getSettingsPath(role);
  const triggerLabel =
    displayName === "Account" ? "Account menu" : `${displayName} account menu`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className={cn(
            "inline-flex items-center gap-3 rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-3 py-2 text-left shadow-[0_14px_32px_rgba(9,30,36,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-bg)]",
            compact && "px-2.5 py-2",
            className
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {!compact ? (
            <span className="grid min-w-0">
              <strong className="truncate text-sm font-semibold leading-5 text-[color:var(--ui-text)]">
                {displayName}
              </strong>
              {detailLabel ? (
                <span className="truncate text-xs leading-5 text-[color:var(--ui-muted)]">
                  {detailLabel}
                </span>
              ) : null}
            </span>
          ) : null}

          <ChevronDown size={16} className="shrink-0 text-[color:var(--ui-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="min-w-[16rem]">
        <DropdownMenuLabel>
          <div className="grid gap-0.5">
            <span className="text-sm font-semibold leading-5">{displayName}</span>
            {detailLabel ? (
              <span className="text-xs leading-5 text-[color:var(--ui-muted)]">
                {detailLabel}
              </span>
            ) : null}
            {role ? (
              <span className="pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--ui-accent)]">
                {getRoleLabel(role)}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={homePath} className="flex items-center gap-2">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={settingsPath} className="flex items-center gap-2">
            <Settings2 size={16} />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          asChild
          className="gap-2 text-[color:var(--ui-warning)] focus:text-[color:var(--ui-warning)]"
        >
          <Link href={ROUTES.AUTH.LOGOUT} className="flex items-center gap-2">
            <LogOut size={16} />
            <span>Sign out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
