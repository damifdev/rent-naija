import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getUser } from "@/lib/auth";
import { searchProperties } from "@/lib/queries";
import { activeFilterCount, parseFilters, toQuery } from "@/lib/filters";
import { shortState } from "@/lib/constants";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterForm } from "@/components/FilterForm";
import { FiltersDrawer, SortSelect } from "@/components/ListingsToolbar";
import { Pagination } from "@/components/Pagination";

type SP = Promise<Record<string, string | string[] | undefined>>;

function heading(f: ReturnType<typeof parseFilters>) {
  if (f.area) return `Homes in ${f.area}`;
  if (f.q) return `Homes in ${f.q}`;
  if (f.state) return `Homes in ${shortState(f.state)}`;
  return "Homes for rent";
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  return { title: heading(f), description: "Browse verified rental listings across Nigeria." };
}

export default async function ListingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const user = await getUser();
  const { items, total, page, pages } = searchProperties(f, user?.id ?? null);
  const active = activeFilterCount(f);
  const initial = { state: f.state, area: f.area, type: f.type, min: f.min, max: f.max, beds: f.beds, baths: f.baths };
  const formKey = toQuery(f, { page: 1, sort: "newest" });
  const returnTo = `/listings${toQuery(f)}`;

  return (
    <div className="mx-auto max-w-page px-4 pb-4 md:px-6">
      <div className="pb-2 pt-6">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{heading(f)}</h1>
      </div>

      <div className="sticky top-14 z-30 -mx-4 flex items-center justify-between gap-3 border-b border-stone bg-paper/95 px-4 py-3 backdrop-blur md:top-16 md:mx-0 md:px-0">
        <p className="text-sm text-clay" aria-live="polite">
          <span className="font-bold text-ink tabular-nums">{total}</span> {total === 1 ? "home" : "homes"} found
        </p>
        <div className="flex items-center gap-2">
          <SortSelect value={f.sort ?? "newest"} />
          <FiltersDrawer key={`d${formKey}`} initial={initial} activeCount={active} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 pt-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto p-5">
            <h2 className="mb-4 text-lg font-bold">Filter homes</h2>
            <FilterForm key={`s${formKey}`} initial={initial} idPrefix="d" />
          </div>
        </aside>

        <section aria-label="Search results" className="min-w-0">
          {items.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
              <SearchX className="h-10 w-10 text-clay" aria-hidden />
              <h2 className="text-lg font-bold">No homes match these filters</h2>
              <p className="max-w-sm text-sm text-clay">Try a wider price range, or remove the area or bedroom filters.</p>
              <Link href="/listings" className="btn-primary mt-2">Clear all filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => <PropertyCard key={p.id} p={p} returnTo={returnTo} />)}
              </div>
              <Pagination f={f} page={page} pages={pages} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
