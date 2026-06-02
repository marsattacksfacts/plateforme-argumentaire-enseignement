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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closestTraceIdx(lat: number, lng: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < TRACE.length; i++) {
    const [tlat, tlng] = TRACE[i];
    const d = (tlat - lat) ** 2 + (tlng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
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
  let totalSec = 0;
  let totalKm = 0;
  for (let i = 1; i < locs.length; i++) {
    const d = distM(locs[i-1].lat, locs[i-1].lng, locs[i].lat, locs[i].lng);
    const dt = (new Date(locs[i].created_at).getTime() - new Date(locs[i-1].created_at).getTime()) / 1000;
    if (d > 30 && dt < 300) {
      totalSec += dt;
      totalKm += d / 1000;
    }
  }
  return { totalSec, totalKm };
}

function getHalteStyle(type: string) {
  if (type === "depart") return { fill: "#C0440E", r: 6, stroke: "#FBF6ED" };
  if (type === "etape_cle") return { fill: "#C0440E", r: 5, stroke: "#FBF6ED" };
  if (type === "nuit") return { fill: "#E8B43A", r: 7, stroke: "#1C1917" };
  if (type === "arrivee") return { fill: "#1C1917", r: 7, stroke: "#FBF6ED" };
  return { fill: "#1C1917", r: 3, stroke: "none" };
}

const kmBornes: Record<1 | 2 | 3, [number, number]> = { 
  1: [0, 68], 
  2: [63, 120], 
  3: [115, 170] 
};

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function LivePage() {
  const [locations, setLocations] = useState<{ lat: number; lng: number; created_at: string }[]>([]);
  const [autoJour, setAutoJour] = useState(true);
  const [carteJour, setCarteJour] = useState<1 | 2 | 3>(1);

  // Chargement des données
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

  // Attente des premières données
  if (locations.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-[#6B6459]">Chargement des positions…</p>
      </main>
    );
  }

  // ── Calculs simplifiés ──────────────────────────────────────────────────────
  const last = locations[locations.length - 1];
  const lastIdx = closestTraceIdx(last.lat, last.lng);
  const snappedLat = TRACE[lastIdx][0];
  const snappedLng = TRACE[lastIdx][1];
  const distParcourueKm = cumulKmAtIdx(lastIdx);

  const { totalSec, totalKm } = computeRolling(locations);
  const vitesseGenerale = totalSec > 0 ? totalKm / (totalSec / 3600) : 0;

  // Trouver le tronçon actuel
  let idxHalteDepart = 0;
  for (let i = 0; i < HALTES.length - 1; i++) {
    if (HALTES[i].kmTrace <= distParcourueKm && HALTES[i + 1].kmTrace > distParcourueKm) {
      idxHalteDepart = i;
      break;
    }
  }
  
  const kmDebutTroncon = HALTES[idxHalteDepart].kmTrace;
  const distSurTronconKm = Math.max(0, distParcourueKm - kmDebutTroncon);
  
  // Filtrer les points du tronçon
  const locsSurTroncon = locations.filter(loc => {
    const idx = closestTraceIdx(loc.lat, loc.lng);
    return cumulKmAtIdx(idx) >= kmDebutTroncon;
  });
  
  const { totalSec: secTroncon, totalKm: kmTroncon } = computeRolling(locsSurTroncon);
  const vitesseTroncon = secTroncon > 0 ? kmTroncon / (secTroncon / 3600) : 0;
  const vitesseEstim = distSurTronconKm > 1 
    ? (vitesseTroncon > 0 ? vitesseTroncon : vitesseGenerale || 12) 
    : (vitesseGenerale > 0 ? vitesseGenerale : 12);

  // Trouver la prochaine halte par proximité géographique (ignorer les haltes déjà dépassées)
  const findNextHalteByProximity = (currentLat: number, currentLng: number) => {
    // 1) Trouver l'index de la dernière halte réellement passée (celle dont on est à moins de 500m)
    let lastPassedIndex = -1;
    for (let i = 0; i < HALTES.length; i++) {
      const h = HALTES[i];
      const distToHalte = distM(currentLat, currentLng, h.lat, h.lng);
      if (distToHalte < 500) { // 500m = considérée comme "atteinte"
        lastPassedIndex = i;
      }
    }
    
    // 2) La prochaine halte est celle juste après la dernière atteinte
    if (lastPassedIndex >= 0 && lastPassedIndex + 1 < HALTES.length) {
      return HALTES[lastPassedIndex + 1];
    }
    
    // 3) Fallback: trouver la halte la plus proche en distance, sauf si elle est déjà dans le passé
    let best = null;
    let bestDist = Infinity;
    for (const h of HALTES) {
      if (h.type === "depart" || h.type === "arrivee") continue;
      const dist = distM(currentLat, currentLng, h.lat, h.lng);
      if (dist < bestDist) {
        bestDist = dist;
        best = h;
      }
    }
    return best;
  };

  const prochaineHalte = findNextHalteByProximity(last.lat, last.lng);
  const kmRestant = prochaineHalte ? distM(last.lat, last.lng, prochaineHalte.lat, prochaineHalte.lng) / 1000 : 0;
  const tempsRestantMin = prochaineHalte && vitesseEstim > 0 ? (kmRestant / vitesseEstim) * 60 : 0;

  // Jour actuel (basé uniquement sur la distance)
  const jourActuel: 1 | 2 | 3 = distParcourueKm < 65 ? 1 : distParcourueKm < 118 ? 2 : 3;
  const displayJour = autoJour ? jourActuel : carteJour;

  // Préparer la carte du jour sélectionné
  const [kmMin, kmMax] = kmBornes[displayJour];
  const traceJourIndices: number[] = [];
  TRACE.forEach((_, i) => {
    const km = cumulKmAtIdx(i);
    if (km >= kmMin && km <= kmMax) traceJourIndices.push(i);
  });
  
  const traceJour = traceJourIndices.map(i => TRACE[i]);
  const traceDone = traceJourIndices.filter(i => i <= lastIdx).map(i => TRACE[i]);
  const haltesJour = HALTES.filter(h => h.kmTrace >= kmMin - 3 && h.kmTrace <= kmMax + 3);

  // Projection cartographique
  const project = (lat: number, lng: number): { x: number; y: number } => {
    if (traceJour.length < 2) return { x: 400, y: 150 };
    const lats = traceJour.map(t => t[0]);
    const lngs = traceJour.map(t => t[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 48;
    const x = pad + ((lng - minLng) / (maxLng - minLng || 1)) * (800 - 2 * pad);
    const y = 300 - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (300 - 2 * pad);
    return { x, y };
  };

  const showPosition = distParcourueKm >= kmMin - 2 && distParcourueKm <= kmMax + 2;
  const posActuelle = project(snappedLat, snappedLng);

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80">
          <p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map(j => (
            <button
              key={j}
              onClick={() => { setCarteJour(j); setAutoJour(false); }}
              className={`text-xs px-2 py-1 border transition-colors ${
                displayJour === j 
                  ? "bg-[#C0440E] text-white border-[#C0440E]" 
                  : "border-black/10 text-[#6B6459] hover:border-black/30"
              }`}
            >
              J{j}
            </button>
          ))}
        </div>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Suivi live</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Distance parcourue", value: `${distParcourueKm.toFixed(1)} km` },
            { label: "Temps de roulage", value: `${Math.floor(totalSec / 60)} min` },
            { label: "Vitesse générale", value: vitesseGenerale > 0 ? `${vitesseGenerale.toFixed(1)} km/h` : "—" },
            { label: "Vitesse tronçon", value: vitesseTroncon > 0 ? `${vitesseTroncon.toFixed(1)} km/h` : "—" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-4 text-center">
              <p className="font-serif text-3xl font-black text-[#C0440E]">{s.value}</p>
              <p className="text-[10px] text-[#6B6459] uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Prochaine halte */}
        {prochaineHalte && (
          <div className={`p-6 text-center mb-10 border ${
            kmRestant < 0.8 
              ? "bg-green-50 border-green-300" 
              : "bg-[#C0440E]/5 border-[#C0440E]/20"
          }`}>
            {kmRestant < 0.8 ? (
              <>
                <p className="text-xs text-green-700 uppercase tracking-widest mb-2">📍 Ils sont à la halte !</p>
                <p className="font-serif text-2xl font-bold text-[#1C1917]">{prochaineHalte.ville}</p>
                {(() => {
                  const nextHalte = HALTES.find(h => h.type !== "depart" && h.kmTrace > prochaineHalte!.kmTrace);
                  if (!nextHalte) return null;
                  const kmToNext = nextHalte.kmTrace - distParcourueKm;
                  const minToNext = vitesseEstim > 0 ? (kmToNext / vitesseEstim) * 60 : 0;
                  return (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 uppercase tracking-widest mb-1">Prochaine halte</p>
                      <p className="font-serif text-lg font-bold text-[#1C1917]">{nextHalte.ville}</p>
                      <p className="text-sm text-[#6B6459] mt-1">{kmToNext.toFixed(1)} km restants</p>
                      {minToNext > 0 && (
                        <p className="text-lg font-bold text-[#C0440E] mt-1">
                          ~{Math.round(minToNext)} min · Arrivée vers {new Date(Date.now() + minToNext * 60000).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </>
            ) : (
              <>
                <p className="text-xs text-[#C0440E] uppercase tracking-widest mb-2">Prochaine halte</p>
                <p className="font-serif text-2xl font-bold text-[#1C1917]">{prochaineHalte.ville}</p>
                <p className="text-sm text-[#6B6459] mt-1">{kmRestant.toFixed(1)} km restants</p>
                {tempsRestantMin > 0 && (
                  <p className="text-lg font-bold text-[#C0440E] mt-2">
                    ~{Math.round(tempsRestantMin)} min · Arrivée vers {new Date(Date.now() + tempsRestantMin * 60000).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Carte SVG */}
        <div className="border border-black/10 bg-[#FBF6ED] overflow-hidden">
          <svg viewBox="0 0 800 300" className="w-full" style={{ height: "auto" }}>
            {/* Trace totale du jour (grise) */}
            {traceJour.length > 1 && (
              <polyline 
                points={traceJour.map(t => { const {x,y} = project(t[0],t[1]); return `${x},${y}`; }).join(" ")} 
                fill="none" 
                stroke="#C0440E" 
                strokeWidth="2" 
                strokeDasharray="6 4" 
                opacity="0.35" 
              />
            )}
            
            {/* Trace parcourue (rouge) */}
            {traceDone.length > 1 && (
              <polyline 
                points={traceDone.map(t => { const {x,y} = project(t[0],t[1]); return `${x},${y}`; }).join(" ")} 
                fill="none" 
                stroke="#C0440E" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
            )}
            
            {/* Points d'étape */}
            {haltesJour.map(h => {
              const {x,y} = project(h.lat, h.lng);
              const s = getHalteStyle(h.type);
              return (
                <g key={h.id}>
                  <circle cx={x} cy={y} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
                  {h.type === "nuit" && (
                    <text x={x} y={y+4} textAnchor="middle" fontSize="6" fill="#1C1917">🌙</text>
                  )}
                  <text 
                    x={x} 
                    y={y > 60 ? y - s.r - 4 : y + s.r + 10} 
                    textAnchor="middle" 
                    fontSize="8" 
                    fill="#1C1917" 
                    fontWeight="600" 
                    fontFamily="sans-serif"
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
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C0440E] border border-white inline-block" />
            Étape clé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E8B43A] border border-[#1C1917] inline-block" />
            Nuit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1C1917] opacity-50 inline-block" />
            Halte
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 border border-white inline-block" />
            Position actuelle
          </span>
        </div>
      </section>
    </main>
  );
}