"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Location {
  lat: number;
  lng: number;
  created_at: string;
}

interface Halte {
  id: number; ordre: number; ville: string; type: string; jour: number;
  heure_arrivee: string | null; heure_depart: string | null;
}

interface Troncon {
  id: number; ordre: number; halte_depart_id: number; halte_arrivee_id: number;
  distance_km: number; denivele_pos: number; code: string;
}

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

function distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findClosestOnTrace(lat: number, lng: number): number {
  let bestIdx = 0, bestDist = Infinity;
  TRACE.forEach(([tlat, tlng], i) => {
    const d = (tlat - lat) ** 2 + (tlng - lng) ** 2;
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });
  return bestIdx;
}

function cumulativeKmFromTrace(index: number): number {
  let d = 0;
  for (let i = 1; i <= index; i++) d += distanceBetween(TRACE[i-1][0], TRACE[i-1][1], TRACE[i][0], TRACE[i][1]);
  return d / 1000;
}

export default function LivePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [haltes, setHaltes] = useState<Halte[]>([]);
  const [troncons, setTroncons] = useState<Troncon[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    supabase.from("locations").select("*").order("created_at", { ascending: true }).then(({ data }) => setLocations(data || []));
    supabase.from("haltes").select("*").order("ordre").then(({ data }) => setHaltes(data || []));
    supabase.from("troncons").select("*").order("ordre").then(({ data }) => setTroncons(data || []));
    const interval = setInterval(() => { setNow(Date.now()); supabase.from("locations").select("*").order("created_at", { ascending: true }).then(({ data }) => setLocations(data || [])); }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (locations.length < 2) return <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center"><p className="text-[#6B6459]">En attente des premières positions...</p></main>;

  // Distance totale
  const lastLoc = locations[locations.length - 1];
  const lastIdx = findClosestOnTrace(lastLoc.lat, lastLoc.lng);
  const distanceParcourue = cumulativeKmFromTrace(lastIdx);

  // Temps de roulage : séquences de points consécutifs > 100m en moins de 2 minutes
  let rollingSeconds = 0;
  for (let i = 1; i < locations.length; i++) {
    const d = distanceBetween(locations[i-1].lat, locations[i-1].lng, locations[i].lat, locations[i].lng);
    const dt = (new Date(locations[i].created_at).getTime() - new Date(locations[i-1].created_at).getTime()) / 1000;
    if (d > 100 && dt < 120) rollingSeconds += dt;
  }
  const rollingMinutes = rollingSeconds / 60;

  // Vitesse moyenne générale (km/h)
  const totalTimeH = (new Date(lastLoc.created_at).getTime() - new Date(locations[0].created_at).getTime()) / 3600000;
  const vitesseMoyenne = totalTimeH > 0 ? distanceParcourue / totalTimeH : 0;
  const vitesseRoulage = rollingMinutes > 0 ? (distanceParcourue / (rollingMinutes / 60)) : 0;

  // Prochaine halte
  let prochaineHalte: Halte | null = null;
  let tempsRestant = 0;
  let vitesseUtilisee = vitesseRoulage > 0 ? vitesseRoulage : 12;
  const premierKm = distanceParcourue < 1;
  if (premierKm && vitesseMoyenne > 0) vitesseUtilisee = vitesseMoyenne;

  for (const h of haltes) {
    if (h.type === "nuit" || h.type === "depart") continue;
    let distToHalte = 0;
    for (const t of troncons) {
      if (t.halte_arrivee_id === h.id) {
        distToHalte = troncons.filter(x => x.ordre <= t.ordre).reduce((s, x) => s + x.distance_km, 0);
        break;
      }
    }
    if (distToHalte > distanceParcourue) {
      prochaineHalte = h;
      tempsRestant = (distToHalte - distanceParcourue) / vitesseUtilisee;
      break;
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80"><p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p><p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p></Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06]">S&apos;inscrire</Link>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Suivi live</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Distance parcourue", value: `${distanceParcourue.toFixed(1)} km` },
            { label: "Temps de roulage", value: `${Math.floor(rollingMinutes)} min` },
            { label: "Vitesse roulage", value: `${vitesseRoulage.toFixed(1)} km/h` },
            { label: "Vitesse moyenne", value: `${vitesseMoyenne.toFixed(1)} km/h` },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-4 text-center">
              <p className="font-serif text-3xl font-black text-[#C0440E]">{s.value}</p>
              <p className="text-[10px] text-[#6B6459] uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        {prochaineHalte && distanceParcourue > 0.5 && (
          <div className="bg-[#C0440E]/5 border border-[#C0440E]/20 p-6 text-center">
            <p className="text-xs text-[#C0440E] uppercase tracking-widest mb-2">Prochaine halte</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">{prochaineHalte.ville}</p>
            {prochaineHalte.heure_arrivee && <p className="text-sm text-[#6B6459] mt-1">Arrivée prévue : {prochaineHalte.heure_arrivee}</p>}
            <p className="text-lg font-bold text-[#C0440E] mt-2">~{Math.round(tempsRestant * 60)} min restantes</p>
          </div>
        )}
        {distanceParcourue <= 0.5 && (
          <div className="bg-[#E8B43A]/10 border border-[#E8B43A]/30 p-6 text-center">
            <p className="text-sm text-[#6B6459]">En attente des premiers kilomètres pour calculer l'estimation...</p>
          </div>
        )}
      </section>
    </main>
  );
}