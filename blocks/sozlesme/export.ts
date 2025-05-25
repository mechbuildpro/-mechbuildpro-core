export function exportSozlesme(veriler) {
  const csv = `İş Kalemi, Birim Fiyat (₺), Miktar, Tutar (₺)\n` +
              veriler.map(v => `${v.kalem},${v.fiyat},${v.miktar},${v.tutar}`).join("\n");
  return new Blob([csv], { type: "text/csv" });
}
