import React from "react";
export default function SozlesmeForm() {
  return (
    <form className="grid gap-4">
      <label>İş Kalemi<input type="text" className="input" /></label>
      <label>Birim Fiyat (₺)<input type="number" className="input" /></label>
      <label>Miktar<input type="number" className="input" /></label>
      <button type="submit" className="btn">Ekle</button>
    </form>
  );
}
