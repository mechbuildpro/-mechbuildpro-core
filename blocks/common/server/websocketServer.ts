import WebSocket from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';

interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
}

interface ErrorEvent {
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  responseTime: number;
  status: 'success' | 'active' | 'resolved' | 'ignored';
  userId: string;
}

class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket> = new Set();
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    super();
    this.wss = new WebSocket.Server({ server, path: '/analytics' });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log('Client connected');

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    this.startMetricsBroadcast();
  }

  private startMetricsBroadcast() {
    this.metricsInterval = setInterval(() => {
      const metrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        cpuUsage: this.generateRandomMetric(20, 90),
        memoryUsage: this.generateRandomMetric(30, 85),
        networkLatency: this.generateRandomMetric(50, 2000)
      };

      this.broadcast('metrics', metrics);

      // Simulate random errors
      if (Math.random() < 0.1) {
        const error: ErrorEvent = {
          timestamp: new Date().toISOString(),
          severity: this.getRandomSeverity(),
          component: this.getRandomComponent(),
          message: this.getRandomErrorMessage(),
          responseTime: this.generateRandomMetric(100, 5000),
          status: this.getRandomStatus(),
          userId: `user_${Math.floor(Math.random() * 1000)}`
        };

        this.broadcast('error', error);
      }
    }, 5000);
  }

  private broadcast(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private generateRandomMetric(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomSeverity(): 'error' | 'warning' | 'info' {
    const severities: ('error' | 'warning' | 'info')[] = ['error', 'warning', 'info'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  private getRandomComponent(): string {
    const components = [
      'API Gateway',
      'Authentication Service',
      'Database Service',
      'File Storage',
      'Cache Service',
      'Message Queue',
      'Load Balancer'
    ];
    return components[Math.floor(Math.random() * components.length)];
  }

  private getRandomErrorMessage(): string {
    const errors = [
      'Connection timeout',
      'Database query failed',
      'Invalid authentication token',
      'Resource not found',
      'Rate limit exceeded',
      'Internal server error',
      'Service unavailable',
      'Validation failed',
      'Permission denied',
      'Configuration error'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  private getRandomStatus(): 'success' | 'active' | 'resolved' | 'ignored' {
    const statuses: ('success' | 'active' | 'resolved' | 'ignored')[] = [
      'success',
      'active',
      'resolved',
      'ignored'
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  public stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.wss.close();
  }
}

export default WebSocketServer; 