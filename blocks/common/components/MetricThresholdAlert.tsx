import React, { useState, useEffect } from 'react';
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
} from 'chart.js/auto';
import './MetricThresholdAlert.css';

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

interface Threshold {
  metric: string;
  upperBound: number;
  lowerBound: number;
  duration: number; // minutes
  severity: 'critical' | 'warning' | 'info';
}

interface MetricThresholdAlertProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
  onAlert: (alert: {
    metric: string;
    value: number;
    threshold: number;
    severity: string;
    timestamp: string;
  }) => void;
}

const MetricThresholdAlert: React.FC<MetricThresholdAlertProps> = ({
  metrics,
  onAlert
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [newThreshold, setNewThreshold] = useState<Partial<Threshold>>({
    metric: 'cpu',
    upperBound: 80,
    lowerBound: 20,
    duration: 5,
    severity: 'warning'
  });

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const addThreshold = () => {
    if (newThreshold.metric && newThreshold.upperBound && newThreshold.lowerBound && newThreshold.duration && newThreshold.severity) {
      setThresholds([...thresholds, newThreshold as Threshold]);
      setNewThreshold({
        metric: 'cpu',
        upperBound: 80,
        lowerBound: 20,
        duration: 5,
        severity: 'warning'
      });
    }
  };

  const removeThreshold = (index: number) => {
    setThresholds(thresholds.filter((_, i) => i !== index));
  };

  const checkThresholds = () => {
    const data = metrics[selectedMetric as keyof typeof metrics];
    if (!data || data.length === 0) return;

    const recentData = data.slice(-newThreshold.duration!);
    const values = recentData.map(d => d.value);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

    thresholds.forEach(threshold => {
      if (threshold.metric === selectedMetric) {
        if (avgValue > threshold.upperBound) {
          onAlert({
            metric: selectedMetric,
            value: avgValue,
            threshold: threshold.upperBound,
            severity: threshold.severity,
            timestamp: new Date().toISOString()
          });
        } else if (avgValue < threshold.lowerBound) {
          onAlert({
            metric: selectedMetric,
            value: avgValue,
            threshold: threshold.lowerBound,
            severity: threshold.severity,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(checkThresholds, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [thresholds, selectedMetric, metrics]);

  const chartData = {
    labels: metrics[selectedMetric as keyof typeof metrics].map(d => 
      new Date(d.timestamp).toLocaleString()
    ),
    datasets: [
      {
        label: getMetricName(selectedMetric),
        data: metrics[selectedMetric as keyof typeof metrics].map(d => d.value),
        borderColor: getMetricColor(selectedMetric),
        backgroundColor: getMetricColor(selectedMetric, 0.1),
        fill: true,
        tension: 0.4
      },
      ...thresholds
        .filter(t => t.metric === selectedMetric)
        .map(t => ({
          label: `Upper Bound (${t.severity})`,
          data: Array(metrics[selectedMetric as keyof typeof metrics].length).fill(t.upperBound),
          borderColor: getSeverityColor(t.severity),
          borderDash: [5, 5],
          fill: false
        })),
      ...thresholds
        .filter(t => t.metric === selectedMetric)
        .map(t => ({
          label: `Lower Bound (${t.severity})`,
          data: Array(metrics[selectedMetric as keyof typeof metrics].length).fill(t.lowerBound),
          borderColor: getSeverityColor(t.severity),
          borderDash: [5, 5],
          fill: false
        }))
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
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

  return (
    <div className="metric-threshold-alert">
      <div className="threshold-header">
        <h2>Threshold Management</h2>
        <div className="metric-selector">
          {Object.keys(metrics).map(metric => (
            <button
              key={metric}
              className={`metric-button ${selectedMetric === metric ? 'selected' : ''}`}
              onClick={() => setSelectedMetric(metric)}
            >
              {getMetricName(metric)}
            </button>
          ))}
        </div>
      </div>

      <div className="threshold-grid">
        <div className="threshold-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="threshold-controls">
          <div className="threshold-form">
            <h3>Add New Threshold</h3>
            <div className="form-group">
              <label>Upper Bound:</label>
              <input
                type="number"
                value={newThreshold.upperBound}
                onChange={(e) => setNewThreshold({
                  ...newThreshold,
                  upperBound: parseFloat(e.target.value)
                })}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Lower Bound:</label>
              <input
                type="number"
                value={newThreshold.lowerBound}
                onChange={(e) => setNewThreshold({
                  ...newThreshold,
                  lowerBound: parseFloat(e.target.value)
                })}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes):</label>
              <input
                type="number"
                value={newThreshold.duration}
                onChange={(e) => setNewThreshold({
                  ...newThreshold,
                  duration: parseInt(e.target.value)
                })}
                min="1"
                max="60"
              />
            </div>
            <div className="form-group">
              <label>Severity:</label>
              <select
                value={newThreshold.severity}
                onChange={(e) => setNewThreshold({
                  ...newThreshold,
                  severity: e.target.value as 'critical' | 'warning' | 'info'
                })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button
              className="add-threshold-button"
              onClick={addThreshold}
            >
              Add Threshold
            </button>
          </div>

          <div className="threshold-list">
            <h3>Active Thresholds</h3>
            {thresholds
              .filter(t => t.metric === selectedMetric)
              .map((threshold, index) => (
                <div
                  key={index}
                  className="threshold-card"
                  style={{ borderColor: getSeverityColor(threshold.severity) }}
                >
                  <div className="threshold-info">
                    <div className="threshold-range">
                      {threshold.lowerBound} - {threshold.upperBound}
                    </div>
                    <div className="threshold-details">
                      <span className="threshold-duration">
                        {threshold.duration} min
                      </span>
                      <span
                        className="threshold-severity"
                        style={{ color: getSeverityColor(threshold.severity) }}
                      >
                        {threshold.severity}
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-threshold-button"
                    onClick={() => removeThreshold(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricThresholdAlert; 