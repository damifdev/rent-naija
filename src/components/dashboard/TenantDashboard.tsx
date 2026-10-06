import Link from "next/link";
import { BadgeCheck, Bath, BedDouble, Clock, Heart, MapPin, MessageCircle, Search } from "lucide-react";
import type { User } from "@/lib/auth";
import { initials } from "@/lib/auth";
import { inquiriesBySender, savedProperties } from "@/lib/queries";
import { listingPath, naira, timeAgo, toWhatsApp } from "@/lib/format";
import { locationLabel } from "@/lib/constants";
import { FavoriteButton } from "../FavoriteButton";
import { Tabs } from "./Tabs";

export async function TenantDashboard({ user, tab }: { user: User; tab: string }) {
  const saved = await savedProperties(user.id);
  const inquiries = await inquiriesBySender(user.id);
  const active = tab === "inquiries" ? "inquiries" : "saved";

  return (
    <div className="mx-auto max-w-page space-y-6 px-4 py-6 md:px-6 md:py-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{active === "saved" ? "Saved homes" : "My inquiries"}</h1>
        <p className="mt-1 text-clay">Welcome back, {user.name}</p>
      </div>

      <div className="max-w-xl">
        <Tabs active={active} tabs={[{ key: "saved", label: "Saved", count: saved.length }, { key: "inquiries", label: "My inquiries", count: inquiries.length }]} />
      </div>

      {active === "saved" ? (
        saved.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Heart className="h-10 w-10 text-clay" aria-hidden />
            <h2 className="text-lg font-bold">No saved homes yet</h2>
            <p className="max-w-sm text-sm text-clay">Tap the heart on any listing to keep it here for later.</p>
            <Link href="/listings" className="btn-primary mt-2">Browse homes</Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {saved.map((p) => (
              <li key={p.id} className="card relative overflow-hidden">
                <Link href={listingPath(p)} className="block">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.cover && <img src={p.cover} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
                    {p.owner_verified ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-palm px-2.5 py-1 text-xs font-semibold text-white">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />Verified agent
                      </span>
                    ) : null}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />{locationLabel(p.area, p.state)}
                    </span>
                  </div>
                  <div className="space-y-2 p-4 pb-3">
                    <p className="price text-xl text-palm">{naira(p.price_yearly)} <span className="text-sm font-medium text-clay">/ year</span></p>
                    <h2 className="line-clamp-1 font-bold">{p.title}</h2>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-clay">
                      <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" aria-hidden />{p.bedrooms} Bed{p.bedrooms === 1 ? "" : "s"}</span>
                      <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4" aria-hidden />{p.bathrooms} Bath{p.bathrooms === 1 ? "" : "s"}</span>
                      {p.tag && <span className="font-semibold text-palm">{p.tag}</span>}
                    </p>
                  </div>
                </Link>
                <div className="absolute right-3 top-3"><FavoriteButton id={p.id} saved returnTo="/dashboard?tab=saved" /></div>
                <div className="flex items-center gap-3 border-t border-stone p-4">
                  {p.owner_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.owner_avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-palm-soft text-sm font-bold text-palm">{initials(p.owner_name)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p.owner_name}</p>
                    <p className="truncate text-xs text-clay">{p.owner_agency ?? "Landlord"}</p>
                  </div>
                  <a className="btn-whatsapp min-h-[40px] px-3" target="_blank" rel="noopener noreferrer"
                    href={`https://wa.me/${toWhatsApp(p.owner_phone)}?text=${encodeURIComponent(`Hello ${p.owner_name}, I saw "${p.title}" on RentNaija and I'm interested.`)}`}
                    aria-label={`WhatsApp ${p.owner_name}`}>
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </a>
                  <Link href={`${listingPath(p)}#inspect`} className="btn-secondary min-h-[40px] px-3">Inspect</Link>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : inquiries.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Search className="h-10 w-10 text-clay" aria-hidden />
          <h2 className="text-lg font-bold">You have not sent any inquiries</h2>
          <p className="max-w-sm text-sm text-clay">Found a place you like? Book an inspection from the listing and it will be tracked here.</p>
          <Link href="/listings" className="btn-primary mt-2">Browse homes</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {inquiries.map((q) => (
            <li key={q.id} className="card space-y-3 p-4">
              <div className="flex gap-3">
                <Link href={`/listings/${q.property_id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {q.cover && <img src={q.cover} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/listings/${q.property_id}`} className="line-clamp-1 font-bold hover:text-palm">{q.property_title}</Link>
                    {q.read_at ? <span className="pill bg-palm-soft text-palm">Seen</span> : <span className="pill bg-stone text-clay">Sent</span>}
                  </div>
                  <p className="truncate text-sm text-clay">{q.owner_name}{q.owner_agency ? ` · ${q.owner_agency}` : ""}</p>
                </div>
              </div>
              <blockquote className="rounded-lg bg-paper px-3 py-2.5 text-sm italic leading-relaxed">&ldquo;{q.message}&rdquo;</blockquote>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-clay"><Clock className="h-4 w-4" aria-hidden />{timeAgo(q.created_at)}</span>
                <Link href={`/listings/${q.property_id}`} className="font-semibold text-palm hover:underline">View listing</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
