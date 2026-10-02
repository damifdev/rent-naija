"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="text-clay">We could not load this page. Please try again.</p>
      <button onClick={reset} className="btn-primary mt-2">Try again</button>
    </div>
  );
}
