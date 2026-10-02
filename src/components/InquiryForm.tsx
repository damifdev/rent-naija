"use client";

import { CheckCircle2, Send } from "lucide-react";
import { sendInquiry } from "@/lib/actions/engage";
import { SubmitButton } from "./SubmitButton";
import { useServerAction } from "./useServerAction";

export function InquiryForm({
  propertyId,
  propertyTitle,
  defaultName = "",
  defaultPhone = "",
}: {
  propertyId: number;
  propertyTitle: string;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const { state, onSubmit, pending } = useServerAction(sendInquiry.bind(null, propertyId));

  if (state.ok) {
    return (
      <div role="status" className="rounded-xl border border-palm/30 bg-palm-soft p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-palm" aria-hidden />
        <p className="mt-2 font-bold">Inquiry sent</p>
        <p className="mt-1 text-sm text-clay">{state.message}</p>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {state.error && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-alert">{state.error}</p>}
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label htmlFor="inq-name" className="label">Full name</label>
        <input id="inq-name" name="name" className="input" placeholder="e.g. Babatunde Adeyemi" defaultValue={defaultName} autoComplete="name" aria-invalid={!!fe.name} />
        {fe.name && <p className="field-error">{fe.name}</p>}
      </div>
      <div>
        <label htmlFor="inq-phone" className="label">Phone number</label>
        <input id="inq-phone" name="phone" type="tel" className="input" placeholder="0803 123 4567" defaultValue={defaultPhone} autoComplete="tel" aria-invalid={!!fe.phone} />
        {fe.phone && <p className="field-error">{fe.phone}</p>}
      </div>
      <div>
        <label htmlFor="inq-message" className="label">Message</label>
        <textarea id="inq-message" name="message" rows={4} className="input py-3" defaultValue={`Hello, I would like to inspect ${propertyTitle} this weekend.`} aria-invalid={!!fe.message} />
        {fe.message && <p className="field-error">{fe.message}</p>}
      </div>
      <SubmitButton pending={pending} pendingText="Sending…">
        <Send className="h-4 w-4" aria-hidden /> Send inquiry
      </SubmitButton>
    </form>
  );
}
