"use client";

import Link from "next/link";

// Structure d'un article de presse
type ArticlePresse = {
  id: number;
  date: string;
  media: string;
  titre: string;
  url: string;
  description?: string; // optionnel, si tu veux ajouter un petit commentaire
};

// Liste des articles (à compléter au fur et à mesure)
const articles: ArticlePresse[] = [
  {
    id: 1,
    date: "2026-06-01",
    media: "Qu4tre",
    titre: "Des enseignants débutent un périple de 168 km à vélo pour livrer leurs revendications",
    url: "https://www.qu4tre.be/infos/enseignement/des-enseignants-debutent-un-periple-de-168-km-velo-pour-livrer-leurs-revendications/2014665",
  },
  {
    id: 2,
    date: "2026-06-01",
    media: "RTBF info",
    titre: "Profs et élèves relient Liège à Bruxelles à vélo",
    url: "https://www.facebook.com/share/v/1ERBTuFbbC/",
  },
  {
    id: 3,
    date: "2026-06-01",
    media: "DH net",
    titre: "Profs en colère : ils roulent 168 km de Verviers à Bruxelles pour livrer des milliers de lettres à la ministre",
    url: "https://www.dhnet.be/regions/liege/2026/06/01/profs-en-colere-ils-roulent-168-km-de-verviers-a-bruxelles-pour-livrer-des-milliers-de-lettres-a-la-ministre-photos-ZC7SCNHZ3NB2TMH3JZXM6HPQJU/?utm_source=facebook&utm_medium=organic_social&utm_campaign=pimpmysocial&utm_term=dh_liege&fbclid=IwY2xjawSLQiFleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA80MDk5NjI2MjMwODU2MDkAAR636QYbf4HsXSumcgYuikau_p6WrfReZGpia4Cl_ZWaFspJxV6QQnHRU9xAeQ_aem_Xm0a3zlWoIfYokPbUquZxQ", // Remplace par le vrai lien
  },
  {
    id: 4,
    date: "2026-06-01",
    media: "VEDIA",
    titre: "Un périple à vélo de 168 kms jusque Bruxelles",
    url: "https://www.facebook.com/share/r/19FTuDXMqh/",
  },
  {
    id: 5,
    date: "2026-06-01",
    media: "L'Avenir",
    titre: "Les facteurs à bicyclette partis de Verviers pour déposer des lettres au parlement : On va le gagner comme en 1936, ce combat",
    url: "https://www.lavenir.net/regions/verviers/verviers/2026/06/01/les-facteurs-a-bicyclette-partis-de-verviers-pour-deposer-des-lettres-au-parlement-on-va-le-gagner-comme-en-1936-ce-combat-photos-video-YTFOX5RYKFDUPNC7PSH3L5PMSE/",
  },
  {
    id: 5,
    date: "2026-06-01",
    media: "Today in Liège",
    titre: "Des « facteurs » à bicyclette pour amener le courrier de milliers d'enseignants, élèves et parents mécontents jusqu'à la ministre de l'Enseignement",
    url: "https://www.todayinliege.be/des-facteurs-a-bicyclette-pour-amener-le-courrier-de-milliers-denseignants-eleves-et-parents-mecontents-jusqua-la-ministre-de-lenseignement/",
  }
];

// Trier du plus récent au plus ancien
const articlesTries = [...articles].sort((a, b) => 
  new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default function PressePage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      {/* Navigation simplifiée */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80">
          <p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/live" className="text-[#6B6459] hover:text-[#C0440E]">Suivi live</Link>
          <Link href="/presse" className="text-[#C0440E] font-medium">Presse</Link>
        </div>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-4">Presse</h1>
        <p className="text-[#6B6459] mb-10 border-l-2 border-[#C0440E] pl-4">
          Ils parlent de nous · Sélection d'articles
        </p>

        {/* Liste des articles */}
        <div className="space-y-6">
          {articlesTries.map((article) => (
            <article 
              key={article.id} 
              className="bg-white border border-black/10 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6459] mb-2">
                <span className="font-bold text-[#C0440E]">{article.media}</span>
                <span>•</span>
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString("fr-BE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              
              <h2 className="font-serif text-xl font-bold mb-2">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#C0440E] transition-colors"
                >
                  {article.titre}
                </a>
              </h2>
              
              {article.description && (
                <p className="text-[#6B6459] text-sm mb-3">{article.description}</p>
              )}
              
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#C0440E] hover:underline"
              >
                Lire l'article
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </article>
          ))}
        </div>

        {/* Message si aucun article */}
        {articles.length === 0 && (
          <div className="bg-white border border-black/10 p-12 text-center">
            <p className="text-[#6B6459]">Aucun article pour le moment. Revenez bientôt !</p>
          </div>
        )}
      </section>
    </main>
  );
}