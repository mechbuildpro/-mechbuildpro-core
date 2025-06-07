# Dashboard Modülü

## Genel Bakış
Dashboard modülü, projenin genel durumunu, ilerlemesini ve aktivitelerini tek bir ekranda görüntülemek için kullanılır. Bu modül, proje istatistikleri, ilerleme takibi, dosya yönetimi ve aktivite takibi gibi özellikleri bir araya getirir.

## Özellikler
- Proje istatistikleri
- İlerleme takibi
- Dosya yönetimi
- Aktivite takibi
- Kategori dağılımı
- Gerçek zamanlı güncelleme
- Filtreleme seçenekleri

## Veri Yapıları

### Dashboard İstatistikleri
```typescript
interface DashboardStats {
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
  };
  progressStats: {
    totalPhases: number;
    completedPhases: number;
    delayedPhases: number;
    atRiskPhases: number;
    overallProgress: number;
  };
  fileStats: {
    totalFiles: number;
    totalSize: number;
    recentUploads: number;
    categoryDistribution: {
      [key: string]: number;
    };
  };
  activityStats: {
    recentActivities: Activity[];
    activityByType: {
      [key: string]: number;
    };
  };
}
```

### Aktivite
```typescript
interface Activity {
  id: string;
  type: 'project' | 'progress' | 'file' | 'user';
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: any;
}
```

### Filtreler
```typescript
interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  projectIds?: string[];
  categories?: string[];
  users?: string[];
}
```

## API Endpoint'leri

### Dashboard İstatistikleri
```http
GET /api/dashboard/stats
```

### Son Aktiviteler
```http
GET /api/activities/list?limit=number
```

### Proje Durumları
```http
GET /api/projects/statuses
```

### Dosya Kategorileri
```http
GET /api/file-upload/categories
```

### Aktivite Ekleme
```http
POST /api/activities/add
Content-Type: application/json

{
  "type": string,
  "action": string,
  "description": string,
  "userId": string,
  "userName": string,
  "metadata": object
}
```

### Dashboard Yenileme
```http
POST /api/dashboard/refresh
```

## Kullanım Örnekleri

### Dashboard İstatistiklerini Hesaplama
```typescript
const stats = await calculateDashboardStats();
console.log(`Toplam Proje: ${stats.projectStats.totalProjects}`);
console.log(`Aktif Proje: ${stats.projectStats.activeProjects}`);
console.log(`Genel İlerleme: ${stats.progressStats.overallProgress}%`);
```

### Son Aktiviteleri Getirme
```typescript
const activities = await getRecentActivities(10);
activities.forEach(activity => {
  console.log(`${activity.userName} - ${activity.action}`);
  console.log(`Tarih: ${new Date(activity.timestamp).toLocaleString()}`);
});
```

### Proje Durumlarını Getirme
```typescript
const statuses = await getProjectStatuses();
Object.entries(statuses).forEach(([status, count]) => {
  console.log(`${status}: ${count}`);
});
```

### Aktivite Ekleme
```typescript
const activity = await addActivity({
  type: 'project',
  action: 'create',
  description: 'Yeni proje oluşturuldu',
  userId: 'user123',
  userName: 'John Doe',
  metadata: {
    projectId: 'proj123',
    projectName: 'HVAC Sistemi'
  }
});
```

## Performans Optimizasyonları
- Veri önbellekleme
- Sayfalama
- Lazy loading
- Asenkron veri yükleme
- İsteğe bağlı yenileme

## Güvenlik Önlemleri
- Kullanıcı yetkilendirmesi
- Veri doğrulama
- Rate limiting
- XSS koruması
- CSRF koruması

## Kullanıcı Deneyimi
- Yükleme göstergeleri
- Hata mesajları
- Otomatik yenileme
- Filtreleme seçenekleri
- Responsive tasarım

## Entegrasyon
- Proje modülü
- İlerleme modülü
- Dosya yükleme modülü
- Kullanıcı modülü
- Bildirim sistemi 