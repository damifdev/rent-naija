"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Please wait…",
  className = "btn-primary w-full",
  pending,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  /** Pass when the form submits via onSubmit (see useServerAction). Otherwise the parent <form action> status is used. */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <button type="submit" disabled={busy} className={className}>
      {busy ? pendingText : children}
    </button>
  );
}
