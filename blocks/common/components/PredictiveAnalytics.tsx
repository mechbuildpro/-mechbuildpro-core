import React, { useMemo } from 'react';
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
import './PredictiveAnalytics.css';

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

interface PredictiveAnalyticsProps {
  data: MetricData[];
  metricType: 'cpu' | 'memory' | 'network' | 'error';
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  data,
  metricType,
  timeRange
}) => {
  const analysis = useMemo(() => {
    if (!data.length) return null;

    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());

    // Calculate moving average
    const windowSize = Math.min(5, values.length);
    const movingAverages = values.map((_, i) => {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      return window.reduce((a, b) => a + b, 0) / window.length;
    });

    // Calculate trend line using simple linear regression
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((a, b, i) => a + b * values[i], 0);
    const sumXX = timestamps.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next value
    const lastTimestamp = timestamps[timestamps.length - 1];
    const nextTimestamp = lastTimestamp + (timeRange === '1h' ? 3600000 : 
                         timeRange === '24h' ? 86400000 :
                         timeRange === '7d' ? 604800000 : 2592000000);
    
    const predictedValue = slope * nextTimestamp + intercept;

    // Calculate confidence interval
    const standardError = Math.sqrt(
      values.reduce((a, b, i) => {
        const predicted = slope * timestamps[i] + intercept;
        return a + Math.pow(b - predicted, 2);
      }, 0) / (n - 2)
    );

    const confidenceInterval = 1.96 * standardError;

    // Determine trend direction and strength
    const trendStrength = Math.abs(slope);
    const trendDirection = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const trendCategory = trendStrength > 0.1 ? 'strong' : trendStrength > 0.05 ? 'moderate' : 'weak';

    // Calculate seasonality (if enough data points)
    let seasonality = null;
    if (values.length >= 24) {
      const hourlyAverages = Array(24).fill(0).map((_, hour) => {
        const hourValues = values.filter((_, i) => new Date(timestamps[i]).getHours() === hour);
        return hourValues.reduce((a, b) => a + b, 0) / hourValues.length;
      });
      seasonality = hourlyAverages;
    }

    return {
      movingAverages,
      predictedValue,
      confidenceInterval,
      trendDirection,
      trendCategory,
      seasonality,
      slope,
      intercept
    };
  }, [data, timeRange]);

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Actual Values',
        data: data.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Moving Average',
        data: analysis?.movingAverages || [],
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Prediction',
        data: [
          ...Array(data.length - 1).fill(null),
          analysis?.predictedValue
        ],
        borderColor: 'rgb(54, 162, 235)',
        borderDash: [2, 2],
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
        text: `${metricType.toUpperCase()} Prediction Analysis`
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
    <div className="predictive-analytics">
      <div className="prediction-summary">
        <div className="summary-card">
          <h4>Predicted Value</h4>
          <div className="value">{analysis.predictedValue.toFixed(2)}</div>
          <div className="confidence">
            ±{analysis.confidenceInterval.toFixed(2)} (95% confidence)
          </div>
        </div>

        <div className="summary-card">
          <h4>Trend Analysis</h4>
          <div className={`trend-indicator ${analysis.trendDirection} ${analysis.trendCategory}`}>
            {analysis.trendDirection === 'increasing' ? '📈' : 
             analysis.trendDirection === 'decreasing' ? '📉' : '➡️'}
            {analysis.trendDirection.charAt(0).toUpperCase() + analysis.trendDirection.slice(1)}
            <span className="trend-strength">
              ({analysis.trendCategory})
            </span>
          </div>
        </div>

        {analysis.seasonality && (
          <div className="summary-card">
            <h4>Seasonal Pattern</h4>
            <div className="seasonality-chart">
              <Line
                data={{
                  labels: Array(24).fill(0).map((_, i) => `${i}:00`),
                  datasets: [{
                    label: 'Hourly Average',
                    data: analysis.seasonality,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    fill: true
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
        )}
      </div>

      <div className="prediction-chart">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="prediction-insights">
        <h4>Key Insights</h4>
        <ul>
          <li>
            <strong>Trend:</strong> The {metricType} is showing a{' '}
            <span className={analysis.trendDirection}>
              {analysis.trendCategory} {analysis.trendDirection}
            </span>{' '}
            trend
          </li>
          <li>
            <strong>Prediction:</strong> Expected to reach{' '}
            {analysis.predictedValue.toFixed(2)} in the next period
          </li>
          <li>
            <strong>Confidence:</strong> 95% confidence interval of{' '}
            ±{analysis.confidenceInterval.toFixed(2)}
          </li>
          {analysis.seasonality && (
            <li>
              <strong>Seasonality:</strong> Shows{' '}
              {analysis.seasonality.some((v, i, arr) => 
                Math.abs(v - arr[(i + 1) % arr.length]) > analysis.confidenceInterval
              ) ? 'significant' : 'minimal'}{' '}
              hourly patterns
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PredictiveAnalytics; 