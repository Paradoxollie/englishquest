export function formatGold(amount: number) {
  return `${amount.toLocaleString("fr-FR")} pièce${amount > 1 ? "s" : ""} d’or`;
}
