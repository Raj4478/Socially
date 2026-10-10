import Link from "next/link";
import { cn } from "@/lib/utils";

/** Underlined tab strip driven by links, so each tab has its own URL. */
export default function TabLinks({ tabs, active }: { tabs: { href: string; label: string; value: string }[]; active: string }) {
  return (
    <nav className="flex" aria-label="Tabs">
      {tabs.map((t) => {
        const on = t.value === active;
        return (
          <Link
            key={t.value}
            href={t.href}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative flex flex-1 justify-center py-3.5 text-[15px] transition-colors hover:bg-accent/60",
              on ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {t.label}
            {on && <span className="absolute bottom-0 h-1 w-14 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
