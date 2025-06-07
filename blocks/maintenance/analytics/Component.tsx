import React, { useState } from 'react';
import { TaskAnalytics, AnalyticsFilters } from './types';
import { MaintenanceTask, Equipment } from '../types';
import { calculateTaskAnalytics } from './logic';
import { BarChart, LineChart } from './charts/ChartComponent';

interface AnalyticsComponentProps {
  tasks: MaintenanceTask[];
  equipment: Equipment[];
}

export const AnalyticsComponent: React.FC<AnalyticsComponentProps> = ({ tasks, equipment }) => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const analytics = React.useMemo(() => {
    setIsLoadingAnalytics(true);
    const result = calculateTaskAnalytics(tasks, equipment, filters);
    setIsLoadingAnalytics(false);
    return result;
  }, [tasks, equipment, filters]);

  // Prepare data for charts
  const statusData = Object.entries(analytics.tasksByStatus).map(([status, count]) => ({
    label: status,
    value: count,
  }));

  const priorityData = Object.entries(analytics.tasksByPriority).map(([priority, count]) => ({
    label: priority,
    value: count,
  }));

  const monthlyData = analytics.monthlyTrends.map(trend => ({
    label: trend.month,
    value: trend.completedTasks,
  }));

  const completionTimeData = analytics.monthlyTrends.map(trend => ({
    label: trend.month,
    value: trend.averageCompletionTime,
  }));

  return (
    <div className="analytics p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bakım Analitikleri</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ekipman</label>
            <select
              onChange={(e) => setFilters(prev => ({ ...prev, equipmentId: e.target.value || undefined }))}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Tümü</option>
              {equipment.map(equip => (
                <option key={equip.id} value={equip.id}>{equip.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Toplam Görev</h4>
          <p className="text-2xl font-bold">{isLoadingAnalytics ? '...' : analytics.totalTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Tamamlanan</h4>
          <p className="text-2xl font-bold text-green-600">{isLoadingAnalytics ? '...' : analytics.tasksByStatus.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Devam Eden</h4>
          <p className="text-2xl font-bold text-blue-600">{isLoadingAnalytics ? '...' : analytics.tasksByStatus.in_progress}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Ortalama Tamamlanma Süresi</h4>
          <p className="text-2xl font-bold">{isLoadingAnalytics ? '...' : analytics.averageCompletionTime.toFixed(1)} gün</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Minimum Tamamlanma Süresi</h4>
          <p className="text-2xl font-bold">{isLoadingAnalytics ? '...' : (analytics as any).minCompletionTime.toFixed(1)} gün</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">Maksimum Tamamlanma Süresi</h4>
          <p className="text-2xl font-bold">{isLoadingAnalytics ? '...' : (analytics as any).maxCompletionTime.toFixed(1)} gün</p>
        </div>
      </div>

      {/* New Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : statusData.length > 0 ? (
            <BarChart
              data={statusData}
              title="Görev Durumu Dağılımı"
              color="#3B82F6"
            />
          ) : (
            <p className="text-center text-gray-600">Görev Durumu verisi bulunamadı.</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          {isLoadingAnalytics ? (
             <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : priorityData.length > 0 ? (
            <BarChart
              data={priorityData}
              title="Öncelik Dağılımı"
              color="#10B981"
            />
          ) : (
            <p className="text-center text-gray-600">Öncelik verisi bulunamadı.</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
           {isLoadingAnalytics ? (
             <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : monthlyData.length > 0 ? (
            <LineChart
              data={monthlyData}
              title="Aylık Tamamlanan Görevler"
              color="#6366F1"
            />
          ) : (
             <p className="text-center text-gray-600">Aylık tamamlanan görev verisi bulunamadı.</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          {isLoadingAnalytics ? (
             <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : completionTimeData.length > 0 ? (
            <LineChart
              data={completionTimeData}
              title="Aylık Ortalama Tamamlanma Süresi (Gün)"
              color="#F59E0B"
            />
          ) : (
             <p className="text-center text-gray-600">Aylık ortalama tamamlanma süresi verisi bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Equipment Utilization */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Ekipman Kullanımı</h3>
        <div className="overflow-x-auto">
          {isLoadingAnalytics ? (
             <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : analytics.equipmentUtilization.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ekipman</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görev Sayısı</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Bakım</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.equipmentUtilization.map(equip => (
                  <tr key={equip.equipmentId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{equip.equipmentName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{equip.taskCount}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {equip.lastMaintenance ? equip.lastMaintenance.toLocaleDateString() : 'Bakım Yok'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <p className="text-center text-gray-600">Ekipman kullanım verisi bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 