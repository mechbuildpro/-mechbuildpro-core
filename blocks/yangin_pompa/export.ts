export function exportPompaData(veri) {
  const csv = `Debi (L/dk), Basınç (bar), Pompa Tipi\n${veri.debi},${veri.basinc},${veri.tip}`;
  return new Blob([csv], { type: "text/csv" });
}
