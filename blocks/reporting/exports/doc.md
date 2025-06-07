# Reporting Exports Modülü

Bu modül, projedeki raporların dışa aktarım işlemlerini yönetir.

## İçerik

- `Component.tsx`: Export işlemleri için UI bileşenleri
- `Form.tsx`: Export formları ve validasyon
- `logic.ts`: Export işlemleri için hesaplama ve dönüştürme fonksiyonları
- `export.ts`: Modül dışa aktarımları ve özel export fonksiyonları

## Desteklenen Formatlar

- PDF
- Excel
- CSV
- JSON

## Kullanım

```typescript
import { exportToPDF, exportToExcel } from '@blocks/reporting/exports';

// PDF olarak dışa aktar
exportToPDF(data);

// Excel olarak dışa aktar
exportToExcel(data);
```
