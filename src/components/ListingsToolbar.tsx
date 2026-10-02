"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterForm, type FilterValues } from "./FilterForm";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <div>
      <label htmlFor="sort" className="sr-only">Sort homes</label>
      <select
        id="sort"
        value={value}
        className="min-h-[40px] rounded-lg border border-stone bg-surface px-3 text-sm font-semibold"
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.delete("page");
          if (e.target.value === "newest") p.delete("sort"); else p.set("sort", e.target.value);
          router.push(`/listings${p.toString() ? `?${p}` : ""}`);
        }}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  );
}

export function FiltersDrawer({ initial, activeCount }: { initial: FilterValues; activeCount: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary min-h-[40px] px-3 lg:hidden" aria-haspopup="dialog">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {activeCount > 0 && <span className="rounded-full bg-palm px-1.5 text-xs text-white">{activeCount}</span>}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter homes">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-surface p-5 pb-8 shadow-whisper">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filter homes</h2>
              <button onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-stone/60">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <FilterForm initial={initial} idPrefix="m" onDone={() => setOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
