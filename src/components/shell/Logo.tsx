export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path d="M10 20.5c0 1.9 2.1 3.5 5.8 3.5 3.9 0 6.2-1.8 6.2-4.4 0-2.4-1.7-3.5-4.8-4.1l-2.1-.4c-1.6-.3-2.2-.8-2.2-1.6 0-1 1-1.6 2.8-1.6 1.9 0 3 .7 3.2 1.9h2.8c-.2-2.6-2.4-4.3-6-4.3-3.6 0-5.8 1.8-5.8 4.2 0 2.3 1.6 3.5 4.6 4.1l2.2.4c1.7.3 2.4.9 2.4 1.8 0 1.1-1.2 1.8-3.1 1.8-2.1 0-3.4-.8-3.6-2.2H10Z" fill="white" />
      </svg>
      {showText && <span className="text-xl font-bold tracking-tight">Socially</span>}
    </span>
  );
}
