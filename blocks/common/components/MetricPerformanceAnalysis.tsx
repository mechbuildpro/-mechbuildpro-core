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
import './MetricPerformanceAnalysis.css';

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

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface MetricPerformanceAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

const MetricPerformanceAnalysis: React.FC<MetricPerformanceAnalysisProps> = ({ metrics }) => {
  const analyzePerformance = (): PerformanceMetric[] => {
    const getLatestValue = (data: MetricData[]) => data[data.length - 1]?.value || 0;
    const getAverageValue = (data: MetricData[]) => {
      const values = data.map(d => d.value);
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    const cpuValue = getLatestValue(metrics.cpu);
    const memoryValue = getLatestValue(metrics.memory);
    const networkValue = getLatestValue(metrics.network);
    const errorValue = getLatestValue(metrics.error);

    const cpuAvg = getAverageValue(metrics.cpu);
    const memoryAvg = getAverageValue(metrics.memory);
    const networkAvg = getAverageValue(metrics.network);
    const errorAvg = getAverageValue(metrics.error);

    return [
      {
        name: 'CPU Usage',
        value: cpuValue,
        threshold: 80,
        impact: cpuValue > 90 ? 'high' : cpuValue > 80 ? 'medium' : 'low',
        recommendation: cpuValue > 90 
          ? 'Consider scaling up CPU resources or optimizing CPU-intensive operations'
          : cpuValue > 80
          ? 'Monitor CPU usage and prepare for potential scaling'
          : 'CPU usage is within acceptable range'
      },
      {
        name: 'Memory Usage',
        value: memoryValue,
        threshold: 85,
        impact: memoryValue > 95 ? 'high' : memoryValue > 85 ? 'medium' : 'low',
        recommendation: memoryValue > 95
          ? 'Immediate memory upgrade or memory leak investigation required'
          : memoryValue > 85
          ? 'Consider increasing memory allocation'
          : 'Memory usage is within acceptable range'
      },
      {
        name: 'Network Latency',
        value: networkValue,
        threshold: 200,
        impact: networkValue > 500 ? 'high' : networkValue > 200 ? 'medium' : 'low',
        recommendation: networkValue > 500
          ? 'Investigate network bottlenecks and optimize data transfer'
          : networkValue > 200
          ? 'Monitor network performance and consider optimization'
          : 'Network performance is within acceptable range'
      },
      {
        name: 'Error Rate',
        value: errorValue,
        threshold: 5,
        impact: errorValue > 10 ? 'high' : errorValue > 5 ? 'medium' : 'low',
        recommendation: errorValue > 10
          ? 'Critical error rate detected. Immediate investigation required'
          : errorValue > 5
          ? 'Monitor error patterns and investigate root causes'
          : 'Error rate is within acceptable range'
      }
    ];
  };

  const performanceMetrics = useMemo(() => analyzePerformance(), [metrics]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
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
        label: 'Network Latency',
        data: metrics.network.map(d => d.value / 10), // Normalize for better visualization
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Error Rate',
        data: metrics.error.map(d => d.value * 10), // Normalize for better visualization
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
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
    <div className="metric-performance-analysis">
      <div className="performance-header">
        <h2>Performance Analysis</h2>
        <div className="performance-summary">
          {performanceMetrics.filter(m => m.impact === 'high').length} Critical Issues
        </div>
      </div>

      <div className="performance-content">
        <div className="performance-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="performance-metrics">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-header">
                <h3>{metric.name}</h3>
                <div 
                  className="impact-badge"
                  style={{ backgroundColor: getImpactColor(metric.impact) }}
                >
                  {metric.impact.toUpperCase()}
                </div>
              </div>
              
              <div className="metric-details">
                <div className="metric-value">
                  <span className="value">{metric.value.toFixed(1)}</span>
                  <span className="threshold">/ {metric.threshold}</span>
                </div>
                
                <div className="metric-recommendation">
                  {metric.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricPerformanceAnalysis; 