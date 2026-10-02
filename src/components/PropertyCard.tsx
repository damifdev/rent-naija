import Link from "next/link";
import { BadgeCheck, Bath, BedDouble, MapPin } from "lucide-react";
import type { Card } from "@/lib/queries";
import { listingPath, naira, timeAgo } from "@/lib/format";
import { locationLabel, typeLabel } from "@/lib/constants";
import { FavoriteButton } from "./FavoriteButton";

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function Photo({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt} loading="lazy" className={className} /> : <div className={`${className} bg-stone`} />;
}

/** Grid card used on the listings page. */
export function PropertyCard({ p, returnTo }: { p: Card; returnTo: string }) {
  return (
    <article className="card relative overflow-hidden">
      <Link href={listingPath(p)} className="block">
        <Photo src={p.cover} alt={`${p.title}, ${locationLabel(p.area, p.state)}`} className="aspect-[4/3] w-full object-cover" />
        <div className="space-y-2 p-4">
          <p className="price text-xl text-palm">
            {naira(p.price_yearly)} <span className="text-sm font-medium text-clay">/year</span>
          </p>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug">{p.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-clay">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {locationLabel(p.area, p.state)}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone pt-3 text-sm text-clay">
            <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" aria-hidden />{plural(p.bedrooms, "Bed")}</span>
            <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4" aria-hidden />{plural(p.bathrooms, "Bath")}</span>
            {p.tag && <span className="font-semibold text-palm">{p.tag}</span>}
          </p>
          <p className="text-xs text-clay">{typeLabel(p.type)} · Posted {timeAgo(p.created_at)}</p>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton id={p.id} saved={!!p.saved} returnTo={returnTo} />
      </div>
    </article>
  );
}

/** Wider card for the featured snap row. */
export function FeaturedCard({ p, returnTo }: { p: Card; returnTo: string }) {
  return (
    <article className="card relative w-[82%] max-w-sm shrink-0 snap-start overflow-hidden sm:w-80">
      <Link href={listingPath(p)} className="block">
        <div className="relative">
          <Photo src={p.cover} alt={`${p.title}, ${locationLabel(p.area, p.state)}`} className="aspect-[4/3] w-full object-cover" />
          <span className="price absolute bottom-3 left-3 rounded-lg bg-palm px-3 py-1.5 text-sm text-white">
            {naira(p.price_yearly)} / year
          </span>
        </div>
        <div className="space-y-1.5 p-4">
          <h3 className="line-clamp-1 text-base font-bold">{p.title}</h3>
          <p className="text-sm text-clay">
            {plural(p.bedrooms, "bed")} · {plural(p.bathrooms, "bath")}
            {p.tag ? ` · ${p.tag}` : ""}
          </p>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-clay">Agent: {p.owner_name}</span>
            {p.owner_verified ? (
              <span className="inline-flex items-center gap-1 font-semibold text-palm">
                <BadgeCheck className="h-4 w-4" aria-hidden /> Verified
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton id={p.id} saved={!!p.saved} returnTo={returnTo} />
      </div>
    </article>
  );
}

/** Small card for "similar properties". */
export function CompactCard({ p }: { p: Card }) {
  return (
    <Link href={listingPath(p)} className="card block w-64 shrink-0 snap-start overflow-hidden">
      <div className="relative">
        <Photo src={p.cover} alt={p.title} className="aspect-[4/3] w-full object-cover" />
        <span className="absolute left-2 top-2 rounded bg-surface/95 px-2 py-0.5 text-xs font-semibold">{p.area}</span>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-bold">{p.title}</h3>
        <p className="text-xs text-clay">{plural(p.bedrooms, "bed")} · {plural(p.bathrooms, "bath")}</p>
        <p className="price text-sm text-palm">{naira(p.price_yearly)} <span className="text-xs font-medium text-clay">/yr</span></p>
      </div>
    </Link>
  );
}
