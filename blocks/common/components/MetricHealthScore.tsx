import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import './MetricHealthScore.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface MetricData {
  timestamp: string;
  value: number;
}

interface MetricHealthScoreProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
}

interface HealthScore {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  details: {
    cpu: number;
    memory: number;
    network: number;
    error: number;
  };
}

const MetricHealthScore: React.FC<MetricHealthScoreProps> = ({ metrics }) => {
  const calculateHealthScore = (): HealthScore => {
    const getLatestValue = (data: MetricData[]) => data[data.length - 1]?.value || 0;
    
    // Get latest values for each metric
    const cpuValue = getLatestValue(metrics.cpu);
    const memoryValue = getLatestValue(metrics.memory);
    const networkValue = getLatestValue(metrics.network);
    const errorValue = getLatestValue(metrics.error);

    // Calculate individual scores (0-100)
    const cpuScore = Math.max(0, 100 - cpuValue);
    const memoryScore = Math.max(0, 100 - memoryValue);
    const networkScore = Math.max(0, 100 - (networkValue / 10)); // Normalize network latency
    const errorScore = Math.max(0, 100 - (errorValue * 10)); // Normalize error rate

    // Calculate weighted average
    const weights = {
      cpu: 0.3,
      memory: 0.3,
      network: 0.2,
      error: 0.2
    };

    const totalScore = Math.round(
      cpuScore * weights.cpu +
      memoryScore * weights.memory +
      networkScore * weights.network +
      errorScore * weights.error
    );

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (totalScore < 50) {
      status = 'critical';
    } else if (totalScore < 75) {
      status = 'warning';
    }

    return {
      score: totalScore,
      status,
      details: {
        cpu: cpuScore,
        memory: memoryScore,
        network: networkScore,
        error: errorScore
      }
    };
  };

  const healthScore = useMemo(() => calculateHealthScore(), [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'critical':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const chartData = {
    labels: ['CPU', 'Memory', 'Network', 'Error Rate'],
    datasets: [
      {
        data: [
          healthScore.details.cpu,
          healthScore.details.memory,
          healthScore.details.network,
          healthScore.details.error
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="metric-health-score">
      <div className="health-header">
        <h2>System Health Score</h2>
        <div className="health-status" style={{ color: getStatusColor(healthScore.status) }}>
          {healthScore.status.toUpperCase()}
        </div>
      </div>

      <div className="health-content">
        <div className="health-chart">
          <div className="score-circle">
            <div className="score-value" style={{ color: getStatusColor(healthScore.status) }}>
              {healthScore.score}
            </div>
            <div className="score-label">Health Score</div>
          </div>
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        <div className="health-details">
          <div className="detail-card">
            <h3>Component Scores</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">CPU</span>
                <div className="detail-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${healthScore.details.cpu}%`,
                        backgroundColor: 'rgba(40, 167, 69, 0.8)'
                      }}
                    />
                  </div>
                  <span>{healthScore.details.cpu.toFixed(1)}%</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Memory</span>
                <div className="detail-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${healthScore.details.memory}%`,
                        backgroundColor: 'rgba(23, 162, 184, 0.8)'
                      }}
                    />
                  </div>
                  <span>{healthScore.details.memory.toFixed(1)}%</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Network</span>
                <div className="detail-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${healthScore.details.network}%`,
                        backgroundColor: 'rgba(255, 193, 7, 0.8)'
                      }}
                    />
                  </div>
                  <span>{healthScore.details.network.toFixed(1)}%</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Error Rate</span>
                <div className="detail-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${healthScore.details.error}%`,
                        backgroundColor: 'rgba(220, 53, 69, 0.8)'
                      }}
                    />
                  </div>
                  <span>{healthScore.details.error.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Health Status</h3>
            <div className="status-description">
              {healthScore.status === 'healthy' && (
                <p>System is operating within normal parameters. All components are functioning as expected.</p>
              )}
              {healthScore.status === 'warning' && (
                <p>System is showing signs of stress. Some components may require attention soon.</p>
              )}
              {healthScore.status === 'critical' && (
                <p>System is experiencing significant issues. Immediate attention is required.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricHealthScore; 
export default MetricHealthScore; 