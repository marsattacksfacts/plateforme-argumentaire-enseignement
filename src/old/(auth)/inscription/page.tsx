import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function InscriptionPage() {
  async function signup(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const pseudonym = formData.get("pseudonym") as string;
    const password = formData.get("password") as string;
    const email = `${pseudonym.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}@user.plateforme-argu.be`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { pseudonym, email } },
    });

    if (error) {
      return redirect("/inscription?error=" + encodeURIComponent(error.message));
    }
    return redirect("/connexion?message=Compte créé. Connectez-vous.");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif font-black text-3xl mb-2">Inscription</h1>
      <p className="text-sm text-ink-light mb-8">Créez votre compte. Aucune adresse email requise.</p>

      <form action={signup} className="space-y-5">
        <div>
          <label htmlFor="pseudonym" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
            Pseudonyme (unique)
          </label>
          <input id="pseudonym" name="pseudonym" type="text" required minLength={3} className="input-brut" placeholder="Choisissez un pseudonyme" />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-ink-light mb-1.5">
            Mot de passe
          </label>
          <input id="password" name="password" type="password" required minLength={8} className="input-brut" placeholder="Minimum 8 caractères" />
        </div>
        <button type="submit" className="btn-primary w-full text-center">
          Créer mon compte
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-light text-center">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="underline decoration-brick hover:text-brick transition-colors font-medium">
          Se connecter
        </Link>
      </p>
    </main>
  );
}