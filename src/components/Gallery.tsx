"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  if (n === 0) return <div className="skeleton aspect-[4/3] w-full rounded-xl" />;
  const go = (d: number) => setI((i + d + n) % n);
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-stone bg-stone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={`${alt} (photo ${i + 1} of ${n})`} className="aspect-[4/3] w-full object-cover md:aspect-[16/10]" />
        {n > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 shadow-whisper hover:text-palm">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 shadow-whisper hover:text-palm">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-white" aria-hidden>
          {i + 1} of {n}
        </span>
      </div>
      {n > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Photo thumbnails">
          {images.map((src, idx) => (
            <li key={src + idx} className="shrink-0">
              <button
                onClick={() => setI(idx)}
                aria-label={`Show photo ${idx + 1}`}
                aria-current={idx === i}
                className={`block overflow-hidden rounded-lg border-2 ${idx === i ? "border-palm" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-16 w-20 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
