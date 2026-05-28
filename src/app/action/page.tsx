"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Halte {
  id: number;
  ordre: number;
  nom: string;
  ville: string;
  type: string;
  jour: number;
  demi_journee: string | null;
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

const JOURS = ["", "1er juin", "2 juin", "3 juin"];

export default function ActionPage() {
  const [haltes, setHaltes] = useState<Halte[]>([]);
  const [troncons, setTroncons] = useState<Troncon[]>([]);

  useEffect(() => {
    supabase.from("haltes").select("*").order("ordre").then(({ data }) => setHaltes(data || []));
    supabase.from("troncons").select("*").order("ordre").then(({ data }) => setTroncons(data || []));
  }, []);

  const totalKm = troncons.reduce((sum, t) => sum + t.distance_km, 0);
  const totalDplus = troncons.reduce((sum, t) => sum + t.denivele_pos, 0);

  // Déduire les groupes depuis les haltes et tronçons
  const groupes = haltes.reduce((acc, halte) => {
    if (!halte.demi_journee) return acc;
    const key = `${halte.jour}-${halte.demi_journee}`;
    if (!acc.find(g => g.key === key)) {
      const haltesDuGroupe = haltes.filter(h => h.jour === halte.jour && h.demi_journee === halte.demi_journee).sort((a, b) => a.ordre - b.ordre);
      
      // Pour le trajet : première ville de la demi-journée → dernière ville de la demi-journée
      const premiere = haltesDuGroupe[0];
      const derniere = haltesDuGroupe[haltesDuGroupe.length - 1];
      
      // Pour le km : somme des tronçons dont l'arrivée est dans cette demi-journée
      const kmDuGroupe = troncons
        .filter(t => {
          const arr = haltes.find(h => h.id === t.halte_arrivee_id);
          return arr?.jour === halte.jour && arr?.demi_journee === halte.demi_journee;
        })
        .reduce((s, t) => s + t.distance_km, 0);
      
      // Pour l'affichage du trajet : on veut la première ville de départ réelle
      // Si c'est l'après-midi, le départ réel est la dernière ville du matin (où les cyclistes ont dîné)
      let villeDepart = premiere.ville;
      if (halte.demi_journee === "apres_midi") {
        const derniereDuMatin = haltes.find(h => h.jour === halte.jour && h.demi_journee === "matin" && h.ordre === Math.max(...haltes.filter(h2 => h2.jour === halte.jour && h2.demi_journee === "matin").map(h2 => h2.ordre)));
        if (derniereDuMatin) villeDepart = derniereDuMatin.ville;
      }
      
      acc.push({
        key,
        jour: halte.jour,
        demi: halte.demi_journee,
        label: `${JOURS[halte.jour]} — ${halte.demi_journee === "matin" ? "Matin" : "Après-midi"}`,
        trajet: `${villeDepart} → ${derniere.ville}`,
        km: Math.round(kmDuGroupe * 10) / 10,
        premiere: { ...premiere, ville: villeDepart }, // On écrase la ville de départ pour l'affichage
        derniere,
      });
    }
    return acc;
  }, [] as { key: string; jour: number; demi: string; label: string; trajet: string; km: number; premiere: Halte; derniere: Halte }[]);

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">
          S'inscrire
        </Link>
      </nav>

      {/* CONTENU */}
      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">

        <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 mb-8">Le mouvement</span>
        <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-4">Les facteurs à bicyclette</h1>
        <p className="font-serif italic text-lg text-[#6B6459] mb-12">Un périple épiscolaire</p>

        {/* Notre histoire */}
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">Notre histoire</h2>
          <p>Nous étions en 1936 à l'aube de l'été. Pendant qu'en France, Léon Blum offrait les premiers congés payés aux ouvriers, les grandes grèves, dans le plat pays, permettaient elles aussi d'obtenir la réadaptation des salaires avec minimum de salaire de 32 francs par jour, la semaine des quarante heures, la reconnaissance syndicale et les congés payés.</p>
          <p>C'est unis que nous y parvenions, c'est une fois de plus unis que nous y parviendrons aujourd'hui.</p>
          <p>Depuis la grande ville francophone la plus à l'Est du territoire, nous porterons des courriers à bicyclette aux Engagés à la capitale. Lors du prochain vote du décret de Glatigny, ils peuvent soit être à la hauteur de l'histoire, soit incarner cette remorque d'arrière-garde qui, de 1936 à 2026, aura inlassablement été dépassée par les changements.</p>
          <p>Quoi qu'il en soit, 90 ans plus tard, à nous d'écrire l'histoire !</p>
        </div>

        <hr className="border-black/10 my-10" />

        {/* Notre action */}
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">Notre action</h2>
          <p>En trois jours, nous relierons Verviers, la grande ville francophone la plus à l'Est de la Wallonie au siège des Engagés à Bruxelles. Nous ferons {haltes.length} étapes dans toutes les grandes villes pour collecter des courriers d'élèves, de profs, de parents.</p>
          <p>Les cyclistes ne seront pas forcément les mêmes de Verviers à Bruxelles. Certains ne feront peut-être qu'une dizaine de kilomètres. L'essentiel n'est pas l'exploit sportif, il y aura forcément des passages de relai et c'est tant mieux !</p>
          <p>Les cyclistes porteront, s'ils le souhaitent, des accessoires rappelant l'identité visuelle « facteur·ice à vélo des années 1930 ».</p>
        </div>

        <hr className="border-black/10 my-10" />

        {/* Comment nous aider */}
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">Comment nous aider ?</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className="text-[#C0440E] mt-1">▸</span><span>En parlant de l'action autour de toi, en t'assurant que tout le monde est bien en train d'écrire sa petite lettre au gouvernement de la FWB</span></li>
            <li className="flex items-start gap-2"><span className="text-[#C0440E] mt-1">▸</span><span>En faisant un bout de route avec nous (choisis ton segment et surtout, regarde bien les heures, la caravane n'attend pas !)</span></li>
            <li className="flex items-start gap-2"><span className="text-[#C0440E] mt-1">▸</span><span>En rejoignant ou en organisant une halte dans ta ville !</span></li>
          </ul>
        </div>

        <hr className="border-black/10 my-10" />

        {/* En pratique */}
        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">En pratique</h2>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-[#C0440E] mb-2">Au préalable</h3>
            <p>Inscris-toi sur la plateforme via le formulaire en ligne avant <strong className="text-[#1C1917]">dimanche 31 mai à 10h</strong>.</p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-[#C0440E] mb-2">En halte</h3>
            <p className="mb-2">Chaque halte est auto-organisée selon des modalités laissées à l'appréciation des organisateur·ices locales : mini-concert, flashmob, danse, auberge espagnole…</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong>Visuel à mort</strong> (dessin géant à la craie, fanfare, chorégraphie, boite aux lettres géante…)</li>
              <li><strong>Bref</strong> (les haltes durent 15 minutes max, démarrer le rassemblement avant l'arrivée du peloton).</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-[#C0440E] mb-2">En déplacement</h3>
            <p>On se conforme aux règles du code de la route : deux capitaines de course sur vélo et une voiture balai.</p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-[#C0440E] mb-2">En fin de journée</h3>
            <p>Possibilité d'organiser un rassemblement festif et un hébergement à Huy et Gembloux. Au siège de la FWB, nos lettres sont remises au greffe.</p>
          </div>
        </div>

        <hr className="border-black/10 my-10" />

        {/* Itinéraire */}
        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">Itinéraire</h2>

          {groupes.map(groupe => {
            const haltesDuGroupe = haltes
              .filter(h => h.jour === groupe.jour && h.demi_journee === groupe.demi)
              .sort((a, b) => a.ordre - b.ordre);

            return (
              <div key={groupe.key} className="bg-[#C0440E]/5 border border-[#C0440E]/20 p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-[#C0440E] text-sm uppercase tracking-widest">{groupe.label}</h3>
                  <p className="text-sm font-medium mt-1">
                    {groupe.trajet} — <strong>{groupe.km} km</strong>
                  </p>
                </div>
                {haltesDuGroupe.some(h => h.heure_depart) && (
                  <p className="text-xs text-[#6B6459]">
                    {haltesDuGroupe.find(h => h.heure_depart)?.heure_depart && `Rassemblement ${haltesDuGroupe.find(h => h.heure_depart)?.heure_depart?.replace("h", "h")} ${groupe.premiere.ville}`}
                    {haltesDuGroupe[0].heure_depart && ` · Départ ${haltesDuGroupe[0].heure_depart}`}
                  </p>
                )}
                <ul className="text-sm space-y-1">
                  {haltesDuGroupe.map((h, i) => (
                    <li key={h.id}>
                      {i + 1}{i === 0 ? "ʳᵉ" : "ᵉ"} halte : {h.ville}
                      {h.heure_arrivee && `, ${h.heure_arrivee}`}
                      {h.heure_depart && h.type !== "depart" && ` - ${h.heure_depart}`}
                      {h.type === "etape_cle" && " (dîner)"}
                      {h.type === "nuit" && " (nuit)"}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <hr className="border-black/10 my-10" />

        {/* Distances et dénivelés */}
        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[#3D3530] mb-12">
          <h2 className="font-serif font-bold text-xl text-[#1C1917]">Distances et dénivelés</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="p-2 text-[10px] uppercase tracking-widest text-[#6B6459]">#</th>
                  <th className="p-2 text-[10px] uppercase tracking-widest text-[#6B6459]">Étape</th>
                  <th className="p-2 text-[10px] uppercase tracking-widest text-[#6B6459]">Km</th>
                  <th className="p-2 text-[10px] uppercase tracking-widest text-[#6B6459] text-right">D+</th>
                </tr>
              </thead>
              <tbody>
                {troncons.map((t) => {
                  const from = haltes.find(h => h.id === t.halte_depart_id);
                  const to = haltes.find(h => h.id === t.halte_arrivee_id);
                  return (
                    <tr key={t.id} className="border-b border-black/5 hover:bg-[#F5F0E8]">
                      <td className="p-2 text-[#C0440E] font-bold">{t.ordre}</td>
                      <td className="p-2">{from?.ville || "—"} → {to?.ville || "—"}</td>
                      <td className="p-2">{t.distance_km} km</td>
                      <td className="p-2 text-right text-[#C0440E]">+{t.denivele_pos} m</td>
                    </tr>
                  );
                })}
                <tr className="font-bold border-t-2 border-[#C0440E]">
                  <td className="p-2"></td>
                  <td className="p-2">Total</td>
                  <td className="p-2">{Math.round(totalKm)} km</td>
                  <td className="p-2 text-right text-[#C0440E]">+{totalDplus} m</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-8 border-t border-black/10">
          <Link href="/inscription" className="bg-[#C0440E] text-white font-medium px-7 py-3 hover:bg-[#8A2E06] transition-colors inline-block">
            Rejoindre l'aventure →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1917] border-t border-white/10 px-4 md:px-8 py-6 text-xs text-[#F5F0E8]/50">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-3">
          <p><strong className="text-[#F5F0E8]/80">Facteurs à bicyclette</strong> — Périple épiscolaire 2026<br />Initiative indépendante · Collectif de Coordination Liège-Régional</p>
          <p className="text-right">
            <Link href="/code-ethique" className="underline hover:text-[#F5F0E8]/80 transition-colors">Code éthique</Link> · <Link href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">Politique de confidentialité</Link><br />
            <Link href="/admin/login" className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/50 transition-colors">Admin</Link>
          </p>
        </div>
      </footer>

    </main>
  );
}