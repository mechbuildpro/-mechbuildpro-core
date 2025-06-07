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
import './MetricCorrelationMatrix.css';

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

interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number;
  lag: number;
  strength: number;
}

interface MetricCorrelationMatrixProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricCorrelationMatrix: React.FC<MetricCorrelationMatrixProps> = ({ metrics }) => {
  const calculateCorrelation = (data1: number[], data2: number[], lag: number = 0): number => {
    const n = Math.min(data1.length, data2.length) - lag;
    if (n <= 1) return 0;

    const mean1 = data1.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const mean2 = data2.slice(lag, lag + n).reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i + lag] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    if (denominator1 === 0 || denominator2 === 0) return 0;
    return numerator / Math.sqrt(denominator1 * denominator2);
  };

  const findOptimalLag = (data1: number[], data2: number[], maxLag: number = 10): number => {
    let bestLag = 0;
    let bestCorrelation = 0;

    for (let lag = 0; lag <= maxLag; lag++) {
      const correlation = Math.abs(calculateCorrelation(data1, data2, lag));
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return bestLag;
  };

  const correlations = useMemo(() => {
    const metricKeys = Object.keys(metrics);
    const results: CorrelationResult[] = [];

    for (let i = 0; i < metricKeys.length; i++) {
      for (let j = i + 1; j < metricKeys.length; j++) {
        const metric1 = metricKeys[i];
        const metric2 = metricKeys[j];
        const data1 = metrics[metric1 as keyof typeof metrics].map(d => d.value);
        const data2 = metrics[metric2 as keyof typeof metrics].map(d => d.value);

        const lag = findOptimalLag(data1, data2);
        const correlation = calculateCorrelation(data1, data2, lag);
        const strength = Math.abs(correlation);

        results.push({
          metric1,
          metric2,
          correlation,
          lag,
          strength
        });
      }
    }

    return results.sort((a, b) => b.strength - a.strength);
  }, [metrics]);

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

  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.7) return correlation > 0 ? '#28a745' : '#dc3545';
    if (absCorrelation > 0.3) return correlation > 0 ? '#ffc107' : '#fd7e14';
    return '#6c757d';
  };

  const getCorrelationStrength = (correlation: number): string => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.7) return 'Strong';
    if (absCorrelation > 0.3) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="metric-correlation-matrix">
      <div className="correlation-header">
        <h2>Metric Correlation Analysis</h2>
      </div>

      <div className="correlation-grid">
        <div className="correlation-matrix">
          <h3>Correlation Matrix</h3>
          <div className="matrix-grid">
            {Object.keys(metrics).map(metric1 => (
              <div key={metric1} className="matrix-row">
                {Object.keys(metrics).map(metric2 => {
                  if (metric1 === metric2) {
                    return (
                      <div key={metric2} className="matrix-cell diagonal">
                        {getMetricName(metric1)}
                      </div>
                    );
                  }

                  const correlation = correlations.find(
                    c => (c.metric1 === metric1 && c.metric2 === metric2) ||
                         (c.metric1 === metric2 && c.metric2 === metric1)
                  );

                  return (
                    <div
                      key={metric2}
                      className="matrix-cell"
                      style={{
                        backgroundColor: correlation ? getCorrelationColor(correlation.correlation) : 'transparent'
                      }}
                    >
                      {correlation ? (
                        <div className="correlation-value">
                          {correlation.correlation.toFixed(2)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="correlation-details">
          <h3>Detailed Correlations</h3>
          <div className="correlation-cards">
            {correlations.map((correlation, index) => (
              <div
                key={index}
                className="correlation-card"
                style={{
                  borderColor: getCorrelationColor(correlation.correlation)
                }}
              >
                <div className="correlation-metrics">
                  <span style={{ color: getMetricColor(correlation.metric1) }}>
                    {getMetricName(correlation.metric1)}
                  </span>
                  {' ↔ '}
                  <span style={{ color: getMetricColor(correlation.metric2) }}>
                    {getMetricName(correlation.metric2)}
                  </span>
                </div>
                <div className="correlation-info">
                  <div className="correlation-strength">
                    {getCorrelationStrength(correlation.correlation)}
                    {correlation.correlation > 0 ? ' Positive' : ' Negative'}
                  </div>
                  <div className="correlation-value">
                    {correlation.correlation.toFixed(2)}
                  </div>
                  {correlation.lag > 0 && (
                    <div className="correlation-lag">
                      Lag: {correlation.lag} points
                    </div>
                  )}
                </div>
                <div className="correlation-bar">
                  <div
                    className="correlation-bar-fill"
                    style={{
                      width: `${Math.abs(correlation.correlation) * 100}%`,
                      backgroundColor: getCorrelationColor(correlation.correlation)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCorrelationMatrix; 