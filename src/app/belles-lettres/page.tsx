"use client";

import { useState } from "react";
import Link from "next/link";

// Ajoute les noms de fichiers ici, le reste est automatique
const LETTRES = [
  "1_1.jpeg",
  "1_2.jpeg",
  "1_3.jpeg",
  "1_4.jpeg",
  "2.jpeg",
  "3_1.jpeg",
  "3_2.jpeg",
];

const VIDEOS_LETTRES = [
  { fichier: "1.mp4", titre: "Lecture 1" },
  { fichier: "2.mp4", titre: "Lecture 2" },
];

export default function BellesLettresPage() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");

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

        {tab === "photos" && (
          LETTRES.length === 0 ? (
            <p className="text-[#6B6459]">Aucune lettre pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {LETTRES.map((f, i) => (
                <a key={i} href={`/lettres/${f}`} target="_blank" className="block border border-black/10 hover:shadow-lg transition-shadow bg-white">
                  <img src={`/lettres/${f}`} alt={`Lettre ${i + 1}`} className="w-full h-64 object-cover" />
                </a>
              ))}
            </div>
          )
        )}

        {tab === "videos" && (
          VIDEOS_LETTRES.length === 0 ? (
            <p className="text-[#6B6459]">Aucune vidéo pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VIDEOS_LETTRES.map((v, i) => (
                <div key={i} className="border border-black/10 bg-white p-3">
                  <video src={`/videos/${v.fichier}`} controls className="w-full" style={{ maxHeight: "400px" }} />
                  <p className="text-sm font-medium mt-2 text-[#1C1917]">{v.titre}</p>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </main>
  );
}