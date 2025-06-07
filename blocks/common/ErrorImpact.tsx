'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorImpactProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface ImpactMetrics {
  user: {
    affectedUsers: number;
    avgResponseTime: number;
    bounceRate: number;
    satisfactionScore: number;
  };
  business: {
    conversionRate: number;
    revenueImpact: number;
    supportTickets: number;
    recoveryTime: number;
  };
  technical: {
    errorRate: number;
    systemLoad: number;
    resourceUsage: number;
    affectedComponents: number;
  };
}

export function ErrorImpact({ timeRange }: ErrorImpactProps) {
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

  const metrics = useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    // Calculate user impact metrics
    const affectedUsers = new Set(filteredLogs.map(log => log.userId)).size;
    const avgResponseTime = filteredLogs.reduce((sum, log) => 
      sum + (log.responseTime || 0), 0) / filteredLogs.length;
    const bounceRate = filteredLogs.filter(log => log.bounce).length / filteredLogs.length;
    const satisfactionScore = filteredLogs.reduce((sum, log) => 
      sum + (log.satisfactionScore || 0), 0) / filteredLogs.length;

    // Calculate business impact metrics
    const conversionRate = filteredLogs.filter(log => log.converted).length / filteredLogs.length;
    const revenueImpact = filteredLogs.reduce((sum, log) => 
      sum + (log.revenueImpact || 0), 0);
    const supportTickets = filteredLogs.filter(log => log.supportTicket).length;
    const recoveryTime = filteredLogs.reduce((sum, log) => {
      if (log.resolvedAt) {
        return sum + (new Date(log.resolvedAt).getTime() - new Date(log.timestamp).getTime());
      }
      return sum;
    }, 0) / filteredLogs.length;

    // Calculate technical impact metrics
    const errorRate = filteredLogs.length / timeRangeMs;
    const systemLoad = filteredLogs.reduce((sum, log) => 
      sum + (log.systemLoad || 0), 0) / filteredLogs.length;
    const resourceUsage = filteredLogs.reduce((sum, log) => 
      sum + (log.resourceUsage || 0), 0) / filteredLogs.length;
    const affectedComponents = new Set(filteredLogs.map(log => log.component)).size;

    return {
      user: {
        affectedUsers,
        avgResponseTime,
        bounceRate,
        satisfactionScore
      },
      business: {
        conversionRate,
        revenueImpact,
        supportTickets,
        recoveryTime
      },
      technical: {
        errorRate,
        systemLoad,
        resourceUsage,
        affectedComponents
      }
    };
  }, [logs, timeRangeMs]);

  const getImpactColor = (value: number, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      if (value >= 0.8) return 'text-green-600';
      if (value >= 0.6) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= 0.2) return 'text-green-600';
      if (value <= 0.4) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Hata Etkisi</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Impact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">Kullanıcı Etkisi</h5>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Etkilenen Kullanıcılar</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.user.affectedUsers}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Ortalama Yanıt Süresi</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.user.avgResponseTime / 1000, 'negative')}`}>
                  {Math.round(metrics.user.avgResponseTime)}ms
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Hemen Çıkma Oranı</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.user.bounceRate, 'negative')}`}>
                  {Math.round(metrics.user.bounceRate * 100)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Memnuniyet Puanı</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.user.satisfactionScore, 'positive')}`}>
                  {Math.round(metrics.user.satisfactionScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Impact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">İş Etkisi</h5>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Dönüşüm Oranı</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.business.conversionRate, 'positive')}`}>
                  {Math.round(metrics.business.conversionRate * 100)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Gelir Etkisi</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.business.revenueImpact / 1000, 'negative')}`}>
                  ${Math.round(metrics.business.revenueImpact)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Destek Talepleri</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.business.supportTickets / 10, 'negative')}`}>
                  {metrics.business.supportTickets}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Ortalama Kurtarma Süresi</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.business.recoveryTime / 1000 / 60, 'negative')}`}>
                  {Math.round(metrics.business.recoveryTime / 1000 / 60)}dk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Impact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">Teknik Etki</h5>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Hata Oranı</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.technical.errorRate * 1000, 'negative')}`}>
                  {metrics.technical.errorRate.toFixed(2)}/s
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Sistem Yükü</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.technical.systemLoad, 'negative')}`}>
                  {Math.round(metrics.technical.systemLoad * 100)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Kaynak Kullanımı</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.technical.resourceUsage, 'negative')}`}>
                  {Math.round(metrics.technical.resourceUsage * 100)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Etkilenen Bileşenler</span>
                <span className={`text-sm font-medium ${getImpactColor(metrics.technical.affectedComponents / 10, 'negative')}`}>
                  {metrics.technical.affectedComponents}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 