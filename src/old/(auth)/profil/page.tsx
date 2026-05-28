import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return redirect("/connexion");

  const roleLabels: Record<string, string> = {
    user: "Utilisateur·rice",
    moderator: "Modérateur·rice",
    admin: "Administrateur·rice",
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl mb-8">Profil</h1>

      <div className="card-brut card-a space-y-5">
        <div>
          <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light">Pseudonyme</span>
          <p className="font-bold text-lg text-ink">{profile.pseudonym}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light">Rôle</span>
          <p><span className="badge-brut badge-neutral text-[10px]">{roleLabels[profile.role] || profile.role}</span></p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light">Visibilité</span>
          <p className="text-ink-light">{profile.is_public_profile ? "Profil public" : "Profil anonyme"}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light">Inscrit·e depuis</span>
          <p className="text-ink-light">
            {new Date(profile.created_at).toLocaleDateString("fr-BE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link href="/mes-contributions" className="btn-secondary text-xs text-center">Mes contributions</Link>
        {profile.role === "user" && (
          <Link href="/candidater-moderateur" className="btn-secondary text-xs text-center">Devenir modérateur</Link>
        )}
      </div>
    </main>
  );
}