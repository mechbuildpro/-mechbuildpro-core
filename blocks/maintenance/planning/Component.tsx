import React, { useState, useEffect } from 'react';
import {
  createMaintenancePlan,
  getMaintenancePlans,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  updateChecklistItem,
  updateMaintenanceMaterial,
  calculateMaintenanceStats,
  updateMaintenanceStatus,
  assignMaintenancePlan,
  type MaintenancePlan,
  type MaintenanceStats
} from './logic';

export const MaintenancePlanningComponent: React.FC = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, statsData] = await Promise.all([
        getMaintenancePlans(filters),
        calculateMaintenanceStats()
      ]);
      setPlans(plansData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Veri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async (planId: string, status: MaintenancePlan['status']) => {
    try {
      const updatedPlan = await updateMaintenanceStatus(planId, status);
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      await loadData(); // İstatistikleri güncelle
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
    }
  };

  const handleAssign = async (planId: string, assignedTo: string) => {
    try {
      const updatedPlan = await assignMaintenancePlan(planId, assignedTo);
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
    } catch (err) {
      console.error('Atama hatası:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Toplam Plan</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalPlans}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Tamamlanan</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.completedPlans}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Bekleyen</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pendingPlans}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Devam Eden</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.inProgressPlans}</p>
        </div>
      </div>

      {/* Öncelik ve Tip Dağılımı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Öncelik Dağılımı</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Kritik</span>
                <span className="text-sm font-medium text-gray-700">{stats?.priorityDistribution.critical}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(stats?.priorityDistribution.critical || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Yüksek</span>
                <span className="text-sm font-medium text-gray-700">{stats?.priorityDistribution.high}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stats?.priorityDistribution.high || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Orta</span>
                <span className="text-sm font-medium text-gray-700">{stats?.priorityDistribution.medium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats?.priorityDistribution.medium || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Düşük</span>
                <span className="text-sm font-medium text-gray-700">{stats?.priorityDistribution.low}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats?.priorityDistribution.low || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tip Dağılımı</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Rutin</span>
                <span className="text-sm font-medium text-gray-700">{stats?.typeDistribution.routine}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats?.typeDistribution.routine || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Önleyici</span>
                <span className="text-sm font-medium text-gray-700">{stats?.typeDistribution.preventive}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats?.typeDistribution.preventive || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Düzeltici</span>
                <span className="text-sm font-medium text-gray-700">{stats?.typeDistribution.corrective}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats?.typeDistribution.corrective || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Acil</span>
                <span className="text-sm font-medium text-gray-700">{stats?.typeDistribution.emergency}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats?.typeDistribution.emergency || 0) / (stats?.totalPlans || 1) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Filtreler</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tip</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="routine">Rutin</option>
              <option value="preventive">Önleyici</option>
              <option value="corrective">Düzeltici</option>
              <option value="emergency">Acil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Öncelik</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="pending">Bekliyor</option>
              <option value="in-progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bakım Planları Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Bakım Planları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öncelik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlangıç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{plan.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      plan.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      plan.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {plan.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{plan.assignedTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(plan.startDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(plan.endDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(plan.id, 'in-progress')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Başlat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seçili Plan Detayları */}
      {selectedPlan && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Plan Detayları</h2>
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Kapat
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Temel Bilgiler</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan Adı</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tip</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Öncelik</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.priority}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Durum</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.status}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Zaman Bilgileri</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Başlangıç Tarihi</dt>
                  <dd className="text-sm text-gray-900">{new Date(selectedPlan.startDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bitiş Tarihi</dt>
                  <dd className="text-sm text-gray-900">{new Date(selectedPlan.endDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tahmini Süre</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.estimatedDuration} dakika</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gerçekleşen Süre</dt>
                  <dd className="text-sm text-gray-900">{selectedPlan.actualDuration || '-'} dakika</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Kontrol Listesi</h3>
            <div className="space-y-4">
              {selectedPlan.checklist.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => updateChecklistItem(selectedPlan.id, item.id, { isCompleted: !item.isCompleted })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-500">{item.notes}</p>
                    )}
                  </div>
                  {item.isCompleted && (
                    <span className="text-sm text-gray-500">
                      {new Date(item.completedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Malzemeler</h3>
            <div className="space-y-4">
              {selectedPlan.materials.map((material) => (
                <div key={material.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{material.name}</h4>
                      <p className="text-sm text-gray-500">
                        {material.quantity} {material.unit}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      material.status === 'available' ? 'bg-green-100 text-green-800' :
                      material.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                      material.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {material.status}
                    </span>
                  </div>
                  {material.notes && (
                    <p className="mt-2 text-sm text-gray-500">{material.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Notlar</h3>
            <p className="text-sm text-gray-900">{selectedPlan.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 