import React, { useState, useMemo } from 'react';
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
import './MetricPredictiveAnalysis.css';

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

interface Prediction {
  timestamp: string;
  value: number;
  confidence: number;
}

interface MetricPredictiveAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricPredictiveAnalysis: React.FC<MetricPredictiveAnalysisProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [predictionWindow, setPredictionWindow] = useState<number>(24); // hours
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.8);

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

  const calculateExponentialSmoothing = (data: number[], alpha: number): number[] => {
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  };

  const calculatePrediction = (data: MetricData[]): Prediction[] => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => d.timestamp);
    const lastTimestamp = new Date(timestamps[timestamps.length - 1]);
    
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
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Generate predictions
    const predictions: Prediction[] = [];
    const movingAvg = calculateMovingAverage(values, 5);
    const expSmooth = calculateExponentialSmoothing(values, 0.3);
    
    for (let i = 1; i <= predictionWindow; i++) {
      const futureTimestamp = new Date(lastTimestamp);
      futureTimestamp.setHours(lastTimestamp.getHours() + i);
      
      const linearPred = slope * (n + i - 1) + intercept;
      const movingAvgPred = movingAvg[movingAvg.length - 1];
      const expSmoothPred = expSmooth[expSmooth.length - 1];
      
      // Weighted average of predictions
      const predictedValue = (linearPred * 0.4 + movingAvgPred * 0.3 + expSmoothPred * 0.3);
      
      // Calculate confidence based on historical accuracy
      const historicalError = values.slice(-5).map((v, idx) => 
        Math.abs(v - (linearPred * 0.4 + movingAvg[idx] * 0.3 + expSmooth[idx] * 0.3))
      );
      const avgError = historicalError.reduce((a, b) => a + b, 0) / historicalError.length;
      const confidence = Math.max(0, 1 - (avgError / Math.max(...values)));
      
      predictions.push({
        timestamp: futureTimestamp.toISOString(),
        value: predictedValue,
        confidence
      });
    }

    return predictions;
  };

  const predictions = useMemo(() => {
    return calculatePrediction(metrics[selectedMetric as keyof typeof metrics]);
  }, [metrics, selectedMetric, predictionWindow]);

  const chartData = {
    labels: [
      ...metrics[selectedMetric as keyof typeof metrics].map(d => new Date(d.timestamp).toLocaleString()),
      ...predictions.map(p => new Date(p.timestamp).toLocaleString())
    ],
    datasets: [
      {
        label: 'Historical Data',
        data: metrics[selectedMetric as keyof typeof metrics].map(d => d.value),
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Prediction',
        data: [
          ...Array(metrics[selectedMetric as keyof typeof metrics].length).fill(null),
          ...predictions.map(p => p.value)
        ],
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderDash: [5, 5],
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
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const value = context.raw;
            
            if (datasetIndex === 1 && value !== null) {
              const prediction = predictions[dataIndex - metrics[selectedMetric as keyof typeof metrics].length];
              return `Prediction: ${value.toFixed(2)} (Confidence: ${(prediction.confidence * 100).toFixed(1)}%)`;
            }
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          }
        }
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
    <div className="metric-predictive-analysis">
      <div className="prediction-header">
        <h2>Predictive Analysis</h2>
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
          <div className="prediction-controls">
            <div className="control-group">
              <label>Prediction Window (hours):</label>
              <input
                type="number"
                min="1"
                max="72"
                value={predictionWindow}
                onChange={(e) => setPredictionWindow(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Confidence Threshold:</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="prediction-grid">
        <div className="prediction-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="prediction-insights">
          <h3>Prediction Insights</h3>
          <div className="insight-cards">
            {predictions.map((prediction, index) => (
              prediction.confidence >= confidenceThreshold && (
                <div
                  key={index}
                  className="insight-card"
                  style={{
                    borderColor: getMetricColor(selectedMetric)
                  }}
                >
                  <div className="insight-time">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </div>
                  <div className="insight-value">
                    {prediction.value.toFixed(2)}
                  </div>
                  <div className="insight-confidence">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricPredictiveAnalysis; 