"use client";

import { useState } from "react";

// filter chips (period / status) — visual only in the prototype
export function Chips({
  options,
  defaultActive,
}: {
  options: string[];
  defaultActive?: string;
}) {
  const [active, setActive] = useState(defaultActive ?? options[0]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setActive(opt)}
          className={`rounded-full border-[1.5px] px-4 py-1.5 text-[12px] font-bold transition-colors ${
            active === opt
              ? "border-brand bg-brand text-white"
              : "border-sage-line bg-white text-muted hover:border-brand hover:text-brand-dark"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
