import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ArgumentairePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: argumentaire } = await supabase
    .from("argumentaires")
    .select("*")
    .eq("id", id)
    .in("status", ["published", "published_flagged"])
    .single();

  if (!argumentaire) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif font-black text-3xl mb-4">Argumentaire non trouvé</h1>
        <p className="text-ink-light mb-6">
          Cet argumentaire n&apos;existe pas ou n&apos;a pas encore été validé.
        </p>
        <Link href="/argumentaires" className="btn-primary text-xs">
          ← Voir tous les argumentaires
        </Link>
      </main>
    );
  }

  const { data: author } = argumentaire.author_id
    ? await supabase
        .from("profiles")
        .select("pseudonym, is_public_profile")
        .eq("id", argumentaire.author_id)
        .single()
    : { data: null };

  const authorName =
    author?.is_public_profile !== false
      ? author?.pseudonym || "Anonyme"
      : "Auteur·rice anonyme";

  const { data: argKeywords } = await supabase
    .from("argumentaire_keywords")
    .select("keywords(label)")
    .eq("argumentaire_id", id);

  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .eq("argumentaire_id", id);

  const { data: allForVotes } = await supabase
    .from("moderation_votes")
    .select("is_public, profiles(pseudonym)")
    .eq("target_id", id)
    .eq("target_type", "argumentaire")
    .eq("vote", "for");

  const { data: versions } = await supabase
    .from("argumentaire_versions")
    .select("version, created_at, profiles(pseudonym)")
    .eq("argumentaire_id", id)
    .order("version", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/argumentaires"
        className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Argumentaires
      </Link>

      {sp.success && (
        <div className="bg-ochre-light border-l-4 border-ochre text-ink p-4 mb-6 text-sm font-medium">
          {sp.success}
        </div>
      )}

      {argumentaire.status === "published_flagged" && (
        <div className="bg-brick-light border-l-4 border-brick text-ink p-4 mb-6 text-sm font-medium">
          ⚠️ Cet argumentaire a été validé mais les sources sont jugées insuffisantes. Vous pouvez proposer un amendement pour les compléter.
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-serif font-black text-3xl sm:text-4xl leading-tight mb-3">
          {argumentaire.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-light font-medium tracking-wide uppercase">
          <span>par {authorName}</span>
          <span className="text-concrete">|</span>
          <span>{new Date(argumentaire.created_at).toLocaleDateString("fr-BE")}</span>
          {allForVotes && allForVotes.length > 0 && (
            <>
              <span className="text-concrete">|</span>
              <span className="text-brick font-bold">
                Validé par {allForVotes.length} modérateur·rice{allForVotes.length > 1 ? "s" : ""}
              </span>
              {(() => {
                const publicNames = allForVotes
                  .filter((v: any) => v.is_public && v.profiles?.pseudonym)
                  .map((v: any) => v.profiles.pseudonym);
                if (publicNames.length > 0) {
                  return (
                    <span className="text-ink-light normal-case font-normal">
                      (dont {publicNames.join(", ")})
                    </span>
                  );
                }
                return null;
              })()}
            </>
          )}
        </div>
      </div>

      <hr className="rule-thick mb-8" />

      {/* En réponse à */}
      {argumentaire.reponse_a && (
        <div className="quote-block mb-8">
          <span className="text-[10px] uppercase tracking-wide font-bold text-brick">En réponse à</span>
          <p className="mt-1 font-serif italic text-lg">« {argumentaire.reponse_a} »</p>
        </div>
      )}

      {/* Corps */}
      <div className="prose-brut mb-10 whitespace-pre-wrap">
        {argumentaire.body}
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap gap-3 mb-10">
        <div className="space-y-2">
          {argKeywords && argKeywords.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light block mb-1">Mots-clés</span>
              <div className="flex flex-wrap gap-1">
                {argKeywords.map((k: any, i: number) => (
                  <span key={i} className="badge-brut badge-neutral text-[10px] px-2 py-0.5">
                    {k.keywords?.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <span className="text-[10px] uppercase tracking-wide font-bold text-ink-light block mb-1">Public cible</span>
            <span className="badge-brut badge-ok text-[10px] px-2 py-0.5">
              {argumentaire.target_audience === "public" ? "Grand public" : argumentaire.target_audience}
            </span>
          </div>
        </div>
      </div>

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="mb-10">
          <h2 className="font-serif font-black text-xl mb-3">Sources</h2>
          <ul className="space-y-1.5">
            {sources.map((s) => (
              <li key={s.id} className="text-sm">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline decoration-brick decoration-2 underline-offset-2 hover:text-brick transition-colors break-all"
                  >
                    {s.label || s.url}
                  </a>
                ) : (
                  <span className="text-ink-light">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Historique */}
      {versions && versions.length > 1 && (
        <details className="mb-10 group">
          <summary className="cursor-pointer font-serif font-black text-xl mb-3 list-none flex items-center gap-2">
            <span className="text-xs text-concrete group-open:hidden">▸</span>
            <span className="text-xs text-concrete hidden group-open:inline">▾</span>
            Historique ({versions.length} versions)
          </summary>
          <ul className="mt-3 space-y-2 pl-4 border-l-2 border-concrete">
            {versions.map((v) => (
              <li key={v.version} className="text-sm">
                <Link
                  href={`/argumentaires/${id}/version/${v.version}`}
                  className="text-ink underline decoration-brick decoration-1 underline-offset-2 hover:text-brick transition-colors font-medium"
                >
                  Version {v.version}
                </Link>
                <span className="text-ink-light ml-2 text-xs">
                  — {new Date(v.created_at).toLocaleDateString("fr-BE")}
                </span>
                {(v.profiles as any)?.pseudonym && (
                  <span className="text-ink-light text-xs">
                    {" "}par {(v.profiles as any).pseudonym}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Proposer un amendement */}
      <hr className="rule-thick mb-6" />
      <div>
        <h2 className="font-serif font-black text-xl mb-3">Proposer un amendement</h2>
        {user ? (
          <Link href={`/amender/${id}`} className="btn-primary text-xs">
            Modifier cet argumentaire
          </Link>
        ) : (
          <p className="text-sm text-ink-light">
            <Link href="/connexion" className="underline decoration-brick hover:text-brick transition-colors font-medium">
              Connectez-vous
            </Link>{" "}
            pour proposer un amendement.
          </p>
        )}
      </div>
    </main>
  );
}