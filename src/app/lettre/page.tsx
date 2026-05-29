import Link from "next/link";

export default function LettrePage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">
          S&apos;inscrire
        </Link>
      </nav>

      {/* CONTENU */}
      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        {/* Badges de navigation */}
        <div className="flex flex-wrap gap-4 mb-10">
          <a href="#lettre" className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 hover:bg-[#C0440E]/5 transition-colors">
            ✉️ Lettre type
          </a>
          <a href="#cartes" className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 hover:bg-[#C0440E]/5 transition-colors">
            🖼️ Cartes postales
          </a>
        </div>

        <div id="lettre" className="scroll-mt-28">
          <h1 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-10">
            Modèle de lettre
          </h1>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="/lettre/lettre-type.pdf"
              download
              className="bg-[#C0440E] text-white font-medium px-7 py-3 hover:bg-[#8A2E06] transition-colors inline-flex items-center gap-2"
            >
              📄 Télécharger en PDF
            </a>
          </div>


          {/* Lettre */}
          <div className="bg-white border border-black/10 p-6 md:p-10 font-serif text-[0.95rem] leading-relaxed space-y-5 shadow-sm">
            <p className="font-bold text-lg">Madame la Ministre-Présidente,</p>
            <p className="font-bold">Madame la Ministre de l&apos;Education,</p>
            <p className="font-bold">Mesdames les Députées et Messieurs les Députés,</p>

            <p>Depuis presque 3 semaines, l&apos;Enseignement en Fédération Wallonie-Bruxelles connaît une mobilisation historique : des milliers d&apos;enseignant·es sont en grève, mobilisé·es chaque jour devant les écoles pendant que les élèves, par milliers eux aussi, défilent dans les rues en revendiquant le droit à un enseignement de qualité.</p>

            <p>Ce mouvement, soutenu par certaines directions, des parents ou la société civile, n&apos;a, en réalité, rien de spontané : depuis déjà deux ans, le monde de l&apos;enseignement fait entendre sa voix face aux nombreuses mesures jugées délétères que contient le décret-programme. Ces mesures touchent tous les niveaux du parcours d&apos;apprentissage, de la maternelle jusqu&apos;au master. La majorité parlementaire a voté, contre l&apos;opinion publique et enseignante, la fin de la gratuité des repas chauds pour les élèves du primaire, la réduction de moitié des budgets liés à la gratuité scolaire ou encore la fermeture des 7e dans le qualifiant. Désormais, c&apos;est, entre autres, la hausse de 10% de la charge de travail des enseignants du secondaire supérieur, le dégel et l&apos;augmentation du minerval à 1194 euros pour l&apos;ensemble de l&apos;enseignement supérieur qui fait craindre une réelle dévalorisation de l&apos;accessibilité de l&apos;enseignement.</p>

            <p>Ces mesures cumulées entraîneront la perte de plus de 1500 équivalents temps-plein. Elles continueront de creuser les inégalités dans l&apos;enseignement belge, qui est pourtant déjà l&apos;un des plus inégalitaires d&apos;Europe comme en atteste le dernier rapport Équité dans l&apos;éducation et le marché du travail de l&apos;OCDE. Loin de rendre le métier d&apos;enseignant plus attractif, ces mesures aggraveront la pénurie, alors même que les sections pédagogiques se vident partout en Fédération Wallonie-Bruxelles et que 35% des enseignants abandonnent la profession dans les 5 ans qui suivent leur entrée. Ces mesures sont au cœur de la mobilisation qui a fédéré les enseignants, les étudiants et les parents autour du mouvement Mars Attacks.</p>

            <p>Si nous nous vous écrivons aujourd&apos;hui, c&apos;est portés par cette conviction qu&apos;il importe d&apos;accompagner au mieux l&apos;ensemble des élèves actuellement sur les bancs d&apos;école en Fédération Wallonie-Bruxelles et ceux qui leur succèderont. Lorsque l&apos;enseignement est méprisé, sacrifié, c&apos;est l&apos;ensemble de la société qui l&apos;est. Un enseignement au rabais, inégalitaire, dispensé par des professeurs épuisés n&apos;est pas à la hauteur de nos élèves. </p>
              
            <p>Madame la Ministre-Présidente, Madame la Ministre de l&apos;Education, Mesdames les Députées et Messieurs les Députés, nos enfants, vos enfants ne méritent-ils pas mieux ?</p>
          </div>
        </div>
      </section>

      

      {/* Cartes postales */}
      <div id="cartes" className="scroll-mt-28 mt-12 pt-8 border-t border-black/10">
        <section className="pb-20 px-4 md:px-8 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-black leading-[1.1] mb-10">
            Cartes postales
          </h2>

          {/* Aperçu */}
          <div className="mb-8">
            <img 
              src="/lettre/NB.jpg" 
              alt="Aperçu carte postale" 
              className="w-full border border-black/10 shadow-sm"
            />
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Noir",   file: "NB.pdf",     color: "#1C1917" },
              { label: "Violet", file: "Violet.pdf", color: "#7C3AED" },
              { label: "Bleu",   file: "Bleu.pdf",   color: "#2563EB" },
              { label: "Vert",   file: "Vert.pdf",   color: "#16A34A" },
              { label: "Rouge",  file: "Rouge.pdf",  color: "#DC2626" },
              { label: "Rose",   file: "Rose.pdf",   color: "#DB2777" },
            ].map(carte => (
              <a
                key={carte.label}
                href={`/lettre/${carte.file}`}
                download
                className="inline-flex items-center gap-2 bg-[#F5F0E8] border border-black/15 px-4 py-2 text-sm font-medium text-[#1C1917] hover:border-black/30 transition-colors"
              >
                📄 Télécharger en <span style={{ color: carte.color, fontWeight: 700 }}>{carte.label}</span>
              </a>
            ))}
          </div>

          <p className="text-xs text-[#6B6459] mt-4">
            Imprimez ces cartes postales, composez et écrivez-les, et remettez-les aux facteurs à bicyclette lors d&apos;une halte !
          </p>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#1C1917] border-t border-white/10 px-4 md:px-8 py-6 text-xs text-[#F5F0E8]/50">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-3">
          <p><strong className="text-[#F5F0E8]/80">Facteurs à bicyclette</strong> — Périple épiscolaire 2026<br />Initiative indépendante · Collectif de Coordination Liège-Régional</p>
          <p className="text-right">
            <Link href="/code-ethique" className="underline hover:text-[#F5F0E8]/80 transition-colors">Code éthique</Link> · <Link href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">Politique de confidentialité</Link><br />
            <Link href="/admin/login" className="text-[#F5F0E8]/30 hover:text-[#F5F0E8]/50 transition-colors">Admin</Link>
          </p>
        </div>
      </footer>

    </main>
  );
}