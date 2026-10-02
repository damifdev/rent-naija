import Link from "next/link";
import { getUser } from "@/lib/auth";
import { logoutToPostListing } from "@/lib/actions/auth";

/**
 * "Post a listing" / "List your property" entry point, used from the home page and footer.
 * - Logged out: go to sign-up, pre-selecting the landlord/agent role.
 * - Logged in as landlord or admin: go straight to the add-listing form.
 * - Logged in as tenant: signing up or logging in again would just bounce them back to
 *   their own dashboard, so log them out first and send them to login with an explanation.
 */
export async function PostListingCta({ className, children }: { className: string; children: React.ReactNode }) {
  const user = await getUser();
  if (user && user.role !== "landlord" && user.role !== "admin") {
    return (
      <form action={logoutToPostListing}>
        <button className={className}>{children}</button>
      </form>
    );
  }
  return (
    <Link href={user ? "/dashboard/listings/new" : "/signup?role=landlord"} className={className}>
      {children}
    </Link>
  );
}
