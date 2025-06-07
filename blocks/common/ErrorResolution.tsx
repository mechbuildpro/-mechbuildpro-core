'use client';

import React, { useMemo } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorResolutionProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface ResolutionSuggestion {
  type: 'network' | 'validation' | 'dependency' | 'configuration' | 'correlation';
  confidence: number;
  steps: string[];
  relatedErrors: ErrorLog[];
  successRate: number;
  description: string;
  correlation?: {
    source: string;
    target: string;
    type: 'direct' | 'indirect' | 'temporal';
  };
}

export function ErrorResolution({ timeRange }: ErrorResolutionProps) {
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

  const suggestions = useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    // Group errors by code and component
    const errorGroups = new Map<string, ErrorLog[]>();
    const componentErrors = new Map<string, ErrorLog[]>();

    filteredLogs.forEach(log => {
      // Group by error code
      if (!errorGroups.has(log.code)) {
        errorGroups.set(log.code, []);
      }
      errorGroups.get(log.code)?.push(log);

      // Group by component
      const component = log.component || 'unknown';
      if (!componentErrors.has(component)) {
        componentErrors.set(component, []);
      }
      componentErrors.get(component)?.push(log);
    });

    const suggestions: ResolutionSuggestion[] = [];

    // Analyze error groups for patterns
    errorGroups.forEach((group, code) => {
      const firstError = group[0];
      const errorCount = group.length;

      // Network error pattern
      if (firstError.message.toLowerCase().includes('network') ||
          firstError.message.toLowerCase().includes('connection') ||
          firstError.message.toLowerCase().includes('timeout')) {
        suggestions.push({
          type: 'network',
          confidence: 0.8,
          steps: [
            'Check network connectivity and firewall settings',
            'Verify API endpoints and service availability',
            'Review network timeout configurations',
            'Monitor network latency and packet loss'
          ],
          relatedErrors: group,
          successRate: 0.85,
          description: 'Network connectivity issues detected'
        });
      }

      // Validation error pattern
      if (firstError.message.toLowerCase().includes('validation') ||
          firstError.message.toLowerCase().includes('invalid') ||
          firstError.message.toLowerCase().includes('required')) {
        suggestions.push({
          type: 'validation',
          confidence: 0.9,
          steps: [
            'Review input validation rules',
            'Check form field requirements',
            'Validate data format and constraints',
            'Update validation error messages'
          ],
          relatedErrors: group,
          successRate: 0.95,
          description: 'Data validation issues detected'
        });
      }

      // Dependency error pattern
      if (firstError.message.toLowerCase().includes('dependency') ||
          firstError.message.toLowerCase().includes('module') ||
          firstError.message.toLowerCase().includes('package')) {
        suggestions.push({
          type: 'dependency',
          confidence: 0.85,
          steps: [
            'Check package versions and compatibility',
            'Update outdated dependencies',
            'Verify module imports and exports',
            'Review dependency tree for conflicts'
          ],
          relatedErrors: group,
          successRate: 0.9,
          description: 'Dependency-related issues detected'
        });
      }

      // Configuration error pattern
      if (firstError.message.toLowerCase().includes('config') ||
          firstError.message.toLowerCase().includes('setting') ||
          firstError.message.toLowerCase().includes('environment')) {
        suggestions.push({
          type: 'configuration',
          confidence: 0.75,
          steps: [
            'Review environment variables',
            'Check configuration files',
            'Verify service settings',
            'Update configuration documentation'
          ],
          relatedErrors: group,
          successRate: 0.8,
          description: 'Configuration issues detected'
        });
      }
    });

    // Analyze component correlations
    const components = Array.from(componentErrors.keys());
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const source = components[i];
        const target = components[j];
        const sourceErrors = componentErrors.get(source) || [];
        const targetErrors = componentErrors.get(target) || [];

        // Check for direct correlations
        const directCorrelations = sourceErrors.filter(sourceError => {
          const sourceTime = new Date(sourceError.timestamp).getTime();
          return targetErrors.some(targetError => {
            const targetTime = new Date(targetError.timestamp).getTime();
            return Math.abs(targetTime - sourceTime) <= 5 * 60 * 1000;
          });
        });

        if (directCorrelations.length > 0) {
          suggestions.push({
            type: 'correlation',
            confidence: 0.7,
            steps: [
              `Review interaction between ${source} and ${target} components`,
              'Check shared resources and dependencies',
              'Verify component communication patterns',
              'Update error handling in both components'
            ],
            relatedErrors: [...directCorrelations, ...targetErrors.filter(e => 
              directCorrelations.some(d => 
                Math.abs(new Date(d.timestamp).getTime() - new Date(e.timestamp).getTime()) <= 5 * 60 * 1000
              )
            )],
            successRate: 0.75,
            description: 'Direct component correlation detected',
            correlation: {
              source,
              target,
              type: 'direct'
            }
          });
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }, [logs, timeRangeMs]);

  const getSuggestionColor = (type: ResolutionSuggestion['type']) => {
    switch (type) {
      case 'network': return 'bg-blue-100 text-blue-800';
      case 'validation': return 'bg-yellow-100 text-yellow-800';
      case 'dependency': return 'bg-purple-100 text-purple-800';
      case 'configuration': return 'bg-green-100 text-green-800';
      case 'correlation': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700">Çözüm Önerileri</h4>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSuggestionColor(suggestion.type)}`}>
                  {suggestion.type === 'network' ? 'Ağ' :
                   suggestion.type === 'validation' ? 'Doğrulama' :
                   suggestion.type === 'dependency' ? 'Bağımlılık' :
                   suggestion.type === 'configuration' ? 'Yapılandırma' : 'İlişki'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {suggestion.description}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${suggestion.successRate * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(suggestion.successRate * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {suggestion.correlation && (
              <div className="mb-4 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{suggestion.correlation.source}</span>
                  {' → '}
                  <span className="font-medium">{suggestion.correlation.target}</span>
                  {' - '}
                  {suggestion.correlation.type === 'direct' ? 'Doğrudan ilişki' :
                   suggestion.correlation.type === 'indirect' ? 'Dolaylı ilişki' : 'Zamansal ilişki'}
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {suggestion.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="text-xs font-medium text-gray-600">{stepIndex + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">{step}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {suggestion.relatedErrors.map((error, errorIndex) => (
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

        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              Seçilen zaman aralığında çözüm önerisi bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 