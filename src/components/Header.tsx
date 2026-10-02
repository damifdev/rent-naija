import Link from "next/link";
import { Building2, LogOut, Search } from "lucide-react";
import { getUser, initials } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-palm" aria-label="RentNaija home">
      <Building2 className="h-6 w-6" strokeWidth={2.2} aria-hidden />
      <span className="text-lg font-extrabold tracking-tight">RentNaija</span>
    </Link>
  );
}

export async function Header() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex" aria-label="Main">
            <Link href="/listings" className="text-ink hover:text-palm">Browse homes</Link>
            {user?.role === "tenant" && (
              <Link href="/dashboard?tab=saved" className="text-ink hover:text-palm">Saved</Link>
            )}
            {user?.role === "landlord" && (
              <Link href="/dashboard/listings/new" className="text-ink hover:text-palm">Post a listing</Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-ink hover:text-palm">Admin</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Link href="/listings" aria-label="Search homes" className="flex h-11 w-11 items-center justify-center rounded-lg text-clay hover:text-palm md:hidden">
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-stone/60"
                aria-label="Open my dashboard"
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-palm-soft text-xs font-bold text-palm">
                    {initials(user.name)}
                  </span>
                )}
                <span className="hidden text-sm font-semibold md:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <form action={logout}>
                <button className="flex h-11 w-11 items-center justify-center rounded-lg text-clay hover:text-alert" aria-label="Log out" title="Log out">
                  <LogOut className="h-5 w-5" aria-hidden />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary min-h-[40px] px-3">Log in</Link>
              <Link href="/signup" className="btn-primary hidden min-h-[40px] px-3 sm:inline-flex">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
