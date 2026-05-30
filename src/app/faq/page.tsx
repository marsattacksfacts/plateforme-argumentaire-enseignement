import Link from "next/link";

const FAQ = [
  {
    q: "Doit-on remplir un formulaire si on écrit un courrier ?",
    r: "Non, le but est de collecter les courriers et de les déposer à une halte sur le parcours."
  },
  {
    q: "Si on a besoin d'un logement à Huy, à Gembloux ou à Bruxelles, comment faire ?",
    r: "Il faut le mentionner dans le formulaire et on met les personnes qui proposent un logement avec celles qui en souhaiteraient un."
  },
  {
    q: "Quel vélo est nécessaire ?",
    r: "Tout est accepté (musculaire/électrique, de course/de route/VTT/VTC). Le parcours aura lieu sur tarmac, avec une volonté un max d'être sur Ravel. Aucune performance physique ne sera encouragée."
  },
  {
    q: "Comment connaître la difficulté du parcours ?",
    r: "Sur le site, on retrouve la mention des dénivelés et les km associés à chaque tronçon."
  },
  {
    q: "Puis-je ne pas participer à l'ensemble du parcours ?",
    r: "Bien sûr : lors de l'inscription, on choisit le tronçon qui convient à nos disponibilités et à notre condition."
  },
  {
    q: "Serons-nous nombreux ?",
    r: "On l'espère ! Pour avoir une idée, le nombre d'inscrit·es est mentionné et actualisé sur la page d'accueil."
  },
  {
    q: "Que faire pour préparer une halte ?",
    r: "Pas mal de tâches sont possibles : récolter du courrier à ramener, organiser pour la rendre exceptionnelle/chaleureuse/militante – ravitaillement, mise en scène du dépôt du courrier, musique, écriture de courrier."
  },
  {
    q: "Comment connaître l'horaire des haltes ?",
    r: "Via « parcours » sur la page d'accueil : lieu, heure de rassemblement, arrivée des cyclistes et leur départ y sont mentionnés."
  },
  {
    q: "Comment suivre l'évolution des données ?",
    r: "L'événement Facebook créé peut être une opportunité. Ce serait génial d'avoir un suivi en direct style Tour de France… Wait and see 🙂"
  },
  {
    q: "Comment les lettres sont-elles transportées ?",
    r: "Via des sacoches et sacs personnels des cyclistes. À la fin de la journée, elles seront rassemblées dans la voiture."
  },
  {
    q: "Quel matériel avoir en tant que cycliste ?",
    r: "Anticiper un maximum les fringales, les petits bobos et avoir de l'eau. Des ravitaillements s'organisent."
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">
          S&apos;inscrire
        </Link>
      </nav>

      {/* CONTENU */}
      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 mb-8">
          FAQ
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-10">
          Foire aux questions
        </h1>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details key={i} className="group border border-black/10 bg-white">
              <summary className="px-5 py-4 cursor-pointer hover:bg-[#F5F0E8] font-medium text-sm flex items-center justify-between select-none">
                <span>{item.q}</span>
                <span className="text-[#C0440E] text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-[#3D3530] leading-relaxed border-t border-black/5 pt-3">
                {item.r}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1917] border-t border-white/10 px-4 md:px-8 py-6 text-xs text-[#F5F0E8]/50">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-3">
          <p><strong className="text-[#F5F0E8]/80">Facteur·ices à bicyclette</strong> — Périple épiscolaire 2026<br />Initiative indépendante · Collectif de Coordination Liège-Régional</p>
          <p className="text-right">
            <Link href="/code-ethique" className="underline hover:text-[#F5F0E8]/80 transition-colors">Code éthique</Link> · <Link href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">Politique de confidentialité</Link><br />
            <Link href="/admin/login" className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/50 transition-colors">Admin</Link>
          </p>
        </div>
      </footer>

    </main>
  );
}