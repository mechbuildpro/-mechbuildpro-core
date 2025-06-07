'use client';

import { useState, useEffect } from 'react';
import { DashboardStats, calculateDashboardStats, getRecentActivities, Activity } from './logic';
import { formatFileSize } from '../file-upload/logic';

export default function DashboardComponent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, recentActivities] = await Promise.all([
        calculateDashboardStats(),
        getRecentActivities()
      ]);
      setStats(dashboardStats);
      setActivities(recentActivities);
      setError(null);
    } catch (err) {
      setError('Dashboard verileri yüklenirken bir hata oluştu');
      console.error('Dashboard yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Proje İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Toplam Proje</h3>
          <p className="text-2xl">{stats.projectStats.totalProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Aktif Proje</h3>
          <p className="text-2xl">{stats.projectStats.activeProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tamamlanan</h3>
          <p className="text-2xl">{stats.projectStats.completedProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Geciken</h3>
          <p className="text-2xl">{stats.projectStats.delayedProjects}</p>
        </div>
      </div>

      {/* İlerleme İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Toplam Faz</h3>
          <p className="text-2xl">{stats.progressStats.totalPhases}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tamamlanan</h3>
          <p className="text-2xl">{stats.progressStats.completedPhases}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Geciken</h3>
          <p className="text-2xl">{stats.progressStats.delayedPhases}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Risk Altında</h3>
          <p className="text-2xl">{stats.progressStats.atRiskPhases}</p>
        </div>
      </div>

      {/* Dosya İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Toplam Dosya</h3>
          <p className="text-2xl">{stats.fileStats.totalFiles}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Toplam Boyut</h3>
          <p className="text-2xl">{formatFileSize(stats.fileStats.totalSize)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Son 7 Gün</h3>
          <p className="text-2xl">{stats.fileStats.recentUploads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Genel İlerleme</h3>
          <p className="text-2xl">{stats.progressStats.overallProgress}%</p>
        </div>
      </div>

      {/* Kategori Dağılımı */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Kategori Dağılımı</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.fileStats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 capitalize">{category}</h3>
                <p className="text-2xl font-semibold text-primary-600">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Son Aktiviteler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${activity.type === 'project' ? 'bg-blue-100 text-blue-800' :
                        activity.type === 'progress' ? 'bg-green-100 text-green-800' :
                        activity.type === 'file' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'}`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{activity.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 