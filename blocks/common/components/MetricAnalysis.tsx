import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricData {
  timestamp: string;
  value: number;
  metric: string;
}

interface MetricAnalysisProps {
  data: MetricData[];
  metricType: 'cpu' | 'memory' | 'network' | 'error';
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const MetricAnalysis: React.FC<MetricAnalysisProps> = ({
  data,
  metricType,
  timeRange
}) => {
  const analysis = useMemo(() => {
    if (!data.length) return null;

    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length
    );

    // Calculate trend
    const recentValues = values.slice(-5);
    const oldValues = values.slice(-10, -5);
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const oldAvg = oldValues.reduce((a, b) => a + b, 0) / oldValues.length;
    const trend = recentAvg > oldAvg ? 'increasing' : recentAvg < oldAvg ? 'decreasing' : 'stable';

    // Calculate anomalies
    const threshold = avg + (2 * stdDev);
    const anomalies = values.filter(v => v > threshold).length;

    return {
      average: avg,
      maximum: max,
      minimum: min,
      standardDeviation: stdDev,
      trend,
      anomalies,
      threshold
    };
  }, [data]);

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${metricType.toUpperCase()} Usage`,
        data: data.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Threshold',
        data: data.map(() => analysis?.threshold || 0),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        fill: false
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
        text: `${metricType.toUpperCase()} Analysis`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (!analysis) return null;

  return (
    <div className="metric-analysis">
      <div className="analysis-summary">
        <div className="summary-card">
          <h4>Average</h4>
          <div className="value">{analysis.average.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h4>Maximum</h4>
          <div className="value">{analysis.maximum.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h4>Minimum</h4>
          <div className="value">{analysis.minimum.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h4>Standard Deviation</h4>
          <div className="value">{analysis.standardDeviation.toFixed(2)}</div>
        </div>
      </div>

      <div className="trend-analysis">
        <h4>Trend Analysis</h4>
        <div className={`trend-indicator ${analysis.trend}`}>
          {analysis.trend === 'increasing' ? '📈' : analysis.trend === 'decreasing' ? '📉' : '➡️'}
          {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
        </div>
        <div className="anomalies">
          <h4>Anomalies Detected</h4>
          <div className="value">{analysis.anomalies}</div>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="distribution">
        <h4>Value Distribution</h4>
        <Bar
          data={{
            labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
            datasets: [{
              label: 'Distribution',
              data: [
                data.filter(d => d.value <= 25).length,
                data.filter(d => d.value > 25 && d.value <= 50).length,
                data.filter(d => d.value > 50 && d.value <= 75).length,
                data.filter(d => d.value > 75).length
              ],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ]
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default MetricAnalysis; 