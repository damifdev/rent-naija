import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Filters } from "@/lib/queries";
import { toQuery } from "@/lib/filters";

export function Pagination({ f, page, pages }: { f: Filters; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => `/listings${toQuery(f, { page: n })}`;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary min-h-[40px] px-3" aria-label="Previous page"><ChevronLeft className="h-4 w-4" aria-hidden /></Link>
      ) : null}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-clay" aria-hidden>…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${n === page ? "border-palm bg-palm text-white" : "border-stone bg-surface hover:border-palm"}`}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className="btn-secondary min-h-[40px] px-3" aria-label="Next page"><ChevronRight className="h-4 w-4" aria-hidden /></Link>
      ) : null}
    </nav>
  );
}
