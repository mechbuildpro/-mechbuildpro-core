import React from "react";
export default function YanginDolapForm() {
  return (
    <form className="grid gap-4">
      <label>Kat Sayısı<input type="number" className="input" /></label>
      <label>Her Katta Dolap Sayısı<input type="number" className="input" /></label>
      <label>Debi (L/dk)<input type="number" className="input" defaultValue={100} /></label>
      <button type="submit" className="btn">Hesapla</button>
    </form>
  );
}
