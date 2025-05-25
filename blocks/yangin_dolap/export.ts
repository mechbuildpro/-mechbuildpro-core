export function exportYanginDolapData(data) {
  const csv = `Kat Sayısı, Dolap/Kat, Debi (L/dk), Toplam Debi\n${data.kat},${data.dolap},${data.debi},${data.total}`;
  return new Blob([csv], { type: "text/csv" });
}
