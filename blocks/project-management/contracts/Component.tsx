import React from 'react';
import { useContractManagement } from './logic';

interface ContractManagementProps {
  projectId: string;
  onContractUpdate?: (contractData: any) => void;
}

export const ContractManagement: React.FC<ContractManagementProps> = ({
  projectId,
  onContractUpdate
}) => {
  const { contractData, updateContract } = useContractManagement(projectId);

  const handleContractUpdate = (updates: any) => {
    updateContract(updates);
    onContractUpdate?.(updates);
  };

  return (
    <div className="contract-management">
      <div className="contract-tabs">
        <button onClick={() => handleContractUpdate({ activeTab: 'boq' })}>
          Metraj (BOQ)
        </button>
        <button onClick={() => handleContractUpdate({ activeTab: 'progress' })}>
          Hakediş
        </button>
        <button onClick={() => handleContractUpdate({ activeTab: 'rfi' })}>
          Bilgi Talebi (RFI)
        </button>
        <button onClick={() => handleContractUpdate({ activeTab: 'contract' })}>
          Sözleşme
        </button>
      </div>

      <div className="contract-content">
        {contractData.activeTab === 'boq' && (
          <div className="boq-section">
            <h3>Metraj (BOQ)</h3>
            {/* Metraj içeriği buraya gelecek */}
          </div>
        )}

        {contractData.activeTab === 'progress' && (
          <div className="progress-section">
            <h3>Hakediş Yönetimi</h3>
            {/* Hakediş içeriği buraya gelecek */}
          </div>
        )}

        {contractData.activeTab === 'rfi' && (
          <div className="rfi-section">
            <h3>Bilgi Talebi (RFI)</h3>
            {/* RFI içeriği buraya gelecek */}
          </div>
        )}

        {contractData.activeTab === 'contract' && (
          <div className="contract-section">
            <h3>Sözleşme Takibi</h3>
            {/* Sözleşme içeriği buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManagement; 