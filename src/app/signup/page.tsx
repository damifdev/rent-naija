import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthFooterNote, AuthTabs, SignupForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { role } = await searchParams;
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 md:py-12">
      <AuthTabs active="signup" />
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Create your RentNaija account</h1>
        <p className="mt-1 text-clay">Find or list rental homes across Nigeria.</p>
      </div>
      <SignupForm defaultRole={role === "landlord" ? "landlord" : "tenant"} />
      <p className="text-center text-xs leading-relaxed text-clay">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
      <p className="border-t border-stone pt-5 text-center text-sm text-clay">
        Already have an account? <Link href="/login" className="font-semibold text-palm hover:underline">Log in</Link>
      </p>
      <AuthFooterNote />
    </div>
  );
}
