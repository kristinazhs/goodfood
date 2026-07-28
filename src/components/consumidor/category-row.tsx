import Link from "next/link";
import type { CategoriaId } from "@/lib/types";

// The organic blob shapes are kept deliberately: they're the app's signature.
// Search doesn't live here — it belongs to Descobrir, where filtering by
// "what's open now" and price already happens.

const categorias: {
  id: CategoriaId;
  emoji: string;
  label: string;
  blob: string;
}[] = [
  { id: "tudo", emoji: "✨", label: "Tudo", blob: "blob-a" },
  { id: "padaria", emoji: "🥖", label: "Padaria", blob: "blob-a" },
  { id: "doceria", emoji: "🍰", label: "Doceria", blob: "blob-b" },
  { id: "refeicao", emoji: "🍽️", label: "Refeição", blob: "blob-a" },
  { id: "mercado", emoji: "🥦", label: "Mercado", blob: "blob-c" },
];

export function CategoryRow({ active }: { active: CategoriaId }) {
  return (
    <div className="flex gap-[13px] overflow-x-auto px-5 pb-[18px] pt-[18px] [scrollbar-width:none]">
      {categorias.map((cat) => {
        const isActive = cat.id === active;
        const href =
          cat.id === "tudo" ? "/consumidor" : `/consumidor?cat=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex shrink-0 flex-col items-center gap-[7px]"
          >
            <span
              className={`flex h-[58px] w-[58px] items-center justify-center text-2xl ${
                isActive ? "blob-a-active bg-brand" : `${cat.blob} bg-sage`
              }`}
            >
              {cat.emoji}
            </span>
            <span
              className={
                isActive
                  ? "text-xs font-bold text-brand-dark"
                  : "text-xs font-semibold text-muted"
              }
            >
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
