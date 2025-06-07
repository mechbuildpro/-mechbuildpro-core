# Sözleşme Yönetimi Modülü

Bu modül, proje sözleşme yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Sözleşme yönetimi UI bileşenleri
- `Form.tsx`: Sözleşme formları ve validasyon
- `logic.ts`: Sözleşme yönetimi hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Metraj (BOQ)
- Birim fiyat listesi
- Metraj hesaplamaları
- Fiyat analizi
- Revizyon takibi

### 2. Hakediş Yönetimi
- Hakediş planlaması
- İlerleme ödemeleri
- Kesinti hesaplamaları
- Ödeme takibi

### 3. Bilgi Talebi (RFI)
- RFI oluşturma
- RFI takibi
- Yanıt yönetimi
- Durum raporları

### 4. Sözleşme Takibi
- Sözleşme şartları
- Değişiklik talepleri
- Uzatma talepleri
- Sözleşme raporları

## Kullanım

```typescript
import { ContractManagement } from '@blocks/project-management/contracts';

// Sözleşme yönetimi bileşenini kullan
<ContractManagement 
  projectId="proj-123"
  onContractUpdate={(contractData) => console.log(contractData)}
/>
``` 