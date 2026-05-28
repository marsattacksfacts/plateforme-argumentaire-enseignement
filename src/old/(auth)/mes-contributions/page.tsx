import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MesContributionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return redirect("/connexion");

  const { data: argumentaires } = await supabase
    .from("argumentaires").select("*").eq("author_id", profile.id).order("created_at", { ascending: false });

  const statusLabels: Record<string, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "badge-neutral" },
    published: { label: "Publié", cls: "badge-ok" },
    published_flagged: { label: "Publié (sources)", cls: "badge-ok" },
    suspended: { label: "Suspendu", cls: "badge-urgent" },
    rejected: { label: "Rejeté", cls: "badge-urgent" },
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl mb-2">Mes contributions</h1>
      <p className="text-sm text-ink-light mb-8">
        {argumentaires?.length || 0} argumentaire{(argumentaires?.length || 0) > 1 ? "s" : ""}
      </p>

      {argumentaires && argumentaires.length > 0 ? (
        <div className="grid gap-4">
          {argumentaires.map((a) => {
            const status = statusLabels[a.status] || { label: a.status, cls: "badge-neutral" };
            return (
              <div key={a.id} className="card-brut card-a flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-base text-ink">{a.title}</span>
                  <p className="text-[10px] text-ink-light mt-0.5 font-medium tracking-wide uppercase">
                    {new Date(a.created_at).toLocaleDateString("fr-BE")}
                  </p>
                </div>
                <span className={`badge-brut ${status.cls} text-[10px] px-2 py-0.5 flex-shrink-0`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-ink-light text-base font-medium tracking-wide uppercase mb-4">
            Aucune contribution pour le moment.
          </p>
          <Link href="/soumettre" className="btn-primary text-xs">Soumettre un argumentaire</Link>
        </div>
      )}
    </main>
  );
}