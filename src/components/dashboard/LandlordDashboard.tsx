import Link from "next/link";
import { BadgeCheck, CheckCircle2, Pencil, Phone, Plus, RotateCcw, Trash2, MessageCircle, Inbox, Building2 } from "lucide-react";
import type { User } from "@/lib/auth";
import { initials } from "@/lib/auth";
import { inquiriesForOwner, ownerProperties } from "@/lib/queries";
import { listingPath, naira, telHref, timeAgo, toWhatsApp } from "@/lib/format";
import { locationLabel, typeShort } from "@/lib/constants";
import { deleteListing, toggleRented } from "@/lib/actions/listings";
import { markInquiryRead } from "@/lib/actions/engage";
import { ConfirmButton } from "../ConfirmButton";
import { StatusPill } from "../StatusPill";
import { Tabs } from "./Tabs";

export async function LandlordDashboard({
  user, tab, notice,
}: { user: User; tab: string; notice?: string }) {
  const listings = await ownerProperties(user.id);
  const inquiries = await inquiriesForOwner(user.id);
  const unread = inquiries.filter((i) => !i.read_at).length;
  const active = tab === "inquiries" ? "inquiries" : "listings";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-palm-soft font-bold text-palm">{initials(user.name)}</span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight md:text-2xl">My listings</h1>
            <p className="flex items-center gap-1.5 truncate text-sm text-clay">
              {user.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-palm" aria-label="Verified" /> : null}
              {user.name} · {listings.length} {listings.length === 1 ? "property" : "properties"}
            </p>
          </div>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary shrink-0"><Plus className="h-4 w-4" aria-hidden />Add listing</Link>
      </div>

      {notice && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-palm/30 bg-palm-soft px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden />
          {notice}
        </p>
      )}

      <Tabs active={active} tabs={[{ key: "listings", label: "Listings", count: listings.length }, { key: "inquiries", label: "Inquiries", count: inquiries.length }]} />

      {active === "listings" ? (
        listings.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Building2 className="h-10 w-10 text-clay" aria-hidden />
            <h2 className="text-lg font-bold">You have no listings yet</h2>
            <p className="max-w-sm text-sm text-clay">Add your first property with photos and a price. It goes live once an admin approves it.</p>
            <Link href="/dashboard/listings/new" className="btn-primary mt-2">Add your first listing</Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {listings.map((p) => (
              <li key={p.id} className="card p-4">
                <div className="flex gap-4">
                  <Link href={listingPath(p)} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.cover && <img src={p.cover} alt="" className="h-full w-full object-cover" />}
                    <span className="absolute left-1 top-1 rounded bg-surface/95 px-1.5 py-0.5 text-[10px] font-bold">{typeShort(p.type)}</span>
                  </Link>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={listingPath(p)} className="line-clamp-2 font-bold leading-snug hover:text-palm">{p.title}</Link>
                      <StatusPill status={p.status} rented={p.rented} />
                    </div>
                    <p className="truncate text-sm text-clay">{locationLabel(p.area, p.state)} · {p.bedrooms} bed · {p.bathrooms} bath</p>
                    <p className="price text-palm">{naira(p.price_yearly)} <span className="text-xs font-medium text-clay">/ year</span></p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone pt-3 text-sm font-semibold">
                  <Link href={`/dashboard/listings/${p.id}/edit`} className="inline-flex min-h-[40px] items-center gap-1.5 text-palm hover:underline">
                    <Pencil className="h-4 w-4" aria-hidden />Edit
                  </Link>
                  {p.status === "approved" && (
                    <form action={toggleRented.bind(null, p.id)}>
                      <button className="inline-flex min-h-[40px] items-center gap-1.5 hover:text-palm">
                        {p.rented ? <><RotateCcw className="h-4 w-4" aria-hidden />Relist</> : <><CheckCircle2 className="h-4 w-4" aria-hidden />Mark rented</>}
                      </button>
                    </form>
                  )}
                  <form action={deleteListing.bind(null, p.id)}>
                    <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`} className="inline-flex min-h-[40px] items-center gap-1.5 text-alert hover:underline">
                      <Trash2 className="h-4 w-4" aria-hidden />Delete
                    </ConfirmButton>
                  </form>
                </div>
                {p.status === "pending" && <p className="mt-2 text-xs text-clay">Waiting for admin approval. It is not visible in search yet.</p>}
                {p.status === "rejected" && <p className="mt-2 text-xs text-alert">This listing was not approved. Edit it and save to send it for review again.</p>}
              </li>
            ))}
          </ul>
        )
      ) : inquiries.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Inbox className="h-10 w-10 text-clay" aria-hidden />
          <h2 className="text-lg font-bold">No inquiries yet</h2>
          <p className="max-w-sm text-sm text-clay">When a renter asks about one of your homes, it shows up here with their phone number.</p>
        </div>
      ) : (
        <section aria-label="Inquiries" className="space-y-3">
          <p className="text-sm text-clay">{unread > 0 ? <><span className="pill bg-palm-soft text-palm">{unread} new</span> </> : null}Latest first</p>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {inquiries.map((q) => (
              <li key={q.id} className="card space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone text-sm font-bold">{initials(q.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold">{q.name}</p>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-clay">
                        {!q.read_at && <span className="h-2 w-2 rounded-full bg-palm" aria-label="Unread" />}
                        {timeAgo(q.created_at)}
                      </span>
                    </div>
                    <Link href={`/listings/${q.property_id}`} className="line-clamp-1 text-sm text-clay hover:text-palm">{q.property_title}</Link>
                  </div>
                </div>
                <blockquote className="rounded-lg bg-paper px-3 py-2.5 text-sm leading-relaxed">&ldquo;{q.message}&rdquo;</blockquote>
                <p className="text-sm tabular-nums text-clay">{q.phone}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a className="btn-whatsapp min-h-[40px] px-3" target="_blank" rel="noopener noreferrer"
                    href={`https://wa.me/${toWhatsApp(q.phone)}?text=${encodeURIComponent(`Hello ${q.name}, this is ${user.name} about "${q.property_title}" on RentNaija.`)}`}>
                    <MessageCircle className="h-4 w-4" aria-hidden />WhatsApp
                  </a>
                  <a className="btn-secondary min-h-[40px] px-3" href={telHref(q.phone)}><Phone className="h-4 w-4" aria-hidden />Call</a>
                  <form action={markInquiryRead.bind(null, q.id)} className="ml-auto">
                    <button className="min-h-[40px] text-sm font-semibold text-clay hover:text-palm">{q.read_at ? "Mark as unread" : "Mark as read"}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
