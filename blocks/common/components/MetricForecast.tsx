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
import './MetricForecast.css';

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

interface ForecastResult {
  metric: string;
  predictions: {
    timestamp: string;
    value: number;
    lowerBound: number;
    upperBound: number;
  }[];
  confidence: number;
  error: number;
}

interface MetricForecastProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricForecast: React.FC<MetricForecastProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [forecastHorizon, setForecastHorizon] = useState<number>(24); // hours
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);

  const calculateMovingAverage = (data: number[], window: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const values = data.slice(start, i + 1);
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      result.push(average);
    }
    return result;
  };

  const calculateExponentialSmoothing = (data: number[], alpha: number = 0.3): number[] => {
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  };

  const calculateForecast = (data: MetricData[], horizon: number): ForecastResult => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
    const lastTimestamp = timestamps[timestamps.length - 1];
    const interval = timestamps[1] - timestamps[0];

    // Calculate trend using linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate moving average and exponential smoothing
    const ma = calculateMovingAverage(values, 5);
    const es = calculateExponentialSmoothing(values);

    // Calculate prediction intervals
    const residuals = values.map((v, i) => v - (slope * i + intercept));
    const residualStd = Math.sqrt(residuals.reduce((a, b) => a + b * b, 0) / n);
    const zScore = Math.abs(Math.erf(confidenceLevel / Math.sqrt(2)));

    // Generate predictions
    const predictions = Array.from({ length: horizon }, (_, i) => {
      const futureTimestamp = lastTimestamp + (i + 1) * interval;
      const trendValue = slope * (n + i) + intercept;
      const maValue = ma[ma.length - 1];
      const esValue = es[es.length - 1];
      
      // Combine predictions with weights
      const predictedValue = 0.4 * trendValue + 0.3 * maValue + 0.3 * esValue;
      const margin = zScore * residualStd * Math.sqrt(1 + 1/n + Math.pow(n + i - xMean, 2) / denominator);

      return {
        timestamp: new Date(futureTimestamp).toISOString(),
        value: predictedValue,
        lowerBound: predictedValue - margin,
        upperBound: predictedValue + margin
      };
    });

    // Calculate forecast error (RMSE)
    const error = Math.sqrt(residuals.reduce((a, b) => a + b * b, 0) / n);

    // Calculate confidence based on R-squared
    const ssTotal = values.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const ssResidual = residuals.reduce((a, b) => a + b * b, 0);
    const confidence = 1 - (ssResidual / ssTotal);

    return {
      metric: selectedMetric,
      predictions,
      confidence,
      error
    };
  };

  const forecast = useMemo(() => {
    return calculateForecast(metrics[selectedMetric as keyof typeof metrics], forecastHorizon);
  }, [metrics, selectedMetric, forecastHorizon, confidenceLevel]);

  const chartData = {
    labels: [
      ...metrics[selectedMetric as keyof typeof metrics].map(d => 
        new Date(d.timestamp).toLocaleString()
      ),
      ...forecast.predictions.map(p => 
        new Date(p.timestamp).toLocaleString()
      )
    ],
    datasets: [
      {
        label: 'Historical Data',
        data: [
          ...metrics[selectedMetric as keyof typeof metrics].map(d => d.value),
          ...Array(forecastHorizon).fill(null)
        ],
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Forecast',
        data: [
          ...Array(metrics[selectedMetric as keyof typeof metrics].length).fill(null),
          ...forecast.predictions.map(p => p.value)
        ],
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      },
      {
        label: 'Upper Bound',
        data: [
          ...Array(metrics[selectedMetric as keyof typeof metrics].length).fill(null),
          ...forecast.predictions.map(p => p.upperBound)
        ],
        borderColor: 'rgba(255, 193, 7, 0.5)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderDash: [2, 2],
        fill: false,
        tension: 0.4
      },
      {
        label: 'Lower Bound',
        data: [
          ...Array(metrics[selectedMetric as keyof typeof metrics].length).fill(null),
          ...forecast.predictions.map(p => p.lowerBound)
        ],
        borderColor: 'rgba(255, 193, 7, 0.5)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderDash: [2, 2],
        fill: false,
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

  return (
    <div className="metric-forecast">
      <div className="forecast-header">
        <h2>Metric Forecasting</h2>
        <div className="controls">
          <div className="metric-selector">
            {Object.keys(metrics).map(metric => (
              <button
                key={metric}
                className={`metric-button ${selectedMetric === metric ? 'selected' : ''}`}
                onClick={() => setSelectedMetric(metric)}
                style={{
                  borderColor: selectedMetric === metric ? getMetricColor(metric) : undefined,
                  backgroundColor: selectedMetric === metric ? getMetricColor(metric) : undefined
                }}
              >
                {getMetricName(metric)}
              </button>
            ))}
          </div>
          <div className="forecast-controls">
            <div className="control-group">
              <label>Forecast Horizon (hours):</label>
              <input
                type="number"
                min="1"
                max="168"
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Confidence Level:</label>
              <input
                type="number"
                min="0.5"
                max="0.99"
                step="0.01"
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="forecast-grid">
        <div className="forecast-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="forecast-details">
          <h3>Forecast Analysis</h3>
          <div className="forecast-cards">
            <div className="forecast-card">
              <div className="forecast-metric">
                <span style={{ color: getMetricColor(selectedMetric) }}>
                  {getMetricName(selectedMetric)}
                </span>
              </div>
              <div className="forecast-info">
                <div className="forecast-confidence">
                  Confidence: {(forecast.confidence * 100).toFixed(1)}%
                </div>
                <div className="forecast-error">
                  Error: {forecast.error.toFixed(2)}
                </div>
                <div className="forecast-range">
                  Prediction Range: {((1 - confidenceLevel) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="forecast-bar">
                <div
                  className="forecast-bar-fill"
                  style={{
                    width: `${forecast.confidence * 100}%`,
                    backgroundColor: getMetricColor(selectedMetric)
                  }}
                />
              </div>
            </div>

            <div className="forecast-predictions">
              <h4>Latest Predictions</h4>
              {forecast.predictions.slice(0, 5).map((prediction, index) => (
                <div key={index} className="prediction-item">
                  <div className="prediction-time">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </div>
                  <div className="prediction-value">
                    {prediction.value.toFixed(2)}
                    <span className="prediction-range">
                      ±{((prediction.upperBound - prediction.value) / prediction.value * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricForecast; 