export function StatusPill({ status, rented }: { status: string; rented?: number }) {
  if (rented) return <span className="pill bg-stone text-clay">Rented</span>;
  if (status === "approved") return <span className="pill bg-palm-soft text-palm">Approved</span>;
  if (status === "rejected") return <span className="pill bg-[#FDECEA] text-alert">Rejected</span>;
  return <span className="pill bg-stone text-ink/80">Pending</span>;
}
