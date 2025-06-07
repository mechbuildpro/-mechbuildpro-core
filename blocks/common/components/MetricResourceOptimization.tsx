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
import './MetricResourceOptimization.css';

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

interface ResourcePattern {
  type: 'peak' | 'valley' | 'trend' | 'spike';
  startTime: string;
  endTime: string;
  value: number;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

interface MetricResourceOptimizationProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricResourceOptimization: React.FC<MetricResourceOptimizationProps> = ({ metrics }) => {
  const analyzeResourcePatterns = (): ResourcePattern[] => {
    const patterns: ResourcePattern[] = [];
    const windowSize = 5; // Number of points to analyze for patterns

    const detectPatterns = (data: MetricData[], metricType: string) => {
      for (let i = windowSize; i < data.length; i++) {
        const window = data.slice(i - windowSize, i);
        const values = window.map(d => d.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const trend = values[values.length - 1] - values[0];

        // Detect peaks
        if (max > avg * 1.5) {
          patterns.push({
            type: 'peak',
            startTime: window[window.length - 1].timestamp,
            endTime: window[window.length - 1].timestamp,
            value: max,
            impact: max > avg * 2 ? 'high' : 'medium',
            suggestion: `Consider load balancing or scaling for ${metricType} during peak usage`
          });
        }

        // Detect valleys
        if (min < avg * 0.5) {
          patterns.push({
            type: 'valley',
            startTime: window[window.length - 1].timestamp,
            endTime: window[window.length - 1].timestamp,
            value: min,
            impact: min < avg * 0.3 ? 'high' : 'medium',
            suggestion: `Opportunity to optimize resource allocation for ${metricType} during low usage`
          });
        }

        // Detect trends
        if (Math.abs(trend) > avg * 0.3) {
          patterns.push({
            type: 'trend',
            startTime: window[0].timestamp,
            endTime: window[window.length - 1].timestamp,
            value: trend,
            impact: Math.abs(trend) > avg * 0.5 ? 'high' : 'medium',
            suggestion: `Monitor ${metricType} trend and plan capacity accordingly`
          });
        }

        // Detect spikes
        if (values[values.length - 1] > max * 1.2) {
          patterns.push({
            type: 'spike',
            startTime: window[window.length - 1].timestamp,
            endTime: window[window.length - 1].timestamp,
            value: values[values.length - 1],
            impact: values[values.length - 1] > max * 1.5 ? 'high' : 'medium',
            suggestion: `Investigate sudden ${metricType} spike and implement safeguards`
          });
        }
      }
    };

    detectPatterns(metrics.cpu, 'CPU');
    detectPatterns(metrics.memory, 'Memory');
    detectPatterns(metrics.network, 'Network');
    detectPatterns(metrics.error, 'Error Rate');

    return patterns.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  };

  const resourcePatterns = useMemo(() => analyzeResourcePatterns(), [metrics]);

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'peak':
        return '#dc3545';
      case 'valley':
        return '#28a745';
      case 'trend':
        return '#ffc107';
      case 'spike':
        return '#dc3545';
      default:
        return '#6c757d';
    }
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
        data: metrics.network.map(d => d.value / 10), // Normalize for better visualization
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
    <div className="metric-resource-optimization">
      <div className="optimization-header">
        <h2>Resource Optimization</h2>
        <div className="optimization-summary">
          {resourcePatterns.filter(p => p.impact === 'high').length} Critical Patterns
        </div>
      </div>

      <div className="optimization-content">
        <div className="optimization-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="optimization-patterns">
          <h3>Resource Patterns</h3>
          <div className="pattern-list">
            {resourcePatterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <div className="pattern-header">
                  <div 
                    className="pattern-type"
                    style={{ backgroundColor: getPatternColor(pattern.type) }}
                  >
                    {pattern.type.toUpperCase()}
                  </div>
                  <div 
                    className="pattern-impact"
                    style={{ 
                      backgroundColor: pattern.impact === 'high' 
                        ? 'rgba(220, 53, 69, 0.1)' 
                        : pattern.impact === 'medium'
                        ? 'rgba(255, 193, 7, 0.1)'
                        : 'rgba(40, 167, 69, 0.1)'
                    }}
                  >
                    {pattern.impact.toUpperCase()}
                  </div>
                </div>

                <div className="pattern-details">
                  <div className="pattern-time">
                    {new Date(pattern.startTime).toLocaleString()}
                    {pattern.startTime !== pattern.endTime && (
                      <> - {new Date(pattern.endTime).toLocaleString()}</>
                    )}
                  </div>
                  <div className="pattern-value">
                    Value: {pattern.value.toFixed(1)}
                  </div>
                  <div className="pattern-suggestion">
                    {pattern.suggestion}
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

export default MetricResourceOptimization; 