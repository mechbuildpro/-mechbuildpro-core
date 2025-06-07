import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';
import './MetricDashboard.css';

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

interface MetricData {
  timestamp: string;
  value: number;
}

interface MetricSummary {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface MetricDashboardProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
  timeRange: '1h' | '6h' | '24h' | '7d';
  onTimeRangeChange: (range: '1h' | '6h' | '24h' | '7d') => void;
}

const MetricDashboard: React.FC<MetricDashboardProps> = ({
  metrics,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');

  const metricSummaries = useMemo(() => {
    const summaries: Record<string, MetricSummary> = {};
    
    Object.entries(metrics).forEach(([metric, data]) => {
      if (data.length === 0) return;

      const values = data.map(d => d.value);
      const current = values[values.length - 1];
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate trend
      const recentValues = values.slice(-5);
      const trend = recentValues[recentValues.length - 1] > recentValues[0] ? 'up' :
                   recentValues[recentValues.length - 1] < recentValues[0] ? 'down' : 'stable';
      
      // Calculate percentage change
      const change = ((current - values[0]) / values[0]) * 100;

      summaries[metric] = {
        current,
        average,
        min,
        max,
        trend,
        change
      };
    });

    return summaries;
  }, [metrics]);

  const chartData = useMemo(() => {
    const data = metrics[selectedMetric as keyof typeof metrics];
    if (!data) return null;

    return {
      labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: getMetricName(selectedMetric),
          data: data.map(d => d.value),
          borderColor: getMetricColor(selectedMetric),
          backgroundColor: getMetricColor(selectedMetric, 0.1),
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [metrics, selectedMetric]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const getMetricName = (metric: string) => {
    switch (metric) {
      case 'cpu':
        return 'CPU Usage';
      case 'memory':
        return 'Memory Usage';
      case 'network':
        return 'Network Latency';
      case 'error':
        return 'Error Rate';
      default:
        return metric;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
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

  const getMetricColor = (metric: string, alpha = 1) => {
    switch (metric) {
      case 'cpu':
        return `rgba(74, 144, 226, ${alpha})`;
      case 'memory':
        return `rgba(40, 167, 69, ${alpha})`;
      case 'network':
        return `rgba(255, 193, 7, ${alpha})`;
      case 'error':
        return `rgba(220, 53, 69, ${alpha})`;
      default:
        return `rgba(108, 117, 125, ${alpha})`;
    }
  };

  return (
    <div className="metric-dashboard">
      <div className="dashboard-header">
        <h2>System Metrics Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === '1h' ? 'active' : ''}
            onClick={() => onTimeRangeChange('1h')}
          >
            1H
          </button>
          <button
            className={timeRange === '6h' ? 'active' : ''}
            onClick={() => onTimeRangeChange('6h')}
          >
            6H
          </button>
          <button
            className={timeRange === '24h' ? 'active' : ''}
            onClick={() => onTimeRangeChange('24h')}
          >
            24H
          </button>
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => onTimeRangeChange('7d')}
          >
            7D
          </button>
        </div>
      </div>

      <div className="metric-cards">
        {Object.entries(metricSummaries).map(([metric, summary]) => (
          <div
            key={metric}
            className={`metric-card ${selectedMetric === metric ? 'selected' : ''}`}
            onClick={() => setSelectedMetric(metric)}
          >
            <div className="metric-header">
              <h3>{getMetricName(metric)}</h3>
              <span className={`trend-indicator ${summary.trend}`}>
                {summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : '→'}
                {Math.abs(summary.change).toFixed(1)}%
              </span>
            </div>
            <div className="metric-value">
              {summary.current.toFixed(1)}
              <span className="unit">{getMetricUnit(metric)}</span>
            </div>
            <div className="metric-stats">
              <div className="stat">
                <span className="label">Avg</span>
                <span className="value">{summary.average.toFixed(1)}</span>
              </div>
              <div className="stat">
                <span className="label">Min</span>
                <span className="value">{summary.min.toFixed(1)}</span>
              </div>
              <div className="stat">
                <span className="label">Max</span>
                <span className="value">{summary.max.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="metric-chart">
        {chartData && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default MetricDashboard; 