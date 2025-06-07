'use client';

import React, { useState, useMemo } from 'react';
import { errorLogger } from './services/errorLogger';

interface ErrorImpactMetricsProps {
  errorCode: string;
  onThresholdChange: (thresholds: AlertThresholds) => void;
}

interface AlertThresholds {
  frequency: number;
  userImpact: number;
  conversionImpact: number;
  responseTime: number;
}

interface UserImpact {
  affectedUsers: number;
  affectedSessions: number;
  conversionRate: number;
  averageResponseTime: number;
  userRetention: number;
}

interface ConversionImpact {
  beforeError: number;
  afterError: number;
  impact: number;
  recoveryTime?: number;
}

export function ErrorImpactMetrics({ errorCode, onThresholdChange }: ErrorImpactMetricsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    frequency: 10,
    userImpact: 5,
    conversionImpact: 2,
    responseTime: 5000
  });

  const logs = errorLogger.getRecentLogs();
  const errorLogs = useMemo(() => 
    logs.filter(log => log.code === errorCode),
    [logs, errorCode]
  );

  const userImpact = useMemo(() => {
    const uniqueUsers = new Set<string>();
    const sessions = new Set<string>();
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    errorLogs.forEach(log => {
      if (log.userId) uniqueUsers.add(log.userId);
      if (log.sessionId) sessions.add(log.sessionId);
      if (log.details && typeof log.details === 'object' && 'responseTime' in log.details) {
        totalResponseTime += (log.details as any).responseTime;
        responseTimeCount++;
      }
    });

    // Calculate user retention (users who returned after error)
    const retentionData = errorLogs.reduce((acc, log) => {
      if (log.userId) {
        if (!acc[log.userId]) {
          acc[log.userId] = {
            firstError: new Date(log.timestamp).getTime(),
            lastError: new Date(log.timestamp).getTime(),
            returnCount: 0
          };
        } else {
          acc[log.userId].lastError = new Date(log.timestamp).getTime();
          if (new Date(log.timestamp).getTime() - acc[log.userId].firstError > 24 * 60 * 60 * 1000) {
            acc[log.userId].returnCount++;
          }
        }
      }
      return acc;
    }, {} as Record<string, { firstError: number; lastError: number; returnCount: number }>);

    const retentionRate = Object.values(retentionData).reduce((sum, data) => 
      sum + (data.returnCount > 0 ? 1 : 0), 0) / Object.keys(retentionData).length;

    return {
      affectedUsers: uniqueUsers.size,
      affectedSessions: sessions.size,
      conversionRate: 0, // This would come from analytics
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      userRetention: retentionRate
    };
  }, [errorLogs]);

  const conversionImpact = useMemo(() => {
    // This would typically come from analytics data
    // For now, we'll use a placeholder calculation
    const beforeError = 0.75; // 75% conversion rate
    const afterError = 0.65; // 65% conversion rate
    const impact = ((beforeError - afterError) / beforeError) * 100;

    return {
      beforeError,
      afterError,
      impact,
      recoveryTime: 3600000 // 1 hour in milliseconds
    };
  }, [errorLogs]);

  const handleThresholdChange = (field: keyof AlertThresholds, value: number) => {
    const newThresholds = { ...thresholds, [field]: value };
    setThresholds(newThresholds);
    onThresholdChange(newThresholds);
  };

  const getImpactColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-red-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Kullanıcı Etkisi</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isEditing ? 'Kaydet' : 'Düzenle'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Kullanıcı Metrikleri</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Etkilenen Kullanıcı</p>
              <p className={`text-sm ${getImpactColor(userImpact.affectedUsers, thresholds.userImpact)}`}>
                {userImpact.affectedUsers}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Etkilenen Oturum</p>
              <p className="text-sm">{userImpact.affectedSessions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ortalama Yanıt Süresi</p>
              <p className={`text-sm ${getImpactColor(userImpact.averageResponseTime, thresholds.responseTime)}`}>
                {userImpact.averageResponseTime.toFixed(0)}ms
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kullanıcı Geri Dönüşü</p>
              <p className="text-sm">
                {(userImpact.userRetention * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dönüşüm Etkisi</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Önceki Dönüşüm</p>
              <p className="text-sm">
                {(conversionImpact.beforeError * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sonraki Dönüşüm</p>
              <p className="text-sm">
                {(conversionImpact.afterError * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Etki</p>
              <p className={`text-sm ${getImpactColor(conversionImpact.impact, thresholds.conversionImpact)}`}>
                {conversionImpact.impact.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">İyileşme Süresi</p>
              <p className="text-sm">
                {conversionImpact.recoveryTime 
                  ? `${Math.round(conversionImpact.recoveryTime / (60 * 1000))} dakika`
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uyarı Eşikleri</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Hata Frekansı (dakika başına)</label>
                <input
                  type="number"
                  value={thresholds.frequency}
                  onChange={(e) => handleThresholdChange('frequency', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Kullanıcı Etkisi (kullanıcı sayısı)</label>
                <input
                  type="number"
                  value={thresholds.userImpact}
                  onChange={(e) => handleThresholdChange('userImpact', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Dönüşüm Etkisi (%)</label>
                <input
                  type="number"
                  value={thresholds.conversionImpact}
                  onChange={(e) => handleThresholdChange('conversionImpact', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Yanıt Süresi (ms)</label>
                <input
                  type="number"
                  value={thresholds.responseTime}
                  onChange={(e) => handleThresholdChange('responseTime', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 