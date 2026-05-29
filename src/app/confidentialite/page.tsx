import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <Link
          href="/inscription"
          className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors"
        >
          S'inscrire
        </Link>
      </nav>

      {/* CONTENU */}
      <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 mb-8">
          Politique de confidentialité
        </span>

        <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-10">
          Données personnelles
        </h1>

        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[#3D3530]">
          
          {/* Ce que nous collectons */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Ce que nous collectons</h2>
            <p className="mb-3">Pour organiser cet événement, nous avons besoin de certaines informations. Rien de plus que le strict nécessaire logistique :</p>
            <ul className="space-y-2">
              {[
                "Prénom et nom",
                "Adresse email et numéro de téléphone (pour vous contacter)",
                "Ville et nom de votre école",
                "Votre rôle dans l'événement (cycliste, organisateur·rice de halte, hébergeur·se, coordinateur·rice)",
                "Vos disponibilités et parcours choisis",
                "Vos remarques éventuelles",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#C0440E] mt-1 flex-shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que nous ne collectons pas */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Ce que nous ne collectons pas</h2>
            <ul className="space-y-2">
              {[
                "Données de géolocalisation",
                "Trackers ou analytiques comportementales",
                "Cookies publicitaires ou de profilage",
                "Adresse IP stockée dans la base de données",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#C0440E] mt-1 flex-shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Utilisation des données */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Pourquoi nous les collectons</h2>
            <p className="mb-3">Vos données servent exclusivement à :</p>
            <ul className="space-y-2">
              {[
                "Organiser les pelotons, les haltes et l'hébergement",
                "Vous contacter avec des informations pratiques avant et pendant l'événement",
                "Coordonner les passages de relai et la collecte des lettres",
                "Assurer votre sécurité et celle des autres participant·es",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#C0440E] mt-1 flex-shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conservation */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Durée de conservation</h2>
            <p>
              Les données sont conservées jusqu'à la fin de l'événement (juin 2026). Elles seront supprimées dans les 3 mois suivant la clôture, sauf si vous demandez leur suppression anticipée.
            </p>
          </div>

          {/* Partage */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Avec qui les partageons-nous ?</h2>
            <p className="mb-3">Vos données ne sont ni vendues, ni transmises à des tiers, à l'exception de :</p>
            <ul className="space-y-2">
              {[
                "Les coordinateur·rices de l'événement, uniquement pour les besoins logistiques",
                "Les hébergeur·ses, uniquement si vous avez demandé un hébergement (prénom et contact)",
                "Les capitaines de route, pour la gestion des pelotons",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#C0440E] mt-1 flex-shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hébergement */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Où sont-elles stockées ?</h2>
            <p>
              Les données sont hébergées sur <strong className="text-[#1C1917]">Supabase</strong>, une base de données située dans l'Union européenne (AWS Francfort). Supabase applique les standards de sécurité du cloud (chiffrement en transit et au repos). En cas de réquisition judiciaire, les autorités peuvent demander l'accès aux données d'infrastructure. Ce risque est théorique mais réel.
            </p>
          </div>

          {/* Vos droits */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Vos droits</h2>
            <p className="mb-3">Conformément au RGPD, vous disposez :</p>
            <ul className="space-y-2">
              {[
                "D'un droit d'accès à vos données",
                "D'un droit de rectification",
                "D'un droit à l'effacement (droit à l'oubli)",
                "D'un droit à la limitation du traitement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#C0440E] mt-1 flex-shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à l'adresse email utilisée pour les communications de l'événement.
            </p>
          </div>

          {/* Code source */}
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] mb-3">Code source ouvert</h2>
            <p>
              Le code source de cette plateforme est public. Vous pouvez vérifier que le code fait exactement ce que nous affirmons dans cette politique. Le dépôt est accessible via le lien en pied de page.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/10">
          <Link
            href="/inscription"
            className="bg-[#C0440E] text-white font-medium px-7 py-3 hover:bg-[#8A2E06] transition-colors inline-block"
          >
            J'ai compris → S'inscrire
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1917] border-t border-white/10 px-6 py-6 text-xs text-[#F5F0E8]/50">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-between gap-3">
          <p><strong className="text-[#F5F0E8]/80">Facteur·ices à bicyclette</strong> — Périple épiscolaire 2026<br />Initiative indépendante · Collectif de Coordination Liège-Régional</p>
          <p className="text-right">Code source public · Données confidentielles<br />
            <Link href="/code-ethique" className="underline hover:text-[#F5F0E8]/80 transition-colors">Code éthique</Link> · <Link href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">Politique de confidentialité</Link>
          </p>
        </div>
      </footer>

    </main>
  );
}