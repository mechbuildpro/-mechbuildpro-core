// MechBuildPro AI Editör Yapısı Kurulumu

// =========================
// 📁 Kurulacak Sistem Yapısı
// =========================

// Genel klasör yapısı:

/*
mechbuild-core/
├── apps/
│   └── web/               # Ana AI editör arayüzü (Next.js + Tailwind)
├── blocks/
│   ├── hvac/              # HVAC yük hesabı
│   ├── upload/            # Dosya yükleme modülü
│   ├── boq/               # Keşif / metraj modülü
│   ├── sprinkler/         # Yangın sprinkler sistemi
│   ├── zon/               # Zon haritalama aracı
│   ├── domestik/          # Temiz su tesisatı modülü
│   ├── pissu/             # Pis su drenaj modülü
│   ├── yagmur/            # Yağmur drenaj modülü
│   ├── yangin_dolap/      # Yangın dolapları ve hat hesabı
│   ├── yangin_pompa/      # Yangın pompası seçimi
│   └── sozlesme/          # Sözleşme ve malzeme onay yapısı
├── lib/
│   ├── utils/             # Yardımcı fonksiyonlar (örn: hesaplama, validasyon)
│   ├── hooks/             # React custom hook'lar
│   └── ai/                # AI açıklama motoru
├── tests/
│   ├── unit/              # Unit test dosyaları (vitest/jest)
│   └── ui/                # Playwright UI testleri
├── public/                # Demo içerikler, ikonlar, mock görseller
├── supabase/              # Veritabanı entegrasyon yapısı
├── infra/
│   ├── scripts/           # Backup, deploy, migration scriptleri
│   ├── monitoring/        # Prometheus/Grafana ayarları
│   └── docker-compose.yml # Lokal ve production için altyapı
├── .env.local             # Supabase, UploadCare, OpenAI API ayarları
├── package.json           # Bağımlılık listesi
├── pnpm-workspace.yaml    # Monorepo yapı yönetimi
└── README.md              # Kullanım dökümanı & yönlendirme paneli
*/


// Blok ve modül mimarisi - Başlangıç dosya yapısı

// 8. Yağmur Drenaj Modülü
export const YagmurModule = {
  id: "yagmur",
  title: "Yağmur Drenaj Sistemi",
  form: "blocks/yagmur/Form.tsx",
  logic: "blocks/yagmur/logic.ts",
  doc: "blocks/yagmur/doc.md",
  component: "blocks/yagmur/Component.tsx",
  export: "blocks/yagmur/export.ts"
};

// yagmur modülünün dosya şablonları (oluşturulacak)
// Form.tsx
/*
import React from "react";
export default function YagmurForm() {
  return (
    <form className="grid gap-4">
      <label>
        Çatı Alanı (m²)
        <input type="number" className="input" />
      </label>
      <label>
        Yağış Şiddeti (L/s.m²)
        <input type="number" className="input" defaultValue={0.03} />
      </label>
      <button type="submit" className="btn">Hesapla</button>
    </form>
  );
}
*/

// logic.ts
/*
export function hesapYagmurDebisi(alan: number, yagis: number = 0.03): number {
  return Number((alan * yagis).toFixed(2));
}
*/

// Component.tsx
/*
import React from "react";
import YagmurForm from "./Form";
export default function YagmurComponent() {
  return (
    <section>
      <h2>Yağmur Suyu Drenajı</h2>
      <YagmurForm />
    </section>
  );
}
*/

// doc.md
/*
# Yağmur Drenaj Modülü
Bu modül çatı alanına ve yağış şiddetine göre debi hesabı yapar.
- Giriş: m² alan, L/s.m² yağış değeri
- Kaynak: TSE 825, DSİ Yağış Şiddet Katsayıları
*/

// export.ts
/*
export function exportYagmurData(input) {
  const csv = `Alan (m²), Yağış (L/s.m²), Toplam Debi (L/s)\n${input.alan},${input.yagis},${input.debi}`;
  return new Blob([csv], { type: "text/csv" });
}
*/
