import Link from "next/link";

export default function AProposPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-2">À propos</h1>
      <hr className="rule-accent mb-8" />

      <section className="space-y-8 text-ink-light leading-relaxed">
        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Qui sommes-nous ?</h2>
          <p>
            Cette plateforme est une initiative personnelle et indépendante,
            née dans le cadre du mouvement des enseignant·es de la Fédération
            Wallonie-Bruxelles. Elle ne porte ni les couleurs d&apos;un syndicat,
            ni celles d&apos;un parti politique.
          </p>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Notre mission</h2>
          <p>
            Centraliser et valider collectivement des argumentaires pour
            outiller les enseignant·es, les parents, les élèves et toute
            personne confrontée aux discours gouvernementaux ou aux idées
            reçues sur l&apos;école publique.
          </p>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Comment ça fonctionne ?</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong className="text-ink">Soumettez</strong> un argumentaire ou un amendement.</li>
            <li><strong className="text-ink">Des modérateur·rices</strong> issu·es du mouvement valident les contenus.</li>
            <li><strong className="text-ink">Une fois validé</strong>, l&apos;argumentaire est publié et accessible à toutes et tous.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Transparence</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-brick mt-1">▸</span>
              <span><strong className="text-ink">Code source</strong> public sur{" "}
                <a href="https://github.com/marsattacksfacts/plateforme-argumentaire-enseignement" target="_blank" rel="noopener noreferrer" className="underline decoration-brick hover:text-brick transition-colors">GitHub</a>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brick mt-1">▸</span>
              <span><strong className="text-ink">Aucune publicité</strong>, aucun tracker, aucun analytics.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brick mt-1">▸</span>
              <span><strong className="text-ink">Politique de confidentialité</strong> honnête et détaillée.</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Qui est derrière tout ça ?</h2>
          <p>
            La plateforme a été initiée par <strong className="text-ink">Laurent Maquet</strong>,
            enseignant et citoyen engagé. Le développement est open source et toute
            personne souhaitant contribuer est la bienvenue.
          </p>
        </div>
      </section>

      <hr className="rule-thick mt-12" />
    </main>
  );
}