'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorTrendsProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface TimeBucket {
  timestamp: number;
  errorCount: number;
  severityDistribution: {
    error: number;
    warning: number;
    info: number;
  };
  statusDistribution: {
    active: number;
    resolved: number;
    ignored: number;
  };
}

export function ErrorTrends({ timeRange }: ErrorTrendsProps) {
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

  const buckets = useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    // Calculate bucket size based on time range
    const bucketSize = timeRange === '1h' ? 5 * 60 * 1000 : // 5 minutes
                      timeRange === '6h' ? 30 * 60 * 1000 : // 30 minutes
                      timeRange === '24h' ? 2 * 60 * 60 * 1000 : // 2 hours
                      12 * 60 * 60 * 1000; // 12 hours

    const buckets: TimeBucket[] = [];
    const startTime = timeRangeMs;
    const endTime = Date.now();

    for (let time = startTime; time < endTime; time += bucketSize) {
      const bucketLogs = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= time && logTime < time + bucketSize;
      });

      buckets.push({
        timestamp: time,
        errorCount: bucketLogs.length,
        severityDistribution: {
          error: bucketLogs.filter(log => log.severity === 'error').length,
          warning: bucketLogs.filter(log => log.severity === 'warning').length,
          info: bucketLogs.filter(log => log.severity === 'info').length
        },
        statusDistribution: {
          active: bucketLogs.filter(log => log.status === 'active').length,
          resolved: bucketLogs.filter(log => log.status === 'resolved').length,
          ignored: bucketLogs.filter(log => log.status === 'ignored').length
        }
      });
    }

    return buckets;
  }, [logs, timeRangeMs, timeRange]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '6h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const maxErrorCount = Math.max(...buckets.map(b => b.errorCount));

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Hata Trendleri</h4>

      <div className="space-y-4">
        {/* Error Count Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">Hata Sayısı</h5>
          <div className="h-48 flex items-end space-x-1">
            {buckets.map((bucket, index) => (
              <div
                key={index}
                className="flex-1 group relative"
                style={{
                  height: `${(bucket.errorCount / maxErrorCount) * 100}%`
                }}
              >
                <div className="w-full h-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors" />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2">
                    {formatTimestamp(bucket.timestamp)}
                    <br />
                    {bucket.errorCount} hata
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTimestamp(buckets[0]?.timestamp || 0)}</span>
            <span>{formatTimestamp(buckets[buckets.length - 1]?.timestamp || 0)}</span>
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">Önem Derecesi Dağılımı</h5>
          <div className="h-48 flex items-end space-x-1">
            {buckets.map((bucket, index) => (
              <div
                key={index}
                className="flex-1 group relative"
              >
                <div className="flex flex-col h-full">
                  <div
                    className="w-full bg-red-500 hover:bg-red-600 transition-colors"
                    style={{
                      height: `${(bucket.severityDistribution.error / maxErrorCount) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                    style={{
                      height: `${(bucket.severityDistribution.warning / maxErrorCount) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
                    style={{
                      height: `${(bucket.severityDistribution.info / maxErrorCount) * 100}%`
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2">
                    {formatTimestamp(bucket.timestamp)}
                    <br />
                    Hata: {bucket.severityDistribution.error}
                    <br />
                    Uyarı: {bucket.severityDistribution.warning}
                    <br />
                    Bilgi: {bucket.severityDistribution.info}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTimestamp(buckets[0]?.timestamp || 0)}</span>
            <span>{formatTimestamp(buckets[buckets.length - 1]?.timestamp || 0)}</span>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-4">Durum Dağılımı</h5>
          <div className="h-48 flex items-end space-x-1">
            {buckets.map((bucket, index) => (
              <div
                key={index}
                className="flex-1 group relative"
              >
                <div className="flex flex-col h-full">
                  <div
                    className="w-full bg-red-500 hover:bg-red-600 transition-colors"
                    style={{
                      height: `${(bucket.statusDistribution.active / maxErrorCount) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors"
                    style={{
                      height: `${(bucket.statusDistribution.resolved / maxErrorCount) * 100}%`
                    }}
                  />
                  <div
                    className="w-full bg-gray-500 hover:bg-gray-600 transition-colors"
                    style={{
                      height: `${(bucket.statusDistribution.ignored / maxErrorCount) * 100}%`
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2">
                    {formatTimestamp(bucket.timestamp)}
                    <br />
                    Aktif: {bucket.statusDistribution.active}
                    <br />
                    Çözüldü: {bucket.statusDistribution.resolved}
                    <br />
                    Yoksayıldı: {bucket.statusDistribution.ignored}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTimestamp(buckets[0]?.timestamp || 0)}</span>
            <span>{formatTimestamp(buckets[buckets.length - 1]?.timestamp || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 