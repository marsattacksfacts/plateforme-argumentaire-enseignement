import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
      <Link href="/" className="group">
        <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
        <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
      </Link>
      <Link
        href="/inscription"
        className="bg-[#C0440E] text-white text-sm font-medium px-4 py-2 hover:bg-[#8A2E06] transition-colors"
      >
        S'inscrire
      </Link>
    </header>
  );
}