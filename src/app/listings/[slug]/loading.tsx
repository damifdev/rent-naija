export default function Loading() {
  return (
    <div className="mx-auto max-w-page px-4 pt-6 md:px-6" aria-busy="true" aria-label="Loading home">
      <div className="skeleton aspect-[16/10] w-full" />
      <div className="skeleton mt-6 h-8 w-2/3" />
      <div className="skeleton mt-3 h-5 w-1/3" />
      <div className="skeleton mt-6 h-24 w-full" />
    </div>
  );
}
