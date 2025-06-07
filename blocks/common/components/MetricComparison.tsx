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
import './MetricComparison.css';

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

interface MetricComparisonProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
  timeRange: '1h' | '6h' | '24h' | '7d';
}

const MetricComparison: React.FC<MetricComparisonProps> = ({
  metrics,
  timeRange
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cpu', 'memory']);

  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    const metricKeys = Object.keys(metrics);

    metricKeys.forEach(metric1 => {
      matrix[metric1] = {};
      metricKeys.forEach(metric2 => {
        if (metric1 === metric2) {
          matrix[metric1][metric2] = 1;
          return;
        }

        const values1 = metrics[metric1].map(d => d.value);
        const values2 = metrics[metric2].map(d => d.value);

        // Calculate correlation coefficient
        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

        const variance1 = values1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / values1.length;
        const variance2 = values2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / values2.length;

        const covariance = values1.reduce((a, b, i) => a + (b - mean1) * (values2[i] - mean2), 0) / values1.length;

        matrix[metric1][metric2] = covariance / (Math.sqrt(variance1) * Math.sqrt(variance2));
      });
    });

    return matrix;
  }, [metrics]);

  const chartData = useMemo(() => {
    const timestamps = metrics[selectedMetrics[0]].map(d => new Date(d.timestamp).toLocaleTimeString());
    
    return {
      labels: timestamps,
      datasets: selectedMetrics.map(metric => ({
        label: getMetricName(metric),
        data: metrics[metric].map(d => d.value),
        borderColor: getMetricColor(metric),
        backgroundColor: getMetricColor(metric, 0.1),
        fill: false,
        tension: 0.4
      }))
    };
  }, [metrics, selectedMetrics]);

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

  const getCorrelationStrength = (correlation: number) => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return 'strong';
    if (absCorr >= 0.3) return 'moderate';
    return 'weak';
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <div className="metric-comparison">
      <div className="comparison-header">
        <h2>Metric Comparison</h2>
        <div className="metric-selector">
          {Object.keys(metrics).map(metric => (
            <button
              key={metric}
              className={`metric-button ${selectedMetrics.includes(metric) ? 'selected' : ''}`}
              onClick={() => toggleMetric(metric)}
            >
              {getMetricName(metric)}
            </button>
          ))}
        </div>
      </div>

      <div className="comparison-grid">
        <div className="comparison-chart">
          {chartData && (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>

        <div className="correlation-matrix">
          <h3>Correlation Matrix</h3>
          <div className="matrix-grid">
            {Object.entries(correlationMatrix).map(([metric1, correlations]) => (
              <div key={metric1} className="matrix-row">
                {Object.entries(correlations).map(([metric2, correlation]) => (
                  <div
                    key={`${metric1}-${metric2}`}
                    className={`correlation-cell ${getCorrelationStrength(correlation)}`}
                    title={`${getMetricName(metric1)} vs ${getMetricName(metric2)}: ${correlation.toFixed(2)}`}
                  >
                    {metric1 === metric2 ? (
                      <span className="self-correlation">1.00</span>
                    ) : (
                      correlation.toFixed(2)
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricComparison; 