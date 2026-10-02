import Link from "next/link";

export function Tabs({ tabs, active }: { tabs: { key: string; label: string; count?: number }[]; active: string }) {
  return (
    <div className="flex rounded-xl border border-stone bg-stone/50 p-1" role="tablist">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`/dashboard?tab=${t.key}`}
          role="tab"
          aria-selected={active === t.key}
          className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${
            active === t.key ? "bg-surface text-palm shadow-whisper" : "text-clay hover:text-ink"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${active === t.key ? "bg-palm-soft text-palm" : "bg-stone text-clay"}`}>{t.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
