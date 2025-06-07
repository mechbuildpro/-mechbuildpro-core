# Kaynak Yönetimi Modülü

Bu modül, proje kaynaklarının ve ekipmanlarının yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Kaynak yönetimi UI bileşenleri
- `Form.tsx`: Kaynak formları ve validasyon
- `logic.ts`: Kaynak yönetimi hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Ekipman Listesi
- Ekipman kategorileri
- Ekipman detayları
- Kullanım durumu
- Bakım takibi
- Ekipman raporları

### 2. Malzeme Listesi
- Malzeme kategorileri
- Stok takibi
- Tedarik planlaması
- Malzeme raporları

### 3. İş Gücü Listesi
- Personel bilgileri
- Görev dağılımı
- Çalışma takibi
- Performans raporları

### 4. Araç Listesi
- Araç bilgileri
- Kullanım planlaması
- Bakım takibi
- Araç raporları

## Kullanım

```typescript
import { ResourceManagement } from '@blocks/project-management/resources';

// Kaynak yönetimi bileşenini kullan
<ResourceManagement 
  projectId="proj-123"
  onResourceUpdate={(resourceData) => console.log(resourceData)}
/>
``` 