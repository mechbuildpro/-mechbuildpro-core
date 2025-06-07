import React from 'react';
import { useResourceManagement } from './logic';

interface ResourceManagementProps {
  projectId: string;
  onResourceUpdate?: (resourceData: any) => void;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  projectId,
  onResourceUpdate
}) => {
  const { resourceData, updateResource } = useResourceManagement(projectId);

  const handleResourceUpdate = (updates: any) => {
    updateResource(updates);
    onResourceUpdate?.(updates);
  };

  return (
    <div className="resource-management">
      <div className="resource-tabs">
        <button onClick={() => handleResourceUpdate({ activeTab: 'equipment' })}>
          Ekipman Listesi
        </button>
        <button onClick={() => handleResourceUpdate({ activeTab: 'materials' })}>
          Malzeme Listesi
        </button>
        <button onClick={() => handleResourceUpdate({ activeTab: 'workforce' })}>
          İş Gücü Listesi
        </button>
        <button onClick={() => handleResourceUpdate({ activeTab: 'vehicles' })}>
          Araç Listesi
        </button>
        <button onClick={() => handleResourceUpdate({ activeTab: 'building' })}>
          Bina Sistemleri
        </button>
      </div>

      <div className="resource-content">
        {resourceData.activeTab === 'equipment' && (
          <div className="equipment-section">
            <h3>Ekipman Listesi</h3>
            <div className="equipment-filters">
              <input type="text" placeholder="Ekipman Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="construction">İnşaat Ekipmanları</option>
                <option value="electrical">Elektrik Ekipmanları</option>
                <option value="mechanical">Mekanik Ekipmanlar</option>
                <option value="safety">Güvenlik Ekipmanları</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="available">Kullanılabilir</option>
                <option value="in_use">Kullanımda</option>
                <option value="maintenance">Bakımda</option>
                <option value="repair">Tamirde</option>
              </select>
            </div>
            {/* Ekipman listesi buraya gelecek */}
          </div>
        )}

        {resourceData.activeTab === 'materials' && (
          <div className="materials-section">
            <h3>Malzeme Listesi</h3>
            <div className="materials-filters">
              <input type="text" placeholder="Malzeme Ara..." />
              <select>
                <option value="">Tüm Kategoriler</option>
                <option value="construction">İnşaat Malzemeleri</option>
                <option value="electrical">Elektrik Malzemeleri</option>
                <option value="mechanical">Mekanik Malzemeler</option>
                <option value="safety">Güvenlik Malzemeleri</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="in_stock">Stokta</option>
                <option value="low_stock">Az Stok</option>
                <option value="out_of_stock">Stok Yok</option>
                <option value="ordered">Sipariş Verildi</option>
              </select>
            </div>
            {/* Malzeme listesi buraya gelecek */}
          </div>
        )}

        {resourceData.activeTab === 'workforce' && (
          <div className="workforce-section">
            <h3>İş Gücü Listesi</h3>
            <div className="workforce-filters">
              <input type="text" placeholder="Personel Ara..." />
              <select>
                <option value="">Tüm Departmanlar</option>
                <option value="construction">İnşaat</option>
                <option value="electrical">Elektrik</option>
                <option value="mechanical">Mekanik</option>
                <option value="safety">Güvenlik</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="available">Müsait</option>
                <option value="busy">Meşgul</option>
                <option value="off">İzinli</option>
              </select>
            </div>
            {/* İş gücü listesi buraya gelecek */}
          </div>
        )}

        {resourceData.activeTab === 'vehicles' && (
          <div className="vehicles-section">
            <h3>Araç Listesi</h3>
            <div className="vehicles-filters">
              <input type="text" placeholder="Araç Ara..." />
              <select>
                <option value="">Tüm Tipler</option>
                <option value="car">Otomobil</option>
                <option value="truck">Kamyon</option>
                <option value="van">Minibüs</option>
                <option value="special">Özel Araç</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="available">Müsait</option>
                <option value="in_use">Kullanımda</option>
                <option value="maintenance">Bakımda</option>
                <option value="repair">Tamirde</option>
              </select>
            </div>
            {/* Araç listesi buraya gelecek */}
          </div>
        )}

        {resourceData.activeTab === 'building' && (
          <div className="building-section">
            <h3>Bina Sistemleri</h3>
            <div className="building-filters">
              <input type="text" placeholder="Ekipman Ara..." />
              <select>
                <option value="">Tüm Sistemler</option>
                <option value="hvac">HVAC Sistemleri</option>
                <option value="electrical">Elektrik Sistemleri</option>
                <option value="plumbing">Tesisat Sistemleri</option>
                <option value="fire">Yangın Sistemleri</option>
              </select>
              <select>
                <option value="">Tüm Durumlar</option>
                <option value="operational">Çalışır Durumda</option>
                <option value="maintenance">Bakımda</option>
                <option value="repair">Tamirde</option>
                <option value="replacement">Değişim Gerekli</option>
              </select>
            </div>

            <div className="building-systems">
              <div className="hvac-systems">
                <h4>HVAC Sistemleri</h4>
                <ul>
                  <li>AHU (Hava İşleme Üniteleri)</li>
                  <li>Fan Coil Üniteleri</li>
                  <li>Chiller Üniteleri</li>
                  <li>Pompalar</li>
                  <li>Soğutma Kuleleri</li>
                  <li>VAV Üniteleri</li>
                  <li>Klima Santralleri</li>
                </ul>
              </div>

              <div className="electrical-systems">
                <h4>Elektrik Sistemleri</h4>
                <ul>
                  <li>Trafo Merkezleri</li>
                  <li>Jeneratörler</li>
                  <li>UPS Sistemleri</li>
                  <li>Ana Panolar</li>
                  <li>Dağıtım Panoları</li>
                  <li>Aydınlatma Sistemleri</li>
                </ul>
              </div>

              <div className="plumbing-systems">
                <h4>Tesisat Sistemleri</h4>
                <ul>
                  <li>Su Pompaları</li>
                  <li>Basınç Tankları</li>
                  <li>Su Deposu</li>
                  <li>Atık Su Pompaları</li>
                  <li>Yağmur Suyu Sistemleri</li>
                </ul>
              </div>

              <div className="fire-systems">
                <h4>Yangın Sistemleri</h4>
                <ul>
                  <li>Yangın Pompaları</li>
                  <li>Yangın Söndürme Sistemleri</li>
                  <li>Duman Tahliye Sistemleri</li>
                  <li>Yangın Alarm Sistemleri</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagement; 