# Tasarım Yönetimi Modülü

## Genel Bakış
Tasarım Yönetimi Modülü, projenin tasarım aşamasındaki tüm süreçleri yönetmek için kullanılır. Bu modül, teknik çizimler, 3D modeller, tasarım revizyonları ve onay süreçlerini içerir.

## Bileşenler
- `Component.tsx`: Ana tasarım yönetimi bileşeni
- `Form.tsx`: Tasarım formları
- `logic.ts`: Tasarım yönetimi mantığı
- `export.ts`: Dışa aktarma fonksiyonları

## Özellikler

### 1. Teknik Çizimler
- Proje çizimleri
- Detay çizimleri
- Revizyon takibi
- Versiyon kontrolü
- Çizim onayları

### 2. 3D Modeller
- BIM modelleri
- Render görselleri
- Animasyonlar
- Model revizyonları
- Model paylaşımı

### 3. Tasarım Revizyonları
- Revizyon takibi
- Değişiklik yönetimi
- Revizyon onayları
- Revizyon geçmişi
- Etki analizi

### 4. Tasarım Onayları
- Onay süreçleri
- Onay durumu takibi
- Onay geçmişi
- Onay bildirimleri
- Onay raporları

### 5. Tasarım Dokümantasyonu
- Teknik şartnameler
- Ürün dokümantasyonu
- Standartlar ve kodlar
- Referans dokümanlar
- Doküman arşivi

## Kullanım
```typescript
import { DesignManagement } from './Component';

// Tasarım yönetimi bileşenini kullan
<DesignManagement
  projectId="proje-id"
  onDesignUpdate={(updates) => {
    // Tasarım güncellemelerini işle
  }}
/>
```

## Veri Yapısı
```typescript
interface DesignData {
  activeTab: 'drawings' | 'models' | 'revisions' | 'approvals' | 'documentation';
  drawings: {
    items: Drawing[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  models: {
    items: Model[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  revisions: {
    items: Revision[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  approvals: {
    items: Approval[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  documentation: {
    items: Document[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
}
```

## Dışa Aktarma Fonksiyonları
- `exportDrawingReport()`: Çizim raporu
- `exportModelReport()`: Model raporu
- `exportRevisionReport()`: Revizyon raporu
- `exportApprovalReport()`: Onay raporu
- `exportDocumentationReport()`: Dokümantasyon raporu 