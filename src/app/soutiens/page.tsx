import Link from "next/link";

const SOUTIENS = [
  { nom: "", role: "Député", message: "Soutien total à cette initiative citoyenne qui rappelle que la démocratie se vit aussi sur les routes.", date: "28 mai 2026" },
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