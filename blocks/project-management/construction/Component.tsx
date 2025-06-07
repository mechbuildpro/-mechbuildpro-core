import React from 'react';
import { useConstructionManagement, ConstructionData } from './logic';

interface ConstructionManagementProps {
  projectId: string;
  onConstructionUpdate?: (constructionData: ConstructionData) => void;
}

export const ConstructionManagement: React.FC<ConstructionManagementProps> = ({
  projectId,
  onConstructionUpdate
}) => {
  const { constructionData, updateConstruction } = useConstructionManagement(projectId);

  const handleConstructionUpdate = (updates: Partial<ConstructionData>) => {
    updateConstruction(updates);
    onConstructionUpdate?.(constructionData);
  };

  return (
    <div className="construction-management">
      <div className="construction-tabs">
        <button onClick={() => handleConstructionUpdate({ activeTab: 'schedule' })}>
          İş Programı
        </button>
        <button onClick={() => handleConstructionUpdate({ activeTab: 'progress' })}>
          İlerleme Raporları
        </button>
        <button onClick={() => handleConstructionUpdate({ activeTab: 'quality' })}>
          Kalite Kontrol
        </button>
        <button onClick={() => handleConstructionUpdate({ activeTab: 'safety' })}>
          Güvenlik Denetimleri
        </button>
        <button onClick={() => handleConstructionUpdate({ activeTab: 'workorders' })}>
          İş Emirleri
        </button>
      </div>

      <div className="construction-content">
        {constructionData.activeTab === 'schedule' && (
          <div className="schedule-section">
            <h3>İş Programı</h3>
            <div className="schedule-filters">
              <input type="text" placeholder="İş Paketi Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="foundation">Temel</option>
                <option value="structure">Yapı</option>
                <option value="mechanical">Mekanik</option>
                <option value="electrical">Elektrik</option>
                <option value="finishing">İç Mekan</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="not_started">Başlamadı</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="delayed">Gecikmeli</option>
              </select>
            </div>
            {/* İş programı listesi buraya gelecek */}
          </div>
        )}

        {constructionData.activeTab === 'progress' && (
          <div className="progress-section">
            <h3>İlerleme Raporları</h3>
            <div className="progress-filters">
              <input type="text" placeholder="Rapor Ara..." />
              <select>
                <option value="">Tüm Raporlar</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="on_time">Zamanında</option>
                <option value="delayed">Gecikmeli</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
            {/* İlerleme raporları listesi buraya gelecek */}
          </div>
        )}

        {constructionData.activeTab === 'quality' && (
          <div className="quality-section">
            <h3>Kalite Kontrol</h3>
            <div className="quality-filters">
              <input type="text" placeholder="Kontrol Ara..." />
              <select>
                <option value="">Tüm Kontroller</option>
                <option value="inspection">Denetim</option>
                <option value="test">Test</option>
                <option value="verification">Doğrulama</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="passed">Geçti</option>
                <option value="failed">Başarısız</option>
                <option value="pending">Beklemede</option>
              </select>
            </div>
            {/* Kalite kontrol listesi buraya gelecek */}
          </div>
        )}

        {constructionData.activeTab === 'safety' && (
          <div className="safety-section">
            <h3>Güvenlik Denetimleri</h3>
            <div className="safety-filters">
              <input type="text" placeholder="Denetim Ara..." />
              <select>
                <option value="">Tüm Denetimler</option>
                <option value="inspection">Kontrol</option>
                <option value="risk">Risk Değerlendirmesi</option>
                <option value="accident">Kaza Raporu</option>
                <option value="training">Eğitim</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="passed">Geçti</option>
                <option value="failed">Başarısız</option>
                <option value="pending">Beklemede</option>
              </select>
            </div>
            {/* Güvenlik denetimleri listesi buraya gelecek */}
          </div>
        )}

        {constructionData.activeTab === 'workorders' && (
          <div className="workorders-section">
            <h3>İş Emirleri</h3>
            <div className="workorders-filters">
              <input type="text" placeholder="İş Emri Ara..." />
              <select>
                <option value="">Tüm İş Emirleri</option>
                <option value="construction">İnşaat</option>
                <option value="maintenance">Bakım</option>
                <option value="repair">Tamir</option>
                <option value="inspection">Kontrol</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            {/* İş emirleri listesi buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionManagement; 