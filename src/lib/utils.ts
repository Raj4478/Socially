import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1234 → "1.2K" */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Short relative time: "now", "5m", "3h", "2d", or a date for older items. */
export function shortTimeAgo(iso: string, now = Date.now()): string {
  const date = new Date(iso);
  const secs = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (secs < 45) return "now";
  if (secs < 3600) return `${Math.max(1, Math.round(secs / 60))}m`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h`;
  if (secs < 7 * 86400) return `${Math.round(secs / 86400)}d`;
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString("en", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

export function displayName(user: { name: string | null; username: string }): string {
  return user.name?.trim() || user.username;
}
