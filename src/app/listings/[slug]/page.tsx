import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Bath, BedDouble, Building, Calendar, Check, ExternalLink, MapPin, Phone, Ruler, MessageCircle } from "lucide-react";
import { getUser, initials } from "@/lib/auth";
import { getProperty, similarProperties } from "@/lib/queries";
import { listingPath, monthly, naira, shortDate, telHref, toWhatsApp } from "@/lib/format";
import { locationLabel, typeLabel } from "@/lib/constants";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Gallery } from "@/components/Gallery";
import { ShareButton } from "@/components/ShareButton";
import { InquiryForm } from "@/components/InquiryForm";
import { CompactCard } from "@/components/PropertyCard";
import { StatusPill } from "@/components/StatusPill";

type Params = Promise<{ slug: string }>;
const idFrom = (slug: string) => parseInt(slug, 10);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProperty(idFrom((await params).slug), null);
  if (!p || p.status !== "approved") return { title: "Home not found" };
  const loc = locationLabel(p.area, p.state);
  return {
    title: `${p.title} in ${loc}`,
    description: `${p.bedrooms}-bed ${typeLabel(p.type).toLowerCase()} in ${loc} for ${naira(p.price_yearly)} a year. ${p.description.slice(0, 110)}`,
    alternates: { canonical: listingPath(p) },
    openGraph: { title: p.title, images: p.cover ? [p.cover] : [] },
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const id = idFrom(slug);
  if (!Number.isInteger(id)) notFound();
  const user = await getUser();
  const p = await getProperty(id, user?.id ?? null);
  if (!p) notFound();
  const isOwner = !!user && (user.id === p.owner_id || user.role === "admin");
  if (p.status !== "approved" && !isOwner) notFound();

  const similar = await similarProperties(p, user?.id ?? null);
  const loc = locationLabel(p.area, p.state);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.area}, ${p.state}, Nigeria`)}`;
  const wa = `https://wa.me/${toWhatsApp(p.owner_phone)}?text=${encodeURIComponent(`Hello ${p.owner_name}, I saw "${p.title}" on RentNaija and I'm interested.`)}`;
  const returnTo = listingPath(p);
  const available = p.status === "approved" && !p.rented;

  const specs = [
    { icon: BedDouble, big: `${p.bedrooms} ${p.bedrooms === 1 ? "bed" : "beds"}`, small: "Bedrooms" },
    { icon: Bath, big: `${p.bathrooms} ${p.bathrooms === 1 ? "bath" : "baths"}`, small: "Bathrooms" },
    { icon: Building, big: typeLabel(p.type), small: "Property type" },
    ...(p.area_sqm ? [{ icon: Ruler, big: `${p.area_sqm} sqm`, small: "Total area" }] : []),
  ];

  const ContactButtons = ({ className = "" }: { className?: string }) => (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <a href={telHref(p.owner_phone)} className="btn-secondary"><Phone className="h-4 w-4" aria-hidden /> Call</a>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
    </div>
  );

  return (
    <div className="mx-auto max-w-page px-4 pb-28 pt-4 md:px-6 md:pb-6 md:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/listings" className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-palm hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All homes
        </Link>
        <div className="flex items-center gap-2">
          <ShareButton title={p.title} />
          <FavoriteButton id={p.id} saved={!!p.saved} returnTo={returnTo} className="border border-stone" />
        </div>
      </div>

      {p.status !== "approved" && (
        <p role="status" className="mb-4 rounded-lg border border-stone bg-surface px-4 py-3 text-sm">
          This listing is <strong>{p.status}</strong> and only you {user?.role === "admin" ? "and the owner " : ""}can see it. It will appear in search once an admin approves it.
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <Gallery images={p.images.map((i) => i.url)} alt={`${p.title}, ${loc}`} />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {available ? (
                <span className="pill gap-1.5 border border-palm/30 bg-palm-soft text-palm"><span className="h-1.5 w-1.5 rounded-full bg-palm" aria-hidden />Available</span>
              ) : (
                <StatusPill status={p.status} rented={p.rented} />
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-clay"><Calendar className="h-4 w-4" aria-hidden />Listed {shortDate(p.created_at)}</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{p.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="inline-flex items-center gap-1.5 text-clay"><MapPin className="h-4 w-4" aria-hidden />{loc}</p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-palm hover:underline">
                Open map <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>

            <div className="card flex items-center justify-between gap-3 p-4 md:p-5">
              <div>
                <p className="price text-2xl text-palm md:text-3xl">{naira(p.price_yearly)} <span className="text-base font-medium text-clay">/ year</span></p>
                <p className="mt-0.5 text-sm text-clay">About <span className="tabular-nums">{monthly(p.price_yearly)}</span> / month</p>
              </div>
              {p.tag && <span className="pill bg-stone text-ink/80">{p.tag}</span>}
            </div>
          </section>

          <section aria-labelledby="specs-h">
            <h2 id="specs-h" className="mb-3 text-base font-bold">Key property details</h2>
            <ul className={`grid gap-3 ${specs.length === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"}`}>
              {specs.map(({ icon: Icon, big, small }) => (
                <li key={small} className="card flex flex-col items-center gap-1 p-3 text-center">
                  <Icon className="h-5 w-5 text-palm" aria-hidden />
                  <span className="text-sm font-bold">{big}</span>
                  <span className="text-xs text-clay">{small}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ov-h" className="space-y-2">
            <h2 id="ov-h" className="text-base font-bold">Overview</h2>
            <p className="max-w-prose whitespace-pre-line leading-relaxed text-ink/90">{p.description}</p>
          </section>

          {p.amenities.length > 0 && (
            <section aria-labelledby="am-h">
              <h2 id="am-h" className="mb-3 text-base font-bold">Estate and unit amenities</h2>
              <ul className="flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <li key={a} className="inline-flex items-center gap-1.5 rounded-lg border border-stone bg-surface px-3 py-2 text-sm">
                    <Check className="h-4 w-4 text-palm" aria-hidden /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Contact column */}
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Contact the agent">
          <section className="card space-y-4 p-4 md:p-5" aria-labelledby="agent-h">
            <h2 id="agent-h" className="text-base font-bold">Listing agent</h2>
            <div className="flex items-center gap-3">
              {p.owner_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.owner_avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-palm-soft text-lg font-bold text-palm">{initials(p.owner_name)}</span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-bold">
                  {p.owner_name}
                  {p.owner_verified ? <BadgeCheck className="h-4 w-4 text-palm" aria-label="Verified" /> : null}
                </p>
                <p className="text-sm text-clay">
                  {p.owner_verified ? "Verified · " : ""}{p.owner_agency ?? "Landlord"}
                </p>
                <p className="text-sm tabular-nums text-clay">{p.owner_phone}</p>
              </div>
            </div>
            {available ? <ContactButtons /> : <p className="rounded-lg bg-stone/60 px-3 py-2 text-sm text-clay">This home is not available right now.</p>}
          </section>

          {available && (
            <section id="inspect" className="card space-y-4 p-4 md:p-5" aria-labelledby="inspect-h">
              <h2 id="inspect-h" className="text-base font-bold">Book an inspection</h2>
              <InquiryForm propertyId={p.id} propertyTitle={p.title} defaultName={user?.name} defaultPhone={user?.phone} />
            </section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12" aria-labelledby="sim-h">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="sim-h" className="text-lg font-bold">Similar homes in {p.state.replace(/\s*\(.*\)/, "")}</h2>
            <Link href={`/listings?state=${encodeURIComponent(p.state)}`} className="text-sm font-semibold text-palm hover:underline">View all</Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {similar.map((s) => <CompactCard key={s.id} p={s} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky contact bar (sits above the bottom nav) */}
      {available && (
        <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-30 border-t border-stone bg-surface/95 px-4 py-2.5 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-clay">Rent per year</p>
              <p className="price truncate text-base text-palm">{naira(p.price_yearly)}</p>
            </div>
            <div className="flex gap-2">
              <a href={telHref(p.owner_phone)} className="btn-secondary min-h-[44px] px-4" aria-label="Call agent"><Phone className="h-4 w-4" aria-hidden /> Call</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp min-h-[44px] px-4"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
