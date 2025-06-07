import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import MetricAnalysis from './MetricAnalysis';
import AlertSystem from './AlertSystem';
import PredictiveAnalytics from './PredictiveAnalytics';
import MetricCorrelation from './MetricCorrelation';
import MetricThresholds from './MetricThresholds';
import MetricPresets from './MetricPresets';
import MetricHistory from './MetricHistory';
import MetricExport from './MetricExport';
import MetricComparison from './MetricComparison';
import MetricAnomalyDetection from './MetricAnomalyDetection';
import MetricTrendAnalysis from './MetricTrendAnalysis';
import './SystemHealthPanel.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
}

interface SystemHealthPanelProps {
  metrics: SystemMetrics[];
  refreshInterval?: number;
}

interface Threshold {
  warning: number;
  critical: number;
  enabled: boolean;
}

const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  metrics,
  refreshInterval = 5000
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<SystemMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'network' | 'error'>('cpu');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [thresholds, setThresholds] = useState<{
    cpu: Threshold;
    memory: Threshold;
    network: Threshold;
    error: Threshold;
  }>({
    cpu: { warning: 60, critical: 80, enabled: true },
    memory: { warning: 70, critical: 85, enabled: true },
    network: { warning: 500, critical: 1000, enabled: true },
    error: { warning: 2, critical: 5, enabled: true }
  });

  useEffect(() => {
    if (metrics.length > 0) {
      setCurrentMetrics(metrics[metrics.length - 1]);
      setHistoricalData(metrics.slice(-30)); // Keep last 30 data points
    }
  }, [metrics]);

  const handleAlertAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleThresholdChange = (metric: string, type: 'warning' | 'critical', value: number) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric as keyof typeof prev],
        [type]: value
      }
    }));
  };

  const handleThresholdToggle = (metric: string, enabled: boolean) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric as keyof typeof prev],
        enabled
      }
    }));
  };

  const handlePresetSelect = (preset: Record<string, Threshold>) => {
    setThresholds(preset as {
      cpu: Threshold;
      memory: Threshold;
      network: Threshold;
      error: Threshold;
    });
  };

  const getMetricStatus = (value: number, type: 'cpu' | 'memory' | 'network' | 'error') => {
    const threshold = thresholds[type];
    if (!threshold.enabled) return 'normal';
    
    switch (type) {
      case 'cpu':
        return value > threshold.critical ? 'critical' : value > threshold.warning ? 'warning' : 'normal';
      case 'memory':
        return value > threshold.critical ? 'critical' : value > threshold.warning ? 'warning' : 'normal';
      case 'network':
        return value > threshold.critical ? 'critical' : value > threshold.warning ? 'warning' : 'normal';
      case 'error':
        return value > threshold.critical ? 'critical' : value > threshold.warning ? 'warning' : 'normal';
      default:
        return 'normal';
    }
  };

  const getMetricData = (type: 'cpu' | 'memory' | 'network' | 'error') => {
    return historicalData.map(metric => ({
      timestamp: metric.timestamp,
      value: type === 'cpu' ? metric.cpuUsage :
             type === 'memory' ? metric.memoryUsage :
             type === 'network' ? metric.networkLatency :
             metric.errorRate,
      metric: type
    }));
  };

  const chartData = {
    labels: historicalData.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: historicalData.map(m => m.cpuUsage),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Memory Usage (%)',
        data: historicalData.map(m => m.memoryUsage),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Network Latency (ms)',
        data: historicalData.map(m => m.networkLatency),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'System Metrics History'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (!currentMetrics) return null;

  return (
    <div className="system-health-panel">
      <AlertSystem
        metrics={metrics}
        onAlertAcknowledge={handleAlertAcknowledge}
      />

      <div className="panel-header">
        <h3>System Health Overview</h3>
        <div className="panel-controls">
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value as any)}
            className="metric-select"
          >
            <option value="cpu">CPU Usage</option>
            <option value="memory">Memory Usage</option>
            <option value="network">Network Latency</option>
            <option value="error">Error Rate</option>
          </select>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="time-range-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className={`metric-card ${getMetricStatus(currentMetrics.cpuUsage, 'cpu')}`}>
          <h4>CPU Usage</h4>
          <div className="metric-value">{currentMetrics.cpuUsage.toFixed(1)}%</div>
          <div className="metric-trend">
            {getMetricStatus(currentMetrics.cpuUsage, 'cpu') === 'critical' ? '⚠️ Critical' :
             getMetricStatus(currentMetrics.cpuUsage, 'cpu') === 'warning' ? '⚠️ Warning' : '✅ Normal'}
          </div>
        </div>

        <div className={`metric-card ${getMetricStatus(currentMetrics.memoryUsage, 'memory')}`}>
          <h4>Memory Usage</h4>
          <div className="metric-value">{currentMetrics.memoryUsage.toFixed(1)}%</div>
          <div className="metric-trend">
            {getMetricStatus(currentMetrics.memoryUsage, 'memory') === 'critical' ? '⚠️ Critical' :
             getMetricStatus(currentMetrics.memoryUsage, 'memory') === 'warning' ? '⚠️ Warning' : '✅ Normal'}
          </div>
        </div>

        <div className={`metric-card ${getMetricStatus(currentMetrics.networkLatency, 'network')}`}>
          <h4>Network Latency</h4>
          <div className="metric-value">{currentMetrics.networkLatency.toFixed(1)}ms</div>
          <div className="metric-trend">
            {getMetricStatus(currentMetrics.networkLatency, 'network') === 'critical' ? '⚠️ Critical' :
             getMetricStatus(currentMetrics.networkLatency, 'network') === 'warning' ? '⚠️ Warning' : '✅ Normal'}
          </div>
        </div>

        <div className={`metric-card ${getMetricStatus(currentMetrics.errorRate, 'error')}`}>
          <h4>Error Rate</h4>
          <div className="metric-value">{currentMetrics.errorRate}</div>
          <div className="metric-trend">
            {getMetricStatus(currentMetrics.errorRate, 'error') === 'critical' ? '⚠️ Critical' :
             getMetricStatus(currentMetrics.errorRate, 'error') === 'warning' ? '⚠️ Warning' : '✅ Normal'}
          </div>
        </div>
      </div>

      <div className="metrics-chart">
        <Line data={chartData} options={chartOptions} />
      </div>

      <MetricAnomalyDetection
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <MetricComparison
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <MetricHistory
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <MetricAnalysis
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <PredictiveAnalytics
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <MetricCorrelation
        metrics={{
          cpu: getMetricData('cpu'),
          memory: getMetricData('memory'),
          network: getMetricData('network'),
          error: getMetricData('error')
        }}
        timeRange={timeRange}
      />

      <MetricExport
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />

      <MetricPresets onPresetSelect={handlePresetSelect} />

      <MetricThresholds
        thresholds={thresholds}
        onThresholdChange={handleThresholdChange}
        onThresholdToggle={handleThresholdToggle}
      />

      <MetricTrendAnalysis
        data={getMetricData(selectedMetric)}
        metricType={selectedMetric}
        timeRange={timeRange}
      />
    </div>
  );
};

export default SystemHealthPanel; 