import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ModerationAmendementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) return redirect("/");

  const { data: amendment } = await supabase.from("amendments").select("*").eq("id", id).single();
  if (!amendment) {
    return <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-ink-light">Amendement introuvable.</p></main>;
  }

  const { data: argumentaire } = await supabase.from("argumentaires").select("title, body, author_id, version").eq("id", amendment.argumentaire_id).single();
  if (!argumentaire) {
    return <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-ink-light">Argumentaire d&apos;origine introuvable.</p></main>;
  }

  const { data: amendAuthor } = amendment.author_id ? await supabase.from("profiles").select("pseudonym").eq("id", amendment.author_id).single() : { data: null };
  const { data: origAuthor } = argumentaire.author_id ? await supabase.from("profiles").select("pseudonym").eq("id", argumentaire.author_id).single() : { data: null };

  function computeDiff(original: string, proposed: string) {
    const origLines = original.split("\n");
    const propLines = proposed.split("\n");
    const maxLen = Math.max(origLines.length, propLines.length);
    const result: { text: string; type: "unchanged" | "added" | "removed" }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const origLine = origLines[i] || "";
      const propLine = propLines[i] || "";
      if (origLine === propLine) result.push({ text: origLine, type: "unchanged" });
      else if (!origLine) result.push({ text: propLine, type: "added" });
      else if (!propLine) result.push({ text: origLine, type: "removed" });
      else { result.push({ text: origLine, type: "removed" }); result.push({ text: propLine, type: "added" }); }
    }
    return result;
  }

  const diff = computeDiff(argumentaire.body, amendment.proposed_body);

  const proposedSources: { label: string; url: string }[] =
    typeof amendment.proposed_sources === "string" ? JSON.parse(amendment.proposed_sources) : Array.isArray(amendment.proposed_sources) ? (amendment.proposed_sources as any[]) : [];

  async function voteAmendment(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const amendmentId = formData.get("amendment_id") as string;
    const argumentaireId = formData.get("argumentaire_id") as string;
    const voteValue = formData.get("vote") as string;

    const { data: existing } = await supabase.from("moderation_votes").select("id").eq("target_id", amendmentId).eq("target_type", "amendment").eq("moderator_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("moderation_votes").update({ vote: voteValue }).eq("id", existing.id);
    } else {
      await supabase.from("moderation_votes").insert({ target_id: amendmentId, target_type: "amendment", moderator_id: user.id, vote: voteValue, criteria_legal: true, criteria_relevance: true, criteria_sources: true });
    }

    const { data: votes } = await supabase.from("moderation_votes").select("vote").eq("target_id", amendmentId).eq("target_type", "amendment");
    const forCount = votes?.filter((v) => v.vote === "for").length || 0;

    if (forCount >= 2) {
      const { data: currentArg } = await supabase.from("argumentaires").select("version, body").eq("id", argumentaireId).single();
      const newVersion = (currentArg?.version || 1) + 1;
      await supabase.from("argumentaires").update({ body: amendment.proposed_body, version: newVersion, updated_at: new Date().toISOString() }).eq("id", argumentaireId);
      await supabase.from("argumentaire_versions").insert({ argumentaire_id: argumentaireId, version: newVersion, body: amendment.proposed_body, modified_by: amendment.author_id });

      if (proposedSources.length > 0) {
        await supabase.from("sources").delete().eq("argumentaire_id", argumentaireId);
        await supabase.from("sources").insert(proposedSources.map((s) => ({ argumentaire_id: argumentaireId, url: s.url, label: s.label || s.url, added_by: amendment.author_id })));
      }
      await supabase.from("amendments").update({ status: "published" }).eq("id", amendmentId);
    }
    return redirect(`/moderation/amendement/${amendmentId}`);
  }

  const { data: existingVotes } = await supabase.from("moderation_votes").select("vote, moderator_id").eq("target_id", id).eq("target_type", "amendment");
  const myVote = existingVotes?.find((v) => v.moderator_id === user.id);
  const forCount = existingVotes?.filter((v) => v.vote === "for").length || 0;
  const againstCount = existingVotes?.filter((v) => v.vote === "against").length || 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/moderation" className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-6 inline-block">← Tableau de bord</Link>

      <h1 className="font-serif font-black text-2xl sm:text-3xl mb-2">Amendement pour : {argumentaire.title}</h1>
      <p className="text-xs text-ink-light font-medium tracking-wide uppercase mb-8">
        Proposé par {amendAuthor?.pseudonym || "Anonyme"} — {new Date(amendment.created_at).toLocaleDateString("fr-BE")}
        {origAuthor?.pseudonym && <> — Auteur·rice original·e : {origAuthor.pseudonym}</>}
      </p>

      {/* Diff visuel */}
      <h2 className="font-serif font-black text-lg mb-3">Modifications proposées</h2>
      <div className="border-2 border-ink mb-8 font-mono text-sm">
        {diff.map((line, i) => (
          <div key={i} className={`px-4 py-1 ${line.type === "added" ? "bg-green-100 text-green-900" : line.type === "removed" ? "bg-red-100 text-red-900 line-through" : ""}`}>
            <span className="mr-2 text-xs text-concrete">{line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}</span>
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>

      {/* Sources proposées */}
      {proposedSources.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif font-black text-lg mb-2">Sources proposées</h2>
          <ul className="space-y-1 text-sm">
            {proposedSources.map((s, i) => (
              <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-brick decoration-2 underline-offset-2 hover:text-brick transition-colors">{s.label || s.url}</a> : <span className="text-ink-light">{s.label}</span>}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Votes */}
      {existingVotes && existingVotes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif font-black text-lg mb-2">Votes ({forCount} pour, {againstCount} contre)</h2>
        </div>
      )}

      {/* Formulaire */}
      <hr className="rule-thick mb-6" />
      <h2 className="font-serif font-black text-lg mb-4">{myVote ? "Modifier mon vote" : "Voter sur cet amendement"}</h2>
      <form action={voteAmendment} className="space-y-4">
        <input type="hidden" name="amendment_id" value={id} />
        <input type="hidden" name="argumentaire_id" value={amendment.argumentaire_id} />
        <div className="flex gap-4">
          <button type="submit" name="vote" value="for" className="btn-primary text-xs" style={{ background: '#16a34a' }}>Approuver</button>
          <button type="submit" name="vote" value="against" className="btn-primary text-xs" style={{ background: '#dc2626' }}>Refuser</button>
        </div>
      </form>
    </main>
  );
}