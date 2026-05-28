import { createClient } from "@/lib/supabase/server";
import { updateArgumentaireStatus } from "@/lib/utils/moderation";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ModerationArgumentairePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id, role, show_moderation_votes").eq("id", user.id).single();
  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) return redirect("/");

  const { data: argumentaire } = await supabase.from("argumentaires").select("*").eq("id", id).single();
  if (!argumentaire) return <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-ink-light">Argumentaire introuvable.</p></main>;

  const { data: author } = argumentaire.author_id ? await supabase.from("profiles").select("pseudonym, is_public_profile").eq("id", argumentaire.author_id).single() : { data: null };
  const authorName = author?.is_public_profile !== false ? author?.pseudonym || "Anonyme" : "Auteur·rice anonyme";

  const { data: votes } = await supabase.from("moderation_votes").select("*, profiles(pseudonym)").eq("target_id", id).eq("target_type", "argumentaire").order("created_at", { ascending: false });
  const myVote = votes?.find((v) => v.moderator_id === profile.id) || null;
  const otherVotes = votes?.filter((v) => v.moderator_id !== profile.id) || [];
  const forCount = votes?.filter((v) => v.vote === "for").length || 0;
  const againstCount = votes?.filter((v) => v.vote === "against").length || 0;

  const { data: argKeywords } = await supabase.from("argumentaire_keywords").select("keywords(label)").eq("argumentaire_id", id);

  async function vote(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const argId = formData.get("argumentaire_id") as string;
    const voteValue = formData.get("vote") as string;
    const legal = formData.get("criteria_legal") === "on";
    const relevance = formData.get("criteria_relevance") === "on";
    const sourcesOk = formData.get("criteria_sources") === "on";
    const flagSources = formData.get("flag_sources") === "on";
    const comment = (formData.get("comment") as string) || null;
    const isPublic = formData.get("is_public") === "on";

    if (!voteValue) return redirect(`/moderation/argumentaire/${argId}?error=Choisissez Pour ou Contre`);
    if (voteValue === "for" && !legal) return redirect(`/moderation/argumentaire/${argId}?error=La légalité doit être cochée pour voter POUR`);

    const { data: existing } = await supabase.from("moderation_votes").select("id").eq("target_id", argId).eq("target_type", "argumentaire").eq("moderator_id", user.id).maybeSingle();

    if (existing) {
      await supabase.from("moderation_votes").update({ vote: voteValue, criteria_legal: legal, criteria_relevance: relevance, criteria_sources: sourcesOk, flag_sources: flagSources, comment, is_public: isPublic }).eq("id", existing.id);
    } else {
      await supabase.from("moderation_votes").insert({ target_id: argId, target_type: "argumentaire", moderator_id: user.id, vote: voteValue, criteria_legal: legal, criteria_relevance: relevance, criteria_sources: sourcesOk, flag_sources: flagSources, comment, is_public: isPublic });
    }
    await updateArgumentaireStatus(argId);
    return redirect(`/moderation/argumentaire/${argId}?success=Vote enregistré`);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/moderation" className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-6 inline-block">← Tableau de bord</Link>

      {sp.error && <div className="bg-brick-light border-l-4 border-brick text-ink p-4 mb-4 text-sm font-medium">{sp.error}</div>}
      {sp.success && <div className="bg-ochre-light border-l-4 border-ochre text-ink p-4 mb-4 text-sm font-medium">{sp.success}</div>}

      <h1 className="font-serif font-black text-2xl sm:text-3xl mb-2">{argumentaire.title}</h1>
      <p className="text-xs text-ink-light font-medium tracking-wide uppercase mb-6">
        par {authorName} — {new Date(argumentaire.created_at).toLocaleDateString("fr-BE")} — Statut :{" "}
        <span className={`badge-brut text-[10px] ${argumentaire.status === "published" ? "badge-ok" : argumentaire.status === "suspended" ? "badge-urgent" : "badge-neutral"}`}>{argumentaire.status}</span>
      </p>

      <div className="border-2 border-ink bg-paper p-6 mb-8 whitespace-pre-wrap text-sm leading-relaxed">{argumentaire.body}</div>

      <div className="flex flex-wrap gap-2 mb-8 text-[10px] uppercase tracking-wide font-bold text-ink-light">
        <span className="badge-brut badge-neutral">{argumentaire.target_audience === "public" ? "Grand public" : argumentaire.target_audience}</span>
        {argumentaire.reponse_a && <span>En réponse à : « {argumentaire.reponse_a} »</span>}
        {argKeywords?.map((k: any, i: number) => <span key={i} className="badge-brut badge-neutral">{k.keywords?.label}</span>)}
      </div>

      {/* Mon vote */}
      <div className="border-l-4 border-brick bg-brick-light p-4 mb-8">
        <h2 className="font-serif font-black text-lg mb-2 text-ink">{myVote ? "Mon vote actuel" : "Je n'ai pas encore voté"}</h2>
        {myVote ? (
          <div className="text-sm space-y-1">
            <p className="font-bold" style={{ color: myVote.vote === "for" ? "#166534" : "#991b1b" }}>{myVote.vote === "for" ? "✓ POUR" : "✗ CONTRE"}</p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span>{myVote.criteria_legal ? "✅ Légal" : "⬜ Légalité"}</span>
              <span>{myVote.criteria_relevance ? "✅ Pertinent" : "⬜ Pertinence"}</span>
              <span>{myVote.criteria_sources ? "✅ Sourcé" : "⬜ Sources"}</span>
              {myVote.flag_sources && <span>⚠️ Sources insuffisantes</span>}
            </div>
            {myVote.comment && <p className="text-xs italic mt-1">« {myVote.comment} »</p>}
            <p className="text-[10px] text-ink-light">{myVote.is_public ? "Nom visible publiquement" : "Nom non affiché"}</p>
          </div>
        ) : <p className="text-sm text-ink-light">Utilisez le formulaire ci-dessous.</p>}
      </div>

      {/* Autres votes */}
      {otherVotes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif font-black text-lg mb-3">Autres votes ({forCount} pour, {againstCount} contre)</h2>
          <div className="grid gap-2">
            {otherVotes.map((v) => (
              <div key={v.id} className="card-brut card-a text-sm flex flex-wrap items-center gap-3">
                <span className="font-bold" style={{ color: v.vote === "for" ? "#166534" : "#991b1b" }}>{v.vote === "for" ? "✓" : "✗"}</span>
                <span className="text-xs text-ink-light">{v.is_public && v.profiles?.pseudonym ? v.profiles.pseudonym : "Anonyme"}</span>
                <div className="flex gap-2 text-[10px]">
                  {v.criteria_legal && <span>✅ Légal</span>}
                  {v.criteria_relevance && <span>✅ Pertinent</span>}
                  {v.criteria_sources && <span>✅ Sourcé</span>}
                  {v.flag_sources && <span>⚠️ Sources</span>}
                </div>
                {v.comment && <p className="text-xs italic w-full">« {v.comment} »</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="rule-thick mb-6" />

      <h2 className="font-serif font-black text-lg mb-4">{myVote ? "Modifier mon vote" : "Voter"}</h2>
      <form action={vote} className="space-y-5">
        <input type="hidden" name="argumentaire_id" value={id} />
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wide text-ink-light mb-2">Vote</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="radio" name="vote" value="for" defaultChecked={myVote?.vote === "for"} required /><span className="text-green-700">Pour</span></label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm"><input type="radio" name="vote" value="against" defaultChecked={myVote?.vote === "against"} /><span className="text-red-700">Contre</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wide text-ink-light mb-2">Critères</legend>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="criteria_legal" defaultChecked={myVote?.criteria_legal ?? false} /><span>Légalité</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="criteria_relevance" defaultChecked={myVote?.criteria_relevance ?? false} /><span>Pertinence</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="criteria_sources" defaultChecked={myVote?.criteria_sources ?? false} /><span>Sources satisfaisantes</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="flag_sources" defaultChecked={myVote?.flag_sources ?? false} /><span>⚠️ Valide mais manque de sources</span></label>
          </div>
        </fieldset>
        <div>
          <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Commentaire (interne)</label>
          <textarea id="comment" name="comment" rows={2} defaultValue={myVote?.comment || ""} className="input-brut text-sm" placeholder="Motivation..." />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" name="is_public" defaultChecked={myVote?.is_public ?? profile.show_moderation_votes ?? false} /><span>Rendre mon nom public</span></label>
        <button type="submit" className="btn-primary">{myVote ? "Mettre à jour" : "Soumettre"}</button>
      </form>
    </main>
  );
}