# Proje Yönetimi Modülü

Bu modül, proje ve şantiye yönetimi için gerekli tüm bileşenleri içerir.

## Alt Modüller

### 1. Planning (Planlama)
- Proje planlaması
- Kaynak planlaması
- Maliyet planlaması
- Zaman planlaması

### 2. Resources (Kaynaklar)
- İş gücü yönetimi
- Ekipman yönetimi
- Malzeme yönetimi
- Tedarik zinciri yönetimi

### 3. Site (Şantiye)
- Şantiye organizasyonu
- Güvenlik yönetimi
- Kalite kontrol
- İş sağlığı ve güvenliği

### 4. Documents (Dokümanlar)
- Teknik çizimler
- Sözleşmeler
- İzinler ve lisanslar
- Raporlar

### 5. Finance (Finans)
- Bütçe yönetimi
- Maliyet takibi
- Ödeme planlaması
- Finansal raporlama

## Kullanım

```typescript
import { ProjectManagement } from '@blocks/project-management';

// Proje yönetimi bileşenini kullan
<ProjectManagement 
  projectId="proj-123"
  onProjectUpdate={(data) => console.log(data)}
/>
``` 