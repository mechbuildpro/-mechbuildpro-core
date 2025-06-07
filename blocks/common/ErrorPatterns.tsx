'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorPatternsProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface ErrorPattern {
  code: string;
  frequency: number;
  severity: 'error' | 'warning' | 'info';
  components: Set<string>;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  userImpact: {
    affectedUsers: number;
    avgResponseTime: number;
    bounceRate: number;
  };
  rootCauses: string[];
  recommendations: string[];
}

export function ErrorPatterns({ timeRange }: ErrorPatternsProps) {
  const logs = errorLogger.getRecentLogs();

  const timeRangeMs = useMemo(() => {
    const now = Date.now();
    switch (timeRange) {
      case '1h': return now - 60 * 60 * 1000;
      case '6h': return now - 6 * 60 * 60 * 1000;
      case '24h': return now - 24 * 60 * 60 * 1000;
      case '7d': return now - 7 * 24 * 60 * 60 * 1000;
    }
  }, [timeRange]);

  const patterns = useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    // Group errors by code
    const errorGroups = new Map<string, ErrorLog[]>();
    filteredLogs.forEach(log => {
      if (!errorGroups.has(log.code)) {
        errorGroups.set(log.code, []);
      }
      errorGroups.get(log.code)?.push(log);
    });

    const patterns: ErrorPattern[] = [];

    errorGroups.forEach((group, code) => {
      const firstError = group[0];
      const components = new Set(group.map(log => log.component || 'unknown'));
      
      // Calculate time distribution
      const timeDistribution = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      };

      group.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        if (hour >= 6 && hour < 12) timeDistribution.morning++;
        else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
        else if (hour >= 18 && hour < 24) timeDistribution.evening++;
        else timeDistribution.night++;
      });

      // Calculate user impact
      const affectedUsers = new Set(group.map(log => log.userId)).size;
      const avgResponseTime = group.reduce((sum, log) => 
        sum + (log.responseTime || 0), 0) / group.length;
      const bounceRate = group.filter(log => log.bounce).length / group.length;

      // Determine root causes and recommendations based on error patterns
      const rootCauses: string[] = [];
      const recommendations: string[] = [];

      // Network-related errors
      if (firstError.message.toLowerCase().includes('network') ||
          firstError.message.toLowerCase().includes('connection') ||
          firstError.message.toLowerCase().includes('timeout')) {
        rootCauses.push('Ağ bağlantı sorunları');
        rootCauses.push('Yüksek gecikme süreleri');
        recommendations.push('Ağ altyapısını güçlendirin');
        recommendations.push('Bağlantı havuzu boyutunu optimize edin');
        recommendations.push('Timeout değerlerini gözden geçirin');
      }

      // Validation errors
      if (firstError.message.toLowerCase().includes('validation') ||
          firstError.message.toLowerCase().includes('invalid') ||
          firstError.message.toLowerCase().includes('required')) {
        rootCauses.push('Eksik veya hatalı veri girişi');
        rootCauses.push('Doğrulama kuralları uyumsuzluğu');
        recommendations.push('Giriş doğrulama kurallarını güncelleyin');
        recommendations.push('Kullanıcı geri bildirimlerini iyileştirin');
        recommendations.push('Veri formatı kontrollerini güçlendirin');
      }

      // Resource errors
      if (firstError.message.toLowerCase().includes('resource') ||
          firstError.message.toLowerCase().includes('memory') ||
          firstError.message.toLowerCase().includes('cpu')) {
        rootCauses.push('Yetersiz sistem kaynakları');
        rootCauses.push('Kaynak sızıntıları');
        recommendations.push('Kaynak kullanımını optimize edin');
        recommendations.push('Önbellek stratejisini gözden geçirin');
        recommendations.push('Sistem kaynaklarını artırın');
      }

      // Authentication errors
      if (firstError.message.toLowerCase().includes('auth') ||
          firstError.message.toLowerCase().includes('permission') ||
          firstError.message.toLowerCase().includes('access')) {
        rootCauses.push('Yetkilendirme sorunları');
        rootCauses.push('Oturum yönetimi hataları');
        recommendations.push('Yetkilendirme kontrollerini güçlendirin');
        recommendations.push('Oturum yönetimini iyileştirin');
        recommendations.push('Güvenlik politikalarını gözden geçirin');
      }

      patterns.push({
        code,
        frequency: group.length,
        severity: firstError.severity,
        components,
        timeDistribution,
        userImpact: {
          affectedUsers,
          avgResponseTime,
          bounceRate
        },
        rootCauses,
        recommendations
      });
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }, [logs, timeRangeMs]);

  const getSeverityColor = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
    }
  };

  const getTimeDistributionColor = (value: number, max: number) => {
    const percentage = value / max;
    if (percentage >= 0.7) return 'bg-red-500';
    if (percentage >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Hata Kalıpları</h4>

      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                  {pattern.severity === 'error' ? 'Hata' :
                   pattern.severity === 'warning' ? 'Uyarı' : 'Bilgi'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {pattern.code}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {pattern.frequency} kez tekrarlandı
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Zaman Dağılımı</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Sabah (06:00-12:00)</span>
                      <span>{pattern.timeDistribution.morning}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${getTimeDistributionColor(
                          pattern.timeDistribution.morning,
                          Math.max(...Object.values(pattern.timeDistribution))
                        )}`}
                        style={{ width: `${(pattern.timeDistribution.morning / pattern.frequency) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Öğleden Sonra (12:00-18:00)</span>
                      <span>{pattern.timeDistribution.afternoon}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${getTimeDistributionColor(
                          pattern.timeDistribution.afternoon,
                          Math.max(...Object.values(pattern.timeDistribution))
                        )}`}
                        style={{ width: `${(pattern.timeDistribution.afternoon / pattern.frequency) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Akşam (18:00-24:00)</span>
                      <span>{pattern.timeDistribution.evening}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${getTimeDistributionColor(
                          pattern.timeDistribution.evening,
                          Math.max(...Object.values(pattern.timeDistribution))
                        )}`}
                        style={{ width: `${(pattern.timeDistribution.evening / pattern.frequency) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Gece (00:00-06:00)</span>
                      <span>{pattern.timeDistribution.night}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${getTimeDistributionColor(
                          pattern.timeDistribution.night,
                          Math.max(...Object.values(pattern.timeDistribution))
                        )}`}
                        style={{ width: `${(pattern.timeDistribution.night / pattern.frequency) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Kullanıcı Etkisi</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Etkilenen Kullanıcılar</span>
                      <span>{pattern.userImpact.affectedUsers}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(pattern.userImpact.affectedUsers / pattern.frequency) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Ortalama Yanıt Süresi</span>
                      <span>{Math.round(pattern.userImpact.avgResponseTime)}ms</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(pattern.userImpact.avgResponseTime / 1000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Hemen Çıkma Oranı</span>
                      <span>{Math.round(pattern.userImpact.bounceRate * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${pattern.userImpact.bounceRate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Kök Nedenler</h5>
                <ul className="space-y-1">
                  {pattern.rootCauses.map((cause, causeIndex) => (
                    <li key={causeIndex} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-600">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Öneriler</h5>
                <ul className="space-y-1">
                  {pattern.recommendations.map((recommendation, recIndex) => (
                    <li key={recIndex} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Etkilenen Bileşenler</h5>
              <div className="flex flex-wrap gap-2">
                {Array.from(pattern.components).map((component, compIndex) => (
                  <span
                    key={compIndex}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {patterns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              Seçilen zaman aralığında hata kalıbı bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 