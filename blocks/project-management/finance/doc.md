# Finans Yönetimi Modülü

Bu modül, proje finans yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Finans yönetimi UI bileşenleri
- `Form.tsx`: Finans formları ve validasyon
- `logic.ts`: Finans yönetimi hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Bütçe Yönetimi
- Bütçe planlaması
- Bütçe takibi
- Bütçe revizyonları
- Maliyet analizi

### 2. Maliyet Takibi
- Harcama takibi
- Maliyet merkezleri
- Maliyet dağılımı
- Maliyet raporları

### 3. Ödeme Planlaması
- Ödeme planı
- Ödeme takibi
- Vade takibi
- Nakit akışı

### 4. Finansal Raporlama
- Gelir-gider raporları
- Nakit akış raporları
- Kâr-zarar analizi
- Finansal tahminler

## Kullanım

```typescript
import { FinanceManagement } from '@blocks/project-management/finance';

// Finans yönetimi bileşenini kullan
<FinanceManagement 
  projectId="proj-123"
  onFinanceUpdate={(financeData) => console.log(financeData)}
/>
``` 