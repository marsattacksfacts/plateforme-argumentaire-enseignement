"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ── TRACE ──────────────────────────────────────────────────────────────────

const TRACE: [number, number][] = [
  [50.592580, 5.861104], [50.595435, 5.852475], [50.597115, 5.843460],
  [50.602935, 5.834511], [50.613100, 5.833085], [50.621561, 5.829529],
  [50.627432, 5.817931], [50.630898, 5.809227], [50.635831, 5.799091],
  [50.639393, 5.794122], [50.640309, 5.786100], [50.637832, 5.762320],
  [50.634982, 5.745288], [50.632466, 5.734238], [50.625047, 5.706262],
  [50.616984, 5.686349], [50.611573, 5.677691], [50.616451, 5.661240],
  [50.624412, 5.646470], [50.622045, 5.626702], [50.615214, 5.621465],
  [50.609603, 5.614213], [50.611154, 5.612289], [50.615083, 5.598919],
  [50.620851, 5.582673], [50.627590, 5.575856], [50.634703, 5.567662],
  [50.632281, 5.563784], [50.628629, 5.553649], [50.625357, 5.549832],
  [50.624987, 5.538380], [50.620775, 5.525557], [50.620571, 5.514879],
  [50.617485, 5.511619], [50.610054, 5.514136], [50.606683, 5.495514],
  [50.596641, 5.480689], [50.590478, 5.458498], [50.584077, 5.422926],
  [50.578571, 5.409004], [50.573807, 5.399380], [50.568508, 5.388587],
  [50.561237, 5.360439], [50.555456, 5.345514], [50.544818, 5.335708],
  [50.534845, 5.317744], [50.534929, 5.283487], [50.534830, 5.260238],
  [50.529592, 5.248972], [50.525247, 5.243584], [50.526529, 5.233093],
  [50.525693, 5.229781], [50.523751, 5.231206], [50.517493, 5.235594],
  [50.524128, 5.221603], [50.524275, 5.199392], [50.516237, 5.183160],
  [50.509525, 5.149107], [50.498974, 5.120757], [50.493275, 5.096887],
  [50.487463, 5.099271], [50.491840, 5.084746], [50.492990, 5.064573],
  [50.492591, 5.031349], [50.483774, 5.019698], [50.469450, 5.003953],
  [50.469337, 4.987399], [50.480051, 4.960752], [50.466908, 4.924976],
  [50.464391, 4.906444], [50.465499, 4.893198], [50.460786, 4.887240],
  [50.462361, 4.871814], [50.464966, 4.855660], [50.470870, 4.851799],
  [50.478105, 4.845195], [50.483184, 4.836371], [50.486343, 4.829326],
  [50.490887, 4.817962], [50.498425, 4.797980], [50.512593, 4.774796],
  [50.529996, 4.746381], [50.550471, 4.712578], [50.559751, 4.694289],
  [50.568714, 4.693244], [50.579760, 4.678910], [50.593969, 4.673697],
  [50.607445, 4.660519], [50.611548, 4.647890], [50.619940, 4.629961],
  [50.630859, 4.620536], [50.635188, 4.613860], [50.637440, 4.602088],
  [50.641883, 4.592124], [50.643744, 4.575705], [50.651499, 4.569092],
  [50.661538, 4.566870], [50.669424, 4.566785], [50.681454, 4.560817],
  [50.684092, 4.547829], [50.684807, 4.532442], [50.698709, 4.522230],
  [50.711433, 4.520861], [50.720936, 4.515916], [50.730005, 4.508052],
  [50.731645, 4.494710], [50.735901, 4.474639], [50.749023, 4.464039],
  [50.761258, 4.452417], [50.769089, 4.442942], [50.785317, 4.425893],
  [50.794008, 4.417841], [50.803107, 4.408724], [50.810944, 4.401002],
  [50.815811, 4.389997], [50.824274, 4.381564], [50.833300, 4.374560],
  [50.842382, 4.368650], [50.845200, 4.370142],
];

// ── HALTES (coords approx) ────────────────────────────────────────────────

const HALTES_COORDS: { id: number; ville: string; type: string; lat: number; lng: number }[] = [
  { id: 1,  ville: "Verviers",        type: "depart",     lat: 50.592580, lng: 5.861104 },
  { id: 2,  ville: "Herve",           type: "halte",      lat: 50.613100, lng: 5.833085 },
  { id: 3,  ville: "Soumagne",        type: "halte",      lat: 50.621561, lng: 5.829529 },
  { id: 4,  ville: "Chênée",          type: "halte",      lat: 50.615214, lng: 5.621465 },
  { id: 5,  ville: "Liège",           type: "etape_cle",  lat: 50.640309, lng: 5.786100 },
  { id: 6,  ville: "Seraing",         type: "halte",      lat: 50.603,    lng: 5.507 },
  { id: 7,  ville: "Huy",             type: "nuit",       lat: 50.523751, lng: 5.231206 },
  { id: 8,  ville: "Andenne",         type: "halte",      lat: 50.498974, lng: 5.120757 },
  { id: 9,  ville: "Jambes",          type: "halte",      lat: 50.469450, lng: 5.003953 },
  { id: 10, ville: "Namur",           type: "etape_cle",  lat: 50.465499, lng: 4.893198 },
  { id: 11, ville: "Saint-Servais",   type: "halte",      lat: 50.483184, lng: 4.836371 },
  { id: 12, ville: "Gembloux",        type: "nuit",       lat: 50.559751, lng: 4.694289 },
  { id: 13, ville: "Mont-St-Guibert", type: "halte",      lat: 50.607445, lng: 4.660519 },
  { id: 14, ville: "Court-St-Étienne",type: "halte",      lat: 50.635188, lng: 4.613860 },
  { id: 15, ville: "Ottignies",       type: "halte",      lat: 50.681454, lng: 4.560817 },
  { id: 16, ville: "Rixensart",       type: "halte",      lat: 50.735901, lng: 4.474639 },
  { id: 17, ville: "Etterbeek",       type: "halte",      lat: 50.824274, lng: 4.381564 },
  { id: 18, ville: "Bruxelles",       type: "arrivee",    lat: 50.845200, lng: 4.370142 },
];

// ── HELPERS ────────────────────────────────────────────────────────────────

function distM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closestTraceIdx(lat: number, lng: number): number {
  let best = 0, bestD = Infinity;
  TRACE.forEach(([tlat, tlng], i) => { const d = (tlat-lat)**2 + (tlng-lng)**2; if (d < bestD) { bestD = d; best = i; } });
  return best;
}

function cumulKmToIdx(idx: number): number {
  let d = 0;
  for (let i = 1; i <= idx; i++) d += distM(TRACE[i-1][0], TRACE[i-1][1], TRACE[i][0], TRACE[i][1]);
  return d / 1000;
}

function computeRollingData(locs: { lat: number; lng: number; created_at: string }[]) {
  let rollingSec = 0;
  let rollingDist = 0;
  if (locs.length < 2) return { rollingSec: 0, rollingDist: 0 };
  for (let i = 1; i < locs.length; i++) {
    const d = distM(locs[i-1].lat, locs[i-1].lng, locs[i].lat, locs[i].lng);
    const dt = (new Date(locs[i].created_at).getTime() - new Date(locs[i-1].created_at).getTime()) / 1000;
    if (d > 10 && dt < 300) { rollingSec += dt; rollingDist += d; }
  }
  return { rollingSec, rollingDist };
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function LivePage() {
  const [locations, setLocations] = useState<{ lat: number; lng: number; created_at: string }[]>([]);
  const [haltes, setHaltes] = useState<{ id: number; ordre: number; ville: string; type: string; heure_arrivee: string | null }[]>([]);
  const [troncons, setTroncons] = useState<{ id: number; ordre: number; distance_km: number; halte_arrivee_id: number }[]>([]);
  const [carteJour, setCarteJour] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const load = async () => {
      const [{ data: locs }, { data: h }, { data: t }] = await Promise.all([
        supabase.from("locations").select("*").order("created_at", { ascending: true }),
        supabase.from("haltes").select("id, ordre, ville, type, heure_arrivee").order("ordre"),
        supabase.from("troncons").select("id, ordre, distance_km, halte_arrivee_id").order("ordre"),
      ]);
      setLocations(locs || []);
      setHaltes(h || []);
      setTroncons(t || []);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (locations.length < 2) return <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center"><p className="text-[#6B6459]">En attente des premières positions...</p></main>;

  const last = locations[locations.length - 1];
  const lastIdx = closestTraceIdx(last.lat, last.lng);
  const distParcourue = cumulKmToIdx(lastIdx);

  const { rollingSec, rollingDist } = computeRollingData(locations);
  const rollingMin = rollingSec / 60;
  const vitesseRoulage = rollingSec > 0 ? (rollingDist / 1000) / (rollingSec / 3600) : 0;

  // Tronçon actuel
  let tronconActuel: typeof troncons[0] | null = null;
  let cumulAvantTroncon = 0;
  for (const t of troncons) {
    const cumulApres = troncons.filter(x => x.ordre <= t.ordre).reduce((s, x) => s + x.distance_km, 0);
    if (cumulApres > distParcourue) { tronconActuel = t; cumulAvantTroncon = cumulApres - t.distance_km; break; }
  }
  const distSurTroncon = distParcourue - cumulAvantTroncon;
  const vitesseTroncon = rollingSec > 0 ? (distSurTroncon / (rollingSec / 3600)) : 0;
  const vitessePourEstimation = distSurTroncon > 1 ? (vitesseTroncon || 12) : (vitesseRoulage || 12);

  // Prochaine halte
  let prochaineHalte: typeof haltes[0] | null = null;
  let tempsRestant = 0;
  for (const h of haltes) {
    if (h.type === "depart" || h.type === "nuit") continue;
    let distToHalte = 0;
    for (const t of troncons) {
      if (t.halte_arrivee_id === h.id) { distToHalte = troncons.filter(x => x.ordre <= t.ordre).reduce((s, x) => s + x.distance_km, 0); break; }
    }
    if (distToHalte > distParcourue) { prochaineHalte = h; tempsRestant = (distToHalte - distParcourue) / vitessePourEstimation; break; }
  }

  // Jour actuel pour la carte
  const jourActuel = distParcourue < 65 ? 1 : distParcourue < 120 ? 2 : 3;
  const displayJour = carteJour || jourActuel;

  // Filtrer trace et haltes pour le jour affiché
  const kmDebut = displayJour === 1 ? 0 : displayJour === 2 ? 60 : 120;
  const kmFin = displayJour === 1 ? 70 : displayJour === 2 ? 130 : 200;
  const traceDuJour = TRACE.filter((_, i) => { const km = cumulKmToIdx(i); return km >= kmDebut && km < kmFin; });
  const haltesDuJour = HALTES_COORDS.filter(h => {
    const hIdx = closestTraceIdx(h.lat, h.lng);
    const km = cumulKmToIdx(hIdx);
    return km >= kmDebut - 5 && km < kmFin + 5;
  });

  // Projeter un point
  const project = (lat: number, lng: number) => {
    const lats = traceDuJour.map(t => t[0]), lngs = traceDuJour.map(t => t[1]);
    if (lats.length === 0) return { x: 400, y: 150 };
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 40;
    const x = pad + ((lng - minLng) / (maxLng - minLng || 1)) * (800 - 2 * pad);
    const y = 300 - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (300 - 2 * pad);
    return { x, y };
  };

  const getHalteStyle = (type: string) => {
    if (type === "depart") return { fill: "#C0440E", r: 6, stroke: "#FBF6ED" };
    if (type === "etape_cle") return { fill: "#C0440E", r: 5, stroke: "#FBF6ED" };
    if (type === "nuit") return { fill: "#E8B43A", r: 7, stroke: "#1C1917" };
    if (type === "arrivee") return { fill: "#1C1917", r: 7, stroke: "#FBF6ED" };
    return { fill: "#1C1917", r: 3, stroke: "none", opacity: 0.45 };
  };

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80"><p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p><p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p></Link>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map(j => (
            <button key={j} onClick={() => setCarteJour(j)} className={`text-xs px-2 py-1 border ${displayJour === j ? "bg-[#C0440E] text-white border-[#C0440E]" : "border-black/10 text-[#6B6459]"}`}>J{j}</button>
          ))}
        </div>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Suivi live</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Distance parcourue", value: `${distParcourue.toFixed(1)} km` },
            { label: "Temps de roulage", value: `${Math.floor(rollingMin)} min` },
            { label: "Vitesse roulage", value: `${vitesseRoulage.toFixed(1)} km/h` },
            { label: "Vitesse tronçon", value: `${vitesseTroncon.toFixed(1)} km/h` },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-4 text-center">
              <p className="font-serif text-3xl font-black text-[#C0440E]">{s.value}</p>
              <p className="text-[10px] text-[#6B6459] uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {distParcourue > 0.5 && prochaineHalte && (
          <div className="bg-[#C0440E]/5 border border-[#C0440E]/20 p-6 text-center mb-10">
            <p className="text-xs text-[#C0440E] uppercase tracking-widest mb-2">Prochaine halte</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">{prochaineHalte.ville}</p>
            {prochaineHalte.heure_arrivee && <p className="text-sm text-[#6B6459] mt-1">Arrivée prévue : {prochaineHalte.heure_arrivee}</p>}
            <p className="text-lg font-bold text-[#C0440E] mt-2">~{Math.round(tempsRestant * 60)} min restantes</p>
          </div>
        )}

        {/* Carte */}
        <div className="border border-black/10 bg-white p-2">
          <svg viewBox="0 0 800 300" className="w-full" style={{ height: "auto" }}>
            {/* Tracé */}
            {traceDuJour.length > 1 && (
              <polyline
                points={traceDuJour.map(t => { const { x, y } = project(t[0], t[1]); return `${x},${y}`; }).join(" ")}
                fill="none" stroke="#C0440E" strokeWidth="2" strokeDasharray="6 4" opacity="0.5"
              />
            )}
            {/* Haltes */}
            {haltesDuJour.map(h => {
              const { x, y } = project(h.lat, h.lng);
              const style = getHalteStyle(h.type);
              return (
                <g key={h.id}>
                  <circle cx={x} cy={y} r={style.r} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" opacity={style.opacity || 1} />
                  <text x={x} y={y - style.r - 3} textAnchor="middle" fontSize="7" fill="#1C1917" fontWeight="bold">{h.ville}</text>
                  {h.type === "nuit" && <text x={x} y={y + 3} textAnchor="middle" fontSize="6" fill="#1C1917">🌙</text>}
                  {h.type === "etape_cle" && <text x={x} y={y + 3} textAnchor="middle" fontSize="6" fill="#1C1917">🍽️</text>}
                </g>
              );
            })}
            {/* Position actuelle */}
            {last && (() => {
              const { x, y } = project(last.lat, last.lng);
              return <circle cx={x} cy={y} r="6" fill="#22c55e" stroke="white" strokeWidth="2" />;
            })()}
          </svg>
        </div>
      </section>
    </main>
  );
}