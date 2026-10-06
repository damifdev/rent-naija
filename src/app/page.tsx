import Link from "next/link";
import { ArrowRight, ClipboardCheck, MapPin } from "lucide-react";
import { getUser } from "@/lib/auth";
import { PostListingCta } from "@/components/PostListingCta";
import { countApproved, countByArea, featuredProperties } from "@/lib/queries";
import { POPULAR_LOCATIONS, PROPERTY_TYPES } from "@/lib/constants";
import { FeaturedCard } from "@/components/PropertyCard";

export default async function HomePage() {
  const user = await getUser();
  const featured = await featuredProperties(user?.id ?? null);
  const total = await countApproved();
  const tilePhotos = ["exterior", "living", "exterior", "bedroom", "living", "exterior"];
  const positions = ["object-[50%_30%]", "object-center", "object-[85%_50%]", "object-center", "object-[30%_60%]", "object-[15%_40%]"];
  const popularCounts = await Promise.all(POPULAR_LOCATIONS.map((l) => countByArea(l.q)));

  return (
    <div className="mx-auto max-w-page space-y-10 px-4 pb-4 pt-6 md:space-y-14 md:px-6 md:pt-10">
      {/* Hero */}
      <section className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-6">
        <div className="min-w-0 space-y-3 md:col-start-1 md:row-start-1">
          <p className="inline-flex items-center gap-2 rounded-full bg-palm-soft px-3 py-1 text-xs font-semibold text-palm">
            <span className="h-1.5 w-1.5 rounded-full bg-palm" aria-hidden />
            Every listing is reviewed before it goes live
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
            Find a home you can actually live in
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-clay">
            Search listings across Lagos, Abuja, Port Harcourt, Ibadan and Enugu, then talk to the landlord or agent directly.
          </p>
        </div>

        <Link
          href="/listings?q=Lekki"
          className="relative block min-w-0 overflow-hidden rounded-xl border border-stone shadow-whisper md:col-start-2 md:row-span-2 md:row-start-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/exterior.jpg" alt="Serviced apartment building with palm-lined entrance in Ikate, Lekki" className="h-44 w-full object-cover md:h-[30rem]" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-lg border border-stone bg-surface/95 px-3 py-2.5">
            <div>
              <p className="text-sm font-bold">Ikate, Lekki</p>
              <p className="text-xs text-clay">Lagos</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-palm">
              Browse Lekki <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </Link>

        <form action="/listings" method="get" className="card min-w-0 space-y-4 p-4 md:col-start-1 md:row-start-2 md:p-5">
          <fieldset className="min-w-0">
            <legend className="sr-only">Property type</legend>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              {[{ value: "", label: "Any type" }, ...PROPERTY_TYPES].map((t, i) => (
                <label key={t.value} className="relative shrink-0 cursor-pointer">
                  <input type="radio" name="type" value={t.value} defaultChecked={i === 0} className="peer sr-only" />
                  <span className="chip peer-checked:border-palm peer-checked:bg-palm peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-palm">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="home-q" className="label">Location</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-clay" aria-hidden />
              <input id="home-q" name="q" className="input pl-10" placeholder="Lekki, Lagos" autoComplete="off" />
            </div>
          </div>
          <div>
            <label htmlFor="home-max" className="label">Budget</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-clay" aria-hidden>₦</span>
              <input id="home-max" name="max" inputMode="numeric" className="input pl-8 tabular-nums" placeholder="Max ₦2,500,000 / year" autoComplete="off" />
            </div>
          </div>
          <button className="btn-primary h-12 w-full">
            Find homes <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </form>
      </section>

      {/* Featured */}
      <section aria-labelledby="featured-h">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="featured-h" className="text-xl font-bold md:text-2xl">Featured homes</h2>
          <Link href="/listings" className="text-sm font-semibold text-palm hover:underline">See all ({total})</Link>
        </div>
        {featured.length ? (
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {featured.map((p) => <FeaturedCard key={p.id} p={p} returnTo="/" />)}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="font-semibold">No featured homes yet.</p>
            <Link href="/listings" className="btn-primary mt-4">Browse all homes</Link>
          </div>
        )}
      </section>

      {/* Popular locations */}
      <section aria-labelledby="pop-h">
        <h2 id="pop-h" className="mb-4 text-xl font-bold md:text-2xl">Popular locations</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {POPULAR_LOCATIONS.map((l, i) => {
            const n = popularCounts[i];
            return (
              <li key={l.area}>
                <Link href={`/listings?q=${encodeURIComponent(l.q)}`} className="relative block overflow-hidden rounded-xl border border-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/${tilePhotos[i]}.jpg`} alt="" loading="lazy" className={`h-32 w-full object-cover md:h-44 ${positions[i]}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <p className="text-xs opacity-90">{l.city}</p>
                    <p className="text-base font-bold leading-tight">{l.area}</p>
                    <p className="text-xs opacity-90">{n} {n === 1 ? "listing" : "listings"}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Landlord CTA */}
      <section className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-palm-soft text-palm">
            <ClipboardCheck className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold">Rent out your property</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-clay">
              Landlords and agents can list after a quick review. Renters contact you directly by phone or WhatsApp.
            </p>
          </div>
        </div>
        <PostListingCta className="btn-secondary md:shrink-0">
          Post a listing <ArrowRight className="h-4 w-4" aria-hidden />
        </PostListingCta>
      </section>
    </div>
  );
}
