import Link from "next/link";
import { Logo } from "./Header";
import { PostListingCta } from "./PostListingCta";

export async function Footer() {
  return (
    <footer className="mt-16 border-t border-stone bg-surface">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm leading-relaxed text-clay">
            Rental homes across Lagos, Abuja, Port Harcourt, Ibadan and Enugu, listed by landlords and agents.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium">
          <Link href="/listings" className="hover:text-palm">Browse homes</Link>
          <PostListingCta className="hover:text-palm">List your property</PostListingCta>
          <Link href="/terms" className="hover:text-palm">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-palm">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  );
}
