# MechBuildPro – Kurulacak Sistem Yapısı

## 📁 Genel Klasör Yapısı

mechbuild-core/
├── apps/
│   └── web/               # Ana AI editör arayüzü (Next.js + Tailwind)
├── blocks/
│   ├── hvac/              # HVAC yük hesabı
│   ├── upload/            # Dosya yükleme modülü
│   ├── boq/               # Keşif / metraj modülü
│   ├── sprinkler/         # Yangın sprinkler sistemi
│   ├── zon/               # Zon haritalama aracı
├── lib/
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── hooks/             # React custom hook'lar
│   └── ai/                # AI açıklama motoru
├── tests/
│   ├── unit/              # Unit test dosyaları
│   └── ui/                # Playwright UI testleri
├── public/                # Demo içerikler, ikonlar, mock görseller
├── supabase/              # Veritabanı entegrasyon yapısı
├── infra/
│   ├── scripts/           # Backup, deploy, migration scriptleri
│   ├── monitoring/        # Prometheus/Grafana izleme
│   └── docker-compose.yml # Lokal ve production altyapısı
├── .env.local             # API / Supabase bağlantı değişkenleri
├── package.json           # Bağımlılık listesi
├── pnpm-workspace.yaml    # Monorepo yapı yönetimi
└── README.md              # Kullanım dökümanı & yönlendirme paneli

## 🧩 Blok ve Modül Yapısı

Her modül şu yapıda organize edilir:

blocks/{modül}/
├── Form.tsx
├── logic.ts
├── doc.md
├── Component.tsx
└── export.ts

---

## 🔧 Örnek Bloklar

- HVAC → Isı yükü, kişi sayısı, debi, ASHRAE hesaplamaları
- Upload → Dosya girişi, Supabase storage bağlantısı
- BOQ → Keşif listesi formu, birim fiyatlar ve çıktılar
- Sprinkler → Yangın sistemi hesap formülü ve düzeni
- Zon → Zon haritalama ve görsel planlama bileşeni
