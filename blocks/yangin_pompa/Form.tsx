import React from "react";
export default function YanginPompaForm() {
  return (
    <form className="grid gap-4">
      <label>Toplam Debi (L/dk)<input type="number" className="input" /></label>
      <label>Toplam Basınç (bar)<input type="number" className="input" /></label>
      <button type="submit" className="btn">Pompa Seç</button>
    </form>
  );
}
