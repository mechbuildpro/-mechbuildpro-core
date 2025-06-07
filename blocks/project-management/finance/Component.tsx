import React from 'react';
import { useFinanceManagement } from './logic';

interface FinanceManagementProps {
  projectId: string;
  onFinanceUpdate?: (financeData: any) => void;
}

export const FinanceManagement: React.FC<FinanceManagementProps> = ({
  projectId,
  onFinanceUpdate
}) => {
  const { financeData, updateFinance } = useFinanceManagement(projectId);

  const handleFinanceUpdate = (updates: any) => {
    updateFinance(updates);
    onFinanceUpdate?.(updates);
  };

  return (
    <div className="finance-management">
      <div className="finance-tabs">
        <button onClick={() => handleFinanceUpdate({ activeTab: 'budget' })}>
          Bütçe
        </button>
        <button onClick={() => handleFinanceUpdate({ activeTab: 'costs' })}>
          Maliyetler
        </button>
        <button onClick={() => handleFinanceUpdate({ activeTab: 'payments' })}>
          Ödemeler
        </button>
        <button onClick={() => handleFinanceUpdate({ activeTab: 'reports' })}>
          Raporlar
        </button>
      </div>

      <div className="finance-content">
        {financeData.activeTab === 'budget' && (
          <div className="budget-section">
            <h3>Bütçe Yönetimi</h3>
            {/* Bütçe yönetimi içeriği buraya gelecek */}
          </div>
        )}

        {financeData.activeTab === 'costs' && (
          <div className="costs-section">
            <h3>Maliyet Takibi</h3>
            {/* Maliyet takibi içeriği buraya gelecek */}
          </div>
        )}

        {financeData.activeTab === 'payments' && (
          <div className="payments-section">
            <h3>Ödeme Planlaması</h3>
            {/* Ödeme planlaması içeriği buraya gelecek */}
          </div>
        )}

        {financeData.activeTab === 'reports' && (
          <div className="reports-section">
            <h3>Finansal Raporlar</h3>
            {/* Finansal raporlar içeriği buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManagement; 