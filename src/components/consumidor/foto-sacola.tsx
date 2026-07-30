import { IconBag } from "@/components/ui/icons";

// The photo slot on every sacola card.
//
// There are no real establishment photos yet (no image column, no storage
// bucket), so this renders the design's striped placeholder. When photos
// arrive, only this file changes: pass `src` and the whole app gets photos.
//
// `quantidade` is the stock plaque that sits on top of the photo — the number
// of bags that exist RIGHT NOW. It is a fact, never a promise about later.

interface FotoSacolaProps {
  /** Real photo url — falls back to the striped placeholder when absent. */
  src?: string | null;
  alt?: string;
  /** Stock plaque; omitted when undefined. */
  quantidade?: number;
  size?: number;
  radius?: number;
  legenda?: string;
}

export function FotoSacola({
  src,
  alt = "",
  quantidade,
  size = 78,
  radius = 14,
  // At compact sizes the plaque covers the top of the box, so the two-line
  // caption gets clipped — one word fits.
  legenda = size <= 56 ? "foto" : "foto\nsacola",
}: FotoSacolaProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ borderRadius: radius }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center whitespace-pre text-center font-mono text-[9px] leading-[1.2] text-muted"
          style={{
            borderRadius: radius,
            background:
              "repeating-linear-gradient(135deg,#e4ede3 0 8px,#eff5ef 8px 16px)",
          }}
        >
          {legenda}
        </div>
      )}

      {quantidade != null && (
        <span className="absolute left-[5px] top-[5px] inline-flex h-5 items-center gap-1 rounded-md bg-white/95 px-1.5 text-[11px] font-extrabold leading-none text-brand-dark">
          <IconBag />
          {quantidade}
        </span>
      )}
    </div>
  );
}
