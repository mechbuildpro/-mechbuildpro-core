export function pompaSecimi(debi: number, basinç: number): string {
  if (debi > 2000) return `Dizel pompa önerilir (${debi} L/dk @ ${basinç} bar)`;
  return `Elektrik pompa uygundur (${debi} L/dk @ ${basinç} bar)`;
}
