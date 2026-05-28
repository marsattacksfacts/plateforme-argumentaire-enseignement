"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const supabase = createClient();

interface Inscription {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  parcours_velo: string[] | null;
  besoin_hebergement: string | null;
  role_principal: string;
  accueil_ville: string | null;
  accueil_nb_personnes: number | null;
  accueil_type: string | null;
}

const VILLE_LABELS: Record<string, string> = {
  huy: "Huy (nuit du 1er au 2 juin)",
  gembloux: "Gembloux (nuit du 2 au 3 juin)",
};

function getParcoursResume(parcours: string[] | null, ville: string): string {
  if (!parcours || parcours.length === 0) return "—";
  if (parcours.includes("3_jours")) return "3 jours complets";

  const parts: string[] = [];
  
  // J1
  if (parcours.some(v => v.startsWith("jour1"))) {
    if (parcours.includes("jour1_matin") && parcours.includes("jour1_apresmidi")) {
      parts.push("Verviers → Huy");
    } else if (parcours.includes("jour1_matin")) {
      parts.push("Verviers → Liège");
    } else if (parcours.includes("jour1_apresmidi")) {
      parts.push("Liège → Huy");
    } else {
      const j1troncons = parcours.filter(v => v.startsWith("troncon_") && 
        ["verviers_herve", "herve_soumagne", "soumagne_chenee", "chenee_liege", "liege_seraing", "seraing_huy"].some(t => v.endsWith(t)));
      if (j1troncons.length > 0) parts.push("J1: " + j1troncons.length + " tr.");
    }
  }

  // J2
  if (parcours.some(v => v.startsWith("jour2"))) {
    if (parcours.includes("jour2_matin") && parcours.includes("jour2_apresmidi")) {
      parts.push("Huy → Gembloux");
    } else if (parcours.includes("jour2_matin")) {
      parts.push("Huy → Namur");
    } else if (parcours.includes("jour2_apresmidi")) {
      parts.push("Namur → Gembloux");
    } else {
      const j2troncons = parcours.filter(v => v.startsWith("troncon_") && 
        ["huy_andenne", "andenne_jambes", "jambes_namur", "namur_stservais", "stservais_gembloux"].some(t => v.endsWith(t)));
      if (j2troncons.length > 0) parts.push("J2: " + j2troncons.length + " tr.");
    }
  }

  // J3
  if (parcours.some(v => v.startsWith("jour3"))) {
    if (parcours.includes("jour3_matin") && parcours.includes("jour3_apresmidi")) {
      parts.push("Gembloux → Bruxelles");
    } else if (parcours.includes("jour3_matin")) {
      parts.push("Gembloux → Rixensart");
    } else if (parcours.includes("jour3_apresmidi")) {
      parts.push("Rixensart → Bruxelles");
    } else {
      const j3troncons = parcours.filter(v => v.startsWith("troncon_") && 
        ["gembloux_montstguibert", "montstguibert_courtstetienne", "courtstetienne_ottignies", "ottignies_rixensart", "rixensart_etterbeek", "etterbeek_siegefwb"].some(t => v.endsWith(t)));
      if (j3troncons.length > 0) parts.push("J3: " + j3troncons.length + " tr.");
    }
  }

  return parts.join(" | ") || "Tronçons";
}

function getHebergementLabel(b: string | null, ville: string): string {
  if (!b || b === "non") return "—";
  if (b === "nuit_12") return "Les 2 nuits";
  if (ville === "huy" && (b === "nuit_1" || b === "nuit_12")) return "✅ Demande";
  if (ville === "gembloux" && (b === "nuit_2" || b === "nuit_12")) return "✅ Demande";
  return "—";
}

export default function HebergementPage() {
  const router = useRouter();
  const [ville, setVille] = useState<string>("");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/hebergement/login"); return; }
      const email = session.user.email;
      if (email?.includes("huy")) setVille("huy");
      else if (email?.includes("gembloux")) setVille("gembloux");
      const { data } = await supabase.from("inscriptions").select("*").order("created_at", { ascending: false });
      setInscriptions(data || []);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push("/hebergement/login"); };

  if (loading) return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
      <p className="text-[#6B6459]">Chargement...</p>
    </main>
  );

  // Cyclistes arrivant : finissent leur journée ici
  const cyclistesArrivant = inscriptions.filter(i => {
    if (i.role_principal !== "cycliste" || !i.parcours_velo) return false;
    const p = Array.isArray(i.parcours_velo) ? i.parcours_velo : [];
    if (ville === "huy") return p.some(v => v.startsWith("jour1") || v === "3_jours");
    if (ville === "gembloux") return p.some(v => v.startsWith("jour2") || v === "3_jours");
    return false;
  });

  // Cyclistes partant : commencent leur journée ici
  const cyclistesPartant = inscriptions.filter(i => {
    if (i.role_principal !== "cycliste" || !i.parcours_velo) return false;
    const p = Array.isArray(i.parcours_velo) ? i.parcours_velo : [];
    if (ville === "huy") return p.some(v => v.startsWith("jour2") || v === "3_jours");
    if (ville === "gembloux") return p.some(v => v.startsWith("jour3") || v === "3_jours");
    return false;
  });

  // Cyclistes transitant : arrivent ET repartent
  const cyclistesTransitant = cyclistesArrivant.filter(c => cyclistesPartant.some(c2 => c2.id === c.id));

  // Besoin hébergement
  const besoinHebergement = cyclistesArrivant.filter(i => 
    i.besoin_hebergement === "nuit_12" ||
    (ville === "huy" && i.besoin_hebergement === "nuit_1") ||
    (ville === "gembloux" && i.besoin_hebergement === "nuit_2")
  );

  const hebergeursLocaux = inscriptions.filter(i => i.role_principal === "accueillant" && i.accueil_ville === ville);

  const renderTableau = (titre: string, data: Inscription[], emoji: string) => (
    <div className="mb-8">
      <h2 className="font-serif font-bold text-lg text-[#1C1917] mb-3">{emoji} {titre} ({data.length})</h2>
      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full text-xs">
          <thead><tr className="bg-[#1C1917] text-[#F5F0E8] text-left">
            <th className="p-2">Nom</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Parcours</th>
            <th className="p-2">Héberg.</th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-[#6B6459]">Aucun cycliste</td></tr>
            ) : (
              data.map(c => (
                <tr key={c.id} className="border-t border-black/5 hover:bg-[#F5F0E8]">
                  <td className="p-2 font-medium">{c.prenom} {c.nom}</td>
                  <td className="p-2">
                    <div>{c.email}</div>
                    <div className="text-[#6B6459]">{c.telephone}</div>
                  </td>
                  <td className="p-2">
                    <span className="inline-block bg-[#F5F0E8] px-2 py-0.5 text-[10px] font-medium">
                      {getParcoursResume(c.parcours_velo, ville)}
                    </span>
                  </td>
                  <td className="p-2">
                    {getHebergementLabel(c.besoin_hebergement, ville)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <button onClick={logout} className="text-xs text-[#6B6459] underline hover:text-[#C0440E]">Déconnexion</button>
      </nav>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-[#1C1917]">Hébergement · {VILLE_LABELS[ville] || ville}</h1>
          <p className="text-xs text-[#6B6459]">Vue hébergeur</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Arrivants", n: cyclistesArrivant.length },
            { label: "Partants", n: cyclistesPartant.length },
            { label: "Transitants", n: cyclistesTransitant.length },
            { label: "Besoin héberg.", n: besoinHebergement.length },
            { label: "Hébergeurs locaux", n: hebergeursLocaux.length },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-4 text-center">
              <p className="font-serif text-3xl font-black text-[#C0440E]">{s.n}</p>
              <p className="text-[10px] text-[#6B6459] uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Hébergeurs locaux */}
        <div className="mb-8">
          <h2 className="font-serif font-bold text-lg text-[#1C1917] mb-3">🏠 Hébergeurs locaux ({hebergeursLocaux.length})</h2>
          <div className="overflow-x-auto border border-black/10 bg-white">
            <table className="w-full text-xs">
              <thead><tr className="bg-[#1C1917] text-[#F5F0E8] text-left">
                <th className="p-2">Nom</th><th className="p-2">Contact</th>
                <th className="p-2">Capacité</th><th className="p-2">Type</th>
              </tr></thead>
              <tbody>
                {hebergeursLocaux.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-[#6B6459]">Aucun hébergeur local</td></tr>
                ) : (
                  hebergeursLocaux.map(h => (
                    <tr key={h.id} className="border-t border-black/5 hover:bg-[#F5F0E8]">
                      <td className="p-2 font-medium">{h.prenom} {h.nom}</td>
                      <td className="p-2">{h.email}<br/><span className="text-[#6B6459]">{h.telephone}</span></td>
                      <td className="p-2">{h.accueil_nb_personnes} pers.</td>
                      <td className="p-2">{h.accueil_type === "jardin" ? "Jardin" : h.accueil_type === "chambres" ? "Chambre(s)" : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tableaux */}
        {renderTableau("Cyclistes transitant (arrivent + repartent)", cyclistesTransitant, "🔄")}
        {renderTableau("Cyclistes arrivant", cyclistesArrivant, "🚴")}
        {renderTableau("Cyclistes partant", cyclistesPartant, "🚴‍♂️")}
      </div>
    </main>
  );
}