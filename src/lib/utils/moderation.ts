import { createClient } from "@/lib/supabase/server";

export async function updateArgumentaireStatus(argumentaireId: string) {
  const supabase = await createClient();

  // Récupère tous les votes pour cet argumentaire
  const { data: votes } = await supabase
    .from("moderation_votes")
    .select("vote, flag_sources")
    .eq("target_id", argumentaireId)
    .eq("target_type", "argumentaire");

  if (!votes || votes.length < 2) return; // Pas assez de votes

  const forVotes = votes.filter((v) => v.vote === "for").length;
  const againstVotes = votes.filter((v) => v.vote === "against").length;
  const ratio = forVotes / (againstVotes || 1);
  const hasFlaggedSources = votes.some((v) => v.flag_sources);

  let newStatus: string;

  if (forVotes >= 2 && ratio >= 2) {
    newStatus = hasFlaggedSources ? "published_flagged" : "published";
  } else if (forVotes >= 2) {
    newStatus = "suspended";
  } else {
    return; // Pas assez de votes pour, on ne change rien
  }

  const { error } = await supabase
    .from("argumentaires")
    .update({ status: newStatus })
    .eq("id", argumentaireId);

  if (error) {
    console.error("Erreur mise à jour statut:", error);
  }
}