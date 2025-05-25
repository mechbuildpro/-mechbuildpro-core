# MechBuild Core

MechBuild Pro platformunun çekirdek AI destekli modüler sistemidir. Bu yapı, mühendislik hesapları, proje yönetimi ve veri yükleme ihtiyaçları için eksiksiz bir başlangıç seti sunar.

## 🚀 Özellikler

- 🔧 Modüler mimari (`blocks/` altında tüm sistemler)
- 🧠 AI destekli form, hesap, açıklama motorları
- 📦 Hazır hesap modülleri (HVAC, Sprinkler, BOQ, vs.)
- 🗂️ Export edilebilir çıktılar (CSV / JSON / PDF)
- ⚙️ Next.js 15 + Tailwind CSS + TypeScript altyapısı

## 📁 Dizin Yapısı

```
mechbuild-core/
├── apps/
│   └── web/               # Next.js frontend
├── blocks/                # Her mühendislik sistem modülü
│   ├── hvac/
│   ├── upload/
│   ├── ...
├── mechbuild-core-setup.md
├── README.md
```

## 🛠️ Kurulum

```bash
pnpm install
pnpm dev
```

## 📦 Modüller

Tüm modüller `blocks/` klasörü altındadır. Her biri aşağıdaki dosyaları içerir:

- `Form.tsx` – Giriş formu
- `logic.ts` – Hesaplama fonksiyonu
- `Component.tsx` – UI birleşimi
- `doc.md` – Açıklama ve kaynak normlar
- `export.ts` – CSV export fonksiyonu

## 🤝 Katkı

Tüm katkılar açık şekilde dokümante edilecek. Her modül bağımsız geliştirme ve test için uygundur.

---
Powered by **ChatGPT + Tamer Canatan**
