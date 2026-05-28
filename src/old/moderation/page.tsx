import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) return redirect("/");

  const { data: pending } = await supabase.from("argumentaires").select("id, title, author_id, created_at").eq("status", "pending").order("created_at", { ascending: true });
  const { data: suspended } = await supabase.from("argumentaires").select("id, title, author_id, created_at").eq("status", "suspended").order("updated_at", { ascending: false });
  const { data: amendments } = await supabase.from("amendments").select("id, argumentaire_id, author_id, created_at").eq("status", "pending").order("created_at", { ascending: true });
  const { data: candidatures } = await supabase.from("moderator_applications").select("id, user_id, motivation_text, created_at").eq("status", "pending").order("created_at", { ascending: true });

  const authorIds = [...(pending?.map((a) => a.author_id) || []), ...(suspended?.map((a) => a.author_id) || []), ...(amendments?.map((a) => a.author_id) || []), ...(candidatures?.map((c) => c.user_id) || [])].filter(Boolean);
  const { data: profiles } = await supabase.from("profiles").select("id, pseudonym").in("id", authorIds);

  const getPseudo = (id: string | null) => id ? profiles?.find((p) => p.id === id)?.pseudonym || "Inconnu" : "Anonyme";

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-8">Modération</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-serif font-black text-xl mb-3 flex items-center gap-2">
            En attente
            {pending && pending.length > 0 && <span className="badge-brut badge-urgent text-[10px]">{pending.length}</span>}
          </h2>
          {pending && pending.length > 0 ? (
            <div className="grid gap-3">
              {pending.map((a) => (
                <Link key={a.id} href={`/moderation/argumentaire/${a.id}`} className="card-brut card-a block">
                  <span className="font-bold text-sm text-ink">{a.title}</span>
                  <p className="text-[10px] text-ink-light mt-1 font-medium tracking-wide uppercase">
                    par {getPseudo(a.author_id)} — {new Date(a.created_at).toLocaleDateString("fr-BE")}
                  </p>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-ink-light">File vide.</p>}
        </section>

        <section>
          <h2 className="font-serif font-black text-xl mb-3 flex items-center gap-2">
            Suspendus
            {suspended && suspended.length > 0 && <span className="badge-brut badge-urgent text-[10px]">{suspended.length}</span>}
          </h2>
          {suspended && suspended.length > 0 ? (
            <div className="grid gap-3">
              {suspended.map((a) => (
                <Link key={a.id} href={`/moderation/argumentaire/${a.id}`} className="card-brut card-a block">
                  <span className="font-bold text-sm text-ink">{a.title}</span>
                  <p className="text-[10px] text-ink-light mt-1 font-medium tracking-wide uppercase">
                    par {getPseudo(a.author_id)}
                  </p>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-ink-light">Aucun suspendu.</p>}
        </section>

        <section>
          <h2 className="font-serif font-black text-xl mb-3 flex items-center gap-2">
            Amendements
            {amendments && amendments.length > 0 && <span className="badge-brut badge-ok text-[10px]">{amendments.length}</span>}
          </h2>
          {amendments && amendments.length > 0 ? (
            <div className="grid gap-3">
              {amendments.map((a) => (
                <Link key={a.id} href={`/moderation/amendement/${a.id}`} className="card-brut card-a block">
                  <span className="font-bold text-sm text-ink">Amendement #{a.id.slice(0, 8)}</span>
                  <p className="text-[10px] text-ink-light mt-1 font-medium tracking-wide uppercase">
                    par {getPseudo(a.author_id)} — {new Date(a.created_at).toLocaleDateString("fr-BE")}
                  </p>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-ink-light">Aucun amendement.</p>}
        </section>

        <section>
          <h2 className="font-serif font-black text-xl mb-3 flex items-center gap-2">
            Candidatures
            {candidatures && candidatures.length > 0 && <span className="badge-brut badge-ok text-[10px]">{candidatures.length}</span>}
          </h2>
          {candidatures && candidatures.length > 0 ? (
            <div className="grid gap-3">
              {candidatures.map((c) => (
                <Link key={c.id} href="/moderation/candidatures" className="card-brut card-a block">
                  <span className="font-bold text-sm text-ink">{getPseudo(c.user_id)}</span>
                  <p className="text-[10px] text-ink-light mt-1 line-clamp-2">{c.motivation_text}</p>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-ink-light">Aucune candidature.</p>}
        </section>
      </div>
    </main>
  );
}