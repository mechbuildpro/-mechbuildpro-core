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
import './MetricSeasonalAnalysis.css';

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

interface SeasonalPattern {
  period: number;
  strength: number;
  phase: number;
  amplitude: number;
}

interface MetricSeasonalAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricSeasonalAnalysis: React.FC<MetricSeasonalAnalysisProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [minPeriod, setMinPeriod] = useState<number>(2);
  const [maxPeriod, setMaxPeriod] = useState<number>(24);
  const [strengthThreshold, setStrengthThreshold] = useState<number>(0.5);

  const calculateAutocorrelation = (data: number[], lag: number): number => {
    const n = data.length;
    if (n <= lag) return 0;

    const mean = data.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n - lag; i++) {
      const diff1 = data[i] - mean;
      const diff2 = data[i + lag] - mean;
      numerator += diff1 * diff2;
      denominator += diff1 * diff1;
    }

    return numerator / denominator;
  };

  const findSeasonalPatterns = (data: MetricData[]): SeasonalPattern[] => {
    const values = data.map(d => d.value);
    const patterns: SeasonalPattern[] = [];

    for (let period = minPeriod; period <= maxPeriod; period++) {
      const autocorr = calculateAutocorrelation(values, period);
      const strength = Math.abs(autocorr);

      if (strength >= strengthThreshold) {
        // Calculate phase and amplitude
        const phase = Math.atan2(
          values.slice(period).reduce((sum, val, i) => sum + val * Math.sin(2 * Math.PI * i / period), 0),
          values.slice(period).reduce((sum, val, i) => sum + val * Math.cos(2 * Math.PI * i / period), 0)
        );

        const amplitude = Math.sqrt(
          Math.pow(values.slice(period).reduce((sum, val, i) => sum + val * Math.sin(2 * Math.PI * i / period), 0), 2) +
          Math.pow(values.slice(period).reduce((sum, val, i) => sum + val * Math.cos(2 * Math.PI * i / period), 0), 2)
        ) / (values.length - period);

        patterns.push({
          period,
          strength,
          phase,
          amplitude
        });
      }
    }

    return patterns.sort((a, b) => b.strength - a.strength);
  };

  const seasonalPatterns = useMemo(() => {
    return findSeasonalPatterns(metrics[selectedMetric as keyof typeof metrics]);
  }, [metrics, selectedMetric, minPeriod, maxPeriod, strengthThreshold]);

  const generateSeasonalCurve = (pattern: SeasonalPattern, length: number): number[] => {
    const curve: number[] = [];
    const mean = metrics[selectedMetric as keyof typeof metrics]
      .reduce((sum, d) => sum + d.value, 0) / metrics[selectedMetric as keyof typeof metrics].length;

    for (let i = 0; i < length; i++) {
      curve.push(
        mean + pattern.amplitude * Math.sin(2 * Math.PI * i / pattern.period + pattern.phase)
      );
    }

    return curve;
  };

  const chartData = {
    labels: metrics[selectedMetric as keyof typeof metrics].map(d => 
      new Date(d.timestamp).toLocaleString()
    ),
    datasets: [
      {
        label: 'Actual Values',
        data: metrics[selectedMetric as keyof typeof metrics].map(d => d.value),
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4
      },
      ...seasonalPatterns.slice(0, 3).map((pattern, index) => ({
        label: `${pattern.period}-hour Pattern`,
        data: generateSeasonalCurve(pattern, metrics[selectedMetric as keyof typeof metrics].length),
        borderColor: `rgba(${255 - index * 50}, ${100 + index * 50}, ${50 + index * 50}, 1)`,
        backgroundColor: `rgba(${255 - index * 50}, ${100 + index * 50}, ${50 + index * 50}, 0.1)`,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      }))
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
    <div className="metric-seasonal-analysis">
      <div className="seasonal-header">
        <h2>Seasonal Pattern Analysis</h2>
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
          <div className="seasonal-controls">
            <div className="control-group">
              <label>Min Period (hours):</label>
              <input
                type="number"
                min="1"
                max="24"
                value={minPeriod}
                onChange={(e) => setMinPeriod(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Max Period (hours):</label>
              <input
                type="number"
                min="1"
                max="168"
                value={maxPeriod}
                onChange={(e) => setMaxPeriod(parseInt(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Strength Threshold:</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={strengthThreshold}
                onChange={(e) => setStrengthThreshold(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="seasonal-grid">
        <div className="seasonal-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="seasonal-patterns">
          <h3>Detected Patterns</h3>
          <div className="pattern-cards">
            {seasonalPatterns.map((pattern, index) => (
              <div
                key={index}
                className="pattern-card"
                style={{
                  borderColor: getMetricColor(selectedMetric)
                }}
              >
                <div className="pattern-period">
                  {pattern.period}-hour Cycle
                </div>
                <div className="pattern-details">
                  <div className="pattern-strength">
                    Strength: {(pattern.strength * 100).toFixed(1)}%
                  </div>
                  <div className="pattern-amplitude">
                    Amplitude: {pattern.amplitude.toFixed(2)}
                  </div>
                  <div className="pattern-phase">
                    Phase: {(pattern.phase * 180 / Math.PI).toFixed(1)}°
                  </div>
                </div>
                <div className="pattern-bar">
                  <div
                    className="pattern-bar-fill"
                    style={{
                      width: `${pattern.strength * 100}%`,
                      backgroundColor: getMetricColor(selectedMetric)
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

export default MetricSeasonalAnalysis; 