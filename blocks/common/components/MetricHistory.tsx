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
import './MetricHistory.css';

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
  metric: string;
}

interface MetricHistoryProps {
  data: MetricData[];
  metricType: 'cpu' | 'memory' | 'network' | 'error';
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const MetricHistory: React.FC<MetricHistoryProps> = ({ data, metricType, timeRange }) => {
  const {
    average,
    min,
    max,
    trend,
    peakTimes,
    anomalies
  } = useMemo(() => {
    if (!data.length) return {
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      peakTimes: [],
      anomalies: []
    };

    const values = data.map(d => d.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg * 1.1 ? 'increasing' :
                 secondAvg < firstAvg * 0.9 ? 'decreasing' : 'stable';

    // Find peak times
    const threshold = average + (max - average) * 0.8;
    const peakTimes = data
      .filter(d => d.value > threshold)
      .map(d => new Date(d.timestamp).toLocaleTimeString());

    // Detect anomalies (values more than 2 standard deviations from mean)
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / values.length
    );
    const anomalies = data
      .filter(d => Math.abs(d.value - average) > 2 * stdDev)
      .map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        value: d.value
      }));

    return {
      average,
      min,
      max,
      trend,
      peakTimes,
      anomalies
    };
  }, [data]);

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${metricType.charAt(0).toUpperCase() + metricType.slice(1)} Usage`,
        data: data.map(d => d.value),
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
        text: `${metricType.charAt(0).toUpperCase() + metricType.slice(1)} Usage History`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const getMetricUnit = () => {
    switch (metricType) {
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
    <div className="metric-history">
      <h3>Historical Analysis</h3>
      
      <div className="history-grid">
        <div className="history-card">
          <h4>Summary Statistics</h4>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Average</span>
              <span className="stat-value">{average.toFixed(1)}{getMetricUnit()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Minimum</span>
              <span className="stat-value">{min.toFixed(1)}{getMetricUnit()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maximum</span>
              <span className="stat-value">{max.toFixed(1)}{getMetricUnit()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trend</span>
              <span className={`stat-value trend-${trend}`}>
                {trend === 'increasing' ? '↗️ Increasing' :
                 trend === 'decreasing' ? '↘️ Decreasing' : '→ Stable'}
              </span>
            </div>
          </div>
        </div>

        <div className="history-card">
          <h4>Peak Times</h4>
          {peakTimes.length > 0 ? (
            <ul className="peak-times">
              {peakTimes.map((time, index) => (
                <li key={index}>{time}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No significant peaks detected</p>
          )}
        </div>

        <div className="history-card">
          <h4>Anomalies</h4>
          {anomalies.length > 0 ? (
            <ul className="anomalies">
              {anomalies.map((anomaly, index) => (
                <li key={index}>
                  {anomaly.time}: {anomaly.value.toFixed(1)}{getMetricUnit()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No anomalies detected</p>
          )}
        </div>
      </div>

      <div className="history-chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MetricHistory; 