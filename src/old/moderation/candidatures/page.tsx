import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CandidaturesPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: modProfile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!modProfile || (modProfile.role !== "moderator" && modProfile.role !== "admin")) return redirect("/");

  const { data: candidatures } = await supabase.from("moderator_applications").select("*, profiles!moderator_applications_user_id_fkey(pseudonym)").eq("status", "pending").order("created_at", { ascending: true });

  const appIds = candidatures?.map((c) => c.id) || [];
  const { data: allVotes } = await supabase.from("moderation_votes").select("target_id, vote, moderator_id").eq("target_type", "moderator_application").in("target_id", appIds);

  const getUserVote = (appId: string) => allVotes?.find((v) => v.target_id === appId && v.moderator_id === user.id);
  const getVoteCounts = (appId: string) => {
    const votes = allVotes?.filter((v) => v.target_id === appId) || [];
    return { for: votes.filter((v) => v.vote === "for").length, against: votes.filter((v) => v.vote === "against").length };
  };

  async function voteApplication(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const { data: modProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!modProfile || (modProfile.role !== "moderator" && modProfile.role !== "admin")) return redirect("/");

    const appId = formData.get("application_id") as string;
    const voteValue = formData.get("vote") as string;

    if (modProfile.role !== "admin") {
      const { data: existingVote } = await supabase.from("moderation_votes").select("id").eq("target_id", appId).eq("target_type", "moderator_application").eq("moderator_id", user.id).maybeSingle();
      if (existingVote) return redirect("/moderation/candidatures?error=Vous+avez+déjà+voté");
    }

    await supabase.from("moderation_votes").insert({ target_id: appId, target_type: "moderator_application", moderator_id: user.id, vote: voteValue, criteria_legal: true, criteria_relevance: true, criteria_sources: true });

    const { data: votes } = await supabase.from("moderation_votes").select("vote").eq("target_id", appId).eq("target_type", "moderator_application");
    const forCount = votes?.filter((v) => v.vote === "for").length || 0;

    if (forCount >= 3) {
      const { data: application } = await supabase.from("moderator_applications").select("user_id").eq("id", appId).single();
      if (application) {
        await supabase.from("profiles").update({ role: "moderator" }).eq("id", application.user_id);
        await supabase.from("moderator_applications").update({ status: "approved" }).eq("id", appId);
      }
    }
    return redirect(`/moderation/candidatures?success=Vote+enregistré`);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/moderation" className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-6 inline-block">← Tableau de bord</Link>

      <h1 className="font-serif font-black text-3xl mb-8">Candidatures modérateur</h1>

      {sp.error && <div className="bg-brick-light border-l-4 border-brick text-ink p-4 mb-4 text-sm font-medium">{sp.error}</div>}
      {sp.success && <div className="bg-ochre-light border-l-4 border-ochre text-ink p-4 mb-4 text-sm font-medium">{sp.success}</div>}

      {candidatures && candidatures.length > 0 ? (
        <div className="grid gap-4">
          {candidatures.map((c) => {
            const counts = getVoteCounts(c.id);
            const hasVoted = getUserVote(c.id);
            const canVote = modProfile.role === "admin" || !hasVoted;

            return (
              <div key={c.id} className="card-brut card-a">
                <p className="font-bold text-base text-ink">{(c.profiles as any)?.pseudonym || "Anonyme"}</p>
                <p className="text-sm text-ink-light mt-1 whitespace-pre-wrap">{c.motivation_text}</p>
                <p className="text-[10px] text-ink-light mt-2 font-medium tracking-wide uppercase">
                  {new Date(c.created_at).toLocaleDateString("fr-BE")} — {counts.for} pour / {counts.against} contre
                  {hasVoted && <span className="ml-2">(vous : {hasVoted.vote === "for" ? "pour" : "contre"})</span>}
                </p>
                {canVote ? (
                  <form action={voteApplication} className="mt-3 flex gap-2">
                    <input type="hidden" name="application_id" value={c.id} />
                    <button type="submit" name="vote" value="for" className="btn-primary text-xs" style={{ background: '#16a34a' }}>Approuver</button>
                    <button type="submit" name="vote" value="against" className="btn-primary text-xs" style={{ background: '#dc2626' }}>Refuser</button>
                  </form>
                ) : (
                  <p className="text-xs text-ink-light mt-3">Vous avez déjà voté.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-ink-light text-sm">Aucune candidature en attente.</p>
      )}
    </main>
  );
}