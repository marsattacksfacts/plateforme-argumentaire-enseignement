import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function ConnexionPage() {
  async function login(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const pseudonym = (formData.get("pseudonym") as string)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const email = `${pseudonym}@user.plateforme-argu.be`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: formData.get("password") as string,
    });

    if (error) {
      return redirect("/connexion?error=Identifiants invalides");
    }
    return redirect("/");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif font-black text-3xl mb-2">Connexion</h1>
      <p className="text-sm text-ink-light mb-8">Connectez-vous avec votre pseudonyme.</p>

      <form action={login} className="space-y-5">
        <div>
          <label htmlFor="pseudonym" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
            Pseudonyme
          </label>
          <input id="pseudonym" name="pseudonym" type="text" required className="input-brut" placeholder="Votre pseudonyme" />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
            Mot de passe
          </label>
          <input id="password" name="password" type="password" required className="input-brut" placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary w-full text-center">
          Se connecter
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-light text-center">
        Pas de compte ?{" "}
        <Link href="/inscription" className="underline decoration-brick hover:text-brick transition-colors font-medium">
          S&apos;inscrire
        </Link>
      </p>
    </main>
  );
}