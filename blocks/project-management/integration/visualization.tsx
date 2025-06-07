import React from 'react';
import { IntegrationData, BaseItem, SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition } from './logic';

interface StatusDistributionProps {
  data: IntegrationData;
}

interface ProgressBarsProps {
  data: IntegrationData;
}

interface SystemDependencyDiagramProps {
  data: IntegrationData;
}

interface TimelineViewProps {
  data: IntegrationData;
}

interface DashboardProps {
  data: IntegrationData;
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ data }) => {
  const statusCounts = data.items.reduce((acc: Record<string, number>, item: BaseItem) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(statusCounts).reduce((sum: number, count: number) => sum + count, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Durum Dağılımı</h3>
      <div className="space-y-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <span className="capitalize">{status}</span>
            <span>{count} ({((count / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressBars: React.FC<ProgressBarsProps> = ({ data }) => {
  const completed = data.items.filter((item: BaseItem) => item.status === 'completed').length;
  const inProgress = data.items.filter((item: BaseItem) => item.status === 'in_progress').length;
  const pending = data.items.filter((item: BaseItem) => item.status === 'pending').length;
  const total = data.items.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">İlerleme Durumu</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Tamamlanan</span>
            <span>{completed} ({((completed / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Devam Eden</span>
            <span>{inProgress} ({((inProgress / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(inProgress / total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Bekleyen</span>
            <span>{pending} ({((pending / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${(pending / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemDependencyDiagram: React.FC<SystemDependencyDiagramProps> = ({ data }) => {
  const systems = Array.from(new Set(data.items.flatMap((item: BaseItem) => item.systems)));
  const dependencies = data.items.filter((item: BaseItem) => item.type === 'dependency');

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Sistem Bağımlılıkları</h3>
      <div className="grid grid-cols-2 gap-4">
        {systems.map(system => (
          <div key={system} className="border p-2 rounded">
            <h4 className="font-semibold capitalize">{system}</h4>
            <div className="mt-2">
              {dependencies
                .filter((dep: BaseItem) => dep.systems && dep.systems.includes(system))
                .map(dep => (
                  <div key={dep.id} className="text-sm">
                    {dep.name}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  const sortedItems = [...data.items].sort((a: BaseItem, b: BaseItem) => {
    const dateA = new Date(a.startDate || '').getTime();
    const dateB = new Date(b.startDate || '').getTime();
    return dateA - dateB;
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Zaman Çizelgesi</h3>
      <div className="space-y-4">
        {sortedItems.map(item => (
          <div key={item.id} className="border-l-2 border-blue-500 pl-4">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-600">{item.description}</div>
            <div className="text-sm">
              <span className="capitalize">{item.status}</span>
              {item.startDate && (
                <span className="ml-2">
                  {new Date(item.startDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const calculateMetrics = () => {
    const total = data.items.length;
    const completed = data.items.filter((item: BaseItem) => item.status === 'completed').length;
    const inProgress = data.items.filter((item: BaseItem) => item.status === 'in_progress').length;
    const blocked = data.items.filter((item: BaseItem) => item.status === 'blocked').length;
    const delayed = data.items.filter((item: BaseItem) => item.status === 'delayed').length;

    const systemBreakdown = {
      hvac: data.items.filter((item: BaseItem) => item.systems?.includes('hvac')).length,
      electrical: data.items.filter((item: BaseItem) => item.systems?.includes('electrical')).length,
      plumbing: data.items.filter((item: BaseItem) => item.systems?.includes('plumbing')).length,
      fire: data.items.filter((item: BaseItem) => item.systems?.includes('fire')).length,
      security: data.items.filter((item: BaseItem) => item.systems?.includes('security')).length
    };

    const priorityBreakdown = {
      critical: data.items.filter((item: BaseItem) => item.priority === 'critical').length,
      high: data.items.filter((item: BaseItem) => item.priority === 'high').length,
      medium: data.items.filter((item: BaseItem) => item.priority === 'medium').length,
      low: data.items.filter((item: BaseItem) => item.priority === 'low').length
    };

    const typeBreakdown = {
      coordination: data.items.filter((item: BaseItem) => item.type === 'coordination').length,
      testing: data.items.filter((item: BaseItem) => item.type === 'testing').length,
      commissioning: data.items.filter((item: BaseItem) => item.type === 'commissioning').length,
      transition: data.items.filter((item: BaseItem) => item.type === 'transition').length,
      dependency: data.items.filter((item: BaseItem) => item.type === 'dependency').length,
    };

    return {
      total,
      completed,
      inProgress,
      blocked,
      delayed,
      systemBreakdown,
      priorityBreakdown,
      typeBreakdown
    };
  };

  const metrics = calculateMetrics();

  const renderMetricCard = (title: string, value: number, color: string) => (
    <div className={`p-4 rounded-lg shadow ${color}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );

  const renderBreakdownChart = (title: string, data: Record<string, number>, colors: Record<string, string>) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <div className="w-24 text-sm text-gray-600">{key}</div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[key]}`}
                  style={{ width: `${(value / metrics.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {renderMetricCard('Toplam', metrics.total, 'bg-blue-600')}
        {renderMetricCard('Tamamlanan', metrics.completed, 'bg-green-600')}
        {renderMetricCard('Devam Eden', metrics.inProgress, 'bg-yellow-600')}
        {renderMetricCard('Engellenen', metrics.blocked, 'bg-red-600')}
        {renderMetricCard('Gecikmeli', metrics.delayed, 'bg-orange-600')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderBreakdownChart(
          'Sistem Dağılımı',
          metrics.systemBreakdown,
          {
            hvac: 'bg-blue-500',
            electrical: 'bg-yellow-500',
            plumbing: 'bg-green-500',
            fire: 'bg-red-500',
            security: 'bg-purple-500'
          }
        )}
         {renderBreakdownChart(
          'Öncelik Dağılımı',
          metrics.priorityBreakdown,
          {
            critical: 'bg-red-500',
            high: 'bg-orange-500',
            medium: 'bg-yellow-500',
            low: 'bg-green-500',
          }
        )}
      </div>

      {/* Zaman Çizelgesi ve Bağımlılık Diyagramı gibi diğer bileşenleri buraya ekleyebilirsiniz */}
      {/* <TimelineView data={data} /> */}
      {/* <SystemDependencyDiagram data={data} /> */}

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {renderBreakdownChart(
           'Tip Dağılımı',
           metrics.typeBreakdown,
           {
             coordination: 'bg-blue-500',
             testing: 'bg-green-500',
             commissioning: 'bg-yellow-500',
             transition: 'bg-purple-500',
             dependency: 'bg-red-500',
           }
         )}
       </div>
    </div>
  );
}; 