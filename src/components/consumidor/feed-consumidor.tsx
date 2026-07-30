"use client";

import { useRef, useState } from "react";
import { CategoryRow } from "@/components/consumidor/category-row";
import { BuscaC1 } from "@/components/consumidor/feed-busca";
import { SeletorEndereco } from "@/components/consumidor/seletor-endereco";
import type { Endereco } from "@/lib/enderecos";
import type { CategoriaId, Sacola } from "@/lib/types";

// Owns the two states of the home screen: the feed, and search (C1a/C1b).
// The feed itself is rendered on the server and passed in as `children`, so
// searching doesn't re-fetch anything — every sacola is already here.

export function FeedConsumidor({
  primeiroNome,
  cat,
  todas,
  enderecoLabel,
  enderecos,
  children,
}: {
  primeiroNome: string | null;
  cat: CategoriaId;
  todas: Sacola[];
  /** The address distances are measured from — null when none is saved. */
  enderecoLabel: string | null;
  /** Saved addresses, so the header can switch between them. */
  enderecos: Endereco[];
  children: React.ReactNode;
}) {
  const [buscando, setBuscando] = useState(false);
  const rolagem = useRef(0);

  function abrir() {
    rolagem.current = window.scrollY;
    setBuscando(true);
  }

  function fechar() {
    setBuscando(false);
    // "devolve C1 com rolagem e categoria intactas" — the category never
    // changed (it lives in the URL), and the scroll position is restored
    // once the feed is back in the DOM.
    requestAnimationFrame(() => window.scrollTo(0, rolagem.current));
  }

  if (buscando) {
    return <BuscaC1 todas={todas} aberta aoFechar={fechar} />;
  }

  return (
    <>
      <div className="px-5 pt-[14px]">
        <h1 className="font-display text-[21px] font-semibold leading-[1.2]">
          {primeiroNome ? `Oi, ${primeiroNome} 👋` : "Oi 👋"}
          <br />
          <span className="text-terracotta-dark">a comida boa</span> te espera
        </h1>

        {/* The origin every distance on this screen is measured from — and
            now a real control, not a ▾ that did nothing. */}
        <SeletorEndereco label={enderecoLabel} enderecos={enderecos} />
      </div>

      <CategoryRow active={cat} aoBuscar={abrir} />

      {children}
    </>
  );
}
