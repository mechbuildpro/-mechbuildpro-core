import React from 'react';
import './MetricPresets.css';

interface Threshold {
  warning: number;
  critical: number;
  enabled: boolean;
}

interface MetricPresetsProps {
  onPresetSelect: (preset: Record<string, Threshold>) => void;
}

const MetricPresets: React.FC<MetricPresetsProps> = ({ onPresetSelect }) => {
  const presets = {
    'high-performance': {
      name: 'High Performance',
      description: 'Optimized for high-performance computing with strict thresholds',
      thresholds: {
        cpu: { warning: 70, critical: 85, enabled: true },
        memory: { warning: 75, critical: 90, enabled: true },
        network: { warning: 200, critical: 500, enabled: true },
        error: { warning: 1, critical: 3, enabled: true }
      }
    },
    'balanced': {
      name: 'Balanced',
      description: 'Balanced monitoring for general-purpose systems',
      thresholds: {
        cpu: { warning: 60, critical: 80, enabled: true },
        memory: { warning: 70, critical: 85, enabled: true },
        network: { warning: 500, critical: 1000, enabled: true },
        error: { warning: 2, critical: 5, enabled: true }
      }
    },
    'resource-efficient': {
      name: 'Resource Efficient',
      description: 'Optimized for resource-constrained environments',
      thresholds: {
        cpu: { warning: 50, critical: 70, enabled: true },
        memory: { warning: 60, critical: 80, enabled: true },
        network: { warning: 800, critical: 1500, enabled: true },
        error: { warning: 3, critical: 7, enabled: true }
      }
    },
    'development': {
      name: 'Development',
      description: 'Suitable for development environments with relaxed thresholds',
      thresholds: {
        cpu: { warning: 80, critical: 90, enabled: true },
        memory: { warning: 80, critical: 90, enabled: true },
        network: { warning: 1000, critical: 2000, enabled: true },
        error: { warning: 5, critical: 10, enabled: true }
      }
    }
  };

  const handlePresetSelect = (presetKey: keyof typeof presets) => {
    onPresetSelect(presets[presetKey].thresholds);
  };

  return (
    <div className="metric-presets">
      <h3>Threshold Presets</h3>
      <div className="presets-grid">
        {Object.entries(presets).map(([key, preset]) => (
          <div key={key} className="preset-card" onClick={() => handlePresetSelect(key as keyof typeof presets)}>
            <div className="preset-header">
              <h4>{preset.name}</h4>
              <button className="apply-button">Apply</button>
            </div>
            <p className="preset-description">{preset.description}</p>
            <div className="preset-thresholds">
              <div className="threshold-row">
                <span>CPU:</span>
                <span className="threshold-value">
                  {preset.thresholds.cpu.warning}% / {preset.thresholds.cpu.critical}%
                </span>
              </div>
              <div className="threshold-row">
                <span>Memory:</span>
                <span className="threshold-value">
                  {preset.thresholds.memory.warning}% / {preset.thresholds.memory.critical}%
                </span>
              </div>
              <div className="threshold-row">
                <span>Network:</span>
                <span className="threshold-value">
                  {preset.thresholds.network.warning}ms / {preset.thresholds.network.critical}ms
                </span>
              </div>
              <div className="threshold-row">
                <span>Error Rate:</span>
                <span className="threshold-value">
                  {preset.thresholds.error.warning} / {preset.thresholds.error.critical}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricPresets; 