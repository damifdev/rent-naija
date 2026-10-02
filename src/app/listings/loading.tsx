export default function Loading() {
  return (
    <div className="mx-auto max-w-page px-4 pt-6 md:px-6" aria-busy="true" aria-label="Loading homes">
      <div className="skeleton mb-6 h-9 w-56" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
