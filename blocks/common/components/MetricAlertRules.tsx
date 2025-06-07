import React, { useState } from 'react';
import './MetricAlertRules.css';

interface AlertRule {
  id: string;
  metric: string;
  condition: 'above' | 'below' | 'equals';
  value: number;
  duration: number;
  severity: 'info' | 'warning' | 'critical';
  notification: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  enabled: boolean;
}

interface MetricAlertRulesProps {
  rules: AlertRule[];
  onRuleAdd: (rule: Omit<AlertRule, 'id'>) => void;
  onRuleUpdate: (rule: AlertRule) => void;
  onRuleDelete: (ruleId: string) => void;
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
}

const MetricAlertRules: React.FC<MetricAlertRulesProps> = ({
  rules,
  onRuleAdd,
  onRuleUpdate,
  onRuleDelete,
  onRuleToggle
}) => {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    metric: 'cpu',
    condition: 'above',
    value: 0,
    duration: 5,
    severity: 'warning',
    notification: {
      email: false,
      slack: false,
      webhook: false
    },
    enabled: true
  });

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

  const handleAddRule = () => {
    if (newRule.metric && newRule.condition && newRule.value !== undefined) {
      onRuleAdd({
        ...newRule as Omit<AlertRule, 'id'>,
        id: Date.now().toString()
      });
      setIsAddingRule(false);
      setNewRule({
        metric: 'cpu',
        condition: 'above',
        value: 0,
        duration: 5,
        severity: 'warning',
        notification: {
          email: false,
          slack: false,
          webhook: false
        },
        enabled: true
      });
    }
  };

  return (
    <div className="metric-alert-rules">
      <div className="alert-rules-header">
        <h3>Alert Rules</h3>
        <p className="alert-rules-description">
          Configure custom alert rules for system metrics
        </p>
      </div>

      <div className="alert-rules-actions">
        <button
          className="add-rule-button"
          onClick={() => setIsAddingRule(!isAddingRule)}
        >
          {isAddingRule ? 'Cancel' : 'Add Rule'}
        </button>
      </div>

      {isAddingRule && (
        <div className="new-rule-form">
          <div className="form-group">
            <label>Metric</label>
            <select
              value={newRule.metric}
              onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
            >
              <option value="cpu">CPU Usage</option>
              <option value="memory">Memory Usage</option>
              <option value="network">Network Latency</option>
              <option value="error">Error Rate</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as 'above' | 'below' | 'equals' })}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="equals">Equals</option>
            </select>
          </div>

          <div className="form-group">
            <label>Value</label>
            <div className="value-input">
              <input
                type="number"
                value={newRule.value}
                onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                min="0"
                step="0.1"
              />
              <span className="unit">{getMetricUnit(newRule.metric || 'cpu')}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={newRule.duration}
              onChange={(e) => setNewRule({ ...newRule, duration: parseInt(e.target.value) })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Severity</label>
            <select
              value={newRule.severity}
              onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as 'info' | 'warning' | 'critical' })}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notifications</label>
            <div className="notification-options">
              <label>
                <input
                  type="checkbox"
                  checked={newRule.notification?.email}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    notification: { ...newRule.notification!, email: e.target.checked }
                  })}
                />
                Email
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newRule.notification?.slack}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    notification: { ...newRule.notification!, slack: e.target.checked }
                  })}
                />
                Slack
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newRule.notification?.webhook}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    notification: { ...newRule.notification!, webhook: e.target.checked }
                  })}
                />
                Webhook
              </label>
            </div>
          </div>

          <button className="save-rule-button" onClick={handleAddRule}>
            Save Rule
          </button>
        </div>
      )}

      <div className="alert-rules-list">
        {rules.map((rule) => (
          <div key={rule.id} className="alert-rule-card">
            <div className="rule-header">
              <div className="rule-title">
                <h4>{getMetricName(rule.metric)}</h4>
                <span className={`rule-severity ${rule.severity}`}>
                  {rule.severity}
                </span>
              </div>
              <div className="rule-actions">
                <button
                  className={`toggle-rule ${rule.enabled ? 'enabled' : 'disabled'}`}
                  onClick={() => onRuleToggle(rule.id, !rule.enabled)}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  className="delete-rule"
                  onClick={() => onRuleDelete(rule.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="rule-details">
              <div className="rule-condition">
                Alert when {rule.metric} is {rule.condition} {rule.value}{getMetricUnit(rule.metric)} for {rule.duration} minutes
              </div>
              <div className="rule-notifications">
                <span>Notifications:</span>
                {rule.notification.email && <span className="notification-tag">Email</span>}
                {rule.notification.slack && <span className="notification-tag">Slack</span>}
                {rule.notification.webhook && <span className="notification-tag">Webhook</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricAlertRules; 