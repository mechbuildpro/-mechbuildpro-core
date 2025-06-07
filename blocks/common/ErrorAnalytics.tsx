'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { saveAs } from 'file-saver';
import { websocketService } from './services/websocketService';
import { errorPatternService } from './services/errorPatternService';
import { anomalyDetectionService } from './services/anomalyDetectionService';
import { dashboardService } from './services/dashboardService';
import SystemHealthPanel from './components/SystemHealthPanel';
import './ErrorAnalytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  responseTime: number;
  status: 'success' | 'active' | 'resolved' | 'ignored';
  userId: string;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
}

interface ErrorAnalyticsProps {
  initialData?: ErrorLog[];
  refreshInterval?: number;
}

const ErrorAnalytics: React.FC<ErrorAnalyticsProps> = ({
  initialData = [],
  refreshInterval = 5000
}) => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>(initialData);
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'scatter' | 'radar'>('line');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [filters, setFilters] = useState({
    severity: [] as ('error' | 'warning' | 'info')[],
    component: [] as string[],
    status: [] as ('success' | 'active' | 'resolved' | 'ignored')[]
  });
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [activeLayout, setActiveLayout] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<Array<{
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    errorRate: number;
  }>>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect();
    
    websocketService.on('error', (data) => {
      setErrorLogs(prev => [...prev, data]);
    });

    websocketService.on('metrics', (data) => {
      const newMetrics = {
        timestamp: data.timestamp,
        cpuUsage: data.cpuUsage,
        memoryUsage: data.memoryUsage,
        networkLatency: data.networkLatency,
        errorRate: errorLogs.filter(log => 
          new Date(log.timestamp).getTime() > Date.now() - 60000
        ).length
      };
      
      setSystemMetrics(prev => [...prev, newMetrics].slice(-30));
      
      const anomalies = anomalyDetectionService.detectAnomalies([
        {
          timestamp: data.timestamp,
          value: data.cpuUsage,
          metric: 'cpu'
        },
        {
          timestamp: data.timestamp,
          value: data.memoryUsage,
          metric: 'memory'
        },
        {
          timestamp: data.timestamp,
          value: data.networkLatency,
          metric: 'network'
        }
      ]);
      setAnomalies(prev => [...prev, ...anomalies]);
    });

    return () => {
      websocketService.disconnect();
    };
  }, [errorLogs]);

  // Analyze error patterns
  useEffect(() => {
    const patterns = errorPatternService.analyzePatterns(errorLogs);
    setPatterns(patterns);
  }, [errorLogs]);

  // Load active dashboard layout
  useEffect(() => {
    const layout = dashboardService.getActiveLayout();
    if (layout) {
      setActiveLayout(layout.id);
    }
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      errorLogs,
      anomalies,
      patterns,
      filters,
      timeRange,
      systemMetrics
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `error-analytics-${new Date().toISOString()}.json`);
  }, [errorLogs, anomalies, patterns, filters, timeRange, systemMetrics]);

  const handleFilterChange = useCallback((
    type: keyof typeof filters,
    value: 'error' | 'warning' | 'info' | string | 'success' | 'active' | 'resolved' | 'ignored'
  ) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value as any)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value as any]
    }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const filteredLogs = useCallback(() => {
    return errorLogs.filter(log => {
      if (searchQuery) {
        const matchesSearch = 
          log.message.toLowerCase().includes(searchQuery) ||
          log.component.toLowerCase().includes(searchQuery) ||
          log.userId.toLowerCase().includes(searchQuery);
        if (!matchesSearch) return false;
      }

      if (filters.severity.length && !filters.severity.includes(log.severity)) return false;
      if (filters.component.length && !filters.component.includes(log.component)) return false;
      if (filters.status.length && !filters.status.includes(log.status)) return false;
      return true;
    });
  }, [errorLogs, searchQuery, filters]);

  const renderVisualization = useCallback(() => {
    const filteredData = filteredLogs();

    const chartData = {
      labels: filteredData.map(log => new Date(log.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: 'Response Time',
          data: filteredData.map(log => log.responseTime),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'CPU Usage',
          data: filteredData.map(log => log.cpuUsage),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Memory Usage',
          data: filteredData.map(log => log.memoryUsage),
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const
        },
        title: {
          display: true,
          text: 'Error Analytics Dashboard'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    switch (selectedChart) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      case 'radar':
        return <Radar data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  }, [errorLogs, filters, selectedChart, searchQuery]);

  return (
    <div className="error-analytics">
      <div className="header">
        <h2>Error Analytics Dashboard</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowCustomizeModal(true)}>Customize</button>
          <button onClick={handleExport}>Export Data</button>
        </div>
      </div>

      <SystemHealthPanel metrics={systemMetrics} refreshInterval={refreshInterval} />

      <div className="controls">
        <select
          value={selectedChart}
          onChange={e => setSelectedChart(e.target.value as any)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="scatter">Scatter Plot</option>
          <option value="radar">Radar Chart</option>
        </select>

        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value as any)}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="filters">
        <div className="filter-group">
          <h4>Severity</h4>
          {['error', 'warning', 'info'].map(severity => (
            <label key={severity}>
              <input
                type="checkbox"
                checked={filters.severity.includes(severity as any)}
                onChange={() => handleFilterChange('severity', severity as any)}
              />
              {severity}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Component</h4>
          {Array.from(new Set(errorLogs.map(log => log.component))).map(component => (
            <label key={component}>
              <input
                type="checkbox"
                checked={filters.component.includes(component)}
                onChange={() => handleFilterChange('component', component)}
              />
              {component}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Status</h4>
          {['success', 'active', 'resolved', 'ignored'].map(status => (
            <label key={status}>
              <input
                type="checkbox"
                checked={filters.status.includes(status as any)}
                onChange={() => handleFilterChange('status', status as any)}
              />
              {status}
            </label>
          ))}
        </div>
      </div>

      <div className="visualization">
        {renderVisualization()}
      </div>

      <div className="anomalies">
        <h3>Detected Anomalies</h3>
        {anomalies.map((anomaly, index) => (
          <div key={index} className={`anomaly ${anomaly.severity}`}>
            <p>Metric: {anomaly.metric}</p>
            <p>Value: {anomaly.value}</p>
            <p>Severity: {anomaly.severity}</p>
            <p>Confidence: {anomaly.confidence}%</p>
            <p>Factors: {anomaly.factors.join(', ')}</p>
          </div>
        ))}
      </div>

      <div className="patterns">
        <h3>Error Patterns</h3>
        {patterns.map((pattern, index) => (
          <div key={index} className="pattern">
            <p>Pattern: {pattern.pattern}</p>
            <p>Frequency: {pattern.frequency}</p>
            <p>Severity: {pattern.severity}</p>
            <p>Impact: {pattern.impact}</p>
            <p>Recommendations: {pattern.recommendations.join(', ')}</p>
          </div>
        ))}
      </div>

      {showCustomizeModal && (
        <div className="customize-modal">
          <div className="modal-content">
            <h3>Customize Dashboard</h3>
            <div className="layout-options">
              <h4>Layout</h4>
              <select
                value={activeLayout || ''}
                onChange={e => {
                  const layout = dashboardService.getLayout(e.target.value);
                  if (layout) {
                    setActiveLayout(layout.id);
                    dashboardService.setActiveLayout(layout.id);
                  }
                }}
              >
                <option value="">Select Layout</option>
                {dashboardService.getAllLayouts().map(layout => (
                  <option key={layout.id} value={layout.id}>{layout.name}</option>
                ))}
              </select>
            </div>
            <div className="theme-options">
              <h4>Theme</h4>
              <div className="color-picker">
                <label>
                  Primary Color
                  <input
                    type="color"
                    value={dashboardService.getLayout(activeLayout!)?.theme.primary || '#1976d2'}
                    onChange={e => {
                      if (activeLayout) {
                        dashboardService.updateTheme(activeLayout, {
                          ...dashboardService.getLayout(activeLayout)!.theme,
                          primary: e.target.value
                        });
                      }
                    }}
                  />
                </label>
                <label>
                  Secondary Color
                  <input
                    type="color"
                    value={dashboardService.getLayout(activeLayout!)?.theme.secondary || '#dc004e'}
                    onChange={e => {
                      if (activeLayout) {
                        dashboardService.updateTheme(activeLayout, {
                          ...dashboardService.getLayout(activeLayout)!.theme,
                          secondary: e.target.value
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <button onClick={() => setShowCustomizeModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorAnalytics; 