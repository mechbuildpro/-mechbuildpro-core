import React, { useMemo } from 'react';
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
import './MetricAnomalyDetection.css';

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

interface Anomaly {
  timestamp: string;
  value: number;
  metric: string;
  severity: 'critical' | 'warning' | 'info';
  deviation: number;
  description: string;
}

interface MetricAnomalyDetectionProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricAnomalyDetection: React.FC<MetricAnomalyDetectionProps> = ({ metrics }) => {
  const detectAnomalies = (): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    const windowSize = 10; // Number of points to analyze for anomalies
    const threshold = 2; // Standard deviations for anomaly detection

    const analyzeMetric = (data: MetricData[], metricName: string) => {
      for (let i = windowSize; i < data.length; i++) {
        const window = data.slice(i - windowSize, i);
        const values = window.map(d => d.value);
        
        // Calculate mean and standard deviation
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        const currentValue = data[i].value;
        const deviation = Math.abs(currentValue - mean) / stdDev;

        if (deviation > threshold) {
          const severity = deviation > threshold * 2 ? 'critical' : 
                          deviation > threshold * 1.5 ? 'warning' : 'info';
          
          anomalies.push({
            timestamp: data[i].timestamp,
            value: currentValue,
            metric: metricName,
            severity,
            deviation,
            description: `Unusual ${metricName} activity detected (${deviation.toFixed(1)}σ deviation)`
          });
        }
      }
    };

    analyzeMetric(metrics.cpu, 'CPU');
    analyzeMetric(metrics.memory, 'Memory');
    analyzeMetric(metrics.network, 'Network');
    analyzeMetric(metrics.error, 'Error Rate');

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const anomalies = useMemo(() => detectAnomalies(), [metrics]);

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

  const chartData = {
    labels: metrics.cpu.map(d => new Date(d.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'CPU Usage',
        data: metrics.cpu.map(d => d.value),
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Memory Usage',
        data: metrics.memory.map(d => d.value),
        borderColor: 'rgba(23, 162, 184, 1)',
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Network Usage',
        data: metrics.network.map(d => d.value / 10),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4
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
    <div className="metric-anomaly-detection">
      <div className="anomaly-header">
        <h2>Anomaly Detection</h2>
        <div className="anomaly-summary">
          {anomalies.filter(a => a.severity === 'critical').length} Critical Anomalies
        </div>
      </div>

      <div className="anomaly-content">
        <div className="anomaly-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="anomaly-list">
          <h3>Detected Anomalies</h3>
          <div className="anomaly-cards">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="anomaly-card">
                <div className="anomaly-header">
                  <div 
                    className="anomaly-severity"
                    style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
                  >
                    {anomaly.severity.toUpperCase()}
                  </div>
                  <div className="anomaly-metric">
                    {anomaly.metric}
                  </div>
                </div>

                <div className="anomaly-details">
                  <div className="anomaly-time">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </div>
                  <div className="anomaly-value">
                    Value: {anomaly.value.toFixed(1)}
                  </div>
                  <div className="anomaly-deviation">
                    Deviation: {anomaly.deviation.toFixed(1)}σ
                  </div>
                  <div className="anomaly-description">
                    {anomaly.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricAnomalyDetection; 