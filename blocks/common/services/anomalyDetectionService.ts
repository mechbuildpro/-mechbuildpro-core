interface MetricData {
  timestamp: string;
  value: number;
  metric: 'cpu' | 'memory' | 'network' | 'error_rate';
}

interface AnomalyDetection {
  timestamp: string;
  metric: 'cpu' | 'memory' | 'network' | 'error_rate';
  value: number;
  expectedRange: [number, number];
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  factors: string[];
}

class AnomalyDetectionService {
  private readonly windowSize = 10;
  private readonly zScoreThreshold = 2.5;
  private readonly seasonalityPeriods = [24, 168]; // 24 hours, 1 week

  public detectAnomalies(data: MetricData[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const metrics = ['cpu', 'memory', 'network', 'error_rate'] as const;

    metrics.forEach(metric => {
      const metricData = data.filter(d => d.metric === metric);
      if (metricData.length < this.windowSize) return;

      // Calculate moving statistics
      const stats = this.calculateMovingStats(metricData);
      
      // Detect seasonality
      const seasonality = this.detectSeasonality(metricData);
      
      // Detect anomalies
      metricData.forEach((point, index) => {
        if (index < this.windowSize) return;

        const { mean, stdDev } = stats[index - this.windowSize];
        const zScore = Math.abs(point.value - mean) / stdDev;

        if (zScore > this.zScoreThreshold) {
          const factors = this.analyzeAnomalyFactors(point, stats[index - this.windowSize], seasonality);
          const severity = this.calculateSeverity(zScore, factors);
          const confidence = this.calculateConfidence(zScore, seasonality);

          anomalies.push({
            timestamp: point.timestamp,
            metric: point.metric,
            value: point.value,
            expectedRange: [mean - this.zScoreThreshold * stdDev, mean + this.zScoreThreshold * stdDev],
            severity,
            confidence,
            factors
          });
        }
      });
    });

    return anomalies;
  }

  private calculateMovingStats(data: MetricData[]): Array<{ mean: number; stdDev: number }> {
    const stats: Array<{ mean: number; stdDev: number }> = [];

    for (let i = this.windowSize; i <= data.length; i++) {
      const window = data.slice(i - this.windowSize, i).map(d => d.value);
      const mean = window.reduce((a, b) => a + b, 0) / this.windowSize;
      const stdDev = Math.sqrt(
        window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.windowSize
      );
      stats.push({ mean, stdDev });
    }

    return stats;
  }

  private detectSeasonality(data: MetricData[]): {
    detected: boolean;
    period?: number;
    strength: number;
  } {
    const values = data.map(d => d.value);
    const autocorr = this.calculateAutocorrelation(values);
    const peaks = this.findPeaks(autocorr);

    for (const period of this.seasonalityPeriods) {
      const seasonalityStrength = this.calculateSeasonalityStrength(values, period);
      if (seasonalityStrength > 0.5) {
        return {
          detected: true,
          period,
          strength: seasonalityStrength
        };
      }
    }

    return {
      detected: false,
      strength: 0
    };
  }

  private calculateAutocorrelation(values: number[]): number[] {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    
    const result: number[] = [];
    for (let lag = 0; lag < n; lag++) {
      let numerator = 0;
      for (let i = 0; i < n - lag; i++) {
        numerator += (values[i] - mean) * (values[i + lag] - mean);
      }
      result.push(numerator / ((n - lag) * variance));
    }
    return result;
  }

  private findPeaks(values: number[]): number[] {
    const peaks: number[] = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  private calculateSeasonalityStrength(values: number[], period: number): number {
    const n = values.length;
    if (n < period * 2) return 0;

    let numerator = 0;
    let denominator = 0;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    for (let i = 0; i < n - period; i++) {
      numerator += (values[i] - mean) * (values[i + period] - mean);
      denominator += Math.pow(values[i] - mean, 2);
    }

    return Math.abs(numerator / denominator);
  }

  private analyzeAnomalyFactors(
    point: MetricData,
    stats: { mean: number; stdDev: number },
    seasonality: { detected: boolean; period?: number; strength: number }
  ): string[] {
    const factors: string[] = [];
    const zScore = Math.abs(point.value - stats.mean) / stats.stdDev;

    if (zScore > 3) {
      factors.push('Aşırı sapma');
    }
    if (point.value > stats.mean + this.zScoreThreshold * stats.stdDev) {
      factors.push('Yüksek değer sapması');
    }
    if (seasonality.detected && seasonality.period) {
      factors.push(`${seasonality.period} saatlik mevsimsellik etkisi`);
    }
    if (point.value < stats.mean - this.zScoreThreshold * stats.stdDev) {
      factors.push('Düşük değer sapması');
    }

    return factors;
  }

  private calculateSeverity(zScore: number, factors: string[]): 'high' | 'medium' | 'low' {
    if (zScore > 3 || factors.includes('Aşırı sapma')) {
      return 'high';
    }
    if (zScore > 2.5 || factors.length > 1) {
      return 'medium';
    }
    return 'low';
  }

  private calculateConfidence(
    zScore: number,
    seasonality: { detected: boolean; strength: number }
  ): number {
    let confidence = Math.min(100, Math.round((zScore / 4) * 100));
    
    if (seasonality.detected) {
      confidence = Math.min(100, confidence + seasonality.strength * 20);
    }

    return confidence;
  }
}

export const anomalyDetectionService = new AnomalyDetectionService(); 