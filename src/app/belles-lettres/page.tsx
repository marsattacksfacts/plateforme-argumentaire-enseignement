"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const LETTRES = [
  "1_1.jpeg", "1_2.jpeg", "1_3.jpeg", "1_4.jpeg",
  "2.jpeg",
  "3_1.jpeg", "3_2.jpeg",
];

const VIDEOS_LETTRES = [
  { fichier: "1.mp4", titre: "Lecture 1" },
  { fichier: "2.mp4", titre: "Lecture 2" },
];

function groupByPrefix(files: string[]) {
  const groups: { prefix: string; files: string[] }[] = [];
  const seen = new Set<string>();

  for (const f of files) {
    const match = f.match(/^(\d+)_/);
    const prefix = match ? match[1] : f.replace(/\.[^.]+$/, "");

    if (match && seen.has(prefix)) continue; // déjà dans un groupe

    if (match) {
      const siblings = files.filter(x => x.startsWith(prefix + "_"));
      groups.push({ prefix, files: siblings });
      siblings.forEach(x => seen.add(x));
    } else {
      groups.push({ prefix: f, files: [f] });
      seen.add(f);
    }
  }
  return groups;
}

export default function BellesLettresPage() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const grouped = useMemo(() => groupByPrefix(LETTRES), []);

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-[#1C1917] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80">
          <p className="font-serif font-bold text-[#C0440E] text-sm">Facteur·ices à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <Link href="/inscription" className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors">S&apos;inscrire</Link>
      </nav>

      <section className="pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C0440E] border border-[#C0440E] px-3 py-1 mb-8">À découvrir</span>
        <h1 className="font-serif text-4xl md:text-5xl font-black mb-10">De belles lettres</h1>

        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("photos")} className={`px-4 py-2 text-sm font-medium border transition-colors ${tab === "photos" ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white border-black/10 text-[#6B6459] hover:border-black/25"}`}>🖼️ Lettres manuscrites</button>
          <button onClick={() => setTab("videos")} className={`px-4 py-2 text-sm font-medium border transition-colors ${tab === "videos" ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white border-black/10 text-[#6B6459] hover:border-black/25"}`}>🎥 Lectures de lettres</button>
        </div>

        {/* PHOTOS */}
        {tab === "photos" && (
          LETTRES.length === 0 ? (
            <p className="text-[#6B6459]">Aucune lettre pour le moment.</p>
          ) : (
            <div className="space-y-10">
              {grouped.map((group, gi) => (
                <div key={gi}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-serif text-2xl font-black text-[#C0440E]">#{group.prefix}</span>
                    <div className="h-px flex-1 bg-[#C0440E]/20" />
                  </div>
                  {group.files.length === 1 ? (
                    <a
                      href={`/lettres/${group.files[0]}`}
                      target="_blank"
                      className="block border-2 border-[#D4C8B8] hover:border-[#C0440E] transition-colors bg-[#FBF6ED] shadow-sm hover:shadow-md max-w-md"
                    >
                      <img src={`/lettres/${group.files[0]}`} alt={`Lettre ${group.prefix}`} className="w-full h-80 object-contain p-4" />
                    </a>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {group.files.map((f, i) => (
                        <a
                          key={i}
                          href={`/lettres/${f}`}
                          target="_blank"
                          className="block border-2 border-[#D4C8B8] hover:border-[#C0440E] transition-colors bg-[#FBF6ED] shadow-sm hover:shadow-md"
                        >
                          <img src={`/lettres/${f}`} alt={`${group.prefix} page ${i + 1}`} className="w-full h-52 object-contain p-2" />
                          <p className="text-[10px] text-center text-[#6B6459] pb-2">Page {i + 1}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* VIDÉOS */}
        {tab === "videos" && (
          VIDEOS_LETTRES.length === 0 ? (
            <p className="text-[#6B6459]">Aucune vidéo pour le moment.</p>
          ) : (
            <div className="space-y-8">
              {VIDEOS_LETTRES.map((v, i) => (
                <div key={i} className="border-2 border-[#D4C8B8] bg-[#FBF6ED] shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <p className="font-serif text-lg font-bold text-[#1C1917] mb-1">{v.titre}</p>
                    <div className="h-px bg-[#C0440E]/20 mb-3" />
                    <video src={`/videos/${v.fichier}`} controls className="w-full" style={{ maxHeight: "450px", background: "#000" }} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </main>
  );
}