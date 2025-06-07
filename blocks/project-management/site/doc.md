# Şantiye Yönetimi Modülü

Bu modül, şantiye organizasyonu ve yönetimi için gerekli bileşenleri içerir.

## İçerik

- `Component.tsx`: Şantiye yönetimi UI bileşenleri
- `Form.tsx`: Şantiye formları ve validasyon
- `logic.ts`: Şantiye yönetimi hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Özellikler

### 1. Şantiye Organizasyonu
- Şantiye yerleşim planı
- Bölge yönetimi
- Ekip organizasyonu
- İş programı yönetimi

### 2. Güvenlik Yönetimi
- Güvenlik planı
- Risk değerlendirmesi
- Acil durum planları
- Güvenlik eğitimleri

### 3. Kalite Kontrol
- Kalite standartları
- Denetim planları
- Test ve kontrol prosedürleri
- Kalite raporları

### 4. İş Sağlığı ve Güvenliği
- İSG planı
- Sağlık kontrolleri
- Güvenlik ekipmanları
- İSG raporları

## Kullanım

```typescript
import { SiteManagement } from '@blocks/project-management/site';

// Şantiye yönetimi bileşenini kullan
<SiteManagement 
  siteId="site-123"
  onSiteUpdate={(siteData) => console.log(siteData)}
/>
``` 