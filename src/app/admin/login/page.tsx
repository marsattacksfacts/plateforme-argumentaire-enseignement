"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();


export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si déjà connecté, rediriger
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/admin");
    });
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");
    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (sbError) {
      setError("Identifiants incorrects.");
    } else {
      router.replace("/admin");
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <h1 className="font-serif text-2xl font-bold mb-6 text-center">Admin · Facteurs à bicyclette</h1>
        <div className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-black/15 bg-white px-4 py-3 text-sm" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full border border-black/15 bg-white px-4 py-3 text-sm" />
          {error && <p className="text-[#C0440E] text-sm">{error}</p>}
          <button onClick={login} disabled={loading} className="w-full bg-[#C0440E] text-white font-medium py-3 hover:bg-[#8A2E06] transition-colors disabled:opacity-50">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </div>
    </main>
  );

}