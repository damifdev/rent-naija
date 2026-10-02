import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { LandlordDashboard } from "@/components/dashboard/LandlordDashboard";
import { TenantDashboard } from "@/components/dashboard/TenantDashboard";

export const metadata: Metadata = { title: "Dashboard" };

type SP = Promise<Record<string, string | undefined>>;

function noticeFor(sp: Record<string, string | undefined>) {
  if (sp.posted === "pending") return "Listing submitted. An admin will review it before it appears in search.";
  if (sp.posted === "approved") return "Your listing is live.";
  if (sp.updated === "pending") return "Changes saved. The listing is back in review and hidden from search until it is approved.";
  if (sp.updated) return "Changes saved.";
  return undefined;
}

export default async function DashboardPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  if (user.role === "landlord") return <LandlordDashboard user={user} tab={sp.tab ?? "listings"} notice={noticeFor(sp)} />;
  return <TenantDashboard user={user} tab={sp.tab ?? "saved"} />;
}
