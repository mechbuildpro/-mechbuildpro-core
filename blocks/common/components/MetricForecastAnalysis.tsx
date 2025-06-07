import React, { useMemo, useState, useEffect } from 'react';
import {
  // Chart as ChartJS,
  // CategoryScale,
  // LinearScale,
  // PointElement,
  // LineElement,
  // Title,
  // Tooltip as ChartJSTooltip,
  // Legend as ChartJSLegend,
  // Filler,
  // ScatterController,
  // ChartData,
  // ChartOptions,
  // ChartDataset,
  // TooltipItem,
  // ChartType
} from 'chart.js/auto';
// import { Line } from 'react-chartjs-2';
import { LineChart, ScatterChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Brush } from 'recharts';
import './MetricForecastAnalysis.css';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   ChartJSTooltip,
//   ChartJSLegend,
//   Filler,
//   ScatterController
// );

interface MetricData {
  timestamp: string;
  value: number;
}

interface Forecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: 'short' | 'medium' | 'long';
  description: string;
  threshold: number;
  risk: 'high' | 'medium' | 'low';
  confidenceInterval?: number;
  anomalies?: { timestamp: string; value: number; severity: 'high' | 'medium' | 'low' }[];
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface AggregatedData {
  min: number;
  max: number;
  avg: number;
  stdDev: number;
  trend: number;
}

interface MetricForecastAnalysisProps {
  metrics: {
    cpu: MetricData[];
    memory: MetricData[];
    network: MetricData[];
    error: MetricData[];
  };
  onRefresh?: () => Promise<void>;
}

interface ExportFormat {
  type: 'json' | 'csv' | 'excel';
  label: string;
  icon: string;
}

const MetricForecastAnalysis: React.FC<MetricForecastAnalysisProps> = ({ metrics, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'confidence' | 'metric'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  });
  const [aggregationPeriod, setAggregationPeriod] = useState<'hour' | 'day' | 'week'>('hour');
  const [viewMode, setViewMode] = useState<'line' | 'scatter'>('line');
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [visibleMetrics, setVisibleMetrics] = useState<Record<keyof MetricForecastAnalysisProps['metrics'], boolean>>({
    cpu: true,
    memory: true,
    network: true,
    error: true,
  });

  // Add useEffect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Placeholder API endpoint - replace with actual endpoint
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics data');
        }
        const data = await response.json();
        // Update metrics state with fetched data
        // Assuming the API returns data in the expected format
        // metrics = data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh forecasts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMetricVisibility = (metricKey: keyof MetricForecastAnalysisProps['metrics']) => {
    setVisibleMetrics(prev => ({ ...prev, [metricKey]: !prev[metricKey] }));
  };

  const calculateForecast = (data: MetricData[], metricName: keyof MetricForecastAnalysisProps['metrics']): Forecast => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
    
    // Calculate linear regression
    const n = values.length;
    if (n === 0) {
      // Return a default or error forecast if no data
       return {
        metric: metricName,
        currentValue: 0,
        predictedValue: 0,
        confidence: 'low',
        timeframe: 'long',
        description: 'No data available',
        threshold: 0,
        risk: 'low',
        confidenceInterval: 0,
        anomalies: []
      };
    }
    const sumX = timestamps.reduce((a: number, b: number) => a + b, 0);
    const sumY = values.reduce((a: number, b: number) => a + b, 0);
    const sumXY = timestamps.reduce((a: number, b: number, i: number) => a + b * values[i], 0);
    const sumXX = timestamps.reduce((a: number, b: number) => a + b * b, 0);
    
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
     const ssTotal = values.reduce((a: number, b: number) => a + Math.pow(b - meanY, 2), 0);
    const ssResidual = values.reduce((a: number, b: number, i: number) => {
      const predicted = slope * timestamps[i] + intercept;
      return a + Math.pow(b - predicted, 2);
    }, 0);
    const rSquared = ssTotal === 0 ? 1 : 1 - (ssResidual / ssTotal);
    
    // Predict future value (24 hours ahead)
    const lastTimestamp = timestamps[timestamps.length - 1];
    const futureTimestamp = lastTimestamp + (24 * 60 * 60 * 1000);
    const linearPredictedValue = slope * futureTimestamp + intercept;
    const currentValue = values[values.length - 1];
    
    // Calculate confidence intervals
    const stdDev = n <= 2 ? 0 : Math.sqrt(ssResidual / (n - 2));
    const confidenceInterval = 1.96 * stdDev; // 95% confidence interval (approx)

    // Determine confidence level
    const confidence = rSquared > 0.8 ? 'high' :
                      rSquared > 0.5 ? 'medium' : 'low';
    
    // Determine timeframe based on rate of change
    const rateOfChange = currentValue === 0 ? 0 : Math.abs((linearPredictedValue - currentValue) / currentValue);
    const timeframe = rateOfChange > 0.5 ? 'short' :
                     rateOfChange > 0.2 ? 'medium' : 'long';
    
    // Set thresholds based on metric type
    const threshold = metricName === 'cpu' ? 80 :
                     metricName === 'memory' ? 85 :
                     metricName === 'network' ? 90 : 5; // Default for error or other
    
    // Calculate risk level
    const risk = linearPredictedValue > threshold ? 'high' :
                linearPredictedValue > threshold * 0.8 ? 'medium' : 'low';
    
    let description = '';
    if (linearPredictedValue > threshold) {
      description = `High risk of exceeding ${threshold}% threshold within ${timeframe} term`;
    } else if (linearPredictedValue > threshold * 0.8) {
      description = `Approaching ${threshold}% threshold within ${timeframe} term`;
    } else {
      description = `Stable below threshold within ${timeframe} term`;
    }

    // Detect anomalies (using a simplified version for this base forecast)
    const anomalies = detectAnomalies(data);
     if (anomalies.length > 0) {
      const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
      const mediumSeverityAnomalies = anomalies.filter(a => a.severity === 'medium').length;
      
      if (highSeverityAnomalies > 0) {
        description = `High severity anomalies detected. ` + description;
      } else if (mediumSeverityAnomalies > 0) {
        description = `Medium severity anomalies detected. ` + description;
      } else {
        description = `Low severity anomalies detected. ` + description;
      }
    }

    return {
      metric: metricName,
      currentValue,
      predictedValue: linearPredictedValue,
      confidence,
      timeframe,
      description,
      threshold,
      risk,
      confidenceInterval,
      anomalies
    };
  };

  const forecasts = useMemo(() => 
    Object.entries(metrics).map(([metric, data]) => 
      calculateForecast(data, metric as keyof MetricForecastAnalysisProps['metrics'])
    ),
    [metrics]
  );

  const getRiskColor = (forecast: Forecast) => {
    const baseColor = forecast.risk === 'high' ? '#dc3545' :
                     forecast.risk === 'medium' ? '#ffc107' : '#28a745';
    const opacity = forecast.confidence === 'high' ? '1' :
                   forecast.confidence === 'medium' ? '0.8' : '0.6';
    return `${baseColor}${opacity}`;
  };

  // Add exponential smoothing forecast
  const calculateExponentialSmoothing = (data: number[], alpha: number = 0.3): number => {
    if (data.length === 0) return 0;
    let smoothed = data[0];
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }
    return smoothed;
  };

  // Add seasonality detection
  const detectSeasonality = (data: number[], period: number = 24): boolean => {
    if (data.length < period * 2) return false; // Need at least two periods to detect seasonality
    
    const autocorrelation = (lag: number): number => {
      const mean = data.reduce((a: number, b: number) => a + b, 0) / data.length;
       if (mean === 0) return 0; // Avoid division by zero
      const variance = data.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / data.length;
      if (variance === 0) return 0; // Avoid division by zero
      
      let numerator = 0;
      for (let i = 0; i < data.length - lag; i++) {
        numerator += (data[i] - mean) * (data[i + lag] - mean);
      }
      
      return numerator / ((data.length - lag) * variance);
    };

    // Check for seasonality at the given period
    const correlation = autocorrelation(period);
    return Math.abs(correlation) > 0.5; // Threshold for significant seasonality
  };

  // Add ARIMA forecasting (simplified)
  const calculateARIMA = (data: number[], p: number = 1, d: number = 1, q: number = 1): number => {
    const n = data.length;
    if (n < Math.max(p, d, q) + 1) return data[n - 1] || 0; // Return last value or 0 if not enough data

    // Difference the series
    let diffed = [...data];
    for (let k = 0; k < d; k++) {
      const newDiffed: number[] = [];
      for (let i = 1; i < diffed.length; i++) {
        newDiffed.push(diffed[i] - diffed[i - 1]);
      }
      diffed = newDiffed;
    }

    if (diffed.length === 0) return data[n-1] || 0;

    // Simple AR and MA model (this is a very basic approximation)
    let prediction = 0;
    for (let i = 0; i < p && diffed.length - 1 - i >= 0; i++) {
        // Use a simple coefficient (e.g., 0.5) - In a real ARIMA, these are estimated
        prediction += 0.5 * diffed[diffed.length - 1 - i];
    }

     for (let i = 0; i < q && diffed.length - 1 - i >= 0; i++) {
        // Use a simple coefficient (e.g., 0.5) - In a real ARIMA, these are estimated from residuals
        // This part is highly simplified and doesn't calculate residuals correctly
        prediction += 0.5 * diffed[diffed.length - 1 - i]; // Placeholder
    }

    // Integrate (add back the differencing)
    let finalPrediction = prediction;
    for (let k = 0; k < d; k++) {
        finalPrediction += data[n - 1 - k] || 0;
    }
    
    return finalPrediction;
  };

  // Add anomaly detection
  const detectAnomalies = (data: MetricData[], threshold: number = 2): { timestamp: string; value: number; severity: 'high' | 'medium' | 'low' }[] => {
    const values = data.map(d => d.value);
    if (values.length < 2) return [];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    if (stdDev === 0) return []; // Avoid division by zero if all values are the same

    return data
      .map(point => {
        const zScore = Math.abs(point.value - mean) / stdDev;
        if (zScore > threshold) {
          return {
            timestamp: point.timestamp,
            value: point.value,
            severity: zScore > threshold * 1.5 ? 'high' : zScore > threshold * 1.2 ? 'medium' : 'low'
          };
        }
        return null;
      })
      .filter((anomaly): anomaly is { timestamp: string; value: number; severity: 'high' | 'medium' | 'low' } => anomaly !== null);
  };

  // Add Prophet-like forecasting
  const calculateProphetForecast = (data: MetricData[]): { trend: number; seasonal: number; forecast: number } => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
     if (values.length < 2) return { trend: 0, seasonal: 0, forecast: values[0] || 0 };
    
    // Calculate trend using piecewise linear regression (simplified)
    const segments = Math.max(1, Math.floor(values.length / 50)); // Number of trend segments, at least 1
    const segmentSize = Math.floor(values.length / segments);
    const trends: number[] = [];
    
    for (let i = 0; i < segments; i++) {
      const start = i * segmentSize;
      const end = Math.min((i + 1) * segmentSize, values.length);
      const segmentValues = values.slice(start, end);
      const segmentTimestamps = timestamps.slice(start, end);
       if (segmentValues.length < 2) {
          trends.push(0);
          continue;
      }
      
      const n = segmentValues.length;
      const sumX = segmentTimestamps.reduce((a, b) => a + b, 0);
      const sumY = segmentValues.reduce((a, b) => a + b, 0);
      const sumXY = segmentTimestamps.reduce((a, b, i) => a + b * segmentValues[i], 0);
      const sumXX = segmentTimestamps.reduce((a, b) => a + b * b, 0);
      
      const denominator = n * sumXX - sumX * sumX;
       const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
      trends.push(slope);
    }
    
    // Calculate seasonal components (simplified - assuming daily seasonality 24)
    const seasonalPeriod = 24; 
     const seasonalComponents: number[] = new Array(seasonalPeriod).fill(0);
     const seasonalCounts: number[] = new Array(seasonalPeriod).fill(0);

    values.forEach((value, index) => {
        const seasonalIndex = index % seasonalPeriod;
        seasonalComponents[seasonalIndex] += value;
        seasonalCounts[seasonalIndex]++;
    });

    const seasonalAverages = seasonalComponents.map((sum, index) => 
        seasonalCounts[index] === 0 ? 0 : sum / seasonalCounts[index]
    );

    const overallMean = values.reduce((a, b) => a + b, 0) / values.length;
    const normalizedSeasonal = seasonalAverages.map(avg => avg - overallMean);
    
    // Calculate final forecast (very simplified)
    const lastTimestamp = timestamps[timestamps.length - 1];
    const futureTimestamp = lastTimestamp + (24 * 60 * 60 * 1000); // 24 hours ahead
    
    // Estimate trend at future timestamp based on last segment trend
    const lastTrend = trends[trends.length - 1] || 0;
    const timeDiff = futureTimestamp - timestamps[timestamps.length - 1];
    const trendForecast = lastTrend * timeDiff;

    // Estimate seasonal component at future timestamp
     const futureIndex = values.length + 24; // Assuming 24 steps ahead corresponds to 24 hours
    const futureSeasonalIndex = futureIndex % seasonalPeriod;
    const seasonalForecast = normalizedSeasonal[futureSeasonalIndex] || 0;

    const forecast = (values[values.length - 1] || 0) + trendForecast + seasonalForecast;
    
    return { trend: lastTrend, seasonal: seasonalForecast, forecast };
  };

  // Enhanced forecast calculation with Prophet-like forecasting
  const calculateEnhancedForecast = (data: MetricData[], metricName: keyof MetricForecastAnalysisProps['metrics']): Forecast => {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
     if (values.length === 0) {
       return {
        metric: metricName,
        currentValue: 0,
        predictedValue: 0,
        confidence: 'low',
        timeframe: 'long',
        description: 'No data available',
        threshold: 0,
        risk: 'low',
        confidenceInterval: 0,
        anomalies: []
      };
    }
    
    // Calculate linear regression
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((a, b, i) => a + b * values[i], 0);
    const sumXX = timestamps.reduce((a, b) => a + b * b, 0);
    
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
     const ssTotal = values.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
    const ssResidual = values.reduce((a, b, i) => {
      const predicted = slope * timestamps[i] + intercept;
      return a + Math.pow(b - predicted, 2);
    }, 0);
    const rSquared = ssTotal === 0 ? 1 : 1 - (ssResidual / ssTotal);
    
    // Calculate exponential smoothing forecast
    const smoothedForecast = calculateExponentialSmoothing(values);
    
    // Calculate ARIMA forecast
    const arimaForecast = calculateARIMA(values);
    
    // Calculate Prophet-like forecast
    const prophetForecast = calculateProphetForecast(data);
    
    // Detect seasonality
    const hasSeasonality = detectSeasonality(values);
    
    // Predict future value (24 hours ahead)
    const lastTimestamp = timestamps[timestamps.length - 1];
    const futureTimestamp = lastTimestamp + (24 * 60 * 60 * 1000);
    const linearPredictedValue = slope * futureTimestamp + intercept;
    
    // Combine all forecasts with weighted average
    const predictedValue = hasSeasonality ? 
      (linearPredictedValue * 0.2 + smoothedForecast * 0.2 + arimaForecast * 0.3 + prophetForecast.forecast * 0.3) : 
      (linearPredictedValue * 0.3 + smoothedForecast * 0.3 + arimaForecast * 0.2 + prophetForecast.forecast * 0.2);
    
    const currentValue = values[values.length - 1];
    
    // Calculate confidence intervals
    const stdDev = n <= 2 ? 0 : Math.sqrt(ssResidual / (n - 2));
    const confidenceInterval = 1.96 * stdDev; // 95% confidence interval (approx)
    
    // Determine confidence level with seasonality and multiple forecasting methods
    const confidence = hasSeasonality ? 
      (rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low') :
      (rSquared > 0.8 ? 'high' : rSquared > 0.5 ? 'medium' : 'low');
    
    // Determine timeframe based on rate of change and seasonality
    const rateOfChange = currentValue === 0 ? 0 : Math.abs((predictedValue - currentValue) / currentValue);
    const timeframe = hasSeasonality ?
      (rateOfChange > 0.4 ? 'short' : rateOfChange > 0.15 ? 'medium' : 'long') :
      (rateOfChange > 0.5 ? 'short' : rateOfChange > 0.2 ? 'medium' : 'long');
    
    // Set thresholds based on metric type
    const threshold = metricName === 'cpu' ? 80 :
                     metricName === 'memory' ? 85 :
                     metricName === 'network' ? 90 : 5; // Default for error
    
    // Calculate risk level with seasonality and confidence interval consideration
    const risk = hasSeasonality ?
      (predictedValue + (confidenceInterval || 0) > threshold * 0.9 ? 'high' :
       predictedValue + (confidenceInterval || 0) > threshold * 0.7 ? 'medium' : 'low') :
      (predictedValue + (confidenceInterval || 0) > threshold ? 'high' :
       predictedValue + (confidenceInterval || 0) > threshold * 0.8 ? 'medium' : 'low');
    
    let description = '';
    if (hasSeasonality) {
      description = `Seasonal pattern detected. `;
    }
    if (predictedValue + (confidenceInterval || 0) > threshold) {
      description += `High risk of exceeding ${threshold}% threshold within ${timeframe} term (95% confidence)`;
    } else if (predictedValue + (confidenceInterval || 0) > threshold * 0.8) {
      description += `Approaching ${threshold}% threshold within ${timeframe} term (95% confidence)`;
    } else {
      description += `Stable below threshold within ${timeframe} term (95% confidence)`;
    }
    
    // Detect anomalies
    const anomalies = detectAnomalies(data);
    
    // Update description with anomaly information
    if (anomalies.length > 0) {
      const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
      const mediumSeverityAnomalies = anomalies.filter(a => a.severity === 'medium').length;
      
      if (highSeverityAnomalies > 0) {
        description = `High severity anomalies detected. ` + description;
      } else if (mediumSeverityAnomalies > 0) {
        description = `Medium severity anomalies detected. ` + description;
      } else {
        description = `Low severity anomalies detected. ` + description;
      }
    }
    
    return {
      metric: metricName,
      currentValue,
      predictedValue,
      confidence,
      timeframe,
      description,
      threshold,
      risk,
      confidenceInterval,
      anomalies
    };
  };

  const enhancedForecasts = useMemo(() => 
    (Object.keys(metrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).map(metricKey => 
      calculateEnhancedForecast(metrics[metricKey as keyof MetricForecastAnalysisProps['metrics']], metricKey as keyof MetricForecastAnalysisProps['metrics'])
    ),
    [metrics] // Depend on metrics prop
  );

  const aggregateData = (data: MetricData[], period: 'hour' | 'day' | 'week'): MetricData[] => {
    const groupedData = new Map<string, number[]>();
    
    data.forEach(point => {
      const date = new Date(point.timestamp);
      let key: string;
      
      switch (period) {
        case 'hour':
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'day':
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10); // Simplified week start
          break;
      }
      
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)?.push(point.value);
    });
    
    return Array.from(groupedData.entries()).map(([timestamp, values]: [string, number[]]) => ({
      timestamp,
      value: values.reduce((a, b) => a + b, 0) / values.length
    }));
  };

  const calculateAggregatedStats = (data: MetricData[]): AggregatedData => {
    const values = data.map(d => d.value);
     if (values.length === 0) return { min: 0, max: 0, avg: 0, stdDev: 0, trend: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length
    );
    
    // Calculate trend (simple linear regression slope)
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = avg;
     const denominator = values.reduce((sum, _, x) => 
      sum + Math.pow(x - xMean, 2), 0
    );
    const slope = denominator === 0 ? 0 : values.reduce((sum, y, x) => 
      sum + (x - xMean) * (y - yMean), 0
    ) / denominator;
    
    return { min, max, avg, stdDev, trend: slope };
  };

  const filteredMetrics = useMemo(() => {
    const filtered: MetricForecastAnalysisProps['metrics'] = { // Use typeof metrics for type safety
      cpu: [],
      memory: [],
      network: [],
      error: []
    };
    
    (Object.keys(metrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
      filtered[metricKey as keyof MetricForecastAnalysisProps['metrics']] = metrics[metricKey as keyof MetricForecastAnalysisProps['metrics']].filter((point: MetricData) => {
        const timestamp = new Date(point.timestamp);
        return timestamp >= timeRange.start && timestamp <= timeRange.end;
      });
    });
    
    return filtered;
  }, [metrics, timeRange]);

  const aggregatedMetrics = useMemo(() => {
    const aggregated: MetricForecastAnalysisProps['metrics'] = { // Use typeof metrics for type safety
      cpu: [],
      memory: [],
      network: [],
      error: []
    };
    
    (Object.keys(filteredMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
      // Only aggregate data for visible metrics
      if (visibleMetrics[metricKey]) {
        aggregated[metricKey as keyof MetricForecastAnalysisProps['metrics']] = aggregateData(filteredMetrics[metricKey as keyof MetricForecastAnalysisProps['metrics']], aggregationPeriod);
      }
    });
    
    return aggregated;
  }, [filteredMetrics, aggregationPeriod, visibleMetrics]); // Add visibleMetrics dependency

  const stats = useMemo(() => {
    const stats: Record<keyof MetricForecastAnalysisProps['metrics'], AggregatedData> = {} as Record<keyof MetricForecastAnalysisProps['metrics'], AggregatedData>; // Type assertion for initial empty object
    
    (Object.keys(aggregatedMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
      stats[metricKey as keyof MetricForecastAnalysisProps['metrics']] = calculateAggregatedStats(aggregatedMetrics[metricKey as keyof MetricForecastAnalysisProps['metrics']]);
    });
    
    return stats;
  }, [aggregatedMetrics]);

  const filteredAndSortedForecasts = useMemo(() => {
    let filtered = enhancedForecasts;
    
    // Apply risk filter
    if (filterRisk !== 'all') {
      filtered = filtered.filter(f => f.risk === filterRisk);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return (riskOrder[a.risk] - riskOrder[b.risk]) * order;
        case 'confidence':
          const confOrder = { high: 3, medium: 2, low: 1 };
          return (confOrder[a.confidence] - confOrder[b.confidence]) * order;
        case 'metric':
          return a.metric.localeCompare(b.metric) * order;
        default:
          return 0;
      }
    });
  }, [enhancedForecasts, filterRisk, sortBy, sortOrder]);

  const exportFormats: ExportFormat[] = [
    { type: 'json', label: 'JSON', icon: '📄' },
    { type: 'csv', label: 'CSV', icon: '📊' },
    { type: 'excel', label: 'Excel', icon: '📈' }
  ];

  const exportData = (format: ExportFormat['type']) => {
    const data = enhancedForecasts.map(forecast => ({
      metric: forecast.metric,
      currentValue: forecast.currentValue,
      predictedValue: forecast.predictedValue,
      confidence: forecast.confidence,
      timeframe: forecast.timeframe,
      description: forecast.description,
      threshold: forecast.threshold,
      risk: forecast.risk,
      confidenceInterval: forecast.confidenceInterval,
      anomalies: forecast.anomalies?.map(anomaly => ({
        timestamp: anomaly.timestamp,
        value: anomaly.value,
        severity: anomaly.severity
      }))
    }));

    let blob: Blob;
    let filename: string;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');

    switch (format) {
      case 'csv':
        const headers = ['Metric', 'Current Value', 'Predicted Value', 'Confidence', 'Timeframe', 'Risk', 'Description'];
        const csvContent = [
          headers.join(','),
          ...data.map(row => [
            row.metric,
            row.currentValue,
            row.predictedValue,
            row.confidence,
            row.timeframe,
            row.risk,
            `"${row.description}"`
          ].join(','))
        ].join('\n');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `forecast-analysis-${timestamp}.csv`;
        break;

      case 'excel':
        // Create Excel-like CSV with BOM for Excel compatibility
        const excelContent = '\ufeff' + [
          ['Metric', 'Current Value', 'Predicted Value', 'Confidence', 'Timeframe', 'Risk', 'Description', 'Anomalies'],
          ...data.map(row => [
            row.metric,
            row.currentValue,
            row.predictedValue,
            row.confidence,
            row.timeframe,
            row.risk,
            `"${row.description}"`,
            row.anomalies ? `"${row.anomalies.map(a => `${a.timestamp}: ${a.value} (${a.severity})`).join('; ')}"` : ''
          ].join('\t'))
        ].join('\n');
        blob = new Blob([excelContent], { type: 'text/tab-separated-values;charset=utf-8;' });
        filename = `forecast-analysis-${timestamp}.xls`;
        break;

      default:
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `forecast-analysis-${timestamp}.json`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Prepare data for Recharts
  const rechartsChartData = useMemo(() => {
    const data: any[] = [];
    const allTimestamps = new Set<string>();

    (Object.keys(aggregatedMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
       // Only include data for visible metrics
      if (visibleMetrics[metricKey]) {
         aggregatedMetrics[metricKey].forEach(point => {
           allTimestamps.add(new Date(point.timestamp).toLocaleString());
         });
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    sortedTimestamps.forEach(timestamp => {
      const dataPoint: any = { timestamp };

      (Object.keys(aggregatedMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
         // Only include data for visible metrics
        if (visibleMetrics[metricKey]) {
          const point = aggregatedMetrics[metricKey].find(d => new Date(d.timestamp).toLocaleString() === timestamp);
          if (point) {
            dataPoint[metricKey.toLowerCase()] = metricKey === 'network' ? point.value / 10 : point.value; // Scale network

            // Include confidence interval data for the last point of actual data
            if (metricKey === 'cpu' || metricKey === 'memory' || metricKey === 'network') { // Apply to relevant metrics
               const forecast = enhancedForecasts.find(f => f.metric.toLowerCase() === metricKey);
               if (forecast && forecast.confidenceInterval !== undefined) {
                  // Find the actual data point corresponding to this timestamp
                  // Use original metrics data here before aggregation/filtering by time range
                   const originalDataPoint = metrics[metricKey].find(d => new Date(d.timestamp).toLocaleString() === timestamp);
                   if (originalDataPoint) {
                       dataPoint[`${metricKey.toLowerCase()}_lower`] = originalDataPoint.value - forecast.confidenceInterval;
                       dataPoint[`${metricKey.toLowerCase()}_upper`] = originalDataPoint.value + forecast.confidenceInterval;
                   }
               }
            }

             // Include anomaly data
             const metricKeyLower = metricKey.toLowerCase() as keyof MetricForecastAnalysisProps['metrics'];
             const forecast = enhancedForecasts.find(f => f.metric.toLowerCase() === metricKeyLower);
             if (forecast && forecast.anomalies) {
                const anomaly = forecast.anomalies.find(a => new Date(a.timestamp).toLocaleString() === timestamp);
                if (anomaly) {
                   dataPoint[`${metricKeyLower}_anomaly`] = anomaly.value;
                   dataPoint[`${metricKeyLower}_anomaly_severity`] = anomaly.severity;
                }
             }

          }
        }
      });

      // Add forecast point and confidence interval at the end of the data
      enhancedForecasts.forEach(forecast => {
         // Only include forecast for visible metrics
         if (visibleMetrics[forecast.metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']]) {
            const lastActualDataPoint = aggregatedMetrics[forecast.metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']].slice(-1)[0];
            if (lastActualDataPoint && new Date(lastActualDataPoint.timestamp).toLocaleString() === timestamp) {
               // This is the timestamp of the last actual data point
               const futureTimestamp = new Date(new Date(lastActualDataPoint.timestamp).getTime() + (24 * 60 * 60 * 1000)).toLocaleString(); // 24 hours ahead

               const forecastDataPoint: any = { timestamp: futureTimestamp };
               forecastDataPoint[forecast.metric.toLowerCase()] = forecast.predictedValue;
               
               if (forecast.confidenceInterval !== undefined) {
                 forecastDataPoint[`${forecast.metric.toLowerCase()}_lower`] = forecast.predictedValue - forecast.confidenceInterval;
                 forecastDataPoint[`${forecast.metric.toLowerCase()}_upper`] = forecast.predictedValue + forecast.confidenceInterval;
               }
                // Only add the forecast point if it's beyond the current timestamps
               if (!sortedTimestamps.includes(futureTimestamp)) {
                  data.push(forecastDataPoint);
               }
            }
         }
      });

      data.push(dataPoint);
    });

     // Ensure data is sorted by timestamp after adding forecast points
     data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return data;
  }, [aggregatedMetrics, enhancedForecasts, visibleMetrics, metrics]); // Add metrics dependency for original data access

  const rechartsScatterData = useMemo(() => {
    const data: any[] = [];

    (Object.keys(aggregatedMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).forEach(metricKey => {
       // Only include data for visible metrics
       if (visibleMetrics[metricKey]) {
         aggregatedMetrics[metricKey].forEach(point => {
           const metricKeyLower = metricKey.toLowerCase() as keyof MetricForecastAnalysisProps['metrics'];
           const forecast = enhancedForecasts.find(f => f.metric.toLowerCase() === metricKeyLower);
           const anomaly = forecast?.anomalies?.find(a => new Date(a.timestamp).getTime() === new Date(point.timestamp).getTime());

           data.push({
             metric: metricKey,
             timestamp: new Date(point.timestamp).getTime(),
             value: metricKey === 'network' ? point.value / 10 : point.value, // Scale network
             isAnomaly: !!anomaly, // Add anomaly flag
             anomalySeverity: anomaly?.severity // Add anomaly severity
           });
         });
       }
    });
    return data;
  }, [aggregatedMetrics, enhancedForecasts, visibleMetrics]); // Add visibleMetrics dependency

  const [brushIndexes, setBrushIndexes] = useState<[number, number] | undefined>(undefined);

  const handleBrushChange = (newIndex: { startIndex?: number; endIndex?: number }) => {
    if (newIndex.startIndex !== undefined && newIndex.endIndex !== undefined) {
      setBrushIndexes([newIndex.startIndex, newIndex.endIndex]);
    } else {
      setBrushIndexes(undefined);
    }
  };

  const resetZoom = () => {
    setBrushIndexes(undefined);
  };

  const displayedLineChartData = useMemo(() => {
    if (brushIndexes) {
      return rechartsChartData.slice(brushIndexes[0], brushIndexes[1] + 1);
    }
    return rechartsChartData;
  }, [rechartsChartData, brushIndexes]);

  return (
    <div className="metric-forecast-analysis">
      <div className="forecast-header">
        <h2>Metric Forecast Analysis</h2>
        <div className="forecast-actions">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="refresh-button"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          <div className="export-options">
            {exportFormats.map(format => (
              <button
                key={format.type}
                onClick={() => exportData(format.type)}
                className="export-button"
                title={`Export as ${format.label}`}
              >
                {format.icon} {format.label}
              </button>
            ))}
          </div>
          <div className="view-controls">
            <button
              onClick={() => setViewMode('line')}
              className={`view-button ${viewMode === 'line' ? 'active' : ''}`}
            >
              📈 Line
            </button>
            <button
              onClick={() => setViewMode('scatter')}
              className={`view-button ${viewMode === 'scatter' ? 'active' : ''}`}
            >
              📊 Scatter
            </button>
            <button
              onClick={() => setShowAnomalies(!showAnomalies)}
              className={`view-button ${showAnomalies ? 'active' : ''}`}
            >
              {showAnomalies ? '👁️ Hide Anomalies' : '👁️ Show Anomalies'}
            </button>
            <button onClick={resetZoom} className="view-button">Reset Zoom</button>
          </div>
          <div className="forecast-summary">
            {enhancedForecasts.filter(f => f.risk === 'high').length} High Risk Forecasts
            {enhancedForecasts.some(f => f.anomalies?.some(a => a.severity === 'high')) && 
              ` • ${enhancedForecasts.reduce((sum, f) => sum + (f.anomalies?.filter(a => a.severity === 'high').length || 0), 0)} High Severity Anomalies`}
          </div>
        </div>
      </div>

      {error && (
        <div className="forecast-error">
          {error}
        </div>
      )}

      <div className="forecast-filters">
        <div className="filter-group">
          <label>Time Range:</label>
          <input
            type="datetime-local"
            value={timeRange.start.toISOString().slice(0, 16)}
            onChange={(e) => setTimeRange((prev: TimeRange) => ({ ...prev, start: new Date(e.target.value) }))}
            className="filter-input"
          />
          <input
            type="datetime-local"
            value={timeRange.end.toISOString().slice(0, 16)}
            onChange={(e) => setTimeRange((prev: TimeRange) => ({ ...prev, end: new Date(e.target.value) }))}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Aggregation:</label>
          <select
            value={aggregationPeriod}
            onChange={(e) => setAggregationPeriod(e.target.value as 'hour' | 'day' | 'week')}
            className="filter-select"
          >
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Show Metrics:</label>
          {(Object.keys(visibleMetrics) as (keyof MetricForecastAnalysisProps['metrics'])[]).map(metricKey => (
            <label key={metricKey} className="metric-checkbox">
              <input
                type="checkbox"
                checked={visibleMetrics[metricKey]}
                onChange={() => toggleMetricVisibility(metricKey)}
              />
              {metricKey.toUpperCase()}
            </label>
          ))}
        </div>
        <div className="filter-group">
          <label>Filter by Risk:</label>
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="filter-select"
          >
            <option value="all">All Risks</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'risk' | 'confidence' | 'metric')}
            className="filter-select"
          >
            <option value="risk">Risk Level</option>
            <option value="confidence">Confidence</option>
            <option value="metric">Metric Name</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Order:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="filter-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="stats-summary">
        {Object.entries(stats).map(([metric, stat]: [string, AggregatedData]) => (
          // Only show stats for visible metrics
          visibleMetrics[metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']] && (
             <div key={metric} className="stat-card">
               <h4>{metric.toUpperCase()}</h4>
               <div className="stat-grid">
                 <div className="stat-item">
                   <span className="stat-label">Min:</span>
                   <span className="stat-value">{stat.min.toFixed(1)}%</span>
                 </div>
                 <div className="stat-item">
                   <span className="stat-label">Max:</span>
                   <span className="stat-value">{stat.max.toFixed(1)}%</span>
                 </div>
                 <div className="stat-item">
                   <span className="stat-label">Avg:</span>
                   <span className="stat-value">{stat.avg.toFixed(1)}%</span>
                 </div>
                 <div className="stat-item">
                   <span className="stat-label">Std Dev:</span>
                   <span className="stat-value">{stat.stdDev.toFixed(1)}%</span>
                 </div>
                 <div className="stat-item">
                   <span className="stat-label">Trend:</span>
                   <span className={`stat-value ${stat.trend > 0 ? 'trend-up' : 'trend-down'}`}>
                     {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend).toFixed(2)}
                   </span>
                 </div>
               </div>
             </div>
           )
        ))}
      </div>

      <div className="forecast-content">
        <div className="forecast-chart">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : viewMode === 'line' ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart 
                 data={displayedLineChartData}
                 syncId="anyId"
                 margin={{
                   top: 10,
                   right: 30,
                   left: 0,
                   bottom: 0,
                 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value: number | string, name: string, props: any) => {
                  const timestamp = props.payload.timestamp;
                  const metricKey = name.replace('_upper', '').replace('_lower', '').toLowerCase() as keyof MetricForecastAnalysisProps['metrics'];
                  const dataPoint = rechartsChartData.find(d => d.timestamp === timestamp);
                  const anomalySeverity = dataPoint && dataPoint[`${metricKey}_anomaly_severity`];

                  const lines = [
                    `${name}: ${typeof value === 'number' ? value.toFixed(1) : value}%`,
                    `Time: ${timestamp}`
                  ];

                  if (anomalySeverity && showAnomalies) {
                    lines.push(`Anomaly Detected (${anomalySeverity.toUpperCase()} severity)`);
                  }

                  return lines;
                }} />
                <Legend />
                {/* Render confidence intervals as areas for visible metrics*/}
                {visibleMetrics.cpu && <Area type="monotone" dataKey="cpu_upper" stroke="none" fill="#28a745" fillOpacity={0.2} isAnimationActive={false} />}
                {visibleMetrics.cpu && <Area type="monotone" dataKey="cpu_lower" stroke="none" fill="#28a745" fillOpacity={0.2} isAnimationActive={false} />}
                {visibleMetrics.memory && <Area type="monotone" dataKey="memory_upper" stroke="none" fill="#17a2b8" fillOpacity={0.2} isAnimationActive={false} />}
                {visibleMetrics.memory && <Area type="monotone" dataKey="memory_lower" stroke="none" fill="#17a2b8" fillOpacity={0.2} isAnimationActive={false} />}
                {visibleMetrics.network && <Area type="monotone" dataKey="network_upper" stroke="none" fill="#ffc107" fillOpacity={0.2} isAnimationActive={false} />}
                {visibleMetrics.network && <Area type="monotone" dataKey="network_lower" stroke="none" fill="#ffc107" fillOpacity={0.2} isAnimationActive={false} />}

                {/* Render actual data and predicted lines for visible metrics*/}
                {visibleMetrics.cpu && <Line type="monotone" dataKey="cpu" stroke="#28a745" activeDot={{ r: 8 }} />}
                {visibleMetrics.memory && <Line type="monotone" dataKey="memory" stroke="#17a2b8" />}
                {visibleMetrics.network && <Line type="monotone" dataKey="network" stroke="#ffc107" />}

                {/* Render anomalies as separate dots for visible metrics */}              
                {showAnomalies && enhancedForecasts.map(forecast => (
                  // Only show anomalies for visible metrics
                  visibleMetrics[forecast.metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']] && 
                  forecast.anomalies?.map((anomaly, index) => {
                     const dataPoint = rechartsChartData.find(d => new Date(d.timestamp).toLocaleString() === new Date(anomaly.timestamp).toLocaleString());
                     if (dataPoint) {
                        return (
                           <Scatter 
                              key={`${forecast.metric}-anomaly-${index}`}
                              data={[{ ...dataPoint, anomalyValue: anomaly.value, anomalySeverity: anomaly.severity }]}
                              fill={anomaly.severity === 'high' ? 'red' : anomaly.severity === 'medium' ? 'orange' : 'yellow'}
                              shape="star"
                              radius={8} 
                              isAnimationActive={false}
                           />
                        );
                     }
                     return null;
                  })
                ))}
                
                <Brush dataKey="timestamp" height={30} stroke="#8884d8" onChange={handleBrushChange} />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
               <ScatterChart
                 syncId="anyId"
                 margin={{
                   top: 10,
                   right: 30,
                   left: 0,
                   bottom: 0,
                 }}
               >
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis type="number" dataKey="timestamp" domain={['auto', 'auto']} tickFormatter={(timestamp) => new Date(timestamp).toLocaleString()} />
                 <YAxis type="number" dataKey="value" name="Usage (%)" />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => [
                   `${props?.payload.metric.toUpperCase()} Usage: ${typeof value === 'number' ? value.toFixed(1) : value}%`, 
                   `Time: ${new Date(props?.payload.timestamp).toLocaleString()}`,
                   props?.payload.isAnomaly ? `Anomaly Detected (${props.payload.anomalySeverity.toUpperCase()} severity)` : null
                 ].filter(Boolean)} />
                 <Legend />
                 {/* Render each metric as a separate scatter series for visible metrics*/}
                 {visibleMetrics.cpu && <Scatter name="CPU Usage" data={rechartsScatterData.filter(d => d.metric === 'cpu' && !d.isAnomaly)} fill="#28a745" />}
                 {visibleMetrics.memory && <Scatter name="Memory Usage" data={rechartsScatterData.filter(d => d.metric === 'memory' && !d.isAnomaly)} fill="#17a2b8" />}
                 {visibleMetrics.network && <Scatter name="Network Usage" data={rechartsScatterData.filter(d => d.metric === 'network' && !d.isAnomaly)} fill="#ffc107" />}

                 {/* Render anomalies on scatter plot for visible metrics */}
                 {showAnomalies && visibleMetrics.cpu && ( 
                   <Scatter
                      name="CPU Anomalies (High)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'cpu' && d.anomalySeverity === 'high')}
                      fill="red"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                  {showAnomalies && visibleMetrics.cpu && (
                   <Scatter
                      name="CPU Anomalies (Medium)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'cpu' && d.anomalySeverity === 'medium')}
                      fill="orange"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                 {showAnomalies && visibleMetrics.cpu && (
                   <Scatter
                      name="CPU Anomalies (Low)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'cpu' && d.anomalySeverity === 'low')}
                      fill="yellow"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}

                  {showAnomalies && visibleMetrics.memory && (
                   <Scatter
                      name="Memory Anomalies (High)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'memory' && d.anomalySeverity === 'high')}
                      fill="red"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                  {showAnomalies && visibleMetrics.memory && (
                   <Scatter
                      name="Memory Anomalies (Medium)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'memory' && d.anomalySeverity === 'medium')}
                      fill="orange"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                 {showAnomalies && visibleMetrics.memory && (
                   <Scatter
                      name="Memory Anomalies (Low)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'memory' && d.anomalySeverity === 'low')}
                      fill="yellow"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}

                  {showAnomalies && visibleMetrics.network && (
                   <Scatter
                      name="Network Anomalies (High)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'network' && d.anomalySeverity === 'high')}
                      fill="red"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                  {showAnomalies && visibleMetrics.network && (
                   <Scatter
                      name="Network Anomalies (Medium)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'network' && d.anomalySeverity === 'medium')}
                      fill="orange"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}
                 {showAnomalies && visibleMetrics.network && (
                   <Scatter
                      name="Network Anomalies (Low)"
                      data={rechartsScatterData.filter(d => d.isAnomaly && d.metric === 'network' && d.anomalySeverity === 'low')}
                      fill="yellow"
                      shape="star"
                      radius={8} 
                      isAnimationActive={false}
                   />
                 )}


                 <Brush dataKey="timestamp" height={30} stroke="#8884d8" onChange={handleBrushChange} />

               </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="forecast-list">
          <h3>Metric Forecasts</h3>
          <div className="forecast-cards">
            {filteredAndSortedForecasts.map((forecast, index) => (
              // Only show forecast cards for visible metrics
              visibleMetrics[forecast.metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']] && (
                <div key={index} className="forecast-card">
                  <div className="forecast-header">
                    <div 
                      className="forecast-risk"
                      style={{ backgroundColor: getRiskColor(forecast) }}
                    >
                      {forecast.risk.toUpperCase()}
                    </div>
                    <div className="forecast-confidence">
                      {forecast.confidence.toUpperCase()}
                    </div>
                  </div>

                  <div className="forecast-details">
                    <div className="forecast-metric">
                      {forecast.metric.toUpperCase()}
                    </div>
                    <div className="forecast-values">
                      <div className="current-value">
                        Current: {forecast.currentValue.toFixed(1)}%
                      </div>
                      <div className="predicted-value">
                        Predicted: {forecast.predictedValue.toFixed(1)}%
                      </div>
                      <div className="threshold-value">
                        Threshold: {forecast.threshold}%
                      </div>
                    </div>
                    <div className="forecast-timeframe">
                      {forecast.timeframe.toUpperCase()} TERM
                    </div>
                    <div className="forecast-description">
                      {forecast.description}
                    </div>
                    {showAnomalies && forecast.anomalies && forecast.anomalies.length > 0 && ( // Conditionally render anomalies
                      <div className="forecast-anomalies">
                        <h4>Detected Anomalies</h4>
                        <ul>
                          {forecast.anomalies.map((anomaly, i) => (
                            <li key={i} className={`anomaly-${anomaly.severity}`}>
                              {new Date(anomaly.timestamp).toLocaleString()}: {anomaly.value.toFixed(1)}%
                              <span className="anomaly-severity">({anomaly.severity.toUpperCase()})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* New section for listing all anomalies */}
      {showAnomalies && ( // Only show the list if anomalies are shown on the chart
        <div className="anomaly-list-section">
          <h3>All Detected Anomalies</h3>
          {enhancedForecasts.map(forecast => (
            forecast.anomalies && forecast.anomalies.length > 0 && visibleMetrics[forecast.metric.toLowerCase() as keyof MetricForecastAnalysisProps['metrics']] && (
              <div key={forecast.metric} className="anomaly-metric-group">
                <h4>{forecast.metric.toUpperCase()} Anomalies</h4>
                <ul>
                  {forecast.anomalies.map((anomaly, i) => (
                    <li key={i} className={`anomaly-item anomaly-${anomaly.severity}`}>
                      <span className="anomaly-timestamp">{new Date(anomaly.timestamp).toLocaleString()}</span>:
                      <span className="anomaly-value"> {anomaly.value.toFixed(1)}%</span>
                      <span className={`anomaly-severity ${anomaly.severity}`}>({anomaly.severity.toUpperCase()})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      )}

    </div>
  );
};

export default MetricForecastAnalysis; 