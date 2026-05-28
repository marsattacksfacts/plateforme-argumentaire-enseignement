import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CandidaterModerateurPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!profile) return redirect("/connexion");

  const { data: existingApp } = await supabase.from("moderator_applications").select("id, status").eq("user_id", profile.id).maybeSingle();

  if (existingApp && existingApp.status === "pending") {
    return (
      <main className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="font-serif font-black text-3xl mb-4">Candidature en cours</h1>
        <p className="text-ink-light">Votre candidature est en attente de validation.</p>
      </main>
    );
  }

  async function submitApplication(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/connexion");

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
    if (!profile) return redirect("/connexion");

    const motivation = formData.get("motivation") as string;
    if (!motivation || motivation.length < 50) {
      return redirect("/candidater-moderateur?error=Motivation trop courte (min 50 caractères)");
    }

    await supabase.from("moderator_applications").insert({ user_id: profile.id, motivation_text: motivation, status: "pending" });
    return redirect("/profil?message=Candidature envoyée");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl mb-2">Devenir modérateur·rice</h1>
      <p className="text-sm text-ink-light mb-8">Présentez-vous et expliquez votre légitimité pour ce rôle.</p>

      <form action={submitApplication} className="space-y-5">
        <div>
          <label htmlFor="motivation" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">Présentation (min 50 caractères)</label>
          <textarea id="motivation" name="motivation" rows={6} required minLength={50} className="input-brut" placeholder="Qui êtes-vous ? Pourquoi voulez-vous modérer ?" />
        </div>
        <button type="submit" className="btn-primary w-full text-center">Envoyer ma candidature</button>
      </form>
    </main>
  );
}