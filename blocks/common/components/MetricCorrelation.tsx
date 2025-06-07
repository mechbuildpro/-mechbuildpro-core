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
  ScatterController
} from 'chart.js/auto';
import { Scatter } from 'react-chartjs-2';
import './MetricCorrelation.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface MetricData {
  timestamp: string;
  value: number;
  metric: string;
}

interface MetricCorrelationProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
  timeRange: '1h' | '24h' | '7d' | '30d';
}

interface CorrelationResult {
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'none';
}

const MetricCorrelation: React.FC<MetricCorrelationProps> = ({ metrics, timeRange }) => {
  const calculateCorrelation = (x: number[], y: number[]): CorrelationResult => {
    const n = Math.min(x.length, y.length);
    if (n < 2) return { correlation: 0, strength: 'none', direction: 'none' };

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return {
      correlation,
      strength: Math.abs(correlation) > 0.7 ? 'strong' :
                Math.abs(correlation) > 0.3 ? 'moderate' :
                Math.abs(correlation) > 0.1 ? 'weak' : 'none',
      direction: correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'none'
    };
  };

  const correlations = useMemo(() => {
    const pairs = [
      { x: 'cpu', y: 'memory' },
      { x: 'cpu', y: 'network' },
      { x: 'cpu', y: 'error' },
      { x: 'memory', y: 'network' },
      { x: 'memory', y: 'error' },
      { x: 'network', y: 'error' }
    ];

    return pairs.map(pair => {
      const xValues = metrics[pair.x as keyof typeof metrics].map(m => m.value);
      const yValues = metrics[pair.y as keyof typeof metrics].map(m => m.value);
      return {
        pair,
        result: calculateCorrelation(xValues, yValues)
      };
    });
  }, [metrics]);

  const getCorrelationColor = (correlation: CorrelationResult) => {
    if (correlation.strength === 'none') return 'rgb(108, 117, 125)';
    return correlation.direction === 'positive' ? 'rgb(40, 167, 69)' : 'rgb(220, 53, 69)';
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

  return (
    <div className="metric-correlation">
      <div className="correlation-header">
        <h3>Metric Correlations</h3>
        <p className="correlation-description">
          Analysis of relationships between different system metrics
        </p>
      </div>

      <div className="correlation-grid">
        {correlations.map(({ pair, result }, index) => (
          <div key={index} className="correlation-card">
            <div className="correlation-title">
              {pair.x.toUpperCase()} vs {pair.y.toUpperCase()}
            </div>
            <div className="correlation-value" style={{ color: getCorrelationColor(result) }}>
              {result.correlation.toFixed(2)}
            </div>
            <div className="correlation-details">
              <span className={`correlation-strength ${result.strength}`}>
                {result.strength.toUpperCase()}
              </span>
              <span className={`correlation-direction ${result.direction}`}>
                {result.direction.toUpperCase()}
              </span>
            </div>
            <div className="correlation-chart">
              <Scatter
                data={{
                  datasets: [{
                    label: `${pair.x} vs ${pair.y}`,
                    data: metrics[pair.x as keyof typeof metrics].map((m, i) => ({
                      x: m.value,
                      y: metrics[pair.y as keyof typeof metrics][i]?.value || 0
                    })),
                    backgroundColor: getCorrelationColor(result)
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: `${pair.x.toUpperCase()} (${getMetricUnit(pair.x)})`
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: `${pair.y.toUpperCase()} (${getMetricUnit(pair.y)})`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricCorrelation; 