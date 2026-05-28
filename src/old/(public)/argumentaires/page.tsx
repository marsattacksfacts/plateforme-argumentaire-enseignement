import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const CARD_VARIANTS = ["a", "b", "c", "d", "e"] as const;

function getVariant(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return `card-${CARD_VARIANTS[Math.abs(hash) % CARD_VARIANTS.length]}`;
}

const FILTRES = [
  { slug: "", label: "Tous" },
  { slug: "teachers", label: "Enseignant·es" },
  { slug: "parents", label: "Parents" },
  { slug: "students", label: "Élèves" },
  { slug: "public", label: "Grand public" },
];

export default async function ArgumentairesPage({
  searchParams,
}: {
  searchParams: Promise<{ public?: string; motcle?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("argumentaires")
    .select("id, title, target_audience, reponse_a, created_at, status")
    .in("status", ["published", "published_flagged"])
    .order("created_at", { ascending: false });

  if (sp.public) {
    query = query.eq("target_audience", sp.public);
  }

  const { data: argumentaires } = await query;

  const { data: keywords } = await supabase
    .from("keywords")
    .select("label, slug")
    .order("label");

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-2">
        Argumentaires
      </h1>
      <p className="text-sm text-ink-light font-medium tracking-wide uppercase mb-8">
        {argumentaires?.length || 0} argumentaire{(argumentaires?.length || 0) > 1 ? "s" : ""} publié{(argumentaires?.length || 0) > 1 ? "s" : ""}
      </p>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTRES.map((f) => {
          const isActive = (sp.public || "") === f.slug;
          return (
            <Link
              key={f.slug || "tous"}
              href={`/argumentaires${f.slug ? `?public=${f.slug}` : ""}`}
              className={`badge-brut transition-all ${
                isActive ? "badge-ok" : "badge-neutral hover:bg-concrete"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Liste */}
      {argumentaires && argumentaires.length > 0 ? (
        <div className="grid gap-6">
          {argumentaires.map((a) => (
            <Link
              key={a.id}
              href={`/argumentaires/${a.id}`}
              className={`card-brut ${getVariant(a.id)} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="flex-1">
                <span className="font-bold text-base text-ink">
                  {a.title}
                </span>
                {a.reponse_a && (
                  <p className="text-xs text-ink-light mt-1 italic font-serif">
                    En réponse à : « {a.reponse_a} »
                  </p>
                )}
                <p className="text-[10px] text-ink-light mt-1 font-medium tracking-wide uppercase">
                  {new Date(a.created_at).toLocaleDateString("fr-BE")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="badge-brut badge-neutral text-[10px] px-2 py-0.5">
                  {a.target_audience === "public" ? "Grand public" : a.target_audience}
                </span>
                {a.status === "published_flagged" && (
                  <span className="badge-brut badge-urgent text-[10px] px-2 py-0.5">
                    Sources
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-ink-light text-base font-medium tracking-wide uppercase">
            Aucun argumentaire pour ce filtre.
          </p>
        </div>
      )}

      {/* Mots-clés */}
      {keywords && keywords.length > 0 && (
        <>
          <hr className="rule-thick mt-12 mb-6" />
          <h2 className="font-serif font-black text-xl mb-4">Mots-clés</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Link
                key={kw.slug}
                href={`/argumentaires?motcle=${kw.slug}`}
                className="badge-brut badge-neutral hover:bg-concrete transition-colors"
              >
                {kw.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}