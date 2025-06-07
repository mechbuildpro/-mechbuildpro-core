'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorPredictionProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface Prediction {
  code: string;
  probability: number;
  confidence: number;
  expectedTime: string;
  impact: {
    severity: 'high' | 'medium' | 'low';
    affectedComponents: string[];
    userImpact: number;
    businessImpact: number;
  };
  preventionSteps: string[];
  historicalPattern: {
    frequency: number;
    lastOccurrence: string;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
}

export function ErrorPrediction({ timeRange }: ErrorPredictionProps) {
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

  const predictions = useMemo(() => {
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

    const predictions: Prediction[] = [];

    errorGroups.forEach((group, code) => {
      // Sort logs by timestamp
      group.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Calculate time intervals between errors
      const intervals: number[] = [];
      for (let i = 1; i < group.length; i++) {
        const interval = new Date(group[i].timestamp).getTime() - 
                        new Date(group[i-1].timestamp).getTime();
        intervals.push(interval);
      }

      // Calculate average interval and standard deviation
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const stdDev = Math.sqrt(
        intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length
      );

      // Determine trend
      const recentIntervals = intervals.slice(-3);
      const trend = recentIntervals[0] > recentIntervals[recentIntervals.length - 1]
        ? 'decreasing'
        : recentIntervals[0] < recentIntervals[recentIntervals.length - 1]
          ? 'increasing'
          : 'stable';

      // Calculate probability based on pattern analysis
      const probability = Math.min(
        (group.length / (timeRangeMs / avgInterval)) * 
        (trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1),
        0.95
      );

      // Calculate confidence based on data quality
      const confidence = Math.min(
        (1 - (stdDev / avgInterval)) * 
        (group.length / 10) * 
        (trend === 'stable' ? 1.2 : 1),
        0.95
      );

      // Predict next occurrence
      const lastError = group[group.length - 1];
      const lastErrorTime = new Date(lastError.timestamp).getTime();
      const expectedTime = new Date(lastErrorTime + avgInterval).toISOString();

      // Calculate impact
      const affectedComponents = new Set(group.map(log => log.component || 'unknown'));
      const userImpact = group.reduce((sum, log) => 
        sum + (log.userId ? 1 : 0), 0) / group.length;
      const businessImpact = group.reduce((sum, log) => 
        sum + (log.revenueImpact || 0), 0) / group.length;

      // Determine severity based on impact
      const severity = userImpact > 0.7 || businessImpact > 1000
        ? 'high'
        : userImpact > 0.3 || businessImpact > 500
          ? 'medium'
          : 'low';

      // Generate prevention steps based on error type
      const preventionSteps: string[] = [];
      const firstError = group[0];

      if (firstError.message.toLowerCase().includes('network')) {
        preventionSteps.push(
          'Ağ bağlantılarını izleyin ve yedekli bağlantılar ekleyin',
          'Load balancer yapılandırmasını gözden geçirin',
          'Timeout değerlerini optimize edin'
        );
      } else if (firstError.message.toLowerCase().includes('resource')) {
        preventionSteps.push(
          'Kaynak kullanım limitlerini ayarlayın',
          'Önbellek stratejisini optimize edin',
          'Sistem kaynaklarını izleyin'
        );
      } else if (firstError.message.toLowerCase().includes('validation')) {
        preventionSteps.push(
          'Giriş doğrulama kurallarını güncelleyin',
          'Kullanıcı geri bildirimlerini iyileştirin',
          'Veri formatı kontrollerini güçlendirin'
        );
      } else {
        preventionSteps.push(
          'Hata izleme sistemini güçlendirin',
          'Log analizini derinleştirin',
          'Sistem sağlığını düzenli kontrol edin'
        );
      }

      predictions.push({
        code,
        probability,
        confidence,
        expectedTime,
        impact: {
          severity,
          affectedComponents: Array.from(affectedComponents),
          userImpact,
          businessImpact
        },
        preventionSteps,
        historicalPattern: {
          frequency: group.length,
          lastOccurrence: lastError.timestamp,
          trend
        }
      });
    });

    return predictions
      .filter(p => p.probability > 0.3) // Only show predictions with significant probability
      .sort((a, b) => b.probability - a.probability);
  }, [logs, timeRangeMs]);

  const getSeverityColor = (severity: Prediction['impact']['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getTrendColor = (trend: Prediction['historicalPattern']['trend']) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      case 'stable': return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Hata Tahminleri</h4>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(prediction.impact.severity)}`}>
                  {prediction.impact.severity === 'high' ? 'Yüksek' :
                   prediction.impact.severity === 'medium' ? 'Orta' : 'Düşük'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {prediction.code}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${prediction.probability * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(prediction.probability * 100)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Tahmin Detayları</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Beklenen Zaman</span>
                      <span>{new Date(prediction.expectedTime).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Kullanıcı Etkisi</span>
                      <span>{Math.round(prediction.impact.userImpact * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${prediction.impact.userImpact * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>İş Etkisi</span>
                      <span>${Math.round(prediction.impact.businessImpact)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(prediction.impact.businessImpact / 1000, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Geçmiş Kalıp</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Frekans</span>
                      <span>{prediction.historicalPattern.frequency} kez</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Son Oluşum</span>
                      <span>{new Date(prediction.historicalPattern.lastOccurrence).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Trend</span>
                      <span className={getTrendColor(prediction.historicalPattern.trend)}>
                        {prediction.historicalPattern.trend === 'increasing' ? 'Artıyor' :
                         prediction.historicalPattern.trend === 'decreasing' ? 'Azalıyor' : 'Stabil'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Önleme Adımları</h5>
                <ul className="space-y-1">
                  {prediction.preventionSteps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Etkilenecek Bileşenler</h5>
                <div className="flex flex-wrap gap-2">
                  {prediction.impact.affectedComponents.map((component, compIndex) => (
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
          </div>
        ))}

        {predictions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              Seçilen zaman aralığında tahmin edilebilir hata kalıbı bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 