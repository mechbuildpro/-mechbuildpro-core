# Doküman Yönetimi Modülü

Bu modül, proje dokümanlarının yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Doküman yönetimi UI bileşenleri
- `Form.tsx`: Doküman formları ve validasyon
- `logic.ts`: Doküman yönetimi hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Teknik Çizimler
- Proje çizimleri
- Detay çizimleri
- Revizyon takibi
- Versiyon kontrolü

### 2. Sözleşmeler
- Sözleşme yönetimi
- İzin ve lisanslar
- Yasal dokümanlar
- Sözleşme takibi

### 3. Raporlar
- İlerleme raporları
- Kalite raporları
- Maliyet raporları
- Risk raporları

### 4. Doküman Arşivi
- Kategori yönetimi
- Arama ve filtreleme
- Erişim kontrolü
- Yedekleme

## Kullanım

```typescript
import { DocumentManagement } from '@blocks/project-management/documents';

// Doküman yönetimi bileşenini kullan
<DocumentManagement 
  projectId="proj-123"
  onDocumentUpdate={(documentData) => console.log(documentData)}
/>
``` 