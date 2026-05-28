export default function ConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif font-black text-3xl sm:text-4xl mb-2">Politique de confidentialité</h1>
      <hr className="rule-accent mb-8" />

      <section className="space-y-8 text-ink-light leading-relaxed">
        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Ce que nous ne collectons pas</h2>
          <ul className="space-y-1">
            {["Adresse email (non obligatoire)", "Nom réel", "Adresse IP stockée dans la base applicative", "Données de géolocalisation", "Trackers ou analytiques comportementales"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brick mt-1">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Ce que nous stockons</h2>
          <ul className="space-y-1">
            {["Un pseudonyme choisi par vous", "Le hash de votre mot de passe (jamais en clair)", "Le hash de votre email si vous le fournissez", "Le contenu de vos contributions"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brick mt-1">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-serif font-black text-xl text-ink mb-2">Limites de l&apos;anonymat</h2>
          <p>
            Supabase est hébergé sur AWS. En cas de réquisition judiciaire, les
            autorités peuvent demander l&apos;accès aux données d&apos;infrastructure.
            Ce risque est théorique mais réel. Pour une protection maximale,
            utilisez un VPN ou Tor.
          </p>
          <p className="mt-2">
            Le code source est public : vous pouvez vérifier que le code fait bien
            ce que nous affirmons.
          </p>
        </div>
      </section>

      <hr className="rule-thick mt-12" />
    </main>
  );
}