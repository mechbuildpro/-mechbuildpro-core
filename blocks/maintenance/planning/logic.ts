export interface MaintenancePlan {
  id: string;
  name: string;
  type: 'routine' | 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  systemId: string;
  systemType: string;
  location: string;
  description: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  estimatedDuration: number; // dakika
  actualDuration?: number; // dakika
  checklist: MaintenanceChecklistItem[];
  materials: MaintenanceMaterial[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface MaintenanceMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'available' | 'ordered' | 'received' | 'used';
  notes?: string;
}

export interface MaintenanceStats {
  totalPlans: number;
  completedPlans: number;
  pendingPlans: number;
  inProgressPlans: number;
  cancelledPlans: number;
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  typeDistribution: {
    routine: number;
    preventive: number;
    corrective: number;
    emergency: number;
  };
  averageCompletionTime: number; // dakika
  onTimeCompletionRate: number; // yüzde
}

// Bakım planı oluşturma
export async function createMaintenancePlan(plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
  try {
    const response = await fetch('/api/maintenance/plans/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plan)
    });

    if (!response.ok) {
      throw new Error('Bakım planı oluşturulamadı');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım planı oluşturma hatası:', error);
    throw error;
  }
}

// Bakım planlarını listeleme
export async function getMaintenancePlans(filters?: {
  type?: MaintenancePlan['type'];
  priority?: MaintenancePlan['priority'];
  status?: MaintenancePlan['status'];
  systemId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<MaintenancePlan[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }

    const response = await fetch(`/api/maintenance/plans/list?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Bakım planları listelenemedi');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım planları listeleme hatası:', error);
    throw error;
  }
}

// Bakım planı güncelleme
export async function updateMaintenancePlan(id: string, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
  try {
    const response = await fetch(`/api/maintenance/plans/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Bakım planı güncellenemedi');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım planı güncelleme hatası:', error);
    throw error;
  }
}

// Bakım planı silme
export async function deleteMaintenancePlan(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/maintenance/plans/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Bakım planı silinemedi');
    }
  } catch (error) {
    console.error('Bakım planı silme hatası:', error);
    throw error;
  }
}

// Bakım kontrol listesi öğesi güncelleme
export async function updateChecklistItem(
  planId: string,
  itemId: string,
  updates: Partial<MaintenanceChecklistItem>
): Promise<MaintenanceChecklistItem> {
  try {
    const response = await fetch(`/api/maintenance/plans/${planId}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Kontrol listesi öğesi güncellenemedi');
    }

    return response.json();
  } catch (error) {
    console.error('Kontrol listesi öğesi güncelleme hatası:', error);
    throw error;
  }
}

// Bakım malzemesi güncelleme
export async function updateMaintenanceMaterial(
  planId: string,
  materialId: string,
  updates: Partial<MaintenanceMaterial>
): Promise<MaintenanceMaterial> {
  try {
    const response = await fetch(`/api/maintenance/plans/${planId}/materials/${materialId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Bakım malzemesi güncellenemedi');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım malzemesi güncelleme hatası:', error);
    throw error;
  }
}

// İstatistikleri hesaplama
export async function calculateMaintenanceStats(): Promise<MaintenanceStats> {
  try {
    const plans = await getMaintenancePlans();
    
    const stats: MaintenanceStats = {
      totalPlans: plans.length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      pendingPlans: plans.filter(p => p.status === 'pending').length,
      inProgressPlans: plans.filter(p => p.status === 'in-progress').length,
      cancelledPlans: plans.filter(p => p.status === 'cancelled').length,
      priorityDistribution: {
        low: plans.filter(p => p.priority === 'low').length,
        medium: plans.filter(p => p.priority === 'medium').length,
        high: plans.filter(p => p.priority === 'high').length,
        critical: plans.filter(p => p.priority === 'critical').length
      },
      typeDistribution: {
        routine: plans.filter(p => p.type === 'routine').length,
        preventive: plans.filter(p => p.type === 'preventive').length,
        corrective: plans.filter(p => p.type === 'corrective').length,
        emergency: plans.filter(p => p.type === 'emergency').length
      },
      averageCompletionTime: calculateAverageCompletionTime(plans),
      onTimeCompletionRate: calculateOnTimeCompletionRate(plans)
    };

    return stats;
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    throw error;
  }
}

// Ortalama tamamlanma süresini hesaplama
function calculateAverageCompletionTime(plans: MaintenancePlan[]): number {
  const completedPlans = plans.filter(p => p.status === 'completed' && p.actualDuration);
  if (completedPlans.length === 0) return 0;

  const totalDuration = completedPlans.reduce((sum, plan) => sum + (plan.actualDuration || 0), 0);
  return Math.round(totalDuration / completedPlans.length);
}

// Zamanında tamamlanma oranını hesaplama
function calculateOnTimeCompletionRate(plans: MaintenancePlan[]): number {
  const completedPlans = plans.filter(p => p.status === 'completed' && p.actualDuration);
  if (completedPlans.length === 0) return 0;

  const onTimePlans = completedPlans.filter(plan => 
    (plan.actualDuration || 0) <= plan.estimatedDuration
  );

  return Math.round((onTimePlans.length / completedPlans.length) * 100);
}

// Bakım planı durumunu güncelleme
export async function updateMaintenanceStatus(
  planId: string,
  status: MaintenancePlan['status'],
  actualDuration?: number
): Promise<MaintenancePlan> {
  try {
    const response = await fetch(`/api/maintenance/plans/${planId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, actualDuration })
    });

    if (!response.ok) {
      throw new Error('Bakım planı durumu güncellenemedi');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım planı durumu güncelleme hatası:', error);
    throw error;
  }
}

// Bakım planı atama
export async function assignMaintenancePlan(
  planId: string,
  assignedTo: string
): Promise<MaintenancePlan> {
  try {
    const response = await fetch(`/api/maintenance/plans/${planId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assignedTo })
    });

    if (!response.ok) {
      throw new Error('Bakım planı atanamadı');
    }

    return response.json();
  } catch (error) {
    console.error('Bakım planı atama hatası:', error);
    throw error;
  }
} 