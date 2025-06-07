# Maintenance Tracking Modülü

Bu modül, bakım işlemlerinin takibi ve yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Bakım takibi için UI bileşenleri
- `Form.tsx`: Bakım kayıt formları ve validasyon
- `logic.ts`: Bakım takibi için hesaplama ve işlem fonksiyonları

## Özellikler

- Bakım işlemlerinin kaydı
- Bakım durumunun takibi
- Bakım geçmişi görüntüleme
- Bakım raporları oluşturma

## Kullanım

```typescript
import { MaintenanceTracking } from '@blocks/maintenance/tracking';

// Bakım takibi bileşenini kullan
<MaintenanceTracking 
  maintenanceId="123"
  onStatusChange={(status) => console.log(status)}
/>
``` 