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

const CIBLE_MAP: Record<string, string> = {
  enseignants: "teachers",
  parents: "parents",
  élèves: "students",
  "grand-public": "public",
};

const CIBLE_LABELS: Record<string, string> = {
  teachers: "Enseignant·es",
  parents: "Parents",
  students: "Élèves",
  public: "Grand public",
};

export default async function RubriquePage({
  params,
}: {
  params: Promise<{ cible: string }>;
}) {
  const { cible } = await params;
  const supabase = await createClient();
  const dbCible = CIBLE_MAP[cible] || cible;

  const { data: argumentaires } = await supabase
    .from("argumentaires")
    .select("id, title, reponse_a, created_at, status")
    .in("status", ["published", "published_flagged"])
    .eq("target_audience", dbCible)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-2">
        {CIBLE_LABELS[dbCible] || cible}
      </h1>
      <p className="text-sm text-ink-light font-medium tracking-wide uppercase mb-8">
        {argumentaires?.length || 0} argumentaire{(argumentaires?.length || 0) > 1 ? "s" : ""}
      </p>

      {argumentaires && argumentaires.length > 0 ? (
        <div className="grid gap-6">
          {argumentaires.map((a) => (
            <Link
              key={a.id}
              href={`/argumentaires/${a.id}`}
              className={`card-brut ${getVariant(a.id)} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="flex-1">
                <span className="font-bold text-base text-ink">{a.title}</span>
                {a.reponse_a && (
                  <p className="text-xs text-ink-light mt-1 italic font-serif">
                    En réponse à : « {a.reponse_a} »
                  </p>
                )}
                <p className="text-[10px] text-ink-light mt-1 font-medium tracking-wide uppercase">
                  {new Date(a.created_at).toLocaleDateString("fr-BE")}
                </p>
              </div>
              {a.status === "published_flagged" && (
                <span className="badge-brut badge-urgent text-[10px] px-2 py-0.5 flex-shrink-0">
                  Sources
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-ink-light text-base font-medium tracking-wide uppercase mb-4">
            Aucun argumentaire pour ce public pour le moment.
          </p>
          <Link href="/soumettre" className="btn-primary text-xs">
            Soumettez le premier !
          </Link>
        </div>
      )}

      <hr className="rule-thick mt-12" />
      <Link
        href="/argumentaires"
        className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mt-4 inline-block"
      >
        ← Tous les argumentaires
      </Link>
    </main>
  );
}