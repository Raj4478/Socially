export default function Loading() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-b border-border/60 px-4 py-4">
          <div className="flex gap-3">
            <div className="size-10 rounded-full shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded-full shimmer" />
              <div className="h-3 w-full rounded-full shimmer" />
              <div className="h-3 w-4/5 rounded-full shimmer" />
              <div className="h-24 w-full rounded-2xl shimmer mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
