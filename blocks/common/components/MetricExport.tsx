import React, { useState } from 'react';
import './MetricExport.css';

interface MetricData {
  timestamp: string;
  value: number;
  metric: string;
}

interface MetricExportProps {
  data: MetricData[];
  metricType: 'cpu' | 'memory' | 'network' | 'error';
  timeRange: '1h' | '24h' | '7d' | '30d';
}

type ExportFormat = 'csv' | 'json' | 'excel';

const MetricExport: React.FC<MetricExportProps> = ({ data, metricType, timeRange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const getMetricUnit = () => {
    switch (metricType) {
      case 'cpu':
      case 'memory':
        return '%';
      case 'network':
        return 'ms';
      case 'error':
        return 'errors';
      default:
        return '';
    }
  };

  const formatData = (format: ExportFormat) => {
    const formattedData = data.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      value: d.value,
      metric: metricType,
      unit: getMetricUnit()
    }));

    switch (format) {
      case 'csv':
        const headers = ['Timestamp', 'Value', 'Metric', 'Unit'];
        const csvRows = [
          headers.join(','),
          ...formattedData.map(d => [
            d.timestamp,
            d.value,
            d.metric,
            d.unit
          ].join(','))
        ];
        return csvRows.join('\n');

      case 'json':
        return JSON.stringify(formattedData, null, 2);

      case 'excel':
        // For Excel, we'll create a CSV with BOM for Excel compatibility
        const excelHeaders = ['Timestamp', 'Value', 'Metric', 'Unit'];
        const excelRows = [
          excelHeaders.join('\t'),
          ...formattedData.map(d => [
            d.timestamp,
            d.value,
            d.metric,
            d.unit
          ].join('\t'))
        ];
        return '\ufeff' + excelRows.join('\n');

      default:
        return '';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const content = formatData(selectedFormat);
      const blob = new Blob([content], {
        type: selectedFormat === 'json' ? 'application/json' :
              selectedFormat === 'excel' ? 'application/vnd.ms-excel' :
              'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metricType}_metrics_${timeRange}_${new Date().toISOString().split('T')[0]}.${
        selectedFormat === 'excel' ? 'csv' : selectedFormat
      }`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="metric-export">
      <h3>Export Data</h3>
      <div className="export-controls">
        <div className="format-selector">
          <label>Format:</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
            disabled={isExporting}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || data.length === 0}
          className="export-button"
        >
          {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>
      <div className="export-info">
        <p>Exporting {data.length} data points for {metricType} metrics</p>
        <p>Time range: {timeRange}</p>
      </div>
    </div>
  );
};

export default MetricExport; 