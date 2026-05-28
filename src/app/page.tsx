"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartePeriple from "@/components/CartePeriple";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Halte {
  id: number;
  ordre: number;
  nom: string;
  ville: string;
  type: string;
  jour: number;
  heure_arrivee: string | null;
  heure_depart: string | null;
}

interface Troncon {
  id: number;
  ordre: number;
  halte_depart_id: number;
  halte_arrivee_id: number;
  distance_km: number;
  denivele_pos: number;
  code: string;
}

const TYPE_LABELS: Record<string, string> = {
  depart: "Départ",
  halte: "Halte",
  etape_cle: "Étape clé",
  nuit: "Nuit",
  arrivee: "Arrivée",
};

const TYPE_KEYS = ["depart", "etape_cle", "nuit", "arrivee"];

export default function Home() {
  const [showTroncons, setShowTroncons] = useState(false);
  const [haltes, setHaltes] = useState<Halte[]>([]);
  const [troncons, setTroncons] = useState<Troncon[]>([]);
  const [nbInscrits, setNbInscrits] = useState(0);

  useEffect(() => {
    supabase.from("inscriptions").select("*", { count: "exact", head: true }).then(({ count }) => {
      setNbInscrits(count || 0);
    });
  }, []);

  useEffect(() => {
    supabase.from("haltes").select("*").order("ordre").then(({ data }) => setHaltes(data || []));
    supabase.from("troncons").select("*").order("ordre").then(({ data }) => setTroncons(data || []));
  }, []);

  // Calculer les totaux
  const totalKm = troncons.reduce((sum, t) => sum + t.distance_km, 0);
  const totalDplus = troncons.reduce((sum, t) => sum + t.denivele_pos, 0);

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <div>
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </div>
        <Link
          href="/inscription"
          className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors"
        >
          S'inscrire
        </Link>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-black leading-[1.05] mb-4">
          Facteurs<br />
          à <em className="italic text-[#C0440E]">bicyclette</em>
        </h1>
        <p className="font-serif italic text-lg md:text-xl text-[#6B6459] mb-8">
          Périple épiscolaire à travers la Wallonie
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1">
            1er → 3 juin 2026
          </span>
          <span className="text-[#6B6459] text-sm">·</span>
          <span className="font-serif text-2xl font-black text-[#C0440E]">{Math.round(totalKm)} <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#6B6459]">km</span></span>
          <span className="text-[#6B6459] text-sm">·</span>
          <span className="font-serif text-2xl font-black text-[#C0440E]">3 <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#6B6459]">jours</span></span>
          <span className="text-[#6B6459] text-sm">·</span>
          <span className="font-serif text-2xl font-black text-[#C0440E]">{haltes.length} <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#6B6459]">étapes</span></span>
          <span className="text-[#6B6459] text-sm">·</span>
          <span className="font-serif text-2xl font-black text-[#C0440E]">{nbInscrits} <span className="text-xs font-sans font-medium uppercase tracking-widest text-[#6B6459]">inscrits</span></span>
        </div>

        <div className="space-y-4 text-[0.9rem] md:text-[0.95rem] leading-relaxed text-[#3D3530] mb-10 max-w-2xl">
          <blockquote className="border-l-4 border-[#C0440E] pl-5 font-serif italic text-base md:text-lg text-[#1C1917] leading-snug">
            En 1936, les ouvriers grévistes ont obtenu les congés payés en maintenant la pression sur leurs élus.
          </blockquote>
          <p>
            En 2026, <strong className="font-medium text-[#1C1917]">d'étranges facteurs à bicyclette</strong> traverseront
            la Wallonie jusqu'au Parlement de la FWB, à Bruxelles, pour porter les lettres de centaines — voire de milliers —
            de citoyen·nes en lutte.
          </p>
          <p>
            De proche en proche, d'école en école, nous collecterons des lettres manuscrites pour les déposer en personne
            là où les décisions se prennent. Parce que certains messages méritent d'être portés à la force des jambes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/inscription" className="bg-[#C0440E] text-white font-medium px-7 py-3 hover:bg-[#8A2E06] transition-colors">
            Rejoindre l'aventure →
          </Link>
          <Link href="/action" className="border border-black/20 text-[#1C1917] font-medium px-7 py-3 hover:border-black/50 transition-colors">
            En savoir plus
          </Link>
          <Link
            href="/lettre"
            className="border border-[#C0440E] text-[#C0440E] font-medium px-7 py-3 hover:bg-[#C0440E]/5 transition-colors"
          >
            ✉️ Modèle de lettre
          </Link>
          <a href="#parcours" className="border border-black/20 text-[#1C1917] font-medium px-7 py-3 hover:border-black/50 transition-colors">
            Voir le parcours
          </a>
        </div>
      </section>

      {/* CARTE ANIMÉE */}
      <CartePeriple />

      {/* PARCOURS */}
      <section id="parcours" className="bg-[#1C1917] text-[#F5F0E8] px-4 md:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#C0440E] mb-3">Le parcours</p>
              <h2 className="font-serif text-3xl font-bold">
                {showTroncons ? `${troncons.length} tronçons, ${Math.round(totalKm)} km` : `${haltes.length} étapes, ${haltes.length} haltes possibles`}
              </h2>
            </div>
            <button
              onClick={() => setShowTroncons(!showTroncons)}
              className="text-xs text-[#F5F0E8]/60 hover:text-[#F5F0E8] border border-[#F5F0E8]/30 px-3 py-1.5 transition-colors"
            >
              {showTroncons ? "Voir les étapes" : "Voir les tronçons"}
            </button>
          </div>

          {!showTroncons ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/10">
              {haltes.map((h) => {
                const isNuit = h.type === "nuit";
                const isEtapeCle = h.type === "etape_cle";
                const isDepart = h.type === "depart";
                const isArrivee = h.type === "arrivee";
                const isKey = isNuit || isEtapeCle || isDepart || isArrivee;
                
                return (
                  <div
                    key={h.id}
                    className={`p-4 relative ${
                      isNuit ? "bg-[#E8B43A]/15" : 
                      isEtapeCle ? "bg-[#C0440E]/20" : 
                      isDepart ? "bg-[#C0440E]/20" : 
                      isArrivee ? "bg-[#C0440E]/20" : 
                      "bg-[#1C1917]"
                    }`}
                  >
                    <p className={`font-serif text-2xl font-black leading-none mb-1 ${
                      isKey ? "text-[#C0440E]" : "text-white/15"
                    }`}>
                      {String(h.ordre).padStart(2, "0")}
                    </p>
                    <p className="font-medium text-sm text-[#F5F0E8]">{h.ville}</p>
                    <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${
                      isNuit ? "text-[#E8B43A]" : 
                      isEtapeCle ? "text-[#C0440E]" : 
                      isDepart ? "text-[#C0440E] opacity-70" : 
                      isArrivee ? "text-[#C0440E] opacity-70" : 
                      "text-[#F5F0E8] opacity-40"
                    }`}>
                      {isNuit ? `🌙 Nuit J${h.jour}` : 
                      isEtapeCle ? `🍽️ Étape clé` : 
                      isDepart ? "Départ" : 
                      isArrivee ? "Arrivée" : 
                      TYPE_LABELS[h.type] || h.type}
                    </p>
                    {isNuit && (
                      <span className="absolute top-2 right-2 text-xs">🌙</span>
                    )}
                    {isEtapeCle && (
                      <span className="absolute top-2 right-2 text-xs">🍽️</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#F5F0E8]/60 text-[10px] uppercase tracking-widest">
                    <th className="p-3">#</th>
                    <th className="p-3">Départ</th>
                    <th className="p-3">Arrivée</th>
                    <th className="p-3 text-right">Distance</th>
                    <th className="p-3 text-right">D+</th>
                  </tr>
                </thead>
                <tbody>
                  {troncons.map((t) => {
                    const from = haltes.find(h => h.id === t.halte_depart_id);
                    const to = haltes.find(h => h.id === t.halte_arrivee_id);
                    return (
                      <tr key={t.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-3 text-[#C0440E] font-bold">{t.ordre}</td>
                        <td className="p-3">{from?.ville || "—"}</td>
                        <td className="p-3">{to?.ville || "—"}</td>
                        <td className="p-3 text-right font-medium">{t.distance_km} km</td>
                        <td className="p-3 text-right text-[#C0440E]">+{t.denivele_pos}m</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-[#C0440E] font-bold">
                    <td className="p-3"></td>
                    <td className="p-3" colSpan={2}>Total</td>
                    <td className="p-3 text-right">{Math.round(totalKm)} km</td>
                    <td className="p-3 text-right text-[#C0440E]">+{totalDplus}m</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1917] border-t border-white/10 px-4 md:px-8 py-6 text-xs text-[#F5F0E8]/50">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-3">
          <p><strong className="text-[#F5F0E8]/80">Facteurs à bicyclette</strong> — Périple épiscolaire 2026<br />Initiative indépendante · Collectif de Coordination Liège-Régional</p>
          <p className="text-right">
            <Link href="/code-ethique" className="underline hover:text-[#F5F0E8]/80 transition-colors">Code éthique</Link> · <Link href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">Politique de confidentialité</Link><br />
            <Link href="/admin/login" className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/50 transition-colors">Admin</Link> · <Link href="/hebergement/login" className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/50 transition-colors">Hébergement</Link>
          </p>
        </div>
      </footer>

    </main>
  );
}