import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Check, Star, Trash2, X } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { adminOverview, type Card } from "@/lib/queries";
import { listingPath, naira, shortDate } from "@/lib/format";
import { locationLabel } from "@/lib/constants";
import { deleteListing } from "@/lib/actions/listings";
import { deleteUser, setListingStatus, toggleFeatured, toggleVerified } from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusPill } from "@/components/StatusPill";

export const metadata: Metadata = { title: "Admin" };

function Row({ p, pending }: { p: Card; pending?: boolean }) {
  return (
    <li className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <Link href={listingPath(p)} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.cover && <img src={p.cover} alt="" className="h-full w-full object-cover" />}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-1 font-bold">{p.title}</span>
          <span className="block truncate text-sm text-clay">{locationLabel(p.area, p.state)} · {p.owner_name}</span>
          <span className="price text-sm text-palm">{naira(p.price_yearly)}</span>
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={p.status} rented={p.rented} />
        {p.status !== "approved" && (
          <form action={setListingStatus.bind(null, p.id, "approved")}>
            <button className="btn-primary min-h-[40px] px-3"><Check className="h-4 w-4" aria-hidden />Approve</button>
          </form>
        )}
        {p.status !== "rejected" && (
          <form action={setListingStatus.bind(null, p.id, "rejected")}>
            <button className="btn-secondary min-h-[40px] px-3"><X className="h-4 w-4" aria-hidden />Reject</button>
          </form>
        )}
        {!pending && p.status === "approved" && (
          <form action={toggleFeatured.bind(null, p.id)}>
            <button aria-pressed={!!p.featured} className={`btn-secondary min-h-[40px] px-3 ${p.featured ? "border-palm text-palm" : ""}`}>
              <Star className={`h-4 w-4 ${p.featured ? "fill-palm" : ""}`} aria-hidden />{p.featured ? "Featured" : "Feature"}
            </button>
          </form>
        )}
        <form action={deleteListing.bind(null, p.id)}>
          <ConfirmButton message={`Delete "${p.title}" permanently?`} className="btn-danger min-h-[40px] px-3" >
            <Trash2 className="h-4 w-4" aria-hidden /><span className="sr-only">Delete</span>
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

export default async function AdminPage() {
  await requireUser(["admin"]);
  const { pending, all, users } = adminOverview();

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-6 md:py-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Admin</h1>
        <p className="mt-1 text-clay">Review listings and manage agents.</p>
      </div>

      <section aria-labelledby="pending-h" className="space-y-3">
        <h2 id="pending-h" className="text-lg font-bold">Waiting for review <span className="pill ml-1 bg-stone text-ink/80">{pending.length}</span></h2>
        {pending.length === 0 ? (
          <p className="card px-5 py-8 text-center text-clay">Nothing to review right now.</p>
        ) : (
          <ul className="space-y-3">{pending.map((p) => <Row key={p.id} p={p} pending />)}</ul>
        )}
      </section>

      <section aria-labelledby="all-h" className="space-y-3">
        <h2 id="all-h" className="text-lg font-bold">All listings <span className="pill ml-1 bg-stone text-ink/80">{all.length}</span></h2>
        <ul className="space-y-3">{all.map((p) => <Row key={p.id} p={p} />)}</ul>
      </section>

      <section aria-labelledby="users-h" className="space-y-3">
        <h2 id="users-h" className="text-lg font-bold">Users <span className="pill ml-1 bg-stone text-ink/80">{users.length}</span></h2>
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-bold">
                  {u.name}
                  {u.verified ? <BadgeCheck className="h-4 w-4 text-palm" aria-label="Verified" /> : null}
                </p>
                <p className="truncate text-sm text-clay">{u.email} · {u.role}{u.agency ? ` · ${u.agency}` : ""} · joined {shortDate(u.created_at)}{u.role === "landlord" ? ` · ${u.listings} listing${u.listings === 1 ? "" : "s"}` : ""}</p>
              </div>
              {u.role !== "admin" && (
                <div className="flex gap-2">
                  {u.role === "landlord" && (
                    <form action={toggleVerified.bind(null, u.id)}>
                      <button className="btn-secondary min-h-[40px] px-3">{u.verified ? "Remove verified badge" : "Mark as verified"}</button>
                    </form>
                  )}
                  <form action={deleteUser.bind(null, u.id)}>
                    <ConfirmButton message={`Delete ${u.name} and everything they posted?`} className="btn-danger min-h-[40px] px-3">
                      <Trash2 className="h-4 w-4" aria-hidden />Delete
                    </ConfirmButton>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
