"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { login, signup } from "@/lib/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { useServerAction } from "./useServerAction";

export function AuthTabs({ active }: { active: "login" | "signup" }) {
  const tab = (on: boolean) =>
    `flex min-h-[44px] flex-1 items-center justify-center rounded-lg text-sm font-semibold ${on ? "bg-surface text-palm shadow-whisper" : "text-clay hover:text-ink"}`;
  return (
    <div className="flex rounded-xl border border-stone bg-stone/50 p-1" role="tablist" aria-label="Account">
      <Link href="/login" role="tab" aria-selected={active === "login"} className={tab(active === "login")}>Log in</Link>
      <Link href="/signup" role="tab" aria-selected={active === "signup"} className={tab(active === "signup")}>Sign up</Link>
    </div>
  );
}

function PasswordField({ id, name, label, placeholder, autoComplete, error }: {
  id: string; name: string; label: string; placeholder: string; autoComplete: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input id={id} name={name} type={show ? "text" : "password"} className="input pr-12" placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!error} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-clay hover:text-ink">
          {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { state, onSubmit, pending } = useServerAction(login);
  const fe = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-alert">{state.error}</p>}
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" className="input" placeholder="e.g. tunde@example.com" autoComplete="email" aria-invalid={!!fe.email} />
        {fe.email && <p className="field-error">{fe.email}</p>}
      </div>
      <PasswordField id="password" name="password" label="Password" placeholder="Your password" autoComplete="current-password" error={fe.password} />
      <SubmitButton pending={pending} pendingText="Logging in…" className="btn-primary h-12 w-full">Log in</SubmitButton>
    </form>
  );
}

export function SignupForm({ defaultRole }: { defaultRole: "tenant" | "landlord" }) {
  const { state, onSubmit, pending } = useServerAction(signup);
  const [role, setRole] = useState(defaultRole);
  const fe = state.fieldErrors ?? {};
  const roleCard = (value: "tenant" | "landlord", title: string, sub: string) => (
    <label className="relative cursor-pointer">
      <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="peer sr-only" />
      <span className="flex h-full items-start justify-between gap-2 rounded-xl border border-stone bg-paper p-3.5 peer-checked:border-2 peer-checked:border-palm peer-checked:bg-surface peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-palm">
        <span>
          <span className={`block text-sm font-bold ${role === value ? "text-palm" : ""}`}>{title}</span>
          <span className="mt-0.5 block text-xs text-clay">{sub}</span>
        </span>
        {role === value ? <CheckCircle2 className="h-5 w-5 shrink-0 text-palm" aria-hidden /> : <span className="h-5 w-5 shrink-0 rounded-full border border-stone" aria-hidden />}
      </span>
    </label>
  );
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {state.error && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-alert">{state.error}</p>}
      <fieldset className="min-w-0">
        <legend className="label">Select account role</legend>
        <div className="grid grid-cols-2 gap-3">
          {roleCard("tenant", "Looking for a home", "Renters and tenants")}
          {roleCard("landlord", "List properties", "Owners and agents")}
        </div>
        {fe.role && <p className="field-error">{fe.role}</p>}
      </fieldset>
      <div>
        <label htmlFor="name" className="label">Full name</label>
        <input id="name" name="name" className="input" placeholder="e.g. Tunde Adeyemi" autoComplete="name" aria-invalid={!!fe.name} />
        {fe.name && <p className="field-error">{fe.name}</p>}
      </div>
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" className="input" placeholder="e.g. tunde@example.com" autoComplete="email" aria-invalid={!!fe.email} />
        {fe.email && <p className="field-error">{fe.email}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone number</label>
        <div className="flex">
          <span className="flex min-h-[44px] items-center rounded-l-lg border border-r-0 border-stone bg-stone/60 px-3 text-sm font-semibold text-clay">+234</span>
          <input id="phone" name="phone" type="tel" className="input rounded-l-none" placeholder="080 1234 5678" autoComplete="tel-national" aria-invalid={!!fe.phone} />
        </div>
        {fe.phone && <p className="field-error">{fe.phone}</p>}
      </div>
      <PasswordField id="password" name="password" label="Password" placeholder="At least 8 characters" autoComplete="new-password" error={fe.password} />
      <PasswordField id="confirm" name="confirm" label="Confirm password" placeholder="Re-enter password" autoComplete="new-password" error={fe.confirm} />
      <SubmitButton pending={pending} pendingText="Creating account…" className="btn-primary h-12 w-full">Create account</SubmitButton>
    </form>
  );
}

export function AuthFooterNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-clay">
      <ShieldCheck className="h-4 w-4" aria-hidden /> Listings are reviewed by our team before they go live.
    </p>
  );
}
