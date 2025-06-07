# Zaman Çizelgesi Modülü

Bu modül, proje görevlerinin ve zamanlamalarının yönetimi için kullanılır. Görevlerin oluşturulması, takibi ve raporlanması işlemlerini gerçekleştirir.

## Özellikler

- Görev oluşturma ve yönetme
- Görev durumu takibi (Başlamadı, Devam Ediyor, Tamamlandı, Gecikti)
- Öncelik seviyeleri (Düşük, Orta, Yüksek)
- Görev bağımlılıkları
- Modül bazlı görev organizasyonu
- İlerleme istatistikleri
- Gantt şeması görünümü

## Görev Yapısı

Her görev aşağıdaki bilgileri içerir:

```typescript
interface Task {
  id: string;
  taskName: string;
  description?: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  assignedTo?: string;
  dependencies?: string[];
  estimatedHours: number;
  actualHours?: number;
  module: 'hvac' | 'fire-pump' | 'zoning' | 'boq' | 'sozlesme';
  milestone: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoint'leri

### Görev Oluşturma
```http
POST /api/timeline/task
Content-Type: application/json

{
  "taskName": string,
  "description": string,
  "startDate": string,
  "endDate": string,
  "priority": "low" | "medium" | "high",
  "status": "not_started" | "in_progress" | "completed" | "delayed",
  "assignedTo": string,
  "dependencies": string[],
  "estimatedHours": number,
  "actualHours": number,
  "module": "hvac" | "fire-pump" | "zoning" | "boq" | "sozlesme",
  "milestone": boolean,
  "notes": string
}
```

### Görev Güncelleme
```http
PATCH /api/timeline/task/:id
Content-Type: application/json

{
  // Güncellenecek alanlar
}
```

### Görev Silme
```http
DELETE /api/timeline/task/:id
```

### Görev Listesi Alma
```http
GET /api/timeline/tasks?status=&priority=&module=&assignedTo=&startDate=&endDate=
```

## İstatistikler

Modül, aşağıdaki istatistikleri hesaplar:

```typescript
interface TimelineStats {
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionRate: number;
  moduleStats: {
    [key: string]: {
      total: number;
      completed: number;
      inProgress: number;
      delayed: number;
    };
  };
}
```

## Kullanım Örneği

```typescript
// Görev oluşturma
const newTask = await createTask({
  taskName: "HVAC Sistem Tasarımı",
  description: "Ana HVAC sisteminin tasarımı ve hesaplamaları",
  startDate: "2024-03-01",
  endDate: "2024-03-15",
  priority: "high",
  status: "not_started",
  estimatedHours: 40,
  module: "hvac",
  milestone: false
});

// Görev listesi alma
const tasks = await getTasks({
  status: "in_progress",
  module: "hvac"
});

// İstatistikleri hesaplama
const stats = calculateStats(tasks);
```

## Gantt Şeması

Gantt şeması için veri hazırlama:

```typescript
const ganttData = prepareGanttData(tasks);
```

Her görev için aşağıdaki formatta veri oluşturulur:

```typescript
{
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone';
  dependencies: string[];
  custom_class: string;
}
```

## Görev Bağımlılıkları

Görev bağımlılıklarının kontrolü:

```typescript
const { valid, errors } = validateDependencies(tasks);
```

## Hata Yönetimi

- Görev oluşturma/güncelleme/silme işlemlerinde hata durumları kontrol edilir
- Bağımlılık döngüleri kontrol edilir
- Tarih çakışmaları kontrol edilir
- Zorunlu alanların doldurulması kontrol edilir

## Performans Optimizasyonu

- Görev listesi sayfalama ile yüklenir
- İstatistikler önbelleğe alınır
- Gantt şeması verileri optimize edilir
- Bağımlılık kontrolleri asenkron yapılır 