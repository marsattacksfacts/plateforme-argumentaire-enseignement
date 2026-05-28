import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function VersionPage({
  params,
}: {
  params: Promise<{ id: string; version: string }>;
}) {
  const { id, version } = await params;
  const supabase = await createClient();

  const { data: argVersion } = await supabase
    .from("argumentaire_versions")
    .select("*, profiles(pseudonym)")
    .eq("argumentaire_id", id)
    .eq("version", parseInt(version))
    .single();

  if (!argVersion) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif font-black text-3xl mb-4">Version introuvable</h1>
        <Link href={`/argumentaires/${id}`} className="btn-primary text-xs">
          ← Retour à l&apos;argumentaire
        </Link>
      </main>
    );
  }

  const { data: argumentaire } = await supabase
    .from("argumentaires")
    .select("title, version")
    .eq("id", id)
    .single();

  const currentVersion = argumentaire?.version;
  const isCurrent = currentVersion === argVersion.version;
  const isInitial = argVersion.version === 1;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/argumentaires/${id}`}
        className="text-xs text-ink-light font-medium tracking-wide uppercase hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Retour à l&apos;argumentaire
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif font-black text-2xl sm:text-3xl leading-tight">
            {argumentaire?.title || "Argumentaire"}
          </h1>
          {isCurrent && (
            <span className="badge-brut badge-ok text-[10px]">Version actuelle</span>
          )}
          {isInitial && (
            <span className="badge-brut badge-neutral text-[10px]">Version initiale</span>
          )}
        </div>
        <p className="text-xs text-ink-light font-medium tracking-wide uppercase">
          Version {argVersion.version} —{" "}
          {new Date(argVersion.created_at).toLocaleDateString("fr-BE")}
          {(argVersion.profiles as any)?.pseudonym && (
            <> — modifié par {(argVersion.profiles as any).pseudonym}</>
          )}
        </p>
      </div>

      <hr className="rule-thick mb-8" />

      <div className="prose-brut whitespace-pre-wrap">
        {argVersion.body}
      </div>

      {!isCurrent && (
        <div className="mt-10 pt-6 border-t-2 border-concrete">
          <Link
            href={`/argumentaires/${id}`}
            className="text-sm text-ink underline decoration-brick decoration-2 underline-offset-2 hover:text-brick transition-colors font-medium"
          >
            Voir la version actuelle →
          </Link>
        </div>
      )}
    </main>
  );
}