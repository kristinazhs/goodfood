"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { brl } from "@/lib/format";
import type { Sacola } from "@/lib/types";

// Bom Fim, Porto Alegre — the map's initial focus.
const CENTRO: [number, number] = [-30.0331, -51.212];

function makeIcon(s: Sacola, active: boolean) {
  return L.divIcon({
    className: "mv-pin-wrap",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<span class="mv-pin ${active ? "mv-pin-active" : ""}"><span class="mv-pin-emoji">${s.emoji}</span>${brl(s.preco)}</span>`,
  });
}

export default function LeafletMap({
  sacolas,
  selectedId,
  onSelect,
}: {
  sacolas: Sacola[];
  selectedId: string | null;
  onSelect: (s: Sacola) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userRef = useRef<L.CircleMarker | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: CENTRO,
      zoom: 15,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    // The container is inside a flex layout; make sure Leaflet measured it.
    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // (Re)build markers when the sacola set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const pts: [number, number][] = [];
    sacolas.forEach((s) => {
      if (s.lat == null || s.lng == null) return;
      const marker = L.marker([s.lat, s.lng], {
        icon: makeIcon(s, s.id === selectedId),
      });
      marker.on("click", () => onSelect(s));
      marker.addTo(map);
      markersRef.current[s.id] = marker;
      pts.push([s.lat, s.lng]);
    });

    if (pts.length === 1) {
      map.setView(pts[0], 16);
    } else if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sacolas]);

  // Restyle + pan when the selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    sacolas.forEach((s) => {
      const marker = markersRef.current[s.id];
      if (marker) marker.setIcon(makeIcon(s, s.id === selectedId));
    });
    const sel = sacolas.find((s) => s.id === selectedId);
    if (sel && sel.lat != null && sel.lng != null) {
      map.panTo([sel.lat, sel.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // User-initiated "find me" — asks for location only on tap.
  function localizar() {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
      () => {},
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />
      <button
        type="button"
        onClick={localizar}
        aria-label="Centralizar no meu local"
        className="absolute right-4 top-4 z-[600] flex h-10 w-10 items-center justify-center rounded-full bg-white text-base shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      >
        🎯
      </button>
    </>
  );
}
