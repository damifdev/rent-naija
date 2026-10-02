import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createListing } from "@/lib/actions/listings";
import { ListingForm } from "@/components/ListingForm";

export const metadata: Metadata = { title: "Add a listing" };

export default async function NewListingPage() {
  await requireUser(["landlord", "admin"]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Add a new listing</h1>
      <p className="mb-6 mt-1 text-clay">Tell renters what they need to know. You can edit this later.</p>
      <div className="card p-5 md:p-6">
        <ListingForm mode="create" action={createListing} />
      </div>
    </div>
  );
}
