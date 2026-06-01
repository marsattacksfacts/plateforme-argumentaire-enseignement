import Link from "next/link";
import fs from "fs";
import path from "path";

export default async function PhotosPage() {
  const dir = path.join(process.cwd(), "public/photos");
  let files: string[] = [];
  try { files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(f)); } catch {}

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80"><p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p><p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p></Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">S&apos;inscrire</Link>
      </nav>
      <section className="pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">Photos & Vidéos</h1>
        {files.length === 0 ? (
          <p className="text-[#6B6459]">Aucun média pour le moment. Revenez bientôt !</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map(f => {
              const isVideo = /\.(mp4|webm|mov)$/i.test(f);
              return (
                <a key={f} href={`/photos/${f}`} target="_blank" className="block border border-black/10 hover:shadow-lg transition-shadow">
                  {isVideo ? (
                    <video src={`/photos/${f}`} controls className="w-full h-48 object-cover" />
                  ) : (
                    <img src={`/photos/${f}`} alt={f} className="w-full h-48 object-cover" />
                  )}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}