import Link from "next/link";

const SOUTIENS = [
  { nom: "Arnaud Hoedt", role: "Écrivain et penseur de l'enseignement", message: "Dites les profs, ça vous dit d'envoyer une lettre directement à la Ministre pour lui dire que n'avez pas envie de laisser tomber Kévin ?", date: "28 mai 2026" },
  { nom: "Myriam Leroy", role: "Écrivaine", message: "Quelle créativité militante !", date: "29 mai 2026" },
];

export default function SoutiensPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80"><p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p><p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p></Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">S&apos;inscrire</Link>
      </nav>
      <section className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 mb-8">Soutiens</span>
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Ils nous soutiennent</h1>
        <div className="space-y-6">

          {/* Lettre Marczewski */}
          <div className="bg-white border border-[#C0440E]/20 p-5 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-[#1C1917] text-lg">Philippe Marczewski</p>
                <p className="text-xs text-[#C0440E] uppercase tracking-widest">Écrivain et enseignant</p>
              </div>
            </div>
            <div className="font-serif text-[0.9rem] leading-relaxed text-[#3D3530] space-y-4">
              <p className="font-bold">Monsieur le Président du Parlement Fédération Wallonie-Bruxelles,</p>
              <p className="font-bold">Mesdames les Députées et Messieurs les Députés,</p>
              <p>D&apos;autres que moi, bien plus pédagogues, vous diront que les mesures promises par le décret-programme de Madame la Ministre Glatigny vont être catastrophiques pour l&apos;enseignement et, par conséquent, pour la société tout entière.</p>
              <p>Je doute cependant que vous l&apos;ignoriez encore, sauf si vous n&apos;avez pas prêté la moindre attention à ce que vous répètent les enseignants mobilisés depuis de longs mois — mais qui croirait cela ?</p>
              <p>Je suis davantage surpris que certains et certaines d&apos;entre vous pensent encore qu&apos;il est possible, et souhaitable, de voter des réformes avec de tels effets sans l&apos;accord, et pire, contre l&apos;avis des femmes et des hommes qui, chaque jour, sont dans les classes, et à qui nous confions collectivement une part importante de notre avenir.</p>
              <p>Si l&apos;on parvenait à susciter l&apos;adhésion par le mépris, cela se saurait depuis longtemps.</p>
              <p>Afin de ne pas vous faire perdre votre temps en rappels inutiles, je vais plutôt vous dire ce que nous voulons.</p>
              <p>Nous voulons plus d&apos;enseignants, mieux payés, avec moins d&apos;heures en classe, afin qu&apos;il puissent effectuer un travail de préparation de leurs enseignements, de suivi, d&apos;accompagnement, et de créativité, sans subir le stress de l&apos;urgence ni sacrifier leur temps libre.</p>
              <p>Nous voulons le doublement — non, attendez — le triplement des budgets dédiés à la gratuité scolaire.</p>
              <p>Nous voulons que tous les enfants du maternel et du primaire aient accès à un repas chaud sain et équilibré, avec des produits locaux, chaque jour de la semaine, à moins de 2€.</p>
              <p>Nous voulons que cela soit gratuit pour les enfants dont les familles sont économiquement fragiles.</p>
              <p>Nous voulons des bâtiments scolaires partout rénovés, confortables et bien équipés.</p>
              <p>Nous voulons une revalorisation et une diversification de l&apos;enseignement qualifiant, afin qu&apos;il soit un choix reconnu et encouragé socialement, et n&apos;interdise aucune réorientation ultérieure.</p>
              <p>Nous voulons une baisse importante du coût des études supérieures, une aide financière accrue pour les étudiant·e·s économiquement fragiles, afin qu&apos;il leur soit possible de s&apos;investir dans des études sans devoir travailler à temps plein pour en supporter les frais.</p>
              <p>Nous voulons une loi limitant sévèrement les loyers des logements occupés par les étudiants.</p>
              <p>Nous voulons un accompagnement spécialisé et accru pour les élèves qui sortent du primaire avec des lacunes ou des difficultés.</p>
              <p>Nous voulons que l&apos;excellence de l&apos;enseignement ne soit pas synonyme de compétition, ni de déclassement.</p>
              <p>Nous voulons tant d&apos;autres choses encore pour nos écoles et pour nos étudiant·e·s, mais c&apos;est déjà beaucoup, et il s&apos;agirait de ne pas vous assommer. Nous ne sommes pas du genre à accroitre de 10% votre charge de travail sans augmenter vos salaires.</p>
              <p>Ces demandes sont à l&apos;opposée des mesures sur lesquelles vous allez devoir vous prononcer, c&apos;est vrai. Mais voyez-vous, c&apos;est ce que nous attendons de vous. De la créativité et de l&apos;ambition.</p>
              <p>Je sais ce que vous allez répondre (vous êtes parfois si prévisibles) : c&apos;est irréaliste. Les économies sont nécessaires. Il faut chercher l&apos;Équilibre Budgétaire, qui est le lieu de la béatitude et de l&apos;accomplissement, où coulent le lait et le miel.</p>
              <p>Pour les partis de l&apos;actuelle majorité, l&apos;Équilibre Budgétaire est un peu comme le Grand Soir des militants communistes d&apos;autrefois, ces rigolos qu&apos;il est si facile de vilipender. Leur rêve était peut-être naïf, et sans doute a-t-il bien mal tourné. Au moins leur rêve était-il celui d&apos;un avenir meilleur pour tous, un rêve d&apos;égalité et de solidarité. Ce n&apos;était pas le rêve d&apos;une société des plus forts, qui repose sur l&apos;injustice fiscale. Une société qui s&apos;accommode de ses inégalités, quand elle ne les creuse pas, notamment en affaiblissant son enseignement et sa jeunesse.</p>
              <p>Alors voilà, plutôt que de vouloir faire entrer l&apos;école dans un modèle économique qui réussit à cumuler les effets socialement négatifs du low-cost et de l&apos;industrie du luxe, nous préférerions que vous consacriez votre énergie, votre talent, votre art politique à inventer les conditions d&apos;un meilleur financement de l&apos;enseignement. Ce n&apos;est pas facile, je m&apos;en doute. Mais nous sommes en juin, vous ne croyez quand même pas vous en sortir sans un examen un peu salé !</p>
              <p className="font-bold pt-2">Philippe Marczewski, écrivain et enseignant</p>
            </div>
          </div>

          {/* Autres soutiens */}
          {SOUTIENS.map((s, i) => (
            <div key={i} className="bg-white border border-black/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-[#1C1917]">{s.nom}</p>
                  <p className="text-xs text-[#C0440E] uppercase tracking-widest">{s.role}</p>
                </div>
                <p className="text-xs text-[#6B6459]">{s.date}</p>
              </div>
              <blockquote className="font-serif italic text-[#3D3530] leading-relaxed border-l-4 border-[#C0440E] pl-4">« {s.message} »</blockquote>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}