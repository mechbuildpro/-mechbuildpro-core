# Entegrasyon Yönetimi Modülü

## Genel Bakış
Entegrasyon Yönetimi Modülü, projedeki farklı sistemlerin birbiriyle uyumlu çalışmasını sağlamak için kullanılır. Bu modül, sistemler arası koordinasyon, entegrasyon testleri, devreye alma planlaması ve sistem geçişlerini içerir.

## Bileşenler
- `Component.tsx`: Ana entegrasyon yönetimi bileşeni
- `Form.tsx`: Entegrasyon formları
- `logic.ts`: Entegrasyon yönetimi mantığı
- `export.ts`: Dışa aktarma fonksiyonları

## Özellikler

### 1. Sistemler Arası Koordinasyon
- Sistem bağımlılıkları
- Arayüz tanımlamaları
- Veri akış haritaları
- Sistem etkileşimleri
- Koordinasyon toplantıları

### 2. Entegrasyon Testleri
- Fonksiyonel testler
- Performans testleri
- Güvenlik testleri
- Uyumluluk testleri
- Test senaryoları

### 3. Devreye Alma Planlaması
- Devreye alma takvimi
- Kaynak planlaması
- Risk değerlendirmesi
- Yedekleme planları
- Geri dönüş planları

### 4. Sistem Geçişleri
- Geçiş planlaması
- Veri migrasyonu
- Kullanıcı eğitimi
- Destek planlaması
- Performans izleme

## Kullanım
```typescript
import { IntegrationManagement } from './Component';

// Entegrasyon yönetimi bileşenini kullan
<IntegrationManagement
  projectId="proje-id"
  onIntegrationUpdate={(updates) => {
    // Entegrasyon güncellemelerini işle
  }}
/>
```

## Veri Yapısı
```typescript
interface IntegrationData {
  activeTab: 'coordination' | 'testing' | 'commissioning' | 'transition';
  coordination: {
    items: SystemDependency[];
    categories: string[];
    statistics: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
  testing: {
    items: IntegrationTest[];
    categories: string[];
    statistics: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };
  commissioning: {
    items: CommissioningPlan[];
    categories: string[];
    statistics: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
  transition: {
    items: SystemTransition[];
    categories: string[];
    statistics: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
}
```

## Dışa Aktarma Fonksiyonları
- `exportCoordinationReport()`: Koordinasyon raporu
- `exportTestingReport()`: Test raporu
- `exportCommissioningReport()`: Devreye alma raporu
- `exportTransitionReport()`: Geçiş raporu 