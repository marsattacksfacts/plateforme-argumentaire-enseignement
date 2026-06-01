"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TRACE, HALTES } from "@/lib/trace";

const supabase = createClient();

// ── HELPERS ────────────────────────────────────────────────────────────────

function distM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closestTraceIdx(lat: number, lng: number): number {
  let best = 0, bestD = Infinity;
  TRACE.forEach(([tlat, tlng], i) => {
    const d = (tlat - lat) ** 2 + (tlng - lng) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

function cumulKmAtIdx(idx: number): number {
  let d = 0;
  for (let i = 1; i <= idx && i < TRACE.length; i++) {
    d += distM(TRACE[i-1][0], TRACE[i-1][1], TRACE[i][0], TRACE[i][1]);
  }
  return d / 1000;
}

function computeRolling(locs: { lat: number; lng: number; created_at: string }[]) {
  const MIN_DIST_M = 30;
  const MAX_GAP_SEC = 300;
  let totalSec = 0, totalKm = 0;
  for (let i = 1; i < locs.length; i++) {
    const d = distM(locs[i-1].lat, locs[i-1].lng, locs[i].lat, locs[i].lng);
    const dt = (new Date(locs[i].created_at).getTime() - new Date(locs[i-1].created_at).getTime()) / 1000;
    if (d > MIN_DIST_M && dt < MAX_GAP_SEC) { totalSec += dt; totalKm += d / 1000; }
  }
  return { totalSec, totalKm };
}

function getHalteStyle(type: string) {
  if (type === "depart")    return { fill: "#C0440E", r: 6, stroke: "#FBF6ED" };
  if (type === "etape_cle") return { fill: "#C0440E", r: 5, stroke: "#FBF6ED" };
  if (type === "nuit")      return { fill: "#E8B43A", r: 7, stroke: "#1C1917" };
  if (type === "arrivee")   return { fill: "#1C1917", r: 7, stroke: "#FBF6ED" };
  return { fill: "#1C1917", r: 3, stroke: "none" };
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function LivePage() {
  const [locations, setLocations] = useState<{ lat: number; lng: number; created_at: string }[]>([]);
  const [carteJour, setCarteJour] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("locations")
        .select("lat, lng, created_at")
        .order("created_at", { ascending: true });
      setLocations(data || []);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (locations.length < 2) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-[#6B6459]">En attente des premières positions…</p>
      </main>
    );
  }

  // ── Position actuelle ───────────────────────────────────────────────────
  const last = locations[locations.length - 1];
  const lastIdx = closestTraceIdx(last.lat, last.lng);
  const snappedLat = TRACE[lastIdx][0];
  const snappedLng = TRACE[lastIdx][1];
  const distParcourueKm = cumulKmAtIdx(lastIdx);

  // ── Vitesses ────────────────────────────────────────────────────────────
  const { totalSec, totalKm } = computeRolling(locations);
  const vitesseGenerale = totalSec > 0 ? totalKm / (totalSec / 3600) : 0;

  // Tronçon actuel — HALTES est trié par kmTrace depuis trace.ts
  let idxHalteDepart = 0;
  for (let i = 0; i < HALTES.length - 1; i++) {
    if (HALTES[i].kmTrace <= distParcourueKm && HALTES[i + 1].kmTrace > distParcourueKm) {
      idxHalteDepart = i;
      break;
    }
  }
  const kmDebutTroncon = HALTES[idxHalteDepart].kmTrace;
  const distSurTronconKm = Math.max(0, distParcourueKm - kmDebutTroncon);

  const locsSurTroncon = locations.filter(loc => {
    const km = cumulKmAtIdx(closestTraceIdx(loc.lat, loc.lng));
    return km >= kmDebutTroncon;
  });
  const { totalSec: secTroncon, totalKm: kmTroncon } = computeRolling(locsSurTroncon);
  const vitesseTroncon = secTroncon > 0 ? kmTroncon / (secTroncon / 3600) : 0;

  const vitesseEstim =
    distSurTronconKm > 1
      ? (vitesseTroncon > 0 ? vitesseTroncon : vitesseGenerale || 12)
      : (vitesseGenerale > 0 ? vitesseGenerale : 12);

  // Prochaine halte
  const prochaineHalte = HALTES.find(h => h.type !== "depart" && h.kmTrace > distParcourueKm) ?? null;
  const kmRestant = prochaineHalte ? Math.max(0, prochaineHalte.kmTrace - distParcourueKm) : 0;
  const tempsRestantMin = prochaineHalte && vitesseEstim > 0 ? (kmRestant / vitesseEstim) * 60 : 0;

  // ── Carte ───────────────────────────────────────────────────────────────
  const kmBornes: Record<1 | 2 | 3, [number, number]> = {
    1: [0,   68],
    2: [63, 120],
    3: [115, 170],
  };
  const [kmMin, kmMax] = kmBornes[carteJour];

  // Indices globaux des points de la trace pour ce jour
  const traceJourIndices: number[] = [];
  TRACE.forEach((_, i) => {
    const km = cumulKmAtIdx(i);
    if (km >= kmMin && km <= kmMax) traceJourIndices.push(i);
  });
  const traceJour = traceJourIndices.map(i => TRACE[i]);

  // Portion déjà parcourue dans ce jour
  const traceDone = traceJourIndices.filter(i => i <= lastIdx).map(i => TRACE[i]);

  // Haltes à afficher pour ce jour
  const haltesJour = HALTES.filter(h => h.kmTrace >= kmMin - 3 && h.kmTrace <= kmMax + 3);

  // Projection SVG — bounds calculés une seule fois sur traceJour
  const project = (lat: number, lng: number): { x: number; y: number } => {
    if (traceJour.length < 2) return { x: 400, y: 150 };
    const lats = traceJour.map(t => t[0]);
    const lngs = traceJour.map(t => t[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 48;
    const x = pad + ((lng - minLng) / (maxLng - minLng || 1)) * (800 - 2 * pad);
    const y = 300 - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (300 - 2 * pad);
    return { x, y };
  };

  const showPosition = distParcourueKm >= kmMin - 2 && distParcourueKm <= kmMax + 2;
  const posActuelle = project(snappedLat, snappedLng);
  const jourActuel: 1 | 2 | 3 = distParcourueKm < 65 ? 1 : distParcourueKm < 118 ? 2 : 3;
  const displayJour = carteJour ?? jourActuel;

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80">
          <p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map(j => (
            <button key={j} onClick={() => setCarteJour(j)}
              className={`text-xs px-2 py-1 border transition-colors ${
                displayJour === j
                  ? "bg-[#C0440E] text-white border-[#C0440E]"
                  : "border-black/10 text-[#6B6459] hover:border-black/30"
              }`}>
              J{j}
            </button>
          ))}
        </div>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Suivi live</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Distance parcourue", value: `${distParcourueKm.toFixed(1)} km` },
            { label: "Temps de roulage",   value: `${Math.floor(totalSec / 60)} min` },
            { label: "Vitesse générale",   value: vitesseGenerale > 0 ? `${vitesseGenerale.toFixed(1)} km/h` : "—" },
            { label: "Vitesse tronçon",    value: vitesseTroncon > 0  ? `${vitesseTroncon.toFixed(1)} km/h`  : "—" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-4 text-center">
              <p className="font-serif text-3xl font-black text-[#C0440E]">{s.value}</p>
              <p className="text-[10px] text-[#6B6459] uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Prochaine halte */}
        {prochaineHalte && (
          <div className="bg-[#C0440E]/5 border border-[#C0440E]/20 p-6 text-center mb-10">
            <p className="text-xs text-[#C0440E] uppercase tracking-widest mb-2">Prochaine halte</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">{prochaineHalte.ville}</p>
            <p className="text-sm text-[#6B6459] mt-1">{kmRestant.toFixed(1)} km restants</p>
            {tempsRestantMin > 0 && (
              <p className="text-lg font-bold text-[#C0440E] mt-2">~{Math.round(tempsRestantMin)} min</p>
            )}
          </div>
        )}

        {/* Carte */}
        <div className="border border-black/10 bg-[#FBF6ED] overflow-hidden">
          <svg viewBox="0 0 800 300" className="w-full" style={{ height: "auto" }}>

            {/* Trace complète du jour — pointillée */}
            {traceJour.length > 1 && (
              <polyline
                points={traceJour.map(t => { const {x,y} = project(t[0],t[1]); return `${x},${y}`; }).join(" ")}
                fill="none" stroke="#C0440E" strokeWidth="2" strokeDasharray="6 4" opacity="0.35"
              />
            )}

            {/* Portion déjà parcourue — trait plein */}
            {traceDone.length > 1 && (
              <polyline
                points={traceDone.map(t => { const {x,y} = project(t[0],t[1]); return `${x},${y}`; }).join(" ")}
                fill="none" stroke="#C0440E" strokeWidth="3" strokeLinecap="round"
              />
            )}

            {/* Haltes */}
            {haltesJour.map(h => {
              const {x, y} = project(h.lat, h.lng);
              const style = getHalteStyle(h.type);
              return (
                <g key={h.id}>
                  <circle cx={x} cy={y} r={style.r} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" />
                  {h.type === "nuit" && (
                    <text x={x} y={y+4} textAnchor="middle" fontSize="6" fill="#1C1917">🌙</text>
                  )}
                  <text
                    x={x} y={y > 60 ? y - style.r - 4 : y + style.r + 10}
                    textAnchor="middle" fontSize="8" fill="#1C1917" fontWeight="600" fontFamily="sans-serif"
                  >
                    {h.ville}
                  </text>
                </g>
              );
            })}

            {/* Position actuelle */}
            {showPosition && (
              <g>
                <circle cx={posActuelle.x} cy={posActuelle.y} r="9" fill="#22c55e" opacity="0.25" />
                <circle cx={posActuelle.x} cy={posActuelle.y} r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
              </g>
            )}

          </svg>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[#6B6459] font-medium">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C0440E] border border-white inline-block" />Étape clé</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#E8B43A] border border-[#1C1917] inline-block" />Nuit</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1C1917] opacity-50 inline-block" />Halte</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 border border-white inline-block" />Position actuelle</span>
        </div>
      </section>
    </main>
  );
}