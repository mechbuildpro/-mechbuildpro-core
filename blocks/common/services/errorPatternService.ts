interface ErrorPattern {
  pattern: string;
  frequency: number;
  severity: 'high' | 'medium' | 'low';
  components: string[];
  impact: {
    users: number;
    system: number;
    business: number;
  };
  recommendations: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
  cluster?: number;
  similarity?: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  component?: string;
  message: string;
  responseTime?: number;
  status: 'success' | 'active' | 'resolved' | 'ignored';
  userId?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
}

class ErrorPatternService {
  private patterns: Map<string, ErrorPattern> = new Map();
  private clusters: Map<number, ErrorPattern[]> = new Map();
  private similarityThreshold = 0.7;

  public analyzePatterns(logs: ErrorLog[]): ErrorPattern[] {
    // Reset patterns and clusters
    this.patterns.clear();
    this.clusters.clear();

    // Group logs by message pattern
    logs.forEach(log => {
      const key = this.normalizeMessage(log.message);
      if (!this.patterns.has(key)) {
        this.patterns.set(key, {
          pattern: key,
          frequency: 0,
          severity: 'low',
          components: [],
          impact: {
            users: 0,
            system: 0,
            business: 0
          },
          recommendations: [],
          trend: 'stable'
        });
      }

      const pattern = this.patterns.get(key)!;
      pattern.frequency++;
      
      // Update severity
      if (log.severity === 'error') pattern.severity = 'high';
      else if (log.severity === 'warning' && pattern.severity !== 'high') pattern.severity = 'medium';

      // Update components
      if (log.component && !pattern.components.includes(log.component)) {
        pattern.components.push(log.component);
      }

      // Update impact
      pattern.impact.users += log.userId ? 1 : 0;
      pattern.impact.system += log.cpuUsage || 0;
      pattern.impact.business += log.severity === 'error' ? 100 : 0;
    });

    // Calculate trends
    this.calculateTrends(logs);

    // Generate recommendations
    this.generateRecommendations();

    // Perform clustering
    this.performClustering();

    return Array.from(this.patterns.values());
  }

  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[0-9]+/g, '#')
      .replace(/[^a-z0-9#\s]/g, '')
      .trim();
  }

  private calculateTrends(logs: ErrorLog[]) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;

    this.patterns.forEach(pattern => {
      const recentLogs = logs.filter(log => 
        this.normalizeMessage(log.message) === pattern.pattern &&
        new Date(log.timestamp).getTime() > oneDayAgo
      );

      const oldLogs = logs.filter(log => 
        this.normalizeMessage(log.message) === pattern.pattern &&
        new Date(log.timestamp).getTime() > twoDaysAgo &&
        new Date(log.timestamp).getTime() <= oneDayAgo
      );

      pattern.trend = recentLogs.length > oldLogs.length ? 'increasing' :
                     recentLogs.length < oldLogs.length ? 'decreasing' : 'stable';
    });
  }

  private generateRecommendations() {
    this.patterns.forEach(pattern => {
      const recommendations: string[] = [];

      if (pattern.trend === 'increasing') {
        if (pattern.severity === 'high') {
          recommendations.push('Acil müdahale gerekiyor. Sistem performansı kritik seviyede etkileniyor.');
          recommendations.push('İlgili bileşenlerin kaynak kullanımını optimize edin.');
        }
        if (pattern.impact.users > 10) {
          recommendations.push('Kullanıcı deneyimini iyileştirmek için hata yönetimini güçlendirin.');
        }
        if (pattern.impact.system > 50) {
          recommendations.push('Sistem kaynaklarının kullanımını dengeleyin ve ölçeklendirme ayarlarını gözden geçirin.');
        }
      }

      if (pattern.components.length > 1) {
        recommendations.push('Bileşenler arası bağımlılıkları azaltın ve hata izolasyonunu artırın.');
      }

      pattern.recommendations = recommendations;
    });
  }

  private performClustering() {
    const patterns = Array.from(this.patterns.values());
    let clusterId = 0;

    patterns.forEach(pattern => {
      if (pattern.cluster !== undefined) return;

      const cluster: ErrorPattern[] = [pattern];
      pattern.cluster = clusterId;

      patterns.forEach(otherPattern => {
        if (otherPattern.cluster !== undefined) return;

        const similarity = this.calculateSimilarity(pattern, otherPattern);
        if (similarity >= this.similarityThreshold) {
          otherPattern.cluster = clusterId;
          otherPattern.similarity = similarity;
          cluster.push(otherPattern);
        }
      });

      if (cluster.length > 1) {
        this.clusters.set(clusterId, cluster);
        clusterId++;
      }
    });
  }

  private calculateSimilarity(pattern1: ErrorPattern, pattern2: ErrorPattern): number {
    // Calculate Jaccard similarity for components
    const components1 = new Set(pattern1.components);
    const components2 = new Set(pattern2.components);
    const intersection = new Set(Array.from(components1).filter(x => components2.has(x)));
    const union = new Set([...Array.from(components1), ...Array.from(components2)]);
    const componentSimilarity = intersection.size / union.size;

    // Calculate severity similarity
    const severityMap = { high: 3, medium: 2, low: 1 };
    const severitySimilarity = 1 - Math.abs(
      severityMap[pattern1.severity] - severityMap[pattern2.severity]
    ) / 2;

    // Calculate impact similarity
    const impactSimilarity = 1 - (
      Math.abs(pattern1.impact.users - pattern2.impact.users) +
      Math.abs(pattern1.impact.system - pattern2.impact.system) +
      Math.abs(pattern1.impact.business - pattern2.impact.business)
    ) / 300; // Normalize by max possible difference

    // Weighted average of similarities
    return (
      componentSimilarity * 0.4 +
      severitySimilarity * 0.3 +
      impactSimilarity * 0.3
    );
  }

  public getClusters(): Map<number, ErrorPattern[]> {
    return this.clusters;
  }

  public getPatternsByCluster(clusterId: number): ErrorPattern[] {
    return this.clusters.get(clusterId) || [];
  }
}

export const errorPatternService = new ErrorPatternService(); 