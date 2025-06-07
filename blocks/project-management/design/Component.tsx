import React from 'react';
import { useDesignManagement } from './logic';

interface DesignManagementProps {
  projectId: string;
  onDesignUpdate?: (designData: any) => void;
}

export const DesignManagement: React.FC<DesignManagementProps> = ({
  projectId,
  onDesignUpdate
}) => {
  const { designData, updateDesign } = useDesignManagement(projectId);

  const handleDesignUpdate = (updates: any) => {
    updateDesign(updates);
    onDesignUpdate?.(updates);
  };

  return (
    <div className="design-management">
      <div className="design-tabs">
        <button onClick={() => handleDesignUpdate({ activeTab: 'drawings' })}>
          Teknik Çizimler
        </button>
        <button onClick={() => handleDesignUpdate({ activeTab: 'models' })}>
          3D Modeller
        </button>
        <button onClick={() => handleDesignUpdate({ activeTab: 'revisions' })}>
          Tasarım Revizyonları
        </button>
        <button onClick={() => handleDesignUpdate({ activeTab: 'approvals' })}>
          Tasarım Onayları
        </button>
        <button onClick={() => handleDesignUpdate({ activeTab: 'documentation' })}>
          Dokümantasyon
        </button>
      </div>

      <div className="design-content">
        {designData.activeTab === 'drawings' && (
          <div className="drawings-section">
            <h3>Teknik Çizimler</h3>
            <div className="drawings-filters">
              <input type="text" placeholder="Çizim Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="architectural">Mimari</option>
                <option value="structural">Statik</option>
                <option value="mechanical">Mekanik</option>
                <option value="electrical">Elektrik</option>
                <option value="fire">Yangın</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="review">İncelemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            {/* Çizim listesi buraya gelecek */}
          </div>
        )}

        {designData.activeTab === 'models' && (
          <div className="models-section">
            <h3>3D Modeller</h3>
            <div className="models-filters">
              <input type="text" placeholder="Model Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="bim">BIM</option>
                <option value="render">Render</option>
                <option value="animation">Animasyon</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="review">İncelemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            {/* Model listesi buraya gelecek */}
          </div>
        )}

        {designData.activeTab === 'revisions' && (
          <div className="revisions-section">
            <h3>Tasarım Revizyonları</h3>
            <div className="revisions-filters">
              <input type="text" placeholder="Revizyon Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="architectural">Mimari</option>
                <option value="structural">Statik</option>
                <option value="mechanical">Mekanik</option>
                <option value="electrical">Elektrik</option>
                <option value="fire">Yangın</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="review">İncelemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            {/* Revizyon listesi buraya gelecek */}
          </div>
        )}

        {designData.activeTab === 'approvals' && (
          <div className="approvals-section">
            <h3>Tasarım Onayları</h3>
            <div className="approvals-filters">
              <input type="text" placeholder="Onay Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="architectural">Mimari</option>
                <option value="structural">Statik</option>
                <option value="mechanical">Mekanik</option>
                <option value="electrical">Elektrik</option>
                <option value="fire">Yangın</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            {/* Onay listesi buraya gelecek */}
          </div>
        )}

        {designData.activeTab === 'documentation' && (
          <div className="documentation-section">
            <h3>Tasarım Dokümantasyonu</h3>
            <div className="documentation-filters">
              <input type="text" placeholder="Doküman Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="specifications">Teknik Şartnameler</option>
                <option value="products">Ürün Dokümantasyonu</option>
                <option value="standards">Standartlar ve Kodlar</option>
                <option value="references">Referans Dokümanlar</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="review">İncelemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            {/* Doküman listesi buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignManagement; 