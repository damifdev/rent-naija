import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <SearchX className="h-12 w-12 text-clay" aria-hidden />
      <h1 className="text-2xl font-extrabold tracking-tight">We could not find that page</h1>
      <p className="text-clay">The home may have been rented or removed, or the link may be wrong.</p>
      <Link href="/listings" className="btn-primary mt-2">Browse homes</Link>
    </div>
  );
}
