export default function Footer() {
  return (
    <footer className="bg-[#1C1917] border-t border-white/10 px-6 py-6 text-xs text-[#F5F0E8]/50">
      <div className="max-w-3xl mx-auto flex flex-wrap justify-between gap-3">
        <p>
          <strong className="text-[#F5F0E8]/80">Facteurs à bicyclette</strong> — Périple épiscolaire 2026
          <br />
          Initiative indépendante · Collectif de Coordination Liège-Régional
        </p>
        <p className="text-right">
          Code source public · Données confidentielles
          <br />
          <a href="/confidentialite" className="underline hover:text-[#F5F0E8]/80 transition-colors">
            Politique de confidentialité
          </a>
        </p>
      </div>
    </footer>
  );
}