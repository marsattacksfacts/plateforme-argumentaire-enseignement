"use client";

import { useState, useEffect} from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types & Données Statiques ─────────────────────────────────────────────

type RolePrincipal = "" | "cycliste" | "organisateur_halte" | "accueillant" | "coordinateur";

interface FormData {
  // Étape 1 - Identité
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville_ecole: string;
  nom_ecole: string;
  ville_origine: string;
  est_majeur: boolean | null;

  // Étape 2 - Rôle Principal
  role_principal: RolePrincipal;

  // Étape 3 - Détails Cycliste
  parcours_velo: string[];

  // Étape 3 - Détails Halte
  halte_ville: string;
  halte_animation: string;
  halte_collecte_lettres: boolean | null;

  // Étape 3 - Détails Accueillant
  accueil_ville: string;
  accueil_nb_personnes: string;
  accueil_type: string;

  // Étape 4 - Fin
  remarques: string;
  code_ethique_valide: boolean;
  rgpd: boolean;

  besoin_hebergement: string;
}

interface HalteSimple {
  id: number;
  ordre: number;
  ville: string;
  jour: number;
  demi_journee: string | null;
}

interface TronconSimple {
  id: number;
  code: string;
  halte_depart_id: number;
  halte_arrivee_id: number;
}

function buildGroupesVeloForm(haltes: HalteSimple[], troncons: TronconSimple[]) {
  const jours = [1, 2, 3];
  const mois = 6;

  return jours.map(jour => {
    const haltesDuJour = haltes.filter(h => h.jour === jour).sort((a, b) => a.ordre - b.ordre);
    const tronconsDuJour = troncons.filter(t => {
      const arr = haltes.find(h => h.id === t.halte_arrivee_id);
      return arr?.jour === jour;
    });

    const premiere = haltesDuJour[0];
    const derniere = haltesDuJour[haltesDuJour.length - 1];
    const date = `${jour.toString().padStart(2, "0")}/${mois.toString().padStart(2, "0")}`;
    const trajet = `${premiere?.ville || "?"} → ${derniere?.ville || "?"}`;

    const allTronconCodes = tronconsDuJour.map(t => t.code);

    const matinCodes = tronconsDuJour.filter(t => {
      const dep = haltes.find(h => h.id === t.halte_depart_id);
      const arr = haltes.find(h => h.id === t.halte_arrivee_id);
      return dep?.demi_journee === "matin" && arr?.demi_journee === "matin";
    }).map(t => t.code);

    const apresmidiCodes = tronconsDuJour.filter(t => {
      const arr = haltes.find(h => h.id === t.halte_arrivee_id);
      return arr?.demi_journee === "apres_midi";
    }).map(t => t.code);

    const options: { value: string; label: string; children: string[] }[] = [];

    options.push({
      value: `jour${jour}_entier`,
      label: `Jour ${jour} entier (${trajet})`,
      children: [`jour${jour}_matin`, `jour${jour}_apresmidi`, ...allTronconCodes],
    });

    const haltesMatin = haltesDuJour.filter(h => h.demi_journee === "matin");
    if (haltesMatin.length > 0 && matinCodes.length > 0) {
      options.push({
        value: `jour${jour}_matin`,
        label: `Matin (${haltesMatin[0].ville} → ${haltesMatin[haltesMatin.length - 1].ville})`,
        children: matinCodes,
      });
    }

    const haltesAprem = haltesDuJour.filter(h => h.demi_journee === "apres_midi");
    if (haltesAprem.length > 0 && apresmidiCodes.length > 0) {
      options.push({
        value: `jour${jour}_apresmidi`,
        label: `Après-midi (${haltesAprem[0].ville} → ${haltesAprem[haltesAprem.length - 1].ville})`,
        children: apresmidiCodes,
      });
    }

    tronconsDuJour.forEach(t => {
      const from = haltes.find(h => h.id === t.halte_depart_id);
      const to = haltes.find(h => h.id === t.halte_arrivee_id);
      options.push({
        value: t.code,
        label: `${from?.ville || "?"} → ${to?.ville || "?"}`,
        children: [],
      });
    });

    return { date, jour: `Jour ${jour}`, trajet, options };
  });
}

const EMPTY: FormData = {
  prenom: "", nom: "", email: "", telephone: "", ville_ecole: "", nom_ecole: "", ville_origine: "",
  est_majeur: null, role_principal: "", 
  parcours_velo: [],
  halte_ville: "", halte_animation: "", halte_collecte_lettres: null,
  accueil_ville: "", accueil_nb_personnes: "1", accueil_type: "",
  remarques: "", code_ethique_valide: false, rgpd: false,
  besoin_hebergement: ""
};


// Liste à plat pour le select "3 jours"
const OPTION_3_JOURS = { value: "3_jours", label: "🚴 Je suis un grand malade, je roule les 3 jours !" };


// ── Page Principale ────────────────────────────────────────────────────────

export default function InscriptionPage() {
  const [data, setData] = useState<FormData>(EMPTY);
  const [step, setStep] = useState(1); // Étape 1: Identité
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [groupesVelo, setGroupesVelo] = useState<{ date: string; jour: string; trajet: string; options: { value: string; label: string; children: string[] }[] }[]>([]);

  useEffect(() => {
    async function loadTroncons() {
      const [{ data: haltes }, { data: troncons }] = await Promise.all([
        supabase.from("haltes").select("*").order("ordre"),
        supabase.from("troncons").select("*").order("ordre"),
      ]);
      if (haltes && troncons) {
        setGroupesVelo(buildGroupesVeloForm(haltes, troncons));
      }
    }
    loadTroncons();
  }, []);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const canNext = (): boolean => {
    switch (step) {
      case 1: return (
        !!data.prenom.trim() && 
        !!data.nom.trim() && 
        !!data.email.trim() && 
        !!data.telephone.trim() && 
        !!data.ville_ecole.trim() && 
        !!data.nom_ecole.trim() && 
        !!data.ville_origine.trim() && 
        data.est_majeur !== null
      );
      case 2: return data.role_principal !== "";
      case 3:
        if (data.role_principal === "cycliste") return data.parcours_velo.length > 0;
        if (data.role_principal === "organisateur_halte") return data.halte_collecte_lettres !== null;
        if (data.role_principal === "accueillant") return data.accueil_ville !== "" && data.accueil_type !== "";
        return true;
      case 4: return data.code_ethique_valide && data.rgpd;
      default: return false;
    }
  };

  const next = () => { if (canNext()) setStep(s => s + 1); };
  const prev = () => { setStep(s => s - 1); };

  const submit = async () => {
    if (!canNext()) return;
    setLoading(true);
    setError("");

    const payload = {
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      ville_ecole: data.ville_ecole,
      nom_ecole: data.nom_ecole,
      ville_origine: data.ville_origine,
      est_majeur: data.est_majeur,
      role_principal: data.role_principal,
      parcours_velo: data.role_principal === "cycliste" ? data.parcours_velo : null,
      halte_ville: data.role_principal === "organisateur_halte" ? data.halte_ville || null : null,
      halte_animation: data.role_principal === "organisateur_halte" ? data.halte_animation || null : null,
      halte_collecte_lettres: data.role_principal === "organisateur_halte" ? data.halte_collecte_lettres : null,
      accueil_ville: data.role_principal === "accueillant" ? data.accueil_ville : null,
      accueil_nb_personnes: data.role_principal === "accueillant" ? parseInt(data.accueil_nb_personnes, 10) || 1 : null,
      accueil_type: data.role_principal === "accueillant" ? data.accueil_type : null,
      remarques: data.remarques || null,
      code_ethique_valide: data.code_ethique_valide,
      besoin_hebergement: data.role_principal === "cycliste" ? (data.besoin_hebergement || null) : null,
    };

    const { error: sbError } = await supabase.from("inscriptions").insert([payload]);

    setLoading(false);
    if (sbError) {
      console.error(sbError);
      setError("Erreur lors de l'envoi. Vérifie les champs ou réessaie plus tard.");
    } else {
      setDone(true);
    }
  };

  const toggleParcours = (value: string) => {
    setData(prev => {
      const current = new Set(prev.parcours_velo);
      
      // Trouver l'option cliquée
      let clickedOption: { value: string; children: string[] } | null = null;
      for (const groupe of groupesVelo) {
        const found = groupe.options.find(o => o.value === value);
        if (found) { clickedOption = found; break; }
      }
      
      if (!clickedOption) return prev;
      
      const isChecked = current.has(value);
      
      if (isChecked) {
        // DÉCOCHER : retirer la valeur et tous ses enfants
        current.delete(value);
        clickedOption.children.forEach(child => current.delete(child));
      } else {
        // COCHER : ajouter la valeur et tous ses enfants
        current.add(value);
        clickedOption.children.forEach(child => current.add(child));
      }
      
      // Recalculer les parents
      const finalSet = new Set(current);
      
      // Pour chaque option avec des enfants, vérifier si tous les enfants sont cochés
      groupesVelo.forEach(groupe => {
        groupe.options.forEach(opt => {
          if (opt.children.length > 0) {
            const allChildrenChecked = opt.children.every(child => finalSet.has(child));
            if (allChildrenChecked) {
              finalSet.add(opt.value);
            } else {
              finalSet.delete(opt.value);
            }
          }
        });
      });
      
      // Vérifier 3_jours
      const allTroncons = groupesVelo.flatMap(g => g.options.filter(o => o.children.length === 0).map(o => o.value));
      const allChecked = allTroncons.every(v => finalSet.has(v));
      if (allChecked) {
        finalSet.add("3_jours");
      } else {
        finalSet.delete("3_jours");
      }
      
      return { ...prev, parcours_velo: [...finalSet] };
    });
  };

  const toggle3Jours = () => {
    setData(prev => {
      if (prev.parcours_velo.includes("3_jours")) {
        return { ...prev, parcours_velo: [] };
      } else {
        const allTroncons = groupesVelo.flatMap(g => g.options.map(o => o.value));
        allTroncons.push("3_jours");
        return { ...prev, parcours_velo: [...new Set(allTroncons)] };
      }
    });
  };

  if (done) return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-4xl mb-6">✉️</p>
        <h1 className="font-serif text-3xl font-black mb-4 text-[#1C1917]">Inscription reçue !</h1>
        <p className="text-sm text-[#6B6459] leading-relaxed mb-8">
          Merci <strong className="text-[#1C1917]">{data.prenom}</strong> de rejoindre l'aventure.
          On te recontacte très vite avec les infos pratiques.
          En attendant, parle-en autour de toi !
        </p>
        <Link href="/" className="text-sm underline text-[#C0440E] hover:text-[#8A2E06]">
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F5F0E8] pt-16 pb-24 px-6">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="text-sm text-[#6B6459] hover:text-[#1C1917] transition-colors">
          ← Accueil
        </Link>
        <p className="font-serif font-bold text-[#C0440E] text-sm">Facteurs à bicyclette</p>
      </nav>

      <div className="max-w-lg mx-auto pt-10">
        {/* Step Bar */}
        <div className="flex gap-1 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 transition-all duration-300 ${s <= step ? "bg-[#C0440E]" : "bg-black/10"}`} />
          ))}
        </div>

        {/* ÉTAPE 1 : Identité */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-bold mb-6">Qui es-tu ?</h2>
            <Input label="Prénom *" value={data.prenom} onChange={v => set("prenom", v)} />
            <Input label="Nom *" value={data.nom} onChange={v => set("nom", v)} />
            <Input label="Email *" type="email" value={data.email} onChange={v => set("email", v)} placeholder="ton@email.be" />
            <Input label="Téléphone *" type="tel" value={data.telephone} onChange={v => set("telephone", v)} placeholder="+32 4..." />
            <Input label="Ville de ton école *" value={data.ville_ecole} onChange={v => set("ville_ecole", v)} />
            <Input label="Nom de ton école *" value={data.nom_ecole} onChange={v => set("nom_ecole", v)} />
            <Input label="Ville d'où tu viens *" value={data.ville_origine} onChange={v => set("ville_origine", v)} />
                        
            <Label>Es-tu majeur·e ? *</Label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => set("est_majeur", true)} 
                className={`flex-1 py-4 border text-sm font-medium touch-manipulation select-none min-h-[48px] ${data.est_majeur === true ? "border-[#C0440E] bg-[#C0440E]/5 text-[#C0440E]" : "border-black/10 text-[#6B6459] active:bg-black/5"}`}
              >
                Oui, je suis majeur·e
              </button>
              <button 
                type="button"
                onClick={() => set("est_majeur", false)} 
                className={`flex-1 py-4 border text-sm font-medium touch-manipulation select-none min-h-[48px] ${data.est_majeur === false ? "border-[#C0440E] bg-[#C0440E]/5 text-[#C0440E]" : "border-black/10 text-[#6B6459] active:bg-black/5"}`}
              >
                Non, je suis mineur·e
              </button>
            </div>
            {data.est_majeur === false && (
              <p className="text-xs text-[#C0440E] bg-[#C0440E]/5 p-3">En cochant "Non", tu attestes que tes tuteurs légaux sont informés de ta participation. Un justificatif pourra t'être demandé.</p>
            )}
          </div>
        )}

        {/* ÉTAPE 2 : Rôle Principal (Bifurcation 1) */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold mb-6">Tu viens pour...</h2>
            <RadioCard title="🚴 Être cycliste et rouler un bout (ou tout) le parcours" subtitle="" checked={data.role_principal === "cycliste"} onClick={() => set("role_principal", "cycliste")} />
            <RadioCard title="🏫 Organiser une halte / vous retrouver lors d'une halte" subtitle="Je ne suis pas cycliste mais je veux aider à l'accueil." checked={data.role_principal === "organisateur_halte"} onClick={() => set("role_principal", "organisateur_halte")} />
            <RadioCard title="🏠 Accueillir des cyclistes chez moi (Huy ou Gembloux)" subtitle="Pour planter une tente dans le jardin ou proposer une chambre." checked={data.role_principal === "accueillant"} onClick={() => set("role_principal", "accueillant")} />
            <RadioCard title="🗺️ Aider à coordonner" subtitle="Je me doute que vous avez besoin d'aide pour organiser tout ça !" checked={data.role_principal === "coordinateur"} onClick={() => set("role_principal", "coordinateur")} />
          </div>
        )}

        {/* ÉTAPE 3 : Détails selon le rôle choisi */}
        {step === 3 && (
          <div className="space-y-6">
            {data.role_principal === "cycliste" && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-bold">Quel parcours vas-tu suivre ?</h2>
                <p className="text-xs text-[#6B6459] -mt-2">
                  Coche les tronçons que tu souhaites parcourir. Cocher une option "matin" ou "après-midi" coche automatiquement tous les tronçons correspondants.
                </p>

                {/* Option 3 jours */}
                <div className="border border-[#C0440E]/30 bg-[#C0440E]/5 p-4">
                  <CheckCard
                    checked={data.parcours_velo.includes("3_jours")}
                    onClick={toggle3Jours}
                    title="🚴 Je suis un grand malade, je roule les 3 jours !"
                    subtitle="1er au 3 juin — Verviers → Bruxelles en entier"
                  />
                </div>

                {/* Par jour */}
                {groupesVelo.map(groupe => (
                  <div key={groupe.date} className="border border-black/10 p-4 space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold bg-[#1C1917] text-[#F5F0E8] px-2 py-0.5">{groupe.date}</span>
                      <span className="font-serif font-bold text-[#1C1917]">{groupe.jour}</span>
                      <span className="text-xs text-[#6B6459]">— {groupe.trajet}</span>
                    </div>

                    {groupe.options.map(opt => (
                      <div key={opt.value} className={opt.children.length > 0 ? "ml-0" : "ml-5"}>
                        <CheckCard
                          checked={data.parcours_velo.includes(opt.value)}
                          onClick={() => toggleParcours(opt.value)}
                          title={opt.label}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {/* Hébergement pour les cyclistes faisant plusieurs jours */}
                {data.role_principal === "cycliste" && (
                  (() => {
                    const hasJ1 = data.parcours_velo.some(v => v.startsWith("jour1") || v.startsWith("troncon_") && groupesVelo[0].options.some(o => o.value === v));
                    const hasJ2 = data.parcours_velo.some(v => v.startsWith("jour2"));
                    const hasJ3 = data.parcours_velo.some(v => v.startsWith("jour3"));
                    const chevauche = (hasJ1 && hasJ2) || (hasJ2 && hasJ3) || data.parcours_velo.includes("3_jours");
                    
                    if (!chevauche) return null;
                    
                    return (
                      <div className="mt-6 space-y-3">
                        <SectionTitle>🏠 Hébergement</SectionTitle>
                        <p className="text-xs text-[#6B6459]">Comme tu roules sur plusieurs jours, as-tu besoin d'un hébergement ?</p>
                        <RadioCard
                          checked={data.besoin_hebergement === "non"}
                          onClick={() => set("besoin_hebergement", "non")}
                          title="Non merci, je me débrouille"
                        />
                        {hasJ1 && hasJ2 && (
                          <RadioCard
                            checked={data.besoin_hebergement === "nuit_1"}
                            onClick={() => set("besoin_hebergement", "nuit_1")}
                            title="Oui — nuit du 1er au 2 juin (région Huy)"
                          />
                        )}
                        {hasJ2 && hasJ3 && (
                          <RadioCard
                            checked={data.besoin_hebergement === "nuit_2"}
                            onClick={() => set("besoin_hebergement", "nuit_2")}
                            title="Oui — nuit du 2 au 3 juin (région Gembloux)"
                          />
                        )}
                        {(hasJ1 && hasJ2 && hasJ3) && (
                          <RadioCard
                            checked={data.besoin_hebergement === "nuit_12"}
                            onClick={() => set("besoin_hebergement", "nuit_12")}
                            title="Oui — les deux nuits"
                          />
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {data.role_principal === "organisateur_halte" && (
              <>
                <h2 className="font-serif text-xl font-bold">Organiser une halte</h2>
                <Input label="Dans quelle ville se situe ta halte ?" value={data.halte_ville} onChange={v => set("halte_ville", v)} placeholder="Ex: Liège, Huy..." />
                <Label>Proposition d'activité conviviale (concert, mini-bar, etc.) :</Label>
                <Textarea value={data.halte_animation} onChange={v => set("halte_animation", v)} placeholder="Décris-nous tes idées folles..." />
                <Label>Es-tu disponible pour collecter les lettres des voisins/enfants avant la halte ? *</Label>
                <div className="flex gap-4">
                  <button onClick={() => set("halte_collecte_lettres", true)} className={`flex-1 py-3 border text-sm font-medium ${data.halte_collecte_lettres === true ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Oui, je récolte !</button>
                  <button onClick={() => set("halte_collecte_lettres", false)} className={`flex-1 py-3 border text-sm font-medium ${data.halte_collecte_lettres === false ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Non, mais je tiens la halte</button>
                </div>
              </>
            )}

            {data.role_principal === "accueillant" && (
              <>
                <h2 className="font-serif text-xl font-bold">Accueillir des cyclistes</h2>
                <Label>Dans quelle ville loges-tu ?</Label>
                <div className="flex gap-4">
                  <button onClick={() => set("accueil_ville", "huy")} className={`flex-1 py-3 border text-sm font-medium ${data.accueil_ville === "huy" ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Huy</button>
                  <button onClick={() => set("accueil_ville", "gembloux")} className={`flex-1 py-3 border text-sm font-medium ${data.accueil_ville === "gembloux" ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Gembloux</button>
                </div>
                <Input label="Combien de personnes peux-tu accueillir ?" type="number" value={data.accueil_nb_personnes} onChange={v => set("accueil_nb_personnes", v)} />
                <Label>Type d'hébergement :</Label>
                <div className="flex gap-4">
                  <button onClick={() => set("accueil_type", "jardin")} className={`flex-1 py-3 border text-sm font-medium ${data.accueil_type === "jardin" ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Dans le jardin (tente)</button>
                  <button onClick={() => set("accueil_type", "chambres")} className={`flex-1 py-3 border text-sm font-medium ${data.accueil_type === "chambres" ? "border-[#C0440E] bg-[#C0440E]/5" : "border-black/10"}`}>Dans une/des chambre(s)</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 4 : Consentements & Remarques */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-bold">Dernière ligne droite</h2>
            <Textarea label="Une remarque, une question, un mot doux ?" value={data.remarques} onChange={v => set("remarques", v)} />
            
            <div className="bg-[#C0440E]/5 border border-[#C0440E]/20 p-4 text-sm leading-relaxed text-[#1C1917] space-y-3 max-h-48 overflow-y-auto">
              <p className="font-bold text-[#C0440E] uppercase text-[10px] tracking-widest">Code éthique — Nos principes</p>
              <p>Comme dans toutes les actions estampillées « Mars Attacks », chacun·e est libre de venir comme iel est et d'afficher, ou non, son appartenance à une école, un syndicat, un parti démocratique de gauche (PS, PTB, Ecolo), une association. L'action n'est absolument pas « apolitique ». Nous avancerons portés par un idéal de société et cela, évidemment, c'est politique.</p>
              <p>Les déplacements sont susceptibles d'être rejoints, spontanément, par des mineurs. L'organisation décline toute responsabilité sur ceux-ci et ils restent sous la responsabilité de leurs tuteurs légaux comme lors de leurs déplacements quotidiens.</p>
              <p>Les déplacements se feront sur la voie publique en respectant la réglementation routière qui incombe aux cyclistes. Les pelotons seront limités à 150 cyclistes encadrés par des capitaines de route clairement identifiables au moyen d'un brassard jaune. Aucune dimension de compétition sportive ne sera encouragée. Chaque participant reste libre et responsable de son attitude sur la route.</p>
              <p>Dans un souci d'organisation, les personnes souhaitant se joindre à un déplacement se signaleront aux capitaines afin de répartir les cyclistes au sein des pelotons. Les capitaines ne prennent pas la responsabilité des cyclistes en cas d'accident mais veilleront à installer les conditions nécessaires à un déplacement à une allure moyenne de 13 km/h.</p>
              <p>Les cyclistes sont eux-mêmes en charge de leur matériel, de leur équipement de réparation et anticipent la nécessité de s'hydrater, s'alimenter durant le déplacement.</p>
              <p>Après leur participation au déplacement, les cyclistes sont responsables de rejoindre, individuellement ou non, leur point de départ par le moyen qu'ils souhaitent (voiture, train…), ils veilleront, dans ce cadre, à se conformer à l'ordre public.</p>
              <p>Pour les deux nuits à Huy et à Gembloux, nous tentons de faire correspondre des propositions d'hébergement avec des demandes. Nous ne sommes pas une agence de voyage : votre responsabilité reste pleine et entière, que vous soyez hébergeur ou hébergé.</p>
              <p>Les lettres collectées et remises au Parlement de la Fédération Wallonie-Bruxelles s'inscrivent dans le cadre d'un dialogue démocratique. Quoique véhiculées par les facteurs à bicyclette, elles restent une émanation de leur signataire (individu ou organisation). En aucun cas l'organisation ne pourra se montrer solidaire de messages injurieux, intimidants ou de toute forme de harcèlement.</p>
              <p className="text-xs text-[#6B6459] italic mt-2">
                <Link href="/code-ethique" target="_blank" className="underline hover:text-[#C0440E]">Lire le code éthique complet dans une nouvelle page →</Link>
              </p>
            </div>
            
            <RadioCard checked={data.code_ethique_valide} onClick={() => set("code_ethique_valide", !data.code_ethique_valide)} title="Je valide le code éthique de l'événement *" subtitle={data.est_majeur === false ? "En tant que mineur·e, mes tuteurs légaux en ont pris connaissance." : ""} />
            <RadioCard checked={data.rgpd} onClick={() => set("rgpd", !data.rgpd)} title="J'accepte que mes données soient stockées pour l'organisation de l'événement *" subtitle="Conformément au RGPD, elles ne seront pas partagées." />
            
            {error && <p className="text-red-600 text-sm bg-red-50 p-3">{error}</p>}
          </div>
        )}

        {/* Navigation Boutons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button type="button" onClick={prev} className="border border-black/15 text-sm font-medium px-5 py-3 text-[#6B6459] hover:bg-black/5">
              ← Retour
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={next} disabled={!canNext()} className="flex-1 bg-[#C0440E] text-white text-sm font-medium px-5 py-3 hover:bg-[#8A2E06] transition-colors disabled:opacity-30">
              Continuer →
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={loading || !canNext()} className="flex-1 bg-black text-white text-sm font-medium px-5 py-3 hover:bg-gray-800 transition-colors disabled:opacity-30">
              {loading ? "Envoi..." : "Envoyer mon inscription ✉️"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Composants UI ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B6459] mb-2">
      {children}
    </p>
  );
}

function Input({ 
  label,
  value, 
  onChange, 
  placeholder, 
  type = "text" 
}: {
  label?: string;
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string; 
  type?: string;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-black/15 bg-[#F5F0E8] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#6B6459]/60 focus:outline-none focus:border-[#C0440E] focus:bg-white transition-colors"
      />
    </div>
  );
}

function Textarea({ 
  label,
  value, 
  onChange, 
  placeholder, 
  rows = 3 
}: {
  label?: string;
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  rows?: number;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-black/15 bg-[#F5F0E8] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#6B6459]/60 focus:outline-none focus:border-[#C0440E] focus:bg-white transition-colors resize-none"
      />
    </div>
  );
}

function RadioCard({ 
  checked, 
  onClick, 
  title, 
  subtitle 
}: {
  checked: boolean; 
  onClick: () => void; 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div 
      onClick={onClick}
      className={`w-full cursor-pointer text-left px-4 py-3 border transition-all select-none ${
        checked 
          ? "border-[#C0440E] bg-[#C0440E]/5" 
          : "border-black/10 bg-white hover:border-black/25 active:bg-black/5"
      }`}
      role="radio"
      aria-checked={checked}
    >
      <div className="flex items-start gap-3 pointer-events-none">
        <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          checked ? "border-[#C0440E]" : "border-black/25"
        }`}>
          {checked && <span className="w-2.5 h-2.5 rounded-full bg-[#C0440E]" />}
        </span>
        <div>
          <p className="text-sm font-medium text-[#1C1917]">{title}</p>
          {subtitle && (
            <p className="text-xs text-[#6B6459] mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="font-serif text-base font-bold text-[#1C1917] whitespace-nowrap">{children}</p>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}


function CheckCard({ 
  checked, 
  onClick, 
  title, 
  subtitle 
}: {
  checked: boolean; 
  onClick: () => void; 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div 
      onClick={onClick}
      className={`w-full cursor-pointer text-left px-4 py-3 border transition-all select-none ${
        checked 
          ? "border-[#C0440E] bg-[#C0440E]/5" 
          : "border-black/10 bg-white hover:border-black/25 active:bg-black/5"
      }`}
      role="checkbox"
      aria-checked={checked}
    >
      <div className="flex items-start gap-3 pointer-events-none">
        <span className={`mt-0.5 w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center rounded-sm ${
          checked ? "border-[#C0440E] bg-[#C0440E]" : "border-black/25"
        }`}>
          {checked && <span className="text-white text-xs leading-none">✓</span>}
        </span>
        <div>
          <p className="text-sm font-medium text-[#1C1917]">{title}</p>
          {subtitle && (
            <p className="text-xs text-[#6B6459] mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}