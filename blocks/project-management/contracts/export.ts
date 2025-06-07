export { default as ContractManagement } from './Component';
export { default as ContractForm } from './Form';
export { useContractManagement } from './logic';

// Metraj (BOQ) raporu dışa aktarma
export const exportBOQReport = async (projectId: string) => {
  // Metraj raporu dışa aktarma mantığı buraya gelecek
};

// Hakediş raporu dışa aktarma
export const exportProgressReport = async (projectId: string) => {
  // Hakediş raporu dışa aktarma mantığı buraya gelecek
};

// RFI raporu dışa aktarma
export const exportRFIReport = async (projectId: string) => {
  // RFI raporu dışa aktarma mantığı buraya gelecek
};

// Sözleşme değişiklik raporu dışa aktarma
export const exportContractChangeReport = async (projectId: string) => {
  // Sözleşme değişiklik raporu dışa aktarma mantığı buraya gelecek
}; 