// Doküman yönetimi modülü için export fonksiyonları
export * from './Component';
export * from './Form';
export * from './logic';

// Özel export fonksiyonları
export const exportDrawingReport = (data: any): void => {
  // Teknik çizim raporu dışa aktarma işlemleri
};

export const exportContractReport = (data: any): void => {
  // Sözleşme raporu dışa aktarma işlemleri
};

export const exportProgressReport = (data: any): void => {
  // İlerleme raporu dışa aktarma işlemleri
};

export const exportArchiveReport = (data: any): void => {
  // Arşiv raporu dışa aktarma işlemleri
}; 