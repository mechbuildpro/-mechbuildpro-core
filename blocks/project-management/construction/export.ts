export { default as Component } from './Component';
export { default as Form } from './Form';
export { useConstructionManagement } from './logic';

// İş Programı Raporları
export const exportScheduleReport = (data: ScheduleData): void => {
  // İş programı raporu oluşturma mantığı buraya gelecek
};

export const exportFoundationReport = (data: FoundationData): void => {
  // Temel işleri raporu oluşturma mantığı buraya gelecek
};

export const exportStructureReport = (data: StructureData): void => {
  // Yapı işleri raporu oluşturma mantığı buraya gelecek
};

export const exportMechanicalReport = (data: MechanicalData): void => {
  // Mekanik işler raporu oluşturma mantığı buraya gelecek
};

export const exportElectricalReport = (data: ElectricalData): void => {
  // Elektrik işleri raporu oluşturma mantığı buraya gelecek
};

export const exportFinishingReport = (data: FinishingData): void => {
  // İç mekan işleri raporu oluşturma mantığı buraya gelecek
};

// İlerleme Raporları
export const exportProgressReport = (data: ProgressData): void => {
  // İlerleme raporu oluşturma mantığı buraya gelecek
};

export const exportDailyReport = (data: ReportData): void => {
  // Günlük rapor oluşturma mantığı buraya gelecek
};

export const exportWeeklyReport = (data: ReportData): void => {
  // Haftalık rapor oluşturma mantığı buraya gelecek
};

export const exportMonthlyReport = (data: ReportData): void => {
  // Aylık rapor oluşturma mantığı buraya gelecek
};

// Kalite Kontrol Raporları
export const exportQualityReport = (data: QualityData): void => {
  // Kalite kontrol raporu oluşturma mantığı buraya gelecek
};

export const exportInspectionReport = (data: QualityData): void => {
  // Denetim raporu oluşturma mantığı buraya gelecek
};

export const exportTestReport = (data: QualityData): void => {
  // Test raporu oluşturma mantığı buraya gelecek
};

export const exportVerificationReport = (data: QualityData): void => {
  // Doğrulama raporu oluşturma mantığı buraya gelecek
};

// Güvenlik Denetim Raporları
export const exportSafetyReport = (data: SafetyData): void => {
  // Güvenlik denetim raporu oluşturma mantığı buraya gelecek
};

export const exportRiskReport = (data: SafetyData): void => {
  // Risk değerlendirme raporu oluşturma mantığı buraya gelecek
};

export const exportAccidentReport = (data: SafetyData): void => {
  // Kaza raporu oluşturma mantığı buraya gelecek
};

export const exportTrainingReport = (data: SafetyData): void => {
  // Eğitim raporu oluşturma mantığı buraya gelecek
};

// İş Emri Raporları
export const exportWorkOrderReport = (data: WorkOrderData): void => {
  // İş emri raporu oluşturma mantığı buraya gelecek
};

export const exportConstructionWorkOrderReport = (data: WorkOrderData): void => {
  // İnşaat iş emri raporu oluşturma mantığı buraya gelecek
};

export const exportMaintenanceWorkOrderReport = (data: WorkOrderData): void => {
  // Bakım iş emri raporu oluşturma mantığı buraya gelecek
};

export const exportRepairWorkOrderReport = (data: WorkOrderData): void => {
  // Tamir iş emri raporu oluşturma mantığı buraya gelecek
};

export const exportInspectionWorkOrderReport = (data: WorkOrderData): void => {
  // Kontrol iş emri raporu oluşturma mantığı buraya gelecek
};

export const exportProjectPlan = (data: ScheduleData): void => {
  // İş planı raporu oluşturma mantığı buraya gelecek
};

export const generateExcel = async (data: Array<ScheduleData | FoundationData | StructureData | MechanicalData | ElectricalData | FinishingData | ProgressData | ReportData | QualityData | SafetyData | WorkOrderData>): Promise<Blob> => {
  // Excel oluşturma mantığı buraya gelecek
  return new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Tip tanımlamaları
interface ScheduleData {
  startDate: Date;
  endDate: Date;
  activities: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    progress: number;
  }>;
}

interface FoundationData {
  type: string;
  dimensions: {
    width: number;
    length: number;
    depth: number;
  };
  materials: Array<{
    type: string;
    quantity: number;
    unit: string;
  }>;
  status: 'planned' | 'in_progress' | 'completed';
}

interface StructureData {
  type: string;
  elements: Array<{
    type: string;
    quantity: number;
    specifications: Record<string, string>;
  }>;
  status: 'planned' | 'in_progress' | 'completed';
}

interface MechanicalData {
  systems: Array<{
    type: string;
    capacity: number;
    specifications: Record<string, string>;
  }>;
  status: 'planned' | 'in_progress' | 'completed';
}

interface ElectricalData {
  systems: Array<{
    type: string;
    capacity: number;
    specifications: Record<string, string>;
  }>;
  status: 'planned' | 'in_progress' | 'completed';
}

interface FinishingData {
  areas: Array<{
    type: string;
    area: number;
    materials: Array<{
      type: string;
      quantity: number;
      unit: string;
    }>;
  }>;
  status: 'planned' | 'in_progress' | 'completed';
}

interface ProgressData {
  overallProgress: number;
  activities: Array<{
    id: string;
    name: string;
    plannedProgress: number;
    actualProgress: number;
    status: 'on_track' | 'delayed' | 'ahead';
  }>;
}

interface ReportData {
  date: Date;
  activities: Array<{
    id: string;
    name: string;
    status: string;
    notes: string;
  }>;
}

interface QualityData {
  inspections: Array<{
    id: string;
    type: string;
    date: Date;
    status: 'passed' | 'failed' | 'pending';
    notes: string;
  }>;
}

interface SafetyData {
  inspections: Array<{
    id: string;
    type: string;
    date: Date;
    findings: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      status: 'open' | 'closed';
    }>;
  }>;
}

interface WorkOrderData {
  id: string;
  type: string;
  status: 'open' | 'in_progress' | 'completed';
  assignedTo: string;
  startDate: Date;
  endDate: Date;
  description: string;
} 