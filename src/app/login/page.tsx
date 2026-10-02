import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthFooterNote, AuthTabs, LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; switch?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { next, switch: switchTo } = await searchParams;
  const forLandlord = switchTo === "landlord";
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 md:py-12">
      <AuthTabs active="login" />
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-clay">Log in to see your saved homes, inquiries and listings.</p>
      </div>
      {forLandlord && (
        <p role="status" className="rounded-lg border border-stone bg-surface px-4 py-3 text-sm">
          To post a listing, log in with a landlord or agent account. If you don&rsquo;t have one yet, create one below.
        </p>
      )}
      <LoginForm next={next} />
      <p className="border-t border-stone pt-5 text-center text-sm text-clay">
        New to RentNaija? <Link href={forLandlord ? "/signup?role=landlord" : "/signup"} className="font-semibold text-palm hover:underline">Create an account</Link>
      </p>
      <AuthFooterNote />
    </div>
  );
}
