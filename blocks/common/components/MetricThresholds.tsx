import React, { useState } from 'react';
import './MetricThresholds.css';

interface Threshold {
  warning: number;
  critical: number;
  enabled: boolean;
}

interface MetricThresholdsProps {
  thresholds: {
    cpu: Threshold;
    memory: Threshold;
    network: Threshold;
    error: Threshold;
  };
  onThresholdChange: (metric: string, type: 'warning' | 'critical', value: number) => void;
  onThresholdToggle: (metric: string, enabled: boolean) => void;
}

const MetricThresholds: React.FC<MetricThresholdsProps> = ({
  thresholds,
  onThresholdChange,
  onThresholdToggle
}) => {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const getMetricUnit = (metric: string) => {
    switch (metric) {
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

  const handleThresholdChange = (
    metric: string,
    type: 'warning' | 'critical',
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onThresholdChange(metric, type, numValue);
    }
  };

  const toggleMetric = (metric: string) => {
    setExpandedMetric(expandedMetric === metric ? null : metric);
  };

  return (
    <div className="metric-thresholds">
      <div className="thresholds-header">
        <h3>Threshold Management</h3>
        <p className="thresholds-description">
          Configure warning and critical thresholds for system metrics
        </p>
      </div>

      <div className="thresholds-grid">
        {Object.entries(thresholds).map(([metric, threshold]) => (
          <div key={metric} className="threshold-card">
            <div 
              className="threshold-header"
              onClick={() => toggleMetric(metric)}
            >
              <div className="threshold-title">
                <h4>{getMetricName(metric)}</h4>
                <span className={`threshold-status ${threshold.enabled ? 'enabled' : 'disabled'}`}>
                  {threshold.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                className="threshold-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  onThresholdToggle(metric, !threshold.enabled);
                }}
              >
                {threshold.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {expandedMetric === metric && (
              <div className="threshold-settings">
                <div className="threshold-input-group">
                  <label>Warning Threshold</label>
                  <div className="threshold-input">
                    <input
                      type="number"
                      value={threshold.warning}
                      onChange={(e) => handleThresholdChange(metric, 'warning', e.target.value)}
                      disabled={!threshold.enabled}
                      min="0"
                      step="0.1"
                    />
                    <span className="threshold-unit">{getMetricUnit(metric)}</span>
                  </div>
                </div>

                <div className="threshold-input-group">
                  <label>Critical Threshold</label>
                  <div className="threshold-input">
                    <input
                      type="number"
                      value={threshold.critical}
                      onChange={(e) => handleThresholdChange(metric, 'critical', e.target.value)}
                      disabled={!threshold.enabled}
                      min="0"
                      step="0.1"
                    />
                    <span className="threshold-unit">{getMetricUnit(metric)}</span>
                  </div>
                </div>

                <div className="threshold-info">
                  <div className="threshold-range">
                    <span className="range-label">Normal:</span>
                    <span className="range-value">0 - {threshold.warning}{getMetricUnit(metric)}</span>
                  </div>
                  <div className="threshold-range warning">
                    <span className="range-label">Warning:</span>
                    <span className="range-value">{threshold.warning} - {threshold.critical}{getMetricUnit(metric)}</span>
                  </div>
                  <div className="threshold-range critical">
                    <span className="range-label">Critical:</span>
                    <span className="range-value">{threshold.critical}+{getMetricUnit(metric)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricThresholds; 