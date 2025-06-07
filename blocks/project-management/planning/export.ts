// Proje planlama modülü için export fonksiyonları
export * from './Component';
export * from './Form';
export * from './logic';

import { PlanData } from './logic';

// Özel export fonksiyonları
export const exportProjectPlan = (data: PlanData): void => {
  // Proje planı dışa aktırma işlemleri
};

export const exportGanttChart = (data: PlanData['schedule']): void => {
  // Gantt şeması dışa aktırma işlemleri
};

export const exportResourcePlan = (data: PlanData['resources']): void => {
  // Kaynak planı dışa aktarma işlemleri
};

export const exportCostPlan = (data: PlanData['cost']): void => {
  // Maliyet planı dışa aktarma işlemleri
}; 