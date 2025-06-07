'use client';

import React, { useState, useMemo } from 'react';
import { errorLogger } from './services/errorLogger';

interface ErrorPatternMLProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface ErrorLog {
  code: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  details?: unknown;
}

interface ErrorPattern {
  pattern: string;
  confidence: number;
  frequency: number;
  relatedErrors: string[];
  predictedImpact: number;
  suggestedAction: string;
}

interface ErrorCluster {
  errors: string[];
  commonPattern: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
}

export function ErrorPatternML({ timeRange }: ErrorPatternMLProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const logs = errorLogger.getRecentLogs();
  
  // Simulate ML-based pattern detection
  const patterns = useMemo(() => {
    const errorGroups = new Map<string, ErrorLog[]>();
    logs.forEach(log => {
      if (!errorGroups.has(log.code)) {
        errorGroups.set(log.code, []);
      }
      errorGroups.get(log.code)?.push(log);
    });

    // Analyze error sequences and patterns
    const detectedPatterns: ErrorPattern[] = [];
    errorGroups.forEach((groupLogs, code) => {
      // Simple pattern detection (in a real implementation, this would use ML)
      const timestamps = groupLogs.map(log => new Date(log.timestamp).getTime());
      const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
      
      // Calculate pattern confidence based on interval consistency
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
      const confidence = Math.max(0, 1 - variance / (avgInterval * avgInterval));

      // Find related errors that often occur together
      const relatedErrors = logs
        .filter(log => {
          const timeDiff = Math.abs(new Date(log.timestamp).getTime() - timestamps[0]);
          return timeDiff < 5 * 60 * 1000 && log.code !== code;
        })
        .map(log => log.code)
        .filter((code, index, self) => self.indexOf(code) === index)
        .slice(0, 3);

      // Predict impact based on frequency and related errors
      const predictedImpact = (groupLogs.length / logs.length) * 100 * (1 + relatedErrors.length * 0.2);

      // Generate suggested action based on pattern
      let suggestedAction = 'İzleme altında tutun';
      if (confidence > 0.8 && predictedImpact > 50) {
        suggestedAction = 'Acil müdahale gerekiyor';
      } else if (confidence > 0.6 && predictedImpact > 30) {
        suggestedAction = 'Öncelikli inceleme yapın';
      }

      detectedPatterns.push({
        pattern: `Hata ${code} düzenli aralıklarla tekrarlanıyor`,
        confidence,
        frequency: groupLogs.length,
        relatedErrors,
        predictedImpact,
        suggestedAction
      });
    });

    return detectedPatterns.sort((a, b) => b.confidence - a.confidence);
  }, [logs]);

  // Cluster similar errors
  const clusters = useMemo(() => {
    const errorClusters: ErrorCluster[] = [];
    const processedErrors = new Set<string>();

    patterns.forEach(pattern => {
      if (processedErrors.has(pattern.pattern)) return;

      const relatedPatterns = patterns.filter(p => 
        p.relatedErrors.some(e => pattern.relatedErrors.includes(e))
      );

      if (relatedPatterns.length > 1) {
        const clusterErrors = relatedPatterns.map(p => p.pattern);
        const avgConfidence = relatedPatterns.reduce((sum, p) => sum + p.confidence, 0) / relatedPatterns.length;
        
        errorClusters.push({
          errors: clusterErrors,
          commonPattern: `Bu hatalar genellikle birlikte oluşuyor (${relatedPatterns.length} hata)`,
          severity: avgConfidence > 0.8 ? 'high' : avgConfidence > 0.6 ? 'medium' : 'low',
          confidence: avgConfidence
        });

        clusterErrors.forEach(e => processedErrors.add(e));
      }
    });

    return errorClusters;
  }, [patterns]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">ML Tabanlı Hata Analizi</h3>
        <button
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isAnalyzing ? 'Analizi Durdur' : 'Analizi Başlat'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tespit Edilen Desenler</h4>
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  selectedPattern === pattern.pattern ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPattern(pattern.pattern)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pattern.pattern}</p>
                  <span className="text-xs text-gray-500">
                    {(pattern.confidence * 100).toFixed(1)}% güven
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Frekans:</span>
                    <span className="ml-1">{pattern.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tahmini Etki:</span>
                    <span className="ml-1">{pattern.predictedImpact.toFixed(1)}%</span>
                  </div>
                </div>
                {pattern.relatedErrors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">İlişkili Hatalar:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.relatedErrors.map((error, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {error}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Önerilen Aksiyon:</p>
                  <p className="text-xs font-medium mt-1">{pattern.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {clusters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Hata Kümeleri</h4>
            <div className="space-y-3">
              {clusters.map((cluster, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{cluster.commonPattern}</p>
                    <span className={`text-xs ${getSeverityColor(cluster.severity)}`}>
                      {cluster.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">İlgili Hatalar:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cluster.errors.map((error, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {error}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Güven Oranı:</p>
                    <p className="text-xs font-medium mt-1">
                      {(cluster.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 