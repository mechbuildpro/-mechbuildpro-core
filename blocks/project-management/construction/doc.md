# İnşaat Yönetimi Modülü

## Genel Bakış
İnşaat Yönetimi Modülü, projenin yapım aşamasındaki tüm süreçleri yönetmek için kullanılır. Bu modül, iş programı takibi, ilerleme raporları, kalite kontrol ve güvenlik denetimlerini içerir.

## Bileşenler
- `Component.tsx`: Ana inşaat yönetimi bileşeni
- `Form.tsx`: İnşaat formları
- `logic.ts`: İnşaat yönetimi mantığı
- `export.ts`: Dışa aktarma fonksiyonları

## Özellikler

### 1. İş Programı Takibi
- İş paketleri
- Görev atamaları
- İlerleme takibi
- Kritik yol analizi
- Kaynak planlaması

### 2. İlerleme Raporları
- Günlük raporlar
- Haftalık raporlar
- Aylık raporlar
- İlerleme grafikleri
- Performans analizi

### 3. Kalite Kontrol
- Kalite denetimleri
- Uygunluk kontrolleri
- Test ve doğrulama
- Kalite raporları
- Düzeltme takibi

### 4. Güvenlik Denetimleri
- Güvenlik kontrolleri
- Risk değerlendirmesi
- Kaza raporları
- Eğitim takibi
- İSG denetimleri

### 5. İş Emirleri
- İş emri oluşturma
- İş emri takibi
- Onay süreçleri
- Tamamlanma raporları
- Arşivleme

## Kullanım
```typescript
import { ConstructionManagement } from './Component';

// İnşaat yönetimi bileşenini kullan
<ConstructionManagement
  projectId="proje-id"
  onConstructionUpdate={(updates) => {
    // İnşaat güncellemelerini işle
  }}
/>
```

## Veri Yapısı
```typescript
interface ConstructionData {
  activeTab: 'schedule' | 'progress' | 'quality' | 'safety' | 'workorders';
  schedule: {
    items: WorkPackage[];
    categories: string[];
    statistics: {
      total: number;
      completed: number;
      inProgress: number;
      delayed: number;
    };
  };
  progress: {
    items: ProgressReport[];
    categories: string[];
    statistics: {
      total: number;
      onTime: number;
      delayed: number;
      completed: number;
    };
  };
  quality: {
    items: QualityCheck[];
    categories: string[];
    statistics: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };
  safety: {
    items: SafetyInspection[];
    categories: string[];
    statistics: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };
  workorders: {
    items: WorkOrder[];
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
- `exportScheduleReport()`: İş programı raporu
- `exportProgressReport()`: İlerleme raporu
- `exportQualityReport()`: Kalite raporu
- `exportSafetyReport()`: Güvenlik raporu
- `exportWorkOrderReport()`: İş emri raporu 