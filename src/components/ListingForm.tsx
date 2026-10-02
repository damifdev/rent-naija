"use client";

import Link from "next/link";
import { useState } from "react";
import { ImagePlus, Minus, Plus, ShieldCheck, X } from "lucide-react";
import { AMENITIES, AREAS, NIGERIAN_STATES, PROPERTY_TYPES } from "@/lib/constants";
import type { FormState } from "@/lib/validation";
import { SubmitButton } from "./SubmitButton";
import { useServerAction } from "./useServerAction";

export type ListingInitial = {
  title?: string; type?: string; state?: string; area?: string; price?: number;
  bedrooms?: number; bathrooms?: number; area_sqm?: number | null; tag?: string | null;
  description?: string; amenities?: string[];
};

function Counter({ name, label, value, onChange }: { name: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex items-center justify-between rounded-lg border border-stone bg-surface p-1.5">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-md border border-stone hover:border-palm">
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="font-bold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(20, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-md border border-stone hover:border-palm">
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export function ListingForm({
  action,
  initial = {},
  existingImages = [],
  mode,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: ListingInitial;
  existingImages?: { id: number; url: string }[];
  mode: "create" | "edit";
}) {
  const { state, onSubmit, pending } = useServerAction(action);
  const fe = state.fieldErrors ?? {};
  const [stateName, setStateName] = useState(initial.state ?? "Lagos");
  const [beds, setBeds] = useState(initial.bedrooms ?? 2);
  const [baths, setBaths] = useState(initial.bathrooms ?? 2);
  const [price, setPrice] = useState(initial.price ? initial.price.toLocaleString("en-NG") : "");
  const [amenities, setAmenities] = useState<string[]>(initial.amenities ?? []);
  const [removed, setRemoved] = useState<number[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {state.error && <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-alert">{state.error}</p>}
      {Object.keys(fe).length > 0 && (
        <p role="alert" className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-alert">Check the highlighted fields and try again.</p>
      )}

      <div>
        <label htmlFor="title" className="label">Listing title</label>
        <input id="title" name="title" className="input" defaultValue={initial.title} placeholder="e.g. Spacious 2-Bed Terrace Duplex" aria-invalid={!!fe.title} />
        {fe.title && <p className="field-error">{fe.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="state" className="label">State</label>
          <select id="state" name="state" className="input" value={stateName} onChange={(e) => setStateName(e.target.value)}>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          {fe.state && <p className="field-error">{fe.state}</p>}
        </div>
        <div>
          <label htmlFor="area" className="label">City / area</label>
          <input id="area" name="area" list="area-options" className="input" defaultValue={initial.area} placeholder="e.g. Lekki Phase 1" autoComplete="off" aria-invalid={!!fe.area} />
          <datalist id="area-options">{(AREAS[stateName] ?? []).map((a) => <option key={a} value={a} />)}</datalist>
          {fe.area && <p className="field-error">{fe.area}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="label">Property type</label>
          <select id="type" name="type" className="input" defaultValue={initial.type ?? "flat"}>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {fe.type && <p className="field-error">{fe.type}</p>}
        </div>
        <div>
          <label htmlFor="price" className="label">Annual rent (₦ per year)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-clay" aria-hidden>₦</span>
            <input id="price" name="price" inputMode="numeric" className="input pl-8 tabular-nums" placeholder="2,400,000" value={price}
              onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); setPrice(d ? Number(d).toLocaleString("en-NG") : ""); }} aria-invalid={!!fe.price} />
          </div>
          {fe.price && <p className="field-error">{fe.price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><Counter name="bedrooms" label="Bedrooms" value={beds} onChange={setBeds} />{fe.bedrooms && <p className="field-error">{fe.bedrooms}</p>}</div>
        <div><Counter name="bathrooms" label="Bathrooms" value={baths} onChange={setBaths} />{fe.bathrooms && <p className="field-error">{fe.bathrooms}</p>}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="area_sqm" className="label">Total area in sqm <span className="font-normal text-clay">(optional)</span></label>
          <input id="area_sqm" name="area_sqm" inputMode="numeric" className="input tabular-nums" defaultValue={initial.area_sqm ?? ""} placeholder="90" aria-invalid={!!fe.area_sqm} />
          {fe.area_sqm && <p className="field-error">{fe.area_sqm}</p>}
        </div>
        <div>
          <label htmlFor="tag" className="label">Highlight <span className="font-normal text-clay">(optional)</span></label>
          <input id="tag" name="tag" className="input" defaultValue={initial.tag ?? ""} placeholder="e.g. Serviced, Furnished" maxLength={30} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">Property summary and features</label>
        <textarea id="description" name="description" rows={5} className="input py-3" defaultValue={initial.description}
          placeholder="Serviced, 24/7 power, treated water, fitted kitchen, dedicated parking space…" aria-invalid={!!fe.description} />
        {fe.description && <p className="field-error">{fe.description}</p>}
      </div>

      <fieldset className="min-w-0">
        <legend className="label">Amenities</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const on = amenities.includes(a);
            return (
              <label key={a} className="relative cursor-pointer">
                <input type="checkbox" name="amenities" value={a} checked={on} className="peer sr-only"
                  onChange={() => setAmenities(on ? amenities.filter((x) => x !== a) : [...amenities, a])} />
                <span className="chip peer-checked:border-palm peer-checked:bg-palm-soft peer-checked:font-semibold peer-checked:text-palm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-palm">{a}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="label">Property photos</p>
        {existingImages.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {existingImages.map((img) => {
              const gone = removed.includes(img.id);
              return (
                <li key={img.id} className="relative overflow-hidden rounded-lg border border-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className={`aspect-[4/3] w-full object-cover ${gone ? "opacity-30" : ""}`} />
                  {gone && <input type="hidden" name="remove_images" value={img.id} />}
                  <button type="button" onClick={() => setRemoved(gone ? removed.filter((r) => r !== img.id) : [...removed, img.id])}
                    className="absolute right-1 top-1 flex h-7 items-center gap-1 rounded-md bg-surface/95 px-2 text-xs font-semibold shadow-whisper" aria-label={gone ? "Keep this photo" : "Remove this photo"}>
                    {gone ? "Undo" : <><X className="h-3 w-3" aria-hidden />Remove</>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <label htmlFor="photos" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone bg-paper px-4 py-8 text-center hover:border-palm">
          <ImagePlus className="h-7 w-7 text-clay" aria-hidden />
          <span className="text-sm font-semibold">{mode === "edit" ? "Add more photos" : "Add photos (up to 8)"}</span>
          <span className="text-xs text-clay">PNG, JPG or WebP, up to 10MB each. The first photo is the cover.</span>
        </label>
        <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only"
          onChange={(e) => setPreviews(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, url: URL.createObjectURL(f) })))} />
        {previews.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Selected photos">
            {previews.map((p) => (
              <li key={p.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name} className="aspect-[4/3] w-full rounded-lg border border-stone object-cover" />
              </li>
            ))}
          </ul>
        )}
        {fe.photos && <p className="field-error">{fe.photos}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <SubmitButton pending={pending} pendingText={mode === "edit" ? "Saving…" : "Submitting…"} className="btn-primary h-12 w-full">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          {mode === "edit" ? "Save changes" : "Submit for approval"}
        </SubmitButton>
        <p className="text-center text-xs leading-relaxed text-clay">
          An admin reviews every listing before it appears in search.
        </p>
        <Link href="/dashboard" className="btn-secondary w-full">Cancel</Link>
      </div>
    </form>
  );
}
