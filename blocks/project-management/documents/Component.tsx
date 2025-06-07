import React from 'react';
import { useDocumentManagement } from './logic';

interface DocumentManagementProps {
  projectId: string;
  onDocumentUpdate?: (documentData: any) => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  projectId,
  onDocumentUpdate
}) => {
  const { documentData, updateDocument } = useDocumentManagement(projectId);

  const handleDocumentUpdate = (updates: any) => {
    updateDocument(updates);
    onDocumentUpdate?.(updates);
  };

  return (
    <div className="document-management">
      <div className="document-tabs">
        <button onClick={() => handleDocumentUpdate({ activeTab: 'drawings' })}>
          Teknik Çizimler
        </button>
        <button onClick={() => handleDocumentUpdate({ activeTab: 'contracts' })}>
          Sözleşmeler
        </button>
        <button onClick={() => handleDocumentUpdate({ activeTab: 'reports' })}>
          Raporlar
        </button>
        <button onClick={() => handleDocumentUpdate({ activeTab: 'archive' })}>
          Arşiv
        </button>
      </div>

      <div className="document-content">
        {documentData.activeTab === 'drawings' && (
          <div className="drawings-section">
            <h3>Teknik Çizimler</h3>
            {/* Teknik çizimler içeriği buraya gelecek */}
          </div>
        )}

        {documentData.activeTab === 'contracts' && (
          <div className="contracts-section">
            <h3>Sözleşmeler</h3>
            {/* Sözleşmeler içeriği buraya gelecek */}
          </div>
        )}

        {documentData.activeTab === 'reports' && (
          <div className="reports-section">
            <h3>Raporlar</h3>
            {/* Raporlar içeriği buraya gelecek */}
          </div>
        )}

        {documentData.activeTab === 'archive' && (
          <div className="archive-section">
            <h3>Doküman Arşivi</h3>
            {/* Arşiv içeriği buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement; 