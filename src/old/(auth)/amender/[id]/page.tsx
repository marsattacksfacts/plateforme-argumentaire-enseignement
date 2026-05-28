import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AmenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return redirect("/connexion");

  const { data: argumentaire } = await supabase
    .from("argumentaires").select("*").eq("id", id).in("status", ["published", "published_flagged"]).single();

  if (!argumentaire) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="font-serif font-black text-3xl mb-4">Argumentaire introuvable</h1>
        <Link href="/argumentaires" className="btn-primary text-xs">← Retour</Link>
      </main>
    );
  }

  const { data: argKeywords } = await supabase.from("argumentaire_keywords").select("keywords(label)").eq("argumentaire_id", id);
  const existingKeywords = argKeywords?.map((k: any) => k.keywords?.label).join(", ") || "";

  const { data: existingSources } = await supabase.from("sources").select("url, label").eq("argumentaire_id", id);
  const existingSourcesText = existingSources?.map((s) => `${s.label || ""} ${s.url}`.trim()).join("\n") || "";

  async function submitAmendment(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
    if (!profile) return redirect("/connexion");

    const argId = formData.get("argumentaire_id") as string;
    const body = formData.get("body") as string;
    const sourcesRaw = formData.get("sources") as string;

    if (!body || body.length < 10) return redirect(`/amender/${argId}?error=Texte trop court`);

    const sourceLines = sourcesRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const proposedSources = sourceLines.map((line) => {
      const match = line.match(urlRegex);
      if (match) {
        const url = match[0];
        const label = line.replace(url, "").trim().replace(/,\s*$/, "");
        return { label: label || url, url };
      }
      return { label: line, url: "" };
    });

    await supabase.from("amendments").insert({
      argumentaire_id: argId,
      proposed_body: body,
      proposed_sources: JSON.stringify(proposedSources),
      author_id: profile.id,
      status: "pending",
    });

    return redirect(`/argumentaires/${argId}?success=Amendement soumis pour validation`);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/argumentaires/${id}`} className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-4 inline-block">
        ← Retour à l&apos;argumentaire
      </Link>

      <h1 className="font-serif font-black text-3xl mb-2">Proposer un amendement</h1>
      <p className="text-sm text-ink-light mb-8">
        Vous modifiez : <span className="font-bold text-ink">{argumentaire.title}</span>
      </p>

      <form action={submitAmendment} className="space-y-6">
        <input type="hidden" name="argumentaire_id" value={id} />

        <div>
          <label htmlFor="body" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Texte modifié <span className="text-brick">*</span></label>
          <p className="text-[10px] text-ink-light mb-1">Modifiez le texte. Les changements seront visibles en diff pour les modérateur·rices.</p>
          <textarea id="body" name="body" rows={14} required minLength={10} className="input-brut" defaultValue={argumentaire.body} />
        </div>

        <div>
          <label htmlFor="sources" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Sources</label>
          <p className="text-[10px] text-ink-light mb-1">Une source par ligne. Format : Label https://url.com</p>
          <textarea id="sources" name="sources" rows={4} className="input-brut text-sm" defaultValue={existingSourcesText} />
        </div>

        <button type="submit" className="btn-primary w-full text-center">Soumettre l&apos;amendement</button>
      </form>
    </main>
  );
}