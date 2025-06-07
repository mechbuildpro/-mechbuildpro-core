# Proje Planlama Modülü

Bu modül, proje planlaması ve yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Planlama UI bileşenleri
- `Form.tsx`: Plan formları ve validasyon
- `logic.ts`: Planlama hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Proje Planlaması
- İş kırılım yapısı (WBS)
- Görev tanımlamaları
- Bağımlılık yönetimi
- Kritik yol analizi

### 2. Kaynak Planlaması
- İş gücü planlaması
- Ekipman planlaması
- Malzeme planlaması
- Kapasite planlaması

### 3. Maliyet Planlaması
- Bütçe planlaması
- Maliyet tahminleri
- Nakit akışı planlaması
- Risk analizi

### 4. Zaman Planlaması
- Gantt şemaları
- Milestone planlaması
- Takvim yönetimi
- İlerleme takibi

## Kullanım

```typescript
import { ProjectPlanning } from '@blocks/project-management/planning';

// Planlama bileşenini kullan
<ProjectPlanning 
  projectId="proj-123"
  onPlanUpdate={(planData) => console.log(planData)}
/>
``` 