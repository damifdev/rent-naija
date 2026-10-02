import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 className="text-2xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="text-clay">This is a student project (a capstone). These terms are placeholders and are not legal advice; replace them before any real launch.</p>
      <h2 className="pt-2 text-lg font-bold">Using RentNaija</h2>
      <p>RentNaija connects people looking for rental homes with landlords and agents. We do not own, manage or guarantee any property, and we are not a party to any tenancy agreement.</p>
      <h2 className="pt-2 text-lg font-bold">Listings</h2>
      <p>Landlords and agents must only post properties they are authorised to rent out, with accurate prices and photos. Listings are reviewed before they appear, and may be removed at any time.</p>
      <h2 className="pt-2 text-lg font-bold">Stay safe</h2>
      <p>Inspect a property in person before paying anything. Never pay a deposit, agency fee or rent to someone you have not met, and get a written agreement.</p>
    </article>
  );
}
