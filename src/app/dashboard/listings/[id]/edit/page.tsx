import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProperty } from "@/lib/queries";
import { updateListing } from "@/lib/actions/listings";
import { ListingForm } from "@/components/ListingForm";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["landlord", "admin"]);
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? getProperty(id, null) : null;
  if (!p || (p.owner_id !== user.id && user.role !== "admin")) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Edit listing</h1>
      <p className="mb-6 mt-1 text-clay">
        {user.role === "admin" ? "Changes go live straight away." : "Saving sends this listing back for review before it shows in search again."}
      </p>
      <div className="card p-5 md:p-6">
        <ListingForm
          mode="edit"
          action={updateListing.bind(null, p.id)}
          existingImages={p.images}
          initial={{
            title: p.title, type: p.type, state: p.state, area: p.area, price: p.price_yearly,
            bedrooms: p.bedrooms, bathrooms: p.bathrooms, area_sqm: p.area_sqm, tag: p.tag,
            description: p.description, amenities: p.amenities,
          }}
        />
      </div>
    </div>
  );
}
