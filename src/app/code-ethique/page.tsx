import Link from "next/link";

export default function CodeEthiquePage() {
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
          Code éthique
        </span>

        <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-10">
          Nos principes
        </h1>

        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[#3D3530]">
          <p>
            Comme dans toutes les actions estampillées <strong className="text-[#1C1917]">« Mars Attacks »</strong>, chacun·e est libre de venir comme iel est et d'afficher, ou non, son appartenance à une école, un syndicat, un parti démocratique de gauche (PS, PTB, Ecolo), une association. L'action n'est absolument pas « apolitique ». Nous avancerons portés par un idéal de société et cela, évidemment, c'est politique.
          </p>

          <p>
            Les déplacements sont susceptibles d'être rejoints, spontanément, par des mineurs. L'organisation décline toute responsabilité sur ceux-ci et ils restent sous la responsabilité de leurs tuteurs légaux comme lors de leurs déplacements quotidiens.
          </p>

          <p>
            Les déplacements se feront sur la voie publique en respectant la réglementation routière qui incombe aux cyclistes. Les pelotons seront limités à <strong className="text-[#1C1917]">150 cyclistes</strong> encadrés par des capitaines de route clairement identifiables au moyen d'un brassard jaune. Aucune dimension de compétition sportive (vitesse, prise de risque, itinéraires sauvages) ne sera encouragée. Chaque participant reste libre et responsable de son attitude sur la route comme il l'est, de manière générale, sur la voie publique.
          </p>

          <p>
            Dans un souci d'organisation, les personnes souhaitant se joindre à un déplacement se signaleront aux capitaines afin de répartir les cyclistes au sein des pelotons. Les capitaines ne prennent pas la responsabilité des cyclistes en cas d'accident mais veilleront à installer les conditions nécessaires à un déplacement à une allure moyenne de <strong className="text-[#1C1917]">13 km/h</strong>.
          </p>

          <p>
            Les cyclistes sont eux-mêmes en charge de leur matériel, de leur équipement de réparation et anticipent la nécessité de s'hydrater, s'alimenter durant le déplacement.
          </p>

          <p>
            Après leur participation au déplacement, les cyclistes sont responsables de rejoindre, individuellement ou non, leur point de départ par le moyen qu'ils souhaitent (voiture, train…), ils veilleront, dans ce cadre, à se conformer à l'ordre public.
          </p>

          <p>
            Pour les deux nuits à Huy et à Gembloux, nous tentons de faire correspondre des propositions d'hébergement avec des demandes. Nous ne sommes pas une agence de voyage : votre responsabilité reste pleine et entière, que vous soyez hébergeur ou hébergé.
          </p>

          <p>
            Les lettres collectées et remises au Parlement de la Fédération Wallonie-Bruxelles s'inscrivent dans le cadre d'un dialogue démocratique. Quoique véhiculées par les Facteur·ices à bicyclette, elles restent une émanation de leur signataire (individu ou organisation). En aucun cas l'organisation ne pourra se montrer solidaire de messages injurieux, intimidants ou de toute forme de harcèlement.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-black/10">
          <Link
            href="/inscription"
            className="bg-[#C0440E] text-white font-medium px-7 py-3 hover:bg-[#8A2E06] transition-colors inline-block"
          >
            J'ai lu et j'accepte le code éthique → S'inscrire
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