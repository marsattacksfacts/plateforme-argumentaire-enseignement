"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ── Helpers ────────────────────────────────────────────────────────────────

function parseParcours(parcours: unknown): string[] {
  if (Array.isArray(parcours)) return parcours;
  if (typeof parcours === "string") {
    try {
      const parsed = JSON.parse(parcours);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function countTroncons(parcours: unknown): number {
  const p = parseParcours(parcours);
  if (!p || p.length === 0) return 0;
  return p.filter((v: string) => v.startsWith("troncon_")).length;
}

function getParcoursLabel(parcours: unknown): string {
  const p = parseParcours(parcours);
  if (!p || p.length === 0) return "—";
  if (p.includes("3_jours")) return "3 jours complets";
  const jours: string[] = [];
  if (p.some(v => v.startsWith("jour1"))) jours.push("J1");
  if (p.some(v => v.startsWith("jour2"))) jours.push("J2");
  if (p.some(v => v.startsWith("jour3"))) jours.push("J3");
  if (jours.length > 0) return jours.join(" + ") + ` (${countTroncons(p)} tronçons)`;
  return `${countTroncons(p)} tronçon(s)`;
}

function buildGroupesVelo(haltes: Halte[], troncons: Troncon[]) {
  const jours = [1, 2, 3];
  const mois = 6;

  return jours.map(jour => {
    // Tronçons dont l'arrivée est ce jour
    const tronconsDuJour = troncons.filter(t => {
      const arr = haltes.find(h => h.id === t.halte_arrivee_id);
      return arr?.jour === jour;
    });

    const haltesDuJour = haltes.filter(h => h.jour === jour).sort((a, b) => a.ordre - b.ordre);
    const premiere = haltesDuJour[0];
    const derniere = haltesDuJour[haltesDuJour.length - 1];
    const date = `${jour.toString().padStart(2, "0")}/${mois.toString().padStart(2, "0")}`;
    const trajet = `${premiere?.ville || "?"} → ${derniere?.ville || "?"}`;

    // Tronçons du matin : départ ET arrivée en "matin"
    const matinCodes = tronconsDuJour
      .filter(t => {
        const dep = haltes.find(h => h.id === t.halte_depart_id);
        const arr = haltes.find(h => h.id === t.halte_arrivee_id);
        return dep?.demi_journee === "matin" && arr?.demi_journee === "matin";
      })
      .map(t => t.code);

    // Tronçons de l'après-midi : arrivée en "apres_midi" (pour inclure Liège→Seraing)
    const apresmidiCodes = tronconsDuJour
      .filter(t => {
        const arr = haltes.find(h => h.id === t.halte_arrivee_id);
        return arr?.demi_journee === "apres_midi";
      })
      .map(t => t.code);

    const allTronconCodes = tronconsDuJour.map(t => t.code);

    const options: { value: string; label: string; children: string[] }[] = [];

    // Jour entier (enfants = matin + apresmidi + tous les tronçons)
    options.push({
      value: `jour${jour}_entier`,
      label: `Jour ${jour} entier (${trajet})`,
      children: [`jour${jour}_matin`, `jour${jour}_apresmidi`, ...allTronconCodes],
    });

    // Demi-journée Matin (enfants = tronçons du matin)
    const haltesMatin = haltesDuJour.filter(h => h.demi_journee === "matin");
    if (haltesMatin.length > 0 && matinCodes.length > 0) {
      options.push({
        value: `jour${jour}_matin`,
        label: `Matin (${haltesMatin[0].ville} → ${haltesMatin[haltesMatin.length - 1].ville})`,
        children: matinCodes,
      });
    }

    // Demi-journée Après-midi (enfants = tronçons de l'après-midi)
    const haltesAprem = haltesDuJour.filter(h => h.demi_journee === "apres_midi");
    if (haltesAprem.length > 0 && apresmidiCodes.length > 0) {
      options.push({
        value: `jour${jour}_apresmidi`,
        label: `Après-midi (${haltesAprem[0].ville} → ${haltesAprem[haltesAprem.length - 1].ville})`,
        children: apresmidiCodes,
      });
    }

    // Tronçons individuels (feuilles)
    tronconsDuJour.forEach(t => {
      const from = haltes.find(h => h.id === t.halte_depart_id);
      const to = haltes.find(h => h.id === t.halte_arrivee_id);
      options.push({
        value: t.code,
        label: `${from?.ville || "?"} → ${to?.ville || "?"}`,
        children: [],
      });
    });

    return { date, trajet, options };
  });
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Inscription {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville_ecole: string;
  nom_ecole: string;
  ville_origine: string;
  est_majeur: boolean;
  role_principal: string;
  parcours_velo: string[] | null;
  halte_ville: string;
  halte_collecte_lettres: boolean | null;
  accueil_ville: string;
  accueil_nb_personnes: number | null;
  accueil_type: string;
  remarques: string;
  halte_animation?: string;
  besoin_hebergement: string | null;
}

interface Halte {
  id: number;
  ordre: number;
  nom: string;
  ville: string;
  type: string;
  jour: number;
  heure_arrivee: string | null;
  heure_depart: string | null;
  demi_journee: string;
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

// ── Constantes ─────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  cycliste: "🚴 Cycliste",
  organisateur_halte: "🏫 Halte",
  accueillant: "🏠 Hébergement",
  coordinateur: "🗺️ Coordinateur",
};

const TYPE_LABELS: Record<string, string> = {
  depart: "Départ",
  halte: "Halte",
  etape_cle: "Étape clé",
  nuit: "Nuit",
  arrivee: "Arrivée",
};

// ── Composant ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [haltes, setHaltes] = useState<Halte[]>([]);
  const [troncons, setTroncons] = useState<Troncon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"general" | "cyclistes" | "haltes">("general");
  const [sortField, setSortField] = useState<"created_at" | "nom">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedTroncon, setExpandedTroncon] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedHaltes, setEditedHaltes] = useState<Halte[]>([]);
  const [editedTroncons, setEditedTroncons] = useState<Troncon[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [editForm, setEditForm] = useState<Partial<Inscription>>({});

  // Synchroniser les données quand elles arrivent
  useEffect(() => {
    const toTimeValue = (t: unknown): string => {
      if (!t) return "";
      const s = String(t).trim();
      // "08:00:00" → "08:00"
      if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
      // "8:00" → "08:00"
      if (/^\d{1,2}:\d{2}$/.test(s)) return s.padStart(5, "0");
      // "8h00" → "08:00"
      const h = s.match(/(\d{1,2})[hH:](\d{2})/);
      if (h) return `${h[1].padStart(2, "0")}:${h[2]}`;
      return s.slice(0, 5) || "";
    };

    setEditedHaltes(
      haltes.map(h => ({
        ...h,
        heure_arrivee: toTimeValue(h.heure_arrivee),
        heure_depart: toTimeValue(h.heure_depart),
      }))
    );
    setEditedTroncons(JSON.parse(JSON.stringify(troncons)));
  }, [haltes, troncons]);

  // Auth + fetch
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/admin/login"); return; }
      const [{ data: i }, { data: h }, { data: t }] = await Promise.all([
        supabase.from("inscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("haltes").select("*").order("ordre"),
        supabase.from("troncons").select("*").order("ordre"),
      ]);
      setInscriptions(i || []);
      setHaltes(h || []);
      setTroncons(t || []);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push("/admin/login"); };

  const toggleSort = (field: "created_at" | "nom") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // Filtres + tri
  const filtered = inscriptions
    .filter(i => {
      if (filterRole && i.role_principal !== filterRole) return false;
      if (search) {
        const s = search.toLowerCase();
        return i.prenom.toLowerCase().includes(s) || i.nom.toLowerCase().includes(s) || i.email.toLowerCase().includes(s) || i.ville_ecole?.toLowerCase().includes(s) || i.nom_ecole?.toLowerCase().includes(s) || i.halte_ville?.toLowerCase().includes(s) || i.accueil_ville?.toLowerCase().includes(s) || i.remarques?.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "nom") return dir * a.nom.localeCompare(b.nom);
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

  // Stats
  const stats = {
    total: inscriptions.length,
    cyclistes: inscriptions.filter(i => i.role_principal === "cycliste").length,
    haltes: inscriptions.filter(i => i.role_principal === "organisateur_halte").length,
    hebergements: inscriptions.filter(i => i.role_principal === "accueillant").length,
    coordinateurs: inscriptions.filter(i => i.role_principal === "coordinateur").length,
    mineurs: inscriptions.filter(i => !i.est_majeur).length,
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Date", "Prénom", "Nom", "Email", "Téléphone", "Rôle", "École", "Ville école", "Parcours", "Halte ville", "Accueil ville", "Remarques"];
    const rows = filtered.map(i => [
      new Date(i.created_at).toLocaleDateString("fr-BE"), i.prenom, i.nom, i.email, i.telephone,
      ROLE_LABELS[i.role_principal] || i.role_principal, i.nom_ecole, i.ville_ecole,
      i.role_principal === "cycliste" ? getParcoursLabel(i.parcours_velo) : "",
      i.halte_ville || "", i.accueil_ville || "", i.remarques || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `inscriptions-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const mailtoAll = () => {
    const emails = filtered.map(i => i.email).filter(Boolean).join(",");
    if (emails) window.open(`mailto:?bcc=${emails}`);
  };

  // Cyclistes par tronçon
  const cyclistes = inscriptions.filter(i => i.role_principal === "cycliste" && i.parcours_velo);
  const tronconCounts: Record<string, Inscription[]> = {};
  cyclistes.forEach(c => {
    const parcours = parseParcours(c.parcours_velo);
    parcours.filter(p => p.startsWith("troncon_")).forEach(t => {
      if (!tronconCounts[t]) tronconCounts[t] = [];
      tronconCounts[t].push(c);
    });
  });

  // Regrouper les tronçons par jour
  const joursTroncons = [1, 2, 3].map(j => ({
    jour: j,
    label: `Jour ${j}`,
    troncons: troncons.filter(t => {
      const dep = haltes.find(h => h.id === t.halte_depart_id);
      return dep?.jour === j;
    }),
  }));

  // Totaux
  const totalKm = troncons.reduce((s, t) => s + t.distance_km, 0);
  const totalDplus = troncons.reduce((s, t) => s + t.denivele_pos, 0);

  const groupesVelo = buildGroupesVelo(haltes, troncons);

  const updateHalte = (id: number, field: string, value: string) => {
    setEditedHaltes(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const updateTroncon = (id: number, field: string, value: number) => {
    setEditedTroncons(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveAll = async () => {
    setSaving(true);
    for (const h of editedHaltes) {
      const original = haltes.find(o => o.id === h.id);
      if (JSON.stringify(h) !== JSON.stringify(original)) {
        await supabase.from("haltes").update({
          ville: h.ville,
          type: h.type,
          jour: h.jour,
          heure_arrivee: h.heure_arrivee || null,
          heure_depart: h.heure_depart || null,
        }).eq("id", h.id);
      }
    }
    // Sauver les tronçons modifiés
    for (const t of editedTroncons) {
      const original = troncons.find(o => o.id === t.id);
      if (JSON.stringify(t) !== JSON.stringify(original)) {
        await supabase.from("troncons").update({
          distance_km: t.distance_km,
          denivele_pos: t.denivele_pos,
        }).eq("id", t.id);
      }
    }
    // Recharger
    const [{ data: hData }, { data: tData }] = await Promise.all([
      supabase.from("haltes").select("*").order("ordre"),
      supabase.from("troncons").select("*").order("ordre"),
    ]);
    setHaltes(hData || []);
    setTroncons(tData || []);
    setSaving(false);
    setEditMode(false);
  };

  const openEditInscription = (inscription: Inscription) => {
    setEditingInscription(inscription);
    setEditForm({
      prenom: inscription.prenom,
      nom: inscription.nom,
      email: inscription.email,
      telephone: inscription.telephone,
      ville_ecole: inscription.ville_ecole,
      nom_ecole: inscription.nom_ecole,
      ville_origine: inscription.ville_origine,
      est_majeur: inscription.est_majeur,
      role_principal: inscription.role_principal,
      parcours_velo: parseParcours(inscription.parcours_velo),
      halte_ville: inscription.halte_ville,
      halte_collecte_lettres: inscription.halte_collecte_lettres,
      halte_animation: inscription.halte_animation || "",
      accueil_ville: inscription.accueil_ville,
      accueil_nb_personnes: inscription.accueil_nb_personnes,
      accueil_type: inscription.accueil_type,
      remarques: inscription.remarques,
    });
  };  

  const saveInscription = async () => {
    if (!editingInscription) return;
    await supabase.from("inscriptions").update(editForm).eq("id", editingInscription.id);
    // Recharger
    const { data } = await supabase.from("inscriptions").select("*").order("created_at", { ascending: false });
    setInscriptions(data || []);
    setEditingInscription(null);
  };

  if (loading) return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
      <p className="text-[#6B6459]">Chargement...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F5F0E8] px-4 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1917]">Admin · Facteurs à bicyclette</h1>
            <p className="text-xs text-[#6B6459]">{stats.total} inscriptions</p>
          </div>
          <button onClick={logout} className="text-xs text-[#6B6459] underline hover:text-[#C0440E]">Déconnexion</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {[
            { label: "Total", n: stats.total }, { label: "Cyclistes", n: stats.cyclistes },
            { label: "Haltes", n: stats.haltes }, { label: "Héberg.", n: stats.hebergements },
            { label: "Coords", n: stats.coordinateurs }, { label: "Mineurs", n: stats.mineurs },
          ].map(s => (
            <div key={s.label} className="bg-white border border-black/10 p-3 text-center">
              <p className="font-serif text-2xl font-black text-[#C0440E]">{s.n}</p>
              <p className="text-[10px] text-[#6B6459] uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "general", label: "📋 Toutes les inscriptions" },
            { key: "cyclistes", label: "🚴 Cyclistes par tronçon" },
            { key: "haltes", label: "🗺️ Tronçons & Haltes" },
          ].map(o => (
            <button key={o.key} onClick={() => setTab(o.key as typeof tab)}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${tab === o.key ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white border-black/10 text-[#6B6459] hover:border-black/25"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* ═══ ONGLET GÉNÉRAL ═══ */}
        {tab === "general" && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-black/15 bg-white px-3 py-2 text-sm">
                <option value="">Tous les rôles</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="border border-black/15 bg-white px-3 py-2 text-sm flex-1 min-w-[200px]" />
              <button onClick={mailtoAll} className="border border-[#C0440E] text-[#C0440E] px-4 py-2 text-sm font-medium hover:bg-[#C0440E]/5 transition-colors">
                📧 Mailto all ({filtered.length})
              </button>
              <button onClick={exportCSV} className="border border-black/20 text-[#1C1917] px-4 py-2 text-sm font-medium hover:border-black/40 transition-colors">
                📥 Export CSV
              </button>
            </div>
            <div className="overflow-x-auto border border-black/10 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1C1917] text-[#F5F0E8] text-left">
                    <th className="p-2 w-10"></th>
                    <th className="p-2 cursor-pointer hover:text-[#C0440E] select-none" onClick={() => toggleSort("created_at")}>
                      Date {sortField === "created_at" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="p-2 cursor-pointer hover:text-[#C0440E] select-none" onClick={() => toggleSort("nom")}>
                      Nom {sortField === "nom" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Rôle</th>
                    <th className="p-2">École/Ville</th>
                    <th className="p-2">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i.id} className="border-t border-black/5 hover:bg-[#F5F0E8]">
                      <td className="p-2 text-center">
                        <button onClick={() => openEditInscription(i)} className="text-[#6B6459] hover:text-[#C0440E] text-sm" title="Éditer">✏️</button>
                      </td>
                      <td className="p-2 text-[#6B6459] whitespace-nowrap">{new Date(i.created_at).toLocaleDateString("fr-BE")}</td>
                      <td className="p-2 font-medium">
                        {i.prenom} {i.nom}
                        {!i.est_majeur && <span className="text-[#C0440E] ml-1" title="Mineur">🔞</span>}
                      </td>
                      <td className="p-2">
                        <div className="max-w-[180px] truncate">{i.email}</div>
                        <div className="text-[#6B6459]">{i.telephone}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">{ROLE_LABELS[i.role_principal] || i.role_principal}</td>
                      <td className="p-2">
                        {i.nom_ecole && <div className="max-w-[180px] truncate">{i.nom_ecole}</div>}
                        {i.ville_ecole && <div className="text-[#6B6459]">{i.ville_ecole}</div>}
                      </td>
                      <td className="p-2 text-[#6B6459]">
                        {i.role_principal === "cycliste" && <span>{getParcoursLabel(i.parcours_velo)}</span>}
                        {i.role_principal === "organisateur_halte" && <span>Halte : {i.halte_ville || "—"}{i.halte_collecte_lettres ? " · 📨 Collecte" : ""}</span>}
                        {i.role_principal === "accueillant" && <span>{i.accueil_ville} · {i.accueil_nb_personnes} pers. · {i.accueil_type === "jardin" ? "Jardin" : "Chambre(s)"}</span>}
                        {i.role_principal === "coordinateur" && <span>Coordinateur·rice</span>}
                        {i.remarques && <div className="italic mt-1 text-[#3D3530] max-w-[250px] truncate" title={i.remarques}>"{i.remarques.slice(0, 100)}{i.remarques.length > 100 ? "…" : ""}"</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="p-4 text-center text-[#6B6459]">Aucune inscription trouvée.</p>}
            </div>
            <p className="text-xs text-[#6B6459] mt-3">{filtered.length} résultat(s)</p>
          </>
        )}

        {/* ═══ ONGLET CYCLISTES ═══ */}
        {tab === "cyclistes" && (
          <div className="space-y-6">
            {joursTroncons.map(groupe => (
              <div key={groupe.jour}>
                <h3 className="font-serif font-bold text-lg text-[#1C1917] mb-3 border-b border-black/10 pb-2">{groupe.label}</h3>
                <div className="space-y-2">
                  {groupe.troncons.map(troncon => {
                    const cyclistesDuTroncon = tronconCounts[troncon.code] || [];
                    const isExpanded = expandedTroncon === troncon.code;
                    const from = haltes.find(h => h.id === troncon.halte_depart_id);
                    const to = haltes.find(h => h.id === troncon.halte_arrivee_id);
                    return (
                      <div key={troncon.code} className="border border-black/10 bg-white">
                        <button onClick={() => setExpandedTroncon(isExpanded ? null : troncon.code)}
                          className="w-full px-4 py-3 text-left cursor-pointer hover:bg-[#F5F0E8] font-medium text-sm flex items-center justify-between">
                          <span>{from?.ville || "—"} → {to?.ville || "—"} <span className="text-[#6B6459] ml-2">{troncon.distance_km} km · +{troncon.denivele_pos}m</span></span>
                          <span className={`font-bold ${cyclistesDuTroncon.length > 0 ? "text-[#C0440E]" : "text-[#6B6459]"}`}>{cyclistesDuTroncon.length} cycliste(s)</span>
                        </button>
                        {isExpanded && cyclistesDuTroncon.length > 0 && (
                          <div className="border-t border-black/10 overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead><tr className="bg-[#F5F0E8] text-left">
                                <th className="p-2">Nom</th><th className="p-2">Email</th><th className="p-2">Téléphone</th>
                                <th className="p-2">École</th><th className="p-2">Ville</th><th className="p-2">Parcours</th><th className="p-2">Remarques</th>
                              </tr></thead>
                              <tbody>
                                {cyclistesDuTroncon.map(c => (
                                  <tr key={c.id} className="border-t border-black/5 hover:bg-[#FBF6ED]">
                                    <td className="p-2 font-medium">{c.prenom} {c.nom}{!c.est_majeur && " 🔞"}</td>
                                    <td className="p-2">{c.email}</td><td className="p-2">{c.telephone}</td>
                                    <td className="p-2">{c.nom_ecole || "—"}</td><td className="p-2">{c.ville_origine || c.ville_ecole || "—"}</td>
                                    <td className="p-2 text-[#6B6459]">{getParcoursLabel(c.parcours_velo)}</td>
                                    <td className="p-2 text-[#6B6459] max-w-[200px] truncate">{c.remarques || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="mt-8 p-4 border border-[#C0440E]/30 bg-[#C0440E]/5">
              <h3 className="font-bold text-sm text-[#C0440E] mb-2">Récapitulatif</h3>
              <ul className="text-xs text-[#3D3530] space-y-1">
                <li>🚴 Cyclistes uniques : <strong>{cyclistes.length}</strong></li>
                <li>🏁 3 jours complets : <strong>{cyclistes.filter(c => parseParcours(c.parcours_velo).includes("3_jours")).length}</strong></li>
                {[1,2,3].map(j => (
                  <li key={j}>📅 Jour {j} uniquement : <strong>{cyclistes.filter(c => { const p = parseParcours(c.parcours_velo); return p.some(v => v.startsWith(`jour${j}`)) && ![1,2,3].filter(x => x !== j).some(x => p.some(v => v.startsWith(`jour${x}`))) && !p.includes("3_jours"); }).length}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ═══ ONGLET HALTES & TRONÇONS ═══ */}
        {tab === "haltes" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#6B6459]">
                {editMode ? "⚠️ Mode édition activé" : "Données en lecture seule"}
              </p>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <button onClick={() => { setEditedHaltes(JSON.parse(JSON.stringify(haltes))); setEditedTroncons(JSON.parse(JSON.stringify(troncons))); setEditMode(false); }}
                      className="text-xs text-[#6B6459] border border-black/15 px-3 py-1 hover:bg-black/5 transition-colors">
                      Annuler
                    </button>
                    <button onClick={saveAll} disabled={saving}
                      className="text-xs bg-[#C0440E] text-white px-3 py-1 hover:bg-[#8A2E06] transition-colors disabled:opacity-50">
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)}
                    className="text-xs bg-[#1C1917] text-white px-3 py-1 hover:bg-black/80 transition-colors">
                    ✏️ Mode édition
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Haltes */}
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917] mb-3">{haltes.length} Haltes</h3>
                <div className="overflow-x-auto border border-black/10 bg-white">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-[#1C1917] text-[#F5F0E8] text-left">
                      <th className="p-2">#</th>
                      <th className="p-2">Ville</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Jour</th>
                      <th className="p-2">Arrivée</th>
                      <th className="p-2">Départ</th>
                    </tr></thead>
                    <tbody>
                      {(editMode ? editedHaltes : haltes).map(h => (
                        <tr key={h.id} className="border-t border-black/5 hover:bg-[#F5F0E8]">
                          <td className="p-2 font-bold text-[#C0440E]">{h.ordre}</td>
                          <td className="p-2">
                            {editMode ? (
                              <input type="text" value={h.ville} onChange={e => updateHalte(h.id, "ville", e.target.value)} className="w-full border border-black/15 px-2 py-1 text-xs bg-white" />
                            ) : (
                              <span className="font-medium">{h.ville}</span>
                            )}
                          </td>
                          <td className="p-2">
                            {editMode ? (
                              <select value={h.type} onChange={e => updateHalte(h.id, "type", e.target.value)} className="w-full border border-black/15 px-2 py-1 text-xs bg-white">
                                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                            ) : (
                              <span className="text-[10px]">{h.type === "nuit" ? `Nuit J${h.jour}` : TYPE_LABELS[h.type] || h.type}</span>
                            )}
                          </td>
                          <td className="p-2">
                            {editMode ? (
                              <select value={h.jour} onChange={e => updateHalte(h.id, "jour", e.target.value)} className="w-full border border-black/15 px-2 py-1 text-xs bg-white">
                                {[1, 2, 3].map(j => <option key={j} value={j}>J{j}</option>)}
                              </select>
                            ) : (
                              <span>J{h.jour}</span>
                            )}
                          </td>
                          <td className="p-2">
                            {editMode ? (
                              <input type="time" value={h.heure_arrivee || ""} onChange={e => updateHalte(h.id, "heure_arrivee", e.target.value)} className="w-full border border-black/15 px-2 py-1 text-xs bg-white" />
                            ) : (
                              <span>{h.heure_arrivee || "—"}</span>
                            )}
                          </td>
                          <td className="p-2">
                            {editMode ? (
                              <input type="time" value={h.heure_depart || ""} onChange={e => updateHalte(h.id, "heure_depart", e.target.value)} className="w-full border border-black/15 px-2 py-1 text-xs bg-white" />
                            ) : (
                              <span>{h.heure_depart || "—"}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tronçons */}
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917] mb-3">{troncons.length} Tronçons</h3>
                <div className="overflow-x-auto border border-black/10 bg-white">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-[#1C1917] text-[#F5F0E8] text-left">
                      <th className="p-2">#</th><th className="p-2">Départ</th><th className="p-2">Arrivée</th>
                      <th className="p-2 text-right">Km</th><th className="p-2 text-right">D+</th>
                    </tr></thead>
                    <tbody>
                      {(editMode ? editedTroncons : troncons).map(t => {
                        const from = haltes.find(h => h.id === t.halte_depart_id);
                        const to = haltes.find(h => h.id === t.halte_arrivee_id);
                        return (
                          <tr key={t.id} className="border-t border-black/5 hover:bg-[#F5F0E8]">
                            <td className="p-2 font-bold text-[#C0440E]">{t.ordre}</td>
                            <td className="p-2">{from?.ville || "—"}</td>
                            <td className="p-2">{to?.ville || "—"}</td>
                            <td className="p-2 text-right">
                              {editMode ? (
                                <input type="number" step="0.1" value={t.distance_km} onChange={e => updateTroncon(t.id, "distance_km", parseFloat(e.target.value) || 0)} className="w-16 border border-black/15 px-2 py-1 text-xs bg-white text-right" />
                              ) : (
                                <span>{t.distance_km} km</span>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              {editMode ? (
                                <input type="number" value={t.denivele_pos} onChange={e => updateTroncon(t.id, "denivele_pos", parseInt(e.target.value) || 0)} className="w-16 border border-black/15 px-2 py-1 text-xs bg-white text-right" />
                              ) : (
                                <span className="text-[#C0440E]">+{t.denivele_pos}m</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-[#C0440E] font-bold">
                        <td className="p-2"></td><td className="p-2" colSpan={2}>Total</td>
                        <td className="p-2 text-right">{Math.round((editMode ? editedTroncons : troncons).reduce((s, t) => s + t.distance_km, 0))} km</td>
                        <td className="p-2 text-right text-[#C0440E]">+{(editMode ? editedTroncons : troncons).reduce((s, t) => s + t.denivele_pos, 0)}m</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ MODALE ÉDITION INSCRIPTION ═══ */}
      {editingInscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingInscription(null)}>
          <div className="bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto mx-4 p-6 border border-black/10 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">Éditer {editingInscription.prenom} {editingInscription.nom}</h2>
              <button onClick={() => setEditingInscription(null)} className="text-[#6B6459] hover:text-[#1C1917] text-lg">✕</button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Identité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Prénom</label>
                  <input type="text" value={editForm.prenom || ""} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Nom</label>
                  <input type="text" value={editForm.nom || ""} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Email</label>
                  <input type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Téléphone</label>
                  <input type="text" value={editForm.telephone || ""} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">École</label>
                  <input type="text" value={editForm.nom_ecole || ""} onChange={e => setEditForm(f => ({ ...f, nom_ecole: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Ville école</label>
                  <input type="text" value={editForm.ville_ecole || ""} onChange={e => setEditForm(f => ({ ...f, ville_ecole: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Ville d'origine</label>
                <input type="text" value={editForm.ville_origine || ""} onChange={e => setEditForm(f => ({ ...f, ville_origine: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Majeur·e</label>
                <select value={editForm.est_majeur ? "true" : "false"} onChange={e => setEditForm(f => ({ ...f, est_majeur: e.target.value === "true" }))} className="w-full border border-black/15 px-3 py-2 text-sm">
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>

              {/* Rôle */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Rôle principal</label>
                <select value={editForm.role_principal || ""} onChange={e => setEditForm(f => ({ ...f, role_principal: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {editForm.role_principal === "cycliste" && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-2">Tronçons</label>
                  <div className="space-y-4 max-h-64 overflow-y-auto border border-black/10 p-3">
                    
                    {/* 3 jours */}
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer border-b border-black/10 pb-2">
                      <input
                        type="checkbox"
                        checked={(editForm.parcours_velo || []).includes("3_jours")}
                        onChange={e => {
                          const allTroncons = groupesVelo.flatMap(g => g.options.map(o => o.value));
                          if (e.target.checked) {
                            setEditForm(f => ({ ...f, parcours_velo: ["3_jours", ...allTroncons] }));
                          } else {
                            setEditForm(f => ({ ...f, parcours_velo: [] }));
                          }
                        }}
                      />
                      🚴 Je roule les 3 jours !
                    </label>

                    {/* Par jour */}
                    {groupesVelo.map(groupe => (
                      <div key={groupe.date}>
                        <p className="text-[10px] font-bold text-[#C0440E] uppercase mb-1">{groupe.date} — {groupe.trajet}</p>
                        {groupe.options.map(opt => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2 text-xs cursor-pointer py-0.5 ${opt.children.length === 0 ? "ml-4" : "font-medium"}`}
                          >
                            <input
                              type="checkbox"
                              checked={(editForm.parcours_velo || []).includes(opt.value)}
                              onChange={e => {
                                const current = [...(editForm.parcours_velo || [])];
                                let updated: string[];
                                
                                if (e.target.checked) {
                                  // COCHER : ajouter la case + tous ses enfants
                                  updated = [...new Set([...current, opt.value, ...opt.children])];
                                  
                                  // Si tous les enfants d'un parent sont cochés, cocher le parent
                                  groupesVelo.forEach(g => {
                                    g.options.forEach(o => {
                                      if (o.children.length > 0 && o.children.every(c => updated.includes(c))) {
                                        if (!updated.includes(o.value)) updated.push(o.value);
                                      }
                                    });
                                  });
                                  
                                  // Si tous les tronçons sont cochés → 3_jours
                                  const allTroncons = groupesVelo.flatMap(g => g.options.filter(o => o.children.length === 0).map(o => o.value));
                                  if (allTroncons.every(v => updated.includes(v)) && !updated.includes("3_jours")) {
                                    updated.push("3_jours");
                                  }
                                } else {
                                  // DÉCOCHER : retirer la case + tous ses enfants
                                  updated = current.filter(v => v !== opt.value && !opt.children.includes(v));
                                  
                                  // Décocher les parents dont les enfants ne sont plus tous cochés
                                  groupesVelo.forEach(g => {
                                    g.options.forEach(o => {
                                      if (o.children.length > 0 && updated.includes(o.value)) {
                                        if (!o.children.every(c => updated.includes(c))) {
                                          updated = updated.filter(v => v !== o.value);
                                        }
                                      }
                                    });
                                  });
                                  
                                  // Décocher 3_jours si plus tous les tronçons
                                  const allTroncons = groupesVelo.flatMap(g => g.options.filter(o => o.children.length === 0).map(o => o.value));
                                  if (!allTroncons.every(v => updated.includes(v))) {
                                    updated = updated.filter(v => v !== "3_jours");
                                  }
                                }
                                
                                setEditForm(f => ({ ...f, parcours_velo: updated }));
                              }}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Besoin hébergement pour cyclistes */}
              {(editForm.parcours_velo || []).length > 0 && !(editForm.parcours_velo || []).includes("3_jours") && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Besoin hébergement</label>
                  <select value={editForm.besoin_hebergement || ""} onChange={e => setEditForm(f => ({ ...f, besoin_hebergement: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm">
                    <option value="">—</option>
                    <option value="non">Non merci</option>
                    <option value="nuit_1">Nuit J1 (Huy)</option>
                    <option value="nuit_2">Nuit J2 (Gembloux)</option>
                    <option value="nuit_12">Les deux nuits</option>
                  </select>
                </div>
              )}
              
              {/* Si halte */}
              {editForm.role_principal === "organisateur_halte" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Ville de la halte</label>
                    <input type="text" value={editForm.halte_ville || ""} onChange={e => setEditForm(f => ({ ...f, halte_ville: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={editForm.halte_collecte_lettres || false} onChange={e => setEditForm(f => ({ ...f, halte_collecte_lettres: e.target.checked }))} />
                    Collecte les lettres
                  </label>
                </div>
              )}

              {/* Si accueillant */}
              {editForm.role_principal === "accueillant" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Ville</label>
                    <select value={editForm.accueil_ville || ""} onChange={e => setEditForm(f => ({ ...f, accueil_ville: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm">
                      <option value="">—</option>
                      <option value="huy">Huy</option>
                      <option value="gembloux">Gembloux</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Nombre de personnes</label>
                    <input type="number" value={editForm.accueil_nb_personnes || 1} onChange={e => setEditForm(f => ({ ...f, accueil_nb_personnes: parseInt(e.target.value) || 1 }))} className="w-full border border-black/15 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Type</label>
                    <select value={editForm.accueil_type || ""} onChange={e => setEditForm(f => ({ ...f, accueil_type: e.target.value }))} className="w-full border border-black/15 px-3 py-2 text-sm">
                      <option value="">—</option>
                      <option value="jardin">Jardin</option>
                      <option value="chambres">Chambre(s)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Remarques */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6459] block mb-1">Remarques</label>
                <textarea value={editForm.remarques || ""} onChange={e => setEditForm(f => ({ ...f, remarques: e.target.value }))} rows={3} className="w-full border border-black/15 px-3 py-2 text-sm resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingInscription(null)} className="flex-1 border border-black/15 text-sm py-2 hover:bg-black/5">Annuler</button>
              <button onClick={saveInscription} className="flex-1 bg-[#C0440E] text-white text-sm py-2 hover:bg-[#8A2E06]">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}