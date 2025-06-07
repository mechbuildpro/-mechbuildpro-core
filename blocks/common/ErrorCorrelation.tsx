'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorCorrelationProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface Correlation {
  source: string;
  target: string;
  type: 'direct' | 'indirect' | 'temporal';
  strength: number;
  confidence: number;
  relatedErrors: ErrorLog[];
  description: string;
}

export function ErrorCorrelation({ timeRange }: ErrorCorrelationProps) {
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

  const correlations = useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    // Group errors by component
    const componentErrors = new Map<string, ErrorLog[]>();
    filteredLogs.forEach(log => {
      const component = log.component || 'unknown';
      if (!componentErrors.has(component)) {
        componentErrors.set(component, []);
      }
      componentErrors.get(component)?.push(log);
    });

    const correlations: Correlation[] = [];
    const components = Array.from(componentErrors.keys());

    // Analyze correlations between components
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const source = components[i];
        const target = components[j];
        const sourceErrors = componentErrors.get(source) || [];
        const targetErrors = componentErrors.get(target) || [];

        // Check for direct correlations (errors occurring within 5 minutes)
        const directCorrelations = sourceErrors.filter(sourceError => {
          const sourceTime = new Date(sourceError.timestamp).getTime();
          return targetErrors.some(targetError => {
            const targetTime = new Date(targetError.timestamp).getTime();
            return Math.abs(targetTime - sourceTime) <= 5 * 60 * 1000;
          });
        });

        if (directCorrelations.length > 0) {
          const relatedTargetErrors = targetErrors.filter(targetError =>
            directCorrelations.some(sourceError => {
              const sourceTime = new Date(sourceError.timestamp).getTime();
              const targetTime = new Date(targetError.timestamp).getTime();
              return Math.abs(targetTime - sourceTime) <= 5 * 60 * 1000;
            })
          );

          correlations.push({
            source,
            target,
            type: 'direct',
            strength: directCorrelations.length / Math.max(sourceErrors.length, targetErrors.length),
            confidence: 0.8,
            relatedErrors: [...directCorrelations, ...relatedTargetErrors],
            description: 'Doğrudan bileşen ilişkisi tespit edildi'
          });
        }

        // Check for indirect correlations (similar error patterns)
        const sourcePatterns = new Set(sourceErrors.map(e => e.code));
        const targetPatterns = new Set(targetErrors.map(e => e.code));
        const commonPatterns = new Set(
          Array.from(sourcePatterns).filter(x => targetPatterns.has(x))
        );

        if (commonPatterns.size > 0) {
          const relatedErrors = [...sourceErrors, ...targetErrors].filter(e =>
            commonPatterns.has(e.code)
          );

          correlations.push({
            source,
            target,
            type: 'indirect',
            strength: commonPatterns.size / Math.max(sourcePatterns.size, targetPatterns.size),
            confidence: 0.6,
            relatedErrors,
            description: 'Benzer hata kalıpları tespit edildi'
          });
        }

        // Check for temporal correlations (errors following a pattern)
        const temporalCorrelations = sourceErrors.filter((sourceError, index) => {
          if (index === 0) return false;
          const prevSourceError = sourceErrors[index - 1];
          const sourceTimeDiff = new Date(sourceError.timestamp).getTime() -
                               new Date(prevSourceError.timestamp).getTime();

          return targetErrors.some((targetError, targetIndex) => {
            if (targetIndex === 0) return false;
            const prevTargetError = targetErrors[targetIndex - 1];
            const targetTimeDiff = new Date(targetError.timestamp).getTime() -
                                 new Date(prevTargetError.timestamp).getTime();

            return Math.abs(sourceTimeDiff - targetTimeDiff) <= 60 * 1000; // 1 minute tolerance
          });
        });

        if (temporalCorrelations.length > 0) {
          const relatedTargetErrors = targetErrors.filter((targetError, index) => {
            if (index === 0) return false;
            const prevTargetError = targetErrors[index - 1];
            const targetTimeDiff = new Date(targetError.timestamp).getTime() -
                                 new Date(prevTargetError.timestamp).getTime();

            return temporalCorrelations.some(sourceError => {
              const sourceTimeDiff = new Date(sourceError.timestamp).getTime() -
                                   new Date(sourceErrors[sourceErrors.indexOf(sourceError) - 1].timestamp).getTime();
              return Math.abs(sourceTimeDiff - targetTimeDiff) <= 60 * 1000;
            });
          });

          correlations.push({
            source,
            target,
            type: 'temporal',
            strength: temporalCorrelations.length / Math.max(sourceErrors.length, targetErrors.length),
            confidence: 0.7,
            relatedErrors: [...temporalCorrelations, ...relatedTargetErrors],
            description: 'Zamansal hata ilişkisi tespit edildi'
          });
        }
      }
    }

    return correlations.sort((a, b) => b.strength - a.strength);
  }, [logs, timeRangeMs]);

  const getCorrelationColor = (type: Correlation['type']) => {
    switch (type) {
      case 'direct': return 'bg-red-100 text-red-800';
      case 'indirect': return 'bg-yellow-100 text-yellow-800';
      case 'temporal': return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Hata İlişkileri</h4>

      <div className="space-y-4">
        {correlations.map((correlation, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCorrelationColor(correlation.type)}`}>
                  {correlation.type === 'direct' ? 'Doğrudan' :
                   correlation.type === 'indirect' ? 'Dolaylı' : 'Zamansal'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {correlation.description}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${correlation.strength * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(correlation.strength * 100)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${correlation.confidence * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(correlation.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{correlation.source}</span>
                {' → '}
                <span className="font-medium">{correlation.target}</span>
              </p>
            </div>

            <div className="space-y-2">
              {correlation.relatedErrors.map((error, errorIndex) => (
                <div key={errorIndex} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {error.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString()} - {error.component}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {correlations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              Seçilen zaman aralığında hata ilişkisi bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 