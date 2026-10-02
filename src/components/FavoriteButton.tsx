import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/engage";

export function FavoriteButton({
  id,
  saved,
  returnTo,
  className = "",
}: {
  id: number;
  saved: boolean;
  returnTo: string;
  className?: string;
}) {
  return (
    <form action={toggleFavorite.bind(null, id, returnTo)}>
      <button
        aria-label={saved ? "Remove from saved homes" : "Save this home"}
        aria-pressed={saved}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 text-ink shadow-whisper transition-colors hover:text-alert ${className}`}
      >
        <Heart className={`h-5 w-5 ${saved ? "fill-alert text-alert" : ""}`} aria-hidden />
      </button>
    </form>
  );
}
