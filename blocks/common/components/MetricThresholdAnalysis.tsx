import React, { useState, useMemo } from 'react';
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
import './MetricThresholdAnalysis.css';

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

interface ThresholdConfig {
  warning: number;
  critical: number;
  min: number;
  max: number;
}

interface ThresholdViolation {
  timestamp: string;
  value: number;
  type: 'warning' | 'critical';
  duration: number;
}

interface MetricThresholdAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricThresholdAnalysis: React.FC<MetricThresholdAnalysisProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [timeWindow, setTimeWindow] = useState<number>(24); // hours
  const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfig>({
    warning: 70,
    critical: 90,
    min: 0,
    max: 100
  });

  const getDefaultThresholds = (metric: string): ThresholdConfig => {
    switch (metric) {
      case 'cpu':
        return { warning: 70, critical: 90, min: 0, max: 100 };
      case 'memory':
        return { warning: 80, critical: 95, min: 0, max: 100 };
      case 'network':
        return { warning: 200, critical: 500, min: 0, max: 1000 };
      case 'error':
        return { warning: 5, critical: 10, min: 0, max: 100 };
      default:
        return { warning: 70, critical: 90, min: 0, max: 100 };
    }
  };

  const analyzeThresholds = (data: MetricData[]): {
    violations: ThresholdViolation[];
    totalViolationTime: number;
    maxViolationDuration: number;
    averageViolationDuration: number;
  } => {
    const violations: ThresholdViolation[] = [];
    let currentViolation: ThresholdViolation | null = null;
    let totalViolationTime = 0;

    data.forEach((point, index) => {
      const value = point.value;
      const timestamp = new Date(point.timestamp).getTime();
      const nextTimestamp = index < data.length - 1 
        ? new Date(data[index + 1].timestamp).getTime()
        : timestamp;

      if (value >= thresholdConfig.critical) {
        if (!currentViolation) {
          currentViolation = {
            timestamp: point.timestamp,
            value,
            type: 'critical',
            duration: 0
          };
        } else if (currentViolation.type === 'warning') {
          currentViolation.type = 'critical';
        }
      } else if (value >= thresholdConfig.warning) {
        if (!currentViolation) {
          currentViolation = {
            timestamp: point.timestamp,
            value,
            type: 'warning',
            duration: 0
          };
        }
      } else if (currentViolation) {
        currentViolation.duration = (timestamp - new Date(currentViolation.timestamp).getTime()) / 1000;
        totalViolationTime += currentViolation.duration;
        violations.push(currentViolation);
        currentViolation = null;
      }

      if (currentViolation) {
        currentViolation.duration = (nextTimestamp - new Date(currentViolation.timestamp).getTime()) / 1000;
      }
    });

    if (currentViolation) {
      totalViolationTime += currentViolation.duration;
      violations.push(currentViolation);
    }

    const maxViolationDuration = Math.max(...violations.map(v => v.duration), 0);
    const averageViolationDuration = violations.length > 0 
      ? totalViolationTime / violations.length 
      : 0;

    return {
      violations,
      totalViolationTime,
      maxViolationDuration,
      averageViolationDuration
    };
  };

  const analysis = useMemo(() => {
    return analyzeThresholds(metrics[selectedMetric as keyof typeof metrics]);
  }, [metrics, selectedMetric, thresholdConfig]);

  const chartData = {
    labels: metrics[selectedMetric as keyof typeof metrics].map(d => 
      new Date(d.timestamp).toLocaleString()
    ),
    datasets: [
      {
        label: 'Metric Value',
        data: metrics[selectedMetric as keyof typeof metrics].map(d => d.value),
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Warning Threshold',
        data: Array(metrics[selectedMetric as keyof typeof metrics].length).fill(thresholdConfig.warning),
        borderColor: 'rgba(255, 193, 7, 0.5)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Critical Threshold',
        data: Array(metrics[selectedMetric as keyof typeof metrics].length).fill(thresholdConfig.critical),
        borderColor: 'rgba(220, 53, 69, 0.5)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        min: thresholdConfig.min,
        max: thresholdConfig.max,
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

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'cpu':
        return '#4a90e2';
      case 'memory':
        return '#28a745';
      case 'network':
        return '#ffc107';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(0)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(0)}m`;
    } else {
      return `${(seconds / 3600).toFixed(1)}h`;
    }
  };

  return (
    <div className="metric-threshold-analysis">
      <div className="threshold-header">
        <h2>Threshold Analysis</h2>
        <div className="controls">
          <div className="metric-selector">
            {Object.keys(metrics).map(metric => (
              <button
                key={metric}
                className={`metric-button ${selectedMetric === metric ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMetric(metric);
                  setThresholdConfig(getDefaultThresholds(metric));
                }}
                style={{
                  borderColor: selectedMetric === metric ? getMetricColor(metric) : undefined,
                  backgroundColor: selectedMetric === metric ? getMetricColor(metric) : undefined
                }}
              >
                {getMetricName(metric)}
              </button>
            ))}
          </div>
          <div className="threshold-controls">
            <div className="control-group">
              <label>Warning Threshold:</label>
              <input
                type="number"
                min={thresholdConfig.min}
                max={thresholdConfig.critical}
                value={thresholdConfig.warning}
                onChange={(e) => setThresholdConfig(prev => ({
                  ...prev,
                  warning: Math.min(parseInt(e.target.value), prev.critical)
                }))}
              />
            </div>
            <div className="control-group">
              <label>Critical Threshold:</label>
              <input
                type="number"
                min={thresholdConfig.warning}
                max={thresholdConfig.max}
                value={thresholdConfig.critical}
                onChange={(e) => setThresholdConfig(prev => ({
                  ...prev,
                  critical: Math.max(parseInt(e.target.value), prev.warning)
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="threshold-grid">
        <div className="threshold-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="threshold-details">
          <h3>Threshold Analysis</h3>
          <div className="threshold-cards">
            <div className="threshold-card">
              <div className="threshold-metric">
                <span style={{ color: getMetricColor(selectedMetric) }}>
                  {getMetricName(selectedMetric)}
                </span>
              </div>
              <div className="threshold-info">
                <div className="threshold-violations">
                  Total Violations: {analysis.violations.length}
                </div>
                <div className="threshold-time">
                  Total Violation Time: {formatDuration(analysis.totalViolationTime)}
                </div>
                <div className="threshold-duration">
                  Max Duration: {formatDuration(analysis.maxViolationDuration)}
                </div>
                <div className="threshold-average">
                  Average Duration: {formatDuration(analysis.averageViolationDuration)}
                </div>
              </div>
            </div>

            <div className="threshold-violations-list">
              <h4>Recent Violations</h4>
              {analysis.violations.slice(0, 5).map((violation, index) => (
                <div 
                  key={index} 
                  className={`violation-item ${violation.type}`}
                >
                  <div className="violation-time">
                    {new Date(violation.timestamp).toLocaleString()}
                  </div>
                  <div className="violation-details">
                    <div className="violation-value">
                      {violation.value.toFixed(2)}
                    </div>
                    <div className="violation-duration">
                      {formatDuration(violation.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricThresholdAnalysis; 