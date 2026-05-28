import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PUBLICS = [
  { value: "teachers", label: "Enseignant·es" },
  { value: "parents", label: "Parents" },
  { value: "students", label: "Élèves" },
  { value: "public", label: "Grand public" },
];

export default async function SoumettrePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();

  async function submit(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
    if (!profile) return redirect("/connexion");

    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const targetAudience = formData.get("target_audience") as string;
    const reponseA = (formData.get("reponse_a") as string) || null;
    const keywordsRaw = (formData.get("keywords") as string) || "";
    const sourcesRaw = (formData.get("sources") as string) || "";

    if (!title || !body || !targetAudience) {
      return redirect("/soumettre?error=Champs obligatoires manquants");
    }

    const { data: argumentaire, error } = await supabase
      .from("argumentaires")
      .insert({ title, body, target_audience: targetAudience, reponse_a: reponseA, author_id: profile.id, status: "pending", version: 1 })
      .select("id").single();

    if (error || !argumentaire) {
      return redirect("/soumettre?error=Erreur lors de la soumission");
    }

    await supabase.from("argumentaire_versions").insert({ argumentaire_id: argumentaire.id, version: 1, body, modified_by: profile.id });

    if (keywordsRaw.trim()) {
      const keywords = keywordsRaw.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
      for (const kw of keywords) {
        const { data: existingKw } = await supabase.from("keywords").select("id").eq("label", kw).maybeSingle();
        let kwId = existingKw?.id;
        if (!kwId) {
          const { data: newKw } = await supabase.from("keywords").insert({ label: kw, slug: kw.replace(/\s+/g, "-") }).select("id").single();
          kwId = newKw?.id;
        }
        if (kwId) {
          await supabase.from("argumentaire_keywords").insert({ argumentaire_id: argumentaire.id, keyword_id: kwId });
        }
      }
    }

    if (sourcesRaw.trim()) {
      const sourceLines = sourcesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
      const urlRegex = /(https?:\/\/[^\s]+)/;
      for (const line of sourceLines) {
        const match = line.match(urlRegex);
        let label = line, url = "";
        if (match) {
          url = match[0];
          label = line.replace(url, "").trim().replace(/,\s*$/, "");
          if (!label) label = url;
        }
        await supabase.from("sources").insert({ argumentaire_id: argumentaire.id, url: url || null, label: label || line, added_by: profile.id });
      }
    }

    return redirect("/mes-contributions?message=Soumis avec succès");
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl mb-2">Soumettre un argumentaire</h1>
      <p className="text-sm text-ink-light mb-8">Remplissez le formulaire. Votre argumentaire sera examiné par les modérateur·rices.</p>

      <form action={submit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Titre <span className="text-brick">*</span></label>
          <input id="title" name="title" type="text" required className="input-brut" placeholder="Un titre clair et percutant" />
        </div>

        <div>
          <label htmlFor="body" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Argumentaire <span className="text-brick">*</span></label>
          <textarea id="body" name="body" rows={12} required className="input-brut" placeholder="Développez votre argumentaire ici..." />
        </div>

        <div>
          <label htmlFor="target_audience" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Public cible <span className="text-brick">*</span></label>
          <select id="target_audience" name="target_audience" required className="input-brut">
            <option value="">— Choisir —</option>
            {PUBLICS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="reponse_a" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">En réponse à</label>
          <input id="reponse_a" name="reponse_a" type="text" className="input-brut" placeholder="Ex : « Les profs ont trop de vacances »" />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Mots-clés</label>
          <input id="keywords" name="keywords" type="text" className="input-brut" placeholder="salaire, conditions de travail, pénurie" />
          <p className="text-[10px] text-ink-light mt-1">Séparés par des virgules.</p>
        </div>

        <div>
          <label htmlFor="sources" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Sources</label>
          <textarea id="sources" name="sources" rows={3} className="input-brut text-sm" placeholder="Une source par ligne. Format : Label https://url.com" />
        </div>

        <button type="submit" className="btn-primary w-full text-center">Soumettre pour validation</button>
      </form>
    </main>
  );
}