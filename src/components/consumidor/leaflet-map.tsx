"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { Origem } from "@/lib/distancia";

// Basemap. CARTO "Positron" is a deliberately minimal style — pale, few
// labels, no POI clutter — which is far closer to the design than the
// standard OpenStreetMap tiles, and it needs no API key. A CSS filter
// (.mv-tiles) then warms it toward the app's cream.
//
// Attribution below is required by CARTO's terms, and their free basemaps are
// fair-use: fine for this prototype, worth checking before a commercial launch.
// To go back to plain OSM, swap TILES/ATRIBUICAO for:
//   https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
const TILES =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATRIBUICAO = "&copy; OpenStreetMap &copy; CARTO";

export interface PontoMapa {
  /** One pin per shop. */
  loja: string;
  lat: number;
  lng: number;
  /** Total sacolas on the shelf at that shop right now. */
  quantidade: number;
}

function pinIcon(p: PontoMapa, ativo: boolean) {
  const cor = ativo ? "#ffffff" : p.quantidade === 0 ? "#8d8d84" : "#134d29";
  const classe = ativo
    ? "mv-pin mv-pin-active"
    : p.quantidade === 0
      ? "mv-pin mv-pin-vazio"
      : "mv-pin";
  const tamanho = ativo ? 13 : 12;

  return L.divIcon({
    className: "mv-pin-wrap",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<span class="${classe}">
      <svg width="${tamanho}" height="${tamanho}" viewBox="0 0 22 22" aria-hidden="true">
        <path d="M5 8h12l-1 10.5H6z" fill="none" stroke="${cor}" stroke-width="1.9" stroke-linejoin="round"></path>
        <path d="M8.4 8V6.2a2.6 2.6 0 0 1 5.2 0V8" fill="none" stroke="${cor}" stroke-width="1.9"></path>
      </svg>${p.quantidade}</span>`,
  });
}

export default function LeafletMap({
  pontos,
  origem,
  marcarOrigem,
  lojaSelecionada,
  onSelect,
}: {
  pontos: PontoMapa[];
  /** Where the map opens. Also "você" — but only when marcarOrigem. */
  origem: Origem;
  /** False when no address is saved: centre the map, but don't plant a "you
      are here" pin on a spot the person never told us about. */
  marcarOrigem: boolean;
  lojaSelecionada: string | null;
  onSelect: (loja: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userRef = useRef<L.CircleMarker | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [origem.lat, origem.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer(TILES, {
      maxZoom: 19,
      attribution: ATRIBUICAO,
      className: "mv-tiles",
    }).addTo(map);

    // Where the search is measured from — only when we actually know. With
    // no saved address the map still opens on the city, but planting a "you
    // are here" dot would be telling someone where they are.
    if (marcarOrigem) {
      L.marker([origem.lat, origem.lng], {
        interactive: false,
        icon: L.divIcon({
          className: "mv-pin-wrap",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          html: `<span class="mv-origem"></span>`,
        }),
      }).addTo(map);
    }

    mapRef.current = map;
    // The container is inside a flex layout; make sure Leaflet measured it.
    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // Rebuilt when the origin changes — the "you are here" marker moves.
  }, [origem.lat, origem.lng, marcarOrigem]);

  // (Re)build pins when the set of shops changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const pts: [number, number][] = [];
    pontos.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: pinIcon(p, p.loja === lojaSelecionada),
      });
      marker.on("click", () => onSelect(p.loja));
      marker.addTo(map);
      markersRef.current[p.loja] = marker;
      pts.push([p.lat, p.lng]);
    });

    if (pts.length === 1) {
      map.setView(pts[0], 16);
    } else if (pts.length > 1) {
      map.fitBounds(L.latLngBounds([...pts, [origem.lat, origem.lng]]), {
        padding: [70, 70],
        maxZoom: 16,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pontos]);

  // Restyle + pan when the selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pontos.forEach((p) => {
      const marker = markersRef.current[p.loja];
      if (marker) marker.setIcon(pinIcon(p, p.loja === lojaSelecionada));
    });
    const sel = pontos.find((p) => p.loja === lojaSelecionada);
    if (sel) map.panTo([sel.lat, sel.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaSelecionada]);

  // User-initiated "find me" — asks for location only on tap.
  // Every failure is reported: a silent catch here is why this button felt
  // dead, since a denied permission or a timeout produced nothing at all.
  function localizar() {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      setAviso("Seu navegador não permite localização.");
      return;
    }

    setLocalizando(true);
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizando(false);
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (userRef.current) userRef.current.setLatLng(p);
        else
          userRef.current = L.circleMarker(p, {
            radius: 7,
            weight: 2,
            color: "#ffffff",
            fillColor: "#a8632f",
            fillOpacity: 1,
          }).addTo(map);
        map.setView(p, 15);
      },
      (err) => {
        setLocalizando(false);
        setAviso(
          err.code === err.PERMISSION_DENIED
            ? "Permissão de localização negada. Autorize nas configurações do navegador."
            : "Não conseguimos achar sua localização agora.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />
      {/* directly under the filter button, same size and shape */}
      <button
        type="button"
        onClick={localizar}
        disabled={localizando}
        aria-label="Centralizar no meu local"
        className="absolute right-5 top-[68px] z-[600] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.10)] disabled:opacity-70"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 22 22"
          aria-hidden="true"
          className={localizando ? "animate-spin" : ""}
        >
          <circle cx="11" cy="11" r="5" fill="none" stroke="#134d29" strokeWidth="1.8" />
          <path
            d="M11 1.5v3M11 17.5v3M1.5 11h3M17.5 11h3"
            stroke="#134d29"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {aviso && (
        <button
          type="button"
          onClick={() => setAviso(null)}
          className="absolute inset-x-5 top-[124px] z-[600] rounded-xl bg-white px-3.5 py-3 text-left text-[12.5px] font-semibold leading-[1.4] text-alert shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
        >
          {aviso}
        </button>
      )}
    </>
  );
}
