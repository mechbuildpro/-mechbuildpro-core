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
import './MetricTrendAnalysis.css';

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

interface Trend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

interface MetricTrendAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricTrendAnalysis: React.FC<MetricTrendAnalysisProps> = ({ metrics }) => {
  const calculateTrend = (data: MetricData[], metricName: string): Trend => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
    
    // Calculate linear regression
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((a, b, i) => a + b * values[i], 0);
    const sumXX = timestamps.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rate = slope * (24 * 60 * 60 * 1000); // Convert to daily rate
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const ssTotal = values.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
    const ssResidual = values.reduce((a, b, i) => {
      const predicted = slope * timestamps[i] + (sumY - slope * sumX) / n;
      return a + Math.pow(b - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    const direction = Math.abs(rate) < 0.01 ? 'stable' :
                     rate > 0 ? 'increasing' : 'decreasing';
    
    const confidence = rSquared > 0.8 ? 'high' :
                      rSquared > 0.5 ? 'medium' : 'low';
    
    let description = '';
    if (direction === 'stable') {
      description = `Stable trend with ${confidence} confidence`;
    } else {
      const ratePercent = Math.abs(rate * 100).toFixed(1);
      description = `${direction} trend at ${ratePercent}% per day with ${confidence} confidence`;
    }
    
    return {
      metric: metricName,
      direction,
      rate,
      confidence,
      description
    };
  };

  const analyzeTrends = (): Trend[] => {
    return Object.entries(metrics).map(([metric, data]) => 
      calculateTrend(data, metric)
    );
  };

  const trends = useMemo(() => analyzeTrends(), [metrics]);

  const getTrendColor = (trend: Trend) => {
    const baseColor = trend.direction === 'increasing' ? '#dc3545' :
                     trend.direction === 'decreasing' ? '#28a745' : '#6c757d';
    const opacity = trend.confidence === 'high' ? '1' :
                   trend.confidence === 'medium' ? '0.8' : '0.6';
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
    <div className="metric-trend-analysis">
      <div className="trend-header">
        <h2>Metric Trend Analysis</h2>
        <div className="trend-summary">
          {trends.filter(t => t.confidence === 'high').length} High Confidence Trends
        </div>
      </div>

      <div className="trend-content">
        <div className="trend-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="trend-list">
          <h3>Metric Trends</h3>
          <div className="trend-cards">
            {trends.map((trend, index) => (
              <div key={index} className="trend-card">
                <div className="trend-header">
                  <div 
                    className="trend-direction"
                    style={{ backgroundColor: getTrendColor(trend) }}
                  >
                    {trend.direction.toUpperCase()}
                  </div>
                  <div className="trend-confidence">
                    {trend.confidence.toUpperCase()}
                  </div>
                </div>

                <div className="trend-details">
                  <div className="trend-metric">
                    {trend.metric.toUpperCase()}
                  </div>
                  <div className="trend-rate">
                    Rate: {(trend.rate * 100).toFixed(2)}% per day
                  </div>
                  <div className="trend-description">
                    {trend.description}
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

export default MetricTrendAnalysis; 