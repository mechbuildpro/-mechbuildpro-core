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
import './MetricCorrelationAnalysis.css';

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

interface Correlation {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  type: 'positive' | 'negative';
  description: string;
}

interface MetricCorrelationAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricCorrelationAnalysis: React.FC<MetricCorrelationAnalysisProps> = ({ metrics }) => {
  const calculateCorrelation = (data1: number[], data2: number[]): number => {
    const n = data1.length;
    const sum1 = data1.reduce((a, b) => a + b, 0);
    const sum2 = data2.reduce((a, b) => a + b, 0);
    const mean1 = sum1 / n;
    const mean2 = sum2 / n;

    const covariance = data1.reduce((acc, val, i) => {
      return acc + (val - mean1) * (data2[i] - mean2);
    }, 0) / n;

    const variance1 = data1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) / n;
    const variance2 = data2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0) / n;

    return covariance / Math.sqrt(variance1 * variance2);
  };

  const analyzeCorrelations = (): Correlation[] => {
    const correlations: Correlation[] = [];
    const metricPairs = [
      ['cpu', 'memory'],
      ['cpu', 'network'],
      ['cpu', 'error'],
      ['memory', 'network'],
      ['memory', 'error'],
      ['network', 'error']
    ];

    metricPairs.forEach(([metric1, metric2]) => {
      const data1 = metrics[metric1 as keyof typeof metrics].map(d => d.value);
      const data2 = metrics[metric2 as keyof typeof metrics].map(d => d.value);
      const correlation = calculateCorrelation(data1, data2);

      const strength = Math.abs(correlation) > 0.7 ? 'strong' :
                      Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';
      const type = correlation > 0 ? 'positive' : 'negative';

      let description = '';
      if (Math.abs(correlation) > 0.7) {
        description = `Strong ${type} correlation between ${metric1} and ${metric2}`;
      } else if (Math.abs(correlation) > 0.3) {
        description = `Moderate ${type} correlation between ${metric1} and ${metric2}`;
      } else {
        description = `Weak correlation between ${metric1} and ${metric2}`;
      }

      correlations.push({
        metric1,
        metric2,
        correlation,
        strength,
        type,
        description
      });
    });

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  };

  const correlations = useMemo(() => analyzeCorrelations(), [metrics]);

  const getCorrelationColor = (correlation: Correlation) => {
    const baseColor = correlation.type === 'positive' ? '#28a745' : '#dc3545';
    const opacity = correlation.strength === 'strong' ? '1' :
                   correlation.strength === 'moderate' ? '0.8' : '0.6';
    return `${baseColor}${opacity}`;
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
    <div className="metric-correlation-analysis">
      <div className="correlation-header">
        <h2>Metric Correlation Analysis</h2>
        <div className="correlation-summary">
          {correlations.filter(c => c.strength === 'strong').length} Strong Correlations
        </div>
      </div>

      <div className="correlation-content">
        <div className="correlation-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="correlation-list">
          <h3>Metric Correlations</h3>
          <div className="correlation-cards">
            {correlations.map((correlation, index) => (
              <div key={index} className="correlation-card">
                <div className="correlation-header">
                  <div 
                    className="correlation-strength"
                    style={{ backgroundColor: getCorrelationColor(correlation) }}
                  >
                    {correlation.strength.toUpperCase()}
                  </div>
                  <div className="correlation-type">
                    {correlation.type.toUpperCase()}
                  </div>
                </div>

                <div className="correlation-details">
                  <div className="correlation-metrics">
                    {correlation.metric1.toUpperCase()} ↔ {correlation.metric2.toUpperCase()}
                  </div>
                  <div className="correlation-value">
                    Correlation: {correlation.correlation.toFixed(2)}
                  </div>
                  <div className="correlation-description">
                    {correlation.description}
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

export default MetricCorrelationAnalysis; 