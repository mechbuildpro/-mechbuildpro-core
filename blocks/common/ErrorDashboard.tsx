'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { errorLogger } from './services/errorLogger';
import { ErrorTrends } from './ErrorTrends';
import { ErrorImpact } from './ErrorImpact';
import { ErrorPatterns } from './ErrorPatterns';
import { ErrorDetails } from './ErrorDetails';
import { ErrorImpactMetrics } from './ErrorImpactMetrics';
import { ErrorPatternML } from './ErrorPatternML';
import { ErrorAnalytics } from './ErrorAnalytics';

type ErrorStatus = 'open' | 'investigating' | 'resolved' | 'ignored';

interface AlertThresholds {
  frequency: number;
  userImpact: number;
  conversionImpact: number;
  responseTime: number;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

interface ErrorDashboardProps {
  maxErrors?: number;
  refreshInterval?: number;
}

interface ErrorDetails {
  [key: string]: unknown;
}

type ErrorLog = ReturnType<typeof errorLogger.getRecentLogs>[number];

type SortField = 'timestamp' | 'statusCode' | 'message';
type SortOrder = 'asc' | 'desc';
type GroupBy = 'none' | 'code' | 'statusCode' | 'component' | 'severity';

type Severity = 'low' | 'medium' | 'high' | 'unknown';

interface SearchFilters {
  query: string;
  severity: Severity | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: ErrorStatus | 'all';
  statusCode: number | 'all';
}

type ExportFormat = 'json' | 'csv';

interface ExportOptions {
  format: ExportFormat;
  includeDetails: boolean;
  includeStack: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export function ErrorDashboard({ 
  maxErrors = 50, 
  refreshInterval = 30000 
}: ErrorDashboardProps) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showStats, setShowStats] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showTrends, setShowTrends] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImpactMetrics, setShowImpactMetrics] = useState(false);
  const [showMLAnalysis, setShowMLAnalysis] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({
    frequency: 10,
    userImpact: 5,
    conversionImpact: 2,
    responseTime: 5000
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    severity: 'all',
    dateRange: {
      start: null,
      end: null
    },
    status: 'all',
    statusCode: 'all'
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeDetails: true,
    includeStack: true,
    dateRange: {
      start: null,
      end: null
    }
  });

  useEffect(() => {
    const updateErrors = () => {
      setErrors(errorLogger.getRecentLogs().slice(0, maxErrors));
    };

    // Initial load
    updateErrors();

    // Set up refresh interval
    const interval = setInterval(updateErrors, refreshInterval);

    return () => clearInterval(interval);
  }, [maxErrors, refreshInterval]);

  const getStatusColor = (status: number | ErrorStatus): string => {
    if (typeof status === 'number') {
      if (status >= 500) return 'bg-red-100 text-red-800';
      if (status >= 400) return 'bg-yellow-100 text-yellow-800';
      if (status >= 300) return 'bg-blue-100 text-blue-800';
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDetails = (details: unknown): string => {
    if (details === null || details === undefined) {
      return '';
    }
    
    try {
      if (typeof details === 'object') {
        return JSON.stringify(details as ErrorDetails, null, 2);
      }
      return String(details);
    } catch {
      return String(details);
    }
  };

  const renderErrorDetails = (details: unknown): JSX.Element | null => {
    const formattedDetails = formatDetails(details);
    if (!formattedDetails) {
      return null;
    }
    return (
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
        {formattedDetails}
      </pre>
    );
  };

  const handleStatusChange = (code: string, status: ErrorStatus) => {
    errorLogger.updateErrorStatus(code, status);
    setErrors(errorLogger.getRecentLogs().slice(0, maxErrors));
  };

  const handleThresholdChange = (thresholds: AlertThresholds) => {
    setAlertThresholds(thresholds);
  };

  const handleExport = () => {
    const errorsToExport = filteredAndSortedErrors.filter(error => {
      if (exportOptions.dateRange.start && new Date(error.timestamp) < exportOptions.dateRange.start) {
        return false;
      }
      if (exportOptions.dateRange.end && new Date(error.timestamp) > exportOptions.dateRange.end) {
        return false;
      }
      return true;
    });

    const exportData = errorsToExport.map(error => {
      const baseData = {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        status: error.status,
        severity: error.severity,
        statusCode: error.statusCode,
        url: error.url,
      };

      if (exportOptions.includeDetails && error.details) {
        return {
          ...baseData,
          details: error.details
        };
      }

      if (exportOptions.includeStack && error.stack) {
        return {
          ...baseData,
          stack: error.stack
        };
      }

      return baseData;
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    if (exportOptions.format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      filename = `error-logs-${new Date().toISOString()}.json`;
      mimeType = 'application/json';
    } else {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(error => 
        Object.values(error).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      content = [headers, ...rows].join('\n');
      filename = `error-logs-${new Date().toISOString()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const renderExportDialog = () => {
    if (!showExportDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">Hata Kayıtlarını Dışa Aktar</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  format: e.target.value as ExportFormat
                }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDetails}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeDetails: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Detayları Dahil Et</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStack}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeStack: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Stack Trace'i Dahil Et</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tarih Aralığı
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={exportOptions.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null
                    }
                  }))}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={exportOptions.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null
                    }
                  }))}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setShowExportDialog(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              İptal
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Dışa Aktar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderError = (error: ErrorLog, index: number): JSX.Element => {
    const details = error.details as ErrorDetails | undefined;
    return (
      <div key={index} className="p-4 hover:bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{error.message}</p>
              {error.status && (
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(error.status)}`}>
                  {error.status.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(error.timestamp).toLocaleString()}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(error.statusCode)}`}>
                {error.code}
              </span>
              {error.url && (
                <span className="text-xs text-gray-500 truncate max-w-xs">
                  {error.url}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedError(error.code)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Detaylar
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails ? 'Stack Trace Gizle' : 'Stack Trace Göster'}
            </button>
          </div>
        </div>
        {details && (
          <div className="mt-2">
            {renderErrorDetails(details)}
          </div>
        )}
        {showDetails && error.stack && (
          <div className="mt-4">
            <ErrorDetails
              errorCode={error.code}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => {
    const stats = errorLogger.getErrorStats();
    const statusCodeGroups = {
      '500+': Object.entries(stats.byStatusCode)
        .filter(([code]) => Number(code) >= 500)
        .reduce((sum, [_, count]) => sum + count, 0),
      '400+': Object.entries(stats.byStatusCode)
        .filter(([code]) => Number(code) >= 400 && Number(code) < 500)
        .reduce((sum, [_, count]) => sum + count, 0),
      '300+': Object.entries(stats.byStatusCode)
        .filter(([code]) => Number(code) >= 300 && Number(code) < 400)
        .reduce((sum, [_, count]) => sum + count, 0),
    };

    return (
      <div className="p-4 border-b bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Hata İstatistikleri</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Toplam Hata</p>
            <p className="text-lg font-semibold">{stats.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Benzersiz Hata Kodu</p>
            <p className="text-lg font-semibold">{Object.keys(stats.byCode).length}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Durum Kodlarına Göre</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">500+ Hatalar</span>
              <span className="text-sm font-medium text-red-600">{statusCodeGroups['500+']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">400+ Hatalar</span>
              <span className="text-sm font-medium text-yellow-600">{statusCodeGroups['400+']}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">300+ Hatalar</span>
              <span className="text-sm font-medium text-blue-600">{statusCodeGroups['300+']}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Belirsiz';
    }
  };

  const renderFilters = () => (
    <div className="p-4 border-b">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Hata ara..."
              value={searchFilters.query}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <select
              value={searchFilters.severity}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, severity: e.target.value as Severity | 'all' }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tüm Önem Seviyeleri</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
              <option value="unknown">Belirsiz</option>
            </select>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value as ErrorStatus | 'all' }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="open">Açık</option>
              <option value="investigating">İnceleniyor</option>
              <option value="resolved">Çözüldü</option>
              <option value="ignored">Yok Sayıldı</option>
            </select>
            <select
              value={searchFilters.statusCode}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                statusCode: e.target.value === 'all' ? 'all' : Number(e.target.value)
              }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tüm Durum Kodları</option>
              <option value="500">500+ Hatalar</option>
              <option value="400">400+ Hatalar</option>
              <option value="300">300+ Hatalar</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={searchFilters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => setSearchFilters(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null
                }
              }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={searchFilters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => setSearchFilters(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null
                }
              }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showStats ? 'İstatistikleri Gizle' : 'İstatistikleri Göster'}
          </button>
          <button
            onClick={() => setShowTrends(!showTrends)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showTrends ? 'Trendleri Gizle' : 'Trendleri Göster'}
          </button>
          <button
            onClick={() => setShowPatterns(!showPatterns)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showPatterns ? 'Desenleri Gizle' : 'Desenleri Göster'}
          </button>
          <button
            onClick={() => setShowMLAnalysis(!showMLAnalysis)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showMLAnalysis ? 'ML Analizini Gizle' : 'ML Analizini Göster'}
          </button>
          <button
            onClick={() => setShowImpactMetrics(!showImpactMetrics)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showImpactMetrics ? 'Etki Metriklerini Gizle' : 'Etki Metriklerini Göster'}
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Dışa Aktar
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="none">Gruplama Yok</option>
            <option value="code">Hata Koduna Göre</option>
            <option value="statusCode">Durum Koduna Göre</option>
            <option value="component">Bileşene Göre</option>
            <option value="severity">Önem Derecesine Göre</option>
          </select>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="timestamp">Tarih</option>
            <option value="statusCode">Durum Kodu</option>
            <option value="message">Mesaj</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Artan' : '↓ Azalan'}
          </button>
        </div>
      </div>
    </div>
  );

  const filteredAndSortedErrors = useMemo(() => {
    let result = [...errors];

    // Apply search filters
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      result = result.filter(error => 
        error.message.toLowerCase().includes(query) ||
        error.code.toLowerCase().includes(query) ||
        (error.url?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply severity filter
    if (searchFilters.severity !== 'all') {
      result = result.filter(error => error.severity === searchFilters.severity);
    }

    // Apply date range filter
    if (searchFilters.dateRange.start) {
      result = result.filter(error => 
        new Date(error.timestamp) >= searchFilters.dateRange.start!
      );
    }
    if (searchFilters.dateRange.end) {
      result = result.filter(error => 
        new Date(error.timestamp) <= searchFilters.dateRange.end!
      );
    }

    // Apply status filter
    if (searchFilters.status !== 'all') {
      result = result.filter(error => error.status === searchFilters.status);
    }

    // Apply status code filter
    if (searchFilters.statusCode !== 'all') {
      result = result.filter(error => error.statusCode === searchFilters.statusCode);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'statusCode':
          comparison = a.statusCode - b.statusCode;
          break;
        case 'message':
          comparison = a.message.localeCompare(b.message);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [errors, searchFilters, sortField, sortOrder]);

  const groupedErrors = useMemo(() => {
    if (groupBy === 'none') {
      return { '': filteredAndSortedErrors };
    }

    const groups: Record<string, ErrorLog[]> = {};
    filteredAndSortedErrors.forEach(error => {
      let key = '';
      switch (groupBy) {
        case 'code':
          key = error.code;
          break;
        case 'statusCode':
          key = `${error.statusCode}`;
          break;
        case 'component':
          key = error.componentStack?.split('\n')[0] || 'Unknown';
          break;
        case 'severity':
          key = error.severity || 'unknown';
          break;
      }
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(error);
    });

    return groups;
  }, [filteredAndSortedErrors, groupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupKey)) {
      newExpandedGroups.delete(groupKey);
    } else {
      newExpandedGroups.add(groupKey);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const renderGroupedErrors = () => {
    if (groupBy === 'none') {
      return filteredAndSortedErrors.map(renderError);
    }

    return Object.entries(groupedErrors).map(([groupKey, groupErrors]) => {
      const isExpanded = expandedGroups.has(groupKey);
      const severity = groupBy === 'severity' ? groupKey as Severity : 'unknown';
      
      return (
        <div key={groupKey} className="border-b last:border-b-0">
          <div
            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => toggleGroup(groupKey)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {groupBy === 'severity' && (
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(severity)}`}>
                    {getSeverityLabel(severity)}
                  </span>
                )}
                <span className="font-medium">
                  {groupBy === 'severity' 
                    ? getSeverityLabel(severity)
                    : groupKey || 'Ungrouped'}
                </span>
                <span className="text-sm text-gray-500">
                  ({groupErrors.length} hata)
                </span>
              </div>
              <span className="text-gray-500">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>
          </div>
          {isExpanded && (
            <div className="divide-y">
              {groupErrors.map(renderError)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div 
          className="p-4 bg-gray-800 text-white cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hata İzleme</h3>
            <span className="text-sm bg-red-500 text-white px-2 py-1 rounded">
              {errors.length}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="max-h-[80vh] overflow-y-auto">
            {renderFilters()}
            {showStats && renderStats()}
            {showTrends && (
              <div className="p-4 border-b">
                <ErrorTrends timeRange={timeRange} />
              </div>
            )}
            {showPatterns && (
              <div className="p-4 border-b">
                <ErrorPatterns timeRange={timeRange} />
              </div>
            )}
            {showMLAnalysis && (
              <div className="p-4 border-b">
                <ErrorPatternML timeRange={timeRange} />
              </div>
            )}
            {showImpactMetrics && selectedError && (
              <div className="p-4 border-b">
                <ErrorImpactMetrics
                  errorCode={selectedError}
                  onThresholdChange={handleThresholdChange}
                />
              </div>
            )}
            {selectedError && (
              <div className="p-4 border-b">
                <ErrorImpact
                  errorCode={selectedError}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}
            {filteredAndSortedErrors.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {errors.length === 0 ? 'Henüz hata kaydı yok' : 'Filtrelere uygun hata bulunamadı'}
              </div>
            ) : (
              <div className="divide-y">
                {renderGroupedErrors()}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {/* ... existing error list ... */}
              </div>
              <div>
                <div className="mb-4">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="1h">Son 1 Saat</option>
                    <option value="6h">Son 6 Saat</option>
                    <option value="24h">Son 24 Saat</option>
                    <option value="7d">Son 7 Gün</option>
                  </select>
                </div>
                <ErrorAnalytics timeRange={timeRange} />
              </div>
            </div>
            {renderExportDialog()}
          </div>
        )}
      </div>
    </div>
  );
} 