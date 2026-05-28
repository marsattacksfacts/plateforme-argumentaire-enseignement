"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const supabase = createClient();

export default function HebergementLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/hebergement");
    });
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");
    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (sbError) setError("Identifiants incorrects.");
    else router.replace("/hebergement");
  };

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F5F0E8]/90 backdrop-blur border-b border-black/10">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="font-serif font-bold text-[#C0440E] text-sm leading-tight">Facteurs à bicyclette</p>
          <p className="text-xs text-[#6B6459] italic">Périple épiscolaire · 2026</p>
        </Link>
        <span className="text-xs text-[#6B6459]">Hébergement</span>
      </nav>

      <div className="flex items-center justify-center px-4 pt-24 min-h-screen">
        <div className="max-w-sm w-full">
          <h1 className="font-serif text-2xl font-bold mb-6 text-center">Connexion hébergeur</h1>
          <div className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-black/15 bg-white px-4 py-3 text-sm" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full border border-black/15 bg-white px-4 py-3 text-sm" />
            {error && <p className="text-[#C0440E] text-sm">{error}</p>}
            <button onClick={login} disabled={loading} className="w-full bg-[#C0440E] text-white font-medium py-3 hover:bg-[#8A2E06] transition-colors disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}