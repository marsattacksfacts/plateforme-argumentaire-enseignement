import Link from "next/link";

const FAQS = [
  {
    q: "Dois-je m'inscrire pour consulter les argumentaires ?",
    r: "Non. La consultation est libre et sans inscription. L'inscription n'est nécessaire que si vous souhaitez soumettre un argumentaire, proposer un amendement ou candidater comme modérateur·rice.",
  },
  {
    q: "Pourquoi ne demandez-vous pas d'adresse email ?",
    r: "C'est un choix délibéré. Nous voulons garantir un maximum d'anonymat et de protection des utilisateur·rices. Votre pseudonyme est votre seul identifiant.",
  },
  {
    q: "Puis-je rester anonyme en tant qu'auteur·rice ?",
    r: "Oui. Lors de l'inscription, vous choisissez si votre profil est public ou anonyme. Les modérateur·rices peuvent aussi choisir d'afficher ou non leur nom.",
  },
  {
    q: "Comment un argumentaire est-il validé ?",
    r: "Il faut au moins 2 votes favorables de modérateur·rices et un ratio d'au moins 2 pour 1 contre. Trois critères sont évalués : légalité, pertinence et sources.",
  },
  {
    q: "Qui sont les modérateur·rices ?",
    r: "Des utilisateur·rices qui ont candidaté et ont été validé·es par 3 modérateur·rices existant·es. N'importe qui peut candidater.",
  },
  {
    q: "Puis-je modifier un argumentaire existant ?",
    r: "Oui, via le système d'amendements. Proposez une version modifiée, elle sera soumise au même circuit de validation. L'historique est conservé.",
  },
  {
    q: "Le site est-il vraiment indépendant ?",
    r: "Oui. Aucune affiliation à un syndicat ou parti politique. Code source public sur GitHub.",
  },
];

export default function FAQPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-2">Foire aux questions</h1>
      <p className="text-sm text-ink-light mb-10">
        Vous ne trouvez pas votre réponse ?{" "}
        <Link href="/a-propos" className="underline decoration-brick hover:text-brick transition-colors font-medium">
          La page À propos
        </Link>{" "}
        explique le fonctionnement général.
      </p>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <details key={i} className="group border-b-2 border-concrete pb-3">
            <summary className="cursor-pointer font-bold text-base py-2 group-open:text-brick transition-colors list-none flex items-center gap-2">
              <span className="text-concrete group-open:hidden text-xs">▸</span>
              <span className="text-concrete hidden group-open:inline text-xs">▾</span>
              {faq.q}
            </summary>
            <p className="mt-2 text-ink-light leading-relaxed pl-5">{faq.r}</p>
          </details>
        ))}
      </div>

      <hr className="rule-thick mt-12" />
    </main>
  );
}