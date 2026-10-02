"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { AREAS, NIGERIAN_STATES, PROPERTY_TYPES } from "@/lib/constants";

export type FilterValues = {
  state?: string; area?: string; type?: string; min?: number; max?: number; beds?: number; baths?: number;
};

const fmt = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d ? Number(d).toLocaleString("en-NG") : "";
};

function Stepper({ label, unit, value, onChange }: { label: string; unit: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="rounded-xl border border-stone bg-paper p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" aria-label={`Fewer ${unit}s`} onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone bg-surface hover:border-palm">
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="text-sm font-semibold tabular-nums" aria-live="polite">
          {value === 0 ? "Any" : `${value}+ ${unit}${value === 1 ? "" : "s"}`}
        </span>
        <button type="button" aria-label={`More ${unit}s`} onClick={() => onChange(Math.min(10, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone bg-surface hover:border-palm">
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function FilterForm({ initial, idPrefix, onDone }: { initial: FilterValues; idPrefix: string; onDone?: () => void }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [state, setState] = useState(initial.state ?? "");
  const [area, setArea] = useState(initial.area ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [min, setMin] = useState(initial.min ? initial.min.toLocaleString("en-NG") : "");
  const [max, setMax] = useState(initial.max ? initial.max.toLocaleString("en-NG") : "");
  const [beds, setBeds] = useState(initial.beds ?? 0);
  const [baths, setBaths] = useState(initial.baths ?? 0);
  const areaOptions = AREAS[state] ?? [];

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    const q = sp.get("q"); if (q) p.set("q", q);
    const sort = sp.get("sort"); if (sort) p.set("sort", sort);
    if (state) p.set("state", state);
    if (area.trim()) p.set("area", area.trim());
    if (type) p.set("type", type);
    if (min) p.set("min", min.replace(/\D/g, ""));
    if (max) p.set("max", max.replace(/\D/g, ""));
    if (beds) p.set("beds", String(beds));
    if (baths) p.set("baths", String(baths));
    router.push(`/listings${p.toString() ? `?${p}` : ""}`);
    onDone?.();
  }

  function clear() {
    router.push("/listings");
    onDone?.();
  }

  const id = (s: string) => `${idPrefix}-${s}`;
  return (
    <form onSubmit={apply} className="space-y-5">
      <div>
        <label htmlFor={id("state")} className="label">State</label>
        <select id={id("state")} className="input" value={state} onChange={(e) => { setState(e.target.value); setArea(""); }}>
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={id("area")} className="label">Area or district</label>
        <input id={id("area")} className="input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Lekki" autoComplete="off" />
        {areaOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {areaOptions.map((a) => (
              <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(area === a ? "" : a)}
                className={`chip ${area === a ? "border-palm bg-palm text-white" : ""}`}>
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="label">Price range (₦ per year)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id("min")} className="mb-1 block text-xs text-clay">Minimum</label>
            <input id={id("min")} inputMode="numeric" className="input tabular-nums" value={min} onChange={(e) => setMin(fmt(e.target.value))} placeholder="0" />
          </div>
          <div>
            <label htmlFor={id("max")} className="mb-1 block text-xs text-clay">Maximum</label>
            <input id={id("max")} inputMode="numeric" className="input tabular-nums" value={max} onChange={(e) => setMax(fmt(e.target.value))} placeholder="No limit" />
          </div>
        </div>
      </div>

      <div>
        <p className="label">Property type</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button key={t.value} type="button" aria-pressed={type === t.value} onClick={() => setType(type === t.value ? "" : t.value)}
              className={`chip ${type === t.value ? "border-palm bg-palm text-white" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stepper label="Bedrooms" unit="bed" value={beds} onChange={setBeds} />
        <Stepper label="Bathrooms" unit="bath" value={baths} onChange={setBaths} />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="btn-primary flex-1">Show homes</button>
        <button type="button" onClick={clear} className="btn-secondary">Clear all</button>
      </div>
    </form>
  );
}
